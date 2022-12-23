import Phaser from 'phaser';
import {GameScene} from './scenes/game-scene';
import {configuration} from './constants/configuration';
import {NextLevelScene} from './scenes/next-level-scene';

const gameViewContainer = document.getElementsByClassName('game-view')[0];
configuration.gameWidth = gameViewContainer.clientWidth;
configuration.gameHeight = Math.trunc(gameViewContainer.clientWidth * configuration.screenRatio);

const launch = (containerId: string) => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        width: configuration.gameWidth,
        height: configuration.gameHeight,
        dom: {
            createContainer: true
        },
        scene: [GameScene, NextLevelScene]
    });
};

export default launch;
export {launch};
