import {getTileFromChar, Tiles} from './tiles';
import {Directions, getDirectionFromChar} from '@/game/constants/directions';

export type OrientedTile = {
    code: Tiles
    orientation: Directions | undefined
};

export type StaticMap = {
    width: number,
    height: number,
    tiles: OrientedTile[][]
};

export class StandardSokobanAnnotationTranslator {
    public translate(encodedLevel: string): StaticMap {
        const irregularMatrix: string[][] = this.splitInIrregularMatrix(encodedLevel);
        const irregularTokenizedMatrix = this.removeMetaChars(irregularMatrix);

        const height = irregularTokenizedMatrix.length;
        const width = irregularTokenizedMatrix
            .reduce((acc, item) => item.length > acc ? item.length : acc, 0);

        const tileMap = this.createRectangularMatrix(height, width, irregularTokenizedMatrix);

        return {
            height: height,
            width: width,
            tiles: tileMap
        };
    }

    private createRectangularMatrix(height: number, width: number, baseMatrix: OrientedTile[][]): OrientedTile[][] {
        return new Array(height)
            .fill(new Array(width)
                .fill(null))
            .map((line, y) => line
                .map((_: any, x: number) => {
                    const item = baseMatrix[y][x];
                    if (item === undefined) {
                        return {
                            code: Tiles.empty,
                            orientation: undefined
                        };
                    }
                    return {
                        code: item.code,
                        orientation: item.orientation
                    };
                }));
    }

    private removeMetaChars(metamap: string[][]): OrientedTile[][] {
        const directionRegex = /[udlr]/;
        const numberRegex = /\d/;
        const result = [];
        for (let line = 0; line < metamap.length; ++line) {
            let resultLine: OrientedTile[] = [];
            for (let col = 0; col < metamap[line].length; ++col) {
                let char = metamap[line][col];
                let orientation = undefined;

                let repetitions = '0';
                while (numberRegex.test(char)) {
                    repetitions += char;
                    char = metamap[line][++col];
                }
                if (directionRegex.test(char)) {
                    orientation = getDirectionFromChar(char);
                    char = metamap[line][++col];
                }
                const repetitionAsNumber = Math.max(Number(repetitions), 1);
                resultLine = resultLine
                    .concat(new Array(repetitionAsNumber)
                        .fill({
                            code: getTileFromChar(char),
                            orientation: orientation
                        }));
            }
            result.push(resultLine);
        }
        return result;
    }

    private splitInIrregularMatrix(encodedLevel: string) {
        const encodedMatrix: string[][] = encodedLevel
            .split(/[\n|]/)
            .filter(line => line.length > 0)
            .map(row => row.split(''));
        return encodedMatrix;

    }

}
