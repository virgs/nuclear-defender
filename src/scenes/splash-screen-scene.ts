import Phaser from 'phaser';

import {Hero} from '../actors/hero';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {GameSceneConfiguration} from './game-scene';

export class SplashScreenScene extends Phaser.Scene {
    constructor() {
        super('splash-screen');
    }

    preload() {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous'
        ]);
        this.load.addFile(fonts);
    }

    create() {
        const gameSceneConfiguration: GameSceneConfiguration = {currentLevel: 1, hero: new Hero(), bestMoves: 10};
        this.scene.start('game', gameSceneConfiguration);
    }
}
