/**
 * PdfTemplateValuePair.ts class for EJ2-PDF
 * @private
 */
import { PdfTemplate } from './../../graphics/figures/pdf-template';
/**
 * Represent class to store information about `template and value pairs`.
 * @private
 */
export declare class PdfTemplateValuePair {
    /**
     * Internal variable to store template.
     * @default null
     * @private
     */
    private pdfTemplate;
    /**
     * Intenal variable to store value.
     * @private
     */
    private content;
    /**
     * Initializes a new instance of the 'PdfTemplateValuePair' class.
     * @private
     */
    constructor();
    constructor(template: PdfTemplate, value: string);
    /**
     * Gets or sets the template.
     * @private
     */
    template: PdfTemplate;
    /**
     * Gets or sets the value.
     * @private
     */
    value: string;
}
