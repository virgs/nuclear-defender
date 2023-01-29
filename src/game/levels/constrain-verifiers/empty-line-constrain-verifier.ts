import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '@/game/levels/constrain-verifiers/map-constrain-verifier';
import {Tiles} from '@/game/levels/tiles';

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