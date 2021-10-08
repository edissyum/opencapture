import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
/**
 * The Table dialog is used to insert table at selection.
 */
export declare class TableDialog {
    private columnsCountBox;
    private rowsCountBox;
    private target;
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    private columnValueTexBox;
    private rowValueTextBox;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private getModuleName;
    /**
     * @private
     * @param {L10n} localValue - Specified the locale value.
     * @returns {void}
     */
    initTableDialog(localValue: L10n): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @param {KeyboardEvent} event - Specifies the event args.
     * @returns {void}
     */
    keyUpInsertTable: (event: KeyboardEvent) => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    onInsertTableClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
