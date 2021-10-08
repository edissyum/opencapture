import { PdfAnnotationBaseModel, PdfFormFieldBaseModel } from './pdf-annotation-model';
import { DrawingElement, PointModel, BaseAttributes } from '@syncfusion/ej2-drawings';
import { Transforms } from './drawing';
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the shape annotation object.
 * @hidden
 * @returns {void}
 */
export declare function isLineShapes(obj: PdfAnnotationBaseModel): boolean;
/**
 * @param {PdfAnnotationBaseModel | PdfFormFieldBaseModel} obj - Specified the annotation or form fields object.
 * @param {DrawingElement} element - Specified the annotation drawing element.
 * @returns {void}
 * @hidden
 */
export declare function setElementStype(obj: PdfAnnotationBaseModel | PdfFormFieldBaseModel, element: DrawingElement): void;
/**
 * @param {PointModel[]} points - Specified the annotation points value.
 * @hidden
 * @returns {number} - Returns the points length.
 */
export declare function findPointsLength(points: PointModel[]): number;
/**
 * @param {PointModel[]} points - Specified the annotation points value.
 * @hidden
 * @returns {number} - Returns the points length.
 */
export declare function findPerimeterLength(points: PointModel[]): number;
/**
 * @private
 * @param {DrawingElement} element - Specified the drawing element.
 * @param {Transforms} transform - Specified the transform value.
 * @returns {BaseAttributes} - Returns the base attributes value.
 */
export declare function getBaseShapeAttributes(element: DrawingElement, transform?: Transforms): BaseAttributes;
/**
 * Get function
 *
 * @private
 * @param {Function | string} value - Type of the function.
 * @returns {Function} - Returns the function.
 */
export declare function getFunction(value: Function | string): Function;
/**
 * @private
 * @param {any} obj - Specified the annotation object.
 * @param {Function | string} additionalProp - Specified the annotation additional properties.
 * @param {string} key - Specified the annotation key value.
 * @returns {Object} - Returns the cloned object.
 */
export declare function cloneObject(obj: any, additionalProp?: Function | string, key?: string): Object;
/**
 * @private
 * @param {Object[]} sourceArray - Specified the annotation source collections.
 * @param {Function | string} additionalProp - Specified the annotation additional properties.
 * @param {string} key - Specified the annotation key value.
 * @returns {Object[]} - Returns the cloned object array.
 */
export declare function cloneArray(sourceArray: Object[], additionalProp?: Function | string, key?: string): Object[];
/**
 * @private
 * @param {string} propName - Specified the annotation property name.
 * @returns {string[]} - Returns the internal properties.
 */
export declare function getInternalProperties(propName: string): string[];
/**
 * @param {PdfAnnotationBaseModel} obj - Specified the annotation object.
 * @param {string} position - Specified the annotation position.
 * @hidden
 * @returns {Leader} - Returns the leader value.
 */
export declare function isLeader(obj: PdfAnnotationBaseModel, position: string): Leader;
/**
 * @hidden
 */
export interface Leader {
    leader: string;
    point: PointModel;
}
