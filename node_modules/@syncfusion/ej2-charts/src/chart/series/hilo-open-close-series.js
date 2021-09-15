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
/* eslint-disable valid-jsdoc */
/* eslint-disable jsdoc/require-param */
import { withInRange, pathAnimation, getElement } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { ColumnBase } from './column-base';
/**
 * `HiloOpenCloseSeries` module is used to render the hiloOpenClose series.
 */
var HiloOpenCloseSeries = /** @class */ (function (_super) {
    __extends(HiloOpenCloseSeries, _super);
    function HiloOpenCloseSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render HiloOpenCloseSeries series.
     *
     * @returns {void}
     * @private
     */
    HiloOpenCloseSeries.prototype.render = function (series) {
        var highLowRect;
        var index1;
        var index2;
        var sideBySideInfo = this.getSideBySideInfo(series);
        var argsData;
        var borderWidth = Math.max(series.border.width, 2);
        for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
            var point = _a[_i];
            point.symbolLocations = [];
            point.regions = [];
            if (point.visible &&
                withInRange(series.points[point.index - 1], point, series.points[point.index + 1], series)) {
                //highlow
                highLowRect = this.getRectangle(point.xValue + sideBySideInfo.start, Math.max(point.high, point.low), point.xValue + sideBySideInfo.end, Math.min(point.high, point.low), series);
                point.regions.push(this.getRectangle(point.xValue + sideBySideInfo.median, Math.max(point.high, point.low), point.xValue + sideBySideInfo.median, Math.min(point.high, point.low), series));
                this.updateTickRegion(!series.chart.requireInvertedAxis, point.regions[0], borderWidth);
                //open
                point.regions.push(this.getRectangle(point.xValue + sideBySideInfo.start, Math.max(point.open, point.close), point.xValue + sideBySideInfo.median, Math.max(point.open, point.close), series));
                //close
                point.regions.push(this.getRectangle(point.xValue + sideBySideInfo.median, Math.min(point.open, point.close), point.xValue + sideBySideInfo.end, Math.min(point.open, point.close), series));
                argsData = this.triggerPointRenderEvent(series, point);
                if (!argsData.cancel) {
                    this.updateSymbolLocation(point, point.regions[0], series);
                    index1 = point.open > point.close ? 1 : 2;
                    index2 = point.open > point.close ? 2 : 1;
                    var open_1 = { x: point.regions[index1].x, y: point.regions[index1].y };
                    var close_1 = { x: point.regions[index2].x, y: point.regions[index2].y };
                    this.drawHiloOpenClosePath(series, point, open_1, close_1, highLowRect, argsData);
                }
                this.updateTickRegion(series.chart.requireInvertedAxis, point.regions[1], borderWidth);
                this.updateTickRegion(series.chart.requireInvertedAxis, point.regions[2], borderWidth);
            }
        }
    };
    /**
     * Updates the tick region
     */
    HiloOpenCloseSeries.prototype.updateTickRegion = function (horizontal, region, borderWidth) {
        if (horizontal) {
            region.x -= borderWidth / 2;
            region.width = borderWidth;
        }
        else {
            region.y -= borderWidth / 2;
            region.height = borderWidth;
        }
    };
    /**
     * Trigger point rendering event
     */
    HiloOpenCloseSeries.prototype.triggerPointRenderEvent = function (series, point) {
        var fill = (point.open <= point.close) ? series.bearFillColor : series.bullFillColor;
        var border = { color: series.border.color, width: Math.max(series.border.width, 1) };
        return this.triggerEvent(series, point, fill, border);
    };
    /**
     * To draw the rectangle for points.
     *
     * @returns {void}
     * @private
     */
    HiloOpenCloseSeries.prototype.drawHiloOpenClosePath = function (series, point, open, close, rect, argsData) {
        // region highlow
        var direction;
        if (series.chart.requireInvertedAxis) {
            direction = ('M' + ' ' + (rect.x) + ' ' + (rect.y + rect.height / 2) + ' ' +
                'L' + ' ' + (rect.x + rect.width) + ' ' + (rect.y + rect.height / 2) + ' ');
            direction += ('M' + ' ' + (open.x) + ' ' + (rect.y + rect.height / 2) + ' ' +
                'L' + ' ' + (open.x) + ' ' + (rect.y + rect.height) + ' ');
            direction += ('M' + ' ' + (close.x) + ' ' + (rect.y + rect.height / 2) + ' ' +
                'L' + ' ' + (close.x) + ' ' + (rect.y) + ' ');
        }
        else {
            direction = ('M' + ' ' + (rect.x + rect.width / 2) + ' ' + (rect.y + rect.height) + ' ' +
                'L' + ' ' + (rect.x + rect.width / 2) + ' ' + (rect.y) + ' ');
            //region opentick
            direction += ('M' + ' ' + (rect.x) + ' ' + (open.y) + ' ' +
                'L' + ' ' + (rect.x + rect.width / 2) + ' ' + (open.y) + ' ');
            //region closetick
            direction += ('M' + ' ' + (rect.x + rect.width / 2) + ' ' + (close.y) + ' ' +
                'L' + ' ' + (rect.x + rect.width) + ' ' + (close.y) + ' ');
        }
        var options = new PathOption(series.chart.element.id + '_Series_' + series.index + '_Point_' + point.index, argsData.fill, argsData.border.width, argsData.fill, series.opacity, series.dashArray, direction);
        pathAnimation(getElement(options.id), direction, series.chart.redraw);
        var element = series.chart.renderer.drawPath(options, new Int32Array([series.clipRect.x, series.clipRect.y]));
        element.setAttribute('aria-label', point.x.toString() + ':' + point.high.toString()
            + ':' + point.low.toString() + ':' + point.close.toString() + ':' + point.open.toString());
        if (!series.chart.enableCanvas) {
            series.seriesElement.appendChild(element);
        }
    };
    /**
     * Get module name.
     */
    HiloOpenCloseSeries.prototype.getModuleName = function () {
        return 'HiloOpenCloseSeries';
        /**
         * return the module name
         */
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    HiloOpenCloseSeries.prototype.doAnimation = function (series) {
        this.animate(series);
    };
    /**
     * To destroy the column series.
     *
     * @returns {void}
     * @private
     */
    HiloOpenCloseSeries.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return HiloOpenCloseSeries;
}(ColumnBase));
export { HiloOpenCloseSeries };
