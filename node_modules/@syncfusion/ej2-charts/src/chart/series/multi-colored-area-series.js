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
/* eslint-disable jsdoc/require-param */
import { getPoint, withInRange, ChartLocation } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { MultiColoredSeries } from './multi-colored-base';
/**
 * `MultiColoredAreaSeries` module used to render the area series with multi color.
 */
var MultiColoredAreaSeries = /** @class */ (function (_super) {
    __extends(MultiColoredAreaSeries, _super);
    function MultiColoredAreaSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render Area series.
     *
     * @returns {void}
     * @private
     */
    MultiColoredAreaSeries.prototype.render = function (series, xAxis, yAxis, isInverted) {
        var _this = this;
        var firstPoint;
        var startPoint = null;
        var direction = '';
        var origin = Math.max(series.yAxis.visibleRange.min, 0);
        var options = [];
        var startRegion;
        var previous;
        var rendered;
        var segments = this.sortSegments(series, series.segments);
        series.visiblePoints.map(function (point, i, seriesPoints) {
            point.symbolLocations = [];
            point.regions = [];
            rendered = false;
            if (point.visible && withInRange(seriesPoints[i - 1], point, seriesPoints[i + 1], series)) {
                direction += _this.getAreaPathDirection(point.xValue, origin, series, isInverted, getPoint, startPoint, 'M');
                startPoint = startPoint || new ChartLocation(point.xValue, origin);
                firstPoint = getPoint(point.xValue, point.yValue, xAxis, yAxis, isInverted);
                if (previous && _this.setPointColor(point, previous, series, series.segmentAxis === 'X', segments)) {
                    rendered = true;
                    startRegion = getPoint(startPoint.x, origin, xAxis, yAxis, isInverted);
                    direction += ('L' + ' ' + (firstPoint.x) + ' ' + (firstPoint.y) + ' ');
                    direction += ('L' + ' ' + (firstPoint.x) + ' ' + (startRegion.y) + ' ');
                    _this.generatePathOption(options, series, previous, direction, '_Point_' + previous.index);
                    direction = 'M' + ' ' + (firstPoint.x) + ' ' + (startRegion.y) + ' ' + 'L' + ' ' +
                        (firstPoint.x) + ' ' + (firstPoint.y) + ' ';
                }
                else {
                    direction += ('L' + ' ' + (firstPoint.x) + ' ' + (firstPoint.y) + ' ');
                    _this.setPointColor(point, null, series, series.segmentAxis === 'X', segments);
                }
                if (seriesPoints[i + 1] && !seriesPoints[i + 1].visible && series.emptyPointSettings.mode !== 'Drop') {
                    direction += _this.getAreaEmptyDirection({ 'x': point.xValue, 'y': origin }, startPoint, series, isInverted, getPoint);
                    startPoint = null;
                }
                previous = point;
                _this.storePointLocation(point, series, isInverted, getPoint);
            }
        });
        if (!isNullOrUndefined(rendered) && !rendered) {
            direction = series.points.length > 1 ?
                (direction + this.getAreaPathDirection(previous.xValue, origin, series, isInverted, getPoint, null, 'L')) : '';
            this.generatePathOption(options, series, previous, direction, '');
        }
        this.applySegmentAxis(series, options, segments);
        this.renderMarker(series);
    };
    /**
     * To Store the path directions of the area
     */
    MultiColoredAreaSeries.prototype.generatePathOption = function (options, series, point, direction, id) {
        options.push(new PathOption(series.chart.element.id + '_Series_' + series.index + id, series.setPointColor(point, series.interior), series.border.width, series.border.color, series.opacity, series.dashArray, direction));
    };
    /**
     * To destroy the area series.
     *
     * @returns {void}
     * @private
     */
    MultiColoredAreaSeries.prototype.destroy = function () {
        /**
         * Destroy method calling here
         */
    };
    /**
     * Get module name
     */
    MultiColoredAreaSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'MultiColoredAreaSeries';
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    MultiColoredAreaSeries.prototype.doAnimation = function (series) {
        this.doLinearAnimation(series, series.animation);
    };
    return MultiColoredAreaSeries;
}(MultiColoredSeries));
export { MultiColoredAreaSeries };
