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
 * arc.ts class for EJ2-PDF
 */
import { PdfPen } from './../pdf-pen';
import { PdfLayoutFormat } from './../figures/base/element-layouter';
import { RectangleF, PointF } from './../../drawing/pdf-drawing';
import { PdfEllipsePart } from './../figures/ellipse-part';
/**
 * `PdfArc` class Implements graphics arc, which is a sequence of primitive graphics elements.
 * @private
 */
var PdfArc = /** @class */ (function (_super) {
    __extends(PdfArc, _super);
    /* tslint:disable-next-line:max-line-length */
    function PdfArc(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        var _this = this;
        if (typeof arg1 === 'undefined') {
            _this = _super.call(this) || this;
        }
        else if (arg1 instanceof RectangleF) {
            _this = _super.call(this, arg1, arg2, arg3) || this;
        }
        else if (arg1 instanceof PdfPen) {
            if (arg2 instanceof RectangleF) {
                _this = _super.call(this, arg1, null, arg2, arg3, arg4) || this;
            }
            else if (typeof arg6 === 'undefined' && typeof arg7 === 'undefined') {
                _this = _super.call(this, arg1, null, 0, 0, arg2, arg3, arg4, arg5) || this;
            }
            else if (typeof arg6 !== 'undefined' && typeof arg7 !== 'undefined') {
                _this = _super.call(this, arg1, null, arg2, arg3, arg4, arg5, arg6, arg7) || this;
            }
        }
        else if (typeof arg1 !== 'undefined' && typeof arg5 === 'undefined' && typeof arg6 === 'undefined') {
            _this = _super.call(this, 0, 0, arg1, arg2, arg3, arg4) || this;
        }
        else if (typeof arg1 !== 'undefined' && typeof arg5 !== 'undefined' && typeof arg6 !== 'undefined') {
            _this = _super.call(this, arg1, arg2, arg3, arg4, arg5, arg6) || this;
        }
        return _this;
    }
    PdfArc.prototype.draw = function (argu1, arg2, arg3, arg4) {
        if (arg2 instanceof PointF && typeof arg2.width === 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(argu1, arg2.x, arg2.y);
        }
        else if (arg2 instanceof RectangleF && typeof arg2.width !== 'undefined' && typeof arg3 === 'undefined') {
            return this.drawHelper(argu1, arg2, null);
        }
        else if (typeof arg2 === 'number' && typeof arg3 === 'number' && typeof arg4 === 'undefined') {
            return this.drawHelper(argu1, arg2, arg3, null);
        }
        else if (arg2 instanceof PointF && arg3 instanceof PdfLayoutFormat) {
            return this.drawHelper(argu1, arg2.x, arg2.y, arg3);
        }
        else if (typeof arg2 === 'number' && (arg4 instanceof PdfLayoutFormat || arg4 == null) && typeof arg3 === 'number') {
            var widthValue = (argu1.graphics.clientSize.width - arg2);
            var layoutRect = new RectangleF(arg2, arg3, widthValue, 0);
            return this.drawHelper(argu1, layoutRect, arg4);
        }
        else {
            return this.drawHelper(argu1, arg2, arg3);
        }
    };
    // Implementation
    /**
     * `drawInternal` Draws an element on the Graphics.
     * @param graphics Graphics context where the element should be printed.
     *
     */
    PdfArc.prototype.drawInternal = function (graphics) {
        if ((graphics == null)) {
            throw new Error('ArgumentNullException : graphics');
        }
        graphics.drawArc(this.obtainPen(), this.bounds, this.startAngle, this.sweepAngle);
    };
    return PdfArc;
}(PdfEllipsePart));
export { PdfArc };
