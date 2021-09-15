import { IRichTextEditor } from '../base/interface';
import { IToolbarStatus } from '../../common/interface';
/**
 * HtmlToolbarStatus module for refresh the toolbar status
 */
export declare class HtmlToolbarStatus {
    parent: IRichTextEditor;
    toolbarStatus: IToolbarStatus;
    private prevToolbarStatus;
    constructor(parent: IRichTextEditor);
    private addEventListener;
    private removeEventListener;
    private onRefreshHandler;
}
