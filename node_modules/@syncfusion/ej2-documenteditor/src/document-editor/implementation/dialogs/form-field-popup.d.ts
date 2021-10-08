import { FieldElementBox } from '../viewer/page';
import { DocumentEditor } from '../../document-editor';
/**
 * @private
 */
export declare class FormFieldPopUp {
    private target;
    private textBoxContainer;
    private textBoxInput;
    private numberInput;
    private dateInput;
    private dropDownInput;
    private numbericInput;
    private popupObject;
    private owner;
    private formField;
    private textBoxInstance;
    private numericTextBoxInstance;
    private datePickerInstance;
    private ddlInstance;
    private dataPickerOkButton;
    /**
     * @param {DocumentEditor} owner - Specifies the document editor.
     * @private
     */
    constructor(owner: DocumentEditor);
    private initPopup;
    private initTextBoxInput;
    private initNumericTextBox;
    private initDatePicker;
    private initDropDownList;
    /**
     * @returns {void}
     */
    private applyTextFormFieldValue;
    /**
     * @returns {void}
     */
    private applyNumberFormFieldValue;
    /**
     * @returns {void}
     */
    private applyDateFormFieldValue;
    /**
     * @returns {void}
     */
    private applyDropDownFormFieldValue;
    /**
     * @param {ChangedEventArgs} args - Specifies the event args.
     * @returns {void}
     */
    private enableDisableDatePickerOkButton;
    /**
     * @private
     * @param {FieldElementBox} formField - Specifies the field element.
     * @returns {void}
     */
    showPopUp(formField: FieldElementBox): void;
    /**
     * @private
     * @returns {void}
     */
    private closeButton;
    /**
     * @private
     * @returns {void}
     */
    hidePopup: () => void;
}
