import { TreeMap } from '../treemap';
import { ColorMappingModel } from '../model/base-model';
import { Rect } from '../utils/helper';
/**
 * Legend module class
 */
export declare class TreeMapLegend {
    private treemap;
    /** collection of rendering legends */
    legendRenderingCollections: any[];
    /** collection of legends */
    legendCollections: any[];
    outOfRangeLegend: any;
    private legendHeight;
    private legendWidth;
    private totalPages;
    private page;
    private translate;
    legendBorderRect: Rect;
    private currentPage;
    heightIncrement: number;
    widthIncrement: number;
    private textMaxWidth;
    /** group of legend */
    legendGroup: Element;
    private legendNames;
    private defsElement;
    private gradientCount;
    private legendLinearGradient;
    private legendInteractiveGradient;
    private clearTimeout;
    private legendItemRect;
    constructor(treemap: TreeMap);
    /**
     * method for legend
     */
    renderLegend(): void;
    calculateLegendBounds(): void;
    private getPageChanged;
    private findColorMappingLegendItems;
    private findPaletteLegendItems;
    private calculateLegendItems;
    private removeDuplicates;
    private isAddNewLegendData;
    /**
     * To draw the legend
     */
    drawLegend(): void;
    private defaultLegendRtlLocation;
    private drawLegendItem;
    private renderLegendBorder;
    private renderLegendTitle;
    /**
     * To rendered the interactive pointer
     */
    renderInteractivePointer(e: PointerEvent | TouchEvent): void;
    private drawInteractivePointer;
    private getLegendAlignment;
    mouseUpHandler(e: PointerEvent): void;
    /**
     * To remove the interactive pointer
     */
    removeInteractivePointer(): void;
    /**
     * To change the next page
     */
    changeNextPage(e: PointerEvent): void;
    /**
     * Wire events for event handler
     */
    wireEvents(element: Element): void;
    /**
     * To add the event listener
     */
    addEventListener(): void;
    /**
     * To remove the event listener
     */
    removeEventListener(): void;
    /**
     * Get module name.
     */
    protected getModuleName(): string;
    /**
     * To destroy the legend.
     *
     * @param {TreeMap} treemap - Specifies treemap instance
     * @returns {void}
     * @private
     */
    destroy(treemap: TreeMap): void;
    /**
     * Get the gradient color for interactive legend.
     */
    legendGradientColor(colorMap: ColorMappingModel, legendIndex: number): string;
}
