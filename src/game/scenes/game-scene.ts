import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import {Actions} from '../constants/actions';
import {InputManager} from '@/game/input/input-manager';
import {configuration} from '../constants/configuration';
import {GameEngine} from '@/game/engine/game-engine';
import {FeatureMapExtractor} from '../tiles/feature-map-extractor';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';

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
        //Note needed only when loading from file

        // this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        // this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        // this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        //     this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        // });

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
        InputManager.setup(this);
        const store = Store.getInstance();
        const codedMap: string = store.map;

        //TODO move this section to scenes before this one
        const map = new StandardSokobanAnnotationTranslator().translate(codedMap);
        const output = new ScreenPropertiesCalculator().calculate(map);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.world.tileSize.horizontal * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(configuration.world.tileSize.vertical * output.scale);
        //TODO end of section

        this.lights.enable()
            .setAmbientColor(Phaser.Display.Color.HexStringToColor(configuration.colors.ambientColor).color);

        const mapfeatureMapExtractor = new FeatureMapExtractor(this, output.scale, map);
        const tileMap = mapfeatureMapExtractor.extract();

        this.gameEngine = new GameEngine({tileMap: tileMap, solution: store.solution});
    }

    public async update(time: number, delta: number) {
        InputManager.getInstance().update(delta);
        if (this.allowUpdates) {
            await this.gameEngine!.update();
            if (this.gameEngine!.isLevelComplete()) {
                this.allowUpdates = false;
                console.log('currentLevel complete', this.gameEngine!.getPlayerMoves()
                    .filter(action => action !== Actions.STAND)
                    .map(action => Actions[action]));
                setTimeout(async () => {
                    this.lights.destroy();

                    console.log(Store.getInstance())
                    Store.getInstance().router.push('/next-level');
                }, 1500);
                // }
            }
        }
    }

}
