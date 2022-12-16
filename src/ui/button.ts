import {configuration} from '../constants/configuration';

export const primaryButton = (text): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.style.width = configuration.gameWidth / 2 + 'px';
    documentElement.className = 'button is-medium is-primary';
    return documentElement;

};

export const defaultButton = (text: string): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.style.width = configuration.gameWidth / 2 + 'px';
    documentElement.className = 'button is-medium';
    return documentElement;
};