import { Sparkline } from '../sparkline';
import { IThemes } from '../model/interface';
import { SparklineTheme } from '../model/enum';
import { SparklineBorderModel, SparklineFontModel } from '../model/base-model';
/**
 * Sparkline control helper file
 */
/**
 * sparkline internal use of `Size` type
 */
export declare class Size {
    /**
     * height of the size
     */
    height: number;
    width: number;
    constructor(width: number, height: number);
}
/**
 * To find the default colors based on theme.
 *
 * @private
 */
export declare function getThemeColor(theme: SparklineTheme): IThemes;
/**
 * To find number from string
 *
 * @private
 */
export declare function stringToNumber(value: string, containerSize: number): number;
/**
 * Method to calculate the width and height of the sparkline
 */
export declare function calculateSize(sparkline: Sparkline): void;
/**
 * Method to create svg for sparkline.
 */
export declare function createSvg(sparkline: Sparkline): void;
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
 * Internal use of path options
 *
 * @private
 */
export declare class PathOption {
    opacity: number;
    id: string;
    stroke: string;
    fill: string;
    ['stroke-dasharray']: string;
    ['stroke-width']: number;
    d: string;
    constructor(id: string, fill: string, width: number, color: string, opacity?: number, dashArray?: string, d?: string);
}
/**
 * Sparkline internal rendering options
 *
 * @private
 */
export interface SparkValues {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
    percent?: number;
    degree?: number;
    location?: {
        x: number;
        y: number;
    };
    markerPosition?: number;
    xVal?: number;
    yVal?: number;
}
/**
 * Internal use of rectangle options
 *
 * @private
 */
export declare class RectOption extends PathOption {
    rect: Rect;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
    constructor(id: string, fill: string, border: SparklineBorderModel, opacity: number, rect: Rect, tl?: number, tr?: number, bl?: number, br?: number);
}
/**
 * Internal use of circle options
 *
 * @private
 */
export declare class CircleOption extends PathOption {
    cy: number;
    cx: number;
    r: number;
    ['stroke-dasharray']: string;
    constructor(id: string, fill: string, border: SparklineBorderModel, opacity: number, cx: number, cy: number, r: number, dashArray: string);
}
/**
 * Internal use of append shape element
 *
 * @private
 */
export declare function appendShape(shape: Element, element: Element): Element;
/**
 * Internal rendering of Circle
 *
 * @private
 */
export declare function drawCircle(sparkline: Sparkline, options: CircleOption, element?: Element): Element;
/**
 * To get rounded rect path direction
 */
export declare function calculateRoundedRectPath(r: Rect, topLeft: number, topRight: number, bottomLeft: number, bottomRight: number): string;
/**
 * Internal rendering of Rectangle
 *
 * @private
 */
export declare function drawRectangle(sparkline: Sparkline, options: RectOption, element?: Element): Element;
/**
 * Internal rendering of Path
 *
 * @private
 */
export declare function drawPath(sparkline: Sparkline, options: PathOption, element?: Element): Element;
/**
 * Function to measure the height and width of the text.
 *
 * @private
 */
export declare function measureText(text: string, font: SparklineFontModel): Size;
/**
 * Internal use of text options
 *
 * @private
 */
export declare class TextOption {
    id: string;
    anchor: string;
    text: string;
    transform: string;
    x: number;
    y: number;
    baseLine: string;
    constructor(id?: string, x?: number, y?: number, anchor?: string, text?: string, baseLine?: string, transform?: string);
}
/**
 * Internal rendering of text
 *
 * @private
 */
export declare function renderTextElement(options: TextOption, font: SparklineFontModel, color: string, parent: HTMLElement | Element): Element;
/**
 * To remove element by id
 */
export declare function removeElement(id: string): void;
/**
 * To find the element by id
 */
export declare function getIdElement(id: string): Element;
/**
 * To find point within the bounds.
 */
export declare function withInBounds(x: number, y: number, bounds: Rect): boolean;
