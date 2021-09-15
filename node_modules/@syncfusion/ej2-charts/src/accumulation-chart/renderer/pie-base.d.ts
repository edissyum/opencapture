import { AccumulationChart } from '../accumulation';
import { ChartLocation } from '../../common/utils/helper';
import { Rect } from '@syncfusion/ej2-svg-base';
import { AccumulationLabelPosition } from '../model/enum';
import { AccumulationSeries, AccPoints } from '../model/acc-base';
import { AccumulationBase } from './accumulation-base';
import { AccumulationSeriesModel } from '../model/acc-base-model';
/**
 * PieBase class used to do pie base calculations.
 */
export declare class PieBase extends AccumulationBase {
    protected startAngle: number;
    protected totalAngle: number;
    innerRadius: number;
    pieBaseCenter: ChartLocation;
    pieBaseRadius: number;
    pieBaseLabelRadius: number;
    isRadiusMapped: boolean;
    seriesRadius: number;
    size: number;
    /**
     * To initialize the property values.
     *
     * @private
     */
    initProperties(chart: AccumulationChart, series: AccumulationSeries): void;
    getLabelRadius(series: AccumulationSeriesModel, point: AccPoints): number;
    /**
     * To find the center of the accumulation.
     *
     * @private
     */
    findCenter(accumulation: AccumulationChart, series: AccumulationSeries): void;
    /**
     * To find angles from series.
     */
    private initAngles;
    /**
     * To calculate data-label bound
     *
     * @private
     */
    defaultLabelBound(series: AccumulationSeries, visible: boolean, position: AccumulationLabelPosition): void;
    /**
     * To calculate series bound
     *
     * @private
     */
    getSeriesBound(series: AccumulationSeries): Rect;
    /**
     * To get rect location size from angle
     */
    private getRectFromAngle;
    /**
     * To get path arc direction
     */
    protected getPathArc(center: ChartLocation, start: number, end: number, radius: number, innerRadius: number): string;
    /**
     * To get pie direction
     */
    protected getPiePath(center: ChartLocation, start: ChartLocation, end: ChartLocation, radius: number, clockWise: number): string;
    /**
     * To get doughnut direction
     */
    protected getDoughnutPath(center: ChartLocation, start: ChartLocation, end: ChartLocation, radius: number, innerStart: ChartLocation, innerEnd: ChartLocation, innerRadius: number, clockWise: number): string;
    /**
     * Method to start animation for pie series.
     */
    protected doAnimation(slice: Element, series: AccumulationSeries): void;
}
