import * as CONSTANT from './../base/constant';
import { SelectionCommands } from './selection-commands';
import * as EVENTS from './../../common/constant';
/**
 * Selection EXEC internal component
 *
 * @hidden

 */
var SelectionBasedExec = /** @class */ (function () {
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden

     */
    function SelectionBasedExec(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    SelectionBasedExec.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.SELECTION_TYPE, this.applySelection, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.keyDownHandler, this);
    };
    SelectionBasedExec.prototype.keyDownHandler = function (e) {
        var validFormats = ['bold', 'italic', 'underline', 'strikethrough', 'superscript',
            'subscript', 'uppercase', 'lowercase'];
        if (e.event.ctrlKey && validFormats.indexOf(e.event.action) > -1) {
            e.event.preventDefault();
            SelectionCommands.applyFormat(this.parent.currentDocument, e.event.action, this.parent.editableElement, e.enterAction);
            this.callBack(e, e.event.action);
        }
    };
    SelectionBasedExec.prototype.applySelection = function (e) {
        SelectionCommands.applyFormat(this.parent.currentDocument, e.subCommand.toLocaleLowerCase(), this.parent.editableElement, e.enterAction, e.value, e.selector);
        this.callBack(e, e.subCommand);
    };
    SelectionBasedExec.prototype.callBack = function (event, action) {
        if (event.callBack) {
            event.callBack({
                requestType: action,
                event: event.event,
                editorMode: 'HTML',
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.nodeSelection.getSelectedNodes(this.parent.currentDocument)
            });
        }
    };
    return SelectionBasedExec;
}());
export { SelectionBasedExec };
