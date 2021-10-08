/**
 * `PdfBrush` class provides objects used to fill the interiors of graphical shapes such as rectangles,
 * ellipses, pies, polygons, and paths.
 * @private
 */
var PdfBrush = /** @class */ (function () {
    /**
     * Creates instanceof `PdfBrush` class.
     * @hidden
     * @private
     */
    function PdfBrush() {
        //
    }
    //IClonable implementation
    PdfBrush.prototype.clone = function () {
        return this;
    };
    return PdfBrush;
}());
export { PdfBrush };
