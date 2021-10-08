import { KeyboardEventArgs } from '@syncfusion/ej2-base';
import { IRichTextEditor } from '../base/interface';
/**
 * `FullScreen` module is used to maximize and minimize screen
 */
export declare class FullScreen {
    protected parent: IRichTextEditor;
    private scrollableParent;
    constructor(parent?: IRichTextEditor);
    /**
     * showFullScreen method
     *
     * @param {MouseEvent} event - specifies the mouse event
     * @returns {void}
     * @hidden

     */
    showFullScreen(event?: MouseEvent | KeyboardEventArgs): void;
    /**
     * hideFullScreen method
     *
     * @param {MouseEvent} event - specifies the mouse event
     * @returns {void}
     * @hidden

     */
    hideFullScreen(event?: MouseEvent | KeyboardEventArgs): void;
    private toggleParentOverflow;
    private onKeyDown;
    protected addEventListener(): void;
    protected removeEventListener(): void;
    /**
     * destroy method
     *
     * @returns {void}
     * @hidden

     */
    destroy(): void;
}
