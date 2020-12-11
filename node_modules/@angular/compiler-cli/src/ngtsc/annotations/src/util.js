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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/util", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/reflection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createSourceSpan = exports.wrapTypeReference = exports.resolveProvidersRequiringFactory = exports.makeDuplicateDeclarationError = exports.wrapFunctionExpressionsInParens = exports.readBaseClass = exports.isWrappedTsNodeExpr = exports.isExpressionForwardReference = exports.combineResolvers = exports.forwardRefResolver = exports.unwrapForwardRef = exports.unwrapExpression = exports.isAngularDecorator = exports.findAngularDecorator = exports.isAngularCoreReference = exports.isAngularCore = exports.toR3Reference = exports.validateConstructorDependencies = exports.getValidConstructorDependencies = exports.unwrapConstructorDependencies = exports.valueReferenceToExpression = exports.getConstructorDependencies = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    function getConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore) {
        var deps = [];
        var errors = [];
        var ctorParams = reflector.getConstructorParameters(clazz);
        if (ctorParams === null) {
            if (reflector.hasBaseClass(clazz)) {
                return null;
            }
            else {
                ctorParams = [];
            }
        }
        ctorParams.forEach(function (param, idx) {
            var token = valueReferenceToExpression(param.typeValueReference, defaultImportRecorder);
            var attribute = null;
            var optional = false, self = false, skipSelf = false, host = false;
            var resolved = compiler_1.R3ResolvedDependencyType.Token;
            (param.decorators || []).filter(function (dec) { return isCore || isAngularCore(dec); }).forEach(function (dec) {
                var name = isCore || dec.import === null ? dec.name : dec.import.name;
                if (name === 'Inject') {
                    if (dec.args === null || dec.args.length !== 1) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(dec), "Unexpected number of arguments to @Inject().");
                    }
                    token = new compiler_1.WrappedNodeExpr(dec.args[0]);
                }
                else if (name === 'Optional') {
                    optional = true;
                }
                else if (name === 'SkipSelf') {
                    skipSelf = true;
                }
                else if (name === 'Self') {
                    self = true;
                }
                else if (name === 'Host') {
                    host = true;
                }
                else if (name === 'Attribute') {
                    if (dec.args === null || dec.args.length !== 1) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(dec), "Unexpected number of arguments to @Attribute().");
                    }
                    var attributeName = dec.args[0];
                    token = new compiler_1.WrappedNodeExpr(attributeName);
                    if (ts.isStringLiteralLike(attributeName)) {
                        attribute = new compiler_1.LiteralExpr(attributeName.text);
                    }
                    else {
                        attribute = new compiler_1.WrappedNodeExpr(ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword));
                    }
                    resolved = compiler_1.R3ResolvedDependencyType.Attribute;
                }
                else {
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_UNEXPECTED, reflection_1.Decorator.nodeForError(dec), "Unexpected decorator " + name + " on parameter.");
                }
            });
            if (token instanceof compiler_1.ExternalExpr && token.value.name === 'ChangeDetectorRef' &&
                token.value.moduleName === '@angular/core') {
                resolved = compiler_1.R3ResolvedDependencyType.ChangeDetectorRef;
            }
            if (token === null) {
                if (param.typeValueReference.kind !== 2 /* UNAVAILABLE */) {
                    throw new Error('Illegal state: expected value reference to be unavailable if no token is present');
                }
                errors.push({
                    index: idx,
                    param: param,
                    reason: param.typeValueReference.reason,
                });
            }
            else {
                deps.push({ token: token, attribute: attribute, optional: optional, self: self, skipSelf: skipSelf, host: host, resolved: resolved });
            }
        });
        if (errors.length === 0) {
            return { deps: deps };
        }
        else {
            return { deps: null, errors: errors };
        }
    }
    exports.getConstructorDependencies = getConstructorDependencies;
    function valueReferenceToExpression(valueRef, defaultImportRecorder) {
        var e_1, _a;
        if (valueRef.kind === 2 /* UNAVAILABLE */) {
            return null;
        }
        else if (valueRef.kind === 0 /* LOCAL */) {
            if (defaultImportRecorder !== null && valueRef.defaultImportStatement !== null &&
                ts.isIdentifier(valueRef.expression)) {
                defaultImportRecorder.recordImportedIdentifier(valueRef.expression, valueRef.defaultImportStatement);
            }
            return new compiler_1.WrappedNodeExpr(valueRef.expression);
        }
        else {
            var importExpr = new compiler_1.ExternalExpr({ moduleName: valueRef.moduleName, name: valueRef.importedName });
            if (valueRef.nestedPath !== null) {
                try {
                    for (var _b = tslib_1.__values(valueRef.nestedPath), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var property = _c.value;
                        importExpr = new compiler_1.ReadPropExpr(importExpr, property);
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
            return importExpr;
        }
    }
    exports.valueReferenceToExpression = valueReferenceToExpression;
    /**
     * Convert `ConstructorDeps` into the `R3DependencyMetadata` array for those deps if they're valid,
     * or into an `'invalid'` signal if they're not.
     *
     * This is a companion function to `validateConstructorDependencies` which accepts invalid deps.
     */
    function unwrapConstructorDependencies(deps) {
        if (deps === null) {
            return null;
        }
        else if (deps.deps !== null) {
            // These constructor dependencies are valid.
            return deps.deps;
        }
        else {
            // These deps are invalid.
            return 'invalid';
        }
    }
    exports.unwrapConstructorDependencies = unwrapConstructorDependencies;
    function getValidConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore) {
        return validateConstructorDependencies(clazz, getConstructorDependencies(clazz, reflector, defaultImportRecorder, isCore));
    }
    exports.getValidConstructorDependencies = getValidConstructorDependencies;
    /**
     * Validate that `ConstructorDeps` does not have any invalid dependencies and convert them into the
     * `R3DependencyMetadata` array if so, or raise a diagnostic if some deps are invalid.
     *
     * This is a companion function to `unwrapConstructorDependencies` which does not accept invalid
     * deps.
     */
    function validateConstructorDependencies(clazz, deps) {
        if (deps === null) {
            return null;
        }
        else if (deps.deps !== null) {
            return deps.deps;
        }
        else {
            // TODO(alxhub): this cast is necessary because the g3 typescript version doesn't narrow here.
            // There is at least one error.
            var error = deps.errors[0];
            throw createUnsuitableInjectionTokenError(clazz, error);
        }
    }
    exports.validateConstructorDependencies = validateConstructorDependencies;
    /**
     * Creates a fatal error with diagnostic for an invalid injection token.
     * @param clazz The class for which the injection token was unavailable.
     * @param error The reason why no valid injection token is available.
     */
    function createUnsuitableInjectionTokenError(clazz, error) {
        var param = error.param, index = error.index, reason = error.reason;
        var chainMessage = undefined;
        var hints = undefined;
        switch (reason.kind) {
            case 5 /* UNSUPPORTED */:
                chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
                hints = [
                    diagnostics_1.makeRelatedInformation(reason.typeNode, 'This type is not supported as injection token.'),
                ];
                break;
            case 1 /* NO_VALUE_DECLARATION */:
                chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
                hints = [
                    diagnostics_1.makeRelatedInformation(reason.typeNode, 'This type does not have a value, so it cannot be used as injection token.'),
                ];
                if (reason.decl !== null) {
                    hints.push(diagnostics_1.makeRelatedInformation(reason.decl, 'The type is declared here.'));
                }
                break;
            case 2 /* TYPE_ONLY_IMPORT */:
                chainMessage =
                    'Consider changing the type-only import to a regular import, or use the @Inject decorator to specify an injection token.';
                hints = [
                    diagnostics_1.makeRelatedInformation(reason.typeNode, 'This type is imported using a type-only import, which prevents it from being usable as an injection token.'),
                    diagnostics_1.makeRelatedInformation(reason.importClause, 'The type-only import occurs here.'),
                ];
                break;
            case 4 /* NAMESPACE */:
                chainMessage = 'Consider using the @Inject decorator to specify an injection token.';
                hints = [
                    diagnostics_1.makeRelatedInformation(reason.typeNode, 'This type corresponds with a namespace, which cannot be used as injection token.'),
                    diagnostics_1.makeRelatedInformation(reason.importClause, 'The namespace import occurs here.'),
                ];
                break;
            case 3 /* UNKNOWN_REFERENCE */:
                chainMessage = 'The type should reference a known declaration.';
                hints = [diagnostics_1.makeRelatedInformation(reason.typeNode, 'This type could not be resolved.')];
                break;
            case 0 /* MISSING_TYPE */:
                chainMessage =
                    'Consider adding a type to the parameter or use the @Inject decorator to specify an injection token.';
                break;
        }
        var chain = {
            messageText: "No suitable injection token for parameter '" + (param.name || index) + "' of class '" + clazz.name.text + "'.",
            category: ts.DiagnosticCategory.Error,
            code: 0,
            next: [{
                    messageText: chainMessage,
                    category: ts.DiagnosticCategory.Message,
                    code: 0,
                }],
        };
        return new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.PARAM_MISSING_TOKEN, param.nameNode, chain, hints);
    }
    function toR3Reference(valueRef, typeRef, valueContext, typeContext, refEmitter) {
        var value = refEmitter.emit(valueRef, valueContext);
        var type = refEmitter.emit(typeRef, typeContext, imports_1.ImportFlags.ForceNewImport | imports_1.ImportFlags.AllowTypeImports);
        if (value === null || type === null) {
            throw new Error("Could not refer to " + ts.SyntaxKind[valueRef.node.kind]);
        }
        return { value: value, type: type };
    }
    exports.toR3Reference = toR3Reference;
    function isAngularCore(decorator) {
        return decorator.import !== null && decorator.import.from === '@angular/core';
    }
    exports.isAngularCore = isAngularCore;
    function isAngularCoreReference(reference, symbolName) {
        return reference.ownedByModuleGuess === '@angular/core' && reference.debugName === symbolName;
    }
    exports.isAngularCoreReference = isAngularCoreReference;
    function findAngularDecorator(decorators, name, isCore) {
        return decorators.find(function (decorator) { return isAngularDecorator(decorator, name, isCore); });
    }
    exports.findAngularDecorator = findAngularDecorator;
    function isAngularDecorator(decorator, name, isCore) {
        if (isCore) {
            return decorator.name === name;
        }
        else if (isAngularCore(decorator)) {
            return decorator.import.name === name;
        }
        return false;
    }
    exports.isAngularDecorator = isAngularDecorator;
    /**
     * Unwrap a `ts.Expression`, removing outer type-casts or parentheses until the expression is in its
     * lowest level form.
     *
     * For example, the expression "(foo as Type)" unwraps to "foo".
     */
    function unwrapExpression(node) {
        while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
            node = node.expression;
        }
        return node;
    }
    exports.unwrapExpression = unwrapExpression;
    function expandForwardRef(arg) {
        arg = unwrapExpression(arg);
        if (!ts.isArrowFunction(arg) && !ts.isFunctionExpression(arg)) {
            return null;
        }
        var body = arg.body;
        // Either the body is a ts.Expression directly, or a block with a single return statement.
        if (ts.isBlock(body)) {
            // Block body - look for a single return statement.
            if (body.statements.length !== 1) {
                return null;
            }
            var stmt = body.statements[0];
            if (!ts.isReturnStatement(stmt) || stmt.expression === undefined) {
                return null;
            }
            return stmt.expression;
        }
        else {
            // Shorthand body - return as an expression.
            return body;
        }
    }
    /**
     * Possibly resolve a forwardRef() expression into the inner value.
     *
     * @param node the forwardRef() expression to resolve
     * @param reflector a ReflectionHost
     * @returns the resolved expression, if the original expression was a forwardRef(), or the original
     * expression otherwise
     */
    function unwrapForwardRef(node, reflector) {
        node = unwrapExpression(node);
        if (!ts.isCallExpression(node) || node.arguments.length !== 1) {
            return node;
        }
        var fn = ts.isPropertyAccessExpression(node.expression) ? node.expression.name : node.expression;
        if (!ts.isIdentifier(fn)) {
            return node;
        }
        var expr = expandForwardRef(node.arguments[0]);
        if (expr === null) {
            return node;
        }
        var imp = reflector.getImportOfIdentifier(fn);
        if (imp === null || imp.from !== '@angular/core' || imp.name !== 'forwardRef') {
            return node;
        }
        else {
            return expr;
        }
    }
    exports.unwrapForwardRef = unwrapForwardRef;
    /**
     * A foreign function resolver for `staticallyResolve` which unwraps forwardRef() expressions.
     *
     * @param ref a Reference to the declaration of the function being called (which might be
     * forwardRef)
     * @param args the arguments to the invocation of the forwardRef expression
     * @returns an unwrapped argument if `ref` pointed to forwardRef, or null otherwise
     */
    function forwardRefResolver(ref, args) {
        if (!isAngularCoreReference(ref, 'forwardRef') || args.length !== 1) {
            return null;
        }
        return expandForwardRef(args[0]);
    }
    exports.forwardRefResolver = forwardRefResolver;
    /**
     * Combines an array of resolver functions into a one.
     * @param resolvers Resolvers to be combined.
     */
    function combineResolvers(resolvers) {
        return function (ref, args) {
            var e_2, _a;
            try {
                for (var resolvers_1 = tslib_1.__values(resolvers), resolvers_1_1 = resolvers_1.next(); !resolvers_1_1.done; resolvers_1_1 = resolvers_1.next()) {
                    var resolver = resolvers_1_1.value;
                    var resolved = resolver(ref, args);
                    if (resolved !== null) {
                        return resolved;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (resolvers_1_1 && !resolvers_1_1.done && (_a = resolvers_1.return)) _a.call(resolvers_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return null;
        };
    }
    exports.combineResolvers = combineResolvers;
    function isExpressionForwardReference(expr, context, contextSource) {
        if (isWrappedTsNodeExpr(expr)) {
            var node = ts.getOriginalNode(expr.node);
            return node.getSourceFile() === contextSource && context.pos < node.pos;
        }
        else {
            return false;
        }
    }
    exports.isExpressionForwardReference = isExpressionForwardReference;
    function isWrappedTsNodeExpr(expr) {
        return expr instanceof compiler_1.WrappedNodeExpr;
    }
    exports.isWrappedTsNodeExpr = isWrappedTsNodeExpr;
    function readBaseClass(node, reflector, evaluator) {
        var baseExpression = reflector.getBaseClassExpression(node);
        if (baseExpression !== null) {
            var baseClass = evaluator.evaluate(baseExpression);
            if (baseClass instanceof imports_1.Reference && reflector.isClass(baseClass.node)) {
                return baseClass;
            }
            else {
                return 'dynamic';
            }
        }
        return null;
    }
    exports.readBaseClass = readBaseClass;
    var parensWrapperTransformerFactory = function (context) {
        var visitor = function (node) {
            var visited = ts.visitEachChild(node, visitor, context);
            if (ts.isArrowFunction(visited) || ts.isFunctionExpression(visited)) {
                return ts.createParen(visited);
            }
            return visited;
        };
        return function (node) { return ts.visitEachChild(node, visitor, context); };
    };
    /**
     * Wraps all functions in a given expression in parentheses. This is needed to avoid problems
     * where Tsickle annotations added between analyse and transform phases in Angular may trigger
     * automatic semicolon insertion, e.g. if a function is the expression in a `return` statement.
     * More
     * info can be found in Tsickle source code here:
     * https://github.com/angular/tsickle/blob/d7974262571c8a17d684e5ba07680e1b1993afdd/src/jsdoc_transformer.ts#L1021
     *
     * @param expression Expression where functions should be wrapped in parentheses
     */
    function wrapFunctionExpressionsInParens(expression) {
        return ts.transform(expression, [parensWrapperTransformerFactory]).transformed[0];
    }
    exports.wrapFunctionExpressionsInParens = wrapFunctionExpressionsInParens;
    /**
     * Create a `ts.Diagnostic` which indicates the given class is part of the declarations of two or
     * more NgModules.
     *
     * The resulting `ts.Diagnostic` will have a context entry for each NgModule showing the point where
     * the directive/pipe exists in its `declarations` (if possible).
     */
    function makeDuplicateDeclarationError(node, data, kind) {
        var e_3, _a;
        var context = [];
        try {
            for (var data_1 = tslib_1.__values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
                var decl = data_1_1.value;
                if (decl.rawDeclarations === null) {
                    continue;
                }
                // Try to find the reference to the declaration within the declarations array, to hang the
                // error there. If it can't be found, fall back on using the NgModule's name.
                var contextNode = decl.ref.getOriginForDiagnostics(decl.rawDeclarations, decl.ngModule.name);
                context.push(diagnostics_1.makeRelatedInformation(contextNode, "'" + node.name.text + "' is listed in the declarations of the NgModule '" + decl.ngModule.name.text + "'."));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        // Finally, produce the diagnostic.
        return diagnostics_1.makeDiagnostic(diagnostics_1.ErrorCode.NGMODULE_DECLARATION_NOT_UNIQUE, node.name, "The " + kind + " '" + node.name.text + "' is declared by more than one NgModule.", context);
    }
    exports.makeDuplicateDeclarationError = makeDuplicateDeclarationError;
    /**
     * Resolves the given `rawProviders` into `ClassDeclarations` and returns
     * a set containing those that are known to require a factory definition.
     * @param rawProviders Expression that declared the providers array in the source.
     */
    function resolveProvidersRequiringFactory(rawProviders, reflector, evaluator) {
        var providers = new Set();
        var resolvedProviders = evaluator.evaluate(rawProviders);
        if (!Array.isArray(resolvedProviders)) {
            return providers;
        }
        resolvedProviders.forEach(function processProviders(provider) {
            var tokenClass = null;
            if (Array.isArray(provider)) {
                // If we ran into an array, recurse into it until we've resolve all the classes.
                provider.forEach(processProviders);
            }
            else if (provider instanceof imports_1.Reference) {
                tokenClass = provider;
            }
            else if (provider instanceof Map && provider.has('useClass') && !provider.has('deps')) {
                var useExisting = provider.get('useClass');
                if (useExisting instanceof imports_1.Reference) {
                    tokenClass = useExisting;
                }
            }
            if (tokenClass !== null && reflector.isClass(tokenClass.node)) {
                var constructorParameters = reflector.getConstructorParameters(tokenClass.node);
                // Note that we only want to capture providers with a non-trivial constructor,
                // because they're the ones that might be using DI and need to be decorated.
                if (constructorParameters !== null && constructorParameters.length > 0) {
                    providers.add(tokenClass);
                }
            }
        });
        return providers;
    }
    exports.resolveProvidersRequiringFactory = resolveProvidersRequiringFactory;
    /**
     * Create an R3Reference for a class.
     *
     * The `value` is the exported declaration of the class from its source file.
     * The `type` is an expression that would be used by ngcc in the typings (.d.ts) files.
     */
    function wrapTypeReference(reflector, clazz) {
        var dtsClass = reflector.getDtsDeclaration(clazz);
        var value = new compiler_1.WrappedNodeExpr(clazz.name);
        var type = dtsClass !== null && reflection_1.isNamedClassDeclaration(dtsClass) ?
            new compiler_1.WrappedNodeExpr(dtsClass.name) :
            value;
        return { value: value, type: type };
    }
    exports.wrapTypeReference = wrapTypeReference;
    /** Creates a ParseSourceSpan for a TypeScript node. */
    function createSourceSpan(node) {
        var sf = node.getSourceFile();
        var _a = tslib_1.__read([node.getStart(), node.getEnd()], 2), startOffset = _a[0], endOffset = _a[1];
        var _b = sf.getLineAndCharacterOfPosition(startOffset), startLine = _b.line, startCol = _b.character;
        var _c = sf.getLineAndCharacterOfPosition(endOffset), endLine = _c.line, endCol = _c.character;
        var parseSf = new compiler_1.ParseSourceFile(sf.getFullText(), sf.fileName);
        // +1 because values are zero-indexed.
        return new compiler_1.ParseSourceSpan(new compiler_1.ParseLocation(parseSf, startOffset, startLine + 1, startCol + 1), new compiler_1.ParseLocation(parseSf, endOffset, endLine + 1, endCol + 1));
    }
    exports.createSourceSpan = createSourceSpan;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFxTjtJQUNyTiwrQkFBaUM7SUFFakMsMkVBQTBHO0lBQzFHLG1FQUE4RjtJQUU5Rix5RUFBc1E7SUFnQnRRLFNBQWdCLDBCQUEwQixDQUN0QyxLQUF1QixFQUFFLFNBQXlCLEVBQ2xELHFCQUE0QyxFQUFFLE1BQWU7UUFDL0QsSUFBTSxJQUFJLEdBQTJCLEVBQUUsQ0FBQztRQUN4QyxJQUFNLE1BQU0sR0FBMEIsRUFBRSxDQUFDO1FBQ3pDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLElBQUksQ0FBQzthQUNiO2lCQUFNO2dCQUNMLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDakI7U0FDRjtRQUNELFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRztZQUM1QixJQUFJLEtBQUssR0FBRywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUN4RixJQUFJLFNBQVMsR0FBb0IsSUFBSSxDQUFDO1lBQ3RDLElBQUksUUFBUSxHQUFHLEtBQUssRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLFFBQVEsR0FBRyxLQUFLLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNuRSxJQUFJLFFBQVEsR0FBRyxtQ0FBd0IsQ0FBQyxLQUFLLENBQUM7WUFFOUMsQ0FBQyxLQUFLLENBQUMsVUFB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QUFDLEVBQS9FLFNBQVMsVUFBQSxFQUFhLFFBQVEsZUFBaUQsQ0FBQztRQUN2RixJQUFBLEtBQXFDLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsRUFBekUsT0FBTyxVQUFBLEVBQWEsTUFBTSxlQUErQyxDQUFDO1FBQ3ZGLElBQU0sT0FBTyxHQUFHLElBQUksMEJBQWUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5FLHNDQUFzQztRQUN0QyxPQUFPLElBQUksMEJBQWUsQ0FDdEIsSUFBSSx3QkFBYSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQ3BFLElBQUksd0JBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQVhELDRDQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBMaXRlcmFsRXhwciwgUGFyc2VMb2NhdGlvbiwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZVNvdXJjZVNwYW4sIFIzRGVwZW5kZW5jeU1ldGFkYXRhLCBSM1JlZmVyZW5jZSwgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlLCBSZWFkUHJvcEV4cHIsIFdyYXBwZWROb2RlRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvciwgbWFrZURpYWdub3N0aWMsIG1ha2VSZWxhdGVkSW5mb3JtYXRpb259IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7RGVmYXVsdEltcG9ydFJlY29yZGVyLCBJbXBvcnRGbGFncywgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Rm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIsIFBhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4uLy4uL3BhcnRpYWxfZXZhbHVhdG9yJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgQ3RvclBhcmFtZXRlciwgRGVjb3JhdG9yLCBJbXBvcnQsIEltcG9ydGVkVHlwZVZhbHVlUmVmZXJlbmNlLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgTG9jYWxUeXBlVmFsdWVSZWZlcmVuY2UsIFJlZmxlY3Rpb25Ib3N0LCBUeXBlVmFsdWVSZWZlcmVuY2UsIFR5cGVWYWx1ZVJlZmVyZW5jZUtpbmQsIFVuYXZhaWxhYmxlVmFsdWUsIFZhbHVlVW5hdmFpbGFibGVLaW5kfSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7RGVjbGFyYXRpb25EYXRhfSBmcm9tICcuLi8uLi9zY29wZSc7XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yRGVwcyA9IHtcbiAgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXTtcbn18e1xuICBkZXBzOiBudWxsO1xuICBlcnJvcnM6IENvbnN0cnVjdG9yRGVwRXJyb3JbXTtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uc3RydWN0b3JEZXBFcnJvciB7XG4gIGluZGV4OiBudW1iZXI7XG4gIHBhcmFtOiBDdG9yUGFyYW1ldGVyO1xuICByZWFzb246IFVuYXZhaWxhYmxlVmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlciwgaXNDb3JlOiBib29sZWFuKTogQ29uc3RydWN0b3JEZXBzfG51bGwge1xuICBjb25zdCBkZXBzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdID0gW107XG4gIGNvbnN0IGVycm9yczogQ29uc3RydWN0b3JEZXBFcnJvcltdID0gW107XG4gIGxldCBjdG9yUGFyYW1zID0gcmVmbGVjdG9yLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyhjbGF6eik7XG4gIGlmIChjdG9yUGFyYW1zID09PSBudWxsKSB7XG4gICAgaWYgKHJlZmxlY3Rvci5oYXNCYXNlQ2xhc3MoY2xhenopKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgY3RvclBhcmFtcyA9IFtdO1xuICAgIH1cbiAgfVxuICBjdG9yUGFyYW1zLmZvckVhY2goKHBhcmFtLCBpZHgpID0+IHtcbiAgICBsZXQgdG9rZW4gPSB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2UsIGRlZmF1bHRJbXBvcnRSZWNvcmRlcik7XG4gICAgbGV0IGF0dHJpYnV0ZTogRXhwcmVzc2lvbnxudWxsID0gbnVsbDtcbiAgICBsZXQgb3B0aW9uYWwgPSBmYWxzZSwgc2VsZiA9IGZhbHNlLCBza2lwU2VsZiA9IGZhbHNlLCBob3N0ID0gZmFsc2U7XG4gICAgbGV0IHJlc29sdmVkID0gUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlLlRva2VuO1xuXG4gICAgKHBhcmFtLmRlY29yYXRvcnMgfHwgW10pLmZpbHRlcihkZWMgPT4gaXNDb3JlIHx8IGlzQW5ndWxhckNvcmUoZGVjKSkuZm9yRWFjaChkZWMgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IGlzQ29yZSB8fCBkZWMuaW1wb3J0ID09PSBudWxsID8gZGVjLm5hbWUgOiBkZWMuaW1wb3J0IS5uYW1lO1xuICAgICAgaWYgKG5hbWUgPT09ICdJbmplY3QnKSB7XG4gICAgICAgIGlmIChkZWMuYXJncyA9PT0gbnVsbCB8fCBkZWMuYXJncy5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJJVFlfV1JPTkcsIERlY29yYXRvci5ub2RlRm9yRXJyb3IoZGVjKSxcbiAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBASW5qZWN0KCkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW4gPSBuZXcgV3JhcHBlZE5vZGVFeHByKGRlYy5hcmdzWzBdKTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ09wdGlvbmFsJykge1xuICAgICAgICBvcHRpb25hbCA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdTa2lwU2VsZicpIHtcbiAgICAgICAgc2tpcFNlbGYgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnU2VsZicpIHtcbiAgICAgICAgc2VsZiA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdIb3N0Jykge1xuICAgICAgICBob3N0ID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ0F0dHJpYnV0ZScpIHtcbiAgICAgICAgaWYgKGRlYy5hcmdzID09PSBudWxsIHx8IGRlYy5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUklUWV9XUk9ORywgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWMpLFxuICAgICAgICAgICAgICBgVW5leHBlY3RlZCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIEBBdHRyaWJ1dGUoKS5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdHRyaWJ1dGVOYW1lID0gZGVjLmFyZ3NbMF07XG4gICAgICAgIHRva2VuID0gbmV3IFdyYXBwZWROb2RlRXhwcihhdHRyaWJ1dGVOYW1lKTtcbiAgICAgICAgaWYgKHRzLmlzU3RyaW5nTGl0ZXJhbExpa2UoYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgICAgICBhdHRyaWJ1dGUgPSBuZXcgTGl0ZXJhbEV4cHIoYXR0cmlidXRlTmFtZS50ZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyaWJ1dGUgPSBuZXcgV3JhcHBlZE5vZGVFeHByKHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLlVua25vd25LZXl3b3JkKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzb2x2ZWQgPSBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUuQXR0cmlidXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9VTkVYUEVDVEVELCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlYyksXG4gICAgICAgICAgICBgVW5leHBlY3RlZCBkZWNvcmF0b3IgJHtuYW1lfSBvbiBwYXJhbWV0ZXIuYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBFeHRlcm5hbEV4cHIgJiYgdG9rZW4udmFsdWUubmFtZSA9PT0gJ0NoYW5nZURldGVjdG9yUmVmJyAmJlxuICAgICAgICB0b2tlbi52YWx1ZS5tb2R1bGVOYW1lID09PSAnQGFuZ3VsYXIvY29yZScpIHtcbiAgICAgIHJlc29sdmVkID0gUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlLkNoYW5nZURldGVjdG9yUmVmO1xuICAgIH1cbiAgICBpZiAodG9rZW4gPT09IG51bGwpIHtcbiAgICAgIGlmIChwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2Uua2luZCAhPT0gVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5VTkFWQUlMQUJMRSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnSWxsZWdhbCBzdGF0ZTogZXhwZWN0ZWQgdmFsdWUgcmVmZXJlbmNlIHRvIGJlIHVuYXZhaWxhYmxlIGlmIG5vIHRva2VuIGlzIHByZXNlbnQnKTtcbiAgICAgIH1cbiAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgaW5kZXg6IGlkeCxcbiAgICAgICAgcGFyYW0sXG4gICAgICAgIHJlYXNvbjogcGFyYW0udHlwZVZhbHVlUmVmZXJlbmNlLnJlYXNvbixcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZXBzLnB1c2goe3Rva2VuLCBhdHRyaWJ1dGUsIG9wdGlvbmFsLCBzZWxmLCBza2lwU2VsZiwgaG9zdCwgcmVzb2x2ZWR9KTtcbiAgICB9XG4gIH0pO1xuICBpZiAoZXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB7ZGVwc307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHtkZXBzOiBudWxsLCBlcnJvcnN9O1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBhIGBUeXBlVmFsdWVSZWZlcmVuY2VgIHRvIGFuIGBFeHByZXNzaW9uYCB3aGljaCByZWZlcnMgdG8gdGhlIHR5cGUgYXMgYSB2YWx1ZS5cbiAqXG4gKiBMb2NhbCByZWZlcmVuY2VzIGFyZSBjb252ZXJ0ZWQgdG8gYSBgV3JhcHBlZE5vZGVFeHByYCBvZiB0aGUgVHlwZVNjcmlwdCBleHByZXNzaW9uLCBhbmQgbm9uLWxvY2FsXG4gKiByZWZlcmVuY2VzIGFyZSBjb252ZXJ0ZWQgdG8gYW4gYEV4dGVybmFsRXhwcmAuIE5vdGUgdGhhdCB0aGlzIGlzIG9ubHkgdmFsaWQgaW4gdGhlIGNvbnRleHQgb2YgdGhlXG4gKiBmaWxlIGluIHdoaWNoIHRoZSBgVHlwZVZhbHVlUmVmZXJlbmNlYCBvcmlnaW5hdGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsdWVSZWZlcmVuY2VUb0V4cHJlc3Npb24oXG4gICAgdmFsdWVSZWY6IExvY2FsVHlwZVZhbHVlUmVmZXJlbmNlfEltcG9ydGVkVHlwZVZhbHVlUmVmZXJlbmNlLFxuICAgIGRlZmF1bHRJbXBvcnRSZWNvcmRlcjogRGVmYXVsdEltcG9ydFJlY29yZGVyKTogRXhwcmVzc2lvbjtcbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihcbiAgICB2YWx1ZVJlZjogVHlwZVZhbHVlUmVmZXJlbmNlLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlcik6IEV4cHJlc3Npb258bnVsbDtcbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbihcbiAgICB2YWx1ZVJlZjogVHlwZVZhbHVlUmVmZXJlbmNlLCBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlcik6IEV4cHJlc3Npb258bnVsbCB7XG4gIGlmICh2YWx1ZVJlZi5raW5kID09PSBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLlVOQVZBSUxBQkxFKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAodmFsdWVSZWYua2luZCA9PT0gVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5MT0NBTCkge1xuICAgIGlmIChkZWZhdWx0SW1wb3J0UmVjb3JkZXIgIT09IG51bGwgJiYgdmFsdWVSZWYuZGVmYXVsdEltcG9ydFN0YXRlbWVudCAhPT0gbnVsbCAmJlxuICAgICAgICB0cy5pc0lkZW50aWZpZXIodmFsdWVSZWYuZXhwcmVzc2lvbikpIHtcbiAgICAgIGRlZmF1bHRJbXBvcnRSZWNvcmRlci5yZWNvcmRJbXBvcnRlZElkZW50aWZpZXIoXG4gICAgICAgICAgdmFsdWVSZWYuZXhwcmVzc2lvbiwgdmFsdWVSZWYuZGVmYXVsdEltcG9ydFN0YXRlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgV3JhcHBlZE5vZGVFeHByKHZhbHVlUmVmLmV4cHJlc3Npb24pO1xuICB9IGVsc2Uge1xuICAgIGxldCBpbXBvcnRFeHByOiBFeHByZXNzaW9uID1cbiAgICAgICAgbmV3IEV4dGVybmFsRXhwcih7bW9kdWxlTmFtZTogdmFsdWVSZWYubW9kdWxlTmFtZSwgbmFtZTogdmFsdWVSZWYuaW1wb3J0ZWROYW1lfSk7XG4gICAgaWYgKHZhbHVlUmVmLm5lc3RlZFBhdGggIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgdmFsdWVSZWYubmVzdGVkUGF0aCkge1xuICAgICAgICBpbXBvcnRFeHByID0gbmV3IFJlYWRQcm9wRXhwcihpbXBvcnRFeHByLCBwcm9wZXJ0eSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbXBvcnRFeHByO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBgQ29uc3RydWN0b3JEZXBzYCBpbnRvIHRoZSBgUjNEZXBlbmRlbmN5TWV0YWRhdGFgIGFycmF5IGZvciB0aG9zZSBkZXBzIGlmIHRoZXkncmUgdmFsaWQsXG4gKiBvciBpbnRvIGFuIGAnaW52YWxpZCdgIHNpZ25hbCBpZiB0aGV5J3JlIG5vdC5cbiAqXG4gKiBUaGlzIGlzIGEgY29tcGFuaW9uIGZ1bmN0aW9uIHRvIGB2YWxpZGF0ZUNvbnN0cnVjdG9yRGVwZW5kZW5jaWVzYCB3aGljaCBhY2NlcHRzIGludmFsaWQgZGVwcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKGRlcHM6IENvbnN0cnVjdG9yRGVwc3xudWxsKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxcbiAgICAnaW52YWxpZCd8bnVsbCB7XG4gIGlmIChkZXBzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoZGVwcy5kZXBzICE9PSBudWxsKSB7XG4gICAgLy8gVGhlc2UgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGFyZSB2YWxpZC5cbiAgICByZXR1cm4gZGVwcy5kZXBzO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZXNlIGRlcHMgYXJlIGludmFsaWQuXG4gICAgcmV0dXJuICdpbnZhbGlkJztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsaWRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlciwgaXNDb3JlOiBib29sZWFuKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsIHtcbiAgcmV0dXJuIHZhbGlkYXRlQ29uc3RydWN0b3JEZXBlbmRlbmNpZXMoXG4gICAgICBjbGF6eiwgZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMoY2xhenosIHJlZmxlY3RvciwgZGVmYXVsdEltcG9ydFJlY29yZGVyLCBpc0NvcmUpKTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGF0IGBDb25zdHJ1Y3RvckRlcHNgIGRvZXMgbm90IGhhdmUgYW55IGludmFsaWQgZGVwZW5kZW5jaWVzIGFuZCBjb252ZXJ0IHRoZW0gaW50byB0aGVcbiAqIGBSM0RlcGVuZGVuY3lNZXRhZGF0YWAgYXJyYXkgaWYgc28sIG9yIHJhaXNlIGEgZGlhZ25vc3RpYyBpZiBzb21lIGRlcHMgYXJlIGludmFsaWQuXG4gKlxuICogVGhpcyBpcyBhIGNvbXBhbmlvbiBmdW5jdGlvbiB0byBgdW53cmFwQ29uc3RydWN0b3JEZXBlbmRlbmNpZXNgIHdoaWNoIGRvZXMgbm90IGFjY2VwdCBpbnZhbGlkXG4gKiBkZXBzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgZGVwczogQ29uc3RydWN0b3JEZXBzfG51bGwpOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdfG51bGwge1xuICBpZiAoZGVwcyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2UgaWYgKGRlcHMuZGVwcyAhPT0gbnVsbCkge1xuICAgIHJldHVybiBkZXBzLmRlcHM7XG4gIH0gZWxzZSB7XG4gICAgLy8gVE9ETyhhbHhodWIpOiB0aGlzIGNhc3QgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGczIHR5cGVzY3JpcHQgdmVyc2lvbiBkb2Vzbid0IG5hcnJvdyBoZXJlLlxuICAgIC8vIFRoZXJlIGlzIGF0IGxlYXN0IG9uZSBlcnJvci5cbiAgICBjb25zdCBlcnJvciA9IChkZXBzIGFzIHtlcnJvcnM6IENvbnN0cnVjdG9yRGVwRXJyb3JbXX0pLmVycm9yc1swXTtcbiAgICB0aHJvdyBjcmVhdGVVbnN1aXRhYmxlSW5qZWN0aW9uVG9rZW5FcnJvcihjbGF6eiwgZXJyb3IpO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZhdGFsIGVycm9yIHdpdGggZGlhZ25vc3RpYyBmb3IgYW4gaW52YWxpZCBpbmplY3Rpb24gdG9rZW4uXG4gKiBAcGFyYW0gY2xhenogVGhlIGNsYXNzIGZvciB3aGljaCB0aGUgaW5qZWN0aW9uIHRva2VuIHdhcyB1bmF2YWlsYWJsZS5cbiAqIEBwYXJhbSBlcnJvciBUaGUgcmVhc29uIHdoeSBubyB2YWxpZCBpbmplY3Rpb24gdG9rZW4gaXMgYXZhaWxhYmxlLlxuICovXG5mdW5jdGlvbiBjcmVhdGVVbnN1aXRhYmxlSW5qZWN0aW9uVG9rZW5FcnJvcihcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgZXJyb3I6IENvbnN0cnVjdG9yRGVwRXJyb3IpOiBGYXRhbERpYWdub3N0aWNFcnJvciB7XG4gIGNvbnN0IHtwYXJhbSwgaW5kZXgsIHJlYXNvbn0gPSBlcnJvcjtcbiAgbGV0IGNoYWluTWVzc2FnZTogc3RyaW5nfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgbGV0IGhpbnRzOiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW118dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICBzd2l0Y2ggKHJlYXNvbi5raW5kKSB7XG4gICAgY2FzZSBWYWx1ZVVuYXZhaWxhYmxlS2luZC5VTlNVUFBPUlRFRDpcbiAgICAgIGNoYWluTWVzc2FnZSA9ICdDb25zaWRlciB1c2luZyB0aGUgQEluamVjdCBkZWNvcmF0b3IgdG8gc3BlY2lmeSBhbiBpbmplY3Rpb24gdG9rZW4uJztcbiAgICAgIGhpbnRzID0gW1xuICAgICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHJlYXNvbi50eXBlTm9kZSwgJ1RoaXMgdHlwZSBpcyBub3Qgc3VwcG9ydGVkIGFzIGluamVjdGlvbiB0b2tlbi4nKSxcbiAgICAgIF07XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZhbHVlVW5hdmFpbGFibGVLaW5kLk5PX1ZBTFVFX0RFQ0xBUkFUSU9OOlxuICAgICAgY2hhaW5NZXNzYWdlID0gJ0NvbnNpZGVyIHVzaW5nIHRoZSBASW5qZWN0IGRlY29yYXRvciB0byBzcGVjaWZ5IGFuIGluamVjdGlvbiB0b2tlbi4nO1xuICAgICAgaGludHMgPSBbXG4gICAgICAgIG1ha2VSZWxhdGVkSW5mb3JtYXRpb24oXG4gICAgICAgICAgICByZWFzb24udHlwZU5vZGUsXG4gICAgICAgICAgICAnVGhpcyB0eXBlIGRvZXMgbm90IGhhdmUgYSB2YWx1ZSwgc28gaXQgY2Fubm90IGJlIHVzZWQgYXMgaW5qZWN0aW9uIHRva2VuLicpLFxuICAgICAgXTtcbiAgICAgIGlmIChyZWFzb24uZGVjbCAhPT0gbnVsbCkge1xuICAgICAgICBoaW50cy5wdXNoKG1ha2VSZWxhdGVkSW5mb3JtYXRpb24ocmVhc29uLmRlY2wsICdUaGUgdHlwZSBpcyBkZWNsYXJlZCBoZXJlLicpKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVmFsdWVVbmF2YWlsYWJsZUtpbmQuVFlQRV9PTkxZX0lNUE9SVDpcbiAgICAgIGNoYWluTWVzc2FnZSA9XG4gICAgICAgICAgJ0NvbnNpZGVyIGNoYW5naW5nIHRoZSB0eXBlLW9ubHkgaW1wb3J0IHRvIGEgcmVndWxhciBpbXBvcnQsIG9yIHVzZSB0aGUgQEluamVjdCBkZWNvcmF0b3IgdG8gc3BlY2lmeSBhbiBpbmplY3Rpb24gdG9rZW4uJztcbiAgICAgIGhpbnRzID0gW1xuICAgICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKFxuICAgICAgICAgICAgcmVhc29uLnR5cGVOb2RlLFxuICAgICAgICAgICAgJ1RoaXMgdHlwZSBpcyBpbXBvcnRlZCB1c2luZyBhIHR5cGUtb25seSBpbXBvcnQsIHdoaWNoIHByZXZlbnRzIGl0IGZyb20gYmVpbmcgdXNhYmxlIGFzIGFuIGluamVjdGlvbiB0b2tlbi4nKSxcbiAgICAgICAgbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihyZWFzb24uaW1wb3J0Q2xhdXNlLCAnVGhlIHR5cGUtb25seSBpbXBvcnQgb2NjdXJzIGhlcmUuJyksXG4gICAgICBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWYWx1ZVVuYXZhaWxhYmxlS2luZC5OQU1FU1BBQ0U6XG4gICAgICBjaGFpbk1lc3NhZ2UgPSAnQ29uc2lkZXIgdXNpbmcgdGhlIEBJbmplY3QgZGVjb3JhdG9yIHRvIHNwZWNpZnkgYW4gaW5qZWN0aW9uIHRva2VuLic7XG4gICAgICBoaW50cyA9IFtcbiAgICAgICAgbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihcbiAgICAgICAgICAgIHJlYXNvbi50eXBlTm9kZSxcbiAgICAgICAgICAgICdUaGlzIHR5cGUgY29ycmVzcG9uZHMgd2l0aCBhIG5hbWVzcGFjZSwgd2hpY2ggY2Fubm90IGJlIHVzZWQgYXMgaW5qZWN0aW9uIHRva2VuLicpLFxuICAgICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHJlYXNvbi5pbXBvcnRDbGF1c2UsICdUaGUgbmFtZXNwYWNlIGltcG9ydCBvY2N1cnMgaGVyZS4nKSxcbiAgICAgIF07XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZhbHVlVW5hdmFpbGFibGVLaW5kLlVOS05PV05fUkVGRVJFTkNFOlxuICAgICAgY2hhaW5NZXNzYWdlID0gJ1RoZSB0eXBlIHNob3VsZCByZWZlcmVuY2UgYSBrbm93biBkZWNsYXJhdGlvbi4nO1xuICAgICAgaGludHMgPSBbbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihyZWFzb24udHlwZU5vZGUsICdUaGlzIHR5cGUgY291bGQgbm90IGJlIHJlc29sdmVkLicpXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVmFsdWVVbmF2YWlsYWJsZUtpbmQuTUlTU0lOR19UWVBFOlxuICAgICAgY2hhaW5NZXNzYWdlID1cbiAgICAgICAgICAnQ29uc2lkZXIgYWRkaW5nIGEgdHlwZSB0byB0aGUgcGFyYW1ldGVyIG9yIHVzZSB0aGUgQEluamVjdCBkZWNvcmF0b3IgdG8gc3BlY2lmeSBhbiBpbmplY3Rpb24gdG9rZW4uJztcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgY29uc3QgY2hhaW46IHRzLkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4gPSB7XG4gICAgbWVzc2FnZVRleHQ6IGBObyBzdWl0YWJsZSBpbmplY3Rpb24gdG9rZW4gZm9yIHBhcmFtZXRlciAnJHtwYXJhbS5uYW1lIHx8IGluZGV4fScgb2YgY2xhc3MgJyR7XG4gICAgICAgIGNsYXp6Lm5hbWUudGV4dH0nLmAsXG4gICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICBjb2RlOiAwLFxuICAgIG5leHQ6IFt7XG4gICAgICBtZXNzYWdlVGV4dDogY2hhaW5NZXNzYWdlLFxuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5NZXNzYWdlLFxuICAgICAgY29kZTogMCxcbiAgICB9XSxcbiAgfTtcblxuICByZXR1cm4gbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKEVycm9yQ29kZS5QQVJBTV9NSVNTSU5HX1RPS0VOLCBwYXJhbS5uYW1lTm9kZSwgY2hhaW4sIGhpbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUjNSZWZlcmVuY2UoXG4gICAgdmFsdWVSZWY6IFJlZmVyZW5jZSwgdHlwZVJlZjogUmVmZXJlbmNlLCB2YWx1ZUNvbnRleHQ6IHRzLlNvdXJjZUZpbGUsXG4gICAgdHlwZUNvbnRleHQ6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIpOiBSM1JlZmVyZW5jZSB7XG4gIGNvbnN0IHZhbHVlID0gcmVmRW1pdHRlci5lbWl0KHZhbHVlUmVmLCB2YWx1ZUNvbnRleHQpO1xuICBjb25zdCB0eXBlID0gcmVmRW1pdHRlci5lbWl0KFxuICAgICAgdHlwZVJlZiwgdHlwZUNvbnRleHQsIEltcG9ydEZsYWdzLkZvcmNlTmV3SW1wb3J0IHwgSW1wb3J0RmxhZ3MuQWxsb3dUeXBlSW1wb3J0cyk7XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcmVmZXIgdG8gJHt0cy5TeW50YXhLaW5kW3ZhbHVlUmVmLm5vZGUua2luZF19YCk7XG4gIH1cbiAgcmV0dXJuIHt2YWx1ZSwgdHlwZX07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FuZ3VsYXJDb3JlKGRlY29yYXRvcjogRGVjb3JhdG9yKTogZGVjb3JhdG9yIGlzIERlY29yYXRvciZ7aW1wb3J0OiBJbXBvcnR9IHtcbiAgcmV0dXJuIGRlY29yYXRvci5pbXBvcnQgIT09IG51bGwgJiYgZGVjb3JhdG9yLmltcG9ydC5mcm9tID09PSAnQGFuZ3VsYXIvY29yZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FuZ3VsYXJDb3JlUmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlLCBzeW1ib2xOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHJlZmVyZW5jZS5vd25lZEJ5TW9kdWxlR3Vlc3MgPT09ICdAYW5ndWxhci9jb3JlJyAmJiByZWZlcmVuY2UuZGVidWdOYW1lID09PSBzeW1ib2xOYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEFuZ3VsYXJEZWNvcmF0b3IoXG4gICAgZGVjb3JhdG9yczogRGVjb3JhdG9yW10sIG5hbWU6IHN0cmluZywgaXNDb3JlOiBib29sZWFuKTogRGVjb3JhdG9yfHVuZGVmaW5lZCB7XG4gIHJldHVybiBkZWNvcmF0b3JzLmZpbmQoZGVjb3JhdG9yID0+IGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIG5hbWUsIGlzQ29yZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvcjogRGVjb3JhdG9yLCBuYW1lOiBzdHJpbmcsIGlzQ29yZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICBpZiAoaXNDb3JlKSB7XG4gICAgcmV0dXJuIGRlY29yYXRvci5uYW1lID09PSBuYW1lO1xuICB9IGVsc2UgaWYgKGlzQW5ndWxhckNvcmUoZGVjb3JhdG9yKSkge1xuICAgIHJldHVybiBkZWNvcmF0b3IuaW1wb3J0Lm5hbWUgPT09IG5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFVud3JhcCBhIGB0cy5FeHByZXNzaW9uYCwgcmVtb3Zpbmcgb3V0ZXIgdHlwZS1jYXN0cyBvciBwYXJlbnRoZXNlcyB1bnRpbCB0aGUgZXhwcmVzc2lvbiBpcyBpbiBpdHNcbiAqIGxvd2VzdCBsZXZlbCBmb3JtLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGUgZXhwcmVzc2lvbiBcIihmb28gYXMgVHlwZSlcIiB1bndyYXBzIHRvIFwiZm9vXCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBFeHByZXNzaW9uKG5vZGU6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgd2hpbGUgKHRzLmlzQXNFeHByZXNzaW9uKG5vZGUpIHx8IHRzLmlzUGFyZW50aGVzaXplZEV4cHJlc3Npb24obm9kZSkpIHtcbiAgICBub2RlID0gbm9kZS5leHByZXNzaW9uO1xuICB9XG4gIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBleHBhbmRGb3J3YXJkUmVmKGFyZzogdHMuRXhwcmVzc2lvbik6IHRzLkV4cHJlc3Npb258bnVsbCB7XG4gIGFyZyA9IHVud3JhcEV4cHJlc3Npb24oYXJnKTtcbiAgaWYgKCF0cy5pc0Fycm93RnVuY3Rpb24oYXJnKSAmJiAhdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24oYXJnKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgYm9keSA9IGFyZy5ib2R5O1xuICAvLyBFaXRoZXIgdGhlIGJvZHkgaXMgYSB0cy5FeHByZXNzaW9uIGRpcmVjdGx5LCBvciBhIGJsb2NrIHdpdGggYSBzaW5nbGUgcmV0dXJuIHN0YXRlbWVudC5cbiAgaWYgKHRzLmlzQmxvY2soYm9keSkpIHtcbiAgICAvLyBCbG9jayBib2R5IC0gbG9vayBmb3IgYSBzaW5nbGUgcmV0dXJuIHN0YXRlbWVudC5cbiAgICBpZiAoYm9keS5zdGF0ZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHN0bXQgPSBib2R5LnN0YXRlbWVudHNbMF07XG4gICAgaWYgKCF0cy5pc1JldHVyblN0YXRlbWVudChzdG10KSB8fCBzdG10LmV4cHJlc3Npb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBzdG10LmV4cHJlc3Npb247XG4gIH0gZWxzZSB7XG4gICAgLy8gU2hvcnRoYW5kIGJvZHkgLSByZXR1cm4gYXMgYW4gZXhwcmVzc2lvbi5cbiAgICByZXR1cm4gYm9keTtcbiAgfVxufVxuXG4vKipcbiAqIFBvc3NpYmx5IHJlc29sdmUgYSBmb3J3YXJkUmVmKCkgZXhwcmVzc2lvbiBpbnRvIHRoZSBpbm5lciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gbm9kZSB0aGUgZm9yd2FyZFJlZigpIGV4cHJlc3Npb24gdG8gcmVzb2x2ZVxuICogQHBhcmFtIHJlZmxlY3RvciBhIFJlZmxlY3Rpb25Ib3N0XG4gKiBAcmV0dXJucyB0aGUgcmVzb2x2ZWQgZXhwcmVzc2lvbiwgaWYgdGhlIG9yaWdpbmFsIGV4cHJlc3Npb24gd2FzIGEgZm9yd2FyZFJlZigpLCBvciB0aGUgb3JpZ2luYWxcbiAqIGV4cHJlc3Npb24gb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bndyYXBGb3J3YXJkUmVmKG5vZGU6IHRzLkV4cHJlc3Npb24sIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QpOiB0cy5FeHByZXNzaW9uIHtcbiAgbm9kZSA9IHVud3JhcEV4cHJlc3Npb24obm9kZSk7XG4gIGlmICghdHMuaXNDYWxsRXhwcmVzc2lvbihub2RlKSB8fCBub2RlLmFyZ3VtZW50cy5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGNvbnN0IGZuID1cbiAgICAgIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbikgPyBub2RlLmV4cHJlc3Npb24ubmFtZSA6IG5vZGUuZXhwcmVzc2lvbjtcbiAgaWYgKCF0cy5pc0lkZW50aWZpZXIoZm4pKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjb25zdCBleHByID0gZXhwYW5kRm9yd2FyZFJlZihub2RlLmFyZ3VtZW50c1swXSk7XG4gIGlmIChleHByID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgY29uc3QgaW1wID0gcmVmbGVjdG9yLmdldEltcG9ydE9mSWRlbnRpZmllcihmbik7XG4gIGlmIChpbXAgPT09IG51bGwgfHwgaW1wLmZyb20gIT09ICdAYW5ndWxhci9jb3JlJyB8fCBpbXAubmFtZSAhPT0gJ2ZvcndhcmRSZWYnKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbn1cblxuLyoqXG4gKiBBIGZvcmVpZ24gZnVuY3Rpb24gcmVzb2x2ZXIgZm9yIGBzdGF0aWNhbGx5UmVzb2x2ZWAgd2hpY2ggdW53cmFwcyBmb3J3YXJkUmVmKCkgZXhwcmVzc2lvbnMuXG4gKlxuICogQHBhcmFtIHJlZiBhIFJlZmVyZW5jZSB0byB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIGZ1bmN0aW9uIGJlaW5nIGNhbGxlZCAod2hpY2ggbWlnaHQgYmVcbiAqIGZvcndhcmRSZWYpXG4gKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIHRvIHRoZSBpbnZvY2F0aW9uIG9mIHRoZSBmb3J3YXJkUmVmIGV4cHJlc3Npb25cbiAqIEByZXR1cm5zIGFuIHVud3JhcHBlZCBhcmd1bWVudCBpZiBgcmVmYCBwb2ludGVkIHRvIGZvcndhcmRSZWYsIG9yIG51bGwgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3J3YXJkUmVmUmVzb2x2ZXIoXG4gICAgcmVmOiBSZWZlcmVuY2U8dHMuRnVuY3Rpb25EZWNsYXJhdGlvbnx0cy5NZXRob2REZWNsYXJhdGlvbnx0cy5GdW5jdGlvbkV4cHJlc3Npb24+LFxuICAgIGFyZ3M6IFJlYWRvbmx5QXJyYXk8dHMuRXhwcmVzc2lvbj4pOiB0cy5FeHByZXNzaW9ufG51bGwge1xuICBpZiAoIWlzQW5ndWxhckNvcmVSZWZlcmVuY2UocmVmLCAnZm9yd2FyZFJlZicpIHx8IGFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGV4cGFuZEZvcndhcmRSZWYoYXJnc1swXSk7XG59XG5cbi8qKlxuICogQ29tYmluZXMgYW4gYXJyYXkgb2YgcmVzb2x2ZXIgZnVuY3Rpb25zIGludG8gYSBvbmUuXG4gKiBAcGFyYW0gcmVzb2x2ZXJzIFJlc29sdmVycyB0byBiZSBjb21iaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbWJpbmVSZXNvbHZlcnMocmVzb2x2ZXJzOiBGb3JlaWduRnVuY3Rpb25SZXNvbHZlcltdKTogRm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXIge1xuICByZXR1cm4gKHJlZjogUmVmZXJlbmNlPHRzLkZ1bmN0aW9uRGVjbGFyYXRpb258dHMuTWV0aG9kRGVjbGFyYXRpb258dHMuRnVuY3Rpb25FeHByZXNzaW9uPixcbiAgICAgICAgICBhcmdzOiBSZWFkb25seUFycmF5PHRzLkV4cHJlc3Npb24+KTogdHMuRXhwcmVzc2lvbnxudWxsID0+IHtcbiAgICBmb3IgKGNvbnN0IHJlc29sdmVyIG9mIHJlc29sdmVycykge1xuICAgICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlcihyZWYsIGFyZ3MpO1xuICAgICAgaWYgKHJlc29sdmVkICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKFxuICAgIGV4cHI6IEV4cHJlc3Npb24sIGNvbnRleHQ6IHRzLk5vZGUsIGNvbnRleHRTb3VyY2U6IHRzLlNvdXJjZUZpbGUpOiBib29sZWFuIHtcbiAgaWYgKGlzV3JhcHBlZFRzTm9kZUV4cHIoZXhwcikpIHtcbiAgICBjb25zdCBub2RlID0gdHMuZ2V0T3JpZ2luYWxOb2RlKGV4cHIubm9kZSk7XG4gICAgcmV0dXJuIG5vZGUuZ2V0U291cmNlRmlsZSgpID09PSBjb250ZXh0U291cmNlICYmIGNvbnRleHQucG9zIDwgbm9kZS5wb3M7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dyYXBwZWRUc05vZGVFeHByKGV4cHI6IEV4cHJlc3Npb24pOiBleHByIGlzIFdyYXBwZWROb2RlRXhwcjx0cy5Ob2RlPiB7XG4gIHJldHVybiBleHByIGluc3RhbmNlb2YgV3JhcHBlZE5vZGVFeHByO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEJhc2VDbGFzcyhcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcik6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPnwnZHluYW1pYyd8bnVsbCB7XG4gIGNvbnN0IGJhc2VFeHByZXNzaW9uID0gcmVmbGVjdG9yLmdldEJhc2VDbGFzc0V4cHJlc3Npb24obm9kZSk7XG4gIGlmIChiYXNlRXhwcmVzc2lvbiAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGJhc2VDbGFzcyA9IGV2YWx1YXRvci5ldmFsdWF0ZShiYXNlRXhwcmVzc2lvbik7XG4gICAgaWYgKGJhc2VDbGFzcyBpbnN0YW5jZW9mIFJlZmVyZW5jZSAmJiByZWZsZWN0b3IuaXNDbGFzcyhiYXNlQ2xhc3Mubm9kZSkpIHtcbiAgICAgIHJldHVybiBiYXNlQ2xhc3MgYXMgUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gJ2R5bmFtaWMnO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5jb25zdCBwYXJlbnNXcmFwcGVyVHJhbnNmb3JtZXJGYWN0b3J5OiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuRXhwcmVzc2lvbj4gPVxuICAgIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpID0+IHtcbiAgICAgIGNvbnN0IHZpc2l0b3I6IHRzLlZpc2l0b3IgPSAobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUgPT4ge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgICAgIGlmICh0cy5pc0Fycm93RnVuY3Rpb24odmlzaXRlZCkgfHwgdHMuaXNGdW5jdGlvbkV4cHJlc3Npb24odmlzaXRlZCkpIHtcbiAgICAgICAgICByZXR1cm4gdHMuY3JlYXRlUGFyZW4odmlzaXRlZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZpc2l0ZWQ7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIChub2RlOiB0cy5FeHByZXNzaW9uKSA9PiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCB2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB9O1xuXG4vKipcbiAqIFdyYXBzIGFsbCBmdW5jdGlvbnMgaW4gYSBnaXZlbiBleHByZXNzaW9uIGluIHBhcmVudGhlc2VzLiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCBwcm9ibGVtc1xuICogd2hlcmUgVHNpY2tsZSBhbm5vdGF0aW9ucyBhZGRlZCBiZXR3ZWVuIGFuYWx5c2UgYW5kIHRyYW5zZm9ybSBwaGFzZXMgaW4gQW5ndWxhciBtYXkgdHJpZ2dlclxuICogYXV0b21hdGljIHNlbWljb2xvbiBpbnNlcnRpb24sIGUuZy4gaWYgYSBmdW5jdGlvbiBpcyB0aGUgZXhwcmVzc2lvbiBpbiBhIGByZXR1cm5gIHN0YXRlbWVudC5cbiAqIE1vcmVcbiAqIGluZm8gY2FuIGJlIGZvdW5kIGluIFRzaWNrbGUgc291cmNlIGNvZGUgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3RzaWNrbGUvYmxvYi9kNzk3NDI2MjU3MWM4YTE3ZDY4NGU1YmEwNzY4MGUxYjE5OTNhZmRkL3NyYy9qc2RvY190cmFuc2Zvcm1lci50cyNMMTAyMVxuICpcbiAqIEBwYXJhbSBleHByZXNzaW9uIEV4cHJlc3Npb24gd2hlcmUgZnVuY3Rpb25zIHNob3VsZCBiZSB3cmFwcGVkIGluIHBhcmVudGhlc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zKGV4cHJlc3Npb246IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgcmV0dXJuIHRzLnRyYW5zZm9ybShleHByZXNzaW9uLCBbcGFyZW5zV3JhcHBlclRyYW5zZm9ybWVyRmFjdG9yeV0pLnRyYW5zZm9ybWVkWzBdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGB0cy5EaWFnbm9zdGljYCB3aGljaCBpbmRpY2F0ZXMgdGhlIGdpdmVuIGNsYXNzIGlzIHBhcnQgb2YgdGhlIGRlY2xhcmF0aW9ucyBvZiB0d28gb3JcbiAqIG1vcmUgTmdNb2R1bGVzLlxuICpcbiAqIFRoZSByZXN1bHRpbmcgYHRzLkRpYWdub3N0aWNgIHdpbGwgaGF2ZSBhIGNvbnRleHQgZW50cnkgZm9yIGVhY2ggTmdNb2R1bGUgc2hvd2luZyB0aGUgcG9pbnQgd2hlcmVcbiAqIHRoZSBkaXJlY3RpdmUvcGlwZSBleGlzdHMgaW4gaXRzIGBkZWNsYXJhdGlvbnNgIChpZiBwb3NzaWJsZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRHVwbGljYXRlRGVjbGFyYXRpb25FcnJvcihcbiAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkYXRhOiBEZWNsYXJhdGlvbkRhdGFbXSwga2luZDogc3RyaW5nKTogdHMuRGlhZ25vc3RpYyB7XG4gIGNvbnN0IGNvbnRleHQ6IHRzLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSA9IFtdO1xuICBmb3IgKGNvbnN0IGRlY2wgb2YgZGF0YSkge1xuICAgIGlmIChkZWNsLnJhd0RlY2xhcmF0aW9ucyA9PT0gbnVsbCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIFRyeSB0byBmaW5kIHRoZSByZWZlcmVuY2UgdG8gdGhlIGRlY2xhcmF0aW9uIHdpdGhpbiB0aGUgZGVjbGFyYXRpb25zIGFycmF5LCB0byBoYW5nIHRoZVxuICAgIC8vIGVycm9yIHRoZXJlLiBJZiBpdCBjYW4ndCBiZSBmb3VuZCwgZmFsbCBiYWNrIG9uIHVzaW5nIHRoZSBOZ01vZHVsZSdzIG5hbWUuXG4gICAgY29uc3QgY29udGV4dE5vZGUgPSBkZWNsLnJlZi5nZXRPcmlnaW5Gb3JEaWFnbm9zdGljcyhkZWNsLnJhd0RlY2xhcmF0aW9ucywgZGVjbC5uZ01vZHVsZS5uYW1lKTtcbiAgICBjb250ZXh0LnB1c2gobWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihcbiAgICAgICAgY29udGV4dE5vZGUsXG4gICAgICAgIGAnJHtub2RlLm5hbWUudGV4dH0nIGlzIGxpc3RlZCBpbiB0aGUgZGVjbGFyYXRpb25zIG9mIHRoZSBOZ01vZHVsZSAnJHtcbiAgICAgICAgICAgIGRlY2wubmdNb2R1bGUubmFtZS50ZXh0fScuYCkpO1xuICB9XG5cbiAgLy8gRmluYWxseSwgcHJvZHVjZSB0aGUgZGlhZ25vc3RpYy5cbiAgcmV0dXJuIG1ha2VEaWFnbm9zdGljKFxuICAgICAgRXJyb3JDb2RlLk5HTU9EVUxFX0RFQ0xBUkFUSU9OX05PVF9VTklRVUUsIG5vZGUubmFtZSxcbiAgICAgIGBUaGUgJHtraW5kfSAnJHtub2RlLm5hbWUudGV4dH0nIGlzIGRlY2xhcmVkIGJ5IG1vcmUgdGhhbiBvbmUgTmdNb2R1bGUuYCwgY29udGV4dCk7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgdGhlIGdpdmVuIGByYXdQcm92aWRlcnNgIGludG8gYENsYXNzRGVjbGFyYXRpb25zYCBhbmQgcmV0dXJuc1xuICogYSBzZXQgY29udGFpbmluZyB0aG9zZSB0aGF0IGFyZSBrbm93biB0byByZXF1aXJlIGEgZmFjdG9yeSBkZWZpbml0aW9uLlxuICogQHBhcmFtIHJhd1Byb3ZpZGVycyBFeHByZXNzaW9uIHRoYXQgZGVjbGFyZWQgdGhlIHByb3ZpZGVycyBhcnJheSBpbiB0aGUgc291cmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnkoXG4gICAgcmF3UHJvdmlkZXJzOiB0cy5FeHByZXNzaW9uLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvcik6IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+IHtcbiAgY29uc3QgcHJvdmlkZXJzID0gbmV3IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG4gIGNvbnN0IHJlc29sdmVkUHJvdmlkZXJzID0gZXZhbHVhdG9yLmV2YWx1YXRlKHJhd1Byb3ZpZGVycyk7XG5cbiAgaWYgKCFBcnJheS5pc0FycmF5KHJlc29sdmVkUHJvdmlkZXJzKSkge1xuICAgIHJldHVybiBwcm92aWRlcnM7XG4gIH1cblxuICByZXNvbHZlZFByb3ZpZGVycy5mb3JFYWNoKGZ1bmN0aW9uIHByb2Nlc3NQcm92aWRlcnMocHJvdmlkZXIpIHtcbiAgICBsZXQgdG9rZW5DbGFzczogUmVmZXJlbmNlfG51bGwgPSBudWxsO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocHJvdmlkZXIpKSB7XG4gICAgICAvLyBJZiB3ZSByYW4gaW50byBhbiBhcnJheSwgcmVjdXJzZSBpbnRvIGl0IHVudGlsIHdlJ3ZlIHJlc29sdmUgYWxsIHRoZSBjbGFzc2VzLlxuICAgICAgcHJvdmlkZXIuZm9yRWFjaChwcm9jZXNzUHJvdmlkZXJzKTtcbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICB0b2tlbkNsYXNzID0gcHJvdmlkZXI7XG4gICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIE1hcCAmJiBwcm92aWRlci5oYXMoJ3VzZUNsYXNzJykgJiYgIXByb3ZpZGVyLmhhcygnZGVwcycpKSB7XG4gICAgICBjb25zdCB1c2VFeGlzdGluZyA9IHByb3ZpZGVyLmdldCgndXNlQ2xhc3MnKSE7XG4gICAgICBpZiAodXNlRXhpc3RpbmcgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgICAgdG9rZW5DbGFzcyA9IHVzZUV4aXN0aW5nO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0b2tlbkNsYXNzICE9PSBudWxsICYmIHJlZmxlY3Rvci5pc0NsYXNzKHRva2VuQ2xhc3Mubm9kZSkpIHtcbiAgICAgIGNvbnN0IGNvbnN0cnVjdG9yUGFyYW1ldGVycyA9IHJlZmxlY3Rvci5nZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnModG9rZW5DbGFzcy5ub2RlKTtcblxuICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgd2FudCB0byBjYXB0dXJlIHByb3ZpZGVycyB3aXRoIGEgbm9uLXRyaXZpYWwgY29uc3RydWN0b3IsXG4gICAgICAvLyBiZWNhdXNlIHRoZXkncmUgdGhlIG9uZXMgdGhhdCBtaWdodCBiZSB1c2luZyBESSBhbmQgbmVlZCB0byBiZSBkZWNvcmF0ZWQuXG4gICAgICBpZiAoY29uc3RydWN0b3JQYXJhbWV0ZXJzICE9PSBudWxsICYmIGNvbnN0cnVjdG9yUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHByb3ZpZGVycy5hZGQodG9rZW5DbGFzcyBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHByb3ZpZGVycztcbn1cblxuLyoqXG4gKiBDcmVhdGUgYW4gUjNSZWZlcmVuY2UgZm9yIGEgY2xhc3MuXG4gKlxuICogVGhlIGB2YWx1ZWAgaXMgdGhlIGV4cG9ydGVkIGRlY2xhcmF0aW9uIG9mIHRoZSBjbGFzcyBmcm9tIGl0cyBzb3VyY2UgZmlsZS5cbiAqIFRoZSBgdHlwZWAgaXMgYW4gZXhwcmVzc2lvbiB0aGF0IHdvdWxkIGJlIHVzZWQgYnkgbmdjYyBpbiB0aGUgdHlwaW5ncyAoLmQudHMpIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcFR5cGVSZWZlcmVuY2UocmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgY2xheno6IENsYXNzRGVjbGFyYXRpb24pOiBSM1JlZmVyZW5jZSB7XG4gIGNvbnN0IGR0c0NsYXNzID0gcmVmbGVjdG9yLmdldER0c0RlY2xhcmF0aW9uKGNsYXp6KTtcbiAgY29uc3QgdmFsdWUgPSBuZXcgV3JhcHBlZE5vZGVFeHByKGNsYXp6Lm5hbWUpO1xuICBjb25zdCB0eXBlID0gZHRzQ2xhc3MgIT09IG51bGwgJiYgaXNOYW1lZENsYXNzRGVjbGFyYXRpb24oZHRzQ2xhc3MpID9cbiAgICAgIG5ldyBXcmFwcGVkTm9kZUV4cHIoZHRzQ2xhc3MubmFtZSkgOlxuICAgICAgdmFsdWU7XG4gIHJldHVybiB7dmFsdWUsIHR5cGV9O1xufVxuXG4vKiogQ3JlYXRlcyBhIFBhcnNlU291cmNlU3BhbiBmb3IgYSBUeXBlU2NyaXB0IG5vZGUuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU291cmNlU3Bhbihub2RlOiB0cy5Ob2RlKTogUGFyc2VTb3VyY2VTcGFuIHtcbiAgY29uc3Qgc2YgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgY29uc3QgW3N0YXJ0T2Zmc2V0LCBlbmRPZmZzZXRdID0gW25vZGUuZ2V0U3RhcnQoKSwgbm9kZS5nZXRFbmQoKV07XG4gIGNvbnN0IHtsaW5lOiBzdGFydExpbmUsIGNoYXJhY3Rlcjogc3RhcnRDb2x9ID0gc2YuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc3RhcnRPZmZzZXQpO1xuICBjb25zdCB7bGluZTogZW5kTGluZSwgY2hhcmFjdGVyOiBlbmRDb2x9ID0gc2YuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oZW5kT2Zmc2V0KTtcbiAgY29uc3QgcGFyc2VTZiA9IG5ldyBQYXJzZVNvdXJjZUZpbGUoc2YuZ2V0RnVsbFRleHQoKSwgc2YuZmlsZU5hbWUpO1xuXG4gIC8vICsxIGJlY2F1c2UgdmFsdWVzIGFyZSB6ZXJvLWluZGV4ZWQuXG4gIHJldHVybiBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgbmV3IFBhcnNlTG9jYXRpb24ocGFyc2VTZiwgc3RhcnRPZmZzZXQsIHN0YXJ0TGluZSArIDEsIHN0YXJ0Q29sICsgMSksXG4gICAgICBuZXcgUGFyc2VMb2NhdGlvbihwYXJzZVNmLCBlbmRPZmZzZXQsIGVuZExpbmUgKyAxLCBlbmRDb2wgKyAxKSk7XG59XG4iXX0=