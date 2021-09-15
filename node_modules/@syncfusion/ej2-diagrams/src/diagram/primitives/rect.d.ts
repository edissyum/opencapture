import { PointModel } from './point-model';
/**
 * Rect defines and processes rectangular regions
 */
export declare class Rect {
    /**
     * Sets the x-coordinate of the starting point of a rectangular region
     *
     * @default 0
     */
    x: number;
    /**
     * Sets the y-coordinate of the starting point of a rectangular region
     *
     * @default 0
     */
    y: number;
    /**
     * Sets the width of a rectangular region
     *
     * @default 0
     */
    width: number;
    /**
     * Sets the height of a rectangular region
     *
     * @default 0
     */
    height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
    /**   @private  */
    static empty: Rect;
    /**   @private  */
    readonly left: number;
    /**
     * right method \
     *
     * @returns { Rect } right method .\
     *
     * @private
     */
    readonly right: number;
    /**
     * toBounds method \
     *
     * @returns { Rect } toBounds method .\
     *
     * @private
     */
    readonly top: number;
    /**
     * bottom method \
     *
     * @returns { Rect } bottom method .\
     *
     * @private
     */
    readonly bottom: number;
    /**
     * topLeft method \
     *
     * @returns { Rect } topLeft method .\
     *
     * @private
     */
    readonly topLeft: PointModel;
    /**
     * topRight method \
     *
     * @returns { Rect } topRight method .\
     *
     * @private
     */
    readonly topRight: PointModel;
    /**
     * bottomLeft method \
     *
     * @returns { Rect } bottomLeft method .\
     *
     * @private
     */
    readonly bottomLeft: PointModel;
    /**
     * bottomRight method \
     *
     * @returns { Rect } bottomRight method .\
     *
     * @private
     */
    readonly bottomRight: PointModel;
    /**
     * middleLeft method \
     *
     * @returns { Rect } middleLeft method .\
     *
     * @private
     */
    readonly middleLeft: PointModel;
    /**
     * middleRight method \
     *
     * @returns { Rect } middleRight method .\
     *
     * @private
     */
    readonly middleRight: PointModel;
    /**
     * topCenter method \
     *
     * @returns { Rect } topCenter method .\
     *
     * @private
     */
    readonly topCenter: PointModel;
    /**
     * bottomCenter method \
     *
     * @returns { Rect } bottomCenter method .\
     *
     * @private
     */
    readonly bottomCenter: PointModel;
    /**
     * center method \
     *
     * @returns { PointModel } center method .\
     *
     * @private
     */
    readonly center: PointModel;
    /**
     * equals method \
     *
     * @returns { boolean } equals method .\
     * @param {Rect} rect1 - provide the rect1 value.
     * @param {Rect} rect2 - provide the rect2 value.
     *
     * @private
     */
    equals(rect1: Rect, rect2: Rect): boolean;
    /**
     * uniteRect method \
     *
     * @returns { Rect } uniteRect method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    uniteRect(rect: Rect): Rect;
    /**
     * unitePoint method \
     *
     * @returns { void } unitePoint method .\
     * @param {PointModel} point - provide the points value.
     *
     * @private
     */
    unitePoint(point: PointModel): void;
    /**
     * Inflate method \
     *
     * @returns { Rect } Inflate method .\
     * @param {number} padding - provide the points value.
     *
     * @private
     */
    Inflate(padding: number): Rect;
    /**
     * intersects method \
     *
     * @returns { boolean } intersects method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    intersects(rect: Rect): boolean;
    /**
     * containsRect method \
     *
     * @returns { boolean } containsRect method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    containsRect(rect: Rect): boolean;
    /**
     * containsPoint method \
     *
     * @returns { boolean } containsPoint method .\
     * @param {PointModel} point - provide the points value.
     * @param {number} padding - provide the padding value.
     *
     * @private
     */
    containsPoint(point: PointModel, padding?: number): boolean;
    /**
     * toBounds method \
     *
     * @returns { Rect } toBounds method .\
     * @param {PointModel[]} points - provide the points value.
     *
     * @private
     */
    static toBounds(points: PointModel[]): Rect;
}
