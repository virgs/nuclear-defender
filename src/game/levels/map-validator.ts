import {Point} from '@/game/math/point';
import {SokobanSolver} from '@/game/solver/sokoban-solver';
import {configuration} from '@/game/constants/configuration';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';
import {Tiles} from '@/game/levels/tiles';
import type {OrientedTile} from '@/game/levels/standard-sokoban-annotation-tokennizer';

export class MapValidator {
    //Singleton so vue doesn't watch it. It affects performance
    private static readonly instance: MapValidator = new MapValidator();
    private readonly validators: ((ouput: ProcessedMap) => void)[];
    private solver?: SokobanSolver;

    private constructor() {
        this.validators = [
            this.createMapDimensionsValidation(),
            this.createNumberOfPlayerValidation(),
            this.createNoBoxesValidation(),
            this.createNoTargetsValidation(),
            this.createAlreadySolvedMapValidation(),
            this.createNumberOfTargetsAndWallsNotEqualValidation(),
            this.createTooManyFeaturesValidation(),
            this.createMapNotWrappedInWallsValidation(),
            this.createEmptyLineValidation(),
            this.createUnnecessaryEmptyTilesValidation(),
            this.createOverlayedFeaturesMapValidation(),
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
        this.validators
            .forEach(validator => validator(output));

        this.solver = new SokobanSolver({
            strippedMap: output.raw,
            staticFeatures: output.pointMap,
        });
        console.log(this.solver)
        console.log('checking whether the map is solvable');

        const solutionOutput = await this.solver.solve(output.removedFeatures);
        if (!solutionOutput.aborted && !solutionOutput.actions) {
            throw new Error('Bravo! This map is not solvable. Keep on trying!');
        }

        if (configuration.solver.debug.metrics) {
            console.log(solutionOutput);
        }
        console.log('done validating map');
        return solutionOutput;
    }

    private createNoBoxesValidation() {
        return (output: ProcessedMap) => {
            if (output.removedFeatures.get(Tiles.box)!.length === 0) {
                throw Error('Come on! Put at least one barrel on the map, please.');
            }
        };
    }

    private createNumberOfPlayerValidation() {
        return (output: ProcessedMap) => {
            const numberOfHeros = output.removedFeatures.get(Tiles.hero)!.length;
            if (numberOfHeros === 0) {
                throw Error(`Let's start by adding at least ONE hero to push things around. Shall we?`);
            } else if (numberOfHeros > 1) {
                throw Error('Playing with more than ONE hero may be a future feature, but it is not allowed yet.');
            }
        };
    }

    private createNoTargetsValidation() {
        return (output: ProcessedMap) => {
            if (output.pointMap.get(Tiles.target)!.length === 0) {
                throw Error('Let there be light. How can a map be solved if there is no target to push barrells to.');
            }
        };
    }

    private createNumberOfTargetsAndWallsNotEqualValidation() {
        return (output: ProcessedMap) => {
            const targetNumber = output.pointMap.get(Tiles.target)!.length;
            const boxNumber = output.removedFeatures.get(Tiles.box)!.length;
            if (targetNumber !== boxNumber) {
                throw Error(`Numbers of targets (${targetNumber}) and barrels (${boxNumber}) have to be the same. Help me to help you.`);
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
            let toVisit: { point: Point, tiles: OrientedTile[] }[] = [];
            output.raw.strippedFeatureLayeredMatrix
                .forEach((line, y) => line
                    .forEach((_: any, x: number) => toVisit.push({point: new Point(x, y), tiles: output.raw.strippedFeatureLayeredMatrix[y][x]})));

            const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
            const toInvestigate: Point[] = [heroPosition];

            //Starting from hero position, spread to every neighboor position to check the whole area and eliminate it from toVisit.
            //If some feature is still remaining in the toVisit, it means it is not in the explorableArea
            while (toInvestigate.length > 0) {
                const currentPoint = toInvestigate.shift()!;
                const staticItemInThePosition = toVisit
                    .find(staticItem => staticItem.point.isEqualTo(currentPoint))!;
                toVisit = toVisit
                    .filter(item => item.point.isDifferentOf(currentPoint));
                if (!staticItemInThePosition) { //item visited before
                    continue;
                } else if (staticItemInThePosition.tiles
                    .some(tile => tile.code === Tiles.wall)) {
                    continue;
                } else if (staticItemInThePosition.tiles
                    .some(tile => tile.code === Tiles.empty)) {
                    throw Error(`Did you notice there is an empty space at (${currentPoint.y + 1}, ${currentPoint.x + 1}). I did.
                    It doesn't look cool. Replace it with something more meaningful.`);
                }
                MapValidator.getNeighborsOf(currentPoint)
                    .forEach(neighbor => {
                        if (neighbor.x < 0 || neighbor.y < 0 ||
                            neighbor.x >= output.raw.width ||
                            neighbor.y >= output.raw.height) {
                            throw Error(`Our hero is a escapper.
                            Wrap the whole level in walls otherwise it may be very hard to get the hero back. Put a wall somewhere around (${currentPoint.y + 1}, ${currentPoint.x + 1})`);
                        }

                        if (toVisit
                            .find(item => item.point.isEqualTo(neighbor))) {
                            toInvestigate.push(neighbor);
                        }
                    });
            }

            const notWrapped = toVisit
                .filter(tile => tile.tiles.length > 0 &&
                    tile.tiles
                        .some(layer => layer.code !== Tiles.empty));
            if (notWrapped.length > 0) {
                throw Error(`What's the point of having something unnecessary at (${notWrapped[0].point.y + 1}, ${notWrapped[0].point.x + 1})? There can be only one hero explorable area.
                 Do yourself a favor and put everything inside it.`);
            }
        };
    }

    private static getNeighborsOf(point: Point): Point[] {
        const result: Point[] = [];
        for (let vertical = -1; vertical < 2; ++vertical) {
            for (let horizontal = -1; horizontal < 2; ++horizontal) {
                const x = horizontal + point.x;
                const y = vertical + point.y;
                if (vertical !== 0 || horizontal !== 0) {
                    result.push(new Point(x, y));
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
            const featuresLimit = configuration.world.mapLimits.features;
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
                throw Error(`For performance concerns, try to keep the number cool feature less than ${featuresLimit}.
                Right now you have ${numberOfCoolFeatures}, I don't think your browser can handle it.`);
            }
        };
    }

    private createOverlayedFeaturesMapValidation() {
        return (output: ProcessedMap) => {
            const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
            const boxesPosition = output.removedFeatures.get(Tiles.box)!;
            if (boxesPosition
                .some(box => box.isEqualTo(heroPosition))) {
                throw Error(`Hero can't be in the same position as a box. Nice try, though. Fix error at (${heroPosition.y + 1}, ${heroPosition.x + 1})`);
            }
            const twoBoxesPosition = boxesPosition
                .find((box, index) => boxesPosition
                    .some((anotherBox, anotherIndex) => box.isEqualTo(anotherBox) && index !== anotherIndex));
            if (twoBoxesPosition) {
                throw Error(`Two boxes can't share the same position. Be more creative. Fix error at (${twoBoxesPosition.y + 1}, ${twoBoxesPosition.x + 1})`);
            }

            for (let y = 0; y < output.raw.height; ++y) {
                for (let x = 0; x < output.raw.width; ++x) {
                    const repeated = output.raw.strippedFeatureLayeredMatrix[y][x]
                        .filter((item, originalIndex) => output.raw.strippedFeatureLayeredMatrix[y][x]
                            .some((other, otherIndex) => item.code === other.code && originalIndex !== otherIndex))
                        .length;
                    if (repeated > 1) {
                        throw Error(`A position can't contain more than one of the same element. Do you think they would get together and become stronger?
                         This is not power rangers. Fix it at (${y + 1}, ${x + 1}).`);
                    }
                }
            }

            output.pointMap.get(Tiles.wall)!
                .forEach(wall => {
                    for (let [key, value] of output.pointMap.entries()) {
                        const samePosition = value
                            .filter(point => point.isEqualTo(wall))
                            .length;
                        if (key !== Tiles.wall) {
                            if (samePosition > 0) {
                                throw Error(`Walls can't share position with anything else. Give me a break. Fix error at (${wall.y + 1}, ${wall.x + 1}).`);
                            }
                        }
                    }
                    if (wall.isEqualTo(heroPosition) ||
                        boxesPosition
                            .some(box => box.isEqualTo(wall))) {
                        throw Error(`Walls can't share position with anything else. Do I really have to say this? Fix error at (${wall.y + 1}, ${wall.x + 1}).`);
                    }
                });

            output.pointMap.get(Tiles.oily)!
                .forEach(oil => {
                    if (output.pointMap.get(Tiles.treadmil)!
                        .some(treadmil => treadmil.isEqualTo(oil))) {
                        throw Error(`Oily floors and treadmils don't go well together. Fix error at (${oil.y + 1}, ${oil.x + 1}).`);
                    }
                    if (output.pointMap.get(Tiles.spring)!
                        .some(treadmil => treadmil.isEqualTo(oil))) {
                        throw Error(`Oily floors and spring are like oil and a rainbow and something that doesn't like rainbows at all. Fix error at (${oil.y + 1}, ${oil.x + 1}).`);
                    }
                });
        };
    }

    private createUnnecessaryEmptyTilesValidation() {
        return (output: ProcessedMap) => {
            if (output.raw.strippedFeatureLayeredMatrix
                .every(line => line[0]
                    .every(tile => tile.code === Tiles.floor))) {
                throw Error(`Remove unnecessary empty tile before every line. You're wasting characters`);
            }

            for (let y = 0; y < output.raw.height; ++y) {
                for (let x = output.raw.width - 1; x >= 0; --x) {
                    const tiles = output.raw.strippedFeatureLayeredMatrix[y][x];
                    if (tiles.every(tile => tile.code === Tiles.wall)) {
                        break;
                    }
                    if (tiles.length > 0 && tiles
                        .every(tile => tile.code === Tiles.empty || tile.code === Tiles.floor)) {
                        console.log(tiles, y, x);
                        throw Error(`Remove unnecessary chars in the end of line ${y + 1}. It makes your map messy. You don't want it, right?`);
                    }
                }
            }
        };
    }

    private createEmptyLineValidation() {
        return (output: ProcessedMap) => {
            output.raw.strippedFeatureLayeredMatrix
                .forEach((line, index) => {
                    if (line
                        .every(tiles => tiles
                            .every(layer => layer.code !== Tiles.wall))) {
                        throw Error(`Line ${index + 1} is pretty much empty. What's the sense of having it?`);
                    }
                });
        };
    };

}