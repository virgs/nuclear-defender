import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Directions} from '../constants/directions';
import {getOpositeDirectionOf} from '../constants/directions';
import {Actions, mapActionToDirection} from '../constants/actions';
import type {OrientedTile, StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import {SpringMovementHandler} from '@/game/controllers/spring-movement-handler';

export type Movement = {
    previousPosition: Point,
    currentPosition: Point,
    isCurrentlyOnTarget: boolean,
    isCurrentlyOnSpring: boolean,
    direction: Directions | undefined
};

export type OrientedPoint = {
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

export class MovementOrchestrator {
    private readonly blockerTiles: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.hero, Tiles.wall, Tiles.empty]);
    private readonly orientedEnteringBlockingTiles: Map<Tiles, (tileOrientation: Directions, movementDirection: Directions) => boolean> = new Map();
    private readonly orientedLeavingBlockingTiles: Map<Tiles, (tileOrientation: Directions, movementDirection: Directions) => boolean> = new Map();

    private readonly staticMap: StaticMap;
    private readonly hero: Movement;
    private readonly boxes: Movement[];
    private readonly springs: OrientedPoint[];
    private readonly movementHandlers: FeatureMovementHandler[];

    constructor(config: { boxes: Point[]; staticMap: StaticMap; hero: Point }) {
        this.staticMap = config.staticMap;
        this.hero = this.initializeMovement(config.hero);
        this.boxes = config.boxes.map(box => this.initializeMovement(box));
        this.springs = this.findTiles(Tiles.spring);
        this.movementHandlers = this.findTiles(Tiles.spring)
            .map(feature => {
                return new SpringMovementHandler({
                    spring: feature,
                    coordinator: this
                });
            });

        this.orientedEnteringBlockingTiles.set(Tiles.spring,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) === movementDirection);
        this.orientedEnteringBlockingTiles.set(Tiles.treadmil,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) !== movementDirection);
        this.orientedEnteringBlockingTiles.set(Tiles.oneWayDoor,
            (tileOrientation: Directions, movementDirection: Directions) => tileOrientation !== movementDirection);
        this.orientedLeavingBlockingTiles.set(Tiles.spring,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) === movementDirection);
    }

    private initializeMovement(point: Point): Movement {
        return {
            previousPosition: point,
            currentPosition: point,
            isCurrentlyOnTarget: this.getFeatureAtPosition(point)
                .some(feature => feature.code === Tiles.target),
            isCurrentlyOnSpring: this.getFeatureAtPosition(point)
                .some(feature => feature.code === Tiles.spring),
            direction: undefined
        };
    }

    private findTiles(code: Tiles): OrientedPoint[] {
        const orientedPoints: OrientedPoint[] = [];
        this.staticMap.tiles
            .forEach((line, y) => line
                .forEach((tile, x) => {
                    if (tile.code === code) {
                        orientedPoints.push({point: new Point(x, y), orientation: tile.orientation!});
                    }
                }));
        return orientedPoints;
    }

    public update(input: MovementCoordinatorInput): MovementCoordinatorOutput {
        this.hero.previousPosition = this.hero.currentPosition;
        this.boxes
            .forEach(box => box.previousPosition = box.currentPosition);

        let mapChanged = this.movementHandlers
            .reduce((changed, handler) => changed || handler.act(), false);

        if (input.heroAction !== Actions.STAND) {
            const aimedDirection = mapActionToDirection(input.heroAction)!;
            const aimedPosition = this.hero.currentPosition.calculateOffset(aimedDirection);
            if (this.canHeroMove(aimedPosition, aimedDirection)) {
                mapChanged = true;
                this.hero.direction = aimedDirection;
                this.moveHero(aimedPosition);
                this.boxes
                    .filter(box => box.previousPosition.isEqualTo(aimedPosition))
                    .forEach(box => this.moveBox(box, this.hero.direction!));
            }
        }

        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: mapChanged
        };
    }

    private moveHero(newHeroPosition: Point) {
        this.hero.currentPosition = newHeroPosition;
        this.hero.isCurrentlyOnTarget = this.getFeatureAtPosition(newHeroPosition)
            .some(feature => feature.code === Tiles.target);
        this.hero.isCurrentlyOnSpring = this.getFeatureAtPosition(newHeroPosition)
            .some(feature => feature.code === Tiles.spring);
    }

    public moveBox(movedBox: Movement, direction: Directions) {
        movedBox.direction = direction;
        movedBox.previousPosition = movedBox.currentPosition;
        movedBox.currentPosition = movedBox.previousPosition.calculateOffset(direction);
        movedBox.isCurrentlyOnTarget = this.getFeatureAtPosition(movedBox.currentPosition)
            .some(feature => feature.code === Tiles.target);
        movedBox.isCurrentlyOnSpring = this.getFeatureAtPosition(movedBox.currentPosition)
            .some(feature => feature.code === Tiles.spring);
    }

    private canHeroMove(aimedPosition: Point, aimedDirection: Directions): boolean {
        if (this.getFeatureAtPosition(this.hero.currentPosition)
            .filter(feature => this.orientedLeavingBlockingTiles.has(feature.code))
            .some(feature => this.orientedLeavingBlockingTiles.get(feature.code)!(feature.orientation!, aimedDirection))) {
            return false;
        }

        const positionProperties = this.getPositionProperties(aimedDirection, aimedPosition);
        if (positionProperties
            .some(move => !move.allowMoveOver)) { //it can be a box, check the next one too
            const notAllowed = positionProperties
                .filter(tile => !tile.allowMoveOver);
            if (notAllowed.length === 1 && notAllowed[0].tileAhead.code === Tiles.box) { //it's a box
                if (this.getFeatureAtPosition(aimedPosition) //check if the box is in a position that allows moves
                    .filter(feature => this.orientedLeavingBlockingTiles.has(feature.code))
                    .some(feature => this.orientedLeavingBlockingTiles.get(feature.code)!(feature.orientation!, aimedDirection))) {
                    return false;
                }
                //check the tile after the box
                const afterNextTilePosition = aimedPosition.calculateOffset(aimedDirection);
                return this.getPositionProperties(aimedDirection, afterNextTilePosition)
                    .every(property => property.allowMoveOver);
            }
            return false;
        }
        return true;
    }

    private checkSpringsPushes(): boolean {
        let mapChanged = false;
        this.springs
            .forEach(spring => this.boxes
                .some(box => {
                    if (box.currentPosition.isEqualTo(spring.point)) {
                        const nextTilePosition = box.currentPosition.calculateOffset(spring.orientation);
                        const properties = this.getPositionProperties(spring.orientation, nextTilePosition);
                        if (properties
                            .every(move => move.allowMoveOver)) {
                            this.moveBox(box, spring.orientation);
                            mapChanged = true;
                        }
                    }
                }));
        return mapChanged;
    }

    public getFeatureAtPosition(position: Point): OrientedTile[] {
        const result: OrientedTile[] = [];
        if (this.hero?.currentPosition.isEqualTo(position)) {
            result.push({
                code: Tiles.hero,
                orientation: undefined
            });
        }
        if (this.boxes
            ?.some(box => box.currentPosition.isEqualTo(position))) {
            result.push({
                code: Tiles.box,
                orientation: undefined
            });
        }
        if (position.x < this.staticMap.width && position.y < this.staticMap.height
            && position.x >= 0 && position.y >= 0) {
            result.push(this.staticMap.tiles[position.y][position.x]);
        }
        return result;
    }

    public getPositionProperties(movement: Directions, nextTilePosition: Point): { allowMoveOver: boolean, tileAhead: OrientedTile }[] {
        const tilesAhead = this.getFeatureAtPosition(nextTilePosition)!;
        return tilesAhead
            .map(tileAhead => {
                let allowed = true;
                if (this.blockerTiles.has(tileAhead.code)) {
                    allowed = false;
                } else if (this.orientedEnteringBlockingTiles.has(tileAhead.code)) {
                    allowed = this.orientedEnteringBlockingTiles.get(tileAhead.code)!(tileAhead.orientation!, movement);
                }
                return {
                    allowMoveOver: allowed,
                    tileAhead
                };
            }, []);
    }

    public getBoxes() {
        return this.boxes;
    }
}