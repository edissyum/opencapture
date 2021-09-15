/**
 * Represents a base class for all page graphics elements.
 */
var PdfGraphicsElement = /** @class */ (function () {
    // Constructors
    function PdfGraphicsElement() {
        //
    }
    /**
     * `Draws` the page number field.
     * @public
     */
    PdfGraphicsElement.prototype.drawHelper = function (graphics, x, y) {
        var bNeedSave = (x !== 0 || y !== 0);
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
    return PdfGraphicsElement;
}());
export { PdfGraphicsElement };
