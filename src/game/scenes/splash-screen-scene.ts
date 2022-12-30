import Phaser from 'phaser';
import {Scenes} from './scenes';
import * as lzString from "lz-string";
import {levels} from '../levels/levels';
import {createAlert} from '../ui/htmlElements';
import {MapBuilder} from '../tiles/map-builder';
import type {Tiles} from '../tiles/tiles';
import type {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {splashScreenHtml} from '../ui/splash-screen-html';
import {Actions, mapStringToAction} from '../constants/actions';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import type {SplashScreenOnPlayClickCallback} from '../ui/splash-screen-html';
import {StandardSokobanAnnotationTranslator} from '../tiles/standard-sokoban-annotation-translator';

export type SplashScreenInput = {
    furthestLevel: number
};

export class SplashScreenScene extends Phaser.Scene {
    private readonly fileLevelExtractor: FileLevelExtractor;

    constructor() {
        super(Scenes[Scenes.SPLASH_SCREEN]);

        this.fileLevelExtractor = new FileLevelExtractor();
    }

    preload() {
        const fonts = new WebFontFileLoader(this.load, 'google', [
            'Poppins',
            'Righteous',
            'Martian Mono'
        ]);
        this.load.addFile(fonts);

        //NOTE only needed when loading from file
        this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        });
    }

    private create(data: SplashScreenInput) {
        console.log('splash');
        const tileMap = this.make.tilemap({key: configuration.tiles.tilemapKey});
        const map = this.fileLevelExtractor.extractToTileCodeMap(tileMap); // from file
        const gameSceneConfiguration: GameSceneConfiguration = {
            map: map,
            moves: [],
            currentLevel: 0,
            bestMoves: 0
        };
        this.scene.start(Scenes[Scenes.GAME], gameSceneConfiguration);

        // console.log('splash');
        // const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        // console.log('splash2');
        // // const map = this.fileLevelExtractor.extractToTileCodeMap(tileMap); // from file
        //
        // const title = this.add.text(configuration.gameWidth * .5, configuration.gameHeight * 0.05, `Sokoban`, {
        //     fontFamily: 'Righteous',
        //     color: configuration.colors.highlight,
        //     fontSize: '60px'
        // })
        //     .setOrigin(0.5);
        //
        // const htmlElementInput = splashScreenHtml({
        //     furthestLevel: data.furthestLevel,
        //     scene: this,
        //     onValidPassword: newFurthestLevel => {
        //         console.log(newFurthestLevel);
        //
        //         const input: SplashScreenInput = {
        //             furthestLevel: newFurthestLevel
        //         };
        //         return this.scene.restart(input);
        //     },
        //     onPlayClick: (onPlayData: SplashScreenOnPlayClickCallback) => {
        //         // const map = this.parseMap(data.map);
        //         const map = this.parseMap(levels[data.furthestLevel].map);
        //         let moves = this.parseMoves(onPlayData.moves);
        //         if (moves === undefined) {
        //             const alert = createAlert(`Invalid moves code`, true);
        //             this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.15, alert)
        //                 .setOrigin(0.5, 0.5);
        //         } else {
        //             const gameSceneConfiguration: GameSceneConfiguration = {
        //                 map: map,
        //                 moves: moves,
        //                 currentLevel: data.furthestLevel,
        //                 bestMoves: 0
        //             };
        //             this.scene.start(Scenes[Scenes.GAME], gameSceneConfiguration);
        //         }
        //     }
        // });
        // this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.4, htmlElementInput, {
        //     width: '50%'
        // })
        //     .setOrigin(0.5);
        // htmlElementInput.style.top = (title.height * 2.5) + 'px';
        // htmlElementInput.style.maxHeight = (configuration.gameHeight / 1.5) + 'px';
        // htmlElementInput.style.overflow = 'scroll';

    }

    private parseMoves(compressedMoves: string): Actions[] | undefined {
        if (compressedMoves) {
            const movesText: string | null = lzString.decompressFromEncodedURIComponent(compressedMoves);
            if (movesText === null || movesText.length === 0) {
                return undefined;
            }
            return movesText.split('')
                .map(char => mapStringToAction(char));
        }
        return [];
    }

    private parseMap(map: string): Tiles[][] {
        if (map.length > 0) {
            const annotationMap: string[] = map.split('\n');
            const tileMap = new StandardSokobanAnnotationTranslator().translate(annotationMap);
            return new MapBuilder().build(tileMap);
        }
        return [];
    }
}
