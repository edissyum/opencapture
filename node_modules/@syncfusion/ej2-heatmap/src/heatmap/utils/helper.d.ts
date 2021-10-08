import { FontModel, BorderModel, PaletteCollectionModel } from '../model/base-model';
import { HeatMap } from '../heatmap';
import { RgbColor } from '../utils/colorMapping';
import { BubbleTooltipData } from '../model/base';
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {string} value - specifies the value
 * @param  {number} containerSize - specifies the containerSize
 * @returns {number} returns the number
 * @hidden
 */
export declare function stringToNumber(value: string, containerSize: number): number;
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {string} text - specifies the text
 * @param  {FontModel} font - specifies the font
 * @returns {Size} returns the number
 * @hidden
 */
export declare function measureText(text: string, font: FontModel): Size;
/** @private */
export declare class TextElement {
    ['font-size']: string;
    ['font-style']: string;
    ['font-family']: string;
    ['font-weight']: string;
    fill: string;
    constructor(fontModel: FontModel, fontColor?: string);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {number} width - specifies the text
 * @param  {number} leftPadding - specifies the font
 * @param  {number} rightPadding - specifies the font
 * @param  {FontModel} titleStyle - specifies the font
 * @returns {number} returns the number
 * @hidden
 */
export declare function titlePositionX(width: number, leftPadding: number, rightPadding: number, titleStyle: FontModel): number;
/**
 * Internal class size for height and width
 *
 * @private
 */
export declare class Size {
    /**
     * height of the size
     */
    height: number;
    /**
     * width of the size
     */
    width: number;
    constructor(width: number, height: number);
}
/** @private */
export declare class CustomizeOption {
    id: string;
    constructor(id?: string);
}
/** @private */
export declare class PathOption extends CustomizeOption {
    opacity: number;
    fill: string;
    stroke: string;
    ['stroke-width']: number;
    ['stroke-dasharray']: string;
    d: string;
    constructor(id: string, fill: string, width: number, color?: string, opacity?: number, dashArray?: string, d?: string);
}
/**
 * Class to define currentRect private property.
 *
 * @private
 */
export declare class CurrentRect {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number | BubbleTooltipData[];
    id: string;
    xIndex: number;
    yIndex: number;
    xValue: number;
    yValue: number;
    visible: boolean;
    displayText: string;
    textId: string;
    allowCollection: boolean;
    constructor(x: number, y: number, width: number, height: number, value: number | BubbleTooltipData[], id: string, xIndex: number, yIndex: number, xValue: number, yValue: number, visible: boolean, displayText: string, textId: string, allowCollection: boolean);
}
/**
 * Class to define the details of selected cell.
 *
 * @private
 */
export declare class SelectedCellDetails {
    value: number | BubbleTooltipData[];
    xLabel: string;
    yLabel: string;
    xValue: string | number | Date;
    yValue: string | number | Date;
    cellElement: Element;
    /** @private */
    xPosition: number;
    /** @private */
    yPosition: number;
    /** @private */
    width: number;
    /** @private */
    height: number;
    /** @private */
    x: number;
    /** @private */
    y: number;
    constructor(value: number | BubbleTooltipData[], xLabel: string, yLabel: string, xValue: number, yValue: number, cellElement: Element, xPosition: number, yPosition: number, width: number, height: number, x: number, y: number);
}
/**
 * Class to define property to draw rectangle.
 *
 * @private
 */
export declare class RectOption extends PathOption {
    x: number;
    y: number;
    height: number;
    width: number;
    rx: number;
    ry: number;
    transform: string;
    constructor(id: string, fill: string, border: BorderModel, opacity: number, rect: Rect, borderColor?: string, rx?: number, ry?: number, transform?: string, dashArray?: string);
}
/**
 * Class to define property to draw circle.
 *
 * @private
 */
export declare class CircleOption extends PathOption {
    cx: number;
    cy: number;
    r: number;
    constructor(id: string, fill: string, border: BorderModel, opacity: number, borderColor?: string, cx?: number, cy?: number, r?: number);
}
/**
 * Helper Class to define property to draw rectangle.
 *
 * @private
 */
export declare class Rect {
    x: number;
    y: number;
    height: number;
    width: number;
    constructor(x: number, y: number, width: number, height: number);
}
/**
 * Class to define property to draw text.
 *
 * @private
 */
export declare class TextOption extends TextElement {
    id: string;
    ['text-anchor']: string;
    text: string | string[];
    transform: string;
    x: number;
    y: number;
    ['dominant-baseline']: string;
    labelRotation: number;
    baseline: string;
    dy: string;
    constructor(id: string, basic: TextBasic, element: FontModel, fontColor?: string);
}
/**
 * Helper Class to define property to draw text.
 *
 * @private
 */
export declare class TextBasic {
    ['text-anchor']: string;
    text: string | string[];
    transform: string;
    x: number;
    y: number;
    ['dominant-baseline']: string;
    labelRotation: number;
    baseline: string;
    dy: string;
    constructor(x?: number, y?: number, anchor?: string, text?: string | string[], labelRotation?: number, transform?: string, baseLine?: string, dy?: string);
}
/**
 * Class to define property to draw line.
 *
 * @private
 */
export declare class Line {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number);
}
/**
 * Class to define property to draw line.
 *
 * @private
 */
export declare class LineOption extends PathOption {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(id: string, line: Line, stroke: string, strokewidth: number, opacity?: number, dasharray?: string);
}
/**
 * Properties required to render path.
 *
 * @private
 */
export declare class PathAttributes extends PathOption {
    d: string;
    x: number;
    y: number;
    constructor(id: string, path: Path, fill: string, border: BorderModel, borderWidth: number, opacity: number, borderColor?: string);
}
/**
 * Helper Class to define property to path.
 *
 * @private
 */
export declare class Path {
    d: string;
    innerR: boolean;
    cx: number;
    cy: number;
    x: number;
    y: number;
    x1: number;
    y1: number;
    start: number;
    end: number;
    radius: number;
    counterClockWise: boolean;
    constructor(d: string, innerR: boolean, x: number, y: number, x1: number, y1: number, cx: number, cy: number, start: number, end: number, radius: number, counterClockWise: boolean);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param  {number} values - specifies the values
 * @returns {number} returns the number
 * @hidden
 */
export declare function sum(values: number[]): number;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { Size } heatmapSize - Specifies the heatmapsize
 * @param { number } topPadding - Specifies the topPadding
 * @param { number }  bottomPadding - Specifies the bottomPadding
 * @param { FontModel } titleStyle - Specifies the titleStyle
 * @returns {number} returns the number
 * @private
 */
export declare function titlePositionY(heatmapSize: Size, topPadding: number, bottomPadding: number, titleStyle: FontModel): number;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { FontModel } font - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { number }  angle - Specifies the bottomPadding
 * @returns {Size} returns the size
 * @private
 */
export declare function rotateTextSize(font: FontModel, text: string, angle: number): Size;
/**
 * Class to draw SVG and Canvas Rectangle & Text.
 *
 * @private
 */
export declare class DrawSvgCanvas {
    private heatMap;
    constructor(heatmap?: HeatMap);
    drawRectangle(properties: RectOption, parentElement: Element, isFromSeries?: boolean): void;
    drawCircle(properties: CircleOption, parentElement: Element): void;
    drawPath(properties: PathAttributes, options: Path, parentElement: Element): void;
    createText(properties: TextOption, parentElement: Element, text: string | string[]): void;
    createWrapText(options: TextOption, font: FontModel, parentElement: Element): void;
    drawLine(properties: LineOption, parentElement: Element): void;
    canvasDrawText(options: TextOption, label: string, translateX?: number, translateY?: number): void;
    private getOptionValue;
    private setAttributes;
    private drawCanvasRectangle;
    private drawCornerRadius;
    private drawCanvasCircle;
    private drawCanvasPath;
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } title - Specifies the heatmapsize
 * @param { FontModel } style - Specifies the topPadding
 * @param { number }  width - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function getTitle(title: string, style: FontModel, width: number): string[];
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } currentLabel - Specifies the heatmapsize
 * @param { number } maximumWidth - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function textWrap(currentLabel: string, maximumWidth: number, font: FontModel): string[];
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } maxWidth - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function textTrim(maxWidth: number, text: string, font: FontModel): string;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } maxWidth - Specifies the heatmapsize
 * @param { string } text - Specifies the topPadding
 * @param { FontModel }  font - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function textNone(maxWidth: number, text: string, font: FontModel): string;
/** @private */
export declare class Gradient {
    id: string;
    x1: string;
    x2: string;
    y1: string;
    y2: string;
    constructor(x: string, x1: string, x2: string, y1: string, y2: string);
}
export declare class GradientColor {
    color: string;
    colorStop: string;
    constructor(color: string, colorStop: string);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } text - Specifies the heatmapsize
 * @param { number } x - Specifies the topPadding
 * @param { number }  y - Specifies the bottomPadding
 * @param { number }  areaWidth - Specifies the bottomPadding
 * @param { string }  id - Specifies the bottomPadding
 * @param { Element }  element - Specifies the bottomPadding
 * @param { boolean }  isTouch - Specifies the bottomPadding
 * @param { HeatMap }  heatmap - Specifies the bottomPadding
 * @returns {void} returns the size
 * @private
 */
export declare function showTooltip(text: string, x: number, y: number, areaWidth: number, id: string, element: Element, isTouch?: boolean, heatmap?: HeatMap): void;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  id - Specifies the bottomPadding
 * @returns {void} returns the size
 * @private
 */
export declare function removeElement(id: string): void;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  id - Specifies the bottomPadding
 * @returns {Element} returns the size
 * @private
 */
export declare function getElement(id: string): Element;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number } value - Specifies the topPadding
 * @param { number }  interval - Specifies the bottomPadding
 * @param { string } intervalType - Specifies the heatmapsize
 * @param { number }  increment - Specifies the bottomPadding
 * @returns {Date} returns the size
 * @private
 */
export declare function increaseDateTimeInterval(value: number, interval: number, intervalType: string, increment: number): Date;
export declare class CanvasTooltip {
    text: string;
    region: Rect;
    constructor(text: string, rect: Rect);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { CanvasTooltip } tooltipCollection - Specifies the topPadding
 * @param { number }  xPosition - Specifies the bottomPadding
 * @param { number } yPosition - Specifies the heatmapsize
 * @returns {string} returns the size
 * @private
 */
export declare function getTooltipText(tooltipCollection: CanvasTooltip[], xPosition: number, yPosition: number): string;
/**
 * @private
 */
export declare class PaletterColor {
    isCompact: boolean;
    isLabel: boolean;
    offsets: PaletteCollectionModel[];
}
/**
 * @private
 */
export declare class GradientPointer {
    pathX1: number;
    pathY1: number;
    pathX2: number;
    pathY2: number;
    pathX3: number;
    pathY3: number;
    constructor(pathX1: number, pathY1: number, pathX2: number, pathY2: number, pathX3: number, pathY3: number);
}
/**
 * Class to define currentRect private property.
 *
 * @private
 */
export declare class CurrentLegendRect {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    id: string;
    constructor(x: number, y: number, width: number, height: number, label: string, id: string);
}
/** @private */
export declare class LegendRange {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
    visible: boolean;
    currentPage: number;
    constructor(x: number, y: number, width: number, height: number, value: number, visible: boolean, currentPage: number);
}
/** @private */
export declare class ToggleVisibility {
    visible: boolean;
    value: number;
    startValue: number;
    endValue: number;
    constructor(visible: boolean, value: number, startValue: number, endValue: number);
}
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string } color - Specifies the topPadding
 * @returns {string} returns the size
 * @private
 */
export declare function colorNameToHex(color: string): string;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { RgbColor } value - Specifies the topPadding
 * @returns {string} returns the size
 * @private
 */
export declare function convertToHexCode(value: RgbColor): string;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { number }  value - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function componentToHex(value: number): string;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { string }  hex - Specifies the bottomPadding
 * @returns {RgbColor} returns the size
 * @private
 */
export declare function convertHexToColor(hex: string): RgbColor;
/**
 * Function to check whether target object implement specific interface
 *
 * @param { boolean }  isCustom - Specifies the bottomPadding
 * @param { string }  format - Specifies the bottomPadding
 * @param { number }  tempInterval - Specifies the bottomPadding
 * @param { Function }  formatFun - Specifies the bottomPadding
 * @returns {string} returns the size
 * @private
 */
export declare function formatValue(isCustom: boolean, format: string, tempInterval: number, formatFun: Function): string;
/** @private */
export declare class MultiLevelPosition {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
