/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ErrorHandler, ɵɵdefineInjectable, ɵɵinject } from '@angular/core';
import { DOCUMENT } from './dom_tokens';
/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
export class ViewportScroller {
}
// De-sugared tree-shakable injection
// See #23917
/** @nocollapse */
ViewportScroller.ɵprov = ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window, ɵɵinject(ErrorHandler))
});
/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller {
    constructor(document, window, errorHandler) {
        this.document = document;
        this.window = window;
        this.errorHandler = errorHandler;
        this.offset = () => [0, 0];
    }
    /**
     * Configures the top offset used when scrolling to an anchor.
     * @param offset A position in screen coordinates (a tuple with x and y values)
     * or a function that returns the top offset position.
     *
     */
    setOffset(offset) {
        if (Array.isArray(offset)) {
            this.offset = () => offset;
        }
        else {
            this.offset = offset;
        }
    }
    /**
     * Retrieves the current scroll position.
     * @returns The position in screen coordinates.
     */
    getScrollPosition() {
        if (this.supportsScrolling()) {
            return [this.window.pageXOffset, this.window.pageYOffset];
        }
        else {
            return [0, 0];
        }
    }
    /**
     * Sets the scroll position.
     * @param position The new position in screen coordinates.
     */
    scrollToPosition(position) {
        if (this.supportsScrolling()) {
            this.window.scrollTo(position[0], position[1]);
        }
    }
    /**
     * Scrolls to an anchor element.
     * @param anchor The ID of the anchor element.
     */
    scrollToAnchor(anchor) {
        if (this.supportsScrolling()) {
            const elSelected = this.document.getElementById(anchor) || this.document.getElementsByName(anchor)[0];
            if (elSelected) {
                this.scrollToElement(elSelected);
            }
        }
    }
    /**
     * Disables automatic scroll restoration provided by the browser.
     */
    setHistoryScrollRestoration(scrollRestoration) {
        if (this.supportScrollRestoration()) {
            const history = this.window.history;
            if (history && history.scrollRestoration) {
                history.scrollRestoration = scrollRestoration;
            }
        }
    }
    scrollToElement(el) {
        const rect = el.getBoundingClientRect();
        const left = rect.left + this.window.pageXOffset;
        const top = rect.top + this.window.pageYOffset;
        const offset = this.offset();
        this.window.scrollTo(left - offset[0], top - offset[1]);
    }
    /**
     * We only support scroll restoration when we can get a hold of window.
     * This means that we do not support this behavior when running in a web worker.
     *
     * Lifting this restriction right now would require more changes in the dom adapter.
     * Since webworkers aren't widely used, we will lift it once RouterScroller is
     * battle-tested.
     */
    supportScrollRestoration() {
        try {
            if (!this.supportsScrolling()) {
                return false;
            }
            // The `scrollRestoration` property could be on the `history` instance or its prototype.
            const scrollRestorationDescriptor = getScrollRestorationProperty(this.window.history) ||
                getScrollRestorationProperty(Object.getPrototypeOf(this.window.history));
            // We can write to the `scrollRestoration` property if it is a writable data field or it has a
            // setter function.
            return !!scrollRestorationDescriptor &&
                !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
        }
        catch (_a) {
            return false;
        }
    }
    supportsScrolling() {
        try {
            return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
        }
        catch (_a) {
            return false;
        }
    }
}
function getScrollRestorationProperty(obj) {
    return Object.getOwnPropertyDescriptor(obj, 'scrollRestoration');
}
/**
 * Provides an empty implementation of the viewport scroller.
 */
export class NullViewportScroller {
    /**
     * Empty implementation
     */
    setOffset(offset) { }
    /**
     * Empty implementation
     */
    getScrollPosition() {
        return [0, 0];
    }
    /**
     * Empty implementation
     */
    scrollToPosition(position) { }
    /**
     * Empty implementation
     */
    scrollToAnchor(anchor) { }
    /**
     * Empty implementation
     */
    setHistoryScrollRestoration(scrollRestoration) { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRfc2Nyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3ZpZXdwb3J0X3Njcm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFJdEM7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCOztBQUNwQyxxQ0FBcUM7QUFDckMsYUFBYTtBQUNiLGtCQUFrQjtBQUNYLHNCQUFLLEdBQUcsa0JBQWtCLENBQUM7SUFDaEMsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztDQUMvRixDQUFDLENBQUM7QUFvQ0w7O0dBRUc7QUFDSCxNQUFNLE9BQU8sdUJBQXVCO0lBR2xDLFlBQW9CLFFBQWEsRUFBVSxNQUFXLEVBQVUsWUFBMEI7UUFBdEUsYUFBUSxHQUFSLFFBQVEsQ0FBSztRQUFVLFdBQU0sR0FBTixNQUFNLENBQUs7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUZsRixXQUFNLEdBQTJCLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXVDLENBQUM7SUFFOUY7Ozs7O09BS0c7SUFDSCxTQUFTLENBQUMsTUFBaUQ7UUFDekQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO1NB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QUNGLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLGFBQWEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDO1NBQ2hGO1FBQUMsV0FBTTtZQUNOLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7SUFDSCxDQUFDO0NBQ0Y7QUFFRCxTQUFTLDRCQUE0QixDQUFDLEdBQVE7SUFDNUMsT0FBTyxNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQjs7T0FFRztJQUNILFNBQVMsQ0FBQyxNQUFpRCxJQUFTLENBQUM7SUFFckU7O09BRUc7SUFDSCxpQkFBaUI7UUFDZixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNILGdCQUFnQixDQUFDLFFBQTBCLElBQVMsQ0FBQztJQUVyRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxNQUFjLElBQVMsQ0FBQztJQUV2Qzs7T0FFRztJQUNILDJCQUEyQixDQUFDLGlCQUFrQyxJQUFTLENBQUM7Q0FDekUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFcnJvckhhbmRsZXIsIMm1ybVkZWZpbmVJbmplY3RhYmxlLCDJtcm1aW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnLi9kb21fdG9rZW5zJztcblxuXG5cbi8qKlxuICogRGVmaW5lcyBhIHNjcm9sbCBwb3NpdGlvbiBtYW5hZ2VyLiBJbXBsZW1lbnRlZCBieSBgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXJgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvLyBEZS1zdWdhcmVkIHRyZWUtc2hha2FibGUgaW5qZWN0aW9uXG4gIC8vIFNlZSAjMjM5MTdcbiAgLyoqIEBub2NvbGxhcHNlICovXG4gIHN0YXRpYyDJtXByb3YgPSDJtcm1ZGVmaW5lSW5qZWN0YWJsZSh7XG4gICAgdG9rZW46IFZpZXdwb3J0U2Nyb2xsZXIsXG4gICAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAgIGZhY3Rvcnk6ICgpID0+IG5ldyBCcm93c2VyVmlld3BvcnRTY3JvbGxlcijJtcm1aW5qZWN0KERPQ1VNRU5UKSwgd2luZG93LCDJtcm1aW5qZWN0KEVycm9ySGFuZGxlcikpXG4gIH0pO1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgYWJzdHJhY3Qgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGN1cnJlbnQgc2Nyb2xsIHBvc2l0aW9uLlxuICAgKiBAcmV0dXJucyBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKS5cbiAgICovXG4gIGFic3RyYWN0IGdldFNjcm9sbFBvc2l0aW9uKCk6IFtudW1iZXIsIG51bWJlcl07XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYSBzcGVjaWZpZWQgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBBIHBvc2l0aW9uIGluIHNjcmVlbiBjb29yZGluYXRlcyAoYSB0dXBsZSB3aXRoIHggYW5kIHkgdmFsdWVzKS5cbiAgICovXG4gIGFic3RyYWN0IHNjcm9sbFRvUG9zaXRpb24ocG9zaXRpb246IFtudW1iZXIsIG51bWJlcl0pOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBTY3JvbGxzIHRvIGFuIGFuY2hvciBlbGVtZW50LlxuICAgKiBAcGFyYW0gYW5jaG9yIFRoZSBJRCBvZiB0aGUgYW5jaG9yIGVsZW1lbnQuXG4gICAqL1xuICBhYnN0cmFjdCBzY3JvbGxUb0FuY2hvcihhbmNob3I6IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIERpc2FibGVzIGF1dG9tYXRpYyBzY3JvbGwgcmVzdG9yYXRpb24gcHJvdmlkZWQgYnkgdGhlIGJyb3dzZXIuXG4gICAqIFNlZSBhbHNvIFt3aW5kb3cuaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvblxuICAgKiBpbmZvXShodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvdXBkYXRlcy8yMDE1LzA5L2hpc3RvcnktYXBpLXNjcm9sbC1yZXN0b3JhdGlvbikuXG4gICAqL1xuICBhYnN0cmFjdCBzZXRIaXN0b3J5U2Nyb2xsUmVzdG9yYXRpb24oc2Nyb2xsUmVzdG9yYXRpb246ICdhdXRvJ3wnbWFudWFsJyk6IHZvaWQ7XG59XG5cbi8qKlxuICogTWFuYWdlcyB0aGUgc2Nyb2xsIHBvc2l0aW9uIGZvciBhIGJyb3dzZXIgd2luZG93LlxuICovXG5leHBvcnQgY2xhc3MgQnJvd3NlclZpZXdwb3J0U2Nyb2xsZXIgaW1wbGVtZW50cyBWaWV3cG9ydFNjcm9sbGVyIHtcbiAgcHJpdmF0ZSBvZmZzZXQ6ICgpID0+IFtudW1iZXIsIG51bWJlcl0gPSAoKSA9PiBbMCwgMF07XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBkb2N1bWVudDogYW55LCBwcml2YXRlIHdpbmRvdzogYW55LCBwcml2YXRlIGVycm9ySGFuZGxlcjogRXJyb3JIYW5kbGVyKSB7fVxuXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSB0b3Agb2Zmc2V0IHVzZWQgd2hlbiBzY3JvbGxpbmcgdG8gYW4gYW5jaG9yLlxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzIChhIHR1cGxlIHdpdGggeCBhbmQgeSB2YWx1ZXMpXG4gICAqIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSB0b3Agb2Zmc2V0IHBvc2l0aW9uLlxuICAgKlxuICAgKi9cbiAgc2V0T2Zmc2V0KG9mZnNldDogW251bWJlciwgbnVtYmVyXXwoKCkgPT4gW251bWJlciwgbnVtYmVyXSkpOiB2b2lkIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShvZmZzZXQpKSB7XG4gICAgICB0aGlzLm9mZnNldCA9ICgpID0+IG9mZnNldDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgY3VycmVudCBzY3JvbGwgcG9zaXRpb24uXG4gICAqIEByZXR1cm5zIFRoZSBwb3NpdGlvbiBpbiBzY3JlZW4gY29vcmRpbmF0ZXMuXG4gICAqL1xuICBnZXRTY3JvbGxQb3NpdGlvbigpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0c1Njcm9sbGluZygpKSB7XG4gICAgICByZXR1cm4gW3RoaXMud2luZG93LnBhZ2VYT2Zmc2V0LCB0aGlzLndpbmRvdy5wYWdlWU9mZnNldF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNjcm9sbCBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHBvc2l0aW9uIFRoZSBuZXcgcG9zaXRpb24gaW4gc2NyZWVuIGNvb3JkaW5hdGVzLlxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgIHRoaXMud2luZG93LnNjcm9sbFRvKHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbHMgdG8gYW4gYW5jaG9yIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBhbmNob3IgVGhlIElEIG9mIHRoZSBhbmNob3IgZWxlbWVudC5cbiAgICovXG4gIHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3VwcG9ydHNTY3JvbGxpbmcoKSkge1xuICAgICAgY29uc3QgZWxTZWxlY3RlZCA9XG4gICAgICAgICAgdGhpcy5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmNob3IpIHx8IHRoaXMuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoYW5jaG9yKVswXTtcbiAgICAgIGlmIChlbFNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9FbGVtZW50KGVsU2VsZWN0ZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc2Nyb2xsIHJlc3RvcmF0aW9uIHByb3ZpZGVkIGJ5IHRoZSBicm93c2VyLlxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdXBwb3J0U2Nyb2xsUmVzdG9yYXRpb24oKSkge1xuICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMud2luZG93Lmhpc3Rvcnk7XG4gICAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uKSB7XG4gICAgICAgIGhpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSBzY3JvbGxSZXN0b3JhdGlvbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNjcm9sbFRvRWxlbWVudChlbDogYW55KTogdm9pZCB7XG4gICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IGxlZnQgPSByZWN0LmxlZnQgKyB0aGlzLndpbmRvdy5wYWdlWE9mZnNldDtcbiAgICBjb25zdCB0b3AgPSByZWN0LnRvcCArIHRoaXMud2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMub2Zmc2V0KCk7XG4gICAgdGhpcy53aW5kb3cuc2Nyb2xsVG8obGVmdCAtIG9mZnNldFswXSwgdG9wIC0gb2Zmc2V0WzFdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBvbmx5IHN1cHBvcnQgc2Nyb2xsIHJlc3RvcmF0aW9uIHdoZW4gd2UgY2FuIGdldCBhIGhvbGQgb2Ygd2luZG93LlxuICAgKiBUaGlzIG1lYW5zIHRoYXQgd2UgZG8gbm90IHN1cHBvcnQgdGhpcyBiZWhhdmlvciB3aGVuIHJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyLlxuICAgKlxuICAgKiBMaWZ0aW5nIHRoaXMgcmVzdHJpY3Rpb24gcmlnaHQgbm93IHdvdWxkIHJlcXVpcmUgbW9yZSBjaGFuZ2VzIGluIHRoZSBkb20gYWRhcHRlci5cbiAgICogU2luY2Ugd2Vid29ya2VycyBhcmVuJ3Qgd2lkZWx5IHVzZWQsIHdlIHdpbGwgbGlmdCBpdCBvbmNlIFJvdXRlclNjcm9sbGVyIGlzXG4gICAqIGJhdHRsZS10ZXN0ZWQuXG4gICAqL1xuICBwcml2YXRlIHN1cHBvcnRTY3JvbGxSZXN0b3JhdGlvbigpOiBib29sZWFuIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCF0aGlzLnN1cHBvcnRzU2Nyb2xsaW5nKCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gVGhlIGBzY3JvbGxSZXN0b3JhdGlvbmAgcHJvcGVydHkgY291bGQgYmUgb24gdGhlIGBoaXN0b3J5YCBpbnN0YW5jZSBvciBpdHMgcHJvdG90eXBlLlxuICAgICAgY29uc3Qgc2Nyb2xsUmVzdG9yYXRpb25EZXNjcmlwdG9yID0gZ2V0U2Nyb2xsUmVzdG9yYXRpb25Qcm9wZXJ0eSh0aGlzLndpbmRvdy5oaXN0b3J5KSB8fFxuICAgICAgICAgIGdldFNjcm9sbFJlc3RvcmF0aW9uUHJvcGVydHkoT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMud2luZG93Lmhpc3RvcnkpKTtcbiAgICAgIC8vIFdlIGNhbiB3cml0ZSB0byB0aGUgYHNjcm9sbFJlc3RvcmF0aW9uYCBwcm9wZXJ0eSBpZiBpdCBpcyBhIHdyaXRhYmxlIGRhdGEgZmllbGQgb3IgaXQgaGFzIGFcbiAgICAgIC8vIHNldHRlciBmdW5jdGlvbi5cbiAgICAgIHJldHVybiAhIXNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvciAmJlxuICAgICAgICAgICEhKHNjcm9sbFJlc3RvcmF0aW9uRGVzY3JpcHRvci53cml0YWJsZSB8fCBzY3JvbGxSZXN0b3JhdGlvbkRlc2NyaXB0b3Iuc2V0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN1cHBvcnRzU2Nyb2xsaW5nKCk6IGJvb2xlYW4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gISF0aGlzLndpbmRvdyAmJiAhIXRoaXMud2luZG93LnNjcm9sbFRvICYmICdwYWdlWE9mZnNldCcgaW4gdGhpcy53aW5kb3c7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbFJlc3RvcmF0aW9uUHJvcGVydHkob2JqOiBhbnkpOiBQcm9wZXJ0eURlc2NyaXB0b3J8dW5kZWZpbmVkIHtcbiAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCAnc2Nyb2xsUmVzdG9yYXRpb24nKTtcbn1cblxuLyoqXG4gKiBQcm92aWRlcyBhbiBlbXB0eSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdmlld3BvcnQgc2Nyb2xsZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBOdWxsVmlld3BvcnRTY3JvbGxlciBpbXBsZW1lbnRzIFZpZXdwb3J0U2Nyb2xsZXIge1xuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNldE9mZnNldChvZmZzZXQ6IFtudW1iZXIsIG51bWJlcl18KCgpID0+IFtudW1iZXIsIG51bWJlcl0pKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgZ2V0U2Nyb2xsUG9zaXRpb24oKTogW251bWJlciwgbnVtYmVyXSB7XG4gICAgcmV0dXJuIFswLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9Qb3NpdGlvbihwb3NpdGlvbjogW251bWJlciwgbnVtYmVyXSk6IHZvaWQge31cblxuICAvKipcbiAgICogRW1wdHkgaW1wbGVtZW50YXRpb25cbiAgICovXG4gIHNjcm9sbFRvQW5jaG9yKGFuY2hvcjogc3RyaW5nKTogdm9pZCB7fVxuXG4gIC8qKlxuICAgKiBFbXB0eSBpbXBsZW1lbnRhdGlvblxuICAgKi9cbiAgc2V0SGlzdG9yeVNjcm9sbFJlc3RvcmF0aW9uKHNjcm9sbFJlc3RvcmF0aW9uOiAnYXV0byd8J21hbnVhbCcpOiB2b2lkIHt9XG59XG4iXX0=