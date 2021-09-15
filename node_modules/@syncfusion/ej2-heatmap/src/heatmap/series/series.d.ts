import { ChildProperty } from '@syncfusion/ej2-base';
import { HeatMap } from '../heatmap';
import { CurrentRect } from '../utils/helper';
import { BorderModel, FontModel, BubbleSizeModel } from '../model/base-model';
import { CellType, BubbleType } from '../utils/enum';
/**
 * Configures the CellSettings property in the Heatmap.
 */
export declare class CellSettings extends ChildProperty<CellSettings> {
    /**
     * Toggles the visibility of data label over the heatmap cells.
     *
     * @default true
     */
    showLabel: boolean;
    /**
     * Specifies the formatting options for the data label.
     *
     * @default ''
     */
    format: string;
    /**
     * Enable or disable the cell highlighting on mouse hover
     *
     * @default true
     */
    enableCellHighlighting: boolean;
    /**
     * Specifies the minimum and maximum radius value of the cell in percentage.
     *
     * @default ''
     */
    bubbleSize: BubbleSizeModel;
    /**
     * Specifies the cell border style.
     *
     * @default ''
     */
    border: BorderModel;
    /**
     * Specifies the cell label style.
     *
     * @default ''
     */
    textStyle: FontModel;
    /**
     * Defines cell Type. They are
     * * Rect: Render a HeatMap cells in rectangle shape.
     * * Bubble: Render a HeatMap cells in bubble shape.
     *
     * @default 'Rect'
     */
    tileType: CellType;
    /**
     * Defines Bubble Type. They are
     * * Size: Define the bubble type is size.
     * * Color: Define the bubble type is color.
     * * Sector: Define the bubble type is sector.
     * * SizeAndColor: Define the bubble type is sizeandcolor.
     *
     * @default 'Color'
     */
    bubbleType: BubbleType;
    /**
     * Enable or disable the bubble to display in inverse
     *
     * @default true
     */
    isInversedBubbleSize: boolean;
}
export declare class Series {
    private heatMap;
    private drawSvgCanvas;
    private cellColor;
    private text;
    private color;
    private bubbleColorValue;
    hoverXAxisLabel: string | number;
    hoverYAxisLabel: string | number;
    hoverXAxisValue: string | number | Date;
    hoverYAxisValue: string | number | Date;
    constructor(heatMap?: HeatMap);
    /** @private */
    containerRectObject: Element;
    /** @private */
    containerTextObject: Element;
    /** @private */
    format: Function;
    checkLabelYDisplay: boolean;
    checkLabelXDisplay: boolean;
    rectPositionCollection: CurrentRect[][];
    /**
     * To render rect series.
     *
     * @returns {void}
     * @private
     */
    renderRectSeries(): void;
    /**
     * To toggle the cell text color based on legend selection.
     */
    private isCellValueInRange;
    /**
     * To customize the cell.
     *
     * @returns {void}
     * @private
     */
    cellRendering(rectPosition: CurrentRect, text: string): string;
    /**
     * To set color and text details.
     *
     * @private
     */
    private setTextAndColor;
    /**
     * To update rect details.
     *
     * @private
     */
    private createSeriesGroup;
    /**
     * To update rect details.
     *
     * @private
     */
    private updateRectDetails;
    /**
     * To Render Tile Cell.
     *
     * @private
     */
    private renderTileCell;
    /**
     * To get bubble radius.
     *
     * @private
     */
    private getBubbleRadius;
    /**
     * To Render Bubble Cell.
     *
     * @private
     */
    private renderSectorCell;
    /**
     * To Render sector Cell.
     *
     * @private
     */
    private calculateShapes;
    /**
     * To Render Bubble Cell.
     *
     * @private
     */
    private renderBubbleCell;
    /**
     * To find whether the X,Y Label need to display or not.
     *
     * @private
     */
    private updateLabelVisibleStatus;
    /**
     * To find percentage value.
     *
     * @private
     */
    private getRadiusBypercentage;
    /**
     * To find saturated color for datalabel.
     *
     * @returns {string}
     * @private
     */
    private getSaturatedColor;
    /**
     * To highlight the mouse hovered rect cell.
     *
     * @returns {void}
     * @private
     */
    highlightSvgRect(tempID: string): void;
    /**
     * To get the value depends to format.
     *
     * @returns {string}
     * @private
     */
    getFormatedText(val: number, getFormat: string): string;
    /**
     * To get mouse hovered cell details.
     *
     * @returns {CurrentRect}
     * @private
     */
    getCurrentRect(x: number, y: number): CurrentRect;
}
