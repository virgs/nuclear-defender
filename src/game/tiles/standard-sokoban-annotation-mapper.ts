import {TileCodes} from './tile-codes';

export class StandardSokobanAnnotationMapper {
    public map(encodedLevel: string): TileCodes[][] {
        const noPipeMap = encodedLevel.replace('|', '\n');
        const noNumberMap = this.removeNumbers(noPipeMap);
        const encodedMatrix = this.transformToMatrix(noNumberMap);
        const dimensionArray = this.createEmptyDecodedMap(encodedMatrix);
        return dimensionArray
            .map((line, y) => line
                .map((_, x: number): TileCodes => {
                    const char = encodedMatrix[y][x];
                    return char ? StandardSokobanAnnotationMapper.getTileTypeFromString(char) : TileCodes.empty;
                }));
    }

    private createEmptyDecodedMap(encodedMatrix: string[][]) {
        const longestLine = encodedMatrix
            .reduce((acc, item) => item.length > acc ? item.length : acc, 0);

        const dimensionArray: TileCodes[][] = new Array(encodedMatrix.length)
            .fill(new Array(longestLine)
                .fill(encodedMatrix.length));
        return dimensionArray;
    }

    private transformToMatrix(encodedLevel: string) {
        const encodedMatrix: string[][] = encodedLevel
            .split('\n')
            .filter(line => line.length > 0)
            .map(row => row.split(''));
        return encodedMatrix;
    }

    private removeNumbers(numberedMap: string): string {
        let result = '';
        const chars = numberedMap.split('');
        for (let index = 0; index < chars.length; ++index) {
            if (/\d/.test(chars[index])) {
                let value = chars[index];
                while (/\d/.test(chars[++index])) {
                    value += chars[index];
                }
                result += new Array(Number(value))
                    .fill(chars[index]).join('');
            } else {
                result += chars[index];
            }
        }
        return result;

    }

    private static getTileTypeFromString(char: string): TileCodes {
        switch (char) {
            case ' ':
                return TileCodes.floor;
            case '#':
                return TileCodes.wall;
            case '.':
                return TileCodes.target;
            case '$':
                return TileCodes.box;
            case '*':
                return TileCodes.boxOnTarget;
            case '@':
                return TileCodes.hero;
            case '+':
                return TileCodes.heroOnTarget;
            default:
                return TileCodes.empty;
        }
    }
}
