import {configuration} from '../constants/configuration';

//TODO clean this mess
// at least the args

export function createDropDownWithLabel(data: {
    labelText: string,
    selectedIndex: number,
    items: string[],
    onSelect: (selected) => any
}) {

    const dropDownRootElement = document.createElement('div');
    const field = document.createElement('div');
    field.className = 'field';
    const label = document.createElement('label');
    label.className = 'label is-medium';
    label.style.fontFamily = 'Righteous';
    label.style.color = configuration.colors.background;
    label.textContent = data.labelText;
    field.appendChild(label);
    dropDownRootElement.appendChild(field);

    const dropdownElement = document.createElement('div');
    dropdownElement.classList.add('dropdown');

    dropdownElement.addEventListener('click', () => {
        dropdownElement.classList.toggle('is-active');
    });

    dropDownRootElement.appendChild(dropdownElement);

    const triggerElement = document.createElement('div');
    triggerElement.classList.add('dropdown-trigger');
    triggerElement.innerHTML = `
     <button class="button" aria-controls="dropdown-menu" aria-haspopup="true">
       <span id="dropdown-selected-title">${data.selectedIndex + 1}: ${data.items[data.selectedIndex]}</span>
       <span class="icon">
         <i class="fa-solid fa-angle-down"></i>
       </span>
     </button>`;
    dropdownElement.appendChild(triggerElement);

    const menuElement = document.createElement('div');
    menuElement.classList.add('dropdown-menu');
    menuElement.id = 'dropdown-menu';
    menuElement.role = 'menu';

    const contentElement = document.createElement('div');
    contentElement.classList.add('dropdown-content');
    contentElement.style.maxHeight = '300px';
    contentElement.style.overflow = 'scroll';

    data.items
        .forEach((item, index) => {
            const dropdownItem = document.createElement('a');
            dropdownItem.classList.add('dropdown-item');
            if (data.selectedIndex === index) {
                dropdownItem.classList.add('is-active');
            }
            dropdownItem.href = '#';
            dropdownItem.text = `${index + 1}: ${item}`;
            dropdownItem.addEventListener('click', () => {
                document.getElementsByClassName('dropdown-item is-active')[0]
                    .classList.toggle('is-active');
                dropdownItem.classList.toggle('is-active');
                document.getElementById('dropdown-selected-title').textContent = `${index + 1}: ${item}`;
                data.onSelect(index);
            });

            contentElement.appendChild(dropdownItem);
        });
    menuElement.appendChild(contentElement);
    dropdownElement.appendChild(menuElement);

    return dropDownRootElement;

}

export const createButton = (text, onClick: () => any): HTMLElement => {
    const documentElement = document.createElement('button');
    documentElement.textContent = text;
    documentElement.className = 'button';
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
    inputElement.className = 'input is-primary';
    inputElement.style.width = configuration.gameWidth / 2 + 'px';

    inputElement.addEventListener('change', (event: any) => events.onChange(event.target.value));
    inputElement.addEventListener('click', (event: any) => events.onChange(event.target.value));

    return inputElement;
};

export const createSubmitInput = (data: {
    labelText: string,
    text?: string,
    buttonText: string,
    placeholder?: string,
    onClick: (text: any) => any
}): HTMLElement => {
    const rootFieldElement = document.createElement('div');
    rootFieldElement.style.width = configuration.gameWidth * .5 + 'px';


    const groupFieldElement = document.createElement('div');
    groupFieldElement.classList.add('field', 'is-grouped');

    const label = document.createElement('label');
    label.className = 'label is-medium';
    label.style.fontFamily = 'Righteous';
    label.style.color = configuration.colors.background;
    label.textContent = data.labelText;
    rootFieldElement.appendChild(label);

    const controlInputElement = document.createElement('p');
    controlInputElement.classList.add('control', 'is-expanded');
    controlInputElement.style.margin = '0';
    groupFieldElement.appendChild(controlInputElement);

    const inputElement = document.createElement('input');
    inputElement.style.marginRight = '40px';
    inputElement.setAttribute('placeholder', data.placeholder);
    inputElement.setAttribute('type', 'text');
    if (data.text) {
        inputElement.setAttribute('value', data.text);
    }
    inputElement.style.fontFamily = 'Righteous';
    inputElement.className = 'input is-primary';
    groupFieldElement.appendChild(inputElement);

    const controlButtonElement = document.createElement('p');
    controlButtonElement.classList.add('control');
    groupFieldElement.appendChild(controlButtonElement);

    const buttonElement = document.createElement('a');
    buttonElement.classList.add('button');
    buttonElement.style.backgroundColor = configuration.colors.highlight;
    buttonElement.text = data.buttonText;
    buttonElement.addEventListener('click', () => data.onClick(inputElement.value));

    controlButtonElement.appendChild(buttonElement);

    rootFieldElement.appendChild(groupFieldElement);
    return rootFieldElement;
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

export const createAlert = (content: string, danger: boolean = false): HTMLElement => {
    const documentElement = document.createElement('div');
    documentElement.textContent = content;
    documentElement.className = 'notification';
    if (danger) {
        documentElement.classList.add('is-danger');
    } else {
        documentElement.classList.add('is-primary');
    }
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