import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { GameObjectCreator } from '@/stage/game-object-creator';
export class OilyFloorActor {
    scene;
    image;
    id;
    tilePosition;
    covered;
    constructor(config) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.image = new GameObjectCreator(config).createImage(config.code);
        this.covered = false;
    }
    cover(actors) {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box)) {
            this.covered = true;
            //TODO add particle effect?
        }
        else {
            if (this.covered) {
                this.covered = false;
                this.scene.sound.play(sounds.oil.key, { volume: 0.1 });
            }
        }
    }
    getId() {
        return this.id;
    }
    getTileCode() {
        return Tiles.oily;
    }
    getTilePosition() {
        return this.tilePosition;
    }
}
