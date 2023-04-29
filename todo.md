## Add each target as dynamic light (nevermind)
- https://www.emanueleferonato.com/2015/12/10/calculating-dynamic-light-and-shadows-in-tile-based-roguelike-games-part-1-bresenhams-line-algorithm/
- https://jwiese.eu/en/blog/2018/04/phaser-3-realtime-ligthing/
- https://www.codeandweb.com/spriteilluminator/tutorials/how-to-create-light-effects-in-phaser3
  
1. https://cpetry.github.io/NormalMap-Online/
2. https://www.smart-page.net/smartnormal/


## Next steps
- Fix Undo logic

        //Note needed only when loading from file

        // this.load.html(configuration.html.gameScene.key, configuration.html.gameScene.file);
        // this.load.tilemapTiledJSON(configuration.tiles.tilemapKey, configuration.tiles.tilesheets[0]);
        // this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
        //     this.cache.tilemap.remove(configuration.tiles.tilemapKey);
        // });



1. Óleo e esteiras precisam ocupar o chão do cubo de perspectiva, e não o teto
2. Estreitar suporte da porta direcional para caber o barril e o boneco dentro
3. Existe uma linha com cor diferente no sprite Wall quando não há um batente na parte esquerda do teto.
4. Perspectiva da mola e da parede estão diferentes, não tão encaixando



FIX: Ser capaz de empurrar uma mola flexionada pelos lados