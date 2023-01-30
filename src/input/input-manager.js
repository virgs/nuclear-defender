import { Directions } from '../constants/directions';
import { EventEmitter, EventName } from '../events/event-emitter';
export class InputManager {
    heroWatchingKeys;
    shortcutKeys;
    constructor() {
        this.heroWatchingKeys = new Map();
        this.heroWatchingKeys.set('ArrowLeft'.toLowerCase(), Directions.LEFT);
        this.heroWatchingKeys.set('ArrowRight'.toLowerCase(), Directions.RIGHT);
        this.heroWatchingKeys.set('ArrowDown'.toLowerCase(), Directions.DOWN);
        this.heroWatchingKeys.set('ArrowUp'.toLowerCase(), Directions.UP);
        this.shortcutKeys = new Map();
        this.shortcutKeys.set('z', EventName.UNDO_BUTTON_CLICKED);
        this.shortcutKeys.set('r', EventName.RESTART_LEVEL);
        this.shortcutKeys.set('q', EventName.QUIT_LEVEL);
    }
    init(scene) {
        scene.input.keyboard.enabled = true;
        scene.game.input.enabled = true;
        scene.input.keyboard.on('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.heroWatchingKeys.has(key)) {
                EventEmitter.emit(EventName.HERO_DIRECTION_INPUT, this.heroWatchingKeys.get(key));
            }
            if (this.shortcutKeys.has(key)) {
                EventEmitter.emit(this.shortcutKeys.get(key));
            }
        });
    }
    clear() {
        this.shortcutKeys.clear();
        this.heroWatchingKeys.clear();
    }
}
