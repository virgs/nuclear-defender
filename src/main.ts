import Phaser from 'phaser';

import {GameScene} from './scenes/game-scene';
import {UrlQueryHandler} from './url-query-handler';
import {configuration} from './constants/configuration';
import {NextLevelScene} from './scenes/next-level-scene';
import {SplashScreenScene} from './scenes/splash-screen-scene';
import {StandardSokobanCharactersMapper} from './tiles/standard-sokoban-characters-mapper';
import {Scenes} from './scenes/scenes';

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
    const mapString: string = urlQueryHandler.getParameterByName('map', '');
    if (mapString.length) {
        const standardSokobanCharactersMapper = new StandardSokobanCharactersMapper();
        const levelRows = decodeURI(mapString).split('\n');
        config.levelMap = standardSokobanCharactersMapper.map(levelRows);
    }
    const game = new Phaser.Game(config);
    game.scene.start(Scenes[Scenes.SPLASH_SCREEN], {map: config.levelMap});
});