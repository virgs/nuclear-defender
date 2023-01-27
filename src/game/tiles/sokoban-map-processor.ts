import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export type ProcessedMap = {
    removedFeatures: Map<Tiles, Point[]>;
    raw: MultiLayeredMap,
    pointMap: Map<Tiles, Point[]>
};

export class SokobanMapProcessor {
    private readonly dressedLayeredTileMatrix: MultiLayeredMap;

    constructor(dressedLayeredTileMatrix: MultiLayeredMap) {
        this.dressedLayeredTileMatrix = dressedLayeredTileMatrix;
    }

    public strip(featuresToStripOff: Tiles[]): ProcessedMap {
        const pointMap: Map<Tiles, Point[]> = new Map();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as Tiles)
            .forEach(tile => pointMap.set(tile, []));

        const removed: Map<Tiles, Point[]> = new Map();
        featuresToStripOff
            .forEach(feature => removed.set(feature, []));
        const deepCopy = JSON.parse(JSON.stringify(this.dressedLayeredTileMatrix)) as MultiLayeredMap;
        deepCopy.strippedFeatureLayeredMatrix
            .forEach((line, y) =>
                line
                    .forEach((layers: OrientedTile[], x: number, editableLine) =>
                        editableLine[x] = layers
                            .filter(item => {
                                if (featuresToStripOff.includes(item.code)) {
                                    removed.get(item.code)!.push(new Point(x, y));
                                    return false;
                                }
                                pointMap.get(item.code)!.push(new Point(x, y));
                                return true;
                            })));
        return this.removeInternalEmptyTiles(pointMap, deepCopy, removed);
    }

    private removeInternalEmptyTiles(staticMap: Map<Tiles, Point[]>, matrix: MultiLayeredMap, dynamicMap: Map<Tiles, Point[]>) {
        let toVisit: { point: Point, tile: OrientedTile[] }[] = [];
        matrix.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
                .forEach((_: any, x: number) => toVisit
                    .push({point: new Point(x, y), tile: matrix.strippedFeatureLayeredMatrix[y][x]})));

        const heroPosition = dynamicMap.get(Tiles.hero)![0];
        const toInvestigate: Point[] = [heroPosition];
        //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from toVisit.
        //If some feature is still remaining in the toVisit, it means it is not in the explorableArea
        while (toInvestigate.length > 0) {
            const currentPoint = toInvestigate.pop()!;
            const staticItemInThePosition = toVisit
                .find(staticItem => staticItem.point.isEqualTo(currentPoint))!;
            toVisit = toVisit
                .filter(item => item.point.isDifferentOf(currentPoint));
            if (!staticItemInThePosition) { //item visited before
                continue;
            } else if (staticItemInThePosition.tile
                .some(tile => tile.code === Tiles.wall)) {
                continue;
            } else if (staticItemInThePosition.tile
                .every(tile => tile.code === Tiles.empty)) {
                //replace empty with wall
                matrix.strippedFeatureLayeredMatrix[currentPoint.y][currentPoint.x] = [{code: Tiles.floor}];
                staticMap.set(Tiles.empty, staticMap.get(Tiles.empty)!
                    .filter(item => item.isDifferentOf(currentPoint)));
            }

            SokobanMapProcessor.getNeighborsOf(currentPoint, matrix)
                .forEach(neighbor => {
                    if (toVisit
                        .find(item => item.point.isEqualTo(neighbor))) {
                        toInvestigate.push(neighbor);
                    }
                });
        }

        return {
            pointMap: staticMap,
            raw: matrix,
            removedFeatures: dynamicMap
        };
    }

    private static getNeighborsOf(point: Point, matrix: MultiLayeredMap): Point[] {
        const result: Point[] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const x = horizontal + point.x;
                const y = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    if (x >= 0 || y >= 0 ||
                        x < matrix.width ||
                        y < matrix.height) {
                        result.push(new Point(x, y));
                    }
                }

            }
        }
        return result;
    }

}