import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfLayoutParams, PdfLayoutFormat } from './base/element-layouter';
import { PdfBorders } from './../../structured-elements/grid/styles/pdf-borders';
/**
 * `PdfLayoutElement` class represents the base class for all elements that can be layout on the pages.
 * @private
 */
var PdfLayoutElement = /** @class */ (function () {
    function PdfLayoutElement() {
    }
    Object.defineProperty(PdfLayoutElement.prototype, "raiseBeginPageLayout", {
        // Property
        /**
         * Gets a value indicating whether the `start page layout event` should be raised.
         * @private
         */
        get: function () {
            return (typeof this.beginPageLayout !== 'undefined');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfLayoutElement.prototype, "raiseEndPageLayout", {
        /**
         * Gets a value indicating whether the `ending page layout event` should be raised.
         * @private
         */
        get: function () {
            return (typeof this.endPageLayout !== 'undefined');
        },
        enumerable: true,
        configurable: true
    });
    //Event Handlers
    PdfLayoutElement.prototype.onBeginPageLayout = function (args) {
        if (this.beginPageLayout) {
            this.beginPageLayout(this, args);
        }
    };
    PdfLayoutElement.prototype.onEndPageLayout = function (args) {
        if (this.endPageLayout) {
            this.endPageLayout(this, args);
        }
    };
    PdfLayoutElement.prototype.drawHelper = function (arg2, arg3, arg4, arg5) {
        if (arg3 instanceof PointF && typeof arg3.width === 'undefined' && typeof arg4 === 'undefined') {
            return this.drawHelper(arg2, arg3.x, arg3.y);
        }
        else if (typeof arg3 === 'number' && typeof arg4 === 'number' && typeof arg5 === 'undefined') {
            return this.drawHelper(arg2, arg3, arg4, null);
        }
        else if (arg3 instanceof RectangleF && typeof arg3.width !== 'undefined' && typeof arg4 === 'undefined') {
            return this.drawHelper(arg2, arg3, null);
        }
        else if (arg3 instanceof PointF && typeof arg3.width === 'undefined' && arg4 instanceof PdfLayoutFormat) {
            return this.drawHelper(arg2, arg3.x, arg3.y, arg4);
        }
        else if (typeof arg3 === 'number' && typeof arg4 === 'number' && (arg5 instanceof PdfLayoutFormat || arg5 == null)) {
            var width = (arg2.graphics.clientSize.width - arg3);
            var layoutRectangle = new RectangleF(arg3, arg4, width, 0);
            return this.drawHelper(arg2, layoutRectangle, arg5);
        }
        else if (arg3 instanceof RectangleF && typeof arg3.width !== 'undefined' && typeof arg4 === 'boolean') {
            this.bEmbedFonts = arg4;
            return this.drawHelper(arg2, arg3, null);
        }
        else {
            var param = new PdfLayoutParams();
            var temparg3 = arg3;
            var temparg4 = arg4;
            param.page = arg2;
            param.bounds = temparg3;
            if (param != null) {
                var x = param.bounds.x;
                var y = param.bounds.y;
                if (param.bounds.x === 0) {
                    x = PdfBorders.default.right.width / 2;
                }
                if (param.bounds.y === 0) {
                    y = PdfBorders.default.top.width / 2;
                }
                var newBound = new RectangleF(x, y, param.bounds.width, param.bounds.height);
                param.bounds = newBound;
            }
            param.format = (temparg4 != null) ? temparg4 : new PdfLayoutFormat();
            var result = this.layout(param);
            return result;
        }
    };
    return PdfLayoutElement;
}());
export { PdfLayoutElement };
