import type {Box} from '@/game/actors/box';
import type {Hero} from '@/game/actors/hero';
import type {Point} from '@/game/math/point';
import type {Target} from '@/game/actors/target';
import {QuadracticEuclidianDistanceCalculator} from '@/game/math/quadractic-euclidian-distance-calculator';

export class LightSystemManager {
    private movementDetectionEnabled: boolean;
    private featuresMap: { staticMap: Phaser.GameObjects.Sprite[][]; hero: Hero; boxes: Box[]; targets: Target[] };

    constructor(input: { featuresMap: { staticMap: Phaser.GameObjects.Sprite[][]; hero: Hero; boxes: Box[]; targets: Target[] }; scene: Phaser.Scene }) {
        this.featuresMap = input.featuresMap;
        input.scene.lights.enable();
        input.scene.lights.enable().setAmbientColor(0x555555);
        this.movementDetectionEnabled = false;
    }

    public update(): void {

    }

    private drawBresenham(start: Point, end: Point): void {
        const save = start.clone();
        const current = start.clone();
        const direction: Point = end.subtract(start);
        // var dx = Math.abs(x1 - x0);
        // var sx = -1;
        // if(x0 < x1){
        //     var sx = 1
        // }
        // var dy = Math.abs(y1 - y0);
        // var sy = -1;
        // if(y0 < y1){
        //     var sy = 1;
        // }
        // var err = -dy / 2;
        // if(dx > dy){
        //     err = dx / 2;
        // }


        // const quadracticEuclidianDistanceCalculator = new QuadracticEuclidianDistanceCalculator();
        // do {
        //     const dist = quadracticEuclidianDistanceCalculator.distance(current, start);
        //     if (current.x < 0 || current.y < 0 || current.x >= this.featuresMap.staticMap || y0 >= Dungeon.map_size || Dungeon.map[y0][x0] != 1 || dist > sightRadius / 2) {
        //         break;
        //     }
        //     if (this.visited.indexOf(x0 + "," + y0) == -1) {
        //         var tile = game.add.sprite(x0 * tileSize, y0 * tileSize, "tile");
        //         tile.tint = 0xffff00;
        //         tile.alpha = 1 - dist / (sightRadius / 2);
        //         this.visited.push(x0 + "," + y0);
        //         this.lineGroup.add(tile);
        //     }
        //     var e2 = err;
        //     if (e2 > -dx) {
        //         err -= dy;
        //         x0 += sx;
        //     }
        //     if (e2 < dy) {
        //         err += dx;
        //         y0 += sy;
        //     }
        // } while (x0 != x1 || y0 != y1);
    }

    public startMovementDetection(): void {
        this.movementDetectionEnabled = true;
    }

    public stopMovementDetection(): void {
        this.movementDetectionEnabled = false;
    }

}