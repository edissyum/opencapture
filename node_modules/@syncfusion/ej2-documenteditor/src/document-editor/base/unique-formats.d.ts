import { WUniqueFormat } from './unique-format';
import { Dictionary } from './dictionary';
/**
 * @private
 */
export declare class WUniqueFormats {
    /**
     * @private
     */
    items: WUniqueFormat[];
    constructor();
    /**
     * @private
     */
    addUniqueFormat(format: Dictionary<number, object>, type: number): WUniqueFormat;
    /**
     * @private
     */
    updateUniqueFormat(uniqueFormat: WUniqueFormat, property: string, value: object): WUniqueFormat;
    /**
     * @private
     */
    remove(uniqueFormat: WUniqueFormat): void;
    /**
     * @private
     */
    clear(): void;
    /**
     * @private
     */
    destroy(): void;
}
