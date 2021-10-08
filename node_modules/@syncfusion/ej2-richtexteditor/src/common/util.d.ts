import { IToolbarStatus } from './interface';
/**
 * @returns {void}
 * @hidden
 */
export declare function isIDevice(): boolean;
/**
 * @param {Element} editableElement - specifies the editable element.
 * @param {string} selector - specifies the string values.
 * @returns {void}
 * @hidden
 */
export declare function setEditFrameFocus(editableElement: Element, selector: string): void;
/**
 * @param {string} value - specifies the string value
 * @returns {void}
 * @hidden
 */
export declare function updateTextNode(value: string): string;
/**
 * @param {Node} startChildNodes - specifies the node
 * @returns {void}
 * @hidden
 */
export declare function getLastTextNode(startChildNodes: Node): Node;
/**
 * @returns {void}
 * @hidden
 */
export declare function getDefaultHtmlTbStatus(): IToolbarStatus;
/**
 * @returns {void}
 * @hidden
 */
export declare function getDefaultMDTbStatus(): IToolbarStatus;
