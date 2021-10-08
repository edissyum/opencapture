import { Gantt } from '../base/gantt';
/**
 * DayMarkers module is used to render event markers, holidays and to highlight the weekend days.
 */
export declare class DayMarkers {
    private parent;
    private nonworkingDayRender;
    private eventMarkerRender;
    constructor(parent: Gantt);
    private wireEvents;
    private propertyChanged;
    private refreshMarkers;
    private updateHeight;
    /**
     * To get module name
     *
     * @returns {string} .
     */
    getModuleName(): string;
    /**
     * @returns {void} .
     * @private
     */
    destroy(): void;
}
