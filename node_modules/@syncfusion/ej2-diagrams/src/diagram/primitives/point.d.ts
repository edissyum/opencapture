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
    /**
     * equals method \
     *
     * @returns { boolean } equals method .\
     * @param {PointModel} point1 - provide the point1 value.
     * @param {PointModel} point2 - provide the point1 value.
     *
     * @private
     */
    static equals(point1: PointModel, point2: PointModel): boolean;
    /**
     * isEmptyPoint method \
     *
     * @returns { boolean } isEmptyPoint method .\
     * @param {PointModel} point - provide the points value.
     *
     * @private
     */
    static isEmptyPoint(point: PointModel): boolean;
    /**
     * transform method \
     *
     * @returns { PointModel } transform method .\
     * @param {PointModel} point - provide the points value.
     * @param {number} angle - provide the points value.
     * @param {number} length - provide the points value.
     *
     * @private
     */
    static transform(point: PointModel, angle: number, length: number): PointModel;
    /**
     * findLength method \
     *
     * @returns { number } findLength method .\
     * @param {PointModel} s - provide the points value.
     * @param {PointModel} e - provide the points value.
     *
     * @private
     */
    static findLength(s: PointModel, e: PointModel): number;
    /**
     * findAngle method \
     *
     * @returns { number } findAngle method .\
     * @param {PointModel} point1 - provide the points value.
     * @param {PointModel} point2 - provide the points value.
     *
     * @private
     */
    static findAngle(point1: PointModel, point2: PointModel): number;
    /**
     * distancePoints method \
     *
     * @returns { number } distancePoints method .\
     * @param {PointModel} pt1 - provide the points value.
     * @param {PointModel} pt2 - provide the points value.
     *
     * @private
     */
    static distancePoints(pt1: PointModel, pt2: PointModel): number;
    /**
     * getLengthFromListOfPoints method \
     *
     * @returns { number } getLengthFromListOfPoints method .\
     * @param {PointModel[]} points - provide the points value.
     *
     * @private
     */
    static getLengthFromListOfPoints(points: PointModel[]): number;
    /**
     * adjustPoint method \
     *
     * @returns { PointModel } adjustPoint method .\
     * @param {PointModel} source - provide the points value.
     * @param {PointModel} target - provide the points value.
     * @param {boolean} isStart - provide the isStart value.
     * @param {number} length - provide the length value.
     *
     * @private
     */
    static adjustPoint(source: PointModel, target: PointModel, isStart: boolean, length: number): PointModel;
    /**
     * direction method \
     *
     * @returns { string } direction method .\
     * @param {PointModel} pt1 - provide the points value.
     * @param {PointModel} pt2 - provide the points value.
     *
     * @private
     */
    static direction(pt1: PointModel, pt2: PointModel): string;
    /**
     * getClassName method \
     *
     * @returns { string } getClassName method .\
     *
     * @private
     */
    getClassName(): string;
}
