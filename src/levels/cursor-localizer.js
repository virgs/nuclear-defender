import { Point } from '@/math/point';
export class CursorLocalizer {
    fullText;
    selectedChar;
    constructor(selectedChars, text) {
        this.selectedChar = selectedChars;
        this.fullText = text;
    }
    localize() {
        const lines = this.fullText
            .split('')
            .filter((char, index) => (char === '\n' || char === '|') && index < this.selectedChar);
        const line = lines
            .length;
        const lastLineBreak = this.fullText
            .substring(0, this.selectedChar)
            .lastIndexOf('\n');
        const currentLine = this.fullText.substring(lastLineBreak, this.selectedChar)
            .replace(/\n/g, '')
            .replace(/[lurd]/g, '');
        const numOfCharsInGrouppingTags = this.countNumbersOfElementsInGrouppingTag(currentLine);
        const sumOfNumbers = this.countNumbers(currentLine);
        const colAfterMetaCharsCounting = currentLine.length - numOfCharsInGrouppingTags + sumOfNumbers;
        return new Point(colAfterMetaCharsCounting, line);
    }
    countNumbersOfElementsInGrouppingTag(text) {
        const initialGroupping = text.indexOf('[');
        if (initialGroupping !== -1) {
            const endingGrouppingTag = text.indexOf(']', initialGroupping);
            if (endingGrouppingTag !== -1) {
                return endingGrouppingTag +
                    this.countNumbersOfElementsInGrouppingTag(text.substring(endingGrouppingTag));
            }
            return text.length - initialGroupping;
        }
        return 0;
    }
    countNumbers(text) {
        return text
            .match(/(\d*)/g)
            ?.reduce((acc, count) => {
            let value = Number(count);
            return acc + value > 0 ? value - 1 : 0;
        }, 0) || 0;
    }
}
