import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import type {Box} from '@/game/actors/box';
import type {Hero} from '@/game/actors/hero';
import {Actions} from '../constants/actions';
import type {Target} from '@/game/actors/target';
import type {TileCodes} from '@/game/tiles/tile-codes';
import {configuration} from '../constants/configuration';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import type {MovementCoordinatorOutput} from '../solver/movement-coordinator';
import {MovementCoordinator} from '../solver/movement-coordinator';
import {MapFeaturesExtractor} from '../tiles/map-features-extractor';
import {LightSystemManager} from '@/game/lights/light-system-manager';
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
    private target: Target[] = [];
    private staticMap?: { width: number, height: number, tiles: TileCodes[][] };
    private solution?: SolutionOutput;
    private lightSystemManager?: LightSystemManager;

    constructor() {
        super(Scenes[Scenes.GAME]);
    }

    public init() {
        this.levelComplete = false;
        this.playerMovesSoFar = [];
    }

    public preload() {
        //Note needed only when loading from file

        // this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        // this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        // this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        //     this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        // });

        this.load.spritesheet({
            key: configuration.tiles.spriteSheetKey,
            url: configuration.tiles.sheetAsset,
            normalMap: configuration.tiles.sheetAssetNormal,
            frameConfig: {
                frameWidth: configuration.tiles.horizontalSize,
                frameHeight: configuration.tiles.verticalSize
            }
        });
    }

    public async create() {
        const codedMap: string = Store.getInstance().map;
        const data = new StandardSokobanAnnotationMapper().map(codedMap);
        const output = new ScreenPropertiesCalculator().calculate(data.staticMap);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.world.tileSize.horizontal * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(configuration.world.tileSize.vertical * output.scale);

        const mapFeaturesExtractor = new MapFeaturesExtractor(this, output.scale);
        const featuresMap = mapFeaturesExtractor.extractFeatures(data, output);
        this.hero = featuresMap.hero;
        this.boxes = featuresMap.boxes;
        this.target = featuresMap.targets;
        this.staticMap = data.staticMap;

        this.lightSystemManager = new LightSystemManager({scene: this, featuresMap: featuresMap});
        this.movementCoordinator = new MovementCoordinator(data.staticMap);
        // this.solution = await new SokobanSolver({
        //     staticMap: data.staticMap, cpu: {sleepingCycle: 2500, sleepForInMs: 50},
        //     distanceCalculator: new QuadracticEuclidianDistanceCalculator()
        // }).solve(data.hero!, data.boxes);

        this.allowHeroMovement = true;
    }

    public async update(time: number, delta: number) {
        if (this.levelComplete) {
            return;
        }
        this.lightSystemManager!.update();

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
                this.lightSystemManager!.startMovementDetection();
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

                this.target
                    .find(target => target.getTilePosition().equal(movedBox.currentPosition))
                    ?.cover();

                this.target
                    .find(target => target.getTilePosition().equal(movedBox.previousPosition))
                    ?.uncover();
            }));
        promises.push(this.hero!.move(movementCoordinatorOutput.hero.direction!));
        await Promise.all(promises);
        this.allowHeroMovement = true;
    }

    private onMovementsComplete(): void {
        this.lightSystemManager!.stopMovementDetection();
        this.checkLevelComplete();
    }

    private checkLevelComplete() {
        if (this.boxes
            .every(box => box.getIsOnTarget())) {
            // this.levelComplete = true;
            console.log('currentLevel complete', this.playerMovesSoFar?.filter(action => action !== Actions.STAND));
            setTimeout(async () => {
                // this.lights.destroy();

                // Store.getInstance().router.push('/next-level');
            }, 1500);
            // }
        }
    }

}
