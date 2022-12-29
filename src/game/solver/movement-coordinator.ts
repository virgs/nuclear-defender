import type {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Directions} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-mapper';

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
    staticMap: StaticMap;
    hero: Point;
};

export class MovementCoordinator {
    private readonly staticMap: StaticMap;

    constructor(data: StaticMap) {
        this.staticMap = data;
    }

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        let mapChanged = false;
        let hero: Movement = this.initializeHero(input);
        let boxes: Movement[] = this.initializeBoxes(input);
        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            hero.direction = heroDirection;

            const newHeroPosition = input.hero.calculateOffset(heroDirection);
            if (this.canHeroMove(newHeroPosition, input)) {
                mapChanged = true;
                hero.currentPosition = newHeroPosition;
                hero.isCurrentlyOnTarget = this.staticMap.tiles[newHeroPosition.y][newHeroPosition.x] === Tiles.target;
                //box moved
                const movedBox = boxes
                    .find(box => box.previousPosition.isEqualTo(newHeroPosition));
                if (movedBox) {
                    movedBox.direction = heroDirection;
                    movedBox.currentPosition = movedBox.previousPosition.calculateOffset(heroDirection);
                    movedBox.isCurrentlyOnTarget = this.staticMap.tiles[movedBox.currentPosition.y][movedBox.currentPosition.x] === Tiles.target;
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
        return input.boxes
            .map(box => ({
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

    private canHeroMove(newHeroPosition: Point, input: MovementCoordinatorInput): boolean {
        const featureAhead = this.getFeatureAtPosition(newHeroPosition);
        if (featureAhead === undefined || featureAhead === Tiles.wall) {
            return false;
        }

        if (input.boxes
            .some(box => box.isEqualTo(newHeroPosition))) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            const afterNextMove = newHeroPosition.calculateOffset(heroDirection);
            const afterNextMoveFeature = this.getFeatureAtPosition(afterNextMove);
            if (afterNextMoveFeature === undefined || afterNextMoveFeature === Tiles.wall) {
                return false;
            }
            if (input.boxes
                .find(box => box.isEqualTo(afterNextMove))) {
                return false;
            }
        }

        return true;
    }

    private getFeatureAtPosition(position: Point): Tiles | undefined {
        if (position.x >= this.staticMap.width || position.y >= this.staticMap.height
            || position.x < 0 || position.y < 0) {
            return undefined;
        }
        return this.staticMap.tiles[position.y][position.x];
    }

}