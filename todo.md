[Article describing how to solve it](https://www.cs.huji.ac.il/~ai/projects/2012/SokobanWP/)

## Add each target as dynamic light (nevermind)
- https://www.emanueleferonato.com/2015/12/10/calculating-dynamic-light-and-shadows-in-tile-based-roguelike-games-part-1-bresenhams-line-algorithm/
- https://jwiese.eu/en/blog/2018/04/phaser-3-realtime-ligthing/
- https://www.codeandweb.com/spriteilluminator/tutorials/how-to-create-light-effects-in-phaser3
  
1. https://cpetry.github.io/NormalMap-Online/
2. https://www.smart-page.net/smartnormal/


## Next steps
- Remove unnecessary movement analysys logic
- Build it for production (webpack?)
- Fix Undo logic

        //Note needed only when loading from file

        // this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        // this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        // this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        //     this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        // });

