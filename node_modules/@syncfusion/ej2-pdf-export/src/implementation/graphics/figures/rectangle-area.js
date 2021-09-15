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
import { PdfFillElement } from './../figures/base/fill-element';
/**
 * `PdfRectangleArea` class Implements graphics rectangle area, which is a sequence of primitive graphics elements.
 * @private
 */
var PdfRectangleArea = /** @class */ (function (_super) {
    __extends(PdfRectangleArea, _super);
    /* tslint:disable-next-line:max-line-length */
    function PdfRectangleArea(arg1, arg2, arg3, arg4, arg5, arg6) {
        var _this = _super.call(this) || this;
        //Fields
        /**
         * public variable to store the rectangle.
         * @public
         */
        _this.bounds = new RectangleF(0, 0, 0, 0);
        if (typeof arg1 === 'undefined') {
            //
        }
        else if (arg1 instanceof PdfPen) {
            _this = _super.call(this, arg1, arg2) || this;
            if (arg3 instanceof RectangleF) {
                _this.bounds = arg3;
            }
            else {
                _this.bounds = new RectangleF(arg3, arg4, arg5, arg6);
            }
        }
        else if (arg1 instanceof RectangleF) {
            _this.bounds = arg1;
        }
        else {
            _this.bounds = new RectangleF(arg1, arg2, arg3, arg4);
        }
        return _this;
    }
    Object.defineProperty(PdfRectangleArea.prototype, "x", {
        //Properties
        /**
         * Gets or sets the X co-ordinate of the upper-left corner of this the element.
         * @public
         */
        get: function () {
            return this.bounds.x;
        },
        set: function (value) {
            this.bounds.x = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRectangleArea.prototype, "y", {
        /**
         * Gets or sets the Y co-ordinate of the upper-left corner of this the element.
         * @public
         */
        get: function () {
            return this.bounds.y;
        },
        set: function (value) {
            this.bounds.y = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRectangleArea.prototype, "width", {
        /**
         * Gets or sets the width of this element.
         * @public
         */
        get: function () {
            return this.bounds.width;
        },
        set: function (value) {
            this.bounds.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfRectangleArea.prototype, "height", {
        /**
         * Gets or sets the height of this element.
         * @public
         */
        get: function () {
            return this.bounds.height;
        },
        set: function (value) {
            this.bounds.height = value;
        },
        enumerable: true,
        configurable: true
    });
    //Implementation
    PdfRectangleArea.prototype.getBoundsInternal = function () {
        return this.bounds;
    };
    return PdfRectangleArea;
}(PdfFillElement));
export { PdfRectangleArea };
