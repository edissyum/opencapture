import { WBorder } from './border';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var WBorders = /** @class */ (function () {
    function WBorders(node) {
        this.leftIn = new WBorder(this);
        this.rightIn = new WBorder(this);
        this.topIn = new WBorder(this);
        this.bottomIn = new WBorder(this);
        this.horizontalIn = new WBorder(this);
        this.verticalIn = new WBorder(this);
        this.diagonalUpIn = new WBorder(this);
        this.diagonalDownIn = new WBorder(this);
        this.lineWidthIn = 0;
        this.ownerBase = node;
    }
    Object.defineProperty(WBorders.prototype, "left", {
        get: function () {
            return this.leftIn;
        },
        set: function (value) {
            this.leftIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "right", {
        get: function () {
            return this.rightIn;
        },
        set: function (value) {
            this.rightIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "top", {
        get: function () {
            return this.topIn;
        },
        set: function (value) {
            this.topIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "bottom", {
        get: function () {
            return this.bottomIn;
        },
        set: function (value) {
            this.bottomIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "horizontal", {
        get: function () {
            return this.horizontalIn;
        },
        set: function (value) {
            this.horizontalIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "vertical", {
        get: function () {
            return this.verticalIn;
        },
        set: function (value) {
            this.verticalIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "diagonalUp", {
        get: function () {
            return this.diagonalUpIn;
        },
        set: function (value) {
            this.diagonalUpIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorders.prototype, "diagonalDown", {
        get: function () {
            return this.diagonalDownIn;
        },
        set: function (value) {
            this.diagonalDownIn = value;
        },
        enumerable: true,
        configurable: true
    });
    /* eslint-enable */
    WBorders.prototype.destroy = function () {
        if (!isNullOrUndefined(this.left)) {
            this.left.destroy();
        }
        if (!isNullOrUndefined(this.top)) {
            this.top.destroy();
        }
        if (!isNullOrUndefined(this.bottom)) {
            this.bottom.destroy();
        }
        if (!isNullOrUndefined(this.right)) {
            this.right.destroy();
        }
        if (!isNullOrUndefined(this.horizontal)) {
            this.horizontal.destroy();
        }
        if (!isNullOrUndefined(this.vertical)) {
            this.vertical.destroy();
        }
        if (!isNullOrUndefined(this.diagonalDown)) {
            this.diagonalDown.destroy();
        }
        if (!isNullOrUndefined(this.diagonalUp)) {
            this.diagonalUp.destroy();
        }
        this.topIn = undefined;
        this.bottomIn = undefined;
        this.leftIn = undefined;
        this.rightIn = undefined;
        this.horizontalIn = undefined;
        this.verticalIn = undefined;
        this.diagonalDownIn = undefined;
        this.diagonalUpIn = undefined;
        this.lineWidthIn = undefined;
        this.valueIn = undefined;
    };
    WBorders.prototype.cloneFormat = function () {
        var borders = new WBorders(undefined);
        borders.top = isNullOrUndefined(this.top) ? undefined : this.top.cloneFormat();
        borders.bottom = isNullOrUndefined(this.bottom) ? undefined : this.bottom.cloneFormat();
        borders.left = isNullOrUndefined(this.left) ? undefined : this.left.cloneFormat();
        borders.right = isNullOrUndefined(this.right) ? undefined : this.right.cloneFormat();
        borders.horizontal = isNullOrUndefined(this.horizontal) ? undefined : this.horizontal.cloneFormat();
        borders.vertical = isNullOrUndefined(this.vertical) ? undefined : this.vertical.cloneFormat();
        borders.diagonalUp = isNullOrUndefined(this.diagonalUp) ? undefined : this.diagonalUp.cloneFormat();
        borders.diagonalDown = isNullOrUndefined(this.diagonalDown) ? undefined : this.diagonalDown.cloneFormat();
        return borders;
    };
    WBorders.prototype.copyFormat = function (borders) {
        if (!isNullOrUndefined(borders.left) && borders.left instanceof WBorder) {
            this.left = new WBorder(this);
            this.left.copyFormat(borders.left);
        }
        if (!isNullOrUndefined(borders.right) && borders.right instanceof WBorder) {
            this.right = new WBorder(this);
            this.right.copyFormat(borders.right);
        }
        if (!isNullOrUndefined(borders.top) && borders.top instanceof WBorder) {
            this.top = new WBorder(this);
            this.top.copyFormat(borders.top);
        }
        if (!isNullOrUndefined(borders.bottom) && borders.bottom instanceof WBorder) {
            this.bottom = new WBorder(this);
            this.bottom.copyFormat(borders.bottom);
        }
        if (!isNullOrUndefined(borders.horizontal) && borders.horizontal instanceof WBorder) {
            this.horizontal = new WBorder(this);
            this.horizontal.copyFormat(borders.horizontal);
        }
        if (!isNullOrUndefined(borders.vertical) && borders.vertical instanceof WBorder) {
            this.vertical = new WBorder(this);
            this.vertical.copyFormat(borders.vertical);
        }
        if (!isNullOrUndefined(borders.diagonalDown) && borders.diagonalDown instanceof WBorder) {
            this.diagonalDown = new WBorder(this);
            this.diagonalDown.copyFormat(borders.diagonalDown);
        }
        if (!isNullOrUndefined(borders.diagonalUp) && borders.diagonalUp instanceof WBorder) {
            this.diagonalUp = new WBorder(this);
            this.diagonalUp.copyFormat(borders.diagonalUp);
        }
    };
    return WBorders;
}());
export { WBorders };
