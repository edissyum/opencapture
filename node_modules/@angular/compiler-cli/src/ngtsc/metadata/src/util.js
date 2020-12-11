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
        define("@angular/compiler-cli/src/ngtsc/metadata/src/util", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasInjectableFields = exports.CompoundMetadataReader = exports.extractDirectiveTypeCheckMeta = exports.readStringArrayType = exports.readStringMapType = exports.readStringType = exports.extractReferencesFromType = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    function extractReferencesFromType(checker, def, ngModuleImportedFrom, resolutionContext) {
        if (!ts.isTupleTypeNode(def)) {
            return [];
        }
        // TODO(alan-agius4): remove `def.elementTypes` and casts when TS 3.9 support is dropped and G3 is
        // using TS 4.0.
        return (def.elements || def.elementTypes)
            .map(function (element) {
            if (!ts.isTypeQueryNode(element)) {
                throw new Error("Expected TypeQueryNode: " + typescript_1.nodeDebugInfo(element));
            }
            var type = element.exprName;
            var _a = reflection_1.reflectTypeEntityToDeclaration(type, checker), node = _a.node, from = _a.from;
            if (!reflection_1.isNamedClassDeclaration(node)) {
                throw new Error("Expected named ClassDeclaration: " + typescript_1.nodeDebugInfo(node));
            }
            var specifier = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
            if (specifier !== null) {
                return new imports_1.Reference(node, { specifier: specifier, resolutionContext: resolutionContext });
            }
            else {
                return new imports_1.Reference(node);
            }
        });
    }
    exports.extractReferencesFromType = extractReferencesFromType;
    function readStringType(type) {
        if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
            return null;
        }
        return type.literal.text;
    }
    exports.readStringType = readStringType;
    function readStringMapType(type) {
        if (!ts.isTypeLiteralNode(type)) {
            return {};
        }
        var obj = {};
        type.members.forEach(function (member) {
            if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
                !ts.isStringLiteral(member.name)) {
                return;
            }
            var value = readStringType(member.type);
            if (value === null) {
                return null;
            }
            obj[member.name.text] = value;
        });
        return obj;
    }
    exports.readStringMapType = readStringMapType;
    function readStringArrayType(type) {
        if (!ts.isTupleTypeNode(type)) {
            return [];
        }
        var res = [];
        // TODO(alan-agius4): remove `def.elementTypes` and casts when TS 3.9 support is dropped and G3 is
        // using TS 4.0.
        (type.elements || type.elementTypes)
            .forEach(function (el) {
            if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
                return;
            }
            res.push(el.literal.text);
        });
        return res;
    }
    exports.readStringArrayType = readStringArrayType;
    /**
     * Inspects the class' members and extracts the metadata that is used when type-checking templates
     * that use the directive. This metadata does not contain information from a base class, if any,
     * making this metadata invariant to changes of inherited classes.
     */
    function extractDirectiveTypeCheckMeta(node, inputs, reflector) {
        var e_1, _a;
        var members = reflector.getMembersOfClass(node);
        var staticMembers = members.filter(function (member) { return member.isStatic; });
        var ngTemplateGuards = staticMembers.map(extractTemplateGuard)
            .filter(function (guard) { return guard !== null; });
        var hasNgTemplateContextGuard = staticMembers.some(function (member) { return member.kind === reflection_1.ClassMemberKind.Method && member.name === 'ngTemplateContextGuard'; });
        var coercedInputFields = new Set(staticMembers.map(extractCoercedInput)
            .filter(function (inputName) { return inputName !== null; }));
        var restrictedInputFields = new Set();
        var stringLiteralInputFields = new Set();
        var undeclaredInputFields = new Set();
        var _loop_1 = function (classPropertyName) {
            var field = members.find(function (member) { return member.name === classPropertyName; });
            if (field === undefined || field.node === null) {
                undeclaredInputFields.add(classPropertyName);
                return "continue";
            }
            if (isRestricted(field.node)) {
                restrictedInputFields.add(classPropertyName);
            }
            if (field.nameNode !== null && ts.isStringLiteral(field.nameNode)) {
                stringLiteralInputFields.add(classPropertyName);
            }
        };
        try {
            for (var _b = tslib_1.__values(inputs.classPropertyNames), _c = _b.next(); !_c.done; _c = _b.next()) {
                var classPropertyName = _c.value;
                _loop_1(classPropertyName);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var arity = reflector.getGenericArityOfClass(node);
        return {
            hasNgTemplateContextGuard: hasNgTemplateContextGuard,
            ngTemplateGuards: ngTemplateGuards,
            coercedInputFields: coercedInputFields,
            restrictedInputFields: restrictedInputFields,
            stringLiteralInputFields: stringLiteralInputFields,
            undeclaredInputFields: undeclaredInputFields,
            isGeneric: arity !== null && arity > 0,
        };
    }
    exports.extractDirectiveTypeCheckMeta = extractDirectiveTypeCheckMeta;
    function isRestricted(node) {
        if (node.modifiers === undefined) {
            return false;
        }
        return node.modifiers.some(function (modifier) { return modifier.kind === ts.SyntaxKind.PrivateKeyword ||
            modifier.kind === ts.SyntaxKind.ProtectedKeyword ||
            modifier.kind === ts.SyntaxKind.ReadonlyKeyword; });
    }
    function extractTemplateGuard(member) {
        if (!member.name.startsWith('ngTemplateGuard_')) {
            return null;
        }
        var inputName = afterUnderscore(member.name);
        if (member.kind === reflection_1.ClassMemberKind.Property) {
            var type = null;
            if (member.type !== null && ts.isLiteralTypeNode(member.type) &&
                ts.isStringLiteral(member.type.literal)) {
                type = member.type.literal.text;
            }
            // Only property members with string literal type 'binding' are considered as template guard.
            if (type !== 'binding') {
                return null;
            }
            return { inputName: inputName, type: type };
        }
        else if (member.kind === reflection_1.ClassMemberKind.Method) {
            return { inputName: inputName, type: 'invocation' };
        }
        else {
            return null;
        }
    }
    function extractCoercedInput(member) {
        if (member.kind !== reflection_1.ClassMemberKind.Property || !member.name.startsWith('ngAcceptInputType_')) {
            return null;
        }
        return afterUnderscore(member.name);
    }
    /**
     * A `MetadataReader` that reads from an ordered set of child readers until it obtains the requested
     * metadata.
     *
     * This is used to combine `MetadataReader`s that read from different sources (e.g. from a registry
     * and from .d.ts files).
     */
    var CompoundMetadataReader = /** @class */ (function () {
        function CompoundMetadataReader(readers) {
            this.readers = readers;
        }
        CompoundMetadataReader.prototype.getDirectiveMetadata = function (node) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getDirectiveMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
        CompoundMetadataReader.prototype.getNgModuleMetadata = function (node) {
            var e_3, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getNgModuleMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return null;
        };
        CompoundMetadataReader.prototype.getPipeMetadata = function (node) {
            var e_4, _a;
            try {
                for (var _b = tslib_1.__values(this.readers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var reader = _c.value;
                    var meta = reader.getPipeMetadata(node);
                    if (meta !== null) {
                        return meta;
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return null;
        };
        return CompoundMetadataReader;
    }());
    exports.CompoundMetadataReader = CompoundMetadataReader;
    function afterUnderscore(str) {
        var pos = str.indexOf('_');
        if (pos === -1) {
            throw new Error("Expected '" + str + "' to contain '_'");
        }
        return str.substr(pos + 1);
    }
    /** Returns whether a class declaration has the necessary class fields to make it injectable. */
    function hasInjectableFields(clazz, host) {
        var members = host.getMembersOfClass(clazz);
        return members.some(function (_a) {
            var isStatic = _a.isStatic, name = _a.name;
            return isStatic && (name === 'ɵprov' || name === 'ɵfac' || name === 'ɵinj');
        });
    }
    exports.hasInjectableFields = hasInjectableFields;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvbWV0YWRhdGEvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxtRUFBd0M7SUFDeEMseUVBQXlKO0lBQ3pKLGtGQUF3RDtJQUt4RCxTQUFnQix5QkFBeUIsQ0FDckMsT0FBdUIsRUFBRSxHQUFnQixFQUFFLG9CQUFpQyxFQUM1RSxpQkFBeUI7UUFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDNUIsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELGtHQUFrRztRQUNsRyxnQkFBZ0I7UUFDaEIsT0FBUSxDQUFFLEdBQVcsQ0FBQyxRQUFRLElBQUssR0FBVyxDQUFDLFlBQVksQ0FBK0I7YUFDckYsR0FBRyxDQUFDLFVBQUEsT0FBTztZQUNWLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUEyQiwwQkFBYSxDQUFDLE9BQU8sQ0FBRyxDQUFDLENBQUM7YUFDdEU7WUFDRCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO1lBQ3hCLElBQUEsS0FBZSwyQ0FBOEIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQTNELElBQUksVUFBQSxFQUFFLElBQUksVUFBaUQsQ0FBQztZQUNuRSxJQUFJLENBQUMsb0NBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQW9DLDBCQUFhLENBQUMsSUFBSSxDQUFHLENBQUMsQ0FBQzthQUM1RTtZQUNELElBQU0sU0FBUyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxD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Ozs7O1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBL0JELElBK0JDO0lBL0JZLHdEQUFzQjtJQWlDbkMsU0FBUyxlQUFlLENBQUMsR0FBVztRQUNsQyxJQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFhLEdBQUcscUJBQWtCLENBQUMsQ0FBQztTQUNyRDtRQUNELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELGdHQUFnRztJQUNoRyxTQUFnQixtQkFBbUIsQ0FBQyxLQUF1QixFQUFFLElBQW9CO1FBQy9FLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQ2YsVUFBQyxFQUFnQjtnQkFBZixRQUFRLGNBQUEsRUFBRSxJQUFJLFVBQUE7WUFBTSxPQUFBLFFBQVEsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxDQUFDO1FBQXBFLENBQW9FLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBSkQsa0RBSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ2xhc3NNZW1iZXIsIENsYXNzTWVtYmVyS2luZCwgaXNOYW1lZENsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0VHlwZUVudGl0eVRvRGVjbGFyYXRpb259IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtub2RlRGVidWdJbmZvfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEaXJlY3RpdmVNZXRhLCBEaXJlY3RpdmVUeXBlQ2hlY2tNZXRhLCBNZXRhZGF0YVJlYWRlciwgTmdNb2R1bGVNZXRhLCBQaXBlTWV0YSwgVGVtcGxhdGVHdWFyZE1ldGF9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Q2xhc3NQcm9wZXJ0eU1hcHBpbmcsIENsYXNzUHJvcGVydHlOYW1lfSBmcm9tICcuL3Byb3BlcnR5X21hcHBpbmcnO1xuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFJlZmVyZW5jZXNGcm9tVHlwZShcbiAgICBjaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgZGVmOiB0cy5UeXBlTm9kZSwgbmdNb2R1bGVJbXBvcnRlZEZyb206IHN0cmluZ3xudWxsLFxuICAgIHJlc29sdXRpb25Db250ZXh0OiBzdHJpbmcpOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj5bXSB7XG4gIGlmICghdHMuaXNUdXBsZVR5cGVOb2RlKGRlZikpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBUT0RPKGFsYW4tYWdpdXM0KTogcmVtb3ZlIGBkZWYuZWxlbWVudFR5cGVzYCBhbmQgY2FzdHMgd2hlbiBUUyAzLjkgc3VwcG9ydCBpcyBkcm9wcGVkIGFuZCBHMyBpc1xuICAvLyB1c2luZyBUUyA0LjAuXG4gIHJldHVybiAoKChkZWYgYXMgYW55KS5lbGVtZW50cyB8fCAoZGVmIGFzIGFueSkuZWxlbWVudFR5cGVzKSBhcyB0cy5Ob2RlQXJyYXk8dHMuVHlwZU5vZGU+KVxuICAgICAgLm1hcChlbGVtZW50ID0+IHtcbiAgICAgICAgaWYgKCF0cy5pc1R5cGVRdWVyeU5vZGUoZWxlbWVudCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIFR5cGVRdWVyeU5vZGU6ICR7bm9kZURlYnVnSW5mbyhlbGVtZW50KX1gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0eXBlID0gZWxlbWVudC5leHByTmFtZTtcbiAgICAgICAgY29uc3Qge25vZGUsIGZyb219ID0gcmVmbGVjdFR5cGVFbnRpdHlUb0RlY2xhcmF0aW9uKHR5cGUsIGNoZWNrZXIpO1xuICAgICAgICBpZiAoIWlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBuYW1lZCBDbGFzc0RlY2xhcmF0aW9uOiAke25vZGVEZWJ1Z0luZm8obm9kZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3BlY2lmaWVyID0gKGZyb20gIT09IG51bGwgJiYgIWZyb20uc3RhcnRzV2l0aCgnLicpID8gZnJvbSA6IG5nTW9kdWxlSW1wb3J0ZWRGcm9tKTtcbiAgICAgICAgaWYgKHNwZWNpZmllciAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBuZXcgUmVmZXJlbmNlKG5vZGUsIHtzcGVjaWZpZXIsIHJlc29sdXRpb25Db250ZXh0fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBSZWZlcmVuY2Uobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFN0cmluZ1R5cGUodHlwZTogdHMuVHlwZU5vZGUpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICghdHMuaXNMaXRlcmFsVHlwZU5vZGUodHlwZSkgfHwgIXRzLmlzU3RyaW5nTGl0ZXJhbCh0eXBlLmxpdGVyYWwpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIHR5cGUubGl0ZXJhbC50ZXh0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZFN0cmluZ01hcFR5cGUodHlwZTogdHMuVHlwZU5vZGUpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gIGlmICghdHMuaXNUeXBlTGl0ZXJhbE5vZGUodHlwZSkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cbiAgY29uc3Qgb2JqOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICB0eXBlLm1lbWJlcnMuZm9yRWFjaChtZW1iZXIgPT4ge1xuICAgIGlmICghdHMuaXNQcm9wZXJ0eVNpZ25hdHVyZShtZW1iZXIpIHx8IG1lbWJlci50eXBlID09PSB1bmRlZmluZWQgfHwgbWVtYmVyLm5hbWUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICAhdHMuaXNTdHJpbmdMaXRlcmFsKG1lbWJlci5uYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHJlYWRTdHJpbmdUeXBlKG1lbWJlci50eXBlKTtcbiAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBvYmpbbWVtYmVyLm5hbWUudGV4dF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkU3RyaW5nQXJyYXlUeXBlKHR5cGU6IHRzLlR5cGVOb2RlKTogc3RyaW5nW10ge1xuICBpZiAoIXRzLmlzVHVwbGVUeXBlTm9kZSh0eXBlKSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCByZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRPRE8oYWxhbi1hZ2l1czQpOiByZW1vdmUgYGRlZi5lbGVtZW50VHlwZXNgIGFuZCBjYXN0cyB3aGVuIFRTIDMuOSBzdXBwb3J0IGlzIGRyb3BwZWQgYW5kIEczIGlzXG4gIC8vIHVzaW5nIFRTIDQuMC5cbiAgKCgodHlwZSBhcyBhbnkpLmVsZW1lbnRzIHx8ICh0eXBlIGFzIGFueSkuZWxlbWVudFR5cGVzKSBhcyB0cy5Ob2RlQXJyYXk8dHMuVHlwZU5vZGU+KVxuICAgICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgICBpZiAoIXRzLmlzTGl0ZXJhbFR5cGVOb2RlKGVsKSB8fCAhdHMuaXNTdHJpbmdMaXRlcmFsKGVsLmxpdGVyYWwpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlcy5wdXNoKGVsLmxpdGVyYWwudGV4dCk7XG4gICAgICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuLyoqXG4gKiBJbnNwZWN0cyB0aGUgY2xhc3MnIG1lbWJlcnMgYW5kIGV4dHJhY3RzIHRoZSBtZXRhZGF0YSB0aGF0IGlzIHVzZWQgd2hlbiB0eXBlLWNoZWNraW5nIHRlbXBsYXRlc1xuICogdGhhdCB1c2UgdGhlIGRpcmVjdGl2ZS4gVGhpcyBtZXRhZGF0YSBkb2VzIG5vdCBjb250YWluIGluZm9ybWF0aW9uIGZyb20gYSBiYXNlIGNsYXNzLCBpZiBhbnksXG4gKiBtYWtpbmcgdGhpcyBtZXRhZGF0YSBpbnZhcmlhbnQgdG8gY2hhbmdlcyBvZiBpbmhlcml0ZWQgY2xhc3Nlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3REaXJlY3RpdmVUeXBlQ2hlY2tNZXRhKFxuICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGlucHV0czogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcsXG4gICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCk6IERpcmVjdGl2ZVR5cGVDaGVja01ldGEge1xuICBjb25zdCBtZW1iZXJzID0gcmVmbGVjdG9yLmdldE1lbWJlcnNPZkNsYXNzKG5vZGUpO1xuICBjb25zdCBzdGF0aWNNZW1iZXJzID0gbWVtYmVycy5maWx0ZXIobWVtYmVyID0+IG1lbWJlci5pc1N0YXRpYyk7XG4gIGNvbnN0IG5nVGVtcGxhdGVHdWFyZHMgPSBzdGF0aWNNZW1iZXJzLm1hcChleHRyYWN0VGVtcGxhdGVHdWFyZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChndWFyZCk6IGd1YXJkIGlzIFRlbXBsYXRlR3VhcmRNZXRhID0+IGd1YXJkICE9PSBudWxsKTtcbiAgY29uc3QgaGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCA9IHN0YXRpY01lbWJlcnMuc29tZShcbiAgICAgIG1lbWJlciA9PiBtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLk1ldGhvZCAmJiBtZW1iZXIubmFtZSA9PT0gJ25nVGVtcGxhdGVDb250ZXh0R3VhcmQnKTtcblxuICBjb25zdCBjb2VyY2VkSW5wdXRGaWVsZHMgPVxuICAgICAgbmV3IFNldChzdGF0aWNNZW1iZXJzLm1hcChleHRyYWN0Q29lcmNlZElucHV0KVxuICAgICAgICAgICAgICAgICAgLmZpbHRlcigoaW5wdXROYW1lKTogaW5wdXROYW1lIGlzIENsYXNzUHJvcGVydHlOYW1lID0+IGlucHV0TmFtZSAhPT0gbnVsbCkpO1xuXG4gIGNvbnN0IHJlc3RyaWN0ZWRJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGNvbnN0IHN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG4gIGNvbnN0IHVuZGVjbGFyZWRJbnB1dEZpZWxkcyA9IG5ldyBTZXQ8Q2xhc3NQcm9wZXJ0eU5hbWU+KCk7XG5cbiAgZm9yIChjb25zdCBjbGFzc1Byb3BlcnR5TmFtZSBvZiBpbnB1dHMuY2xhc3NQcm9wZXJ0eU5hbWVzKSB7XG4gICAgY29uc3QgZmllbGQgPSBtZW1iZXJzLmZpbmQobWVtYmVyID0+IG1lbWJlci5uYW1lID09PSBjbGFzc1Byb3BlcnR5TmFtZSk7XG4gICAgaWYgKGZpZWxkID09PSB1bmRlZmluZWQgfHwgZmllbGQubm9kZSA9PT0gbnVsbCkge1xuICAgICAgdW5kZWNsYXJlZElucHV0RmllbGRzLmFkZChjbGFzc1Byb3BlcnR5TmFtZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGlzUmVzdHJpY3RlZChmaWVsZC5ub2RlKSkge1xuICAgICAgcmVzdHJpY3RlZElucHV0RmllbGRzLmFkZChjbGFzc1Byb3BlcnR5TmFtZSk7XG4gICAgfVxuICAgIGlmIChmaWVsZC5uYW1lTm9kZSAhPT0gbnVsbCAmJiB0cy5pc1N0cmluZ0xpdGVyYWwoZmllbGQubmFtZU5vZGUpKSB7XG4gICAgICBzdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMuYWRkKGNsYXNzUHJvcGVydHlOYW1lKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBhcml0eSA9IHJlZmxlY3Rvci5nZXRHZW5lcmljQXJpdHlPZkNsYXNzKG5vZGUpO1xuXG4gIHJldHVybiB7XG4gICAgaGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCxcbiAgICBuZ1RlbXBsYXRlR3VhcmRzLFxuICAgIGNvZXJjZWRJbnB1dEZpZWxkcyxcbiAgICByZXN0cmljdGVkSW5wdXRGaWVsZHMsXG4gICAgc3RyaW5nTGl0ZXJhbElucHV0RmllbGRzLFxuICAgIHVuZGVjbGFyZWRJbnB1dEZpZWxkcyxcbiAgICBpc0dlbmVyaWM6IGFyaXR5ICE9PSBudWxsICYmIGFyaXR5ID4gMCxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaXNSZXN0cmljdGVkKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgaWYgKG5vZGUubW9kaWZpZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gbm9kZS5tb2RpZmllcnMuc29tZShcbiAgICAgIG1vZGlmaWVyID0+IG1vZGlmaWVyLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUHJpdmF0ZUtleXdvcmQgfHxcbiAgICAgICAgICBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3RlY3RlZEtleXdvcmQgfHxcbiAgICAgICAgICBtb2RpZmllci5raW5kID09PSB0cy5TeW50YXhLaW5kLlJlYWRvbmx5S2V5d29yZCk7XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUZW1wbGF0ZUd1YXJkKG1lbWJlcjogQ2xhc3NNZW1iZXIpOiBUZW1wbGF0ZUd1YXJkTWV0YXxudWxsIHtcbiAgaWYgKCFtZW1iZXIubmFtZS5zdGFydHNXaXRoKCduZ1RlbXBsYXRlR3VhcmRfJykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBpbnB1dE5hbWUgPSBhZnRlclVuZGVyc2NvcmUobWVtYmVyLm5hbWUpO1xuICBpZiAobWVtYmVyLmtpbmQgPT09IENsYXNzTWVtYmVyS2luZC5Qcm9wZXJ0eSkge1xuICAgIGxldCB0eXBlOiBzdHJpbmd8bnVsbCA9IG51bGw7XG4gICAgaWYgKG1lbWJlci50eXBlICE9PSBudWxsICYmIHRzLmlzTGl0ZXJhbFR5cGVOb2RlKG1lbWJlci50eXBlKSAmJlxuICAgICAgICB0cy5pc1N0cmluZ0xpdGVyYWwobWVtYmVyLnR5cGUubGl0ZXJhbCkpIHtcbiAgICAgIHR5cGUgPSBtZW1iZXIudHlwZS5saXRlcmFsLnRleHQ7XG4gICAgfVxuXG4gICAgLy8gT25seSBwcm9wZXJ0eSBtZW1iZXJzIHdpdGggc3RyaW5nIGxpdGVyYWwgdHlwZSAnYmluZGluZycgYXJlIGNvbnNpZGVyZWQgYXMgdGVtcGxhdGUgZ3VhcmQuXG4gICAgaWYgKHR5cGUgIT09ICdiaW5kaW5nJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7aW5wdXROYW1lLCB0eXBlfTtcbiAgfSBlbHNlIGlmIChtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLk1ldGhvZCkge1xuICAgIHJldHVybiB7aW5wdXROYW1lLCB0eXBlOiAnaW52b2NhdGlvbid9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RDb2VyY2VkSW5wdXQobWVtYmVyOiBDbGFzc01lbWJlcik6IHN0cmluZ3xudWxsIHtcbiAgaWYgKG1lbWJlci5raW5kICE9PSBDbGFzc01lbWJlcktpbmQuUHJvcGVydHkgfHwgIW1lbWJlci5uYW1lLnN0YXJ0c1dpdGgoJ25nQWNjZXB0SW5wdXRUeXBlXycpKSB7XG4gICAgcmV0dXJuIG51bGwhO1xuICB9XG4gIHJldHVybiBhZnRlclVuZGVyc2NvcmUobWVtYmVyLm5hbWUpO1xufVxuXG4vKipcbiAqIEEgYE1ldGFkYXRhUmVhZGVyYCB0aGF0IHJlYWRzIGZyb20gYW4gb3JkZXJlZCBzZXQgb2YgY2hpbGQgcmVhZGVycyB1bnRpbCBpdCBvYnRhaW5zIHRoZSByZXF1ZXN0ZWRcbiAqIG1ldGFkYXRhLlxuICpcbiAqIFRoaXMgaXMgdXNlZCB0byBjb21iaW5lIGBNZXRhZGF0YVJlYWRlcmBzIHRoYXQgcmVhZCBmcm9tIGRpZmZlcmVudCBzb3VyY2VzIChlLmcuIGZyb20gYSByZWdpc3RyeVxuICogYW5kIGZyb20gLmQudHMgZmlsZXMpLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG91bmRNZXRhZGF0YVJlYWRlciBpbXBsZW1lbnRzIE1ldGFkYXRhUmVhZGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkZXJzOiBNZXRhZGF0YVJlYWRlcltdKSB7fVxuXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKG5vZGU6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkRlY2xhcmF0aW9uPj4pOiBEaXJlY3RpdmVNZXRhfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXREaXJlY3RpdmVNZXRhZGF0YShub2RlKTtcbiAgICAgIGlmIChtZXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGdldE5nTW9kdWxlTWV0YWRhdGEobm9kZTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+Pik6IE5nTW9kdWxlTWV0YXxudWxsIHtcbiAgICBmb3IgKGNvbnN0IHJlYWRlciBvZiB0aGlzLnJlYWRlcnMpIHtcbiAgICAgIGNvbnN0IG1ldGEgPSByZWFkZXIuZ2V0TmdNb2R1bGVNZXRhZGF0YShub2RlKTtcbiAgICAgIGlmIChtZXRhICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBtZXRhO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXRQaXBlTWV0YWRhdGEobm9kZTogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuRGVjbGFyYXRpb24+Pik6IFBpcGVNZXRhfG51bGwge1xuICAgIGZvciAoY29uc3QgcmVhZGVyIG9mIHRoaXMucmVhZGVycykge1xuICAgICAgY29uc3QgbWV0YSA9IHJlYWRlci5nZXRQaXBlTWV0YWRhdGEobm9kZSk7XG4gICAgICBpZiAobWV0YSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbWV0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gYWZ0ZXJVbmRlcnNjb3JlKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgcG9zID0gc3RyLmluZGV4T2YoJ18nKTtcbiAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkICcke3N0cn0nIHRvIGNvbnRhaW4gJ18nYCk7XG4gIH1cbiAgcmV0dXJuIHN0ci5zdWJzdHIocG9zICsgMSk7XG59XG5cbi8qKiBSZXR1cm5zIHdoZXRoZXIgYSBjbGFzcyBkZWNsYXJhdGlvbiBoYXMgdGhlIG5lY2Vzc2FyeSBjbGFzcyBmaWVsZHMgdG8gbWFrZSBpdCBpbmplY3RhYmxlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhhc0luamVjdGFibGVGaWVsZHMoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0KTogYm9vbGVhbiB7XG4gIGNvbnN0IG1lbWJlcnMgPSBob3N0LmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KTtcbiAgcmV0dXJuIG1lbWJlcnMuc29tZShcbiAgICAgICh7aXNTdGF0aWMsIG5hbWV9KSA9PiBpc1N0YXRpYyAmJiAobmFtZSA9PT0gJ8m1cHJvdicgfHwgbmFtZSA9PT0gJ8m1ZmFjJyB8fCBuYW1lID09PSAnybVpbmonKSk7XG59XG4iXX0=