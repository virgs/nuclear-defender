import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {Movement, MovementCoordinatorOutput} from '../controllers/movement-coordinator';
import {Directions, getOpositeDirectionOf, rotateDirectionClockwise} from '@/game/constants/directions';
import {DeadlockDetector} from '@/game/solver/deadlock-detector';

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
        map: StaticMap,
        distanceCalculator: DistanceCalculator
    }) {
        this.staticMap = data.map;
        this.distanceCalculator = data.distanceCalculator;
        this.targets = [];
        for (let y = 0; y < data.map.height; ++y) {
            for (let x = 0; x < data.map.width; ++x) {
                if (data.map.tiles[y][x].code === Tiles.target) {
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
        if (movement.hero.currentPosition.isDifferentOf(movement.hero.previousPosition)) {
            events.push(MovementEvents.HERO_MOVED);
        }
        const boxesMoved = movement.boxes
            .filter(box => box.previousPosition.isDifferentOf(box.currentPosition));

        boxesMoved
            .forEach(_ => events.push(MovementEvents.BOX_MOVED));

        boxesMoved
            .filter(box => box.isCurrentlyOnTarget)
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_ONTO_TARGET));
        boxesMoved
            .filter(box => !box.isCurrentlyOnTarget && movement.hero.isCurrentlyOnTarget)
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_OUT_OF_TARGET));

        boxesMoved
            .filter(box => movement.hero.currentPosition.isEqualTo(box.previousPosition) &&
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


}