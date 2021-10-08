import { Gantt } from '../base/gantt';
/**
 * virtual Content renderer for Gantt
 */
export declare class VirtualContentRenderer {
    private parent;
    private wrapper;
    private virtualTrack;
    constructor(parent: Gantt);
    /**
     * To render a wrapper for chart body content when virtualization is enabled.
     *
     * @returns {void} .
     * @hidden
     */
    renderWrapper(): void;
    /**
     * To append child elements for wrappered element when virtualization is enabled.
     *
     * @param {HTMLElement} element .
     * @returns {void} .
     * @hidden
     */
    appendChildElements(element: HTMLElement): void;
    /**
     * To adjust gantt content table's style when virtualization is enabled
     *
     * @returns {void} .
     * @hidden
     */
    adjustTable(): void;
}
