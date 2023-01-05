import Phaser from 'phaser';
import {GameScene} from './scenes/game-scene';
import {configuration} from './constants/configuration';

const container = document.getElementById('phaser-container')!;

configuration.gameWidth = container.clientWidth;
configuration.gameHeight = Math.min(Math.trunc(container.clientWidth * configuration.screenRatio), document.body.clientHeight * .75);

const launch = (containerId: string) => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        width: configuration.gameWidth,
        height: configuration.gameHeight,
        // pixelArt: true,
        // physics: {default: 'arcade'},
        backgroundColor: '#000000',
        plugins: {},
        dom: {
            // createContainer: true
        },
        scene: [GameScene]
    });
};

export default launch;
export {launch};
