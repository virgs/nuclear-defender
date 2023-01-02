import {Actions} from '@/game/constants/actions';
import Phaser from 'phaser';

export class InputManager {
    private static readonly TIME_TO_LIVE = 20;
    private static readonly instance = new InputManager();

    private readonly inputMap: Map<Actions, () => boolean>;
    private lifeCountdown: number;
    private actionInputBuffer?: Actions;

    private constructor() {
        this.inputMap = new Map<Actions, () => boolean>();
        this.lifeCountdown = 0;
    }

    public static getInstance(): InputManager {
        return InputManager.instance;
    }

    public static setup(scene: Phaser.Scene): void {
        this.instance.inputMap.set(Actions.RIGHT, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown);
        this.instance.inputMap.set(Actions.UP, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown);
        this.instance.inputMap.set(Actions.LEFT, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown);
        this.instance.inputMap.set(Actions.DOWN, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN).isDown);

        // const cursors = scene.input.keyboard.createCursorKeys();
        // this.instance.inputMap.set(Actions.RIGHT, () => Phaser.Input.Keyboard.JustDown(cursors.right));
        // this.instance.inputMap.set(Actions.UP, () => Phaser.Input.Keyboard.JustDown(cursors.up));
        // this.instance.inputMap.set(Actions.LEFT, () => Phaser.Input.Keyboard.JustDown(cursors.left));
        // this.instance.inputMap.set(Actions.DOWN, () => Phaser.Input.Keyboard.JustDown(cursors.down));
    }

    public update(delta: number) {
        if (this.lifeCountdown > 0) {
            this.lifeCountdown -= delta;
            if (this.lifeCountdown <= 0) {
                this.actionInputBuffer = undefined;
            }
        }
        for (let [action, actionCheckFunction] of this.inputMap.entries()) {
            if (actionCheckFunction()) {
                this.lifeCountdown = InputManager.TIME_TO_LIVE;
                this.actionInputBuffer = action;
                return;
            }
        }
    }

    public getActionInput(): Actions | undefined {
        if (this.actionInputBuffer !== undefined) {
            const action = this.actionInputBuffer;
            this.actionInputBuffer = undefined;
            return action;
        }
    }
}