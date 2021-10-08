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
/* eslint-disable no-case-declarations */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { ChartLocation, ControlPoints } from '../../common/utils/helper';
import { extend, isNullOrUndefined } from '@syncfusion/ej2-base';
import { LineBase } from './line-base';
/**
 * render Line series
 */
var SplineBase = /** @class */ (function (_super) {
    __extends(SplineBase, _super);
    /** @private */
    function SplineBase(chartModule) {
        var _this = _super.call(this, chartModule) || this;
        _this.splinePoints = [];
        _this.lowSplinePoints = [];
        return _this;
    }
    /**
     * To find the control points for spline.
     *
     * @returns {void}
     * @private
     */
    SplineBase.prototype.findSplinePoint = function (series) {
        var value;
        var lowPoints;
        var realPoints = [];
        var points = [];
        var point;
        var pointIndex = 0;
        realPoints = this.filterEmptyPoints(series);
        for (var i = 0; i < realPoints.length; i++) {
            point = realPoints[i];
            if (point.x === null || point.x === '') {
                continue;
            }
            else {
                point.index = pointIndex;
                pointIndex++;
                points.push(point);
            }
        }
        var isLow = false;
        this.splinePoints = this.findSplineCoefficients(points, series, isLow);
        if (series.type === "SplineRangeArea") {
            isLow = !isLow;
            this.lowSplinePoints = this.findSplineCoefficients(points, series, isLow);
        }
        if (points.length > 1) {
            series.drawPoints = [];
            series.lowDrawPoints = [];
            for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
                var point_1 = points_1[_i];
                if (point_1.index !== 0) {
                    var previous = this.getPreviousIndex(points, point_1.index - 1, series);
                    if (series.type === "SplineRangeArea") {
                        points[previous].yValue = points[previous].high > points[previous].low ? points[previous].high : points[previous].low;
                        point_1.yValue = point_1.high > point_1.low ? point_1.high : point_1.low;
                    }
                    value = this.getControlPoints(points[previous], point_1, this.splinePoints[previous], this.splinePoints[point_1.index], series);
                    series.drawPoints.push(value);
                    if (series.type === "SplineRangeArea") {
                        points[previous].yValue = points[previous].low < points[previous].high ? points[previous].low : points[previous].high;
                        point_1.yValue = point_1.low < point_1.high ? point_1.low : point_1.high;
                        lowPoints = this.getControlPoints(points[previous], point_1, this.lowSplinePoints[previous], this.lowSplinePoints[point_1.index], series);
                        series.lowDrawPoints.push(lowPoints);
                    }
                    // fix for Y-Axis of Spline chart not adjusting scale to suit dataSource issue
                    var delta = series.yMax - series.yMin;
                    if (point_1.yValue && value.controlPoint1.y && value.controlPoint2.y && delta > 1) {
                        series.yMin = Math.min(series.yMin, point_1.yValue, value.controlPoint1.y, value.controlPoint2.y);
                        series.yMax = Math.ceil(Math.max(series.yMax, point_1.yValue, value.controlPoint1.y, value.controlPoint2.y));
                        series.yMin = series.yAxis.valueType !== 'Logarithmic' ? Math.floor(series.yMin) : series.yMin;
                    }
                }
            }
            if (series.chart.chartAreaType === 'PolarRadar' && series.isClosed) {
                value = this.getControlPoints({ xValue: points[points.length - 1].xValue, yValue: points[points.length - 1].yValue }, { xValue: points[points.length - 1].xValue + 1, yValue: points[0].yValue }, this.splinePoints[0], this.splinePoints[points[points.length - 1].index], series);
                series.drawPoints.push(value);
            }
        }
    };
    SplineBase.prototype.getPreviousIndex = function (points, i, series) {
        if (series.emptyPointSettings.mode !== 'Drop') {
            return i;
        }
        while (isNullOrUndefined(points[i]) && i > -1) {
            i = i - 1;
        }
        return i;
    };
    SplineBase.prototype.getNextIndex = function (points, i, series) {
        if (series.emptyPointSettings.mode !== 'Drop') {
            return i;
        }
        while (isNullOrUndefined(points[i]) && i < points.length) {
            i = i + 1;
        }
        return i;
    };
    SplineBase.prototype.filterEmptyPoints = function (series, seriesPoints) {
        if (series.emptyPointSettings.mode !== 'Drop' && this.isPointInRange(series.points)) {
            return seriesPoints ? seriesPoints : series.points;
        }
        var points = seriesPoints ? seriesPoints : extend([], series.points, null, true);
        for (var i = 0; i < points.length; i++) {
            points[i].index = i;
            if (points[i].isEmpty) {
                points[i].symbolLocations = [];
                points[i].regions = [];
                points.splice(i, 1);
                i--;
            }
        }
        return points;
    };
    /**
     * To find points in the range
     *
     * @private
     */
    SplineBase.prototype.isPointInRange = function (points) {
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var point = points_2[_i];
            if (!point.isPointInRange) {
                return false;
            }
        }
        return true;
    };
    /**
     * To find the natural spline.
     *
     * @returns {void}
     * @private
     */
    SplineBase.prototype.findSplineCoefficients = function (points, series, isLow) {
        var ySpline = [];
        var ySplineDuplicate = [];
        var cardinalSplineTension = series.cardinalSplineTension ? series.cardinalSplineTension : 0.5;
        cardinalSplineTension = cardinalSplineTension < 0 ? 0 : cardinalSplineTension > 1 ? 1 : cardinalSplineTension;
        switch (series.splineType) {
            case 'Monotonic':
                ySpline = this.monotonicSplineCoefficients(points, series, isLow);
                break;
            case 'Cardinal':
                ySpline = this.cardinalSplineCofficients(points, series, isLow);
                break;
            default:
                if (series.splineType === 'Clamped') {
                    ySpline = this.clampedSplineCofficients(points, series, isLow);
                }
                else {
                    // assigning the first and last value as zero
                    ySpline[0] = ySplineDuplicate[0] = 0;
                    ySpline[points.length - 1] = 0;
                }
                ySpline = this.naturalSplineCoefficients(points, series, isLow);
                break;
        }
        return ySpline;
    };
    /**
     *  To find Monotonic Spline Coefficients
     */
    SplineBase.prototype.monotonicSplineCoefficients = function (points, series, isLow) {
        var count = points.length;
        var ySpline = [];
        var dx = [];
        var dy = [];
        var slope = [];
        var interPoint;
        var slopeLength;
        for (var i = 0; i < count - 1; i++) {
            if (series.type === "SplineRangeArea") {
                if (!isLow) {
                    points[i + 1].yValue = points[i + 1].high > points[i + 1].low ? points[i + 1].high : points[i + 1].low;
                    points[i].yValue = points[i].high > points[i].low ? points[i].high : points[i].low;
                }
                if (isLow) {
                    points[i + 1].yValue = points[i + 1].low < points[i + 1].high ? points[i + 1].low : points[i + 1].high;
                    points[i].yValue = points[i].low < points[i].high ? points[i].low : points[i].high;
                }
            }
            dx[i] = points[i + 1].xValue - points[i].xValue;
            dy[i] = points[i + 1].yValue - points[i].yValue;
            slope[i] = dy[i] / dx[i];
        }
        //interpolant points
        slopeLength = slope.length;
        // to find the first and last co-efficient value
        ySpline[0] = slope[0];
        ySpline[count - 1] = slope[slopeLength - 1];
        //to find the other co-efficient values
        for (var j = 0; j < dx.length; j++) {
            if (slopeLength > j + 1) {
                if (slope[j] * slope[j + 1] <= 0) {
                    ySpline[j + 1] = 0;
                }
                else {
                    interPoint = dx[j] + dx[j + 1];
                    ySpline[j + 1] = 3 * interPoint / ((interPoint + dx[j + 1]) / slope[j] + (interPoint + dx[j]) / slope[j + 1]);
                }
            }
        }
        return ySpline;
    };
    /**
     * To find Cardinal Spline Coefficients
     */
    SplineBase.prototype.cardinalSplineCofficients = function (points, series, isLow) {
        var count = points.length;
        var ySpline = [];
        var cardinalSplineTension = series.cardinalSplineTension ? series.cardinalSplineTension : 0.5;
        cardinalSplineTension = cardinalSplineTension < 0 ? 0 : cardinalSplineTension > 1 ? 1 : cardinalSplineTension;
        for (var i = 0; i < count; i++) {
            if (i === 0) {
                ySpline[i] = (count > 2) ? (cardinalSplineTension * (points[i + 2].xValue - points[i].xValue)) : 0;
            }
            else if (i === (count - 1)) {
                ySpline[i] = (count > 2) ? (cardinalSplineTension * (points[count - 1].xValue - points[count - 3].xValue)) : 0;
            }
            else {
                ySpline[i] = (cardinalSplineTension * (points[i + 1].xValue - points[i - 1].xValue));
            }
        }
        return ySpline;
    };
    /**
     * To find Clamped Spline Coefficients
     */
    SplineBase.prototype.clampedSplineCofficients = function (points, series, isLow) {
        var count = points.length;
        var ySpline = [];
        var ySplineDuplicate = [];
        for (var i = 0; i < count - 1; i++) {
            if (series.type === "SplineRangeArea") {
                if (!isLow) {
                    points[1].yValue = points[1].high > points[1].low ? points[1].high : points[1].low;
                    points[0].yValue = points[0].high > points[0].low ? points[0].high : points[0].low;
                    points[points.length - 1].yValue = points[points.length - 1].high > points[points.length - 1].low ?
                        points[points.length - 1].high : points[points.length - 1].low;
                    points[points.length - 2].yValue = points[points.length - 2].high > points[points.length - 2].low ?
                        points[points.length - 2].high : points[points.length - 2].low;
                }
                if (isLow) {
                    points[1].yValue = points[1].low < points[1].high ? points[1].low : points[1].high;
                    points[0].yValue = points[0].low < points[0].high ? points[0].low : points[0].high;
                    points[points.length - 1].yValue = points[points.length - 1].low < points[points.length - 1].high ?
                        points[points.length - 1].low : points[points.length - 1].high;
                    points[points.length - 2].yValue = points[points.length - 2].low < points[points.length - 2].high ?
                        points[points.length - 2].low : points[points.length - 2].high;
                }
            }
            ySpline[0] = (3 * (points[1].yValue - points[0].yValue)) / (points[1].xValue - points[0].xValue) - 3;
            ySplineDuplicate[0] = 0.5;
            ySpline[points.length - 1] = (3 * (points[points.length - 1].yValue - points[points.length - 2].yValue)) /
                (points[points.length - 1].xValue - points[points.length - 2].xValue);
            ySpline[0] = ySplineDuplicate[0] = Math.abs(ySpline[0]) === Infinity ? 0 : ySpline[0];
            ySpline[points.length - 1] = ySplineDuplicate[points.length - 1] = Math.abs(ySpline[points.length - 1]) === Infinity ?
                0 : ySpline[points.length - 1];
        }
        return ySpline;
    };
    /**
     * To find Natural Spline Coefficients
     */
    SplineBase.prototype.naturalSplineCoefficients = function (points, series, isLow) {
        var count = points.length;
        var ySpline = [];
        var ySplineDuplicate = [];
        var dy1;
        var dy2;
        var coefficient1;
        var coefficient2;
        var coefficient3;
        ySpline[0] = ySplineDuplicate[0] = 0;
        ySpline[points.length - 1] = 0;
        for (var i = 1; i < count - 1; i++) {
            if (series.type === "SplineRangeArea") {
                if (!isLow) {
                    points[i + 1].yValue = points[i + 1].low > points[i + 1].high ? points[i + 1].low : points[i + 1].high;
                    points[i].yValue = points[i].low > points[i].high ? points[i].low : points[i].high;
                    points[i - 1].yValue = points[i - 1].low > points[i - 1].high ? points[i - 1].low : points[i - 1].high;
                }
                if (isLow) {
                    points[i + 1].yValue = points[i + 1].high < points[i + 1].low ? points[i + 1].high : points[i + 1].low;
                    points[i].yValue = points[i].high < points[i].low ? points[i].high : points[i].low;
                    points[i - 1].yValue = points[i - 1].high < points[i - 1].low ? points[i - 1].high : points[i - 1].low;
                }
            }
            coefficient1 = points[i].xValue - points[i - 1].xValue;
            coefficient2 = points[i + 1].xValue - points[i - 1].xValue;
            coefficient3 = points[i + 1].xValue - points[i].xValue;
            dy1 = points[i + 1].yValue - points[i].yValue || null;
            dy2 = points[i].yValue - points[i - 1].yValue || null;
            if (coefficient1 === 0 || coefficient2 === 0 || coefficient3 === 0) {
                ySpline[i] = 0;
                ySplineDuplicate[i] = 0;
            }
            else {
                var p = 1 / (coefficient1 * ySpline[i - 1] + 2 * coefficient2);
                ySpline[i] = -p * coefficient3;
                ySplineDuplicate[i] = p * (6 * (dy1 / coefficient3 - dy2 / coefficient1) - coefficient1 * ySplineDuplicate[i - 1]);
            }
        }
        for (var k = count - 2; k >= 0; k--) {
            ySpline[k] = ySpline[k] * ySpline[k + 1] + ySplineDuplicate[k];
        }
        return ySpline;
    };
    /**
     * To find the control points for spline.
     *
     * @returns {void}
     * @private
     */
    SplineBase.prototype.getControlPoints = function (point1, point2, ySpline1, ySpline2, series) {
        var controlPoint1;
        var controlPoint2;
        var point;
        var ySplineDuplicate1 = ySpline1;
        var ySplineDuplicate2 = ySpline2;
        var xValue1 = point1.xValue;
        var yValue1 = point1.yValue;
        var xValue2 = point2.xValue;
        var yValue2 = point2.yValue;
        switch (series.splineType) {
            case 'Cardinal':
                if (series.xAxis.valueType === 'DateTime') {
                    ySplineDuplicate1 = ySpline1 / this.dateTimeInterval(series);
                    ySplineDuplicate2 = ySpline2 / this.dateTimeInterval(series);
                }
                controlPoint1 = new ChartLocation(xValue1 + ySpline1 / 3, yValue1 + ySplineDuplicate1 / 3);
                controlPoint2 = new ChartLocation(xValue2 - ySpline2 / 3, yValue2 - ySplineDuplicate2 / 3);
                point = new ControlPoints(controlPoint1, controlPoint2);
                break;
            case 'Monotonic':
                var value = (xValue2 - xValue1) / 3;
                controlPoint1 = new ChartLocation(xValue1 + value, yValue1 + ySpline1 * value);
                controlPoint2 = new ChartLocation(xValue2 - value, yValue2 - ySpline2 * value);
                point = new ControlPoints(controlPoint1, controlPoint2);
                break;
            default:
                var one3 = 1 / 3.0;
                var deltaX2 = (xValue2 - xValue1);
                deltaX2 = deltaX2 * deltaX2;
                var y1 = one3 * (((2 * yValue1) + yValue2) - one3 * deltaX2 * (ySpline1 + 0.5 * ySpline2));
                var y2 = one3 * ((yValue1 + (2 * yValue2)) - one3 * deltaX2 * (0.5 * ySpline1 + ySpline2));
                controlPoint1 = new ChartLocation((2 * (xValue1) + (xValue2)) * one3, y1);
                controlPoint2 = new ChartLocation(((xValue1) + 2 * (xValue2)) * one3, y2);
                point = new ControlPoints(controlPoint1, controlPoint2);
                break;
        }
        return point;
    };
    /**
     * calculate datetime interval in hours
     */
    SplineBase.prototype.dateTimeInterval = function (series) {
        var interval = series.xAxis.actualIntervalType;
        var intervalInMilliseconds;
        if (interval === 'Years') {
            intervalInMilliseconds = 365 * 24 * 60 * 60 * 1000;
        }
        else if (interval === 'Months') {
            intervalInMilliseconds = 30 * 24 * 60 * 60 * 1000;
        }
        else if (interval === 'Days') {
            intervalInMilliseconds = 24 * 60 * 60 * 1000;
        }
        else if (interval === 'Hours') {
            intervalInMilliseconds = 60 * 60 * 1000;
        }
        else if (interval === 'Minutes') {
            intervalInMilliseconds = 60 * 1000;
        }
        else if (interval === 'Seconds') {
            intervalInMilliseconds = 1000;
        }
        else {
            intervalInMilliseconds = 30 * 24 * 60 * 60 * 1000;
        }
        return intervalInMilliseconds;
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    SplineBase.prototype.doAnimation = function (series) {
        var option = series.animation;
        this.doLinearAnimation(series, option);
    };
    return SplineBase;
}(LineBase));
export { SplineBase };
