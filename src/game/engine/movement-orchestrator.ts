import {Point} from '../math/point';
import {Tiles} from '../levels/tiles';
import type {Actions} from '../constants/actions';
import type {Directions} from '../constants/directions';
import {HeroMovementHandler} from '@/game/engine/hero-movement-handler';
import {SpringMovementHandler} from '@/game/engine/spring-movement-handler';
import {TreadmillMovementHandler} from '@/game/engine/treadmill-movement-handler';
import {OilyFloorMovementHandler} from '@/game/engine/oily-floor-movement-handler';
import type {FeatureMovementHandler} from '@/game/engine/feature-movement-handler';
import {OneWayDoorMovementHandler} from '@/game/engine/one-way-door-movement-handler';
import type {MultiLayeredMap} from '@/game/levels/standard-sokoban-annotation-tokennizer';

export type Movement = {
    id: number,
    currentPosition: Point,
    nextPosition: Point,
    direction: Directions | undefined,
    code: Tiles
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
    hero: { id: number, point: Point };
    heroAction: Actions;
    boxes: { id: number, point: Point }[];
    lastActionResult?: MovementOrchestratorOutput;
};

export class MovementOrchestrator {
    private static readonly BLOCKER_FEATURES: Set<Tiles> = new Set<Tiles>([Tiles.box, Tiles.hero, Tiles.wall, Tiles.empty]);
    public static readonly PUSHER_FEATURES: Set<Tiles> = new Set<Tiles>([Tiles.hero, Tiles.treadmil, Tiles.spring]);

    private readonly strippedMap: MultiLayeredMap;
    private readonly movementHandlers: FeatureMovementHandler[] = [];

    private hero?: Movement;
    private boxes?: Movement[];

    constructor(config: { strippedMap: MultiLayeredMap }) {
        this.strippedMap = config.strippedMap;
        this.movementHandlers.push(new HeroMovementHandler({coordinator: this}));

        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.spring, (params) => new SpringMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.oily, (params) => new OilyFloorMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.oneWayDoor, (params) => new OneWayDoorMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.treadmil, (params) => new TreadmillMovementHandler(params)));
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
        this.hero = this.initializeFeature(input.hero, Tiles.box);
        this.boxes = input.boxes
            .map(box => this.initializeFeature(box, Tiles.box));
        const actConfig = {
            hero:
                {
                    action: input.heroAction,
                    position: this.hero!.nextPosition
                },
            boxes: this.boxes!,
            lastActionResult: input.lastActionResult
        };
        const mapChanged = this.movementHandlers
            .reduce((changed, handler) => {
                const act = handler.act(actConfig);
                return act || changed;
            }, false);
        return {
            hero: this.hero,
            boxes: this.boxes,
            mapChanged: mapChanged
        };
    }

    public canFeatureLeavePosition(move: OrientedPoint): boolean {
        const positionFeatures = this.getFeaturesAtPosition(move.point);
        const featureMovementHandlers = this.movementHandlers
            .filter(handler => positionFeatures
                .some(feature =>
                    feature.code === handler.getTile() &&
                    move.point.isEqualTo(handler.getPosition())));
        return featureMovementHandlers
            .every(handler => handler.allowLeavingMovement(move.orientation));
    }

    public getFeaturesBlockingMoveIntoPosition(move: OrientedPoint): Movement[] {
        const result: Movement[] = [];
        const dynamicFeaturesAtPosition: Movement[] = this.getFeaturesAtPosition(move.point);
        result.push(...dynamicFeaturesAtPosition
            .filter(feature => MovementOrchestrator.BLOCKER_FEATURES.has(feature.code))
            .map(feature => (feature)));

        const staticFeaturesAtPosition: Movement[] = this.getStaticFeaturesAtPosition(move.point);
        result.push(...this.movementHandlers
            .filter(handler => staticFeaturesAtPosition
                .some(feature => feature.code === handler.getTile() && move.point.isEqualTo(handler.getPosition())))
            .filter(handler => !handler.allowEnteringMovement(move.orientation))
            .map(handler => {
                return ({
                    code: handler.getTile(),
                    direction: handler.getOrientation(),
                    nextPosition: move.point,
                    currentPosition: move.point,
                    id: -1
                });
            }));
        return [...new Set(result)];
    }

    private initializeFeature(feature: { id: number; point: Point }, tile: Tiles): Movement {
        return {
            id: feature.id,
            currentPosition: feature.point,
            nextPosition: feature.point,
            direction: undefined,
            code: tile
        };
    }

    public getFeaturesAtPosition(position: Point): Movement[] {
        let result = this.getDynamicFeaturesAtPosition(position);
        result = result.concat(this.getStaticFeaturesAtPosition(position));
        return result;
    }

    private getDynamicFeaturesAtPosition(position: Point) {
        let result: Movement[] = [];
        if (this.hero?.currentPosition.isEqualTo(position) || this.hero?.nextPosition.isEqualTo(position)) {
            result.push(this.hero);
        }
        this.boxes
            ?.filter(box => box.currentPosition.isEqualTo(position) || box.nextPosition.isEqualTo(position))
            .forEach(box => result.push(box));
        return result;
    }

    private getStaticFeaturesAtPosition(position: Point): Movement[] {
        const result: Movement[] = [];
        let id = 0;
        if (position.x < this.strippedMap.width && position.y < this.strippedMap.height
            && position.x >= 0 && position.y >= 0) {
            const tiles = this.strippedMap.strippedFeatureLayeredMatrix[position.y][position.x];
            result.push(...tiles
                .map(tile => ({
                    code: tile.code,
                    currentPosition: position,
                    direction: tile.orientation,
                    id: ++id,
                    nextPosition: position
                })));
        }
        return result;
    }

    private findTileOrientedPositions(code: Tiles, constructorFunction: (params: any) => FeatureMovementHandler): FeatureMovementHandler[] {
        const handlers: FeatureMovementHandler[] = [];
        this.strippedMap.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((layer, x) =>
                    layer.forEach(tile => {
                        if (tile.code === code) {
                            handlers.push(constructorFunction({
                                position: new Point(x, y),
                                orientation: tile.orientation!,
                                coordinator: this
                            }));
                        }
                    })));
        return handlers;
    }
}