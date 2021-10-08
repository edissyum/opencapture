import { PathSegment } from './../rendering/canvas-interface';
import { PointModel } from '../primitives/point-model';
/**
 * These utility methods help to process the data and to convert it to desired dimensions
 */
/**
 * processPathData method \
 *
 * @returns {Object[]} processPathData method .\
 * @param { string } data - provide the data  value.
 * @private
 */
export declare function processPathData(data: string): Object[];
/**
 * parsePathData method \
 *
 * @returns {Object[]} parsePathData method .\
 * @param { string } data - provide the data  value.
 * @private
 */
export declare function parsePathData(data: string): Object[];
/**
 * getRectanglePath method \
 *
 * @returns {string} getRectanglePath method .\
 * @param { number } cornerRadius - provide the data  value.
 * @param { number } height - provide the height  value.
 * @param { number } width - provide the width  value.
 * @private
 */
export declare function getRectanglePath(cornerRadius: number, height: number, width: number): string;
/**
 * getPolygonPath method \
 *
 * @returns {string} getPolygonPath method .\
 * @param { PointModel[] } collection - provide the data  value.
 * @private
 */
export declare function getPolygonPath(collection: PointModel[]): string;
/**
 * pathSegmentCollection method \
 *
 * @returns {string} pathSegmentCollection method .\
 * @param { Object[]} collection - provide the collection  value.
 * @private
 */
export declare function pathSegmentCollection(collection: Object[]): Object[];
/**
 * transformPath method \
 *
 * @returns {string} transformPath method .\
 * @param { Object[]} arr - provide the collection  value.
 * @param { number} sX - provide the collection  value.
 * @param { number} sY - provide the collection  value.
 * @param { boolean} s - provide the collection  value.
 * @param {number} bX - provide the collection  value.
 * @param { number} bY - provide the collection  value.
 * @param { number} iX - provide the collection  value.
 * @param { number} iY - provide the collection  value.
 * @private
 */
export declare function transformPath(arr: Object[], sX: number, sY: number, s: boolean, bX: number, bY: number, iX: number, iY: number): string;
/**
 * updatedSegment method \
 *
 * @returns {string} updatedSegment method .\
 * @param { PathSegment} segment - provide the collection  value.
 * @param { PathSegment} char - provide the collection  value.
 * @param { number} obj - provide the collection  value.
 * @param { boolean} isScale - provide the collection  value.
 * @param {number} sX - provide the collection  value.
 * @param { number} sY - provide the collection  value.
 * @private
 */
export declare function updatedSegment(segment: PathSegment, char: string, obj: PathSegment, isScale: boolean, sX: number, sY: number): Object;
/**
 * scalePathData method \
 *
 * @returns {string} scalePathData method .\
 * @param { number} val - provide the val  value.
 * @param { number} scaleFactor - provide the scaleFactor  value.
 * @param { number} oldOffset - provide the oldOffset  value.
 * @param { number} newOffset - provide the newOffset  value.
 * @private
 */
export declare function scalePathData(val: number, scaleFactor: number, oldOffset: number, newOffset: number): number;
/**
 * splitArrayCollection method \
 *
 * @returns {Object[]} splitArrayCollection method .\
 * @param { Object[]} arrayCollection - provide the val  value.
 * @private
 */
export declare function splitArrayCollection(arrayCollection: Object[]): Object[];
/**
 * getPathString method \
 *
 * @returns {string} getPathString method .\
 * @param { Object[]} arrayCollection - provide the val  value.
 * @private
 */
export declare function getPathString(arrayCollection: Object[]): string;
/**
 * getString method \
 *
 * @returns {string} getString method .\
 * @param { PathSegment} arrayCollection - provide the val  value.
 * @private
 */
export declare function getString(obj: PathSegment): string;
