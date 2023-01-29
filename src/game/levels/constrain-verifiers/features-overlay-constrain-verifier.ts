import {Tiles} from '@/game/levels/tiles';
import type {Point} from '@/game/math/point';
import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '@/game/levels/constrain-verifiers/map-constrain-verifier';

export class FeaturesOverlayConstrainVerifier implements MapConstrainVerifier {
    public verify(output: ProcessedMap): void {
        const heroPosition = output.removedFeatures.get(Tiles.hero)![0];
        const boxesPosition = output.removedFeatures.get(Tiles.box)!;

        this.checkOilOverUse(output);
        this.checkDuplicateElementsAtSamePosition(output);
        this.checkBoxesOverUse(boxesPosition, heroPosition);
        this.checkWallsOverUse(output, heroPosition, boxesPosition);
    };

    private checkBoxesOverUse(boxesPosition: Point[], heroPosition: Point) {
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
    }

    private checkWallsOverUse(output: ProcessedMap, heroPosition: Point, boxesPosition: Point[]) {
        output.pointMap
            .get(Tiles.wall)!
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
    }

    private checkOilOverUse(output: ProcessedMap) {
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
    }

    private checkDuplicateElementsAtSamePosition(output: ProcessedMap) {
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
    }
}
