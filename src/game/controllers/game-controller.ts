import type {Box} from '@/game/actors/box';
import type {Hero} from '@/game/actors/hero';
import type {Spring} from '@/game/actors/spring';
import type {Target} from '@/game/actors/target';
import type {Actions} from '@/game/constants/actions';
import type {TileMap} from '@/game/tiles/feature-map-extractor';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementAnalyser} from '@/game/solver/movement-analyser';
import type {Movement, MovementCoordinatorOutput} from '@/game/controllers/movement-coordinator';
import {MovementCoordinator} from '@/game/controllers/movement-coordinator';
import type {StaticMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';

export class GameController {
    private readonly tileMap: StaticMap;
    private readonly playerMoves: Actions[];
    private readonly movementCoordinator: MovementCoordinator;
    private readonly hero: Hero;
    private readonly boxes: Box[];
    private readonly springs: Spring[];
    private readonly targets: Target[];
    private readonly solution?: SolutionOutput;
    private readonly movementAnalyser: MovementAnalyser;

    private levelComplete: boolean = false;
    private movementsAreAllowed: boolean;

    constructor(config: { tileMap: TileMap, solution?: SolutionOutput }) {
        this.hero = config.tileMap.hero;
        this.boxes = config.tileMap.boxes;
        this.springs = config.tileMap.springs;
        this.targets = config.tileMap.targets;
        this.tileMap = config.tileMap.staticMap;
        this.solution = config.solution;
        this.playerMoves = [];
        this.levelComplete = false;
        this.movementsAreAllowed = true;

        this.movementAnalyser = new MovementAnalyser({staticMap: this.tileMap, distanceCalculator: new ManhattanDistanceCalculator()});
        this.movementCoordinator = new MovementCoordinator({
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
        let heroAction: Actions = this.hero.checkAction();
        if (this.solution?.actions?.length! > 0) {
            heroAction = this.solution?.actions?.shift()!;
        }
        this.playerMoves!.push(heroAction);

        const movement = this.movementCoordinator!.update({
            heroAction: heroAction
        });

        if (movement.mapChanged) {
            this.movementAnalyser.analyse(movement);
            this.movementsAreAllowed = false;
            await this.updateMapFeatures(movement);
            this.checkLevelComplete();
        }
    }

    private async updateMapFeatures(movementOutput: MovementCoordinatorOutput) {
        const promises: Promise<any>[] = [];
        promises.push(...movementOutput.boxes
            .filter(movementBox => !movementBox.previousPosition.isEqualTo(movementBox.currentPosition))
            .map(async movedBox => {
                const spriteBoxMoved = this.boxes
                    .find(tileBox => movedBox.previousPosition.isEqualTo(tileBox.getTilePosition()));

                await spriteBoxMoved!.move(movedBox.direction!);
                spriteBoxMoved!.setIsOnTarget(movedBox.isCurrentlyOnTarget);
            }));

        const heroPromise = async () => {
            const hero = movementOutput.hero;
            if (hero.currentPosition.isDifferentOf(hero.previousPosition)) {
                await this.hero!.move(hero.direction!);
            }
        };
        promises.push(heroPromise());

        const features = [movementOutput.hero, ...movementOutput.boxes];
        this.updateSpringsSituation(features);

        await Promise.all(promises);

        this.updateTargetCoverSituation(features);
        this.movementsAreAllowed = true;
    }

    private updateSpringsSituation(features: Movement[]) {
        features
            .forEach(feature => {
                this.springs
                    .find(spring => spring.getTilePosition().isEqualTo(feature.previousPosition))
                    ?.push();
                this.springs
                    .find(spring => spring.getTilePosition().isEqualTo(feature.currentPosition))
                    ?.activate();
            });

    }

    private updateTargetCoverSituation(features: Movement[]) {
        features
            .forEach(feature => {
                this.targets
                    .filter(target => !target.isCovered())
                    .find(target => target.getTilePosition().isEqualTo(feature.currentPosition))
                    ?.cover();

                this.targets
                    .filter(target => target.isCovered())
                    .find(target => target.getTilePosition().isEqualTo(feature.previousPosition))
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