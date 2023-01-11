import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {DeadLockDetector} from '@/game/solver/dead-lock-detector';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import {BoxClusterDeadlockDetector} from '@/game/solver/box-cluster-deadlock-detector';
import {BoxGluedToWallDetector} from '@/game/solver/box-glued-to-wall-deadlock-detector';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {Movement, MovementOrchestratorOutput} from '../engine/movement-orchestrator';

export type PushedBox = { id: number, direction: Directions };
export type MovementAnalysis = {
    events: MovementEvents[],
    boxesMoved: Movement[],
    pushedBox: PushedBox
    sumOfEveryBoxToTheClosestTarget: number,
    isDeadLocked: boolean
}

export enum MovementEvents {
    HERO_MOVED,
    BOX_MOVED,
    HERO_MOVED_BOX_ONTO_TARGET,
    HERO_MOVED_BOX_OUT_OF_TARGET,
    BOX_MOVED_ONTO_TARGET,
    BOX_MOVED_OUT_OF_TARGET,
    BOX_MOVED_ONTO_FEATURE,
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
        const events = this.checkEvents(movement);
        const isDeadLocked = this.deadlockDetectors
            .some(detector => detector.deadLocked(movement));
        return {
            sumOfEveryBoxToTheClosestTarget: this.sumOfEveryBoxToTheClosestAvailableTarget(movement),
            ...events,
            isDeadLocked: isDeadLocked,
        };
    }

    private checkEvents(movement: MovementOrchestratorOutput): any {
        const events: MovementEvents[] = [];
        if (movement.hero.nextPosition.isDifferentOf(movement.hero.currentPosition)) {
            events.push(MovementEvents.HERO_MOVED);
        }
        const boxesMoved = movement.boxes
            .filter(box => box.currentPosition.isDifferentOf(box.nextPosition));

        boxesMoved
            .forEach(_ => events.push(MovementEvents.BOX_MOVED));

        let pushedBoxResult: PushedBox | undefined = undefined;
        const pushedBox = boxesMoved
            .find(box => movement.hero.nextPosition.isEqualTo(box.currentPosition) &&
                movement.hero.direction === box.direction);
        if (pushedBox) {
            pushedBoxResult = {
                id: pushedBox.id,
                direction: pushedBox.direction!
            };

            if (!this.isTileAtPosition(pushedBox.nextPosition, Tiles.target) &&
                this.isTileAtPosition(movement.hero.nextPosition, Tiles.target)) {
                events.push(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET);
            } else if (this.isTileAtPosition(pushedBox.nextPosition, Tiles.target)) {
                events.push(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET);
            }
        }

        boxesMoved
            .filter(box =>
                this.getTilesAtPosition(box.nextPosition)
                    .some(layer => layer.code !== Tiles.floor && layer.code !== Tiles.target))
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_ONTO_FEATURE));
        boxesMoved
            .filter(box => this.isTileAtPosition(box.nextPosition, Tiles.target))
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_ONTO_TARGET));
        boxesMoved
            .filter(box => !this.isTileAtPosition(box.nextPosition, Tiles.target) &&
                this.isTileAtPosition(movement.hero.nextPosition, Tiles.target))
            .forEach(_ => events.push(MovementEvents.BOX_MOVED_OUT_OF_TARGET));

        return {events, boxesMoved, lastPushedBox: pushedBoxResult};
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

    public isTileAtPosition(position: Point, tile: Tiles): boolean {
        return this.getTilesAtPosition(position)
            .some(layer => layer.code === tile);
    }

    public getTilesAtPosition(position: Point): OrientedTile[] {
        if (position.x < this.strippedMap.width && position.y < this.strippedMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.strippedMap.strippedFeatureLayeredMatrix[position.y][position.x];

        }
        return [];
    }
}