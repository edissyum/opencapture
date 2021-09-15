/**
 * HeatMap Axis-Helper file
 */
import { HeatMap } from '../heatmap';
import { Rect } from '../utils/helper';
import { Axis } from './axis';
export declare class AxisHelper {
    private heatMap;
    private initialClipRect;
    private htmlObject;
    private element;
    private padding;
    private drawSvgCanvas;
    constructor(heatMap?: HeatMap);
    /**
     * To render the x and y axis.
     *
     *  @private
     */
    renderAxes(): void;
    private drawXAxisLine;
    private drawYAxisLine;
    private drawXAxisTitle;
    private drawYAxisTitle;
    /**
     * Get the visible labels for both x and y axis
     *
     * @private
     */
    calculateVisibleLabels(): void;
    /**
     * Measure the title and labels rendering position for both X and Y axis.
     *
     * @param rect
     * @private
     */
    measureAxis(rect: Rect): void;
    /**
     * Calculate the X and Y axis line position
     *
     * @param rect
     * @private
     */
    calculateAxisSize(rect: Rect): void;
    private drawXAxisLabels;
    private drawYAxisLabels;
    private drawXAxisBorder;
    private drawYAxisBorder;
    /**
     * To create border element for axis.
     *
     * @returns {void}
     * @private
     */
    private createAxisBorderElement;
    private drawMultiLevels;
    /**
     * render x axis multi level labels
     *
     * @private
     * @returns {void}
     */
    renderXAxisMultiLevelLabels(axis: Axis, parent: Element): void;
    /**
     * render x axis multi level labels border
     *
     * @private
     * @returns {void}
     */
    private renderXAxisLabelBorder;
    /**
     * render y axis multi level labels
     *
     * @private
     * @returns {void}
     */
    renderYAxisMultiLevelLabels(axis: Axis, parent: Element): void;
    /**
     * render x axis multi level labels border
     *
     * @private
     * @returns {void}
     */
    private renderYAxisLabelBorder;
    /**
     * create borer element
     *
     * @returns {void}
     * @private
     */
    createBorderElement(borderIndex: number, axis: Axis, path: string, parent: Element): void;
    /**
     * calculate left position of border element
     *
     * @private
     */
    calculateLeftPosition(axis: Axis, start: number, label: number | Date | string, rect: Rect): number;
    /**
     * calculate width of border element
     *
     * @private
     */
    calculateWidth(axis: Axis, label: number | Date | string, end: number, rect: Rect): number;
    private calculateNumberOfDays;
}
