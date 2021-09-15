import { ProgressBar } from '../progressbar';
import { ProgressAnnotationSettings } from '../model/progress-base';
import { ProgressLocation } from '../utils/helper';
/**
 * Base file for annotation
 */
export declare class AnnotationBase {
    private control;
    private annotation;
    /**
     * Constructor for progress annotation
     *
     * @param {ProgressBar} control It called constructor
     */
    constructor(control: ProgressBar);
    render(annotation: ProgressAnnotationSettings, index: number): HTMLElement;
    /**
     * To process the annotation
     *
     * @param {ProgressAnnotationSettings} annotation One of the parameter called annotation
     * @param {number} index Index of the annotation
     * @param {HTMLElement} parentElement Parent element of the annotation
     */
    processAnnotation(annotation: ProgressAnnotationSettings, index: number, parentElement: HTMLElement): void;
    setElementStyle(location: ProgressLocation, element: HTMLElement, parentElement: HTMLElement): void;
    private Location;
}
