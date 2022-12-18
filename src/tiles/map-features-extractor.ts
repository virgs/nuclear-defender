import Phaser from 'phaser';
import {TileCode} from './tile-code';
import {configuration} from '../constants/configuration';

//TODO extract each to its specific GameActor receiving its sprite in the constructor (to better handle future interactions)
type SearchMapType = { tile: TileCode, keys: TileCode[], replacement?: TileCode };
const searchMap: SearchMapType[] = [
    {
        tile: TileCode.floor,
        keys: [TileCode.floor]
    },
    {
        tile: TileCode.empty,
        keys: [TileCode.empty]
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
    public extractFeatures(mapLayer: Phaser.Tilemaps.TilemapLayer): Map<TileCode, Phaser.GameObjects.Sprite[]> {
        return searchMap
            .reduce((acc, item) => {
                let index = 0;
                for (let key of item.keys) {
                    const {replacements, frame} = this.getFrames(index, item);
                    const features: Phaser.GameObjects.Sprite[] =
                        this.searchFeature(mapLayer, item.tile, replacements, frame)
                            .reduce((acc, item) => acc.concat(item), []);
                    if (acc.get(key)) {
                        acc.set(key, acc.get(key).concat(features));
                    } else {
                        acc.set(key, features);
                    }
                    ++index;
                }
                return acc;
            }, new Map<TileCode, Phaser.GameObjects.Sprite[]>());
    }

    private getFrames(index: number, item: SearchMapType) {
        const lastIndex = index === item.keys.length - 1;
        let replacements: TileCode = null;
        let frame: TileCode = item.tile;
        if (lastIndex) {
            replacements = TileCode.floor;
            if (item.keys.length > 1) {
                frame = item.replacement;
            }
        }
        return {replacements, frame};
    }

    private searchFeature(mapLayer: Phaser.Tilemaps.TilemapLayer, tile: TileCode, replacements: TileCode | TileCode[] | null, frame: number): Phaser.GameObjects.Sprite[] {
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

}