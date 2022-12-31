import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';

export interface FeatureMovementHandler {
    allowEnteringMovement(direction: Directions): boolean;

    allowLeavingMovement(direction: Directions): boolean;

    act(params?: any): boolean;

    getTile(): Tiles;

    getPosition(): Point;
}

