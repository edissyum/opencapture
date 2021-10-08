import { PdfColorSpace } from './enum';
import { PdfArray } from './../primitives/pdf-array';
/**
 * Implements structures and routines working with `color`.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * //
 * // set color
 * let brushColor : PdfColor = new PdfColor(0, 0, 0);
 * //
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(brushColor);
 * // draw the text
 * page1.graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 * @default black color
 */
export declare class PdfColor {
    /**
     * Holds `RGB colors` converted into strings.
     * @private
     */
    private static rgbStrings;
    /**
     * Holds Gray scale colors converted into strings for `stroking`.
     * @private
     */
    private static grayStringsSroke;
    /**
     * Holds Gray scale colors converted into strings for `filling`.
     * @private
     */
    private static grayStringsFill;
    /**
     * Value of `Red` channel.
     * @private
     */
    private redColor;
    /**
     * Value of `Cyan` channel.
     * @private
     */
    private cyanColor;
    /**
     * Value of `Green` channel.
     * @private
     */
    private greenColor;
    /**
     * Value of `Magenta` channel.
     * @private
     */
    private magentaColor;
    /**
     * Value of `Blue` channel.
     * @private
     */
    private blueColor;
    /**
     * Value of `Yellow` channel.
     * @private
     */
    private yellowColor;
    /**
     * Value of `Black` channel.
     * @private
     */
    private blackColor;
    /**
     * Value of `Gray` channel.
     * @private
     */
    private grayColor;
    /**
     * `Alpha` channel.
     * @private
     */
    private alpha;
    /**
     * Shows if the color `is empty`.
     * @private
     */
    private filled;
    /**
     * `Max value` of color channel.
     * @private
     */
    static readonly maxColourChannelValue: number;
    /**
     * Initialize a new instance for `PdfColor` class.
     */
    constructor();
    constructor(color1: PdfColor);
    constructor(color1: number);
    constructor(color1: number, color2: number, color3: number);
    constructor(color1: number, color2: number, color3: number, color4: number);
    /**
     * `Assign` red, green, blue colors with alpha value..
     * @private
     */
    private assignRGB;
    /**
     * `Calculate and assign` cyan, megenta, yellow colors from rgb values..
     * @private
     */
    private assignCMYK;
    /**
     * Gets or sets `Red` channel value.
     * @private
     */
    r: number;
    /**
     * Gets the `Red` color
     * @private
     */
    readonly red: number;
    /**
     * Gets or sets `Blue` channel value.
     * @private
     */
    b: number;
    /**
     * Gets the `blue` color.
     * @private
     */
    readonly blue: number;
    /**
     * Gets or sets `Cyan` channel value.
     * @private
     */
    c: number;
    /**
     * Gets or sets `Black` channel value.
     * @private
     */
    k: number;
    /**
     * Gets or sets `Magenta` channel value.
     * @private
     */
    m: number;
    /**
     * Gets or sets `Yellow` channel value.
     * @private
     */
    y: number;
    /**
     *  Gets or sets `Green` channel value.
     * @private
     */
    g: number;
    /**
     * Gets the `Green` color.
     * @private
     */
    readonly green: number;
    /**
     * Gets or sets `Gray` channel value.
     * @private
     */
    gray: number;
    /**
     * Gets whether the PDFColor `is Empty` or not.
     * @private
     */
    readonly isEmpty: boolean;
    /**
     * Gets or sets `Alpha` channel value.
     * @private
     */
    a: number;
    /**
     * Converts `PDFColor to PDF string` representation.
     * @private
     */
    toString(colorSpace: PdfColorSpace, stroke: boolean): string;
    /**
     * Sets `GrayScale` color.
     * @private
     */
    private grayScaleToString;
    /**
     * Sets `RGB` color.
     * @private
     */
    private rgbToString;
    /***
     * Sets `CMYK` color.
     * @private
     */
    private cmykToString;
    /**
     * Converts `colour to a PDF array`.
     * @private
     */
    toArray(colorSpace: PdfColorSpace): PdfArray;
}
