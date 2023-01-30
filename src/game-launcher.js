import Phaser from 'phaser';
import { GameScene } from './scenes/game-scene';
import { configuration } from './constants/configuration';
const launch = (containerId, config, router) => {
    const container = document.getElementById('phaser-container');
    const title = document.getElementById('game-view-title-id');
    const time = document.getElementById('game-view-time-id');
    const titleHeight = title?.clientHeight || 0;
    const timeHeight = time?.clientHeight || 0;
    configuration.gameWidth = container.clientWidth;
    const idealScreen = Math.trunc(container.clientWidth * configuration.screenRatio);
    const realScreen = document.body.clientHeight * .95 - (timeHeight + titleHeight);
    configuration.gameHeight = Math.min(idealScreen, realScreen);
    const directionalButtonsContainer = document.getElementById('directional-buttons-container');
    if (directionalButtonsContainer) {
        const gameviewButtonsContainer = document.getElementById('gameview-buttons-container');
        gameviewButtonsContainer.style.height = configuration.gameHeight + 'px';
    }
    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        width: configuration.gameWidth,
        height: configuration.gameHeight,
        preserveDrawingBuffer: !config.playable,
        // pixelArt: true,
        // physics: {default: 'arcade'},
        // backgroundColor: '#000000',
        transparent: true,
        plugins: {},
        audio: {
            disableWebAudio: true
        },
        dom: {
        // createContainer: true
        },
        scene: [GameScene]
    });
    game.scene.start('game', { router, config: config });
    return game;
};
export default launch;
export { launch };
