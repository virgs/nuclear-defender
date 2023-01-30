import {Tiles} from '../levels/tiles';
import type {Point} from '../math/point';
import {MovementOrchestrator} from '../engine/movement-orchestrator';
import {Directions, getOppositeDirectionOf} from '../constants/directions';
import type {ActData, FeatureMovementHandler} from '../engine/feature-movement-handler';

export class SpringMovementHandler implements FeatureMovementHandler {
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
                box.currentPosition.isEqualTo(box.nextPosition)) //box is not moving yet
            .forEach(box => {
                const blockers = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                    point: this.nextTilePosition,
                    orientation: this.orientation
                });
                if (blockers.length <= 0) {
                    this.coordinator.moveFeature(box, this.orientation);
                    mapChanged = true;
                } else {
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

    public allowEnteringMovement(direction: Directions): boolean {
        return this.orientation === getOppositeDirectionOf(direction);
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return this.orientation !== getOppositeDirectionOf(direction);
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