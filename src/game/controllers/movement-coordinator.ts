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
    private readonly orientinedBlockingTiles: Map<Tiles, (tileOrientation: Directions, movementDirection: Directions) => boolean> = new Map();

    private readonly staticMap: StaticMap;
    private readonly hero: Movement;
    private readonly boxes: Movement[];
    private readonly featuresActions: (() => boolean)[];
    private springs: OrientedPoint[];

    constructor(config: { boxes: Point[]; staticMap: StaticMap; hero: Point }) {
        this.staticMap = config.staticMap;
        this.hero = this.initializeMovement(config.hero);
        this.boxes = config.boxes.map(box => this.initializeMovement(box));
        this.springs = this.findTiles(Tiles.spring);

        this.featuresActions = [];
        this.featuresActions.push(() => this.checkSpringsPushes());

        this.orientinedBlockingTiles.set(Tiles.spring,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) === movementDirection);
        this.orientinedBlockingTiles.set(Tiles.treadmil,
            (tileOrientation: Directions, movementDirection: Directions) => getOpositeDirectionOf(tileOrientation) !== movementDirection);
        this.orientinedBlockingTiles.set(Tiles.oneWayDoor,
            (tileOrientation: Directions, movementDirection: Directions) => tileOrientation !== movementDirection);
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

        let mapChanged = this.featuresActions
            .reduce((changed, action) => changed || action(), false);

        if (input.heroAction !== Actions.STAND) {
            const heroDirection = mapActionToDirection(input.heroAction)!;
            this.hero.direction = heroDirection;

            const newHeroPosition = this.hero.currentPosition.calculateOffset(heroDirection);
            if (this.canHeroMove(newHeroPosition)) {
                mapChanged = true;
                //move hero
                this.hero.currentPosition = newHeroPosition;
                //update target status
                this.hero.isCurrentlyOnTarget = this.getFeatureAtPosition(newHeroPosition)
                    .some(feature => feature.code === Tiles.target);
                this.hero.isCurrentlyOnSpring = this.getFeatureAtPosition(newHeroPosition)
                    .some(feature => feature.code === Tiles.spring);
                //box moved
                const movedBox = this.boxes
                    .find(box => box.previousPosition.isEqualTo(newHeroPosition));
                if (movedBox) {
                    //move box
                    movedBox.direction = heroDirection;
                    movedBox.previousPosition = movedBox.currentPosition;
                    movedBox.currentPosition = movedBox.previousPosition.calculateOffset(heroDirection);
                    //update target status
                    movedBox.isCurrentlyOnTarget = this.getFeatureAtPosition(movedBox.currentPosition)
                        .some(feature => feature.code === Tiles.target);
                    movedBox.isCurrentlyOnSpring = this.getFeatureAtPosition(movedBox.currentPosition)
                        .some(feature => feature.code === Tiles.spring);
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
        if (this.hero.isCurrentlyOnSpring) {
            const springOnIt = this.getFeatureAtPosition(this.hero.currentPosition)
                .find(feature => feature.code === Tiles.spring)!;
            return !this.orientinedBlockingTiles.get(Tiles.spring)!(springOnIt.orientation!, this.hero.direction!);
        }
        const positionProperties = this.getPositionProperties(this.hero.direction!, newHeroPosition);
        if (positionProperties
            .some(move => !move.allowMoveOver)) { //it can be a box, check the next one too
            const notAllowed = positionProperties
                .filter(tile => !tile.allowMoveOver);
            if (notAllowed.length === 1 && notAllowed[0].tileAhead.code === Tiles.box) { //it's a box, check the following
                const afterNextMove = newHeroPosition.calculateOffset(this.hero.direction!);
                const followingProperties = this.getPositionProperties(this.hero.direction!, afterNextMove);

                const springAhead = positionProperties
                    .find(property => property.tileAhead.code === Tiles.spring);
                if (springAhead) { //the box is on a spring, one direction is not allowed
                    return !this.orientinedBlockingTiles.get(Tiles.spring)!(springAhead.tileAhead.orientation!, this.hero.direction!);
                }
                return followingProperties
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

    private getFeatureAtPosition(position: Point): OrientedTile[] {
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

    private getPositionProperties(movement: Directions, nextTilePosition: Point): { allowMoveOver: boolean, tileAhead: OrientedTile }[] {
        const tilesAhead = this.getFeatureAtPosition(nextTilePosition)!;
        return tilesAhead
            .map(tileAhead => {
                let allowed = true;
                if (this.blockerTiles.has(tileAhead.code)) {
                    allowed = false;
                } else if (this.orientinedBlockingTiles.has(tileAhead.code)) {
                    allowed = this.orientinedBlockingTiles.get(tileAhead.code)!(tileAhead.orientation!, movement);
                }
                return {
                    allowMoveOver: allowed,
                    tileAhead
                };
            }, []);
    }
}