import { PdfAnnotation } from './annotation';
import { RectangleF } from './../drawing/pdf-drawing';
/**
 * `PdfLinkAnnotation` class represents the ink annotation class.
 * @private
 */
export declare abstract class PdfLinkAnnotation extends PdfAnnotation {
    /**
     * Initializes new instance of `PdfLineAnnotation` class with specified points.
     * @private
     */
    constructor();
    /**
     * Initializes new instance of `PdfLineAnnotation` class with set of points and annotation text.
     * @private
     */
    constructor(rectangle: RectangleF);
    /**
     * `Initializes` annotation object.
     * @private
     */
    protected initialize(): void;
}
