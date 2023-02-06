import {Point} from '@/math/point';
import type {BoxActor} from './box-actor';
import type {HeroActor} from './hero-actor';
import type {GameActor} from './game-actor';
import {Actions} from '@/constants/actions';
import {dynamicTiles, Tiles} from '@/levels/tiles';
import {EventEmitter, EventName} from '@/events/event-emitter';
import {HeroActionRecorder} from '@/engine/hero-action-recorder';
import type {MovementOrchestratorOutput} from '@/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/engine/movement-orchestrator';
import type {ScreenPropertiesCalculator} from '@/math/screen-properties-calculator';
import type {MultiLayeredMap} from '@/levels/standard-sokoban-annotation-tokennizer';
import {configuration} from "@/constants/configuration";

export class GameStage {
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly staticActors: GameActor[];
    private readonly heroActionRecorder: HeroActionRecorder;

    private nextMoves: Actions[];
    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private screenPropertiesCalculator: ScreenPropertiesCalculator;
    private mapChangedLastCycle: boolean;

    constructor(config: { screenPropertiesCalculator: ScreenPropertiesCalculator; actorMap: Map<Tiles, GameActor[]>; strippedMap: MultiLayeredMap; scene: Phaser.Scene }) {
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
        this.nextMoves = [];
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

    public setInitialPlayerActions(playerActions: Actions[]): void {
        this.nextMoves = playerActions;
    }

    public getPlayerMoves(): Actions[] {
        return this.heroActionRecorder.getPlayerMoves();
    }

    public async update(): Promise<void> {
        if (this.animationsAreOver && !this.levelComplete) {
            const heroAction = this.nextMoves.shift() || this.hero.checkAction();

            if (this.mapChangedLastCycle || heroAction !== Actions.STAND) {
                this.mapChangedLastCycle = false;
                const previousLastAction = this.heroActionRecorder.getLastActionResult();
                const input = {
                    heroAction: heroAction,
                    hero: {point: this.hero.getTilePosition(), id: this.hero.getId()},
                    boxes: this.boxes.map(box => ({point: box.getTilePosition(), id: box.getId()})),
                    lastActionResult: previousLastAction
                };
                const output = await this.movementCoordinator!.update(input);
                this.heroActionRecorder.registerMovement(input, output);
                if (output.mapChanged) {
                    this.mapChangedLastCycle = true;
                    await this.updateAnimations(output);
                    this.checkLevelComplete();
                }
            }
        }
    }

    public async updateAnimations(output: MovementOrchestratorOutput) {
        this.animationsAreOver = false;

        const animationsPromises: Promise<any>[] = output.boxes
            .filter(box => box.nextPosition.isDifferentOf(box.currentPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.id === tileBox.getId())!;

                const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(movedBox.nextPosition);
                await spriteBoxMoved.update({
                    duration: configuration.updateCycleInMs,
                    spritePosition: spritePosition,
                    tilePosition: movedBox.nextPosition
                });
            });

        const heroAnimationPromise = async () => {
            const hero = output.hero;
            const spritePosition = this.screenPropertiesCalculator.getWorldPositionFromTilePosition(hero.nextPosition);
            await this.hero!.update({
                duration: configuration.updateCycleInMs,
                tilePosition: hero.nextPosition,
                spritePosition, orientation: hero.direction, animationPushedBox: !!output.boxes
                    .find(box => box.currentPosition.isEqualTo(hero.nextPosition) && box.direction === hero.direction)
            });
        };
        animationsPromises.push(heroAnimationPromise());

        this.updateActorsCoveringSituation();
        await Promise.all(animationsPromises);

        this.animationsAreOver = true;
    }

    private updateActorsCoveringSituation() {
        const dynamicActors = (this.boxes as GameActor[]).concat(this.hero as GameActor);
        this.strippedMap.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((_: any, x: number) => {
                    const position = new Point(x, y);
                    const dynamicActorsInPosition: GameActor[] = dynamicActors
                        .filter(actor => actor.getTilePosition().isEqualTo(position));
                    const staticActorsInPosition: GameActor[] = this.staticActors
                        .filter(actor => actor.getTilePosition().isEqualTo(position));
                    const actorsInPosition = dynamicActorsInPosition.concat(staticActorsInPosition);
                    actorsInPosition
                        .forEach(actor => actor.cover(actorsInPosition));
                }));
    }

    private checkLevelComplete() {
        this.levelComplete = this.boxes
            .every(box => box.getIsOnTarget());
    }
}