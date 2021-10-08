/**
 * Coordinates of Position for `PointF`.
 * @private
 */
var PointF = /** @class */ (function () {
    function PointF(x, y) {
        if (typeof x === 'undefined') {
            this.x = 0;
            this.y = 0;
        }
        else {
            if (x !== null) {
                this.x = x;
            }
            else {
                this.x = 0;
            }
            if (y !== null) {
                this.y = y;
            }
            else {
                this.y = 0;
            }
        }
    }
    return PointF;
}());
export { PointF };
/**
 * Width and Height as `Size`.
 * @private
 */
var SizeF = /** @class */ (function () {
    function SizeF(width, height) {
        if (typeof height === 'undefined') {
            this.height = 0;
            this.width = 0;
        }
        else {
            if (height !== null) {
                this.height = height;
            }
            else {
                this.height = 0;
            }
            if (width !== null) {
                this.width = width;
            }
            else {
                this.width = 0;
            }
        }
    }
    return SizeF;
}());
export { SizeF };
/**
 * `RectangleF` with Position and size.
 * @private
 */
var RectangleF = /** @class */ (function () {
    function RectangleF(arg1, arg2, arg3, arg4) {
        if (typeof arg1 === typeof arg1 && typeof arg1 === 'undefined') {
            this.x = 0;
            this.y = 0;
            this.height = 0;
            this.width = 0;
        }
        else {
            if (arg1 instanceof PointF && arg2 instanceof SizeF && typeof arg3 === 'undefined') {
                var pointf = arg1;
                this.x = pointf.x;
                this.y = pointf.y;
                var sizef = arg2;
                this.height = sizef.height;
                this.width = sizef.width;
            }
            else {
                var x = arg1;
                var y = arg2;
                var width = arg3;
                var height = arg4;
                this.x = x;
                this.y = y;
                this.height = height;
                this.width = width;
            }
        }
    }
    return RectangleF;
}());
export { RectangleF };
/**
 * `Rectangle` with left, right, top and bottom.
 * @private
 */
var Rectangle = /** @class */ (function () {
    /**
     * Instance of `RectangleF` class with X, Y, Width and Height.
     * @private
     */
    function Rectangle(left, top, right, bottom) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }
    Object.defineProperty(Rectangle.prototype, "width", {
        /**
         * Gets a value of width
         */
        get: function () {
            return this.right - this.left;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "height", {
        /**
         * Gets a value of height
         */
        get: function () {
            return this.bottom - this.top;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "topLeft", {
        /**
         * Gets a value of Top and Left
         */
        get: function () {
            return new PointF(this.left, this.top);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "size", {
        /**
         * Gets a value of size
         */
        get: function () {
            return new SizeF(this.width, this.height);
        },
        enumerable: true,
        configurable: true
    });
    Rectangle.prototype.toString = function () {
        return this.topLeft + 'x' + this.size;
    };
    return Rectangle;
}());
export { Rectangle };
