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
import { PdfLayoutElement } from './../layout-element';
import { ShapeLayouter } from './shape-layouter';
/**
 * Base class for the main shapes.
 * @private
 */
var PdfShapeElement = /** @class */ (function (_super) {
    __extends(PdfShapeElement, _super);
    function PdfShapeElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // methods
    /**
     * Gets the bounds.
     * @private
     */
    PdfShapeElement.prototype.getBounds = function () {
        var rect = this.getBoundsInternal();
        return rect;
    };
    /**
     * `drawGraphicsHelper` the graphics.
     * @public
     */
    PdfShapeElement.prototype.drawGraphicsHelper = function (graphics, location) {
        if ((graphics == null)) {
            throw new Error('ArgumentNullException :graphics');
        }
        this.drawShapeHelper(graphics, location.x, location.y);
    };
    /**
     * `drawShapeHelper` the graphics.
     * @private
     */
    PdfShapeElement.prototype.drawShapeHelper = function (graphics, x, y) {
        var bNeedSave = (x !== 0.5 || y !== 0.5);
        var gState = null;
        // Translate co-ordinates.
        if (bNeedSave) {
            // Save state.
            gState = graphics.save();
            graphics.translateTransform(x, y);
        }
        this.drawInternal(graphics);
        if (bNeedSave) {
            // Restore state.
            graphics.restore(gState);
        }
    };
    /**
     * Layouts the element.
     * @private
     */
    PdfShapeElement.prototype.layout = function (param) {
        var layouter = new ShapeLayouter(this);
        var result = layouter.layout(param);
        return result;
    };
    return PdfShapeElement;
}(PdfLayoutElement));
export { PdfShapeElement };
