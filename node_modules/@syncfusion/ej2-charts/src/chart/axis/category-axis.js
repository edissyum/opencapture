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
import { getActualDesiredIntervalsCount, triggerLabelRender } from '../../common/utils/helper';
import { DoubleRange } from '../utils/double-range';
import { withIn } from '../../common/utils/helper';
import { extend, getValue } from '@syncfusion/ej2-base';
import { NiceInterval } from '../axis/axis-helper';
/**
 * `Category` module is used to render category axis.
 */
var Category = /** @class */ (function (_super) {
    __extends(Category, _super);
    /**
     * Constructor for the category module.
     *
     * @private
     */
    function Category(chart) {
        return _super.call(this, chart) || this;
    }
    /**
     * The function to calculate the range and labels for the axis.
     *
     * @returns {void}
     */
    Category.prototype.calculateRangeAndInterval = function (size, axis) {
        this.calculateRange(axis);
        this.getActualRange(axis, size);
        this.applyRangePadding(axis, size);
        this.calculateVisibleLabels(axis);
    };
    /**
     * Actual Range for the axis.
     *
     * @private
     */
    Category.prototype.getActualRange = function (axis, size) {
        this.initializeDoubleRange(axis);
        // axis.doubleRange = new DoubleRange(<number>this.min, <number>this.max);
        axis.actualRange = {};
        if (!axis.interval) {
            axis.actualRange.interval = Math.max(1, Math.floor(axis.doubleRange.delta / getActualDesiredIntervalsCount(size, axis)));
        }
        else {
            axis.actualRange.interval = Math.ceil(axis.interval);
        }
        axis.actualRange.min = axis.doubleRange.start;
        axis.actualRange.max = axis.doubleRange.end;
        axis.actualRange.delta = axis.doubleRange.delta;
    };
    /**
     * Padding for the axis.
     *
     * @private
     */
    Category.prototype.applyRangePadding = function (axis, size) {
        var ticks = (axis.labelPlacement === 'BetweenTicks' && this.chart.chartAreaType !== 'PolarRadar') ? 0.5 : 0;
        if (ticks > 0) {
            axis.actualRange.min -= ticks;
            axis.actualRange.max += ticks;
        }
        else {
            axis.actualRange.max += axis.actualRange.max ? 0 : 0.5;
        }
        axis.doubleRange = new DoubleRange(axis.actualRange.min, axis.actualRange.max);
        axis.actualRange.delta = axis.doubleRange.delta;
        this.calculateVisibleRange(size, axis);
    };
    /**
     * Calculate label for the axis.
     *
     * @private
     */
    Category.prototype.calculateVisibleLabels = function (axis) {
        /*! Generate axis labels */
        axis.visibleLabels = [];
        var tempInterval = Math.ceil(axis.visibleRange.min);
        var labelStyle;
        if (axis.zoomFactor < 1 || axis.zoomPosition > 0) {
            tempInterval = axis.visibleRange.min - (axis.visibleRange.min % axis.visibleRange.interval);
        }
        var position;
        axis.startLabel = axis.labels[Math.round(axis.visibleRange.min)];
        axis.endLabel = axis.labels[Math.floor(axis.visibleRange.max)];
        for (; tempInterval <= axis.visibleRange.max; tempInterval += axis.visibleRange.interval) {
            labelStyle = (extend({}, getValue('properties', axis.labelStyle), null, true));
            if (withIn(tempInterval, axis.visibleRange) && axis.labels.length > 0) {
                position = Math.round(tempInterval);
                triggerLabelRender(this.chart, position, axis.labels[position] ? axis.labels[position].toString() : position.toString(), labelStyle, axis);
            }
        }
        if (axis.getMaxLabelWidth) {
            axis.getMaxLabelWidth(this.chart);
        }
    };
    /**
     * Get module name
     */
    Category.prototype.getModuleName = function () {
        /**
         * Returns the module name
         */
        return 'Category';
    };
    /**
     * To destroy the category axis.
     *
     * @returns {void}
     * @private
     */
    Category.prototype.destroy = function () {
        /**
         * Destroy method performed here
         */
    };
    return Category;
}(NiceInterval));
export { Category };
