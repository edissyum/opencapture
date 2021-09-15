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
import { withInRange, getPoint } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { MultiColoredSeries } from './multi-colored-base';
/**
 * `MultiColoredLineSeries` used to render the line series with multi color.
 */
var MultiColoredLineSeries = /** @class */ (function (_super) {
    __extends(MultiColoredLineSeries, _super);
    function MultiColoredLineSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render Line Series.
     *
     * @returns {void}
     * @private
     */
    MultiColoredLineSeries.prototype.render = function (series, xAxis, yAxis, isInverted) {
        var previous = null;
        var startPoint = 'M';
        var visiblePoints = this.enableComplexProperty(series);
        var options = [];
        var direction = '';
        var segments = this.sortSegments(series, series.segments);
        for (var _i = 0, visiblePoints_1 = visiblePoints; _i < visiblePoints_1.length; _i++) {
            var point = visiblePoints_1[_i];
            point.regions = [];
            if (point.visible && withInRange(visiblePoints[point.index - 1], point, visiblePoints[point.index + 1], series)) {
                direction += this.getLineDirection(previous, point, series, isInverted, getPoint, startPoint);
                if (previous != null) {
                    if (this.setPointColor(point, previous, series, series.segmentAxis === 'X', segments)) {
                        options.push(new PathOption(series.chart.element.id + '_Series_' + series.index + '_Point_' + previous.index, 'none', series.width, series.setPointColor(previous, series.interior), series.opacity, series.dashArray, direction));
                        startPoint = 'M';
                        direction = '';
                    }
                    else {
                        startPoint = 'L';
                    }
                }
                else {
                    this.setPointColor(point, null, series, series.segmentAxis === 'X', segments);
                }
                previous = point;
                this.storePointLocation(point, series, isInverted, getPoint);
            }
            else {
                previous = (series.emptyPointSettings.mode === 'Drop') ? previous : null;
                startPoint = (series.emptyPointSettings.mode === 'Drop') ? startPoint : 'M';
                point.symbolLocations = [];
            }
        }
        if (direction !== '') {
            options.push(new PathOption(series.chart.element.id + '_Series_' + series.index, 'none', series.width, series.setPointColor(visiblePoints[visiblePoints.length - 1], series.interior), series.opacity, series.dashArray, direction));
        }
        this.applySegmentAxis(series, options, segments);
        this.renderMarker(series);
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    MultiColoredLineSeries.prototype.doAnimation = function (series) {
        this.doLinearAnimation(series, series.animation);
    };
    /**
     * Get module name.
     */
    MultiColoredLineSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'MultiColoredLineSeries';
    };
    /**
     * To destroy the line series.
     *
     * @returns {void}
     * @private
     */
    MultiColoredLineSeries.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return MultiColoredLineSeries;
}(MultiColoredSeries));
export { MultiColoredLineSeries };
