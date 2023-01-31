import { MapExplorer } from '@/levels/map-explorer';
export class WrappedMapConstrainVerifier {
    verify(output) {
        const explored = new MapExplorer(output).explore();
        if (explored.acessibleEmpties.length > 0) {
            throw Error(`Did you notice there is an empty space at (${explored.acessibleEmpties[0].y + 1}, ${explored.acessibleEmpties[0].x + 1}).
                Well, I did and it doesn't look cool. Replace it with something more meaningful.`);
        }
        else if (explored.leaks.length > 0) {
            throw Error(`Our hero is a escapper.
                            Wrap the whole level in walls otherwise it may be very hard to get the hero back. Put a wall somewhere around (${explored.leaks[0].y + 1}, ${explored.leaks[0].x + 1}).`);
        }
        else if (explored.unwrapped.length > 0) {
            throw Error(`What's the point of having something unnecessary at (${explored.unwrapped[0].y + 1}, ${explored.unwrapped[0].x + 1})? There can be only one hero explorable area.
                 Do yourself a favor and put everything inside it.`);
        }
    }
}
