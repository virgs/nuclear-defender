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
    heroAction: Actions;
};

export class MovementCoordinator {
    private readonly blockerTiles: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.hero, Tiles.wall, Tiles.empty]);
    private readonly blocklessTiles: Set<Tiles> = new Set<Tiles>([Tiles.floor, Tiles.oily]);
    private readonly orientinedBlockingTiles: Map<Tiles, (tileOrientation: Directions, movementDirection: Directions) => boolean> = new Map();

    private readonly staticMap: StaticMap;
    private readonly hero: Movement;
    private readonly boxes: Movement[];

    constructor(config: { boxes: Point[]; staticMap: StaticMap; hero: Point }) {
        this.staticMap = config.staticMap;
        this.hero = this.initializeMovement(config.hero);
        this.boxes = config.boxes.map(box => this.initializeMovement(box));

        this.orientinedBlockingTiles.set(Tiles.spring,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) === movementDirection);
        this.orientinedBlockingTiles.set(Tiles.treadmil,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) !== movementDirection);
        this.orientinedBlockingTiles.set(Tiles.oneWayDoor,
            (tileOrientation: Directions, movementDirection: Directions) => tileOrientation === movementDirection);
    }

    private initializeMovement(point: Point): Movement {
        return {
            previousPosition: point,
            currentPosition: point,
            isCurrentlyOnTarget: this.getFeatureAtPosition(point)?.code === Tiles.target,
            isCurrentlyOnSpring: this.getFeatureAtPosition(point)?.code === Tiles.spring,
            direction: undefined
        };
    }

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        this.hero.previousPosition = this.hero.currentPosition;
        this.boxes
            .forEach(box => box.previousPosition = box.currentPosition);

        let mapChanged = false;

        mapChanged = mapChanged || this.checkSpringsPushes();

        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            this.hero.direction = heroDirection;

            const newHeroPosition = this.hero.currentPosition.calculateOffset(heroDirection);
            if (this.canHeroMove(newHeroPosition)) {
                mapChanged = true;
                //move hero
                this.hero.currentPosition = newHeroPosition;
                //update target status
                this.hero.isCurrentlyOnTarget = this.staticMap.tiles[newHeroPosition.y][newHeroPosition.x].code === Tiles.target;
                //box moved
                const movedBox = this.boxes
                    .find(box => box.previousPosition.isEqualTo(newHeroPosition));
                if (movedBox) {
                    //move box
                    movedBox.direction = heroDirection;
                    movedBox.previousPosition = movedBox.currentPosition;
                    movedBox.currentPosition = movedBox.previousPosition.calculateOffset(heroDirection);
                    //update target status
                    movedBox.isCurrentlyOnTarget = this.staticMap.tiles[movedBox.currentPosition.y][movedBox.currentPosition.x].code === Tiles.target;
                }
            }
        }

        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: mapChanged
        };
    }

    private canHeroMove(newHeroPosition: Point): boolean {
        const featureAhead = this.getFeatureAtPosition(newHeroPosition)?.code;
        if (featureAhead === undefined || featureAhead === Tiles.wall) {
            return false;
        }

        if (this.boxes
            .some(box => box.currentPosition.isEqualTo(newHeroPosition))) {
            const afterNextMove = newHeroPosition.calculateOffset(this.hero.direction!);
            const afterNextMoveFeature = this.getFeatureAtPosition(afterNextMove)?.code;
            if (afterNextMoveFeature === undefined || afterNextMoveFeature === Tiles.wall) {
                return false;
            }
            if (this.boxes
                .find(box => box.currentPosition.isEqualTo(afterNextMove))) {
                return false;
            }
        }

        return true;
    }

    private getFeatureAtPosition(position: Point): OrientedTile | undefined {
        if (this.hero?.currentPosition.isEqualTo(position)) {
            return {
                code: Tiles.hero,
                orientation: undefined
            };
        }
        if (this.boxes
            ?.some(box => box.currentPosition.isEqualTo(position))) {
            return {
                code: Tiles.box,
                orientation: undefined
            };
        }
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.staticMap.tiles[position.y][position.x];
        }
    }

    private checkSpringsPushes(): boolean {
        let mapChanged = false;
        const springs: OrientedPoint[] = this.findSprings();
        springs
            .forEach(spring => this.boxes
                .some(box => {
                    if (box.currentPosition.isEqualTo(spring.point)) {
                        const nextTilePosition = box.currentPosition.calculateOffset(spring.orientation);
                        if (this.isMovementAllowed(Tiles.box, spring.orientation, nextTilePosition)) {
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