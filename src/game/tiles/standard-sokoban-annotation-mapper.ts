import {TileCodes} from './tile-codes';

export class StandardSokobanAnnotationMapper {
    public map(encodedLevel: string): TileCodes[][] {
        const encodedMatrix = this.transformToMatrix(encodedLevel);
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

    private static getTileTypeFromString(char: string): TileCodes {
        switch (char) {
            case '-' :
                return TileCodes.empty;
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
