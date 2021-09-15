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
/* eslint-disable no-self-assign */
import { DiagramElement } from '../elements/diagram-element';
import { Canvas } from './canvas';
import { Container } from './container';
import { Size } from '../../primitives/size';
import { randomId } from '../../utility/base-util';
import { TextElement } from '../elements/text-element';
/**
 * Grid panel is used to arrange the children in a table like structure
 */
var GridPanel = /** @class */ (function (_super) {
    __extends(GridPanel, _super);
    function GridPanel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.childTable = [];
        _this.cellStyle = {};
        _this.desiredRowHeight = [];
        _this.desiredCellWidth = [];
        return _this;
    }
    /**
     * rowDefinitions method \
     *
     * @returns { RowDefinition[] } columnDefinitions method .\
     *
     * @private
     */
    GridPanel.prototype.rowDefinitions = function () {
        return this.rowDefns;
    };
    /**
     * columnDefinitions method \
     *
     * @returns { ColumnDefinition[] } columnDefinitions method .\
     *
     * @private
     */
    GridPanel.prototype.columnDefinitions = function () {
        return this.colDefns;
    };
    GridPanel.prototype.addObject = function (obj, rowId, columnId, rowSpan, columnSpan) {
        //check if exists
        if (this.rows.length >= rowId) {
            var row = this.rows[rowId];
            if (row.cells.length > columnId) {
                columnSpan = columnSpan || 1;
                rowSpan = rowSpan || 1;
                var cell = row.cells[columnId];
                cell.columnSpan = Math.max(columnSpan, cell.columnSpan);
                cell.rowSpan = Math.max(rowSpan, cell.rowSpan);
                var object = new GridCellItem();
                object = obj;
                object.rowId = rowId;
                object.columnId = columnId;
                object.columnSpan = columnSpan;
                this.childTable[object.id] = object;
                this.addObjectToCell(object, cell);
            }
        }
    };
    // public setCellStyle(rowId: number, columnId: number, cellStyle: ShapeStyleModel): void {
    //     if (this.rows.length > rowId) {
    //         let row: GridRow = this.rows[rowId];
    //         if (row.cells.length > columnId) {
    //             let cell: GridCell = row.cells[columnId];
    //             cell.style = cellStyle;
    //         }
    //     }
    // }
    // public getRowId(obj: DiagramElement): number {
    //     return (this.childTable[obj.id] as GridCellItem).rowId;
    // }
    // public getColumnId(obj: DiagramElement): number {
    //     return (this.childTable[obj.id] as GridCellItem).columnId;
    // }
    // public getRowSpan(obj: DiagramElement): number {
    //     return (this.childTable[obj.id] as GridCellItem).rowSpan;
    // }
    // public getColumnSpan(obj: DiagramElement): number {
    //     return (this.childTable[obj.id] as GridCellItem).columnSpan;
    // }
    GridPanel.prototype.addObjectToCell = function (obj, cell) {
        if (!cell.children) {
            cell.children = [];
        }
        // obj.minWidth = cell.desiredCellWidth; obj.minHeight = cell.desiredCellHeight;
        obj.style.strokeColor = 'black';
        obj.style.strokeWidth = 1;
        obj.style.fill = 'white';
        cell.children.push(obj);
    };
    /**
     * updateProperties method \
     *
     * @returns { void } updateProperties method .\
     * @param {number} offsetX - provide the Connector value.
     * @param {number} offsetY - provide the Connector value.
     * @param {number} width - provide the Connector value.
     * @param {number} height - provide the Connector value.
     *
     * @private
     */
    GridPanel.prototype.updateProperties = function (offsetX, offsetY, width, height) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
    };
    /**
     * setDefinitions method \
     *
     * @returns { void } setDefinitions method .\
     * @param {RowDefinition[]} rows - provide the rows value.
     * @param {ColumnDefinition[]} columns - provide the Connector value.
     *
     * @private
     */
    GridPanel.prototype.setDefinitions = function (rows, columns) {
        this.rowDefns = rows;
        this.colDefns = columns;
        this.children = [];
        this.rows = this.rows || [];
        for (var i = 0; i < rows.length; i++) {
            var rowDefn = rows[i];
            var row = new GridRow();
            row.cells = [];
            var defaultCell = new ColumnDefinition();
            //replace this 100 with a proper property
            defaultCell.width = this.width;
            var columns_1 = this.colDefns;
            if (columns_1 === undefined || columns_1.length < 1) {
                columns_1 = [defaultCell];
            }
            this.addCellInRow(columns_1, rowDefn, row);
            this.rows.push(row);
        }
    };
    /**
     * addCellInRow method \
     *
     * @returns { void } addCellInRow method .\
     * @param {ColumnDefinition[]} columns - provide the rows value.
     * @param {RowDefinition} rowDefn - provide the Connector value.
     * @param {GridRow} row - provide the Connector value.
     *
     * @private
     */
    GridPanel.prototype.addCellInRow = function (columns, rowDefn, row) {
        for (var j = 0; j < columns.length; j++) {
            var colDefn = columns[j];
            var cell = new GridCell();
            cell.children = [];
            this.cellStyle.fill = 'none';
            this.cellStyle.strokeColor = 'none';
            cell.id = randomId();
            cell.style = this.cellStyle;
            cell.desiredCellWidth = cell.minWidth = colDefn.width;
            cell.desiredCellHeight = cell.minHeight = rowDefn.height;
            row.cells.push(cell);
            this.children.push(cell);
        }
    };
    /**
     * calculateSize method \
     *
     * @returns { void } calculateSize method .\
     *
     * @private
     */
    GridPanel.prototype.calculateSize = function () {
        var rows = this.rows || [];
        var calculateHeight = 0;
        var calculateWidth = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = this.rows[i];
            calculateWidth = 0;
            for (var j = 0; j < row.cells.length; j++) {
                calculateWidth += row.cells[j].desiredCellWidth;
                if (j === row.cells.length - 1) {
                    if (this.width && this.width !== calculateWidth) {
                        row.cells[j].desiredCellWidth += (this.width - calculateWidth);
                        row.cells[j].minWidth = row.cells[j].desiredCellWidth;
                        if (row.cells[j].children && row.cells[j].children.length) {
                            row.cells[j].children[0].width = row.cells[j].desiredCellWidth;
                        }
                        this.colDefns[j].width = row.cells[j].desiredCellWidth;
                    }
                    calculateHeight += row.cells[j].desiredCellHeight;
                    if (i === rows.length - 1) {
                        if (this.height && this.height !== calculateHeight) {
                            var height = (this.height - calculateHeight);
                            if (height > 0) {
                                for (var k = 0; k < row.cells.length; k++) {
                                    row.cells[k].desiredCellHeight += height;
                                    row.cells[k].minHeight = row.cells[k].desiredCellHeight = row.cells[k].desiredCellHeight;
                                    if (row.cells[k].children && row.cells[k].children.length) {
                                        row.cells[k].children[0].height = row.cells[k].desiredCellHeight;
                                    }
                                }
                                this.rowDefns[i].height += height;
                            }
                        }
                    }
                }
            }
        }
    };
    /**
     * updateRowHeight method \
     *
     * @returns { void } updateRowHeight method .\
     * @param {number} rowId - provide the rows value.
     * @param {number} height - provide the Connector value.
     * @param {boolean} isConsiderChild - provide the Connector value.
     * @param {number} padding - provide the Connector value.
     *
     * @private
     */
    GridPanel.prototype.updateRowHeight = function (rowId, height, isConsiderChild, padding) {
        var row = this.rows[rowId];
        this.rowDefns[rowId].height = height;
        if (this.height !== undefined) {
            this.height += height - row.cells[0].desiredCellHeight;
        }
        for (var i = 0; i < row.cells.length; i++) {
            row.cells[i].desiredCellHeight = row.cells[i].minHeight = height;
            if (row.cells[i].children && row.cells[i].children.length) {
                row.cells[i].children[0].height = height;
                this.setTextRefresh(row.cells[i].children[0]);
            }
        }
        this.desiredRowHeight[rowId] = height;
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
        if (isConsiderChild) {
            var minHeight = (padding !== undefined) ? this.calculateCellHeightBasedOnChildren(rowId, padding) :
                this.calculateCellHeight(rowId);
            if (minHeight > height) {
                this.updateRowHeight(rowId, minHeight, false);
            }
        }
    };
    GridPanel.prototype.setTextRefresh = function (canvas) {
        if (canvas.children && canvas.children.length) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            var children = canvas.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i] instanceof TextElement) {
                    children[i].refreshTextElement();
                }
                if (children[i] instanceof Canvas) {
                    this.setTextRefresh(children[i]);
                }
            }
        }
    };
    /**
     * updateColumnWidth method \
     *
     * @returns { void } updateColumnWidth method .\
     * @param {number} colId - provide the rows value.
     * @param {number} width - provide the Connector value.
     * @param {boolean} isConsiderChild - provide the Connector value.
     * @param {number} padding - provide the Connector value.
     *
     * @private
     */
    GridPanel.prototype.updateColumnWidth = function (colId, width, isConsiderChild, padding) {
        this.colDefns[colId].width = width;
        if (this.width !== undefined) {
            this.width += width - this.rows[this.rows.length - 1].cells[colId].desiredCellWidth;
        }
        for (var i = 0; i < this.rows.length; i++) {
            this.setTextRefresh(this.rows[i].cells[0]);
            this.rows[i].cells[colId].desiredCellWidth = this.rows[i].cells[colId].minWidth = width;
            if (this.rows[i].cells[colId].children && this.rows[i].cells[colId].children.length) {
                this.rows[i].cells[colId].children[0].width = width;
            }
        }
        this.desiredCellWidth[colId] = width;
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
        if (isConsiderChild) {
            var minWidth = (padding !== undefined) ? this.calculateCellWidthBasedOnChildren(colId, padding) :
                this.calculateCellWidth(colId);
            if (minWidth > width) {
                this.updateColumnWidth(colId, minWidth, false);
            }
        }
    };
    GridPanel.prototype.calculateCellWidth = function (colIndex) {
        var maxWidth;
        var width;
        var cell;
        for (var i = 0; i < this.rows.length; i++) {
            cell = this.rows[i].cells[colIndex];
            if (cell.columnSpan === 1) {
                width = (cell.outerBounds.width > cell.bounds.width &&
                    (cell.children.length === 0 || cell.children[0].maxWidth === undefined)) ? cell.outerBounds.width : cell.bounds.width;
                if (maxWidth) {
                    maxWidth = (maxWidth < width) ? width : maxWidth;
                }
                else {
                    maxWidth = width;
                }
            }
        }
        return maxWidth;
    };
    GridPanel.prototype.calculateCellHeight = function (rowIndex) {
        var maxHeight;
        var height;
        var cell;
        var row = this.rows[rowIndex];
        for (var i = 0; i < row.cells.length; i++) {
            cell = row.cells[i];
            height = (cell.outerBounds.height > cell.bounds.height) ? cell.outerBounds.height : cell.bounds.height;
            if (maxHeight) {
                maxHeight = (maxHeight < height) ? height : maxHeight;
            }
            else {
                maxHeight = height;
            }
        }
        return maxHeight;
    };
    GridPanel.prototype.calculateCellSizeBasedOnChildren = function (cell, option, padding, maxSize) {
        var maxBounds;
        var canvas = (cell && cell.children.length > 0) ? cell.children[0] : undefined;
        if (canvas && cell.columnSpan === 1) {
            maxBounds = (option === 'Width') ? canvas.bounds.right : canvas.bounds.bottom;
            if (!maxSize) {
                maxSize = (option === 'Width') ? canvas.bounds.width : canvas.bounds.height;
            }
            for (var j = 0; j < canvas.children.length; j++) {
                var children = canvas.children[j];
                if (children instanceof Canvas) {
                    if (children.id.indexOf('header') === -1) {
                        var bounds = ((option === 'Width') ? children.bounds.right : children.bounds.bottom) + padding;
                        if (bounds > maxBounds) {
                            var size = (bounds - maxBounds) + ((option === 'Width') ? canvas.bounds.width : canvas.bounds.height);
                            if (maxSize) {
                                maxSize = (maxSize < size) ? size : maxSize;
                            }
                        }
                    }
                }
            }
        }
        return maxSize;
    };
    GridPanel.prototype.calculateCellWidthBasedOnChildren = function (colIndex, padding) {
        var maxWidth; //let width: number;  let maxBounds: number; let canvas: Canvas;
        var cell;
        for (var i = 0; i < this.rows.length; i++) {
            cell = this.rows[i].cells[colIndex];
            maxWidth = this.calculateCellSizeBasedOnChildren(cell, 'Width', padding, maxWidth);
        }
        return maxWidth;
    };
    GridPanel.prototype.calculateCellHeightBasedOnChildren = function (rowIndex, padding) {
        var maxHeight;
        var cell;
        // let maxBounds: number; let canvas: Canvas;
        var row = this.rows[rowIndex];
        for (var i = 0; i < row.cells.length; i++) {
            cell = row.cells[i];
            maxHeight = this.calculateCellSizeBasedOnChildren(cell, 'Height', padding, maxHeight);
        }
        return maxHeight;
    };
    /**
     * addRow method \
     *
     * @returns { void } addRow method .\
     * @param {number} rowId - provide the rowId value.
     * @param {number} rowDefn - provide the rowDefn value.
     * @param {boolean} isMeasure - provide the isMeasure value.
     *
     * @private
     */
    GridPanel.prototype.addRow = function (rowId, rowDefn, isMeasure) {
        if (this.rowDefns.length > 0) {
            this.rowDefns.splice(rowId, 0, rowDefn);
        }
        else {
            this.rowDefns.push(rowDefn);
        }
        var row = new GridRow();
        row.cells = [];
        var defaultCell = new ColumnDefinition();
        defaultCell.width = this.width;
        var columns = this.colDefns;
        this.addCellInRow(columns, rowDefn, row);
        if (rowId > this.rows.length - 1) {
            this.rows.push(row);
        }
        else {
            this.rows.splice(rowId, 0, row);
        }
        if (isMeasure) {
            this.measure(new Size(this.width, this.height));
            this.arrange(this.desiredSize);
        }
    };
    /**
     * addColumn method \
     *
     * @returns { void } addColumn method .\
     * @param {number} columnId - provide the rowId value.
     * @param {number} column - provide the rowDefn value.
     * @param {boolean} isMeasure - provide the isMeasure value.
     *
     * @private
     */
    GridPanel.prototype.addColumn = function (columnId, column, isMeasure) {
        var row;
        var rowDefn;
        var colDefn;
        var cell;
        var rows = this.rows;
        if (this.colDefns.length > 0) {
            this.colDefns.splice(columnId, 0, column);
        }
        else {
            this.colDefns.push(column);
        }
        if (this.width !== undefined) {
            this.width += column.width;
        }
        for (var i = 0; i < rows.length; i++) {
            row = rows[i];
            rowDefn = this.rowDefns[i];
            colDefn = column;
            cell = new GridCell();
            cell.style = this.cellStyle;
            cell.desiredCellWidth = cell.minWidth = colDefn.width;
            cell.desiredCellHeight = cell.minHeight = rowDefn.height;
            cell.children = [];
            if (columnId > row.cells.length - 1) {
                row.cells.push(cell);
            }
            else {
                row.cells.splice(columnId, 0, cell);
            }
            this.children.push(cell);
        }
        if (isMeasure) {
            this.measure(new Size(this.width, this.height));
            this.arrange(this.desiredSize);
        }
    };
    /**
     * removeRow method \
     *
     * @returns { void } removeRow method .\
     * @param {number} rowId - provide the rowId value.
     *
     * @private
     */
    GridPanel.prototype.removeRow = function (rowId) {
        var cell;
        var element;
        var rows = this.rows;
        var removeRow = rows[rowId];
        this.height -= this.rowDefns[rowId].height;
        for (var i = 0; i < removeRow.cells.length; i++) {
            cell = removeRow.cells[i];
            this.children.splice(this.children.indexOf(cell), 1);
            element = document.getElementById(cell.id + '_groupElement');
            if (element && element.parentElement) {
                element.parentElement.removeChild(element);
            }
        }
        this.rows.splice(rowId, 1);
        this.rowDefns.splice(rowId, 1);
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
    };
    /**
     * removeColumn method \
     *
     * @returns { void } removeColumn method .\
     * @param {number} columnId - provide the rowId value.
     *
     * @private
     */
    GridPanel.prototype.removeColumn = function (columnId) {
        var cell;
        var element;
        var rows = this.rows;
        this.width -= this.colDefns[columnId].width;
        for (var i = 0; i < rows.length; i++) {
            cell = rows[i].cells[columnId];
            this.children.splice(this.children.indexOf(cell), 1);
            element = document.getElementById(cell.id + '_groupElement');
            if (element && element.parentElement) {
                element.parentElement.removeChild(element);
            }
            rows[i].cells.splice(columnId, 1);
        }
        this.colDefns.splice(columnId, 1);
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
    };
    /**
     * updateRowIndex method \
     *
     * @returns { void } updateRowIndex method .\
     * @param {number} currentIndex - provide the rowId value.
     * @param {number} newIndex - provide the rowId value.
     *
     * @private
     */
    GridPanel.prototype.updateRowIndex = function (currentIndex, newIndex) {
        //const rows: GridRow[] = this.rows;
        var temp = this.rows[currentIndex];
        this.rows.splice(currentIndex, 1);
        this.rows.splice(newIndex, 0, temp);
        var tempRow = this.rowDefns[currentIndex];
        this.rowDefns.splice(currentIndex, 1);
        this.rowDefns.splice(newIndex, 0, tempRow);
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
    };
    /**
     * updateColumnIndex method \
     *
     * @returns { void } updateColumnIndex method .\
     * @param {number} startRowIndex - provide the startRowIndex value.
     * @param {number} currentIndex - provide the currentIndex value.
     * @param {number} newIndex - provide the newIndex value.
     *
     * @private
     */
    GridPanel.prototype.updateColumnIndex = function (startRowIndex, currentIndex, newIndex) {
        var temp;
        var cell;
        for (var i = startRowIndex; i < this.rows.length; i++) {
            temp = this.rows[i];
            cell = this.rows[i].cells[currentIndex];
            temp.cells.splice(currentIndex, 1);
            temp.cells.splice(newIndex, 0, cell);
        }
        var tempCol = this.colDefns[currentIndex];
        this.colDefns.splice(currentIndex, 1);
        this.colDefns.splice(newIndex, 0, tempCol);
        var tempSize = this.desiredCellWidth[currentIndex];
        this.desiredCellWidth.splice(currentIndex, 1);
        this.desiredCellWidth.splice(newIndex, 0, tempSize);
        this.measure(new Size(this.width, this.height));
        this.arrange(this.desiredSize);
    };
    /**
     * measure method \
     *
     * @returns { Size } measure method .\
     * @param {Size} availableSize - provide the startRowIndex value.
     *
     * @private
     */
    GridPanel.prototype.measure = function (availableSize) {
        var desired = undefined;
        if (this.rows !== undefined && this.rows.length > 0) {
            var i = 0;
            var j = 0;
            desired = new Size(0, 0);
            this.calculateSize();
            for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                j = 0;
                for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    var size = cell.measure(new Size(cell.desiredCellWidth, cell.desiredCellHeight));
                    if (cell.rowSpan === 1) {
                        if (j === 0 || this.desiredRowHeight[i] === undefined) {
                            this.desiredRowHeight[i] = size.height;
                        }
                        else {
                            this.desiredRowHeight[i] = Math.max(size.height, this.desiredRowHeight[i]);
                        }
                    }
                    if (cell.columnSpan === 1) {
                        if (i === 0 || this.desiredCellWidth[j] === undefined) {
                            this.desiredCellWidth[j] = size.width;
                        }
                        else {
                            this.desiredCellWidth[j] = Math.max(size.width, this.desiredCellWidth[j]);
                        }
                        if (i === this.rows.length - 1) {
                            desired.width += this.desiredCellWidth[j];
                        }
                    }
                    j++;
                }
                desired.height += this.desiredRowHeight[i];
                i++;
            }
            //to-do update definitions
            i = j = 0;
            var rowIndex = 0;
            for (var _d = 0, _e = this.rows; _d < _e.length; _d++) {
                var row = _e[_d];
                j = 0;
                var cellIndex = 0;
                for (var _f = 0, _g = row.cells; _f < _g.length; _f++) {
                    var cell = _g[_f];
                    if (cell.columnSpan !== 1) {
                        cell.desiredSize.width = 0;
                        for (var start = 0; start < cell.columnSpan; start++) {
                            if ((start + j) < row.cells.length) {
                                cell.desiredSize.width += this.desiredCellWidth[start + j];
                                cell.minWidth = cell.desiredSize.width;
                                cell.measure(cell.desiredSize);
                            }
                        }
                        j++;
                    }
                    else {
                        cell.desiredSize.width = this.desiredCellWidth[cellIndex];
                        cell.measure(cell.desiredSize);
                    }
                    if (cell.rowSpan !== 1) {
                        cell.desiredSize.height = 0;
                        for (var start = 0; start < cell.rowSpan; start++) {
                            if ((start + rowIndex) < this.rows.length) {
                                cell.desiredSize.height += this.desiredRowHeight[start + rowIndex];
                                cell.minHeight = cell.desiredSize.height;
                                cell.measure(cell.desiredSize);
                            }
                        }
                    }
                    else {
                        cell.desiredSize.height = this.desiredRowHeight[rowIndex];
                        cell.measure(cell.desiredSize);
                    }
                    i++;
                    cellIndex++;
                }
                rowIndex++;
            }
        }
        if (desired === undefined) {
            desired = _super.prototype.validateDesiredSize.call(this, desired, availableSize);
        }
        _super.prototype.stretchChildren.call(this, desired);
        this.desiredSize = desired;
        return desired;
    };
    /**
     * arrange method \
     *
     * @returns { Size } arrange method .\
     * @param {Size} desiredSize - provide the startRowIndex value.
     * @param {boolean} isChange - provide the startRowIndex value.
     *
     * @private
     */
    GridPanel.prototype.arrange = function (desiredSize, isChange) {
        var j = 0;
        var i = 0;
        if (this.rows !== undefined && this.rows.length > 0) {
            var x = this.offsetX - desiredSize.width * this.pivot.x;
            var y = this.offsetY - desiredSize.height * this.pivot.y;
            var cellX = x;
            for (var _i = 0, _a = this.rows; _i < _a.length; _i++) {
                var row = _a[_i];
                cellX = x;
                j = 0;
                for (var _b = 0, _c = row.cells; _b < _c.length; _b++) {
                    var cell = _c[_b];
                    var cellWidth = Math.max(this.desiredCellWidth[j], cell.desiredSize.width);
                    var cellHeight = Math.max(this.desiredRowHeight[i], cell.desiredSize.height);
                    cell.offsetX = cellX + cellWidth * cell.pivot.x;
                    cell.offsetY = y + cellHeight * cell.pivot.y;
                    cellX += this.desiredCellWidth[j];
                    cell.arrange(new Size(cellWidth, cellHeight));
                    j++;
                }
                y += this.desiredRowHeight[i];
                i++;
            }
            if (isChange) {
                // Need to remove the unwanted the child elements in the grid
                // Used for row span and column span.
                var cell = void 0;
                var row = void 0;
                var k = void 0;
                var z = void 0;
                var removeCell = void 0;
                for (i = 0; i < this.rows.length; i++) {
                    row = this.rows[i];
                    for (j = 0; j < row.cells.length; j++) {
                        cell = row.cells[j];
                        if (cell.columnSpan > 1) {
                            // remove a child element when a column span is greater than 1
                            this.children.splice((this.children.indexOf(cell)) + 1, cell.columnSpan - 1);
                        }
                        if (cell.rowSpan > 1) {
                            for (k = i, z = 0; ((k + cell.rowSpan - 1) < this.rows.length && z < cell.rowSpan - 1); k++, z++) {
                                removeCell = this.rows[k + 1].cells[j];
                                // remove a child element when a row span is greater than 1
                                this.children.splice(this.children.indexOf(removeCell), 1);
                            }
                        }
                    }
                }
            }
        }
        this.actualSize = desiredSize;
        this.updateBounds();
        return desiredSize;
    };
    return GridPanel;
}(Container));
export { GridPanel };
/**
 * Defines the behavior of the RowDefinition of node
 */
var RowDefinition = /** @class */ (function () {
    function RowDefinition() {
        /** returns the height of node */
        this.height = undefined;
    }
    return RowDefinition;
}());
export { RowDefinition };
/**
 * Defines the behavior of the ColumnDefinition of node
 */
var ColumnDefinition = /** @class */ (function () {
    function ColumnDefinition() {
        /** returns the width of node */
        this.width = undefined;
    }
    return ColumnDefinition;
}());
export { ColumnDefinition };
/** @private */
var GridRow = /** @class */ (function () {
    function GridRow() {
        this.cells = null;
    }
    return GridRow;
}());
export { GridRow };
/** @private */
var GridCell = /** @class */ (function (_super) {
    __extends(GridCell, _super);
    function GridCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.columnSpan = 1;
        _this.rowSpan = 1;
        return _this;
    }
    return GridCell;
}(Canvas));
export { GridCell };
var GridCellItem = /** @class */ (function (_super) {
    __extends(GridCellItem, _super);
    function GridCellItem() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.rowId = 0;
        _this.columnId = 0;
        _this.rowSpan = 1;
        _this.columnSpan = 1;
        return _this;
    }
    return GridCellItem;
}(DiagramElement));
