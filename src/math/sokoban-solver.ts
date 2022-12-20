import {Point} from './point';
import {TileCodes} from '../tiles/tile-codes';
import {Actions} from '../constants/actions';
import {PriorityQueue} from './priority-queue';
import {MovementCoordinator} from '../actors/movement-coordinator';

type Solution = {
    path: Actions[],
    state: Map<TileCodes, Point[]>,
    score: number
};

enum ScoreBonus {
    PLAYER_MOVED = 1,
    BOX_MOVED = 0
}

const actions = Object.keys(Actions)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as Actions)
    .filter(action => action !== Actions.STAND);

export class SokobanSolver {
    private movementCoordinator: MovementCoordinator;
    private solutionCandidates: PriorityQueue<Solution> = new PriorityQueue((a: Solution, b: Solution) => a.score >= b.score);
    private visitedSolutions: string[] = [];

    public constructor() {
        this.movementCoordinator = new MovementCoordinator();
    }

    public async solve(initialMapState: Map<TileCodes, Point[]>): Promise<Actions[]> {
        console.log('Solving it');
        this.solutionCandidates.push({
            path: [],
            state: initialMapState,
            score: 0
        });

        let cpuBreath = 0;
        let iterationCounter = 0;
        let solution: Solution = undefined;
        const breathingValue = 250;
        while (this.solutionCandidates.size() > 0) {
            ++iterationCounter;
            ++cpuBreath;
            solution = this.iterate();
            if (solution) {
                break;
            }
            if (cpuBreath > breathingValue) {
                cpuBreath -= breathingValue;
                console.log('breathing', iterationCounter);
                await new Promise(r => setTimeout(r, 200));
            }
        }

        if (solution) {
            console.log('solution found. Steps: ' + solution.path.length + '. Iterations: ' + iterationCounter);
            return solution.path;
        }
    }

    private iterate(): Solution {
        const currentCandidate = this.solutionCandidates.pop();
        const hashOfCurrentSolution = this.calculateHashOfSolution(currentCandidate);
        if (this.wasSolutionVisitedBefore(hashOfCurrentSolution)) {
            return;
        }
        this.visitedSolutions.push(hashOfCurrentSolution);
        return this.applyActionsToCandidate(currentCandidate);
    }

    private applyActionsToCandidate(currentSolution: Solution) {
        for (let action of actions) {
            const movementCoordinatorOutput = this.movementCoordinator.update({
                heroAction: action,
                mapState: currentSolution.state
            });

            const newCandidate: Solution = {
                score: currentSolution.score + ScoreBonus.PLAYER_MOVED,
                path: currentSolution.path.concat(action),
                state: movementCoordinatorOutput.newMapState
            };

            if (movementCoordinatorOutput.mapChanged) {
                if (this.solutionSolvesMap(movementCoordinatorOutput.newMapState)) {
                    return newCandidate;
                } else if (movementCoordinatorOutput.featuresMovementMap.get(TileCodes.box).length > 0) {
                    newCandidate.score += ScoreBonus.BOX_MOVED;
                }
                this.solutionCandidates.push(newCandidate);
            }
        }
    }

    private solutionSolvesMap(state: Map<TileCodes, Point[]>): boolean {
        return state.get(TileCodes.box)
            .every(box => state
                .get(TileCodes.target)
                .some(target => target.x === box.x &&
                    target.y === box.y));
    }

    private wasSolutionVisitedBefore(newCandidateHash: string): boolean {
        return this.visitedSolutions
            .some(previousHash => previousHash === newCandidateHash);
    }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.state.get(TileCodes.box)
            .sort()
            .map(box => `(${box.x}, ${box.y})`).toString()}|${newCandidate.state.get(TileCodes.hero)
            .map(hero => `(${hero.x}, ${hero.y})`).toString()}`;
    }
}
