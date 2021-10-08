import { StockChart } from '../stock-chart';
import { Size } from '@syncfusion/ej2-svg-base';
import { BaseLegend } from '../../common/legend/legend';
import { StockLegend } from '../legend/legend';
/** @private */
export declare class CartesianChart {
    /**
     * `legendModule` is used to manipulate and add legend to the chart.
     */
    stockLegendModule: StockLegend;
    /** @private */
    legend: BaseLegend;
    private stockChart;
    cartesianChartSize: Size;
    constructor(chart: StockChart);
    initializeChart(chartArgsData?: object[]): void;
    private findMargin;
    private findSeriesCollection;
    calculateChartSize(): Size;
    private calculateUpdatedRange;
    /**
     * Cartesian chart refreshes based on start and end value
     *
     * @param {StockChart} stockChart stock chart instance
     * @param {Object[]} data stock chart data
     * @returns {void}
     */
    cartesianChartRefresh(stockChart: StockChart, data?: Object[]): void;
    private copyObject;
}
