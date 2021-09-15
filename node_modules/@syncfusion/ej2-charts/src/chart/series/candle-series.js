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
import { withInRange, pathAnimation, getElement } from '../../common/utils/helper';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { ColumnBase } from './column-base';
/**
 * `CandleSeries` module is used to render the candle series.
 */
var CandleSeries = /** @class */ (function (_super) {
    __extends(CandleSeries, _super);
    function CandleSeries() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Render Candle series.
     *
     * @returns {void}
     * @private
     */
    CandleSeries.prototype.render = function (series) {
        var sideBySideInfo = this.getSideBySideInfo(series);
        var argsData;
        var borderWidth = Math.max(series.border.width, 1);
        for (var _i = 0, _a = series.points; _i < _a.length; _i++) {
            var point = _a[_i];
            var direction = '';
            var centerRegion = void 0;
            var tickRegion = void 0;
            //initializing after zooming and also normal initialization
            point.regions = [];
            point.symbolLocations = [];
            if (point.visible && withInRange(series.points[point.index - 1], point, series.points[point.index + 1], series)) {
                //region to cover the top and bottom ticks
                tickRegion = this.getRectangle((point.xValue + sideBySideInfo.median), Math.max(point.high, point.low), (point.xValue + sideBySideInfo.median), Math.min(point.high, point.low), series);
                if (!series.chart.requireInvertedAxis) {
                    tickRegion.x -= borderWidth / 2;
                    tickRegion.width = borderWidth;
                }
                else {
                    tickRegion.y -= borderWidth / 2;
                    tickRegion.height = borderWidth;
                }
                //get middleRect
                centerRegion = this.getRectangle((point.xValue + sideBySideInfo.start), Math.max(point.open, point.close), (point.xValue + sideBySideInfo.end), Math.min(point.open, point.close), series);
                direction = this.getPathString(tickRegion, centerRegion, series);
                argsData = this.triggerPointRenderEvent(series, point);
                if (!argsData.cancel) {
                    this.drawCandle(series, point, centerRegion, argsData, direction);
                    this.updateSymbolLocation(point, tickRegion, series);
                    this.updateSymbolLocation(point, centerRegion, series);
                }
            }
        }
    };
    /**
     * Trigger point rendering event
     */
    CandleSeries.prototype.triggerPointRenderEvent = function (series, point) {
        var fill = this.getCandleColor(point, series);
        var border = { color: series.border.color, width: Math.max(series.border.width, 1) };
        return this.triggerEvent(series, point, fill, border);
    };
    /**
     * Find the color of the candle
     *
     * @param {Points} point point
     * @param {Series} series series
     * @returns {string} color of the candle
     * @private
     */
    CandleSeries.prototype.getCandleColor = function (point, series) {
        var previousPoint = series.points[point.index - 1];
        if (series.enableSolidCandles === false) {
            if (!previousPoint) {
                return series.bearFillColor;
            }
            else {
                return previousPoint.close > point.close ? series.bullFillColor :
                    series.bearFillColor;
            }
        }
        else {
            return point.open > point.close ? series.bullFillColor :
                series.bearFillColor;
        }
    };
    /**
     * Finds the path of the candle shape
     *
     * @private
     */
    CandleSeries.prototype.getPathString = function (topRect, midRect, series) {
        var direction = '';
        var center = series.chart.requireInvertedAxis ? topRect.y + topRect.height / 2 :
            topRect.x + topRect.width / 2;
        //tick 1 segment
        direction += !series.chart.requireInvertedAxis ?
            'M' + ' ' + (center) + ' ' + (topRect.y) + ' ' + 'L' + ' ' + (center) + ' ' + midRect.y :
            'M' + ' ' + (topRect.x) + ' ' + (center) + ' ' + 'L' + ' ' + (midRect.x) + ' ' + center;
        direction = direction.concat(' M' + ' ' + (midRect.x) + ' ' + (midRect.y) + ' ' +
            'L' + ' ' + (midRect.x + midRect.width) + ' ' + (midRect.y) + ' ' +
            'L' + ' ' + (midRect.x + midRect.width) + ' ' +
            (midRect.y + midRect.height) + ' ' +
            'L' + ' ' + (midRect.x) + ' ' + (midRect.y + midRect.height) +
            ' ' + 'Z');
        direction += !series.chart.requireInvertedAxis ?
            ' M' + ' ' + (center) + ' ' + (midRect.y + midRect.height) + ' ' + 'L' + ' ' + (center) + ' ' + (topRect.y +
                topRect.height) :
            ' M' + ' ' + (midRect.x + midRect.width) + ' ' + (center) + ' ' + 'L' + ' ' +
                (topRect.x + topRect.width) + ' ' + center;
        return direction;
    };
    /**
     * Draws the candle shape
     *
     * @param {Series} series series
     * @param {Points} point point
     * @param {Rect} rect point region
     * @param {IPointRenderEventArgs} argsData argsData
     * @param {string} direction path direction
     * @returns {void}
     * @private
     */
    CandleSeries.prototype.drawCandle = function (series, point, rect, argsData, direction) {
        var check = series.chart.requireInvertedAxis ? rect.height : rect.width;
        if (check <= 0) {
            return null;
        }
        var fill = !series.enableSolidCandles ?
            (point.open > point.close ? argsData.fill : 'transparent') : argsData.fill;
        argsData.border.color = argsData.fill;
        var options = new PathOption(series.chart.element.id + '_Series_' + series.index + '_Point_' + point.index, fill, argsData.border.width, argsData.border.color, series.opacity, series.dashArray, direction);
        var element = getElement(options.id);
        var previousDirection = element ? element.getAttribute('d') : null;
        var candleElement = series.chart.renderer.drawPath(options, new Int32Array([series.clipRect.x, series.clipRect.y]));
        candleElement.setAttribute('aria-label', point.x.toString() + ':' + point.high.toString()
            + ':' + point.low.toString() + ':' + point.close.toString() + ':' + point.open.toString());
        if (!series.chart.enableCanvas) {
            series.seriesElement.appendChild(candleElement);
        }
        pathAnimation(element, direction, series.chart.redraw, previousDirection);
    };
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    CandleSeries.prototype.doAnimation = function (series) {
        this.animate(series);
    };
    /**
     * Get module name.
     */
    CandleSeries.prototype.getModuleName = function () {
        return 'CandleSeries';
        /**
         * return the module name
         */
    };
    /**
     * To destroy the candle series.
     *
     * @returns {void}
     * @private
     */
    CandleSeries.prototype.destroy = function () {
        /**
         * Destroys the candle series.
         */
    };
    return CandleSeries;
}(ColumnBase));
export { CandleSeries };
