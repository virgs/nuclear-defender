import type {Point} from './point';
import {Actions} from '../constants/actions';
import {TileCodes} from '../tiles/tile-codes';
import {MovementCoordinator} from '../actors/movement-coordinator';

type Solution = {
    actions: Actions[],
    hero: Point,
    boxes: Point[]
};

const actions = Object.keys(Actions)
    .filter(key => !isNaN(Number(key)))
    .map(key => Number(key) as Actions)
    .filter(action => action !== Actions.STAND);

//https://isaaccomputerscience.org/concepts/dsa_search_a_star?examBoard=all&stage=all
export class SokobanSolver {
    private movementCoordinator: MovementCoordinator;
    // private solutionCandidates: PriorityQueue<Solution> = new PriorityQueue((a: Solution, b: Solution) => a.score >= b.score);
    private solutionCandidates: Solution[];
    private visitedSolutions: string[] = [];
    private readonly staticMap: { width: number; height: number; tiles: TileCodes[][] };

    public constructor(staticMap: { width: number; height: number; tiles: TileCodes[][] }) {
        this.staticMap = staticMap;
        this.solutionCandidates = [];
        this.movementCoordinator = new MovementCoordinator(staticMap);
    }

    public async solve(hero: Point, boxes: Point[]): Promise<Actions[] | undefined> {
        this.solutionCandidates.push({
            actions: [],
            hero,
            boxes
        });

        let cpuBreath = 0;
        let iterationCounter = 0;
        let solution: Solution | undefined = undefined;
        const breathingValue = 250;

        for (let candidate: Solution | undefined = this.solutionCandidates.shift();
             candidate;
             candidate = this.solutionCandidates.shift()) {
            ++iterationCounter;
            ++cpuBreath;

            solution = this.checkSolution(candidate);
            if (solution) {
                break;
            }
            if (cpuBreath > breathingValue) {
                cpuBreath -= breathingValue;
                console.log('breathing', this.solutionCandidates[0].actions.length, iterationCounter);
                await new Promise(r => setTimeout(r, 20));
            }
            if (iterationCounter > 10000000) {
                break;
            }

        }

        if (solution) {
            console.log('solution found. Steps: ' + solution.actions.length + '. Iterations: ' + iterationCounter);
            return solution.actions;
        }
    }

    private checkSolution(candidate: Solution): Solution | undefined {
        const hashOfCurrentSolution = this.calculateHashOfSolution(candidate!);
        // console.log(hashOfCurrentSolution);
        if (!this.solutionWasVisitedBefore(hashOfCurrentSolution)) {
            this.visitedSolutions.push(hashOfCurrentSolution);

            if (this.solutionSolvesMap(candidate.boxes)) {
                return candidate;
            }

            return this.applyMoreActions(candidate);
        } else {
            console.log('visited before')
        }
    }

    private applyMoreActions(candidate: Solution): Solution | undefined {
        if (this.solutionSolvesMap(candidate.boxes)) {
            return candidate;
        }

        for (let action of actions) {
            const afterAction = this.movementCoordinator.update({
                boxes: candidate.boxes,
                hero: candidate.hero,
                staticMap: this.staticMap,
                heroAction: action
            });

            this.solutionCandidates.push({
                boxes: afterAction.boxes.map(box => box.currentPosition),
                hero: afterAction.hero.currentPosition,
                actions: candidate.actions.concat(action)
            });
        }
    }

    private solutionSolvesMap(boxesPosition: Point[]): boolean {
        return boxesPosition
            .every(box => this.staticMap.tiles[box.y][box.x] === TileCodes.target);
    }

    private solutionWasVisitedBefore(newCandidateHash: string): boolean {
        return this.visitedSolutions
            .some(previousHash => previousHash === newCandidateHash);
    }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.boxes
            .map(box => `${box.x},${box.y}`)
            .sort()
            .join(';')}:${newCandidate.hero.x},${newCandidate.hero.y}`;
    }
}
