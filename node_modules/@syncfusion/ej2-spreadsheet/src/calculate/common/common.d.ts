import { Calculate } from '../base';
/**
 * Represent the common codes for calculate
 */
export declare class CalculateCommon {
    private parent;
    constructor(parent: Calculate);
    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} - Get the module name.
     */
    protected getModuleName(): string;
}
/**
 * To check whether the object is undefined.
 *
 * @param {Object} value - To check the object is undefined
 * @returns {boolean} - Returns boolean value.
 * @private
 */
export declare function isUndefined(value: Object): boolean;
/**
 * @hidden
 * @param {string} value - specify the value
 * @returns {string} - get Skeleton Value.
 */
export declare function getSkeletonVal(value: string): string;
