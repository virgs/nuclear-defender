import {Point} from '@/game/math/point';

export class CursorLocalizer {
    private readonly fullText: string;
    private readonly selectedChar: number;

    constructor(selectedChars: number, text: string) {
        this.selectedChar = selectedChars;
        this.fullText = text;
    }

    public localize(): Point {
        const lines = this.fullText
            .split('')
            .filter((char: string, index: number) => (char === '\n' || char === '|') && index < this.selectedChar);
        const line = lines
            .length;
        const lastLineBreak = this.fullText
            .substring(0, this.selectedChar)
            .lastIndexOf('\n');
        const col = this.selectedChar - lastLineBreak - 1;
        const currentLine = this.fullText.substring(lastLineBreak, this.selectedChar);
        const numOfCharsInGrouppingTags = this.countNumbersOfElementsInGrouppingTag(currentLine);
        const sumOfNumbers = this.countNumbers(currentLine);
        const colAfterMetaCharsCounting = col - numOfCharsInGrouppingTags + sumOfNumbers;
        return new Point(colAfterMetaCharsCounting, line);
    }

    private countNumbersOfElementsInGrouppingTag(text: string): number {
        const initialGroupping = text.indexOf('[');
        if (initialGroupping !== -1) {
            const endingGrouppingTag = text.indexOf(']');
            if (endingGrouppingTag !== -1) {
                return endingGrouppingTag - initialGroupping +
                    this.countNumbersOfElementsInGrouppingTag(text.substring(endingGrouppingTag));
            }
            return text.length - initialGroupping;
        }
        return 0;
    }

    private countNumbers(text: string): number {
        return text
            .match(/(\d*)/g)
            ?.reduce((acc, count) => {
                let value = Number(count);
                return acc + value > 0 ? value - 1 : 0;
            }, 0) || 0;
    }
}