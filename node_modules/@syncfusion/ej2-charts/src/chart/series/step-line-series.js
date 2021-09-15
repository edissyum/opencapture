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
import { getPoint, withInRange } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { LineBase } from './line-base';
/**
 * `StepLineSeries` module is used to render the step line series.
 */
var StepLineSeries = /** @class */ (function (_super) {
    __extends(StepLineSeries, _super);
    function StepLineSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render the Step line series.
     *
     * @returns {void}
     * @private
     */
    StepLineSeries.prototype.render = function (series, xAxis, yAxis, isInverted) {
        var direction = '';
        var startPoint = 'M';
        var prevPoint = null;
        var lineLength;
        var point1;
        var point2;
        var visiblePoints = this.enableComplexProperty(series);
        if (xAxis.valueType === 'Category' && xAxis.labelPlacement === 'BetweenTicks') {
            lineLength = 0.5;
        }
        else {
            lineLength = 0;
        }
        for (var _i = 0, visiblePoints_1 = visiblePoints; _i < visiblePoints_1.length; _i++) {
            var point = visiblePoints_1[_i];
            point.symbolLocations = [];
            point.regions = [];
            if (point.visible && withInRange(visiblePoints[point.index - 1], point, visiblePoints[point.index + 1], series)) {
                if (prevPoint != null) {
                    point2 = getPoint(point.xValue, point.yValue, xAxis, yAxis, isInverted);
                    point1 = getPoint(prevPoint.xValue, prevPoint.yValue, xAxis, yAxis, isInverted);
                    direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ' + 'L' + ' ' +
                        (point2.x) + ' ' + (point1.y) + ' L' + ' ' + (point2.x) + ' ' + (point2.y) + ' ');
                    startPoint = 'L';
                }
                else {
                    point1 = getPoint(point.xValue - lineLength, point.yValue, xAxis, yAxis, isInverted);
                    direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ');
                    startPoint = 'L';
                }
                this.storePointLocation(point, series, isInverted, getPoint);
                prevPoint = point;
            }
            else {
                prevPoint = series.emptyPointSettings.mode === 'Drop' ? prevPoint : null;
                startPoint = series.emptyPointSettings.mode === 'Drop' ? startPoint : 'M';
            }
        }
        if (visiblePoints.length > 0) {
            point1 = getPoint(visiblePoints[visiblePoints.length - 1].xValue + lineLength, visiblePoints[visiblePoints.length - 1].yValue, xAxis, yAxis, isInverted);
            direction = direction.concat(startPoint + ' ' + (point1.x) + ' ' + (point1.y) + ' ');
        }
        var pathOptions = new PathOption(series.chart.element.id + '_Series_' + series.index, 'transparent', series.width, series.interior, series.opacity, series.dashArray, direction);
        this.appendLinePath(pathOptions, series, '');
        this.renderMarker(series);
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    StepLineSeries.prototype.doAnimation = function (series) {
        var option = series.animation;
        this.doLinearAnimation(series, option);
    };
    /**
     * To destroy the step line series.
     *
     * @returns {void}
     * @private
     */
    StepLineSeries.prototype.destroy = function () {
        /**
         * Destroy method calling here
         */
    };
    /**
     * Get module name.
     */
    StepLineSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'StepLineSeries';
    };
    return StepLineSeries;
}(LineBase));
export { StepLineSeries };
