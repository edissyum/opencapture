import { PathSegment } from './../rendering/canvas-interface';
/**
 * These utility methods help to process the data and to convert it to desired dimensions
 */
/** @private */
export declare function processPathData(data: string): Object[];
/** @private */
export declare function parsePathData(data: string): Object[];
/**
 * Used to find the path for rounded rect
 */
export declare function getRectanglePath(cornerRadius: number, height: number, width: number): string;
/** @private */
export declare function pathSegmentCollection(collection: Object[]): Object[];
/** @private */
export declare function transformPath(arr: Object[], sX: number, sY: number, s: boolean, bX: number, bY: number, iX: number, iY: number): string;
/** @private */
export declare function updatedSegment(segment: PathSegment, char: string, obj: PathSegment, isScale: boolean, sX: number, sY: number): Object;
/** @private */
export declare function scalePathData(val: number, scaleFactor: number, oldOffset: number, newOffset: number): number;
/** @private */
export declare function splitArrayCollection(arrayCollection: Object[]): Object[];
/** @private */
export declare function getPathString(arrayCollection: Object[]): string;
/** @private */
export declare function getString(obj: PathSegment): string;
