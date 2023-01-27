import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {configuration} from '@/game/constants/configuration';
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

export class MapValidator {
    //Singleton so vue doesnt watch it. It affects performance
    private static readonly instance: MapValidator = new MapValidator();
    private readonly validators: ((ouput: ProcessedMap) => void)[];
    private solver?: SokobanSolver;

    private constructor() {
        this.validators = [
            this.createMapDimensionsValidation(),
            this.createTooManyFeaturesValidation(),
            this.createNoPlayerValidation(),
            this.createTooManyPlayersValidation(),
            this.createNoBoxesValidation(),
            this.createNoTargetsValidation(),
            this.createNumberOfTargetsAndWallsNotEqualValidation(),
            // this.createOverlayedFeaturesMapValidation(),
            this.createAlreadySolvedMapValidation(),
            this.createMapNotWrappedInWallsValidation(),
        ];
    }

    public static getInstance(): MapValidator {
        return MapValidator.instance;
    }

    public abort() {
        this.solver?.abort();
    }

    public async validate(output: ProcessedMap): Promise<SolutionOutput> {
        this.validators
            .forEach(validator => validator(output));

        this.solver?.abort();
        this.solver = new SokobanSolver({
            strippedMap: output.raw,
            staticFeatures: output.pointMap,
        });

        const solutionOutput = await this.solver.solve(output.removedFeatures);
        if (!solutionOutput.aborted && !solutionOutput.actions) {
            throw new Error('Bravo! This map is not solvable.');
        }

        if (configuration.solver.debug.metrics) {
            console.log(solutionOutput);
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

    private createAlreadySolvedMapValidation() {
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
            let staticArray: { point: Point, tile: OrientedTile[] }[] = [];
            output.raw.strippedFeatureLayeredMatrix
                .forEach((line, y) => line
                    .forEach((_: any, x: number) => staticArray.push({point: new Point(x, y), tile: output.raw.strippedFeatureLayeredMatrix[y][x]})));

            const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
            const toInvestigate: Point[] = [heroPosition];

            staticArray = staticArray
                .filter(staticItem => staticItem.point.isDifferentOf(heroPosition));
            //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from staticArray.
            //If some feature is still remaining in the staticArray, it means it is not in the explorableArea
            while (toInvestigate.length > 0) {
                const currentPoint = toInvestigate.pop()!;
                MapValidator.getNeighborsOf(currentPoint, output.raw)
                    .forEach(neighbor => {
                        if (neighbor.x < 0 || neighbor.y < 0 ||
                            neighbor.x >= output.raw.width ||
                            neighbor.y >= output.raw.height) {
                            throw Error(`You have to wrap the whole map in walls so the player doesn't wander aimlessly in this meaningless life.
                            Even diagonals, but that's just because it looks nicer with them. Wall missing at (${neighbor.y + 1}, ${neighbor.x + 1})`);
                        }

                        const staticItemInThePosition = staticArray
                            .find(staticItem => staticItem.point.isEqualTo(neighbor));
                        if (staticItemInThePosition?.tile
                            .every(tile => tile.code !== Tiles.wall)) {
                            toInvestigate.push(neighbor);
                            staticArray = staticArray
                                .filter(staticItem => staticItem.point.isDifferentOf(neighbor));
                        }
                    });
            }

            const notWrapped = staticArray
                .filter(tile => tile.tile.length > 0 &&
                    tile.tile
                        .some(layer => layer.code !== Tiles.wall &&
                            layer.code !== Tiles.empty &&
                            layer.code !== Tiles.floor));
            if (notWrapped.length > 0) {
                throw Error(`What's the point of having something at (${notWrapped[0].point.y}, ${notWrapped[0].point.x}), outside the levels' walls? There can be only one player explorable area.
                 Do yourself a favor and put everything inside it.`);
            }
        };
    }

    private static getNeighborsOf(point: Point, raw: MultiLayeredMap): Point[] {
        const result: Point[] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const x = horizontal + point.x;
                const y = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    if (x >= 0 || y >= 0 ||
                        x < raw.width ||
                        y < raw.height) {
                        result.push(new Point(x, y));
                    }
                }
            }
        }
        return result;
    }

    private createMapDimensionsValidation() {
        return (output: ProcessedMap) => {
            if (output.raw.height > configuration.world.mapLimits.lines) {
                throw Error(`Try to keep the number of lines less than ${configuration.world.mapLimits.lines}. Right now you have ${output.raw.height}.`);
            }
            if (output.raw.width > configuration.world.mapLimits.rows) {
                throw Error(`Try to keep the number of rows less than ${configuration.world.mapLimits.rows}. Right now you have ${output.raw.width}.`);
            }
        };

    }

    private createTooManyFeaturesValidation() {
        return (output: ProcessedMap) => {
            const staticArray: { point: Point, tile: OrientedTile[] }[] = [];
            output.raw.strippedFeatureLayeredMatrix
                .forEach((line, y) => line
                    .forEach((_: any, x: number) => staticArray.push({point: new Point(x, y), tile: output.raw.strippedFeatureLayeredMatrix[y][x]})));
            const featuresLimit = 30;
            const numberOfCoolFeatures = staticArray.reduce((acc, item) => {
                if (item.tile
                    .some(tile => tile.code !== Tiles.target &&
                        tile.code !== Tiles.floor &&
                        tile.code !== Tiles.wall &&
                        tile.code !== Tiles.empty)) {
                    return acc + 1;
                }
                return acc;
            }, 0);
            if (numberOfCoolFeatures > featuresLimit) {
                throw Error(`For performance concerns, try to keep the number cool feature less than ${featuresLimit}. Right now you have ${numberOfCoolFeatures}, I don't think your browser can handle it.`);
            }
        };
    }

    private createOverlayedFeaturesMapValidation() {
        //player cant be in box
        //features cant be on anoter equal
        //wall have to be alone
        //oil cant be in treadmils and springs
    }
}