import { PdfColor } from './../pdf-color';
import { PdfBrush } from './pdf-brush';
import { PointF, RectangleF } from './../../drawing/pdf-drawing';
import { PdfColorBlend } from './pdf-color-blend';
import { PdfBlend } from './pdf-blend';
import { PdfGradientBrush } from './pdf-gradient-brush';
import { PdfExtend } from './enum';
/**
 * `PdfRadialGradientBrush` Represent radial gradient brush.
 * @private
 */
export declare class PdfRadialGradientBrush extends PdfGradientBrush {
    /**
     * Local varaible to store the point start.
     * @private
     */
    private mPointStart;
    /**
     * Local varaible to store the radius start.
     * @private
     */
    private mRadiusStart;
    /**
     * Local varaible to store the point End.
     * @private
     */
    private mPointEnd;
    /**
     * Local varaible to store the radius End.
     * @private
     */
    private mRadiusEnd;
    /**
     * Local varaible to store the colours.
     * @private
     */
    private mColour;
    /**
     * Local varaible to store the colour blend.
     * @private
     */
    private mColourBlends;
    /**
     * Local varaible to store the blend.
     * @private
     */
    private mBlend;
    /**
     * Local varaible to store the boundaries.
     * @private
     */
    private mBoundaries;
    /**
     * Local varaible to store the dictionary properties.
     */
    private mDictionaryProperties;
    /**
     * Initializes a new instance of the `PdfRadialGradientBrush` class.
     * @public
     */
    constructor(centerStart: PointF, radiusStart: number, centerEnd: PointF, radiusEnd: number, colorStart: PdfColor, colorEnd: PdfColor);
    /**
     * Initializes a new instance of the `PdfRadialGradientBrush` class.
     * @param color1 The color1.
     * @param color2 The color2.
     */
    private initialize;
    /**
     * Gets or sets a PdfBlend that specifies positions and factors that define a custom falloff for the gradient.
     * @public
     */
    blend: PdfBlend;
    /**
     * Gets or sets a ColorBlend that defines a multicolor radial gradient.
     * @public
     */
    interpolationColors: PdfColorBlend;
    /**
     * Gets or sets the starting and ending colors of the radial gradient.
     * @public
     */
    linearColors: PdfColor[];
    /**
     * Gets or sets the rectangle.
     * @public
     */
    rectangle: RectangleF;
    /**
     * Gets or sets the value indicating whether the gradient
     *  should extend starting and ending points.
     * @public
     */
    extend: PdfExtend;
    /**
     * Sets the points.
     * @param pointStart The point start.
     * @param pointEnd The point end.
     * @param radiusStart The radius start.
     * @param radiusEnd The radius end.
     */
    private setPoints;
    /**
     * Update y co-ordinate.
     * @param y Y co-ordinate.
     */
    private updateY;
    /**
     * Initializess the shading dictionary.
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
