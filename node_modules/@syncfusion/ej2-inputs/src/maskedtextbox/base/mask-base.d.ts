/**
 * @hidden
 * Built-in masking elements collection.
 */
export declare let regularExpressions: {
    [key: string]: string;
};
/**
 * @hidden
 * Generate required masking elements to the MaskedTextBox from user mask input.
 */
export declare function createMask(): void;
/**
 * @hidden
 * Apply mask ability with masking elements to the MaskedTextBox.
 */
export declare function applyMask(): void;
/**
 * @hidden
 * To wire required events to the MaskedTextBox.
 */
export declare function wireEvents(): void;
/**
 * @hidden
 * To unwire events attached to the MaskedTextBox.
 */
export declare function unwireEvents(): void;
/**
 * @hidden
 * To bind required events to the MaskedTextBox clearButton.
 */
export declare function bindClearEvent(): void;
/**
 * @hidden
 * To get masked value from the MaskedTextBox.
 */
export declare function unstrippedValue(element: HTMLInputElement): string;
/**
 * @hidden
 * To extract raw value from the MaskedTextBox.
 */
export declare function strippedValue(element: HTMLInputElement, maskValues: string): string;
export declare function maskInputFocusHandler(event: MouseEvent | FocusEvent | TouchEvent | KeyboardEvent): void;
export declare function maskInputBlurHandler(event: MouseEvent | FocusEvent | TouchEvent | KeyboardEvent): void;
export declare function maskInputDropHandler(event: MouseEvent): void;
export declare function mobileRemoveFunction(): void;
/**
 * @hidden
 * To set updated values in the MaskedTextBox.
 */
export declare function setMaskValue(val?: string): void;
/**
 * @hidden
 * To set updated values in the input element.
 */
export declare function setElementValue(val: string, element?: HTMLInputElement): void;
/**
 * @hidden
 * Provide mask support to input textbox through utility method.
 */
export declare function maskInput(args: MaskInputArgs): void;
/**
 * @hidden
 * Gets raw value of the textbox which has been masked through utility method.
 */
export declare function getVal(args: GetValueInputArgs): string;
/**
 * @hidden
 * Gets masked value of the textbox which has been masked through utility method.
 */
export declare function getMaskedVal(args: GetValueInputArgs): string;
/**
 * @hidden
 * Arguments to get the raw and masked value of MaskedTextBox which has been masked through utility method.
 */
export interface GetValueInputArgs {
    element: HTMLInputElement;
    mask: string;
    promptChar?: string;
    customCharacters?: {
        [x: string]: Object;
    };
}
/**
 * @hidden
 * Arguments to mask input textbox through utility method.
 */
export interface MaskInputArgs extends GetValueInputArgs {
    value?: string;
}
/**
 * @hidden
 * Arguments to perform undo and redo functionalities.
 */
export declare class MaskUndo {
    value: string;
    startIndex: Number;
    endIndex: Number;
}
