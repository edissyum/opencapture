import { Base, EmitType } from '@syncfusion/ej2-base';
import { INotifyPropertyChanged } from '@syncfusion/ej2-base';
import { FormValidatorModel } from './form-validator-model';
/**
 * global declarations
 */
export declare let regex: any;
/**
 * ErrorOption values
 * @private
 */
export declare enum ErrorOption {
    /**
     * Defines the error message.
     */
    Message = 0,
    /**
     * Defines the error element type.
     */
    Label = 1
}
/**
 * FormValidator class enables you to validate the form fields based on your defined rules
 * ```html
 * <form id='formId'>
 *  <input type='text' name='Name' />
 *  <input type='text' name='Age' />
 * </form>
 * <script>
 *   let formObject = new FormValidator('#formId', {
 *      rules: { Name: { required: true }, Age: { range: [18, 30] } };
 *   });
 *   formObject.validate();
 * </script>
 * ```
 */
export declare class FormValidator extends Base<HTMLFormElement> implements INotifyPropertyChanged {
    private validated;
    private errorRules;
    private allowSubmit;
    private required;
    private infoElement;
    private inputElement;
    private selectQuery;
    private inputElements;
    private l10n;
    private internationalization;
    private localyMessage;
    /**
     * default locale variable
     */
    locale: string;
    /**
     * Ignores input fields based on the class name
     * @default 'e-hidden'
     */
    ignore: string;
    /**
     * Maps the input fields with validation rules
     * @default {}
     */
    rules: {
        [name: string]: {
            [rule: string]: Object;
        };
    };
    /**
     * Sets the defined css class to error fields
     * @default 'e-error'
     */
    errorClass: string;
    /**
     * Sets the defined css class to valid fields
     * @default 'e-valid'
     */
    validClass: string;
    /**
     * Specify HTML element for error
     * @default 'label'
     */
    errorElement: string;
    /**
     * Specify HTML element for error container
     * @default 'div'
     */
    errorContainer: string;
    /**
     * Option to display the error
     * @default ErrorOption.Label

     */
    errorOption: ErrorOption;
    /**
     * Triggers when a field's focused  out
     * @event
     */
    focusout: EmitType<Event>;
    /**
     * Trigger when keyup is triggered in any fields
     * @event
     */
    keyup: EmitType<KeyboardEvent>;
    /**
     * Triggers when a check box field is clicked
     * @event
     */
    click: EmitType<Event>;
    /**
     * Trigger when a select/drop-down field is changed
     * @event
     */
    change: EmitType<Event>;
    /**
     * Triggers before form is being submitted
     * @event
     */
    submit: EmitType<Event>;
    /**
     * Triggers before validation starts
     * @event
     */
    validationBegin: EmitType<Object | ValidArgs>;
    /**
     * Triggers after validation is completed
     * @event
     */
    validationComplete: EmitType<Object | FormEventArgs>;
    /**
     * Assigns the custom function to place the error message in the page.
     * @event
     */
    customPlacement: EmitType<HTMLElement | any>;
    /**
     * Add validation rules to the corresponding input element based on `name` attribute.
     * @param {string} name `name` of form field.
     * @param {Object} rules Validation rules for the corresponding element.
     * @return {void}
     */
    addRules(name: string, rules: Object): void;
    /**
     * Remove validation to the corresponding field based on name attribute.
     * When no parameter is passed, remove all the validations in the form.
     * @param {string} name Input name attribute value.
     * @param {string[]} rules List of validation rules need to be remove from the corresponding element.
     * @return {void}
     */
    removeRules(name?: string, rules?: string[]): void;
    /**
     * Validate the current form values using defined rules.
     * Returns `true` when the form is valid otherwise `false`
     * @param {string} selected - Optional parameter to validate specified element.
     * @return {boolean}
     */
    validate(selected?: string): boolean;
    /**
     * Reset the value of all the fields in form.
     * @return {void}
     */
    reset(): void;
    /**
     * Get input element by name.
     * @param {string} name - Input element name attribute value.
     * @return {HTMLInputElement}
     */
    getInputElement(name: string): HTMLInputElement;
    /**
     * Destroy the form validator object and error elements.
     * @return {void}
     */
    destroy(): void;
    /**
     * Specifies the default messages for validation rules.
     * @default { List of validation message }
     */
    defaultMessages: {
        [rule: string]: string;
    };
    /**
     * @private
     */
    onPropertyChanged(newProp: FormValidatorModel, oldProp?: FormValidatorModel): void;
    /**
     * @private
     */
    localeFunc(): void;
    /**
     * @private
     */
    getModuleName(): string;
    /**
     * @private
     */
    afterLocalization(args: any): void;
    /**
     * Allows you to refresh the form validator base events to the elements inside the form.
     * @return {void}
     */
    refresh(): void;
    constructor(element: string | HTMLFormElement, options?: FormValidatorModel);
    private clearForm;
    private createHTML5Rules;
    private annotationRule;
    private defRule;
    private wireEvents;
    private unwireEvents;
    private focusOutHandler;
    private keyUpHandler;
    private clickHandler;
    private changeHandler;
    private submitHandler;
    private resetHandler;
    private validateRules;
    private optionalValidationStatus;
    private isValid;
    private getErrorMessage;
    private createErrorElement;
    private getErrorElement;
    private removeErrorRules;
    private showMessage;
    private hideMessage;
    private checkRequired;
    private static checkValidator;
    private static isCheckable;
}
export interface ValidArgs {
    /**
     * Returns the value in input element.
     */
    value: string;
    /**
     * Returns the rule mapped for the input.
     */
    param?: Object;
    /**
     * Returns the input element.
     */
    element?: HTMLElement;
    /**
     * Returns the current form element.
     */
    formElement?: HTMLFormElement;
}
export interface FormEventArgs {
    /**
     * Returns the name of the input element.
     */
    inputName: string;
    /**
     * Returns the error message.
     */
    message: string;
    /**
     * Returns the input element.
     */
    element: HTMLInputElement;
    /**
     * Returns the status input element.
     */
    status?: string;
    /**
     * Returns the error element for corresponding input.
     */
    errorElement?: HTMLElement;
}
