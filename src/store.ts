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
    playerActions: Actions[],
    strippedLayeredTileMatrix: MultiLayeredMap;
    dynamicFeatures: Map<Tiles, Point[]>
};

type LevelCompleteData = {
    movesCode: Actions[],
    totalTime: number
};

export class Store {
    private currentSelectedLevel?: StoredLevel;
    private levelCompletedData?: LevelCompleteData;
    private customLevel?: StoredLevel;

    public getCurrentStoredLevel(): StoredLevel | undefined {
        return this.currentSelectedLevel;
    }

    public setCurrentStoredLevel(newStoredLevel: StoredLevel): void {
        this.currentSelectedLevel = newStoredLevel;
    }

    public getLevelCompleteData(): LevelCompleteData | undefined {
        return this.levelCompletedData;
    }

    public setLevelCompleteData(data: LevelCompleteData): void {
        this.levelCompletedData = data;
    }

    public getCustomLevel(): StoredLevel | undefined {
        return this.customLevel;
    }

    public setCustomLevel(newCustom: StoredLevel): void {
        localStorage.setItem(configuration.store.customLevelKey, JSON.stringify(newCustom));
        this.customLevel = newCustom;
    }



    private _router: any;
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

    get router(): any {
        return this._router;
    }

    set router(value: any) {
        this._router = value;
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