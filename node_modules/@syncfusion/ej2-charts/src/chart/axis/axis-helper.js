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
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable jsdoc/require-param */
import { Double } from '../axis/double-axis';
/**
 * Common axis classes
 *
 * @private
 */
var NiceInterval = /** @class */ (function (_super) {
    __extends(NiceInterval, _super);
    function NiceInterval() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Method to calculate numeric datetime interval
     */
    NiceInterval.prototype.calculateDateTimeNiceInterval = function (axis, size, start, end, isChart) {
        if (isChart === void 0) { isChart = true; }
        var oneDay = 24 * 60 * 60 * 1000;
        var startDate = new Date(start);
        var endDate = new Date(end);
        //var axisInterval ;
        var totalDays = (Math.abs((startDate.getTime() - endDate.getTime()) / (oneDay)));
        var interval;
        axis.actualIntervalType = axis.intervalType;
        var type = axis.intervalType;
        switch (type) {
            case 'Years':
                interval = this.calculateNumericNiceInterval(axis, totalDays / 365, size);
                break;
            case 'Quarter':
                interval = this.calculateNumericNiceInterval(axis, (totalDays / 365) * 4, size);
                break;
            case 'Months':
                interval = this.calculateNumericNiceInterval(axis, totalDays / 30, size);
                break;
            case 'Weeks':
                interval = this.calculateNumericNiceInterval(axis, totalDays / 7, size);
                break;
            case 'Days':
                interval = this.calculateNumericNiceInterval(axis, totalDays, size);
                break;
            case 'Hours':
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24, size);
                break;
            case 'Minutes':
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24 * 60, size);
                break;
            case 'Seconds':
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24 * 60 * 60, size);
                break;
            case 'Auto':
                interval = this.calculateNumericNiceInterval(axis, totalDays / 365, size);
                if (interval >= 1) {
                    axis.actualIntervalType = 'Years';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, (totalDays / 365) * 4, size);
                if (interval >= 1 && !isChart) {
                    axis.actualIntervalType = 'Quarter';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays / 30, size);
                if (interval >= 1) {
                    axis.actualIntervalType = 'Months';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays / 7, size);
                if (interval >= 1 && !isChart) {
                    axis.actualIntervalType = 'Weeks';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays, size);
                if (interval >= 1) {
                    axis.actualIntervalType = 'Days';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24, size);
                if (interval >= 1) {
                    axis.actualIntervalType = 'Hours';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24 * 60, size);
                if (interval >= 1) {
                    axis.actualIntervalType = 'Minutes';
                    return interval;
                }
                interval = this.calculateNumericNiceInterval(axis, totalDays * 24 * 60 * 60, size);
                axis.actualIntervalType = 'Seconds';
                return interval;
        }
        return interval;
    };
    /**
     * To get the skeleton for the DateTime axis.
     *
     * @returns {string} skeleton format
     * @private
     */
    NiceInterval.prototype.getSkeleton = function (axis, currentValue, previousValue, isBlazor) {
        var skeleton;
        var intervalType = axis.actualIntervalType;
        if (axis.skeleton) {
            return axis.skeleton;
        }
        if (intervalType === 'Years') {
            if (isBlazor) {
                skeleton = axis.isChart ? (axis.valueType === 'DateTime' ? 'y' : 'y') : 'y';
            }
            else {
                skeleton = axis.isChart ? ((axis.valueType === 'DateTime' && axis.isIntervalInDecimal) ? 'y' : 'yMMM') : 'y';
            }
        }
        else if (intervalType === 'Quarter') {
            skeleton = isBlazor ? 'y' : 'yMMM';
        }
        else if (intervalType === 'Months') {
            if (isBlazor) {
                skeleton = axis.isChart ? 'm' : 'm';
            }
            else {
                skeleton = axis.isChart ? 'MMMd' : 'MMM';
            }
        }
        else if (intervalType === 'Weeks') {
            skeleton = isBlazor ? 'm' : 'MEd';
        }
        else if (intervalType === 'Days') {
            if (isBlazor) {
                skeleton = 'd';
            }
            else {
                skeleton = axis.isChart ? this.getDayFormat(axis, currentValue, previousValue) : 'MMMd';
            }
        }
        else if (intervalType === 'Hours') {
            if (isBlazor) {
                skeleton = 't';
            }
            else {
                skeleton = axis.isChart ? (axis.valueType === 'DateTime' ? 'Hm' : 'EHm') : 'h';
            }
        }
        else if (intervalType === 'Minutes') {
            if (isBlazor) {
                skeleton = 'T';
            }
            else {
                skeleton = axis.isChart ? 'Hms' : 'hm';
            }
        }
        else {
            if (isBlazor) {
                skeleton = 'T';
            }
            else {
                skeleton = axis.isChart ? 'Hms' : 'hms';
            }
        }
        return skeleton;
    };
    /**
     * Get intervalType month format
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     */
    NiceInterval.prototype.getMonthFormat = function (axis, currentValue, previousValue) {
        return ((new Date(currentValue).getFullYear() === new Date(previousValue).getFullYear()) ?
            (axis.isIntervalInDecimal ? 'MMM' : 'MMM d') : 'y MMM');
    };
    /**
     * Get intervalType day label format for the axis
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     */
    NiceInterval.prototype.getDayFormat = function (axis, currentValue, previousValue) {
        return (axis.valueType === 'DateTime' ?
            ((new Date(currentValue).getMonth() !== new Date(previousValue).getMonth()) ? 'MMMd' :
                (axis.isIntervalInDecimal ? 'd' : 'Ehm')) : 'yMd');
    };
    /**
     * Find label format for axis
     *
     * @param {Axis} axis axis
     * @param {number} currentValue currentValue
     * @param {number} previousValue previousValue
     * @private
     */
    NiceInterval.prototype.findCustomFormats = function (axis, currentValue, previousValue) {
        var labelFormat = axis.labelFormat ? axis.labelFormat : '';
        if (axis.isChart && !axis.skeleton && axis.actualIntervalType === 'Months' && !labelFormat) {
            labelFormat = axis.valueType === 'DateTime' ? this.getMonthFormat(axis, currentValue, previousValue) : 'yMMM';
        }
        return labelFormat;
    };
    return NiceInterval;
}(Double));
export { NiceInterval };
