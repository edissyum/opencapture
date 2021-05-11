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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/util", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/imports/src/default", "@angular/compiler-cli/src/ngtsc/reflection"], factory);
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
    var default_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/default");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    function getConstructorDependencies(clazz, reflector, isCore) {
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
            var token = valueReferenceToExpression(param.typeValueReference);
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
    function valueReferenceToExpression(valueRef) {
        var e_1, _a;
        if (valueRef.kind === 2 /* UNAVAILABLE */) {
            return null;
        }
        else if (valueRef.kind === 0 /* LOCAL */) {
            var expr = new compiler_1.WrappedNodeExpr(valueRef.expression);
            if (valueRef.defaultImportStatement !== null) {
                default_1.attachDefaultImportDeclaration(expr, valueRef.defaultImportStatement);
            }
            return expr;
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
    function getValidConstructorDependencies(clazz, reflector, isCore) {
        return validateConstructorDependencies(clazz, getConstructorDependencies(clazz, reflector, isCore));
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
        return {
            value: refEmitter.emit(valueRef, valueContext).expression,
            type: refEmitter
                .emit(typeRef, typeContext, imports_1.ImportFlags.ForceNewImport | imports_1.ImportFlags.AllowTypeImports)
                .expression,
        };
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
            // TODO(alxhub): there was a bug where `getConstructorParameters` would return `null` for a
            // class in a .d.ts file, always, even if the class had a constructor. This was fixed for
            // `getConstructorParameters`, but that fix causes more classes to be recognized here as needing
            // provider checks, which is a breaking change in g3. Avoid this breakage for now by skipping
            // classes from .d.ts files here directly, until g3 can be cleaned up.
            if (tokenClass !== null && !tokenClass.node.getSourceFile().isDeclarationFile &&
                reflector.isClass(tokenClass.node)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvYW5ub3RhdGlvbnMvc3JjL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFxTjtJQUNyTiwrQkFBaUM7SUFFakMsMkVBQTBHO0lBQzFHLG1FQUF1RTtJQUN2RSwrRUFBeUU7SUFFekUseUVBQXNRO0lBZ0J0USxTQUFnQiwwQkFBMEIsQ0FDdEMsS0FBdUIsRUFBRSxTQUF5QixFQUFFLE1BQWU7UUFDckUsSUFBTSxJQUFJLEdBQTJCLEVBQUUsQ0FBQztRQUN4QyxJQUFNLE1BQU0sR0FBMEIsRUFBRSxDQUFDO1FBQ3pDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzRCxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNqQyxPQUFPLElBQUksQ0FBQzthQUNiO2lCQUFNO2dCQUNMLFVBQVUsR0FBRyxFQUFFLENBQUM7YUFDakI7U0FDRjtRQUNELFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLEVBQUUsR0FBRztZQUM1QixJQUFJLEtBQUssR0FBRywwQkFBMEIsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNqRSxJQUFJLFNBQVMsR0FBb0IsSUFBSSxDQUFDO1lBQ3RDLElBQUksUUFBUSxHQUFHLEtBQUssRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLFFBQVEsR0FBRyxLQUFLLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNuRSxJQUFJLFFBQVEsR0FBRyxtQ0FBd0IsQ0FBQyxLQUFLLENBQUM7WUFFOUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUs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QUMsV0FBVyxFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5FLHNDQUFzQztRQUN0QyxPQUFPLElBQUksMEJBQWUsQ0FDdEIsSUFBSSx3QkFBYSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQ3BFLElBQUksd0JBQWEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQVhELDRDQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBMaXRlcmFsRXhwciwgUGFyc2VMb2NhdGlvbiwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZVNvdXJjZVNwYW4sIFIzRGVwZW5kZW5jeU1ldGFkYXRhLCBSM1JlZmVyZW5jZSwgUjNSZXNvbHZlZERlcGVuZGVuY3lUeXBlLCBSZWFkUHJvcEV4cHIsIFdyYXBwZWROb2RlRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvciwgbWFrZURpYWdub3N0aWMsIG1ha2VSZWxhdGVkSW5mb3JtYXRpb259IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7SW1wb3J0RmxhZ3MsIFJlZmVyZW5jZSwgUmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge2F0dGFjaERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbn0gZnJvbSAnLi4vLi4vaW1wb3J0cy9zcmMvZGVmYXVsdCc7XG5pbXBvcnQge0ZvcmVpZ25GdW5jdGlvblJlc29sdmVyLCBQYXJ0aWFsRXZhbHVhdG9yfSBmcm9tICcuLi8uLi9wYXJ0aWFsX2V2YWx1YXRvcic7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIEN0b3JQYXJhbWV0ZXIsIERlY29yYXRvciwgSW1wb3J0LCBJbXBvcnRlZFR5cGVWYWx1ZVJlZmVyZW5jZSwgaXNOYW1lZENsYXNzRGVjbGFyYXRpb24sIExvY2FsVHlwZVZhbHVlUmVmZXJlbmNlLCBSZWZsZWN0aW9uSG9zdCwgVHlwZVZhbHVlUmVmZXJlbmNlLCBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLCBVbmF2YWlsYWJsZVZhbHVlLCBWYWx1ZVVuYXZhaWxhYmxlS2luZH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0RlY2xhcmF0aW9uRGF0YX0gZnJvbSAnLi4vLi4vc2NvcGUnO1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvckRlcHMgPSB7XG4gIGRlcHM6IFIzRGVwZW5kZW5jeU1ldGFkYXRhW107XG59fHtcbiAgZGVwczogbnVsbDtcbiAgZXJyb3JzOiBDb25zdHJ1Y3RvckRlcEVycm9yW107XG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbnN0cnVjdG9yRGVwRXJyb3Ige1xuICBpbmRleDogbnVtYmVyO1xuICBwYXJhbTogQ3RvclBhcmFtZXRlcjtcbiAgcmVhc29uOiBVbmF2YWlsYWJsZVZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMoXG4gICAgY2xheno6IENsYXNzRGVjbGFyYXRpb24sIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIGlzQ29yZTogYm9vbGVhbik6IENvbnN0cnVjdG9yRGVwc3xudWxsIHtcbiAgY29uc3QgZGVwczogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXSA9IFtdO1xuICBjb25zdCBlcnJvcnM6IENvbnN0cnVjdG9yRGVwRXJyb3JbXSA9IFtdO1xuICBsZXQgY3RvclBhcmFtcyA9IHJlZmxlY3Rvci5nZXRDb25zdHJ1Y3RvclBhcmFtZXRlcnMoY2xhenopO1xuICBpZiAoY3RvclBhcmFtcyA9PT0gbnVsbCkge1xuICAgIGlmIChyZWZsZWN0b3IuaGFzQmFzZUNsYXNzKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0b3JQYXJhbXMgPSBbXTtcbiAgICB9XG4gIH1cbiAgY3RvclBhcmFtcy5mb3JFYWNoKChwYXJhbSwgaWR4KSA9PiB7XG4gICAgbGV0IHRva2VuID0gdmFsdWVSZWZlcmVuY2VUb0V4cHJlc3Npb24ocGFyYW0udHlwZVZhbHVlUmVmZXJlbmNlKTtcbiAgICBsZXQgYXR0cmlidXRlOiBFeHByZXNzaW9ufG51bGwgPSBudWxsO1xuICAgIGxldCBvcHRpb25hbCA9IGZhbHNlLCBzZWxmID0gZmFsc2UsIHNraXBTZWxmID0gZmFsc2UsIGhvc3QgPSBmYWxzZTtcbiAgICBsZXQgcmVzb2x2ZWQgPSBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUuVG9rZW47XG5cbiAgICAocGFyYW0uZGVjb3JhdG9ycyB8fCBbXSkuZmlsdGVyKGRlYyA9PiBpc0NvcmUgfHwgaXNBbmd1bGFyQ29yZShkZWMpKS5mb3JFYWNoKGRlYyA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gaXNDb3JlIHx8IGRlYy5pbXBvcnQgPT09IG51bGwgPyBkZWMubmFtZSA6IGRlYy5pbXBvcnQhLm5hbWU7XG4gICAgICBpZiAobmFtZSA9PT0gJ0luamVjdCcpIHtcbiAgICAgICAgaWYgKGRlYy5hcmdzID09PSBudWxsIHx8IGRlYy5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUklUWV9XUk9ORywgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWMpLFxuICAgICAgICAgICAgICBgVW5leHBlY3RlZCBudW1iZXIgb2YgYXJndW1lbnRzIHRvIEBJbmplY3QoKS5gKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbiA9IG5ldyBXcmFwcGVkTm9kZUV4cHIoZGVjLmFyZ3NbMF0pO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnT3B0aW9uYWwnKSB7XG4gICAgICAgIG9wdGlvbmFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ1NraXBTZWxmJykge1xuICAgICAgICBza2lwU2VsZiA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdTZWxmJykge1xuICAgICAgICBzZWxmID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ0hvc3QnKSB7XG4gICAgICAgIGhvc3QgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChuYW1lID09PSAnQXR0cmlidXRlJykge1xuICAgICAgICBpZiAoZGVjLmFyZ3MgPT09IG51bGwgfHwgZGVjLmFyZ3MubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlYyksXG4gICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG51bWJlciBvZiBhcmd1bWVudHMgdG8gQEF0dHJpYnV0ZSgpLmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZU5hbWUgPSBkZWMuYXJnc1swXTtcbiAgICAgICAgdG9rZW4gPSBuZXcgV3JhcHBlZE5vZGVFeHByKGF0dHJpYnV0ZU5hbWUpO1xuICAgICAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShhdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgICAgIGF0dHJpYnV0ZSA9IG5ldyBMaXRlcmFsRXhwcihhdHRyaWJ1dGVOYW1lLnRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF0dHJpYnV0ZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIodHMuY3JlYXRlS2V5d29yZFR5cGVOb2RlKHRzLlN5bnRheEtpbmQuVW5rbm93bktleXdvcmQpKTtcbiAgICAgICAgfVxuICAgICAgICByZXNvbHZlZCA9IFIzUmVzb2x2ZWREZXBlbmRlbmN5VHlwZS5BdHRyaWJ1dGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX1VORVhQRUNURUQsIERlY29yYXRvci5ub2RlRm9yRXJyb3IoZGVjKSxcbiAgICAgICAgICAgIGBVbmV4cGVjdGVkIGRlY29yYXRvciAke25hbWV9IG9uIHBhcmFtZXRlci5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEV4dGVybmFsRXhwciAmJiB0b2tlbi52YWx1ZS5uYW1lID09PSAnQ2hhbmdlRGV0ZWN0b3JSZWYnICYmXG4gICAgICAgIHRva2VuLnZhbHVlLm1vZHVsZU5hbWUgPT09ICdAYW5ndWxhci9jb3JlJykge1xuICAgICAgcmVzb2x2ZWQgPSBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUuQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gICAgfVxuICAgIGlmICh0b2tlbiA9PT0gbnVsbCkge1xuICAgICAgaWYgKHBhcmFtLnR5cGVWYWx1ZVJlZmVyZW5jZS5raW5kICE9PSBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLlVOQVZBSUxBQkxFKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdJbGxlZ2FsIHN0YXRlOiBleHBlY3RlZCB2YWx1ZSByZWZlcmVuY2UgdG8gYmUgdW5hdmFpbGFibGUgaWYgbm8gdG9rZW4gaXMgcHJlc2VudCcpO1xuICAgICAgfVxuICAgICAgZXJyb3JzLnB1c2goe1xuICAgICAgICBpbmRleDogaWR4LFxuICAgICAgICBwYXJhbSxcbiAgICAgICAgcmVhc29uOiBwYXJhbS50eXBlVmFsdWVSZWZlcmVuY2UucmVhc29uLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlcHMucHVzaCh7dG9rZW4sIGF0dHJpYnV0ZSwgb3B0aW9uYWwsIHNlbGYsIHNraXBTZWxmLCBob3N0LCByZXNvbHZlZH0pO1xuICAgIH1cbiAgfSk7XG4gIGlmIChlcnJvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHtkZXBzfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge2RlcHM6IG51bGwsIGVycm9yc307XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgYFR5cGVWYWx1ZVJlZmVyZW5jZWAgdG8gYW4gYEV4cHJlc3Npb25gIHdoaWNoIHJlZmVycyB0byB0aGUgdHlwZSBhcyBhIHZhbHVlLlxuICpcbiAqIExvY2FsIHJlZmVyZW5jZXMgYXJlIGNvbnZlcnRlZCB0byBhIGBXcmFwcGVkTm9kZUV4cHJgIG9mIHRoZSBUeXBlU2NyaXB0IGV4cHJlc3Npb24sIGFuZCBub24tbG9jYWxcbiAqIHJlZmVyZW5jZXMgYXJlIGNvbnZlcnRlZCB0byBhbiBgRXh0ZXJuYWxFeHByYC4gTm90ZSB0aGF0IHRoaXMgaXMgb25seSB2YWxpZCBpbiB0aGUgY29udGV4dCBvZiB0aGVcbiAqIGZpbGUgaW4gd2hpY2ggdGhlIGBUeXBlVmFsdWVSZWZlcmVuY2VgIG9yaWdpbmF0ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWx1ZVJlZmVyZW5jZVRvRXhwcmVzc2lvbih2YWx1ZVJlZjogTG9jYWxUeXBlVmFsdWVSZWZlcmVuY2V8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW1wb3J0ZWRUeXBlVmFsdWVSZWZlcmVuY2UpOiBFeHByZXNzaW9uO1xuZXhwb3J0IGZ1bmN0aW9uIHZhbHVlUmVmZXJlbmNlVG9FeHByZXNzaW9uKHZhbHVlUmVmOiBUeXBlVmFsdWVSZWZlcmVuY2UpOiBFeHByZXNzaW9ufG51bGw7XG5leHBvcnQgZnVuY3Rpb24gdmFsdWVSZWZlcmVuY2VUb0V4cHJlc3Npb24odmFsdWVSZWY6IFR5cGVWYWx1ZVJlZmVyZW5jZSk6IEV4cHJlc3Npb258bnVsbCB7XG4gIGlmICh2YWx1ZVJlZi5raW5kID09PSBUeXBlVmFsdWVSZWZlcmVuY2VLaW5kLlVOQVZBSUxBQkxFKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAodmFsdWVSZWYua2luZCA9PT0gVHlwZVZhbHVlUmVmZXJlbmNlS2luZC5MT0NBTCkge1xuICAgIGNvbnN0IGV4cHIgPSBuZXcgV3JhcHBlZE5vZGVFeHByKHZhbHVlUmVmLmV4cHJlc3Npb24pO1xuICAgIGlmICh2YWx1ZVJlZi5kZWZhdWx0SW1wb3J0U3RhdGVtZW50ICE9PSBudWxsKSB7XG4gICAgICBhdHRhY2hEZWZhdWx0SW1wb3J0RGVjbGFyYXRpb24oZXhwciwgdmFsdWVSZWYuZGVmYXVsdEltcG9ydFN0YXRlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBleHByO1xuICB9IGVsc2Uge1xuICAgIGxldCBpbXBvcnRFeHByOiBFeHByZXNzaW9uID1cbiAgICAgICAgbmV3IEV4dGVybmFsRXhwcih7bW9kdWxlTmFtZTogdmFsdWVSZWYubW9kdWxlTmFtZSwgbmFtZTogdmFsdWVSZWYuaW1wb3J0ZWROYW1lfSk7XG4gICAgaWYgKHZhbHVlUmVmLm5lc3RlZFBhdGggIT09IG51bGwpIHtcbiAgICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgdmFsdWVSZWYubmVzdGVkUGF0aCkge1xuICAgICAgICBpbXBvcnRFeHByID0gbmV3IFJlYWRQcm9wRXhwcihpbXBvcnRFeHByLCBwcm9wZXJ0eSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbXBvcnRFeHByO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydCBgQ29uc3RydWN0b3JEZXBzYCBpbnRvIHRoZSBgUjNEZXBlbmRlbmN5TWV0YWRhdGFgIGFycmF5IGZvciB0aG9zZSBkZXBzIGlmIHRoZXkncmUgdmFsaWQsXG4gKiBvciBpbnRvIGFuIGAnaW52YWxpZCdgIHNpZ25hbCBpZiB0aGV5J3JlIG5vdC5cbiAqXG4gKiBUaGlzIGlzIGEgY29tcGFuaW9uIGZ1bmN0aW9uIHRvIGB2YWxpZGF0ZUNvbnN0cnVjdG9yRGVwZW5kZW5jaWVzYCB3aGljaCBhY2NlcHRzIGludmFsaWQgZGVwcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKGRlcHM6IENvbnN0cnVjdG9yRGVwc3xudWxsKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxcbiAgICAnaW52YWxpZCd8bnVsbCB7XG4gIGlmIChkZXBzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSBpZiAoZGVwcy5kZXBzICE9PSBudWxsKSB7XG4gICAgLy8gVGhlc2UgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGFyZSB2YWxpZC5cbiAgICByZXR1cm4gZGVwcy5kZXBzO1xuICB9IGVsc2Uge1xuICAgIC8vIFRoZXNlIGRlcHMgYXJlIGludmFsaWQuXG4gICAgcmV0dXJuICdpbnZhbGlkJztcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmFsaWRDb25zdHJ1Y3RvckRlcGVuZGVuY2llcyhcbiAgICBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgaXNDb3JlOiBib29sZWFuKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxcbiAgICBudWxsIHtcbiAgcmV0dXJuIHZhbGlkYXRlQ29uc3RydWN0b3JEZXBlbmRlbmNpZXMoXG4gICAgICBjbGF6eiwgZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMoY2xhenosIHJlZmxlY3RvciwgaXNDb3JlKSk7XG59XG5cbi8qKlxuICogVmFsaWRhdGUgdGhhdCBgQ29uc3RydWN0b3JEZXBzYCBkb2VzIG5vdCBoYXZlIGFueSBpbnZhbGlkIGRlcGVuZGVuY2llcyBhbmQgY29udmVydCB0aGVtIGludG8gdGhlXG4gKiBgUjNEZXBlbmRlbmN5TWV0YWRhdGFgIGFycmF5IGlmIHNvLCBvciByYWlzZSBhIGRpYWdub3N0aWMgaWYgc29tZSBkZXBzIGFyZSBpbnZhbGlkLlxuICpcbiAqIFRoaXMgaXMgYSBjb21wYW5pb24gZnVuY3Rpb24gdG8gYHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzYCB3aGljaCBkb2VzIG5vdCBhY2NlcHQgaW52YWxpZFxuICogZGVwcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uc3RydWN0b3JEZXBlbmRlbmNpZXMoXG4gICAgY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGRlcHM6IENvbnN0cnVjdG9yRGVwc3xudWxsKTogUjNEZXBlbmRlbmN5TWV0YWRhdGFbXXxudWxsIHtcbiAgaWYgKGRlcHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIGlmIChkZXBzLmRlcHMgIT09IG51bGwpIHtcbiAgICByZXR1cm4gZGVwcy5kZXBzO1xuICB9IGVsc2Uge1xuICAgIC8vIFRPRE8oYWx4aHViKTogdGhpcyBjYXN0IGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBnMyB0eXBlc2NyaXB0IHZlcnNpb24gZG9lc24ndCBuYXJyb3cgaGVyZS5cbiAgICAvLyBUaGVyZSBpcyBhdCBsZWFzdCBvbmUgZXJyb3IuXG4gICAgY29uc3QgZXJyb3IgPSAoZGVwcyBhcyB7ZXJyb3JzOiBDb25zdHJ1Y3RvckRlcEVycm9yW119KS5lcnJvcnNbMF07XG4gICAgdGhyb3cgY3JlYXRlVW5zdWl0YWJsZUluamVjdGlvblRva2VuRXJyb3IoY2xhenosIGVycm9yKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmYXRhbCBlcnJvciB3aXRoIGRpYWdub3N0aWMgZm9yIGFuIGludmFsaWQgaW5qZWN0aW9uIHRva2VuLlxuICogQHBhcmFtIGNsYXp6IFRoZSBjbGFzcyBmb3Igd2hpY2ggdGhlIGluamVjdGlvbiB0b2tlbiB3YXMgdW5hdmFpbGFibGUuXG4gKiBAcGFyYW0gZXJyb3IgVGhlIHJlYXNvbiB3aHkgbm8gdmFsaWQgaW5qZWN0aW9uIHRva2VuIGlzIGF2YWlsYWJsZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVW5zdWl0YWJsZUluamVjdGlvblRva2VuRXJyb3IoXG4gICAgY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGVycm9yOiBDb25zdHJ1Y3RvckRlcEVycm9yKTogRmF0YWxEaWFnbm9zdGljRXJyb3Ige1xuICBjb25zdCB7cGFyYW0sIGluZGV4LCByZWFzb259ID0gZXJyb3I7XG4gIGxldCBjaGFpbk1lc3NhZ2U6IHN0cmluZ3x1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIGxldCBoaW50czogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgc3dpdGNoIChyZWFzb24ua2luZCkge1xuICAgIGNhc2UgVmFsdWVVbmF2YWlsYWJsZUtpbmQuVU5TVVBQT1JURUQ6XG4gICAgICBjaGFpbk1lc3NhZ2UgPSAnQ29uc2lkZXIgdXNpbmcgdGhlIEBJbmplY3QgZGVjb3JhdG9yIHRvIHNwZWNpZnkgYW4gaW5qZWN0aW9uIHRva2VuLic7XG4gICAgICBoaW50cyA9IFtcbiAgICAgICAgbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihyZWFzb24udHlwZU5vZGUsICdUaGlzIHR5cGUgaXMgbm90IHN1cHBvcnRlZCBhcyBpbmplY3Rpb24gdG9rZW4uJyksXG4gICAgICBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWYWx1ZVVuYXZhaWxhYmxlS2luZC5OT19WQUxVRV9ERUNMQVJBVElPTjpcbiAgICAgIGNoYWluTWVzc2FnZSA9ICdDb25zaWRlciB1c2luZyB0aGUgQEluamVjdCBkZWNvcmF0b3IgdG8gc3BlY2lmeSBhbiBpbmplY3Rpb24gdG9rZW4uJztcbiAgICAgIGhpbnRzID0gW1xuICAgICAgICBtYWtlUmVsYXRlZEluZm9ybWF0aW9uKFxuICAgICAgICAgICAgcmVhc29uLnR5cGVOb2RlLFxuICAgICAgICAgICAgJ1RoaXMgdHlwZSBkb2VzIG5vdCBoYXZlIGEgdmFsdWUsIHNvIGl0IGNhbm5vdCBiZSB1c2VkIGFzIGluamVjdGlvbiB0b2tlbi4nKSxcbiAgICAgIF07XG4gICAgICBpZiAocmVhc29uLmRlY2wgIT09IG51bGwpIHtcbiAgICAgICAgaGludHMucHVzaChtYWtlUmVsYXRlZEluZm9ybWF0aW9uKHJlYXNvbi5kZWNsLCAnVGhlIHR5cGUgaXMgZGVjbGFyZWQgaGVyZS4nKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZhbHVlVW5hdmFpbGFibGVLaW5kLlRZUEVfT05MWV9JTVBPUlQ6XG4gICAgICBjaGFpbk1lc3NhZ2UgPVxuICAgICAgICAgICdDb25zaWRlciBjaGFuZ2luZyB0aGUgdHlwZS1vbmx5IGltcG9ydCB0byBhIHJlZ3VsYXIgaW1wb3J0LCBvciB1c2UgdGhlIEBJbmplY3QgZGVjb3JhdG9yIHRvIHNwZWNpZnkgYW4gaW5qZWN0aW9uIHRva2VuLic7XG4gICAgICBoaW50cyA9IFtcbiAgICAgICAgbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihcbiAgICAgICAgICAgIHJlYXNvbi50eXBlTm9kZSxcbiAgICAgICAgICAgICdUaGlzIHR5cGUgaXMgaW1wb3J0ZWQgdXNpbmcgYSB0eXBlLW9ubHkgaW1wb3J0LCB3aGljaCBwcmV2ZW50cyBpdCBmcm9tIGJlaW5nIHVzYWJsZSBhcyBhbiBpbmplY3Rpb24gdG9rZW4uJyksXG4gICAgICAgIG1ha2VSZWxhdGVkSW5mb3JtYXRpb24ocmVhc29uLmltcG9ydENsYXVzZSwgJ1RoZSB0eXBlLW9ubHkgaW1wb3J0IG9jY3VycyBoZXJlLicpLFxuICAgICAgXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVmFsdWVVbmF2YWlsYWJsZUtpbmQuTkFNRVNQQUNFOlxuICAgICAgY2hhaW5NZXNzYWdlID0gJ0NvbnNpZGVyIHVzaW5nIHRoZSBASW5qZWN0IGRlY29yYXRvciB0byBzcGVjaWZ5IGFuIGluamVjdGlvbiB0b2tlbi4nO1xuICAgICAgaGludHMgPSBbXG4gICAgICAgIG1ha2VSZWxhdGVkSW5mb3JtYXRpb24oXG4gICAgICAgICAgICByZWFzb24udHlwZU5vZGUsXG4gICAgICAgICAgICAnVGhpcyB0eXBlIGNvcnJlc3BvbmRzIHdpdGggYSBuYW1lc3BhY2UsIHdoaWNoIGNhbm5vdCBiZSB1c2VkIGFzIGluamVjdGlvbiB0b2tlbi4nKSxcbiAgICAgICAgbWFrZVJlbGF0ZWRJbmZvcm1hdGlvbihyZWFzb24uaW1wb3J0Q2xhdXNlLCAnVGhlIG5hbWVzcGFjZSBpbXBvcnQgb2NjdXJzIGhlcmUuJyksXG4gICAgICBdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBWYWx1ZVVuYXZhaWxhYmxlS2luZC5VTktOT1dOX1JFRkVSRU5DRTpcbiAgICAgIGNoYWluTWVzc2FnZSA9ICdUaGUgdHlwZSBzaG91bGQgcmVmZXJlbmNlIGEga25vd24gZGVjbGFyYXRpb24uJztcbiAgICAgIGhpbnRzID0gW21ha2VSZWxhdGVkSW5mb3JtYXRpb24ocmVhc29uLnR5cGVOb2RlLCAnVGhpcyB0eXBlIGNvdWxkIG5vdCBiZSByZXNvbHZlZC4nKV07XG4gICAgICBicmVhaztcbiAgICBjYXNlIFZhbHVlVW5hdmFpbGFibGVLaW5kLk1JU1NJTkdfVFlQRTpcbiAgICAgIGNoYWluTWVzc2FnZSA9XG4gICAgICAgICAgJ0NvbnNpZGVyIGFkZGluZyBhIHR5cGUgdG8gdGhlIHBhcmFtZXRlciBvciB1c2UgdGhlIEBJbmplY3QgZGVjb3JhdG9yIHRvIHNwZWNpZnkgYW4gaW5qZWN0aW9uIHRva2VuLic7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGNvbnN0IGNoYWluOiB0cy5EaWFnbm9zdGljTWVzc2FnZUNoYWluID0ge1xuICAgIG1lc3NhZ2VUZXh0OiBgTm8gc3VpdGFibGUgaW5qZWN0aW9uIHRva2VuIGZvciBwYXJhbWV0ZXIgJyR7cGFyYW0ubmFtZSB8fCBpbmRleH0nIG9mIGNsYXNzICcke1xuICAgICAgICBjbGF6ei5uYW1lLnRleHR9Jy5gLFxuICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgY29kZTogMCxcbiAgICBuZXh0OiBbe1xuICAgICAgbWVzc2FnZVRleHQ6IGNoYWluTWVzc2FnZSxcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSxcbiAgICAgIGNvZGU6IDAsXG4gICAgfV0sXG4gIH07XG5cbiAgcmV0dXJuIG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihFcnJvckNvZGUuUEFSQU1fTUlTU0lOR19UT0tFTiwgcGFyYW0ubmFtZU5vZGUsIGNoYWluLCBoaW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1IzUmVmZXJlbmNlKFxuICAgIHZhbHVlUmVmOiBSZWZlcmVuY2UsIHR5cGVSZWY6IFJlZmVyZW5jZSwgdmFsdWVDb250ZXh0OiB0cy5Tb3VyY2VGaWxlLFxuICAgIHR5cGVDb250ZXh0OiB0cy5Tb3VyY2VGaWxlLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyKTogUjNSZWZlcmVuY2Uge1xuICByZXR1cm4ge1xuICAgIHZhbHVlOiByZWZFbWl0dGVyLmVtaXQodmFsdWVSZWYsIHZhbHVlQ29udGV4dCkuZXhwcmVzc2lvbixcbiAgICB0eXBlOiByZWZFbWl0dGVyXG4gICAgICAgICAgICAgIC5lbWl0KHR5cGVSZWYsIHR5cGVDb250ZXh0LCBJbXBvcnRGbGFncy5Gb3JjZU5ld0ltcG9ydCB8IEltcG9ydEZsYWdzLkFsbG93VHlwZUltcG9ydHMpXG4gICAgICAgICAgICAgIC5leHByZXNzaW9uLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBbmd1bGFyQ29yZShkZWNvcmF0b3I6IERlY29yYXRvcik6IGRlY29yYXRvciBpcyBEZWNvcmF0b3Ime2ltcG9ydDogSW1wb3J0fSB7XG4gIHJldHVybiBkZWNvcmF0b3IuaW1wb3J0ICE9PSBudWxsICYmIGRlY29yYXRvci5pbXBvcnQuZnJvbSA9PT0gJ0Bhbmd1bGFyL2NvcmUnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBbmd1bGFyQ29yZVJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSwgc3ltYm9sTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiByZWZlcmVuY2Uub3duZWRCeU1vZHVsZUd1ZXNzID09PSAnQGFuZ3VsYXIvY29yZScgJiYgcmVmZXJlbmNlLmRlYnVnTmFtZSA9PT0gc3ltYm9sTmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbmd1bGFyRGVjb3JhdG9yKFxuICAgIGRlY29yYXRvcnM6IERlY29yYXRvcltdLCBuYW1lOiBzdHJpbmcsIGlzQ29yZTogYm9vbGVhbik6IERlY29yYXRvcnx1bmRlZmluZWQge1xuICByZXR1cm4gZGVjb3JhdG9ycy5maW5kKGRlY29yYXRvciA9PiBpc0FuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9yLCBuYW1lLCBpc0NvcmUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3I6IERlY29yYXRvciwgbmFtZTogc3RyaW5nLCBpc0NvcmU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKGlzQ29yZSkge1xuICAgIHJldHVybiBkZWNvcmF0b3IubmFtZSA9PT0gbmFtZTtcbiAgfSBlbHNlIGlmIChpc0FuZ3VsYXJDb3JlKGRlY29yYXRvcikpIHtcbiAgICByZXR1cm4gZGVjb3JhdG9yLmltcG9ydC5uYW1lID09PSBuYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBVbndyYXAgYSBgdHMuRXhwcmVzc2lvbmAsIHJlbW92aW5nIG91dGVyIHR5cGUtY2FzdHMgb3IgcGFyZW50aGVzZXMgdW50aWwgdGhlIGV4cHJlc3Npb24gaXMgaW4gaXRzXG4gKiBsb3dlc3QgbGV2ZWwgZm9ybS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhlIGV4cHJlc3Npb24gXCIoZm9vIGFzIFR5cGUpXCIgdW53cmFwcyB0byBcImZvb1wiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwRXhwcmVzc2lvbihub2RlOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gIHdoaWxlICh0cy5pc0FzRXhwcmVzc2lvbihub2RlKSB8fCB0cy5pc1BhcmVudGhlc2l6ZWRFeHByZXNzaW9uKG5vZGUpKSB7XG4gICAgbm9kZSA9IG5vZGUuZXhwcmVzc2lvbjtcbiAgfVxuICByZXR1cm4gbm9kZTtcbn1cblxuZnVuY3Rpb24gZXhwYW5kRm9yd2FyZFJlZihhcmc6IHRzLkV4cHJlc3Npb24pOiB0cy5FeHByZXNzaW9ufG51bGwge1xuICBhcmcgPSB1bndyYXBFeHByZXNzaW9uKGFyZyk7XG4gIGlmICghdHMuaXNBcnJvd0Z1bmN0aW9uKGFyZykgJiYgIXRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKGFyZykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSBhcmcuYm9keTtcbiAgLy8gRWl0aGVyIHRoZSBib2R5IGlzIGEgdHMuRXhwcmVzc2lvbiBkaXJlY3RseSwgb3IgYSBibG9jayB3aXRoIGEgc2luZ2xlIHJldHVybiBzdGF0ZW1lbnQuXG4gIGlmICh0cy5pc0Jsb2NrKGJvZHkpKSB7XG4gICAgLy8gQmxvY2sgYm9keSAtIGxvb2sgZm9yIGEgc2luZ2xlIHJldHVybiBzdGF0ZW1lbnQuXG4gICAgaWYgKGJvZHkuc3RhdGVtZW50cy5sZW5ndGggIT09IDEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzdG10ID0gYm9keS5zdGF0ZW1lbnRzWzBdO1xuICAgIGlmICghdHMuaXNSZXR1cm5TdGF0ZW1lbnQoc3RtdCkgfHwgc3RtdC5leHByZXNzaW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gc3RtdC5leHByZXNzaW9uO1xuICB9IGVsc2Uge1xuICAgIC8vIFNob3J0aGFuZCBib2R5IC0gcmV0dXJuIGFzIGFuIGV4cHJlc3Npb24uXG4gICAgcmV0dXJuIGJvZHk7XG4gIH1cbn1cblxuLyoqXG4gKiBQb3NzaWJseSByZXNvbHZlIGEgZm9yd2FyZFJlZigpIGV4cHJlc3Npb24gaW50byB0aGUgaW5uZXIgdmFsdWUuXG4gKlxuICogQHBhcmFtIG5vZGUgdGhlIGZvcndhcmRSZWYoKSBleHByZXNzaW9uIHRvIHJlc29sdmVcbiAqIEBwYXJhbSByZWZsZWN0b3IgYSBSZWZsZWN0aW9uSG9zdFxuICogQHJldHVybnMgdGhlIHJlc29sdmVkIGV4cHJlc3Npb24sIGlmIHRoZSBvcmlnaW5hbCBleHByZXNzaW9uIHdhcyBhIGZvcndhcmRSZWYoKSwgb3IgdGhlIG9yaWdpbmFsXG4gKiBleHByZXNzaW9uIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwRm9yd2FyZFJlZihub2RlOiB0cy5FeHByZXNzaW9uLCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0KTogdHMuRXhwcmVzc2lvbiB7XG4gIG5vZGUgPSB1bndyYXBFeHByZXNzaW9uKG5vZGUpO1xuICBpZiAoIXRzLmlzQ2FsbEV4cHJlc3Npb24obm9kZSkgfHwgbm9kZS5hcmd1bWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICBjb25zdCBmbiA9XG4gICAgICB0cy5pc1Byb3BlcnR5QWNjZXNzRXhwcmVzc2lvbihub2RlLmV4cHJlc3Npb24pID8gbm9kZS5leHByZXNzaW9uLm5hbWUgOiBub2RlLmV4cHJlc3Npb247XG4gIGlmICghdHMuaXNJZGVudGlmaWVyKGZuKSkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgY29uc3QgZXhwciA9IGV4cGFuZEZvcndhcmRSZWYobm9kZS5hcmd1bWVudHNbMF0pO1xuICBpZiAoZXhwciA9PT0gbnVsbCkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIGNvbnN0IGltcCA9IHJlZmxlY3Rvci5nZXRJbXBvcnRPZklkZW50aWZpZXIoZm4pO1xuICBpZiAoaW1wID09PSBudWxsIHx8IGltcC5mcm9tICE9PSAnQGFuZ3VsYXIvY29yZScgfHwgaW1wLm5hbWUgIT09ICdmb3J3YXJkUmVmJykge1xuICAgIHJldHVybiBub2RlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBleHByO1xuICB9XG59XG5cbi8qKlxuICogQSBmb3JlaWduIGZ1bmN0aW9uIHJlc29sdmVyIGZvciBgc3RhdGljYWxseVJlc29sdmVgIHdoaWNoIHVud3JhcHMgZm9yd2FyZFJlZigpIGV4cHJlc3Npb25zLlxuICpcbiAqIEBwYXJhbSByZWYgYSBSZWZlcmVuY2UgdG8gdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSBmdW5jdGlvbiBiZWluZyBjYWxsZWQgKHdoaWNoIG1pZ2h0IGJlXG4gKiBmb3J3YXJkUmVmKVxuICogQHBhcmFtIGFyZ3MgdGhlIGFyZ3VtZW50cyB0byB0aGUgaW52b2NhdGlvbiBvZiB0aGUgZm9yd2FyZFJlZiBleHByZXNzaW9uXG4gKiBAcmV0dXJucyBhbiB1bndyYXBwZWQgYXJndW1lbnQgaWYgYHJlZmAgcG9pbnRlZCB0byBmb3J3YXJkUmVmLCBvciBudWxsIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yd2FyZFJlZlJlc29sdmVyKFxuICAgIHJlZjogUmVmZXJlbmNlPHRzLkZ1bmN0aW9uRGVjbGFyYXRpb258dHMuTWV0aG9kRGVjbGFyYXRpb258dHMuRnVuY3Rpb25FeHByZXNzaW9uPixcbiAgICBhcmdzOiBSZWFkb25seUFycmF5PHRzLkV4cHJlc3Npb24+KTogdHMuRXhwcmVzc2lvbnxudWxsIHtcbiAgaWYgKCFpc0FuZ3VsYXJDb3JlUmVmZXJlbmNlKHJlZiwgJ2ZvcndhcmRSZWYnKSB8fCBhcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBleHBhbmRGb3J3YXJkUmVmKGFyZ3NbMF0pO1xufVxuXG4vKipcbiAqIENvbWJpbmVzIGFuIGFycmF5IG9mIHJlc29sdmVyIGZ1bmN0aW9ucyBpbnRvIGEgb25lLlxuICogQHBhcmFtIHJlc29sdmVycyBSZXNvbHZlcnMgdG8gYmUgY29tYmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21iaW5lUmVzb2x2ZXJzKHJlc29sdmVyczogRm9yZWlnbkZ1bmN0aW9uUmVzb2x2ZXJbXSk6IEZvcmVpZ25GdW5jdGlvblJlc29sdmVyIHtcbiAgcmV0dXJuIChyZWY6IFJlZmVyZW5jZTx0cy5GdW5jdGlvbkRlY2xhcmF0aW9ufHRzLk1ldGhvZERlY2xhcmF0aW9ufHRzLkZ1bmN0aW9uRXhwcmVzc2lvbj4sXG4gICAgICAgICAgYXJnczogUmVhZG9ubHlBcnJheTx0cy5FeHByZXNzaW9uPik6IHRzLkV4cHJlc3Npb258bnVsbCA9PiB7XG4gICAgZm9yIChjb25zdCByZXNvbHZlciBvZiByZXNvbHZlcnMpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZXIocmVmLCBhcmdzKTtcbiAgICAgIGlmIChyZXNvbHZlZCAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFeHByZXNzaW9uRm9yd2FyZFJlZmVyZW5jZShcbiAgICBleHByOiBFeHByZXNzaW9uLCBjb250ZXh0OiB0cy5Ob2RlLCBjb250ZXh0U291cmNlOiB0cy5Tb3VyY2VGaWxlKTogYm9vbGVhbiB7XG4gIGlmIChpc1dyYXBwZWRUc05vZGVFeHByKGV4cHIpKSB7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmdldE9yaWdpbmFsTm9kZShleHByLm5vZGUpO1xuICAgIHJldHVybiBub2RlLmdldFNvdXJjZUZpbGUoKSA9PT0gY29udGV4dFNvdXJjZSAmJiBjb250ZXh0LnBvcyA8IG5vZGUucG9zO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNXcmFwcGVkVHNOb2RlRXhwcihleHByOiBFeHByZXNzaW9uKTogZXhwciBpcyBXcmFwcGVkTm9kZUV4cHI8dHMuTm9kZT4ge1xuICByZXR1cm4gZXhwciBpbnN0YW5jZW9mIFdyYXBwZWROb2RlRXhwcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRCYXNlQ2xhc3MoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IpOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj58J2R5bmFtaWMnfG51bGwge1xuICBjb25zdCBiYXNlRXhwcmVzc2lvbiA9IHJlZmxlY3Rvci5nZXRCYXNlQ2xhc3NFeHByZXNzaW9uKG5vZGUpO1xuICBpZiAoYmFzZUV4cHJlc3Npb24gIT09IG51bGwpIHtcbiAgICBjb25zdCBiYXNlQ2xhc3MgPSBldmFsdWF0b3IuZXZhbHVhdGUoYmFzZUV4cHJlc3Npb24pO1xuICAgIGlmIChiYXNlQ2xhc3MgaW5zdGFuY2VvZiBSZWZlcmVuY2UgJiYgcmVmbGVjdG9yLmlzQ2xhc3MoYmFzZUNsYXNzLm5vZGUpKSB7XG4gICAgICByZXR1cm4gYmFzZUNsYXNzIGFzIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdkeW5hbWljJztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgcGFyZW5zV3JhcHBlclRyYW5zZm9ybWVyRmFjdG9yeTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLkV4cHJlc3Npb24+ID1cbiAgICAoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KSA9PiB7XG4gICAgICBjb25zdCB2aXNpdG9yOiB0cy5WaXNpdG9yID0gKG5vZGU6IHRzLk5vZGUpOiB0cy5Ob2RlID0+IHtcbiAgICAgICAgY29uc3QgdmlzaXRlZCA9IHRzLnZpc2l0RWFjaENoaWxkKG5vZGUsIHZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgICBpZiAodHMuaXNBcnJvd0Z1bmN0aW9uKHZpc2l0ZWQpIHx8IHRzLmlzRnVuY3Rpb25FeHByZXNzaW9uKHZpc2l0ZWQpKSB7XG4gICAgICAgICAgcmV0dXJuIHRzLmNyZWF0ZVBhcmVuKHZpc2l0ZWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2aXNpdGVkO1xuICAgICAgfTtcbiAgICAgIHJldHVybiAobm9kZTogdHMuRXhwcmVzc2lvbikgPT4gdHMudmlzaXRFYWNoQ2hpbGQobm9kZSwgdmlzaXRvciwgY29udGV4dCk7XG4gICAgfTtcblxuLyoqXG4gKiBXcmFwcyBhbGwgZnVuY3Rpb25zIGluIGEgZ2l2ZW4gZXhwcmVzc2lvbiBpbiBwYXJlbnRoZXNlcy4gVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcHJvYmxlbXNcbiAqIHdoZXJlIFRzaWNrbGUgYW5ub3RhdGlvbnMgYWRkZWQgYmV0d2VlbiBhbmFseXNlIGFuZCB0cmFuc2Zvcm0gcGhhc2VzIGluIEFuZ3VsYXIgbWF5IHRyaWdnZXJcbiAqIGF1dG9tYXRpYyBzZW1pY29sb24gaW5zZXJ0aW9uLCBlLmcuIGlmIGEgZnVuY3Rpb24gaXMgdGhlIGV4cHJlc3Npb24gaW4gYSBgcmV0dXJuYCBzdGF0ZW1lbnQuXG4gKiBNb3JlXG4gKiBpbmZvIGNhbiBiZSBmb3VuZCBpbiBUc2lja2xlIHNvdXJjZSBjb2RlIGhlcmU6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci90c2lja2xlL2Jsb2IvZDc5NzQyNjI1NzFjOGExN2Q2ODRlNWJhMDc2ODBlMWIxOTkzYWZkZC9zcmMvanNkb2NfdHJhbnNmb3JtZXIudHMjTDEwMjFcbiAqXG4gKiBAcGFyYW0gZXhwcmVzc2lvbiBFeHByZXNzaW9uIHdoZXJlIGZ1bmN0aW9ucyBzaG91bGQgYmUgd3JhcHBlZCBpbiBwYXJlbnRoZXNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVucyhleHByZXNzaW9uOiB0cy5FeHByZXNzaW9uKTogdHMuRXhwcmVzc2lvbiB7XG4gIHJldHVybiB0cy50cmFuc2Zvcm0oZXhwcmVzc2lvbiwgW3BhcmVuc1dyYXBwZXJUcmFuc2Zvcm1lckZhY3RvcnldKS50cmFuc2Zvcm1lZFswXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBgdHMuRGlhZ25vc3RpY2Agd2hpY2ggaW5kaWNhdGVzIHRoZSBnaXZlbiBjbGFzcyBpcyBwYXJ0IG9mIHRoZSBkZWNsYXJhdGlvbnMgb2YgdHdvIG9yXG4gKiBtb3JlIE5nTW9kdWxlcy5cbiAqXG4gKiBUaGUgcmVzdWx0aW5nIGB0cy5EaWFnbm9zdGljYCB3aWxsIGhhdmUgYSBjb250ZXh0IGVudHJ5IGZvciBlYWNoIE5nTW9kdWxlIHNob3dpbmcgdGhlIHBvaW50IHdoZXJlXG4gKiB0aGUgZGlyZWN0aXZlL3BpcGUgZXhpc3RzIGluIGl0cyBgZGVjbGFyYXRpb25zYCAoaWYgcG9zc2libGUpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUR1cGxpY2F0ZURlY2xhcmF0aW9uRXJyb3IoXG4gICAgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgZGF0YTogRGVjbGFyYXRpb25EYXRhW10sIGtpbmQ6IHN0cmluZyk6IHRzLkRpYWdub3N0aWMge1xuICBjb25zdCBjb250ZXh0OiB0cy5EaWFnbm9zdGljUmVsYXRlZEluZm9ybWF0aW9uW10gPSBbXTtcbiAgZm9yIChjb25zdCBkZWNsIG9mIGRhdGEpIHtcbiAgICBpZiAoZGVjbC5yYXdEZWNsYXJhdGlvbnMgPT09IG51bGwpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBUcnkgdG8gZmluZCB0aGUgcmVmZXJlbmNlIHRvIHRoZSBkZWNsYXJhdGlvbiB3aXRoaW4gdGhlIGRlY2xhcmF0aW9ucyBhcnJheSwgdG8gaGFuZyB0aGVcbiAgICAvLyBlcnJvciB0aGVyZS4gSWYgaXQgY2FuJ3QgYmUgZm91bmQsIGZhbGwgYmFjayBvbiB1c2luZyB0aGUgTmdNb2R1bGUncyBuYW1lLlxuICAgIGNvbnN0IGNvbnRleHROb2RlID0gZGVjbC5yZWYuZ2V0T3JpZ2luRm9yRGlhZ25vc3RpY3MoZGVjbC5yYXdEZWNsYXJhdGlvbnMsIGRlY2wubmdNb2R1bGUubmFtZSk7XG4gICAgY29udGV4dC5wdXNoKG1ha2VSZWxhdGVkSW5mb3JtYXRpb24oXG4gICAgICAgIGNvbnRleHROb2RlLFxuICAgICAgICBgJyR7bm9kZS5uYW1lLnRleHR9JyBpcyBsaXN0ZWQgaW4gdGhlIGRlY2xhcmF0aW9ucyBvZiB0aGUgTmdNb2R1bGUgJyR7XG4gICAgICAgICAgICBkZWNsLm5nTW9kdWxlLm5hbWUudGV4dH0nLmApKTtcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHByb2R1Y2UgdGhlIGRpYWdub3N0aWMuXG4gIHJldHVybiBtYWtlRGlhZ25vc3RpYyhcbiAgICAgIEVycm9yQ29kZS5OR01PRFVMRV9ERUNMQVJBVElPTl9OT1RfVU5JUVVFLCBub2RlLm5hbWUsXG4gICAgICBgVGhlICR7a2luZH0gJyR7bm9kZS5uYW1lLnRleHR9JyBpcyBkZWNsYXJlZCBieSBtb3JlIHRoYW4gb25lIE5nTW9kdWxlLmAsIGNvbnRleHQpO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIHRoZSBnaXZlbiBgcmF3UHJvdmlkZXJzYCBpbnRvIGBDbGFzc0RlY2xhcmF0aW9uc2AgYW5kIHJldHVybnNcbiAqIGEgc2V0IGNvbnRhaW5pbmcgdGhvc2UgdGhhdCBhcmUga25vd24gdG8gcmVxdWlyZSBhIGZhY3RvcnkgZGVmaW5pdGlvbi5cbiAqIEBwYXJhbSByYXdQcm92aWRlcnMgRXhwcmVzc2lvbiB0aGF0IGRlY2xhcmVkIHRoZSBwcm92aWRlcnMgYXJyYXkgaW4gdGhlIHNvdXJjZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5KFxuICAgIHJhd1Byb3ZpZGVyczogdHMuRXhwcmVzc2lvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IpOiBTZXQ8UmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PiB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IG5ldyBTZXQ8UmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PigpO1xuICBjb25zdCByZXNvbHZlZFByb3ZpZGVycyA9IGV2YWx1YXRvci5ldmFsdWF0ZShyYXdQcm92aWRlcnMpO1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShyZXNvbHZlZFByb3ZpZGVycykpIHtcbiAgICByZXR1cm4gcHJvdmlkZXJzO1xuICB9XG5cbiAgcmVzb2x2ZWRQcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbiBwcm9jZXNzUHJvdmlkZXJzKHByb3ZpZGVyKSB7XG4gICAgbGV0IHRva2VuQ2xhc3M6IFJlZmVyZW5jZXxudWxsID0gbnVsbDtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHByb3ZpZGVyKSkge1xuICAgICAgLy8gSWYgd2UgcmFuIGludG8gYW4gYXJyYXksIHJlY3Vyc2UgaW50byBpdCB1bnRpbCB3ZSd2ZSByZXNvbHZlIGFsbCB0aGUgY2xhc3Nlcy5cbiAgICAgIHByb3ZpZGVyLmZvckVhY2gocHJvY2Vzc1Byb3ZpZGVycyk7XG4gICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFJlZmVyZW5jZSkge1xuICAgICAgdG9rZW5DbGFzcyA9IHByb3ZpZGVyO1xuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBNYXAgJiYgcHJvdmlkZXIuaGFzKCd1c2VDbGFzcycpICYmICFwcm92aWRlci5oYXMoJ2RlcHMnKSkge1xuICAgICAgY29uc3QgdXNlRXhpc3RpbmcgPSBwcm92aWRlci5nZXQoJ3VzZUNsYXNzJykhO1xuICAgICAgaWYgKHVzZUV4aXN0aW5nIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICAgIHRva2VuQ2xhc3MgPSB1c2VFeGlzdGluZztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPKGFseGh1Yik6IHRoZXJlIHdhcyBhIGJ1ZyB3aGVyZSBgZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzYCB3b3VsZCByZXR1cm4gYG51bGxgIGZvciBhXG4gICAgLy8gY2xhc3MgaW4gYSAuZC50cyBmaWxlLCBhbHdheXMsIGV2ZW4gaWYgdGhlIGNsYXNzIGhhZCBhIGNvbnN0cnVjdG9yLiBUaGlzIHdhcyBmaXhlZCBmb3JcbiAgICAvLyBgZ2V0Q29uc3RydWN0b3JQYXJhbWV0ZXJzYCwgYnV0IHRoYXQgZml4IGNhdXNlcyBtb3JlIGNsYXNzZXMgdG8gYmUgcmVjb2duaXplZCBoZXJlIGFzIG5lZWRpbmdcbiAgICAvLyBwcm92aWRlciBjaGVja3MsIHdoaWNoIGlzIGEgYnJlYWtpbmcgY2hhbmdlIGluIGczLiBBdm9pZCB0aGlzIGJyZWFrYWdlIGZvciBub3cgYnkgc2tpcHBpbmdcbiAgICAvLyBjbGFzc2VzIGZyb20gLmQudHMgZmlsZXMgaGVyZSBkaXJlY3RseSwgdW50aWwgZzMgY2FuIGJlIGNsZWFuZWQgdXAuXG4gICAgaWYgKHRva2VuQ2xhc3MgIT09IG51bGwgJiYgIXRva2VuQ2xhc3Mubm9kZS5nZXRTb3VyY2VGaWxlKCkuaXNEZWNsYXJhdGlvbkZpbGUgJiZcbiAgICAgICAgcmVmbGVjdG9yLmlzQ2xhc3ModG9rZW5DbGFzcy5ub2RlKSkge1xuICAgICAgY29uc3QgY29uc3RydWN0b3JQYXJhbWV0ZXJzID0gcmVmbGVjdG9yLmdldENvbnN0cnVjdG9yUGFyYW1ldGVycyh0b2tlbkNsYXNzLm5vZGUpO1xuXG4gICAgICAvLyBOb3RlIHRoYXQgd2Ugb25seSB3YW50IHRvIGNhcHR1cmUgcHJvdmlkZXJzIHdpdGggYSBub24tdHJpdmlhbCBjb25zdHJ1Y3RvcixcbiAgICAgIC8vIGJlY2F1c2UgdGhleSdyZSB0aGUgb25lcyB0aGF0IG1pZ2h0IGJlIHVzaW5nIERJIGFuZCBuZWVkIHRvIGJlIGRlY29yYXRlZC5cbiAgICAgIGlmIChjb25zdHJ1Y3RvclBhcmFtZXRlcnMgIT09IG51bGwgJiYgY29uc3RydWN0b3JQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcHJvdmlkZXJzLmFkZCh0b2tlbkNsYXNzIGFzIFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcHJvdmlkZXJzO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBSM1JlZmVyZW5jZSBmb3IgYSBjbGFzcy5cbiAqXG4gKiBUaGUgYHZhbHVlYCBpcyB0aGUgZXhwb3J0ZWQgZGVjbGFyYXRpb24gb2YgdGhlIGNsYXNzIGZyb20gaXRzIHNvdXJjZSBmaWxlLlxuICogVGhlIGB0eXBlYCBpcyBhbiBleHByZXNzaW9uIHRoYXQgd291bGQgYmUgdXNlZCBieSBuZ2NjIGluIHRoZSB0eXBpbmdzICguZC50cykgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3cmFwVHlwZVJlZmVyZW5jZShyZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IFIzUmVmZXJlbmNlIHtcbiAgY29uc3QgZHRzQ2xhc3MgPSByZWZsZWN0b3IuZ2V0RHRzRGVjbGFyYXRpb24oY2xhenopO1xuICBjb25zdCB2YWx1ZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIoY2xhenoubmFtZSk7XG4gIGNvbnN0IHR5cGUgPSBkdHNDbGFzcyAhPT0gbnVsbCAmJiBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbihkdHNDbGFzcykgP1xuICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihkdHNDbGFzcy5uYW1lKSA6XG4gICAgICB2YWx1ZTtcbiAgcmV0dXJuIHt2YWx1ZSwgdHlwZX07XG59XG5cbi8qKiBDcmVhdGVzIGEgUGFyc2VTb3VyY2VTcGFuIGZvciBhIFR5cGVTY3JpcHQgbm9kZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb3VyY2VTcGFuKG5vZGU6IHRzLk5vZGUpOiBQYXJzZVNvdXJjZVNwYW4ge1xuICBjb25zdCBzZiA9IG5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICBjb25zdCBbc3RhcnRPZmZzZXQsIGVuZE9mZnNldF0gPSBbbm9kZS5nZXRTdGFydCgpLCBub2RlLmdldEVuZCgpXTtcbiAgY29uc3Qge2xpbmU6IHN0YXJ0TGluZSwgY2hhcmFjdGVyOiBzdGFydENvbH0gPSBzZi5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzdGFydE9mZnNldCk7XG4gIGNvbnN0IHtsaW5lOiBlbmRMaW5lLCBjaGFyYWN0ZXI6IGVuZENvbH0gPSBzZi5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihlbmRPZmZzZXQpO1xuICBjb25zdCBwYXJzZVNmID0gbmV3IFBhcnNlU291cmNlRmlsZShzZi5nZXRGdWxsVGV4dCgpLCBzZi5maWxlTmFtZSk7XG5cbiAgLy8gKzEgYmVjYXVzZSB2YWx1ZXMgYXJlIHplcm8taW5kZXhlZC5cbiAgcmV0dXJuIG5ldyBQYXJzZVNvdXJjZVNwYW4oXG4gICAgICBuZXcgUGFyc2VMb2NhdGlvbihwYXJzZVNmLCBzdGFydE9mZnNldCwgc3RhcnRMaW5lICsgMSwgc3RhcnRDb2wgKyAxKSxcbiAgICAgIG5ldyBQYXJzZUxvY2F0aW9uKHBhcnNlU2YsIGVuZE9mZnNldCwgZW5kTGluZSArIDEsIGVuZENvbCArIDEpKTtcbn1cbiJdfQ==