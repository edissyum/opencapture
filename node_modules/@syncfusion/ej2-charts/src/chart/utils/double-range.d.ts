/**
 * Numeric Range.
 *
 * @private
 */
export declare class DoubleRange {
    private mStart;
    private mEnd;
    /** @private */
    readonly start: number;
    /** @private */
    readonly end: number;
    /** @private */
    readonly delta: number;
    /** @private */
    readonly median: number;
    constructor(start: number, end: number);
}
