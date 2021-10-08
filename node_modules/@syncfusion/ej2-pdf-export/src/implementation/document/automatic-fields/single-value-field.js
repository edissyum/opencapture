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
 * PdfSingleValueField.ts class for EJ2-PDF
 */
import { PdfAutomaticField } from './automatic-field';
import { TemporaryDictionary } from './../../collections/object-object-pair/dictionary';
import { PdfTemplateValuePair } from './pdf-template-value-pair';
import { PointF, SizeF } from './../../drawing/pdf-drawing';
import { PdfTemplate } from './../../graphics/figures/pdf-template';
/**
 * Represents automatic field which has the same value in the whole document.
 */
var PdfSingleValueField = /** @class */ (function (_super) {
    __extends(PdfSingleValueField, _super);
    // Constructors
    function PdfSingleValueField() {
        var _this = _super.call(this) || this;
        // Fields
        /* tslint:disable */
        _this.list = new TemporaryDictionary();
        /* tslint:enable */
        _this.painterGraphics = [];
        return _this;
    }
    PdfSingleValueField.prototype.performDraw = function (graphics, location, scalingX, scalingY) {
        _super.prototype.performDrawHelper.call(this, graphics, location, scalingX, scalingY);
        var page = this.getPageFromGraphics(graphics);
        var document = page.document;
        var textValue = this.getValue(graphics);
        /* tslint:disable */
        if (this.list.containsKey(document)) {
            var pair = this.list.getValue(document);
            var drawLocation = new PointF(location.x + this.location.x, location.y + this.location.y);
            graphics.drawPdfTemplate(pair.template, drawLocation, new SizeF(pair.template.width * scalingX, pair.template.height * scalingY));
            this.painterGraphics.push(graphics);
        }
        else {
            var size = this.getSize();
            var template = new PdfTemplate(size);
            this.list.setValue(document, new PdfTemplateValuePair(template, textValue));
            template.graphics.drawString(textValue, this.getFont(), this.pen, this.getBrush(), 0, 0, size.width, size.height, this.stringFormat);
            var drawLocation = new PointF(location.x + this.location.x, location.y + this.location.y);
            graphics.drawPdfTemplate(template, drawLocation, new SizeF(template.width * scalingX, template.height * scalingY));
            this.painterGraphics.push(graphics);
        }
        /* tslint:enable */
    };
    return PdfSingleValueField;
}(PdfAutomaticField));
export { PdfSingleValueField };
