import { Search } from './search';
import { TextSearchResultInfo } from '../editor/editor-helper';
/**
 * Search Result info
 */
export declare class SearchResults {
    private searchModule;
    /**
     * Gets the length of search results.
     *
     * @aspType int
     * @returns {number} - Returns search results length.
     */
    readonly length: number;
    /**
     * Gets the index of current search result.
     *
     * @aspType int
     * @returns {number} - Returns current search result index.
     */
    /**
    * Set the index of current search result.
    *
    * @param {number} value - Specifies the search result index.
    * @aspType int
    */
    index: number;
    constructor(search: Search);
    /**
     * Get start and end offset of searched text results.
     *
     * @returns {TextSearchResults[]} - Returns the text search results.
     */
    getTextSearchResultsOffset(): TextSearchResultInfo[];
    private getOffset;
    private getModuleName;
    /**
     * Replace text in current search result.
     *
     * @private
     * @param {string} textToReplace - text to replace
     * @returns {void}
     */
    replace(textToReplace: string): void;
    /**
     * Replace all the instance of search result.
     *
     * @param {string} textToReplace text to replace
     * @returns {void}
     */
    replaceAll(textToReplace: string): void;
    /**
     * @private
     * @returns {void}
     */
    navigate(): void;
    /**
     * Clears all the instance of search result.
     *
     * @returns {void}
     */
    clear(): void;
}
