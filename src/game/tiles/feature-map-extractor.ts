import {Tiles} from './tiles';
import type Phaser from 'phaser';
import {Box} from '@/game/actors/box';
import {Point} from '@/game/math/point';
import {Hero} from '@/game/actors/hero';
import {Target} from '@/game/actors/target';
import {Spring} from '@/game/actors/spring';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '../constants/configuration';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {StaticMap, TileIdentification} from '@/game/tiles/standard-sokoban-annotation-translator';

export type FeatureMap = {
    featurelessMap: StaticMap;
    boxes: Box[];
    hero: Hero;
    targets: Target[];
};

export class FeatureMapExtractor {
    private readonly scale: number;
    private readonly scene: Phaser.Scene;
    private readonly featurelessMap: StaticMap;
    private actorCounter: number;

    constructor(scene: Phaser.Scene, scale: number, map: StaticMap) {
        this.scene = scene;
        this.scale = scale;
        this.featurelessMap = map;
        this.featurelessMap.tiles = JSON.parse(JSON.stringify(map.tiles)) as TileIdentification[][];
        this.actorCounter = 0;
    }

    public extract(): FeatureMap {
        const hero = this.extractHero()!;
        const boxes = this.extractBoxes();
        const targets = this.detectTargets(boxes);
        const springs = this.detectSprings();

        this.addFloors([...targets, ...springs] as GameActor[]);

        const featurelessMap: StaticMap = {
            tiles: this.featurelessMap.tiles,
            width: this.featurelessMap.width,
            height: this.featurelessMap.height
        };
        return {
            featurelessMap: featurelessMap,
            targets: targets,
            hero: hero,
            boxes: boxes
        };

    }

    private extractHero(): Hero | undefined {
        let hero: Hero | undefined = undefined;
        this.featurelessMap.tiles = this.featurelessMap.tiles
            .map((line, y) => line
                .map((tile: TileIdentification, x: number) => {
                    if (tile.code === Tiles.hero || tile.code === Tiles.heroOnTarget) {
                        const tilePosition = new Point(x, y);
                        const heroSprite = this.createSprite(tilePosition, Tiles.hero);
                        hero = new Hero({scene: this.scene, sprite: heroSprite, tilePosition: tilePosition, id: this.actorCounter++});
                        return {
                            code: tile.code === Tiles.hero ? Tiles.floor : Tiles.target,
                            orientation: tile.orientation
                        };
                    }
                    return tile;
                }));
        return hero;
    }

    private extractBoxes(): Box[] {
        const boxes: Box[] = [];
        this.featurelessMap.tiles = this.featurelessMap.tiles
            .map((line, y) => line
                .map((tile: TileIdentification, x: number) => {
                    if (tile.code === Tiles.box || tile.code === Tiles.boxOnTarget) {
                        const tilePosition = new Point(x, y);
                        const sprite = this.createSprite(tilePosition, Tiles.box);
                        boxes.push(new Box({scene: this.scene, sprite: sprite, tilePosition: tilePosition, id: this.actorCounter++}));
                        return {
                            code: tile.code === Tiles.box ? Tiles.floor : Tiles.target,
                            orientation: tile.orientation
                        };
                    }
                    return tile;
                }));
        return boxes;
    }

    private detectTargets(boxes: Box[]): Target[] {
        const targets: Target[] = [];
        this.featurelessMap.tiles = this.featurelessMap.tiles
            .map((line, y) => line
                .map((tile: TileIdentification, x: number) => {
                    if (tile.code === Tiles.target) {
                        const tilePosition = new Point(x, y);
                        const sprite = this.createSprite(tilePosition, Tiles.target);
                        const target = new Target({
                            scene: this.scene,
                            sprite: sprite,
                            tilePosition: tilePosition,
                            boxes: boxes,
                            id: this.actorCounter++
                        });
                        targets.push(target);
                    }
                    return tile;
                }));
        return targets;
    }

    private detectSprings() {
        const springs: Spring[] = [];
        this.featurelessMap.tiles = this.featurelessMap.tiles
            .map((line, y) => line
                .map((tile: TileIdentification, x: number) => {
                    if (tile.code === Tiles.spring) {
                        const tilePosition = new Point(x, y);
                        const sprite = this.createSprite(tilePosition, Tiles.spring);
                        const spring = new Spring({
                            scene: this.scene,
                            sprite: sprite,
                            tilePosition: tilePosition,
                            orientation: tile.orientation!,
                            id: this.actorCounter++
                        });
                        springs.push(spring);
                    }
                    return tile;
                }));
        return springs;
    }

    private createSprite(point: Point, tile: Tiles): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite((point.x + 1) * configuration.world.tileSize.horizontal,
            (point.y + 1) * configuration.world.tileSize.vertical, configuration.tiles.spriteSheetKey, tile);
        sprite.scale = this.scale;
        sprite.setOrigin(0.5);
        sprite.setDepth(new TileDepthCalculator().calculate(tile, sprite.y));
        sprite.setPipeline('Light2D');
        return sprite;
    }

    private addFloors(staticActors: GameActor[]) {
        //(targets and stuff).. They hide floors behind them
        staticActors
            .forEach(actor => this.createSprite(actor.getTilePosition(), Tiles.floor));

        //Every floor in the map
        this.featurelessMap.tiles
            .forEach((line, y) => line
                .forEach((tile: TileIdentification, x: number) => {
                    if (tile.code !== Tiles.target && tile.code !== Tiles.spring) { //it was created in the staticActors loop
                        const tilePosition = new Point(x, y);
                        this.createSprite(tilePosition, tile.code);
                    }
                }));
    }
}