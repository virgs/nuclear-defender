import {Directions} from '@/game/constants/directions';
import {EventEmitter, EventName} from '@/event-emitter';

export class InputManager {
    private readonly heroWatchingKeys: Map<string, Directions>;
    private readonly shortcutKeys: Map<string, EventName>;

    public constructor() {
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

    public init(scene: Phaser.Scene): void {
        scene.input.keyboard.enabled = true;
        scene.game.input.enabled = true;

        scene.input.keyboard.on('keydown', (event: any) => {
            const key = event.key.toLowerCase();
            if (this.heroWatchingKeys.has(key)) {
                EventEmitter.emit(EventName.HERO_DIRECTION_INPUT, this.heroWatchingKeys.get(key));
            }
            if (this.shortcutKeys.has(key)) {
                EventEmitter.emit(this.shortcutKeys.get(key)!);
            }
        });

    }

    public clear(): void {
        this.shortcutKeys.clear();
        this.heroWatchingKeys.clear();
    }

}