import type {BoxActor} from '@/game/actors/box-actor';
import type {HeroActor} from '@/game/actors/hero-actor';
import type {SpringActor} from '@/game/actors/spring-actor';
import type {TargetActor} from '@/game/actors/target-actor';
import type {Actions} from '@/game/constants/actions';
import type {TileMap} from '@/game/tiles/feature-map-extractor';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementAnalyser} from '@/game/solver/movement-analyser';
import type {Movement, MovementCoordinatorOutput} from '@/game/controllers/movement-orchestrator';
import {MovementOrchestrator} from '@/game/controllers/movement-orchestrator';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import type {GameActor} from '@/game/actors/game-actor';

export class GameController {
    private readonly tileMap: StaticMap;
    private readonly playerMoves: Actions[];
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly springs: SpringActor[];
    private readonly targets: TargetActor[];
    private readonly solution?: SolutionOutput;
    private readonly movementAnalyser: MovementAnalyser;

    private levelComplete: boolean = false;
    private animationsAreOver: boolean;

    constructor(config: { tileMap: TileMap, solution?: SolutionOutput }) {
        this.hero = config.tileMap.hero;
        this.boxes = config.tileMap.boxes;
        this.springs = config.tileMap.springs;
        this.targets = config.tileMap.targets;
        this.tileMap = config.tileMap.staticMap;
        this.solution = config.solution;
        this.playerMoves = [];
        this.levelComplete = false;
        this.animationsAreOver = true;

        this.movementAnalyser = new MovementAnalyser({staticMap: this.tileMap, distanceCalculator: new ManhattanDistanceCalculator()});
        this.movementCoordinator = new MovementOrchestrator({
            staticMap: this.tileMap,
            hero: this.hero.getTilePosition(),
            boxes: this.boxes.map(box => box.getTilePosition())
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
            let heroAction: Actions = this.hero.checkAction();
            if (this.solution?.actions?.length! > 0) {
                heroAction = this.solution?.actions?.shift()!;
            }
            this.playerMoves!.push(heroAction);

            const movement = await this.movementCoordinator!.update({
                heroAction: heroAction
            });

            if (movement.mapChanged) {
                this.movementAnalyser.analyse(movement);
                await this.updateMapFeatures(movement);
                this.checkLevelComplete();
            }
        }
    }

    private async updateMapFeatures(movementOutput: MovementCoordinatorOutput) {
        this.animationsAreOver = false;
        const animationsPromises: Promise<any>[] = [];
        animationsPromises.push(...movementOutput.boxes
            .filter(movementBox => movementBox.currentPosition.isDifferentOf(movementBox.nextPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.currentPosition.isEqualTo(tileBox.getTilePosition()))!;

                await spriteBoxMoved.move(movedBox.direction!);
                spriteBoxMoved!.setIsOnTarget(this.targets
                    .some(target => target.getTilePosition().isEqualTo(spriteBoxMoved.getTilePosition())));
            }));

        const heroPromise = async () => {
            const hero = movementOutput.hero;
            if (hero.nextPosition.isDifferentOf(hero.currentPosition)) {
                await this.hero!.move(hero.direction!);
            }
        };
        animationsPromises.push(heroPromise());

        const features = [...movementOutput.boxes, movementOutput.hero];

        this.updateActorsCoveringSituation(features, this.targets);
        this.updateActorsCoveringSituation(features, this.springs);
        await Promise.all(animationsPromises);

        this.animationsAreOver = true;
    }

    private updateActorsCoveringSituation(features: Movement[], actors: GameActor[]) {
        features
            .filter(feature => feature.nextPosition.isDifferentOf(feature.currentPosition))
            .forEach(movedFeature => {
                actors
                    .find(actor => actor.getTilePosition().isEqualTo(movedFeature.nextPosition))
                    ?.onCover();
                actors
                    .find(actor => actor.getTilePosition().isEqualTo(movedFeature.currentPosition))
                    ?.onUncover();
            });

    }

    private checkLevelComplete() {
        if (this.boxes
            .every(box => box.getIsOnTarget())) {
            this.levelComplete = true;
        }
    }
}