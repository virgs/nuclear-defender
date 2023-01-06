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
import {Directions, getOpositeDirectionOf} from '@/game/constants/directions';

export class GameEngine {
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly targets: TargetActor[];
    private readonly movementAnalyser: MovementAnalyser;
    private readonly nextMoves: Actions[];
    private readonly staticActors: GameActor[];

    private lastActionResult: MovementOrchestratorOutput[];
    private playerMoves: string;
    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private mapChangedLastCycle: boolean;

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
        this.playerMoves = '';
        this.levelComplete = false;
        this.animationsAreOver = true;
        this.mapChangedLastCycle = true;
        this.lastActionResult = [];

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
        if (this.animationsAreOver) {
            this.nextMoves.push(this.hero.checkAction());
            const heroAction = this.nextMoves.shift()!;

            if (this.mapChangedLastCycle || heroAction !== Actions.STAND) {
                this.mapChangedLastCycle = false;
                console.log('move coordinator');
                const actionResult = await this.movementCoordinator!.update({
                    heroAction: heroAction,
                    heroPosition: this.hero.getTilePosition(),
                    boxes: this.boxes.map(box => box.getTilePosition()),
                    lastActionResult: this.lastActionResult[this.lastActionResult.length - 1]
                });
                this.lastActionResult.push(actionResult);
                this.registerPlayerMove(heroAction);
                await this.updateMap(actionResult);
            }
        }
    }

    private async updateMap(actionResult: MovementOrchestratorOutput) {
        if (actionResult.mapChanged) {
            this.mapChangedLastCycle = true;
            this.movementAnalyser.analyse(actionResult);
            await this.updateAnimations(actionResult);
            this.checkLevelComplete();
        }
    }

    private registerPlayerMove(heroAction: Actions) {
        const lastAction = this.lastActionResult[this.lastActionResult.length - 1];
        let moveLetter = mapActionToString(heroAction);
        if (heroAction !== Actions.STAND) {
            if (lastAction.boxes
                .some(box => box.currentPosition.isDifferentOf(box.nextPosition) &&
                    lastAction.hero.nextPosition.isEqualTo(box.currentPosition))) {
                moveLetter = moveLetter.toUpperCase();
            }
        }
        this.playerMoves += moveLetter;
    }

    private async updateAnimations(lastAction: MovementOrchestratorOutput) {
        this.animationsAreOver = false;
        const animationsPromises: Promise<any>[] = [];
        animationsPromises.push(...lastAction.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.currentPosition.isEqualTo(tileBox.getTilePosition()))!;
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
        this.levelComplete = false;
        if (this.boxes
            .every(box => box.getIsOnTarget())) {
            this.levelComplete = true;
        }
    }

    private async undoLastMovement() {
        //it has to pause for 3 seconds
        console.log('undo', this.lastActionResult.length);
        if (this.lastActionResult.length > 2) {

            this.lastActionResult = this.lastActionResult
                .filter((_, index) => index < this.lastActionResult.length-1);
            this.playerMoves = this.playerMoves.substring(0, this.playerMoves.length - 1);
            const lastAction = this.lastActionResult[this.lastActionResult.length - 1];
            console.log(lastAction);
            if (lastAction.hero.direction !== undefined) {
                lastAction.hero.direction = getOpositeDirectionOf(lastAction.hero.direction!);
            }
            lastAction.boxes
                .filter(box => box.direction !== undefined)
                .forEach(box => {
                    const swap = box.currentPosition;
                    box.currentPosition = box.nextPosition;
                    box.nextPosition = swap;
                    return box.direction = getOpositeDirectionOf(box.direction!);
                });
            await this.updateAnimations(lastAction);
            await new Promise(r => setTimeout(r, 3000));
        }
    }

}