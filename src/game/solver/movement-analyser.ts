import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import {DeadlockDetector} from '@/game/solver/deadlock-detector';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {Movement, MovementCoordinatorOutput} from '../controllers/movement-orchestrator';

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

export class MovementAnalyser {
    private readonly targets: Point[];
    private readonly distanceCalculator: DistanceCalculator;
    private readonly staticMap: StaticMap;
    private readonly deadlockDetector: DeadlockDetector;

    public constructor(data: {
        staticMap: StaticMap,
        distanceCalculator: DistanceCalculator
    }) {
        this.staticMap = data.staticMap;
        this.distanceCalculator = data.distanceCalculator;
        this.targets = [];
        for (let y = 0; y < data.staticMap.height; ++y) {
            for (let x = 0; x < data.staticMap.width; ++x) {
                if (data.staticMap.tiles[y][x].code === Tiles.target) {
                    this.targets.push(new Point(x, y));
                }
            }
        }
        this.deadlockDetector = new DeadlockDetector({staticMap: this.staticMap});
    }

    public analyse(movement: MovementCoordinatorOutput): MovementAnalysis {
        const events = this.checkEvents(movement);
        let isDeadLocked = events.boxesMoved
            .some(movedBox => this.deadlockDetector.deadLocked(movedBox, movement.boxes));
        return {
            shortestDistanceFromEveryBoxToTheClosestTarget: this.sumOfEveryBoxToTheClosestTarget(movement),
            ...events,
            isDeadLocked
        };
    }

    private checkEvents(movement: MovementCoordinatorOutput) {
        const events: MovementEvents[] = [];
        if (movement.hero.nextPosition.isDifferentOf(movement.hero.currentPosition)) {
            events.push(MovementEvents.HERO_MOVED);
        }
        const boxesMoved = movement.boxes
            .filter(box => box.currentPosition.isDifferentOf(box.nextPosition));

        boxesMoved
            .forEach(_ => events.push(MovementEvents.BOX_MOVED));

        boxesMoved
            .filter(box => this.isTileAtPosition(box.nextPosition, Tiles.target))
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_ONTO_TARGET));
        boxesMoved
            .filter(box => !this.isTileAtPosition(box.nextPosition, Tiles.target) &&
                this.isTileAtPosition(movement.hero.nextPosition, Tiles.target))
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_OUT_OF_TARGET));

        boxesMoved
            .filter(box => movement.hero.nextPosition.isEqualTo(box.currentPosition) &&
                movement.hero.direction === box.direction)
            .find(box => {
                if (!this.isTileAtPosition(box.nextPosition, Tiles.target) &&
                    this.isTileAtPosition(movement.hero.nextPosition, Tiles.target)) {
                    events.push(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET);
                } else if (this.isTileAtPosition(box.nextPosition, Tiles.target)) {
                    events.push(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET);
                }
            });
        return {events, boxesMoved};
    }

    private sumOfEveryBoxToTheClosestTarget(movement: MovementCoordinatorOutput): number {
        return movement.boxes
            .reduce((acc, box) => {
                const shortestDistanceToAnyTarget: number = this.targets
                    .reduce((acc, target) => Math.min(this.distanceCalculator.distance(target, box.nextPosition), acc), Infinity);
                return acc + shortestDistanceToAnyTarget;
            }, 0);
    }

    public isTileAtPosition(position: Point, tile: Tiles): boolean {
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.staticMap.tiles[position.y][position.x].code === tile;
        }
        return false;
    }
}