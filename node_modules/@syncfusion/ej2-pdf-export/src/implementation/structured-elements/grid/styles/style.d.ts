/**
 * PdfGridStyleBase.ts class for EJ2-PDF
 */
import { PdfBrush } from './../../../graphics/brushes/pdf-brush';
import { PdfPen } from './../../../graphics/pdf-pen';
import { PdfFont } from './../../../graphics/fonts/pdf-font';
import { PdfBorders, PdfPaddings } from './pdf-borders';
import { PdfBorderOverlapStyle } from './../../tables/light-tables/enum';
import { PdfStringFormat } from './../../../graphics/fonts/pdf-string-format';
import { PdfGridRow } from './../pdf-grid-row';
import { PdfImage } from './../../../graphics/images/pdf-image';
/**
 * Base class for the `grid style`,
 */
export declare abstract class PdfGridStyleBase {
    /**
     * @hidden
     * @private
     */
    private gridBackgroundBrush;
    /**
     * @hidden
     * @private
     */
    private gridTextBrush;
    /**
     * @hidden
     * @private
     */
    private gridTextPen;
    /**
     * @hidden
     * @private
     */
    private gridFont;
    /**
     * @hidden
     * @private
     */
    private gridBackgroundImage;
    /**
     * Gets or sets the `background brush`.
     * @private
     */
    backgroundBrush: PdfBrush;
    /**
     * Gets or sets the `text brush`.
     * @private
     */
    textBrush: PdfBrush;
    /**
     * Gets or sets the `text pen`.
     * @private
     */
    textPen: PdfPen;
    /**
     * Gets or sets the `font`.
     * @private
     */
    font: PdfFont;
    /**
     * Gets or sets the `background Image`.
     * @private
     */
    backgroundImage: PdfImage;
}
/**
 * `PdfGridStyle` class provides customization of the appearance for the 'PdfGrid'.
 */
export declare class PdfGridStyle extends PdfGridStyleBase {
    /**
     * @hidden
     * @private
     */
    private gridBorderOverlapStyle;
    /**
     * @hidden
     * @private
     */
    private gridHorizontalOverflowType;
    /**
     * @hidden
     * @private
     */
    private bAllowHorizontalOverflow;
    /**
     * @hidden
     * @private
     */
    private gridCellPadding;
    /**
     * @hidden
     * @private
     */
    private gridCellSpacing;
    /**
     * Initialize a new instance for `PdfGridStyle` class.
     * @private
     */
    constructor();
    /**
     * Gets or sets the `cell spacing` of the 'PdfGrid'.
     * @private
     */
    cellSpacing: number;
    /**
     * Gets or sets the type of the `horizontal overflow` of the 'PdfGrid'.
     * @private
     */
    horizontalOverflowType: PdfHorizontalOverflowType;
    /**
     * Gets or sets a value indicating whether to `allow horizontal overflow`.
     * @private
     */
    allowHorizontalOverflow: boolean;
    /**
     * Gets or sets the `cell padding`.
     * @private
     */
    cellPadding: PdfPaddings;
    /**
     * Gets or sets the `border overlap style` of the 'PdfGrid'.
     * @private
     */
    borderOverlapStyle: PdfBorderOverlapStyle;
}
/**
 * `PdfGridCellStyle` class provides customization of the appearance for the 'PdfGridCell'.
 */
export declare class PdfGridCellStyle extends PdfGridStyleBase {
    /**
     * @hidden
     * @private
     */
    private gridCellBorders;
    /**
     * @hidden
     * @private
     */
    private gridCellPadding;
    /**
     * @hidden
     * @private
     */
    private format;
    /**
     * Gets the `string format` of the 'PdfGridCell'.
     * @private
     */
    stringFormat: PdfStringFormat;
    /**
     * Gets or sets the `border` of the 'PdfGridCell'.
     * @private
     */
    borders: PdfBorders;
    /**
     * Gets or sets the `cell padding`.
     * @private
     */
    cellPadding: PdfPaddings;
    /**
     * Initializes a new instance of the `PdfGridCellStyle` class.
     * @private
     */
    constructor();
}
/**
 * `PdfGridRowStyle` class provides customization of the appearance for the `PdfGridRow`.
 */
export declare class PdfGridRowStyle {
    /**
     * @hidden
     * @private
     */
    private gridRowBackgroundBrush;
    /**
     * @hidden
     * @private
     */
    private gridRowTextBrush;
    /**
     * @hidden
     * @private
     */
    private gridRowTextPen;
    /**
     * @hidden
     * @private
     */
    private gridRowFont;
    /**
     * Specifies the `border` value of the current row.
     * @private
     */
    private gridRowBorder;
    /**
     * Specifies the `parent row` of the current object.
     * @private
     */
    private parent;
    /**
     * @hidden
     * @private
     */
    private gridRowBackgroundImage;
    /**
     * Gets or sets the `background brush`.
     * @private
     */
    readonly backgroundBrush: PdfBrush;
    setBackgroundBrush(value: PdfBrush): void;
    /**
     * Gets or sets the `text brush`.
     * @private
     */
    readonly textBrush: PdfBrush;
    setTextBrush(value: PdfBrush): void;
    /**
     * Gets or sets the `text pen`.
     * @private
     */
    readonly textPen: PdfPen;
    setTextPen(value: PdfPen): void;
    /**
     * Gets or sets the `font`.
     * @private
     */
    readonly font: PdfFont;
    setFont(value: PdfFont): void;
    /**
     * Gets or sets the `border` of the current row.
     * @private
     */
    readonly border: PdfBorders;
    setBorder(value: PdfBorders): void;
    /**
     * sets the `parent row` of the current object.
     * @private
     */
    setParent(parent: PdfGridRow): void;
    /**
     * Gets or sets the `backgroundImage` of the 'PdfGridCell'.
     * @private
     */
    readonly backgroundImage: PdfImage;
    /**
     * sets the `backgroundImage` of the 'PdfGridCell'.
     * @private
     */
    setBackgroundImage(value: PdfImage): void;
    /**
     * Initializes a new instance of the `PdfGridRowStyle` class.
     * @private
     */
    constructor();
}
/**
 * public Enum for `PdfHorizontalOverflowType`.
 * @private
 */
export declare enum PdfHorizontalOverflowType {
    /**
     * Specifies the type of `NextPage`.
     * @private
     */
    NextPage = 0,
    /**
     * Specifies the type of `LastPage`.
     * @private
     */
    LastPage = 1
}
