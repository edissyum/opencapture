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
import { PdfAutomaticField } from './automatic-field';
import { TemporaryDictionary } from './../../collections/object-object-pair/dictionary';
import { PdfTemplateValuePair } from './pdf-template-value-pair';
import { SizeF, PointF } from './../../drawing/pdf-drawing';
import { PdfTemplate } from './../../graphics/figures/pdf-template';
/**
 * Represents automatic field which has the same value within the `PdfGraphics`.
 */
var PdfMultipleValueField = /** @class */ (function (_super) {
    __extends(PdfMultipleValueField, _super);
    function PdfMultipleValueField() {
        var _this = _super.call(this) || this;
        //  Fields
        /**
         * Stores the instance of dictionary values of `graphics and template value pair`.
         * @private
         */
        _this.list = new TemporaryDictionary();
        return _this;
    }
    // Implementation
    /* tslint:disable */
    PdfMultipleValueField.prototype.performDraw = function (graphics, location, scalingX, scalingY) {
        _super.prototype.performDrawHelper.call(this, graphics, location, scalingX, scalingY);
        var value = this.getValue(graphics);
        var template = new PdfTemplate(this.getSize());
        this.list.setValue(graphics, new PdfTemplateValuePair(template, value));
        var g = template.graphics;
        var size = this.getSize();
        template.graphics.drawString(value, this.getFont(), this.pen, this.getBrush(), 0, 0, size.width, size.height, this.stringFormat);
        var drawLocation = new PointF(location.x + this.location.x, location.y + this.location.y);
        graphics.drawPdfTemplate(template, drawLocation, new SizeF(template.width * scalingX, template.height * scalingY));
    };
    return PdfMultipleValueField;
}(PdfAutomaticField));
export { PdfMultipleValueField };
