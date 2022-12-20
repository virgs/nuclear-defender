import {levels} from '../levels/levels';
import * as domElements from './htmlElements';
import {createSubmitInput} from './htmlElements';
import {configuration} from '../constants/configuration';

export type SplashScreenOnPlayClickCallback = { map: string, moves: string };
export type SplashScreenHtmlInput = {
    scene: Phaser.Scene,
    furthestLevel: number,
    onValidPassword: (furthestLevel: number) => void
    onPlayClick: (data: SplashScreenOnPlayClickCallback) => void
};

function createMapTextArea(onChange: (text) => any) {
    return domElements.createTextAreaWithLabel('Map', levels[0].map, {onChange: onChange});
}

function createMoveTextInput(onChange: (text) => any) {
    return domElements.createInputWithLabel('Moves', '', false, {
        onChange: onChange
    });
}

function createLevelsDropDown(furthestLevel: number, onSelect: (selected) => any) {
    return domElements.createDropDownWithLabel({
        labelText: 'Select level',
        selectedIndex: furthestLevel,
        items: levels
            .filter((level, index) => index <= furthestLevel)
            .map(level => level.password), onSelect
    });
}

function createCodePasswordCheckInput(data: (string) => void) {
    return createSubmitInput({
        labelText: 'Password',
        buttonText: 'Check',
        placeholder: 'Put the level code here',
        onClick: data
    });
}

export const splashScreenHtml = (input: SplashScreenHtmlInput): HTMLElement => {
    const root = document.createElement('div');
    let selectedLevel = 0;
    let mapValue = '';
    let movesValue = '';

    [createCodePasswordCheckInput(text => {
        const index = levels.findIndex(level => level.password.toLowerCase() === text.toLowerCase());
        let showMovesText = domElements.createAlert('Wrong code!', true);
        if (index > input.furthestLevel) {
            showMovesText = domElements.createAlert('Good job');
            setTimeout(() => input.onValidPassword(index), 3000);
        }
        input.scene.add.dom(configuration.gameWidth * .5, configuration.gameHeight * 0.1, showMovesText).setOrigin(0.5);
    }),
        createLevelsDropDown(input.furthestLevel, selected => selectedLevel = selected),
        createMapTextArea(text => mapValue = text),
        createMoveTextInput(text => movesValue = text)]
        .map(htmlElement => {
            root.append(htmlElement);
            htmlElement.style.marginBottom = '35px';
        });

    root.appendChild(domElements.createHighlightButton('Play', () => input.onPlayClick({
        map: levels[selectedLevel].map,
        moves: movesValue
    })));
    return root;
};