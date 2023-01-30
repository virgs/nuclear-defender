import type {DistanceCalculator} from '../math/distance-calculator';
import type {Point} from '../math/point';

export class ManhattanDistanceCalculator implements DistanceCalculator {
    public distance(from: Point, to: Point): number {
        return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
    }

}