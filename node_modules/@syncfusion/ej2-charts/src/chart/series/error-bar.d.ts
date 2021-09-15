import { Chart } from '../chart';
import { Series } from './chart-series';
import { Mean } from '../../common/utils/helper';
import { ErrorBarMode } from '../../chart/utils/enum';
/**
 * `ErrorBar` module is used to render the error bar for series.
 */
export declare class ErrorBar {
    private chart;
    errorHeight: number;
    error: number;
    positiveHeight: number;
    negativeHeight: number;
    /**
     * Constructor for the error bar module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * Render the error bar for series.
     *
     * @returns {void}
     */
    render(series: Series): void;
    private renderErrorBar;
    private findLocation;
    private calculateFixedValue;
    private calculatePercentageValue;
    private calculateStandardDeviationValue;
    private calculateStandardErrorValue;
    private calculateCustomValue;
    private getHorizontalDirection;
    private getVerticalDirection;
    private getBothDirection;
    private getErrorDirection;
    meanCalculation(series: Series, mode: ErrorBarMode): Mean;
    private createElement;
    /**
     * Animates the series.
     *
     * @param  {Series} series - Defines the series to animate.
     * @returns {void}
     */
    doErrorBarAnimation(series: Series): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the errorBar for series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
