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
        // eslint-disable-next-line jsdoc/require-returns
        /**   @private  */
        get: function () {
            return this.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "right", {
        /**
         * right method \
         *
         * @returns { Rect } right method .\
         *
         * @private
         */
        get: function () {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "top", {
        /**
         * toBounds method \
         *
         * @returns { Rect } toBounds method .\
         *
         * @private
         */
        get: function () {
            return this.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottom", {
        /**
         * bottom method \
         *
         * @returns { Rect } bottom method .\
         *
         * @private
         */
        get: function () {
            return this.y + this.height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topLeft", {
        /**
         * topLeft method \
         *
         * @returns { Rect } topLeft method .\
         *
         * @private
         */
        get: function () {
            return { x: this.left, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topRight", {
        /**
         * topRight method \
         *
         * @returns { Rect } topRight method .\
         *
         * @private
         */
        get: function () {
            return { x: this.right, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomLeft", {
        /**
         * bottomLeft method \
         *
         * @returns { Rect } bottomLeft method .\
         *
         * @private
         */
        get: function () {
            return { x: this.left, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomRight", {
        /**
         * bottomRight method \
         *
         * @returns { Rect } bottomRight method .\
         *
         * @private
         */
        get: function () {
            return { x: this.right, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "middleLeft", {
        /**
         * middleLeft method \
         *
         * @returns { Rect } middleLeft method .\
         *
         * @private
         */
        get: function () {
            return { x: this.left, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "middleRight", {
        /**
         * middleRight method \
         *
         * @returns { Rect } middleRight method .\
         *
         * @private
         */
        get: function () {
            return { x: this.right, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "topCenter", {
        /**
         * topCenter method \
         *
         * @returns { Rect } topCenter method .\
         *
         * @private
         */
        get: function () {
            return { x: this.x + this.width / 2, y: this.top };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "bottomCenter", {
        /**
         * bottomCenter method \
         *
         * @returns { Rect } bottomCenter method .\
         *
         * @private
         */
        get: function () {
            return { x: this.x + this.width / 2, y: this.bottom };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "center", {
        /**
         * center method \
         *
         * @returns { PointModel } center method .\
         *
         * @private
         */
        get: function () {
            return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        },
        enumerable: true,
        configurable: true
    });
    /**
     * equals method \
     *
     * @returns { boolean } equals method .\
     * @param {Rect} rect1 - provide the rect1 value.
     * @param {Rect} rect2 - provide the rect2 value.
     *
     * @private
     */
    Rect.prototype.equals = function (rect1, rect2) {
        return rect1.x === rect2.x && rect1.y === rect2.y && rect1.width === rect2.width && rect1.height === rect2.height;
    };
    /**
     * uniteRect method \
     *
     * @returns { Rect } uniteRect method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    Rect.prototype.uniteRect = function (rect) {
        var right = Math.max(Number.NaN === this.right || this.x === Number.MAX_VALUE ? rect.right : this.right, rect.right);
        var bottom = Math.max(Number.NaN === this.bottom || this.y === Number.MAX_VALUE ? rect.bottom : this.bottom, rect.bottom);
        this.x = Math.min(this.left, rect.left);
        this.y = Math.min(this.top, rect.top);
        this.width = right - this.x;
        this.height = bottom - this.y;
        return this;
    };
    /**
     * unitePoint method \
     *
     * @returns { void } unitePoint method .\
     * @param {PointModel} point - provide the points value.
     *
     * @private
     */
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
    // public intersection(rect: Rect): Rect {
    //     if (this.intersects(rect)) {
    //         let left: number = Math.max(this.left, rect.left);
    //         let top: number = Math.max(this.top, rect.top);
    //         let right: number = Math.min(this.right, rect.right);
    //         let bottom: number = Math.min(this.bottom, rect.bottom);
    //         return new Rect(left, top, right - left, bottom - top);
    //     }
    //     return Rect.empty;
    // }
    /**
     * Inflate method \
     *
     * @returns { Rect } Inflate method .\
     * @param {number} padding - provide the points value.
     *
     * @private
     */
    Rect.prototype.Inflate = function (padding) {
        this.x -= padding;
        this.y -= padding;
        this.width += padding * 2;
        this.height += padding * 2;
        return this;
    };
    //public Inflate(size: Size): Rect {
    //    this.x -= size.Width;
    //    this.y -= size.Height;
    //    this.width += size.Width * 2;
    //    this.height += size.Height * 2;
    //    return this;
    //}
    // public inflate(width: number, height: number): void {
    //     this.x -= width;
    //     this.y -= height;
    //     this.width += width * 2;
    //     this.height += height * 2;
    // }
    /**
     * intersects method \
     *
     * @returns { boolean } intersects method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    Rect.prototype.intersects = function (rect) {
        if (this.right < rect.left || this.left > rect.right || this.top > rect.bottom || this.bottom < rect.top) {
            return false;
        }
        return true;
    };
    /**
     * containsRect method \
     *
     * @returns { boolean } containsRect method .\
     * @param {Rect} rect - provide the points value.
     *
     * @private
     */
    Rect.prototype.containsRect = function (rect) {
        return this.left <= rect.left && this.right >= rect.right && this.top <= rect.top && this.bottom >= rect.bottom;
    };
    /**
     * containsPoint method \
     *
     * @returns { boolean } containsPoint method .\
     * @param {PointModel} point - provide the points value.
     * @param {number} padding - provide the padding value.
     *
     * @private
     */
    Rect.prototype.containsPoint = function (point, padding) {
        if (padding === void 0) { padding = 0; }
        return this.left - padding <= point.x && this.right + padding >= point.x
            && this.top - padding <= point.y && this.bottom + padding >= point.y;
    };
    // public toPoints(): PointModel[] {
    //     let points: PointModel[] = [];
    //     points.push(this.topLeft);
    //     points.push(this.topRight);
    //     points.push(this.bottomLeft);
    //     points.push(this.bottomRight);
    //     return points;
    // }
    /**
     * toBounds method \
     *
     * @returns { Rect } toBounds method .\
     * @param {PointModel[]} points - provide the points value.
     *
     * @private
     */
    Rect.toBounds = function (points) {
        var rect = new Rect();
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var pt = points_1[_i];
            rect.unitePoint(pt);
        }
        return rect;
    };
    /**   @private  */
    Rect.empty = new Rect(Number.MAX_VALUE, Number.MIN_VALUE, 0, 0);
    return Rect;
}());
export { Rect };
