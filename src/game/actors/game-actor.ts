import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';

export interface GameActor {
    getTilePosition(): Point;

    getSprite(): Phaser.GameObjects.Sprite;

    getTileCode(): Tiles;

    getId(): number;

    getOrientation(): Directions | undefined;

    isCovered(): boolean;

    cover(): void;

    uncover(): void;
}