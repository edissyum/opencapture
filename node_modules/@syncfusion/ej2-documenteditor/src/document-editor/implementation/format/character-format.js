import { TextElementBox, ParagraphWidget } from '../viewer/page';
import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { WParagraphStyle } from './style';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { Revision } from '../track-changes/track-changes';
/* eslint-disable */
/**
 * @private
 */
var WCharacterFormat = /** @class */ (function () {
    function WCharacterFormat(node) {
        this.uniqueCharacterFormat = undefined;
        this.ownerBase = undefined;
        this.baseCharStyle = undefined;
        /**
         * @private
         */
        this.removedIds = [];
        /**
         * @private
         */
        this.revisions = [];
        this.ownerBase = node;
    }
    Object.defineProperty(WCharacterFormat.prototype, "bold", {
        get: function () {
            return this.getPropertyValue('bold');
        },
        set: function (value) {
            this.setPropertyValue('bold', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "italic", {
        get: function () {
            return this.getPropertyValue('italic');
        },
        set: function (value) {
            this.setPropertyValue('italic', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "fontSize", {
        get: function () {
            return this.getPropertyValue('fontSize');
        },
        set: function (value) {
            this.setPropertyValue('fontSize', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "fontFamily", {
        get: function () {
            return this.getPropertyValue('fontFamily');
        },
        set: function (value) {
            this.setPropertyValue('fontFamily', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "underline", {
        get: function () {
            return this.getPropertyValue('underline');
        },
        set: function (value) {
            this.setPropertyValue('underline', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "strikethrough", {
        get: function () {
            return this.getPropertyValue('strikethrough');
        },
        set: function (value) {
            this.setPropertyValue('strikethrough', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "baselineAlignment", {
        get: function () {
            return this.getPropertyValue('baselineAlignment');
        },
        set: function (value) {
            this.setPropertyValue('baselineAlignment', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "highlightColor", {
        get: function () {
            return this.getPropertyValue('highlightColor');
        },
        set: function (value) {
            this.setPropertyValue('highlightColor', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "fontColor", {
        get: function () {
            return this.getPropertyValue('fontColor');
        },
        set: function (value) {
            this.setPropertyValue('fontColor', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "bidi", {
        get: function () {
            return this.getPropertyValue('bidi');
        },
        set: function (value) {
            this.setPropertyValue('bidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "bdo", {
        get: function () {
            return this.getPropertyValue('bdo');
        },
        set: function (value) {
            this.setPropertyValue('bdo', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "boldBidi", {
        get: function () {
            return this.getPropertyValue('boldBidi');
        },
        set: function (value) {
            this.setPropertyValue('boldBidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "italicBidi", {
        get: function () {
            return this.getPropertyValue('italicBidi');
        },
        set: function (value) {
            this.setPropertyValue('italicBidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "fontSizeBidi", {
        get: function () {
            return this.getPropertyValue('fontSizeBidi');
        },
        set: function (value) {
            this.setPropertyValue('fontSizeBidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "fontFamilyBidi", {
        get: function () {
            return this.getPropertyValue('fontFamilyBidi');
        },
        set: function (value) {
            this.setPropertyValue('fontFamilyBidi', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WCharacterFormat.prototype, "allCaps", {
        get: function () {
            return this.getPropertyValue('allCaps');
        },
        set: function (value) {
            this.setPropertyValue('allCaps', value);
        },
        enumerable: true,
        configurable: true
    });
    WCharacterFormat.prototype.getPropertyValue = function (property) {
        if (!this.hasValue(property)) {
            var charStyleValue = this.checkCharacterStyle(property);
            if (!isNullOrUndefined(charStyleValue)) {
                return charStyleValue;
            }
            else {
                if (!isNullOrUndefined(this.baseCharStyle)) {
                    var paragraph = this.ownerBase.paragraph;
                    var line = this.ownerBase.line;
                    if (!isNullOrUndefined(paragraph) && !isNullOrUndefined(line)) {
                        var length_1 = line.children.length;
                        for (var i = 0; i < length_1; i++) {
                            var element = this.ownerBase.line.children[i];
                            if (element instanceof TextElementBox) {
                                var text = element.text;
                                if (text.startsWith('HYPERLINK')) {
                                    var index = text.indexOf('_Toc');
                                    if (index !== -1) {
                                        this.baseCharStyle = this.ownerBase.paragraph.paragraphFormat.baseStyle;
                                    }
                                }
                            }
                        }
                    }
                }
                var baseStyleValue = this.checkBaseStyle(property);
                if (!isNullOrUndefined(baseStyleValue)) {
                    return baseStyleValue;
                }
            }
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(WCharacterFormat.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueCharacterFormat) && this.uniqueCharacterFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueCharacterFormat.propertiesHash.get(propertyType);
            }
        }
        return this.getDefaultValue(property);
    };
    WCharacterFormat.prototype.getDefaultValue = function (property) {
        var propertyType = WUniqueFormat.getPropertyType(WCharacterFormat.uniqueFormatType, property);
        var docCharacterFormat = this.documentCharacterFormat();
        if (!isNullOrUndefined(docCharacterFormat) && !isNullOrUndefined(docCharacterFormat.uniqueCharacterFormat) && docCharacterFormat.uniqueCharacterFormat.propertiesHash.containsKey(propertyType)) {
            return docCharacterFormat.uniqueCharacterFormat.propertiesHash.get(propertyType);
        }
        else {
            return WCharacterFormat.getPropertyDefaultValue(property);
        }
    };
    WCharacterFormat.prototype.documentCharacterFormat = function () {
        var docCharacterFormat;
        if (!isNullOrUndefined(this.ownerBase)) {
            if (!isNullOrUndefined(this.ownerBase.paragraph) && !isNullOrUndefined(this.ownerBase.paragraph.bodyWidget)) {
                docCharacterFormat = this.ownerBase.paragraph.bodyWidget.page.documentHelper.characterFormat;
            }
            else {
                if (!isNullOrUndefined(this.ownerBase.bodyWidget)) {
                    docCharacterFormat = this.ownerBase.bodyWidget.page.documentHelper.characterFormat;
                }
            }
        }
        return docCharacterFormat;
    };
    WCharacterFormat.prototype.checkBaseStyle = function (property) {
        var baseStyle;
        if (!isNullOrUndefined(this.ownerBase)) {
            if (!isNullOrUndefined(this.ownerBase.paragraph)) {
                baseStyle = this.ownerBase.paragraph.paragraphFormat.baseStyle;
            }
            else {
                if ((this.ownerBase instanceof ParagraphWidget) && !isNullOrUndefined(this.ownerBase.paragraphFormat)) {
                    baseStyle = this.ownerBase.paragraphFormat.baseStyle;
                }
                else {
                    if (!isNullOrUndefined(this.ownerBase instanceof WParagraphStyle)) {
                        baseStyle = this.ownerBase.basedOn;
                    }
                }
            }
        }
        while (!isNullOrUndefined(baseStyle)) {
            if (baseStyle.characterFormat.hasValue(property)) {
                break;
            }
            else {
                baseStyle = baseStyle.basedOn;
            }
        }
        if (!isNullOrUndefined(baseStyle)) {
            var propertyType = WUniqueFormat.getPropertyType(WCharacterFormat.uniqueFormatType, property);
            return baseStyle.characterFormat.uniqueCharacterFormat.propertiesHash.get(propertyType);
        }
        return undefined;
    };
    WCharacterFormat.prototype.checkCharacterStyle = function (property) {
        var baseStyle = this.baseCharStyle;
        if (!isNullOrUndefined(baseStyle)) {
            while (!isNullOrUndefined(baseStyle) && baseStyle.name !== 'Default Paragraph Font') {
                var hasKey = baseStyle.characterFormat.hasValue(property);
                if (hasKey) {
                    var returnPropertyType = WUniqueFormat.getPropertyType(WCharacterFormat.uniqueFormatType, property);
                    return baseStyle.characterFormat.uniqueCharacterFormat.propertiesHash.get(returnPropertyType);
                }
                else {
                    baseStyle = baseStyle.basedOn;
                }
            }
        }
        return undefined;
    };
    WCharacterFormat.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WCharacterFormat.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueCharacterFormat)) {
            this.initializeUniqueCharacterFormat(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueCharacterFormat.uniqueFormatType, property);
            if (this.uniqueCharacterFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueCharacterFormat.propertiesHash.get(propertyType) === value) { //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueCharacterFormat = WCharacterFormat.uniqueCharacterFormats.updateUniqueFormat(this.uniqueCharacterFormat, property, value);
        }
    };
    WCharacterFormat.prototype.initializeUniqueCharacterFormat = function (property, propValue) {
        var uniqueCharFormatTemp = new Dictionary();
        this.addUniqueCharacterFormat('fontColor', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('fontFamily', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('fontSize', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('bold', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('italic', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('underline', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('strikethrough', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('baselineAlignment', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('highlightColor', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('styleName', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('bidi', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('bdo', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('fontFamilyBidi', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('fontSizeBidi', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('boldBidi', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('italicBidi', property, propValue, uniqueCharFormatTemp);
        this.addUniqueCharacterFormat('allCaps', property, propValue, uniqueCharFormatTemp);
        this.uniqueCharacterFormat = WCharacterFormat.uniqueCharacterFormats.addUniqueFormat(uniqueCharFormatTemp, WCharacterFormat.uniqueFormatType);
    };
    WCharacterFormat.prototype.addUniqueCharacterFormat = function (property, modifiedProperty, propValue, uniqueCharFormatTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WCharacterFormat.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueCharFormatTemp.add(propertyType, propValue);
        }
    };
    WCharacterFormat.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'bold':
                value = false;
                break;
            case 'italic':
                value = false;
                break;
            case 'fontSize':
                value = 11;
                break;
            case 'underline':
                value = 'None';
                break;
            case 'strikethrough':
                value = 'None';
                break;
            case 'baselineAlignment':
                value = 'Normal';
                break;
            case 'highlightColor':
                value = 'NoColor';
                break;
            case 'fontColor':
                value = '#00000000';
                break;
            case 'fontFamily':
                value = 'Calibri';
                break;
            case 'styleName':
                value = 'Default Paragraph Font';
                break;
            case 'bidi':
                value = false;
                break;
            case 'bdo':
                value = 'None';
                break;
            case 'boldBidi':
                value = false;
                break;
            case 'italicBidi':
                value = false;
                break;
            case 'fontSizeBidi':
                value = 11;
                break;
            case 'fontFamilyBidi':
                value = 'Calibri';
                break;
            case 'allCaps':
                value = false;
                break;
        }
        return value;
    };
    WCharacterFormat.prototype.isEqualFormat = function (format) {
        return (this.fontSize === format.fontSize
            && this.fontFamily === format.fontFamily
            && this.bold === format.bold
            && this.italic === format.italic
            && this.baselineAlignment === format.baselineAlignment
            && this.underline === format.underline
            && this.fontColor === format.fontColor
            && this.strikethrough === format.strikethrough
            && this.highlightColor === format.highlightColor && this.bidi === format.bidi
            && this.bdo === format.bdo)
            && this.allCaps === format.allCaps;
    };
    WCharacterFormat.prototype.isSameFormat = function (format) {
        return this.baseCharStyle === format.baseCharStyle &&
            this.uniqueCharacterFormat === format.uniqueCharacterFormat;
    };
    WCharacterFormat.prototype.cloneFormat = function () {
        var format = new WCharacterFormat(undefined);
        format.uniqueCharacterFormat = this.uniqueCharacterFormat;
        format.baseCharStyle = this.baseCharStyle;
        if (this.revisions.length > 0) {
            format.removedIds = Revision.cloneRevisions(this.revisions);
        }
        else {
            format.removedIds = this.removedIds.slice();
        }
        return format;
    };
    WCharacterFormat.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueCharacterFormat) && !isNullOrUndefined(this.uniqueCharacterFormat.propertiesHash)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueCharacterFormat.uniqueFormatType, property);
            return this.uniqueCharacterFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WCharacterFormat.prototype.clearFormat = function () {
        if (!isNullOrUndefined(this.uniqueCharacterFormat) && this.uniqueCharacterFormat.referenceCount === 0) {
            WCharacterFormat.uniqueCharacterFormats.remove(this.uniqueCharacterFormat);
        }
        this.uniqueCharacterFormat = undefined;
        this.baseCharStyle = undefined;
    };
    WCharacterFormat.prototype.destroy = function () {
        this.clearFormat();
    };
    WCharacterFormat.prototype.copyFormat = function (format) {
        if (!isNullOrUndefined(format)) {
            if (!isNullOrUndefined(format.uniqueCharacterFormat) && format.uniqueCharacterFormat.propertiesHash) {
                this.updateUniqueCharacterFormat(format);
            }
            if (!isNullOrUndefined(format.baseCharStyle)) {
                this.baseCharStyle = format.baseCharStyle;
            }
            if (format.revisions.length > 0) {
                this.removedIds = Revision.cloneRevisions(format.revisions);
            }
            else {
                this.removedIds = format.removedIds.slice();
            }
        }
    };
    WCharacterFormat.prototype.updateUniqueCharacterFormat = function (format) {
        var hash = undefined;
        if (this.uniqueCharacterFormat) {
            hash = this.uniqueCharacterFormat.mergeProperties(format.uniqueCharacterFormat);
            if (this.uniqueCharacterFormat.referenceCount === 0) {
                WCharacterFormat.uniqueCharacterFormats.remove(this.uniqueCharacterFormat);
                this.uniqueCharacterFormat = undefined;
            }
        }
        this.uniqueCharacterFormat = new WUniqueFormat(WCharacterFormat.uniqueFormatType);
        if (isNullOrUndefined(hash)) {
            hash = this.uniqueCharacterFormat.mergeProperties(format.uniqueCharacterFormat);
        }
        this.uniqueCharacterFormat = WCharacterFormat.uniqueCharacterFormats.addUniqueFormat(hash, WCharacterFormat.uniqueFormatType);
    };
    WCharacterFormat.clear = function () {
        this.uniqueCharacterFormats.clear();
    };
    WCharacterFormat.prototype.applyStyle = function (baseCharStyle) {
        this.baseCharStyle = baseCharStyle;
    };
    WCharacterFormat.prototype.getValue = function (property) {
        return this.hasValue(property) ? this.getPropertyValue(property) : undefined;
    };
    WCharacterFormat.prototype.mergeFormat = function (format) {
        if (isNullOrUndefined(this.getValue('bold'))) {
            this.bold = format.getValue('bold');
        }
        if (isNullOrUndefined(this.getValue('italic'))) {
            this.italic = format.getValue('italic');
        }
        if (isNullOrUndefined(this.getValue('fontSize'))) {
            this.fontSize = format.getValue('fontSize');
        }
        if (isNullOrUndefined(this.getValue('fontFamily'))) {
            this.fontFamily = format.getValue('fontFamily');
        }
        if (isNullOrUndefined(this.getValue('underline'))) {
            this.underline = format.getValue('underline');
        }
        if (isNullOrUndefined(this.getValue('strikethrough'))) {
            this.strikethrough = format.getValue('strikethrough');
        }
        if (isNullOrUndefined(this.getValue('baselineAlignment'))) {
            this.baselineAlignment = format.getValue('baselineAlignment');
        }
        if (isNullOrUndefined(this.getValue('highlightColor'))) {
            this.highlightColor = format.getValue('highlightColor');
        }
        if (isNullOrUndefined(this.getValue('fontColor'))) {
            this.fontColor = format.getValue('fontColor');
        }
        if (isNullOrUndefined(this.getValue('bidi'))) {
            this.bidi = format.getValue('bidi');
        }
        if (isNullOrUndefined(this.getValue('bdo'))) {
            this.bdo = format.getValue('bdo');
        }
        if (isNullOrUndefined(this.getValue('allCaps'))) {
            this.allCaps = format.getValue('allCaps');
        }
    };
    WCharacterFormat.uniqueCharacterFormats = new WUniqueFormats();
    WCharacterFormat.uniqueFormatType = 2;
    return WCharacterFormat;
}());
export { WCharacterFormat };
