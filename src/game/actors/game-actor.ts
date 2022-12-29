import type {Point} from '@/game/math/point';
import type {TileCodes} from '@/game/tiles/tile-codes';

export interface GameActor {
    getTilePosition(): Point;

    getSprite(): Phaser.GameObjects.Sprite;

    getTileCode(): TileCodes;
}