import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Actions} from '@/game/constants/actions';
import type {Level} from '@/game/levels/defaultLevels';
import {configuration} from '@/game/constants/configuration';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type StoredLevel = {
    level: Level,
    index: number,
    bestTime: number,
    strippedLayeredTileMatrix: MultiLayeredMap;
    dynamicFeatures: Map<Tiles, Point[]>
};

export class Store {
    private currentStoredLevel?: StoredLevel;

    public getCurrentStoredLevel(): StoredLevel | undefined {
        return this.currentStoredLevel;
    }

    public setCurrentStoredLevel(newStoredLevel: StoredLevel): void {
        this.currentStoredLevel = newStoredLevel;
    }

    private _movesCode: Actions[] = [];
    private _router: any;
    private _totalTimeInMs: number = 0;
    private _furthestEnabledLevel: number = 0;

    private static _instance: Store = new Store();

    private constructor() {
        const item = localStorage.getItem(configuration.store.furthestEnabledLevelKey);
        if (item !== null) {
            const parsed = Number(item);
            if (!isNaN(parsed)) {
                this.furthestEnabledLevel = parsed;
            }
        }

    }

    public static getInstance(): Store {
        return Store._instance;
    }

    get movesCode(): Actions[] {
        return this._movesCode;
    }

    set movesCode(value: Actions[]) {
        this._movesCode = value;
    }

    get router(): any {
        return this._router;
    }

    set router(value: any) {
        this._router = value;
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
        localStorage.setItem(configuration.store.furthestEnabledLevelKey, value.toString());
        this._furthestEnabledLevel = value;
    }

    private static get instance(): Store {
        return this._instance;
    }

}