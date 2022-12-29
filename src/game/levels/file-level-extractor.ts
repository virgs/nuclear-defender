import type Phaser from 'phaser';
import {Tiles} from '../tiles/tiles';
import {configuration} from '../constants/configuration';

export class FileLevelExtractor {
    public extractToTileCodeMap(map: Phaser.Tilemaps.Tilemap) {
        const tileset = map.addTilesetImage(configuration.tiles.tilesetName, configuration.tiles.spriteSheetKey);
        const mapLayer = map.createLayer(configuration.tiles.layerName, tileset);

        const dimension = mapLayer.worldToTileXY(mapLayer.width, mapLayer.height);
        const dimensionArray: Tiles[][] = new Array(dimension.y)
            .fill(new Array(dimension.x)
                .fill(dimension.y));
        return dimensionArray
            .map((line, y) => line
                .map((_, x) => mapLayer.getTileAt(x, y) ?
                    mapLayer.getTileAt(x, y).index
                    : Tiles.empty
                ));
    }
}