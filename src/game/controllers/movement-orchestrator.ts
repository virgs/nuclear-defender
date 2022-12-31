import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Directions} from '../constants/directions';
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

    private readonly staticMap: StaticMap;
    private readonly hero: Movement;
    private readonly boxes: Movement[];
    private readonly movementHandlers: FeatureMovementHandler[];

    constructor(config: { boxes: Point[]; staticMap: StaticMap; hero: Point }) {
        this.staticMap = config.staticMap;
        this.hero = this.initializeFeature(config.hero);
        this.boxes = config.boxes
            .map(box => this.initializeFeature(box));
        this.movementHandlers = this.findTiles(Tiles.spring)
            .map(feature =>
                new SpringMovementHandler({
                    spring: feature,
                    coordinator: this
                }));
    }

    private initializeFeature(point: Point): Movement {
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

    public moveFeature(movement: Movement, direction: Directions) {
        movement.direction = direction;
        movement.previousPosition = movement.currentPosition;
        movement.currentPosition = movement.previousPosition.calculateOffset(direction);
        movement.isCurrentlyOnTarget = this.getFeatureAtPosition(movement.currentPosition)
            .some(feature => feature.code === Tiles.target);
        movement.isCurrentlyOnSpring = this.getFeatureAtPosition(movement.currentPosition)
            .some(feature => feature.code === Tiles.spring);
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
                this.moveFeature(this.hero, aimedDirection);
                this.boxes
                    .filter(box => box.previousPosition.isEqualTo(aimedPosition))
                    .forEach(box => this.moveFeature(box, aimedDirection));
            }
        }

        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: mapChanged
        };
    }

    public getBoxes(): Movement[] {
        return this.boxes;
    }

    private canHeroMove(aimedPosition: Point, aimedDirection: Directions): boolean {
        const position = this.hero.currentPosition;
        if (!this.canFeatureLeavePosition({point: position, orientation: aimedDirection})) {
            return false;
        }

        if (!this.canFeatureEnterPosition({point: aimedPosition, orientation: aimedDirection})) { //it can be a box, check the next one too
            if (this.getFeatureAtPosition(aimedPosition)
                .some(feature => feature.code === Tiles.box)) { //it's a box
                //check if the box is in a position that allows moves
                if (!this.canFeatureLeavePosition({point: aimedPosition, orientation: aimedDirection})) {
                    return false;
                }
                //check the tile after the box
                const afterNextTilePosition = aimedPosition.calculateOffset(aimedDirection);
                return this.canFeatureEnterPosition({point: afterNextTilePosition, orientation: aimedDirection});
            }
            return false;
        }
        return true;
    }

    public canFeatureLeavePosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        return this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature => feature.code === handler.getTile() && move.point.isEqualTo(handler.getPosition())))
            .every(handler => handler.allowLeavingMovement(move.orientation));
    }

    public canFeatureEnterPosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        if (positionFeatures
            .some(feature => this.blockerTiles.has(feature.code))) {
            return false;
        }
        if (this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature => feature.code === handler.getTile() && move.point.isEqualTo(handler.getPosition())))
            .every(handler => handler.allowEnteringMovement(move.orientation))) {
            return true;
        }
        return false;
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
}