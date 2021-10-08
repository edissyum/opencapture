import { Chart, AccumulationChart } from '@syncfusion/ej2-charts';
/**
 * Chart component is used to convert office charts to ej2-charts.
 */
export declare class ChartComponent {
    /**
     * @private
     */
    chart: Chart | AccumulationChart;
    /**
     * @private
     */
    private chartType;
    /**
     * @private
     */
    private isPieType;
    /**
     * @private
     */
    chartRender(chart: any): void;
    /**
     * @private
     */
    convertChartToImage(chart: Chart | AccumulationChart, elementWidth: number, elementHeight: number): Promise<string>;
    private getControlsValue;
    private officeChartType;
    private chartSeries;
    private writeChartSeries;
    private parseDataLabels;
    private parseErrorBars;
    private parseTrendLines;
    private dataLabelPosition;
    private chartFormat;
    private chartPrimaryXAxis;
    private chartCategoryType;
    private chartPrimaryYAxis;
    private chartData;
    private chartPlotData;
    private parseChartLegend;
    /**
     * Destroys the internal objects which is maintained.
     */
    destroy(): void;
}
