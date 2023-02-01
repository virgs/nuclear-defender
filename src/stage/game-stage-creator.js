import { Point } from '@/math/point';
import { Tiles } from '@/levels/tiles';
import { BoxActor } from './box-actor';
import { GameStage } from './game-stage';
import { HeroActor } from './hero-actor';
import { WallActor } from './wall-actor';
import { SpringActor } from './spring-actor';
import { TargetActor } from './target-actor';
import { FloorActor } from '@/stage/floor-actor';
import { TreadmillActor } from './treadmill-actor';
import { OilyFloorActor } from './oily-floor-actor';
import { OneWayDoorActor } from './one-way-door-actor';
import { MapEditorCursorFollower } from './map-editor-cursor-follower';
import { configuration } from "@/constants/configuration";
export class GameStageCreator {
    scene;
    constructorMap;
    dynamicFeatures;
    strippedMatrix;
    floorActor;
    actorMap;
    screenPropertiesCalculator;
    playable;
    actorCounter;
    constructor(config) {
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.scene = config.scene;
        this.playable = config.playable;
        this.dynamicFeatures = config.dynamicFeatures;
        this.strippedMatrix = config.strippedTileMatrix;
        this.actorMap = GameStageCreator.initializeActorMap();
        this.actorCounter = 0;
        this.constructorMap = new Map();
        this.constructorMap.set(Tiles.hero, params => new HeroActor(params));
        this.constructorMap.set(Tiles.box, params => new BoxActor(params));
        this.constructorMap.set(Tiles.spring, params => new SpringActor(params));
        this.constructorMap.set(Tiles.target, params => new TargetActor(params));
        this.constructorMap.set(Tiles.oily, params => new OilyFloorActor(params));
        this.constructorMap.set(Tiles.oneWayDoor, params => new OneWayDoorActor(params));
        this.constructorMap.set(Tiles.treadmil, params => new TreadmillActor(params));
        this.constructorMap.set(Tiles.wall, params => new WallActor(params));
        this.floorActor = new FloorActor(config);
    }
    createGameStage() {
        this.initialize();
        this.updateCoveringSituation();
        return new GameStage({
            screenPropertiesCalculator: this.screenPropertiesCalculator,
            scene: this.scene,
            strippedMap: this.strippedMatrix,
            actorMap: this.actorMap,
        });
    }
    initialize() {
        this.dynamicFeatures
            .forEach((value, key) => value
            .forEach(tilePosition => this.createActor(tilePosition, { code: key })));
        this.strippedMatrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((layers, x) => layers
            .forEach(tile => {
            const tilePosition = new Point(x, y);
            if (tile.code === Tiles.floor) {
                this.floorActor.addTileMask(tilePosition);
            }
            else {
                this.createActor(tilePosition, tile);
            }
        })));
        this.floorActor.createMask();
        if (!this.playable) {
            new MapEditorCursorFollower({
                scene: this.scene,
                screenPropertiesCalculator: this.screenPropertiesCalculator,
            });
        }
    }
    getTilesAround(x, y) {
        const contentAround = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            const line = [];
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const h = horizontal + x;
                const v = vertical + y;
                if (v >= 0 && h >= 0 &&
                    v < this.strippedMatrix.height &&
                    h < this.strippedMatrix.width) {
                    line.push(this.strippedMatrix.strippedFeatureLayeredMatrix[v][h]);
                }
                else {
                    line.push([]);
                }
            }
            contentAround.push(line);
        }
        return contentAround;
    }
    createActor(tilePosition, item) {
        const tilesAround = this.getTilesAround(tilePosition.x, tilePosition.y);
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);
        if (this.constructorMap.has(item.code)) {
            const config = {
                assetSheetKey: configuration.tiles.spriteSheetKey,
                playable: this.playable,
                code: item.code,
                scene: this.scene,
                orientation: item.orientation,
                worldPosition: worldPosition,
                tilePosition: tilePosition,
                contentAround: tilesAround,
                id: this.actorCounter++
            };
            const gameActor = this.constructorMap.get(item.code)(config);
            this.actorMap.get(item.code).push(gameActor);
            return gameActor;
        }
        return undefined;
    }
    static initializeActorMap() {
        const indexedMap = new Map();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key))
            .forEach(code => indexedMap.set(code, []));
        return indexedMap;
    }
    updateCoveringSituation() {
        const staticActors = [];
        this.actorMap
            .forEach((actors, tile) => {
            if (tile !== Tiles.hero && tile !== Tiles.box) {
                staticActors.push(...actors);
            }
        });
        const dynamicActors = this.actorMap.get(Tiles.box).concat(this.actorMap.get(Tiles.hero));
        this.strippedMatrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((_, x) => {
            const position = new Point(x, y);
            const dynamicActorsInPosition = dynamicActors
                .filter(actor => actor.getTilePosition().isEqualTo(position));
            const staticActorsInPosition = staticActors
                .filter(actor => actor.getTilePosition().isEqualTo(position));
            const actorsInPosition = dynamicActorsInPosition.concat(staticActorsInPosition);
            actorsInPosition
                .forEach(actor => actor.cover(actorsInPosition));
        }));
    }
}
