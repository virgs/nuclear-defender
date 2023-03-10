import {Point} from '@/math/point';
import {configuration} from '@/constants/configuration';
import {EventEmitter, EventName} from '@/events/event-emitter';
import type {ScreenPropertiesCalculator} from '@/math/screen-properties-calculator';

type MapEditorCursorFollowerConfig = {
    screenPropertiesCalculator: ScreenPropertiesCalculator;
    scene: Phaser.Scene
};

export class MapEditorCursorFollower {
    private readonly config: MapEditorCursorFollowerConfig;
    private readonly sprite: Phaser.GameObjects.Sprite;
    private lastChangeInstant: number;
    private tween: Phaser.Tweens.Tween | undefined;

    constructor(config: MapEditorCursorFollowerConfig) {
        this.config = config;
        this.lastChangeInstant = 0
        this.sprite = this.config.scene.add.sprite(0, 0,
            configuration.selectorTextureKey);
        this.sprite.scale = configuration.world.scale;
        this.sprite.setOrigin(0);
        this.sprite.setDepth(Infinity);
        this.updatePosition(new Point(0, 0));
        EventEmitter.listenToEvent(EventName.MAP_EDITOR_CURSOR_POSITION_CHANGED, position => this.updatePosition(position), {recoverLast: true});
    }

    private updatePosition(position: Point): void {
        const map = this.config.screenPropertiesCalculator.getMap();
        const x = Math.min(position.x, map.width - 1);
        const y = Math.min(position.y, map.height - 1);
        const worldPosition = this.config.screenPropertiesCalculator.getWorldPositionFromTilePosition(new Point(x, y));
        this.sprite.alpha = 1;
        this.sprite.setPosition(worldPosition.x, worldPosition.y);
        if (this.tween) {
            this.tween.stop();
        }
        this.tween = this.config.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 10000,
            ease: 'FadeOut',
        });
    }
}