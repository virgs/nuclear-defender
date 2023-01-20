export enum EventName {
    UNDO_BUTTON_CLICKED,
    HERO_DIRECTION_INPUT,
}

type EventListener = (args: any) => any;

export class EventEmitter {
    private static instance: EventEmitter = new EventEmitter();
    private eventListener: Map<EventName, EventListener[]> = new Map();

    private constructor() {
        Object.keys(EventName)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key) as EventName)
            .forEach(event => this.eventListener.set(event, []));
    }

    public static listenToEvent(eventName: EventName, callback: EventListener): void {
        EventEmitter.instance.eventListener.get(eventName)!.push(callback);
    }

    public static emit(eventName: EventName, args?: any): void {
        EventEmitter.instance.eventListener.get(eventName)!
            .forEach(callback => callback(args));
    }

    public static reinit() {
        EventEmitter.instance = new EventEmitter();
    }
}