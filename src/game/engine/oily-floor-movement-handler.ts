import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import type {ActData, FeatureMovementHandler} from '@/game/engine/feature-movement-handler';

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
                if (featuresBlockingMoveIntoPosition.length <= 0) {
                    this.coordinator.moveFeature(boxToMove, movementDirection);
                    mapChanged = true;
                }
            }
        }
        return mapChanged;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return true;
    }

    public allowLeavingMovement(direction: Directions): boolean {
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