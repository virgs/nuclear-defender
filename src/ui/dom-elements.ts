import {configuration} from '../constants/configuration';

export const retryButtonElement = (text: string, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.style.width = configuration.gameWidth * 0.15 + 'px';
    documentElement.className = 'button is-medium is-outlined';
    documentElement
        .addEventListener('click', () => onClick());
    return documentElement;
};

export const nextButtonElement = (text, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.style.width = configuration.gameWidth * 0.34 + 'px';
    documentElement.className = 'button is-medium is-primary';
    documentElement
        .addEventListener('click', () => onClick());
    return documentElement;

};

export const readOnlyInputElement = (text: string): HTMLElement => {
    const documentElement = document.createElement('input');
    documentElement.setAttribute('value', text);
    documentElement.setAttribute('type', 'text');
    documentElement.setAttribute('readonly', 'true');
    documentElement.style.fontFamily = 'Righteous';
    documentElement.className = 'input is-primary is-medium is-success';
    documentElement.style.width = configuration.gameWidth / 2 + 'px';
    return documentElement;
};

export const loadingElement = (): HTMLElement => {
    const documentElement = document.createElement('progress');
    documentElement.textContent = 'loading';
    documentElement.setAttribute('max', '100');
    documentElement.style.width = configuration.gameWidth / 2 + 'px';
    documentElement.className = 'progress is-medium is-primary';
    return documentElement;
};

export const alertElement = (content: string): HTMLElement => {
    const documentElement = document.createElement('div');
    documentElement.textContent = content;
    documentElement.className = 'notification is-primary';
    const removeAlert = () => documentElement.parentNode.removeChild(documentElement);

    setTimeout(() => {
        documentElement.classList.add('fadeout');
        setTimeout(() => removeAlert(), 1500);
    }, 1500);

    return documentElement;
};

export const groupButtonsElement = (retry: HTMLElement, next: HTMLElement): HTMLElement => {
    const phaserElement = document.createElement('div');
    const parentElement = document.createElement('div');
    parentElement.className = 'field is-grouped';

    const controlRetryElement = document.createElement('p');
    controlRetryElement.appendChild(retry);
    controlRetryElement.className = 'control';

    const controlNextElement = document.createElement('p');
    controlNextElement.className = 'control';
    controlNextElement.appendChild(next);

    parentElement.appendChild(controlRetryElement);
    parentElement.appendChild(controlNextElement);
    phaserElement.appendChild(parentElement);
    return phaserElement;
};