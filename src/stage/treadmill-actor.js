import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { Directions } from '@/constants/directions';
import { GameObjectCreator } from './game-object-creator';
export class TreadmillActor {
    scene;
    sprite;
    id;
    orientation;
    tilePosition;
    covered;
    constructor(config) {
        this.orientation = config.orientation;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite(config.code);
        this.covered = false;
        switch (this.orientation) {
            case Directions.LEFT:
                this.sprite.flipX = true;
                break;
            case Directions.UP:
                // this.sprite.flipY = true
                break;
            case Directions.DOWN:
                // this.sprite.flipY = true
                break;
            case Directions.RIGHT:
                break;
        }
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
                this.scene.sound.play(sounds.treadmil.key, { volume: 0.35 });
            }
        }
    }
    getId() {
        return this.id;
    }
    getTileCode() {
        return Tiles.treadmil;
    }
    getTilePosition() {
        return this.tilePosition;
    }
}
