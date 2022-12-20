import * as domElements from './htmlElements';

export type SplashScreenOnPlayClickCallback = { map: string, moves: string };
export type SplashScreenHtmlInput = {
    onPlayClick: (data: SplashScreenOnPlayClickCallback) => void
};

function createMapTextArea(onChange: (text) => any) {
    const labelText = 'Map';
    const mapText = domElements.createTextAreaWithLabel(labelText,
        `##########
#        #
###$#$#$ #
# ...... #
#  ##### #
#        #
#  $#$#$##
#@       #
##########`, {onChange: onChange});
    mapText.style.marginBottom = '75px';
    return mapText;
}

function createMoveTextInput(onChange: (text) => any) {
    const movesTextElement = domElements.createInputWithLabel('Moves', 'M418ZXTt-DEwE7KaArhhAbT30QM0QTTwyLJLQATYe9PSHZiNwzr7n3mDvpEbABkAoImSp01DVJypqacpWrB48BsRbpG0Wt7D0O-vvBGi0GguByjw++w6sRIAWewnboMiRtwNDGdoC0tvMEpInxBQwwYYqGYXVzcwYLCtXwiqflSUg0lGWPCYLRwNfygyLzhQnFoihOoc6MxBOrzwcoJxYiwWkvJsn0a6BtzO9IKkMybQWena1oHBoeb16DZ+7iN3SfnNMDLAmr8oHo21qNW6W7uwWKncTumyC1o8BZr57+A9Ajs92KEGQxWsvRY9W6QA',
        false, {
            onChange: onChange
        });
    movesTextElement.style.marginBottom = '75px';
    return movesTextElement;
}

export const splashScreenHtml = (input: SplashScreenHtmlInput): HTMLElement => {
    const root = document.createElement('div');
    let mapValue = '';
    let movesValue = '';

    // const map = new MapBuilder().build(levels[0]); // from code

    root.appendChild(createMapTextArea(text => mapValue = text));
    root.appendChild(createMoveTextInput(text => movesValue = text));
    const onClick = () => input.onPlayClick({
        map: mapValue,
        moves: movesValue
    });
    root.appendChild(domElements.createHighlightButton('Play', onClick));
    return root;
};