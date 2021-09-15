import { PdfViewer, PdfViewerBase } from '../..';
import { PointModel } from '@syncfusion/ej2-drawings';
import { PdfAnnotationBaseModel } from '../drawing/pdf-annotation-model';
/**
 * @hidden
 */
export declare class InputElement {
    private pdfViewer;
    private pdfViewerBase;
    /**
     * @private
     */
    inputBoxElement: any;
    /**
     * @private
     */
    isInFocus: boolean;
    /**
     * @private
     */
    maxHeight: number;
    /**
     * @private
     */
    maxWidth: number;
    /**
     * @private
     */
    fontSize: number;
    constructor(pdfviewer: PdfViewer, pdfViewerBase: PdfViewerBase);
    /**
     * @param currentPosition
     * @param annotation
     * @private
     */
    editLabel(currentPosition: PointModel, annotation: PdfAnnotationBaseModel): void;
    /**
     * @private
     */
    onFocusOutInputBox(): void;
    /**
     * @param bounds
     * @param pageIndex
     * @param bounds
     * @param pageIndex
     * @private
     */
    calculateLabelBounds(bounds: any, pageIndex?: number): any;
    /**
     * @param bounds
     * @private
     */
    calculateLabelBoundsFromLoadedDocument(bounds: any): any;
}
