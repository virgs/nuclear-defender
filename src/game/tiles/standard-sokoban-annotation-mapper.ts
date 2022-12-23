import {TileCodes} from './tile-codes';
import type {Point} from '@/game/math/point';

type Mapped = { fullMatrix: TileCodes[][], hero?: Point, boxes: Point[] };

export class StandardSokobanAnnotationMapper {
    public map(encodedLevel: string): Mapped {
        const noPipeMap = encodedLevel.replace('|', '\n');
        const noNumberMap = this.removeNumbers(noPipeMap);
        const encodedMatrix = this.transformToMatrix(noNumberMap);
        const dimensionArray = this.createEmptyDecodedMap(encodedMatrix);
        const result: Mapped = {
            fullMatrix: [],
            hero: undefined,
            boxes: []
        };
        result.fullMatrix = dimensionArray
            .map((line, y) => line
                .map((_, x: number): TileCodes => {
                    const char = encodedMatrix[y][x];
                    if (char) {
                        const tile = StandardSokobanAnnotationMapper.getTileTypeFromString(char);
                        if (tile === TileCodes.hero) {
                            result.hero = {x, y};
                        } else if (tile === TileCodes.box) {
                            result.boxes.push({x, y});
                        }
                        return tile;
                    } else {
                        return TileCodes.empty;
                    }
                }));

        return result;
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
