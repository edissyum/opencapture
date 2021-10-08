import { InkAnnotationSettings } from './../pdfviewer';
import { IPoint, PdfViewer } from '../index';
import { PdfViewerBase } from '../index';
import { AnnotationSelectorSettingsModel } from '../pdfviewer-model';
export declare class InkAnnotation {
    private pdfViewer;
    private pdfViewerBase;
    newObject: any;
    /**
     * @private
     */
    outputString: string;
    /**
     * @private
     */
    mouseX: number;
    /**
     * @private
     */
    mouseY: number;
    /**
     * @private
     */
    inkAnnotationindex: any;
    /**
     * @private
     */
    isAddAnnotationProgramatically: boolean;
    /**
     * @private
     */
    currentPageNumber: string;
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase);
    /**
     * @private
     */
    drawInk(): void;
    drawInkAnnotation(pageNumber?: number): void;
    /**
     * @private
     */
    storePathData(): void;
    /**
     * @param position
     * @param pageIndex
     * @private
     */
    drawInkInCanvas(position: any, pageIndex: number): void;
    private convertToPath;
    private linePath;
    private movePath;
    /**
     * @param pageNumber
     * @private
     */
    addInk(pageNumber?: number): any;
    /**
     * @private
     */
    setAnnotationMode(): void;
    saveInkSignature(): string;
    /**
     * @param pageNumber
     * @param annotationBase
     * @param pageNumber
     * @param annotationBase
     * @private
     */
    addInCollection(pageNumber: number, annotationBase: any): void;
    private calculateInkSize;
    /**
     * @param annotationCollection
     * @param pageIndex
     * @param isImport
     * @private
     */
    renderExistingInkSignature(annotationCollection: any, pageIndex: number, isImport: boolean): void;
    /**
     * @param pageNumber
     * @param annotations
     * @private
     */
    storeInkSignatureData(pageNumber: number, annotations: any): void;
    getSelector(type: string, subject: string): AnnotationSelectorSettingsModel;
    private getAnnotations;
    /**
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @param property
     * @param pageNumber
     * @param annotationBase
     * @private
     */
    modifySignatureInkCollection(property: string, pageNumber: number, annotationBase: any): any;
    private manageInkAnnotations;
    /**
     * @param currentAnnotation
     * @param pageIndex
     * @param isImport
     * @param currentAnnotation
     * @param pageIndex
     * @param isImport
     * @private
     */
    updateInkCollections(currentAnnotation: any, pageIndex: number, isImport?: boolean): any;
    /**
     * This method used to add annotations with using program.
     *
     * @param annotationObject - It describes type of annotation object
     * @param offset - It describes about the annotation bounds or location
     * @param pageNumber - It describes about the annotation page number
     * @returns Object
     * @private
     */
    updateAddAnnotationDetails(annotationObject: InkAnnotationSettings, offset: IPoint, pageNumber: number): Object;
}
