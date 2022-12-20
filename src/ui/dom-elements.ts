import {configuration} from '../constants/configuration';

export const retryButtonElement = (text: string, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.className = 'button is-medium is-outlined';
    documentElement.addEventListener('click', () => onClick());
    return documentElement;
};

export const nextButtonElement = (text, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.className = 'button is-medium';
    documentElement.style.backgroundColor = configuration.colors.highlight
    documentElement.addEventListener('click', () => onClick());
    return documentElement;

};

export const createInputWithLabel = (labelText: string, compressed: string, readOnly: boolean): HTMLElement => {
    const root = document.createElement('div');
    const field = document.createElement('div');
    field.className = 'field';
    root.appendChild(field);

    const label = document.createElement('label');
    label.className = 'label is-large';
    label.style.fontFamily = 'Righteous';
    label.style.color = configuration.colors.background;
    label.textContent = labelText;
    field.appendChild(label);

    const control = document.createElement('div');
    control.className = 'control';
    field.appendChild(control);
    const inputText = readOnlyInputElement(compressed, readOnly);
    field.appendChild(inputText);

    return root;
};

export const readOnlyInputElement = (text: string, readOnly: boolean): HTMLElement => {
    const documentElement = document.createElement('input');
    documentElement.setAttribute('value', text);
    documentElement.setAttribute('type', 'text');
    documentElement.setAttribute('readonly', Boolean(readOnly).toString());
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
        setTimeout(() => removeAlert(), 2000);
    }, 1500);

    return documentElement;
};

export const groupButtonsElement = (retry: HTMLElement, next: HTMLElement): HTMLElement => {
    const root = document.createElement('div');
    root.style.width = configuration.gameWidth * .5 + 'px';
    const parentElement = document.createElement('columns');
    parentElement.className = 'columns';

    const retryColumns = document.createElement('div');
    retryColumns.className = 'column is-one-quarter';
    retryColumns.appendChild(retry);

    const nextColumns = document.createElement('div');
    nextColumns.className = 'column';
    next.classList.add('is-fullwidth');
    nextColumns.appendChild(next);

    parentElement.appendChild(retryColumns);
    parentElement.appendChild(nextColumns);

    root.appendChild(parentElement);
    return root;
};