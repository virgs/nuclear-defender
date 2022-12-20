import Phaser from 'phaser';
import {HeroAnimator} from './hero-animator';
import {configuration} from '../constants/configuration';
import {Actions} from '../constants/actions';
import {Directions} from '../constants/directions';

export class Hero {
    private readonly heroAnimator: HeroAnimator;
    private readonly inputMap: Map<Actions, () => boolean>;

    private isMoving: boolean = false;
    private sprite: Phaser.GameObjects.Sprite;
    private tweens: Phaser.Tweens.TweenManager;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    public constructor() {
        this.inputMap = new Map<Actions, () => boolean>();
        this.inputMap.set(Actions.RIGHT, () => Phaser.Input.Keyboard.JustDown(this.cursors.right));
        this.inputMap.set(Actions.LEFT, () => Phaser.Input.Keyboard.JustDown(this.cursors.left));
        this.inputMap.set(Actions.DOWN, () => Phaser.Input.Keyboard.JustDown(this.cursors.down));
        this.inputMap.set(Actions.UP, () => Phaser.Input.Keyboard.JustDown(this.cursors.up));

        this.heroAnimator = new HeroAnimator();
    }

    //TODO extract this to interface
    public init(data: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite }) {
        this.tweens = data.scene.tweens;
        this.cursors = data.scene.input.keyboard.createCursorKeys();
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
        this.sprite = data.sprite;

        // this.sprite.setOrigin(0, 0.5)
        this.sprite.setOrigin(0);

        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite.anims.create(item));
    }

    public checkAction(): Actions {
        if (!this.isMoving) {
            for (let [action, actionCheckFunction] of this.inputMap.entries()) {
                if (actionCheckFunction()) {
                    return action;
                }
            }
        }
        return Actions.STAND;
    }

    //TODO extract this to interface
    public async move(direction: Directions): Promise<void> {
        return new Promise<void>((resolve) => {
            this.isMoving = true;
            const heroMovement = this.heroAnimator.map(direction);

            this.sprite.anims.play(heroMovement.walking, true);

            this.tweens.add({
                ...heroMovement.tween,
                targets: this.sprite,
                onUpdate: () => {
                    this.sprite.setDepth(this.sprite.y - configuration.verticalTileSize / 2);
                },
                onComplete: () => {
                    this.sprite.anims.play(heroMovement.idle, true);
                    this.isMoving = false;
                    resolve();
                },
                onCompleteScope: this
            });
        });
    }

}