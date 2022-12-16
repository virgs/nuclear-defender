import {configuration} from "../constants/configuration";
import Phaser from "phaser";
import {Direction} from "../constants/direction";
import {HeroAnimator} from "./hero-animator";

export class Hero {
    private readonly inputMap: Map<Direction, () => boolean>;
    private readonly heroAnimator: HeroAnimator;

    private isMoving: boolean = false;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private sprite: Phaser.GameObjects.Sprite;
    private tweens: Phaser.Tweens.TweenManager;

    public constructor() {
        this.inputMap = new Map<Direction, () => boolean>();
        this.inputMap.set(Direction.RIGHT, () => Phaser.Input.Keyboard.JustDown(this.cursors.right))
        this.inputMap.set(Direction.LEFT, () => Phaser.Input.Keyboard.JustDown(this.cursors.left))
        this.inputMap.set(Direction.DOWN, () => Phaser.Input.Keyboard.JustDown(this.cursors.down))
        this.inputMap.set(Direction.UP, () => Phaser.Input.Keyboard.JustDown(this.cursors.up))

        this.heroAnimator = new HeroAnimator();
    }

    public init(scene: Phaser.Scene) {
        this.tweens = scene.tweens;
        this.cursors = scene.input.keyboard.createCursorKeys()
        // @ts-expect-error
        this.sprite = scene.layer.createFromTiles(53, 0, {key: configuration.spriteSheetKey, frame: 52}).pop()

        this.sprite.setOrigin(0, 0.5)
        this.sprite.z = this.sprite.y


        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite.anims.create(item))
    }


    public checkMovingIntention(): Direction | null {
        if (!this.isMoving) {
            for (let [direction, directionCheckFunction] of this.inputMap.entries()) {
                if (directionCheckFunction()) {
                    return direction
                }
            }
        }
        return null
    }

    public move(direction: Direction) {
        this.isMoving = true;
        const heroMovement = this.heroAnimator.map(direction);

        this.sprite.anims.play(heroMovement.walking, true)

        this.tweens.add(Object.assign(
            heroMovement.tween,
            {
                targets: this.sprite,
                onComplete: () => {
                    this.sprite.anims.play(heroMovement.idle, true)
                    this.isMoving = false
                },
                onCompleteScope: this
            }
        ))
    }

}