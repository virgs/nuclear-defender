import { Tiles } from '../levels/tiles';
export class OilyFloorMovementHandler {
    position;
    coordinator;
    constructor(config) {
        this.position = config.position;
        this.coordinator = config.coordinator;
    }
    act(actData) {
        let mapChanged = false;
        const boxThatMovedLastTurnOntoTheOilyFloor = actData.lastActionResult?.boxes
            .find(box => box.nextPosition.isEqualTo(this.position) && box.currentPosition.isDifferentOf(box.nextPosition)); //box on this tile
        if (boxThatMovedLastTurnOntoTheOilyFloor) {
            const boxToMove = actData.boxes
                .find(box => box.id === boxThatMovedLastTurnOntoTheOilyFloor.id);
            const movementDirection = boxThatMovedLastTurnOntoTheOilyFloor.direction;
            const nextTilePosition = this.position.calculateOffset(movementDirection);
            if (nextTilePosition.isDifferentOf(actData.hero.position)) {
                const featuresBlockingMoveIntoPosition = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                    point: nextTilePosition,
                    orientation: movementDirection
                });
                const somethingElseMovedThisBlockThisRound = boxToMove.currentPosition.isDifferentOf(boxToMove.nextPosition);
                if (featuresBlockingMoveIntoPosition.length <= 0 && !somethingElseMovedThisBlockThisRound) {
                    this.coordinator.moveFeature(boxToMove, movementDirection);
                    mapChanged = true;
                }
            }
        }
        return mapChanged;
    }
    allowEnteringMovement() {
        return true;
    }
    allowLeavingMovement() {
        return true;
    }
    getOrientation() {
        return undefined;
    }
    getTile() {
        return Tiles.oily;
    }
    getPosition() {
        return this.position;
    }
}
