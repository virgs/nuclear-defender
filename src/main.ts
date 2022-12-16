import Phaser from 'phaser';

import {GameScene} from './scenes/game-scene';
import {NextLevelScene} from './scenes/next-level-scene';
import {SplashScreenScene} from './scenes/splash-screen-scene';
import {configuration} from './constants/configuration';

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

export default new Phaser.Game(config);
