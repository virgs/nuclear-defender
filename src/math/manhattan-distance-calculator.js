export class ManhattanDistanceCalculator {
    distance(from, to) {
        return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
    }
}
