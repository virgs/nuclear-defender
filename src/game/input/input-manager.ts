import {Actions} from '@/game/constants/actions';
import Phaser from 'phaser';

export class InputManager {
    private static instance = new InputManager();
    private readonly inputMap: Map<Actions, () => boolean>;
    private actionInputBuffer?: Actions;

    private constructor() {
        this.inputMap = new Map<Actions, () => boolean>();
    }

    public static getInstance(): InputManager {
        return InputManager.instance;
    }

    public static setup(scene: Phaser.Scene): void {
        // this.instance.inputMap.set(Actions.RIGHT, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown);
        // this.instance.inputMap.set(Actions.UP, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP).isDown);
        // this.instance.inputMap.set(Actions.LEFT, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown);
        // this.instance.inputMap.set(Actions.DOWN, () => scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN).isDown);

        const cursors = scene.input.keyboard.createCursorKeys();

        this.instance.inputMap.set(Actions.RIGHT, () => Phaser.Input.Keyboard.JustDown(cursors.right));
        this.instance.inputMap.set(Actions.UP, () => Phaser.Input.Keyboard.JustDown(cursors.up));
        this.instance.inputMap.set(Actions.LEFT, () => Phaser.Input.Keyboard.JustDown(cursors.left));
        this.instance.inputMap.set(Actions.DOWN, () => Phaser.Input.Keyboard.JustDown(cursors.down));

    }

    public update() {
        // const now = new Date().getTime();
        if (this.actionInputBuffer === undefined) {

            for (let [action, actionCheckFunction] of this.inputMap.entries()) {
                if (actionCheckFunction()) {
                    this.actionInputBuffer = action;
                }
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