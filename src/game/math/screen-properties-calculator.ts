import {Point} from '@/game/math/point';
import {configuration} from '@/game/constants/configuration';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import Phaser from 'phaser';

export type ScaleOutput = { scale: number, center: Point };
const scaleLimits = {
    max: 1.15,
    min: .45
};

export class ScreenPropertiesCalculator {
    public calculateScale(data: MultiLayeredMap): ScaleOutput {
        const gutter = 30;
        const map = {
            width: data.width * configuration.tiles.horizontalSize,
            height: data.height * configuration.tiles.verticalSize * configuration.tiles.verticalPerspective
        };
        const xFactor = (configuration.gameWidth - gutter) / map.width;
        const yFactor = (configuration.gameHeight - gutter) / map.height;
        const scale = Math.min(this.limitValue(xFactor), this.limitValue(yFactor));
        console.log(scale);
        return {
            scale: scale,
            center: new Point(
                (configuration.gameWidth - map.width * scale) / 2,
                (configuration.gameHeight - map.height * scale) / 2)
        };
    };

    public getWorldPositionFromTilePosition(tile: Point): Point {
        return new Point(configuration.world.horizontalAdjustment + tile.x * configuration.world.tileSize.horizontal,
            tile.y * configuration.world.tileSize.vertical);

    }

    private limitValue(value: number): number {
        return Phaser.Math.Clamp(value, scaleLimits.min, scaleLimits.max);
    }
}