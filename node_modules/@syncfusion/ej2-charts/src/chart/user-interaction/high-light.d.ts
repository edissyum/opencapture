import { Chart } from '../chart';
import { Selection } from './selection';
/**
 * `Highlight` module handles the selection for chart.
 *
 * @private
 */
export declare class Highlight extends Selection {
    /**
     * Constructor for selection module.
     *
     * @private
     */
    constructor(chart: Chart);
    /**
     * Binding events for selection module.
     */
    private wireEvents;
    /**
     * UnBinding events for selection module.
     */
    private unWireEvents;
    /**
     * To find private variable values
     */
    private declarePrivateVariables;
    /**
     * Method to select the point and series.
     *
     * @returns {void}
     */
    invokeHighlight(chart: Chart): void;
    /**
     * Get module name.
     *
     * @private
     */
    getModuleName(): string;
    /**
     * To destroy the highlight.
     *
     * @returns {void}
     * @private
     */
    destroy(): void;
}
