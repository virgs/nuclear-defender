import type {Actions} from '@/game/constants/actions';

export class Store {
    private _movesCode?: Actions[] = [];
    private _map: string = '';
    private _currentLevelIndex: number = -1;
    private _bestMoves: number[] = [];
    private _router: any;

    private static _instance: Store = new Store();

    private constructor() {
    }

    public static getInstance(): Store {
        return Store._instance;
    }

    set movesCode(value: Actions[]) {
        this._movesCode = value;
    }

    set currentLevelIndex(value: number) {
        this._currentLevelIndex = value;
    }

    set bestMoves(value: number[]) {
        this._bestMoves = value;
    }

    get map(): string {
        return this._map;
    }

    set map(value: string) {
        this._map = value;
    }

    set router(value: any) {
        this._router = value;
    }

    public update(x: number): void {
        console.log(x)
    }

}