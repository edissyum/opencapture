/**
 * Size defines and processes the size(width/height) of the objects
 */
var Size = /** @class */ (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    // /**   @private  */
    // public isEmpty(): boolean {
    //     return this.height === 0 && this.width === 0;
    // }
    /**   @private  */
    Size.prototype.clone = function () {
        return new Size(this.width, this.height);
    };
    return Size;
}());
export { Size };
