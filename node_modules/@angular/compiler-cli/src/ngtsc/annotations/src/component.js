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
        define("@angular/compiler-cli/src/ngtsc/annotations/src/component", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/util/src/ts_source_map_bug_29300", "@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics", "@angular/compiler-cli/src/ngtsc/annotations/src/directive", "@angular/compiler-cli/src/ngtsc/annotations/src/factory", "@angular/compiler-cli/src/ngtsc/annotations/src/metadata", "@angular/compiler-cli/src/ngtsc/annotations/src/ng_module", "@angular/compiler-cli/src/ngtsc/annotations/src/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentDecoratorHandler = exports.ComponentSymbol = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var semantic_graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var ts_source_map_bug_29300_1 = require("@angular/compiler-cli/src/ngtsc/util/src/ts_source_map_bug_29300");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/diagnostics");
    var directive_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/directive");
    var factory_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/factory");
    var metadata_2 = require("@angular/compiler-cli/src/ngtsc/annotations/src/metadata");
    var ng_module_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/ng_module");
    var util_1 = require("@angular/compiler-cli/src/ngtsc/annotations/src/util");
    var EMPTY_MAP = new Map();
    var EMPTY_ARRAY = [];
    /**
     * Represents an Angular component.
     */
    var ComponentSymbol = /** @class */ (function (_super) {
        tslib_1.__extends(ComponentSymbol, _super);
        function ComponentSymbol() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.usedDirectives = [];
            _this.usedPipes = [];
            _this.isRemotelyScoped = false;
            return _this;
        }
        ComponentSymbol.prototype.isEmitAffected = function (previousSymbol, publicApiAffected) {
            if (!(previousSymbol instanceof ComponentSymbol)) {
                return true;
            }
            // Create an equality function that considers symbols equal if they represent the same
            // declaration, but only if the symbol in the current compilation does not have its public API
            // affected.
            var isSymbolUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !publicApiAffected.has(current.symbol);
            };
            // The emit of a component is affected if either of the following is true:
            //  1. The component used to be remotely scoped but no longer is, or vice versa.
            //  2. The list of used directives has changed or any of those directives have had their public
            //     API changed. If the used directives have been reordered but not otherwise affected then
            //     the component must still be re-emitted, as this may affect directive instantiation order.
            //  3. The list of used pipes has changed, or any of those pipes have had their public API
            //     changed.
            return this.isRemotelyScoped !== previousSymbol.isRemotelyScoped ||
                !semantic_graph_1.isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isSymbolUnaffected) ||
                !semantic_graph_1.isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isSymbolUnaffected);
        };
        ComponentSymbol.prototype.isTypeCheckBlockAffected = function (previousSymbol, typeCheckApiAffected) {
            if (!(previousSymbol instanceof ComponentSymbol)) {
                return true;
            }
            // To verify that a used directive is not affected we need to verify that its full inheritance
            // chain is not present in `typeCheckApiAffected`.
            var isInheritanceChainAffected = function (symbol) {
                var currentSymbol = symbol;
                while (currentSymbol instanceof directive_1.DirectiveSymbol) {
                    if (typeCheckApiAffected.has(currentSymbol)) {
                        return true;
                    }
                    currentSymbol = currentSymbol.baseClass;
                }
                return false;
            };
            // Create an equality function that considers directives equal if they represent the same
            // declaration and if the symbol and all symbols it inherits from in the current compilation
            // do not have their type-check API affected.
            var isDirectiveUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !isInheritanceChainAffected(current.symbol);
            };
            // Create an equality function that considers pipes equal if they represent the same
            // declaration and if the symbol in the current compilation does not have its type-check
            // API affected.
            var isPipeUnaffected = function (current, previous) {
                return semantic_graph_1.isReferenceEqual(current, previous) && !typeCheckApiAffected.has(current.symbol);
            };
            // The emit of a type-check block of a component is affected if either of the following is true:
            //  1. The list of used directives has changed or any of those directives have had their
            //     type-check API changed.
            //  2. The list of used pipes has changed, or any of those pipes have had their type-check API
            //     changed.
            return !semantic_graph_1.isArrayEqual(this.usedDirectives, previousSymbol.usedDirectives, isDirectiveUnaffected) ||
                !semantic_graph_1.isArrayEqual(this.usedPipes, previousSymbol.usedPipes, isPipeUnaffected);
        };
        return ComponentSymbol;
    }(directive_1.DirectiveSymbol));
    exports.ComponentSymbol = ComponentSymbol;
    /**
     * `DecoratorHandler` which handles the `@Component` annotation.
     */
    var ComponentDecoratorHandler = /** @class */ (function () {
        function ComponentDecoratorHandler(reflector, evaluator, metaRegistry, metaReader, scopeReader, scopeRegistry, typeCheckScopeRegistry, resourceRegistry, isCore, resourceLoader, rootDirs, defaultPreserveWhitespaces, i18nUseExternalIds, enableI18nLegacyMessageIdFormat, usePoisonedData, i18nNormalizeLineEndingsInICUs, moduleResolver, cycleAnalyzer, cycleHandlingStrategy, refEmitter, depTracker, injectableRegistry, semanticDepGraphUpdater, annotateForClosureCompiler, perf) {
            this.reflector = reflector;
            this.evaluator = evaluator;
            this.metaRegistry = metaRegistry;
            this.metaReader = metaReader;
            this.scopeReader = scopeReader;
            this.scopeRegistry = scopeRegistry;
            this.typeCheckScopeRegistry = typeCheckScopeRegistry;
            this.resourceRegistry = resourceRegistry;
            this.isCore = isCore;
            this.resourceLoader = resourceLoader;
            this.rootDirs = rootDirs;
            this.defaultPreserveWhitespaces = defaultPreserveWhitespaces;
            this.i18nUseExternalIds = i18nUseExternalIds;
            this.enableI18nLegacyMessageIdFormat = enableI18nLegacyMessageIdFormat;
            this.usePoisonedData = usePoisonedData;
            this.i18nNormalizeLineEndingsInICUs = i18nNormalizeLineEndingsInICUs;
            this.moduleResolver = moduleResolver;
            this.cycleAnalyzer = cycleAnalyzer;
            this.cycleHandlingStrategy = cycleHandlingStrategy;
            this.refEmitter = refEmitter;
            this.depTracker = depTracker;
            this.injectableRegistry = injectableRegistry;
            this.semanticDepGraphUpdater = semanticDepGraphUpdater;
            this.annotateForClosureCompiler = annotateForClosureCompiler;
            this.perf = perf;
            this.literalCache = new Map();
            this.elementSchemaRegistry = new compiler_1.DomElementSchemaRegistry();
            /**
             * During the asynchronous preanalyze phase, it's necessary to parse the template to extract
             * any potential <link> tags which might need to be loaded. This cache ensures that work is not
             * thrown away, and the parsed template is reused during the analyze phase.
             */
            this.preanalyzeTemplateCache = new Map();
            this.precedence = transform_1.HandlerPrecedence.PRIMARY;
            this.name = ComponentDecoratorHandler.name;
        }
        ComponentDecoratorHandler.prototype.detect = function (node, decorators) {
            if (!decorators) {
                return undefined;
            }
            var decorator = util_1.findAngularDecorator(decorators, 'Component', this.isCore);
            if (decorator !== undefined) {
                return {
                    trigger: decorator.node,
                    decorator: decorator,
                    metadata: decorator,
                };
            }
            else {
                return undefined;
            }
        };
        ComponentDecoratorHandler.prototype.preanalyze = function (node, decorator) {
            // In preanalyze, resource URLs associated with the component are asynchronously preloaded via
            // the resourceLoader. This is the only time async operations are allowed for a component.
            // These resources are:
            //
            // - the templateUrl, if there is one
            // - any styleUrls if present
            // - any stylesheets referenced from <link> tags in the template itself
            //
            // As a result of the last one, the template must be parsed as part of preanalysis to extract
            // <link> tags, which may involve waiting for the templateUrl to be resolved first.
            var _this = this;
            // If preloading isn't possible, then skip this step.
            if (!this.resourceLoader.canPreload) {
                return undefined;
            }
            var meta = this._resolveLiteral(decorator);
            var component = reflection_1.reflectObjectLiteral(meta);
            var containingFile = node.getSourceFile().fileName;
            var resolveStyleUrl = function (styleUrl) {
                try {
                    var resourceUrl = _this.resourceLoader.resolve(styleUrl, containingFile);
                    return _this.resourceLoader.preload(resourceUrl);
                }
                catch (_a) {
                    // Don't worry about failures to preload. We can handle this problem during analysis by
                    // producing a diagnostic.
                    return undefined;
                }
            };
            // A Promise that waits for the template and all <link>ed styles within it to be preloaded.
            var templateAndTemplateStyleResources = this._preloadAndParseTemplate(node, decorator, component, containingFile)
                .then(function (template) {
                if (template === null) {
                    return undefined;
                }
                return Promise.all(template.styleUrls.map(function (styleUrl) { return resolveStyleUrl(styleUrl); }))
                    .then(function () { return undefined; });
            });
            // Extract all the styleUrls in the decorator.
            var componentStyleUrls = this._extractComponentStyleUrls(component);
            if (componentStyleUrls === null) {
                // A fast path exists if there are no styleUrls, to just wait for
                // templateAndTemplateStyleResources.
                return templateAndTemplateStyleResources;
            }
            else {
                // Wait for both the template and all styleUrl resources to resolve.
                return Promise
                    .all(tslib_1.__spread([
                    templateAndTemplateStyleResources
                ], componentStyleUrls.map(function (styleUrl) { return resolveStyleUrl(styleUrl.url); })))
                    .then(function () { return undefined; });
            }
        };
        ComponentDecoratorHandler.prototype.analyze = function (node, decorator, flags) {
            var e_1, _a;
            var _b;
            if (flags === void 0) { flags = transform_1.HandlerFlags.NONE; }
            this.perf.eventCount(perf_1.PerfEvent.AnalyzeComponent);
            var containingFile = node.getSourceFile().fileName;
            this.literalCache.delete(decorator);
            var diagnostics;
            var isPoisoned = false;
            // @Component inherits @Directive, so begin by extracting the @Directive metadata and building
            // on it.
            var directiveResult = directive_1.extractDirectiveMetadata(node, decorator, this.reflector, this.evaluator, this.isCore, flags, this.annotateForClosureCompiler, this.elementSchemaRegistry.getDefaultComponentElementName());
            if (directiveResult === undefined) {
                // `extractDirectiveMetadata` returns undefined when the @Directive has `jit: true`. In this
                // case, compilation of the decorator is skipped. Returning an empty object signifies
                // that no analysis was produced.
                return {};
            }
            // Next, read the `@Component`-specific fields.
            var component = directiveResult.decorator, metadata = directiveResult.metadata, inputs = directiveResult.inputs, outputs = directiveResult.outputs;
            // Go through the root directories for this project, and select the one with the smallest
            // relative path representation.
            var relativeContextFilePath = this.rootDirs.reduce(function (previous, rootDir) {
                var candidate = file_system_1.relative(file_system_1.absoluteFrom(rootDir), file_system_1.absoluteFrom(containingFile));
                if (previous === undefined || candidate.length < previous.length) {
                    return candidate;
                }
                else {
                    return previous;
                }
            }, undefined);
            // Note that we could technically combine the `viewProvidersRequiringFactory` and
            // `providersRequiringFactory` into a single set, but we keep the separate so that
            // we can distinguish where an error is coming from when logging the diagnostics in `resolve`.
            var viewProvidersRequiringFactory = null;
            var providersRequiringFactory = null;
            var wrappedViewProviders = null;
            if (component.has('viewProviders')) {
                var viewProviders = component.get('viewProviders');
                viewProvidersRequiringFactory =
                    util_1.resolveProvidersRequiringFactory(viewProviders, this.reflector, this.evaluator);
                wrappedViewProviders = new compiler_1.WrappedNodeExpr(this.annotateForClosureCompiler ? util_1.wrapFunctionExpressionsInParens(viewProviders) :
                    viewProviders);
            }
            if (component.has('providers')) {
                providersRequiringFactory = util_1.resolveProvidersRequiringFactory(component.get('providers'), this.reflector, this.evaluator);
            }
            // Parse the template.
            // If a preanalyze phase was executed, the template may already exist in parsed form, so check
            // the preanalyzeTemplateCache.
            // Extract a closure of the template parsing code so that it can be reparsed with different
            // options if needed, like in the indexing pipeline.
            var template;
            if (this.preanalyzeTemplateCache.has(node)) {
                // The template was parsed in preanalyze. Use it and delete it to save memory.
                var preanalyzed = this.preanalyzeTemplateCache.get(node);
                this.preanalyzeTemplateCache.delete(node);
                template = preanalyzed;
            }
            else {
                var templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
                template = this.extractTemplate(node, templateDecl);
            }
            var templateResource = template.isInline ? { path: null, expression: component.get('template') } : {
                path: file_system_1.absoluteFrom(template.declaration.resolvedTemplateUrl),
                expression: template.sourceMapping.node
            };
            // Figure out the set of styles. The ordering here is important: external resources (styleUrls)
            // precede inline styles, and styles defined in the template override styles defined in the
            // component.
            var styles = [];
            var styleResources = this._extractStyleResources(component, containingFile);
            var styleUrls = tslib_1.__spread(this._extractComponentStyleUrls(component), this._extractTemplateStyleUrls(template));
            try {
                for (var styleUrls_1 = tslib_1.__values(styleUrls), styleUrls_1_1 = styleUrls_1.next(); !styleUrls_1_1.done; styleUrls_1_1 = styleUrls_1.next()) {
                    var styleUrl = styleUrls_1_1.value;
                    try {
                        var resourceUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
                        var resourceStr = this.resourceLoader.load(resourceUrl);
                        styles.push(resourceStr);
                        if (this.depTracker !== null) {
                            this.depTracker.addResourceDependency(node.getSourceFile(), file_system_1.absoluteFrom(resourceUrl));
                        }
                    }
                    catch (_c) {
                        if (diagnostics === undefined) {
                            diagnostics = [];
                        }
                        var resourceType = styleUrl.source === 2 /* StylesheetFromDecorator */ ?
                            2 /* StylesheetFromDecorator */ :
                            1 /* StylesheetFromTemplate */;
                        diagnostics.push(this.makeResourceNotFoundError(styleUrl.url, styleUrl.nodeForError, resourceType)
                            .toDiagnostic());
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (styleUrls_1_1 && !styleUrls_1_1.done && (_a = styleUrls_1.return)) _a.call(styleUrls_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var inlineStyles = null;
            if (component.has('styles')) {
                var litStyles = directive_1.parseFieldArrayValue(component, 'styles', this.evaluator);
                if (litStyles !== null) {
                    inlineStyles = tslib_1.__spread(litStyles);
                    styles.push.apply(styles, tslib_1.__spread(litStyles));
                }
            }
            if (template.styles.length > 0) {
                styles.push.apply(styles, tslib_1.__spread(template.styles));
            }
            var encapsulation = this._resolveEnumValue(component, 'encapsulation', 'ViewEncapsulation') || 0;
            var changeDetection = this._resolveEnumValue(component, 'changeDetection', 'ChangeDetectionStrategy');
            var animations = null;
            if (component.has('animations')) {
                animations = new compiler_1.WrappedNodeExpr(component.get('animations'));
            }
            var output = {
                analysis: {
                    baseClass: util_1.readBaseClass(node, this.reflector, this.evaluator),
                    inputs: inputs,
                    outputs: outputs,
                    meta: tslib_1.__assign(tslib_1.__assign({}, metadata), { template: {
                            nodes: template.nodes,
                            ngContentSelectors: template.ngContentSelectors,
                        }, encapsulation: encapsulation, interpolation: (_b = template.interpolationConfig) !== null && _b !== void 0 ? _b : compiler_1.DEFAULT_INTERPOLATION_CONFIG, styles: styles,
                        // These will be replaced during the compilation step, after all `NgModule`s have been
                        // analyzed and the full compilation scope for the component can be realized.
                        animations: animations, viewProviders: wrappedViewProviders, i18nUseExternalIds: this.i18nUseExternalIds, relativeContextFilePath: relativeContextFilePath }),
                    typeCheckMeta: metadata_1.extractDirectiveTypeCheckMeta(node, inputs, this.reflector),
                    metadataStmt: metadata_2.generateSetClassMetadataCall(node, this.reflector, this.isCore, this.annotateForClosureCompiler),
                    template: template,
                    providersRequiringFactory: providersRequiringFactory,
                    viewProvidersRequiringFactory: viewProvidersRequiringFactory,
                    inlineStyles: inlineStyles,
                    styleUrls: styleUrls,
                    resources: {
                        styles: styleResources,
                        template: templateResource,
                    },
                    isPoisoned: isPoisoned,
                },
                diagnostics: diagnostics,
            };
            if (changeDetection !== null) {
                output.analysis.meta.changeDetection = changeDetection;
            }
            return output;
        };
        ComponentDecoratorHandler.prototype.symbol = function (node, analysis) {
            var typeParameters = semantic_graph_1.extractSemanticTypeParameters(node);
            return new ComponentSymbol(node, analysis.meta.selector, analysis.inputs, analysis.outputs, analysis.meta.exportAs, analysis.typeCheckMeta, typeParameters);
        };
        ComponentDecoratorHandler.prototype.register = function (node, analysis) {
            // Register this component's information with the `MetadataRegistry`. This ensures that
            // the information about the component is available during the compile() phase.
            var ref = new imports_1.Reference(node);
            this.metaRegistry.registerDirectiveMetadata(tslib_1.__assign(tslib_1.__assign({ ref: ref, name: node.name.text, selector: analysis.meta.selector, exportAs: analysis.meta.exportAs, inputs: analysis.inputs, outputs: analysis.outputs, queries: analysis.meta.queries.map(function (query) { return query.propertyName; }), isComponent: true, baseClass: analysis.baseClass }, analysis.typeCheckMeta), { isPoisoned: analysis.isPoisoned, isStructural: false }));
            this.resourceRegistry.registerResources(analysis.resources, node);
            this.injectableRegistry.registerInjectable(node);
        };
        ComponentDecoratorHandler.prototype.index = function (context, node, analysis) {
            var e_2, _a;
            if (analysis.isPoisoned && !this.usePoisonedData) {
                return null;
            }
            var scope = this.scopeReader.getScopeForComponent(node);
            var selector = analysis.meta.selector;
            var matcher = new compiler_1.SelectorMatcher();
            if (scope !== null) {
                if ((scope.compilation.isPoisoned || scope.exported.isPoisoned) && !this.usePoisonedData) {
                    // Don't bother indexing components which had erroneous scopes, unless specifically
                    // requested.
                    return null;
                }
                try {
                    for (var _b = tslib_1.__values(scope.compilation.directives), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var directive = _c.value;
                        if (directive.selector !== null) {
                            matcher.addSelectables(compiler_1.CssSelector.parse(directive.selector), directive);
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
            }
            var binder = new compiler_1.R3TargetBinder(matcher);
            var boundTemplate = binder.bind({ template: analysis.template.diagNodes });
            context.addComponent({
                declaration: node,
                selector: selector,
                boundTemplate: boundTemplate,
                templateMeta: {
                    isInline: analysis.template.isInline,
                    file: analysis.template.file,
                },
            });
        };
        ComponentDecoratorHandler.prototype.typeCheck = function (ctx, node, meta) {
            if (this.typeCheckScopeRegistry === null || !ts.isClassDeclaration(node)) {
                return;
            }
            if (meta.isPoisoned && !this.usePoisonedData) {
                return;
            }
            var scope = this.typeCheckScopeRegistry.getTypeCheckScope(node);
            if (scope.isPoisoned && !this.usePoisonedData) {
                // Don't type-check components that had errors in their scopes, unless requested.
                return;
            }
            var binder = new compiler_1.R3TargetBinder(scope.matcher);
            ctx.addTemplate(new imports_1.Reference(node), binder, meta.template.diagNodes, scope.pipes, scope.schemas, meta.template.sourceMapping, meta.template.file, meta.template.errors);
        };
        ComponentDecoratorHandler.prototype.resolve = function (node, analysis, symbol) {
            var e_3, _a, e_4, _b, e_5, _c, e_6, _d, e_7, _e, e_8, _f, e_9, _g, e_10, _h, e_11, _j;
            var _this = this;
            if (this.semanticDepGraphUpdater !== null && analysis.baseClass instanceof imports_1.Reference) {
                symbol.baseClass = this.semanticDepGraphUpdater.getSymbol(analysis.baseClass.node);
            }
            if (analysis.isPoisoned && !this.usePoisonedData) {
                return {};
            }
            var context = node.getSourceFile();
            // Check whether this component was registered with an NgModule. If so, it should be compiled
            // under that module's compilation scope.
            var scope = this.scopeReader.getScopeForComponent(node);
            var metadata = analysis.meta;
            var data = {
                directives: EMPTY_ARRAY,
                pipes: EMPTY_MAP,
                declarationListEmitMode: 0 /* Direct */,
            };
            if (scope !== null && (!scope.compilation.isPoisoned || this.usePoisonedData)) {
                var matcher = new compiler_1.SelectorMatcher();
                try {
                    for (var _k = tslib_1.__values(scope.compilation.directives), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var dir = _l.value;
                        if (dir.selector !== null) {
                            matcher.addSelectables(compiler_1.CssSelector.parse(dir.selector), dir);
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_a = _k.return)) _a.call(_k);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                var pipes = new Map();
                try {
                    for (var _m = tslib_1.__values(scope.compilation.pipes), _o = _m.next(); !_o.done; _o = _m.next()) {
                        var pipe = _o.value;
                        pipes.set(pipe.name, pipe.ref);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_o && !_o.done && (_b = _m.return)) _b.call(_m);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                // Next, the component template AST is bound using the R3TargetBinder. This produces a
                // BoundTarget, which is similar to a ts.TypeChecker.
                var binder = new compiler_1.R3TargetBinder(matcher);
                var bound = binder.bind({ template: metadata.template.nodes });
                var usedDirectives = bound.getUsedDirectives().map(function (directive) {
                    var type = _this.refEmitter.emit(directive.ref, context);
                    return {
                        ref: directive.ref,
                        type: type.expression,
                        importedFile: type.importedFile,
                        selector: directive.selector,
                        inputs: directive.inputs.propertyNames,
                        outputs: directive.outputs.propertyNames,
                        exportAs: directive.exportAs,
                        isComponent: directive.isComponent,
                    };
                });
                var usedPipes = [];
                try {
                    for (var _p = tslib_1.__values(bound.getUsedPipes()), _q = _p.next(); !_q.done; _q = _p.next()) {
                        var pipeName = _q.value;
                        if (!pipes.has(pipeName)) {
                            continue;
                        }
                        var pipe = pipes.get(pipeName);
                        var type = this.refEmitter.emit(pipe, context);
                        usedPipes.push({
                            ref: pipe,
                            pipeName: pipeName,
                            expression: type.expression,
                            importedFile: type.importedFile,
                        });
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_q && !_q.done && (_c = _p.return)) _c.call(_p);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (this.semanticDepGraphUpdater !== null) {
                    symbol.usedDirectives = usedDirectives.map(function (dir) { return _this.semanticDepGraphUpdater.getSemanticReference(dir.ref.node, dir.type); });
                    symbol.usedPipes = usedPipes.map(function (pipe) {
                        return _this.semanticDepGraphUpdater.getSemanticReference(pipe.ref.node, pipe.expression);
                    });
                }
                // Scan through the directives/pipes actually used in the template and check whether any
                // import which needs to be generated would create a cycle.
                var cyclesFromDirectives = new Map();
                try {
                    for (var usedDirectives_1 = tslib_1.__values(usedDirectives), usedDirectives_1_1 = usedDirectives_1.next(); !usedDirectives_1_1.done; usedDirectives_1_1 = usedDirectives_1.next()) {
                        var usedDirective = usedDirectives_1_1.value;
                        var cycle = this._checkForCyclicImport(usedDirective.importedFile, usedDirective.type, context);
                        if (cycle !== null) {
                            cyclesFromDirectives.set(usedDirective, cycle);
                        }
                    }
                }
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (usedDirectives_1_1 && !usedDirectives_1_1.done && (_d = usedDirectives_1.return)) _d.call(usedDirectives_1);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                var cyclesFromPipes = new Map();
                try {
                    for (var usedPipes_1 = tslib_1.__values(usedPipes), usedPipes_1_1 = usedPipes_1.next(); !usedPipes_1_1.done; usedPipes_1_1 = usedPipes_1.next()) {
                        var usedPipe = usedPipes_1_1.value;
                        var cycle = this._checkForCyclicImport(usedPipe.importedFile, usedPipe.expression, context);
                        if (cycle !== null) {
                            cyclesFromPipes.set(usedPipe, cycle);
                        }
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (usedPipes_1_1 && !usedPipes_1_1.done && (_e = usedPipes_1.return)) _e.call(usedPipes_1);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                var cycleDetected = cyclesFromDirectives.size !== 0 || cyclesFromPipes.size !== 0;
                if (!cycleDetected) {
                    try {
                        // No cycle was detected. Record the imports that need to be created in the cycle detector
                        // so that future cyclic import checks consider their production.
                        for (var usedDirectives_2 = tslib_1.__values(usedDirectives), usedDirectives_2_1 = usedDirectives_2.next(); !usedDirectives_2_1.done; usedDirectives_2_1 = usedDirectives_2.next()) {
                            var _r = usedDirectives_2_1.value, type = _r.type, importedFile = _r.importedFile;
                            this._recordSyntheticImport(importedFile, type, context);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (usedDirectives_2_1 && !usedDirectives_2_1.done && (_f = usedDirectives_2.return)) _f.call(usedDirectives_2);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    try {
                        for (var usedPipes_2 = tslib_1.__values(usedPipes), usedPipes_2_1 = usedPipes_2.next(); !usedPipes_2_1.done; usedPipes_2_1 = usedPipes_2.next()) {
                            var _s = usedPipes_2_1.value, expression = _s.expression, importedFile = _s.importedFile;
                            this._recordSyntheticImport(importedFile, expression, context);
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (usedPipes_2_1 && !usedPipes_2_1.done && (_g = usedPipes_2.return)) _g.call(usedPipes_2);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    // Check whether the directive/pipe arrays in ɵcmp need to be wrapped in closures.
                    // This is required if any directive/pipe reference is to a declaration in the same file
                    // but declared after this component.
                    var wrapDirectivesAndPipesInClosure = usedDirectives.some(function (dir) { return util_1.isExpressionForwardReference(dir.type, node.name, context); }) ||
                        usedPipes.some(function (pipe) { return util_1.isExpressionForwardReference(pipe.expression, node.name, context); });
                    data.directives = usedDirectives;
                    data.pipes = new Map(usedPipes.map(function (pipe) { return [pipe.pipeName, pipe.expression]; }));
                    data.declarationListEmitMode = wrapDirectivesAndPipesInClosure ?
                        1 /* Closure */ :
                        0 /* Direct */;
                }
                else {
                    if (this.cycleHandlingStrategy === 0 /* UseRemoteScoping */) {
                        // Declaring the directiveDefs/pipeDefs arrays directly would require imports that would
                        // create a cycle. Instead, mark this component as requiring remote scoping, so that the
                        // NgModule file will take care of setting the directives for the component.
                        this.scopeRegistry.setComponentRemoteScope(node, usedDirectives.map(function (dir) { return dir.ref; }), usedPipes.map(function (pipe) { return pipe.ref; }));
                        symbol.isRemotelyScoped = true;
                        // If a semantic graph is being tracked, record the fact that this component is remotely
                        // scoped with the declaring NgModule symbol as the NgModule's emit becomes dependent on
                        // the directive/pipe usages of this component.
                        if (this.semanticDepGraphUpdater !== null) {
                            var moduleSymbol = this.semanticDepGraphUpdater.getSymbol(scope.ngModule);
                            if (!(moduleSymbol instanceof ng_module_1.NgModuleSymbol)) {
                                throw new Error("AssertionError: Expected " + scope.ngModule.name + " to be an NgModuleSymbol.");
                            }
                            moduleSymbol.addRemotelyScopedComponent(symbol, symbol.usedDirectives, symbol.usedPipes);
                        }
                    }
                    else {
                        // We are not able to handle this cycle so throw an error.
                        var relatedMessages = [];
                        try {
                            for (var cyclesFromDirectives_1 = tslib_1.__values(cyclesFromDirectives), cyclesFromDirectives_1_1 = cyclesFromDirectives_1.next(); !cyclesFromDirectives_1_1.done; cyclesFromDirectives_1_1 = cyclesFromDirectives_1.next()) {
                                var _t = tslib_1.__read(cyclesFromDirectives_1_1.value, 2), dir = _t[0], cycle = _t[1];
                                relatedMessages.push(makeCyclicImportInfo(dir.ref, dir.isComponent ? 'component' : 'directive', cycle));
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (cyclesFromDirectives_1_1 && !cyclesFromDirectives_1_1.done && (_h = cyclesFromDirectives_1.return)) _h.call(cyclesFromDirectives_1);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        try {
                            for (var cyclesFromPipes_1 = tslib_1.__values(cyclesFromPipes), cyclesFromPipes_1_1 = cyclesFromPipes_1.next(); !cyclesFromPipes_1_1.done; cyclesFromPipes_1_1 = cyclesFromPipes_1.next()) {
                                var _u = tslib_1.__read(cyclesFromPipes_1_1.value, 2), pipe = _u[0], cycle = _u[1];
                                relatedMessages.push(makeCyclicImportInfo(pipe.ref, 'pipe', cycle));
                            }
                        }
                        catch (e_11_1) { e_11 = { error: e_11_1 }; }
                        finally {
                            try {
                                if (cyclesFromPipes_1_1 && !cyclesFromPipes_1_1.done && (_j = cyclesFromPipes_1.return)) _j.call(cyclesFromPipes_1);
                            }
                            finally { if (e_11) throw e_11.error; }
                        }
                        throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.IMPORT_CYCLE_DETECTED, node, 'One or more import cycles would need to be created to compile this component, ' +
                            'which is not supported by the current compiler configuration.', relatedMessages);
                    }
                }
            }
            var diagnostics = [];
            if (analysis.providersRequiringFactory !== null &&
                analysis.meta.providers instanceof compiler_1.WrappedNodeExpr) {
                var providerDiagnostics = diagnostics_2.getProviderDiagnostics(analysis.providersRequiringFactory, analysis.meta.providers.node, this.injectableRegistry);
                diagnostics.push.apply(diagnostics, tslib_1.__spread(providerDiagnostics));
            }
            if (analysis.viewProvidersRequiringFactory !== null &&
                analysis.meta.viewProviders instanceof compiler_1.WrappedNodeExpr) {
                var viewProviderDiagnostics = diagnostics_2.getProviderDiagnostics(analysis.viewProvidersRequiringFactory, analysis.meta.viewProviders.node, this.injectableRegistry);
                diagnostics.push.apply(diagnostics, tslib_1.__spread(viewProviderDiagnostics));
            }
            var directiveDiagnostics = diagnostics_2.getDirectiveDiagnostics(node, this.metaReader, this.evaluator, this.reflector, this.scopeRegistry, 'Component');
            if (directiveDiagnostics !== null) {
                diagnostics.push.apply(diagnostics, tslib_1.__spread(directiveDiagnostics));
            }
            if (diagnostics.length > 0) {
                return { diagnostics: diagnostics };
            }
            return { data: data };
        };
        ComponentDecoratorHandler.prototype.updateResources = function (node, analysis) {
            var e_12, _a, e_13, _b, e_14, _c;
            var containingFile = node.getSourceFile().fileName;
            // If the template is external, re-parse it.
            var templateDecl = analysis.template.declaration;
            if (!templateDecl.isInline) {
                analysis.template = this.extractTemplate(node, templateDecl);
            }
            // Update any external stylesheets and rebuild the combined 'styles' list.
            // TODO(alxhub): write tests for styles when the primary compiler uses the updateResources path
            var styles = [];
            if (analysis.styleUrls !== null) {
                try {
                    for (var _d = tslib_1.__values(analysis.styleUrls), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var styleUrl = _e.value;
                        try {
                            var resolvedStyleUrl = this.resourceLoader.resolve(styleUrl.url, containingFile);
                            var styleText = this.resourceLoader.load(resolvedStyleUrl);
                            styles.push(styleText);
                        }
                        catch (e) {
                            // Resource resolve failures should already be in the diagnostics list from the analyze
                            // stage. We do not need to do anything with them when updating resources.
                        }
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
            }
            if (analysis.inlineStyles !== null) {
                try {
                    for (var _f = tslib_1.__values(analysis.inlineStyles), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var styleText = _g.value;
                        styles.push(styleText);
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
            }
            try {
                for (var _h = tslib_1.__values(analysis.template.styles), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var styleText = _j.value;
                    styles.push(styleText);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_14) throw e_14.error; }
            }
            analysis.meta.styles = styles;
        };
        ComponentDecoratorHandler.prototype.compileFull = function (node, analysis, resolution, pool) {
            if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
                return [];
            }
            var meta = tslib_1.__assign(tslib_1.__assign({}, analysis.meta), resolution);
            var def = compiler_1.compileComponentFromMetadata(meta, pool, compiler_1.makeBindingParser());
            return this.compileComponent(analysis, def);
        };
        ComponentDecoratorHandler.prototype.compilePartial = function (node, analysis, resolution) {
            if (analysis.template.errors !== null && analysis.template.errors.length > 0) {
                return [];
            }
            var meta = tslib_1.__assign(tslib_1.__assign({}, analysis.meta), resolution);
            var def = compiler_1.compileDeclareComponentFromMetadata(meta, analysis.template);
            return this.compileComponent(analysis, def);
        };
        ComponentDecoratorHandler.prototype.compileComponent = function (analysis, _a) {
            var initializer = _a.expression, type = _a.type;
            var factoryRes = factory_1.compileNgFactoryDefField(tslib_1.__assign(tslib_1.__assign({}, analysis.meta), { injectFn: compiler_1.Identifiers.directiveInject, target: compiler_1.R3FactoryTarget.Component }));
            if (analysis.metadataStmt !== null) {
                factoryRes.statements.push(analysis.metadataStmt);
            }
            return [
                factoryRes,
                {
                    name: 'ɵcmp',
                    initializer: initializer,
                    statements: [],
                    type: type,
                }
            ];
        };
        ComponentDecoratorHandler.prototype._resolveLiteral = function (decorator) {
            if (this.literalCache.has(decorator)) {
                return this.literalCache.get(decorator);
            }
            if (decorator.args === null || decorator.args.length !== 1) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARITY_WRONG, reflection_1.Decorator.nodeForError(decorator), "Incorrect number of arguments to @Component decorator");
            }
            var meta = util_1.unwrapExpression(decorator.args[0]);
            if (!ts.isObjectLiteralExpression(meta)) {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.DECORATOR_ARG_NOT_LITERAL, meta, "Decorator argument must be literal.");
            }
            this.literalCache.set(decorator, meta);
            return meta;
        };
        ComponentDecoratorHandler.prototype._resolveEnumValue = function (component, field, enumSymbolName) {
            var resolved = null;
            if (component.has(field)) {
                var expr = component.get(field);
                var value = this.evaluator.evaluate(expr);
                if (value instanceof partial_evaluator_1.EnumValue && util_1.isAngularCoreReference(value.enumRef, enumSymbolName)) {
                    resolved = value.resolved;
                }
                else {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, field + " must be a member of " + enumSymbolName + " enum from @angular/core");
                }
            }
            return resolved;
        };
        ComponentDecoratorHandler.prototype._extractComponentStyleUrls = function (component) {
            if (!component.has('styleUrls')) {
                return [];
            }
            return this._extractStyleUrlsFromExpression(component.get('styleUrls'));
        };
        ComponentDecoratorHandler.prototype._extractStyleUrlsFromExpression = function (styleUrlsExpr) {
            var e_15, _a, e_16, _b;
            var styleUrls = [];
            if (ts.isArrayLiteralExpression(styleUrlsExpr)) {
                try {
                    for (var _c = tslib_1.__values(styleUrlsExpr.elements), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var styleUrlExpr = _d.value;
                        if (ts.isSpreadElement(styleUrlExpr)) {
                            styleUrls.push.apply(styleUrls, tslib_1.__spread(this._extractStyleUrlsFromExpression(styleUrlExpr.expression)));
                        }
                        else {
                            var styleUrl = this.evaluator.evaluate(styleUrlExpr);
                            if (typeof styleUrl !== 'string') {
                                throw diagnostics_2.createValueHasWrongTypeError(styleUrlExpr, styleUrl, 'styleUrl must be a string');
                            }
                            styleUrls.push({
                                url: styleUrl,
                                source: 2 /* StylesheetFromDecorator */,
                                nodeForError: styleUrlExpr,
                            });
                        }
                    }
                }
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
            }
            else {
                var evaluatedStyleUrls = this.evaluator.evaluate(styleUrlsExpr);
                if (!isStringArray(evaluatedStyleUrls)) {
                    throw diagnostics_2.createValueHasWrongTypeError(styleUrlsExpr, evaluatedStyleUrls, 'styleUrls must be an array of strings');
                }
                try {
                    for (var evaluatedStyleUrls_1 = tslib_1.__values(evaluatedStyleUrls), evaluatedStyleUrls_1_1 = evaluatedStyleUrls_1.next(); !evaluatedStyleUrls_1_1.done; evaluatedStyleUrls_1_1 = evaluatedStyleUrls_1.next()) {
                        var styleUrl = evaluatedStyleUrls_1_1.value;
                        styleUrls.push({
                            url: styleUrl,
                            source: 2 /* StylesheetFromDecorator */,
                            nodeForError: styleUrlsExpr,
                        });
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (evaluatedStyleUrls_1_1 && !evaluatedStyleUrls_1_1.done && (_b = evaluatedStyleUrls_1.return)) _b.call(evaluatedStyleUrls_1);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
            }
            return styleUrls;
        };
        ComponentDecoratorHandler.prototype._extractStyleResources = function (component, containingFile) {
            var e_17, _a, e_18, _b;
            var styles = new Set();
            function stringLiteralElements(array) {
                return array.elements.filter(function (e) { return ts.isStringLiteralLike(e); });
            }
            // If styleUrls is a literal array, process each resource url individually and
            // register ones that are string literals.
            var styleUrlsExpr = component.get('styleUrls');
            if (styleUrlsExpr !== undefined && ts.isArrayLiteralExpression(styleUrlsExpr)) {
                try {
                    for (var _c = tslib_1.__values(stringLiteralElements(styleUrlsExpr)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var expression = _d.value;
                        try {
                            var resourceUrl = this.resourceLoader.resolve(expression.text, containingFile);
                            styles.add({ path: file_system_1.absoluteFrom(resourceUrl), expression: expression });
                        }
                        catch (_e) {
                            // Errors in style resource extraction do not need to be handled here. We will produce
                            // diagnostics for each one that fails in the analysis, after we evaluate the `styleUrls`
                            // expression to determine _all_ style resources, not just the string literals.
                        }
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
            }
            var stylesExpr = component.get('styles');
            if (stylesExpr !== undefined && ts.isArrayLiteralExpression(stylesExpr)) {
                try {
                    for (var _f = tslib_1.__values(stringLiteralElements(stylesExpr)), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var expression = _g.value;
                        styles.add({ path: null, expression: expression });
                    }
                }
                catch (e_18_1) { e_18 = { error: e_18_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_18) throw e_18.error; }
                }
            }
            return styles;
        };
        ComponentDecoratorHandler.prototype._preloadAndParseTemplate = function (node, decorator, component, containingFile) {
            var _this = this;
            if (component.has('templateUrl')) {
                // Extract the templateUrl and preload it.
                var templateUrlExpr = component.get('templateUrl');
                var templateUrl = this.evaluator.evaluate(templateUrlExpr);
                if (typeof templateUrl !== 'string') {
                    throw diagnostics_2.createValueHasWrongTypeError(templateUrlExpr, templateUrl, 'templateUrl must be a string');
                }
                try {
                    var resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
                    var templatePromise = this.resourceLoader.preload(resourceUrl);
                    // If the preload worked, then actually load and parse the template, and wait for any style
                    // URLs to resolve.
                    if (templatePromise !== undefined) {
                        return templatePromise.then(function () {
                            var templateDecl = _this.parseTemplateDeclaration(decorator, component, containingFile);
                            var template = _this.extractTemplate(node, templateDecl);
                            _this.preanalyzeTemplateCache.set(node, template);
                            return template;
                        });
                    }
                    else {
                        return Promise.resolve(null);
                    }
                }
                catch (e) {
                    throw this.makeResourceNotFoundError(templateUrl, templateUrlExpr, 0 /* Template */);
                }
            }
            else {
                var templateDecl = this.parseTemplateDeclaration(decorator, component, containingFile);
                var template = this.extractTemplate(node, templateDecl);
                this.preanalyzeTemplateCache.set(node, template);
                return Promise.resolve(template);
            }
        };
        ComponentDecoratorHandler.prototype.extractTemplate = function (node, template) {
            if (template.isInline) {
                var templateStr = void 0;
                var templateLiteral = null;
                var templateUrl = '';
                var templateRange = null;
                var sourceMapping = void 0;
                var escapedString = false;
                // We only support SourceMaps for inline templates that are simple string literals.
                if (ts.isStringLiteral(template.expression) ||
                    ts.isNoSubstitutionTemplateLiteral(template.expression)) {
                    // the start and end of the `templateExpr` node includes the quotation marks, which we must
                    // strip
                    templateRange = getTemplateRange(template.expression);
                    templateStr = template.expression.getSourceFile().text;
                    templateLiteral = template.expression;
                    templateUrl = template.templateUrl;
                    escapedString = true;
                    sourceMapping = {
                        type: 'direct',
                        node: template.expression,
                    };
                }
                else {
                    var resolvedTemplate = this.evaluator.evaluate(template.expression);
                    if (typeof resolvedTemplate !== 'string') {
                        throw diagnostics_2.createValueHasWrongTypeError(template.expression, resolvedTemplate, 'template must be a string');
                    }
                    templateStr = resolvedTemplate;
                    sourceMapping = {
                        type: 'indirect',
                        node: template.expression,
                        componentClass: node,
                        template: templateStr,
                    };
                }
                return tslib_1.__assign(tslib_1.__assign({}, this._parseTemplate(template, templateStr, templateRange, escapedString)), { sourceMapping: sourceMapping, declaration: template });
            }
            else {
                var templateStr = this.resourceLoader.load(template.resolvedTemplateUrl);
                if (this.depTracker !== null) {
                    this.depTracker.addResourceDependency(node.getSourceFile(), file_system_1.absoluteFrom(template.resolvedTemplateUrl));
                }
                return tslib_1.__assign(tslib_1.__assign({}, this._parseTemplate(template, templateStr, /* templateRange */ null, 
                /* escapedString */ false)), { sourceMapping: {
                        type: 'external',
                        componentClass: node,
                        // TODO(alxhub): TS in g3 is unable to make this inference on its own, so cast it here
                        // until g3 is able to figure this out.
                        node: template.templateUrlExpression,
                        template: templateStr,
                        templateUrl: template.resolvedTemplateUrl,
                    }, declaration: template });
            }
        };
        ComponentDecoratorHandler.prototype._parseTemplate = function (template, templateStr, templateRange, escapedString) {
            // We always normalize line endings if the template has been escaped (i.e. is inline).
            var i18nNormalizeLineEndingsInICUs = escapedString || this.i18nNormalizeLineEndingsInICUs;
            var parsedTemplate = compiler_1.parseTemplate(templateStr, template.sourceMapUrl, {
                preserveWhitespaces: template.preserveWhitespaces,
                interpolationConfig: template.interpolationConfig,
                range: templateRange !== null && templateRange !== void 0 ? templateRange : undefined,
                escapedString: escapedString,
                enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
                i18nNormalizeLineEndingsInICUs: i18nNormalizeLineEndingsInICUs,
                isInline: template.isInline,
                alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
            });
            // Unfortunately, the primary parse of the template above may not contain accurate source map
            // information. If used directly, it would result in incorrect code locations in template
            // errors, etc. There are three main problems:
            //
            // 1. `preserveWhitespaces: false` annihilates the correctness of template source mapping, as
            //    the whitespace transformation changes the contents of HTML text nodes before they're
            //    parsed into Angular expressions.
            // 2. `preserveLineEndings: false` causes growing misalignments in templates that use '\r\n'
            //    line endings, by normalizing them to '\n'.
            // 3. By default, the template parser strips leading trivia characters (like spaces, tabs, and
            //    newlines). This also destroys source mapping information.
            //
            // In order to guarantee the correctness of diagnostics, templates are parsed a second time
            // with the above options set to preserve source mappings.
            var diagNodes = compiler_1.parseTemplate(templateStr, template.sourceMapUrl, {
                preserveWhitespaces: true,
                preserveLineEndings: true,
                interpolationConfig: template.interpolationConfig,
                range: templateRange !== null && templateRange !== void 0 ? templateRange : undefined,
                escapedString: escapedString,
                enableI18nLegacyMessageIdFormat: this.enableI18nLegacyMessageIdFormat,
                i18nNormalizeLineEndingsInICUs: i18nNormalizeLineEndingsInICUs,
                leadingTriviaChars: [],
                isInline: template.isInline,
                alwaysAttemptHtmlToR3AstConversion: this.usePoisonedData,
            }).nodes;
            return tslib_1.__assign(tslib_1.__assign({}, parsedTemplate), { diagNodes: diagNodes, template: template.isInline ? new compiler_1.WrappedNodeExpr(template.expression) : templateStr, templateUrl: template.resolvedTemplateUrl, isInline: template.isInline, file: new compiler_1.ParseSourceFile(templateStr, template.resolvedTemplateUrl) });
        };
        ComponentDecoratorHandler.prototype.parseTemplateDeclaration = function (decorator, component, containingFile) {
            var preserveWhitespaces = this.defaultPreserveWhitespaces;
            if (component.has('preserveWhitespaces')) {
                var expr = component.get('preserveWhitespaces');
                var value = this.evaluator.evaluate(expr);
                if (typeof value !== 'boolean') {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, 'preserveWhitespaces must be a boolean');
                }
                preserveWhitespaces = value;
            }
            var interpolationConfig = compiler_1.DEFAULT_INTERPOLATION_CONFIG;
            if (component.has('interpolation')) {
                var expr = component.get('interpolation');
                var value = this.evaluator.evaluate(expr);
                if (!Array.isArray(value) || value.length !== 2 ||
                    !value.every(function (element) { return typeof element === 'string'; })) {
                    throw diagnostics_2.createValueHasWrongTypeError(expr, value, 'interpolation must be an array with 2 elements of string type');
                }
                interpolationConfig = compiler_1.InterpolationConfig.fromArray(value);
            }
            if (component.has('templateUrl')) {
                var templateUrlExpr = component.get('templateUrl');
                var templateUrl = this.evaluator.evaluate(templateUrlExpr);
                if (typeof templateUrl !== 'string') {
                    throw diagnostics_2.createValueHasWrongTypeError(templateUrlExpr, templateUrl, 'templateUrl must be a string');
                }
                try {
                    var resourceUrl = this.resourceLoader.resolve(templateUrl, containingFile);
                    return {
                        isInline: false,
                        interpolationConfig: interpolationConfig,
                        preserveWhitespaces: preserveWhitespaces,
                        templateUrl: templateUrl,
                        templateUrlExpression: templateUrlExpr,
                        resolvedTemplateUrl: resourceUrl,
                        sourceMapUrl: sourceMapUrl(resourceUrl),
                    };
                }
                catch (e) {
                    throw this.makeResourceNotFoundError(templateUrl, templateUrlExpr, 0 /* Template */);
                }
            }
            else if (component.has('template')) {
                return {
                    isInline: true,
                    interpolationConfig: interpolationConfig,
                    preserveWhitespaces: preserveWhitespaces,
                    expression: component.get('template'),
                    templateUrl: containingFile,
                    resolvedTemplateUrl: containingFile,
                    sourceMapUrl: containingFile,
                };
            }
            else {
                throw new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_MISSING_TEMPLATE, reflection_1.Decorator.nodeForError(decorator), 'component is missing a template');
            }
        };
        ComponentDecoratorHandler.prototype._resolveImportedFile = function (importedFile, expr, origin) {
            // If `importedFile` is not 'unknown' then it accurately reflects the source file that is
            // being imported.
            if (importedFile !== 'unknown') {
                return importedFile;
            }
            // Otherwise `expr` has to be inspected to determine the file that is being imported. If `expr`
            // is not an `ExternalExpr` then it does not correspond with an import, so return null in that
            // case.
            if (!(expr instanceof compiler_1.ExternalExpr)) {
                return null;
            }
            // Figure out what file is being imported.
            return this.moduleResolver.resolveModule(expr.value.moduleName, origin.fileName);
        };
        /**
         * Check whether adding an import from `origin` to the source-file corresponding to `expr` would
         * create a cyclic import.
         *
         * @returns a `Cycle` object if a cycle would be created, otherwise `null`.
         */
        ComponentDecoratorHandler.prototype._checkForCyclicImport = function (importedFile, expr, origin) {
            var imported = this._resolveImportedFile(importedFile, expr, origin);
            if (imported === null) {
                return null;
            }
            // Check whether the import is legal.
            return this.cycleAnalyzer.wouldCreateCycle(origin, imported);
        };
        ComponentDecoratorHandler.prototype._recordSyntheticImport = function (importedFile, expr, origin) {
            var imported = this._resolveImportedFile(importedFile, expr, origin);
            if (imported === null) {
                return;
            }
            this.cycleAnalyzer.recordSyntheticImport(origin, imported);
        };
        ComponentDecoratorHandler.prototype.makeResourceNotFoundError = function (file, nodeForError, resourceType) {
            var errorText;
            switch (resourceType) {
                case 0 /* Template */:
                    errorText = "Could not find template file '" + file + "'.";
                    break;
                case 1 /* StylesheetFromTemplate */:
                    errorText = "Could not find stylesheet file '" + file + "' linked from the template.";
                    break;
                case 2 /* StylesheetFromDecorator */:
                    errorText = "Could not find stylesheet file '" + file + "'.";
                    break;
            }
            return new diagnostics_1.FatalDiagnosticError(diagnostics_1.ErrorCode.COMPONENT_RESOURCE_NOT_FOUND, nodeForError, errorText);
        };
        ComponentDecoratorHandler.prototype._extractTemplateStyleUrls = function (template) {
            if (template.styleUrls === null) {
                return [];
            }
            var nodeForError = getTemplateDeclarationNodeForError(template.declaration);
            return template.styleUrls.map(function (url) { return ({ url: url, source: 1 /* StylesheetFromTemplate */, nodeForError: nodeForError }); });
        };
        return ComponentDecoratorHandler;
    }());
    exports.ComponentDecoratorHandler = ComponentDecoratorHandler;
    function getTemplateRange(templateExpr) {
        var startPos = templateExpr.getStart() + 1;
        var _a = ts.getLineAndCharacterOfPosition(templateExpr.getSourceFile(), startPos), line = _a.line, character = _a.character;
        return {
            startPos: startPos,
            startLine: line,
            startCol: character,
            endPos: templateExpr.getEnd() - 1,
        };
    }
    function sourceMapUrl(resourceUrl) {
        if (!ts_source_map_bug_29300_1.tsSourceMapBug29300Fixed()) {
            // By removing the template URL we are telling the translator not to try to
            // map the external source file to the generated code, since the version
            // of TS that is running does not support it.
            return '';
        }
        else {
            return resourceUrl;
        }
    }
    /** Determines if the result of an evaluation is a string array. */
    function isStringArray(resolvedValue) {
        return Array.isArray(resolvedValue) && resolvedValue.every(function (elem) { return typeof elem === 'string'; });
    }
    /** Determines the node to use for debugging purposes for the given TemplateDeclaration. */
    function getTemplateDeclarationNodeForError(declaration) {
        // TODO(zarend): Change this to if/else when that is compatible with g3. This uses a switch
        // because if/else fails to compile on g3. That is because g3 compiles this in non-strict mode
        // where type inference does not work correctly.
        switch (declaration.isInline) {
            case true:
                return declaration.expression;
            case false:
                return declaration.templateUrlExpression;
        }
    }
    /**
     * Generate a diagnostic related information object that describes a potential cyclic import path.
     */
    function makeCyclicImportInfo(ref, type, cycle) {
        var name = ref.debugName || '(unknown)';
        var path = cycle.getPath().map(function (sf) { return sf.fileName; }).join(' -> ');
        var message = "The " + type + " '" + name + "' is used in the template but importing it would create a cycle: ";
        return diagnostics_1.makeRelatedInformation(ref.node, message + path);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9hbm5vdGF0aW9ucy9zcmMvY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBb2Y7SUFDcGYsK0JBQWlDO0lBR2pDLDJFQUEwRztJQUMxRywyRUFBeUQ7SUFDekQsbUVBQXdGO0lBRXhGLDZGQUEySztJQUUzSyxxRUFBcU87SUFDck8sdUZBQW1GO0lBQ25GLDZEQUFtRDtJQUNuRCx5RUFBb0g7SUFFcEgsdUVBQThJO0lBRTlJLDRHQUFnRjtJQUloRiwyRkFBNEc7SUFDNUcsdUZBQTRGO0lBQzVGLG1GQUFtRDtJQUNuRCxxRkFBd0Q7SUFDeEQsdUZBQTJDO0lBQzNDLDZFQUFzTTtJQUV0TSxJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztJQUNoRCxJQUFNLFdBQVcsR0FBVSxFQUFFLENBQUM7SUErRTlCOztPQUVHO0lBQ0g7UUFBcUMsMkNBQWU7UUFBcEQ7WUFBQSxxRUFxRUM7WUFwRUMsb0JBQWMsR0FBd0IsRUFBRSxDQUFDO1lBQ3pDLGVBQVMsR0FBd0IsRUFBRSxDQUFDO1lBQ3BDLHNCQUFnQixHQUFHLEtBQUssQ0FBQzs7UUFrRTNCLENBQUM7UUFoRUMsd0NBQWMsR0FBZCxVQUFlLGNBQThCLEVBQUUsaUJBQXNDO1lBQ25GLElBQUksQ0FBQyxDQUFDLGNBQWMsWUFBWSxlQUFlLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELHNGQUFzRjtZQUN0Riw4RkFBOEY7WUFDOUYsWUFBWTtZQUNaLElBQU0sa0JBQWtCLEdBQUcsVUFBQyxPQUEwQixFQUFFLFFBQTJCO2dCQUMvRSxPQUFBLGlDQUFnQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFD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QyxDQUFDO0lBQzFELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtjb21waWxlQ29tcG9uZW50RnJvbU1ldGFkYXRhLCBjb21waWxlRGVjbGFyZUNvbXBvbmVudEZyb21NZXRhZGF0YSwgQ29uc3RhbnRQb29sLCBDc3NTZWxlY3RvciwgRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUsIERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSwgRXhwcmVzc2lvbiwgRXh0ZXJuYWxFeHByLCBJZGVudGlmaWVycywgSW50ZXJwb2xhdGlvbkNvbmZpZywgTGV4ZXJSYW5nZSwgbWFrZUJpbmRpbmdQYXJzZXIsIFBhcnNlZFRlbXBsYXRlLCBQYXJzZVNvdXJjZUZpbGUsIHBhcnNlVGVtcGxhdGUsIFIzQ29tcG9uZW50RGVmLCBSM0NvbXBvbmVudE1ldGFkYXRhLCBSM0ZhY3RvcnlUYXJnZXQsIFIzVGFyZ2V0QmluZGVyLCBSM1VzZWREaXJlY3RpdmVNZXRhZGF0YSwgU2VsZWN0b3JNYXRjaGVyLCBTdGF0ZW1lbnQsIFRtcGxBc3ROb2RlLCBXcmFwcGVkTm9kZUV4cHJ9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0N5Y2xlLCBDeWNsZUFuYWx5emVyLCBDeWNsZUhhbmRsaW5nU3RyYXRlZ3l9IGZyb20gJy4uLy4uL2N5Y2xlcyc7XG5pbXBvcnQge0Vycm9yQ29kZSwgRmF0YWxEaWFnbm9zdGljRXJyb3IsIG1ha2VEaWFnbm9zdGljLCBtYWtlUmVsYXRlZEluZm9ybWF0aW9ufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge2Fic29sdXRlRnJvbSwgcmVsYXRpdmV9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7SW1wb3J0ZWRGaWxlLCBNb2R1bGVSZXNvbHZlciwgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGVwZW5kZW5jeVRyYWNrZXJ9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge2V4dHJhY3RTZW1hbnRpY1R5cGVQYXJhbWV0ZXJzLCBpc0FycmF5RXF1YWwsIGlzUmVmZXJlbmNlRXF1YWwsIFNlbWFudGljRGVwR3JhcGhVcGRhdGVyLCBTZW1hbnRpY1JlZmVyZW5jZSwgU2VtYW50aWNTeW1ib2x9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL3NlbWFudGljX2dyYXBoJztcbmltcG9ydCB7SW5kZXhpbmdDb250ZXh0fSBmcm9tICcuLi8uLi9pbmRleGVyJztcbmltcG9ydCB7Q2xhc3NQcm9wZXJ0eU1hcHBpbmcsIENvbXBvbmVudFJlc291cmNlcywgRGlyZWN0aXZlTWV0YSwgRGlyZWN0aXZlVHlwZUNoZWNrTWV0YSwgZXh0cmFjdERpcmVjdGl2ZVR5cGVDaGVja01ldGEsIEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBNZXRhZGF0YVJlYWRlciwgTWV0YWRhdGFSZWdpc3RyeSwgUmVzb3VyY2UsIFJlc291cmNlUmVnaXN0cnl9IGZyb20gJy4uLy4uL21ldGFkYXRhJztcbmltcG9ydCB7RW51bVZhbHVlLCBQYXJ0aWFsRXZhbHVhdG9yLCBSZXNvbHZlZFZhbHVlfSBmcm9tICcuLi8uLi9wYXJ0aWFsX2V2YWx1YXRvcic7XG5pbXBvcnQge1BlcmZFdmVudCwgUGVyZlJlY29yZGVyfSBmcm9tICcuLi8uLi9wZXJmJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgRGVjbGFyYXRpb25Ob2RlLCBEZWNvcmF0b3IsIFJlZmxlY3Rpb25Ib3N0LCByZWZsZWN0T2JqZWN0TGl0ZXJhbH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudFNjb3BlUmVhZGVyLCBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnksIFR5cGVDaGVja1Njb3BlUmVnaXN0cnl9IGZyb20gJy4uLy4uL3Njb3BlJztcbmltcG9ydCB7QW5hbHlzaXNPdXRwdXQsIENvbXBpbGVSZXN1bHQsIERlY29yYXRvckhhbmRsZXIsIERldGVjdFJlc3VsdCwgSGFuZGxlckZsYWdzLCBIYW5kbGVyUHJlY2VkZW5jZSwgUmVzb2x2ZVJlc3VsdH0gZnJvbSAnLi4vLi4vdHJhbnNmb3JtJztcbmltcG9ydCB7VGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBUeXBlQ2hlY2tDb250ZXh0fSBmcm9tICcuLi8uLi90eXBlY2hlY2svYXBpJztcbmltcG9ydCB7dHNTb3VyY2VNYXBCdWcyOTMwMEZpeGVkfSBmcm9tICcuLi8uLi91dGlsL3NyYy90c19zb3VyY2VfbWFwX2J1Z18yOTMwMCc7XG5pbXBvcnQge1N1YnNldE9mS2V5c30gZnJvbSAnLi4vLi4vdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVzb3VyY2VMb2FkZXJ9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7Y3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvciwgZ2V0RGlyZWN0aXZlRGlhZ25vc3RpY3MsIGdldFByb3ZpZGVyRGlhZ25vc3RpY3N9IGZyb20gJy4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtEaXJlY3RpdmVTeW1ib2wsIGV4dHJhY3REaXJlY3RpdmVNZXRhZGF0YSwgcGFyc2VGaWVsZEFycmF5VmFsdWV9IGZyb20gJy4vZGlyZWN0aXZlJztcbmltcG9ydCB7Y29tcGlsZU5nRmFjdG9yeURlZkZpZWxkfSBmcm9tICcuL2ZhY3RvcnknO1xuaW1wb3J0IHtnZW5lcmF0ZVNldENsYXNzTWV0YWRhdGFDYWxsfSBmcm9tICcuL21ldGFkYXRhJztcbmltcG9ydCB7TmdNb2R1bGVTeW1ib2x9IGZyb20gJy4vbmdfbW9kdWxlJztcbmltcG9ydCB7ZmluZEFuZ3VsYXJEZWNvcmF0b3IsIGlzQW5ndWxhckNvcmVSZWZlcmVuY2UsIGlzRXhwcmVzc2lvbkZvcndhcmRSZWZlcmVuY2UsIHJlYWRCYXNlQ2xhc3MsIHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LCB1bndyYXBFeHByZXNzaW9uLCB3cmFwRnVuY3Rpb25FeHByZXNzaW9uc0luUGFyZW5zfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBFTVBUWV9NQVAgPSBuZXcgTWFwPHN0cmluZywgRXhwcmVzc2lvbj4oKTtcbmNvbnN0IEVNUFRZX0FSUkFZOiBhbnlbXSA9IFtdO1xuXG4vKipcbiAqIFRoZXNlIGZpZWxkcyBvZiBgUjNDb21wb25lbnRNZXRhZGF0YWAgYXJlIHVwZGF0ZWQgaW4gdGhlIGByZXNvbHZlYCBwaGFzZS5cbiAqXG4gKiBUaGUgYGtleW9mIFIzQ29tcG9uZW50TWV0YWRhdGEgJmAgY29uZGl0aW9uIGVuc3VyZXMgdGhhdCBvbmx5IGZpZWxkcyBvZiBgUjNDb21wb25lbnRNZXRhZGF0YWAgY2FuXG4gKiBiZSBpbmNsdWRlZCBoZXJlLlxuICovXG5leHBvcnQgdHlwZSBDb21wb25lbnRNZXRhZGF0YVJlc29sdmVkRmllbGRzID1cbiAgICBTdWJzZXRPZktleXM8UjNDb21wb25lbnRNZXRhZGF0YSwgJ2RpcmVjdGl2ZXMnfCdwaXBlcyd8J2RlY2xhcmF0aW9uTGlzdEVtaXRNb2RlJz47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50QW5hbHlzaXNEYXRhIHtcbiAgLyoqXG4gICAqIGBtZXRhYCBpbmNsdWRlcyB0aG9zZSBmaWVsZHMgb2YgYFIzQ29tcG9uZW50TWV0YWRhdGFgIHdoaWNoIGFyZSBjYWxjdWxhdGVkIGF0IGBhbmFseXplYCB0aW1lXG4gICAqIChub3QgZHVyaW5nIHJlc29sdmUpLlxuICAgKi9cbiAgbWV0YTogT21pdDxSM0NvbXBvbmVudE1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YVJlc29sdmVkRmllbGRzPjtcbiAgYmFzZUNsYXNzOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj58J2R5bmFtaWMnfG51bGw7XG4gIHR5cGVDaGVja01ldGE6IERpcmVjdGl2ZVR5cGVDaGVja01ldGE7XG4gIHRlbXBsYXRlOiBQYXJzZWRUZW1wbGF0ZVdpdGhTb3VyY2U7XG4gIG1ldGFkYXRhU3RtdDogU3RhdGVtZW50fG51bGw7XG5cbiAgaW5wdXRzOiBDbGFzc1Byb3BlcnR5TWFwcGluZztcbiAgb3V0cHV0czogQ2xhc3NQcm9wZXJ0eU1hcHBpbmc7XG5cbiAgLyoqXG4gICAqIFByb3ZpZGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgYHByb3ZpZGVyc2AgZmllbGQgb2YgdGhlIGNvbXBvbmVudCBhbm5vdGF0aW9uIHdoaWNoIHdpbGwgcmVxdWlyZVxuICAgKiBhbiBBbmd1bGFyIGZhY3RvcnkgZGVmaW5pdGlvbiBhdCBydW50aW1lLlxuICAgKi9cbiAgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeTogU2V0PFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPj58bnVsbDtcblxuICAvKipcbiAgICogUHJvdmlkZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBgdmlld1Byb3ZpZGVyc2AgZmllbGQgb2YgdGhlIGNvbXBvbmVudCBhbm5vdGF0aW9uIHdoaWNoIHdpbGxcbiAgICogcmVxdWlyZSBhbiBBbmd1bGFyIGZhY3RvcnkgZGVmaW5pdGlvbiBhdCBydW50aW1lLlxuICAgKi9cbiAgdmlld1Byb3ZpZGVyc1JlcXVpcmluZ0ZhY3Rvcnk6IFNldDxSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+fG51bGw7XG5cbiAgcmVzb3VyY2VzOiBDb21wb25lbnRSZXNvdXJjZXM7XG5cbiAgLyoqXG4gICAqIGBzdHlsZVVybHNgIGV4dHJhY3RlZCBmcm9tIHRoZSBkZWNvcmF0b3IsIGlmIHByZXNlbnQuXG4gICAqL1xuICBzdHlsZVVybHM6IFN0eWxlVXJsTWV0YVtdfG51bGw7XG5cbiAgLyoqXG4gICAqIElubGluZSBzdHlsZXNoZWV0cyBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjb3JhdG9yLCBpZiBwcmVzZW50LlxuICAgKi9cbiAgaW5saW5lU3R5bGVzOiBzdHJpbmdbXXxudWxsO1xuXG4gIGlzUG9pc29uZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIENvbXBvbmVudFJlc29sdXRpb25EYXRhID0gUGljazxSM0NvbXBvbmVudE1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YVJlc29sdmVkRmllbGRzPjtcblxuLyoqXG4gKiBUaGUgbGl0ZXJhbCBzdHlsZSB1cmwgZXh0cmFjdGVkIGZyb20gdGhlIGRlY29yYXRvciwgYWxvbmcgd2l0aCBtZXRhZGF0YSBmb3IgZGlhZ25vc3RpY3MuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU3R5bGVVcmxNZXRhIHtcbiAgdXJsOiBzdHJpbmc7XG4gIG5vZGVGb3JFcnJvcjogdHMuTm9kZTtcbiAgc291cmNlOiBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5TdHlsZXNoZWV0RnJvbVRlbXBsYXRlfFxuICAgICAgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3I7XG59XG5cbi8qKlxuICogSW5mb3JtYXRpb24gYWJvdXQgdGhlIG9yaWdpbiBvZiBhIHJlc291cmNlIGluIHRoZSBhcHBsaWNhdGlvbiBjb2RlLiBUaGlzIGlzIHVzZWQgZm9yIGNyZWF0aW5nXG4gKiBkaWFnbm9zdGljcywgc28gd2UgY2FuIHBvaW50IHRvIHRoZSByb290IGNhdXNlIG9mIGFuIGVycm9yIGluIHRoZSBhcHBsaWNhdGlvbiBjb2RlLlxuICpcbiAqIEEgdGVtcGxhdGUgcmVzb3VyY2UgY29tZXMgZnJvbSB0aGUgYHRlbXBsYXRlVXJsYCBwcm9wZXJ0eSBvbiB0aGUgY29tcG9uZW50IGRlY29yYXRvci5cbiAqXG4gKiBTdHlsZXNoZWV0cyByZXNvdXJjZXMgY2FuIGNvbWUgZnJvbSBlaXRoZXIgdGhlIGBzdHlsZVVybHNgIHByb3BlcnR5IG9uIHRoZSBjb21wb25lbnQgZGVjb3JhdG9yLFxuICogb3IgZnJvbSBpbmxpbmUgYHN0eWxlYCB0YWdzIGFuZCBzdHlsZSBsaW5rcyBvbiB0aGUgZXh0ZXJuYWwgdGVtcGxhdGUuXG4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzIHtcbiAgVGVtcGxhdGUsXG4gIFN0eWxlc2hlZXRGcm9tVGVtcGxhdGUsXG4gIFN0eWxlc2hlZXRGcm9tRGVjb3JhdG9yLFxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRTeW1ib2wgZXh0ZW5kcyBEaXJlY3RpdmVTeW1ib2wge1xuICB1c2VkRGlyZWN0aXZlczogU2VtYW50aWNSZWZlcmVuY2VbXSA9IFtdO1xuICB1c2VkUGlwZXM6IFNlbWFudGljUmVmZXJlbmNlW10gPSBbXTtcbiAgaXNSZW1vdGVseVNjb3BlZCA9IGZhbHNlO1xuXG4gIGlzRW1pdEFmZmVjdGVkKHByZXZpb3VzU3ltYm9sOiBTZW1hbnRpY1N5bWJvbCwgcHVibGljQXBpQWZmZWN0ZWQ6IFNldDxTZW1hbnRpY1N5bWJvbD4pOiBib29sZWFuIHtcbiAgICBpZiAoIShwcmV2aW91c1N5bWJvbCBpbnN0YW5jZW9mIENvbXBvbmVudFN5bWJvbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbiBlcXVhbGl0eSBmdW5jdGlvbiB0aGF0IGNvbnNpZGVycyBzeW1ib2xzIGVxdWFsIGlmIHRoZXkgcmVwcmVzZW50IHRoZSBzYW1lXG4gICAgLy8gZGVjbGFyYXRpb24sIGJ1dCBvbmx5IGlmIHRoZSBzeW1ib2wgaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb24gZG9lcyBub3QgaGF2ZSBpdHMgcHVibGljIEFQSVxuICAgIC8vIGFmZmVjdGVkLlxuICAgIGNvbnN0IGlzU3ltYm9sVW5hZmZlY3RlZCA9IChjdXJyZW50OiBTZW1hbnRpY1JlZmVyZW5jZSwgcHJldmlvdXM6IFNlbWFudGljUmVmZXJlbmNlKSA9PlxuICAgICAgICBpc1JlZmVyZW5jZUVxdWFsKGN1cnJlbnQsIHByZXZpb3VzKSAmJiAhcHVibGljQXBpQWZmZWN0ZWQuaGFzKGN1cnJlbnQuc3ltYm9sKTtcblxuICAgIC8vIFRoZSBlbWl0IG9mIGEgY29tcG9uZW50IGlzIGFmZmVjdGVkIGlmIGVpdGhlciBvZiB0aGUgZm9sbG93aW5nIGlzIHRydWU6XG4gICAgLy8gIDEuIFRoZSBjb21wb25lbnQgdXNlZCB0byBiZSByZW1vdGVseSBzY29wZWQgYnV0IG5vIGxvbmdlciBpcywgb3IgdmljZSB2ZXJzYS5cbiAgICAvLyAgMi4gVGhlIGxpc3Qgb2YgdXNlZCBkaXJlY3RpdmVzIGhhcyBjaGFuZ2VkIG9yIGFueSBvZiB0aG9zZSBkaXJlY3RpdmVzIGhhdmUgaGFkIHRoZWlyIHB1YmxpY1xuICAgIC8vICAgICBBUEkgY2hhbmdlZC4gSWYgdGhlIHVzZWQgZGlyZWN0aXZlcyBoYXZlIGJlZW4gcmVvcmRlcmVkIGJ1dCBub3Qgb3RoZXJ3aXNlIGFmZmVjdGVkIHRoZW5cbiAgICAvLyAgICAgdGhlIGNvbXBvbmVudCBtdXN0IHN0aWxsIGJlIHJlLWVtaXR0ZWQsIGFzIHRoaXMgbWF5IGFmZmVjdCBkaXJlY3RpdmUgaW5zdGFudGlhdGlvbiBvcmRlci5cbiAgICAvLyAgMy4gVGhlIGxpc3Qgb2YgdXNlZCBwaXBlcyBoYXMgY2hhbmdlZCwgb3IgYW55IG9mIHRob3NlIHBpcGVzIGhhdmUgaGFkIHRoZWlyIHB1YmxpYyBBUElcbiAgICAvLyAgICAgY2hhbmdlZC5cbiAgICByZXR1cm4gdGhpcy5pc1JlbW90ZWx5U2NvcGVkICE9PSBwcmV2aW91c1N5bWJvbC5pc1JlbW90ZWx5U2NvcGVkIHx8XG4gICAgICAgICFpc0FycmF5RXF1YWwodGhpcy51c2VkRGlyZWN0aXZlcywgcHJldmlvdXNTeW1ib2wudXNlZERpcmVjdGl2ZXMsIGlzU3ltYm9sVW5hZmZlY3RlZCkgfHxcbiAgICAgICAgIWlzQXJyYXlFcXVhbCh0aGlzLnVzZWRQaXBlcywgcHJldmlvdXNTeW1ib2wudXNlZFBpcGVzLCBpc1N5bWJvbFVuYWZmZWN0ZWQpO1xuICB9XG5cbiAgaXNUeXBlQ2hlY2tCbG9ja0FmZmVjdGVkKFxuICAgICAgcHJldmlvdXNTeW1ib2w6IFNlbWFudGljU3ltYm9sLCB0eXBlQ2hlY2tBcGlBZmZlY3RlZDogU2V0PFNlbWFudGljU3ltYm9sPik6IGJvb2xlYW4ge1xuICAgIGlmICghKHByZXZpb3VzU3ltYm9sIGluc3RhbmNlb2YgQ29tcG9uZW50U3ltYm9sKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gVG8gdmVyaWZ5IHRoYXQgYSB1c2VkIGRpcmVjdGl2ZSBpcyBub3QgYWZmZWN0ZWQgd2UgbmVlZCB0byB2ZXJpZnkgdGhhdCBpdHMgZnVsbCBpbmhlcml0YW5jZVxuICAgIC8vIGNoYWluIGlzIG5vdCBwcmVzZW50IGluIGB0eXBlQ2hlY2tBcGlBZmZlY3RlZGAuXG4gICAgY29uc3QgaXNJbmhlcml0YW5jZUNoYWluQWZmZWN0ZWQgPSAoc3ltYm9sOiBTZW1hbnRpY1N5bWJvbCk6IGJvb2xlYW4gPT4ge1xuICAgICAgbGV0IGN1cnJlbnRTeW1ib2w6IFNlbWFudGljU3ltYm9sfG51bGwgPSBzeW1ib2w7XG4gICAgICB3aGlsZSAoY3VycmVudFN5bWJvbCBpbnN0YW5jZW9mIERpcmVjdGl2ZVN5bWJvbCkge1xuICAgICAgICBpZiAodHlwZUNoZWNrQXBpQWZmZWN0ZWQuaGFzKGN1cnJlbnRTeW1ib2wpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY3VycmVudFN5bWJvbCA9IGN1cnJlbnRTeW1ib2wuYmFzZUNsYXNzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBhbiBlcXVhbGl0eSBmdW5jdGlvbiB0aGF0IGNvbnNpZGVycyBkaXJlY3RpdmVzIGVxdWFsIGlmIHRoZXkgcmVwcmVzZW50IHRoZSBzYW1lXG4gICAgLy8gZGVjbGFyYXRpb24gYW5kIGlmIHRoZSBzeW1ib2wgYW5kIGFsbCBzeW1ib2xzIGl0IGluaGVyaXRzIGZyb20gaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb25cbiAgICAvLyBkbyBub3QgaGF2ZSB0aGVpciB0eXBlLWNoZWNrIEFQSSBhZmZlY3RlZC5cbiAgICBjb25zdCBpc0RpcmVjdGl2ZVVuYWZmZWN0ZWQgPSAoY3VycmVudDogU2VtYW50aWNSZWZlcmVuY2UsIHByZXZpb3VzOiBTZW1hbnRpY1JlZmVyZW5jZSkgPT5cbiAgICAgICAgaXNSZWZlcmVuY2VFcXVhbChjdXJyZW50LCBwcmV2aW91cykgJiYgIWlzSW5oZXJpdGFuY2VDaGFpbkFmZmVjdGVkKGN1cnJlbnQuc3ltYm9sKTtcblxuICAgIC8vIENyZWF0ZSBhbiBlcXVhbGl0eSBmdW5jdGlvbiB0aGF0IGNvbnNpZGVycyBwaXBlcyBlcXVhbCBpZiB0aGV5IHJlcHJlc2VudCB0aGUgc2FtZVxuICAgIC8vIGRlY2xhcmF0aW9uIGFuZCBpZiB0aGUgc3ltYm9sIGluIHRoZSBjdXJyZW50IGNvbXBpbGF0aW9uIGRvZXMgbm90IGhhdmUgaXRzIHR5cGUtY2hlY2tcbiAgICAvLyBBUEkgYWZmZWN0ZWQuXG4gICAgY29uc3QgaXNQaXBlVW5hZmZlY3RlZCA9IChjdXJyZW50OiBTZW1hbnRpY1JlZmVyZW5jZSwgcHJldmlvdXM6IFNlbWFudGljUmVmZXJlbmNlKSA9PlxuICAgICAgICBpc1JlZmVyZW5jZUVxdWFsKGN1cnJlbnQsIHByZXZpb3VzKSAmJiAhdHlwZUNoZWNrQXBpQWZmZWN0ZWQuaGFzKGN1cnJlbnQuc3ltYm9sKTtcblxuICAgIC8vIFRoZSBlbWl0IG9mIGEgdHlwZS1jaGVjayBibG9jayBvZiBhIGNvbXBvbmVudCBpcyBhZmZlY3RlZCBpZiBlaXRoZXIgb2YgdGhlIGZvbGxvd2luZyBpcyB0cnVlOlxuICAgIC8vICAxLiBUaGUgbGlzdCBvZiB1c2VkIGRpcmVjdGl2ZXMgaGFzIGNoYW5nZWQgb3IgYW55IG9mIHRob3NlIGRpcmVjdGl2ZXMgaGF2ZSBoYWQgdGhlaXJcbiAgICAvLyAgICAgdHlwZS1jaGVjayBBUEkgY2hhbmdlZC5cbiAgICAvLyAgMi4gVGhlIGxpc3Qgb2YgdXNlZCBwaXBlcyBoYXMgY2hhbmdlZCwgb3IgYW55IG9mIHRob3NlIHBpcGVzIGhhdmUgaGFkIHRoZWlyIHR5cGUtY2hlY2sgQVBJXG4gICAgLy8gICAgIGNoYW5nZWQuXG4gICAgcmV0dXJuICFpc0FycmF5RXF1YWwoXG4gICAgICAgICAgICAgICB0aGlzLnVzZWREaXJlY3RpdmVzLCBwcmV2aW91c1N5bWJvbC51c2VkRGlyZWN0aXZlcywgaXNEaXJlY3RpdmVVbmFmZmVjdGVkKSB8fFxuICAgICAgICAhaXNBcnJheUVxdWFsKHRoaXMudXNlZFBpcGVzLCBwcmV2aW91c1N5bWJvbC51c2VkUGlwZXMsIGlzUGlwZVVuYWZmZWN0ZWQpO1xuICB9XG59XG5cbi8qKlxuICogYERlY29yYXRvckhhbmRsZXJgIHdoaWNoIGhhbmRsZXMgdGhlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50RGVjb3JhdG9ySGFuZGxlciBpbXBsZW1lbnRzXG4gICAgRGVjb3JhdG9ySGFuZGxlcjxEZWNvcmF0b3IsIENvbXBvbmVudEFuYWx5c2lzRGF0YSwgQ29tcG9uZW50U3ltYm9sLCBDb21wb25lbnRSZXNvbHV0aW9uRGF0YT4ge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgcHJpdmF0ZSBldmFsdWF0b3I6IFBhcnRpYWxFdmFsdWF0b3IsXG4gICAgICBwcml2YXRlIG1ldGFSZWdpc3RyeTogTWV0YWRhdGFSZWdpc3RyeSwgcHJpdmF0ZSBtZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlcixcbiAgICAgIHByaXZhdGUgc2NvcGVSZWFkZXI6IENvbXBvbmVudFNjb3BlUmVhZGVyLCBwcml2YXRlIHNjb3BlUmVnaXN0cnk6IExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgdHlwZUNoZWNrU2NvcGVSZWdpc3RyeTogVHlwZUNoZWNrU2NvcGVSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgcmVzb3VyY2VSZWdpc3RyeTogUmVzb3VyY2VSZWdpc3RyeSwgcHJpdmF0ZSBpc0NvcmU6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIHJlc291cmNlTG9hZGVyOiBSZXNvdXJjZUxvYWRlciwgcHJpdmF0ZSByb290RGlyczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgICAgcHJpdmF0ZSBkZWZhdWx0UHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbiwgcHJpdmF0ZSBpMThuVXNlRXh0ZXJuYWxJZHM6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQ6IGJvb2xlYW4sIHByaXZhdGUgdXNlUG9pc29uZWREYXRhOiBib29sZWFuLFxuICAgICAgcHJpdmF0ZSBpMThuTm9ybWFsaXplTGluZUVuZGluZ3NJbklDVXM6IGJvb2xlYW58dW5kZWZpbmVkLFxuICAgICAgcHJpdmF0ZSBtb2R1bGVSZXNvbHZlcjogTW9kdWxlUmVzb2x2ZXIsIHByaXZhdGUgY3ljbGVBbmFseXplcjogQ3ljbGVBbmFseXplcixcbiAgICAgIHByaXZhdGUgY3ljbGVIYW5kbGluZ1N0cmF0ZWd5OiBDeWNsZUhhbmRsaW5nU3RyYXRlZ3ksIHByaXZhdGUgcmVmRW1pdHRlcjogUmVmZXJlbmNlRW1pdHRlcixcbiAgICAgIHByaXZhdGUgZGVwVHJhY2tlcjogRGVwZW5kZW5jeVRyYWNrZXJ8bnVsbCxcbiAgICAgIHByaXZhdGUgaW5qZWN0YWJsZVJlZ2lzdHJ5OiBJbmplY3RhYmxlQ2xhc3NSZWdpc3RyeSxcbiAgICAgIHByaXZhdGUgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI6IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyfG51bGwsXG4gICAgICBwcml2YXRlIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuLCBwcml2YXRlIHBlcmY6IFBlcmZSZWNvcmRlcikge31cblxuICBwcml2YXRlIGxpdGVyYWxDYWNoZSA9IG5ldyBNYXA8RGVjb3JhdG9yLCB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBlbGVtZW50U2NoZW1hUmVnaXN0cnkgPSBuZXcgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5KCk7XG5cbiAgLyoqXG4gICAqIER1cmluZyB0aGUgYXN5bmNocm9ub3VzIHByZWFuYWx5emUgcGhhc2UsIGl0J3MgbmVjZXNzYXJ5IHRvIHBhcnNlIHRoZSB0ZW1wbGF0ZSB0byBleHRyYWN0XG4gICAqIGFueSBwb3RlbnRpYWwgPGxpbms+IHRhZ3Mgd2hpY2ggbWlnaHQgbmVlZCB0byBiZSBsb2FkZWQuIFRoaXMgY2FjaGUgZW5zdXJlcyB0aGF0IHdvcmsgaXMgbm90XG4gICAqIHRocm93biBhd2F5LCBhbmQgdGhlIHBhcnNlZCB0ZW1wbGF0ZSBpcyByZXVzZWQgZHVyaW5nIHRoZSBhbmFseXplIHBoYXNlLlxuICAgKi9cbiAgcHJpdmF0ZSBwcmVhbmFseXplVGVtcGxhdGVDYWNoZSA9IG5ldyBNYXA8RGVjbGFyYXRpb25Ob2RlLCBQYXJzZWRUZW1wbGF0ZVdpdGhTb3VyY2U+KCk7XG5cbiAgcmVhZG9ubHkgcHJlY2VkZW5jZSA9IEhhbmRsZXJQcmVjZWRlbmNlLlBSSU1BUlk7XG4gIHJlYWRvbmx5IG5hbWUgPSBDb21wb25lbnREZWNvcmF0b3JIYW5kbGVyLm5hbWU7XG5cbiAgZGV0ZWN0KG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwpOiBEZXRlY3RSZXN1bHQ8RGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICAgIGlmICghZGVjb3JhdG9ycykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgY29uc3QgZGVjb3JhdG9yID0gZmluZEFuZ3VsYXJEZWNvcmF0b3IoZGVjb3JhdG9ycywgJ0NvbXBvbmVudCcsIHRoaXMuaXNDb3JlKTtcbiAgICBpZiAoZGVjb3JhdG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyaWdnZXI6IGRlY29yYXRvci5ub2RlLFxuICAgICAgICBkZWNvcmF0b3IsXG4gICAgICAgIG1ldGFkYXRhOiBkZWNvcmF0b3IsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHByZWFuYWx5emUobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgZGVjb3JhdG9yOiBSZWFkb25seTxEZWNvcmF0b3I+KTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQge1xuICAgIC8vIEluIHByZWFuYWx5emUsIHJlc291cmNlIFVSTHMgYXNzb2NpYXRlZCB3aXRoIHRoZSBjb21wb25lbnQgYXJlIGFzeW5jaHJvbm91c2x5IHByZWxvYWRlZCB2aWFcbiAgICAvLyB0aGUgcmVzb3VyY2VMb2FkZXIuIFRoaXMgaXMgdGhlIG9ubHkgdGltZSBhc3luYyBvcGVyYXRpb25zIGFyZSBhbGxvd2VkIGZvciBhIGNvbXBvbmVudC5cbiAgICAvLyBUaGVzZSByZXNvdXJjZXMgYXJlOlxuICAgIC8vXG4gICAgLy8gLSB0aGUgdGVtcGxhdGVVcmwsIGlmIHRoZXJlIGlzIG9uZVxuICAgIC8vIC0gYW55IHN0eWxlVXJscyBpZiBwcmVzZW50XG4gICAgLy8gLSBhbnkgc3R5bGVzaGVldHMgcmVmZXJlbmNlZCBmcm9tIDxsaW5rPiB0YWdzIGluIHRoZSB0ZW1wbGF0ZSBpdHNlbGZcbiAgICAvL1xuICAgIC8vIEFzIGEgcmVzdWx0IG9mIHRoZSBsYXN0IG9uZSwgdGhlIHRlbXBsYXRlIG11c3QgYmUgcGFyc2VkIGFzIHBhcnQgb2YgcHJlYW5hbHlzaXMgdG8gZXh0cmFjdFxuICAgIC8vIDxsaW5rPiB0YWdzLCB3aGljaCBtYXkgaW52b2x2ZSB3YWl0aW5nIGZvciB0aGUgdGVtcGxhdGVVcmwgdG8gYmUgcmVzb2x2ZWQgZmlyc3QuXG5cbiAgICAvLyBJZiBwcmVsb2FkaW5nIGlzbid0IHBvc3NpYmxlLCB0aGVuIHNraXAgdGhpcyBzdGVwLlxuICAgIGlmICghdGhpcy5yZXNvdXJjZUxvYWRlci5jYW5QcmVsb2FkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGEgPSB0aGlzLl9yZXNvbHZlTGl0ZXJhbChkZWNvcmF0b3IpO1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHJlZmxlY3RPYmplY3RMaXRlcmFsKG1ldGEpO1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG5cbiAgICBjb25zdCByZXNvbHZlU3R5bGVVcmwgPSAoc3R5bGVVcmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHN0eWxlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgIHJldHVybiB0aGlzLnJlc291cmNlTG9hZGVyLnByZWxvYWQocmVzb3VyY2VVcmwpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IGZhaWx1cmVzIHRvIHByZWxvYWQuIFdlIGNhbiBoYW5kbGUgdGhpcyBwcm9ibGVtIGR1cmluZyBhbmFseXNpcyBieVxuICAgICAgICAvLyBwcm9kdWNpbmcgYSBkaWFnbm9zdGljLlxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIFByb21pc2UgdGhhdCB3YWl0cyBmb3IgdGhlIHRlbXBsYXRlIGFuZCBhbGwgPGxpbms+ZWQgc3R5bGVzIHdpdGhpbiBpdCB0byBiZSBwcmVsb2FkZWQuXG4gICAgY29uc3QgdGVtcGxhdGVBbmRUZW1wbGF0ZVN0eWxlUmVzb3VyY2VzID1cbiAgICAgICAgdGhpcy5fcHJlbG9hZEFuZFBhcnNlVGVtcGxhdGUobm9kZSwgZGVjb3JhdG9yLCBjb21wb25lbnQsIGNvbnRhaW5pbmdGaWxlKVxuICAgICAgICAgICAgLnRoZW4oKHRlbXBsYXRlOiBQYXJzZWRUZW1wbGF0ZVdpdGhTb3VyY2V8bnVsbCk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkID0+IHtcbiAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZW1wbGF0ZS5zdHlsZVVybHMubWFwKHN0eWxlVXJsID0+IHJlc29sdmVTdHlsZVVybChzdHlsZVVybCkpKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgLy8gRXh0cmFjdCBhbGwgdGhlIHN0eWxlVXJscyBpbiB0aGUgZGVjb3JhdG9yLlxuICAgIGNvbnN0IGNvbXBvbmVudFN0eWxlVXJscyA9IHRoaXMuX2V4dHJhY3RDb21wb25lbnRTdHlsZVVybHMoY29tcG9uZW50KTtcblxuICAgIGlmIChjb21wb25lbnRTdHlsZVVybHMgPT09IG51bGwpIHtcbiAgICAgIC8vIEEgZmFzdCBwYXRoIGV4aXN0cyBpZiB0aGVyZSBhcmUgbm8gc3R5bGVVcmxzLCB0byBqdXN0IHdhaXQgZm9yXG4gICAgICAvLyB0ZW1wbGF0ZUFuZFRlbXBsYXRlU3R5bGVSZXNvdXJjZXMuXG4gICAgICByZXR1cm4gdGVtcGxhdGVBbmRUZW1wbGF0ZVN0eWxlUmVzb3VyY2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXYWl0IGZvciBib3RoIHRoZSB0ZW1wbGF0ZSBhbmQgYWxsIHN0eWxlVXJsIHJlc291cmNlcyB0byByZXNvbHZlLlxuICAgICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgICAuYWxsKFtcbiAgICAgICAgICAgIHRlbXBsYXRlQW5kVGVtcGxhdGVTdHlsZVJlc291cmNlcyxcbiAgICAgICAgICAgIC4uLmNvbXBvbmVudFN0eWxlVXJscy5tYXAoc3R5bGVVcmwgPT4gcmVzb2x2ZVN0eWxlVXJsKHN0eWxlVXJsLnVybCkpXG4gICAgICAgICAgXSlcbiAgICAgICAgICAudGhlbigoKSA9PiB1bmRlZmluZWQpO1xuICAgIH1cbiAgfVxuXG4gIGFuYWx5emUoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IFJlYWRvbmx5PERlY29yYXRvcj4sXG4gICAgICBmbGFnczogSGFuZGxlckZsYWdzID0gSGFuZGxlckZsYWdzLk5PTkUpOiBBbmFseXNpc091dHB1dDxDb21wb25lbnRBbmFseXNpc0RhdGE+IHtcbiAgICB0aGlzLnBlcmYuZXZlbnRDb3VudChQZXJmRXZlbnQuQW5hbHl6ZUNvbXBvbmVudCk7XG4gICAgY29uc3QgY29udGFpbmluZ0ZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZTtcbiAgICB0aGlzLmxpdGVyYWxDYWNoZS5kZWxldGUoZGVjb3JhdG9yKTtcblxuICAgIGxldCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfHVuZGVmaW5lZDtcbiAgICBsZXQgaXNQb2lzb25lZCA9IGZhbHNlO1xuICAgIC8vIEBDb21wb25lbnQgaW5oZXJpdHMgQERpcmVjdGl2ZSwgc28gYmVnaW4gYnkgZXh0cmFjdGluZyB0aGUgQERpcmVjdGl2ZSBtZXRhZGF0YSBhbmQgYnVpbGRpbmdcbiAgICAvLyBvbiBpdC5cbiAgICBjb25zdCBkaXJlY3RpdmVSZXN1bHQgPSBleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGEoXG4gICAgICAgIG5vZGUsIGRlY29yYXRvciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yLCB0aGlzLmlzQ29yZSwgZmxhZ3MsXG4gICAgICAgIHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIsXG4gICAgICAgIHRoaXMuZWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmdldERlZmF1bHRDb21wb25lbnRFbGVtZW50TmFtZSgpKTtcbiAgICBpZiAoZGlyZWN0aXZlUmVzdWx0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIGBleHRyYWN0RGlyZWN0aXZlTWV0YWRhdGFgIHJldHVybnMgdW5kZWZpbmVkIHdoZW4gdGhlIEBEaXJlY3RpdmUgaGFzIGBqaXQ6IHRydWVgLiBJbiB0aGlzXG4gICAgICAvLyBjYXNlLCBjb21waWxhdGlvbiBvZiB0aGUgZGVjb3JhdG9yIGlzIHNraXBwZWQuIFJldHVybmluZyBhbiBlbXB0eSBvYmplY3Qgc2lnbmlmaWVzXG4gICAgICAvLyB0aGF0IG5vIGFuYWx5c2lzIHdhcyBwcm9kdWNlZC5cbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCByZWFkIHRoZSBgQENvbXBvbmVudGAtc3BlY2lmaWMgZmllbGRzLlxuICAgIGNvbnN0IHtkZWNvcmF0b3I6IGNvbXBvbmVudCwgbWV0YWRhdGEsIGlucHV0cywgb3V0cHV0c30gPSBkaXJlY3RpdmVSZXN1bHQ7XG5cbiAgICAvLyBHbyB0aHJvdWdoIHRoZSByb290IGRpcmVjdG9yaWVzIGZvciB0aGlzIHByb2plY3QsIGFuZCBzZWxlY3QgdGhlIG9uZSB3aXRoIHRoZSBzbWFsbGVzdFxuICAgIC8vIHJlbGF0aXZlIHBhdGggcmVwcmVzZW50YXRpb24uXG4gICAgY29uc3QgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGggPSB0aGlzLnJvb3REaXJzLnJlZHVjZTxzdHJpbmd8dW5kZWZpbmVkPigocHJldmlvdXMsIHJvb3REaXIpID0+IHtcbiAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHJlbGF0aXZlKGFic29sdXRlRnJvbShyb290RGlyKSwgYWJzb2x1dGVGcm9tKGNvbnRhaW5pbmdGaWxlKSk7XG4gICAgICBpZiAocHJldmlvdXMgPT09IHVuZGVmaW5lZCB8fCBjYW5kaWRhdGUubGVuZ3RoIDwgcHJldmlvdXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBjYW5kaWRhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcHJldmlvdXM7XG4gICAgICB9XG4gICAgfSwgdW5kZWZpbmVkKSE7XG5cblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjb3VsZCB0ZWNobmljYWxseSBjb21iaW5lIHRoZSBgdmlld1Byb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnlgIGFuZFxuICAgIC8vIGBwcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5YCBpbnRvIGEgc2luZ2xlIHNldCwgYnV0IHdlIGtlZXAgdGhlIHNlcGFyYXRlIHNvIHRoYXRcbiAgICAvLyB3ZSBjYW4gZGlzdGluZ3Vpc2ggd2hlcmUgYW4gZXJyb3IgaXMgY29taW5nIGZyb20gd2hlbiBsb2dnaW5nIHRoZSBkaWFnbm9zdGljcyBpbiBgcmVzb2x2ZWAuXG4gICAgbGV0IHZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5OiBTZXQ8UmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb24+PnxudWxsID0gbnVsbDtcbiAgICBsZXQgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeTogU2V0PFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPj58bnVsbCA9IG51bGw7XG4gICAgbGV0IHdyYXBwZWRWaWV3UHJvdmlkZXJzOiBFeHByZXNzaW9ufG51bGwgPSBudWxsO1xuXG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3ZpZXdQcm92aWRlcnMnKSkge1xuICAgICAgY29uc3Qgdmlld1Byb3ZpZGVycyA9IGNvbXBvbmVudC5nZXQoJ3ZpZXdQcm92aWRlcnMnKSE7XG4gICAgICB2aWV3UHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeSA9XG4gICAgICAgICAgcmVzb2x2ZVByb3ZpZGVyc1JlcXVpcmluZ0ZhY3Rvcnkodmlld1Byb3ZpZGVycywgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yKTtcbiAgICAgIHdyYXBwZWRWaWV3UHJvdmlkZXJzID0gbmV3IFdyYXBwZWROb2RlRXhwcihcbiAgICAgICAgICB0aGlzLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyID8gd3JhcEZ1bmN0aW9uRXhwcmVzc2lvbnNJblBhcmVucyh2aWV3UHJvdmlkZXJzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdQcm92aWRlcnMpO1xuICAgIH1cblxuICAgIGlmIChjb21wb25lbnQuaGFzKCdwcm92aWRlcnMnKSkge1xuICAgICAgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeSA9IHJlc29sdmVQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5KFxuICAgICAgICAgIGNvbXBvbmVudC5nZXQoJ3Byb3ZpZGVycycpISwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuZXZhbHVhdG9yKTtcbiAgICB9XG5cbiAgICAvLyBQYXJzZSB0aGUgdGVtcGxhdGUuXG4gICAgLy8gSWYgYSBwcmVhbmFseXplIHBoYXNlIHdhcyBleGVjdXRlZCwgdGhlIHRlbXBsYXRlIG1heSBhbHJlYWR5IGV4aXN0IGluIHBhcnNlZCBmb3JtLCBzbyBjaGVja1xuICAgIC8vIHRoZSBwcmVhbmFseXplVGVtcGxhdGVDYWNoZS5cbiAgICAvLyBFeHRyYWN0IGEgY2xvc3VyZSBvZiB0aGUgdGVtcGxhdGUgcGFyc2luZyBjb2RlIHNvIHRoYXQgaXQgY2FuIGJlIHJlcGFyc2VkIHdpdGggZGlmZmVyZW50XG4gICAgLy8gb3B0aW9ucyBpZiBuZWVkZWQsIGxpa2UgaW4gdGhlIGluZGV4aW5nIHBpcGVsaW5lLlxuICAgIGxldCB0ZW1wbGF0ZTogUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlO1xuICAgIGlmICh0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLmhhcyhub2RlKSkge1xuICAgICAgLy8gVGhlIHRlbXBsYXRlIHdhcyBwYXJzZWQgaW4gcHJlYW5hbHl6ZS4gVXNlIGl0IGFuZCBkZWxldGUgaXQgdG8gc2F2ZSBtZW1vcnkuXG4gICAgICBjb25zdCBwcmVhbmFseXplZCA9IHRoaXMucHJlYW5hbHl6ZVRlbXBsYXRlQ2FjaGUuZ2V0KG5vZGUpITtcbiAgICAgIHRoaXMucHJlYW5hbHl6ZVRlbXBsYXRlQ2FjaGUuZGVsZXRlKG5vZGUpO1xuXG4gICAgICB0ZW1wbGF0ZSA9IHByZWFuYWx5emVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZURlY2wgPSB0aGlzLnBhcnNlVGVtcGxhdGVEZWNsYXJhdGlvbihkZWNvcmF0b3IsIGNvbXBvbmVudCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgdGVtcGxhdGUgPSB0aGlzLmV4dHJhY3RUZW1wbGF0ZShub2RlLCB0ZW1wbGF0ZURlY2wpO1xuICAgIH1cbiAgICBjb25zdCB0ZW1wbGF0ZVJlc291cmNlID1cbiAgICAgICAgdGVtcGxhdGUuaXNJbmxpbmUgPyB7cGF0aDogbnVsbCwgZXhwcmVzc2lvbjogY29tcG9uZW50LmdldCgndGVtcGxhdGUnKSF9IDoge1xuICAgICAgICAgIHBhdGg6IGFic29sdXRlRnJvbSh0ZW1wbGF0ZS5kZWNsYXJhdGlvbi5yZXNvbHZlZFRlbXBsYXRlVXJsKSxcbiAgICAgICAgICBleHByZXNzaW9uOiB0ZW1wbGF0ZS5zb3VyY2VNYXBwaW5nLm5vZGVcbiAgICAgICAgfTtcblxuICAgIC8vIEZpZ3VyZSBvdXQgdGhlIHNldCBvZiBzdHlsZXMuIFRoZSBvcmRlcmluZyBoZXJlIGlzIGltcG9ydGFudDogZXh0ZXJuYWwgcmVzb3VyY2VzIChzdHlsZVVybHMpXG4gICAgLy8gcHJlY2VkZSBpbmxpbmUgc3R5bGVzLCBhbmQgc3R5bGVzIGRlZmluZWQgaW4gdGhlIHRlbXBsYXRlIG92ZXJyaWRlIHN0eWxlcyBkZWZpbmVkIGluIHRoZVxuICAgIC8vIGNvbXBvbmVudC5cbiAgICBsZXQgc3R5bGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgY29uc3Qgc3R5bGVSZXNvdXJjZXMgPSB0aGlzLl9leHRyYWN0U3R5bGVSZXNvdXJjZXMoY29tcG9uZW50LCBjb250YWluaW5nRmlsZSk7XG4gICAgY29uc3Qgc3R5bGVVcmxzOiBTdHlsZVVybE1ldGFbXSA9IFtcbiAgICAgIC4uLnRoaXMuX2V4dHJhY3RDb21wb25lbnRTdHlsZVVybHMoY29tcG9uZW50KSwgLi4udGhpcy5fZXh0cmFjdFRlbXBsYXRlU3R5bGVVcmxzKHRlbXBsYXRlKVxuICAgIF07XG5cbiAgICBmb3IgKGNvbnN0IHN0eWxlVXJsIG9mIHN0eWxlVXJscykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSB0aGlzLnJlc291cmNlTG9hZGVyLnJlc29sdmUoc3R5bGVVcmwudXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgIGNvbnN0IHJlc291cmNlU3RyID0gdGhpcy5yZXNvdXJjZUxvYWRlci5sb2FkKHJlc291cmNlVXJsKTtcbiAgICAgICAgc3R5bGVzLnB1c2gocmVzb3VyY2VTdHIpO1xuICAgICAgICBpZiAodGhpcy5kZXBUcmFja2VyICE9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5kZXBUcmFja2VyLmFkZFJlc291cmNlRGVwZW5kZW5jeShub2RlLmdldFNvdXJjZUZpbGUoKSwgYWJzb2x1dGVGcm9tKHJlc291cmNlVXJsKSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICBpZiAoZGlhZ25vc3RpY3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGRpYWdub3N0aWNzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzb3VyY2VUeXBlID1cbiAgICAgICAgICAgIHN0eWxlVXJsLnNvdXJjZSA9PT0gUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IgP1xuICAgICAgICAgICAgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IgOlxuICAgICAgICAgICAgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21UZW1wbGF0ZTtcbiAgICAgICAgZGlhZ25vc3RpY3MucHVzaChcbiAgICAgICAgICAgIHRoaXMubWFrZVJlc291cmNlTm90Rm91bmRFcnJvcihzdHlsZVVybC51cmwsIHN0eWxlVXJsLm5vZGVGb3JFcnJvciwgcmVzb3VyY2VUeXBlKVxuICAgICAgICAgICAgICAgIC50b0RpYWdub3N0aWMoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGlubGluZVN0eWxlczogc3RyaW5nW118bnVsbCA9IG51bGw7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3N0eWxlcycpKSB7XG4gICAgICBjb25zdCBsaXRTdHlsZXMgPSBwYXJzZUZpZWxkQXJyYXlWYWx1ZShjb21wb25lbnQsICdzdHlsZXMnLCB0aGlzLmV2YWx1YXRvcik7XG4gICAgICBpZiAobGl0U3R5bGVzICE9PSBudWxsKSB7XG4gICAgICAgIGlubGluZVN0eWxlcyA9IFsuLi5saXRTdHlsZXNdO1xuICAgICAgICBzdHlsZXMucHVzaCguLi5saXRTdHlsZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGVtcGxhdGUuc3R5bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHN0eWxlcy5wdXNoKC4uLnRlbXBsYXRlLnN0eWxlcyk7XG4gICAgfVxuXG4gICAgY29uc3QgZW5jYXBzdWxhdGlvbjogbnVtYmVyID1cbiAgICAgICAgdGhpcy5fcmVzb2x2ZUVudW1WYWx1ZShjb21wb25lbnQsICdlbmNhcHN1bGF0aW9uJywgJ1ZpZXdFbmNhcHN1bGF0aW9uJykgfHwgMDtcblxuICAgIGNvbnN0IGNoYW5nZURldGVjdGlvbjogbnVtYmVyfG51bGwgPVxuICAgICAgICB0aGlzLl9yZXNvbHZlRW51bVZhbHVlKGNvbXBvbmVudCwgJ2NoYW5nZURldGVjdGlvbicsICdDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneScpO1xuXG4gICAgbGV0IGFuaW1hdGlvbnM6IEV4cHJlc3Npb258bnVsbCA9IG51bGw7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ2FuaW1hdGlvbnMnKSkge1xuICAgICAgYW5pbWF0aW9ucyA9IG5ldyBXcmFwcGVkTm9kZUV4cHIoY29tcG9uZW50LmdldCgnYW5pbWF0aW9ucycpISk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0OiBBbmFseXNpc091dHB1dDxDb21wb25lbnRBbmFseXNpc0RhdGE+ID0ge1xuICAgICAgYW5hbHlzaXM6IHtcbiAgICAgICAgYmFzZUNsYXNzOiByZWFkQmFzZUNsYXNzKG5vZGUsIHRoaXMucmVmbGVjdG9yLCB0aGlzLmV2YWx1YXRvciksXG4gICAgICAgIGlucHV0cyxcbiAgICAgICAgb3V0cHV0cyxcbiAgICAgICAgbWV0YToge1xuICAgICAgICAgIC4uLm1ldGFkYXRhLFxuICAgICAgICAgIHRlbXBsYXRlOiB7XG4gICAgICAgICAgICBub2RlczogdGVtcGxhdGUubm9kZXMsXG4gICAgICAgICAgICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHRlbXBsYXRlLm5nQ29udGVudFNlbGVjdG9ycyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgaW50ZXJwb2xhdGlvbjogdGVtcGxhdGUuaW50ZXJwb2xhdGlvbkNvbmZpZyA/PyBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHLFxuICAgICAgICAgIHN0eWxlcyxcblxuICAgICAgICAgIC8vIFRoZXNlIHdpbGwgYmUgcmVwbGFjZWQgZHVyaW5nIHRoZSBjb21waWxhdGlvbiBzdGVwLCBhZnRlciBhbGwgYE5nTW9kdWxlYHMgaGF2ZSBiZWVuXG4gICAgICAgICAgLy8gYW5hbHl6ZWQgYW5kIHRoZSBmdWxsIGNvbXBpbGF0aW9uIHNjb3BlIGZvciB0aGUgY29tcG9uZW50IGNhbiBiZSByZWFsaXplZC5cbiAgICAgICAgICBhbmltYXRpb25zLFxuICAgICAgICAgIHZpZXdQcm92aWRlcnM6IHdyYXBwZWRWaWV3UHJvdmlkZXJzLFxuICAgICAgICAgIGkxOG5Vc2VFeHRlcm5hbElkczogdGhpcy5pMThuVXNlRXh0ZXJuYWxJZHMsXG4gICAgICAgICAgcmVsYXRpdmVDb250ZXh0RmlsZVBhdGgsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cGVDaGVja01ldGE6IGV4dHJhY3REaXJlY3RpdmVUeXBlQ2hlY2tNZXRhKG5vZGUsIGlucHV0cywgdGhpcy5yZWZsZWN0b3IpLFxuICAgICAgICBtZXRhZGF0YVN0bXQ6IGdlbmVyYXRlU2V0Q2xhc3NNZXRhZGF0YUNhbGwoXG4gICAgICAgICAgICBub2RlLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5pc0NvcmUsIHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpLFxuICAgICAgICB0ZW1wbGF0ZSxcbiAgICAgICAgcHJvdmlkZXJzUmVxdWlyaW5nRmFjdG9yeSxcbiAgICAgICAgdmlld1Byb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnksXG4gICAgICAgIGlubGluZVN0eWxlcyxcbiAgICAgICAgc3R5bGVVcmxzLFxuICAgICAgICByZXNvdXJjZXM6IHtcbiAgICAgICAgICBzdHlsZXM6IHN0eWxlUmVzb3VyY2VzLFxuICAgICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVJlc291cmNlLFxuICAgICAgICB9LFxuICAgICAgICBpc1BvaXNvbmVkLFxuICAgICAgfSxcbiAgICAgIGRpYWdub3N0aWNzLFxuICAgIH07XG4gICAgaWYgKGNoYW5nZURldGVjdGlvbiAhPT0gbnVsbCkge1xuICAgICAgb3V0cHV0LmFuYWx5c2lzIS5tZXRhLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfVxuXG4gIHN5bWJvbChub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPik6IENvbXBvbmVudFN5bWJvbCB7XG4gICAgY29uc3QgdHlwZVBhcmFtZXRlcnMgPSBleHRyYWN0U2VtYW50aWNUeXBlUGFyYW1ldGVycyhub2RlKTtcblxuICAgIHJldHVybiBuZXcgQ29tcG9uZW50U3ltYm9sKFxuICAgICAgICBub2RlLCBhbmFseXNpcy5tZXRhLnNlbGVjdG9yLCBhbmFseXNpcy5pbnB1dHMsIGFuYWx5c2lzLm91dHB1dHMsIGFuYWx5c2lzLm1ldGEuZXhwb3J0QXMsXG4gICAgICAgIGFuYWx5c2lzLnR5cGVDaGVja01ldGEsIHR5cGVQYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIHJlZ2lzdGVyKG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBDb21wb25lbnRBbmFseXNpc0RhdGEpOiB2b2lkIHtcbiAgICAvLyBSZWdpc3RlciB0aGlzIGNvbXBvbmVudCdzIGluZm9ybWF0aW9uIHdpdGggdGhlIGBNZXRhZGF0YVJlZ2lzdHJ5YC4gVGhpcyBlbnN1cmVzIHRoYXRcbiAgICAvLyB0aGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGNvbXBvbmVudCBpcyBhdmFpbGFibGUgZHVyaW5nIHRoZSBjb21waWxlKCkgcGhhc2UuXG4gICAgY29uc3QgcmVmID0gbmV3IFJlZmVyZW5jZShub2RlKTtcbiAgICB0aGlzLm1ldGFSZWdpc3RyeS5yZWdpc3RlckRpcmVjdGl2ZU1ldGFkYXRhKHtcbiAgICAgIHJlZixcbiAgICAgIG5hbWU6IG5vZGUubmFtZS50ZXh0LFxuICAgICAgc2VsZWN0b3I6IGFuYWx5c2lzLm1ldGEuc2VsZWN0b3IsXG4gICAgICBleHBvcnRBczogYW5hbHlzaXMubWV0YS5leHBvcnRBcyxcbiAgICAgIGlucHV0czogYW5hbHlzaXMuaW5wdXRzLFxuICAgICAgb3V0cHV0czogYW5hbHlzaXMub3V0cHV0cyxcbiAgICAgIHF1ZXJpZXM6IGFuYWx5c2lzLm1ldGEucXVlcmllcy5tYXAocXVlcnkgPT4gcXVlcnkucHJvcGVydHlOYW1lKSxcbiAgICAgIGlzQ29tcG9uZW50OiB0cnVlLFxuICAgICAgYmFzZUNsYXNzOiBhbmFseXNpcy5iYXNlQ2xhc3MsXG4gICAgICAuLi5hbmFseXNpcy50eXBlQ2hlY2tNZXRhLFxuICAgICAgaXNQb2lzb25lZDogYW5hbHlzaXMuaXNQb2lzb25lZCxcbiAgICAgIGlzU3RydWN0dXJhbDogZmFsc2UsXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc291cmNlUmVnaXN0cnkucmVnaXN0ZXJSZXNvdXJjZXMoYW5hbHlzaXMucmVzb3VyY2VzLCBub2RlKTtcbiAgICB0aGlzLmluamVjdGFibGVSZWdpc3RyeS5yZWdpc3RlckluamVjdGFibGUobm9kZSk7XG4gIH1cblxuICBpbmRleChcbiAgICAgIGNvbnRleHQ6IEluZGV4aW5nQ29udGV4dCwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IFJlYWRvbmx5PENvbXBvbmVudEFuYWx5c2lzRGF0YT4pIHtcbiAgICBpZiAoYW5hbHlzaXMuaXNQb2lzb25lZCAmJiAhdGhpcy51c2VQb2lzb25lZERhdGEpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzY29wZSA9IHRoaXMuc2NvcGVSZWFkZXIuZ2V0U2NvcGVGb3JDb21wb25lbnQobm9kZSk7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBhbmFseXNpcy5tZXRhLnNlbGVjdG9yO1xuICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPERpcmVjdGl2ZU1ldGE+KCk7XG4gICAgaWYgKHNjb3BlICE9PSBudWxsKSB7XG4gICAgICBpZiAoKHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQgfHwgc2NvcGUuZXhwb3J0ZWQuaXNQb2lzb25lZCkgJiYgIXRoaXMudXNlUG9pc29uZWREYXRhKSB7XG4gICAgICAgIC8vIERvbid0IGJvdGhlciBpbmRleGluZyBjb21wb25lbnRzIHdoaWNoIGhhZCBlcnJvbmVvdXMgc2NvcGVzLCB1bmxlc3Mgc3BlY2lmaWNhbGx5XG4gICAgICAgIC8vIHJlcXVlc3RlZC5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgZGlyZWN0aXZlIG9mIHNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgaWYgKGRpcmVjdGl2ZS5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UoZGlyZWN0aXZlLnNlbGVjdG9yKSwgZGlyZWN0aXZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBiaW5kZXIgPSBuZXcgUjNUYXJnZXRCaW5kZXIobWF0Y2hlcik7XG4gICAgY29uc3QgYm91bmRUZW1wbGF0ZSA9IGJpbmRlci5iaW5kKHt0ZW1wbGF0ZTogYW5hbHlzaXMudGVtcGxhdGUuZGlhZ05vZGVzfSk7XG5cbiAgICBjb250ZXh0LmFkZENvbXBvbmVudCh7XG4gICAgICBkZWNsYXJhdGlvbjogbm9kZSxcbiAgICAgIHNlbGVjdG9yLFxuICAgICAgYm91bmRUZW1wbGF0ZSxcbiAgICAgIHRlbXBsYXRlTWV0YToge1xuICAgICAgICBpc0lubGluZTogYW5hbHlzaXMudGVtcGxhdGUuaXNJbmxpbmUsXG4gICAgICAgIGZpbGU6IGFuYWx5c2lzLnRlbXBsYXRlLmZpbGUsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgdHlwZUNoZWNrKGN0eDogVHlwZUNoZWNrQ29udGV4dCwgbm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgbWV0YTogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPik6XG4gICAgICB2b2lkIHtcbiAgICBpZiAodGhpcy50eXBlQ2hlY2tTY29wZVJlZ2lzdHJ5ID09PSBudWxsIHx8ICF0cy5pc0NsYXNzRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWV0YS5pc1BvaXNvbmVkICYmICF0aGlzLnVzZVBvaXNvbmVkRGF0YSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzY29wZSA9IHRoaXMudHlwZUNoZWNrU2NvcGVSZWdpc3RyeS5nZXRUeXBlQ2hlY2tTY29wZShub2RlKTtcbiAgICBpZiAoc2NvcGUuaXNQb2lzb25lZCAmJiAhdGhpcy51c2VQb2lzb25lZERhdGEpIHtcbiAgICAgIC8vIERvbid0IHR5cGUtY2hlY2sgY29tcG9uZW50cyB0aGF0IGhhZCBlcnJvcnMgaW4gdGhlaXIgc2NvcGVzLCB1bmxlc3MgcmVxdWVzdGVkLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihzY29wZS5tYXRjaGVyKTtcbiAgICBjdHguYWRkVGVtcGxhdGUoXG4gICAgICAgIG5ldyBSZWZlcmVuY2Uobm9kZSksIGJpbmRlciwgbWV0YS50ZW1wbGF0ZS5kaWFnTm9kZXMsIHNjb3BlLnBpcGVzLCBzY29wZS5zY2hlbWFzLFxuICAgICAgICBtZXRhLnRlbXBsYXRlLnNvdXJjZU1hcHBpbmcsIG1ldGEudGVtcGxhdGUuZmlsZSwgbWV0YS50ZW1wbGF0ZS5lcnJvcnMpO1xuICB9XG5cbiAgcmVzb2x2ZShcbiAgICAgIG5vZGU6IENsYXNzRGVjbGFyYXRpb24sIGFuYWx5c2lzOiBSZWFkb25seTxDb21wb25lbnRBbmFseXNpc0RhdGE+LFxuICAgICAgc3ltYm9sOiBDb21wb25lbnRTeW1ib2wpOiBSZXNvbHZlUmVzdWx0PENvbXBvbmVudFJlc29sdXRpb25EYXRhPiB7XG4gICAgaWYgKHRoaXMuc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIgIT09IG51bGwgJiYgYW5hbHlzaXMuYmFzZUNsYXNzIGluc3RhbmNlb2YgUmVmZXJlbmNlKSB7XG4gICAgICBzeW1ib2wuYmFzZUNsYXNzID0gdGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlci5nZXRTeW1ib2woYW5hbHlzaXMuYmFzZUNsYXNzLm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChhbmFseXNpcy5pc1BvaXNvbmVkICYmICF0aGlzLnVzZVBvaXNvbmVkRGF0YSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoaXMgY29tcG9uZW50IHdhcyByZWdpc3RlcmVkIHdpdGggYW4gTmdNb2R1bGUuIElmIHNvLCBpdCBzaG91bGQgYmUgY29tcGlsZWRcbiAgICAvLyB1bmRlciB0aGF0IG1vZHVsZSdzIGNvbXBpbGF0aW9uIHNjb3BlLlxuICAgIGNvbnN0IHNjb3BlID0gdGhpcy5zY29wZVJlYWRlci5nZXRTY29wZUZvckNvbXBvbmVudChub2RlKTtcbiAgICBsZXQgbWV0YWRhdGEgPSBhbmFseXNpcy5tZXRhIGFzIFJlYWRvbmx5PFIzQ29tcG9uZW50TWV0YWRhdGE+O1xuXG4gICAgY29uc3QgZGF0YTogQ29tcG9uZW50UmVzb2x1dGlvbkRhdGEgPSB7XG4gICAgICBkaXJlY3RpdmVzOiBFTVBUWV9BUlJBWSxcbiAgICAgIHBpcGVzOiBFTVBUWV9NQVAsXG4gICAgICBkZWNsYXJhdGlvbkxpc3RFbWl0TW9kZTogRGVjbGFyYXRpb25MaXN0RW1pdE1vZGUuRGlyZWN0LFxuICAgIH07XG5cbiAgICBpZiAoc2NvcGUgIT09IG51bGwgJiYgKCFzY29wZS5jb21waWxhdGlvbi5pc1BvaXNvbmVkIHx8IHRoaXMudXNlUG9pc29uZWREYXRhKSkge1xuICAgICAgLy8gUmVwbGFjZSB0aGUgZW1wdHkgY29tcG9uZW50cyBhbmQgZGlyZWN0aXZlcyBmcm9tIHRoZSBhbmFseXplKCkgc3RlcCB3aXRoIGEgZnVsbHkgZXhwYW5kZWRcbiAgICAgIC8vIHNjb3BlLiBUaGlzIGlzIHBvc3NpYmxlIG5vdyBiZWNhdXNlIGR1cmluZyByZXNvbHZlKCkgdGhlIHdob2xlIGNvbXBpbGF0aW9uIHVuaXQgaGFzIGJlZW5cbiAgICAgIC8vIGZ1bGx5IGFuYWx5emVkLlxuICAgICAgLy9cbiAgICAgIC8vIEZpcnN0IGl0IG5lZWRzIHRvIGJlIGRldGVybWluZWQgaWYgYWN0dWFsbHkgaW1wb3J0aW5nIHRoZSBkaXJlY3RpdmVzL3BpcGVzIHVzZWQgaW4gdGhlXG4gICAgICAvLyB0ZW1wbGF0ZSB3b3VsZCBjcmVhdGUgYSBjeWNsZS4gQ3VycmVudGx5IG5ndHNjIHJlZnVzZXMgdG8gZ2VuZXJhdGUgY3ljbGVzLCBzbyBhbiBvcHRpb25cbiAgICAgIC8vIGtub3duIGFzIFwicmVtb3RlIHNjb3BpbmdcIiBpcyB1c2VkIGlmIGEgY3ljbGUgd291bGQgYmUgY3JlYXRlZC4gSW4gcmVtb3RlIHNjb3BpbmcsIHRoZVxuICAgICAgLy8gbW9kdWxlIGZpbGUgc2V0cyB0aGUgZGlyZWN0aXZlcy9waXBlcyBvbiB0aGUgybVjbXAgb2YgdGhlIGNvbXBvbmVudCwgd2l0aG91dFxuICAgICAgLy8gcmVxdWlyaW5nIG5ldyBpbXBvcnRzIChidXQgYWxzbyBpbiBhIHdheSB0aGF0IGJyZWFrcyB0cmVlIHNoYWtpbmcpLlxuICAgICAgLy9cbiAgICAgIC8vIERldGVybWluaW5nIHRoaXMgaXMgY2hhbGxlbmdpbmcsIGJlY2F1c2UgdGhlIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIgaXMgcmVzcG9uc2libGUgZm9yXG4gICAgICAvLyBtYXRjaGluZyBkaXJlY3RpdmVzIGFuZCBwaXBlcyBpbiB0aGUgdGVtcGxhdGU7IGhvd2V2ZXIsIHRoYXQgZG9lc24ndCBydW4gdW50aWwgdGhlIGFjdHVhbFxuICAgICAgLy8gY29tcGlsZSgpIHN0ZXAuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHJ1biB0ZW1wbGF0ZSBjb21waWxhdGlvbiBzb29uZXIgYXMgaXQgcmVxdWlyZXMgdGhlXG4gICAgICAvLyBDb25zdGFudFBvb2wgZm9yIHRoZSBvdmVyYWxsIGZpbGUgYmVpbmcgY29tcGlsZWQgKHdoaWNoIGlzbid0IGF2YWlsYWJsZSB1bnRpbCB0aGVcbiAgICAgIC8vIHRyYW5zZm9ybSBzdGVwKS5cbiAgICAgIC8vXG4gICAgICAvLyBJbnN0ZWFkLCBkaXJlY3RpdmVzL3BpcGVzIGFyZSBtYXRjaGVkIGluZGVwZW5kZW50bHkgaGVyZSwgdXNpbmcgdGhlIFIzVGFyZ2V0QmluZGVyLiBUaGlzXG4gICAgICAvLyBpcyBhbiBhbHRlcm5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBvZiB0ZW1wbGF0ZSBtYXRjaGluZyB3aGljaCBpcyB1c2VkIGZvciB0ZW1wbGF0ZVxuICAgICAgLy8gdHlwZS1jaGVja2luZyBhbmQgd2lsbCBldmVudHVhbGx5IHJlcGxhY2UgbWF0Y2hpbmcgaW4gdGhlIFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIuXG5cblxuICAgICAgLy8gU2V0IHVwIHRoZSBSM1RhcmdldEJpbmRlciwgYXMgd2VsbCBhcyBhICdkaXJlY3RpdmVzJyBhcnJheSBhbmQgYSAncGlwZXMnIG1hcCB0aGF0IGFyZVxuICAgICAgLy8gbGF0ZXIgZmVkIHRvIHRoZSBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyLiBGaXJzdCwgYSBTZWxlY3Rvck1hdGNoZXIgaXMgY29uc3RydWN0ZWQgdG9cbiAgICAgIC8vIG1hdGNoIGRpcmVjdGl2ZXMgdGhhdCBhcmUgaW4gc2NvcGUuXG4gICAgICB0eXBlIE1hdGNoZWREaXJlY3RpdmUgPSBEaXJlY3RpdmVNZXRhJntzZWxlY3Rvcjogc3RyaW5nfTtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBuZXcgU2VsZWN0b3JNYXRjaGVyPE1hdGNoZWREaXJlY3RpdmU+KCk7XG5cbiAgICAgIGZvciAoY29uc3QgZGlyIG9mIHNjb3BlLmNvbXBpbGF0aW9uLmRpcmVjdGl2ZXMpIHtcbiAgICAgICAgaWYgKGRpci5zZWxlY3RvciAhPT0gbnVsbCkge1xuICAgICAgICAgIG1hdGNoZXIuYWRkU2VsZWN0YWJsZXMoQ3NzU2VsZWN0b3IucGFyc2UoZGlyLnNlbGVjdG9yKSwgZGlyIGFzIE1hdGNoZWREaXJlY3RpdmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBwaXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbj4+KCk7XG4gICAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuY29tcGlsYXRpb24ucGlwZXMpIHtcbiAgICAgICAgcGlwZXMuc2V0KHBpcGUubmFtZSwgcGlwZS5yZWYpO1xuICAgICAgfVxuXG4gICAgICAvLyBOZXh0LCB0aGUgY29tcG9uZW50IHRlbXBsYXRlIEFTVCBpcyBib3VuZCB1c2luZyB0aGUgUjNUYXJnZXRCaW5kZXIuIFRoaXMgcHJvZHVjZXMgYVxuICAgICAgLy8gQm91bmRUYXJnZXQsIHdoaWNoIGlzIHNpbWlsYXIgdG8gYSB0cy5UeXBlQ2hlY2tlci5cbiAgICAgIGNvbnN0IGJpbmRlciA9IG5ldyBSM1RhcmdldEJpbmRlcihtYXRjaGVyKTtcbiAgICAgIGNvbnN0IGJvdW5kID0gYmluZGVyLmJpbmQoe3RlbXBsYXRlOiBtZXRhZGF0YS50ZW1wbGF0ZS5ub2Rlc30pO1xuXG4gICAgICAvLyBUaGUgQm91bmRUYXJnZXQga25vd3Mgd2hpY2ggZGlyZWN0aXZlcyBhbmQgcGlwZXMgbWF0Y2hlZCB0aGUgdGVtcGxhdGUuXG4gICAgICB0eXBlIFVzZWREaXJlY3RpdmUgPVxuICAgICAgICAgIFIzVXNlZERpcmVjdGl2ZU1ldGFkYXRhJntyZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPiwgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGV9O1xuICAgICAgY29uc3QgdXNlZERpcmVjdGl2ZXM6IFVzZWREaXJlY3RpdmVbXSA9IGJvdW5kLmdldFVzZWREaXJlY3RpdmVzKCkubWFwKGRpcmVjdGl2ZSA9PiB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnJlZkVtaXR0ZXIuZW1pdChkaXJlY3RpdmUucmVmLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZWY6IGRpcmVjdGl2ZS5yZWYsXG4gICAgICAgICAgdHlwZTogdHlwZS5leHByZXNzaW9uLFxuICAgICAgICAgIGltcG9ydGVkRmlsZTogdHlwZS5pbXBvcnRlZEZpbGUsXG4gICAgICAgICAgc2VsZWN0b3I6IGRpcmVjdGl2ZS5zZWxlY3RvcixcbiAgICAgICAgICBpbnB1dHM6IGRpcmVjdGl2ZS5pbnB1dHMucHJvcGVydHlOYW1lcyxcbiAgICAgICAgICBvdXRwdXRzOiBkaXJlY3RpdmUub3V0cHV0cy5wcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgIGV4cG9ydEFzOiBkaXJlY3RpdmUuZXhwb3J0QXMsXG4gICAgICAgICAgaXNDb21wb25lbnQ6IGRpcmVjdGl2ZS5pc0NvbXBvbmVudCxcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICB0eXBlIFVzZWRQaXBlID0ge1xuICAgICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPixcbiAgICAgICAgcGlwZU5hbWU6IHN0cmluZyxcbiAgICAgICAgZXhwcmVzc2lvbjogRXhwcmVzc2lvbixcbiAgICAgICAgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGUsXG4gICAgICB9O1xuICAgICAgY29uc3QgdXNlZFBpcGVzOiBVc2VkUGlwZVtdID0gW107XG4gICAgICBmb3IgKGNvbnN0IHBpcGVOYW1lIG9mIGJvdW5kLmdldFVzZWRQaXBlcygpKSB7XG4gICAgICAgIGlmICghcGlwZXMuaGFzKHBpcGVOYW1lKSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBpcGUgPSBwaXBlcy5nZXQocGlwZU5hbWUpITtcbiAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucmVmRW1pdHRlci5lbWl0KHBpcGUsIGNvbnRleHQpO1xuICAgICAgICB1c2VkUGlwZXMucHVzaCh7XG4gICAgICAgICAgcmVmOiBwaXBlLFxuICAgICAgICAgIHBpcGVOYW1lLFxuICAgICAgICAgIGV4cHJlc3Npb246IHR5cGUuZXhwcmVzc2lvbixcbiAgICAgICAgICBpbXBvcnRlZEZpbGU6IHR5cGUuaW1wb3J0ZWRGaWxlLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyICE9PSBudWxsKSB7XG4gICAgICAgIHN5bWJvbC51c2VkRGlyZWN0aXZlcyA9IHVzZWREaXJlY3RpdmVzLm1hcChcbiAgICAgICAgICAgIGRpciA9PiB0aGlzLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyIS5nZXRTZW1hbnRpY1JlZmVyZW5jZShkaXIucmVmLm5vZGUsIGRpci50eXBlKSk7XG4gICAgICAgIHN5bWJvbC51c2VkUGlwZXMgPSB1c2VkUGlwZXMubWFwKFxuICAgICAgICAgICAgcGlwZSA9PlxuICAgICAgICAgICAgICAgIHRoaXMuc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIhLmdldFNlbWFudGljUmVmZXJlbmNlKHBpcGUucmVmLm5vZGUsIHBpcGUuZXhwcmVzc2lvbikpO1xuICAgICAgfVxuXG4gICAgICAvLyBTY2FuIHRocm91Z2ggdGhlIGRpcmVjdGl2ZXMvcGlwZXMgYWN0dWFsbHkgdXNlZCBpbiB0aGUgdGVtcGxhdGUgYW5kIGNoZWNrIHdoZXRoZXIgYW55XG4gICAgICAvLyBpbXBvcnQgd2hpY2ggbmVlZHMgdG8gYmUgZ2VuZXJhdGVkIHdvdWxkIGNyZWF0ZSBhIGN5Y2xlLlxuICAgICAgY29uc3QgY3ljbGVzRnJvbURpcmVjdGl2ZXMgPSBuZXcgTWFwPFVzZWREaXJlY3RpdmUsIEN5Y2xlPigpO1xuICAgICAgZm9yIChjb25zdCB1c2VkRGlyZWN0aXZlIG9mIHVzZWREaXJlY3RpdmVzKSB7XG4gICAgICAgIGNvbnN0IGN5Y2xlID1cbiAgICAgICAgICAgIHRoaXMuX2NoZWNrRm9yQ3ljbGljSW1wb3J0KHVzZWREaXJlY3RpdmUuaW1wb3J0ZWRGaWxlLCB1c2VkRGlyZWN0aXZlLnR5cGUsIGNvbnRleHQpO1xuICAgICAgICBpZiAoY3ljbGUgIT09IG51bGwpIHtcbiAgICAgICAgICBjeWNsZXNGcm9tRGlyZWN0aXZlcy5zZXQodXNlZERpcmVjdGl2ZSwgY3ljbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBjeWNsZXNGcm9tUGlwZXMgPSBuZXcgTWFwPFVzZWRQaXBlLCBDeWNsZT4oKTtcbiAgICAgIGZvciAoY29uc3QgdXNlZFBpcGUgb2YgdXNlZFBpcGVzKSB7XG4gICAgICAgIGNvbnN0IGN5Y2xlID1cbiAgICAgICAgICAgIHRoaXMuX2NoZWNrRm9yQ3ljbGljSW1wb3J0KHVzZWRQaXBlLmltcG9ydGVkRmlsZSwgdXNlZFBpcGUuZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgICAgIGlmIChjeWNsZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGN5Y2xlc0Zyb21QaXBlcy5zZXQodXNlZFBpcGUsIGN5Y2xlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjeWNsZURldGVjdGVkID0gY3ljbGVzRnJvbURpcmVjdGl2ZXMuc2l6ZSAhPT0gMCB8fCBjeWNsZXNGcm9tUGlwZXMuc2l6ZSAhPT0gMDtcbiAgICAgIGlmICghY3ljbGVEZXRlY3RlZCkge1xuICAgICAgICAvLyBObyBjeWNsZSB3YXMgZGV0ZWN0ZWQuIFJlY29yZCB0aGUgaW1wb3J0cyB0aGF0IG5lZWQgdG8gYmUgY3JlYXRlZCBpbiB0aGUgY3ljbGUgZGV0ZWN0b3JcbiAgICAgICAgLy8gc28gdGhhdCBmdXR1cmUgY3ljbGljIGltcG9ydCBjaGVja3MgY29uc2lkZXIgdGhlaXIgcHJvZHVjdGlvbi5cbiAgICAgICAgZm9yIChjb25zdCB7dHlwZSwgaW1wb3J0ZWRGaWxlfSBvZiB1c2VkRGlyZWN0aXZlcykge1xuICAgICAgICAgIHRoaXMuX3JlY29yZFN5bnRoZXRpY0ltcG9ydChpbXBvcnRlZEZpbGUsIHR5cGUsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qge2V4cHJlc3Npb24sIGltcG9ydGVkRmlsZX0gb2YgdXNlZFBpcGVzKSB7XG4gICAgICAgICAgdGhpcy5fcmVjb3JkU3ludGhldGljSW1wb3J0KGltcG9ydGVkRmlsZSwgZXhwcmVzc2lvbiwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaXJlY3RpdmUvcGlwZSBhcnJheXMgaW4gybVjbXAgbmVlZCB0byBiZSB3cmFwcGVkIGluIGNsb3N1cmVzLlxuICAgICAgICAvLyBUaGlzIGlzIHJlcXVpcmVkIGlmIGFueSBkaXJlY3RpdmUvcGlwZSByZWZlcmVuY2UgaXMgdG8gYSBkZWNsYXJhdGlvbiBpbiB0aGUgc2FtZSBmaWxlXG4gICAgICAgIC8vIGJ1dCBkZWNsYXJlZCBhZnRlciB0aGlzIGNvbXBvbmVudC5cbiAgICAgICAgY29uc3Qgd3JhcERpcmVjdGl2ZXNBbmRQaXBlc0luQ2xvc3VyZSA9XG4gICAgICAgICAgICB1c2VkRGlyZWN0aXZlcy5zb21lKFxuICAgICAgICAgICAgICAgIGRpciA9PiBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKGRpci50eXBlLCBub2RlLm5hbWUsIGNvbnRleHQpKSB8fFxuICAgICAgICAgICAgdXNlZFBpcGVzLnNvbWUoXG4gICAgICAgICAgICAgICAgcGlwZSA9PiBpc0V4cHJlc3Npb25Gb3J3YXJkUmVmZXJlbmNlKHBpcGUuZXhwcmVzc2lvbiwgbm9kZS5uYW1lLCBjb250ZXh0KSk7XG5cbiAgICAgICAgZGF0YS5kaXJlY3RpdmVzID0gdXNlZERpcmVjdGl2ZXM7XG4gICAgICAgIGRhdGEucGlwZXMgPSBuZXcgTWFwKHVzZWRQaXBlcy5tYXAocGlwZSA9PiBbcGlwZS5waXBlTmFtZSwgcGlwZS5leHByZXNzaW9uXSkpO1xuICAgICAgICBkYXRhLmRlY2xhcmF0aW9uTGlzdEVtaXRNb2RlID0gd3JhcERpcmVjdGl2ZXNBbmRQaXBlc0luQ2xvc3VyZSA/XG4gICAgICAgICAgICBEZWNsYXJhdGlvbkxpc3RFbWl0TW9kZS5DbG9zdXJlIDpcbiAgICAgICAgICAgIERlY2xhcmF0aW9uTGlzdEVtaXRNb2RlLkRpcmVjdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xlSGFuZGxpbmdTdHJhdGVneSA9PT0gQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5LlVzZVJlbW90ZVNjb3BpbmcpIHtcbiAgICAgICAgICAvLyBEZWNsYXJpbmcgdGhlIGRpcmVjdGl2ZURlZnMvcGlwZURlZnMgYXJyYXlzIGRpcmVjdGx5IHdvdWxkIHJlcXVpcmUgaW1wb3J0cyB0aGF0IHdvdWxkXG4gICAgICAgICAgLy8gY3JlYXRlIGEgY3ljbGUuIEluc3RlYWQsIG1hcmsgdGhpcyBjb21wb25lbnQgYXMgcmVxdWlyaW5nIHJlbW90ZSBzY29waW5nLCBzbyB0aGF0IHRoZVxuICAgICAgICAgIC8vIE5nTW9kdWxlIGZpbGUgd2lsbCB0YWtlIGNhcmUgb2Ygc2V0dGluZyB0aGUgZGlyZWN0aXZlcyBmb3IgdGhlIGNvbXBvbmVudC5cbiAgICAgICAgICB0aGlzLnNjb3BlUmVnaXN0cnkuc2V0Q29tcG9uZW50UmVtb3RlU2NvcGUoXG4gICAgICAgICAgICAgIG5vZGUsIHVzZWREaXJlY3RpdmVzLm1hcChkaXIgPT4gZGlyLnJlZiksIHVzZWRQaXBlcy5tYXAocGlwZSA9PiBwaXBlLnJlZikpO1xuICAgICAgICAgIHN5bWJvbC5pc1JlbW90ZWx5U2NvcGVkID0gdHJ1ZTtcblxuICAgICAgICAgIC8vIElmIGEgc2VtYW50aWMgZ3JhcGggaXMgYmVpbmcgdHJhY2tlZCwgcmVjb3JkIHRoZSBmYWN0IHRoYXQgdGhpcyBjb21wb25lbnQgaXMgcmVtb3RlbHlcbiAgICAgICAgICAvLyBzY29wZWQgd2l0aCB0aGUgZGVjbGFyaW5nIE5nTW9kdWxlIHN5bWJvbCBhcyB0aGUgTmdNb2R1bGUncyBlbWl0IGJlY29tZXMgZGVwZW5kZW50IG9uXG4gICAgICAgICAgLy8gdGhlIGRpcmVjdGl2ZS9waXBlIHVzYWdlcyBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICAgICAgICBpZiAodGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgbW9kdWxlU3ltYm9sID0gdGhpcy5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlci5nZXRTeW1ib2woc2NvcGUubmdNb2R1bGUpO1xuICAgICAgICAgICAgaWYgKCEobW9kdWxlU3ltYm9sIGluc3RhbmNlb2YgTmdNb2R1bGVTeW1ib2wpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgIGBBc3NlcnRpb25FcnJvcjogRXhwZWN0ZWQgJHtzY29wZS5uZ01vZHVsZS5uYW1lfSB0byBiZSBhbiBOZ01vZHVsZVN5bWJvbC5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbW9kdWxlU3ltYm9sLmFkZFJlbW90ZWx5U2NvcGVkQ29tcG9uZW50KFxuICAgICAgICAgICAgICAgIHN5bWJvbCwgc3ltYm9sLnVzZWREaXJlY3RpdmVzLCBzeW1ib2wudXNlZFBpcGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2UgYXJlIG5vdCBhYmxlIHRvIGhhbmRsZSB0aGlzIGN5Y2xlIHNvIHRocm93IGFuIGVycm9yLlxuICAgICAgICAgIGNvbnN0IHJlbGF0ZWRNZXNzYWdlczogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbltdID0gW107XG4gICAgICAgICAgZm9yIChjb25zdCBbZGlyLCBjeWNsZV0gb2YgY3ljbGVzRnJvbURpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgIHJlbGF0ZWRNZXNzYWdlcy5wdXNoKFxuICAgICAgICAgICAgICAgIG1ha2VDeWNsaWNJbXBvcnRJbmZvKGRpci5yZWYsIGRpci5pc0NvbXBvbmVudCA/ICdjb21wb25lbnQnIDogJ2RpcmVjdGl2ZScsIGN5Y2xlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoY29uc3QgW3BpcGUsIGN5Y2xlXSBvZiBjeWNsZXNGcm9tUGlwZXMpIHtcbiAgICAgICAgICAgIHJlbGF0ZWRNZXNzYWdlcy5wdXNoKG1ha2VDeWNsaWNJbXBvcnRJbmZvKHBpcGUucmVmLCAncGlwZScsIGN5Y2xlKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgICAgICAgRXJyb3JDb2RlLklNUE9SVF9DWUNMRV9ERVRFQ1RFRCwgbm9kZSxcbiAgICAgICAgICAgICAgJ09uZSBvciBtb3JlIGltcG9ydCBjeWNsZXMgd291bGQgbmVlZCB0byBiZSBjcmVhdGVkIHRvIGNvbXBpbGUgdGhpcyBjb21wb25lbnQsICcgK1xuICAgICAgICAgICAgICAgICAgJ3doaWNoIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgY29tcGlsZXIgY29uZmlndXJhdGlvbi4nLFxuICAgICAgICAgICAgICByZWxhdGVkTWVzc2FnZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuXG4gICAgaWYgKGFuYWx5c2lzLnByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnkgIT09IG51bGwgJiZcbiAgICAgICAgYW5hbHlzaXMubWV0YS5wcm92aWRlcnMgaW5zdGFuY2VvZiBXcmFwcGVkTm9kZUV4cHIpIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyRGlhZ25vc3RpY3MgPSBnZXRQcm92aWRlckRpYWdub3N0aWNzKFxuICAgICAgICAgIGFuYWx5c2lzLnByb3ZpZGVyc1JlcXVpcmluZ0ZhY3RvcnksIGFuYWx5c2lzLm1ldGEucHJvdmlkZXJzIS5ub2RlLFxuICAgICAgICAgIHRoaXMuaW5qZWN0YWJsZVJlZ2lzdHJ5KTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4ucHJvdmlkZXJEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgaWYgKGFuYWx5c2lzLnZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5ICE9PSBudWxsICYmXG4gICAgICAgIGFuYWx5c2lzLm1ldGEudmlld1Byb3ZpZGVycyBpbnN0YW5jZW9mIFdyYXBwZWROb2RlRXhwcikge1xuICAgICAgY29uc3Qgdmlld1Byb3ZpZGVyRGlhZ25vc3RpY3MgPSBnZXRQcm92aWRlckRpYWdub3N0aWNzKFxuICAgICAgICAgIGFuYWx5c2lzLnZpZXdQcm92aWRlcnNSZXF1aXJpbmdGYWN0b3J5LCBhbmFseXNpcy5tZXRhLnZpZXdQcm92aWRlcnMhLm5vZGUsXG4gICAgICAgICAgdGhpcy5pbmplY3RhYmxlUmVnaXN0cnkpO1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi52aWV3UHJvdmlkZXJEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aXZlRGlhZ25vc3RpY3MgPSBnZXREaXJlY3RpdmVEaWFnbm9zdGljcyhcbiAgICAgICAgbm9kZSwgdGhpcy5tZXRhUmVhZGVyLCB0aGlzLmV2YWx1YXRvciwgdGhpcy5yZWZsZWN0b3IsIHRoaXMuc2NvcGVSZWdpc3RyeSwgJ0NvbXBvbmVudCcpO1xuICAgIGlmIChkaXJlY3RpdmVEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5kaXJlY3RpdmVEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgaWYgKGRpYWdub3N0aWNzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7ZGlhZ25vc3RpY3N9O1xuICAgIH1cblxuICAgIHJldHVybiB7ZGF0YX07XG4gIH1cblxuICB1cGRhdGVSZXNvdXJjZXMobm9kZTogQ2xhc3NEZWNsYXJhdGlvbiwgYW5hbHlzaXM6IENvbXBvbmVudEFuYWx5c2lzRGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCkuZmlsZU5hbWU7XG5cbiAgICAvLyBJZiB0aGUgdGVtcGxhdGUgaXMgZXh0ZXJuYWwsIHJlLXBhcnNlIGl0LlxuICAgIGNvbnN0IHRlbXBsYXRlRGVjbCA9IGFuYWx5c2lzLnRlbXBsYXRlLmRlY2xhcmF0aW9uO1xuICAgIGlmICghdGVtcGxhdGVEZWNsLmlzSW5saW5lKSB7XG4gICAgICBhbmFseXNpcy50ZW1wbGF0ZSA9IHRoaXMuZXh0cmFjdFRlbXBsYXRlKG5vZGUsIHRlbXBsYXRlRGVjbCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGFueSBleHRlcm5hbCBzdHlsZXNoZWV0cyBhbmQgcmVidWlsZCB0aGUgY29tYmluZWQgJ3N0eWxlcycgbGlzdC5cbiAgICAvLyBUT0RPKGFseGh1Yik6IHdyaXRlIHRlc3RzIGZvciBzdHlsZXMgd2hlbiB0aGUgcHJpbWFyeSBjb21waWxlciB1c2VzIHRoZSB1cGRhdGVSZXNvdXJjZXMgcGF0aFxuICAgIGxldCBzdHlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKGFuYWx5c2lzLnN0eWxlVXJscyAhPT0gbnVsbCkge1xuICAgICAgZm9yIChjb25zdCBzdHlsZVVybCBvZiBhbmFseXNpcy5zdHlsZVVybHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZFN0eWxlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHN0eWxlVXJsLnVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICAgIGNvbnN0IHN0eWxlVGV4dCA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZChyZXNvbHZlZFN0eWxlVXJsKTtcbiAgICAgICAgICBzdHlsZXMucHVzaChzdHlsZVRleHQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgLy8gUmVzb3VyY2UgcmVzb2x2ZSBmYWlsdXJlcyBzaG91bGQgYWxyZWFkeSBiZSBpbiB0aGUgZGlhZ25vc3RpY3MgbGlzdCBmcm9tIHRoZSBhbmFseXplXG4gICAgICAgICAgLy8gc3RhZ2UuIFdlIGRvIG5vdCBuZWVkIHRvIGRvIGFueXRoaW5nIHdpdGggdGhlbSB3aGVuIHVwZGF0aW5nIHJlc291cmNlcy5cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYW5hbHlzaXMuaW5saW5lU3R5bGVzICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlVGV4dCBvZiBhbmFseXNpcy5pbmxpbmVTdHlsZXMpIHtcbiAgICAgICAgc3R5bGVzLnB1c2goc3R5bGVUZXh0KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBzdHlsZVRleHQgb2YgYW5hbHlzaXMudGVtcGxhdGUuc3R5bGVzKSB7XG4gICAgICBzdHlsZXMucHVzaChzdHlsZVRleHQpO1xuICAgIH1cblxuICAgIGFuYWx5c2lzLm1ldGEuc3R5bGVzID0gc3R5bGVzO1xuICB9XG5cbiAgY29tcGlsZUZ1bGwoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPixcbiAgICAgIHJlc29sdXRpb246IFJlYWRvbmx5PENvbXBvbmVudFJlc29sdXRpb25EYXRhPiwgcG9vbDogQ29uc3RhbnRQb29sKTogQ29tcGlsZVJlc3VsdFtdIHtcbiAgICBpZiAoYW5hbHlzaXMudGVtcGxhdGUuZXJyb3JzICE9PSBudWxsICYmIGFuYWx5c2lzLnRlbXBsYXRlLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IG1ldGE6IFIzQ29tcG9uZW50TWV0YWRhdGEgPSB7Li4uYW5hbHlzaXMubWV0YSwgLi4ucmVzb2x1dGlvbn07XG4gICAgY29uc3QgZGVmID0gY29tcGlsZUNvbXBvbmVudEZyb21NZXRhZGF0YShtZXRhLCBwb29sLCBtYWtlQmluZGluZ1BhcnNlcigpKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50KGFuYWx5c2lzLCBkZWYpO1xuICB9XG5cbiAgY29tcGlsZVBhcnRpYWwoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBhbmFseXNpczogUmVhZG9ubHk8Q29tcG9uZW50QW5hbHlzaXNEYXRhPixcbiAgICAgIHJlc29sdXRpb246IFJlYWRvbmx5PENvbXBvbmVudFJlc29sdXRpb25EYXRhPik6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgaWYgKGFuYWx5c2lzLnRlbXBsYXRlLmVycm9ycyAhPT0gbnVsbCAmJiBhbmFseXNpcy50ZW1wbGF0ZS5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBtZXRhOiBSM0NvbXBvbmVudE1ldGFkYXRhID0gey4uLmFuYWx5c2lzLm1ldGEsIC4uLnJlc29sdXRpb259O1xuICAgIGNvbnN0IGRlZiA9IGNvbXBpbGVEZWNsYXJlQ29tcG9uZW50RnJvbU1ldGFkYXRhKG1ldGEsIGFuYWx5c2lzLnRlbXBsYXRlKTtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlQ29tcG9uZW50KGFuYWx5c2lzLCBkZWYpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlQ29tcG9uZW50KFxuICAgICAgYW5hbHlzaXM6IFJlYWRvbmx5PENvbXBvbmVudEFuYWx5c2lzRGF0YT4sXG4gICAgICB7ZXhwcmVzc2lvbjogaW5pdGlhbGl6ZXIsIHR5cGV9OiBSM0NvbXBvbmVudERlZik6IENvbXBpbGVSZXN1bHRbXSB7XG4gICAgY29uc3QgZmFjdG9yeVJlcyA9IGNvbXBpbGVOZ0ZhY3RvcnlEZWZGaWVsZCh7XG4gICAgICAuLi5hbmFseXNpcy5tZXRhLFxuICAgICAgaW5qZWN0Rm46IElkZW50aWZpZXJzLmRpcmVjdGl2ZUluamVjdCxcbiAgICAgIHRhcmdldDogUjNGYWN0b3J5VGFyZ2V0LkNvbXBvbmVudCxcbiAgICB9KTtcbiAgICBpZiAoYW5hbHlzaXMubWV0YWRhdGFTdG10ICE9PSBudWxsKSB7XG4gICAgICBmYWN0b3J5UmVzLnN0YXRlbWVudHMucHVzaChhbmFseXNpcy5tZXRhZGF0YVN0bXQpO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgZmFjdG9yeVJlcywge1xuICAgICAgICBuYW1lOiAnybVjbXAnLFxuICAgICAgICBpbml0aWFsaXplcixcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICAgIHR5cGUsXG4gICAgICB9XG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc29sdmVMaXRlcmFsKGRlY29yYXRvcjogRGVjb3JhdG9yKTogdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24ge1xuICAgIGlmICh0aGlzLmxpdGVyYWxDYWNoZS5oYXMoZGVjb3JhdG9yKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGl0ZXJhbENhY2hlLmdldChkZWNvcmF0b3IpITtcbiAgICB9XG4gICAgaWYgKGRlY29yYXRvci5hcmdzID09PSBudWxsIHx8IGRlY29yYXRvci5hcmdzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEZhdGFsRGlhZ25vc3RpY0Vycm9yKFxuICAgICAgICAgIEVycm9yQ29kZS5ERUNPUkFUT1JfQVJJVFlfV1JPTkcsIERlY29yYXRvci5ub2RlRm9yRXJyb3IoZGVjb3JhdG9yKSxcbiAgICAgICAgICBgSW5jb3JyZWN0IG51bWJlciBvZiBhcmd1bWVudHMgdG8gQENvbXBvbmVudCBkZWNvcmF0b3JgKTtcbiAgICB9XG4gICAgY29uc3QgbWV0YSA9IHVud3JhcEV4cHJlc3Npb24oZGVjb3JhdG9yLmFyZ3NbMF0pO1xuXG4gICAgaWYgKCF0cy5pc09iamVjdExpdGVyYWxFeHByZXNzaW9uKG1ldGEpKSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkRFQ09SQVRPUl9BUkdfTk9UX0xJVEVSQUwsIG1ldGEsIGBEZWNvcmF0b3IgYXJndW1lbnQgbXVzdCBiZSBsaXRlcmFsLmApO1xuICAgIH1cblxuICAgIHRoaXMubGl0ZXJhbENhY2hlLnNldChkZWNvcmF0b3IsIG1ldGEpO1xuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVzb2x2ZUVudW1WYWx1ZShcbiAgICAgIGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGZpZWxkOiBzdHJpbmcsIGVudW1TeW1ib2xOYW1lOiBzdHJpbmcpOiBudW1iZXJ8bnVsbCB7XG4gICAgbGV0IHJlc29sdmVkOiBudW1iZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoZmllbGQpKSB7XG4gICAgICBjb25zdCBleHByID0gY29tcG9uZW50LmdldChmaWVsZCkhO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShleHByKSBhcyBhbnk7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbnVtVmFsdWUgJiYgaXNBbmd1bGFyQ29yZVJlZmVyZW5jZSh2YWx1ZS5lbnVtUmVmLCBlbnVtU3ltYm9sTmFtZSkpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSB2YWx1ZS5yZXNvbHZlZCBhcyBudW1iZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgZXhwciwgdmFsdWUsIGAke2ZpZWxkfSBtdXN0IGJlIGEgbWVtYmVyIG9mICR7ZW51bVN5bWJvbE5hbWV9IGVudW0gZnJvbSBAYW5ndWxhci9jb3JlYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfVxuXG4gIHByaXZhdGUgX2V4dHJhY3RDb21wb25lbnRTdHlsZVVybHMoXG4gICAgICBjb21wb25lbnQ6IE1hcDxzdHJpbmcsIHRzLkV4cHJlc3Npb24+LFxuICAgICAgKTogU3R5bGVVcmxNZXRhW10ge1xuICAgIGlmICghY29tcG9uZW50Lmhhcygnc3R5bGVVcmxzJykpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZXh0cmFjdFN0eWxlVXJsc0Zyb21FeHByZXNzaW9uKGNvbXBvbmVudC5nZXQoJ3N0eWxlVXJscycpISk7XG4gIH1cblxuICBwcml2YXRlIF9leHRyYWN0U3R5bGVVcmxzRnJvbUV4cHJlc3Npb24oc3R5bGVVcmxzRXhwcjogdHMuRXhwcmVzc2lvbik6IFN0eWxlVXJsTWV0YVtdIHtcbiAgICBjb25zdCBzdHlsZVVybHM6IFN0eWxlVXJsTWV0YVtdID0gW107XG5cbiAgICBpZiAodHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IHN0eWxlVXJsRXhwciBvZiBzdHlsZVVybHNFeHByLmVsZW1lbnRzKSB7XG4gICAgICAgIGlmICh0cy5pc1NwcmVhZEVsZW1lbnQoc3R5bGVVcmxFeHByKSkge1xuICAgICAgICAgIHN0eWxlVXJscy5wdXNoKC4uLnRoaXMuX2V4dHJhY3RTdHlsZVVybHNGcm9tRXhwcmVzc2lvbihzdHlsZVVybEV4cHIuZXhwcmVzc2lvbikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0eWxlVXJsID0gdGhpcy5ldmFsdWF0b3IuZXZhbHVhdGUoc3R5bGVVcmxFeHByKTtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygc3R5bGVVcmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKHN0eWxlVXJsRXhwciwgc3R5bGVVcmwsICdzdHlsZVVybCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3R5bGVVcmxzLnB1c2goe1xuICAgICAgICAgICAgdXJsOiBzdHlsZVVybCxcbiAgICAgICAgICAgIHNvdXJjZTogUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IsXG4gICAgICAgICAgICBub2RlRm9yRXJyb3I6IHN0eWxlVXJsRXhwcixcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBldmFsdWF0ZWRTdHlsZVVybHMgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShzdHlsZVVybHNFeHByKTtcbiAgICAgIGlmICghaXNTdHJpbmdBcnJheShldmFsdWF0ZWRTdHlsZVVybHMpKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoXG4gICAgICAgICAgICBzdHlsZVVybHNFeHByLCBldmFsdWF0ZWRTdHlsZVVybHMsICdzdHlsZVVybHMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3Qgc3R5bGVVcmwgb2YgZXZhbHVhdGVkU3R5bGVVcmxzKSB7XG4gICAgICAgIHN0eWxlVXJscy5wdXNoKHtcbiAgICAgICAgICB1cmw6IHN0eWxlVXJsLFxuICAgICAgICAgIHNvdXJjZTogUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21EZWNvcmF0b3IsXG4gICAgICAgICAgbm9kZUZvckVycm9yOiBzdHlsZVVybHNFeHByLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVVcmxzO1xuICB9XG5cbiAgcHJpdmF0ZSBfZXh0cmFjdFN0eWxlUmVzb3VyY2VzKGNvbXBvbmVudDogTWFwPHN0cmluZywgdHMuRXhwcmVzc2lvbj4sIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOlxuICAgICAgUmVhZG9ubHlTZXQ8UmVzb3VyY2U+IHtcbiAgICBjb25zdCBzdHlsZXMgPSBuZXcgU2V0PFJlc291cmNlPigpO1xuICAgIGZ1bmN0aW9uIHN0cmluZ0xpdGVyYWxFbGVtZW50cyhhcnJheTogdHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbik6IHRzLlN0cmluZ0xpdGVyYWxMaWtlW10ge1xuICAgICAgcmV0dXJuIGFycmF5LmVsZW1lbnRzLmZpbHRlcihcbiAgICAgICAgICAoZTogdHMuRXhwcmVzc2lvbik6IGUgaXMgdHMuU3RyaW5nTGl0ZXJhbExpa2UgPT4gdHMuaXNTdHJpbmdMaXRlcmFsTGlrZShlKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgc3R5bGVVcmxzIGlzIGEgbGl0ZXJhbCBhcnJheSwgcHJvY2VzcyBlYWNoIHJlc291cmNlIHVybCBpbmRpdmlkdWFsbHkgYW5kXG4gICAgLy8gcmVnaXN0ZXIgb25lcyB0aGF0IGFyZSBzdHJpbmcgbGl0ZXJhbHMuXG4gICAgY29uc3Qgc3R5bGVVcmxzRXhwciA9IGNvbXBvbmVudC5nZXQoJ3N0eWxlVXJscycpO1xuICAgIGlmIChzdHlsZVVybHNFeHByICE9PSB1bmRlZmluZWQgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4cHJlc3Npb24gb2Ygc3RyaW5nTGl0ZXJhbEVsZW1lbnRzKHN0eWxlVXJsc0V4cHIpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzb3VyY2VVcmwgPSB0aGlzLnJlc291cmNlTG9hZGVyLnJlc29sdmUoZXhwcmVzc2lvbi50ZXh0LCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgICAgc3R5bGVzLmFkZCh7cGF0aDogYWJzb2x1dGVGcm9tKHJlc291cmNlVXJsKSwgZXhwcmVzc2lvbn0pO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAvLyBFcnJvcnMgaW4gc3R5bGUgcmVzb3VyY2UgZXh0cmFjdGlvbiBkbyBub3QgbmVlZCB0byBiZSBoYW5kbGVkIGhlcmUuIFdlIHdpbGwgcHJvZHVjZVxuICAgICAgICAgIC8vIGRpYWdub3N0aWNzIGZvciBlYWNoIG9uZSB0aGF0IGZhaWxzIGluIHRoZSBhbmFseXNpcywgYWZ0ZXIgd2UgZXZhbHVhdGUgdGhlIGBzdHlsZVVybHNgXG4gICAgICAgICAgLy8gZXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgX2FsbF8gc3R5bGUgcmVzb3VyY2VzLCBub3QganVzdCB0aGUgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3R5bGVzRXhwciA9IGNvbXBvbmVudC5nZXQoJ3N0eWxlcycpO1xuICAgIGlmIChzdHlsZXNFeHByICE9PSB1bmRlZmluZWQgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHN0eWxlc0V4cHIpKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4cHJlc3Npb24gb2Ygc3RyaW5nTGl0ZXJhbEVsZW1lbnRzKHN0eWxlc0V4cHIpKSB7XG4gICAgICAgIHN0eWxlcy5hZGQoe3BhdGg6IG51bGwsIGV4cHJlc3Npb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3R5bGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHJlbG9hZEFuZFBhcnNlVGVtcGxhdGUoXG4gICAgICBub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCBkZWNvcmF0b3I6IERlY29yYXRvciwgY29tcG9uZW50OiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPixcbiAgICAgIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlZFRlbXBsYXRlV2l0aFNvdXJjZXxudWxsPiB7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3RlbXBsYXRlVXJsJykpIHtcbiAgICAgIC8vIEV4dHJhY3QgdGhlIHRlbXBsYXRlVXJsIGFuZCBwcmVsb2FkIGl0LlxuICAgICAgY29uc3QgdGVtcGxhdGVVcmxFeHByID0gY29tcG9uZW50LmdldCgndGVtcGxhdGVVcmwnKSE7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlVXJsRXhwcik7XG4gICAgICBpZiAodHlwZW9mIHRlbXBsYXRlVXJsICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgdGVtcGxhdGVVcmxFeHByLCB0ZW1wbGF0ZVVybCwgJ3RlbXBsYXRlVXJsIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc291cmNlVXJsID0gdGhpcy5yZXNvdXJjZUxvYWRlci5yZXNvbHZlKHRlbXBsYXRlVXJsLCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUHJvbWlzZSA9IHRoaXMucmVzb3VyY2VMb2FkZXIucHJlbG9hZChyZXNvdXJjZVVybCk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHByZWxvYWQgd29ya2VkLCB0aGVuIGFjdHVhbGx5IGxvYWQgYW5kIHBhcnNlIHRoZSB0ZW1wbGF0ZSwgYW5kIHdhaXQgZm9yIGFueSBzdHlsZVxuICAgICAgICAvLyBVUkxzIHRvIHJlc29sdmUuXG4gICAgICAgIGlmICh0ZW1wbGF0ZVByb21pc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZVByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZURlY2wgPVxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VUZW1wbGF0ZURlY2xhcmF0aW9uKGRlY29yYXRvciwgY29tcG9uZW50LCBjb250YWluaW5nRmlsZSk7XG4gICAgICAgICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZXh0cmFjdFRlbXBsYXRlKG5vZGUsIHRlbXBsYXRlRGVjbCk7XG4gICAgICAgICAgICB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLnNldChub2RlLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyB0aGlzLm1ha2VSZXNvdXJjZU5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCwgdGVtcGxhdGVVcmxFeHByLCBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5UZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlRGVjbCA9IHRoaXMucGFyc2VUZW1wbGF0ZURlY2xhcmF0aW9uKGRlY29yYXRvciwgY29tcG9uZW50LCBjb250YWluaW5nRmlsZSk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuZXh0cmFjdFRlbXBsYXRlKG5vZGUsIHRlbXBsYXRlRGVjbCk7XG4gICAgICB0aGlzLnByZWFuYWx5emVUZW1wbGF0ZUNhY2hlLnNldChub2RlLCB0ZW1wbGF0ZSk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRlbXBsYXRlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RUZW1wbGF0ZShub2RlOiBDbGFzc0RlY2xhcmF0aW9uLCB0ZW1wbGF0ZTogVGVtcGxhdGVEZWNsYXJhdGlvbik6XG4gICAgICBQYXJzZWRUZW1wbGF0ZVdpdGhTb3VyY2Uge1xuICAgIGlmICh0ZW1wbGF0ZS5pc0lubGluZSkge1xuICAgICAgbGV0IHRlbXBsYXRlU3RyOiBzdHJpbmc7XG4gICAgICBsZXQgdGVtcGxhdGVMaXRlcmFsOiB0cy5Ob2RlfG51bGwgPSBudWxsO1xuICAgICAgbGV0IHRlbXBsYXRlVXJsOiBzdHJpbmcgPSAnJztcbiAgICAgIGxldCB0ZW1wbGF0ZVJhbmdlOiBMZXhlclJhbmdlfG51bGwgPSBudWxsO1xuICAgICAgbGV0IHNvdXJjZU1hcHBpbmc6IFRlbXBsYXRlU291cmNlTWFwcGluZztcbiAgICAgIGxldCBlc2NhcGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICAvLyBXZSBvbmx5IHN1cHBvcnQgU291cmNlTWFwcyBmb3IgaW5saW5lIHRlbXBsYXRlcyB0aGF0IGFyZSBzaW1wbGUgc3RyaW5nIGxpdGVyYWxzLlxuICAgICAgaWYgKHRzLmlzU3RyaW5nTGl0ZXJhbCh0ZW1wbGF0ZS5leHByZXNzaW9uKSB8fFxuICAgICAgICAgIHRzLmlzTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWwodGVtcGxhdGUuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgLy8gdGhlIHN0YXJ0IGFuZCBlbmQgb2YgdGhlIGB0ZW1wbGF0ZUV4cHJgIG5vZGUgaW5jbHVkZXMgdGhlIHF1b3RhdGlvbiBtYXJrcywgd2hpY2ggd2UgbXVzdFxuICAgICAgICAvLyBzdHJpcFxuICAgICAgICB0ZW1wbGF0ZVJhbmdlID0gZ2V0VGVtcGxhdGVSYW5nZSh0ZW1wbGF0ZS5leHByZXNzaW9uKTtcbiAgICAgICAgdGVtcGxhdGVTdHIgPSB0ZW1wbGF0ZS5leHByZXNzaW9uLmdldFNvdXJjZUZpbGUoKS50ZXh0O1xuICAgICAgICB0ZW1wbGF0ZUxpdGVyYWwgPSB0ZW1wbGF0ZS5leHByZXNzaW9uO1xuICAgICAgICB0ZW1wbGF0ZVVybCA9IHRlbXBsYXRlLnRlbXBsYXRlVXJsO1xuICAgICAgICBlc2NhcGVkU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgc291cmNlTWFwcGluZyA9IHtcbiAgICAgICAgICB0eXBlOiAnZGlyZWN0JyxcbiAgICAgICAgICBub2RlOiB0ZW1wbGF0ZS5leHByZXNzaW9uLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRUZW1wbGF0ZSA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKHRlbXBsYXRlLmV4cHJlc3Npb24pO1xuICAgICAgICBpZiAodHlwZW9mIHJlc29sdmVkVGVtcGxhdGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICAgICAgdGVtcGxhdGUuZXhwcmVzc2lvbiwgcmVzb2x2ZWRUZW1wbGF0ZSwgJ3RlbXBsYXRlIG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wbGF0ZVN0ciA9IHJlc29sdmVkVGVtcGxhdGU7XG4gICAgICAgIHNvdXJjZU1hcHBpbmcgPSB7XG4gICAgICAgICAgdHlwZTogJ2luZGlyZWN0JyxcbiAgICAgICAgICBub2RlOiB0ZW1wbGF0ZS5leHByZXNzaW9uLFxuICAgICAgICAgIGNvbXBvbmVudENsYXNzOiBub2RlLFxuICAgICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVN0cixcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4udGhpcy5fcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGVtcGxhdGVTdHIsIHRlbXBsYXRlUmFuZ2UsIGVzY2FwZWRTdHJpbmcpLFxuICAgICAgICBzb3VyY2VNYXBwaW5nLFxuICAgICAgICBkZWNsYXJhdGlvbjogdGVtcGxhdGUsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0ZW1wbGF0ZVN0ciA9IHRoaXMucmVzb3VyY2VMb2FkZXIubG9hZCh0ZW1wbGF0ZS5yZXNvbHZlZFRlbXBsYXRlVXJsKTtcbiAgICAgIGlmICh0aGlzLmRlcFRyYWNrZXIgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5kZXBUcmFja2VyLmFkZFJlc291cmNlRGVwZW5kZW5jeShcbiAgICAgICAgICAgIG5vZGUuZ2V0U291cmNlRmlsZSgpLCBhYnNvbHV0ZUZyb20odGVtcGxhdGUucmVzb2x2ZWRUZW1wbGF0ZVVybCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi50aGlzLl9wYXJzZVRlbXBsYXRlKFxuICAgICAgICAgICAgdGVtcGxhdGUsIHRlbXBsYXRlU3RyLCAvKiB0ZW1wbGF0ZVJhbmdlICovIG51bGwsXG4gICAgICAgICAgICAvKiBlc2NhcGVkU3RyaW5nICovIGZhbHNlKSxcbiAgICAgICAgc291cmNlTWFwcGluZzoge1xuICAgICAgICAgIHR5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgY29tcG9uZW50Q2xhc3M6IG5vZGUsXG4gICAgICAgICAgLy8gVE9ETyhhbHhodWIpOiBUUyBpbiBnMyBpcyB1bmFibGUgdG8gbWFrZSB0aGlzIGluZmVyZW5jZSBvbiBpdHMgb3duLCBzbyBjYXN0IGl0IGhlcmVcbiAgICAgICAgICAvLyB1bnRpbCBnMyBpcyBhYmxlIHRvIGZpZ3VyZSB0aGlzIG91dC5cbiAgICAgICAgICBub2RlOiAodGVtcGxhdGUgYXMgRXh0ZXJuYWxUZW1wbGF0ZURlY2xhcmF0aW9uKS50ZW1wbGF0ZVVybEV4cHJlc3Npb24sXG4gICAgICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlU3RyLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiB0ZW1wbGF0ZS5yZXNvbHZlZFRlbXBsYXRlVXJsLFxuICAgICAgICB9LFxuICAgICAgICBkZWNsYXJhdGlvbjogdGVtcGxhdGUsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlVGVtcGxhdGUoXG4gICAgICB0ZW1wbGF0ZTogVGVtcGxhdGVEZWNsYXJhdGlvbiwgdGVtcGxhdGVTdHI6IHN0cmluZywgdGVtcGxhdGVSYW5nZTogTGV4ZXJSYW5nZXxudWxsLFxuICAgICAgZXNjYXBlZFN0cmluZzogYm9vbGVhbik6IFBhcnNlZENvbXBvbmVudFRlbXBsYXRlIHtcbiAgICAvLyBXZSBhbHdheXMgbm9ybWFsaXplIGxpbmUgZW5kaW5ncyBpZiB0aGUgdGVtcGxhdGUgaGFzIGJlZW4gZXNjYXBlZCAoaS5lLiBpcyBpbmxpbmUpLlxuICAgIGNvbnN0IGkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVcyA9IGVzY2FwZWRTdHJpbmcgfHwgdGhpcy5pMThuTm9ybWFsaXplTGluZUVuZGluZ3NJbklDVXM7XG5cbiAgICBjb25zdCBwYXJzZWRUZW1wbGF0ZSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGVTdHIsIHRlbXBsYXRlLnNvdXJjZU1hcFVybCwge1xuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogdGVtcGxhdGUucHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IHRlbXBsYXRlLmludGVycG9sYXRpb25Db25maWcsXG4gICAgICByYW5nZTogdGVtcGxhdGVSYW5nZSA/PyB1bmRlZmluZWQsXG4gICAgICBlc2NhcGVkU3RyaW5nLFxuICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogdGhpcy5lbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0LFxuICAgICAgaTE4bk5vcm1hbGl6ZUxpbmVFbmRpbmdzSW5JQ1VzLFxuICAgICAgaXNJbmxpbmU6IHRlbXBsYXRlLmlzSW5saW5lLFxuICAgICAgYWx3YXlzQXR0ZW1wdEh0bWxUb1IzQXN0Q29udmVyc2lvbjogdGhpcy51c2VQb2lzb25lZERhdGEsXG4gICAgfSk7XG5cbiAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGUgcHJpbWFyeSBwYXJzZSBvZiB0aGUgdGVtcGxhdGUgYWJvdmUgbWF5IG5vdCBjb250YWluIGFjY3VyYXRlIHNvdXJjZSBtYXBcbiAgICAvLyBpbmZvcm1hdGlvbi4gSWYgdXNlZCBkaXJlY3RseSwgaXQgd291bGQgcmVzdWx0IGluIGluY29ycmVjdCBjb2RlIGxvY2F0aW9ucyBpbiB0ZW1wbGF0ZVxuICAgIC8vIGVycm9ycywgZXRjLiBUaGVyZSBhcmUgdGhyZWUgbWFpbiBwcm9ibGVtczpcbiAgICAvL1xuICAgIC8vIDEuIGBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZWAgYW5uaWhpbGF0ZXMgdGhlIGNvcnJlY3RuZXNzIG9mIHRlbXBsYXRlIHNvdXJjZSBtYXBwaW5nLCBhc1xuICAgIC8vICAgIHRoZSB3aGl0ZXNwYWNlIHRyYW5zZm9ybWF0aW9uIGNoYW5nZXMgdGhlIGNvbnRlbnRzIG9mIEhUTUwgdGV4dCBub2RlcyBiZWZvcmUgdGhleSdyZVxuICAgIC8vICAgIHBhcnNlZCBpbnRvIEFuZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAgLy8gMi4gYHByZXNlcnZlTGluZUVuZGluZ3M6IGZhbHNlYCBjYXVzZXMgZ3Jvd2luZyBtaXNhbGlnbm1lbnRzIGluIHRlbXBsYXRlcyB0aGF0IHVzZSAnXFxyXFxuJ1xuICAgIC8vICAgIGxpbmUgZW5kaW5ncywgYnkgbm9ybWFsaXppbmcgdGhlbSB0byAnXFxuJy5cbiAgICAvLyAzLiBCeSBkZWZhdWx0LCB0aGUgdGVtcGxhdGUgcGFyc2VyIHN0cmlwcyBsZWFkaW5nIHRyaXZpYSBjaGFyYWN0ZXJzIChsaWtlIHNwYWNlcywgdGFicywgYW5kXG4gICAgLy8gICAgbmV3bGluZXMpLiBUaGlzIGFsc28gZGVzdHJveXMgc291cmNlIG1hcHBpbmcgaW5mb3JtYXRpb24uXG4gICAgLy9cbiAgICAvLyBJbiBvcmRlciB0byBndWFyYW50ZWUgdGhlIGNvcnJlY3RuZXNzIG9mIGRpYWdub3N0aWNzLCB0ZW1wbGF0ZXMgYXJlIHBhcnNlZCBhIHNlY29uZCB0aW1lXG4gICAgLy8gd2l0aCB0aGUgYWJvdmUgb3B0aW9ucyBzZXQgdG8gcHJlc2VydmUgc291cmNlIG1hcHBpbmdzLlxuXG4gICAgY29uc3Qge25vZGVzOiBkaWFnTm9kZXN9ID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZVN0ciwgdGVtcGxhdGUuc291cmNlTWFwVXJsLCB7XG4gICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiB0cnVlLFxuICAgICAgcHJlc2VydmVMaW5lRW5kaW5nczogdHJ1ZSxcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IHRlbXBsYXRlLmludGVycG9sYXRpb25Db25maWcsXG4gICAgICByYW5nZTogdGVtcGxhdGVSYW5nZSA/PyB1bmRlZmluZWQsXG4gICAgICBlc2NhcGVkU3RyaW5nLFxuICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdDogdGhpcy5lbmFibGVJMThuTGVnYWN5TWVzc2FnZUlkRm9ybWF0LFxuICAgICAgaTE4bk5vcm1hbGl6ZUxpbmVFbmRpbmdzSW5JQ1VzLFxuICAgICAgbGVhZGluZ1RyaXZpYUNoYXJzOiBbXSxcbiAgICAgIGlzSW5saW5lOiB0ZW1wbGF0ZS5pc0lubGluZSxcbiAgICAgIGFsd2F5c0F0dGVtcHRIdG1sVG9SM0FzdENvbnZlcnNpb246IHRoaXMudXNlUG9pc29uZWREYXRhLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnBhcnNlZFRlbXBsYXRlLFxuICAgICAgZGlhZ05vZGVzLFxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLmlzSW5saW5lID8gbmV3IFdyYXBwZWROb2RlRXhwcih0ZW1wbGF0ZS5leHByZXNzaW9uKSA6IHRlbXBsYXRlU3RyLFxuICAgICAgdGVtcGxhdGVVcmw6IHRlbXBsYXRlLnJlc29sdmVkVGVtcGxhdGVVcmwsXG4gICAgICBpc0lubGluZTogdGVtcGxhdGUuaXNJbmxpbmUsXG4gICAgICBmaWxlOiBuZXcgUGFyc2VTb3VyY2VGaWxlKHRlbXBsYXRlU3RyLCB0ZW1wbGF0ZS5yZXNvbHZlZFRlbXBsYXRlVXJsKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBwYXJzZVRlbXBsYXRlRGVjbGFyYXRpb24oXG4gICAgICBkZWNvcmF0b3I6IERlY29yYXRvciwgY29tcG9uZW50OiBNYXA8c3RyaW5nLCB0cy5FeHByZXNzaW9uPixcbiAgICAgIGNvbnRhaW5pbmdGaWxlOiBzdHJpbmcpOiBUZW1wbGF0ZURlY2xhcmF0aW9uIHtcbiAgICBsZXQgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbiA9IHRoaXMuZGVmYXVsdFByZXNlcnZlV2hpdGVzcGFjZXM7XG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3ByZXNlcnZlV2hpdGVzcGFjZXMnKSkge1xuICAgICAgY29uc3QgZXhwciA9IGNvbXBvbmVudC5nZXQoJ3ByZXNlcnZlV2hpdGVzcGFjZXMnKSE7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXZhbHVhdG9yLmV2YWx1YXRlKGV4cHIpO1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IGNyZWF0ZVZhbHVlSGFzV3JvbmdUeXBlRXJyb3IoZXhwciwgdmFsdWUsICdwcmVzZXJ2ZVdoaXRlc3BhY2VzIG11c3QgYmUgYSBib29sZWFuJyk7XG4gICAgICB9XG4gICAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzID0gdmFsdWU7XG4gICAgfVxuXG4gICAgbGV0IGludGVycG9sYXRpb25Db25maWcgPSBERUZBVUxUX0lOVEVSUE9MQVRJT05fQ09ORklHO1xuICAgIGlmIChjb21wb25lbnQuaGFzKCdpbnRlcnBvbGF0aW9uJykpIHtcbiAgICAgIGNvbnN0IGV4cHIgPSBjb21wb25lbnQuZ2V0KCdpbnRlcnBvbGF0aW9uJykhO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZShleHByKTtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUubGVuZ3RoICE9PSAyIHx8XG4gICAgICAgICAgIXZhbHVlLmV2ZXJ5KGVsZW1lbnQgPT4gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSkge1xuICAgICAgICB0aHJvdyBjcmVhdGVWYWx1ZUhhc1dyb25nVHlwZUVycm9yKFxuICAgICAgICAgICAgZXhwciwgdmFsdWUsICdpbnRlcnBvbGF0aW9uIG11c3QgYmUgYW4gYXJyYXkgd2l0aCAyIGVsZW1lbnRzIG9mIHN0cmluZyB0eXBlJyk7XG4gICAgICB9XG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnID0gSW50ZXJwb2xhdGlvbkNvbmZpZy5mcm9tQXJyYXkodmFsdWUgYXMgW3N0cmluZywgc3RyaW5nXSk7XG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudC5oYXMoJ3RlbXBsYXRlVXJsJykpIHtcbiAgICAgIGNvbnN0IHRlbXBsYXRlVXJsRXhwciA9IGNvbXBvbmVudC5nZXQoJ3RlbXBsYXRlVXJsJykhO1xuICAgICAgY29uc3QgdGVtcGxhdGVVcmwgPSB0aGlzLmV2YWx1YXRvci5ldmFsdWF0ZSh0ZW1wbGF0ZVVybEV4cHIpO1xuICAgICAgaWYgKHR5cGVvZiB0ZW1wbGF0ZVVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgY3JlYXRlVmFsdWVIYXNXcm9uZ1R5cGVFcnJvcihcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsRXhwciwgdGVtcGxhdGVVcmwsICd0ZW1wbGF0ZVVybCBtdXN0IGJlIGEgc3RyaW5nJyk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNvdXJjZVVybCA9IHRoaXMucmVzb3VyY2VMb2FkZXIucmVzb2x2ZSh0ZW1wbGF0ZVVybCwgY29udGFpbmluZ0ZpbGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlzSW5saW5lOiBmYWxzZSxcbiAgICAgICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgICAgICAgdGVtcGxhdGVVcmwsXG4gICAgICAgICAgdGVtcGxhdGVVcmxFeHByZXNzaW9uOiB0ZW1wbGF0ZVVybEV4cHIsXG4gICAgICAgICAgcmVzb2x2ZWRUZW1wbGF0ZVVybDogcmVzb3VyY2VVcmwsXG4gICAgICAgICAgc291cmNlTWFwVXJsOiBzb3VyY2VNYXBVcmwocmVzb3VyY2VVcmwpLFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICB0aHJvdyB0aGlzLm1ha2VSZXNvdXJjZU5vdEZvdW5kRXJyb3IoXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybCwgdGVtcGxhdGVVcmxFeHByLCBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5UZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb21wb25lbnQuaGFzKCd0ZW1wbGF0ZScpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpc0lubGluZTogdHJ1ZSxcbiAgICAgICAgaW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgICAgZXhwcmVzc2lvbjogY29tcG9uZW50LmdldCgndGVtcGxhdGUnKSEsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBjb250YWluaW5nRmlsZSxcbiAgICAgICAgcmVzb2x2ZWRUZW1wbGF0ZVVybDogY29udGFpbmluZ0ZpbGUsXG4gICAgICAgIHNvdXJjZU1hcFVybDogY29udGFpbmluZ0ZpbGUsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxEaWFnbm9zdGljRXJyb3IoXG4gICAgICAgICAgRXJyb3JDb2RlLkNPTVBPTkVOVF9NSVNTSU5HX1RFTVBMQVRFLCBEZWNvcmF0b3Iubm9kZUZvckVycm9yKGRlY29yYXRvciksXG4gICAgICAgICAgJ2NvbXBvbmVudCBpcyBtaXNzaW5nIGEgdGVtcGxhdGUnKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZXNvbHZlSW1wb3J0ZWRGaWxlKGltcG9ydGVkRmlsZTogSW1wb3J0ZWRGaWxlLCBleHByOiBFeHByZXNzaW9uLCBvcmlnaW46IHRzLlNvdXJjZUZpbGUpOlxuICAgICAgdHMuU291cmNlRmlsZXxudWxsIHtcbiAgICAvLyBJZiBgaW1wb3J0ZWRGaWxlYCBpcyBub3QgJ3Vua25vd24nIHRoZW4gaXQgYWNjdXJhdGVseSByZWZsZWN0cyB0aGUgc291cmNlIGZpbGUgdGhhdCBpc1xuICAgIC8vIGJlaW5nIGltcG9ydGVkLlxuICAgIGlmIChpbXBvcnRlZEZpbGUgIT09ICd1bmtub3duJykge1xuICAgICAgcmV0dXJuIGltcG9ydGVkRmlsZTtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UgYGV4cHJgIGhhcyB0byBiZSBpbnNwZWN0ZWQgdG8gZGV0ZXJtaW5lIHRoZSBmaWxlIHRoYXQgaXMgYmVpbmcgaW1wb3J0ZWQuIElmIGBleHByYFxuICAgIC8vIGlzIG5vdCBhbiBgRXh0ZXJuYWxFeHByYCB0aGVuIGl0IGRvZXMgbm90IGNvcnJlc3BvbmQgd2l0aCBhbiBpbXBvcnQsIHNvIHJldHVybiBudWxsIGluIHRoYXRcbiAgICAvLyBjYXNlLlxuICAgIGlmICghKGV4cHIgaW5zdGFuY2VvZiBFeHRlcm5hbEV4cHIpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBGaWd1cmUgb3V0IHdoYXQgZmlsZSBpcyBiZWluZyBpbXBvcnRlZC5cbiAgICByZXR1cm4gdGhpcy5tb2R1bGVSZXNvbHZlci5yZXNvbHZlTW9kdWxlKGV4cHIudmFsdWUubW9kdWxlTmFtZSEsIG9yaWdpbi5maWxlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhZGRpbmcgYW4gaW1wb3J0IGZyb20gYG9yaWdpbmAgdG8gdGhlIHNvdXJjZS1maWxlIGNvcnJlc3BvbmRpbmcgdG8gYGV4cHJgIHdvdWxkXG4gICAqIGNyZWF0ZSBhIGN5Y2xpYyBpbXBvcnQuXG4gICAqXG4gICAqIEByZXR1cm5zIGEgYEN5Y2xlYCBvYmplY3QgaWYgYSBjeWNsZSB3b3VsZCBiZSBjcmVhdGVkLCBvdGhlcndpc2UgYG51bGxgLlxuICAgKi9cbiAgcHJpdmF0ZSBfY2hlY2tGb3JDeWNsaWNJbXBvcnQoXG4gICAgICBpbXBvcnRlZEZpbGU6IEltcG9ydGVkRmlsZSwgZXhwcjogRXhwcmVzc2lvbiwgb3JpZ2luOiB0cy5Tb3VyY2VGaWxlKTogQ3ljbGV8bnVsbCB7XG4gICAgY29uc3QgaW1wb3J0ZWQgPSB0aGlzLl9yZXNvbHZlSW1wb3J0ZWRGaWxlKGltcG9ydGVkRmlsZSwgZXhwciwgb3JpZ2luKTtcbiAgICBpZiAoaW1wb3J0ZWQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBpbXBvcnQgaXMgbGVnYWwuXG4gICAgcmV0dXJuIHRoaXMuY3ljbGVBbmFseXplci53b3VsZENyZWF0ZUN5Y2xlKG9yaWdpbiwgaW1wb3J0ZWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVjb3JkU3ludGhldGljSW1wb3J0KFxuICAgICAgaW1wb3J0ZWRGaWxlOiBJbXBvcnRlZEZpbGUsIGV4cHI6IEV4cHJlc3Npb24sIG9yaWdpbjogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGNvbnN0IGltcG9ydGVkID0gdGhpcy5fcmVzb2x2ZUltcG9ydGVkRmlsZShpbXBvcnRlZEZpbGUsIGV4cHIsIG9yaWdpbik7XG4gICAgaWYgKGltcG9ydGVkID09PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jeWNsZUFuYWx5emVyLnJlY29yZFN5bnRoZXRpY0ltcG9ydChvcmlnaW4sIGltcG9ydGVkKTtcbiAgfVxuXG4gIHByaXZhdGUgbWFrZVJlc291cmNlTm90Rm91bmRFcnJvcihcbiAgICAgIGZpbGU6IHN0cmluZywgbm9kZUZvckVycm9yOiB0cy5Ob2RlLFxuICAgICAgcmVzb3VyY2VUeXBlOiBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcyk6IEZhdGFsRGlhZ25vc3RpY0Vycm9yIHtcbiAgICBsZXQgZXJyb3JUZXh0OiBzdHJpbmc7XG4gICAgc3dpdGNoIChyZXNvdXJjZVR5cGUpIHtcbiAgICAgIGNhc2UgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuVGVtcGxhdGU6XG4gICAgICAgIGVycm9yVGV4dCA9IGBDb3VsZCBub3QgZmluZCB0ZW1wbGF0ZSBmaWxlICcke2ZpbGV9Jy5gO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgUmVzb3VyY2VUeXBlRm9yRGlhZ25vc3RpY3MuU3R5bGVzaGVldEZyb21UZW1wbGF0ZTpcbiAgICAgICAgZXJyb3JUZXh0ID0gYENvdWxkIG5vdCBmaW5kIHN0eWxlc2hlZXQgZmlsZSAnJHtmaWxlfScgbGlua2VkIGZyb20gdGhlIHRlbXBsYXRlLmA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBSZXNvdXJjZVR5cGVGb3JEaWFnbm9zdGljcy5TdHlsZXNoZWV0RnJvbURlY29yYXRvcjpcbiAgICAgICAgZXJyb3JUZXh0ID0gYENvdWxkIG5vdCBmaW5kIHN0eWxlc2hlZXQgZmlsZSAnJHtmaWxlfScuYDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBGYXRhbERpYWdub3N0aWNFcnJvcihcbiAgICAgICAgRXJyb3JDb2RlLkNPTVBPTkVOVF9SRVNPVVJDRV9OT1RfRk9VTkQsIG5vZGVGb3JFcnJvciwgZXJyb3JUZXh0KTtcbiAgfVxuXG4gIHByaXZhdGUgX2V4dHJhY3RUZW1wbGF0ZVN0eWxlVXJscyh0ZW1wbGF0ZTogUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlKTogU3R5bGVVcmxNZXRhW10ge1xuICAgIGlmICh0ZW1wbGF0ZS5zdHlsZVVybHMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlRm9yRXJyb3IgPSBnZXRUZW1wbGF0ZURlY2xhcmF0aW9uTm9kZUZvckVycm9yKHRlbXBsYXRlLmRlY2xhcmF0aW9uKTtcbiAgICByZXR1cm4gdGVtcGxhdGUuc3R5bGVVcmxzLm1hcChcbiAgICAgICAgdXJsID0+ICh7dXJsLCBzb3VyY2U6IFJlc291cmNlVHlwZUZvckRpYWdub3N0aWNzLlN0eWxlc2hlZXRGcm9tVGVtcGxhdGUsIG5vZGVGb3JFcnJvcn0pKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUZW1wbGF0ZVJhbmdlKHRlbXBsYXRlRXhwcjogdHMuRXhwcmVzc2lvbikge1xuICBjb25zdCBzdGFydFBvcyA9IHRlbXBsYXRlRXhwci5nZXRTdGFydCgpICsgMTtcbiAgY29uc3Qge2xpbmUsIGNoYXJhY3Rlcn0gPVxuICAgICAgdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24odGVtcGxhdGVFeHByLmdldFNvdXJjZUZpbGUoKSwgc3RhcnRQb3MpO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0UG9zLFxuICAgIHN0YXJ0TGluZTogbGluZSxcbiAgICBzdGFydENvbDogY2hhcmFjdGVyLFxuICAgIGVuZFBvczogdGVtcGxhdGVFeHByLmdldEVuZCgpIC0gMSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gc291cmNlTWFwVXJsKHJlc291cmNlVXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoIXRzU291cmNlTWFwQnVnMjkzMDBGaXhlZCgpKSB7XG4gICAgLy8gQnkgcmVtb3ZpbmcgdGhlIHRlbXBsYXRlIFVSTCB3ZSBhcmUgdGVsbGluZyB0aGUgdHJhbnNsYXRvciBub3QgdG8gdHJ5IHRvXG4gICAgLy8gbWFwIHRoZSBleHRlcm5hbCBzb3VyY2UgZmlsZSB0byB0aGUgZ2VuZXJhdGVkIGNvZGUsIHNpbmNlIHRoZSB2ZXJzaW9uXG4gICAgLy8gb2YgVFMgdGhhdCBpcyBydW5uaW5nIGRvZXMgbm90IHN1cHBvcnQgaXQuXG4gICAgcmV0dXJuICcnO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiByZXNvdXJjZVVybDtcbiAgfVxufVxuXG4vKiogRGV0ZXJtaW5lcyBpZiB0aGUgcmVzdWx0IG9mIGFuIGV2YWx1YXRpb24gaXMgYSBzdHJpbmcgYXJyYXkuICovXG5mdW5jdGlvbiBpc1N0cmluZ0FycmF5KHJlc29sdmVkVmFsdWU6IFJlc29sdmVkVmFsdWUpOiByZXNvbHZlZFZhbHVlIGlzIHN0cmluZ1tdIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzb2x2ZWRWYWx1ZSkgJiYgcmVzb2x2ZWRWYWx1ZS5ldmVyeShlbGVtID0+IHR5cGVvZiBlbGVtID09PSAnc3RyaW5nJyk7XG59XG5cbi8qKiBEZXRlcm1pbmVzIHRoZSBub2RlIHRvIHVzZSBmb3IgZGVidWdnaW5nIHB1cnBvc2VzIGZvciB0aGUgZ2l2ZW4gVGVtcGxhdGVEZWNsYXJhdGlvbi4gKi9cbmZ1bmN0aW9uIGdldFRlbXBsYXRlRGVjbGFyYXRpb25Ob2RlRm9yRXJyb3IoZGVjbGFyYXRpb246IFRlbXBsYXRlRGVjbGFyYXRpb24pOiB0cy5Ob2RlIHtcbiAgLy8gVE9ETyh6YXJlbmQpOiBDaGFuZ2UgdGhpcyB0byBpZi9lbHNlIHdoZW4gdGhhdCBpcyBjb21wYXRpYmxlIHdpdGggZzMuIFRoaXMgdXNlcyBhIHN3aXRjaFxuICAvLyBiZWNhdXNlIGlmL2Vsc2UgZmFpbHMgdG8gY29tcGlsZSBvbiBnMy4gVGhhdCBpcyBiZWNhdXNlIGczIGNvbXBpbGVzIHRoaXMgaW4gbm9uLXN0cmljdCBtb2RlXG4gIC8vIHdoZXJlIHR5cGUgaW5mZXJlbmNlIGRvZXMgbm90IHdvcmsgY29ycmVjdGx5LlxuICBzd2l0Y2ggKGRlY2xhcmF0aW9uLmlzSW5saW5lKSB7XG4gICAgY2FzZSB0cnVlOlxuICAgICAgcmV0dXJuIGRlY2xhcmF0aW9uLmV4cHJlc3Npb247XG4gICAgY2FzZSBmYWxzZTpcbiAgICAgIHJldHVybiBkZWNsYXJhdGlvbi50ZW1wbGF0ZVVybEV4cHJlc3Npb247XG4gIH1cbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgdGVtcGxhdGUgd2hpY2ggd2FzIGV4dHJhY3RlZCBkdXJpbmcgcGFyc2luZy5cbiAqXG4gKiBUaGlzIGNvbnRhaW5zIHRoZSBhY3R1YWwgcGFyc2VkIHRlbXBsYXRlIGFzIHdlbGwgYXMgYW55IG1ldGFkYXRhIGNvbGxlY3RlZCBkdXJpbmcgaXRzIHBhcnNpbmcsXG4gKiBzb21lIG9mIHdoaWNoIG1pZ2h0IGJlIHVzZWZ1bCBmb3IgcmUtcGFyc2luZyB0aGUgdGVtcGxhdGUgd2l0aCBkaWZmZXJlbnQgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb21wb25lbnRUZW1wbGF0ZSBleHRlbmRzIFBhcnNlZFRlbXBsYXRlIHtcbiAgLyoqXG4gICAqIFRydWUgaWYgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHdhcyBzdG9yZWQgaW5saW5lO1xuICAgKiBGYWxzZSBpZiB0aGUgdGVtcGxhdGUgd2FzIGluIGFuIGV4dGVybmFsIGZpbGUuXG4gICAqL1xuICBpc0lubGluZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIHRlbXBsYXRlIEFTVCwgcGFyc2VkIGluIGEgbWFubmVyIHdoaWNoIHByZXNlcnZlcyBzb3VyY2UgbWFwIGluZm9ybWF0aW9uIGZvciBkaWFnbm9zdGljcy5cbiAgICpcbiAgICogTm90IHVzZWZ1bCBmb3IgZW1pdC5cbiAgICovXG4gIGRpYWdOb2RlczogVG1wbEFzdE5vZGVbXTtcblxuICAvKipcbiAgICogVGhlIGBQYXJzZVNvdXJjZUZpbGVgIGZvciB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBmaWxlOiBQYXJzZVNvdXJjZUZpbGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkVGVtcGxhdGVXaXRoU291cmNlIGV4dGVuZHMgUGFyc2VkQ29tcG9uZW50VGVtcGxhdGUge1xuICBzb3VyY2VNYXBwaW5nOiBUZW1wbGF0ZVNvdXJjZU1hcHBpbmc7XG4gIGRlY2xhcmF0aW9uOiBUZW1wbGF0ZURlY2xhcmF0aW9uO1xufVxuXG4vKipcbiAqIENvbW1vbiBmaWVsZHMgZXh0cmFjdGVkIGZyb20gdGhlIGRlY2xhcmF0aW9uIG9mIGEgdGVtcGxhdGUuXG4gKi9cbmludGVyZmFjZSBDb21tb25UZW1wbGF0ZURlY2xhcmF0aW9uIHtcbiAgcHJlc2VydmVXaGl0ZXNwYWNlczogYm9vbGVhbjtcbiAgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZztcbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcbiAgcmVzb2x2ZWRUZW1wbGF0ZVVybDogc3RyaW5nO1xuICBzb3VyY2VNYXBVcmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjbGFyYXRpb24gb2YgYW4gaW5saW5lIHRlbXBsYXRlLlxuICovXG5pbnRlcmZhY2UgSW5saW5lVGVtcGxhdGVEZWNsYXJhdGlvbiBleHRlbmRzIENvbW1vblRlbXBsYXRlRGVjbGFyYXRpb24ge1xuICBpc0lubGluZTogdHJ1ZTtcbiAgZXhwcmVzc2lvbjogdHMuRXhwcmVzc2lvbjtcbn1cblxuLyoqXG4gKiBJbmZvcm1hdGlvbiBleHRyYWN0ZWQgZnJvbSB0aGUgZGVjbGFyYXRpb24gb2YgYW4gZXh0ZXJuYWwgdGVtcGxhdGUuXG4gKi9cbmludGVyZmFjZSBFeHRlcm5hbFRlbXBsYXRlRGVjbGFyYXRpb24gZXh0ZW5kcyBDb21tb25UZW1wbGF0ZURlY2xhcmF0aW9uIHtcbiAgaXNJbmxpbmU6IGZhbHNlO1xuICB0ZW1wbGF0ZVVybEV4cHJlc3Npb246IHRzLkV4cHJlc3Npb247XG59XG5cbi8qKlxuICogVGhlIGRlY2xhcmF0aW9uIG9mIGEgdGVtcGxhdGUgZXh0cmFjdGVkIGZyb20gYSBjb21wb25lbnQgZGVjb3JhdG9yLlxuICpcbiAqIFRoaXMgZGF0YSBpcyBleHRyYWN0ZWQgYW5kIHN0b3JlZCBzZXBhcmF0ZWx5IHRvIGZhY2lsaWF0ZSByZS1pbnRlcnByZXRpbmcgdGhlIHRlbXBsYXRlXG4gKiBkZWNsYXJhdGlvbiB3aGVuZXZlciB0aGUgY29tcGlsZXIgaXMgbm90aWZpZWQgb2YgYSBjaGFuZ2UgdG8gYSB0ZW1wbGF0ZSBmaWxlLiBXaXRoIHRoaXNcbiAqIGluZm9ybWF0aW9uLCBgQ29tcG9uZW50RGVjb3JhdG9ySGFuZGxlcmAgaXMgYWJsZSB0byByZS1yZWFkIHRoZSB0ZW1wbGF0ZSBhbmQgdXBkYXRlIHRoZSBjb21wb25lbnRcbiAqIHJlY29yZCB3aXRob3V0IG5lZWRpbmcgdG8gcGFyc2UgdGhlIG9yaWdpbmFsIGRlY29yYXRvciBhZ2Fpbi5cbiAqL1xudHlwZSBUZW1wbGF0ZURlY2xhcmF0aW9uID0gSW5saW5lVGVtcGxhdGVEZWNsYXJhdGlvbnxFeHRlcm5hbFRlbXBsYXRlRGVjbGFyYXRpb247XG5cbi8qKlxuICogR2VuZXJhdGUgYSBkaWFnbm9zdGljIHJlbGF0ZWQgaW5mb3JtYXRpb24gb2JqZWN0IHRoYXQgZGVzY3JpYmVzIGEgcG90ZW50aWFsIGN5Y2xpYyBpbXBvcnQgcGF0aC5cbiAqL1xuZnVuY3Rpb24gbWFrZUN5Y2xpY0ltcG9ydEluZm8oXG4gICAgcmVmOiBSZWZlcmVuY2UsIHR5cGU6IHN0cmluZywgY3ljbGU6IEN5Y2xlKTogdHMuRGlhZ25vc3RpY1JlbGF0ZWRJbmZvcm1hdGlvbiB7XG4gIGNvbnN0IG5hbWUgPSByZWYuZGVidWdOYW1lIHx8ICcodW5rbm93biknO1xuICBjb25zdCBwYXRoID0gY3ljbGUuZ2V0UGF0aCgpLm1hcChzZiA9PiBzZi5maWxlTmFtZSkuam9pbignIC0+ICcpO1xuICBjb25zdCBtZXNzYWdlID1cbiAgICAgIGBUaGUgJHt0eXBlfSAnJHtuYW1lfScgaXMgdXNlZCBpbiB0aGUgdGVtcGxhdGUgYnV0IGltcG9ydGluZyBpdCB3b3VsZCBjcmVhdGUgYSBjeWNsZTogYDtcbiAgcmV0dXJuIG1ha2VSZWxhdGVkSW5mb3JtYXRpb24ocmVmLm5vZGUsIG1lc3NhZ2UgKyBwYXRoKTtcbn1cbiJdfQ==