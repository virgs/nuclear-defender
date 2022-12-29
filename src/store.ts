import type {Actions} from '@/game/constants/actions';
import type {SolutionOutput} from '@/game/solver/sokoban-solver';

export class Store {
    private _movesCode?: Actions[] = [];
    private _map: string = '';
    private _currentLevelIndex: number = -1;
    private _bestMoves: number[] = [];
    private _router: any;
    private _solution?: SolutionOutput;

    private static _instance: Store = new Store();

    private constructor() {
    }

    public static getInstance(): Store {
        return Store._instance;
    }

    get movesCode(): Actions[] | undefined {
        return this._movesCode;
    }

    set movesCode(value: Actions[] | undefined) {
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

    static get instance(): Store {
        return this._instance;
    }

    static set instance(value: Store) {
        this._instance = value;
    }

    public update(x: number): void {
        console.log(x);
    }

}