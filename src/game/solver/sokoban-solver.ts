import Heap from 'heap';
import {Point} from '../math/point';
import {Actions} from '../constants/actions';
import {TileCodes} from '../tiles/tile-codes';
import type {MovementCoordinatorOutput} from './movement-coordinator';
import {MovementCoordinator} from './movement-coordinator';
import {MovementAnalyser, MovementAnalyses} from '@/game/solver/movement-analyser';

type Solution = {
    actions: Actions[],
    hero: Point,
    boxes: Point[],
    score: number,
    hash?: string,
};

//https://isaaccomputerscience.org/concepts/dsa_search_a_star?examBoard=all&stage=all
export class SokobanSolver {

    private static SmartActions = Object.keys(Actions)
        .filter(key => !isNaN(Number(key)))
        .map(key => Number(key) as Actions)
        .filter(action => action !== Actions.STAND); //TODO remove when Stand is a smart action

    private movementCoordinator: MovementCoordinator;
    //a.foo - b.foo; ==> heap.pop(); gets the smallest
    private candidatesToVisit: Heap<Solution> = new Heap((a: Solution, b: Solution) => a.score - b.score);
    private candidatesVisitedHash: { [hash: string]: boolean } = {};
    private readonly staticMap: { width: number; height: number; tiles: TileCodes[][] };
    private readonly movementBonusMap: Map<MovementAnalyses, number>;
    private readonly movementAnalyser: MovementAnalyser;
    private readonly targets: Point[];

    public constructor(staticMap: { width: number; height: number; tiles: TileCodes[][] }) {
        this.staticMap = staticMap;

        this.targets = [];
        for (let y = 0; y < staticMap.height; ++y) {
            for (let x = 0; x < staticMap.width; ++x) {
                if (staticMap.tiles[y][x] === TileCodes.target) {
                    this.targets.push(new Point(x, y));
                }
            }
        }

        this.movementCoordinator = new MovementCoordinator(staticMap);
        this.movementAnalyser = new MovementAnalyser();
        this.movementBonusMap = new Map<MovementAnalyses, number>;
        this.movementBonusMap.set(MovementAnalyses.HERO_MOVED, -1);
        this.movementBonusMap.set(MovementAnalyses.BOX_MOVED, 100);
        this.movementBonusMap.set(MovementAnalyses.HERO_MOVED_BOX_ONTO_TARGET, 5000);
        this.movementBonusMap.set(MovementAnalyses.HERO_MOVED_BOX_OUT_OF_TARGET, -150);
    }

    public async solve(hero: Point, boxes: Point[]): Promise<Actions[] | undefined> {
        const initialCandidate: Solution = {
            actions: [],
            hero,
            boxes,
            score: 0
        };
        initialCandidate.hash = this.calculateHashOfSolution(initialCandidate);
        this.candidatesToVisit.push(initialCandidate);

        let cpuBreath = 0;
        let solution: Solution | undefined = undefined;
        const breathingPeriod = 3000;
        const breathTime = 50;

        const startTime = new Date().getTime();
        for (let candidate: Solution | undefined = this.candidatesToVisit.pop();
             candidate;
             candidate = this.candidatesToVisit.pop()) {
            ++cpuBreath;

            solution = this.checkSolution(candidate);
            if (solution) {
                break;
            }
            if (cpuBreath > breathingPeriod) {
                cpuBreath -= breathingPeriod;
                // console.log(`Breathing. Current score: ${candidate.score}, actions: ${candidate.actions.length}`, iterationCounter);
                await new Promise(r => setTimeout(r, breathTime));
            }

        }

        if (solution) {
            console.log('solution found. Steps: ' + solution.actions.length + '. Total time: ' + (new Date().getTime() - startTime) / 1000);
            return solution.actions;
        }
    }

    private checkSolution(candidate: Solution): Solution | undefined {
        if (!this.candidateWasVisitedBefore(candidate.hash!)) {
            this.candidatesVisitedHash[candidate.hash!] = true;

            if (this.candidateSolvesMap(candidate.boxes)) {
                return candidate;
            }

            this.applyMoreActions(candidate);
        }
    }

    private applyMoreActions(candidate: Solution) {
        SokobanSolver.SmartActions
            .forEach((action: Actions) => {
                const afterAction = this.movementCoordinator.update({
                    boxes: candidate.boxes,
                    hero: candidate.hero,
                    staticMap: this.staticMap,
                    heroAction: action
                });

                if (afterAction.mapChanged) {
                    const actionScore: number = this.sumOfEveryBoxToTheClosestTarget(afterAction);
                    // const analysis = this.movementAnalyser.analyse(afterAction);
                    // const actionScore = analysis
                    //     .reduce((acc, value) => acc + this.movementBonusMap.get(value)!, 0);
                    const newCandidate: Solution = {
                        boxes: afterAction.boxes.map(box => box.currentPosition),
                        hero: afterAction.hero.currentPosition,
                        actions: candidate.actions.concat(action),
                        score: candidate.score + 1 + actionScore
                    };
                    newCandidate.hash = this.calculateHashOfSolution(newCandidate!);
                    // const inTheList = this.candidateIsAlreadyInTheToVisitList(newCandidate.hash);
                    // if (inTheList) {
                    //     if (inTheList.actions.length > newCandidate.actions.length) {
                    //         console.log('replace existing');
                    //         //replace it
                    //         // inTheList.boxes = newCandidate.boxes
                    //         // inTheList.hero = newCandidate.hero
                    //         inTheList.actions = newCandidate.actions;
                    //         // inTheList.score = newCandidate.score;
                    //     } else {
                    //         // console.log('do nothing. there is a better candidate already in the list')
                    //     }
                    // } else {
                    // console.log('add to visit')
                    this.candidatesToVisit.push(newCandidate);
                    // }

                }
            });
    }

    private candidateSolvesMap(boxesPosition: Point[]): boolean {
        return boxesPosition
            .every(box => this.staticMap.tiles[box.y][box.x] === TileCodes.target);
    }

    private candidateWasVisitedBefore(newCandidateHash: string): boolean {
        return this.candidatesVisitedHash[newCandidateHash];
    }

    // private candidateIsAlreadyInTheToVisitList(newCandidateHash: string): Solution | undefined {
    //     return this.candidatesToVisit
    //         .find(previousHash => previousHash.hash === newCandidateHash);
    // }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.boxes
            .map(box => `${box.x},${box.y}`)
            .sort()
            .join(';')}:${newCandidate.hero.x},${newCandidate.hero.y}`;
    }

    private sumOfEveryBoxToTheClosestTarget(afterAction: MovementCoordinatorOutput): number {
        return afterAction.boxes
            .reduce((acc, box) => {
                const distance: number = this.getTheSmallestDistanceOfBoxToTarget(box.currentPosition);
                return acc + distance;
            }, 0);
    }

    private getTheSmallestDistanceOfBoxToTarget(boxPosition: Point): number {
        return this.targets
            .reduce((acc, target) => Math.min(target.manhattanDistanceTo(boxPosition), acc), Infinity);
    }
}
