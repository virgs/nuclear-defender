import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';
import type {Actions} from '@/game/constants/actions';
import type {Movement} from '@/game/controllers/movement-orchestrator';

export type ActData = {
    hero:
        {
            action: Actions,
            position: Point
        },
    boxes: Movement[]
};

export interface FeatureMovementHandler {
    allowEnteringMovement(direction: Directions): boolean;

    allowLeavingMovement(direction: Directions): boolean;

    act(actData: ActData): Promise<boolean>;

    getTile(): Tiles;

    getPosition(): Point;
}

