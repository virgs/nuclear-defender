import { Tiles } from '../../levels/tiles';
export class EmptyLineConstrainVerifier {
    verify(output) {
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
