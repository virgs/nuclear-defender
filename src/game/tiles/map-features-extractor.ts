import type Phaser from 'phaser';
import {Box} from '@/game/actors/box';
import {TileCodes} from './tile-codes';
import {Point} from '@/game/math/point';
import {Hero} from '@/game/actors/hero';
import {configuration} from '../constants/configuration';
import type {ScaleOutput} from '@/game/math/screen-properties-calculator';
import type {Mapped} from '@/game/tiles/standard-sokoban-annotation-mapper';
import {Target} from '@/game/actors/target';

const floorDepth = -1000;
const targetDepth = 0;

export class MapFeaturesExtractor {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, scale: number) {
        this.scene = scene;
        this.scale = scale;
    }

    public extractFeatures(map: Mapped, scale: ScaleOutput): { staticMap: Phaser.GameObjects.Sprite[][], hero: Hero, boxes: Box[], targets: Target[] } {
        const tiles = map.staticMap.tiles;
        const targets: Target[] = [];
        const staticMap = tiles.map((line, y) => line
            .map((tile: TileCodes, x: number) => {
                const point = new Point(x, y);
                const sprite = this.createSprite(point, tile, scale.scale);
                if (tile === TileCodes.floor) {
                    sprite.setDepth(floorDepth);
                    sprite.setPipeline('Light2D');
                    //needed because target is not dynamic like a box (that creates its floor at the annotation extractor)
                } else if (tile === TileCodes.target) {
                    targets.push(new Target({scene: this.scene, sprite: sprite, tilePosition: point}));
                    const floorBehind = this.createSprite(point, TileCodes.floor, scale.scale);
                    floorBehind.setDepth(floorDepth);
                    floorBehind.setPipeline('Light2D');
                    sprite.setDepth(targetDepth);
                }
                return sprite;
            }));
        return {
            staticMap: staticMap,
            targets: targets,
            hero: new Hero({scene: this.scene, sprite: this.createSprite(map.hero!, TileCodes.hero, scale.scale), tilePosition: map.hero!}),
            boxes: map.boxes
                .map(box => {
                    //TODO add an id to each box
                    const boxActor = new Box({scene: this.scene, sprite: this.createSprite(box, TileCodes.box, scale.scale), tilePosition: box});
                    boxActor.setIsOnTarget(tiles[box.y][box.x] === TileCodes.target);
                    return boxActor;
                })
        };

    }

    private createSprite(point: Point, tile: TileCodes, scale: number): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(point.x * configuration.world.tileSize.horizontal,
            point.y * configuration.world.tileSize.vertical, configuration.tiles.spriteSheetKey, tile);
        sprite.scale = scale;
        sprite.setOrigin(0);
        sprite.setDepth(sprite.y);
        return sprite;
    }

}