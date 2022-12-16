import {configuration} from "../constants/configuration";
import Phaser from "phaser";
import {Direction} from "../constants/direction";
import {HeroAnimator} from "./hero-animator";
import {tileCodes} from "../tiles/tile-codes";
import {MapFeaturesExtractor} from "../tiles/map-features-extractor";

export type MovingIntention = {
    direction: Direction,
    position: {
        x: number,
        y: number
    }
};

export class Hero {
    private readonly heroAnimator: HeroAnimator;
    private readonly inputMap: Map<Direction, () => boolean>;

    private isMoving: boolean = false;
    private sprite: Phaser.GameObjects.Sprite;
    private tweens: Phaser.Tweens.TweenManager;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    public constructor() {
        this.inputMap = new Map<Direction, () => boolean>();
        this.inputMap.set(Direction.RIGHT, () => Phaser.Input.Keyboard.JustDown(this.cursors.right))
        this.inputMap.set(Direction.LEFT, () => Phaser.Input.Keyboard.JustDown(this.cursors.left))
        this.inputMap.set(Direction.DOWN, () => Phaser.Input.Keyboard.JustDown(this.cursors.down))
        this.inputMap.set(Direction.UP, () => Phaser.Input.Keyboard.JustDown(this.cursors.up))

        this.heroAnimator = new HeroAnimator();
    }

    public init(data: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite }) {
        this.tweens = data.scene.tweens;
        this.cursors = data.scene.input.keyboard.createCursorKeys()
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
        this.sprite = data.sprite

        // this.sprite.setOrigin(0, 0.5)
        this.sprite.setOrigin(0)

        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite.anims.create(item))
    }

    public update() {
        this.sprite.setDepth(this.sprite.y - configuration.verticalTileSize / 2)
    }

    public checkMovingIntention(): MovingIntention | null {
        if (!this.isMoving) {
            for (let [direction, directionCheckFunction] of this.inputMap.entries()) {
                if (directionCheckFunction()) {
                    return {
                        direction: direction,
                        position: {
                            x: this.sprite.x,
                            y: this.sprite.y
                        }
                    }
                }
            }
        }
        return null
    }

    public move(direction: Direction) {
        this.isMoving = true;
        const heroMovement = this.heroAnimator.map(direction);

        this.sprite.anims.play(heroMovement.walking, true)

        this.tweens.add({
            ...heroMovement.tween,
            targets: this.sprite,
            onComplete: () => {
                this.sprite.anims.play(heroMovement.idle, true)
                this.isMoving = false
            },
            onCompleteScope: this
        })
    }

}