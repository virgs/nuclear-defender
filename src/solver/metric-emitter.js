export var Metrics;
(function (Metrics) {
    Metrics[Metrics["ADD_CANDIDATE"] = 0] = "ADD_CANDIDATE";
    Metrics[Metrics["POP_CANDIDATE"] = 1] = "POP_CANDIDATE";
    Metrics[Metrics["MOVE_ANALYSYS"] = 2] = "MOVE_ANALYSYS";
    Metrics[Metrics["BREATHING_TIME"] = 3] = "BREATHING_TIME";
    Metrics[Metrics["HASH_CALCULATION"] = 4] = "HASH_CALCULATION";
    Metrics[Metrics["VISISTED_LIST_CHECK"] = 5] = "VISISTED_LIST_CHECK";
})(Metrics || (Metrics = {}));
export class MetricEmitter {
    metricMap;
    startTime;
    constructor() {
        this.startTime = new Date().getTime();
        this.metricMap = new Map();
    }
    async measureTime(metric, method) {
        const before = new Date().getTime();
        const result = await method();
        const after = new Date().getTime();
        const currentValue = this.metricMap.get(metric) || 0;
        this.metricMap.set(metric, after - before + currentValue);
        return result;
    }
    log() {
        console.log(`Metrics (${new Date().getTime() - this.startTime}ms)`);
        let totalTime = 0;
        this.metricMap
            .forEach(time => totalTime += time);
        for (let [key, value] of this.metricMap.entries()) {
            console.log(`\t${Metrics[key]}: ${value}ms (${Math.trunc(1000 * value / totalTime) / 10}%)`);
        }
    }
}
