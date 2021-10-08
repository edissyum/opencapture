import { DiagramElement } from '../core/elements/diagram-element';
import { Rect } from '../primitives/rect';
import { Size } from '../primitives/size';
import { PointModel } from '../primitives/point-model';
import { TextAlign, TextWrap, WhiteSpace, TextDecoration } from '../enum/enum';
import { TextAttributes } from '../rendering/canvas-interface';
import { Diagram } from '../diagram';
/**
 * Implements the basic functionalities
 */
/**
 * Used to generate the random id \
 *
 * @returns { boolean }    Used to generate the random id .\
 *
 * @private
 */
export declare function randomId(): string;
/**
 * Used to get the index value \
 *
 * @returns { boolean }    Used to get the index value .\
 * @param {Diagram} comp - provide the Diagram value.
 * @param {string} id - provide the id value.
 *
 * @private
 */
export declare function getIndex(comp: Diagram, id: string): number;
/**
 * templateCompiler method\
 *
 * @returns { Function }    templateCompiler method .\
 * @param {string} template - provide the template value.
 *
 * @private
 */
export declare function templateCompiler(template: string): Function;
/**
 * cornersPointsBeforeRotation method\
 *
 * @returns { Rect }    templateCompiler method .\
 * @param {DiagramElement} ele - provide the template value.
 *
 * @private
 */
export declare function cornersPointsBeforeRotation(ele: DiagramElement): Rect;
/**
 * getBounds method\
 *
 * @returns { Rect }    getBounds method .\
 * @param {DiagramElement} element - provide the template value.
 *
 * @private
 */
export declare function getBounds(element: DiagramElement): Rect;
/**
 * cloneObject method\
 *
 * @returns { Rect }    cloneObject method .\
 * @param {DiagramElement} obj - provide the obj value.
 * @param {DiagramElement} additionalProp - provide the additionalProp value.
 * @param {DiagramElement} key - provide the key value.
 * @param {DiagramElement} cloneBlazorProp - provide the cloneBlazorProp value.
 *
 * @private
 */
export declare function cloneObject(obj: Object, additionalProp?: Function | string, key?: string, cloneBlazorProp?: boolean): Object;
/**
 * getInternalProperties method\
 *
 * @returns { string[] }    getInternalProperties method .\
 * @param {string} propName - provide the propName value.
 *
 * @private
 */
export declare function getInternalProperties(propName: string): string[];
/**
 * cloneArray method\
 *
 * @returns {  Object[] }    getInternalProperties method .\
 * @param {string} sourceArray - provide the sourceArray value.
 * @param {string} additionalProp - provide the additionalProp value.
 * @param {string} key - provide the key value.
 * @param {string} cloneBlazorProp - provide the cloneBlazorProp value.
 *
 * @private
 */
export declare function cloneArray(sourceArray: Object[], additionalProp?: Function | string, key?: string, cloneBlazorProp?: boolean): Object[];
/**
 * extendObject method\
 *
 * @returns {  Object}    getInternalProperties method .\
 * @param {string} options - provide the options value.
 * @param {string} childObject - provide the childObject value.
 *
 * @private
 */
export declare function extendObject(options: Object, childObject: Object): Object;
/**
 * extendObject method\
 *
 * @returns {  Object}    getInternalProperties method .\
 * @param {string} sourceArray - provide the sourceArray value.
 * @param {string} childArray - provide the childArray value.
 *
 * @private
 */
export declare function extendArray(sourceArray: Object[], childArray: Object[]): Object[];
/**
 * textAlignToString method\
 *
 * @returns {  Object}    textAlignToString method .\
 * @param {string} value - provide the sourceArray value.
 *
 * @private
 */
export declare function textAlignToString(value: TextAlign): string;
/**
 * wordBreakToString method\
 *
 * @returns {  string }    wordBreakToString method .\
 * @param {TextWrap | TextDecoration} value - provide the value value.
 *
 * @private
 */
export declare function wordBreakToString(value: TextWrap | TextDecoration): string;
/**
 * bBoxText method\
 *
 * @returns { number }    bBoxText method .\
 * @param {string} textContent - provide the textContent value.
 * @param {string} options - provide the options value.
 *
 * @private
 */
export declare function bBoxText(textContent: string, options: TextAttributes): number;
/**
 * middleElement method\
 *
 * @returns {  number}    middleElement method .\
 * @param {number} i - provide the textContent value.
 * @param {number} j - provide the options value.
 *
 * @private
 */
export declare function middleElement(i: number, j: number): number;
/**
 * overFlow method\
 *
 * @returns {  number}    overFlow method .\
 * @param {number} text - provide the text value.
 * @param {number} options - provide the options value.
 *
 * @private
 */
export declare function overFlow(text: string, options: TextAttributes): string;
/**
 * whiteSpaceToString method\
 *
 * @returns {  number}    whiteSpaceToString method .\
 * @param {number} value - provide the value value.
 * @param {number} wrap - provide the wrap value.
 *
 * @private
 */
export declare function whiteSpaceToString(value: WhiteSpace, wrap: TextWrap): string;
/**
 * rotateSize method\
 *
 * @returns {  number}    rotateSize method .\
 * @param {number} size - provide the size value.
 * @param {number} angle - provide the angle value.
 *
 * @private
 */
export declare function rotateSize(size: Size, angle: number): Size;
/**
 * rotatePoint method\
 *
 * @returns {  number}    rotateSize method .\
 * @param {number} angle - provide the angle value.
 * @param {number} pivotX - provide the pivotX value.
 * @param {number} pivotY - provide the pivotY value.
 * @param {PointModel} point - provide the point value.
 * @private
 */
export declare function rotatePoint(angle: number, pivotX: number, pivotY: number, point: PointModel): PointModel;
/**
 * getOffset method\
 *
 * @returns {  number}    getOffset method .\
 * @param {PointModel} topLeft - provide the angle value.
 * @param {DiagramElement} obj - provide the pivotX value.
 * @private
 */
export declare function getOffset(topLeft: PointModel, obj: DiagramElement): PointModel;
/**
 * getFunction method\
 *
 * @returns {  Function }    getFunction method .\
 * @param {PointModel} value - provide the angle value.
 * @private
 */
export declare function getFunction(value: Function | string): Function;
