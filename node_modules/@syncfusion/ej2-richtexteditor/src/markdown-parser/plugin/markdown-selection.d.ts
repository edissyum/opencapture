/**
 * MarkdownSelection internal module
 *
 * @hidden

 */
export declare class MarkdownSelection {
    selectionStart: number;
    selectionEnd: number;
    /**
     * markdown getLineNumber method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} point - specifies the number value
     * @returns {number} - returns the value
     * @hidden

     */
    getLineNumber(textarea: HTMLTextAreaElement, point: number): number;
    /**
     * markdown getSelectedText method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - specifies the string value
     * @hidden

     */
    getSelectedText(textarea: HTMLTextAreaElement): string;
    /**
     * markdown getAllParents method
     *
     * @param {string} value - specifies the string value
     * @returns {string[]} - returns the string value
     * @hidden

     */
    getAllParents(value: string): string[];
    /**
     * markdown getSelectedLine method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - returns the string value
     * @hidden

     */
    getSelectedLine(textarea: HTMLTextAreaElement): string;
    /**
     * markdown getLine method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} index - specifies the number value
     * @returns {string} - returns the string value
     * @hidden

     */
    getLine(textarea: HTMLTextAreaElement, index: number): string;
    /**
     * markdown getSelectedParentPoints method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @returns {string} - returns the string value
     * @hidden

     */
    getSelectedParentPoints(textarea: HTMLTextAreaElement): {
        [key: string]: string | number;
    }[];
    /**
     * markdown setSelection method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area element
     * @param {number} start - specifies the start vaulue
     * @param {number} end - specifies the end value
     * @returns {void}
     * @hidden

     */
    setSelection(textarea: HTMLTextAreaElement, start: number, end: number): void;
    /**
     * markdown save method
     *
     * @param {number} start - specifies the start vaulue
     * @param {number} end - specifies the end value
     * @returns {void}
     * @hidden

     */
    save(start: number, end: number): void;
    /**
     * markdown restore method
     *
     * @param {HTMLTextAreaElement} textArea - specifies the text area element
     * @returns {void}
     * @hidden

     */
    restore(textArea: HTMLTextAreaElement): void;
    /**
     * markdown isStartWith method
     *
     * @param {string} line - specifies the string value
     * @param {string} command - specifies the string value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isStartWith(line: string, command: string): boolean;
    /**
     * markdown replaceSpecialChar method
     *
     * @param {string} value - specifies the string value
     * @returns {string} - returns the value
     * @hidden

     */
    replaceSpecialChar(value: string): string;
    /**
     * markdown isClear method
     *
     * @param {string} parents - specifies the parent element
     * @param {string} regex - specifies the regex value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isClear(parents: {
        [key: string]: string | number;
    }[], regex: string): boolean;
    /**
     * markdown getSelectedInlinePoints method
     *
     * @param {HTMLTextAreaElement} textarea - specifies the text area
     * @returns {void}
     * @hidden

     */
    getSelectedInlinePoints(textarea: HTMLTextAreaElement): {
        [key: string]: string | number;
    };
}
