import Heap from 'heap';
import {Tiles} from '../tiles/tiles';
import type {Point} from '../math/point';
import {Actions} from '../constants/actions';
import {MovementOrchestrator} from '../engine/movement-orchestrator';
import {MovementAnalyser, MovementEvents} from '@/game/solver/movement-analyser';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {ManhattanDistanceCalculator} from '@/game/math/manhattan-distance-calculator';
import {MetricEmitter, Metrics} from '@/game/solver/metric-emitter';

type Solution = {
    actions: Actions[],
    hero: { id: number, point: Point },
    boxes: { id: number, point: Point }[],
    distanceSum: number,
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
    private candidatesToVisit: Heap<Solution> = new Heap((a: Solution, b: Solution) => {
        const distanceDifference = a.distanceSum - b.distanceSum;
        if (distanceDifference === 0) {
            return a.score - b.score;
        }
        return distanceDifference;
    });
    private candidatesVisitedSet: Set<string> = new Set();
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementBonusMap: Map<MovementEvents, number>;
    private readonly movementAnalyser: MovementAnalyser;
    private readonly sleepForInMs: number;
    private readonly sleepingCycle: number;
    private startTime?: number;
    private readonly metricEmitter: MetricEmitter;

    public constructor(input: {
        staticFeatures: Map<Tiles, Point[]>;
        distanceCalculator: ManhattanDistanceCalculator;
        cpu: { sleepForInMs: number; sleepingCycle: number };
        strippedMap: MultiLayeredMap
    }) {
        this.sleepForInMs = input.cpu.sleepForInMs;
        this.sleepingCycle = input.cpu.sleepingCycle;

        this.strippedMap = input.strippedMap;

        this.movementCoordinator = new MovementOrchestrator({strippedMap: this.strippedMap});
        this.movementAnalyser = new MovementAnalyser({
            staticFeatures: input.staticFeatures,
            strippedMap: this.strippedMap,
            distanceCalculator: input.distanceCalculator
        });
        this.movementBonusMap = new Map<MovementEvents, number>;
        this.movementBonusMap.set(MovementEvents.HERO_MOVED, 0);
        this.movementBonusMap.set(MovementEvents.BOX_MOVED, 100);
        this.movementBonusMap.set(MovementEvents.BOX_MOVED_ONTO_TARGET, 200);
        this.movementBonusMap.set(MovementEvents.BOX_MOVED_OUT_OF_TARGET, 200);
        this.movementBonusMap.set(MovementEvents.HERO_MOVED_BOX_ONTO_TARGET, 200);
        this.movementBonusMap.set(MovementEvents.HERO_MOVED_BOX_OUT_OF_TARGET, -200);
        this.metricEmitter = new MetricEmitter();
    }

    public async solve(dynamicMap: Map<Tiles, Point[]>): Promise<SolutionOutput> {
        this.startTime = new Date().getTime();
        const {actions, iterations} = await this.startAlgorithm(dynamicMap);
        return {
            actions: actions,
            iterations: iterations,
            totalTime: new Date().getTime() - this.startTime
        };
    }

    private async startAlgorithm(dynamicMap: Map<Tiles, Point[]>) {
        console.log('start algorithm');
        const hero = dynamicMap.get(Tiles.hero)![0];
        const boxes = dynamicMap.get(Tiles.box)!;
        const initialCandidate: Solution = {
            actions: [],
            hero: {point: hero, id: 0},
            boxes: boxes.map((box, id) => ({point: box, id: id + 1})),
            distanceSum: 0,
            score: 0
        };
        initialCandidate.hash = await this.metricEmitter
            .measureFunction(Metrics.HASH_CALCULATION, () => this.calculateHashOfSolution(initialCandidate));
        this.candidatesToVisit.push(initialCandidate);

        let iterations = 0;
        let cpuBreath = 0;
        let foundSolution: Solution | undefined = undefined;
        let candidate: Solution | undefined = this.candidatesToVisit.pop();
        while (candidate) {
            ++iterations;
            ++cpuBreath;

            foundSolution = await this.checkSolution(candidate);
            if (foundSolution) {
                break;
            }
            if (cpuBreath > this.sleepingCycle) {
                cpuBreath = 0;

                await this.metricEmitter.measureFunction(Metrics.BREATHING_TIME, async () => {
                    await new Promise(resolve => setTimeout(() => {
                        resolve(undefined);
                    }, this.sleepForInMs));
                });
            }
            candidate = await this.metricEmitter.measureFunction(Metrics.POP_CANDIDATE, () => this.candidatesToVisit.pop());
        }
        console.log(this.candidatesToVisit.size());
        this.metricEmitter.log();
        return {actions: foundSolution?.actions, iterations};
    }

    private async checkSolution(candidate: Solution): Solution | undefined {

        if (await this.metricEmitter.measureFunction(Metrics.VISISTED_LIST_CHECK, () => !this.candidateWasVisitedBefore(candidate.hash!))) {
            this.candidatesVisitedSet.add(candidate.hash!);

            if (this.candidateSolvesMap(candidate.boxes)) {
                return candidate;
            }

            await this.applyMoreActions(candidate);
        }
    }

    private async applyMoreActions(candidate: Solution) {
        for (const action of SokobanSolver.actionsList) {
            const afterAction = this.movementCoordinator.update({
                heroAction: action,
                hero: candidate.hero,
                boxes: candidate.boxes
            });

            if (afterAction.mapChanged) {
                const analysis = await this.metricEmitter.measureFunction(Metrics.MOVE_ANALYSYS, () => this.movementAnalyser.analyse(afterAction));
                const actionScore = analysis.events
                    .reduce((acc, value) => acc + this.movementBonusMap.get(value)!, 0);
                const heroMovementCost = 1;
                const newCandidate: Solution = {
                    boxes: afterAction.boxes
                        .map(box => ({point: box.nextPosition, id: box.id})),
                    hero: {point: afterAction.hero.nextPosition, id: afterAction.hero.id},
                    actions: candidate.actions.concat(action),
                    score: actionScore,
                    distanceSum: candidate.distanceSum + heroMovementCost + analysis.sumOfEveryBoxToTheClosestTarget
                };

                newCandidate.hash = await this.metricEmitter.measureFunction(Metrics.HASH_CALCULATION, () => this.calculateHashOfSolution(newCandidate));
                if (!analysis.isDeadLocked) {
                    await this.metricEmitter.measureFunction(Metrics.ADD_CANDIDATE, () => this.candidatesToVisit.push(newCandidate));
                }
            }
        }
    }

    private candidateSolvesMap(boxesPosition: { id: number; point: Point }[]): boolean {
        return boxesPosition
            .every(box => this.strippedMap.strippedFeatureLayeredMatrix[box.point.y][box.point.x]
                .some(layer => layer.code === Tiles.target));
    }

    private candidateWasVisitedBefore(newCandidateHash: string): boolean {
        return this.candidatesVisitedSet.has(newCandidateHash);
    }

    private calculateHashOfSolution(newCandidate: Solution) {
        return `${newCandidate.boxes
            .map(box => `${box.point.x},${box.point.y}`)
            .sort()
            .join(';')}:${newCandidate.hero.point.x},${newCandidate.hero.point.y}`;
    }

}
