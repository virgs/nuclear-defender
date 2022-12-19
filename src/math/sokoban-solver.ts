import {Point} from './point';
import {TileCode} from '../tiles/tile-code';
import {PriorityQueue} from './priority-queue';
import {Direction} from '../constants/direction';
import {MovementCoordinator} from '../actors/movement-coordinator';

type Solution = {
    path: Direction[],
    state: Map<TileCode, Point[]>,
    score: number
};

enum ScoreBonus {
    PLAYER_MOVED = 1,
    BOX_MOVED = 0
}

const actions = Object.keys(Direction)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as Direction);

export class SokobanSolver {
    private movementCoordinator: MovementCoordinator;
    private solutionCandidates: PriorityQueue<Solution> = new PriorityQueue((a: Solution, b: Solution) => a.score >= b.score);
    private visitedSolutions: string[] = [];

    public constructor() {
        this.movementCoordinator = new MovementCoordinator();
    }

    public async solve(initialMapState: Map<TileCode, Point[]>): Promise<Direction[]> {
        console.log('Solving it');
        this.solutionCandidates.push({
            path: [],
            state: initialMapState,
            score: 0
        });

        let cpuBreath = 0;
        let iterationCounter = 0;
        let solution: Solution = undefined;
        const breathingValue = 200;
        while (this.solutionCandidates.size() > 0) {
            ++iterationCounter;
            ++cpuBreath;
            // console.log(iterationCounter, cpuBreath)
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
        for (let direction of actions) {
            const movementCoordinatorOutput = this.movementCoordinator.update({
                heroMovingIntentionDirection: direction,
                mapState: currentSolution.state
            });

            const newCandidate: Solution = {
                score: currentSolution.score + ScoreBonus.PLAYER_MOVED,
                path: currentSolution.path.concat(direction),
                state: movementCoordinatorOutput.newMapState
            };

            if (movementCoordinatorOutput.mapChanged) {
                if (this.solutionSolvesMap(movementCoordinatorOutput.newMapState)) {
                    return newCandidate;
                } else if (movementCoordinatorOutput.featuresMovementMap.get(TileCode.box).length > 0) {
                    newCandidate.score += ScoreBonus.BOX_MOVED;
                }
                this.solutionCandidates.push(newCandidate);
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
