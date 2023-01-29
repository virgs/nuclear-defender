import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import type {ActData, FeatureMovementHandler} from '@/game/engine/feature-movement-handler';
import {getOppositeDirectionOf} from '@/game/constants/directions';

export class OneWayDoorMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly coordinator: MovementOrchestrator;
    private readonly orientation: Directions;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.orientation = config.orientation;
        this.coordinator = config.coordinator;
    }

    public act(actData: ActData): boolean {
        return false;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return this.orientation === direction;
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return this.orientation === direction || this.orientation === getOppositeDirectionOf(direction);
    }

    public getTile(): Tiles {
        return Tiles.oneWayDoor;
    }

    public getPosition(): Point {
        return this.position;
    }

    public getOrientation(): Directions | undefined{
        return this.orientation;
    }

}