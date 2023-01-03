import {Tiles} from '@/game/tiles/tiles';
import type {Actions} from '@/game/constants/actions';
import type {BoxActor} from '@/game/actors/box-actor';
import type {HeroActor} from '@/game/actors/hero-actor';
import type {TargetActor} from '@/game/actors/target-actor';
import type {TileMap} from '@/game/tiles/game-actors-creator';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementAnalyser} from '@/game/solver/movement-analyser';
import type {Movement, MovementOrchestratorOutput} from '@/game/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/game/engine/movement-orchestrator';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import type {GameActor} from '@/game/actors/game-actor';

export class GameEngine {
    private readonly multiLayeredStrippedMap: MultiLayeredMap;
    private readonly playerMoves: Actions[];
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly targets: TargetActor[];
    private readonly movementAnalyser: MovementAnalyser;
    private readonly nextMoves: Actions[];
    private readonly actors: GameActor[];

    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private lastActionResult?: MovementOrchestratorOutput;

    constructor(config: { tileMap: TileMap, solution?: SolutionOutput }) {
        this.hero = config.tileMap.indexedMap.get(Tiles.hero)![0] as HeroActor;
        this.boxes = config.tileMap.indexedMap.get(Tiles.box)! as BoxActor[];
        this.targets = config.tileMap.indexedMap.get(Tiles.target)! as TargetActor[];
        this.actors = config.tileMap.indexedMap.get(Tiles.target)!
            .concat(config.tileMap.indexedMap.get(Tiles.oily)!)
            .concat(config.tileMap.indexedMap.get(Tiles.spring)!)
            .concat(config.tileMap.indexedMap.get(Tiles.treadmil)!)
            .concat(config.tileMap.indexedMap.get(Tiles.oneWayDoor)!);
        this.multiLayeredStrippedMap = config.tileMap.multiLayeredStrippedMap;
        this.nextMoves = config.solution?.actions! || [];
        this.playerMoves = [];
        this.levelComplete = false;
        this.animationsAreOver = true;

        this.movementAnalyser = new MovementAnalyser({
            multiLayeredStrippedMap: this.multiLayeredStrippedMap,
            distanceCalculator: new ManhattanDistanceCalculator()
        });
        this.movementCoordinator = new MovementOrchestrator({
            multiLayeredStrippedMap: this.multiLayeredStrippedMap
        });
        this.boxes
            .forEach(spriteBox => {
                spriteBox.setIsOnTarget(this.targets
                    .some(target => {
                        const isCovered = target.getTilePosition().isEqualTo(spriteBox.getTilePosition());
                        if (isCovered) {
                            target.cover();
                        }
                        return isCovered;
                    }));
            });

    }

    public isLevelComplete(): boolean {
        return this.levelComplete;
    }

    public getPlayerMoves(): Actions[] {
        return this.playerMoves;
    }

    public async update(): Promise<void> {
        if (this.animationsAreOver) {
            this.nextMoves.push(this.hero.checkAction());
            const heroAction = this.nextMoves.shift()!;
            this.playerMoves!.push(heroAction);

            this.lastActionResult = await this.movementCoordinator!.update({
                heroAction: heroAction,
                heroPosition: this.hero.getTilePosition(),
                boxes: this.boxes.map(box => box.getTilePosition()),
                lastActionResult: this.lastActionResult
            });

            if (this.lastActionResult.mapChanged) {
                this.movementAnalyser.analyse(this.lastActionResult!);
                await this.updateMapFeatures();
                this.checkLevelComplete();
            }
        }
    }

    private async updateMapFeatures() {
        this.animationsAreOver = false;
        const animationsPromises: Promise<any>[] = [];
        animationsPromises.push(...this.lastActionResult!.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.currentPosition.isEqualTo(tileBox.getTilePosition()))!;
                await spriteBoxMoved?.move(movedBox.direction!);
            }));

        const heroAnimationPromise = async () => {
            const hero = this.lastActionResult!.hero;
            if (hero.nextPosition.isDifferentOf(hero.currentPosition)) {
                await this.hero!.move(hero.direction!);
            }
        };
        animationsPromises.push(heroAnimationPromise());

        this.boxes
            .forEach(spriteBox => {
                spriteBox!.setIsOnTarget(this.targets
                    .some(target => target.getTilePosition().isEqualTo(spriteBox.getTilePosition())));
            });

        this.updateActorsCoveringSituation([...this.lastActionResult!.boxes, this.lastActionResult!.hero]);
        await Promise.all(animationsPromises);

        this.animationsAreOver = true;
    }

    private updateActorsCoveringSituation(dynamicFeatures: Movement[]) {
        dynamicFeatures
            .filter(feature => feature.nextPosition.isDifferentOf(feature.currentPosition))
            .forEach(movedFeature => {
                this.actors
                    .find(actor => actor.getTilePosition().isEqualTo(movedFeature.nextPosition))
                    ?.cover();
                this.actors
                    .find(actor => actor.getTilePosition().isEqualTo(movedFeature.currentPosition))
                    ?.uncover();
            });
    }

    private checkLevelComplete() {
        if (this.boxes
            .every(box => box.getIsOnTarget())) {
            this.levelComplete = true;
        }
    }
}