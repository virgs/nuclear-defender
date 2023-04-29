import { SpriteSheetLines } from '@/animations/animation-atlas';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { configuration } from '@/constants/configuration';
import { Directions, getDirectionsAsString } from '@/constants/directions';
import { sounds } from '@/constants/sounds';
import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import type { GameActor, GameActorConfig } from './game-actor';

enum SpriteAnimation {
    FACING = 0,
    COVERING = 1,
    UNCOVERING = 2
}

export class SpringActor implements GameActor {
    private readonly scene: Phaser.Scene;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;
    private readonly orientation: Directions;
    private readonly tilePosition: Point;
    private readonly animationConfig: AnimationConfig;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.orientation = config.orientation!;
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.covered = false;

        this.animationConfig = {
            playable: config.playable,
            scene: config.scene,
            spriteSheetLine: SpriteSheetLines.SPRING,
            worldPosition: config.worldPosition,
        };

        const animationCreator = new AnimationCreator(this.animationConfig);
        this.sprite = animationCreator
            .createSprite(animationCreator.getCurrentInitialFrame(SpriteSheetLines.SPRING, this.orientation, SpriteAnimation.FACING));


        const states = Object.keys(SpriteAnimation)
            .filter(key => !isNaN(Number(key)))
            .map(key => SpriteAnimation[Number(key) as SpriteAnimation])

        animationCreator.createAnimations(SpriteSheetLines.SPRING, getDirectionsAsString(), states)
            .forEach(animation => this.sprite!.anims.create(animation));
    }


    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.hero || actor.getTileCode() === Tiles.box)) {

            if (!this.covered) {
                this.covered = true;
                this.scene.sound.play(sounds.springEngage.key, { volume: 0.15 });

                this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.COVERING] + '.' + Directions[this.orientation], repeat: 0, duration: configuration.updateCycleInMs }, true);
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
                this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.UNCOVERING] + '.' + Directions[this.orientation], repeat: 0 }, true)
                    .once('animationcomplete', () => {
                        this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.FACING] + '.' + Directions[this.orientation], repeat: -1 }, true);
                    });
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
