import {configuration} from '@/game/constants/configuration';
import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '@/game/levels/constrain-verifiers/map-constrain-verifier';

export class MapDimensionsConstrainVerifier implements MapConstrainVerifier {
    public verify(output: ProcessedMap): void {
        if (output.raw.height > configuration.world.mapLimits.lines) {
            throw Error(`Try to keep the number of lines less than ${configuration.world.mapLimits.lines}. Right now you have ${output.raw.height}.`);
        }
        if (output.raw.width > configuration.world.mapLimits.rows) {
            throw Error(`Try to keep the number of rows less than ${configuration.world.mapLimits.rows}. Right now you have ${output.raw.width}.`);
        }
    }
}