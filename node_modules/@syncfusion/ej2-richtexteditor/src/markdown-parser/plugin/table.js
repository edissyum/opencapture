import * as CONSTANT from './../base/constant';
import { extend } from '@syncfusion/ej2-base';
import * as EVENTS from './../../common/constant';
/**
 * Link internal component
 *
 * @hidden

 */
var MDTable = /** @class */ (function () {
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {IMDTable} options - specifies the options
     * @hidden

     */
    function MDTable(options) {
        extend(this, this, options, true);
        this.selection = this.parent.markdownSelection;
        this.addEventListener();
    }
    MDTable.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.MD_TABLE, this.createTable, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.onKeyDown, this);
    };
    MDTable.prototype.removeEventListener = function () {
        this.parent.observer.off(CONSTANT.MD_TABLE, this.createTable);
        this.parent.observer.off(EVENTS.KEY_DOWN_HANDLER, this.onKeyDown);
    };
    /**
     * markdown destroy method
     *
     * @returns {void}
     * @hidden

     */
    MDTable.prototype.destroy = function () {
        this.removeEventListener();
    };
    MDTable.prototype.onKeyDown = function (e) {
        if (e.event.action === 'insert-table') {
            e.item = e.value;
            this.createTable(e);
        }
    };
    MDTable.prototype.createTable = function (e) {
        this.element = this.parent.element;
        var start = this.element.selectionStart;
        var end = this.element.selectionEnd;
        var textAreaInitial = this.element.value;
        this.locale = e;
        this.selection.save(start, end);
        this.restore(this.element.selectionStart, this.element.selectionEnd, null);
        this.insertTable(start, end, textAreaInitial, e);
    };
    MDTable.prototype.getTable = function () {
        var table = '';
        table += this.textNonEmpty();
        table += this.tableHeader(this.locale);
        table += this.tableCell(this.locale);
        return table;
    };
    MDTable.prototype.tableHeader = function (e) {
        var text = '';
        for (var i = 1; i <= 2; i++) {
            text += '|';
            for (var j = 1; j <= 2; j++) {
                if (i === 1) {
                    text += e.item.headingText + ' ' + j + '|';
                }
                else {
                    text += '---------|';
                }
            }
            text += this.insertLine();
        }
        return text;
    };
    MDTable.prototype.tableCell = function (e) {
        var text = '';
        for (var i = 1; i <= 2; i++) {
            text += '|';
            for (var j = 1; j <= 2; j++) {
                text += e.item.colText + ' ' + this.convertToLetters(i) + j + '|';
            }
            text += this.insertLine();
        }
        text += this.insertLine();
        return text;
    };
    MDTable.prototype.insertLine = function () {
        var dummyElement = document.createElement('div');
        dummyElement.innerHTML = '\n';
        return dummyElement.textContent;
    };
    MDTable.prototype.insertTable = function (start, end, textAreaInitial, e) {
        var parentText = this.selection.getSelectedParentPoints(this.element);
        var lastLineSplit = parentText[parentText.length - 1].text.split(' ', 2);
        var syntaxArr = this.getFormatTag();
        // eslint-disable-next-line
        var syntaxCount = 0;
        if (lastLineSplit.length < 2) {
            this.element.value = this.updateValue(this.getTable());
            this.makeSelection(textAreaInitial, start, end);
        }
        else {
            if (this.ensureFormatApply(parentText[parentText.length - 1].text)) {
                this.checkValid(start, end, this.getTable(), textAreaInitial, e, lastLineSplit, parentText, syntaxArr);
            }
            else {
                this.element.value = this.updateValue(this.getTable());
                this.makeSelection(textAreaInitial, start, end);
            }
        }
        this.restore(this.element.selectionStart, this.element.selectionEnd, e);
    };
    MDTable.prototype.makeSelection = function (textAreaInitial, start, end) {
        end = start + (textAreaInitial.length > 0 ? 12 : 10); //end is added 12 or 10 because to make the table heading selected
        start += textAreaInitial.length > 0 ? 3 : 1; // Start is added 3 or 1 because new lines are added when inserting table
        this.selection.setSelection(this.element, start, end);
    };
    MDTable.prototype.getFormatTag = function () {
        var syntaxFormatKey = Object.keys(this.syntaxTag.Formats);
        var syntaxListKey = Object.keys(this.syntaxTag.List);
        var syntaxArr = [];
        for (var i = 0; i < syntaxFormatKey.length; i++) {
            syntaxArr.push(this.syntaxTag.Formats[syntaxFormatKey[i]]);
        }
        for (var j = 0; j < syntaxListKey.length; j++) {
            syntaxArr.push(this.syntaxTag.List[syntaxListKey[j]]);
        }
        return syntaxArr;
    };
    MDTable.prototype.ensureFormatApply = function (line) {
        var formatTags = this.getFormatTag();
        var formatSplitZero = line.trim().split(' ', 2)[0] + ' ';
        for (var i = 0; i < formatTags.length; i++) {
            if (formatSplitZero === formatTags[i] || /^[\d.]+[ ]+$/.test(formatSplitZero)) {
                return true;
            }
        }
        return false;
    };
    MDTable.prototype.ensureStartValid = function (firstLine, parentText) {
        var firstLineSplit = parentText[0].text.split(' ', 2);
        for (var i = firstLine + 1; i <= firstLine + firstLineSplit[0].length + 1; i++) {
            if (this.element.selectionStart === i || this.element.selectionEnd === i) {
                return false;
            }
        }
        return true;
    };
    MDTable.prototype.ensureEndValid = function (lastLine, formatSplitLength) {
        for (var i = lastLine + 1; i <= lastLine + formatSplitLength + 1; i++) {
            if (this.element.selectionEnd === i) {
                return false;
            }
        }
        return true;
    };
    MDTable.prototype.updateValueWithFormat = function (formatSplit, text) {
        var textApplyFormat = this.element.value.substring(this.element.selectionEnd, this.element.value.length);
        text += textApplyFormat.replace(textApplyFormat, (formatSplit[0] + ' ' + textApplyFormat));
        return this.element.value.substr(0, this.element.selectionStart) + text;
    };
    MDTable.prototype.updateValue = function (text) {
        return this.element.value.substr(0, this.element.selectionStart) + text +
            this.element.value.substr(this.element.selectionEnd, this.element.value.length);
    };
    MDTable.prototype.checkValid = function (start, end, text, textAreaInitial, 
    // eslint-disable-next-line
    e, formatSplit, parentText, syntaxArr) {
        if (this.ensureStartValid(parentText[0].start, parentText) &&
            this.ensureEndValid(parentText[parentText.length - 1].start, formatSplit[0].length)) {
            if (start === parentText[0].start) {
                if (start !== end && end !== (parentText[parentText.length - 1].end - 1)) {
                    this.element.value = this.updateValueWithFormat(formatSplit, text);
                }
                else {
                    this.element.value = this.updateValue(text);
                }
            }
            else if (end === parentText[parentText.length - 1].end - 1) {
                this.element.value = this.updateValue(text);
            }
            else {
                this.element.value = this.updateValueWithFormat(formatSplit, text);
            }
            this.makeSelection(textAreaInitial, start, end);
        }
    };
    MDTable.prototype.convertToLetters = function (rowNumber) {
        var baseChar = ('A').charCodeAt(0);
        var letters = '';
        do {
            rowNumber -= 1;
            letters = String.fromCharCode(baseChar + (rowNumber % 26)) + letters;
            rowNumber = (rowNumber / 26) >> 0;
        } while (rowNumber > 0);
        return letters;
    };
    MDTable.prototype.textNonEmpty = function () {
        var emptyText = '';
        if (this.isCursorBased() || this.isSelectionBased()) {
            if (this.element.value.length > 0) {
                emptyText += this.insertLine();
                emptyText += this.insertLine(); // to append two new line when textarea having content.
            }
        }
        return emptyText;
    };
    MDTable.prototype.isCursorBased = function () {
        return this.element.selectionStart === this.element.selectionEnd;
    };
    MDTable.prototype.isSelectionBased = function () {
        return this.element.selectionStart !== this.element.selectionEnd;
    };
    MDTable.prototype.restore = function (start, end, event) {
        this.selection.save(start, end);
        this.selection.restore(this.element);
        if (event && event.callBack) {
            event.callBack({
                requestType: event.subCommand,
                selectedText: this.selection.getSelectedText(this.element),
                editorMode: 'Markdown',
                event: event.event
            });
        }
    };
    return MDTable;
}());
export { MDTable };
