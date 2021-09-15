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
/** @private */
export declare function identityMatrix(): Matrix;
/** @private */
export declare function transformPointByMatrix(matrix: Matrix, point: PointModel): PointModel;
/** @private */
export declare function transformPointsByMatrix(matrix: Matrix, points: PointModel[]): PointModel[];
/** @private */
export declare function rotateMatrix(matrix: Matrix, angle: number, centerX: number, centerY: number): void;
/** @private */
export declare function scaleMatrix(matrix: Matrix, scaleX: number, scaleY: number, centerX?: number, centerY?: number): void;
/** @private */
export declare function translateMatrix(matrix: Matrix, offsetX: number, offsetY: number): void;
/** @private */
export declare function multiplyMatrix(matrix1: Matrix, matrix2: Matrix): void;
