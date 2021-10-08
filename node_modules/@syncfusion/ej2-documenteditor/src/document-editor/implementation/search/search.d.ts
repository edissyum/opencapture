import { Dictionary } from '../../base/dictionary';
import { FindOption } from '../../base/types';
import { DocumentEditor } from '../../document-editor';
import { LineWidget } from '../viewer/page';
import { LayoutViewer, DocumentHelper } from '../index';
import { SearchWidgetInfo } from './text-search';
import { TextSearch } from '../search/text-search';
import { TextSearchResult } from '../search/text-search-result';
import { TextSearchResults } from '../search/text-search-results';
import { SearchResults } from './search-results';
/**
 * Search module
 */
export declare class Search {
    private owner;
    /**
     * @private
     */
    textSearch: TextSearch;
    /**
     * @private
     */
    textSearchResults: TextSearchResults;
    /**
     * @private
     */
    searchResultsInternal: SearchResults;
    /**
     * @private
     */
    searchHighlighters: Dictionary<LineWidget, SearchWidgetInfo[]>;
    private isHandledOddPageHeader;
    private isHandledEvenPageHeader;
    private isHandledOddPageFooter;
    private isHandledEvenPageFooter;
    /**
     * @private
     */
    isRepalceTracking: boolean;
    readonly viewer: LayoutViewer;
    /**
     * Gets the search results object.
     *
     * @aspType SearchResults
     * @returns {SearchResults} - Returns the search results object.
     */
    readonly searchResults: SearchResults;
    constructor(owner: DocumentEditor);
    readonly documentHelper: DocumentHelper;
    private getModuleName;
    /**
     * Finds the immediate occurrence of specified text from cursor position in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    find(text: string, findOptions?: FindOption): void;
    /**
     * Finds all occurrence of specified text in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    findAll(text: string, findOptions?: FindOption): void;
    /**
     * Replace the searched string with specified string
     *
     * @private
     * @param  {string} replaceText  - Specifies text to replace.
     * @param  {TextSearchResult} result - Specifies the result.
     * @param  {TextSearchResults} results - Specifies the results.
     * @returns {number} - Returns replaced text count.
     */
    replace(replaceText: string, result: TextSearchResult, results: TextSearchResults): number;
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    replaceInternal(textToReplace: string, findOptions?: FindOption): void;
    /**
     * Replace all the searched string with specified string
     *
     * @private
     * @param  {string} replaceText - Specifies the replace text.
     * @param  {TextSearchResults} results - Specfies the results.
     * @returns {number} - Returns the replace count.
     */
    replaceAll(replaceText: string, results: TextSearchResults): number;
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    replaceAllInternal(textToReplace: string, findOptions?: FindOption): void;
    /**
     * @private
     * @param {TextSearchResult} textSearchResult - Specifies the text search results.
     * @returns {void}
     */
    navigate(textSearchResult: TextSearchResult): void;
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specifies the text search results.
     * @returns {void}
     */
    highlight(textSearchResults: TextSearchResults): void;
    private highlightResult;
    private highlightSearchResult;
    private createHighlightBorder;
    private addSearchHighlightBorder;
    private highlightSearchResultParaWidget;
    /**
     * @private
     * @param {string} result - Specified the result.
     * @returns {void}
     */
    addSearchResultItems(result: string): void;
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specified text search result.
     * @returns {void}
     */
    addFindResultView(textSearchResults: TextSearchResults): void;
    /**
     * @private
     * @returns {void}
     */
    addFindResultViewForSearch(result: TextSearchResult): void;
    /**
     * Clears search highlight.
     *
     * @private
     * @returns {void}
     */
    clearSearchHighlight(): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
