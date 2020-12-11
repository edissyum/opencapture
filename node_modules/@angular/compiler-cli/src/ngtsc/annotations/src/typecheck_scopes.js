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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/typecheck_scopes", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/metadata"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeCheckScopes = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    /**
     * Computes scope information to be used in template type checking.
     */
    var TypeCheckScopes = /** @class */ (function () {
        function TypeCheckScopes(scopeReader, metaReader) {
            this.scopeReader = scopeReader;
            this.metaReader = metaReader;
            /**
             * Cache of flattened directive metadata. Because flattened metadata is scope-invariant it's
             * cached individually, such that all scopes refer to the same flattened metadata.
             */
            this.flattenedDirectiveMetaCache = new Map();
            /**
             * Cache of the computed type check scope per NgModule declaration.
             */
            this.scopeCache = new Map();
        }
        /**
         * Computes the type-check scope information for the component declaration. If the NgModule
         * contains an error, then 'error' is returned. If the component is not declared in any NgModule,
         * an empty type-check scope is returned.
         */
        TypeCheckScopes.prototype.getTypeCheckScope = function (node) {
            var e_1, _a, e_2, _b;
            var matcher = new compiler_1.SelectorMatcher();
            var pipes = new Map();
            var scope = this.scopeReader.getScopeForComponent(node);
            if (scope === null) {
                return {
                    matcher: matcher,
                    pipes: pipes,
                    schemas: [],
                    isPoisoned: false,
                };
            }
            if (this.scopeCache.has(scope.ngModule)) {
                return this.scopeCache.get(scope.ngModule);
            }
            try {
                for (var _c = tslib_1.__values(scope.compilation.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var meta = _d.value;
                    if (meta.selector !== null) {
                        var extMeta = this.getInheritedDirectiveMetadata(meta.ref);
                        matcher.addSelectables(compiler_1.CssSelector.parse(meta.selector), extMeta);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _e = tslib_1.__values(scope.compilation.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var _g = _f.value, name_1 = _g.name, ref = _g.ref;
                    if (!ts.isClassDeclaration(ref.node)) {
                        throw new Error("Unexpected non-class declaration " + ts.SyntaxKind[ref.node.kind] + " for pipe " + ref.debugName);
                    }
                    pipes.set(name_1, ref);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var typeCheckScope = {
                matcher: matcher,
                pipes: pipes,
                schemas: scope.schemas,
                isPoisoned: scope.compilation.isPoisoned || scope.exported.isPoisoned,
            };
            this.scopeCache.set(scope.ngModule, typeCheckScope);
            return typeCheckScope;
        };
        TypeCheckScopes.prototype.getInheritedDirectiveMetadata = function (ref) {
            var clazz = ref.node;
            if (this.flattenedDirectiveMetaCache.has(clazz)) {
                return this.flattenedDirectiveMetaCache.get(clazz);
            }
            var meta = metadata_1.flattenInheritedDirectiveMetadata(this.metaReader, ref);
            this.flattenedDirectiveMetaCache.set(clazz, meta);
            return meta;
        };
        return TypeCheckScopes;
    }());
    exports.TypeCheckScopes = TypeCheckScopes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZWNoZWNrX3Njb3Blcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3R5cGVjaGVja19zY29wZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUErRTtJQUMvRSwrQkFBaUM7SUFHakMscUVBQWdHO0lBK0JoRzs7T0FFRztJQUNIO1FBWUUseUJBQW9CLFdBQWlDLEVBQVUsVUFBMEI7WUFBckUsZ0JBQVcsR0FBWCxXQUFXLENBQXNCO1lBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7WUFYekY7OztlQUdHO1lBQ0ssZ0NBQTJCLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7WUFFakY7O2VBRUc7WUFDSyxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQW9DLENBQUM7UUFFMkIsQ0FBQztRQUU3Rjs7OztXQUlHO1FBQ0gsMkNBQWlCLEdBQWpCLFVBQWtCLElBQXNCOztZQUN0QyxJQUFNLE9BQU8sR0FBRyxJQUFJLDBCQUFlLEVBQWlCLENBQUM7WUFDckQsSUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQTRELENBQUM7WUFFbEYsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU87b0JBQ0wsT0FBTyxTQUFBO29CQUNQLEtBQUssT0FBQTtvQkFDTCxPQUFPLEVBQUUsRUFBRTtvQkFDWCxVQUFVLEVBQUUsS0FBSztpQkFDbEIsQ0FBQzthQUNIO1lBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3ZDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBRSxDQUFDO2FBQzdDOztnQkFFRCxLQUFtQixJQUFBLEtBQUEsaUJBQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQTVDLElBQU0sSUFBSSxXQUFBO29CQUNiLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7d0JBQzFCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzdELE9BQU8sQ0FBQyxjQUFjLENBQUMsc0JBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNuRTtpQkFDRjs7Ozs7Ozs7OztnQkFFRCxLQUEwQixJQUFBLEtBQUEsaUJBQUEsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUEsZ0JBQUEsNEJBQUU7b0JBQXhDLElBQUEsYUFBVyxFQUFWLE1BQUksVUFBQSxFQUFFLEdBQUcsU0FBQTtvQkFDbkIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQ1osRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBYSxHQUFHLENBQUMsU0FBVyxDQUFDLENBQUM7cUJBQy9EO29CQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBSSxFQUFFLEdBQXVELENBQUMsQ0FBQztpQkFDMUU7Ozs7Ozs7OztZQUVELElBQU0sY0FBYyxHQUFtQjtnQkFDckMsT0FBTyxTQUFBO2dCQUNQLEtBQUssT0FBQTtnQkFDTCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLFVBQVUsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVU7YUFDdEUsQ0FBQztZQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDcEQsT0FBTyxjQUFjLENBQUM7UUFDeEIsQ0FBQztRQUVPLHVEQUE2QixHQUFyQyxVQUFzQyxHQUFnQztZQUNwRSxJQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUksSUFBSSxDQUFDLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDL0MsT0FBTyxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxDQUFDO2FBQ3JEO1lBRUQsSUFBTSxJQUFJLEdBQUcsNENBQWlDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUF4RUQsSUF3RUM7SUF4RVksMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDc3NTZWxlY3RvciwgU2NoZW1hTWV0YWRhdGEsIFNlbGVjdG9yTWF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YSwgZmxhdHRlbkluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhLCBNZXRhZGF0YVJlYWRlcn0gZnJvbSAnLi4vLi4vbWV0YWRhdGEnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7Q29tcG9uZW50U2NvcGVSZWFkZXJ9IGZyb20gJy4uLy4uL3Njb3BlJztcblxuLyoqXG4gKiBUaGUgc2NvcGUgdGhhdCBpcyB1c2VkIGZvciB0eXBlLWNoZWNrIGNvZGUgZ2VuZXJhdGlvbiBvZiBhIGNvbXBvbmVudCB0ZW1wbGF0ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUeXBlQ2hlY2tTY29wZSB7XG4gIC8qKlxuICAgKiBBIGBTZWxlY3Rvck1hdGNoZXJgIGluc3RhbmNlIHRoYXQgY29udGFpbnMgdGhlIGZsYXR0ZW5lZCBkaXJlY3RpdmUgbWV0YWRhdGEgb2YgYWxsIGRpcmVjdGl2ZXNcbiAgICogdGhhdCBhcmUgaW4gdGhlIGNvbXBpbGF0aW9uIHNjb3BlIG9mIHRoZSBkZWNsYXJpbmcgTmdNb2R1bGUuXG4gICAqL1xuICBtYXRjaGVyOiBTZWxlY3Rvck1hdGNoZXI8RGlyZWN0aXZlTWV0YT47XG5cbiAgLyoqXG4gICAqIFRoZSBwaXBlcyB0aGF0IGFyZSBhdmFpbGFibGUgaW4gdGhlIGNvbXBpbGF0aW9uIHNjb3BlLlxuICAgKi9cbiAgcGlwZXM6IE1hcDxzdHJpbmcsIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+Pj47XG5cbiAgLyoqXG4gICAqIFRoZSBzY2hlbWFzIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBzY29wZS5cbiAgICovXG4gIHNjaGVtYXM6IFNjaGVtYU1ldGFkYXRhW107XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIG9yaWdpbmFsIGNvbXBpbGF0aW9uIHNjb3BlIHdoaWNoIHByb2R1Y2VkIHRoaXMgYFR5cGVDaGVja1Njb3BlYCB3YXMgaXRzZWxmIHBvaXNvbmVkXG4gICAqIChjb250YWluZWQgc2VtYW50aWMgZXJyb3JzIGR1cmluZyBpdHMgcHJvZHVjdGlvbikuXG4gICAqL1xuICBpc1BvaXNvbmVkOiBib29sZWFuO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHNjb3BlIGluZm9ybWF0aW9uIHRvIGJlIHVzZWQgaW4gdGVtcGxhdGUgdHlwZSBjaGVja2luZy5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVDaGVja1Njb3BlcyB7XG4gIC8qKlxuICAgKiBDYWNoZSBvZiBmbGF0dGVuZWQgZGlyZWN0aXZlIG1ldGFkYXRhLiBCZWNhdXNlIGZsYXR0ZW5lZCBtZXRhZGF0YSBpcyBzY29wZS1pbnZhcmlhbnQgaXQnc1xuICAgKiBjYWNoZWQgaW5kaXZpZHVhbGx5LCBzdWNoIHRoYXQgYWxsIHNjb3BlcyByZWZlciB0byB0aGUgc2FtZSBmbGF0dGVuZWQgbWV0YWRhdGEuXG4gICAqL1xuICBwcml2YXRlIGZsYXR0ZW5lZERpcmVjdGl2ZU1ldGFDYWNoZSA9IG5ldyBNYXA8Q2xhc3NEZWNsYXJhdGlvbiwgRGlyZWN0aXZlTWV0YT4oKTtcblxuICAvKipcbiAgICogQ2FjaGUgb2YgdGhlIGNvbXB1dGVkIHR5cGUgY2hlY2sgc2NvcGUgcGVyIE5nTW9kdWxlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBzY29wZUNhY2hlID0gbmV3IE1hcDxDbGFzc0RlY2xhcmF0aW9uLCBUeXBlQ2hlY2tTY29wZT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNjb3BlUmVhZGVyOiBDb21wb25lbnRTY29wZVJlYWRlciwgcHJpdmF0ZSBtZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlcikge31cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIHR5cGUtY2hlY2sgc2NvcGUgaW5mb3JtYXRpb24gZm9yIHRoZSBjb21wb25lbnQgZGVjbGFyYXRpb24uIElmIHRoZSBOZ01vZHVsZVxuICAgKiBjb250YWlucyBhbiBlcnJvciwgdGhlbiAnZXJyb3InIGlzIHJldHVybmVkLiBJZiB0aGUgY29tcG9uZW50IGlzIG5vdCBkZWNsYXJlZCBpbiBhbnkgTmdNb2R1bGUsXG4gICAqIGFuIGVtcHR5IHR5cGUtY2hlY2sgc2NvcGUgaXMgcmV0dXJuZWQuXG4gICAqL1xuICBnZXRUeXBlQ2hlY2tTY29wZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogVHlwZUNoZWNrU2NvcGUge1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZU1ldGE+KCk7XG4gICAgY29uc3QgcGlwZXMgPSBuZXcgTWFwPHN0cmluZywgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+PigpO1xuXG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLnNjb3BlUmVhZGVyLmdldFNjb3BlRm9yQ29tcG9uZW50KG5vZGUpO1xuICAgIGlmIChzY29wZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbWF0Y2hlcixcbiAgICAgICAgcGlwZXMsXG4gICAgICAgIHNjaGVtYXM6IFtdLFxuICAgICAgICBpc1BvaXNvbmVkOiBmYWxzZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2NvcGVDYWNoZS5oYXMoc2NvcGUubmdNb2R1bGUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY29wZUNhY2hlLmdldChzY29wZS5uZ01vZHVsZSkhO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgbWV0YSBvZiBzY29wZS5jb21waWxhdGlvbi5kaXJlY3RpdmVzKSB7XG4gICAgICBpZiAobWV0YS5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBleHRNZXRhID0gdGhpcy5nZXRJbmhlcml0ZWREaXJlY3RpdmVNZXRhZGF0YShtZXRhLnJlZik7XG4gICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UobWV0YS5zZWxlY3RvciksIGV4dE1ldGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qge25hbWUsIHJlZn0gb2Ygc2NvcGUuY29tcGlsYXRpb24ucGlwZXMpIHtcbiAgICAgIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHJlZi5ub2RlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgbm9uLWNsYXNzIGRlY2xhcmF0aW9uICR7XG4gICAgICAgICAgICB0cy5TeW50YXhLaW5kW3JlZi5ub2RlLmtpbmRdfSBmb3IgcGlwZSAke3JlZi5kZWJ1Z05hbWV9YCk7XG4gICAgICB9XG4gICAgICBwaXBlcy5zZXQobmFtZSwgcmVmIGFzIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+Pik7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZUNoZWNrU2NvcGU6IFR5cGVDaGVja1Njb3BlID0ge1xuICAgICAgbWF0Y2hlcixcbiAgICAgIHBpcGVzLFxuICAgICAgc2NoZW1hczogc2NvcGUuc2NoZW1hcyxcbiAgICAgIGlzUG9pc29uZWQ6IHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQgfHwgc2NvcGUuZXhwb3J0ZWQuaXNQb2lzb25lZCxcbiAgICB9O1xuICAgIHRoaXMuc2NvcGVDYWNoZS5zZXQoc2NvcGUubmdNb2R1bGUsIHR5cGVDaGVja1Njb3BlKTtcbiAgICByZXR1cm4gdHlwZUNoZWNrU2NvcGU7XG4gIH1cblxuICBwcml2YXRlIGdldEluaGVyaXRlZERpcmVjdGl2ZU1ldGFkYXRhKHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+KTogRGlyZWN0aXZlTWV0YSB7XG4gICAgY29uc3QgY2xhenogPSByZWYubm9kZTtcbiAgICBpZiAodGhpcy5mbGF0dGVuZWREaXJlY3RpdmVNZXRhQ2FjaGUuaGFzKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZmxhdHRlbmVkRGlyZWN0aXZlTWV0YUNhY2hlLmdldChjbGF6eikhO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGEgPSBmbGF0dGVuSW5oZXJpdGVkRGlyZWN0aXZlTWV0YWRhdGEodGhpcy5tZXRhUmVhZGVyLCByZWYpO1xuICAgIHRoaXMuZmxhdHRlbmVkRGlyZWN0aXZlTWV0YUNhY2hlLnNldChjbGF6eiwgbWV0YSk7XG4gICAgcmV0dXJuIG1ldGE7XG4gIH1cbn1cbiJdfQ==