import type {GameSceneConfiguration} from '@/game/scenes/game-scene';

export class Store {
    private static instance: Store = new Store();
    private gameSceneConfiguration?: GameSceneConfiguration;

    private constructor() {
    }

    public static setGameSceneConfiguration(data: GameSceneConfiguration): void {
        Store.instance.gameSceneConfiguration = data;
    }

    public static getGameSceneConfiguration(): GameSceneConfiguration | undefined {
        return Store.instance.gameSceneConfiguration;
    }

}