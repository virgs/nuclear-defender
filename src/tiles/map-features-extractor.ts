import Phaser from 'phaser';
import {Point} from '../math/point';
import {TileCode} from './tile-code';
import {configuration} from '../constants/configuration';

//TODO extract each to its specific GameActor receiving its sprite in the constructor (to better handle future interactions)
type SearchMapType = { tile: TileCode, keys: TileCode[], replacement?: TileCode };
const searchMap: SearchMapType[] = [
    {
        tile: TileCode.empty,
        keys: [TileCode.empty]
    },
    {
        tile: TileCode.floor,
        keys: [TileCode.floor]
    },
    {
        tile: TileCode.wall,
        keys: [TileCode.wall]
    },
    {
        tile: TileCode.box,
        keys: [TileCode.box]
    },
    {
        tile: TileCode.boxOnTarget,
        keys: [TileCode.box, TileCode.target],
        replacement: TileCode.target
    },
    {
        tile: TileCode.target,
        keys: [TileCode.target]
    },
    {
        tile: TileCode.hero,
        keys: [TileCode.hero]
    },
    {
        tile: TileCode.heroOnTarget,
        keys: [TileCode.hero, TileCode.target],
        replacement: TileCode.target
    }
];

export class MapFeaturesExtractor {
    public extractFeatures(scene: Phaser.Scene, mapLayer: Phaser.Tilemaps.TilemapLayer): Map<TileCode, Phaser.GameObjects.Sprite[]> {
        return searchMap
            .reduce((acc, item) => {
                for (let [index, tileCode] of item.keys.entries()) {
                    const {replacements, frame} = this.getFrames(index, item);
                    const features: Phaser.GameObjects.Sprite[] =
                        this.searchFeature(mapLayer, item.tile, replacements, frame)
                            .reduce((acc, item) => acc.concat(item), []);
                    if (tileCode === TileCode.empty) {
                        console.log(features.length, index, item);
                    }
                    if (acc.get(tileCode)) {
                        acc.set(tileCode, acc.get(tileCode).concat(features));
                    } else {
                        acc.set(tileCode, features);
                    }
                }
                return acc;
            }, new Map<TileCode, Phaser.GameObjects.Sprite[]>());
    }

    private getFrames(index: number, item: SearchMapType) {
        const lastIndex = index === item.keys.length - 1;
        let replacements: TileCode = null;
        let frame: TileCode = item.tile;
        if (lastIndex) {
            replacements = item.tile === TileCode.empty ? TileCode.empty : TileCode.floor;
            if (item.keys.length > 1) {
                frame = item.replacement;
            }
        }
        return {replacements, frame};
    }

    private searchFeature(mapLayer: Phaser.Tilemaps.TilemapLayer, tile: TileCode, replacements: TileCode, frame: number):
        Phaser.GameObjects.Sprite[] {
        return mapLayer.createFromTiles(tile + 1, replacements, {
            key: configuration.spriteSheetKey,
            frame: frame
        })
            .map(item => {
                item.setOrigin(0);
                item.setDepth(item.y);
                return item;
            });
    }

    private getTileOfPosition(position: Point, map: Map<TileCode, Phaser.GameObjects.Sprite[]>): TileCode {
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