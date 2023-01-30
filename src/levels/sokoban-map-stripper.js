import { Point } from '../math/point';
import { Tiles } from '../levels/tiles';
export class SokobanMapStripper {
    dressedLayeredTileMatrix;
    constructor(dressedLayeredTileMatrix) {
        this.dressedLayeredTileMatrix = dressedLayeredTileMatrix;
    }
    strip(featuresToStripOff) {
        const pointMap = new Map();
        Object.keys(Tiles)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key))
            .forEach(tile => pointMap.set(tile, []));
        const removed = new Map();
        featuresToStripOff
            .forEach(feature => removed.set(feature, []));
        const deepCopy = JSON.parse(JSON.stringify(this.dressedLayeredTileMatrix));
        deepCopy.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((layers, x, editableLine) => editableLine[x] = layers
            .filter(item => {
            if (featuresToStripOff.includes(item.code)) {
                removed.get(item.code).push(new Point(x, y));
                return false;
            }
            pointMap.get(item.code).push(new Point(x, y));
            return true;
        })));
        return {
            pointMap: pointMap,
            raw: deepCopy,
            removedFeatures: removed
        };
    }
}
