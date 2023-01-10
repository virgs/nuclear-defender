import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import type {BoxActor} from '@/game/actors/box-actor';
import type {HeroActor} from '@/game/actors/hero-actor';
import type {GameActor} from '@/game/actors/game-actor';
import type {TargetActor} from '@/game/actors/target-actor';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementAnalyser} from '@/game/solver/movement-analyser';
import {Actions, mapActionToString} from '@/game/constants/actions';
import type {Movement, MovementOrchestratorOutput} from '@/game/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {EventEmitter, EventName} from '@/event-emitter';

export class GameEngine {
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly targets: TargetActor[];
    private readonly movementAnalyser: MovementAnalyser;
    private readonly nextMoves: Actions[];
    private readonly staticActors: GameActor[];
    private readonly boxPushMementos: MovementOrchestratorOutput[];

    private lastActionResult?: MovementOrchestratorOutput;
    private playerMoves: string;
    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private mapChangedLastCycle: boolean;
    private undoIsOver: boolean;

    constructor(config: { solution: SolutionOutput; strippedMap: MultiLayeredMap; actorMap: Map<Tiles, GameActor[]> }) {
        this.hero = config.actorMap.get(Tiles.hero)![0] as HeroActor;
        this.boxes = config.actorMap.get(Tiles.box)! as BoxActor[];
        this.targets = config.actorMap.get(Tiles.target)! as TargetActor[];
        this.staticActors = config.actorMap.get(Tiles.target)!
            .concat(config.actorMap.get(Tiles.oily)!)
            .concat(config.actorMap.get(Tiles.spring)!)
            .concat(config.actorMap.get(Tiles.treadmil)!)
            .concat(config.actorMap.get(Tiles.oneWayDoor)!);
        this.strippedMap = config.strippedMap;
        this.nextMoves = config.solution?.actions! || [];
        this.undoIsOver = true;
        this.boxPushMementos = [];
        this.playerMoves = '';
        this.levelComplete = false;
        this.animationsAreOver = true;
        this.mapChangedLastCycle = true;

        const pointMap: Map<Tiles, Point[]> = new Map<Tiles, Point[]>();
        for (let [tile, actorList] of config.actorMap.entries()) {
            pointMap.set(tile, actorList
                .map(actor => actor.getTilePosition()));
        }

        this.movementAnalyser = new MovementAnalyser({
            staticFeatures: pointMap,
            strippedMap: this.strippedMap,
            distanceCalculator: new ManhattanDistanceCalculator()
        });
        this.movementCoordinator = new MovementOrchestrator({
            strippedMap: this.strippedMap
        });
        this.targets
            .find(target => target.getTilePosition().isEqualTo(this.hero.getTilePosition()))
            ?.cover(Tiles.hero);
        this.boxes
            .forEach(spriteBox => {
                spriteBox.setIsOnTarget(this.targets
                    .some(target => {
                        const isCovered = target.getTilePosition().isEqualTo(spriteBox.getTilePosition());
                        if (isCovered) {
                            target.cover(Tiles.box);
                        }
                        return isCovered;
                    }));
            });

        EventEmitter.listenToEvent(EventName.UNDO_BUTTON_CLICKED, async () => this.undoLastMovement());

    }

    public isLevelComplete(): boolean {
        return this.levelComplete;
    }

    public getPlayerMoves(): string {
        return this.playerMoves;
    }

    public async update(): Promise<void> {
        if (this.animationsAreOver && !this.levelComplete) {
            this.nextMoves.push(this.hero.checkAction());
            const heroAction = this.nextMoves.shift()!;

            if (this.mapChangedLastCycle || heroAction !== Actions.STAND) {
                this.mapChangedLastCycle = false;
                const actionResult = await this.movementCoordinator!.update({
                    heroAction: heroAction,
                    hero: {point: this.hero.getTilePosition(), id: this.hero.getId()},
                    boxes: this.boxes.map(box => ({point: box.getTilePosition(), id: box.getId()})),
                    lastActionResult: this.lastActionResult
                });

                this.lastActionResult = actionResult;
                this.registerPlayerMove(heroAction, actionResult);
                await this.updateMap(actionResult);
            }
        }
    }

    private async updateMap(actionResult: MovementOrchestratorOutput) {
        if (actionResult.mapChanged) {
            this.mapChangedLastCycle = true;
            // this.movementAnalyser.analyse(actionResult);
            // console.log(this.movementAnalyser.analyse(actionResult));
            await this.updateAnimations(actionResult);
            this.checkLevelComplete();
        }
    }

    private registerPlayerMove(heroAction: Actions, actionResult: MovementOrchestratorOutput) {
        let moveLetter = mapActionToString(heroAction);
        if (heroAction !== Actions.STAND) {
            if (this.lastActionResult?.boxes
                .some(box => box.currentPosition.isDifferentOf(box.nextPosition) &&
                    this.lastActionResult?.hero.nextPosition.isEqualTo(box.currentPosition))) {
                moveLetter = moveLetter.toUpperCase();
                this.boxPushMementos.push(actionResult);
            }
        }

        this.playerMoves = moveLetter;
    }

    private async updateAnimations(lastAction: MovementOrchestratorOutput) {
        this.animationsAreOver = false;
        const animationsPromises: Promise<any>[] = [];
        animationsPromises.push(...lastAction.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.id === tileBox.getId())!;
                await spriteBoxMoved?.move(movedBox.nextPosition);
            }));

        const heroAnimationPromise = async () => {
            const hero = lastAction.hero;
            if (hero.nextPosition.isDifferentOf(hero.currentPosition)) {
                await this.hero!.move(hero.nextPosition, hero.direction);
            }
        };
        animationsPromises.push(heroAnimationPromise());

        this.boxes
            .forEach(spriteBox => {
                spriteBox!.setIsOnTarget(this.targets
                    .some(target => target.getTilePosition().isEqualTo(spriteBox.getTilePosition())));
            });

        const movementMap = new Map<Tiles, Movement[]>();
        movementMap.set(Tiles.box, lastAction.boxes);
        movementMap.set(Tiles.hero, [lastAction.hero]);
        this.updateActorsCoveringSituation(movementMap);
        await Promise.all(animationsPromises);

        this.animationsAreOver = true;
    }

    private updateActorsCoveringSituation(dynamicFeatures: Map<Tiles, Movement[]>) {
        //NOTE: It's important to have the 'cover' method being called before 'uncover', so a sprite doesn't get uncovered for milliseconds when it's uncover then cover right away
        dynamicFeatures
            .forEach((features, tile) => {
                features.filter(feature => feature.nextPosition.isDifferentOf(feature.currentPosition))
                    .forEach(movedFeature => {
                        this.staticActors
                            .find(actor => actor.getTilePosition().isEqualTo(movedFeature.nextPosition))
                            ?.cover(tile);
                        this.staticActors
                            .find(actor => actor.getTilePosition().isEqualTo(movedFeature.currentPosition))
                            ?.uncover(tile);
                    });
            });
    }

    private checkLevelComplete() {
        this.levelComplete = this.boxes
            .every(box => box.getIsOnTarget());
    }

    private async undoLastMovement() {
        if (this.undoIsOver) {
            if (this.boxPushMementos.length > 0) {
                this.undoIsOver = false;
                const lastAction = this.boxPushMementos.pop()!;
                this.lastActionResult = this.boxPushMementos[this.boxPushMementos.length - 1];
                this.playerMoves = this.playerMoves.substring(0, this.playerMoves.length - 1);

                const undoLastAction: MovementOrchestratorOutput = {
                    mapChanged: true,
                    hero: {
                        id: this.hero.getId(),
                        currentPosition: lastAction.hero.nextPosition,
                        nextPosition: lastAction.hero.currentPosition,
                        direction: lastAction.hero.direction
                    },
                    boxes: lastAction.boxes
                        .map(box => ({
                            id: box.id,
                            currentPosition: box.nextPosition,
                            nextPosition: box.currentPosition,
                            direction: undefined
                        }))
                };
                await this.updateAnimations(undoLastAction);
                this.undoIsOver = true;
            }
        }
    }

}