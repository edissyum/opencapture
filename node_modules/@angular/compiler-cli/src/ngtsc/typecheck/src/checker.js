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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/checker", ["require", "exports", "tslib", "@angular/compiler", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/typecheck/src/completion", "@angular/compiler-cli/src/ngtsc/typecheck/src/context", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/source", "@angular/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TemplateTypeCheckerImpl = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var completion_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/completion");
    var context_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/context");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var source_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/source");
    var template_symbol_builder_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/template_symbol_builder");
    /**
     * Primary template type-checking engine, which performs type-checking using a
     * `TypeCheckingProgramStrategy` for type-checking program maintenance, and the
     * `ProgramTypeCheckAdapter` for generation of template type-checking code.
     */
    var TemplateTypeCheckerImpl = /** @class */ (function () {
        function TemplateTypeCheckerImpl(originalProgram, typeCheckingStrategy, typeCheckAdapter, config, refEmitter, reflector, compilerHost, priorBuild, componentScopeReader) {
            this.originalProgram = originalProgram;
            this.typeCheckingStrategy = typeCheckingStrategy;
            this.typeCheckAdapter = typeCheckAdapter;
            this.config = config;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.compilerHost = compilerHost;
            this.priorBuild = priorBuild;
            this.componentScopeReader = componentScopeReader;
            this.state = new Map();
            /**
             * Stores the `CompletionEngine` which powers autocompletion for each component class.
             *
             * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
             * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
             * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
             */
            this.completionCache = new Map();
            /**
             * Stores the `SymbolBuilder` which creates symbols for each component class.
             *
             * Must be invalidated whenever the component's template or the `ts.Program` changes. Invalidation
             * on template changes is performed within this `TemplateTypeCheckerImpl` instance. When the
             * `ts.Program` changes, the `TemplateTypeCheckerImpl` as a whole is destroyed and replaced.
             */
            this.symbolBuilderCache = new Map();
            /**
             * Stores directives and pipes that are in scope for each component.
             *
             * Unlike the other caches, the scope of a component is not affected by its template, so this
             * cache does not need to be invalidate if the template is overridden. It will be destroyed when
             * the `ts.Program` changes and the `TemplateTypeCheckerImpl` as a whole is destroyed and
             * replaced.
             */
            this.scopeCache = new Map();
            this.isComplete = false;
        }
        TemplateTypeCheckerImpl.prototype.resetOverrides = function () {
            var e_1, _a;
            try {
                for (var _b = tslib_1.__values(this.state.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var fileRecord = _c.value;
                    if (fileRecord.templateOverrides !== null) {
                        fileRecord.templateOverrides = null;
                        fileRecord.shimData.clear();
                        fileRecord.isComplete = false;
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
            // Ideally only those components with overridden templates would have their caches invalidated,
            // but the `TemplateTypeCheckerImpl` does not track the class for components with overrides. As
            // a quick workaround, clear the entire cache instead.
            this.completionCache.clear();
            this.symbolBuilderCache.clear();
        };
        TemplateTypeCheckerImpl.prototype.getTemplate = function (component) {
            var data = this.getLatestComponentState(component).data;
            if (data === null) {
                return null;
            }
            return data.template;
        };
        TemplateTypeCheckerImpl.prototype.getLatestComponentState = function (component) {
            this.ensureShimForComponent(component);
            var sf = component.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var shimPath = this.typeCheckingStrategy.shimPathForComponent(component);
            var fileRecord = this.getFileData(sfPath);
            if (!fileRecord.shimData.has(shimPath)) {
                return { data: null, tcb: null, shimPath: shimPath };
            }
            var templateId = fileRecord.sourceManager.getTemplateId(component);
            var shimRecord = fileRecord.shimData.get(shimPath);
            var id = fileRecord.sourceManager.getTemplateId(component);
            var program = this.typeCheckingStrategy.getProgram();
            var shimSf = typescript_1.getSourceFileOrNull(program, shimPath);
            if (shimSf === null || !fileRecord.shimData.has(shimPath)) {
                throw new Error("Error: no shim file in program: " + shimPath);
            }
            var tcb = diagnostics_1.findTypeCheckBlock(shimSf, id);
            if (tcb === null) {
                // Try for an inline block.
                var inlineSf = file_system_1.getSourceFileOrError(program, sfPath);
                tcb = diagnostics_1.findTypeCheckBlock(inlineSf, id);
            }
            var data = null;
            if (shimRecord.templates.has(templateId)) {
                data = shimRecord.templates.get(templateId);
            }
            return { data: data, tcb: tcb, shimPath: shimPath };
        };
        TemplateTypeCheckerImpl.prototype.overrideComponentTemplate = function (component, template) {
            var _a = compiler_1.parseTemplate(template, 'override.html', {
                preserveWhitespaces: true,
                leadingTriviaChars: [],
            }), nodes = _a.nodes, errors = _a.errors;
            if (errors !== null) {
                return { nodes: nodes, errors: errors };
            }
            var filePath = file_system_1.absoluteFromSourceFile(component.getSourceFile());
            var fileRecord = this.getFileData(filePath);
            var id = fileRecord.sourceManager.getTemplateId(component);
            if (fileRecord.templateOverrides === null) {
                fileRecord.templateOverrides = new Map();
            }
            fileRecord.templateOverrides.set(id, nodes);
            // Clear data for the shim in question, so it'll be regenerated on the next request.
            var shimFile = this.typeCheckingStrategy.shimPathForComponent(component);
            fileRecord.shimData.delete(shimFile);
            fileRecord.isComplete = false;
            this.isComplete = false;
            // Overriding a component's template invalidates its cached results.
            this.completionCache.delete(component);
            this.symbolBuilderCache.delete(component);
            return { nodes: nodes };
        };
        /**
         * Retrieve type-checking diagnostics from the given `ts.SourceFile` using the most recent
         * type-checking program.
         */
        TemplateTypeCheckerImpl.prototype.getDiagnosticsForFile = function (sf, optimizeFor) {
            var e_2, _a;
            switch (optimizeFor) {
                case api_1.OptimizeFor.WholeProgram:
                    this.ensureAllShimsForAllFiles();
                    break;
                case api_1.OptimizeFor.SingleFile:
                    this.ensureAllShimsForOneFile(sf);
                    break;
            }
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var fileRecord = this.state.get(sfPath);
            var typeCheckProgram = this.typeCheckingStrategy.getProgram();
            var diagnostics = [];
            if (fileRecord.hasInlines) {
                var inlineSf = file_system_1.getSourceFileOrError(typeCheckProgram, sfPath);
                diagnostics.push.apply(diagnostics, tslib_1.__spread(typeCheckProgram.getSemanticDiagnostics(inlineSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); })));
            }
            try {
                for (var _b = tslib_1.__values(fileRecord.shimData), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), shimPath = _d[0], shimRecord = _d[1];
                    var shimSf = file_system_1.getSourceFileOrError(typeCheckProgram, shimPath);
                    diagnostics.push.apply(diagnostics, tslib_1.__spread(typeCheckProgram.getSemanticDiagnostics(shimSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); })));
                    diagnostics.push.apply(diagnostics, tslib_1.__spread(shimRecord.genesisDiagnostics));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return diagnostics.filter(function (diag) { return diag !== null; });
        };
        TemplateTypeCheckerImpl.prototype.getDiagnosticsForComponent = function (component) {
            this.ensureShimForComponent(component);
            var sf = component.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var shimPath = this.typeCheckingStrategy.shimPathForComponent(component);
            var fileRecord = this.getFileData(sfPath);
            if (!fileRecord.shimData.has(shimPath)) {
                return [];
            }
            var templateId = fileRecord.sourceManager.getTemplateId(component);
            var shimRecord = fileRecord.shimData.get(shimPath);
            var typeCheckProgram = this.typeCheckingStrategy.getProgram();
            var diagnostics = [];
            if (shimRecord.hasInlines) {
                var inlineSf = file_system_1.getSourceFileOrError(typeCheckProgram, sfPath);
                diagnostics.push.apply(diagnostics, tslib_1.__spread(typeCheckProgram.getSemanticDiagnostics(inlineSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); })));
            }
            var shimSf = file_system_1.getSourceFileOrError(typeCheckProgram, shimPath);
            diagnostics.push.apply(diagnostics, tslib_1.__spread(typeCheckProgram.getSemanticDiagnostics(shimSf).map(function (diag) { return convertDiagnostic(diag, fileRecord.sourceManager); })));
            diagnostics.push.apply(diagnostics, tslib_1.__spread(shimRecord.genesisDiagnostics));
            return diagnostics.filter(function (diag) {
                return diag !== null && diag.templateId === templateId;
            });
        };
        TemplateTypeCheckerImpl.prototype.getTypeCheckBlock = function (component) {
            return this.getLatestComponentState(component).tcb;
        };
        TemplateTypeCheckerImpl.prototype.getGlobalCompletions = function (context, component) {
            var engine = this.getOrCreateCompletionEngine(component);
            if (engine === null) {
                return null;
            }
            return engine.getGlobalCompletions(context);
        };
        TemplateTypeCheckerImpl.prototype.getOrCreateCompletionEngine = function (component) {
            if (this.completionCache.has(component)) {
                return this.completionCache.get(component);
            }
            var _a = this.getLatestComponentState(component), tcb = _a.tcb, data = _a.data, shimPath = _a.shimPath;
            if (tcb === null || data === null) {
                return null;
            }
            var engine = new completion_1.CompletionEngine(tcb, data, shimPath);
            this.completionCache.set(component, engine);
            return engine;
        };
        TemplateTypeCheckerImpl.prototype.maybeAdoptPriorResultsForFile = function (sf) {
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            if (this.state.has(sfPath)) {
                var existingResults = this.state.get(sfPath);
                if (existingResults.templateOverrides !== null) {
                    // Cannot adopt prior results if template overrides have been requested.
                    return;
                }
                if (existingResults.isComplete) {
                    // All data for this file has already been generated, so no need to adopt anything.
                    return;
                }
            }
            var previousResults = this.priorBuild.priorTypeCheckingResultsFor(sf);
            if (previousResults === null || !previousResults.isComplete ||
                previousResults.templateOverrides !== null) {
                return;
            }
            this.state.set(sfPath, previousResults);
        };
        TemplateTypeCheckerImpl.prototype.ensureAllShimsForAllFiles = function () {
            var e_3, _a;
            if (this.isComplete) {
                return;
            }
            var host = new WholeProgramTypeCheckingHost(this);
            var ctx = this.newContext(host);
            try {
                for (var _b = tslib_1.__values(this.originalProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sf = _c.value;
                    if (sf.isDeclarationFile || shims_1.isShim(sf)) {
                        continue;
                    }
                    this.maybeAdoptPriorResultsForFile(sf);
                    var sfPath = file_system_1.absoluteFromSourceFile(sf);
                    var fileData = this.getFileData(sfPath);
                    if (fileData.isComplete) {
                        continue;
                    }
                    this.typeCheckAdapter.typeCheck(sf, ctx);
                    fileData.isComplete = true;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.updateFromContext(ctx);
            this.isComplete = true;
        };
        TemplateTypeCheckerImpl.prototype.ensureAllShimsForOneFile = function (sf) {
            this.maybeAdoptPriorResultsForFile(sf);
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            var fileData = this.getFileData(sfPath);
            if (fileData.isComplete) {
                // All data for this file is present and accounted for already.
                return;
            }
            var host = new SingleFileTypeCheckingHost(sfPath, fileData, this.typeCheckingStrategy, this);
            var ctx = this.newContext(host);
            this.typeCheckAdapter.typeCheck(sf, ctx);
            fileData.isComplete = true;
            this.updateFromContext(ctx);
        };
        TemplateTypeCheckerImpl.prototype.ensureShimForComponent = function (component) {
            var sf = component.getSourceFile();
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            this.maybeAdoptPriorResultsForFile(sf);
            var fileData = this.getFileData(sfPath);
            var shimPath = this.typeCheckingStrategy.shimPathForComponent(component);
            if (fileData.shimData.has(shimPath)) {
                // All data for this component is available.
                return;
            }
            var host = new SingleShimTypeCheckingHost(sfPath, fileData, this.typeCheckingStrategy, this, shimPath);
            var ctx = this.newContext(host);
            this.typeCheckAdapter.typeCheck(sf, ctx);
            this.updateFromContext(ctx);
        };
        TemplateTypeCheckerImpl.prototype.newContext = function (host) {
            var inlining = this.typeCheckingStrategy.supportsInlineOperations ? context_1.InliningMode.InlineOps :
                context_1.InliningMode.Error;
            return new context_1.TypeCheckContextImpl(this.config, this.compilerHost, this.typeCheckingStrategy, this.refEmitter, this.reflector, host, inlining);
        };
        /**
         * Remove any shim data that depends on inline operations applied to the type-checking program.
         *
         * This can be useful if new inlines need to be applied, and it's not possible to guarantee that
         * they won't overwrite or corrupt existing inlines that are used by such shims.
         */
        TemplateTypeCheckerImpl.prototype.clearAllShimDataUsingInlines = function () {
            var e_4, _a, e_5, _b;
            try {
                for (var _c = tslib_1.__values(this.state.values()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var fileData = _d.value;
                    if (!fileData.hasInlines) {
                        continue;
                    }
                    try {
                        for (var _e = (e_5 = void 0, tslib_1.__values(fileData.shimData.entries())), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var _g = tslib_1.__read(_f.value, 2), shimFile = _g[0], shimData = _g[1];
                            if (shimData.hasInlines) {
                                fileData.shimData.delete(shimFile);
                            }
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                    fileData.hasInlines = false;
                    fileData.isComplete = false;
                    this.isComplete = false;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        TemplateTypeCheckerImpl.prototype.updateFromContext = function (ctx) {
            var updates = ctx.finalize();
            this.typeCheckingStrategy.updateFiles(updates, api_1.UpdateMode.Incremental);
            this.priorBuild.recordSuccessfulTypeCheck(this.state);
        };
        TemplateTypeCheckerImpl.prototype.getFileData = function (path) {
            if (!this.state.has(path)) {
                this.state.set(path, {
                    hasInlines: false,
                    templateOverrides: null,
                    sourceManager: new source_1.TemplateSourceManager(),
                    isComplete: false,
                    shimData: new Map(),
                });
            }
            return this.state.get(path);
        };
        TemplateTypeCheckerImpl.prototype.getSymbolOfNode = function (node, component) {
            var builder = this.getOrCreateSymbolBuilder(component);
            if (builder === null) {
                return null;
            }
            return builder.getSymbol(node);
        };
        TemplateTypeCheckerImpl.prototype.getOrCreateSymbolBuilder = function (component) {
            var _this = this;
            if (this.symbolBuilderCache.has(component)) {
                return this.symbolBuilderCache.get(component);
            }
            var _a = this.getLatestComponentState(component), tcb = _a.tcb, data = _a.data, shimPath = _a.shimPath;
            if (tcb === null || data === null) {
                return null;
            }
            var builder = new template_symbol_builder_1.SymbolBuilder(shimPath, tcb, data, this.componentScopeReader, function () { return _this.typeCheckingStrategy.getProgram().getTypeChecker(); });
            this.symbolBuilderCache.set(component, builder);
            return builder;
        };
        TemplateTypeCheckerImpl.prototype.getDirectivesInScope = function (component) {
            var data = this.getScopeData(component);
            if (data === null) {
                return null;
            }
            return data.directives;
        };
        TemplateTypeCheckerImpl.prototype.getPipesInScope = function (component) {
            var data = this.getScopeData(component);
            if (data === null) {
                return null;
            }
            return data.pipes;
        };
        TemplateTypeCheckerImpl.prototype.getScopeData = function (component) {
            var e_6, _a, e_7, _b;
            if (this.scopeCache.has(component)) {
                return this.scopeCache.get(component);
            }
            if (!reflection_1.isNamedClassDeclaration(component)) {
                throw new Error("AssertionError: components must have names");
            }
            var scope = this.componentScopeReader.getScopeForComponent(component);
            if (scope === null) {
                return null;
            }
            var data = {
                directives: [],
                pipes: [],
                isPoisoned: scope.compilation.isPoisoned,
            };
            var typeChecker = this.typeCheckingStrategy.getProgram().getTypeChecker();
            try {
                for (var _c = tslib_1.__values(scope.exported.directives), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var dir = _d.value;
                    if (dir.selector === null) {
                        // Skip this directive, it can't be added to a template anyway.
                        continue;
                    }
                    var tsSymbol = typeChecker.getSymbolAtLocation(dir.ref.node.name);
                    if (tsSymbol === undefined) {
                        continue;
                    }
                    data.directives.push({
                        isComponent: dir.isComponent,
                        selector: dir.selector,
                        tsSymbol: tsSymbol,
                    });
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_6) throw e_6.error; }
            }
            try {
                for (var _e = tslib_1.__values(scope.exported.pipes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var pipe = _f.value;
                    var tsSymbol = typeChecker.getSymbolAtLocation(pipe.ref.node.name);
                    if (tsSymbol === undefined) {
                        continue;
                    }
                    data.pipes.push({
                        name: pipe.name,
                        tsSymbol: tsSymbol,
                    });
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_7) throw e_7.error; }
            }
            this.scopeCache.set(component, data);
            return data;
        };
        return TemplateTypeCheckerImpl;
    }());
    exports.TemplateTypeCheckerImpl = TemplateTypeCheckerImpl;
    function convertDiagnostic(diag, sourceResolver) {
        if (!diagnostics_1.shouldReportDiagnostic(diag)) {
            return null;
        }
        return diagnostics_1.translateDiagnostic(diag, sourceResolver);
    }
    /**
     * Drives a `TypeCheckContext` to generate type-checking code for every component in the program.
     */
    var WholeProgramTypeCheckingHost = /** @class */ (function () {
        function WholeProgramTypeCheckingHost(impl) {
            this.impl = impl;
        }
        WholeProgramTypeCheckingHost.prototype.getSourceManager = function (sfPath) {
            return this.impl.getFileData(sfPath).sourceManager;
        };
        WholeProgramTypeCheckingHost.prototype.shouldCheckComponent = function (node) {
            var fileData = this.impl.getFileData(file_system_1.absoluteFromSourceFile(node.getSourceFile()));
            var shimPath = this.impl.typeCheckingStrategy.shimPathForComponent(node);
            // The component needs to be checked unless the shim which would contain it already exists.
            return !fileData.shimData.has(shimPath);
        };
        WholeProgramTypeCheckingHost.prototype.getTemplateOverride = function (sfPath, node) {
            var fileData = this.impl.getFileData(sfPath);
            if (fileData.templateOverrides === null) {
                return null;
            }
            var templateId = fileData.sourceManager.getTemplateId(node);
            if (fileData.templateOverrides.has(templateId)) {
                return fileData.templateOverrides.get(templateId);
            }
            return null;
        };
        WholeProgramTypeCheckingHost.prototype.recordShimData = function (sfPath, data) {
            var fileData = this.impl.getFileData(sfPath);
            fileData.shimData.set(data.path, data);
            if (data.hasInlines) {
                fileData.hasInlines = true;
            }
        };
        WholeProgramTypeCheckingHost.prototype.recordComplete = function (sfPath) {
            this.impl.getFileData(sfPath).isComplete = true;
        };
        return WholeProgramTypeCheckingHost;
    }());
    /**
     * Drives a `TypeCheckContext` to generate type-checking code efficiently for a single input file.
     */
    var SingleFileTypeCheckingHost = /** @class */ (function () {
        function SingleFileTypeCheckingHost(sfPath, fileData, strategy, impl) {
            this.sfPath = sfPath;
            this.fileData = fileData;
            this.strategy = strategy;
            this.impl = impl;
            this.seenInlines = false;
        }
        SingleFileTypeCheckingHost.prototype.assertPath = function (sfPath) {
            if (this.sfPath !== sfPath) {
                throw new Error("AssertionError: querying TypeCheckingHost outside of assigned file");
            }
        };
        SingleFileTypeCheckingHost.prototype.getSourceManager = function (sfPath) {
            this.assertPath(sfPath);
            return this.fileData.sourceManager;
        };
        SingleFileTypeCheckingHost.prototype.shouldCheckComponent = function (node) {
            if (this.sfPath !== file_system_1.absoluteFromSourceFile(node.getSourceFile())) {
                return false;
            }
            var shimPath = this.strategy.shimPathForComponent(node);
            // Only need to generate a TCB for the class if no shim exists for it currently.
            return !this.fileData.shimData.has(shimPath);
        };
        SingleFileTypeCheckingHost.prototype.getTemplateOverride = function (sfPath, node) {
            this.assertPath(sfPath);
            if (this.fileData.templateOverrides === null) {
                return null;
            }
            var templateId = this.fileData.sourceManager.getTemplateId(node);
            if (this.fileData.templateOverrides.has(templateId)) {
                return this.fileData.templateOverrides.get(templateId);
            }
            return null;
        };
        SingleFileTypeCheckingHost.prototype.recordShimData = function (sfPath, data) {
            this.assertPath(sfPath);
            // Previous type-checking state may have required the use of inlines (assuming they were
            // supported). If the current operation also requires inlines, this presents a problem:
            // generating new inlines may invalidate any old inlines that old state depends on.
            //
            // Rather than resolve this issue by tracking specific dependencies on inlines, if the new state
            // relies on inlines, any old state that relied on them is simply cleared. This happens when the
            // first new state that uses inlines is encountered.
            if (data.hasInlines && !this.seenInlines) {
                this.impl.clearAllShimDataUsingInlines();
                this.seenInlines = true;
            }
            this.fileData.shimData.set(data.path, data);
            if (data.hasInlines) {
                this.fileData.hasInlines = true;
            }
        };
        SingleFileTypeCheckingHost.prototype.recordComplete = function (sfPath) {
            this.assertPath(sfPath);
            this.fileData.isComplete = true;
        };
        return SingleFileTypeCheckingHost;
    }());
    /**
     * Drives a `TypeCheckContext` to generate type-checking code efficiently for only those components
     * which map to a single shim of a single input file.
     */
    var SingleShimTypeCheckingHost = /** @class */ (function (_super) {
        tslib_1.__extends(SingleShimTypeCheckingHost, _super);
        function SingleShimTypeCheckingHost(sfPath, fileData, strategy, impl, shimPath) {
            var _this = _super.call(this, sfPath, fileData, strategy, impl) || this;
            _this.shimPath = shimPath;
            return _this;
        }
        SingleShimTypeCheckingHost.prototype.shouldCheckNode = function (node) {
            if (this.sfPath !== file_system_1.absoluteFromSourceFile(node.getSourceFile())) {
                return false;
            }
            // Only generate a TCB for the component if it maps to the requested shim file.
            var shimPath = this.strategy.shimPathForComponent(node);
            if (shimPath !== this.shimPath) {
                return false;
            }
            // Only need to generate a TCB for the class if no shim exists for it currently.
            return !this.fileData.shimData.has(shimPath);
        };
        return SingleShimTypeCheckingHost;
    }(SingleFileTypeCheckingHost));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jaGVja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBa0k7SUFHbEksMkVBQStGO0lBRy9GLHlFQUF5RTtJQUV6RSwrREFBbUM7SUFDbkMsa0ZBQThEO0lBQzlELHFFQUFtTztJQUluTyx1RkFBOEM7SUFDOUMsaUZBQW1IO0lBQ25ILHlGQUFzSDtJQUN0SCwrRUFBK0M7SUFDL0MsaUhBQXdEO0lBRXhEOzs7O09BSUc7SUFDSDtRQWdDRSxpQ0FDWSxlQUEyQixFQUMxQixvQkFBaUQsRUFDbEQsZ0JBQXlDLEVBQVUsTUFBMEIsRUFDN0UsVUFBNEIsRUFBVSxTQUF5QixFQUMvRCxZQUEyRCxFQUMzRCxVQUEyRCxFQUNsRCxvQkFBMEM7WUFObkQsb0JBQWUsR0FBZixlQUFlLENBQVk7WUFDMUIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUE2QjtZQUNsRCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXlCO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7WUFDN0UsZUFBVSxHQUFWLFVBQVUsQ0FBa0I7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFnQjtZQUMvRCxpQkFBWSxHQUFaLFlBQVksQ0FBK0M7WUFDM0QsZUFBVSxHQUFWLFVBQVUsQ0FBaUQ7WUFDbEQseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtZQXRDdkQsVUFBSyxHQUFHLElBQUksR0FBRyxFQUF3QyxDQUFDO1lBRWhFOzs7Ozs7ZUFNRztZQUNLLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQXlDLENBQUM7WUFDM0U7Ozs7OztlQU1HO1lBQ0ssdUJBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQXNDLENBQUM7WUFFM0U7Ozs7Ozs7ZUFPRztZQUNLLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0MsQ0FBQztZQUV2RCxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBU3VDLENBQUM7UUFFbkUsZ0RBQWMsR0FBZDs7O2dCQUNFLEtBQXlCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBLGdCQUFBLDRCQUFFO29CQUF6QyxJQUFNLFVBQVUsV0FBQTtvQkFDbkIsSUFBSSxVQUFVLENBQUMsaUJBQWlCLEtBQUssSUFBSSxFQUFFO3dCQUN6QyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO3dCQUNwQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUM1QixVQUFVLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztxQkFDL0I7aUJBQ0Y7Ozs7Ozs7OztZQUVELCtGQUErRjtZQUMvRiwrRkFBK0Y7WUFDL0Ysc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCw2Q0FBVyxHQUFYLFVBQVksU0FBOEI7WUFDakMsSUFBQSxJQUFJLEdBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxLQUEzQyxDQUE0QztZQUN2RCxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdkIsQ0FBQztRQUVPLHlEQUF1QixHQUEvQixVQUFnQyxTQUE4QjtZQUU1RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdkMsSUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JDLElBQU0sTUFBTSxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUUzRSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLFVBQUEsRUFBQyxDQUFDO2FBQzFDO1lBRUQsSUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckUsSUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUM7WUFDdEQsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFN0QsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3ZELElBQU0sTUFBTSxHQUFHLGdDQUFtQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztZQUV0RCxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBbUMsUUFBVSxDQUFDLENBQUM7YUFDaEU7WUFFRCxJQUFJLEdBQUcsR0FBaUIsZ0NBQWtCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXZELElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtnQkFDaEIsMkJBQTJCO2dCQUMzQixJQUFNLFFBQVEsR0FBRyxrQ0FBb0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZELEdBQUcsR0FBRyxnQ0FBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFDeEM7WUFFRCxJQUFJLElBQUksR0FBc0IsSUFBSSxDQUFDO1lBQ25DLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3hDLElBQUksR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQzthQUM5QztZQUVELE9BQU8sRUFBQyxJQUFJLE1BQUEsRUFBRSxHQUFHLEtBQUEsRUFBRSxRQUFRLFVBQUEsRUFBQyxDQUFDO1FBQy9CLENBQUM7UUFFRCwyREFBeUIsR0FBekIsVUFBMEIsU0FBOEIsRUFBRSxRQUFnQjtZQUVsRSxJQUFBLEtBQWtCLHdCQUFhLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRTtnQkFDL0QsbUJBQW1CLEVBQUUsSUFBSTtnQkFDekIsa0JBQWtCLEVBQUUsRUFBRTthQUN2QixDQUFDLEVBSEssS0FBSyxXQUFBLEVBQUUsTUFBTSxZQUdsQixDQUFDO1lBRUgsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNuQixPQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQzthQUN4QjtZQUVELElBQU0sUUFBUSxHQUFHLG9DQUFzQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBRW5FLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUMsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFN0QsSUFBSSxVQUFVLENBQUMsaUJBQWlCLEtBQUssSUFBSSxFQUFFO2dCQUN6QyxVQUFVLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUMxQztZQUVELFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRTVDLG9GQUFvRjtZQUNwRixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0UsVUFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckMsVUFBVSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFFeEIsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFMUMsT0FBTyxFQUFDLEtBQUssT0FBQSxFQUFDLENBQUM7UUFDakIsQ0FBQztRQUVEOzs7V0FHRztRQUNILHVEQUFxQixHQUFyQixVQUFzQixFQUFpQixFQUFFLFdBQXdCOztZQUMvRCxRQUFRLFdBQVcsRUFBRTtnQkFDbkIsS0FBSyxpQkFBVyxDQUFDLFlBQVk7b0JBQzNCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO29CQUNqQyxNQUFNO2dCQUNSLEtBQUssaUJBQVcsQ0FBQyxVQUFVO29CQUN6QixJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2xDLE1BQU07YUFDVDtZQUVELElBQU0sTUFBTSxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBRTNDLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRWhFLElBQU0sV0FBVyxHQUEyQixFQUFFLENBQUM7WUFDL0MsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFO2dCQUN6QixJQUFNLFFBQVEsR0FBRyxrQ0FBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEUsV0FBVyxDQUFDLElBQUksT0FBaEIsV0FBVyxtQkFBUyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQ3JFLFVBQUEsSUFBSSxJQUFJLE9BQUEsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBakQsQ0FBaUQsQ0FBQyxHQUFFO2FBQ2pFOztnQkFFRCxLQUFxQyxJQUFBLEtBQUEsaUJBQUEsVUFBVSxDQUFDLFFBQVEsQ0FBQSxnQkFBQSw0QkFBRTtvQkFBL0MsSUFBQSxLQUFBLDJCQUFzQixFQUFyQixRQUFRLFFBQUEsRUFBRSxVQUFVLFFBQUE7b0JBQzlCLElBQU0sTUFBTSxHQUFHLGtDQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNoRSxXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLG1CQUFTLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FDbkUsVUFBQSxJQUFJLElBQUksT0FBQSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLEdBQUU7b0JBQ2hFLFdBQVcsQ0FBQyxJQUFJLE9BQWhCLFdBQVcsbUJBQVMsVUFBVSxDQUFDLGtCQUFrQixHQUFFO2lCQUNwRDs7Ozs7Ozs7O1lBRUQsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBd0IsSUFBNEIsT0FBQSxJQUFJLEtBQUssSUFBSSxFQUFiLENBQWEsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCw0REFBMEIsR0FBMUIsVUFBMkIsU0FBOEI7WUFDdkQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXZDLElBQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQyxJQUFNLE1BQU0sR0FBRyxvQ0FBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFM0UsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RDLE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFFRCxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNyRSxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUUsQ0FBQztZQUV0RCxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVoRSxJQUFNLFdBQVcsR0FBZ0MsRUFBRSxDQUFDO1lBQ3BELElBQUksVUFBVSxDQUFDLFVBQVUsRUFBRTtnQkFDekIsSUFBTSxRQUFRLEdBQUcsa0NBQW9CLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ2hFLFdBQVcsQ0FBQyxJQUFJLE9BQWhCLFdBQVcsbUJBQVMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUNyRSxVQUFBLElBQUksSUFBSSxPQUFBLGlCQUFpQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQWpELENBQWlELENBQUMsR0FBRTthQUNqRTtZQUVELElBQU0sTUFBTSxHQUFHLGtDQUFvQixDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLFdBQVcsQ0FBQyxJQUFJLE9BQWhCLFdBQVcsbUJBQVMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUNuRSxVQUFBLElBQUksSUFBSSxPQUFBLGlCQUFpQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQWpELENBQWlELENBQUMsR0FBRTtZQUNoRSxXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLG1CQUFTLFVBQVUsQ0FBQyxrQkFBa0IsR0FBRTtZQUVuRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQ3JCLFVBQUMsSUFBNkI7Z0JBQzFCLE9BQUEsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFVBQVU7WUFBL0MsQ0FBK0MsQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFRCxtREFBaUIsR0FBakIsVUFBa0IsU0FBOEI7WUFDOUMsT0FBTyxJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JELENBQUM7UUFFRCxzREFBb0IsR0FBcEIsVUFBcUIsT0FBNkIsRUFBRSxTQUE4QjtZQUVoRixJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0QsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUNuQixPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVPLDZEQUEyQixHQUFuQyxVQUFvQyxTQUE4QjtZQUNoRSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDO2FBQzdDO1lBRUssSUFBQSxLQUF3QixJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLEVBQTlELEdBQUcsU0FBQSxFQUFFLElBQUksVUFBQSxFQUFFLFFBQVEsY0FBMkMsQ0FBQztZQUN0RSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQU0sTUFBTSxHQUFHLElBQUksNkJBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDNUMsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUVPLCtEQUE2QixHQUFyQyxVQUFzQyxFQUFpQjtZQUNyRCxJQUFNLE1BQU0sR0FBRyxvQ0FBc0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMxQixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUUsQ0FBQztnQkFDaEQsSUFBSSxlQUFlLENBQUMsaUJBQWlCLEtBQUssSUFBSSxFQUFFO29CQUM5Qyx3RUFBd0U7b0JBQ3hFLE9BQU87aUJBQ1I7Z0JBRUQsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFO29CQUM5QixtRkFBbUY7b0JBQ25GLE9BQU87aUJBQ1I7YUFDRjtZQUVELElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsMkJBQTJCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEUsSUFBSSxlQUFlLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVU7Z0JBQ3ZELGVBQWUsQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQzlDLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU8sMkRBQXlCLEdBQWpDOztZQUNFLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsT0FBTzthQUNSO1lBRUQsSUFBTSxJQUFJLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztnQkFFbEMsS0FBaUIsSUFBQSxLQUFBLGlCQUFBLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLENBQUEsZ0JBQUEsNEJBQUU7b0JBQW5ELElBQU0sRUFBRSxXQUFBO29CQUNYLElBQUksRUFBRSxDQUFDLGlCQUFpQixJQUFJLGNBQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTt3QkFDdEMsU0FBUztxQkFDVjtvQkFFRCxJQUFJLENBQUMsNkJBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXZDLElBQU0sTUFBTSxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMxQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7d0JBQ3ZCLFNBQVM7cUJBQ1Y7b0JBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRXpDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2lCQUM1Qjs7Ozs7Ozs7O1lBRUQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFFTywwREFBd0IsR0FBaEMsVUFBaUMsRUFBaUI7WUFDaEQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXZDLElBQU0sTUFBTSxHQUFHLG9DQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTFDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUN2QiwrREFBK0Q7Z0JBQy9ELE9BQU87YUFDUjtZQUVELElBQU0sSUFBSSxHQUFHLElBQUksMEJBQTBCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0YsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUV6QyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUUzQixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVPLHdEQUFzQixHQUE5QixVQUErQixTQUE4QjtZQUMzRCxJQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckMsSUFBTSxNQUFNLEdBQUcsb0NBQXNCLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFMUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXZDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUMsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTNFLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ25DLDRDQUE0QztnQkFDNUMsT0FBTzthQUNSO1lBRUQsSUFBTSxJQUFJLEdBQ04sSUFBSSwwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDaEcsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUVPLDRDQUFVLEdBQWxCLFVBQW1CLElBQXNCO1lBQ3ZDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsc0JBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDeEIsc0JBQVksQ0FBQyxLQUFLLENBQUM7WUFDekYsT0FBTyxJQUFJLDhCQUFvQixDQUMzQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFDMUYsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRDs7Ozs7V0FLRztRQUNILDhEQUE0QixHQUE1Qjs7O2dCQUNFLEtBQXVCLElBQUEsS0FBQSxpQkFBQSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBLGdCQUFBLDRCQUFFO29CQUF2QyxJQUFNLFFBQVEsV0FBQTtvQkFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7d0JBQ3hCLFNBQVM7cUJBQ1Y7O3dCQUVELEtBQW1DLElBQUEsb0JBQUEsaUJBQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQSxDQUFBLGdCQUFBLDRCQUFFOzRCQUFyRCxJQUFBLEtBQUEsMkJBQW9CLEVBQW5CLFFBQVEsUUFBQSxFQUFFLFFBQVEsUUFBQTs0QkFDNUIsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO2dDQUN2QixRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQzs2QkFDcEM7eUJBQ0Y7Ozs7Ozs7OztvQkFFRCxRQUFRLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFDNUIsUUFBUSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2lCQUN6Qjs7Ozs7Ozs7O1FBQ0gsQ0FBQztRQUVPLG1EQUFpQixHQUF6QixVQUEwQixHQUF5QjtZQUNqRCxJQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsZ0JBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRUQsNkNBQVcsR0FBWCxVQUFZLElBQW9CO1lBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO29CQUNuQixVQUFVLEVBQUUsS0FBSztvQkFDakIsaUJBQWlCLEVBQUUsSUFBSTtvQkFDdkIsYUFBYSxFQUFFLElBQUksOEJBQXFCLEVBQUU7b0JBQzFDLFVBQVUsRUFBRSxLQUFLO29CQUNqQixRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQUU7aUJBQ3BCLENBQUMsQ0FBQzthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQztRQUMvQixDQUFDO1FBRUQsaURBQWUsR0FBZixVQUFnQixJQUFxQixFQUFFLFNBQThCO1lBQ25FLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVPLDBEQUF3QixHQUFoQyxVQUFpQyxTQUE4QjtZQUEvRCxpQkFlQztZQWRDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDMUMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBRSxDQUFDO2FBQ2hEO1lBRUssSUFBQSxLQUF3QixJQUFJLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLEVBQTlELEdBQUcsU0FBQSxFQUFFLElBQUksVUFBQSxFQUFFLFFBQVEsY0FBMkMsQ0FBQztZQUN0RSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELElBQU0sT0FBTyxHQUFHLElBQUksdUNBQWEsQ0FDN0IsUUFBUSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUM5QyxjQUFNLE9BQUEsS0FBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxDQUFDLGNBQWMsRUFBRSxFQUF2RCxDQUF1RCxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEQsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUVELHNEQUFvQixHQUFwQixVQUFxQixTQUE4QjtZQUNqRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUN6QixDQUFDO1FBRUQsaURBQWUsR0FBZixVQUFnQixTQUE4QjtZQUM1QyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzFDLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtnQkFDakIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNwQixDQUFDO1FBRU8sOENBQVksR0FBcEIsVUFBcUIsU0FBOEI7O1lBQ2pELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFFLENBQUM7YUFDeEM7WUFFRCxJQUFJLENBQUMsb0NBQXVCLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQzthQUMvRDtZQUVELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4RSxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7Z0JBQ2xCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLElBQUksR0FBYztnQkFDdEIsVUFBVSxFQUFFLEVBQUU7Z0JBQ2QsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVTthQUN6QyxDQUFDO1lBRUYsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDOztnQkFDNUUsS0FBa0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFBLGdCQUFBLDRCQUFFO29CQUF4QyxJQUFNLEdBQUcsV0FBQTtvQkFDWixJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO3dCQUN6QiwrREFBK0Q7d0JBQy9ELFNBQVM7cUJBQ1Y7b0JBQ0QsSUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNwRSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7d0JBQzFCLFNBQVM7cUJBQ1Y7b0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7d0JBQ25CLFdBQVcsRUFBRSxHQUFHLENBQUMsV0FBVzt3QkFDNUIsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRO3dCQUN0QixRQUFRLFVBQUE7cUJBQ1QsQ0FBQyxDQUFDO2lCQUNKOzs7Ozs7Ozs7O2dCQUVELEtBQW1CLElBQUEsS0FBQSxpQkFBQSxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQSxnQkFBQSw0QkFBRTtvQkFBcEMsSUFBTSxJQUFJLFdBQUE7b0JBQ2IsSUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNyRSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7d0JBQzFCLFNBQVM7cUJBQ1Y7b0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7d0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3dCQUNmLFFBQVEsVUFBQTtxQkFDVCxDQUFDLENBQUM7aUJBQ0o7Ozs7Ozs7OztZQUVELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDSCw4QkFBQztJQUFELENBQUMsQUFoZUQsSUFnZUM7SUFoZVksMERBQXVCO0lBa2VwQyxTQUFTLGlCQUFpQixDQUN0QixJQUFtQixFQUFFLGNBQXNDO1FBQzdELElBQUksQ0FBQyxvQ0FBc0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0QsT0FBTyxpQ0FBbUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQXVDRDs7T0FFRztJQUNIO1FBQ0Usc0NBQW9CLElBQTZCO1lBQTdCLFNBQUksR0FBSixJQUFJLENBQXlCO1FBQUcsQ0FBQztRQUVyRCx1REFBZ0IsR0FBaEIsVUFBaUIsTUFBc0I7WUFDckMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDckQsQ0FBQztRQUVELDJEQUFvQixHQUFwQixVQUFxQixJQUF5QjtZQUM1QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxvQ0FBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JGLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0UsMkZBQTJGO1lBQzNGLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRUQsMERBQW1CLEdBQW5CLFVBQW9CLE1BQXNCLEVBQUUsSUFBeUI7WUFDbkUsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsSUFBSSxRQUFRLENBQUMsaUJBQWlCLEtBQUssSUFBSSxFQUFFO2dCQUN2QyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsSUFBTSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBSSxRQUFRLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUM5QyxPQUFPLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFFLENBQUM7YUFDcEQ7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxxREFBYyxHQUFkLFVBQWUsTUFBc0IsRUFBRSxJQUEwQjtZQUMvRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7YUFDNUI7UUFDSCxDQUFDO1FBRUQscURBQWMsR0FBZCxVQUFlLE1BQXNCO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEQsQ0FBQztRQUNILG1DQUFDO0lBQUQsQ0FBQyxBQXZDRCxJQXVDQztJQUVEOztPQUVHO0lBQ0g7UUFHRSxvQ0FDYyxNQUFzQixFQUFZLFFBQThCLEVBQ2hFLFFBQXFDLEVBQVksSUFBNkI7WUFEOUUsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7WUFBWSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtZQUNoRSxhQUFRLEdBQVIsUUFBUSxDQUE2QjtZQUFZLFNBQUksR0FBSixJQUFJLENBQXlCO1lBSnBGLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBSW1FLENBQUM7UUFFeEYsK0NBQVUsR0FBbEIsVUFBbUIsTUFBc0I7WUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtnQkFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvRUFBb0UsQ0FBQyxDQUFDO2FBQ3ZGO1FBQ0gsQ0FBQztRQUVELHFEQUFnQixHQUFoQixVQUFpQixNQUFzQjtZQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7UUFDckMsQ0FBQztRQUVELHlEQUFvQixHQUFwQixVQUFxQixJQUF5QjtZQUM1QyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssb0NBQXNCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUU7Z0JBQ2hFLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTFELGdGQUFnRjtZQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCx3REFBbUIsR0FBbkIsVUFBb0IsTUFBc0IsRUFBRSxJQUF5QjtZQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQzVDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbkQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQzthQUN6RDtZQUVELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELG1EQUFjLEdBQWQsVUFBZSxNQUFzQixFQUFFLElBQTBCO1lBQy9ELElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFeEIsd0ZBQXdGO1lBQ3hGLHVGQUF1RjtZQUN2RixtRkFBbUY7WUFDbkYsRUFBRTtZQUNGLGdHQUFnRztZQUNoRyxnR0FBZ0c7WUFDaEcsb0RBQW9EO1lBQ3BELElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7YUFDekI7WUFFRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1QyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQzthQUNqQztRQUNILENBQUM7UUFFRCxtREFBYyxHQUFkLFVBQWUsTUFBc0I7WUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEMsQ0FBQztRQUNILGlDQUFDO0lBQUQsQ0FBQyxBQW5FRCxJQW1FQztJQUVEOzs7T0FHRztJQUNIO1FBQXlDLHNEQUEwQjtRQUNqRSxvQ0FDSSxNQUFzQixFQUFFLFFBQThCLEVBQUUsUUFBcUMsRUFDN0YsSUFBNkIsRUFBVSxRQUF3QjtZQUZuRSxZQUdFLGtCQUFNLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUN4QztZQUYwQyxjQUFRLEdBQVIsUUFBUSxDQUFnQjs7UUFFbkUsQ0FBQztRQUVELG9EQUFlLEdBQWYsVUFBZ0IsSUFBeUI7WUFDdkMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLG9DQUFzQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFO2dCQUNoRSxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsK0VBQStFO1lBQy9FLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsSUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDOUIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELGdGQUFnRjtZQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFDSCxpQ0FBQztJQUFELENBQUMsQUFyQkQsQ0FBeUMsMEJBQTBCLEdBcUJsRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FTVCwgUGFyc2VFcnJvciwgcGFyc2VUZW1wbGF0ZSwgVG1wbEFzdE5vZGUsIFRtcGxBc3RSZWZlcmVuY2UsIFRtcGxBc3RUZW1wbGF0ZSwgVG1wbEFzdFZhcmlhYmxlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb21Tb3VyY2VGaWxlLCBBYnNvbHV0ZUZzUGF0aCwgZ2V0U291cmNlRmlsZU9yRXJyb3J9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UmVmZXJlbmNlRW1pdHRlcn0gZnJvbSAnLi4vLi4vaW1wb3J0cyc7XG5pbXBvcnQge0luY3JlbWVudGFsQnVpbGR9IGZyb20gJy4uLy4uL2luY3JlbWVudGFsL2FwaSc7XG5pbXBvcnQge2lzTmFtZWRDbGFzc0RlY2xhcmF0aW9uLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0NvbXBvbmVudFNjb3BlUmVhZGVyfSBmcm9tICcuLi8uLi9zY29wZSc7XG5pbXBvcnQge2lzU2hpbX0gZnJvbSAnLi4vLi4vc2hpbXMnO1xuaW1wb3J0IHtnZXRTb3VyY2VGaWxlT3JOdWxsfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcbmltcG9ydCB7Q29tcGxldGlvbktpbmQsIERpcmVjdGl2ZUluU2NvcGUsIEdsb2JhbENvbXBsZXRpb24sIE9wdGltaXplRm9yLCBQaXBlSW5TY29wZSwgUHJvZ3JhbVR5cGVDaGVja0FkYXB0ZXIsIFN5bWJvbCwgVGVtcGxhdGVJZCwgVGVtcGxhdGVUeXBlQ2hlY2tlciwgVHlwZUNoZWNraW5nQ29uZmlnLCBUeXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksIFVwZGF0ZU1vZGV9IGZyb20gJy4uL2FwaSc7XG5pbXBvcnQge1RlbXBsYXRlRGlhZ25vc3RpY30gZnJvbSAnLi4vZGlhZ25vc3RpY3MnO1xuXG5pbXBvcnQge0V4cHJlc3Npb25JZGVudGlmaWVyLCBmaW5kRmlyc3RNYXRjaGluZ05vZGV9IGZyb20gJy4vY29tbWVudHMnO1xuaW1wb3J0IHtDb21wbGV0aW9uRW5naW5lfSBmcm9tICcuL2NvbXBsZXRpb24nO1xuaW1wb3J0IHtJbmxpbmluZ01vZGUsIFNoaW1UeXBlQ2hlY2tpbmdEYXRhLCBUZW1wbGF0ZURhdGEsIFR5cGVDaGVja0NvbnRleHRJbXBsLCBUeXBlQ2hlY2tpbmdIb3N0fSBmcm9tICcuL2NvbnRleHQnO1xuaW1wb3J0IHtmaW5kVHlwZUNoZWNrQmxvY2ssIHNob3VsZFJlcG9ydERpYWdub3N0aWMsIFRlbXBsYXRlU291cmNlUmVzb2x2ZXIsIHRyYW5zbGF0ZURpYWdub3N0aWN9IGZyb20gJy4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtUZW1wbGF0ZVNvdXJjZU1hbmFnZXJ9IGZyb20gJy4vc291cmNlJztcbmltcG9ydCB7U3ltYm9sQnVpbGRlcn0gZnJvbSAnLi90ZW1wbGF0ZV9zeW1ib2xfYnVpbGRlcic7XG5cbi8qKlxuICogUHJpbWFyeSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGVuZ2luZSwgd2hpY2ggcGVyZm9ybXMgdHlwZS1jaGVja2luZyB1c2luZyBhXG4gKiBgVHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5YCBmb3IgdHlwZS1jaGVja2luZyBwcm9ncmFtIG1haW50ZW5hbmNlLCBhbmQgdGhlXG4gKiBgUHJvZ3JhbVR5cGVDaGVja0FkYXB0ZXJgIGZvciBnZW5lcmF0aW9uIG9mIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgY29kZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsIGltcGxlbWVudHMgVGVtcGxhdGVUeXBlQ2hlY2tlciB7XG4gIHByaXZhdGUgc3RhdGUgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCBGaWxlVHlwZUNoZWNraW5nRGF0YT4oKTtcblxuICAvKipcbiAgICogU3RvcmVzIHRoZSBgQ29tcGxldGlvbkVuZ2luZWAgd2hpY2ggcG93ZXJzIGF1dG9jb21wbGV0aW9uIGZvciBlYWNoIGNvbXBvbmVudCBjbGFzcy5cbiAgICpcbiAgICogTXVzdCBiZSBpbnZhbGlkYXRlZCB3aGVuZXZlciB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUgb3IgdGhlIGB0cy5Qcm9ncmFtYCBjaGFuZ2VzLiBJbnZhbGlkYXRpb25cbiAgICogb24gdGVtcGxhdGUgY2hhbmdlcyBpcyBwZXJmb3JtZWQgd2l0aGluIHRoaXMgYFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsYCBpbnN0YW5jZS4gV2hlbiB0aGVcbiAgICogYHRzLlByb2dyYW1gIGNoYW5nZXMsIHRoZSBgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGxgIGFzIGEgd2hvbGUgaXMgZGVzdHJveWVkIGFuZCByZXBsYWNlZC5cbiAgICovXG4gIHByaXZhdGUgY29tcGxldGlvbkNhY2hlID0gbmV3IE1hcDx0cy5DbGFzc0RlY2xhcmF0aW9uLCBDb21wbGV0aW9uRW5naW5lPigpO1xuICAvKipcbiAgICogU3RvcmVzIHRoZSBgU3ltYm9sQnVpbGRlcmAgd2hpY2ggY3JlYXRlcyBzeW1ib2xzIGZvciBlYWNoIGNvbXBvbmVudCBjbGFzcy5cbiAgICpcbiAgICogTXVzdCBiZSBpbnZhbGlkYXRlZCB3aGVuZXZlciB0aGUgY29tcG9uZW50J3MgdGVtcGxhdGUgb3IgdGhlIGB0cy5Qcm9ncmFtYCBjaGFuZ2VzLiBJbnZhbGlkYXRpb25cbiAgICogb24gdGVtcGxhdGUgY2hhbmdlcyBpcyBwZXJmb3JtZWQgd2l0aGluIHRoaXMgYFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsYCBpbnN0YW5jZS4gV2hlbiB0aGVcbiAgICogYHRzLlByb2dyYW1gIGNoYW5nZXMsIHRoZSBgVGVtcGxhdGVUeXBlQ2hlY2tlckltcGxgIGFzIGEgd2hvbGUgaXMgZGVzdHJveWVkIGFuZCByZXBsYWNlZC5cbiAgICovXG4gIHByaXZhdGUgc3ltYm9sQnVpbGRlckNhY2hlID0gbmV3IE1hcDx0cy5DbGFzc0RlY2xhcmF0aW9uLCBTeW1ib2xCdWlsZGVyPigpO1xuXG4gIC8qKlxuICAgKiBTdG9yZXMgZGlyZWN0aXZlcyBhbmQgcGlwZXMgdGhhdCBhcmUgaW4gc2NvcGUgZm9yIGVhY2ggY29tcG9uZW50LlxuICAgKlxuICAgKiBVbmxpa2UgdGhlIG90aGVyIGNhY2hlcywgdGhlIHNjb3BlIG9mIGEgY29tcG9uZW50IGlzIG5vdCBhZmZlY3RlZCBieSBpdHMgdGVtcGxhdGUsIHNvIHRoaXNcbiAgICogY2FjaGUgZG9lcyBub3QgbmVlZCB0byBiZSBpbnZhbGlkYXRlIGlmIHRoZSB0ZW1wbGF0ZSBpcyBvdmVycmlkZGVuLiBJdCB3aWxsIGJlIGRlc3Ryb3llZCB3aGVuXG4gICAqIHRoZSBgdHMuUHJvZ3JhbWAgY2hhbmdlcyBhbmQgdGhlIGBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbGAgYXMgYSB3aG9sZSBpcyBkZXN0cm95ZWQgYW5kXG4gICAqIHJlcGxhY2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBzY29wZUNhY2hlID0gbmV3IE1hcDx0cy5DbGFzc0RlY2xhcmF0aW9uLCBTY29wZURhdGE+KCk7XG5cbiAgcHJpdmF0ZSBpc0NvbXBsZXRlID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG9yaWdpbmFsUHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICAgIHJlYWRvbmx5IHR5cGVDaGVja2luZ1N0cmF0ZWd5OiBUeXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgICBwcml2YXRlIHR5cGVDaGVja0FkYXB0ZXI6IFByb2dyYW1UeXBlQ2hlY2tBZGFwdGVyLCBwcml2YXRlIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLFxuICAgICAgcHJpdmF0ZSByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgICBwcml2YXRlIGNvbXBpbGVySG9zdDogUGljazx0cy5Db21waWxlckhvc3QsICdnZXRDYW5vbmljYWxGaWxlTmFtZSc+LFxuICAgICAgcHJpdmF0ZSBwcmlvckJ1aWxkOiBJbmNyZW1lbnRhbEJ1aWxkPHVua25vd24sIEZpbGVUeXBlQ2hlY2tpbmdEYXRhPixcbiAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29tcG9uZW50U2NvcGVSZWFkZXI6IENvbXBvbmVudFNjb3BlUmVhZGVyKSB7fVxuXG4gIHJlc2V0T3ZlcnJpZGVzKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZmlsZVJlY29yZCBvZiB0aGlzLnN0YXRlLnZhbHVlcygpKSB7XG4gICAgICBpZiAoZmlsZVJlY29yZC50ZW1wbGF0ZU92ZXJyaWRlcyAhPT0gbnVsbCkge1xuICAgICAgICBmaWxlUmVjb3JkLnRlbXBsYXRlT3ZlcnJpZGVzID0gbnVsbDtcbiAgICAgICAgZmlsZVJlY29yZC5zaGltRGF0YS5jbGVhcigpO1xuICAgICAgICBmaWxlUmVjb3JkLmlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZGVhbGx5IG9ubHkgdGhvc2UgY29tcG9uZW50cyB3aXRoIG92ZXJyaWRkZW4gdGVtcGxhdGVzIHdvdWxkIGhhdmUgdGhlaXIgY2FjaGVzIGludmFsaWRhdGVkLFxuICAgIC8vIGJ1dCB0aGUgYFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsYCBkb2VzIG5vdCB0cmFjayB0aGUgY2xhc3MgZm9yIGNvbXBvbmVudHMgd2l0aCBvdmVycmlkZXMuIEFzXG4gICAgLy8gYSBxdWljayB3b3JrYXJvdW5kLCBjbGVhciB0aGUgZW50aXJlIGNhY2hlIGluc3RlYWQuXG4gICAgdGhpcy5jb21wbGV0aW9uQ2FjaGUuY2xlYXIoKTtcbiAgICB0aGlzLnN5bWJvbEJ1aWxkZXJDYWNoZS5jbGVhcigpO1xuICB9XG5cbiAgZ2V0VGVtcGxhdGUoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogVG1wbEFzdE5vZGVbXXxudWxsIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLmdldExhdGVzdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudCk7XG4gICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YS50ZW1wbGF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGF0ZXN0Q29tcG9uZW50U3RhdGUoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIHtkYXRhOiBUZW1wbGF0ZURhdGF8bnVsbCwgdGNiOiB0cy5Ob2RlfG51bGwsIHNoaW1QYXRoOiBBYnNvbHV0ZUZzUGF0aH0ge1xuICAgIHRoaXMuZW5zdXJlU2hpbUZvckNvbXBvbmVudChjb21wb25lbnQpO1xuXG4gICAgY29uc3Qgc2YgPSBjb21wb25lbnQuZ2V0U291cmNlRmlsZSgpO1xuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuICAgIGNvbnN0IHNoaW1QYXRoID0gdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneS5zaGltUGF0aEZvckNvbXBvbmVudChjb21wb25lbnQpO1xuXG4gICAgY29uc3QgZmlsZVJlY29yZCA9IHRoaXMuZ2V0RmlsZURhdGEoc2ZQYXRoKTtcblxuICAgIGlmICghZmlsZVJlY29yZC5zaGltRGF0YS5oYXMoc2hpbVBhdGgpKSB7XG4gICAgICByZXR1cm4ge2RhdGE6IG51bGwsIHRjYjogbnVsbCwgc2hpbVBhdGh9O1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIuZ2V0VGVtcGxhdGVJZChjb21wb25lbnQpO1xuICAgIGNvbnN0IHNoaW1SZWNvcmQgPSBmaWxlUmVjb3JkLnNoaW1EYXRhLmdldChzaGltUGF0aCkhO1xuICAgIGNvbnN0IGlkID0gZmlsZVJlY29yZC5zb3VyY2VNYW5hZ2VyLmdldFRlbXBsYXRlSWQoY29tcG9uZW50KTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSB0aGlzLnR5cGVDaGVja2luZ1N0cmF0ZWd5LmdldFByb2dyYW0oKTtcbiAgICBjb25zdCBzaGltU2YgPSBnZXRTb3VyY2VGaWxlT3JOdWxsKHByb2dyYW0sIHNoaW1QYXRoKTtcblxuICAgIGlmIChzaGltU2YgPT09IG51bGwgfHwgIWZpbGVSZWNvcmQuc2hpbURhdGEuaGFzKHNoaW1QYXRoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvcjogbm8gc2hpbSBmaWxlIGluIHByb2dyYW06ICR7c2hpbVBhdGh9YCk7XG4gICAgfVxuXG4gICAgbGV0IHRjYjogdHMuTm9kZXxudWxsID0gZmluZFR5cGVDaGVja0Jsb2NrKHNoaW1TZiwgaWQpO1xuXG4gICAgaWYgKHRjYiA9PT0gbnVsbCkge1xuICAgICAgLy8gVHJ5IGZvciBhbiBpbmxpbmUgYmxvY2suXG4gICAgICBjb25zdCBpbmxpbmVTZiA9IGdldFNvdXJjZUZpbGVPckVycm9yKHByb2dyYW0sIHNmUGF0aCk7XG4gICAgICB0Y2IgPSBmaW5kVHlwZUNoZWNrQmxvY2soaW5saW5lU2YsIGlkKTtcbiAgICB9XG5cbiAgICBsZXQgZGF0YTogVGVtcGxhdGVEYXRhfG51bGwgPSBudWxsO1xuICAgIGlmIChzaGltUmVjb3JkLnRlbXBsYXRlcy5oYXModGVtcGxhdGVJZCkpIHtcbiAgICAgIGRhdGEgPSBzaGltUmVjb3JkLnRlbXBsYXRlcy5nZXQodGVtcGxhdGVJZCkhO1xuICAgIH1cblxuICAgIHJldHVybiB7ZGF0YSwgdGNiLCBzaGltUGF0aH07XG4gIH1cblxuICBvdmVycmlkZUNvbXBvbmVudFRlbXBsYXRlKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbiwgdGVtcGxhdGU6IHN0cmluZyk6XG4gICAgICB7bm9kZXM6IFRtcGxBc3ROb2RlW10sIGVycm9ycz86IFBhcnNlRXJyb3JbXX0ge1xuICAgIGNvbnN0IHtub2RlcywgZXJyb3JzfSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsICdvdmVycmlkZS5odG1sJywge1xuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlczogdHJ1ZSxcbiAgICAgIGxlYWRpbmdUcml2aWFDaGFyczogW10sXG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3JzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4ge25vZGVzLCBlcnJvcnN9O1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShjb21wb25lbnQuZ2V0U291cmNlRmlsZSgpKTtcblxuICAgIGNvbnN0IGZpbGVSZWNvcmQgPSB0aGlzLmdldEZpbGVEYXRhKGZpbGVQYXRoKTtcbiAgICBjb25zdCBpZCA9IGZpbGVSZWNvcmQuc291cmNlTWFuYWdlci5nZXRUZW1wbGF0ZUlkKGNvbXBvbmVudCk7XG5cbiAgICBpZiAoZmlsZVJlY29yZC50ZW1wbGF0ZU92ZXJyaWRlcyA9PT0gbnVsbCkge1xuICAgICAgZmlsZVJlY29yZC50ZW1wbGF0ZU92ZXJyaWRlcyA9IG5ldyBNYXAoKTtcbiAgICB9XG5cbiAgICBmaWxlUmVjb3JkLnRlbXBsYXRlT3ZlcnJpZGVzLnNldChpZCwgbm9kZXMpO1xuXG4gICAgLy8gQ2xlYXIgZGF0YSBmb3IgdGhlIHNoaW0gaW4gcXVlc3Rpb24sIHNvIGl0J2xsIGJlIHJlZ2VuZXJhdGVkIG9uIHRoZSBuZXh0IHJlcXVlc3QuXG4gICAgY29uc3Qgc2hpbUZpbGUgPSB0aGlzLnR5cGVDaGVja2luZ1N0cmF0ZWd5LnNoaW1QYXRoRm9yQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgZmlsZVJlY29yZC5zaGltRGF0YS5kZWxldGUoc2hpbUZpbGUpO1xuICAgIGZpbGVSZWNvcmQuaXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIHRoaXMuaXNDb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgLy8gT3ZlcnJpZGluZyBhIGNvbXBvbmVudCdzIHRlbXBsYXRlIGludmFsaWRhdGVzIGl0cyBjYWNoZWQgcmVzdWx0cy5cbiAgICB0aGlzLmNvbXBsZXRpb25DYWNoZS5kZWxldGUoY29tcG9uZW50KTtcbiAgICB0aGlzLnN5bWJvbEJ1aWxkZXJDYWNoZS5kZWxldGUoY29tcG9uZW50KTtcblxuICAgIHJldHVybiB7bm9kZXN9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHR5cGUtY2hlY2tpbmcgZGlhZ25vc3RpY3MgZnJvbSB0aGUgZ2l2ZW4gYHRzLlNvdXJjZUZpbGVgIHVzaW5nIHRoZSBtb3N0IHJlY2VudFxuICAgKiB0eXBlLWNoZWNraW5nIHByb2dyYW0uXG4gICAqL1xuICBnZXREaWFnbm9zdGljc0ZvckZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUsIG9wdGltaXplRm9yOiBPcHRpbWl6ZUZvcik6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgc3dpdGNoIChvcHRpbWl6ZUZvcikge1xuICAgICAgY2FzZSBPcHRpbWl6ZUZvci5XaG9sZVByb2dyYW06XG4gICAgICAgIHRoaXMuZW5zdXJlQWxsU2hpbXNGb3JBbGxGaWxlcygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgT3B0aW1pemVGb3IuU2luZ2xlRmlsZTpcbiAgICAgICAgdGhpcy5lbnN1cmVBbGxTaGltc0Zvck9uZUZpbGUoc2YpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICBjb25zdCBmaWxlUmVjb3JkID0gdGhpcy5zdGF0ZS5nZXQoc2ZQYXRoKSE7XG5cbiAgICBjb25zdCB0eXBlQ2hlY2tQcm9ncmFtID0gdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneS5nZXRQcm9ncmFtKCk7XG5cbiAgICBjb25zdCBkaWFnbm9zdGljczogKHRzLkRpYWdub3N0aWN8bnVsbClbXSA9IFtdO1xuICAgIGlmIChmaWxlUmVjb3JkLmhhc0lubGluZXMpIHtcbiAgICAgIGNvbnN0IGlubGluZVNmID0gZ2V0U291cmNlRmlsZU9yRXJyb3IodHlwZUNoZWNrUHJvZ3JhbSwgc2ZQYXRoKTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKGlubGluZVNmKS5tYXAoXG4gICAgICAgICAgZGlhZyA9PiBjb252ZXJ0RGlhZ25vc3RpYyhkaWFnLCBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIpKSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbc2hpbVBhdGgsIHNoaW1SZWNvcmRdIG9mIGZpbGVSZWNvcmQuc2hpbURhdGEpIHtcbiAgICAgIGNvbnN0IHNoaW1TZiA9IGdldFNvdXJjZUZpbGVPckVycm9yKHR5cGVDaGVja1Byb2dyYW0sIHNoaW1QYXRoKTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNoaW1TZikubWFwKFxuICAgICAgICAgIGRpYWcgPT4gY29udmVydERpYWdub3N0aWMoZGlhZywgZmlsZVJlY29yZC5zb3VyY2VNYW5hZ2VyKSkpO1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5zaGltUmVjb3JkLmdlbmVzaXNEaWFnbm9zdGljcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpYWdub3N0aWNzLmZpbHRlcigoZGlhZzogdHMuRGlhZ25vc3RpY3xudWxsKTogZGlhZyBpcyB0cy5EaWFnbm9zdGljID0+IGRpYWcgIT09IG51bGwpO1xuICB9XG5cbiAgZ2V0RGlhZ25vc3RpY3NGb3JDb21wb25lbnQoY29tcG9uZW50OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogdHMuRGlhZ25vc3RpY1tdIHtcbiAgICB0aGlzLmVuc3VyZVNoaW1Gb3JDb21wb25lbnQoY29tcG9uZW50KTtcblxuICAgIGNvbnN0IHNmID0gY29tcG9uZW50LmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICBjb25zdCBzaGltUGF0aCA9IHRoaXMudHlwZUNoZWNraW5nU3RyYXRlZ3kuc2hpbVBhdGhGb3JDb21wb25lbnQoY29tcG9uZW50KTtcblxuICAgIGNvbnN0IGZpbGVSZWNvcmQgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG5cbiAgICBpZiAoIWZpbGVSZWNvcmQuc2hpbURhdGEuaGFzKHNoaW1QYXRoKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIuZ2V0VGVtcGxhdGVJZChjb21wb25lbnQpO1xuICAgIGNvbnN0IHNoaW1SZWNvcmQgPSBmaWxlUmVjb3JkLnNoaW1EYXRhLmdldChzaGltUGF0aCkhO1xuXG4gICAgY29uc3QgdHlwZUNoZWNrUHJvZ3JhbSA9IHRoaXMudHlwZUNoZWNraW5nU3RyYXRlZ3kuZ2V0UHJvZ3JhbSgpO1xuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IChUZW1wbGF0ZURpYWdub3N0aWN8bnVsbClbXSA9IFtdO1xuICAgIGlmIChzaGltUmVjb3JkLmhhc0lubGluZXMpIHtcbiAgICAgIGNvbnN0IGlubGluZVNmID0gZ2V0U291cmNlRmlsZU9yRXJyb3IodHlwZUNoZWNrUHJvZ3JhbSwgc2ZQYXRoKTtcbiAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKGlubGluZVNmKS5tYXAoXG4gICAgICAgICAgZGlhZyA9PiBjb252ZXJ0RGlhZ25vc3RpYyhkaWFnLCBmaWxlUmVjb3JkLnNvdXJjZU1hbmFnZXIpKSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2hpbVNmID0gZ2V0U291cmNlRmlsZU9yRXJyb3IodHlwZUNoZWNrUHJvZ3JhbSwgc2hpbVBhdGgpO1xuICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHlwZUNoZWNrUHJvZ3JhbS5nZXRTZW1hbnRpY0RpYWdub3N0aWNzKHNoaW1TZikubWFwKFxuICAgICAgICBkaWFnID0+IGNvbnZlcnREaWFnbm9zdGljKGRpYWcsIGZpbGVSZWNvcmQuc291cmNlTWFuYWdlcikpKTtcbiAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnNoaW1SZWNvcmQuZ2VuZXNpc0RpYWdub3N0aWNzKTtcblxuICAgIHJldHVybiBkaWFnbm9zdGljcy5maWx0ZXIoXG4gICAgICAgIChkaWFnOiBUZW1wbGF0ZURpYWdub3N0aWN8bnVsbCk6IGRpYWcgaXMgVGVtcGxhdGVEaWFnbm9zdGljID0+XG4gICAgICAgICAgICBkaWFnICE9PSBudWxsICYmIGRpYWcudGVtcGxhdGVJZCA9PT0gdGVtcGxhdGVJZCk7XG4gIH1cblxuICBnZXRUeXBlQ2hlY2tCbG9jayhjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiB0cy5Ob2RlfG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldExhdGVzdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudCkudGNiO1xuICB9XG5cbiAgZ2V0R2xvYmFsQ29tcGxldGlvbnMoY29udGV4dDogVG1wbEFzdFRlbXBsYXRlfG51bGwsIGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6XG4gICAgICBHbG9iYWxDb21wbGV0aW9ufG51bGwge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuZ2V0T3JDcmVhdGVDb21wbGV0aW9uRW5naW5lKGNvbXBvbmVudCk7XG4gICAgaWYgKGVuZ2luZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBlbmdpbmUuZ2V0R2xvYmFsQ29tcGxldGlvbnMoY29udGV4dCk7XG4gIH1cblxuICBwcml2YXRlIGdldE9yQ3JlYXRlQ29tcGxldGlvbkVuZ2luZShjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBDb21wbGV0aW9uRW5naW5lfG51bGwge1xuICAgIGlmICh0aGlzLmNvbXBsZXRpb25DYWNoZS5oYXMoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGlvbkNhY2hlLmdldChjb21wb25lbnQpITtcbiAgICB9XG5cbiAgICBjb25zdCB7dGNiLCBkYXRhLCBzaGltUGF0aH0gPSB0aGlzLmdldExhdGVzdENvbXBvbmVudFN0YXRlKGNvbXBvbmVudCk7XG4gICAgaWYgKHRjYiA9PT0gbnVsbCB8fCBkYXRhID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBlbmdpbmUgPSBuZXcgQ29tcGxldGlvbkVuZ2luZSh0Y2IsIGRhdGEsIHNoaW1QYXRoKTtcbiAgICB0aGlzLmNvbXBsZXRpb25DYWNoZS5zZXQoY29tcG9uZW50LCBlbmdpbmUpO1xuICAgIHJldHVybiBlbmdpbmU7XG4gIH1cblxuICBwcml2YXRlIG1heWJlQWRvcHRQcmlvclJlc3VsdHNGb3JGaWxlKHNmOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgY29uc3Qgc2ZQYXRoID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShzZik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaGFzKHNmUGF0aCkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nUmVzdWx0cyA9IHRoaXMuc3RhdGUuZ2V0KHNmUGF0aCkhO1xuICAgICAgaWYgKGV4aXN0aW5nUmVzdWx0cy50ZW1wbGF0ZU92ZXJyaWRlcyAhPT0gbnVsbCkge1xuICAgICAgICAvLyBDYW5ub3QgYWRvcHQgcHJpb3IgcmVzdWx0cyBpZiB0ZW1wbGF0ZSBvdmVycmlkZXMgaGF2ZSBiZWVuIHJlcXVlc3RlZC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3RpbmdSZXN1bHRzLmlzQ29tcGxldGUpIHtcbiAgICAgICAgLy8gQWxsIGRhdGEgZm9yIHRoaXMgZmlsZSBoYXMgYWxyZWFkeSBiZWVuIGdlbmVyYXRlZCwgc28gbm8gbmVlZCB0byBhZG9wdCBhbnl0aGluZy5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHByZXZpb3VzUmVzdWx0cyA9IHRoaXMucHJpb3JCdWlsZC5wcmlvclR5cGVDaGVja2luZ1Jlc3VsdHNGb3Ioc2YpO1xuICAgIGlmIChwcmV2aW91c1Jlc3VsdHMgPT09IG51bGwgfHwgIXByZXZpb3VzUmVzdWx0cy5pc0NvbXBsZXRlIHx8XG4gICAgICAgIHByZXZpb3VzUmVzdWx0cy50ZW1wbGF0ZU92ZXJyaWRlcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUuc2V0KHNmUGF0aCwgcHJldmlvdXNSZXN1bHRzKTtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlQWxsU2hpbXNGb3JBbGxGaWxlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0NvbXBsZXRlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaG9zdCA9IG5ldyBXaG9sZVByb2dyYW1UeXBlQ2hlY2tpbmdIb3N0KHRoaXMpO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMubmV3Q29udGV4dChob3N0KTtcblxuICAgIGZvciAoY29uc3Qgc2Ygb2YgdGhpcy5vcmlnaW5hbFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgaWYgKHNmLmlzRGVjbGFyYXRpb25GaWxlIHx8IGlzU2hpbShzZikpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubWF5YmVBZG9wdFByaW9yUmVzdWx0c0ZvckZpbGUoc2YpO1xuXG4gICAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICAgIGNvbnN0IGZpbGVEYXRhID0gdGhpcy5nZXRGaWxlRGF0YShzZlBhdGgpO1xuICAgICAgaWYgKGZpbGVEYXRhLmlzQ29tcGxldGUpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudHlwZUNoZWNrQWRhcHRlci50eXBlQ2hlY2soc2YsIGN0eCk7XG5cbiAgICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlRnJvbUNvbnRleHQoY3R4KTtcbiAgICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVBbGxTaGltc0Zvck9uZUZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICB0aGlzLm1heWJlQWRvcHRQcmlvclJlc3VsdHNGb3JGaWxlKHNmKTtcblxuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuXG4gICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgaWYgKGZpbGVEYXRhLmlzQ29tcGxldGUpIHtcbiAgICAgIC8vIEFsbCBkYXRhIGZvciB0aGlzIGZpbGUgaXMgcHJlc2VudCBhbmQgYWNjb3VudGVkIGZvciBhbHJlYWR5LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhvc3QgPSBuZXcgU2luZ2xlRmlsZVR5cGVDaGVja2luZ0hvc3Qoc2ZQYXRoLCBmaWxlRGF0YSwgdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneSwgdGhpcyk7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5uZXdDb250ZXh0KGhvc3QpO1xuXG4gICAgdGhpcy50eXBlQ2hlY2tBZGFwdGVyLnR5cGVDaGVjayhzZiwgY3R4KTtcblxuICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSB0cnVlO1xuXG4gICAgdGhpcy51cGRhdGVGcm9tQ29udGV4dChjdHgpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVTaGltRm9yQ29tcG9uZW50KGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IHNmID0gY29tcG9uZW50LmdldFNvdXJjZUZpbGUoKTtcbiAgICBjb25zdCBzZlBhdGggPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcblxuICAgIHRoaXMubWF5YmVBZG9wdFByaW9yUmVzdWx0c0ZvckZpbGUoc2YpO1xuXG4gICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgY29uc3Qgc2hpbVBhdGggPSB0aGlzLnR5cGVDaGVja2luZ1N0cmF0ZWd5LnNoaW1QYXRoRm9yQ29tcG9uZW50KGNvbXBvbmVudCk7XG5cbiAgICBpZiAoZmlsZURhdGEuc2hpbURhdGEuaGFzKHNoaW1QYXRoKSkge1xuICAgICAgLy8gQWxsIGRhdGEgZm9yIHRoaXMgY29tcG9uZW50IGlzIGF2YWlsYWJsZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBob3N0ID1cbiAgICAgICAgbmV3IFNpbmdsZVNoaW1UeXBlQ2hlY2tpbmdIb3N0KHNmUGF0aCwgZmlsZURhdGEsIHRoaXMudHlwZUNoZWNraW5nU3RyYXRlZ3ksIHRoaXMsIHNoaW1QYXRoKTtcbiAgICBjb25zdCBjdHggPSB0aGlzLm5ld0NvbnRleHQoaG9zdCk7XG5cbiAgICB0aGlzLnR5cGVDaGVja0FkYXB0ZXIudHlwZUNoZWNrKHNmLCBjdHgpO1xuICAgIHRoaXMudXBkYXRlRnJvbUNvbnRleHQoY3R4KTtcbiAgfVxuXG4gIHByaXZhdGUgbmV3Q29udGV4dChob3N0OiBUeXBlQ2hlY2tpbmdIb3N0KTogVHlwZUNoZWNrQ29udGV4dEltcGwge1xuICAgIGNvbnN0IGlubGluaW5nID0gdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneS5zdXBwb3J0c0lubGluZU9wZXJhdGlvbnMgPyBJbmxpbmluZ01vZGUuSW5saW5lT3BzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSW5saW5pbmdNb2RlLkVycm9yO1xuICAgIHJldHVybiBuZXcgVHlwZUNoZWNrQ29udGV4dEltcGwoXG4gICAgICAgIHRoaXMuY29uZmlnLCB0aGlzLmNvbXBpbGVySG9zdCwgdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneSwgdGhpcy5yZWZFbWl0dGVyLCB0aGlzLnJlZmxlY3RvcixcbiAgICAgICAgaG9zdCwgaW5saW5pbmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbnkgc2hpbSBkYXRhIHRoYXQgZGVwZW5kcyBvbiBpbmxpbmUgb3BlcmF0aW9ucyBhcHBsaWVkIHRvIHRoZSB0eXBlLWNoZWNraW5nIHByb2dyYW0uXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWZ1bCBpZiBuZXcgaW5saW5lcyBuZWVkIHRvIGJlIGFwcGxpZWQsIGFuZCBpdCdzIG5vdCBwb3NzaWJsZSB0byBndWFyYW50ZWUgdGhhdFxuICAgKiB0aGV5IHdvbid0IG92ZXJ3cml0ZSBvciBjb3JydXB0IGV4aXN0aW5nIGlubGluZXMgdGhhdCBhcmUgdXNlZCBieSBzdWNoIHNoaW1zLlxuICAgKi9cbiAgY2xlYXJBbGxTaGltRGF0YVVzaW5nSW5saW5lcygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGZpbGVEYXRhIG9mIHRoaXMuc3RhdGUudmFsdWVzKCkpIHtcbiAgICAgIGlmICghZmlsZURhdGEuaGFzSW5saW5lcykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBbc2hpbUZpbGUsIHNoaW1EYXRhXSBvZiBmaWxlRGF0YS5zaGltRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgaWYgKHNoaW1EYXRhLmhhc0lubGluZXMpIHtcbiAgICAgICAgICBmaWxlRGF0YS5zaGltRGF0YS5kZWxldGUoc2hpbUZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZpbGVEYXRhLmhhc0lubGluZXMgPSBmYWxzZTtcbiAgICAgIGZpbGVEYXRhLmlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgIHRoaXMuaXNDb21wbGV0ZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlRnJvbUNvbnRleHQoY3R4OiBUeXBlQ2hlY2tDb250ZXh0SW1wbCk6IHZvaWQge1xuICAgIGNvbnN0IHVwZGF0ZXMgPSBjdHguZmluYWxpemUoKTtcbiAgICB0aGlzLnR5cGVDaGVja2luZ1N0cmF0ZWd5LnVwZGF0ZUZpbGVzKHVwZGF0ZXMsIFVwZGF0ZU1vZGUuSW5jcmVtZW50YWwpO1xuICAgIHRoaXMucHJpb3JCdWlsZC5yZWNvcmRTdWNjZXNzZnVsVHlwZUNoZWNrKHRoaXMuc3RhdGUpO1xuICB9XG5cbiAgZ2V0RmlsZURhdGEocGF0aDogQWJzb2x1dGVGc1BhdGgpOiBGaWxlVHlwZUNoZWNraW5nRGF0YSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmhhcyhwYXRoKSkge1xuICAgICAgdGhpcy5zdGF0ZS5zZXQocGF0aCwge1xuICAgICAgICBoYXNJbmxpbmVzOiBmYWxzZSxcbiAgICAgICAgdGVtcGxhdGVPdmVycmlkZXM6IG51bGwsXG4gICAgICAgIHNvdXJjZU1hbmFnZXI6IG5ldyBUZW1wbGF0ZVNvdXJjZU1hbmFnZXIoKSxcbiAgICAgICAgaXNDb21wbGV0ZTogZmFsc2UsXG4gICAgICAgIHNoaW1EYXRhOiBuZXcgTWFwKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUuZ2V0KHBhdGgpITtcbiAgfVxuXG4gIGdldFN5bWJvbE9mTm9kZShub2RlOiBBU1R8VG1wbEFzdE5vZGUsIGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFN5bWJvbHxudWxsIHtcbiAgICBjb25zdCBidWlsZGVyID0gdGhpcy5nZXRPckNyZWF0ZVN5bWJvbEJ1aWxkZXIoY29tcG9uZW50KTtcbiAgICBpZiAoYnVpbGRlciA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBidWlsZGVyLmdldFN5bWJvbChub2RlKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0T3JDcmVhdGVTeW1ib2xCdWlsZGVyKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFN5bWJvbEJ1aWxkZXJ8bnVsbCB7XG4gICAgaWYgKHRoaXMuc3ltYm9sQnVpbGRlckNhY2hlLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zeW1ib2xCdWlsZGVyQ2FjaGUuZ2V0KGNvbXBvbmVudCkhO1xuICAgIH1cblxuICAgIGNvbnN0IHt0Y2IsIGRhdGEsIHNoaW1QYXRofSA9IHRoaXMuZ2V0TGF0ZXN0Q29tcG9uZW50U3RhdGUoY29tcG9uZW50KTtcbiAgICBpZiAodGNiID09PSBudWxsIHx8IGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGJ1aWxkZXIgPSBuZXcgU3ltYm9sQnVpbGRlcihcbiAgICAgICAgc2hpbVBhdGgsIHRjYiwgZGF0YSwgdGhpcy5jb21wb25lbnRTY29wZVJlYWRlcixcbiAgICAgICAgKCkgPT4gdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneS5nZXRQcm9ncmFtKCkuZ2V0VHlwZUNoZWNrZXIoKSk7XG4gICAgdGhpcy5zeW1ib2xCdWlsZGVyQ2FjaGUuc2V0KGNvbXBvbmVudCwgYnVpbGRlcik7XG4gICAgcmV0dXJuIGJ1aWxkZXI7XG4gIH1cblxuICBnZXREaXJlY3RpdmVzSW5TY29wZShjb21wb25lbnQ6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBEaXJlY3RpdmVJblNjb3BlW118bnVsbCB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0U2NvcGVEYXRhKGNvbXBvbmVudCk7XG4gICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YS5kaXJlY3RpdmVzO1xuICB9XG5cbiAgZ2V0UGlwZXNJblNjb3BlKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFBpcGVJblNjb3BlW118bnVsbCB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZ2V0U2NvcGVEYXRhKGNvbXBvbmVudCk7XG4gICAgaWYgKGRhdGEgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YS5waXBlcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2NvcGVEYXRhKGNvbXBvbmVudDogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFNjb3BlRGF0YXxudWxsIHtcbiAgICBpZiAodGhpcy5zY29wZUNhY2hlLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm4gdGhpcy5zY29wZUNhY2hlLmdldChjb21wb25lbnQpITtcbiAgICB9XG5cbiAgICBpZiAoIWlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKGNvbXBvbmVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IGNvbXBvbmVudHMgbXVzdCBoYXZlIG5hbWVzYCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcGUgPSB0aGlzLmNvbXBvbmVudFNjb3BlUmVhZGVyLmdldFNjb3BlRm9yQ29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgaWYgKHNjb3BlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhOiBTY29wZURhdGEgPSB7XG4gICAgICBkaXJlY3RpdmVzOiBbXSxcbiAgICAgIHBpcGVzOiBbXSxcbiAgICAgIGlzUG9pc29uZWQ6IHNjb3BlLmNvbXBpbGF0aW9uLmlzUG9pc29uZWQsXG4gICAgfTtcblxuICAgIGNvbnN0IHR5cGVDaGVja2VyID0gdGhpcy50eXBlQ2hlY2tpbmdTdHJhdGVneS5nZXRQcm9ncmFtKCkuZ2V0VHlwZUNoZWNrZXIoKTtcbiAgICBmb3IgKGNvbnN0IGRpciBvZiBzY29wZS5leHBvcnRlZC5kaXJlY3RpdmVzKSB7XG4gICAgICBpZiAoZGlyLnNlbGVjdG9yID09PSBudWxsKSB7XG4gICAgICAgIC8vIFNraXAgdGhpcyBkaXJlY3RpdmUsIGl0IGNhbid0IGJlIGFkZGVkIHRvIGEgdGVtcGxhdGUgYW55d2F5LlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRzU3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihkaXIucmVmLm5vZGUubmFtZSk7XG4gICAgICBpZiAodHNTeW1ib2wgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGRhdGEuZGlyZWN0aXZlcy5wdXNoKHtcbiAgICAgICAgaXNDb21wb25lbnQ6IGRpci5pc0NvbXBvbmVudCxcbiAgICAgICAgc2VsZWN0b3I6IGRpci5zZWxlY3RvcixcbiAgICAgICAgdHNTeW1ib2wsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHBpcGUgb2Ygc2NvcGUuZXhwb3J0ZWQucGlwZXMpIHtcbiAgICAgIGNvbnN0IHRzU3ltYm9sID0gdHlwZUNoZWNrZXIuZ2V0U3ltYm9sQXRMb2NhdGlvbihwaXBlLnJlZi5ub2RlLm5hbWUpO1xuICAgICAgaWYgKHRzU3ltYm9sID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBkYXRhLnBpcGVzLnB1c2goe1xuICAgICAgICBuYW1lOiBwaXBlLm5hbWUsXG4gICAgICAgIHRzU3ltYm9sLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zY29wZUNhY2hlLnNldChjb21wb25lbnQsIGRhdGEpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnREaWFnbm9zdGljKFxuICAgIGRpYWc6IHRzLkRpYWdub3N0aWMsIHNvdXJjZVJlc29sdmVyOiBUZW1wbGF0ZVNvdXJjZVJlc29sdmVyKTogVGVtcGxhdGVEaWFnbm9zdGljfG51bGwge1xuICBpZiAoIXNob3VsZFJlcG9ydERpYWdub3N0aWMoZGlhZykpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gdHJhbnNsYXRlRGlhZ25vc3RpYyhkaWFnLCBzb3VyY2VSZXNvbHZlcik7XG59XG5cbi8qKlxuICogRGF0YSBmb3IgdGVtcGxhdGUgdHlwZS1jaGVja2luZyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgaW5wdXQgZmlsZSBpbiB0aGUgdXNlcidzIHByb2dyYW0gKHdoaWNoXG4gKiBjb250YWlucyBjb21wb25lbnRzIHRvIGJlIGNoZWNrZWQpLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVUeXBlQ2hlY2tpbmdEYXRhIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhlIHR5cGUtY2hlY2tpbmcgc2hpbSByZXF1aXJlZCBhbnkgaW5saW5lIGNoYW5nZXMgdG8gdGhlIG9yaWdpbmFsIGZpbGUsIHdoaWNoIGFmZmVjdHNcbiAgICogd2hldGhlciB0aGUgc2hpbSBjYW4gYmUgcmV1c2VkLlxuICAgKi9cbiAgaGFzSW5saW5lczogYm9vbGVhbjtcblxuICAvKipcbiAgICogU291cmNlIG1hcHBpbmcgaW5mb3JtYXRpb24gZm9yIG1hcHBpbmcgZGlhZ25vc3RpY3MgZnJvbSBpbmxpbmVkIHR5cGUgY2hlY2sgYmxvY2tzIGJhY2sgdG8gdGhlXG4gICAqIG9yaWdpbmFsIHRlbXBsYXRlLlxuICAgKi9cbiAgc291cmNlTWFuYWdlcjogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyO1xuXG4gIC8qKlxuICAgKiBNYXAgb2YgdGVtcGxhdGUgb3ZlcnJpZGVzIGFwcGxpZWQgdG8gYW55IGNvbXBvbmVudHMgaW4gdGhpcyBpbnB1dCBmaWxlLlxuICAgKi9cbiAgdGVtcGxhdGVPdmVycmlkZXM6IE1hcDxUZW1wbGF0ZUlkLCBUbXBsQXN0Tm9kZVtdPnxudWxsO1xuXG4gIC8qKlxuICAgKiBEYXRhIGZvciBlYWNoIHNoaW0gZ2VuZXJhdGVkIGZyb20gdGhpcyBpbnB1dCBmaWxlLlxuICAgKlxuICAgKiBBIHNpbmdsZSBpbnB1dCBmaWxlIHdpbGwgZ2VuZXJhdGUgb25lIG9yIG1vcmUgc2hpbSBmaWxlcyB0aGF0IGFjdHVhbGx5IGNvbnRhaW4gdGVtcGxhdGVcbiAgICogdHlwZS1jaGVja2luZyBjb2RlLlxuICAgKi9cbiAgc2hpbURhdGE6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgU2hpbVR5cGVDaGVja2luZ0RhdGE+O1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNrZXIgaXMgY2VydGFpbiB0aGF0IGFsbCBjb21wb25lbnRzIGZyb20gdGhpcyBpbnB1dCBmaWxlIGhhdmUgaGFkXG4gICAqIHR5cGUtY2hlY2tpbmcgY29kZSBnZW5lcmF0ZWQgaW50byBzaGltcy5cbiAgICovXG4gIGlzQ29tcGxldGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogRHJpdmVzIGEgYFR5cGVDaGVja0NvbnRleHRgIHRvIGdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBmb3IgZXZlcnkgY29tcG9uZW50IGluIHRoZSBwcm9ncmFtLlxuICovXG5jbGFzcyBXaG9sZVByb2dyYW1UeXBlQ2hlY2tpbmdIb3N0IGltcGxlbWVudHMgVHlwZUNoZWNraW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaW1wbDogVGVtcGxhdGVUeXBlQ2hlY2tlckltcGwpIHt9XG5cbiAgZ2V0U291cmNlTWFuYWdlcihzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyIHtcbiAgICByZXR1cm4gdGhpcy5pbXBsLmdldEZpbGVEYXRhKHNmUGF0aCkuc291cmNlTWFuYWdlcjtcbiAgfVxuXG4gIHNob3VsZENoZWNrQ29tcG9uZW50KG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICBjb25zdCBmaWxlRGF0YSA9IHRoaXMuaW1wbC5nZXRGaWxlRGF0YShhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKG5vZGUuZ2V0U291cmNlRmlsZSgpKSk7XG4gICAgY29uc3Qgc2hpbVBhdGggPSB0aGlzLmltcGwudHlwZUNoZWNraW5nU3RyYXRlZ3kuc2hpbVBhdGhGb3JDb21wb25lbnQobm9kZSk7XG4gICAgLy8gVGhlIGNvbXBvbmVudCBuZWVkcyB0byBiZSBjaGVja2VkIHVubGVzcyB0aGUgc2hpbSB3aGljaCB3b3VsZCBjb250YWluIGl0IGFscmVhZHkgZXhpc3RzLlxuICAgIHJldHVybiAhZmlsZURhdGEuc2hpbURhdGEuaGFzKHNoaW1QYXRoKTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlT3ZlcnJpZGUoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgbm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFRtcGxBc3ROb2RlW118bnVsbCB7XG4gICAgY29uc3QgZmlsZURhdGEgPSB0aGlzLmltcGwuZ2V0RmlsZURhdGEoc2ZQYXRoKTtcbiAgICBpZiAoZmlsZURhdGEudGVtcGxhdGVPdmVycmlkZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBmaWxlRGF0YS5zb3VyY2VNYW5hZ2VyLmdldFRlbXBsYXRlSWQobm9kZSk7XG4gICAgaWYgKGZpbGVEYXRhLnRlbXBsYXRlT3ZlcnJpZGVzLmhhcyh0ZW1wbGF0ZUlkKSkge1xuICAgICAgcmV0dXJuIGZpbGVEYXRhLnRlbXBsYXRlT3ZlcnJpZGVzLmdldCh0ZW1wbGF0ZUlkKSE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZWNvcmRTaGltRGF0YShzZlBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBTaGltVHlwZUNoZWNraW5nRGF0YSk6IHZvaWQge1xuICAgIGNvbnN0IGZpbGVEYXRhID0gdGhpcy5pbXBsLmdldEZpbGVEYXRhKHNmUGF0aCk7XG4gICAgZmlsZURhdGEuc2hpbURhdGEuc2V0KGRhdGEucGF0aCwgZGF0YSk7XG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcykge1xuICAgICAgZmlsZURhdGEuaGFzSW5saW5lcyA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmVjb3JkQ29tcGxldGUoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQge1xuICAgIHRoaXMuaW1wbC5nZXRGaWxlRGF0YShzZlBhdGgpLmlzQ29tcGxldGUgPSB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogRHJpdmVzIGEgYFR5cGVDaGVja0NvbnRleHRgIHRvIGdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBlZmZpY2llbnRseSBmb3IgYSBzaW5nbGUgaW5wdXQgZmlsZS5cbiAqL1xuY2xhc3MgU2luZ2xlRmlsZVR5cGVDaGVja2luZ0hvc3QgaW1wbGVtZW50cyBUeXBlQ2hlY2tpbmdIb3N0IHtcbiAgcHJpdmF0ZSBzZWVuSW5saW5lcyA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIHNmUGF0aDogQWJzb2x1dGVGc1BhdGgsIHByb3RlY3RlZCBmaWxlRGF0YTogRmlsZVR5cGVDaGVja2luZ0RhdGEsXG4gICAgICBwcm90ZWN0ZWQgc3RyYXRlZ3k6IFR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneSwgcHJvdGVjdGVkIGltcGw6IFRlbXBsYXRlVHlwZUNoZWNrZXJJbXBsKSB7fVxuXG4gIHByaXZhdGUgYXNzZXJ0UGF0aChzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc2ZQYXRoICE9PSBzZlBhdGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IHF1ZXJ5aW5nIFR5cGVDaGVja2luZ0hvc3Qgb3V0c2lkZSBvZiBhc3NpZ25lZCBmaWxlYCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U291cmNlTWFuYWdlcihzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyIHtcbiAgICB0aGlzLmFzc2VydFBhdGgoc2ZQYXRoKTtcbiAgICByZXR1cm4gdGhpcy5maWxlRGF0YS5zb3VyY2VNYW5hZ2VyO1xuICB9XG5cbiAgc2hvdWxkQ2hlY2tDb21wb25lbnQobm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnNmUGF0aCAhPT0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShub2RlLmdldFNvdXJjZUZpbGUoKSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3Qgc2hpbVBhdGggPSB0aGlzLnN0cmF0ZWd5LnNoaW1QYXRoRm9yQ29tcG9uZW50KG5vZGUpO1xuXG4gICAgLy8gT25seSBuZWVkIHRvIGdlbmVyYXRlIGEgVENCIGZvciB0aGUgY2xhc3MgaWYgbm8gc2hpbSBleGlzdHMgZm9yIGl0IGN1cnJlbnRseS5cbiAgICByZXR1cm4gIXRoaXMuZmlsZURhdGEuc2hpbURhdGEuaGFzKHNoaW1QYXRoKTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlT3ZlcnJpZGUoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgbm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6IFRtcGxBc3ROb2RlW118bnVsbCB7XG4gICAgdGhpcy5hc3NlcnRQYXRoKHNmUGF0aCk7XG4gICAgaWYgKHRoaXMuZmlsZURhdGEudGVtcGxhdGVPdmVycmlkZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSB0aGlzLmZpbGVEYXRhLnNvdXJjZU1hbmFnZXIuZ2V0VGVtcGxhdGVJZChub2RlKTtcbiAgICBpZiAodGhpcy5maWxlRGF0YS50ZW1wbGF0ZU92ZXJyaWRlcy5oYXModGVtcGxhdGVJZCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbGVEYXRhLnRlbXBsYXRlT3ZlcnJpZGVzLmdldCh0ZW1wbGF0ZUlkKSE7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZWNvcmRTaGltRGF0YShzZlBhdGg6IEFic29sdXRlRnNQYXRoLCBkYXRhOiBTaGltVHlwZUNoZWNraW5nRGF0YSk6IHZvaWQge1xuICAgIHRoaXMuYXNzZXJ0UGF0aChzZlBhdGgpO1xuXG4gICAgLy8gUHJldmlvdXMgdHlwZS1jaGVja2luZyBzdGF0ZSBtYXkgaGF2ZSByZXF1aXJlZCB0aGUgdXNlIG9mIGlubGluZXMgKGFzc3VtaW5nIHRoZXkgd2VyZVxuICAgIC8vIHN1cHBvcnRlZCkuIElmIHRoZSBjdXJyZW50IG9wZXJhdGlvbiBhbHNvIHJlcXVpcmVzIGlubGluZXMsIHRoaXMgcHJlc2VudHMgYSBwcm9ibGVtOlxuICAgIC8vIGdlbmVyYXRpbmcgbmV3IGlubGluZXMgbWF5IGludmFsaWRhdGUgYW55IG9sZCBpbmxpbmVzIHRoYXQgb2xkIHN0YXRlIGRlcGVuZHMgb24uXG4gICAgLy9cbiAgICAvLyBSYXRoZXIgdGhhbiByZXNvbHZlIHRoaXMgaXNzdWUgYnkgdHJhY2tpbmcgc3BlY2lmaWMgZGVwZW5kZW5jaWVzIG9uIGlubGluZXMsIGlmIHRoZSBuZXcgc3RhdGVcbiAgICAvLyByZWxpZXMgb24gaW5saW5lcywgYW55IG9sZCBzdGF0ZSB0aGF0IHJlbGllZCBvbiB0aGVtIGlzIHNpbXBseSBjbGVhcmVkLiBUaGlzIGhhcHBlbnMgd2hlbiB0aGVcbiAgICAvLyBmaXJzdCBuZXcgc3RhdGUgdGhhdCB1c2VzIGlubGluZXMgaXMgZW5jb3VudGVyZWQuXG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcyAmJiAhdGhpcy5zZWVuSW5saW5lcykge1xuICAgICAgdGhpcy5pbXBsLmNsZWFyQWxsU2hpbURhdGFVc2luZ0lubGluZXMoKTtcbiAgICAgIHRoaXMuc2VlbklubGluZXMgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuZmlsZURhdGEuc2hpbURhdGEuc2V0KGRhdGEucGF0aCwgZGF0YSk7XG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcykge1xuICAgICAgdGhpcy5maWxlRGF0YS5oYXNJbmxpbmVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZWNvcmRDb21wbGV0ZShzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogdm9pZCB7XG4gICAgdGhpcy5hc3NlcnRQYXRoKHNmUGF0aCk7XG4gICAgdGhpcy5maWxlRGF0YS5pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIERyaXZlcyBhIGBUeXBlQ2hlY2tDb250ZXh0YCB0byBnZW5lcmF0ZSB0eXBlLWNoZWNraW5nIGNvZGUgZWZmaWNpZW50bHkgZm9yIG9ubHkgdGhvc2UgY29tcG9uZW50c1xuICogd2hpY2ggbWFwIHRvIGEgc2luZ2xlIHNoaW0gb2YgYSBzaW5nbGUgaW5wdXQgZmlsZS5cbiAqL1xuY2xhc3MgU2luZ2xlU2hpbVR5cGVDaGVja2luZ0hvc3QgZXh0ZW5kcyBTaW5nbGVGaWxlVHlwZUNoZWNraW5nSG9zdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZmlsZURhdGE6IEZpbGVUeXBlQ2hlY2tpbmdEYXRhLCBzdHJhdGVneTogVHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5LFxuICAgICAgaW1wbDogVGVtcGxhdGVUeXBlQ2hlY2tlckltcGwsIHByaXZhdGUgc2hpbVBhdGg6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgc3VwZXIoc2ZQYXRoLCBmaWxlRGF0YSwgc3RyYXRlZ3ksIGltcGwpO1xuICB9XG5cbiAgc2hvdWxkQ2hlY2tOb2RlKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5zZlBhdGggIT09IGFic29sdXRlRnJvbVNvdXJjZUZpbGUobm9kZS5nZXRTb3VyY2VGaWxlKCkpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gT25seSBnZW5lcmF0ZSBhIFRDQiBmb3IgdGhlIGNvbXBvbmVudCBpZiBpdCBtYXBzIHRvIHRoZSByZXF1ZXN0ZWQgc2hpbSBmaWxlLlxuICAgIGNvbnN0IHNoaW1QYXRoID0gdGhpcy5zdHJhdGVneS5zaGltUGF0aEZvckNvbXBvbmVudChub2RlKTtcbiAgICBpZiAoc2hpbVBhdGggIT09IHRoaXMuc2hpbVBhdGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gZ2VuZXJhdGUgYSBUQ0IgZm9yIHRoZSBjbGFzcyBpZiBubyBzaGltIGV4aXN0cyBmb3IgaXQgY3VycmVudGx5LlxuICAgIHJldHVybiAhdGhpcy5maWxlRGF0YS5zaGltRGF0YS5oYXMoc2hpbVBhdGgpO1xuICB9XG59XG5cbi8qKlxuICogQ2FjaGVkIHNjb3BlIGluZm9ybWF0aW9uIGZvciBhIGNvbXBvbmVudC5cbiAqL1xuaW50ZXJmYWNlIFNjb3BlRGF0YSB7XG4gIGRpcmVjdGl2ZXM6IERpcmVjdGl2ZUluU2NvcGVbXTtcbiAgcGlwZXM6IFBpcGVJblNjb3BlW107XG4gIGlzUG9pc29uZWQ6IGJvb2xlYW47XG59XG4iXX0=