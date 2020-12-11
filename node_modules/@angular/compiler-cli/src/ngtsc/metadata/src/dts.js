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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/dts", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping", "@angular/compiler-cli/src/ngtsc/metadata/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DtsMetadataReader = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var property_mapping_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/property_mapping");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    /**
     * A `MetadataReader` that can read metadata from `.d.ts` files, which have static Ivy properties
     * from an upstream compilation already.
     */
    var DtsMetadataReader = /** @class */ (function () {
        function DtsMetadataReader(checker, reflector) {
            this.checker = checker;
            this.reflector = reflector;
        }
        /**
         * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
         * file, or in a .ts file with a handwritten definition).
         *
         * @param ref `Reference` to the class of interest, with the context of how it was obtained.
         */
        DtsMetadataReader.prototype.getNgModuleMetadata = function (ref) {
            var clazz = ref.node;
            var resolutionContext = clazz.getSourceFile().fileName;
            // This operation is explicitly not memoized, as it depends on `ref.ownedByModuleGuess`.
            // TODO(alxhub): investigate caching of .d.ts module metadata.
            var ngModuleDef = this.reflector.getMembersOfClass(clazz).find(function (member) { return member.name === 'ɵmod' && member.isStatic; });
            if (ngModuleDef === undefined) {
                return null;
            }
            else if (
            // Validate that the shape of the ngModuleDef type is correct.
            ngModuleDef.type === null || !ts.isTypeReferenceNode(ngModuleDef.type) ||
                ngModuleDef.type.typeArguments === undefined ||
                ngModuleDef.type.typeArguments.length !== 4) {
                return null;
            }
            // Read the ModuleData out of the type arguments.
            var _a = tslib_1.__read(ngModuleDef.type.typeArguments, 4), _ = _a[0], declarationMetadata = _a[1], importMetadata = _a[2], exportMetadata = _a[3];
            return {
                ref: ref,
                declarations: util_1.extractReferencesFromType(this.checker, declarationMetadata, ref.ownedByModuleGuess, resolutionContext),
                exports: util_1.extractReferencesFromType(this.checker, exportMetadata, ref.ownedByModuleGuess, resolutionContext),
                imports: util_1.extractReferencesFromType(this.checker, importMetadata, ref.ownedByModuleGuess, resolutionContext),
                schemas: [],
                rawDeclarations: null,
            };
        };
        /**
         * Read directive (or component) metadata from a referenced class in a .d.ts file.
         */
        DtsMetadataReader.prototype.getDirectiveMetadata = function (ref) {
            var clazz = ref.node;
            var def = this.reflector.getMembersOfClass(clazz).find(function (field) { return field.isStatic && (field.name === 'ɵcmp' || field.name === 'ɵdir'); });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var inputs = property_mapping_1.ClassPropertyMapping.fromMappedObject(util_1.readStringMapType(def.type.typeArguments[3]));
            var outputs = property_mapping_1.ClassPropertyMapping.fromMappedObject(util_1.readStringMapType(def.type.typeArguments[4]));
            return tslib_1.__assign(tslib_1.__assign({ ref: ref, name: clazz.name.text, isComponent: def.name === 'ɵcmp', selector: util_1.readStringType(def.type.typeArguments[1]), exportAs: util_1.readStringArrayType(def.type.typeArguments[2]), inputs: inputs,
                outputs: outputs, queries: util_1.readStringArrayType(def.type.typeArguments[5]) }, util_1.extractDirectiveTypeCheckMeta(clazz, inputs, this.reflector)), { baseClass: readBaseClass(clazz, this.checker, this.reflector), isPoisoned: false });
        };
        /**
         * Read pipe metadata from a referenced class in a .d.ts file.
         */
        DtsMetadataReader.prototype.getPipeMetadata = function (ref) {
            var def = this.reflector.getMembersOfClass(ref.node).find(function (field) { return field.isStatic && field.name === 'ɵpipe'; });
            if (def === undefined) {
                // No definition could be found.
                return null;
            }
            else if (def.type === null || !ts.isTypeReferenceNode(def.type) ||
                def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
                // The type metadata was the wrong shape.
                return null;
            }
            var type = def.type.typeArguments[1];
            if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
                // The type metadata was the wrong type.
                return null;
            }
            var name = type.literal.text;
            return { ref: ref, name: name };
        };
        return DtsMetadataReader;
    }());
    exports.DtsMetadataReader = DtsMetadataReader;
    function readBaseClass(clazz, checker, reflector) {
        var e_1, _a;
        if (!reflection_1.isNamedClassDeclaration(clazz)) {
            // Technically this is an error in a .d.ts file, but for the purposes of finding the base class
            // it's ignored.
            return reflector.hasBaseClass(clazz) ? 'dynamic' : null;
        }
        if (clazz.heritageClauses !== undefined) {
            try {
                for (var _b = tslib_1.__values(clazz.heritageClauses), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var clause = _c.value;
                    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                        var baseExpr = clause.types[0].expression;
                        var symbol = checker.getSymbolAtLocation(baseExpr);
                        if (symbol === undefined) {
                            return 'dynamic';
                        }
                        else if (symbol.flags & ts.SymbolFlags.Alias) {
                            symbol = checker.getAliasedSymbol(symbol);
                        }
                        if (symbol.valueDeclaration !== undefined &&
                            reflection_1.isNamedClassDeclaration(symbol.valueDeclaration)) {
                            return new imports_1.Reference(symbol.valueDeclaration);
                        }
                        else {
                            return 'dynamic';
                        }
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
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9tZXRhZGF0YS9zcmMvZHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsbUVBQXdDO0lBQ3hDLHlFQUEyRjtJQUczRixrR0FBd0Q7SUFDeEQsMEVBQXdJO0lBRXhJOzs7T0FHRztJQUNIO1FBQ0UsMkJBQW9CLE9BQXVCLEVBQVUsU0FBeUI7WUFBMUQsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtRQUFHLENBQUM7UUFFbEY7Ozs7O1dBS0c7UUFDSCwrQ0FBbUIsR0FBbkIsVUFBb0IsR0FBZ0M7WUFDbEQsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztZQUN2QixJQUFNLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDekQsd0ZBQXdGO1lBQ3hGLDhEQUE4RDtZQUM5RCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FDNUQsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7WUFDekQsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO2lCQUFNO1lBQ0gsOERBQThEO1lBQzlELFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RFLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVM7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T0FBTyxJQUFJLG1CQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7eUJBQy9DOzZCQUFNOzRCQUNMLE9BQU8sU0FBUyxDQUFDO3lCQUNsQjtxQkFDRjtpQkFDRjs7Ozs7Ozs7O1NBQ0Y7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgaXNOYW1lZENsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBNZXRhZGF0YVJlYWRlciwgTmdNb2R1bGVNZXRhLCBQaXBlTWV0YX0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtDbGFzc1Byb3BlcnR5TWFwcGluZ30gZnJvbSAnLi9wcm9wZXJ0eV9tYXBwaW5nJztcbmltcG9ydCB7ZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIGV4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUsIHJlYWRTdHJpbmdBcnJheVR5cGUsIHJlYWRTdHJpbmdNYXBUeXBlLCByZWFkU3RyaW5nVHlwZX0gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBBIGBNZXRhZGF0YVJlYWRlcmAgdGhhdCBjYW4gcmVhZCBtZXRhZGF0YSBmcm9tIGAuZC50c2AgZmlsZXMsIHdoaWNoIGhhdmUgc3RhdGljIEl2eSBwcm9wZXJ0aWVzXG4gKiBmcm9tIGFuIHVwc3RyZWFtIGNvbXBpbGF0aW9uIGFscmVhZHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBEdHNNZXRhZGF0YVJlYWRlciBpbXBsZW1lbnRzIE1ldGFkYXRhUmVhZGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KSB7fVxuXG4gIC8qKlxuICAgKiBSZWFkIHRoZSBtZXRhZGF0YSBmcm9tIGEgY2xhc3MgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNvbXBpbGVkIHNvbWVob3cgKGVpdGhlciBpdCdzIGluIGEgLmQudHNcbiAgICogZmlsZSwgb3IgaW4gYSAudHMgZmlsZSB3aXRoIGEgaGFuZHdyaXR0ZW4gZGVmaW5pdGlvbikuXG4gICAqXG4gICAqIEBwYXJhbSByZWYgYFJlZmVyZW5jZWAgdG8gdGhlIGNsYXNzIG9mIGludGVyZXN0LCB3aXRoIHRoZSBjb250ZXh0IG9mIGhvdyBpdCB3YXMgb2J0YWluZWQuXG4gICAqL1xuICBnZXROZ01vZHVsZU1ldGFkYXRhKHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+KTogTmdNb2R1bGVNZXRhfG51bGwge1xuICAgIGNvbnN0IGNsYXp6ID0gcmVmLm5vZGU7XG4gICAgY29uc3QgcmVzb2x1dGlvbkNvbnRleHQgPSBjbGF6ei5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG4gICAgLy8gVGhpcyBvcGVyYXRpb24gaXMgZXhwbGljaXRseSBub3QgbWVtb2l6ZWQsIGFzIGl0IGRlcGVuZHMgb24gYHJlZi5vd25lZEJ5TW9kdWxlR3Vlc3NgLlxuICAgIC8vIFRPRE8oYWx4aHViKTogaW52ZXN0aWdhdGUgY2FjaGluZyBvZiAuZC50cyBtb2R1bGUgbWV0YWRhdGEuXG4gICAgY29uc3QgbmdNb2R1bGVEZWYgPSB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhjbGF6eikuZmluZChcbiAgICAgICAgbWVtYmVyID0+IG1lbWJlci5uYW1lID09PSAnybVtb2QnICYmIG1lbWJlci5pc1N0YXRpYyk7XG4gICAgaWYgKG5nTW9kdWxlRGVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgdGhlIHNoYXBlIG9mIHRoZSBuZ01vZHVsZURlZiB0eXBlIGlzIGNvcnJlY3QuXG4gICAgICAgIG5nTW9kdWxlRGVmLnR5cGUgPT09IG51bGwgfHwgIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUobmdNb2R1bGVEZWYudHlwZSkgfHxcbiAgICAgICAgbmdNb2R1bGVEZWYudHlwZS50eXBlQXJndW1lbnRzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgbmdNb2R1bGVEZWYudHlwZS50eXBlQXJndW1lbnRzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVhZCB0aGUgTW9kdWxlRGF0YSBvdXQgb2YgdGhlIHR5cGUgYXJndW1lbnRzLlxuICAgIGNvbnN0IFtfLCBkZWNsYXJhdGlvbk1ldGFkYXRhLCBpbXBvcnRNZXRhZGF0YSwgZXhwb3J0TWV0YWRhdGFdID0gbmdNb2R1bGVEZWYudHlwZS50eXBlQXJndW1lbnRzO1xuICAgIHJldHVybiB7XG4gICAgICByZWYsXG4gICAgICBkZWNsYXJhdGlvbnM6IGV4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoXG4gICAgICAgICAgdGhpcy5jaGVja2VyLCBkZWNsYXJhdGlvbk1ldGFkYXRhLCByZWYub3duZWRCeU1vZHVsZUd1ZXNzLCByZXNvbHV0aW9uQ29udGV4dCksXG4gICAgICBleHBvcnRzOiBleHRyYWN0UmVmZXJlbmNlc0Zyb21UeXBlKFxuICAgICAgICAgIHRoaXMuY2hlY2tlciwgZXhwb3J0TWV0YWRhdGEsIHJlZi5vd25lZEJ5TW9kdWxlR3Vlc3MsIHJlc29sdXRpb25Db250ZXh0KSxcbiAgICAgIGltcG9ydHM6IGV4dHJhY3RSZWZlcmVuY2VzRnJvbVR5cGUoXG4gICAgICAgICAgdGhpcy5jaGVja2VyLCBpbXBvcnRNZXRhZGF0YSwgcmVmLm93bmVkQnlNb2R1bGVHdWVzcywgcmVzb2x1dGlvbkNvbnRleHQpLFxuICAgICAgc2NoZW1hczogW10sXG4gICAgICByYXdEZWNsYXJhdGlvbnM6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIGRpcmVjdGl2ZSAob3IgY29tcG9uZW50KSBtZXRhZGF0YSBmcm9tIGEgcmVmZXJlbmNlZCBjbGFzcyBpbiBhIC5kLnRzIGZpbGUuXG4gICAqL1xuICBnZXREaXJlY3RpdmVNZXRhZGF0YShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IERpcmVjdGl2ZU1ldGF8bnVsbCB7XG4gICAgY29uc3QgY2xhenogPSByZWYubm9kZTtcbiAgICBjb25zdCBkZWYgPSB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhjbGF6eikuZmluZChcbiAgICAgICAgZmllbGQgPT4gZmllbGQuaXNTdGF0aWMgJiYgKGZpZWxkLm5hbWUgPT09ICfJtWNtcCcgfHwgZmllbGQubmFtZSA9PT0gJ8m1ZGlyJykpO1xuICAgIGlmIChkZWYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTm8gZGVmaW5pdGlvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGRlZi50eXBlID09PSBudWxsIHx8ICF0cy5pc1R5cGVSZWZlcmVuY2VOb2RlKGRlZi50eXBlKSB8fFxuICAgICAgICBkZWYudHlwZS50eXBlQXJndW1lbnRzID09PSB1bmRlZmluZWQgfHwgZGVmLnR5cGUudHlwZUFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAvLyBUaGUgdHlwZSBtZXRhZGF0YSB3YXMgdGhlIHdyb25nIHNoYXBlLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRzID1cbiAgICAgICAgQ2xhc3NQcm9wZXJ0eU1hcHBpbmcuZnJvbU1hcHBlZE9iamVjdChyZWFkU3RyaW5nTWFwVHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzNdKSk7XG4gICAgY29uc3Qgb3V0cHV0cyA9XG4gICAgICAgIENsYXNzUHJvcGVydHlNYXBwaW5nLmZyb21NYXBwZWRPYmplY3QocmVhZFN0cmluZ01hcFR5cGUoZGVmLnR5cGUudHlwZUFyZ3VtZW50c1s0XSkpO1xuICAgIHJldHVybiB7XG4gICAgICByZWYsXG4gICAgICBuYW1lOiBjbGF6ei5uYW1lLnRleHQsXG4gICAgICBpc0NvbXBvbmVudDogZGVmLm5hbWUgPT09ICfJtWNtcCcsXG4gICAgICBzZWxlY3RvcjogcmVhZFN0cmluZ1R5cGUoZGVmLnR5cGUudHlwZUFyZ3VtZW50c1sxXSksXG4gICAgICBleHBvcnRBczogcmVhZFN0cmluZ0FycmF5VHlwZShkZWYudHlwZS50eXBlQXJndW1lbnRzWzJdKSxcbiAgICAgIGlucHV0cyxcbiAgICAgIG91dHB1dHMsXG4gICAgICBxdWVyaWVzOiByZWFkU3RyaW5nQXJyYXlUeXBlKGRlZi50eXBlLnR5cGVBcmd1bWVudHNbNV0pLFxuICAgICAgLi4uZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEoY2xhenosIGlucHV0cywgdGhpcy5yZWZsZWN0b3IpLFxuICAgICAgYmFzZUNsYXNzOiByZWFkQmFzZUNsYXNzKGNsYXp6LCB0aGlzLmNoZWNrZXIsIHRoaXMucmVmbGVjdG9yKSxcbiAgICAgIGlzUG9pc29uZWQ6IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmVhZCBwaXBlIG1ldGFkYXRhIGZyb20gYSByZWZlcmVuY2VkIGNsYXNzIGluIGEgLmQudHMgZmlsZS5cbiAgICovXG4gIGdldFBpcGVNZXRhZGF0YShyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik6IFBpcGVNZXRhfG51bGwge1xuICAgIGNvbnN0IGRlZiA9IHRoaXMucmVmbGVjdG9yLmdldE1lbWJlcnNPZkNsYXNzKHJlZi5ub2RlKS5maW5kKFxuICAgICAgICBmaWVsZCA9PiBmaWVsZC5pc1N0YXRpYyAmJiBmaWVsZC5uYW1lID09PSAnybVwaXBlJyk7XG4gICAgaWYgKGRlZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBObyBkZWZpbml0aW9uIGNvdWxkIGJlIGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgZGVmLnR5cGUgPT09IG51bGwgfHwgIXRzLmlzVHlwZVJlZmVyZW5jZU5vZGUoZGVmLnR5cGUpIHx8XG4gICAgICAgIGRlZi50eXBlLnR5cGVBcmd1bWVudHMgPT09IHVuZGVmaW5lZCB8fCBkZWYudHlwZS50eXBlQXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIC8vIFRoZSB0eXBlIG1ldGFkYXRhIHdhcyB0aGUgd3Jvbmcgc2hhcGUuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IGRlZi50eXBlLnR5cGVBcmd1bWVudHNbMV07XG4gICAgaWYgKCF0cy5pc0xpdGVyYWxUeXBlTm9kZSh0eXBlKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKHR5cGUubGl0ZXJhbCkpIHtcbiAgICAgIC8vIFRoZSB0eXBlIG1ldGFkYXRhIHdhcyB0aGUgd3JvbmcgdHlwZS5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBuYW1lID0gdHlwZS5saXRlcmFsLnRleHQ7XG4gICAgcmV0dXJuIHtyZWYsIG5hbWV9O1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRCYXNlQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTpcbiAgICBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj58J2R5bmFtaWMnfG51bGwge1xuICBpZiAoIWlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKGNsYXp6KSkge1xuICAgIC8vIFRlY2huaWNhbGx5IHRoaXMgaXMgYW4gZXJyb3IgaW4gYSAuZC50cyBmaWxlLCBidXQgZm9yIHRoZSBwdXJwb3NlcyBvZiBmaW5kaW5nIHRoZSBiYXNlIGNsYXNzXG4gICAgLy8gaXQncyBpZ25vcmVkLlxuICAgIHJldHVybiByZWZsZWN0b3IuaGFzQmFzZUNsYXNzKGNsYXp6KSA/ICdkeW5hbWljJyA6IG51bGw7XG4gIH1cblxuICBpZiAoY2xhenouaGVyaXRhZ2VDbGF1c2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGNvbnN0IGNsYXVzZSBvZiBjbGF6ei5oZXJpdGFnZUNsYXVzZXMpIHtcbiAgICAgIGlmIChjbGF1c2UudG9rZW4gPT09IHRzLlN5bnRheEtpbmQuRXh0ZW5kc0tleXdvcmQpIHtcbiAgICAgICAgY29uc3QgYmFzZUV4cHIgPSBjbGF1c2UudHlwZXNbMF0uZXhwcmVzc2lvbjtcbiAgICAgICAgbGV0IHN5bWJvbCA9IGNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihiYXNlRXhwcik7XG4gICAgICAgIGlmIChzeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiAnZHluYW1pYyc7XG4gICAgICAgIH0gZWxzZSBpZiAoc3ltYm9sLmZsYWdzICYgdHMuU3ltYm9sRmxhZ3MuQWxpYXMpIHtcbiAgICAgICAgICBzeW1ib2wgPSBjaGVja2VyLmdldEFsaWFzZWRTeW1ib2woc3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgaXNOYW1lZENsYXNzRGVjbGFyYXRpb24oc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZWZlcmVuY2Uoc3ltYm9sLnZhbHVlRGVjbGFyYXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAnZHluYW1pYyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=