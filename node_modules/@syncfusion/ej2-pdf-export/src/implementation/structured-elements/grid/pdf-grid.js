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
/**
 * PdfGrid.ts class for EJ2-PDF
 */
import { PdfGridColumnCollection } from './pdf-grid-column';
import { PdfGridRowCollection, PdfGridHeaderCollection } from './pdf-grid-row';
import { RectangleF, SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfLayoutElement } from './../../graphics/figures/layout-element';
import { PdfLayoutFormat } from './../../graphics/figures/base/element-layouter';
import { PdfGridStyle } from './styles/style';
import { PdfBorders } from './styles/pdf-borders';
import { PdfGridLayouter } from './../../structured-elements/grid/layout/grid-layouter';
var PdfGrid = /** @class */ (function (_super) {
    __extends(PdfGrid, _super);
    //constructor
    /**
     * Initialize a new instance for `PdfGrid` class.
     * @private
     */
    function PdfGrid() {
        var _this = _super.call(this) || this;
        /**
         * @hidden
         * @private
         */
        _this.gridSize = new SizeF(0, 0);
        /**
         * Check the child grid is ' split or not'
         */
        _this.isGridSplit = false;
        /**
         * @hidden
         * @private
         */
        _this.isRearranged = false;
        /**
         * @hidden
         * @private
         */
        _this.pageBounds = new RectangleF();
        /**
         * @hidden
         * @private
         */
        _this.listOfNavigatePages = [];
        /**
         * @hidden
         * @private
         */
        _this.parentCellIndex = 0;
        _this.tempWidth = 0;
        /**
         * @hidden
         * @private
         */
        _this.breakRow = true;
        _this.splitChildRowIndex = -1;
        /**
         * The event raised on `begin cell lay outing`.
         * @event
         * @private
         */
        //public beginPageLayout : Function;
        /**
         * The event raised on `end cell lay outing`.
         * @event
         * @private
         */
        //public endPageLayout : Function;
        _this.hasRowSpanSpan = false;
        _this.hasColumnSpan = false;
        _this.isSingleGrid = true;
        return _this;
    }
    Object.defineProperty(PdfGrid.prototype, "raiseBeginCellDraw", {
        //Properties
        /**
         * Gets a value indicating whether the `start cell layout event` should be raised.
         * @private
         */
        get: function () {
            return (typeof this.beginCellDraw !== 'undefined' && typeof this.beginCellDraw !== null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "raiseEndCellDraw", {
        /**
         * Gets a value indicating whether the `end cell layout event` should be raised.
         * @private
         */
        get: function () {
            return (typeof this.endCellDraw !== 'undefined' && typeof this.endCellDraw !== null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "repeatHeader", {
        /**
         * Gets or sets a value indicating whether to `repeat header`.
         * @private
         */
        get: function () {
            if (this.bRepeatHeader == null || typeof this.bRepeatHeader === 'undefined') {
                this.bRepeatHeader = false;
            }
            return this.bRepeatHeader;
        },
        set: function (value) {
            this.bRepeatHeader = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "allowRowBreakAcrossPages", {
        /**
         * Gets or sets a value indicating whether to split or cut rows that `overflow a page`.
         * @private
         */
        get: function () {
            return this.breakRow;
        },
        set: function (value) {
            this.breakRow = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "columns", {
        /**
         * Gets the `column` collection of the PdfGrid.[Read-Only]
         * @private
         */
        get: function () {
            if (this.gridColumns == null || typeof this.gridColumns === 'undefined') {
                this.gridColumns = new PdfGridColumnCollection(this);
            }
            return this.gridColumns;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "rows", {
        /**
         * Gets the `row` collection from the PdfGrid.[Read-Only]
         * @private
         */
        get: function () {
            if (this.gridRows == null) {
                this.gridRows = new PdfGridRowCollection(this);
            }
            return this.gridRows;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "headers", {
        /**
         * Gets the `headers` collection from the PdfGrid.[Read-Only]
         * @private
         */
        get: function () {
            if (this.gridHeaders == null || typeof this.gridHeaders === 'undefined') {
                this.gridHeaders = new PdfGridHeaderCollection(this);
            }
            return this.gridHeaders;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "initialWidth", {
        /**
         * Indicating `initial width` of the page.
         * @private
         */
        get: function () {
            return this.gridInitialWidth;
        },
        set: function (value) {
            this.gridInitialWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "style", {
        /**
         * Gets or sets the `grid style`.
         * @private
         */
        get: function () {
            if (this.gridStyle == null) {
                this.gridStyle = new PdfGridStyle();
            }
            return this.gridStyle;
        },
        set: function (value) {
            if (this.gridStyle == null) {
                this.gridStyle = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "isPageWidth", {
        /**
         * Gets a value indicating whether the grid column width is considered to be `page width`.
         * @private
         */
        get: function () {
            return this.ispageWidth;
        },
        set: function (value) {
            this.ispageWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "isChildGrid", {
        /**
         * Gets or set if grid `is nested grid`.
         * @private
         */
        get: function () {
            return this.ischildGrid;
        },
        set: function (value) {
            this.ischildGrid = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "size", {
        /**
         * Gets or set if grid ' is split or not'
         * @public
         */
        // public get isGridSplit() : boolean {
        //     return this.isgridSplit;
        // }
        // public set isGridSplit(value : boolean) {
        //     this.isgridSplit = value;
        // }public get isGridSplit() : boolean {
        //     return this.isgridSplit;
        // }
        // public set isGridSplit(value : boolean) {
        //     this.isgridSplit = value;
        // }
        /**
         * Gets the `size`.
         * @private
         */
        get: function () {
            if ((this.gridSize.width === 0 || typeof this.gridSize.width === 'undefined') && this.gridSize.height === 0) {
                this.gridSize = this.measure();
            }
            return this.gridSize;
            // } else {
            //     return this.gridSize;
            // }
        },
        set: function (value) {
            this.gridSize = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "ParentCell", {
        get: function () {
            return this.parentCell;
        },
        set: function (value) {
            this.parentCell = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGrid.prototype, "LayoutFormat", {
        get: function () {
            return this.layoutFormat;
        },
        enumerable: true,
        configurable: true
    });
    PdfGrid.prototype.draw = function (arg1, arg2, arg3, arg4) {
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
    /**
     * `measures` this instance.
     * @private
     */
    PdfGrid.prototype.measure = function () {
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
    PdfGrid.prototype.onBeginCellDraw = function (args) {
        if (this.raiseBeginCellDraw) {
            this.beginCellDraw(this, args);
        }
    };
    PdfGrid.prototype.onEndCellDraw = function (args) {
        if (this.raiseEndCellDraw) {
            this.endCellDraw(this, args);
        }
    };
    /**
     * `Layouts` the specified graphics.
     * @private
     */
    PdfGrid.prototype.layout = function (param) {
        if (this.rows.count !== 0) {
            var currentRow = this.rows.getRow(0).cells.getCell(0).style;
            if (currentRow.borders != null && ((currentRow.borders.left != null && currentRow.borders.left.width !== 1) ||
                (currentRow.borders.top != null && currentRow.borders.top.width !== 1))) {
                var x = currentRow.borders.left.width / 2;
                var y = currentRow.borders.top.width / 2;
                if (param.bounds.x === PdfBorders.default.right.width / 2 && param.bounds.y === PdfBorders.default.right.width / 2) {
                    var newBound = new RectangleF(x, y, this.gridSize.width, this.gridSize.height);
                    param.bounds = newBound;
                }
            }
        }
        this.setSpan();
        this.checkSpan();
        this.layoutFormat = param.format;
        this.gridLocation = param.bounds;
        var layouter = new PdfGridLayouter(this);
        var result = (layouter.Layouter(param));
        return result;
    };
    PdfGrid.prototype.setSpan = function () {
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
                    // if (this.rows.count !== 0 && cell.rowSpan + i > this.rows.count) {
                    //     throw new Error('Invalid span specified at row ' + j.toString() + ' column ' + i.toString());
                    // }
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
    };
    PdfGrid.prototype.checkSpan = function () {
        var cellcolSpan;
        var cellrowSpan = 1;
        var cellmaxSpan = 0;
        var currentCellIndex;
        var currentRowIndex = 0;
        cellcolSpan = cellrowSpan = 1;
        currentCellIndex = currentRowIndex = 0;
        if (this.hasRowSpanSpan || this.hasColumnSpan) {
            var rowCount = this.rows.count;
            for (var i = 0; i < rowCount; i++) {
                var row = this.rows.getRow(i);
                cellmaxSpan = 0;
                var colCount = row.cells.count;
                for (var j = 0; j < colCount; j++) {
                    var cell = row.cells.getCell(j);
                    cellmaxSpan = Math.max(cellmaxSpan, cell.rowSpan);
                    //Skip setting span map for already coverted rows/columns.
                    if (!cell.isCellMergeContinue && !cell.isRowMergeContinue
                        && (cell.columnSpan > 1 || cell.rowSpan > 1)) {
                        if (cell.columnSpan + j > row.cells.count) {
                            throw new Error('Invalid span specified at row  ' + j.toString() + ' column ' + i.toString());
                        }
                        if (cell.rowSpan + i > this.rows.count) {
                            throw new Error('Invalid span specified at row  ' + j.toString() + ' column ' + i.toString());
                        }
                        if (cell.columnSpan > 1 && cell.rowSpan > 1) {
                            cellcolSpan = cell.columnSpan;
                            cellrowSpan = cell.rowSpan;
                            currentCellIndex = j;
                            currentRowIndex = i;
                            cell.isCellMergeStart = true;
                            cell.isRowMergeStart = true;
                            //Set Column merges for first row
                            while (cellcolSpan > 1) {
                                currentCellIndex++;
                                row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                                row.cells.getCell(currentCellIndex).isRowMergeContinue = true;
                                cellcolSpan--;
                            }
                            currentCellIndex = j;
                            cellcolSpan = cell.columnSpan;
                            //Set Row Merges and column merges foreach subsequent rows.
                            while (cellrowSpan > 1) {
                                currentRowIndex++;
                                this.rows.getRow(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                                this.rows.getRow(currentRowIndex).cells.getCell(currentCellIndex).isRowMergeContinue = true;
                                cellrowSpan--;
                                while (cellcolSpan > 1) {
                                    currentCellIndex++;
                                    this.rows.getRow(currentRowIndex).cells.getCell(currentCellIndex).isCellMergeContinue = true;
                                    this.rows.getRow(currentRowIndex).cells.getCell(currentCellIndex).isRowMergeContinue = true;
                                    cellcolSpan--;
                                }
                                cellcolSpan = cell.columnSpan;
                                currentCellIndex = j;
                            }
                        }
                        else if (cell.columnSpan > 1 && cell.rowSpan === 1) {
                            cellcolSpan = cell.columnSpan;
                            currentCellIndex = j;
                            cell.isCellMergeStart = true;
                            //Set Column merges.
                            while (cellcolSpan > 1) {
                                currentCellIndex++;
                                row.cells.getCell(currentCellIndex).isCellMergeContinue = true;
                                cellcolSpan--;
                            }
                        }
                        else if (cell.columnSpan === 1 && cell.rowSpan > 1) {
                            cellrowSpan = cell.rowSpan;
                            currentRowIndex = i;
                            //Set row Merges.
                            while (cellrowSpan > 1) {
                                currentRowIndex++;
                                this.rows.getRow(currentRowIndex).cells.getCell(j).isRowMergeContinue = true;
                                cellrowSpan--;
                            }
                        }
                    }
                }
                row.maximumRowSpan = cellmaxSpan;
            }
        }
    };
    PdfGrid.prototype.measureColumnsWidth = function (bounds) {
        if (typeof bounds !== 'undefined') {
            this.isPageWidth = false;
            var widths = this.columns.getDefaultWidths(bounds.width - bounds.x);
            //let tempWidth : number = this.columns.getColumn(0).width;
            for (var i = 0, count = this.columns.count; i < count; i++) {
                // if (this.columns.getColumn(i).width < 0)
                //     this.columns.getColumn(i).columnWidth = widths[i];
                // else if (this.columns.getColumn(i).width > 0 && !this.columns.getColumn(i).isCustomWidth && widths[i]>0 && this.isComplete)
                this.columns.getColumn(i).columnWidth = widths[i];
                this.tempWidth = widths[i];
            }
            if (this.ParentCell != null && this.style.allowHorizontalOverflow == false && this.ParentCell.row.grid.style.allowHorizontalOverflow == false) {
                var padding = 0;
                var columnWidth = 0;
                var columnCount = this.columns.count;
                var childGridColumnWidth = 0;
                if (this.ParentCell.style.cellPadding != null || typeof this.ParentCell.style.cellPadding !== 'undefined') {
                    if (typeof this.ParentCell.style.cellPadding.left != 'undefined' && this.ParentCell.style.cellPadding.hasLeftPad) {
                        padding += this.ParentCell.style.cellPadding.left;
                    }
                    if (typeof this.ParentCell.style.cellPadding.right != 'undefined' && this.ParentCell.style.cellPadding.hasRightPad) {
                        padding += this.ParentCell.style.cellPadding.right;
                    }
                }
                for (var i = 0; i < this.ParentCell.columnSpan; i++) {
                    columnWidth += this.ParentCell.row.grid.columns.getColumn(this.parentCellIndex + i).width;
                }
                for (var j = 0; j < this.columns.count; j++) {
                    if (this.gridColumns.getColumn(j).width > 0 && this.gridColumns.getColumn(j).isCustomWidth) {
                        columnWidth -= this.gridColumns.getColumn(j).width;
                        columnCount--;
                    }
                }
                if ((this.ParentCell.row.grid.style.cellPadding != null || typeof this.ParentCell.row.grid.style.cellPadding != 'undefined')) {
                    if (typeof this.ParentCell.row.grid.style.cellPadding.top != 'undefined' && this.ParentCell.row.grid.style.cellPadding.hasTopPad) {
                        padding += this.ParentCell.row.grid.style.cellPadding.top;
                    }
                    if (typeof this.ParentCell.row.grid.style.cellPadding.bottom != 'undefined' && this.ParentCell.row.grid.style.cellPadding.hasBottomPad) {
                        padding += this.ParentCell.row.grid.style.cellPadding.bottom;
                    }
                }
                if (this.ParentCell.row.grid.style.cellSpacing != 0) {
                    columnWidth -= this.ParentCell.row.grid.style.cellSpacing * 2;
                }
                if (columnWidth > padding) {
                    childGridColumnWidth = (columnWidth - padding) / columnCount;
                    this.tempWidth = childGridColumnWidth;
                    if (this.ParentCell != null) {
                        for (var j = 0; j < this.columns.count; j++) {
                            if (!this.columns.getColumn(j).isCustomWidth)
                                this.columns.getColumn(j).columnWidth = childGridColumnWidth;
                        }
                    }
                }
            }
            // if (this.ParentCell != null && this.ParentCell.row.width > 0)
            // {
            //     if (this.isChildGrid && this.gridSize.width > this.ParentCell.row.width)
            //     {
            //         widths = this.columns.getDefaultWidths(bounds.width);
            //         for (let i : number = 0; i < this.columns.count; i++)
            //         {
            //             this.columns.getColumn(i).width = widths[i];
            //         }
            //     }
            // }
        }
        else {
            var widths = [this.columns.count];
            for (var n = 0; n < this.columns.count; n++) {
                widths[n] = 0;
            }
            var cellWidth = 0;
            var cellWidths = 0;
            if ((typeof this.isChildGrid === 'undefined' && typeof this.gridLocation !== 'undefined') || (this.isChildGrid === null && typeof this.gridLocation !== 'undefined')) {
                this.initialWidth = this.gridLocation.width;
            }
            if (this.headers.count > 0) {
                var colCount_1 = this.headers.getHeader(0).cells.count;
                var rowCount = this.headers.count;
                for (var i = 0; i < colCount_1; i++) {
                    cellWidth = 0;
                    for (var j = 0; j < rowCount; j++) {
                        var rowWidth = Math.min(this.initialWidth, this.headers.getHeader(j).cells.getCell(i).width);
                        cellWidth = Math.max(cellWidth, rowWidth);
                    }
                    widths[i] = cellWidth;
                }
            }
            // else {
            //     let colCount : number = this.rows.getRow(0).cells.count;
            //     let rowCount : number = this.rows.count;
            //     for (let i : number = 0; i < colCount; i++) {
            //         cellWidth = 0;
            //         for (let j : number = 0; j < rowCount; j++) {
            //             let rowWidth : number = Math.min(this.initialWidth, this.rows.getRow(j).cells.getCell(i).width);
            //             cellWidth = Math.max(cellWidth, rowWidth);
            //         }
            //         widths[i] = cellWidth;
            //     }
            // }
            cellWidth = 0;
            for (var i = 0, colCount_2 = this.columns.count; i < colCount_2; i++) {
                for (var j = 0, rowCount = this.rows.count; j < rowCount; j++) {
                    if ((this.rows.getRow(j).cells.getCell(i).columnSpan == 1 && !this.rows.getRow(j).cells.getCell(i).isCellMergeContinue) || this.rows.getRow(j).cells.getCell(i).value != null) {
                        if (this.rows.getRow(j).cells.getCell(i).value != null && !this.rows.getRow(j).grid.style.allowHorizontalOverflow) {
                            var value = this.rows.getRow(j).grid.style.cellPadding.right +
                                this.rows.getRow(j).grid.style.cellPadding.left
                                + this.rows.getRow(j).cells.getCell(i).style.borders.left.width / 2;
                            //  if (this.initialWidth != 0 )
                            //         (this.rows.getRow(j).cells.getCell(i).value as PdfGrid).initialWidth = this.initialWidth - value;
                        }
                        var rowWidth = 0;
                        rowWidth = this.initialWidth > 0.0 ? Math.min(this.initialWidth, this.rows.getRow(j).cells.getCell(i).width) : this.rows.getRow(j).cells.getCell(i).width;
                        // let internalWidth : number = this.rows.getRow(j).cells.getCell(i).width;
                        // internalWidth += this.rows.getRow(j).cells.getCell(i).style.borders.left.width;
                        // internalWidth += this.rows.getRow(j).cells.getCell(i).style.borders.right.width;
                        // let internalHeight : number = this.rows.getRow(j).cells.getCell(i).height;
                        // internalHeight += (this.rows.getRow(j).cells.getCell(i).style.borders.top.width);
                        // internalHeight += (this.rows.getRow(j).cells.getCell(i).style.borders.bottom.width);
                        // let isCorrectWidth : boolean = (internalWidth + this.gridLocation.x) > this.currentGraphics.clientSize.width;
                        // let isCorrectHeight : boolean = (internalHeight + this.gridLocation.y) > this.currentGraphics.clientSize.height;
                        // if (isCorrectWidth || isCorrectHeight) {
                        //     throw Error('Image size exceeds client size of the page. Can not insert this image');
                        // }
                        // rowWidth = Math.min(this.initialWidth, this.rows.getRow(j).cells.getCell(i).width);
                        cellWidth = Math.max(widths[i], Math.max(cellWidth, rowWidth));
                        cellWidth = Math.max(this.columns.getColumn(i).width, cellWidth);
                    }
                }
                if (this.rows.count != 0)
                    widths[i] = cellWidth;
                cellWidth = 0;
            }
            for (var i = 0, RowCount = this.rows.count; i < RowCount; i++) {
                for (var j = 0, ColCount = this.columns.count; j < ColCount; j++) {
                    if (this.rows.getRow(i).cells.getCell(j).columnSpan > 1) {
                        var total = widths[j];
                        for (var k = 1; k < this.rows.getRow(i).cells.getCell(j).columnSpan; k++) {
                            total += widths[j + k];
                        }
                        // if (this.rows.getRow(i).cells.getCell(j).width > total)
                        // {
                        //     let extendedWidth : number = this.rows.getRow(i).cells.getCell(j).width - total;
                        //     extendedWidth = extendedWidth / this.rows.getRow(i).cells.getCell(j).columnSpan;
                        //     for (let k : number = j; k < j + this.rows.getRow(i).cells.getCell(j).columnSpan; k++)
                        //         widths[k] += extendedWidth;
                        // }
                    }
                }
            }
            // if (this.isChildGrid && this.initialWidth != 0)
            // {
            //     widths = this.columns.getDefaultWidths(this.initialWidth);
            // }
            for (var i = 0, count = this.columns.count; i < count; i++) {
                if (this.columns.getColumn(i).width <= 0)
                    this.columns.getColumn(i).columnWidth = widths[i];
                else if (this.columns.getColumn(i).width > 0 && !this.columns.getColumn(i).isCustomWidth)
                    this.columns.getColumn(i).columnWidth = widths[i];
            }
            var padding = 0;
            var colWidth = 0;
            var colCount = this.columns.count;
            var childGridColWidth = 0;
            colWidth = this.tempWidth;
            for (var j = 0; j < this.columns.count; j++) {
                if (this.gridColumns.getColumn(j).width > 0 && this.gridColumns.getColumn(j).isCustomWidth) {
                    colWidth -= this.gridColumns.getColumn(j).width;
                    colCount--;
                }
            }
            // if (this.style.cellSpacing != 0){
            //     colWidth -= this.style.cellSpacing * 2;
            // }
            if (colWidth > 0) {
                if (this.ParentCell.row.grid.style.cellSpacing != 0) {
                    colWidth -= this.ParentCell.row.grid.style.cellSpacing * 2;
                }
            }
            if (colWidth > padding) {
                childGridColWidth = (colWidth) / colCount;
                if (this.ParentCell != null) {
                    for (var j = 0; j < this.columns.count; j++) {
                        if (!this.columns.getColumn(j).isCustomWidth)
                            this.columns.getColumn(j).columnWidth = childGridColWidth;
                    }
                }
            }
        }
    };
    return PdfGrid;
}(PdfLayoutElement));
export { PdfGrid };
