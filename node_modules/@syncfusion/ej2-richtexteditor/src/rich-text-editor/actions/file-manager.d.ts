import { Dialog } from '@syncfusion/ej2-popups';
import { IRichTextEditor } from '../base/interface';
/**
 * `FileManager` module is used to display the directories and images inside the editor.
 */
export declare class FileManager {
    private i10n;
    dialogObj: Dialog;
    private fileWrap;
    private fileObj;
    private contentModule;
    protected parent: IRichTextEditor;
    private inputUrl;
    private selectObj;
    private dlgButtons;
    private dialogRenderObj;
    private rendererFactory;
    private constructor();
    private initialize;
    private render;
    private renderFileManager;
    private getInputUrlElement;
    private insertImageUrl;
    private cancelDialog;
    private onDocumentClick;
    private addEventListener;
    private removeEventListener;
    private destroyComponents;
    private destroy;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {string} - returns the string value
     * @hidden
     */
    private getModuleName;
}
