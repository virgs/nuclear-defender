import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import Phaser from 'phaser';
import {Actions} from '@/game/constants/actions';

type DifficultFactor = {
    value: number,
    weight: number, //0 to 1
}

export class LevelDifficultyEstimator {
    private readonly factors: ((solution: SolutionOutput) => DifficultFactor)[];

    constructor() {

        this.factors = [
            (solution: SolutionOutput) => ({
                value: this.getDifficulty(solution.actions!
                    .filter(action => action !== Actions.STAND)
                    .length, 200), weight: .2
            }),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.boxesLine, 100), weight: .75}),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.totalTime, 60000), weight: .35}),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.iterations, 2000000), weight: .65}),
            (solution: SolutionOutput) => ({value: this.getDifficulty(solution.featuresUsed, 1000), weight: .15}),
        ];
    }

    //0 -> easy piece
    //100 -> nightmare
    //undefined -> impossible. literally
    public estimate(solution: SolutionOutput): number | undefined {
        console.log(solution);
        if (!solution.actions) {
            return undefined;
        }
        const sums = this.factors.reduce((acc, factor) => {
            const difficultFactor = factor(solution);
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
        return Math.min(value / max, 1);
    }
}