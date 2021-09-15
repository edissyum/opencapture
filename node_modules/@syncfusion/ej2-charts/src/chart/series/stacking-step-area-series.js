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
import { ChartLocation, getPoint, withInRange } from '../../common/utils/helper';
import { PathOption, Rect } from '@syncfusion/ej2-svg-base';
import { LineBase } from './line-base';
/**
 * `StackingStepAreaSeries` module used to render the Stacking Step Area series.
 */
var StackingStepAreaSeries = /** @class */ (function (_super) {
    __extends(StackingStepAreaSeries, _super);
    function StackingStepAreaSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render the Stacking step area series.
     *
     * @returns {void}
     * @private
     */
    StackingStepAreaSeries.prototype.render = function (stackSeries, xAxis, yAxis, isInverted) {
        var currentPointLocation;
        var secondPoint;
        var start = null;
        var direction = '';
        var stackedvalue = stackSeries.stackedValues;
        var visiblePoint = this.enableComplexProperty(stackSeries);
        var origin = Math.max(stackSeries.yAxis.visibleRange.min, stackedvalue.startValues[0]);
        var pointsLength = visiblePoint.length;
        var options;
        var point;
        var point2;
        var point3;
        var xValue;
        var lineLength;
        var prevPoint = null;
        var validIndex;
        var startPoint = 0;
        var pointIndex;
        if (xAxis.valueType === 'Category' && xAxis.labelPlacement === 'BetweenTicks') {
            lineLength = 0.5;
        }
        else {
            lineLength = 0;
        }
        for (var i = 0; i < pointsLength; i++) {
            point = visiblePoint[i];
            xValue = point.xValue;
            point.symbolLocations = [];
            point.regions = [];
            pointIndex = point.index;
            if (point.visible && withInRange(visiblePoint[i - 1], point, visiblePoint[i + 1], stackSeries)) {
                if (start === null) {
                    start = new ChartLocation(xValue, 0);
                    currentPointLocation = getPoint(xValue - lineLength, origin, xAxis, yAxis, isInverted);
                    direction += ('M' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ');
                    currentPointLocation = getPoint(xValue - lineLength, stackedvalue.endValues[pointIndex], xAxis, yAxis, isInverted);
                    direction += ('L' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ');
                }
                if (prevPoint != null) {
                    currentPointLocation = getPoint(point.xValue, stackedvalue.endValues[pointIndex], xAxis, yAxis, isInverted);
                    secondPoint = getPoint(prevPoint.xValue, stackedvalue.endValues[prevPoint.index], xAxis, yAxis, isInverted);
                    direction += ('L' + ' ' + (currentPointLocation.x) + ' ' + (secondPoint.y) +
                        ' L' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ');
                }
                else if (stackSeries.emptyPointSettings.mode === 'Gap') {
                    currentPointLocation = getPoint(point.xValue, stackedvalue.endValues[pointIndex], xAxis, yAxis, isInverted);
                    direction += 'L' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ';
                }
                visiblePoint[i].symbolLocations.push(getPoint(visiblePoint[i].xValue, stackedvalue.endValues[pointIndex], xAxis, yAxis, isInverted));
                visiblePoint[i].regions.push(new Rect(visiblePoint[i].symbolLocations[0].x - stackSeries.marker.width, visiblePoint[i].symbolLocations[0].y - stackSeries.marker.height, 2 * stackSeries.marker.width, 2 * stackSeries.marker.height));
                prevPoint = point;
            }
            // If we set the empty point mode is Gap or next point of the current point is false, we will close the series path.
            if (visiblePoint[i + 1] && !visiblePoint[i + 1].visible && stackSeries.emptyPointSettings.mode !== 'Drop') {
                var previousPointIndex = void 0;
                for (var j = i; j >= startPoint; j--) {
                    pointIndex = visiblePoint[j].index;
                    previousPointIndex = j === 0 ? 0 : visiblePoint[j - 1].index;
                    if (j !== 0 && (stackedvalue.startValues[pointIndex] < stackedvalue.startValues[previousPointIndex] ||
                        stackedvalue.startValues[pointIndex] > stackedvalue.startValues[previousPointIndex])) {
                        currentPointLocation = getPoint(visiblePoint[pointIndex].xValue, stackedvalue.startValues[pointIndex], xAxis, yAxis, isInverted);
                        direction = direction.concat('L' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ');
                        currentPointLocation = getPoint(visiblePoint[pointIndex].xValue, stackedvalue.startValues[previousPointIndex], xAxis, yAxis, isInverted);
                    }
                    else {
                        currentPointLocation = getPoint(visiblePoint[pointIndex].xValue, stackedvalue.startValues[pointIndex], xAxis, yAxis, isInverted);
                    }
                    direction = direction.concat('L' + ' ' + (currentPointLocation.x) + ' ' + (currentPointLocation.y) + ' ');
                }
                startPoint = i + 1;
                start = null;
                prevPoint = null;
            }
        }
        if (direction !== '') {
            // For category axis
            if (pointsLength > 1) {
                pointIndex = visiblePoint[pointsLength - 1].index;
                start = { 'x': visiblePoint[pointsLength - 1].xValue + lineLength, 'y': stackedvalue.endValues[pointIndex] };
                secondPoint = getPoint(start.x, start.y, xAxis, yAxis, isInverted);
                direction += ('L' + ' ' + (secondPoint.x) + ' ' + (secondPoint.y) + ' ');
                start = { 'x': visiblePoint[pointsLength - 1].xValue + lineLength, 'y': stackedvalue.startValues[pointIndex] };
                secondPoint = getPoint(start.x, start.y, xAxis, yAxis, isInverted);
                direction += ('L' + ' ' + (secondPoint.x) + ' ' + (secondPoint.y) + ' ');
            }
            // To close the stacked step area series path in reverse order
            for (var j = pointsLength - 1; j >= startPoint; j--) {
                var index = void 0;
                if (visiblePoint[j].visible) {
                    pointIndex = visiblePoint[j].index;
                    point2 = getPoint(visiblePoint[j].xValue, stackedvalue.startValues[pointIndex], xAxis, yAxis, isInverted);
                    direction = direction.concat('L' + ' ' + (point2.x) + ' ' + (point2.y) + ' ');
                }
                if (j !== 0 && !visiblePoint[j - 1].visible) {
                    index = this.getNextVisiblePointIndex(visiblePoint, j);
                }
                if (j !== 0) {
                    validIndex = index ? index : j - 1;
                    pointIndex = index ? visiblePoint[index].index : visiblePoint[j - 1].index;
                    point3 = getPoint(visiblePoint[validIndex].xValue, stackedvalue.startValues[pointIndex], xAxis, yAxis, isInverted);
                    direction = direction.concat('L' + ' ' + (point2.x) + ' ' + (point3.y) + ' ');
                }
            }
            options = new PathOption(stackSeries.chart.element.id + '_Series_' + stackSeries.index, stackSeries.interior, stackSeries.border.width, stackSeries.border.color, stackSeries.opacity, stackSeries.dashArray, direction);
            this.appendLinePath(options, stackSeries, '');
            this.renderMarker(stackSeries);
        }
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    StackingStepAreaSeries.prototype.doAnimation = function (series) {
        var option = series.animation;
        this.doLinearAnimation(series, option);
    };
    /**
     * To destroy the stacking step area.
     *
     * @returns {void}
     * @private
     */
    StackingStepAreaSeries.prototype.destroy = function () {
        /**
         * Destroy method calling here
         */
    };
    /**
     * Get module name.
     */
    StackingStepAreaSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'StackingStepAreaSeries';
    };
    /**
     * To get the nearest visible point
     *
     * @param {Points[]} points points
     * @param {number} j index
     */
    StackingStepAreaSeries.prototype.getNextVisiblePointIndex = function (points, j) {
        var index;
        for (index = j - 1; index >= 0; index--) {
            if (!points[index].visible) {
                continue;
            }
            else {
                return index;
            }
        }
        return 0;
    };
    return StackingStepAreaSeries;
}(LineBase));
export { StackingStepAreaSeries };
