import { TreeMap } from '../treemap';
/**
 * Performing treemap highlight
 */
export declare class TreeMapHighlight {
    private treemap;
    highLightId: string;
    private target;
    shapeTarget: string;
    private shapeElement;
    shapeHighlightCollection: any[];
    legendHighlightCollection: any[];
    currentElement: any[];
    constructor(treeMap: TreeMap);
    /**
     * Mouse down event in highlight
     */
    mouseMove(e: PointerEvent): boolean;
    /**
     * To bind events for highlight
     *
     * @returns {void}
     */
    private addEventListener;
    /**
     * To unbind events for highlight
     *
     * @returns {void}
     */
    private removeEventListener;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name
     */
    protected getModuleName(): string;
    /**
     * To destroy the hightlight.
     *
     * @param {TreeMap} treeMap - Specifies the instance of the treemap.
     * @returns {void}
     * @private
     */
    destroy(treeMap: TreeMap): void;
}
/**
 * Performing treemap selection
 */
export declare class TreeMapSelection {
    private treemap;
    legendSelectId: string;
    shapeSelectId: string;
    shapeElement: Element;
    shapeSelectionCollection: any[];
    legendSelectionCollection: any[];
    shapeSelect: boolean;
    legendSelect: boolean;
    constructor(treeMap: TreeMap);
    /**
     * Mouse down event in selection
     */
    mouseDown(e: PointerEvent): void;
    /**
     * @param {string} levelOrder - Specifies the level order of treemap item
     * @param {boolean} enable - Specifies the boolean value
     * @returns {void}
     * @private
     */
    selectTreemapItem(levelOrder: string, enable: boolean): void;
    /**
     * To bind events for selection
     *
     * @returns {void}
     */
    private addEventListener;
    /**
     * To unbind events for selection
     *
     * @returns {void}
     */
    private removeEventListener;
    /**
     * Get module name.
     *
     * @returns {string} - Returns the module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the selection.
     *
     * @param {TreeMap} treeMap - Specifies the treemap instance.
     * @returns {void}
     * @private
     */
    destroy(treeMap: TreeMap): void;
}
