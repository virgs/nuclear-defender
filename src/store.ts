import type {SolutionOutput} from '@/game/solver/sokoban-solver';

export class Store {
    private _movesCode: string = '';
    private _map: string = '';
    private _currentLevelIndex: number = -1;
    private _bestMoves: number[] = [];
    private _router: any;
    private _solution?: SolutionOutput;
    private _totalTimeInMs: number = 0;
    private _furthestEnabledLevel: number = 0;

    private static _instance: Store = new Store();

    private constructor() {
    }

    public static getInstance(): Store {
        return Store._instance;
    }

    get movesCode(): string {
        return this._movesCode;
    }

    set movesCode(value: string) {
        this._movesCode = value;
    }

    get map(): string {
        return this._map;
    }

    set map(value: string) {
        this._map = value;
    }

    get currentLevelIndex(): number {
        return this._currentLevelIndex;
    }

    set currentLevelIndex(value: number) {
        this._currentLevelIndex = value;
    }

    get bestMoves(): number[] {
        return this._bestMoves;
    }

    set bestMoves(value: number[]) {
        this._bestMoves = value;
    }

    get router(): any {
        return this._router;
    }

    set router(value: any) {
        this._router = value;
    }

    get solution(): SolutionOutput {
        return this._solution!;
    }

    set solution(value: SolutionOutput) {
        this._solution = value;
    }

    get totalTimeInMs(): number {
        return this._totalTimeInMs;
    }

    set totalTimeInMs(value: number) {
        this._totalTimeInMs = value;
    }

    get furthestEnabledLevel(): number {
        return this._furthestEnabledLevel;
    }

    set furthestEnabledLevel(value: number) {
        this._furthestEnabledLevel = value;
    }

    static get instance(): Store {
        return this._instance;
    }

    public update(x: number): void {
        console.log(x);
    }

}