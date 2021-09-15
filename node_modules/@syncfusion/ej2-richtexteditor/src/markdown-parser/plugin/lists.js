import * as CONSTANT from './../base/constant';
import { extend } from '@syncfusion/ej2-base';
import * as EVENTS from './../../common/constant';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
/**
 * Lists internal component
 *
 * @hidden
 */
var MDLists = /** @class */ (function () {
    /**
     * Constructor for creating the Lists plugin
     *
     * @param {IMDFormats} options - specifies the options
     * @hidden
     */
    function MDLists(options) {
        extend(this, this, options, true);
        this.selection = this.parent.markdownSelection;
        this.addEventListener();
    }
    MDLists.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.LISTS_COMMAND, this.applyListsHandler, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.keyDownHandler, this);
        this.parent.observer.on(EVENTS.KEY_UP_HANDLER, this.keyUpHandler, this);
    };
    MDLists.prototype.keyDownHandler = function (event) {
        switch (event.event.which) {
            case 9:
                this.tabKey(event);
                break;
        }
        switch (event.event.action) {
            case 'ordered-list':
                this.applyListsHandler({ subCommand: 'OL', callBack: event.callBack });
                event.event.preventDefault();
                break;
            case 'unordered-list':
                this.applyListsHandler({ subCommand: 'UL', callBack: event.callBack });
                event.event.preventDefault();
                break;
        }
    };
    MDLists.prototype.keyUpHandler = function (event) {
        switch (event.event.which) {
            case 13:
                this.enterKey(event);
                break;
        }
    };
    MDLists.prototype.tabKey = function (event) {
        var textArea = this.parent.element;
        this.selection.save(textArea.selectionStart, textArea.selectionEnd);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var parents = this.selection.getSelectedParentPoints(textArea);
        var addedLength = 0;
        var isNotFirst = this.isNotFirstLine(textArea, parents[0]);
        if (!isNotFirst && !event.event.shiftKey) {
            this.restore(textArea, start, end + addedLength, event);
            return;
        }
        var listFormat = this.olListType();
        var regex = this.getListRegex();
        this.currentAction = this.getAction(parents[0].text);
        for (var i = 0; i < parents.length; i++) {
            var prevIndex = event.event.shiftKey ? parents[i].line - 1 : parents[i].line - 1;
            var prevLine = this.selection.getLine(textArea, prevIndex);
            if (prevLine && (!event.event.shiftKey && isNotFirst || (event.event.shiftKey))) {
                var prevLineSplit = prevLine.split('. ');
                var tabSpace = '\t';
                var tabSpaceLength = event.event.shiftKey ? -tabSpace.length : tabSpace.length;
                var splitTab = parents[i].text.split('\t');
                if (event.event.shiftKey && splitTab.length === 1) {
                    break;
                }
                if (this.currentAction === 'OL' && /^\d+$/.test(prevLineSplit[0].trim()) && listFormat) {
                    event.event.preventDefault();
                    parents[i].text = event.event.shiftKey ? splitTab.splice(1, splitTab.length).join('\t') : tabSpace + parents[i].text;
                    var curTabSpace = this.getTabSpace(parents[i].text);
                    var prevTabSpace = this.getTabSpace(prevLine);
                    var splitText = parents[i].text.split('. ');
                    if (curTabSpace === prevTabSpace) {
                        this.changeTextAreaValue(splitText, this.nextOrderedListValue(prevLineSplit[0].trim()), event, textArea, parents, i, end);
                    }
                    else if (prevTabSpace < curTabSpace) {
                        this.changeTextAreaValue(splitText, '1. ', event, textArea, parents, i, end);
                    }
                    else {
                        for (; prevTabSpace.length > curTabSpace.length; null) {
                            prevIndex = prevIndex - 1;
                            prevLine = this.selection.getLine(textArea, prevIndex);
                            var prevLineSplit_1 = prevLine.trim().split('. ');
                            if (/^\d+$/.test(prevLineSplit_1[0])) {
                                prevTabSpace = this.getTabSpace(prevLine);
                                if (prevTabSpace.length <= curTabSpace.length) {
                                    this.changeTextAreaValue(splitText, this.nextOrderedListValue(prevLineSplit_1[0]), event, textArea, parents, i, end);
                                    break;
                                }
                            }
                        }
                    }
                }
                else if (this.currentAction === 'UL' && regex.test(prevLine.trim()) || !listFormat) {
                    event.event.preventDefault();
                    parents[i].text = event.event.shiftKey ? splitTab.splice(1, splitTab.length).join('\t') : tabSpace + parents[i].text;
                    textArea.value = textArea.value.substr(0, parents[i].start) + parents[i].text + '\n' +
                        textArea.value.substr(parents[i].end, textArea.value.length);
                }
                start = i === 0 ? start + tabSpaceLength : start;
                addedLength += tabSpaceLength;
                if (parents.length !== 1) {
                    for (var j = i; j < parents.length; j++) {
                        parents[j].start = j !== 0 ? parents[j].start + tabSpaceLength : parents[j].start;
                        parents[j].end = parents[j].end + tabSpaceLength;
                    }
                }
            }
        }
        this.restore(textArea, start, end + addedLength, event);
    };
    MDLists.prototype.changeTextAreaValue = function (splitText, prefixValue, event, 
    // eslint-disable-next-line
    textArea, parents, k, end) {
        var prefix = prefixValue;
        splitText.splice(0, 1);
        var textAreaLength = this.selection.getAllParents(textArea.value).length;
        var changedList = '';
        var curTabSpace = this.getTabSpace(parents[k].text);
        // eslint-disable-next-line
        var prefixNumber = parseInt(prefix.split('.')[0], null);
        var nestedTabSpace = this.getTabSpace(parents[k].text);
        var nestedlistorder = true;
        var nestedListStart = true;
        var curTabSpaceLength;
        var nextPrefixValue = -1;
        var traversIncreased = true;
        var nextLineLength = 0;
        var lineBreak = '';
        changedList = (this.selection.getLine(textArea, parents[0].line + 1) !== '') ?
            '' : changedList + textArea.value.substr(parents[0].end, textArea.value.length);
        for (var i = 1; i < textAreaLength &&
            !isNullOrUndefined(this.selection.getLine(textArea, parents[0].line + i))
            && this.selection.getLine(textArea, parents[0].line + i) !== ''; i++) {
            var nextLine = this.selection.getLine(textArea, parents[0].line + i);
            var nextTabSpace = this.getTabSpace(nextLine);
            var nextLineSplit = nextLine.split('. ');
            if (nextLineSplit.length === 1) {
                changedList += textArea.value.substr(parents[0].end + nextLineLength, textArea.value.length);
                break;
            }
            else {
                nextLineLength += nextLine.length;
                var shiftTabTargetList = false;
                curTabSpaceLength = event.event.shiftKey ? curTabSpace.length + 1 : curTabSpace.length - 1;
                if (nextTabSpace.length > nestedTabSpace.length) {
                    traversIncreased = false;
                }
                if (curTabSpace.length !== nextTabSpace.length && nextTabSpace.length < nestedTabSpace.length) {
                    nestedListStart = true;
                    nestedlistorder = false;
                    shiftTabTargetList = event.event.shiftKey &&
                        curTabSpace.length === nextTabSpace.length ? (nestedListStart = false, true) : false;
                }
                else if (traversIncreased && event.event.shiftKey &&
                    curTabSpace.length === nextTabSpace.length && nextTabSpace.length === nestedTabSpace.length) {
                    nestedListStart = false;
                    shiftTabTargetList = true;
                }
                lineBreak = changedList === '' ? '' : '\n';
                if (curTabSpaceLength === nextTabSpace.length && nestedListStart) {
                    var nextPrefix = event.event.shiftKey ?
                        (nextPrefixValue++, this.nextOrderedListValue(nextPrefixValue.toString()))
                        : this.previousOrderedListValue(nextLineSplit[0]);
                    nextLineSplit.splice(0, 1);
                    changedList = changedList + lineBreak + nextTabSpace + nextPrefix + nextLineSplit.join('. ');
                }
                else if (curTabSpace.length === nextTabSpace.length && nestedlistorder || shiftTabTargetList) {
                    var nextPrefix = this.nextOrderedListValue(prefixNumber.toString());
                    prefixNumber++;
                    nextLineSplit.splice(0, 1);
                    changedList = changedList + lineBreak + nextTabSpace + nextPrefix + nextLineSplit.join('. ');
                }
                else {
                    changedList = changedList + lineBreak + nextLine;
                    nestedListStart = false;
                }
                nestedTabSpace = this.getTabSpace(nextLine);
            }
        }
        parents[k].text = this.getTabSpace(parents[k].text) + prefix + splitText.join('. ') + '\n';
        textArea.value = textArea.value.substr(0, parents[k].start) + parents[k].text + changedList;
    };
    MDLists.prototype.getTabSpace = function (line) {
        var split = line.split('\t');
        var tabs = '';
        for (var i = 0; i < split.length; i++) {
            if (split[i] === '') {
                tabs += '\t';
            }
            else {
                break;
            }
        }
        return tabs;
    };
    MDLists.prototype.isNotFirstLine = function (textArea, points) {
        var currentLine = points.text;
        var prevIndex = points.line - 1;
        var prevLine = this.selection.getLine(textArea, prevIndex);
        var regex = this.getListRegex();
        var isNotFirst = false;
        var regexFirstCondition;
        if (prevLine) {
            this.currentAction = this.getAction(prevLine);
            var prevLineSplit = prevLine.split('. ');
            regexFirstCondition = this.currentAction === 'OL' ? /^\d+$/.test(prevLineSplit[0].trim()) : regex.test(prevLine.trim());
        }
        if (prevLine && regexFirstCondition) {
            var curTabSpace = this.getTabSpace(currentLine);
            var prevTabSpace = this.getTabSpace(prevLine);
            isNotFirst = curTabSpace === prevTabSpace ? true : isNotFirst;
            for (; prevTabSpace.length > curTabSpace.length; null) {
                prevIndex = prevIndex - 1;
                prevLine = this.selection.getLine(textArea, prevIndex);
                var prevLineSplit = prevLine.trim().split('. ');
                var regexSecondCondition = this.currentAction === 'OL' ?
                    /^\d+$/.test(prevLineSplit[0]) : regex.test(prevLine.trim());
                if (regexSecondCondition) {
                    prevTabSpace = this.getTabSpace(prevLine);
                    if (prevTabSpace.length <= curTabSpace.length) {
                        isNotFirst = true;
                        break;
                    }
                }
            }
        }
        return isNotFirst;
    };
    MDLists.prototype.getAction = function (line) {
        var ol = line.split('. ')[0];
        // eslint-disable-next-line
        var currentState = /^\d+$/.test(ol.trim());
        var ul = line.trim().split(new RegExp('^(' + this.selection.replaceSpecialChar(this.syntax.UL).trim() + ')'))[1];
        return (currentState ? 'OL' : ul ? 'UL' : 'NOTLIST');
    };
    MDLists.prototype.nextOrderedListValue = function (previousLine) {
        // eslint-disable-next-line
        var currentValue = parseInt(previousLine, null);
        var nextValue = currentValue + 1;
        return nextValue.toString() + '. ';
    };
    MDLists.prototype.previousOrderedListValue = function (previousLine) {
        // eslint-disable-next-line
        var currentValue = parseInt(previousLine, null);
        var nextValue = currentValue - 1;
        return nextValue.toString() + '. ';
    };
    MDLists.prototype.enterKey = function (event) {
        var textArea = this.parent.element;
        this.selection.save(textArea.selectionStart, textArea.selectionEnd);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var parents = this.selection.getSelectedParentPoints(textArea);
        var prevLine = this.selection.getLine(textArea, parents[0].line - 1);
        var listFormat = this.olListType();
        var regex = this.getListRegex();
        var prevLineSplit = [];
        if (!isNullOrUndefined(prevLine)) {
            prevLineSplit = prevLine.split('. ');
            this.currentAction = this.getAction(prevLine);
        }
        var addedLength = 0;
        if (this.currentAction === 'OL' && prevLineSplit.length > 1 && /^\d+$/.test(prevLineSplit[0].trim()) && listFormat
            && prevLineSplit[1] !== '') {
            var tabSpace = this.getTabSpace(prevLine);
            this.currentAction = this.getAction(prevLine);
            var prefix = this.nextOrderedListValue(prevLineSplit[0]);
            parents[0].text = tabSpace + prefix + parents[0].text;
            var textAreaLength = this.selection.getAllParents(textArea.value).length;
            var changedList = '\n';
            var curTabSpace = this.getTabSpace(prevLine);
            var nestedTabSpace = this.getTabSpace(parents[0].text);
            var nestedListOrder = true;
            for (var i = 1; i < textAreaLength &&
                textArea.value.substr(parents[0].end, textArea.value.length) !== ''; i++) {
                var nextLine = this.selection.getLine(textArea, parents[0].line + i);
                if (isNullOrUndefined(nextLine)) {
                    changedList = changedList + '';
                }
                else {
                    var nextLineSplit = nextLine.split('. ');
                    var nextTabSpace = this.getTabSpace(nextLine);
                    if (nextTabSpace.length < nestedTabSpace.length) {
                        nestedListOrder = false;
                    }
                    if (nextLineSplit.length > 1 && /^\d+$/.test(nextLineSplit[0].trim()) &&
                        curTabSpace.length === nextTabSpace.length && nestedListOrder) {
                        var nextPrefix = this.nextOrderedListValue(nextLineSplit[0]);
                        nextLineSplit.splice(0, 1);
                        changedList = changedList + nextTabSpace + nextPrefix + nextLineSplit.join('. ') + '\n';
                    }
                    else {
                        changedList = changedList + nextLine + '\n';
                        nestedTabSpace = this.getTabSpace(nextLine);
                    }
                }
            }
            textArea.value = textArea.value.substr(0, parents[0].start) + curTabSpace +
                prefix + this.selection.getLine(textArea, parents[0].line) + changedList;
            start = start + prefix.length + tabSpace.length;
            addedLength += prefix.length + tabSpace.length;
        }
        else if (this.currentAction === 'UL' && (prevLine && regex.test(prevLine.trim())) &&
            prevLine.trim().replace(regex, '') !== '' || this.currentAction === 'OL' && !listFormat) {
            var tabSpace = this.getTabSpace(prevLine);
            var prefix = this.syntax[this.currentAction];
            parents[0].text = tabSpace + prefix + parents[0].text +
                (parents[0].text.trim().length > 0 ? '\n' : '');
            textArea.value = textArea.value.substr(0, parents[0].start) + parents[0].text +
                textArea.value.substr(parents[0].end, textArea.value.length);
            start = start + prefix.length + tabSpace.length;
            addedLength += prefix.length + tabSpace.length;
        }
        this.restore(textArea, start, end + addedLength, event);
    };
    MDLists.prototype.olListType = function () {
        var olSyntaxList = this.syntax.OL.split('.,');
        var listType = olSyntaxList.length === 1 ? null :
            // eslint-disable-next-line
            parseInt(olSyntaxList[2].trim(), null) - parseInt(olSyntaxList[0].trim(), null);
        if (listType) {
            return 1;
        }
        else {
            return 0;
        }
    };
    MDLists.prototype.applyListsHandler = function (e) {
        var textArea = this.parent.element;
        this.selection.save(textArea.selectionStart, textArea.selectionEnd);
        this.currentAction = e.subCommand;
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var addedLength = 0;
        var startLength = 0;
        var endLength = 0;
        var parents = this.selection.getSelectedParentPoints(textArea);
        var prefix = '';
        var listFormat = this.olListType();
        var regex;
        var perfixObj = {};
        for (var i = 0; i < parents.length; i++) {
            if (listFormat) {
                regex = this.currentAction === 'OL' ? i + listFormat + '. ' : this.syntax[this.currentAction];
            }
            else {
                regex = this.currentAction === 'OL' ? this.syntax.OL : this.syntax[this.currentAction];
            }
            if (!this.selection.isStartWith(parents[i].text, regex)) {
                if (parents[i].text === '' && i === 0) {
                    this.selection.save(start, end);
                    if (parents.length !== 1) {
                        for (var j = i; j < parents.length; j++) {
                            parents[j].start = j !== 0 ? 1 + parents[j].start : parents[j].start;
                            parents[j].end = 1 + parents[j].end;
                        }
                    }
                }
                var preLineTabSpaceLength = !isNullOrUndefined(parents[i - 1]) ?
                    this.getTabSpace(parents[i - 1].text).length : 0;
                var replace = this.appliedLine(parents[i].text, regex, perfixObj, preLineTabSpaceLength);
                prefix = replace.line ? prefix : regex;
                parents[i].text = replace.line ? replace.line : prefix + parents[i].text;
                replace.space = replace.space ? replace.space : 0;
                textArea.value = textArea.value.substr(0, parents[i].start + endLength) + parents[i].text + '\n' +
                    textArea.value.substr(parents[i].end, textArea.value.length);
                start = i === 0 ? (start + prefix.length + replace.space) > 0 ?
                    start + prefix.length + replace.space : 0 : start;
                addedLength += prefix.length + replace.space;
                if (parents.length !== 1) {
                    for (var j = i; j < parents.length; j++) {
                        parents[j].start = j !== 0 ? prefix.length +
                            parents[j].start + replace.space : parents[j].start;
                        parents[j].end = prefix.length + parents[j].end + replace.space;
                    }
                }
                this.restore(textArea, start, end + addedLength, null);
            }
            else {
                parents[i].text = parents[i].text.replace(regex, '');
                textArea.value = textArea.value.substr(0, parents[i].start + endLength) + parents[i].text + '\n' +
                    textArea.value.substr(parents[i].end + endLength, textArea.value.length);
                endLength -= regex.length;
                startLength = regex.length;
                this.restore(textArea, start - startLength, end + endLength, null);
            }
        }
        this.restore(textArea, null, null, e);
    };
    MDLists.prototype.appliedLine = function (line, prefixPattern, perfixObj, preTabSpaceLength) {
        var points = {};
        var regex = new RegExp('^[' + this.syntax.UL.trim() + ']');
        var lineSplit = line.split('. ');
        var currentPrefix = lineSplit[0] + '. ';
        var isExist = regex.test(line.trim()) || line.trim() === this.syntax.OL.trim()
            || line.trim() === this.syntax.UL.trim() || /^\d+$/.test(lineSplit[0].trim());
        var listFormat = this.olListType();
        var curTabSpaceLength = this.getTabSpace(line).length;
        if (this.currentAction === 'OL' && listFormat) {
            perfixObj[curTabSpaceLength.toString()] = !isNullOrUndefined(perfixObj[curTabSpaceLength.toString()]) ?
                perfixObj[curTabSpaceLength.toString()].valueOf() + 1 : 1;
            prefixPattern = perfixObj[curTabSpaceLength.toString()].valueOf().toString() + '. ';
            if (!isNullOrUndefined(preTabSpaceLength) && preTabSpaceLength > curTabSpaceLength) {
                perfixObj[preTabSpaceLength.toString()] = 0;
            }
        }
        if (isExist) {
            var replace = void 0;
            var pattern = void 0;
            // eslint-disable-next-line
            var space = 0;
            if (regex.test(line.trim())) {
                pattern = this.syntax.UL;
                replace = prefixPattern;
                points.space = prefixPattern.trim().length - this.syntax.UL.trim().length;
            }
            else if (/^\d+$/.test(lineSplit[0].trim()) && listFormat) {
                pattern = lineSplit[0].trim() + '. ';
                replace = prefixPattern;
                points.space = this.syntax.UL.trim().length - currentPrefix.trim().length;
            }
            else if (/^\d+$/.test(lineSplit[0].trim())) {
                pattern = lineSplit[0].trim() + '. ';
                replace = this.syntax.UL;
                points.space = this.syntax.UL.trim().length - currentPrefix.trim().length;
            }
            points.line = line.replace(pattern, replace);
        }
        return points;
    };
    MDLists.prototype.restore = function (textArea, start, end, event) {
        if (!isNullOrUndefined(start) && !isNullOrUndefined(start)) {
            this.selection.save(start, end);
        }
        if (!isNullOrUndefined(event)) {
            this.selection.restore(textArea);
        }
        if (event && event.callBack) {
            event.callBack({
                requestType: this.currentAction,
                selectedText: this.selection.getSelectedText(textArea),
                editorMode: 'Markdown',
                event: event.event
            });
        }
    };
    MDLists.prototype.getListRegex = function () {
        var regex = '';
        var configKey = Object.keys(this.syntax);
        for (var j = 0; j < configKey.length; j++) {
            var syntax = this.selection.replaceSpecialChar(this.syntax[configKey[j]]);
            regex += regex === '' ? '^(' + syntax + ')|^(' + syntax.trim() + ')' :
                '|^(' + syntax + ')|^(' + syntax.trim() + ')';
        }
        return new RegExp(regex);
    };
    return MDLists;
}());
export { MDLists };
