import * as CONSTANT from './../base/constant';
import { InsertHtml } from './inserthtml';
/**
 * Selection EXEC internal component
 *
 * @hidden

 */
var InsertHtmlExec = /** @class */ (function () {
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - sepcifies the parent element
     * @hidden

     */
    function InsertHtmlExec(parent) {
        this.parent = parent;
        this.addEventListener();
    }
    InsertHtmlExec.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.INSERTHTML_TYPE, this.applyHtml, this);
    };
    InsertHtmlExec.prototype.applyHtml = function (e) {
        InsertHtml.Insert(this.parent.currentDocument, e.value, this.parent.editableElement, true);
        if (e.subCommand === 'pasteCleanup') {
            var pastedElements = this.parent.editableElement.querySelectorAll('.pasteContent_RTE');
            var allPastedElements = [].slice.call(pastedElements);
            var imgElements = this.parent.editableElement.querySelectorAll('.pasteContent_Img');
            var allImgElm = [].slice.call(imgElements);
            e.callBack({
                requestType: e.subCommand,
                editorMode: 'HTML',
                elements: allPastedElements,
                imgElem: allImgElm
            });
        }
        else {
            if (e.callBack) {
                e.callBack({
                    requestType: e.subCommand,
                    editorMode: 'HTML',
                    event: e.event,
                    range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                    elements: this.parent.nodeSelection.getSelectedNodes(this.parent.currentDocument)
                });
            }
        }
    };
    return InsertHtmlExec;
}());
export { InsertHtmlExec };
