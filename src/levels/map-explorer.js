import { Point } from '@/math/point';
import { Tiles } from '@/levels/tiles';
export class MapExplorer {
    toInvestigate;
    dimensions;
    notInvestigatedYet;
    constructor(output) {
        this.dimensions = new Point(output.raw.width, output.raw.height);
        this.notInvestigatedYet = [];
        output.raw.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((_, x) => this.notInvestigatedYet.push({
            point: new Point(x, y),
            tiles: output.raw.strippedFeatureLayeredMatrix[y][x]
        })));
        const heroPosition = output.removedFeatures.get(Tiles.hero)[0];
        this.toInvestigate = [heroPosition];
    }
    explore() {
        const wrapped = [];
        const mapLeaks = [];
        const acessibleEmpty = [];
        //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from notInvestigatedYet.
        //If some feature is still remaining in the notInvestigatedYet, it means it is not in the explorableArea
        while (this.toInvestigate.length > 0) {
            const currentPoint = this.toInvestigate.shift();
            const staticItemInThePosition = this.notInvestigatedYet
                .find(staticItem => staticItem.point.isEqualTo(currentPoint));
            this.notInvestigatedYet = this.notInvestigatedYet
                .filter(item => item.point.isDifferentOf(currentPoint));
            if (!staticItemInThePosition) {
                continue;
            }
            else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.wall)) {
                continue;
            }
            else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.empty)) {
                acessibleEmpty.push(currentPoint);
            }
            wrapped.push(currentPoint);
            MapExplorer.getNeighborsOf(currentPoint)
                .forEach(neighbor => {
                if (neighbor.x < 0 || neighbor.y < 0 ||
                    neighbor.x >= this.dimensions.x ||
                    neighbor.y >= this.dimensions.y) {
                    mapLeaks.push(neighbor);
                    return;
                }
                if (this.notInvestigatedYet
                    .find(item => item.point.isEqualTo(neighbor))) {
                    this.toInvestigate.push(neighbor);
                }
            });
        }
        const unwrapped = this.notInvestigatedYet
            .filter(tile => tile.tiles.length > 0 &&
            tile.tiles
                .some(layer => layer.code !== Tiles.empty))
            .map(item => item.point);
        return {
            wrapped: wrapped,
            leaks: mapLeaks,
            acessibleEmpties: acessibleEmpty,
            unwrapped: unwrapped
        };
    }
    static getNeighborsOf(point) {
        const result = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const x = horizontal + point.x;
                const y = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    result.push(new Point(x, y));
                }
            }
        }
        return result;
    }
}
