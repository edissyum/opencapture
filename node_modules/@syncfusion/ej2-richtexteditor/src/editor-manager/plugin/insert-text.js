import * as CONSTANT from '../base/constant';
import { InsertHtml } from './inserthtml';
/**
 * Insert a Text Node or Text
 *
 * @hidden

 */
var InsertTextExec = /** @class */ (function () {
    /**
     * Constructor for creating the InsertText plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden

     */
    function InsertTextExec(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    InsertTextExec.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.INSERT_TEXT_TYPE, this.insertText, this);
    };
    InsertTextExec.prototype.insertText = function (e) {
        var node = document.createTextNode(e.value);
        InsertHtml.Insert(this.parent.currentDocument, node);
        if (e.callBack) {
            e.callBack({
                requestType: e.subCommand,
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.nodeSelection.getSelectedNodes(this.parent.currentDocument)
            });
        }
    };
    return InsertTextExec;
}());
export { InsertTextExec };
