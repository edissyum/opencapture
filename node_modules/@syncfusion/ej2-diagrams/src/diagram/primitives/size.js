/**
 * Size defines and processes the size(width/height) of the objects
 */
var Size = /** @class */ (function () {
    function Size(width, height) {
        this.width = width;
        this.height = height;
    }
    /**
     * isEmpty method \
     *
     * @returns { boolean } isEmpty method .\
     *
     * @private
     */
    Size.prototype.isEmpty = function () {
        return this.height === 0 && this.width === 0;
    };
    // public static get empty(): Size {
    //     return new Size();
    // }
    // public get isEmpty(): boolean {
    //     return this.equals(Size.empty);
    // }
    // public equals(size2: Size): boolean {
    //     return this.width === size2.width && this.height === size2.height;
    // }
    // public union(size: Size): void {
    //     size.width = Math.max(size.width, this.width);
    //     size.height = Math.max(size.height, this.height);
    // }
    /**
     * clone method \
     *
     * @returns { Size } clone method .\
     *
     * @private
     */
    Size.prototype.clone = function () {
        return new Size(this.width, this.height);
    };
    return Size;
}());
export { Size };
