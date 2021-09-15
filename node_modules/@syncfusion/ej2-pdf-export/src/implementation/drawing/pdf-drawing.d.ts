/**
 * Coordinates of Position for `PointF`.
 * @private
 */
export declare class PointF {
    /**
     * Value of `X`.
     * @private
     */
    x: number;
    /**
     * Value of `Y`.
     * @private
     */
    y: number;
    /**
     * Instance of `PointF` class.
     * @private
     */
    constructor();
    /**
     * Instance of `PointF` class with X, Y co-ordinates.
     * @private
     */
    constructor(x: number, y: number);
}
/**
 * Width and Height as `Size`.
 * @private
 */
export declare class SizeF {
    /**
     * Value of ``Height``.
     * @private
     */
    height: number;
    /**
     * Value of `Width`.
     * @private
     */
    width: number;
    /**
     * Instance of `SizeF` class.
     * @private
     */
    constructor();
    /**
     * Instance of `SizeF` class with Width and Height.
     * @private
     */
    constructor(width: number, height: number);
}
/**
 * `RectangleF` with Position and size.
 * @private
 */
export declare class RectangleF {
    /**
     * Value of `X`.
     * @private
     */
    x: number;
    /**
     * Value of `Y`.
     * @private
     */
    y: number;
    /**
     * Value of `Height`.
     * @private
     */
    height: number;
    /**
     * Value of `Width`.
     * @private
     */
    width: number;
    /**
     * Instance of `RectangleF` class.
     * @private
     */
    constructor();
    /**
     * Instance of `RectangleF` class with X, Y, Width and Height.
     * @private
     */
    constructor(x: number, y: number, height: number, width: number);
    /**
     * Instance of `RectangleF` class with PointF, SizeF.
     * @private
     */
    constructor(pointF: PointF, sizeF: SizeF);
}
/**
 * `Rectangle` with left, right, top and bottom.
 * @private
 */
export declare class Rectangle {
    /**
     * Value of `left`.
     * @private
     */
    left: number;
    /**
     * Value of `top`.
     * @private
     */
    top: number;
    /**
     * Value of `right`.
     * @private
     */
    right: number;
    /**
     * Value of `bottom`.
     * @private
     */
    bottom: number;
    /**
     * Instance of `RectangleF` class with X, Y, Width and Height.
     * @private
     */
    constructor(left: number, top: number, right: number, bottom: number);
    /**
     * Gets a value of width
     */
    readonly width: number;
    /**
     * Gets a value of height
     */
    readonly height: number;
    /**
     * Gets a value of Top and Left
     */
    readonly topLeft: PointF;
    /**
     * Gets a value of size
     */
    readonly size: SizeF;
    toString(): string;
}
