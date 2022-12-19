import Phaser from 'phaser';
import {Hero} from '../actors/hero';
import {TileCode} from '../tiles/tile-code';
import {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {levels} from '../levels/levels';
import {MapBuilder} from '../tiles/map-builder';
import {Scenes} from './scenes';

export class SplashScreenScene extends Phaser.Scene {
    private readonly fileLevelExtractor: FileLevelExtractor;

    constructor() {
        super(Scenes[Scenes.SPLASH_SCREEN]);

        this.fileLevelExtractor = new FileLevelExtractor();
    }

    preload() {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous'
        ]);
        this.load.addFile(fonts);

        //TODO only needed when loading from file
        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}1.json`);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    create(data: { map: TileCode[][] }) {
        const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        // const map = this.fileLevelExtractor.extractToTileCodeMap(tileMap); // from file
        const map = new MapBuilder().build(data.map); // from url
        // const map = new MapBuilder().build(levels[0]); // from code
        const gameSceneConfiguration: GameSceneConfiguration = {
            map: map,
            currentLevel: 0,
            bestMoves: 0
        };
        this.scene.start(Scenes[Scenes.GAME], gameSceneConfiguration);
    }

}
