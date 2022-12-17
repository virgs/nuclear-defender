import Phaser from 'phaser';

import {GameScene} from './scenes/game-scene';
import {UrlQueryHandler} from './url-query-handler';
import {configuration} from './constants/configuration';
import {NextLevelScene} from './scenes/next-level-scene';
import {SplashScreenScene} from './scenes/splash-screen-scene';
import {MapBuilder} from './tiles/map-builder';

const config = {
    type: Phaser.AUTO,
    parent: 'app',
    width: configuration.gameWidth,
    height: configuration.gameHeight,
    dom: {
        createContainer: true
    },
    scene: [SplashScreenScene, NextLevelScene, GameScene],
    levelMap: [[]]
};

//https://sokoban.dk/wp-content/uploads/2019/02/DrFogh-It-Is-All-Greek-Publish.txt
//https://www.urlencoder.org/

window.addEventListener('load', async () => {
    const urlQueryHandler = new UrlQueryHandler();
    const playerEnabled: boolean = urlQueryHandler.getParameterByName('playerEnabled', 'false') === 'true';
    const mapString: string = urlQueryHandler.getParameterByName('map', '');
    if (mapString.length) {
        const mapBuilder = new MapBuilder();
        const levelRows = decodeURI(mapString).split('\n');
        config.levelMap = mapBuilder.build(levelRows);
    }
    const game = new Phaser.Game(config);
    game.scene.start('splash-screen', {map: config.levelMap});
});