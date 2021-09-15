import { L10n } from '@syncfusion/ej2-base';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { DocumentHelper } from '../viewer';
/**
 * The Table of contents dialog is used to insert or edit table of contents at selection.
 */
export declare class TableOfContentsDialog {
    private target;
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    private pageNumber;
    private rightAlign;
    private tabLeader;
    private showLevel;
    private hyperlink;
    private style;
    private heading1;
    private heading2;
    private heading3;
    private heading4;
    private heading5;
    private heading6;
    private heading7;
    private heading8;
    private heading9;
    private normal;
    private outline;
    private textBoxInput;
    private listViewInstance;
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
    initTableOfContentDialog(locale: L10n, isRtl?: boolean): void;
    private styleLocaleValue;
    /**
     * @private
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    loadTableofContentDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    closeTableOfContentDialog: () => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @param {SelectEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private selectHandler;
    /**
     * @private
     * @returns {void}
     */
    private showStyleDialog;
    private changeShowLevelValue;
    private changeByValue;
    /**
     * @returns {void}
     */
    private reset;
    /**
     * @param {KeyboardEvent} args - Specifies the event args.
     * @returns {void}
     */
    private changeStyle;
    private checkLevel;
    private getElementValue;
    /**
     * @param {KeyboardEvent} args - Specifies the event args.
     * @returns {void}
     */
    private changeHeadingStyle;
    /**
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    changePageNumberValue: (args: ChangeEventArgs) => void;
    /**
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    changeRightAlignValue: (args: ChangeEventArgs) => void;
    /**
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    changeStyleValue: (args: ChangeEventArgs) => void;
    private getHeadingLevel;
    private applyLevelSetting;
    /**
     * @private
     * @returns {void}
     */
    applyTableOfContentProperties: () => void;
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
