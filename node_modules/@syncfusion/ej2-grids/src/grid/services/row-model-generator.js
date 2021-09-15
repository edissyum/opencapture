import { isNullOrUndefined, getValue, setValue } from '@syncfusion/ej2-base';
import { Row } from '../models/row';
import { CellType } from '../base/enum';
import { Cell } from '../models/cell';
import { getUid } from '../base/util';
import { getForeignData } from '../../grid/base/util';
import * as events from '../base/constant';
/**
 * RowModelGenerator is used to generate grid data rows.
 *
 * @hidden
 */
var RowModelGenerator = /** @class */ (function () {
    /**
     * Constructor for header renderer module
     *
     * @param {IGrid} parent - specifies the IGrid
     */
    function RowModelGenerator(parent) {
        this.parent = parent;
    }
    RowModelGenerator.prototype.generateRows = function (data, args) {
        var rows = [];
        var startIndex = this.parent.enableVirtualization && args ? args.startIndex : 0;
        startIndex = this.parent.enableInfiniteScrolling && args ? this.getInfiniteIndex(args) : startIndex;
        for (var i = 0, len = Object.keys(data).length; i < len; i++, startIndex++) {
            rows[i] = this.generateRow(data[i], startIndex);
        }
        return rows;
    };
    RowModelGenerator.prototype.ensureColumns = function () {
        //TODO: generate dummy column for group, detail here;
        var cols = [];
        if (this.parent.detailTemplate || this.parent.childGrid) {
            var args = {};
            this.parent.notify(events.detailIndentCellInfo, args);
            cols.push(this.generateCell(args, null, CellType.DetailExpand));
        }
        if (this.parent.isRowDragable()) {
            cols.push(this.generateCell({}, null, CellType.RowDragIcon));
        }
        return cols;
    };
    RowModelGenerator.prototype.generateRow = function (data, index, cssClass, indent, pid, tIndex, parentUid) {
        var options = {};
        options.foreignKeyData = {};
        options.uid = getUid('grid-row');
        options.data = data;
        options.index = index;
        options.indent = indent;
        options.tIndex = tIndex;
        options.isDataRow = true;
        options.parentGid = pid;
        options.parentUid = parentUid;
        if (this.parent.isPrinting) {
            if (this.parent.hierarchyPrintMode === 'All') {
                options.isExpand = true;
            }
            else if (this.parent.hierarchyPrintMode === 'Expanded' && this.parent.expandedRows && this.parent.expandedRows[index]) {
                options.isExpand = this.parent.expandedRows[index].isExpand;
            }
        }
        options.cssClass = cssClass;
        options.isAltRow = this.parent.enableAltRow ? index % 2 !== 0 : false;
        options.isAltRow = this.parent.enableAltRow ? index % 2 !== 0 : false;
        options.isSelected = this.parent.getSelectedRowIndexes().indexOf(index) > -1;
        this.refreshForeignKeyRow(options);
        var cells = this.ensureColumns();
        var row = new Row(options, this.parent);
        row.cells = this.parent.getFrozenMode() === 'Right' ? this.generateCells(options).concat(cells)
            : cells.concat(this.generateCells(options));
        return row;
    };
    RowModelGenerator.prototype.refreshForeignKeyRow = function (options) {
        var foreignKeyColumns = this.parent.getForeignKeyColumns();
        for (var i = 0; i < foreignKeyColumns.length; i++) {
            setValue(foreignKeyColumns[i].field, getForeignData(foreignKeyColumns[i], options.data), options.foreignKeyData);
        }
    };
    RowModelGenerator.prototype.generateCells = function (options) {
        var dummies = this.parent.getColumns();
        var tmp = [];
        for (var i = 0; i < dummies.length; i++) {
            tmp.push(this.generateCell(dummies[i], options.uid, isNullOrUndefined(dummies[i].commands) ? undefined : CellType.CommandColumn, null, i, options.foreignKeyData));
        }
        return tmp;
    };
    /**
     *
     * @param {Column} column - Defines column details
     * @param {string} rowId - Defines row id
     * @param {CellType} cellType  - Defines cell type
     * @param {number} colSpan - Defines colSpan
     * @param {number} oIndex - Defines index
     * @param {Object} foreignKeyData - Defines foreign key data
     * @returns {Cell<Column>} returns cell model
     * @hidden
     */
    RowModelGenerator.prototype.generateCell = function (column, rowId, cellType, colSpan, oIndex, foreignKeyData) {
        var opt = {
            'visible': column.visible,
            'isDataCell': !isNullOrUndefined(column.field || column.template),
            'isTemplate': !isNullOrUndefined(column.template),
            'rowID': rowId,
            'column': column,
            'cellType': !isNullOrUndefined(cellType) ? cellType : CellType.Data,
            'colSpan': colSpan,
            'commands': column.commands,
            'isForeignKey': column.isForeignColumn && column.isForeignColumn(),
            'foreignKeyData': column.isForeignColumn && column.isForeignColumn() && getValue(column.field, foreignKeyData)
        };
        if (opt.isDataCell || opt.column.type === 'checkbox' || opt.commands) {
            opt.index = oIndex;
        }
        return new Cell(opt);
    };
    RowModelGenerator.prototype.refreshRows = function (input) {
        for (var i = 0; i < input.length; i++) {
            this.refreshForeignKeyRow(input[i]);
            input[i].cells = this.generateCells(input[i]);
        }
        return input;
    };
    RowModelGenerator.prototype.getInfiniteIndex = function (args) {
        return args.requestType === 'infiniteScroll' || args.requestType === 'delete' || args.action === 'add'
            ? args.startIndex : 0;
    };
    return RowModelGenerator;
}());
export { RowModelGenerator };
