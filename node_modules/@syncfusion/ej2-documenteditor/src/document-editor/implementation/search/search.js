import { Dictionary } from '../../base/dictionary';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { TextPosition } from '../selection/selection-helper';
import { TextElementBox, FieldElementBox } from '../viewer/page';
import { SearchWidgetInfo } from './text-search';
import { TextSearch } from '../search/text-search';
import { TextSearchResults } from '../search/text-search-results';
import { SearchResults } from './search-results';
import { searchResultsChangeEvent } from '../../base/index';
/**
 * Search module
 */
var Search = /** @class */ (function () {
    function Search(owner) {
        /**
         * @private
         */
        this.searchHighlighters = undefined;
        this.isHandledOddPageHeader = undefined;
        this.isHandledEvenPageHeader = undefined;
        this.isHandledOddPageFooter = undefined;
        this.isHandledEvenPageFooter = undefined;
        this.owner = owner;
        this.searchHighlighters = new Dictionary();
        this.textSearch = new TextSearch(this.owner);
        this.textSearchResults = new TextSearchResults(this.owner);
        this.searchResultsInternal = new SearchResults(this);
    }
    Object.defineProperty(Search.prototype, "viewer", {
        get: function () {
            return this.owner.viewer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Search.prototype, "searchResults", {
        /**
         * Gets the search results object.
         *
         * @aspType SearchResults
         * @returns {SearchResults} - Returns the search results object.
         */
        get: function () {
            return this.searchResultsInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Search.prototype, "documentHelper", {
        get: function () {
            return this.owner.documentHelper;
        },
        enumerable: true,
        configurable: true
    });
    Search.prototype.getModuleName = function () {
        return 'Search';
    };
    //#region Find & Find All
    /**
     * Finds the immediate occurrence of specified text from cursor position in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    Search.prototype.find = function (text, findOptions) {
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        var result = this.textSearch.find(text, findOptions);
        if (!isNullOrUndefined(result)) {
            this.navigate(result);
        }
    };
    /**
     * Finds all occurrence of specified text in the document.
     *
     * @param {string} text - Specifies text to find.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is 'None'.
     * @returns {void}
     */
    Search.prototype.findAll = function (text, findOptions) {
        if (isNullOrUndefined(text || text === '')) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        var results = this.textSearch.findAll(text, findOptions);
        if (!isNullOrUndefined(results) && results.length > 0) {
            this.navigate(results.innerList[results.currentIndex]);
            this.highlight(results);
        }
    };
    //#endregion
    //#region Replace and Replace All
    /**
     * Replace the searched string with specified string
     *
     * @private
     * @param  {string} replaceText  - Specifies text to replace.
     * @param  {TextSearchResult} result - Specifies the result.
     * @param  {TextSearchResults} results - Specifies the results.
     * @returns {number} - Returns replaced text count.
     */
    Search.prototype.replace = function (replaceText, result, results) {
        if (isNullOrUndefined(this.viewer.owner) || this.viewer.owner.isReadOnlyMode || isNullOrUndefined(results)) {
            return 0;
        }
        if (!isNullOrUndefined(this.viewer)) {
            this.clearSearchHighlight();
        }
        this.navigate(result);
        var endPosition = this.documentHelper.selection.start;
        if (this.owner.enableTrackChanges && this.documentHelper.selection.start.currentWidget) {
            var inline = undefined;
            /* eslint-disable-next-line max-len */
            var inlineElement = this.documentHelper.selection.end.currentWidget.getInline(this.owner.selection.start.offset, 0);
            inline = inlineElement.element;
            if (inline.revisions.length > 0) {
                this.isRepalceTracking = true;
            }
        }
        var index = results.indexOf(result);
        if (index < 0) {
            return 0;
        }
        this.owner.editorModule.insertTextInternal(replaceText, true);
        var endTextPosition = result.end;
        var startPosition = new TextPosition(this.viewer.owner);
        startPosition.setPositionParagraph(endTextPosition.currentWidget, endPosition.offset - replaceText.length);
        this.documentHelper.selection.selectRange(endPosition, startPosition);
        var eventArgs = { source: this.viewer.owner };
        this.viewer.owner.trigger(searchResultsChangeEvent, eventArgs);
        return 1;
    };
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    Search.prototype.replaceInternal = function (textToReplace, findOptions) {
        if ((textToReplace === '' || isNullOrUndefined(textToReplace))) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        var textToFind = this.textSearchResults.currentSearchResult.text;
        var pattern = this.viewer.owner.searchModule.textSearch.stringToRegex(textToFind, findOptions);
        var index = this.owner.selection.end.getHierarchicalIndexInternal();
        var result = this.viewer.owner.searchModule.textSearch.findNext(pattern, findOptions, index);
        if (!isNullOrUndefined(result)) {
            this.navigate(result);
            this.textSearchResults.addResult();
            this.textSearchResults.innerList[0] = result;
            this.replace(textToReplace, result, this.textSearchResults);
            index = this.owner.selection.end.getHierarchicalIndexInternal();
            result = this.textSearch.findNext(textToFind, findOptions, index);
            if (result) {
                this.textSearchResults.addResult();
                this.textSearchResults.innerList[0] = result;
                this.navigate(result);
            }
        }
    };
    /**
     * Replace all the searched string with specified string
     *
     * @private
     * @param  {string} replaceText - Specifies the replace text.
     * @param  {TextSearchResults} results - Specfies the results.
     * @returns {number} - Returns the replace count.
     */
    Search.prototype.replaceAll = function (replaceText, results) {
        if (isNullOrUndefined(this.viewer.owner) || this.viewer.owner.isReadOnlyMode || isNullOrUndefined(results)) {
            return 0;
        }
        if (this.owner.editorHistory) {
            this.owner.editorHistory.initComplexHistory(this.owner.selection, 'ReplaceAll');
        }
        var count = results.length;
        this.viewer.owner.isLayoutEnabled = false;
        for (var i = count - 1; i >= 0; i--) {
            var result = results.innerList[i];
            this.navigate(results.innerList[i]);
            this.owner.editorModule.insertTextInternal(replaceText, true);
            if (result.isHeader || result.isFooter) {
                /* eslint-disable-next-line max-len */
                this.documentHelper.layout.updateHeaderFooterToParent(this.documentHelper.selection.start.paragraph.bodyWidget);
            }
            results.innerList[i].destroy();
        }
        if (this.owner.editorHistory && !isNullOrUndefined(this.owner.editorHistory.currentHistoryInfo)) {
            this.owner.editorHistory.updateComplexHistory();
        }
        else {
            this.owner.editorModule.updateComplexWithoutHistory(2);
        }
        this.searchResults.clear();
        return count;
    };
    /**
     * Find the textToFind string in current document and replace the specified string.
     *
     * @private
     * @param {string} textToReplace - Specifies the text to replace.
     * @param {FindOption} findOptions - Default value of ‘findOptions’ parameter is FindOption.None.
     * @returns {void}
     */
    Search.prototype.replaceAllInternal = function (textToReplace, findOptions) {
        if (isNullOrUndefined(textToReplace)) {
            return;
        }
        if (isNullOrUndefined(findOptions)) {
            findOptions = 'None';
        }
        if (this.textSearchResults.length > 0) {
            this.navigate(this.textSearchResults.innerList[this.textSearchResults.currentIndex]);
            this.highlight(this.textSearchResults);
            this.replaceAll(textToReplace, this.textSearchResults);
        }
    };
    //#endregion
    //#region Highlight Search Result
    /**
     * @private
     * @param {TextSearchResult} textSearchResult - Specifies the text search results.
     * @returns {void}
     */
    Search.prototype.navigate = function (textSearchResult) {
        if (textSearchResult) {
            var start = textSearchResult.start;
            var end = textSearchResult.end;
            if (!isNullOrUndefined(this.owner) && !isNullOrUndefined(this.owner.selection) && !isNullOrUndefined(start) &&
                !isNullOrUndefined(end) && !isNullOrUndefined(start.paragraph) && !isNullOrUndefined(end.paragraph)) {
                this.owner.selection.selectRange(start, end);
            }
        }
    };
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specifies the text search results.
     * @returns {void}
     */
    Search.prototype.highlight = function (textSearchResults) {
        this.searchHighlighters = new Dictionary();
        for (var i = 0; i < textSearchResults.innerList.length; i++) {
            var result = textSearchResults.innerList[i];
            this.highlightResult(result);
        }
        this.viewer.renderVisiblePages();
    };
    Search.prototype.highlightResult = function (result) {
        this.highlightSearchResult(result.start.paragraph, result.start, result.end);
    };
    /* eslint-disable  */
    Search.prototype.highlightSearchResult = function (paragraph, start, end) {
        var selectionStartIndex = 0;
        var selectionEndIndex = 0;
        var startElement = null;
        var endElement = null;
        var lineWidget = this.documentHelper.selection.getStartLineWidget(paragraph, start, startElement, selectionStartIndex);
        selectionStartIndex = lineWidget.index;
        startElement = lineWidget.element;
        var startLineWidget = startElement ? startElement.line : paragraph.childWidgets[0];
        var endLine = this.documentHelper.selection.getEndLineWidget(end, endElement, selectionEndIndex);
        selectionEndIndex = endLine.index;
        endElement = endLine.element;
        var endLineWidget = endElement ? endElement.line :
            end.paragraph.childWidgets[end.paragraph.childWidgets.length - 1];
        var top = this.documentHelper.selection.getTop(startLineWidget);
        var left = this.documentHelper.selection.getLeftInternal(startLineWidget, startElement, selectionStartIndex);
        if (!isNullOrUndefined(startLineWidget) && startLineWidget === endLineWidget) {
            //find result ends in current line.
            var right = this.documentHelper.selection.getLeftInternal(endLineWidget, endElement, selectionEndIndex);
            var isRtlText = false;
            if (endElement instanceof TextElementBox) {
                isRtlText = endElement.isRightToLeft;
            }
            var width = 0;
            width = Math.abs(right - left);
            if (!isRtlText && startElement instanceof TextElementBox) {
                isRtlText = startElement.isRightToLeft;
            }
            // Handled the highlighting approach as genric for normal and rtl text.
            if (isRtlText || paragraph.bidi) {
                var elementBox = this.documentHelper.selection.getElementsForward(startLineWidget, startElement, endElement, paragraph.bidi);
                if (elementBox && elementBox.length > 1) {
                    for (var i = 0; i < elementBox.length; i++) {
                        var element = elementBox[i];
                        var elementIsRTL = false;
                        var index = element instanceof TextElementBox ? element.length : 1;
                        if (element === startElement) {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionStartIndex);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                        }
                        else if (element === endElement) {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionEndIndex);
                        }
                        else {
                            left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                        }
                        if (element instanceof TextElementBox) {
                            elementIsRTL = element.isRightToLeft;
                        }
                        width = Math.abs(right - left);
                        this.createHighlightBorder(startLineWidget, width, elementIsRTL ? right : left, top);
                    }
                }
                else {
                    this.createHighlightBorder(startLineWidget, width, isRtlText ? right : left, top);
                }
            }
            else {
                // Start element and end element will be in reverese for Bidi paragraph highlighting. 
                // So, the right is considered based on Bidi property. 
                this.createHighlightBorder(startLineWidget, width, left, top);
            }
        }
        else {
            if (!isNullOrUndefined(startLineWidget)) {
                if (paragraph !== startLineWidget.paragraph) {
                    paragraph = startLineWidget.paragraph;
                }
                var width = this.documentHelper.selection.getWidth(startLineWidget, true) - (left - startLineWidget.paragraph.x);
                // Handled the  highlighting approach as genric for normal and rtl text.
                if (paragraph.bidi || (startElement instanceof TextElementBox && startElement.isRightToLeft)) {
                    var right = 0;
                    var elementCollection = this.documentHelper.selection.getElementsForward(startLineWidget, startElement, endElement, paragraph.bidi);
                    if (elementCollection) {
                        var elementIsRTL = false;
                        for (var i = 0; i < elementCollection.length; i++) {
                            var element = elementCollection[i];
                            var index = element instanceof TextElementBox ? element.length : 1;
                            right = this.documentHelper.selection.getLeftInternal(startLineWidget, element, index);
                            elementIsRTL = false;
                            if (element === startElement) {
                                left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, selectionStartIndex);
                            }
                            else {
                                left = this.documentHelper.selection.getLeftInternal(startLineWidget, element, 0);
                            }
                            if (element instanceof TextElementBox) {
                                elementIsRTL = element.isRightToLeft;
                            }
                            width = Math.abs(right - left);
                            this.createHighlightBorder(startLineWidget, width, elementIsRTL ? right : left, top);
                        }
                        // Highlight the Paragrph mark for last line.
                    }
                }
                else {
                    this.createHighlightBorder(startLineWidget, width, left, top);
                }
                var lineIndex = startLineWidget.paragraph.childWidgets.indexOf(startLineWidget);
                //Iterates to last item of paragraph or search result end.
                for (var i = 0; i < paragraph.childWidgets.length; i++) {
                    if (paragraph === startLineWidget.paragraph) {
                        lineIndex += 1;
                    }
                    this.highlightSearchResultParaWidget(paragraph, lineIndex, endLineWidget, endElement, selectionEndIndex);
                    if (paragraph === endLineWidget.paragraph) {
                        return;
                    }
                    else {
                        lineIndex = 0;
                    }
                }
            }
        }
    };
    Search.prototype.createHighlightBorder = function (lineWidget, width, left, top) {
        var findHighLight = this.addSearchHighlightBorder(lineWidget);
        var page = this.viewer.owner.selection.getPage(lineWidget.paragraph);
        var pageTop = page.boundingRectangle.y;
        var pageLeft = page.boundingRectangle.x;
        findHighLight.left = Math.ceil(left);
        top = Math.ceil(top);
        findHighLight.width = Math.floor(width);
        var height = Math.floor(lineWidget.height);
        var context = this.documentHelper.containerContext;
    };
    Search.prototype.addSearchHighlightBorder = function (lineWidget) {
        var highlighters = undefined;
        var collection = this.searchHighlighters;
        if (collection.containsKey(lineWidget)) {
            highlighters = collection.get(lineWidget);
        }
        else {
            highlighters = [];
            collection.add(lineWidget, highlighters);
        }
        var searchHighlight = new SearchWidgetInfo(0, 0);
        highlighters.push(searchHighlight);
        return searchHighlight;
    };
    Search.prototype.highlightSearchResultParaWidget = function (widget, startIndex, endLine, endElement, endIndex) {
        var top = 0;
        var width = 0;
        var isRtlText = false;
        for (var j = startIndex; j < widget.childWidgets.length; j++) {
            var lineWidget = widget.childWidgets[j];
            if (j === startIndex) {
                top = this.documentHelper.selection.getTop(lineWidget);
            }
            var left = this.documentHelper.selection.getLeft(lineWidget);
            if (endElement instanceof TextElementBox) {
                isRtlText = endElement.isRightToLeft;
            }
            if (lineWidget === endLine) {
                //Selection ends in current line.
                var right = 0;
                // Handled the highlighting using the element box highlighting approach as genric for normal and rtl text.
                if (isRtlText || widget.bidi) {
                    var elementBox = this.documentHelper.selection.getElementsBackward(lineWidget, endElement, endElement, widget.bidi);
                    for (var i = 0; i < elementBox.length; i++) {
                        var element = elementBox[i];
                        var elementIsRTL = false;
                        left = this.documentHelper.selection.getLeftInternal(lineWidget, element, 0);
                        if (element === endElement) {
                            right = this.documentHelper.selection.getLeftInternal(lineWidget, element, endIndex);
                        }
                        else {
                            var index = element instanceof TextElementBox ? element.length : 1;
                            right = this.documentHelper.selection.getLeftInternal(lineWidget, element, index);
                        }
                        if (element instanceof TextElementBox) {
                            elementIsRTL = element.isRightToLeft;
                        }
                        width = Math.abs(right - left);
                        this.createHighlightBorder(lineWidget, width, elementIsRTL ? right : left, top);
                    }
                    return;
                }
                else {
                    right = this.documentHelper.selection.getLeftInternal(endLine, endElement, endIndex);
                    width = Math.abs(right - left);
                    this.createHighlightBorder(lineWidget, width, isRtlText ? right : left, top);
                    return;
                }
            }
            else {
                width = this.documentHelper.selection.getWidth(lineWidget, true) - (left - widget.x);
                this.createHighlightBorder(lineWidget, width, left, top);
                top += lineWidget.height;
            }
        }
    };
    //#endregion
    //#region Get find result view
    /**
     * @private
     * @param {string} result - Specified the result.
     * @returns {void}
     */
    Search.prototype.addSearchResultItems = function (result) {
        if (isNullOrUndefined(result) || result === '') {
            return;
        }
        if (isNullOrUndefined(this.owner.findResultsList)) {
            this.owner.findResultsList = [];
        }
        this.owner.findResultsList.push(result);
    };
    /**
     * @private
     * @param {TextSearchResults} textSearchResults - Specified text search result.
     * @returns {void}
     */
    Search.prototype.addFindResultView = function (textSearchResults) {
        for (var i = 0; i < textSearchResults.innerList.length; i++) {
            var result = textSearchResults.innerList[i];
            this.addFindResultViewForSearch(result);
        }
        this.isHandledOddPageHeader = true;
        this.isHandledOddPageFooter = true;
        this.isHandledEvenPageHeader = true;
        this.isHandledEvenPageFooter = true;
    };
    /**
     * @private
     * @returns {void}
     */
    /* eslint-disable  */
    Search.prototype.addFindResultViewForSearch = function (result) {
        if (result.start != null && result.end != null && result.start.paragraph != null && result.end.paragraph != null) {
            var prefixText = void 0;
            var suffixtext = void 0;
            var currentText = void 0;
            var startIndex = 0;
            var inlineObj = result.start.currentWidget.getInline(result.start.offset, startIndex);
            var inline = inlineObj.element;
            startIndex = inlineObj.index;
            var prefix = '';
            var lastIndex = 0;
            if (inline instanceof FieldElementBox) {
                var elementInfo = this.owner.selection.getRenderedInline(inline, startIndex);
                if (elementInfo.element.nextNode instanceof TextElementBox) {
                    inline = elementInfo.element.nextNode;
                    startIndex = elementInfo.index;
                }
                else {
                    inline = elementInfo.element;
                    startIndex = elementInfo.index;
                }
            }
            var boxObj = this.owner.selection.getElementBoxInternal(inline, startIndex);
            var box = boxObj.element;
            startIndex = boxObj.index;
            if (box != null) {
                if (box instanceof TextElementBox && startIndex > 0) {
                    prefix = box.text.substring(0, startIndex);
                }
                var boxIndex = box.line.children.indexOf(box);
                lastIndex = prefix.lastIndexOf(' ');
                while (lastIndex < 0 && boxIndex > 0 && box.line.children[boxIndex - 1] instanceof TextElementBox) {
                    prefix = box.line.children[boxIndex - 1].text + prefix;
                    boxIndex--;
                    lastIndex = prefix.lastIndexOf(' ');
                }
            }
            var shiftIndex = prefix.lastIndexOf('\v');
            if (shiftIndex > 0) {
                prefix = prefix.substring(0, shiftIndex);
            }
            else {
                lastIndex = prefix.lastIndexOf(' ');
                prefixText = lastIndex < 0 ? prefix : prefix.substring(lastIndex + 1);
            }
            currentText = result.text;
            var endIndex = 0;
            var endInlineObj = result.end.currentWidget.getInline(result.end.offset, endIndex);
            var endInline = endInlineObj.element;
            endIndex = endInlineObj.index;
            suffixtext = '';
            //Checks prefix element box is empty
            if (boxObj != null) {
                // Gets the element box using endIndex of the text and set as suffix
                boxObj = this.owner.selection.getElementBoxInternal(endInline, endIndex);
                box = boxObj.element;
                endIndex = boxObj.index;
            }
            //Checks suffix element box is empty.
            if (box != null) {
                if (box instanceof TextElementBox && endIndex < box.length) {
                    suffixtext = box.text.substring(endIndex);
                }
                var boxIndex = box.line.children.indexOf(box);
                while (boxIndex + 1 < box.line.children.length && (box.line.children[boxIndex + 1] instanceof TextElementBox) || (box.line.children[boxIndex + 1] instanceof FieldElementBox)) {
                    if (box.line.children[boxIndex + 1] instanceof FieldElementBox) {
                        boxIndex = boxIndex + 2;
                    }
                    else {
                        suffixtext = suffixtext + box.line.children[boxIndex + 1].text;
                        boxIndex = boxIndex + 1;
                    }
                }
            }
            lastIndex = suffixtext.lastIndexOf(' ');
            suffixtext = suffixtext === '\v' ? suffixtext = '' : suffixtext;
            var headerFooterString = '';
            if (result.isHeader) {
                headerFooterString = '<span class="e-de-header-footer-list">' + 'Header' + ': ' + '</span>';
            }
            else if (result.isFooter) {
                headerFooterString = '<span class="e-de-header-footer-list">' + 'Footer' + ': ' + '</span>';
            }
            else {
                headerFooterString = '';
                headerFooterString = '';
                this.isHandledOddPageHeader = true;
                this.isHandledEvenPageHeader = true;
                this.isHandledOddPageFooter = true;
                this.isHandledEvenPageFooter = true;
            }
            var listElement = '';
            var page = result.documentHelper.selection.getPage(result.start.paragraph);
            if (isNullOrUndefined(this.isHandledEvenPageHeader) && isNullOrUndefined(this.isHandledEvenPageFooter)) {
                this.isHandledEvenPageHeader = true;
                this.isHandledEvenPageFooter = true;
            }
            else if (isNullOrUndefined(this.isHandledOddPageHeader) && isNullOrUndefined(this.isHandledOddPageFooter)) {
                this.isHandledOddPageHeader = true;
                this.isHandledOddPageFooter = true;
            }
            if (result.isHeader) {
                if (page.headerWidget.headerFooterType === 'FirstPageHeader' && page.bodyWidgets[0].sectionFormat.differentFirstPage) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                }
                else if (page.headerWidget.headerFooterType === 'EvenHeader' && this.isHandledEvenPageHeader) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                    this.isHandledEvenPageHeader = false;
                }
                else if (page.headerWidget.headerFooterType === 'OddHeader' && this.isHandledOddPageHeader) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                    this.isHandledOddPageHeader = false;
                }
            }
            else if (result.isFooter) {
                if (page.footerWidget.headerFooterType === 'FirstPageFooter' && page.bodyWidgets[0].sectionFormat.differentFirstPage) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                }
                else if (page.footerWidget.headerFooterType === 'EvenFooter' && this.isHandledEvenPageFooter) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                    this.isHandledEvenPageFooter = false;
                }
                else if (page.footerWidget.headerFooterType === 'OddFooter' && this.isHandledOddPageFooter) {
                    listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
                    this.isHandledOddPageFooter = false;
                }
            }
            else if (!result.isHeader && !result.isFooter) {
                listElement = '<li tabindex=0 class="e-de-search-result-item e-de-op-search-txt">' + headerFooterString + prefix + '<span class="e-de-op-search-word" style="pointer-events:none">' + result.text + '</span>' + suffixtext + '</li>';
            }
            this.addSearchResultItems(listElement);
        }
    };
    //#endregion
    /**
     * Clears search highlight.
     *
     * @private
     * @returns {void}
     */
    Search.prototype.clearSearchHighlight = function () {
        if (!isNullOrUndefined(this.searchHighlighters)) {
            this.searchHighlighters.clear();
            this.searchHighlighters = undefined;
        }
        var eventArgs = { source: this.viewer.owner };
        this.viewer.owner.trigger(searchResultsChangeEvent, eventArgs);
    };
    /**
     * @private
     * @returns {void}
     */
    Search.prototype.destroy = function () {
        if (this.textSearchResults) {
            this.textSearchResults.destroy();
        }
    };
    return Search;
}());
export { Search };
