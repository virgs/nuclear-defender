import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {DeadLockDetector} from '@/game/solver/dead-lock-detector';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import {BoxClusterDeadlockDetector} from '@/game/solver/box-cluster-deadlock-detector';
import {BoxGluedToWallDetector} from '@/game/solver/box-glued-to-wall-deadlock-detector';
import type {Movement, MovementOrchestratorOutput} from '../engine/movement-orchestrator';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type PushedBox = { id: number, direction: Directions };
export type MovementAnalysis = {
    boxesMoved: Movement[],
    pushedBox?: PushedBox
    sumOfEveryBoxToTheClosestTarget: number,
    isDeadLocked: boolean
}

export class MovementAnalyser {
    private readonly targets: Point[];
    private readonly distanceCalculator: DistanceCalculator;
    private readonly strippedMap: MultiLayeredMap;
    private readonly deadlockDetectors: DeadLockDetector[];

    public constructor(data: { distanceCalculator: DistanceCalculator; staticFeatures: Map<Tiles, Point[]>; strippedMap: MultiLayeredMap }) {
        this.strippedMap = data.strippedMap;
        this.distanceCalculator = data.distanceCalculator;
        this.targets = data.staticFeatures.get(Tiles.target)!;
        this.deadlockDetectors = [
            new BoxClusterDeadlockDetector({strippedStaticMapMap: this.strippedMap}),
            new BoxGluedToWallDetector({strippedStaticMapMap: this.strippedMap})];
    }

    public analyse(movement: MovementOrchestratorOutput): MovementAnalysis {
        const isDeadLocked = this.deadlockDetectors
            .some(detector => detector.deadLocked(movement));
        const boxesMoved = movement.boxes
            .filter(box => box.currentPosition.isDifferentOf(box.nextPosition));
        const pushedBox = boxesMoved
            .find(box => movement.hero.nextPosition.isEqualTo(box.currentPosition) &&
                movement.hero.direction === box.direction);
        return {
            boxesMoved: [],
            pushedBox: pushedBox ? {
                id: pushedBox.id,
                direction: pushedBox.direction!
            } : undefined,
            sumOfEveryBoxToTheClosestTarget: this.sumOfEveryBoxToTheClosestAvailableTarget(movement),
            isDeadLocked: isDeadLocked
        };
    }

    private sumOfEveryBoxToTheClosestAvailableTarget(movement: MovementOrchestratorOutput): number {
        let availableTargets = this.targets;
        return movement.boxes
            .reduce((sum, box) => {
                const shortestDistanceToAvailableTarget = availableTargets
                    .reduce((acc, target, targetIndex) => {
                        const distance = this.distanceCalculator.distance(target, box.nextPosition);
                        if (acc.value === -1 || distance < acc.value) {
                            return {
                                value: distance,
                                index: targetIndex
                            };
                        }
                        return acc;
                    }, {value: -1, index: -1});
                availableTargets = availableTargets
                    .filter((_, index) => index !== shortestDistanceToAvailableTarget.index);
                return sum + shortestDistanceToAvailableTarget.value;
            }, 0);
    }

}