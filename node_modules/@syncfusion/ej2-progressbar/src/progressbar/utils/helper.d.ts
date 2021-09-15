import { PathOption } from '@syncfusion/ej2-svg-base';
/**
 * helper for progress bar
 */
/** @private */
export declare class Rect {
    x: number;
    y: number;
    height: number;
    width: number;
    constructor(x: number, y: number, height: number, width: number);
}
/** @private */
export declare class Size {
    height: number;
    width: number;
    constructor(height: number, width: number);
}
/** @private */
export declare class Pos {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
/** @private */
export declare class RectOption extends PathOption {
    x: number;
    y: number;
    height: number;
    width: number;
    rx: number;
    ry: number;
    transform: string;
    constructor(id: string, fill: string, width: number, color: string, opacity: number, rect: Rect, rx?: number, ry?: number, transform?: string, dashArray?: string);
}
/** @private */
export declare class ColorValue {
    r: number;
    g: number;
    b: number;
    constructor(r?: number, g?: number, b?: number);
}
/** @private */
export declare function convertToHexCode(value: ColorValue): string;
/** @private */
export declare function componentToHex(value: number): string;
/** @private */
export declare function convertHexToColor(hex: string): ColorValue;
/** @private */
export declare function colorNameToHex(color: string): string;
/** @private */
export declare class TextOption {
    id: string;
    ['font-size']: string;
    ['font-style']: string;
    ['font-family']: string;
    ['font-weight']: string;
    ['text-anchor']: string;
    fill: string;
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(id: string, fontSize: string, fontStyle: string, fontFamily: string, fontWeight: string, textAnchor: string, fill: string, x: number, y: number, width?: number, height?: number);
}
/** calculate the start and end point of circle */
export declare function degreeToLocation(centerX: number, centerY: number, radius: number, angleInDegrees: number): Pos;
/** calculate the path of the circle */
export declare function getPathArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, enableRtl: boolean, pieView?: boolean): string;
/** @private */
export declare function stringToNumber(value: string, containerSize: number): number;
/** @private */
export declare function setAttributes(options: any, element: Element): Element;
/**
 * Animation Effect Calculation
 *
 * @private
 */
export declare function effect(currentTime: number, startValue: number, endValue: number, duration: number, enableRtl: boolean): number;
/**
 * @private
 */
export declare const annotationRender: string;
/**
 * @private
 */
export declare function getElement(id: string): Element;
/**
 * @private
 */
export declare function removeElement(id: string | Element): void;
/**
 * @private
 */
export declare class ProgressLocation {
    x: number;
    y: number;
    constructor(x: number, y: number);
}
