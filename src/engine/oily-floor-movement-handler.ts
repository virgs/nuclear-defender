import {Tiles} from '../levels/tiles';
import type {Point} from '../math/point';
import type {Directions} from '../constants/directions';
import type {MovementOrchestrator} from '../engine/movement-orchestrator';
import type {ActData, FeatureMovementHandler} from '../engine/feature-movement-handler';

export class OilyFloorMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly coordinator: MovementOrchestrator;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.coordinator = config.coordinator;
    }

    public act(actData: ActData): boolean {
        let mapChanged = false;
        const boxThatMovedLastTurnOntoTheOilyFloor = actData.lastActionResult?.boxes
            .find(box => box.nextPosition.isEqualTo(this.position) && box.currentPosition.isDifferentOf(box.nextPosition)); //box on this tile
        if (boxThatMovedLastTurnOntoTheOilyFloor) {
            const boxToMove = actData.boxes
                .find(box => box.id === boxThatMovedLastTurnOntoTheOilyFloor.id)!;
            const movementDirection = boxThatMovedLastTurnOntoTheOilyFloor.direction!;
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

    public allowEnteringMovement(): boolean {
        return true;
    }

    public allowLeavingMovement(): boolean {
        return true;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public getTile(): Tiles {
        return Tiles.oily;
    }

    public getPosition(): Point {
        return this.position;
    }

}