import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
import { Editor } from '../editor';
/**
 * The notes dialog is used to insert footnote.
 */
export declare class NotesDialog {
    private footCount;
    private target;
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    editor: Editor;
    private notesList;
    private startValueTextBox;
    private list;
    /**
     * @private
     */
    private noteNumberFormat;
    private sectionFormat;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    notesDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    loadFontDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onInsertFootnoteClick: () => void;
    private types;
    private reversetype;
    private endnoteListValue;
    /**
     * @private
     * @returns {void}
     */
    unWireEventsAndBindings: () => void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
