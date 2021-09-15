var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChildProperty, Collection, Property, Complex } from '@syncfusion/ej2-base';
import { Cell } from './cell';
import { Format } from '../common/index';
/**
 * Configures the Row behavior for the spreadsheet.
 *  ```html
 * <div id='Spreadsheet'></div>
 * ```
 * ```typescript
 * let spreadsheet: Spreadsheet = new Spreadsheet({
 *      sheets: [{
 *                rows: [{
 *                        index: 30,
 *                        cells: [{ index: 4, value: 'Total Amount:' },
 *                               { formula: '=SUM(F2:F30)', style: { fontWeight: 'bold' } }]
 *                }]
 * ...
 * });
 * spreadsheet.appendTo('#Spreadsheet');
 * ```
 */
var Row = /** @class */ (function (_super) {
    __extends(Row, _super);
    function Row() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], Cell)
    ], Row.prototype, "cells", void 0);
    __decorate([
        Property(0)
    ], Row.prototype, "index", void 0);
    __decorate([
        Property(20)
    ], Row.prototype, "height", void 0);
    __decorate([
        Property(false)
    ], Row.prototype, "customHeight", void 0);
    __decorate([
        Property(false)
    ], Row.prototype, "hidden", void 0);
    __decorate([
        Complex({}, Format)
    ], Row.prototype, "format", void 0);
    return Row;
}(ChildProperty));
export { Row };
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @returns {RowModel} - To get the row.
 */
export function getRow(sheet, rowIndex) {
    return sheet.rows[rowIndex];
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {RowModel} row - Specifies the row.
 * @returns {void} - To set the row.
 */
export function setRow(sheet, rowIndex, row) {
    if (!sheet.rows[rowIndex]) {
        sheet.rows[rowIndex] = {};
    }
    Object.keys(row).forEach(function (key) {
        sheet.rows[rowIndex][key] = row[key];
    });
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} index - Specifies the index.
 * @returns {boolean} - To return the bool value.
 */
export function isHiddenRow(sheet, index) {
    return sheet.rows[index] && sheet.rows[index].hidden;
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {boolean} checkDPR - Specifies the bool value.
 * @returns {number} - To get the row height.
 */
export function getRowHeight(sheet, rowIndex, checkDPR) {
    var hgt;
    if (sheet && sheet.rows && sheet.rows[rowIndex]) {
        if (sheet.rows[rowIndex].hidden) {
            return 0;
        }
        hgt = sheet.rows[rowIndex].height === undefined ? 20 : sheet.rows[rowIndex].height;
    }
    else {
        hgt = 20;
    }
    if (checkDPR && window.devicePixelRatio % 1 > 0) {
        var pointValue = (hgt * window.devicePixelRatio) % 1;
        return hgt + (pointValue ? ((pointValue > 0.5 ? (1 - pointValue) : -1 * pointValue) / window.devicePixelRatio) : 0);
    }
    else {
        return hgt;
    }
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} rowIndex - Specifies the rowIndex.
 * @param {number} height - Specifies the height.
 * @returns {void} - To set the row height.
 */
export function setRowHeight(sheet, rowIndex, height) {
    if (sheet && sheet.rows) {
        if (!sheet.rows[rowIndex]) {
            sheet.rows[rowIndex] = {};
        }
        sheet.rows[rowIndex].height = height;
    }
}
/**
 * @hidden
 * @param {SheetModel} sheet - Specifies the sheet.
 * @param {number} startRow - Specifies the startRow.
 * @param {number} endRow - Specifies the endRow.
 * @param {boolean} checkDPR - Specifies the boolean value.
 * @returns {number} - To get the rows height.
 */
export function getRowsHeight(sheet, startRow, endRow, checkDPR) {
    if (endRow === void 0) { endRow = startRow; }
    var height = 0;
    var swap;
    if (startRow > endRow) {
        swap = startRow;
        startRow = endRow;
        endRow = swap;
    }
    for (var i = startRow; i <= endRow; i++) {
        height += getRowHeight(sheet, i, checkDPR);
    }
    return height;
}
