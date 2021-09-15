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
/* eslint-disable jsdoc/require-returns */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { getPoint, withInRange, ChartLocation } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { LineBase } from './line-base';
/**
 * `StepAreaSeries` Module used to render the step area series.
 */
var StepAreaSeries = /** @class */ (function (_super) {
    __extends(StepAreaSeries, _super);
    function StepAreaSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render StepArea series.
     *
     * @returns {void}
     * @private
     */
    StepAreaSeries.prototype.render = function (series, xAxis, yAxis, isInverted) {
        var currentPoint;
        var secondPoint;
        var start = null;
        var direction = '';
        var visiblePoints = this.enableComplexProperty(series);
        var pointsLength = visiblePoints.length;
        var origin = Math.max(series.yAxis.visibleRange.min, 0);
        var point;
        var xValue;
        var lineLength;
        var prevPoint = null;
        if (xAxis.valueType === 'Category' && xAxis.labelPlacement === 'BetweenTicks') {
            lineLength = 0.5;
        }
        else {
            lineLength = 0;
        }
        for (var i = 0; i < pointsLength; i++) {
            point = visiblePoints[i];
            xValue = point.xValue;
            point.symbolLocations = [];
            point.regions = [];
            if (point.visible && withInRange(visiblePoints[i - 1], point, visiblePoints[i + 1], series)) {
                if (start === null) {
                    start = new ChartLocation(xValue, 0);
                    // Start point for the current path
                    currentPoint = getPoint(xValue - lineLength, origin, xAxis, yAxis, isInverted);
                    direction += ('M' + ' ' + (currentPoint.x) + ' ' + (currentPoint.y) + ' ');
                    currentPoint = getPoint(xValue - lineLength, point.yValue, xAxis, yAxis, isInverted);
                    direction += ('L' + ' ' + (currentPoint.x) + ' ' + (currentPoint.y) + ' ');
                }
                // First Point to draw the Steparea path
                if (prevPoint != null) {
                    currentPoint = getPoint(point.xValue, point.yValue, xAxis, yAxis, isInverted);
                    secondPoint = getPoint(prevPoint.xValue, prevPoint.yValue, xAxis, yAxis, isInverted);
                    direction += ('L' + ' ' +
                        (currentPoint.x) + ' ' + (secondPoint.y) + ' L' + ' ' + (currentPoint.x) + ' ' + (currentPoint.y) + ' ');
                }
                else if (series.emptyPointSettings.mode === 'Gap') {
                    currentPoint = getPoint(point.xValue, point.yValue, xAxis, yAxis, isInverted);
                    direction += 'L' + ' ' + (currentPoint.x) + ' ' + (currentPoint.y) + ' ';
                }
                this.storePointLocation(point, series, isInverted, getPoint);
                prevPoint = point;
            }
            if (visiblePoints[i + 1] && !visiblePoints[i + 1].visible && series.emptyPointSettings.mode !== 'Drop') {
                // current start point
                currentPoint = getPoint(xValue + lineLength, origin, xAxis, yAxis, isInverted);
                direction += ('L' + ' ' + (currentPoint.x) + ' ' + (currentPoint.y));
                start = null;
                prevPoint = null;
            }
        }
        if ((pointsLength > 1) && direction !== '') {
            start = { 'x': visiblePoints[pointsLength - 1].xValue + lineLength, 'y': visiblePoints[pointsLength - 1].yValue };
            secondPoint = getPoint(start.x, start.y, xAxis, yAxis, isInverted);
            direction += ('L' + ' ' + (secondPoint.x) + ' ' + (secondPoint.y) + ' ');
            start = { 'x': visiblePoints[pointsLength - 1].xValue + lineLength, 'y': origin };
            secondPoint = getPoint(start.x, start.y, xAxis, yAxis, isInverted);
            direction += ('L' + ' ' + (secondPoint.x) + ' ' + (secondPoint.y) + ' ');
        }
        else {
            direction = '';
        }
        var options = new PathOption(series.chart.element.id + '_Series_' + series.index, series.interior, series.border.width, series.border.color, series.opacity, series.dashArray, direction);
        this.appendLinePath(options, series, '');
        this.renderMarker(series);
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    StepAreaSeries.prototype.doAnimation = function (series) {
        var option = series.animation;
        this.doLinearAnimation(series, option);
    };
    /**
     * To destroy the step Area series.
     *
     * @returns {void}
     * @private
     */
    StepAreaSeries.prototype.destroy = function () {
        /**
         * Destroy method calling here
         */
    };
    /**
     * Get module name.
     */
    StepAreaSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'StepAreaSeries';
    };
    return StepAreaSeries;
}(LineBase));
export { StepAreaSeries };
