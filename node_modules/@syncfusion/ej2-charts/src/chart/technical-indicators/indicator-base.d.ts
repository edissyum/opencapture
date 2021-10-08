import { LineBase } from '../series/line-base';
import { Series, Points } from '../series/chart-series';
import { TechnicalIndicator } from './technical-indicator';
import { Chart } from '../chart';
/**
 * Technical Analysis module helps to predict the market trend
 */
export declare class TechnicalAnalysis extends LineBase {
    /**
     * Defines the collection of series, that are used to represent the given technical indicator
     *
     * @private
     */
    initSeriesCollection(indicator: TechnicalIndicator, chart: Chart): void;
    /**
     * Initializes the properties of the given series
     *
     * @private
     */
    protected setSeriesProperties(series: Series, indicator: TechnicalIndicator, name: string, fill: string, width: number, chart: Chart): void;
    /**
     * Creates the elements of a technical indicator
     *
     * @private
     */
    createIndicatorElements(chart: Chart, indicator: TechnicalIndicator, index: number): void;
    protected getDataPoint(x: Object, y: Object, sourcePoint: Points, series: Series, index: number, indicator?: TechnicalIndicator): Points;
    protected getRangePoint(x: Object, high: Object, low: Object, sourcePoint: Points, series: Series, index: number): Points;
    protected setSeriesRange(points: Points[], indicator: TechnicalIndicator, series?: Series): void;
}
