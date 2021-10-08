import * as CONSTANT from './../base/constant';
import { setStyleAttribute, closest } from '@syncfusion/ej2-base';
import * as EVENTS from './../../common/constant';
import { isIDevice, setEditFrameFocus } from '../../common/util';
/**
 * Formats internal component
 *
 * @hidden

 */
var Alignments = /** @class */ (function () {
    /**
     * Constructor for creating the Formats plugin
     *
     * @param {EditorManager} parent - specifies the parent element.
     * @returns {void}
     * @hidden

     */
    function Alignments(parent) {
        this.alignments = {
            'JustifyLeft': 'left',
            'JustifyCenter': 'center',
            'JustifyRight': 'right',
            'JustifyFull': 'justify'
        };
        this.parent = parent;
        this.addEventListener();
    }
    Alignments.prototype.addEventListener = function () {
        this.parent.observer.on(CONSTANT.ALIGNMENT_TYPE, this.applyAlignment, this);
        this.parent.observer.on(EVENTS.KEY_DOWN_HANDLER, this.onKeyDown, this);
    };
    Alignments.prototype.onKeyDown = function (e) {
        switch (e.event.action) {
            case 'justify-center':
                this.applyAlignment({ subCommand: 'JustifyCenter', callBack: e.callBack });
                e.event.preventDefault();
                break;
            case 'justify-full':
                this.applyAlignment({ subCommand: 'JustifyFull', callBack: e.callBack });
                e.event.preventDefault();
                break;
            case 'justify-left':
                this.applyAlignment({ subCommand: 'JustifyLeft', callBack: e.callBack });
                e.event.preventDefault();
                break;
            case 'justify-right':
                this.applyAlignment({ subCommand: 'JustifyRight', callBack: e.callBack });
                e.event.preventDefault();
                break;
        }
    };
    Alignments.prototype.getTableNode = function (range) {
        var startNode = range.startContainer.nodeType === Node.ELEMENT_NODE
            ? range.startContainer : range.startContainer.parentNode;
        var cellNode = closest(startNode, 'td,th');
        return [cellNode];
    };
    Alignments.prototype.applyAlignment = function (e) {
        var isTableAlign = e.value === 'Table' ? true : false;
        var range = this.parent.nodeSelection.getRange(this.parent.currentDocument);
        var save = this.parent.nodeSelection.save(range, this.parent.currentDocument);
        if (!isTableAlign) {
            this.parent.domNode.setMarker(save);
            var alignmentNodes = this.parent.domNode.blockNodes();
            for (var i = 0; i < alignmentNodes.length; i++) {
                var parentNode = alignmentNodes[i];
                setStyleAttribute(parentNode, { 'text-align': this.alignments[e.subCommand] });
            }
            var imageTags = this.parent.domNode.getImageTagInSelection();
            for (var i = 0; i < imageTags.length; i++) {
                var elementNode = [];
                elementNode.push(imageTags[i]);
                this.parent.imgObj.imageCommand({
                    item: {
                        selectNode: elementNode
                    },
                    subCommand: e.subCommand,
                    value: e.subCommand,
                    callBack: e.callBack,
                    selector: e.selector
                });
            }
            this.parent.editableElement.focus();
            save = this.parent.domNode.saveMarker(save);
            if (isIDevice()) {
                setEditFrameFocus(this.parent.editableElement, e.selector);
            }
            save.restore();
        }
        else {
            setStyleAttribute(this.getTableNode(range)[0], { 'text-align': this.alignments[e.subCommand] });
        }
        if (e.callBack) {
            e.callBack({
                requestType: e.subCommand,
                editorMode: 'HTML',
                event: e.event,
                range: this.parent.nodeSelection.getRange(this.parent.currentDocument),
                elements: (isTableAlign ? this.getTableNode(range) : this.parent.domNode.blockNodes())
            });
        }
    };
    return Alignments;
}());
export { Alignments };
