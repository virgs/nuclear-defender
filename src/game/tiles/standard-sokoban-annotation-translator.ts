import {Directions, getDirectionFromChar} from '@/game/constants/directions';
import {getTilesFromChar, replaceImplicitLayeredTiles, Tiles} from '@/game/tiles/tiles';

export type OrientedTile = {
    code: Tiles
    orientation?: Directions
};

export type MultiLayeredMap = {
    width: number,
    height: number,
    strippedFeatureLayeredMatrix: OrientedTile[][][]
};

export class StandardSokobanAnnotationTranslator {
    public translate(encodedLevel: string): MultiLayeredMap {
        const lines: string[] = this.splitInLines(replaceImplicitLayeredTiles(encodedLevel.toLowerCase()));
        const irregularTokenizedMatrix = this.removeMetaChars(lines);
        const height = irregularTokenizedMatrix.length;
        const width = irregularTokenizedMatrix
            .reduce((acc, item) => item.length > acc ? item.length : acc, 0);

        const layeredOrientedTiles = this.createRectangularLayeredMatrix(height, width, irregularTokenizedMatrix);
        console.log(layeredOrientedTiles);
        return {
            height: height,
            width: width,
            strippedFeatureLayeredMatrix: layeredOrientedTiles
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

    private splitInLines(encodedLevel: string): string[] {
        return encodedLevel
            .split(/[\n|]/)
            .filter(line => line.length > 0);
    }

    private removeMetaChars(metamap: string[]): OrientedTile[][][] {
        const baseLayerTiles = [Tiles.floor, Tiles.empty, Tiles.wall];
        const baseLayer = {code: Tiles.floor};

        const tileRegex = /\d*\[([^\]]*)\]|(\d*[udlr]?.)/g;
        // #dw14lt$22[@.usdw]us4-#
        //
        // #
        // dw
        // 14lt
        // $
        // 22[@.usdw]
        // us
        // 4-
        // #
        return metamap
            .map(line =>
                (line.match(tileRegex)! || [])
                    .reduce((layer, annotation) => {
                        if (annotation.includes('[')) {
                            //22[@.usdw]
                            let repetition = 1;
                            const [_, repetitionStr, tiles] = annotation.match(/(\d*)\[(.*?)]/)!; //'22', '@.usdw'
                            if (repetitionStr) {
                                repetition = Math.max(Number(repetitionStr), repetition);
                            }
                            const cell = tiles.match(tileRegex)!
                                .map(coded => this.getOrientedTilesFromExpression(coded)[0]);

                            if (cell
                                .every(item => !baseLayerTiles.includes(item.code))) {
                                cell.push(baseLayer);
                            }
                            Array.from(new Array(repetition))
                                .forEach(_ => {
                                    layer.push(cell);
                                });
                        } else {
                            this.getOrientedTilesFromExpression(annotation)
                                .forEach(tile => {
                                    const cell = [tile];
                                    if (!baseLayerTiles.includes(cell[0].code)) {
                                        cell.push(baseLayer);
                                    }
                                    layer.push(cell);
                                });
                        }
                        return layer;
                    }, [] as OrientedTile[][]));
    }

    private getOrientedTilesFromExpression(expression: string): OrientedTile[] {
        // 14lt => 14, l, t
        let [_, repetitionStr, directionStr, tileStr] = expression.match(/(\d*)([udlr]*)(.*)/)!;
        let repetition = 1;
        if (repetitionStr) {
            repetition = Math.max(Number(repetitionStr), repetition);
        }
        let direction: Directions | undefined = undefined;
        if (directionStr) {
            direction = getDirectionFromChar(directionStr);
        }
        const orientedTile = {
            code: getTilesFromChar(tileStr),
            orientation: direction
        };
        return new Array(repetition)
            .fill(orientedTile);
    }
}
