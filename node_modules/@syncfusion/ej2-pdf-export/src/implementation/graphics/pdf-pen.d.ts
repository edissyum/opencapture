/**
 * PdfPen.ts class for EJ2-PDF
 */
import { PdfColor } from './pdf-color';
import { PdfDashStyle, PdfLineCap, PdfLineJoin, PdfColorSpace } from './enum';
import { PdfBrush } from './brushes/pdf-brush';
import { GetResourceEventHandler } from './pdf-graphics';
import { PdfTransformationMatrix } from './pdf-transformation-matrix';
import { PdfStreamWriter } from './../input-output/pdf-stream-writer';
/**
 * `PdfPen` class defining settings for drawing operations, that determines the color,
 * width, and style of the drawing elements.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // create a new page
 * let page1 : PdfPage = document.pages.add();
 * // set pen
 * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
 * // draw rectangle
 * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
 * // save the document.
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfPen {
    /**
     * Specifies the `color of the pen`.
     * @default new PdfColor()
     * @private
     */
    private pdfColor;
    /**
     * Specifies the `dash offset of the pen`.
     * @default 0
     * @private
     */
    private dashOffsetValue;
    /**
     * Specifies the `dash pattern of the pen`.
     * @default [0]
     * @private
     */
    private penDashPattern;
    /**
     * Specifies the `dash style of the pen`.
     * @default Solid
     * @private
     */
    private pdfDashStyle;
    /**
     * Specifies the `line cap of the pen`.
     * @default 0
     * @private
     */
    private pdfLineCap;
    /**
     * Specifies the `line join of the pen`.
     * @default 0
     * @private
     */
    private pdfLineJoin;
    /**
     * Specifies the `width of the pen`.
     * @default 1.0
     * @private
     */
    private penWidth;
    /**
     * Specifies the `brush of the pen`.
     * @private
     */
    private pdfBrush;
    /**
     * Specifies the `mitter limit of the pen`.
     * @default 0.0
     * @private
     */
    private internalMiterLimit;
    /**
     * Stores the `colorspace` value.
     * @default Rgb
     * @private
     */
    private colorSpace;
    /**
     * Initializes a new instance of the `PdfPen` class with color.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * //
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param color Color of the pen.
     */
    constructor(color: PdfColor);
    /**
     * Initializes a new instance of the `PdfPen` class with 'PdfBrush' class and width of the pen.
     * @private
     */
    constructor(brush: PdfBrush, width: number);
    /**
     * Initializes a new instance of the `PdfPen` class with color and width of the pen.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * //
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0), 2);
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param color Color of the pen.
     * @param width Width of the pen's line.
     */
    constructor(color: PdfColor, width: number);
    /**
     * Gets or sets the `color of the pen`.
     * @private
     */
    color: PdfColor;
    /**
     * Gets or sets the `dash offset of the pen`.
     * @private
     */
    dashOffset: number;
    /**
     * Gets or sets the `dash pattern of the pen`.
     * @private
     */
    dashPattern: number[];
    /**
     * Gets or sets the `dash style of the pen`.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set pen style
     * pen.dashStyle = PdfDashStyle.DashDot;
     * // get pen style
     * let style : PdfDashStyle = pen.dashStyle;
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    dashStyle: PdfDashStyle;
    /**
     * Gets or sets the `line cap of the pen`.
     * @private
     */
    lineCap: PdfLineCap;
    /**
     * Gets or sets the `line join style of the pen`.
     * @private
     */
    lineJoin: PdfLineJoin;
    /**
     * Gets or sets the `miter limit`.
     * @private
     */
    miterLimit: number;
    /**
     * Gets or sets the `width of the pen`.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set pen width
     * pen.width = 2;
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    width: number;
    /**
     * `Clones` this instance of PdfPen class.
     * @private
     */
    clone(): PdfPen;
    /**
     * `Sets the brush`.
     * @private
     */
    private setBrush;
    /**
     * `Monitors the changes`.
     * @private
     */
    monitorChanges(currentPen: PdfPen, streamWriter: PdfStreamWriter, getResources: GetResourceEventHandler, saveState: boolean, currentColorSpace: PdfColorSpace, matrix: PdfTransformationMatrix): boolean;
    /**
     * `Controls the dash style` and behaviour of each line.
     * @private
     */
    private dashControl;
    /**
     * `Gets the pattern` of PdfPen.
     * @private
     */
    getPattern(): number[];
}
