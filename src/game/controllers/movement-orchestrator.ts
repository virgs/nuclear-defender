import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import type {Actions} from '../constants/actions';
import type {Directions} from '../constants/directions';
import {HeroMovementHandler} from '@/game/controllers/hero-movement-handler';
import {SpringMovementHandler} from '@/game/controllers/spring-movement-handler';
import {OilyFloorMovementHandler} from '@/game/controllers/oily-floor-movement-handler';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {OrientedTile, StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type Movement = {
    currentPosition: Point,
    nextPosition: Point,
    direction: Directions | undefined
};

export type OrientedPoint = {
    point: Point,
    orientation: Directions
}

export type MovementOrchestratorOutput = {
    mapChanged: boolean;
    boxes: Movement[];
    hero: Movement;
};

export type MovementOrchestratorInput = {
    heroPosition: Point;
    heroAction: Actions;
    boxes: Point[];
    lastActionResult?: MovementOrchestratorOutput;
};

export class MovementOrchestrator {
    private readonly blockerTiles: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.wall, Tiles.empty]);

    private readonly staticMap: StaticMap;
    private readonly movementHandlers: FeatureMovementHandler[] = [];

    private hero?: Movement;
    private boxes?: Movement[];

    constructor(config: { staticMap: StaticMap }) {
        this.staticMap = config.staticMap;
        this.movementHandlers.push(new HeroMovementHandler({coordinator: this}));
        this.movementHandlers.push(...this.findTileOrientedPositions(Tiles.spring)
            .map(orientedPosition =>
                new SpringMovementHandler({
                    spring: orientedPosition,
                    coordinator: this
                })));
        this.movementHandlers.push(...this.findTileOrientedPositions(Tiles.oily)
            .map(orientedPosition =>
                new OilyFloorMovementHandler({
                    position: orientedPosition.point,
                    coordinator: this
                })));
    }

    public moveHero(direction: Directions): void {
        this.moveFeature(this.hero!, direction);
    }

    public moveFeature(movement: Movement, direction: Directions) {
        movement.direction = direction;
        movement.currentPosition = movement.nextPosition;
        movement.nextPosition = movement.currentPosition.calculateOffset(direction);
    }

    public update(input: MovementOrchestratorInput): MovementOrchestratorOutput {
        this.hero = this.initializeFeature(input.heroPosition);
        this.boxes = input.boxes
            .map(box => this.initializeFeature(box));

        const mapChanged = this.movementHandlers
            .reduce((acc, handler) => {
                const act = handler.act({
                    hero:
                        {
                            action: input.heroAction,
                            position: this.hero!.nextPosition
                        },
                    boxes: this.boxes!,
                    lastActionResult: input.lastActionResult
                });
                return act || acc;
            }, false);

        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: mapChanged
        };
    }

    public canFeatureLeavePosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        const featureMovementHandlers = this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature =>
                    feature.code === handler.getTile() &&
                    move.point.isEqualTo(handler.getPosition())));
        return featureMovementHandlers
            .every(handler => handler.allowLeavingMovement(move.orientation));
    }

    public canFeatureEnterPosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeatureAtPosition(move.point);
        if (positionFeatures
            .some(feature => this.blockerTiles.has(feature.code))) {
            return false;
        }
        return this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature => feature.code === handler.getTile() && move.point.isEqualTo(handler.getPosition())))
            .every(handler => handler.allowEnteringMovement(move.orientation));
    }

    private initializeFeature(point: Point): Movement {
        return {
            currentPosition: point,
            nextPosition: point,
            direction: undefined
        };
    }

    public getFeatureAtPosition(position: Point): OrientedTile[] {
        const result: OrientedTile[] = [];
        if (this.hero?.nextPosition.isEqualTo(position)) {
            result.push({
                code: Tiles.hero,
                orientation: undefined
            });
        }
        if (this.hero?.currentPosition.isEqualTo(position)) {
            result.push({
                code: Tiles.hero,
                orientation: undefined
            });
        }
        if (this.boxes
            ?.some(box => box.nextPosition.isEqualTo(position))) {
            result.push({
                code: Tiles.box,
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

    private findTileOrientedPositions(code: Tiles): OrientedPoint[] {
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
}