import { IRenderer, IRichTextEditor } from '../base/interface';
/**
 * Markdown module is used to render Rich Text Editor as Markdown editor content
 *
 * @hidden

 */
export declare class MarkdownRender implements IRenderer {
    private contentPanel;
    protected parent: IRichTextEditor;
    protected editableElement: Element;
    /**
     * Constructor for content renderer module
     *
     * @param {IRichTextEditor} parent - specifies the parent.
     */
    constructor(parent?: IRichTextEditor);
    /**
     * The function is used to render Rich Text Editor content div
     *
     * @returns {void}
     * @hidden

     */
    renderPanel(): void;
    /**
     * Get the content div element of RichTextEditor
     *
     * @returns {Element} - specifies the element
     * @hidden

     */
    getPanel(): Element;
    /**
     * Get the editable element of RichTextEditor
     *
     * @returns {Element} - specifies the element
     * @hidden

     */
    getEditPanel(): Element;
    /**
     * Returns the text content as string.
     *
     * @returns {string} - specifies the string values.
     */
    getText(): string;
    /**
     * Set the content div element of RichTextEditor
     *
     * @param  {Element} panel - specifies the element.
     * @returns {void}
     * @hidden

     */
    setPanel(panel: Element): void;
    /**
     * Get the document of RichTextEditor
     *
     * @returns {void}
     * @hidden

     */
    getDocument(): Document;
}
