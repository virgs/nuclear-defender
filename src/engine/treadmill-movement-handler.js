import { Tiles } from '../levels/tiles';
import { MovementOrchestrator } from './movement-orchestrator';
export class TreadmillMovementHandler {
    position;
    orientation;
    coordinator;
    nextTilePosition;
    constructor(config) {
        this.position = config.position;
        this.orientation = config.orientation;
        this.coordinator = config.coordinator;
        this.nextTilePosition = this.position.calculateOffset(this.orientation);
    }
    act(actData) {
        let mapChanged = false;
        actData.boxes
            .filter(box => box.currentPosition.isEqualTo(this.position) &&
            box.currentPosition.isEqualTo(box.nextPosition)) //box is on me, but is not moving
            .forEach(box => {
            const blockers = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                point: this.nextTilePosition,
                orientation: this.orientation
            }); //check if there is something blocking on the position I want to move onto
            if (blockers.length <= 0) { //nothing blocks
                mapChanged = this.move(box);
            }
            else { //there is a blocker
                const pusherFeature = blockers
                    .find(feature => MovementOrchestrator.PUSHER_FEATURES.has(feature.code));
                if (pusherFeature) { //is it a pusher (hero, treadmil, spring)?
                    if (blockers
                        .some(moving => {
                        const moveableFeature = moving.code === Tiles.hero || moving.code === Tiles.box;
                        const isMoving = moving.currentPosition?.isDifferentOf(moving.nextPosition);
                        const isMovingToTheRightDirection = moving.direction !== pusherFeature.direction;
                        const isLeavingPositionThatBlocksMyMove = moveableFeature && moving.currentPosition?.isEqualTo(this.nextTilePosition);
                        return isLeavingPositionThatBlocksMyMove && isMoving && isMovingToTheRightDirection;
                    })) {
                        mapChanged = this.move(box);
                    }
                }
            }
        });
        return mapChanged;
    }
    move(box) {
        this.coordinator.moveFeature(box, this.orientation);
        return true;
    }
    allowEnteringMovement() {
        return true;
    }
    allowLeavingMovement() {
        return true;
    }
    getTile() {
        return Tiles.spring;
    }
    getPosition() {
        return this.position;
    }
    getOrientation() {
        return this.orientation;
    }
}
