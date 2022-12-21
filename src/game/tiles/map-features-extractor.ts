import type Phaser from 'phaser';
import {TileCodes} from './tile-codes';
import type {Point} from '../math/point';
import {configuration} from '../constants/configuration';

//TODO extract each to its specific GameActor receiving its sprite in the constructor (to better handle future interactions)
type SearchMapType = { tile: TileCodes, keys: TileCodes[], replacement?: TileCodes };
const searchMap: SearchMapType[] = [
    {
        tile: TileCodes.empty,
        keys: [TileCodes.empty]
    },
    {
        tile: TileCodes.floor,
        keys: [TileCodes.floor]
    },
    {
        tile: TileCodes.wall,
        keys: [TileCodes.wall]
    },
    {
        tile: TileCodes.box,
        keys: [TileCodes.box]
    },
    {
        tile: TileCodes.boxOnTarget,
        keys: [TileCodes.box, TileCodes.target],
        replacement: TileCodes.target
    },
    {
        tile: TileCodes.target,
        keys: [TileCodes.target]
    },
    {
        tile: TileCodes.hero,
        keys: [TileCodes.hero]
    },
    {
        tile: TileCodes.heroOnTarget,
        keys: [TileCodes.hero, TileCodes.target],
        replacement: TileCodes.target
    }
];

export class MapFeaturesExtractor {
    public extractFeatures(scene: Phaser.Scene, mapLayer: Phaser.Tilemaps.TilemapLayer): Map<TileCodes, Phaser.GameObjects.Sprite[]> {
        return searchMap
            .reduce((acc, item) => {
                for (let [index, tileCode] of item.keys.entries()) {
                    const {replacements, frame} = this.getFrames(index, item);
                    const features: Phaser.GameObjects.Sprite[] =
                        this.searchFeature(mapLayer, item.tile, replacements, frame)
                            .reduce((acc, item) => acc.concat(item), [] as Phaser.GameObjects.Sprite[]);
                    if (acc.get(tileCode)) {
                        acc.set(tileCode, acc.get(tileCode)!.concat(features));
                    } else {
                        acc.set(tileCode, features);
                    }
                }
                return acc as Map<TileCodes, Phaser.GameObjects.Sprite[]>;
            }, new Map<TileCodes, Phaser.GameObjects.Sprite[]>());
    }

    private getFrames(index: number, item: SearchMapType) {
        const lastIndex = index === item.keys.length - 1;
        let replacements: TileCodes | null = null;
        let frame: TileCodes | undefined = item.tile;
        if (lastIndex) {
            replacements = item.tile === TileCodes.empty ? TileCodes.empty : TileCodes.floor;
            if (item.keys.length > 1) {
                frame = item.replacement;
            }
        }
        return {replacements, frame};
    }

    private searchFeature(mapLayer: Phaser.Tilemaps.TilemapLayer, tile: TileCodes, replacements: null | TileCodes.empty | TileCodes.floor, frame: TileCodes | undefined):
        Phaser.GameObjects.Sprite[] {
        return mapLayer.createFromTiles(tile + 1, replacements as any, {
            key: configuration.spriteSheetKey,
            frame: frame
        })
            .map(item => {
                item.setOrigin(0);
                item.setDepth(item.y);
                return item;
            });
    }

    private getTileOfPosition(position: Point, map: Map<TileCodes, Phaser.GameObjects.Sprite[]>): TileCodes | undefined {
        for (let [key, value] of map.entries()) {
            if (value.some(sprite => position.x === sprite.x && position.y === sprite.y)) {
                return key;
            }
        }
        return undefined;
    }

    // private wrapFloors(scene: Phaser.Scene, tileMap: Map<TileCode, Phaser.GameObjects.Sprite[]>): Map<TileCode, Phaser.GameObjects.Sprite[]> {
    //                     console.log(tileMap.get(TileCode.floor))
    //     tileMap.get(TileCode.floor)
    //         .map(floor => {
    //             getPointsAround(floor, {x: configuration.horizontalTileSize, y: configuration.verticalTileSize})
    //                 .forEach(point => {
    //                     const tileOfPosition = this.getTileOfPosition(point, tileMap);
    //                     if (tileOfPosition !== undefined || tileOfPosition === TileCode.empty) {
    //                         tileMap.get(TileCode.wall)
    //                             .push(new Sprite(scene, point.x, point.y, configuration.tilemapKey, TileCode.wall));
    //                     }
    //                 });
    //         });
    //
    //     //TODO if an empty tile is around or 9 walls are around
    //     //remove it from the floor features tileMap
    //     //repeat it
    //
    //     return tileMap;
    // }
}