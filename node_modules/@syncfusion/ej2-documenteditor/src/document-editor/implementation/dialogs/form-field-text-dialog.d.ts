import { DocumentEditor } from '../../document-editor';
import { ChangeEventArgs } from '@syncfusion/ej2-dropdowns';
/**
 * Form field text dialog is used to modify the value in text form field.
 */
export declare class TextFormFieldDialog {
    private target;
    private owner;
    private defaultTextInput;
    private maxLengthNumber;
    private tooltipTextInput;
    private bookmarkTextInput;
    private fillInEnable;
    private defaultTextLabel;
    private defaultTextDiv;
    private textFormatLabel;
    private typeDropDown;
    private textFormatDropDown;
    private fieldBegin;
    private localObj;
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
     * @returns {void}
     */
    private initTextDialog;
    /**
     * @private
     * @returns {void}
     */
    show(): void;
    /**
     * @private
     * @param {ChangeEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    changeTypeDropDown(args: ChangeEventArgs): void;
    /**
     * @private
     * @returns {void}
     */
    loadTextDialog(): void;
    /**
     * @private
     * @returns {void}
     */
    updateTextFormtas: () => void;
    private updateFormats;
    /**
     * @private
     * @returns {void}
     */
    onCancelButtonClick: () => void;
    /**
     * @private
     * @returns {boolean} returns is valid date format.
     */
    isValidDateFormat(): boolean;
    /**
     * @private
     * @returns {void}
     */
    insertTextField: () => void;
    /**
     * @private
     * @returns {void}
     */
    private closeTextField;
    /**
     * @private
     * @returns {void}
     */
    private destroy;
}
