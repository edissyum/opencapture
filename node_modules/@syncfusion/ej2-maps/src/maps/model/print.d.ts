import { Maps } from '../../index';
/**
 * This module enables the print functionality in maps.
 *
 * @hidden
 */
export declare class Print {
    private control;
    private printWindow;
    /**
     * Constructor for Maps
     *
     * @param {Maps} control - Specifies the instance of the map
     */
    constructor(control: Maps);
    /**
     * To print the Maps
     *
     * @param {string[] | string | Element} elements - Specifies the element
     * @returns {void}
     * @private
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the Maps
     *
     * @param {string[] | string | Element} elements - Specifies the html element
     * @returns {Element} - Returns the div element
     * @private
     */
    private getHTMLContent;
    /**
     * Get module name.
     *
     * @returns {string} Returns the module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the print.
     *
     * @param {Maps} maps - Specifies the instance of the maps
     * @returns {void}
     * @private
     */
    destroy(maps: Maps): void;
}
