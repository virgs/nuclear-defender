import tilesheet0 from '@/game/assets/levels/level-0.json';
import tilesheet1 from '@/game/assets/levels/level-0.json';
import tileSheetAsset from '@/game/assets/sokoban_tilesheet.png';
// @ts-ignore
import gameSceneHtml from '@/game/assets/html/game-scene.html';

const verticalPerspective = .8;
const tileHeight = 40;
const tileWidth = 40;
export const configuration = {
    frameRate: 10,
    spriteSheetKey: 'tiles',
    updateCycleInMs: 200,
    tiles: {
        verticalPerspective: verticalPerspective,
        verticalSize: tileHeight,
        horizontalSize: tileWidth,
        tilesheets: [tilesheet0, tilesheet1],
        sheetAsset: tileSheetAsset,
        tilemapKey: 'tilemap',
        layerName: 'Level',
        tilesetName: 'sokoban',
    },
    world: {
        tileSize: {
            vertical: Math.trunc(tileHeight * verticalPerspective),
            horizontal: tileWidth
        }
    },
    screenRatio: .75,
    gameWidth: 800,
    gameHeight: 600,
    colors: {
        foregroundColor: '#d6d6d6',
        highlight: '#d4fa00',
        background: '#dddddd'
    },
    html: {
        gameScene: {
            key: 'gameSceneKey',
            file: gameSceneHtml
        }
    }

};