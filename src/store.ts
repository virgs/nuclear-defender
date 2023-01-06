import type {SolutionOutput} from '@/game/solver/sokoban-solver';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';
import type {Tiles} from '@/game/tiles/tiles';
import type {Point} from '@/game/math/point';

export class Store {
    private _movesCode: string = '';
    private _currentLevelIndex: number = -1;
    private _bestMoves: number[] = [];
    private _router: any;
    private _solution?: SolutionOutput;
    private _totalTimeInMs: number = 0;
    private _furthestEnabledLevel: number = 0;
    private _strippedLayeredTileMatrix?: MultiLayeredMap;
    private _features: Map<Tiles, Point[]> = new Map<Tiles, Point[]>();

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
        //TODO store it in the chrome storage
        return this._furthestEnabledLevel;
    }

    set furthestEnabledLevel(value: number) {
        //TODO get max from param and browser storage
        this._furthestEnabledLevel = value;
    }

    get strippedLayeredTileMatrix(): MultiLayeredMap | undefined {
        return this._strippedLayeredTileMatrix;
    }

    set strippedLayeredTileMatrix(value: MultiLayeredMap | undefined) {
        this._strippedLayeredTileMatrix = value;
    }

    get features(): Map<Tiles, Point[]> {
        return this._features;
    }

    set features(value: Map<Tiles, Point[]>) {
        this._features = value;
    }

    private static get instance(): Store {
        return this._instance;
    }


}