import {Point} from '@/game/math/point';
import {configuration} from '@/game/constants/configuration';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type ScaleOutput = { scale: number, center: Point };
const scaleLimits = {
    max: 1.15,
    min: .45
};

export class ScreenPropertiesCalculator {
    public calculate(data: MultiLayeredMap): ScaleOutput {
        const map = {
            width: data.width * configuration.tiles.horizontalSize,
            height: data.height * configuration.tiles.verticalSize * configuration.tiles.verticalPerspective
        };
        const xFactor = configuration.gameWidth / map.width;
        const yFactor = configuration.gameHeight / map.height;
        const scale = Math.min(this.limitValue(xFactor), this.limitValue(yFactor));
        return {
            scale: scale,
            center: new Point(
                (configuration.gameWidth - map.width * scale) / 2,
                (configuration.gameHeight - map.height * scale) / 2)
        };
    };

    private limitValue(value: number): number {
        return Phaser.Math.Clamp(value, scaleLimits.min, scaleLimits.max);
    }
}