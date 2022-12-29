import {getTileFromChar, Tiles} from './tiles';
import {Point} from '@/game/math/point';
import {Directions, getDirectionFromChar} from '@/game/constants/directions';

export type StaticMap = {
    width: number,
    height: number,
    tiles: Tiles[][]
    directions: (Directions | undefined)[][]
};
export type Mapped = {
    staticMap: StaticMap,
    hero: Point,
    boxes: Point[]
};

export class StandardSokobanAnnotationMapper {
    public map(encodedLevel: string): Mapped {
        const irregularMatrix: string[][] = this.splitInIrregularMatrix(encodedLevel);
        const irregularTokenizedMatrix = this.removeMetaChars(irregularMatrix);

        const height = irregularTokenizedMatrix.tiles.length;
        const width = irregularTokenizedMatrix.tiles
            .reduce((acc, item) => item.length > acc ? item.length : acc, 0);

        const tileMap = this.createRectangularMatrix(height, width, irregularTokenizedMatrix.tiles, Tiles.empty) as Tiles[][];
        const directionMap = this.createRectangularMatrix(height, width, irregularTokenizedMatrix.directions, undefined) as Directions[][];

        const boxes: Point[] = this.extractBoxes(tileMap);
        const hero: Point = this.extractHero(tileMap)!;

        return {
            staticMap: {
                directions: directionMap,
                height: height,
                width: width,
                tiles: tileMap
            },
            boxes: boxes,
            hero: hero
        };
    }

    private createRectangularMatrix(height: number, width: number, baseMatrix: (Tiles | Directions | undefined)[][], defaultValue: Tiles | Directions | undefined):
        (Tiles | Directions | undefined)[][] {
        return new Array(height)
            .fill(new Array(width)
                .fill(null))
            .map((line, y) => line
                .map((_: any, x: number) => {
                    const value = baseMatrix[y][x];
                    return value !== undefined ? value : defaultValue;
                }));
    }

    private removeMetaChars(metamap: string[][]): { directions: (Directions | undefined)[][], tiles: Tiles[][] } {
        const directionRegex = /[udlr]/;
        const numberRegex = /\d/;
        const directions: (Directions | undefined)[][] = [];
        const tiles: Tiles[][] = [];
        for (let line = 0; line < metamap.length; ++line) {
            let directionsLine: (Directions | undefined)[] = [];
            let tilesLine: Tiles[] = [];
            for (let col = 0; col < metamap[line].length; ++col) {
                let char = metamap[line][col];
                let direction = undefined;

                let repetitions = '0';
                while (numberRegex.test(char)) {
                    repetitions += char;
                    char = metamap[line][++col];
                }
                if (directionRegex.test(char)) {
                    direction = getDirectionFromChar(char);
                    char = metamap[line][++col];
                }
                const repetitionAsNumber = Math.max(Number(repetitions), 1);
                tilesLine = tilesLine
                    .concat(new Array(repetitionAsNumber)
                        .fill(getTileFromChar(char)));
                directionsLine = directionsLine
                    .concat(new Array(repetitionAsNumber)
                        .fill(direction));
            }
            directions.push(directionsLine);
            tiles.push(tilesLine);
        }
        return {directions, tiles};
    }

    private splitInIrregularMatrix(encodedLevel: string) {
        const encodedMatrix: string[][] = encodedLevel
            .split(/[\n|]/)
            .filter(line => line.length > 0)
            .map(row => row.split(''));
        return encodedMatrix;

    }

    private extractBoxes(tileMap: Tiles[][]): Point[] {
        const boxes: Point[] = [];
        for (let line = 0; line < tileMap.length; ++line) {
            for (let col = 0; col < tileMap[line].length; ++col) {
                const tile = tileMap[line][col];
                if (tile === Tiles.box) {
                    boxes.push(new Point(col, line));
                    tileMap[line][col] = Tiles.floor;
                } else if (tile === Tiles.boxOnTarget) {
                    boxes.push(new Point(col, line));
                    tileMap[line][col] = Tiles.target;
                }
            }
        }
        return boxes;
    }

    private extractHero(tileMap: Tiles[][]): Point | undefined {
        for (let line = 0; line < tileMap.length; ++line) {
            for (let col = 0; col < tileMap[line].length; ++col) {
                const tile: Tiles = tileMap[line][col];
                if (tile === Tiles.hero) {
                    tileMap[line][col] = Tiles.floor;
                    return new Point(col, line);
                } else if (tile === Tiles.heroOnTarget) {
                    tileMap[line][col] = Tiles.target;
                    return new Point(col, line);
                }
            }
        }
    }
}
