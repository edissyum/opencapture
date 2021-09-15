import * as CONSTANT from './../base/constant';
import * as EVENTS from './../../common/constant';
import { isIDevice, setEditFrameFocus } from '../../common/util';
/**
 * Indents internal component
 *
 * @hidden

 */
var Indents = /** @class */ (function () {
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element
     * @hidden

     */
    function Indents(parent) {
        this.indentValue = 20;
        this.parent = parent;
        this.addEventListener();
    }
    Indents.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.INDENT_TYPE, this.applyIndents, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.onKeyDown, this);
    };
    Indents.prototype.onKeyDown = function (e) {
        switch (e.event.action) {
            case 'indents':
                this.applyIndents({ subCommand: 'Indent', callBack: e.callBack });
                e.event.preventDefault();
                break;
            case 'outdents':
                this.applyIndents({ subCommand: 'Outdent', callBack: e.callBack });
                e.event.preventDefault();
                break;
        }
    };
    Indents.prototype.applyIndents = function (e) {
        var editEle = this.parent.editableElement;
        var isRtl = editEle.classList.contains('e-rtl');
        var range = this.parent.nodeSelection.getRange(this.parent.currentDocument);
        var save = this.parent.nodeSelection.save(range, this.parent.currentDocument);
        this.parent.domNode.setMarker(save);
        var indentsNodes = this.parent.domNode.blockNodes();
        var parentNodes = indentsNodes.slice();
        var listsNodes = [];
        for (var i = 0; i < parentNodes.length; i++) {
            if (parentNodes[i].tagName !== 'LI' && 'LI' === parentNodes[i].parentNode.tagName) {
                indentsNodes.splice(indentsNodes.indexOf(parentNodes[i]), 1);
                listsNodes.push(parentNodes[i].parentNode);
            }
            else if (parentNodes[i].tagName === 'LI') {
                indentsNodes.splice(indentsNodes.indexOf(parentNodes[i]), 1);
                listsNodes.push(parentNodes[i]);
            }
        }
        if (listsNodes.length > 0) {
            this.parent.observer.notify(EVENTS.KEY_DOWN_HANDLER, {
                event: {
                    preventDefault: function () {
                        return;
                    },
                    stopPropagation: function () {
                        return;
                    },
                    shiftKey: (e.subCommand === 'Indent' ? false : true),
                    which: 9,
                    action: 'indent'
                },
                ignoreDefault: true
            });
        }
        for (var i = 0; i < indentsNodes.length; i++) {
            var parentNode = indentsNodes[i];
            var marginLeftOrRight = isRtl ? parentNode.style.marginRight : parentNode.style.marginLeft;
            var indentsValue = void 0;
            if (e.subCommand === 'Indent') {
                /* eslint-disable */
                indentsValue = marginLeftOrRight === '' ? this.indentValue + 'px' : parseInt(marginLeftOrRight, null) + this.indentValue + 'px';
                isRtl ? (parentNode.style.marginRight = indentsValue) : (parentNode.style.marginLeft = indentsValue);
            }
            else {
                indentsValue = (marginLeftOrRight === '' || marginLeftOrRight === '0px') ? '' : parseInt(marginLeftOrRight, null) - this.indentValue + 'px';
                isRtl ? (parentNode.style.marginRight = indentsValue) : (parentNode.style.marginLeft = indentsValue);
                /* eslint-enable */
            }
        }
        editEle.focus();
        if (isIDevice()) {
            setEditFrameFocus(editEle, e.selector);
        }
        save = this.parent.domNode.saveMarker(save);
        save.restore();
        if (e.callBack) {
            e.callBack({
                requestType: e.subCommand,
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: this.parent.domNode.blockNodes()
            });
        }
    };
    return Indents;
}());
export { Indents };
