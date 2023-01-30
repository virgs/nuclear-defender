import Phaser from 'phaser';
import { Point } from '../math/point';
import { configuration } from '../constants/configuration';
export class ScreenPropertiesCalculator {
    scale;
    origin;
    data;
    constructor(data) {
        this.data = data;
        const gutter = 10;
        const map = {
            width: data.width * configuration.tiles.horizontalSize,
            height: data.height * configuration.tiles.verticalSize * configuration.tiles.verticalPerspective
        };
        const xFactor = (configuration.gameWidth - gutter) / map.width;
        const yFactor = (configuration.gameHeight - gutter) / map.height;
        this.scale = Math.min(this.limitValue(xFactor), this.limitValue(yFactor));
        this.origin = new Point((configuration.gameWidth - map.width * this.scale) / 2, (configuration.gameHeight - map.height * this.scale) / 2);
    }
    ;
    getScale() {
        return this.scale;
    }
    getMap() {
        return this.data;
    }
    getWorldPositionFromTilePosition(tile) {
        return new Point(this.origin.x + tile.x * configuration.world.tileSize.horizontal, this.origin.y + tile.y * configuration.world.tileSize.vertical);
    }
    limitValue(value) {
        return Phaser.Math.Clamp(value, configuration.world.scaleLimits.min, configuration.world.scaleLimits.max);
    }
}
