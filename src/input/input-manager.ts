import {Directions} from '@/constants/directions';
import {EventEmitter, EventName} from '@/events/event-emitter';
import * as Phaser from 'phaser';

type InputValue = {
    event: EventName,
    args?: any
};

export class InputManager {
    private readonly shortcutKeys: Map<Phaser.Input.Keyboard.Key, InputValue>;

    public constructor() {
        this.shortcutKeys = new Map();
    }

    public enable(scene: Phaser.Scene): void {
        scene.input.keyboard.enabled = true;
        scene.game.input.enabled = true;

        //does not accept holding event
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z), {
            // event: EventName.UNDO_BUTTON_CLICKED,
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R), {
            event: EventName.RESTART_LEVEL,
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q), {
            event: EventName.QUIT_LEVEL,
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), {
            event: EventName.HERO_DIRECTION_INPUT,
            args: Directions.LEFT
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT), {
            event: EventName.HERO_DIRECTION_INPUT,
            args: Directions.RIGHT
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP), {
            event: EventName.HERO_DIRECTION_INPUT,
            args: Directions.UP
        });
        this.shortcutKeys.set(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN), {
            event: EventName.HERO_DIRECTION_INPUT,
            args: Directions.DOWN
        });
    }

    public clear(): void {
        this.shortcutKeys.clear();
    }

    public update() {
        Array.from(this.shortcutKeys.entries())
            .forEach(item => {
                const [key, value] = item;
                if (Phaser.Input.Keyboard.JustDown(key)) {
                    EventEmitter.emit(value.event, value.args)
                }
            })

    }
}