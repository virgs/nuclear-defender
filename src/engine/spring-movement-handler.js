import { Tiles } from '../levels/tiles';
import { MovementOrchestrator } from '../engine/movement-orchestrator';
import { Directions, getOppositeDirectionOf } from '../constants/directions';
export class SpringMovementHandler {
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
            box.currentPosition.isEqualTo(box.nextPosition)) //box is not moving yet
            .forEach(box => {
            const blockers = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                point: this.nextTilePosition,
                orientation: this.orientation
            });
            if (blockers.length <= 0) {
                this.coordinator.moveFeature(box, this.orientation);
                mapChanged = true;
            }
            else {
                const pusherFeature = blockers
                    .find(feature => MovementOrchestrator.PUSHER_FEATURES.has(feature.code));
                if (pusherFeature) {
                    if (blockers
                        .some(moving => {
                        const moveableFeature = moving.code === Tiles.hero || moving.code === Tiles.box;
                        const isMoving = moving.currentPosition?.isDifferentOf(moving.nextPosition);
                        const isMovingToTheRightDirection = moving.direction !== pusherFeature.direction;
                        const isLeavingPositionThatBlocksMyMove = moveableFeature && moving.currentPosition?.isEqualTo(this.nextTilePosition);
                        return isLeavingPositionThatBlocksMyMove && isMoving && isMovingToTheRightDirection;
                    })) {
                        this.coordinator.moveFeature(box, this.orientation);
                        mapChanged = true;
                    }
                }
            }
        });
        return mapChanged;
    }
    allowEnteringMovement(direction) {
        return this.orientation === getOppositeDirectionOf(direction);
    }
    allowLeavingMovement(direction) {
        return this.orientation !== getOppositeDirectionOf(direction);
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
