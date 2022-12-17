import Phaser from 'phaser';
import {TileCode} from '../tiles/tile-code';
import {configuration} from '../constants/configuration';

export class FileLevelExtractor {
    public extractToTileCodeMap(map: Phaser.Tilemaps.Tilemap) {
        const tileset = map.addTilesetImage(configuration.tilesetName, configuration.spriteSheetKey);
        const mapLayer = map.createLayer(configuration.layerName, tileset);

        const dimension = mapLayer.worldToTileXY(mapLayer.width, mapLayer.height);
        const dimensionArray: TileCode[][] = new Array(dimension.y)
            .fill(new Array(dimension.x)
                .fill(dimension.y));
        const tileCodeMap: TileCode[][] = dimensionArray
            .map((line, y) => line
                .map((_, x) => {
                    const tileAt = mapLayer.getTileAt(x, y);
                    if (tileAt) {
                        return mapLayer.getTileAt(x, y).index;
                    }
                    return TileCode.empty;
                }));
        return tileCodeMap;
    }
}