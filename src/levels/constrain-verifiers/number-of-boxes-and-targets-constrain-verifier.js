import { Tiles } from '../../levels/tiles';
export class NumberOfBoxesAndTargetsConstrainVerifier {
    verify(output) {
        const boxList = output.removedFeatures.get(Tiles.box);
        const boxNumber = boxList.length;
        const targetList = output.pointMap.get(Tiles.target);
        const targetNumber = targetList.length;
        if (boxNumber <= 0) {
            throw Error('Come on! Put at least one barrel on the map, please.');
        }
        else if (targetNumber <= 0) {
            throw Error('How can a map be solved if there is no target to push barrells to?');
        }
        else if (targetNumber !== boxNumber) {
            throw Error(`Numbers of targets (${targetNumber}) and barrels (${boxNumber}) have to be the same. Help me to help you.`);
        }
        else if (boxList
            .every(box => targetList
            .some(target => target.isEqualTo(box)))) {
            throw Error(`You can't provide an already solved map. It would be too easy, don't you think?`);
        }
    }
}
