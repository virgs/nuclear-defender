import {Point} from '../math/point';
import {Tiles} from '../levels/tiles';
import type {Directions} from '../constants/directions';
import type {ActData, FeatureMovementHandler} from '../engine/feature-movement-handler';
import type {Movement, MovementOrchestrator, OrientedPoint} from '../engine/movement-orchestrator';
import {Actions, mapActionToDirection} from '../constants/actions';

export class HeroMovementHandler implements FeatureMovementHandler {
    private readonly coordinator: MovementOrchestrator;
    private position: Point;

    constructor(config: { coordinator: MovementOrchestrator }) {
        this.coordinator = config.coordinator;
        this.position = new Point(0, 0);
    }

    public allowEnteringMovement(): boolean {
        return false;
    }

    public allowLeavingMovement(): boolean {
        return true;
    }

    public getTile(): Tiles {
        return Tiles.hero;
    }

    public getPosition(): Point {
        return this.position;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public act(actData: ActData): boolean {
        this.position = actData.hero.position;
        let mapChanged = false;

        if (actData.hero.action !== Actions.STAND) {
            const aimedDirection = mapActionToDirection(actData.hero.action)!;
            if (!this.coordinator.canFeatureLeavePosition({point: this.position, orientation: aimedDirection})) {
                return false;
            }
            const aimedPosition = actData.hero.position.calculateOffset(aimedDirection);
            const aimedMovement = {point: aimedPosition, orientation: aimedDirection};
            if (this.featureAheadAllowsMovement(aimedMovement)) {
                mapChanged = true;
                this.coordinator.moveHero(aimedDirection);
                const movedBox = actData.boxes
                    .find((box: Movement) => box.nextPosition.isEqualTo(aimedPosition));
                if (movedBox) {
                    this.coordinator.moveFeature(movedBox, aimedDirection);
                }
            }
        }

        return mapChanged;
    }

    private featureAheadAllowsMovement(aimedMovement: OrientedPoint): boolean {
        const featuresBlockingMoveIntoPosition = this.coordinator.getFeaturesBlockingMoveIntoPosition(aimedMovement);
        if (featuresBlockingMoveIntoPosition.length >= 1) { //it can be a box, check the next one too
            if (featuresBlockingMoveIntoPosition.length === 1 && featuresBlockingMoveIntoPosition[0].code === Tiles.box) { //only a box blocks it
                //check if the box is in a position that allows moves
                if (!this.coordinator.canFeatureLeavePosition(aimedMovement)) {
                    return false;
                }
                //check the tile after the box
                const afterNextTilePosition = aimedMovement.point.calculateOffset(aimedMovement.orientation);
                const featuresBlockingAfterNextPosition = this.coordinator.getFeaturesBlockingMoveIntoPosition({
                    point: afterNextTilePosition,
                    orientation: aimedMovement.orientation
                });
                return featuresBlockingAfterNextPosition.length <= 0;
            }
            return false;
        }
        return true;
    }

}