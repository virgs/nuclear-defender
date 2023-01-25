import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {Tiles} from '@/game/tiles/tiles';
import type {ProcessedMap} from '@/game/tiles/sokoban-map-processor';
import {Point} from '@/game/math/point';
import type {MultiLayeredMap, OrientedTile} from '@/game/tiles/standard-sokoban-annotation-translator';

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
            let staticArray: { point: Point, tile: OrientedTile[] }[] = [];
            output.raw.strippedFeatureLayeredMatrix
                .forEach((line, y) => line
                    .forEach((_: any, x: number) => staticArray.push({point: new Point(x, y), tile: output.raw.strippedFeatureLayeredMatrix[y][x]})));

            const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
            const toInvestigate: Point[] = [heroPosition];

            staticArray = staticArray
                .filter(staticItem => staticItem.point.isDifferentOf(heroPosition));
            //Starting from hero position, spread every neighboor position to check the whole area and eliminate it from staticArray.
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
                throw Error(`What's the point of having something outside the levels' walls? Do yourself a favor and put item at (${notWrapped[0].point.y + 1}, ${notWrapped[0].point.x + 1}) inside them.`);
            }

        };
    }

    private static getNeighborsOf(point: Point, raw: MultiLayeredMap): Point[] {
        const result: Point[] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const h = horizontal + point.x;
                const v = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    result.push(new Point(h, v));
                }
            }
        }
        return result;
    }
}