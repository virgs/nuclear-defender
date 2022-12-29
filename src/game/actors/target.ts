import {Point} from '@/game/math/point';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';

export class Target implements GameActor {
    private static readonly uncoveredIntensity = .5;
    private static readonly coveredIntensity = .125;
    private static readonly rgb: number = Phaser.Display.Color.HexStringToColor(configuration.colors.highlight).color;
    static readonly radius: number = configuration.world.tileSize.horizontal * 3;

    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly light: Phaser.GameObjects.Light;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly pathRadius: Point;
    private covered: boolean;

    constructor(config: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tilePosition: Point }) {
        this.scene = config.scene;
        this.covered = false;
        this.tilePosition = config.tilePosition;
        this.sprite = config.sprite;
        this.tweens = config.scene.tweens;

        this.light = config.scene.lights.addLight(this.sprite.x, this.sprite.y, Target.radius,
            Target.rgb, Target.uncoveredIntensity);

        const path = new Phaser.Curves.Path();
        this.pathRadius = new Point(configuration.world.tileSize.horizontal * .05, configuration.world.tileSize.horizontal * .05);
        path.add(new Phaser.Curves.Ellipse(this.sprite.x, this.sprite.y,
            this.pathRadius.x, this.pathRadius.y));

        const follower = {t: 0, vec: new Phaser.Math.Vector2()};
        config.scene.tweens.add({
            targets: follower,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 5000,
            onUpdate: () => {
                const intensity = Math.random() * .25;
                if (this.covered) {
                    //TODO make it decrease gradually
                    this.light.intensity = Target.coveredIntensity + intensity;
                } else {
                    this.light.intensity = Target.uncoveredIntensity + intensity;
                }

                const point = path.getPoint(follower.t, follower.vec);
                this.sprite.setPosition(point.x, point.y);
                this.light.setPosition(point.x, point.y);
            },
            repeat: -1
        });
    }

    public getTilePosition() {
        return this.tilePosition;
    }

    public getPosition() {
        return new Point(this.sprite.x, this.sprite.y);
    }

    public cover(): void {
        this.covered = true;
    }

    public uncover(): void {
        this.covered = false;
    }

    public isCovered(): boolean {
        return this.covered;
    }

    public getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

}