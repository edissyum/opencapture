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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/directive", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler/src/core", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/metadata/src/util", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics", "@angular/compiler-cli/src/ngtsc/annotations/src/factory", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extractHostBindings = exports.queriesFromFields = exports.parseFieldArrayValue = exports.extractQueriesFromDecorator = exports.extractQueryMetadata = exports.extractDirectiveMetadata = exports.DirectiveDecoratorHandler = exports.DirectiveSymbol = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var core_1 = require("@angular/compiler/src/core");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var semantic_graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/metadata/src/util");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics");
    var factory_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/factory");
    var metadata_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var util_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    var EMPTY_OBJECT = {};
    var FIELD_DECORATORS = [
        'Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostBinding',
        'HostListener'
    ];
    var LIFECYCLE_HOOKS = new Set([
        'ngOnChanges', 'ngOnInit', 'ngOnDestroy', 'ngDoCheck', 'ngAfterViewInit', 'ngAfterViewChecked',
        'ngAfterContentInit', 'ngAfterContentChecked'
    ]);
    /**
     * Represents an Angular directive. Components are represented by `ComponentSymbol`, which inherits
     * from this symbol.
     */
    var DirectiveSymbol = /** @class */ (function (_super) {
        tslib_1.__extends(DirectiveSymbol, _super);
        function DirectiveSymbol(decl, selector, inputs, outputs, exportAs, typeCheckMeta, typeParameters) {
            var _this = _super.call(this, decl) || this;
            _this.selector = selector;
            _this.inputs = inputs;
            _this.outputs = outputs;
            _this.exportAs = exportAs;
            _this.typeCheckMeta = typeCheckMeta;
            _this.typeParameters = typeParameters;
            _this.baseClass = null;
            return _this;
        }
        DirectiveSymbol.prototype.isPublicApiAffected = function (previousSymbol) {
            // Note: since components and directives have exactly the same items contributing to their
            // public API, it is okay for a directive to change into a component and vice versa without
            // the API being affected.
            if (!(previousSymbol instanceof DirectiveSymbol)) {
                return true;
            }
            // Directives and components have a public API of:
            //  1. Their selector.
            //  2. The binding names of their inputs and outputs; a change in ordering is also considered
            //     to be a change in public API.
            //  3. The list of exportAs names and its ordering.
            return this.selector !== previousSymbol.selector ||
                !semantic_graph_1.isArrayEqual(this.inputs.propertyNames, previousSymbol.inputs.propertyNames) ||
                !semantic_graph_1.isArrayEqual(this.outputs.propertyNames, previousSymbol.outputs.propertyNames) ||
                !semantic_graph_1.isArrayEqual(this.exportAs, previousSymbol.exportAs);
        };
        DirectiveSymbol.prototype.isTypeCheckApiAffected = function (previousSymbol) {
            // If the public API of the directive has changed, then so has its type-check API.
            if (this.isPublicApiAffected(previousSymbol)) {
                return true;
            }
            if (!(previousSymbol instanceof DirectiveSymbol)) {
                return true;
            }
            // The type-check block also depends on the class property names, as writes property bindings
            // directly into the backing fields.
            if (!semantic_graph_1.isArrayEqual(Array.from(this.inputs), Array.from(previousSymbol.inputs), isInputMappingEqual) ||
                !semantic_graph_1.isArrayEqual(Array.from(this.outputs), Array.from(previousSymbol.outputs), isInputMappingEqual)) {
                return true;
            }
            // The type parameters of a directive are emitted into the type constructors in the type-check
            // block of a component, so if the type parameters are not considered equal then consider the
            // type-check API of this directive to be affected.
            if (!semantic_graph_1.areTypeParametersEqual(this.typeParameters, previousSymbol.typeParameters)) {
                return true;
            }
            // The type-check metadata is used during TCB code generation, so any changes should invalidate
            // prior type-check files.
            if (!isTypeCheckMetaEqual(this.typeCheckMeta, previousSymbol.typeCheckMeta)) {
                return true;
            }
            // Changing the base class of a directive means that its inputs/outputs etc may have changed,
            // so the type-check block of components that use this directive needs to be regenerated.
            if (!isBaseClassEqual(this.baseClass, previousSymbol.baseClass)) {
                return true;
            }
            return false;
        };
        return DirectiveSymbol;
    }(semantic_graph_1.SemanticSymbol));
    exports.DirectiveSymbol = DirectiveSymbol;
    function isInputMappingEqual(current, previous) {
        return current[0] === previous[0] && current[1] === previous[1];
    }
    function isTypeCheckMetaEqual(current, previous) {
        if (current.hasNgTemplateContextGuard !== previous.hasNgTemplateContextGuard) {
            return false;
        }
        if (current.isGeneric !== previous.isGeneric) {
            // Note: changes in the number of type parameters is also considered in `areTypeParametersEqual`
            // so this check is technically not needed; it is done anyway for completeness in terms of
            // whether the `DirectiveTypeCheckMeta` struct itself compares equal or not.
            return false;
        }
        if (!semantic_graph_1.isArrayEqual(current.ngTemplateGuards, previous.ngTemplateGuards, isTemplateGuardEqual)) {
            return false;
        }
        if (!semantic_graph_1.isSetEqual(current.coercedInputFields, previous.coercedInputFields)) {
            return false;
        }
        if (!semantic_graph_1.isSetEqual(current.restrictedInputFields, previous.restrictedInputFields)) {
            return false;
        }
        if (!semantic_graph_1.isSetEqual(current.stringLiteralInputFields, previous.stringLiteralInputFields)) {
            return false;
        }
        if (!semantic_graph_1.isSetEqual(current.undeclaredInputFields, previous.undeclaredInputFields)) {
            return false;
        }
        return true;
    }
    function isTemplateGuardEqual(current, previous) {
        return current.inputName === previous.inputName && current.type === previous.type;
    }
    function isBaseClassEqual(current, previous) {
        if (current === null || previous === null) {
            return current === previous;
        }
        return semantic_graph_1.isSymbolEqual(current, previous);
    }
    var DirectiveDecoratorHandler = /** @class */ (function () {
        function DirectiveDecoratorHandler(reflector, evaluator, metaRegistry, scopeRegistry, metaReader, injectableRegistry, isCore, semanticDepGraphUpdater, annotateForClosureCompiler, compileUndecoratedClassesWithAngularFeatures, perf) {
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.metaRegistry = metaRegistry;
            this.scopeRegistry = scopeRegistry;
            this.metaReader = metaReader;
            this.injectableRegistry = injectableRegistry;
            this.isCore = isCore;
            this.semanticDepGraphUpdater = semanticDepGraphUpdater;
            this.annotateForClosureCompiler = annotateForClosureCompiler;
            this.compileUndecoratedClassesWithAngularFeatures = compileUndecoratedClassesWithAngularFeatures;
            this.perf = perf;
            this.precedence = transform_1.HandlerPrecedence.PRIMARY;
            this.name = DirectiveDecoratorHandler.name;
        }
        DirectiveDecoratorHandler.prototype.detect = function (node, decorators) {
            // If a class is undecorated but uses Angular features, we detect it as an
            // abstract directive. This is an unsupported pattern as of v10, but we want
            // to still detect these patterns so that we can report diagnostics, or compile
            // them for backwards compatibility in ngcc.
            if (!decorators) {
                var angularField = this.findClassFieldWithAngularFeatures(node);
                return angularField ? { trigger: angularField.node, decorator: null, metadata: null } :
                    undefined;
            }
            else {
                var decorator = util_2.findAngularDecorator(decorators, 'Directive', this.isCore);
                return decorator ? { trigger: decorator.node, decorator: decorator, metadata: decorator } : undefined;
            }
        };
        DirectiveDecoratorHandler.prototype.analyze = function (node, decorator, flags) {
            if (flags === void 0) { flags = transform_1.HandlerFlags.NONE; }
            // Skip processing of the class declaration if compilation of undecorated classes
            // with Angular features is disabled. Previously in ngtsc, such classes have always
            // been processed, but we want to enforce a consistent decorator mental model.
            // See: https://v9.angular.io/guide/migration-undecorated-classes.
            if (this.compileUndecoratedClassesWithAngularFeatures === false && decorator === null) {
                return { diagnostics: [diagnostics_2.getUndecoratedClassWithAngularFeaturesDiagnostic(node)] };
            }
            this.perf.eventCount(perf_1.PerfEvent.AnalyzeDirective);
            var directiveResult = extractDirectiveMetadata(node, decorator, this.reflector, this.evaluator, this.isCore, flags, this.annotateForClosureCompiler);
            if (directiveResult === undefined) {
                return {};
            }
            var analysis = directiveResult.metadata;
            var providersRequiringFactory = null;
            if (directiveResult !== undefined && directiveResult.decorator.has('providers')) {
                providersRequiringFactory = util_2.resolveProvidersRequiringFactory(directiveResult.decorator.get('providers'), this.reflector, this.evaluator);
            }
            return {
                analysis: {
                    inputs: directiveResult.inputs,
                    outputs: directiveResult.outputs,
                    meta: analysis,
                    metadataStmt: metadata_2.generateSetClassMetadataCall(node, this.reflector, this.isCore, this.annotateForClosureCompiler),
                    baseClass: util_2.readBaseClass(node, this.reflector, this.evaluator),
                    typeCheckMeta: util_1.extractDirectiveTypeCheckMeta(node, directiveResult.inputs, this.reflector),
                    providersRequiringFactory: providersRequiringFactory,
                    isPoisoned: false,
                    isStructural: directiveResult.isStructural,
                }
            };
        };
        DirectiveDecoratorHandler.prototype.symbol = function (node, analysis) {
            var typeParameters = semantic_graph_1.extractSemanticTypeParameters(node);
            return new DirectiveSymbol(node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs, analysis.typeCheckMeta, typeParameters);
        };
        DirectiveDecoratorHandler.prototype.register = function (node, analysis) {
            // Register this directive's information with the `MetadataRegistry`. This ensures that
            // the information about the directive is available during the compile() phase.
            var ref = new imports_1.Reference(node);
            this.metaRegistry.registerDirectiveMetadata(tslib_1.__assign(tslib_1.__assign({ ref: ref, name: node.name.text, selector: analysis.meta.selector, exportAs: analysis.meta.exportAs, inputs: analysis.inputs, outputs: analysis.outputs, queries: analysis.meta.queries.map(function (query) { return query.propertyName; }), isComponent: false, baseClass: analysis.baseClass }, analysis.typeCheckMeta), { isPoisoned: analysis.isPoisoned, isStructural: analysis.isStructural }));
            this.injectableRegistry.registerInjectable(node);
        };
        DirectiveDecoratorHandler.prototype.resolve = function (node, analysis, symbol) {
            if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof imports_1.Reference) {
                symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
            }
            var diagnostics = [];
            if (analysis.providersRequiringFactory !== null &&
                analysis.meta.providers instanceof compiler_1.WrappedNodeExpr) {
                var providerDiagnostics = diagnostics_2.getProviderDiagnostics(analysis.providersRequiringFactory, analysis.meta.providers.node, this.injectableRegistry);
                diagnostics.push.apply(diagnostics, tslib_1.__spread(providerDiagnostics));
            }
            var directiveDiagnostics = diagnostics_2.getDirectiveDiagnostics(node, this.metaReader, this.evaluator, this.reflector, this.scopeRegistry, 'Directive');
            if (directiveDiagnostics !== null) {
                diagnostics.push.apply(diagnostics, tslib_1.__spread(directiveDiagnostics));
            }
            return { diagnostics: diagnostics.length > 0 ? diagnostics : undefined };
        };
        DirectiveDecoratorHandler.prototype.compileFull = function (node, analysis, resolution, pool) {
            var def = compiler_1.compileDirectiveFromMetadata(analysis.meta, pool, compiler_1.makeBindingParser());
            return this.compileDirective(analysis, def);
        };
        DirectiveDecoratorHandler.prototype.compilePartial = function (node, analysis, resolution) {
            var def = compiler_1.compileDeclareDirectiveFromMetadata(analysis.meta);
            return this.compileDirective(analysis, def);
        };
        DirectiveDecoratorHandler.prototype.compileDirective = function (analysis, _a) {
            var initializer = _a.expression, type = _a.type;
            var factoryRes = factory_1.compileNgFactoryDefField(tslib_1.__assign(tslib_1.__assign({}, analysis.meta), { injectFn: compiler_1.Identifiers.directiveInject, target: compiler_1.R3FactoryTarget.Directive }));
            if (analysis.metadataStmt !== null) {
                factoryRes.statements.push(analysis.metadataStmt);
            }
            return [
                factoryRes,
                {
                    name: 'ɵdir',
                    initializer: initializer,
                    statements: [],
                    type: type,
                }
            ];
        };
        /**
         * Checks if a given class uses Angular features and returns the TypeScript node
         * that indicated the usage. Classes are considered using Angular features if they
         * contain class members that are either decorated with a known Angular decorator,
         * or if they correspond to a known Angular lifecycle hook.
         */
        DirectiveDecoratorHandler.prototype.findClassFieldWithAngularFeatures = function (node) {
            var _this = this;
            return this.reflector.getMembersOfClass(node).find(function (member) {
                if (!member.isStatic && member.kind === reflection_1.ClassMemberKind.Method &&
                    LIFECYCLE_HOOKS.has(member.name)) {
                    return true;
                }
                if (member.decorators) {
                    return member.decorators.some(function (decorator) { return FIELD_DECORATORS.some(function (decoratorName) { return util_2.isAngularDecorator(decorator, decoratorName, _this.isCore); }); });
                }
                return false;
            });
        };
        return DirectiveDecoratorHandler;
    }());
    exports.DirectiveDecoratorHandler = DirectiveDecoratorHandler;
    /**
     * Helper function to extract metadata from a `Directive` or `Component`. `Directive`s without a
     * selector are allowed to be used for abstract base classes. These abstract directives should not
     * appear in the declarations of an `NgModule` and additional verification is done when processing
     * the module.
     */
    function extractDirectiveMetadata(clazz, decorator, reflector, evaluator, isCore, flags, annotateForClosureCompiler, defaultSelector) {
        if (defaultSelector === void 0) { defaultSelector = null; }
        var directive;
        if (decorator === null || decorator.args === null || decorator.args.length === 0) {
            directive = new Map();
        }
        else if (decorator.args.length !== 1) {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), "Incorrect number of arguments to @" + decorator.name + " decorator");
        }
        else {
            var meta = util_2.unwrapExpression(decorator.args[0]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "@" + decorator.name + " argument must be an object literal");
            }
            directive = reflection_1.reflectObjectLiteral(meta);
        }
        if (directive.has('jit')) {
            // The only allowed value is true, so there's no need to expand further.
            return undefined;
        }
        var members = reflector.getMembersOfClass(clazz);
        // Precompute a list of ts.ClassElements that have decorators. This includes things like @Input,
        // @Output, @HostBinding, etc.
        var decoratedElements = members.filter(function (member) { return !member.isStatic && member.decorators !== null; });
        var coreModule = isCore ? undefined : '@angular/core';
        // Construct the map of inputs both from the @Directive/@Component
        // decorator, and the decorated
        // fields.
        var inputsFromMeta = parseFieldToPropertyMapping(directive, 'inputs', evaluator);
        var inputsFromFields = parseDecoratedFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'Input', coreModule), evaluator, resolveInput);
        // And outputs.
        var outputsFromMeta = parseFieldToPropertyMapping(directive, 'outputs', evaluator);
        var outputsFromFields = parseDecoratedFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'Output', coreModule), evaluator, resolveOutput);
        // Construct the list of queries.
        var contentChildFromFields = queriesFromFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'ContentChild', coreModule), reflector, evaluator);
        var contentChildrenFromFields = queriesFromFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'ContentChildren', coreModule), reflector, evaluator);
        var queries = tslib_1.__spread(contentChildFromFields, contentChildrenFromFields);
        // Construct the list of view queries.
        var viewChildFromFields = queriesFromFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'ViewChild', coreModule), reflector, evaluator);
        var viewChildrenFromFields = queriesFromFields(reflection_1.filterToMembersWithDecorator(decoratedElements, 'ViewChildren', coreModule), reflector, evaluator);
        var viewQueries = tslib_1.__spread(viewChildFromFields, viewChildrenFromFields);
        if (directive.has('queries')) {
            var queriesFromDecorator = extractQueriesFromDecorator(directive.get('queries'), reflector, evaluator, isCore);
            queries.push.apply(queries, tslib_1.__spread(queriesFromDecorator.content));
            viewQueries.push.apply(viewQueries, tslib_1.__spread(queriesFromDecorator.view));
        }
        // Parse the selector.
        var selector = defaultSelector;
        if (directive.has('selector')) {
            var expr = directive.get('selector');
            var resolved = evaluator.evaluate(expr);
            if (typeof resolved !== 'string') {
                throw diagnostics_2.createValueHasWrongTypeError(expr, resolved, "selector must be a string");
            }
            // use default selector in case selector is an empty string
            selector = resolved === '' ? defaultSelector : resolved;
            if (!selector) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DIRECTIVE_MISSING_SELECTOR, expr, "Directive " + clazz.name.text + " has no selector, please add it!");
            }
        }
        var host = extractHostBindings(decoratedElements, evaluator, coreModule, directive);
        var providers = directive.has('providers') ?
            new compiler_1.WrappedNodeExpr(annotateForClosureCompiler ?
                util_2.wrapFunctionExpressionsInParens(directive.get('providers')) :
                directive.get('providers')) :
            null;
        // Determine if `ngOnChanges` is a lifecycle hook defined on the component.
        var usesOnChanges = members.some(function (member) { return !member.isStatic && member.kind === reflection_1.ClassMemberKind.Method &&
            member.name === 'ngOnChanges'; });
        // Parse exportAs.
        var exportAs = null;
        if (directive.has('exportAs')) {
            var expr = directive.get('exportAs');
            var resolved = evaluator.evaluate(expr);
            if (typeof resolved !== 'string') {
                throw diagnostics_2.createValueHasWrongTypeError(expr, resolved, "exportAs must be a string");
            }
            exportAs = resolved.split(',').map(function (part) { return part.trim(); });
        }
        var rawCtorDeps = util_2.getConstructorDependencies(clazz, reflector, isCore);
        var ctorDeps;
        // Non-abstract directives (those with a selector) require valid constructor dependencies, whereas
        // abstract directives are allowed to have invalid dependencies, given that a subclass may call
        // the constructor explicitly.
        if (selector !== null) {
            ctorDeps = util_2.validateConstructorDependencies(clazz, rawCtorDeps);
        }
        else {
            ctorDeps = util_2.unwrapConstructorDependencies(rawCtorDeps);
        }
        var isStructural = ctorDeps !== null && ctorDeps !== 'invalid' && ctorDeps.some(function (dep) {
            if (dep.resolved !== compiler_1.R3ResolvedDependencyType.Token || !(dep.token instanceof compiler_1.ExternalExpr)) {
                return false;
            }
            if (dep.token.value.moduleName !== '@angular/core' || dep.token.value.name !== 'TemplateRef') {
                return false;
            }
            return true;
        });
        // Detect if the component inherits from another class
        var usesInheritance = reflector.hasBaseClass(clazz);
        var type = util_2.wrapTypeReference(reflector, clazz);
        var internalType = new compiler_1.WrappedNodeExpr(reflector.getInternalNameOfClass(clazz));
        var inputs = metadata_1.ClassPropertyMapping.fromMappedObject(tslib_1.__assign(tslib_1.__assign({}, inputsFromMeta), inputsFromFields));
        var outputs = metadata_1.ClassPropertyMapping.fromMappedObject(tslib_1.__assign(tslib_1.__assign({}, outputsFromMeta), outputsFromFields));
        var metadata = {
            name: clazz.name.text,
            deps: ctorDeps,
            host: host,
            lifecycle: {
                usesOnChanges: usesOnChanges,
            },
            inputs: inputs.toJointMappedObject(),
            outputs: outputs.toDirectMappedObject(),
            queries: queries,
            viewQueries: viewQueries,
            selector: selector,
            fullInheritance: !!(flags & transform_1.HandlerFlags.FULL_INHERITANCE),
            type: type,
            internalType: internalType,
            typeArgumentCount: reflector.getGenericArityOfClass(clazz) || 0,
            typeSourceSpan: util_2.createSourceSpan(clazz.name),
            usesInheritance: usesInheritance,
            exportAs: exportAs,
            providers: providers
        };
        return {
            decorator: directive,
            metadata: metadata,
            inputs: inputs,
            outputs: outputs,
            isStructural: isStructural,
        };
    }
    exports.extractDirectiveMetadata = extractDirectiveMetadata;
    function extractQueryMetadata(exprNode, name, args, propertyName, reflector, evaluator) {
        if (args.length === 0) {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, exprNode, "@" + name + " must have arguments");
        }
        var first = name === 'ViewChild' || name === 'ContentChild';
        var node = util_2.unwrapForwardRef(args[0], reflector);
        var arg = evaluator.evaluate(node);
        /** Whether or not this query should collect only static results (see view/api.ts)  */
        var isStatic = false;
        // Extract the predicate
        var predicate = null;
        if (arg instanceof imports_1.Reference || arg instanceof partial_evaluator_1.DynamicValue) {
            // References and predicates that could not be evaluated statically are emitted as is.
            predicate = new compiler_1.WrappedNodeExpr(node);
        }
        else if (typeof arg === 'string') {
            predicate = [arg];
        }
        else if (isStringArrayOrDie(arg, "@" + name + " predicate", node)) {
            predicate = arg;
        }
        else {
            throw diagnostics_2.createValueHasWrongTypeError(node, arg, "@" + name + " predicate cannot be interpreted");
        }
        // Extract the read and descendants options.
        var read = null;
        // The default value for descendants is true for every decorator except @ContentChildren.
        var descendants = name !== 'ContentChildren';
        var emitDistinctChangesOnly = core_1.emitDistinctChangesOnlyDefaultValue;
        if (args.length === 2) {
            var optionsExpr = util_2.unwrapExpression(args[1]);
            if (!ts.isObjectLiteralExpression(optionsExpr)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, optionsExpr, "@" + name + " options must be an object literal");
            }
            var options = reflection_1.reflectObjectLiteral(optionsExpr);
            if (options.has('read')) {
                read = new compiler_1.WrappedNodeExpr(options.get('read'));
            }
            if (options.has('descendants')) {
                var descendantsExpr = options.get('descendants');
                var descendantsValue = evaluator.evaluate(descendantsExpr);
                if (typeof descendantsValue !== 'boolean') {
                    throw diagnostics_2.createValueHasWrongTypeError(descendantsExpr, descendantsValue, "@" + name + " options.descendants must be a boolean");
                }
                descendants = descendantsValue;
            }
            if (options.has('emitDistinctChangesOnly')) {
                var emitDistinctChangesOnlyExpr = options.get('emitDistinctChangesOnly');
                var emitDistinctChangesOnlyValue = evaluator.evaluate(emitDistinctChangesOnlyExpr);
                if (typeof emitDistinctChangesOnlyValue !== 'boolean') {
                    throw diagnostics_2.createValueHasWrongTypeError(emitDistinctChangesOnlyExpr, emitDistinctChangesOnlyValue, "@" + name + " options.emitDistinctChangesOnlys must be a boolean");
                }
                emitDistinctChangesOnly = emitDistinctChangesOnlyValue;
            }
            if (options.has('static')) {
                var staticValue = evaluator.evaluate(options.get('static'));
                if (typeof staticValue !== 'boolean') {
                    throw diagnostics_2.createValueHasWrongTypeError(node, staticValue, "@" + name + " options.static must be a boolean");
                }
                isStatic = staticValue;
            }
        }
        else if (args.length > 2) {
            // Too many arguments.
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, node, "@" + name + " has too many arguments");
        }
        return {
            propertyName: propertyName,
            predicate: predicate,
            first: first,
            descendants: descendants,
            read: read,
            static: isStatic,
            emitDistinctChangesOnly: emitDistinctChangesOnly,
        };
    }
    exports.extractQueryMetadata = extractQueryMetadata;
    function extractQueriesFromDecorator(queryData, reflector, evaluator, isCore) {
        var content = [], view = [];
        if (!ts.isObjectLiteralExpression(queryData)) {
            throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, 'Decorator queries metadata must be an object literal');
        }
        reflection_1.reflectObjectLiteral(queryData).forEach(function (queryExpr, propertyName) {
            queryExpr = util_2.unwrapExpression(queryExpr);
            if (!ts.isNewExpression(queryExpr)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, 'Decorator query metadata must be an instance of a query type');
            }
            var queryType = ts.isPropertyAccessExpression(queryExpr.expression) ?
                queryExpr.expression.name :
                queryExpr.expression;
            if (!ts.isIdentifier(queryType)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, 'Decorator query metadata must be an instance of a query type');
            }
            var type = reflector.getImportOfIdentifier(queryType);
            if (type === null || (!isCore && type.from !== '@angular/core') ||
                !QUERY_TYPES.has(type.name)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.VALUE_HAS_WRONG_TYPE, queryData, 'Decorator query metadata must be an instance of a query type');
            }
            var query = extractQueryMetadata(queryExpr, type.name, queryExpr.arguments || [], propertyName, reflector, evaluator);
            if (type.name.startsWith('Content')) {
                content.push(query);
            }
            else {
                view.push(query);
            }
        });
        return { content: content, view: view };
    }
    exports.extractQueriesFromDecorator = extractQueriesFromDecorator;
    function isStringArrayOrDie(value, name, node) {
        if (!Array.isArray(value)) {
            return false;
        }
        for (var i = 0; i < value.length; i++) {
            if (typeof value[i] !== 'string') {
                throw diagnostics_2.createValueHasWrongTypeError(node, value[i], "Failed to resolve " + name + " at position " + i + " to a string");
            }
        }
        return true;
    }
    function parseFieldArrayValue(directive, field, evaluator) {
        if (!directive.has(field)) {
            return null;
        }
        // Resolve the field of interest from the directive metadata to a string[].
        var expression = directive.get(field);
        var value = evaluator.evaluate(expression);
        if (!isStringArrayOrDie(value, field, expression)) {
            throw diagnostics_2.createValueHasWrongTypeError(expression, value, "Failed to resolve @Directive." + field + " to a string array");
        }
        return value;
    }
    exports.parseFieldArrayValue = parseFieldArrayValue;
    /**
     * Interpret property mapping fields on the decorator (e.g. inputs or outputs) and return the
     * correctly shaped metadata object.
     */
    function parseFieldToPropertyMapping(directive, field, evaluator) {
        var metaValues = parseFieldArrayValue(directive, field, evaluator);
        if (!metaValues) {
            return EMPTY_OBJECT;
        }
        return metaValues.reduce(function (results, value) {
            // Either the value is 'field' or 'field: property'. In the first case, `property` will
            // be undefined, in which case the field name should also be used as the property name.
            var _a = tslib_1.__read(value.split(':', 2).map(function (str) { return str.trim(); }), 2), field = _a[0], property = _a[1];
            results[field] = property || field;
            return results;
        }, {});
    }
    /**
     * Parse property decorators (e.g. `Input` or `Output`) and return the correctly shaped metadata
     * object.
     */
    function parseDecoratedFields(fields, evaluator, mapValueResolver) {
        return fields.reduce(function (results, field) {
            var fieldName = field.member.name;
            field.decorators.forEach(function (decorator) {
                // The decorator either doesn't have an argument (@Input()) in which case the property
                // name is used, or it has one argument (@Output('named')).
                if (decorator.args == null || decorator.args.length === 0) {
                    results[fieldName] = fieldName;
                }
                else if (decorator.args.length === 1) {
                    var property = evaluator.evaluate(decorator.args[0]);
                    if (typeof property !== 'string') {
                        throw diagnostics_2.createValueHasWrongTypeError(reflection_1.Decorator.nodeForError(decorator), property, "@" + decorator.name + " decorator argument must resolve to a string");
                    }
                    results[fieldName] = mapValueResolver(property, fieldName);
                }
                else {
                    // Too many arguments.
                    throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), "@" + decorator.name + " can have at most one argument, got " + decorator.args.length + " argument(s)");
                }
            });
            return results;
        }, {});
    }
    function resolveInput(publicName, internalName) {
        return [publicName, internalName];
    }
    function resolveOutput(publicName, internalName) {
        return publicName;
    }
    function queriesFromFields(fields, reflector, evaluator) {
        return fields.map(function (_a) {
            var member = _a.member, decorators = _a.decorators;
            var decorator = decorators[0];
            var node = member.node || reflection_1.Decorator.nodeForError(decorator);
            // Throw in case of `@Input() @ContentChild('foo') foo: any`, which is not supported in Ivy
            if (member.decorators.some(function (v) { return v.name === 'Input'; })) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_COLLISION, node, 'Cannot combine @Input decorators with query decorators');
            }
            if (decorators.length !== 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_COLLISION, node, 'Cannot have multiple query decorators on the same class member');
            }
            else if (!isPropertyTypeMember(member)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_UNEXPECTED, node, 'Query decorator must go on a property-type member');
            }
            return extractQueryMetadata(node, decorator.name, decorator.args || [], member.name, reflector, evaluator);
        });
    }
    exports.queriesFromFields = queriesFromFields;
    function isPropertyTypeMember(member) {
        return member.kind === reflection_1.ClassMemberKind.Getter || member.kind === reflection_1.ClassMemberKind.Setter ||
            member.kind === reflection_1.ClassMemberKind.Property;
    }
    function evaluateHostExpressionBindings(hostExpr, evaluator) {
        var hostMetaMap = evaluator.evaluate(hostExpr);
        if (!(hostMetaMap instanceof Map)) {
            throw diagnostics_2.createValueHasWrongTypeError(hostExpr, hostMetaMap, "Decorator host metadata must be an object");
        }
        var hostMetadata = {};
        hostMetaMap.forEach(function (value, key) {
            // Resolve Enum references to their declared value.
            if (value instanceof partial_evaluator_1.EnumValue) {
                value = value.resolved;
            }
            if (typeof key !== 'string') {
                throw diagnostics_2.createValueHasWrongTypeError(hostExpr, key, "Decorator host metadata must be a string -> string object, but found unparseable key");
            }
            if (typeof value == 'string') {
                hostMetadata[key] = value;
            }
            else if (value instanceof partial_evaluator_1.DynamicValue) {
                hostMetadata[key] = new compiler_1.WrappedNodeExpr(value.node);
            }
            else {
                throw diagnostics_2.createValueHasWrongTypeError(hostExpr, value, "Decorator host metadata must be a string -> string object, but found unparseable value");
            }
        });
        var bindings = compiler_1.parseHostBindings(hostMetadata);
        var errors = compiler_1.verifyHostBindings(bindings, util_2.createSourceSpan(hostExpr));
        if (errors.length > 0) {
            throw new diagnostics_1.FatalDiagnosticError(
            // TODO: provide more granular diagnostic and output specific host expression that
            // triggered an error instead of the whole host object.
            diagnostics_1.ErrorCode.HOST_BINDING_PARSE_ERROR, hostExpr, errors.map(function (error) { return error.msg; }).join('\n'));
        }
        return bindings;
    }
    function extractHostBindings(members, evaluator, coreModule, metadata) {
        var bindings;
        if (metadata && metadata.has('host')) {
            bindings = evaluateHostExpressionBindings(metadata.get('host'), evaluator);
        }
        else {
            bindings = compiler_1.parseHostBindings({});
        }
        reflection_1.filterToMembersWithDecorator(members, 'HostBinding', coreModule)
            .forEach(function (_a) {
            var member = _a.member, decorators = _a.decorators;
            decorators.forEach(function (decorator) {
                var hostPropertyName = member.name;
                if (decorator.args !== null && decorator.args.length > 0) {
                    if (decorator.args.length !== 1) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), "@HostBinding can have at most one argument, got " + decorator.args.length + " argument(s)");
                    }
                    var resolved = evaluator.evaluate(decorator.args[0]);
                    if (typeof resolved !== 'string') {
                        throw diagnostics_2.createValueHasWrongTypeError(reflection_1.Decorator.nodeForError(decorator), resolved, "@HostBinding's argument must be a string");
                    }
                    hostPropertyName = resolved;
                }
                // Since this is a decorator, we know that the value is a class member. Always access it
                // through `this` so that further down the line it can't be confused for a literal value
                // (e.g. if there's a property called `true`). There is no size penalty, because all
                // values (except literals) are converted to `ctx.propName` eventually.
                bindings.properties[hostPropertyName] = compiler_1.getSafePropertyAccessString('this', member.name);
            });
        });
        reflection_1.filterToMembersWithDecorator(members, 'HostListener', coreModule)
            .forEach(function (_a) {
            var member = _a.member, decorators = _a.decorators;
            decorators.forEach(function (decorator) {
                var eventName = member.name;
                var args = [];
                if (decorator.args !== null && decorator.args.length > 0) {
                    if (decorator.args.length > 2) {
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, decorator.args[2], "@HostListener can have at most two arguments");
                    }
                    var resolved = evaluator.evaluate(decorator.args[0]);
                    if (typeof resolved !== 'string') {
                        throw diagnostics_2.createValueHasWrongTypeError(decorator.args[0], resolved, "@HostListener's event name argument must be a string");
                    }
                    eventName = resolved;
                    if (decorator.args.length === 2) {
                        var expression = decorator.args[1];
                        var resolvedArgs = evaluator.evaluate(decorator.args[1]);
                        if (!isStringArrayOrDie(resolvedArgs, '@HostListener.args', expression)) {
                            throw diagnostics_2.createValueHasWrongTypeError(decorator.args[1], resolvedArgs, "@HostListener's second argument must be a string array");
                        }
                        args = resolvedArgs;
                    }
                }
                bindings.listeners[eventName] = member.name + "(" + args.join(',') + ")";
            });
        });
        return bindings;
    }
    exports.extractHostBindings = extractHostBindings;
    var QUERY_TYPES = new Set([
        'ContentChild',
        'ContentChildren',
        'ViewChild',
        'ViewChildren',
    ]);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucy9zcmMvZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBbWE7SUFDbmEsbURBQStFO0lBQy9FLCtCQUFpQztJQUVqQywyRUFBa0U7SUFFbEUsbUVBQXdDO0lBQ3hDLDZGQUFnTjtJQUNoTixxRUFBa007SUFDbE0sMEVBQXNFO0lBQ3RFLHVGQUFrRjtJQUNsRiw2REFBbUQ7SUFDbkQseUVBQStKO0lBRS9KLHVFQUE4STtJQUU5SSwyRkFBOEo7SUFDOUosbUZBQW1EO0lBQ25ELHFGQUF3RDtJQUN4RCw2RUFBdVQ7SUFFdlQsSUFBTSxZQUFZLEdBQTRCLEVBQUUsQ0FBQztJQUNqRCxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsaUJBQWlCLEVBQUUsYUFBYTtRQUNoRyxjQUFjO0tBQ2YsQ0FBQztJQUNGLElBQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDO1FBQzlCLGFBQWEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0I7UUFDOUYsb0JBQW9CLEVBQUUsdUJBQXVCO0tBQzlDLENBQUMsQ0FBQztJQWNIOzs7T0FHRztJQUNIO1FBQXFDLDJDQUFjO1FBR2pELHlCQUNJLElBQXNCLEVBQWtCLFFBQXFCLEVBQzdDLE1BQTRCLEVBQWtCLE9BQTZCLEVBQzNFLFFBQXVCLEVBQ3ZCLGFBQXFDLEVBQ3JDLGNBQTRDO1lBTGhFLFlBTUUsa0JBQU0sSUFBSSxDQUFDLFNBQ1o7WUFOMkMsY0FBUSxHQUFSLFFBQVEsQ0FBYTtZQUM3QyxZQUFNLEdBQU4sTUFBTSxD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RCxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFNLE1BQU0sQ0FBQyxJQUFJLFNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBRyxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBN0VELGtEQTZFQztJQUVELElBQU0sV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDO1FBQzFCLGNBQWM7UUFDZCxpQkFBaUI7UUFDakIsV0FBVztRQUNYLGNBQWM7S0FDZixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21waWxlRGVjbGFyZURpcmVjdGl2ZUZyb21NZXRhZGF0YSwgY29tcGlsZURpcmVjdGl2ZUZyb21NZXRhZGF0YSwgQ29uc3RhbnRQb29sLCBFeHByZXNzaW9uLCBFeHRlcm5hbEV4cHIsIGdldFNhZmVQcm9wZXJ0eUFjY2Vzc1N0cmluZywgSWRlbnRpZmllcnMsIG1ha2VCaW5kaW5nUGFyc2VyLCBQYXJzZWRIb3N0QmluZGluZ3MsIFBhcnNlRXJyb3IsIHBhcnNlSG9zdEJpbmRpbmdzLCBSM0RlcGVuZGVuY3lNZXRhZGF0YSwgUjNEaXJlY3RpdmVEZWYsIFIzRGlyZWN0aXZlTWV0YWRhdGEsIFIzRmFjdG9yeVRhcmdldCwgUjNRdWVyeU1ldGFkYXRhLCBSM1Jlc29sdmVkRGVwZW5kZW5jeVR5cGUsIFN0YXRlbWVudCwgdmVyaWZ5SG9zdEJpbmRpbmdzLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCB7ZW1pdERpc3RpbmN0Q2hhbmdlc09ubHlEZWZhdWx0VmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyL3NyYy9jb3JlJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgRmF0YWxEaWFnbm9zdGljRXJyb3J9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7YWJzb2x1dGVGcm9tU291cmNlRmlsZX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtSZWZlcmVuY2V9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHthcmVUeXBlUGFyYW1ldGVyc0VxdWFsLCBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycywgaXNBcnJheUVxdWFsLCBpc1NldEVxdWFsLCBpc1N5bWJvbEVxdWFsLCBTZW1hbnRpY0RlcEdyYXBoVXBkYXRlciwgU2VtYW50aWNTeW1ib2wsIFNlbWFudGljVHlwZVBhcmFtZXRlcn0gZnJvbSAnLi4vLi4vaW5jcmVtZW50YWwvc2VtYW50aWNfZ3JhcGgnO1xuaW1wb3J0IHtCaW5kaW5nUHJvcGVydHlOYW1lLCBDbGFzc1Byb3BlcnR5TWFwcGluZywgQ2xhc3NQcm9wZXJ0eU5hbWUsIERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBNZXRhZGF0YVJlYWRlciwgTWV0YWRhdGFSZWdpc3RyeSwgVGVtcGxhdGVHdWFyZE1ldGF9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7ZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGF9IGZyb20gJy4uLy4uL21ldGFkYXRhL3NyYy91dGlsJztcbmltcG9ydCB7RHluYW1pY1ZhbHVlLCBFbnVtVmFsdWUsIFBhcnRpYWxFdmFsdWF0b3J9IGZyb20gJy4uLy4uL3BhcnRpYWxfZXZhbHVhdG9yJztcbmltcG9ydCB7UGVyZkV2ZW50LCBQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBDbGFzc01lbWJlciwgQ2xhc3NNZW1iZXJLaW5kLCBEZWNvcmF0b3IsIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0T2JqZWN0TGl0ZXJhbH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0xvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NvcGUnO1xuaW1wb3J0IHtBbmFseXNpc091dHB1dCwgQ29tcGlsZVJlc3VsdCwgRGVjb3JhdG9ySGFuZGxlciwgRGV0ZWN0UmVzdWx0LCBIYW5kbGVyRmxhZ3MsIEhhbmRsZXJQcmVjZWRlbmNlLCBSZXNvbHZlUmVzdWx0fSBmcm9tICcuLi8uLi90cmFuc2Zvcm0nO1xuXG5pbXBvcnQge2NyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IsIGdldERpcmVjdGl2ZURpYWdub3N0aWNzLCBnZXRQcm92aWRlckRpYWdub3N0aWNzLCBnZXRVbmRlY29yYXRlZENsYXNzV2l0aEFuZ3VsYXJGZWF0dXJlc0RpYWdub3N0aWN9IGZyb20gJy4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtjb21waWxlTmdGYWN0b3J5RGVmRmllbGR9IGZyb20gJy4vZmFjdG9yeSc7XG5pbXBvcnQge2dlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGx9IGZyb20gJy4vbWV0YWRhdGEnO1xuaW1wb3J0IHtjcmVhdGVTb3VyY2VTcGFuLCBmaW5kQW5ndWxhckRlY29yYXRvciwgZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMsIGlzQW5ndWxhckRlY29yYXRvciwgcmVhZEJhc2VDbGFzcywgcmVzb2x2ZVByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnksIHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzLCB1bndyYXBFeHByZXNzaW9uLCB1bndyYXBGb3J3YXJkUmVmLCB2YWxpZGF0ZUNvbnN0cnVjdG9yRGVwZW5kZW5jaWVzLCB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zLCB3cmFwVHlwZVJlZmVyZW5jZX0gZnJvbSAnLi91dGlsJztcblxuY29uc3QgRU1QVFlfT0JKRUNUOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuY29uc3QgRklFTERfREVDT1JBVE9SUyA9IFtcbiAgJ0lucHV0JywgJ091dHB1dCcsICdWaWV3Q2hpbGQnLCAnVmlld0NoaWxkcmVuJywgJ0NvbnRlbnRDaGlsZCcsICdDb250ZW50Q2hpbGRyZW4nLCAnSG9zdEJpbmRpbmcnLFxuICAnSG9zdExpc3RlbmVyJ1xuXTtcbmNvbnN0IExJRkVDWUNMRV9IT09LUyA9IG5ldyBTZXQoW1xuICAnbmdPbkNoYW5nZXMnLCAnbmdPbkluaXQnLCAnbmdPbkRlc3Ryb3knLCAnbmdEb0NoZWNrJywgJ25nQWZ0ZXJWaWV3SW5pdCcsICduZ0FmdGVyVmlld0NoZWNrZWQnLFxuICAnbmdBZnRlckNvbnRlbnRJbml0JywgJ25nQWZ0ZXJDb250ZW50Q2hlY2tlZCdcbl0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZUhhbmRsZXJEYXRhIHtcbiAgYmFzZUNsYXNzOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj58J2R5bmFtaWMnfG51bGw7XG4gIHR5cGVDaGVja01ldGE6IERpcmVjdGl2ZVR5cGVDaGVja01ldGE7XG4gIG1ldGE6IFIzRGlyZWN0aXZlTWV0YWRhdGE7XG4gIG1ldGFkYXRhU3RtdDogU3RhdGVtZW50fG51bGw7XG4gIHByb3ZpZGVyc1JlcXVpcmluZ0ZhY3Rvcnk6IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+fG51bGw7XG4gIGlucHV0czogQ2xhc3NQcm9wZXJ0eU1hcHBpbmc7XG4gIG91dHB1dHM6IENsYXNzUHJvcGVydHlNYXBwaW5nO1xuICBpc1BvaXNvbmVkOiBib29sZWFuO1xuICBpc1N0cnVjdHVyYWw6IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBBbmd1bGFyIGRpcmVjdGl2ZS4gQ29tcG9uZW50cyBhcmUgcmVwcmVzZW50ZWQgYnkgYENvbXBvbmVudFN5bWJvbGAsIHdoaWNoIGluaGVyaXRzXG4gKiBmcm9tIHRoaXMgc3ltYm9sLlxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlU3ltYm9sIGV4dGVuZHMgU2VtYW50aWNTeW1ib2wge1xuICBiYXNlQ2xhc3M6IFNlbWFudGljU3ltYm9sfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZGVjbDogQ2xhc3NEZWNsYXJhdGlvbiwgcHVibGljIHJlYWRvbmx5IHNlbGVjdG9yOiBzdHJpbmd8bnVsbCxcbiAgICAgIHB1YmxpYyByZWFkb25seSBpbnB1dHM6IENsYXNzUHJvcGVydHlNYXBwaW5nLCBwdWJsaWMgcmVhZG9ubHkgb3V0cHV0czogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcsXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgZXhwb3J0QXM6IHN0cmluZ1tdfG51bGwsXG4gICAgICBwdWJsaWMgcmVhZG9ubHkgdHlwZUNoZWNrTWV0YTogRGlyZWN0aXZlVHlwZUNoZWNrTWV0YSxcbiAgICAgIHB1YmxpYyByZWFkb25seSB0eXBlUGFyYW1ldGVyczogU2VtYW50aWNUeXBlUGFyYW1ldGVyW118bnVsbCkge1xuICAgIHN1cGVyKGRlY2wpO1xuICB9XG5cbiAgaXNQdWJsaWNBcGlBZmZlY3RlZChwcmV2aW91c1N5bWJvbDogU2VtYW50aWNTeW1ib2wpOiBib29sZWFuIHtcbiAgICAvLyBOb3RlOiBzaW5jZSBjb21wb25lbnRzIGFuZCBkaXJlY3RpdmVzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBpdGVtcyBjb250cmlidXRpbmcgdG8gdGhlaXJcbiAgICAvLyBwdWJsaWMgQVBJLCBpdCBpcyBva2F5IGZvciBhIGRpcmVjdGl2ZSB0byBjaGFuZ2UgaW50byBhIGNvbXBvbmVudCBhbmQgdmljZSB2ZXJzYSB3aXRob3V0XG4gICAgLy8gdGhlIEFQSSBiZWluZyBhZmZlY3RlZC5cbiAgICBpZiAoIShwcmV2aW91c1N5bWJvbCBpbnN0YW5jZW9mIERpcmVjdGl2ZVN5bWJvbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIERpcmVjdGl2ZXMgYW5kIGNvbXBvbmVudHMgaGF2ZSBhIHB1YmxpYyBBUEkgb2Y6XG4gICAgLy8gIDEuIFRoZWlyIHNlbGVjdG9yLlxuICAgIC8vICAyLiBUaGUgYmluZGluZyBuYW1lcyBvZiB0aGVpciBpbnB1dHMgYW5kIG91dHB1dHM7IGEgY2hhbmdlIGluIG9yZGVyaW5nIGlzIGFsc28gY29uc2lkZXJlZFxuICAgIC8vICAgICB0byBiZSBhIGNoYW5nZSBpbiBwdWJsaWMgQVBJLlxuICAgIC8vICAzLiBUaGUgbGlzdCBvZiBleHBvcnRBcyBuYW1lcyBhbmQgaXRzIG9yZGVyaW5nLlxuICAgIHJldHVybiB0aGlzLnNlbGVjdG9yICE9PSBwcmV2aW91c1N5bWJvbC5zZWxlY3RvciB8fFxuICAgICAgICAhaXNBcnJheUVxdWFsKHRoaXMuaW5wdXRzLnByb3BlcnR5TmFtZXMsIHByZXZpb3VzU3ltYm9sLmlucHV0cy5wcm9wZXJ0eU5hbWVzKSB8fFxuICAgICAgICAhaXNBcnJheUVxdWFsKHRoaXMub3V0cHV0cy5wcm9wZXJ0eU5hbWVzLCBwcmV2aW91c1N5bWJvbC5vdXRwdXRzLnByb3BlcnR5TmFtZXMpIHx8XG4gICAgICAgICFpc0FycmF5RXF1YWwodGhpcy5leHBvcnRBcywgcHJldmlvdXNTeW1ib2wuZXhwb3J0QXMpO1xuICB9XG5cbiAgaXNUeXBlQ2hlY2tBcGlBZmZlY3RlZChwcmV2aW91c1N5bWJvbDogU2VtYW50aWNTeW1ib2wpOiBib29sZWFuIHtcbiAgICAvLyBJZiB0aGUgcHVibGljIEFQSSBvZiB0aGUgZGlyZWN0aXZlIGhhcyBjaGFuZ2VkLCB0aGVuIHNvIGhhcyBpdHMgdHlwZS1jaGVjayBBUEkuXG4gICAgaWYgKHRoaXMuaXNQdWJsaWNBcGlBZmZlY3RlZChwcmV2aW91c1N5bWJvbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICghKHByZXZpb3VzU3ltYm9sIGluc3RhbmNlb2YgRGlyZWN0aXZlU3ltYm9sKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUtY2hlY2sgYmxvY2sgYWxzbyBkZXBlbmRzIG9uIHRoZSBjbGFzcyBwcm9wZXJ0eSBuYW1lcywgYXMgd3JpdGVzIHByb3BlcnR5IGJpbmRpbmdzXG4gICAgLy8gZGlyZWN0bHkgaW50byB0aGUgYmFja2luZyBmaWVsZHMuXG4gICAgaWYgKCFpc0FycmF5RXF1YWwoXG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuaW5wdXRzKSwgQXJyYXkuZnJvbShwcmV2aW91c1N5bWJvbC5pbnB1dHMpLCBpc0lucHV0TWFwcGluZ0VxdWFsKSB8fFxuICAgICAgICAhaXNBcnJheUVxdWFsKFxuICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLm91dHB1dHMpLCBBcnJheS5mcm9tKHByZXZpb3VzU3ltYm9sLm91dHB1dHMpLCBpc0lucHV0TWFwcGluZ0VxdWFsKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVGhlIHR5cGUgcGFyYW1ldGVycyBvZiBhIGRpcmVjdGl2ZSBhcmUgZW1pdHRlZCBpbnRvIHRoZSB0eXBlIGNvbnN0cnVjdG9ycyBpbiB0aGUgdHlwZS1jaGVja1xuICAgIC8vIGJsb2NrIG9mIGEgY29tcG9uZW50LCBzbyBpZiB0aGUgdHlwZSBwYXJhbWV0ZXJzIGFyZSBub3QgY29uc2lkZXJlZCBlcXVhbCB0aGVuIGNvbnNpZGVyIHRoZVxuICAgIC8vIHR5cGUtY2hlY2sgQVBJIG9mIHRoaXMgZGlyZWN0aXZlIHRvIGJlIGFmZmVjdGVkLlxuICAgIGlmICghYXJlVHlwZVBhcmFtZXRlcnNFcXVhbCh0aGlzLnR5cGVQYXJhbWV0ZXJzLCBwcmV2aW91c1N5bWJvbC50eXBlUGFyYW1ldGVycykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFRoZSB0eXBlLWNoZWNrIG1ldGFkYXRhIGlzIHVzZWQgZHVyaW5nIFRDQiBjb2RlIGdlbmVyYXRpb24sIHNvIGFueSBjaGFuZ2VzIHNob3VsZCBpbnZhbGlkYXRlXG4gICAgLy8gcHJpb3IgdHlwZS1jaGVjayBmaWxlcy5cbiAgICBpZiAoIWlzVHlwZUNoZWNrTWV0YUVxdWFsKHRoaXMudHlwZUNoZWNrTWV0YSwgcHJldmlvdXNTeW1ib2wudHlwZUNoZWNrTWV0YSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIENoYW5naW5nIHRoZSBiYXNlIGNsYXNzIG9mIGEgZGlyZWN0aXZlIG1lYW5zIHRoYXQgaXRzIGlucHV0cy9vdXRwdXRzIGV0YyBtYXkgaGF2ZSBjaGFuZ2VkLFxuICAgIC8vIHNvIHRoZSB0eXBlLWNoZWNrIGJsb2NrIG9mIGNvbXBvbmVudHMgdGhhdCB1c2UgdGhpcyBkaXJlY3RpdmUgbmVlZHMgdG8gYmUgcmVnZW5lcmF0ZWQuXG4gICAgaWYgKCFpc0Jhc2VDbGFzc0VxdWFsKHRoaXMuYmFzZUNsYXNzLCBwcmV2aW91c1N5bWJvbC5iYXNlQ2xhc3MpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNJbnB1dE1hcHBpbmdFcXVhbChcbiAgICBjdXJyZW50OiBbQ2xhc3NQcm9wZXJ0eU5hbWUsIEJpbmRpbmdQcm9wZXJ0eU5hbWVdLFxuICAgIHByZXZpb3VzOiBbQ2xhc3NQcm9wZXJ0eU5hbWUsIEJpbmRpbmdQcm9wZXJ0eU5hbWVdKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50WzBdID09PSBwcmV2aW91c1swXSAmJiBjdXJyZW50WzFdID09PSBwcmV2aW91c1sxXTtcbn1cblxuZnVuY3Rpb24gaXNUeXBlQ2hlY2tNZXRhRXF1YWwoXG4gICAgY3VycmVudDogRGlyZWN0aXZlVHlwZUNoZWNrTWV0YSwgcHJldmlvdXM6IERpcmVjdGl2ZVR5cGVDaGVja01ldGEpOiBib29sZWFuIHtcbiAgaWYgKGN1cnJlbnQuaGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCAhPT0gcHJldmlvdXMuaGFzTmdUZW1wbGF0ZUNvbnRleHRHdWFyZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoY3VycmVudC5pc0dlbmVyaWMgIT09IHByZXZpb3VzLmlzR2VuZXJpYykge1xuICAgIC8vIE5vdGU6IGNoYW5nZXMgaW4gdGhlIG51bWJlciBvZiB0eXBlIHBhcmFtZXRlcnMgaXMgYWxzbyBjb25zaWRlcmVkIGluIGBhcmVUeXBlUGFyYW1ldGVyc0VxdWFsYFxuICAgIC8vIHNvIHRoaXMgY2hlY2sgaXMgdGVjaG5pY2FsbHkgbm90IG5lZWRlZDsgaXQgaXMgZG9uZSBhbnl3YXkgZm9yIGNvbXBsZXRlbmVzcyBpbiB0ZXJtcyBvZlxuICAgIC8vIHdoZXRoZXIgdGhlIGBEaXJlY3RpdmVUeXBlQ2hlY2tNZXRhYCBzdHJ1Y3QgaXRzZWxmIGNvbXBhcmVzIGVxdWFsIG9yIG5vdC5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCFpc0FycmF5RXF1YWwoY3VycmVudC5uZ1RlbXBsYXRlR3VhcmRzLCBwcmV2aW91cy5uZ1RlbXBsYXRlR3VhcmRzLCBpc1RlbXBsYXRlR3VhcmRFcXVhbCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCFpc1NldEVxdWFsKGN1cnJlbnQuY29lcmNlZElucHV0RmllbGRzLCBwcmV2aW91cy5jb2VyY2VkSW5wdXRGaWVsZHMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICghaXNTZXRFcXVhbChjdXJyZW50LnJlc3RyaWN0ZWRJbnB1dEZpZWxkcywgcHJldmlvdXMucmVzdHJpY3RlZElucHV0RmllbGRzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIWlzU2V0RXF1YWwoY3VycmVudC5zdHJpbmdMaXRlcmFsSW5wdXRGaWVsZHMsIHByZXZpb3VzLnN0cmluZ0xpdGVyYWxJbnB1dEZpZWxkcykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCFpc1NldEVxdWFsKGN1cnJlbnQudW5kZWNsYXJlZElucHV0RmllbGRzLCBwcmV2aW91cy51bmRlY2xhcmVkSW5wdXRGaWVsZHMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBpc1RlbXBsYXRlR3VhcmRFcXVhbChjdXJyZW50OiBUZW1wbGF0ZUd1YXJkTWV0YSwgcHJldmlvdXM6IFRlbXBsYXRlR3VhcmRNZXRhKTogYm9vbGVhbiB7XG4gIHJldHVybiBjdXJyZW50LmlucHV0TmFtZSA9PT0gcHJldmlvdXMuaW5wdXROYW1lICYmIGN1cnJlbnQudHlwZSA9PT0gcHJldmlvdXMudHlwZTtcbn1cblxuZnVuY3Rpb24gaXNCYXNlQ2xhc3NFcXVhbChjdXJyZW50OiBTZW1hbnRpY1N5bWJvbHxudWxsLCBwcmV2aW91czogU2VtYW50aWNTeW1ib2x8bnVsbCk6IGJvb2xlYW4ge1xuICBpZiAoY3VycmVudCA9PT0gbnVsbCB8fCBwcmV2aW91cyA9PT0gbnVsbCkge1xuICAgIHJldHVybiBjdXJyZW50ID09PSBwcmV2aW91cztcbiAgfVxuXG4gIHJldHVybiBpc1N5bWJvbEVxdWFsKGN1cnJlbnQsIHByZXZpb3VzKTtcbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZURlY29yYXRvckhhbmRsZXIgaW1wbGVtZW50c1xuICAgIERlY29yYXRvckhhbmRsZXI8RGVjb3JhdG9yfG51bGwsIERpcmVjdGl2ZUhhbmRsZXJEYXRhLCBEaXJlY3RpdmVTeW1ib2wsIHVua25vd24+IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLFxuICAgICAgcHJpdmF0ZSBtZXRhUmVnaXN0cnk6IE1ldGFkYXRhUmVnaXN0cnksIHByaXZhdGUgc2NvcGVSZWdpc3RyeTogTG9jYWxNb2R1bGVTY29wZVJlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSBtZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlciwgcHJpdmF0ZSBpbmplY3RhYmxlUmVnaXN0cnk6IEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LFxuICAgICAgcHJpdmF0ZSBpc0NvcmU6IGJvb2xlYW4sIHByaXZhdGUgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI6IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyfG51bGwsXG4gICAgICBwcml2YXRlIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuLFxuICAgICAgcHJpdmF0ZSBjb21waWxlVW5kZWNvcmF0ZWRDbGFzc2VzV2l0aEFuZ3VsYXJGZWF0dXJlczogYm9vbGVhbiwgcHJpdmF0ZSBwZXJmOiBQZXJmUmVjb3JkZXIpIHt9XG5cbiAgcmVhZG9ubHkgcHJlY2VkZW5jZSA9IEhhbmRsZXJQcmVjZWRlbmNlLlBSSU1BUlk7XG4gIHJlYWRvbmx5IG5hbWUgPSBEaXJlY3RpdmVEZWNvcmF0b3JIYW5kbGVyLm5hbWU7XG5cbiAgZGV0ZWN0KG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwpOlxuICAgICAgRGV0ZWN0UmVzdWx0PERlY29yYXRvcnxudWxsPnx1bmRlZmluZWQge1xuICAgIC8vIElmIGEgY2xhc3MgaXMgdW5kZWNvcmF0ZWQgYnV0IHVzZXMgQW5ndWxhciBmZWF0dXJlcywgd2UgZGV0ZWN0IGl0IGFzIGFuXG4gICAgLy8gYWJzdHJhY3QgZGlyZWN0aXZlLiBUaGlzIGlzIGFuIHVuc3VwcG9ydGVkIHBhdHRlcm4gYXMgb2YgdjEwLCBidXQgd2Ugd2FudFxuICAgIC8vIHRvIHN0aWxsIGRldGVjdCB0aGVzZSBwYXR0ZXJucyBzbyB0aGF0IHdlIGNhbiByZXBvcnQgZGlhZ25vc3RpY3MsIG9yIGNvbXBpbGVcbiAgICAvLyB0aGVtIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBpbiBuZ2NjLlxuICAgIGlmICghZGVjb3JhdG9ycykge1xuICAgICAgY29uc3QgYW5ndWxhckZpZWxkID0gdGhpcy5maW5kQ2xhc3NGaWVsZFdpdGhBbmd1bGFyRmVhdHVyZXMobm9kZSk7XG4gICAgICByZXR1cm4gYW5ndWxhckZpZWxkID8ge3RyaWdnZXI6IGFuZ3VsYXJGaWVsZC5ub2RlLCBkZWNvcmF0b3I6IG51bGwsIG1ldGFkYXRhOiBudWxsfSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWNvcmF0b3IgPSBmaW5kQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3JzLCAnRGlyZWN0aXZlJywgdGhpcy5pc0NvcmUpO1xuICAgICAgcmV0dXJuIGRlY29yYXRvciA/IHt0cmlnZ2VyOiBkZWNvcmF0b3Iubm9kZSwgZGVjb3JhdG9yLCBtZXRhZGF0YTogZGVjb3JhdG9yfSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBhbmFseXplKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogUmVhZG9ubHk8RGVjb3JhdG9yfG51bGw+LCBmbGFncyA9IEhhbmRsZXJGbGFncy5OT05FKTpcbiAgICAgIEFuYWx5c2lzT3V0cHV0PERpcmVjdGl2ZUhhbmRsZXJEYXRhPiB7XG4gICAgLy8gU2tpcCBwcm9jZXNzaW5nIG9mIHRoZSBjbGFzcyBkZWNsYXJhdGlvbiBpZiBjb21waWxhdGlvbiBvZiB1bmRlY29yYXRlZCBjbGFzc2VzXG4gICAgLy8gd2l0aCBBbmd1bGFyIGZlYXR1cmVzIGlzIGRpc2FibGVkLiBQcmV2aW91c2x5IGluIG5ndHNjLCBzdWNoIGNsYXNzZXMgaGF2ZSBhbHdheXNcbiAgICAvLyBiZWVuIHByb2Nlc3NlZCwgYnV0IHdlIHdhbnQgdG8gZW5mb3JjZSBhIGNvbnNpc3RlbnQgZGVjb3JhdG9yIG1lbnRhbCBtb2RlbC5cbiAgICAvLyBTZWU6IGh0dHBzOi8vdjkuYW5ndWxhci5pby9ndWlkZS9taWdyYXRpb24tdW5kZWNvcmF0ZWQtY2xhc3Nlcy5cbiAgICBpZiAodGhpcy5jb21waWxlVW5kZWNvcmF0ZWRDbGFzc2VzV2l0aEFuZ3VsYXJGZWF0dXJlcyA9PT0gZmFsc2UgJiYgZGVjb3JhdG9yID09PSBudWxsKSB7XG4gICAgICByZXR1cm4ge2RpYWdub3N0aWNzOiBbZ2V0VW5kZWNvcmF0ZWRDbGFzc1dpdGhBbmd1bGFyRmVhdHVyZXNEaWFnbm9zdGljKG5vZGUpXX07XG4gICAgfVxuXG4gICAgdGhpcy5wZXJmLmV2ZW50Q291bnQoUGVyZkV2ZW50LkFuYWx5emVEaXJlY3RpdmUpO1xuXG4gICAgY29uc3QgZGlyZWN0aXZlUmVzdWx0ID0gZXh0cmFjdERpcmVjdGl2ZU1ldGFkYXRhKFxuICAgICAgICBub2RlLCBkZWNvcmF0b3IsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvciwgdGhpcy5pc0NvcmUsIGZsYWdzLFxuICAgICAgICB0aGlzLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKTtcbiAgICBpZiAoZGlyZWN0aXZlUmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgY29uc3QgYW5hbHlzaXMgPSBkaXJlY3RpdmVSZXN1bHQubWV0YWRhdGE7XG5cbiAgICBsZXQgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeTogU2V0PFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPj58bnVsbCA9IG51bGw7XG4gICAgaWYgKGRpcmVjdGl2ZVJlc3VsdCAhPT0gdW5kZWZpbmVkICYmIGRpcmVjdGl2ZVJlc3VsdC5kZWNvcmF0b3IuaGFzKCdwcm92aWRlcnMnKSkge1xuICAgICAgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeSA9IHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5KFxuICAgICAgICAgIGRpcmVjdGl2ZVJlc3VsdC5kZWNvcmF0b3IuZ2V0KCdwcm92aWRlcnMnKSEsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuYWx5c2lzOiB7XG4gICAgICAgIGlucHV0czogZGlyZWN0aXZlUmVzdWx0LmlucHV0cyxcbiAgICAgICAgb3V0cHV0czogZGlyZWN0aXZlUmVzdWx0Lm91dHB1dHMsXG4gICAgICAgIG1ldGE6IGFuYWx5c2lzLFxuICAgICAgICBtZXRhZGF0YVN0bXQ6IGdlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGwoXG4gICAgICAgICAgICBub2RlLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUsIHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpLFxuICAgICAgICBiYXNlQ2xhc3M6IHJlYWRCYXNlQ2xhc3Mobm9kZSwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yKSxcbiAgICAgICAgdHlwZUNoZWNrTWV0YTogZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEobm9kZSwgZGlyZWN0aXZlUmVzdWx0LmlucHV0cywgdGhpcy5yZWZsZWN0b3IpLFxuICAgICAgICBwcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LFxuICAgICAgICBpc1BvaXNvbmVkOiBmYWxzZSxcbiAgICAgICAgaXNTdHJ1Y3R1cmFsOiBkaXJlY3RpdmVSZXN1bHQuaXNTdHJ1Y3R1cmFsLFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBzeW1ib2wobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PERpcmVjdGl2ZUhhbmRsZXJEYXRhPik6IERpcmVjdGl2ZVN5bWJvbCB7XG4gICAgY29uc3QgdHlwZVBhcmFtZXRlcnMgPSBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycyhub2RlKTtcblxuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlU3ltYm9sKFxuICAgICAgICBub2RlLCBhbmFseXNpcy5tZXRhLnNlbGVjdG9yLCBhbmFseXNpcy5pbnB1dHMsIGFuYWx5c2lzLm91dHB1dHMsIGFuYWx5c2lzLm1ldGEuZXhwb3J0QXMsXG4gICAgICAgIGFuYWx5c2lzLnR5cGVDaGVja01ldGEsIHR5cGVQYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBSZWFkb25seTxEaXJlY3RpdmVIYW5kbGVyRGF0YT4pOiB2b2lkIHtcbiAgICAvLyBSZWdpc3RlciB0aGlzIGRpcmVjdGl2ZSdzIGluZm9ybWF0aW9uIHdpdGggdGhlIGBNZXRhZGF0YVJlZ2lzdHJ5YC4gVGhpcyBlbnN1cmVzIHRoYXRcbiAgICAvLyB0aGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGRpcmVjdGl2ZSBpcyBhdmFpbGFibGUgZHVyaW5nIHRoZSBjb21waWxlKCkgcGhhc2UuXG4gICAgY29uc3QgcmVmID0gbmV3IFJlZmVyZW5jZShub2RlKTtcbiAgICB0aGlzLm1ldGFSZWdpc3RyeS5yZWdpc3RlckRpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHJlZixcbiAgICAgIG5hbWU6IG5vZGUubmFtZS50ZXh0LFxuICAgICAgc2VsZWN0b3I6IGFuYWx5c2lzLm1ldGEuc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogYW5hbHlzaXMubWV0YS5leHBvcnRBcyxcbiAgICAgIGlucHV0czogYW5hbHlzaXMuaW5wdXRzLFxuICAgICAgb3V0cHV0czogYW5hbHlzaXMub3V0cHV0cyxcbiAgICAgIHF1ZXJpZXM6IGFuYWx5c2lzLm1ldGEucXVlcmllcy5tYXAocXVlcnkgPT4gcXVlcnkucHJvcGVydHlOYW1lKSxcbiAgICAgIGlzQ29tcG9uZW50OiBmYWxzZSxcbiAgICAgIGJhc2VDbGFzczogYW5hbHlzaXMuYmFzZUNsYXNzLFxuICAgICAgLi4uYW5hbHlzaXMudHlwZUNoZWNrTWV0YSxcbiAgICAgIGlzUG9pc29uZWQ6IGFuYWx5c2lzLmlzUG9pc29uZWQsXG4gICAgICBpc1N0cnVjdHVyYWw6IGFuYWx5c2lzLmlzU3RydWN0dXJhbCxcbiAgICB9KTtcblxuICAgIHRoaXMuaW5qZWN0YWJsZVJlZ2lzdHJ5LnJlZ2lzdGVySW5qZWN0YWJsZShub2RlKTtcbiAgfVxuXG4gIHJlc29sdmUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IERpcmVjdGl2ZUhhbmRsZXJEYXRhLCBzeW1ib2w6IERpcmVjdGl2ZVN5bWJvbCk6XG4gICAgICBSZXNvbHZlUmVzdWx0PHVua25vd24+IHtcbiAgICBpZiAodGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlciAhPT0gbnVsbCAmJiBhbmFseXNpcy5iYXNlQ2xhc3MgaW5zdGFuY2VvZiBSZWZlcmVuY2UpIHtcbiAgICAgIHN5bWJvbC5iYXNlQ2xhc3MgPSB0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyLmdldFN5bWJvbChhbmFseXNpcy5iYXNlQ2xhc3Mubm9kZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGlmIChhbmFseXNpcy5wcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5ICE9PSBudWxsICYmXG4gICAgICAgIGFuYWx5c2lzLm1ldGEucHJvdmlkZXJzIGluc3RhbmNlb2YgV3JhcHBlZE5vZGVFeHByKSB7XG4gICAgICBjb25zdCBwcm92aWRlckRpYWdub3N0aWNzID0gZ2V0UHJvdmlkZXJEaWFnbm9zdGljcyhcbiAgICAgICAgICBhbmFseXNpcy5wcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LCBhbmFseXNpcy5tZXRhLnByb3ZpZGVycyEubm9kZSxcbiAgICAgICAgICB0aGlzLmluamVjdGFibGVSZWdpc3RyeSk7XG4gICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnByb3ZpZGVyRGlhZ25vc3RpY3MpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZURpYWdub3N0aWNzID0gZ2V0RGlyZWN0aXZlRGlhZ25vc3RpY3MoXG4gICAgICAgIG5vZGUsIHRoaXMubWV0YVJlYWRlciwgdGhpcy5ldmFsdWF0b3IsIHRoaXMucmVmbGVjdG9yLCB0aGlzLnNjb3BlUmVnaXN0cnksICdEaXJlY3RpdmUnKTtcbiAgICBpZiAoZGlyZWN0aXZlRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4uZGlyZWN0aXZlRGlhZ25vc3RpY3MpO1xuICAgIH1cblxuICAgIHJldHVybiB7ZGlhZ25vc3RpY3M6IGRpYWdub3N0aWNzLmxlbmd0aCA+IDAgPyBkaWFnbm9zdGljcyA6IHVuZGVmaW5lZH07XG4gIH1cblxuICBjb21waWxlRnVsbChcbiAgICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBSZWFkb25seTxEaXJlY3RpdmVIYW5kbGVyRGF0YT4sXG4gICAgICByZXNvbHV0aW9uOiBSZWFkb25seTx1bmtub3duPiwgcG9vbDogQ29uc3RhbnRQb29sKTogQ29tcGlsZVJlc3VsdFtdIHtcbiAgICBjb25zdCBkZWYgPSBjb21waWxlRGlyZWN0aXZlRnJvbU1ldGFkYXRhKGFuYWx5c2lzLm1ldGEsIHBvb2wsIG1ha2VCaW5kaW5nUGFyc2VyKCkpO1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVEaXJlY3RpdmUoYW5hbHlzaXMsIGRlZik7XG4gIH1cblxuICBjb21waWxlUGFydGlhbChcbiAgICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBSZWFkb25seTxEaXJlY3RpdmVIYW5kbGVyRGF0YT4sXG4gICAgICByZXNvbHV0aW9uOiBSZWFkb25seTx1bmtub3duPik6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgY29uc3QgZGVmID0gY29tcGlsZURlY2xhcmVEaXJlY3RpdmVGcm9tTWV0YWRhdGEoYW5hbHlzaXMubWV0YSk7XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZURpcmVjdGl2ZShhbmFseXNpcywgZGVmKTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZURpcmVjdGl2ZShcbiAgICAgIGFuYWx5c2lzOiBSZWFkb25seTxEaXJlY3RpdmVIYW5kbGVyRGF0YT4sXG4gICAgICB7ZXhwcmVzc2lvbjogaW5pdGlhbGl6ZXIsIHR5cGV9OiBSM0RpcmVjdGl2ZURlZik6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVOZ0ZhY3RvcnlEZWZGaWVsZCh7XG4gICAgICAuLi5hbmFseXNpcy5tZXRhLFxuICAgICAgaW5qZWN0Rm46IElkZW50aWZpZXJzLmRpcmVjdGl2ZUluamVjdCxcbiAgICAgIHRhcmdldDogUjNGYWN0b3J5VGFyZ2V0LkRpcmVjdGl2ZSxcbiAgICB9KTtcbiAgICBpZiAoYW5hbHlzaXMubWV0YWRhdGFTdG10ICE9PSBudWxsKSB7XG4gICAgICBmYWN0b3J5UmVzLnN0YXRlbWVudHMucHVzaChhbmFseXNpcy5tZXRhZGF0YVN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgZmFjdG9yeVJlcywge1xuICAgICAgICBuYW1lOiAnybVkaXInLFxuICAgICAgICBpbml0aWFsaXplcixcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICAgIHR5cGUsXG4gICAgICB9XG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSBnaXZlbiBjbGFzcyB1c2VzIEFuZ3VsYXIgZmVhdHVyZXMgYW5kIHJldHVybnMgdGhlIFR5cGVTY3JpcHQgbm9kZVxuICAgKiB0aGF0IGluZGljYXRlZCB0aGUgdXNhZ2UuIENsYXNzZXMgYXJlIGNvbnNpZGVyZWQgdXNpbmcgQW5ndWxhciBmZWF0dXJlcyBpZiB0aGV5XG4gICAqIGNvbnRhaW4gY2xhc3MgbWVtYmVycyB0aGF0IGFyZSBlaXRoZXIgZGVjb3JhdGVkIHdpdGggYSBrbm93biBBbmd1bGFyIGRlY29yYXRvcixcbiAgICogb3IgaWYgdGhleSBjb3JyZXNwb25kIHRvIGEga25vd24gQW5ndWxhciBsaWZlY3ljbGUgaG9vay5cbiAgICovXG4gIHByaXZhdGUgZmluZENsYXNzRmllbGRXaXRoQW5ndWxhckZlYXR1cmVzKG5vZGU6IENsYXNzRGVjbGFyYXRpb24pOiBDbGFzc01lbWJlcnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLnJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhub2RlKS5maW5kKG1lbWJlciA9PiB7XG4gICAgICBpZiAoIW1lbWJlci5pc1N0YXRpYyAmJiBtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLk1ldGhvZCAmJlxuICAgICAgICAgIExJRkVDWUNMRV9IT09LUy5oYXMobWVtYmVyLm5hbWUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKG1lbWJlci5kZWNvcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiBtZW1iZXIuZGVjb3JhdG9ycy5zb21lKFxuICAgICAgICAgICAgZGVjb3JhdG9yID0+IEZJRUxEX0RFQ09SQVRPUlMuc29tZShcbiAgICAgICAgICAgICAgICBkZWNvcmF0b3JOYW1lID0+IGlzQW5ndWxhckRlY29yYXRvcihkZWNvcmF0b3IsIGRlY29yYXRvck5hbWUsIHRoaXMuaXNDb3JlKSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGV4dHJhY3QgbWV0YWRhdGEgZnJvbSBhIGBEaXJlY3RpdmVgIG9yIGBDb21wb25lbnRgLiBgRGlyZWN0aXZlYHMgd2l0aG91dCBhXG4gKiBzZWxlY3RvciBhcmUgYWxsb3dlZCB0byBiZSB1c2VkIGZvciBhYnN0cmFjdCBiYXNlIGNsYXNzZXMuIFRoZXNlIGFic3RyYWN0IGRpcmVjdGl2ZXMgc2hvdWxkIG5vdFxuICogYXBwZWFyIGluIHRoZSBkZWNsYXJhdGlvbnMgb2YgYW4gYE5nTW9kdWxlYCBhbmQgYWRkaXRpb25hbCB2ZXJpZmljYXRpb24gaXMgZG9uZSB3aGVuIHByb2Nlc3NpbmdcbiAqIHRoZSBtb2R1bGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGEoXG4gICAgY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcjogUmVhZG9ubHk8RGVjb3JhdG9yfG51bGw+LCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgIGV2YWx1YXRvcjogUGFydGlhbEV2YWx1YXRvciwgaXNDb3JlOiBib29sZWFuLCBmbGFnczogSGFuZGxlckZsYWdzLFxuICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuLCBkZWZhdWx0U2VsZWN0b3I6IHN0cmluZ3xudWxsID0gbnVsbCk6IHtcbiAgZGVjb3JhdG9yOiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPixcbiAgbWV0YWRhdGE6IFIzRGlyZWN0aXZlTWV0YWRhdGEsXG4gIGlucHV0czogQ2xhc3NQcm9wZXJ0eU1hcHBpbmcsXG4gIG91dHB1dHM6IENsYXNzUHJvcGVydHlNYXBwaW5nLFxuICBpc1N0cnVjdHVyYWw6IGJvb2xlYW47XG59fHVuZGVmaW5lZCB7XG4gIGxldCBkaXJlY3RpdmU6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+O1xuICBpZiAoZGVjb3JhdG9yID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIGRpcmVjdGl2ZSA9IG5ldyBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPigpO1xuICB9IGVsc2UgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUklUWV9XUk9ORywgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWNvcmF0b3IpLFxuICAgICAgICBgSW5jb3JyZWN0IG51bWJlciBvZiBhcmd1bWVudHMgdG8gQCR7ZGVjb3JhdG9yLm5hbWV9IGRlY29yYXRvcmApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1ldGEgPSB1bndyYXBFeHByZXNzaW9uKGRlY29yYXRvci5hcmdzWzBdKTtcbiAgICBpZiAoIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24obWV0YSkpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSR19OT1RfTElURVJBTCwgbWV0YSxcbiAgICAgICAgICBgQCR7ZGVjb3JhdG9yLm5hbWV9IGFyZ3VtZW50IG11c3QgYmUgYW4gb2JqZWN0IGxpdGVyYWxgKTtcbiAgICB9XG4gICAgZGlyZWN0aXZlID0gcmVmbGVjdE9iamVjdExpdGVyYWwobWV0YSk7XG4gIH1cblxuICBpZiAoZGlyZWN0aXZlLmhhcygnaml0JykpIHtcbiAgICAvLyBUaGUgb25seSBhbGxvd2VkIHZhbHVlIGlzIHRydWUsIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byBleHBhbmQgZnVydGhlci5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgbWVtYmVycyA9IHJlZmxlY3Rvci5nZXRNZW1iZXJzT2ZDbGFzcyhjbGF6eik7XG5cbiAgLy8gUHJlY29tcHV0ZSBhIGxpc3Qgb2YgdHMuQ2xhc3NFbGVtZW50cyB0aGF0IGhhdmUgZGVjb3JhdG9ycy4gVGhpcyBpbmNsdWRlcyB0aGluZ3MgbGlrZSBASW5wdXQsXG4gIC8vIEBPdXRwdXQsIEBIb3N0QmluZGluZywgZXRjLlxuICBjb25zdCBkZWNvcmF0ZWRFbGVtZW50cyA9XG4gICAgICBtZW1iZXJzLmZpbHRlcihtZW1iZXIgPT4gIW1lbWJlci5pc1N0YXRpYyAmJiBtZW1iZXIuZGVjb3JhdG9ycyAhPT0gbnVsbCk7XG5cbiAgY29uc3QgY29yZU1vZHVsZSA9IGlzQ29yZSA/IHVuZGVmaW5lZCA6ICdAYW5ndWxhci9jb3JlJztcblxuICAvLyBDb25zdHJ1Y3QgdGhlIG1hcCBvZiBpbnB1dHMgYm90aCBmcm9tIHRoZSBARGlyZWN0aXZlL0BDb21wb25lbnRcbiAgLy8gZGVjb3JhdG9yLCBhbmQgdGhlIGRlY29yYXRlZFxuICAvLyBmaWVsZHMuXG4gIGNvbnN0IGlucHV0c0Zyb21NZXRhID0gcGFyc2VGaWVsZFRvUHJvcGVydHlNYXBwaW5nKGRpcmVjdGl2ZSwgJ2lucHV0cycsIGV2YWx1YXRvcik7XG4gIGNvbnN0IGlucHV0c0Zyb21GaWVsZHMgPSBwYXJzZURlY29yYXRlZEZpZWxkcyhcbiAgICAgIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IoZGVjb3JhdGVkRWxlbWVudHMsICdJbnB1dCcsIGNvcmVNb2R1bGUpLCBldmFsdWF0b3IsXG4gICAgICByZXNvbHZlSW5wdXQpO1xuXG4gIC8vIEFuZCBvdXRwdXRzLlxuICBjb25zdCBvdXRwdXRzRnJvbU1ldGEgPSBwYXJzZUZpZWxkVG9Qcm9wZXJ0eU1hcHBpbmcoZGlyZWN0aXZlLCAnb3V0cHV0cycsIGV2YWx1YXRvcik7XG4gIGNvbnN0IG91dHB1dHNGcm9tRmllbGRzID1cbiAgICAgIHBhcnNlRGVjb3JhdGVkRmllbGRzKFxuICAgICAgICAgIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IoZGVjb3JhdGVkRWxlbWVudHMsICdPdXRwdXQnLCBjb3JlTW9kdWxlKSwgZXZhbHVhdG9yLFxuICAgICAgICAgIHJlc29sdmVPdXRwdXQpIGFzIHtbZmllbGQ6IHN0cmluZ106IHN0cmluZ307XG4gIC8vIENvbnN0cnVjdCB0aGUgbGlzdCBvZiBxdWVyaWVzLlxuICBjb25zdCBjb250ZW50Q2hpbGRGcm9tRmllbGRzID0gcXVlcmllc0Zyb21GaWVsZHMoXG4gICAgICBmaWx0ZXJUb01lbWJlcnNXaXRoRGVjb3JhdG9yKGRlY29yYXRlZEVsZW1lbnRzLCAnQ29udGVudENoaWxkJywgY29yZU1vZHVsZSksIHJlZmxlY3RvcixcbiAgICAgIGV2YWx1YXRvcik7XG4gIGNvbnN0IGNvbnRlbnRDaGlsZHJlbkZyb21GaWVsZHMgPSBxdWVyaWVzRnJvbUZpZWxkcyhcbiAgICAgIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IoZGVjb3JhdGVkRWxlbWVudHMsICdDb250ZW50Q2hpbGRyZW4nLCBjb3JlTW9kdWxlKSwgcmVmbGVjdG9yLFxuICAgICAgZXZhbHVhdG9yKTtcblxuICBjb25zdCBxdWVyaWVzID0gWy4uLmNvbnRlbnRDaGlsZEZyb21GaWVsZHMsIC4uLmNvbnRlbnRDaGlsZHJlbkZyb21GaWVsZHNdO1xuXG4gIC8vIENvbnN0cnVjdCB0aGUgbGlzdCBvZiB2aWV3IHF1ZXJpZXMuXG4gIGNvbnN0IHZpZXdDaGlsZEZyb21GaWVsZHMgPSBxdWVyaWVzRnJvbUZpZWxkcyhcbiAgICAgIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IoZGVjb3JhdGVkRWxlbWVudHMsICdWaWV3Q2hpbGQnLCBjb3JlTW9kdWxlKSwgcmVmbGVjdG9yLFxuICAgICAgZXZhbHVhdG9yKTtcbiAgY29uc3Qgdmlld0NoaWxkcmVuRnJvbUZpZWxkcyA9IHF1ZXJpZXNGcm9tRmllbGRzKFxuICAgICAgZmlsdGVyVG9NZW1iZXJzV2l0aERlY29yYXRvcihkZWNvcmF0ZWRFbGVtZW50cywgJ1ZpZXdDaGlsZHJlbicsIGNvcmVNb2R1bGUpLCByZWZsZWN0b3IsXG4gICAgICBldmFsdWF0b3IpO1xuICBjb25zdCB2aWV3UXVlcmllcyA9IFsuLi52aWV3Q2hpbGRGcm9tRmllbGRzLCAuLi52aWV3Q2hpbGRyZW5Gcm9tRmllbGRzXTtcblxuICBpZiAoZGlyZWN0aXZlLmhhcygncXVlcmllcycpKSB7XG4gICAgY29uc3QgcXVlcmllc0Zyb21EZWNvcmF0b3IgPVxuICAgICAgICBleHRyYWN0UXVlcmllc0Zyb21EZWNvcmF0b3IoZGlyZWN0aXZlLmdldCgncXVlcmllcycpISwgcmVmbGVjdG9yLCBldmFsdWF0b3IsIGlzQ29yZSk7XG4gICAgcXVlcmllcy5wdXNoKC4uLnF1ZXJpZXNGcm9tRGVjb3JhdG9yLmNvbnRlbnQpO1xuICAgIHZpZXdRdWVyaWVzLnB1c2goLi4ucXVlcmllc0Zyb21EZWNvcmF0b3Iudmlldyk7XG4gIH1cblxuICAvLyBQYXJzZSB0aGUgc2VsZWN0b3IuXG4gIGxldCBzZWxlY3RvciA9IGRlZmF1bHRTZWxlY3RvcjtcbiAgaWYgKGRpcmVjdGl2ZS5oYXMoJ3NlbGVjdG9yJykpIHtcbiAgICBjb25zdCBleHByID0gZGlyZWN0aXZlLmdldCgnc2VsZWN0b3InKSE7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBldmFsdWF0b3IuZXZhbHVhdGUoZXhwcik7XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoZXhwciwgcmVzb2x2ZWQsIGBzZWxlY3RvciBtdXN0IGJlIGEgc3RyaW5nYCk7XG4gICAgfVxuICAgIC8vIHVzZSBkZWZhdWx0IHNlbGVjdG9yIGluIGNhc2Ugc2VsZWN0b3IgaXMgYW4gZW1wdHkgc3RyaW5nXG4gICAgc2VsZWN0b3IgPSByZXNvbHZlZCA9PT0gJycgPyBkZWZhdWx0U2VsZWN0b3IgOiByZXNvbHZlZDtcbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRJUkVDVElWRV9NSVNTSU5HX1NFTEVDVE9SLCBleHByLFxuICAgICAgICAgIGBEaXJlY3RpdmUgJHtjbGF6ei5uYW1lLnRleHR9IGhhcyBubyBzZWxlY3RvciwgcGxlYXNlIGFkZCBpdCFgKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBob3N0ID0gZXh0cmFjdEhvc3RCaW5kaW5ncyhkZWNvcmF0ZWRFbGVtZW50cywgZXZhbHVhdG9yLCBjb3JlTW9kdWxlLCBkaXJlY3RpdmUpO1xuXG4gIGNvbnN0IHByb3ZpZGVyczogRXhwcmVzc2lvbnxudWxsID0gZGlyZWN0aXZlLmhhcygncHJvdmlkZXJzJykgP1xuICAgICAgbmV3IFdyYXBwZWROb2RlRXhwcihcbiAgICAgICAgICBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciA/XG4gICAgICAgICAgICAgIHdyYXBGdW5jdGlvbkV4cHJlc3Npb25zSW5QYXJlbnMoZGlyZWN0aXZlLmdldCgncHJvdmlkZXJzJykhKSA6XG4gICAgICAgICAgICAgIGRpcmVjdGl2ZS5nZXQoJ3Byb3ZpZGVycycpISkgOlxuICAgICAgbnVsbDtcblxuICAvLyBEZXRlcm1pbmUgaWYgYG5nT25DaGFuZ2VzYCBpcyBhIGxpZmVjeWNsZSBob29rIGRlZmluZWQgb24gdGhlIGNvbXBvbmVudC5cbiAgY29uc3QgdXNlc09uQ2hhbmdlcyA9IG1lbWJlcnMuc29tZShcbiAgICAgIG1lbWJlciA9PiAhbWVtYmVyLmlzU3RhdGljICYmIG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuTWV0aG9kICYmXG4gICAgICAgICAgbWVtYmVyLm5hbWUgPT09ICduZ09uQ2hhbmdlcycpO1xuXG4gIC8vIFBhcnNlIGV4cG9ydEFzLlxuICBsZXQgZXhwb3J0QXM6IHN0cmluZ1tdfG51bGwgPSBudWxsO1xuICBpZiAoZGlyZWN0aXZlLmhhcygnZXhwb3J0QXMnKSkge1xuICAgIGNvbnN0IGV4cHIgPSBkaXJlY3RpdmUuZ2V0KCdleHBvcnRBcycpITtcbiAgICBjb25zdCByZXNvbHZlZCA9IGV2YWx1YXRvci5ldmFsdWF0ZShleHByKTtcbiAgICBpZiAodHlwZW9mIHJlc29sdmVkICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihleHByLCByZXNvbHZlZCwgYGV4cG9ydEFzIG11c3QgYmUgYSBzdHJpbmdgKTtcbiAgICB9XG4gICAgZXhwb3J0QXMgPSByZXNvbHZlZC5zcGxpdCgnLCcpLm1hcChwYXJ0ID0+IHBhcnQudHJpbSgpKTtcbiAgfVxuXG4gIGNvbnN0IHJhd0N0b3JEZXBzID0gZ2V0Q29uc3RydWN0b3JEZXBlbmRlbmNpZXMoY2xhenosIHJlZmxlY3RvciwgaXNDb3JlKTtcbiAgbGV0IGN0b3JEZXBzOiBSM0RlcGVuZGVuY3lNZXRhZGF0YVtdfCdpbnZhbGlkJ3xudWxsO1xuXG4gIC8vIE5vbi1hYnN0cmFjdCBkaXJlY3RpdmVzICh0aG9zZSB3aXRoIGEgc2VsZWN0b3IpIHJlcXVpcmUgdmFsaWQgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzLCB3aGVyZWFzXG4gIC8vIGFic3RyYWN0IGRpcmVjdGl2ZXMgYXJlIGFsbG93ZWQgdG8gaGF2ZSBpbnZhbGlkIGRlcGVuZGVuY2llcywgZ2l2ZW4gdGhhdCBhIHN1YmNsYXNzIG1heSBjYWxsXG4gIC8vIHRoZSBjb25zdHJ1Y3RvciBleHBsaWNpdGx5LlxuICBpZiAoc2VsZWN0b3IgIT09IG51bGwpIHtcbiAgICBjdG9yRGVwcyA9IHZhbGlkYXRlQ29uc3RydWN0b3JEZXBlbmRlbmNpZXMoY2xhenosIHJhd0N0b3JEZXBzKTtcbiAgfSBlbHNlIHtcbiAgICBjdG9yRGVwcyA9IHVud3JhcENvbnN0cnVjdG9yRGVwZW5kZW5jaWVzKHJhd0N0b3JEZXBzKTtcbiAgfVxuXG4gIGNvbnN0IGlzU3RydWN0dXJhbCA9IGN0b3JEZXBzICE9PSBudWxsICYmIGN0b3JEZXBzICE9PSAnaW52YWxpZCcgJiYgY3RvckRlcHMuc29tZShkZXAgPT4ge1xuICAgIGlmIChkZXAucmVzb2x2ZWQgIT09IFIzUmVzb2x2ZWREZXBlbmRlbmN5VHlwZS5Ub2tlbiB8fCAhKGRlcC50b2tlbiBpbnN0YW5jZW9mIEV4dGVybmFsRXhwcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGRlcC50b2tlbi52YWx1ZS5tb2R1bGVOYW1lICE9PSAnQGFuZ3VsYXIvY29yZScgfHwgZGVwLnRva2VuLnZhbHVlLm5hbWUgIT09ICdUZW1wbGF0ZVJlZicpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG5cbiAgLy8gRGV0ZWN0IGlmIHRoZSBjb21wb25lbnQgaW5oZXJpdHMgZnJvbSBhbm90aGVyIGNsYXNzXG4gIGNvbnN0IHVzZXNJbmhlcml0YW5jZSA9IHJlZmxlY3Rvci5oYXNCYXNlQ2xhc3MoY2xhenopO1xuICBjb25zdCB0eXBlID0gd3JhcFR5cGVSZWZlcmVuY2UocmVmbGVjdG9yLCBjbGF6eik7XG4gIGNvbnN0IGludGVybmFsVHlwZSA9IG5ldyBXcmFwcGVkTm9kZUV4cHIocmVmbGVjdG9yLmdldEludGVybmFsTmFtZU9mQ2xhc3MoY2xhenopKTtcblxuICBjb25zdCBpbnB1dHMgPSBDbGFzc1Byb3BlcnR5TWFwcGluZy5mcm9tTWFwcGVkT2JqZWN0KHsuLi5pbnB1dHNGcm9tTWV0YSwgLi4uaW5wdXRzRnJvbUZpZWxkc30pO1xuICBjb25zdCBvdXRwdXRzID0gQ2xhc3NQcm9wZXJ0eU1hcHBpbmcuZnJvbU1hcHBlZE9iamVjdCh7Li4ub3V0cHV0c0Zyb21NZXRhLCAuLi5vdXRwdXRzRnJvbUZpZWxkc30pO1xuXG4gIGNvbnN0IG1ldGFkYXRhOiBSM0RpcmVjdGl2ZU1ldGFkYXRhID0ge1xuICAgIG5hbWU6IGNsYXp6Lm5hbWUudGV4dCxcbiAgICBkZXBzOiBjdG9yRGVwcyxcbiAgICBob3N0LFxuICAgIGxpZmVjeWNsZToge1xuICAgICAgdXNlc09uQ2hhbmdlcyxcbiAgICB9LFxuICAgIGlucHV0czogaW5wdXRzLnRvSm9pbnRNYXBwZWRPYmplY3QoKSxcbiAgICBvdXRwdXRzOiBvdXRwdXRzLnRvRGlyZWN0TWFwcGVkT2JqZWN0KCksXG4gICAgcXVlcmllcyxcbiAgICB2aWV3UXVlcmllcyxcbiAgICBzZWxlY3RvcixcbiAgICBmdWxsSW5oZXJpdGFuY2U6ICEhKGZsYWdzICYgSGFuZGxlckZsYWdzLkZVTExfSU5IRVJJVEFOQ0UpLFxuICAgIHR5cGUsXG4gICAgaW50ZXJuYWxUeXBlLFxuICAgIHR5cGVBcmd1bWVudENvdW50OiByZWZsZWN0b3IuZ2V0R2VuZXJpY0FyaXR5T2ZDbGFzcyhjbGF6eikgfHwgMCxcbiAgICB0eXBlU291cmNlU3BhbjogY3JlYXRlU291cmNlU3BhbihjbGF6ei5uYW1lKSxcbiAgICB1c2VzSW5oZXJpdGFuY2UsXG4gICAgZXhwb3J0QXMsXG4gICAgcHJvdmlkZXJzXG4gIH07XG4gIHJldHVybiB7XG4gICAgZGVjb3JhdG9yOiBkaXJlY3RpdmUsXG4gICAgbWV0YWRhdGEsXG4gICAgaW5wdXRzLFxuICAgIG91dHB1dHMsXG4gICAgaXNTdHJ1Y3R1cmFsLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFF1ZXJ5TWV0YWRhdGEoXG4gICAgZXhwck5vZGU6IHRzLk5vZGUsIG5hbWU6IHN0cmluZywgYXJnczogUmVhZG9ubHlBcnJheTx0cy5FeHByZXNzaW9uPiwgcHJvcGVydHlOYW1lOiBzdHJpbmcsXG4gICAgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKTogUjNRdWVyeU1ldGFkYXRhIHtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBleHByTm9kZSwgYEAke25hbWV9IG11c3QgaGF2ZSBhcmd1bWVudHNgKTtcbiAgfVxuICBjb25zdCBmaXJzdCA9IG5hbWUgPT09ICdWaWV3Q2hpbGQnIHx8IG5hbWUgPT09ICdDb250ZW50Q2hpbGQnO1xuICBjb25zdCBub2RlID0gdW53cmFwRm9yd2FyZFJlZihhcmdzWzBdLCByZWZsZWN0b3IpO1xuICBjb25zdCBhcmcgPSBldmFsdWF0b3IuZXZhbHVhdGUobm9kZSk7XG5cbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRoaXMgcXVlcnkgc2hvdWxkIGNvbGxlY3Qgb25seSBzdGF0aWMgcmVzdWx0cyAoc2VlIHZpZXcvYXBpLnRzKSAgKi9cbiAgbGV0IGlzU3RhdGljOiBib29sZWFuID0gZmFsc2U7XG5cbiAgLy8gRXh0cmFjdCB0aGUgcHJlZGljYXRlXG4gIGxldCBwcmVkaWNhdGU6IEV4cHJlc3Npb258c3RyaW5nW118bnVsbCA9IG51bGw7XG4gIGlmIChhcmcgaW5zdGFuY2VvZiBSZWZlcmVuY2UgfHwgYXJnIGluc3RhbmNlb2YgRHluYW1pY1ZhbHVlKSB7XG4gICAgLy8gUmVmZXJlbmNlcyBhbmQgcHJlZGljYXRlcyB0aGF0IGNvdWxkIG5vdCBiZSBldmFsdWF0ZWQgc3RhdGljYWxseSBhcmUgZW1pdHRlZCBhcyBpcy5cbiAgICBwcmVkaWNhdGUgPSBuZXcgV3JhcHBlZE5vZGVFeHByKG5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgcHJlZGljYXRlID0gW2FyZ107XG4gIH0gZWxzZSBpZiAoaXNTdHJpbmdBcnJheU9yRGllKGFyZywgYEAke25hbWV9IHByZWRpY2F0ZWAsIG5vZGUpKSB7XG4gICAgcHJlZGljYXRlID0gYXJnO1xuICB9IGVsc2Uge1xuICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3Iobm9kZSwgYXJnLCBgQCR7bmFtZX0gcHJlZGljYXRlIGNhbm5vdCBiZSBpbnRlcnByZXRlZGApO1xuICB9XG5cbiAgLy8gRXh0cmFjdCB0aGUgcmVhZCBhbmQgZGVzY2VuZGFudHMgb3B0aW9ucy5cbiAgbGV0IHJlYWQ6IEV4cHJlc3Npb258bnVsbCA9IG51bGw7XG4gIC8vIFRoZSBkZWZhdWx0IHZhbHVlIGZvciBkZXNjZW5kYW50cyBpcyB0cnVlIGZvciBldmVyeSBkZWNvcmF0b3IgZXhjZXB0IEBDb250ZW50Q2hpbGRyZW4uXG4gIGxldCBkZXNjZW5kYW50czogYm9vbGVhbiA9IG5hbWUgIT09ICdDb250ZW50Q2hpbGRyZW4nO1xuICBsZXQgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHk6IGJvb2xlYW4gPSBlbWl0RGlzdGluY3RDaGFuZ2VzT25seURlZmF1bHRWYWx1ZTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgY29uc3Qgb3B0aW9uc0V4cHIgPSB1bndyYXBFeHByZXNzaW9uKGFyZ3NbMV0pO1xuICAgIGlmICghdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihvcHRpb25zRXhwcikpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSR19OT1RfTElURVJBTCwgb3B0aW9uc0V4cHIsXG4gICAgICAgICAgYEAke25hbWV9IG9wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QgbGl0ZXJhbGApO1xuICAgIH1cbiAgICBjb25zdCBvcHRpb25zID0gcmVmbGVjdE9iamVjdExpdGVyYWwob3B0aW9uc0V4cHIpO1xuICAgIGlmIChvcHRpb25zLmhhcygncmVhZCcpKSB7XG4gICAgICByZWFkID0gbmV3IFdyYXBwZWROb2RlRXhwcihvcHRpb25zLmdldCgncmVhZCcpISk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuaGFzKCdkZXNjZW5kYW50cycpKSB7XG4gICAgICBjb25zdCBkZXNjZW5kYW50c0V4cHIgPSBvcHRpb25zLmdldCgnZGVzY2VuZGFudHMnKSE7XG4gICAgICBjb25zdCBkZXNjZW5kYW50c1ZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlKGRlc2NlbmRhbnRzRXhwcik7XG4gICAgICBpZiAodHlwZW9mIGRlc2NlbmRhbnRzVmFsdWUgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgZGVzY2VuZGFudHNFeHByLCBkZXNjZW5kYW50c1ZhbHVlLCBgQCR7bmFtZX0gb3B0aW9ucy5kZXNjZW5kYW50cyBtdXN0IGJlIGEgYm9vbGVhbmApO1xuICAgICAgfVxuICAgICAgZGVzY2VuZGFudHMgPSBkZXNjZW5kYW50c1ZhbHVlO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmhhcygnZW1pdERpc3RpbmN0Q2hhbmdlc09ubHknKSkge1xuICAgICAgY29uc3QgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHlFeHByID0gb3B0aW9ucy5nZXQoJ2VtaXREaXN0aW5jdENoYW5nZXNPbmx5JykhO1xuICAgICAgY29uc3QgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHlWYWx1ZSA9IGV2YWx1YXRvci5ldmFsdWF0ZShlbWl0RGlzdGluY3RDaGFuZ2VzT25seUV4cHIpO1xuICAgICAgaWYgKHR5cGVvZiBlbWl0RGlzdGluY3RDaGFuZ2VzT25seVZhbHVlICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5RXhwciwgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHlWYWx1ZSxcbiAgICAgICAgICAgIGBAJHtuYW1lfSBvcHRpb25zLmVtaXREaXN0aW5jdENoYW5nZXNPbmx5cyBtdXN0IGJlIGEgYm9vbGVhbmApO1xuICAgICAgfVxuICAgICAgZW1pdERpc3RpbmN0Q2hhbmdlc09ubHkgPSBlbWl0RGlzdGluY3RDaGFuZ2VzT25seVZhbHVlO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmhhcygnc3RhdGljJykpIHtcbiAgICAgIGNvbnN0IHN0YXRpY1ZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlKG9wdGlvbnMuZ2V0KCdzdGF0aWMnKSEpO1xuICAgICAgaWYgKHR5cGVvZiBzdGF0aWNWYWx1ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICBub2RlLCBzdGF0aWNWYWx1ZSwgYEAke25hbWV9IG9wdGlvbnMuc3RhdGljIG11c3QgYmUgYSBib29sZWFuYCk7XG4gICAgICB9XG4gICAgICBpc1N0YXRpYyA9IHN0YXRpY1ZhbHVlO1xuICAgIH1cblxuICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID4gMikge1xuICAgIC8vIFRvbyBtYW55IGFyZ3VtZW50cy5cbiAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJJVFlfV1JPTkcsIG5vZGUsIGBAJHtuYW1lfSBoYXMgdG9vIG1hbnkgYXJndW1lbnRzYCk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHByb3BlcnR5TmFtZSxcbiAgICBwcmVkaWNhdGUsXG4gICAgZmlyc3QsXG4gICAgZGVzY2VuZGFudHMsXG4gICAgcmVhZCxcbiAgICBzdGF0aWM6IGlzU3RhdGljLFxuICAgIGVtaXREaXN0aW5jdENoYW5nZXNPbmx5LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdFF1ZXJpZXNGcm9tRGVjb3JhdG9yKFxuICAgIHF1ZXJ5RGF0YTogdHMuRXhwcmVzc2lvbiwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLFxuICAgIGlzQ29yZTogYm9vbGVhbik6IHtcbiAgY29udGVudDogUjNRdWVyeU1ldGFkYXRhW10sXG4gIHZpZXc6IFIzUXVlcnlNZXRhZGF0YVtdLFxufSB7XG4gIGNvbnN0IGNvbnRlbnQ6IFIzUXVlcnlNZXRhZGF0YVtdID0gW10sIHZpZXc6IFIzUXVlcnlNZXRhZGF0YVtdID0gW107XG4gIGlmICghdHMuaXNPYmplY3RMaXRlcmFsRXhwcmVzc2lvbihxdWVyeURhdGEpKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIHF1ZXJ5RGF0YSxcbiAgICAgICAgJ0RlY29yYXRvciBxdWVyaWVzIG1ldGFkYXRhIG11c3QgYmUgYW4gb2JqZWN0IGxpdGVyYWwnKTtcbiAgfVxuICByZWZsZWN0T2JqZWN0TGl0ZXJhbChxdWVyeURhdGEpLmZvckVhY2goKHF1ZXJ5RXhwciwgcHJvcGVydHlOYW1lKSA9PiB7XG4gICAgcXVlcnlFeHByID0gdW53cmFwRXhwcmVzc2lvbihxdWVyeUV4cHIpO1xuICAgIGlmICghdHMuaXNOZXdFeHByZXNzaW9uKHF1ZXJ5RXhwcikpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIHF1ZXJ5RGF0YSxcbiAgICAgICAgICAnRGVjb3JhdG9yIHF1ZXJ5IG1ldGFkYXRhIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYSBxdWVyeSB0eXBlJyk7XG4gICAgfVxuICAgIGNvbnN0IHF1ZXJ5VHlwZSA9IHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKHF1ZXJ5RXhwci5leHByZXNzaW9uKSA/XG4gICAgICAgIHF1ZXJ5RXhwci5leHByZXNzaW9uLm5hbWUgOlxuICAgICAgICBxdWVyeUV4cHIuZXhwcmVzc2lvbjtcbiAgICBpZiAoIXRzLmlzSWRlbnRpZmllcihxdWVyeVR5cGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLlZBTFVFX0hBU19XUk9OR19UWVBFLCBxdWVyeURhdGEsXG4gICAgICAgICAgJ0RlY29yYXRvciBxdWVyeSBtZXRhZGF0YSBtdXN0IGJlIGFuIGluc3RhbmNlIG9mIGEgcXVlcnkgdHlwZScpO1xuICAgIH1cbiAgICBjb25zdCB0eXBlID0gcmVmbGVjdG9yLmdldEltcG9ydE9mSWRlbnRpZmllcihxdWVyeVR5cGUpO1xuICAgIGlmICh0eXBlID09PSBudWxsIHx8ICghaXNDb3JlICYmIHR5cGUuZnJvbSAhPT0gJ0Bhbmd1bGFyL2NvcmUnKSB8fFxuICAgICAgICAhUVVFUllfVFlQRVMuaGFzKHR5cGUubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICBFcnJvckNvZGUuVkFMVUVfSEFTX1dST05HX1RZUEUsIHF1ZXJ5RGF0YSxcbiAgICAgICAgICAnRGVjb3JhdG9yIHF1ZXJ5IG1ldGFkYXRhIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYSBxdWVyeSB0eXBlJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcXVlcnkgPSBleHRyYWN0UXVlcnlNZXRhZGF0YShcbiAgICAgICAgcXVlcnlFeHByLCB0eXBlLm5hbWUsIHF1ZXJ5RXhwci5hcmd1bWVudHMgfHwgW10sIHByb3BlcnR5TmFtZSwgcmVmbGVjdG9yLCBldmFsdWF0b3IpO1xuICAgIGlmICh0eXBlLm5hbWUuc3RhcnRzV2l0aCgnQ29udGVudCcpKSB7XG4gICAgICBjb250ZW50LnB1c2gocXVlcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2aWV3LnB1c2gocXVlcnkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7Y29udGVudCwgdmlld307XG59XG5cbmZ1bmN0aW9uIGlzU3RyaW5nQXJyYXlPckRpZSh2YWx1ZTogYW55LCBuYW1lOiBzdHJpbmcsIG5vZGU6IHRzLkV4cHJlc3Npb24pOiB2YWx1ZSBpcyBzdHJpbmdbXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZVtpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgbm9kZSwgdmFsdWVbaV0sIGBGYWlsZWQgdG8gcmVzb2x2ZSAke25hbWV9IGF0IHBvc2l0aW9uICR7aX0gdG8gYSBzdHJpbmdgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZpZWxkQXJyYXlWYWx1ZShcbiAgICBkaXJlY3RpdmU6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+LCBmaWVsZDogc3RyaW5nLCBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IpOiBudWxsfFxuICAgIHN0cmluZ1tdIHtcbiAgaWYgKCFkaXJlY3RpdmUuaGFzKGZpZWxkKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gUmVzb2x2ZSB0aGUgZmllbGQgb2YgaW50ZXJlc3QgZnJvbSB0aGUgZGlyZWN0aXZlIG1ldGFkYXRhIHRvIGEgc3RyaW5nW10uXG4gIGNvbnN0IGV4cHJlc3Npb24gPSBkaXJlY3RpdmUuZ2V0KGZpZWxkKSE7XG4gIGNvbnN0IHZhbHVlID0gZXZhbHVhdG9yLmV2YWx1YXRlKGV4cHJlc3Npb24pO1xuICBpZiAoIWlzU3RyaW5nQXJyYXlPckRpZSh2YWx1ZSwgZmllbGQsIGV4cHJlc3Npb24pKSB7XG4gICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgZXhwcmVzc2lvbiwgdmFsdWUsIGBGYWlsZWQgdG8gcmVzb2x2ZSBARGlyZWN0aXZlLiR7ZmllbGR9IHRvIGEgc3RyaW5nIGFycmF5YCk7XG4gIH1cblxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogSW50ZXJwcmV0IHByb3BlcnR5IG1hcHBpbmcgZmllbGRzIG9uIHRoZSBkZWNvcmF0b3IgKGUuZy4gaW5wdXRzIG9yIG91dHB1dHMpIGFuZCByZXR1cm4gdGhlXG4gKiBjb3JyZWN0bHkgc2hhcGVkIG1ldGFkYXRhIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VGaWVsZFRvUHJvcGVydHlNYXBwaW5nKFxuICAgIGRpcmVjdGl2ZTogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGZpZWxkOiBzdHJpbmcsXG4gICAgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKToge1tmaWVsZDogc3RyaW5nXTogc3RyaW5nfSB7XG4gIGNvbnN0IG1ldGFWYWx1ZXMgPSBwYXJzZUZpZWxkQXJyYXlWYWx1ZShkaXJlY3RpdmUsIGZpZWxkLCBldmFsdWF0b3IpO1xuICBpZiAoIW1ldGFWYWx1ZXMpIHtcbiAgICByZXR1cm4gRU1QVFlfT0JKRUNUO1xuICB9XG5cbiAgcmV0dXJuIG1ldGFWYWx1ZXMucmVkdWNlKChyZXN1bHRzLCB2YWx1ZSkgPT4ge1xuICAgIC8vIEVpdGhlciB0aGUgdmFsdWUgaXMgJ2ZpZWxkJyBvciAnZmllbGQ6IHByb3BlcnR5Jy4gSW4gdGhlIGZpcnN0IGNhc2UsIGBwcm9wZXJ0eWAgd2lsbFxuICAgIC8vIGJlIHVuZGVmaW5lZCwgaW4gd2hpY2ggY2FzZSB0aGUgZmllbGQgbmFtZSBzaG91bGQgYWxzbyBiZSB1c2VkIGFzIHRoZSBwcm9wZXJ0eSBuYW1lLlxuICAgIGNvbnN0IFtmaWVsZCwgcHJvcGVydHldID0gdmFsdWUuc3BsaXQoJzonLCAyKS5tYXAoc3RyID0+IHN0ci50cmltKCkpO1xuICAgIHJlc3VsdHNbZmllbGRdID0gcHJvcGVydHkgfHwgZmllbGQ7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0sIHt9IGFzIHtbZmllbGQ6IHN0cmluZ106IHN0cmluZ30pO1xufVxuXG4vKipcbiAqIFBhcnNlIHByb3BlcnR5IGRlY29yYXRvcnMgKGUuZy4gYElucHV0YCBvciBgT3V0cHV0YCkgYW5kIHJldHVybiB0aGUgY29ycmVjdGx5IHNoYXBlZCBtZXRhZGF0YVxuICogb2JqZWN0LlxuICovXG5mdW5jdGlvbiBwYXJzZURlY29yYXRlZEZpZWxkcyhcbiAgICBmaWVsZHM6IHttZW1iZXI6IENsYXNzTWVtYmVyLCBkZWNvcmF0b3JzOiBEZWNvcmF0b3JbXX1bXSwgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLFxuICAgIG1hcFZhbHVlUmVzb2x2ZXI6IChwdWJsaWNOYW1lOiBzdHJpbmcsIGludGVybmFsTmFtZTogc3RyaW5nKSA9PlxuICAgICAgICBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddKToge1tmaWVsZDogc3RyaW5nXTogc3RyaW5nfFtzdHJpbmcsIHN0cmluZ119IHtcbiAgcmV0dXJuIGZpZWxkcy5yZWR1Y2UoKHJlc3VsdHMsIGZpZWxkKSA9PiB7XG4gICAgY29uc3QgZmllbGROYW1lID0gZmllbGQubWVtYmVyLm5hbWU7XG4gICAgZmllbGQuZGVjb3JhdG9ycy5mb3JFYWNoKGRlY29yYXRvciA9PiB7XG4gICAgICAvLyBUaGUgZGVjb3JhdG9yIGVpdGhlciBkb2Vzbid0IGhhdmUgYW4gYXJndW1lbnQgKEBJbnB1dCgpKSBpbiB3aGljaCBjYXNlIHRoZSBwcm9wZXJ0eVxuICAgICAgLy8gbmFtZSBpcyB1c2VkLCBvciBpdCBoYXMgb25lIGFyZ3VtZW50IChAT3V0cHV0KCduYW1lZCcpKS5cbiAgICAgIGlmIChkZWNvcmF0b3IuYXJncyA9PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXN1bHRzW2ZpZWxkTmFtZV0gPSBmaWVsZE5hbWU7XG4gICAgICB9IGVsc2UgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IGV2YWx1YXRvci5ldmFsdWF0ZShkZWNvcmF0b3IuYXJnc1swXSk7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICAgICAgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWNvcmF0b3IpLCBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgYEAke2RlY29yYXRvci5uYW1lfSBkZWNvcmF0b3IgYXJndW1lbnQgbXVzdCByZXNvbHZlIHRvIGEgc3RyaW5nYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0c1tmaWVsZE5hbWVdID0gbWFwVmFsdWVSZXNvbHZlcihwcm9wZXJ0eSwgZmllbGROYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRvbyBtYW55IGFyZ3VtZW50cy5cbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUklUWV9XUk9ORywgRGVjb3JhdG9yLm5vZGVGb3JFcnJvcihkZWNvcmF0b3IpLFxuICAgICAgICAgICAgYEAke2RlY29yYXRvci5uYW1lfSBjYW4gaGF2ZSBhdCBtb3N0IG9uZSBhcmd1bWVudCwgZ290ICR7XG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yLmFyZ3MubGVuZ3RofSBhcmd1bWVudChzKWApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9LCB7fSBhcyB7W2ZpZWxkOiBzdHJpbmddOiBzdHJpbmcgfCBbc3RyaW5nLCBzdHJpbmddfSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbnB1dChwdWJsaWNOYW1lOiBzdHJpbmcsIGludGVybmFsTmFtZTogc3RyaW5nKTogW3N0cmluZywgc3RyaW5nXSB7XG4gIHJldHVybiBbcHVibGljTmFtZSwgaW50ZXJuYWxOYW1lXTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU91dHB1dChwdWJsaWNOYW1lOiBzdHJpbmcsIGludGVybmFsTmFtZTogc3RyaW5nKSB7XG4gIHJldHVybiBwdWJsaWNOYW1lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcXVlcmllc0Zyb21GaWVsZHMoXG4gICAgZmllbGRzOiB7bWVtYmVyOiBDbGFzc01lbWJlciwgZGVjb3JhdG9yczogRGVjb3JhdG9yW119W10sIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKTogUjNRdWVyeU1ldGFkYXRhW10ge1xuICByZXR1cm4gZmllbGRzLm1hcCgoe21lbWJlciwgZGVjb3JhdG9yc30pID0+IHtcbiAgICBjb25zdCBkZWNvcmF0b3IgPSBkZWNvcmF0b3JzWzBdO1xuICAgIGNvbnN0IG5vZGUgPSBtZW1iZXIubm9kZSB8fCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvcik7XG5cbiAgICAvLyBUaHJvdyBpbiBjYXNlIG9mIGBASW5wdXQoKSBAQ29udGVudENoaWxkKCdmb28nKSBmb286IGFueWAsIHdoaWNoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gSXZ5XG4gICAgaWYgKG1lbWJlci5kZWNvcmF0b3JzIS5zb21lKHYgPT4gdi5uYW1lID09PSAnSW5wdXQnKSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQ09MTElTSU9OLCBub2RlLFxuICAgICAgICAgICdDYW5ub3QgY29tYmluZSBASW5wdXQgZGVjb3JhdG9ycyB3aXRoIHF1ZXJ5IGRlY29yYXRvcnMnKTtcbiAgICB9XG4gICAgaWYgKGRlY29yYXRvcnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9DT0xMSVNJT04sIG5vZGUsXG4gICAgICAgICAgJ0Nhbm5vdCBoYXZlIG11bHRpcGxlIHF1ZXJ5IGRlY29yYXRvcnMgb24gdGhlIHNhbWUgY2xhc3MgbWVtYmVyJyk7XG4gICAgfSBlbHNlIGlmICghaXNQcm9wZXJ0eVR5cGVNZW1iZXIobWVtYmVyKSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfVU5FWFBFQ1RFRCwgbm9kZSxcbiAgICAgICAgICAnUXVlcnkgZGVjb3JhdG9yIG11c3QgZ28gb24gYSBwcm9wZXJ0eS10eXBlIG1lbWJlcicpO1xuICAgIH1cbiAgICByZXR1cm4gZXh0cmFjdFF1ZXJ5TWV0YWRhdGEoXG4gICAgICAgIG5vZGUsIGRlY29yYXRvci5uYW1lLCBkZWNvcmF0b3IuYXJncyB8fCBbXSwgbWVtYmVyLm5hbWUsIHJlZmxlY3RvciwgZXZhbHVhdG9yKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGlzUHJvcGVydHlUeXBlTWVtYmVyKG1lbWJlcjogQ2xhc3NNZW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuR2V0dGVyIHx8IG1lbWJlci5raW5kID09PSBDbGFzc01lbWJlcktpbmQuU2V0dGVyIHx8XG4gICAgICBtZW1iZXIua2luZCA9PT0gQ2xhc3NNZW1iZXJLaW5kLlByb3BlcnR5O1xufVxuXG50eXBlIFN0cmluZ01hcDxUPiA9IHtcbiAgW2tleTogc3RyaW5nXTogVDtcbn07XG5cbmZ1bmN0aW9uIGV2YWx1YXRlSG9zdEV4cHJlc3Npb25CaW5kaW5ncyhcbiAgICBob3N0RXhwcjogdHMuRXhwcmVzc2lvbiwgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yKTogUGFyc2VkSG9zdEJpbmRpbmdzIHtcbiAgY29uc3QgaG9zdE1ldGFNYXAgPSBldmFsdWF0b3IuZXZhbHVhdGUoaG9zdEV4cHIpO1xuICBpZiAoIShob3N0TWV0YU1hcCBpbnN0YW5jZW9mIE1hcCkpIHtcbiAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICBob3N0RXhwciwgaG9zdE1ldGFNYXAsIGBEZWNvcmF0b3IgaG9zdCBtZXRhZGF0YSBtdXN0IGJlIGFuIG9iamVjdGApO1xuICB9XG4gIGNvbnN0IGhvc3RNZXRhZGF0YTogU3RyaW5nTWFwPHN0cmluZ3xFeHByZXNzaW9uPiA9IHt9O1xuICBob3N0TWV0YU1hcC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgLy8gUmVzb2x2ZSBFbnVtIHJlZmVyZW5jZXMgdG8gdGhlaXIgZGVjbGFyZWQgdmFsdWUuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRW51bVZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnJlc29sdmVkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Yga2V5ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICBob3N0RXhwciwga2V5LFxuICAgICAgICAgIGBEZWNvcmF0b3IgaG9zdCBtZXRhZGF0YSBtdXN0IGJlIGEgc3RyaW5nIC0+IHN0cmluZyBvYmplY3QsIGJ1dCBmb3VuZCB1bnBhcnNlYWJsZSBrZXlgKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09ICdzdHJpbmcnKSB7XG4gICAgICBob3N0TWV0YWRhdGFba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEeW5hbWljVmFsdWUpIHtcbiAgICAgIGhvc3RNZXRhZGF0YVtrZXldID0gbmV3IFdyYXBwZWROb2RlRXhwcih2YWx1ZS5ub2RlIGFzIHRzLkV4cHJlc3Npb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgIGhvc3RFeHByLCB2YWx1ZSxcbiAgICAgICAgICBgRGVjb3JhdG9yIGhvc3QgbWV0YWRhdGEgbXVzdCBiZSBhIHN0cmluZyAtPiBzdHJpbmcgb2JqZWN0LCBidXQgZm91bmQgdW5wYXJzZWFibGUgdmFsdWVgKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGJpbmRpbmdzID0gcGFyc2VIb3N0QmluZGluZ3MoaG9zdE1ldGFkYXRhKTtcblxuICBjb25zdCBlcnJvcnMgPSB2ZXJpZnlIb3N0QmluZGluZ3MoYmluZGluZ3MsIGNyZWF0ZVNvdXJjZVNwYW4oaG9zdEV4cHIpKTtcbiAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAvLyBUT0RPOiBwcm92aWRlIG1vcmUgZ3JhbnVsYXIgZGlhZ25vc3RpYyBhbmQgb3V0cHV0IHNwZWNpZmljIGhvc3QgZXhwcmVzc2lvbiB0aGF0XG4gICAgICAgIC8vIHRyaWdnZXJlZCBhbiBlcnJvciBpbnN0ZWFkIG9mIHRoZSB3aG9sZSBob3N0IG9iamVjdC5cbiAgICAgICAgRXJyb3JDb2RlLkhPU1RfQklORElOR19QQVJTRV9FUlJPUiwgaG9zdEV4cHIsXG4gICAgICAgIGVycm9ycy5tYXAoKGVycm9yOiBQYXJzZUVycm9yKSA9PiBlcnJvci5tc2cpLmpvaW4oJ1xcbicpKTtcbiAgfVxuXG4gIHJldHVybiBiaW5kaW5ncztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RIb3N0QmluZGluZ3MoXG4gICAgbWVtYmVyczogQ2xhc3NNZW1iZXJbXSwgZXZhbHVhdG9yOiBQYXJ0aWFsRXZhbHVhdG9yLCBjb3JlTW9kdWxlOiBzdHJpbmd8dW5kZWZpbmVkLFxuICAgIG1ldGFkYXRhPzogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4pOiBQYXJzZWRIb3N0QmluZGluZ3Mge1xuICBsZXQgYmluZGluZ3M6IFBhcnNlZEhvc3RCaW5kaW5ncztcbiAgaWYgKG1ldGFkYXRhICYmIG1ldGFkYXRhLmhhcygnaG9zdCcpKSB7XG4gICAgYmluZGluZ3MgPSBldmFsdWF0ZUhvc3RFeHByZXNzaW9uQmluZGluZ3MobWV0YWRhdGEuZ2V0KCdob3N0JykhLCBldmFsdWF0b3IpO1xuICB9IGVsc2Uge1xuICAgIGJpbmRpbmdzID0gcGFyc2VIb3N0QmluZGluZ3Moe30pO1xuICB9XG5cbiAgZmlsdGVyVG9NZW1iZXJzV2l0aERlY29yYXRvcihtZW1iZXJzLCAnSG9zdEJpbmRpbmcnLCBjb3JlTW9kdWxlKVxuICAgICAgLmZvckVhY2goKHttZW1iZXIsIGRlY29yYXRvcnN9KSA9PiB7XG4gICAgICAgIGRlY29yYXRvcnMuZm9yRWFjaChkZWNvcmF0b3IgPT4ge1xuICAgICAgICAgIGxldCBob3N0UHJvcGVydHlOYW1lOiBzdHJpbmcgPSBtZW1iZXIubmFtZTtcbiAgICAgICAgICBpZiAoZGVjb3JhdG9yLmFyZ3MgIT09IG51bGwgJiYgZGVjb3JhdG9yLmFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgICAgICAgICBFcnJvckNvZGUuREVDT1JBVE9SX0FSSVRZX1dST05HLCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvciksXG4gICAgICAgICAgICAgICAgICBgQEhvc3RCaW5kaW5nIGNhbiBoYXZlIGF0IG1vc3Qgb25lIGFyZ3VtZW50LCBnb3QgJHtcbiAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0b3IuYXJncy5sZW5ndGh9IGFyZ3VtZW50KHMpYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gZXZhbHVhdG9yLmV2YWx1YXRlKGRlY29yYXRvci5hcmdzWzBdKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgICBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvciksIHJlc29sdmVkLFxuICAgICAgICAgICAgICAgICAgYEBIb3N0QmluZGluZydzIGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmdgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaG9zdFByb3BlcnR5TmFtZSA9IHJlc29sdmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFNpbmNlIHRoaXMgaXMgYSBkZWNvcmF0b3IsIHdlIGtub3cgdGhhdCB0aGUgdmFsdWUgaXMgYSBjbGFzcyBtZW1iZXIuIEFsd2F5cyBhY2Nlc3MgaXRcbiAgICAgICAgICAvLyB0aHJvdWdoIGB0aGlzYCBzbyB0aGF0IGZ1cnRoZXIgZG93biB0aGUgbGluZSBpdCBjYW4ndCBiZSBjb25mdXNlZCBmb3IgYSBsaXRlcmFsIHZhbHVlXG4gICAgICAgICAgLy8gKGUuZy4gaWYgdGhlcmUncyBhIHByb3BlcnR5IGNhbGxlZCBgdHJ1ZWApLiBUaGVyZSBpcyBubyBzaXplIHBlbmFsdHksIGJlY2F1c2UgYWxsXG4gICAgICAgICAgLy8gdmFsdWVzIChleGNlcHQgbGl0ZXJhbHMpIGFyZSBjb252ZXJ0ZWQgdG8gYGN0eC5wcm9wTmFtZWAgZXZlbnR1YWxseS5cbiAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0aWVzW2hvc3RQcm9wZXJ0eU5hbWVdID0gZ2V0U2FmZVByb3BlcnR5QWNjZXNzU3RyaW5nKCd0aGlzJywgbWVtYmVyLm5hbWUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gIGZpbHRlclRvTWVtYmVyc1dpdGhEZWNvcmF0b3IobWVtYmVycywgJ0hvc3RMaXN0ZW5lcicsIGNvcmVNb2R1bGUpXG4gICAgICAuZm9yRWFjaCgoe21lbWJlciwgZGVjb3JhdG9yc30pID0+IHtcbiAgICAgICAgZGVjb3JhdG9ycy5mb3JFYWNoKGRlY29yYXRvciA9PiB7XG4gICAgICAgICAgbGV0IGV2ZW50TmFtZTogc3RyaW5nID0gbWVtYmVyLm5hbWU7XG4gICAgICAgICAgbGV0IGFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgaWYgKGRlY29yYXRvci5hcmdzICE9PSBudWxsICYmIGRlY29yYXRvci5hcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmIChkZWNvcmF0b3IuYXJncy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJJVFlfV1JPTkcsIGRlY29yYXRvci5hcmdzWzJdLFxuICAgICAgICAgICAgICAgICAgYEBIb3N0TGlzdGVuZXIgY2FuIGhhdmUgYXQgbW9zdCB0d28gYXJndW1lbnRzYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gZXZhbHVhdG9yLmV2YWx1YXRlKGRlY29yYXRvci5hcmdzWzBdKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgICBkZWNvcmF0b3IuYXJnc1swXSwgcmVzb2x2ZWQsXG4gICAgICAgICAgICAgICAgICBgQEhvc3RMaXN0ZW5lcidzIGV2ZW50IG5hbWUgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZ2ApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBldmVudE5hbWUgPSByZXNvbHZlZDtcblxuICAgICAgICAgICAgaWYgKGRlY29yYXRvci5hcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICBjb25zdCBleHByZXNzaW9uID0gZGVjb3JhdG9yLmFyZ3NbMV07XG4gICAgICAgICAgICAgIGNvbnN0IHJlc29sdmVkQXJncyA9IGV2YWx1YXRvci5ldmFsdWF0ZShkZWNvcmF0b3IuYXJnc1sxXSk7XG4gICAgICAgICAgICAgIGlmICghaXNTdHJpbmdBcnJheU9yRGllKHJlc29sdmVkQXJncywgJ0BIb3N0TGlzdGVuZXIuYXJncycsIGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgZGVjb3JhdG9yLmFyZ3NbMV0sIHJlc29sdmVkQXJncyxcbiAgICAgICAgICAgICAgICAgICAgYEBIb3N0TGlzdGVuZXIncyBzZWNvbmQgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZyBhcnJheWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFyZ3MgPSByZXNvbHZlZEFyZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYmluZGluZ3MubGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBgJHttZW1iZXIubmFtZX0oJHthcmdzLmpvaW4oJywnKX0pYDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgcmV0dXJuIGJpbmRpbmdzO1xufVxuXG5jb25zdCBRVUVSWV9UWVBFUyA9IG5ldyBTZXQoW1xuICAnQ29udGVudENoaWxkJyxcbiAgJ0NvbnRlbnRDaGlsZHJlbicsXG4gICdWaWV3Q2hpbGQnLFxuICAnVmlld0NoaWxkcmVuJyxcbl0pO1xuIl19