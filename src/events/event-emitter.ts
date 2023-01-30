export enum EventName {
    UNDO_BUTTON_CLICKED,
    HERO_DIRECTION_INPUT,
    RESTART_LEVEL,
    QUIT_LEVEL,
    MAP_EDITOR_CURSOR_POSITION_CHANGED,
}

type EventListener = (args: any) => any;

export class EventEmitter {
    private static instance: EventEmitter = new EventEmitter();
    private readonly eventListener: Map<EventName, EventListener[]> = new Map();
    private readonly lastValues: { [propname: string]: any };

    private constructor() {
        this.lastValues = {};
        Object.keys(EventName)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as EventName)
            .forEach(event => this.eventListener.set(event, []));
    }

    public static listenToEvent(eventName: EventName, callback: EventListener, config?: { recoverLast: boolean }): EventEmitter {
        EventEmitter.instance.eventListener.get(eventName)!.push(callback);
        if (config?.recoverLast) {
            if (EventEmitter.instance.lastValues[eventName]) {
                callback(EventEmitter.instance.lastValues[eventName]);
            }
        }
        return EventEmitter.instance;
    }

    public static emit(eventName: EventName, args?: any): EventEmitter {
        EventEmitter.instance.lastValues[eventName] = args;
        EventEmitter.instance.eventListener.get(eventName)!
            .forEach(callback => callback(args));
        return EventEmitter.instance;
    }

}