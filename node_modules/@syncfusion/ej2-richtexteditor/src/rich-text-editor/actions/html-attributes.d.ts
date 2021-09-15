/**
 * Used to set the HTML Attributes for RTE container
 */
import { IRichTextEditor } from '../base/interface';
/**
 * @param {string} htmlAttributes - specifies the string value
 * @param {IRichTextEditor} rte - specifies the rte value
 * @param {boolean} isFrame - specifies the boolean value
 * @param {boolean} initial - specifies the boolean value
 * @returns {void}
 * @hidden
 */
export declare function setAttributes(htmlAttributes: {
    [key: string]: string;
}, rte: IRichTextEditor, isFrame: boolean, initial: boolean): void;
