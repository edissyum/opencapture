/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/completion", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/typecheck/src/comments"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompletionEngine = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var comments_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/comments");
    /**
     * Powers autocompletion for a specific component.
     *
     * Internally caches autocompletion results, and must be discarded if the component template or
     * surrounding TS program have changed.
     */
    var CompletionEngine = /** @class */ (function () {
        function CompletionEngine(tcb, data, shimPath) {
            this.tcb = tcb;
            this.data = data;
            this.shimPath = shimPath;
            /**
             * Cache of `GlobalCompletion`s for various levels of the template, including the root template
             * (`null`).
             */
            this.globalCompletionCache = new Map();
        }
        /**
         * Get global completions within the given template context - either a `TmplAstTemplate` embedded
         * view, or `null` for the root template context.
         */
        CompletionEngine.prototype.getGlobalCompletions = function (context) {
            var e_1, _a;
            if (this.globalCompletionCache.has(context)) {
                return this.globalCompletionCache.get(context);
            }
            // Find the component completion expression within the TCB. This looks like: `ctx. /* ... */;`
            var globalRead = comments_1.findFirstMatchingNode(this.tcb, {
                filter: ts.isPropertyAccessExpression,
                withExpressionIdentifier: comments_1.ExpressionIdentifier.COMPONENT_COMPLETION
            });
            if (globalRead === null) {
                return null;
            }
            var completion = {
                componentContext: {
                    shimPath: this.shimPath,
                    // `globalRead.name` is an empty `ts.Identifier`, so its start position immediately follows
                    // the `.` in `ctx.`. TS autocompletion APIs can then be used to access completion results
                    // for the component context.
                    positionInShimFile: globalRead.name.getStart(),
                },
                templateContext: new Map(),
            };
            try {
                // The bound template already has details about the references and variables in scope in the
                // `context` template - they just need to be converted to `Completion`s.
                for (var _b = tslib_1.__values(this.data.boundTarget.getEntitiesInTemplateScope(context)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var node = _c.value;
                    if (node instanceof compiler_1.TmplAstReference) {
                        completion.templateContext.set(node.name, {
                            kind: api_1.CompletionKind.Reference,
                            node: node,
                        });
                    }
                    else {
                        completion.templateContext.set(node.name, {
                            kind: api_1.CompletionKind.Variable,
                            node: node,
                        });
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.globalCompletionCache.set(context, completion);
            return completion;
        };
        return CompletionEngine;
    }());
    exports.CompletionEngine = CompletionEngine;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jb21wbGV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBb0U7SUFDcEUsK0JBQWlDO0lBR2pDLHFFQUFpRztJQUVqRyxtRkFBdUU7SUFHdkU7Ozs7O09BS0c7SUFDSDtRQU9FLDBCQUFvQixHQUFZLEVBQVUsSUFBa0IsRUFBVSxRQUF3QjtZQUExRSxRQUFHLEdBQUgsR0FBRyxDQUFTO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBYztZQUFVLGFBQVEsR0FBUixRQUFRLENBQWdCO1lBTjlGOzs7ZUFHRztZQUNLLDBCQUFxQixHQUFHLElBQUksR0FBRyxFQUEwQyxDQUFDO1FBRWUsQ0FBQztRQUVsRzs7O1dBR0c7UUFDSCwrQ0FBb0IsR0FBcEIsVUFBcUIsT0FBNkI7O1lBQ2hELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDM0MsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDO2FBQ2pEO1lBRUQsOEZBQThGO1lBQzlGLElBQU0sVUFBVSxHQUFHLGdDQUFxQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELE1BQU0sRUFBRSxFQUFFLENBQUMsMEJBQTBCO2dCQUNyQyx3QkFBd0IsRUFBRSwrQkFBb0IsQ0FBQyxvQkFBb0I7YUFDcEUsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFBTSxVQUFVLEdBQXFCO2dCQUNuQyxnQkFBZ0IsRUFBRTtvQkFDaEIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO29CQUN2QiwyRkFBMkY7b0JBQzNGLDBGQUEwRjtvQkFDMUYsNkJBQTZCO29CQUM3QixrQkFBa0IsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtpQkFDL0M7Z0JBQ0QsZUFBZSxFQUFFLElBQUksR0FBRyxFQUFrRDthQUMzRSxDQUFDOztnQkFFRiw0RkFBNEY7Z0JBQzVGLHdFQUF3RTtnQkFDeEUsS0FBbUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFBLGdCQUFBLDRCQUFFO29CQUF6RSxJQUFNLElBQUksV0FBQTtvQkFDYixJQUFJLElBQUksWUFBWSwyQkFBZ0IsRUFBRTt3QkFDcEMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTs0QkFDeEMsSUFBSSxFQUFFLG9CQUFjLENBQUMsU0FBUzs0QkFDOUIsSUFBSSxNQUFBO3lCQUNMLENBQUMsQ0FBQztxQkFDSjt5QkFBTTt3QkFDTCxVQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFOzRCQUN4QyxJQUFJLEVBQUUsb0JBQWMsQ0FBQyxRQUFROzRCQUM3QixJQUFJLE1BQUE7eUJBQ0wsQ0FBQyxDQUFDO3FCQUNKO2lCQUNGOzs7Ozs7Ozs7WUFFRCxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNwRCxPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBMURELElBMERDO0lBMURZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1RtcGxBc3RSZWZlcmVuY2UsIFRtcGxBc3RUZW1wbGF0ZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Q29tcGxldGlvbktpbmQsIEdsb2JhbENvbXBsZXRpb24sIFJlZmVyZW5jZUNvbXBsZXRpb24sIFZhcmlhYmxlQ29tcGxldGlvbn0gZnJvbSAnLi4vYXBpJztcblxuaW1wb3J0IHtFeHByZXNzaW9uSWRlbnRpZmllciwgZmluZEZpcnN0TWF0Y2hpbmdOb2RlfSBmcm9tICcuL2NvbW1lbnRzJztcbmltcG9ydCB7VGVtcGxhdGVEYXRhfSBmcm9tICcuL2NvbnRleHQnO1xuXG4vKipcbiAqIFBvd2VycyBhdXRvY29tcGxldGlvbiBmb3IgYSBzcGVjaWZpYyBjb21wb25lbnQuXG4gKlxuICogSW50ZXJuYWxseSBjYWNoZXMgYXV0b2NvbXBsZXRpb24gcmVzdWx0cywgYW5kIG11c3QgYmUgZGlzY2FyZGVkIGlmIHRoZSBjb21wb25lbnQgdGVtcGxhdGUgb3JcbiAqIHN1cnJvdW5kaW5nIFRTIHByb2dyYW0gaGF2ZSBjaGFuZ2VkLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcGxldGlvbkVuZ2luZSB7XG4gIC8qKlxuICAgKiBDYWNoZSBvZiBgR2xvYmFsQ29tcGxldGlvbmBzIGZvciB2YXJpb3VzIGxldmVscyBvZiB0aGUgdGVtcGxhdGUsIGluY2x1ZGluZyB0aGUgcm9vdCB0ZW1wbGF0ZVxuICAgKiAoYG51bGxgKS5cbiAgICovXG4gIHByaXZhdGUgZ2xvYmFsQ29tcGxldGlvbkNhY2hlID0gbmV3IE1hcDxUbXBsQXN0VGVtcGxhdGV8bnVsbCwgR2xvYmFsQ29tcGxldGlvbj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRjYjogdHMuTm9kZSwgcHJpdmF0ZSBkYXRhOiBUZW1wbGF0ZURhdGEsIHByaXZhdGUgc2hpbVBhdGg6IEFic29sdXRlRnNQYXRoKSB7fVxuXG4gIC8qKlxuICAgKiBHZXQgZ2xvYmFsIGNvbXBsZXRpb25zIHdpdGhpbiB0aGUgZ2l2ZW4gdGVtcGxhdGUgY29udGV4dCAtIGVpdGhlciBhIGBUbXBsQXN0VGVtcGxhdGVgIGVtYmVkZGVkXG4gICAqIHZpZXcsIG9yIGBudWxsYCBmb3IgdGhlIHJvb3QgdGVtcGxhdGUgY29udGV4dC5cbiAgICovXG4gIGdldEdsb2JhbENvbXBsZXRpb25zKGNvbnRleHQ6IFRtcGxBc3RUZW1wbGF0ZXxudWxsKTogR2xvYmFsQ29tcGxldGlvbnxudWxsIHtcbiAgICBpZiAodGhpcy5nbG9iYWxDb21wbGV0aW9uQ2FjaGUuaGFzKGNvbnRleHQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nbG9iYWxDb21wbGV0aW9uQ2FjaGUuZ2V0KGNvbnRleHQpITtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBjb21wb25lbnQgY29tcGxldGlvbiBleHByZXNzaW9uIHdpdGhpbiB0aGUgVENCLiBUaGlzIGxvb2tzIGxpa2U6IGBjdHguIC8qIC4uLiAqLztgXG4gICAgY29uc3QgZ2xvYmFsUmVhZCA9IGZpbmRGaXJzdE1hdGNoaW5nTm9kZSh0aGlzLnRjYiwge1xuICAgICAgZmlsdGVyOiB0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbixcbiAgICAgIHdpdGhFeHByZXNzaW9uSWRlbnRpZmllcjogRXhwcmVzc2lvbklkZW50aWZpZXIuQ09NUE9ORU5UX0NPTVBMRVRJT05cbiAgICB9KTtcblxuICAgIGlmIChnbG9iYWxSZWFkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjb21wbGV0aW9uOiBHbG9iYWxDb21wbGV0aW9uID0ge1xuICAgICAgY29tcG9uZW50Q29udGV4dDoge1xuICAgICAgICBzaGltUGF0aDogdGhpcy5zaGltUGF0aCxcbiAgICAgICAgLy8gYGdsb2JhbFJlYWQubmFtZWAgaXMgYW4gZW1wdHkgYHRzLklkZW50aWZpZXJgLCBzbyBpdHMgc3RhcnQgcG9zaXRpb24gaW1tZWRpYXRlbHkgZm9sbG93c1xuICAgICAgICAvLyB0aGUgYC5gIGluIGBjdHguYC4gVFMgYXV0b2NvbXBsZXRpb24gQVBJcyBjYW4gdGhlbiBiZSB1c2VkIHRvIGFjY2VzcyBjb21wbGV0aW9uIHJlc3VsdHNcbiAgICAgICAgLy8gZm9yIHRoZSBjb21wb25lbnQgY29udGV4dC5cbiAgICAgICAgcG9zaXRpb25JblNoaW1GaWxlOiBnbG9iYWxSZWFkLm5hbWUuZ2V0U3RhcnQoKSxcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZUNvbnRleHQ6IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2VDb21wbGV0aW9ufFZhcmlhYmxlQ29tcGxldGlvbj4oKSxcbiAgICB9O1xuXG4gICAgLy8gVGhlIGJvdW5kIHRlbXBsYXRlIGFscmVhZHkgaGFzIGRldGFpbHMgYWJvdXQgdGhlIHJlZmVyZW5jZXMgYW5kIHZhcmlhYmxlcyBpbiBzY29wZSBpbiB0aGVcbiAgICAvLyBgY29udGV4dGAgdGVtcGxhdGUgLSB0aGV5IGp1c3QgbmVlZCB0byBiZSBjb252ZXJ0ZWQgdG8gYENvbXBsZXRpb25gcy5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5kYXRhLmJvdW5kVGFyZ2V0LmdldEVudGl0aWVzSW5UZW1wbGF0ZVNjb3BlKGNvbnRleHQpKSB7XG4gICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIFRtcGxBc3RSZWZlcmVuY2UpIHtcbiAgICAgICAgY29tcGxldGlvbi50ZW1wbGF0ZUNvbnRleHQuc2V0KG5vZGUubmFtZSwge1xuICAgICAgICAgIGtpbmQ6IENvbXBsZXRpb25LaW5kLlJlZmVyZW5jZSxcbiAgICAgICAgICBub2RlLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBsZXRpb24udGVtcGxhdGVDb250ZXh0LnNldChub2RlLm5hbWUsIHtcbiAgICAgICAgICBraW5kOiBDb21wbGV0aW9uS2luZC5WYXJpYWJsZSxcbiAgICAgICAgICBub2RlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmdsb2JhbENvbXBsZXRpb25DYWNoZS5zZXQoY29udGV4dCwgY29tcGxldGlvbik7XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cbn1cbiJdfQ==