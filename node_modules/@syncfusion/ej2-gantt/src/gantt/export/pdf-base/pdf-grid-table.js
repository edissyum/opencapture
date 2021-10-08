import { PdfTreeGrid } from '../pdf-treegrid';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { RectangleF, PdfTextAlignment, PdfBorderOverlapStyle, PointF, PdfDashStyle, PdfLineCap, PdfSolidBrush, PdfStandardFont } from '@syncfusion/ej2-pdf-export';
import { SizeF, PdfFontStyle } from '@syncfusion/ej2-pdf-export';
import { PdfStringFormat, PdfStringLayouter } from '@syncfusion/ej2-pdf-export';
/**
 *
 */
var PdfTreeGridCell = /** @class */ (function () {
    function PdfTreeGridCell(row) {
        this.cellWidth = 0;
        this.cellHeight = 0;
        /** @private */
        this.finishedDrawingCell = true;
        if (isNullOrUndefined(row)) {
            this.rowSpan = 1;
            this.columnSpan = 1;
        }
        else {
            this.row = row;
        }
        this.style = {};
    }
    Object.defineProperty(PdfTreeGridCell.prototype, "height", {
        /**
         * Gets the `height` of the PdfTreeGrid cell.[Read-Only].
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (this.cellHeight === 0) {
                this.cellHeight = this.measureHeight();
            }
            return this.cellHeight;
        },
        set: function (value) {
            this.cellHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridCell.prototype, "width", {
        /**
         * Gets the `width` of the PdfTreeGrid cell.[Read-Only].
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (this.cellWidth === 0) {
                this.cellWidth = this.measureWidth();
            }
            return Math.round(this.cellWidth);
        },
        set: function (value) {
            this.cellWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    PdfTreeGridCell.prototype.measureWidth = function () {
        var width = 0;
        var layouter = new PdfStringLayouter();
        if (typeof this.value === 'string') {
            /* eslint-disable-next-line */
            var font = new PdfStandardFont(this.row.treegrid.ganttStyle.fontFamily, this.style.fontSize, this.style.fontStyle);
            /* eslint-disable-next-line */
            var slr = layouter.layout(this.value, font, this.style.format, new SizeF(Number.MAX_VALUE, Number.MAX_VALUE), false, new SizeF(0, 0));
            width += slr.actualSize.width;
            width += (this.style.borders.left.width + this.style.borders.right.width) * 2;
        }
        if (typeof this.row.treegrid.style.cellPadding.left !== 'undefined' && this.row.treegrid.style.cellPadding.hasLeftPad) {
            width += this.row.treegrid.style.cellPadding.left;
        }
        if (typeof this.row.treegrid.style.cellPadding.right !== 'undefined' && this.row.treegrid.style.cellPadding.hasRightPad) {
            width += this.row.treegrid.style.cellPadding.right;
        }
        width += this.row.treegrid.style.cellSpacing;
        return width;
    };
    /**
     * @returns {number} .
     * @private
     */
    /* eslint-disable */
    PdfTreeGridCell.prototype.measureHeight = function () {
        var rowHeight = this.row.treegrid.rowHeight;
        var height = 0;
        var width = this.calculateWidth();
        width -= this.row.treegrid.style.cellPadding.right + this.row.treegrid.style.cellPadding.left;
        width -= this.style.borders.left.width + this.style.borders.right.width;
        var layouter = new PdfStringLayouter();
        if (typeof this.value === 'string' || typeof this.remainingString === 'string') {
            var currentValue = this.value;
            if (!this.finishedDrawingCell) {
                currentValue = !(isNullOrUndefined(this.remainingString) || this.remainingString === '') ? this.remainingString : this.value;
            }
            /* eslint-disable */
            var font = new PdfStandardFont(this.row.treegrid.ganttStyle.fontFamily, this.style.fontSize, this.style.fontStyle);
            /* eslint-disable */
            var slr = layouter.layout(currentValue, font, this.style.format, new SizeF(width, 0), false, new SizeF(0, 0));
            height += slr.actualSize.height;
            height += (this.style.borders.top.width + this.style.borders.bottom.width) * 2;
        }
        height += this.row.treegrid.style.cellPadding.top + this.row.treegrid.style.cellPadding.bottom;
        height += this.row.treegrid.style.cellSpacing;
        return height > rowHeight ? height : rowHeight;
    };
    /* eslint-enable */
    PdfTreeGridCell.prototype.calculateWidth = function () {
        var cellIndex = this.row.cells.indexOf(this);
        var columnSpan = this.columnSpan;
        var width = 0;
        for (var i = 0; i < columnSpan; i++) {
            width += this.row.treegrid.columns.getColumn(cellIndex + i).width;
        }
        if (this.row.treegrid.columns.getColumn(cellIndex).isTreeColumn) {
            width -= (this.row.level * 10);
        }
        return width;
    };
    /**
     * `Draws` the specified graphics.
     *
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @param {boolean} cancelSubsequentSpans .
     * @param {number} leftAdjustment .
     * @returns {PdfStringLayoutResult} .
     * @private
     */
    PdfTreeGridCell.prototype.draw = function (graphics, bounds, cancelSubsequentSpans, leftAdjustment) {
        var result = null;
        var padding = 10;
        if (cancelSubsequentSpans) {
            // Cancel all subsequent cell spans, if no space exists.
            var currentCellIndex = this.row.cells.indexOf(this);
            for (var i = currentCellIndex + 1; i <= currentCellIndex + this.columnSpan; i++) {
                this.row.cells.getCell(i).isCellMergeContinue = false;
                this.row.cells.getCell(i).isRowMergeContinue = false;
            }
            this.columnSpan = 1;
        }
        // Skip cells which were already covered by span map.
        if (this.isCellMergeContinue || this.isRowMergeContinue) {
            if (this.isCellMergeContinue && this.row.treegrid.style.allowHorizontalOverflow) {
                if ((this.row.rowOverflowIndex > 0 && (this.row.cells.indexOf(this) !== this.row.rowOverflowIndex + 1)) ||
                    (this.row.rowOverflowIndex === 0 && this.isCellMergeContinue)) {
                    return result;
                }
                else {
                    return result;
                }
            }
        }
        //bounds = this.adjustContentLayoutArea(bounds);
        this.drawCellBackground(graphics, bounds);
        var textPen = null;
        var textBrush = new PdfSolidBrush(this.style.fontColor);
        var font = null;
        if (this.row.isParentRow) {
            font = new PdfStandardFont(this.row.treegrid.ganttStyle.fontFamily, this.style.fontSize, PdfFontStyle.Bold);
        }
        else {
            font = new PdfStandardFont(this.row.treegrid.ganttStyle.fontFamily, this.style.fontSize, this.style.fontStyle);
        }
        var innerLayoutArea = bounds;
        if (!this.isHeaderCell) {
            /* eslint-disable-next-line */
            innerLayoutArea.x = innerLayoutArea.x;
            /* eslint-disable-next-line */
            innerLayoutArea.width = innerLayoutArea.width;
        }
        if (innerLayoutArea.height >= graphics.clientSize.height) {
            // To break row to next page
            if (this.row.treegrid.allowRowBreakAcrossPages) {
                innerLayoutArea.height -= innerLayoutArea.y;
                bounds.height -= bounds.y;
            }
            else {
                innerLayoutArea.height = graphics.clientSize.height;
                bounds.height = graphics.clientSize.height;
            }
        }
        innerLayoutArea = this.adjustContentLayoutArea(innerLayoutArea);
        if (typeof this.value === 'string' || typeof this.remainingString === 'string') {
            var temp = null;
            if (this.finishedDrawingCell) {
                temp = (this.remainingString === '') ? this.remainingString : this.value;
                /* eslint-disable-next-line */
                graphics.drawString(temp, font, textPen, textBrush, (innerLayoutArea.x + leftAdjustment), innerLayoutArea.y, (innerLayoutArea.width - leftAdjustment - padding), (innerLayoutArea.height - padding), this.style.format);
            }
            else {
                /* eslint-disable-next-line */
                graphics.drawString(this.remainingString, font, textPen, textBrush, (innerLayoutArea.x + leftAdjustment), innerLayoutArea.y, this.style.format);
            }
            result = graphics.stringLayoutResult;
        }
        if (this.style.borders != null) {
            this.drawCellBorder(graphics, bounds);
        }
        return result;
    };
    /**
     * Draw the `cell background`.
     *
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @returns {void} .
     * @private
     */
    PdfTreeGridCell.prototype.drawCellBackground = function (graphics, bounds) {
        var backgroundBrush = new PdfSolidBrush(this.style.backgroundColor);
        if (backgroundBrush != null) {
            graphics.save();
            graphics.drawRectangle(backgroundBrush, bounds.x, bounds.y, bounds.width, bounds.height);
            graphics.restore();
        }
        // if (this.style.backgroundImage != null) {
        //     let image: PdfImage = this.getBackgroundImage();
        //     graphics.drawImage(this.style.backgroundImage, bounds.x, bounds.y, bounds.width, bounds.height);
        // }
    };
    /**
     * `Adjusts the text layout area`.
     *
     * @param {RectangleF} bounds .
     * @returns {RectangleF} .
     * @private
     */
    PdfTreeGridCell.prototype.adjustContentLayoutArea = function (bounds) {
        //Add Padding value to its Cell Bounds
        var returnBounds = new RectangleF(new PointF(bounds.x, bounds.y), new SizeF(bounds.width, bounds.height));
        var cellPadding = this.style.padding;
        if (this.value instanceof PdfTreeGrid) {
            var size = this.value.size;
            if (this.style.format.alignment === PdfTextAlignment.Center) {
                returnBounds.x += cellPadding.left + (returnBounds.width - size.width) / 2;
                returnBounds.y += cellPadding.top + (returnBounds.height - size.height) / 2;
            }
            else if (this.style.format.alignment === PdfTextAlignment.Left) {
                returnBounds.x += cellPadding.left;
                returnBounds.y += cellPadding.top;
            }
            else if (this.style.format.alignment === PdfTextAlignment.Right) {
                returnBounds.x += cellPadding.left + (returnBounds.width - size.width);
                returnBounds.y += cellPadding.top;
            }
        }
        else {
            returnBounds.x += cellPadding.left;
            returnBounds.y += cellPadding.top;
        }
        return returnBounds;
    };
    /**
     * @param {PdfGraphics} graphics .
     * @param {RectangleF} bounds .
     * @returns {void} .
     * @private
     */
    PdfTreeGridCell.prototype.drawCellBorder = function (graphics, bounds) {
        if (this.row.treegrid.style.borderOverlapStyle === PdfBorderOverlapStyle.Inside) {
            bounds.x += this.style.borders.left.width;
            bounds.y += this.style.borders.top.width;
            bounds.width -= this.style.borders.right.width;
            bounds.height -= this.style.borders.bottom.width;
        }
        if (this.style.borders.isAll && this.isHeaderCell) {
            graphics.drawRectangle(this.style.borders.left, bounds.x, bounds.y, bounds.width, bounds.height);
            graphics.restore();
            return;
        }
        else {
            var p1 = new PointF(bounds.x, bounds.y + bounds.height);
            var p2 = new PointF(bounds.x, bounds.y);
            var pen = this.style.borders.left;
            if (this.style.borders.left.dashStyle === PdfDashStyle.Solid) {
                pen.lineCap = PdfLineCap.Square;
            }
            graphics.drawLine(pen, p1, p2);
            graphics.restore();
            p1 = new PointF(bounds.x + bounds.width, bounds.y);
            p2 = new PointF(bounds.x + bounds.width, bounds.y + bounds.height);
            pen = this.style.borders.right;
            if ((bounds.x + bounds.width) > (graphics.clientSize.width - (pen.width / 2))) {
                p1 = new PointF(graphics.clientSize.width - (pen.width / 2), bounds.y);
                p2 = new PointF(graphics.clientSize.width - (pen.width / 2), bounds.y + bounds.height);
            }
            if (this.style.borders.right.dashStyle === PdfDashStyle.Solid) {
                pen.lineCap = PdfLineCap.Square;
            }
            graphics.drawLine(pen, p1, p2);
            graphics.restore();
            p1 = new PointF(bounds.x, bounds.y);
            p2 = new PointF(bounds.x + bounds.width, bounds.y);
            pen = this.style.borders.top;
            if (this.style.borders.top.dashStyle === PdfDashStyle.Solid) {
                pen.lineCap = PdfLineCap.Square;
            }
            graphics.drawLine(pen, p1, p2);
            graphics.restore();
            p1 = new PointF(bounds.x + bounds.width, bounds.y + bounds.height);
            p2 = new PointF(bounds.x, bounds.y + bounds.height);
            pen = this.style.borders.bottom;
            if (bounds.y + bounds.height > graphics.clientSize.height - pen.width / 2) {
                p1 = new PointF(bounds.x + bounds.width, graphics.clientSize.height - pen.width / 2);
                p2 = new PointF(bounds.x, graphics.clientSize.height - pen.width / 2);
            }
            if (this.style.borders.bottom.dashStyle === PdfDashStyle.Solid) {
                pen.lineCap = PdfLineCap.Square;
            }
            graphics.drawLine(pen, p1, p2);
            graphics.restore();
        }
    };
    return PdfTreeGridCell;
}());
export { PdfTreeGridCell };
/**
 * `PdfTreeGridCellCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfTreeGridCell' objects.
 *
 * @private
 */
var PdfTreeGridCellCollection = /** @class */ (function () {
    //Constructor
    /**
     * Initializes a new instance of the `PdfGridCellCollection` class with the row.
     *
     * @param { PdfTreeGridRow} row .
     * @private
     */
    function PdfTreeGridCellCollection(row) {
        this.treegridRow = row;
        this.cells = [];
    }
    //Properties
    /**
     * Gets the current `cell`.
     *
     * @param {number} index .
     * @returns {PdfTreeGridCell} .
     * @private
     */
    PdfTreeGridCellCollection.prototype.getCell = function (index) {
        if (index < 0 || index >= this.count) {
            throw new Error('IndexOutOfRangeException');
        }
        return this.cells[index];
    };
    Object.defineProperty(PdfTreeGridCellCollection.prototype, "count", {
        /**
         * Gets the cells `count`.[Read-Only].
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.cells.length;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Adds` this instance.
     *
     * @param {PdfTreeGridCell} cell .
     * @returns {PdfTreeGridCell | void} .
     * @private
     */
    PdfTreeGridCellCollection.prototype.add = function (cell) {
        if (typeof cell === 'undefined') {
            var tempcell = new PdfTreeGridCell();
            this.add(tempcell);
            return cell;
        }
        else {
            cell.row = this.treegridRow;
            this.cells.push(cell);
        }
    };
    /**
     * Returns the `index of` a particular cell in the collection.
     *
     * @param {PdfTreeGridCell} cell .
     * @returns {number} .
     * @private
     */
    PdfTreeGridCellCollection.prototype.indexOf = function (cell) {
        return this.cells.indexOf(cell);
    };
    return PdfTreeGridCellCollection;
}());
export { PdfTreeGridCellCollection };
/**
 *
 */
var PdfTreeGridRow = /** @class */ (function () {
    function PdfTreeGridRow(treegrid) {
        this.treegridRowOverflowIndex = 0;
        this.rowHeight = 0;
        this.rowWidth = 0;
        /* eslint-disable-next-line */
        this._isParentRow = false;
        this.intendLevel = 0;
        this.pdfTreeGrid = treegrid;
    }
    Object.defineProperty(PdfTreeGridRow.prototype, "cells", {
        get: function () {
            if (isNullOrUndefined(this.treegridCells)) {
                this.treegridCells = new PdfTreeGridCellCollection(this);
            }
            return this.treegridCells;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "isParentRow", {
        get: function () {
            return this._isParentRow;
        },
        set: function (value) {
            this._isParentRow = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "treegrid", {
        get: function () {
            return this.pdfTreeGrid;
        },
        set: function (value) {
            this.pdfTreeGrid = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "rowBreakHeight", {
        /**
         * `Height` of the row yet to be drawn after split.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (typeof this.treegridRowBreakHeight === 'undefined') {
                this.treegridRowBreakHeight = 0;
            }
            return this.treegridRowBreakHeight;
        },
        set: function (value) {
            this.treegridRowBreakHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "rowOverflowIndex", {
        /**
         * `over flow index` of the row.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.treegridRowOverflowIndex;
        },
        set: function (value) {
            this.treegridRowOverflowIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "level", {
        get: function () {
            return this.intendLevel;
        },
        set: function (value) {
            this.intendLevel = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "height", {
        /**
         * Gets or sets the `height` of the row.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (this.rowHeight === 0) {
                this.rowHeight = this.measureHeight();
            }
            return this.rowHeight;
        },
        set: function (value) {
            this.rowHeight = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "width", {
        /**
         * Gets or sets the `width` of the row.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (this.rowWidth === 0) {
                this.rowWidth = this.measureWidth();
            }
            return this.rowWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRow.prototype, "rowIndex", {
        get: function () {
            return this.treegrid.rows.rowCollection.indexOf(this);
        },
        enumerable: true,
        configurable: true
    });
    PdfTreeGridRow.prototype.measureWidth = function () {
        var columns = this.treegrid.columns.columns;
        var totalWidth = 0;
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            totalWidth += column.width;
        }
        return totalWidth;
    };
    PdfTreeGridRow.prototype.measureHeight = function () {
        var rowHeight = this.cells.getCell(0).height;
        for (var i = 0; i < this.cells.count; i++) {
            var cell = this.cells.getCell(i);
            if (cell.columnSpan === 1 || cell.rowSpan === 1) {
                rowHeight = Math.max(rowHeight, cell.height);
            }
            else {
                rowHeight = Math.min(rowHeight, cell.height);
            }
            cell.height = rowHeight;
        }
        return rowHeight;
    };
    return PdfTreeGridRow;
}());
export { PdfTreeGridRow };
/**
 * `PdfTreeGridRowCollection` class provides access to an ordered, strongly typed collection of 'PdfTreeGridRow' objects.
 *
 * @private
 */
var PdfTreeGridRowCollection = /** @class */ (function () {
    // Constructor
    /**
     * Initializes a new instance of the `PdfTreeGridRowCollection` class with the parent grid.
     *
     * @param {PdfTreeGrid} treegrid .
     * @private
     */
    function PdfTreeGridRowCollection(treegrid) {
        this.rows = [];
        this.treegrid = treegrid;
    }
    Object.defineProperty(PdfTreeGridRowCollection.prototype, "count", {
        //Properties
        /**
         * Gets the number of header in the `PdfTreeGrid`.[Read-Only].
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.rows.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridRowCollection.prototype, "rowCollection", {
        //Implementation
        /**
         * Return the row collection of the `treegrid`.
         *
         * @returns {PdfTreeGridRow[]} .
         * @private
         */
        get: function () {
            return this.rows;
        },
        enumerable: true,
        configurable: true
    });
    PdfTreeGridRowCollection.prototype.addRow = function (row) {
        if (typeof row === 'undefined') {
            var row_1 = new PdfTreeGridRow(this.treegrid);
            this.addRow(row_1);
            return row_1;
        }
        else {
            if (row.cells.count === 0) {
                for (var i = 0; i < this.treegrid.columns.count; i++) {
                    row.cells.add(new PdfTreeGridCell());
                }
            }
            this.rows.push(row);
        }
    };
    /**
     * Return the row by index.
     *
     * @param {number} index .
     * @returns {PdfTreeGridRow} .
     * @private
     */
    PdfTreeGridRowCollection.prototype.getRow = function (index) {
        return this.rows[index];
    };
    return PdfTreeGridRowCollection;
}());
export { PdfTreeGridRowCollection };
/**
 * `PdfTreeGridHeaderCollection` class provides customization of the settings for the header.
 *
 * @private
 */
var PdfTreeGridHeaderCollection = /** @class */ (function () {
    //constructor
    /**
     * Initializes a new instance of the `PdfTreeGridHeaderCollection` class with the parent grid.
     *
     * @param {PdfTreeGrid} treegrid .
     * @private
     */
    function PdfTreeGridHeaderCollection(treegrid) {
        /**
         * The array to store the `rows` of the grid header.
         *
         * @returns {PdfTreeGridRow[]} .
         * @private
         */
        this.rows = [];
        this.treegrid = treegrid;
        this.rows = [];
    }
    //Properties
    /**
     * Gets a 'PdfTreeGridRow' object that represents the `header` row in a 'PdfGridHeaderCollection' control.[Read-Only].
     *
     * @param {number} index .
     * @returns {PdfTreeGridRow} .
     * @private
     */
    PdfTreeGridHeaderCollection.prototype.getHeader = function (index) {
        return (this.rows[index]);
    };
    Object.defineProperty(PdfTreeGridHeaderCollection.prototype, "count", {
        /**
         * Gets the `number of header` in the 'PdfGrid'.[Read-Only]
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.rows.length;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    /**
     * `Adds` the specified row.
     *
     * @param {PdfTreeGridRow} row .
     * @returns {void} .
     * @private
     */
    PdfTreeGridHeaderCollection.prototype.add = function (row) {
        this.rows.push(row);
    };
    PdfTreeGridHeaderCollection.prototype.indexOf = function (row) {
        return this.rows.indexOf(row);
    };
    return PdfTreeGridHeaderCollection;
}());
export { PdfTreeGridHeaderCollection };
var PdfTreeGridColumn = /** @class */ (function () {
    function PdfTreeGridColumn(treegrid) {
        this.columnWidth = 0;
        this.treeColumnIndex = false;
        this._headerText = '';
        this._field = '';
        this.treegrid = treegrid;
    }
    Object.defineProperty(PdfTreeGridColumn.prototype, "headerText", {
        get: function () {
            return this._headerText;
        },
        set: function (value) {
            this._headerText = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumn.prototype, "field", {
        get: function () {
            return this._field;
        },
        set: function (value) {
            this._field = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumn.prototype, "width", {
        get: function () {
            return this.columnWidth;
        },
        set: function (value) {
            this.columnWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumn.prototype, "isTreeColumn", {
        get: function () {
            return this.treeColumnIndex;
        },
        set: function (value) {
            this.treeColumnIndex = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumn.prototype, "format", {
        /**
         * Gets or sets the information about the text `formatting`.
         *
         * @returns {PdfStringFormat} .
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
    return PdfTreeGridColumn;
}());
export { PdfTreeGridColumn };
/**
 * `PdfTreeGridColumnCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfTreeGridColumn' objects.
 *
 * @private
 */
var PdfTreeGridColumnCollection = /** @class */ (function () {
    //properties
    //Constructors
    /**
     * Initializes a new instance of the `PdfTreeGridColumnCollection` class with the parent grid.
     *
     * @param { PdfTreeGrid} treegrid .
     * @private
     */
    function PdfTreeGridColumnCollection(treegrid) {
        /**
         * @private
         */
        this.internalColumns = [];
        /**
         * @private
         */
        this.columnWidth = 0;
        this.treegrid = treegrid;
        this.internalColumns = [];
    }
    //Implementation
    /**
     * `Add` a new column to the 'PdfGrid'.
     *
     * @param {number} count .
     * @returns {void} .
     * @private
     */
    PdfTreeGridColumnCollection.prototype.add = function (count) {
        // public add(column : PdfGridColumn) : void
        // public add(arg : number|PdfGridColumn) : void {
        // if (typeof arg === 'number') {
        for (var i = 0; i < count; i++) {
            this.internalColumns.push(new PdfTreeGridColumn(this.treegrid));
            for (var index = 0; index < this.treegrid.rows.count; index++) {
                var row = this.treegrid.rows.getRow(index);
                var cell = new PdfTreeGridCell();
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
    Object.defineProperty(PdfTreeGridColumnCollection.prototype, "count", {
        /**
         * Gets the `number of columns` in the 'PdfGrid'.[Read-Only].
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            return this.internalColumns.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumnCollection.prototype, "width", {
        /**
         * Gets the `widths`.
         *
         * @returns {number} .
         * @private
         */
        get: function () {
            if (this.columnWidth === 0) {
                this.columnWidth = this.measureColumnsWidth();
            }
            return this.columnWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfTreeGridColumnCollection.prototype, "columns", {
        /**
         * Gets the `array of PdfGridColumn`.[Read-Only]
         *
         * @returns {PdfTreeGridColumn[]} .
         * @private
         */
        get: function () {
            return this.internalColumns;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the `PdfTreeGridColumn` from the specified index.[Read-Only]
     *
     * @param {number} index .
     * @returns {PdfTreeGridColumn} .
     * @private
     */
    PdfTreeGridColumnCollection.prototype.getColumn = function (index) {
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
     *
     * @returns {number} .
     * @private
     */
    PdfTreeGridColumnCollection.prototype.measureColumnsWidth = function () {
        var totalWidth = 0;
        this.treegrid.measureColumnsWidth();
        for (var i = 0, count = this.internalColumns.length; i < count; i++) {
            totalWidth += this.internalColumns[i].width;
        }
        return totalWidth;
    };
    /**
     * Gets the `widths of the columns`.
     *
     * @param {number} totalWidth .
     * @returns {number} .
     * @private
     */
    PdfTreeGridColumnCollection.prototype.getDefaultWidths = function (totalWidth) {
        var widths = [];
        var subFactor = this.count;
        for (var i = 0; i < this.count; i++) {
            widths[i] = this.internalColumns[i].width;
            if (this.internalColumns[i].width > 0) {
                totalWidth -= this.internalColumns[i].width;
                subFactor--;
            }
            else {
                widths[i] = 0;
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
    return PdfTreeGridColumnCollection;
}());
export { PdfTreeGridColumnCollection };
