/**
 * Functions related to dom operations.
 */
import { EventHandler } from './event-handler';
import { isNullOrUndefined, getValue, setValue, isObject, extend } from './util';
var SVG_REG = /^svg|^path|^g/;
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
export function createElement(tagName, properties) {
    var element = (SVG_REG.test(tagName) ? document.createElementNS('http://www.w3.org/2000/svg', tagName) : document.createElement(tagName));
    if (typeof (properties) === 'undefined') {
        return element;
    }
    element.innerHTML = (properties.innerHTML ? properties.innerHTML : '');
    if (properties.className !== undefined) {
        element.className = properties.className;
    }
    if (properties.id !== undefined) {
        element.id = properties.id;
    }
    if (properties.styles !== undefined) {
        element.setAttribute('style', properties.styles);
    }
    if (properties.attrs !== undefined) {
        attributes(element, properties.attrs);
    }
    return element;
}
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to add a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export function addClass(elements, classes) {
    var classList = getClassList(classes);
    for (var _i = 0, _a = elements; _i < _a.length; _i++) {
        var ele = _a[_i];
        for (var _b = 0, classList_1 = classList; _b < classList_1.length; _b++) {
            var className = classList_1[_b];
            if (isObject(ele)) {
                var curClass = getValue('attributes.className', ele);
                if (isNullOrUndefined(curClass)) {
                    setValue('attributes.className', className, ele);
                }
                else if (!new RegExp('\\b' + className + '\\b', 'i').test(curClass)) {
                    setValue('attributes.className', curClass + ' ' + className, ele);
                }
            }
            else {
                if (!ele.classList.contains(className)) {
                    ele.classList.add(className);
                }
            }
        }
    }
    return elements;
}
/**
 * The function used to add the classes to array of elements
 *
 * @param  {Element[]|NodeList} elements - An array of elements that need to remove a list of classes
 * @param  {string|string[]} classes - String or array of string that need to add an individual element as a class
 * @returns {any} .
 * @private
 */
export function removeClass(elements, classes) {
    var classList = getClassList(classes);
    for (var _i = 0, _a = elements; _i < _a.length; _i++) {
        var ele = _a[_i];
        var flag = isObject(ele);
        var canRemove = flag ? getValue('attributes.className', ele) : ele.className !== '';
        if (canRemove) {
            for (var _b = 0, classList_2 = classList; _b < classList_2.length; _b++) {
                var className = classList_2[_b];
                if (flag) {
                    var classes_1 = getValue('attributes.className', ele);
                    var classArr = classes_1.split(' ');
                    var index = classArr.indexOf(className);
                    if (index !== -1) {
                        classArr.splice(index, 1);
                    }
                    setValue('attributes.className', classArr.join(' '), ele);
                }
                else {
                    ele.classList.remove(className);
                }
            }
        }
    }
    return elements;
}
/**
 * The function used to get classlist.
 *
 * @param  {string | string[]} classes - An element the need to check visibility
 * @returns {string[]} ?
 * @private
 */
function getClassList(classes) {
    var classList = [];
    if (typeof classes === 'string') {
        classList.push(classes);
    }
    else {
        classList = classes;
    }
    return classList;
}
/**
 * The function used to check element is visible or not.
 *
 * @param  {Element|Node} element - An element the need to check visibility
 * @returns {boolean} ?
 * @private
 */
export function isVisible(element) {
    var ele = element;
    return (ele.style.visibility === '' && ele.offsetWidth > 0);
}
/**
 * The function used to insert an array of elements into a first of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to prepend.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export function prepend(fromElements, toElement, isEval) {
    var docFrag = document.createDocumentFragment();
    for (var _i = 0, _a = fromElements; _i < _a.length; _i++) {
        var ele = _a[_i];
        docFrag.appendChild(ele);
    }
    toElement.insertBefore(docFrag, toElement.firstElementChild);
    if (isEval) {
        executeScript(toElement);
    }
    return fromElements;
}
/**
 * The function used to insert an array of elements into last of the element.
 *
 * @param  {Element[]|NodeList} fromElements - An array of elements that need to append.
 * @param  {Element} toElement - An element that is going to prepend.
 * @param {boolean} isEval - ?
 * @returns {Element[] | NodeList} ?
 * @private
 */
export function append(fromElements, toElement, isEval) {
    var docFrag = document.createDocumentFragment();
    for (var _i = 0, _a = fromElements; _i < _a.length; _i++) {
        var ele = _a[_i];
        docFrag.appendChild(ele);
    }
    toElement.appendChild(docFrag);
    if (isEval) {
        executeScript(toElement);
    }
    return fromElements;
}
/**
 * The function is used to evaluate script from Ajax request
 *
 * @param {Element} ele - An element is going to evaluate the script
 * @returns {void} ?
 */
function executeScript(ele) {
    var eleArray = ele.querySelectorAll('script');
    eleArray.forEach(function (element) {
        var script = document.createElement('script');
        script.text = element.innerHTML;
        document.head.appendChild(script);
        detach(script);
    });
}
/**
 * The function used to remove the element from parentnode
 *
 * @param  {Element|Node|HTMLElement} element - An element that is going to detach from the Dom
 * @returns {any} ?
 * @private
 */
// eslint-disable-next-line
export function detach(element) {
    var parentNode = element.parentNode;
    if (parentNode) {
        return parentNode.removeChild(element);
    }
}
/**
 * The function used to remove the element from Dom also clear the bounded events
 *
 * @param  {Element|Node|HTMLElement} element - An element remove from the Dom
 * @returns {void} ?
 * @private
 */
export function remove(element) {
    var parentNode = element.parentNode;
    EventHandler.clearEvents(element);
    parentNode.removeChild(element);
}
/**
 * The function helps to set multiple attributes to an element
 *
 * @param  {Element|Node} element - An element that need to set attributes.
 * @param  {string} attributes - JSON Object that is going to as attributes.
 * @returns {Element} ?
 * @private
 */
// eslint-disable-next-line
export function attributes(element, attributes) {
    var keys = Object.keys(attributes);
    var ele = element;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (isObject(ele)) {
            var iKey = key;
            if (key === 'tabindex') {
                iKey = 'tabIndex';
            }
            ele.attributes[iKey] = attributes[key];
        }
        else {
            ele.setAttribute(key, attributes[key]);
        }
    }
    return ele;
}
/**
 * The function selects the element from giving context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {any} ?
 * @private
 */
// eslint-disable-next-line
export function select(selector, context, needsVDOM) {
    if (context === void 0) { context = document; }
    selector = querySelectId(selector);
    return context.querySelector(selector);
}
/**
 * The function selects an array of element from the given context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @param  {Document|Element} context - It is an optional type, That specifies a Dom context.
 * @param {boolean} needsVDOM ?
 * @returns {HTMLElement[]} ?
 * @private
 */
// eslint-disable-next-line
export function selectAll(selector, context, needsVDOM) {
    if (context === void 0) { context = document; }
    selector = querySelectId(selector);
    var nodeList = context.querySelectorAll(selector);
    return nodeList;
}
/**
 * The function selects an id of element from the given context.
 *
 * @param  {string} selector - Selector string need fetch element
 * @returns {string} ?
 * @private
 */
function querySelectId(selector) {
    if (selector.match(/#[0-9]/g)) {
        var idList = selector.split(',');
        for (var i = 0; i < idList.length; i++) {
            var list = idList[i].split(' ');
            for (var j = 0; j < list.length; j++) {
                if (list[j].indexOf('#') > -1) {
                    if (!list[j].match(/\[.*\]/)) {
                        var splitId = list[j].split('#');
                        if (splitId[1].match(/^\d/)) {
                            var setId = list[j].split('.');
                            setId[0] = setId[0].replace(/#/, '[id=\'') + '\']';
                            list[j] = setId.join('.');
                        }
                    }
                }
            }
            idList[i] = list.join(' ');
        }
        return idList.join(',');
    }
    return selector;
}
/**
 * Returns single closest parent element based on class selector.
 *
 * @param  {Element} element - An element that need to find the closest element.
 * @param  {string} selector - A classSelector of closest element.
 * @returns {Element} ?
 * @private
 */
export function closest(element, selector) {
    var el = element;
    if (typeof el.closest === 'function') {
        return el.closest(selector);
    }
    while (el && el.nodeType === 1) {
        if (matches(el, selector)) {
            return el;
        }
        el = el.parentNode;
    }
    return null;
}
/**
 * Returns all sibling elements of the given element.
 *
 * @param  {Element|Node} element - An element that need to get siblings.
 * @returns {Element[]} ?
 * @private
 */
export function siblings(element) {
    var siblings = [];
    var childNodes = Array.prototype.slice.call(element.parentNode.childNodes);
    for (var _i = 0, childNodes_1 = childNodes; _i < childNodes_1.length; _i++) {
        var curNode = childNodes_1[_i];
        if (curNode.nodeType === Node.ELEMENT_NODE && element !== curNode) {
            siblings.push(curNode);
        }
    }
    return siblings;
}
/**
 * set the value if not exist. Otherwise set the existing value
 *
 * @param  {HTMLElement} element - An element to which we need to set value.
 * @param  {string} property - Property need to get or set.
 * @param  {string} value - value need to set.
 * @returns {string} ?
 * @private
 */
export function getAttributeOrDefault(element, property, value) {
    var attrVal;
    var isObj = isObject(element);
    if (isObj) {
        attrVal = getValue('attributes.' + property, element);
    }
    else {
        attrVal = element.getAttribute(property);
    }
    if (isNullOrUndefined(attrVal) && value) {
        if (!isObj) {
            element.setAttribute(property, value.toString());
        }
        else {
            element.attributes[property] = value;
        }
        attrVal = value;
    }
    return attrVal;
}
/**
 * Set the style attributes to Html element.
 *
 * @param {HTMLElement} element - Element which we want to set attributes
 * @param {any} attrs - Set the given attributes to element
 * @returns {void} ?
 * @private
 */
export function setStyleAttribute(element, attrs) {
    if (attrs !== undefined) {
        Object.keys(attrs).forEach(function (key) {
            // eslint-disable-next-line
            element.style[key] = attrs[key];
        });
    }
}
/**
 * Method for add and remove classes to a dom element.
 *
 * @param {Element} element - Element for add and remove classes
 * @param {string[]} addClasses - List of classes need to be add to the element
 * @param {string[]} removeClasses - List of classes need to be remove from the element
 * @returns {void} ?
 * @private
 */
export function classList(element, addClasses, removeClasses) {
    addClass([element], addClasses);
    removeClass([element], removeClasses);
}
/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Element} element - Element to compare with the selector.
 * @param {string} selector - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export function matches(element, selector) {
    // eslint-disable-next-line
    var matches = element.matches || element.msMatchesSelector || element.webkitMatchesSelector;
    if (matches) {
        return matches.call(element, selector);
    }
    else {
        return [].indexOf.call(document.querySelectorAll(selector), element) !== -1;
    }
}
/**
 * Method to get the html text from DOM.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} innerHTML - String selector which element will satisfy.
 * @returns {void} ?
 * @private
 */
export function includeInnerHTML(ele, innerHTML) {
    ele.innerHTML = innerHTML;
}
/**
 * Method to get the containsclass.
 *
 * @param {HTMLElement} ele - Element to compare with the selector.
 * @param {string} className - String selector which element will satisfy.
 * @returns {any} ?
 * @private
 */
// eslint-disable-next-line
export function containsClass(ele, className) {
    if (isObject(ele)) {
        // eslint-disable-next-line
        return new RegExp('\\b' + className + '\\b', 'i').test(ele.attributes.className);
    }
    else {
        return ele.classList.contains(className);
    }
}
/**
 * Method to check whether the element matches the given selector.
 *
 * @param {Object} element - Element to compare with the selector.
 * @param {boolean} deep ?
 * @returns {any} ?
 * @private
 */
// eslint-disable-next-line
export function cloneNode(element, deep) {
    if (isObject(element)) {
        if (deep) {
            return extend({}, {}, element, true);
        }
    }
    else {
        return element.cloneNode(deep);
    }
}
