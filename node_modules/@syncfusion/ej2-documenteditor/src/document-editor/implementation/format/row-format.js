import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { WBorders } from './borders';
import { Revision } from '../track-changes/track-changes';
/* eslint-disable */
/**
 * @private
 */
var WRowFormat = /** @class */ (function () {
    function WRowFormat(node) {
        this.uniqueRowFormat = undefined;
        /**
         * @private
         */
        this.borders = new WBorders(this);
        /**
         * @private
         */
        this.ownerBase = undefined;
        /**
         * @private
         */
        this.beforeWidth = 0;
        /**
         * @private
         */
        this.afterWidth = 0;
        /**
         * @private
         */
        this.revisions = [];
        /**
         * @private
         */
        this.removedIds = [];
        this.ownerBase = node;
    }
    Object.defineProperty(WRowFormat.prototype, "gridBefore", {
        get: function () {
            return this.getPropertyValue('gridBefore');
        },
        set: function (value) {
            this.setPropertyValue('gridBefore', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "gridBeforeWidth", {
        get: function () {
            return this.getPropertyValue('gridBeforeWidth');
        },
        set: function (value) {
            this.setPropertyValue('gridBeforeWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "gridBeforeWidthType", {
        get: function () {
            return this.getPropertyValue('gridBeforeWidthType');
        },
        set: function (value) {
            this.setPropertyValue('gridBeforeWidthType', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "gridAfter", {
        get: function () {
            return this.getPropertyValue('gridAfter');
        },
        set: function (value) {
            this.setPropertyValue('gridAfter', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "gridAfterWidth", {
        get: function () {
            return this.getPropertyValue('gridAfterWidth');
        },
        set: function (value) {
            this.setPropertyValue('gridAfterWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "gridAfterWidthType", {
        get: function () {
            return this.getPropertyValue('gridAfterWidthType');
        },
        set: function (value) {
            this.setPropertyValue('gridAfterWidthType', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "allowBreakAcrossPages", {
        get: function () {
            return this.getPropertyValue('allowBreakAcrossPages');
        },
        set: function (value) {
            this.setPropertyValue('allowBreakAcrossPages', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "isHeader", {
        get: function () {
            return this.getPropertyValue('isHeader');
        },
        set: function (value) {
            this.setPropertyValue('isHeader', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "rightMargin", {
        get: function () {
            return this.getPropertyValue('rightMargin');
        },
        set: function (value) {
            this.setPropertyValue('rightMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "height", {
        get: function () {
            return this.getPropertyValue('height');
        },
        set: function (value) {
            if (value === 0 && (this.heightType === 'AtLeast' || this.heightType === 'Exactly')) {
                value = 1;
            }
            else if (this.heightType === 'Auto') {
                value = 0;
            }
            this.setPropertyValue('height', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "heightType", {
        get: function () {
            return this.getPropertyValue('heightType');
        },
        set: function (value) {
            if (value === 'AtLeast' || value === 'Exactly') {
                this.height = 1;
            }
            else {
                this.height = 0;
            }
            this.setPropertyValue('heightType', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "bottomMargin", {
        get: function () {
            return this.getPropertyValue('bottomMargin');
        },
        set: function (value) {
            this.setPropertyValue('bottomMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "leftIndent", {
        get: function () {
            return this.getPropertyValue('leftIndent');
        },
        set: function (value) {
            this.setPropertyValue('leftIndent', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "topMargin", {
        get: function () {
            return this.getPropertyValue('topMargin');
        },
        set: function (value) {
            this.setPropertyValue('topMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WRowFormat.prototype, "leftMargin", {
        get: function () {
            return this.getPropertyValue('leftMargin');
        },
        set: function (value) {
            this.setPropertyValue('leftMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    WRowFormat.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WRowFormat.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueRowFormat) && this.uniqueRowFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueRowFormat.propertiesHash.get(propertyType);
            }
        }
        return WRowFormat.getPropertyDefaultValue(property);
    };
    WRowFormat.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WRowFormat.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueRowFormat)) {
            this.initializeUniqueRowFormat(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueRowFormat.uniqueFormatType, property);
            if (this.uniqueRowFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueRowFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueRowFormat = WRowFormat.uniqueRowFormats.updateUniqueFormat(this.uniqueRowFormat, property, value);
        }
    };
    WRowFormat.prototype.initializeUniqueRowFormat = function (property, propValue) {
        var uniqueRowFormatTemp = new Dictionary();
        this.addUniqueRowFormat('allowBreakAcrossPages', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('isHeader', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('height', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('heightType', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridBefore', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridBeforeWidth', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridBeforeWidthType', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridAfter', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridAfterWidth', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridgridAfterWidth', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('gridBeforeWidthType', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('leftMargin', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('rightMargin', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('topMargin', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('bottomMargin', property, propValue, uniqueRowFormatTemp);
        this.addUniqueRowFormat('leftIndent', property, propValue, uniqueRowFormatTemp);
        this.uniqueRowFormat = WRowFormat.uniqueRowFormats.addUniqueFormat(uniqueRowFormatTemp, WRowFormat.uniqueFormatType);
    };
    WRowFormat.prototype.addUniqueRowFormat = function (property, modifiedProperty, propValue, uniqueRowFormatTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WRowFormat.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueRowFormatTemp.add(propertyType, propValue);
        }
    };
    WRowFormat.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'allowBreakAcrossPages':
                value = true;
                break;
            case 'isHeader':
                value = false;
                break;
            case 'height':
                value = 0;
                break;
            case 'heightType':
                value = 'Auto';
                break;
            case 'gridBefore':
                value = 0;
                break;
            case 'gridBeforeWidth':
                value = 0;
                break;
            case 'gridBeforeWidthType':
                value = 'Point';
                break;
            case 'gridAfter':
                value = 0;
                break;
            case 'gridAfterWidth':
                value = 0;
                break;
            case 'gridAfterWidthType':
                value = 'Point';
                break;
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
            case 'leftIndent':
                value = 0;
                break;
        }
        return value;
    };
    WRowFormat.prototype.containsMargins = function () {
        return (!isNullOrUndefined(this.leftMargin)
            || !isNullOrUndefined(this.rightMargin)
            || !isNullOrUndefined(this.bottomMargin)
            || !isNullOrUndefined(this.topMargin));
    };
    WRowFormat.prototype.cloneFormat = function () {
        var format = new WRowFormat();
        format.allowBreakAcrossPages = this.allowBreakAcrossPages;
        format.heightType = this.heightType;
        format.height = this.height;
        format.isHeader = this.isHeader;
        format.gridBefore = this.gridBefore;
        format.gridBeforeWidth = this.gridBeforeWidth;
        format.gridBeforeWidthType = this.gridBeforeWidthType;
        format.gridAfter = this.gridAfter;
        format.gridAfterWidth = this.gridAfterWidth;
        format.gridAfterWidthType = this.gridAfterWidthType;
        format.leftMargin = this.leftMargin;
        format.rightMargin = this.rightMargin;
        format.topMargin = this.topMargin;
        format.bottomMargin = this.bottomMargin;
        format.leftIndent = this.leftIndent;
        if (this.revisions.length > 0) {
            format.removedIds = Revision.cloneRevisions(this.revisions);
        }
        else {
            format.removedIds = this.removedIds.slice();
        }
        return format;
    };
    WRowFormat.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueRowFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueRowFormat.uniqueFormatType, property);
            return this.uniqueRowFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WRowFormat.prototype.copyFormat = function (format) {
        if (!isNullOrUndefined(format)) {
            if (!isNullOrUndefined(format.uniqueRowFormat)) {
                this.allowBreakAcrossPages = format.allowBreakAcrossPages;
                this.isHeader = format.isHeader;
                this.heightType = format.heightType;
                this.height = format.height;
                this.gridBefore = format.gridBefore;
                this.gridBeforeWidth = format.gridBeforeWidth;
                this.gridBeforeWidthType = format.gridBeforeWidthType;
                this.gridAfter = format.gridAfter;
                this.gridAfterWidth = format.gridAfterWidth;
                this.gridAfterWidthType = format.gridAfterWidthType;
                this.leftMargin = format.leftMargin;
                this.topMargin = format.topMargin;
                this.rightMargin = format.rightMargin;
                this.bottomMargin = format.bottomMargin;
                this.leftIndent = format.leftIndent;
            }
            if (!isNullOrUndefined(format.borders)) {
                this.borders = new WBorders(this);
                this.borders.ownerBase = format;
                this.borders.copyFormat(format.borders);
            }
            if (format.revisions.length > 0) {
                this.removedIds = Revision.cloneRevisions(format.revisions);
            }
            else {
                this.removedIds = format.removedIds.slice();
            }
        }
    };
    WRowFormat.prototype.destroy = function () {
        if (!isNullOrUndefined(this.borders)) {
            this.borders.destroy();
        }
        if (!isNullOrUndefined(this.uniqueRowFormat)) {
            WRowFormat.uniqueRowFormats.remove(this.uniqueRowFormat);
        }
        this.beforeWidth = undefined;
        this.afterWidth = undefined;
        this.borders = undefined;
        this.uniqueRowFormat = undefined;
    };
    WRowFormat.clear = function () {
        this.uniqueRowFormats.clear();
    };
    WRowFormat.uniqueRowFormats = new WUniqueFormats();
    WRowFormat.uniqueFormatType = 6;
    return WRowFormat;
}());
export { WRowFormat };
