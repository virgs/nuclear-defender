import type {Point} from '@/game/math/point';
import type {GameActor} from '@/game/actors/game-actor';
import {configuration} from '@/game/constants/configuration';

export class Target implements GameActor {
    private readonly tilePosition: Point;
    private readonly sprite: Phaser.GameObjects.Sprite;

    constructor(config: { scene: Phaser.Scene, sprite: Phaser.GameObjects.Sprite, tilePosition: Point }) {
        this.tilePosition = config.tilePosition;
        this.sprite = config.sprite;
        const radius = configuration.world.tileSize.horizontal * 4;
        const rgb: number = Phaser.Display.Color.HexStringToColor(configuration.colors.highlight).color;
        config.scene.lights.addLight((this.tilePosition.x + 0.5) * configuration.world.tileSize.horizontal,
            (this.tilePosition.y + .5) * configuration.world.tileSize.vertical,
            radius, rgb);
    }

    public getTilePosition() {
        return this.tilePosition;
    }

}