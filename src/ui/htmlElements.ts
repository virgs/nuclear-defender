import {configuration} from '../constants/configuration';

export const createButton = (text, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.className = 'button is-medium';
    documentElement.addEventListener('click', () => onClick());
    return documentElement;
};

export const createHighlightButton = (text, onClick: () => any): HTMLElement => {
    const htmlElement = createButton(text, onClick);
    htmlElement.classList.add('is-fullwidth');
    htmlElement.style.backgroundColor = configuration.colors.highlight;
    return htmlElement;
};

export const createInputWithLabel = (labelText: string, inputText: string, readOnly: boolean = false,
                                     events: {
                                         onChange: (text: any) => any
                                     }): HTMLElement => {
    const root = document.createElement('div');
    const field = document.createElement('div');
    field.className = 'field';
    root.appendChild(field);

    const label = document.createElement('label');
    label.className = 'label is-medium';
    label.style.fontFamily = 'Righteous';
    label.style.color = configuration.colors.background;
    label.textContent = labelText;
    field.appendChild(label);

    let inputEvent = {
        onChange: (event) => ({})
    };
    if (events) {
        inputEvent = {
            onChange: (event) => events.onChange(event)
        };
    }
    const inputElement = createInput(inputText, readOnly, inputEvent);
    field.appendChild(inputElement);

    return root;
};

export const createInput = (text: string, readOnly: boolean, events: {
    onChange: (text: any) => any
}): HTMLElement => {
    const inputElement = document.createElement('input');
    inputElement.setAttribute('value', text);
    inputElement.setAttribute('type', 'text');

    if (readOnly) {
        inputElement.setAttribute('readonly', 'true');
    }
    inputElement.style.fontFamily = 'Righteous';
    inputElement.className = 'input is-primary is-medium';
    inputElement.style.width = configuration.gameWidth / 2 + 'px';

    inputElement.addEventListener('change', (event: any) => events.onChange(event.target.value));
    inputElement.addEventListener('click', (event: any) => events.onChange(event.target.value));

    return inputElement;
};

export const createTextAreaWithLabel = (labelText: string, text: string, events: { onChange: (string) => any }): HTMLElement => {
    const field = document.createElement('div');
    field.className = 'field';

    const label = document.createElement('label');
    label.className = 'label is-medium';
    label.style.fontFamily = 'Righteous';
    label.style.color = configuration.colors.background;
    label.textContent = labelText;
    field.appendChild(label);

    const textAreaElement = document.createElement('textarea');
    textAreaElement.classList.add('textarea', 'is-primary');
    textAreaElement.setAttribute('placeholder', '');
    textAreaElement.setAttribute('rows', '10');
    textAreaElement.style.fontFamily = 'Martian Mono';
    textAreaElement.textContent = text;

    textAreaElement.addEventListener('change', (event: any) => events.onChange(event.target.value));
    textAreaElement.addEventListener('click', (event: any) => events.onChange(event.target.value));

    field.appendChild(textAreaElement);

    return field;
};

export const createIndefiniteProgressBar = (): HTMLElement => {
    const documentElement = document.createElement('progress');
    documentElement.textContent = 'loading';
    documentElement.setAttribute('max', '100');
    documentElement.style.width = configuration.gameWidth / 2 + 'px';
    documentElement.className = 'progress is-medium is-primary';
    return documentElement;
};

export const createAlert = (content: string): HTMLElement => {
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

export const groupButtonsElement = (regularButton: HTMLElement, mainButton: HTMLElement): HTMLElement => {
    const root = document.createElement('div');
    root.style.width = configuration.gameWidth * .5 + 'px';
    const parentElement = document.createElement('columns');
    parentElement.className = 'columns';

    const retryColumns = document.createElement('div');
    retryColumns.appendChild(regularButton);
    retryColumns.className = 'column is-one-quarter';
    regularButton.classList.add('is-outlined');

    const nextColumns = document.createElement('div');
    nextColumns.appendChild(mainButton);
    nextColumns.className = 'column';

    parentElement.appendChild(retryColumns);
    parentElement.appendChild(nextColumns);

    root.appendChild(parentElement);
    return root;
};