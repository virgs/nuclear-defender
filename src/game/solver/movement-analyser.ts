import {Point} from '@/game/math/point';
import {TileCodes} from '@/game/tiles/tile-codes';
import type {Movement, MovementCoordinatorOutput} from './movement-coordinator';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import {Directions} from '@/game/constants/directions';

export type MovementAnalysis = {
    events: MovementEvents[],
    boxesMoved: Movement[],
    boxesMovedOntoTarget: Movement[],
    boxesMovedOutOfTarget: Movement[],
    shortestDistanceFromEveryBoxToTheClosestTarget: number,
    isDeadLocked: boolean
}

export enum MovementEvents {
    HERO_MOVED,
    BOX_MOVED,
    HERO_MOVED_BOX_ONTO_TARGET,
    HERO_MOVED_BOX_OUT_OF_TARGET
}

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
            .some(movedBox => this.isDeadLocked(movedBox));
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

        const boxesMovedOntoTarget = boxesMoved
            .filter(box => movement.hero.currentPosition.equal(box.previousPosition) &&
                box.isCurrentlyOnTarget &&
                movement.hero.direction === box.direction);
        if (boxesMovedOntoTarget.length > 0) {
            events.push(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET);
        }
        const boxesMovedOutOfTarget = boxesMoved
            .filter(box => movement.hero.currentPosition.equal(box.previousPosition) &&
                !box.isCurrentlyOnTarget && movement.hero.isCurrentlyOnTarget &&
                movement.hero.direction === box.direction);
        if (boxesMovedOutOfTarget) {
            events.push(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET);
        }
        return {events, boxesMoved, boxesMovedOntoTarget, boxesMovedOutOfTarget};
    }

    private sumOfEveryBoxToTheClosestTarget(movement: MovementCoordinatorOutput): number {
        return movement.boxes
            .reduce((acc, box) => {
                const shortestDistanceToAnyTarget: number = this.targets
                    .reduce((acc, target) => Math.min(this.distanceCalculator.distance(target, box.currentPosition), acc), Infinity);
                return acc + shortestDistanceToAnyTarget;
            }, 0);
    }

    private isDeadLocked(movedBox: Movement): boolean {
        if (movedBox.isCurrentlyOnTarget) {
            return false;
        }
        const direction = movedBox.direction!;
        const nextTilePosition = movedBox.currentPosition.calculateOffset(direction);
        if (this.staticMap.tiles[nextTilePosition.y][nextTilePosition.x] === TileCodes.wall) {

            if (direction === Directions.DOWN || direction === Directions.UP) {
                return this.verticalDeadLock(nextTilePosition);
            } else {
                return this.horizontalDeadLock(nextTilePosition);
            }
        }
        return false;
    }

    private verticalDeadLock(nextTilePosition: Point): boolean {
        for (let x = 0; x < this.staticMap.width; ++x) {
            const tile = this.staticMap.tiles[nextTilePosition.y][x];
            if (tile !== TileCodes.wall && tile !== TileCodes.empty) {
                return false;
            }
        }
        return true;
    }

    private horizontalDeadLock(nextTilePosition: Point): boolean {
        for (let y = 0; y < this.staticMap.height; ++y) {
            const tile = this.staticMap.tiles[y][nextTilePosition.x];
            if (tile !== TileCodes.wall && tile !== TileCodes.empty) {
                return false;
            }
        }
        return true;
    }
}