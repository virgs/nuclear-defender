import tilesheet0 from '@/game/assets/levels/level-0.json';
import tilesheet1 from '@/game/assets/levels/level-0.json';
import tileSheetAsset from '@/game/assets/tiles/sokoban_tilesheet.png';
import tileSheetAssetNormal from '@/game/assets/tiles/sokoban_tilessheet_normal.png';
import floorTexture from '@/game/assets/tiles/floor-texture.jpg';

const verticalPerspective = .65;
const tileHeight = 50;
const tileWidth = 40;
export const configuration = {
    frameRate: 8,
    updateCycleInMs: 175,
    floorTextureKey: 'floorTexture',
    floorTexture: floorTexture,
    tiles: { //in tile sheet
        verticalPerspective: verticalPerspective,
        verticalSize: tileHeight,
        horizontalSize: tileWidth,
        spriteSheetKey: 'tiles',
        tilesheets: [tilesheet0, tilesheet1],
        sheetAsset: tileSheetAsset,
        sheetAssetNormal: tileSheetAssetNormal,
        tilemapKey: 'tilemap',
        layerName: 'Level',
        tilesetName: 'sokoban',
    },
    world: {
        tileSize: { //after rescaling...
            vertical: Math.trunc(tileHeight * verticalPerspective),
            horizontal: tileWidth
        },
        scale: 0
    },
    screenRatio: .7,
    gameWidth: 800,
    gameHeight: 600,
    colors: {
        foregroundColor: '#d6d6d6',
        radioactive: '#d4fa00',
        controlled: '#ff3c91',
        background: '#dddddd',
        ambientColor: '#777777'
    },
    html: {
        gameScene: {}
    },
    store: {
        furthestEnabledLevelKey: 'furthestEnabledLevel'
    }
};