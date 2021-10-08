import { IntlBase as base } from './intl-base';
import { ParserBase as parser } from './parser-base';
import { isUndefined, throwError, getValue, isNullOrUndefined, isBlazor } from '../util';
import { datePartMatcher } from './date-formatter';
import { HijriParser } from '../hijri-parser';
var standalone = 'stand-alone';
var latnRegex = /^[0-9]*$/;
var timeSetter = {
    minute: 'setMinutes',
    hour: 'setHours',
    second: 'setSeconds',
    day: 'setDate',
    month: 'setMonth',
    milliseconds: 'setMilliseconds'
};
var month = 'months';
/* tslint:disable no-any */
/**
 * Date Parser.
 *
 * @private
 */
var DateParser = /** @class */ (function () {
    function DateParser() {
    }
    /**
     * Returns the parser function for given skeleton.
     *
     * @param {string} culture -  Specifies the culture name to be which formatting.
     * @param {DateFormatOptions} option - Specific the format in which string date  will be parsed.
     * @param {Object} cldr - Specifies the global cldr data collection.
     * @returns {Function} ?
     */
    DateParser.dateParser = function (culture, option, cldr) {
        var _this = this;
        var dependable = base.getDependables(cldr, culture, option.calendar);
        var numOptions = parser.getCurrentNumericOptions(dependable.parserObject, parser.getNumberingSystem(cldr), false, isBlazor());
        var parseOptions = {};
        if (isBlazor() && option.isServerRendered) {
            option = base.compareBlazorDateFormats(option, culture);
        }
        var resPattern = option.format ||
            base.getResultantPattern(option.skeleton, dependable.dateObject, option.type, false, isBlazor() ? culture : '');
        var regexString = '';
        var hourOnly;
        if (isUndefined(resPattern)) {
            throwError('Format options or type given must be invalid');
        }
        else {
            resPattern = base.ConvertDateToWeekFormat(resPattern);
            parseOptions = { isIslamic: base.islamicRegex.test(option.calendar), pattern: resPattern, evalposition: {}, culture: culture };
            var patternMatch = resPattern.match(base.dateParseRegex) || [];
            var length_1 = patternMatch.length;
            var gmtCorrection = 0;
            var zCorrectTemp = 0;
            var isgmtTraversed = false;
            var nRegx = numOptions.numericRegex;
            // eslint-disable-next-line
            var numMapper = isBlazor() ? dependable.parserObject.numbers :
                parser.getNumberMapper(dependable.parserObject, parser.getNumberingSystem(cldr));
            for (var i = 0; i < length_1; i++) {
                var str = patternMatch[i];
                var len = str.length;
                var char = (str[0] === 'K') ? 'h' : str[0];
                var isNumber = void 0;
                var canUpdate = void 0;
                // eslint-disable-next-line
                var charKey = datePartMatcher[char];
                var optional = (len === 2) ? '' : '?';
                if (isgmtTraversed) {
                    gmtCorrection = zCorrectTemp;
                    isgmtTraversed = false;
                }
                switch (char) {
                    case 'E':
                    case 'c':
                        // eslint-disable-next-line
                        var weekData = void 0;
                        if (isBlazor()) {
                            // eslint-disable-next-line
                            weekData = getValue('days.' + base.monthIndex[len], dependable.dateObject);
                        }
                        else {
                            // eslint-disable-next-line
                            weekData = dependable.dateObject[base.days][standalone][base.monthIndex[len]];
                        }
                        // eslint-disable-next-line
                        var weekObject = parser.reverseObject(weekData);
                        // tslint:enable
                        regexString += '(' + Object.keys(weekObject).join('|') + ')';
                        break;
                    case 'M':
                    case 'L':
                    case 'd':
                    case 'm':
                    case 's':
                    case 'h':
                    case 'H':
                    case 'f':
                        canUpdate = true;
                        if ((char === 'M' || char === 'L') && len > 2) {
                            var monthData = void 0;
                            if (isBlazor()) {
                                // eslint-disable-next-line
                                monthData = getValue('months.' + base.monthIndex[len], dependable.dateObject);
                            }
                            else {
                                // eslint-disable-next-line
                                monthData = dependable.dateObject[month][standalone][base.monthIndex[len]];
                            }
                            // eslint-disable-next-line
                            parseOptions[charKey] = parser.reverseObject(monthData);
                            // eslint-disable-next-line
                            regexString += '(' + Object.keys(parseOptions[charKey]).join('|') + ')';
                        }
                        else if (char === 'f') {
                            if (len > 3) {
                                continue;
                            }
                            isNumber = true;
                            regexString += '(' + nRegx + nRegx + '?' + nRegx + '?' + ')';
                        }
                        else {
                            isNumber = true;
                            regexString += '(' + nRegx + nRegx + optional + ')';
                        }
                        if (char === 'h') {
                            parseOptions.hour12 = true;
                        }
                        break;
                    case 'W':
                        // eslint-disable-next-line
                        var opt = len === 1 ? '?' : '';
                        regexString += '(' + nRegx + opt + nRegx + ')';
                        break;
                    case 'y':
                        canUpdate = isNumber = true;
                        if (len === 2) {
                            regexString += '(' + nRegx + nRegx + ')';
                        }
                        else {
                            regexString += '(' + nRegx + '{' + len + ',})';
                        }
                        break;
                    case 'a':
                        canUpdate = true;
                        // eslint-disable-next-line
                        var periodValur = isBlazor() ?
                            getValue('dayPeriods', dependable.dateObject) :
                            getValue('dayPeriods.format.wide', dependable.dateObject);
                        // eslint-disable-next-line
                        parseOptions[charKey] = parser.reverseObject(periodValur);
                        // eslint-disable-next-line
                        regexString += '(' + Object.keys(parseOptions[charKey]).join('|') + ')';
                        break;
                    case 'G':
                        canUpdate = true;
                        // eslint-disable-next-line
                        var eText = (len <= 3) ? 'eraAbbr' : (len === 4) ? 'eraNames' : 'eraNarrow';
                        // eslint-disable-next-line
                        parseOptions[charKey] = parser.reverseObject(isBlazor() ?
                            getValue('eras', dependable.dateObject) : getValue('eras.' + eText, dependable.dateObject));
                        // eslint-disable-next-line
                        regexString += '(' + Object.keys(parseOptions[charKey]).join('|') + '?)';
                        break;
                    case 'z':
                        // eslint-disable-next-line
                        var tval = new Date().getTimezoneOffset();
                        canUpdate = (tval !== 0);
                        // eslint-disable-next-line
                        parseOptions[charKey] = getValue('dates.timeZoneNames', dependable.parserObject);
                        // eslint-disable-next-line
                        var tzone = parseOptions[charKey];
                        hourOnly = (len < 4);
                        // eslint-disable-next-line
                        var hpattern = hourOnly ? '+H;-H' : tzone.hourFormat;
                        hpattern = hpattern.replace(/:/g, numMapper.timeSeparator);
                        regexString += '(' + this.parseTimeZoneRegx(hpattern, tzone, nRegx) + ')?';
                        isgmtTraversed = true;
                        zCorrectTemp = hourOnly ? 6 : 12;
                        break;
                    case '\'':
                        // eslint-disable-next-line
                        var iString = str.replace(/'/g, '');
                        regexString += '(' + iString + ')?';
                        break;
                    default:
                        regexString += '([\\D])';
                        break;
                }
                if (canUpdate) {
                    parseOptions.evalposition[charKey] = { isNumber: isNumber, pos: i + 1 + gmtCorrection, hourOnly: hourOnly };
                }
                if (i === length_1 - 1 && !isNullOrUndefined(regexString)) {
                    parseOptions.parserRegex = new RegExp('^' + regexString + '$', 'i');
                }
            }
        }
        return function (value) {
            var parsedDateParts = _this.internalDateParse(value, parseOptions, numOptions);
            if (isNullOrUndefined(parsedDateParts) || !Object.keys(parsedDateParts).length) {
                return null;
            }
            if (parseOptions.isIslamic) {
                var dobj = {};
                var tYear = parsedDateParts.year;
                var tDate = parsedDateParts.day;
                var tMonth = parsedDateParts.month;
                var ystrig = tYear ? (tYear + '') : '';
                var is2DigitYear = (ystrig.length === 2);
                if (!tYear || !tMonth || !tDate || is2DigitYear) {
                    dobj = HijriParser.getHijriDate(new Date());
                }
                if (is2DigitYear) {
                    tYear = parseInt((dobj.year + '').slice(0, 2) + ystrig, 10);
                }
                // tslint:disable-next-line
                var dateObject = HijriParser.toGregorian(tYear || dobj.year, tMonth || dobj.month, tDate || dobj.date);
                parsedDateParts.year = dateObject.getFullYear();
                parsedDateParts.month = dateObject.getMonth() + 1;
                parsedDateParts.day = dateObject.getDate();
            }
            return _this.getDateObject(parsedDateParts);
        };
    };
    /* tslint:disable */
    /**
     * Returns date object for provided date options
     *
     * @param {DateParts} options ?
     * @param {Date} value ?
     * @returns {Date} ?
     */
    DateParser.getDateObject = function (options, value) {
        var res = value || new Date();
        res.setMilliseconds(0);
        var tKeys = ['hour', 'minute', 'second', 'milliseconds', 'month', 'day'];
        var y = options.year;
        var desig = options.designator;
        var tzone = options.timeZone;
        if (!isUndefined(y)) {
            var len = (y + '').length;
            if (len <= 2) {
                var century = Math.floor(res.getFullYear() / 100) * 100;
                y += century;
            }
            res.setFullYear(y);
        }
        for (var _i = 0, tKeys_1 = tKeys; _i < tKeys_1.length; _i++) {
            var key = tKeys_1[_i];
            // eslint-disable-next-line
            var tValue = options[key];
            if (isUndefined(tValue) && key === 'day') {
                res.setDate(1);
            }
            if (!isUndefined(tValue)) {
                if (key === 'month') {
                    tValue -= 1;
                    if (tValue < 0 || tValue > 11) {
                        return new Date('invalid');
                    }
                    var pDate = res.getDate();
                    res.setDate(1);
                    // eslint-disable-next-line
                    res[timeSetter[key]](tValue);
                    var lDate = new Date(res.getFullYear(), tValue + 1, 0).getDate();
                    res.setDate(pDate < lDate ? pDate : lDate);
                }
                else {
                    if (key === 'day') {
                        var lastDay = new Date(res.getFullYear(), res.getMonth() + 1, 0).getDate();
                        if ((tValue < 1 || tValue > lastDay)) {
                            return null;
                        }
                    }
                    // eslint-disable-next-line
                    res[timeSetter[key]](tValue);
                }
            }
        }
        if (!isUndefined(desig)) {
            var hour = res.getHours();
            if (desig === 'pm') {
                res.setHours(hour + (hour === 12 ? 0 : 12));
            }
            else if (hour === 12) {
                res.setHours(0);
            }
        }
        if (!isUndefined(tzone)) {
            var tzValue = tzone - res.getTimezoneOffset();
            if (tzValue !== 0) {
                res.setMinutes(res.getMinutes() + tzValue);
            }
        }
        return res;
    };
    /**
     * Returns date parsing options for provided value along with parse and numeric options
     *
     * @param {string} value ?
     * @param {ParseOptions} parseOptions ?
     * @param {NumericOptions} num ?
     * @returns {DateParts} ?
     */
    DateParser.internalDateParse = function (value, parseOptions, num) {
        var matches = value.match(parseOptions.parserRegex);
        var retOptions = { 'hour': 0, 'minute': 0, 'second': 0 };
        if (isNullOrUndefined(matches)) {
            return null;
        }
        else {
            var props = Object.keys(parseOptions.evalposition);
            for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
                var prop = props_1[_i];
                var curObject = parseOptions.evalposition[prop];
                var matchString = matches[curObject.pos];
                if (curObject.isNumber) {
                    // eslint-disable-next-line
                    retOptions[prop] = this.internalNumberParser(matchString, num);
                }
                else {
                    if (prop === 'timeZone' && !isUndefined(matchString)) {
                        var pos = curObject.pos;
                        var val = void 0;
                        var tmatch = matches[pos + 1];
                        var flag = !isUndefined(tmatch);
                        if (curObject.hourOnly) {
                            val = this.getZoneValue(flag, tmatch, matches[pos + 4], num) * 60;
                        }
                        else {
                            val = this.getZoneValue(flag, tmatch, matches[pos + 7], num) * 60;
                            val += this.getZoneValue(flag, matches[pos + 4], matches[pos + 10], num);
                        }
                        if (!isNullOrUndefined(val)) {
                            retOptions[prop] = val;
                        }
                    }
                    else {
                        // eslint-disable-next-line
                        matchString = ((prop === 'month') && (!parseOptions.isIslamic) && (parseOptions.culture === 'en' || parseOptions.culture === 'en-GB' || parseOptions.culture === 'en-US'))
                            ? matchString[0].toUpperCase() + matchString.substring(1).toLowerCase() : matchString;
                        // eslint-disable-next-line
                        retOptions[prop] = parseOptions[prop][matchString];
                    }
                }
            }
            if (parseOptions.hour12) {
                retOptions.hour12 = true;
            }
        }
        return retOptions;
    };
    /**
     * Returns parsed number for provided Numeric string and Numeric Options
     *
     * @param {string} value ?
     * @param {NumericOptions} option ?
     * @returns {number} ?
     */
    DateParser.internalNumberParser = function (value, option) {
        value = parser.convertValueParts(value, option.numberParseRegex, option.numericPair);
        if (latnRegex.test(value)) {
            return +value;
        }
        return null;
    };
    /**
     * Returns parsed time zone RegExp for provided hour format and time zone
     *
     * @param {string} hourFormat ?
     * @param {base.TimeZoneOptions} tZone ?
     * @param {string} nRegex ?
     * @returns {string} ?
     */
    DateParser.parseTimeZoneRegx = function (hourFormat, tZone, nRegex) {
        var pattern = tZone.gmtFormat;
        var ret;
        var cRegex = '(' + nRegex + ')' + '(' + nRegex + ')';
        var splitStr;
        ret = hourFormat.replace('+', '\\+');
        if (hourFormat.indexOf('HH') !== -1) {
            ret = ret.replace(/HH|mm/g, '(' + cRegex + ')');
        }
        else {
            ret = ret.replace(/H|m/g, '(' + cRegex + '?)');
        }
        // eslint-disable-next-line
        splitStr = (ret.split(';').map(function (str) {
            return pattern.replace('{0}', str);
        }));
        ret = splitStr.join('|') + '|' + tZone.gmtZeroFormat;
        return ret;
    };
    /**
     * Returns zone based value.
     *
     * @param {boolean} flag ?
     * @param {string} val1 ?
     * @param {string} val2 ?
     * @param {NumericOptions} num ?
     * @returns {number} ?
     */
    DateParser.getZoneValue = function (flag, val1, val2, num) {
        var ival = flag ? val1 : val2;
        if (!ival) {
            return 0;
        }
        var value = this.internalNumberParser(ival, num);
        if (flag) {
            return -value;
        }
        return value;
    };
    return DateParser;
}());
export { DateParser };
