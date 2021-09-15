/**
 * Used for stock event calculations.
 */
import { StockChart } from '../stock-chart';
import { ChartLocation } from '../../common/utils/helper';
import { BaseTooltip } from '../../common/user-interaction/tooltip';
import { Tooltip } from '@syncfusion/ej2-svg-base';
/**
 * @private
 */
export declare class StockEvents extends BaseTooltip {
    constructor(stockChart: StockChart);
    private stockChart;
    private chartId;
    /** @private */
    stockEventTooltip: Tooltip;
    /** @private */
    symbolLocations: ChartLocation[][];
    private pointIndex;
    private seriesIndex;
    /**
     * To render stock events in chart
     *
     * @returns {Element} Stock event element
     * @private
     */
    renderStockEvents(): Element;
    private creatEventGroup;
    private findClosePoint;
    private createStockElements;
    renderStockEventTooltip(targetId: string): void;
    /**
     * Remove the stock event tooltip
     *
     * @param {number} duration tooltip timeout duration
     * @returns {void}
     */
    removeStockEventTooltip(duration: number): void;
    private findArrowpaths;
    private applyHighLights;
    private removeHighLights;
    private setOpacity;
    /**
     * To convert the c# or javascript date formats into js format
     * refer chart control's dateTime processing.
     *
     * @param {Date | string} value date or string value
     * @returns {Date} date format value
     */
    private dateParse;
}
