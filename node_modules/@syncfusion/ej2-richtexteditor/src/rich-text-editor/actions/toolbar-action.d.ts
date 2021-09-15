import { IRichTextEditor } from '../base/interface';
/**
 * `ToolbarAction` module is used to toolbar click action
 */
export declare class ToolbarAction {
    protected parent: IRichTextEditor;
    private serviceLocator;
    constructor(parent?: IRichTextEditor);
    private addEventListener;
    private toolbarClick;
    private dropDownSelect;
    private renderSelection;
    private removeEventListener;
}
