import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {Movement} from '@/game/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import type {ActData, FeatureMovementHandler} from '@/game/engine/feature-movement-handler';

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
                box.currentPosition.isEqualTo(box.nextPosition)) //box is on me, but is not moving
            .forEach(box => {
                const blockers = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                    point: this.nextTilePosition,
                    orientation: this.orientation
                }); //check if there is something blocking on the position I want to move onto
                if (blockers.length <= 0) { //nothing blocks
                    mapChanged = this.move(box);
                } else { //there is a blocker
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

    private move(box: Movement) {
        this.coordinator.moveFeature(box, this.orientation);
        return true;
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