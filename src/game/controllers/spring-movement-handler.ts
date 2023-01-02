import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {Directions, getOpositeDirectionOf} from '@/game/constants/directions';
import type {ActData, FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {MovementOrchestrator} from '@/game/controllers/movement-orchestrator';

export class SpringMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly orientation: Directions;
    private readonly coordinator: MovementOrchestrator;

    constructor(config: { position: Point, orientation: Directions, coordinator: MovementOrchestrator }) {
        this.position = config.position;
        this.orientation = config.orientation;
        this.coordinator = config.coordinator;
    }

    public act(actData: ActData): boolean {
        let mapChanged = false;
        actData.boxes
            .filter(box => box.currentPosition.isEqualTo(this.position))
            .forEach(box => {
                const nextTilePosition = box.currentPosition.calculateOffset(this.orientation);
                if (this.coordinator.canFeatureEnterPosition({point: nextTilePosition, orientation: this.orientation})) {
                    this.coordinator.moveFeature(box, this.orientation);
                    mapChanged = true;
                }
            });
        return mapChanged;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return this.orientation === getOpositeDirectionOf(direction);
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return this.orientation !== getOpositeDirectionOf(direction);
    }

    public getTile(): Tiles {
        return Tiles.spring;
    }

    public getPosition(): Point {
        return this.position;
    }

}