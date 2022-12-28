import {Point} from '@/game/math/point';
import type {Box} from '@/game/actors/box';
import {Target} from '@/game/actors/target';
import type {Hero} from '@/game/actors/hero';
import type {FeatureMap} from '@/game/tiles/feature-map-extractor';

type AngleRange = {
    min: {
        value: number,
        point: Point
    },
    max: {
        value: number,
        point: Point
    }
};

export class LightSystemManager {
    private readonly featureMap: { staticMap: Phaser.GameObjects.Sprite[][]; hero: Hero; boxes: Box[]; targets: Target[] };
    private readonly shadowCasters: Phaser.GameObjects.Sprite[];
    private readonly graphics: Phaser.GameObjects.Graphics;
    private movementDetectionEnabled: boolean;
    private scene: Phaser.Scene;

    constructor(input: { featureMap: FeatureMap; scene: Phaser.Scene }) {
        this.featureMap = input.featureMap;
        this.graphics = input.scene.add.graphics();
        this.scene = input.scene;

        input.scene.lights.enable();
        input.scene.lights.enable().setAmbientColor(0x555555);
        this.movementDetectionEnabled = false;
        this.shadowCasters = [
            // ...input.featureMap.walls as Phaser.GameObjects.Sprite[],
            ...this.featureMap.boxes.map(box => box.getSprite()),
            input.featureMap.hero.getSprite()
        ];
    }

    public update() {
        // return;
        this.graphics.clear();
        this.graphics.fillStyle(0x9aff26, .15);
        this.graphics.setBlendMode(Phaser.BlendModes.NORMAL);
        const lightPolygons = this.featureMap.targets
            .filter((_, index) => index === 1)
            .filter(target => !target.isCovered())
            .map(target => this.createLightPolygon(target));
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

    public startMovementDetection(): void {
        this.movementDetectionEnabled = true;
    }

    public stopMovementDetection(): void {
        this.movementDetectionEnabled = false;
    }

    private createLightPolygon(target: Target) {
        const targetPosition = target.getPosition();
        const shadowCastedPoints: AngleRange[] = this.shadowCasters
            .filter(shadowCaster => shadowCaster.getCenter().distance(targetPosition) < Target.radius)
            .map(shadowCaster => this.getAngleRangeOfShadowCaster(targetPosition, shadowCaster));
        const combinedCastedRanges = this.combineShadowAngleRanges(shadowCastedPoints);

        this.drawTriangles(combinedCastedRanges, targetPosition);
        this.drawArcs(combinedCastedRanges, targetPosition);
    }

    private drawTriangles(combinedCastedRanges: AngleRange[], targetPosition: Point) {
        combinedCastedRanges
            .forEach(angleRange => {
                // ---- triangles
                console.log(`triangle: ${angleRange.min.value} -> ${angleRange.max.value}`);

                this.graphics.beginPath();
                this.graphics.fillCircle(angleRange.min.point.x, angleRange.min.point.y, 10);
                this.graphics.fillCircle(angleRange.max.point.x, angleRange.max.point.y, 10);
                this.graphics.moveTo(targetPosition.x, targetPosition.y);
                this.graphics.lineTo(angleRange.min.point.x, angleRange.min.point.y);
                this.graphics.lineTo(angleRange.max.point.x, angleRange.max.point.y);
                this.graphics.lineTo(targetPosition.x, targetPosition.y);
                this.graphics.fillPath();
                this.graphics.closePath();
            });
    }

    private drawArcs(combinedCastedRanges: AngleRange[], targetPosition: Point) {
        this.graphics.beginPath();
        if (combinedCastedRanges.length <= 0) {
            this.graphics.moveTo(targetPosition.x, targetPosition.y);
            this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
                Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360));
            this.graphics.closePath();
            this.graphics.fillPath();
            return;
        }
        for (let i = 0; i < combinedCastedRanges.length - 1; ++i) {
            this.graphics.moveTo(targetPosition.x, targetPosition.y);
            this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
                Phaser.Math.DegToRad(combinedCastedRanges[i].max.value - 1), Phaser.Math.DegToRad(combinedCastedRanges[i + 1].min.value + 1));
            console.log(`arc loop: ${combinedCastedRanges[i].max.value} -> ${combinedCastedRanges[i + 1].min.value}`);
        }
        this.drawAdjustmentArc(combinedCastedRanges, targetPosition);

        this.graphics.closePath();
        this.graphics.fillPath();
        return;
    }

    private drawAdjustmentArc(combinedCastedRanges: AngleRange[], targetPosition: Point) {
        let adjustmentAngle = 0;
        const shadowCasterContainsAngleOrigin = combinedCastedRanges
            .find(range => range.max.value < range.min.value);
        if (shadowCasterContainsAngleOrigin) {
            console.log('shadowCasterContainsAngleOrigin');
            // max = shadowCasterContainsAngleOrigin.adjustmentAngle.value;
            adjustmentAngle = shadowCasterContainsAngleOrigin.max.value;
        }

        const initialAdjustmentAngle = combinedCastedRanges[0].min.value;
        const finalAdjustmentAngle = combinedCastedRanges[combinedCastedRanges.length - 1].max.value - 1;
        if (shadowCasterContainsAngleOrigin) {
            if (adjustmentAngle < initialAdjustmentAngle) {
                this.graphics.moveTo(targetPosition.x, targetPosition.y);
                this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
                    Phaser.Math.DegToRad(adjustmentAngle - 1), Phaser.Math.DegToRad(initialAdjustmentAngle + 1));
                console.log(`arc inv-adjs: ${adjustmentAngle} -> ${initialAdjustmentAngle}`);
            }
        } else {
            this.graphics.moveTo(targetPosition.x, targetPosition.y);
            this.graphics.arc(targetPosition.x, targetPosition.y, Target.radius,
                Phaser.Math.DegToRad(finalAdjustmentAngle), Phaser.Math.DegToRad(initialAdjustmentAngle + 1));
            console.log(`arc adjs: ${finalAdjustmentAngle} -> ${initialAdjustmentAngle}`);
        }
    }

    private getAngleRangeOfShadowCaster(targetPosition: Point, shadowCaster: Phaser.GameObjects.Sprite): AngleRange {
        const bottomLeft = shadowCaster.getBottomLeft();
        const bottomRight = shadowCaster.getBottomRight();
        const topLeft = shadowCaster.getTopLeft();
        const topRight = shadowCaster.getTopRight();
        const corners = [topRight, topLeft, bottomRight, bottomLeft];

        const sortedCorners = corners
            .map(corner => {
                const angle = Math.trunc(Phaser.Math.RadToDeg(
                    Phaser.Math.Angle.Between(
                        targetPosition.x, targetPosition.y,
                        corner.x, corner.y)));
                return {angle: (angle + 360) % 360, point: new Point(corner.x, corner.y)};
            })
            .sort((a, b) => a.angle - b.angle);

        let min = sortedCorners[0];
        let max = sortedCorners[3];
        if (max.angle - min.angle > 180) {
            min = sortedCorners[2];
            max = sortedCorners[1];
        }
        return {
            min: {
                value: min.angle,
                point: min.point
            },
            max: {
                value: max.angle,
                point: max.point
            }
        };
    }

    private combineShadowAngleRanges(shadowCastedPoints: AngleRange[]): AngleRange[] {
        const result: AngleRange[] = [];
        const sorted = shadowCastedPoints
            .sort((a, b) => a.min.value - b.min.value);
        console.log('precombined: ', sorted.map(a => `${a.min.value} - ${a.max.value}`));
        for (let index = 0; index < sorted.length; ++index) {
            if (result.length > 0) {
                if (result[result.length - 1].max.value > sorted[index].min.value) {
                    result[result.length - 1].max = sorted[index].max;
                } else {
                    result.push(sorted[index]);
                }
            } else {
                result.push(sorted[index]);
            }
        }
        console.log('combined: ', result.map(a => `${a.min.value} - ${a.max.value}`));
        return result;
    }
}