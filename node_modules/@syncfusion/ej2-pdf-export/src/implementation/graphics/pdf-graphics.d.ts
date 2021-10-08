/**
 * PdfGraphics.ts class for EJ2-PDF
 */
import { PdfColorSpace, TextRenderingMode, PdfFillMode } from './enum';
import { PdfBlendMode } from './enum';
import { PdfStreamWriter } from './../input-output/pdf-stream-writer';
import { PdfPen } from './pdf-pen';
import { PdfBrush } from './brushes/pdf-brush';
import { PdfFont } from './fonts/pdf-font';
import { PdfTransformationMatrix } from './pdf-transformation-matrix';
import { PointF, SizeF, RectangleF } from './../drawing/pdf-drawing';
import { PdfStream } from './../primitives/pdf-stream';
import { PdfArray } from './../primitives/pdf-array';
import { PdfStringFormat } from './fonts/pdf-string-format';
import { PdfStringLayoutResult } from './fonts/string-layouter';
import { PdfPageLayer } from './../pages/pdf-page-layer';
import { PdfPageBase } from './../pages/pdf-page-base';
import { PdfPage } from './../pages/pdf-page';
import { PdfResources } from './pdf-resources';
import { PdfImage } from './images/pdf-image';
import { PdfAutomaticFieldInfoCollection } from './../document/automatic-fields/automatic-field-info-collection';
import { PdfTemplate } from './figures/pdf-template';
import { PdfPath } from './figures/path';
import { PdfTilingBrush } from './brushes/pdf-tiling-brush';
/**
 * `PdfGraphics` class represents a graphics context of the objects.
 * It's used for performing all the graphics operations.
 * ```typescript
 * // create a new PDF document
 * let document : PdfDocument = new PdfDocument();
 * // add a new page to the document
 * let page1 : PdfPage = document.pages.add();
 * // set the font
 * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
 * // create black brush
 * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
 * //
 * //graphics of the page
 * let page1Graphics : PdfGraphics = page1.graphics;
 * // draw the text on the page1 graphics
 * page1Graphics.drawString('Hello World', font, blackBrush, new PointF(0, 0));
 * //
 * // save the document
 * document.save('output.pdf');
 * // destroy the document
 * document.destroy();
 * ```
 */
export declare class PdfGraphics {
    /**
     * Specifies the mask of `path type values`.
     * @private
     */
    private static readonly pathTypesValuesMask;
    /**
     * Represents the `Stream writer` object.
     * @private
     */
    private pdfStreamWriter;
    /**
     * Represents the state, whether it `is saved or not`.
     * @private
     */
    private bStateSaved;
    /**
     * Represents the `Current pen`.
     * @private
     */
    private currentPen;
    /**
     * Represents the `Current brush`.
     * @private
     */
    private currentBrush;
    /**
     * Represents the `Current font`.
     * @private
     */
    private currentFont;
    /**
     * Represents the `Current font`.
     * @private
     */
    currentPage: PdfPage;
    /**
     * Represents the `Current color space`.
     * @private
     */
    private currentColorSpace;
    /**
     * The `transformation matrix` monitoring all changes with CTM.
     * @private
     */
    private transformationMatrix;
    /**
     * Stores `previous rendering mode`.
     * @private
     */
    private previousTextRenderingMode;
    /**
     * Previous `character spacing` value or 0.
     * @private
     */
    private previousCharacterSpacing;
    /**
     * Previous `word spacing` value or 0.
     * @private
     */
    private previousWordSpacing;
    /**
     * The `previously used text scaling` value.
     * @private
     */
    private previousTextScaling;
    /**
     * Event handler object to store instance of `PdfResources` class.
     * @private
     */
    private getResources;
    /**
     * Indicates whether `color space was initialized`.
     * @private
     */
    private bCSInitialized;
    /**
     * Represents the `Size of the canvas`.
     * @private
     */
    private canvasSize;
    /**
     * Represents the size of the canvas reduced by `margins and templates`.
     * @private
     */
    clipBounds: RectangleF;
    /**
     * Current `string format`.
     * @private
     */
    private currentStringFormat;
    /**
     * Instance of `ProcedureSets` class.
     * @private
     */
    private procedureSets;
    /**
     * To check wihether it is a `direct text rendering`.
     * @default true
     * @private
     */
    private isNormalRender;
    /**
     * check whether to `use font size` to calculate the shift.
     * @default false
     * @private
     */
    private isUseFontSize;
    /**
     * check whether the font is in `italic type`.
     * @default false
     * @private
     */
    private isItalic;
    /**
     * Check whether it is an `emf Text Matrix`.
     * @default false
     * @private
     */
    isEmfTextScaled: boolean;
    /**
     * Check whether it is an `emf` call.
     * @default false
     * @private
     */
    isEmf: boolean;
    /**
     * Check whether it is an `emf plus` call.
     * @default false
     * @private
     */
    isEmfPlus: boolean;
    /**
     * Check whether it is in `base line format`.
     * @default true
     * @private
     */
    isBaselineFormat: boolean;
    /**
     * Emf Text `Scaling Factor`.
     * @private
     */
    emfScalingFactor: SizeF;
    /**
     * Internal variable to store `layout result` after drawing string.
     * @private
     */
    private pdfStringLayoutResult;
    /**
     * Internal variable to store `layer` on which this graphics lays.
     * @private
     */
    private pageLayer;
    /**
     * To check whether the `last color space` of document and garphics is saved.
     * @private
     */
    private colorSpaceChanged;
    /**
     * Media box upper right `bound`.
     * @hidden
     * @private
     */
    private internalMediaBoxUpperRightBound;
    /**
     * Holds instance of PdfArray as `cropBox`.
     * @private
     */
    cropBox: PdfArray;
    /**
     * Checks whether the object is `transparencyObject`.
     * @hidden
     * @private
     */
    private static transparencyObject;
    /**
     * Stores an instance of `DictionaryProperties`.
     * @private
     */
    private dictionaryProperties;
    /**
     * `last document colorspace`.
     * @hidden
     * @private
     */
    private lastDocumentCS;
    /**
     * `last graphics's colorspace`.
     * @hidden
     * @private
     */
    private lastGraphicsCS;
    /**
     * Checks whether the x co-ordinate is need to set as client size or not.
     * @hidden
     * @private
     */
    private isOverloadWithPosition;
    /**
     * Checks whether the x co-ordinate is need to set as client size or not.
     * @hidden
     * @private
     */
    private isPointOverload;
    /**
     * Current colorspaces.
     * @hidden
     * @private
     */
    private currentColorSpaces;
    /**
     * Checks the current image `is optimized` or not.
     * @default false.
     * @private
     */
    isImageOptimized: boolean;
    /**
     * Returns the `current graphics state`.
     * @private
     */
    private gState;
    /**
     * Stores the `graphics states`.
     * @private
     */
    private graphicsState;
    /**
     * Stores the `trasparencies`.
     * @private
     */
    private trasparencies;
    /**
     * Indicates whether the object `had trasparency`.
     * @default false
     * @private
     */
    private istransparencySet;
    /**
     * Stores the instance of `PdfAutomaticFieldInfoCollection` class .
     * @default null
     * @private
     */
    private internalAutomaticFields;
    /**
     * Stores shift value for draw string with `PointF` overload.
     * @private
     * @hidden
     */
    private shift;
    /**
     * Stores the index of the start line that should draw with in the next page.
     * @private
     */
    private startCutIndex;
    /**
     * Returns the `result` after drawing string.
     * @private
     */
    readonly stringLayoutResult: PdfStringLayoutResult;
    /**
     * Gets the `size` of the canvas.
     * @private
     */
    readonly size: SizeF;
    /**
     * Gets and Sets the value of `MediaBox upper right bound`.
     * @private
     */
    mediaBoxUpperRightBound: number;
    /**
     * Gets the `size` of the canvas reduced by margins and page templates.
     * @private
     */
    readonly clientSize: SizeF;
    /**
     * Gets or sets the current `color space` of the document
     * @private
     */
    colorSpace: PdfColorSpace;
    /**
     * Gets the `stream writer`.
     * @private
     */
    readonly streamWriter: PdfStreamWriter;
    /**
     * Gets the `transformation matrix` reflecting current transformation.
     * @private
     */
    readonly matrix: PdfTransformationMatrix;
    /**
     * Gets the `layer` for the graphics, if exists.
     * @private
     */
    readonly layer: PdfPageLayer;
    /**
     * Gets the `page` for this graphics, if exists.
     * @private
     */
    readonly page: PdfPageBase;
    readonly automaticFields: PdfAutomaticFieldInfoCollection;
    /**
     * Initializes a new instance of the `PdfGraphics` class.
     * @private
     */
    constructor(size: SizeF, resources: GetResourceEventHandler, writer: PdfStreamWriter);
    /**
     * Initializes a new instance of the `PdfGraphics` class.
     * @private
     */
    constructor(size: SizeF, resources: GetResourceEventHandler, stream: PdfStream);
    /**
     * `Initializes` this instance.
     * @private
     */
    initialize(): void;
    /**
     * `Draw the template`.
     * @private
     */
    drawPdfTemplate(template: PdfTemplate, location: PointF): void;
    drawPdfTemplate(template: PdfTemplate, location: PointF, size: SizeF): void;
    /**
     * `Draws the specified text` at the specified location and size with string format.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // add a pages to the document
     * let page1 : PdfPage = document.pages.add();
     * // set font
     * let font : PdfStandardFont = new PdfStandardFont(PdfFontFamily.Helvetica, 20);
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(255, 0, 0));
     * // set brush
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // set rectangle bounds
     * let rectangle : RectangleF = new RectangleF({x : 10, y : 10}, {width : 200, height : 200});
     * // set the format for string
     * let stringFormat : PdfStringFormat = new PdfStringFormat();
     * // set the text alignment
     * stringFormat.alignment = PdfTextAlignment.Center;
     * // set the vertical alignment
     * stringFormat.lineAlignment = PdfVerticalAlignment.Middle;
     * //
     * // draw the text
     * page1.graphics.drawString('Hello World', font, pen, brush, rectangle, stringFormat);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param s Input text.
     * @param font Font of the text.
     * @param pen Color of the text.
     * @param brush Color of the text.
     * @param layoutRectangle RectangleF structure that specifies the bounds of the drawn text.
     * @param format String formatting information.
     */
    drawString(s: string, font: PdfFont, pen: PdfPen, brush: PdfBrush, x: number, y: number, format: PdfStringFormat): void;
    drawString(s: string, font: PdfFont, pen: PdfPen, brush: PdfBrush, x: number, y: number, width: number, height: number, format: PdfStringFormat): void;
    /**
     * `Draws a line` connecting the two points specified by the coordinate pairs.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * //
     * // draw the line
     * page1.graphics.drawLine(new PdfPen(new PdfColor(0, 0, 255)), new PointF(10, 20), new PointF(100, 200));
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen Color of the line.
     * @param point1 PointF structure that represents the first point to connect.
     * @param point2 PointF structure that represents the second point to connect.
     */
    drawLine(pen: PdfPen, point1: PointF, point2: PointF): void;
    /**
     * `Draws a line` connecting the two points specified by the coordinate pairs.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * //
     * // draw the line
     * page1.graphics.drawLine(new PdfPen(new PdfColor(0, 0, 255)), 10, 20, 100, 200);
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen Color of the line.
     * @param x1 The x-coordinate of the first point.
     * @param y1 The y-coordinate of the first point.
     * @param x2 The x-coordinate of the second point.
     * @param y2 The y-coordinate of the second point.
     */
    drawLine(pen: PdfPen, x1: number, y1: number, x2: number, y2: number): void;
    /**
     * `Draws a rectangle` specified by a pen, a coordinate pair, a width, and a height.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen for draw rectangle
     * let pen : PdfPen = new PdfPen(new PdfColor(238, 130, 238));
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, 10, 10, 50, 100);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen Color of the rectangle.
     * @param x The x-coordinate of the upper-left corner of the rectangle to draw.
     * @param y The y-coordinate of the upper-left corner of the rectangle to draw.
     * @param width Width of the rectangle to draw.
     * @param height Height of the rectangle to draw.
     */
    drawRectangle(pen: PdfPen, x: number, y: number, width: number, height: number): void;
    /**
     * `Draws a rectangle` specified by a brush, coordinate pair, a width, and a height.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create brush for draw rectangle
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(238, 130, 238));
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(brush, 10, 10, 50, 100);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param brush Color of the rectangle.
     * @param x The x-coordinate of the upper-left corner of the rectangle to draw.
     * @param y The y-coordinate of the upper-left corner of the rectangle to draw.
     * @param width Width of the rectangle to draw.
     * @param height Height of the rectangle to draw.
     */
    drawRectangle(brush: PdfBrush, x: number, y: number, width: number, height: number): void;
    /**
     * `Draws a rectangle` specified by a pen, a coordinate pair, a width, and a height.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create brush for draw rectangle
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(238, 130, 238));
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // draw rectangle
     * page1.graphics.drawRectangle(pen, brush, 10, 10, 50, 100);
     * //
     * // save the document
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen A Pen that determines the color, width, and style of the rectangle.
     * @param brush Color of the rectangle.
     * @param x The x-coordinate of the upper-left corner of the rectangle to draw.
     * @param y The y-coordinate of the upper-left corner of the rectangle to draw.
     * @param width Width of the rectangle to draw.
     * @param height Height of the rectangle to draw.
     */
    drawRectangle(pen: PdfPen, brush: PdfBrush, x: number, y: number, width: number, height: number): void;
    /**
     * `Draws the path`.
     * @private
     */
    private drawPathHelper;
    /**
     * `Draws the specified image`, using its original physical size, at the location specified by a coordinate pair.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // base64 string of an image
     * let imageString : string = '/9j/3+2w7em7HzY/KiijFw … 1OEYRUYrQ45yc5OUtz/9k=';
     * // load the image from the base64 string of original image.
     * let image : PdfBitmap = new PdfBitmap(imageString);
     * //
     * // draw the image
     * page1.graphics.drawImage(image, 10, 10);
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param image PdfImage to draw.
     * @param x The x-coordinate of the upper-left corner of the drawn image.
     * @param y The y-coordinate of the upper-left corner of the drawn image.
     */
    drawImage(image: PdfImage, x: number, y: number): void;
    /**
     * `Draws the specified image`, using its original physical size, at the location specified by a coordinate pair.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * // base64 string of an image
     * let imageString : string = '/9j/3+2w7em7HzY/KiijFw … 1OEYRUYrQ45yc5OUtz/9k=';
     * // load the image from the base64 string of original image.
     * let image : PdfBitmap = new PdfBitmap(imageString);
     * //
     * // draw the image
     * page1.graphics.drawImage(image, 0, 0, 100, 100);
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param image PdfImage to draw.
     * @param x The x-coordinate of the upper-left corner of the drawn image.
     * @param y The y-coordinate of the upper-left corner of the drawn image.
     * @param width Width of the drawn image.
     * @param height Height of the drawn image.
     */
    drawImage(image: PdfImage, x: number, y: number, width: number, height: number): void;
    /**
     * Returns `bounds` of the line info.
     * @private
     */
    getLineBounds(lineIndex: number, result: PdfStringLayoutResult, font: PdfFont, layoutRectangle: RectangleF, format: PdfStringFormat): RectangleF;
    /**
     * Creates `lay outed rectangle` depending on the text settings.
     * @private
     */
    checkCorrectLayoutRectangle(textSize: SizeF, x: number, y: number, format: PdfStringFormat): RectangleF;
    /**
     * Sets the `layer` for the graphics.
     * @private
     */
    setLayer(layer: PdfPageLayer): void;
    /**
     * Adding page number field before page saving.
     * @private
     */
    pageSave(page: PdfPage): void;
    /**
     * `Draws a layout result`.
     * @private
     */
    drawStringLayoutResult(result: PdfStringLayoutResult, font: PdfFont, pen: PdfPen, brush: PdfBrush, layoutRectangle: RectangleF, format: PdfStringFormat): void;
    /**
     * Gets the `next page`.
     * @private
     */
    getNextPage(): PdfPage;
    /**
     * `Sets the clipping` region of this Graphics to the rectangle specified by a RectangleF structure.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create PDF graphics for the page
     * let graphics : PdfGraphics = page1.graphics;
     * // set the font
     * let font : PdfFont = new PdfStandardFont(PdfFontFamily.TimesRoman, 20);
     * // create black brush
     * let blackBrush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set clipping with rectangle bounds
     * graphics.setClip(new RectangleF({x : 10, y : 80}, {width : 150 , height : 15}));
     * //
     * // draw the text after clipping
     * graphics.drawString('Text after clipping', font, blackBrush, new PointF(10, 80));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param rectangle RectangleF structure that represents the new clip region.
     */
    setClip(rectangle: RectangleF): void;
    /**
     * `Sets the clipping` region of this Graphics to the result of the specified operation combining the current clip region and the rectangle specified by a RectangleF structure.
     * @private
     */
    setClip(rectangle: RectangleF, mode: PdfFillMode): void;
    /**
     * Applies all the `text settings`.
     * @private
     */
    private applyStringSettings;
    /**
     * Calculates `shift value` if the text is vertically aligned.
     * @private
     */
    getTextVerticalAlignShift(textHeight: number, boundsHeight: number, format: PdfStringFormat): number;
    /**
     * `Draws layout result`.
     * @private
     */
    private drawLayoutResult;
    /**
     * `Draws Ascii line`.
     * @private
     */
    private drawAsciiLine;
    /**
     * Draws unicode line.
     * @private
     */
    private drawUnicodeLine;
    /**
     * Draws array of unicode tokens.
     */
    private drawUnicodeBlocks;
    /**
     * Breakes the unicode line to the words and converts symbols to glyphs.
     */
    private breakUnicodeLine;
    /**
     * Creates PdfString from the unicode text.
     */
    private getUnicodeString;
    /**
     * Converts to unicode format.
     */
    private convertToUnicode;
    /**
     * `Justifies` the line if needed.
     * @private
     */
    private justifyLine;
    /**
     * `Reset` or reinitialize the current graphic value.
     * @private
     */
    reset(size: SizeF): void;
    /**
     * Checks whether the line should be `justified`.
     * @private
     */
    private shouldJustify;
    /**
     * Emulates `Underline, Strikeout` of the text if needed.
     * @private
     */
    private underlineStrikeoutText;
    /**
     * `Creates a pen` for drawing lines in the text.
     * @private
     */
    private createUnderlineStikeoutPen;
    /**
     * Return `text rendering mode`.
     * @private
     */
    private getTextRenderingMode;
    /**
     * Returns `line indent` for the line.
     * @private
     */
    private getLineIndent;
    /**
     * Calculates shift value if the line is `horizontaly aligned`.
     * @private
     */
    private getHorizontalAlignShift;
    /**
     * Gets or sets the value that indicates `text direction` mode.
     * @private
     */
    private rightToLeft;
    /**
     * Controls all `state modifications` and react repectively.
     * @private
     */
    private stateControl;
    /**
     * Initializes the `current color space`.
     * @private
     */
    private initCurrentColorSpace;
    /**
     * Controls the `pen state`.
     * @private
     */
    private penControl;
    /**
     * Controls the `brush state`.
     * @private
     */
    private brushControl;
    /**
     * Saves the font and other `font settings`.
     * @private
     */
    private fontControl;
    /**
     * `Sets the transparency` of this Graphics with the specified value for pen.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set transparency
     * page1.graphics.setTransparency(0.5);
     * //
     * // draw the rectangle after applying transparency
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param alpha The alpha value for both pen and brush.
     */
    setTransparency(alpha: number): void;
    /**
     * `Sets the transparency` of this Graphics with the specified value for pen and brush.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * // set brush
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * //
     * // set transparency
     * page1.graphics.setTransparency(0.8, 0.2);
     * //
     * // draw the rectangle after applying transparency
     * page1.graphics.drawRectangle(pen, brush, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param alphaPen The alpha value for pen.
     * @param alphaBrush The alpha value for brush.
     */
    setTransparency(alphaPen: number, alphaBrush: number): void;
    /**
     * `Sets the transparency` of this Graphics with the specified PdfBlendMode.
     * @private
     */
    setTransparency(alphaPen: number, alphaBrush: number, blendMode: PdfBlendMode): void;
    /**
     * Sets the `drawing area and translates origin`.
     * @private
     */
    clipTranslateMargins(clipBounds: RectangleF): void;
    clipTranslateMargins(x: number, y: number, left: number, top: number, right: number, bottom: number): void;
    /**
     * `Updates y` co-ordinate.
     * @private
     */
    updateY(y: number): number;
    /**
     * Used to `translate the transformation`.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set translate transform
     * page1.graphics.translateTransform(100, 100);
     * //
     * // draw the rectangle after applying translate transform
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 0, y : 0}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param offsetX The x-coordinate of the translation.
     * @param offsetY The y-coordinate of the translation.
     */
    translateTransform(offsetX: number, offsetY: number): void;
    /**
     * `Translates` coordinates of the input matrix.
     * @private
     */
    private getTranslateTransform;
    /**
     * Applies the specified `scaling operation` to the transformation matrix of this Graphics by prepending it to the object's transformation matrix.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // apply scaling trasformation
     * page1.graphics.scaleTransform(1.5, 2);
     * //
     * // draw the rectangle after applying scaling transform
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param scaleX Scale factor in the x direction.
     * @param scaleY Scale factor in the y direction.
     */
    scaleTransform(scaleX: number, scaleY: number): void;
    /**
     * `Scales` coordinates of the input matrix.
     * @private
     */
    private getScaleTransform;
    /**
     * Applies the specified `rotation` to the transformation matrix of this Graphics.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // set RotateTransform with 25 degree of angle
     * page1.graphics.rotateTransform(25);
     * //
     * // draw the rectangle after RotateTransformation
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param angle Angle of rotation in degrees.
     */
    rotateTransform(angle: number): void;
    /**
     * `Initializes coordinate system`.
     * @private
     */
    initializeCoordinates(): void;
    /**
     * `Rotates` coordinates of the input matrix.
     * @private
     */
    private getRotateTransform;
    /**
     * `Saves` the current state of this Graphics and identifies the saved state with a GraphicsState.
     * ```typescript
     * // create a new PDF document
     * let document : PdfDocument = new PdfDocument();
     * // create a new page
     * let page1 : PdfPage = document.pages.add();
     * // create pen
     * let pen : PdfPen = new PdfPen(new PdfColor(0, 0, 0));
     * //
     * // save the graphics state
     * let state1 : PdfGraphicsState = page1.graphics.save();
     * //
     * page1.graphics.scaleTransform(1.5, 2);
     * // draw the rectangle
     * page1.graphics.drawRectangle(pen, new RectangleF({x : 100, y : 100}, {width : 100, height : 50}));
     * // restore the graphics state
     * page1.graphics.restore(state1);
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     */
    save(): PdfGraphicsState;
    /**
     * `Restores the state` of this Graphics to the state represented by a GraphicsState.
     * @private
     */
    restore(): void;
    /**
     * `Restores the state` of this Graphics to the state represented by a GraphicsState.
     * @private
     */
    restore(state: PdfGraphicsState): void;
    /**
     * `Restores graphics state`.
     * @private
     */
    private doRestoreState;
    /**
     * `Draws the specified path`, using its original physical size, at the location specified by a coordinate pair.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * //Create new PDF path.
     * let path : PdfPath = new PdfPath();
     * //Add line path points.
     * path.addLine(new PointF(10, 100), new PointF(10, 200));
     * path.addLine(new PointF(100, 100), new PointF(100, 200));
     * path.addLine(new PointF(100, 200), new PointF(55, 150));
     * // set pen
     * let pen : PdfPen = new PdfPen(new PdfColor(255, 0, 0));
     * // set brush
     * let brush : PdfSolidBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
     * // draw the path
     * page1.graphics.drawPath(pen, brush, path);
     * //
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param pen Color of the text.
     * @param brush Color of the text.
     * @param path Draw path.
     */
    drawPath(pen: PdfPen, brush: PdfBrush, path: PdfPath): void;
    /**
     * `Draws the specified arc`, using its original physical size, at the location specified by a coordinate pair.
     * ```typescript
     * // create a new PDF document.
     * let document : PdfDocument = new PdfDocument();
     * // add a page to the document.
     * let page1 : PdfPage = document.pages.add();
     * let pen : PdfPen = new PdfPen(new PdfColor(255, 0, 0));
     * // draw the path
     * page1.graphics.drawArc(pen, 10, 10, 100, 200, 90, 270);
     * // save the document.
     * document.save('output.pdf');
     * // destroy the document
     * document.destroy();
     * ```
     * @param name Pen that determines the color, width, and style of the arc.
     * @param rectangle RectangleF structure that defines the boundaries of the ellipse.
     * @param startAngle Angle in degrees measured clockwise from the x-axis to the starting point of the arc.
     * @param sweepAngle Angle in degrees measured clockwise from the startAngle parameter to ending point of the arc.
     */
    drawArc(pen: PdfPen, rectangle: RectangleF, startAngle: number, sweepAngle: number): void;
    drawArc(pen: PdfPen, x: number, y: number, width: number, height: number, startAngle: number, sweepAngle: number): void;
    /**
     * Builds up the path.
     * @private
     */
    private buildUpPath;
    /**
     * Gets the bezier points from respective arrays.
     * @private
     */
    private getBezierPoints;
    /**
     * Checks path point type flags.
     * @private
     */
    private checkFlags;
    /**
     * Constructs the arc path using Bezier curves.
     * @private
     */
    private constructArcPath;
    /**
     * Gets the bezier points for arc constructing.
     * @private
     */
    private getBezierArc;
}
/**
 * `GetResourceEventHandler` class is alternate for event handlers and delegates.
 * @private
 * @hidden
 */
export declare class GetResourceEventHandler {
    /**
     * Return the instance of `PdfResources` class.
     * @private
     */
    getResources(): PdfResources;
    /**
     * Variable to store instance of `PdfPageBase as sender`.
     * @hidden
     * @private
     */
    sender: PdfPageBase | PdfTemplate | PdfTilingBrush;
    /**
     * Initialize instance of `GetResourceEventHandler` class.
     * Alternate for event handlers and delegates.
     * @private
     */
    constructor(sender: PdfPageBase | PdfTemplate | PdfTilingBrush);
}
export declare class PdfGraphicsState {
    /**
     * `Parent graphics` object.
     * @private
     */
    private pdfGraphics;
    /**
     * The current `transformation matrix`.
     * @private
     */
    private transformationMatrix;
    /**
     * Stores `previous rendering mode`.
     * @default TextRenderingMode.Fill
     * @private
     */
    private internalTextRenderingMode;
    /**
     * `Previous character spacing` value or 0.
     * @default 0.0
     * @private
     */
    private internalCharacterSpacing;
    /**
     * `Previous word spacing` value or 0.
     * @default 0.0
     * @private
     */
    private internalWordSpacing;
    /**
     * The previously used `text scaling value`.
     * @default 100.0
     * @private
     */
    private internalTextScaling;
    /**
     * `Current pen`.
     * @private
     */
    private pdfPen;
    /**
     * `Current brush`.
     * @private
     */
    private pdfBrush;
    /**
     * `Current font`.
     * @private
     */
    private pdfFont;
    /**
     * `Current color space`.
     * @default PdfColorSpace.Rgb
     * @private
     */
    private pdfColorSpace;
    /**
     * Gets the parent `graphics object`.
     * @private
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets the `current matrix`.
     * @private
     */
    readonly matrix: PdfTransformationMatrix;
    /**
     * Gets or sets the `current character spacing`.
     * @private
     */
    characterSpacing: number;
    /**
     * Gets or sets the `word spacing` value.
     * @private
     */
    wordSpacing: number;
    /**
     * Gets or sets the `text scaling` value.
     * @private
     */
    textScaling: number;
    /**
     * Gets or sets the `current pen` object.
     * @private
     */
    pen: PdfPen;
    /**
     * Gets or sets the `brush`.
     * @private
     */
    brush: PdfBrush;
    /**
     * Gets or sets the `current font` object.
     * @private
     */
    font: PdfFont;
    /**
     * Gets or sets the `current color space` value.
     * @private
     */
    colorSpace: PdfColorSpace;
    /**
     * Gets or sets the `text rendering mode`.
     * @private
     */
    textRenderingMode: TextRenderingMode;
    /**
     * `default constructor`.
     * @private
     */
    constructor();
    /**
     * Creates new object for `PdfGraphicsState`.
     * @private
     */
    constructor(graphics: PdfGraphics, matrix: PdfTransformationMatrix);
}
