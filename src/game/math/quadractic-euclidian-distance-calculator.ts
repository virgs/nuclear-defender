import type {DistanceCalculator} from '@/game/math/distance-calculator';
import type {Point} from '@/game/math/point';

export class QuadracticEuclidianDistanceCalculator implements DistanceCalculator {
    public distance(from: Point, to: Point): number {
        return Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2);
    }

}