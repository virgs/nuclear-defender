import {Directions, getDirectionFromChar} from '@/game/constants/directions';
import {getTilesFromChar, replaceImplicitLayeredTiles, Tiles} from '@/game/tiles/tiles';

export type OrientedTile = {
    code: Tiles
    orientation?: Directions
};

export type LayeredTileMatrix = OrientedTile[][][];

export type MultiLayeredMap = {
    width: number,
    height: number,
    layeredTileMatrix: LayeredTileMatrix
};

//TODO improve the readibility. It sucks big time
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
            layeredTileMatrix: layeredOrientedTiles
        };
    }

    private createRectangularLayeredMatrix(height: number, width: number, baseMatrix: LayeredTileMatrix): LayeredTileMatrix {
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

    private removeMetaChars(metamap: string[]): LayeredTileMatrix {
        const tileRegex = /\d*\[(.*)\]|(\d*[udlr]?.)/g;
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
            .map(line => {
                return (line.match(tileRegex)! || [])
                    .reduce((acc, annotation) => {
                        if (annotation.includes('[')) {
                            //22[@.usdw]
                            let repetition = 1;
                            const [_, repetitionStr, tiles] = annotation.match(/(\d*)\[(.*?)]/)!; //'22', '@.usdw'
                            if (repetitionStr) {
                                repetition = Math.max(Number(repetitionStr), repetition);
                            }
                            const layered = tiles.match(tileRegex)!
                                .map(coded => this.getOrientedTilesFromExpression(coded)[0]);
                            Array.from(new Array(repetition))
                                .forEach(_ => {
                                    acc.push(layered);
                                });
                        } else {
                            this.getOrientedTilesFromExpression(annotation)
                                .forEach(tile => acc.push([tile]));
                        }
                        return acc;
                    }, [] as OrientedTile[][]);
            });
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
        const fill: OrientedTile[] = new Array(repetition)
            .fill(orientedTile);
        return fill;
    }
}
