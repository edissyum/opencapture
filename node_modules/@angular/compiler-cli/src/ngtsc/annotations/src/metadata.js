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
     * present on the class or its member fields.
     *
     * If no such metadata is present, this function returns `null`. Otherwise, the call is returned
     * as a `Statement` for inclusion along with the class.
     */
    function generateSetClassMetadataCall(clazz, reflection, defaultImportRecorder, isCore, annotateForClosureCompiler) {
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
            var ctorParameters = classCtorParameters.map(function (param) { return ctorParameterToMetadata(param, defaultImportRecorder, isCore); });
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
        var iifeFn = new compiler_1.FunctionExpr([], [fnCall.toStmt()], compiler_1.NONE_TYPE);
        var iife = new compiler_1.InvokeFunctionExpr(
        /* fn */ iifeFn, 
        /* args */ [], 
        /* type */ undefined, 
        /* sourceSpan */ undefined, 
        /* pure */ true);
        return iife.toStmt();
    }
    exports.generateSetClassMetadataCall = generateSetClassMetadataCall;
    /**
     * Convert a reflected constructor parameter to metadata.
     */
    function ctorParameterToMetadata(param, defaultImportRecorder, isCore) {
        // Parameters sometimes have a type that can be referenced. If so, then use it, otherwise
        // its type is undefined.
        var type = param.typeValueReference.kind !== 2 /* UNAVAILABLE */ ?
            util_1.valueReferenceToExpression(param.typeValueReference, defaultImportRecorder) :
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2Fubm90YXRpb25zL3NyYy9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBNk07SUFDN00sK0JBQWlDO0lBS2pDLDZFQUFtRjtJQUduRjs7Ozs7O09BTUc7SUFDSCxTQUFnQiw0QkFBNEIsQ0FDeEMsS0FBc0IsRUFBRSxVQUEwQixFQUNsRCxxQkFBNEMsRUFBRSxNQUFlLEVBQzdELDBCQUFvQztRQUN0QyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBELHdGQUF3RjtRQUN4RixpRUFBaUU7UUFDakUsSUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsSUFBTSxpQkFBaUIsR0FDbkIsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQzthQUN6RCxHQUFHLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsMEJBQTBCLENBQUMsRUFBMUQsQ0FBMEQsQ0FBQztZQUM3RSw4RUFBOEU7WUFDOUUsMEVBQTBFO1lBQzFFLDRFQUE0RTtZQUM1RSwyRUFBMkU7WUFDM0Usa0ZBQWtGO2FBQ2pGLEdBQUcsQ0FBQyxVQUFBLFNBQVMsSUFBSSxPQUFBLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUMxRSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELElBQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRWhFLG9GQUFvRjtRQUNwRixJQUFJLGtCQUFrQixHQUFlLElBQUksc0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzRCxJQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2RSxJQUFJLG1CQUFtQixLQUFLLElBQUksRUFBRTtZQUNoQyxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQzFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsdUJBQXVCLENBQUMsS0FBSyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxFQUE3RCxDQUE2RCxDQUFDLENBQUM7WUFDNUUsa0JBQWtCLEdBQUcsSUFBSSx1QkFBWSxDQUFDLEVBQUUsRUFBRTtnQkFDeEMsSUFBSSwwQkFBZSxDQUFDLElBQUksMkJBQWdCLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDMUQsQ0FBQyxDQUFDO1NBQ0o7UUFFRCx1Q0FBdUM7UUFDdkMsSUFBSSxrQkFBa0IsR0FBa0IsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3hELElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQzNELFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBOUUsQ0FBOEUsQ0FBQyxDQUFDO1FBQzlGLElBQU0sNkJBQTZCLEdBQy9CLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxFQUFYLENBQVcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUM1RixJQUFJLDZCQUE2QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUMsMEZBQTBGO1lBQzFGLDRGQUE0RjtZQUM1Rix3QkFBd0I7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FDWCxvREFBa0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQUs7Z0JBQ3RFLDZCQUE2QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUNyQyxVQUFBLE1BQU0sWUFBSSxPQUFBLHFCQUFxQixPQUFDLE1BQU0sQ0FBQyxRQUFRLG1DQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFVBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQSxFQUFBLENBQUMsQ0FBQztRQUNqRyxJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDL0Isa0JBQWtCLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDL0Q7UUFFRCx1RkFBdUY7UUFDdkYsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLHVCQUFZLENBQUMsc0JBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3hFLElBQU0sTUFBTSxHQUFHLElBQUksNkJBQWtCO1FBQ2pDLFFBQVEsQ0FBQyxnQkFBZ0I7UUFDekIsVUFBVTtRQUNWO1lBQ0UsSUFBSSwwQkFBZSxDQUFDLEVBQUUsQ0FBQztZQUN2QixJQUFJLDBCQUFlLENBQUMsY0FBYyxDQUFDO1lBQ25DLGtCQUFrQjtZQUNsQixJQUFJLDBCQUFlLENBQUMsa0JBQWtCLENBQUM7U0FDeEMsQ0FBQyxDQUFDO1FBQ1AsSUFBTSxNQUFNLEdBQUcsSUFBSSx1QkFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLG9CQUFTLENBQUMsQ0FBQztRQUNsRSxJQUFNLElBQUksR0FBRyxJQUFJLDZCQUFrQjtRQUMvQixRQUFRLENBQUMsTUFBTTtRQUNmLFVBQVUsQ0FBQSxFQUFFO1FBQ1osVUFBVSxDQUFDLFNBQVM7UUFDcEIsZ0JBQWdCLENBQUMsU0FBUztRQUMxQixVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQS9FRCxvRUErRUM7SUFFRDs7T0FFRztJQUNILFNBQVMsdUJBQXVCLENBQzVCLEtBQW9CLEVBQUUscUJBQTRDLEVBQ2xFLE1BQWU7UUFDakIseUZBQXlGO1FBQ3pGLHlCQUF5QjtRQUN6QixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsSUFBSSx3QkFBdUMsQ0FBQyxDQUFDO1lBQy9FLGlDQUEwQixDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDN0UsSUFBSSxzQkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9CLElBQU0sVUFBVSxHQUFzRDtZQUNwRSxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFDO1NBQzFDLENBQUM7UUFFRixrRUFBa0U7UUFDbEUsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtZQUM3QixJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBL0IsQ0FBK0IsQ0FBQztpQkFDMUQsR0FBRyxDQUFDLFVBQUMsU0FBb0IsSUFBSyxPQUFBLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7WUFDeEYsSUFBTSxLQUFLLEdBQUcsSUFBSSwwQkFBZSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssT0FBQSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsT0FBTyxxQkFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNILFNBQVMscUJBQXFCLENBQzFCLElBQTRCLEVBQUUsVUFBdUIsRUFBRSxNQUFlO1FBQ3hFLElBQU0sWUFBWSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQS9CLENBQStCLENBQUM7YUFDcEQsR0FBRyxDQUFDLFVBQUMsU0FBb0IsSUFBSyxPQUFBLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxFQUE5QixDQUE4QixDQUFDLENBQUM7UUFDeEYsSUFBTSxhQUFhLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFELE9BQU8sRUFBRSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLG1CQUFtQixDQUN4QixTQUFvQixFQUFFLHFCQUErQjtRQUN2RCxJQUFJLFNBQVMsQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztTQUM5RjtRQUNELDBCQUEwQjtRQUMxQixJQUFNLFVBQVUsR0FBa0M7WUFDaEQsRUFBRSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM5RSxDQUFDO1FBQ0YsaUNBQWlDO1FBQ2pDLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3hELElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztnQkFDakMsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckMsT0FBTyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsc0NBQStCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM5RSxDQUFDLENBQUMsQ0FBQztZQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxTQUFvQixFQUFFLE1BQWU7UUFDL0QsT0FBTyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLElBQUksSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxlQUFlLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsMEJBQTBCLENBQW9CLElBQU8sRUFBRSxJQUFZO1FBQzFFLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQ3ZCLElBQUksRUFBRSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsVUFBQSxJQUFJLElBQUksT0FBQSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLElBQUksQ0FBQyxPQUFnQjtnQkFDekUsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7b0JBQ3RELEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDbkMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQyxFQUp3QixDQUl4QixFQUpnQixDQUloQixDQUFDLENBQUMsQ0FBQztRQUVULE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBGdW5jdGlvbkV4cHIsIElkZW50aWZpZXJzLCBJbnZva2VGdW5jdGlvbkV4cHIsIExpdGVyYWxBcnJheUV4cHIsIExpdGVyYWxFeHByLCBsaXRlcmFsTWFwLCBOT05FX1RZUEUsIFJldHVyblN0YXRlbWVudCwgU3RhdGVtZW50LCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0RlZmF1bHRJbXBvcnRSZWNvcmRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0N0b3JQYXJhbWV0ZXIsIERlY2xhcmF0aW9uTm9kZSwgRGVjb3JhdG9yLCBSZWZsZWN0aW9uSG9zdCwgVHlwZVZhbHVlUmVmZXJlbmNlS2luZH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5cbmltcG9ydCB7dmFsdWVSZWZlcmVuY2VUb0V4cHJlc3Npb24sIHdyYXBGdW5jdGlvbkV4cHJlc3Npb25zSW5QYXJlbnN9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBHaXZlbiBhIGNsYXNzIGRlY2xhcmF0aW9uLCBnZW5lcmF0ZSBhIGNhbGwgdG8gYHNldENsYXNzTWV0YWRhdGFgIHdpdGggdGhlIEFuZ3VsYXIgbWV0YWRhdGFcbiAqIHByZXNlbnQgb24gdGhlIGNsYXNzIG9yIGl0cyBtZW1iZXIgZmllbGRzLlxuICpcbiAqIElmIG5vIHN1Y2ggbWV0YWRhdGEgaXMgcHJlc2VudCwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIGBudWxsYC4gT3RoZXJ3aXNlLCB0aGUgY2FsbCBpcyByZXR1cm5lZFxuICogYXMgYSBgU3RhdGVtZW50YCBmb3IgaW5jbHVzaW9uIGFsb25nIHdpdGggdGhlIGNsYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVTZXRDbGFzc01ldGFkYXRhQ2FsbChcbiAgICBjbGF6ejogRGVjbGFyYXRpb25Ob2RlLCByZWZsZWN0aW9uOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlciwgaXNDb3JlOiBib29sZWFuLFxuICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyPzogYm9vbGVhbik6IFN0YXRlbWVudHxudWxsIHtcbiAgaWYgKCFyZWZsZWN0aW9uLmlzQ2xhc3MoY2xhenopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgaWQgPSByZWZsZWN0aW9uLmdldEFkamFjZW50TmFtZU9mQ2xhc3MoY2xhenopO1xuXG4gIC8vIFJlZmxlY3Qgb3ZlciB0aGUgY2xhc3MgZGVjb3JhdG9ycy4gSWYgbm9uZSBhcmUgcHJlc2VudCwgb3IgdGhvc2UgdGhhdCBhcmUgYXJlbid0IGZyb21cbiAgLy8gQW5ndWxhciwgdGhlbiByZXR1cm4gbnVsbC4gT3RoZXJ3aXNlLCB0dXJuIHRoZW0gaW50byBtZXRhZGF0YS5cbiAgY29uc3QgY2xhc3NEZWNvcmF0b3JzID0gcmVmbGVjdGlvbi5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihjbGF6eik7XG4gIGlmIChjbGFzc0RlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBuZ0NsYXNzRGVjb3JhdG9ycyA9XG4gICAgICBjbGFzc0RlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yLCBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcikpXG4gICAgICAgICAgLy8gU2luY2UgdGhlIGBzZXRDbGFzc01ldGFkYXRhYCBjYWxsIGlzIGludGVuZGVkIHRvIGJlIGVtaXR0ZWQgYWZ0ZXIgdGhlIGNsYXNzXG4gICAgICAgICAgLy8gZGVjbGFyYXRpb24sIHdlIGhhdmUgdG8gc3RyaXAgcmVmZXJlbmNlcyB0byB0aGUgZXhpc3RpbmcgaWRlbnRpZmllcnMgb3JcbiAgICAgICAgICAvLyBUeXBlU2NyaXB0IG1pZ2h0IGdlbmVyYXRlIGludmFsaWQgY29kZSB3aGVuIGl0IGVtaXRzIHRvIEpTLiBJbiBwYXJ0aWN1bGFyXG4gICAgICAgICAgLy8gdGhpcyBjYW4gYnJlYWsgd2hlbiBlbWl0dGluZyBhIGNsYXNzIHRvIEVTNSB3aGljaCBoYXMgYSBjdXN0b20gZGVjb3JhdG9yXG4gICAgICAgICAgLy8gYW5kIGlzIHJlZmVyZW5jZWQgaW5zaWRlIG9mIGl0cyBvd24gbWV0YWRhdGEgKHNlZSAjMzk1MDkgZm9yIG1vcmUgaW5mb3JtYXRpb24pLlxuICAgICAgICAgIC5tYXAoZGVjb3JhdG9yID0+IHJlbW92ZUlkZW50aWZpZXJSZWZlcmVuY2VzKGRlY29yYXRvciwgaWQudGV4dCkpO1xuICBpZiAobmdDbGFzc0RlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgbWV0YURlY29yYXRvcnMgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwobmdDbGFzc0RlY29yYXRvcnMpO1xuXG4gIC8vIENvbnZlcnQgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlcnMgdG8gbWV0YWRhdGEsIHBhc3NpbmcgbnVsbCBpZiBub25lIGFyZSBwcmVzZW50LlxuICBsZXQgbWV0YUN0b3JQYXJhbWV0ZXJzOiBFeHByZXNzaW9uID0gbmV3IExpdGVyYWxFeHByKG51bGwpO1xuICBjb25zdCBjbGFzc0N0b3JQYXJhbWV0ZXJzID0gcmVmbGVjdGlvbi5nZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnMoY2xhenopO1xuICBpZiAoY2xhc3NDdG9yUGFyYW1ldGVycyAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGN0b3JQYXJhbWV0ZXJzID0gY2xhc3NDdG9yUGFyYW1ldGVycy5tYXAoXG4gICAgICAgIHBhcmFtID0+IGN0b3JQYXJhbWV0ZXJUb01ldGFkYXRhKHBhcmFtLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXIsIGlzQ29yZSkpO1xuICAgIG1ldGFDdG9yUGFyYW1ldGVycyA9IG5ldyBGdW5jdGlvbkV4cHIoW10sIFtcbiAgICAgIG5ldyBSZXR1cm5TdGF0ZW1lbnQobmV3IExpdGVyYWxBcnJheUV4cHIoY3RvclBhcmFtZXRlcnMpKSxcbiAgICBdKTtcbiAgfVxuXG4gIC8vIERvIHRoZSBzYW1lIGZvciBwcm9wZXJ0eSBkZWNvcmF0b3JzLlxuICBsZXQgbWV0YVByb3BEZWNvcmF0b3JzOiB0cy5FeHByZXNzaW9uID0gdHMuY3JlYXRlTnVsbCgpO1xuICBjb25zdCBjbGFzc01lbWJlcnMgPSByZWZsZWN0aW9uLmdldE1lbWJlcnNPZkNsYXNzKGNsYXp6KS5maWx0ZXIoXG4gICAgICBtZW1iZXIgPT4gIW1lbWJlci5pc1N0YXRpYyAmJiBtZW1iZXIuZGVjb3JhdG9ycyAhPT0gbnVsbCAmJiBtZW1iZXIuZGVjb3JhdG9ycy5sZW5ndGggPiAwKTtcbiAgY29uc3QgZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMgPVxuICAgICAgY2xhc3NNZW1iZXJzLm1hcChtZW1iZXIgPT4gbWVtYmVyLm5hbWUpLmZpbHRlcigobmFtZSwgaSwgYXJyKSA9PiBhcnIuaW5kZXhPZihuYW1lKSA8IGkpO1xuICBpZiAoZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMubGVuZ3RoID4gMCkge1xuICAgIC8vIFRoaXMgc2hvdWxkIHRoZW9yZXRpY2FsbHkgbmV2ZXIgaGFwcGVuLCBiZWNhdXNlIHRoZSBvbmx5IHdheSB0byBoYXZlIGR1cGxpY2F0ZSBpbnN0YW5jZVxuICAgIC8vIG1lbWJlciBuYW1lcyBpcyBnZXR0ZXIvc2V0dGVyIHBhaXJzIGFuZCBkZWNvcmF0b3JzIGNhbm5vdCBhcHBlYXIgaW4gYm90aCBhIGdldHRlciBhbmQgdGhlXG4gICAgLy8gY29ycmVzcG9uZGluZyBzZXR0ZXIuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRHVwbGljYXRlIGRlY29yYXRlZCBwcm9wZXJ0aWVzIGZvdW5kIG9uIGNsYXNzICcke2NsYXp6Lm5hbWUudGV4dH0nOiBgICtcbiAgICAgICAgZHVwbGljYXRlRGVjb3JhdGVkTWVtYmVyTmFtZXMuam9pbignLCAnKSk7XG4gIH1cbiAgY29uc3QgZGVjb3JhdGVkTWVtYmVycyA9IGNsYXNzTWVtYmVycy5tYXAoXG4gICAgICBtZW1iZXIgPT4gY2xhc3NNZW1iZXJUb01ldGFkYXRhKG1lbWJlci5uYW1lTm9kZSA/PyBtZW1iZXIubmFtZSwgbWVtYmVyLmRlY29yYXRvcnMhLCBpc0NvcmUpKTtcbiAgaWYgKGRlY29yYXRlZE1lbWJlcnMubGVuZ3RoID4gMCkge1xuICAgIG1ldGFQcm9wRGVjb3JhdG9ycyA9IHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoZGVjb3JhdGVkTWVtYmVycyk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZSBhIHB1cmUgY2FsbCB0byBzZXRDbGFzc01ldGFkYXRhIHdpdGggdGhlIGNsYXNzIGlkZW50aWZpZXIgYW5kIGl0cyBtZXRhZGF0YS5cbiAgY29uc3Qgc2V0Q2xhc3NNZXRhZGF0YSA9IG5ldyBFeHRlcm5hbEV4cHIoSWRlbnRpZmllcnMuc2V0Q2xhc3NNZXRhZGF0YSk7XG4gIGNvbnN0IGZuQ2FsbCA9IG5ldyBJbnZva2VGdW5jdGlvbkV4cHIoXG4gICAgICAvKiBmbiAqLyBzZXRDbGFzc01ldGFkYXRhLFxuICAgICAgLyogYXJncyAqL1xuICAgICAgW1xuICAgICAgICBuZXcgV3JhcHBlZE5vZGVFeHByKGlkKSxcbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihtZXRhRGVjb3JhdG9ycyksXG4gICAgICAgIG1ldGFDdG9yUGFyYW1ldGVycyxcbiAgICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihtZXRhUHJvcERlY29yYXRvcnMpLFxuICAgICAgXSk7XG4gIGNvbnN0IGlpZmVGbiA9IG5ldyBGdW5jdGlvbkV4cHIoW10sIFtmbkNhbGwudG9TdG10KCldLCBOT05FX1RZUEUpO1xuICBjb25zdCBpaWZlID0gbmV3IEludm9rZUZ1bmN0aW9uRXhwcihcbiAgICAgIC8qIGZuICovIGlpZmVGbixcbiAgICAgIC8qIGFyZ3MgKi9bXSxcbiAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgLyogc291cmNlU3BhbiAqLyB1bmRlZmluZWQsXG4gICAgICAvKiBwdXJlICovIHRydWUpO1xuICByZXR1cm4gaWlmZS50b1N0bXQoKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGNvbnN0cnVjdG9yIHBhcmFtZXRlciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gY3RvclBhcmFtZXRlclRvTWV0YWRhdGEoXG4gICAgcGFyYW06IEN0b3JQYXJhbWV0ZXIsIGRlZmF1bHRJbXBvcnRSZWNvcmRlcjogRGVmYXVsdEltcG9ydFJlY29yZGVyLFxuICAgIGlzQ29yZTogYm9vbGVhbik6IEV4cHJlc3Npb24ge1xuICAvLyBQYXJhbWV0ZXJzIHNvbWV0aW1lcyBoYXZlIGEgdHlwZSB0aGF0IGNhbiBiZSByZWZlcmVuY2VkLiBJZiBzbywgdGhlbiB1c2UgaXQsIG90aGVyd2lzZVxuICAvLyBpdHMgdHlwZSBpcyB1bmRlZmluZWQuXG4gIGNvbnN0IHR5cGUgPSBwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2Uua2luZCAhPT0gVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSA/XG4gICAgICB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2UsIGRlZmF1bHRJbXBvcnRSZWNvcmRlcikgOlxuICAgICAgbmV3IExpdGVyYWxFeHByKHVuZGVmaW5lZCk7XG5cbiAgY29uc3QgbWFwRW50cmllczoge2tleTogc3RyaW5nLCB2YWx1ZTogRXhwcmVzc2lvbiwgcXVvdGVkOiBmYWxzZX1bXSA9IFtcbiAgICB7a2V5OiAndHlwZScsIHZhbHVlOiB0eXBlLCBxdW90ZWQ6IGZhbHNlfSxcbiAgXTtcblxuICAvLyBJZiB0aGUgcGFyYW1ldGVyIGhhcyBkZWNvcmF0b3JzLCBpbmNsdWRlIHRoZSBvbmVzIGZyb20gQW5ndWxhci5cbiAgaWYgKHBhcmFtLmRlY29yYXRvcnMgIT09IG51bGwpIHtcbiAgICBjb25zdCBuZ0RlY29yYXRvcnMgPSBwYXJhbS5kZWNvcmF0b3JzLmZpbHRlcihkZWMgPT4gaXNBbmd1bGFyRGVjb3JhdG9yKGRlYywgaXNDb3JlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZGVjb3JhdG9yOiBEZWNvcmF0b3IpID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yKSk7XG4gICAgY29uc3QgdmFsdWUgPSBuZXcgV3JhcHBlZE5vZGVFeHByKHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChuZ0RlY29yYXRvcnMpKTtcbiAgICBtYXBFbnRyaWVzLnB1c2goe2tleTogJ2RlY29yYXRvcnMnLCB2YWx1ZSwgcXVvdGVkOiBmYWxzZX0pO1xuICB9XG4gIHJldHVybiBsaXRlcmFsTWFwKG1hcEVudHJpZXMpO1xufVxuXG4vKipcbiAqIENvbnZlcnQgYSByZWZsZWN0ZWQgY2xhc3MgbWVtYmVyIHRvIG1ldGFkYXRhLlxuICovXG5mdW5jdGlvbiBjbGFzc01lbWJlclRvTWV0YWRhdGEoXG4gICAgbmFtZTogdHMuUHJvcGVydHlOYW1lfHN0cmluZywgZGVjb3JhdG9yczogRGVjb3JhdG9yW10sIGlzQ29yZTogYm9vbGVhbik6IHRzLlByb3BlcnR5QXNzaWdubWVudCB7XG4gIGNvbnN0IG5nRGVjb3JhdG9ycyA9IGRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjLCBpc0NvcmUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZGVjb3JhdG9yOiBEZWNvcmF0b3IpID0+IGRlY29yYXRvclRvTWV0YWRhdGEoZGVjb3JhdG9yKSk7XG4gIGNvbnN0IGRlY29yYXRvck1ldGEgPSB0cy5jcmVhdGVBcnJheUxpdGVyYWwobmdEZWNvcmF0b3JzKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChuYW1lLCBkZWNvcmF0b3JNZXRhKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcmVmbGVjdGVkIGRlY29yYXRvciB0byBtZXRhZGF0YS5cbiAqL1xuZnVuY3Rpb24gZGVjb3JhdG9yVG9NZXRhZGF0YShcbiAgICBkZWNvcmF0b3I6IERlY29yYXRvciwgd3JhcEZ1bmN0aW9uc0luUGFyZW5zPzogYm9vbGVhbik6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uIHtcbiAgaWYgKGRlY29yYXRvci5pZGVudGlmaWVyID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbGxlZ2FsIHN0YXRlOiBzeW50aGVzaXplZCBkZWNvcmF0b3IgY2Fubm90IGJlIGVtaXR0ZWQgaW4gY2xhc3MgbWV0YWRhdGEuJyk7XG4gIH1cbiAgLy8gRGVjb3JhdG9ycyBoYXZlIGEgdHlwZS5cbiAgY29uc3QgcHJvcGVydGllczogdHMuT2JqZWN0TGl0ZXJhbEVsZW1lbnRMaWtlW10gPSBbXG4gICAgdHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCd0eXBlJywgdHMuZ2V0TXV0YWJsZUNsb25lKGRlY29yYXRvci5pZGVudGlmaWVyKSksXG4gIF07XG4gIC8vIFNvbWV0aW1lcyB0aGV5IGhhdmUgYXJndW1lbnRzLlxuICBpZiAoZGVjb3JhdG9yLmFyZ3MgIT09IG51bGwgJiYgZGVjb3JhdG9yLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFyZ3MgPSBkZWNvcmF0b3IuYXJncy5tYXAoYXJnID0+IHtcbiAgICAgIGNvbnN0IGV4cHIgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoYXJnKTtcbiAgICAgIHJldHVybiB3cmFwRnVuY3Rpb25zSW5QYXJlbnMgPyB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zKGV4cHIpIDogZXhwcjtcbiAgICB9KTtcbiAgICBwcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdhcmdzJywgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGFyZ3MpKSk7XG4gIH1cbiAgcmV0dXJuIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwocHJvcGVydGllcywgdHJ1ZSk7XG59XG5cbi8qKlxuICogV2hldGhlciBhIGdpdmVuIGRlY29yYXRvciBzaG91bGQgYmUgdHJlYXRlZCBhcyBhbiBBbmd1bGFyIGRlY29yYXRvci5cbiAqXG4gKiBFaXRoZXIgaXQncyB1c2VkIGluIEBhbmd1bGFyL2NvcmUsIG9yIGl0J3MgaW1wb3J0ZWQgZnJvbSB0aGVyZS5cbiAqL1xuZnVuY3Rpb24gaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvcjogRGVjb3JhdG9yLCBpc0NvcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzQ29yZSB8fCAoZGVjb3JhdG9yLmltcG9ydCAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJyk7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgcmVjcmVhdGVzIGFsbCBvZiB0aGUgYElkZW50aWZpZXJgIGRlc2NlbmRhbnQgbm9kZXMgd2l0aCBhIHBhcnRpY3VsYXIgbmFtZSBpbnNpZGVcbiAqIG9mIGFuIEFTVCBub2RlLCB0aHVzIHJlbW92aW5nIGFueSByZWZlcmVuY2VzIHRvIHRoZW0uIFVzZWZ1bCBpZiBhIHBhcnRpY3VsYXIgbm9kZSBoYXMgdG8gYmUgdFxuICogYWtlbiBmcm9tIG9uZSBwbGFjZSBhbnkgZW1pdHRlZCB0byBhbm90aGVyIG9uZSBleGFjdGx5IGFzIGl0IGhhcyBiZWVuIHdyaXR0ZW4uXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUlkZW50aWZpZXJSZWZlcmVuY2VzPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBULCBuYW1lOiBzdHJpbmcpOiBUIHtcbiAgY29uc3QgcmVzdWx0ID0gdHMudHJhbnNmb3JtKFxuICAgICAgbm9kZSwgW2NvbnRleHQgPT4gcm9vdCA9PiB0cy52aXNpdE5vZGUocm9vdCwgZnVuY3Rpb24gd2FsayhjdXJyZW50OiB0cy5Ob2RlKTogdHMuTm9kZSB7XG4gICAgICAgIHJldHVybiB0cy5pc0lkZW50aWZpZXIoY3VycmVudCkgJiYgY3VycmVudC50ZXh0ID09PSBuYW1lID9cbiAgICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoY3VycmVudC50ZXh0KSA6XG4gICAgICAgICAgICB0cy52aXNpdEVhY2hDaGlsZChjdXJyZW50LCB3YWxrLCBjb250ZXh0KTtcbiAgICAgIH0pXSk7XG5cbiAgcmV0dXJuIHJlc3VsdC50cmFuc2Zvcm1lZFswXTtcbn1cbiJdfQ==