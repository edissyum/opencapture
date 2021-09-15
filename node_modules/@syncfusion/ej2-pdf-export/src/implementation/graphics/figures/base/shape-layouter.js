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
 * ShapeLayouter.ts class for EJ2-PDF
 * @private
 */
import { ElementLayouter, PdfLayoutResult } from './element-layouter';
import { RectangleF, PointF } from './../../../drawing/pdf-drawing';
import { PdfLayoutBreakType, PdfLayoutType } from './../../figures/enum';
import { BeginPageLayoutEventArgs, EndPageLayoutEventArgs } from './../../../structured-elements/grid/layout/grid-layouter';
/**
 * ShapeLayouter class.
 * @private
 */
var ShapeLayouter = /** @class */ (function (_super) {
    __extends(ShapeLayouter, _super);
    // Constructors
    /**
     * Initializes a new instance of the `ShapeLayouter` class.
     * @private
     */
    function ShapeLayouter(element) {
        var _this = _super.call(this, element) || this;
        // Fields
        /**
         * Initializes the object to store `older form elements` of previous page.
         * @default 0
         * @private
         */
        _this.olderPdfForm = 0;
        /**
         * The `bounds` of the shape element.
         * * @default new RectangleF()
         * @private
         */
        _this.shapeBounds = new RectangleF();
        /**
         * Total Page size of the web page.
         * * @default 0
         * @private
         */
        _this.totalPageSize = 0;
        return _this;
    }
    Object.defineProperty(ShapeLayouter.prototype, "element", {
        // Properties
        /**
         * Gets shape element.
         * @private
         */
        get: function () {
            return this.elements;
        },
        enumerable: true,
        configurable: true
    });
    // Implementation
    /**
     * Layouts the element.
     * @private
     */
    ShapeLayouter.prototype.layoutInternal = function (param) {
        var currentPage = param.page;
        var currentBounds = param.bounds;
        var shapeLayoutBounds = this.element.getBounds();
        shapeLayoutBounds.x = 0;
        shapeLayoutBounds.y = 0;
        /* tslint:disable */
        var isEmpty = (this.shapeBounds.x === this.shapeBounds.y && this.shapeBounds.y === this.shapeBounds.width && this.shapeBounds.width === this.shapeBounds.height && this.shapeBounds.height === 0) ? true : false;
        /* tslint:enable */
        if ((this.isPdfGrid) && (!(isEmpty))) {
            shapeLayoutBounds = this.shapeBounds;
        }
        var result = null;
        var pageResult = new ShapeLayoutResult();
        pageResult.page = currentPage;
        /*tslint:disable:no-constant-condition */
        while (true) {
            // Raise event.
            var result1 = this.raiseBeforePageLayout(currentPage, currentBounds);
            currentBounds = result1.currentBounds;
            var endArgs = null;
            if (!result1.cancel) {
                pageResult = this.layoutOnPage(currentPage, currentBounds, shapeLayoutBounds, param);
                // Raise event.
                endArgs = this.raiseEndPageLayout(pageResult);
                result1.cancel = (endArgs === null) ? false : endArgs.cancel;
            }
            if (!pageResult.end && !result1.cancel) {
                currentBounds = this.getPaginateBounds(param);
                shapeLayoutBounds = this.getNextShapeBounds(shapeLayoutBounds, pageResult);
                currentPage = (endArgs === null || endArgs.nextPage === null) ?
                    this.getNextPage(currentPage) : endArgs.nextPage;
                if (this.isPdfGrid) {
                    result = this.getLayoutResult(pageResult);
                    break;
                }
            }
            else {
                result = this.getLayoutResult(pageResult);
                break;
            }
        }
        return result;
    };
    /**
     * Raises BeforePageLayout event.
     * @private
     */
    ShapeLayouter.prototype.raiseBeforePageLayout = function (currentPage, currentBounds) {
        var cancel = false;
        if (this.element.raiseBeginPageLayout) {
            var args = new BeginPageLayoutEventArgs(currentBounds, currentPage);
            this.element.onBeginPageLayout(args);
            cancel = args.cancel;
            currentBounds = args.bounds;
        }
        return { currentBounds: currentBounds, cancel: cancel };
    };
    /**
     * Raises PageLayout event if needed.
     * @private
     */
    ShapeLayouter.prototype.raiseEndPageLayout = function (pageResult) {
        var args = null;
        if (this.element.raiseEndPageLayout) {
            var res = this.getLayoutResult(pageResult);
            args = new EndPageLayoutEventArgs(res);
            this.element.onEndPageLayout(args);
        }
        return args;
    };
    /**
     * Creates layout result.
     * @private
     */
    ShapeLayouter.prototype.getLayoutResult = function (pageResult) {
        var result = new PdfLayoutResult(pageResult.page, pageResult.bounds);
        return result;
    };
    /**
     * Calculates the next active shape bounds.
     * @private
     */
    ShapeLayouter.prototype.getNextShapeBounds = function (shapeLayoutBounds, pageResult) {
        var layoutedBounds = pageResult.bounds;
        shapeLayoutBounds.y = (shapeLayoutBounds.y + layoutedBounds.height);
        shapeLayoutBounds.height = (shapeLayoutBounds.height - layoutedBounds.height);
        return shapeLayoutBounds;
    };
    /**
     * Layouts the element on the current page.
     * @private
     */
    ShapeLayouter.prototype.layoutOnPage = function (currentPage, curBounds, sBounds, param) {
        var result = new ShapeLayoutResult();
        curBounds = this.checkCorrectCurrentBounds(currentPage, curBounds, param);
        var fitToPage = this.fitsToBounds(curBounds, sBounds);
        var canDraw = !((param.format.break === PdfLayoutBreakType.FitElement)
            && (!fitToPage && (currentPage === param.page)));
        var shapeFinished = false;
        if (canDraw) {
            var drawRectangle = this.getDrawBounds(curBounds, sBounds);
            this.drawShape(currentPage.graphics, curBounds, drawRectangle);
            result.bounds = this.getPageResultBounds(curBounds, sBounds);
            shapeFinished = ((curBounds.height) >= (sBounds.height));
        }
        result.end = (shapeFinished || (param.format.layout === PdfLayoutType.OnePage));
        result.page = currentPage;
        return result;
    };
    /**
     * Returns Rectangle for element drawing on the page.
     * @private
     */
    ShapeLayouter.prototype.getDrawBounds = function (currentBounds, shapeLayoutBounds) {
        var result = currentBounds;
        result.y = (result.y - shapeLayoutBounds.y);
        result.height = (result.height + shapeLayoutBounds.y);
        return result;
    };
    /**
     * Draws the shape.
     * @private
     */
    ShapeLayouter.prototype.drawShape = function (g, currentBounds, drawRectangle) {
        var gState = g.save();
        try {
            g.setClip(currentBounds);
            this.element.drawGraphicsHelper(g, new PointF(drawRectangle.x, drawRectangle.y));
        }
        finally {
            g.restore(gState);
        }
    };
    /**
     * Corrects current bounds on the page.
     * @protected
     */
    ShapeLayouter.prototype.checkCorrectCurrentBounds = function (currentPage, curBounds, param) {
        var pageSize = currentPage.graphics.clientSize;
        curBounds.width = (curBounds.width > 0) ? curBounds.width : (pageSize.width - curBounds.x);
        curBounds.height = (curBounds.height > 0) ? curBounds.height : (pageSize.height - curBounds.y);
        if (this.isPdfGrid) {
            curBounds.height = (curBounds.height - this.bottomCellPadding);
        }
        return curBounds;
    };
    /**
     * Calculates bounds where the shape was layout on the page.
     * @private
     */
    ShapeLayouter.prototype.getPageResultBounds = function (currentBounds, shapeLayoutBounds) {
        var result = currentBounds;
        result.height = Math.min(result.height, shapeLayoutBounds.height);
        return result;
    };
    /**
     * Checks whether shape rectangle fits to the lay outing bounds.
     * @private
     */
    ShapeLayouter.prototype.fitsToBounds = function (currentBounds, shapeLayoutBounds) {
        var fits = (shapeLayoutBounds.height <= currentBounds.height);
        return fits;
    };
    /**
     * Initializes the offset `index`.
     * * @default 0
     * @private
     */
    ShapeLayouter.index = 0;
    /**
     * Initializes the `difference in page height`.
     * * @default 0
     * @private
     */
    ShapeLayouter.splitDiff = 0;
    /**
     * Determines the `end of Vertical offset` values.
     * * @default false
     * @private
     */
    ShapeLayouter.last = false;
    /**
     * Determines the document link annotation `border width`.
     * * @default 0
     * @private
     */
    ShapeLayouter.borderWidth = 0;
    return ShapeLayouter;
}(ElementLayouter));
export { ShapeLayouter };
/**
 * Contains lay outing result settings.
 * @private
 */
var ShapeLayoutResult = /** @class */ (function () {
    function ShapeLayoutResult() {
    }
    return ShapeLayoutResult;
}());
