import type { MultiLayeredMap } from "@/levels/standard-sokoban-annotation-tokennizer";
import type { Tiles } from "@/levels/tiles";
import { Point } from "@/math/point";
import { SokobanSolver, type SolutionOutput } from "./sokoban-solver";

export type SolverWorkerRequest = {
    staticFeatures: Map<Tiles, ({_x: number, _y: number} | Point)[]>;
    timeoutInMs: number;
    strippedMap: MultiLayeredMap;
    dynamicMap: Map<Tiles, ({_x: number, _y: number} | Point)[]>;
};

export type SolverWorkerResponse = {
    solutionOutput?: SolutionOutput;
    aborted?: boolean,
    error?: string,
};

const mapMapPointToClass = (input: Map<Tiles, {_x: number, _y: number}[]>): Map<Tiles, Point[]> => {
    const result: Map<Tiles, Point[]> = new Map();
    for (let [key, value] of input.entries()) {
        result.set(key, value
            .map(item => new Point(item._x, item._y)));
    }
    return result;
}

let solver: SokobanSolver | undefined;

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
