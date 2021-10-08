import { CircularGauge } from '../circular-gauge';
import { Axis, Range, Tick } from './axis';
import { GaugeLocation } from '../utils/helper-common';
/**
 * Specifies the Axis rendering for circular gauge
 */
export declare class AxisRenderer {
    private majorValues;
    private gauge;
    /**
     * Constructor for axis renderer.
     *
     * @param {CircularGauge} gauge - Specifies the instance of the gauge
     * @private.
     */
    constructor(gauge: CircularGauge);
    /**
     * Method to render the axis element of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge.
     * @returns {void}
     * @private
     */
    drawAxisOuterLine(axis: Axis, index: number, element: Element, gauge: CircularGauge): void;
    /**
     * Method to check the angles.
     *
     * @param {Axis} axis - Specifies the axis.
     * @returns {void}
     * @private
     */
    checkAngles(axis: Axis): void;
    /**
     * Method to render the axis line of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge.
     * @returns {void}
     * @private
     */
    drawAxisLine(axis: Axis, index: number, element: Element, gauge: CircularGauge): void;
    /**
     * Method to render the axis labels of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge.
     * @returns {void}
     * @private
     */
    drawAxisLabels(axis: Axis, index: number, element: Element, gauge: CircularGauge): void;
    /**
     * Method to find the anchor of the axis label.
     *
     * @param {GaugeLocation} location - Specifies the location.
     * @param {Label} style - Specifies the label style.
     * @param {number} angle - Specifies the angle.
     * @param {VisibleLabels} label - Specifies the labels.
     * @returns {string} - Returns the anchor.
     * @private
     */
    private findAnchor;
    /**
     * Methode to check whether the labels are intersecting or not.
     *
     * @param {GaugeLocation} previousLocation - Specifies the previous location.
     * @param {number} previousWidth - Specifies the previous width.
     * @param {number} previousHeight - Specifies the previous height.
     * @param {GaugeLocation} currentLocation - Specifies the current location.
     * @param {number} currentWidth - Specifies the current width.
     * @param {number} currentHeight - Specifies the current height.
     * @returns {boolean} - Returns the boolean value.
     * @private
     */
    private FindAxisLabelCollision;
    /**
     * Methode to get anchor position of label as start.
     *
     * @param {GaugeLocation} actualLocation - Specifies the actual location.
     * @param {number} textWidth - Specifies the text width.
     * @param {Label} style - Specifies the label style.
     * @param {number} textHeight - Specifies the text height.
     * @param {string} anchorPosition - Specifies the anchor position.
     * @param {number} angle - Specifies the angle.
     * @returns {GaugeLocation} - Returns the gauge location.
     * @private
     */
    private getAxisLabelStartPosition;
    /**
     * Methode to offset label height and width based on angle.
     *
     * @param {number} angle - Specifies the angle.
     * @param {number} size - Specifies the size.
     * @returns {number} - Returns the fineal size.
     * @private
     */
    private offsetAxisLabelsize;
    /**
     * Method to render the axis minor tick lines of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge.
     * @returns {void}
     * @private
     */
    drawMinorTickLines(axis: Axis, index: number, element: Element, gauge: CircularGauge): void;
    /**
     * Method to render the axis major tick lines of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge.
     * @returns {void}
     * @private
     */
    drawMajorTickLines(axis: Axis, index: number, element: Element, gauge: CircularGauge): void;
    /**
     * Method to calcualte the tick elements for the circular gauge.
     *
     * @param {number} value - Specifies the value.
     * @param {Tick} options - Specifies the options.
     * @param {Axis} axis - Specifies the axis.
     * @returns {string} - Returns the string.
     * @private
     */
    calculateTicks(value: number, options: Tick, axis: Axis): string;
    /**
     * Method to render the range path of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {Range} range - Specifies the range.
     * @param {number} startWidth - Specifies the startwidth for the range.
     * @param {number} endWidth - Specifies the endwidth for the range.
     * @param {number} rangeIndex - Specifies the index of the range.
     * @param {number} index - Specifies the index of the axis.
     * @param {Element} rangeElement - Specifies the element.
     * @param {number} colorIndex - Specifies the index of the lineargradient colorstop.
     * @returns {void}
     * @private
     */
    drawRangePath(axis: Axis, range: Range, startWidth: number, endWidth: number, rangeIndex: number, index: number, rangeElement: Element, colorIndex: number): void;
    /**
     * Method to render the rounded range path of the circular gauge.
     *
     * @param {Range} range - Specifies the range.
     * @param {number} rangeIndex - Specifies the index of the range.
     * @param {number} index - Specifies the index of the axis.
     * @param {number} startWidth - Specifies the startwidth for the range.
     * @param {number} endWidth - Specifies the endwidth for the range.
     * @param {Element} rangeElement - Specifies the element.
     * @param {number} roundedStartAngle - Specifies the rounded path of the start angle.
     * @param {number} roundedEndAngle - Specifies the rounded path of the end angle.
     * @param {number} oldStart - Specifies the rounded path of the old start value.
     * @param {number} oldEnd - Specifies the rounded path of the old end value..
     * @param {GaugeLocation} location - Specifies the location.
     * @param {number} colorIndex - Specifies the index of the lineargradient colorstop.
     * @param {Axis} axis - Specifies the axis.
     * @returns {void}
     * @private
     */
    roundedRangeAppendPathCalculation(range: Range, rangeIndex: number, index: number, startWidth: number, endWidth: number, rangeElement: Element, roundedStartAngle: number, roundedEndAngle: number, oldStart: number, oldEnd: number, location: GaugeLocation, colorIndex?: number): void;
    /**
     * Method to render the rounded range path of the circular gauge.
     *
     * @param {Range} range - Specifies the range.
     * @param {number} rangeIndex - Specifies the index of the range.
     * @param {number} index - Specifies the index of the axis.
     * @param {number} startWidth - Specifies the startwidth for the range.
     * @param {number} endWidth - Specifies the endwidth for the range.
     * @param {Element} rangeElement - Specifies the element.
     * @param {number} startAngle - Specifies the rounded path of the start angle.
     * @param {number} endAngle - Specifies the rounded path of the end angle.
     * @param {number} colorIndex - Specifies the index of the lineargradient colorstop.
     * @returns {void}
     * @private
     */
    rangeAppendPathCalculation(range: Range, rangeIndex: number, index: number, startWidth: number, endWidth: number, rangeElement: Element, startAngle: number, endAngle: number, colorIndex?: number): void;
    /**
     * Method to render the axis range of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} index - Specifies the index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the gauge instance.
     * @returns {void}
     * @private
     */
    drawAxisRange(axis: Axis, index: number, element: Element): void;
    /**
     * Method to calculate the radius of the axis range.
     *
     * @return {void}
     */
    private calculateRangeRadius;
    private calculateRangeRadiusWithPosition;
    /**
     * Method to get the range color of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis
     * @returns {void}
     * @private
     */
    setRangeColor(axis: Axis): void;
}
