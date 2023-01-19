import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export type ProcessedMap = {
    removedFeatures: Map<Tiles, Point[]>;
    strippedLayeredTileMatrix: MultiLayeredMap,
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
        return {
            pointMap: pointMap,
            strippedLayeredTileMatrix: deepCopy,
            removedFeatures: removed
        };
    }
}