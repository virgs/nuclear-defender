import { Point } from '@/math/point';
import { Tiles } from '@/levels/tiles';
import { GameObjectCreator } from './game-object-creator';
import { configuration } from '@/constants/configuration';
export class TargetActor {
    static UNCOVERED_LIGHT_INTENSITY = .66;
    static BOX_COVERED_LIGHT_INTENSITY = .15;
    static HERO_COVERED_LIGHT_INTENSITY = .05;
    static LIGHT_UNCOVERED_COLOR = Phaser.Display.Color.HexStringToColor(configuration.colors.radioactive).color;
    static LIGHT_COVERED_COLOR = Phaser.Display.Color.HexStringToColor(configuration.colors.controlled).color;
    static LIGHT_RADIUS = configuration.world.tileSize.horizontal * 3;
    sprite;
    scene;
    id;
    tilePosition;
    coveredBy;
    intensityModifier;
    constructor(config) {
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
    addLight() {
        const light = this.scene.lights.addLight(this.sprite.x, this.sprite.y, TargetActor.LIGHT_RADIUS, TargetActor.LIGHT_UNCOVERED_COLOR, TargetActor.UNCOVERED_LIGHT_INTENSITY);
        const pathRadius = new Point(configuration.world.tileSize.horizontal * 0.1, configuration.world.tileSize.horizontal * 0.1);
        const path = new Phaser.Curves.Path();
        path.add(new Phaser.Curves.Ellipse(this.sprite.x, this.sprite.y, pathRadius.x, pathRadius.y));
        const follower = { t: 0, vec: new Phaser.Math.Vector2() };
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
                }
                else if (this.coveredBy === Tiles.wall) {
                    light.setColor(TargetActor.LIGHT_COVERED_COLOR);
                    light.intensity = TargetActor.BOX_COVERED_LIGHT_INTENSITY * this.intensityModifier + intensity;
                }
                else {
                    light.setColor(TargetActor.LIGHT_UNCOVERED_COLOR);
                    light.intensity = TargetActor.UNCOVERED_LIGHT_INTENSITY * this.intensityModifier + intensity;
                }
                const point = path.getPoint(follower.t, follower.vec);
                this.sprite.setPosition(point.x, point.y);
                light.setPosition(point.x + this.sprite.width / 2, point.y + this.sprite.height / 2);
            },
            repeat: -1
        });
    }
    getTilePosition() {
        return this.tilePosition;
    }
    cover(actors) {
        const cover = actors
            .find(actor => actor.getTileCode() === Tiles.box || actor.getTileCode() === Tiles.hero);
        if (cover) {
            this.coveredBy = cover.getTileCode();
        }
        else {
            this.coveredBy = undefined;
        }
    }
    getTileCode() {
        return Tiles.target;
    }
    getId() {
        return this.id;
    }
}
