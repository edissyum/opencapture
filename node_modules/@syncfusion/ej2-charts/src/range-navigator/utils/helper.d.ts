import { VisibleRangeModel } from '../../chart/axis/axis';
/**
 * Methods for calculating coefficient.
 */
/** @private */
export declare function rangeValueToCoefficient(value: number, range: VisibleRangeModel, inversed: boolean): number;
/** @private */
export declare function getXLocation(x: number, range: VisibleRangeModel, size: number, inversed: boolean): number;
/** @private */
export declare function getRangeValueXByPoint(value: number, size: number, range: VisibleRangeModel, inversed: boolean): number;
/** @private */
export declare function getExactData(points: DataPoint[], start: number, end: number): DataPoint[];
/** @private */
export declare function getNearestValue(values: number[], point: number): number;
/**
 * Data point
 *
 * @public
 */
export declare class DataPoint {
    /** point x */
    x: Object;
    /** point y */
    y: Object;
    /** point x value */
    xValue?: number;
    /** point y value */
    yValue?: number;
    /** point visibility */
    visible?: boolean;
    constructor(x: Object, y: Object, xValue?: number, yValue?: number, visible?: boolean);
}
