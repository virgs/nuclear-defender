import type {Point} from '@/game/math/point';

export interface DistanceCalculator {
    distance(from: Point, to: Point): number;
}