import { IRichTextEditor } from '../base/interface';
/**
 * `Resize` module is used to resize the editor
 */
export declare class Resize {
    protected parent: IRichTextEditor;
    protected resizer: HTMLElement;
    protected touchStartEvent: string;
    protected touchMoveEvent: string;
    protected touchEndEvent: string;
    private constructor();
    private addEventListener;
    private renderResizable;
    private resizeStart;
    private performResize;
    private stopResize;
    private getEventType;
    private isMouseEvent;
    private wireResizeEvents;
    private unwireResizeEvents;
    private destroy;
    private removeEventListener;
    /**
     * For internal use only - Get the module name.
     *
     * @returns {void}
     * @hidden
     */
    private getModuleName;
}
