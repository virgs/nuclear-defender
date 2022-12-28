import {Point} from '@/game/math/point';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';

export class Target implements GameActor {
    private static readonly uncoveredIntensity = 1.25;
    private static readonly coveredIntensity = .25;
    private static readonly rgb: number = Phaser.Display.Color.HexStringToColor(configuration.colors.highlight).color;
    private static readonly radius: number = configuration.world.tileSize.horizontal * 3;

    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly light: Phaser.GameObjects.Light;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private currentPosition: Point;
    private covered: boolean;

    constructor(config: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tilePosition: Point }) {
        this.scene = config.scene;
        this.covered = false;
        this.tilePosition = config.tilePosition;
        this.sprite = config.sprite;
        this.tweens = config.scene.tweens;

        this.currentPosition = new Point(this.tilePosition.x * configuration.world.tileSize.horizontal, this.tilePosition.y * configuration.world.tileSize.vertical);

        const lightCenter = this.getLightCenter();
        this.light = config.scene.lights.addLight(lightCenter.x, lightCenter.y, Target.radius,
            Target.rgb, Target.uncoveredIntensity);

        const path = new Phaser.Curves.Path();
        path.add(new Phaser.Curves.Ellipse(this.currentPosition.x, this.currentPosition.y,
            configuration.world.tileSize.horizontal * .15, configuration.world.tileSize.horizontal * .05));

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
                this.currentPosition = new Point(point.x, point.y);
                this.sprite.setPosition(this.currentPosition.x, this.currentPosition.y);
                const lightCenter = this.getLightCenter();
                this.light.setPosition(lightCenter.x, lightCenter.y);
            },
            repeat: -1
        });
    }

    public getLightCenter(): Point {
        const adjustment = new Point(configuration.world.tileSize.horizontal * .5, configuration.world.tileSize.vertical * .55);

        return new Point(this.currentPosition.x + adjustment.x, this.currentPosition.y + adjustment.y);
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

    public setShadowCasters(shadowCasters: Phaser.GameObjects.Sprite[]): void {
        // this.light.getPoint(10)
        const lightCenter = this.getLightCenter();
        shadowCasters
            .filter(shadowCaster =>
                shadowCaster.getCenter()
                    .distance(this.getLightCenter()) < Target.radius)
            .forEach(shadowCaster => {
                // shadowCaster.tint = 0x234565;
                const bottomLeft = shadowCaster.getBottomLeft();
                const bottomRight = shadowCaster.getBottomRight();
                const topLeft = shadowCaster.getTopLeft();
                const topRight = shadowCaster.getTopRight();
                const corners = [bottomRight, bottomLeft, topRight, topLeft];
                // console.log(corners);
                const reduce = corners.reduce((acc, item) => {
                    const angle =
                        Phaser.Math.Angle.Between(

                            lightCenter.x, lightCenter.y,
                            item.x, item.y,);
                    if (angle > acc.max.value) {
                        acc.max.value = angle;
                        acc.max.point = new Point(item.x, item.y)
                    }
                    if (angle < acc.min.value) {
                        acc.min.value = angle;
                        acc.min.point = new Point(item.x, item.y)
                    }

                    return acc;
                }, {min: {value: Infinity, point: new Point(0, 0)}, max: {value: -Infinity, point: new Point(0, 0)}});

                // const mask = this.scene.make.renderTexture();
                // shadowCaster.mask = new Phaser.Display.Masks.BitmapMask(this.scene, mask);

                // const polygon = this.scene.add.polygon(this.sprite.getCenter().x, this.sprite.getCenter().y,
                //     [{x: 207, y: 50}, reduce.min.point.multiply(1), reduce.max.point.multiply(3)],
                //     0xff33cc);


                // graphics.fillRect(32 * i, 32 * i, 256, 256);

                let graphics = this.scene.add.graphics();
                // graphics.fillStyle(0x00FFFF, 0)


                //    graphics.fillStyle(0x00ff00, 1);
                //
                //     graphics.beginPath();
                //     graphics.arc(200, 300, 100, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(280), false, 0.01);
                //     graphics.fillPath();
                //     graphics.closePath();



                graphics.fillStyle(0x00ff00, 1);
                graphics.lineStyle(4, 0xff00ff, 1);

                //  Without this the arc will appear closed when stroked
                // graphics.beginPath();
                // graphics.closePath();
                // graphics.fillPath()
                // graphics.setPosition(reduce.min.point.x, reduce.min.point.y)
                graphics.beginPath();
                graphics.moveTo(reduce.min.point.x, reduce.min.point.y)
                graphics.arc(lightCenter.x, lightCenter.y, Target.radius, reduce.min.value, reduce.max.value, true, 0.01);
                graphics.moveTo(reduce.max.point.x, reduce.max.point.y)
                graphics.fillPath()
                graphics.closePath();
                // graphics.beginPath();
                // graphics.closePath();

                graphics.strokePath();

                // this.scene.bitm

            });

    }
}