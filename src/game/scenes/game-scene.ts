import Phaser from 'phaser';
import {Store} from '@/store';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameEngine} from '@/game/engine/game-engine';
import {GameActorsCreator} from '../tiles/game-actors-creator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {SokobanMapProcessor} from '@/game/tiles/sokoban-map-processor';
import {Tiles} from '@/game/tiles/tiles';

export type GameSceneConfiguration = {
    map: string,
    moves: string,
    currentLevel: number,
    bestMoves?: number,
    router: any
};

//TODO create memento-recorder-class com a habilidade de 'undo' entre cada action do hero que não seja standing
export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameEngine?: GameEngine;
    private initialTime?: number;

    constructor() {
        super('game');
    }

    public init() {
    }

    public preload() {
        this.load.image(configuration.floorTextureKey, configuration.floorTexture);

        this.load.spritesheet({
            key: configuration.tiles.spriteSheetKey,
            url: configuration.tiles.sheetAsset,
            normalMap: configuration.tiles.sheetAssetNormal,
            frameConfig: {
                frameWidth: configuration.tiles.horizontalSize,
                frameHeight: configuration.tiles.verticalSize
            }
        });
        this.allowUpdates = true;
    }

    public async create() {
        this.initialTime = new Date().getTime();
        InputManager.setup(this);
        const store = Store.getInstance();

        const screenProperties = new ScreenPropertiesCalculator()
            .calculate(store.strippedLayeredTileMatrix!);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * screenProperties.scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * screenProperties.scale);

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const actorsCreator = new GameActorsCreator({
            scene: this,
            scale: screenProperties.scale,
            dynamicFeatures: store.features,
            matrix: store.strippedLayeredTileMatrix!
        });
        const actorMap = actorsCreator.create();

        this.gameEngine = new GameEngine({
            strippedMap: store.strippedLayeredTileMatrix!,
            actorMap: actorMap,
            solution: store.solution
        });
    }

    public async update(time: number, delta: number) {
        InputManager.getInstance().update();
        if (this.allowUpdates) {
            await this.gameEngine!.update();
            if (this.gameEngine!.isLevelComplete()) {
                this.allowUpdates = false;
                console.log('currentLevel complete', this.gameEngine!.getPlayerMoves());
                setTimeout(async () => {
                    // this.changeScene();
                }, 1500);
            }
        }
    }

    private changeScene() {
        this.lights.destroy();

        const store = Store.getInstance();
        store.totalTimeInMs = new Date().getTime() - this.initialTime!;
        store.movesCode = this.gameEngine!.getPlayerMoves();
        store.router.push('/next-level');
    }
}
