import {Point} from '@/game/math/point';
import {Tiles} from '@/game/tiles/tiles';
import type {Box} from '@/game/actors/box';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';
import type {Directions} from '@/game/constants/directions';

export class Target implements GameActor {
    private static readonly UNCOVERED_LIGHT_INTENSITY = .5;
    private static readonly COVERED_LIGHT_INTENSITY = .025;
    private static readonly LIGHT_COLOR: number = Phaser.Display.Color.HexStringToColor(configuration.colors.highlight).color;
    private static readonly LIGHT_RADIUS: number = configuration.world.tileSize.horizontal * 3;

    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly tweens: Phaser.Tweens.TweenManager;
    private readonly scene: Phaser.Scene;
    private readonly id: number;
    private covered: boolean;

    constructor(config: { boxes: Box[]; tilePosition: Point; sprite: Phaser.GameObjects.Sprite; id: number; scene: Phaser.Scene }) {
        this.id = config.id;
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
        const light = config.scene.lights.addLight(this.sprite.x, this.sprite.y, Target.LIGHT_RADIUS,
            Target.LIGHT_COLOR, Target.UNCOVERED_LIGHT_INTENSITY);

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
                    light.intensity = Target.COVERED_LIGHT_INTENSITY + intensity;
                } else {
                    light.intensity = Target.UNCOVERED_LIGHT_INTENSITY + intensity;
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

    public getId(): number {
        return this.id;
    }

    public getOrientation(): Directions | undefined {
        return undefined;
    }

}