export class SessionStore {
    static gameViewConfig;
    static nextLevelViewConfig;
    static getGameViewConfig() {
        return SessionStore.gameViewConfig;
    }
    static setGameViewConfig(config) {
        SessionStore.gameViewConfig = config;
    }
    static setNextLevelViewConfig(config) {
        SessionStore.nextLevelViewConfig = config;
    }
    static getNextLevelViewConfig() {
        return SessionStore.nextLevelViewConfig;
    }
}
