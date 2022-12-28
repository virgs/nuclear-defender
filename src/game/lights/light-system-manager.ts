import {Point} from '@/game/math/point';
import type {Box} from '@/game/actors/box';
import {Target} from '@/game/actors/target';
import type {Hero} from '@/game/actors/hero';

export class LightSystemManager {
    private readonly featuresMap: { staticMap: Phaser.GameObjects.Sprite[][]; hero: Hero; boxes: Box[]; targets: Target[] };
    private readonly shadowCasters: Phaser.GameObjects.Sprite[];
    private readonly graphics: Phaser.GameObjects.Graphics;
    private movementDetectionEnabled: boolean;
    private scene: Phaser.Scene;
    private targets: Target[];

    constructor(input: { featuresMap: { staticMap: Phaser.GameObjects.Sprite[][]; hero: Hero; boxes: Box[]; targets: Target[], walls: Phaser.GameObjects.Sprite[] }; scene: Phaser.Scene }) {
        this.featuresMap = input.featuresMap;
        this.graphics = input.scene.add.graphics();
        this.scene = input.scene;
        this.targets = input.featuresMap.targets

        input.scene.lights.enable();
        input.scene.lights.enable().setAmbientColor(0x555555);
        this.movementDetectionEnabled = false;
        this.shadowCasters = [...input.featuresMap.walls as Phaser.GameObjects.Sprite[], ...this.featuresMap.boxes.map(box => box.getSprite(), input.featuresMap.hero)];
    }

    public update() {
        return
        this.graphics.clear();
        this.graphics.fillStyle(0x9aff26, .15);
        this.graphics.setBlendMode(Phaser.BlendModes.LUMINOSITY);
        this.targets.forEach(target => {
            this.createLightPolygon(target);
        });
        // this.light.getPoint(10)


        // const mask = this.scene.make.image({
        //     x: this.sprite.x,
        //     y: this.sprite.y,
        //     key: 'blur',
        //     add: false
        // });

        //        const mask = this.make.image({
        //             x: game.config.width / 2,
        //             y: game.config.height / 2,
        //             key: 'mask',
        //             add: false
        //         });
        //
        //         const bunny = this.make.sprite({
        //             x: game.config.width / 2,
        //             y: game.config.height / 2,
        //             key: 'bunny',
        //             add: true
        //         });
        //
        //         bunny.mask = new Phaser.Display.Masks.BitmapMask(this, mask);
        //

    }

    public setMask(scene: Phaser.Scene, floors: Phaser.GameObjects.Sprite[]) {
        const bitmapMask = new Phaser.Display.Masks.BitmapMask(scene, this.graphics);
        floors.forEach(floor => {
            // floor.createBitmapMask(bitmapMask);
            // floor.mask = bitmapMask;
            // floor.mask = new Phaser.Display.Masks.BitmapMask(scene, floor);

        });
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

    private createLightPolygon(target: Target) {
        let values: any[] = [];
        const targetPosition = target.getPosition();
        this.shadowCasters
            .filter(shadowCaster =>
                shadowCaster.getCenter()
                    .distance(targetPosition) < Target.radius)
            .forEach(shadowCaster => {
                const bottomLeft = shadowCaster.getBottomLeft();
                const bottomRight = shadowCaster.getBottomRight();
                const topLeft = shadowCaster.getTopLeft();
                const topRight = shadowCaster.getTopRight();
                const corners = [bottomRight, bottomLeft, topRight, topLeft];
                const reduce = corners.reduce((acc, item) => {
                    let angle = Phaser.Math.RadToDeg(
                        Phaser.Math.Angle.Between(
                            targetPosition.x, targetPosition.y,
                            item.x, item.y));
                    angle = (angle + 360) % 360;
                    if (angle > acc.max.value) {
                        acc.max.value = angle;
                        acc.max.point = new Point(item.x, item.y);
                    }
                    if (angle < acc.min.value) {
                        acc.min.value = angle;
                        acc.min.point = new Point(item.x, item.y);
                    }

                    return acc;
                }, {min: {value: Infinity, point: new Point(0, 0)}, max: {value: -Infinity, point: new Point(0, 0)}});

                values.push(reduce);

                // ---- triangles
                this.graphics.beginPath();
                this.graphics.moveTo(targetPosition.x, targetPosition.y);
                this.graphics.lineTo(reduce.min.point.x, reduce.min.point.y);
                this.graphics.lineTo(reduce.max.point.x, reduce.max.point.y);
                this.graphics.lineTo(targetPosition.x, targetPosition.y);
                this.graphics.fillPath();
                this.graphics.closePath();

            });
        // return
        values = values.sort((a, b) => a.min.value - b.min.value);

        // --- arcos
        this.graphics.beginPath();
        this.graphics.moveTo(targetPosition.x, targetPosition.y);
        this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
            Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(values[0].min.value), false);
        let maxAngle = values[0].min.value;
        // console.log(values.length)
        // console.log(0, values[0].min.value);
        for (let index = 1; index < values.length; ++index) {
            let min = values[index - 1].max.value;
            let max = values[index].min.value;
            if (min >= max) {
                const swap = max;
                max = min;
                min = swap;
            }
            if (max <= maxAngle) {
                // continue
            }
            if (min <= maxAngle) {
                // min = maxAngle
                // continue
            }
            this.graphics.moveTo(targetPosition.x, targetPosition.y);
            this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
                Phaser.Math.DegToRad(min),
                Phaser.Math.DegToRad(max), false);
            maxAngle = max;
            // console.log(min, max);
        }
        this.graphics.moveTo(targetPosition.x, targetPosition.y);
        this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
            Phaser.Math.DegToRad(maxAngle), Phaser.Math.DegToRad(360), false);
        this.graphics.closePath();
        this.graphics.fillPath();

    }
}