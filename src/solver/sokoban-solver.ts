import Heap from 'heap';
import {Tiles} from '@/levels/tiles';
import type {Point} from '@/math/point';
import {Actions} from '@/constants/actions';
import {Directions} from '@/constants/directions';
import {MetricEmitter, Metrics} from './metric-emitter';
import {configuration} from '@/constants/configuration';
import type {MovementAnalysis, PushedBox} from './analyser/move-analyser';
import {MoveAnalyser} from './analyser/move-analyser';
import type {MovementOrchestratorOutput} from '@/engine/movement-orchestrator';
import {MovementOrchestrator} from '@/engine/movement-orchestrator';
import type {MultiLayeredMap, OrientedTile} from '@/levels/standard-sokoban-annotation-tokennizer';

type SolutionCandidate = {
    actions: Actions[],
    hero: { id: number, point: Point },
    boxes: { id: number, point: Point }[],
    lastActionResult?: MovementOrchestratorOutput,
    distanceSum: number,
    hash?: string,
    boxesLine: number,
    counterIntuitiveMoves: number,
    lastPushedBox: PushedBox;
};

export type SolutionOutput = {
    actions?: Actions[];
    counterIntuitiveMoves?: number,
    boxesLine?: number;
    iterations: number;
    totalTime: number;
    aborted: boolean;
}

//https://github.com/rvdweerd/BoxPusher-Reinforcement-Learning
//https://github.com/caozixuan/genetic-algorithm/blob/master/genetic_algorithm.py
//https://isaaccomputerscience.org/concepts/dsa_search_a_star?examBoard=all&stage=all
export class SokobanSolver {

    private static actionsList = Object.keys(Actions)
        .filter(key => !isNaN(Number(key)))
        .map(key => Number(key) as Actions);

    private iterations: number;
    private movementCoordinator: MovementOrchestrator;
    //    moves.sort((a, b) => {
    //       // Prioritize moves that push boxes onto goals
    //       const boxesOnGoals = (b[2] - a[2]) * 1000;
    //       // Then sort by the total Manhattan distance of boxes to goals
    //       const boxToGoalDistanceTotal = a[3] - b[3];
    //       return boxesOnGoals + boxToGoalDistanceTotal;
    //     });
    //a.foo - b.foo; ==> heap.pop(); gets the smallest
    private candidatesToVisit: Heap<SolutionCandidate> = new Heap((a: SolutionCandidate, b: SolutionCandidate) => a.distanceSum - b.distanceSum);
    private candidatesVisitedSet: Set<string> = new Set();
    private readonly strippedMap: MultiLayeredMap;
    private readonly movementAnalyser: MoveAnalyser;
    private readonly metricEmitter: MetricEmitter;
    private aborted: boolean;
    private startTime?: number;

    public constructor(input: {
        staticFeatures: Map<Tiles, Point[]>;
        strippedMap: MultiLayeredMap
    }) {
        this.strippedMap = input.strippedMap;
        this.iterations = 0;
        this.aborted = false;

        this.movementCoordinator = new MovementOrchestrator({strippedMap: this.strippedMap});
        this.movementAnalyser = new MoveAnalyser({
            staticFeatures: input.staticFeatures,
            strippedMap: this.strippedMap,
            distanceCalculator: configuration.solver.distanceCalculator
        });
        this.metricEmitter = new MetricEmitter();
    }

    public abort() {
        console.log('aborting current solution finding');
        this.aborted = true;
        this.candidatesToVisit.clear();
    }

    public async solve(dynamicMap: Map<Tiles, Point[]>): Promise<SolutionOutput> {
        this.startTime = new Date().getTime();
         const solution = await this.startAlgorithm(dynamicMap);
         return {
             aborted: this.aborted,
             actions: solution?.actions,
             boxesLine: solution?.boxesLine,
             counterIntuitiveMoves: solution?.counterIntuitiveMoves,
             iterations: this.iterations,
             totalTime: Date.now() - this.startTime
         }
    }

    private async startAlgorithm(dynamicMap: Map<Tiles, Point[]>): Promise<SolutionCandidate | undefined> {
        const hero = dynamicMap.get(Tiles.hero)![0];
        const boxes = dynamicMap.get(Tiles.box)!;
        const initialCandidate: SolutionCandidate = {
            boxesLine: 0,
            counterIntuitiveMoves: 0,
            lastPushedBox: {id: -1, direction: Directions.UP},
            actions: [],
            hero: {point: hero, id: 0},
            boxes: boxes
                .map((box, index) => ({point: box, id: index + 1})),
            distanceSum: 0
        };
        initialCandidate.hash = await this.metricEmitter
            .add(Metrics.HASH_CALCULATION, () => this.calculateHashOfSolution(initialCandidate));
        this.candidatesToVisit.push(initialCandidate);

        this.iterations = 0;
        let cpuBreath = 0;
        let foundSolution: SolutionCandidate | undefined = undefined;
        let candidate: SolutionCandidate | undefined = initialCandidate;
        while (candidate && !this.aborted) {
            ++this.iterations;
            ++cpuBreath;

            foundSolution = await this.checkSolution(candidate);
            if (foundSolution) {
                break;
            }
            if (cpuBreath > configuration.solver.iterationPeriodToSleep) {
                cpuBreath = 0;

                await this.metricEmitter.add(Metrics.BREATHING_TIME, async () => {
                    if (configuration.debug.solver.iterationNumber) {
                        console.log(this.iterations);
                    }
                    await new Promise(resolve => setTimeout(() => {
                        resolve(undefined);
                    }, configuration.solver.sleepForInMs));
                });
            }
            candidate = await this.metricEmitter.add(Metrics.POP_CANDIDATE, () => this.candidatesToVisit.pop());
        }
        if (configuration.debug.solver.metrics) {
            this.metricEmitter.log();
        }
        return foundSolution;
    }

    private async checkSolution(candidate: SolutionCandidate): Promise<SolutionCandidate | undefined> {
        if (await this.metricEmitter.add(Metrics.VISISTED_LIST_CHECK, () => !this.candidateWasVisitedBefore(candidate.hash!))) {
            this.candidatesVisitedSet.add(candidate.hash!);

            if (this.candidateSolvesMap(candidate.boxes)) {
                return candidate;
            }
            await this.applyMoreActions(candidate);
        }
        return undefined
    }

    private async applyMoreActions(candidate: SolutionCandidate) {
        for (const action of SokobanSolver.actionsList) {
            const afterAction = this.movementCoordinator.update({
                heroAction: action,
                hero: candidate.hero,
                boxes: candidate.boxes,
                lastActionResult: candidate.lastActionResult
            });

            if (afterAction.mapChanged) {
                const analysis: MovementAnalysis = await this.metricEmitter
                    .add(Metrics.MOVE_ANALYSYS, () => this.movementAnalyser.analyse(afterAction));
                const moveCost = 100;
                const heroMovementCost = action === Actions.STAND ? moveCost * .95 : moveCost;
                let currentBoxesLine = 0;
                if (analysis.pushedBox) {
                    if (analysis.pushedBox.id !== candidate.lastPushedBox.id || analysis.pushedBox.direction !== candidate.lastPushedBox.direction) {
                        currentBoxesLine = 1;
                    }
                }
                const counterIntuitiveMoves: number = analysis.sumOfEveryBoxToTheClosestTarget >= candidate.distanceSum ?
                    candidate.counterIntuitiveMoves + 1 : candidate.counterIntuitiveMoves;
                const newCandidate: SolutionCandidate = {
                    lastPushedBox: analysis.pushedBox || candidate.lastPushedBox,
                    boxesLine: candidate.boxesLine + currentBoxesLine,
                    boxes: afterAction.boxes
                        .map(box => ({point: box.nextPosition, id: box.id})),
                    hero: {point: afterAction.hero.nextPosition, id: afterAction.hero.id},
                    actions: candidate.actions.concat(action),
                    lastActionResult: afterAction,
                    counterIntuitiveMoves: counterIntuitiveMoves,
                    // distanceSum: candidate.distanceSum + heroMovementCost
                    distanceSum: candidate.distanceSum + heroMovementCost + analysis.sumOfEveryBoxToTheClosestTarget
                };

                newCandidate.hash = await this.metricEmitter.add(Metrics.HASH_CALCULATION, () => this.calculateHashOfSolution(newCandidate));
                if (!analysis.isDeadLocked) {
                    await this.metricEmitter.add(Metrics.ADD_CANDIDATE, () => this.candidatesToVisit.push(newCandidate));
                }
            }
        }
    }

    private candidateSolvesMap(boxesPosition: { id: number; point: Point }[]): boolean {
        return boxesPosition
            .every(box => this.getStaticFeaturesAtPosition(box.point)
                .some(layer => layer.code === Tiles.target));
    }

    private candidateWasVisitedBefore(newCandidateHash: string): boolean {
        return this.candidatesVisitedSet.has(newCandidateHash);
    }

    private calculateHashOfSolution(newCandidate: SolutionCandidate) {
        return `${newCandidate.boxes
            .map(box => `${box.point.x},${box.point.y}(${newCandidate.lastActionResult?.boxes
                .find(same => same.id === box.id)?.direction || '-'})`)
            .sort()
            .join(';')}:${newCandidate.hero.point.x},${newCandidate.hero.point.y}`;
    }

    private getStaticFeaturesAtPosition(position: Point): OrientedTile[] {
        if (position.x < this.strippedMap.width && position.y < this.strippedMap.height
            && position.x >= 0 && position.y >= 0) {
            return this.strippedMap.strippedFeatureLayeredMatrix[position.y][position.x];
        }
        return [];
    }
}
