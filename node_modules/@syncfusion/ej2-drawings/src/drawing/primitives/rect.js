/**
 * Rect defines and processes rectangular regions
 */
var Rect = /** @class */ (function () {
    function Rect(x, y, width, height) {
        /**
         * Sets the x-coordinate of the starting point of a rectangular region
         * @default 0
         */
        this.x = Number.MAX_VALUE;
        /**
         * Sets the y-coordinate of the starting point of a rectangular region
         * @default 0
         */
        this.y = Number.MAX_VALUE;
        /**
         * Sets the width of a rectangular region
         * @default 0
         */
        this.width = 0;
        /**
         * Sets the height of a rectangular region
         * @default 0
         */
        this.height = 0;
        if (x === undefined || y === undefined) {
            x = y = Number.MAX_VALUE;
            width = height = 0;
        }
        else {
            if (width === undefined) {
                width = 0;
            }
            if (height === undefined) {
                height = 0;
            }
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Object.defineProperty(Rect.prototype, "left", {
        /**   @private  */
        get: function () {
            return this.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "right", {
        /**   @private  */
        get: function () {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "top", {
        /**   @private  */
        get: function () {
            return this.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottom", {
        /**   @private  */
        get: function () {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topLeft", {
        /**   @private  */
        get: function () {
            return { x: this.left, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topRight", {
        /**   @private  */
        get: function () {
            return { x: this.right, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomLeft", {
        /**   @private  */
        get: function () {
            return { x: this.left, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomRight", {
        /**   @private  */
        get: function () {
            return { x: this.right, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "middleLeft", {
        /**   @private  */
        get: function () {
            return { x: this.left, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "middleRight", {
        /**   @private  */
        get: function () {
            return { x: this.right, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topCenter", {
        /**   @private  */
        get: function () {
            return { x: this.x + this.width / 2, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomCenter", {
        /**   @private  */
        get: function () {
            return { x: this.x + this.width / 2, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "center", {
        /**   @private  */
        get: function () {
            return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    /**   @private  */
    Rect.prototype.equals = function (rect1, rect2) {
        return rect1.x === rect2.x && rect1.y === rect2.y && rect1.width === rect2.width && rect1.height === rect2.height;
    };
    /**   @private  */
    Rect.prototype.uniteRect = function (rect) {
        var right = Math.max(Number.NaN === this.right || this.x === Number.MAX_VALUE ? rect.right : this.right, rect.right);
        var bottom = Math.max(Number.NaN === this.bottom || this.y === Number.MAX_VALUE ? rect.bottom : this.bottom, rect.bottom);
        this.x = Math.min(this.left, rect.left);
        this.y = Math.min(this.top, rect.top);
        this.width = right - this.x;
        this.height = bottom - this.y;
        return this;
    };
    /**   @private  */
    Rect.prototype.unitePoint = function (point) {
        if (this.x === Number.MAX_VALUE) {
            this.x = point.x;
            this.y = point.y;
            return;
        }
        var x = Math.min(this.left, point.x);
        var y = Math.min(this.top, point.y);
        var right = Math.max(this.right, point.x);
        var bottom = Math.max(this.bottom, point.y);
        this.x = x;
        this.y = y;
        this.width = right - this.x;
        this.height = bottom - this.y;
    };
    Rect.prototype.intersection = function (rect) {
        if (this.intersects(rect)) {
            var left = Math.max(this.left, rect.left);
            var top_1 = Math.max(this.top, rect.top);
            var right = Math.min(this.right, rect.right);
            var bottom = Math.min(this.bottom, rect.bottom);
            return new Rect(left, top_1, right - left, bottom - top_1);
        }
        return Rect.empty;
    };
    /**   @private  */
    Rect.prototype.Inflate = function (padding) {
        this.x -= padding;
        this.y -= padding;
        this.width += padding * 2;
        this.height += padding * 2;
        return this;
    };
    // public Inflate(size: Size): Rect {
    //    this.x -= size.Width;
    //    this.y -= size.Height;
    //    this.width += size.Width * 2;
    //    this.height += size.Height * 2;
    //    return this;
    // }
    // public inflate(width: number, height: number): void {
    //     this.x -= width;
    //     this.y -= height;
    //     this.width += width * 2;
    //     this.height += height * 2;
    // }
    /**   @private  */
    Rect.prototype.intersects = function (rect) {
        if (this.right < rect.left || this.left > rect.right || this.top > rect.bottom || this.bottom < rect.top) {
            return false;
        }
        return true;
    };
    /**   @private  */
    Rect.prototype.containsRect = function (rect) {
        return this.left <= rect.left && this.right >= rect.right && this.top <= rect.top && this.bottom >= rect.bottom;
    };
    /**   @private  */
    Rect.prototype.containsPoint = function (point, padding) {
        if (padding === void 0) { padding = 0; }
        return this.left - padding <= point.x && this.right + padding >= point.x
            && this.top - padding <= point.y && this.bottom + padding >= point.y;
    };
    Rect.prototype.toPoints = function () {
        var points = [];
        points.push(this.topLeft);
        points.push(this.topRight);
        points.push(this.bottomLeft);
        points.push(this.bottomRight);
        return points;
    };
    /**   @private  */
    Rect.toBounds = function (points) {
        var rect = new Rect();
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var pt = points_1[_i];
            rect.unitePoint(pt);
        }
        return rect;
    };
    Rect.prototype.scale = function (scaleX, scaleY) {
        this.width *= scaleX;
        this.height *= scaleY;
    };
    Rect.prototype.offset = function (offsetX, offsetY) {
        this.x += offsetX;
        this.y += offsetY;
    };
    /**   @private  */
    Rect.empty = new Rect(Number.MAX_VALUE, Number.MIN_VALUE, 0, 0);
    return Rect;
}());
export { Rect };
