import Phaser from 'phaser';
import {HeroAnimator} from './hero-animator';
import {Actions} from '../constants/actions';
import type {Point} from '@/game/math/point';
import type {Directions} from '../constants/directions';
import type {GameActor} from '@/game/actors/game-actor';

export class Hero implements GameActor {
    private readonly heroAnimator: HeroAnimator;
    private readonly inputMap: Map<Actions, () => boolean>;
    private readonly sprite: Phaser.GameObjects.Sprite;

    private isMoving: boolean = false;
    private tweens: Phaser.Tweens.TweenManager;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private tilePosition: Point;

    public constructor(heroConfig: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tilePosition: Point }) {
        this.inputMap = new Map<Actions, () => boolean>();
        this.inputMap.set(Actions.RIGHT, () => Phaser.Input.Keyboard.JustDown(this.cursors!.right));
        this.inputMap.set(Actions.LEFT, () => Phaser.Input.Keyboard.JustDown(this.cursors!.left));
        this.inputMap.set(Actions.DOWN, () => Phaser.Input.Keyboard.JustDown(this.cursors!.down));
        this.inputMap.set(Actions.UP, () => Phaser.Input.Keyboard.JustDown(this.cursors!.up));

        this.heroAnimator = new HeroAnimator();

        this.tweens = heroConfig.scene.tweens;
        this.cursors = heroConfig.scene.input.keyboard.createCursorKeys();
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
        this.sprite = heroConfig.sprite;
        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite!.anims.create(item));
        this.tilePosition = heroConfig.tilePosition;
    }

    public getTilePosition(): Point {
        return this.tilePosition;
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

    public async move(direction: Directions): Promise<void> {
        return new Promise<void>((resolve) => {
            this.isMoving = true;
            const heroMovement = this.heroAnimator.map(direction);

            this.tweens!.add({
                ...heroMovement.tween,
                targets: this.sprite,
                onInit: () => {
                    this.sprite!.anims.play(heroMovement.walking, true);
                    this.tilePosition = this.tilePosition.calculateOffset(direction);
                },
                onUpdate: () => {
                    this.sprite!.setDepth(this.sprite!.y + 1);
                },
                onComplete: () => {
                    this.sprite!.anims.play(heroMovement.idle, true);
                    this.isMoving = false;
                    resolve();
                },
                onCompleteScope: this //doc purposes
            });
        });
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }
}