import { PdfGridCell } from './pdf-grid-cell';
import { PdfStringFormat } from './../../graphics/fonts/pdf-string-format';
/**
 * `PdfGridColumn` class represents the schema of a column in a 'PdfGrid'.
 */
var PdfGridColumn = /** @class */ (function () {
    //Constructors
    /**
     * Initializes a new instance of the `PdfGridColumn` class with the parent grid.
     * @private
     */
    function PdfGridColumn(grid) {
        /**
         * The `width` of the column.
         * @default 0
         * @private
         */
        this.columnWidth = 0;
        this.grid = grid;
    }
    Object.defineProperty(PdfGridColumn.prototype, "width", {
        /**
         * Gets or sets the `width` of the 'PdfGridColumn'.
         * @private
         */
        get: function () {
            return this.columnWidth;
        },
        set: function (value) {
            this.isCustomWidth = true;
            this.columnWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridColumn.prototype, "format", {
        /**
         * Gets or sets the information about the text `formatting`.
         * @private
         */
        get: function () {
            if (this.stringFormat == null) {
                this.stringFormat = new PdfStringFormat(); //GetDefaultFormat();
            }
            return this.stringFormat;
        },
        set: function (value) {
            this.stringFormat = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfGridColumn;
}());
export { PdfGridColumn };
/**
 * `PdfGridColumnCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfGridColumn' objects.
 * @private
 */
var PdfGridColumnCollection = /** @class */ (function () {
    //properties
    //Constructors
    /**
     * Initializes a new instance of the `PdfGridColumnCollection` class with the parent grid.
     * @private
     */
    function PdfGridColumnCollection(grid) {
        /**
         * @hidden
         * @private
         */
        this.internalColumns = [];
        /**
         * @hidden
         * @private
         */
        this.columnWidth = 0;
        this.grid = grid;
        this.internalColumns = [];
    }
    //Iplementation
    /**
     * `Add` a new column to the 'PdfGrid'.
     * @private
     */
    PdfGridColumnCollection.prototype.add = function (count) {
        // public add(column : PdfGridColumn) : void
        // public add(arg : number|PdfGridColumn) : void {
        // if (typeof arg === 'number') {
        for (var i = 0; i < count; i++) {
            this.internalColumns.push(new PdfGridColumn(this.grid));
            for (var index = 0; index < this.grid.rows.count; index++) {
                var row = this.grid.rows.getRow(index);
                var cell = new PdfGridCell();
                cell.value = '';
                row.cells.add(cell);
            }
        }
        // } else {
        //     let column : PdfGridColumn = new PdfGridColumn(this.grid);
        //     this.columns.push(column);
        //     return column;
        // }
    };
    Object.defineProperty(PdfGridColumnCollection.prototype, "count", {
        /**
         * Gets the `number of columns` in the 'PdfGrid'.[Read-Only].
         * @private
         */
        get: function () {
            return this.internalColumns.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridColumnCollection.prototype, "width", {
        /**
         * Gets the `widths`.
         * @private
         */
        get: function () {
            if (this.columnWidth === 0) {
                this.columnWidth = this.measureColumnsWidth();
            }
            if (this.grid.initialWidth !== 0 && this.columnWidth !== this.grid.initialWidth && !this.grid.style.allowHorizontalOverflow) {
                this.columnWidth = this.grid.initialWidth;
                this.grid.isPageWidth = true;
            }
            return this.columnWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridColumnCollection.prototype, "columns", {
        /**
         * Gets the `array of PdfGridColumn`.[Read-Only]
         * @private
         */
        get: function () {
            return this.internalColumns;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the `PdfGridColumn` from the specified index.[Read-Only]
     * @private
     */
    PdfGridColumnCollection.prototype.getColumn = function (index) {
        if (index >= 0 && index <= this.columns.length) {
            return this.columns[index];
        }
        else {
            throw Error('can not get the column from the index: ' + index);
        }
    };
    //Implementation
    /**
     * `Calculates the column widths`.
     * @private
     */
    PdfGridColumnCollection.prototype.measureColumnsWidth = function () {
        var totalWidth = 0;
        this.grid.measureColumnsWidth();
        for (var i = 0, count = this.internalColumns.length; i < count; i++) {
            totalWidth += this.internalColumns[i].width;
        }
        return totalWidth;
    };
    /**
     * Gets the `widths of the columns`.
     * @private
     */
    PdfGridColumnCollection.prototype.getDefaultWidths = function (totalWidth) {
        var widths = [];
        var summ = 0.0;
        var subFactor = this.count;
        for (var i = 0; i < this.count; i++) {
            if (this.grid.isPageWidth && totalWidth >= 0 && !this.internalColumns[i].isCustomWidth) {
                this.internalColumns[i].width = 0;
            }
            else {
                widths[i] = this.internalColumns[i].width;
                if (this.internalColumns[i].width > 0 && this.internalColumns[i].isCustomWidth) {
                    totalWidth -= this.internalColumns[i].width;
                    subFactor--;
                }
                else {
                    widths[i] = 0;
                }
            }
        }
        for (var i = 0; i < this.count; i++) {
            var width = totalWidth / subFactor;
            if (widths[i] <= 0) {
                widths[i] = width;
            }
        }
        return widths;
    };
    return PdfGridColumnCollection;
}());
export { PdfGridColumnCollection };
