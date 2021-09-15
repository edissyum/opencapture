import { Maps, Annotation } from '../index';
/**
 * Represents the annotation elements for map.
 */
export declare class Annotations {
    private map;
    constructor(map: Maps);
    renderAnnotationElements(): void;
    /**
     * To create annotation elements
     */
    createAnnotationTemplate(parentElement: HTMLElement, annotation: Annotation, annotationIndex: number): void;
    protected getModuleName(): string;
    /**
     * To destroy the annotation.
     *
     * @param {Maps} map - Specifies the instance of the maps
     * @returns {void}
     * @private
     */
    destroy(map: Maps): void;
}
