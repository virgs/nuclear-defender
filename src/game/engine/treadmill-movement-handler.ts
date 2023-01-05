import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {ActData, FeatureMovementHandler} from '@/game/engine/feature-movement-handler';
import type {MovementOrchestrator} from '@/game/engine/movement-orchestrator';

export class TreadmillMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly orientation: Directions;
    private readonly coordinator: MovementOrchestrator;
    private readonly nextTilePosition: Point;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.orientation = config.orientation;
        this.coordinator = config.coordinator;
        this.nextTilePosition = this.position.calculateOffset(this.orientation);
    }

    public act(actData: ActData): boolean {
        let mapChanged = false;
        actData.boxes
            .filter(box => box.currentPosition.isEqualTo(this.position) &&
                box.currentPosition.isEqualTo(box.nextPosition)) //box is not moving already
            .forEach(box => {
                if (this.coordinator.getFeaturesBlockingMoveIntoPosition({
                    point: this.nextTilePosition,
                    orientation: this.orientation
                }).length <= 0) {
                    this.coordinator.moveFeature(box, this.orientation);
                    mapChanged = true;
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
        return Tiles.spring;
    }

    public getPosition(): Point {
        return this.position;
    }

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }

}