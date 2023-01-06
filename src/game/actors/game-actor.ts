import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';

export type GameActorConfig = {
    orientation: Directions;
    tilePosition: Point;
    sprite: Phaser.GameObjects.Sprite;
    scene: Phaser.Scene,
    id: number
};

export interface GameActor {
    getTilePosition(): Point;

    getSprite(): Phaser.GameObjects.Sprite;

    getTileCode(): Tiles;

    getId(): number;

    getOrientation(): Directions | undefined;

    isCovered(): boolean;

    cover(tile: Tiles): void;

    uncover(tile: Tiles): void;
}