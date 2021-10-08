import { StockChart } from '../stock-chart';
import { PeriodsModel } from '../../common/model/base-model';
import { TechnicalIndicators } from '../../chart/utils/enum';
import { MenuEventArgs } from '@syncfusion/ej2-splitbuttons';
/**
 * Period selector for range navigator
 */
/** @private */
export declare class ToolBarSelector {
    private stockChart;
    private indicatorDropDown;
    private trendlineDropDown;
    private selectedSeries;
    private selectedIndicator;
    private selectedTrendLine;
    constructor(chart: StockChart);
    initializePeriodSelector(): void;
    /**
     * This method returns itemModel for dropdown button
     */
    private getDropDownItems;
    /**
     * This method changes the type of series while selectind series in dropdown button
     */
    private addedSeries;
    initializeSeriesSelector(): void;
    private trendline;
    private indicators;
    private secondayIndicators;
    resetButton(): void;
    initializeTrendlineSelector(): void;
    initializeIndicatorSelector(): void;
    private getIndicator;
    createIndicatorAxes(type: TechnicalIndicators, args: MenuEventArgs): void;
    tickMark(args: MenuEventArgs): string;
    printButton(): void;
    exportButton(): void;
    calculateAutoPeriods(): PeriodsModel[];
    private findRange;
    /**
     * Text elements added to while export the chart
     * It details about the seriesTypes, indicatorTypes and Trendlines selected in chart.
     */
    private addExportSettings;
    /** @private */
    private textElementSpan;
}
