import { configuration } from '@/constants/configuration';
import type { SolutionOutput } from '@/solver/sokoban-solver';
import SolverMapWorker from '@/solver/solver-web-worker?worker';
import type { ProcessedMap } from '@/levels/sokoban-map-stripper';
import type { SolverWorkerRequest, SolverWorkerResponse } from '@/solver/solver-web-worker';
import type { MapConstrainVerifier } from '@/levels/constrain-verifiers/map-constrain-verifier';
import { EmptyLineConstrainVerifier } from '@/levels/constrain-verifiers/empty-line-constrain-verifier';
import { WrappedMapConstrainVerifier } from '@/levels/constrain-verifiers/wrapped-map-constrain-verifier';
import { MapDimensionsConstrainVerifier } from '@/levels/constrain-verifiers/map-dimensions-constrain-verifier';
import { NumberOfHeroesConstrainVerifier } from '@/levels/constrain-verifiers/number-of-heroes-constrain-verifier';
import { FeaturesOverlayConstrainVerifier } from '@/levels/constrain-verifiers/features-overlay-constrain-verifier';
import { TooManyFeaturesConstrainVerifier } from '@/levels/constrain-verifiers/too-many-features-constrain-verifier';
import { NumberOfBoxesAndTargetsConstrainVerifier } from '@/levels/constrain-verifiers/number-of-boxes-and-targets-constrain-verifier';

const webWorkerSolver = new SolverMapWorker();
export class MapValidator {
    //Singleton so vue doesn't watch it. It affects performance
    private static readonly instance: MapValidator = new MapValidator();
    private readonly constrainVerifiers: MapConstrainVerifier[];
    private readonly webWorkerSolver: Worker;

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
        this.webWorkerSolver = new SolverMapWorker();
        // console.log(`Instantiating web-worker solver: ${this.webWorkerSolver.postMessage('asd')}`)
    }

    public static getInstance(): MapValidator {
        return MapValidator.instance;
    }

    public abort() {
        this.webWorkerSolver.terminate();
    }

    public async validate(output: ProcessedMap): Promise<SolutionOutput> {
        return await new Promise(async (resolve, reject) => {
            this.webWorkerSolver.terminate();

            console.log('validating map structure');
            try {
                this.constrainVerifiers
                    .forEach(verifier => verifier.verify(output));
            } catch (e) {
                reject(e)
                return;
            }

            console.log('map structure is valid');
            const request: SolverWorkerRequest = {
                strippedMap: output.raw,
                staticFeatures: output.pointMap,
                dynamicMap: output.removedFeatures,
                timeoutInMs: 60 * 1000
            }

            webWorkerSolver.onmessage = (event: MessageEvent<SolverWorkerResponse>) => {
                const data = event.data;
                console.log('done validating map');
                console.log(data);
                if (data.aborted || data.error || !data.solutionOutput!.actions) {
                    reject(Error('Not even me can solve this map. Keep on trying to make a solvable one.'));
                }

                if (configuration.debug.solver.metrics) {
                    console.log(data.solutionOutput);
                }
                resolve(data.solutionOutput!);
            };

            console.log('checking whether the map is solvable');
            webWorkerSolver.postMessage(request);
        });

    }

}