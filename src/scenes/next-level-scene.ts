import Phaser from 'phaser';
import {Scenes} from './scenes';
import {retryButtonElement, nextButtonElement, readOnlyInputElement, groupButtonsElement, alertElement} from '../ui/dom-elements';
import {Direction} from '../constants/direction';
import {configuration} from '../constants/configuration';

export type NextLevelSceneInput = { currentLevel: number, moves: Direction[] };

export class NextLevelScene extends Phaser.Scene {
    constructor() {
        super(Scenes[Scenes.NEXT_LEVEL]);
    }

    public create(data: NextLevelSceneInput) {
        const width = configuration.gameWidth;
        const height = configuration.gameHeight;
        const horizontalCenterPosition = width * 0.5;

        this.add.text(horizontalCenterPosition, height * 0.1, 'Level Complete!', {
            fontFamily: 'Righteous',
            color: '#d4fa00',
            fontSize: '60px'
        })
            .setOrigin(0.5);

        this.add.text(horizontalCenterPosition, height * 0.3, `Moves: ${data.moves.length}`, {
            fontFamily: 'Poppins',
            color: '#dddddd',
            fontSize: '30px'
        })
            .setOrigin(0.5);

        const mapText = data.moves.map(move => Direction[move].toString().charAt(0).toLowerCase()).join(',');
        const showMovesText = readOnlyInputElement(mapText);
        this.add.dom(horizontalCenterPosition, height * 0.4, showMovesText)
            .addListener('click')
            .once('click', async () => {
                await navigator.clipboard.writeText(mapText);

                const showMovesText = alertElement('Text copied to clipboard');
                this.add.dom(horizontalCenterPosition, height * 0.1, showMovesText).setOrigin(0.5);
            }).setOrigin(0.5);

        const retryButton = retryButtonElement('Retry', () => {
            console.log('retry');
            // this.scene.start(Scenes[Scenes.GAME], data.gameSceneConfiguration);
        });
        const nextLevelButton = nextButtonElement('Next Level', () => {
            console.log('next');
            // this.scene.start(Scenes[Scenes.GAME], data.gameSceneConfiguration)
        });

        const buttonsGroup = groupButtonsElement(retryButton, nextLevelButton);
        this.add.dom(horizontalCenterPosition, height * 0.64, buttonsGroup).setOrigin(0.5);

    }
}
