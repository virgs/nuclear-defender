import Phaser from 'phaser';

import {Hero} from '../actors/hero';
import {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {levels} from '../levels/levels';

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

        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}0.json`);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    create() {
        const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        const tileCodeMap = this.fileLevelExtractor.extractToTileCodeMap(tileMap);
        const gameSceneConfiguration: GameSceneConfiguration = {
            map: levels[0],
            currentLevel: 0,
            hero: new Hero(),
            bestMoves: 0
        };
        this.scene.start('game', gameSceneConfiguration);
    }

}
