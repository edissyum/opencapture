/**
 * PdfTransformationMatrix.ts class for EJ2-PDF
 */
import { PointF } from './../drawing/pdf-drawing';
/**
 * Class for representing Root `transformation matrix`.
 */
export declare class PdfTransformationMatrix {
    /**
     * Value for `angle converting`.
     * @default Math.PI / 180.0
     * @private
     */
    private static readonly degRadFactor;
    /**
     * Value for `angle converting`.
     * @default 180.0 / Math.PI
     * @private
     */
    private readonly radDegFactor;
    /**
     * `Transformation matrix`.
     * @private
     */
    private transformationMatrix;
    /**
     * Gets or sets the `internal matrix object`.
     * @private
     */
    matrix: Matrix;
    /**
     * Initializes object of `PdfTransformationMatrix` class.
     * @private
     */
    constructor();
    /**
     * Initializes object of `PdfTransformationMatrix` class.
     * @private
     */
    constructor(value: boolean);
    /**
     * `Translates` coordinates by specified coordinates.
     * @private
     */
    translate(offsetX: number, offsetY: number): void;
    /**
     * `Scales` coordinates by specified coordinates.
     * @private
     */
    scale(scaleX: number, scaleY: number): void;
    /**
     * `Rotates` coordinate system in counterclockwise direction.
     * @private
     */
    rotate(angle: number): void;
    /**
     * Gets `PDF representation`.
     * @private
     */
    toString(): string;
    /**
     * `Multiplies` matrices (changes coordinate system.)
     * @private
     */
    multiply(matrix: PdfTransformationMatrix): void;
    /**
     * Converts `degrees to radians`.
     * @private
     */
    static degreesToRadians(degreesX: number): number;
    /**
     * Converts `radians to degrees`.
     * @private
     */
    radiansToDegrees(radians: number): number;
    /**
     * `Clones` this instance of PdfTransformationMatrix.
     * @private
     */
    clone(): PdfTransformationMatrix;
}
export declare class Matrix {
    /**
     * `elements` in the matrix.
     * @private
     */
    private metrixElements;
    /**
     * Initializes a new instance of the `Matrix` class.
     * @private
     */
    constructor();
    /**
     * Initializes a new instance of the `Matrix` class with number array.
     * @private
     */
    constructor(elements: number[]);
    /**
     * Initializes a new instance of the `Matrix` class.
     * @private
     */
    constructor(m11: number, m12: number, m21: number, m22: number, dx: number, dy: number);
    /**
     * Gets the `elements`.
     * @private
     */
    readonly elements: number[];
    /**
     * Gets the off set `X`.
     * @private
     */
    readonly offsetX: number;
    /**
     * Gets the off set `Y`.
     * @private
     */
    readonly offsetY: number;
    /**
     * `Translates` coordinates by specified coordinates.
     * @private
     */
    translate(offsetX: number, offsetY: number): void;
    /**
     * `Translates` the specified offset X.
     * @private
     */
    transform(point: PointF): PointF;
    /**
     * `Multiplies matrices` (changes coordinate system.)
     * @private
     */
    multiply(matrix: Matrix): void;
    /**
     * `Dispose` this instance of PdfTransformationMatrix class.
     * @private
     */
    dispose(): void;
    /**
     * `Clones` this instance of PdfTransformationMatrix class.
     * @private
     */
    clone(): Object;
}
