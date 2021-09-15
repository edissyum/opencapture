import { PdfViewer, PdfViewerBase } from '../index';
/**
 * TextLayer module is used to handle the text content on the control.
 *
 * @hidden
 */
export declare class TextLayer {
    private pdfViewer;
    private pdfViewerBase;
    private notifyDialog;
    /**
     * @private
     */
    isMessageBoxOpen: boolean;
    private textBoundsArray;
    /**
     * @private
     */
    characterBound: any[];
    /**
     * @param {PdfViewer} pdfViewer - The PdfViewer.
     * @param {PdfViewerBase} pdfViewerBase - The PdfViewerBase.
     * @private
     */
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase);
    /**
     * @param {number} pageNumber - The pageNumber.
     * @param {number} pageWidth - The pageWidth.
     * @param {number} pageHeight - The pageHeight.
     * @param {HTMLElement} pageDiv - The pageDiv.
     * @returns {HTMLElement} - The HTMLElement.
     * @private
     */
    addTextLayer(pageNumber: number, pageWidth: number, pageHeight: number, pageDiv: HTMLElement): HTMLElement;
    /**
     * @param {number} pageNumber - The pageNumber.
     * @param {any} textContents - The textContents.
     * @param {any} textBounds - The textBounds.
     * @param {any} rotation - The rotation.
     * @returns {void}
     * @private
     */
    renderTextContents(pageNumber: number, textContents: any, textBounds: any, rotation: any): void;
    /**
     * @param pageNumber
     * @param textContents
     * @param textBounds
     * @param rotation
     * @param isTextSearch
     * @param pageNumber
     * @param textContents
     * @param textBounds
     * @param rotation
     * @param isTextSearch
     * @private
     */
    resizeTextContents(pageNumber: number, textContents: any, textBounds: any, rotation: any, isTextSearch?: boolean): void;
    private applyTextRotation;
    private setTextElementProperties;
    /**
     * @param {number} pageNumber - The pageNumber.
     * @returns {void}
     * @private
     */
    resizeTextContentsOnZoom(pageNumber: number): void;
    private resizeExcessDiv;
    /**
     * @private
     * @param {boolean} isPinchZoomed - The isPinchZoomed.
     * @returns {void}
     */
    clearTextLayers(isPinchZoomed?: boolean): void;
    private removeElement;
    private removeForeignObjects;
    /**
     * @param pageNumber
     * @param divId
     * @param fromOffset
     * @param toOffset
     * @param textString
     * @param className
     * @private
     */
    convertToSpan(pageNumber: number, divId: number, fromOffset: number, toOffset: number, textString: string, className: string): void;
    /**
     * @param startPage
     * @param endPage
     * @param anchorOffsetDiv
     * @param focusOffsetDiv
     * @param anchorOffset
     * @param focusOffset
     * @private
     */
    applySpanForSelection(startPage: number, endPage: number, anchorOffsetDiv: number, focusOffsetDiv: number, anchorOffset: number, focusOffset: number): void;
    /**
     * @private
     * @returns {void}
     */
    clearDivSelection(): void;
    private setStyleToTextDiv;
    private getTextSelectionStatus;
    /**
     * @param {boolean} isAdd - The isAdd.
     * @returns {void}
     * @private
     */
    modifyTextCursor(isAdd: boolean): void;
    /**
     * @param {Selection} selection - The Selection.
     * @returns {boolean} - Returns true or false.
     * @private
     */
    isBackWardSelection(selection: Selection): boolean;
    /**
     * @param {Node} element - The element.
     * @returns {number} - Returns number.
     * @private
     */
    getPageIndex(element: Node): number;
    /**
     * @param {Node} element - The element.
     * @param {number} pageIndex - The pageIndex.
     * @returns {number} - Returns number.
     * @private
     */
    getTextIndex(element: Node, pageIndex: number): number;
    private getPreviousZoomFactor;
    /**
     * @private
     * @returns {boolean} - Returns true or false.
     */
    getTextSearchStatus(): boolean;
    /**
     * @param {string} text - The text.
     * @returns {void}
     * @private
     */
    createNotificationPopup(text: string): void;
    /**
     * @returns {void}
     */
    private closeNotification;
}
