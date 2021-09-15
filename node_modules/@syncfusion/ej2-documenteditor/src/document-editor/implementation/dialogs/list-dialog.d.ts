import { Dialog } from '@syncfusion/ej2-popups';
import { L10n } from '@syncfusion/ej2-base';
import { WList } from '../list/list';
import { WListLevel } from '../list/list-level';
import { DocumentHelper } from '../viewer';
/**
 * The List dialog is used to create or modify lists.
 */
export declare class ListDialog {
    /**
     * @private
     */
    dialog: Dialog;
    private target;
    /**
     * @private
     */
    documentHelper: DocumentHelper;
    private viewModel;
    private startAt;
    private textIndent;
    private alignedAt;
    private listLevelElement;
    private followNumberWith;
    private numberStyle;
    private numberFormat;
    private restartBy;
    private formatInfoToolTip;
    private numberFormatDiv;
    /**
     * @private
     */
    isListCharacterFormat: boolean;
    /**
     * @private
     * @returns {WListLevel} Returns list level
     */
    readonly listLevel: WListLevel;
    /**
     * @private
     * @returns {WList} Returns list
     */
    readonly list: WList;
    /**
     * @private
     * @returns {number} Returns level number
     */
    readonly levelNumber: number;
    /**
     * @param {DocumentHelper} documentHelper - Specifies the document helper.
     * @private
     */
    constructor(documentHelper: DocumentHelper);
    private readonly owner;
    /**
     * @private
     * @returns {string} Returns module name
     */
    getModuleName(): string;
    /**
     * @private
     * @returns {void}
     */
    showListDialog(): void;
    /**
     * Shows the table properties dialog
     *
     * @private
     * @param {L10n} locale - Specifies the locale value
     * @param {boolean} isRtl - Specifies the is rtl
     * @returns {void}
     */
    initListDialog(locale: L10n, isRtl?: boolean): void;
    private wireAndBindEvent;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onTextIndentChanged;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onStartValueChanged;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onListLevelValueChanged;
    /**
     * @private
     * @param {any} args - Specifies the change event args.
     * @returns {void}
     */
    private onNumberFormatChanged;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onAlignedAtValueChanged;
    private updateRestartLevelBox;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onFollowCharacterValueChanged;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the change event args.
     * @returns {void}
     */
    private onLevelPatternValueChanged;
    private listPatternConverter;
    private followCharacterConverter;
    /**
     * @private
     * @returns {void}
     */
    private loadListDialog;
    private updateDialogValues;
    /**
     * @private
     * @returns {void}
     */
    private showFontDialog;
    /**
     * @private
     * @returns {void}
     */
    private onApplyList;
    /**
     * @private
     * @returns {void}
     */
    private onCancelButtonClick;
    /**
     * @private
     * @returns {void}
     */
    private closeListDialog;
    private disposeBindingForListUI;
    /**
     * @private
     * @returns {void}
     */
    destroy(): void;
}
