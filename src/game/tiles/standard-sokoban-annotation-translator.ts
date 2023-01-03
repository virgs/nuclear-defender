import {getTileFromChar, removeImplicitDoubleLayer, Tiles} from './tiles';
import {Directions, getDirectionFromChar, getDirectionRegex} from '@/game/constants/directions';

export type OrientedTile = {
    code: Tiles
    orientation?: Directions
};

export type MultiLayeredMap = {
    width: number,
    height: number,
    layeredOrientedTiles: OrientedTile[][][]
};

//TODO improve the readibility. It sucks big time
export class StandardSokobanAnnotationTranslator {
    public translate(encodedLevel: string): MultiLayeredMap {
        const irregularMatrix: string[][] = this.splitInIrregularMatrix(removeImplicitDoubleLayer(encodedLevel.toLowerCase()));
        const irregularTokenizedMatrix = this.removeMetaChars(irregularMatrix);
        const height = irregularTokenizedMatrix.length;
        const width = irregularTokenizedMatrix
            .reduce((acc, item) => item.length > acc ? item.length : acc, 0);

        const layeredOrientedTiles = this.createRectangularLayeredMatrix(height, width, irregularTokenizedMatrix);

        return {
            height: height,
            width: width,
            layeredOrientedTiles: layeredOrientedTiles
        };
    }

    private createRectangularLayeredMatrix(height: number, width: number, baseMatrix: OrientedTile[][][]): OrientedTile[][][] {
        return new Array(height)
            .fill(new Array(width)
                .fill(null))
            .map((line, y) => line
                .map((_: any, x: number) =>
                    (baseMatrix[y][x] || [])
                        .map(tile => ({
                            code: tile.code,
                            orientation: tile.orientation
                        }))));
    }

    private removeMetaChars(metamap: string[][]): OrientedTile[][][] {
        const result: OrientedTile[][][] = [];
        for (let line = 0; line < metamap.length; ++line) {
            let resultLine: OrientedTile[][] = [];
            for (let col = 0; col < metamap[line].length; ++col) {
                let char = metamap[line][col];
                const metamapLine = metamap[line];

                let repetitions = '0';
                const numberRegex = /\d/;
                while (numberRegex.test(char)) {
                    repetitions += char;
                    char = metamapLine[++col];
                }
                const repetitionAsNumber = Math.max(Number(repetitions), 1);
                const layeredTiles = this.getLayeredTiles(metamapLine, col);
                const stacked = layeredTiles.stacked;
                col = layeredTiles.col;

                resultLine = resultLine
                    .concat(new Array(repetitionAsNumber)
                        .fill(stacked));
            }
            result.push(resultLine);
        }
        return result;
    }

    private getLayeredTiles(metamapLine: string[], col: number): { stacked: OrientedTile[], col: number } {
        const baseLayer = [Tiles.wall, Tiles.empty, Tiles.floor];
        //[@.Uso]
        const stacked: OrientedTile[] = [];
        const directionRegex = getDirectionRegex();
        if (metamapLine[col] === '[') {
            while (metamapLine[++col] !== ']') {
                let char = metamapLine[col];
                let orientation = undefined;
                if (directionRegex.test(char)) {
                    orientation = getDirectionFromChar(char);
                    char = metamapLine[++col];
                }

                const tileFromChar = getTileFromChar(char);
                stacked.push({
                    orientation: orientation,
                    code: tileFromChar
                });
            }
        } else {
            let orientation;
            let tileFromChar = getTileFromChar(metamapLine[col]);
            if (directionRegex.test(metamapLine[col])) {
                orientation = getDirectionFromChar(metamapLine[col]);
                tileFromChar = getTileFromChar(metamapLine[++col]);
            }
            if (tileFromChar !== Tiles.empty) {
                stacked.push({
                    code: tileFromChar,
                    orientation
                });
            }
        }
        if (stacked.length > 0 && stacked
            .every(item => !baseLayer.includes(item.code))) {
            stacked.push({
                code: Tiles.floor
            });
        }
        return {stacked, col};
    }

    private splitInIrregularMatrix(encodedLevel: string): string[][] {
        return encodedLevel
            .split(/[\n|]/)
            .filter(line => line.length > 0)
            .map(row => row.split(''));
    }

}
