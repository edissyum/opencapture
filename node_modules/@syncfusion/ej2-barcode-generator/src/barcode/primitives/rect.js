/**
 * Rect defines and processes rectangular regions
 */
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        /**
         * Sets the x-coordinate of the starting point of a rectangular region
         *
         * @default 0
         */
        this.x = Number.MAX_VALUE;
        /**
         * Sets the y-coordinate of the starting point of a rectangular region
         *
         * @default 0
         */
        this.y = Number.MAX_VALUE;
        /**
         * Sets the width of a rectangular region
         *
         * @default 0
         */
        this.width = 0;
        /**
         * Sets the height of a rectangular region
         *
         * @default 0
         */
        this.height = 0;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    return Rect;
}());
export { Rect };
