import type Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';
import {sounds} from '@/game/constants/sounds';
import {Directions} from '@/game/constants/directions';
import {SpriteCreator} from '@/game/actors/sprite-creator';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';

export class SpringActor implements GameActor {
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private covered: boolean;
    private tilePosition: Point;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new SpriteCreator({scene: config.scene, code: this.getTileCode()}).createSprite(config.worldPosition);
        this.tweens = config.scene.tweens;
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

    public isCovered(): boolean {
        return this.covered;
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.hero || actor.getTileCode() === Tiles.box)) {

            if (!this.covered) {
                this.covered = true;
                this.scene.sound.play(sounds.springEngage.key, {volume: 0.15});
            }
        } else {
            //TODO add smoke effect?
            // https://codepen.io/njmcode/pen/gMryWM
            // https://blog.ourcade.co/posts/2020/how-to-make-particle-trail-effect-phaser-3/
            // https://www.html5gamedevs.com/topic/46393-phaser-3-tweens-and-particles/
            // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/
            if (this.covered) {
                this.scene.sound.play(sounds.springRelease.key, {volume: 0.15});
                this.covered = false;
            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.spring;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public getOrientation(): Directions | undefined {
        return this.orientation;
    }

    public async animate(nextPosition: Point, direction?: Directions): Promise<any> {
    }
}
