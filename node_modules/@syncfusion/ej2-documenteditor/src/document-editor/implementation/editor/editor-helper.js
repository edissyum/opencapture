import { isNullOrUndefined, Internationalization } from '@syncfusion/ej2-base';
import { ElementBox } from '../viewer/page';
import { FieldElementBox } from '../viewer/page';
/**
 * @private
 */
var HelperMethods = /** @class */ (function () {
    function HelperMethods() {
    }
    /**
     * Inserts text at specified index in string.
     *
     * @private
     * @param {string} spanText - Specifies the span text.
     * @param {number} index - Specifies the index
     * @param {string} text - Specifies the text
     * @returns {string} - Returns modified string
     */
    HelperMethods.insert = function (spanText, index, text) {
        if (index >= 0) {
            return [spanText.slice(0, index) + text + spanText.slice(index)].join('');
        }
        else {
            return text + this;
        }
    };
    /**
     * Removes text from specified index in string.
     *
     * @private
     * @param {string} text - Specifies the text
     * @param {number} index - Specifies the index
     * @returns {string} - Returns modified string
     */
    HelperMethods.remove = function (text, index) {
        if (index === 0) {
            return text.substring(index + 1, text.length);
        }
        else {
            return text.substring(0, index) + text.substring(index + 1, text.length);
        }
    };
    /* eslint-disable @typescript-eslint/no-explicit-any */
    HelperMethods.indexOfAny = function (text, wordSplitCharacter) {
        var index = undefined;
        for (var j = 0; j < wordSplitCharacter.length; j++) {
            var temp = text.indexOf(wordSplitCharacter[j]);
            if (temp !== -1 && isNullOrUndefined(index)) {
                index = temp;
            }
            else if (temp !== -1 && temp < index) {
                index = temp;
            }
        }
        return isNullOrUndefined(index) ? -1 : index;
    };
    HelperMethods.lastIndexOfAny = function (text, wordSplitCharacter) {
        for (var i = text.length - 1; i >= 0; i--) {
            for (var j = 0; j <= wordSplitCharacter.length - 1; j++) {
                if (text[i] === wordSplitCharacter[j]) {
                    return i;
                }
            }
        }
        return -1;
    };
    HelperMethods.addCssStyle = function (css) {
        var style = document.createElement('style');
        if (style.style.cssText) {
            style.style.cssText = css;
        }
        else {
            style.appendChild(document.createTextNode(css));
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    };
    HelperMethods.getHighlightColorCode = function (highlightColor) {
        var color = '#ffffff';
        switch (highlightColor) {
            case 'Yellow':
                color = '#ffff00';
                break;
            case 'BrightGreen':
                color = '#00ff00';
                break;
            case 'Turquoise':
                color = '#00ffff';
                break;
            case 'Pink':
                color = '#ff00ff';
                break;
            case 'Blue':
                color = '#0000ff';
                break;
            case 'Red':
                color = '#ff0000';
                break;
            case 'DarkBlue':
                color = '#000080';
                break;
            case 'Teal':
                color = '#008080';
                break;
            case 'Green':
                color = '#008000';
                break;
            case 'Violet':
                color = '#800080';
                break;
            case 'DarkRed':
                color = '#800000';
                break;
            case 'DarkYellow':
                color = '#808000';
                break;
            case 'Gray50':
                color = '#808080';
                break;
            case 'Gray25':
                color = '#c0c0c0';
                break;
            case 'Black':
                color = '#000000';
                break;
        }
        return color;
    };
    HelperMethods.isVeryDark = function (backColor) {
        var backgroundColor = backColor.substring(1);
        var r = parseInt(backgroundColor.substr(0, 2), 16);
        var g = parseInt(backgroundColor.substr(2, 2), 16);
        var b = parseInt(backgroundColor.substr(4, 2), 16);
        var contrast = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return contrast <= 60;
    };
    HelperMethods.getColor = function (color) {
        if (color.length > 0) {
            if (color[0] === '#') {
                if (color.length > 7) {
                    return color.substr(0, 7);
                }
            }
        }
        return color;
    };
    HelperMethods.convertPointToPixel = function (point) {
        var pixel = HelperMethods.round((point * 96 / 72), 5);
        return pixel;
    };
    HelperMethods.convertPixelToPoint = function (pixel) {
        var point = HelperMethods.round((pixel * 72 / 96), 5);
        return point;
    };
    HelperMethods.isLinkedFieldCharacter = function (inline) {
        if (inline instanceof FieldElementBox && inline.fieldType === 0) {
            return !isNullOrUndefined(inline.fieldEnd);
        }
        else if (inline instanceof FieldElementBox && inline.fieldType === 2) {
            return !isNullOrUndefined(inline.fieldBegin) && !isNullOrUndefined(inline.fieldEnd);
        }
        else {
            return !isNullOrUndefined(inline.fieldBegin);
        }
    };
    /**
     * Removes white space in a string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    HelperMethods.removeSpace = function (text) {
        if (!isNullOrUndefined(text) && text.length !== 0) {
            for (var i = 0; i < text.length; i++) {
                if (text.charAt(i) === ' ') {
                    //replace the space by empty string in string
                    text = text.replace(' ', '');
                }
            }
        }
        return text;
    };
    /**
     * Trims white space at start of the string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    HelperMethods.trimStart = function (text) {
        var i = 0;
        for (i; i < text.length; i++) {
            if (text[i] !== ' ') {
                break;
            }
        }
        return text.substring(i, text.length);
    };
    /**
     * Trims white space at end of the string.
     *
     * @private
     * @param {string} text - Specifies text to trim.
     * @returns {string} - Returns modified text.
     */
    HelperMethods.trimEnd = function (text) {
        var i = text.length - 1;
        for (i; i >= 0; i--) {
            if (text[i] !== ' ') {
                break;
            }
        }
        return text.substring(0, i + 1);
    };
    /**
     * Checks whether string ends with whitespace.
     *
     * @private
     * @param {string} text - Specifies the text.
     * @returns {boolean} - Returns true if text ends with specified text.
     */
    HelperMethods.endsWith = function (text) {
        if (!isNullOrUndefined(text) && text.length !== 0) {
            return text[text.length - 1] === ' ';
        }
        return false;
    };
    HelperMethods.addSpace = function (length) {
        var str = '';
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                str += ' ';
            }
        }
        return str;
    };
    /* eslint-disable */
    HelperMethods.writeCharacterFormat = function (characterFormat, isInline, format) {
        characterFormat.bold = isInline ? format.bold : format.getValue('bold');
        characterFormat.italic = isInline ? format.italic : format.getValue('italic');
        characterFormat.fontSize = isInline ? this.toWriteInline(format, 'fontSize') : format.getValue('fontSize');
        characterFormat.fontFamily = isInline ? this.toWriteInline(format, 'fontFamily') : format.getValue('fontFamily');
        characterFormat.underline = isInline ? format.underline : format.getValue('underline');
        characterFormat.strikethrough = isInline ? format.strikethrough : format.getValue('strikethrough');
        characterFormat.baselineAlignment = isInline ? format.baselineAlignment : format.getValue('baselineAlignment');
        characterFormat.highlightColor = isInline ? format.highlightColor : format.getValue('highlightColor');
        characterFormat.fontColor = isInline ? this.toWriteInline(format, 'fontColor') : format.getValue('fontColor');
        characterFormat.styleName = !isNullOrUndefined(format.baseCharStyle) ? format.baseCharStyle.name : undefined;
        characterFormat.bidi = isInline ? format.bidi : format.getValue('bidi');
        characterFormat.bdo = isInline ? format.bdo : format.getValue('bdo');
        characterFormat.boldBidi = isInline ? format.boldBidi : format.getValue('boldBidi');
        characterFormat.italicBidi = isInline ? format.italicBidi : format.getValue('italicBidi');
        characterFormat.fontSizeBidi = isInline ? format.fontSizeBidi : format.getValue('fontSizeBidi');
        characterFormat.fontFamilyBidi = isInline ? format.fontFamilyBidi : format.getValue('fontFamilyBidi');
        characterFormat.allCaps = isInline ? format.allCaps : format.getValue('allCaps');
    };
    HelperMethods.toWriteInline = function (format, propertyName) {
        if (!isNullOrUndefined(format.ownerBase) && (format.ownerBase instanceof ElementBox)) {
            return format.hasValue(propertyName) ? format[propertyName] : format.getValue(propertyName);
        }
        else {
            return format[propertyName];
        }
    };
    /* eslint-enable */
    HelperMethods.round = function (value, decimalDigits) {
        var temp = value;
        for (var i = 0; i < decimalDigits; i++) {
            temp = temp * 10;
        }
        temp = Math.round(temp);
        for (var i = 0; i < decimalDigits; i++) {
            temp = temp / 10;
        }
        return temp;
    };
    HelperMethods.reverseString = function (text) {
        if (!isNullOrUndefined(text) && text !== '') {
            // return a new array
            var splitString = text.split('');
            // reverse the new created array
            var reverseString = splitString.reverse();
            // join all elements of the array into a string
            text = reverseString.join('');
        }
        return text;
    };
    HelperMethods.formatClippedString = function (base64ImageString) {
        var extension = '';
        var formatClippedString = '';
        if (this.startsWith(base64ImageString, 'data:image/bmp;base64,')) {
            extension = '.bmp';
            formatClippedString = base64ImageString.replace('data:image/bmp;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/x-emf;base64,')) {
            extension = '.emf';
            formatClippedString = base64ImageString.replace('data:image/x-emf;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/exif;base64,')) {
            extension = '.exif';
            formatClippedString = base64ImageString.replace('data:image/exif;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/gif;base64,')) {
            extension = '.gif';
            formatClippedString = base64ImageString.replace('data:image/gif;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/icon;base64,')) {
            extension = '.ico';
            formatClippedString = base64ImageString.replace('data:image/icon;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/jpeg;base64,')) {
            extension = '.jpeg';
            formatClippedString = base64ImageString.replace('data:image/jpeg;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/jpg;base64,')) {
            extension = '.jpg';
            formatClippedString = base64ImageString.replace('data:image/jpg;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/png;base64,')) {
            extension = '.png';
            formatClippedString = base64ImageString.replace('data:image/png;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/tiff;base64,')) {
            extension = '.tif';
            formatClippedString = base64ImageString.replace('data:image/tiff;base64,', '');
        }
        else if (this.startsWith(base64ImageString, 'data:image/x-wmf;base64,')) {
            extension = '.wmf';
            formatClippedString = base64ImageString.replace('data:image/x-wmf;base64,', '');
        }
        else {
            extension = '.jpeg';
        }
        return { 'extension': extension, 'formatClippedString': formatClippedString };
    };
    HelperMethods.startsWith = function (sourceString, startString) {
        return startString.length > 0 && sourceString.substring(0, startString.length) === startString;
    };
    HelperMethods.formatText = function (format, value) {
        var text = value;
        switch (format.toLowerCase()) {
            case 'uppercase':
                text = value.toUpperCase();
                break;
            case 'lowercase':
                text = value.toLowerCase();
                break;
            case 'firstlower':
                text = this.lowerFirstChar(value);
                break;
            case 'firstcapital':
                text = this.capitaliseFirst(value, 'FirstCapital');
                break;
            case 'titlecase':
                text = this.capitaliseFirst(value, 'Titlecase');
                break;
        }
        return text;
    };
    HelperMethods.formatNumber = function (format, value) {
        var intl = new Internationalization();
        var dotData = value.split('.');
        value = dotData[0];
        var numberValue = intl.parseNumber(value);
        if (value.toString() === 'NaN') {
            return '';
        }
        if (format === '') {
            format = '0';
        }
        var numberFormat = { format: format };
        return intl.formatNumber(numberValue, numberFormat);
    };
    HelperMethods.formatDate = function (format, value) {
        var intl = new Internationalization();
        var date = new Date(value);
        if (isNaN(date.getDate())) {
            return '';
        }
        if (format === '') {
            return value;
        }
        if (format.indexOf('am/pm') !== -1) {
            format = format.replace(/am\/pm/gi, 'a');
        }
        var dateFormat = { 'format': format };
        return intl.formatDate(date, dateFormat);
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */
    HelperMethods.capitaliseFirst = function (value, type, splitBy) {
        var text = '';
        if (type === 'Titlecase') {
            var valArry = splitBy ? value.split(splitBy) : value.split(' ');
            for (var i = 0; i < valArry.length; i++) {
                /* eslint-disable-next-line max-len */
                text += splitBy ? valArry[i].charAt(0).toUpperCase() + valArry[i].slice(1, valArry[i].length) : this.capitaliseFirstInternal(valArry[i]);
                if (valArry.length >= 0 && !splitBy) {
                    text += ' ';
                }
            }
            if (!splitBy) {
                text = this.capitaliseFirst(text, 'Titlecase', '\r');
            }
        }
        else if (type === 'FirstCapital') {
            text = this.capitaliseFirstInternal(value);
        }
        return text;
    };
    HelperMethods.lowerFirstChar = function (value) {
        return (value.charAt(0).toLowerCase() + value.slice(1, value.length));
    };
    HelperMethods.capitaliseFirstInternal = function (value) {
        return (value.charAt(0).toUpperCase() + value.slice(1, value.length).toLowerCase());
    };
    HelperMethods.getModifiedDate = function (date) {
        var modifiedDate = new Date(date);
        var dateString = modifiedDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
        var time = modifiedDate.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' });
        var dateTime = dateString + ' ' + time;
        return dateTime;
    };
    HelperMethods.getCompatibilityModeValue = function (compatibilityMode) {
        var compatValue;
        switch (compatibilityMode) {
            case 'Word2003':
                compatValue = '11';
                break;
            case 'Word2007':
                compatValue = '12';
                break;
            case 'Word2010':
                compatValue = '14';
                break;
            default:
                compatValue = '15';
                break;
        }
        return compatValue;
    };
    /**
     * @private
     */
    HelperMethods.wordBefore = '\\b';
    /**
     * @private
     */
    HelperMethods.wordAfter = '\\b';
    /**
     * @private
     */
    HelperMethods.wordSplitCharacters = [' ', ',', '.', ':', ';', '<', '>', '=',
        '+', '-', '_', '{', '}', '[', ']', '`', '~', '!', '@', '#', '$', '%', '^', '&',
        '*', '(', ')', '"', '?', '/', '|', '\\', '”', '　', '،', '؟', '؛', '’', '‘'];
    return HelperMethods;
}());
export { HelperMethods };
/**
 * @private
 */
var Point = /** @class */ (function () {
    function Point(xPosition, yPosition) {
        this.xIn = 0;
        this.yIn = 0;
        this.xIn = xPosition;
        this.yIn = yPosition;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this.xIn;
        },
        set: function (value) {
            this.xIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this.yIn;
        },
        set: function (value) {
            this.yIn = value;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.copy = function (point) {
        this.xIn = point.xIn;
        this.yIn = point.yIn;
    };
    /**
     * Destroys the internal objects maintained.
     *
     * @returns {void}
     */
    Point.prototype.destroy = function () {
        this.xIn = undefined;
        this.yIn = undefined;
    };
    return Point;
}());
export { Point };
/**
 * @private
 */
var Base64 = /** @class */ (function () {
    function Base64() {
        this.keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    }
    // public method for encoding
    Base64.prototype.encodeString = function (input) {
        var output = '';
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        input = this.unicodeEncode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
        }
        return output;
    };
    // private method for UTF-8 encoding
    Base64.prototype.unicodeEncode = function (input) {
        var tempInput = input.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < tempInput.length; n++) {
            var c = tempInput.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    Base64.prototype.decodeString = function (input) {
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        var resultIndex = 0;
        /*let dataUrlPrefix: string = 'data:';*/
        input = input.replace(/[^A-Za-z0-9+/=]/g, '');
        var totalLength = input.length * 3 / 4;
        if (input.charAt(input.length - 1) === this.keyStr.charAt(64)) {
            totalLength--;
        }
        if (input.charAt(input.length - 2) === this.keyStr.charAt(64)) {
            totalLength--;
        }
        if (totalLength % 1 !== 0) {
            // totalLength is not an integer, the length does not match a valid
            // base64 content. That can happen if:
            // - the input is not a base64 content
            // - the input is *almost* a base64 content, with a extra chars at the
            // beginning or at the end
            // - the input uses a base64 variant (base64url for example)
            throw new Error('Invalid base64 input, bad content length.');
        }
        var output = new Uint8Array(totalLength | 0);
        while (i < input.length) {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output[resultIndex++] = chr1;
            if (enc3 !== 64) {
                output[resultIndex++] = chr2;
            }
            if (enc4 !== 64) {
                output[resultIndex++] = chr3;
            }
        }
        return output;
    };
    return Base64;
}());
export { Base64 };
/**
 * @private
 */
var WrapPosition = /** @class */ (function () {
    function WrapPosition(x, width) {
        this.x = 0;
        this.width = 0;
        this.x = x;
        this.width = width;
    }
    Object.defineProperty(WrapPosition.prototype, "right", {
        get: function () {
            return this.x + this.width;
        },
        enumerable: true,
        configurable: true
    });
    return WrapPosition;
}());
export { WrapPosition };
