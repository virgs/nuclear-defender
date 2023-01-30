import { Tiles } from '../../levels/tiles';
import { configuration } from '../../constants/configuration';
export class TooManyFeaturesConstrainVerifier {
    verify(output) {
        let numberOfCoolFeatures = 0;
        output.raw.strippedFeatureLayeredMatrix
            .forEach((line) => line
            .forEach((tiles) => {
            if (tiles
                .some(tile => tile.code !== Tiles.target &&
                tile.code !== Tiles.floor &&
                tile.code !== Tiles.wall &&
                tile.code !== Tiles.empty)) {
                ++numberOfCoolFeatures;
            }
        }));
        const featuresLimit = configuration.world.mapLimits.features;
        if (numberOfCoolFeatures > featuresLimit) {
            throw Error(`For performance concerns, try to keep the number cool feature less than ${featuresLimit}.
                        Right now you have ${numberOfCoolFeatures}, I don't think your browser can handle it.`);
        }
    }
}
