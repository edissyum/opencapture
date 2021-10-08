/**
 * @private
 */
export interface DictionaryInfo<K, V> {
}
/**
 * @private
 */
export declare class Dictionary<K, V> implements DictionaryInfo<K, V> {
    private keysInternal;
    private valuesInternal;
    /**
     * @private
     */
    readonly length: number;
    /**
     * @private
     */
    readonly keys: K[];
    /**
     * @private
     */
    add(key: K, value: V): number;
    /**
     * @private
     */
    get(key: K): V;
    /**
     * @private
     */
    set(key: K, value: V): void;
    /**
     * @private
     */
    remove(key: K): boolean;
    /**
     * @private
     */
    containsKey(key: K): boolean;
    /**
     * @private
     */
    clear(): void;
    /**
     * @private
     */
    destroy(): void;
}
