import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { WBorders } from './borders';
import { WShading } from './shading';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var WTableFormat = /** @class */ (function () {
    function WTableFormat(owner) {
        this.uniqueTableFormat = undefined;
        this.borders = new WBorders(this);
        this.shading = new WShading(this);
        this.ownerBase = undefined;
        this.ownerBase = owner;
        this.assignTableMarginValue(5.4, 0, 5.4, 0);
    }
    Object.defineProperty(WTableFormat.prototype, "allowAutoFit", {
        get: function () {
            return this.getPropertyValue('allowAutoFit');
        },
        set: function (value) {
            this.setPropertyValue('allowAutoFit', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "cellSpacing", {
        get: function () {
            return this.getPropertyValue('cellSpacing');
        },
        set: function (value) {
            if (value < 0 || value > 264.6) {
                throw new RangeError('The measurement must be between 0 px and 264.6 px.');
            }
            this.setPropertyValue('cellSpacing', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "leftMargin", {
        get: function () {
            return this.getPropertyValue('leftMargin');
        },
        set: function (value) {
            this.setPropertyValue('leftMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "topMargin", {
        get: function () {
            return this.getPropertyValue('topMargin');
        },
        set: function (value) {
            this.setPropertyValue('topMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "rightMargin", {
        get: function () {
            return this.getPropertyValue('rightMargin');
        },
        set: function (value) {
            this.setPropertyValue('rightMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "bottomMargin", {
        get: function () {
            return this.getPropertyValue('bottomMargin');
        },
        set: function (value) {
            this.setPropertyValue('bottomMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "tableAlignment", {
        get: function () {
            return this.getPropertyValue('tableAlignment');
        },
        set: function (value) {
            this.setPropertyValue('tableAlignment', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "leftIndent", {
        get: function () {
            return this.getPropertyValue('leftIndent');
        },
        set: function (value) {
            if (value < -1440 || value > 1440) {
                throw new RangeError('The measurement must be between -1440 px and 1440 px.');
            }
            this.setPropertyValue('leftIndent', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "preferredWidth", {
        get: function () {
            return this.getPropertyValue('preferredWidth');
        },
        set: function (value) {
            this.setPropertyValue('preferredWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "preferredWidthType", {
        get: function () {
            return this.getPropertyValue('preferredWidthType');
        },
        set: function (value) {
            this.setPropertyValue('preferredWidthType', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "bidi", {
        get: function () {
            return this.getPropertyValue('bidi');
        },
        set: function (value) {
            this.setPropertyValue('bidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "horizontalPositionAbs", {
        get: function () {
            return this.getPropertyValue('horizontalPositionAbs');
        },
        set: function (value) {
            this.setPropertyValue('horizontalPositionAbs', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WTableFormat.prototype, "horizontalPosition", {
        get: function () {
            return this.getPropertyValue('horizontalPosition');
        },
        set: function (value) {
            this.setPropertyValue('horizontalPosition', value);
        },
        enumerable: true,
        configurable: true
    });
    /* eslint-disable */
    WTableFormat.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WTableFormat.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueTableFormat) && this.uniqueTableFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueTableFormat.propertiesHash.get(propertyType);
            }
        }
        return WTableFormat.getPropertyDefaultValue(property);
    };
    WTableFormat.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WTableFormat.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueTableFormat)) {
            this.initializeUniqueTableFormat(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueTableFormat.uniqueFormatType, property);
            if (this.uniqueTableFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueTableFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueTableFormat = WTableFormat.uniqueTableFormats.updateUniqueFormat(this.uniqueTableFormat, property, value);
        }
    };
    WTableFormat.prototype.initializeUniqueTableFormat = function (property, propValue) {
        var uniqueTableFormatTemp = new Dictionary();
        this.addUniqueTableFormat('allowAutoFit', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('cellSpacing', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('leftMargin', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('topMargin', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('bottomMargin', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('rightMargin', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('leftIndent', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('tableAlignment', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('preferredWidth', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('preferredWidthType', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('bidi', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('horizontalPositionAbs', property, propValue, uniqueTableFormatTemp);
        this.addUniqueTableFormat('horizontalPosition', property, propValue, uniqueTableFormatTemp);
        this.uniqueTableFormat = WTableFormat.uniqueTableFormats.addUniqueFormat(uniqueTableFormatTemp, WTableFormat.uniqueFormatType);
    };
    WTableFormat.prototype.addUniqueTableFormat = function (property, modifiedProperty, propValue, uniqueTableFormatTemp) {
        var propertyType;
        propertyType = WUniqueFormat.getPropertyType(WTableFormat.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueTableFormatTemp.add(propertyType, propValue);
        }
    };
    WTableFormat.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'allowAutoFit':
                value = false;
                break;
            case 'cellSpacing':
                value = 0;
                break;
            case 'leftMargin':
                value = 5.4;
                break;
            case 'topMargin':
                value = 0;
                break;
            case 'bottomMargin':
                value = 0;
                break;
            case 'rightMargin':
                value = 5.4;
                break;
            case 'leftIndent':
                value = 0;
                break;
            case 'tableAlignment':
                value = 'Left';
                break;
            case 'preferredWidth':
                value = 0;
                break;
            case 'preferredWidthType':
                value = 'Point';
                break;
            case 'bidi':
                value = false;
                break;
            case 'horizontalPositionAbs':
                value = null;
                break;
            case 'horizontalPosition':
                value = 0;
                break;
        }
        return value;
    };
    WTableFormat.prototype.assignTableMarginValue = function (left, top, right, bottom) {
        this.leftMargin = left;
        this.topMargin = top;
        this.rightMargin = right;
        this.bottomMargin = bottom;
    };
    WTableFormat.prototype.initializeTableBorders = function () {
        this.borders.left.lineStyle = 'Single';
        this.borders.left.lineWidth = 0.5;
        this.borders.right.lineStyle = 'Single';
        this.borders.right.lineWidth = 0.5;
        this.borders.top.lineStyle = 'Single';
        this.borders.top.lineWidth = 0.5;
        this.borders.bottom.lineStyle = 'Single';
        this.borders.bottom.lineWidth = 0.5;
        this.borders.horizontal.lineStyle = 'Single';
        this.borders.horizontal.lineWidth = 0.5;
        this.borders.vertical.lineStyle = 'Single';
        this.borders.vertical.lineWidth = 0.5;
    };
    WTableFormat.prototype.destroy = function () {
        if (!isNullOrUndefined(this.borders)) {
            this.borders.destroy();
        }
        if (!isNullOrUndefined(this.shading)) {
            this.shading.destroy();
        }
        if (!isNullOrUndefined(this.uniqueTableFormat)) {
            WTableFormat.uniqueTableFormats.remove(this.uniqueTableFormat);
        }
        this.uniqueTableFormat = undefined;
        this.borders = undefined;
        this.shading = undefined;
    };
    WTableFormat.prototype.cloneFormat = function () {
        var tableFormat = new WTableFormat(undefined);
        tableFormat.leftIndent = this.leftIndent;
        tableFormat.tableAlignment = this.tableAlignment;
        tableFormat.cellSpacing = this.cellSpacing;
        tableFormat.leftMargin = this.leftMargin;
        tableFormat.rightMargin = this.rightMargin;
        tableFormat.topMargin = this.topMargin;
        tableFormat.bottomMargin = this.bottomMargin;
        tableFormat.preferredWidth = this.preferredWidth;
        tableFormat.preferredWidthType = this.preferredWidthType;
        tableFormat.horizontalPositionAbs = this.horizontalPositionAbs;
        tableFormat.horizontalPosition = this.horizontalPosition;
        tableFormat.borders = isNullOrUndefined(this.borders) ? undefined : this.borders.cloneFormat();
        tableFormat.shading = isNullOrUndefined(this.shading) ? undefined : this.shading.cloneFormat();
        tableFormat.bidi = this.bidi;
        tableFormat.allowAutoFit = this.allowAutoFit;
        return tableFormat;
    };
    WTableFormat.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueTableFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueTableFormat.uniqueFormatType, property);
            return this.uniqueTableFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WTableFormat.prototype.copyFormat = function (format) {
        if (!isNullOrUndefined(format)) {
            if (!isNullOrUndefined(format.uniqueTableFormat)) {
                this.cellSpacing = format.cellSpacing;
                this.leftMargin = format.leftMargin;
                this.topMargin = format.topMargin;
                this.rightMargin = format.rightMargin;
                this.bottomMargin = format.bottomMargin;
                this.leftIndent = format.leftIndent;
                this.tableAlignment = format.tableAlignment;
                this.preferredWidth = format.preferredWidth;
                this.preferredWidthType = format.preferredWidthType;
                this.bidi = format.bidi;
                this.allowAutoFit = format.allowAutoFit;
                this.horizontalPosition = format.horizontalPosition;
                this.horizontalPositionAbs = format.horizontalPositionAbs;
            }
            if (!isNullOrUndefined(format.borders)) {
                this.borders = new WBorders(this);
                this.borders.copyFormat(format.borders);
            }
            if (!isNullOrUndefined(format.shading)) {
                this.shading = new WShading(this);
                this.shading.copyFormat(format.shading);
            }
        }
    };
    WTableFormat.clear = function () {
        this.uniqueTableFormats.clear();
    };
    WTableFormat.uniqueTableFormats = new WUniqueFormats();
    WTableFormat.uniqueFormatType = 8;
    return WTableFormat;
}());
export { WTableFormat };
