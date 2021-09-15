import { NodeSelection } from './../../selection/index';
export declare const markerClassName: {
    [key: string]: string;
};
/**
 * DOMNode internal plugin
 *
 * @hidden

 */
export declare class DOMNode {
    private parent;
    private currentDocument;
    private nodeSelection;
    /**
     * Constructor for creating the DOMNode plugin
     *
     * @param {Element} parent - specifies the parent element
     * @param {Document} currentDocument - specifies the current document.
     * @hidden

     */
    constructor(parent: Element, currentDocument: Document);
    /**
     * contents method
     *
     * @param {Element} element - specifies the element.
     * @returns {void}
     * @hidden

     */
    contents(element: Element): Node[];
    /**
     * isBlockNode method
     *
     * @param {Element} element - specifies the node element.
     * @returns {boolean} - sepcifies the boolean value
     * @hidden

     */
    isBlockNode(element: Element): boolean;
    /**
     * isLink method
     *
     * @param {Element} element - specifies the element
     * @returns {boolean} -  specifies the boolean value
     * @hidden

     */
    isLink(element: Element): boolean;
    /**
     * blockParentNode method
     *
     * @param {Element} element - specifies the element
     * @returns {Element} - returns the element value
     * @hidden

     */
    blockParentNode(element: Element): Element;
    /**
     * rawAttributes method
     *
     * @param {Element} element - specifies the element
     * @returns {string} - returns the string value
     * @hidden

     */
    rawAttributes(element: Element): {
        [key: string]: string;
    };
    /**
     * attributes method
     *
     * @param {Element} element - sepcifies the element.
     * @returns {string} - returns the string value.
     * @hidden

     */
    attributes(element?: Element): string;
    /**
     * clearAttributes method
     *
     * @param {Element} element - specifies the element
     * @returns {void}
     * @hidden

     */
    clearAttributes(element: Element): void;
    /**
     * openTagString method
     *
     * @param {Element} element - specifies the element.
     * @returns {string} - returns the string
     * @hidden

     */
    openTagString(element: Element): string;
    /**
     * closeTagString method
     *
     * @param {Element} element - specifies the element
     * @returns {string} - returns the string value
     * @hidden

     */
    closeTagString(element: Element): string;
    /**
     * createTagString method
     *
     * @param {string} tagName - specifies the tag name
     * @param {Element} relativeElement - specifies the relative element
     * @param {string} innerHTML - specifies the string value
     * @returns {string} - returns the string value.
     * @hidden

     */
    createTagString(tagName: string, relativeElement: Element, innerHTML: string): string;
    /**
     * isList method
     *
     * @param {Element} element - specifes the element.
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isList(element: Element): boolean;
    /**
     * isElement method
     *
     * @param {Element} element - specifes the element.
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isElement(element: Element): boolean;
    /**
     * isEditable method
     *
     * @param {Element} element - specifes the element.
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isEditable(element: Element): boolean;
    /**
     * hasClass method
     *
     * @param {Element} element - specifes the element.
     * @param {string} className - specifies the class name value
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    hasClass(element: Element, className: string): boolean;
    /**
     * replaceWith method
     *
     * @param {Element} element - specifes the element.
     * @param {string} value - specifies the string value
     * @returns {void}
     * @hidden

     */
    replaceWith(element: Element, value: string): void;
    /**
     * parseHTMLFragment method
     *
     * @param {string} value - specifies the string value
     * @returns {Element} - returns the element
     * @hidden

     */
    parseHTMLFragment(value: string): Element;
    /**
     * wrap method
     *
     * @param {Element} element - specifies the element
     * @param {Element} wrapper - specifies the element.
     * @returns {Element} - returns the element
     * @hidden

     */
    wrap(element: Element, wrapper: Element): Element;
    /**
     * insertAfter method
     *
     * @param {Element} newNode - specifies the new node element
     * @param {Element} referenceNode - specifies the referenece node
     * @returns {void}
     * @hidden

     */
    insertAfter(newNode: Element, referenceNode: Element): void;
    /**
     * wrapInner method
     *
     * @param {Element} parent - specifies the parent element.
     * @param {Element} wrapper - specifies the wrapper element.
     * @returns {Element} - returns the element
     * @hidden

     */
    wrapInner(parent: Element, wrapper: Element): Element;
    /**
     * unWrap method
     *
     * @param {Element} element - specifies the element.
     * @returns {Element} - returns the element.
     * @hidden

     */
    unWrap(element: Element): Element[];
    /**
     * getSelectedNode method
     *
     * @param {Element} element - specifies the element
     * @param {number} index - specifies the index value.
     * @returns {Element} - returns the element
     * @hidden

     */
    getSelectedNode(element: Element, index: number): Element;
    /**
     * nodeFinds method
     *
     * @param {Element} element - specifies the element.
     * @param {Element[]} elements - specifies the array of elements
     * @returns {Element[]} - returnts the array elements
     * @hidden

     */
    nodeFinds(element: Element, elements: Element[]): Element[];
    /**
     * isEditorArea method
     *
     * @returns {boolean} - returns the boolean value
     * @hidden

     */
    isEditorArea(): boolean;
    /**
     * getRangePoint method
     *
     * @param {number} point - specifies the number value.
     * @returns {Range} - returns the range.
     * @hidden

     */
    getRangePoint(point?: number): Range | Range[];
    getSelection(): Selection;
    /**
     * getPreviousNode method
     *
     * @param {Element} element - specifies the element
     * @returns {Element} - returns the element
     * @hidden

     */
    getPreviousNode(element: Element): Element;
    /**
     * encode method
     *
     * @param {string} value - specifies the string value
     * @returns {string} - specifies the string value
     * @hidden

     */
    encode(value: string): string;
    /**
     * saveMarker method
     *
     * @param {NodeSelection} save - specifies the node selection,
     * @param {string} action - specifies the action  value.
     * @returns {NodeSelection} - returns the value
     * @hidden

     */
    saveMarker(save: NodeSelection, action?: string): NodeSelection;
    private marker;
    /**
     * setMarker method
     *
     * @param {NodeSelection} save - specifies the node selection.
     * @returns {void}
     * @hidden

     */
    setMarker(save: NodeSelection): void;
    /**
     * ensureSelfClosingTag method
     *
     * @param {Element} start - specifies the element.
     * @param {string} className - specifes the class name string value
     * @param {Range} range - specifies the range value
     * @returns {void}
     * @hidden

     */
    ensureSelfClosingTag(start: Element, className: string, range: Range): void;
    /**
     * createTempNode method
     *
     * @param {Element} element - specifies the element.
     * @returns {Element} - returns the element
     * @hidden

     */
    createTempNode(element: Element): Element;
    /**
     * getImageTagInSelection method
     *
     * @returns {void}
     * @hidden

     */
    getImageTagInSelection(): NodeListOf<HTMLImageElement>;
    /**
     * blockNodes method
     *
     * @returns {Node[]} - returns the node array values
     * @hidden

     */
    blockNodes(): Node[];
    private ignoreTableTag;
}
