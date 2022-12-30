import Phaser from 'phaser';
import {Store} from '@/store';
import {Scenes} from './scenes';
import {Actions} from '../constants/actions';
import {configuration} from '../constants/configuration';
import {FeatureMapExtractor} from '../tiles/feature-map-extractor';
import {StandardSokobanAnnotationTranslator} from '@/game/tiles/standard-sokoban-annotation-translator';
import {ScreenPropertiesCalculator} from '@/game/math/screen-properties-calculator';
import {GameController} from '@/game/controllers/game-controller';

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
    private gameController?: GameController;

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
        const store = Store.getInstance();
        const codedMap: string = store.map;

        //TODO move this section to scenes before this one
        const map = new StandardSokobanAnnotationTranslator().translate(codedMap);
        const output = new ScreenPropertiesCalculator().calculate(map);
        configuration.world.tileSize.horizontal = Math.trunc(configuration.world.tileSize.horizontal * output.scale);
        configuration.world.tileSize.vertical = Math.trunc(configuration.world.tileSize.vertical * output.scale);
        //TODO end of section

        this.lights.enable();
        this.lights.enable().setAmbientColor(0x555555);

        const mapfeatureMapExtractor = new FeatureMapExtractor(this, output.scale, map);
        const tileMap = mapfeatureMapExtractor.extract();

        this.gameController = new GameController({tileMap: tileMap, solution: store.solution});

        this.allowUpdates = true;
    }

    public async update(time: number, delta: number) {
        if (this.allowUpdates) {
            await this.gameController!.update();
            if (this.gameController!.isLevelComplete()) {
                this.allowUpdates = false;
                console.log('currentLevel complete', this.gameController!.getPlayerMoves().filter(action => action !== Actions.STAND));
                setTimeout(async () => {
                    // this.lights.destroy();

                    // Store.getInstance().router.push('/next-level');
                }, 1500);
                // }
            }
        }
    }

}
