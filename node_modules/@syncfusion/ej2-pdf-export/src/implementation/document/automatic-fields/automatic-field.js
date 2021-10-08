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
 * PdfAutomaticField.ts class for EJ2-PDF
 */
import { RectangleF, SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfSolidBrush } from './../../graphics/brushes/pdf-solid-brush';
import { PdfColor } from './../../graphics/pdf-color';
import { PdfDocument } from './../pdf-document';
import { PdfGraphicsElement } from './../../graphics/figures/base/graphics-element';
import { PdfAutomaticFieldInfo } from './automatic-field-info';
/**
 * Represents a fields which is calculated before the document saves.
 */
var PdfAutomaticField = /** @class */ (function (_super) {
    __extends(PdfAutomaticField, _super);
    // Constructors
    function PdfAutomaticField() {
        var _this = _super.call(this) || this;
        // Fields
        _this.internalBounds = new RectangleF(0, 0, 0, 0);
        _this.internalTemplateSize = new SizeF(0, 0);
        return _this;
    }
    Object.defineProperty(PdfAutomaticField.prototype, "bounds", {
        // Properties
        get: function () {
            return this.internalBounds;
        },
        set: function (value) {
            this.internalBounds = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "size", {
        get: function () {
            return new SizeF(this.bounds.width, this.bounds.height);
        },
        set: function (value) {
            this.bounds.width = value.width;
            this.bounds.height = value.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "location", {
        get: function () {
            return new PointF(this.bounds.x, this.bounds.y);
        },
        set: function (value) {
            this.bounds.x = value.x;
            this.bounds.y = value.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "font", {
        get: function () {
            return this.internalFont;
        },
        set: function (value) {
            this.internalFont = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "brush", {
        get: function () {
            return this.internalBrush;
        },
        set: function (value) {
            this.internalBrush = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "pen", {
        get: function () {
            return this.internalPen;
        },
        set: function (value) {
            this.internalPen = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PdfAutomaticField.prototype, "stringFormat", {
        get: function () {
            return this.internalStringFormat;
        },
        set: function (value) {
            this.internalStringFormat = value;
        },
        enumerable: true,
        configurable: true
    });
    PdfAutomaticField.prototype.performDrawHelper = function (graphics, location, scalingX, scalingY) {
        if (this.bounds.height === 0 || this.bounds.width === 0) {
            var text = this.getValue(graphics);
            this.internalTemplateSize = this.getFont().measureString(text, this.size, this.stringFormat);
        }
    };
    PdfAutomaticField.prototype.draw = function (arg1, arg2, arg3) {
        if (typeof arg2 === 'undefined') {
            var location_1 = new PointF(0, 0);
            this.draw(arg1, location_1);
        }
        else if (arg2 instanceof PointF) {
            this.draw(arg1, arg2.x, arg2.y);
        }
        else {
            this.drawHelper(arg1, arg2, arg3);
            var info = new PdfAutomaticFieldInfo(this, new PointF(arg2, arg3));
            arg1.automaticFields.add(info);
        }
    };
    PdfAutomaticField.prototype.getSize = function () {
        if (this.bounds.height === 0 || this.bounds.width === 0) {
            return this.internalTemplateSize;
        }
        else {
            return this.size;
        }
    };
    PdfAutomaticField.prototype.drawInternal = function (graphics) {
        //
    };
    /* tslint:disable */
    PdfAutomaticField.prototype.getBrush = function () {
        return (typeof this.internalBrush === 'undefined' || this.internalBrush == null) ? new PdfSolidBrush(new PdfColor(0, 0, 0)) : this.internalBrush;
    };
    PdfAutomaticField.prototype.getFont = function () {
        return (typeof this.internalFont === 'undefined' || this.internalFont == null) ? PdfDocument.defaultFont : this.internalFont;
    };
    /* tslint:enable */
    PdfAutomaticField.prototype.getPageFromGraphics = function (graphics) {
        if (typeof graphics.page !== 'undefined' && graphics.page !== null) {
            var page = graphics.page;
            return page;
        }
        else {
            var page = graphics.currentPage;
            return page;
        }
    };
    return PdfAutomaticField;
}(PdfGraphicsElement));
export { PdfAutomaticField };
