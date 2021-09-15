/**
 * To render and update event markers in Gantt
 */
import { Gantt } from '../base/gantt';
export declare class EventMarker {
    parent: Gantt;
    eventMarkersContainer: HTMLElement;
    constructor(gantt: Gantt);
    /**
     * @returns {void} .
     * @private
     */
    renderEventMarkers(): void;
    /**
     * @returns {void} .
     * @private
     */
    removeContainer(): void;
    /**
     * Method to get event markers as html string
     *
     * @param {HTMLElement} container .
     * @returns {void} .
     */
    private getEventMarkersElements;
    /**
     * @returns {void} .
     * @private
     */
    updateContainerHeight(): void;
}
