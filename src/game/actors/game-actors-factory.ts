import {Tiles} from '../tiles/tiles';
import {Point} from '@/game/math/point';
import {BoxActor} from '@/game/actors/box-actor';
import {HeroActor} from '@/game/actors/hero-actor';
import {TargetActor} from '@/game/actors/target-actor';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';
import {configuration} from '../constants/configuration';
import {OilyFloorActor} from '@/game/actors/oily-floor-actor';
import {OneWayDoorActor} from '@/game/actors/one-way-door-actor';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';
import Phaser from 'phaser';
import {SpringActor} from '@/game/actors/spring-actor';
import {TreadmillActor} from '@/game/actors/treadmill-actor';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';

export class GameActorsFactory {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;
    private readonly constructorMap: Map<Tiles, (params: any) => GameActor>;

    private readonly floorPic: Phaser.GameObjects.Image;
    private readonly floorMaskShape: Phaser.GameObjects.Graphics;
    private readonly dynamicFeatures: Map<Tiles, Point[]>;
    private readonly matrix: MultiLayeredMap;
    private readonly actorMap: Map<Tiles, GameActor[]>;
    private readonly screenPropertiesCalculator: ScreenPropertiesCalculator;

    private actorCounter: number;

    constructor(config: { matrix: MultiLayeredMap; scene: Phaser.Scene; dynamicFeatures: Map<Tiles, Point[]> }) {
        this.screenPropertiesCalculator = new ScreenPropertiesCalculator(config.matrix);
        this.scene = config.scene;
        this.scale = this.screenPropertiesCalculator.getScale();
        this.dynamicFeatures = config.dynamicFeatures;
        this.matrix = config.matrix;
        this.actorMap = GameActorsFactory.initializeActorMap();

        this.actorCounter = 0;

        this.constructorMap = new Map<Tiles, (params: any) => GameActor>();
        this.constructorMap.set(Tiles.hero, params => new HeroActor(params));
        this.constructorMap.set(Tiles.box, params => new BoxActor(params));
        this.constructorMap.set(Tiles.spring, params => new SpringActor(params));
        this.constructorMap.set(Tiles.target, params => new TargetActor(params));
        this.constructorMap.set(Tiles.oily, params => new OilyFloorActor(params));
        this.constructorMap.set(Tiles.oneWayDoor, params => new OneWayDoorActor(params));
        this.constructorMap.set(Tiles.treadmil, params => new TreadmillActor(params));

        this.floorMaskShape = this.scene.make.graphics({});
        this.floorPic = this.scene.add.image(0, 0, configuration.floorTextureKey);
        this.floorPic.scale = 2 * configuration.gameWidth / this.floorPic.width;
        this.floorPic.setPipeline('Light2D');
        this.floorPic.setDepth(new TileDepthCalculator().calculate(Tiles.floor, -10));
    }

    public create(): Map<Tiles, GameActor[]> {
        this.dynamicFeatures
            .forEach((value, key) =>
                value
                    .forEach(tilePosition => this.createActor(tilePosition, {code: key})));

        this.matrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((layers: OrientedTile[], x: number) => layers
                    .forEach(item => {
                        const tilePosition = new Point(x, y);
                        if (item.code === Tiles.floor) {
                            this.createFloorMask(tilePosition);
                        } else {
                            this.createActor(tilePosition, item);
                        }

                    })));

        const mask = this.floorMaskShape.createGeometryMask();
        // mask.invertAlpha = true
        this.floorPic!.setMask(mask);

        return this.actorMap;
    }

    private createActor(tilePosition: Point, item: OrientedTile) {
        const sprite = this.createSprite(tilePosition, item.code);
        if (this.constructorMap.get(item.code)) {
            const gameActor = this.constructorMap.get(item.code)!({
                scene: this.scene,
                orientation: item.orientation,
                sprite: sprite,
                screenPropertiesCalculator: this.screenPropertiesCalculator,
                tilePosition: tilePosition,
                id: this.actorCounter++
            } as GameActorConfig);
            this.actorMap.get(item.code)!.push(gameActor);
        }
    }

    private createSprite(point: Point, tile: Tiles): Phaser.GameObjects.Sprite {
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(point);
        const sprite = this.scene.add.sprite(worldPosition.x,
            worldPosition.y,
            configuration.tiles.spriteSheetKey, tile);
        sprite.scale = this.scale;
        sprite.setOrigin(0);
        sprite.setDepth(new TileDepthCalculator().calculate(tile, sprite.y));
        sprite.setPipeline('Light2D');
        return sprite;
    }

    private createFloorMask(tilePosition: Point) {
        // this.floorMaskShape.fillStyle(0xFFFFFF);
        const worldPosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(tilePosition);

        this.floorMaskShape.beginPath();
        this.floorMaskShape.fillRectShape(new Phaser.Geom.Rectangle(worldPosition.x, worldPosition.y,
            configuration.world.tileSize.horizontal, configuration.world.tileSize.vertical));
    }

    private static initializeActorMap() {
        const indexedMap: Map<Tiles, GameActor[]> = new Map<Tiles, GameActor[]>();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as Tiles)
            .forEach(code => indexedMap.set(code, []));
        return indexedMap;
    }

}