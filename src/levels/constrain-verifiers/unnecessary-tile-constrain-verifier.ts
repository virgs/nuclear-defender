import type {ProcessedMap} from '../../levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '../../levels/constrain-verifiers/map-constrain-verifier';
import {Tiles} from '../../levels/tiles';

export class UnnecessaryTileConstrainVerifier implements MapConstrainVerifier {
    public verify(output: ProcessedMap): void {
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
    }
}