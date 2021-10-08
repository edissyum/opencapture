import { Chart } from '../chart';
/**
 * `Crosshair` module is used to render the crosshair for chart.
 */
export declare class Crosshair {
    private elementID;
    private elementSize;
    private svgRenderer;
    private crosshairInterval;
    private arrowLocation;
    private isTop;
    private isBottom;
    private isLeft;
    private isRight;
    private valueX;
    private valueY;
    private rx;
    private ry;
    private chart;
    /**
     * Constructor for crosshair module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * @hidden
     */
    private addEventListener;
    private mouseUpHandler;
    private mouseLeaveHandler;
    private mouseMoveHandler;
    /**
     * Handles the long press on chart.
     *
     * @returns {boolean} false
     * @private
     */
    private longPress;
    /**
     * Renders the crosshair.
     *
     * @returns {void}
     */
    crosshair(): void;
    private renderCrosshairLine;
    private drawCrosshairLine;
    private renderAxisTooltip;
    private getAxisText;
    private tooltipLocation;
    private stopAnimation;
    private progressAnimation;
    /**
     * Removes the crosshair on mouse leave.
     *
     * @returns {void}
     * @private
     */
    removeCrosshair(duration: number): void;
    /**
     * Get module name.
     *
     * @returns {string} module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the crosshair.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
