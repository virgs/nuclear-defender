import Phaser from 'phaser';
import {TileCode} from './tile-code';
import {configuration} from '../constants/configuration';

export type FeatureMap = { [propName: string]: Phaser.GameObjects.Sprite[] };

export class MapFeaturesExtractor {
    public extractFeatures(mapLayer: Phaser.Tilemaps.TilemapLayer): FeatureMap {
        return Object.keys(TileCode)
            .filter((item) => isNaN(Number(item)))
            .reduce((acc, item) => {
                acc[item] = this.extractFeature(mapLayer, TileCode[item]);
                return acc;
            }, {} as FeatureMap);
    }

    private extractFeature(mapLayer: Phaser.Tilemaps.TilemapLayer, tileCode: TileCode): Phaser.GameObjects.Sprite[] {
        return mapLayer.createFromTiles(tileCode + 1, 0, {
            key: configuration.spriteSheetKey,
            frame: tileCode
        })
            .map(item => {
                item.setOrigin(0);
                item.setDepth(item.y);
                return item;
            });
    }
}