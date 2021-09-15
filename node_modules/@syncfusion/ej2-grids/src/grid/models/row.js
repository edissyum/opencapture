import { merge } from '@syncfusion/ej2-base';
/**
 * Row
 *
 * @hidden
 */
var Row = /** @class */ (function () {
    function Row(options, parent) {
        merge(this, options);
        this.parent = parent;
    }
    Row.prototype.clone = function () {
        var row = new Row({});
        merge(row, this);
        row.cells = this.cells.map(function (cell) { return cell.clone(); });
        return row;
    };
    /**
     * Replaces the row data and grid refresh the particular row element only.
     *
     * @param  {Object} data - To update new data for the particular row.
     * @returns {void}
     */
    Row.prototype.setRowValue = function (data) {
        if (!this.parent) {
            return;
        }
        var key = this.data[this.parent.getPrimaryKeyFieldNames()[0]];
        this.parent.setRowData(key, data);
    };
    /**
     * Replaces the given field value and refresh the particular cell element only.
     *
     * @param {string} field - Specifies the field name which you want to update.
     * @param {string | number | boolean | Date} value - To update new value for the particular cell.
     * @returns {void}
     */
    Row.prototype.setCellValue = function (field, value) {
        if (!this.parent) {
            return;
        }
        var isValDiff = !(this.data[field].toString() === value.toString());
        if (isValDiff) {
            var pKeyField = this.parent.getPrimaryKeyFieldNames()[0];
            var key = this.data[pKeyField];
            this.parent.setCellValue(key, field, value);
            this.makechanges(pKeyField, this.data);
        }
        else {
            return;
        }
    };
    Row.prototype.makechanges = function (key, data) {
        if (!this.parent) {
            return;
        }
        var gObj = this.parent;
        var dataManager = gObj.getDataModule().dataManager;
        dataManager.update(key, data);
    };
    return Row;
}());
export { Row };
