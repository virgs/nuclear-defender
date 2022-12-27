import type {Point} from '../math/point';
import {TileCodes} from '../tiles/tile-codes';
import type {Directions} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';

export type Movement = {
    previousPosition: Point,
    currentPosition: Point,
    isCurrentlyOnTarget: boolean,
    direction: Directions | undefined
};

export type MovementCoordinatorOutput = {
    mapChanged: boolean;
    boxes: Movement[]; //TODO add id to every box
    hero: Movement;
};

export type MovementCoordinatorInput = {
    boxes: Point[]; //TODO add id to every box
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
        let mapChanged = false;
        let hero: Movement = this.initializeHero(input);
        let boxes: Movement[] = this.initializeBoxes(input);
        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            hero.direction = heroDirection;

            const newHeroPosition = input.hero.calculateOffset(heroDirection);
            if (this.willPlayerMove(newHeroPosition, input)) {
                mapChanged = true;
                hero.currentPosition = newHeroPosition;
                hero.isCurrentlyOnTarget = this.staticMap[newHeroPosition.y][newHeroPosition.x] === TileCodes.target;
                //box moved
                const movedBox = boxes
                    .find(box => box.previousPosition.equal(newHeroPosition));
                if (movedBox) {
                    movedBox.direction = heroDirection;
                    movedBox.currentPosition = movedBox.previousPosition.calculateOffset(heroDirection);
                    movedBox.isCurrentlyOnTarget = this.staticMap[movedBox.currentPosition.y][movedBox.currentPosition.x] === TileCodes.target;
                }
            }
        }

        return {
            hero: hero,
            boxes: boxes,
            mapChanged: mapChanged
        };
    }

    private initializeBoxes(input: MovementCoordinatorInput) {
        return input.boxes.map(box => ({
            previousPosition: box,
            currentPosition: box,
            isCurrentlyOnTarget: false,
            direction: undefined
        }));
    }

    private initializeHero(input: MovementCoordinatorInput) {
        return {
            previousPosition: input.hero,
            currentPosition: input.hero,
            isCurrentlyOnTarget: false,
            direction: undefined
        };
    }

    private willPlayerMove(newHeroPosition: Point, input: MovementCoordinatorInput): boolean {
        const featureAhead = this.getFeatureAtPosition(newHeroPosition);
        if (featureAhead === undefined || featureAhead === TileCodes.wall) {
            return false;
        }

        const boxAhead = input.boxes
            .find(box => box.equal(newHeroPosition));
        if (boxAhead) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            const afterNextMove = newHeroPosition.calculateOffset(heroDirection);
            const afterNextMoveFeature = this.getFeatureAtPosition(afterNextMove);
            if (afterNextMoveFeature === undefined || afterNextMoveFeature === TileCodes.wall) {
                return false;
            }
            if (input.boxes
                .find(box => box.equal(afterNextMove))) {
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