import { CircularGauge } from '../circular-gauge';
import { Pointer, Axis } from './axis';
/**
 * Specifies the Axis rendering for circular gauge
 */
export declare class PointerRenderer {
    private gauge;
    /**
     * Constructor for pointer renderer.
     *
     * @param {CircularGauge} gauge - Specifies the instance of the gauge.
     * @private.
     */
    constructor(gauge: CircularGauge);
    /**
     * Method to render the axis pointers of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {number} axisIndex - Specifies the axis index.
     * @param {Element} element - Specifies the element.
     * @param {CircularGauge} gauge - Specifies the instance of the gauge.
     * @param {boolean} animate - Specifies the boolean value.
     * @returns {void}
     * @private
     */
    drawPointers(axis: Axis, axisIndex: number, element: Element, gauge: CircularGauge, animate?: boolean): void;
    /**
     * Measure the pointer length of the circular gauge.
     *
     * @returns {void}
     */
    private calculatePointerRadius;
    /**
     * Measure the pointer length of the circular gauge based on pointer position.
     *
     * @returns {number}
     */
    private pointerRadiusForPosition;
    /**
     * Method to render the needle pointer of the ciruclar gauge.
     *
     * @param {Axis} axis - Specifies the axis
     * @param {number} axisIndex - Specifies the axis index.
     * @param {number} index - Specifies the index.
     * @param {Element} parentElement - Specifies the parent element.
     * @param {CircularGauge} gauge - Specifies the instance of the gauge.
     * @returns {void}
     */
    private drawNeedlePointer;
    /**
     * Method to set the pointer value of the circular gauge.
     *
     * @param {Axis} axis - Specifies the axis.
     * @param {Pointer} pointer - Specifies the pointer.
     * @param {number} value - Specifies the value.
     * @returns {void}
     * @private
     */
    setPointerValue(axis: Axis, pointer: Pointer, value: number): void;
    /**
     * Method to render the marker pointer of the ciruclar gauge.
     *
     * @param {Axis} axis - Specifies the axis
     * @param {number} axisIndex - Specifies the axis index.
     * @param {number} index - Specifies the index.
     * @param {Element} parentElement - Specifies the parent element.
     * @param {CircularGauge} gauge - Specifies the instance of the gauge.
     * @returns {void}
     */
    private drawMarkerPointer;
    /**
     * Method to render the range bar pointer of the ciruclar gauge.
     *
     * @param {Axis} axis - Specifies the axis
     * @param {number} axisIndex - Specifies the axis index.
     * @param {number} index - Specifies the index.
     * @param {Element} parentElement - Specifies the parent element.
     * @param {CircularGauge} gauge - Specifies the instance of the gauge.
     * @returns {void}
     */
    private drawRangeBarPointer;
    /**
     * Method to perform the animation of the pointer in circular gauge.
     *
     * @param {Pointer} pointer - Specifies the pointer.
     * @param {Axis} axis - Specifies the axis.
     * @returns {void}
     */
    private doPointerAnimation;
    /**
     * Perform the needle and marker pointer animation for circular gauge.
     *
     * @param {HTMLElement} element - Specifies the element
     * @param {number} start - Specifies the start
     * @param {number} end - Specifies the end
     * @param {Axis} axis - Specifies the axis
     * @param {Pointer} pointer - Specifies the pointer
     * @param {number} radius - Specifies the radius
     * @param {number} innerRadius - Specifies the innerRadius
     * @returns {void}
     * @private
     */
    performNeedleAnimation(element: HTMLElement, start: number, end: number, axis: Axis, pointer: Pointer, radius?: number, innerRadius?: number): void;
    /**
     * Perform the range bar pointer animation for circular gauge.
     *
     * @param {HTMLElement} element - Specifies the element.
     * @param {number} start - Specifies the start.
     * @param {number} end - Specifies the end.
     * @param {Axis} axis - Specifies the axis.
     * @param {Pointer} pointer - Specifies the pointer.
     * @param {number} radius - Specifies the radius.
     * @param {number} innerRadius - Specifies the innerRadius.
     * @returns {void}
     * @private
     */
    performRangeBarAnimation(element: HTMLElement, start: number, end: number, axis: Axis, pointer: Pointer, radius: number, innerRadius?: number): void;
}
