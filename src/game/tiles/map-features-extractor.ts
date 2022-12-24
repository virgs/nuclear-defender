import type Phaser from 'phaser';
import {Box} from '@/game/actors/box';
import {TileCodes} from './tile-codes';
import {Hero} from '@/game/actors/hero';
import type {Point} from '@/game/math/point';
import {configuration} from '../constants/configuration';
import type {ScaleOutput} from '@/game/math/screen-properties-calculator';
import type {Mapped} from '@/game/tiles/standard-sokoban-annotation-mapper';

export class MapFeaturesExtractor {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, scale: number) {
        this.scene = scene;
        this.scale = scale;
    }

    public extractFeatures(map: Mapped, scale: ScaleOutput): { staticMap: Phaser.GameObjects.Sprite[][], hero: Hero, boxes: Box[] } {
        return {
            staticMap: map.staticMap.tiles.map((line, y) => line
                .map((tile: TileCodes, x: number) => {
                    const sprite = this.createSprite({x, y}, tile, scale.scale);
                    if (tile === TileCodes.floor) {
                        sprite.setDepth(0);
                    } else if (tile === TileCodes.target) {
                        const floorBehind = this.createSprite({x, y}, TileCodes.floor, scale.scale);
                        floorBehind.setDepth(0);
                    }
                    return sprite;
                })),
            hero: new Hero({scene: this.scene, sprite: this.createSprite(map.hero!, TileCodes.hero, scale.scale), tilePosition: map.hero!}),
            boxes: map.boxes
                .map(box => {
                    const boxActor = new Box({scene: this.scene, sprite: this.createSprite(box, TileCodes.box, scale.scale), tilePosition: box});
                    boxActor.setIsOnTarget(map.staticMap.tiles[box.y][box.x] === TileCodes.target);
                    return boxActor;
                })
        };

    }

    private createSprite(point: Point, tile: TileCodes, scale: number): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(point.x * configuration.world.tileSize.horizontal,
            point.y * configuration.world.tileSize.vertical, configuration.spriteSheetKey, tile);
        sprite.scale = scale;
        sprite.setOrigin(0);
        sprite.setDepth(sprite.y);
        return sprite;
    }

}