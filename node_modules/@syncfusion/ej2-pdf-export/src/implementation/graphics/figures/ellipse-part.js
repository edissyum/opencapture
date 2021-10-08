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
import { PdfPen } from './../pdf-pen';
import { RectangleF } from './../../drawing/pdf-drawing';
import { PdfRectangleArea } from './rectangle-area';
/**
 * `PdfEllipsePart` class Implements graphics ellipse part, which is a sequence of primitive graphics elements.
 * @private
 */
var PdfEllipsePart = /** @class */ (function (_super) {
    __extends(PdfEllipsePart, _super);
    /* tslint:disable-next-line:max-line-length */
    function PdfEllipsePart(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        var _this = _super.call(this) || this;
        // Fields
        /**
         * public variable to store the start angle.
         * @public
         */
        _this.startAngle = 0;
        /**
         * public variable to store the sweep angle.
         * @public
         */
        _this.sweepAngle = 0;
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (arg1 instanceof RectangleF && typeof arg2 !== 'undefined' && typeof arg3 !== 'undefined') {
            _this = _super.call(this, arg1) || this;
            _this.startAngle = arg2;
            _this.sweepAngle = arg3;
        }
        else if (arg1 instanceof PdfPen) {
            if (arg3 instanceof RectangleF) {
                _this = _super.call(this, arg1, arg2, arg3) || this;
                _this.startAngle = arg4;
                _this.sweepAngle = arg5;
            }
            else {
                _this = _super.call(this, arg1, arg2, arg3, arg4, arg5, arg6) || this;
                _this.startAngle = arg7;
                _this.sweepAngle = arg8;
            }
        }
        else {
            _this = _super.call(this, arg1, arg2, arg3, arg4) || this;
            _this.startAngle = arg5;
            _this.sweepAngle = arg6;
        }
        return _this;
    }
    return PdfEllipsePart;
}(PdfRectangleArea));
export { PdfEllipsePart };
