import { TreeMap } from '../treemap';
import { Rect } from '../utils/helper';
/**
 * To calculate and render the shape layer
 */
export declare class LayoutPanel {
    private treemap;
    private currentRect;
    layoutGroup: Element;
    private renderer;
    renderItems: any[];
    private parentData;
    constructor(treemap: TreeMap);
    processLayoutPanel(): void;
    private getDrilldownData;
    calculateLayoutItems(data: any, rect: Rect): void;
    private computeSliceAndDiceDimensional;
    private sliceAndDiceProcess;
    private computeSquarifyDimensional;
    private calculateChildrenLayout;
    private performRowsLayout;
    private aspectRatio;
    private findMaxAspectRatio;
    private cutArea;
    private getCoordinates;
    private computeTotalArea;
    onDemandProcess(childItems: any): void;
    renderLayoutItems(renderData: any): void;
    private renderItemText;
    private getItemColor;
    /**
     * To find saturated color for datalabel
     *
     * @param {string} color - Specifies the color
     * @returns {string} - Returns the color
     */
    private getSaturatedColor;
    private renderTemplate;
    private labelInterSectAction;
}
