import Phaser from 'phaser';
import {Actions} from '@/game/constants/actions';

export class InputManager {
    private static readonly TIME_TO_LIVE = 150;
    private static readonly instance = new InputManager();

    private readonly inputMap: Map<Actions, () => boolean>;
    private actionLiveness: number;
    private deltaAcc: number;
    private actionInputBuffer?: Actions;

    private constructor() {
        this.inputMap = new Map<Actions, () => boolean>();
        this.actionLiveness = 0;
        this.deltaAcc = 0;
    }

    public static getInstance(): InputManager {
        return InputManager.instance;
    }

    public static setup(scene: Phaser.Scene): void {
        const cursors = scene.input.keyboard.createCursorKeys();
        const setUp = (action: Actions, key: number, cursorKey: Phaser.Input.Keyboard.Key) => {
            // scene.input.keyboard.addKey(key).emitOnRepeat = true;
            // this.instance.inputMap.set(action, () => scene.input.keyboard.addKey(key).isDown);
            // cursorKey.emitOnRepeat = true
            // cursorKey.setEmitOnRepeat(true)
            // cursorKey.on('down', () => console.log('ondown'));
            this.instance.inputMap.set(action, () => Phaser.Input.Keyboard.JustDown(cursorKey));
        };
        setUp(Actions.RIGHT, Phaser.Input.Keyboard.KeyCodes.RIGHT, cursors.right);
        setUp(Actions.DOWN, Phaser.Input.Keyboard.KeyCodes.DOWN, cursors.down);
        setUp(Actions.LEFT, Phaser.Input.Keyboard.KeyCodes.LEFT, cursors.left);
        setUp(Actions.UP, Phaser.Input.Keyboard.KeyCodes.UP, cursors.up);
    }

    public update() {
        for (let [action, actionCheckFunction] of this.inputMap.entries()) {
            if (actionCheckFunction()) {
                this.actionInputBuffer = action;
                break;
            }
        }
    }

    public getActionInput(): Actions | undefined {
        const action = this.actionInputBuffer;
        this.actionInputBuffer = undefined;
        return action;
    }
}