/* eslint-disable jsdoc/require-param, valid-jsdoc */
/**
 * Function helps to find which highlightSearch is to call based on your data.
 *
 * @param  {HTMLElement} element - Specifies an li element.
 * @param  {string} query - Specifies the string to be highlighted.
 * @param  {boolean} ignoreCase - Specifies the ignoreCase option.
 * @param  {HightLightType} type - Specifies the type of highlight.
 * @returns {void}
 */
export function highlightSearch(element, query, ignoreCase, type) {
    if (query === '') {
        return;
    }
    else {
        var ignoreRegex = ignoreCase ? 'gim' : 'gm';
        // eslint-disable-next-line
        query = /^[a-zA-Z0-9- ]*$/.test(query) ? query : query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        var replaceQuery = type === 'StartsWith' ? '^(' + query + ')' : type === 'EndsWith' ?
            '(' + query + ')$' : '(' + query + ')';
        findTextNode(element, new RegExp(replaceQuery, ignoreRegex));
    }
}
/* eslint-enable jsdoc/require-param, valid-jsdoc */
/**
 *
 * @param {HTMLElement} element - Specifies the element.
 * @param {RegExp} pattern - Specifies the regex to match the searched text.
 * @returns {void}
 */
function findTextNode(element, pattern) {
    for (var index = 0; element.childNodes && (index < element.childNodes.length); index++) {
        if (element.childNodes[index].nodeType === 3 && element.childNodes[index].textContent.trim() !== '') {
            var value = element.childNodes[index].nodeValue.trim().replace(pattern, '<span class="e-highlight">$1</span>');
            element.childNodes[index].nodeValue = '';
            element.innerHTML = element.innerHTML.trim() + value;
            break;
        }
        else {
            findTextNode(element.childNodes[index], pattern);
        }
    }
}
/**
 * Function helps to remove highlighted element based on your data.
 *
 * @param  {HTMLElement} content - Specifies an content element.
 * @returns {void}
 */
export function revertHighlightSearch(content) {
    var contentElement = content.querySelectorAll('.e-highlight');
    for (var i = contentElement.length - 1; i >= 0; i--) {
        var parent_1 = contentElement[i].parentNode;
        var text = document.createTextNode(contentElement[i].textContent);
        parent_1.replaceChild(text, contentElement[i]);
    }
}
