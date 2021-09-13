import { detach, getUniqueID, rippleEffect, setValue, attributes } from '@syncfusion/ej2-base';
import { getValue, addClass, deleteObject } from '@syncfusion/ej2-base';
/**
 * Initialize wrapper element for angular.
 * @private
 */
export function wrapperInitialize(createElement, tag, type, element, WRAPPER, role) {
    var input = element;
    if (element.tagName === tag) {
        var ejInstance = getValue('ej2_instances', element);
        input = createElement('input', { attrs: { 'type': type } });
        var props = ['change', 'cssClass', 'label', 'labelPosition', 'id'];
        for (var index = 0, len = element.attributes.length; index < len; index++) {
            if (props.indexOf(element.attributes[index].nodeName) === -1) {
                input.setAttribute(element.attributes[index].nodeName, element.attributes[index].nodeValue);
            }
        }
        attributes(element, { 'class': WRAPPER, 'role': role, 'aria-checked': 'false' });
        element.appendChild(input);
        setValue('ej2_instances', ejInstance, input);
        deleteObject(element, 'ej2_instances');
    }
    return input;
}
export function getTextNode(element) {
    var node;
    var childnode = element.childNodes;
    for (var i = 0; i < childnode.length; i++) {
        node = childnode[i];
        if (node.nodeType === 3) {
            return node;
        }
    }
    return null;
}
/**
 * Destroy the button components.
 * @private
 */
export function destroy(ejInst, wrapper, tagName) {
    if (tagName === 'INPUT') {
        wrapper.parentNode.insertBefore(ejInst.element, wrapper);
        detach(wrapper);
        ejInst.element.checked = false;
        ['name', 'value', 'disabled'].forEach(function (key) {
            ejInst.element.removeAttribute(key);
        });
    }
    else {
        ['role', 'aria-checked', 'class'].forEach(function (key) {
            wrapper.removeAttribute(key);
        });
        wrapper.innerHTML = '';
    }
}
export function preRender(proxy, control, wrapper, element, moduleName) {
    element = wrapperInitialize(proxy.createElement, control, 'checkbox', element, wrapper, moduleName);
    proxy.element = element;
    if (proxy.element.getAttribute('type') !== 'checkbox') {
        proxy.element.setAttribute('type', 'checkbox');
    }
    if (!proxy.element.id) {
        proxy.element.id = getUniqueID('e-' + moduleName);
    }
}
/**
 * Creates CheckBox component UI with theming and ripple support.
 * @private
 */
export function createCheckBox(createElement, enableRipple, options) {
    if (enableRipple === void 0) { enableRipple = false; }
    if (options === void 0) { options = {}; }
    var wrapper = createElement('div', { className: 'e-checkbox-wrapper e-css' });
    if (options.cssClass) {
        addClass([wrapper], options.cssClass.split(' '));
    }
    if (options.enableRtl) {
        wrapper.classList.add('e-rtl');
    }
    if (enableRipple) {
        var rippleSpan = createElement('span', { className: 'e-ripple-container' });
        rippleEffect(rippleSpan, { isCenterRipple: true, duration: 400 });
        wrapper.appendChild(rippleSpan);
    }
    var frameSpan = createElement('span', { className: 'e-frame e-icons' });
    if (options.checked) {
        frameSpan.classList.add('e-check');
    }
    wrapper.appendChild(frameSpan);
    if (options.label) {
        var labelSpan = createElement('span', { className: 'e-label', innerHTML: options.label });
        wrapper.appendChild(labelSpan);
    }
    return wrapper;
}
export function rippleMouseHandler(e, rippleSpan) {
    if (rippleSpan) {
        var event_1 = document.createEvent('MouseEvents');
        event_1.initEvent(e.type, false, true);
        rippleSpan.dispatchEvent(event_1);
    }
}
/**
 * Append hidden input to given element
 * @private
 */
export function setHiddenInput(proxy, wrap) {
    if (proxy.element.getAttribute('ejs-for')) {
        wrap.appendChild(proxy.createElement('input', {
            attrs: { 'name': proxy.name || proxy.element.name, 'value': 'false', 'type': 'hidden' }
        }));
    }
}
