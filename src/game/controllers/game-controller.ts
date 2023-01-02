import type {Actions} from '@/game/constants/actions';
import type {BoxActor} from '@/game/actors/box-actor';
import type {HeroActor} from '@/game/actors/hero-actor';
import type {GameActor} from '@/game/actors/game-actor';
import type {SpringActor} from '@/game/actors/spring-actor';
import type {TargetActor} from '@/game/actors/target-actor';
import type {TileMap} from '@/game/tiles/feature-map-extractor';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementAnalyser} from '@/game/solver/movement-analyser';
import type {OilyFloorActor} from '@/game/actors/oily-floor-actor';
import type {Movement, MovementOrchestratorOutput} from '@/game/controllers/movement-orchestrator';
import {MovementOrchestrator} from '@/game/controllers/movement-orchestrator';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';

export class GameController {
    private readonly tileMap: StaticMap;
    private readonly playerMoves: Actions[];
    private readonly movementCoordinator: MovementOrchestrator;
    private readonly hero: HeroActor;
    private readonly boxes: BoxActor[];
    private readonly springs: SpringActor[];
    private readonly oilyFloors: OilyFloorActor[];
    private readonly targets: TargetActor[];
    private readonly movementAnalyser: MovementAnalyser;
    private readonly nextMoves: Actions[];

    private levelComplete: boolean = false;
    private animationsAreOver: boolean;
    private lastActionResult?: MovementOrchestratorOutput;

    constructor(config: { tileMap: TileMap, solution?: SolutionOutput }) {
        this.hero = config.tileMap.hero;
        this.boxes = config.tileMap.boxes;
        this.springs = config.tileMap.springs;
        this.oilyFloors = config.tileMap.oilyFloors;
        this.targets = config.tileMap.targets;
        this.tileMap = config.tileMap.staticMap;
        this.nextMoves = config.solution?.actions! || [];
        this.playerMoves = [];
        this.levelComplete = false;
        this.animationsAreOver = true;

        this.movementAnalyser = new MovementAnalyser({staticMap: this.tileMap, distanceCalculator: new ManhattanDistanceCalculator()});
        this.movementCoordinator = new MovementOrchestrator({
            staticMap: this.tileMap
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

        const features = [...this.lastActionResult!.boxes, this.lastActionResult!.hero];

        this.updateActorsCoveringSituation(features, this.targets);
        this.updateActorsCoveringSituation(features, this.springs);
        this.updateActorsCoveringSituation(features, this.oilyFloors);
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