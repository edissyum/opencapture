/**
 * @param {string} htmlAttributes - specifies the string value
 * @param {IRichTextEditor} rte - specifies the rte value
 * @param {boolean} isFrame - specifies the boolean value
 * @param {boolean} initial - specifies the boolean value
 * @returns {void}
 * @hidden
 */
export function setAttributes(htmlAttributes, rte, isFrame, initial) {
    var target;
    if (isFrame) {
        var iFrame = rte.contentModule.getDocument();
        target = iFrame.querySelector('body');
    }
    else {
        target = rte.element;
    }
    if (Object.keys(htmlAttributes).length) {
        for (var _i = 0, _a = Object.keys(htmlAttributes); _i < _a.length; _i++) {
            var htmlAttr = _a[_i];
            if (htmlAttr === 'class') {
                target.classList.add(htmlAttributes[htmlAttr]);
            }
            else if (htmlAttr === 'disabled' && htmlAttributes[htmlAttr] === 'disabled') {
                rte.enabled = false;
                rte.setEnable();
            }
            else if (htmlAttr === 'readonly' && htmlAttributes[htmlAttr] === 'readonly') {
                rte.readonly = true;
                rte.setReadOnly(initial);
            }
            else if (htmlAttr === 'style') {
                target.setAttribute('style', htmlAttributes[htmlAttr]);
            }
            else if (htmlAttr === 'tabindex') {
                rte.inputElement.setAttribute('tabindex', htmlAttributes[htmlAttr]);
            }
            else if (htmlAttr === 'placeholder') {
                rte.placeholder = htmlAttributes[htmlAttr];
                rte.setPlaceHolder();
            }
            else {
                var validateAttr = ['name', 'required'];
                if (validateAttr.indexOf(htmlAttr) > -1) {
                    rte.valueContainer.setAttribute(htmlAttr, htmlAttributes[htmlAttr]);
                }
                else {
                    target.setAttribute(htmlAttr, htmlAttributes[htmlAttr]);
                }
            }
        }
    }
}
