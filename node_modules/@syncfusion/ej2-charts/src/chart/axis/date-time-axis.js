var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { isZoomSet, setRange, triggerLabelRender } from '../../common/utils/helper';
import { DoubleRange } from '../utils/double-range';
import { withIn, firstToLowerCase } from '../../common/utils/helper';
import { DataUtil } from '@syncfusion/ej2-data';
import { NiceInterval } from '../axis/axis-helper';
import { extend, getValue, isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * `DateTime` module is used to render datetime axis.
 */
var DateTime = /** @class */ (function (_super) {
    __extends(DateTime, _super);
    /**
     * Constructor for the dateTime module.
     *
     * @private
     */
    function DateTime(chart) {
        return _super.call(this, chart) || this;
    }
    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     */
    DateTime.prototype.calculateRangeAndInterval = function (size, axis) {
        this.calculateRange(axis);
        this.getActualRange(axis, size);
        this.applyRangePadding(axis, size);
        this.calculateVisibleLabels(axis, this.chart);
    };
    /**
     * Actual Range for the axis.
     *
     * @private
     */
    DateTime.prototype.getActualRange = function (axis, size) {
        var option = {
            skeleton: 'full',
            type: 'dateTime'
        };
        var dateParser = this.chart.intl.getDateParser(option);
        var dateFormatter = this.chart.intl.getDateFormat(option);
        // Axis min
        if ((axis.minimum) !== null) {
            this.min = this.chart.isBlazor ? Date.parse(axis.minimum.toString()) : Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: axis.minimum }).val))));
        }
        else if (this.min === null || this.min === Number.POSITIVE_INFINITY) {
            this.min = Date.parse(dateParser(dateFormatter(new Date(1970, 1, 1))));
        }
        // Axis Max
        if ((axis.maximum) !== null) {
            this.max = this.chart.isBlazor ? Date.parse(axis.maximum.toString()) : Date.parse(dateParser(dateFormatter(new Date(DataUtil.parse.parseJson({ val: axis.maximum }).val))));
        }
        else if (this.max === null || this.max === Number.NEGATIVE_INFINITY) {
            this.max = Date.parse(dateParser(dateFormatter(new Date(1970, 5, 1))));
        }
        if (this.min === this.max) {
            this.max = this.max + 2592000000;
            this.min = this.min - 2592000000;
        }
        axis.actualRange = {};
        axis.doubleRange = new DoubleRange(this.min, this.max);
        var datetimeInterval = this.calculateDateTimeNiceInterval(axis, size, axis.doubleRange.start, axis.doubleRange.end);
        if (!axis.interval) {
            axis.actualRange.interval = datetimeInterval;
        }
        else {
            axis.actualRange.interval = axis.interval;
        }
        axis.actualRange.min = axis.doubleRange.start;
        axis.actualRange.max = axis.doubleRange.end;
    };
    /**
     * Apply padding for the range.
     *
     * @private
     */
    DateTime.prototype.applyRangePadding = function (axis, size) {
        this.min = (axis.actualRange.min);
        this.max = (axis.actualRange.max);
        var minimum;
        var maximum;
        var interval = axis.actualRange.interval;
        if (!setRange(axis)) {
            var rangePadding = axis.getRangePadding(this.chart);
            minimum = new Date(this.min);
            maximum = new Date(this.max);
            var intervalType = axis.actualIntervalType;
            if (rangePadding === 'None') {
                this.min = minimum.getTime();
                this.max = maximum.getTime();
            }
            else if (rangePadding === 'Additional' || rangePadding === 'Round') {
                switch (intervalType) {
                    case 'Years':
                        this.getYear(minimum, maximum, rangePadding, interval);
                        break;
                    case 'Months':
                        this.getMonth(minimum, maximum, rangePadding, interval);
                        break;
                    case 'Days':
                        this.getDay(minimum, maximum, rangePadding, interval);
                        break;
                    case 'Hours':
                        this.getHour(minimum, maximum, rangePadding, interval);
                        break;
                    case 'Minutes':
                        var minute = (minimum.getMinutes() / interval) * interval;
                        var endMinute = maximum.getMinutes() + (minimum.getMinutes() - minute);
                        if (rangePadding === 'Round') {
                            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), minimum.getHours(), minute, 0)).getTime();
                            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), maximum.getHours(), endMinute, 59)).getTime();
                        }
                        else {
                            this.min = (new Date(minimum.getFullYear(), maximum.getMonth(), minimum.getDate(), minimum.getHours(), minute + (-interval), 0)).getTime();
                            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), maximum.getHours(), endMinute + (interval), 0)).getTime();
                        }
                        break;
                    case 'Seconds':
                        var second = (minimum.getSeconds() / interval) * interval;
                        var endSecond = maximum.getSeconds() + (minimum.getSeconds() - second);
                        if (rangePadding === 'Round') {
                            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), minimum.getHours(), minimum.getMinutes(), second, 0)).getTime();
                            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), maximum.getHours(), maximum.getMinutes(), endSecond, 0)).getTime();
                        }
                        else {
                            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), minimum.getHours(), minimum.getMinutes(), second + (-interval), 0)).getTime();
                            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), maximum.getHours(), maximum.getMinutes(), endSecond + (interval), 0)).getTime();
                        }
                        break;
                }
            }
        }
        axis.actualRange.min = (axis.minimum != null) ? this.min : this.min;
        axis.actualRange.max = (axis.maximum != null) ? this.max : this.max;
        axis.actualRange.delta = (axis.actualRange.max - axis.actualRange.min);
        axis.doubleRange = new DoubleRange(axis.actualRange.min, axis.actualRange.max);
        this.calculateVisibleRange(size, axis);
    };
    DateTime.prototype.getYear = function (minimum, maximum, rangePadding, interval) {
        var startYear = minimum.getFullYear();
        var endYear = maximum.getFullYear();
        if (rangePadding === 'Additional') {
            this.min = (new Date(startYear - interval, 1, 1, 0, 0, 0)).getTime();
            this.max = (new Date(endYear + interval, 1, 1, 0, 0, 0)).getTime();
        }
        else {
            this.min = new Date(startYear, 0, 0, 0, 0, 0).getTime();
            this.max = new Date(endYear, 11, 30, 23, 59, 59).getTime();
        }
    };
    DateTime.prototype.getMonth = function (minimum, maximum, rangePadding, interval) {
        var month = minimum.getMonth();
        var endMonth = maximum.getMonth();
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), month, 0, 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), endMonth, new Date(maximum.getFullYear(), maximum.getMonth(), 0).getDate(), 23, 59, 59)).getTime();
        }
        else {
            this.min = (new Date(minimum.getFullYear(), month + (-interval), 1, 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), endMonth + (interval), endMonth === 2 ? 28 : 30, 0, 0, 0)).getTime();
        }
    };
    DateTime.prototype.getDay = function (minimum, maximum, rangePadding, interval) {
        var day = minimum.getDate();
        var endDay = maximum.getDate();
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), day, 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), endDay, 23, 59, 59)).getTime();
        }
        else {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), day + (-interval), 0, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), endDay + (interval), 0, 0, 0)).getTime();
        }
    };
    DateTime.prototype.getHour = function (minimum, maximum, rangePadding, interval) {
        var hour = (minimum.getHours() / interval) * interval;
        var endHour = maximum.getHours() + (minimum.getHours() - hour);
        if (rangePadding === 'Round') {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), hour, 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), endHour, 59, 59)).getTime();
        }
        else {
            this.min = (new Date(minimum.getFullYear(), minimum.getMonth(), minimum.getDate(), hour + (-interval), 0, 0)).getTime();
            this.max = (new Date(maximum.getFullYear(), maximum.getMonth(), maximum.getDate(), endHour + (interval), 0, 0)).getTime();
        }
    };
    /**
     * Calculate visible range for axis.
     *
     * @private
     */
    DateTime.prototype.calculateVisibleRange = function (size, axis) {
        axis.visibleRange = {
            min: axis.actualRange.min,
            max: axis.actualRange.max,
            interval: axis.actualRange.interval,
            delta: axis.actualRange.delta
        };
        var isLazyLoad = isNullOrUndefined(axis.zoomingScrollBar) ? false : axis.zoomingScrollBar.isLazyLoad;
        if ((isZoomSet(axis)) && !isLazyLoad) {
            axis.calculateVisibleRangeOnZooming(size);
            axis.calculateAxisRange(size, this.chart);
            axis.visibleRange.interval = (axis.enableAutoIntervalOnZooming) ?
                this.calculateDateTimeNiceInterval(axis, size, axis.visibleRange.min, axis.visibleRange.max)
                : axis.visibleRange.interval;
        }
        axis.dateTimeInterval = this.increaseDateTimeInterval(axis, axis.visibleRange.min, axis.visibleRange.interval).getTime()
            - axis.visibleRange.min;
        axis.triggerRangeRender(this.chart, axis.visibleRange.min, axis.visibleRange.max, axis.visibleRange.interval);
    };
    /**
     * Calculate visible labels for the axis.
     *
     * @param {Axis} axis axis
     * @param {Chart | RangeNavigator} chart chart
     * @returns {void}
     * @private
     */
    DateTime.prototype.calculateVisibleLabels = function (axis, chart) {
        axis.visibleLabels = [];
        var tempInterval = axis.visibleRange.min;
        var labelStyle;
        var previousValue;
        var isBlazor = chart.getModuleName() === 'chart' ? chart.isBlazor : false;
        var axisLabels = axis.visibleLabels;
        if (!setRange(axis)) {
            tempInterval = this.alignRangeStart(axis, tempInterval, axis.visibleRange.interval).getTime();
        }
        while (tempInterval <= axis.visibleRange.max) {
            labelStyle = (extend({}, getValue('properties', axis.labelStyle), null, true));
            previousValue = axisLabels.length ? axis.visibleLabels[axisLabels.length - 1].value : tempInterval;
            axis.format = chart.intl.getDateFormat({
                format: this.findCustomFormats(axis, tempInterval, previousValue) || this.blazorCustomFormat(axis),
                type: firstToLowerCase(axis.skeletonType),
                skeleton: this.getSkeleton(axis, tempInterval, previousValue, isBlazor)
            });
            axis.startLabel = axis.format(new Date(axis.visibleRange.min));
            axis.endLabel = axis.format(new Date(axis.visibleRange.max));
            if (withIn(tempInterval, axis.visibleRange)) {
                triggerLabelRender(chart, tempInterval, axis.format(new Date(tempInterval)), labelStyle, axis);
            }
            tempInterval = this.increaseDateTimeInterval(axis, tempInterval, axis.visibleRange.interval).getTime();
        }
        //tooltip and crosshair formats for 'Months' and 'Days' interval types
        if ((axis.actualIntervalType === 'Months' || axis.actualIntervalType === 'Days') && axis.isChart) {
            axis.format = chart.intl.getDateFormat({
                format: axis.labelFormat || (axis.actualIntervalType === 'Months' && !axis.skeleton ? 'y MMM' : ''),
                type: firstToLowerCase(axis.skeletonType), skeleton: axis.skeleton || (axis.actualIntervalType === 'Days' ? 'MMMd' : '')
            });
        }
        if (axis.getMaxLabelWidth) {
            axis.getMaxLabelWidth(this.chart);
        }
    };
    /** @private */
    DateTime.prototype.blazorCustomFormat = function (axis) {
        if (this.chart.isBlazor) {
            return axis.actualIntervalType === 'Years' ? (axis.isIntervalInDecimal ? 'yyyy' : 'MMM y') :
                (axis.actualIntervalType === 'Days' && !axis.isIntervalInDecimal) ? 'ddd HH tt' : '';
        }
        else {
            return '';
        }
    };
    /** @private */
    DateTime.prototype.increaseDateTimeInterval = function (axis, value, interval) {
        var result = new Date(value);
        if (axis.interval) {
            axis.isIntervalInDecimal = (interval % 1) === 0;
            axis.visibleRange.interval = interval;
        }
        else {
            interval = Math.ceil(interval);
            axis.visibleRange.interval = interval;
        }
        var intervalType = axis.actualIntervalType;
        if (axis.isIntervalInDecimal) {
            switch (intervalType) {
                case 'Years':
                    result.setFullYear(result.getFullYear() + interval);
                    return result;
                case 'Quarter':
                    result.setMonth(result.getMonth() + (3 * interval));
                    return result;
                case 'Months':
                    result.setMonth(result.getMonth() + interval);
                    return result;
                case 'Weeks':
                    result.setDate(result.getDate() + (interval * 7));
                    return result;
                case 'Days':
                    result.setDate(result.getDate() + interval);
                    return result;
                case 'Hours':
                    result.setHours(result.getHours() + interval);
                    return result;
                case 'Minutes':
                    result.setMinutes(result.getMinutes() + interval);
                    return result;
                case 'Seconds':
                    result.setSeconds(result.getSeconds() + interval);
                    return result;
            }
        }
        else {
            result = this.getDecimalInterval(result, interval, intervalType);
        }
        return result;
    };
    DateTime.prototype.alignRangeStart = function (axis, sDate, intervalSize) {
        var sResult = new Date(sDate);
        switch (axis.actualIntervalType) {
            case 'Years':
                var year = Math.floor(Math.floor(sResult.getFullYear() / intervalSize) * intervalSize);
                sResult = new Date(year, sResult.getMonth(), sResult.getDate(), 0, 0, 0);
                return sResult;
            case 'Months':
                var month = Math.floor(Math.floor((sResult.getMonth()) / intervalSize) * intervalSize);
                sResult = new Date(sResult.getFullYear(), month, sResult.getDate(), 0, 0, 0);
                return sResult;
            case 'Days':
                var day = Math.floor(Math.floor((sResult.getDate()) / intervalSize) * intervalSize);
                sResult = new Date(sResult.getFullYear(), sResult.getMonth(), day, 0, 0, 0);
                return sResult;
            case 'Hours':
                var hour = Math.floor(Math.floor((sResult.getHours()) / intervalSize) * intervalSize);
                sResult = new Date(sResult.getFullYear(), sResult.getMonth(), sResult.getDate(), hour, 0, 0);
                return sResult;
            case 'Minutes':
                var minutes = Math.floor(Math.floor((sResult.getMinutes()) / intervalSize) * intervalSize);
                sResult = new Date(sResult.getFullYear(), sResult.getMonth(), sResult.getDate(), sResult.getHours(), minutes, 0, 0);
                return sResult;
            case 'Seconds':
                var seconds = Math.floor(Math.floor((sResult.getSeconds()) / intervalSize) * intervalSize);
                sResult = new Date(sResult.getFullYear(), sResult.getMonth(), sResult.getDate(), sResult.getHours(), sResult.getMinutes(), seconds, 0);
                return sResult;
        }
        return sResult;
    };
    DateTime.prototype.getDecimalInterval = function (result, interval, intervalType) {
        var roundValue = Math.floor(interval);
        var decimalValue = interval - roundValue;
        switch (intervalType) {
            case 'Years':
                var month = Math.round(12 * decimalValue);
                result.setFullYear(result.getFullYear() + roundValue);
                result.setMonth(result.getMonth() + month);
                return result;
            case 'Quarter':
                result.setMonth(result.getMonth() + (3 * interval));
                return result;
            case 'Months':
                var days = Math.round(30 * decimalValue);
                result.setMonth(result.getMonth() + roundValue);
                result.setDate(result.getDate() + days);
                return result;
            case 'Weeks':
                result.setDate(result.getDate() + (interval * 7));
                return result;
            case 'Days':
                var hour = Math.round(24 * decimalValue);
                result.setDate(result.getDate() + roundValue);
                result.setHours(result.getHours() + hour);
                return result;
            case 'Hours':
                var min = Math.round(60 * decimalValue);
                result.setHours(result.getHours() + roundValue);
                result.setMinutes(result.getMinutes() + min);
                return result;
            case 'Minutes':
                var sec = Math.round(60 * decimalValue);
                result.setMinutes(result.getMinutes() + roundValue);
                result.setSeconds(result.getSeconds() + sec);
                return result;
            case 'Seconds':
                var milliSec = Math.round(1000 * decimalValue);
                result.setSeconds(result.getSeconds() + roundValue);
                result.setMilliseconds(result.getMilliseconds() + milliSec);
                return result;
        }
        return result;
    };
    /**
     * Get module name
     */
    DateTime.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'DateTime';
    };
    /**
     * To destroy the category axis.
     *
     * @returns {void}
     * @private
     */
    DateTime.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return DateTime;
}(NiceInterval));
export { DateTime };
