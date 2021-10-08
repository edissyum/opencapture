/**
 * MarkdownSelection internal module
 *
 * @hidden

 */
var MarkdownSelection = /** @class */ (function () {
    function MarkdownSelection() {
    }
    /**
     * markdown getLineNumber method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} point - specifies the number value
     * @returns {number} - returns the value
     * @hidden

     */
    MarkdownSelection.prototype.getLineNumber = function (textarea, point) {
        return textarea.value.substr(0, point).split('\n').length;
    };
    /**
     * markdown getSelectedText method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - specifies the string value
     * @hidden

     */
    MarkdownSelection.prototype.getSelectedText = function (textarea) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        return textarea.value.substring(start, end);
    };
    /**
     * markdown getAllParents method
     *
     * @param {string} value - specifies the string value
     * @returns {string[]} - returns the string value
     * @hidden

     */
    MarkdownSelection.prototype.getAllParents = function (value) {
        return value.split('\n');
    };
    /**
     * markdown getSelectedLine method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - returns the string value
     * @hidden

     */
    MarkdownSelection.prototype.getSelectedLine = function (textarea) {
        var lines = this.getAllParents(textarea.value);
        var index = this.getLineNumber(textarea, textarea.selectionStart);
        return lines[index - 1];
    };
    /**
     * markdown getLine method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} index - specifies the number value
     * @returns {string} - returns the string value
     * @hidden

     */
    MarkdownSelection.prototype.getLine = function (textarea, index) {
        var lines = this.getAllParents(textarea.value);
        return lines[index];
    };
    /**
     * markdown getSelectedParentPoints method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - returns the string value
     * @hidden

     */
    MarkdownSelection.prototype.getSelectedParentPoints = function (textarea) {
        var lines = this.getAllParents(textarea.value);
        var start = this.getLineNumber(textarea, textarea.selectionStart);
        var end = this.getLineNumber(textarea, textarea.selectionEnd);
        var parents = this.getSelectedText(textarea).split('\n');
        var selectedPoints = [];
        var selectedLine = lines[start - 1];
        var startLength = lines.slice(0, start - 1).join('').length;
        var firstPoint = {};
        firstPoint.line = start - 1;
        firstPoint.start = startLength + firstPoint.line;
        firstPoint.end = selectedLine !== '' ? firstPoint.start +
            selectedLine.length + 1 : firstPoint.start + selectedLine.length;
        firstPoint.text = selectedLine;
        selectedPoints.push(firstPoint);
        if (parents.length > 1) {
            for (var i = 1; i < parents.length - 1; i++) {
                var points = {};
                points.line = selectedPoints[i - 1].line + 1;
                points.start = parents[i] !== '' ? selectedPoints[i - 1].end : selectedPoints[i - 1].end;
                points.end = points.start + parents[i].length + 1;
                points.text = parents[i];
                selectedPoints.push(points);
            }
            var lastPoint = {};
            lastPoint.line = selectedPoints[selectedPoints.length - 1].line + 1;
            lastPoint.start = selectedPoints[selectedPoints.length - 1].end;
            lastPoint.end = lastPoint.start + lines[end - 1].length + 1;
            lastPoint.text = lines[end - 1];
            selectedPoints.push(lastPoint);
        }
        return selectedPoints;
    };
    /**
     * markdown setSelection method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} start - specifies the start vaulue
     * @param {number} end - specifies the end value
     * @returns {void}
     * @hidden

     */
    MarkdownSelection.prototype.setSelection = function (textarea, start, end) {
        textarea.setSelectionRange(start, end);
        textarea.focus();
    };
    /**
     * markdown save method
     *
     * @param {number} start - specifies the start vaulue
     * @param {number} end - specifies the end value
     * @returns {void}
     * @hidden

     */
    MarkdownSelection.prototype.save = function (start, end) {
        this.selectionStart = start;
        this.selectionEnd = end;
    };
    /**
     * markdown restore method
     *
     * @param {HTMLTextAreaElement} textArea - specifies the text area element
     * @returns {void}
     * @hidden

     */
    MarkdownSelection.prototype.restore = function (textArea) {
        this.setSelection(textArea, this.selectionStart, this.selectionEnd);
    };
    /**
     * markdown isStartWith method
     *
     * @param {string} line - specifies the string value
     * @param {string} command - specifies the string value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    MarkdownSelection.prototype.isStartWith = function (line, command) {
        var isStart = false;
        if (line) {
            var reg = line.trim() === command.trim() ?
                new RegExp('^(' + this.replaceSpecialChar(command.trim()) + ')', 'gim') :
                new RegExp('^(' + this.replaceSpecialChar(command) + ')', 'gim');
            isStart = reg.test(line.trim());
        }
        return isStart;
    };
    /**
     * markdown replaceSpecialChar method
     *
     * @param {string} value - specifies the string value
     * @returns {string} - returns the value
     * @hidden

     */
    MarkdownSelection.prototype.replaceSpecialChar = function (value) {
        // eslint-disable-next-line
        return value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, '\\$&');
    };
    /**
     * markdown isClear method
     *
     * @param {string} parents - specifies the parent element
     * @param {string} regex - specifies the regex value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    MarkdownSelection.prototype.isClear = function (parents, regex) {
        var isClear = false;
        for (var i = 0; i < parents.length; i++) {
            if (new RegExp(regex, 'gim').test(parents[i].text)) {
                return true;
            }
        }
        return isClear;
    };
    /**
     * markdown getSelectedInlinePoints method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area
     * @returns {void}
     * @hidden

     */
    MarkdownSelection.prototype.getSelectedInlinePoints = function (textarea) {
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var selection = this.getSelectedText(textarea);
        return { start: start, end: end, text: selection };
    };
    return MarkdownSelection;
}());
export { MarkdownSelection };
