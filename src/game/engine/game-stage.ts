import {dynamicTiles, Tiles} from '@/game/tiles/tiles';
import {Actions} from '@/game/constants/actions';
import type {BoxActor} from '@/game/actors/box-actor';
import {EventEmitter, EventName} from '@/event-emitter';
import type {HeroActor} from '@/game/actors/hero-actor';
import type {GameActor} from '@/game/actors/game-actor';
import {HeroActionRecorder} from '@/game/engine/hero-action-recorder';
import type {MovementOrchestratorInput, MovementOrchestratorOutput} from '@/game/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import type {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export class GameStage {
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly nextMoves: Actions[];
    private readonly staticActors: GameActor[];
    private readonly scene: Phaser.Scene;
    private readonly heroActionRecorder: HeroActionRecorder;

    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private screenPropertiesCalculator: ScreenPropertiesCalculator;
    private mapChangedLastCycle: boolean;

    constructor(config: { solution?: Actions[]; screenPropertiesCalculator: ScreenPropertiesCalculator; actorMap: Map<Tiles, GameActor[]>; strippedMap: MultiLayeredMap; scene: Phaser.Scene }) {
        this.scene = config.scene;
        this.screenPropertiesCalculator = config.screenPropertiesCalculator;
        this.hero = config.actorMap.get(Tiles.hero)![0] as HeroActor;
        this.boxes = config.actorMap.get(Tiles.box)! as BoxActor[];

        this.staticActors = [];
        for (let [code, actor] of config.actorMap.entries()) {
            if (!dynamicTiles.includes(code)) {
                this.staticActors.push(...actor);
            }
        }
        this.strippedMap = config.strippedMap;
        this.nextMoves = config.solution || [];
        this.levelComplete = false;
        this.animationsAreOver = true;
        this.mapChangedLastCycle = true;
        this.heroActionRecorder = new HeroActionRecorder(this);
        this.movementCoordinator = new MovementOrchestrator({strippedMap: this.strippedMap});

        this.updateActorsCoveringSituation();
        EventEmitter.listenToEvent(EventName.UNDO_BUTTON_CLICKED, async () => this.heroActionRecorder.undo());
    }

    public isLevelComplete(): boolean {
        return this.levelComplete;
    }

    public getPlayerMoves(): Actions[] {
        return this.heroActionRecorder.getPlayerMoves();
    }

    public async update(): Promise<void> {
        if (this.animationsAreOver && !this.levelComplete) {
            this.nextMoves.push(this.hero.checkAction());
            const heroAction = this.nextMoves.shift()!;

            if (this.mapChangedLastCycle || heroAction !== Actions.STAND) {
                this.mapChangedLastCycle = false;
                const previousLastAction = this.heroActionRecorder.getLastActionResult();
                const input = {
                    heroAction: heroAction,
                    hero: {point: this.hero.getTilePosition(), id: this.hero.getId()},
                    boxes: this.boxes.map(box => ({point: box.getTilePosition(), id: box.getId()})),
                    lastActionResult: previousLastAction
                };
                await this.makeMove(input);
            }
        }
    }

    public async makeMove(input: MovementOrchestratorInput) {
        const output = await this.movementCoordinator!.update(input);
        this.heroActionRecorder.registerMovement(input, output);

        if (output.mapChanged) {
            this.mapChangedLastCycle = true;
            await this.updateAnimations(output);
            this.checkLevelComplete();
        }
    }

    public async updateAnimations(lastAction: MovementOrchestratorOutput) {
        this.animationsAreOver = false;
        const boxesThatMoved = lastAction.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition));
        boxesThatMoved
            .forEach(movedBox =>
                this.boxes
                    .find(tileBox => movedBox.id === tileBox.getId())?.setTilePosition(movedBox.nextPosition));

        const animationsPromises: Promise<any>[] = boxesThatMoved
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.id === tileBox.getId())!;

                //TODO check if player pushed it. Checking playerPosition and lastPlayerAction
                // this.scene.sound.play(sounds.pushingBox.key, {volume: 0.1});

                const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(movedBox.nextPosition);
                await spriteBoxMoved?.animate(spritePosition);
            });

        const heroAnimationPromise = async () => {
            const hero = lastAction.hero;
            if (hero.nextPosition.isDifferentOf(this.hero.getTilePosition())) {
                const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(hero.nextPosition);
                this.hero.setTilePosition(hero.nextPosition);
                await this.hero!.animate(spritePosition, hero.direction);
            }
        };
        animationsPromises.push(heroAnimationPromise());

        this.updateActorsCoveringSituation();

        animationsPromises.push(...this.staticActors
            .map(actor => actor.animate(actor.getTilePosition())));
        await Promise.all(animationsPromises);

        this.animationsAreOver = true;
    }

    private updateActorsCoveringSituation() {
        const dynamicActors = (this.boxes as GameActor[]).concat(this.hero as GameActor);
        dynamicActors
            .forEach((dynamicActor: GameActor) => {
                const coveringStaticActors: GameActor[] = this.staticActors
                    .filter(staticActor => staticActor.getTilePosition().isEqualTo(dynamicActor.getTilePosition()));
                dynamicActor.cover(coveringStaticActors);
                coveringStaticActors
                    .forEach(dynamicActor => dynamicActor.cover([dynamicActor]));
            });
    }

    private checkLevelComplete() {
        this.levelComplete = this.boxes
            .every(box => box.getIsOnTarget());
    }

}