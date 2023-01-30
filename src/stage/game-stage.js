import { Point } from '../math/point';
import { Actions } from '../constants/actions';
import { dynamicTiles, Tiles } from '../levels/tiles';
import { EventEmitter, EventName } from '../events/event-emitter';
import { HeroActionRecorder } from '../engine/hero-action-recorder';
import { MovementOrchestrator } from '../engine/movement-orchestrator';
export class GameStage {
    strippedMap;
    movementCoordinator;
    hero;
    boxes;
    staticActors;
    heroActionRecorder;
    nextMoves;
    levelComplete = false;
    animationsAreOver;
    screenPropertiesCalculator;
    mapChangedLastCycle;
    constructor(config) {
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.hero = config.actorMap.get(Tiles.hero)[0];
        this.boxes = config.actorMap.get(Tiles.box);
        this.staticActors = [];
        for (let [code, actor] of config.actorMap.entries()) {
            if (!dynamicTiles.includes(code)) {
                this.staticActors.push(...actor);
            }
        }
        this.strippedMap = config.strippedMap;
        this.nextMoves = [];
        this.levelComplete = false;
        this.animationsAreOver = true;
        this.mapChangedLastCycle = true;
        this.heroActionRecorder = new HeroActionRecorder(this);
        this.movementCoordinator = new MovementOrchestrator({ strippedMap: this.strippedMap });
        this.updateActorsCoveringSituation();
        EventEmitter.listenToEvent(EventName.UNDO_BUTTON_CLICKED, async () => this.heroActionRecorder.undo());
    }
    isLevelComplete() {
        return this.levelComplete;
    }
    setInitialPlayerActions(playerActions) {
        this.nextMoves = playerActions;
    }
    getPlayerMoves() {
        return this.heroActionRecorder.getPlayerMoves();
    }
    async update() {
        if (this.animationsAreOver && !this.levelComplete) {
            this.nextMoves.push(this.hero.checkAction());
            const heroAction = this.nextMoves.shift();
            if (this.mapChangedLastCycle || heroAction !== Actions.STAND) {
                this.mapChangedLastCycle = false;
                const previousLastAction = this.heroActionRecorder.getLastActionResult();
                const input = {
                    heroAction: heroAction,
                    hero: { point: this.hero.getTilePosition(), id: this.hero.getId() },
                    boxes: this.boxes.map(box => ({ point: box.getTilePosition(), id: box.getId() })),
                    lastActionResult: previousLastAction
                };
                await this.makeMove(input);
            }
        }
    }
    async makeMove(input) {
        const output = await this.movementCoordinator.update(input);
        this.heroActionRecorder.registerMovement(input, output);
        if (output.mapChanged) {
            this.mapChangedLastCycle = true;
            await this.updateAnimations(output);
            this.checkLevelComplete();
        }
    }
    async updateAnimations(lastAction) {
        this.animationsAreOver = false;
        const boxesThatMoved = lastAction.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition));
        boxesThatMoved
            .forEach(movedBox => this.boxes
            .find(tileBox => movedBox.id === tileBox.getId())?.setTilePosition(movedBox.nextPosition));
        const animationsPromises = boxesThatMoved
            .map(async (movedBox) => {
            const spriteBoxMoved = this.boxes
                .find(tileBox => movedBox.id === tileBox.getId());
            const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(movedBox.nextPosition);
            await spriteBoxMoved?.animate({ spritePosition: spritePosition });
        });
        const heroAnimationPromise = async () => {
            const hero = lastAction.hero;
            if (hero.nextPosition.isDifferentOf(this.hero.getTilePosition())) {
                const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(hero.nextPosition);
                this.hero.setTilePosition(hero.nextPosition);
                await this.hero.animate({
                    spritePosition, orientation: hero.direction, animationPushedBox: !!boxesThatMoved
                        .find(box => box.currentPosition.isEqualTo(hero.nextPosition) && box.direction === hero.direction)
                });
            }
        };
        animationsPromises.push(heroAnimationPromise());
        this.updateActorsCoveringSituation();
        animationsPromises.push(...this.staticActors
            .map(actor => actor.animate({ spritePosition: actor.getTilePosition() })));
        await Promise.all(animationsPromises);
        this.animationsAreOver = true;
    }
    updateActorsCoveringSituation() {
        const dynamicActors = this.boxes.concat(this.hero);
        this.strippedMap.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((_, x) => {
            const position = new Point(x, y);
            const dynamicActorsInPosition = dynamicActors
                .filter(actor => actor.getTilePosition().isEqualTo(position));
            const staticActorsInPosition = this.staticActors
                .filter(actor => actor.getTilePosition().isEqualTo(position));
            const actorsInPosition = dynamicActorsInPosition.concat(staticActorsInPosition);
            actorsInPosition
                .forEach(actor => actor.cover(actorsInPosition));
        }));
    }
    checkLevelComplete() {
        this.levelComplete = this.boxes
            .every(box => box.getIsOnTarget());
    }
}
