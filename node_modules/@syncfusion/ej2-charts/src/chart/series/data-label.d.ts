import { Chart } from '../chart';
import { Rect } from '@syncfusion/ej2-svg-base';
import { DataLabelSettingsModel } from '../series/chart-series-model';
import { Series, Points } from './chart-series';
/**
 * `DataLabel` module is used to render data label for the data point.
 */
export declare class DataLabel {
    private chart;
    private margin;
    private isShape;
    private locationX;
    private locationY;
    private fontBackground;
    private borderWidth;
    private markerHeight;
    private commonId;
    private yAxisInversed;
    private inverted;
    private errorHeight;
    private chartBackground;
    /**
     * Constructor for the data label module.
     *
     * @private
     */
    constructor(chart: Chart);
    private initPrivateVariables;
    private calculateErrorHeight;
    private isRectSeries;
    /**
     * Render the data label for series.
     *
     * @returns {void}
     */
    render(series: Series, chart: Chart, dataLabel: DataLabelSettingsModel): void;
    /**
     * Get rect coordinates
     */
    private getRectanglePoints;
    private isDataLabelOverlapWithChartBound;
    /**
     * Render the data label template.
     *
     * @returns {void}
     * @private
     */
    private createDataLabelTemplate;
    calculateTemplateLabelSize(parentElement: HTMLElement, childElement: HTMLElement, point: Points, series: Series, dataLabel: DataLabelSettingsModel, labelIndex: number, clip: Rect, redraw: boolean, isReactCallback?: boolean): void;
    private calculateTextPosition;
    private calculatePolarRectPosition;
    /**
     * Get the label location
     */
    private getLabelLocation;
    private calculateRectPosition;
    private calculatePathPosition;
    private isDataLabelShape;
    private calculateRectActualPosition;
    private calculateAlignment;
    private calculateTopAndOuterPosition;
    /**
     * Updates the label location
     */
    private updateLabelLocation;
    private calculatePathActualPosition;
    /**
     * Animates the data label.
     *
     * @param  {Series} series - Data label of the series gets animated.
     * @returns {void}
     */
    doDataLabelAnimation(series: Series, element?: Element): void;
    private getPosition;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the dataLabel for series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
