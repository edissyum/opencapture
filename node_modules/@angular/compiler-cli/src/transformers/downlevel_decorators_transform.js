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
        define("@angular/compiler-cli/src/transformers/downlevel_decorators_transform", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/transformers/patch_alias_reference_resolution"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDownlevelDecoratorsTransform = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var patch_alias_reference_resolution_1 = require("@angular/compiler-cli/src/transformers/patch_alias_reference_resolution");
    /**
     * Whether a given decorator should be treated as an Angular decorator.
     * Either it's used in @angular/core, or it's imported from there.
     */
    function isAngularDecorator(decorator, isCore) {
        return isCore || (decorator.import !== null && decorator.import.from === '@angular/core');
    }
    /*
     #####################################################################
      Code below has been extracted from the tsickle decorator downlevel transformer
      and a few local modifications have been applied:
    
        1. Tsickle by default processed all decorators that had the `@Annotation` JSDoc.
           We modified the transform to only be concerned with known Angular decorators.
        2. Tsickle by default added `@nocollapse` to all generated `ctorParameters` properties.
           We only do this when `annotateForClosureCompiler` is enabled.
        3. Tsickle does not handle union types for dependency injection. i.e. if a injected type
           is denoted with `@Optional`, the actual type could be set to `T | null`.
           See: https://github.com/angular/angular-cli/commit/826803d0736b807867caff9f8903e508970ad5e4.
        4. Tsickle relied on `emitDecoratorMetadata` to be set to `true`. This is due to a limitation
           in TypeScript transformers that never has been fixed. We were able to work around this
           limitation so that `emitDecoratorMetadata` doesn't need to be specified.
           See: `patchAliasReferenceResolution` for more details.
    
      Here is a link to the tsickle revision on which this transformer is based:
      https://github.com/angular/tsickle/blob/fae06becb1570f491806060d83f29f2d50c43cdd/src/decorator_downlevel_transformer.ts
     #####################################################################
    */
    /**
     * Creates the AST for the decorator field type annotation, which has the form
     *     { type: Function, args?: any[] }[]
     */
    function createDecoratorInvocationType() {
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)), undefined));
        return ts.createArrayTypeNode(ts.createTypeLiteralNode(typeElements));
    }
    /**
     * Extracts the type of the decorator (the function or expression invoked), as well as all the
     * arguments passed to the decorator. Returns an AST with the form:
     *
     *     // For @decorator(arg1, arg2)
     *     { type: decorator, args: [arg1, arg2] }
     */
    function extractMetadataFromSingleDecorator(decorator, diagnostics) {
        var e_1, _a;
        var metadataProperties = [];
        var expr = decorator.expression;
        switch (expr.kind) {
            case ts.SyntaxKind.Identifier:
                // The decorator was a plain @Foo.
                metadataProperties.push(ts.createPropertyAssignment('type', expr));
                break;
            case ts.SyntaxKind.CallExpression:
                // The decorator was a call, like @Foo(bar).
                var call = expr;
                metadataProperties.push(ts.createPropertyAssignment('type', call.expression));
                if (call.arguments.length) {
                    var args = [];
                    try {
                        for (var _b = tslib_1.__values(call.arguments), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var arg = _c.value;
                            args.push(arg);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var argsArrayLiteral = ts.createArrayLiteral(args);
                    argsArrayLiteral.elements.hasTrailingComma = true;
                    metadataProperties.push(ts.createPropertyAssignment('args', argsArrayLiteral));
                }
                break;
            default:
                diagnostics.push({
                    file: decorator.getSourceFile(),
                    start: decorator.getStart(),
                    length: decorator.getEnd() - decorator.getStart(),
                    messageText: ts.SyntaxKind[decorator.kind] + " not implemented in gathering decorator metadata.",
                    category: ts.DiagnosticCategory.Error,
                    code: 0,
                });
                break;
        }
        return ts.createObjectLiteral(metadataProperties);
    }
    /**
     * Takes a list of decorator metadata object ASTs and produces an AST for a
     * static class property of an array of those metadata objects.
     */
    function createDecoratorClassProperty(decoratorList) {
        var modifier = ts.createToken(ts.SyntaxKind.StaticKeyword);
        var type = createDecoratorInvocationType();
        var initializer = ts.createArrayLiteral(decoratorList, true);
        // NB: the .decorators property does not get a @nocollapse property. There is
        // no good reason why - it means .decorators is not runtime accessible if you
        // compile with collapse properties, whereas propDecorators is, which doesn't
        // follow any stringent logic. However this has been the case previously, and
        // adding it back in leads to substantial code size increases as Closure fails
        // to tree shake these props without @nocollapse.
        return ts.createProperty(undefined, [modifier], 'decorators', undefined, type, initializer);
    }
    /**
     * Creates the AST for the 'ctorParameters' field type annotation:
     *   () => ({ type: any, decorators?: {type: Function, args?: any[]}[] }|null)[]
     */
    function createCtorParametersClassPropertyType() {
        // Sorry about this. Try reading just the string literals below.
        var typeElements = [];
        typeElements.push(ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined), undefined));
        typeElements.push(ts.createPropertySignature(undefined, 'decorators', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeLiteralNode([
            ts.createPropertySignature(undefined, 'type', undefined, ts.createTypeReferenceNode(ts.createIdentifier('Function'), undefined), undefined),
            ts.createPropertySignature(undefined, 'args', ts.createToken(ts.SyntaxKind.QuestionToken), ts.createArrayTypeNode(ts.createTypeReferenceNode(ts.createIdentifier('any'), undefined)), undefined),
        ])), undefined));
        // TODO(alan-agius4): Remove when we no longer support TS 3.9
        var nullLiteral = ts.createNull();
        var nullType = ts.versionMajorMinor.charAt(0) === '4' ?
            ts.createLiteralTypeNode(nullLiteral) :
            nullLiteral;
        return ts.createFunctionTypeNode(undefined, [], ts.createArrayTypeNode(ts.createUnionTypeNode([
            ts.createTypeLiteralNode(typeElements),
            nullType,
        ])));
    }
    /**
     * Sets a Closure \@nocollapse synthetic comment on the given node. This prevents Closure Compiler
     * from collapsing the apparently static property, which would make it impossible to find for code
     * trying to detect it at runtime.
     */
    function addNoCollapseComment(n) {
        ts.setSyntheticLeadingComments(n, [{
                kind: ts.SyntaxKind.MultiLineCommentTrivia,
                text: '* @nocollapse ',
                pos: -1,
                end: -1,
                hasTrailingNewLine: true
            }]);
    }
    /**
     * createCtorParametersClassProperty creates a static 'ctorParameters' property containing
     * downleveled decorator information.
     *
     * The property contains an arrow function that returns an array of object literals of the shape:
     *     static ctorParameters = () => [{
     *       type: SomeClass|undefined,  // the type of the param that's decorated, if it's a value.
     *       decorators: [{
     *         type: DecoratorFn,  // the type of the decorator that's invoked.
     *         args: [ARGS],       // the arguments passed to the decorator.
     *       }]
     *     }];
     */
    function createCtorParametersClassProperty(diagnostics, entityNameToExpression, ctorParameters, isClosureCompilerEnabled) {
        var e_2, _a, e_3, _b;
        var params = [];
        try {
            for (var ctorParameters_1 = tslib_1.__values(ctorParameters), ctorParameters_1_1 = ctorParameters_1.next(); !ctorParameters_1_1.done; ctorParameters_1_1 = ctorParameters_1.next()) {
                var ctorParam = ctorParameters_1_1.value;
                if (!ctorParam.type && ctorParam.decorators.length === 0) {
                    params.push(ts.createNull());
                    continue;
                }
                var paramType = ctorParam.type ?
                    typeReferenceToExpression(entityNameToExpression, ctorParam.type) :
                    undefined;
                var members = [ts.createPropertyAssignment('type', paramType || ts.createIdentifier('undefined'))];
                var decorators = [];
                try {
                    for (var _c = (e_3 = void 0, tslib_1.__values(ctorParam.decorators)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var deco = _d.value;
                        decorators.push(extractMetadataFromSingleDecorator(deco, diagnostics));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                if (decorators.length) {
                    members.push(ts.createPropertyAssignment('decorators', ts.createArrayLiteral(decorators)));
                }
                params.push(ts.createObjectLiteral(members));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (ctorParameters_1_1 && !ctorParameters_1_1.done && (_a = ctorParameters_1.return)) _a.call(ctorParameters_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var initializer = ts.createArrowFunction(undefined, undefined, [], undefined, ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.createArrayLiteral(params, true));
        var type = createCtorParametersClassPropertyType();
        var ctorProp = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'ctorParameters', undefined, type, initializer);
        if (isClosureCompilerEnabled) {
            addNoCollapseComment(ctorProp);
        }
        return ctorProp;
    }
    /**
     * createPropDecoratorsClassProperty creates a static 'propDecorators' property containing type
     * information for every property that has a decorator applied.
     *
     *     static propDecorators: {[key: string]: {type: Function, args?: any[]}[]} = {
     *       propA: [{type: MyDecorator, args: [1, 2]}, ...],
     *       ...
     *     };
     */
    function createPropDecoratorsClassProperty(diagnostics, properties) {
        var e_4, _a;
        //  `static propDecorators: {[key: string]: ` + {type: Function, args?: any[]}[] + `} = {\n`);
        var entries = [];
        try {
            for (var _b = tslib_1.__values(properties.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), name = _d[0], decorators = _d[1];
                entries.push(ts.createPropertyAssignment(name, ts.createArrayLiteral(decorators.map(function (deco) { return extractMetadataFromSingleDecorator(deco, diagnostics); }))));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        var initializer = ts.createObjectLiteral(entries, true);
        var type = ts.createTypeLiteralNode([ts.createIndexSignature(undefined, undefined, [ts.createParameter(undefined, undefined, undefined, 'key', undefined, ts.createTypeReferenceNode('string', undefined), undefined)], createDecoratorInvocationType())]);
        return ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], 'propDecorators', undefined, type, initializer);
    }
    /**
     * Returns an expression representing the (potentially) value part for the given node.
     *
     * This is a partial re-implementation of TypeScript's serializeTypeReferenceNode. This is a
     * workaround for https://github.com/Microsoft/TypeScript/issues/17516 (serializeTypeReferenceNode
     * not being exposed). In practice this implementation is sufficient for Angular's use of type
     * metadata.
     */
    function typeReferenceToExpression(entityNameToExpression, node) {
        var kind = node.kind;
        if (ts.isLiteralTypeNode(node)) {
            // Treat literal types like their base type (boolean, string, number).
            kind = node.literal.kind;
        }
        switch (kind) {
            case ts.SyntaxKind.FunctionType:
            case ts.SyntaxKind.ConstructorType:
                return ts.createIdentifier('Function');
            case ts.SyntaxKind.ArrayType:
            case ts.SyntaxKind.TupleType:
                return ts.createIdentifier('Array');
            case ts.SyntaxKind.TypePredicate:
            case ts.SyntaxKind.TrueKeyword:
            case ts.SyntaxKind.FalseKeyword:
            case ts.SyntaxKind.BooleanKeyword:
                return ts.createIdentifier('Boolean');
            case ts.SyntaxKind.StringLiteral:
            case ts.SyntaxKind.StringKeyword:
                return ts.createIdentifier('String');
            case ts.SyntaxKind.ObjectKeyword:
                return ts.createIdentifier('Object');
            case ts.SyntaxKind.NumberKeyword:
            case ts.SyntaxKind.NumericLiteral:
                return ts.createIdentifier('Number');
            case ts.SyntaxKind.TypeReference:
                var typeRef = node;
                // Ignore any generic types, just return the base type.
                return entityNameToExpression(typeRef.typeName);
            case ts.SyntaxKind.UnionType:
                // TODO(alan-agius4): remove `t.kind !== ts.SyntaxKind.NullKeyword` when
                // TS 3.9 support is dropped. In TS 4.0 NullKeyword is a child of LiteralType.
                var childTypeNodes = node
                    .types.filter(function (t) { return t.kind !== ts.SyntaxKind.NullKeyword &&
                    !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword); });
                return childTypeNodes.length === 1 ?
                    typeReferenceToExpression(entityNameToExpression, childTypeNodes[0]) :
                    undefined;
            default:
                return undefined;
        }
    }
    /**
     * Checks whether a given symbol refers to a value that exists at runtime (as distinct from a type).
     *
     * Expands aliases, which is important for the case where
     *   import * as x from 'some-module';
     * and x is now a value (the module object).
     */
    function symbolIsRuntimeValue(typeChecker, symbol) {
        if (symbol.flags & ts.SymbolFlags.Alias) {
            symbol = typeChecker.getAliasedSymbol(symbol);
        }
        // Note that const enums are a special case, because
        // while they have a value, they don't exist at runtime.
        return (symbol.flags & ts.SymbolFlags.Value & ts.SymbolFlags.ConstEnumExcludes) !== 0;
    }
    /**
     * Gets a transformer for downleveling Angular decorators.
     * @param typeChecker Reference to the program's type checker.
     * @param host Reflection host that is used for determining decorators.
     * @param diagnostics List which will be populated with diagnostics if any.
     * @param isCore Whether the current TypeScript program is for the `@angular/core` package.
     * @param isClosureCompilerEnabled Whether closure annotations need to be added where needed.
     * @param skipClassDecorators Whether class decorators should be skipped from downleveling.
     *   This is useful for JIT mode where class decorators should be preserved as they could rely
     *   on immediate execution. e.g. downleveling `@Injectable` means that the injectable factory
     *   is not created, and injecting the token will not work. If this decorator would not be
     *   downleveled, the `Injectable` decorator will execute immediately on file load, and
     *   Angular will generate the corresponding injectable factory.
     */
    function getDownlevelDecoratorsTransform(typeChecker, host, diagnostics, isCore, isClosureCompilerEnabled, skipClassDecorators) {
        return function (context) {
            var referencedParameterTypes = new Set();
            /**
             * Converts an EntityName (from a type annotation) to an expression (accessing a value).
             *
             * For a given qualified name, this walks depth first to find the leftmost identifier,
             * and then converts the path into a property access that can be used as expression.
             */
            function entityNameToExpression(name) {
                var symbol = typeChecker.getSymbolAtLocation(name);
                // Check if the entity name references a symbol that is an actual value. If it is not, it
                // cannot be referenced by an expression, so return undefined.
                if (!symbol || !symbolIsRuntimeValue(typeChecker, symbol) || !symbol.declarations ||
                    symbol.declarations.length === 0) {
                    return undefined;
                }
                // If we deal with a qualified name, build up a property access expression
                // that could be used in the JavaScript output.
                if (ts.isQualifiedName(name)) {
                    var containerExpr = entityNameToExpression(name.left);
                    if (containerExpr === undefined) {
                        return undefined;
                    }
                    return ts.createPropertyAccess(containerExpr, name.right);
                }
                var decl = symbol.declarations[0];
                // If the given entity name has been resolved to an alias import declaration,
                // ensure that the alias declaration is not elided by TypeScript, and use its
                // name identifier to reference it at runtime.
                if (patch_alias_reference_resolution_1.isAliasImportDeclaration(decl)) {
                    referencedParameterTypes.add(decl);
                    // If the entity name resolves to an alias import declaration, we reference the
                    // entity based on the alias import name. This ensures that TypeScript properly
                    // resolves the link to the import. Cloning the original entity name identifier
                    // could lead to an incorrect resolution at local scope. e.g. Consider the following
                    // snippet: `constructor(Dep: Dep) {}`. In such a case, the local `Dep` identifier
                    // would resolve to the actual parameter name, and not to the desired import.
                    // This happens because the entity name identifier symbol is internally considered
                    // as type-only and therefore TypeScript tries to resolve it as value manually.
                    // We can help TypeScript and avoid this non-reliable resolution by using an identifier
                    // that is not type-only and is directly linked to the import alias declaration.
                    if (decl.name !== undefined) {
                        return ts.getMutableClone(decl.name);
                    }
                }
                // Clone the original entity name identifier so that it can be used to reference
                // its value at runtime. This is used when the identifier is resolving to a file
                // local declaration (otherwise it would resolve to an alias import declaration).
                return ts.getMutableClone(name);
            }
            /**
             * Transforms a class element. Returns a three tuple of name, transformed element, and
             * decorators found. Returns an undefined name if there are no decorators to lower on the
             * element, or the element has an exotic name.
             */
            function transformClassElement(element) {
                var e_5, _a;
                element = ts.visitEachChild(element, decoratorDownlevelVisitor, context);
                var decoratorsToKeep = [];
                var toLower = [];
                var decorators = host.getDecoratorsOfDeclaration(element) || [];
                try {
                    for (var decorators_1 = tslib_1.__values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                        var decorator = decorators_1_1.value;
                        // We only deal with concrete nodes in TypeScript sources, so we don't
                        // need to handle synthetically created decorators.
                        var decoratorNode = decorator.node;
                        if (!isAngularDecorator(decorator, isCore)) {
                            decoratorsToKeep.push(decoratorNode);
                            continue;
                        }
                        toLower.push(decoratorNode);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (decorators_1_1 && !decorators_1_1.done && (_a = decorators_1.return)) _a.call(decorators_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (!toLower.length)
                    return [undefined, element, []];
                if (!element.name || !ts.isIdentifier(element.name)) {
                    // Method has a weird name, e.g.
                    //   [Symbol.foo]() {...}
                    diagnostics.push({
                        file: element.getSourceFile(),
                        start: element.getStart(),
                        length: element.getEnd() - element.getStart(),
                        messageText: "Cannot process decorators for class element with non-analyzable name.",
                        category: ts.DiagnosticCategory.Error,
                        code: 0,
                    });
                    return [undefined, element, []];
                }
                var name = element.name.text;
                var mutable = ts.getMutableClone(element);
                mutable.decorators = decoratorsToKeep.length ?
                    ts.setTextRange(ts.createNodeArray(decoratorsToKeep), mutable.decorators) :
                    undefined;
                return [name, mutable, toLower];
            }
            /**
             * Transforms a constructor. Returns the transformed constructor and the list of parameter
             * information collected, consisting of decorators and optional type.
             */
            function transformConstructor(ctor) {
                var e_6, _a, e_7, _b;
                ctor = ts.visitEachChild(ctor, decoratorDownlevelVisitor, context);
                var newParameters = [];
                var oldParameters = ts.visitParameterList(ctor.parameters, decoratorDownlevelVisitor, context);
                var parametersInfo = [];
                try {
                    for (var oldParameters_1 = tslib_1.__values(oldParameters), oldParameters_1_1 = oldParameters_1.next(); !oldParameters_1_1.done; oldParameters_1_1 = oldParameters_1.next()) {
                        var param = oldParameters_1_1.value;
                        var decoratorsToKeep = [];
                        var paramInfo = { decorators: [], type: null };
                        var decorators = host.getDecoratorsOfDeclaration(param) || [];
                        try {
                            for (var decorators_2 = (e_7 = void 0, tslib_1.__values(decorators)), decorators_2_1 = decorators_2.next(); !decorators_2_1.done; decorators_2_1 = decorators_2.next()) {
                                var decorator = decorators_2_1.value;
                                // We only deal with concrete nodes in TypeScript sources, so we don't
                                // need to handle synthetically created decorators.
                                var decoratorNode = decorator.node;
                                if (!isAngularDecorator(decorator, isCore)) {
                                    decoratorsToKeep.push(decoratorNode);
                                    continue;
                                }
                                paramInfo.decorators.push(decoratorNode);
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (decorators_2_1 && !decorators_2_1.done && (_b = decorators_2.return)) _b.call(decorators_2);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        if (param.type) {
                            // param has a type provided, e.g. "foo: Bar".
                            // The type will be emitted as a value expression in entityNameToExpression, which takes
                            // care not to emit anything for types that cannot be expressed as a value (e.g.
                            // interfaces).
                            paramInfo.type = param.type;
                        }
                        parametersInfo.push(paramInfo);
                        var newParam = ts.updateParameter(param, 
                        // Must pass 'undefined' to avoid emitting decorator metadata.
                        decoratorsToKeep.length ? decoratorsToKeep : undefined, param.modifiers, param.dotDotDotToken, param.name, param.questionToken, param.type, param.initializer);
                        newParameters.push(newParam);
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (oldParameters_1_1 && !oldParameters_1_1.done && (_a = oldParameters_1.return)) _a.call(oldParameters_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                var updated = ts.updateConstructor(ctor, ctor.decorators, ctor.modifiers, newParameters, ts.visitFunctionBody(ctor.body, decoratorDownlevelVisitor, context));
                return [updated, parametersInfo];
            }
            /**
             * Transforms a single class declaration:
             * - dispatches to strip decorators on members
             * - converts decorators on the class to annotations
             * - creates a ctorParameters property
             * - creates a propDecorators property
             */
            function transformClassDeclaration(classDecl) {
                var e_8, _a, e_9, _b;
                classDecl = ts.getMutableClone(classDecl);
                var newMembers = [];
                var decoratedProperties = new Map();
                var classParameters = null;
                try {
                    for (var _c = tslib_1.__values(classDecl.members), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var member = _d.value;
                        switch (member.kind) {
                            case ts.SyntaxKind.PropertyDeclaration:
                            case ts.SyntaxKind.GetAccessor:
                            case ts.SyntaxKind.SetAccessor:
                            case ts.SyntaxKind.MethodDeclaration: {
                                var _e = tslib_1.__read(transformClassElement(member), 3), name = _e[0], newMember = _e[1], decorators = _e[2];
                                newMembers.push(newMember);
                                if (name)
                                    decoratedProperties.set(name, decorators);
                                continue;
                            }
                            case ts.SyntaxKind.Constructor: {
                                var ctor = member;
                                if (!ctor.body)
                                    break;
                                var _f = tslib_1.__read(transformConstructor(member), 2), newMember = _f[0], parametersInfo = _f[1];
                                classParameters = parametersInfo;
                                newMembers.push(newMember);
                                continue;
                            }
                            default:
                                break;
                        }
                        newMembers.push(ts.visitEachChild(member, decoratorDownlevelVisitor, context));
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                // The `ReflectionHost.getDecoratorsOfDeclaration()` method will not return certain kinds of
                // decorators that will never be Angular decorators. So we cannot rely on it to capture all
                // the decorators that should be kept. Instead we start off with a set of the raw decorators
                // on the class, and only remove the ones that have been identified for downleveling.
                var decoratorsToKeep = new Set(classDecl.decorators);
                var possibleAngularDecorators = host.getDecoratorsOfDeclaration(classDecl) || [];
                var hasAngularDecorator = false;
                var decoratorsToLower = [];
                try {
                    for (var possibleAngularDecorators_1 = tslib_1.__values(possibleAngularDecorators), possibleAngularDecorators_1_1 = possibleAngularDecorators_1.next(); !possibleAngularDecorators_1_1.done; possibleAngularDecorators_1_1 = possibleAngularDecorators_1.next()) {
                        var decorator = possibleAngularDecorators_1_1.value;
                        // We only deal with concrete nodes in TypeScript sources, so we don't
                        // need to handle synthetically created decorators.
                        var decoratorNode = decorator.node;
                        var isNgDecorator = isAngularDecorator(decorator, isCore);
                        // Keep track if we come across an Angular class decorator. This is used
                        // for to determine whether constructor parameters should be captured or not.
                        if (isNgDecorator) {
                            hasAngularDecorator = true;
                        }
                        if (isNgDecorator && !skipClassDecorators) {
                            decoratorsToLower.push(extractMetadataFromSingleDecorator(decoratorNode, diagnostics));
                            decoratorsToKeep.delete(decoratorNode);
                        }
                    }
                }
                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                finally {
                    try {
                        if (possibleAngularDecorators_1_1 && !possibleAngularDecorators_1_1.done && (_b = possibleAngularDecorators_1.return)) _b.call(possibleAngularDecorators_1);
                    }
                    finally { if (e_9) throw e_9.error; }
                }
                if (decoratorsToLower.length) {
                    newMembers.push(createDecoratorClassProperty(decoratorsToLower));
                }
                if (classParameters) {
                    if (hasAngularDecorator || classParameters.some(function (p) { return !!p.decorators.length; })) {
                        // Capture constructor parameters if the class has Angular decorator applied,
                        // or if any of the parameters has decorators applied directly.
                        newMembers.push(createCtorParametersClassProperty(diagnostics, entityNameToExpression, classParameters, isClosureCompilerEnabled));
                    }
                }
                if (decoratedProperties.size) {
                    newMembers.push(createPropDecoratorsClassProperty(diagnostics, decoratedProperties));
                }
                var members = ts.setTextRange(ts.createNodeArray(newMembers, classDecl.members.hasTrailingComma), classDecl.members);
                return ts.updateClassDeclaration(classDecl, decoratorsToKeep.size ? Array.from(decoratorsToKeep) : undefined, classDecl.modifiers, classDecl.name, classDecl.typeParameters, classDecl.heritageClauses, members);
            }
            /**
             * Transformer visitor that looks for Angular decorators and replaces them with
             * downleveled static properties. Also collects constructor type metadata for
             * class declaration that are decorated with an Angular decorator.
             */
            function decoratorDownlevelVisitor(node) {
                if (ts.isClassDeclaration(node)) {
                    return transformClassDeclaration(node);
                }
                return ts.visitEachChild(node, decoratorDownlevelVisitor, context);
            }
            return function (sf) {
                // Ensure that referenced type symbols are not elided by TypeScript. Imports for
                // such parameter type symbols previously could be type-only, but now might be also
                // used in the `ctorParameters` static property as a value. We want to make sure
                // that TypeScript does not elide imports for such type references. Read more
                // about this in the description for `patchAliasReferenceResolution`.
                patch_alias_reference_resolution_1.patchAliasReferenceResolutionOrDie(context, referencedParameterTypes);
                // Downlevel decorators and constructor parameter types. We will keep track of all
                // referenced constructor parameter types so that we can instruct TypeScript to
                // not elide their imports if they previously were only type-only.
                return ts.visitEachChild(sf, decoratorDownlevelVisitor, context);
            };
        };
    }
    exports.getDownlevelDecoratorsTransform = getDownlevelDecoratorsTransform;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxldmVsX2RlY29yYXRvcnNfdHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvZG93bmxldmVsX2RlY29yYXRvcnNfdHJhbnNmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakMsNEhBQWdIO0lBRWhIOzs7T0FHRztJQUNILFNBQVMsa0JBQWtCLENBQUMsU0FBb0IsRUFBRSxNQUFlO1FBQy9ELE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDLENBQUM7SUFDNUYsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQW9CRTtJQUVGOzs7T0FHRztJQUNILFNBQVMsNkJBQTZCO1FBQ3BDLElBQU0sWUFBWSxHQUFxQixFQUFFLENBQUM7UUFDMUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQ3hDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUM1QixFQUFFLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQ3hDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUM5RCxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxTQUFTLENB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QUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRTNGLE9BQU8sRUFBRSxDQUFDLHNCQUFzQixDQUM1QixTQUFTLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDM0UsU0FBUyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLGVBQWUsRUFDeEYsT0FBTyxDQUFDLENBQUM7WUFDZixDQUFDO1lBRUQ7Ozs7ZUFJRztZQUNILFNBQVMseUJBQXlCLENBQUMsSUFBYTtnQkFDOUMsSUFBSSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQy9CLE9BQU8seUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hDO2dCQUNELE9BQU8sRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELE9BQU8sVUFBQyxFQUFpQjtnQkFDdkIsZ0ZBQWdGO2dCQUNoRixtRkFBbUY7Z0JBQ25GLGdGQUFnRjtnQkFDaEYsNkVBQTZFO2dCQUM3RSxxRUFBcUU7Z0JBQ3JFLHFFQUFrQyxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO2dCQUN0RSxrRkFBa0Y7Z0JBQ2xGLCtFQUErRTtnQkFDL0Usa0VBQWtFO2dCQUNsRSxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLHlCQUF5QixFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7SUF6UUQsMEVBeVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9uZ3RzYy9yZWZsZWN0aW9uJztcbmltcG9ydCB7aXNBbGlhc0ltcG9ydERlY2xhcmF0aW9uLCBwYXRjaEFsaWFzUmVmZXJlbmNlUmVzb2x1dGlvbk9yRGllfSBmcm9tICcuL3BhdGNoX2FsaWFzX3JlZmVyZW5jZV9yZXNvbHV0aW9uJztcblxuLyoqXG4gKiBXaGV0aGVyIGEgZ2l2ZW4gZGVjb3JhdG9yIHNob3VsZCBiZSB0cmVhdGVkIGFzIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLlxuICogRWl0aGVyIGl0J3MgdXNlZCBpbiBAYW5ndWxhci9jb3JlLCBvciBpdCdzIGltcG9ydGVkIGZyb20gdGhlcmUuXG4gKi9cbmZ1bmN0aW9uIGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3I6IERlY29yYXRvciwgaXNDb3JlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0NvcmUgfHwgKGRlY29yYXRvci5pbXBvcnQgIT09IG51bGwgJiYgZGVjb3JhdG9yLmltcG9ydC5mcm9tID09PSAnQGFuZ3VsYXIvY29yZScpO1xufVxuXG4vKlxuICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBDb2RlIGJlbG93IGhhcyBiZWVuIGV4dHJhY3RlZCBmcm9tIHRoZSB0c2lja2xlIGRlY29yYXRvciBkb3dubGV2ZWwgdHJhbnNmb3JtZXJcbiAgYW5kIGEgZmV3IGxvY2FsIG1vZGlmaWNhdGlvbnMgaGF2ZSBiZWVuIGFwcGxpZWQ6XG5cbiAgICAxLiBUc2lja2xlIGJ5IGRlZmF1bHQgcHJvY2Vzc2VkIGFsbCBkZWNvcmF0b3JzIHRoYXQgaGFkIHRoZSBgQEFubm90YXRpb25gIEpTRG9jLlxuICAgICAgIFdlIG1vZGlmaWVkIHRoZSB0cmFuc2Zvcm0gdG8gb25seSBiZSBjb25jZXJuZWQgd2l0aCBrbm93biBBbmd1bGFyIGRlY29yYXRvcnMuXG4gICAgMi4gVHNpY2tsZSBieSBkZWZhdWx0IGFkZGVkIGBAbm9jb2xsYXBzZWAgdG8gYWxsIGdlbmVyYXRlZCBgY3RvclBhcmFtZXRlcnNgIHByb3BlcnRpZXMuXG4gICAgICAgV2Ugb25seSBkbyB0aGlzIHdoZW4gYGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyYCBpcyBlbmFibGVkLlxuICAgIDMuIFRzaWNrbGUgZG9lcyBub3QgaGFuZGxlIHVuaW9uIHR5cGVzIGZvciBkZXBlbmRlbmN5IGluamVjdGlvbi4gaS5lLiBpZiBhIGluamVjdGVkIHR5cGVcbiAgICAgICBpcyBkZW5vdGVkIHdpdGggYEBPcHRpb25hbGAsIHRoZSBhY3R1YWwgdHlwZSBjb3VsZCBiZSBzZXQgdG8gYFQgfCBudWxsYC5cbiAgICAgICBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2NvbW1pdC84MjY4MDNkMDczNmI4MDc4NjdjYWZmOWY4OTAzZTUwODk3MGFkNWU0LlxuICAgIDQuIFRzaWNrbGUgcmVsaWVkIG9uIGBlbWl0RGVjb3JhdG9yTWV0YWRhdGFgIHRvIGJlIHNldCB0byBgdHJ1ZWAuIFRoaXMgaXMgZHVlIHRvIGEgbGltaXRhdGlvblxuICAgICAgIGluIFR5cGVTY3JpcHQgdHJhbnNmb3JtZXJzIHRoYXQgbmV2ZXIgaGFzIGJlZW4gZml4ZWQuIFdlIHdlcmUgYWJsZSB0byB3b3JrIGFyb3VuZCB0aGlzXG4gICAgICAgbGltaXRhdGlvbiBzbyB0aGF0IGBlbWl0RGVjb3JhdG9yTWV0YWRhdGFgIGRvZXNuJ3QgbmVlZCB0byBiZSBzcGVjaWZpZWQuXG4gICAgICAgU2VlOiBgcGF0Y2hBbGlhc1JlZmVyZW5jZVJlc29sdXRpb25gIGZvciBtb3JlIGRldGFpbHMuXG5cbiAgSGVyZSBpcyBhIGxpbmsgdG8gdGhlIHRzaWNrbGUgcmV2aXNpb24gb24gd2hpY2ggdGhpcyB0cmFuc2Zvcm1lciBpcyBiYXNlZDpcbiAgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvdHNpY2tsZS9ibG9iL2ZhZTA2YmVjYjE1NzBmNDkxODA2MDYwZDgzZjI5ZjJkNTBjNDNjZGQvc3JjL2RlY29yYXRvcl9kb3dubGV2ZWxfdHJhbnNmb3JtZXIudHNcbiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiovXG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgQVNUIGZvciB0aGUgZGVjb3JhdG9yIGZpZWxkIHR5cGUgYW5ub3RhdGlvbiwgd2hpY2ggaGFzIHRoZSBmb3JtXG4gKiAgICAgeyB0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdIH1bXVxuICovXG5mdW5jdGlvbiBjcmVhdGVEZWNvcmF0b3JJbnZvY2F0aW9uVHlwZSgpOiB0cy5UeXBlTm9kZSB7XG4gIGNvbnN0IHR5cGVFbGVtZW50czogdHMuVHlwZUVsZW1lbnRbXSA9IFtdO1xuICB0eXBlRWxlbWVudHMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eVNpZ25hdHVyZShcbiAgICAgIHVuZGVmaW5lZCwgJ3R5cGUnLCB1bmRlZmluZWQsXG4gICAgICB0cy5jcmVhdGVUeXBlUmVmZXJlbmNlTm9kZSh0cy5jcmVhdGVJZGVudGlmaWVyKCdGdW5jdGlvbicpLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpKTtcbiAgdHlwZUVsZW1lbnRzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsICdhcmdzJywgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5RdWVzdGlvblRva2VuKSxcbiAgICAgIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlS2V5d29yZFR5cGVOb2RlKHRzLlN5bnRheEtpbmQuQW55S2V5d29yZCkpLCB1bmRlZmluZWQpKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKHR5cGVFbGVtZW50cykpO1xufVxuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSB0eXBlIG9mIHRoZSBkZWNvcmF0b3IgKHRoZSBmdW5jdGlvbiBvciBleHByZXNzaW9uIGludm9rZWQpLCBhcyB3ZWxsIGFzIGFsbCB0aGVcbiAqIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGRlY29yYXRvci4gUmV0dXJucyBhbiBBU1Qgd2l0aCB0aGUgZm9ybTpcbiAqXG4gKiAgICAgLy8gRm9yIEBkZWNvcmF0b3IoYXJnMSwgYXJnMilcbiAqICAgICB7IHR5cGU6IGRlY29yYXRvciwgYXJnczogW2FyZzEsIGFyZzJdIH1cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihcbiAgICBkZWNvcmF0b3I6IHRzLkRlY29yYXRvciwgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSk6IHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uIHtcbiAgY29uc3QgbWV0YWRhdGFQcm9wZXJ0aWVzOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudExpa2VbXSA9IFtdO1xuICBjb25zdCBleHByID0gZGVjb3JhdG9yLmV4cHJlc3Npb247XG4gIHN3aXRjaCAoZXhwci5raW5kKSB7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIHBsYWluIEBGb28uXG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBleHByKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIHdhcyBhIGNhbGwsIGxpa2UgQEZvbyhiYXIpLlxuICAgICAgY29uc3QgY2FsbCA9IGV4cHIgYXMgdHMuQ2FsbEV4cHJlc3Npb247XG4gICAgICBtZXRhZGF0YVByb3BlcnRpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoJ3R5cGUnLCBjYWxsLmV4cHJlc3Npb24pKTtcbiAgICAgIGlmIChjYWxsLmFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgYXJnczogdHMuRXhwcmVzc2lvbltdID0gW107XG4gICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGNhbGwuYXJndW1lbnRzKSB7XG4gICAgICAgICAgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXJnc0FycmF5TGl0ZXJhbCA9IHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChhcmdzKTtcbiAgICAgICAgYXJnc0FycmF5TGl0ZXJhbC5lbGVtZW50cy5oYXNUcmFpbGluZ0NvbW1hID0gdHJ1ZTtcbiAgICAgICAgbWV0YWRhdGFQcm9wZXJ0aWVzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdhcmdzJywgYXJnc0FycmF5TGl0ZXJhbCkpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goe1xuICAgICAgICBmaWxlOiBkZWNvcmF0b3IuZ2V0U291cmNlRmlsZSgpLFxuICAgICAgICBzdGFydDogZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIGxlbmd0aDogZGVjb3JhdG9yLmdldEVuZCgpIC0gZGVjb3JhdG9yLmdldFN0YXJ0KCksXG4gICAgICAgIG1lc3NhZ2VUZXh0OlxuICAgICAgICAgICAgYCR7dHMuU3ludGF4S2luZFtkZWNvcmF0b3Iua2luZF19IG5vdCBpbXBsZW1lbnRlZCBpbiBnYXRoZXJpbmcgZGVjb3JhdG9yIG1ldGFkYXRhLmAsXG4gICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgIGNvZGU6IDAsXG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB0cy5jcmVhdGVPYmplY3RMaXRlcmFsKG1ldGFkYXRhUHJvcGVydGllcyk7XG59XG5cbi8qKlxuICogVGFrZXMgYSBsaXN0IG9mIGRlY29yYXRvciBtZXRhZGF0YSBvYmplY3QgQVNUcyBhbmQgcHJvZHVjZXMgYW4gQVNUIGZvciBhXG4gKiBzdGF0aWMgY2xhc3MgcHJvcGVydHkgb2YgYW4gYXJyYXkgb2YgdGhvc2UgbWV0YWRhdGEgb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGVjb3JhdG9yQ2xhc3NQcm9wZXJ0eShkZWNvcmF0b3JMaXN0OiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbltdKSB7XG4gIGNvbnN0IG1vZGlmaWVyID0gdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKTtcbiAgY29uc3QgdHlwZSA9IGNyZWF0ZURlY29yYXRvckludm9jYXRpb25UeXBlKCk7XG4gIGNvbnN0IGluaXRpYWxpemVyID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGRlY29yYXRvckxpc3QsIHRydWUpO1xuICAvLyBOQjogdGhlIC5kZWNvcmF0b3JzIHByb3BlcnR5IGRvZXMgbm90IGdldCBhIEBub2NvbGxhcHNlIHByb3BlcnR5LiBUaGVyZSBpc1xuICAvLyBubyBnb29kIHJlYXNvbiB3aHkgLSBpdCBtZWFucyAuZGVjb3JhdG9ycyBpcyBub3QgcnVudGltZSBhY2Nlc3NpYmxlIGlmIHlvdVxuICAvLyBjb21waWxlIHdpdGggY29sbGFwc2UgcHJvcGVydGllcywgd2hlcmVhcyBwcm9wRGVjb3JhdG9ycyBpcywgd2hpY2ggZG9lc24ndFxuICAvLyBmb2xsb3cgYW55IHN0cmluZ2VudCBsb2dpYy4gSG93ZXZlciB0aGlzIGhhcyBiZWVuIHRoZSBjYXNlIHByZXZpb3VzbHksIGFuZFxuICAvLyBhZGRpbmcgaXQgYmFjayBpbiBsZWFkcyB0byBzdWJzdGFudGlhbCBjb2RlIHNpemUgaW5jcmVhc2VzIGFzIENsb3N1cmUgZmFpbHNcbiAgLy8gdG8gdHJlZSBzaGFrZSB0aGVzZSBwcm9wcyB3aXRob3V0IEBub2NvbGxhcHNlLlxuICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHkodW5kZWZpbmVkLCBbbW9kaWZpZXJdLCAnZGVjb3JhdG9ycycsIHVuZGVmaW5lZCwgdHlwZSwgaW5pdGlhbGl6ZXIpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIEFTVCBmb3IgdGhlICdjdG9yUGFyYW1ldGVycycgZmllbGQgdHlwZSBhbm5vdGF0aW9uOlxuICogICAoKSA9PiAoeyB0eXBlOiBhbnksIGRlY29yYXRvcnM/OiB7dHlwZTogRnVuY3Rpb24sIGFyZ3M/OiBhbnlbXX1bXSB9fG51bGwpW11cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5VHlwZSgpOiB0cy5UeXBlTm9kZSB7XG4gIC8vIFNvcnJ5IGFib3V0IHRoaXMuIFRyeSByZWFkaW5nIGp1c3QgdGhlIHN0cmluZyBsaXRlcmFscyBiZWxvdy5cbiAgY29uc3QgdHlwZUVsZW1lbnRzOiB0cy5UeXBlRWxlbWVudFtdID0gW107XG4gIHR5cGVFbGVtZW50cy5wdXNoKHRzLmNyZWF0ZVByb3BlcnR5U2lnbmF0dXJlKFxuICAgICAgdW5kZWZpbmVkLCAndHlwZScsIHVuZGVmaW5lZCxcbiAgICAgIHRzLmNyZWF0ZVR5cGVSZWZlcmVuY2VOb2RlKHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2FueScpLCB1bmRlZmluZWQpLCB1bmRlZmluZWQpKTtcbiAgdHlwZUVsZW1lbnRzLnB1c2godHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsICdkZWNvcmF0b3JzJywgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5RdWVzdGlvblRva2VuKSxcbiAgICAgIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUodHMuY3JlYXRlVHlwZUxpdGVyYWxOb2RlKFtcbiAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICAgICAgICB1bmRlZmluZWQsICd0eXBlJywgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdHMuY3JlYXRlVHlwZVJlZmVyZW5jZU5vZGUodHMuY3JlYXRlSWRlbnRpZmllcignRnVuY3Rpb24nKSwgdW5kZWZpbmVkKSwgdW5kZWZpbmVkKSxcbiAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlTaWduYXR1cmUoXG4gICAgICAgICAgICB1bmRlZmluZWQsICdhcmdzJywgdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5RdWVzdGlvblRva2VuKSxcbiAgICAgICAgICAgIHRzLmNyZWF0ZUFycmF5VHlwZU5vZGUoXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlVHlwZVJlZmVyZW5jZU5vZGUodHMuY3JlYXRlSWRlbnRpZmllcignYW55JyksIHVuZGVmaW5lZCkpLFxuICAgICAgICAgICAgdW5kZWZpbmVkKSxcbiAgICAgIF0pKSxcbiAgICAgIHVuZGVmaW5lZCkpO1xuXG4gIC8vIFRPRE8oYWxhbi1hZ2l1czQpOiBSZW1vdmUgd2hlbiB3ZSBubyBsb25nZXIgc3VwcG9ydCBUUyAzLjlcbiAgY29uc3QgbnVsbExpdGVyYWwgPSB0cy5jcmVhdGVOdWxsKCkgYXMgYW55O1xuICBjb25zdCBudWxsVHlwZSA9IHRzLnZlcnNpb25NYWpvck1pbm9yLmNoYXJBdCgwKSA9PT0gJzQnID9cbiAgICAgIHRzLmNyZWF0ZUxpdGVyYWxUeXBlTm9kZShudWxsTGl0ZXJhbCBhcyBhbnkpIDpcbiAgICAgIG51bGxMaXRlcmFsO1xuICByZXR1cm4gdHMuY3JlYXRlRnVuY3Rpb25UeXBlTm9kZSh1bmRlZmluZWQsIFtdLCB0cy5jcmVhdGVBcnJheVR5cGVOb2RlKHRzLmNyZWF0ZVVuaW9uVHlwZU5vZGUoW1xuICAgIHRzLmNyZWF0ZVR5cGVMaXRlcmFsTm9kZSh0eXBlRWxlbWVudHMpLFxuICAgIG51bGxUeXBlLFxuICBdKSkpO1xufVxuXG4vKipcbiAqIFNldHMgYSBDbG9zdXJlIFxcQG5vY29sbGFwc2Ugc3ludGhldGljIGNvbW1lbnQgb24gdGhlIGdpdmVuIG5vZGUuIFRoaXMgcHJldmVudHMgQ2xvc3VyZSBDb21waWxlclxuICogZnJvbSBjb2xsYXBzaW5nIHRoZSBhcHBhcmVudGx5IHN0YXRpYyBwcm9wZXJ0eSwgd2hpY2ggd291bGQgbWFrZSBpdCBpbXBvc3NpYmxlIHRvIGZpbmQgZm9yIGNvZGVcbiAqIHRyeWluZyB0byBkZXRlY3QgaXQgYXQgcnVudGltZS5cbiAqL1xuZnVuY3Rpb24gYWRkTm9Db2xsYXBzZUNvbW1lbnQobjogdHMuTm9kZSkge1xuICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMobiwgW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnKiBAbm9jb2xsYXBzZSAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3M6IC0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQ6IC0xLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNUcmFpbGluZ05ld0xpbmU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dKTtcbn1cblxuLyoqXG4gKiBjcmVhdGVDdG9yUGFyYW1ldGVyc0NsYXNzUHJvcGVydHkgY3JlYXRlcyBhIHN0YXRpYyAnY3RvclBhcmFtZXRlcnMnIHByb3BlcnR5IGNvbnRhaW5pbmdcbiAqIGRvd25sZXZlbGVkIGRlY29yYXRvciBpbmZvcm1hdGlvbi5cbiAqXG4gKiBUaGUgcHJvcGVydHkgY29udGFpbnMgYW4gYXJyb3cgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdCBsaXRlcmFscyBvZiB0aGUgc2hhcGU6XG4gKiAgICAgc3RhdGljIGN0b3JQYXJhbWV0ZXJzID0gKCkgPT4gW3tcbiAqICAgICAgIHR5cGU6IFNvbWVDbGFzc3x1bmRlZmluZWQsICAvLyB0aGUgdHlwZSBvZiB0aGUgcGFyYW0gdGhhdCdzIGRlY29yYXRlZCwgaWYgaXQncyBhIHZhbHVlLlxuICogICAgICAgZGVjb3JhdG9yczogW3tcbiAqICAgICAgICAgdHlwZTogRGVjb3JhdG9yRm4sICAvLyB0aGUgdHlwZSBvZiB0aGUgZGVjb3JhdG9yIHRoYXQncyBpbnZva2VkLlxuICogICAgICAgICBhcmdzOiBbQVJHU10sICAgICAgIC8vIHRoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBkZWNvcmF0b3IuXG4gKiAgICAgICB9XVxuICogICAgIH1dO1xuICovXG5mdW5jdGlvbiBjcmVhdGVDdG9yUGFyYW1ldGVyc0NsYXNzUHJvcGVydHkoXG4gICAgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSxcbiAgICBlbnRpdHlOYW1lVG9FeHByZXNzaW9uOiAobjogdHMuRW50aXR5TmFtZSkgPT4gdHMuRXhwcmVzc2lvbiB8IHVuZGVmaW5lZCxcbiAgICBjdG9yUGFyYW1ldGVyczogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXSxcbiAgICBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4pOiB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uIHtcbiAgY29uc3QgcGFyYW1zOiB0cy5FeHByZXNzaW9uW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IGN0b3JQYXJhbSBvZiBjdG9yUGFyYW1ldGVycykge1xuICAgIGlmICghY3RvclBhcmFtLnR5cGUgJiYgY3RvclBhcmFtLmRlY29yYXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICBwYXJhbXMucHVzaCh0cy5jcmVhdGVOdWxsKCkpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1UeXBlID0gY3RvclBhcmFtLnR5cGUgP1xuICAgICAgICB0eXBlUmVmZXJlbmNlVG9FeHByZXNzaW9uKGVudGl0eU5hbWVUb0V4cHJlc3Npb24sIGN0b3JQYXJhbS50eXBlKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICBjb25zdCBtZW1iZXJzID1cbiAgICAgICAgW3RzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCgndHlwZScsIHBhcmFtVHlwZSB8fCB0cy5jcmVhdGVJZGVudGlmaWVyKCd1bmRlZmluZWQnKSldO1xuXG4gICAgY29uc3QgZGVjb3JhdG9yczogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb25bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgZGVjbyBvZiBjdG9yUGFyYW0uZGVjb3JhdG9ycykge1xuICAgICAgZGVjb3JhdG9ycy5wdXNoKGV4dHJhY3RNZXRhZGF0YUZyb21TaW5nbGVEZWNvcmF0b3IoZGVjbywgZGlhZ25vc3RpY3MpKTtcbiAgICB9XG4gICAgaWYgKGRlY29yYXRvcnMubGVuZ3RoKSB7XG4gICAgICBtZW1iZXJzLnB1c2godHMuY3JlYXRlUHJvcGVydHlBc3NpZ25tZW50KCdkZWNvcmF0b3JzJywgdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGRlY29yYXRvcnMpKSk7XG4gICAgfVxuICAgIHBhcmFtcy5wdXNoKHRzLmNyZWF0ZU9iamVjdExpdGVyYWwobWVtYmVycykpO1xuICB9XG5cbiAgY29uc3QgaW5pdGlhbGl6ZXIgPSB0cy5jcmVhdGVBcnJvd0Z1bmN0aW9uKFxuICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFtdLCB1bmRlZmluZWQsIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuRXF1YWxzR3JlYXRlclRoYW5Ub2tlbiksXG4gICAgICB0cy5jcmVhdGVBcnJheUxpdGVyYWwocGFyYW1zLCB0cnVlKSk7XG4gIGNvbnN0IHR5cGUgPSBjcmVhdGVDdG9yUGFyYW1ldGVyc0NsYXNzUHJvcGVydHlUeXBlKCk7XG4gIGNvbnN0IGN0b3JQcm9wID0gdHMuY3JlYXRlUHJvcGVydHkoXG4gICAgICB1bmRlZmluZWQsIFt0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpXSwgJ2N0b3JQYXJhbWV0ZXJzJywgdW5kZWZpbmVkLCB0eXBlLFxuICAgICAgaW5pdGlhbGl6ZXIpO1xuICBpZiAoaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkKSB7XG4gICAgYWRkTm9Db2xsYXBzZUNvbW1lbnQoY3RvclByb3ApO1xuICB9XG4gIHJldHVybiBjdG9yUHJvcDtcbn1cblxuLyoqXG4gKiBjcmVhdGVQcm9wRGVjb3JhdG9yc0NsYXNzUHJvcGVydHkgY3JlYXRlcyBhIHN0YXRpYyAncHJvcERlY29yYXRvcnMnIHByb3BlcnR5IGNvbnRhaW5pbmcgdHlwZVxuICogaW5mb3JtYXRpb24gZm9yIGV2ZXJ5IHByb3BlcnR5IHRoYXQgaGFzIGEgZGVjb3JhdG9yIGFwcGxpZWQuXG4gKlxuICogICAgIHN0YXRpYyBwcm9wRGVjb3JhdG9yczoge1trZXk6IHN0cmluZ106IHt0eXBlOiBGdW5jdGlvbiwgYXJncz86IGFueVtdfVtdfSA9IHtcbiAqICAgICAgIHByb3BBOiBbe3R5cGU6IE15RGVjb3JhdG9yLCBhcmdzOiBbMSwgMl19LCAuLi5dLFxuICogICAgICAgLi4uXG4gKiAgICAgfTtcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUHJvcERlY29yYXRvcnNDbGFzc1Byb3BlcnR5KFxuICAgIGRpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10sIHByb3BlcnRpZXM6IE1hcDxzdHJpbmcsIHRzLkRlY29yYXRvcltdPik6IHRzLlByb3BlcnR5RGVjbGFyYXRpb24ge1xuICAvLyAgYHN0YXRpYyBwcm9wRGVjb3JhdG9yczoge1trZXk6IHN0cmluZ106IGAgKyB7dHlwZTogRnVuY3Rpb24sIGFyZ3M/OiBhbnlbXX1bXSArIGB9ID0ge1xcbmApO1xuICBjb25zdCBlbnRyaWVzOiB0cy5PYmplY3RMaXRlcmFsRWxlbWVudExpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IFtuYW1lLCBkZWNvcmF0b3JzXSBvZiBwcm9wZXJ0aWVzLmVudHJpZXMoKSkge1xuICAgIGVudHJpZXMucHVzaCh0cy5jcmVhdGVQcm9wZXJ0eUFzc2lnbm1lbnQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHRzLmNyZWF0ZUFycmF5TGl0ZXJhbChcbiAgICAgICAgICAgIGRlY29yYXRvcnMubWFwKGRlY28gPT4gZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihkZWNvLCBkaWFnbm9zdGljcykpKSkpO1xuICB9XG4gIGNvbnN0IGluaXRpYWxpemVyID0gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChlbnRyaWVzLCB0cnVlKTtcbiAgY29uc3QgdHlwZSA9IHRzLmNyZWF0ZVR5cGVMaXRlcmFsTm9kZShbdHMuY3JlYXRlSW5kZXhTaWduYXR1cmUoXG4gICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgW3RzLmNyZWF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgJ2tleScsIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHMuY3JlYXRlVHlwZVJlZmVyZW5jZU5vZGUoJ3N0cmluZycsIHVuZGVmaW5lZCksIHVuZGVmaW5lZCldLFxuICAgICAgY3JlYXRlRGVjb3JhdG9ySW52b2NhdGlvblR5cGUoKSldKTtcbiAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5KFxuICAgICAgdW5kZWZpbmVkLCBbdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKV0sICdwcm9wRGVjb3JhdG9ycycsIHVuZGVmaW5lZCwgdHlwZSxcbiAgICAgIGluaXRpYWxpemVyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIHRoZSAocG90ZW50aWFsbHkpIHZhbHVlIHBhcnQgZm9yIHRoZSBnaXZlbiBub2RlLlxuICpcbiAqIFRoaXMgaXMgYSBwYXJ0aWFsIHJlLWltcGxlbWVudGF0aW9uIG9mIFR5cGVTY3JpcHQncyBzZXJpYWxpemVUeXBlUmVmZXJlbmNlTm9kZS4gVGhpcyBpcyBhXG4gKiB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzE3NTE2IChzZXJpYWxpemVUeXBlUmVmZXJlbmNlTm9kZVxuICogbm90IGJlaW5nIGV4cG9zZWQpLiBJbiBwcmFjdGljZSB0aGlzIGltcGxlbWVudGF0aW9uIGlzIHN1ZmZpY2llbnQgZm9yIEFuZ3VsYXIncyB1c2Ugb2YgdHlwZVxuICogbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIHR5cGVSZWZlcmVuY2VUb0V4cHJlc3Npb24oXG4gICAgZW50aXR5TmFtZVRvRXhwcmVzc2lvbjogKG46IHRzLkVudGl0eU5hbWUpID0+IHRzLkV4cHJlc3Npb24gfCB1bmRlZmluZWQsXG4gICAgbm9kZTogdHMuVHlwZU5vZGUpOiB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZCB7XG4gIGxldCBraW5kID0gbm9kZS5raW5kO1xuICBpZiAodHMuaXNMaXRlcmFsVHlwZU5vZGUobm9kZSkpIHtcbiAgICAvLyBUcmVhdCBsaXRlcmFsIHR5cGVzIGxpa2UgdGhlaXIgYmFzZSB0eXBlIChib29sZWFuLCBzdHJpbmcsIG51bWJlcikuXG4gICAga2luZCA9IG5vZGUubGl0ZXJhbC5raW5kO1xuICB9XG4gIHN3aXRjaCAoa2luZCkge1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvblR5cGU6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yVHlwZTpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCdGdW5jdGlvbicpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheVR5cGU6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlR1cGxlVHlwZTpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCdBcnJheScpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlUHJlZGljYXRlOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZDpcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuRmFsc2VLZXl3b3JkOlxuICAgIGNhc2UgdHMuU3ludGF4S2luZC5Cb29sZWFuS2V5d29yZDpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVJZGVudGlmaWVyKCdCb29sZWFuJyk7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0tleXdvcmQ6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignU3RyaW5nJyk7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLk9iamVjdEtleXdvcmQ6XG4gICAgICByZXR1cm4gdHMuY3JlYXRlSWRlbnRpZmllcignT2JqZWN0Jyk7XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWJlcktleXdvcmQ6XG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ051bWJlcicpO1xuICAgIGNhc2UgdHMuU3ludGF4S2luZC5UeXBlUmVmZXJlbmNlOlxuICAgICAgY29uc3QgdHlwZVJlZiA9IG5vZGUgYXMgdHMuVHlwZVJlZmVyZW5jZU5vZGU7XG4gICAgICAvLyBJZ25vcmUgYW55IGdlbmVyaWMgdHlwZXMsIGp1c3QgcmV0dXJuIHRoZSBiYXNlIHR5cGUuXG4gICAgICByZXR1cm4gZW50aXR5TmFtZVRvRXhwcmVzc2lvbih0eXBlUmVmLnR5cGVOYW1lKTtcbiAgICBjYXNlIHRzLlN5bnRheEtpbmQuVW5pb25UeXBlOlxuICAgICAgLy8gVE9ETyhhbGFuLWFnaXVzNCk6IHJlbW92ZSBgdC5raW5kICE9PSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkYCB3aGVuXG4gICAgICAvLyBUUyAzLjkgc3VwcG9ydCBpcyBkcm9wcGVkLiBJbiBUUyA0LjAgTnVsbEtleXdvcmQgaXMgYSBjaGlsZCBvZiBMaXRlcmFsVHlwZS5cbiAgICAgIGNvbnN0IGNoaWxkVHlwZU5vZGVzID1cbiAgICAgICAgICAobm9kZSBhcyB0cy5VbmlvblR5cGVOb2RlKVxuICAgICAgICAgICAgICAudHlwZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgdCA9PiB0LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAhKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKHQpICYmIHQubGl0ZXJhbC5raW5kID09PSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkKSk7XG4gICAgICByZXR1cm4gY2hpbGRUeXBlTm9kZXMubGVuZ3RoID09PSAxID9cbiAgICAgICAgICB0eXBlUmVmZXJlbmNlVG9FeHByZXNzaW9uKGVudGl0eU5hbWVUb0V4cHJlc3Npb24sIGNoaWxkVHlwZU5vZGVzWzBdKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzeW1ib2wgcmVmZXJzIHRvIGEgdmFsdWUgdGhhdCBleGlzdHMgYXQgcnVudGltZSAoYXMgZGlzdGluY3QgZnJvbSBhIHR5cGUpLlxuICpcbiAqIEV4cGFuZHMgYWxpYXNlcywgd2hpY2ggaXMgaW1wb3J0YW50IGZvciB0aGUgY2FzZSB3aGVyZVxuICogICBpbXBvcnQgKiBhcyB4IGZyb20gJ3NvbWUtbW9kdWxlJztcbiAqIGFuZCB4IGlzIG5vdyBhIHZhbHVlICh0aGUgbW9kdWxlIG9iamVjdCkuXG4gKi9cbmZ1bmN0aW9uIHN5bWJvbElzUnVudGltZVZhbHVlKHR5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciwgc3ltYm9sOiB0cy5TeW1ib2wpOiBib29sZWFuIHtcbiAgaWYgKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLkFsaWFzKSB7XG4gICAgc3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0QWxpYXNlZFN5bWJvbChzeW1ib2wpO1xuICB9XG5cbiAgLy8gTm90ZSB0aGF0IGNvbnN0IGVudW1zIGFyZSBhIHNwZWNpYWwgY2FzZSwgYmVjYXVzZVxuICAvLyB3aGlsZSB0aGV5IGhhdmUgYSB2YWx1ZSwgdGhleSBkb24ndCBleGlzdCBhdCBydW50aW1lLlxuICByZXR1cm4gKHN5bWJvbC5mbGFncyAmIHRzLlN5bWJvbEZsYWdzLlZhbHVlICYgdHMuU3ltYm9sRmxhZ3MuQ29uc3RFbnVtRXhjbHVkZXMpICE9PSAwO1xufVxuXG4vKiogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm8gZGVzY3JpYmVzIHRoZSBpbmZvcm1hdGlvbiBmb3IgYSBzaW5nbGUgY29uc3RydWN0b3IgcGFyYW1ldGVyLiAqL1xuaW50ZXJmYWNlIFBhcmFtZXRlckRlY29yYXRpb25JbmZvIHtcbiAgLyoqXG4gICAqIFRoZSB0eXBlIGRlY2xhcmF0aW9uIGZvciB0aGUgcGFyYW1ldGVyLiBPbmx5IHNldCBpZiB0aGUgdHlwZSBpcyBhIHZhbHVlIChlLmcuIGEgY2xhc3MsIG5vdCBhblxuICAgKiBpbnRlcmZhY2UpLlxuICAgKi9cbiAgdHlwZTogdHMuVHlwZU5vZGV8bnVsbDtcbiAgLyoqIFRoZSBsaXN0IG9mIGRlY29yYXRvcnMgZm91bmQgb24gdGhlIHBhcmFtZXRlciwgbnVsbCBpZiBub25lLiAqL1xuICBkZWNvcmF0b3JzOiB0cy5EZWNvcmF0b3JbXTtcbn1cblxuLyoqXG4gKiBHZXRzIGEgdHJhbnNmb3JtZXIgZm9yIGRvd25sZXZlbGluZyBBbmd1bGFyIGRlY29yYXRvcnMuXG4gKiBAcGFyYW0gdHlwZUNoZWNrZXIgUmVmZXJlbmNlIHRvIHRoZSBwcm9ncmFtJ3MgdHlwZSBjaGVja2VyLlxuICogQHBhcmFtIGhvc3QgUmVmbGVjdGlvbiBob3N0IHRoYXQgaXMgdXNlZCBmb3IgZGV0ZXJtaW5pbmcgZGVjb3JhdG9ycy5cbiAqIEBwYXJhbSBkaWFnbm9zdGljcyBMaXN0IHdoaWNoIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggZGlhZ25vc3RpY3MgaWYgYW55LlxuICogQHBhcmFtIGlzQ29yZSBXaGV0aGVyIHRoZSBjdXJyZW50IFR5cGVTY3JpcHQgcHJvZ3JhbSBpcyBmb3IgdGhlIGBAYW5ndWxhci9jb3JlYCBwYWNrYWdlLlxuICogQHBhcmFtIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCBXaGV0aGVyIGNsb3N1cmUgYW5ub3RhdGlvbnMgbmVlZCB0byBiZSBhZGRlZCB3aGVyZSBuZWVkZWQuXG4gKiBAcGFyYW0gc2tpcENsYXNzRGVjb3JhdG9ycyBXaGV0aGVyIGNsYXNzIGRlY29yYXRvcnMgc2hvdWxkIGJlIHNraXBwZWQgZnJvbSBkb3dubGV2ZWxpbmcuXG4gKiAgIFRoaXMgaXMgdXNlZnVsIGZvciBKSVQgbW9kZSB3aGVyZSBjbGFzcyBkZWNvcmF0b3JzIHNob3VsZCBiZSBwcmVzZXJ2ZWQgYXMgdGhleSBjb3VsZCByZWx5XG4gKiAgIG9uIGltbWVkaWF0ZSBleGVjdXRpb24uIGUuZy4gZG93bmxldmVsaW5nIGBASW5qZWN0YWJsZWAgbWVhbnMgdGhhdCB0aGUgaW5qZWN0YWJsZSBmYWN0b3J5XG4gKiAgIGlzIG5vdCBjcmVhdGVkLCBhbmQgaW5qZWN0aW5nIHRoZSB0b2tlbiB3aWxsIG5vdCB3b3JrLiBJZiB0aGlzIGRlY29yYXRvciB3b3VsZCBub3QgYmVcbiAqICAgZG93bmxldmVsZWQsIHRoZSBgSW5qZWN0YWJsZWAgZGVjb3JhdG9yIHdpbGwgZXhlY3V0ZSBpbW1lZGlhdGVseSBvbiBmaWxlIGxvYWQsIGFuZFxuICogICBBbmd1bGFyIHdpbGwgZ2VuZXJhdGUgdGhlIGNvcnJlc3BvbmRpbmcgaW5qZWN0YWJsZSBmYWN0b3J5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RG93bmxldmVsRGVjb3JhdG9yc1RyYW5zZm9ybShcbiAgICB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIsIGhvc3Q6IFJlZmxlY3Rpb25Ib3N0LCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdLFxuICAgIGlzQ29yZTogYm9vbGVhbiwgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuLFxuICAgIHNraXBDbGFzc0RlY29yYXRvcnM6IGJvb2xlYW4pOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCkgPT4ge1xuICAgIGxldCByZWZlcmVuY2VkUGFyYW1ldGVyVHlwZXMgPSBuZXcgU2V0PHRzLkRlY2xhcmF0aW9uPigpO1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYW4gRW50aXR5TmFtZSAoZnJvbSBhIHR5cGUgYW5ub3RhdGlvbikgdG8gYW4gZXhwcmVzc2lvbiAoYWNjZXNzaW5nIGEgdmFsdWUpLlxuICAgICAqXG4gICAgICogRm9yIGEgZ2l2ZW4gcXVhbGlmaWVkIG5hbWUsIHRoaXMgd2Fsa3MgZGVwdGggZmlyc3QgdG8gZmluZCB0aGUgbGVmdG1vc3QgaWRlbnRpZmllcixcbiAgICAgKiBhbmQgdGhlbiBjb252ZXJ0cyB0aGUgcGF0aCBpbnRvIGEgcHJvcGVydHkgYWNjZXNzIHRoYXQgY2FuIGJlIHVzZWQgYXMgZXhwcmVzc2lvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbnRpdHlOYW1lVG9FeHByZXNzaW9uKG5hbWU6IHRzLkVudGl0eU5hbWUpOiB0cy5FeHByZXNzaW9ufHVuZGVmaW5lZCB7XG4gICAgICBjb25zdCBzeW1ib2wgPSB0eXBlQ2hlY2tlci5nZXRTeW1ib2xBdExvY2F0aW9uKG5hbWUpO1xuICAgICAgLy8gQ2hlY2sgaWYgdGhlIGVudGl0eSBuYW1lIHJlZmVyZW5jZXMgYSBzeW1ib2wgdGhhdCBpcyBhbiBhY3R1YWwgdmFsdWUuIElmIGl0IGlzIG5vdCwgaXRcbiAgICAgIC8vIGNhbm5vdCBiZSByZWZlcmVuY2VkIGJ5IGFuIGV4cHJlc3Npb24sIHNvIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZiAoIXN5bWJvbCB8fCAhc3ltYm9sSXNSdW50aW1lVmFsdWUodHlwZUNoZWNrZXIsIHN5bWJvbCkgfHwgIXN5bWJvbC5kZWNsYXJhdGlvbnMgfHxcbiAgICAgICAgICBzeW1ib2wuZGVjbGFyYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgZGVhbCB3aXRoIGEgcXVhbGlmaWVkIG5hbWUsIGJ1aWxkIHVwIGEgcHJvcGVydHkgYWNjZXNzIGV4cHJlc3Npb25cbiAgICAgIC8vIHRoYXQgY291bGQgYmUgdXNlZCBpbiB0aGUgSmF2YVNjcmlwdCBvdXRwdXQuXG4gICAgICBpZiAodHMuaXNRdWFsaWZpZWROYW1lKG5hbWUpKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckV4cHIgPSBlbnRpdHlOYW1lVG9FeHByZXNzaW9uKG5hbWUubGVmdCk7XG4gICAgICAgIGlmIChjb250YWluZXJFeHByID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyhjb250YWluZXJFeHByLCBuYW1lLnJpZ2h0KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlY2wgPSBzeW1ib2wuZGVjbGFyYXRpb25zWzBdO1xuICAgICAgLy8gSWYgdGhlIGdpdmVuIGVudGl0eSBuYW1lIGhhcyBiZWVuIHJlc29sdmVkIHRvIGFuIGFsaWFzIGltcG9ydCBkZWNsYXJhdGlvbixcbiAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBhbGlhcyBkZWNsYXJhdGlvbiBpcyBub3QgZWxpZGVkIGJ5IFR5cGVTY3JpcHQsIGFuZCB1c2UgaXRzXG4gICAgICAvLyBuYW1lIGlkZW50aWZpZXIgdG8gcmVmZXJlbmNlIGl0IGF0IHJ1bnRpbWUuXG4gICAgICBpZiAoaXNBbGlhc0ltcG9ydERlY2xhcmF0aW9uKGRlY2wpKSB7XG4gICAgICAgIHJlZmVyZW5jZWRQYXJhbWV0ZXJUeXBlcy5hZGQoZGVjbCk7XG4gICAgICAgIC8vIElmIHRoZSBlbnRpdHkgbmFtZSByZXNvbHZlcyB0byBhbiBhbGlhcyBpbXBvcnQgZGVjbGFyYXRpb24sIHdlIHJlZmVyZW5jZSB0aGVcbiAgICAgICAgLy8gZW50aXR5IGJhc2VkIG9uIHRoZSBhbGlhcyBpbXBvcnQgbmFtZS4gVGhpcyBlbnN1cmVzIHRoYXQgVHlwZVNjcmlwdCBwcm9wZXJseVxuICAgICAgICAvLyByZXNvbHZlcyB0aGUgbGluayB0byB0aGUgaW1wb3J0LiBDbG9uaW5nIHRoZSBvcmlnaW5hbCBlbnRpdHkgbmFtZSBpZGVudGlmaWVyXG4gICAgICAgIC8vIGNvdWxkIGxlYWQgdG8gYW4gaW5jb3JyZWN0IHJlc29sdXRpb24gYXQgbG9jYWwgc2NvcGUuIGUuZy4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZ1xuICAgICAgICAvLyBzbmlwcGV0OiBgY29uc3RydWN0b3IoRGVwOiBEZXApIHt9YC4gSW4gc3VjaCBhIGNhc2UsIHRoZSBsb2NhbCBgRGVwYCBpZGVudGlmaWVyXG4gICAgICAgIC8vIHdvdWxkIHJlc29sdmUgdG8gdGhlIGFjdHVhbCBwYXJhbWV0ZXIgbmFtZSwgYW5kIG5vdCB0byB0aGUgZGVzaXJlZCBpbXBvcnQuXG4gICAgICAgIC8vIFRoaXMgaGFwcGVucyBiZWNhdXNlIHRoZSBlbnRpdHkgbmFtZSBpZGVudGlmaWVyIHN5bWJvbCBpcyBpbnRlcm5hbGx5IGNvbnNpZGVyZWRcbiAgICAgICAgLy8gYXMgdHlwZS1vbmx5IGFuZCB0aGVyZWZvcmUgVHlwZVNjcmlwdCB0cmllcyB0byByZXNvbHZlIGl0IGFzIHZhbHVlIG1hbnVhbGx5LlxuICAgICAgICAvLyBXZSBjYW4gaGVscCBUeXBlU2NyaXB0IGFuZCBhdm9pZCB0aGlzIG5vbi1yZWxpYWJsZSByZXNvbHV0aW9uIGJ5IHVzaW5nIGFuIGlkZW50aWZpZXJcbiAgICAgICAgLy8gdGhhdCBpcyBub3QgdHlwZS1vbmx5IGFuZCBpcyBkaXJlY3RseSBsaW5rZWQgdG8gdGhlIGltcG9ydCBhbGlhcyBkZWNsYXJhdGlvbi5cbiAgICAgICAgaWYgKGRlY2wubmFtZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcmV0dXJuIHRzLmdldE11dGFibGVDbG9uZShkZWNsLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBDbG9uZSB0aGUgb3JpZ2luYWwgZW50aXR5IG5hbWUgaWRlbnRpZmllciBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZVxuICAgICAgLy8gaXRzIHZhbHVlIGF0IHJ1bnRpbWUuIFRoaXMgaXMgdXNlZCB3aGVuIHRoZSBpZGVudGlmaWVyIGlzIHJlc29sdmluZyB0byBhIGZpbGVcbiAgICAgIC8vIGxvY2FsIGRlY2xhcmF0aW9uIChvdGhlcndpc2UgaXQgd291bGQgcmVzb2x2ZSB0byBhbiBhbGlhcyBpbXBvcnQgZGVjbGFyYXRpb24pLlxuICAgICAgcmV0dXJuIHRzLmdldE11dGFibGVDbG9uZShuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgY2xhc3MgZWxlbWVudC4gUmV0dXJucyBhIHRocmVlIHR1cGxlIG9mIG5hbWUsIHRyYW5zZm9ybWVkIGVsZW1lbnQsIGFuZFxuICAgICAqIGRlY29yYXRvcnMgZm91bmQuIFJldHVybnMgYW4gdW5kZWZpbmVkIG5hbWUgaWYgdGhlcmUgYXJlIG5vIGRlY29yYXRvcnMgdG8gbG93ZXIgb24gdGhlXG4gICAgICogZWxlbWVudCwgb3IgdGhlIGVsZW1lbnQgaGFzIGFuIGV4b3RpYyBuYW1lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUNsYXNzRWxlbWVudChlbGVtZW50OiB0cy5DbGFzc0VsZW1lbnQpOlxuICAgICAgICBbc3RyaW5nfHVuZGVmaW5lZCwgdHMuQ2xhc3NFbGVtZW50LCB0cy5EZWNvcmF0b3JbXV0ge1xuICAgICAgZWxlbWVudCA9IHRzLnZpc2l0RWFjaENoaWxkKGVsZW1lbnQsIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3IsIGNvbnRleHQpO1xuICAgICAgY29uc3QgZGVjb3JhdG9yc1RvS2VlcDogdHMuRGVjb3JhdG9yW10gPSBbXTtcbiAgICAgIGNvbnN0IHRvTG93ZXI6IHRzLkRlY29yYXRvcltdID0gW107XG4gICAgICBjb25zdCBkZWNvcmF0b3JzID0gaG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihlbGVtZW50KSB8fCBbXTtcbiAgICAgIGZvciAoY29uc3QgZGVjb3JhdG9yIG9mIGRlY29yYXRvcnMpIHtcbiAgICAgICAgLy8gV2Ugb25seSBkZWFsIHdpdGggY29uY3JldGUgbm9kZXMgaW4gVHlwZVNjcmlwdCBzb3VyY2VzLCBzbyB3ZSBkb24ndFxuICAgICAgICAvLyBuZWVkIHRvIGhhbmRsZSBzeW50aGV0aWNhbGx5IGNyZWF0ZWQgZGVjb3JhdG9ycy5cbiAgICAgICAgY29uc3QgZGVjb3JhdG9yTm9kZSA9IGRlY29yYXRvci5ub2RlISBhcyB0cy5EZWNvcmF0b3I7XG4gICAgICAgIGlmICghaXNBbmd1bGFyRGVjb3JhdG9yKGRlY29yYXRvciwgaXNDb3JlKSkge1xuICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0b0xvd2VyLnB1c2goZGVjb3JhdG9yTm9kZSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRvTG93ZXIubGVuZ3RoKSByZXR1cm4gW3VuZGVmaW5lZCwgZWxlbWVudCwgW11dO1xuXG4gICAgICBpZiAoIWVsZW1lbnQubmFtZSB8fCAhdHMuaXNJZGVudGlmaWVyKGVsZW1lbnQubmFtZSkpIHtcbiAgICAgICAgLy8gTWV0aG9kIGhhcyBhIHdlaXJkIG5hbWUsIGUuZy5cbiAgICAgICAgLy8gICBbU3ltYm9sLmZvb10oKSB7Li4ufVxuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgICAgICBmaWxlOiBlbGVtZW50LmdldFNvdXJjZUZpbGUoKSxcbiAgICAgICAgICBzdGFydDogZWxlbWVudC5nZXRTdGFydCgpLFxuICAgICAgICAgIGxlbmd0aDogZWxlbWVudC5nZXRFbmQoKSAtIGVsZW1lbnQuZ2V0U3RhcnQoKSxcbiAgICAgICAgICBtZXNzYWdlVGV4dDogYENhbm5vdCBwcm9jZXNzIGRlY29yYXRvcnMgZm9yIGNsYXNzIGVsZW1lbnQgd2l0aCBub24tYW5hbHl6YWJsZSBuYW1lLmAsXG4gICAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgICBjb2RlOiAwLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFt1bmRlZmluZWQsIGVsZW1lbnQsIFtdXTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmFtZSA9IChlbGVtZW50Lm5hbWUgYXMgdHMuSWRlbnRpZmllcikudGV4dDtcbiAgICAgIGNvbnN0IG11dGFibGUgPSB0cy5nZXRNdXRhYmxlQ2xvbmUoZWxlbWVudCk7XG4gICAgICAobXV0YWJsZSBhcyBhbnkpLmRlY29yYXRvcnMgPSBkZWNvcmF0b3JzVG9LZWVwLmxlbmd0aCA/XG4gICAgICAgICAgdHMuc2V0VGV4dFJhbmdlKHRzLmNyZWF0ZU5vZGVBcnJheShkZWNvcmF0b3JzVG9LZWVwKSwgbXV0YWJsZS5kZWNvcmF0b3JzKSA6XG4gICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIFtuYW1lLCBtdXRhYmxlLCB0b0xvd2VyXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmFuc2Zvcm1zIGEgY29uc3RydWN0b3IuIFJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGNvbnN0cnVjdG9yIGFuZCB0aGUgbGlzdCBvZiBwYXJhbWV0ZXJcbiAgICAgKiBpbmZvcm1hdGlvbiBjb2xsZWN0ZWQsIGNvbnNpc3Rpbmcgb2YgZGVjb3JhdG9ycyBhbmQgb3B0aW9uYWwgdHlwZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1Db25zdHJ1Y3RvcihjdG9yOiB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTpcbiAgICAgICAgW3RzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb24sIFBhcmFtZXRlckRlY29yYXRpb25JbmZvW11dIHtcbiAgICAgIGN0b3IgPSB0cy52aXNpdEVhY2hDaGlsZChjdG9yLCBkZWNvcmF0b3JEb3dubGV2ZWxWaXNpdG9yLCBjb250ZXh0KTtcblxuICAgICAgY29uc3QgbmV3UGFyYW1ldGVyczogdHMuUGFyYW1ldGVyRGVjbGFyYXRpb25bXSA9IFtdO1xuICAgICAgY29uc3Qgb2xkUGFyYW1ldGVycyA9XG4gICAgICAgICAgdHMudmlzaXRQYXJhbWV0ZXJMaXN0KGN0b3IucGFyYW1ldGVycywgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCk7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzSW5mbzogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXSA9IFtdO1xuICAgICAgZm9yIChjb25zdCBwYXJhbSBvZiBvbGRQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGNvbnN0IGRlY29yYXRvcnNUb0tlZXA6IHRzLkRlY29yYXRvcltdID0gW107XG4gICAgICAgIGNvbnN0IHBhcmFtSW5mbzogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm8gPSB7ZGVjb3JhdG9yczogW10sIHR5cGU6IG51bGx9O1xuICAgICAgICBjb25zdCBkZWNvcmF0b3JzID0gaG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihwYXJhbSkgfHwgW107XG5cbiAgICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgZGVjb3JhdG9ycykge1xuICAgICAgICAgIC8vIFdlIG9ubHkgZGVhbCB3aXRoIGNvbmNyZXRlIG5vZGVzIGluIFR5cGVTY3JpcHQgc291cmNlcywgc28gd2UgZG9uJ3RcbiAgICAgICAgICAvLyBuZWVkIHRvIGhhbmRsZSBzeW50aGV0aWNhbGx5IGNyZWF0ZWQgZGVjb3JhdG9ycy5cbiAgICAgICAgICBjb25zdCBkZWNvcmF0b3JOb2RlID0gZGVjb3JhdG9yLm5vZGUhIGFzIHRzLkRlY29yYXRvcjtcbiAgICAgICAgICBpZiAoIWlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIGlzQ29yZSkpIHtcbiAgICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXJhbUluZm8hLmRlY29yYXRvcnMucHVzaChkZWNvcmF0b3JOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFyYW0udHlwZSkge1xuICAgICAgICAgIC8vIHBhcmFtIGhhcyBhIHR5cGUgcHJvdmlkZWQsIGUuZy4gXCJmb286IEJhclwiLlxuICAgICAgICAgIC8vIFRoZSB0eXBlIHdpbGwgYmUgZW1pdHRlZCBhcyBhIHZhbHVlIGV4cHJlc3Npb24gaW4gZW50aXR5TmFtZVRvRXhwcmVzc2lvbiwgd2hpY2ggdGFrZXNcbiAgICAgICAgICAvLyBjYXJlIG5vdCB0byBlbWl0IGFueXRoaW5nIGZvciB0eXBlcyB0aGF0IGNhbm5vdCBiZSBleHByZXNzZWQgYXMgYSB2YWx1ZSAoZS5nLlxuICAgICAgICAgIC8vIGludGVyZmFjZXMpLlxuICAgICAgICAgIHBhcmFtSW5mbyEudHlwZSA9IHBhcmFtLnR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1ldGVyc0luZm8ucHVzaChwYXJhbUluZm8pO1xuICAgICAgICBjb25zdCBuZXdQYXJhbSA9IHRzLnVwZGF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgIHBhcmFtLFxuICAgICAgICAgICAgLy8gTXVzdCBwYXNzICd1bmRlZmluZWQnIHRvIGF2b2lkIGVtaXR0aW5nIGRlY29yYXRvciBtZXRhZGF0YS5cbiAgICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAubGVuZ3RoID8gZGVjb3JhdG9yc1RvS2VlcCA6IHVuZGVmaW5lZCwgcGFyYW0ubW9kaWZpZXJzLFxuICAgICAgICAgICAgcGFyYW0uZG90RG90RG90VG9rZW4sIHBhcmFtLm5hbWUsIHBhcmFtLnF1ZXN0aW9uVG9rZW4sIHBhcmFtLnR5cGUsIHBhcmFtLmluaXRpYWxpemVyKTtcbiAgICAgICAgbmV3UGFyYW1ldGVycy5wdXNoKG5ld1BhcmFtKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVwZGF0ZWQgPSB0cy51cGRhdGVDb25zdHJ1Y3RvcihcbiAgICAgICAgICBjdG9yLCBjdG9yLmRlY29yYXRvcnMsIGN0b3IubW9kaWZpZXJzLCBuZXdQYXJhbWV0ZXJzLFxuICAgICAgICAgIHRzLnZpc2l0RnVuY3Rpb25Cb2R5KGN0b3IuYm9keSwgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCkpO1xuICAgICAgcmV0dXJuIFt1cGRhdGVkLCBwYXJhbWV0ZXJzSW5mb107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtcyBhIHNpbmdsZSBjbGFzcyBkZWNsYXJhdGlvbjpcbiAgICAgKiAtIGRpc3BhdGNoZXMgdG8gc3RyaXAgZGVjb3JhdG9ycyBvbiBtZW1iZXJzXG4gICAgICogLSBjb252ZXJ0cyBkZWNvcmF0b3JzIG9uIHRoZSBjbGFzcyB0byBhbm5vdGF0aW9uc1xuICAgICAqIC0gY3JlYXRlcyBhIGN0b3JQYXJhbWV0ZXJzIHByb3BlcnR5XG4gICAgICogLSBjcmVhdGVzIGEgcHJvcERlY29yYXRvcnMgcHJvcGVydHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1DbGFzc0RlY2xhcmF0aW9uKGNsYXNzRGVjbDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHRzLkNsYXNzRGVjbGFyYXRpb24ge1xuICAgICAgY2xhc3NEZWNsID0gdHMuZ2V0TXV0YWJsZUNsb25lKGNsYXNzRGVjbCk7XG5cbiAgICAgIGNvbnN0IG5ld01lbWJlcnM6IHRzLkNsYXNzRWxlbWVudFtdID0gW107XG4gICAgICBjb25zdCBkZWNvcmF0ZWRQcm9wZXJ0aWVzID0gbmV3IE1hcDxzdHJpbmcsIHRzLkRlY29yYXRvcltdPigpO1xuICAgICAgbGV0IGNsYXNzUGFyYW1ldGVyczogUGFyYW1ldGVyRGVjb3JhdGlvbkluZm9bXXxudWxsID0gbnVsbDtcblxuICAgICAgZm9yIChjb25zdCBtZW1iZXIgb2YgY2xhc3NEZWNsLm1lbWJlcnMpIHtcbiAgICAgICAgc3dpdGNoIChtZW1iZXIua2luZCkge1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eURlY2xhcmF0aW9uOlxuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HZXRBY2Nlc3NvcjpcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2V0QWNjZXNzb3I6XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1ldGhvZERlY2xhcmF0aW9uOiB7XG4gICAgICAgICAgICBjb25zdCBbbmFtZSwgbmV3TWVtYmVyLCBkZWNvcmF0b3JzXSA9IHRyYW5zZm9ybUNsYXNzRWxlbWVudChtZW1iZXIpO1xuICAgICAgICAgICAgbmV3TWVtYmVycy5wdXNoKG5ld01lbWJlcik7XG4gICAgICAgICAgICBpZiAobmFtZSkgZGVjb3JhdGVkUHJvcGVydGllcy5zZXQobmFtZSwgZGVjb3JhdG9ycyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgICBjb25zdCBjdG9yID0gbWVtYmVyIGFzIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb247XG4gICAgICAgICAgICBpZiAoIWN0b3IuYm9keSkgYnJlYWs7XG4gICAgICAgICAgICBjb25zdCBbbmV3TWVtYmVyLCBwYXJhbWV0ZXJzSW5mb10gPVxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybUNvbnN0cnVjdG9yKG1lbWJlciBhcyB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uKTtcbiAgICAgICAgICAgIGNsYXNzUGFyYW1ldGVycyA9IHBhcmFtZXRlcnNJbmZvO1xuICAgICAgICAgICAgbmV3TWVtYmVycy5wdXNoKG5ld01lbWJlcik7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5ld01lbWJlcnMucHVzaCh0cy52aXNpdEVhY2hDaGlsZChtZW1iZXIsIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3IsIGNvbnRleHQpKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGBSZWZsZWN0aW9uSG9zdC5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbigpYCBtZXRob2Qgd2lsbCBub3QgcmV0dXJuIGNlcnRhaW4ga2luZHMgb2ZcbiAgICAgIC8vIGRlY29yYXRvcnMgdGhhdCB3aWxsIG5ldmVyIGJlIEFuZ3VsYXIgZGVjb3JhdG9ycy4gU28gd2UgY2Fubm90IHJlbHkgb24gaXQgdG8gY2FwdHVyZSBhbGxcbiAgICAgIC8vIHRoZSBkZWNvcmF0b3JzIHRoYXQgc2hvdWxkIGJlIGtlcHQuIEluc3RlYWQgd2Ugc3RhcnQgb2ZmIHdpdGggYSBzZXQgb2YgdGhlIHJhdyBkZWNvcmF0b3JzXG4gICAgICAvLyBvbiB0aGUgY2xhc3MsIGFuZCBvbmx5IHJlbW92ZSB0aGUgb25lcyB0aGF0IGhhdmUgYmVlbiBpZGVudGlmaWVkIGZvciBkb3dubGV2ZWxpbmcuXG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9LZWVwID0gbmV3IFNldDx0cy5EZWNvcmF0b3I+KGNsYXNzRGVjbC5kZWNvcmF0b3JzKTtcbiAgICAgIGNvbnN0IHBvc3NpYmxlQW5ndWxhckRlY29yYXRvcnMgPSBob3N0LmdldERlY29yYXRvcnNPZkRlY2xhcmF0aW9uKGNsYXNzRGVjbCkgfHwgW107XG5cbiAgICAgIGxldCBoYXNBbmd1bGFyRGVjb3JhdG9yID0gZmFsc2U7XG4gICAgICBjb25zdCBkZWNvcmF0b3JzVG9Mb3dlciA9IFtdO1xuICAgICAgZm9yIChjb25zdCBkZWNvcmF0b3Igb2YgcG9zc2libGVBbmd1bGFyRGVjb3JhdG9ycykge1xuICAgICAgICAvLyBXZSBvbmx5IGRlYWwgd2l0aCBjb25jcmV0ZSBub2RlcyBpbiBUeXBlU2NyaXB0IHNvdXJjZXMsIHNvIHdlIGRvbid0XG4gICAgICAgIC8vIG5lZWQgdG8gaGFuZGxlIHN5bnRoZXRpY2FsbHkgY3JlYXRlZCBkZWNvcmF0b3JzLlxuICAgICAgICBjb25zdCBkZWNvcmF0b3JOb2RlID0gZGVjb3JhdG9yLm5vZGUhIGFzIHRzLkRlY29yYXRvcjtcbiAgICAgICAgY29uc3QgaXNOZ0RlY29yYXRvciA9IGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIGlzQ29yZSk7XG5cbiAgICAgICAgLy8gS2VlcCB0cmFjayBpZiB3ZSBjb21lIGFjcm9zcyBhbiBBbmd1bGFyIGNsYXNzIGRlY29yYXRvci4gVGhpcyBpcyB1c2VkXG4gICAgICAgIC8vIGZvciB0byBkZXRlcm1pbmUgd2hldGhlciBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIHNob3VsZCBiZSBjYXB0dXJlZCBvciBub3QuXG4gICAgICAgIGlmIChpc05nRGVjb3JhdG9yKSB7XG4gICAgICAgICAgaGFzQW5ndWxhckRlY29yYXRvciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNOZ0RlY29yYXRvciAmJiAhc2tpcENsYXNzRGVjb3JhdG9ycykge1xuICAgICAgICAgIGRlY29yYXRvcnNUb0xvd2VyLnB1c2goZXh0cmFjdE1ldGFkYXRhRnJvbVNpbmdsZURlY29yYXRvcihkZWNvcmF0b3JOb2RlLCBkaWFnbm9zdGljcykpO1xuICAgICAgICAgIGRlY29yYXRvcnNUb0tlZXAuZGVsZXRlKGRlY29yYXRvck5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWNvcmF0b3JzVG9Mb3dlci5sZW5ndGgpIHtcbiAgICAgICAgbmV3TWVtYmVycy5wdXNoKGNyZWF0ZURlY29yYXRvckNsYXNzUHJvcGVydHkoZGVjb3JhdG9yc1RvTG93ZXIpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjbGFzc1BhcmFtZXRlcnMpIHtcbiAgICAgICAgaWYgKGhhc0FuZ3VsYXJEZWNvcmF0b3IgfHwgY2xhc3NQYXJhbWV0ZXJzLnNvbWUocCA9PiAhIXAuZGVjb3JhdG9ycy5sZW5ndGgpKSB7XG4gICAgICAgICAgLy8gQ2FwdHVyZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzIGlmIHRoZSBjbGFzcyBoYXMgQW5ndWxhciBkZWNvcmF0b3IgYXBwbGllZCxcbiAgICAgICAgICAvLyBvciBpZiBhbnkgb2YgdGhlIHBhcmFtZXRlcnMgaGFzIGRlY29yYXRvcnMgYXBwbGllZCBkaXJlY3RseS5cbiAgICAgICAgICBuZXdNZW1iZXJzLnB1c2goY3JlYXRlQ3RvclBhcmFtZXRlcnNDbGFzc1Byb3BlcnR5KFxuICAgICAgICAgICAgICBkaWFnbm9zdGljcywgZW50aXR5TmFtZVRvRXhwcmVzc2lvbiwgY2xhc3NQYXJhbWV0ZXJzLCBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRlY29yYXRlZFByb3BlcnRpZXMuc2l6ZSkge1xuICAgICAgICBuZXdNZW1iZXJzLnB1c2goY3JlYXRlUHJvcERlY29yYXRvcnNDbGFzc1Byb3BlcnR5KGRpYWdub3N0aWNzLCBkZWNvcmF0ZWRQcm9wZXJ0aWVzKSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1lbWJlcnMgPSB0cy5zZXRUZXh0UmFuZ2UoXG4gICAgICAgICAgdHMuY3JlYXRlTm9kZUFycmF5KG5ld01lbWJlcnMsIGNsYXNzRGVjbC5tZW1iZXJzLmhhc1RyYWlsaW5nQ29tbWEpLCBjbGFzc0RlY2wubWVtYmVycyk7XG5cbiAgICAgIHJldHVybiB0cy51cGRhdGVDbGFzc0RlY2xhcmF0aW9uKFxuICAgICAgICAgIGNsYXNzRGVjbCwgZGVjb3JhdG9yc1RvS2VlcC5zaXplID8gQXJyYXkuZnJvbShkZWNvcmF0b3JzVG9LZWVwKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBjbGFzc0RlY2wubW9kaWZpZXJzLCBjbGFzc0RlY2wubmFtZSwgY2xhc3NEZWNsLnR5cGVQYXJhbWV0ZXJzLCBjbGFzc0RlY2wuaGVyaXRhZ2VDbGF1c2VzLFxuICAgICAgICAgIG1lbWJlcnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYW5zZm9ybWVyIHZpc2l0b3IgdGhhdCBsb29rcyBmb3IgQW5ndWxhciBkZWNvcmF0b3JzIGFuZCByZXBsYWNlcyB0aGVtIHdpdGhcbiAgICAgKiBkb3dubGV2ZWxlZCBzdGF0aWMgcHJvcGVydGllcy4gQWxzbyBjb2xsZWN0cyBjb25zdHJ1Y3RvciB0eXBlIG1ldGFkYXRhIGZvclxuICAgICAqIGNsYXNzIGRlY2xhcmF0aW9uIHRoYXQgYXJlIGRlY29yYXRlZCB3aXRoIGFuIEFuZ3VsYXIgZGVjb3JhdG9yLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRlY29yYXRvckRvd25sZXZlbFZpc2l0b3Iobm9kZTogdHMuTm9kZSk6IHRzLk5vZGUge1xuICAgICAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2xhc3NEZWNsYXJhdGlvbihub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChub2RlLCBkZWNvcmF0b3JEb3dubGV2ZWxWaXNpdG9yLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gKHNmOiB0cy5Tb3VyY2VGaWxlKSA9PiB7XG4gICAgICAvLyBFbnN1cmUgdGhhdCByZWZlcmVuY2VkIHR5cGUgc3ltYm9scyBhcmUgbm90IGVsaWRlZCBieSBUeXBlU2NyaXB0LiBJbXBvcnRzIGZvclxuICAgICAgLy8gc3VjaCBwYXJhbWV0ZXIgdHlwZSBzeW1ib2xzIHByZXZpb3VzbHkgY291bGQgYmUgdHlwZS1vbmx5LCBidXQgbm93IG1pZ2h0IGJlIGFsc29cbiAgICAgIC8vIHVzZWQgaW4gdGhlIGBjdG9yUGFyYW1ldGVyc2Agc3RhdGljIHByb3BlcnR5IGFzIGEgdmFsdWUuIFdlIHdhbnQgdG8gbWFrZSBzdXJlXG4gICAgICAvLyB0aGF0IFR5cGVTY3JpcHQgZG9lcyBub3QgZWxpZGUgaW1wb3J0cyBmb3Igc3VjaCB0eXBlIHJlZmVyZW5jZXMuIFJlYWQgbW9yZVxuICAgICAgLy8gYWJvdXQgdGhpcyBpbiB0aGUgZGVzY3JpcHRpb24gZm9yIGBwYXRjaEFsaWFzUmVmZXJlbmNlUmVzb2x1dGlvbmAuXG4gICAgICBwYXRjaEFsaWFzUmVmZXJlbmNlUmVzb2x1dGlvbk9yRGllKGNvbnRleHQsIHJlZmVyZW5jZWRQYXJhbWV0ZXJUeXBlcyk7XG4gICAgICAvLyBEb3dubGV2ZWwgZGVjb3JhdG9ycyBhbmQgY29uc3RydWN0b3IgcGFyYW1ldGVyIHR5cGVzLiBXZSB3aWxsIGtlZXAgdHJhY2sgb2YgYWxsXG4gICAgICAvLyByZWZlcmVuY2VkIGNvbnN0cnVjdG9yIHBhcmFtZXRlciB0eXBlcyBzbyB0aGF0IHdlIGNhbiBpbnN0cnVjdCBUeXBlU2NyaXB0IHRvXG4gICAgICAvLyBub3QgZWxpZGUgdGhlaXIgaW1wb3J0cyBpZiB0aGV5IHByZXZpb3VzbHkgd2VyZSBvbmx5IHR5cGUtb25seS5cbiAgICAgIHJldHVybiB0cy52aXNpdEVhY2hDaGlsZChzZiwgZGVjb3JhdG9yRG93bmxldmVsVmlzaXRvciwgY29udGV4dCk7XG4gICAgfTtcbiAgfTtcbn1cbiJdfQ==