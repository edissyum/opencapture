import { ChildProperty } from '@syncfusion/ej2-base';
import { PointModel } from './point-model';
/**
 * Defines and processes coordinates
 */
export declare class Point extends ChildProperty<Point> {
    /**
     * Sets the x-coordinate of a position
     * @default 0
     */
    x: number;
    /**
     * Sets the y-coordinate of a position
     * @default 0
     */
    y: number;
    /**   @private  */
    static equals(point1: PointModel, point2: PointModel): boolean;
    /**
     * check whether the points are given
     */
    static isEmptyPoint(point: PointModel): boolean;
    /**   @private  */
    static transform(point: PointModel, angle: number, length: number): PointModel;
    /**   @private  */
    static findLength(s: PointModel, e: PointModel): number;
    /**   @private  */
    static findAngle(point1: PointModel, point2: PointModel): number;
    /**   @private  */
    static distancePoints(pt1: PointModel, pt2: PointModel): number;
    /**   @private  */
    static getLengthFromListOfPoints(points: PointModel[]): number;
    /**   @private  */
    static adjustPoint(source: PointModel, target: PointModel, isStart: boolean, length: number): PointModel;
    /**   @private  */
    static direction(pt1: PointModel, pt2: PointModel): string;
    /**
     * @private
     * Returns the name of class Point
     */
    getClassName(): string;
}
