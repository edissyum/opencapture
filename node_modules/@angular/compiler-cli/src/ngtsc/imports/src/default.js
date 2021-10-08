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
        define("@angular/compiler-cli/src/ngtsc/imports/src/default", ["require", "exports", "typescript", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultImportTracker = exports.getDefaultImportDeclaration = exports.attachDefaultImportDeclaration = void 0;
    var ts = require("typescript");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var DefaultImportDeclaration = Symbol('DefaultImportDeclaration');
    /**
     * Attaches a default import declaration to `expr` to indicate the dependency of `expr` on the
     * default import.
     */
    function attachDefaultImportDeclaration(expr, importDecl) {
        expr[DefaultImportDeclaration] = importDecl;
    }
    exports.attachDefaultImportDeclaration = attachDefaultImportDeclaration;
    /**
     * Obtains the default import declaration that `expr` depends on, or `null` if there is no such
     * dependency.
     */
    function getDefaultImportDeclaration(expr) {
        var _a;
        return (_a = expr[DefaultImportDeclaration]) !== null && _a !== void 0 ? _a : null;
    }
    exports.getDefaultImportDeclaration = getDefaultImportDeclaration;
    /**
     * TypeScript has trouble with generating default imports inside of transformers for some module
     * formats. The issue is that for the statement:
     *
     * import X from 'some/module';
     * console.log(X);
     *
     * TypeScript will not use the "X" name in generated code. For normal user code, this is fine
     * because references to X will also be renamed. However, if both the import and any references are
     * added in a transformer, TypeScript does not associate the two, and will leave the "X" references
     * dangling while renaming the import variable. The generated code looks something like:
     *
     * const module_1 = require('some/module');
     * console.log(X); // now X is a dangling reference.
     *
     * Therefore, we cannot synthetically add default imports, and must reuse the imports that users
     * include. Doing this poses a challenge for imports that are only consumed in the type position in
     * the user's code. If Angular reuses the imported symbol in a value position (for example, we
     * see a constructor parameter of type Foo and try to write "inject(Foo)") we will also end up with
     * a dangling reference, as TS will elide the import because it was only used in the type position
     * originally.
     *
     * To avoid this, the compiler must "touch" the imports with `ts.getMutableClone`, and should
     * only do this for imports which are actually consumed. The `DefaultImportTracker` keeps track of
     * these imports as they're encountered and emitted, and implements a transform which can correctly
     * flag the imports as required.
     *
     * This problem does not exist for non-default imports as the compiler can easily insert
     * "import * as X" style imports for those, and the "X" identifier survives transformation.
     */
    var DefaultImportTracker = /** @class */ (function () {
        function DefaultImportTracker() {
            /**
             * A `Map` which tracks the `Set` of `ts.ImportDeclaration`s for default imports that were used in
             * a given `ts.SourceFile` and need to be preserved.
             */
            this.sourceFileToUsedImports = new Map();
        }
        DefaultImportTracker.prototype.recordUsedImport = function (importDecl) {
            var sf = typescript_1.getSourceFile(importDecl);
            // Add the default import declaration to the set of used import declarations for the file.
            if (!this.sourceFileToUsedImports.has(sf)) {
                this.sourceFileToUsedImports.set(sf, new Set());
            }
            this.sourceFileToUsedImports.get(sf).add(importDecl);
        };
        /**
         * Get a `ts.TransformerFactory` which will preserve default imports that were previously marked
         * as used.
         *
         * This transformer must run after any other transformers which call `recordUsedImport`.
         */
        DefaultImportTracker.prototype.importPreservingTransformer = function () {
            var _this = this;
            return function (context) {
                return function (sf) {
                    return _this.transformSourceFile(sf);
                };
            };
        };
        /**
         * Process a `ts.SourceFile` and replace any `ts.ImportDeclaration`s.
         */
        DefaultImportTracker.prototype.transformSourceFile = function (sf) {
            var originalSf = ts.getOriginalNode(sf);
            // Take a fast path if no import declarations need to be preserved in the file.
            if (!this.sourceFileToUsedImports.has(originalSf)) {
                return sf;
            }
            // There are declarations that need to be preserved.
            var importsToPreserve = this.sourceFileToUsedImports.get(originalSf);
            // Generate a new statement list which preserves any imports present in `importsToPreserve`.
            var statements = sf.statements.map(function (stmt) {
                if (ts.isImportDeclaration(stmt) && importsToPreserve.has(stmt)) {
                    // Preserving an import that's marked as unreferenced (type-only) is tricky in TypeScript.
                    //
                    // Various approaches have been tried, with mixed success:
                    //
                    // 1. Using `ts.updateImportDeclaration` does not cause the import to be retained.
                    //
                    // 2. Using `ts.createImportDeclaration` with the same `ts.ImportClause` causes the import
                    //    to correctly be retained, but when emitting CommonJS module format code, references
                    //    to the imported value will not match the import variable.
                    //
                    // 3. Emitting "import * as" imports instead generates the correct import variable, but
                    //    references are missing the ".default" access. This happens to work for tsickle code
                    //    with goog.module transformations as tsickle strips the ".default" anyway.
                    //
                    // 4. It's possible to trick TypeScript by setting `ts.NodeFlag.Synthesized` on the import
                    //    declaration. This causes the import to be correctly retained and generated, but can
                    //    violate invariants elsewhere in the compiler and cause crashes.
                    //
                    // 5. Using `ts.getMutableClone` seems to correctly preserve the import and correctly
                    //    generate references to the import variable across all module types.
                    //
                    // Therefore, option 5 is the one used here. It seems to be implemented as the correct way
                    // to perform option 4, which preserves all the compiler's invariants.
                    //
                    // TODO(alxhub): discuss with the TypeScript team and determine if there's a better way to
                    // deal with this issue.
                    stmt = ts.getMutableClone(stmt);
                }
                return stmt;
            });
            // Save memory - there's no need to keep these around once the transform has run for the given
            // file.
            this.sourceFileToUsedImports.delete(originalSf);
            return ts.updateSourceFileNode(sf, statements);
        };
        return DefaultImportTracker;
    }());
    exports.DefaultImportTracker = DefaultImportTracker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvaW1wb3J0cy9zcmMvZGVmYXVsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQkFBaUM7SUFFakMsa0ZBQXdEO0lBRXhELElBQU0sd0JBQXdCLEdBQUcsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFNcEU7OztPQUdHO0lBQ0gsU0FBZ0IsOEJBQThCLENBQzFDLElBQThCLEVBQUUsVUFBZ0M7UUFDakUsSUFBcUMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNoRixDQUFDO0lBSEQsd0VBR0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxJQUE4Qjs7UUFFeEUsYUFBUSxJQUFxQyxDQUFDLHdCQUF3QixDQUFDLG1DQUFJLElBQUksQ0FBQztJQUNsRixDQUFDO0lBSEQsa0VBR0M7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E2Qkc7SUFDSDtRQUFBO1lBQ0U7OztlQUdHO1lBQ0ssNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQTRDLENBQUM7UUErRXhGLENBQUM7UUE3RUMsK0NBQWdCLEdBQWhCLFVBQWlCLFVBQWdDO1lBQy9DLElBQU0sRUFBRSxHQUFHLDBCQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFckMsMEZBQTBGO1lBQzFGLElBQUksQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBd0IsQ0FBQyxDQUFDO2FBQ3ZFO1lBQ0QsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUVEOzs7OztXQUtHO1FBQ0gsMERBQTJCLEdBQTNCO1lBQUEsaUJBTUM7WUFMQyxPQUFPLFVBQUMsT0FBaUM7Z0JBQ3ZDLE9BQU8sVUFBQyxFQUFpQjtvQkFDdkIsT0FBTyxLQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRDs7V0FFRztRQUNLLGtEQUFtQixHQUEzQixVQUE0QixFQUFpQjtZQUMzQyxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBa0IsQ0FBQztZQUMzRCwrRUFBK0U7WUFDL0UsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2pELE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFFRCxvREFBb0Q7WUFDcEQsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBRSxDQUFDO1lBRXhFLDRGQUE0RjtZQUM1RixJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7Z0JBQ3ZDLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDL0QsMEZBQTBGO29CQUMxRixFQUFFO29CQUNGLDBEQUEwRDtvQkFDMUQsRUFBRTtvQkFDRixrRkFBa0Y7b0JBQ2xGLEVBQUU7b0JBQ0YsMEZBQTBGO29CQUMxRix5RkFBeUY7b0JBQ3pGLCtEQUErRDtvQkFDL0QsRUFBRTtvQkFDRix1RkFBdUY7b0JBQ3ZGLHlGQUF5RjtvQkFDekYsK0VBQStFO29CQUMvRSxFQUFFO29CQUNGLDBGQUEwRjtvQkFDMUYseUZBQXlGO29CQUN6RixxRUFBcUU7b0JBQ3JFLEVBQUU7b0JBQ0YscUZBQXFGO29CQUNyRix5RUFBeUU7b0JBQ3pFLEVBQUU7b0JBQ0YsMEZBQTBGO29CQUMxRixzRUFBc0U7b0JBQ3RFLEVBQUU7b0JBQ0YsMEZBQTBGO29CQUMxRix3QkFBd0I7b0JBQ3hCLElBQUksR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQztnQkFDRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsOEZBQThGO1lBQzlGLFFBQVE7WUFDUixJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWhELE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBcEZELElBb0ZDO0lBcEZZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1dyYXBwZWROb2RlRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Z2V0U291cmNlRmlsZX0gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmNvbnN0IERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbiA9IFN5bWJvbCgnRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uJyk7XG5cbmludGVyZmFjZSBXaXRoRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uIHtcbiAgW0RlZmF1bHRJbXBvcnREZWNsYXJhdGlvbl0/OiB0cy5JbXBvcnREZWNsYXJhdGlvbjtcbn1cblxuLyoqXG4gKiBBdHRhY2hlcyBhIGRlZmF1bHQgaW1wb3J0IGRlY2xhcmF0aW9uIHRvIGBleHByYCB0byBpbmRpY2F0ZSB0aGUgZGVwZW5kZW5jeSBvZiBgZXhwcmAgb24gdGhlXG4gKiBkZWZhdWx0IGltcG9ydC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbihcbiAgICBleHByOiBXcmFwcGVkTm9kZUV4cHI8dW5rbm93bj4sIGltcG9ydERlY2w6IHRzLkltcG9ydERlY2xhcmF0aW9uKTogdm9pZCB7XG4gIChleHByIGFzIFdpdGhEZWZhdWx0SW1wb3J0RGVjbGFyYXRpb24pW0RlZmF1bHRJbXBvcnREZWNsYXJhdGlvbl0gPSBpbXBvcnREZWNsO1xufVxuXG4vKipcbiAqIE9idGFpbnMgdGhlIGRlZmF1bHQgaW1wb3J0IGRlY2xhcmF0aW9uIHRoYXQgYGV4cHJgIGRlcGVuZHMgb24sIG9yIGBudWxsYCBpZiB0aGVyZSBpcyBubyBzdWNoXG4gKiBkZXBlbmRlbmN5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEltcG9ydERlY2xhcmF0aW9uKGV4cHI6IFdyYXBwZWROb2RlRXhwcjx1bmtub3duPik6IHRzLkltcG9ydERlY2xhcmF0aW9ufFxuICAgIG51bGwge1xuICByZXR1cm4gKGV4cHIgYXMgV2l0aERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbilbRGVmYXVsdEltcG9ydERlY2xhcmF0aW9uXSA/PyBudWxsO1xufVxuXG4vKipcbiAqIFR5cGVTY3JpcHQgaGFzIHRyb3VibGUgd2l0aCBnZW5lcmF0aW5nIGRlZmF1bHQgaW1wb3J0cyBpbnNpZGUgb2YgdHJhbnNmb3JtZXJzIGZvciBzb21lIG1vZHVsZVxuICogZm9ybWF0cy4gVGhlIGlzc3VlIGlzIHRoYXQgZm9yIHRoZSBzdGF0ZW1lbnQ6XG4gKlxuICogaW1wb3J0IFggZnJvbSAnc29tZS9tb2R1bGUnO1xuICogY29uc29sZS5sb2coWCk7XG4gKlxuICogVHlwZVNjcmlwdCB3aWxsIG5vdCB1c2UgdGhlIFwiWFwiIG5hbWUgaW4gZ2VuZXJhdGVkIGNvZGUuIEZvciBub3JtYWwgdXNlciBjb2RlLCB0aGlzIGlzIGZpbmVcbiAqIGJlY2F1c2UgcmVmZXJlbmNlcyB0byBYIHdpbGwgYWxzbyBiZSByZW5hbWVkLiBIb3dldmVyLCBpZiBib3RoIHRoZSBpbXBvcnQgYW5kIGFueSByZWZlcmVuY2VzIGFyZVxuICogYWRkZWQgaW4gYSB0cmFuc2Zvcm1lciwgVHlwZVNjcmlwdCBkb2VzIG5vdCBhc3NvY2lhdGUgdGhlIHR3bywgYW5kIHdpbGwgbGVhdmUgdGhlIFwiWFwiIHJlZmVyZW5jZXNcbiAqIGRhbmdsaW5nIHdoaWxlIHJlbmFtaW5nIHRoZSBpbXBvcnQgdmFyaWFibGUuIFRoZSBnZW5lcmF0ZWQgY29kZSBsb29rcyBzb21ldGhpbmcgbGlrZTpcbiAqXG4gKiBjb25zdCBtb2R1bGVfMSA9IHJlcXVpcmUoJ3NvbWUvbW9kdWxlJyk7XG4gKiBjb25zb2xlLmxvZyhYKTsgLy8gbm93IFggaXMgYSBkYW5nbGluZyByZWZlcmVuY2UuXG4gKlxuICogVGhlcmVmb3JlLCB3ZSBjYW5ub3Qgc3ludGhldGljYWxseSBhZGQgZGVmYXVsdCBpbXBvcnRzLCBhbmQgbXVzdCByZXVzZSB0aGUgaW1wb3J0cyB0aGF0IHVzZXJzXG4gKiBpbmNsdWRlLiBEb2luZyB0aGlzIHBvc2VzIGEgY2hhbGxlbmdlIGZvciBpbXBvcnRzIHRoYXQgYXJlIG9ubHkgY29uc3VtZWQgaW4gdGhlIHR5cGUgcG9zaXRpb24gaW5cbiAqIHRoZSB1c2VyJ3MgY29kZS4gSWYgQW5ndWxhciByZXVzZXMgdGhlIGltcG9ydGVkIHN5bWJvbCBpbiBhIHZhbHVlIHBvc2l0aW9uIChmb3IgZXhhbXBsZSwgd2VcbiAqIHNlZSBhIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBvZiB0eXBlIEZvbyBhbmQgdHJ5IHRvIHdyaXRlIFwiaW5qZWN0KEZvbylcIikgd2Ugd2lsbCBhbHNvIGVuZCB1cCB3aXRoXG4gKiBhIGRhbmdsaW5nIHJlZmVyZW5jZSwgYXMgVFMgd2lsbCBlbGlkZSB0aGUgaW1wb3J0IGJlY2F1c2UgaXQgd2FzIG9ubHkgdXNlZCBpbiB0aGUgdHlwZSBwb3NpdGlvblxuICogb3JpZ2luYWxseS5cbiAqXG4gKiBUbyBhdm9pZCB0aGlzLCB0aGUgY29tcGlsZXIgbXVzdCBcInRvdWNoXCIgdGhlIGltcG9ydHMgd2l0aCBgdHMuZ2V0TXV0YWJsZUNsb25lYCwgYW5kIHNob3VsZFxuICogb25seSBkbyB0aGlzIGZvciBpbXBvcnRzIHdoaWNoIGFyZSBhY3R1YWxseSBjb25zdW1lZC4gVGhlIGBEZWZhdWx0SW1wb3J0VHJhY2tlcmAga2VlcHMgdHJhY2sgb2ZcbiAqIHRoZXNlIGltcG9ydHMgYXMgdGhleSdyZSBlbmNvdW50ZXJlZCBhbmQgZW1pdHRlZCwgYW5kIGltcGxlbWVudHMgYSB0cmFuc2Zvcm0gd2hpY2ggY2FuIGNvcnJlY3RseVxuICogZmxhZyB0aGUgaW1wb3J0cyBhcyByZXF1aXJlZC5cbiAqXG4gKiBUaGlzIHByb2JsZW0gZG9lcyBub3QgZXhpc3QgZm9yIG5vbi1kZWZhdWx0IGltcG9ydHMgYXMgdGhlIGNvbXBpbGVyIGNhbiBlYXNpbHkgaW5zZXJ0XG4gKiBcImltcG9ydCAqIGFzIFhcIiBzdHlsZSBpbXBvcnRzIGZvciB0aG9zZSwgYW5kIHRoZSBcIlhcIiBpZGVudGlmaWVyIHN1cnZpdmVzIHRyYW5zZm9ybWF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEltcG9ydFRyYWNrZXIge1xuICAvKipcbiAgICogQSBgTWFwYCB3aGljaCB0cmFja3MgdGhlIGBTZXRgIG9mIGB0cy5JbXBvcnREZWNsYXJhdGlvbmBzIGZvciBkZWZhdWx0IGltcG9ydHMgdGhhdCB3ZXJlIHVzZWQgaW5cbiAgICogYSBnaXZlbiBgdHMuU291cmNlRmlsZWAgYW5kIG5lZWQgdG8gYmUgcHJlc2VydmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBzb3VyY2VGaWxlVG9Vc2VkSW1wb3J0cyA9IG5ldyBNYXA8dHMuU291cmNlRmlsZSwgU2V0PHRzLkltcG9ydERlY2xhcmF0aW9uPj4oKTtcblxuICByZWNvcmRVc2VkSW1wb3J0KGltcG9ydERlY2w6IHRzLkltcG9ydERlY2xhcmF0aW9uKTogdm9pZCB7XG4gICAgY29uc3Qgc2YgPSBnZXRTb3VyY2VGaWxlKGltcG9ydERlY2wpO1xuXG4gICAgLy8gQWRkIHRoZSBkZWZhdWx0IGltcG9ydCBkZWNsYXJhdGlvbiB0byB0aGUgc2V0IG9mIHVzZWQgaW1wb3J0IGRlY2xhcmF0aW9ucyBmb3IgdGhlIGZpbGUuXG4gICAgaWYgKCF0aGlzLnNvdXJjZUZpbGVUb1VzZWRJbXBvcnRzLmhhcyhzZikpIHtcbiAgICAgIHRoaXMuc291cmNlRmlsZVRvVXNlZEltcG9ydHMuc2V0KHNmLCBuZXcgU2V0PHRzLkltcG9ydERlY2xhcmF0aW9uPigpKTtcbiAgICB9XG4gICAgdGhpcy5zb3VyY2VGaWxlVG9Vc2VkSW1wb3J0cy5nZXQoc2YpIS5hZGQoaW1wb3J0RGVjbCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgYHRzLlRyYW5zZm9ybWVyRmFjdG9yeWAgd2hpY2ggd2lsbCBwcmVzZXJ2ZSBkZWZhdWx0IGltcG9ydHMgdGhhdCB3ZXJlIHByZXZpb3VzbHkgbWFya2VkXG4gICAqIGFzIHVzZWQuXG4gICAqXG4gICAqIFRoaXMgdHJhbnNmb3JtZXIgbXVzdCBydW4gYWZ0ZXIgYW55IG90aGVyIHRyYW5zZm9ybWVycyB3aGljaCBjYWxsIGByZWNvcmRVc2VkSW1wb3J0YC5cbiAgICovXG4gIGltcG9ydFByZXNlcnZpbmdUcmFuc2Zvcm1lcigpOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICAgIHJldHVybiAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB7XG4gICAgICByZXR1cm4gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybVNvdXJjZUZpbGUoc2YpO1xuICAgICAgfTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgYSBgdHMuU291cmNlRmlsZWAgYW5kIHJlcGxhY2UgYW55IGB0cy5JbXBvcnREZWNsYXJhdGlvbmBzLlxuICAgKi9cbiAgcHJpdmF0ZSB0cmFuc2Zvcm1Tb3VyY2VGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSB7XG4gICAgY29uc3Qgb3JpZ2luYWxTZiA9IHRzLmdldE9yaWdpbmFsTm9kZShzZikgYXMgdHMuU291cmNlRmlsZTtcbiAgICAvLyBUYWtlIGEgZmFzdCBwYXRoIGlmIG5vIGltcG9ydCBkZWNsYXJhdGlvbnMgbmVlZCB0byBiZSBwcmVzZXJ2ZWQgaW4gdGhlIGZpbGUuXG4gICAgaWYgKCF0aGlzLnNvdXJjZUZpbGVUb1VzZWRJbXBvcnRzLmhhcyhvcmlnaW5hbFNmKSkge1xuICAgICAgcmV0dXJuIHNmO1xuICAgIH1cblxuICAgIC8vIFRoZXJlIGFyZSBkZWNsYXJhdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHByZXNlcnZlZC5cbiAgICBjb25zdCBpbXBvcnRzVG9QcmVzZXJ2ZSA9IHRoaXMuc291cmNlRmlsZVRvVXNlZEltcG9ydHMuZ2V0KG9yaWdpbmFsU2YpITtcblxuICAgIC8vIEdlbmVyYXRlIGEgbmV3IHN0YXRlbWVudCBsaXN0IHdoaWNoIHByZXNlcnZlcyBhbnkgaW1wb3J0cyBwcmVzZW50IGluIGBpbXBvcnRzVG9QcmVzZXJ2ZWAuXG4gICAgY29uc3Qgc3RhdGVtZW50cyA9IHNmLnN0YXRlbWVudHMubWFwKHN0bXQgPT4ge1xuICAgICAgaWYgKHRzLmlzSW1wb3J0RGVjbGFyYXRpb24oc3RtdCkgJiYgaW1wb3J0c1RvUHJlc2VydmUuaGFzKHN0bXQpKSB7XG4gICAgICAgIC8vIFByZXNlcnZpbmcgYW4gaW1wb3J0IHRoYXQncyBtYXJrZWQgYXMgdW5yZWZlcmVuY2VkICh0eXBlLW9ubHkpIGlzIHRyaWNreSBpbiBUeXBlU2NyaXB0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBWYXJpb3VzIGFwcHJvYWNoZXMgaGF2ZSBiZWVuIHRyaWVkLCB3aXRoIG1peGVkIHN1Y2Nlc3M6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIDEuIFVzaW5nIGB0cy51cGRhdGVJbXBvcnREZWNsYXJhdGlvbmAgZG9lcyBub3QgY2F1c2UgdGhlIGltcG9ydCB0byBiZSByZXRhaW5lZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gMi4gVXNpbmcgYHRzLmNyZWF0ZUltcG9ydERlY2xhcmF0aW9uYCB3aXRoIHRoZSBzYW1lIGB0cy5JbXBvcnRDbGF1c2VgIGNhdXNlcyB0aGUgaW1wb3J0XG4gICAgICAgIC8vICAgIHRvIGNvcnJlY3RseSBiZSByZXRhaW5lZCwgYnV0IHdoZW4gZW1pdHRpbmcgQ29tbW9uSlMgbW9kdWxlIGZvcm1hdCBjb2RlLCByZWZlcmVuY2VzXG4gICAgICAgIC8vICAgIHRvIHRoZSBpbXBvcnRlZCB2YWx1ZSB3aWxsIG5vdCBtYXRjaCB0aGUgaW1wb3J0IHZhcmlhYmxlLlxuICAgICAgICAvL1xuICAgICAgICAvLyAzLiBFbWl0dGluZyBcImltcG9ydCAqIGFzXCIgaW1wb3J0cyBpbnN0ZWFkIGdlbmVyYXRlcyB0aGUgY29ycmVjdCBpbXBvcnQgdmFyaWFibGUsIGJ1dFxuICAgICAgICAvLyAgICByZWZlcmVuY2VzIGFyZSBtaXNzaW5nIHRoZSBcIi5kZWZhdWx0XCIgYWNjZXNzLiBUaGlzIGhhcHBlbnMgdG8gd29yayBmb3IgdHNpY2tsZSBjb2RlXG4gICAgICAgIC8vICAgIHdpdGggZ29vZy5tb2R1bGUgdHJhbnNmb3JtYXRpb25zIGFzIHRzaWNrbGUgc3RyaXBzIHRoZSBcIi5kZWZhdWx0XCIgYW55d2F5LlxuICAgICAgICAvL1xuICAgICAgICAvLyA0LiBJdCdzIHBvc3NpYmxlIHRvIHRyaWNrIFR5cGVTY3JpcHQgYnkgc2V0dGluZyBgdHMuTm9kZUZsYWcuU3ludGhlc2l6ZWRgIG9uIHRoZSBpbXBvcnRcbiAgICAgICAgLy8gICAgZGVjbGFyYXRpb24uIFRoaXMgY2F1c2VzIHRoZSBpbXBvcnQgdG8gYmUgY29ycmVjdGx5IHJldGFpbmVkIGFuZCBnZW5lcmF0ZWQsIGJ1dCBjYW5cbiAgICAgICAgLy8gICAgdmlvbGF0ZSBpbnZhcmlhbnRzIGVsc2V3aGVyZSBpbiB0aGUgY29tcGlsZXIgYW5kIGNhdXNlIGNyYXNoZXMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIDUuIFVzaW5nIGB0cy5nZXRNdXRhYmxlQ2xvbmVgIHNlZW1zIHRvIGNvcnJlY3RseSBwcmVzZXJ2ZSB0aGUgaW1wb3J0IGFuZCBjb3JyZWN0bHlcbiAgICAgICAgLy8gICAgZ2VuZXJhdGUgcmVmZXJlbmNlcyB0byB0aGUgaW1wb3J0IHZhcmlhYmxlIGFjcm9zcyBhbGwgbW9kdWxlIHR5cGVzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZWZvcmUsIG9wdGlvbiA1IGlzIHRoZSBvbmUgdXNlZCBoZXJlLiBJdCBzZWVtcyB0byBiZSBpbXBsZW1lbnRlZCBhcyB0aGUgY29ycmVjdCB3YXlcbiAgICAgICAgLy8gdG8gcGVyZm9ybSBvcHRpb24gNCwgd2hpY2ggcHJlc2VydmVzIGFsbCB0aGUgY29tcGlsZXIncyBpbnZhcmlhbnRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUT0RPKGFseGh1Yik6IGRpc2N1c3Mgd2l0aCB0aGUgVHlwZVNjcmlwdCB0ZWFtIGFuZCBkZXRlcm1pbmUgaWYgdGhlcmUncyBhIGJldHRlciB3YXkgdG9cbiAgICAgICAgLy8gZGVhbCB3aXRoIHRoaXMgaXNzdWUuXG4gICAgICAgIHN0bXQgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoc3RtdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RtdDtcbiAgICB9KTtcblxuICAgIC8vIFNhdmUgbWVtb3J5IC0gdGhlcmUncyBubyBuZWVkIHRvIGtlZXAgdGhlc2UgYXJvdW5kIG9uY2UgdGhlIHRyYW5zZm9ybSBoYXMgcnVuIGZvciB0aGUgZ2l2ZW5cbiAgICAvLyBmaWxlLlxuICAgIHRoaXMuc291cmNlRmlsZVRvVXNlZEltcG9ydHMuZGVsZXRlKG9yaWdpbmFsU2YpO1xuXG4gICAgcmV0dXJuIHRzLnVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNmLCBzdGF0ZW1lbnRzKTtcbiAgfVxufVxuIl19