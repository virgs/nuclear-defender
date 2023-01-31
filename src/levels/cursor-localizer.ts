import {Point} from '@/math/point';

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
        const currentLine = this.fullText.substring(lastLineBreak, this.selectedChar)
            .replace(/\n/g, '')
            .replace(/[lurd]/g, '');
        const numOfCharsInGrouppingTags = this.countNumbersOfElementsInGrouppingTag(currentLine);
        const sumOfNumbers = this.countNumbers(currentLine);
        const colAfterMetaCharsCounting = currentLine.length - numOfCharsInGrouppingTags + sumOfNumbers;
        return new Point(colAfterMetaCharsCounting, line);
    }

    private countNumbersOfElementsInGrouppingTag(text: string): number {
        const initialGroupping = text.indexOf('[');
        if (initialGroupping !== -1) {
            const endingGrouppingTag = text.indexOf(']', initialGroupping);
            if (endingGrouppingTag > initialGroupping) {
                return endingGrouppingTag - initialGroupping +
                    this.countNumbersOfElementsInGrouppingTag(text.substring(endingGrouppingTag));
            }
            return text.length - initialGroupping;
        }
        return 0;
    }

    private countNumbers(text: string): number {
        let number = 0;
        const reduce = text
            .match(/(\d*)/g)
            ?.reduce((acc, count) => {
                let value = Number(count);
                if (value > 0) {
                    ++number;
                }
                return acc + value;
            }, 0) || 0;

        return reduce > 0 ? reduce - 2 * number : 0;
    }
}