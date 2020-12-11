/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { trustedHTMLFromString } from '../util/security/trusted_types';
/**
 * This helper is used to get hold of an inert tree of DOM elements containing dirty HTML
 * that needs sanitizing.
 * Depending upon browser support we use one of two strategies for doing this.
 * Default: DOMParser strategy
 * Fallback: InertDocument strategy
 */
export function getInertBodyHelper(defaultDoc) {
    return isDOMParserAvailable() ? new DOMParserHelper() : new InertDocumentHelper(defaultDoc);
}
/**
 * Uses DOMParser to create and fill an inert body element.
 * This is the default strategy used in browsers that support it.
 */
class DOMParserHelper {
    getInertBodyElement(html) {
        // We add these extra elements to ensure that the rest of the content is parsed as expected
        // e.g. leading whitespace is maintained and tags like `<meta>` do not get hoisted to the
        // `<head>` tag. Note that the `<body>` tag is closed implicitly to prevent unclosed tags
        // in `html` from consuming the otherwise explicit `</body>` tag.
        html = '<body><remove></remove>' + html;
        try {
            const body = new window.DOMParser()
                .parseFromString(trustedHTMLFromString(html), 'text/html')
                .body;
            body.removeChild(body.firstChild);
            return body;
        }
        catch (_a) {
            return null;
        }
    }
}
/**
 * Use an HTML5 `template` element, if supported, or an inert body element created via
 * `createHtmlDocument` to create and fill an inert DOM element.
 * This is the fallback strategy if the browser does not support DOMParser.
 */
class InertDocumentHelper {
    constructor(defaultDoc) {
        this.defaultDoc = defaultDoc;
        this.inertDocument = this.defaultDoc.implementation.createHTMLDocument('sanitization-inert');
        if (this.inertDocument.body == null) {
            // usually there should be only one body element in the document, but IE doesn't have any, so
            // we need to create one.
            const inertHtml = this.inertDocument.createElement('html');
            this.inertDocument.appendChild(inertHtml);
            const inertBodyElement = this.inertDocument.createElement('body');
            inertHtml.appendChild(inertBodyElement);
        }
    }
    getInertBodyElement(html) {
        // Prefer using <template> element if supported.
        const templateEl = this.inertDocument.createElement('template');
        if ('content' in templateEl) {
            templateEl.innerHTML = trustedHTMLFromString(html);
            return templateEl;
        }
        // Note that previously we used to do something like `this.inertDocument.body.innerHTML = html`
        // and we returned the inert `body` node. This was changed, because IE seems to treat setting
        // `innerHTML` on an inserted element differently, compared to one that hasn't been inserted
        // yet. In particular, IE appears to split some of the text into multiple text nodes rather
        // than keeping them in a single one which ends up messing with Ivy's i18n parsing further
        // down the line. This has been worked around by creating a new inert `body` and using it as
        // the root node in which we insert the HTML.
        const inertBody = this.inertDocument.createElement('body');
        inertBody.innerHTML = trustedHTMLFromString(html);
        // Support: IE 11 only
        // strip custom-namespaced attributes on IE<=11
        if (this.defaultDoc.documentMode) {
            this.stripCustomNsAttrs(inertBody);
        }
        return inertBody;
    }
    /**
     * When IE11 comes across an unknown namespaced attribute e.g. 'xlink:foo' it adds 'xmlns:ns1'
     * attribute to declare ns1 namespace and prefixes the attribute with 'ns1' (e.g.
     * 'ns1:xlink:foo').
     *
     * This is undesirable since we don't want to allow any of these custom attributes. This method
     * strips them all.
     */
    stripCustomNsAttrs(el) {
        const elAttrs = el.attributes;
        // loop backwards so that we can support removals.
        for (let i = elAttrs.length - 1; 0 < i; i--) {
            const attrib = elAttrs.item(i);
            const attrName = attrib.name;
            if (attrName === 'xmlns:ns1' || attrName.indexOf('ns1:') === 0) {
                el.removeAttribute(attrName);
            }
        }
        let childNode = el.firstChild;
        while (childNode) {
            if (childNode.nodeType === Node.ELEMENT_NODE)
                this.stripCustomNsAttrs(childNode);
            childNode = childNode.nextSibling;
        }
    }
}
/**
 * We need to determine whether the DOMParser exists in the global context and
 * supports parsing HTML; HTML parsing support is not as wide as other formats, see
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMParser#Browser_compatibility.
 *
 * @suppress {uselessCode}
 */
export function isDOMParserAvailable() {
    try {
        return !!new window.DOMParser().parseFromString(trustedHTMLFromString(''), 'text/html');
    }
    catch (_a) {
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5lcnRfYm9keS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvcmUvc3JjL3Nhbml0aXphdGlvbi9pbmVydF9ib2R5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBRXJFOzs7Ozs7R0FNRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxVQUFvQjtJQUNyRCxPQUFPLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDOUYsQ0FBQztBQVNEOzs7R0FHRztBQUNILE1BQU0sZUFBZTtJQUNuQixtQkFBbUIsQ0FBQyxJQUFZO1FBQzlCLDJGQUEyRjtRQUMzRix5RkFBeUY7UUFDekYseUZBQXlGO1FBQ3pGLGlFQUFpRTtRQUNqRSxJQUFJLEdBQUcseUJBQXlCLEdBQUcsSUFBSSxDQUFDO1FBQ3hDLElBQUk7WUFDRixNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7aUJBQ2pCLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQVcsRUFBRSxXQUFXLENBQUM7aUJBQ25FLElBQXVCLENBQUM7WUFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVyxDQUFDLENBQUM7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUFDLFdBQU07WUFDTixPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztDQUNGO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sbUJBQW1CO0lBR3ZCLFlBQW9CLFVBQW9CO1FBQXBCLGVBQVUsR0FBVixVQUFVLENBQVU7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRTdGLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO1lBQ25DLDZGQUE2RjtZQUM3Rix5QkFBeUI7WUFDekIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRSxTQUFTLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDekM7SUFDSCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBWTtRQUM5QixnREFBZ0Q7UUFDaEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEUsSUFBSSxTQUFTLElBQUksVUFBVSxFQUFFO1lBQzNCLFVBQVUsQ0FBQyxTQUFTLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFXLENBQUM7WUFDN0QsT0FBTyxVQUFVLENBQUM7U0FDbkI7UUFFRCwrRkFBK0Y7UUFDL0YsNkZBQTZGO1FBQzdGLDRGQUE0RjtRQUM1RiwyRkFBMkY7UUFDM0YsMEZBQTBGO1FBQzFGLDRGQUE0RjtRQUM1Riw2Q0FBNkM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsU0FBUyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQVcsQ0FBQztRQUU1RCxzQkFBc0I7UUFDdEIsK0NBQStDO1FBQy9DLElBQUssSUFBSSxDQUFDLFVBQWtCLENBQUMsWUFBWSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNwQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ssa0JBQWtCLENBQUMsRUFBVztRQUNwQyxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO1FBQzlCLGtEQUFrRDtRQUNsRCxLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLFFBQVEsR0FBRyxNQUFPLENBQUMsSUFBSSxDQUFDO1lBQzlCLElBQUksUUFBUSxLQUFLLFdBQVcsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDOUQsRUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtTQUNGO1FBQ0QsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDLFVBQXlCLENBQUM7UUFDN0MsT0FBTyxTQUFTLEVBQUU7WUFDaEIsSUFBSSxTQUFTLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZO2dCQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFvQixDQUFDLENBQUM7WUFDNUYsU0FBUyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7U0FDbkM7SUFDSCxDQUFDO0NBQ0Y7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsb0JBQW9CO0lBQ2xDLElBQUk7UUFDRixPQUFPLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQzNDLHFCQUFxQixDQUFDLEVBQUUsQ0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3ZEO0lBQUMsV0FBTTtRQUNOLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHJ1c3RlZEhUTUxGcm9tU3RyaW5nfSBmcm9tICcuLi91dGlsL3NlY3VyaXR5L3RydXN0ZWRfdHlwZXMnO1xuXG4vKipcbiAqIFRoaXMgaGVscGVyIGlzIHVzZWQgdG8gZ2V0IGhvbGQgb2YgYW4gaW5lcnQgdHJlZSBvZiBET00gZWxlbWVudHMgY29udGFpbmluZyBkaXJ0eSBIVE1MXG4gKiB0aGF0IG5lZWRzIHNhbml0aXppbmcuXG4gKiBEZXBlbmRpbmcgdXBvbiBicm93c2VyIHN1cHBvcnQgd2UgdXNlIG9uZSBvZiB0d28gc3RyYXRlZ2llcyBmb3IgZG9pbmcgdGhpcy5cbiAqIERlZmF1bHQ6IERPTVBhcnNlciBzdHJhdGVneVxuICogRmFsbGJhY2s6IEluZXJ0RG9jdW1lbnQgc3RyYXRlZ3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEluZXJ0Qm9keUhlbHBlcihkZWZhdWx0RG9jOiBEb2N1bWVudCk6IEluZXJ0Qm9keUhlbHBlciB7XG4gIHJldHVybiBpc0RPTVBhcnNlckF2YWlsYWJsZSgpID8gbmV3IERPTVBhcnNlckhlbHBlcigpIDogbmV3IEluZXJ0RG9jdW1lbnRIZWxwZXIoZGVmYXVsdERvYyk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5lcnRCb2R5SGVscGVyIHtcbiAgLyoqXG4gICAqIEdldCBhbiBpbmVydCBET00gZWxlbWVudCBjb250YWluaW5nIERPTSBjcmVhdGVkIGZyb20gdGhlIGRpcnR5IEhUTUwgc3RyaW5nIHByb3ZpZGVkLlxuICAgKi9cbiAgZ2V0SW5lcnRCb2R5RWxlbWVudDogKGh0bWw6IHN0cmluZykgPT4gSFRNTEVsZW1lbnQgfCBudWxsO1xufVxuXG4vKipcbiAqIFVzZXMgRE9NUGFyc2VyIHRvIGNyZWF0ZSBhbmQgZmlsbCBhbiBpbmVydCBib2R5IGVsZW1lbnQuXG4gKiBUaGlzIGlzIHRoZSBkZWZhdWx0IHN0cmF0ZWd5IHVzZWQgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGl0LlxuICovXG5jbGFzcyBET01QYXJzZXJIZWxwZXIgaW1wbGVtZW50cyBJbmVydEJvZHlIZWxwZXIge1xuICBnZXRJbmVydEJvZHlFbGVtZW50KGh0bWw6IHN0cmluZyk6IEhUTUxFbGVtZW50fG51bGwge1xuICAgIC8vIFdlIGFkZCB0aGVzZSBleHRyYSBlbGVtZW50cyB0byBlbnN1cmUgdGhhdCB0aGUgcmVzdCBvZiB0aGUgY29udGVudCBpcyBwYXJzZWQgYXMgZXhwZWN0ZWRcbiAgICAvLyBlLmcuIGxlYWRpbmcgd2hpdGVzcGFjZSBpcyBtYWludGFpbmVkIGFuZCB0YWdzIGxpa2UgYDxtZXRhPmAgZG8gbm90IGdldCBob2lzdGVkIHRvIHRoZVxuICAgIC8vIGA8aGVhZD5gIHRhZy4gTm90ZSB0aGF0IHRoZSBgPGJvZHk+YCB0YWcgaXMgY2xvc2VkIGltcGxpY2l0bHkgdG8gcHJldmVudCB1bmNsb3NlZCB0YWdzXG4gICAgLy8gaW4gYGh0bWxgIGZyb20gY29uc3VtaW5nIHRoZSBvdGhlcndpc2UgZXhwbGljaXQgYDwvYm9keT5gIHRhZy5cbiAgICBodG1sID0gJzxib2R5PjxyZW1vdmU+PC9yZW1vdmU+JyArIGh0bWw7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGJvZHkgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgICAgICAgICAgICAgICAgICAgIC5wYXJzZUZyb21TdHJpbmcodHJ1c3RlZEhUTUxGcm9tU3RyaW5nKGh0bWwpIGFzIHN0cmluZywgJ3RleHQvaHRtbCcpXG4gICAgICAgICAgICAgICAgICAgICAgIC5ib2R5IGFzIEhUTUxCb2R5RWxlbWVudDtcbiAgICAgIGJvZHkucmVtb3ZlQ2hpbGQoYm9keS5maXJzdENoaWxkISk7XG4gICAgICByZXR1cm4gYm9keTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFVzZSBhbiBIVE1MNSBgdGVtcGxhdGVgIGVsZW1lbnQsIGlmIHN1cHBvcnRlZCwgb3IgYW4gaW5lcnQgYm9keSBlbGVtZW50IGNyZWF0ZWQgdmlhXG4gKiBgY3JlYXRlSHRtbERvY3VtZW50YCB0byBjcmVhdGUgYW5kIGZpbGwgYW4gaW5lcnQgRE9NIGVsZW1lbnQuXG4gKiBUaGlzIGlzIHRoZSBmYWxsYmFjayBzdHJhdGVneSBpZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IERPTVBhcnNlci5cbiAqL1xuY2xhc3MgSW5lcnREb2N1bWVudEhlbHBlciBpbXBsZW1lbnRzIEluZXJ0Qm9keUhlbHBlciB7XG4gIHByaXZhdGUgaW5lcnREb2N1bWVudDogRG9jdW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWZhdWx0RG9jOiBEb2N1bWVudCkge1xuICAgIHRoaXMuaW5lcnREb2N1bWVudCA9IHRoaXMuZGVmYXVsdERvYy5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoJ3Nhbml0aXphdGlvbi1pbmVydCcpO1xuXG4gICAgaWYgKHRoaXMuaW5lcnREb2N1bWVudC5ib2R5ID09IG51bGwpIHtcbiAgICAgIC8vIHVzdWFsbHkgdGhlcmUgc2hvdWxkIGJlIG9ubHkgb25lIGJvZHkgZWxlbWVudCBpbiB0aGUgZG9jdW1lbnQsIGJ1dCBJRSBkb2Vzbid0IGhhdmUgYW55LCBzb1xuICAgICAgLy8gd2UgbmVlZCB0byBjcmVhdGUgb25lLlxuICAgICAgY29uc3QgaW5lcnRIdG1sID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKTtcbiAgICAgIHRoaXMuaW5lcnREb2N1bWVudC5hcHBlbmRDaGlsZChpbmVydEh0bWwpO1xuICAgICAgY29uc3QgaW5lcnRCb2R5RWxlbWVudCA9IHRoaXMuaW5lcnREb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib2R5Jyk7XG4gICAgICBpbmVydEh0bWwuYXBwZW5kQ2hpbGQoaW5lcnRCb2R5RWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SW5lcnRCb2R5RWxlbWVudChodG1sOiBzdHJpbmcpOiBIVE1MRWxlbWVudHxudWxsIHtcbiAgICAvLyBQcmVmZXIgdXNpbmcgPHRlbXBsYXRlPiBlbGVtZW50IGlmIHN1cHBvcnRlZC5cbiAgICBjb25zdCB0ZW1wbGF0ZUVsID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gICAgaWYgKCdjb250ZW50JyBpbiB0ZW1wbGF0ZUVsKSB7XG4gICAgICB0ZW1wbGF0ZUVsLmlubmVySFRNTCA9IHRydXN0ZWRIVE1MRnJvbVN0cmluZyhodG1sKSBhcyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVtcGxhdGVFbDtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgcHJldmlvdXNseSB3ZSB1c2VkIHRvIGRvIHNvbWV0aGluZyBsaWtlIGB0aGlzLmluZXJ0RG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBodG1sYFxuICAgIC8vIGFuZCB3ZSByZXR1cm5lZCB0aGUgaW5lcnQgYGJvZHlgIG5vZGUuIFRoaXMgd2FzIGNoYW5nZWQsIGJlY2F1c2UgSUUgc2VlbXMgdG8gdHJlYXQgc2V0dGluZ1xuICAgIC8vIGBpbm5lckhUTUxgIG9uIGFuIGluc2VydGVkIGVsZW1lbnQgZGlmZmVyZW50bHksIGNvbXBhcmVkIHRvIG9uZSB0aGF0IGhhc24ndCBiZWVuIGluc2VydGVkXG4gICAgLy8geWV0LiBJbiBwYXJ0aWN1bGFyLCBJRSBhcHBlYXJzIHRvIHNwbGl0IHNvbWUgb2YgdGhlIHRleHQgaW50byBtdWx0aXBsZSB0ZXh0IG5vZGVzIHJhdGhlclxuICAgIC8vIHRoYW4ga2VlcGluZyB0aGVtIGluIGEgc2luZ2xlIG9uZSB3aGljaCBlbmRzIHVwIG1lc3Npbmcgd2l0aCBJdnkncyBpMThuIHBhcnNpbmcgZnVydGhlclxuICAgIC8vIGRvd24gdGhlIGxpbmUuIFRoaXMgaGFzIGJlZW4gd29ya2VkIGFyb3VuZCBieSBjcmVhdGluZyBhIG5ldyBpbmVydCBgYm9keWAgYW5kIHVzaW5nIGl0IGFzXG4gICAgLy8gdGhlIHJvb3Qgbm9kZSBpbiB3aGljaCB3ZSBpbnNlcnQgdGhlIEhUTUwuXG4gICAgY29uc3QgaW5lcnRCb2R5ID0gdGhpcy5pbmVydERvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JvZHknKTtcbiAgICBpbmVydEJvZHkuaW5uZXJIVE1MID0gdHJ1c3RlZEhUTUxGcm9tU3RyaW5nKGh0bWwpIGFzIHN0cmluZztcblxuICAgIC8vIFN1cHBvcnQ6IElFIDExIG9ubHlcbiAgICAvLyBzdHJpcCBjdXN0b20tbmFtZXNwYWNlZCBhdHRyaWJ1dGVzIG9uIElFPD0xMVxuICAgIGlmICgodGhpcy5kZWZhdWx0RG9jIGFzIGFueSkuZG9jdW1lbnRNb2RlKSB7XG4gICAgICB0aGlzLnN0cmlwQ3VzdG9tTnNBdHRycyhpbmVydEJvZHkpO1xuICAgIH1cblxuICAgIHJldHVybiBpbmVydEJvZHk7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiBJRTExIGNvbWVzIGFjcm9zcyBhbiB1bmtub3duIG5hbWVzcGFjZWQgYXR0cmlidXRlIGUuZy4gJ3hsaW5rOmZvbycgaXQgYWRkcyAneG1sbnM6bnMxJ1xuICAgKiBhdHRyaWJ1dGUgdG8gZGVjbGFyZSBuczEgbmFtZXNwYWNlIGFuZCBwcmVmaXhlcyB0aGUgYXR0cmlidXRlIHdpdGggJ25zMScgKGUuZy5cbiAgICogJ25zMTp4bGluazpmb28nKS5cbiAgICpcbiAgICogVGhpcyBpcyB1bmRlc2lyYWJsZSBzaW5jZSB3ZSBkb24ndCB3YW50IHRvIGFsbG93IGFueSBvZiB0aGVzZSBjdXN0b20gYXR0cmlidXRlcy4gVGhpcyBtZXRob2RcbiAgICogc3RyaXBzIHRoZW0gYWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBzdHJpcEN1c3RvbU5zQXR0cnMoZWw6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBlbEF0dHJzID0gZWwuYXR0cmlidXRlcztcbiAgICAvLyBsb29wIGJhY2t3YXJkcyBzbyB0aGF0IHdlIGNhbiBzdXBwb3J0IHJlbW92YWxzLlxuICAgIGZvciAobGV0IGkgPSBlbEF0dHJzLmxlbmd0aCAtIDE7IDAgPCBpOyBpLS0pIHtcbiAgICAgIGNvbnN0IGF0dHJpYiA9IGVsQXR0cnMuaXRlbShpKTtcbiAgICAgIGNvbnN0IGF0dHJOYW1lID0gYXR0cmliIS5uYW1lO1xuICAgICAgaWYgKGF0dHJOYW1lID09PSAneG1sbnM6bnMxJyB8fCBhdHRyTmFtZS5pbmRleE9mKCduczE6JykgPT09IDApIHtcbiAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGF0dHJOYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNoaWxkTm9kZSA9IGVsLmZpcnN0Q2hpbGQgYXMgTm9kZSB8IG51bGw7XG4gICAgd2hpbGUgKGNoaWxkTm9kZSkge1xuICAgICAgaWYgKGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUpIHRoaXMuc3RyaXBDdXN0b21Oc0F0dHJzKGNoaWxkTm9kZSBhcyBFbGVtZW50KTtcbiAgICAgIGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZztcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXZSBuZWVkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBET01QYXJzZXIgZXhpc3RzIGluIHRoZSBnbG9iYWwgY29udGV4dCBhbmRcbiAqIHN1cHBvcnRzIHBhcnNpbmcgSFRNTDsgSFRNTCBwYXJzaW5nIHN1cHBvcnQgaXMgbm90IGFzIHdpZGUgYXMgb3RoZXIgZm9ybWF0cywgc2VlXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRE9NUGFyc2VyI0Jyb3dzZXJfY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBAc3VwcHJlc3Mge3VzZWxlc3NDb2RlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNET01QYXJzZXJBdmFpbGFibGUoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhbmV3IHdpbmRvdy5ET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoXG4gICAgICAgIHRydXN0ZWRIVE1MRnJvbVN0cmluZygnJykgYXMgc3RyaW5nLCAndGV4dC9odG1sJyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19