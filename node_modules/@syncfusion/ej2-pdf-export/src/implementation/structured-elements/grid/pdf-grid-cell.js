import { PdfGrid } from './pdf-grid';
import { PdfGridCellStyle } from './styles/style';
import { PdfStringLayouter } from './../../graphics/fonts/string-layouter';
import { PdfDocument } from './../../document/pdf-document';
import { PdfStringFormat } from './../../graphics/fonts/pdf-string-format';
import { RectangleF, PointF, SizeF } from './../../drawing/pdf-drawing';
import { PdfDashStyle, PdfLineCap } from './../../graphics/enum';
import { PdfBorderOverlapStyle } from './../tables/light-tables/enum';
import { PdfSolidBrush } from './../../graphics/brushes/pdf-solid-brush';
import { PdfColor } from './../../graphics/pdf-color';
import { PdfImage } from './../../graphics/images/pdf-image';
import { PdfBitmap } from './../../graphics/images/pdf-bitmap';
import { PdfTextWebLink } from './../../annotations/pdf-text-web-link';
import { PdfLayoutType } from './../../graphics/figures/enum';
import { PdfGridLayouter, PdfGridLayoutFormat } from './../../structured-elements/grid/layout/grid-layouter';
import { PdfLayoutParams } from '../../../implementation/graphics/figures/base/element-layouter';
/**
 * `PdfGridCell` class represents the schema of a cell in a 'PdfGrid'.
 */
var PdfGridCell = /** @class */ (function () {
    function PdfGridCell(row) {
        /**
         * `Width` of the cell.
         * @default 0
         * @private
         */
        this.cellWidth = 0;
        /**
         * `Height` of the cell.
         * @default 0
         * @private
         */
        this.cellHeight = 0;
        /**
         * `tempval`to stores current width .
         * @default 0
         * @private
         */
        this.tempval = 0;
        this.fontSpilt = false;
        /**
         * Specifies weather the `cell is drawn`.
         * @default true
         * @private
         */
        this.finsh = true;
        /**
         * The `remaining height` of row span.
         * @default 0
         * @private
         */
        this.rowSpanRemainingHeight = 0;
        this.hasRowSpan = false;
        this.hasColSpan = false;
        /**
         * the 'isFinish' is set to page finish
         */
        this.isFinish = true;
        /**
         * The `present' to store the current cell.
         * @default false
         * @private
         */
        this.present = false;
        this.gridRowSpan = 1;
        this.colSpan = 1;
        if (typeof row !== 'undefined') {
            this.gridRow = row;
        }
    }
    Object.defineProperty(PdfGridCell.prototype, "isCellMergeContinue", {
        //Properties
        get: function () {
            return this.internalIsCellMergeContinue;
        },
        set: function (value) {
            this.internalIsCellMergeContinue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "isRowMergeContinue", {
        get: function () {
            return this.internalIsRowMergeContinue;
        },
        set: function (value) {
            this.internalIsRowMergeContinue = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "isCellMergeStart", {
        get: function () {
            return this.internalIsCellMergeStart;
        },
        set: function (value) {
            this.internalIsCellMergeStart = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "isRowMergeStart", {
        get: function () {
            return this.internalIsRowMergeStart;
        },
        set: function (value) {
            this.internalIsRowMergeStart = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "remainingString", {
        /**
         * Gets or sets the `remaining string` after the row split between pages.
         * @private
         */
        get: function () {
            return this.remaining;
        },
        set: function (value) {
            this.remaining = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "FinishedDrawingCell", {
        /**
         * Gets or sets the `FinishedDrawingCell` .
         * @private
         */
        get: function () {
            return this.isFinish;
        },
        set: function (value) {
            this.isFinish = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "stringFormat", {
        /**
         * Gets or sets the `string format`.
         * @private
         */
        get: function () {
            if (this.format == null) {
                this.format = new PdfStringFormat();
            }
            return this.format;
        },
        set: function (value) {
            this.format = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "row", {
        /**
         * Gets or sets the parent `row`.
         * @private
         */
        get: function () {
            return this.gridRow;
        },
        set: function (value) {
            this.gridRow = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "value", {
        /**
         * Gets or sets the `value` of the cell.
         * @private
         */
        get: function () {
            return this.objectValue;
        },
        set: function (value) {
            this.objectValue = value;
            if (this.objectValue instanceof PdfGrid) {
                this.row.grid.isSingleGrid = false;
                var grid = this.objectValue;
                grid.ParentCell = this;
                this.objectValue.isChildGrid = true;
                var rowCount = this.row.grid.rows.count;
                for (var i = 0; i < rowCount; i++) {
                    var row = this.row.grid.rows.getRow(i);
                    var colCount = row.cells.count;
                    for (var j = 0; j < colCount; j++) {
                        var cell = row.cells.getCell(j);
                        cell.parent = this;
                    }
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "rowSpan", {
        /**
         * Gets or sets a value that indicates the total number of rows that cell `spans` within a PdfGrid.
         * @private
         */
        get: function () {
            return this.gridRowSpan;
        },
        set: function (value) {
            if (value < 1) {
                throw new Error('ArgumentException : Invalid span specified, must be greater than or equal to 1');
            }
            else {
                this.gridRowSpan = value;
                this.row.rowSpanExists = true;
                this.row.grid.hasRowSpanSpan = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "style", {
        /**
         * Gets or sets the cell `style`.
         * @private
         */
        get: function () {
            if (this.cellStyle == null) {
                this.cellStyle = new PdfGridCellStyle();
            }
            return this.cellStyle;
        },
        set: function (value) {
            this.cellStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "height", {
        /**
         * Gets the `height` of the PdfGrid cell.[Read-Only].
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
    Object.defineProperty(PdfGridCell.prototype, "columnSpan", {
        /**
         * Gets or sets a value that indicates the total number of columns that cell `spans` within a PdfGrid.
         * @private
         */
        get: function () {
            return this.colSpan;
        },
        set: function (value) {
            if (value < 1) {
                throw Error('Invalid span specified, must be greater than or equal to 1');
            }
            else {
                this.colSpan = value;
                this.row.columnSpanExists = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfGridCell.prototype, "width", {
        /**
         * Gets the `width` of the PdfGrid cell.[Read-Only].
         * @private
         */
        get: function () {
            if (this.cellWidth === 0 || this.row.grid.isComplete) {
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
    //Implementation
    /**
     * `Calculates the width`.
     * @private
     */
    PdfGridCell.prototype.measureWidth = function () {
        // .. Calculate the cell text width.
        // .....Add border widths, cell spacings and paddings to the width.
        var width = 0;
        var layouter = new PdfStringLayouter();
        if (typeof this.objectValue === 'string') {
            /* tslint:disable */
            var slr = layouter.layout(this.objectValue, this.getTextFont(), this.stringFormat, new SizeF(Number.MAX_VALUE, Number.MAX_VALUE), false, new SizeF(0, 0));
            width += slr.actualSize.width;
            width += (this.style.borders.left.width + this.style.borders.right.width) * 2;
        }
        else if (this.objectValue instanceof PdfGrid) {
            width = this.objectValue.size.width;
            //width += this.objectValue.style.cellSpacing;
        }
        else if (this.objectValue instanceof PdfImage || this.objectValue instanceof PdfBitmap) {
            width += this.objectValue.width;
        }
        else if (this.objectValue instanceof PdfTextWebLink) {
            var webLink = this.objectValue;
            var result = layouter.layout(webLink.text, webLink.font, webLink.stringFormat, new SizeF(0, 0), false, new SizeF(0, 0));
            /* tslint:enable */
            width += result.actualSize.width;
            width += (this.style.borders.left.width + this.style.borders.right.width) * 2;
        }
        if (!(this.objectValue instanceof PdfGrid)) {
            if (this.style.cellPadding != null) {
                width += (this.style.cellPadding.left + this.style.cellPadding.right);
            }
            else {
                width += (this.row.grid.style.cellPadding.left + this.row.grid.style.cellPadding.right);
            }
        }
        else {
            if (this.style.cellPadding != null || typeof this.style.cellPadding !== 'undefined') {
                if (typeof this.style.cellPadding.left !== 'undefined' && this.style.cellPadding.hasLeftPad) {
                    width += this.style.cellPadding.left;
                }
                if (typeof this.style.cellPadding.right !== 'undefined' && this.style.cellPadding.hasRightPad) {
                    width += this.style.cellPadding.right;
                }
            }
            else {
                if (typeof this.row.grid.style.cellPadding.left !== 'undefined' && this.row.grid.style.cellPadding.hasLeftPad) {
                    width += this.row.grid.style.cellPadding.left;
                }
                if (typeof this.row.grid.style.cellPadding.right !== 'undefined' && this.row.grid.style.cellPadding.hasRightPad) {
                    width += this.row.grid.style.cellPadding.right;
                }
            }
        }
        width += this.row.grid.style.cellSpacing;
        return width;
    };
    /**
     * Draw the `cell background`.
     * @private
     */
    PdfGridCell.prototype.drawCellBackground = function (graphics, bounds) {
        var backgroundBrush = this.getBackgroundBrush();
        //graphics.isTemplateGraphics = true;
        if (backgroundBrush != null) {
            graphics.save();
            graphics.drawRectangle(backgroundBrush, bounds.x, bounds.y, bounds.width, bounds.height);
            graphics.restore();
        }
        if (this.style.backgroundImage != null) {
            var image = this.getBackgroundImage();
            graphics.drawImage(this.style.backgroundImage, bounds.x, bounds.y, bounds.width, bounds.height);
        }
    };
    /**
     * `Adjusts the text layout area`.
     * @private
     */
    /* tslint:disable */
    PdfGridCell.prototype.adjustContentLayoutArea = function (bounds) {
        //Add Padding value to its Cell Bounds
        var returnBounds = new RectangleF(bounds.x, bounds.y, bounds.width, bounds.height);
        if (!(this.objectValue instanceof PdfGrid)) {
            if (typeof this.style.cellPadding === 'undefined' || this.style.cellPadding == null) {
                returnBounds.x += this.gridRow.grid.style.cellPadding.left + this.cellStyle.borders.left.width;
                returnBounds.y += this.gridRow.grid.style.cellPadding.top + this.cellStyle.borders.top.width;
                returnBounds.width -= (this.gridRow.grid.style.cellPadding.right + this.gridRow.grid.style.cellPadding.left);
                returnBounds.height -= (this.gridRow.grid.style.cellPadding.bottom + this.gridRow.grid.style.cellPadding.top);
                returnBounds.height -= (this.cellStyle.borders.top.width + this.cellStyle.borders.bottom.width);
            }
            else {
                returnBounds.x += this.style.cellPadding.left + this.cellStyle.borders.left.width;
                returnBounds.y += this.style.cellPadding.top + this.cellStyle.borders.top.width;
                returnBounds.width -= (this.style.cellPadding.right + this.style.cellPadding.left);
                returnBounds.width -= (this.cellStyle.borders.left.width + this.cellStyle.borders.right.width);
                returnBounds.height -= (this.style.cellPadding.bottom + this.style.cellPadding.top);
                returnBounds.height -= (this.cellStyle.borders.top.width + this.cellStyle.borders.bottom.width);
                if (this.rowSpan === 1) {
                    returnBounds.width -= (this.style.borders.left.width);
                }
            }
        }
        else {
            if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
                if (typeof this.gridRow.grid.style.cellPadding.left !== 'undefined' && this.gridRow.grid.style.cellPadding.hasLeftPad) {
                    returnBounds.x += this.gridRow.grid.style.cellPadding.left + this.cellStyle.borders.left.width;
                    returnBounds.width -= this.gridRow.grid.style.cellPadding.left;
                }
                if (typeof this.gridRow.grid.style.cellPadding.top !== 'undefined' && this.gridRow.grid.style.cellPadding.hasTopPad) {
                    returnBounds.y += this.gridRow.grid.style.cellPadding.top + this.cellStyle.borders.top.width;
                    returnBounds.height -= this.gridRow.grid.style.cellPadding.top;
                }
                if (typeof this.gridRow.grid.style.cellPadding.right !== 'undefined' && this.gridRow.grid.style.cellPadding.hasRightPad) {
                    returnBounds.width -= this.gridRow.grid.style.cellPadding.right;
                }
                if (typeof this.gridRow.grid.style.cellPadding.bottom !== 'undefined' && this.gridRow.grid.style.cellPadding.hasBottomPad) {
                    returnBounds.height -= this.gridRow.grid.style.cellPadding.bottom;
                }
            }
            else {
                if (typeof this.style.cellPadding.left !== 'undefined' && this.style.cellPadding.hasLeftPad) {
                    returnBounds.x += this.style.cellPadding.left + this.cellStyle.borders.left.width;
                    returnBounds.width -= this.style.cellPadding.left;
                }
                if (typeof this.style.cellPadding.top !== 'undefined' && this.style.cellPadding.hasTopPad) {
                    returnBounds.y += this.style.cellPadding.top + this.cellStyle.borders.top.width;
                    returnBounds.height -= this.style.cellPadding.top;
                }
                if (typeof this.style.cellPadding.right !== 'undefined' && this.style.cellPadding.hasRightPad) {
                    returnBounds.width -= this.style.cellPadding.right;
                }
                if (typeof this.style.cellPadding.bottom !== 'undefined' && this.style.cellPadding.hasBottomPad) {
                    returnBounds.height -= this.style.cellPadding.bottom;
                }
            }
            returnBounds.width -= (this.cellStyle.borders.left.width + this.cellStyle.borders.right.width);
            returnBounds.height -= (this.cellStyle.borders.top.width + this.cellStyle.borders.bottom.width);
        }
        return returnBounds;
    };
    /**
     * `Draws` the specified graphics.
     * @private
     */
    PdfGridCell.prototype.draw = function (graphics, bounds, cancelSubsequentSpans) {
        var isrowbreak = false;
        /*if (!this.row.grid.isSingleGrid)
        {
            //Check whether the Grid Span to Nextpage
            if ((this.remainingString != null) || (PdfGridLayouter.repeatRowIndex != -1))
            {
                this.DrawParentCells(graphics, bounds, true);
            }
            else if (this.row.grid.rows.count > 1)
            {
                for (let i : number  = 0; i < this.row.grid.rows.count; i++)
                {
                    if (this.row == this.row.grid.rows.getRow(i))
                    {
                        if (this.row.grid.rows.getRow(i).rowBreakHeight > 0)
                            isrowbreak = true;
                        if ((i > 0) && (isrowbreak))
                            this.DrawParentCells(graphics, bounds, false);
                    }
                }
            }
        } */
        var result = null;
        /*if (cancelSubsequentSpans)
        {
            //..Cancel all subsequent cell spans, if no space exists.
            let currentCellIndex : number = this.row.cells.indexOf(this);
            for (let i : number = currentCellIndex + 1; i <= currentCellIndex + this.colSpan; i++)
            {
                this.row.cells.getCell(i).isCellMergeContinue = false;
                this.row.cells.getCell(i).isRowMergeContinue = false;
            }
            this.colSpan = 1;
        }*/
        //..Skip cells which were already covered by spanmap.
        if (this.internalIsCellMergeContinue || this.internalIsRowMergeContinue) {
            if (this.internalIsCellMergeContinue && this.row.grid.style.allowHorizontalOverflow) {
                if ((this.row.rowOverflowIndex > 0 && (this.row.cells.indexOf(this) != this.row.rowOverflowIndex + 1)) || (this.row.rowOverflowIndex == 0 && this.internalIsCellMergeContinue)) {
                    return result;
                }
            }
            else {
                return result;
            }
        }
        //Adjust bounds with Row and Column Spacing
        bounds = this.adjustOuterLayoutArea(bounds, graphics);
        this.drawCellBackground(graphics, bounds);
        var textPen = this.getTextPen();
        var textBrush = this.getTextBrush();
        if (typeof textPen === 'undefined' && typeof textBrush === 'undefined') {
            textBrush = new PdfSolidBrush(new PdfColor(0, 0, 0));
        }
        var font = this.getTextFont();
        var strFormat = this.getStringFormat();
        var innerLayoutArea = bounds;
        if (innerLayoutArea.height >= graphics.clientSize.height) {
            // If to break row to next page.
            if (this.row.grid.allowRowBreakAcrossPages) {
                innerLayoutArea.height -= innerLayoutArea.y;
                //bounds.height -= bounds.y;
                // if(this.row.grid.isChildGrid)
                // {
                //     innerLayoutArea.height -= this.row.grid.ParentCell.row.grid.style.cellPadding.bottom;
                // }
            }
            // if user choose to cut the row whose height is more than page height.
            // else
            // {
            //     innerLayoutArea.height = graphics.clientSize.height;
            //     bounds.height = graphics.clientSize.height;
            // }
        }
        innerLayoutArea = this.adjustContentLayoutArea(innerLayoutArea);
        if (typeof this.objectValue === 'string' || typeof this.remaining === 'string') {
            var temp = void 0;
            var layoutRectangle = void 0;
            if (innerLayoutArea.height < font.height)
                layoutRectangle = new RectangleF(innerLayoutArea.x, innerLayoutArea.y, innerLayoutArea.width, font.height);
            else
                layoutRectangle = innerLayoutArea;
            if (innerLayoutArea.height < font.height && this.row.grid.isChildGrid && this.row.grid.ParentCell != null) {
                var height = layoutRectangle.height - this.row.grid.ParentCell.row.grid.style.cellPadding.bottom - this.row.grid.style.cellPadding.bottom;
                if (this.row.grid.splitChildRowIndex != -1) {
                    this.fontSpilt = true;
                    this.row.rowFontSplit = true;
                }
                if (height > 0 && height < font.height)
                    layoutRectangle.height = height;
                // else if (height + this.row.grid.style.cellPadding.bottom > 0 && height + this.row.grid.style.cellPadding.bottom < font.height)
                //     layoutRectangle.height = height + this.row.grid.style.cellPadding.bottom;
                // else if (bounds.height < font.height)
                //     layoutRectangle.height = bounds.height;
                // else if (bounds.height - this.row.grid.ParentCell.row.grid.style.cellPadding.bottom < font.height)
                //     layoutRectangle.height = bounds.height - this.row.grid.ParentCell.row.grid.style.cellPadding.bottom;                        
            }
            if (this.gridRow.grid.style.cellSpacing != 0) {
                layoutRectangle.width -= this.gridRow.grid.style.cellSpacing;
                bounds.width -= this.gridRow.grid.style.cellSpacing;
            }
            if (this.isFinish) {
                // if (this.row.grid.splitChildRowIndex != -1 && !this.row.grid.isChildGrid && typeof this.remaining === 'undefined'){
                //     this.remaining = '';
                //     graphics.drawString(this.remaining, font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
                // } else {
                temp = this.remaining === '' ? this.remaining : this.objectValue;
                graphics.drawString(temp, font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
                if (this.row.grid.splitChildRowIndex != -1 && !this.row.grid.isChildGrid && typeof this.remaining === 'undefined') {
                    this.remaining = '';
                    //graphics.drawString(this.remaining, font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
                }
            }
            else {
                if (typeof this.remaining == 'undefined' || this.remaining === null) {
                    this.remaining = '';
                }
                if (this.row.repeatFlag) {
                    graphics.drawString(this.remaining, font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
                }
                //  else {
                //     if(this.row.grid.ParentCell.row.repeatFlag) {
                //         graphics.drawString((this.remaining as string), font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);                    
                //     } else {
                //         layoutRectangle.height = this.row.height;
                //         graphics.drawString((this.objectValue as string), font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
                //         bounds.height = this.row.height;
                //     }
                //  }
                this.isFinish = true;
                //graphics.drawString((this.remaining as string), font, textPen, textBrush, layoutRectangle.x, layoutRectangle.y, layoutRectangle.width, layoutRectangle.height, strFormat);
            }
            result = graphics.stringLayoutResult;
            // if(this.row.grid.isChildGrid && this.row.rowBreakHeight > 0 && result !=null) {
            //     bounds.height -= this.row.grid.ParentCell.row.grid.style.cellPadding.bottom;
            // }
        }
        else if (this.objectValue instanceof PdfGrid) {
            var childGrid = this.objectValue;
            childGrid.isChildGrid = true;
            childGrid.ParentCell = this;
            var layoutRect = void 0;
            layoutRect = innerLayoutArea;
            if (this.gridRow.grid.style.cellSpacing != 0) {
                bounds.width -= this.gridRow.grid.style.cellSpacing;
            }
            // layoutRect = bounds;
            // if (this.style.cellPadding != null){
            //     layoutRect = bounds;            
            // } else if((this.row.grid.style.cellPadding != null) && (childGrid.style.cellPadding.bottom === 0.5) && (childGrid.style.cellPadding.top === 0.5)
            //                               && (childGrid.style.cellPadding.left === 5.76) && (childGrid.style.cellPadding.right === 5.76)
            //                               && (this.gridRow.grid.style.cellSpacing === 0) && (childGrid.style.cellSpacing === 0)) {
            //     layoutRect = innerLayoutArea;
            // }
            // if(this.objectValue.style.cellPadding != null && typeof this.objectValue.style.cellPadding !== 'undefined'){
            //     layoutRect = bounds;
            // }           
            var layouter = new PdfGridLayouter(childGrid);
            var format = new PdfGridLayoutFormat();
            if (this.row.grid.LayoutFormat != null)
                format = this.row.grid.LayoutFormat;
            else
                format.layout = PdfLayoutType.Paginate;
            var param = new PdfLayoutParams();
            if (graphics.layer != null) {
                // Define layout parameters.
                param.page = graphics.page;
                param.bounds = layoutRect;
                param.format = format;
                //Set the span 
                childGrid.setSpan();
                childGrid.checkSpan();
                // Draw the child grid.
                var childGridResult = layouter.Layouter(param);
                //let childGridResult : PdfLayoutResult = layouter.innerLayout(param);
                this.value = childGrid;
                if (this.row.grid.splitChildRowIndex !== -1) {
                    this.height = this.row.rowBreakHeightValue;
                }
                if (param.page != childGridResult.page) //&& (isWidthGreaterthanParent != true))
                 {
                    childGridResult.bounds.height = this.row.rowBreakHeightValue;
                    if (this.row.rowBreakHeight == 0)
                        this.row.NestedGridLayoutResult = childGridResult;
                    else
                        this.row.rowBreakHeight = this.row.rowBreakHeightValue;
                    //bounds.height = this.row.rowBreakHeight;
                    //After drawing paginated nested grid, the bounds of the parent grid in start page should be corrected for borders.
                    //bounds.height = graphics.clientSize.height - bounds.y;
                }
            }
        }
        else if (this.objectValue instanceof PdfImage || this.objectValue instanceof PdfBitmap) {
            var imageBounds = void 0;
            if (this.objectValue.width <= innerLayoutArea.width) {
                imageBounds = new RectangleF(innerLayoutArea.x, innerLayoutArea.y, this.objectValue.width, innerLayoutArea.height);
            }
            else {
                imageBounds = innerLayoutArea;
            }
            graphics.drawImage(this.objectValue, imageBounds.x, imageBounds.y, imageBounds.width, imageBounds.height);
        }
        else if (this.objectValue instanceof PdfTextWebLink) {
            this.objectValue.draw(graphics.currentPage, innerLayoutArea);
        }
        else if (typeof this.objectValue === 'undefined') {
            this.objectValue = "";
            graphics.drawString(this.objectValue, font, textPen, textBrush, innerLayoutArea.x, innerLayoutArea.y, innerLayoutArea.width, innerLayoutArea.height, strFormat);
            if (this.style.cellPadding != null && this.style.cellPadding.bottom == 0 && this.style.cellPadding.left == 0 && this.style.cellPadding.right == 0 && this.style.cellPadding.top == 0) {
                bounds.width -= (this.style.borders.left.width + this.style.borders.right.width);
            }
            if (this.gridRow.grid.style.cellSpacing != 0) {
                bounds.width -= this.gridRow.grid.style.cellSpacing;
            }
        }
        if (this.style.borders != null) {
            if (!this.fontSpilt)
                this.drawCellBorders(graphics, bounds);
            else {
                if (this.row.grid.ParentCell.row.grid.splitChildRowIndex != -1) {
                    this.row.rowFontSplit = false;
                    this.drawCellBorders(graphics, bounds);
                }
            }
        }
        return result;
    };
    /* tslint:enable */
    /**
     * Draws the `cell border` constructed by drawing lines.
     * @private
     */
    PdfGridCell.prototype.drawCellBorders = function (graphics, bounds) {
        if (this.row.grid.style.borderOverlapStyle === PdfBorderOverlapStyle.Inside) {
            bounds.x += this.style.borders.left.width;
            bounds.y += this.style.borders.top.width;
            bounds.width -= this.style.borders.right.width;
            bounds.height -= this.style.borders.bottom.width;
        }
        var p1 = new PointF(bounds.x, bounds.y + bounds.height);
        var p2 = new PointF(bounds.x, bounds.y);
        var pen = this.cellStyle.borders.left;
        if (this.cellStyle.borders.left.dashStyle === PdfDashStyle.Solid) {
            pen.lineCap = PdfLineCap.Square;
        }
        // SetTransparency(ref graphics, pen);
        if (pen.width !== 0) {
            graphics.drawLine(pen, p1, p2);
        }
        p1 = new PointF(bounds.x + bounds.width, bounds.y);
        p2 = new PointF(bounds.x + bounds.width, bounds.y + bounds.height);
        pen = this.cellStyle.borders.right;
        if ((bounds.x + bounds.width) > (graphics.clientSize.width - (pen.width / 2))) {
            p1 = new PointF(graphics.clientSize.width - (pen.width / 2), bounds.y);
            p2 = new PointF(graphics.clientSize.width - (pen.width / 2), bounds.y + bounds.height);
        }
        if (this.cellStyle.borders.right.dashStyle === PdfDashStyle.Solid) {
            pen.lineCap = PdfLineCap.Square;
        }
        if (pen.width !== 0) {
            graphics.drawLine(pen, p1, p2);
        }
        p1 = new PointF(bounds.x, bounds.y);
        p2 = new PointF(bounds.x + bounds.width, bounds.y);
        pen = this.cellStyle.borders.top;
        if (this.cellStyle.borders.top.dashStyle === PdfDashStyle.Solid) {
            pen.lineCap = PdfLineCap.Square;
        }
        if (pen.width !== 0) {
            graphics.drawLine(pen, p1, p2);
        }
        p1 = new PointF(bounds.x + bounds.width, bounds.y + bounds.height);
        p2 = new PointF(bounds.x, bounds.y + bounds.height);
        pen = this.cellStyle.borders.bottom;
        if ((bounds.y + bounds.height) > (graphics.clientSize.height - (pen.width / 2))) {
            p1 = new PointF((bounds.x + bounds.width), (graphics.clientSize.height - (pen.width / 2)));
            p2 = new PointF(bounds.x, (graphics.clientSize.height - (pen.width / 2)));
        }
        if (this.cellStyle.borders.bottom.dashStyle === PdfDashStyle.Solid) {
            pen.lineCap = PdfLineCap.Square;
        }
        if (pen.width !== 0) {
            graphics.drawLine(pen, p1, p2);
        }
    };
    // private setTransparency(graphics : PdfGraphics, pen : PdfPen) : void {
    //     let alpha : number = (pen.color.a / 255) as number;
    //     graphics.save();
    //     graphics.setTransparency(alpha);
    // }
    /**
     * `Adjusts the outer layout area`.
     * @private
     */
    /* tslint:disable */
    PdfGridCell.prototype.adjustOuterLayoutArea = function (bounds, g) {
        var isHeader = false;
        var cellSpacing = this.row.grid.style.cellSpacing;
        if (cellSpacing > 0) {
            bounds = new RectangleF(bounds.x + cellSpacing, bounds.y + cellSpacing, bounds.width - cellSpacing, bounds.height - cellSpacing);
        }
        var currentColIndex = this.row.cells.indexOf(this);
        if (this.columnSpan > 1 || (this.row.rowOverflowIndex > 0 && (currentColIndex == this.row.rowOverflowIndex + 1) && this.isCellMergeContinue)) {
            var span = this.columnSpan;
            if (span == 1 && this.isCellMergeContinue) {
                for (var j = currentColIndex + 1; j < this.row.grid.columns.count; j++) {
                    if (this.row.cells.getCell(j).isCellMergeContinue)
                        span++;
                    else
                        break;
                }
            }
            var totalWidth = 0;
            for (var i = currentColIndex; i < currentColIndex + span; i++) {
                if (this.row.grid.style.allowHorizontalOverflow) {
                    var width = void 0;
                    var compWidth = this.row.grid.size.width < g.clientSize.width ? this.row.grid.size.width : g.clientSize.width;
                    if (this.row.grid.size.width > g.clientSize.width) {
                        width = bounds.x + totalWidth + this.row.grid.columns.getColumn(i).width;
                    }
                    else {
                        width = totalWidth + this.row.grid.columns.getColumn(i).width;
                    }
                    if (width > compWidth) {
                        break;
                    }
                }
                totalWidth += this.row.grid.columns.getColumn(i).width;
            }
            totalWidth -= this.row.grid.style.cellSpacing;
            bounds.width = totalWidth;
        }
        if (this.rowSpan > 1 || this.row.rowSpanExists) {
            var span = this.rowSpan;
            var currentRowIndex = this.row.grid.rows.rowCollection.indexOf(this.row);
            if (currentRowIndex == -1) {
                currentRowIndex = this.row.grid.headers.indexOf(this.row);
                if (currentRowIndex != -1) {
                    isHeader = true;
                }
            }
            // if (span == 1 && this.isCellMergeContinue) {
            //         for (let j : number = currentRowIndex + 1; j < this.row.grid.rows.count; j++)
            //         {
            //             let flag : boolean = (isHeader ? this.row.grid.headers.getHeader(j).cells.getCell(currentColIndex).isCellMergeContinue : this.row.grid.rows.getRow(j).cells.getCell(currentColIndex).isCellMergeContinue);
            //             if (flag)
            //                 span++;
            //             else
            //                 break;
            //         }
            // }
            var totalHeight = 0;
            var max = 0;
            for (var i = currentRowIndex; i < currentRowIndex + span; i++) {
                totalHeight += (isHeader ? this.row.grid.headers.getHeader(i).height : this.row.grid.rows.getRow(i).height);
                var row = this.row.grid.rows.getRow(i);
                var rowIndex = this.row.grid.rows.rowCollection.indexOf(row);
                /*if (this.rowSpan > 1)
                    {
                        for (let k : number = 0; k < this.row.cells.count; k++) {
                            let cell : PdfGridCell = this.row.cells.getCell(k);
                            if(cell.rowSpan>1)
                            {
                                let tempHeight : number =0;
                                
                                for (let j :number = i; j < i +cell.rowSpan; j++)
                                {
                                    if (!this.row.grid.rows.getRow(j).isRowSpanRowHeightSet)
                                        this.row.grid.rows.getRow(j).isRowHeightSet = false;
                                    tempHeight += this.row.grid.rows.getRow(j).height;
                                    if (!this.row.grid.rows.getRow(j).isRowSpanRowHeightSet)
                                        this.row.grid.rows.getRow(j).isRowHeightSet = true;
                                }
                                //To check the Row spanned cell height is greater than the total spanned row height.
                                if(cell.height>tempHeight)
                                {
                                    if (max < (cell.height - tempHeight))
                                    {
                                        max = cell.height - tempHeight;
                                        if (this.rowSpanRemainingHeight != 0 && max > this.rowSpanRemainingHeight)
                                        {
                                            max += this.rowSpanRemainingHeight;
                                        }
                                        let index :number = row.cells.indexOf(cell);
                                        //set the m_rowspanRemainingHeight to last rowspanned row.
                                        this.row.grid.rows.getRow((rowIndex +cell.rowSpan) - 1).cells.getCell(index).rowSpanRemainingHeight = max;
                                        this.rowSpanRemainingHeight = this.row.grid.rows.getRow((rowIndex + cell.rowSpan) - 1).cells.getCell(index).rowSpanRemainingHeight;
                                    }
                                }
                            }
                        }
                    }
                    if (!this.row.grid.rows.getRow(i).isRowSpanRowHeightSet)
                    this.row.grid.rows.getRow(i).isRowHeightSet = true;*/
            }
            var cellIndex = this.row.cells.indexOf(this);
            totalHeight -= this.row.grid.style.cellSpacing;
            // if (this.row.cells.getCell(cellIndex).height > totalHeight && (!this.row.grid.rows.getRow((currentRowIndex + span) - 1).isRowHeightSet)) {
            //      this.row.grid.rows.getRow((currentRowIndex + span) - 1).cells.getCell(cellIndex).rowSpanRemainingHeight = this.row.cells.getCell(cellIndex).height - totalHeight;
            //      totalHeight = this.row.cells.getCell(cellIndex).height;
            //      bounds.height = totalHeight;
            // } else {
            bounds.height = totalHeight;
            //  }
            if (!this.row.rowMergeComplete) {
                bounds.height = totalHeight;
            }
        }
        return bounds;
    };
    /* tslint:enable */
    /**
     * Gets the `text font`.
     * @private
     */
    PdfGridCell.prototype.getTextFont = function () {
        if (typeof this.style.font !== 'undefined' && this.style.font != null) {
            return this.style.font;
        }
        else if (typeof this.row.style.font !== 'undefined' && this.row.style.font != null) {
            return this.row.style.font;
        }
        else if (typeof this.row.grid.style.font !== 'undefined' && this.row.grid.style.font != null) {
            return this.row.grid.style.font;
        }
        else {
            return PdfDocument.defaultFont;
        }
    };
    /**
     * Gets the `text brush`.
     * @private
     */
    PdfGridCell.prototype.getTextBrush = function () {
        if (typeof this.style.textBrush !== 'undefined' && this.style.textBrush != null) {
            return this.style.textBrush;
        }
        else if (typeof this.row.style.textBrush !== 'undefined' && this.row.style.textBrush != null) {
            return this.row.style.textBrush;
        }
        else {
            return this.row.grid.style.textBrush;
        }
    };
    /**
     * Gets the `text pen`.
     * @private
     */
    PdfGridCell.prototype.getTextPen = function () {
        if (typeof this.style.textPen !== 'undefined' && this.style.textPen != null) {
            return this.style.textPen;
        }
        else if (typeof this.row.style.textPen !== 'undefined' && this.row.style.textPen != null) {
            return this.row.style.textPen;
        }
        else {
            return this.row.grid.style.textPen;
        }
    };
    /**
     * Gets the `background brush`.
     * @private
     */
    PdfGridCell.prototype.getBackgroundBrush = function () {
        if (typeof this.style.backgroundBrush !== 'undefined' && this.style.backgroundBrush != null) {
            return this.style.backgroundBrush;
        }
        else if (typeof this.row.style.backgroundBrush !== 'undefined' && this.row.style.backgroundBrush != null) {
            return this.row.style.backgroundBrush;
        }
        else {
            return this.row.grid.style.backgroundBrush;
        }
    };
    /**
     * Gets the `background image`.
     * @private
     */
    PdfGridCell.prototype.getBackgroundImage = function () {
        if (typeof this.style.backgroundImage !== 'undefined' && this.style.backgroundImage != null) {
            return this.style.backgroundImage;
        }
        else if (typeof this.row.style.backgroundImage !== 'undefined' && this.row.style.backgroundImage != null) {
            return this.row.style.backgroundImage;
        }
        else {
            return this.row.grid.style.backgroundImage;
        }
    };
    /**
     * Gets the current `StringFormat`.
     * @private
     */
    PdfGridCell.prototype.getStringFormat = function () {
        if (typeof this.style.stringFormat !== 'undefined' && this.style.stringFormat != null) {
            return this.style.stringFormat;
        }
        else {
            return this.stringFormat;
        }
    };
    /**
     * Calculates the `height`.
     * @private
     */
    PdfGridCell.prototype.measureHeight = function () {
        // .. Calculate the cell text height.
        // .....Add border widths, cell spacings and paddings to the height.
        var width = this.calculateWidth();
        // //check whether the Current PdfGridCell has padding
        if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
            width -= (this.gridRow.grid.style.cellPadding.right + this.gridRow.grid.style.cellPadding.left);
            //width -= (this.style.borders.left.width + this.style.borders.right.width);
        }
        else {
            width -= (this.style.cellPadding.right + this.style.cellPadding.left);
            width -= (this.style.borders.left.width + this.style.borders.right.width);
        }
        var height = 0;
        var layouter = new PdfStringLayouter();
        if (typeof this.objectValue === 'string' || typeof this.remaining === 'string') {
            var currentValue = this.objectValue;
            /* tslint:disable */
            if (!this.isFinish)
                currentValue = !(this.remaining === null || this.remaining === '' ||
                    typeof this.remaining === 'undefined') ? this.remaining : this.objectValue;
            var slr = null;
            var cellIndex = this.row.cells.indexOf(this);
            if (this.gridRow.grid.style.cellSpacing != 0) {
                width -= this.gridRow.grid.style.cellSpacing * 2;
            }
            if (!this.row.cells.getCell(cellIndex).hasColSpan && !this.row.cells.getCell(cellIndex).hasRowSpan) {
                if (this.gridRow.grid.isChildGrid) {
                    if (width < 0) {
                        this.tempval = width;
                        if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
                            this.tempval += (this.gridRow.grid.style.cellPadding.right + this.gridRow.grid.style.cellPadding.left);
                        }
                        else {
                            this.tempval += (this.style.cellPadding.right + this.style.cellPadding.left);
                            this.tempval += (this.style.borders.left.width + this.style.borders.right.width);
                        }
                    }
                    else {
                        this.tempval = width;
                    }
                    slr = layouter.layout(currentValue, this.getTextFont(), this.stringFormat, new SizeF(this.tempval, 0), false, new SizeF(0, 0));
                    height += slr.actualSize.height;
                }
                else {
                    slr = layouter.layout(currentValue, this.getTextFont(), this.stringFormat, new SizeF(width, 0), false, new SizeF(0, 0));
                    height += slr.actualSize.height;
                }
            }
            /* tslint:enable */
            height += (this.style.borders.top.width + this.style.borders.bottom.width) * 2;
        }
        else if (this.objectValue instanceof PdfGrid) {
            var cellIndex = this.row.cells.indexOf(this);
            var internalWidth = 0;
            if ((this.style.cellPadding != null || typeof this.style.cellPadding !== 'undefined')) {
                internalWidth = this.calculateWidth();
                if (typeof this.style.cellPadding.left !== 'undefined' && this.style.cellPadding.hasLeftPad) {
                    internalWidth -= this.style.cellPadding.left;
                }
                if (typeof this.style.cellPadding.right !== 'undefined' && this.style.cellPadding.hasRightPad) {
                    internalWidth -= this.style.cellPadding.right;
                }
            }
            else if ((this.row.grid.style.cellPadding != null || typeof this.row.grid.style.cellPadding !== 'undefined')) {
                internalWidth = this.calculateWidth();
                if (typeof this.row.grid.style.cellPadding.left !== 'undefined' && this.row.grid.style.cellPadding.hasLeftPad) {
                    internalWidth -= this.row.grid.style.cellPadding.left;
                }
                if (typeof this.row.grid.style.cellPadding.right !== 'undefined' && this.row.grid.style.cellPadding.hasRightPad) {
                    internalWidth -= this.row.grid.style.cellPadding.right;
                }
            }
            else {
                internalWidth = this.calculateWidth();
            }
            this.objectValue.tempWidth = internalWidth;
            if (!this.row.cells.getCell(cellIndex).hasColSpan && !this.row.cells.getCell(cellIndex).hasRowSpan) {
                height = this.objectValue.size.height;
            }
            else {
                height += (this.style.borders.top.width + this.style.borders.bottom.width) * 2;
            }
            if (this.gridRow.grid.style.cellSpacing !== 0) {
                width -= this.gridRow.grid.style.cellSpacing * 2;
                //height += (this.row.grid.style.cellPadding.top + this.row.grid.style.cellPadding.bottom);
            }
            if (this.style.cellPadding != null || typeof this.style.cellPadding !== 'undefined') {
                if (typeof this.row.grid.style.cellPadding.top !== 'undefined' && this.row.grid.style.cellPadding.hasTopPad) {
                    height += this.row.grid.style.cellPadding.top;
                }
                if (this.row.grid.style.cellPadding.hasBottomPad && typeof this.row.grid.style.cellPadding.bottom !== 'undefined') {
                    height += this.row.grid.style.cellPadding.bottom;
                }
            }
            height += this.objectValue.style.cellSpacing;
        }
        else if (this.objectValue instanceof PdfImage || this.objectValue instanceof PdfBitmap) {
            height += this.objectValue.height;
        }
        else if (this.objectValue instanceof PdfTextWebLink) {
            var webLink = this.objectValue;
            /* tslint:disable */
            var slr = layouter.layout(webLink.text, webLink.font, webLink.stringFormat, new SizeF(width, 0), false, new SizeF(0, 0));
            /* tslint:enable */
            height += slr.actualSize.height;
            height += (this.style.borders.top.width + this.style.borders.bottom.width) * 2;
        }
        else if (typeof this.objectValue === 'undefined') {
            if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
                width -= (this.gridRow.grid.style.cellPadding.right + this.gridRow.grid.style.cellPadding.left);
            }
            else {
                width -= (this.style.cellPadding.right + this.style.cellPadding.left);
                width -= (this.style.borders.left.width + this.style.borders.right.width);
            }
            height += (this.style.borders.top.width + this.style.borders.bottom.width) * 2;
        }
        //Add padding top and bottom value to height
        if (!(this.objectValue instanceof PdfGrid)) {
            if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
                height += (this.row.grid.style.cellPadding.top + this.row.grid.style.cellPadding.bottom);
            }
            else {
                height += (this.style.cellPadding.top + this.style.cellPadding.bottom);
            }
        }
        else {
            if (this.style.cellPadding == null || typeof this.style.cellPadding === 'undefined') {
                if (typeof this.row.grid.style.cellPadding.top !== 'undefined' && this.row.grid.style.cellPadding.hasTopPad) {
                    height += this.row.grid.style.cellPadding.top;
                }
                if (typeof this.row.grid.style.cellPadding.bottom !== 'undefined' && this.row.grid.style.cellPadding.hasBottomPad) {
                    height += this.row.grid.style.cellPadding.bottom;
                }
            }
            else {
                if (typeof this.style.cellPadding.top !== 'undefined' && this.style.cellPadding.hasTopPad) {
                    height += this.style.cellPadding.top;
                }
                if (typeof this.style.cellPadding.bottom !== 'undefined' && this.style.cellPadding.hasBottomPad) {
                    height += this.style.cellPadding.bottom;
                }
            }
        }
        height += this.row.grid.style.cellSpacing;
        return height;
    };
    /**
     * return the calculated `width` of the cell.
     * @private
     */
    PdfGridCell.prototype.calculateWidth = function () {
        var cellIndex = this.row.cells.indexOf(this);
        var rowindex = this.row.grid.rows.rowCollection.indexOf(this.row);
        var columnSpan = this.columnSpan;
        var width = 0;
        if (columnSpan === 1) {
            for (var i = 0; i < columnSpan; i++) {
                width += this.row.grid.columns.getColumn(cellIndex + i).width;
            }
        }
        else if (columnSpan > 1) {
            for (var i = 0; i < columnSpan; i++) {
                width += this.row.grid.columns.getColumn(cellIndex + i).width;
                if ((i + 1) < columnSpan) {
                    this.row.cells.getCell(cellIndex + i + 1).hasColSpan = true;
                }
            }
        }
        if (this.parent != null && this.parent.row.width > 0) {
            if ((this.row.grid.isChildGrid) && this.parent != null && (this.row.width > this.parent.row.width)) {
                width = 0;
                for (var j = 0; j < this.parent.columnSpan; j++) {
                    width += this.parent.row.grid.columns.getColumn(j).width;
                }
                width = width / this.row.cells.count;
            }
        }
        return width;
    };
    return PdfGridCell;
}());
export { PdfGridCell };
/**
 * `PdfGridCellCollection` class provides access to an ordered,
 * strongly typed collection of 'PdfGridCell' objects.
 * @private
 */
var PdfGridCellCollection = /** @class */ (function () {
    //Constructor
    /**
     * Initializes a new instance of the `PdfGridCellCollection` class with the row.
     * @private
     */
    function PdfGridCellCollection(row) {
        /**
         * @hidden
         * @private
         */
        this.cells = [];
        this.gridRow = row;
    }
    //Properties
    /**
     * Gets the current `cell`.
     * @private
     */
    PdfGridCellCollection.prototype.getCell = function (index) {
        if (index < 0 || index >= this.count) {
            throw new Error('IndexOutOfRangeException');
        }
        return this.cells[index];
    };
    Object.defineProperty(PdfGridCellCollection.prototype, "count", {
        /**
         * Gets the cells `count`.[Read-Only].
         * @private
         */
        get: function () {
            return this.cells.length;
        },
        enumerable: true,
        configurable: true
    });
    PdfGridCellCollection.prototype.add = function (cell) {
        if (typeof cell === 'undefined') {
            var tempcell = new PdfGridCell();
            this.add(tempcell);
            return cell;
        }
        else {
            cell.row = this.gridRow;
            this.cells.push(cell);
        }
    };
    /**
     * Returns the `index of` a particular cell in the collection.
     * @private
     */
    PdfGridCellCollection.prototype.indexOf = function (cell) {
        return this.cells.indexOf(cell);
    };
    return PdfGridCellCollection;
}());
export { PdfGridCellCollection };
