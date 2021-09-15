import { Series, Trendline } from '../series/chart-series';
import { Chart } from '../chart';
/**
 * `Trendline` module is used to render 6 types of trendlines in chart.
 */
export declare class Trendlines {
    /**
     * Defines the collection of series, that are used to represent a trendline
     *
     * @private
     */
    initSeriesCollection(trendline: Trendline, chart: Chart): void;
    /**
     * Initializes the properties of the trendline series
     */
    private setSeriesProperties;
    /**
     * Creates the elements of a trendline
     */
    private createTrendLineElements;
    /**
     * Defines the data point of trendline
     */
    private getDataPoint;
    /**
     * Finds the slope and intercept of trendline
     */
    private findSlopeIntercept;
    /**
     * Defines the points to draw the trendlines
     */
    initDataSource(trendline: Trendline): void;
    /**
     * Calculation of exponential points
     */
    private setExponentialRange;
    /**
     * Calculation of logarithmic points
     */
    private setLogarithmicRange;
    /**
     * Calculation of polynomial points
     */
    private setPolynomialRange;
    /**
     * Calculation of power points
     */
    private setPowerRange;
    /**
     * Calculation of linear points
     */
    private setLinearRange;
    /**
     * Calculation of moving average points
     */
    private setMovingAverageRange;
    /**
     * Calculation of logarithmic points
     */
    private getLogarithmicPoints;
    /**
     * Defines the points based on data point
     */
    private getPowerPoints;
    /**
     * Get the polynomial points based on polynomial slopes
     */
    private getPolynomialPoints;
    /**
     * Defines the moving average points
     */
    private getMovingAveragePoints;
    /**
     * Defines the linear points
     */
    private getLinearPoints;
    /**
     * Defines the exponential points
     */
    private getExponentialPoints;
    /**
     * Defines the points based on data point
     */
    private getPoints;
    /**
     * Defines the polynomial value of y
     */
    private getPolynomialYValue;
    /**
     * Defines the gauss jordan elimination
     */
    private gaussJordanElimination;
    /**
     * Defines the trendline elements
     */
    getTrendLineElements(series: Series, chart: Chart): void;
    /**
     * To destroy the trendline
     */
    destroy(): void;
    /**
     * Get module name
     */
    protected getModuleName(): string;
}
/** @private */
export interface SlopeIntercept {
    slope?: number;
    intercept?: number;
}
