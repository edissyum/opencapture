/**
 * Dictionary class
 * @private
 * @hidden
 */
export declare class TemporaryDictionary<K, V> {
    /**
     * @hidden
     * @private
     */
    private mKeys;
    /**
     * @hidden
     * @private
     */
    private mValues;
    /**
     * @hidden
     * @private
     */
    size(): number;
    /**
     * @hidden
     * @private
     */
    add(key: K, value: V): number;
    /**
     * @hidden
     * @private
     */
    keys(): K[];
    /**
     * @hidden
     * @private
     */
    values(): V[];
    /**
     * @hidden
     * @private
     */
    getValue(key: K): V;
    /**
     * @hidden
     * @private
     */
    setValue(key: K, value: V): void;
    /**
     * @hidden
     * @private
     */
    remove(key: K): boolean;
    /**
     * @hidden
     * @private
     */
    containsKey(key: K): boolean;
    /**
     * @hidden
     * @private
     */
    clear(): void;
}
