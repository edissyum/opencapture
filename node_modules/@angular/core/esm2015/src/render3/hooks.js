/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertDefined, assertEqual, assertNotEqual } from '../util/assert';
import { assertFirstCreatePass } from './assert';
import { NgOnChangesFeatureImpl } from './features/ng_onchanges_feature';
import { FLAGS, PREORDER_HOOK_FLAGS } from './interfaces/view';
import { isInCheckNoChangesMode } from './state';
/**
 * Adds all directive lifecycle hooks from the given `DirectiveDef` to the given `TView`.
 *
 * Must be run *only* on the first template pass.
 *
 * Sets up the pre-order hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * @param directiveIndex The index of the directive in LView
 * @param directiveDef The definition containing the hooks to setup in tView
 * @param tView The current TView
 */
export function registerPreOrderHooks(directiveIndex, directiveDef, tView) {
    ngDevMode && assertFirstCreatePass(tView);
    const { ngOnChanges, ngOnInit, ngDoCheck } = directiveDef.type.prototype;
    if (ngOnChanges) {
        const wrappedOnChanges = NgOnChangesFeatureImpl(directiveDef);
        (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, wrappedOnChanges);
        (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = []))
            .push(directiveIndex, wrappedOnChanges);
    }
    if (ngOnInit) {
        (tView.preOrderHooks || (tView.preOrderHooks = [])).push(0 - directiveIndex, ngOnInit);
    }
    if (ngDoCheck) {
        (tView.preOrderHooks || (tView.preOrderHooks = [])).push(directiveIndex, ngDoCheck);
        (tView.preOrderCheckHooks || (tView.preOrderCheckHooks = [])).push(directiveIndex, ngDoCheck);
    }
}
/**
 *
 * Loops through the directives on the provided `tNode` and queues hooks to be
 * run that are not initialization hooks.
 *
 * Should be executed during `elementEnd()` and similar to
 * preserve hook execution order. Content, view, and destroy hooks for projected
 * components and directives must be called *before* their hosts.
 *
 * Sets up the content, view, and destroy hooks on the provided `tView`,
 * see {@link HookData} for details about the data structure.
 *
 * NOTE: This does not set up `onChanges`, `onInit` or `doCheck`, those are set up
 * separately at `elementStart`.
 *
 * @param tView The current TView
 * @param tNode The TNode whose directives are to be searched for hooks to queue
 */
export function registerPostOrderHooks(tView, tNode) {
    ngDevMode && assertFirstCreatePass(tView);
    // It's necessary to loop through the directives at elementEnd() (rather than processing in
    // directiveCreate) so we can preserve the current hook order. Content, view, and destroy
    // hooks for projected components and directives must be called *before* their hosts.
    for (let i = tNode.directiveStart, end = tNode.directiveEnd; i < end; i++) {
        const directiveDef = tView.data[i];
        ngDevMode && assertDefined(directiveDef, 'Expecting DirectiveDef');
        const lifecycleHooks = directiveDef.type.prototype;
        const { ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, ngOnDestroy } = lifecycleHooks;
        if (ngAfterContentInit) {
            (tView.contentHooks || (tView.contentHooks = [])).push(-i, ngAfterContentInit);
        }
        if (ngAfterContentChecked) {
            (tView.contentHooks || (tView.contentHooks = [])).push(i, ngAfterContentChecked);
            (tView.contentCheckHooks || (tView.contentCheckHooks = [])).push(i, ngAfterContentChecked);
        }
        if (ngAfterViewInit) {
            (tView.viewHooks || (tView.viewHooks = [])).push(-i, ngAfterViewInit);
        }
        if (ngAfterViewChecked) {
            (tView.viewHooks || (tView.viewHooks = [])).push(i, ngAfterViewChecked);
            (tView.viewCheckHooks || (tView.viewCheckHooks = [])).push(i, ngAfterViewChecked);
        }
        if (ngOnDestroy != null) {
            (tView.destroyHooks || (tView.destroyHooks = [])).push(i, ngOnDestroy);
        }
    }
}
/**
 * Executing hooks requires complex logic as we need to deal with 2 constraints.
 *
 * 1. Init hooks (ngOnInit, ngAfterContentInit, ngAfterViewInit) must all be executed once and only
 * once, across many change detection cycles. This must be true even if some hooks throw, or if
 * some recursively trigger a change detection cycle.
 * To solve that, it is required to track the state of the execution of these init hooks.
 * This is done by storing and maintaining flags in the view: the {@link InitPhaseState},
 * and the index within that phase. They can be seen as a cursor in the following structure:
 * [[onInit1, onInit2], [afterContentInit1], [afterViewInit1, afterViewInit2, afterViewInit3]]
 * They are are stored as flags in LView[FLAGS].
 *
 * 2. Pre-order hooks can be executed in batches, because of the select instruction.
 * To be able to pause and resume their execution, we also need some state about the hook's array
 * that is being processed:
 * - the index of the next hook to be executed
 * - the number of init hooks already found in the processed part of the  array
 * They are are stored as flags in LView[PREORDER_HOOK_FLAGS].
 */
/**
 * Executes pre-order check hooks ( OnChanges, DoChanges) given a view where all the init hooks were
 * executed once. This is a light version of executeInitAndCheckPreOrderHooks where we can skip read
 * / write of the init-hooks related flags.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeCheckHooks(lView, hooks, nodeIndex) {
    callHooks(lView, hooks, 3 /* InitPhaseCompleted */, nodeIndex);
}
/**
 * Executes post-order init and check hooks (one of AfterContentInit, AfterContentChecked,
 * AfterViewInit, AfterViewChecked) given a view where there are pending init hooks to be executed.
 * @param lView The LView where hooks are defined
 * @param hooks Hooks to be run
 * @param initPhase A phase for which hooks should be run
 * @param nodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
export function executeInitAndCheckHooks(lView, hooks, initPhase, nodeIndex) {
    ngDevMode &&
        assertNotEqual(initPhase, 3 /* InitPhaseCompleted */, 'Init pre-order hooks should not be called more than once');
    if ((lView[FLAGS] & 3 /* InitPhaseStateMask */) === initPhase) {
        callHooks(lView, hooks, initPhase, nodeIndex);
    }
}
export function incrementInitPhaseFlags(lView, initPhase) {
    ngDevMode &&
        assertNotEqual(initPhase, 3 /* InitPhaseCompleted */, 'Init hooks phase should not be incremented after all init hooks have been run.');
    let flags = lView[FLAGS];
    if ((flags & 3 /* InitPhaseStateMask */) === initPhase) {
        flags &= 2047 /* IndexWithinInitPhaseReset */;
        flags += 1 /* InitPhaseStateIncrementer */;
        lView[FLAGS] = flags;
    }
}
/**
 * Calls lifecycle hooks with their contexts, skipping init hooks if it's not
 * the first LView pass
 *
 * @param currentView The current view
 * @param arr The array in which the hooks are found
 * @param initPhaseState the current state of the init phase
 * @param currentNodeIndex 3 cases depending on the value:
 * - undefined: all hooks from the array should be executed (post-order case)
 * - null: execute hooks only from the saved index until the end of the array (pre-order case, when
 * flushing the remaining hooks)
 * - number: execute hooks only from the saved index until that node index exclusive (pre-order
 * case, when executing select(number))
 */
function callHooks(currentView, arr, initPhase, currentNodeIndex) {
    ngDevMode &&
        assertEqual(isInCheckNoChangesMode(), false, 'Hooks should never be run when in check no changes mode.');
    const startIndex = currentNodeIndex !== undefined ?
        (currentView[PREORDER_HOOK_FLAGS] & 65535 /* IndexOfTheNextPreOrderHookMaskMask */) :
        0;
    const nodeIndexLimit = currentNodeIndex != null ? currentNodeIndex : -1;
    let lastNodeIndexFound = 0;
    for (let i = startIndex; i < arr.length; i++) {
        const hook = arr[i + 1];
        if (typeof hook === 'number') {
            lastNodeIndexFound = arr[i];
            if (currentNodeIndex != null && lastNodeIndexFound >= currentNodeIndex) {
                break;
            }
        }
        else {
            const isInitHook = arr[i] < 0;
            if (isInitHook)
                currentView[PREORDER_HOOK_FLAGS] += 65536 /* NumberOfInitHooksCalledIncrementer */;
            if (lastNodeIndexFound < nodeIndexLimit || nodeIndexLimit == -1) {
                callHook(currentView, initPhase, arr, i);
                currentView[PREORDER_HOOK_FLAGS] =
                    (currentView[PREORDER_HOOK_FLAGS] & 4294901760 /* NumberOfInitHooksCalledMask */) + i +
                        2;
            }
            i++;
        }
    }
}
/**
 * Execute one hook against the current `LView`.
 *
 * @param currentView The current view
 * @param initPhaseState the current state of the init phase
 * @param arr The array in which the hooks are found
 * @param i The current index within the hook data array
 */
function callHook(currentView, initPhase, arr, i) {
    const isInitHook = arr[i] < 0;
    const hook = arr[i + 1];
    const directiveIndex = isInitHook ? -arr[i] : arr[i];
    const directive = currentView[directiveIndex];
    if (isInitHook) {
        const indexWithintInitPhase = currentView[FLAGS] >> 11 /* IndexWithinInitPhaseShift */;
        // The init phase state must be always checked here as it may have been recursively
        // updated
        if (indexWithintInitPhase <
            (currentView[PREORDER_HOOK_FLAGS] >> 16 /* NumberOfInitHooksCalledShift */) &&
            (currentView[FLAGS] & 3 /* InitPhaseStateMask */) === initPhase) {
            currentView[FLAGS] += 2048 /* IndexWithinInitPhaseIncrementer */;
            hook.call(directive);
        }
    }
    else {
        hook.call(directive);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9va3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb3JlL3NyYy9yZW5kZXIzL2hvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUMvQyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUd2RSxPQUFPLEVBQUMsS0FBSyxFQUErQyxtQkFBbUIsRUFBMkIsTUFBTSxtQkFBbUIsQ0FBQztBQUNwSSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFJL0M7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUscUJBQXFCLENBQ2pDLGNBQXNCLEVBQUUsWUFBK0IsRUFBRSxLQUFZO0lBQ3ZFLFNBQVMsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMxQyxNQUFNLEVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsR0FDcEMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUF5QyxDQUFDO0lBRWhFLElBQUksV0FBbUMsRUFBRTtRQUN2QyxNQUFNLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzlELENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDM0YsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDLENBQUM7YUFDeEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxnQkFBZ0Is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Q0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsK0NBQWdELENBQUMsR0FBRyxDQUFDO3dCQUN0RixDQUFDLENBQUM7YUFDUDtZQUNELENBQUMsRUFBRSxDQUFDO1NBQ0w7S0FDRjtBQUNILENBQUM7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBUyxRQUFRLENBQUMsV0FBa0IsRUFBRSxTQUF5QixFQUFFLEdBQWEsRUFBRSxDQUFTO0lBQ3ZGLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQWUsQ0FBQztJQUN0QyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFXLENBQUM7SUFDL0QsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzlDLElBQUksVUFBVSxFQUFFO1FBQ2QsTUFBTSxxQkFBcUIsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLHNDQUF3QyxDQUFDO1FBQ3pGLG1GQUFtRjtRQUNuRixVQUFVO1FBQ1YsSUFBSSxxQkFBcUI7WUFDakIsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMseUNBQWtELENBQUM7WUFDeEYsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLDZCQUFnQyxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ3RFLFdBQVcsQ0FBQyxLQUFLLENBQUMsOENBQThDLENBQUM7WUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0QjtLQUNGO1NBQU07UUFDTCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3RCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FmdGVyQ29udGVudENoZWNrZWQsIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0NoZWNrZWQsIEFmdGVyVmlld0luaXQsIERvQ2hlY2ssIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXR9IGZyb20gJy4uL2ludGVyZmFjZS9saWZlY3ljbGVfaG9va3MnO1xuaW1wb3J0IHthc3NlcnREZWZpbmVkLCBhc3NlcnRFcXVhbCwgYXNzZXJ0Tm90RXF1YWx9IGZyb20gJy4uL3V0aWwvYXNzZXJ0JztcbmltcG9ydCB7YXNzZXJ0Rmlyc3RDcmVhdGVQYXNzfSBmcm9tICcuL2Fzc2VydCc7XG5pbXBvcnQge05nT25DaGFuZ2VzRmVhdHVyZUltcGx9IGZyb20gJy4vZmVhdHVyZXMvbmdfb25jaGFuZ2VzX2ZlYXR1cmUnO1xuaW1wb3J0IHtEaXJlY3RpdmVEZWZ9IGZyb20gJy4vaW50ZXJmYWNlcy9kZWZpbml0aW9uJztcbmltcG9ydCB7VE5vZGV9IGZyb20gJy4vaW50ZXJmYWNlcy9ub2RlJztcbmltcG9ydCB7RkxBR1MsIEhvb2tEYXRhLCBJbml0UGhhc2VTdGF0ZSwgTFZpZXcsIExWaWV3RmxhZ3MsIFBSRU9SREVSX0hPT0tfRkxBR1MsIFByZU9yZGVySG9va0ZsYWdzLCBUVmlld30gZnJvbSAnLi9pbnRlcmZhY2VzL3ZpZXcnO1xuaW1wb3J0IHtpc0luQ2hlY2tOb0NoYW5nZXNNb2RlfSBmcm9tICcuL3N0YXRlJztcblxuXG5cbi8qKlxuICogQWRkcyBhbGwgZGlyZWN0aXZlIGxpZmVjeWNsZSBob29rcyBmcm9tIHRoZSBnaXZlbiBgRGlyZWN0aXZlRGVmYCB0byB0aGUgZ2l2ZW4gYFRWaWV3YC5cbiAqXG4gKiBNdXN0IGJlIHJ1biAqb25seSogb24gdGhlIGZpcnN0IHRlbXBsYXRlIHBhc3MuXG4gKlxuICogU2V0cyB1cCB0aGUgcHJlLW9yZGVyIGhvb2tzIG9uIHRoZSBwcm92aWRlZCBgdFZpZXdgLFxuICogc2VlIHtAbGluayBIb29rRGF0YX0gZm9yIGRldGFpbHMgYWJvdXQgdGhlIGRhdGEgc3RydWN0dXJlLlxuICpcbiAqIEBwYXJhbSBkaXJlY3RpdmVJbmRleCBUaGUgaW5kZXggb2YgdGhlIGRpcmVjdGl2ZSBpbiBMVmlld1xuICogQHBhcmFtIGRpcmVjdGl2ZURlZiBUaGUgZGVmaW5pdGlvbiBjb250YWluaW5nIHRoZSBob29rcyB0byBzZXR1cCBpbiB0Vmlld1xuICogQHBhcmFtIHRWaWV3IFRoZSBjdXJyZW50IFRWaWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclByZU9yZGVySG9va3MoXG4gICAgZGlyZWN0aXZlSW5kZXg6IG51bWJlciwgZGlyZWN0aXZlRGVmOiBEaXJlY3RpdmVEZWY8YW55PiwgdFZpZXc6IFRWaWV3KTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJiBhc3NlcnRGaXJzdENyZWF0ZVBhc3ModFZpZXcpO1xuICBjb25zdCB7bmdPbkNoYW5nZXMsIG5nT25Jbml0LCBuZ0RvQ2hlY2t9ID1cbiAgICAgIGRpcmVjdGl2ZURlZi50eXBlLnByb3RvdHlwZSBhcyBPbkNoYW5nZXMgJiBPbkluaXQgJiBEb0NoZWNrO1xuXG4gIGlmIChuZ09uQ2hhbmdlcyBhcyBGdW5jdGlvbiB8IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHdyYXBwZWRPbkNoYW5nZXMgPSBOZ09uQ2hhbmdlc0ZlYXR1cmVJbXBsKGRpcmVjdGl2ZURlZik7XG4gICAgKHRWaWV3LnByZU9yZGVySG9va3MgfHwgKHRWaWV3LnByZU9yZGVySG9va3MgPSBbXSkpLnB1c2goZGlyZWN0aXZlSW5kZXgsIHdyYXBwZWRPbkNoYW5nZXMpO1xuICAgICh0Vmlldy5wcmVPcmRlckNoZWNrSG9va3MgfHwgKHRWaWV3LnByZU9yZGVyQ2hlY2tIb29rcyA9IFtdKSlcbiAgICAgICAgLnB1c2goZGlyZWN0aXZlSW5kZXgsIHdyYXBwZWRPbkNoYW5nZXMpO1xuICB9XG5cbiAgaWYgKG5nT25Jbml0KSB7XG4gICAgKHRWaWV3LnByZU9yZGVySG9va3MgfHwgKHRWaWV3LnByZU9yZGVySG9va3MgPSBbXSkpLnB1c2goMCAtIGRpcmVjdGl2ZUluZGV4LCBuZ09uSW5pdCk7XG4gIH1cblxuICBpZiAobmdEb0NoZWNrKSB7XG4gICAgKHRWaWV3LnByZU9yZGVySG9va3MgfHwgKHRWaWV3LnByZU9yZGVySG9va3MgPSBbXSkpLnB1c2goZGlyZWN0aXZlSW5kZXgsIG5nRG9DaGVjayk7XG4gICAgKHRWaWV3LnByZU9yZGVyQ2hlY2tIb29rcyB8fCAodFZpZXcucHJlT3JkZXJDaGVja0hvb2tzID0gW10pKS5wdXNoKGRpcmVjdGl2ZUluZGV4LCBuZ0RvQ2hlY2spO1xuICB9XG59XG5cbi8qKlxuICpcbiAqIExvb3BzIHRocm91Z2ggdGhlIGRpcmVjdGl2ZXMgb24gdGhlIHByb3ZpZGVkIGB0Tm9kZWAgYW5kIHF1ZXVlcyBob29rcyB0byBiZVxuICogcnVuIHRoYXQgYXJlIG5vdCBpbml0aWFsaXphdGlvbiBob29rcy5cbiAqXG4gKiBTaG91bGQgYmUgZXhlY3V0ZWQgZHVyaW5nIGBlbGVtZW50RW5kKClgIGFuZCBzaW1pbGFyIHRvXG4gKiBwcmVzZXJ2ZSBob29rIGV4ZWN1dGlvbiBvcmRlci4gQ29udGVudCwgdmlldywgYW5kIGRlc3Ryb3kgaG9va3MgZm9yIHByb2plY3RlZFxuICogY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBtdXN0IGJlIGNhbGxlZCAqYmVmb3JlKiB0aGVpciBob3N0cy5cbiAqXG4gKiBTZXRzIHVwIHRoZSBjb250ZW50LCB2aWV3LCBhbmQgZGVzdHJveSBob29rcyBvbiB0aGUgcHJvdmlkZWQgYHRWaWV3YCxcbiAqIHNlZSB7QGxpbmsgSG9va0RhdGF9IGZvciBkZXRhaWxzIGFib3V0IHRoZSBkYXRhIHN0cnVjdHVyZS5cbiAqXG4gKiBOT1RFOiBUaGlzIGRvZXMgbm90IHNldCB1cCBgb25DaGFuZ2VzYCwgYG9uSW5pdGAgb3IgYGRvQ2hlY2tgLCB0aG9zZSBhcmUgc2V0IHVwXG4gKiBzZXBhcmF0ZWx5IGF0IGBlbGVtZW50U3RhcnRgLlxuICpcbiAqIEBwYXJhbSB0VmlldyBUaGUgY3VycmVudCBUVmlld1xuICogQHBhcmFtIHROb2RlIFRoZSBUTm9kZSB3aG9zZSBkaXJlY3RpdmVzIGFyZSB0byBiZSBzZWFyY2hlZCBmb3IgaG9va3MgdG8gcXVldWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyUG9zdE9yZGVySG9va3ModFZpZXc6IFRWaWV3LCB0Tm9kZTogVE5vZGUpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmIGFzc2VydEZpcnN0Q3JlYXRlUGFzcyh0Vmlldyk7XG4gIC8vIEl0J3MgbmVjZXNzYXJ5IHRvIGxvb3AgdGhyb3VnaCB0aGUgZGlyZWN0aXZlcyBhdCBlbGVtZW50RW5kKCkgKHJhdGhlciB0aGFuIHByb2Nlc3NpbmcgaW5cbiAgLy8gZGlyZWN0aXZlQ3JlYXRlKSBzbyB3ZSBjYW4gcHJlc2VydmUgdGhlIGN1cnJlbnQgaG9vayBvcmRlci4gQ29udGVudCwgdmlldywgYW5kIGRlc3Ryb3lcbiAgLy8gaG9va3MgZm9yIHByb2plY3RlZCBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzIG11c3QgYmUgY2FsbGVkICpiZWZvcmUqIHRoZWlyIGhvc3RzLlxuICBmb3IgKGxldCBpID0gdE5vZGUuZGlyZWN0aXZlU3RhcnQsIGVuZCA9IHROb2RlLmRpcmVjdGl2ZUVuZDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlRGVmID0gdFZpZXcuZGF0YVtpXSBhcyBEaXJlY3RpdmVEZWY8YW55PjtcbiAgICBuZ0Rldk1vZGUgJiYgYXNzZXJ0RGVmaW5lZChkaXJlY3RpdmVEZWYsICdFeHBlY3RpbmcgRGlyZWN0aXZlRGVmJyk7XG4gICAgY29uc3QgbGlmZWN5Y2xlSG9va3M6IEFmdGVyQ29udGVudEluaXQmQWZ0ZXJDb250ZW50Q2hlY2tlZCZBZnRlclZpZXdJbml0JkFmdGVyVmlld0NoZWNrZWQmXG4gICAgICAgIE9uRGVzdHJveSA9IGRpcmVjdGl2ZURlZi50eXBlLnByb3RvdHlwZTtcbiAgICBjb25zdCB7XG4gICAgICBuZ0FmdGVyQ29udGVudEluaXQsXG4gICAgICBuZ0FmdGVyQ29udGVudENoZWNrZWQsXG4gICAgICBuZ0FmdGVyVmlld0luaXQsXG4gICAgICBuZ0FmdGVyVmlld0NoZWNrZWQsXG4gICAgICBuZ09uRGVzdHJveVxuICAgIH0gPSBsaWZlY3ljbGVIb29rcztcblxuICAgIGlmIChuZ0FmdGVyQ29udGVudEluaXQpIHtcbiAgICAgICh0Vmlldy5jb250ZW50SG9va3MgfHwgKHRWaWV3LmNvbnRlbnRIb29rcyA9IFtdKSkucHVzaCgtaSwgbmdBZnRlckNvbnRlbnRJbml0KTtcbiAgICB9XG5cbiAgICBpZiAobmdBZnRlckNvbnRlbnRDaGVja2VkKSB7XG4gICAgICAodFZpZXcuY29udGVudEhvb2tzIHx8ICh0Vmlldy5jb250ZW50SG9va3MgPSBbXSkpLnB1c2goaSwgbmdBZnRlckNvbnRlbnRDaGVja2VkKTtcbiAgICAgICh0Vmlldy5jb250ZW50Q2hlY2tIb29rcyB8fCAodFZpZXcuY29udGVudENoZWNrSG9va3MgPSBbXSkpLnB1c2goaSwgbmdBZnRlckNvbnRlbnRDaGVja2VkKTtcbiAgICB9XG5cbiAgICBpZiAobmdBZnRlclZpZXdJbml0KSB7XG4gICAgICAodFZpZXcudmlld0hvb2tzIHx8ICh0Vmlldy52aWV3SG9va3MgPSBbXSkpLnB1c2goLWksIG5nQWZ0ZXJWaWV3SW5pdCk7XG4gICAgfVxuXG4gICAgaWYgKG5nQWZ0ZXJWaWV3Q2hlY2tlZCkge1xuICAgICAgKHRWaWV3LnZpZXdIb29rcyB8fCAodFZpZXcudmlld0hvb2tzID0gW10pKS5wdXNoKGksIG5nQWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgICAodFZpZXcudmlld0NoZWNrSG9va3MgfHwgKHRWaWV3LnZpZXdDaGVja0hvb2tzID0gW10pKS5wdXNoKGksIG5nQWZ0ZXJWaWV3Q2hlY2tlZCk7XG4gICAgfVxuXG4gICAgaWYgKG5nT25EZXN0cm95ICE9IG51bGwpIHtcbiAgICAgICh0Vmlldy5kZXN0cm95SG9va3MgfHwgKHRWaWV3LmRlc3Ryb3lIb29rcyA9IFtdKSkucHVzaChpLCBuZ09uRGVzdHJveSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXhlY3V0aW5nIGhvb2tzIHJlcXVpcmVzIGNvbXBsZXggbG9naWMgYXMgd2UgbmVlZCB0byBkZWFsIHdpdGggMiBjb25zdHJhaW50cy5cbiAqXG4gKiAxLiBJbml0IGhvb2tzIChuZ09uSW5pdCwgbmdBZnRlckNvbnRlbnRJbml0LCBuZ0FmdGVyVmlld0luaXQpIG11c3QgYWxsIGJlIGV4ZWN1dGVkIG9uY2UgYW5kIG9ubHlcbiAqIG9uY2UsIGFjcm9zcyBtYW55IGNoYW5nZSBkZXRlY3Rpb24gY3ljbGVzLiBUaGlzIG11c3QgYmUgdHJ1ZSBldmVuIGlmIHNvbWUgaG9va3MgdGhyb3csIG9yIGlmXG4gKiBzb21lIHJlY3Vyc2l2ZWx5IHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlLlxuICogVG8gc29sdmUgdGhhdCwgaXQgaXMgcmVxdWlyZWQgdG8gdHJhY2sgdGhlIHN0YXRlIG9mIHRoZSBleGVjdXRpb24gb2YgdGhlc2UgaW5pdCBob29rcy5cbiAqIFRoaXMgaXMgZG9uZSBieSBzdG9yaW5nIGFuZCBtYWludGFpbmluZyBmbGFncyBpbiB0aGUgdmlldzogdGhlIHtAbGluayBJbml0UGhhc2VTdGF0ZX0sXG4gKiBhbmQgdGhlIGluZGV4IHdpdGhpbiB0aGF0IHBoYXNlLiBUaGV5IGNhbiBiZSBzZWVuIGFzIGEgY3Vyc29yIGluIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlOlxuICogW1tvbkluaXQxLCBvbkluaXQyXSwgW2FmdGVyQ29udGVudEluaXQxXSwgW2FmdGVyVmlld0luaXQxLCBhZnRlclZpZXdJbml0MiwgYWZ0ZXJWaWV3SW5pdDNdXVxuICogVGhleSBhcmUgYXJlIHN0b3JlZCBhcyBmbGFncyBpbiBMVmlld1tGTEFHU10uXG4gKlxuICogMi4gUHJlLW9yZGVyIGhvb2tzIGNhbiBiZSBleGVjdXRlZCBpbiBiYXRjaGVzLCBiZWNhdXNlIG9mIHRoZSBzZWxlY3QgaW5zdHJ1Y3Rpb24uXG4gKiBUbyBiZSBhYmxlIHRvIHBhdXNlIGFuZCByZXN1bWUgdGhlaXIgZXhlY3V0aW9uLCB3ZSBhbHNvIG5lZWQgc29tZSBzdGF0ZSBhYm91dCB0aGUgaG9vaydzIGFycmF5XG4gKiB0aGF0IGlzIGJlaW5nIHByb2Nlc3NlZDpcbiAqIC0gdGhlIGluZGV4IG9mIHRoZSBuZXh0IGhvb2sgdG8gYmUgZXhlY3V0ZWRcbiAqIC0gdGhlIG51bWJlciBvZiBpbml0IGhvb2tzIGFscmVhZHkgZm91bmQgaW4gdGhlIHByb2Nlc3NlZCBwYXJ0IG9mIHRoZSAgYXJyYXlcbiAqIFRoZXkgYXJlIGFyZSBzdG9yZWQgYXMgZmxhZ3MgaW4gTFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10uXG4gKi9cblxuXG4vKipcbiAqIEV4ZWN1dGVzIHByZS1vcmRlciBjaGVjayBob29rcyAoIE9uQ2hhbmdlcywgRG9DaGFuZ2VzKSBnaXZlbiBhIHZpZXcgd2hlcmUgYWxsIHRoZSBpbml0IGhvb2tzIHdlcmVcbiAqIGV4ZWN1dGVkIG9uY2UuIFRoaXMgaXMgYSBsaWdodCB2ZXJzaW9uIG9mIGV4ZWN1dGVJbml0QW5kQ2hlY2tQcmVPcmRlckhvb2tzIHdoZXJlIHdlIGNhbiBza2lwIHJlYWRcbiAqIC8gd3JpdGUgb2YgdGhlIGluaXQtaG9va3MgcmVsYXRlZCBmbGFncy5cbiAqIEBwYXJhbSBsVmlldyBUaGUgTFZpZXcgd2hlcmUgaG9va3MgYXJlIGRlZmluZWRcbiAqIEBwYXJhbSBob29rcyBIb29rcyB0byBiZSBydW5cbiAqIEBwYXJhbSBub2RlSW5kZXggMyBjYXNlcyBkZXBlbmRpbmcgb24gdGhlIHZhbHVlOlxuICogLSB1bmRlZmluZWQ6IGFsbCBob29rcyBmcm9tIHRoZSBhcnJheSBzaG91bGQgYmUgZXhlY3V0ZWQgKHBvc3Qtb3JkZXIgY2FzZSlcbiAqIC0gbnVsbDogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoZSBlbmQgb2YgdGhlIGFycmF5IChwcmUtb3JkZXIgY2FzZSwgd2hlblxuICogZmx1c2hpbmcgdGhlIHJlbWFpbmluZyBob29rcylcbiAqIC0gbnVtYmVyOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhhdCBub2RlIGluZGV4IGV4Y2x1c2l2ZSAocHJlLW9yZGVyXG4gKiBjYXNlLCB3aGVuIGV4ZWN1dGluZyBzZWxlY3QobnVtYmVyKSlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4ZWN1dGVDaGVja0hvb2tzKGxWaWV3OiBMVmlldywgaG9va3M6IEhvb2tEYXRhLCBub2RlSW5kZXg/OiBudW1iZXJ8bnVsbCkge1xuICBjYWxsSG9va3MobFZpZXcsIGhvb2tzLCBJbml0UGhhc2VTdGF0ZS5Jbml0UGhhc2VDb21wbGV0ZWQsIG5vZGVJbmRleCk7XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgcG9zdC1vcmRlciBpbml0IGFuZCBjaGVjayBob29rcyAob25lIG9mIEFmdGVyQ29udGVudEluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsXG4gKiBBZnRlclZpZXdJbml0LCBBZnRlclZpZXdDaGVja2VkKSBnaXZlbiBhIHZpZXcgd2hlcmUgdGhlcmUgYXJlIHBlbmRpbmcgaW5pdCBob29rcyB0byBiZSBleGVjdXRlZC5cbiAqIEBwYXJhbSBsVmlldyBUaGUgTFZpZXcgd2hlcmUgaG9va3MgYXJlIGRlZmluZWRcbiAqIEBwYXJhbSBob29rcyBIb29rcyB0byBiZSBydW5cbiAqIEBwYXJhbSBpbml0UGhhc2UgQSBwaGFzZSBmb3Igd2hpY2ggaG9va3Mgc2hvdWxkIGJlIHJ1blxuICogQHBhcmFtIG5vZGVJbmRleCAzIGNhc2VzIGRlcGVuZGluZyBvbiB0aGUgdmFsdWU6XG4gKiAtIHVuZGVmaW5lZDogYWxsIGhvb2tzIGZyb20gdGhlIGFycmF5IHNob3VsZCBiZSBleGVjdXRlZCAocG9zdC1vcmRlciBjYXNlKVxuICogLSBudWxsOiBleGVjdXRlIGhvb2tzIG9ubHkgZnJvbSB0aGUgc2F2ZWQgaW5kZXggdW50aWwgdGhlIGVuZCBvZiB0aGUgYXJyYXkgKHByZS1vcmRlciBjYXNlLCB3aGVuXG4gKiBmbHVzaGluZyB0aGUgcmVtYWluaW5nIGhvb2tzKVxuICogLSBudW1iZXI6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGF0IG5vZGUgaW5kZXggZXhjbHVzaXZlIChwcmUtb3JkZXJcbiAqIGNhc2UsIHdoZW4gZXhlY3V0aW5nIHNlbGVjdChudW1iZXIpKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZUluaXRBbmRDaGVja0hvb2tzKFxuICAgIGxWaWV3OiBMVmlldywgaG9va3M6IEhvb2tEYXRhLCBpbml0UGhhc2U6IEluaXRQaGFzZVN0YXRlLCBub2RlSW5kZXg/OiBudW1iZXJ8bnVsbCkge1xuICBuZ0Rldk1vZGUgJiZcbiAgICAgIGFzc2VydE5vdEVxdWFsKFxuICAgICAgICAgIGluaXRQaGFzZSwgSW5pdFBoYXNlU3RhdGUuSW5pdFBoYXNlQ29tcGxldGVkLFxuICAgICAgICAgICdJbml0IHByZS1vcmRlciBob29rcyBzaG91bGQgbm90IGJlIGNhbGxlZCBtb3JlIHRoYW4gb25jZScpO1xuICBpZiAoKGxWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gaW5pdFBoYXNlKSB7XG4gICAgY2FsbEhvb2tzKGxWaWV3LCBob29rcywgaW5pdFBoYXNlLCBub2RlSW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRJbml0UGhhc2VGbGFncyhsVmlldzogTFZpZXcsIGluaXRQaGFzZTogSW5pdFBoYXNlU3RhdGUpOiB2b2lkIHtcbiAgbmdEZXZNb2RlICYmXG4gICAgICBhc3NlcnROb3RFcXVhbChcbiAgICAgICAgICBpbml0UGhhc2UsIEluaXRQaGFzZVN0YXRlLkluaXRQaGFzZUNvbXBsZXRlZCxcbiAgICAgICAgICAnSW5pdCBob29rcyBwaGFzZSBzaG91bGQgbm90IGJlIGluY3JlbWVudGVkIGFmdGVyIGFsbCBpbml0IGhvb2tzIGhhdmUgYmVlbiBydW4uJyk7XG4gIGxldCBmbGFncyA9IGxWaWV3W0ZMQUdTXTtcbiAgaWYgKChmbGFncyAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gaW5pdFBoYXNlKSB7XG4gICAgZmxhZ3MgJj0gTFZpZXdGbGFncy5JbmRleFdpdGhpbkluaXRQaGFzZVJlc2V0O1xuICAgIGZsYWdzICs9IExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVJbmNyZW1lbnRlcjtcbiAgICBsVmlld1tGTEFHU10gPSBmbGFncztcbiAgfVxufVxuXG4vKipcbiAqIENhbGxzIGxpZmVjeWNsZSBob29rcyB3aXRoIHRoZWlyIGNvbnRleHRzLCBza2lwcGluZyBpbml0IGhvb2tzIGlmIGl0J3Mgbm90XG4gKiB0aGUgZmlyc3QgTFZpZXcgcGFzc1xuICpcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBUaGUgY3VycmVudCB2aWV3XG4gKiBAcGFyYW0gYXJyIFRoZSBhcnJheSBpbiB3aGljaCB0aGUgaG9va3MgYXJlIGZvdW5kXG4gKiBAcGFyYW0gaW5pdFBoYXNlU3RhdGUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluaXQgcGhhc2VcbiAqIEBwYXJhbSBjdXJyZW50Tm9kZUluZGV4IDMgY2FzZXMgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZTpcbiAqIC0gdW5kZWZpbmVkOiBhbGwgaG9va3MgZnJvbSB0aGUgYXJyYXkgc2hvdWxkIGJlIGV4ZWN1dGVkIChwb3N0LW9yZGVyIGNhc2UpXG4gKiAtIG51bGw6IGV4ZWN1dGUgaG9va3Mgb25seSBmcm9tIHRoZSBzYXZlZCBpbmRleCB1bnRpbCB0aGUgZW5kIG9mIHRoZSBhcnJheSAocHJlLW9yZGVyIGNhc2UsIHdoZW5cbiAqIGZsdXNoaW5nIHRoZSByZW1haW5pbmcgaG9va3MpXG4gKiAtIG51bWJlcjogZXhlY3V0ZSBob29rcyBvbmx5IGZyb20gdGhlIHNhdmVkIGluZGV4IHVudGlsIHRoYXQgbm9kZSBpbmRleCBleGNsdXNpdmUgKHByZS1vcmRlclxuICogY2FzZSwgd2hlbiBleGVjdXRpbmcgc2VsZWN0KG51bWJlcikpXG4gKi9cbmZ1bmN0aW9uIGNhbGxIb29rcyhcbiAgICBjdXJyZW50VmlldzogTFZpZXcsIGFycjogSG9va0RhdGEsIGluaXRQaGFzZTogSW5pdFBoYXNlU3RhdGUsXG4gICAgY3VycmVudE5vZGVJbmRleDogbnVtYmVyfG51bGx8dW5kZWZpbmVkKTogdm9pZCB7XG4gIG5nRGV2TW9kZSAmJlxuICAgICAgYXNzZXJ0RXF1YWwoXG4gICAgICAgICAgaXNJbkNoZWNrTm9DaGFuZ2VzTW9kZSgpLCBmYWxzZSxcbiAgICAgICAgICAnSG9va3Mgc2hvdWxkIG5ldmVyIGJlIHJ1biB3aGVuIGluIGNoZWNrIG5vIGNoYW5nZXMgbW9kZS4nKTtcbiAgY29uc3Qgc3RhcnRJbmRleCA9IGN1cnJlbnROb2RlSW5kZXggIT09IHVuZGVmaW5lZCA/XG4gICAgICAoY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gJiBQcmVPcmRlckhvb2tGbGFncy5JbmRleE9mVGhlTmV4dFByZU9yZGVySG9va01hc2tNYXNrKSA6XG4gICAgICAwO1xuICBjb25zdCBub2RlSW5kZXhMaW1pdCA9IGN1cnJlbnROb2RlSW5kZXggIT0gbnVsbCA/IGN1cnJlbnROb2RlSW5kZXggOiAtMTtcbiAgbGV0IGxhc3ROb2RlSW5kZXhGb3VuZCA9IDA7XG4gIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgaG9vayA9IGFycltpICsgMV0gYXMgKCkgPT4gdm9pZDtcbiAgICBpZiAodHlwZW9mIGhvb2sgPT09ICdudW1iZXInKSB7XG4gICAgICBsYXN0Tm9kZUluZGV4Rm91bmQgPSBhcnJbaV0gYXMgbnVtYmVyO1xuICAgICAgaWYgKGN1cnJlbnROb2RlSW5kZXggIT0gbnVsbCAmJiBsYXN0Tm9kZUluZGV4Rm91bmQgPj0gY3VycmVudE5vZGVJbmRleCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaXNJbml0SG9vayA9IGFycltpXSA8IDA7XG4gICAgICBpZiAoaXNJbml0SG9vaylcbiAgICAgICAgY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gKz0gUHJlT3JkZXJIb29rRmxhZ3MuTnVtYmVyT2ZJbml0SG9va3NDYWxsZWRJbmNyZW1lbnRlcjtcbiAgICAgIGlmIChsYXN0Tm9kZUluZGV4Rm91bmQgPCBub2RlSW5kZXhMaW1pdCB8fCBub2RlSW5kZXhMaW1pdCA9PSAtMSkge1xuICAgICAgICBjYWxsSG9vayhjdXJyZW50VmlldywgaW5pdFBoYXNlLCBhcnIsIGkpO1xuICAgICAgICBjdXJyZW50Vmlld1tQUkVPUkRFUl9IT09LX0ZMQUdTXSA9XG4gICAgICAgICAgICAoY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gJiBQcmVPcmRlckhvb2tGbGFncy5OdW1iZXJPZkluaXRIb29rc0NhbGxlZE1hc2spICsgaSArXG4gICAgICAgICAgICAyO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEV4ZWN1dGUgb25lIGhvb2sgYWdhaW5zdCB0aGUgY3VycmVudCBgTFZpZXdgLlxuICpcbiAqIEBwYXJhbSBjdXJyZW50VmlldyBUaGUgY3VycmVudCB2aWV3XG4gKiBAcGFyYW0gaW5pdFBoYXNlU3RhdGUgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGluaXQgcGhhc2VcbiAqIEBwYXJhbSBhcnIgVGhlIGFycmF5IGluIHdoaWNoIHRoZSBob29rcyBhcmUgZm91bmRcbiAqIEBwYXJhbSBpIFRoZSBjdXJyZW50IGluZGV4IHdpdGhpbiB0aGUgaG9vayBkYXRhIGFycmF5XG4gKi9cbmZ1bmN0aW9uIGNhbGxIb29rKGN1cnJlbnRWaWV3OiBMVmlldywgaW5pdFBoYXNlOiBJbml0UGhhc2VTdGF0ZSwgYXJyOiBIb29rRGF0YSwgaTogbnVtYmVyKSB7XG4gIGNvbnN0IGlzSW5pdEhvb2sgPSBhcnJbaV0gPCAwO1xuICBjb25zdCBob29rID0gYXJyW2kgKyAxXSBhcyAoKSA9PiB2b2lkO1xuICBjb25zdCBkaXJlY3RpdmVJbmRleCA9IGlzSW5pdEhvb2sgPyAtYXJyW2ldIDogYXJyW2ldIGFzIG51bWJlcjtcbiAgY29uc3QgZGlyZWN0aXZlID0gY3VycmVudFZpZXdbZGlyZWN0aXZlSW5kZXhdO1xuICBpZiAoaXNJbml0SG9vaykge1xuICAgIGNvbnN0IGluZGV4V2l0aGludEluaXRQaGFzZSA9IGN1cnJlbnRWaWV3W0ZMQUdTXSA+PiBMVmlld0ZsYWdzLkluZGV4V2l0aGluSW5pdFBoYXNlU2hpZnQ7XG4gICAgLy8gVGhlIGluaXQgcGhhc2Ugc3RhdGUgbXVzdCBiZSBhbHdheXMgY2hlY2tlZCBoZXJlIGFzIGl0IG1heSBoYXZlIGJlZW4gcmVjdXJzaXZlbHlcbiAgICAvLyB1cGRhdGVkXG4gICAgaWYgKGluZGV4V2l0aGludEluaXRQaGFzZSA8XG4gICAgICAgICAgICAoY3VycmVudFZpZXdbUFJFT1JERVJfSE9PS19GTEFHU10gPj4gUHJlT3JkZXJIb29rRmxhZ3MuTnVtYmVyT2ZJbml0SG9va3NDYWxsZWRTaGlmdCkgJiZcbiAgICAgICAgKGN1cnJlbnRWaWV3W0ZMQUdTXSAmIExWaWV3RmxhZ3MuSW5pdFBoYXNlU3RhdGVNYXNrKSA9PT0gaW5pdFBoYXNlKSB7XG4gICAgICBjdXJyZW50Vmlld1tGTEFHU10gKz0gTFZpZXdGbGFncy5JbmRleFdpdGhpbkluaXRQaGFzZUluY3JlbWVudGVyO1xuICAgICAgaG9vay5jYWxsKGRpcmVjdGl2ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhvb2suY2FsbChkaXJlY3RpdmUpO1xuICB9XG59XG4iXX0=