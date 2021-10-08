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
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { PdfBorders, TemporaryDictionary } from './index';
import { PdfHorizontalOverflowType } from '../../base/interface';
import { ElementLayouter, PdfLayoutResult, PdfLayoutFormat, SizeF, PointF, RectangleF, RowLayoutResult, PdfLayoutType, PdfLayoutBreakType } from '@syncfusion/ej2-pdf-export';
import { PdfStringFormat } from '@syncfusion/ej2-pdf-export';
/**
 *
 */
var PdfTreeGridLayouter = /** @class */ (function (_super) {
    __extends(PdfTreeGridLayouter, _super);
    function PdfTreeGridLayouter(baseFormat) {
        var _this = _super.call(this, baseFormat) || this;
        _this.columnRanges = [];
        _this.repeatRowIndex = -1;
        _this.currentBounds = new RectangleF(0, 0, 0, 0);
        return _this;
    }
    Object.defineProperty(PdfTreeGridLayouter.prototype, "treegrid", {
        get: function () {
            return this.elements;
        },
        enumerable: true,
        configurable: true
    });
    PdfTreeGridLayouter.prototype.layoutInternal = function (param) {
        if (isNullOrUndefined(param)) {
            throw Error('Argument Null Expection');
        }
        this.currentPage = param.page;
        var format = param.format;
        if (this.currentPage !== null) {
            this.currentPageBounds = this.currentPage.getClientSize();
        }
        this.currentGraphics = this.currentPage.graphics;
        if (format !== null && format.break === PdfLayoutBreakType.FitColumnsToPage) {
            /* eslint-disable-next-line */
            this.currentBounds = new RectangleF(new PointF(param.bounds.x, param.bounds.y), new SizeF(this.treegrid.columns.width, this.currentGraphics.clientSize.height));
        }
        else {
            this.currentBounds = new RectangleF(new PointF(param.bounds.x, param.bounds.y), this.currentGraphics.clientSize);
        }
        if (this.treegrid.rows.count !== 0) {
            this.currentBounds.width = (param.bounds.width > 0) ? param.bounds.width :
                (this.currentBounds.width - this.treegrid.rows.getRow(0).cells.getCell(0).style.borders.left.width / 2);
        }
        else {
            throw Error('Please add row or header into grid');
        }
        this.startLocation = new PointF(param.bounds.x, param.bounds.y);
        if (param.bounds.height > 0) {
            this.currentBounds.height = param.bounds.height;
        }
        if (!this.treegrid.style.allowHorizontalOverflow && !this.treegrid.isFitToWidth) {
            this.treegrid.measureColumnsWidth();
            this.determineColumnDrawRanges();
        }
        else {
            this.treegrid.measureColumnsWidth(this.currentBounds);
            this.columnRanges.push([0, this.treegrid.columns.count - 1]);
        }
        return this.layoutOnPage(param);
    };
    /**
     * `Determines the column draw ranges`.
     *
     * @returns {void} .
     * @private
     */
    PdfTreeGridLayouter.prototype.determineColumnDrawRanges = function () {
        var startColumn = 0;
        var endColumn = 0;
        var cellWidths = 0;
        var availableWidth = this.currentGraphics.clientSize.width - this.currentBounds.x;
        for (var i = 0; i < this.treegrid.columns.count; i++) {
            cellWidths += this.treegrid.columns.getColumn(i).width;
            if (cellWidths >= availableWidth) {
                var subWidths = 0;
                for (var j = startColumn; j <= i; j++) {
                    subWidths += this.treegrid.columns.getColumn(j).width;
                    if (subWidths > availableWidth) {
                        break;
                    }
                    endColumn = j;
                }
                this.columnRanges.push([startColumn, endColumn]);
                startColumn = endColumn + 1;
                //endColumn = startColumn;
                cellWidths = (endColumn <= i) ? this.treegrid.columns.getColumn(i).width : 0;
            }
        }
        this.columnRanges.push([startColumn, this.treegrid.columns.count - 1]);
    };
    PdfTreeGridLayouter.prototype.getFormat = function (format) {
        var f = format;
        return f;
    };
    PdfTreeGridLayouter.prototype.layoutOnPage = function (param) {
        var format = this.getFormat(param.format);
        var result = null;
        var layoutedPages = new TemporaryDictionary();
        var startPage = param.page;
        for (var index = 0; index < this.columnRanges.length; index++) {
            var range = this.columnRanges[index];
            this.cellStartIndex = range[0];
            this.cellEndIndex = range[1];
            var rowsCount = this.treegrid.rows.count;
            var i = 0;
            var repeatRow = false;
            //Draw row by row with the specified cell range.
            for (var j = 0; j < rowsCount; j++) {
                var row = this.treegrid.rows.getRow(j);
                i++;
                var originalHeight = this.currentBounds.y;
                if (this.currentPage !== null && !layoutedPages.containsKey(this.currentPage)) {
                    layoutedPages.add(this.currentPage, range);
                }
                var rowResult = this.drawRow(row);
                //if height remains same, it is understood that row is not draw in the page.
                if (originalHeight === this.currentBounds.y) {
                    repeatRow = true;
                    this.repeatRowIndex = this.treegrid.rows.rowCollection.indexOf(row);
                }
                else {
                    repeatRow = false;
                    this.repeatRowIndex = -1;
                }
                while (!rowResult.isFinish && startPage !== null) {
                    if (this.treegrid.allowRowBreakAcrossPages) {
                        //If there is no space in the current page, add new page and then draw the remaining row.
                        this.currentPage = this.getNextPageFormat(format);
                        if (this.treegrid.enableHeader) {
                            this.drawHeader();
                        }
                        this.checkBounds(format);
                        rowResult = this.drawRow(row);
                    }
                    else if (!this.treegrid.allowRowBreakAcrossPages && i < length) {
                        this.currentPage = this.getNextPageFormat(format);
                        if (this.treegrid.enableHeader) {
                            this.drawHeader();
                        }
                        break;
                    }
                    else if (i >= length) {
                        break;
                    }
                }
                if (!rowResult.isFinish && startPage !== null && format.layout !== PdfLayoutType.OnePage && repeatRow) {
                    this.startLocation.x = this.currentBounds.x;
                    this.currentPage = this.getNextPageFormat(format);
                    if (this.treegrid.enableHeader) {
                        this.drawHeader();
                    }
                    this.startLocation.y = this.currentBounds.y;
                    if (format.paginateBounds === new RectangleF(0, 0, 0, 0)) {
                        this.currentBounds.x += this.startLocation.x;
                    }
                    if (this.currentBounds.x === PdfBorders.default.left.width / 2) {
                        this.currentBounds.y += this.startLocation.x;
                    }
                    this.drawRow(row);
                    if (this.currentPage !== null && !layoutedPages.containsKey(this.currentPage)) {
                        layoutedPages.add(this.currentPage, range);
                    }
                }
            }
            if (this.columnRanges.indexOf(range) < this.columnRanges.length - 1 &&
                startPage !== null && format.layout !== PdfLayoutType.OnePage) {
                this.currentPage = this.getNextPageFormat(format);
                this.checkBounds(format);
            }
        }
        result = this.getLayoutResult();
        if (this.treegrid.style.allowHorizontalOverflow
            && this.treegrid.style.horizontalOverflowType === PdfHorizontalOverflowType.NextPage) {
            this.reArrangePages(layoutedPages);
        }
        return result;
    };
    PdfTreeGridLayouter.prototype.checkBounds = function (format) {
        var location = new PointF(PdfBorders.default.right.width / 2, PdfBorders.default.top.width / 2);
        if (format.paginateBounds === new RectangleF(0, 0, 0, 0) && this.startLocation === location) {
            this.currentBounds.x += this.startLocation.x;
            this.currentBounds.y += this.startLocation.y;
        }
    };
    PdfTreeGridLayouter.prototype.drawHeader = function () {
        this.drawRow(this.treegrid.rows.getRow(0));
    };
    PdfTreeGridLayouter.prototype.reArrangePages = function (layoutPages) {
        var document = this.currentPage.document;
        var pages = [];
        var keys = layoutPages.keys();
        for (var i = 0; i < keys.length; i++) {
            var page = keys[i];
            page.section = null;
            pages.push(page);
            document.pages.remove(page);
        }
        for (var i = 0; i < layoutPages.size(); i++) {
            var count = (layoutPages.size() / this.columnRanges.length);
            for (var j = i; j < layoutPages.size(); j += count) {
                var page = pages[j];
                if (document.pages.indexOf(page) === -1) {
                    document.pages.add(page);
                }
            }
        }
    };
    // eslint-disable-next-line
    PdfTreeGridLayouter.prototype.getNextPageFormat = function (format) {
        var section = this.currentPage.section;
        var nextPage = null;
        var index = section.indexOf(this.currentPage);
        if (index === section.count - 1) {
            nextPage = section.add();
        }
        else {
            nextPage = section.getPages()[index + 1];
        }
        this.currentGraphics = nextPage.graphics;
        this.currentBounds = new RectangleF(new PointF(0, 0), nextPage.getClientSize());
        return nextPage;
    };
    PdfTreeGridLayouter.prototype.getLayoutResult = function () {
        var bounds = new RectangleF(this.startLocation, new SizeF(this.currentBounds.width, this.currentBounds.y -
            this.startLocation.y));
        return new PdfTreeGridLayoutResult(this.currentPage, bounds);
    };
    PdfTreeGridLayouter.prototype.checkIfDefaultFormat = function (format) {
        var defaultFormat = new PdfStringFormat();
        return (format.alignment === defaultFormat.alignment && format.characterSpacing === defaultFormat.characterSpacing &&
            format.clipPath === defaultFormat.clipPath && format.firstLineIndent === defaultFormat.firstLineIndent &&
            format.horizontalScalingFactor === defaultFormat.horizontalScalingFactor &&
            format.lineAlignment === defaultFormat.lineAlignment
            && format.lineLimit === defaultFormat.lineLimit && format.lineSpacing === defaultFormat.lineSpacing &&
            format.measureTrailingSpaces === defaultFormat.measureTrailingSpaces && format.noClip === defaultFormat.noClip &&
            format.paragraphIndent === defaultFormat.paragraphIndent && format.rightToLeft === defaultFormat.rightToLeft &&
            format.subSuperScript === defaultFormat.subSuperScript && format.wordSpacing === defaultFormat.wordSpacing &&
            format.wordWrap === defaultFormat.wordWrap);
    };
    PdfTreeGridLayouter.prototype.drawRow = function (row, layoutResult, height) {
        //.. Check if required space available.
        //.....If the row conains spans which  falls through more than one page, then draw the row to next page.
        if (isNullOrUndefined(layoutResult)) {
            var result = new RowLayoutResult();
            height = row.rowBreakHeight > 0 ? row.rowBreakHeight : row.height;
            if (height > this.currentPageBounds.height) {
                if (this.treegrid.allowRowBreakAcrossPages) {
                    result.isFinish = true;
                    this.drawRowWithBreak(result, row, height);
                }
                else {
                    // If AllowRowBreakAcrossPages is not true, draw the row till it fits the page.
                    result.isFinish = false;
                    this.drawRow(row, result, height);
                }
            }
            else if (this.currentBounds.y + height > this.currentPageBounds.height ||
                this.currentBounds.y + height > this.currentBounds.height) {
                if (this.repeatRowIndex > -1 && this.repeatRowIndex === row.rowIndex) {
                    if (this.treegrid.allowRowBreakAcrossPages) {
                        result.isFinish = true;
                        this.drawRowWithBreak(result, row, height);
                    }
                    else {
                        result.isFinish = false;
                        this.drawRow(row, result, height);
                    }
                }
                else {
                    result.isFinish = false;
                }
            }
            else {
                result.isFinish = true;
                this.drawRow(row, result, height);
            }
            return result;
        }
        else {
            var location_1 = new PointF(this.currentBounds.x, this.currentBounds.y);
            layoutResult.bounds = new RectangleF(location_1, new SizeF(0, 0));
            var leftAdjustment = 0;
            height = this.reCalculateHeight(row, height);
            for (var i = this.cellStartIndex; i <= this.cellEndIndex; i++) {
                var cell = row.cells.getCell(i);
                var column = this.treegrid.columns.getColumn(i);
                if (column.isTreeColumn) {
                    leftAdjustment = (row.level) * 10;
                }
                var cancelSpans = ((i > this.cellEndIndex + 1) && (cell.columnSpan > 1));
                if (!cancelSpans) {
                    for (var j = 1; j < cell.columnSpan; j++) {
                        row.cells.getCell(i + j).isCellMergeContinue = true;
                    }
                }
                var size = new SizeF(column.width, height);
                if (!this.checkIfDefaultFormat(column.format) && this.checkIfDefaultFormat(cell.style.format)) {
                    cell.style.format = column.format;
                }
                cell.draw(this.currentGraphics, new RectangleF(location_1, size), cancelSpans, leftAdjustment);
                /* eslint-disable-next-line */
                if (row.treegrid.style.allowHorizontalOverflow && (cell.columnSpan > this.cellEndIndex || i + cell.columnSpan > this.cellEndIndex + 1) && this.cellEndIndex < row.cells.count - 1) {
                    row.rowOverflowIndex = this.cellEndIndex;
                }
                location_1.x += column.width;
                leftAdjustment = 0;
            }
            this.currentBounds.y += height;
            /* eslint-disable-next-line */
            layoutResult.bounds = new RectangleF(new PointF(layoutResult.bounds.x, layoutResult.bounds.y), new SizeF(location_1.x, location_1.y));
            return null;
        }
    };
    /**
     * @param {RowLayoutResult} result .
     * @param {PdfTreeGridRow} row .
     * @param {number} height .
     * @returns {void} .
     */
    PdfTreeGridLayouter.prototype.drawRowWithBreak = function (result, row, height) {
        var location = new PointF(this.currentBounds.x, this.currentBounds.y);
        result.bounds = new RectangleF(location, new SizeF(0, 0));
        var leftAdjustment = 0;
        this.treegridHeight = this.currentBounds.height;
        // Calculate the remaining height.
        row.rowBreakHeight = this.currentBounds.y + height - this.currentBounds.height;
        // No need to explicit break if the row height is equal to treegrid height.
        for (var c = 0; c < row.cells.count; c++) {
            var cell = row.cells.getCell(c);
            var cellHeight = cell.measureHeight();
            if (cellHeight === height && cell.value === null) {
                row.rowBreakHeight = this.currentBounds.y + height - this.currentBounds.height;
            }
        }
        for (var i = this.cellStartIndex; i <= this.cellEndIndex; i++) {
            var column = this.treegrid.columns.getColumn(i);
            if (column.isTreeColumn) {
                leftAdjustment = row.level * 10;
            }
            var cell = row.cells.getCell(i);
            var cancelSpans = ((cell.columnSpan + i > this.cellEndIndex + 1) && (cell.columnSpan > 1));
            if (!cancelSpans) {
                for (var j = 1; j < cell.columnSpan; j++) {
                    row.cells.getCell(i + j).isCellMergeContinue = true;
                }
            }
            var tHeight = this.treegridHeight > 0 ? this.treegridHeight : this.currentBounds.height;
            var size = new SizeF(column.width, tHeight);
            if (!this.checkIfDefaultFormat(column.format) && this.checkIfDefaultFormat(cell.style.format)) {
                cell.style.format = column.format;
            }
            cell.draw(this.currentGraphics, new RectangleF(location, size), cancelSpans, leftAdjustment);
            result.isFinish = (!result.isFinish) ? result.isFinish : cell.finishedDrawingCell;
            location.x += column.width;
            leftAdjustment = 0;
            this.currentBounds.y += this.treegridHeight > 0 ? this.treegridHeight : height;
            result.bounds = new RectangleF(new PointF(result.bounds.x, result.bounds.y), new SizeF(location.x, location.y));
        }
    };
    /**
     * `Recalculate row height` for the split cell to be drawn.
     *
     * @param {PdfTreeGridRow} row .
     * @param {number} height .
     * @returns {void} .
     * @private
     */
    PdfTreeGridLayouter.prototype.reCalculateHeight = function (row, height) {
        var newHeight = 0;
        for (var i = this.cellStartIndex; i <= this.cellEndIndex; i++) {
            if (!isNullOrUndefined(row.cells.getCell(i).remainingString) ||
                row.cells.getCell(i).remainingString === '') {
                newHeight = Math.max(newHeight, row.cells.getCell(i).measureHeight());
            }
        }
        return Math.max(height, newHeight);
    };
    return PdfTreeGridLayouter;
}(ElementLayouter));
export { PdfTreeGridLayouter };
var PdfTreeGridLayoutResult = /** @class */ (function (_super) {
    __extends(PdfTreeGridLayoutResult, _super);
    /**
     * Constructor
     *
     * @param {PdfPage} page .
     * @param {RectangleF} bounds .
     * @private
     */
    function PdfTreeGridLayoutResult(page, bounds) {
        return _super.call(this, page, bounds) || this;
    }
    return PdfTreeGridLayoutResult;
}(PdfLayoutResult));
export { PdfTreeGridLayoutResult };
/**
 * `PdfGridLayoutFormat` class represents a flexible grid that consists of columns and rows.
 */
var PdfTreeGridLayoutFormat = /** @class */ (function (_super) {
    __extends(PdfTreeGridLayoutFormat, _super);
    /**
     * Initializes a new instance of the `PdfGridLayoutFormat` class.
     *
     * @param {PdfLayoutFormat} baseFormat .
     * @private
     */
    function PdfTreeGridLayoutFormat(baseFormat) {
        var _this = this;
        if (typeof baseFormat === 'undefined') {
            _this = _super.call(this) || this;
        }
        else {
            _this = _super.call(this, baseFormat) || this;
        }
        return _this;
    }
    return PdfTreeGridLayoutFormat;
}(PdfLayoutFormat));
export { PdfTreeGridLayoutFormat };
