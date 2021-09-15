/* eslint-disable */
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { WUniqueFormat } from './unique-format';
/**
 * @private
 */
var WUniqueFormats = /** @class */ (function () {
    function WUniqueFormats() {
        this.items = [];
    }
    /**
     * @private
     */
    WUniqueFormats.prototype.addUniqueFormat = function (format, type) {
        var matchedFormat = undefined;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].isEqual(format, undefined, undefined)) {
                matchedFormat = this.items[i];
                break;
            }
        }
        if (isNullOrUndefined(matchedFormat)) {
            matchedFormat = new WUniqueFormat(type);
            matchedFormat.propertiesHash = format;
            matchedFormat.referenceCount = 1;
            this.items.push(matchedFormat);
        }
        else {
            matchedFormat.referenceCount++;
        }
        return matchedFormat;
    };
    /**
     * @private
     */
    WUniqueFormats.prototype.updateUniqueFormat = function (uniqueFormat, property, value) {
        var matchedFormat = undefined;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].isEqual(uniqueFormat.propertiesHash, property, value)) {
                matchedFormat = this.items[i];
                break;
            }
        }
        if (isNullOrUndefined(matchedFormat)) {
            matchedFormat = new WUniqueFormat(uniqueFormat.uniqueFormatType);
            matchedFormat.cloneItems(uniqueFormat, property, value, uniqueFormat.uniqueFormatType);
            matchedFormat.referenceCount = 1;
            this.items.push(matchedFormat);
        }
        else {
            matchedFormat.referenceCount++;
        }
        this.remove(uniqueFormat);
        uniqueFormat = undefined;
        return matchedFormat;
    };
    /**
     * @private
     */
    WUniqueFormats.prototype.remove = function (uniqueFormat) {
        uniqueFormat.referenceCount--;
        if (uniqueFormat.referenceCount <= 0) {
            this.items.splice(this.items.indexOf(uniqueFormat), 1);
            uniqueFormat.destroy();
            uniqueFormat = undefined;
        }
    };
    /**
     * @private
     */
    WUniqueFormats.prototype.clear = function () {
        if (isNullOrUndefined(this.items)) {
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].destroy();
            }
        }
        this.items = [];
    };
    /**
     * @private
     */
    WUniqueFormats.prototype.destroy = function () {
        this.clear();
        this.items = undefined;
    };
    return WUniqueFormats;
}());
export { WUniqueFormats };
