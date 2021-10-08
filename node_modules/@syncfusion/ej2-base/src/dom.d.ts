export interface ElementProperties {
    id?: string;
    className?: string;
    innerHTML?: string;
    styles?: string;
    attrs?: {
        [key: string]: string;
    };
}
/**
 * Function to create Html element.
 *
 * @param {string} tagName - Name of the tag, id and class names.
 * @param {ElementProperties} properties - Object to set properties in the element.
 * @param {ElementProperties} properties.id - To set the id to the created element.
 * @param {ElementProperties} properties.className - To add classes to the element.
 * @param {ElementProperties} properties.innerHTML - To set the innerHTML to element.
 * @param {ElementProperties} properties.styles - To set the some custom styles to element.
 * @param {ElementProperties} properties.attrs - To set the attributes to element.
 * @returns {any} ?
 * @private
 */
export declare function createElement(tagName: string, properties?: ElementProperties): HTMLElement;
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to add a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export declare function addClass(elements: Element[] | NodeList, classes: string | string[]): Element[] | NodeList;
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to remove a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export declare function removeClass(elements: Element[] | NodeList, classes: string | string[]): Element[] | NodeList;
/**
 * The function used to check element is visible or not.
 *
 * @param  {Element|Node} element - An element the need to check visibility
 * @returns {boolean} ?
 * @private
 */
export declare function isVisible(element: Element | Node): boolean;
/**
 * The function used to insert an array of elements into a first of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to prepend.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export declare function prepend(fromElements: Element[] | NodeList, toElement: Element, isEval?: boolean): Element[] | NodeList;
/**
 * The function used to insert an array of elements into last of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to append.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export declare function append(fromElements: Element[] | NodeList, toElement: Element, isEval?: boolean): Element[] | NodeList;
/**
 * The function used to remove the element from parentnode
 *
 * @param  {Element|Node|HTMLElement} element - An element that is going to detach from the Dom
 * @returns {any} ?
 * @private
 */
export declare function detach(element: Element | Node | HTMLElement): any;
/**
 * The function used to remove the element from Dom also clear the bounded events
 *
 * @param  {Element|Node|HTMLElement} element - An element remove from the Dom
 * @returns {void} ?
 * @private
 */
export declare function remove(element: Element | Node | HTMLElement): void;
/**
 * The function helps to set multiple attributes to an element
 *
 * @param  {Element|Node} element - An element that need to set attributes.
 * @param  {string} attributes - JSON Object that is going to as attributes.
 * @returns {Element} ?
 * @private
 */
export declare function attributes(element: Element | Node | any, attributes: {
    [key: string]: string;
}): Element;
/**
 * The function selects the element from giving context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {any} ?
 * @private
 */
export declare function select(selector: string, context?: Document | Element, needsVDOM?: boolean): any;
/**
 * The function selects an array of element from the given context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {HTMLElement[]} ?
 * @private
 */
export declare function selectAll(selector: string, context?: Document | Element, needsVDOM?: boolean): HTMLElement[];
/**
 * Returns single closest parent element based on class selector.
 *
 * @param  {Element} element - An element that need to find the closest element.
 * @param  {string} selector - A classSelector of closest element.
 * @returns {Element} ?
 * @private
 */
export declare function closest(element: Element | Node, selector: string): Element;
/**
 * Returns all sibling elements of the given element.
 *
 * @param  {Element|Node} element - An element that need to get siblings.
 * @returns {Element[]} ?
 * @private
 */
export declare function siblings(element: Element | Node): Element[];
/**
 * set the value if not exist. Otherwise set the existing value
 *
 * @param  {HTMLElement} element - An element to which we need to set value.
 * @param  {string} property - Property need to get or set.
 * @param  {string} value - value need to set.
 * @returns {string} ?
 * @private
 */
export declare function getAttributeOrDefault(element: HTMLElement, property: string, value: string): string;
/**
 * Set the style attributes to Html element.
 *
 * @param {HTMLElement} element - Element which we want to set attributes
 * @param {any} attrs - Set the given attributes to element
 * @returns {void} ?
 * @private
 */
export declare function setStyleAttribute(element: HTMLElement, attrs: {
    [key: string]: Object;
}): void;
/**
 * Method for add and remove classes to a dom element.
 *
 * @param {Element} element - Element for add and remove classes
 * @param {string[]} addClasses - List of classes need to be add to the element
 * @param {string[]} removeClasses - List of classes need to be remove from the element
 * @returns {void} ?
 * @private
 */
export declare function classList(element: Element, addClasses: string[], removeClasses: string[]): void;
/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Element} element - Element to compare with the selector.
 * @param {string} selector - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export declare function matches(element: Element, selector: string): boolean;
/**
 * Method to get the html text from DOM.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} innerHTML - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export declare function includeInnerHTML(ele: HTMLElement, innerHTML: string): void;
/**
 * Method to get the containsclass.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} className - String selector which element will satisfy.
 * @returns {any} ?
 * @private
 */
export declare function containsClass(ele: HTMLElement, className: string): any;
/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Object} element - Element to compare with the selector.
 * @param {boolean} deep ?
 * @returns {any} ?
 * @private
 */
export declare function cloneNode(element: Object, deep?: boolean): any;
