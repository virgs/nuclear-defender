import type {Point} from '@/math/point';
import type {Tiles} from '@/levels/tiles';
import type {Directions} from '@/constants/directions';
import type {OrientedTile} from '@/levels/standard-sokoban-annotation-tokennizer';

export type GameActorConfig = {
    assetSheetKey: string;
    code: Tiles;
    playable: boolean;
    orientation?: Directions;
    tilePosition: Point;
    worldPosition: Point;
    contentAround: OrientedTile[][][]; //3x3 matrix where 1x1 is the center. The other dimension is the tile layer
    scene: Phaser.Scene,
    id: number
};

export interface GameActor {
    getTileCode(): Tiles;

    getTilePosition(): Point;

    getId(): number;

    cover(tiles: GameActor[]): void;
}