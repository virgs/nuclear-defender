import Heap from 'heap';
import {Point} from '../math/point';
import {Tiles} from '../tiles/tiles';
import {Actions} from '../constants/actions';
import {MovementOrchestrator} from '../engine/movement-orchestrator';
import type {DistanceCalculator} from '@/game/math/distance-calculator';
import {MovementAnalyser, MovementEvents} from '@/game/solver/movement-analyser';
import type {StaticMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

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
    private readonly tileMap: StaticMap;
    private readonly movementBonusMap: Map<MovementEvents, number>;
    private readonly movementAnalyser: MovementAnalyser;
    private readonly sleepForInMs: number;
    private readonly sleepingCycle: number;
    private hero?: Point;
    private boxes: Point[] = [];

    public constructor(input: {
        tileMap: StaticMap,
        cpu: { sleepForInMs: number, sleepingCycle: number }
        distanceCalculator: DistanceCalculator
    }) {
        this.sleepForInMs = input.cpu.sleepForInMs;
        this.sleepingCycle = input.cpu.sleepingCycle;

        this.tileMap = input.tileMap;
        this.tileMap.tiles = (JSON.parse(JSON.stringify(input.tileMap.tiles)) as OrientedTile[][])
            .map((tile: OrientedTile[], y: number) => {
                return tile.map((tile: OrientedTile, x: number) => {
                    if (tile.code === Tiles.heroOnTarget) {
                        tile.code = Tiles.target;
                        this.hero = new Point(x, y);
                    } else if (tile.code === Tiles.hero) {
                        this.hero = new Point(x, y);
                    } else if (tile.code === Tiles.boxOnTarget) {
                        tile.code = Tiles.target;
                        this.boxes.push(new Point(x, y));
                    } else if (tile.code === Tiles.box) {
                        this.boxes.push(new Point(x, y));
                    }

                    return tile;
                });
            });

        this.movementCoordinator = new MovementOrchestrator({staticMap: this.tileMap});
        this.movementAnalyser = new MovementAnalyser({
            staticMap: this.tileMap,
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
                        boxes: afterAction.boxes.map(box => box.currentPosition),
                        hero: afterAction.hero.currentPosition,
                        actions: candidate.actions.concat(action),
                        score: candidate.score + heroMovementCost + analysis.shortestDistanceFromEveryBoxToTheClosestTarget
                    };
                    newCandidate.hash = this.calculateHashOfSolution(newCandidate);
                    if (!analysis.isDeadLocked) {
                        this.candidatesToVisit.push(newCandidate);
                    }
                }
            });
    }

    private candidateSolvesMap(boxesPosition: Point[]): boolean {
        return boxesPosition
            .every(box => this.tileMap.tiles[box.y][box.x].code === Tiles.target);
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
