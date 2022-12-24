import type {Point} from '../math/point';
import {TileCodes} from '../tiles/tile-codes';
import {calculateOffset, Directions} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';
import Sprite = Phaser.GameObjects.Sprite;

type Movement = {
    sprite?: Sprite,
    currentPosition: Point,
    newPosition: Point,
    direction: Directions | undefined
};

export type MovementCoordinatorOutput = {
    mapChanged: boolean,
    //TODO split it in (dynamicFeatures (boxes, hero) and staticMatrix(walls, treadmills, targets)
    featuresMovementMap: Map<TileCodes, Movement[]>
};

export type MovementCoordinatorInput = {
    boxes: Point[];
    heroAction: Actions;
    staticMap: {
        width: number;
        height: number;
        tiles: TileCodes[][]
    };
    hero: Point;
};

export class MovementCoordinator {
    private readonly staticMap: TileCodes[][];

    constructor(data: { width: number; height: number; tiles: TileCodes[][] }) {
        this.staticMap = data.tiles;
    }

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        const result = this.initializeOutput();
        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            const newHeroPosition = calculateOffset(input.hero, heroDirection);

            if (this.heroMovementIsAvailable(newHeroPosition, input)) {

                result.mapChanged = true;
                result.featuresMovementMap.set(TileCodes.hero, [{
                    currentPosition: input.hero,
                    newPosition: newHeroPosition,
                    direction: heroDirection
                }]);

                const boxAhead = input.boxes
                    .find(box => box.x === newHeroPosition.x && box.y === newHeroPosition.y);
                if (boxAhead) {
                    result.featuresMovementMap.set(TileCodes.box, [{
                        currentPosition: boxAhead,
                        newPosition: calculateOffset(boxAhead, heroDirection),
                        direction: heroDirection
                    }]);
                }
            }
        }

        return result;
    }

    private initializeOutput() {
        const result: MovementCoordinatorOutput = {
            mapChanged: false,
            featuresMovementMap: new Map<TileCodes, Movement[]>()
        };
        result.featuresMovementMap.set(TileCodes.hero, []);
        result.featuresMovementMap.set(TileCodes.box, []);
        return result;
    }

    private heroMovementIsAvailable(newHeroPosition: Point, input: MovementCoordinatorInput): boolean {
        const featureAhead = this.getFeatureAtPosition(newHeroPosition);
        if (featureAhead === undefined || featureAhead === TileCodes.wall) {
            return false;
        }

        const boxAhead = input.boxes
            .find(box => box.x === newHeroPosition.x && box.y === newHeroPosition.y);
        if (boxAhead) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            const afterNextMove = calculateOffset(newHeroPosition, heroDirection);
            const afterNextMoveFeature = this.getFeatureAtPosition(afterNextMove);
            if (afterNextMoveFeature === undefined || afterNextMoveFeature === TileCodes.wall) {
                return false;
            }
            if (input.boxes
                .find(box => box.x === afterNextMove.x && box.y === afterNextMove.y)) {
                return false;
            }
        }

        return true;
    }

    private getFeatureAtPosition(position: Point): TileCodes | undefined {
        if (position.x >= this.staticMap[0].length || position.y >= this.staticMap.length
            || position.x < 0 || position.y < 0) {
            return undefined;
        }
        return this.staticMap[position.y][position.x];
    }

}