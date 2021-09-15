/**
 * PdfStreamWriter.ts class for EJ2-PDF
 */
import { IPdfWriter } from './../../interfaces/i-pdf-writer';
import { PdfStream } from './../primitives/pdf-stream';
import { PointF, RectangleF } from './../drawing/pdf-drawing';
import { TextRenderingMode, PdfLineCap, PdfLineJoin, PdfColorSpace } from './../graphics/enum';
import { PdfString } from './../primitives/pdf-string';
import { PdfName } from './../primitives/pdf-name';
import { PdfFont } from './../graphics/fonts/pdf-font';
import { PdfTransformationMatrix } from './../graphics/pdf-transformation-matrix';
import { PdfColor } from './../graphics/pdf-color';
import { PdfDocument } from './../document/pdf-document';
/**
 * Helper class to `write PDF graphic streams` easily.
 * @private
 */
export declare class PdfStreamWriter implements IPdfWriter {
    /**
     * The PDF `stream` where the data should be write into.
     * @private
     */
    private stream;
    /**
     * Initialize an instance of `PdfStreamWriter` class.
     * @private
     */
    constructor(stream: PdfStream);
    /**
     * `Clear` the stream.
     * @public
     */
    clear(): void;
    /**
     * Sets the `graphics state`.
     * @private
     */
    setGraphicsState(dictionaryName: PdfName): void;
    /**
     * Sets the `graphics state`.
     * @private
     */
    setGraphicsState(dictionaryName: string): void;
    /**
     * `Executes the XObject`.
     * @private
     */
    executeObject(name: PdfName): void;
    /**
     * `Closes path object`.
     * @private
     */
    closePath(): void;
    /**
     * `Clips the path`.
     * @private
     */
    clipPath(useEvenOddRule: boolean): void;
    /**
     * `Closes, then fills and strokes the path`.
     * @private
     */
    closeFillStrokePath(useEvenOddRule: boolean): void;
    /**
     * `Fills and strokes path`.
     * @private
     */
    fillStrokePath(useEvenOddRule: boolean): void;
    /**
     * `Fills path`.
     * @private
     */
    fillPath(useEvenOddRule: boolean): void;
    /**
     * `Ends the path`.
     * @private
     */
    endPath(): void;
    /**
     * `Closes and fills the path`.
     * @private
     */
    closeFillPath(useEvenOddRule: boolean): void;
    /**
     * `Closes and strokes the path`.
     * @private
     */
    closeStrokePath(): void;
    /**
     * `Sets the text scaling`.
     * @private
     */
    setTextScaling(textScaling: number): void;
    /**
     * `Strokes path`.
     * @private
     */
    strokePath(): void;
    /**
     * `Restores` the graphics state.
     * @private
     */
    restoreGraphicsState(): void;
    /**
     * `Saves` the graphics state.
     * @private
     */
    saveGraphicsState(): void;
    /**
     * `Shifts the text to the point`.
     * @private
     */
    startNextLine(): void;
    /**
     * `Shifts the text to the point`.
     * @private
     */
    startNextLine(point: PointF): void;
    /**
     * `Shifts the text to the point`.
     * @private
     */
    startNextLine(x: number, y: number): void;
    /**
     * Shows the `text`.
     * @private
     */
    showText(text: PdfString): void;
    /**
     * Sets `text leading`.
     * @private
     */
    setLeading(leading: number): void;
    /**
     * `Begins the path`.
     * @private
     */
    beginPath(x: number, y: number): void;
    /**
     * `Begins text`.
     * @private
     */
    beginText(): void;
    /**
     * `Ends text`.
     * @private
     */
    endText(): void;
    /**
     * `Appends the rectangle`.
     * @private
     */
    appendRectangle(rectangle: RectangleF): void;
    /**
     * `Appends the rectangle`.
     * @private
     */
    appendRectangle(x: number, y: number, width: number, height: number): void;
    /**
     * `Appends a line segment`.
     * @private
     */
    appendLineSegment(point: PointF): void;
    /**
     * `Appends a line segment`.
     * @private
     */
    appendLineSegment(x: number, y: number): void;
    /**
     * Sets the `text rendering mode`.
     * @private
     */
    setTextRenderingMode(renderingMode: TextRenderingMode): void;
    /**
     * Sets the `character spacing`.
     * @private
     */
    setCharacterSpacing(charSpacing: number): void;
    /**
     * Sets the `word spacing`.
     * @private
     */
    setWordSpacing(wordSpacing: number): void;
    /**
     * Shows the `next line text`.
     * @private
     */
    showNextLineText(text: string, hex: boolean): void;
    /**
     * Shows the `next line text`.
     * @private
     */
    showNextLineText(text: PdfString): void;
    /**
     * Set the `color space`.
     * @private
     */
    setColorSpace(name: string, forStroking: boolean): void;
    /**
     * Set the `color space`.
     * @private
     */
    setColorSpace(name: PdfName, forStroking: boolean): void;
    /**
     * Modifies current `transformation matrix`.
     * @private
     */
    modifyCtm(matrix: PdfTransformationMatrix): void;
    /**
     * Sets `font`.
     * @private
     */
    setFont(font: PdfFont, name: string, size: number): void;
    /**
     * Sets `font`.
     * @private
     */
    setFont(font: PdfFont, name: PdfName, size: number): void;
    /**
     * `Writes the operator`.
     * @private
     */
    private writeOperator;
    /**
     * Checks the `text param`.
     * @private
     */
    private checkTextParam;
    /**
     * `Writes the text`.
     * @private
     */
    private writeText;
    /**
     * `Writes the point`.
     * @private
     */
    private writePoint;
    /**
     * `Updates y` co-ordinate.
     * @private
     */
    updateY(arg: number): number;
    /**
     * `Writes string` to the file.
     * @private
     */
    write(string: string): void;
    /**
     * `Writes comment` to the file.
     * @private
     */
    writeComment(comment: string): void;
    /**
     * Sets the `color and space`.
     * @private
     */
    setColorAndSpace(color: PdfColor, colorSpace: PdfColorSpace, forStroking: boolean): void;
    /**
     * Sets the `line dash pattern`.
     * @private
     */
    setLineDashPattern(pattern: number[], patternOffset: number): void;
    /**
     * Sets the `line dash pattern`.
     * @private
     */
    private setLineDashPatternHelper;
    /**
     * Sets the `miter limit`.
     * @private
     */
    setMiterLimit(miterLimit: number): void;
    /**
     * Sets the `width of the line`.
     * @private
     */
    setLineWidth(width: number): void;
    /**
     * Sets the `line cap`.
     * @private
     */
    setLineCap(lineCapStyle: PdfLineCap): void;
    /**
     * Sets the `line join`.
     * @private
     */
    setLineJoin(lineJoinStyle: PdfLineJoin): void;
    /**
     * Gets or sets the current `position` within the stream.
     * @private
     */
    readonly position: number;
    /**
     * Gets `stream length`.
     * @private
     */
    readonly length: number;
    /**
     * Gets and Sets the `current document`.
     * @private
     */
    readonly document: PdfDocument;
    /**
     * `Appends a line segment`.
     * @public
     */
    appendBezierSegment(arg1: PointF, arg2: PointF, arg3: PointF): void;
    appendBezierSegment(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    setColourWithPattern(colours: number[], patternName: PdfName, forStroking: boolean): void;
}
