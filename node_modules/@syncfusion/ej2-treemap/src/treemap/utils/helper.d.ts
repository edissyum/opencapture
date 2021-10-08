import { BorderModel, FontModel, ColorMappingModel } from '../model/base-model';
import { SvgRenderer } from '@syncfusion/ej2-svg-base';
import { Alignment, LabelPosition } from '../utils/enum';
import { TreeMap } from '../treemap';
import { IShapes } from '../model/interface';
import { ExportType } from '../utils/enum';
/**
 * Create the class for size
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
export declare function stringToNumber(value: string, containerSize: number): number;
/**
 * Internal use of type rect
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
 * Internal use of rectangle options
 *
 * @private
 */
export declare class RectOption {
    id: string;
    fill: string;
    x: number;
    y: number;
    height: number;
    width: number;
    opacity: number;
    stroke: string;
    ['stroke-width']: number;
    ['stroke-dasharray']: string;
    constructor(id: string, fill: string, border: BorderModel, opacity: number, rect: Rect, dashArray?: string);
}
export declare class PathOption {
    id: string;
    opacity: number;
    fill: string;
    stroke: string;
    ['stroke-width']: number;
    ['stroke-dasharray']: string;
    d: string;
    constructor(id: string, fill: string, width: number, color: string, opacity?: number, dashArray?: string, d?: string);
}
/**
 * Function to measure the height and width of the text.
 *
 * @param  {string} text - Specifies the text.
 * @param  {FontModel} font - Specifies the font.
 * @param  {string} id - Specifies the id.
 * @returns {Size} - Returns the size.
 * @private
 */
export declare function measureText(text: string, font: FontModel): Size;
/**
 * Internal use of text options
 *
 * @private
 */
export declare class TextOption {
    anchor: string;
    id: string;
    transform: string;
    x: number;
    y: number;
    text: string | string[];
    baseLine: string;
    connectorText: string;
    constructor(id?: string, x?: number, y?: number, anchor?: string, text?: string | string[], transform?: string, baseLine?: string, connectorText?: string);
}
/**
 * Trim the title text
 *
 * @param {number} maxWidth - Specifies the maximum width
 * @param {string} text - Specifies the text
 * @param {FontModel} font - Specifies the font
 * @returns {string} - Returns the string
 * @private
 */
export declare function textTrim(maxWidth: number, text: string, font: FontModel): string;
/**
 * Map internal class for Point
 */
export declare class Location {
    /**
     * To calculate x value for location
     */
    x: number;
    /**
     * To calculate y value for location
     */
    y: number;
    constructor(x: number, y: number);
}
/**
 * Method to calculate x position of title
 */
export declare function findPosition(location: Rect, alignment: Alignment, textSize: Size, type: string): Location;
export declare function createTextStyle(renderer: SvgRenderer, renderOptions: any, text: string): HTMLElement;
/**
 * Internal rendering of text
 *
 * @param {TextOption} options - Specifies the text option
 * @param {FontModel} font - Specifies the font model
 * @param {string} color - Specifies the color
 * @param {HTMLElement | Element} parent - Specifes the html element
 * @param {boolean} isMinus - Specifies the boolean value
 * @returns {Element} - Returns the element
 * @private
 */
export declare function renderTextElement(options: TextOption, font: FontModel, color: string, parent: HTMLElement | Element, isMinus?: boolean): Element;
export declare function setItemTemplateContent(targetId: string, targetElement: Element, contentItemTemplate: string): void;
export declare function getElement(id: string): Element;
export declare function itemsToOrder(a: any, b: any): number;
export declare function isContainsData(source: string[], pathName: string, processData: any, treemap: TreeMap): boolean;
export declare function findChildren(data: any): any;
export declare function findHightLightItems(data: any, items: string[], mode: string, treeMap: TreeMap): string[];
/**
 * Function to compile the template function for maps.
 *
 * @param {string} template - Specifies the template
 * @returns {Function} - Returns the template function
 * @private
 */
export declare function getTemplateFunction(template: string): any;
/**
 * @private
 * @param {HTMLCollection} element - Specifies the element
 * @param {string} labelId - Specifies the label id
 * @param {Object} data - Specifies the data
 * @returns {HTMLElement} - Returns the element
 */
export declare function convertElement(element: HTMLCollection, labelId: string, data: any): HTMLElement;
export declare function findLabelLocation(rect: Rect, position: LabelPosition, labelSize: Size, type: string, treemap: TreeMap): Location;
export declare function measureElement(element: HTMLElement, parentElement: HTMLElement): Size;
export declare function getArea(rect: Rect): number;
export declare function getShortestEdge(input: Rect): number;
export declare function convertToContainer(rect: Rect): Rect;
export declare function convertToRect(container: Rect): Rect;
export declare function getMousePosition(pageX: number, pageY: number, element: Element): Location;
export declare function colorMap(colorMapping: ColorMappingModel[], equalValue: string, value: number | string, weightValuePath: number): any;
export declare function deSaturationColor(weightValuePath: number, colorMapping: ColorMappingModel, color: string, rangeValue: number): string;
export declare function colorCollections(colorMap: ColorMappingModel, value: number): string;
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function getColorByValue(colorMap: ColorMappingModel, value: number): string;
export declare function getGradientColor(value: number, colorMap: ColorMappingModel): ColorValue;
export declare function getPercentageColor(percent: number, previous: string, next: string): ColorValue;
export declare function getPercentage(percent: number, previous: number, next: number): number;
export declare function wordWrap(maximumWidth: number, dataLabel: string, font: FontModel): string[];
export declare function textWrap(maxWidth: number, label: string, font: FontModel): string[];
/**
 * hide function
 *
 * @param {number} maxWidth - Specifies the maximum width
 * @param {number} maxHeight - Specifies the maximum height
 * @param {string} text - Specifies the text
 * @param {FontModel} font - Specifies the font
 * @returns {string} - Returns the hideText
 */
export declare function hide(maxWidth: number, maxHeight: number, text: string, font: FontModel): string;
export declare function orderByArea(a: number, b: number): number;
export declare function maintainSelection(treemap: TreeMap, element: Element, className: string): void;
export declare function legendMaintain(treemap: TreeMap, legendGroup: Element): void;
export declare function removeClassNames(elements: HTMLCollection, type: string, treemap: TreeMap): void;
export declare function applyOptions(element: SVGPathElement, options: any): void;
export declare function textFormatter(format: string, data: any, treemap: TreeMap): string;
export declare function formatValue(value: number, treemap: TreeMap): string | number;
/**
 * @private
 */
export declare class ColorValue {
    r: number;
    g: number;
    b: number;
    constructor(r?: number, g?: number, b?: number);
}
/**
 * @param {ColorValue} value - Specfies the color value
 * @returns {string} - Returns the string
 * @private
 */
export declare function convertToHexCode(value: ColorValue): string;
/**
 * @param {number} value - Specifes the value
 * @returns {string} - Returns the string
 * @private */
export declare function componentToHex(value: number): string;
/**
 * @param {string} hex - Specifies the hex value
 * @returns {ColorValue} - Returns the color value
 * @private
 */
export declare function convertHexToColor(hex: string): ColorValue;
/**
 * @param {string} color - Specifies the color
 * @returns {string} - Returns the string
 * @private
 */
export declare function colorNameToHex(color: string): string;
/**
 * @param {Location} location - Specifies the location
 * @param {string} shape - Specifies the shape
 * @param {Size} size - Specifies the size
 * @param {string} url - Specifies the url
 * @param {PathOption} options - Specifies the options
 * @param {string} label - Specifies the label
 * @returns {Element} - Returns the element
 * @private
 */
export declare function drawSymbol(location: Location, shape: string, size: Size, url: string, options: PathOption, label: string): Element;
/**
 * @param {Location} location - Specifies the location
 * @param {Size} size - Specifies the size
 * @param {string} shape - Specifies the shape
 * @param {PathOption} options - Specifies the path option
 * @param {string} url - Specifies the string
 * @returns {IShapes} - Returns the shapes
 * @private
 */
export declare function renderLegendShape(location: Location, size: Size, shape: string, options: PathOption, url: string): IShapes;
export declare function isParentItem(data: any[], item: any): boolean;
/**
 * Ajax support for treemap
 */
export declare class TreeMapAjax {
    /** options for data */
    dataOptions: string | any;
    /** type of data */
    type: string;
    /** async value */
    async: boolean;
    /** type of the content */
    contentType: string;
    /** sending data */
    sendData: string | any;
    constructor(options: string | any, type?: string, async?: boolean, contentType?: string, sendData?: string | any);
}
export declare function removeShape(collection: any[], value: string): void;
export declare function removeLegend(collection: any[], value: string): void;
export declare function setColor(element: Element, fill: string, opacity: string, borderColor: string, borderWidth: string): void;
export declare function removeSelectionWithHighlight(collection: any[], element: any[], treemap: TreeMap): void;
export declare function getLegendIndex(length: number, item: any, treemap: TreeMap): number;
export declare function pushCollection(collection: any[], index: number, number: number, legendElement: Element, shapeElement: Element, renderItems: any[], legendCollection: any[]): void;
/**
 * To trigger the download element
 *
 * @param {string} fileName - Specifies the file name
 * @param {ExportType} type - Specifies the type
 * @param {string} url - Specifies the url
 * @param {boolean} isDownload - Specifies the boolean value
 * @returns {void}
 */
export declare function triggerDownload(fileName: string, type: ExportType, url: string, isDownload: boolean): void;
export declare function removeElement(id: string): void;
