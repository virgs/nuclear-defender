export class TimeController {
    private timeFactor: number = 1;
    private static instance: TimeController = new TimeController();

    private constructor() {
    }

    public static getInstance(): TimeController {
        return TimeController.instance;
    }

    public static getTimeFactor(): number {
        return TimeController.getInstance().timeFactor;
    }

}