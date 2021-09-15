/**
 * Search Result info
 */
var SearchResults = /** @class */ (function () {
    function SearchResults(search) {
        this.searchModule = search;
    }
    Object.defineProperty(SearchResults.prototype, "length", {
        /**
         * Gets the length of search results.
         *
         * @aspType int
         * @returns {number} - Returns search results length.
         */
        get: function () {
            return this.searchModule.textSearchResults.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SearchResults.prototype, "index", {
        /**
         * Gets the index of current search result.
         *
         * @aspType int
         * @returns {number} - Returns current search result index.
         */
        get: function () {
            return this.searchModule.textSearchResults.currentIndex;
        },
        /**
         * Set the index of current search result.
         *
         * @param {number} value - Specifies the search result index.
         * @aspType int
         */
        set: function (value) {
            if (this.length === 0 || value < 0 || value > this.searchModule.textSearchResults.length - 1) {
                return;
            }
            this.searchModule.textSearchResults.currentIndex = value;
            this.navigate();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get start and end offset of searched text results.
     *
     * @returns {TextSearchResults[]} - Returns the text search results.
     */
    SearchResults.prototype.getTextSearchResultsOffset = function () {
        var index = [];
        var searchIndex;
        for (var i = 0; i < this.searchModule.textSearchResults.innerList.length; i++) {
            searchIndex = this.getOffset(this.searchModule.textSearchResults.innerList[i]);
            index.push(searchIndex);
        }
        return index;
    };
    SearchResults.prototype.getOffset = function (innerList) {
        var start = innerList.start;
        var end = innerList.end;
        var blockInfo = this.searchModule.documentHelper.owner.selection.getParagraphInfo(start);
        /* eslint-disable-next-line max-len */
        var startIndex = this.searchModule.documentHelper.owner.selection.getHierarchicalIndex(blockInfo.paragraph, blockInfo.offset.toString());
        blockInfo = this.searchModule.documentHelper.owner.selection.getParagraphInfo(end);
        /* eslint-disable-next-line max-len */
        var endIndex = this.searchModule.documentHelper.owner.selection.getHierarchicalIndex(blockInfo.paragraph, blockInfo.offset.toString());
        return { 'startOffset': startIndex, 'endOffset': endIndex };
    };
    SearchResults.prototype.getModuleName = function () {
        return 'SearchResults';
    };
    /**
     * Replace text in current search result.
     *
     * @private
     * @param {string} textToReplace - text to replace
     * @returns {void}
     */
    SearchResults.prototype.replace = function (textToReplace) {
        if (this.index === -1) {
            return;
        }
        this.searchModule.replaceInternal(textToReplace);
    };
    /**
     * Replace all the instance of search result.
     *
     * @param {string} textToReplace text to replace
     * @returns {void}
     */
    SearchResults.prototype.replaceAll = function (textToReplace) {
        if (this.index === -1) {
            return;
        }
        this.searchModule.replaceAllInternal(textToReplace);
    };
    /**
     * @private
     * @returns {void}
     */
    SearchResults.prototype.navigate = function () {
        this.searchModule.navigate(this.searchModule.textSearchResults.currentSearchResult);
        this.searchModule.highlight(this.searchModule.textSearchResults);
    };
    /**
     * Clears all the instance of search result.
     *
     * @returns {void}
     */
    SearchResults.prototype.clear = function () {
        this.searchModule.textSearchResults.clearResults();
        this.searchModule.clearSearchHighlight();
        this.searchModule.viewer.renderVisiblePages();
    };
    return SearchResults;
}());
export { SearchResults };
