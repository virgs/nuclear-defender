import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {Tiles} from '@/game/tiles/tiles';
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import type {OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export class MapValidator {
    private readonly validators: ((ouput: ProcessedMap) => void)[];

    public constructor() {
        this.validators = [
            this.createNoPlayerValidation(),
            this.createTooManyPlayersValidation(),
            this.createNoBoxesValidation(),
            this.createNoTargetsValidation(),
            this.createNumberOfTargetsAndWallsNotEqualValidation(),
            this.createNotSolvedYetMapValidation(),
            this.createMapNotWrappedInWallsValidation(),
        ];
    }

    public async validate(output: ProcessedMap): Promise<SolutionOutput> {
        this.validators
            .forEach(validator => validator(output));

        const solver = new SokobanSolver({
            strippedMap: output.raw,
            staticFeatures: output.pointMap,
        });

        const solutionOutput = await solver.solve(output.removedFeatures);
        if (!solutionOutput.aborted && !solutionOutput.actions) {
            throw new Error('Bravo! This map is not solvable.');
        }

        return solutionOutput;
    }

    private createNoBoxesValidation() {
        return (output: ProcessedMap) => {
            if (output.removedFeatures.get(Tiles.box)!.length === 0) {
                throw Error('Come on! Put at least one barrel on the map, please.');
            }
        };
    }

    private createNoPlayerValidation() {
        return (output: ProcessedMap) => {
            if (output.removedFeatures.get(Tiles.hero)!.length === 0) {
                throw Error('You need at least ONE player to push things around.');
            }
        };
    }

    private createTooManyPlayersValidation() {
        return (output: ProcessedMap) => {
            if (output.removedFeatures.get(Tiles.hero)!.length > 1) {
                throw Error('Playing with more than ONE player may be a future feature, but it is not allowed yet.');
            }
        };
    }

    private createNoTargetsValidation() {
        return (output: ProcessedMap) => {
            if (output.pointMap.get(Tiles.target)!.length === 0) {
                throw Error('How can a map be solved if there is no target to push barrell to.');
            }
        };
    }

    private createNumberOfTargetsAndWallsNotEqualValidation() {
        return (output: ProcessedMap) => {
            const targetNumber = output.pointMap.get(Tiles.target)!.length;
            const boxNumber = output.removedFeatures.get(Tiles.box)!.length;
            if (targetNumber !== boxNumber) {
                throw Error(`Number of targets (${targetNumber}) and barrels (${boxNumber}) has to be the same. Help me to help you.`);
            }
        };
    }

    private createNotSolvedYetMapValidation() {
        return (output: ProcessedMap) => {
            const targets = output.pointMap.get(Tiles.target)!;
            if (output.removedFeatures.get(Tiles.box)!
                .every(box => targets
                    .some(target => target.isEqualTo(box)))) {
                throw Error(`You can't provide an already solved map. It would be too easy, don't you think?`);
            }
        };
    }

    private createMapNotWrappedInWallsValidation() {
        return (output: ProcessedMap) => {
            const extremityItem: OrientedTile[][] = [];
            for (let line = 0; line < output.raw.height; ++line) {
                let firstItemDetected = false;
                let lastItem: OrientedTile[] | undefined = undefined;
                for (let column = 0; column < output.raw.width; ++column) {
                    const item: OrientedTile[] = output.raw.strippedFeatureLayeredMatrix[line][column];
                    if (!firstItemDetected && item
                        .some(layer => layer.code !== Tiles.empty && layer.code !== Tiles.floor)) {
                        extremityItem.push(item);
                        firstItemDetected = true;
                    } else if (firstItemDetected) {
                        if (item.length === 0 || item
                            .every(layer => layer.code === Tiles.empty)) {
                            extremityItem.push(lastItem!);
                            break;
                        } else if (column + 1 === output.raw.width) {
                            extremityItem.push(item);
                        }
                    }
                    lastItem = item;
                }
            }

            for (let column = 0; column < output.raw.width; ++column) {
                let firstItemDetected = false;
                let lastItem: OrientedTile[] | undefined = undefined;
                for (let line = 0; line < output.raw.height; ++line) {
                    const item = output.raw.strippedFeatureLayeredMatrix[line][column];
                    if (!firstItemDetected && item
                        .some(layer => layer.code !== Tiles.empty && layer.code !== Tiles.floor)) {
                        extremityItem.push(item);
                        firstItemDetected = true;
                    } else if (firstItemDetected) {
                        if (item.length === 0 || item
                            .every(layer => layer.code === Tiles.empty)) {
                            extremityItem.push(lastItem!);
                            break;
                        } else if (column + 1 === output.raw.width) {
                            extremityItem.push(item);
                        }
                    }
                    lastItem = item;
                }

            }

            if (extremityItem
                .some(item => !item.every(layer => layer.code === Tiles.wall))) {

                throw Error(`You have to wrap the whole map in walls so the player doesn't wander aimlessly in this meaningless life.`);
            }

        };
    }
}