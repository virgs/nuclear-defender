import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import Phaser from 'phaser';
import {mapActionToChar} from '@/game/constants/actions';

type DifficultFactor = {
    value: number,
    weight: number, //0 to 1
}

export class LevelDifficultyEstimator {
    private readonly solution: SolutionOutput;
    private readonly factors: (() => DifficultFactor)[];

    constructor(solution: SolutionOutput) {
        this.solution = solution;

        this.factors = [
            () => ({value: this.getDifficulty(this.solution.actions!.length, 200), weight: .3}),
            () => ({value: this.getDifficulty(this.solution.boxesLine, 100), weight: .5}),
            () => ({value: this.getDifficulty(this.solution.totalTime, 60000), weight: .75}),
            () => ({value: this.getDifficulty(this.solution.iterations, 500000), weight: .75}),
            () => ({value: this.getDifficulty(this.solution.featuresUsed, 100), weight: .25}),
        ];
    }

    //0 -> easy piece
    //100 -> nightmare
    //undefined -> impossible. literally
    public estimate(): number | undefined {
        if (!this.solution.actions) {
            return undefined;
        }
        const reduce = this.factors.reduce((acc, factor) => {
            const difficultFactor = factor();
            return {sum: acc.sum + difficultFactor.value, weightSum: acc.weightSum + difficultFactor.weight};
        }, {sum: 0, weightSum: 0});
        const number = reduce.sum / reduce.weightSum;

        console.log(number * 100);
        return Phaser.Math.Clamp(number * 100, 0, 100);
    }

    private getDifficulty(value: number, max: number) {
        return Math.min(value / max, 1);
    }
}