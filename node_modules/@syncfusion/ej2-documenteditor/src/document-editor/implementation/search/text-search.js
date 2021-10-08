import { Dictionary } from '../../base/dictionary';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { TextPosition } from '../selection/selection-helper';
import { TextElementBox, ParagraphWidget, ListTextElementBox, FieldElementBox } from '../viewer/page';
import { searchResultsChangeEvent } from '../../base/index';
/**
 * @private
 */
var TextSearch = /** @class */ (function () {
    function TextSearch(owner) {
        this.wordBefore = '\\b';
        this.wordAfter = '\\b';
        this.isHeader = false;
        this.isFooter = false;
        this.owner = owner;
        this.documentHelper = this.owner.documentHelper;
    }
    TextSearch.prototype.find = function (pattern, findOption) {
        return this.findNext(pattern, findOption, '0;0;0');
    };
    TextSearch.prototype.findNext = function (pattern, findOption, hierarchicalPosition) {
        if (typeof pattern === 'string') {
            pattern = this.stringToRegex(pattern, findOption);
        }
        if (hierarchicalPosition === undefined) {
            hierarchicalPosition = '0;0;0';
        }
        this.owner.searchModule.textSearchResults.clearResults();
        var results = this.owner.searchModule.textSearchResults;
        this.findDocument(results, pattern, true, findOption, hierarchicalPosition);
        return results.length > 0, results.currentSearchResult;
    };
    TextSearch.prototype.stringToRegex = function (textToFind, option) {
        if (textToFind.indexOf('\\') > -1) {
            textToFind = textToFind.split('\\').join('\\\\');
        }
        if (textToFind.indexOf('(') > -1 || textToFind.indexOf(')') > -1 || textToFind.indexOf('.') > -1 || textToFind.indexOf('[') > -1
            || textToFind.indexOf(']') > -1 || textToFind.indexOf('$') > -1 || textToFind.indexOf('{') > -1
            || textToFind.indexOf('}') > -1 || textToFind.indexOf('*') > -1 || textToFind.indexOf('|') > -1
            || textToFind.indexOf('^') > -1 || textToFind.indexOf('?') > -1) {
            var text = '';
            for (var i = 0; i < textToFind.length; i++) {
                if (textToFind[i] === '(' || textToFind[i] === ')' || textToFind[i] === '.' || textToFind[i] === '['
                    || textToFind[i] === ']' || textToFind[i] === '$' || textToFind[i] === '{' || textToFind[i] === '}'
                    || textToFind[i] === '*' || textToFind[i] === '|' || textToFind[i] === '^' || textToFind[i] === '?') {
                    text += '\\' + textToFind[i];
                }
                else {
                    text += textToFind[i];
                }
            }
            textToFind = text;
        }
        if (option === 'WholeWord' || option === 'CaseSensitiveWholeWord') {
            textToFind = this.wordBefore + textToFind + this.wordAfter;
        }
        return new RegExp(textToFind, (option === 'CaseSensitive' || option === 'CaseSensitiveWholeWord') ? 'g' : 'ig');
    };
    TextSearch.prototype.isPatternEmpty = function (pattern) {
        var wordEmpty = this.wordBefore + this.wordAfter;
        var patternRegExp = pattern.toString();
        return (patternRegExp.length === 0 || patternRegExp === wordEmpty);
    };
    TextSearch.prototype.findAll = function (pattern, findOption, hierarchicalPosition) {
        if (typeof pattern === 'string') {
            pattern = this.stringToRegex(pattern, findOption);
        }
        if (hierarchicalPosition === undefined) {
            hierarchicalPosition = '0;0;0';
        }
        this.owner.searchModule.textSearchResults.clearResults();
        var results = this.owner.searchModule.textSearchResults;
        this.findDocument(results, pattern, false, findOption, hierarchicalPosition);
        if (results.length > 0 && results.currentIndex < 0) {
            results.currentIndex = 0;
        }
        if (!isNullOrUndefined(results.currentSearchResult)) {
            var eventArgs = { source: this.documentHelper.owner };
            this.documentHelper.owner.trigger(searchResultsChangeEvent, eventArgs);
            return results;
        }
        return undefined;
    };
    TextSearch.prototype.getElementInfo = function (inlineElement, indexInInline, includeNextLine) {
        var inlines = inlineElement;
        var stringBuilder = '';
        var spans = new Dictionary();
        // eslint-disable  no-constant-condition
        do {
            if (inlineElement instanceof TextElementBox && (!isNullOrUndefined(inlineElement.text) && inlineElement.text !== '')) {
                spans.add(inlineElement, stringBuilder.length);
                // IndexInInline Handled specifically for simple find operation to start from starting point
                if (inlineElement === inlines) {
                    stringBuilder = stringBuilder + (inlineElement.text.substring(indexInInline));
                }
                else {
                    stringBuilder = stringBuilder + (inlineElement.text);
                }
            }
            else if (inlineElement instanceof FieldElementBox) {
                var fieldBegin = inlineElement;
                if (!isNullOrUndefined(fieldBegin.fieldEnd)) {
                    /* eslint-disable-next-line max-len */
                    inlineElement = isNullOrUndefined(fieldBegin.fieldSeparator) ? fieldBegin.fieldEnd : fieldBegin.fieldSeparator;
                }
            }
            if (!isNullOrUndefined(inlineElement) && isNullOrUndefined(inlineElement.nextNode)) {
                break;
            }
            if (!isNullOrUndefined(inlineElement)) {
                if ((!isNullOrUndefined(includeNextLine) && !includeNextLine)) {
                    var elementBoxes = inlineElement.line.children;
                    var length_1 = inlineElement.line.children.length;
                    if (elementBoxes.indexOf(inlineElement) < length_1 - 1) {
                        inlineElement = inlineElement.nextNode;
                    }
                    else {
                        inlineElement = undefined;
                        break;
                    }
                }
                else {
                    inlineElement = inlineElement.nextNode;
                }
            }
            // eslint-disable-next-line no-constant-condition
        } while (true);
        var text = stringBuilder.toString();
        return { elementsWithOffset: spans, fullText: text };
    };
    /* eslint-disable-next-line max-len */
    TextSearch.prototype.updateMatchedTextLocation = function (matches, results, textInfo, indexInInline, inlines, isFirstMatch, selectionEnd, startPosition) {
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var isMatched = void 0;
            if (!(isNullOrUndefined(startPosition)) && match.index < startPosition) {
                continue;
            }
            var result = results.addResult();
            var spanKeys = textInfo.keys;
            for (var j = 0; j < spanKeys.length; j++) {
                var span = spanKeys[j];
                var startIndex = textInfo.get(span);
                var spanLength = span.length;
                // IndexInInline Handled specifically for simple find operation to start from starting point
                if (span === inlines) {
                    spanLength -= indexInInline;
                }
                if (isNullOrUndefined(result.start) && match.index < startIndex + spanLength) {
                    var index = match.index - startIndex;
                    // IndexInInline Handled specifically for simple find operation to start from starting point
                    if (span === inlines) {
                        index += indexInInline;
                    }
                    var offset = (span.line).getOffset(span, index);
                    result.start = this.getTextPosition(span.line, offset.toString());
                    result.start.location = this.owner.selection.getPhysicalPositionInternal(span.line, offset, true);
                    result.start.setPositionParagraph(span.line, offset);
                }
                if (match.index + match[0].length <= startIndex + spanLength) {
                    var index = (match.index + match[0].length) - startIndex;
                    // IndexInInline Handled specifically for simple find operation to start from starting point
                    if (span === inlines) {
                        index += indexInInline;
                    }
                    var offset = (span.line).getOffset(span, index);
                    result.end = this.getTextPosition(span.line, offset.toString());
                    result.end.location = this.owner.selection.getPhysicalPositionInternal(span.line, offset, true);
                    result.end.setPositionParagraph(span.line, offset);
                    isMatched = true;
                    break;
                }
            }
            result.isHeader = this.isHeader;
            result.isFooter = this.isFooter;
            if (isFirstMatch) {
                results.currentIndex = 0;
                break;
            }
            else if (results.currentIndex < 0 && !isNullOrUndefined(selectionEnd) && (selectionEnd.isExistBefore(result.start) ||
                selectionEnd.isAtSamePosition(result.start))) {
                results.currentIndex = results.indexOf(result);
            }
            if (!isNullOrUndefined(startPosition) && isMatched) {
                break;
            }
        }
    };
    /* eslint-disable-next-line max-len */
    TextSearch.prototype.findDocument = function (results, pattern, isFirstMatch, findOption, hierachicalPosition) {
        if (this.isPatternEmpty(pattern)) {
            return;
        }
        if (findOption === undefined) {
            findOption = 'None';
        }
        var inline = undefined;
        var selectionEnd = undefined;
        if (hierachicalPosition !== undefined) {
            selectionEnd = this.owner.selection.end;
        }
        if (hierachicalPosition !== undefined && isFirstMatch && selectionEnd !== undefined && selectionEnd.paragraph !== undefined) {
            if (selectionEnd.paragraph instanceof ParagraphWidget) {
                var indexInInline = 0;
                // IndexInInline Handled specifically for simple find operation to start from starting point
                /* eslint-disable-next-line max-len */
                var inlineElement = selectionEnd.currentWidget.getInline(this.owner.selection.start.offset, indexInInline);
                inline = inlineElement.element;
                indexInInline = inlineElement.index;
                if (!isNullOrUndefined(inline)) {
                    var nextParagraphWidget = undefined;
                    nextParagraphWidget = this.findInline(inline, pattern, findOption, indexInInline, isFirstMatch, results, selectionEnd);
                    while (results.length === 0 && !isNullOrUndefined(nextParagraphWidget)) {
                        while (!isNullOrUndefined(nextParagraphWidget) && nextParagraphWidget.childWidgets.length === 0) {
                            /* eslint-disable-next-line max-len */
                            nextParagraphWidget = this.owner.selection.getNextParagraph(nextParagraphWidget.containerWidget);
                        }
                        if (isNullOrUndefined(nextParagraphWidget)) {
                            break;
                        }
                        var lineWidget = nextParagraphWidget.childWidgets[0];
                        if (lineWidget.children[0] instanceof ListTextElementBox) {
                            inline = (lineWidget.children[2] instanceof TextElementBox) ? lineWidget.children[2] : undefined;
                        }
                        else {
                            inline = lineWidget.children[0];
                        }
                        if (isNullOrUndefined(inline)) {
                            break;
                        }
                        nextParagraphWidget = this.findInline(inline, pattern, findOption, 0, isFirstMatch, results, selectionEnd);
                    }
                    if (results.length > 0) {
                        return;
                    }
                }
            }
        }
        var section;
        section = this.documentHelper.pages[0].bodyWidgets[0];
        while (!isNullOrUndefined(section) && section.childWidgets.length === 0) {
            section = section.nextWidget;
        }
        if (isNullOrUndefined(section) || section.childWidgets.length === 0) {
            return;
        }
        this.isHeader = false;
        this.isFooter = false;
        this.findInlineText(section, pattern, findOption, isFirstMatch, results, selectionEnd);
        for (var i = 0; i < this.documentHelper.pages.length; i++) {
            var headerWidget = this.documentHelper.pages[i].headerWidget;
            if (!isNullOrUndefined(headerWidget)) {
                this.isHeader = true;
                this.isFooter = false;
                this.findInlineText(headerWidget, pattern, findOption, isFirstMatch, results, selectionEnd);
            }
        }
        for (var i = 0; i < this.documentHelper.pages.length; i++) {
            var footerWidget = this.documentHelper.pages[i].footerWidget;
            if (!isNullOrUndefined(footerWidget)) {
                this.isHeader = false;
                this.isFooter = true;
                this.findInlineText(footerWidget, pattern, findOption, isFirstMatch, results, selectionEnd);
            }
        }
        if (isFirstMatch && !isNullOrUndefined(results) && results.length > 0) {
            return;
        }
    };
    /* eslint-disable-next-line max-len */
    TextSearch.prototype.findInlineText = function (section, pattern, findOption, isFirstMatch, results, selectionEnd) {
        var paragraphWidget = this.owner.selection.getFirstParagraphBlock(section.childWidgets[0]);
        /* eslint-disable-next-line max-len */
        while (!isNullOrUndefined(paragraphWidget) && paragraphWidget.childWidgets.length === 1 && paragraphWidget.childWidgets[0].children.length === 0) {
            paragraphWidget = this.owner.selection.getNextParagraphBlock(paragraphWidget);
        }
        while (!isNullOrUndefined(paragraphWidget) && paragraphWidget.childWidgets.length > 0) {
            var inlineElement = paragraphWidget.childWidgets[0];
            var inlineEle = inlineElement.children[0];
            if (isNullOrUndefined(inlineEle)) {
                break;
            }
            this.findInline(inlineEle, pattern, findOption, 0, isFirstMatch, results, selectionEnd);
            paragraphWidget = this.owner.selection.getNextParagraphBlock(paragraphWidget);
            /* eslint-disable-next-line max-len */
            while (!isNullOrUndefined(paragraphWidget) && (paragraphWidget.childWidgets.length === 1) && paragraphWidget.childWidgets[0].children.length === 0) {
                paragraphWidget = this.owner.selection.getNextParagraphBlock(paragraphWidget);
            }
        }
        if (isFirstMatch && !isNullOrUndefined(results) && results.length > 0) {
            return;
        }
    };
    /* eslint-disable-next-line max-len */
    TextSearch.prototype.findInline = function (inlineElement, pattern, option, indexInInline, isFirstMatch, results, selectionEnd) {
        var inlines = inlineElement;
        var textInfo = this.getElementInfo(inlineElement, indexInInline);
        var text = textInfo.fullText;
        var matches = [];
        var spans = textInfo.elementsWithOffset;
        var matchObject;
        // eslint-disable-next-line no-cond-assign
        while (!isNullOrUndefined(matchObject = pattern.exec(text))) {
            matches.push(matchObject);
        }
        this.updateMatchedTextLocation(matches, results, spans, indexInInline, inlines, isFirstMatch, selectionEnd);
        if (isFirstMatch) {
            return undefined;
        }
        /* eslint-disable-next-line max-len */
        var paragraphWidget = this.owner.selection.getNextParagraphBlock(inlineElement.line.paragraph);
        return paragraphWidget;
    };
    TextSearch.prototype.getTextPosition = function (lineWidget, hierarchicalIndex) {
        var textPosition = new TextPosition(this.owner);
        var index = textPosition.getHierarchicalIndex(lineWidget, hierarchicalIndex);
        textPosition.setPositionForCurrentIndex(index);
        return textPosition;
    };
    return TextSearch;
}());
export { TextSearch };
/**
 * @private
 */
var SearchWidgetInfo = /** @class */ (function () {
    function SearchWidgetInfo(left, width) {
        this.leftInternal = 0;
        this.widthInternal = 0;
        this.leftInternal = left;
        this.widthInternal = width;
    }
    Object.defineProperty(SearchWidgetInfo.prototype, "left", {
        get: function () {
            return this.leftInternal;
        },
        set: function (value) {
            this.leftInternal = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SearchWidgetInfo.prototype, "width", {
        get: function () {
            return this.widthInternal;
        },
        set: function (value) {
            this.widthInternal = value;
        },
        enumerable: true,
        configurable: true
    });
    return SearchWidgetInfo;
}());
export { SearchWidgetInfo };
