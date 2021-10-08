import { PdfViewer, IContextMenu } from '../index';
import { PdfViewerBase } from './pdfviewer-base';
/**
 * ContextMenu module is used to handle the context menus used in the control.
 *
 * @hidden
 */
export declare class BlazorContextMenu implements IContextMenu {
    /**
     * @private
     */
    contextMenuElement: HTMLElement;
    private pdfViewer;
    private pdfViewerBase;
    currentTarget: any;
    /**
     * @private
     */
    previousAction: string;
    /**
     * Initialize the constructor of blazorcontext
     *
     * @param { PdfViewer } pdfViewer - Specified PdfViewer class.
     * @param { PdfViewerBase } pdfViewerBase - The pdfViewerBase.
     */
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase);
    /**
     * Create the context menu.
     * @returns {void}
     */
    createContextMenu(): void;
    /**
     * open the context menu.
     * @param {number} top - The top.
     * @param {number} left - The left.
     * @param {HTMLElement} target - The target.
     * @returns {void}
     */
    open(top: number, left: number, target: HTMLElement): void;
    /**
     * close the context menu.
     * @returns {void}
     */
    close(): void;
    /**
     * destroy the context menu.
     * @returns {void}
     */
    destroy(): void;
    OnItemSelected(selectedMenu: any): void;
}
