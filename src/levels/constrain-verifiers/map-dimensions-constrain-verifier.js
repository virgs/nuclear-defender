import { configuration } from '../../constants/configuration';
export class MapDimensionsConstrainVerifier {
    verify(output) {
        if (output.raw.height > configuration.world.mapLimits.lines) {
            throw Error(`Try to keep the number of lines less than ${configuration.world.mapLimits.lines}. Right now you have ${output.raw.height}.`);
        }
        if (output.raw.width > configuration.world.mapLimits.rows) {
            throw Error(`Try to keep the number of rows less than ${configuration.world.mapLimits.rows}. Right now you have ${output.raw.width}.`);
        }
    }
}
