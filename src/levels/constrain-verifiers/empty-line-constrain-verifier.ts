import type {ProcessedMap} from '../../levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '../../levels/constrain-verifiers/map-constrain-verifier';
import {Tiles} from '../../levels/tiles';

export class EmptyLineConstrainVerifier implements MapConstrainVerifier {
    public verify(output: ProcessedMap): void {
        output.raw.strippedFeatureLayeredMatrix
            .forEach((line, index) => {
                if (line
                    .every(tiles => tiles
                        .every(layer => layer.code !== Tiles.wall))) {
                    throw Error(`Line ${index + 1} is pretty much empty. What's the sense of having it?`);
                }
            });

    }
}