import {Point} from '../math/point';
import {Tiles} from '../levels/tiles';
import type {MultiLayeredMap, OrientedTile} from '../levels/standard-sokoban-annotation-tokennizer';

export type ProcessedMap = {
    removedFeatures: Map<Tiles, Point[]>;
    raw: MultiLayeredMap,
    pointMap: Map<Tiles, Point[]>
};

export class SokobanMapStripper {
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
        return {
            pointMap: pointMap,
            raw: deepCopy,
            removedFeatures: removed
        };
    }
}