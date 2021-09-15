import { Formatter } from './formatter';
import { IEditorModel, IHtmlFormatterModel } from './../base/interface';
/**
 * HTML adapter
 *
 * @hidden

 */
export declare class HTMLFormatter extends Formatter {
    keyConfig: {
        [key: string]: string;
    };
    currentDocument: Document;
    element: Element;
    editorManager: IEditorModel;
    private toolbarUpdate;
    constructor(options?: IHtmlFormatterModel);
    private initialize;
    /**
     * Update the formatter of RichTextEditor
     *
     * @param  {Element} editElement - specifies the edit element.
     * @param  {Document} doc - specifies the doucment
     * @param {number} options - specifies the options
     * @returns {void}
     * @hidden

     */
    updateFormatter(editElement: Element, doc?: Document, options?: {
        [key: string]: number;
    }): void;
}
