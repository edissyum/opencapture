/* eslint-disable */
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * @private
 */
var Dictionary = /** @class */ (function () {
    function Dictionary() {
        this.keysInternal = [];
        this.valuesInternal = [];
    }
    Object.defineProperty(Dictionary.prototype, "length", {
        /**
         * @private
         */
        get: function () {
            return this.keysInternal.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dictionary.prototype, "keys", {
        /**
         * @private
         */
        get: function () {
            return this.keysInternal;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * @private
     */
    Dictionary.prototype.add = function (key, value) {
        if (isNullOrUndefined(key)) {
            throw new ReferenceError('Provided key or value is not valid.');
        }
        var index = this.keysInternal.indexOf(key);
        // if (index < 0 || index > this.keysInternal.length - 1) {
        if (index < 0) {
            this.keysInternal.push(key);
            this.valuesInternal.push(value);
        }
        return 1;
        // else {
        //     throw new RangeError('An item with the same key has already been added.');
        // }
    };
    /**
     * @private
     */
    Dictionary.prototype.get = function (key) {
        if (isNullOrUndefined(key)) {
            throw new ReferenceError('Provided key is not valid.');
        }
        var index = this.keysInternal.indexOf(key);
        if (index < 0 || index > this.keysInternal.length - 1) {
            return undefined;
            //throw new RangeError('No item with the specified key has been added.');
        }
        else {
            return this.valuesInternal[index];
        }
    };
    /**
     * @private
     */
    Dictionary.prototype.set = function (key, value) {
        if (isNullOrUndefined(key)) {
            throw new ReferenceError('Provided key is not valid.');
        }
        var index = this.keysInternal.indexOf(key);
        if (index < 0 || index > this.keysInternal.length - 1) {
            throw new RangeError('No item with the specified key has been added.');
        }
        else {
            this.valuesInternal[index] = value;
        }
    };
    /**
     * @private
     */
    Dictionary.prototype.remove = function (key) {
        if (isNullOrUndefined(key)) {
            throw new ReferenceError('Provided key is not valid.');
        }
        var index = this.keysInternal.indexOf(key);
        if (index < 0 || index > this.keysInternal.length - 1) {
            throw new RangeError('No item with the specified key has been added.');
        }
        else {
            this.keysInternal.splice(index, 1);
            this.valuesInternal.splice(index, 1);
            return true;
        }
    };
    /**
     * @private
     */
    Dictionary.prototype.containsKey = function (key) {
        if (isNullOrUndefined(key)) {
            throw new ReferenceError('Provided key is not valid.');
        }
        var index = this.keysInternal.indexOf(key);
        if (index < 0 || index > this.keysInternal.length - 1) {
            return false;
        }
        return true;
    };
    /**
     * @private
     */
    Dictionary.prototype.clear = function () {
        this.keysInternal = [];
        this.valuesInternal = [];
    };
    /**
     * @private
     */
    Dictionary.prototype.destroy = function () {
        this.clear();
        this.keysInternal = undefined;
        this.valuesInternal = undefined;
    };
    return Dictionary;
}());
export { Dictionary };
