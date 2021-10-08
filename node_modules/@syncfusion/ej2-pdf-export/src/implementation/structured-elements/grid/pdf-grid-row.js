import { PdfGridCell, PdfGridCellCollection } from './pdf-grid-cell';
import { PdfGridRowStyle } from './styles/style';
/**
 * `PdfGridRow` class provides customization of the settings for the particular row.
 */
var PdfGridRow = /** @class */ (function () {
    //Constructor
    /**
     * Initializes a new instance of the `PdfGridRow` class with the parent grid.
     * @private
     */
    function PdfGridRow(grid) {
        /**
         * Stores the index of the overflowing row.
         * @private
         */
        this.gridRowOverflowIndex = 0;
        /**
         * The `height` of the row.
         * @private
         */
        this.rowHeight = 0;
        /**
         * The `width` of the row.
         * @private
         */
        this.rowWidth = 0;
        /**
         * The `isFinish` of the row.
         * @private
         */
        this.isrowFinish = false;
        /**
         * Check whether the Row span row height `is set explicitly`.
         * @default false
         * @public
         */
        this.isRowSpanRowHeightSet = false;
        /**
         * The `page count` of the row.
         * @public
         */
        this.noOfPageCount = 0;
        /**
         * Check whether the row height `is set explicitly`.
         * @default false
         * @private
         */
        this.isRowHeightSet = false;
        this.isPageBreakRowSpanApplied = false;
        /**
         * Check weather the row merge `is completed` or not.
         * @default true
         * @private
         */
        this.isRowMergeComplete = true;
        this.repeatFlag = false;
        this.rowFontSplit = false;
        this.pdfGrid = grid;
    }
    Object.defineProperty(PdfGridRow.prototype, "rowSpanExists", {
        //Properties
        /**
         * Gets or sets a value indicating [`row span exists`].
         * @private
         */
        get: function () {
            return this.bRowSpanExists;
        },
        set: function (value) {
            this.bRowSpanExists = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "cells", {
        /**
         * Gets the `cells` from the selected row.[Read-Only].
         * @private
         */
        get: function () {
            if (this.gridCells == null) {
                this.gridCells = new PdfGridCellCollection(this);
            }
            return this.gridCells;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "grid", {
        /**
         * Gets or sets the parent `grid`.
         * @private
         */
        get: function () {
            return this.pdfGrid;
        },
        set: function (value) {
            this.pdfGrid = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "style", {
        /**
         * Gets or sets the row `style`.
         * @private
         */
        get: function () {
            if (typeof this.rowStyle === 'undefined') {
                this.rowStyle = new PdfGridRowStyle();
                this.rowStyle.setParent(this);
            }
            return this.rowStyle;
        },
        set: function (value) {
            this.rowStyle = value;
            for (var i = 0; i < this.cells.count; i++) {
                this.cells.getCell(i).style.borders = value.border;
                if (typeof value.font !== 'undefined') {
                    this.cells.getCell(i).style.font = value.font;
                }
                if (typeof value.backgroundBrush !== 'undefined') {
                    this.cells.getCell(i).style.backgroundBrush = value.backgroundBrush;
                }
                if (typeof value.backgroundImage !== 'undefined') {
                    this.cells.getCell(i).style.backgroundImage = value.backgroundImage;
                }
                if (typeof value.textBrush !== 'undefined') {
                    this.cells.getCell(i).style.textBrush = value.textBrush;
                }
                if (typeof value.textPen !== 'undefined') {
                    this.cells.getCell(i).style.textPen = value.textPen;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "rowBreakHeight", {
        /**
         * `Height` of the row yet to be drawn after split.
         * @private
         */
        get: function () {
            if (typeof this.gridRowBreakHeight === 'undefined') {
                this.gridRowBreakHeight = 0;
            }
            return this.gridRowBreakHeight;
        },
        set: function (value) {
            this.gridRowBreakHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "rowOverflowIndex", {
        /**
         * `over flow index` of the row.
         * @private
         */
        get: function () {
            return this.gridRowOverflowIndex;
        },
        set: function (value) {
            this.gridRowOverflowIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "height", {
        /**
         * Gets or sets the `height` of the row.
         * @private
         */
        get: function () {
            if (!this.isRowHeightSet) {
                this.rowHeight = this.measureHeight();
            }
            return this.rowHeight;
        },
        set: function (value) {
            this.rowHeight = value;
            this.isRowHeightSet = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "width", {
        /**
         * Gets or sets the `width` of the row.
         * @private
         */
        get: function () {
            if (this.rowWidth === 0 || typeof this.rowWidth === 'undefined') {
                this.rowWidth = this.measureWidth();
            }
            return this.rowWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "NestedGridLayoutResult", {
        /**
         * Gets or sets the row `Nested grid Layout Result`.
         * @private
         */
        get: function () {
            return this.gridResult;
        },
        set: function (value) {
            this.gridResult = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "columnSpanExists", {
        /**
         * Gets or sets a value indicating [`column span exists`].
         * @private
         */
        get: function () {
            return this.bColumnSpanExists;
        },
        set: function (value) {
            this.bColumnSpanExists = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "rowMergeComplete", {
        /**
         * Check whether the Row `has row span or row merge continue`.
         * @private
         */
        get: function () {
            return this.isRowMergeComplete;
        },
        set: function (value) {
            this.isRowMergeComplete = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRow.prototype, "rowIndex", {
        /**
         * Returns `index` of the row.
         * @private
         */
        get: function () {
            return this.grid.rows.rowCollection.indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Calculates the height`.
     * @private
     */
    PdfGridRow.prototype.measureHeight = function () {
        var rowSpanRemainingHeight = 0;
        var rowHeight;
        var maxHeight = 0;
        if (this.cells.getCell(0).rowSpan > 1) {
            rowHeight = 0;
        }
        else {
            rowHeight = this.cells.getCell(0).height;
        }
        for (var i = 0; i < this.cells.count; i++) {
            var cell = this.cells.getCell(i);
            //get the maximum rowspan remaining height.
            if (cell.rowSpanRemainingHeight > rowSpanRemainingHeight) {
                rowSpanRemainingHeight = cell.rowSpanRemainingHeight;
            }
            //skip the cell if row spanned.
            // if (cell.isRowMergeContinue) {
            //     continue;
            // }
            // if (!cell.isRowMergeContinue) {
            //     this.rowMergeComplete = false;
            // }
            this.rowMergeComplete = false;
            if (cell.rowSpan > 1) {
                var cellIn = i;
                var rowin = this.grid.rows.rowCollection.indexOf(this);
                for (var j = 0; j < cell.rowSpan; j++) {
                    if ((j + 1) < cell.rowSpan) {
                        this.grid.rows.getRow(rowin + j + 1).cells.getCell(cellIn).hasRowSpan = true;
                    }
                }
                if (maxHeight < cell.height) {
                    maxHeight = cell.height;
                }
                continue;
            }
            rowHeight = Math.max(rowHeight, cell.height);
        }
        if (maxHeight > rowHeight) {
            rowHeight = maxHeight;
        }
        if (rowHeight === 0) {
            rowHeight = maxHeight;
        }
        else if (rowSpanRemainingHeight > 0) {
            rowHeight += rowSpanRemainingHeight;
        }
        return rowHeight;
    };
    PdfGridRow.prototype.measureWidth = function () {
        var rowWid = 0;
        for (var i = 0; i < this.grid.columns.count; i++) {
            var column = this.grid.columns.getColumn(i);
            rowWid += column.width;
        }
        return rowWid;
    };
    return PdfGridRow;
}());
export { PdfGridRow };
/**
 * `PdfGridRowCollection` class provides access to an ordered, strongly typed collection of 'PdfGridRow' objects.
 * @private
 */
var PdfGridRowCollection = /** @class */ (function () {
    // Constructor
    /**
     * Initializes a new instance of the `PdfGridRowCollection` class with the parent grid.
     * @private
     */
    function PdfGridRowCollection(grid) {
        this.rows = [];
        this.grid = grid;
    }
    Object.defineProperty(PdfGridRowCollection.prototype, "count", {
        //Properties
        /**
         * Gets the number of header in the `PdfGrid`.[Read-Only].
         * @private
         */
        get: function () {
            return this.rows.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridRowCollection.prototype, "rowCollection", {
        //Implementation
        /**
         * Return the row collection of the `grid`.
         * @private
         */
        get: function () {
            return this.rows;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridRowCollection.prototype.addRow = function (arg) {
        if (typeof arg === 'undefined') {
            var temprow = new PdfGridRow(this.grid);
            this.addRow(temprow);
            return temprow;
        }
        else {
            arg.style.setBackgroundBrush(this.grid.style.backgroundBrush);
            arg.style.setFont(this.grid.style.font);
            arg.style.setTextBrush(this.grid.style.textBrush);
            arg.style.setTextPen(this.grid.style.textPen);
            if (arg.cells.count === 0) {
                for (var i = 0; i < this.grid.columns.count; i++) {
                    arg.cells.add(new PdfGridCell());
                }
            }
            this.rows.push(arg);
        }
    };
    /**
     * Return the row by index.
     * @private
     */
    PdfGridRowCollection.prototype.getRow = function (index) {
        return this.rows[index];
    };
    return PdfGridRowCollection;
}());
export { PdfGridRowCollection };
/**
 * `PdfGridHeaderCollection` class provides customization of the settings for the header.
 * @private
 */
var PdfGridHeaderCollection = /** @class */ (function () {
    //constructor
    /**
     * Initializes a new instance of the `PdfGridHeaderCollection` class with the parent grid.
     * @private
     */
    function PdfGridHeaderCollection(grid) {
        /**
         * The array to store the `rows` of the grid header.
         * @private
         */
        this.rows = [];
        this.grid = grid;
        this.rows = [];
    }
    //Properties
    /**
     * Gets a 'PdfGridRow' object that represents the `header` row in a 'PdfGridHeaderCollection' control.[Read-Only].
     * @private
     */
    PdfGridHeaderCollection.prototype.getHeader = function (index) {
        // if (index < 0 || index >= Count) {
        //     throw new IndexOutOfRangeException();
        // }
        return (this.rows[index]);
    };
    Object.defineProperty(PdfGridHeaderCollection.prototype, "count", {
        /**
         * Gets the `number of header` in the 'PdfGrid'.[Read-Only]
         * @private
         */
        get: function () {
            return this.rows.length;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridHeaderCollection.prototype.add = function (arg) {
        if (typeof arg === 'number') {
            var row = void 0;
            for (var i = 0; i < arg; i++) {
                row = new PdfGridRow(this.grid);
                for (var j = 0; j < this.grid.columns.count; j++) {
                    row.cells.add(new PdfGridCell());
                }
                this.rows.push(row);
            }
            return this.rows;
        }
        else {
            this.rows.push(arg);
        }
    };
    PdfGridHeaderCollection.prototype.indexOf = function (row) {
        return this.rows.indexOf(row);
    };
    return PdfGridHeaderCollection;
}());
export { PdfGridHeaderCollection };
