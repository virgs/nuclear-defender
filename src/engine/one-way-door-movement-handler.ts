import {Tiles} from '../levels/tiles';
import type {Point} from '../math/point';
import type {Directions} from '../constants/directions';
import {getOppositeDirectionOf} from '../constants/directions';
import type {MovementOrchestrator} from './movement-orchestrator';
import type {FeatureMovementHandler} from './feature-movement-handler';

export class OneWayDoorMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly orientation: Directions;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.orientation = config.orientation;
    }

    public act(): boolean {
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

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }

}