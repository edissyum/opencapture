import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
/* eslint-disable */
/**
 * @private
 */
var WSectionFormat = /** @class */ (function () {
    function WSectionFormat(node) {
        this.uniqueSectionFormat = undefined;
        this.ownerBase = node;
    }
    Object.defineProperty(WSectionFormat.prototype, "headerDistance", {
        get: function () {
            return this.getPropertyValue('headerDistance');
        },
        set: function (value) {
            this.setPropertyValue('headerDistance', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "footerDistance", {
        get: function () {
            return this.getPropertyValue('footerDistance');
        },
        set: function (value) {
            this.setPropertyValue('footerDistance', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "differentFirstPage", {
        get: function () {
            return this.getPropertyValue('differentFirstPage');
        },
        set: function (value) {
            this.setPropertyValue('differentFirstPage', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "differentOddAndEvenPages", {
        get: function () {
            return this.getPropertyValue('differentOddAndEvenPages');
        },
        set: function (value) {
            this.setPropertyValue('differentOddAndEvenPages', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "pageHeight", {
        get: function () {
            return this.getPropertyValue('pageHeight');
        },
        set: function (value) {
            this.setPropertyValue('pageHeight', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "rightMargin", {
        get: function () {
            return this.getPropertyValue('rightMargin');
        },
        set: function (value) {
            this.setPropertyValue('rightMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "pageWidth", {
        get: function () {
            return this.getPropertyValue('pageWidth');
        },
        set: function (value) {
            this.setPropertyValue('pageWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "leftMargin", {
        get: function () {
            return this.getPropertyValue('leftMargin');
        },
        set: function (value) {
            this.setPropertyValue('leftMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "bottomMargin", {
        get: function () {
            return this.getPropertyValue('bottomMargin');
        },
        set: function (value) {
            this.setPropertyValue('bottomMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "topMargin", {
        get: function () {
            return this.getPropertyValue('topMargin');
        },
        set: function (value) {
            this.setPropertyValue('topMargin', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "bidi", {
        get: function () {
            return this.getPropertyValue('bidi');
        },
        set: function (value) {
            this.setPropertyValue('bidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "restartPageNumbering", {
        get: function () {
            return this.getPropertyValue('restartPageNumbering');
        },
        set: function (value) {
            this.setPropertyValue('restartPageNumbering', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "pageStartingNumber", {
        get: function () {
            return this.getPropertyValue('pageStartingNumber');
        },
        set: function (value) {
            this.setPropertyValue('pageStartingNumber', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "endnoteNumberFormat", {
        get: function () {
            return this.getPropertyValue('endnoteNumberFormat');
        },
        set: function (value) {
            this.setPropertyValue('endnoteNumberFormat', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "restartIndexForEndnotes", {
        get: function () {
            return this.getPropertyValue('restartIndexForEndnotes');
        },
        set: function (value) {
            this.setPropertyValue('restartIndexForEndnotes', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "restartIndexForFootnotes", {
        get: function () {
            return this.getPropertyValue('restartIndexForFootnotes');
        },
        set: function (value) {
            this.setPropertyValue('restartIndexForFootnotes', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "footNoteNumberFormat", {
        get: function () {
            return this.getPropertyValue('footNoteNumberFormat');
        },
        set: function (value) {
            this.setPropertyValue('footNoteNumberFormat', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "initialFootNoteNumber", {
        get: function () {
            return this.getPropertyValue('initialFootNoteNumber');
        },
        set: function (value) {
            this.setPropertyValue('initialFootNoteNumber', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WSectionFormat.prototype, "initialEndNoteNumber", {
        get: function () {
            return this.getPropertyValue('initialEndNoteNumber');
        },
        set: function (value) {
            this.setPropertyValue('initialEndNoteNumber', value);
        },
        enumerable: true,
        configurable: true
    });
    WSectionFormat.prototype.destroy = function () {
        if (!isNullOrUndefined(this.uniqueSectionFormat)) {
            WSectionFormat.uniqueSectionFormats.remove(this.uniqueSectionFormat);
        }
        this.uniqueSectionFormat = undefined;
    };
    WSectionFormat.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueSectionFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueSectionFormat.uniqueFormatType, property);
            return this.uniqueSectionFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WSectionFormat.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'headerDistance':
                value = 36;
                break;
            case 'footerDistance':
                value = 36;
                break;
            case 'differentFirstPage':
                value = false;
                break;
            case 'differentOddAndEvenPages':
                value = false;
                break;
            case 'pageWidth':
                value = 612;
                break;
            case 'pageHeight':
                value = 792;
                break;
            case 'leftMargin':
                value = 72;
                break;
            case 'topMargin':
                value = 72;
                break;
            case 'rightMargin':
                value = 72;
                break;
            case 'bottomMargin':
                value = 72;
                break;
            case 'bidi':
                value = false;
                break;
            case 'restartPageNumbering':
                value = false;
                break;
            case 'pageStartingNumber':
                value = 1;
                break;
            case 'footnotePosition':
                value = 'PrintAtBottomOfPage';
                break;
            case 'endnoteNumberFormat':
                value = 'LowerCaseRoman';
                break;
            case 'endnotePosition':
                value = 'DisplayEndOfDocument';
                break;
            case 'restartIndexForEndnotes':
                value = 'DoNotRestart';
                break;
            case 'restartIndexForFootnotes':
                value = 'DoNotRestart';
                break;
            case 'footNoteNumberFormat':
                value = 'Arabic';
                break;
            case 'initialFootNoteNumber':
                value = 1;
                break;
            case 'initialEndNoteNumber':
                value = 1;
                break;
        }
        return value;
    };
    WSectionFormat.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WSectionFormat.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueSectionFormat) && this.uniqueSectionFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueSectionFormat.propertiesHash.get(propertyType);
            }
        }
        return WSectionFormat.getPropertyDefaultValue(property);
    };
    WSectionFormat.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WSectionFormat.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueSectionFormat)) {
            this.initializeUniqueSectionFormat(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueSectionFormat.uniqueFormatType, property);
            if (this.uniqueSectionFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueSectionFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueSectionFormat = WSectionFormat.uniqueSectionFormats.updateUniqueFormat(this.uniqueSectionFormat, property, value);
        }
    };
    WSectionFormat.prototype.initializeUniqueSectionFormat = function (property, propValue) {
        var uniqueSectionFormatTemp = new Dictionary();
        this.addUniqueSectionFormat('headerDistance', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('footerDistance', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('differentFirstPage', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('differentOddAndEvenPages', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('pageWidth', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('pageHeight', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('leftMargin', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('topMargin', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('rightMargin', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('bottomMargin', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('bidi', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('restartPageNumbering', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('pageStartingNumber', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('endnoteNumberFormat', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('endnotePosition', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('footNoteNumberFormat', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('footnotePosition', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('restartIndexForEndnotes', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('restartIndexForFootnotes', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('initialFootNoteNumber', property, propValue, uniqueSectionFormatTemp);
        this.addUniqueSectionFormat('initialEndNoteNumber', property, propValue, uniqueSectionFormatTemp);
        this.uniqueSectionFormat = WSectionFormat.uniqueSectionFormats.addUniqueFormat(uniqueSectionFormatTemp, WSectionFormat.uniqueFormatType);
    };
    WSectionFormat.prototype.addUniqueSectionFormat = function (property, modifiedProperty, propValue, uniqueSectionFormatTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WSectionFormat.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueSectionFormatTemp.add(propertyType, propValue);
        }
        else {
            uniqueSectionFormatTemp.add(propertyType, WSectionFormat.getPropertyDefaultValue(property));
        }
    };
    WSectionFormat.prototype.copyFormat = function (format, history) {
        if (history && (history.isUndoing || history.isRedoing)) {
            this.uniqueSectionFormat = format.uniqueSectionFormat;
        }
        else {
            if (!isNullOrUndefined(format)) {
                if (!isNullOrUndefined(format.uniqueSectionFormat) && format.uniqueSectionFormat.propertiesHash) {
                    this.updateUniqueSectionFormat(format);
                }
            }
        }
    };
    WSectionFormat.prototype.updateUniqueSectionFormat = function (format) {
        var hash = undefined;
        if (this.uniqueSectionFormat) {
            hash = this.uniqueSectionFormat.mergeProperties(format.uniqueSectionFormat);
            if (this.uniqueSectionFormat.referenceCount === 0) {
                WSectionFormat.uniqueSectionFormats.remove(this.uniqueSectionFormat);
                this.uniqueSectionFormat = undefined;
            }
        }
        this.uniqueSectionFormat = new WUniqueFormat(WSectionFormat.uniqueFormatType);
        if (isNullOrUndefined(hash)) {
            hash = this.uniqueSectionFormat.mergeProperties(format.uniqueSectionFormat);
        }
        this.uniqueSectionFormat = WSectionFormat.uniqueSectionFormats.addUniqueFormat(hash, WSectionFormat.uniqueFormatType);
    };
    WSectionFormat.prototype.cloneFormat = function () {
        var format = new WSectionFormat();
        format.uniqueSectionFormat = this.uniqueSectionFormat;
        return format;
    };
    WSectionFormat.clear = function () {
        this.uniqueSectionFormats.clear();
    };
    WSectionFormat.uniqueSectionFormats = new WUniqueFormats();
    WSectionFormat.uniqueFormatType = 10;
    return WSectionFormat;
}());
export { WSectionFormat };
