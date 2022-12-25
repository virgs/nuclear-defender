import {TileCodes} from './tile-codes';
import {Point} from '@/game/math/point';

export type Mapped = { staticMap: { width: number, height: number, tiles: TileCodes[][] }, hero?: Point, boxes: Point[] };

export class StandardSokobanAnnotationMapper {
    private hero?: Point = undefined;
    private staticMap?: { width: number, height: number, tiles: TileCodes[][] };
    private boxes: Point[] = [];

    public map(encodedLevel: string): Mapped {
        const noPipeMap = encodedLevel.replace('|', '\n');
        const noNumberMap = this.removeNumbers(noPipeMap);
        const encodedMatrix = this.transformToMatrix(noNumberMap);
        const dimensionArray = this.createEmptyDecodedMap(encodedMatrix);
        this.staticMap = {
            height: dimensionArray.length,
            width: dimensionArray[0].length,
            tiles: dimensionArray
                .map((line, y) => line
                    .map((_, x: number): TileCodes => {
                        const char = encodedMatrix[y][x];
                        if (char) {
                            return this.getStaticTileTypeFromString(char, new Point(x, y));
                        } else {
                            return TileCodes.empty;
                        }
                    }))
        };
        return {
            staticMap: this.staticMap,
            boxes: this.boxes!,
            hero: this.hero
        };
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

    private getStaticTileTypeFromString(char: string, point: Point): TileCodes {
        switch (char) {
            case ' ':
                return TileCodes.floor;
            case '#':
                return TileCodes.wall;
            case '.':
                return TileCodes.target;
            case '$':
                this.boxes.push(point);
                return TileCodes.floor;
            case '*':
                this.boxes.push(point);
                return TileCodes.target;
            case '@':
                this.hero = point;
                return TileCodes.floor;
            case '+':
                this.hero = point;
                return TileCodes.target;
            default:
                return TileCodes.empty;
        }
    }
}
