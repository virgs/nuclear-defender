import {SokobanSolver} from '@/solver/sokoban-solver';
import {configuration} from '@/constants/configuration';
import type {SolutionOutput} from '@/solver/sokoban-solver';
import type {ProcessedMap} from '@/levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '@/levels/constrain-verifiers/map-constrain-verifier';
import {EmptyLineConstrainVerifier} from '@/levels/constrain-verifiers/empty-line-constrain-verifier';
import {WrappedMapConstrainVerifier} from '@/levels/constrain-verifiers/wrapped-map-constrain-verifier';
import {MapDimensionsConstrainVerifier} from '@/levels/constrain-verifiers/map-dimensions-constrain-verifier';
import {NumberOfHeroesConstrainVerifier} from '@/levels/constrain-verifiers/number-of-heroes-constrain-verifier';
import {FeaturesOverlayConstrainVerifier} from '@/levels/constrain-verifiers/features-overlay-constrain-verifier';
import {TooManyFeaturesConstrainVerifier} from '@/levels/constrain-verifiers/too-many-features-constrain-verifier';
import {NumberOfBoxesAndTargetsConstrainVerifier} from '@/levels/constrain-verifiers/number-of-boxes-and-targets-constrain-verifier';

export class MapValidator {
    //Singleton so vue doesn't watch it. It affects performance
    private static readonly instance: MapValidator = new MapValidator();
    private readonly constrainVerifiers: MapConstrainVerifier[];
    private solver?: SokobanSolver;

    private constructor() {
        this.constrainVerifiers = [
            new MapDimensionsConstrainVerifier(),
            new NumberOfHeroesConstrainVerifier(),
            new NumberOfBoxesAndTargetsConstrainVerifier(),
            new TooManyFeaturesConstrainVerifier(),
            new WrappedMapConstrainVerifier(),
            new EmptyLineConstrainVerifier(),
            new FeaturesOverlayConstrainVerifier(),
        ];
    }

    public static getInstance(): MapValidator {
        return MapValidator.instance;
    }

    public abort() {
        this.solver?.abort();
    }

    public async validate(output: ProcessedMap): Promise<SolutionOutput> {
        this.solver?.abort();

        console.log('validating map structure');
        this.constrainVerifiers
            .forEach(verifier => verifier.verify(output));


        this.solver = new SokobanSolver({
            strippedMap: output.raw,
            staticFeatures: output.pointMap,
        });
        console.log(this.solver)
        console.log('checking whether the map is solvable');

        const solutionOutput = await this.solver.solve(output.removedFeatures);
        if (!solutionOutput.aborted && !solutionOutput.actions) {
            throw new Error('Not even me can solve this map. Keep on trying to make a solvable one.');
        }

        if (configuration.solver.debug.metrics) {
            console.log(solutionOutput);
        }
        console.log('done validating map');
        return solutionOutput;
    }

}