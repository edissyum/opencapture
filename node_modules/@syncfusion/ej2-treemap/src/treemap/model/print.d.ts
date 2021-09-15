import { TreeMap } from '../../index';
/**
 * Print module handles the print functionality for treemap.
 *
 * @hidden
 */
export declare class Print {
    private control;
    private printWindow;
    /**
     * Constructor for Maps
     *
     * @param {TreeMap} control - Specifies the treemap instance.
     */
    constructor(control: TreeMap);
    /**
     * This method is used to perform the print functionality in treemap.
     *
     * @param { string[] | string | Element} elements - Specifies the element.
     * @returns {void}
     * @private
     */
    print(elements?: string[] | string | Element): void;
    /**
     * To get the html string of the Maps
     *
     * @param {string[] | string | Element} elements - Specifies the element
     * @returns {Element} - Returns the element
     * @private
     */
    getHTMLContent(elements?: string[] | string | Element): Element;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the legend.
     *
     * @param {TreeMap} treemap - Specifies the treemap instance
     * @returns {void}
     * @private
     */
    destroy(treemap: TreeMap): void;
}
