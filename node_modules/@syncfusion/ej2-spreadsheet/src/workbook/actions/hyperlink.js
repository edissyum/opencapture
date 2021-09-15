import { setLinkModel } from '../common/event';
import { getRangeIndexes } from '../common/address';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * The `WorkbookHyperlink` module is used to handle Hyperlink action in Spreadsheet.
 */
var WorkbookHyperlink = /** @class */ (function () {
    /**
     * Constructor for WorkbookSort module.
     *
     * @param {Workbook} parent - Specifies the workbook.
     */
    function WorkbookHyperlink(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    /**
     * To destroy the sort module.
     *
     * @returns {void} - To destroy the sort module.
     */
    WorkbookHyperlink.prototype.destroy = function () {
        this.removeEventListener();
        this.parent = null;
    };
    WorkbookHyperlink.prototype.addEventListener = function () {
        this.parent.on(setLinkModel, this.setLinkHandler, this);
    };
    WorkbookHyperlink.prototype.removeEventListener = function () {
        if (!this.parent.isDestroyed) {
            this.parent.off(setLinkModel, this.setLinkHandler);
        }
    };
    WorkbookHyperlink.prototype.setLinkHandler = function (args) {
        var hyperlink = args.hyperlink;
        var cellAddr = args.cell;
        var range;
        var sheetIdx;
        var sheet = this.parent.getActiveSheet();
        var address;
        if (cellAddr && cellAddr.indexOf('!') !== -1) {
            range = cellAddr.split('!');
            var sheets = this.parent.sheets;
            for (var idx = 0; idx < sheets.length; idx++) {
                if (sheets[idx].name === range[0]) {
                    sheetIdx = idx;
                }
            }
            sheet = this.parent.sheets[sheetIdx];
            cellAddr = range[1];
        }
        cellAddr = cellAddr ? cellAddr : this.parent.getActiveSheet().activeCell;
        var cellIdx = getRangeIndexes(cellAddr);
        var rowIdx = cellIdx[0];
        var colIdx = cellIdx[1];
        if (!sheet) {
            return;
        }
        if (isNullOrUndefined(sheet.rows[rowIdx])) {
            sheet.rows[rowIdx] = {};
        }
        if (isNullOrUndefined(sheet.rows[rowIdx].cells)) {
            sheet.rows[rowIdx].cells = [];
        }
        if (isNullOrUndefined(sheet.rows[rowIdx].cells[colIdx])) {
            sheet.rows[rowIdx].cells[colIdx] = {};
        }
        if (sheet.rows[rowIdx].cells[colIdx].style) {
            sheet.rows[rowIdx].cells[colIdx].style.textDecoration = 'underline';
            sheet.rows[rowIdx].cells[colIdx].style.color = '#00e';
        }
        else {
            sheet.rows[rowIdx].cells[colIdx].style = { textDecoration: 'underline', color: '#00e' };
        }
        if (typeof (hyperlink) === 'string') {
            if (hyperlink.indexOf('http://') !== 0 && hyperlink.indexOf('https://') !== 0 && hyperlink.indexOf('ftp://') !== 0) {
                hyperlink = hyperlink.toLowerCase().indexOf('www.') === 0 ? 'http://' + hyperlink : hyperlink;
                address = hyperlink;
            }
            sheet.rows[rowIdx].cells[colIdx].hyperlink = hyperlink;
        }
        else {
            address = hyperlink.address;
            if (address.indexOf('http://') !== 0 && address.indexOf('https://') !== 0 && address.indexOf('ftp://') !== 0) {
                address = address.toLowerCase().indexOf('www.') === 0 ? 'http://' + address : address;
            }
            sheet.rows[rowIdx].cells[colIdx].hyperlink = {
                address: address
            };
        }
    };
    /**
     * Gets the module name.
     *
     *@returns {string} - returns the module name.
     */
    WorkbookHyperlink.prototype.getModuleName = function () {
        return 'workbookHyperlink';
    };
    return WorkbookHyperlink;
}());
export { WorkbookHyperlink };
