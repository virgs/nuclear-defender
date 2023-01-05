import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Directions} from '@/game/constants/directions';
import type {Actions} from '@/game/constants/actions';
import type {Movement, MovementOrchestratorOutput} from '@/game/engine/movement-orchestrator';

export type ActData = {
    hero:
        {
            action: Actions,
            position: Point
        },
    boxes: Movement[],
    lastActionResult?: MovementOrchestratorOutput
};

export interface FeatureMovementHandler {
    allowEnteringMovement(direction: Directions): boolean;

    allowLeavingMovement(direction: Directions): boolean;

    act(actData: ActData): boolean;

    getTile(): Tiles;

    getPosition(): Point;

    getOrientation(): Directions | undefined;
}

