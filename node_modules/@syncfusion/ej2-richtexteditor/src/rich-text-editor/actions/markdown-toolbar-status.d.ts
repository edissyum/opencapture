import { MarkdownSelection } from '../../markdown-parser/plugin/markdown-selection';
import { IRichTextEditor } from '../base/interface';
import { IToolbarStatus } from '../../common/interface';
/**
 * MarkdownToolbarStatus module for refresh the toolbar status
 */
export declare class MarkdownToolbarStatus {
    selection: MarkdownSelection;
    parent: IRichTextEditor;
    element: HTMLTextAreaElement;
    toolbarStatus: IToolbarStatus;
    private prevToolbarStatus;
    constructor(parent: IRichTextEditor);
    private addEventListener;
    private removeEventListener;
    private onRefreshHandler;
    private isListsApplied;
    private currentFormat;
    private codeFormat;
    private getSelectedText;
    private isCode;
    private multiCharRegx;
}
