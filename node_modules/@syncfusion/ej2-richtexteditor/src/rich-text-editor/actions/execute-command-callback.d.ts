import { IRichTextEditor } from '../base/interface';
/**
 * `ExecCommandCallBack` module is used to run the editor manager command
 */
export declare class ExecCommandCallBack {
    protected parent: IRichTextEditor;
    constructor(parent?: IRichTextEditor);
    private addEventListener;
    private commandCallBack;
    private removeEventListener;
}
