import { RichTextEditor, HtmlEditor } from '@syncfusion/ej2-richtexteditor';
import { MarkdownEditor, Toolbar, Link, Image, QuickToolbar, Table, FileManager } from '@syncfusion/ej2-richtexteditor';
import { Base } from './base-module';
/**
 * The `RTE` module is used configure the properties of RTE type editor.
 */
var Rte = /** @class */ (function () {
    function Rte(parent) {
        this.compObj = undefined;
        RichTextEditor.Inject(HtmlEditor, MarkdownEditor, Toolbar, Link, Image, QuickToolbar, Table, FileManager);
        this.parent = parent;
        this.parent.rteModule = this;
        this.base = new Base(this.parent, this);
    }
    Rte.prototype.render = function (e) {
        this.compObj = new RichTextEditor(this.parent.model);
        this.compObj.appendTo(e.target);
    };
    Rte.prototype.focus = function () {
        this.compObj.focusIn();
    };
    Rte.prototype.updateValue = function (e) {
        if (this.compObj && e.type === 'RTE') {
            this.parent.setProperties({ value: this.getRteValue() }, true);
            this.parent.extendModelValue(this.compObj.value);
        }
    };
    Rte.prototype.getRteValue = function () {
        var rteVal;
        if (this.compObj.editorMode === 'Markdown') {
            rteVal = this.compObj.contentModule.getEditPanel().value;
            return (rteVal === '') ? '' : rteVal;
        }
        else {
            rteVal = this.compObj.contentModule.getEditPanel().innerHTML;
            return (rteVal === '<p><br></p>' || rteVal === '&lt;p&gt;&lt;br&gt;&lt;/p&gt;' || rteVal === '') ? '' : rteVal;
        }
    };
    Rte.prototype.refresh = function () {
        this.compObj.refresh();
    };
    /**
     * Destroys the rte module.
     *
     * @function destroy
     * @returns {void}
     * @hidden
     */
    Rte.prototype.destroy = function () {
        this.base.destroy();
    };
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string
     */
    Rte.prototype.getModuleName = function () {
        return 'rte';
    };
    return Rte;
}());
export { Rte };
