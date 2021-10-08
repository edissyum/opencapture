/**
 * PdfBorders.ts class for EJ2-PDF
 */
import { PdfPen } from '@syncfusion/ej2-pdf-export';
/**
 * `PdfBorders` class used represents the cell border of the PDF grid.
 */
export declare class PdfBorders {
    /**
     * The `left` border.
     *
     * @private
     */
    private leftPen;
    /**
     * The `right` border.
     *
     * @private
     */
    private rightPen;
    /**
     * The `top` border.
     *
     * @private
     */
    private topPen;
    /**
     * The `bottom` border.
     *
     * @private
     */
    private bottomPen;
    /**
     * Gets or sets the `Left`.
     *
     * @returns {PdfPen} .
     * @private
     */
    left: PdfPen;
    /**
     * Gets or sets the `Right`.
     *
     * @returns {PdfPen} .
     * @private
     */
    right: PdfPen;
    /**
     * Gets or sets the `Top`.
     *
     * @returns {PdfPen} .
     * @private
     */
    top: PdfPen;
    /**
     * Gets or sets the `Bottom`.
     *
     * @returns {PdfPen} .
     * @private
     */
    bottom: PdfPen;
    /**
     * sets the `All`.
     *
     * @param {PdfPen} value .
     * @private
     */
    all: PdfPen;
    /**
     * Gets a value indicating whether this instance `is all`.
     *
     * @returns {boolean} .
     * @private
     */
    readonly isAll: boolean;
    /**
     * Gets the `default`.
     *
     * @returns {PdfBorders} .
     * @private
     */
    static readonly default: PdfBorders;
    /**
     * Create a new instance for `PdfBorders` class.
     *
     * @private
     */
    constructor();
}
export declare class PdfPaddings {
    /**
     * The `left` padding.
     *
     * @private
     */
    private leftPad;
    /**
     * The `right` padding.
     *
     * @private
     */
    private rightPad;
    /**
     * The `top` padding.
     *
     * @private
     */
    private topPad;
    /**
     * The `bottom` padding.
     *
     * @private
     */
    private bottomPad;
    /**
     * The 'left' border padding set.
     *
     * @private
     */
    hasLeftPad: boolean;
    /**
     * The 'right' border padding set.
     *
     * @private
     */
    hasRightPad: boolean;
    /**
     * The 'top' border padding set.
     *
     * @private
     */
    hasTopPad: boolean;
    /**
     * The 'bottom' border padding set.
     *
     * @private
     */
    hasBottomPad: boolean;
    /**
     * Gets or sets the `left` value of the edge
     *
     * @returns {number} .
     * @private
     */
    left: number;
    /**
     * Gets or sets the `right` value of the edge.
     *
     * @returns {number} .
     * @private
     */
    right: number;
    /**
     * Gets or sets the `top` value of the edge
     *
     * @returns {number} .
     * @private
     */
    top: number;
    /**
     * Gets or sets the `bottom` value of the edge.
     *
     * @returns {number} .
     * @private
     */
    bottom: number;
    /**
     * Sets value to all sides `left,right,top and bottom`.s
     *
     * @param {number} value .
     * @private
     */
    all: number;
    /**
     * Initializes a new instance of the `PdfPaddings` class.
     *
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfPaddings` class.
     *
     * @private
     */
    constructor(left: number, right: number, top: number, bottom: number);
}
