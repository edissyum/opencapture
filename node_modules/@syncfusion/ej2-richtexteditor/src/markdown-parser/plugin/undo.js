import { debounce, isNullOrUndefined } from '@syncfusion/ej2-base';
import * as EVENTS from './../../common/constant';
/**
 * `Undo` module is used to handle undo actions.
 */
var UndoRedoCommands = /** @class */ (function () {
    function UndoRedoCommands(parent, options) {
        this.undoRedoStack = [];
        this.parent = parent;
        this.undoRedoSteps = !isNullOrUndefined(options) ? options.undoRedoSteps : 30;
        this.undoRedoTimer = !isNullOrUndefined(options) ? options.undoRedoTimer : 300;
        this.selection = this.parent.markdownSelection;
        this.addEventListener();
    }
    UndoRedoCommands.prototype.addEventListener = function () {
        var debounceListener = debounce(this.keyUp, this.undoRedoTimer);
        this.parent.observer.on(EVENTS.KEY_UP_HANDLER, debounceListener, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.keyDown, this);
        this.parent.observer.on(EVENTS.ACTION, this.onAction, this);
        this.parent.observer.on(EVENTS.MODEL_CHANGED_PLUGIN, this.onPropertyChanged, this);
    };
    UndoRedoCommands.prototype.onPropertyChanged = function (props) {
        for (var _i = 0, _a = Object.keys(props.newProp); _i < _a.length; _i++) {
            var prop = _a[_i];
            switch (prop) {
                case 'undoRedoSteps':
                    this.undoRedoSteps = props.newProp.undoRedoSteps;
                    break;
                case 'undoRedoTimer':
                    this.undoRedoTimer = props.newProp.undoRedoTimer;
                    break;
            }
        }
    };
    UndoRedoCommands.prototype.removeEventListener = function () {
        var debounceListener = debounce(this.keyUp, 300);
        this.parent.observer.off(EVENTS.KEY_UP_HANDLER, debounceListener);
        this.parent.observer.off(EVENTS.KEY_DOWN_HANDLER, this.keyDown);
        this.parent.observer.off(EVENTS.ACTION, this.onAction);
        this.parent.observer.off(EVENTS.MODEL_CHANGED_PLUGIN, this.onPropertyChanged);
    };
    /**
     * Destroys the ToolBar.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    UndoRedoCommands.prototype.destroy = function () {
        this.removeEventListener();
    };
    /**
     * onAction method
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @returns {void}
     * @hidden

     */
    UndoRedoCommands.prototype.onAction = function (e) {
        if (e.subCommand === 'Undo') {
            this.undo(e);
        }
        else {
            this.redo(e);
        }
    };
    UndoRedoCommands.prototype.keyDown = function (e) {
        var event = e.event;
        // eslint-disable-next-line
        var proxy = this;
        switch (event.action) {
            case 'undo':
                event.preventDefault();
                proxy.undo(e);
                break;
            case 'redo':
                event.preventDefault();
                proxy.redo(e);
                break;
        }
    };
    UndoRedoCommands.prototype.keyUp = function (e) {
        if (e.event.keyCode !== 17 && !e.event.ctrlKey) {
            this.saveData(e);
        }
    };
    /**
     * MD collection stored string format.
     *
     * @param {KeyboardEvent} e - specifies the key board event
     * @function saveData
     * @returns {void}
     * @hidden

     */
    UndoRedoCommands.prototype.saveData = function (e) {
        var textArea = this.parent.element;
        this.selection.save(textArea.selectionStart, textArea.selectionEnd);
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var textValue = this.parent.element.value;
        var changEle = { text: textValue, start: start, end: end };
        if (this.undoRedoStack.length >= this.steps) {
            this.undoRedoStack = this.undoRedoStack.slice(0, this.steps + 1);
        }
        if (this.undoRedoStack.length > 1 && (this.undoRedoStack[this.undoRedoStack.length - 1].start === start) &&
            (this.undoRedoStack[this.undoRedoStack.length - 1].end === end)) {
            return;
        }
        this.undoRedoStack.push(changEle);
        this.steps = this.undoRedoStack.length - 1;
        if (this.steps > this.undoRedoSteps) {
            this.undoRedoStack.shift();
            this.steps--;
        }
        if (e && e.callBack) {
            e.callBack();
        }
    };
    /**
     * Undo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function undo
     * @returns {void}
     * @hidden

     */
    UndoRedoCommands.prototype.undo = function (e) {
        if (this.steps > 0) {
            this.currentAction = 'Undo';
            var start = this.undoRedoStack[this.steps - 1].start;
            var end = this.undoRedoStack[this.steps - 1].end;
            var removedContent = this.undoRedoStack[this.steps - 1].text;
            this.parent.element.value = removedContent;
            this.parent.element.focus();
            this.steps--;
            this.restore(this.parent.element, start, end, e);
        }
    };
    /**
     * Redo the editable text.
     *
     * @param {IMarkdownSubCommands} e - specifies the sub commands
     * @function redo
     * @returns {void}
     * @hidden

     */
    UndoRedoCommands.prototype.redo = function (e) {
        if (this.undoRedoStack[this.steps + 1] != null) {
            this.currentAction = 'Redo';
            var start = this.undoRedoStack[this.steps + 1].start;
            var end = this.undoRedoStack[this.steps + 1].end;
            this.parent.element.value = this.undoRedoStack[this.steps + 1].text;
            this.parent.element.focus();
            this.steps++;
            this.restore(this.parent.element, start, end, e);
        }
    };
    UndoRedoCommands.prototype.restore = function (textArea, start, end, event) {
        this.selection.save(start, end);
        this.selection.restore(textArea);
        if (event && event.callBack) {
            event.callBack({
                requestType: this.currentAction,
                selectedText: this.selection.getSelectedText(textArea),
                editorMode: 'Markdown',
                event: event.event
            });
        }
    };
    /**
     * getUndoStatus method
     *
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    UndoRedoCommands.prototype.getUndoStatus = function () {
        var status = { undo: false, redo: false };
        if (this.steps > 0) {
            status.undo = true;
        }
        if (this.undoRedoStack[this.steps + 1] != null) {
            status.redo = true;
        }
        return status;
    };
    return UndoRedoCommands;
}());
export { UndoRedoCommands };
