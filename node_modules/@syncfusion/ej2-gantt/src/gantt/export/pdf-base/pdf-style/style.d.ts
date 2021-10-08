/**
 * PdfGridStyleBase.ts class for EJ2-PDF
 */
import { PdfBrush, PdfPen, PdfFont, PdfBorderOverlapStyle } from '@syncfusion/ej2-pdf-export';
import { PdfPaddings } from '../index';
import { PdfHorizontalOverflowType } from '../../../base/interface';
/**
 * Base class for the `treegrid style`,
 */
export declare abstract class PdfTreeGridStyleBase {
    /**
     * Gets or sets the `background brush`.
     *
     * @private
     */
    backgroundBrush: PdfBrush;
    /**
     * Gets or sets the `text brush`.
     *
     * @private
     */
    textBrush: PdfBrush;
    /**
     * Gets or sets the `text pen`.
     *
     * @private
     */
    textPen: PdfPen;
    /**
     * Gets or sets the `font`.
     *
     * @private
     */
    font: PdfFont;
}
/**
 * `PdfTreeGridStyle` class provides customization of the appearance for the 'PdfGrid'.
 *
 */
export declare class PdfTreeGridStyle {
    /**
     * Gets or sets the `border overlap style` of the 'PdfGrid'.
     *
     * @private
     */
    borderOverlapStyle: PdfBorderOverlapStyle;
    /**
     * Gets or sets the type of the `horizontal overflow` of the 'PdfGrid'.
     *
     * @private
     */
    horizontalOverflowType: PdfHorizontalOverflowType;
    /**
     * Gets or sets a value indicating whether to `allow horizontal overflow`.
     *
     * @private
     */
    allowHorizontalOverflow: boolean;
    /**
     * Gets or sets the `cell padding`.
     *
     * @private
     */
    cellPadding: PdfPaddings;
    /**
     * Gets or sets the `cell spacing` of the 'PdfGrid'.
     *
     * @private
     */
    cellSpacing: number;
    /**
     * Initialize a new instance for `PdfGridStyle` class.
     *
     * @private
     */
    constructor();
}
