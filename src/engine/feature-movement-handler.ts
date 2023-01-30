import type {Point} from '../math/point';
import type {Tiles} from '../levels/tiles';
import type {Directions} from '../constants/directions';
import type {Actions} from '../constants/actions';
import type {Movement, MovementOrchestratorOutput} from '../engine/movement-orchestrator';

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

