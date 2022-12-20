import {Point} from '../math/point';
import {TileCode} from '../tiles/tile-code';
import {Actions, mapActionToDirection} from '../constants/actions';
import {Directions} from '../constants/directions';

type Movement = {
    currentPosition: Point,
    newPosition: Point,
    direction: Directions
};

export type MovementCoordinatorInput = {
    //TODO split it in (dynamicFeatures (boxes, hero) and staticMatrix(walls, treadmills, targets)
    mapState: Map<TileCode, Point[]>;
    heroAction: Actions
};

export type MovementCoordinatorOutput = {
    mapChanged: boolean,
    newMapState: Map<TileCode, Point[]>,
    //TODO split it in (dynamicFeatures (boxes, hero) and staticMatrix(walls, treadmills, targets)
    featuresMovementMap: Map<TileCode, Movement[]>
};

export class MovementCoordinator {
    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        const result = this.initializeOutput(input);
        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction);
            const heroPosition = input.mapState.get(TileCode.hero)[0];
            const newHeroPosition = this.calculateOffset(heroDirection, heroPosition);

            if (this.heroMovementIsAvailable(newHeroPosition, input)) {
                result.mapChanged = true;
                result.featuresMovementMap.set(TileCode.hero, [{
                    currentPosition: heroPosition,
                    newPosition: newHeroPosition,
                    direction: heroDirection
                }]);

                const boxAhead = this.getBoxAt(newHeroPosition, input.mapState);
                if (boxAhead) {
                    result.featuresMovementMap.set(TileCode.box, [{
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
            featuresMovementMap: new Map<TileCode, Movement[]>(),
            newMapState: input.mapState
        };
        result.featuresMovementMap.set(TileCode.hero, []);
        result.featuresMovementMap.set(TileCode.box, []);
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

    private getWallAt(offsetTilePosition: Point, mapState: Map<TileCode, Point[]>): Point | undefined {
        return this.hasFeatureAt(mapState.get(TileCode.wall), offsetTilePosition);
    }

    private getBoxAt(offsetTilePosition: Point, mapState: Map<TileCode, Point[]>): Point | undefined {
        return this.hasFeatureAt(mapState.get(TileCode.box), offsetTilePosition);
    }

    private calculateOffset(direction: Directions, currentPosition: Point): Point {
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

    private generateNextState(input: MovementCoordinatorInput, movementMap: Map<TileCode, Movement[]>) {
        const baseState: Map<TileCode, Point[]> = new Map(JSON.parse(JSON.stringify(Array.from(input.mapState))));
        for (let [tileCode, movementList] of movementMap.entries()) {
            movementList
                .forEach(move => {
                    baseState.get(tileCode)
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