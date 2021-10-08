/**
 * ElementLayouter.ts class for EJ2-PDF
 */
import { RectangleF } from './../../../drawing/pdf-drawing';
/**
 * Base class for `elements lay outing`.
 * @private
 */
var ElementLayouter = /** @class */ (function () {
    // Constructor
    /**
     * Initializes a new instance of the `ElementLayouter` class.
     * @private
     */
    function ElementLayouter(element) {
        this.layoutElement = element;
    }
    Object.defineProperty(ElementLayouter.prototype, "elements", {
        // Properties
        /**
         * Gets the `element`.
         * @private
         */
        get: function () {
            return this.layoutElement;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the `element`.
     * @private
     */
    ElementLayouter.prototype.getElement = function () {
        return this.layoutElement;
    };
    // Implementation
    /**
     * `Layouts` the element.
     * @private
     */
    ElementLayouter.prototype.layout = function (param) {
        return this.layoutInternal(param);
    };
    ElementLayouter.prototype.Layouter = function (param) {
        return this.layoutInternal(param);
    };
    /**
     * Returns the `next page`.
     * @private
     */
    ElementLayouter.prototype.getNextPage = function (currentPage) {
        var section = currentPage.section;
        var nextPage = section.add();
        return nextPage;
    };
    ElementLayouter.prototype.getPaginateBounds = function (param) {
        if ((param == null)) {
            throw new Error('ArgumentNullException : param');
        }
        var result = param.format.usePaginateBounds ? param.format.paginateBounds
            : new RectangleF(param.bounds.x, 0, param.bounds.width, param.bounds.height);
        return result;
    };
    return ElementLayouter;
}());
export { ElementLayouter };
var PdfLayoutFormat = /** @class */ (function () {
    function PdfLayoutFormat(baseFormat) {
        if (typeof baseFormat === 'undefined') {
            //
        }
        else {
            this.break = baseFormat.break;
            this.layout = baseFormat.layout;
            this.paginateBounds = baseFormat.paginateBounds;
            this.boundsSet = baseFormat.usePaginateBounds;
        }
    }
    Object.defineProperty(PdfLayoutFormat.prototype, "layout", {
        // Properties
        /**
         * Gets or sets `layout` type of the element.
         * @private
         */
        get: function () {
            // if (typeof this.layoutType === 'undefined' || this.layoutType == null) {
            //      this.layoutType = PdfLayoutType.Paginate;
            // }
            return this.layoutType;
        },
        set: function (value) {
            this.layoutType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutFormat.prototype, "break", {
        /**
         * Gets or sets `break` type of the element.
         * @private
         */
        get: function () {
            // if (typeof this.breakType === 'undefined' || this.boundsSet == null) {
            //      this.breakType = PdfLayoutBreakType.FitPage;
            // }
            return this.breakType;
        },
        set: function (value) {
            this.breakType = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutFormat.prototype, "paginateBounds", {
        /**
         * Gets or sets the `bounds` on the next page.
         * @private
         */
        get: function () {
            if (typeof this.layoutPaginateBounds === 'undefined' && this.layoutPaginateBounds == null) {
                this.layoutPaginateBounds = new RectangleF(0, 0, 0, 0);
            }
            return this.layoutPaginateBounds;
        },
        set: function (value) {
            this.layoutPaginateBounds = value;
            this.boundsSet = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutFormat.prototype, "usePaginateBounds", {
        /**
         * Gets a value indicating whether [`use paginate bounds`].
         * @private
         */
        get: function () {
            // if (typeof this.boundsSet === 'undefined' || this.boundsSet == null) {
            //      this.boundsSet = false;
            // }
            return this.boundsSet;
        },
        enumerable: true,
        configurable: true
    });
    return PdfLayoutFormat;
}());
export { PdfLayoutFormat };
var PdfLayoutParams = /** @class */ (function () {
    function PdfLayoutParams() {
    }
    Object.defineProperty(PdfLayoutParams.prototype, "page", {
        // Properties
        /**
         * Gets or sets the layout `page` for the element.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        set: function (value) {
            this.pdfPage = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutParams.prototype, "bounds", {
        /**
         * Gets or sets layout `bounds` for the element.
         * @private
         */
        get: function () {
            return new RectangleF(this.layoutBounds.x, this.layoutBounds.y, this.layoutBounds.width, this.layoutBounds.height);
        },
        set: function (value) {
            this.layoutBounds = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutParams.prototype, "format", {
        /**
         * Gets or sets `layout settings` for the element.
         * @private
         */
        get: function () {
            return this.layoutFormat;
        },
        set: function (value) {
            this.layoutFormat = value;
        },
        enumerable: true,
        configurable: true
    });
    return PdfLayoutParams;
}());
export { PdfLayoutParams };
var PdfLayoutResult = /** @class */ (function () {
    // Constructors
    /**
     * Initializes the new instance of `PdfLayoutResult` class.
     * @private
     */
    function PdfLayoutResult(page, bounds) {
        this.pdfPage = page;
        this.layoutBounds = bounds;
    }
    Object.defineProperty(PdfLayoutResult.prototype, "page", {
        // Properties
        /**
         * Gets the last `page` where the element was drawn.
         * @private
         */
        get: function () {
            return this.pdfPage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutResult.prototype, "bounds", {
        /**
         * Gets the `bounds` of the element on the last page where it was drawn.
         * @private
         */
        get: function () {
            return this.layoutBounds;
        },
        enumerable: true,
        configurable: true
    });
    return PdfLayoutResult;
}());
export { PdfLayoutResult };
