import {Point} from '@/math/point';
import {Tiles} from '@/levels/tiles';
import {GameObjectCreator} from './game-object-creator';
import {configuration} from '@/constants/configuration';
import type {GameActor, GameActorConfig} from './game-actor';

export class TargetActor implements GameActor {
    private static readonly UNCOVERED_LIGHT_INTENSITY = .66;
    private static readonly BOX_COVERED_LIGHT_INTENSITY = .15;
    private static readonly HERO_COVERED_LIGHT_INTENSITY = .05;
    private static readonly LIGHT_UNCOVERED_COLOR: number = Phaser.Display.Color.HexStringToColor(configuration.colors.radioactive).color;
    private static readonly LIGHT_COVERED_COLOR: number = Phaser.Display.Color.HexStringToColor(configuration.colors.controlled).color;
    private static readonly LIGHT_RADIUS: number = configuration.world.tileSize.horizontal * 3;

    private readonly sprite: Phaser.GameObjects.Sprite;
    private readonly scene: Phaser.Scene;
    private readonly id: number;
    private readonly tilePosition: Point;
    private coveredBy: Tiles | undefined;
    private intensityModifier: number;

    constructor(config: GameActorConfig) {
        this.id = config.id;
        this.scene = config.scene;
        this.tilePosition = config.tilePosition;
        this.sprite = new GameObjectCreator(config).createSprite(config.code);

        this.intensityModifier = 1.5; // it will always have itself as a target
        config.contentAround
            .forEach(line => line
                .forEach(item => item
                    .filter(layer => layer.code === Tiles.target)
                    .forEach(() => this.intensityModifier *= .66)));
        if (config.playable) {
            this.addLight();
        }
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
                const intensity = Math.random() * .15;
                if (this.coveredBy === Tiles.hero) {
                    light.intensity = TargetActor.HERO_COVERED_LIGHT_INTENSITY * this.intensityModifier + intensity;
                } else if (this.coveredBy === Tiles.wall) {
                    light.setColor(TargetActor.LIGHT_COVERED_COLOR);
                    light.intensity = TargetActor.BOX_COVERED_LIGHT_INTENSITY * this.intensityModifier + intensity;
                } else {
                    light.setColor(TargetActor.LIGHT_UNCOVERED_COLOR);
                    light.intensity = TargetActor.UNCOVERED_LIGHT_INTENSITY * this.intensityModifier + intensity;
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

    public cover(actors: GameActor[]): void {
        const cover = actors
            .find(actor => actor.getTileCode() === Tiles.box || actor.getTileCode() === Tiles.hero);
        if (cover) {
            this.coveredBy = cover.getTileCode();
        } else {
            this.coveredBy = undefined;
        }
    }

    public getTileCode(): Tiles {
        return Tiles.target;
    }

    public getId(): number {
        return this.id;
    }

}