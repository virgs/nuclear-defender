import Phaser from 'phaser';
import {configuration} from '../constants/configuration';
import {TileCodes} from '../tiles/tile-codes';

export class FileLevelExtractor {
    public extractToTileCodeMap(map: Phaser.Tilemaps.Tilemap) {
        const tileset = map.addTilesetImage(configuration.tilesetName, configuration.spriteSheetKey);
        const mapLayer = map.createLayer(configuration.layerName, tileset);

        const dimension = mapLayer.worldToTileXY(mapLayer.width, mapLayer.height);
        const dimensionArray: TileCodes[][] = new Array(dimension.y)
            .fill(new Array(dimension.x)
                .fill(dimension.y));
        const tileCodeMap: TileCodes[][] = dimensionArray
            .map((line, y) => line
                .map((_, x) => {
                    const tileAt = mapLayer.getTileAt(x, y);
                    if (tileAt) {
                        return mapLayer.getTileAt(x, y).index;
                    }
                    return TileCodes.empty;
                }));
        return tileCodeMap;
    }
}