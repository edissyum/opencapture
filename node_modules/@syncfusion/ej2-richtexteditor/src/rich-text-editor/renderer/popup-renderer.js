import { Popup } from '@syncfusion/ej2-popups';
import { CLS_QUICK_POP } from '../base/classes';
import { isBlazor } from '@syncfusion/ej2-base';
import * as events from '../base/constant';
/**
 * `Popup renderer` module is used to render popup in RichTextEditor.
 *
 * @hidden

 */
var PopupRenderer = /** @class */ (function () {
    /**
     * Constructor for popup renderer module
     *
     * @param {IRichTextEditor} parent - specifies the parent.
     */
    function PopupRenderer(parent) {
        this.parent = parent;
    }
    PopupRenderer.prototype.quickToolbarOpen = function () {
        var args = isBlazor() ? { element: this.popupObj.element } : this.popupObj;
        this.parent.trigger(events.quickToolbarOpen, args);
    };
    /**
     * renderPopup method
     *
     * @param {BaseQuickToolbar} args - specifies  the arguments.
     * @returns {void}
     * @hidden

     */
    PopupRenderer.prototype.renderPopup = function (args) {
        this.setPanel(args.element);
        this.renderPanel();
        args.popupObj = new Popup(args.element, {
            targetType: 'relative',
            relateTo: this.parent.element,
            open: this.quickToolbarOpen.bind(this)
        });
        this.popupObj = args.popupObj;
        args.popupObj.hide();
    };
    /**
     * The function is used to add popup class in Quick Toolbar
     *
     * @returns {void}
     * @hidden

     */
    PopupRenderer.prototype.renderPanel = function () {
        this.getPanel().classList.add(CLS_QUICK_POP);
    };
    /**
     * Get the popup element of RichTextEditor
     *
     * @returns {Element} - specifies the element
     * @hidden

     */
    PopupRenderer.prototype.getPanel = function () {
        return this.popupPanel;
    };
    /**
     * Set the popup element of RichTextEditor
     *
     * @returns {void}
     * @param  {Element} panel - specifies the element
     * @hidden

     */
    PopupRenderer.prototype.setPanel = function (panel) {
        this.popupPanel = panel;
    };
    return PopupRenderer;
}());
export { PopupRenderer };
