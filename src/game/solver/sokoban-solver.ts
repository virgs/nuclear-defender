import Heap from 'heap';
import {Tiles} from '../tiles/tiles';
import type {Point} from '../math/point';
import {Actions} from '../constants/actions';
import {MovementOrchestrator} from '../engine/movement-orchestrator';
import {MovementAnalyser, MovementEvents} from '@/game/solver/movement-analyser';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';

type Solution = {
    actions: Actions[],
    hero: Point,
    boxes: Point[],
    score: number,
    hash?: string,
};

export type SolutionOutput = {
    actions?: Actions[];
    iterations: number;
    totalTime: number;
}

//TODO Create an interface out of this to allow comparisions
//https://isaaccomputerscience.org/concepts/dsa_search_a_star?examBoard=all&stage=all
export class SokobanSolver {

    private static actionsList = Object.keys(Actions)
        .filter(key => !isNaN(Number(key)))
        .map(key => Number(key) as Actions);

    private movementCoordinator: MovementOrchestrator;
    //a.foo - b.foo; ==> heap.pop(); gets the smallest
    private candidatesToVisit: Heap<Solution> = new Heap((a: Solution, b: Solution) => a.score - b.score);
    private candidatesVisitedHash: { [hash: string]: boolean } = {};
    private readonly tileMap: MultiLayeredMap;
    private readonly movementBonusMap: Map<MovementEvents, number>;
    private readonly movementAnalyser: MovementAnalyser;
    private readonly sleepForInMs: number;
    private readonly sleepingCycle: number;
    private readonly hero?: Point;
    private readonly boxes: Point[] = [];

    public constructor(input: {
        features: Map<Tiles, Point[]>;
        distanceCalculator: ManhattanDistanceCalculator;
        cpu: { sleepForInMs: number; sleepingCycle: number };
        strippedMatrix: any
    }) {
        this.sleepForInMs = input.cpu.sleepForInMs;
        this.sleepingCycle = input.cpu.sleepingCycle;

        this.tileMap = input.strippedMatrix;
        this.hero = input.features.get(Tiles.hero)![0];
        this.boxes = input.features.get(Tiles.box)!;
        console.log(input.features);

        this.movementCoordinator = new MovementOrchestrator({strippedMap: this.tileMap});
        this.movementAnalyser = new MovementAnalyser({
            featureMap: input.features,
            strippedMap: this.tileMap,
            distanceCalculator: input.distanceCalculator
        });
        this.movementBonusMap = new Map<MovementEvents, number>;
        this.movementBonusMap.set(MovementEvents.HERO_MOVED, -1);
        this.movementBonusMap.set(MovementEvents.BOX_MOVED, 100);
        this.movementBonusMap.set(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET, 5000);
        this.movementBonusMap.set(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET, -150);
    }

    public async solve(): Promise<SolutionOutput> {
        const startTime = new Date().getTime();
        const {actions, iterations} = await this.startAlgorithm();
        return {
            actions: actions,
            iterations: iterations,
            totalTime: new Date().getTime() - startTime
        };
    }

    private async startAlgorithm() {
        console.log('start algorithm');
        const initialCandidate: Solution = {
            actions: [],
            hero: this.hero!,
            boxes: this.boxes,
            score: 0
        };
        initialCandidate.hash = this.calculateHashOfSolution(initialCandidate);
        this.candidatesToVisit.push(initialCandidate);

        let iterations = 0;
        let cpuBreath = 0;
        let solution: Solution | undefined = undefined;
        for (let candidate: Solution | undefined = this.candidatesToVisit.pop();
             candidate;
             candidate = this.candidatesToVisit.pop()) {
            ++iterations;
            ++cpuBreath;

            solution = this.checkSolution(candidate);
            if (solution) {
                break;
            }
            if (cpuBreath > this.sleepForInMs) {
                cpuBreath -= this.sleepForInMs;
                await new Promise(r => setTimeout(r, this.sleepForInMs));
            }

        }
        return {actions: solution?.actions, iterations};
    }

    private checkSolution(candidate: Solution): Solution | undefined {
        console.log(candidate.hash);
        if (!this.candidateWasVisitedBefore(candidate.hash!)) {
            this.candidatesVisitedHash[candidate.hash!] = true;

            if (this.candidateSolvesMap(candidate.boxes)) {
                return candidate;
            }

            this.applyMoreActions(candidate);
        }
    }

    private applyMoreActions(candidate: Solution) {
        SokobanSolver.actionsList
            .forEach((action: Actions) => {
                const afterAction = this.movementCoordinator.update({
                    heroAction: action,
                    heroPosition: this.hero!,
                    boxes: this.boxes
                });

                if (afterAction.mapChanged) {
                    const analysis = this.movementAnalyser.analyse(afterAction);
                    // const actionScore = analysis.events.reduce((acc, value) => acc + this.movementBonusMap.get(value)!, 0);
                    const heroMovementCost = 1;
                    const newCandidate: Solution = {
                        boxes: afterAction.boxes.map(box => box.nextPosition),
                        hero: afterAction.hero.nextPosition,
                        actions: candidate.actions.concat(action),
                        score: candidate.score + heroMovementCost + analysis.shortestDistanceFromEveryBoxToTheClosestTarget
                    };
                    newCandidate.hash = this.calculateHashOfSolution(newCandidate);
                    // console.log(Actions[action], newCandidate.hash)
                    if (!analysis.isDeadLocked) {
                        this.candidatesToVisit.push(newCandidate);
                    } else {
                        console.log('dead');
                    }
                }
            });
    }

    private candidateSolvesMap(boxesPosition: Point[]): boolean {
        return boxesPosition
            .every(box => this.tileMap.layeredTileMatrix[box.y][box.x]
                .some(layer => layer.code === Tiles.target));
    }

    private candidateWasVisitedBefore(newCandidateHash: string): boolean {
        return this.candidatesVisitedHash[newCandidateHash];
    }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.boxes
            .map(box => `${box.x},${box.y}`)
            .sort()
            .join(';')}:${newCandidate.hero.x},${newCandidate.hero.y}`;
    }

}
