/**
 * @private
 * @hidden
 */
export interface IDictionaryPair<K, V> {
    key: K;
    value: V;
}
/**
 * @private
 * @hidden
 */
export declare class Dictionary<K, V> {
    /**
     * @private
     * @hidden
     */
    protected table: {
        [key: string]: IDictionaryPair<K, V>;
    };
    /**
     * @private
     * @hidden
     */
    protected nElements: number;
    /**
     * @private
     * @hidden
     */
    protected toStr: (key: K) => string;
    /**
     * @private
     * @hidden
     */
    constructor(toStringFunction?: (key: K) => string);
    /**
     * @private
     * @hidden
     */
    getValue(key: K): V;
    /**
     * @private
     * @hidden
     */
    setValue(key: K, value: V): V;
    /**
     * @private
     * @hidden
     */
    remove(key: K): V;
    /**
     * @private
     * @hidden
     */
    keys(): K[];
    /**
     * @private
     * @hidden
     */
    values(): V[];
    /**
     * @private
     * @hidden
     */
    containsKey(key: K): boolean;
    /**
     * @private
     * @hidden
     */
    clear(): void;
    /**
     * @private
     * @hidden
     */
    size(): number;
}
