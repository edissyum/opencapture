/**
 * PdfGridStyleBase.ts class for EJ2-PDF
 */
import { PdfBorderOverlapStyle } from '@syncfusion/ej2-pdf-export';
import { PdfPaddings } from '../index';
import { PdfHorizontalOverflowType } from '../../../base/interface';
/**
 * Base class for the `treegrid style`,
 */
var PdfTreeGridStyleBase = /** @class */ (function () {
    function PdfTreeGridStyleBase() {
    }
    return PdfTreeGridStyleBase;
}());
export { PdfTreeGridStyleBase };
/**
 * `PdfTreeGridStyle` class provides customization of the appearance for the 'PdfGrid'.
 *
 */
var PdfTreeGridStyle = /** @class */ (function () {
    //constructor
    /**
     * Initialize a new instance for `PdfGridStyle` class.
     *
     * @private
     */
    function PdfTreeGridStyle() {
        this.cellSpacing = 0;
        this.borderOverlapStyle = PdfBorderOverlapStyle.Overlap;
        this.allowHorizontalOverflow = false;
        this.horizontalOverflowType = PdfHorizontalOverflowType.LastPage;
        this.cellPadding = new PdfPaddings();
    }
    return PdfTreeGridStyle;
}());
export { PdfTreeGridStyle };
