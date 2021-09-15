import { PdfColor } from './../pdf-color';
import { PdfBrush } from './pdf-brush';
import { PointF, Rectangle } from './../../drawing/pdf-drawing';
import { PdfColorBlend } from './pdf-color-blend';
import { PdfBlend } from './pdf-blend';
import { PdfGradientBrush } from './pdf-gradient-brush';
import { PdfExtend, PdfLinearGradientMode } from './enum';
/**
 * `PdfLinearGradientBrush` Implements linear gradient brush by using PDF axial shading pattern.
 * @private
 */
export declare class PdfLinearGradientBrush extends PdfGradientBrush {
    /**
     * Local variable to store the point start.
     * @private
     */
    private mPointStart;
    /**
     * Local variable to store the point end.
     */
    private mPointEnd;
    /**
     * Local variable to store the colours.
     */
    private mColours;
    /**
     * Local variable to store the colour Blend.
     */
    private mColourBlend;
    /**
     * Local variable to store the blend.
     * @private
     */
    private mBlend;
    /**
     * Local variable to store the boundaries.
     * @private
     */
    private mBoundaries;
    /**
     * Local variable to store the dictionary properties.
     * @private
     */
    private mDictionaryProperties;
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @public
     */
    constructor(point1: PointF, point2: PointF, color1: PdfColor, color2: PdfColor);
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @public
     */
    constructor(rect: Rectangle, color1: PdfColor, color2: PdfColor, mode: PdfLinearGradientMode);
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @public
     */
    constructor(rect: Rectangle, color1: PdfColor, color2: PdfColor, angle: number);
    /**
     * Initializes a new instance of the `PdfLinearGradientBrush` class.
     * @param color1 The starting color of the gradient.
     * @param color2 The end color of the gradient.
     */
    private initialize;
    /**
     * Gets or sets a PdfBlend that specifies positions
     * and factors that define a custom falloff for the gradient.
     * @public
     */
    blend: PdfBlend;
    /**
     * Gets or sets a ColorBlend that defines a multicolor linear gradient.
     * @public
     */
    interpolationColors: PdfColorBlend;
    /**
     * Gets or sets the starting and ending colors of the gradient.
     * @public
     */
    linearColors: PdfColor[];
    /**
     * Gets a rectangular region that defines the boundaries of the gradient.
     * @public
     */
    readonly rectangle: Rectangle;
    /**
     * Gets or sets the value indicating whether the gradient should extend starting and ending points.
     * @public
     */
    extend: PdfExtend;
    /**
     * Adds two points to each other.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    private addPoints;
    /**
     * Subs the second point from the first one.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    private subPoints;
    /**
     * Makes scalar multiplication of two points.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    private mulPoints;
    /**
     * Multiplies the point by the value specified.
     * @param point The point1.
     * @param value The value.
     */
    private mulPoint;
    /**
     * Choose the point according to the angle.
     * @param angle The angle.
     */
    private choosePoint;
    /**
     * Sets the start and end points.
     * @param point1 The point1.
     * @param point2 The point2.
     */
    private setPoints;
    /**
     * Updates y co-ordinate.
     * @param y Y co-ordinate..
     */
    private updateY;
    /**
     * Initializes the shading dictionary.
     * @private
     */
    private initShading;
    /**
     * Creates a new copy of a brush.
     * @public
     */
    clone(): PdfBrush;
    /**
     * Resets the function.
     * @public
     */
    resetFunction(): void;
}
