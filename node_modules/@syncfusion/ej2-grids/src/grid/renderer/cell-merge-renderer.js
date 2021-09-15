import { isNullOrUndefined, attributes } from '@syncfusion/ej2-base';
import { iterateArrayOrObject } from '../base/util';
import { CellType } from '../base/enum';
/**
 * `CellMergeRender` module.
 *
 * @hidden
 */
var CellMergeRender = /** @class */ (function () {
    function CellMergeRender(serviceLocator, parent) {
        this.serviceLocator = serviceLocator;
        this.parent = parent;
    }
    CellMergeRender.prototype.render = function (cellArgs, row, i, td) {
        var cellRendererFact = this.serviceLocator.getService('cellRendererFactory');
        var cellRenderer = cellRendererFact.getCellRenderer(row.cells[i].cellType || CellType.Data);
        var colSpan = row.cells[i].cellSpan ? row.cells[i].cellSpan :
            (cellArgs.colSpan + i) <= row.cells.length ? cellArgs.colSpan : row.cells.length - i;
        var rowSpan = cellArgs.rowSpan;
        var visible = 0;
        var spannedCell;
        if (row.index > 0) {
            var cells = this.parent.groupSettings.columns.length > 0 &&
                !this.parent.getRowsObject()[row.index - 1].isDataRow ? this.parent.getRowsObject()[row.index].cells :
                this.parent.getRowsObject()[row.index - 1].cells;
            var targetCell_1 = row.cells[i];
            var uid_1 = 'uid';
            spannedCell = cells.filter(function (cell) { return cell.column.uid === targetCell_1.column[uid_1]; })[0];
        }
        var colSpanLen = spannedCell && spannedCell.colSpanRange > 1 && spannedCell.rowSpanRange > 1 ?
            spannedCell.colSpanRange : colSpan;
        for (var j = i + 1; j < i + colSpanLen && j < row.cells.length; j++) {
            if (row.cells[j].visible === false) {
                visible++;
            }
            else {
                row.cells[j].isSpanned = true;
            }
        }
        if (visible > 0) {
            for (var j = i + colSpan; j < i + colSpan + visible && j < row.cells.length; j++) {
                row.cells[j].isSpanned = true;
            }
            if (i + colSpan + visible >= row.cells.length) {
                colSpan -= (i + colSpan + visible) - row.cells.length;
            }
        }
        if (row.cells[i].cellSpan) {
            row.data[cellArgs.column.field] = row.cells[i].spanText;
            td = cellRenderer.render(row.cells[i], row.data, { 'index': !isNullOrUndefined(row.index) ? row.index.toString() : '' });
        }
        if (colSpan > 1) {
            attributes(td, { 'colSpan': colSpan.toString(), 'aria-colSpan': colSpan.toString() });
        }
        if (rowSpan > 1) {
            attributes(td, { 'rowspan': rowSpan.toString(), 'aria-rowspan': rowSpan.toString() });
            row.cells[i].isRowSpanned = true;
            row.cells[i].rowSpanRange = Number(rowSpan);
            if (colSpan > 1) {
                row.cells[i].colSpanRange = Number(colSpan);
            }
        }
        if (row.index > 0 && (spannedCell.rowSpanRange > 1)) {
            row.cells[i].isSpanned = true;
            row.cells[i].rowSpanRange = Number(spannedCell.rowSpanRange - 1);
            row.cells[i].colSpanRange = spannedCell.rowSpanRange > 0 ? spannedCell.colSpanRange : 1;
        }
        if (this.parent.enableColumnVirtualization && !row.cells[i].cellSpan &&
            !this.containsKey(cellArgs.column.field, cellArgs.data[cellArgs.column.field])) {
            this.backupMergeCells(cellArgs.column.field, cellArgs.data[cellArgs.column.field], cellArgs.colSpan);
        }
        return td;
    };
    CellMergeRender.prototype.backupMergeCells = function (fName, data, span) {
        this.setMergeCells(this.generteKey(fName, data), span);
    };
    CellMergeRender.prototype.generteKey = function (fname, data) {
        return fname + '__' + data.toString();
    };
    CellMergeRender.prototype.splitKey = function (key) {
        return key.split('__');
    };
    CellMergeRender.prototype.containsKey = function (fname, data) {
        // eslint-disable-next-line no-prototype-builtins
        return this.getMergeCells().hasOwnProperty(this.generteKey(fname, data));
    };
    CellMergeRender.prototype.getMergeCells = function () {
        return this.parent.mergeCells;
    };
    CellMergeRender.prototype.setMergeCells = function (key, span) {
        this.parent.mergeCells[key] = span;
    };
    CellMergeRender.prototype.updateVirtualCells = function (rows) {
        var mCells = this.getMergeCells();
        for (var _i = 0, _a = Object.keys(mCells); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = mCells[key];
            var merge = this.splitKey(key);
            var columnIndex = this.getIndexFromAllColumns(merge[0]);
            var vColumnIndices = this.parent.getColumnIndexesInView();
            var span = value - (vColumnIndices[0] - columnIndex);
            if (columnIndex < vColumnIndices[0] && span > 1) {
                for (var _b = 0, rows_1 = rows; _b < rows_1.length; _b++) {
                    var row = rows_1[_b];
                    if (row.data[merge[0]].toString() === merge[1].toString()) {
                        row.cells[0].cellSpan = span;
                        row.cells[0].spanText = merge[1];
                        break;
                    }
                }
            }
        }
        return rows;
    };
    CellMergeRender.prototype.getIndexFromAllColumns = function (field) {
        var index = iterateArrayOrObject(this.parent.getVisibleColumns(), function (item, index) {
            if (item.field === field) {
                return index;
            }
            return undefined;
        })[0];
        return index;
    };
    return CellMergeRender;
}());
export { CellMergeRender };
