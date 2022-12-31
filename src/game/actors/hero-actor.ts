import Phaser from 'phaser';
import {Tiles} from '@/game/tiles/tiles';
import {HeroAnimator} from '../animations/hero-animator';
import {Actions} from '../constants/actions';
import type {Point} from '@/game/math/point';
import type {Directions} from '../constants/directions';
import type {GameActor} from '@/game/actors/game-actor';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';

export class HeroActor implements GameActor {
    private readonly heroAnimator: HeroAnimator;
    private readonly inputMap: Map<Actions, () => boolean>;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;

    private isMoving: boolean = false;
    private tweens: Phaser.Tweens.TweenManager;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private tilePosition: Point;

    public constructor(config: { tilePosition: Point; sprite: Phaser.GameObjects.Sprite; id: number; scene: Phaser.Scene }) {
        this.id = config.id;
        this.inputMap = new Map<Actions, () => boolean>();
        this.inputMap.set(Actions.RIGHT, () => Phaser.Input.Keyboard.JustDown(this.cursors!.right));
        this.inputMap.set(Actions.LEFT, () => Phaser.Input.Keyboard.JustDown(this.cursors!.left));
        this.inputMap.set(Actions.DOWN, () => Phaser.Input.Keyboard.JustDown(this.cursors!.down));
        this.inputMap.set(Actions.UP, () => Phaser.Input.Keyboard.JustDown(this.cursors!.up));

        this.heroAnimator = new HeroAnimator();

        this.tweens = config.scene.tweens;
        this.cursors = config.scene.input.keyboard.createCursorKeys();
        //https://newdocs.phaser.io/docs/3.55.2/focus/Phaser.Tilemaps.Tilemap-createFromTiles
        this.sprite = config.sprite;
        this.heroAnimator.createAnimations()
            .forEach(item => this.sprite!.anims.create(item));
        this.tilePosition = config.tilePosition;
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
        this.tilePosition = this.tilePosition.calculateOffset(direction);
        return new Promise<void>((resolve) => {
            this.isMoving = true;
            const heroMovement = this.heroAnimator.map(direction);
            if (heroMovement) {
                this.tweens!.add({
                    ...heroMovement.tween,
                    targets: this.sprite,
                    onInit: () => {
                        this.sprite!.anims.play(heroMovement.walking, true);
                    },
                    onUpdate: () => {
                        this.sprite!.setDepth(new TileDepthCalculator().calculate(Tiles.hero, this.sprite.y));
                    },
                    onComplete: () => {
                        this.sprite!.anims.play(heroMovement.idle, true);
                        this.isMoving = false;
                        resolve();
                    },
                    onCompleteScope: this //doc purposes
                });
            } else {
                resolve();
            }
        });
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.hero;
    }

    public getId(): Tiles {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public isCovered(): boolean {
        return false;
    }

    public onCover() {
        console.error('hero being covered');
    }

    public onUncover() {
        console.error('hero being uncovered');
    }

}