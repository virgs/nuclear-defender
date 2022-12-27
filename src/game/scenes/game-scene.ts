import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import type {Box} from '@/game/actors/box';
import type {Hero} from '@/game/actors/hero';
import {Actions} from '../constants/actions';
import type {TileCodes} from '@/game/tiles/tile-codes';
import {configuration} from '../constants/configuration';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {MovementCoordinator} from '../solver/movement-coordinator';
import {MapFeaturesExtractor} from '../tiles/map-features-extractor';
import type {MovementCoordinatorOutput} from '../solver/movement-coordinator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {StandardSokobanAnnotationMapper} from '@/game/tiles/standard-sokoban-annotation-mapper';

export type GameSceneConfiguration = {
    map: string,
    moves?: Actions[]
    currentLevel: number,
    bestMoves?: number,
    router: any
};

//TODO create memento-recorder-class com a habilidade de 'undo' entre cada action do hero que não seja standing
export class GameScene extends Phaser.Scene {
    private movementCoordinator?: MovementCoordinator;
    private levelComplete?: boolean;
    private allowHeroMovement?: boolean;
    private playerMovesSoFar?: Actions[];

    private hero?: Hero;
    private boxes: Box[] = [];
    private staticMap?: { width: number, height: number, tiles: TileCodes[][] };
    private solution?: SolutionOutput;

    constructor() {
        super(Scenes[Scenes.GAME]);
    }

    public init() {
        this.levelComplete = false;
        this.playerMovesSoFar = [];
    }

    public preload() {
        this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        });

        this.load.spritesheet(configuration.tiles.spriteSheetKey, configuration.tiles.sheetAsset, {
            frameWidth: configuration.tiles.horizontalSize,
            startFrame: 0
        });
    }

    public async create() {
        this.lights.enable();

        const codedMap: string = Store.getInstance().map;
        const data = new StandardSokobanAnnotationMapper().map(codedMap);
        const output = new ScreenPropertiesCalculator().calculate(data.staticMap);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.world.tileSize.horizontal * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(configuration.world.tileSize.vertical * output.scale);

        const mapFeaturesExtractor = new MapFeaturesExtractor(this, output.scale);
        const featuresMap = mapFeaturesExtractor.extractFeatures(data, output);
        this.hero = featuresMap.hero;
        this.boxes = featuresMap.boxes;

        this.staticMap = data.staticMap;
        this.movementCoordinator = new MovementCoordinator(data.staticMap);
        // const breathingPeriod = 3000;
        // const breathTime = 50;
        this.solution = await new SokobanSolver({staticMap: data.staticMap, cpu: {sleepingCycle: 2500, sleepForInMs: 50}}).solve(data.hero!, data.boxes);

        this.allowHeroMovement = true;
    }

    public async update(time: number, delta: number) {
        if (this.levelComplete) {
            return;
        }

        if (this.allowHeroMovement) {
            let heroAction: Actions = this.hero!.checkAction();
            if (this.solution?.actions?.length! > 0) {
                heroAction = this.solution?.actions?.shift()!;
            }
            this.playerMovesSoFar!.push(heroAction);

            const movement = this.movementCoordinator!.update({
                heroAction: heroAction,
                staticMap: this.staticMap!,
                hero: this.hero!.getTilePosition(),
                boxes: this.boxes!.map(box => box.getTilePosition())
            });

            if (movement.mapChanged) {
                this.allowHeroMovement = false;
                await this.moveMapFeatures(movement);
                this.onMovementsComplete();
            }
        }
    }

    private async moveMapFeatures(movementCoordinatorOutput: MovementCoordinatorOutput) {
        const promises: Promise<any>[] = [];
        promises.push(...movementCoordinatorOutput.boxes
            //TODO filter by box id
            .filter(box => !box.previousPosition.equal(box.currentPosition))
            .map(async movedBox => {
                const tileBoxToMove = this.boxes
                    .find(tileBox => movedBox.previousPosition.equal(tileBox.getTilePosition()));

                await tileBoxToMove!.move(movedBox.direction!);
                tileBoxToMove!.setIsOnTarget(movedBox.isCurrentlyOnTarget);
            }));
        promises.push(this.hero!.move(movementCoordinatorOutput.hero.direction!));
        await Promise.all(promises);
        this.allowHeroMovement = true;
    }

    private onMovementsComplete(): void {
        this.checkLevelComplete();
    }

    private checkLevelComplete() {
        if (this.boxes.every(box => box.getIsOnTarget())) {
            this.levelComplete = true;
            console.log('currentLevel complete', this.playerMovesSoFar?.filter(action => action !== Actions.STAND));
            setTimeout(async () => {
                // Store.getInstance().router.push('/next-level');
            }, 1500);
            // }
        }
    }

}
