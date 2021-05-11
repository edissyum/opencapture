/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertDefined } from '../../util/assert';
import { global } from '../../util/global';
import { setProfiler } from '../profiler';
import { applyChanges } from './change_detection_utils';
import { getComponent, getContext, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents } from './discovery_utils';
/**
 * This file introduces series of globally accessible debug tools
 * to allow for the Angular debugging story to function.
 *
 * To see this in action run the following command:
 *
 *   bazel run --config=ivy
 *   //packages/core/test/bundling/todo:devserver
 *
 *  Then load `localhost:5432` and start using the console tools.
 */
/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 * */
export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';
let _published = false;
/**
 * Publishes a collection of default debug tools onto`window.ng`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
export function publishDefaultGlobalUtils() {
    if (!_published) {
        _published = true;
        /**
         * Warning: this function is *INTERNAL* and should not be relied upon in application's code.
         * The contract of the function might be changed in any release and/or the function can be
         * removed completely.
         */
        publishGlobalUtil('ɵsetProfiler', setProfiler);
        publishGlobalUtil('getComponent', getComponent);
        publishGlobalUtil('getContext', getContext);
        publishGlobalUtil('getListeners', getListeners);
        publishGlobalUtil('getOwningComponent', getOwningComponent);
        publishGlobalUtil('getHostElement', getHostElement);
        publishGlobalUtil('getInjector', getInjector);
        publishGlobalUtil('getRootComponents', getRootComponents);
        publishGlobalUtil('getDirectives', getDirectives);
        publishGlobalUtil('applyChanges', applyChanges);
    }
}
/**
 * Publishes the given function to `window.ng` so that it can be
 * used from the browser console when an application is not in production.
 */
export function publishGlobalUtil(name, fn) {
    if (typeof COMPILED === 'undefined' || !COMPILED) {
        // Note: we can't export `ng` when using closure enhanced optimization as:
        // - closure declares globals itself for minified names, which sometimes clobber our `ng` global
        // - we can't declare a closure extern as the namespace `ng` is already used within Google
        //   for typings for AngularJS (via `goog.provide('ng....')`).
        const w = global;
        ngDevMode && assertDefined(fn, 'function not defined');
        if (w) {
            let container = w[GLOBAL_PUBLISH_EXPANDO_KEY];
            if (!container) {
                container = w[GLOBAL_PUBLISH_EXPANDO_KEY] = {};
            }
            container[name] = fn;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsX3V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29yZS9zcmMvcmVuZGVyMy91dGlsL2dsb2JhbF91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDaEQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBSTVKOzs7Ozs7Ozs7O0dBVUc7QUFFSDs7O0tBR0s7QUFDTCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUM7QUFFL0MsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLHlCQUF5QjtJQUN2QyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQztRQUVsQjs7OztXQUlHO1FBQ0gsaUJBQWlCLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQy9DLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNoRCxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDNUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ2hELGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDNUQsaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDcEQsaUJBQWlCLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDMUQsaUJBQWlCLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2xELGlCQUFpQixDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztLQUNqRDtBQUNILENBQUM7QUFNRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBWSxFQUFFLEVBQVk7SUFDMUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDaEQsMEVBQTBFO1FBQzFFLGdHQUFnRztRQUNoRywwRkFBMEY7UUFDMUYsOERBQThEO1FBQzlELE1BQU0sQ0FBQyxHQUFHLE1BQXVDLENBQUM7UUFDbEQsU0FBUyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsRUFBRTtZQUNMLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ2QsU0FBUyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNoRDtZQUNELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDdEI7S0FDRjtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7YXNzZXJ0RGVmaW5lZH0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtnbG9iYWx9IGZyb20gJy4uLy4uL3V0aWwvZ2xvYmFsJztcbmltcG9ydCB7c2V0UHJvZmlsZXJ9IGZyb20gJy4uL3Byb2ZpbGVyJztcbmltcG9ydCB7YXBwbHlDaGFuZ2VzfSBmcm9tICcuL2NoYW5nZV9kZXRlY3Rpb25fdXRpbHMnO1xuaW1wb3J0IHtnZXRDb21wb25lbnQsIGdldENvbnRleHQsIGdldERpcmVjdGl2ZXMsIGdldEhvc3RFbGVtZW50LCBnZXRJbmplY3RvciwgZ2V0TGlzdGVuZXJzLCBnZXRPd25pbmdDb21wb25lbnQsIGdldFJvb3RDb21wb25lbnRzfSBmcm9tICcuL2Rpc2NvdmVyeV91dGlscyc7XG5cblxuXG4vKipcbiAqIFRoaXMgZmlsZSBpbnRyb2R1Y2VzIHNlcmllcyBvZiBnbG9iYWxseSBhY2Nlc3NpYmxlIGRlYnVnIHRvb2xzXG4gKiB0byBhbGxvdyBmb3IgdGhlIEFuZ3VsYXIgZGVidWdnaW5nIHN0b3J5IHRvIGZ1bmN0aW9uLlxuICpcbiAqIFRvIHNlZSB0aGlzIGluIGFjdGlvbiBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOlxuICpcbiAqICAgYmF6ZWwgcnVuIC0tY29uZmlnPWl2eVxuICogICAvL3BhY2thZ2VzL2NvcmUvdGVzdC9idW5kbGluZy90b2RvOmRldnNlcnZlclxuICpcbiAqICBUaGVuIGxvYWQgYGxvY2FsaG9zdDo1NDMyYCBhbmQgc3RhcnQgdXNpbmcgdGhlIGNvbnNvbGUgdG9vbHMuXG4gKi9cblxuLyoqXG4gKiBUaGlzIHZhbHVlIHJlZmxlY3RzIHRoZSBwcm9wZXJ0eSBvbiB0aGUgd2luZG93IHdoZXJlIHRoZSBkZXZcbiAqIHRvb2xzIGFyZSBwYXRjaGVkICh3aW5kb3cubmcpLlxuICogKi9cbmV4cG9ydCBjb25zdCBHTE9CQUxfUFVCTElTSF9FWFBBTkRPX0tFWSA9ICduZyc7XG5cbmxldCBfcHVibGlzaGVkID0gZmFsc2U7XG4vKipcbiAqIFB1Ymxpc2hlcyBhIGNvbGxlY3Rpb24gb2YgZGVmYXVsdCBkZWJ1ZyB0b29scyBvbnRvYHdpbmRvdy5uZ2AuXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGFyZSBhdmFpbGFibGUgZ2xvYmFsbHkgd2hlbiBBbmd1bGFyIGlzIGluIGRldmVsb3BtZW50XG4gKiBtb2RlIGFuZCBhcmUgYXV0b21hdGljYWxseSBzdHJpcHBlZCBhd2F5IGZyb20gcHJvZCBtb2RlIGlzIG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaERlZmF1bHRHbG9iYWxVdGlscygpIHtcbiAgaWYgKCFfcHVibGlzaGVkKSB7XG4gICAgX3B1Ymxpc2hlZCA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBXYXJuaW5nOiB0aGlzIGZ1bmN0aW9uIGlzICpJTlRFUk5BTCogYW5kIHNob3VsZCBub3QgYmUgcmVsaWVkIHVwb24gaW4gYXBwbGljYXRpb24ncyBjb2RlLlxuICAgICAqIFRoZSBjb250cmFjdCBvZiB0aGUgZnVuY3Rpb24gbWlnaHQgYmUgY2hhbmdlZCBpbiBhbnkgcmVsZWFzZSBhbmQvb3IgdGhlIGZ1bmN0aW9uIGNhbiBiZVxuICAgICAqIHJlbW92ZWQgY29tcGxldGVseS5cbiAgICAgKi9cbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnybVzZXRQcm9maWxlcicsIHNldFByb2ZpbGVyKTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0Q29tcG9uZW50JywgZ2V0Q29tcG9uZW50KTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0Q29udGV4dCcsIGdldENvbnRleHQpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRMaXN0ZW5lcnMnLCBnZXRMaXN0ZW5lcnMpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRPd25pbmdDb21wb25lbnQnLCBnZXRPd25pbmdDb21wb25lbnQpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXRIb3N0RWxlbWVudCcsIGdldEhvc3RFbGVtZW50KTtcbiAgICBwdWJsaXNoR2xvYmFsVXRpbCgnZ2V0SW5qZWN0b3InLCBnZXRJbmplY3Rvcik7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2dldFJvb3RDb21wb25lbnRzJywgZ2V0Um9vdENvbXBvbmVudHMpO1xuICAgIHB1Ymxpc2hHbG9iYWxVdGlsKCdnZXREaXJlY3RpdmVzJywgZ2V0RGlyZWN0aXZlcyk7XG4gICAgcHVibGlzaEdsb2JhbFV0aWwoJ2FwcGx5Q2hhbmdlcycsIGFwcGx5Q2hhbmdlcyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBHbG9iYWxEZXZNb2RlQ29udGFpbmVyID0ge1xuICBbR0xPQkFMX1BVQkxJU0hfRVhQQU5ET19LRVldOiB7W2ZuTmFtZTogc3RyaW5nXTogRnVuY3Rpb259O1xufTtcblxuLyoqXG4gKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGZ1bmN0aW9uIHRvIGB3aW5kb3cubmdgIHNvIHRoYXQgaXQgY2FuIGJlXG4gKiB1c2VkIGZyb20gdGhlIGJyb3dzZXIgY29uc29sZSB3aGVuIGFuIGFwcGxpY2F0aW9uIGlzIG5vdCBpbiBwcm9kdWN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVibGlzaEdsb2JhbFV0aWwobmFtZTogc3RyaW5nLCBmbjogRnVuY3Rpb24pOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBDT01QSUxFRCA9PT0gJ3VuZGVmaW5lZCcgfHwgIUNPTVBJTEVEKSB7XG4gICAgLy8gTm90ZTogd2UgY2FuJ3QgZXhwb3J0IGBuZ2Agd2hlbiB1c2luZyBjbG9zdXJlIGVuaGFuY2VkIG9wdGltaXphdGlvbiBhczpcbiAgICAvLyAtIGNsb3N1cmUgZGVjbGFyZXMgZ2xvYmFscyBpdHNlbGYgZm9yIG1pbmlmaWVkIG5hbWVzLCB3aGljaCBzb21ldGltZXMgY2xvYmJlciBvdXIgYG5nYCBnbG9iYWxcbiAgICAvLyAtIHdlIGNhbid0IGRlY2xhcmUgYSBjbG9zdXJlIGV4dGVybiBhcyB0aGUgbmFtZXNwYWNlIGBuZ2AgaXMgYWxyZWFkeSB1c2VkIHdpdGhpbiBHb29nbGVcbiAgICAvLyAgIGZvciB0eXBpbmdzIGZvciBBbmd1bGFySlMgKHZpYSBgZ29vZy5wcm92aWRlKCduZy4uLi4nKWApLlxuICAgIGNvbnN0IHcgPSBnbG9iYWwgYXMgYW55IGFzIEdsb2JhbERldk1vZGVDb250YWluZXI7XG4gICAgbmdEZXZNb2RlICYmIGFzc2VydERlZmluZWQoZm4sICdmdW5jdGlvbiBub3QgZGVmaW5lZCcpO1xuICAgIGlmICh3KSB7XG4gICAgICBsZXQgY29udGFpbmVyID0gd1tHTE9CQUxfUFVCTElTSF9FWFBBTkRPX0tFWV07XG4gICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICBjb250YWluZXIgPSB3W0dMT0JBTF9QVUJMSVNIX0VYUEFORE9fS0VZXSA9IHt9O1xuICAgICAgfVxuICAgICAgY29udGFpbmVyW25hbWVdID0gZm47XG4gICAgfVxuICB9XG59XG4iXX0=