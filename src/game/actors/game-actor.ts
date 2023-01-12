import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';
import type {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import type {OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export type GameActorConfig = {
    orientation: Directions;
    screenPropertiesCalculator: ScreenPropertiesCalculator;
    tilePosition: Point;
    worldPosition: Point;
    coveredByDynamicFeature: boolean;
    contentAround: OrientedTile[][][];
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

    cover(tile: GameActor): void;

    uncover(tile: GameActor): void;

    animate(nextPosition: Point, direction?: Directions): Promise<any>;
}