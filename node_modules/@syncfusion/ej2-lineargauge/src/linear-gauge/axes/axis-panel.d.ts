import { LinearGauge } from '../../linear-gauge';
import { Axis, Pointer } from './axis';
/**
 * @private
 * To calculate the overall axis bounds for gauge.
 */
export declare class AxisLayoutPanel {
    private gauge;
    private htmlObject;
    private axisRenderer;
    constructor(gauge: LinearGauge);
    /**
     * To calculate the axis bounds
     */
    calculateAxesBounds(): void;
    /**
     * Calculate axis line bounds
     *
     * @param axis
     * @param axisIndex
     */
    calculateLineBounds(axis: Axis, axisIndex: number): void;
    /**
     * Calculate axis tick bounds
     *
     * @param axis
     * @param axisIndex
     */
    calculateTickBounds(axis: Axis, axisIndex: number): void;
    /**
     * To Calculate axis label bounds
     *
     * @param axis
     * @param axisIndex
     */
    calculateLabelBounds(axis: Axis, axisIndex: number): void;
    /**
     * Calculate pointer bounds
     *
     * @param axis
     * @param axisIndex
     */
    calculatePointerBounds(axis: Axis, axisIndex: number): void;
    /**
     * Calculate marker pointer bounds
     *
     * @param axisIndex
     * @param axis
     * @param pointerIndex
     * @param pointer
     */
    calculateMarkerBounds(axisIndex: number, axis: Axis, pointerIndex: number, pointer: Pointer): void;
    /**
     * Calculate bar pointer bounds
     *
     * @param axisIndex
     * @param axis
     * @param pointerIndex
     * @param pointer
     */
    calculateBarBounds(axisIndex: number, axis: Axis, pointerIndex: number, pointer: Pointer): void;
    /**
     * Calculate ranges bounds
     *
     * @param axis
     * @param axisIndex
     */
    calculateRangesBounds(axis: Axis, axisIndex: number): void;
    private checkPreviousAxes;
    /**
     *
     * @param axis To calculate the visible labels
     */
    calculateVisibleLabels(axis: Axis): void;
    /**
     * Calculate maximum label width for the axis.
     *
     * @return {void}
     * @private
     */
    private getMaxLabelWidth;
    private checkThermometer;
}
