export enum Metrics {
    ADD_CANDIDATE,
    POP_CANDIDATE,
    MOVE_ANALYSYS,
    BREATHING_TIME,
    HASH_CALCULATION,
    VISISTED_LIST_CHECK
}

export class MetricEmitter {
    private readonly metricMap: Map<Metrics, number>;
    private readonly startTime: number;

    constructor() {
        this.startTime = new Date().getTime()
        this.metricMap = new Map();
    }

    public async measureTime(metric: Metrics, method: () => any): Promise<any> {
        const before = new Date().getTime();
        const result = await method();
        const after = new Date().getTime();
        const currentValue = this.metricMap.get(metric) || 0;
        this.metricMap.set(metric, after - before + currentValue);
        return result;
    }

    public log(): void {
        console.log(`Metrics (${new Date().getTime() - this.startTime}ms)`);
        let totalTime = 0;
        this.metricMap
            .forEach(time => totalTime += time);
        for (let [key, value] of this.metricMap.entries()) {
            console.log(`\t${Metrics[key]}: ${value}ms (${Math.trunc(1000 * value / totalTime) / 10}%)`);
        }
    }
}