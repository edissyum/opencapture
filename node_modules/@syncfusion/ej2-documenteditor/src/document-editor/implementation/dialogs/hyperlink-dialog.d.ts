import { L10n } from '@syncfusion/ej2-base';
import { DocumentHelper } from '../viewer';
/**
 * The Hyperlink dialog is used to insert or edit hyperlink at selection.
 */
export declare class HyperlinkDialog {
    private displayText;
    private navigationUrl;
    private displayTextBox;
    private addressText;
    private urlTextBox;
    private insertButton;
    private bookmarkDropdown;
    private bookmarkCheckbox;
    private bookmarkDiv;
    private target;
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    private bookmarks;
    private localObj;
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
    initHyperlinkDialog(localValue: L10n, isRtl?: boolean): void;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    hide(): void;
    /**
     * @private
     * @param {KeyboardEvent} event - Specifies the event args.
     * @returns {void}
     */
    onKeyUpOnUrlBox: (event: KeyboardEvent) => void;
    /**
     * @private
     * @returns {void}
     */
    onKeyUpOnDisplayBox: () => void;
    private enableOrDisableInsertButton;
    /**
     * @private
     * @returns {void}
     */
    onInsertButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    loadHyperlinkDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    closeHyperlinkDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onInsertHyperlink(): void;
    /**
     * @private
     * @param {CheckBoxChangeArgs} args - Specifies the event args.
     * @returns {void}
     */
    private onUseBookmarkChange;
    /**
     * @private
     * @returns {void}
     */
    private onBookmarkchange;
    /**
     * @private
     * @returns {void}
     */
    clearValue(): void;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
