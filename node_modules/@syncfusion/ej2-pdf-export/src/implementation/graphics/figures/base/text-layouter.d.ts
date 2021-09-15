/**
 * TextLayouter.ts class for EJ2-PDF
 */
import { ElementLayouter, PdfLayoutParams, PdfLayoutResult } from './element-layouter';
import { PdfTextElement } from './../text-element';
import { PdfPage } from './../../../pages/pdf-page';
import { RectangleF } from './../../../drawing/pdf-drawing';
/**
 * Class that `layouts the text`.
 * @private
 */
export declare class TextLayouter extends ElementLayouter {
    /**
     * String `format`.
     * @private
     */
    private format;
    /**
     * Gets the layout `element`.
     * @private
     */
    readonly element: PdfTextElement;
    /**
     * Initializes a new instance of the `TextLayouter` class.
     * @private
     */
    constructor(element: PdfTextElement);
    /**
     * `Layouts` the element.
     * @private
     */
    protected layoutInternal(param: PdfLayoutParams): PdfLayoutResult;
    /**
     * Raises `PageLayout` event if needed.
     * @private
     */
    private getLayoutResult;
    /**
     * `Layouts` the text on the page.
     * @private
     */
    private layoutOnPage;
    /**
     * `Corrects current bounds` on the page.
     * @private
     */
    private checkCorrectBounds;
    /**
     * Returns a `rectangle` where the text was printed on the page.
     * @private
     */
    private getTextPageBounds;
}
export declare class TextPageLayoutResult {
    /**
     * The last `page` where the text was drawn.
     * @private
     */
    page: PdfPage;
    /**
     * The `bounds` of the element on the last page where it was drawn.
     * @private
     */
    bounds: RectangleF;
    /**
     * Indicates whether the lay outing has been finished [`end`].
     * @private
     */
    end: boolean;
    /**
     * The `text` that was not printed.
     * @private
     */
    remainder: string;
    /**
     * Gets or sets a `bounds` of the last text line that was printed.
     * @private
     */
    lastLineBounds: RectangleF;
}
export declare class PdfTextLayoutResult extends PdfLayoutResult {
    /**
     * The `text` that was not printed.
     * @private
     */
    private remainderText;
    /**
     * The `bounds` of the last line that was printed.
     * @private
     */
    private lastLineTextBounds;
    /**
     * Gets a value that contains the `text` that was not printed.
     * @private
     */
    readonly remainder: string;
    /**
     * Gets a value that indicates the `bounds` of the last line that was printed on the page.
     * @private
     */
    readonly lastLineBounds: RectangleF;
    /**
     * Initializes the new instance of `PdfTextLayoutResult` class.
     * @private
     */
    constructor(page: PdfPage, bounds: RectangleF, remainder: string, lastLineBounds: RectangleF);
}
