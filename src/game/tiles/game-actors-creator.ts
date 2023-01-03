import {Tiles} from './tiles';
import {Point} from '@/game/math/point';
import {BoxActor} from '@/game/actors/box-actor';
import {HeroActor} from '@/game/actors/hero-actor';
import {FloorBuilder} from '@/game/tiles/floor-builder';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '../constants/configuration';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';
import {TargetActor} from '@/game/actors/target-actor';
import {OilyFloorActor} from '@/game/actors/oily-floor-actor';
import {OneWayDoorActor} from '@/game/actors/one-way-door-actor';

export type TileMap = {
    multiLayeredStrippedMap: MultiLayeredMap;
    indexedMap: Map<Tiles, GameActor[]>;
};

export class GameActorsCreator {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;
    private readonly strippedLayeredMap: MultiLayeredMap;
    private readonly constructorMap: Map<Tiles, (params: any) => GameActor>;
    private readonly indexedMap: Map<Tiles, GameActor[]>;
    private readonly featuresToStripOff: Tiles[];
    private actorCounter: number;

    constructor(scene: Phaser.Scene, scale: number, map: MultiLayeredMap) {
        this.scene = scene;
        this.scale = scale;
        this.strippedLayeredMap = map;
        this.strippedLayeredMap.layeredTileMatrix = JSON.parse(JSON.stringify(map.layeredTileMatrix)) as OrientedTile[][][];
        this.indexedMap = new Map<Tiles, GameActor[]>();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as Tiles)
            .forEach(code => this.indexedMap.set(code, []));
        this.featuresToStripOff = [Tiles.hero, Tiles.box];

        this.actorCounter = 0;
        this.constructorMap = new Map<Tiles, (params: any) => GameActor>();
        this.constructorMap.set(Tiles.hero, params => new HeroActor(params));
        this.constructorMap.set(Tiles.box, params => new BoxActor(params));
        this.constructorMap.set(Tiles.target, params => new TargetActor(params));
        this.constructorMap.set(Tiles.oily, params => new OilyFloorActor(params));
        this.constructorMap.set(Tiles.oneWayDoor, params => new OneWayDoorActor(params));
    }

    public create(): TileMap {
        this.strippedLayeredMap.layeredTileMatrix
            .forEach((line, y) => line
                .forEach((layers: OrientedTile[], x: number, editableLine) => {
                    editableLine[x] = layers
                        .filter(item => {
                            const tilePosition = new Point(x, y);
                            const sprite = this.createSprite(tilePosition, item.code);
                            if (this.constructorMap.get(item.code)) {
                                const gameActor = this.constructorMap.get(item.code)!({
                                    scene: this.scene,
                                    sprite: sprite,
                                    tilePosition: tilePosition,
                                    id: this.actorCounter++
                                });
                                this.indexedMap.get(item.code)!.push(gameActor);
                            }
                            return !this.featuresToStripOff.includes(item.code);
                        });
                }));

        new FloorBuilder(this.scene, this.strippedLayeredMap)
            .createMask();

        return {
            multiLayeredStrippedMap: this.strippedLayeredMap,
            indexedMap: this.indexedMap,
        };

    }

    private createSprite(point: Point, tile: Tiles): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(point.x * configuration.world.tileSize.horizontal,
            point.y * configuration.world.tileSize.vertical,
            configuration.tiles.spriteSheetKey, tile);
        sprite.scale = this.scale;
        sprite.setOrigin(0);
        sprite.setDepth(new TileDepthCalculator().calculate(tile, sprite.y));
        sprite.setPipeline('Light2D');
        return sprite;
    }

}