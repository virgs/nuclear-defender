import Phaser from 'phaser';
import {Tiles} from '../tiles/tiles';
import {Point} from '@/game/math/point';
import {BoxActor} from '@/game/actors/box-actor';
import {GameStage} from '@/game/engine/game-stage';
import {HeroActor} from '@/game/actors/hero-actor';
import {WallActor} from '@/game/actors/wall-actor';
import {SpringActor} from '@/game/actors/spring-actor';
import {TargetActor} from '@/game/actors/target-actor';
import {configuration} from '../constants/configuration';
import {TreadmillActor} from '@/game/actors/treadmill-actor';
import {OilyFloorActor} from '@/game/actors/oily-floor-actor';
import {OneWayDoorActor} from '@/game/actors/one-way-door-actor';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';
import type {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export class GameStageCreator {
    private readonly scene: Phaser.Scene;
    private readonly constructorMap: Map<Tiles, (params: any) => GameActor>;

    private readonly floorPic: Phaser.GameObjects.Image;
    private readonly floorMaskShape: Phaser.GameObjects.Graphics;
    private readonly dynamicFeatures: Map<Tiles, Point[]>;
    private readonly strippedMatrix: MultiLayeredMap;
    private readonly actorMap: Map<Tiles, GameActor[]>;
    private readonly screenPropertiesCalculator: ScreenPropertiesCalculator;

    private actorCounter: number;

    constructor(config: { solution: any; screenPropertiesCalculator: ScreenPropertiesCalculator; strippedTileMatrix: MultiLayeredMap; scene: Phaser.Scene; dynamicFeatures: Map<Tiles, Point[]> }) {
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.scene = config.scene;
        this.dynamicFeatures = config.dynamicFeatures;
        this.strippedMatrix = config.strippedTileMatrix;
        this.actorMap = GameStageCreator.initializeActorMap();

        this.actorCounter = 0;

        this.constructorMap = new Map<Tiles, (params: any) => GameActor>();
        this.constructorMap.set(Tiles.hero, params => new HeroActor(params));
        this.constructorMap.set(Tiles.box, params => new BoxActor(params));
        this.constructorMap.set(Tiles.spring, params => new SpringActor(params));
        this.constructorMap.set(Tiles.target, params => new TargetActor(params));
        this.constructorMap.set(Tiles.oily, params => new OilyFloorActor(params));
        this.constructorMap.set(Tiles.oneWayDoor, params => new OneWayDoorActor(params));
        this.constructorMap.set(Tiles.treadmil, params => new TreadmillActor(params));
        this.constructorMap.set(Tiles.wall, params => new WallActor(params));

        this.floorMaskShape = this.scene.make.graphics({});
        this.floorPic = this.scene.add.image(0, 0, configuration.floorTextureKey);
        this.floorPic.scale = 2 * configuration.gameWidth / this.floorPic.width;
        this.floorPic.setPipeline('Light2D');
        this.floorPic.setDepth(new TileDepthCalculator().calculate(Tiles.floor, -10));
    }

    public createGameStage(): GameStage {
        this.initialize();
        this.updateCoveringSituation();
        return new GameStage({
            screenPropertiesCalculator: this.screenPropertiesCalculator,
            scene: this.scene,
            strippedMap: this.strippedMatrix,
            actorMap: this.actorMap,
        });
    }

    private initialize(): void {
        this.dynamicFeatures
            .forEach((value, key) =>
                value
                    .forEach(tilePosition => this.createActor(tilePosition, {code: key})));

        this.strippedMatrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((layers: OrientedTile[], x: number) => layers
                    .forEach(tile => {
                        const tilePosition = new Point(x, y);
                        if (tile.code === Tiles.floor) {
                            this.createFloorMask(tilePosition);
                        } else {
                            this.createActor(tilePosition, tile);
                        }
                    })));

        const mask = this.floorMaskShape.createGeometryMask();
        this.floorPic!.setMask(mask);
    }

    private getTilesAround(x: number, y: number): OrientedTile[][][] {
        const contentAround: OrientedTile[][][] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            const line = [];
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const h = horizontal + x;
                const v = vertical + y;
                if (v >= 0 && h >= 0 &&
                    v < this.strippedMatrix.height &&
                    h < this.strippedMatrix.width) {
                    line.push(this.strippedMatrix.strippedFeatureLayeredMatrix[v][h]);
                } else {
                    line.push([]);
                }
            }
            contentAround.push(line);
        }

        return contentAround;
    }

    private createActor(tilePosition: Point, item: OrientedTile) {
        const tilesAround = this.getTilesAround(tilePosition.x, tilePosition.y);
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);
        if (this.constructorMap.has(item.code)) {
            const gameActor = this.constructorMap.get(item.code)!({
                scene: this.scene,
                orientation: item.orientation,
                worldPosition: worldPosition,
                tilePosition: tilePosition,
                contentAround: tilesAround,
                id: this.actorCounter++
            } as GameActorConfig);

            this.actorMap.get(item.code)!.push(gameActor);
            return gameActor;
        }
    }

    private createFloorMask(tilePosition: Point) {
        const verticalBuffer = 10;
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);

        this.floorMaskShape.beginPath();
        this.floorMaskShape.fillRectShape(new Phaser.Geom.Rectangle(worldPosition.x, worldPosition.y,
            configuration.world.tileSize.horizontal, configuration.world.tileSize.vertical + verticalBuffer));
    }

    private static initializeActorMap() {
        const indexedMap: Map<Tiles, GameActor[]> = new Map<Tiles, GameActor[]>();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as Tiles)
            .forEach(code => indexedMap.set(code, []));
        return indexedMap;
    }

    private updateCoveringSituation(): void {
        const staticActors: GameActor[] = [];
        this.actorMap
            .forEach((actors: GameActor[], tile: Tiles) => {
                if (tile !== Tiles.hero && tile !== Tiles.box) {
                    staticActors.push(...actors);
                }
            });
        const dynamicActors = this.actorMap.get(Tiles.box)!.concat(this.actorMap.get(Tiles.hero)!);
        this.strippedMatrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((_: any, x: number) => {
                    const position = new Point(x, y);
                    const dynamicActorsInPosition: GameActor[] = dynamicActors
                        .filter(actor => actor.getTilePosition().isEqualTo(position));
                    const staticActorsInPosition: GameActor[] = staticActors
                        .filter(actor => actor.getTilePosition().isEqualTo(position));
                    const actorsInPosition = dynamicActorsInPosition.concat(staticActorsInPosition);
                    actorsInPosition
                        .forEach(actor => actor.cover(actorsInPosition));
                }));

    }
}