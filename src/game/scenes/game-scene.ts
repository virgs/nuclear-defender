import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import {Actions} from '../constants/actions';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameEngine} from '@/game/engine/game-engine';
import {GameActorsCreator} from '../tiles/game-actors-creator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {FeatureRemover} from '@/game/tiles/feature-remover';
import {Tiles} from '@/game/tiles/tiles';

export type GameSceneConfiguration = {
    map: string,
    moves?: Actions[]
    currentLevel: number,
    bestMoves?: number,
    router: any
};

//TODO create memento-recorder-class com a habilidade de 'undo' entre cada action do hero que não seja standing
export class GameScene extends Phaser.Scene {
    private allowUpdates?: boolean;
    private gameEngine?: GameEngine;

    constructor() {
        super(Scenes[Scenes.GAME]);
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

    public async create(scene: Phaser.Scene, scale: number) {
        InputManager.setup(this);
        const store = Store.getInstance();
        const codedMap: string = store.map;

        //TODO move this section to scenes before this one (splash view)
        const map = new StandardSokobanAnnotationTranslator().translate(codedMap);
        const output = new ScreenPropertiesCalculator().calculate(map);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.tiles.horizontalSize * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(Math.trunc(configuration.tiles.verticalSize * configuration.tiles.verticalPerspective) * output.scale);
        //TODO end of section

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const strip = new FeatureRemover([Tiles.hero, Tiles.box])
            .strip(map);

        const actorsCreator = new GameActorsCreator({
            scene: this,
            scale: output.scale,
            dynamicFeatures: strip.removedFeatures,
            matrix: strip.strippedLayeredTileMatrix
        });
        const actorMap = actorsCreator.create();

        this.gameEngine = new GameEngine({
            tileMap: strip.strippedLayeredTileMatrix,
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
                console.log('currentLevel complete', this.gameEngine!.getPlayerMoves()
                    .filter(action => action !== Actions.STAND)
                    .map(action => Actions[action]));
                setTimeout(async () => {
                    this.lights.destroy();

                    console.log(Store.getInstance());
                    Store.getInstance().router.push('/next-level');
                }, 1500);
            }
        }
    }

}
