/**
 * PdfTemplate.ts class for EJ2-PDF
 */
import { PdfStream } from './../../primitives/pdf-stream';
import { PdfGraphics } from './../pdf-graphics';
import { PdfResources } from './../pdf-resources';
import { SizeF } from './../../drawing/pdf-drawing';
import { IPdfWrapper } from './../../../interfaces/i-pdf-wrapper';
import { IPdfPrimitive } from './../../../interfaces/i-pdf-primitives';
/**
 * Represents `Pdf Template` object.
 * @private
 */
export declare class PdfTemplate implements IPdfWrapper {
    /**
     * Stores the value of current `graphics`.
     * @private
     */
    private pdfGraphics;
    /**
     * Stores the instance of `PdfResources` class.
     * @private
     */
    private resources;
    /**
     * Stores the `size` of the 'PdfTemplate'.
     * @private
     */
    private templateSize;
    /**
     * Initialize an instance for `DictionaryProperties` class.
     * @private
     * @hidden
     */
    private dictionaryProperties;
    /**
     * Stores the `content` of the 'PdfTemplate'.
     * @private
     */
    content: PdfStream;
    /**
     * Checks whether the transformation 'is performed'.
     * @default true
     * @private
     */
    writeTransformation: boolean;
    /**
     * Gets the size of the 'PdfTemplate'.
     */
    readonly size: SizeF;
    /**
     * Gets the width of the 'PdfTemplate'.
     */
    readonly width: number;
    /**
     * Gets the height of the 'PdfTemplate'.
     */
    readonly height: number;
    /**
     * Gets the `graphics` of the 'PdfTemplate'.
     */
    readonly graphics: PdfGraphics;
    /**
     * Gets the resources and modifies the template dictionary.
     * @private
     */
    getResources(): PdfResources;
    /**
     * Create the new instance for `PdfTemplate` class.
     * @private
     */
    constructor();
    /**
     * Create the new instance for `PdfTemplate` class with Size.
     * @private
     */
    constructor(arg1: SizeF);
    /**
     * Create the new instance for `PdfTemplate` class with width and height.
     * @private
     */
    constructor(arg1: number, arg2: number);
    /**
     * `Initialize` the type and subtype of the template.
     * @private
     */
    private initialize;
    /**
     * `Adds type key`.
     * @private
     */
    private addType;
    /**
     * `Adds SubType key`.
     * @private
     */
    private addSubType;
    /**
     * `Reset` the size of the 'PdfTemplate'.
     */
    reset(): void;
    reset(size: SizeF): void;
    /**
     * `Set the size` of the 'PdfTemplate'.
     * @private
     */
    private setSize;
    /**
     * Gets the `content stream` of 'PdfTemplate' class.
     * @private
     */
    readonly element: IPdfPrimitive;
}
