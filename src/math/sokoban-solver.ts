import {Point} from './point';
import {TileCode} from '../tiles/tile-code';
import {Direction} from '../constants/direction';
import {MovementCoordinator} from '../actors/movement-coordinator';

type Solution = {
    path: Direction[],
    state: Map<TileCode, Point[]>,
    score: number
};

const actions = Object.keys(Direction)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as Direction);

export class SokobanSolver {
    private movementCoordinator: MovementCoordinator;
    // private solutionCandidates: PriorityQueue<Solution> = new PriorityQueue((a: Solution, b: Solution) => a.score >= b.score);
    private solutionCandidates: Solution[] = [];
    private visitedSolutions: string[] = [];

    public constructor() {
        this.movementCoordinator = new MovementCoordinator();
    }

    public solve(initialMapState: Map<TileCode, Point[]>): Direction[] {
        console.log('Solving it');
        this.solutionCandidates.push({
            path: [],
            state: initialMapState,
            score: 0
        });

        let iterationCounter = 0;
        let solution: Solution = undefined;
        while (this.solutionCandidates.length > 0) {
            ++iterationCounter;
            solution = this.iterate();
            if (solution) {
                break;
            }
        }

        if (solution) {
            return solution.path;
        }
    }

    private iterate(): Solution {
        const currentCandidate = this.solutionCandidates.shift();
        const hashOfCurrentSolution = this.calculateHashOfSolution(currentCandidate);
        if (this.wasSolutionVisitedBefore(hashOfCurrentSolution)) {
            return;
        }
        this.visitedSolutions.push(hashOfCurrentSolution);
        return this.applyActionsToCandidate(currentCandidate);
    }

    private applyActionsToCandidate(currentSolution: Solution) {
        for (let direction of actions) {
            const movementCoordinatorOutput = this.movementCoordinator.update({
                heroMovingIntentionDirection: direction,
                mapState: currentSolution.state
            });

            const newCandidate: Solution = {
                score: currentSolution.score + 1,
                path: currentSolution.path.concat(direction),
                state: movementCoordinatorOutput.newMapState
            };

            if (movementCoordinatorOutput.mapChanged) {
                if (this.solutionSolvesMap(movementCoordinatorOutput.newMapState)) {
                    return newCandidate;
                } else {
                    this.solutionCandidates.push(newCandidate);
                }
            }
        }
    }

    private solutionSolvesMap(state: Map<TileCode, Point[]>): boolean {
        return state.get(TileCode.box)
            .every(box => state
                .get(TileCode.target)
                .some(target => target.x === box.x &&
                    target.y === box.y));
    }

    private wasSolutionVisitedBefore(newCandidateHash: string): boolean {
        return this.visitedSolutions
            .some(previousHash => previousHash === newCandidateHash);
    }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.state.get(TileCode.box)
            .sort()
            .map(box => `(${box.x}, ${box.y})`).toString()}|${newCandidate.state.get(TileCode.hero)
            .map(hero => `(${hero.x}, ${hero.y})`).toString()}`;
    }
}
