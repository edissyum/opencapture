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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/metadata", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateSetClassMetadataCall = void 0;
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    /**
     * Given a class declaration, generate a call to `setClassMetadata` with the Angular metadata
     * present on the class or its member fields. An ngDevMode guard is used to allow the call to be
     * tree-shaken away, as the `setClassMetadata` invocation is only needed for testing purposes.
     *
     * If no such metadata is present, this function returns `null`. Otherwise, the call is returned
     * as a `Statement` for inclusion along with the class.
     */
    function generateSetClassMetadataCall(clazz, reflection, isCore, annotateForClosureCompiler) {
        if (!reflection.isClass(clazz)) {
            return null;
        }
        var id = reflection.getAdjacentNameOfClass(clazz);
        // Reflect over the class decorators. If none are present, or those that are aren't from
        // Angular, then return null. Otherwise, turn them into metadata.
        var classDecorators = reflection.getDecoratorsOfDeclaration(clazz);
        if (classDecorators === null) {
            return null;
        }
        var ngClassDecorators = classDecorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator, annotateForClosureCompiler); })
            // Since the `setClassMetadata` call is intended to be emitted after the class
            // declaration, we have to strip references to the existing identifiers or
            // TypeScript might generate invalid code when it emits to JS. In particular
            // this can break when emitting a class to ES5 which has a custom decorator
            // and is referenced inside of its own metadata (see #39509 for more information).
            .map(function (decorator) { return removeIdentifierReferences(decorator, id.text); });
        if (ngClassDecorators.length === 0) {
            return null;
        }
        var metaDecorators = ts.createArrayLiteral(ngClassDecorators);
        // Convert the constructor parameters to metadata, passing null if none are present.
        var metaCtorParameters = new compiler_1.LiteralExpr(null);
        var classCtorParameters = reflection.getConstructorParameters(clazz);
        if (classCtorParameters !== null) {
            var ctorParameters = classCtorParameters.map(function (param) { return ctorParameterToMetadata(param, isCore); });
            metaCtorParameters = new compiler_1.FunctionExpr([], [
                new compiler_1.ReturnStatement(new compiler_1.LiteralArrayExpr(ctorParameters)),
            ]);
        }
        // Do the same for property decorators.
        var metaPropDecorators = ts.createNull();
        var classMembers = reflection.getMembersOfClass(clazz).filter(function (member) { return !member.isStatic && member.decorators !== null && member.decorators.length > 0; });
        var duplicateDecoratedMemberNames = classMembers.map(function (member) { return member.name; }).filter(function (name, i, arr) { return arr.indexOf(name) < i; });
        if (duplicateDecoratedMemberNames.length > 0) {
            // This should theoretically never happen, because the only way to have duplicate instance
            // member names is getter/setter pairs and decorators cannot appear in both a getter and the
            // corresponding setter.
            throw new Error("Duplicate decorated properties found on class '" + clazz.name.text + "': " +
                duplicateDecoratedMemberNames.join(', '));
        }
        var decoratedMembers = classMembers.map(function (member) { var _a; return classMemberToMetadata((_a = member.nameNode) !== null && _a !== void 0 ? _a : member.name, member.decorators, isCore); });
        if (decoratedMembers.length > 0) {
            metaPropDecorators = ts.createObjectLiteral(decoratedMembers);
        }
        // Generate a pure call to setClassMetadata with the class identifier and its metadata.
        var setClassMetadata = new compiler_1.ExternalExpr(compiler_1.Identifiers.setClassMetadata);
        var fnCall = new compiler_1.InvokeFunctionExpr(
        /* fn */ setClassMetadata, 
        /* args */
        [
            new compiler_1.WrappedNodeExpr(id),
            new compiler_1.WrappedNodeExpr(metaDecorators),
            metaCtorParameters,
            new compiler_1.WrappedNodeExpr(metaPropDecorators),
        ]);
        var iife = new compiler_1.FunctionExpr([], [compiler_1.devOnlyGuardedExpression(fnCall).toStmt()]);
        return iife.callFn([]).toStmt();
    }
    exports.generateSetClassMetadataCall = generateSetClassMetadataCall;
    /**
     * Convert a reflected constructor parameter to metadata.
     */
    function ctorParameterToMetadata(param, isCore) {
        // Parameters sometimes have a type that can be referenced. If so, then use it, otherwise
        // its type is undefined.
        var type = param.typeValueReference.kind !== 2 /* UNAVAILABLE */ ?
            util_1.valueReferenceToExpression(param.typeValueReference) :
            new compiler_1.LiteralExpr(undefined);
        var mapEntries = [
            { key: 'type', value: type, quoted: false },
        ];
        // If the parameter has decorators, include the ones from Angular.
        if (param.decorators !== null) {
            var ngDecorators = param.decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
                .map(function (decorator) { return decoratorToMetadata(decorator); });
            var value = new compiler_1.WrappedNodeExpr(ts.createArrayLiteral(ngDecorators));
            mapEntries.push({ key: 'decorators', value: value, quoted: false });
        }
        return compiler_1.literalMap(mapEntries);
    }
    /**
     * Convert a reflected class member to metadata.
     */
    function classMemberToMetadata(name, decorators, isCore) {
        var ngDecorators = decorators.filter(function (dec) { return isAngularDecorator(dec, isCore); })
            .map(function (decorator) { return decoratorToMetadata(decorator); });
        var decoratorMeta = ts.createArrayLiteral(ngDecorators);
        return ts.createPropertyAssignment(name, decoratorMeta);
    }
    /**
     * Convert a reflected decorator to metadata.
     */
    function decoratorToMetadata(decorator, wrapFunctionsInParens) {
        if (decorator.identifier === null) {
            throw new Error('Illegal state: synthesized decorator cannot be emitted in class metadata.');
        }
        // Decorators have a type.
        var properties = [
            ts.createPropertyAssignment('type', ts.getMutableClone(decorator.identifier)),
        ];
        // Sometimes they have arguments.
        if (decorator.args !== null && decorator.args.length > 0) {
            var args = decorator.args.map(function (arg) {
                var expr = ts.getMutableClone(arg);
                return wrapFunctionsInParens ? util_1.wrapFunctionExpressionsInParens(expr) : expr;
            });
            properties.push(ts.createPropertyAssignment('args', ts.createArrayLiteral(args)));
        }
        return ts.createObjectLiteral(properties, true);
    }
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     *
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
    /**
     * Recursively recreates all of the `Identifier` descendant nodes with a particular name inside
     * of an AST node, thus removing any references to them. Useful if a particular node has to be t
     * aken from one place any emitted to another one exactly as it has been written.
     */
    function removeIdentifierReferences(node, name) {
        var result = ts.transform(node, [function (context) { return function (root) { return ts.visitNode(root, function walk(current) {
                return ts.isIdentifier(current) && current.text === name ?
                    ts.createIdentifier(current.text) :
                    ts.visitEachChild(current, walk, context);
            }); }; }]);
        return result.transformed[0];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBdU87SUFDdk8sK0JBQWlDO0lBSWpDLDZFQUFtRjtJQUduRjs7Ozs7OztPQU9HO0lBQ0gsU0FBZ0IsNEJBQTRCLENBQ3hDLEtBQXNCLEVBQUUsVUFBMEIsRUFBRSxNQUFlLEVBQ25FLDBCQUFvQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBELHdGQUF3RjtRQUN4RixpRUFBaUU7UUFDakUsSUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxpQkFBaUIsR0FDbkIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUN6RCxHQUFHLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsRUFBMUQsQ0FBMEQsQ0FBQztZQUM3RSw4RUFBOEU7WUFDOUUsMEVBQTBFO1lBQzFFLDRFQUE0RTtZQUM1RSwyRUFBMkU7WUFDM0Usa0ZBQWtGO2FBQ2pGLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLDBCQUEw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QU8sQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxFQUp3QixDQUl4QixFQUpnQixDQUloQixDQUFDLENBQUMsQ0FBQztRQUVULE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZGV2T25seUd1YXJkZWRFeHByZXNzaW9uLCBFeHByZXNzaW9uLCBFeHRlcm5hbEV4cHIsIEZ1bmN0aW9uRXhwciwgSWRlbnRpZmllcnMsIEludm9rZUZ1bmN0aW9uRXhwciwgTGl0ZXJhbEFycmF5RXhwciwgTGl0ZXJhbEV4cHIsIGxpdGVyYWxNYXAsIE5PTkVfVFlQRSwgUmV0dXJuU3RhdGVtZW50LCBTdGF0ZW1lbnQsIFdyYXBwZWROb2RlRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q3RvclBhcmFtZXRlciwgRGVjbGFyYXRpb25Ob2RlLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kfSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcblxuaW1wb3J0IHt2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbiwgd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVuc30gZnJvbSAnLi91dGlsJztcblxuXG4vKipcbiAqIEdpdmVuIGEgY2xhc3MgZGVjbGFyYXRpb24sIGdlbmVyYXRlIGEgY2FsbCB0byBgc2V0Q2xhc3NNZXRhZGF0YWAgd2l0aCB0aGUgQW5ndWxhciBtZXRhZGF0YVxuICogcHJlc2VudCBvbiB0aGUgY2xhc3Mgb3IgaXRzIG1lbWJlciBmaWVsZHMuIEFuIG5nRGV2TW9kZSBndWFyZCBpcyB1c2VkIHRvIGFsbG93IHRoZSBjYWxsIHRvIGJlXG4gKiB0cmVlLXNoYWtlbiBhd2F5LCBhcyB0aGUgYHNldENsYXNzTWV0YWRhdGFgIGludm9jYXRpb24gaXMgb25seSBuZWVkZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuXG4gKlxuICogSWYgbm8gc3VjaCBtZXRhZGF0YSBpcyBwcmVzZW50LCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgYG51bGxgLiBPdGhlcndpc2UsIHRoZSBjYWxsIGlzIHJldHVybmVkXG4gKiBhcyBhIGBTdGF0ZW1lbnRgIGZvciBpbmNsdXNpb24gYWxvbmcgd2l0aCB0aGUgY2xhc3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsKFxuICAgIGNsYXp6OiBEZWNsYXJhdGlvbk5vZGUsIHJlZmxlY3Rpb246IFJlZmxlY3Rpb25Ib3N0LCBpc0NvcmU6IGJvb2xlYW4sXG4gICAgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXI/OiBib29sZWFuKTogU3RhdGVtZW50fG51bGwge1xuICBpZiAoIXJlZmxlY3Rpb24uaXNDbGFzcyhjbGF6eikpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBpZCA9IHJlZmxlY3Rpb24uZ2V0QWRqYWNlbnROYW1lT2ZDbGFzcyhjbGF6eik7XG5cbiAgLy8gUmVmbGVjdCBvdmVyIHRoZSBjbGFzcyBkZWNvcmF0b3JzLiBJZiBub25lIGFyZSBwcmVzZW50LCBvciB0aG9zZSB0aGF0IGFyZSBhcmVuJ3QgZnJvbVxuICAvLyBBbmd1bGFyLCB0aGVuIHJldHVybiBudWxsLiBPdGhlcndpc2UsIHR1cm4gdGhlbSBpbnRvIG1ldGFkYXRhLlxuICBjb25zdCBjbGFzc0RlY29yYXRvcnMgPSByZWZsZWN0aW9uLmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGNsYXp6KTtcbiAgaWYgKGNsYXNzRGVjb3JhdG9ycyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IG5nQ2xhc3NEZWNvcmF0b3JzID1cbiAgICAgIGNsYXNzRGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+IGlzQW5ndWxhckRlY29yYXRvcihkZWMsIGlzQ29yZSkpXG4gICAgICAgICAgLm1hcChkZWNvcmF0b3IgPT4gZGVjb3JhdG9yVG9NZXRhZGF0YShkZWNvcmF0b3IsIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKSlcbiAgICAgICAgICAvLyBTaW5jZSB0aGUgYHNldENsYXNzTWV0YWRhdGFgIGNhbGwgaXMgaW50ZW5kZWQgdG8gYmUgZW1pdHRlZCBhZnRlciB0aGUgY2xhc3NcbiAgICAgICAgICAvLyBkZWNsYXJhdGlvbiwgd2UgaGF2ZSB0byBzdHJpcCByZWZlcmVuY2VzIHRvIHRoZSBleGlzdGluZyBpZGVudGlmaWVycyBvclxuICAgICAgICAgIC8vIFR5cGVTY3JpcHQgbWlnaHQgZ2VuZXJhdGUgaW52YWxpZCBjb2RlIHdoZW4gaXQgZW1pdHMgdG8gSlMuIEluIHBhcnRpY3VsYXJcbiAgICAgICAgICAvLyB0aGlzIGNhbiBicmVhayB3aGVuIGVtaXR0aW5nIGEgY2xhc3MgdG8gRVM1IHdoaWNoIGhhcyBhIGN1c3RvbSBkZWNvcmF0b3JcbiAgICAgICAgICAvLyBhbmQgaXMgcmVmZXJlbmNlZCBpbnNpZGUgb2YgaXRzIG93biBtZXRhZGF0YSAoc2VlICMzOTUwOSBmb3IgbW9yZSBpbmZvcm1hdGlvbikuXG4gICAgICAgICAgLm1hcChkZWNvcmF0b3IgPT4gcmVtb3ZlSWRlbnRpZmllclJlZmVyZW5jZXMoZGVjb3JhdG9yLCBpZC50ZXh0KSk7XG4gIGlmIChuZ0NsYXNzRGVjb3JhdG9ycy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBtZXRhRGVjb3JhdG9ycyA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0NsYXNzRGVjb3JhdG9ycyk7XG5cbiAgLy8gQ29udmVydCB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVycyB0byBtZXRhZGF0YSwgcGFzc2luZyBudWxsIGlmIG5vbmUgYXJlIHByZXNlbnQuXG4gIGxldCBtZXRhQ3RvclBhcmFtZXRlcnM6IEV4cHJlc3Npb24gPSBuZXcgTGl0ZXJhbEV4cHIobnVsbCk7XG4gIGNvbnN0IGNsYXNzQ3RvclBhcmFtZXRlcnMgPSByZWZsZWN0aW9uLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gIGlmIChjbGFzc0N0b3JQYXJhbWV0ZXJzICE9PSBudWxsKSB7XG4gICAgY29uc3QgY3RvclBhcmFtZXRlcnMgPSBjbGFzc0N0b3JQYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiBjdG9yUGFyYW1ldGVyVG9NZXRhZGF0YShwYXJhbSwgaXNDb3JlKSk7XG4gICAgbWV0YUN0b3JQYXJhbWV0ZXJzID0gbmV3IEZ1bmN0aW9uRXhwcihbXSwgW1xuICAgICAgbmV3IFJldHVyblN0YXRlbWVudChuZXcgTGl0ZXJhbEFycmF5RXhwcihjdG9yUGFyYW1ldGVycykpLFxuICAgIF0pO1xuICB9XG5cbiAgLy8gRG8gdGhlIHNhbWUgZm9yIHByb3BlcnR5IGRlY29yYXRvcnMuXG4gIGxldCBtZXRhUHJvcERlY29yYXRvcnM6IHRzLkV4cHJlc3Npb24gPSB0cy5jcmVhdGVOdWxsKCk7XG4gIGNvbnN0IGNsYXNzTWVtYmVycyA9IHJlZmxlY3Rpb24uZ2V0TWVtYmVyc09mQ2xhc3MoY2xhenopLmZpbHRlcihcbiAgICAgIG1lbWJlciA9PiAhbWVtYmVyLmlzU3RhdGljICYmIG1lbWJlci5kZWNvcmF0b3JzICE9PSBudWxsICYmIG1lbWJlci5kZWNvcmF0b3JzLmxlbmd0aCA+IDApO1xuICBjb25zdCBkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcyA9XG4gICAgICBjbGFzc01lbWJlcnMubWFwKG1lbWJlciA9PiBtZW1iZXIubmFtZSkuZmlsdGVyKChuYW1lLCBpLCBhcnIpID0+IGFyci5pbmRleE9mKG5hbWUpIDwgaSk7XG4gIGlmIChkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgLy8gVGhpcyBzaG91bGQgdGhlb3JldGljYWxseSBuZXZlciBoYXBwZW4sIGJlY2F1c2UgdGhlIG9ubHkgd2F5IHRvIGhhdmUgZHVwbGljYXRlIGluc3RhbmNlXG4gICAgLy8gbWVtYmVyIG5hbWVzIGlzIGdldHRlci9zZXR0ZXIgcGFpcnMgYW5kIGRlY29yYXRvcnMgY2Fubm90IGFwcGVhciBpbiBib3RoIGEgZ2V0dGVyIGFuZCB0aGVcbiAgICAvLyBjb3JyZXNwb25kaW5nIHNldHRlci5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBEdXBsaWNhdGUgZGVjb3JhdGVkIHByb3BlcnRpZXMgZm91bmQgb24gY2xhc3MgJyR7Y2xhenoubmFtZS50ZXh0fSc6IGAgK1xuICAgICAgICBkdXBsaWNhdGVEZWNvcmF0ZWRNZW1iZXJOYW1lcy5qb2luKCcsICcpKTtcbiAgfVxuICBjb25zdCBkZWNvcmF0ZWRNZW1iZXJzID0gY2xhc3NNZW1iZXJzLm1hcChcbiAgICAgIG1lbWJlciA9PiBjbGFzc01lbWJlclRvTWV0YWRhdGEobWVtYmVyLm5hbWVOb2RlID8/IG1lbWJlci5uYW1lLCBtZW1iZXIuZGVjb3JhdG9ycyEsIGlzQ29yZSkpO1xuICBpZiAoZGVjb3JhdGVkTWVtYmVycy5sZW5ndGggPiAwKSB7XG4gICAgbWV0YVByb3BEZWNvcmF0b3JzID0gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChkZWNvcmF0ZWRNZW1iZXJzKTtcbiAgfVxuXG4gIC8vIEdlbmVyYXRlIGEgcHVyZSBjYWxsIHRvIHNldENsYXNzTWV0YWRhdGEgd2l0aCB0aGUgY2xhc3MgaWRlbnRpZmllciBhbmQgaXRzIG1ldGFkYXRhLlxuICBjb25zdCBzZXRDbGFzc01ldGFkYXRhID0gbmV3IEV4dGVybmFsRXhwcihJZGVudGlmaWVycy5zZXRDbGFzc01ldGFkYXRhKTtcbiAgY29uc3QgZm5DYWxsID0gbmV3IEludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIC8qIGZuICovIHNldENsYXNzTWV0YWRhdGEsXG4gICAgICAvKiBhcmdzICovXG4gICAgICBbXG4gICAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIoaWQpLFxuICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKG1ldGFEZWNvcmF0b3JzKSxcbiAgICAgICAgbWV0YUN0b3JQYXJhbWV0ZXJzLFxuICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKG1ldGFQcm9wRGVjb3JhdG9ycyksXG4gICAgICBdKTtcbiAgY29uc3QgaWlmZSA9IG5ldyBGdW5jdGlvbkV4cHIoW10sIFtkZXZPbmx5R3VhcmRlZEV4cHJlc3Npb24oZm5DYWxsKS50b1N0bXQoKV0pO1xuICByZXR1cm4gaWlmZS5jYWxsRm4oW10pLnRvU3RtdCgpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSByZWZsZWN0ZWQgY29uc3RydWN0b3IgcGFyYW1ldGVyIHRvIG1ldGFkYXRhLlxuICovXG5mdW5jdGlvbiBjdG9yUGFyYW1ldGVyVG9NZXRhZGF0YShwYXJhbTogQ3RvclBhcmFtZXRlciwgaXNDb3JlOiBib29sZWFuKTogRXhwcmVzc2lvbiB7XG4gIC8vIFBhcmFtZXRlcnMgc29tZXRpbWVzIGhhdmUgYSB0eXBlIHRoYXQgY2FuIGJlIHJlZmVyZW5jZWQuIElmIHNvLCB0aGVuIHVzZSBpdCwgb3RoZXJ3aXNlXG4gIC8vIGl0cyB0eXBlIGlzIHVuZGVmaW5lZC5cbiAgY29uc3QgdHlwZSA9IHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZS5raW5kICE9PSBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLlVOQVZBSUxBQkxFID9cbiAgICAgIHZhbHVlUmVmZXJlbmNlVG9FeHByZXNzaW9uKHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZSkgOlxuICAgICAgbmV3IExpdGVyYWxFeHByKHVuZGVmaW5lZCk7XG5cbiAgY29uc3QgbWFwRW50cmllczoge2tleTogc3RyaW5nLCB2YWx1ZTogRXhwcmVzc2lvbiwgcXVvdGVkOiBmYWxzZX1bXSA9IFtcbiAgICB7a2V5OiAndHlwZScsIHZhbHVlOiB0eXBlLCBxdW90ZWQ6IGZhbHNlfSxcbiAgXTtcblxuICAvLyBJZiB0aGUgcGFyYW1ldGVyIGhhcyBkZWNvcmF0b3JzLCBpbmNsdWRlIHRoZSBvbmVzIGZyb20gQW5ndWxhci5cbiAgaWYgKHBhcmFtLmRlY29yYXRvcnMgIT09IG51bGwpIHtcbiAgICBjb25zdCBuZ0RlY29yYXRvcnMgPSBwYXJhbS5kZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gaXNBbmd1bGFyRGVjb3JhdG9yKGRlYywgaXNDb3JlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZGVjb3JhdG9yOiBEZWNvcmF0b3IpID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yKSk7XG4gICAgY29uc3QgdmFsdWUgPSBuZXcgV3JhcHBlZE5vZGVFeHByKHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0RlY29yYXRvcnMpKTtcbiAgICBtYXBFbnRyaWVzLnB1c2goe2tleTogJ2RlY29yYXRvcnMnLCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX0pO1xuICB9XG4gIHJldHVybiBsaXRlcmFsTWFwKG1hcEVudHJpZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSByZWZsZWN0ZWQgY2xhc3MgbWVtYmVyIHRvIG1ldGFkYXRhLlxuICovXG5mdW5jdGlvbiBjbGFzc01lbWJlclRvTWV0YWRhdGEoXG4gICAgbmFtZTogdHMuUHJvcGVydHlOYW1lfHN0cmluZywgZGVjb3JhdG9yczogRGVjb3JhdG9yW10sIGlzQ29yZTogYm9vbGVhbik6IHRzLlByb3BlcnR5QXNzaWdubWVudCB7XG4gIGNvbnN0IG5nRGVjb3JhdG9ycyA9IGRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZGVjb3JhdG9yOiBEZWNvcmF0b3IpID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yKSk7XG4gIGNvbnN0IGRlY29yYXRvck1ldGEgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwobmdEZWNvcmF0b3JzKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChuYW1lLCBkZWNvcmF0b3JNZXRhKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGRlY29yYXRvciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gZGVjb3JhdG9yVG9NZXRhZGF0YShcbiAgICBkZWNvcmF0b3I6IERlY29yYXRvciwgd3JhcEZ1bmN0aW9uc0luUGFyZW5zPzogYm9vbGVhbik6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uIHtcbiAgaWYgKGRlY29yYXRvci5pZGVudGlmaWVyID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIHN0YXRlOiBzeW50aGVzaXplZCBkZWNvcmF0b3IgY2Fubm90IGJlIGVtaXR0ZWQgaW4gY2xhc3MgbWV0YWRhdGEuJyk7XG4gIH1cbiAgLy8gRGVjb3JhdG9ycyBoYXZlIGEgdHlwZS5cbiAgY29uc3QgcHJvcGVydGllczogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlW10gPSBbXG4gICAgdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCd0eXBlJywgdHMuZ2V0TXV0YWJsZUNsb25lKGRlY29yYXRvci5pZGVudGlmaWVyKSksXG4gIF07XG4gIC8vIFNvbWV0aW1lcyB0aGV5IGhhdmUgYXJndW1lbnRzLlxuICBpZiAoZGVjb3JhdG9yLmFyZ3MgIT09IG51bGwgJiYgZGVjb3JhdG9yLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFyZ3MgPSBkZWNvcmF0b3IuYXJncy5tYXAoYXJnID0+IHtcbiAgICAgIGNvbnN0IGV4cHIgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoYXJnKTtcbiAgICAgIHJldHVybiB3cmFwRnVuY3Rpb25zSW5QYXJlbnMgPyB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zKGV4cHIpIDogZXhwcjtcbiAgICB9KTtcbiAgICBwcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdhcmdzJywgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGFyZ3MpKSk7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwocHJvcGVydGllcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogV2hldGhlciBhIGdpdmVuIGRlY29yYXRvciBzaG91bGQgYmUgdHJlYXRlZCBhcyBhbiBBbmd1bGFyIGRlY29yYXRvci5cbiAqXG4gKiBFaXRoZXIgaXQncyB1c2VkIGluIEBhbmd1bGFyL2NvcmUsIG9yIGl0J3MgaW1wb3J0ZWQgZnJvbSB0aGVyZS5cbiAqL1xuZnVuY3Rpb24gaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvcjogRGVjb3JhdG9yLCBpc0NvcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ29yZSB8fCAoZGVjb3JhdG9yLmltcG9ydCAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJyk7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcmVjcmVhdGVzIGFsbCBvZiB0aGUgYElkZW50aWZpZXJgIGRlc2NlbmRhbnQgbm9kZXMgd2l0aCBhIHBhcnRpY3VsYXIgbmFtZSBpbnNpZGVcbiAqIG9mIGFuIEFTVCBub2RlLCB0aHVzIHJlbW92aW5nIGFueSByZWZlcmVuY2VzIHRvIHRoZW0uIFVzZWZ1bCBpZiBhIHBhcnRpY3VsYXIgbm9kZSBoYXMgdG8gYmUgdFxuICogYWtlbiBmcm9tIG9uZSBwbGFjZSBhbnkgZW1pdHRlZCB0byBhbm90aGVyIG9uZSBleGFjdGx5IGFzIGl0IGhhcyBiZWVuIHdyaXR0ZW4uXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUlkZW50aWZpZXJSZWZlcmVuY2VzPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBULCBuYW1lOiBzdHJpbmcpOiBUIHtcbiAgY29uc3QgcmVzdWx0ID0gdHMudHJhbnNmb3JtKFxuICAgICAgbm9kZSwgW2NvbnRleHQgPT4gcm9vdCA9PiB0cy52aXNpdE5vZGUocm9vdCwgZnVuY3Rpb24gd2FsayhjdXJyZW50OiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gICAgICAgIHJldHVybiB0cy5pc0lkZW50aWZpZXIoY3VycmVudCkgJiYgY3VycmVudC50ZXh0ID09PSBuYW1lID9cbiAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoY3VycmVudC50ZXh0KSA6XG4gICAgICAgICAgICB0cy52aXNpdEVhY2hDaGlsZChjdXJyZW50LCB3YWxrLCBjb250ZXh0KTtcbiAgICAgIH0pXSk7XG5cbiAgcmV0dXJuIHJlc3VsdC50cmFuc2Zvcm1lZFswXTtcbn1cbiJdfQ==