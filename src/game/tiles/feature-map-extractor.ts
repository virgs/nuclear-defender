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

export type FeatureMap = {
    staticMap: Phaser.GameObjects.Sprite[][];
    boxes: Box[];
    walls: Phaser.GameObjects.Sprite[];
    floors: Phaser.GameObjects.Sprite[];
    hero: Hero;
    targets: Target[];
};

export class FeatureMapExtractor {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, scale: number) {
        this.scene = scene;
        this.scale = scale;
    }

    public extractFeatures(map: Mapped, scale: ScaleOutput): FeatureMap {
        const tiles = map.staticMap.tiles;
        const targets: Target[] = [];
        const hero = this.getHero(map, scale);
        const boxes = this.getBoxes(map, scale, tiles);
        const walls: Phaser.GameObjects.Sprite[] = [];
        const floors: Phaser.GameObjects.Sprite[] = [];

        const staticMap = tiles.map((line, y) => line
            .map((tile: TileCodes, x: number) => {
                const position = new Point(x, y);
                const sprite = this.createSprite(position, tile, scale.scale);
                if (tile === TileCodes.floor) {
                    sprite.setDepth(floorDepth);
                    floors.push(sprite);
                    //needed because target is not dynamic like a box (that creates its floor at the annotation extractor)
                } else if (tile === TileCodes.target) {
                    const target = new Target({scene: this.scene, sprite: sprite, tilePosition: position});
                    targets.push(target);
                    if (boxes
                        .some(box => box.getTilePosition().equal(position))) {
                        target.cover();
                    }

                    const floorBehind = this.createSprite(position, TileCodes.floor, scale.scale);
                    floorBehind.setDepth(floorDepth);
                    floors.push(floorBehind);
                    sprite.setDepth(targetDepth);
                } else if (tile === TileCodes.wall) {
                    walls.push(sprite);
                }
                return sprite;
            }));
        return {
            staticMap: staticMap,
            targets: targets,
            hero: hero,
            walls: walls,
            floors: floors,
            boxes: boxes
        };

    }

    private getHero(map: Mapped, scale: ScaleOutput) {
        return new Hero({scene: this.scene, sprite: this.createSprite(map.hero!, TileCodes.hero, scale.scale), tilePosition: map.hero!});
    }

    private getBoxes(map: Mapped, scale: ScaleOutput, tiles: TileCodes[][]) {
        return map.boxes
            .map(box => {
                //TODO add an id to each box
                const boxActor = new Box({scene: this.scene, sprite: this.createSprite(box, TileCodes.box, scale.scale), tilePosition: box});
                boxActor.setIsOnTarget(tiles[box.y][box.x] === TileCodes.target);
                return boxActor;
            });
    }

    private createSprite(point: Point, tile: TileCodes, scale: number): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite((point.x + 1) * configuration.world.tileSize.horizontal,
            (point.y + 1) * configuration.world.tileSize.vertical, configuration.tiles.spriteSheetKey, tile);
        sprite.scale = scale;
        sprite.setOrigin(0.5);
        sprite.setDepth(sprite.y);
        sprite.setPipeline('Light2D');
        return sprite;
    }

}