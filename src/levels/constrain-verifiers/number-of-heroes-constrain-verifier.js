import { Tiles } from '../../levels/tiles';
export class NumberOfHeroesConstrainVerifier {
    verify(output) {
        const numberOfHeros = output.removedFeatures.get(Tiles.hero).length;
        if (numberOfHeros === 0) {
            throw Error(`Let's start by adding at least ONE hero to push things around. Shall we?`);
        }
        else if (numberOfHeros > 1) {
            throw Error('Playing with more than ONE hero may be a future feature, but it is not allowed yet.');
        }
    }
}
