import tilesheet0 from '@/game/assets/levels/level-0.json';
import tileSheetAsset from '@/game/assets/sokoban_tilesheet.png';

export const configuration = {
    frameRate: 10,
    spriteSheetKey: 'tiles',
    updateCycleInMs: 250,
    tiles: {
        verticalSize: 40,
        horizontalSize: 40,
        tilesheets: [tilesheet0],
        sheetAsset: tileSheetAsset,
        tilemapKey: 'tilemap',
        layerName: 'Level',
        tilesetName: 'sokoban',
    },
    gameWidth: 1000,
    gameHeight: 750,
    colors: {
        foregroundColor: '#d6d6d6',
        highlight: '#d4fa00',
        background: '#dddddd'
    },
    html: {
        gameScene: {
            key: 'gameSceneKey',
            file: 'assets/html/game-scene.html'
        }
    }

};