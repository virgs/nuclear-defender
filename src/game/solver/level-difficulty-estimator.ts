import type {SolutionOutput} from '@/game/solver/sokoban-solver';

export class LevelDifficultyEstimator {
    private readonly solution: SolutionOutput;

    constructor(solution: SolutionOutput) {
        this.solution = solution;
    }

    //0 -> easiest
    //1 -> nightmare
    //undefined -> impossible
    public estimate(): number {

        //Estimate difficulty
        // actions
        //     (3) [4, 3, 3]
        // boxesLine
        //     1
        // featuresUsed
        //     0
        // iterations
        //     10
        // totalTime
        //     12

        // this.difficulty = Math.random() * 100;

        // const actionsdifficulty =


        return 1;
    }
}