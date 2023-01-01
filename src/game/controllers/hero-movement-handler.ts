import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {MovementOrchestrator, OrientedPoint} from '@/game/controllers/movement-orchestrator';
import {Actions, mapActionToDirection} from '@/game/constants/actions';

export class HeroMovementHandler implements FeatureMovementHandler {
    private readonly coordinator: MovementOrchestrator;
    private position: Point;

    constructor(config: { coordinator: MovementOrchestrator, position: Point }) {
        this.coordinator = config.coordinator;
        this.position = config.position;
    }

    public allowEnteringMovement(direction: Directions): boolean {
        return false;
    }

    public allowLeavingMovement(direction: Directions): boolean {
        return true;
    }

    public getTile(): Tiles {
        return Tiles.hero;
    }

    public getPosition(): Point {
        return this.position;
    }

    public async act(config: { hero: { action: Actions, position: Point } }): Promise<boolean> {
        this.position = config.hero.position;
        let mapChanged = false;

        if (config.hero.action !== Actions.STAND) {
            const aimedDirection = mapActionToDirection(config.hero.action)!;
            if (!this.coordinator.canFeatureLeavePosition({point: this.position, orientation: aimedDirection})) {
                return false;
            }
            const aimedPosition = config.hero.position.calculateOffset(aimedDirection);
            const aimedMovement = {point: aimedPosition, orientation: aimedDirection};
            if (this.featureAheadAllowsMovement(aimedMovement)) {
                mapChanged = true;
                this.coordinator.moveHero(aimedDirection);
                this.coordinator.getBoxes()
                    .filter(box => box.nextPosition.isEqualTo(aimedPosition))
                    .forEach(box => this.coordinator.moveFeature(box, aimedDirection));
            }
        }

        return mapChanged;
    }

    private featureAheadAllowsMovement(aimedMovement: OrientedPoint): boolean {
        if (!this.coordinator.canFeatureEnterPosition(aimedMovement)) { //it can be a box, check the next one too

            if (this.coordinator.getBoxes()
                .some(box => box.nextPosition.isEqualTo(aimedMovement.point))) { //it's a box
                //check if the box is in a position that allows moves
                if (!this.coordinator.canFeatureLeavePosition(aimedMovement)) {
                    return false;
                }
                //check the tile after the box
                const afterNextTilePosition = aimedMovement.point.calculateOffset(aimedMovement.orientation);
                return this.coordinator.canFeatureEnterPosition({point: afterNextTilePosition, orientation: aimedMovement.orientation});
            }
            return false;
        }
        return true;
    }

}