import {configuration} from '../constants/configuration';
import Phaser from 'phaser';
import {TileCodes} from './tile-codes';

export type FeatureMap = { [propName: string]: Phaser.GameObjects.Sprite[] };

export class MapFeaturesExtractor {
    public extractFeatures(mapLayer: Phaser.Tilemaps.TilemapLayer): FeatureMap {
        return Object.keys(TileCodes)
            .filter((item) => isNaN(Number(item)))
            .reduce((acc, item) => {
                acc[item] = this.extractFeature(mapLayer, TileCodes[item]);
                return acc;
            }, {});
    }

    private extractFeature(mapLayer: Phaser.Tilemaps.TilemapLayer, tileCode: TileCodes): Phaser.GameObjects.Sprite[] {
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