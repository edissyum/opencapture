import { LinearGauge } from '../../linear-gauge';
/**
 * Represent the Annotation rendering for gauge
 */
export declare class Annotations {
    private gauge;
    constructor(gauge: LinearGauge);
    /**
     * To render annotation elements
     */
    renderAnnotationElements(): void;
    /**
     * To create annotation elements
     */
    createAnnotationTemplate(element: HTMLElement, annotationIndex: number): void;
    protected getModuleName(): string;
    /**
     * To destroy the annotation.
     *
     * @return {void}
     * @private
     */
    destroy(gauge: LinearGauge): void;
}
