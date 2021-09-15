import { IRenderer, IRichTextEditor } from '../base/interface';
import { BaseQuickToolbar } from '../actions/base-quick-toolbar';
/**
 * `Popup renderer` module is used to render popup in RichTextEditor.
 *
 * @hidden

 */
export declare class PopupRenderer implements IRenderer {
    private popupObj;
    private popupPanel;
    protected parent: IRichTextEditor;
    /**
     * Constructor for popup renderer module
     *
     * @param {IRichTextEditor} parent - specifies the parent.
     */
    constructor(parent?: IRichTextEditor);
    private quickToolbarOpen;
    /**
     * renderPopup method
     *
     * @param {BaseQuickToolbar} args - specifies  the arguments.
     * @returns {void}
     * @hidden

     */
    renderPopup(args: BaseQuickToolbar): void;
    /**
     * The function is used to add popup class in Quick Toolbar
     *
     * @returns {void}
     * @hidden

     */
    renderPanel(): void;
    /**
     * Get the popup element of RichTextEditor
     *
     * @returns {Element} - specifies the element
     * @hidden

     */
    getPanel(): Element;
    /**
     * Set the popup element of RichTextEditor
     *
     * @returns {void}
     * @param  {Element} panel - specifies the element
     * @hidden

     */
    setPanel(panel: Element): void;
}
