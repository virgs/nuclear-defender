import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import type {Directions} from '@/constants/directions';
import {configuration} from '@/constants/configuration';
import type {DeadLockDetector} from './dead-lock-detector';
import type {DistanceCalculator} from '@/math/distance-calculator';
import {BoxClusterDeadlockDetector} from './box-cluster-deadlock-detector';
import {BoxGluedToWallDetector} from './box-glued-to-wall-deadlock-detector';
import type {MultiLayeredMap} from '@/levels/standard-sokoban-annotation-tokennizer';
import type {Movement, MovementOrchestratorOutput} from '@/engine/movement-orchestrator';

export type PushedBox = { id: number, direction: Directions };
export type MovementAnalysis = {
    boxesMoved: Movement[],
    pushedBox?: PushedBox
    sumOfEveryBoxToTheClosestTarget: number,
    isDeadLocked: boolean
}

export class MoveAnalyser {
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
            sumOfEveryBoxToTheClosestTarget: configuration.solver.distanceToTheClosestBox ? this.sumOfEveryBoxToTheClosestTarget(movement) : this.sumOfEveryBoxToTheClosestAvailableTarget(movement),
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

    private sumOfEveryBoxToTheClosestTarget(movement: MovementOrchestratorOutput): number {
        return movement.boxes
            .reduce((sum, box) => {
                const shortestDistanceToAvailableTarget = this.targets
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
                return sum + shortestDistanceToAvailableTarget.value;
            }, 0);
    }
}