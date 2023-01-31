import { Tiles } from '@/levels/tiles';
import { configuration } from '@/constants/configuration';
import { BoxClusterDeadlockDetector } from './box-cluster-deadlock-detector';
import { BoxGluedToWallDetector } from './box-glued-to-wall-deadlock-detector';
export class MoveAnalyser {
    targets;
    distanceCalculator;
    strippedMap;
    deadlockDetectors;
    constructor(data) {
        this.strippedMap = data.strippedMap;
        this.distanceCalculator = data.distanceCalculator;
        this.targets = data.staticFeatures.get(Tiles.target);
        this.deadlockDetectors = [
            new BoxClusterDeadlockDetector({ strippedStaticMapMap: this.strippedMap }),
            new BoxGluedToWallDetector({ strippedStaticMapMap: this.strippedMap })
        ];
    }
    analyse(movement) {
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
                direction: pushedBox.direction
            } : undefined,
            sumOfEveryBoxToTheClosestTarget: configuration.solver.distanceToTheClosestBox ? this.sumOfEveryBoxToTheClosestTarget(movement) : this.sumOfEveryBoxToTheClosestAvailableTarget(movement),
            isDeadLocked: isDeadLocked
        };
    }
    sumOfEveryBoxToTheClosestAvailableTarget(movement) {
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
            }, { value: -1, index: -1 });
            availableTargets = availableTargets
                .filter((_, index) => index !== shortestDistanceToAvailableTarget.index);
            return sum + shortestDistanceToAvailableTarget.value;
        }, 0);
    }
    sumOfEveryBoxToTheClosestTarget(movement) {
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
            }, { value: -1, index: -1 });
            return sum + shortestDistanceToAvailableTarget.value;
        }, 0);
    }
}
