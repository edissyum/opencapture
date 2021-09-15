import { LinearGauge } from '../../index';
/**
 * Represent the print and export for gauge.
 *
 * @hidden
 */
export declare class Print {
    private control;
    private printWindow;
    /**
     * Constructor for gauge
     *
     * @param control
     */
    constructor(control: LinearGauge);
    /**
     * To print the gauge
     *
     * @param elements
     * @private
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the gauge
     *
     * @param elements
     * @private
     */
    private getHTMLContent;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the print.
     *
     * @return {void}
     * @private
     */
    destroy(control: LinearGauge): void;
}
