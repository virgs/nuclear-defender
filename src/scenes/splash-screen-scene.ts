import Phaser from 'phaser';
import {Scenes} from './scenes';
import * as lzString from 'lz-string';
import {TileCode} from '../tiles/tile-code';
import {createAlert} from '../ui/htmlElements';
import {MapBuilder} from '../tiles/map-builder';
import {GameSceneConfiguration} from './game-scene';
import {configuration} from '../constants/configuration';
import {Actions, mapStringToAction} from '../constants/actions';
import {FileLevelExtractor} from '../levels/file-level-extractor';
import WebFontFileLoader from '../file-loaders/web-font-file-loader';
import {splashScreenHtml, SplashScreenOnPlayClickCallback} from '../ui/splash-screen-html';
import {StandardSokobanAnnotationMapper} from '../tiles/standard-sokoban-annotation-mapper';
import {levels} from '../levels/levels';

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

        //TODO only needed when loading from file
        this.load.tilemapTiledJSON(configuration.tilemapKey, `${configuration.levelAssetPrefix}1.json`);
        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cache.tilemap.remove(configuration.tilemapKey);
        });
    }

    private parseMap(map: string): TileCode[][] {
        if (map.length > 0) {
            const annotationMap: string[] = map.split('\n');
            const tileMap = new StandardSokobanAnnotationMapper().map(annotationMap);
            return new MapBuilder().build(tileMap);
        }
        return [];
    }

    private parseMoves(compressedMoves: string): Actions[] {
        if (compressedMoves) {
            const movesText: string = lzString.decompressFromEncodedURIComponent(compressedMoves);
            if (movesText === null || movesText.length === 0) {
                return undefined;
            }
            return movesText.split('')
                .map(char => mapStringToAction(char));
        }
        return [];
    }

    private create(data: SplashScreenInput) {
        const tileMap = this.make.tilemap({key: configuration.tilemapKey});
        const map = this.fileLevelExtractor.extractToTileCodeMap(tileMap); // from file

        this.add.text(configuration.gameWidth * .5, configuration.gameHeight * 0.1, `Sokoban`, {
            fontFamily: 'Righteous',
            color: configuration.colors.highlight,
            fontSize: '60px'
        })
            .setOrigin(0.5);

        const htmlElementInput = splashScreenHtml({
            furthestLevel: data.furthestLevel,
            scene: this,
            onValidPassword: newFurthestLevel => {
                const input: SplashScreenInput = {
                    furthestLevel: newFurthestLevel
                };
                return this.scene.restart(input);
            },
            onPlayClick: (onPlayData: SplashScreenOnPlayClickCallback) => {
                // const map = this.parseMap(data.map);
                const map = this.parseMap(levels[data.furthestLevel].map);
                let moves = this.parseMoves(onPlayData.moves);
                if (moves === undefined) {
                    const alert = createAlert(`Invalid moves code`, true);
                    this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.15, alert)
                        .setOrigin(0.5);
                } else {
                    const gameSceneConfiguration: GameSceneConfiguration = {
                        map: map,
                        moves: moves,
                        currentLevel: data.furthestLevel,
                        bestMoves: 0
                    };
                    this.scene.start(Scenes[Scenes.GAME], gameSceneConfiguration);
                }
            }
        });
        this.add.dom(configuration.gameWidth * 0.5, configuration.gameHeight * 0.5, htmlElementInput, {
            width: '50%'
        })
            .setOrigin(0.5);
    }

}
