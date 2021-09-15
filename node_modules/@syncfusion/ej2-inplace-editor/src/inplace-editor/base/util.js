import { isNullOrUndefined as isNOU, Internationalization, isBlazor } from '@syncfusion/ej2-base';
/**
 * Exports util methods used by In-place editor.
 */
var intl = new Internationalization();
/**
 * @param {string} type - specifies the string type
 * @param {valueType} val - specifies the value type
 * @param {modelType} model - specifies the model type
 * @returns {string} - returns the string
 */
export function parseValue(type, val, model) {
    if (isNOU(val) || val === '') {
        return '';
    }
    var result;
    var tempFormat;
    switch (type) {
        case 'Color': {
            var hex = val;
            result = (hex.length > 7) ? hex.slice(0, -2) : hex;
            break;
        }
        case 'Date':
            tempFormat = model.format;
            result = intl.formatDate(val, { format: tempFormat, type: type, skeleton: isBlazor() ? 'd' : 'yMd' });
            break;
        case 'DateRange': {
            tempFormat = model.format;
            var date = val;
            result = intl.formatDate(date[0], { format: tempFormat, type: type, skeleton: isBlazor() ? 'd' : 'yMd' }) + ' - '
                + intl.formatDate(date[1], { format: tempFormat, type: type, skeleton: isBlazor() ? 'd' : 'yMd' });
            break;
        }
        case 'DateTime':
            tempFormat = model.format;
            if (isNOU(tempFormat) || tempFormat === '') {
                result = intl.formatDate(val, { format: tempFormat, type: type, skeleton: isBlazor() ? 'd' : 'yMd' }) + ' '
                    + intl.formatDate(val, { format: tempFormat, type: type, skeleton: isBlazor() ? 't' : 'hm' });
            }
            else {
                result = intl.formatDate(val, { format: tempFormat, type: type, skeleton: isBlazor() ? 'd' : 'yMd' });
            }
            break;
        case 'Time':
            tempFormat = model.format;
            result = intl.formatDate(val, { format: tempFormat, type: type, skeleton: isBlazor() ? 't' : 'hm' });
            break;
        case 'Numeric': {
            tempFormat = isNOU(model.format) ? 'n2' :
                model.format;
            var tempVal = isNOU(val) ? null : (typeof (val) === 'number' ? val : intl.parseNumber(val));
            result = intl.formatNumber(tempVal, { format: tempFormat });
            break;
        }
        default:
            result = val.toString();
            break;
    }
    return result;
}
/**
 *
 * @param {string} type - specifies the string value
 * @param {valueType} val - specifies the value type
 * @returns {valueType} - returns the value type
 */
export function getCompValue(type, val) {
    if (isNOU(val) || val === '') {
        return val;
    }
    if ((type === 'Date' || type === 'Time' || type === 'DateTime') && typeof (val) === 'string') {
        val = new Date(val);
    }
    else if (type === 'DateRange') {
        if (typeof (val) === 'object' && typeof (val[0]) === 'string') {
            val = [new Date(val[0]), new Date(val[1])];
        }
        else if (typeof (val) === 'string') {
            var temp = val.split('-');
            val = [new Date(temp[0]), new Date(temp[1])];
        }
    }
    return val;
}
/**
 * @param {string} value - specifies the string value
 * @returns {string} - returns the string
 * @hidden
 */
export function encode(value) {
    var data = [];
    for (var i = value.length - 1; i >= 0; i--) {
        data.unshift(["&#", value[i].charCodeAt(0), ";"].join(""));
    }
    return data.join("");
}
