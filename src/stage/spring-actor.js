import { Tiles } from '@/levels/tiles';
import { sounds } from '@/constants/sounds';
import { Directions } from '@/constants/directions';
import { GameObjectCreator } from './game-object-creator';
export class SpringActor {
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
                // this.sprite.setRotation(Math.PI / 2);
                //     this.sprite.flipY = true
                break;
            case Directions.UP:
                this.sprite.flipY = true;
                // this.sprite.setRotation(Math.PI);
                break;
            case Directions.RIGHT:
                // this.sprite.setRotation(Math.PI / 2);
                this.sprite.flipX = true;
                break;
        }
    }
    cover(actors) {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.hero || actor.getTileCode() === Tiles.box)) {
            if (!this.covered) {
                this.covered = true;
                this.scene.sound.play(sounds.springEngage.key, { volume: 0.15 });
            }
        }
        else {
            //TODO add smoke effect?
            // https://codepen.io/njmcode/pen/gMryWM
            // https://blog.ourcade.co/posts/2020/how-to-make-particle-trail-effect-phaser-3/
            // https://www.html5gamedevs.com/topic/46393-phaser-3-tweens-and-particles/
            // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/
            if (this.covered) {
                this.scene.sound.play(sounds.springRelease.key, { volume: 0.15 });
                this.covered = false;
            }
        }
    }
    getId() {
        return this.id;
    }
    getTileCode() {
        return Tiles.spring;
    }
    getTilePosition() {
        return this.tilePosition;
    }
}
