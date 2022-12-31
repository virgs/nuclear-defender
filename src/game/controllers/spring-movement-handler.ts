import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import {getOpositeDirectionOf} from '@/game/constants/directions';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {MovementOrchestrator, OrientedPoint} from '@/game/controllers/movement-orchestrator';

export class SpringMovementHandler implements FeatureMovementHandler {
    private readonly position: Point;
    private readonly orientation: Directions;
    private readonly coordinator: MovementOrchestrator;

    constructor(config: { spring: OrientedPoint, coordinator: MovementOrchestrator }) {
        this.position = config.spring.point;
        this.orientation = config.spring.orientation;
        this.coordinator = config.coordinator;
    }

    public act(): boolean {
        let mapChanged = false;
        this.coordinator.getBoxes()
            .some(box => {
                if (box.currentPosition.isEqualTo(this.position)) {
                    const nextTilePosition = box.currentPosition.calculateOffset(this.orientation);
                    const properties = this.coordinator.getPositionProperties(this.orientation, nextTilePosition);
                    if (properties
                        .every(move => move.allowMoveOver)) {
                        this.coordinator.moveBox(box, this.orientation);
                        mapChanged = true;
                    }
                }
            });
        return mapChanged;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return getOpositeDirectionOf(this.orientation) === direction;
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return this.orientation === direction;
    }

    public getTile(): Tiles {
        return Tiles.spring;
    }

    public getPosition(): Point {
        return this.position;
    }

}