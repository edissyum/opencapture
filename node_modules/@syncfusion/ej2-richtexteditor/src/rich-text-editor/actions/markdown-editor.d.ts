import { IRichTextEditor } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { RichTextEditorModel } from '../base/rich-text-editor-model';
/**
 * `MarkdownEditor` module is used to markdown editor
 */
export declare class MarkdownEditor {
    private parent;
    private locator;
    private contentRenderer;
    private renderFactory;
    private toolbarUpdate;
    private saveSelection;
    private mdSelection;
    constructor(parent?: IRichTextEditor, serviceLocator?: ServiceLocator);
    /**
     * Destroys the Markdown.
     *
     * @function destroy
     * @returns {void}
     * @hidden

     */
    destroy(): void;
    private addEventListener;
    private updateReadOnly;
    private onSelectionSave;
    private onSelectionRestore;
    private onToolbarClick;
    private instantiateRenderer;
    private removeEventListener;
    private render;
    /**
     * Called internally if any of the property value changed.
     *
     * @param {RichTextEditorModel} e - specifies the editor model
     * @returns {void}
     * @hidden

     */
    protected onPropertyChanged(e: {
        [key: string]: RichTextEditorModel;
    }): void;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     */
    private getModuleName;
    /**
     * For selecting all content in RTE
     *
     * @returns {void}
     * @private
     */
    private selectAll;
    /**
     * For get a selected text in RTE
     *
     * @param {NotifyArgs} e - specifies the arguments.
     * @returns {void}
     * @private
     */
    private getSelectedHtml;
}
