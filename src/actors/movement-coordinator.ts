import {Point} from '../math/point';
import {TileCode} from '../tiles/tile-code';
import {Direction} from '../constants/direction';

type Movement = {
    currentPosition: Point,
    newPosition: Point,
    direction: Direction
};
export type MovementCoordinatorOutput = {
    mapChanged: boolean,
    newState: Map<TileCode, Point[]>,
    movementMap: Map<TileCode, Movement[]>
};

export type MovementCoordinatorInput = { mapState: Map<TileCode, Point[]>; heroMovingIntentionDirection: Direction };

export class MovementCoordinator {

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        const result = this.initializeOutput(input);
        const heroMovingIntentionDirection = input.heroMovingIntentionDirection;
        if (heroMovingIntentionDirection !== null) {
            const heroPosition = input.mapState.get(TileCode.hero)[0];
            const newHeroPosition = this.calculateOffset(heroMovingIntentionDirection, heroPosition);

            if (this.heroMovementIsAvailable(newHeroPosition, input)) {
                result.mapChanged = true;
                result.movementMap.set(TileCode.hero, [{
                    currentPosition: heroPosition,
                    newPosition: newHeroPosition,
                    direction: heroMovingIntentionDirection
                }]);

                const boxAhead = this.getBoxAt(newHeroPosition, input.mapState);
                if (boxAhead) {
                    result.movementMap.set(TileCode.box, [{
                        currentPosition: boxAhead,
                        newPosition: this.calculateOffset(input.heroMovingIntentionDirection, boxAhead),
                        direction: heroMovingIntentionDirection
                    }]);
                }
            }
        }

        if (result.mapChanged) {
            result.newState = this.generateNextState(input, result.movementMap);
        }
        return result;
    }

    private initializeOutput(input: MovementCoordinatorInput) {
        const result: MovementCoordinatorOutput = {
            mapChanged: false,
            movementMap: new Map<TileCode, Movement[]>(),
            newState: input.mapState
        };
        result.movementMap.set(TileCode.hero, []);
        result.movementMap.set(TileCode.box, []);
        return result;
    }

    private heroMovementIsAvailable(newHeroPosition: Point, input: MovementCoordinatorInput): boolean {
        if (this.getWallAt(newHeroPosition, input.mapState)) {
            return false;
        }

        if (this.getBoxAt(newHeroPosition, input.mapState)) {
            const afterNextMove = this.calculateOffset(input.heroMovingIntentionDirection, newHeroPosition);
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

    private calculateOffset(direction: Direction, currentPosition: Point): Point {
        const offset: Point = {
            x: currentPosition.x,
            y: currentPosition.y
        };

        switch (direction) {
            case Direction.LEFT:
                offset.x -= 1;
                break;
            case Direction.RIGHT:
                offset.x += 1;
                break;
            case Direction.UP:
                offset.y -= 1;
                break;
            case Direction.DOWN:
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