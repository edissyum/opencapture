import { PointModel } from './point-model';
/**
 * Rect defines and processes rectangular regions
 */
export declare class Rect {
    /**
     * Sets the x-coordinate of the starting point of a rectangular region
     * @default 0
     */
    x: number;
    /**
     * Sets the y-coordinate of the starting point of a rectangular region
     * @default 0
     */
    y: number;
    /**
     * Sets the width of a rectangular region
     * @default 0
     */
    width: number;
    /**
     * Sets the height of a rectangular region
     * @default 0
     */
    height: number;
    constructor(x?: number, y?: number, width?: number, height?: number);
    /**   @private  */
    static empty: Rect;
    /**   @private  */
    readonly left: number;
    /**   @private  */
    readonly right: number;
    /**   @private  */
    readonly top: number;
    /**   @private  */
    readonly bottom: number;
    /**   @private  */
    readonly topLeft: PointModel;
    /**   @private  */
    readonly topRight: PointModel;
    /**   @private  */
    readonly bottomLeft: PointModel;
    /**   @private  */
    readonly bottomRight: PointModel;
    /**   @private  */
    readonly middleLeft: PointModel;
    /**   @private  */
    readonly middleRight: PointModel;
    /**   @private  */
    readonly topCenter: PointModel;
    /**   @private  */
    readonly bottomCenter: PointModel;
    /**   @private  */
    readonly center: PointModel;
    /**   @private  */
    equals(rect1: Rect, rect2: Rect): boolean;
    /**   @private  */
    uniteRect(rect: Rect): Rect;
    /**   @private  */
    unitePoint(point: PointModel): void;
    intersection(rect: Rect): Rect;
    /**   @private  */
    Inflate(padding: number): Rect;
    /**   @private  */
    intersects(rect: Rect): boolean;
    /**   @private  */
    containsRect(rect: Rect): boolean;
    /**   @private  */
    containsPoint(point: PointModel, padding?: number): boolean;
    toPoints(): PointModel[];
    /**   @private  */
    static toBounds(points: PointModel[]): Rect;
    scale(scaleX: number, scaleY: number): void;
    offset(offsetX: number, offsetY: number): void;
}
