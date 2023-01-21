import type {Point} from '@/game/math/point';
import type {Tiles} from '@/game/tiles/tiles';
import type {Actions} from '@/game/constants/actions';
import type {Level} from '@/game/levels/defaultLevels';
import {configuration} from '@/game/constants/configuration';
import type {MultiLayeredMap} from '@/game/tiles/standard-sokoban-annotation-translator';

export type StoredLevel = {
    level: Level,
    index: number,
    displayIndex: string,
    bestTime: number,
    playerActions: Actions[],
    strippedLayeredTileMatrix: MultiLayeredMap;
    dynamicFeatures: Map<Tiles, Point[]>
};

type LevelCompleteData = {
    movesCode: Actions[],
    totalTime: number
};

export class Store {    private _router: any;

    private static instance: Store = new Store();
    private currentSelectedLevel?: StoredLevel;
    private levelCompletedData?: LevelCompleteData;
    private customLevel?: StoredLevel;

    private constructor() {
    }

    public static getInstance(): Store {
        return Store.instance;
    }

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

    public setCurrentSelectedIndex(currentIndex: number) {
        localStorage.setItem(configuration.store.currentSelectedIndexKey, currentIndex + '');
    }

    public getCurrentSelectedIndex(): number {
        return Number(localStorage.getItem(configuration.store.currentSelectedIndexKey) || 0);
    }

    public setFurthestEnabledLevel(value: number) {
        localStorage.setItem(configuration.store.furthestEnabledLevelKey, value + '');
    }

    public getFurthestAvailableLevel(): number {
        return Number(localStorage.getItem(configuration.store.furthestEnabledLevelKey) || 0);
    }

    get router(): any {
        return this._router;
    }

    set router(value: any) {
        this._router = value;
    }

}