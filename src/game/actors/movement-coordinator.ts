import type {Point} from '../math/point';
import {TileCodes} from '../tiles/tile-codes';
import {Directions} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';

type Movement = {
    currentPosition: Point,
    newPosition: Point,
    direction: Directions | undefined
};

export type MovementCoordinatorInput = {
    //TODO split it in (dynamicFeatures (boxes, hero) and staticMatrix(walls, treadmills, targets)
    mapState: Map<TileCodes, Point[]>;
    heroAction: Actions
};

export type MovementCoordinatorOutput = {
    mapChanged: boolean,
    newMapState: Map<TileCodes, Point[]>,
    //TODO split it in (dynamicFeatures (boxes, hero) and staticMatrix(walls, treadmills, targets)
    featuresMovementMap: Map<TileCodes, Movement[]>
};

export class MovementCoordinator {
    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        const result = this.initializeOutput(input);
        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction);
            const heroPosition = input.mapState.get(TileCodes.hero)![0];
            const newHeroPosition = this.calculateOffset(heroDirection, heroPosition);

            if (this.heroMovementIsAvailable(newHeroPosition, input)) {
                result.mapChanged = true;
                result.featuresMovementMap.set(TileCodes.hero, [{
                    currentPosition: heroPosition,
                    newPosition: newHeroPosition,
                    direction: heroDirection
                }]);

                const boxAhead = this.getBoxAt(newHeroPosition, input.mapState);
                if (boxAhead) {
                    result.featuresMovementMap.set(TileCodes.box, [{
                        currentPosition: boxAhead,
                        newPosition: this.calculateOffset(heroDirection, boxAhead),
                        direction: heroDirection
                    }]);
                }
            }
        }

        if (result.mapChanged) {
            result.newMapState = this.generateNextState(input, result.featuresMovementMap);
        }
        return result;
    }

    private initializeOutput(input: MovementCoordinatorInput) {
        const result: MovementCoordinatorOutput = {
            mapChanged: false,
            featuresMovementMap: new Map<TileCodes, Movement[]>(),
            newMapState: input.mapState
        };
        result.featuresMovementMap.set(TileCodes.hero, []);
        result.featuresMovementMap.set(TileCodes.box, []);
        return result;
    }

    private heroMovementIsAvailable(newHeroPosition: Point, input: MovementCoordinatorInput): boolean {
        if (this.getWallAt(newHeroPosition, input.mapState)) {
            return false;
        }

        if (this.getBoxAt(newHeroPosition, input.mapState)) {
            const heroDirection = mapActionToDirection(input.heroAction);
            const afterNextMove = this.calculateOffset(heroDirection, newHeroPosition);
            if (this.getWallAt(afterNextMove, input.mapState)) {
                return false;
            }
            if (this.getBoxAt(afterNextMove, input.mapState)) {
                return false;
            }
        }

        return true;
    }

    private hasFeatureAt(features: Point[], point: Point): Point | undefined {
        return features
            .find(feature => {
                return feature.x == point.x && feature.y == point.y;
            });
    }

    private getWallAt(offsetTilePosition: Point, mapState: Map<TileCodes, Point[]>): Point | undefined {
        return this.hasFeatureAt(mapState.get(TileCodes.wall)!, offsetTilePosition);
    }

    private getBoxAt(offsetTilePosition: Point, mapState: Map<TileCodes, Point[]>): Point | undefined {
        return this.hasFeatureAt(mapState.get(TileCodes.box)!, offsetTilePosition);
    }

    private calculateOffset(direction: Directions | undefined, currentPosition: Point): Point {
        const offset: Point = {
            x: currentPosition.x,
            y: currentPosition.y
        };

        switch (direction) {
            case Directions.LEFT:
                offset.x -= 1;
                break;
            case Directions.RIGHT:
                offset.x += 1;
                break;
            case Directions.UP:
                offset.y -= 1;
                break;
            case Directions.DOWN:
                offset.y += 1;
                break;
        }
        return offset;
    }

    private generateNextState(input: MovementCoordinatorInput, movementMap: Map<TileCodes, Movement[]>) {
        const baseState: Map<TileCodes, Point[]> = new Map(JSON.parse(JSON.stringify(Array.from(input.mapState))));
        for (let [tileCode, movementList] of movementMap.entries()) {
            movementList
                .forEach(move => {
                    baseState.get(tileCode)!
                        .filter(tile => tile.x === move.currentPosition.x && tile.y === move.currentPosition.y)
                        .forEach(tile => {
                            tile.x = move.newPosition.x;
                            tile.y = move.newPosition.y;
                        });
                });
        }
        return baseState;
    }
}