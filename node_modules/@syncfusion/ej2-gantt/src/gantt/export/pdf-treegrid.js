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
import { PdfTreeGridColumnCollection, PdfTreeGridHeaderCollection, PdfTreeGridRowCollection } from './pdf-base/index';
import { PdfTreeGridStyle, PdfBorders, PdfTreeGridLayouter } from './pdf-base/index';
import { PdfLayoutElement, RectangleF, PdfLayoutFormat, PointF, SizeF } from '@syncfusion/ej2-pdf-export';
/**
 * PdfTreeGrid Class for EJ2-PDF
 */
var PdfTreeGrid = /** @class */ (function (_super) {
    __extends(PdfTreeGrid, _super);
    function PdfTreeGrid() {
        var _this = _super.call(this) || this;
        _this.treeGridSize = new SizeF(0, 0);
        _this.treeColumnIndex = 0;
        _this.allowRowBreakAcrossPages = true;
        _this.enableHeader = true;
        _this.isFitToWidth = false;
        _this.columns = new PdfTreeGridColumnCollection(_this);
        _this.rows = new PdfTreeGridRowCollection(_this);
        _this.headers = new PdfTreeGridHeaderCollection(_this);
        _this.style = new PdfTreeGridStyle();
        _this.rowHeight = 0;
        return _this;
    }
    Object.defineProperty(PdfTreeGrid.prototype, "raiseBeginCellDraw", {
        //Properties
        /**
         * Gets a value indicating whether the `start cell layout event` should be raised.
         *
         * @returns {boolean} .
         * @private
         */
        get: function () {
            // eslint-disable-next-line
            return (typeof this.beginCellDraw !== 'undefined' && typeof this.beginCellDraw !== null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGrid.prototype, "raiseEndCellDraw", {
        /**
         * Gets a value indicating whether the `end cell layout event` should be raised.
         *
         * @returns {boolean} .
         * @private
         */
        get: function () {
            // eslint-disable-next-line
            return (typeof this.endCellDraw !== 'undefined' && typeof this.endCellDraw !== null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGrid.prototype, "size", {
        get: function () {
            if ((this.treeGridSize.width === 0 && this.treeGridSize.height === 0)) {
                this.treeGridSize = this.calculateTreeGridSize();
            }
            return this.treeGridSize;
        },
        set: function (value) {
            this.treeGridSize = value;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * `Draws` the element on the page with the specified page, 'RectangleF' class and layout format
     *
     * @private
     */
    /* eslint-disable-next-line */
    PdfTreeGrid.prototype.draw = function (arg1, arg2, arg3, arg4) {
        if (arg2 instanceof PointF && typeof arg2.width === 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(arg1, arg2.x, arg2.y);
        }
        else if (typeof arg2 === 'number' && typeof arg3 === 'number' && typeof arg4 === 'undefined') {
            return this.drawHelper(arg1, arg2, arg3, null);
        }
        else if (arg2 instanceof RectangleF && typeof arg2.width !== 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(arg1, arg2, null);
        }
        else if (arg2 instanceof PointF && typeof arg2.width === 'undefined' && arg3 instanceof PdfLayoutFormat) {
            return this.drawHelper(arg1, arg2.x, arg2.y, arg3);
        }
        else if (typeof arg2 === 'number' && typeof arg3 === 'number' && (arg4 instanceof PdfLayoutFormat || arg4 == null)) {
            var width = (arg1.graphics.clientSize.width - arg2);
            var layoutRectangle = new RectangleF(arg2, arg3, width, 0);
            return this.drawHelper(arg1, layoutRectangle, arg4);
        }
        else if (arg2 instanceof RectangleF && typeof arg2.width !== 'undefined' && typeof arg3 === 'boolean') {
            return this.drawHelper(arg1, arg2, null);
        }
        else {
            return this.drawHelper(arg1, arg2, arg3);
        }
    };
    PdfTreeGrid.prototype.measureColumnsWidth = function (bounds) {
        if (typeof bounds !== 'undefined') {
            var widths = this.columns.getDefaultWidths(bounds.width - bounds.x);
            for (var i = 0; i < this.columns.count; i++) {
                if (this.columns.getColumn(i).width < 0) {
                    this.columns.getColumn(i).width = widths[i];
                }
            }
        }
        else {
            var widths = [];
            var cellWidth = 0;
            var totalWidth = 0;
            var rowLevel = 0;
            // if(this.headers.count > 0){
            //     let colCount: number = this.headers.getHeader(0).cells.count;
            //     for(let i: number = 0; i < colCount; i++){
            //         let rowCount: number = this.headers.count;
            //         for(let j: number = 0; j < rowCount; j++){
            //             let tempWidth: number = this.headers.getHeader(j).cells.getCell(i).width;
            //             let rowWidth: number = this.initialWidth > 0 ? Math.min(this.initialWidth, tempWidth) :
            //                 tempWidth;
            //             cellWidth = Math.max(cellWidth, rowWidth);
            //         }
            //         widths.push(cellWidth);
            //     }
            // }
            var colCount = this.columns.count;
            for (var i = 0; i < colCount; i++) {
                var rowCount = this.rows.count;
                for (var j = 0; j < rowCount; j++) {
                    var tempWidth = this.rows.getRow(j).cells.getCell(i).width;
                    var rowWidth = this.initialWidth > 0 ? Math.min(this.initialWidth, tempWidth) : tempWidth;
                    cellWidth = Math.max(cellWidth, rowWidth);
                    cellWidth = Math.max(this.columns.getColumn(i).width, cellWidth);
                    if (this.columns.getColumn(i).isTreeColumn) {
                        rowLevel = Math.max(rowLevel, this.rows.getRow(j).level);
                    }
                }
                if (this.columns.getColumn(i).isTreeColumn) {
                    widths.push(cellWidth + (rowLevel * 10));
                }
                else {
                    widths.push(cellWidth);
                }
                // eslint-disable-next-line
                totalWidth += cellWidth;
                cellWidth = 0;
            }
            for (var i = 0; i < this.columns.count; i++) {
                if (this.columns.getColumn(i).width < 0) {
                    this.columns.getColumn(i).width = widths[i];
                }
            }
        }
    };
    PdfTreeGrid.prototype.calculateTreeGridSize = function () {
        var height = 0;
        var width = this.columns.width;
        for (var i = 0; i < this.headers.count; i++) {
            var row = this.headers.getHeader(i);
            height += row.height;
        }
        for (var i = 0; i < this.rows.count; i++) {
            var row = this.rows.getRow(i);
            height += row.height;
        }
        return new SizeF(width, height);
    };
    PdfTreeGrid.prototype.drawGrid = function (page, x, y, format) {
        this.initialWidth = page.graphics.clientSize.width;
        var layout = new RectangleF(0, 0, page.getClientSize().height, 0);
        return this.draw(page, layout, format);
    };
    PdfTreeGrid.prototype.layout = function (param) {
        if (this.rows.count !== 0) {
            var style = this.rows.getRow(0).cells.getCell(0).style;
            if (style.borders.left.width !== 1) {
                var x = style.borders.left.width / 2;
                var y = style.borders.top.width / 2;
                if (param.bounds.x === PdfBorders.default.right.width / 2 &&
                    param.bounds.y === PdfBorders.default.right.width / 2) {
                    var newBound = new RectangleF(new PointF(x, y), new SizeF(this.size.width, this.size.height));
                    param.bounds = newBound;
                }
            }
        }
        this.setSpan();
        this.layouter = new PdfTreeGridLayouter(this);
        var result = this.layouter.layoutInternal(param);
        return result;
    };
    PdfTreeGrid.prototype.onBeginCellDraw = function (args) {
        if (this.raiseBeginCellDraw) {
            this.beginCellDraw(this, args);
        }
    };
    PdfTreeGrid.prototype.onEndCellDraw = function (args) {
        if (this.raiseEndCellDraw) {
            this.endCellDraw(this, args);
        }
    };
    PdfTreeGrid.prototype.setSpan = function () {
        var colSpan = 1;
        var rowSpan = 1;
        var currentCellIndex = 0;
        var currentRowIndex = 0;
        var maxSpan = 0;
        var rowCount = this.headers.count;
        for (var i = 0; i < rowCount; i++) {
            var row = this.headers.getHeader(i);
            maxSpan = 0;
            var colCount = row.cells.count;
            for (var j = 0; j < colCount; j++) {
                var cell = row.cells.getCell(j);
                maxSpan = Math.max(maxSpan, cell.rowSpan);
                //Skip setting span map for already coverted rows/columns.
                if (!cell.isCellMergeContinue && !cell.isRowMergeContinue && (cell.columnSpan > 1 || cell.rowSpan > 1)) {
                    if (cell.columnSpan + j > row.cells.count) {
                        throw new Error('Invalid span specified at row ' + j.toString() + ' column ' + i.toString());
                    }
                    if (cell.rowSpan + i > this.headers.count) {
                        throw new Error('Invalid span specified at Header ' + j.toString() + ' column ' + i.toString());
                    }
                    if (cell.columnSpan > 1 && cell.rowSpan > 1) {
                        colSpan = cell.columnSpan;
                        rowSpan = cell.rowSpan;
                        currentCellIndex = j;
                        currentRowIndex = i;
                        cell.isCellMergeStart = true;
                        cell.isRowMergeStart = true;
                        //Set Column merges for first row
                        while (colSpan > 1) {
                            currentCellIndex++;
                            row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                            row.cells.getCell(currentCellIndex).isRowMergeContinue = true;
                            row.cells.getCell(currentCellIndex).rowSpan = rowSpan;
                            colSpan--;
                        }
                        currentCellIndex = j;
                        colSpan = cell.columnSpan;
                        //Set Row Merges and column merges foreach subsequent rows.
                        while (rowSpan > 1) {
                            currentRowIndex++;
                            this.headers.getHeader(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                            this.headers.getHeader(currentRowIndex).cells.getCell(currentCellIndex).isRowMergeContinue = true;
                            rowSpan--;
                            while (colSpan > 1) {
                                currentCellIndex++;
                                this.headers.getHeader(currentRowIndex).cells.getCell(currentCellIndex).isCellMergeContinue = true;
                                this.headers.getHeader(currentRowIndex).cells.getCell(currentCellIndex).isRowMergeContinue = true;
                                colSpan--;
                            }
                            colSpan = cell.columnSpan;
                            currentCellIndex = j;
                        }
                    }
                    else if (cell.columnSpan > 1 && cell.rowSpan === 1) {
                        colSpan = cell.columnSpan;
                        currentCellIndex = j;
                        cell.isCellMergeStart = true;
                        //Set Column merges.
                        while (colSpan > 1) {
                            currentCellIndex++;
                            row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                            colSpan--;
                        }
                    }
                    else if (cell.columnSpan === 1 && cell.rowSpan > 1) {
                        rowSpan = cell.rowSpan;
                        currentRowIndex = i;
                        //Set row Merges.
                        while (rowSpan > 1) {
                            currentRowIndex++;
                            this.headers.getHeader(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                            rowSpan--;
                        }
                    }
                }
            }
            row.maximumRowSpan = maxSpan;
        }
        colSpan = rowSpan = 1;
        currentCellIndex = currentRowIndex = 0;
        rowCount = this.rows.count;
        for (var i = 0; i < rowCount; i++) {
            var row = this.rows.getRow(i);
            var colcount = row.cells.count;
            for (var j = 0; j < colcount; j++) {
                var cell = row.cells.getCell(j);
                //Skip setting span map for already coverted rows/columns.
                if (!cell.isCellMergeContinue && !cell.isRowMergeContinue && (cell.columnSpan > 1 || cell.rowSpan > 1)) {
                    if (cell.columnSpan + j > row.cells.count) {
                        throw new Error('Invalid span specified at row {0} column {1} ' + j.toString());
                    }
                    if (cell.rowSpan + i > this.rows.count) {
                        throw new Error('Invalid span specified at row {0} column {1} ' + j.toString());
                    }
                    if (cell.columnSpan > 1 && cell.rowSpan > 1) {
                        colSpan = cell.columnSpan;
                        rowSpan = cell.rowSpan;
                        currentCellIndex = j;
                        currentRowIndex = i;
                        cell.isCellMergeStart = true;
                        cell.isRowMergeStart = true;
                        //set Column merges for first row.
                        while (colSpan > 1) {
                            currentCellIndex++;
                            row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                            colSpan--;
                        }
                        currentCellIndex = j;
                        colSpan = cell.columnSpan;
                        // Set row merges and column merges for each subsequentt rows.
                        while (rowSpan > 1) {
                            currentRowIndex++;
                            this.rows.getRow(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                            rowSpan--;
                            while (colSpan > 1) {
                                currentCellIndex++;
                                this.rows.getRow(currentRowIndex).cells.getCell(currentCellIndex).isCellMergeContinue = true;
                                colSpan--;
                            }
                            colSpan = cell.columnSpan;
                            currentCellIndex = j;
                        }
                    }
                    else if (cell.columnSpan > 1 && cell.rowSpan === 1) {
                        colSpan = cell.columnSpan;
                        currentCellIndex = j;
                        cell.isCellMergeStart = true;
                        //set Column merges.
                        while (colSpan > 1) {
                            currentCellIndex++;
                            row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                            colSpan--;
                        }
                    }
                    else if (cell.columnSpan === 1 && cell.rowSpan > 1) {
                        rowSpan = cell.rowSpan;
                        currentRowIndex = i;
                        //set row merges.
                        while (rowSpan > 1) {
                            currentRowIndex++;
                            this.rows.getRow(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                            rowSpan--;
                        }
                    }
                }
            }
        }
    };
    return PdfTreeGrid;
}(PdfLayoutElement));
export { PdfTreeGrid };
