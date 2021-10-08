import { MarkdownSelection } from '../../markdown-parser/plugin/markdown-selection';
import * as events from '../base/constant';
import { getDefaultMDTbStatus } from '../../common/util';
/**
 * MarkdownToolbarStatus module for refresh the toolbar status
 */
var MarkdownToolbarStatus = /** @class */ (function () {
    function MarkdownToolbarStatus(parent) {
        this.toolbarStatus = this.prevToolbarStatus = getDefaultMDTbStatus();
        this.selection = new MarkdownSelection();
        this.parent = parent;
        this.element = this.parent.contentModule.getEditPanel();
        this.addEventListener();
    }
    MarkdownToolbarStatus.prototype.addEventListener = function () {
        this.parent.on(events.toolbarRefresh, this.onRefreshHandler, this);
        this.parent.on(events.destroy, this.removeEventListener, this);
    };
    MarkdownToolbarStatus.prototype.removeEventListener = function () {
        this.parent.off(events.toolbarRefresh, this.onRefreshHandler);
        this.parent.off(events.destroy, this.removeEventListener);
    };
    MarkdownToolbarStatus.prototype.onRefreshHandler = function (args) {
        var parentsLines = this.selection.getSelectedParentPoints(this.element);
        this.toolbarStatus = {
            orderedlist: args.documentNode ? false : this.isListsApplied(parentsLines, 'OL'),
            unorderedlist: args.documentNode ? false : this.isListsApplied(parentsLines, 'UL'),
            formats: this.currentFormat(parentsLines, args.documentNode),
            bold: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('Bold'),
            italic: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('Italic'),
            inlinecode: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('InlineCode'),
            strikethrough: args.documentNode ? false :
                this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('StrikeThrough'),
            subscript: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('SubScript'),
            superscript: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('SuperScript'),
            uppercase: args.documentNode ? false : this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('UpperCase')
        };
        if (this.parent.formatter.editorManager.mdSelectionFormats.isAppliedCommand('InlineCode')) {
            this.toolbarStatus.formats = 'pre';
        }
        var tbStatusString = JSON.stringify(this.toolbarStatus);
        this.parent.notify(events.toolbarUpdated, this.toolbarStatus);
        if (JSON.stringify(this.prevToolbarStatus) !== tbStatusString) {
            this.parent.notify(events.updateTbItemsStatus, { html: null, markdown: JSON.parse(tbStatusString) });
            this.prevToolbarStatus = JSON.parse(tbStatusString);
        }
    };
    MarkdownToolbarStatus.prototype.isListsApplied = function (lines, type) {
        var isApply = true;
        if (type === 'OL') {
            for (var i = 0; i < lines.length; i++) {
                var lineSplit = lines[i].text.trim().split(' ', 2)[0] + ' ';
                if (!/^[\d.]+[ ]+$/.test(lineSplit)) {
                    isApply = false;
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < lines.length; i++) {
                if (!this.selection.isStartWith(lines[i].text, this.parent.formatter.listTags[type])) {
                    isApply = false;
                    break;
                }
            }
        }
        return isApply;
    };
    MarkdownToolbarStatus.prototype.currentFormat = function (lines, documentNode) {
        var format = 'p';
        var keys = Object.keys(this.parent.formatter.formatTags);
        var direction = this.element.selectionDirection;
        var checkLine = direction === 'backward' ? lines[0].text : lines[lines.length - 1].text;
        for (var i = 0; !documentNode && i < keys.length; i++) {
            if (keys[i] !== 'pre' && this.selection.isStartWith(checkLine, this.parent.formatter.formatTags[keys[i]])) {
                format = keys[i];
                break;
            }
            else if (keys[i] === 'pre') {
                if (this.codeFormat()) {
                    format = keys[i];
                    break;
                }
            }
        }
        return format;
    };
    MarkdownToolbarStatus.prototype.codeFormat = function () {
        var isFormat = false;
        var textArea = this.parent.inputElement;
        var start = textArea.selectionStart;
        var splitAt = function (index) { return function (x) { return [x.slice(0, index), x.slice(index)]; }; };
        var splitText = splitAt(start)(textArea.value);
        var cmdPre = this.parent.formatter.formatTags.pre;
        var selectedText = this.getSelectedText(textArea);
        if (selectedText !== '' && selectedText === selectedText.toLocaleUpperCase()) {
            return true;
        }
        else if (selectedText === '') {
            var beforeText = textArea.value.substr(splitText[0].length - 1, 1);
            var afterText = splitText[1].substr(0, 1);
            if ((beforeText !== '' && afterText !== '' && beforeText.match(/[a-z]/i)) &&
                beforeText === beforeText.toLocaleUpperCase() && afterText === afterText.toLocaleUpperCase()) {
                return true;
            }
        }
        if ((this.isCode(splitText[0], cmdPre) && this.isCode(splitText[1], cmdPre)) &&
            (splitText[0].match(this.multiCharRegx(cmdPre)).length % 2 === 1 &&
                splitText[1].match(this.multiCharRegx(cmdPre)).length % 2 === 1)) {
            isFormat = true;
        }
        return isFormat;
    };
    MarkdownToolbarStatus.prototype.getSelectedText = function (textarea) {
        return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    };
    MarkdownToolbarStatus.prototype.isCode = function (text, cmd) {
        return text.search('\\' + cmd + '') !== -1;
    };
    MarkdownToolbarStatus.prototype.multiCharRegx = function (cmd) {
        return new RegExp('(\\' + cmd + ')', 'g');
    };
    return MarkdownToolbarStatus;
}());
export { MarkdownToolbarStatus };
