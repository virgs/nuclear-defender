import { Point } from '../../math/point';
import { Tiles } from '../../levels/tiles';
export class WrappedMapConstrainVerifier {
    verify(output) {
        let toVisit = [];
        output.raw.strippedFeatureLayeredMatrix
            .forEach((line, y) => line
            .forEach((_, x) => toVisit.push({ point: new Point(x, y), tiles: output.raw.strippedFeatureLayeredMatrix[y][x] })));
        const heroPosition = output.removedFeatures.get(Tiles.hero)[0];
        const toInvestigate = [heroPosition];
        //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from toVisit.
        //If some feature is still remaining in the toVisit, it means it is not in the explorableArea
        while (toInvestigate.length > 0) {
            const currentPoint = toInvestigate.shift();
            const staticItemInThePosition = toVisit
                .find(staticItem => staticItem.point.isEqualTo(currentPoint));
            toVisit = toVisit
                .filter(item => item.point.isDifferentOf(currentPoint));
            if (!staticItemInThePosition) { //item visited before
                continue;
            }
            else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.wall)) {
                continue;
            }
            else if (staticItemInThePosition.tiles
                .some(tile => tile.code === Tiles.empty)) {
                throw Error(`Did you notice there is an empty space at (${currentPoint.y + 1}, ${currentPoint.x + 1}).
                Well, I did and it doesn't look cool. Replace it with something more meaningful.`);
            }
            WrappedMapConstrainVerifier.getNeighborsOf(currentPoint)
                .forEach(neighbor => {
                if (neighbor.x < 0 || neighbor.y < 0 ||
                    neighbor.x >= output.raw.width ||
                    neighbor.y >= output.raw.height) {
                    throw Error(`Our hero is a escapper.
                            Wrap the whole level in walls otherwise it may be very hard to get the hero back. Put a wall somewhere around (${currentPoint.y + 1}, ${currentPoint.x + 1}).`);
                }
                if (toVisit
                    .find(item => item.point.isEqualTo(neighbor))) {
                    toInvestigate.push(neighbor);
                }
            });
        }
        this.checkNotVisitedYet(toVisit);
    }
    checkNotVisitedYet(toVisit) {
        const notWrapped = toVisit
            .filter(tile => tile.tiles.length > 0 &&
            tile.tiles
                .some(layer => layer.code !== Tiles.empty));
        if (notWrapped.length > 0) {
            throw Error(`What's the point of having something unnecessary at (${notWrapped[0].point.y + 1}, ${notWrapped[0].point.x + 1})? There can be only one hero explorable area.
                 Do yourself a favor and put everything inside it.`);
        }
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
