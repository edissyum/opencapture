import { refreshCellElement } from '../../workbook/common/event';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Specifies number format.
 */
var NumberFormat = /** @class */ (function () {
    function NumberFormat(parent) {
        this.parent = parent;
        this.addEventListener();
        //Spreadsheet.Inject(WorkbookNumberFormat);
    }
    NumberFormat.prototype.refreshCellElement = function (args) {
        var cell = this.parent.getCell(args.rowIndex, args.colIndex);
        if (!isNullOrUndefined(cell)) {
            this.parent.refreshNode(cell, args);
        }
    };
    /**
     * Adding event listener for number format.
     *
     * @hidden
     * @returns {void} - Adding event listener for number format.
     */
    NumberFormat.prototype.addEventListener = function () {
        this.parent.on(refreshCellElement, this.refreshCellElement, this);
    };
    /**
     * Removing event listener for number format.
     *
     * @hidden
     * @returns {void} - Removing event listener for number format.
     */
    NumberFormat.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(refreshCellElement, this.refreshCellElement);
        }
    };
    /**
     * To Remove the event listeners.
     *
     * @returns {void} - To Remove the event listeners.
     */
    NumberFormat.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    /**
     * Get the workbook import module name.
     *
     * @returns {string} - Get the workbook import module name.
     */
    NumberFormat.prototype.getModuleName = function () {
        return 'numberFormat';
    };
    return NumberFormat;
}());
export { NumberFormat };
