import { PointModel } from './point-model';
/**
 * Matrix module is used to transform points based on offsets, angle
 */
/** @private */
export declare enum MatrixTypes {
    Identity = 0,
    Translation = 1,
    Scaling = 2,
    Unknown = 4
}
/** @private */
export declare class Matrix {
    /**   @private  */
    m11: number;
    /**   @private  */
    m12: number;
    /**   @private  */
    m21: number;
    /**   @private  */
    m22: number;
    /**   @private  */
    offsetX: number;
    /**   @private  */
    offsetY: number;
    /**   @private  */
    type: MatrixTypes;
    constructor(m11: number, m12: number, m21: number, m22: number, offsetX: number, offsetY: number, type?: MatrixTypes);
}
/**
 * Will identify the  matrix .\
 *
 * @returns {Matrix}  Will identify the  matrix .
 * @private
 */
export declare function identityMatrix(): Matrix;
/**
 * Will transform the points by matrix .\
 *
 * @returns {PointModel[]}  Will transform the points by matrix .
 *
 * @param {Matrix} matrix - provide the matrix value  .
 * @param {number} point -  provide the points value.
 * @private
 */
export declare function transformPointByMatrix(matrix: Matrix, point: PointModel): PointModel;
/**
 * Will transform the points by matrix .\
 *
 * @returns {PointModel[]}  Will transform the points by matrix .
 *
 * @param {Matrix} matrix - provide the matrix value  .
 * @param {number} points -  provide the points value.
 * @private
 */
export declare function transformPointsByMatrix(matrix: Matrix, points: PointModel[]): PointModel[];
/**
 * Will rotate the matrix .\
 *
 * @returns {void}  Will rotate the matrix .
 *
 * @param {Matrix} matrix - provide the matrix value  .
 * @param {number} angle - provide the angle value.
 * @param {number} centerX - provide the centerX value .
 * @param {number} centerY - provide the centerY value .
 * @private
 */
export declare function rotateMatrix(matrix: Matrix, angle: number, centerX: number, centerY: number): void;
/**
 * Will scale the matrix .\
 *
 * @returns {void} Will scale the matrix .
 *
 * @param {Matrix} matrix - provide the matrix value  .
 * @param {number} scaleX - provide the scaleXvalue.
 * @param {number} scaleY - provide the scaleY value .
 * @param {number} centerX - provide the centerX value .
 * @param {number} centerY - provide the centerY value .
 * @private
 */
export declare function scaleMatrix(matrix: Matrix, scaleX: number, scaleY: number, centerX?: number, centerY?: number): void;
/**
 * Will translate the matrix .\
 *
 * @returns {void} Will translate the matrix .
 *
 * @param {Matrix} matrix - provide the matrix value  .
 * @param {number} offsetX - provide the offset x value.
 * @param {number} offsetY - provide the offset y value .
 * @private
 */
export declare function translateMatrix(matrix: Matrix, offsetX: number, offsetY: number): void;
/**
 * Will multiply the matrix .\
 *
 * @returns {void} Will multiply the matrix .
 *
 * @param {Matrix} matrix1 - Provide the matrix 1 value .
 * @param {Matrix} matrix2 - Provide the matrix 2 value .
 * @private
 */
export declare function multiplyMatrix(matrix1: Matrix, matrix2: Matrix): void;
