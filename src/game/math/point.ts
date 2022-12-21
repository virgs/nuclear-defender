export interface Point {
    x: number;
    y: number;
}

export function getPointsAround(point: Point, offset: Point = {x: 1, y: 1}): Point[] {
    const result = [];
    for (let horizontal = -1; horizontal < 1; ++horizontal) {
        for (let vertical = -1; vertical < 1; ++vertical) {
            if (horizontal !== 0 || vertical !== 0) {
                result.push({
                    x: point.x -= horizontal * offset.x,
                    y: point.y -= vertical * offset.y,
                });
            }
        }
    }
    return result;
}