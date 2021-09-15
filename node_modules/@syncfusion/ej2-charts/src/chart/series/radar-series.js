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
import { firstToLowerCase, CoefficientToVector, valueToPolarCoefficient } from '../../common/utils/helper';
import { PolarSeries } from '../series/polar-series';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * `RadarSeries` module is used to render the radar series.
 */
var RadarSeries = /** @class */ (function (_super) {
    __extends(RadarSeries, _super);
    function RadarSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render radar Series.
     *
     * @returns {void}
     * @private
     */
    RadarSeries.prototype.render = function (series, xAxis, yAxis, inverted) {
        var seriesType = firstToLowerCase(series.drawType);
        var yAxisMin = yAxis.minimum;
        var yAxisMax = yAxis.maximum;
        for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
            var point = _a[_i];
            point.visible = point.visible && !((!isNullOrUndefined(yAxisMin) && point.yValue < yAxisMin) ||
                (!isNullOrUndefined(yAxisMax) && point.yValue > yAxisMax));
        }
        if (series.points.length) {
            if (series.drawType.indexOf('Column') === -1) {
                series.chart[seriesType + 'SeriesModule'].render(series, xAxis, yAxis, inverted);
            }
            else {
                this.columnDrawTypeRender(series, xAxis, yAxis);
            }
        }
    };
    // path calculation for isInversed polar area series
    RadarSeries.prototype.getRadarIsInversedPath = function (xAxis, endPoint) {
        var chart = this.chart;
        var x1;
        var y1;
        var vector;
        var radius = chart.radius;
        var length = xAxis.visibleLabels.length;
        var direction = endPoint;
        vector = CoefficientToVector(valueToPolarCoefficient(xAxis.visibleLabels[0].value, xAxis), this.startAngle);
        y1 = this.centerY + radius * vector.y;
        x1 = this.centerX + radius * vector.x;
        direction += ' L ' + x1 + ' ' + y1 + ' ';
        for (var i = length - 1; i >= 0; i--) {
            vector = CoefficientToVector(valueToPolarCoefficient(xAxis.visibleLabels[i].value, xAxis), this.startAngle);
            y1 = this.centerY + radius * vector.y;
            x1 = this.centerX + radius * vector.x;
            direction += 'L ' + x1 + ' ' + y1 + ' ';
        }
        return direction;
    };
    /**
     * Get module name.
     */
    RadarSeries.prototype.getModuleName = function () {
        /**
         * Returns the module name of the series
         */
        return 'RadarSeries';
    };
    /**
     * To destroy the radar series.
     *
     * @returns {void}
     * @private
     */
    RadarSeries.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return RadarSeries;
}(PolarSeries));
export { RadarSeries };
