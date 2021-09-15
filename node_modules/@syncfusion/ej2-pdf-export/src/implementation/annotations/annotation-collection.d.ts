import { IPdfWrapper } from './../../interfaces/i-pdf-wrapper';
import { PdfPage } from './../pages/pdf-page';
import { PdfArray } from './../primitives/pdf-array';
import { PdfAnnotation } from './../annotations/annotation';
import { IPdfPrimitive } from './../../interfaces/i-pdf-primitives';
import { DictionaryProperties } from './../input-output/pdf-dictionary-properties';
/**
 * `PdfAnnotationCollection` class represents the collection of 'PdfAnnotation' objects.
 * @private
 */
export declare class PdfAnnotationCollection implements IPdfWrapper {
    /**
     * `Error` constant message.
     * @private
     */
    private alreadyExistsAnnotationError;
    /**
     * `Error` constant message.
     * @private
     */
    private missingAnnotationException;
    /**
     * Specifies the Internal variable to store fields of `PdfDictionaryProperties`.
     * @private
     */
    protected dictionaryProperties: DictionaryProperties;
    /**
     * Parent `page` of the collection.
     * @private
     */
    private page;
    /**
     * Array of the `annotations`.
     * @private
     */
    private internalAnnotations;
    /**
     * privte `list` for the annotations.
     * @private
     */
    lists: PdfAnnotation[];
    /**
     * Gets the `PdfAnnotation` object at the specified index. Read-Only.
     * @private
     */
    annotations: PdfArray;
    /**
     * Initializes a new instance of the `PdfAnnotationCollection` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfAnnotationCollection` class with the specified page.
     * @private
     */
    constructor(page: PdfPage);
    /**
     * `Adds` a new annotation to the collection.
     * @private
     */
    add(annotation: PdfAnnotation): void | number;
    /**
     * `Adds` a Annotation to collection.
     * @private
     */
    protected doAdd(annotation: PdfAnnotation): void | number;
    /**
     * `Set a color of an annotation`.
     * @private
     */
    private setColor;
    /**
     * Gets the `Element` representing this object.
     * @private
     */
    readonly element: IPdfPrimitive;
}
