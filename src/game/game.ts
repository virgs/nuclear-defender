import Phaser from 'phaser';
import {GameScene} from './scenes/game-scene';
import {configuration} from './constants/configuration';

const container = document.getElementById('phaser-container')!;
const title = document.getElementById('game-view-title-id')!;
const time = document.getElementById('game-view-time-id')!;

const titleHeight = title.clientHeight;
const timeHeight = time.clientHeight;
console.log(titleHeight, timeHeight);
configuration.gameWidth = container.clientWidth;
const idealScreen = Math.trunc(container.clientWidth * configuration.screenRatio);
const realScreen = document.body.clientHeight * .95 - (timeHeight + titleHeight);
configuration.gameHeight = Math.min(idealScreen, realScreen);
const directionalButtonsContainer = document.getElementById('directional-buttons-container')!;
if (directionalButtonsContainer) {
    const gameViewButtonsContainer = document.getElementById('game-view-buttons')!;
    gameViewButtonsContainer.style.height = configuration.gameHeight + 'px';
}

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
