import type {Point} from '@/game/math/point';

export interface GameActor {
    getTilePosition(): Point;
}