import {Tiles} from '@/game/tiles/tiles';
import {Actions} from '../constants/actions';
import type {Point} from '@/game/math/point';
import {InputManager} from '@/game/input/input-manager';
import type {Directions} from '../constants/directions';
import {HeroAnimator} from '../animations/hero-animator';
import {TileDepthCalculator} from '@/game/tiles/tile-depth-calculator';
import type {GameActorConfig, GameActor} from '@/game/actors/game-actor';

export class HeroActor implements GameActor {
    private readonly heroAnimator: HeroAnimator;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly id: number;

    private tweens: Phaser.Tweens.TweenManager;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private tilePosition: Point;

    public constructor(config: GameActorConfig) {
        this.id = config.id;

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
        return InputManager.getInstance().getActionInput() || Actions.STAND;
    }

    public async move(direction: Directions): Promise<void> {
        this.tilePosition = this.tilePosition.calculateOffset(direction);
        return new Promise<void>((resolve) => {
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

    public cover() {
        console.error('hero being covered');
    }

    public uncover() {
        console.error('hero being uncovered');
    }

}