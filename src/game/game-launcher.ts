import Phaser from 'phaser';
import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/levels/tiles';
import {GameScene} from './scenes/game-scene';
import type {Level} from '@/game/levels/defaultLevels';
import type {Actions} from '@/game/constants/actions';
import {configuration} from './constants/configuration';
import type {MultiLayeredMap} from '@/game/levels/standard-sokoban-annotation-tokennizer';

export type SceneConfig = {
    level: Level,
    isCustomLevel: boolean,
    playable: boolean,
    levelIndex: number,
    displayNumber: string,
    playerInitialActions: Actions[],
    strippedLayeredTileMatrix: MultiLayeredMap;
    dynamicFeatures: Map<Tiles, Point[]>
};

const launch = (containerId: string, config: SceneConfig, router: any) => {
    const container = document.getElementById('phaser-container')!;
    const title = document.getElementById('game-view-title-id')!;
    const time = document.getElementById('game-view-time-id')!;

    const titleHeight = title?.clientHeight || 0;
    const timeHeight = time?.clientHeight || 0;
    configuration.gameWidth = container.clientWidth;
    const idealScreen = Math.trunc(container.clientWidth * configuration.screenRatio);
    const realScreen = document.body.clientHeight * .95 - (timeHeight + titleHeight);
    configuration.gameHeight = Math.min(idealScreen, realScreen);
    const directionalButtonsContainer = document.getElementById('directional-buttons-container');
    if (directionalButtonsContainer) {
        const gameviewButtonsContainer = document.getElementById('gameview-buttons-container')!;
        gameviewButtonsContainer.style.height = configuration.gameHeight + 'px';
    }

    const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerId,
        width: configuration.gameWidth,
        height: configuration.gameHeight,
        preserveDrawingBuffer: true,
        // pixelArt: true,
        // physics: {default: 'arcade'},
        // backgroundColor: '#000000',
        transparent: true,
        plugins: {},
        dom: {
            // createContainer: true
        },
        scene: [GameScene]
    });
    game.scene.start('game', {router, config: config});
    return game;
};

export default launch;
export {launch};