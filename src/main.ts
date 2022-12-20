import Phaser from 'phaser';

import {Scenes} from './scenes/scenes';
import {GameScene} from './scenes/game-scene';
import {configuration} from './constants/configuration';
import {NextLevelScene} from './scenes/next-level-scene';
import {SplashScreenInput, SplashScreenScene} from './scenes/splash-screen-scene';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: configuration.gameWidth,
    height: configuration.gameHeight,
    dom: {
        createContainer: true
    },
    scene: [SplashScreenScene, NextLevelScene, GameScene]
};

window.addEventListener('load', async () => {
    const game = new Phaser.Game(config);
    const input: SplashScreenInput = {
        furthestLevel: 0
    };
    game.scene.start(Scenes[Scenes.SPLASH_SCREEN], input);
});