import { Chart } from '../../chart/chart';
import { AccumulationChart } from '../../accumulation-chart/accumulation';
import { ChartAnnotationSettings } from '../../chart/model/chart-base';
import { ChartLocation } from '../utils/helper';
import { Alignment, Position } from '../utils/enum';
import { AccumulationAnnotationSettings } from '../../accumulation-chart/model/acc-base';
/**
 * Annotation Module handles the Annotation for chart and accumulation series.
 */
export declare class AnnotationBase {
    private control;
    private annotation;
    private isChart;
    /**
     * Constructor for chart and accumulation annotation
     *
     * @param control
     */
    constructor(control: Chart | AccumulationChart);
    /**
     * Method to render the annotation for chart and accumulation series.
     *
     * @private
     * @param annotation
     * @param index
     */
    render(annotation: AccumulationAnnotationSettings | ChartAnnotationSettings, index: number): HTMLElement;
    /**
     * Method to calculate the location for annotation - coordinate unit as pixel.
     *
     * @private
     * @param location
     */
    setAnnotationPixelValue(location: ChartLocation): boolean;
    /**
     * Method to calculate the location for annotation - coordinate unit as point.
     *
     * @private
     * @param location
     */
    setAnnotationPointValue(location: ChartLocation): boolean;
    /**
     * To process the annotation for accumulation chart
     *
     * @param annotation
     * @param index
     * @param parentElement
     */
    processAnnotation(annotation: ChartAnnotationSettings | AccumulationAnnotationSettings, index: number, parentElement: HTMLElement): void;
    /**
     * Method to calculate the location for annotation - coordinate unit as point in accumulation chart.
     *
     * @private
     * @param location
     */
    setAccumulationPointValue(location: ChartLocation): boolean;
    /**
     * Method to set the element style for accumulation / chart annotation.
     *
     * @private
     * @param location
     * @param element
     * @param parentElement
     */
    setElementStyle(location: ChartLocation, element: HTMLElement, parentElement: HTMLElement): void;
    /**
     * Method to calculate the alignment value for annotation.
     *
     * @private
     * @param alignment
     * @param size
     * @param value
     */
    setAlignmentValue(alignment: Alignment | Position, size: number, value: number): number;
}
