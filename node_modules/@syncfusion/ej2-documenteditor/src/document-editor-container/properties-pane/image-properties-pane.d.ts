import { DocumentEditorContainer } from '../document-editor-container';
/**
 * Image Property pane
 *
 * @private
 */
export declare class ImageProperties {
    private container;
    private elementId;
    element: HTMLElement;
    private widthElement;
    private heightElement;
    private widthNumericBox;
    private heightNumericBox;
    private aspectRatioBtn;
    private isMaintainAspectRatio;
    private isWidthApply;
    private isHeightApply;
    private isRtl;
    private readonly documentEditor;
    constructor(container: DocumentEditorContainer, isRtl?: boolean);
    /**
     * @private
     * @param {boolean} enable - enable/disable image properties pane.
     * @returns {void}
     */
    enableDisableElements(enable: boolean): void;
    private initializeImageProperties;
    private initImageProp;
    private createImagePropertiesDiv;
    wireEvents(): void;
    private onImageWidth;
    private onImageHeight;
    private applyImageWidth;
    private applyImageHeight;
    private onAspectRatioBtnClick;
    showImageProperties(isShow: boolean): void;
    updateImageProperties(): void;
    destroy(): void;
}
