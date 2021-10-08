/**
 * Utils.ts class for EJ2-PDF
 * @private
 * @hidden
 */
export interface ICompareFunction<T> {
    (a: T, b: T): number;
}
/**
 * @private
 * @hidden
 */
export interface IEqualsFunction<T> {
    (a: T, b: T): boolean;
}
/**
 * @private
 * @hidden
 */
export interface ILoopFunction<T> {
    (a: T): boolean | void;
}
/**
 * @private
 * @hidden
 */
export declare function defaultToString(item: string | number | string[] | number[] | Object | Object[] | boolean): string;
