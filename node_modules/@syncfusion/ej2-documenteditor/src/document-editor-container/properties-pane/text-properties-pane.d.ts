import { DocumentEditorContainer } from '../document-editor-container';
/**
 * Text Properties pane
 *
 * @private
 */
export declare class TextProperties {
    element: HTMLElement;
    private container;
    private text;
    private paragraph;
    private isInitial;
    private readonly documentEditor;
    /**
     * Initialize the Text properties pane.
     *
     * @param {DocumentEditorContainer} container DocumentEditorContainer instance.
     * @param {string} id Identifier element reference.
     * @param {boolean} isTableProperties Specified if text properties is inside the text properties.
     * @param {boolean} isRtl Specifies the RTL layout.
     */
    constructor(container: DocumentEditorContainer, id: string, isTableProperties: boolean, isRtl?: boolean);
    enableDisableElements(enable: boolean): void;
    updateStyles(): void;
    appliedHighlightColor: string;
    appliedBulletStyle: string;
    appliedNumberingStyle: string;
    showTextProperties(isShow: boolean): void;
    private initializeTextProperties;
    private generateUniqueID;
    wireEvents(): void;
    onSelectionChange(): void;
    destroy(): void;
}
