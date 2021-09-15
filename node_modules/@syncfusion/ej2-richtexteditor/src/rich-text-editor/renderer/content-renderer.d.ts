import { IRenderer, IRichTextEditor } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * Content module is used to render Rich Text Editor content
 *
 * @hidden

 */
export declare class ContentRender implements IRenderer {
    protected contentPanel: Element;
    protected parent: IRichTextEditor;
    protected editableElement: Element;
    private serviceLocator;
    /**
     * Constructor for content renderer module
     *
     * @param {IRichTextEditor} parent - specifies the parent element.
     * @param {ServiceLocator} serviceLocator - specifies the service.
     * @returns {void}
     */
    constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator);
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
     * @returns {Element} - specifies the element.
     * @hidden

     */
    getPanel(): Element;
    /**
     * Get the editable element of RichTextEditor
     *
     * @returns {Element} - specifies the return element.
     * @hidden

     */
    getEditPanel(): Element;
    /**
     * Returns the text content as string.
     *
     * @returns {string} - specifies the string element.
     */
    getText(): string;
    /**
     * Set the content div element of RichTextEditor
     *
     * @param {Element} panel - specifies the panel element.
     * @returns {void}
     * @hidden

     */
    setPanel(panel: Element): void;
    /**
     * Get the document of RichTextEditor
     *
     * @returns {Document} - specifies the document.
     * @hidden

     */
    getDocument(): Document;
}
