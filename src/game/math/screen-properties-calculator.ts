import type {TileCodes} from '@/game/tiles/tile-codes';
import type {Point} from '@/game/math/point';
import {configuration} from '@/game/constants/configuration';

export type ScaleOutput = { scale: number, center: Point };
const scaleLimits = {
    max: 1.15,
    min: .66
};

export class ScreenPropertiesCalculator {
    public calculate(data: { width: number; height: number; tiles: TileCodes[][] }): ScaleOutput {
        const map = {
            width: data.width * configuration.tiles.horizontalSize,
            height: data.height * configuration.tiles.verticalSize * configuration.tiles.verticalPerspective
        };
        const xFactor = configuration.gameWidth / map.width;
        const yFactor = configuration.gameHeight / map.height;
        const scale = Math.min(this.limitValue(xFactor), this.limitValue(yFactor));
        return {
            scale: scale,
            center: {
                x: (configuration.gameWidth - map.width * scale) / 2,
                y: (configuration.gameHeight - map.height * scale) / 2,
            }
        };
    }

    private limitValue(value: number): number {
        return Math.min(Math.max(value, scaleLimits.min), scaleLimits.max);
    }
}