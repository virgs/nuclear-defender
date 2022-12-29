import {Point} from '@/game/math/point';
import {TileCodes} from '@/game/tiles/tile-codes';
import type {Movement, MovementCoordinatorOutput} from './movement-coordinator';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import {Directions} from '@/game/constants/directions';

export type MovementAnalysis = {
    events: MovementEvents[],
    boxesMoved: Movement[],
    shortestDistanceFromEveryBoxToTheClosestTarget: number,
    isDeadLocked: boolean
}

export enum MovementEvents {
    HERO_MOVED,
    BOX_MOVED,
    HERO_MOVED_BOX_ONTO_TARGET,
    HERO_MOVED_BOX_OUT_OF_TARGET,
    BOX_MOVED_ONTO_TARGET,
    BOX_MOVED_OUT_OF_TARGET
}

type SegmentAnalysis = { differentBoxes: number; empties: number; targets: number };

export class MovementAnalyser {
    private readonly targets: Point[];
    private readonly distanceCalculator: DistanceCalculator;
    private readonly staticMap: { width: number; height: number; tiles: TileCodes[][] };

    public constructor(data: {
        staticMap: { width: number; height: number; tiles: TileCodes[][] },
        distanceCalculator: DistanceCalculator
    }) {
        this.staticMap = data.staticMap;
        this.distanceCalculator = data.distanceCalculator;
        this.targets = [];
        for (let y = 0; y < data.staticMap.height; ++y) {
            for (let x = 0; x < data.staticMap.width; ++x) {
                if (data.staticMap.tiles[y][x] === TileCodes.target) {
                    this.targets.push(new Point(x, y));
                }
            }
        }
    }

    public analyse(movement: MovementCoordinatorOutput): MovementAnalysis {
        const events = this.checkEvents(movement);
        let isDeadLocked = events.boxesMoved
            .some(movedBox => this.isDeadLocked(movedBox, movement.boxes));
        return {
            shortestDistanceFromEveryBoxToTheClosestTarget: this.sumOfEveryBoxToTheClosestTarget(movement),
            ...events,
            isDeadLocked
        };
    }

    private checkEvents(movement: MovementCoordinatorOutput) {
        const events: MovementEvents[] = [];
        if (!movement.hero.currentPosition.equal(movement.hero.previousPosition)) {
            events.push(MovementEvents.HERO_MOVED);
        }
        const boxesMoved = movement.boxes
            .filter(box => !box.previousPosition.equal(box.currentPosition));

        boxesMoved
            .forEach(_ => events.push(MovementEvents.BOX_MOVED));

        boxesMoved
            .filter(box => box.isCurrentlyOnTarget)
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_ONTO_TARGET));
        boxesMoved
            .filter(box => !box.isCurrentlyOnTarget && movement.hero.isCurrentlyOnTarget)
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_OUT_OF_TARGET));

        boxesMoved
            .filter(box => movement.hero.currentPosition.equal(box.previousPosition) &&
                movement.hero.direction === box.direction)
            .find(box => {
                if (!box.isCurrentlyOnTarget && movement.hero.isCurrentlyOnTarget) {
                    events.push(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET);
                } else if (box.isCurrentlyOnTarget) {
                    events.push(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET);
                }
            });
        return {events, boxesMoved};
    }

    private sumOfEveryBoxToTheClosestTarget(movement: MovementCoordinatorOutput): number {
        return movement.boxes
            .reduce((acc, box) => {
                const shortestDistanceToAnyTarget: number = this.targets
                    .reduce((acc, target) => Math.min(this.distanceCalculator.distance(target, box.currentPosition), acc), Infinity);
                return acc + shortestDistanceToAnyTarget;
            }, 0);
    }

    private isDeadLocked(movedBox: Movement, boxes: Movement[]): boolean {
        const direction = movedBox.direction!;
        const nextTilePosition = movedBox.currentPosition.calculateOffset(direction);
        if (this.staticMap.tiles[nextTilePosition.y][nextTilePosition.x] === TileCodes.wall) {
            let segment: SegmentAnalysis;
            if (direction === Directions.DOWN || direction === Directions.UP) {
                segment = this.verifyLineSegment(movedBox.currentPosition, nextTilePosition, boxes);
            } else {
                segment = this.horizontalLineSegment(movedBox.currentPosition, nextTilePosition, boxes);
            }
            // console.log(segment);
            if (segment.empties > 2) {
                // console.log('there is a way to pull it back');
                return false;
            } else if (segment.differentBoxes <= segment.targets) {
                // console.log('there are available targets in the segment');
                return false;
            }
            // console.log('deadlocked');
            return true;
        }
        return false;
    }

    private verifyLineSegment(tilePosition: Point, nextTilePosition: Point, boxes: Movement[]): SegmentAnalysis {
        let empties = 0;
        let targets = 0;
        for (let x = 0; x < this.staticMap.width; ++x) {
            const currentLineTile = this.staticMap.tiles[tilePosition.y][x];
            if (currentLineTile === TileCodes.target) {
                ++targets;
            }
            const nextLineTile = this.staticMap.tiles[nextTilePosition.y][x];
            if (nextLineTile !== TileCodes.wall && nextLineTile !== TileCodes.empty) {
                ++empties;
            }
        }
        const differentBoxes = boxes
            .filter(box => box.currentPosition.y === tilePosition.y)
            .reduce((acc, item) => acc + 1, 0);
        return {empties, targets, differentBoxes};
    }

    private horizontalLineSegment(tilePosition: Point, nextTilePosition: Point, boxes: Movement[]): SegmentAnalysis {
        let empties = 0;
        let targets = 0;
        for (let y = 0; y < this.staticMap.height; ++y) {
            const currentColumnTile = this.staticMap.tiles[y][tilePosition.x];
            if (currentColumnTile === TileCodes.target) {
                ++targets;
            }

            const nextColumnTile = this.staticMap.tiles[y][nextTilePosition.x];
            if (nextColumnTile !== TileCodes.wall && nextColumnTile !== TileCodes.empty) {
                ++empties;
            }
        }

        const differentBoxes = boxes
            .filter(box => box.currentPosition.x === tilePosition.x)
            .reduce((acc, item) => acc + 1, 0);
        return {empties, targets, differentBoxes};
    }
}