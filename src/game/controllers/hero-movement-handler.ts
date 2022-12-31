import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {Directions} from '@/game/constants/directions';
import type {FeatureMovementHandler} from '@/game/controllers/feature-movement-handler';
import type {MovementOrchestrator} from '@/game/controllers/movement-orchestrator';
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

    public act(config: { hero: { action: Actions, position: Point } }): boolean {
        this.position = config.hero.position;
        let mapChanged = false;

        if (config.hero.action !== Actions.STAND) {
            const aimedDirection = mapActionToDirection(config.hero.action)!;
            const aimedPosition = config.hero.position.calculateOffset(aimedDirection);
            if (this.canHeroMove(aimedPosition, aimedDirection)) {
                mapChanged = true;
                this.coordinator.moveHero(aimedDirection);
                this.coordinator.getBoxes()
                    .filter(box => box.previousPosition.isEqualTo(aimedPosition))
                    .forEach(box => this.coordinator.moveFeature(box, aimedDirection));
            }
        }

        return mapChanged;
    }

    private canHeroMove(aimedPosition: Point, aimedDirection: Directions): boolean {
        if (!this.coordinator.canFeatureLeavePosition(Tiles.hero, {point: this.position, orientation: aimedDirection})) {
            return false;
        }

        if (!this.coordinator.canFeatureEnterPosition({point: aimedPosition, orientation: aimedDirection})) { //it can be a box, check the next one too
            if (this.coordinator.getFeatureAtPosition(aimedPosition)
                .some(feature => feature.code === Tiles.box)) { //it's a box
                //check if the box is in a position that allows moves
                if (!this.coordinator.canFeatureLeavePosition(Tiles.box, {point: aimedPosition, orientation: aimedDirection})) {
                    return false;
                }
                //check the tile after the box
                const afterNextTilePosition = aimedPosition.calculateOffset(aimedDirection);
                return this.coordinator.canFeatureEnterPosition({point: afterNextTilePosition, orientation: aimedDirection});
            }
            return false;
        }
        return true;
    }

}