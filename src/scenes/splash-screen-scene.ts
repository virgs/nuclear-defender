import Phaser from 'phaser';
import {Scenes} from './scenes';
import * as lzString from 'lz-string';
import {levels} from '../levels/levels';
import {TileCode} from '../tiles/tile-code';
import {Actions, mapStringToAction} from '../constants/actions';
import {MapBuilder} from '../tiles/map-builder';
import {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {StandardSokobanAnnotationMapper} from '../tiles/standard-sokoban-annotation-mapper';

export type SplashScreenInput = {};

export class SplashScreenScene extends Phaser.Scene {
    private readonly fileLevelExtractor: FileLevelExtractor;

    constructor() {
        super(Scenes[Scenes.SPLASH_SCREEN]);

        this.fileLevelExtractor = new FileLevelExtractor();
    }

    preload() {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous'
        ]);
        this.load.addFile(fonts);

        //TODO only needed when loading from file
        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}1.json`);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    private parseMap(map: string): TileCode[][] {
        const annotationMap: string[] = map.split('\n');
        const tileMap = new StandardSokobanAnnotationMapper().map(annotationMap);
        return new MapBuilder().build(tileMap);
    }

    private parseMoves(compressedMoves: string): Actions[] {
        const movesText: string = lzString.decompressFromEncodedURIComponent(compressedMoves);
        return movesText.split('')
            .map(char => mapStringToAction(char));
    }

    create(data: SplashScreenInput) {
        const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        // const map = this.fileLevelExtractor.extractToTileCodeMap(tileMap); // from file
        const map = new MapBuilder().build(levels[0]); // from code
        // const map = this.parseMap(``)
        // const moves = this.parseMoves('M418ZXTBOYFcExcANqAJkA');
        const gameSceneConfiguration: GameSceneConfiguration = {
            map: map,
            moves: [],
            currentLevel: 0,
            bestMoves: 0
        };
        this.scene.start(Scenes[Scenes.GAME], gameSceneConfiguration);
    }

}
