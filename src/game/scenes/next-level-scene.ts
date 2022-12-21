import Phaser from 'phaser';
import {Scenes} from './scenes';
import * as lzString from 'lz-string';
import {levels} from '../levels/levels';
import * as domElements from '../ui/htmlElements';
import {configuration} from '../constants/configuration';
import {Actions, mapActionToString} from '../constants/actions';

export type NextLevelSceneInput = {
    currentLevel: number,
    moves: Actions[],
    totalTime: number
};

export class NextLevelScene extends Phaser.Scene {
    constructor() {
        super(Scenes[Scenes.NEXT_LEVEL]);
    }

    public create(data: NextLevelSceneInput) {
        const width = configuration.gameWidth;
        const height = configuration.gameHeight;
        const horizontalCenterPosition = width * 0.5;

        this.add.text(horizontalCenterPosition, height * 0.1, `Level '${levels[data.currentLevel].title}' Complete!`, {
            fontFamily: 'Righteous',
            color: configuration.colors.highlight,
            fontSize: '60px'
        })
            .setOrigin(0.5);

        this.add.text(horizontalCenterPosition, height * 0.175, `Total time: ${Math.trunc(data.totalTime / 100) / 10}s`, {
            fontFamily: 'Righteous',
            color: configuration.colors.background,
            fontSize: '30px'
        })
            .setOrigin(0.5);

        this.showMovesCode(data, horizontalCenterPosition, height * 0.4);

        const retryButton = domElements.createButton('Retry', () => {
            console.log('retry');
            // this.scene.start(Scenes[Scenes.GAME], data.gameSceneConfiguration);
        });
        const nextLevelButton = domElements.createHighlightButton('Next Level', () => {
            console.log('next');
            // this.scene.start(Scenes[Scenes.GAME], data.gameSceneConfiguration)
        });

        const buttonsGroup = domElements.groupButtonsElement(retryButton, nextLevelButton);
        this.add.dom(horizontalCenterPosition, height * 0.64, buttonsGroup);
    }

    private showMovesCode(data: NextLevelSceneInput, x: number, y: number) {
        const mapText = data.moves.map(action => mapActionToString(action)).join('');
        const compressed = lzString.compressToEncodedURIComponent(mapText);
        const showMovesCode = domElements.createSubmitInput({
            labelText: 'Moves',
            buttonText: 'Copy!',
            text: compressed,
            onClick: async (text: string) => {
                await navigator.clipboard.writeText(compressed);
                const showMovesText = domElements.createAlert('Moves code to clipboard. Share it!');
                this.add.dom(x, y * 0.1, showMovesText).setOrigin(0.5);
            }
        });

        this.add.dom(x, y, showMovesCode);
    }
}
