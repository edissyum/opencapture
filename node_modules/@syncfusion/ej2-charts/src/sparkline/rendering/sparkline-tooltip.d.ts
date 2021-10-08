import { Sparkline } from '../index';
/**
 * Sparkline Tooltip Module
 */
export declare class SparklineTooltip {
    /**
     * Sparkline instance in tooltip.
     */
    private sparkline;
    /**
     * Sparkline current point index.
     */
    private pointIndex;
    /**
     * Sparkline tooltip timer.
     */
    private clearTooltip;
    constructor(sparkline: Sparkline);
    /**
     * @hidden
     */
    private addEventListener;
    private mouseLeaveHandler;
    private mouseUpHandler;
    private fadeOut;
    /**
     * To remove tooltip and tracker elements.
     *
     * @private
     */
    removeTooltipElements(): void;
    private mouseMoveHandler;
    private processTooltip;
    /**
     * To render tracker line
     */
    private renderTrackerLine;
    /**
     * To render line series
     */
    private renderTooltip;
    private addTooltip;
    /**
     * To get tooltip format.
     */
    private getFormat;
    private formatValue;
    /**
     * To remove tracker line.
     */
    private removeTracker;
    /**
     * To remove tooltip element.
     */
    private removeTooltip;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the tooltip.
     */
    destroy(sparkline: Sparkline): void;
}
