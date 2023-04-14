import type { MultiLayeredMap } from "@/levels/standard-sokoban-annotation-tokennizer";
import type { Tiles } from "@/levels/tiles";
import { Point } from "@/math/point";
import { SokobanSolver, type SolutionOutput } from "./sokoban-solver";

export type SolverWorkerRequest = {
    staticFeatures: Map<Tiles, (StrippedPoint | Point)[]>;
    timeoutInMs: number;
    strippedMap: MultiLayeredMap;
    dynamicMap: Map<Tiles, (StrippedPoint | Point)[]>;
};

export type SolverWorkerResponse = {
    solutionOutput?: SolutionOutput;
    aborted?: boolean,
    error?: string,
};

interface StrippedPoint {
    _x: number;
    _y: number;
}

const mapMapPointToClass = (input: Map<Tiles, (StrippedPoint | Point)[]>): Map<Tiles, Point[]> => {
    const result: Map<Tiles, Point[]> = new Map();
    for (let [key, value] of input.entries()) {
        result.set(key, value
            .map((item => {
                const stripped: StrippedPoint = item as StrippedPoint;
                return new Point(stripped._x, stripped._y);
            })));
    }
    return result;
}

let solver: SokobanSolver | undefined;

console.log('solver running')

self.onmessage = async function (event: MessageEvent<SolverWorkerRequest>) {
    console.log('solver got message')
    if (solver) {
        solver.abort();
    }
    let timeout;
    try {
        solver = new SokobanSolver({
            staticFeatures: mapMapPointToClass(event.data.staticFeatures),
            strippedMap: event.data.strippedMap
        });
        timeout = setTimeout(() => {
            console.log('timed out')
            solver?.abort();
            solver = undefined;
            throw Error(`Solver timedout`);
        }, event.data.timeoutInMs);
        console.log('Starting map solver')
        const solution: SolutionOutput = await solver.solve(mapMapPointToClass(event.data.dynamicMap))
        console.log(solution)
        console.log('Map solved')
        self.postMessage({ solutionOutput: solution });
    } catch (e) {
        console.log(`Solver aborted`, e)
        self.postMessage({ error: e, aborted: true } as SolverWorkerResponse);
    }
    clearTimeout(timeout);
}
