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
    private readonly scale: number;
    private readonly origin: Point;

    public constructor(data: MultiLayeredMap) {
        const gutter = 10;
        const map = {
            width: data.width * configuration.tiles.horizontalSize,
            height: data.height * configuration.tiles.verticalSize * configuration.tiles.verticalPerspective
        };
        const xFactor = (configuration.gameWidth - gutter) / map.width;
        const yFactor = (configuration.gameHeight - gutter) / map.height;
        this.scale = Math.min(this.limitValue(xFactor), this.limitValue(yFactor));
        this.origin = new Point(
            (configuration.gameWidth - map.width * this.scale) / 2,
            (configuration.gameHeight - map.height * this.scale) / 2);
    };

    public getScale(): number {
        return this.scale;
    }

    public getWorldPositionFromTilePosition(tile: Point): Point {
        return new Point(this.origin.x + tile.x * configuration.world.tileSize.horizontal,
            this.origin.y + tile.y * configuration.world.tileSize.vertical);

    }

    private limitValue(value: number): number {
        return Phaser.Math.Clamp(value, scaleLimits.min, scaleLimits.max);
    }
}