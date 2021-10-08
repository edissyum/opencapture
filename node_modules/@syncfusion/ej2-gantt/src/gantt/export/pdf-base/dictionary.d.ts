/**
 * Dictionary class
 *
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
     * @returns {number} .
     * @hidden
     * @private
     */
    size(): number;
    /**
     * @template K
     * @template V
     * @param {K} key .
     * @param {V} value .
     * @returns {void} .
     * @hidden
     * @private
     */
    add(key: K, value: V): number;
    /**
     * @template K
     * @returns {K[]} .
     * @hidden
     * @private
     */
    keys(): K[];
    /**
     * @template V
     * @returns {V[]} .
     * @hidden
     * @private
     */
    values(): V[];
    /**
     * @template K
     * @template V
     * @param {K} key .
     * @returns {V} .
     * @hidden
     * @private
     */
    getValue(key: K): V;
    /**
     * @template K
     * @template V
     * @param {K} key .
     * @param {V} value .
     * @returns {void} .
     * @hidden
     * @private
     */
    setValue(key: K, value: V): void;
    /**
     * @template K
     * @param {K} key .
     * @returns {boolean} .
     * @hidden
     * @private
     */
    remove(key: K): boolean;
    /**
     * @template K
     * @param {K} key .
     * @returns {boolean} .
     * @hidden
     * @private
     */
    containsKey(key: K): boolean;
    /**
     * @returns {void} .
     * @hidden
     * @private
     */
    clear(): void;
}
