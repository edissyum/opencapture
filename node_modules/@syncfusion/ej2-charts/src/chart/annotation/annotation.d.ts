import { Chart } from '../../chart/chart';
import { ChartAnnotationSettings } from './../model/chart-base';
import { AnnotationBase } from '../../common/annotation/annotation';
/**
 * `ChartAnnotation` module handles the annotation for chart.
 */
export declare class ChartAnnotation extends AnnotationBase {
    private chart;
    private annotations;
    private parentElement;
    /**
     * Constructor for chart annotation.
     *
     * @private
     */
    constructor(control: Chart, annotations: ChartAnnotationSettings[]);
    /**
     * Method to render the annotation for chart
     *
     * @param {Element} element annotation element
     * @private
     */
    renderAnnotations(element: Element): void;
    /**
     * To destroy the annotation.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
}
