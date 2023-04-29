import { SpriteSheetLines } from '@/animations/animation-atlas';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { configuration } from '@/constants/configuration';
import { Directions } from '@/constants/directions';
import { sounds } from '@/constants/sounds';
import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import type Phaser from 'phaser';
import type { GameActor, GameActorConfig } from './game-actor';

enum SpriteAnimation {
    FACING = 0,
    COVERING = 1,
    UNCOVERING = 2
}

export class TreadmillActor implements GameActor {
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
            spriteSheetLine: SpriteSheetLines.TREADMIL,
            worldPosition: config.worldPosition,
        };

        const animationCreator = new AnimationCreator(this.animationConfig);
        this.sprite = animationCreator
            .createSprite(animationCreator.getCurrentInitialFrame(SpriteSheetLines.TREADMIL, this.orientation, SpriteAnimation.FACING));

        const states = Object.keys(SpriteAnimation)
            .filter(key => !isNaN(Number(key)))
            .map(key => SpriteAnimation[Number(key) as SpriteAnimation])

        animationCreator.createAnimations(SpriteSheetLines.TREADMIL, states)
            .forEach(animation => this.sprite!.anims.create(animation));

    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box)) {
            //TODO add particle effect?
            if (!this.covered) {
                this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.COVERING] + '.' + Directions[this.orientation], repeat: 0, duration: configuration.updateCycleInMs }, true);
            }
            this.covered = true;
        } else {
            if (this.covered) {
                this.covered = false;
                this.scene.sound.play(sounds.treadmil.key, { volume: 0.35 });
                this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.UNCOVERING] + '.' + Directions[this.orientation], repeat: 0, duration: configuration.updateCycleInMs }, true)
                    .once('animationcomplete', () => {
                        this.sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.FACING] + '.' + Directions[this.orientation], repeat: -1, duration: configuration.updateCycleInMs }, true);
                    });

            }
        }
    }

    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.treadmil;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

}
