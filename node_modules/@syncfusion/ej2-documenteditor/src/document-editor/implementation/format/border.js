import { Dictionary } from '../../base/dictionary';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var WBorder = /** @class */ (function () {
    function WBorder(node) {
        this.uniqueBorderFormat = undefined;
        this.ownerBase = undefined;
        this.ownerBase = node;
    }
    Object.defineProperty(WBorder.prototype, "color", {
        get: function () {
            return this.getPropertyValue('color');
        },
        set: function (value) {
            this.setPropertyValue('color', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "lineStyle", {
        get: function () {
            return this.getPropertyValue('lineStyle');
        },
        set: function (value) {
            this.setPropertyValue('lineStyle', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "lineWidth", {
        get: function () {
            return this.getPropertyValue('lineWidth');
        },
        set: function (value) {
            this.setPropertyValue('lineWidth', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "shadow", {
        get: function () {
            return this.getPropertyValue('shadow');
        },
        set: function (value) {
            this.setPropertyValue('shadow', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "space", {
        get: function () {
            return this.getPropertyValue('space');
        },
        set: function (value) {
            this.setPropertyValue('space', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "hasNoneStyle", {
        get: function () {
            return this.getPropertyValue('hasNoneStyle');
        },
        set: function (value) {
            this.setPropertyValue('hasNoneStyle', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WBorder.prototype, "isBorderDefined", {
        get: function () {
            return (this.lineStyle !== 'None' ||
                (this.hasNoneStyle && this.hasValue('hasNoneStyle')));
        },
        enumerable: true,
        configurable: true
    });
    /* eslint-disable */
    WBorder.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WBorder.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueBorderFormat)) {
                var propValue = this.uniqueBorderFormat.propertiesHash.get(propertyType);
                if (!isNullOrUndefined(propValue)) {
                    return propValue;
                }
            }
        }
        return WBorder.getPropertyDefaultValue(property);
    };
    WBorder.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WBorder.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueBorderFormat)) {
            this.initializeUniqueBorder(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueBorderFormat.uniqueFormatType, property);
            if (this.uniqueBorderFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueBorderFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueBorderFormat = WBorder.uniqueBorderFormats.updateUniqueFormat(this.uniqueBorderFormat, property, value);
        }
    };
    WBorder.prototype.initializeUniqueBorder = function (property, propValue) {
        var uniqueBorderFormatTemp = new Dictionary();
        this.addUniqueBorderFormat('color', property, propValue, uniqueBorderFormatTemp);
        this.addUniqueBorderFormat('lineStyle', property, propValue, uniqueBorderFormatTemp);
        this.addUniqueBorderFormat('lineWidth', property, propValue, uniqueBorderFormatTemp);
        this.addUniqueBorderFormat('shadow', property, propValue, uniqueBorderFormatTemp);
        this.addUniqueBorderFormat('space', property, propValue, uniqueBorderFormatTemp);
        this.addUniqueBorderFormat('hasNoneStyle', property, propValue, uniqueBorderFormatTemp);
        this.uniqueBorderFormat = WBorder.uniqueBorderFormats.addUniqueFormat(uniqueBorderFormatTemp, WBorder.uniqueFormatType);
    };
    WBorder.prototype.addUniqueBorderFormat = function (property, modifiedProperty, propValue, uniqueBorderFormatTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WBorder.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueBorderFormatTemp.add(propertyType, propValue);
        }
    };
    WBorder.getPropertyDefaultValue = function (property) {
        var value = undefined;
        /* eslint-enable */
        switch (property) {
            case 'color':
                value = '#000000';
                break;
            case 'lineStyle':
                value = 'None';
                break;
            case 'lineWidth':
                value = 0;
                break;
            case 'shadow':
                value = false;
                break;
            case 'space':
                value = 0;
                break;
            case 'hasNoneStyle':
                value = false;
                break;
        }
        return value;
    };
    WBorder.prototype.getLineWidth = function () {
        /* eslint-disable */
        switch (this.lineStyle) {
            case 'None':
            case 'Cleared':
                return 0;
            case 'Triple':
            case 'Double':
            case 'ThinThickSmallGap':
            case 'ThickThinSmallGap':
            case 'ThinThickThinSmallGap':
            case 'ThinThickMediumGap':
            case 'ThickThinMediumGap':
            case 'ThinThickThinMediumGap':
            case 'ThinThickLargeGap':
            case 'ThickThinLargeGap':
            case 'ThinThickThinLargeGap':
            case 'Emboss3D':
            case 'Engrave3D':
                {
                    var lineArray = this.getBorderLineWidthArray(this.lineStyle, this.lineWidth);
                    var width = 0;
                    for (var i = 0; i < lineArray.length; i++) {
                        width += lineArray[i];
                    }
                    return width;
                }
            case 'Single':
            case 'DashLargeGap':
            case 'DashSmallGap':
            case 'Dot':
            case 'DashDot':
            case 'DashDotDot':
            case 'Thick':
                return this.lineWidth;
            case 'SingleWavy':
                return (this.lineWidth === 1.5 ? 3 : 2.5); //Double wave border only draw with the fixed width
            case 'DoubleWavy':
                return (6.75); //Double wave border only draw with the fixed width
            case 'DashDotStroked':
            case 'Outset':
                return this.lineWidth;
        }
        return this.lineWidth;
        /* eslint-enable */
    };
    WBorder.prototype.getBorderLineWidthArray = function (lineStyle, lineWidth) {
        var borderLineArray = [lineWidth];
        switch (lineStyle) {
            case 'Double':
                borderLineArray = [1, 1, 1];
                break;
            case 'ThinThickSmallGap':
                borderLineArray = [1, -0.75, -0.75];
                break;
            case 'ThickThinSmallGap':
                borderLineArray = [-0.75, -0.75, 1];
                break;
            case 'ThinThickMediumGap':
                borderLineArray = [1, 0.5, 0.5];
                break;
            case 'ThickThinMediumGap':
                borderLineArray = [0.5, 0.5, 1];
                break;
            case 'ThinThickLargeGap':
                borderLineArray = [-1.5, 1, -0.75];
                break;
            case 'ThickThinLargeGap':
                borderLineArray = [-0.75, 1, -1.5];
                break;
            case 'Triple':
                borderLineArray = [1, 1, 1, 1, 1];
                break;
            case 'ThinThickThinSmallGap':
                borderLineArray = [-0.75, -0.75, 1, -0.75, -0.75];
                break;
            case 'ThinThickThinMediumGap':
                borderLineArray = [0.5, 0.5, 1, 0.5, 0.5];
                break;
            case 'ThinThickThinLargeGap':
                borderLineArray = [-0.75, 1, -1.5, 1, -0.75];
                break;
            case 'Emboss3D':
            case 'Engrave3D':
                borderLineArray = [0.25, 0, 1, 0, 0.25];
                break;
        }
        if (borderLineArray.length === 1) {
            return [lineWidth];
        }
        for (var i = 0; i < borderLineArray.length; i++) {
            if (borderLineArray[i] >= 0) {
                borderLineArray[i] = borderLineArray[i] * lineWidth;
            }
            else {
                borderLineArray[i] = Math.abs(borderLineArray[i]);
            }
        }
        return borderLineArray;
    };
    WBorder.prototype.getBorderWeight = function () {
        var weight = 0;
        var numberOfLines = this.getNumberOfLines();
        var borderNumber = this.getBorderNumber();
        switch (this.lineStyle) {
            case 'Single':
            case 'DashSmallGap':
            case 'DashDot':
            case 'DashDotDot':
            case 'Double':
            case 'Triple':
            case 'ThinThickSmallGap':
            case 'ThickThinSmallGap':
            case 'ThinThickThinSmallGap':
            case 'ThinThickMediumGap':
            case 'ThickThinMediumGap':
            case 'ThinThickThinMediumGap':
            case 'ThinThickLargeGap':
            case 'ThickThinLargeGap':
            case 'ThinThickThinLargeGap':
            case 'SingleWavy':
            case 'DoubleWavy':
            case 'DashDotStroked':
            case 'Emboss3D':
            case 'Engrave3D':
            case 'Outset':
            case 'Inset':
            case 'Thick':
                weight = numberOfLines * borderNumber;
                break;
            case 'Dot':
            case 'DashLargeGap':
                weight = 1;
                break;
        }
        return weight;
    };
    WBorder.prototype.getBorderNumber = function () {
        var borderNumber = 0;
        switch (this.lineStyle) {
            case 'Single':
                borderNumber = 1;
                break;
            case 'Thick':
                borderNumber = 2;
                break;
            case 'Double':
                borderNumber = 3;
                break;
            case 'Dot':
                borderNumber = 4;
                break;
            case 'DashLargeGap': //dashed.
                borderNumber = 5;
                break;
            case 'DashDot':
                borderNumber = 6;
                break;
            case 'DashDotDot':
                borderNumber = 7;
                break;
            case 'Triple':
                borderNumber = 8;
                break;
            case 'ThinThickSmallGap':
                borderNumber = 9;
                break;
            case 'ThickThinSmallGap':
                borderNumber = 10;
                break;
            case 'ThinThickThinSmallGap':
                borderNumber = 11;
                break;
            case 'ThinThickMediumGap':
                borderNumber = 12;
                break;
            case 'ThickThinMediumGap':
                borderNumber = 13;
                break;
            case 'ThinThickThinMediumGap':
                borderNumber = 14;
                break;
            case 'ThinThickLargeGap':
                borderNumber = 15;
                break;
            case 'ThickThinLargeGap':
                borderNumber = 16;
                break;
            case 'ThinThickThinLargeGap':
                borderNumber = 17;
                break;
            case 'SingleWavy': //wave.
                borderNumber = 18;
                break;
            case 'DoubleWavy':
                borderNumber = 19;
                break;
            case 'DashSmallGap':
                borderNumber = 20;
                break;
            case 'DashDotStroked':
                borderNumber = 21;
                break;
            case 'Emboss3D':
                borderNumber = 22;
                break;
            case 'Engrave3D':
                borderNumber = 23;
                break;
            case 'Outset':
                borderNumber = 24;
                break;
            case 'Inset':
                borderNumber = 25;
                break;
        }
        return borderNumber;
    };
    WBorder.prototype.getNumberOfLines = function () {
        //ToDo: Need to analyze more on this.
        var value = 0;
        switch (this.lineStyle) {
            case 'Single':
            case 'Dot':
            case 'DashSmallGap':
            case 'DashLargeGap':
            case 'DashDot':
            case 'DashDotDot':
                value = 1;
                break;
            case 'Double':
                value = 3;
                break;
            case 'Triple':
                value = 5;
                break;
            case 'ThinThickSmallGap':
                value = 3;
                break;
            case 'ThickThinSmallGap':
                value = 3;
                break;
            case 'ThinThickThinSmallGap':
                value = 5;
                break;
            case 'ThinThickMediumGap':
                value = 3;
                break;
            case 'ThickThinMediumGap':
                value = 3;
                break;
            case 'ThinThickThinMediumGap':
                value = 5;
                break;
            case 'ThinThickLargeGap':
                value = 3;
                break;
            case 'ThickThinLargeGap':
                value = 3;
                break;
            case 'ThinThickThinLargeGap':
                value = 5;
                break;
            case 'SingleWavy':
                value = 1;
                break;
            case 'DoubleWavy':
                value = 2;
                break;
            case 'DashDotStroked':
                value = 1;
                break;
            case 'Emboss3D':
            case 'Engrave3D':
                value = 3;
                break;
            case 'Outset':
            case 'Inset':
            case 'Thick':
                value = 1;
                break;
        }
        return value;
    };
    WBorder.prototype.getPrecedence = function () {
        var value = 0;
        switch (this.lineStyle) {
            case 'Single':
                value = 1;
                break;
            case 'Thick':
                value = 2;
                break;
            case 'Double':
                value = 3;
                break;
            case 'Dot':
                value = 4;
                break;
            case 'DashLargeGap': //dashed.
                value = 5;
                break;
            case 'DashDot':
                value = 6;
                break;
            case 'DashDotDot':
                value = 7;
                break;
            case 'Triple':
                value = 8;
                break;
            case 'ThinThickSmallGap':
                value = 9;
                break;
            case 'ThickThinSmallGap':
                value = 10;
                break;
            case 'ThinThickThinSmallGap':
                value = 11;
                break;
            case 'ThinThickMediumGap':
                value = 12;
                break;
            case 'ThickThinMediumGap':
                value = 13;
                break;
            case 'ThinThickThinMediumGap':
                value = 14;
                break;
            case 'ThinThickLargeGap':
                value = 15;
                break;
            case 'ThickThinLargeGap':
                value = 16;
                break;
            case 'ThinThickThinLargeGap':
                value = 17;
                break;
            case 'SingleWavy': //wave.
                value = 18;
                break;
            case 'DoubleWavy':
                value = 19;
                break;
            case 'DashSmallGap':
                value = 20;
                break;
            case 'DashDotStroked':
                value = 21;
                break;
            case 'Emboss3D':
                value = 22;
                break;
            case 'Engrave3D':
                value = 23;
                break;
            case 'Outset':
                value = 24;
                break;
            case 'Inset':
                value = 25;
                break;
        }
        return value;
    };
    WBorder.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueBorderFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueBorderFormat.uniqueFormatType, property);
            return this.uniqueBorderFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WBorder.prototype.cloneFormat = function () {
        var border = new WBorder(undefined);
        border.color = this.color;
        border.lineStyle = this.lineStyle;
        border.lineWidth = this.lineWidth;
        border.shadow = this.shadow;
        border.space = this.space;
        return border;
    };
    WBorder.prototype.destroy = function () {
        if (!isNullOrUndefined(this.uniqueBorderFormat)) {
            WBorder.uniqueBorderFormats.remove(this.uniqueBorderFormat);
        }
        this.uniqueBorderFormat = undefined;
    };
    WBorder.prototype.copyFormat = function (border) {
        if (!isNullOrUndefined(border) && !isNullOrUndefined(border.uniqueBorderFormat)) {
            if (border.hasValue('color')) {
                this.color = border.color;
            }
            if (border.hasValue('lineStyle')) {
                this.lineStyle = border.lineStyle;
            }
            if (border.hasValue('lineWidth')) {
                this.lineWidth = border.lineWidth;
            }
            if (border.hasValue('shadow')) {
                this.shadow = border.shadow;
            }
            if (border.hasValue('space')) {
                this.space = border.space;
            }
        }
    };
    WBorder.clear = function () {
        this.uniqueBorderFormats.clear();
    };
    WBorder.uniqueBorderFormats = new WUniqueFormats();
    WBorder.uniqueFormatType = 1;
    return WBorder;
}());
export { WBorder };
