import type {Point} from '../math/point';

export interface DistanceCalculator {
    distance(from: Point, to: Point): number;
}