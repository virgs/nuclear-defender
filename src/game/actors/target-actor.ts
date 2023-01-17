import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import {SpriteCreator} from '@/game/actors/sprite-creator';
import type {Directions} from '@/game/constants/directions';
import {configuration} from '@/game/constants/configuration';
import type {GameActor, GameActorConfig} from '@/game/actors/game-actor';

export class TargetActor implements GameActor {
    private static readonly UNCOVERED_LIGHT_INTENSITY = .66;
    private static readonly COVERED_LIGHT_INTENSITY = .15;
    private static readonly LIGHT_UNCOVERED_COLOR: number = Phaser.Display.Color.HexStringToColor(configuration.colors.radioactive).color;
    private static readonly LIGHT_COVERED_COLOR: number = Phaser.Display.Color.HexStringToColor(configuration.colors.controlled).color;
    private static readonly LIGHT_RADIUS: number = configuration.world.tileSize.horizontal * 3;

    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly id: number;
    private tilePosition: Point;
    private covered: boolean;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.covered = false;
        this.tilePosition = config.tilePosition;
        this.sprite = new SpriteCreator({scene: config.scene, code: this.getTileCode()}).createSprite(config.worldPosition);
        this.tweens = config.scene.tweens;

        this.addLight();
    }

    private addLight() {
        const light = this.scene.lights.addLight(this.sprite.x, this.sprite.y, TargetActor.LIGHT_RADIUS,
            TargetActor.LIGHT_UNCOVERED_COLOR, TargetActor.UNCOVERED_LIGHT_INTENSITY);

        const pathRadius = new Point(configuration.world.tileSize.horizontal * 0.1, configuration.world.tileSize.horizontal * 0.1);

        const path = new Phaser.Curves.Path();
        path.add(new Phaser.Curves.Ellipse(this.sprite.x, this.sprite.y,
            pathRadius.x, pathRadius.y));

        const follower = {t: 0, vec: new Phaser.Math.Vector2()};
        this.scene.tweens.add({
            targets: follower,
            t: 1,
            ease: 'Linear',
            duration: Math.random() * 5000 + 3000,
            useFrames: true,
            onUpdate: () => {
                const intensity = Math.random() * .25;
                if (this.covered) {
                    light.setColor(TargetActor.LIGHT_COVERED_COLOR);
                    light.intensity = TargetActor.COVERED_LIGHT_INTENSITY + intensity;
                } else {
                    light.setColor(TargetActor.LIGHT_UNCOVERED_COLOR);
                    light.intensity = TargetActor.UNCOVERED_LIGHT_INTENSITY + intensity;
                }

                const point = path.getPoint(follower.t, follower.vec);
                this.sprite.setPosition(point.x, point.y);
                light.setPosition(point.x + this.sprite.width / 2,
                    point.y + this.sprite.height / 2);
            },
            repeat: -1
        });
    }

    public getTilePosition() {
        return this.tilePosition;
    }

    public setTilePosition(tilePosition: Point): void {
        this.tilePosition = tilePosition;
    }

    public cover(actors: GameActor[]): void {
        if (actors
            .some(actor => actor.getTileCode() === Tiles.box || actor.getTileCode() === Tiles.hero)) {
            this.covered = true;
        } else {
            this.covered = false;
        }
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    public getTileCode(): Tiles {
        return Tiles.target;
    }

    public getId(): number {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

    public async animate(nextPosition: Point, direction?: Directions): Promise<any> {
    }

}