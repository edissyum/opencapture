/**
 * AccumulationChart series file
 */
import { AccPoints, AccumulationSeries } from '../model/acc-base';
import { PathOption } from '@syncfusion/ej2-svg-base';
import { PieBase } from '../renderer/pie-base';
import { AccumulationChart } from '../accumulation';
import { AnimationModel } from '../../common/model/base-model';
/**
 * PieSeries module used to render `Pie` Series.
 */
export declare class PieSeries extends PieBase {
    /**
     * To get path option, degree, symbolLocation from the point.
     *
     * @private
     */
    renderPoint(point: AccPoints, series: AccumulationSeries, chart: AccumulationChart, option: PathOption, seriesGroup: Element, redraw?: boolean): void;
    findSeries(e: PointerEvent | TouchEvent): void;
    toggleInnerPoint(event: PointerEvent | TouchEvent, radius: number, innerRadius: number): void;
    removeBorder(borderElement: Element, duration: number): void;
    private refresh;
    /**
     * To get path option from the point.
     */
    private getPathOption;
    /**
     * To animate the pie series.
     *
     * @private
     */
    animateSeries(accumulation: AccumulationChart, option: AnimationModel, series: AccumulationSeries, slice: Element): void;
    /**
     * To get the module name of the Pie series.
     */
    protected getModuleName(): string;
    /**
     * To destroy the pie series.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
