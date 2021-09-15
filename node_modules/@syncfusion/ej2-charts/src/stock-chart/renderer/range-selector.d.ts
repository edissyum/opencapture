import { StockChart } from '../stock-chart';
/** @private */
export declare class RangeSelector {
    private stockChart;
    constructor(stockChart: StockChart);
    initializeRangeNavigator(): void;
    private findMargin;
    private findSeriesCollection;
    private calculateChartSize;
    /**
     * Performs slider change
     *
     * @param {number} start slider start value
     * @param {number} end slider end value
     * @returns {void}
     */
    sliderChange(start: number, end: number): void;
}
