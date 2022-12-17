import Phaser from 'phaser';
import {Hero} from '../actors/hero';
import {levels} from '../levels/levels';
import {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {TileCode} from '../tiles/tile-code';

export class SplashScreenScene extends Phaser.Scene {
    private readonly fileLevelExtractor: FileLevelExtractor;

    constructor() {
        super('splash-screen');

        this.fileLevelExtractor = new FileLevelExtractor();
    }

    preload() {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous'
        ]);
        this.load.addFile(fonts);

        // this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}0.json`);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    create(data: { map: TileCode[][] }) {
        // const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        // const tileCodeMap = this.fileLevelExtractor.extractToTileCodeMap(tileMap);
        const map = data.map;
        console.log(map);
        const gameSceneConfiguration: GameSceneConfiguration = {
            map: map,
            currentLevel: 0,
            hero: new Hero(),
            bestMoves: 0
        };
        this.scene.start('game', gameSceneConfiguration);
    }

}
