import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { WBorders } from './borders';
import { WShading } from './shading';
/* eslint-disable */
/**
 * @private
 */
var WCellFormat = /** @class */ (function () {
    function WCellFormat(node) {
        this.uniqueCellFormat = undefined;
        this.borders = new WBorders(this);
        this.shading = new WShading(this);
        this.ownerBase = node;
        this.borders = new WBorders(this);
        this.shading = new WShading(this);
    }
    Object.defineProperty(WCellFormat.prototype, "leftMargin", {
        get: function () {
            return this.getPropertyValue('leftMargin');
        },
        set: function (value) {
            this.setPropertyValue('leftMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "rightMargin", {
        get: function () {
            return this.getPropertyValue('rightMargin');
        },
        set: function (value) {
            this.setPropertyValue('rightMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "topMargin", {
        get: function () {
            return this.getPropertyValue('topMargin');
        },
        set: function (value) {
            this.setPropertyValue('topMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "bottomMargin", {
        get: function () {
            return this.getPropertyValue('bottomMargin');
        },
        set: function (value) {
            this.setPropertyValue('bottomMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "cellWidth", {
        get: function () {
            return this.getPropertyValue('cellWidth');
        },
        set: function (value) {
            this.setPropertyValue('cellWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "columnSpan", {
        get: function () {
            return this.getPropertyValue('columnSpan');
        },
        set: function (value) {
            this.setPropertyValue('columnSpan', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "rowSpan", {
        get: function () {
            return this.getPropertyValue('rowSpan');
        },
        set: function (value) {
            this.setPropertyValue('rowSpan', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "preferredWidth", {
        get: function () {
            return this.getPropertyValue('preferredWidth');
        },
        set: function (value) {
            this.setPropertyValue('preferredWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "verticalAlignment", {
        get: function () {
            return this.getPropertyValue('verticalAlignment');
        },
        set: function (value) {
            this.setPropertyValue('verticalAlignment', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCellFormat.prototype, "preferredWidthType", {
        get: function () {
            return this.getPropertyValue('preferredWidthType');
        },
        set: function (value) {
            this.setPropertyValue('preferredWidthType', value);
        },
        enumerable: true,
        configurable: true
    });
    WCellFormat.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WCellFormat.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueCellFormat) && this.uniqueCellFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueCellFormat.propertiesHash.get(propertyType);
            }
        }
        return WCellFormat.getPropertyDefaultValue(property);
    };
    WCellFormat.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WCellFormat.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueCellFormat)) {
            this.initializeUniqueCellFormat(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueCellFormat.uniqueFormatType, property);
            if (this.uniqueCellFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueCellFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueCellFormat = WCellFormat.uniqueCellFormats.updateUniqueFormat(this.uniqueCellFormat, property, value);
        }
    };
    WCellFormat.prototype.initializeUniqueCellFormat = function (property, propValue) {
        var uniqueCellFormatTemp = new Dictionary();
        this.addUniqueCellFormat('leftMargin', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('topMargin', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('bottomMargin', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('rightMargin', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('cellWidth', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('columnSpan', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('rowSpan', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('preferredWidth', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('verticalAlignment', property, propValue, uniqueCellFormatTemp);
        this.addUniqueCellFormat('preferredWidthType', property, propValue, uniqueCellFormatTemp);
        this.uniqueCellFormat = WCellFormat.uniqueCellFormats.addUniqueFormat(uniqueCellFormatTemp, WCellFormat.uniqueFormatType);
    };
    WCellFormat.prototype.addUniqueCellFormat = function (property, modifiedProperty, propValue, uniqueCellFormatTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WCellFormat.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueCellFormatTemp.add(propertyType, propValue);
        }
    };
    WCellFormat.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'leftMargin':
                value = undefined;
                break;
            case 'topMargin':
                value = undefined;
                break;
            case 'bottomMargin':
                value = undefined;
                break;
            case 'rightMargin':
                value = undefined;
                break;
            case 'cellWidth':
                value = 0;
                break;
            case 'columnSpan':
                value = 1;
                break;
            case 'rowSpan':
                value = 1;
                break;
            case 'preferredWidth':
                value = 0;
                break;
            case 'verticalAlignment':
                value = 'Top';
                break;
            case 'preferredWidthType':
                value = 'Point';
                break;
        }
        return value;
    };
    WCellFormat.prototype.containsMargins = function () {
        return (!isNullOrUndefined(this.leftMargin)
            || !isNullOrUndefined(this.rightMargin)
            || !isNullOrUndefined(this.bottomMargin)
            || !isNullOrUndefined(this.topMargin));
    };
    WCellFormat.prototype.destroy = function () {
        if (!isNullOrUndefined(this.borders)) {
            this.borders.destroy();
        }
        if (!isNullOrUndefined(this.shading)) {
            this.shading.destroy();
        }
        if (!isNullOrUndefined(this.uniqueCellFormat)) {
            WCellFormat.uniqueCellFormats.remove(this.uniqueCellFormat);
        }
        this.uniqueCellFormat = undefined;
        this.borders = undefined;
        this.shading = undefined;
    };
    WCellFormat.prototype.cloneFormat = function () {
        var format = new WCellFormat(undefined);
        format.verticalAlignment = this.verticalAlignment;
        format.leftMargin = this.leftMargin;
        format.rightMargin = this.rightMargin;
        format.topMargin = this.topMargin;
        format.bottomMargin = this.bottomMargin;
        format.preferredWidth = this.preferredWidth;
        format.preferredWidthType = this.preferredWidthType;
        format.cellWidth = this.cellWidth;
        format.borders = isNullOrUndefined(this.borders) ? undefined : this.borders.cloneFormat();
        format.shading = isNullOrUndefined(this.shading) ? undefined : this.shading.cloneFormat();
        return format;
    };
    WCellFormat.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueCellFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueCellFormat.uniqueFormatType, property);
            return this.uniqueCellFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WCellFormat.prototype.copyFormat = function (format) {
        if (!isNullOrUndefined(format)) {
            if (!isNullOrUndefined(format.uniqueCellFormat)) {
                this.cellWidth = format.cellWidth;
                this.leftMargin = format.leftMargin;
                this.topMargin = format.topMargin;
                this.rightMargin = format.rightMargin;
                this.bottomMargin = format.bottomMargin;
                this.preferredWidth = format.preferredWidth;
                this.columnSpan = format.columnSpan;
                this.rowSpan = format.rowSpan;
                this.preferredWidthType = format.preferredWidthType;
                this.verticalAlignment = format.verticalAlignment;
            }
            if (!isNullOrUndefined(format.shading)) {
                this.shading = new WShading(this);
                this.shading.copyFormat(format.shading);
            }
            if (!isNullOrUndefined(format.borders)) {
                this.borders = new WBorders(this);
                this.borders.copyFormat(format.borders);
            }
        }
    };
    WCellFormat.clear = function () {
        this.uniqueCellFormats.clear();
    };
    WCellFormat.uniqueCellFormats = new WUniqueFormats();
    WCellFormat.uniqueFormatType = 4;
    return WCellFormat;
}());
export { WCellFormat };
