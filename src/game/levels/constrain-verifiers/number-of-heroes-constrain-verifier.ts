import {Tiles} from '@/game/levels/tiles';
import type {ProcessedMap} from '@/game/levels/sokoban-map-stripper';
import type {MapConstrainVerifier} from '@/game/levels/constrain-verifiers/map-constrain-verifier';

export class NumberOfHeroesConstrainVerifier implements MapConstrainVerifier {
    public verify(output: ProcessedMap): void {
        const numberOfHeros = output.removedFeatures.get(Tiles.hero)!.length;
        if (numberOfHeros === 0) {
            throw Error(`Let's start by adding at least ONE hero to push things around. Shall we?`);
        } else if (numberOfHeros > 1) {
            throw Error('Playing with more than ONE hero may be a future feature, but it is not allowed yet.');
        }
    }
}