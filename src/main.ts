import Phaser from 'phaser';

import {Scenes} from './scenes/scenes';
import {GameScene} from './scenes/game-scene';
import {UrlQueryHandler} from './url-query-handler';
import {Actions, mapStringToAction} from './constants/actions';
import {configuration} from './constants/configuration';
import {NextLevelScene} from './scenes/next-level-scene';
import {SplashScreenInput, SplashScreenScene} from './scenes/splash-screen-scene';
import {StandardSokobanAnnotationMapper} from './tiles/standard-sokoban-annotation-mapper';
import {TileCode} from './tiles/tile-code';

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

//https://sokoban.dk/wp-content/uploads/2019/02/DrFogh-It-Is-All-Greek-Publish.txt
//https://www.urlencoder.org/

function parseMap(mapString: string): TileCode[][] {
    if (mapString) {
        const standardSokobanCharactersMapper = new StandardSokobanAnnotationMapper();
        const levelRows = decodeURI(mapString).split('\n');
        return standardSokobanCharactersMapper.map(levelRows);
    }
    return [];
}

function parseMoves(movesString: string): Actions[] {
    if (movesString.length) {
        return movesString.split(',')
            .map(char => mapStringToAction(char));
    }
    return [];
}

window.addEventListener('load', async () => {
    const urlQueryHandler = new UrlQueryHandler();
    const map = parseMap(urlQueryHandler.getParameterByName('map', ''));
    const moves = parseMoves(urlQueryHandler.getParameterByName('moves', ''));
    const game = new Phaser.Game(config);
    const input: SplashScreenInput = {map, moves};
    game.scene.start(Scenes[Scenes.SPLASH_SCREEN], input);
});