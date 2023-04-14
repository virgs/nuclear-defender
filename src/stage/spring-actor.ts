import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import { sounds } from '@/constants/sounds';
import { Directions } from '@/constants/directions';
import { GameObjectCreator } from './game-object-creator';
import type { GameActor, GameActorConfig } from './game-actor';

export class SpringActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private readonly tilePosition: Point;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation!;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.covered = false;

        switch (this.orientation) {
            case Directions.LEFT:
                this.sprite = new GameObjectCreator(config).createSprite(config.code + 2);
                this.sprite.flipX = true
                break;
            case Directions.UP:
                this.sprite = new GameObjectCreator(config).createSprite(config.code);
                break;
            case Directions.DOWN:
                this.sprite = new GameObjectCreator(config).createSprite(config.code + 1);
                break;
            case Directions.RIGHT:
                this.sprite = new GameObjectCreator(config).createSprite(config.code + 2);
                break;
        }
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.hero || actor.getTileCode() === Tiles.box)) {

            if (!this.covered) {
                this.covered = true;
                this.scene.sound.play(sounds.springEngage.key, { volume: 0.15 });
            }
        } else {
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

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.spring;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }
}
