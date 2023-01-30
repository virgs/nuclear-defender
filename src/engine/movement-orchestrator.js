import { Point } from '../math/point';
import { Tiles } from '../levels/tiles';
import { HeroMovementHandler } from '../engine/hero-movement-handler';
import { SpringMovementHandler } from '../engine/spring-movement-handler';
import { TreadmillMovementHandler } from '../engine/treadmill-movement-handler';
import { OilyFloorMovementHandler } from '../engine/oily-floor-movement-handler';
import { OneWayDoorMovementHandler } from '../engine/one-way-door-movement-handler';
export class MovementOrchestrator {
    static BLOCKER_FEATURES = new Set([Tiles.box, Tiles.hero, Tiles.wall, Tiles.empty]);
    static PUSHER_FEATURES = new Set([Tiles.hero, Tiles.treadmil, Tiles.spring]);
    strippedMap;
    movementHandlers = [];
    hero;
    boxes;
    constructor(config) {
        this.strippedMap = config.strippedMap;
        this.movementHandlers.push(new HeroMovementHandler({ coordinator: this }));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.spring, (params) => new SpringMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.oily, (params) => new OilyFloorMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.oneWayDoor, (params) => new OneWayDoorMovementHandler(params)));
        this.movementHandlers
            .push(...this.findTileOrientedPositions(Tiles.treadmil, (params) => new TreadmillMovementHandler(params)));
    }
    moveHero(direction) {
        this.moveFeature(this.hero, direction);
    }
    moveFeature(movement, direction) {
        movement.direction = direction;
        movement.currentPosition = movement.nextPosition;
        movement.nextPosition = movement.currentPosition.calculateOffset(direction);
    }
    update(input) {
        this.hero = this.initializeFeature(input.hero, Tiles.box);
        this.boxes = input.boxes
            .map(box => this.initializeFeature(box, Tiles.box));
        const actConfig = {
            hero: {
                action: input.heroAction,
                position: this.hero.nextPosition
            },
            boxes: this.boxes,
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
    canFeatureLeavePosition(move) {
        const positionFeatures = this.getFeaturesAtPosition(move.point);
        const featureMovementHandlers = this.movementHandlers
            .filter(handler => positionFeatures
            .some(feature => feature.code === handler.getTile() &&
            move.point.isEqualTo(handler.getPosition())));
        return featureMovementHandlers
            .every(handler => handler.allowLeavingMovement(move.orientation));
    }
    getFeaturesBlockingMoveIntoPosition(move) {
        const result = [];
        const dynamicFeaturesAtPosition = this.getFeaturesAtPosition(move.point);
        result.push(...dynamicFeaturesAtPosition
            .filter(feature => MovementOrchestrator.BLOCKER_FEATURES.has(feature.code))
            .map(feature => (feature)));
        const staticFeaturesAtPosition = this.getStaticFeaturesAtPosition(move.point);
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
    initializeFeature(feature, tile) {
        return {
            id: feature.id,
            currentPosition: feature.point,
            nextPosition: feature.point,
            direction: undefined,
            code: tile
        };
    }
    getFeaturesAtPosition(position) {
        let result = this.getDynamicFeaturesAtPosition(position);
        result = result.concat(this.getStaticFeaturesAtPosition(position));
        return result;
    }
    getDynamicFeaturesAtPosition(position) {
        let result = [];
        if (this.hero?.currentPosition.isEqualTo(position) || this.hero?.nextPosition.isEqualTo(position)) {
            result.push(this.hero);
        }
        this.boxes
            ?.filter(box => box.currentPosition.isEqualTo(position) || box.nextPosition.isEqualTo(position))
            .forEach(box => result.push(box));
        return result;
    }
    getStaticFeaturesAtPosition(position) {
        const result = [];
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
    findTileOrientedPositions(code, constructorFunction) {
        const handlers = [];
        this.strippedMap.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((layer, x) => layer.forEach(tile => {
            if (tile.code === code) {
                handlers.push(constructorFunction({
                    position: new Point(x, y),
                    orientation: tile.orientation,
                    coordinator: this
                }));
            }
        })));
        return handlers;
    }
}
