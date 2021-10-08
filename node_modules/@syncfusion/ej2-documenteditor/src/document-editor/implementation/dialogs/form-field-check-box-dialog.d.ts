import { ChangeArgs } from '@syncfusion/ej2-buttons';
import { DocumentEditor } from '../../document-editor';
/**
 * Form field checkbox dialog is used to modify the value in checkbox form field.
 */
export declare class CheckBoxFormFieldDialog {
    private target;
    private owner;
    private autoButton;
    private exactButton;
    private notCheckedButton;
    private checkedButton;
    private bookmarkInputText;
    private tooltipInputText;
    private checBoxEnableElement;
    private exactlyNumber;
    private exactNumberDiv;
    private fieldBegin;
    /**
     * @param {DocumentHelper} owner - Specifies the document helper.
     * @private
     */
    constructor(owner: DocumentEditor);
    private readonly documentHelper;
    private getModuleName;
    /**
     * @private
     * @param {L10n} locale - Specifies the locale.
     * @param {boolean} isRtl - Specifies is rtl.
     * @returns {void}
     */
    private initCheckBoxDialog;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @returns {void}
     */
    loadCheckBoxDialog(): void;
    /**
     * @private
     * @param {ChangeArgs} event - Specifies the event args.
     * @returns {void}
     */
    changeBidirectional: (event: ChangeArgs) => void;
    /**
     * @private
     * @param {ChangeArgs} event - Specifies the event args.
     * @returns {void}
     */
    changeBidirect: (event: ChangeArgs) => void;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {void}
     */
    insertCheckBoxField: () => void;
    /**
     * @private
     * @returns {void}
     */
    private closeCheckBoxField;
    /**
     * @private
     * @returns {void}
     */
    private destroy;
}
