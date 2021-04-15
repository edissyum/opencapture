/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertIndexInRange } from '../../util/assert';
import { isObservable } from '../../util/lang';
import { EMPTY_OBJ } from '../empty';
import { isProceduralRenderer } from '../interfaces/renderer';
import { isDirectiveHost } from '../interfaces/type_checks';
import { CLEANUP, FLAGS, RENDERER } from '../interfaces/view';
import { assertTNodeType } from '../node_assert';
import { getCurrentDirectiveDef, getCurrentTNode, getLView, getTView } from '../state';
import { getComponentLViewByIndex, getNativeByTNode, unwrapRNode } from '../util/view_utils';
import { getLCleanup, getTViewCleanup, handleError, loadComponentRenderer, markViewDirty } from './shared';
/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export function ɵɵlistener(eventName, listenerFn, useCapture = false, eventTargetResolver) {
    const lView = getLView();
    const tView = getTView();
    const tNode = getCurrentTNode();
    listenerInternal(tView, lView, lView[RENDERER], tNode, eventName, listenerFn, useCapture, eventTargetResolver);
    return ɵɵlistener;
}
/**
 * Registers a synthetic host listener (e.g. `(@foo.start)`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host listener (e.g. `@HostListener('@foo.start')`) properly gets rendered
 * in the component's renderer. Normally all host listeners are evaluated with the
 * parent component's renderer, but, in the case of animation @triggers, they need
 * to be evaluated with the sub component's renderer (because that's where the
 * animation triggers are defined).
 *
 * Do not use this instruction as a replacement for `listener`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
export function ɵɵsyntheticHostListener(eventName, listenerFn, useCapture = false, eventTargetResolver) {
    const tNode = getCurrentTNode();
    const lView = getLView();
    const tView = getTView();
    const currentDef = getCurrentDirectiveDef(tView.data);
    const renderer = loadComponentRenderer(currentDef, tNode, lView);
    listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, useCapture, eventTargetResolver);
    return ɵɵsyntheticHostListener;
}
/**
 * A utility function that checks if a given element has already an event handler registered for an
 * event with a specified name. The TView.cleanup data structure is used to find out which events
 * are registered for a given element.
 */
function findExistingListener(tView, lView, eventName, tNodeIdx) {
    const tCleanup = tView.cleanup;
    if (tCleanup != null) {
        for (let i = 0; i < tCleanup.length - 1; i += 2) {
            const cleanupEventName = tCleanup[i];
            if (cleanupEventName === eventName && tCleanup[i + 1] === tNodeIdx) {
                // We have found a matching event name on the same node but it might not have been
                // registered yet, so we must explicitly verify entries in the LView cleanup data
                // structures.
                const lCleanup = lView[CLEANUP];
                const listenerIdxInLCleanup = tCleanup[i + 2];
                return lCleanup.length > listenerIdxInLCleanup ? lCleanup[listenerIdxInLCleanup] : null;
            }
            // TView.cleanup can have a mix of 4-elements entries (for event handler cleanups) or
            // 2-element entries (for directive and queries destroy hooks). As such we can encounter
            // blocks of 4 or 2 items in the tView.cleanup and this is why we iterate over 2 elements
            // first and jump another 2 elements if we detect listeners cleanup (4 elements). Also check
            // documentation of TView.cleanup for more details of this data structure layout.
            if (typeof cleanupEventName === 'string') {
                i += 2;
            }
        }
    }
    return null;
}
function listenerInternal(tView, lView, renderer, tNode, eventName, listenerFn, useCapture = false, eventTargetResolver) {
    const isTNodeDirectiveHost = isDirectiveHost(tNode);
    const firstCreatePass = tView.firstCreatePass;
    const tCleanup = firstCreatePass && getTViewCleanup(tView);
    // When the ɵɵlistener instruction was generated and is executed we know that there is either a
    // native listener or a directive output on this element. As such we we know that we will have to
    // register a listener and store its cleanup function on LView.
    const lCleanup = getLCleanup(lView);
    ngDevMode && assertTNodeType(tNode, 3 /* AnyRNode */ | 12 /* AnyContainer */);
    let processOutputs = true;
    // add native event listener - applicable to elements only
    if (tNode.type & 3 /* AnyRNode */) {
        const native = getNativeByTNode(tNode, lView);
        const resolved = eventTargetResolver ? eventTargetResolver(native) : EMPTY_OBJ;
        const target = resolved.target || native;
        const lCleanupIndex = lCleanup.length;
        const idxOrTargetGetter = eventTargetResolver ?
            (_lView) => eventTargetResolver(unwrapRNode(_lView[tNode.index])).target :
            tNode.index;
        // In order to match current behavior, native DOM event listeners must be added for all
        // events (including outputs).
        if (isProceduralRenderer(renderer)) {
            // There might be cases where multiple directives on the same element try to register an event
            // handler function for the same event. In this situation we want to avoid registration of
            // several native listeners as each registration would be intercepted by NgZone and
            // trigger change detection. This would mean that a single user action would result in several
            // change detections being invoked. To avoid this situation we want to have only one call to
            // native handler registration (for the same element and same type of event).
            //
            // In order to have just one native event handler in presence of multiple handler functions,
            // we just register a first handler function as a native event listener and then chain
            // (coalesce) other handler functions on top of the first native handler function.
            let existingListener = null;
            // Please note that the coalescing described here doesn't happen for events specifying an
            // alternative target (ex. (document:click)) - this is to keep backward compatibility with the
            // view engine.
            // Also, we don't have to search for existing listeners is there are no directives
            // matching on a given node as we can't register multiple event handlers for the same event in
            // a template (this would mean having duplicate attributes).
            if (!eventTargetResolver && isTNodeDirectiveHost) {
                existingListener = findExistingListener(tView, lView, eventName, tNode.index);
            }
            if (existingListener !== null) {
                // Attach a new listener to coalesced listeners list, maintaining the order in which
                // listeners are registered. For performance reasons, we keep a reference to the last
                // listener in that list (in `__ngLastListenerFn__` field), so we can avoid going through
                // the entire set each time we need to add a new listener.
                const lastListenerFn = existingListener.__ngLastListenerFn__ || existingListener;
                lastListenerFn.__ngNextListenerFn__ = listenerFn;
                existingListener.__ngLastListenerFn__ = listenerFn;
                processOutputs = false;
            }
            else {
                // The first argument of `listen` function in Procedural Renderer is:
                // - either a target name (as a string) in case of global target (window, document, body)
                // - or element reference (in all other cases)
                listenerFn = wrapListener(tNode, lView, listenerFn, false /** preventDefault */);
                const cleanupFn = renderer.listen(resolved.name || target, eventName, listenerFn);
                ngDevMode && ngDevMode.rendererAddEventListener++;
                lCleanup.push(listenerFn, cleanupFn);
                tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, lCleanupIndex + 1);
            }
        }
        else {
            listenerFn = wrapListener(tNode, lView, listenerFn, true /** preventDefault */);
            target.addEventListener(eventName, listenerFn, useCapture);
            ngDevMode && ngDevMode.rendererAddEventListener++;
            lCleanup.push(listenerFn);
            tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, useCapture);
        }
    }
    else {
        // Even if there is no native listener to add, we still need to wrap the listener so that OnPush
        // ancestors are marked dirty when an event occurs.
        listenerFn = wrapListener(tNode, lView, listenerFn, false /** preventDefault */);
    }
    // subscribe to directive outputs
    const outputs = tNode.outputs;
    let props;
    if (processOutputs && outputs !== null && (props = outputs[eventName])) {
        const propsLength = props.length;
        if (propsLength) {
            for (let i = 0; i < propsLength; i += 2) {
                const index = props[i];
                ngDevMode && assertIndexInRange(lView, index);
                const minifiedName = props[i + 1];
                const directiveInstance = lView[index];
                const output = directiveInstance[minifiedName];
                if (ngDevMode && !isObservable(output)) {
                    throw new Error(`@Output ${minifiedName} not initialized in '${directiveInstance.constructor.name}'.`);
                }
                const subscription = output.subscribe(listenerFn);
                const idx = lCleanup.length;
                lCleanup.push(listenerFn, subscription);
                tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
            }
        }
    }
}
function executeListenerWithErrorHandling(lView, listenerFn, e) {
    try {
        // Only explicitly returning false from a listener should preventDefault
        return listenerFn(e) !== false;
    }
    catch (error) {
        handleError(lView, error);
        return false;
    }
}
/**
 * Wraps an event listener with a function that marks ancestors dirty and prevents default behavior,
 * if applicable.
 *
 * @param tNode The TNode associated with this listener
 * @param lView The LView that contains this listener
 * @param listenerFn The listener function to call
 * @param wrapWithPreventDefault Whether or not to prevent default behavior
 * (the procedural renderer does this already, so in those cases, we should skip)
 */
function wrapListener(tNode, lView, listenerFn, wrapWithPreventDefault) {
    // Note: we are performing most of the work in the listener function itself
    // to optimize listener registration.
    return function wrapListenerIn_markDirtyAndPreventDefault(e) {
        // Ivy uses `Function` as a special token that allows us to unwrap the function
        // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`.
        if (e === Function) {
            return listenerFn;
        }
        // In order to be backwards compatible with View Engine, events on component host nodes
        // must also mark the component view itself dirty (i.e. the view that it owns).
        const startView = tNode.flags & 2 /* isComponentHost */ ?
            getComponentLViewByIndex(tNode.index, lView) :
            lView;
        // See interfaces/view.ts for more on LViewFlags.ManualOnPush
        if ((lView[FLAGS] & 32 /* ManualOnPush */) === 0) {
            markViewDirty(startView);
        }
        let result = executeListenerWithErrorHandling(lView, listenerFn, e);
        // A just-invoked listener function might have coalesced listeners so we need to check for
        // their presence and invoke as needed.
        let nextListenerFn = wrapListenerIn_markDirtyAndPreventDefault.__ngNextListenerFn__;
        while (nextListenerFn) {
            // We should prevent default if any of the listeners explicitly return false
            result = executeListenerWithErrorHandling(lView, nextListenerFn, e) && result;
            nextListenerFn = nextListenerFn.__ngNextListenerFn__;
        }
        if (wrapWithPreventDefault && result === false) {
            e.preventDefault();
            // Necessary for legacy browsers that don't support preventDefault (e.g. IE)
            e.returnValue = false;
        }
        return result;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2luc3RydWN0aW9ucy9saXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuQyxPQUFPLEVBQXVCLG9CQUFvQixFQUFZLE1BQU0sd0JBQXdCLENBQUM7QUFFN0YsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFxQixRQUFRLEVBQVEsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFDLHNCQUFzQixFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3JGLE9BQU8sRUFBQyx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUUzRixPQUFPLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUUsYUFBYSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBSXpHOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxNQUFNLFVBQVUsVUFBVSxDQUN0QixTQUFpQixFQUFFLFVBQTRCLEVBQUUsVUFBVSxHQUFHLEtBQUssRUFDbkUsbUJBQTBDO0lBQzVDLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLE1BQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFDO0lBQ3pC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QUcsS0FBSyxDQUFDLEtBQUssMEJBQTZCLENBQUMsQ0FBQztZQUN4RCx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDOUMsS0FBSyxDQUFDO1FBRVYsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLHdCQUEwQixDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2xELGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMxQjtRQUVELElBQUksTUFBTSxHQUFHLGdDQUFnQyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEUsMEZBQTBGO1FBQzFGLHVDQUF1QztRQUN2QyxJQUFJLGNBQWMsR0FBUyx5Q0FBMEMsQ0FBQyxvQkFBb0IsQ0FBQztRQUMzRixPQUFPLGNBQWMsRUFBRTtZQUNyQiw0RUFBNEU7WUFDNUUsTUFBTSxHQUFHLGdDQUFnQyxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDO1lBQzlFLGNBQWMsR0FBUyxjQUFlLENBQUMsb0JBQW9CLENBQUM7U0FDN0Q7UUFFRCxJQUFJLHNCQUFzQixJQUFJLE1BQU0sS0FBSyxLQUFLLEVBQUU7WUFDOUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLDRFQUE0RTtZQUM1RSxDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUN2QjtRQUVELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge2Fzc2VydEluZGV4SW5SYW5nZX0gZnJvbSAnLi4vLi4vdXRpbC9hc3NlcnQnO1xuaW1wb3J0IHtpc09ic2VydmFibGV9IGZyb20gJy4uLy4uL3V0aWwvbGFuZyc7XG5pbXBvcnQge0VNUFRZX09CSn0gZnJvbSAnLi4vZW1wdHknO1xuaW1wb3J0IHtQcm9wZXJ0eUFsaWFzVmFsdWUsIFROb2RlLCBUTm9kZUZsYWdzLCBUTm9kZVR5cGV9IGZyb20gJy4uL2ludGVyZmFjZXMvbm9kZSc7XG5pbXBvcnQge0dsb2JhbFRhcmdldFJlc29sdmVyLCBpc1Byb2NlZHVyYWxSZW5kZXJlciwgUmVuZGVyZXIzfSBmcm9tICcuLi9pbnRlcmZhY2VzL3JlbmRlcmVyJztcbmltcG9ydCB7UkVsZW1lbnR9IGZyb20gJy4uL2ludGVyZmFjZXMvcmVuZGVyZXJfZG9tJztcbmltcG9ydCB7aXNEaXJlY3RpdmVIb3N0fSBmcm9tICcuLi9pbnRlcmZhY2VzL3R5cGVfY2hlY2tzJztcbmltcG9ydCB7Q0xFQU5VUCwgRkxBR1MsIExWaWV3LCBMVmlld0ZsYWdzLCBSRU5ERVJFUiwgVFZpZXd9IGZyb20gJy4uL2ludGVyZmFjZXMvdmlldyc7XG5pbXBvcnQge2Fzc2VydFROb2RlVHlwZX0gZnJvbSAnLi4vbm9kZV9hc3NlcnQnO1xuaW1wb3J0IHtnZXRDdXJyZW50RGlyZWN0aXZlRGVmLCBnZXRDdXJyZW50VE5vZGUsIGdldExWaWV3LCBnZXRUVmlld30gZnJvbSAnLi4vc3RhdGUnO1xuaW1wb3J0IHtnZXRDb21wb25lbnRMVmlld0J5SW5kZXgsIGdldE5hdGl2ZUJ5VE5vZGUsIHVud3JhcFJOb2RlfSBmcm9tICcuLi91dGlsL3ZpZXdfdXRpbHMnO1xuXG5pbXBvcnQge2dldExDbGVhbnVwLCBnZXRUVmlld0NsZWFudXAsIGhhbmRsZUVycm9yLCBsb2FkQ29tcG9uZW50UmVuZGVyZXIsIG1hcmtWaWV3RGlydHl9IGZyb20gJy4vc2hhcmVkJztcblxuXG5cbi8qKlxuICogQWRkcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgY3VycmVudCBub2RlLlxuICpcbiAqIElmIGFuIG91dHB1dCBleGlzdHMgb24gb25lIG9mIHRoZSBub2RlJ3MgZGlyZWN0aXZlcywgaXQgYWxzbyBzdWJzY3JpYmVzIHRvIHRoZSBvdXRwdXRcbiAqIGFuZCBzYXZlcyB0aGUgc3Vic2NyaXB0aW9uIGZvciBsYXRlciBjbGVhbnVwLlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWUgTmFtZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSBsaXN0ZW5lckZuIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBldmVudCBlbWl0c1xuICogQHBhcmFtIHVzZUNhcHR1cmUgV2hldGhlciBvciBub3QgdG8gdXNlIGNhcHR1cmUgaW4gZXZlbnQgbGlzdGVuZXJcbiAqIEBwYXJhbSBldmVudFRhcmdldFJlc29sdmVyIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBnbG9iYWwgdGFyZ2V0IGluZm9ybWF0aW9uIGluIGNhc2UgdGhpcyBsaXN0ZW5lclxuICogc2hvdWxkIGJlIGF0dGFjaGVkIHRvIGEgZ2xvYmFsIG9iamVjdCBsaWtlIHdpbmRvdywgZG9jdW1lbnQgb3IgYm9keVxuICpcbiAqIEBjb2RlR2VuQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiDJtcm1bGlzdGVuZXIoXG4gICAgZXZlbnROYW1lOiBzdHJpbmcsIGxpc3RlbmVyRm46IChlPzogYW55KSA9PiBhbnksIHVzZUNhcHR1cmUgPSBmYWxzZSxcbiAgICBldmVudFRhcmdldFJlc29sdmVyPzogR2xvYmFsVGFyZ2V0UmVzb2x2ZXIpOiB0eXBlb2YgybXJtWxpc3RlbmVyIHtcbiAgY29uc3QgbFZpZXcgPSBnZXRMVmlldygpO1xuICBjb25zdCB0VmlldyA9IGdldFRWaWV3KCk7XG4gIGNvbnN0IHROb2RlID0gZ2V0Q3VycmVudFROb2RlKCkhO1xuICBsaXN0ZW5lckludGVybmFsKFxuICAgICAgdFZpZXcsIGxWaWV3LCBsVmlld1tSRU5ERVJFUl0sIHROb2RlLCBldmVudE5hbWUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUsIGV2ZW50VGFyZ2V0UmVzb2x2ZXIpO1xuICByZXR1cm4gybXJtWxpc3RlbmVyO1xufVxuXG4vKipcbiAqIFJlZ2lzdGVycyBhIHN5bnRoZXRpYyBob3N0IGxpc3RlbmVyIChlLmcuIGAoQGZvby5zdGFydClgKSBvbiBhIGNvbXBvbmVudCBvciBkaXJlY3RpdmUuXG4gKlxuICogVGhpcyBpbnN0cnVjdGlvbiBpcyBmb3IgY29tcGF0aWJpbGl0eSBwdXJwb3NlcyBhbmQgaXMgZGVzaWduZWQgdG8gZW5zdXJlIHRoYXQgYVxuICogc3ludGhldGljIGhvc3QgbGlzdGVuZXIgKGUuZy4gYEBIb3N0TGlzdGVuZXIoJ0Bmb28uc3RhcnQnKWApIHByb3Blcmx5IGdldHMgcmVuZGVyZWRcbiAqIGluIHRoZSBjb21wb25lbnQncyByZW5kZXJlci4gTm9ybWFsbHkgYWxsIGhvc3QgbGlzdGVuZXJzIGFyZSBldmFsdWF0ZWQgd2l0aCB0aGVcbiAqIHBhcmVudCBjb21wb25lbnQncyByZW5kZXJlciwgYnV0LCBpbiB0aGUgY2FzZSBvZiBhbmltYXRpb24gQHRyaWdnZXJzLCB0aGV5IG5lZWRcbiAqIHRvIGJlIGV2YWx1YXRlZCB3aXRoIHRoZSBzdWIgY29tcG9uZW50J3MgcmVuZGVyZXIgKGJlY2F1c2UgdGhhdCdzIHdoZXJlIHRoZVxuICogYW5pbWF0aW9uIHRyaWdnZXJzIGFyZSBkZWZpbmVkKS5cbiAqXG4gKiBEbyBub3QgdXNlIHRoaXMgaW5zdHJ1Y3Rpb24gYXMgYSByZXBsYWNlbWVudCBmb3IgYGxpc3RlbmVyYC4gVGhpcyBpbnN0cnVjdGlvblxuICogb25seSBleGlzdHMgdG8gZW5zdXJlIGNvbXBhdGliaWxpdHkgd2l0aCB0aGUgVmlld0VuZ2luZSdzIGhvc3QgYmluZGluZyBiZWhhdmlvci5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lIE5hbWUgb2YgdGhlIGV2ZW50XG4gKiBAcGFyYW0gbGlzdGVuZXJGbiBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gZXZlbnQgZW1pdHNcbiAqIEBwYXJhbSB1c2VDYXB0dXJlIFdoZXRoZXIgb3Igbm90IHRvIHVzZSBjYXB0dXJlIGluIGV2ZW50IGxpc3RlbmVyXG4gKiBAcGFyYW0gZXZlbnRUYXJnZXRSZXNvbHZlciBGdW5jdGlvbiB0aGF0IHJldHVybnMgZ2xvYmFsIHRhcmdldCBpbmZvcm1hdGlvbiBpbiBjYXNlIHRoaXMgbGlzdGVuZXJcbiAqIHNob3VsZCBiZSBhdHRhY2hlZCB0byBhIGdsb2JhbCBvYmplY3QgbGlrZSB3aW5kb3csIGRvY3VtZW50IG9yIGJvZHlcbiAqXG4gKiBAY29kZUdlbkFwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gybXJtXN5bnRoZXRpY0hvc3RMaXN0ZW5lcihcbiAgICBldmVudE5hbWU6IHN0cmluZywgbGlzdGVuZXJGbjogKGU/OiBhbnkpID0+IGFueSwgdXNlQ2FwdHVyZSA9IGZhbHNlLFxuICAgIGV2ZW50VGFyZ2V0UmVzb2x2ZXI/OiBHbG9iYWxUYXJnZXRSZXNvbHZlcik6IHR5cGVvZiDJtcm1c3ludGhldGljSG9zdExpc3RlbmVyIHtcbiAgY29uc3QgdE5vZGUgPSBnZXRDdXJyZW50VE5vZGUoKSE7XG4gIGNvbnN0IGxWaWV3ID0gZ2V0TFZpZXcoKTtcbiAgY29uc3QgdFZpZXcgPSBnZXRUVmlldygpO1xuICBjb25zdCBjdXJyZW50RGVmID0gZ2V0Q3VycmVudERpcmVjdGl2ZURlZih0Vmlldy5kYXRhKTtcbiAgY29uc3QgcmVuZGVyZXIgPSBsb2FkQ29tcG9uZW50UmVuZGVyZXIoY3VycmVudERlZiwgdE5vZGUsIGxWaWV3KTtcbiAgbGlzdGVuZXJJbnRlcm5hbChcbiAgICAgIHRWaWV3LCBsVmlldywgcmVuZGVyZXIsIHROb2RlLCBldmVudE5hbWUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUsIGV2ZW50VGFyZ2V0UmVzb2x2ZXIpO1xuICByZXR1cm4gybXJtXN5bnRoZXRpY0hvc3RMaXN0ZW5lcjtcbn1cblxuLyoqXG4gKiBBIHV0aWxpdHkgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgYSBnaXZlbiBlbGVtZW50IGhhcyBhbHJlYWR5IGFuIGV2ZW50IGhhbmRsZXIgcmVnaXN0ZXJlZCBmb3IgYW5cbiAqIGV2ZW50IHdpdGggYSBzcGVjaWZpZWQgbmFtZS4gVGhlIFRWaWV3LmNsZWFudXAgZGF0YSBzdHJ1Y3R1cmUgaXMgdXNlZCB0byBmaW5kIG91dCB3aGljaCBldmVudHNcbiAqIGFyZSByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGZpbmRFeGlzdGluZ0xpc3RlbmVyKFxuICAgIHRWaWV3OiBUVmlldywgbFZpZXc6IExWaWV3LCBldmVudE5hbWU6IHN0cmluZywgdE5vZGVJZHg6IG51bWJlcik6ICgoZT86IGFueSkgPT4gYW55KXxudWxsIHtcbiAgY29uc3QgdENsZWFudXAgPSB0Vmlldy5jbGVhbnVwO1xuICBpZiAodENsZWFudXAgIT0gbnVsbCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdENsZWFudXAubGVuZ3RoIC0gMTsgaSArPSAyKSB7XG4gICAgICBjb25zdCBjbGVhbnVwRXZlbnROYW1lID0gdENsZWFudXBbaV07XG4gICAgICBpZiAoY2xlYW51cEV2ZW50TmFtZSA9PT0gZXZlbnROYW1lICYmIHRDbGVhbnVwW2kgKyAxXSA9PT0gdE5vZGVJZHgpIHtcbiAgICAgICAgLy8gV2UgaGF2ZSBmb3VuZCBhIG1hdGNoaW5nIGV2ZW50IG5hbWUgb24gdGhlIHNhbWUgbm9kZSBidXQgaXQgbWlnaHQgbm90IGhhdmUgYmVlblxuICAgICAgICAvLyByZWdpc3RlcmVkIHlldCwgc28gd2UgbXVzdCBleHBsaWNpdGx5IHZlcmlmeSBlbnRyaWVzIGluIHRoZSBMVmlldyBjbGVhbnVwIGRhdGFcbiAgICAgICAgLy8gc3RydWN0dXJlcy5cbiAgICAgICAgY29uc3QgbENsZWFudXAgPSBsVmlld1tDTEVBTlVQXSE7XG4gICAgICAgIGNvbnN0IGxpc3RlbmVySWR4SW5MQ2xlYW51cCA9IHRDbGVhbnVwW2kgKyAyXTtcbiAgICAgICAgcmV0dXJuIGxDbGVhbnVwLmxlbmd0aCA+IGxpc3RlbmVySWR4SW5MQ2xlYW51cCA/IGxDbGVhbnVwW2xpc3RlbmVySWR4SW5MQ2xlYW51cF0gOiBudWxsO1xuICAgICAgfVxuICAgICAgLy8gVFZpZXcuY2xlYW51cCBjYW4gaGF2ZSBhIG1peCBvZiA0LWVsZW1lbnRzIGVudHJpZXMgKGZvciBldmVudCBoYW5kbGVyIGNsZWFudXBzKSBvclxuICAgICAgLy8gMi1lbGVtZW50IGVudHJpZXMgKGZvciBkaXJlY3RpdmUgYW5kIHF1ZXJpZXMgZGVzdHJveSBob29rcykuIEFzIHN1Y2ggd2UgY2FuIGVuY291bnRlclxuICAgICAgLy8gYmxvY2tzIG9mIDQgb3IgMiBpdGVtcyBpbiB0aGUgdFZpZXcuY2xlYW51cCBhbmQgdGhpcyBpcyB3aHkgd2UgaXRlcmF0ZSBvdmVyIDIgZWxlbWVudHNcbiAgICAgIC8vIGZpcnN0IGFuZCBqdW1wIGFub3RoZXIgMiBlbGVtZW50cyBpZiB3ZSBkZXRlY3QgbGlzdGVuZXJzIGNsZWFudXAgKDQgZWxlbWVudHMpLiBBbHNvIGNoZWNrXG4gICAgICAvLyBkb2N1bWVudGF0aW9uIG9mIFRWaWV3LmNsZWFudXAgZm9yIG1vcmUgZGV0YWlscyBvZiB0aGlzIGRhdGEgc3RydWN0dXJlIGxheW91dC5cbiAgICAgIGlmICh0eXBlb2YgY2xlYW51cEV2ZW50TmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaSArPSAyO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gbGlzdGVuZXJJbnRlcm5hbChcbiAgICB0VmlldzogVFZpZXcsIGxWaWV3OiBMVmlldywgcmVuZGVyZXI6IFJlbmRlcmVyMywgdE5vZGU6IFROb2RlLCBldmVudE5hbWU6IHN0cmluZyxcbiAgICBsaXN0ZW5lckZuOiAoZT86IGFueSkgPT4gYW55LCB1c2VDYXB0dXJlID0gZmFsc2UsXG4gICAgZXZlbnRUYXJnZXRSZXNvbHZlcj86IEdsb2JhbFRhcmdldFJlc29sdmVyKTogdm9pZCB7XG4gIGNvbnN0IGlzVE5vZGVEaXJlY3RpdmVIb3N0ID0gaXNEaXJlY3RpdmVIb3N0KHROb2RlKTtcbiAgY29uc3QgZmlyc3RDcmVhdGVQYXNzID0gdFZpZXcuZmlyc3RDcmVhdGVQYXNzO1xuICBjb25zdCB0Q2xlYW51cDogZmFsc2V8YW55W10gPSBmaXJzdENyZWF0ZVBhc3MgJiYgZ2V0VFZpZXdDbGVhbnVwKHRWaWV3KTtcblxuICAvLyBXaGVuIHRoZSDJtcm1bGlzdGVuZXIgaW5zdHJ1Y3Rpb24gd2FzIGdlbmVyYXRlZCBhbmQgaXMgZXhlY3V0ZWQgd2Uga25vdyB0aGF0IHRoZXJlIGlzIGVpdGhlciBhXG4gIC8vIG5hdGl2ZSBsaXN0ZW5lciBvciBhIGRpcmVjdGl2ZSBvdXRwdXQgb24gdGhpcyBlbGVtZW50LiBBcyBzdWNoIHdlIHdlIGtub3cgdGhhdCB3ZSB3aWxsIGhhdmUgdG9cbiAgLy8gcmVnaXN0ZXIgYSBsaXN0ZW5lciBhbmQgc3RvcmUgaXRzIGNsZWFudXAgZnVuY3Rpb24gb24gTFZpZXcuXG4gIGNvbnN0IGxDbGVhbnVwID0gZ2V0TENsZWFudXAobFZpZXcpO1xuXG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRUTm9kZVR5cGUodE5vZGUsIFROb2RlVHlwZS5BbnlSTm9kZSB8IFROb2RlVHlwZS5BbnlDb250YWluZXIpO1xuXG4gIGxldCBwcm9jZXNzT3V0cHV0cyA9IHRydWU7XG5cbiAgLy8gYWRkIG5hdGl2ZSBldmVudCBsaXN0ZW5lciAtIGFwcGxpY2FibGUgdG8gZWxlbWVudHMgb25seVxuICBpZiAodE5vZGUudHlwZSAmIFROb2RlVHlwZS5BbnlSTm9kZSkge1xuICAgIGNvbnN0IG5hdGl2ZSA9IGdldE5hdGl2ZUJ5VE5vZGUodE5vZGUsIGxWaWV3KSBhcyBSRWxlbWVudDtcbiAgICBjb25zdCByZXNvbHZlZCA9IGV2ZW50VGFyZ2V0UmVzb2x2ZXIgPyBldmVudFRhcmdldFJlc29sdmVyKG5hdGl2ZSkgOiBFTVBUWV9PQkogYXMgYW55O1xuICAgIGNvbnN0IHRhcmdldCA9IHJlc29sdmVkLnRhcmdldCB8fCBuYXRpdmU7XG4gICAgY29uc3QgbENsZWFudXBJbmRleCA9IGxDbGVhbnVwLmxlbmd0aDtcbiAgICBjb25zdCBpZHhPclRhcmdldEdldHRlciA9IGV2ZW50VGFyZ2V0UmVzb2x2ZXIgP1xuICAgICAgICAoX2xWaWV3OiBMVmlldykgPT4gZXZlbnRUYXJnZXRSZXNvbHZlcih1bndyYXBSTm9kZShfbFZpZXdbdE5vZGUuaW5kZXhdKSkudGFyZ2V0IDpcbiAgICAgICAgdE5vZGUuaW5kZXg7XG5cbiAgICAvLyBJbiBvcmRlciB0byBtYXRjaCBjdXJyZW50IGJlaGF2aW9yLCBuYXRpdmUgRE9NIGV2ZW50IGxpc3RlbmVycyBtdXN0IGJlIGFkZGVkIGZvciBhbGxcbiAgICAvLyBldmVudHMgKGluY2x1ZGluZyBvdXRwdXRzKS5cbiAgICBpZiAoaXNQcm9jZWR1cmFsUmVuZGVyZXIocmVuZGVyZXIpKSB7XG4gICAgICAvLyBUaGVyZSBtaWdodCBiZSBjYXNlcyB3aGVyZSBtdWx0aXBsZSBkaXJlY3RpdmVzIG9uIHRoZSBzYW1lIGVsZW1lbnQgdHJ5IHRvIHJlZ2lzdGVyIGFuIGV2ZW50XG4gICAgICAvLyBoYW5kbGVyIGZ1bmN0aW9uIGZvciB0aGUgc2FtZSBldmVudC4gSW4gdGhpcyBzaXR1YXRpb24gd2Ugd2FudCB0byBhdm9pZCByZWdpc3RyYXRpb24gb2ZcbiAgICAgIC8vIHNldmVyYWwgbmF0aXZlIGxpc3RlbmVycyBhcyBlYWNoIHJlZ2lzdHJhdGlvbiB3b3VsZCBiZSBpbnRlcmNlcHRlZCBieSBOZ1pvbmUgYW5kXG4gICAgICAvLyB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb24uIFRoaXMgd291bGQgbWVhbiB0aGF0IGEgc2luZ2xlIHVzZXIgYWN0aW9uIHdvdWxkIHJlc3VsdCBpbiBzZXZlcmFsXG4gICAgICAvLyBjaGFuZ2UgZGV0ZWN0aW9ucyBiZWluZyBpbnZva2VkLiBUbyBhdm9pZCB0aGlzIHNpdHVhdGlvbiB3ZSB3YW50IHRvIGhhdmUgb25seSBvbmUgY2FsbCB0b1xuICAgICAgLy8gbmF0aXZlIGhhbmRsZXIgcmVnaXN0cmF0aW9uIChmb3IgdGhlIHNhbWUgZWxlbWVudCBhbmQgc2FtZSB0eXBlIG9mIGV2ZW50KS5cbiAgICAgIC8vXG4gICAgICAvLyBJbiBvcmRlciB0byBoYXZlIGp1c3Qgb25lIG5hdGl2ZSBldmVudCBoYW5kbGVyIGluIHByZXNlbmNlIG9mIG11bHRpcGxlIGhhbmRsZXIgZnVuY3Rpb25zLFxuICAgICAgLy8gd2UganVzdCByZWdpc3RlciBhIGZpcnN0IGhhbmRsZXIgZnVuY3Rpb24gYXMgYSBuYXRpdmUgZXZlbnQgbGlzdGVuZXIgYW5kIHRoZW4gY2hhaW5cbiAgICAgIC8vIChjb2FsZXNjZSkgb3RoZXIgaGFuZGxlciBmdW5jdGlvbnMgb24gdG9wIG9mIHRoZSBmaXJzdCBuYXRpdmUgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgIGxldCBleGlzdGluZ0xpc3RlbmVyID0gbnVsbDtcbiAgICAgIC8vIFBsZWFzZSBub3RlIHRoYXQgdGhlIGNvYWxlc2NpbmcgZGVzY3JpYmVkIGhlcmUgZG9lc24ndCBoYXBwZW4gZm9yIGV2ZW50cyBzcGVjaWZ5aW5nIGFuXG4gICAgICAvLyBhbHRlcm5hdGl2ZSB0YXJnZXQgKGV4LiAoZG9jdW1lbnQ6Y2xpY2spKSAtIHRoaXMgaXMgdG8ga2VlcCBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggdGhlXG4gICAgICAvLyB2aWV3IGVuZ2luZS5cbiAgICAgIC8vIEFsc28sIHdlIGRvbid0IGhhdmUgdG8gc2VhcmNoIGZvciBleGlzdGluZyBsaXN0ZW5lcnMgaXMgdGhlcmUgYXJlIG5vIGRpcmVjdGl2ZXNcbiAgICAgIC8vIG1hdGNoaW5nIG9uIGEgZ2l2ZW4gbm9kZSBhcyB3ZSBjYW4ndCByZWdpc3RlciBtdWx0aXBsZSBldmVudCBoYW5kbGVycyBmb3IgdGhlIHNhbWUgZXZlbnQgaW5cbiAgICAgIC8vIGEgdGVtcGxhdGUgKHRoaXMgd291bGQgbWVhbiBoYXZpbmcgZHVwbGljYXRlIGF0dHJpYnV0ZXMpLlxuICAgICAgaWYgKCFldmVudFRhcmdldFJlc29sdmVyICYmIGlzVE5vZGVEaXJlY3RpdmVIb3N0KSB7XG4gICAgICAgIGV4aXN0aW5nTGlzdGVuZXIgPSBmaW5kRXhpc3RpbmdMaXN0ZW5lcih0VmlldywgbFZpZXcsIGV2ZW50TmFtZSwgdE5vZGUuaW5kZXgpO1xuICAgICAgfVxuICAgICAgaWYgKGV4aXN0aW5nTGlzdGVuZXIgIT09IG51bGwpIHtcbiAgICAgICAgLy8gQXR0YWNoIGEgbmV3IGxpc3RlbmVyIHRvIGNvYWxlc2NlZCBsaXN0ZW5lcnMgbGlzdCwgbWFpbnRhaW5pbmcgdGhlIG9yZGVyIGluIHdoaWNoXG4gICAgICAgIC8vIGxpc3RlbmVycyBhcmUgcmVnaXN0ZXJlZC4gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIHdlIGtlZXAgYSByZWZlcmVuY2UgdG8gdGhlIGxhc3RcbiAgICAgICAgLy8gbGlzdGVuZXIgaW4gdGhhdCBsaXN0IChpbiBgX19uZ0xhc3RMaXN0ZW5lckZuX19gIGZpZWxkKSwgc28gd2UgY2FuIGF2b2lkIGdvaW5nIHRocm91Z2hcbiAgICAgICAgLy8gdGhlIGVudGlyZSBzZXQgZWFjaCB0aW1lIHdlIG5lZWQgdG8gYWRkIGEgbmV3IGxpc3RlbmVyLlxuICAgICAgICBjb25zdCBsYXN0TGlzdGVuZXJGbiA9ICg8YW55PmV4aXN0aW5nTGlzdGVuZXIpLl9fbmdMYXN0TGlzdGVuZXJGbl9fIHx8IGV4aXN0aW5nTGlzdGVuZXI7XG4gICAgICAgIGxhc3RMaXN0ZW5lckZuLl9fbmdOZXh0TGlzdGVuZXJGbl9fID0gbGlzdGVuZXJGbjtcbiAgICAgICAgKDxhbnk+ZXhpc3RpbmdMaXN0ZW5lcikuX19uZ0xhc3RMaXN0ZW5lckZuX18gPSBsaXN0ZW5lckZuO1xuICAgICAgICBwcm9jZXNzT3V0cHV0cyA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGZpcnN0IGFyZ3VtZW50IG9mIGBsaXN0ZW5gIGZ1bmN0aW9uIGluIFByb2NlZHVyYWwgUmVuZGVyZXIgaXM6XG4gICAgICAgIC8vIC0gZWl0aGVyIGEgdGFyZ2V0IG5hbWUgKGFzIGEgc3RyaW5nKSBpbiBjYXNlIG9mIGdsb2JhbCB0YXJnZXQgKHdpbmRvdywgZG9jdW1lbnQsIGJvZHkpXG4gICAgICAgIC8vIC0gb3IgZWxlbWVudCByZWZlcmVuY2UgKGluIGFsbCBvdGhlciBjYXNlcylcbiAgICAgICAgbGlzdGVuZXJGbiA9IHdyYXBMaXN0ZW5lcih0Tm9kZSwgbFZpZXcsIGxpc3RlbmVyRm4sIGZhbHNlIC8qKiBwcmV2ZW50RGVmYXVsdCAqLyk7XG4gICAgICAgIGNvbnN0IGNsZWFudXBGbiA9IHJlbmRlcmVyLmxpc3RlbihyZXNvbHZlZC5uYW1lIHx8IHRhcmdldCwgZXZlbnROYW1lLCBsaXN0ZW5lckZuKTtcbiAgICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckFkZEV2ZW50TGlzdGVuZXIrKztcblxuICAgICAgICBsQ2xlYW51cC5wdXNoKGxpc3RlbmVyRm4sIGNsZWFudXBGbik7XG4gICAgICAgIHRDbGVhbnVwICYmIHRDbGVhbnVwLnB1c2goZXZlbnROYW1lLCBpZHhPclRhcmdldEdldHRlciwgbENsZWFudXBJbmRleCwgbENsZWFudXBJbmRleCArIDEpO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3RlbmVyRm4gPSB3cmFwTGlzdGVuZXIodE5vZGUsIGxWaWV3LCBsaXN0ZW5lckZuLCB0cnVlIC8qKiBwcmV2ZW50RGVmYXVsdCAqLyk7XG4gICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGxpc3RlbmVyRm4sIHVzZUNhcHR1cmUpO1xuICAgICAgbmdEZXZNb2RlICYmIG5nRGV2TW9kZS5yZW5kZXJlckFkZEV2ZW50TGlzdGVuZXIrKztcblxuICAgICAgbENsZWFudXAucHVzaChsaXN0ZW5lckZuKTtcbiAgICAgIHRDbGVhbnVwICYmIHRDbGVhbnVwLnB1c2goZXZlbnROYW1lLCBpZHhPclRhcmdldEdldHRlciwgbENsZWFudXBJbmRleCwgdXNlQ2FwdHVyZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEV2ZW4gaWYgdGhlcmUgaXMgbm8gbmF0aXZlIGxpc3RlbmVyIHRvIGFkZCwgd2Ugc3RpbGwgbmVlZCB0byB3cmFwIHRoZSBsaXN0ZW5lciBzbyB0aGF0IE9uUHVzaFxuICAgIC8vIGFuY2VzdG9ycyBhcmUgbWFya2VkIGRpcnR5IHdoZW4gYW4gZXZlbnQgb2NjdXJzLlxuICAgIGxpc3RlbmVyRm4gPSB3cmFwTGlzdGVuZXIodE5vZGUsIGxWaWV3LCBsaXN0ZW5lckZuLCBmYWxzZSAvKiogcHJldmVudERlZmF1bHQgKi8pO1xuICB9XG5cbiAgLy8gc3Vic2NyaWJlIHRvIGRpcmVjdGl2ZSBvdXRwdXRzXG4gIGNvbnN0IG91dHB1dHMgPSB0Tm9kZS5vdXRwdXRzO1xuICBsZXQgcHJvcHM6IFByb3BlcnR5QWxpYXNWYWx1ZXx1bmRlZmluZWQ7XG4gIGlmIChwcm9jZXNzT3V0cHV0cyAmJiBvdXRwdXRzICE9PSBudWxsICYmIChwcm9wcyA9IG91dHB1dHNbZXZlbnROYW1lXSkpIHtcbiAgICBjb25zdCBwcm9wc0xlbmd0aCA9IHByb3BzLmxlbmd0aDtcbiAgICBpZiAocHJvcHNMZW5ndGgpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvcHNMZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHByb3BzW2ldIGFzIG51bWJlcjtcbiAgICAgICAgbmdEZXZNb2RlICYmIGFzc2VydEluZGV4SW5SYW5nZShsVmlldywgaW5kZXgpO1xuICAgICAgICBjb25zdCBtaW5pZmllZE5hbWUgPSBwcm9wc1tpICsgMV07XG4gICAgICAgIGNvbnN0IGRpcmVjdGl2ZUluc3RhbmNlID0gbFZpZXdbaW5kZXhdO1xuICAgICAgICBjb25zdCBvdXRwdXQgPSBkaXJlY3RpdmVJbnN0YW5jZVttaW5pZmllZE5hbWVdO1xuXG4gICAgICAgIGlmIChuZ0Rldk1vZGUgJiYgIWlzT2JzZXJ2YWJsZShvdXRwdXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBAT3V0cHV0ICR7bWluaWZpZWROYW1lfSBub3QgaW5pdGlhbGl6ZWQgaW4gJyR7XG4gICAgICAgICAgICAgIGRpcmVjdGl2ZUluc3RhbmNlLmNvbnN0cnVjdG9yLm5hbWV9Jy5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IG91dHB1dC5zdWJzY3JpYmUobGlzdGVuZXJGbik7XG4gICAgICAgIGNvbnN0IGlkeCA9IGxDbGVhbnVwLmxlbmd0aDtcbiAgICAgICAgbENsZWFudXAucHVzaChsaXN0ZW5lckZuLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICB0Q2xlYW51cCAmJiB0Q2xlYW51cC5wdXNoKGV2ZW50TmFtZSwgdE5vZGUuaW5kZXgsIGlkeCwgLShpZHggKyAxKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVMaXN0ZW5lcldpdGhFcnJvckhhbmRsaW5nKFxuICAgIGxWaWV3OiBMVmlldywgbGlzdGVuZXJGbjogKGU/OiBhbnkpID0+IGFueSwgZTogYW55KTogYm9vbGVhbiB7XG4gIHRyeSB7XG4gICAgLy8gT25seSBleHBsaWNpdGx5IHJldHVybmluZyBmYWxzZSBmcm9tIGEgbGlzdGVuZXIgc2hvdWxkIHByZXZlbnREZWZhdWx0XG4gICAgcmV0dXJuIGxpc3RlbmVyRm4oZSkgIT09IGZhbHNlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGhhbmRsZUVycm9yKGxWaWV3LCBlcnJvcik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKlxuICogV3JhcHMgYW4gZXZlbnQgbGlzdGVuZXIgd2l0aCBhIGZ1bmN0aW9uIHRoYXQgbWFya3MgYW5jZXN0b3JzIGRpcnR5IGFuZCBwcmV2ZW50cyBkZWZhdWx0IGJlaGF2aW9yLFxuICogaWYgYXBwbGljYWJsZS5cbiAqXG4gKiBAcGFyYW0gdE5vZGUgVGhlIFROb2RlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGxpc3RlbmVyXG4gKiBAcGFyYW0gbFZpZXcgVGhlIExWaWV3IHRoYXQgY29udGFpbnMgdGhpcyBsaXN0ZW5lclxuICogQHBhcmFtIGxpc3RlbmVyRm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIGNhbGxcbiAqIEBwYXJhbSB3cmFwV2l0aFByZXZlbnREZWZhdWx0IFdoZXRoZXIgb3Igbm90IHRvIHByZXZlbnQgZGVmYXVsdCBiZWhhdmlvclxuICogKHRoZSBwcm9jZWR1cmFsIHJlbmRlcmVyIGRvZXMgdGhpcyBhbHJlYWR5LCBzbyBpbiB0aG9zZSBjYXNlcywgd2Ugc2hvdWxkIHNraXApXG4gKi9cbmZ1bmN0aW9uIHdyYXBMaXN0ZW5lcihcbiAgICB0Tm9kZTogVE5vZGUsIGxWaWV3OiBMVmlldywgbGlzdGVuZXJGbjogKGU/OiBhbnkpID0+IGFueSxcbiAgICB3cmFwV2l0aFByZXZlbnREZWZhdWx0OiBib29sZWFuKTogRXZlbnRMaXN0ZW5lciB7XG4gIC8vIE5vdGU6IHdlIGFyZSBwZXJmb3JtaW5nIG1vc3Qgb2YgdGhlIHdvcmsgaW4gdGhlIGxpc3RlbmVyIGZ1bmN0aW9uIGl0c2VsZlxuICAvLyB0byBvcHRpbWl6ZSBsaXN0ZW5lciByZWdpc3RyYXRpb24uXG4gIHJldHVybiBmdW5jdGlvbiB3cmFwTGlzdGVuZXJJbl9tYXJrRGlydHlBbmRQcmV2ZW50RGVmYXVsdChlOiBhbnkpIHtcbiAgICAvLyBJdnkgdXNlcyBgRnVuY3Rpb25gIGFzIGEgc3BlY2lhbCB0b2tlbiB0aGF0IGFsbG93cyB1cyB0byB1bndyYXAgdGhlIGZ1bmN0aW9uXG4gICAgLy8gc28gdGhhdCBpdCBjYW4gYmUgaW52b2tlZCBwcm9ncmFtbWF0aWNhbGx5IGJ5IGBEZWJ1Z05vZGUudHJpZ2dlckV2ZW50SGFuZGxlcmAuXG4gICAgaWYgKGUgPT09IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gbGlzdGVuZXJGbjtcbiAgICB9XG5cbiAgICAvLyBJbiBvcmRlciB0byBiZSBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoIFZpZXcgRW5naW5lLCBldmVudHMgb24gY29tcG9uZW50IGhvc3Qgbm9kZXNcbiAgICAvLyBtdXN0IGFsc28gbWFyayB0aGUgY29tcG9uZW50IHZpZXcgaXRzZWxmIGRpcnR5IChpLmUuIHRoZSB2aWV3IHRoYXQgaXQgb3ducykuXG4gICAgY29uc3Qgc3RhcnRWaWV3ID0gdE5vZGUuZmxhZ3MgJiBUTm9kZUZsYWdzLmlzQ29tcG9uZW50SG9zdCA/XG4gICAgICAgIGdldENvbXBvbmVudExWaWV3QnlJbmRleCh0Tm9kZS5pbmRleCwgbFZpZXcpIDpcbiAgICAgICAgbFZpZXc7XG5cbiAgICAvLyBTZWUgaW50ZXJmYWNlcy92aWV3LnRzIGZvciBtb3JlIG9uIExWaWV3RmxhZ3MuTWFudWFsT25QdXNoXG4gICAgaWYgKChsVmlld1tGTEFHU10gJiBMVmlld0ZsYWdzLk1hbnVhbE9uUHVzaCkgPT09IDApIHtcbiAgICAgIG1hcmtWaWV3RGlydHkoc3RhcnRWaWV3KTtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0ID0gZXhlY3V0ZUxpc3RlbmVyV2l0aEVycm9ySGFuZGxpbmcobFZpZXcsIGxpc3RlbmVyRm4sIGUpO1xuICAgIC8vIEEganVzdC1pbnZva2VkIGxpc3RlbmVyIGZ1bmN0aW9uIG1pZ2h0IGhhdmUgY29hbGVzY2VkIGxpc3RlbmVycyBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvclxuICAgIC8vIHRoZWlyIHByZXNlbmNlIGFuZCBpbnZva2UgYXMgbmVlZGVkLlxuICAgIGxldCBuZXh0TGlzdGVuZXJGbiA9ICg8YW55PndyYXBMaXN0ZW5lckluX21hcmtEaXJ0eUFuZFByZXZlbnREZWZhdWx0KS5fX25nTmV4dExpc3RlbmVyRm5fXztcbiAgICB3aGlsZSAobmV4dExpc3RlbmVyRm4pIHtcbiAgICAgIC8vIFdlIHNob3VsZCBwcmV2ZW50IGRlZmF1bHQgaWYgYW55IG9mIHRoZSBsaXN0ZW5lcnMgZXhwbGljaXRseSByZXR1cm4gZmFsc2VcbiAgICAgIHJlc3VsdCA9IGV4ZWN1dGVMaXN0ZW5lcldpdGhFcnJvckhhbmRsaW5nKGxWaWV3LCBuZXh0TGlzdGVuZXJGbiwgZSkgJiYgcmVzdWx0O1xuICAgICAgbmV4dExpc3RlbmVyRm4gPSAoPGFueT5uZXh0TGlzdGVuZXJGbikuX19uZ05leHRMaXN0ZW5lckZuX187XG4gICAgfVxuXG4gICAgaWYgKHdyYXBXaXRoUHJldmVudERlZmF1bHQgJiYgcmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgLy8gTmVjZXNzYXJ5IGZvciBsZWdhY3kgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IHByZXZlbnREZWZhdWx0IChlLmcuIElFKVxuICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG4iXX0=