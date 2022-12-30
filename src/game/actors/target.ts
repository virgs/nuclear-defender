import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {Box} from '@/game/actors/box';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';

export class Target implements GameActor {
    private static readonly uncoveredIntensity = .5;
    private static readonly coveredIntensity = .025;
    private static readonly rgb: number = Phaser.Display.Color.HexStringToColor(configuration.colors.highlight).color;
    static readonly radius: number = configuration.world.tileSize.horizontal * 3;

    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private covered: boolean;

    constructor(config: { boxes: Box[]; tilePosition: Point; sprite: Phaser.GameObjects.Sprite; scene: Phaser.Scene }) {
        this.scene = config.scene;
        this.covered = false;
        this.tilePosition = config.tilePosition;
        this.sprite = config.sprite;
        this.tweens = config.scene.tweens;

        const boxOnIt = config.boxes
            .find(box => box.getTilePosition().isEqualTo(config.tilePosition));
        if (boxOnIt) {
            this.cover();
            boxOnIt.setIsOnTarget(true);
        }
        this.addLight(config);
    }

    private addLight(config: { boxes: Box[]; tilePosition: Point; sprite: Phaser.GameObjects.Sprite; scene: Phaser.Scene }) {
        const light = config.scene.lights.addLight(this.sprite.x, this.sprite.y, Target.radius,
            Target.rgb, Target.uncoveredIntensity);

        const pathRadius = new Point(configuration.world.tileSize.horizontal * 0.2, configuration.world.tileSize.horizontal * 0.2);

        const path = new Phaser.Curves.Path();
        path.add(new Phaser.Curves.Ellipse(this.sprite.x, this.sprite.y,
            pathRadius.x, pathRadius.y));

        const follower = {t: 0, vec: new Phaser.Math.Vector2()};
        config.scene.tweens.add({
            targets: follower,
            t: 1,
            ease: 'Sine.easeInOut',
            duration: 5000,
            onUpdate: () => {
                const intensity = Math.random() * .25;
                if (this.covered) {
                    light.intensity = Target.coveredIntensity + intensity;
                } else {
                    light.intensity = Target.uncoveredIntensity + intensity;
                }

                const point = path.getPoint(follower.t, follower.vec);
                this.sprite.setPosition(point.x, point.y);
                light.setPosition(point.x, point.y);
            },
            repeat: -1
        });
    }

    public getTilePosition() {
        return this.tilePosition;
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

    public getTileCode(): Tiles {
        return Tiles.target;
    }

}