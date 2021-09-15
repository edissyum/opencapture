export declare type createElementParams = (tag: string, prop?: {
    id?: string;
    className?: string;
    innerHTML?: string;
    styles?: string;
    attrs?: {
        [key: string]: string;
    };
}) => HTMLElement;
/**
 * Defines the type of spinner.
 */
export declare type SpinnerType = 'Material' | 'Fabric' | 'Bootstrap' | 'HighContrast' | 'Bootstrap4';
/**
 * Function to change the Spinners in a page globally from application end.
 * ```
 * E.g : blazorSpinner({ action: "Create", options: {target: targetElement}, type: "" });
 * ```
 *
 * @private
 * @param {string} action - The action.
 * @param {CreateArgs} options - The options
 * @param {string} target - The target
 * @param {string} type - the type
 * @returns {void}
 */
export declare function Spinner(action: string, options: CreateArgs, target: string, type: string): void;
/**
 * Create a spinner for the specified target element.
 * ```
 * E.g : createSpinner({ target: targetElement, width: '34px', label: 'Loading..' });
 * ```
 * @private
 * @param  {SpinnerArgs} args - The SpinnerArgs.
 * @param {createElementParams} internalCreateElement - The internalCreateElement
 * @returns {void}
 */
export declare function createSpinner(args: SpinnerArgs, internalCreateElement?: createElementParams): void;
/**
 * Function to show the Spinner.
 * @private
 * @param {HTMLElement} container - The container.
 * @returns {void}
 */
export declare function showSpinner(container: HTMLElement): void;
/**
 * Function to hide the Spinner.
 * @private
 * @param {HTMLElement} container - Specify the target of the Spinner.
 * @returns {void}
 */
export declare function hideSpinner(container: HTMLElement): void;
/**
 * Function to change the Spinners in a page globally from application end.
 * ```
 * E.g : setSpinner({ cssClass: 'custom-css'; type: 'Material' });
 * ```
 * @private
 * @param {SetSpinnerArgs} args - The args.
 * @param {createElementParams} internalCreateElement - The internalCreateElement.
 * @returns {void}
 */
export declare function setSpinner(args: SetSpinnerArgs, internalCreateElement?: createElementParams): void;
/**
 * Arguments to create a spinner for the target.These properties are optional.
 */
export interface SpinnerArgs {
    /**
     * Target element to the Spinner.
     * ```
     * E.g : createSpinner({ target: element });
     * ```
     */
    target: HTMLElement;
    /**
     *  To set the width of the Spinner.
     */
    width?: string | number;
    /**
     *  To set the label to the Spinner element.
     */
    label?: string;
    /**
     *  Sets the CSS classes to root element of the Spinner which helps to customize the complete UI styles.
     */
    cssClass?: string;
    /**
     *  Specify the template content to be displayed in the Spinner.
     */
    template?: string;
    /**
     *  Specify the type of the Spinner.
     */
    type?: SpinnerType;
}
/**
 * Arguments to change the Spinners in a page globally from application end.
 */
export interface SetSpinnerArgs {
    /**
     *  Specify the template content to be displayed in the Spinner.
     */
    template?: string;
    /**
     *  Sets the CSS classes to root element of the Spinner which helps to customize the complete UI styles.
     */
    cssClass?: string;
    /**
     *  Specify the type of the Spinner.
     */
    type?: SpinnerType;
}
/**
 * Arguments to change the `Blazor` Spinners in a page globally from application end.
 */
export interface SetArgs {
    /**
     *  Sets the CSS classes to root element of the Spinner which helps to customize the complete UI styles.
     */
    cssClass?: string;
    /**
     *  Specify the type of the Spinner.
     */
    type?: SpinnerType;
}
/**
 * Arguments to create a `Blazor` spinner for the target.
 */
export interface CreateArgs {
    /**
     * Target element to the Spinner.
     * ```
     * E.g : createSpinner({ target: element });
     * ```
     */
    target: string;
    /**
     *  To set the width of the Spinner.
     */
    width?: string | number;
    /**
     *  To set the label to the Spinner element.
     */
    label?: string;
    /**
     *  Sets the CSS classes to root element of the Spinner which helps to customize the complete UI styles.
     */
    cssClass?: string;
    /**
     *  Specify the type of the Spinner.
     */
    type?: SpinnerType;
}
