import Phaser from 'phaser';

import {defaultButton, primaryButton} from '../ui/button';
import {Hero} from '../actors/hero';
import {GameScene, GameSceneConfiguration} from './game-scene';

export class NextLevelScene extends Phaser.Scene {
    constructor() {
        super('next-level');
    }

    public create(data: { gameSceneConfiguration: GameSceneConfiguration, numMoves: number }) {
        console.log('next-level');
        const width = this.scale.width;
        const height = this.scale.height;

        this.add.text(width * 0.5, height * 0.4, 'Level Complete!', {
            fontFamily: 'Righteous',
            color: '#d4fa00',
            fontSize: '60px'
        })
            .setOrigin(0.5);

        this.add.text(width * 0.5, height * 0.5, `Moves: ${data.numMoves}`, {
            fontFamily: 'Poppins',
            color: '#dddddd',
            fontSize: '30px'
        })
            .setOrigin(0.5);
        this.add.text(width * 0.5, height * 0.575, `Best: ${data.gameSceneConfiguration.bestMoves}`, {
            fontFamily: 'Poppins',
            color: '#fa5400',
            fontSize: '30px'
        })
            .setOrigin(0.5);

        const retryButton = defaultButton('Retry');
        const retry = this.add.dom(width * 0.5, height * 0.7, retryButton)
            .addListener('click')
            .once('click', () => {
                this.scene.start('game', data.gameSceneConfiguration);
            });

        const nextLevelButton = primaryButton('Next Level');
        this.add.dom(width * 0.5, retry.y + retry.height * 1.2, nextLevelButton)
            .addListener('click')
            .once('click', () => {
                const nextLevelConfiguration: GameSceneConfiguration = {
                    bestMoves: data.gameSceneConfiguration.bestMoves,
                    currentLevel: data.gameSceneConfiguration.currentLevel + 1,
                    hero: data.gameSceneConfiguration.hero
                };
                this.scene.start('game', nextLevelConfiguration);
            });
    }
}
