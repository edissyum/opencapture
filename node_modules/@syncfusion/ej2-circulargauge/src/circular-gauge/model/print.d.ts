import { CircularGauge } from '../../index';
/**
 * Represent the print for gauge
 *
 * @hidden
 */
export declare class Print {
    private control;
    private printWindow;
    /**
     * Constructor for gauge
     *
     * @param {CircularGauge} control - Specifies the instance of the gauge.
     */
    constructor(control: CircularGauge);
    /**
     * To print the gauge
     *
     * @param {string[] | string | Element} elements - Specifies the element.
     * @returns {void}
     * @private
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the gauge
     *
     * @param { string[] | string | Element} elements - Specifies the element.
     * @returns {Element} - Returns the div element.
     * @private
     */
    getHTMLContent(elements?: string[] | string | Element): Element;
    protected getModuleName(): string;
    /**
     * To destroy the Print.
     *
     * @param {CircularGauge} gauge - Specfies the instance of the gauge
     * @returns {void}
     * @private
     */
    destroy(gauge: CircularGauge): void;
}
