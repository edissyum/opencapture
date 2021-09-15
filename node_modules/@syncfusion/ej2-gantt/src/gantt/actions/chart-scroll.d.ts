import { Gantt } from '../base/gantt';
/**
 * To handle scroll event on chart and from TreeGrid
 *
 * @hidden
 */
export declare class ChartScroll {
    private parent;
    private element;
    private isFromTreeGrid;
    previousScroll: {
        top: number;
        left: number;
    };
    /**
     * Constructor for the scrolling.
     *
     * @param {Gantt} parent .
     * @hidden
     */
    constructor(parent: Gantt);
    /**
     * Bind event
     *
     * @returns {void} .
     */
    private addEventListeners;
    /**
     * Unbind events
     *
     * @returns {void} .
     */
    private removeEventListeners;
    /**
     *
     * @param {object} args .
     * @returns {void} .
     */
    private gridScrollHandler;
    /**
     * Method to update vertical grid line, holiday, event markers and weekend container's top position on scroll action
     *
     * @returns {void} .
     * @private
     */
    updateTopPosition(): void;
    /**
     * Scroll event handler
     *
     * @returns {void} .
     */
    private onScroll;
    /**
     * To set height for chart scroll container
     *
     * @param {string | number} height - To set height for scroll container in chart side
     * @returns {void} .
     * @private
     */
    setHeight(height: string | number): void;
    /**
     * To set width for chart scroll container
     *
     * @param {string | number} width - To set width to scroll container
     * @returns {void} .
     * @private
     */
    setWidth(width: string | number): void;
    /**
     * To set scroll top for chart scroll container
     *
     * @param {number} scrollTop - To set scroll top for scroll container
     * @returns {void} .
     * @private
     */
    setScrollTop(scrollTop: number): void;
    /**
     * To set scroll left for chart scroll container
     *
     * @param {number} scrollLeft  - To set scroll left for scroll container
     * @returns {void} .
     */
    setScrollLeft(scrollLeft: number): void;
    /**
     * Destroy scroll related elements and unbind the events
     *
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
