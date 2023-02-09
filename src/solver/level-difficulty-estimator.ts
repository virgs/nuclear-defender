import {Actions} from '@/constants/actions';
import {configuration} from '@/constants/configuration';
import type {SolutionOutput} from '@/solver/sokoban-solver';

type DifficultFactor = {
    condition?: (solution: SolutionOutput) => boolean,
    value: number,
    weight: number, //0 to 1
}

//https://www.fi.muni.cz/~xpelanek/publications/stairs2010-final.pdf
export class LevelDifficultyEstimator {
    private readonly factors: ((solution: SolutionOutput) => DifficultFactor)[];

    constructor() {

        this.factors = [
            (solution: SolutionOutput) => ({
                condition: (solution) => solution.actions?.length! > 50,
                value: this.getDifficulty(solution.actions!
                    .filter(action => action !== Actions.STAND)
                    .length, 200), weight: .15
            }),
            (solution: SolutionOutput) => ({
                condition: (solution) => solution.actions?.length! > 50,
                value: this.getDifficulty(solution.counterIntuitiveMoves! / solution.actions?.length!, 1),
                weight: .5
            }),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.boxesLine!, 80), weight: .75}),
            (solution: SolutionOutput) => ({
                condition: (solution) => solution.actions?.length! < 20,
                value: this.getDifficulty(solution.actions!
                    .filter(action => action === Actions.STAND).length / solution.actions!.length, 1), weight: .15
            }), //timing factor (be it waiting of pressing key at the right time)
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.totalTime, 60000), weight: .25}),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.iterations, 750000), weight: .15}),
        ];
    }

    //0 -> easy piece
    //100 -> nightmare
    //undefined -> impossible. literally
    public estimate(solution: SolutionOutput): number | undefined {
        if (!solution.actions) {
            return undefined;
        }
        const sums = this.factors.reduce((acc, factor) => {
            const difficultFactor = factor(solution);
            if (configuration.debug.solver.estimator) {
                console.log(difficultFactor);
            }
            if (difficultFactor.condition && !difficultFactor.condition(solution)) {
                return acc;
            }
            return {
                value: acc.value + (difficultFactor.value * difficultFactor.weight),
                weight: acc.weight + difficultFactor.weight
            };
        }, {
            value: 0,
            weight: 0
        });
        const number = sums.value / sums.weight;
        return Phaser.Math.Clamp(number * 100, 0, 100);
    }

    private getDifficulty(value: number, max: number) {
        return Math.min(value / max, 1.15);
    }
}