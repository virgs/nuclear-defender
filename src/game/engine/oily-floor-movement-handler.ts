import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {MovementOrchestrator} from '@/game/controllers/movement-orchestrator';
import type {ActData, FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';

export class OilyFloorMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly coordinator: MovementOrchestrator;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.coordinator = config.coordinator;
    }

    public act(actData: ActData): boolean {
        let mapChanged = false;
        actData.boxes
            .filter(box => box.currentPosition.isEqualTo(this.position))
            .forEach(box => {
                const boxThatMovedLastTurnOntoTheOilyFloor = actData.lastActionResult?.boxes
                    .filter(box => box.currentPosition.isDifferentOf(box.nextPosition))
                    .find(box => box.nextPosition.isEqualTo(this.position));
                if (boxThatMovedLastTurnOntoTheOilyFloor) {
                    const movementDirection = boxThatMovedLastTurnOntoTheOilyFloor.direction!;
                    const nextTilePosition = box.currentPosition.calculateOffset(movementDirection);
                    if (nextTilePosition.isDifferentOf(actData.hero.position)) {
                        if (this.coordinator.canFeatureEnterPosition({point: nextTilePosition, orientation: movementDirection})) {
                            this.coordinator.moveFeature(box, movementDirection);
                            mapChanged = true;
                        }
                    }
                }
            });
        return mapChanged;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return true;
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return true;
    }

    public getTile(): Tiles {
        return Tiles.oily;
    }

    public getPosition(): Point {
        return this.position;
    }

}