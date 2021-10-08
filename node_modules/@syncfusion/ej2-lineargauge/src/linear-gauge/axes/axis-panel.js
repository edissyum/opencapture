/* eslint-disable valid-jsdoc */
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { axisLabelRender } from '../model/constant';
import { AxisRenderer } from './axis-renderer';
import { VisibleLabels, Size, Align, measureText, Rect, textFormatter, formatValue, stringToNumber } from '../utils/helper';
import { valueToCoefficient, getRangePalette, VisibleRange, withInRange, calculateNiceInterval } from '../utils/helper';
/**
 * @private
 * To calculate the overall axis bounds for gauge.
 */
var AxisLayoutPanel = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    function AxisLayoutPanel(gauge) {
        this.gauge = gauge;
        this.axisRenderer = new AxisRenderer(gauge);
    }
    /**
     * To calculate the axis bounds
     */
    AxisLayoutPanel.prototype.calculateAxesBounds = function () {
        var axis;
        var bounds;
        var pointer;
        this.gauge.nearSizes = [];
        this.gauge.farSizes = [];
        var x;
        var y;
        var width;
        var height;
        var axisPadding = 8;
        var containerRect = this.gauge.containerBounds;
        this.checkThermometer();
        for (var i = 0; i < this.gauge.axes.length; i++) {
            axis = this.gauge.axes[i];
            axis.checkAlign = new Align(i, ((!axis.opposedPosition) ? 'Near' : 'Far'));
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (!axis.opposedPosition) ? this.gauge.nearSizes.push(1) : this.gauge.farSizes.push(1);
            this.calculateLineBounds(axis, i);
            this.calculateTickBounds(axis, i);
            this.calculateLabelBounds(axis, i);
            if (axis.pointers.length > 0) {
                this.calculatePointerBounds(axis, i);
            }
            if (axis.ranges.length > 0) {
                this.calculateRangesBounds(axis, i);
            }
            bounds = axis.labelBounds;
            var offset = this.gauge.axes[i].labelStyle.offset;
            if (this.gauge.orientation === 'Vertical') {
                x = (!axis.opposedPosition) ? bounds.x - offset - axisPadding : axis.lineBounds.x;
                y = axis.lineBounds.y;
                height = axis.lineBounds.height;
                width = Math.abs((!axis.opposedPosition) ? (axis.lineBounds.x - x) : ((bounds.x + bounds.width + axisPadding) - x - offset));
            }
            else {
                y = (!axis.opposedPosition) ? bounds.y - bounds.height - offset - axisPadding : axis.lineBounds.y;
                x = axis.lineBounds.x;
                width = axis.lineBounds.width;
                height = Math.abs((!axis.opposedPosition) ? Math.abs(axis.lineBounds.y - y) : (bounds.y + axisPadding) - y - offset);
            }
            axis.bounds = new Rect(x, y, width, height);
        }
    };
    /**
     * Calculate axis line bounds
     *
     * @param axis
     * @param axisIndex
     */
    AxisLayoutPanel.prototype.calculateLineBounds = function (axis, axisIndex) {
        var x;
        var y;
        var width;
        var height;
        var prevAxis;
        var lineHeight = axis.line.height;
        var orientation = this.gauge.orientation;
        var containerRect = this.gauge.containerBounds;
        lineHeight = (axis.line.width > 0) ? lineHeight : null;
        if (orientation === 'Vertical') {
            y = (isNullOrUndefined(lineHeight)) ? containerRect.y :
                containerRect.y + ((containerRect.height / 2) - (lineHeight / 2));
            width = axis.line.width;
            height = (isNullOrUndefined(lineHeight)) ? containerRect.height : lineHeight;
        }
        else {
            x = (isNullOrUndefined(lineHeight)) ? containerRect.x :
                containerRect.x + ((containerRect.width / 2) - (lineHeight / 2));
            height = axis.line.width;
            width = (isNullOrUndefined(lineHeight)) ? containerRect.width : lineHeight;
        }
        var index = this.checkPreviousAxes(axis, axisIndex);
        var count = 0;
        if (!isNullOrUndefined(index)) {
            for (var i = index; i >= 0; i--) {
                if (this.gauge.axes[i].minimum !== this.gauge.axes[i].maximum) {
                    index = i;
                    count++;
                    break;
                }
            }
            if (count === 0) {
                index = null;
            }
        }
        if (isNullOrUndefined(index)) {
            if (orientation === 'Vertical') {
                x = (!axis.opposedPosition ? containerRect.x : containerRect.x + containerRect.width) + axis.line.offset;
            }
            else {
                y = (!axis.opposedPosition ? containerRect.y : containerRect.y + containerRect.height) + axis.line.offset;
            }
        }
        else {
            prevAxis = this.gauge.axes[index];
            if (orientation === 'Vertical') {
                x = ((!axis.opposedPosition) ? prevAxis.bounds.x : (prevAxis.bounds.x + prevAxis.bounds.width)) + axis.line.offset;
            }
            else {
                y = ((!axis.opposedPosition) ? prevAxis.bounds.y : (prevAxis.bounds.y + prevAxis.bounds.height)) + axis.line.offset;
            }
        }
        axis.lineBounds = new Rect(x, y, width, height);
        if (axis.minimum === axis.maximum) {
            axis.lineBounds = new Rect(0, 0, 0, 0);
        }
    };
    /**
     * Calculate axis tick bounds
     *
     * @param axis
     * @param axisIndex
     */
    AxisLayoutPanel.prototype.calculateTickBounds = function (axis, axisIndex) {
        var x;
        var y;
        var width;
        var height;
        var min = Math.min(axis.minimum, axis.maximum);
        var max = Math.max(axis.minimum, axis.maximum);
        min = (min === max) ? max - 1 : min;
        var interval = axis.majorTicks.interval;
        var bounds = axis.lineBounds;
        var major = axis.majorTicks;
        var minor = axis.minorTicks;
        axis.majorInterval = major.interval;
        axis.minorInterval = minor.interval;
        var size = (this.gauge.orientation === 'Vertical' ? bounds.height : bounds.width);
        var lineSize = (this.gauge.orientation === 'Vertical' ? bounds.width : bounds.height) / 2;
        axis.majorInterval = isNullOrUndefined(axis.majorInterval) ? calculateNiceInterval(min, max, size, this.gauge.orientation)
            : major.interval;
        axis.visibleRange = new VisibleRange(min, max, axis.majorInterval, (max - min));
        axis.minorInterval = (isNullOrUndefined(axis.minorInterval)) ? axis.majorInterval / 2 : axis.minorInterval;
        if (this.gauge.orientation === 'Vertical') {
            x = axis.majorTicks.position === 'Auto' ? ((!axis.opposedPosition ? (bounds.x - lineSize - major.height) : bounds.x + lineSize)
                + major.offset) : x;
            x = axis.majorTicks.position !== 'Auto' ? (axis.majorTicks.position === 'Cross' ? bounds.x - major.height / 2 - major.offset :
                ((axis.majorTicks.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.majorTicks.position === 'Outside' && axis.opposedPosition)) ? (bounds.x - lineSize - major.height - major.offset)
                    : (bounds.x + lineSize + major.offset)) : x;
            axis.majorTickBounds = new Rect(x, bounds.y, major.height, bounds.height);
            if (axis.minimum === axis.maximum) {
                axis.majorTickBounds = new Rect(0, 0, 0, 0);
            }
            x = axis.minorTicks.position === 'Auto' ? ((!axis.opposedPosition ? (bounds.x - lineSize - minor.height) : bounds.x + lineSize)
                + minor.offset) : x;
            x = axis.minorTicks.position !== 'Auto' ? (axis.minorTicks.position === 'Cross' ? bounds.x - minor.height / 2 - minor.offset :
                ((axis.minorTicks.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.minorTicks.position === 'Outside' && axis.opposedPosition)) ? (bounds.x - lineSize - minor.height - minor.offset)
                    : (bounds.x + lineSize + minor.offset)) : x;
            axis.minorTickBounds = new Rect(x, bounds.y, minor.height, bounds.height);
            if (axis.minimum === axis.maximum) {
                axis.minorTickBounds = new Rect(0, 0, 0, 0);
            }
        }
        else {
            y = axis.majorTicks.position === 'Auto' ? ((!axis.opposedPosition ? (bounds.y - lineSize - major.height) : bounds.y + lineSize)
                + major.offset) : y;
            y = axis.majorTicks.position !== 'Auto' ? ((axis.majorTicks.position === 'Cross' ? bounds.y - major.height / 2 - major.offset :
                ((axis.majorTicks.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.majorTicks.position === 'Outside' && axis.opposedPosition)) ?
                    (bounds.y - lineSize - major.height) - major.offset : bounds.y + lineSize + major.offset)) : y;
            axis.majorTickBounds = new Rect(bounds.x, y, bounds.width, major.height);
            if (axis.minimum === axis.maximum) {
                axis.majorTickBounds = new Rect(0, 0, 0, 0);
            }
            y = axis.minorTicks.position === 'Auto' ? ((!axis.opposedPosition ? (bounds.y - lineSize - minor.height) : bounds.y + lineSize)
                + minor.offset) : y;
            y = axis.minorTicks.position !== 'Auto' ? ((axis.minorTicks.position === 'Cross' ? bounds.y - minor.height / 2 - major.offset :
                ((axis.minorTicks.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.minorTicks.position === 'Outside' && axis.opposedPosition)) ?
                    (bounds.y - lineSize - minor.height) - minor.offset : bounds.y + lineSize + minor.offset)) : y;
            axis.minorTickBounds = new Rect(bounds.x, y, bounds.width, minor.height);
            if (axis.minimum === axis.maximum) {
                axis.minorTickBounds = new Rect(0, 0, 0, 0);
            }
        }
    };
    /**
     * To Calculate axis label bounds
     *
     * @param axis
     * @param axisIndex
     */
    AxisLayoutPanel.prototype.calculateLabelBounds = function (axis, axisIndex) {
        var x;
        var y;
        var padding = 5;
        var applyPositionBounds = (axis.labelStyle.position !== 'Auto' && axis.majorTicks.position !== 'Auto' &&
            axis.minorTicks.position !== 'Auto');
        var bounds = applyPositionBounds ? (axis.labelStyle.position === axis.minorTicks.position &&
            axis.minorTicks.position !== axis.majorTicks.position ? axis.minorTickBounds : axis.majorTickBounds) :
            axis.majorTickBounds;
        var offset = axis.labelStyle.offset;
        this.calculateVisibleLabels(axis);
        if (axis.minimum === axis.maximum) {
            axis.labelBounds = new Rect(0, 0, 0, 0);
        }
        else {
            var width = axis.maxLabelSize.width;
            var height = axis.maxLabelSize.height / 2;
            if (this.gauge.orientation === 'Vertical') {
                x = axis.labelStyle.position === 'Auto' ? ((!axis.opposedPosition ? (bounds.x - width - padding) :
                    (bounds.x + bounds.width + padding)) + offset) : x;
                var boundx = bounds.x;
                var offsetForCross = axis.majorTicks.position === 'Cross' || axis.minorTicks.position === 'Cross' ?
                    (bounds.width > axis.lineBounds.width ? bounds.width / 2 : axis.lineBounds.width / 2) : axis.lineBounds.width / 2;
                boundx = applyPositionBounds ? ((axis.labelStyle.position !== axis.minorTicks.position &&
                    axis.labelStyle.position !== axis.majorTicks.position) ?
                    (axis.minorTicks.position !== 'Cross' && axis.majorTicks.position !== 'Cross' ? (axis.labelStyle.position === 'Inside' ?
                        bounds.x - axis.lineBounds.width : axis.labelStyle.position === 'Outside' ?
                        bounds.x + axis.lineBounds.width : bounds.x) : (axis.labelStyle.position === 'Inside' ?
                        axis.lineBounds.x - offsetForCross : axis.labelStyle.position === 'Outside' ?
                        axis.lineBounds.x - bounds.width + offsetForCross : bounds.x)) : bounds.x) : bounds.x;
                x = axis.labelStyle.position !== 'Auto' ? (axis.labelStyle.position === 'Cross' ? axis.lineBounds.x -
                    axis.maxLabelSize.width / 4 - offset : ((axis.labelStyle.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.labelStyle.position === 'Outside' && axis.opposedPosition)) ?
                    ((boundx - width - padding) - offset) : ((boundx + bounds.width + padding) + offset)) : x;
                y = axis.lineBounds.y;
            }
            else {
                y = axis.labelStyle.position === 'Auto' ? ((!axis.opposedPosition ?
                    (bounds.y - padding) : ((bounds.y + bounds.height + padding) + height)) + offset) : y;
                var boundy = bounds.y;
                var offsetForCross = axis.majorTicks.position === 'Cross' || axis.minorTicks.position === 'Cross' ?
                    (bounds.height > axis.lineBounds.height ? bounds.height / 2 : axis.lineBounds.height / 2) : axis.lineBounds.height / 2;
                boundy = applyPositionBounds ? ((axis.labelStyle.position !== axis.minorTicks.position &&
                    axis.labelStyle.position !== axis.majorTicks.position) ?
                    (axis.minorTicks.position !== 'Cross' && axis.majorTicks.position !== 'Cross' ?
                        (axis.labelStyle.position === 'Inside' ? bounds.y - axis.lineBounds.height : axis.labelStyle.position === 'Outside' ?
                            bounds.y + axis.lineBounds.height : bounds.y) : (axis.labelStyle.position === 'Inside' ?
                        axis.lineBounds.y - offsetForCross : axis.labelStyle.position === 'Outside' ?
                        axis.lineBounds.y - bounds.height + offsetForCross : bounds.y)) : bounds.y) : bounds.y;
                y = axis.labelStyle.position !== 'Auto' ? (axis.labelStyle.position === 'Cross' ? axis.lineBounds.y +
                    axis.maxLabelSize.height / 4 - offset : ((axis.labelStyle.position === 'Inside' && !axis.opposedPosition) ||
                    (axis.labelStyle.position === 'Outside' && axis.opposedPosition)) ?
                    (boundy - padding) - offset : ((boundy + bounds.height + padding) + height) + offset) : y;
                x = axis.lineBounds.x;
            }
            axis.labelBounds = new Rect(x, y, width, height);
        }
    };
    /**
     * Calculate pointer bounds
     *
     * @param axis
     * @param axisIndex
     */
    AxisLayoutPanel.prototype.calculatePointerBounds = function (axis, axisIndex) {
        var pointer;
        var actualValue;
        var length;
        var val = [];
        var range = axis.visibleRange;
        var orientation = this.gauge.orientation;
        var bounds;
        var line = axis.lineBounds;
        var label = axis.labelBounds;
        var currentVal;
        var type;
        var markerType;
        var nearX;
        var farX;
        var nearY;
        var farY;
        var minimumValue = Math.min(range.min, range.max);
        var maximumValue = Math.max(range.min, range.max);
        for (var i = 0; i < axis.pointers.length; i++) {
            pointer = axis.pointers[i];
            if (pointer.offset.length > 0) {
                pointer.currentOffset = stringToNumber(pointer.offset, (this.gauge.orientation === 'Horizontal' ?
                    this.gauge.availableSize.height / 2 : this.gauge.availableSize.width / 2));
            }
            else {
                pointer.currentOffset = pointer.offset;
            }
            pointer.currentValue = pointer.value !== null ?
                pointer.value < minimumValue ? minimumValue : pointer.value > maximumValue ? maximumValue : pointer.value
                : minimumValue;
            if (pointer.width > 0 && withInRange(pointer.currentValue, null, null, range.max, range.min, 'pointer')) {
                this['calculate' + pointer.type + 'Bounds'](axisIndex, axis, i, pointer);
            }
        }
    };
    /**
     * Calculate marker pointer bounds
     *
     * @param axisIndex
     * @param axis
     * @param pointerIndex
     * @param pointer
     */
    AxisLayoutPanel.prototype.calculateMarkerBounds = function (axisIndex, axis, pointerIndex, pointer) {
        var x;
        var y;
        var line = axis.lineBounds;
        var offset = pointer.currentOffset;
        var range = axis.visibleRange;
        var placement = pointer.placement;
        var tick = axis.majorTickBounds;
        var label = axis.labelBounds;
        var border = pointer.border.width;
        if (this.gauge.orientation === 'Vertical') {
            if (pointer.position === 'Auto') {
                x = (!axis.opposedPosition) ? (placement === 'Near') ? label.x : (placement === 'Center') ? tick.x : line.x :
                    placement === 'Far' ? label.x + label.width : (placement === 'Center' ? tick.x + tick.width : line.x);
                x = !axis.opposedPosition ? ((pointer.placement === 'Far' ? ((pointer.markerType === 'Triangle' || pointer.markerType === 'Arrow') ? x - border : x + border) : ((pointer.markerType === 'InvertedTriangle' || pointer.markerType === 'InvertedArrow') ? x + border : x - border)) + (offset)) :
                    ((pointer.placement === 'Near' ? ((pointer.markerType === 'InvertedTriangle' || pointer.markerType === 'InvertedArrow') ? x + border : x - border) : ((pointer.markerType === 'Triangle' || pointer.markerType === 'Arrow') ? x - border : x + border)) + (offset));
            }
            else {
                x = (pointer.position === 'Cross' ? line.x - pointer.width / 2 - offset :
                    ((pointer.position === 'Inside' && !axis.opposedPosition) ||
                        (pointer.position === 'Outside' && axis.opposedPosition)) ?
                        (line.x - line.width / 2 - (pointer.markerType !== 'InvertedTriangle' && pointer.markerType !== 'Triangle' ?
                            pointer.width : 0)) - offset : ((line.x + line.width / 2) + offset));
            }
            y = ((valueToCoefficient(pointer.currentValue, axis, this.gauge.orientation, range) * line.height) + line.y);
        }
        else {
            if (pointer.position === 'Auto') {
                y = (!axis.opposedPosition) ? (placement === 'Near') ? label.y - label.height : (placement === 'Center') ? tick.y :
                    line.y : (placement === 'Far') ? label.y : (placement === 'Center') ? tick.y + tick.height : line.y;
                y = !axis.opposedPosition ? ((pointer.placement === 'Far' ? ((pointer.markerType === 'Triangle' || pointer.markerType === 'Arrow') ? y - border : y + border) : ((pointer.markerType === 'InvertedTriangle' || pointer.markerType === 'InvertedArrow') ? y + border : y - border)) + (offset)) :
                    ((pointer.placement === 'Near' ? ((pointer.markerType === 'InvertedTriangle' || pointer.markerType === 'InvertedArrow') ? y + border : y - border) : ((pointer.markerType === 'Triangle' || pointer.markerType === 'Arrow') ? y - border : y + border)) + (offset));
            }
            else {
                y = (pointer.position === 'Cross' ? line.y - pointer.height / 2 - offset :
                    ((pointer.position === 'Inside' && !axis.opposedPosition) ||
                        (pointer.position === 'Outside' && axis.opposedPosition)) ?
                        (line.y - line.height / 2 - (pointer.markerType !== 'InvertedTriangle' && pointer.markerType !== 'Triangle' ?
                            pointer.height : 0)) - offset : ((line.y + line.height / 2) + offset));
            }
            x = ((valueToCoefficient(pointer.currentValue, axis, this.gauge.orientation, range) * line.width) + line.x);
        }
        pointer.bounds = new Rect(x, y, pointer.width, pointer.height);
        if (axis.minimum === axis.maximum) {
            pointer.bounds = new Rect(0, 0, 0, 0);
            pointer.width = 0;
            pointer.height = 0;
        }
    };
    /**
     * Calculate bar pointer bounds
     *
     * @param axisIndex
     * @param axis
     * @param pointerIndex
     * @param pointer
     */
    AxisLayoutPanel.prototype.calculateBarBounds = function (axisIndex, axis, pointerIndex, pointer) {
        var x1;
        var x2;
        var y1;
        var y2;
        var height;
        var width;
        var line = axis.lineBounds;
        var padding = 10;
        var range = axis.visibleRange;
        var orientation = this.gauge.orientation;
        var offset = pointer.currentOffset;
        var container = this.gauge.containerBounds;
        if (orientation === 'Vertical') {
            if (pointer.position === 'Auto') {
                x1 = (container.width > 0) ? container.x + ((container.width / 2) - (pointer.width / 2)) :
                    (!axis.opposedPosition) ? (line.x + padding) : (line.x - pointer.width - padding);
                x1 += (offset);
            }
            else {
                x1 = (pointer.position === 'Cross' ? line.x - pointer.width / 2 - offset :
                    ((pointer.position === 'Inside' && !axis.opposedPosition) ||
                        (pointer.position === 'Outside' && axis.opposedPosition)) ?
                        (line.x - line.width / 2 - pointer.width) - offset : ((line.x + line.width / 2) + offset));
            }
            y1 = ((valueToCoefficient(pointer.currentValue, axis, orientation, range) * line.height) + line.y);
            y2 = ((valueToCoefficient(range.min, axis, orientation, range) * line.height) + line.y);
            height = Math.abs(y2 - y1);
            y1 = (!axis.isInversed) ? y1 : y2;
            width = pointer.width;
        }
        else {
            if (pointer.position === 'Auto') {
                y1 = (container.height > 0) ? (container.y + (container.height / 2) - (pointer.height) / 2) :
                    (!axis.opposedPosition) ? (line.y + padding) : (line.y - pointer.height - padding);
                y1 += (offset);
            }
            else {
                y1 = (pointer.position === 'Cross' ? line.y - pointer.height / 2 - offset :
                    ((pointer.position === 'Inside' && !axis.opposedPosition) ||
                        (pointer.position === 'Outside' && axis.opposedPosition)) ?
                        (line.y - line.height / 2 - pointer.height) - offset : ((line.y + line.height / 2) + offset));
            }
            height = pointer.height;
            x1 = ((valueToCoefficient(range.min, axis, orientation, range) * line.width) + line.x);
            x2 = ((valueToCoefficient(pointer.currentValue, axis, orientation, range) * line.width) + line.x);
            width = Math.abs(x2 - x1);
            x1 = (!axis.isInversed) ? x1 : x2;
        }
        pointer.bounds = new Rect(x1, y1, width, height);
        if (axis.minimum === axis.maximum) {
            pointer.bounds = new Rect(0, 0, 0, 0);
            pointer.width = 0;
            pointer.height = 0;
        }
    };
    /**
     * Calculate ranges bounds
     *
     * @param axis
     * @param axisIndex
     */
    AxisLayoutPanel.prototype.calculateRangesBounds = function (axis, axisIndex) {
        var range;
        var start;
        var end;
        var line = axis.lineBounds;
        var visibleRange = axis.visibleRange;
        var orientation = this.gauge.orientation;
        var startVal;
        var endVal;
        var pointX;
        var pointY;
        var width;
        var height;
        var position;
        var gradientRangeColor;
        var startWidth;
        var endWidth;
        var colors;
        for (var i = 0; i < axis.ranges.length; i++) {
            range = axis.ranges[i];
            if (this.gauge.gradientModule) {
                gradientRangeColor = this.gauge.gradientModule.getGradientColorString(range);
            }
            if (range.offset.length > 0) {
                range.currentOffset = stringToNumber(range.offset, (this.gauge.orientation === 'Horizontal' ?
                    this.gauge.availableSize.height / 2 : this.gauge.availableSize.width / 2));
            }
            else {
                range.currentOffset = range.offset;
            }
            start = Math.max(range.start, visibleRange.min);
            end = Math.min(range.end, visibleRange.max);
            if (withInRange(null, start, end, visibleRange.max, visibleRange.min, 'range')) {
                end = Math.max(start, end);
                start = Math.min(start, range.end);
                position = range.position;
                startWidth = range.startWidth;
                endWidth = range.endWidth;
                colors = this.gauge.rangePalettes.length ? this.gauge.rangePalettes : getRangePalette(this.gauge.theme);
                range.interior = (gradientRangeColor) ? gradientRangeColor :
                    (range.color) ? range.color : colors[i % colors.length];
                if (this.gauge.orientation === 'Vertical') {
                    pointX = line.x + (range.currentOffset) + (position === 'Cross' ? startWidth / 2 :
                        (position === 'Outside' || position === 'Auto') ?
                            -(line.width / 2) : position === 'Inside' ? line.width / 2 : 0);
                    pointY = (valueToCoefficient(end, axis, orientation, visibleRange) * line.height) + line.y;
                    height = (valueToCoefficient(start, axis, orientation, visibleRange) * line.height) + line.y;
                    height -= pointY;
                    startVal = !axis.opposedPosition ? (position === 'Inside' ? (pointX + startWidth) : position === 'Cross' ?
                        (pointX - startWidth) : (pointX - startWidth)) : (position === 'Inside' ? (pointX - startWidth) :
                        position === 'Cross' ? (pointX - startWidth) : (pointX + startWidth));
                    endVal = !axis.opposedPosition ? position === 'Inside' ? (pointX + endWidth) : position === 'Cross' ?
                        (pointX - endWidth) : (pointX - endWidth) : position === 'Inside' ? (pointX - endWidth) :
                        position === 'Cross' ? (pointX - endWidth) : (pointX + endWidth);
                    range.path = 'M' + pointX + ' ' + pointY + ' L ' + pointX + ' ' + (pointY + height) +
                        ' L ' + startVal + ' ' + (pointY + height) + ' L ' + endVal + ' ' + pointY +
                        ' L ' + pointX + ' ' + pointY + ' z ';
                }
                else {
                    pointX = (valueToCoefficient(end, axis, orientation, visibleRange) * line.width) + line.x;
                    pointY = axis.lineBounds.y + (range.currentOffset) + (position === 'Cross' ? startWidth / 2 :
                        (position === 'Outside' || position === 'Auto') ? -(line.height / 2) : position === 'Inside' ? line.height / 2 : 0);
                    width = (valueToCoefficient(start, axis, orientation, visibleRange) * line.width) + line.x;
                    width = pointX - width;
                    startVal = !axis.opposedPosition ? position === 'Inside' ? (pointY + startWidth) : position === 'Cross' ?
                        (pointY - startWidth) : (pointY - startWidth) : (position === 'Inside') ? (pointY - startWidth) :
                        position === 'Cross' ? (pointY - startWidth) : (pointY + startWidth);
                    endVal = !axis.opposedPosition ? position === 'Inside' ? (pointY + endWidth) : position === 'Cross' ?
                        (pointY - endWidth) : (pointY - endWidth) : (position === 'Inside') ? (pointY - endWidth) :
                        position === 'Cross' ? (pointY - endWidth) : (pointY + endWidth);
                    range.path = 'M' + pointX + ' ' + pointY + ' L ' + (pointX - width) + ' ' + pointY +
                        ' L ' + (pointX - width) + ' ' + startVal + ' L ' + pointX + ' ' + endVal +
                        ' L ' + pointX + ' ' + pointY + ' z ';
                }
            }
        }
    };
    AxisLayoutPanel.prototype.checkPreviousAxes = function (currentAxis, axisIndex) {
        var index = axisIndex - 1;
        var prevAxis;
        var isPositive = (index >= 0) ? true : false;
        if (isPositive) {
            prevAxis = this.gauge.axes[index];
            index = (prevAxis.checkAlign.align === currentAxis.checkAlign.align) ? index : this.checkPreviousAxes(currentAxis, index);
        }
        else {
            index = null;
        }
        return index;
    };
    /**
     *
     * @param axis To calculate the visible labels
     */
    AxisLayoutPanel.prototype.calculateVisibleLabels = function (axis) {
        axis.visibleLabels = [];
        if (axis.minimum !== axis.maximum) {
            var min = axis.visibleRange.min;
            var max = axis.visibleRange.max;
            var interval = axis.visibleRange.interval;
            var argsData = void 0;
            var style = axis.labelStyle;
            var text = void 0;
            var labelSize_1;
            var customLabelFormat = style.format && style.format.match('{value}') !== null;
            var _loop_1 = function (i) {
                argsData = {
                    cancel: false, name: axisLabelRender, axis: axis,
                    text: customLabelFormat ? textFormatter(style.format, { value: i }, this_1.gauge) :
                        formatValue(i, this_1.gauge).toString(),
                    value: i
                };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var axisLabelRenderSuccess = function (argsData) {
                    if (!argsData.cancel) {
                        axis.visibleLabels.push(new VisibleLabels(argsData.text, i, labelSize_1));
                    }
                };
                axisLabelRenderSuccess.bind(this_1);
                this_1.gauge.trigger(axisLabelRender, argsData, axisLabelRenderSuccess);
            };
            var this_1 = this;
            for (var i = min; (i <= max && interval > 0); i += interval) {
                _loop_1(i);
            }
            var lastLabel = axis.visibleLabels.length ? axis.visibleLabels[axis.visibleLabels.length - 1].value : null;
            var maxVal_1 = axis.visibleRange.max;
            if (lastLabel !== maxVal_1 && axis.showLastLabel === true) {
                argsData = {
                    cancel: false, name: axisLabelRender, axis: axis,
                    text: customLabelFormat ? textFormatter(style.format, { value: maxVal_1 }, this.gauge) :
                        formatValue(maxVal_1, this.gauge).toString(),
                    value: maxVal_1
                };
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                var axisLabelRenderSuccess = function (argsData) {
                    labelSize_1 = measureText(argsData.text, axis.labelStyle.font);
                    if (!argsData.cancel) {
                        axis.visibleLabels.push(new VisibleLabels(argsData.text, maxVal_1, labelSize_1));
                    }
                };
                axisLabelRenderSuccess.bind(this);
                this.gauge.trigger(axisLabelRender, argsData, axisLabelRenderSuccess);
            }
            this.getMaxLabelWidth(this.gauge, axis);
        }
    };
    /**
     * Calculate maximum label width for the axis.
     *
     * @return {void}
     * @private
     */
    AxisLayoutPanel.prototype.getMaxLabelWidth = function (gauge, axis) {
        axis.maxLabelSize = new Size(0, 0);
        var label;
        for (var i = 0; i < axis.visibleLabels.length; i++) {
            label = axis.visibleLabels[i];
            label.size = measureText(label.text, axis.labelStyle.font);
            if (label.size.width > axis.maxLabelSize.width) {
                axis.maxLabelSize.width = label.size.width;
            }
            if (label.size.height > axis.maxLabelSize.height) {
                axis.maxLabelSize.height = label.size.height;
            }
        }
    };
    AxisLayoutPanel.prototype.checkThermometer = function () {
        if (this.gauge.container.type === 'Thermometer') {
            this.gauge.axes.map(function (axis, index) {
                if (axis.isInversed) {
                    axis.pointers.map(function (pointer, index) {
                        if (pointer.type === 'Bar') {
                            axis.isInversed = false;
                        }
                    });
                }
            });
        }
    };
    return AxisLayoutPanel;
}());
export { AxisLayoutPanel };
