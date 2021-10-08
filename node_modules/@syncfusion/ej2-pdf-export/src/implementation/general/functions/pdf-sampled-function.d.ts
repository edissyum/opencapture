import { PdfFunction } from './pdf-function';
export declare class PdfSampledFunction extends PdfFunction {
    /**
     * Initializes a new instance of the `PdfSampledFunction` class.
     * @public
     */
    constructor();
    /**
     * Initializes a new instance of the `PdfSampledFunction` class.
     * @public
     */
    constructor(domain: number[], range: number[], sizes: number[], samples: number[]);
    /**
     * Checks the input parameters.
     */
    private checkParams;
    /**
     * Sets the domain and range.
     */
    private setDomainAndRange;
    /**
     * Sets the size and values.
     */
    private setSizeAndValues;
}
