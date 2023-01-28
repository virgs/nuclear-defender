import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';
import type {OrientedTile} from '@/game/tiles/standard-sokoban-annotation-tokennizer';

export type AnimateData = {
    spritePosition: Point,
    orientation?: Directions,
    animationPushedBox?: boolean
};

export type GameActorConfig = {
    orientation: Directions;
    tilePosition: Point;
    worldPosition: Point;
    contentAround: OrientedTile[][][]; //3x3 matrix where 1x1 is the center. The other dimension is the tile layer
    scene: Phaser.Scene,
    id: number
};

export interface GameActor {
    getTilePosition(): Point;

    setTilePosition(tilePosition: Point): void;

    getSprite(): Phaser.GameObjects.Sprite;

    getTileCode(): Tiles;

    getId(): number;

    getOrientation(): Directions | undefined;

    isCovered(): boolean;

    cover(tiles: GameActor[]): void;

    animate(data: AnimateData): Promise<any>;
}