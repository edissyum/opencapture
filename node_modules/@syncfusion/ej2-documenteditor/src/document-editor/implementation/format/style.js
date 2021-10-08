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
import { WParagraphFormat } from './paragraph-format';
import { WCharacterFormat } from './character-format';
import { HelperMethods } from '../editor/editor-helper';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var WStyle = /** @class */ (function () {
    function WStyle() {
    }
    return WStyle;
}());
export { WStyle };
/**
 * @private
 */
var WParagraphStyle = /** @class */ (function (_super) {
    __extends(WParagraphStyle, _super);
    function WParagraphStyle(node) {
        var _this = _super.call(this) || this;
        _this.ownerBase = node;
        _this.paragraphFormat = new WParagraphFormat(_this);
        _this.characterFormat = new WCharacterFormat(_this);
        return _this;
    }
    WParagraphStyle.prototype.destroy = function () {
        this.characterFormat.destroy();
        this.paragraphFormat.destroy();
    };
    WParagraphStyle.prototype.copyStyle = function (paraStyle) {
        this.name = paraStyle.name;
        this.ownerBase = paraStyle.ownerBase;
        this.type = paraStyle.type;
        this.next = paraStyle.next;
        this.basedOn = paraStyle.basedOn;
        this.link = paraStyle.link;
        this.characterFormat.copyFormat(paraStyle.characterFormat);
        this.paragraphFormat.copyFormat(paraStyle.paragraphFormat);
    };
    return WParagraphStyle;
}(WStyle));
export { WParagraphStyle };
/**
 * @private
 */
var WCharacterStyle = /** @class */ (function (_super) {
    __extends(WCharacterStyle, _super);
    function WCharacterStyle(node) {
        var _this = _super.call(this) || this;
        _this.ownerBase = node;
        _this.characterFormat = new WCharacterFormat(_this);
        return _this;
    }
    WCharacterStyle.prototype.destroy = function () {
        this.characterFormat.destroy();
    };
    WCharacterStyle.prototype.copyStyle = function (charStyle) {
        this.name = charStyle.name;
        this.ownerBase = charStyle.ownerBase;
        this.type = charStyle.type;
        this.next = charStyle.next;
        this.basedOn = charStyle.basedOn;
        this.characterFormat.copyFormat(charStyle.characterFormat);
    };
    return WCharacterStyle;
}(WStyle));
export { WCharacterStyle };
/**
 * @private
 */
var WStyles = /** @class */ (function () {
    function WStyles() {
        this.collection = [];
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }
    Object.defineProperty(WStyles.prototype, "length", {
        get: function () {
            return this.collection.length;
        },
        enumerable: true,
        configurable: true
    });
    WStyles.prototype.remove = function (item) {
        this.collection = this.collection.filter(function (a) { return (a.name !== item.name); });
    };
    WStyles.prototype.push = function (item) {
        if (item != null && item !== undefined) {
            this.collection.push(item);
        }
        return 1;
    };
    WStyles.prototype.getItem = function (index) {
        if (this.collection.length > index) {
            return this.collection[index];
        }
        return null;
    };
    WStyles.prototype.indexOf = function (item) {
        return this.collection.indexOf(item);
    };
    WStyles.prototype.contains = function (item) {
        var index = this.collection.indexOf(item);
        return index > -1 && index < this.collection.length;
    };
    WStyles.prototype.clear = function () {
        while (this.collection.length > 0) {
            this.collection.pop();
        }
    };
    WStyles.prototype.findByName = function (name, type) {
        var returnStyle;
        for (var _i = 0, _a = this.collection; _i < _a.length; _i++) {
            var value = _a[_i];
            if (value.name === name) {
                returnStyle = value;
                if (!isNullOrUndefined(type) && value.type === type) {
                    returnStyle = value;
                }
            }
        }
        return returnStyle;
    };
    WStyles.prototype.getStyleNames = function (type) {
        return this.collection.filter(function (a) { return (a.type === type); }).map(function (a) {
            return a.name;
        });
    };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    WStyles.prototype.getStyles = function (type) {
        var styles = this.collection.filter(function (a) { return (a.type === type); }).map(function (a) {
            return a;
        });
        var styleObjects = [];
        for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
            var style = styles_1[_i];
            var returnStyle = {};
            var returnStyleObject = {};
            returnStyleObject.characterFormat = {};
            HelperMethods.writeCharacterFormat(returnStyleObject.characterFormat, true, style.characterFormat);
            returnStyle.name = style.name;
            returnStyle.style = JSON.stringify(returnStyleObject);
            styleObjects.push(returnStyle);
        }
        return styleObjects;
    };
    return WStyles;
}());
export { WStyles };
