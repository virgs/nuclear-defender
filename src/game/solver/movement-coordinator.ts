import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Directions} from '../constants/directions';
import {getOpositeDirectionOf} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';
import type {OrientedTile, StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type Movement = {
    previousPosition: Point,
    currentPosition: Point,
    isCurrentlyOnTarget: boolean,
    isCurrentlyOnSpring: boolean,
    direction: Directions | undefined
};

type OrientedPoint = {
    point: Point,
    orientation: Directions
}

export type MovementCoordinatorOutput = {
    mapChanged: boolean;
    boxes: Movement[];
    hero: Movement;
};

export type MovementCoordinatorInput = {
    boxes: Point[];
    heroAction: Actions;
    map: StaticMap;
    hero: Point;
};

export class MovementCoordinator {
    private readonly blockerTiles: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.hero, Tiles.wall, Tiles.empty]);
    private readonly blocklessTiles: Set<Tiles> = new Set<Tiles>([Tiles.floor, Tiles.oily]);
    private readonly orientinedBlockingTiles: Map<Tiles, (tileOrientation: Directions, movementDirection: Directions) => boolean> = new Map();

    private readonly staticMap: StaticMap;

    constructor(map: StaticMap) {
        this.staticMap = map;
        this.orientinedBlockingTiles.set(Tiles.spring,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) === movementDirection);
        this.orientinedBlockingTiles.set(Tiles.treadmil,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) !== movementDirection);
        this.orientinedBlockingTiles.set(Tiles.oneWayDoor,
            (tileOrientation: Directions, movementDirection: Directions) => tileOrientation === movementDirection);
    }

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        let mapChanged = false;
        let hero: Movement = this.initializeHero(input);
        let boxes: Movement[] = this.initializeBoxes(input);

        mapChanged = mapChanged || this.checkSpringsSituation(hero, boxes);

        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            hero.direction = heroDirection;

            const newHeroPosition = input.hero.calculateOffset(heroDirection);
            if (this.canHeroMove(newHeroPosition, heroDirection, boxes)) {
                mapChanged = true;
                //move hero
                hero.currentPosition = newHeroPosition;
                //update target status
                hero.isCurrentlyOnTarget = this.staticMap.tiles[newHeroPosition.y][newHeroPosition.x].code === Tiles.target;
                //box moved
                const movedBox = boxes
                    .find(box => box.previousPosition.isEqualTo(newHeroPosition));
                if (movedBox) {
                    //move box
                    movedBox.direction = heroDirection;
                    movedBox.currentPosition = movedBox.previousPosition.calculateOffset(heroDirection);
                    //update target status
                    movedBox.isCurrentlyOnTarget = this.staticMap.tiles[movedBox.currentPosition.y][movedBox.currentPosition.x].code === Tiles.target;
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
                isCurrentlyOnSpring: false,
                direction: undefined
            }));
    }

    private initializeHero(input: MovementCoordinatorInput) {
        return {
            previousPosition: input.hero,
            currentPosition: input.hero,
            isCurrentlyOnSpring: false,
            isCurrentlyOnTarget: false,
            direction: undefined
        };
    }

    private canHeroMove(newHeroPosition: Point, heroDirection: Directions, boxes: Movement[]): boolean {
        const featureAhead = this.getFeatureAtPosition(newHeroPosition)?.code;
        if (featureAhead === undefined || featureAhead === Tiles.wall) {
            return false;
        }

        if (boxes
            .some(box => box.currentPosition.isEqualTo(newHeroPosition))) {
            const afterNextMove = newHeroPosition.calculateOffset(heroDirection);
            const afterNextMoveFeature = this.getFeatureAtPosition(afterNextMove)?.code;
            if (afterNextMoveFeature === undefined || afterNextMoveFeature === Tiles.wall) {
                return false;
            }
            if (boxes
                .find(box => box.currentPosition.isEqualTo(afterNextMove))) {
                return false;
            }
        }

        return true;
    }

    private getFeatureAtPosition(position: Point): OrientedTile | undefined {
        if (position.x >= this.staticMap.width || position.y >= this.staticMap.height
            || position.x < 0 || position.y < 0) {
            return undefined;
        }
        return this.staticMap.tiles[position.y][position.x];
    }

    private checkSpringsSituation(hero: Movement, boxes: Movement[]): boolean {
        let mapChanged = false;
        const springs: OrientedPoint[] = this.findSprings();
        springs
            .forEach(spring => boxes
                .some(box => {
                    if (box.currentPosition.isEqualTo(spring.point)) {
                        const nextTilePosition = box.currentPosition.calculateOffset(spring.orientation);
                        if (nextTilePosition.isDifferentOf(hero.currentPosition) &&
                            this.isMovementAllowed(Tiles.box, spring.orientation, nextTilePosition)) {
                            box.currentPosition = nextTilePosition;
                            box.isCurrentlyOnSpring = true;
                            box.direction = spring.orientation;
                            box.isCurrentlyOnTarget = this.staticMap.tiles[box.currentPosition.y][box.currentPosition.x].code === Tiles.target;

                            mapChanged = true;
                        }
                    }
                }));
        return mapChanged;
    }

    private isMovementAllowed(tileCode: Tiles, movement: Directions, nextTilePosition: Point): boolean {
        const featureAtPositionAhead = this.getFeatureAtPosition(nextTilePosition)!;
        if (this.blocklessTiles.has(featureAtPositionAhead.code)) {
            return true;
        }
        if (this.blockerTiles.has(featureAtPositionAhead.code)) {
            return false;
        }
        if (this.orientinedBlockingTiles.get(featureAtPositionAhead.code)!(featureAtPositionAhead.orientation!, movement)) {
            return false;
        }
        return true;
    }

    private findSprings(): OrientedPoint[] {
        const springs: OrientedPoint[] = [];
        this.staticMap.tiles
            .forEach((line, y) => line
                .forEach((tile, x) => {
                    if (tile.code === Tiles.spring) {
                        springs.push({point: new Point(x, y), orientation: tile.orientation!});
                    }
                }));
        return springs;
    }
}