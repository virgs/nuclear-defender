export var EventName;
(function (EventName) {
    EventName[EventName["UNDO_BUTTON_CLICKED"] = 0] = "UNDO_BUTTON_CLICKED";
    EventName[EventName["HERO_DIRECTION_INPUT"] = 1] = "HERO_DIRECTION_INPUT";
    EventName[EventName["RESTART_LEVEL"] = 2] = "RESTART_LEVEL";
    EventName[EventName["QUIT_LEVEL"] = 3] = "QUIT_LEVEL";
    EventName[EventName["MAP_EDITOR_CURSOR_POSITION_CHANGED"] = 4] = "MAP_EDITOR_CURSOR_POSITION_CHANGED";
})(EventName || (EventName = {}));
export class EventEmitter {
    static instance = new EventEmitter();
    lastValues;
    eventListener = new Map();
    constructor() {
        this.lastValues = {};
        Object.keys(EventName)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key))
            .forEach(event => this.eventListener.set(event, []));
    }
    static listenToEvent(eventName, callback, config) {
        EventEmitter.instance.eventListener.get(eventName).push(callback);
        if (config?.recoverLast) {
            if (EventEmitter.instance.lastValues[eventName]) {
                callback(EventEmitter.instance.lastValues[eventName]);
            }
        }
        return EventEmitter.instance;
    }
    static emit(eventName, args) {
        EventEmitter.instance.lastValues[eventName] = args;
        EventEmitter.instance.eventListener.get(eventName)
            .forEach(callback => callback(args));
        return EventEmitter.instance;
    }
    static clear() {
        EventEmitter.instance.lastValues = {};
        Object.keys(EventName)
            .filter(key => !isNaN(Number(key)))
            .map(key => Number(key))
            .forEach(event => EventEmitter.instance.eventListener.set(event, []));
    }
}
