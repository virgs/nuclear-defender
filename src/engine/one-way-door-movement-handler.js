import { Tiles } from '../levels/tiles';
import { getOppositeDirectionOf } from '../constants/directions';
export class OneWayDoorMovementHandler {
    position;
    orientation;
    constructor(config) {
        this.position = config.position;
        this.orientation = config.orientation;
    }
    act() {
        return false;
    }
    allowEnteringMovement(direction) {
        return this.orientation === direction;
    }
    allowLeavingMovement(direction) {
        return this.orientation === direction || this.orientation === getOppositeDirectionOf(direction);
    }
    getTile() {
        return Tiles.oneWayDoor;
    }
    getPosition() {
        return this.position;
    }
    getOrientation() {
        return this.orientation;
    }
}
