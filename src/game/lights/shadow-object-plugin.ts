export class ShadowObjectPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        pluginManager.registerGameObject('shadowObject', this.createObject);
        console.log('shadowed');
    }

    public createObject(x: number, y: number, lightSource: any) {
        console.log('game shadow')
        // return this.displayList.add(new ShadowObject(this.scene, x, y, lightSource));
    }

}