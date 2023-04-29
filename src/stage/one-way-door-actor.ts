import { SpriteSheetLines } from '@/animations/sprite-sheet-lines';
import { AnimationCreator, type AnimationConfig } from '@/animations/animation-creator';
import { configuration } from '@/constants/configuration';
import { Directions, getDirectionsAsString } from '@/constants/directions';
import { Tiles } from '@/levels/tiles';
import type { Point } from '@/math/point';
import type { GameActor, GameActorConfig } from './game-actor';

enum SpriteAnimation {
    FACING = 0,
    COVERING = 1,
    UNCOVERING = 2
}

export class OneWayDoorActor implements GameActor {
    private readonly sprites: Phaser.GameObjects.Sprite[];
    private readonly id: number;
    private readonly tilePosition: Point;
    private readonly orientation: Directions;

    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.tilePosition = config.tilePosition;
        this.orientation = config.orientation!;
        this.covered = false;
        this.sprites = [];

        [SpriteSheetLines.ONE_WAY_DOOR_BACK, SpriteSheetLines.ONE_WAY_DOOR_FRONT]
            .forEach(spriteSheetLines => {
                const animationConfig = {
                    playable: config.playable,
                    scene: config.scene,
                    spriteSheetLine: spriteSheetLines,
                    worldPosition: config.worldPosition,
                };

                const animationCreator = new AnimationCreator(animationConfig);
                const sprite = animationCreator
                    .createSprite(animationCreator.getCurrentInitialFrame(spriteSheetLines, this.orientation, SpriteAnimation.FACING));

                const states = Object.keys(SpriteAnimation)
                    .filter(key => !isNaN(Number(key)))
                    .map(key => SpriteAnimation[Number(key) as SpriteAnimation])

                animationCreator.createAnimations(spriteSheetLines, getDirectionsAsString(), states)
                    .forEach(animation => sprite!.anims.create(animation));
                this.sprites.push(sprite);
            });
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => [Tiles.box, Tiles.hero].includes(actor.getTileCode()))) {
            //TODO add particle effect?
            if (!this.covered) {
                this.sprites
                    .forEach(sprite => {
                        sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.COVERING] + '.' + Directions[this.orientation], repeat: 0, duration: configuration.updateCycleInMs }, true);
                    })
                console.log('covered')
            }
            this.covered = true;
        } else {
            if (this.covered) {
                console.log('uncovered')
                this.covered = false;
                console.log(SpriteAnimation[SpriteAnimation.UNCOVERING] + '.' + Directions[this.orientation])
                this.sprites
                    .forEach(sprite => {
                        sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.UNCOVERING] + '.' + Directions[this.orientation], repeat: 0, duration: configuration.updateCycleInMs }, true)
                            .once('animationcomplete', () => {
                                sprite.anims.play({ key: SpriteAnimation[SpriteAnimation.FACING] + '.' + Directions[this.orientation], repeat: -1, duration: configuration.updateCycleInMs }, true);
                            });

                    })
            }
        }
    }
    public getId(): number {
        return this.id;
    }

    public getTileCode(): Tiles {
        return Tiles.oneWayDoor;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
    }

}
