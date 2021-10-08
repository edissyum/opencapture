/**
 * PdfStringLayouter.ts class for EJ2-PDF
 */
import { PdfFont } from './pdf-font';
import { PdfStringFormat } from './pdf-string-format';
import { SizeF, RectangleF } from './../../drawing/pdf-drawing';
/**
 * Class `lay outing the text`.
 */
export declare class PdfStringLayouter {
    /**
     * `Text` data.
     * @private
     */
    private text;
    /**
     * Pdf `font`.
     * @private
     */
    private font;
    /**
     * String `format`.
     * @private
     */
    private format;
    /**
     * `Size` of the text.
     * @private
     */
    private size;
    /**
     * `Bounds` of the text.
     * @private
     */
    private rectangle;
    /**
     * Pdf page `height`.
     * @private
     */
    private pageHeight;
    /**
     * String `tokenizer`.
     * @private
     */
    private reader;
    /**
     * Specifies if [`isTabReplaced`].
     * @private
     */
    private isTabReplaced;
    /**
     * Count of tab `occurance`.
     * @private
     */
    private tabOccuranceCount;
    /**
     * Checks whether the x co-ordinate is need to set as client size or not.
     * @hidden
     * @private
     */
    private isOverloadWithPosition;
    /**
     * Stores client size of the page if the layout method invoked with `PointF` overload.
     * @hidden
     * @private
     */
    private clientSize;
    /**
     * Initializes a new instance of the `StringLayouter` class.
     * @private
     */
    constructor();
    /**
     * `Layouts` the text.
     * @private
     */
    layout(text: string, font: PdfFont, format: PdfStringFormat, rectangle: RectangleF, pageHeight: number, recalculateBounds: boolean, clientSize: SizeF): PdfStringLayoutResult;
    layout(text: string, font: PdfFont, format: PdfStringFormat, size: SizeF, recalculateBounds: boolean, clientSize: SizeF): PdfStringLayoutResult;
    /**
     * `Initializes` internal data.
     * @private
     */
    private initialize;
    /**
     * `Clear` all resources.
     * @private
     */
    private clear;
    /**
     * `Layouts` the text.
     * @private
     */
    private doLayout;
    /**
     * Returns `line indent` for the line.
     * @private
     */
    private getLineIndent;
    /**
     * Calculates `height` of the line.
     * @private
     */
    private getLineHeight;
    /**
     * Calculates `width` of the line.
     * @private
     */
    private getLineWidth;
    /**
     * `Layouts` line.
     * @private
     */
    private layoutLine;
    /**
     * `Adds` line to line result.
     * @private
     */
    private addToLineResult;
    /**
     * `Copies` layout result from line result to entire result. Checks whether we can proceed lay outing or not.
     * @private
     */
    private copyToResult;
    /**
     * `Finalizes` final result.
     * @private
     */
    private finalizeResult;
    /**
     * `Trims` whitespaces at the line.
     * @private
     */
    private trimLine;
    /**
     * Returns `wrap` type.
     * @private
     */
    private getWrapType;
}
export declare class PdfStringLayoutResult {
    /**
     * Layout `lines`.
     * @private
     */
    layoutLines: LineInfo[];
    /**
     * The `text` wasn`t lay outed.
     * @private
     */
    textRemainder: string;
    /**
     * Actual layout text `bounds`.
     * @private
     */
    size: SizeF;
    /**
     * `Height` of the line.
     * @private
     */
    layoutLineHeight: number;
    /**
     * Gets the `text` which is not lay outed.
     * @private
     */
    readonly remainder: string;
    /**
     * Gets the actual layout text `bounds`.
     * @private
     */
    readonly actualSize: SizeF;
    /**
     * Gets layout `lines` information.
     * @private
     */
    readonly lines: LineInfo[];
    /**
     * Gets the `height` of the line.
     * @private
     */
    readonly lineHeight: number;
    /**
     * Gets value that indicates whether any layout text [`empty`].
     * @private
     */
    readonly empty: boolean;
    /**
     * Gets `number of` the layout lines.
     * @private
     */
    readonly lineCount: number;
}
export declare class LineInfo {
    /**
     * Line `text`.
     * @private
     */
    content: string;
    /**
     * `Width` of the text.
     * @private
     */
    lineWidth: number;
    /**
     * `Breaking type` of the line.
     * @private
     */
    type: LineType;
    /**
     * Gets the `type` of the line text.
     * @private
     */
    lineType: LineType;
    /**
     * Gets the line `text`.
     * @private
     */
    text: string;
    /**
     * Gets `width` of the line text.
     * @private
     */
    width: number;
}
/**
* Break type of the `line`.
* @private
*/
export declare enum LineType {
    /**
     * Specifies the type of `None`.
     * @private
     */
    None = 0,
    /**
     * Specifies the type of `NewLineBreak`.
     * @private
     */
    NewLineBreak = 1,
    /**
     * Specifies the type of `LayoutBreak`.
     * @private
     */
    LayoutBreak = 2,
    /**
     * Specifies the type of `FirstParagraphLine`.
     * @private
     */
    FirstParagraphLine = 4,
    /**
     * Specifies the type of `LastParagraphLine`.
     * @private
     */
    LastParagraphLine = 8
}
