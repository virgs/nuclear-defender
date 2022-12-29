import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';

export interface GameActor {
    getTilePosition(): Point;

    getSprite(): Phaser.GameObjects.Sprite;

    getTileCode(): Tiles;
}