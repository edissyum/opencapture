import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { WUniqueFormat } from '../../base/unique-format';
import { WUniqueFormats } from '../../base/unique-formats';
import { Dictionary } from '../../base/dictionary';
/* eslint-disable */
/**
 * @private
 */
var WShading = /** @class */ (function () {
    function WShading(node) {
        this.uniqueShadingFormat = undefined;
        this.ownerBase = undefined;
        this.ownerBase = node;
    }
    Object.defineProperty(WShading.prototype, "backgroundColor", {
        get: function () {
            return this.getPropertyValue('backgroundColor');
        },
        set: function (value) {
            this.setPropertyValue('backgroundColor', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WShading.prototype, "foregroundColor", {
        get: function () {
            return this.getPropertyValue('foregroundColor');
        },
        set: function (value) {
            this.setPropertyValue('foregroundColor', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WShading.prototype, "textureStyle", {
        get: function () {
            return this.getPropertyValue('textureStyle');
        },
        set: function (value) {
            this.setPropertyValue('textureStyle', value);
        },
        enumerable: true,
        configurable: true
    });
    WShading.prototype.getPropertyValue = function (property) {
        var hasValue = this.hasValue(property);
        if (hasValue) {
            var propertyType = WUniqueFormat.getPropertyType(WShading.uniqueFormatType, property);
            if (!isNullOrUndefined(this.uniqueShadingFormat) && this.uniqueShadingFormat.propertiesHash.containsKey(propertyType)) {
                return this.uniqueShadingFormat.propertiesHash.get(propertyType);
            }
        }
        return WShading.getPropertyDefaultValue(property);
    };
    WShading.prototype.setPropertyValue = function (property, value) {
        if (isNullOrUndefined(value) || value === '') {
            value = WShading.getPropertyDefaultValue(property);
        }
        if (isNullOrUndefined(this.uniqueShadingFormat)) {
            this.initializeUniqueShading(property, value);
        }
        else {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueShadingFormat.uniqueFormatType, property);
            if (this.uniqueShadingFormat.propertiesHash.containsKey(propertyType) &&
                this.uniqueShadingFormat.propertiesHash.get(propertyType) === value) {
                //Do nothing, since no change in property value and return
                return;
            }
            this.uniqueShadingFormat = WShading.uniqueShadingFormats.updateUniqueFormat(this.uniqueShadingFormat, property, value);
        }
    };
    WShading.getPropertyDefaultValue = function (property) {
        var value = undefined;
        switch (property) {
            case 'backgroundColor':
                value = 'empty';
                break;
            case 'foregroundColor':
                value = 'empty';
                break;
            case 'textureStyle':
                value = 'TextureNone';
                break;
        }
        return value;
    };
    WShading.prototype.initializeUniqueShading = function (property, propValue) {
        var uniqueShadingTemp = new Dictionary();
        this.addUniqueShading('backgroundColor', property, propValue, uniqueShadingTemp);
        this.addUniqueShading('foregroundColor', property, propValue, uniqueShadingTemp);
        this.addUniqueShading('textureStyle', property, propValue, uniqueShadingTemp);
        this.uniqueShadingFormat = WShading.uniqueShadingFormats.addUniqueFormat(uniqueShadingTemp, WShading.uniqueFormatType);
    };
    WShading.prototype.addUniqueShading = function (property, modifiedProperty, propValue, uniqueShadingTemp) {
        var propertyType = WUniqueFormat.getPropertyType(WShading.uniqueFormatType, property);
        if (property === modifiedProperty) {
            uniqueShadingTemp.add(propertyType, propValue);
        }
        else {
            uniqueShadingTemp.add(propertyType, WShading.getPropertyDefaultValue(property));
        }
    };
    WShading.prototype.destroy = function () {
        if (!isNullOrUndefined(this.uniqueShadingFormat)) {
            WShading.uniqueShadingFormats.remove(this.uniqueShadingFormat);
        }
        this.uniqueShadingFormat = undefined;
    };
    WShading.prototype.cloneFormat = function () {
        var shading = new WShading(undefined);
        shading.backgroundColor = this.backgroundColor;
        shading.foregroundColor = this.foregroundColor;
        shading.textureStyle = this.textureStyle;
        return shading;
    };
    WShading.prototype.copyFormat = function (shading) {
        if (!isNullOrUndefined(shading) && !isNullOrUndefined(shading.uniqueShadingFormat)) {
            this.backgroundColor = shading.backgroundColor;
            this.foregroundColor = shading.foregroundColor;
            this.textureStyle = shading.textureStyle;
        }
    };
    WShading.prototype.hasValue = function (property) {
        if (!isNullOrUndefined(this.uniqueShadingFormat)) {
            var propertyType = WUniqueFormat.getPropertyType(this.uniqueShadingFormat.uniqueFormatType, property);
            return this.uniqueShadingFormat.propertiesHash.containsKey(propertyType);
        }
        return false;
    };
    WShading.clear = function () {
        this.uniqueShadingFormats.clear();
    };
    WShading.uniqueShadingFormats = new WUniqueFormats();
    WShading.uniqueFormatType = 5;
    return WShading;
}());
export { WShading };
