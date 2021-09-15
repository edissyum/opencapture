import { IPdfCache } from './../../interfaces/i-pdf-cache';
/**
 * `Collection of the cached objects`.
 * @private
 */
export declare class PdfCacheCollection {
    /**
     * Stores the similar `objects`.
     * @private
     */
    private referenceObjects;
    /**
     * Stores the references of font with GUID `objects`.
     * @private
     */
    private pdfFontCollection;
    /**
     * Initializes a new instance of the `PdfCacheCollection` class.
     * @private
     */
    constructor();
    /**
     * `Searches` for the similar cached object. If is not found - adds the object to the cache.
     * @private
     */
    search(obj: IPdfCache): IPdfCache;
    /**
     * `Creates` a new group.
     * @private
     */
    createNewGroup(): Object[];
    /**
     * `Find and Return` a group.
     * @private
     */
    getGroup(result: IPdfCache): Object[];
    /**
     * Remove a group from the storage.
     */
    removeGroup(group: Object[]): void;
    destroy(): void;
}
