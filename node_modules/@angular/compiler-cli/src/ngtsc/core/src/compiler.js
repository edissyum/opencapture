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
        define("@angular/compiler-cli/src/ngtsc/core/src/compiler", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/annotations", "@angular/compiler-cli/src/ngtsc/cycles", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/entry_point", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/incremental", "@angular/compiler-cli/src/ngtsc/indexer", "@angular/compiler-cli/src/ngtsc/metadata", "@angular/compiler-cli/src/ngtsc/modulewithproviders", "@angular/compiler-cli/src/ngtsc/partial_evaluator", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/perf/src/api", "@angular/compiler-cli/src/ngtsc/perf/src/recorder", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/ngtsc/resource", "@angular/compiler-cli/src/ngtsc/routing", "@angular/compiler-cli/src/ngtsc/scope", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/switch", "@angular/compiler-cli/src/ngtsc/transform", "@angular/compiler-cli/src/ngtsc/typecheck", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/core/src/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isAngularCorePackage = exports.NgCompiler = exports.resourceChangeTicket = exports.incrementalFromDriverTicket = exports.incrementalFromCompilerTicket = exports.freshCompilationTicket = exports.CompilationTicketKind = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var annotations_1 = require("@angular/compiler-cli/src/ngtsc/annotations");
    var cycles_1 = require("@angular/compiler-cli/src/ngtsc/cycles");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var entry_point_1 = require("@angular/compiler-cli/src/ngtsc/entry_point");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var incremental_1 = require("@angular/compiler-cli/src/ngtsc/incremental");
    var indexer_1 = require("@angular/compiler-cli/src/ngtsc/indexer");
    var metadata_1 = require("@angular/compiler-cli/src/ngtsc/metadata");
    var modulewithproviders_1 = require("@angular/compiler-cli/src/ngtsc/modulewithproviders");
    var partial_evaluator_1 = require("@angular/compiler-cli/src/ngtsc/partial_evaluator");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/api");
    var recorder_1 = require("@angular/compiler-cli/src/ngtsc/perf/src/recorder");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var resource_1 = require("@angular/compiler-cli/src/ngtsc/resource");
    var routing_1 = require("@angular/compiler-cli/src/ngtsc/routing");
    var scope_1 = require("@angular/compiler-cli/src/ngtsc/scope");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var switch_1 = require("@angular/compiler-cli/src/ngtsc/switch");
    var transform_1 = require("@angular/compiler-cli/src/ngtsc/transform");
    var typecheck_1 = require("@angular/compiler-cli/src/ngtsc/typecheck");
    var api_2 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var config_1 = require("@angular/compiler-cli/src/ngtsc/core/src/config");
    /**
     * Discriminant type for a `CompilationTicket`.
     */
    var CompilationTicketKind;
    (function (CompilationTicketKind) {
        CompilationTicketKind[CompilationTicketKind["Fresh"] = 0] = "Fresh";
        CompilationTicketKind[CompilationTicketKind["IncrementalTypeScript"] = 1] = "IncrementalTypeScript";
        CompilationTicketKind[CompilationTicketKind["IncrementalResource"] = 2] = "IncrementalResource";
    })(CompilationTicketKind = exports.CompilationTicketKind || (exports.CompilationTicketKind = {}));
    /**
     * Create a `CompilationTicket` for a brand new compilation, using no prior state.
     */
    function freshCompilationTicket(tsProgram, options, incrementalBuildStrategy, typeCheckingProgramStrategy, perfRecorder, enableTemplateTypeChecker, usePoisonedData) {
        return {
            kind: CompilationTicketKind.Fresh,
            tsProgram: tsProgram,
            options: options,
            incrementalBuildStrategy: incrementalBuildStrategy,
            typeCheckingProgramStrategy: typeCheckingProgramStrategy,
            enableTemplateTypeChecker: enableTemplateTypeChecker,
            usePoisonedData: usePoisonedData,
            perfRecorder: perfRecorder !== null && perfRecorder !== void 0 ? perfRecorder : perf_1.ActivePerfRecorder.zeroedToNow(),
        };
    }
    exports.freshCompilationTicket = freshCompilationTicket;
    /**
     * Create a `CompilationTicket` as efficiently as possible, based on a previous `NgCompiler`
     * instance and a new `ts.Program`.
     */
    function incrementalFromCompilerTicket(oldCompiler, newProgram, incrementalBuildStrategy, typeCheckingProgramStrategy, modifiedResourceFiles, perfRecorder) {
        var oldProgram = oldCompiler.getNextProgram();
        var oldDriver = oldCompiler.incrementalStrategy.getIncrementalDriver(oldProgram);
        if (oldDriver === null) {
            // No incremental step is possible here, since no IncrementalDriver was found for the old
            // program.
            return freshCompilationTicket(newProgram, oldCompiler.options, incrementalBuildStrategy, typeCheckingProgramStrategy, perfRecorder, oldCompiler.enableTemplateTypeChecker, oldCompiler.usePoisonedData);
        }
        if (perfRecorder === null) {
            perfRecorder = perf_1.ActivePerfRecorder.zeroedToNow();
        }
        var newDriver = incremental_1.IncrementalDriver.reconcile(oldProgram, oldDriver, newProgram, modifiedResourceFiles, perfRecorder);
        return {
            kind: CompilationTicketKind.IncrementalTypeScript,
            enableTemplateTypeChecker: oldCompiler.enableTemplateTypeChecker,
            usePoisonedData: oldCompiler.usePoisonedData,
            options: oldCompiler.options,
            incrementalBuildStrategy: incrementalBuildStrategy,
            typeCheckingProgramStrategy: typeCheckingProgramStrategy,
            newDriver: newDriver,
            oldProgram: oldProgram,
            newProgram: newProgram,
            perfRecorder: perfRecorder,
        };
    }
    exports.incrementalFromCompilerTicket = incrementalFromCompilerTicket;
    /**
     * Create a `CompilationTicket` directly from an old `ts.Program` and associated Angular compilation
     * state, along with a new `ts.Program`.
     */
    function incrementalFromDriverTicket(oldProgram, oldDriver, newProgram, options, incrementalBuildStrategy, typeCheckingProgramStrategy, modifiedResourceFiles, perfRecorder, enableTemplateTypeChecker, usePoisonedData) {
        if (perfRecorder === null) {
            perfRecorder = perf_1.ActivePerfRecorder.zeroedToNow();
        }
        var newDriver = incremental_1.IncrementalDriver.reconcile(oldProgram, oldDriver, newProgram, modifiedResourceFiles, perfRecorder);
        return {
            kind: CompilationTicketKind.IncrementalTypeScript,
            oldProgram: oldProgram,
            newProgram: newProgram,
            options: options,
            incrementalBuildStrategy: incrementalBuildStrategy,
            newDriver: newDriver,
            typeCheckingProgramStrategy: typeCheckingProgramStrategy,
            enableTemplateTypeChecker: enableTemplateTypeChecker,
            usePoisonedData: usePoisonedData,
            perfRecorder: perfRecorder,
        };
    }
    exports.incrementalFromDriverTicket = incrementalFromDriverTicket;
    function resourceChangeTicket(compiler, modifiedResourceFiles) {
        return {
            kind: CompilationTicketKind.IncrementalResource,
            compiler: compiler,
            modifiedResourceFiles: modifiedResourceFiles,
            perfRecorder: perf_1.ActivePerfRecorder.zeroedToNow(),
        };
    }
    exports.resourceChangeTicket = resourceChangeTicket;
    /**
     * The heart of the Angular Ivy compiler.
     *
     * The `NgCompiler` provides an API for performing Angular compilation within a custom TypeScript
     * compiler. Each instance of `NgCompiler` supports a single compilation, which might be
     * incremental.
     *
     * `NgCompiler` is lazy, and does not perform any of the work of the compilation until one of its
     * output methods (e.g. `getDiagnostics`) is called.
     *
     * See the README.md for more information.
     */
    var NgCompiler = /** @class */ (function () {
        function NgCompiler(adapter, options, tsProgram, typeCheckingProgramStrategy, incrementalStrategy, incrementalDriver, enableTemplateTypeChecker, usePoisonedData, livePerfRecorder) {
            var _a, e_1, _b;
            var _this = this;
            this.adapter = adapter;
            this.options = options;
            this.tsProgram = tsProgram;
            this.typeCheckingProgramStrategy = typeCheckingProgramStrategy;
            this.incrementalStrategy = incrementalStrategy;
            this.incrementalDriver = incrementalDriver;
            this.enableTemplateTypeChecker = enableTemplateTypeChecker;
            this.usePoisonedData = usePoisonedData;
            this.livePerfRecorder = livePerfRecorder;
            /**
             * Lazily evaluated state of the compilation.
             *
             * This is created on demand by calling `ensureAnalyzed`.
             */
            this.compilation = null;
            /**
             * Any diagnostics related to the construction of the compilation.
             *
             * These are diagnostics which arose during setup of the host and/or program.
             */
            this.constructionDiagnostics = [];
            /**
             * Non-template diagnostics related to the program itself. Does not include template
             * diagnostics because the template type checker memoizes them itself.
             *
             * This is set by (and memoizes) `getNonTemplateDiagnostics`.
             */
            this.nonTemplateDiagnostics = null;
            /**
             * `NgCompiler` can be reused for multiple compilations (for resource-only changes), and each
             * new compilation uses a fresh `PerfRecorder`. Thus, classes created with a lifespan of the
             * `NgCompiler` use a `DelegatingPerfRecorder` so the `PerfRecorder` they write to can be updated
             * with each fresh compilation.
             */
            this.delegatingPerfRecorder = new recorder_1.DelegatingPerfRecorder(this.perfRecorder);
            (_a = this.constructionDiagnostics).push.apply(_a, tslib_1.__spread(this.adapter.constructionDiagnostics));
            var incompatibleTypeCheckOptionsDiagnostic = verifyCompatibleTypeCheckOptions(this.options);
            if (incompatibleTypeCheckOptionsDiagnostic !== null) {
                this.constructionDiagnostics.push(incompatibleTypeCheckOptionsDiagnostic);
            }
            this.nextProgram = tsProgram;
            this.closureCompilerEnabled = !!this.options.annotateForClosureCompiler;
            this.entryPoint =
                adapter.entryPoint !== null ? typescript_1.getSourceFileOrNull(tsProgram, adapter.entryPoint) : null;
            var moduleResolutionCache = ts.createModuleResolutionCache(this.adapter.getCurrentDirectory(), 
            // doen't retain a reference to `this`, if other closures in the constructor here reference
            // `this` internally then a closure created here would retain them. This can cause major
            // memory leak issues since the `moduleResolutionCache` is a long-lived object and finds its
            // way into all kinds of places inside TS internal objects.
            this.adapter.getCanonicalFileName.bind(this.adapter));
            this.moduleResolver =
                new imports_1.ModuleResolver(tsProgram, this.options, this.adapter, moduleResolutionCache);
            this.resourceManager = new resource_1.AdapterResourceLoader(adapter, this.options);
            this.cycleAnalyzer =
                new cycles_1.CycleAnalyzer(new cycles_1.ImportGraph(tsProgram.getTypeChecker(), this.delegatingPerfRecorder));
            this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, tsProgram);
            this.ignoreForDiagnostics =
                new Set(tsProgram.getSourceFiles().filter(function (sf) { return _this.adapter.isShim(sf); }));
            this.ignoreForEmit = this.adapter.ignoreForEmit;
            var dtsFileCount = 0;
            var nonDtsFileCount = 0;
            try {
                for (var _c = tslib_1.__values(tsProgram.getSourceFiles()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var sf = _d.value;
                    if (sf.isDeclarationFile) {
                        dtsFileCount++;
                    }
                    else {
                        nonDtsFileCount++;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            livePerfRecorder.eventCount(api_1.PerfEvent.InputDtsFile, dtsFileCount);
            livePerfRecorder.eventCount(api_1.PerfEvent.InputTsFile, nonDtsFileCount);
        }
        /**
         * Convert a `CompilationTicket` into an `NgCompiler` instance for the requested compilation.
         *
         * Depending on the nature of the compilation request, the `NgCompiler` instance may be reused
         * from a previous compilation and updated with any changes, it may be a new instance which
         * incrementally reuses state from a previous compilation, or it may represent a fresh
         * compilation entirely.
         */
        NgCompiler.fromTicket = function (ticket, adapter) {
            switch (ticket.kind) {
                case CompilationTicketKind.Fresh:
                    return new NgCompiler(adapter, ticket.options, ticket.tsProgram, ticket.typeCheckingProgramStrategy, ticket.incrementalBuildStrategy, incremental_1.IncrementalDriver.fresh(ticket.tsProgram), ticket.enableTemplateTypeChecker, ticket.usePoisonedData, ticket.perfRecorder);
                case CompilationTicketKind.IncrementalTypeScript:
                    return new NgCompiler(adapter, ticket.options, ticket.newProgram, ticket.typeCheckingProgramStrategy, ticket.incrementalBuildStrategy, ticket.newDriver, ticket.enableTemplateTypeChecker, ticket.usePoisonedData, ticket.perfRecorder);
                case CompilationTicketKind.IncrementalResource:
                    var compiler = ticket.compiler;
                    compiler.updateWithChangedResources(ticket.modifiedResourceFiles, ticket.perfRecorder);
                    return compiler;
            }
        };
        Object.defineProperty(NgCompiler.prototype, "perfRecorder", {
            get: function () {
                return this.livePerfRecorder;
            },
            enumerable: false,
            configurable: true
        });
        NgCompiler.prototype.updateWithChangedResources = function (changedResources, perfRecorder) {
            var _this = this;
            this.livePerfRecorder = perfRecorder;
            this.delegatingPerfRecorder.target = perfRecorder;
            perfRecorder.inPhase(api_1.PerfPhase.ResourceUpdate, function () {
                var e_2, _a, e_3, _b, e_4, _c, e_5, _d;
                if (_this.compilation === null) {
                    // Analysis hasn't happened yet, so no update is necessary - any changes to resources will
                    // be captured by the inital analysis pass itself.
                    return;
                }
                _this.resourceManager.invalidate();
                var classesToUpdate = new Set();
                try {
                    for (var changedResources_1 = tslib_1.__values(changedResources), changedResources_1_1 = changedResources_1.next(); !changedResources_1_1.done; changedResources_1_1 = changedResources_1.next()) {
                        var resourceFile = changedResources_1_1.value;
                        try {
                            for (var _e = (e_3 = void 0, tslib_1.__values(_this.getComponentsWithTemplateFile(resourceFile))), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var templateClass = _f.value;
                                classesToUpdate.add(templateClass);
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        try {
                            for (var _g = (e_4 = void 0, tslib_1.__values(_this.getComponentsWithStyleFile(resourceFile))), _h = _g.next(); !_h.done; _h = _g.next()) {
                                var styleClass = _h.value;
                                classesToUpdate.add(styleClass);
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_h && !_h.done && (_c = _g.return)) _c.call(_g);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (changedResources_1_1 && !changedResources_1_1.done && (_a = changedResources_1.return)) _a.call(changedResources_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                try {
                    for (var classesToUpdate_1 = tslib_1.__values(classesToUpdate), classesToUpdate_1_1 = classesToUpdate_1.next(); !classesToUpdate_1_1.done; classesToUpdate_1_1 = classesToUpdate_1.next()) {
                        var clazz = classesToUpdate_1_1.value;
                        _this.compilation.traitCompiler.updateResources(clazz);
                        if (!ts.isClassDeclaration(clazz)) {
                            continue;
                        }
                        _this.compilation.templateTypeChecker.invalidateClass(clazz);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (classesToUpdate_1_1 && !classesToUpdate_1_1.done && (_d = classesToUpdate_1.return)) _d.call(classesToUpdate_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
            });
        };
        /**
         * Get the resource dependencies of a file.
         *
         * If the file is not part of the compilation, an empty array will be returned.
         */
        NgCompiler.prototype.getResourceDependencies = function (file) {
            this.ensureAnalyzed();
            return this.incrementalDriver.depGraph.getResourceDependencies(file);
        };
        /**
         * Get all Angular-related diagnostics for this compilation.
         */
        NgCompiler.prototype.getDiagnostics = function () {
            return this.addMessageTextDetails(tslib_1.__spread(this.getNonTemplateDiagnostics(), this.getTemplateDiagnostics()));
        };
        /**
         * Get all Angular-related diagnostics for this compilation.
         *
         * If a `ts.SourceFile` is passed, only diagnostics related to that file are returned.
         */
        NgCompiler.prototype.getDiagnosticsForFile = function (file, optimizeFor) {
            return this.addMessageTextDetails(tslib_1.__spread(this.getNonTemplateDiagnostics().filter(function (diag) { return diag.file === file; }), this.getTemplateDiagnosticsForFile(file, optimizeFor)));
        };
        /**
         * Add Angular.io error guide links to diagnostics for this compilation.
         */
        NgCompiler.prototype.addMessageTextDetails = function (diagnostics) {
            return diagnostics.map(function (diag) {
                if (diag.code && diagnostics_1.COMPILER_ERRORS_WITH_GUIDES.has(diagnostics_1.ngErrorCode(diag.code))) {
                    return tslib_1.__assign(tslib_1.__assign({}, diag), { messageText: diag.messageText +
                            (". Find more at " + diagnostics_1.ERROR_DETAILS_PAGE_BASE_URL + "/NG" + diagnostics_1.ngErrorCode(diag.code)) });
                }
                return diag;
            });
        };
        /**
         * Get all setup-related diagnostics for this compilation.
         */
        NgCompiler.prototype.getOptionDiagnostics = function () {
            return this.constructionDiagnostics;
        };
        /**
         * Get the `ts.Program` to use as a starting point when spawning a subsequent incremental
         * compilation.
         *
         * The `NgCompiler` spawns an internal incremental TypeScript compilation (inheriting the
         * consumer's `ts.Program` into a new one for the purposes of template type-checking). After this
         * operation, the consumer's `ts.Program` is no longer usable for starting a new incremental
         * compilation. `getNextProgram` retrieves the `ts.Program` which can be used instead.
         */
        NgCompiler.prototype.getNextProgram = function () {
            return this.nextProgram;
        };
        NgCompiler.prototype.getTemplateTypeChecker = function () {
            if (!this.enableTemplateTypeChecker) {
                throw new Error('The `TemplateTypeChecker` does not work without `enableTemplateTypeChecker`.');
            }
            return this.ensureAnalyzed().templateTypeChecker;
        };
        /**
         * Retrieves the `ts.Declaration`s for any component(s) which use the given template file.
         */
        NgCompiler.prototype.getComponentsWithTemplateFile = function (templateFilePath) {
            var resourceRegistry = this.ensureAnalyzed().resourceRegistry;
            return resourceRegistry.getComponentsWithTemplate(file_system_1.resolve(templateFilePath));
        };
        /**
         * Retrieves the `ts.Declaration`s for any component(s) which use the given template file.
         */
        NgCompiler.prototype.getComponentsWithStyleFile = function (styleFilePath) {
            var resourceRegistry = this.ensureAnalyzed().resourceRegistry;
            return resourceRegistry.getComponentsWithStyle(file_system_1.resolve(styleFilePath));
        };
        /**
         * Retrieves external resources for the given component.
         */
        NgCompiler.prototype.getComponentResources = function (classDecl) {
            if (!reflection_1.isNamedClassDeclaration(classDecl)) {
                return null;
            }
            var resourceRegistry = this.ensureAnalyzed().resourceRegistry;
            var styles = resourceRegistry.getStyles(classDecl);
            var template = resourceRegistry.getTemplate(classDecl);
            if (template === null) {
                return null;
            }
            return { styles: styles, template: template };
        };
        /**
         * Perform Angular's analysis step (as a precursor to `getDiagnostics` or `prepareEmit`)
         * asynchronously.
         *
         * Normally, this operation happens lazily whenever `getDiagnostics` or `prepareEmit` are called.
         * However, certain consumers may wish to allow for an asynchronous phase of analysis, where
         * resources such as `styleUrls` are resolved asynchonously. In these cases `analyzeAsync` must be
         * called first, and its `Promise` awaited prior to calling any other APIs of `NgCompiler`.
         */
        NgCompiler.prototype.analyzeAsync = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.compilation !== null) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.perfRecorder.inPhase(api_1.PerfPhase.Analysis, function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                    var promises, _a, _b, sf, analysisPromise;
                                    var e_6, _c;
                                    return tslib_1.__generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0:
                                                this.compilation = this.makeCompilation();
                                                promises = [];
                                                try {
                                                    for (_a = tslib_1.__values(this.tsProgram.getSourceFiles()), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                        sf = _b.value;
                                                        if (sf.isDeclarationFile) {
                                                            continue;
                                                        }
                                                        analysisPromise = this.compilation.traitCompiler.analyzeAsync(sf);
                                                        this.scanForMwp(sf);
                                                        if (analysisPromise !== undefined) {
                                                            promises.push(analysisPromise);
                                                        }
                                                    }
                                                }
                                                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                                                finally {
                                                    try {
                                                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                                    }
                                                    finally { if (e_6) throw e_6.error; }
                                                }
                                                return [4 /*yield*/, Promise.all(promises)];
                                            case 1:
                                                _d.sent();
                                                this.perfRecorder.memory(api_1.PerfCheckpoint.Analysis);
                                                this.resolveCompilation(this.compilation.traitCompiler);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * List lazy routes detected during analysis.
         *
         * This can be called for one specific route, or to retrieve all top-level routes.
         */
        NgCompiler.prototype.listLazyRoutes = function (entryRoute) {
            if (entryRoute) {
                // htts://github.com/angular/angular/blob/50732e156/packages/compiler-cli/src/transformers/compiler_host.ts#L175-L188).
                //
                // `@angular/cli` will always call this API with an absolute path, so the resolution step is
                // not necessary, but keeping it backwards compatible in case someone else is using the API.
                // Relative entry paths are disallowed.
                if (entryRoute.startsWith('.')) {
                    throw new Error("Failed to list lazy routes: Resolution of relative paths (" + entryRoute + ") is not supported.");
                }
                // Non-relative entry paths fall into one of the following categories:
                // - Absolute system paths (e.g. `/foo/bar/my-project/my-module`), which are unaffected by the
                //   logic below.
                // - Paths to enternal modules (e.g. `some-lib`).
                // - Paths mapped to directories in `tsconfig.json` (e.g. `shared/my-module`).
                //   (See https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping.)
                //
                // In all cases above, the `containingFile` argument is ignored, so we can just take the first
                // of the root files.
                var containingFile = this.tsProgram.getRootFileNames()[0];
                var _a = tslib_1.__read(entryRoute.split('#'), 2), entryPath = _a[0], moduleName = _a[1];
                var resolvedModule = typescript_1.resolveModuleName(entryPath, containingFile, this.options, this.adapter, null);
                if (resolvedModule) {
                    entryRoute = routing_1.entryPointKeyFor(resolvedModule.resolvedFileName, moduleName);
                }
            }
            var compilation = this.ensureAnalyzed();
            return compilation.routeAnalyzer.listLazyRoutes(entryRoute);
        };
        /**
         * Fetch transformers and other information which is necessary for a consumer to `emit` the
         * program with Angular-added definitions.
         */
        NgCompiler.prototype.prepareEmit = function () {
            var compilation = this.ensureAnalyzed();
            var coreImportsFrom = compilation.isCore ? getR3SymbolsFile(this.tsProgram) : null;
            var importRewriter;
            if (coreImportsFrom !== null) {
                importRewriter = new imports_1.R3SymbolsImportRewriter(coreImportsFrom.fileName);
            }
            else {
                importRewriter = new imports_1.NoopImportRewriter();
            }
            var defaultImportTracker = new imports_1.DefaultImportTracker();
            var before = [
                transform_1.ivyTransformFactory(compilation.traitCompiler, compilation.reflector, importRewriter, defaultImportTracker, this.delegatingPerfRecorder, compilation.isCore, this.closureCompilerEnabled),
                transform_1.aliasTransformFactory(compilation.traitCompiler.exportStatements),
                defaultImportTracker.importPreservingTransformer(),
            ];
            var afterDeclarations = [];
            if (compilation.dtsTransforms !== null) {
                afterDeclarations.push(transform_1.declarationTransformFactory(compilation.dtsTransforms, importRewriter));
            }
            // Only add aliasing re-exports to the .d.ts output if the `AliasingHost` requests it.
            if (compilation.aliasingHost !== null && compilation.aliasingHost.aliasExportsInDts) {
                afterDeclarations.push(transform_1.aliasTransformFactory(compilation.traitCompiler.exportStatements));
            }
            if (this.adapter.factoryTracker !== null) {
                before.push(shims_1.generatedFactoryTransform(this.adapter.factoryTracker.sourceInfo, importRewriter));
            }
            before.push(switch_1.ivySwitchTransform);
            return { transformers: { before: before, afterDeclarations: afterDeclarations } };
        };
        /**
         * Run the indexing process and return a `Map` of all indexed components.
         *
         * See the `indexing` package for more details.
         */
        NgCompiler.prototype.getIndexedComponents = function () {
            var compilation = this.ensureAnalyzed();
            var context = new indexer_1.IndexingContext();
            compilation.traitCompiler.index(context);
            return indexer_1.generateAnalysis(context);
        };
        NgCompiler.prototype.ensureAnalyzed = function () {
            if (this.compilation === null) {
                this.analyzeSync();
            }
            return this.compilation;
        };
        NgCompiler.prototype.analyzeSync = function () {
            var _this = this;
            this.perfRecorder.inPhase(api_1.PerfPhase.Analysis, function () {
                var e_7, _a;
                _this.compilation = _this.makeCompilation();
                try {
                    for (var _b = tslib_1.__values(_this.tsProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var sf = _c.value;
                        if (sf.isDeclarationFile) {
                            continue;
                        }
                        _this.compilation.traitCompiler.analyzeSync(sf);
                        _this.scanForMwp(sf);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                _this.perfRecorder.memory(api_1.PerfCheckpoint.Analysis);
                _this.resolveCompilation(_this.compilation.traitCompiler);
            });
        };
        NgCompiler.prototype.resolveCompilation = function (traitCompiler) {
            var _this = this;
            this.perfRecorder.inPhase(api_1.PerfPhase.Resolve, function () {
                traitCompiler.resolve();
                // At this point, analysis is complete and the compiler can now calculate which files need to
                // be emitted, so do that.
                _this.incrementalDriver.recordSuccessfulAnalysis(traitCompiler);
                _this.perfRecorder.memory(api_1.PerfCheckpoint.Resolve);
            });
        };
        Object.defineProperty(NgCompiler.prototype, "fullTemplateTypeCheck", {
            get: function () {
                // Determine the strictness level of type checking based on compiler options. As
                // `strictTemplates` is a superset of `fullTemplateTypeCheck`, the former implies the latter.
                // Also see `verifyCompatibleTypeCheckOptions` where it is verified that `fullTemplateTypeCheck`
                // is not disabled when `strictTemplates` is enabled.
                var strictTemplates = !!this.options.strictTemplates;
                return strictTemplates || !!this.options.fullTemplateTypeCheck;
            },
            enumerable: false,
            configurable: true
        });
        NgCompiler.prototype.getTypeCheckingConfig = function () {
            // Determine the strictness level of type checking based on compiler options. As
            // `strictTemplates` is a superset of `fullTemplateTypeCheck`, the former implies the latter.
            // Also see `verifyCompatibleTypeCheckOptions` where it is verified that `fullTemplateTypeCheck`
            // is not disabled when `strictTemplates` is enabled.
            var strictTemplates = !!this.options.strictTemplates;
            var useInlineTypeConstructors = this.typeCheckingProgramStrategy.supportsInlineOperations;
            // First select a type-checking configuration, based on whether full template type-checking is
            // requested.
            var typeCheckingConfig;
            if (this.fullTemplateTypeCheck) {
                typeCheckingConfig = {
                    applyTemplateContextGuards: strictTemplates,
                    checkQueries: false,
                    checkTemplateBodies: true,
                    alwaysCheckSchemaInTemplateBodies: true,
                    checkTypeOfInputBindings: strictTemplates,
                    honorAccessModifiersForInputBindings: false,
                    strictNullInputBindings: strictTemplates,
                    checkTypeOfAttributes: strictTemplates,
                    // Even in full template type-checking mode, DOM binding checks are not quite ready yet.
                    checkTypeOfDomBindings: false,
                    checkTypeOfOutputEvents: strictTemplates,
                    checkTypeOfAnimationEvents: strictTemplates,
                    // Checking of DOM events currently has an adverse effect on developer experience,
                    // e.g. for `<input (blur)="update($event.target.value)">` enabling this check results in:
                    // - error TS2531: Object is possibly 'null'.
                    // - error TS2339: Property 'value' does not exist on type 'EventTarget'.
                    checkTypeOfDomEvents: strictTemplates,
                    checkTypeOfDomReferences: strictTemplates,
                    // Non-DOM references have the correct type in View Engine so there is no strictness flag.
                    checkTypeOfNonDomReferences: true,
                    // Pipes are checked in View Engine so there is no strictness flag.
                    checkTypeOfPipes: true,
                    strictSafeNavigationTypes: strictTemplates,
                    useContextGenericType: strictTemplates,
                    strictLiteralTypes: true,
                    enableTemplateTypeChecker: this.enableTemplateTypeChecker,
                    useInlineTypeConstructors: useInlineTypeConstructors,
                    // Warnings for suboptimal type inference are only enabled if in Language Service mode
                    // (providing the full TemplateTypeChecker API) and if strict mode is not enabled. In strict
                    // mode, the user is in full control of type inference.
                    suggestionsForSuboptimalTypeInference: this.enableTemplateTypeChecker && !strictTemplates,
                };
            }
            else {
                typeCheckingConfig = {
                    applyTemplateContextGuards: false,
                    checkQueries: false,
                    checkTemplateBodies: false,
                    // Enable deep schema checking in "basic" template type-checking mode only if Closure
                    // compilation is requested, which is a good proxy for "only in google3".
                    alwaysCheckSchemaInTemplateBodies: this.closureCompilerEnabled,
                    checkTypeOfInputBindings: false,
                    strictNullInputBindings: false,
                    honorAccessModifiersForInputBindings: false,
                    checkTypeOfAttributes: false,
                    checkTypeOfDomBindings: false,
                    checkTypeOfOutputEvents: false,
                    checkTypeOfAnimationEvents: false,
                    checkTypeOfDomEvents: false,
                    checkTypeOfDomReferences: false,
                    checkTypeOfNonDomReferences: false,
                    checkTypeOfPipes: false,
                    strictSafeNavigationTypes: false,
                    useContextGenericType: false,
                    strictLiteralTypes: false,
                    enableTemplateTypeChecker: this.enableTemplateTypeChecker,
                    useInlineTypeConstructors: useInlineTypeConstructors,
                    // In "basic" template type-checking mode, no warnings are produced since most things are
                    // not checked anyways.
                    suggestionsForSuboptimalTypeInference: false,
                };
            }
            // Apply explicitly configured strictness flags on top of the default configuration
            // based on "fullTemplateTypeCheck".
            if (this.options.strictInputTypes !== undefined) {
                typeCheckingConfig.checkTypeOfInputBindings = this.options.strictInputTypes;
                typeCheckingConfig.applyTemplateContextGuards = this.options.strictInputTypes;
            }
            if (this.options.strictInputAccessModifiers !== undefined) {
                typeCheckingConfig.honorAccessModifiersForInputBindings =
                    this.options.strictInputAccessModifiers;
            }
            if (this.options.strictNullInputTypes !== undefined) {
                typeCheckingConfig.strictNullInputBindings = this.options.strictNullInputTypes;
            }
            if (this.options.strictOutputEventTypes !== undefined) {
                typeCheckingConfig.checkTypeOfOutputEvents = this.options.strictOutputEventTypes;
                typeCheckingConfig.checkTypeOfAnimationEvents = this.options.strictOutputEventTypes;
            }
            if (this.options.strictDomEventTypes !== undefined) {
                typeCheckingConfig.checkTypeOfDomEvents = this.options.strictDomEventTypes;
            }
            if (this.options.strictSafeNavigationTypes !== undefined) {
                typeCheckingConfig.strictSafeNavigationTypes = this.options.strictSafeNavigationTypes;
            }
            if (this.options.strictDomLocalRefTypes !== undefined) {
                typeCheckingConfig.checkTypeOfDomReferences = this.options.strictDomLocalRefTypes;
            }
            if (this.options.strictAttributeTypes !== undefined) {
                typeCheckingConfig.checkTypeOfAttributes = this.options.strictAttributeTypes;
            }
            if (this.options.strictContextGenerics !== undefined) {
                typeCheckingConfig.useContextGenericType = this.options.strictContextGenerics;
            }
            if (this.options.strictLiteralTypes !== undefined) {
                typeCheckingConfig.strictLiteralTypes = this.options.strictLiteralTypes;
            }
            return typeCheckingConfig;
        };
        NgCompiler.prototype.getTemplateDiagnostics = function () {
            var e_8, _a;
            var compilation = this.ensureAnalyzed();
            // Get the diagnostics.
            var diagnostics = [];
            try {
                for (var _b = tslib_1.__values(this.tsProgram.getSourceFiles()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sf = _c.value;
                    if (sf.isDeclarationFile || this.adapter.isShim(sf)) {
                        continue;
                    }
                    diagnostics.push.apply(diagnostics, tslib_1.__spread(compilation.templateTypeChecker.getDiagnosticsForFile(sf, api_2.OptimizeFor.WholeProgram)));
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            var program = this.typeCheckingProgramStrategy.getProgram();
            this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, program);
            this.nextProgram = program;
            return diagnostics;
        };
        NgCompiler.prototype.getTemplateDiagnosticsForFile = function (sf, optimizeFor) {
            var compilation = this.ensureAnalyzed();
            // Get the diagnostics.
            var diagnostics = [];
            if (!sf.isDeclarationFile && !this.adapter.isShim(sf)) {
                diagnostics.push.apply(diagnostics, tslib_1.__spread(compilation.templateTypeChecker.getDiagnosticsForFile(sf, optimizeFor)));
            }
            var program = this.typeCheckingProgramStrategy.getProgram();
            this.incrementalStrategy.setIncrementalDriver(this.incrementalDriver, program);
            this.nextProgram = program;
            return diagnostics;
        };
        NgCompiler.prototype.getNonTemplateDiagnostics = function () {
            var _a;
            if (this.nonTemplateDiagnostics === null) {
                var compilation = this.ensureAnalyzed();
                this.nonTemplateDiagnostics = tslib_1.__spread(compilation.traitCompiler.diagnostics);
                if (this.entryPoint !== null && compilation.exportReferenceGraph !== null) {
                    (_a = this.nonTemplateDiagnostics).push.apply(_a, tslib_1.__spread(entry_point_1.checkForPrivateExports(this.entryPoint, this.tsProgram.getTypeChecker(), compilation.exportReferenceGraph)));
                }
            }
            return this.nonTemplateDiagnostics;
        };
        NgCompiler.prototype.scanForMwp = function (sf) {
            var _this = this;
            this.compilation.mwpScanner.scan(sf, {
                addTypeReplacement: function (node, type) {
                    // Only obtain the return type transform for the source file once there's a type to replace,
                    // so that no transform is allocated when there's nothing to do.
                    _this.compilation.dtsTransforms.getReturnTypeTransform(sf).addTypeReplacement(node, type);
                }
            });
        };
        NgCompiler.prototype.makeCompilation = function () {
            var checker = this.tsProgram.getTypeChecker();
            var reflector = new reflection_1.TypeScriptReflectionHost(checker);
            // Construct the ReferenceEmitter.
            var refEmitter;
            var aliasingHost = null;
            if (this.adapter.unifiedModulesHost === null || !this.options._useHostForImportGeneration) {
                var localImportStrategy = void 0;
                // The strategy used for local, in-project imports depends on whether TS has been configured
                // with rootDirs. If so, then multiple directories may be mapped in the same "module
                // namespace" and the logic of `LogicalProjectStrategy` is required to generate correct
                // imports which may cross these multiple directories. Otherwise, plain relative imports are
                // sufficient.
                if (this.options.rootDir !== undefined ||
                    (this.options.rootDirs !== undefined && this.options.rootDirs.length > 0)) {
                    // rootDirs logic is in effect - use the `LogicalProjectStrategy` for in-project relative
                    // imports.
                    localImportStrategy = new imports_1.LogicalProjectStrategy(reflector, new file_system_1.LogicalFileSystem(tslib_1.__spread(this.adapter.rootDirs), this.adapter));
                }
                else {
                    // Plain relative imports are all that's needed.
                    localImportStrategy = new imports_1.RelativePathStrategy(reflector);
                }
                // The CompilerHost doesn't have fileNameToModuleName, so build an NPM-centric reference
                // resolution strategy.
                refEmitter = new imports_1.ReferenceEmitter([
                    // First, try to use local identifiers if available.
                    new imports_1.LocalIdentifierStrategy(),
                    // Next, attempt to use an absolute import.
                    new imports_1.AbsoluteModuleStrategy(this.tsProgram, checker, this.moduleResolver, reflector),
                    // Finally, check if the reference is being written into a file within the project's .ts
                    // sources, and use a relative import if so. If this fails, ReferenceEmitter will throw
                    // an error.
                    localImportStrategy,
                ]);
                // If an entrypoint is present, then all user imports should be directed through the
                // entrypoint and private exports are not needed. The compiler will validate that all publicly
                // visible directives/pipes are importable via this entrypoint.
                if (this.entryPoint === null && this.options.generateDeepReexports === true) {
                    // No entrypoint is present and deep re-exports were requested, so configure the aliasing
                    // system to generate them.
                    aliasingHost = new imports_1.PrivateExportAliasingHost(reflector);
                }
            }
            else {
                // The CompilerHost supports fileNameToModuleName, so use that to emit imports.
                refEmitter = new imports_1.ReferenceEmitter([
                    // First, try to use local identifiers if available.
                    new imports_1.LocalIdentifierStrategy(),
                    // Then use aliased references (this is a workaround to StrictDeps checks).
                    new imports_1.AliasStrategy(),
                    // Then use fileNameToModuleName to emit imports.
                    new imports_1.UnifiedModulesStrategy(reflector, this.adapter.unifiedModulesHost),
                ]);
                aliasingHost = new imports_1.UnifiedModulesAliasingHost(this.adapter.unifiedModulesHost);
            }
            var evaluator = new partial_evaluator_1.PartialEvaluator(reflector, checker, this.incrementalDriver.depGraph);
            var dtsReader = new metadata_1.DtsMetadataReader(checker, reflector);
            var localMetaRegistry = new metadata_1.LocalMetadataRegistry();
            var localMetaReader = localMetaRegistry;
            var depScopeReader = new scope_1.MetadataDtsModuleScopeResolver(dtsReader, aliasingHost);
            var scopeRegistry = new scope_1.LocalModuleScopeRegistry(localMetaReader, depScopeReader, refEmitter, aliasingHost);
            var scopeReader = scopeRegistry;
            var semanticDepGraphUpdater = this.incrementalDriver.getSemanticDepGraphUpdater();
            var metaRegistry = new metadata_1.CompoundMetadataRegistry([localMetaRegistry, scopeRegistry]);
            var injectableRegistry = new metadata_1.InjectableClassRegistry(reflector);
            var metaReader = new metadata_1.CompoundMetadataReader([localMetaReader, dtsReader]);
            var typeCheckScopeRegistry = new scope_1.TypeCheckScopeRegistry(scopeReader, metaReader);
            // If a flat module entrypoint was specified, then track references via a `ReferenceGraph` in
            // order to produce proper diagnostics for incorrectly exported directives/pipes/etc. If there
            // is no flat module entrypoint then don't pay the cost of tracking references.
            var referencesRegistry;
            var exportReferenceGraph = null;
            if (this.entryPoint !== null) {
                exportReferenceGraph = new entry_point_1.ReferenceGraph();
                referencesRegistry = new ReferenceGraphAdapter(exportReferenceGraph);
            }
            else {
                referencesRegistry = new annotations_1.NoopReferencesRegistry();
            }
            var routeAnalyzer = new routing_1.NgModuleRouteAnalyzer(this.moduleResolver, evaluator);
            var dtsTransforms = new transform_1.DtsTransformRegistry();
            var mwpScanner = new modulewithproviders_1.ModuleWithProvidersScanner(reflector, evaluator, refEmitter);
            var isCore = isAngularCorePackage(this.tsProgram);
            var resourceRegistry = new metadata_1.ResourceRegistry();
            var compilationMode = this.options.compilationMode === 'partial' ? transform_1.CompilationMode.PARTIAL : transform_1.CompilationMode.FULL;
            // Cycles are handled in full compilation mode by "remote scoping".
            // "Remote scoping" does not work well with tree shaking for libraries.
            // So in partial compilation mode, when building a library, a cycle will cause an error.
            var cycleHandlingStrategy = compilationMode === transform_1.CompilationMode.FULL ?
                0 /* UseRemoteScoping */ :
                1 /* Error */;
            // Set up the IvyCompilation, which manages state for the Ivy transformer.
            var handlers = [
                new annotations_1.ComponentDecoratorHandler(reflector, evaluator, metaRegistry, metaReader, scopeReader, scopeRegistry, typeCheckScopeRegistry, resourceRegistry, isCore, this.resourceManager, this.adapter.rootDirs, this.options.preserveWhitespaces || false, this.options.i18nUseExternalIds !== false, this.options.enableI18nLegacyMessageIdFormat !== false, this.usePoisonedData, this.options.i18nNormalizeLineEndingsInICUs, this.moduleResolver, this.cycleAnalyzer, cycleHandlingStrategy, refEmitter, this.incrementalDriver.depGraph, injectableRegistry, semanticDepGraphUpdater, this.closureCompilerEnabled, this.delegatingPerfRecorder),
                // TODO(alxhub): understand why the cast here is necessary (something to do with `null`
                // not being assignable to `unknown` when wrapped in `Readonly`).
                // clang-format off
                new annotations_1.DirectiveDecoratorHandler(reflector, evaluator, metaRegistry, scopeRegistry, metaReader, injectableRegistry, isCore, semanticDepGraphUpdater, this.closureCompilerEnabled, config_1.compileUndecoratedClassesWithAngularFeatures, this.delegatingPerfRecorder),
                // clang-format on
                // Pipe handler must be before injectable handler in list so pipe factories are printed
                // before injectable factories (so injectable factories can delegate to them)
                new annotations_1.PipeDecoratorHandler(reflector, evaluator, metaRegistry, scopeRegistry, injectableRegistry, isCore, this.delegatingPerfRecorder),
                new annotations_1.InjectableDecoratorHandler(reflector, isCore, this.options.strictInjectionParameters || false, injectableRegistry, this.delegatingPerfRecorder),
                new annotations_1.NgModuleDecoratorHandler(reflector, evaluator, metaReader, metaRegistry, scopeRegistry, referencesRegistry, isCore, routeAnalyzer, refEmitter, this.adapter.factoryTracker, this.closureCompilerEnabled, injectableRegistry, this.delegatingPerfRecorder, this.options.i18nInLocale),
            ];
            var traitCompiler = new transform_1.TraitCompiler(handlers, reflector, this.delegatingPerfRecorder, this.incrementalDriver, this.options.compileNonExportedClasses !== false, compilationMode, dtsTransforms, semanticDepGraphUpdater);
            var templateTypeChecker = new typecheck_1.TemplateTypeCheckerImpl(this.tsProgram, this.typeCheckingProgramStrategy, traitCompiler, this.getTypeCheckingConfig(), refEmitter, reflector, this.adapter, this.incrementalDriver, scopeRegistry, typeCheckScopeRegistry, this.delegatingPerfRecorder);
            return {
                isCore: isCore,
                traitCompiler: traitCompiler,
                reflector: reflector,
                scopeRegistry: scopeRegistry,
                dtsTransforms: dtsTransforms,
                exportReferenceGraph: exportReferenceGraph,
                routeAnalyzer: routeAnalyzer,
                mwpScanner: mwpScanner,
                metaReader: metaReader,
                typeCheckScopeRegistry: typeCheckScopeRegistry,
                aliasingHost: aliasingHost,
                refEmitter: refEmitter,
                templateTypeChecker: templateTypeChecker,
                resourceRegistry: resourceRegistry,
            };
        };
        return NgCompiler;
    }());
    exports.NgCompiler = NgCompiler;
    /**
     * Determine if the given `Program` is @angular/core.
     */
    function isAngularCorePackage(program) {
        // Look for its_just_angular.ts somewhere in the program.
        var r3Symbols = getR3SymbolsFile(program);
        if (r3Symbols === null) {
            return false;
        }
        // Look for the constant ITS_JUST_ANGULAR in that file.
        return r3Symbols.statements.some(function (stmt) {
            // The statement must be a variable declaration statement.
            if (!ts.isVariableStatement(stmt)) {
                return false;
            }
            // It must be exported.
            if (stmt.modifiers === undefined ||
                !stmt.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.ExportKeyword; })) {
                return false;
            }
            // It must declare ITS_JUST_ANGULAR.
            return stmt.declarationList.declarations.some(function (decl) {
                // The declaration must match the name.
                if (!ts.isIdentifier(decl.name) || decl.name.text !== 'ITS_JUST_ANGULAR') {
                    return false;
                }
                // It must initialize the variable to true.
                if (decl.initializer === undefined || decl.initializer.kind !== ts.SyntaxKind.TrueKeyword) {
                    return false;
                }
                // This definition matches.
                return true;
            });
        });
    }
    exports.isAngularCorePackage = isAngularCorePackage;
    /**
     * Find the 'r3_symbols.ts' file in the given `Program`, or return `null` if it wasn't there.
     */
    function getR3SymbolsFile(program) {
        return program.getSourceFiles().find(function (file) { return file.fileName.indexOf('r3_symbols.ts') >= 0; }) || null;
    }
    /**
     * Since "strictTemplates" is a true superset of type checking capabilities compared to
     * "fullTemplateTypeCheck", it is required that the latter is not explicitly disabled if the
     * former is enabled.
     */
    function verifyCompatibleTypeCheckOptions(options) {
        if (options.fullTemplateTypeCheck === false && options.strictTemplates === true) {
            return {
                category: ts.DiagnosticCategory.Error,
                code: diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.CONFIG_STRICT_TEMPLATES_IMPLIES_FULL_TEMPLATE_TYPECHECK),
                file: undefined,
                start: undefined,
                length: undefined,
                messageText: "Angular compiler option \"strictTemplates\" is enabled, however \"fullTemplateTypeCheck\" is disabled.\n\nHaving the \"strictTemplates\" flag enabled implies that \"fullTemplateTypeCheck\" is also enabled, so\nthe latter can not be explicitly disabled.\n\nOne of the following actions is required:\n1. Remove the \"fullTemplateTypeCheck\" option.\n2. Remove \"strictTemplates\" or set it to 'false'.\n\nMore information about the template type checking compiler options can be found in the documentation:\nhttps://v9.angular.io/guide/template-typecheck#template-type-checking",
            };
        }
        return null;
    }
    var ReferenceGraphAdapter = /** @class */ (function () {
        function ReferenceGraphAdapter(graph) {
            this.graph = graph;
        }
        ReferenceGraphAdapter.prototype.add = function (source) {
            var e_9, _a;
            var references = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                references[_i - 1] = arguments[_i];
            }
            try {
                for (var references_1 = tslib_1.__values(references), references_1_1 = references_1.next(); !references_1_1.done; references_1_1 = references_1.next()) {
                    var node = references_1_1.value.node;
                    var sourceFile = node.getSourceFile();
                    if (sourceFile === undefined) {
                        sourceFile = ts.getOriginalNode(node).getSourceFile();
                    }
                    // Only record local references (not references into .d.ts files).
                    if (sourceFile === undefined || !typescript_1.isDtsPath(sourceFile.fileName)) {
                        this.graph.add(source, node);
                    }
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (references_1_1 && !references_1_1.done && (_a = references_1.return)) _a.call(references_1);
                }
                finally { if (e_9) throw e_9.error; }
            }
        };
        return ReferenceGraphAdapter;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2NvcmUvc3JjL2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQkFBaUM7SUFFakMsMkVBQStNO0lBQy9NLGlFQUErRTtJQUMvRSwyRUFBbUg7SUFDbkgsMkVBQXlFO0lBQ3pFLDJFQUE2RDtJQUM3RCxtRUFBK1g7SUFDL1gsMkVBQThFO0lBRTlFLG1FQUFrRjtJQUNsRixxRUFBeU07SUFDek0sMkZBQXFFO0lBQ3JFLHVGQUF5RDtJQUN6RCw2REFBOEM7SUFDOUMsb0VBQXdFO0lBQ3hFLDhFQUErRDtJQUMvRCx5RUFBb0c7SUFDcEcscUVBQXFEO0lBQ3JELG1FQUFzRTtJQUN0RSwrREFBbUk7SUFDbkksK0RBQXNEO0lBQ3RELGlFQUFnRDtJQUNoRCx1RUFBZ0w7SUFDaEwsdUVBQXdEO0lBQ3hELHFFQUFzSDtJQUN0SCxrRkFBNEY7SUFHNUYsMEVBQXNFO0lBeUJ0RTs7T0FFRztJQUNILElBQVkscUJBSVg7SUFKRCxXQUFZLHFCQUFxQjtRQUMvQixtRUFBSyxDQUFBO1FBQ0wsbUdBQXFCLENBQUE7UUFDckIsK0ZBQW1CLENBQUE7SUFDckIsQ0FBQyxFQUpXLHFCQUFxQixHQUFyQiw2QkFBcUIsS0FBckIsNkJBQXFCLFFBSWhDO0lBaUREOztPQUVHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQ2xDLFNBQXFCLEVBQUUsT0FBMEIsRUFDakQsd0JBQWtELEVBQ2xELDJCQUF3RCxFQUFFLFlBQXFDLEVBQy9GLHlCQUFrQyxFQUFFLGVBQXdCO1FBQzlELE9BQU87WUFDTCxJQUFJLEVBQUUscUJBQXFCLENBQUMsS0FBSztZQUNqQyxTQUFTLFdBQUE7WUFDVCxPQUFPLFNBQUE7WUFDUCx3QkFBd0IsMEJBQUE7WUFDeEIsMkJB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Q0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO3FCQUN2RDtvQkFFRCxrRUFBa0U7b0JBQ2xFLElBQUksVUFBVSxLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQzlCO2lCQUNGOzs7Ozs7Ozs7UUFDSCxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBaEJELElBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7VHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q29tcG9uZW50RGVjb3JhdG9ySGFuZGxlciwgRGlyZWN0aXZlRGVjb3JhdG9ySGFuZGxlciwgSW5qZWN0YWJsZURlY29yYXRvckhhbmRsZXIsIE5nTW9kdWxlRGVjb3JhdG9ySGFuZGxlciwgTm9vcFJlZmVyZW5jZXNSZWdpc3RyeSwgUGlwZURlY29yYXRvckhhbmRsZXIsIFJlZmVyZW5jZXNSZWdpc3RyeX0gZnJvbSAnLi4vLi4vYW5ub3RhdGlvbnMnO1xuaW1wb3J0IHtDeWNsZUFuYWx5emVyLCBDeWNsZUhhbmRsaW5nU3RyYXRlZ3ksIEltcG9ydEdyYXBofSBmcm9tICcuLi8uLi9jeWNsZXMnO1xuaW1wb3J0IHtDT01QSUxFUl9FUlJPUlNfV0lUSF9HVUlERVMsIEVSUk9SX0RFVEFJTFNfUEFHRV9CQVNFX1VSTCwgRXJyb3JDb2RlLCBuZ0Vycm9yQ29kZX0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtjaGVja0ZvclByaXZhdGVFeHBvcnRzLCBSZWZlcmVuY2VHcmFwaH0gZnJvbSAnLi4vLi4vZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtMb2dpY2FsRmlsZVN5c3RlbSwgcmVzb2x2ZX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtBYnNvbHV0ZU1vZHVsZVN0cmF0ZWd5LCBBbGlhc2luZ0hvc3QsIEFsaWFzU3RyYXRlZ3ksIERlZmF1bHRJbXBvcnRUcmFja2VyLCBJbXBvcnRSZXdyaXRlciwgTG9jYWxJZGVudGlmaWVyU3RyYXRlZ3ksIExvZ2ljYWxQcm9qZWN0U3RyYXRlZ3ksIE1vZHVsZVJlc29sdmVyLCBOb29wSW1wb3J0UmV3cml0ZXIsIFByaXZhdGVFeHBvcnRBbGlhc2luZ0hvc3QsIFIzU3ltYm9sc0ltcG9ydFJld3JpdGVyLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXRTdHJhdGVneSwgUmVmZXJlbmNlRW1pdHRlciwgUmVsYXRpdmVQYXRoU3RyYXRlZ3ksIFVuaWZpZWRNb2R1bGVzQWxpYXNpbmdIb3N0LCBVbmlmaWVkTW9kdWxlc1N0cmF0ZWd5fSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7SW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LCBJbmNyZW1lbnRhbERyaXZlcn0gZnJvbSAnLi4vLi4vaW5jcmVtZW50YWwnO1xuaW1wb3J0IHtTZW1hbnRpY1N5bWJvbH0gZnJvbSAnLi4vLi4vaW5jcmVtZW50YWwvc2VtYW50aWNfZ3JhcGgnO1xuaW1wb3J0IHtnZW5lcmF0ZUFuYWx5c2lzLCBJbmRleGVkQ29tcG9uZW50LCBJbmRleGluZ0NvbnRleHR9IGZyb20gJy4uLy4uL2luZGV4ZXInO1xuaW1wb3J0IHtDb21wb25lbnRSZXNvdXJjZXMsIENvbXBvdW5kTWV0YWRhdGFSZWFkZXIsIENvbXBvdW5kTWV0YWRhdGFSZWdpc3RyeSwgRHRzTWV0YWRhdGFSZWFkZXIsIEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5LCBMb2NhbE1ldGFkYXRhUmVnaXN0cnksIE1ldGFkYXRhUmVhZGVyLCBSZXNvdXJjZVJlZ2lzdHJ5fSBmcm9tICcuLi8uLi9tZXRhZGF0YSc7XG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnNTY2FubmVyfSBmcm9tICcuLi8uLi9tb2R1bGV3aXRocHJvdmlkZXJzJztcbmltcG9ydCB7UGFydGlhbEV2YWx1YXRvcn0gZnJvbSAnLi4vLi4vcGFydGlhbF9ldmFsdWF0b3InO1xuaW1wb3J0IHtBY3RpdmVQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtQZXJmQ2hlY2twb2ludCwgUGVyZkV2ZW50LCBQZXJmUGhhc2V9IGZyb20gJy4uLy4uL3BlcmYvc3JjL2FwaSc7XG5pbXBvcnQge0RlbGVnYXRpbmdQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYvc3JjL3JlY29yZGVyJztcbmltcG9ydCB7RGVjbGFyYXRpb25Ob2RlLCBpc05hbWVkQ2xhc3NEZWNsYXJhdGlvbiwgVHlwZVNjcmlwdFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7QWRhcHRlclJlc291cmNlTG9hZGVyfSBmcm9tICcuLi8uLi9yZXNvdXJjZSc7XG5pbXBvcnQge2VudHJ5UG9pbnRLZXlGb3IsIE5nTW9kdWxlUm91dGVBbmFseXplcn0gZnJvbSAnLi4vLi4vcm91dGluZyc7XG5pbXBvcnQge0NvbXBvbmVudFNjb3BlUmVhZGVyLCBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnksIE1ldGFkYXRhRHRzTW9kdWxlU2NvcGVSZXNvbHZlciwgVHlwZUNoZWNrU2NvcGVSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NvcGUnO1xuaW1wb3J0IHtnZW5lcmF0ZWRGYWN0b3J5VHJhbnNmb3JtfSBmcm9tICcuLi8uLi9zaGltcyc7XG5pbXBvcnQge2l2eVN3aXRjaFRyYW5zZm9ybX0gZnJvbSAnLi4vLi4vc3dpdGNoJztcbmltcG9ydCB7YWxpYXNUcmFuc2Zvcm1GYWN0b3J5LCBDb21waWxhdGlvbk1vZGUsIGRlY2xhcmF0aW9uVHJhbnNmb3JtRmFjdG9yeSwgRGVjb3JhdG9ySGFuZGxlciwgRHRzVHJhbnNmb3JtUmVnaXN0cnksIGl2eVRyYW5zZm9ybUZhY3RvcnksIFRyYWl0Q29tcGlsZXJ9IGZyb20gJy4uLy4uL3RyYW5zZm9ybSc7XG5pbXBvcnQge1RlbXBsYXRlVHlwZUNoZWNrZXJJbXBsfSBmcm9tICcuLi8uLi90eXBlY2hlY2snO1xuaW1wb3J0IHtPcHRpbWl6ZUZvciwgVGVtcGxhdGVUeXBlQ2hlY2tlciwgVHlwZUNoZWNraW5nQ29uZmlnLCBUeXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3l9IGZyb20gJy4uLy4uL3R5cGVjaGVjay9hcGknO1xuaW1wb3J0IHtnZXRTb3VyY2VGaWxlT3JOdWxsLCBpc0R0c1BhdGgsIHJlc29sdmVNb2R1bGVOYW1lfSBmcm9tICcuLi8uLi91dGlsL3NyYy90eXBlc2NyaXB0JztcbmltcG9ydCB7TGF6eVJvdXRlLCBOZ0NvbXBpbGVyQWRhcHRlciwgTmdDb21waWxlck9wdGlvbnN9IGZyb20gJy4uL2FwaSc7XG5cbmltcG9ydCB7Y29tcGlsZVVuZGVjb3JhdGVkQ2xhc3Nlc1dpdGhBbmd1bGFyRmVhdHVyZXN9IGZyb20gJy4vY29uZmlnJztcblxuLyoqXG4gKiBTdGF0ZSBpbmZvcm1hdGlvbiBhYm91dCBhIGNvbXBpbGF0aW9uIHdoaWNoIGlzIG9ubHkgZ2VuZXJhdGVkIG9uY2Ugc29tZSBkYXRhIGlzIHJlcXVlc3RlZCBmcm9tXG4gKiB0aGUgYE5nQ29tcGlsZXJgIChmb3IgZXhhbXBsZSwgYnkgY2FsbGluZyBgZ2V0RGlhZ25vc3RpY3NgKS5cbiAqL1xuaW50ZXJmYWNlIExhenlDb21waWxhdGlvblN0YXRlIHtcbiAgaXNDb3JlOiBib29sZWFuO1xuICB0cmFpdENvbXBpbGVyOiBUcmFpdENvbXBpbGVyO1xuICByZWZsZWN0b3I6IFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdDtcbiAgbWV0YVJlYWRlcjogTWV0YWRhdGFSZWFkZXI7XG4gIHNjb3BlUmVnaXN0cnk6IExvY2FsTW9kdWxlU2NvcGVSZWdpc3RyeTtcbiAgdHlwZUNoZWNrU2NvcGVSZWdpc3RyeTogVHlwZUNoZWNrU2NvcGVSZWdpc3RyeTtcbiAgZXhwb3J0UmVmZXJlbmNlR3JhcGg6IFJlZmVyZW5jZUdyYXBofG51bGw7XG4gIHJvdXRlQW5hbHl6ZXI6IE5nTW9kdWxlUm91dGVBbmFseXplcjtcbiAgZHRzVHJhbnNmb3JtczogRHRzVHJhbnNmb3JtUmVnaXN0cnk7XG4gIG13cFNjYW5uZXI6IE1vZHVsZVdpdGhQcm92aWRlcnNTY2FubmVyO1xuICBhbGlhc2luZ0hvc3Q6IEFsaWFzaW5nSG9zdHxudWxsO1xuICByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyO1xuICB0ZW1wbGF0ZVR5cGVDaGVja2VyOiBUZW1wbGF0ZVR5cGVDaGVja2VyO1xuICByZXNvdXJjZVJlZ2lzdHJ5OiBSZXNvdXJjZVJlZ2lzdHJ5O1xufVxuXG5cblxuLyoqXG4gKiBEaXNjcmltaW5hbnQgdHlwZSBmb3IgYSBgQ29tcGlsYXRpb25UaWNrZXRgLlxuICovXG5leHBvcnQgZW51bSBDb21waWxhdGlvblRpY2tldEtpbmQge1xuICBGcmVzaCxcbiAgSW5jcmVtZW50YWxUeXBlU2NyaXB0LFxuICBJbmNyZW1lbnRhbFJlc291cmNlLFxufVxuXG4vKipcbiAqIEJlZ2luIGFuIEFuZ3VsYXIgY29tcGlsYXRpb24gb3BlcmF0aW9uIGZyb20gc2NyYXRjaC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGcmVzaENvbXBpbGF0aW9uVGlja2V0IHtcbiAga2luZDogQ29tcGlsYXRpb25UaWNrZXRLaW5kLkZyZXNoO1xuICBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucztcbiAgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5OiBJbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3k7XG4gIHR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneTogVHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5O1xuICBlbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyOiBib29sZWFuO1xuICB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW47XG4gIHRzUHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgcGVyZlJlY29yZGVyOiBBY3RpdmVQZXJmUmVjb3JkZXI7XG59XG5cbi8qKlxuICogQmVnaW4gYW4gQW5ndWxhciBjb21waWxhdGlvbiBvcGVyYXRpb24gdGhhdCBpbmNvcnBvcmF0ZXMgY2hhbmdlcyB0byBUeXBlU2NyaXB0IGNvZGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5jcmVtZW50YWxUeXBlU2NyaXB0Q29tcGlsYXRpb25UaWNrZXQge1xuICBraW5kOiBDb21waWxhdGlvblRpY2tldEtpbmQuSW5jcmVtZW50YWxUeXBlU2NyaXB0O1xuICBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucztcbiAgb2xkUHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgbmV3UHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5OiBJbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3k7XG4gIHR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneTogVHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5O1xuICBuZXdEcml2ZXI6IEluY3JlbWVudGFsRHJpdmVyO1xuICBlbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyOiBib29sZWFuO1xuICB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW47XG4gIHBlcmZSZWNvcmRlcjogQWN0aXZlUGVyZlJlY29yZGVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluY3JlbWVudGFsUmVzb3VyY2VDb21waWxhdGlvblRpY2tldCB7XG4gIGtpbmQ6IENvbXBpbGF0aW9uVGlja2V0S2luZC5JbmNyZW1lbnRhbFJlc291cmNlO1xuICBjb21waWxlcjogTmdDb21waWxlcjtcbiAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzOiBTZXQ8c3RyaW5nPjtcbiAgcGVyZlJlY29yZGVyOiBBY3RpdmVQZXJmUmVjb3JkZXI7XG59XG5cbi8qKlxuICogQSByZXF1ZXN0IHRvIGJlZ2luIEFuZ3VsYXIgY29tcGlsYXRpb24sIGVpdGhlciBzdGFydGluZyBmcm9tIHNjcmF0Y2ggb3IgZnJvbSBhIGtub3duIHByaW9yIHN0YXRlLlxuICpcbiAqIGBDb21waWxhdGlvblRpY2tldGBzIGFyZSB1c2VkIHRvIGluaXRpYWxpemUgKG9yIHVwZGF0ZSkgYW4gYE5nQ29tcGlsZXJgIGluc3RhbmNlLCB0aGUgY29yZSBvZiB0aGVcbiAqIEFuZ3VsYXIgY29tcGlsZXIuIFRoZXkgYWJzdHJhY3QgdGhlIHN0YXJ0aW5nIHN0YXRlIG9mIGNvbXBpbGF0aW9uIGFuZCBhbGxvdyBgTmdDb21waWxlcmAgdG8gYmVcbiAqIG1hbmFnZWQgaW5kZXBlbmRlbnRseSBvZiBhbnkgaW5jcmVtZW50YWwgY29tcGlsYXRpb24gbGlmZWN5Y2xlLlxuICovXG5leHBvcnQgdHlwZSBDb21waWxhdGlvblRpY2tldCA9IEZyZXNoQ29tcGlsYXRpb25UaWNrZXR8SW5jcmVtZW50YWxUeXBlU2NyaXB0Q29tcGlsYXRpb25UaWNrZXR8XG4gICAgSW5jcmVtZW50YWxSZXNvdXJjZUNvbXBpbGF0aW9uVGlja2V0O1xuXG4vKipcbiAqIENyZWF0ZSBhIGBDb21waWxhdGlvblRpY2tldGAgZm9yIGEgYnJhbmQgbmV3IGNvbXBpbGF0aW9uLCB1c2luZyBubyBwcmlvciBzdGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyZXNoQ29tcGlsYXRpb25UaWNrZXQoXG4gICAgdHNQcm9ncmFtOiB0cy5Qcm9ncmFtLCBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucyxcbiAgICBpbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3k6IEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSxcbiAgICB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3k6IFR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneSwgcGVyZlJlY29yZGVyOiBBY3RpdmVQZXJmUmVjb3JkZXJ8bnVsbCxcbiAgICBlbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyOiBib29sZWFuLCB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW4pOiBDb21waWxhdGlvblRpY2tldCB7XG4gIHJldHVybiB7XG4gICAga2luZDogQ29tcGlsYXRpb25UaWNrZXRLaW5kLkZyZXNoLFxuICAgIHRzUHJvZ3JhbSxcbiAgICBvcHRpb25zLFxuICAgIGluY3JlbWVudGFsQnVpbGRTdHJhdGVneSxcbiAgICB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcixcbiAgICB1c2VQb2lzb25lZERhdGEsXG4gICAgcGVyZlJlY29yZGVyOiBwZXJmUmVjb3JkZXIgPz8gQWN0aXZlUGVyZlJlY29yZGVyLnplcm9lZFRvTm93KCksXG4gIH07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgYENvbXBpbGF0aW9uVGlja2V0YCBhcyBlZmZpY2llbnRseSBhcyBwb3NzaWJsZSwgYmFzZWQgb24gYSBwcmV2aW91cyBgTmdDb21waWxlcmBcbiAqIGluc3RhbmNlIGFuZCBhIG5ldyBgdHMuUHJvZ3JhbWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRhbEZyb21Db21waWxlclRpY2tldChcbiAgICBvbGRDb21waWxlcjogTmdDb21waWxlciwgbmV3UHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICBpbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3k6IEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSxcbiAgICB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3k6IFR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneSwgbW9kaWZpZWRSZXNvdXJjZUZpbGVzOiBTZXQ8c3RyaW5nPixcbiAgICBwZXJmUmVjb3JkZXI6IEFjdGl2ZVBlcmZSZWNvcmRlcnxudWxsKTogQ29tcGlsYXRpb25UaWNrZXQge1xuICBjb25zdCBvbGRQcm9ncmFtID0gb2xkQ29tcGlsZXIuZ2V0TmV4dFByb2dyYW0oKTtcbiAgY29uc3Qgb2xkRHJpdmVyID0gb2xkQ29tcGlsZXIuaW5jcmVtZW50YWxTdHJhdGVneS5nZXRJbmNyZW1lbnRhbERyaXZlcihvbGRQcm9ncmFtKTtcbiAgaWYgKG9sZERyaXZlciA9PT0gbnVsbCkge1xuICAgIC8vIE5vIGluY3JlbWVudGFsIHN0ZXAgaXMgcG9zc2libGUgaGVyZSwgc2luY2Ugbm8gSW5jcmVtZW50YWxEcml2ZXIgd2FzIGZvdW5kIGZvciB0aGUgb2xkXG4gICAgLy8gcHJvZ3JhbS5cbiAgICByZXR1cm4gZnJlc2hDb21waWxhdGlvblRpY2tldChcbiAgICAgICAgbmV3UHJvZ3JhbSwgb2xkQ29tcGlsZXIub3B0aW9ucywgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LCB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgICAgIHBlcmZSZWNvcmRlciwgb2xkQ29tcGlsZXIuZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlciwgb2xkQ29tcGlsZXIudXNlUG9pc29uZWREYXRhKTtcbiAgfVxuXG4gIGlmIChwZXJmUmVjb3JkZXIgPT09IG51bGwpIHtcbiAgICBwZXJmUmVjb3JkZXIgPSBBY3RpdmVQZXJmUmVjb3JkZXIuemVyb2VkVG9Ob3coKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0RyaXZlciA9IEluY3JlbWVudGFsRHJpdmVyLnJlY29uY2lsZShcbiAgICAgIG9sZFByb2dyYW0sIG9sZERyaXZlciwgbmV3UHJvZ3JhbSwgbW9kaWZpZWRSZXNvdXJjZUZpbGVzLCBwZXJmUmVjb3JkZXIpO1xuXG4gIHJldHVybiB7XG4gICAga2luZDogQ29tcGlsYXRpb25UaWNrZXRLaW5kLkluY3JlbWVudGFsVHlwZVNjcmlwdCxcbiAgICBlbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyOiBvbGRDb21waWxlci5lbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyLFxuICAgIHVzZVBvaXNvbmVkRGF0YTogb2xkQ29tcGlsZXIudXNlUG9pc29uZWREYXRhLFxuICAgIG9wdGlvbnM6IG9sZENvbXBpbGVyLm9wdGlvbnMsXG4gICAgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LFxuICAgIHR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneSxcbiAgICBuZXdEcml2ZXIsXG4gICAgb2xkUHJvZ3JhbSxcbiAgICBuZXdQcm9ncmFtLFxuICAgIHBlcmZSZWNvcmRlcixcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBgQ29tcGlsYXRpb25UaWNrZXRgIGRpcmVjdGx5IGZyb20gYW4gb2xkIGB0cy5Qcm9ncmFtYCBhbmQgYXNzb2NpYXRlZCBBbmd1bGFyIGNvbXBpbGF0aW9uXG4gKiBzdGF0ZSwgYWxvbmcgd2l0aCBhIG5ldyBgdHMuUHJvZ3JhbWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRhbEZyb21Ecml2ZXJUaWNrZXQoXG4gICAgb2xkUHJvZ3JhbTogdHMuUHJvZ3JhbSwgb2xkRHJpdmVyOiBJbmNyZW1lbnRhbERyaXZlciwgbmV3UHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucywgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5OiBJbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3ksXG4gICAgdHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5OiBUeXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksIG1vZGlmaWVkUmVzb3VyY2VGaWxlczogU2V0PHN0cmluZz4sXG4gICAgcGVyZlJlY29yZGVyOiBBY3RpdmVQZXJmUmVjb3JkZXJ8bnVsbCwgZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcjogYm9vbGVhbixcbiAgICB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW4pOiBDb21waWxhdGlvblRpY2tldCB7XG4gIGlmIChwZXJmUmVjb3JkZXIgPT09IG51bGwpIHtcbiAgICBwZXJmUmVjb3JkZXIgPSBBY3RpdmVQZXJmUmVjb3JkZXIuemVyb2VkVG9Ob3coKTtcbiAgfVxuXG4gIGNvbnN0IG5ld0RyaXZlciA9IEluY3JlbWVudGFsRHJpdmVyLnJlY29uY2lsZShcbiAgICAgIG9sZFByb2dyYW0sIG9sZERyaXZlciwgbmV3UHJvZ3JhbSwgbW9kaWZpZWRSZXNvdXJjZUZpbGVzLCBwZXJmUmVjb3JkZXIpO1xuICByZXR1cm4ge1xuICAgIGtpbmQ6IENvbXBpbGF0aW9uVGlja2V0S2luZC5JbmNyZW1lbnRhbFR5cGVTY3JpcHQsXG4gICAgb2xkUHJvZ3JhbSxcbiAgICBuZXdQcm9ncmFtLFxuICAgIG9wdGlvbnMsXG4gICAgaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LFxuICAgIG5ld0RyaXZlcixcbiAgICB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcixcbiAgICB1c2VQb2lzb25lZERhdGEsXG4gICAgcGVyZlJlY29yZGVyLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb3VyY2VDaGFuZ2VUaWNrZXQoY29tcGlsZXI6IE5nQ29tcGlsZXIsIG1vZGlmaWVkUmVzb3VyY2VGaWxlczogU2V0PHN0cmluZz4pOlxuICAgIEluY3JlbWVudGFsUmVzb3VyY2VDb21waWxhdGlvblRpY2tldCB7XG4gIHJldHVybiB7XG4gICAga2luZDogQ29tcGlsYXRpb25UaWNrZXRLaW5kLkluY3JlbWVudGFsUmVzb3VyY2UsXG4gICAgY29tcGlsZXIsXG4gICAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzLFxuICAgIHBlcmZSZWNvcmRlcjogQWN0aXZlUGVyZlJlY29yZGVyLnplcm9lZFRvTm93KCksXG4gIH07XG59XG5cblxuLyoqXG4gKiBUaGUgaGVhcnQgb2YgdGhlIEFuZ3VsYXIgSXZ5IGNvbXBpbGVyLlxuICpcbiAqIFRoZSBgTmdDb21waWxlcmAgcHJvdmlkZXMgYW4gQVBJIGZvciBwZXJmb3JtaW5nIEFuZ3VsYXIgY29tcGlsYXRpb24gd2l0aGluIGEgY3VzdG9tIFR5cGVTY3JpcHRcbiAqIGNvbXBpbGVyLiBFYWNoIGluc3RhbmNlIG9mIGBOZ0NvbXBpbGVyYCBzdXBwb3J0cyBhIHNpbmdsZSBjb21waWxhdGlvbiwgd2hpY2ggbWlnaHQgYmVcbiAqIGluY3JlbWVudGFsLlxuICpcbiAqIGBOZ0NvbXBpbGVyYCBpcyBsYXp5LCBhbmQgZG9lcyBub3QgcGVyZm9ybSBhbnkgb2YgdGhlIHdvcmsgb2YgdGhlIGNvbXBpbGF0aW9uIHVudGlsIG9uZSBvZiBpdHNcbiAqIG91dHB1dCBtZXRob2RzIChlLmcuIGBnZXREaWFnbm9zdGljc2ApIGlzIGNhbGxlZC5cbiAqXG4gKiBTZWUgdGhlIFJFQURNRS5tZCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ29tcGlsZXIge1xuICAvKipcbiAgICogTGF6aWx5IGV2YWx1YXRlZCBzdGF0ZSBvZiB0aGUgY29tcGlsYXRpb24uXG4gICAqXG4gICAqIFRoaXMgaXMgY3JlYXRlZCBvbiBkZW1hbmQgYnkgY2FsbGluZyBgZW5zdXJlQW5hbHl6ZWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21waWxhdGlvbjogTGF6eUNvbXBpbGF0aW9uU3RhdGV8bnVsbCA9IG51bGw7XG5cbiAgLyoqXG4gICAqIEFueSBkaWFnbm9zdGljcyByZWxhdGVkIHRvIHRoZSBjb25zdHJ1Y3Rpb24gb2YgdGhlIGNvbXBpbGF0aW9uLlxuICAgKlxuICAgKiBUaGVzZSBhcmUgZGlhZ25vc3RpY3Mgd2hpY2ggYXJvc2UgZHVyaW5nIHNldHVwIG9mIHRoZSBob3N0IGFuZC9vciBwcm9ncmFtLlxuICAgKi9cbiAgcHJpdmF0ZSBjb25zdHJ1Y3Rpb25EaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG5cbiAgLyoqXG4gICAqIE5vbi10ZW1wbGF0ZSBkaWFnbm9zdGljcyByZWxhdGVkIHRvIHRoZSBwcm9ncmFtIGl0c2VsZi4gRG9lcyBub3QgaW5jbHVkZSB0ZW1wbGF0ZVxuICAgKiBkaWFnbm9zdGljcyBiZWNhdXNlIHRoZSB0ZW1wbGF0ZSB0eXBlIGNoZWNrZXIgbWVtb2l6ZXMgdGhlbSBpdHNlbGYuXG4gICAqXG4gICAqIFRoaXMgaXMgc2V0IGJ5IChhbmQgbWVtb2l6ZXMpIGBnZXROb25UZW1wbGF0ZURpYWdub3N0aWNzYC5cbiAgICovXG4gIHByaXZhdGUgbm9uVGVtcGxhdGVEaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdfG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgY2xvc3VyZUNvbXBpbGVyRW5hYmxlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBuZXh0UHJvZ3JhbTogdHMuUHJvZ3JhbTtcbiAgcHJpdmF0ZSBlbnRyeVBvaW50OiB0cy5Tb3VyY2VGaWxlfG51bGw7XG4gIHByaXZhdGUgbW9kdWxlUmVzb2x2ZXI6IE1vZHVsZVJlc29sdmVyO1xuICBwcml2YXRlIHJlc291cmNlTWFuYWdlcjogQWRhcHRlclJlc291cmNlTG9hZGVyO1xuICBwcml2YXRlIGN5Y2xlQW5hbHl6ZXI6IEN5Y2xlQW5hbHl6ZXI7XG4gIHJlYWRvbmx5IGlnbm9yZUZvckRpYWdub3N0aWNzOiBTZXQ8dHMuU291cmNlRmlsZT47XG4gIHJlYWRvbmx5IGlnbm9yZUZvckVtaXQ6IFNldDx0cy5Tb3VyY2VGaWxlPjtcblxuICAvKipcbiAgICogYE5nQ29tcGlsZXJgIGNhbiBiZSByZXVzZWQgZm9yIG11bHRpcGxlIGNvbXBpbGF0aW9ucyAoZm9yIHJlc291cmNlLW9ubHkgY2hhbmdlcyksIGFuZCBlYWNoXG4gICAqIG5ldyBjb21waWxhdGlvbiB1c2VzIGEgZnJlc2ggYFBlcmZSZWNvcmRlcmAuIFRodXMsIGNsYXNzZXMgY3JlYXRlZCB3aXRoIGEgbGlmZXNwYW4gb2YgdGhlXG4gICAqIGBOZ0NvbXBpbGVyYCB1c2UgYSBgRGVsZWdhdGluZ1BlcmZSZWNvcmRlcmAgc28gdGhlIGBQZXJmUmVjb3JkZXJgIHRoZXkgd3JpdGUgdG8gY2FuIGJlIHVwZGF0ZWRcbiAgICogd2l0aCBlYWNoIGZyZXNoIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWxlZ2F0aW5nUGVyZlJlY29yZGVyID0gbmV3IERlbGVnYXRpbmdQZXJmUmVjb3JkZXIodGhpcy5wZXJmUmVjb3JkZXIpO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgYENvbXBpbGF0aW9uVGlja2V0YCBpbnRvIGFuIGBOZ0NvbXBpbGVyYCBpbnN0YW5jZSBmb3IgdGhlIHJlcXVlc3RlZCBjb21waWxhdGlvbi5cbiAgICpcbiAgICogRGVwZW5kaW5nIG9uIHRoZSBuYXR1cmUgb2YgdGhlIGNvbXBpbGF0aW9uIHJlcXVlc3QsIHRoZSBgTmdDb21waWxlcmAgaW5zdGFuY2UgbWF5IGJlIHJldXNlZFxuICAgKiBmcm9tIGEgcHJldmlvdXMgY29tcGlsYXRpb24gYW5kIHVwZGF0ZWQgd2l0aCBhbnkgY2hhbmdlcywgaXQgbWF5IGJlIGEgbmV3IGluc3RhbmNlIHdoaWNoXG4gICAqIGluY3JlbWVudGFsbHkgcmV1c2VzIHN0YXRlIGZyb20gYSBwcmV2aW91cyBjb21waWxhdGlvbiwgb3IgaXQgbWF5IHJlcHJlc2VudCBhIGZyZXNoXG4gICAqIGNvbXBpbGF0aW9uIGVudGlyZWx5LlxuICAgKi9cbiAgc3RhdGljIGZyb21UaWNrZXQodGlja2V0OiBDb21waWxhdGlvblRpY2tldCwgYWRhcHRlcjogTmdDb21waWxlckFkYXB0ZXIpIHtcbiAgICBzd2l0Y2ggKHRpY2tldC5raW5kKSB7XG4gICAgICBjYXNlIENvbXBpbGF0aW9uVGlja2V0S2luZC5GcmVzaDpcbiAgICAgICAgcmV0dXJuIG5ldyBOZ0NvbXBpbGVyKFxuICAgICAgICAgICAgYWRhcHRlcixcbiAgICAgICAgICAgIHRpY2tldC5vcHRpb25zLFxuICAgICAgICAgICAgdGlja2V0LnRzUHJvZ3JhbSxcbiAgICAgICAgICAgIHRpY2tldC50eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgICAgICAgICB0aWNrZXQuaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LFxuICAgICAgICAgICAgSW5jcmVtZW50YWxEcml2ZXIuZnJlc2godGlja2V0LnRzUHJvZ3JhbSksXG4gICAgICAgICAgICB0aWNrZXQuZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcixcbiAgICAgICAgICAgIHRpY2tldC51c2VQb2lzb25lZERhdGEsXG4gICAgICAgICAgICB0aWNrZXQucGVyZlJlY29yZGVyLFxuICAgICAgICApO1xuICAgICAgY2FzZSBDb21waWxhdGlvblRpY2tldEtpbmQuSW5jcmVtZW50YWxUeXBlU2NyaXB0OlxuICAgICAgICByZXR1cm4gbmV3IE5nQ29tcGlsZXIoXG4gICAgICAgICAgICBhZGFwdGVyLFxuICAgICAgICAgICAgdGlja2V0Lm9wdGlvbnMsXG4gICAgICAgICAgICB0aWNrZXQubmV3UHJvZ3JhbSxcbiAgICAgICAgICAgIHRpY2tldC50eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3ksXG4gICAgICAgICAgICB0aWNrZXQuaW5jcmVtZW50YWxCdWlsZFN0cmF0ZWd5LFxuICAgICAgICAgICAgdGlja2V0Lm5ld0RyaXZlcixcbiAgICAgICAgICAgIHRpY2tldC5lbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyLFxuICAgICAgICAgICAgdGlja2V0LnVzZVBvaXNvbmVkRGF0YSxcbiAgICAgICAgICAgIHRpY2tldC5wZXJmUmVjb3JkZXIsXG4gICAgICAgICk7XG4gICAgICBjYXNlIENvbXBpbGF0aW9uVGlja2V0S2luZC5JbmNyZW1lbnRhbFJlc291cmNlOlxuICAgICAgICBjb25zdCBjb21waWxlciA9IHRpY2tldC5jb21waWxlcjtcbiAgICAgICAgY29tcGlsZXIudXBkYXRlV2l0aENoYW5nZWRSZXNvdXJjZXModGlja2V0Lm1vZGlmaWVkUmVzb3VyY2VGaWxlcywgdGlja2V0LnBlcmZSZWNvcmRlcik7XG4gICAgICAgIHJldHVybiBjb21waWxlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBhZGFwdGVyOiBOZ0NvbXBpbGVyQWRhcHRlcixcbiAgICAgIHJlYWRvbmx5IG9wdGlvbnM6IE5nQ29tcGlsZXJPcHRpb25zLFxuICAgICAgcHJpdmF0ZSB0c1Byb2dyYW06IHRzLlByb2dyYW0sXG4gICAgICByZWFkb25seSB0eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3k6IFR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneSxcbiAgICAgIHJlYWRvbmx5IGluY3JlbWVudGFsU3RyYXRlZ3k6IEluY3JlbWVudGFsQnVpbGRTdHJhdGVneSxcbiAgICAgIHJlYWRvbmx5IGluY3JlbWVudGFsRHJpdmVyOiBJbmNyZW1lbnRhbERyaXZlcixcbiAgICAgIHJlYWRvbmx5IGVuYWJsZVRlbXBsYXRlVHlwZUNoZWNrZXI6IGJvb2xlYW4sXG4gICAgICByZWFkb25seSB1c2VQb2lzb25lZERhdGE6IGJvb2xlYW4sXG4gICAgICBwcml2YXRlIGxpdmVQZXJmUmVjb3JkZXI6IEFjdGl2ZVBlcmZSZWNvcmRlcixcbiAgKSB7XG4gICAgdGhpcy5jb25zdHJ1Y3Rpb25EaWFnbm9zdGljcy5wdXNoKC4uLnRoaXMuYWRhcHRlci5jb25zdHJ1Y3Rpb25EaWFnbm9zdGljcyk7XG4gICAgY29uc3QgaW5jb21wYXRpYmxlVHlwZUNoZWNrT3B0aW9uc0RpYWdub3N0aWMgPSB2ZXJpZnlDb21wYXRpYmxlVHlwZUNoZWNrT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgIGlmIChpbmNvbXBhdGlibGVUeXBlQ2hlY2tPcHRpb25zRGlhZ25vc3RpYyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jb25zdHJ1Y3Rpb25EaWFnbm9zdGljcy5wdXNoKGluY29tcGF0aWJsZVR5cGVDaGVja09wdGlvbnNEaWFnbm9zdGljKTtcbiAgICB9XG5cbiAgICB0aGlzLm5leHRQcm9ncmFtID0gdHNQcm9ncmFtO1xuICAgIHRoaXMuY2xvc3VyZUNvbXBpbGVyRW5hYmxlZCA9ICEhdGhpcy5vcHRpb25zLmFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyO1xuXG4gICAgdGhpcy5lbnRyeVBvaW50ID1cbiAgICAgICAgYWRhcHRlci5lbnRyeVBvaW50ICE9PSBudWxsID8gZ2V0U291cmNlRmlsZU9yTnVsbCh0c1Byb2dyYW0sIGFkYXB0ZXIuZW50cnlQb2ludCkgOiBudWxsO1xuXG4gICAgY29uc3QgbW9kdWxlUmVzb2x1dGlvbkNhY2hlID0gdHMuY3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlKFxuICAgICAgICB0aGlzLmFkYXB0ZXIuZ2V0Q3VycmVudERpcmVjdG9yeSgpLFxuICAgICAgICAvLyBkb2VuJ3QgcmV0YWluIGEgcmVmZXJlbmNlIHRvIGB0aGlzYCwgaWYgb3RoZXIgY2xvc3VyZXMgaW4gdGhlIGNvbnN0cnVjdG9yIGhlcmUgcmVmZXJlbmNlXG4gICAgICAgIC8vIGB0aGlzYCBpbnRlcm5hbGx5IHRoZW4gYSBjbG9zdXJlIGNyZWF0ZWQgaGVyZSB3b3VsZCByZXRhaW4gdGhlbS4gVGhpcyBjYW4gY2F1c2UgbWFqb3JcbiAgICAgICAgLy8gbWVtb3J5IGxlYWsgaXNzdWVzIHNpbmNlIHRoZSBgbW9kdWxlUmVzb2x1dGlvbkNhY2hlYCBpcyBhIGxvbmctbGl2ZWQgb2JqZWN0IGFuZCBmaW5kcyBpdHNcbiAgICAgICAgLy8gd2F5IGludG8gYWxsIGtpbmRzIG9mIHBsYWNlcyBpbnNpZGUgVFMgaW50ZXJuYWwgb2JqZWN0cy5cbiAgICAgICAgdGhpcy5hZGFwdGVyLmdldENhbm9uaWNhbEZpbGVOYW1lLmJpbmQodGhpcy5hZGFwdGVyKSk7XG4gICAgdGhpcy5tb2R1bGVSZXNvbHZlciA9XG4gICAgICAgIG5ldyBNb2R1bGVSZXNvbHZlcih0c1Byb2dyYW0sIHRoaXMub3B0aW9ucywgdGhpcy5hZGFwdGVyLCBtb2R1bGVSZXNvbHV0aW9uQ2FjaGUpO1xuICAgIHRoaXMucmVzb3VyY2VNYW5hZ2VyID0gbmV3IEFkYXB0ZXJSZXNvdXJjZUxvYWRlcihhZGFwdGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIHRoaXMuY3ljbGVBbmFseXplciA9XG4gICAgICAgIG5ldyBDeWNsZUFuYWx5emVyKG5ldyBJbXBvcnRHcmFwaCh0c1Byb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKSwgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyKSk7XG4gICAgdGhpcy5pbmNyZW1lbnRhbFN0cmF0ZWd5LnNldEluY3JlbWVudGFsRHJpdmVyKHRoaXMuaW5jcmVtZW50YWxEcml2ZXIsIHRzUHJvZ3JhbSk7XG5cbiAgICB0aGlzLmlnbm9yZUZvckRpYWdub3N0aWNzID1cbiAgICAgICAgbmV3IFNldCh0c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5maWx0ZXIoc2YgPT4gdGhpcy5hZGFwdGVyLmlzU2hpbShzZikpKTtcbiAgICB0aGlzLmlnbm9yZUZvckVtaXQgPSB0aGlzLmFkYXB0ZXIuaWdub3JlRm9yRW1pdDtcblxuICAgIGxldCBkdHNGaWxlQ291bnQgPSAwO1xuICAgIGxldCBub25EdHNGaWxlQ291bnQgPSAwO1xuICAgIGZvciAoY29uc3Qgc2Ygb2YgdHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkpIHtcbiAgICAgIGlmIChzZi5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgICBkdHNGaWxlQ291bnQrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vbkR0c0ZpbGVDb3VudCsrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxpdmVQZXJmUmVjb3JkZXIuZXZlbnRDb3VudChQZXJmRXZlbnQuSW5wdXREdHNGaWxlLCBkdHNGaWxlQ291bnQpO1xuICAgIGxpdmVQZXJmUmVjb3JkZXIuZXZlbnRDb3VudChQZXJmRXZlbnQuSW5wdXRUc0ZpbGUsIG5vbkR0c0ZpbGVDb3VudCk7XG4gIH1cblxuICBnZXQgcGVyZlJlY29yZGVyKCk6IEFjdGl2ZVBlcmZSZWNvcmRlciB7XG4gICAgcmV0dXJuIHRoaXMubGl2ZVBlcmZSZWNvcmRlcjtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlV2l0aENoYW5nZWRSZXNvdXJjZXMoXG4gICAgICBjaGFuZ2VkUmVzb3VyY2VzOiBTZXQ8c3RyaW5nPiwgcGVyZlJlY29yZGVyOiBBY3RpdmVQZXJmUmVjb3JkZXIpOiB2b2lkIHtcbiAgICB0aGlzLmxpdmVQZXJmUmVjb3JkZXIgPSBwZXJmUmVjb3JkZXI7XG4gICAgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyLnRhcmdldCA9IHBlcmZSZWNvcmRlcjtcblxuICAgIHBlcmZSZWNvcmRlci5pblBoYXNlKFBlcmZQaGFzZS5SZXNvdXJjZVVwZGF0ZSwgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuY29tcGlsYXRpb24gPT09IG51bGwpIHtcbiAgICAgICAgLy8gQW5hbHlzaXMgaGFzbid0IGhhcHBlbmVkIHlldCwgc28gbm8gdXBkYXRlIGlzIG5lY2Vzc2FyeSAtIGFueSBjaGFuZ2VzIHRvIHJlc291cmNlcyB3aWxsXG4gICAgICAgIC8vIGJlIGNhcHR1cmVkIGJ5IHRoZSBpbml0YWwgYW5hbHlzaXMgcGFzcyBpdHNlbGYuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNvdXJjZU1hbmFnZXIuaW52YWxpZGF0ZSgpO1xuXG4gICAgICBjb25zdCBjbGFzc2VzVG9VcGRhdGUgPSBuZXcgU2V0PERlY2xhcmF0aW9uTm9kZT4oKTtcbiAgICAgIGZvciAoY29uc3QgcmVzb3VyY2VGaWxlIG9mIGNoYW5nZWRSZXNvdXJjZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCB0ZW1wbGF0ZUNsYXNzIG9mIHRoaXMuZ2V0Q29tcG9uZW50c1dpdGhUZW1wbGF0ZUZpbGUocmVzb3VyY2VGaWxlKSkge1xuICAgICAgICAgIGNsYXNzZXNUb1VwZGF0ZS5hZGQodGVtcGxhdGVDbGFzcyk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IHN0eWxlQ2xhc3Mgb2YgdGhpcy5nZXRDb21wb25lbnRzV2l0aFN0eWxlRmlsZShyZXNvdXJjZUZpbGUpKSB7XG4gICAgICAgICAgY2xhc3Nlc1RvVXBkYXRlLmFkZChzdHlsZUNsYXNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIGNsYXNzZXNUb1VwZGF0ZSkge1xuICAgICAgICB0aGlzLmNvbXBpbGF0aW9uLnRyYWl0Q29tcGlsZXIudXBkYXRlUmVzb3VyY2VzKGNsYXp6KTtcbiAgICAgICAgaWYgKCF0cy5pc0NsYXNzRGVjbGFyYXRpb24oY2xhenopKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbXBpbGF0aW9uLnRlbXBsYXRlVHlwZUNoZWNrZXIuaW52YWxpZGF0ZUNsYXNzKGNsYXp6KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHJlc291cmNlIGRlcGVuZGVuY2llcyBvZiBhIGZpbGUuXG4gICAqXG4gICAqIElmIHRoZSBmaWxlIGlzIG5vdCBwYXJ0IG9mIHRoZSBjb21waWxhdGlvbiwgYW4gZW1wdHkgYXJyYXkgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIGdldFJlc291cmNlRGVwZW5kZW5jaWVzKGZpbGU6IHRzLlNvdXJjZUZpbGUpOiBzdHJpbmdbXSB7XG4gICAgdGhpcy5lbnN1cmVBbmFseXplZCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuaW5jcmVtZW50YWxEcml2ZXIuZGVwR3JhcGguZ2V0UmVzb3VyY2VEZXBlbmRlbmNpZXMoZmlsZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBBbmd1bGFyLXJlbGF0ZWQgZGlhZ25vc3RpY3MgZm9yIHRoaXMgY29tcGlsYXRpb24uXG4gICAqL1xuICBnZXREaWFnbm9zdGljcygpOiB0cy5EaWFnbm9zdGljW10ge1xuICAgIHJldHVybiB0aGlzLmFkZE1lc3NhZ2VUZXh0RGV0YWlscyhcbiAgICAgICAgWy4uLnRoaXMuZ2V0Tm9uVGVtcGxhdGVEaWFnbm9zdGljcygpLCAuLi50aGlzLmdldFRlbXBsYXRlRGlhZ25vc3RpY3MoKV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgQW5ndWxhci1yZWxhdGVkIGRpYWdub3N0aWNzIGZvciB0aGlzIGNvbXBpbGF0aW9uLlxuICAgKlxuICAgKiBJZiBhIGB0cy5Tb3VyY2VGaWxlYCBpcyBwYXNzZWQsIG9ubHkgZGlhZ25vc3RpY3MgcmVsYXRlZCB0byB0aGF0IGZpbGUgYXJlIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0RGlhZ25vc3RpY3NGb3JGaWxlKGZpbGU6IHRzLlNvdXJjZUZpbGUsIG9wdGltaXplRm9yOiBPcHRpbWl6ZUZvcik6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWVzc2FnZVRleHREZXRhaWxzKFtcbiAgICAgIC4uLnRoaXMuZ2V0Tm9uVGVtcGxhdGVEaWFnbm9zdGljcygpLmZpbHRlcihkaWFnID0+IGRpYWcuZmlsZSA9PT0gZmlsZSksXG4gICAgICAuLi50aGlzLmdldFRlbXBsYXRlRGlhZ25vc3RpY3NGb3JGaWxlKGZpbGUsIG9wdGltaXplRm9yKVxuICAgIF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBBbmd1bGFyLmlvIGVycm9yIGd1aWRlIGxpbmtzIHRvIGRpYWdub3N0aWNzIGZvciB0aGlzIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRNZXNzYWdlVGV4dERldGFpbHMoZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSk6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgcmV0dXJuIGRpYWdub3N0aWNzLm1hcChkaWFnID0+IHtcbiAgICAgIGlmIChkaWFnLmNvZGUgJiYgQ09NUElMRVJfRVJST1JTX1dJVEhfR1VJREVTLmhhcyhuZ0Vycm9yQ29kZShkaWFnLmNvZGUpKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmRpYWcsXG4gICAgICAgICAgbWVzc2FnZVRleHQ6IGRpYWcubWVzc2FnZVRleHQgK1xuICAgICAgICAgICAgICBgLiBGaW5kIG1vcmUgYXQgJHtFUlJPUl9ERVRBSUxTX1BBR0VfQkFTRV9VUkx9L05HJHtuZ0Vycm9yQ29kZShkaWFnLmNvZGUpfWBcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaWFnO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgc2V0dXAtcmVsYXRlZCBkaWFnbm9zdGljcyBmb3IgdGhpcyBjb21waWxhdGlvbi5cbiAgICovXG4gIGdldE9wdGlvbkRpYWdub3N0aWNzKCk6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgcmV0dXJuIHRoaXMuY29uc3RydWN0aW9uRGlhZ25vc3RpY3M7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBgdHMuUHJvZ3JhbWAgdG8gdXNlIGFzIGEgc3RhcnRpbmcgcG9pbnQgd2hlbiBzcGF3bmluZyBhIHN1YnNlcXVlbnQgaW5jcmVtZW50YWxcbiAgICogY29tcGlsYXRpb24uXG4gICAqXG4gICAqIFRoZSBgTmdDb21waWxlcmAgc3Bhd25zIGFuIGludGVybmFsIGluY3JlbWVudGFsIFR5cGVTY3JpcHQgY29tcGlsYXRpb24gKGluaGVyaXRpbmcgdGhlXG4gICAqIGNvbnN1bWVyJ3MgYHRzLlByb2dyYW1gIGludG8gYSBuZXcgb25lIGZvciB0aGUgcHVycG9zZXMgb2YgdGVtcGxhdGUgdHlwZS1jaGVja2luZykuIEFmdGVyIHRoaXNcbiAgICogb3BlcmF0aW9uLCB0aGUgY29uc3VtZXIncyBgdHMuUHJvZ3JhbWAgaXMgbm8gbG9uZ2VyIHVzYWJsZSBmb3Igc3RhcnRpbmcgYSBuZXcgaW5jcmVtZW50YWxcbiAgICogY29tcGlsYXRpb24uIGBnZXROZXh0UHJvZ3JhbWAgcmV0cmlldmVzIHRoZSBgdHMuUHJvZ3JhbWAgd2hpY2ggY2FuIGJlIHVzZWQgaW5zdGVhZC5cbiAgICovXG4gIGdldE5leHRQcm9ncmFtKCk6IHRzLlByb2dyYW0ge1xuICAgIHJldHVybiB0aGlzLm5leHRQcm9ncmFtO1xuICB9XG5cbiAgZ2V0VGVtcGxhdGVUeXBlQ2hlY2tlcigpOiBUZW1wbGF0ZVR5cGVDaGVja2VyIHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUaGUgYFRlbXBsYXRlVHlwZUNoZWNrZXJgIGRvZXMgbm90IHdvcmsgd2l0aG91dCBgZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcmAuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVuc3VyZUFuYWx5emVkKCkudGVtcGxhdGVUeXBlQ2hlY2tlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIGB0cy5EZWNsYXJhdGlvbmBzIGZvciBhbnkgY29tcG9uZW50KHMpIHdoaWNoIHVzZSB0aGUgZ2l2ZW4gdGVtcGxhdGUgZmlsZS5cbiAgICovXG4gIGdldENvbXBvbmVudHNXaXRoVGVtcGxhdGVGaWxlKHRlbXBsYXRlRmlsZVBhdGg6IHN0cmluZyk6IFJlYWRvbmx5U2V0PERlY2xhcmF0aW9uTm9kZT4ge1xuICAgIGNvbnN0IHtyZXNvdXJjZVJlZ2lzdHJ5fSA9IHRoaXMuZW5zdXJlQW5hbHl6ZWQoKTtcbiAgICByZXR1cm4gcmVzb3VyY2VSZWdpc3RyeS5nZXRDb21wb25lbnRzV2l0aFRlbXBsYXRlKHJlc29sdmUodGVtcGxhdGVGaWxlUGF0aCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgYHRzLkRlY2xhcmF0aW9uYHMgZm9yIGFueSBjb21wb25lbnQocykgd2hpY2ggdXNlIHRoZSBnaXZlbiB0ZW1wbGF0ZSBmaWxlLlxuICAgKi9cbiAgZ2V0Q29tcG9uZW50c1dpdGhTdHlsZUZpbGUoc3R5bGVGaWxlUGF0aDogc3RyaW5nKTogUmVhZG9ubHlTZXQ8RGVjbGFyYXRpb25Ob2RlPiB7XG4gICAgY29uc3Qge3Jlc291cmNlUmVnaXN0cnl9ID0gdGhpcy5lbnN1cmVBbmFseXplZCgpO1xuICAgIHJldHVybiByZXNvdXJjZVJlZ2lzdHJ5LmdldENvbXBvbmVudHNXaXRoU3R5bGUocmVzb2x2ZShzdHlsZUZpbGVQYXRoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIGV4dGVybmFsIHJlc291cmNlcyBmb3IgdGhlIGdpdmVuIGNvbXBvbmVudC5cbiAgICovXG4gIGdldENvbXBvbmVudFJlc291cmNlcyhjbGFzc0RlY2w6IERlY2xhcmF0aW9uTm9kZSk6IENvbXBvbmVudFJlc291cmNlc3xudWxsIHtcbiAgICBpZiAoIWlzTmFtZWRDbGFzc0RlY2xhcmF0aW9uKGNsYXNzRGVjbCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7cmVzb3VyY2VSZWdpc3RyeX0gPSB0aGlzLmVuc3VyZUFuYWx5emVkKCk7XG4gICAgY29uc3Qgc3R5bGVzID0gcmVzb3VyY2VSZWdpc3RyeS5nZXRTdHlsZXMoY2xhc3NEZWNsKTtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHJlc291cmNlUmVnaXN0cnkuZ2V0VGVtcGxhdGUoY2xhc3NEZWNsKTtcbiAgICBpZiAodGVtcGxhdGUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiB7c3R5bGVzLCB0ZW1wbGF0ZX07XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybSBBbmd1bGFyJ3MgYW5hbHlzaXMgc3RlcCAoYXMgYSBwcmVjdXJzb3IgdG8gYGdldERpYWdub3N0aWNzYCBvciBgcHJlcGFyZUVtaXRgKVxuICAgKiBhc3luY2hyb25vdXNseS5cbiAgICpcbiAgICogTm9ybWFsbHksIHRoaXMgb3BlcmF0aW9uIGhhcHBlbnMgbGF6aWx5IHdoZW5ldmVyIGBnZXREaWFnbm9zdGljc2Agb3IgYHByZXBhcmVFbWl0YCBhcmUgY2FsbGVkLlxuICAgKiBIb3dldmVyLCBjZXJ0YWluIGNvbnN1bWVycyBtYXkgd2lzaCB0byBhbGxvdyBmb3IgYW4gYXN5bmNocm9ub3VzIHBoYXNlIG9mIGFuYWx5c2lzLCB3aGVyZVxuICAgKiByZXNvdXJjZXMgc3VjaCBhcyBgc3R5bGVVcmxzYCBhcmUgcmVzb2x2ZWQgYXN5bmNob25vdXNseS4gSW4gdGhlc2UgY2FzZXMgYGFuYWx5emVBc3luY2AgbXVzdCBiZVxuICAgKiBjYWxsZWQgZmlyc3QsIGFuZCBpdHMgYFByb21pc2VgIGF3YWl0ZWQgcHJpb3IgdG8gY2FsbGluZyBhbnkgb3RoZXIgQVBJcyBvZiBgTmdDb21waWxlcmAuXG4gICAqL1xuICBhc3luYyBhbmFseXplQXN5bmMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY29tcGlsYXRpb24gIT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLnBlcmZSZWNvcmRlci5pblBoYXNlKFBlcmZQaGFzZS5BbmFseXNpcywgYXN5bmMgKCkgPT4ge1xuICAgICAgdGhpcy5jb21waWxhdGlvbiA9IHRoaXMubWFrZUNvbXBpbGF0aW9uKCk7XG5cbiAgICAgIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcbiAgICAgIGZvciAoY29uc3Qgc2Ygb2YgdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgICBpZiAoc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhbmFseXNpc1Byb21pc2UgPSB0aGlzLmNvbXBpbGF0aW9uLnRyYWl0Q29tcGlsZXIuYW5hbHl6ZUFzeW5jKHNmKTtcbiAgICAgICAgdGhpcy5zY2FuRm9yTXdwKHNmKTtcbiAgICAgICAgaWYgKGFuYWx5c2lzUHJvbWlzZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChhbmFseXNpc1Byb21pc2UpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcblxuICAgICAgdGhpcy5wZXJmUmVjb3JkZXIubWVtb3J5KFBlcmZDaGVja3BvaW50LkFuYWx5c2lzKTtcbiAgICAgIHRoaXMucmVzb2x2ZUNvbXBpbGF0aW9uKHRoaXMuY29tcGlsYXRpb24udHJhaXRDb21waWxlcik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdCBsYXp5IHJvdXRlcyBkZXRlY3RlZCBkdXJpbmcgYW5hbHlzaXMuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIGNhbGxlZCBmb3Igb25lIHNwZWNpZmljIHJvdXRlLCBvciB0byByZXRyaWV2ZSBhbGwgdG9wLWxldmVsIHJvdXRlcy5cbiAgICovXG4gIGxpc3RMYXp5Um91dGVzKGVudHJ5Um91dGU/OiBzdHJpbmcpOiBMYXp5Um91dGVbXSB7XG4gICAgaWYgKGVudHJ5Um91dGUpIHtcbiAgICAgIC8vIGh0dHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzUwNzMyZTE1Ni9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL3RyYW5zZm9ybWVycy9jb21waWxlcl9ob3N0LnRzI0wxNzUtTDE4OCkuXG4gICAgICAvL1xuICAgICAgLy8gYEBhbmd1bGFyL2NsaWAgd2lsbCBhbHdheXMgY2FsbCB0aGlzIEFQSSB3aXRoIGFuIGFic29sdXRlIHBhdGgsIHNvIHRoZSByZXNvbHV0aW9uIHN0ZXAgaXNcbiAgICAgIC8vIG5vdCBuZWNlc3NhcnksIGJ1dCBrZWVwaW5nIGl0IGJhY2t3YXJkcyBjb21wYXRpYmxlIGluIGNhc2Ugc29tZW9uZSBlbHNlIGlzIHVzaW5nIHRoZSBBUEkuXG5cbiAgICAgIC8vIFJlbGF0aXZlIGVudHJ5IHBhdGhzIGFyZSBkaXNhbGxvd2VkLlxuICAgICAgaWYgKGVudHJ5Um91dGUuc3RhcnRzV2l0aCgnLicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxpc3QgbGF6eSByb3V0ZXM6IFJlc29sdXRpb24gb2YgcmVsYXRpdmUgcGF0aHMgKCR7XG4gICAgICAgICAgICBlbnRyeVJvdXRlfSkgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gTm9uLXJlbGF0aXZlIGVudHJ5IHBhdGhzIGZhbGwgaW50byBvbmUgb2YgdGhlIGZvbGxvd2luZyBjYXRlZ29yaWVzOlxuICAgICAgLy8gLSBBYnNvbHV0ZSBzeXN0ZW0gcGF0aHMgKGUuZy4gYC9mb28vYmFyL215LXByb2plY3QvbXktbW9kdWxlYCksIHdoaWNoIGFyZSB1bmFmZmVjdGVkIGJ5IHRoZVxuICAgICAgLy8gICBsb2dpYyBiZWxvdy5cbiAgICAgIC8vIC0gUGF0aHMgdG8gZW50ZXJuYWwgbW9kdWxlcyAoZS5nLiBgc29tZS1saWJgKS5cbiAgICAgIC8vIC0gUGF0aHMgbWFwcGVkIHRvIGRpcmVjdG9yaWVzIGluIGB0c2NvbmZpZy5qc29uYCAoZS5nLiBgc2hhcmVkL215LW1vZHVsZWApLlxuICAgICAgLy8gICAoU2VlIGh0dHBzOi8vd3d3LnR5cGVzY3JpcHRsYW5nLm9yZy9kb2NzL2hhbmRib29rL21vZHVsZS1yZXNvbHV0aW9uLmh0bWwjcGF0aC1tYXBwaW5nLilcbiAgICAgIC8vXG4gICAgICAvLyBJbiBhbGwgY2FzZXMgYWJvdmUsIHRoZSBgY29udGFpbmluZ0ZpbGVgIGFyZ3VtZW50IGlzIGlnbm9yZWQsIHNvIHdlIGNhbiBqdXN0IHRha2UgdGhlIGZpcnN0XG4gICAgICAvLyBvZiB0aGUgcm9vdCBmaWxlcy5cbiAgICAgIGNvbnN0IGNvbnRhaW5pbmdGaWxlID0gdGhpcy50c1Byb2dyYW0uZ2V0Um9vdEZpbGVOYW1lcygpWzBdO1xuICAgICAgY29uc3QgW2VudHJ5UGF0aCwgbW9kdWxlTmFtZV0gPSBlbnRyeVJvdXRlLnNwbGl0KCcjJyk7XG4gICAgICBjb25zdCByZXNvbHZlZE1vZHVsZSA9XG4gICAgICAgICAgcmVzb2x2ZU1vZHVsZU5hbWUoZW50cnlQYXRoLCBjb250YWluaW5nRmlsZSwgdGhpcy5vcHRpb25zLCB0aGlzLmFkYXB0ZXIsIG51bGwpO1xuXG4gICAgICBpZiAocmVzb2x2ZWRNb2R1bGUpIHtcbiAgICAgICAgZW50cnlSb3V0ZSA9IGVudHJ5UG9pbnRLZXlGb3IocmVzb2x2ZWRNb2R1bGUucmVzb2x2ZWRGaWxlTmFtZSwgbW9kdWxlTmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgY29tcGlsYXRpb24gPSB0aGlzLmVuc3VyZUFuYWx5emVkKCk7XG4gICAgcmV0dXJuIGNvbXBpbGF0aW9uLnJvdXRlQW5hbHl6ZXIubGlzdExhenlSb3V0ZXMoZW50cnlSb3V0ZSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggdHJhbnNmb3JtZXJzIGFuZCBvdGhlciBpbmZvcm1hdGlvbiB3aGljaCBpcyBuZWNlc3NhcnkgZm9yIGEgY29uc3VtZXIgdG8gYGVtaXRgIHRoZVxuICAgKiBwcm9ncmFtIHdpdGggQW5ndWxhci1hZGRlZCBkZWZpbml0aW9ucy5cbiAgICovXG4gIHByZXBhcmVFbWl0KCk6IHtcbiAgICB0cmFuc2Zvcm1lcnM6IHRzLkN1c3RvbVRyYW5zZm9ybWVycyxcbiAgfSB7XG4gICAgY29uc3QgY29tcGlsYXRpb24gPSB0aGlzLmVuc3VyZUFuYWx5emVkKCk7XG5cbiAgICBjb25zdCBjb3JlSW1wb3J0c0Zyb20gPSBjb21waWxhdGlvbi5pc0NvcmUgPyBnZXRSM1N5bWJvbHNGaWxlKHRoaXMudHNQcm9ncmFtKSA6IG51bGw7XG4gICAgbGV0IGltcG9ydFJld3JpdGVyOiBJbXBvcnRSZXdyaXRlcjtcbiAgICBpZiAoY29yZUltcG9ydHNGcm9tICE9PSBudWxsKSB7XG4gICAgICBpbXBvcnRSZXdyaXRlciA9IG5ldyBSM1N5bWJvbHNJbXBvcnRSZXdyaXRlcihjb3JlSW1wb3J0c0Zyb20uZmlsZU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbXBvcnRSZXdyaXRlciA9IG5ldyBOb29wSW1wb3J0UmV3cml0ZXIoKTtcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0SW1wb3J0VHJhY2tlciA9IG5ldyBEZWZhdWx0SW1wb3J0VHJhY2tlcigpO1xuXG4gICAgY29uc3QgYmVmb3JlID0gW1xuICAgICAgaXZ5VHJhbnNmb3JtRmFjdG9yeShcbiAgICAgICAgICBjb21waWxhdGlvbi50cmFpdENvbXBpbGVyLCBjb21waWxhdGlvbi5yZWZsZWN0b3IsIGltcG9ydFJld3JpdGVyLCBkZWZhdWx0SW1wb3J0VHJhY2tlcixcbiAgICAgICAgICB0aGlzLmRlbGVnYXRpbmdQZXJmUmVjb3JkZXIsIGNvbXBpbGF0aW9uLmlzQ29yZSwgdGhpcy5jbG9zdXJlQ29tcGlsZXJFbmFibGVkKSxcbiAgICAgIGFsaWFzVHJhbnNmb3JtRmFjdG9yeShjb21waWxhdGlvbi50cmFpdENvbXBpbGVyLmV4cG9ydFN0YXRlbWVudHMpLFxuICAgICAgZGVmYXVsdEltcG9ydFRyYWNrZXIuaW1wb3J0UHJlc2VydmluZ1RyYW5zZm9ybWVyKCksXG4gICAgXTtcblxuICAgIGNvbnN0IGFmdGVyRGVjbGFyYXRpb25zOiB0cy5UcmFuc2Zvcm1lckZhY3Rvcnk8dHMuU291cmNlRmlsZT5bXSA9IFtdO1xuICAgIGlmIChjb21waWxhdGlvbi5kdHNUcmFuc2Zvcm1zICE9PSBudWxsKSB7XG4gICAgICBhZnRlckRlY2xhcmF0aW9ucy5wdXNoKFxuICAgICAgICAgIGRlY2xhcmF0aW9uVHJhbnNmb3JtRmFjdG9yeShjb21waWxhdGlvbi5kdHNUcmFuc2Zvcm1zLCBpbXBvcnRSZXdyaXRlcikpO1xuICAgIH1cblxuICAgIC8vIE9ubHkgYWRkIGFsaWFzaW5nIHJlLWV4cG9ydHMgdG8gdGhlIC5kLnRzIG91dHB1dCBpZiB0aGUgYEFsaWFzaW5nSG9zdGAgcmVxdWVzdHMgaXQuXG4gICAgaWYgKGNvbXBpbGF0aW9uLmFsaWFzaW5nSG9zdCAhPT0gbnVsbCAmJiBjb21waWxhdGlvbi5hbGlhc2luZ0hvc3QuYWxpYXNFeHBvcnRzSW5EdHMpIHtcbiAgICAgIGFmdGVyRGVjbGFyYXRpb25zLnB1c2goYWxpYXNUcmFuc2Zvcm1GYWN0b3J5KGNvbXBpbGF0aW9uLnRyYWl0Q29tcGlsZXIuZXhwb3J0U3RhdGVtZW50cykpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmFkYXB0ZXIuZmFjdG9yeVRyYWNrZXIgIT09IG51bGwpIHtcbiAgICAgIGJlZm9yZS5wdXNoKFxuICAgICAgICAgIGdlbmVyYXRlZEZhY3RvcnlUcmFuc2Zvcm0odGhpcy5hZGFwdGVyLmZhY3RvcnlUcmFja2VyLnNvdXJjZUluZm8sIGltcG9ydFJld3JpdGVyKSk7XG4gICAgfVxuICAgIGJlZm9yZS5wdXNoKGl2eVN3aXRjaFRyYW5zZm9ybSk7XG5cbiAgICByZXR1cm4ge3RyYW5zZm9ybWVyczoge2JlZm9yZSwgYWZ0ZXJEZWNsYXJhdGlvbnN9IGFzIHRzLkN1c3RvbVRyYW5zZm9ybWVyc307XG4gIH1cblxuICAvKipcbiAgICogUnVuIHRoZSBpbmRleGluZyBwcm9jZXNzIGFuZCByZXR1cm4gYSBgTWFwYCBvZiBhbGwgaW5kZXhlZCBjb21wb25lbnRzLlxuICAgKlxuICAgKiBTZWUgdGhlIGBpbmRleGluZ2AgcGFja2FnZSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgKi9cbiAgZ2V0SW5kZXhlZENvbXBvbmVudHMoKTogTWFwPERlY2xhcmF0aW9uTm9kZSwgSW5kZXhlZENvbXBvbmVudD4ge1xuICAgIGNvbnN0IGNvbXBpbGF0aW9uID0gdGhpcy5lbnN1cmVBbmFseXplZCgpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBuZXcgSW5kZXhpbmdDb250ZXh0KCk7XG4gICAgY29tcGlsYXRpb24udHJhaXRDb21waWxlci5pbmRleChjb250ZXh0KTtcbiAgICByZXR1cm4gZ2VuZXJhdGVBbmFseXNpcyhjb250ZXh0KTtcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlQW5hbHl6ZWQodGhpczogTmdDb21waWxlcik6IExhenlDb21waWxhdGlvblN0YXRlIHtcbiAgICBpZiAodGhpcy5jb21waWxhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5hbmFseXplU3luYygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb21waWxhdGlvbiE7XG4gIH1cblxuICBwcml2YXRlIGFuYWx5emVTeW5jKCk6IHZvaWQge1xuICAgIHRoaXMucGVyZlJlY29yZGVyLmluUGhhc2UoUGVyZlBoYXNlLkFuYWx5c2lzLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbXBpbGF0aW9uID0gdGhpcy5tYWtlQ29tcGlsYXRpb24oKTtcbiAgICAgIGZvciAoY29uc3Qgc2Ygb2YgdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgICBpZiAoc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbXBpbGF0aW9uLnRyYWl0Q29tcGlsZXIuYW5hbHl6ZVN5bmMoc2YpO1xuICAgICAgICB0aGlzLnNjYW5Gb3JNd3Aoc2YpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnBlcmZSZWNvcmRlci5tZW1vcnkoUGVyZkNoZWNrcG9pbnQuQW5hbHlzaXMpO1xuXG4gICAgICB0aGlzLnJlc29sdmVDb21waWxhdGlvbih0aGlzLmNvbXBpbGF0aW9uLnRyYWl0Q29tcGlsZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlQ29tcGlsYXRpb24odHJhaXRDb21waWxlcjogVHJhaXRDb21waWxlcik6IHZvaWQge1xuICAgIHRoaXMucGVyZlJlY29yZGVyLmluUGhhc2UoUGVyZlBoYXNlLlJlc29sdmUsICgpID0+IHtcbiAgICAgIHRyYWl0Q29tcGlsZXIucmVzb2x2ZSgpO1xuXG4gICAgICAvLyBBdCB0aGlzIHBvaW50LCBhbmFseXNpcyBpcyBjb21wbGV0ZSBhbmQgdGhlIGNvbXBpbGVyIGNhbiBub3cgY2FsY3VsYXRlIHdoaWNoIGZpbGVzIG5lZWQgdG9cbiAgICAgIC8vIGJlIGVtaXR0ZWQsIHNvIGRvIHRoYXQuXG4gICAgICB0aGlzLmluY3JlbWVudGFsRHJpdmVyLnJlY29yZFN1Y2Nlc3NmdWxBbmFseXNpcyh0cmFpdENvbXBpbGVyKTtcblxuICAgICAgdGhpcy5wZXJmUmVjb3JkZXIubWVtb3J5KFBlcmZDaGVja3BvaW50LlJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgZnVsbFRlbXBsYXRlVHlwZUNoZWNrKCk6IGJvb2xlYW4ge1xuICAgIC8vIERldGVybWluZSB0aGUgc3RyaWN0bmVzcyBsZXZlbCBvZiB0eXBlIGNoZWNraW5nIGJhc2VkIG9uIGNvbXBpbGVyIG9wdGlvbnMuIEFzXG4gICAgLy8gYHN0cmljdFRlbXBsYXRlc2AgaXMgYSBzdXBlcnNldCBvZiBgZnVsbFRlbXBsYXRlVHlwZUNoZWNrYCwgdGhlIGZvcm1lciBpbXBsaWVzIHRoZSBsYXR0ZXIuXG4gICAgLy8gQWxzbyBzZWUgYHZlcmlmeUNvbXBhdGlibGVUeXBlQ2hlY2tPcHRpb25zYCB3aGVyZSBpdCBpcyB2ZXJpZmllZCB0aGF0IGBmdWxsVGVtcGxhdGVUeXBlQ2hlY2tgXG4gICAgLy8gaXMgbm90IGRpc2FibGVkIHdoZW4gYHN0cmljdFRlbXBsYXRlc2AgaXMgZW5hYmxlZC5cbiAgICBjb25zdCBzdHJpY3RUZW1wbGF0ZXMgPSAhIXRoaXMub3B0aW9ucy5zdHJpY3RUZW1wbGF0ZXM7XG4gICAgcmV0dXJuIHN0cmljdFRlbXBsYXRlcyB8fCAhIXRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2s7XG4gIH1cblxuICBwcml2YXRlIGdldFR5cGVDaGVja2luZ0NvbmZpZygpOiBUeXBlQ2hlY2tpbmdDb25maWcge1xuICAgIC8vIERldGVybWluZSB0aGUgc3RyaWN0bmVzcyBsZXZlbCBvZiB0eXBlIGNoZWNraW5nIGJhc2VkIG9uIGNvbXBpbGVyIG9wdGlvbnMuIEFzXG4gICAgLy8gYHN0cmljdFRlbXBsYXRlc2AgaXMgYSBzdXBlcnNldCBvZiBgZnVsbFRlbXBsYXRlVHlwZUNoZWNrYCwgdGhlIGZvcm1lciBpbXBsaWVzIHRoZSBsYXR0ZXIuXG4gICAgLy8gQWxzbyBzZWUgYHZlcmlmeUNvbXBhdGlibGVUeXBlQ2hlY2tPcHRpb25zYCB3aGVyZSBpdCBpcyB2ZXJpZmllZCB0aGF0IGBmdWxsVGVtcGxhdGVUeXBlQ2hlY2tgXG4gICAgLy8gaXMgbm90IGRpc2FibGVkIHdoZW4gYHN0cmljdFRlbXBsYXRlc2AgaXMgZW5hYmxlZC5cbiAgICBjb25zdCBzdHJpY3RUZW1wbGF0ZXMgPSAhIXRoaXMub3B0aW9ucy5zdHJpY3RUZW1wbGF0ZXM7XG5cbiAgICBjb25zdCB1c2VJbmxpbmVUeXBlQ29uc3RydWN0b3JzID0gdGhpcy50eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3kuc3VwcG9ydHNJbmxpbmVPcGVyYXRpb25zO1xuXG4gICAgLy8gRmlyc3Qgc2VsZWN0IGEgdHlwZS1jaGVja2luZyBjb25maWd1cmF0aW9uLCBiYXNlZCBvbiB3aGV0aGVyIGZ1bGwgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBpc1xuICAgIC8vIHJlcXVlc3RlZC5cbiAgICBsZXQgdHlwZUNoZWNraW5nQ29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWc7XG4gICAgaWYgKHRoaXMuZnVsbFRlbXBsYXRlVHlwZUNoZWNrKSB7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcgPSB7XG4gICAgICAgIGFwcGx5VGVtcGxhdGVDb250ZXh0R3VhcmRzOiBzdHJpY3RUZW1wbGF0ZXMsXG4gICAgICAgIGNoZWNrUXVlcmllczogZmFsc2UsXG4gICAgICAgIGNoZWNrVGVtcGxhdGVCb2RpZXM6IHRydWUsXG4gICAgICAgIGFsd2F5c0NoZWNrU2NoZW1hSW5UZW1wbGF0ZUJvZGllczogdHJ1ZSxcbiAgICAgICAgY2hlY2tUeXBlT2ZJbnB1dEJpbmRpbmdzOiBzdHJpY3RUZW1wbGF0ZXMsXG4gICAgICAgIGhvbm9yQWNjZXNzTW9kaWZpZXJzRm9ySW5wdXRCaW5kaW5nczogZmFsc2UsXG4gICAgICAgIHN0cmljdE51bGxJbnB1dEJpbmRpbmdzOiBzdHJpY3RUZW1wbGF0ZXMsXG4gICAgICAgIGNoZWNrVHlwZU9mQXR0cmlidXRlczogc3RyaWN0VGVtcGxhdGVzLFxuICAgICAgICAvLyBFdmVuIGluIGZ1bGwgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBtb2RlLCBET00gYmluZGluZyBjaGVja3MgYXJlIG5vdCBxdWl0ZSByZWFkeSB5ZXQuXG4gICAgICAgIGNoZWNrVHlwZU9mRG9tQmluZGluZ3M6IGZhbHNlLFxuICAgICAgICBjaGVja1R5cGVPZk91dHB1dEV2ZW50czogc3RyaWN0VGVtcGxhdGVzLFxuICAgICAgICBjaGVja1R5cGVPZkFuaW1hdGlvbkV2ZW50czogc3RyaWN0VGVtcGxhdGVzLFxuICAgICAgICAvLyBDaGVja2luZyBvZiBET00gZXZlbnRzIGN1cnJlbnRseSBoYXMgYW4gYWR2ZXJzZSBlZmZlY3Qgb24gZGV2ZWxvcGVyIGV4cGVyaWVuY2UsXG4gICAgICAgIC8vIGUuZy4gZm9yIGA8aW5wdXQgKGJsdXIpPVwidXBkYXRlKCRldmVudC50YXJnZXQudmFsdWUpXCI+YCBlbmFibGluZyB0aGlzIGNoZWNrIHJlc3VsdHMgaW46XG4gICAgICAgIC8vIC0gZXJyb3IgVFMyNTMxOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgICAvLyAtIGVycm9yIFRTMjMzOTogUHJvcGVydHkgJ3ZhbHVlJyBkb2VzIG5vdCBleGlzdCBvbiB0eXBlICdFdmVudFRhcmdldCcuXG4gICAgICAgIGNoZWNrVHlwZU9mRG9tRXZlbnRzOiBzdHJpY3RUZW1wbGF0ZXMsXG4gICAgICAgIGNoZWNrVHlwZU9mRG9tUmVmZXJlbmNlczogc3RyaWN0VGVtcGxhdGVzLFxuICAgICAgICAvLyBOb24tRE9NIHJlZmVyZW5jZXMgaGF2ZSB0aGUgY29ycmVjdCB0eXBlIGluIFZpZXcgRW5naW5lIHNvIHRoZXJlIGlzIG5vIHN0cmljdG5lc3MgZmxhZy5cbiAgICAgICAgY2hlY2tUeXBlT2ZOb25Eb21SZWZlcmVuY2VzOiB0cnVlLFxuICAgICAgICAvLyBQaXBlcyBhcmUgY2hlY2tlZCBpbiBWaWV3IEVuZ2luZSBzbyB0aGVyZSBpcyBubyBzdHJpY3RuZXNzIGZsYWcuXG4gICAgICAgIGNoZWNrVHlwZU9mUGlwZXM6IHRydWUsXG4gICAgICAgIHN0cmljdFNhZmVOYXZpZ2F0aW9uVHlwZXM6IHN0cmljdFRlbXBsYXRlcyxcbiAgICAgICAgdXNlQ29udGV4dEdlbmVyaWNUeXBlOiBzdHJpY3RUZW1wbGF0ZXMsXG4gICAgICAgIHN0cmljdExpdGVyYWxUeXBlczogdHJ1ZSxcbiAgICAgICAgZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcjogdGhpcy5lbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyLFxuICAgICAgICB1c2VJbmxpbmVUeXBlQ29uc3RydWN0b3JzLFxuICAgICAgICAvLyBXYXJuaW5ncyBmb3Igc3Vib3B0aW1hbCB0eXBlIGluZmVyZW5jZSBhcmUgb25seSBlbmFibGVkIGlmIGluIExhbmd1YWdlIFNlcnZpY2UgbW9kZVxuICAgICAgICAvLyAocHJvdmlkaW5nIHRoZSBmdWxsIFRlbXBsYXRlVHlwZUNoZWNrZXIgQVBJKSBhbmQgaWYgc3RyaWN0IG1vZGUgaXMgbm90IGVuYWJsZWQuIEluIHN0cmljdFxuICAgICAgICAvLyBtb2RlLCB0aGUgdXNlciBpcyBpbiBmdWxsIGNvbnRyb2wgb2YgdHlwZSBpbmZlcmVuY2UuXG4gICAgICAgIHN1Z2dlc3Rpb25zRm9yU3Vib3B0aW1hbFR5cGVJbmZlcmVuY2U6IHRoaXMuZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlciAmJiAhc3RyaWN0VGVtcGxhdGVzLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZUNoZWNraW5nQ29uZmlnID0ge1xuICAgICAgICBhcHBseVRlbXBsYXRlQ29udGV4dEd1YXJkczogZmFsc2UsXG4gICAgICAgIGNoZWNrUXVlcmllczogZmFsc2UsXG4gICAgICAgIGNoZWNrVGVtcGxhdGVCb2RpZXM6IGZhbHNlLFxuICAgICAgICAvLyBFbmFibGUgZGVlcCBzY2hlbWEgY2hlY2tpbmcgaW4gXCJiYXNpY1wiIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgbW9kZSBvbmx5IGlmIENsb3N1cmVcbiAgICAgICAgLy8gY29tcGlsYXRpb24gaXMgcmVxdWVzdGVkLCB3aGljaCBpcyBhIGdvb2QgcHJveHkgZm9yIFwib25seSBpbiBnb29nbGUzXCIuXG4gICAgICAgIGFsd2F5c0NoZWNrU2NoZW1hSW5UZW1wbGF0ZUJvZGllczogdGhpcy5jbG9zdXJlQ29tcGlsZXJFbmFibGVkLFxuICAgICAgICBjaGVja1R5cGVPZklucHV0QmluZGluZ3M6IGZhbHNlLFxuICAgICAgICBzdHJpY3ROdWxsSW5wdXRCaW5kaW5nczogZmFsc2UsXG4gICAgICAgIGhvbm9yQWNjZXNzTW9kaWZpZXJzRm9ySW5wdXRCaW5kaW5nczogZmFsc2UsXG4gICAgICAgIGNoZWNrVHlwZU9mQXR0cmlidXRlczogZmFsc2UsXG4gICAgICAgIGNoZWNrVHlwZU9mRG9tQmluZGluZ3M6IGZhbHNlLFxuICAgICAgICBjaGVja1R5cGVPZk91dHB1dEV2ZW50czogZmFsc2UsXG4gICAgICAgIGNoZWNrVHlwZU9mQW5pbWF0aW9uRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgY2hlY2tUeXBlT2ZEb21FdmVudHM6IGZhbHNlLFxuICAgICAgICBjaGVja1R5cGVPZkRvbVJlZmVyZW5jZXM6IGZhbHNlLFxuICAgICAgICBjaGVja1R5cGVPZk5vbkRvbVJlZmVyZW5jZXM6IGZhbHNlLFxuICAgICAgICBjaGVja1R5cGVPZlBpcGVzOiBmYWxzZSxcbiAgICAgICAgc3RyaWN0U2FmZU5hdmlnYXRpb25UeXBlczogZmFsc2UsXG4gICAgICAgIHVzZUNvbnRleHRHZW5lcmljVHlwZTogZmFsc2UsXG4gICAgICAgIHN0cmljdExpdGVyYWxUeXBlczogZmFsc2UsXG4gICAgICAgIGVuYWJsZVRlbXBsYXRlVHlwZUNoZWNrZXI6IHRoaXMuZW5hYmxlVGVtcGxhdGVUeXBlQ2hlY2tlcixcbiAgICAgICAgdXNlSW5saW5lVHlwZUNvbnN0cnVjdG9ycyxcbiAgICAgICAgLy8gSW4gXCJiYXNpY1wiIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgbW9kZSwgbm8gd2FybmluZ3MgYXJlIHByb2R1Y2VkIHNpbmNlIG1vc3QgdGhpbmdzIGFyZVxuICAgICAgICAvLyBub3QgY2hlY2tlZCBhbnl3YXlzLlxuICAgICAgICBzdWdnZXN0aW9uc0ZvclN1Ym9wdGltYWxUeXBlSW5mZXJlbmNlOiBmYWxzZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgZXhwbGljaXRseSBjb25maWd1cmVkIHN0cmljdG5lc3MgZmxhZ3Mgb24gdG9wIG9mIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb25cbiAgICAvLyBiYXNlZCBvbiBcImZ1bGxUZW1wbGF0ZVR5cGVDaGVja1wiLlxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RyaWN0SW5wdXRUeXBlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcuY2hlY2tUeXBlT2ZJbnB1dEJpbmRpbmdzID0gdGhpcy5vcHRpb25zLnN0cmljdElucHV0VHlwZXM7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcuYXBwbHlUZW1wbGF0ZUNvbnRleHRHdWFyZHMgPSB0aGlzLm9wdGlvbnMuc3RyaWN0SW5wdXRUeXBlcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdHJpY3RJbnB1dEFjY2Vzc01vZGlmaWVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcuaG9ub3JBY2Nlc3NNb2RpZmllcnNGb3JJbnB1dEJpbmRpbmdzID1cbiAgICAgICAgICB0aGlzLm9wdGlvbnMuc3RyaWN0SW5wdXRBY2Nlc3NNb2RpZmllcnM7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RyaWN0TnVsbElucHV0VHlwZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHlwZUNoZWNraW5nQ29uZmlnLnN0cmljdE51bGxJbnB1dEJpbmRpbmdzID0gdGhpcy5vcHRpb25zLnN0cmljdE51bGxJbnB1dFR5cGVzO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnN0cmljdE91dHB1dEV2ZW50VHlwZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHlwZUNoZWNraW5nQ29uZmlnLmNoZWNrVHlwZU9mT3V0cHV0RXZlbnRzID0gdGhpcy5vcHRpb25zLnN0cmljdE91dHB1dEV2ZW50VHlwZXM7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcuY2hlY2tUeXBlT2ZBbmltYXRpb25FdmVudHMgPSB0aGlzLm9wdGlvbnMuc3RyaWN0T3V0cHV0RXZlbnRUeXBlcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdHJpY3REb21FdmVudFR5cGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHR5cGVDaGVja2luZ0NvbmZpZy5jaGVja1R5cGVPZkRvbUV2ZW50cyA9IHRoaXMub3B0aW9ucy5zdHJpY3REb21FdmVudFR5cGVzO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnN0cmljdFNhZmVOYXZpZ2F0aW9uVHlwZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHlwZUNoZWNraW5nQ29uZmlnLnN0cmljdFNhZmVOYXZpZ2F0aW9uVHlwZXMgPSB0aGlzLm9wdGlvbnMuc3RyaWN0U2FmZU5hdmlnYXRpb25UeXBlcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdHJpY3REb21Mb2NhbFJlZlR5cGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHR5cGVDaGVja2luZ0NvbmZpZy5jaGVja1R5cGVPZkRvbVJlZmVyZW5jZXMgPSB0aGlzLm9wdGlvbnMuc3RyaWN0RG9tTG9jYWxSZWZUeXBlcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdHJpY3RBdHRyaWJ1dGVUeXBlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcuY2hlY2tUeXBlT2ZBdHRyaWJ1dGVzID0gdGhpcy5vcHRpb25zLnN0cmljdEF0dHJpYnV0ZVR5cGVzO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnN0cmljdENvbnRleHRHZW5lcmljcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0eXBlQ2hlY2tpbmdDb25maWcudXNlQ29udGV4dEdlbmVyaWNUeXBlID0gdGhpcy5vcHRpb25zLnN0cmljdENvbnRleHRHZW5lcmljcztcbiAgICB9XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdHJpY3RMaXRlcmFsVHlwZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHlwZUNoZWNraW5nQ29uZmlnLnN0cmljdExpdGVyYWxUeXBlcyA9IHRoaXMub3B0aW9ucy5zdHJpY3RMaXRlcmFsVHlwZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHR5cGVDaGVja2luZ0NvbmZpZztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VGVtcGxhdGVEaWFnbm9zdGljcygpOiBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWM+IHtcbiAgICBjb25zdCBjb21waWxhdGlvbiA9IHRoaXMuZW5zdXJlQW5hbHl6ZWQoKTtcblxuICAgIC8vIEdldCB0aGUgZGlhZ25vc3RpY3MuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGZvciAoY29uc3Qgc2Ygb2YgdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKSkge1xuICAgICAgaWYgKHNmLmlzRGVjbGFyYXRpb25GaWxlIHx8IHRoaXMuYWRhcHRlci5pc1NoaW0oc2YpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBkaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIC4uLmNvbXBpbGF0aW9uLnRlbXBsYXRlVHlwZUNoZWNrZXIuZ2V0RGlhZ25vc3RpY3NGb3JGaWxlKHNmLCBPcHRpbWl6ZUZvci5XaG9sZVByb2dyYW0pKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9ncmFtID0gdGhpcy50eXBlQ2hlY2tpbmdQcm9ncmFtU3RyYXRlZ3kuZ2V0UHJvZ3JhbSgpO1xuICAgIHRoaXMuaW5jcmVtZW50YWxTdHJhdGVneS5zZXRJbmNyZW1lbnRhbERyaXZlcih0aGlzLmluY3JlbWVudGFsRHJpdmVyLCBwcm9ncmFtKTtcbiAgICB0aGlzLm5leHRQcm9ncmFtID0gcHJvZ3JhbTtcblxuICAgIHJldHVybiBkaWFnbm9zdGljcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0VGVtcGxhdGVEaWFnbm9zdGljc0ZvckZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUsIG9wdGltaXplRm9yOiBPcHRpbWl6ZUZvcik6XG4gICAgICBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWM+IHtcbiAgICBjb25zdCBjb21waWxhdGlvbiA9IHRoaXMuZW5zdXJlQW5hbHl6ZWQoKTtcblxuICAgIC8vIEdldCB0aGUgZGlhZ25vc3RpY3MuXG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGlmICghc2YuaXNEZWNsYXJhdGlvbkZpbGUgJiYgIXRoaXMuYWRhcHRlci5pc1NoaW0oc2YpKSB7XG4gICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLmNvbXBpbGF0aW9uLnRlbXBsYXRlVHlwZUNoZWNrZXIuZ2V0RGlhZ25vc3RpY3NGb3JGaWxlKHNmLCBvcHRpbWl6ZUZvcikpO1xuICAgIH1cblxuICAgIGNvbnN0IHByb2dyYW0gPSB0aGlzLnR5cGVDaGVja2luZ1Byb2dyYW1TdHJhdGVneS5nZXRQcm9ncmFtKCk7XG4gICAgdGhpcy5pbmNyZW1lbnRhbFN0cmF0ZWd5LnNldEluY3JlbWVudGFsRHJpdmVyKHRoaXMuaW5jcmVtZW50YWxEcml2ZXIsIHByb2dyYW0pO1xuICAgIHRoaXMubmV4dFByb2dyYW0gPSBwcm9ncmFtO1xuXG4gICAgcmV0dXJuIGRpYWdub3N0aWNzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXROb25UZW1wbGF0ZURpYWdub3N0aWNzKCk6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgaWYgKHRoaXMubm9uVGVtcGxhdGVEaWFnbm9zdGljcyA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgY29tcGlsYXRpb24gPSB0aGlzLmVuc3VyZUFuYWx5emVkKCk7XG4gICAgICB0aGlzLm5vblRlbXBsYXRlRGlhZ25vc3RpY3MgPSBbLi4uY29tcGlsYXRpb24udHJhaXRDb21waWxlci5kaWFnbm9zdGljc107XG4gICAgICBpZiAodGhpcy5lbnRyeVBvaW50ICE9PSBudWxsICYmIGNvbXBpbGF0aW9uLmV4cG9ydFJlZmVyZW5jZUdyYXBoICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubm9uVGVtcGxhdGVEaWFnbm9zdGljcy5wdXNoKC4uLmNoZWNrRm9yUHJpdmF0ZUV4cG9ydHMoXG4gICAgICAgICAgICB0aGlzLmVudHJ5UG9pbnQsIHRoaXMudHNQcm9ncmFtLmdldFR5cGVDaGVja2VyKCksIGNvbXBpbGF0aW9uLmV4cG9ydFJlZmVyZW5jZUdyYXBoKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLm5vblRlbXBsYXRlRGlhZ25vc3RpY3M7XG4gIH1cblxuICBwcml2YXRlIHNjYW5Gb3JNd3Aoc2Y6IHRzLlNvdXJjZUZpbGUpOiB2b2lkIHtcbiAgICB0aGlzLmNvbXBpbGF0aW9uIS5td3BTY2FubmVyLnNjYW4oc2YsIHtcbiAgICAgIGFkZFR5cGVSZXBsYWNlbWVudDogKG5vZGU6IHRzLkRlY2xhcmF0aW9uLCB0eXBlOiBUeXBlKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIE9ubHkgb2J0YWluIHRoZSByZXR1cm4gdHlwZSB0cmFuc2Zvcm0gZm9yIHRoZSBzb3VyY2UgZmlsZSBvbmNlIHRoZXJlJ3MgYSB0eXBlIHRvIHJlcGxhY2UsXG4gICAgICAgIC8vIHNvIHRoYXQgbm8gdHJhbnNmb3JtIGlzIGFsbG9jYXRlZCB3aGVuIHRoZXJlJ3Mgbm90aGluZyB0byBkby5cbiAgICAgICAgdGhpcy5jb21waWxhdGlvbiEuZHRzVHJhbnNmb3JtcyEuZ2V0UmV0dXJuVHlwZVRyYW5zZm9ybShzZikuYWRkVHlwZVJlcGxhY2VtZW50KG5vZGUsIHR5cGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBtYWtlQ29tcGlsYXRpb24oKTogTGF6eUNvbXBpbGF0aW9uU3RhdGUge1xuICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLnRzUHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuXG4gICAgY29uc3QgcmVmbGVjdG9yID0gbmV3IFR5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdChjaGVja2VyKTtcblxuICAgIC8vIENvbnN0cnVjdCB0aGUgUmVmZXJlbmNlRW1pdHRlci5cbiAgICBsZXQgcmVmRW1pdHRlcjogUmVmZXJlbmNlRW1pdHRlcjtcbiAgICBsZXQgYWxpYXNpbmdIb3N0OiBBbGlhc2luZ0hvc3R8bnVsbCA9IG51bGw7XG4gICAgaWYgKHRoaXMuYWRhcHRlci51bmlmaWVkTW9kdWxlc0hvc3QgPT09IG51bGwgfHwgIXRoaXMub3B0aW9ucy5fdXNlSG9zdEZvckltcG9ydEdlbmVyYXRpb24pIHtcbiAgICAgIGxldCBsb2NhbEltcG9ydFN0cmF0ZWd5OiBSZWZlcmVuY2VFbWl0U3RyYXRlZ3k7XG5cbiAgICAgIC8vIFRoZSBzdHJhdGVneSB1c2VkIGZvciBsb2NhbCwgaW4tcHJvamVjdCBpbXBvcnRzIGRlcGVuZHMgb24gd2hldGhlciBUUyBoYXMgYmVlbiBjb25maWd1cmVkXG4gICAgICAvLyB3aXRoIHJvb3REaXJzLiBJZiBzbywgdGhlbiBtdWx0aXBsZSBkaXJlY3RvcmllcyBtYXkgYmUgbWFwcGVkIGluIHRoZSBzYW1lIFwibW9kdWxlXG4gICAgICAvLyBuYW1lc3BhY2VcIiBhbmQgdGhlIGxvZ2ljIG9mIGBMb2dpY2FsUHJvamVjdFN0cmF0ZWd5YCBpcyByZXF1aXJlZCB0byBnZW5lcmF0ZSBjb3JyZWN0XG4gICAgICAvLyBpbXBvcnRzIHdoaWNoIG1heSBjcm9zcyB0aGVzZSBtdWx0aXBsZSBkaXJlY3Rvcmllcy4gT3RoZXJ3aXNlLCBwbGFpbiByZWxhdGl2ZSBpbXBvcnRzIGFyZVxuICAgICAgLy8gc3VmZmljaWVudC5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucm9vdERpciAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgKHRoaXMub3B0aW9ucy5yb290RGlycyAhPT0gdW5kZWZpbmVkICYmIHRoaXMub3B0aW9ucy5yb290RGlycy5sZW5ndGggPiAwKSkge1xuICAgICAgICAvLyByb290RGlycyBsb2dpYyBpcyBpbiBlZmZlY3QgLSB1c2UgdGhlIGBMb2dpY2FsUHJvamVjdFN0cmF0ZWd5YCBmb3IgaW4tcHJvamVjdCByZWxhdGl2ZVxuICAgICAgICAvLyBpbXBvcnRzLlxuICAgICAgICBsb2NhbEltcG9ydFN0cmF0ZWd5ID0gbmV3IExvZ2ljYWxQcm9qZWN0U3RyYXRlZ3koXG4gICAgICAgICAgICByZWZsZWN0b3IsIG5ldyBMb2dpY2FsRmlsZVN5c3RlbShbLi4udGhpcy5hZGFwdGVyLnJvb3REaXJzXSwgdGhpcy5hZGFwdGVyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBQbGFpbiByZWxhdGl2ZSBpbXBvcnRzIGFyZSBhbGwgdGhhdCdzIG5lZWRlZC5cbiAgICAgICAgbG9jYWxJbXBvcnRTdHJhdGVneSA9IG5ldyBSZWxhdGl2ZVBhdGhTdHJhdGVneShyZWZsZWN0b3IpO1xuICAgICAgfVxuXG4gICAgICAvLyBUaGUgQ29tcGlsZXJIb3N0IGRvZXNuJ3QgaGF2ZSBmaWxlTmFtZVRvTW9kdWxlTmFtZSwgc28gYnVpbGQgYW4gTlBNLWNlbnRyaWMgcmVmZXJlbmNlXG4gICAgICAvLyByZXNvbHV0aW9uIHN0cmF0ZWd5LlxuICAgICAgcmVmRW1pdHRlciA9IG5ldyBSZWZlcmVuY2VFbWl0dGVyKFtcbiAgICAgICAgLy8gRmlyc3QsIHRyeSB0byB1c2UgbG9jYWwgaWRlbnRpZmllcnMgaWYgYXZhaWxhYmxlLlxuICAgICAgICBuZXcgTG9jYWxJZGVudGlmaWVyU3RyYXRlZ3koKSxcbiAgICAgICAgLy8gTmV4dCwgYXR0ZW1wdCB0byB1c2UgYW4gYWJzb2x1dGUgaW1wb3J0LlxuICAgICAgICBuZXcgQWJzb2x1dGVNb2R1bGVTdHJhdGVneSh0aGlzLnRzUHJvZ3JhbSwgY2hlY2tlciwgdGhpcy5tb2R1bGVSZXNvbHZlciwgcmVmbGVjdG9yKSxcbiAgICAgICAgLy8gRmluYWxseSwgY2hlY2sgaWYgdGhlIHJlZmVyZW5jZSBpcyBiZWluZyB3cml0dGVuIGludG8gYSBmaWxlIHdpdGhpbiB0aGUgcHJvamVjdCdzIC50c1xuICAgICAgICAvLyBzb3VyY2VzLCBhbmQgdXNlIGEgcmVsYXRpdmUgaW1wb3J0IGlmIHNvLiBJZiB0aGlzIGZhaWxzLCBSZWZlcmVuY2VFbWl0dGVyIHdpbGwgdGhyb3dcbiAgICAgICAgLy8gYW4gZXJyb3IuXG4gICAgICAgIGxvY2FsSW1wb3J0U3RyYXRlZ3ksXG4gICAgICBdKTtcblxuICAgICAgLy8gSWYgYW4gZW50cnlwb2ludCBpcyBwcmVzZW50LCB0aGVuIGFsbCB1c2VyIGltcG9ydHMgc2hvdWxkIGJlIGRpcmVjdGVkIHRocm91Z2ggdGhlXG4gICAgICAvLyBlbnRyeXBvaW50IGFuZCBwcml2YXRlIGV4cG9ydHMgYXJlIG5vdCBuZWVkZWQuIFRoZSBjb21waWxlciB3aWxsIHZhbGlkYXRlIHRoYXQgYWxsIHB1YmxpY2x5XG4gICAgICAvLyB2aXNpYmxlIGRpcmVjdGl2ZXMvcGlwZXMgYXJlIGltcG9ydGFibGUgdmlhIHRoaXMgZW50cnlwb2ludC5cbiAgICAgIGlmICh0aGlzLmVudHJ5UG9pbnQgPT09IG51bGwgJiYgdGhpcy5vcHRpb25zLmdlbmVyYXRlRGVlcFJlZXhwb3J0cyA9PT0gdHJ1ZSkge1xuICAgICAgICAvLyBObyBlbnRyeXBvaW50IGlzIHByZXNlbnQgYW5kIGRlZXAgcmUtZXhwb3J0cyB3ZXJlIHJlcXVlc3RlZCwgc28gY29uZmlndXJlIHRoZSBhbGlhc2luZ1xuICAgICAgICAvLyBzeXN0ZW0gdG8gZ2VuZXJhdGUgdGhlbS5cbiAgICAgICAgYWxpYXNpbmdIb3N0ID0gbmV3IFByaXZhdGVFeHBvcnRBbGlhc2luZ0hvc3QocmVmbGVjdG9yKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIENvbXBpbGVySG9zdCBzdXBwb3J0cyBmaWxlTmFtZVRvTW9kdWxlTmFtZSwgc28gdXNlIHRoYXQgdG8gZW1pdCBpbXBvcnRzLlxuICAgICAgcmVmRW1pdHRlciA9IG5ldyBSZWZlcmVuY2VFbWl0dGVyKFtcbiAgICAgICAgLy8gRmlyc3QsIHRyeSB0byB1c2UgbG9jYWwgaWRlbnRpZmllcnMgaWYgYXZhaWxhYmxlLlxuICAgICAgICBuZXcgTG9jYWxJZGVudGlmaWVyU3RyYXRlZ3koKSxcbiAgICAgICAgLy8gVGhlbiB1c2UgYWxpYXNlZCByZWZlcmVuY2VzICh0aGlzIGlzIGEgd29ya2Fyb3VuZCB0byBTdHJpY3REZXBzIGNoZWNrcykuXG4gICAgICAgIG5ldyBBbGlhc1N0cmF0ZWd5KCksXG4gICAgICAgIC8vIFRoZW4gdXNlIGZpbGVOYW1lVG9Nb2R1bGVOYW1lIHRvIGVtaXQgaW1wb3J0cy5cbiAgICAgICAgbmV3IFVuaWZpZWRNb2R1bGVzU3RyYXRlZ3kocmVmbGVjdG9yLCB0aGlzLmFkYXB0ZXIudW5pZmllZE1vZHVsZXNIb3N0KSxcbiAgICAgIF0pO1xuICAgICAgYWxpYXNpbmdIb3N0ID0gbmV3IFVuaWZpZWRNb2R1bGVzQWxpYXNpbmdIb3N0KHRoaXMuYWRhcHRlci51bmlmaWVkTW9kdWxlc0hvc3QpO1xuICAgIH1cblxuICAgIGNvbnN0IGV2YWx1YXRvciA9IG5ldyBQYXJ0aWFsRXZhbHVhdG9yKHJlZmxlY3RvciwgY2hlY2tlciwgdGhpcy5pbmNyZW1lbnRhbERyaXZlci5kZXBHcmFwaCk7XG4gICAgY29uc3QgZHRzUmVhZGVyID0gbmV3IER0c01ldGFkYXRhUmVhZGVyKGNoZWNrZXIsIHJlZmxlY3Rvcik7XG4gICAgY29uc3QgbG9jYWxNZXRhUmVnaXN0cnkgPSBuZXcgTG9jYWxNZXRhZGF0YVJlZ2lzdHJ5KCk7XG4gICAgY29uc3QgbG9jYWxNZXRhUmVhZGVyOiBNZXRhZGF0YVJlYWRlciA9IGxvY2FsTWV0YVJlZ2lzdHJ5O1xuICAgIGNvbnN0IGRlcFNjb3BlUmVhZGVyID0gbmV3IE1ldGFkYXRhRHRzTW9kdWxlU2NvcGVSZXNvbHZlcihkdHNSZWFkZXIsIGFsaWFzaW5nSG9zdCk7XG4gICAgY29uc3Qgc2NvcGVSZWdpc3RyeSA9XG4gICAgICAgIG5ldyBMb2NhbE1vZHVsZVNjb3BlUmVnaXN0cnkobG9jYWxNZXRhUmVhZGVyLCBkZXBTY29wZVJlYWRlciwgcmVmRW1pdHRlciwgYWxpYXNpbmdIb3N0KTtcbiAgICBjb25zdCBzY29wZVJlYWRlcjogQ29tcG9uZW50U2NvcGVSZWFkZXIgPSBzY29wZVJlZ2lzdHJ5O1xuICAgIGNvbnN0IHNlbWFudGljRGVwR3JhcGhVcGRhdGVyID0gdGhpcy5pbmNyZW1lbnRhbERyaXZlci5nZXRTZW1hbnRpY0RlcEdyYXBoVXBkYXRlcigpO1xuICAgIGNvbnN0IG1ldGFSZWdpc3RyeSA9IG5ldyBDb21wb3VuZE1ldGFkYXRhUmVnaXN0cnkoW2xvY2FsTWV0YVJlZ2lzdHJ5LCBzY29wZVJlZ2lzdHJ5XSk7XG4gICAgY29uc3QgaW5qZWN0YWJsZVJlZ2lzdHJ5ID0gbmV3IEluamVjdGFibGVDbGFzc1JlZ2lzdHJ5KHJlZmxlY3Rvcik7XG5cbiAgICBjb25zdCBtZXRhUmVhZGVyID0gbmV3IENvbXBvdW5kTWV0YWRhdGFSZWFkZXIoW2xvY2FsTWV0YVJlYWRlciwgZHRzUmVhZGVyXSk7XG4gICAgY29uc3QgdHlwZUNoZWNrU2NvcGVSZWdpc3RyeSA9IG5ldyBUeXBlQ2hlY2tTY29wZVJlZ2lzdHJ5KHNjb3BlUmVhZGVyLCBtZXRhUmVhZGVyKTtcblxuXG4gICAgLy8gSWYgYSBmbGF0IG1vZHVsZSBlbnRyeXBvaW50IHdhcyBzcGVjaWZpZWQsIHRoZW4gdHJhY2sgcmVmZXJlbmNlcyB2aWEgYSBgUmVmZXJlbmNlR3JhcGhgIGluXG4gICAgLy8gb3JkZXIgdG8gcHJvZHVjZSBwcm9wZXIgZGlhZ25vc3RpY3MgZm9yIGluY29ycmVjdGx5IGV4cG9ydGVkIGRpcmVjdGl2ZXMvcGlwZXMvZXRjLiBJZiB0aGVyZVxuICAgIC8vIGlzIG5vIGZsYXQgbW9kdWxlIGVudHJ5cG9pbnQgdGhlbiBkb24ndCBwYXkgdGhlIGNvc3Qgb2YgdHJhY2tpbmcgcmVmZXJlbmNlcy5cbiAgICBsZXQgcmVmZXJlbmNlc1JlZ2lzdHJ5OiBSZWZlcmVuY2VzUmVnaXN0cnk7XG4gICAgbGV0IGV4cG9ydFJlZmVyZW5jZUdyYXBoOiBSZWZlcmVuY2VHcmFwaHxudWxsID0gbnVsbDtcbiAgICBpZiAodGhpcy5lbnRyeVBvaW50ICE9PSBudWxsKSB7XG4gICAgICBleHBvcnRSZWZlcmVuY2VHcmFwaCA9IG5ldyBSZWZlcmVuY2VHcmFwaCgpO1xuICAgICAgcmVmZXJlbmNlc1JlZ2lzdHJ5ID0gbmV3IFJlZmVyZW5jZUdyYXBoQWRhcHRlcihleHBvcnRSZWZlcmVuY2VHcmFwaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZmVyZW5jZXNSZWdpc3RyeSA9IG5ldyBOb29wUmVmZXJlbmNlc1JlZ2lzdHJ5KCk7XG4gICAgfVxuXG4gICAgY29uc3Qgcm91dGVBbmFseXplciA9IG5ldyBOZ01vZHVsZVJvdXRlQW5hbHl6ZXIodGhpcy5tb2R1bGVSZXNvbHZlciwgZXZhbHVhdG9yKTtcblxuICAgIGNvbnN0IGR0c1RyYW5zZm9ybXMgPSBuZXcgRHRzVHJhbnNmb3JtUmVnaXN0cnkoKTtcblxuICAgIGNvbnN0IG13cFNjYW5uZXIgPSBuZXcgTW9kdWxlV2l0aFByb3ZpZGVyc1NjYW5uZXIocmVmbGVjdG9yLCBldmFsdWF0b3IsIHJlZkVtaXR0ZXIpO1xuXG4gICAgY29uc3QgaXNDb3JlID0gaXNBbmd1bGFyQ29yZVBhY2thZ2UodGhpcy50c1Byb2dyYW0pO1xuXG4gICAgY29uc3QgcmVzb3VyY2VSZWdpc3RyeSA9IG5ldyBSZXNvdXJjZVJlZ2lzdHJ5KCk7XG5cbiAgICBjb25zdCBjb21waWxhdGlvbk1vZGUgPVxuICAgICAgICB0aGlzLm9wdGlvbnMuY29tcGlsYXRpb25Nb2RlID09PSAncGFydGlhbCcgPyBDb21waWxhdGlvbk1vZGUuUEFSVElBTCA6IENvbXBpbGF0aW9uTW9kZS5GVUxMO1xuXG4gICAgLy8gQ3ljbGVzIGFyZSBoYW5kbGVkIGluIGZ1bGwgY29tcGlsYXRpb24gbW9kZSBieSBcInJlbW90ZSBzY29waW5nXCIuXG4gICAgLy8gXCJSZW1vdGUgc2NvcGluZ1wiIGRvZXMgbm90IHdvcmsgd2VsbCB3aXRoIHRyZWUgc2hha2luZyBmb3IgbGlicmFyaWVzLlxuICAgIC8vIFNvIGluIHBhcnRpYWwgY29tcGlsYXRpb24gbW9kZSwgd2hlbiBidWlsZGluZyBhIGxpYnJhcnksIGEgY3ljbGUgd2lsbCBjYXVzZSBhbiBlcnJvci5cbiAgICBjb25zdCBjeWNsZUhhbmRsaW5nU3RyYXRlZ3kgPSBjb21waWxhdGlvbk1vZGUgPT09IENvbXBpbGF0aW9uTW9kZS5GVUxMID9cbiAgICAgICAgQ3ljbGVIYW5kbGluZ1N0cmF0ZWd5LlVzZVJlbW90ZVNjb3BpbmcgOlxuICAgICAgICBDeWNsZUhhbmRsaW5nU3RyYXRlZ3kuRXJyb3I7XG5cbiAgICAvLyBTZXQgdXAgdGhlIEl2eUNvbXBpbGF0aW9uLCB3aGljaCBtYW5hZ2VzIHN0YXRlIGZvciB0aGUgSXZ5IHRyYW5zZm9ybWVyLlxuICAgIGNvbnN0IGhhbmRsZXJzOiBEZWNvcmF0b3JIYW5kbGVyPHVua25vd24sIHVua25vd24sIFNlbWFudGljU3ltYm9sfG51bGwsIHVua25vd24+W10gPSBbXG4gICAgICBuZXcgQ29tcG9uZW50RGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgICByZWZsZWN0b3IsIGV2YWx1YXRvciwgbWV0YVJlZ2lzdHJ5LCBtZXRhUmVhZGVyLCBzY29wZVJlYWRlciwgc2NvcGVSZWdpc3RyeSxcbiAgICAgICAgICB0eXBlQ2hlY2tTY29wZVJlZ2lzdHJ5LCByZXNvdXJjZVJlZ2lzdHJ5LCBpc0NvcmUsIHRoaXMucmVzb3VyY2VNYW5hZ2VyLFxuICAgICAgICAgIHRoaXMuYWRhcHRlci5yb290RGlycywgdGhpcy5vcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMgfHwgZmFsc2UsXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmkxOG5Vc2VFeHRlcm5hbElkcyAhPT0gZmFsc2UsXG4gICAgICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXQgIT09IGZhbHNlLCB0aGlzLnVzZVBvaXNvbmVkRGF0YSxcbiAgICAgICAgICB0aGlzLm9wdGlvbnMuaTE4bk5vcm1hbGl6ZUxpbmVFbmRpbmdzSW5JQ1VzLCB0aGlzLm1vZHVsZVJlc29sdmVyLCB0aGlzLmN5Y2xlQW5hbHl6ZXIsXG4gICAgICAgICAgY3ljbGVIYW5kbGluZ1N0cmF0ZWd5LCByZWZFbWl0dGVyLCB0aGlzLmluY3JlbWVudGFsRHJpdmVyLmRlcEdyYXBoLCBpbmplY3RhYmxlUmVnaXN0cnksXG4gICAgICAgICAgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIsIHRoaXMuY2xvc3VyZUNvbXBpbGVyRW5hYmxlZCwgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyKSxcblxuICAgICAgLy8gVE9ETyhhbHhodWIpOiB1bmRlcnN0YW5kIHdoeSB0aGUgY2FzdCBoZXJlIGlzIG5lY2Vzc2FyeSAoc29tZXRoaW5nIHRvIGRvIHdpdGggYG51bGxgXG4gICAgICAvLyBub3QgYmVpbmcgYXNzaWduYWJsZSB0byBgdW5rbm93bmAgd2hlbiB3cmFwcGVkIGluIGBSZWFkb25seWApLlxuICAgICAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICAgICAgICBuZXcgRGlyZWN0aXZlRGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgICAgIHJlZmxlY3RvciwgZXZhbHVhdG9yLCBtZXRhUmVnaXN0cnksIHNjb3BlUmVnaXN0cnksIG1ldGFSZWFkZXIsXG4gICAgICAgICAgICBpbmplY3RhYmxlUmVnaXN0cnksIGlzQ29yZSwgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIsXG4gICAgICAgICAgdGhpcy5jbG9zdXJlQ29tcGlsZXJFbmFibGVkLCBjb21waWxlVW5kZWNvcmF0ZWRDbGFzc2VzV2l0aEFuZ3VsYXJGZWF0dXJlcyxcbiAgICAgICAgICB0aGlzLmRlbGVnYXRpbmdQZXJmUmVjb3JkZXIsXG4gICAgICAgICkgYXMgUmVhZG9ubHk8RGVjb3JhdG9ySGFuZGxlcjx1bmtub3duLCB1bmtub3duLCBTZW1hbnRpY1N5bWJvbCB8IG51bGwsdW5rbm93bj4+LFxuICAgICAgLy8gY2xhbmctZm9ybWF0IG9uXG4gICAgICAvLyBQaXBlIGhhbmRsZXIgbXVzdCBiZSBiZWZvcmUgaW5qZWN0YWJsZSBoYW5kbGVyIGluIGxpc3Qgc28gcGlwZSBmYWN0b3JpZXMgYXJlIHByaW50ZWRcbiAgICAgIC8vIGJlZm9yZSBpbmplY3RhYmxlIGZhY3RvcmllcyAoc28gaW5qZWN0YWJsZSBmYWN0b3JpZXMgY2FuIGRlbGVnYXRlIHRvIHRoZW0pXG4gICAgICBuZXcgUGlwZURlY29yYXRvckhhbmRsZXIoXG4gICAgICAgICAgcmVmbGVjdG9yLCBldmFsdWF0b3IsIG1ldGFSZWdpc3RyeSwgc2NvcGVSZWdpc3RyeSwgaW5qZWN0YWJsZVJlZ2lzdHJ5LCBpc0NvcmUsXG4gICAgICAgICAgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyKSxcbiAgICAgIG5ldyBJbmplY3RhYmxlRGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgICByZWZsZWN0b3IsIGlzQ29yZSwgdGhpcy5vcHRpb25zLnN0cmljdEluamVjdGlvblBhcmFtZXRlcnMgfHwgZmFsc2UsIGluamVjdGFibGVSZWdpc3RyeSxcbiAgICAgICAgICB0aGlzLmRlbGVnYXRpbmdQZXJmUmVjb3JkZXIpLFxuICAgICAgbmV3IE5nTW9kdWxlRGVjb3JhdG9ySGFuZGxlcihcbiAgICAgICAgICByZWZsZWN0b3IsIGV2YWx1YXRvciwgbWV0YVJlYWRlciwgbWV0YVJlZ2lzdHJ5LCBzY29wZVJlZ2lzdHJ5LCByZWZlcmVuY2VzUmVnaXN0cnksIGlzQ29yZSxcbiAgICAgICAgICByb3V0ZUFuYWx5emVyLCByZWZFbWl0dGVyLCB0aGlzLmFkYXB0ZXIuZmFjdG9yeVRyYWNrZXIsIHRoaXMuY2xvc3VyZUNvbXBpbGVyRW5hYmxlZCxcbiAgICAgICAgICBpbmplY3RhYmxlUmVnaXN0cnksIHRoaXMuZGVsZWdhdGluZ1BlcmZSZWNvcmRlciwgdGhpcy5vcHRpb25zLmkxOG5JbkxvY2FsZSksXG4gICAgXTtcblxuICAgIGNvbnN0IHRyYWl0Q29tcGlsZXIgPSBuZXcgVHJhaXRDb21waWxlcihcbiAgICAgICAgaGFuZGxlcnMsIHJlZmxlY3RvciwgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyLCB0aGlzLmluY3JlbWVudGFsRHJpdmVyLFxuICAgICAgICB0aGlzLm9wdGlvbnMuY29tcGlsZU5vbkV4cG9ydGVkQ2xhc3NlcyAhPT0gZmFsc2UsIGNvbXBpbGF0aW9uTW9kZSwgZHRzVHJhbnNmb3JtcyxcbiAgICAgICAgc2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIpO1xuXG4gICAgY29uc3QgdGVtcGxhdGVUeXBlQ2hlY2tlciA9IG5ldyBUZW1wbGF0ZVR5cGVDaGVja2VySW1wbChcbiAgICAgICAgdGhpcy50c1Byb2dyYW0sIHRoaXMudHlwZUNoZWNraW5nUHJvZ3JhbVN0cmF0ZWd5LCB0cmFpdENvbXBpbGVyLFxuICAgICAgICB0aGlzLmdldFR5cGVDaGVja2luZ0NvbmZpZygpLCByZWZFbWl0dGVyLCByZWZsZWN0b3IsIHRoaXMuYWRhcHRlciwgdGhpcy5pbmNyZW1lbnRhbERyaXZlcixcbiAgICAgICAgc2NvcGVSZWdpc3RyeSwgdHlwZUNoZWNrU2NvcGVSZWdpc3RyeSwgdGhpcy5kZWxlZ2F0aW5nUGVyZlJlY29yZGVyKTtcblxuICAgIHJldHVybiB7XG4gICAgICBpc0NvcmUsXG4gICAgICB0cmFpdENvbXBpbGVyLFxuICAgICAgcmVmbGVjdG9yLFxuICAgICAgc2NvcGVSZWdpc3RyeSxcbiAgICAgIGR0c1RyYW5zZm9ybXMsXG4gICAgICBleHBvcnRSZWZlcmVuY2VHcmFwaCxcbiAgICAgIHJvdXRlQW5hbHl6ZXIsXG4gICAgICBtd3BTY2FubmVyLFxuICAgICAgbWV0YVJlYWRlcixcbiAgICAgIHR5cGVDaGVja1Njb3BlUmVnaXN0cnksXG4gICAgICBhbGlhc2luZ0hvc3QsXG4gICAgICByZWZFbWl0dGVyLFxuICAgICAgdGVtcGxhdGVUeXBlQ2hlY2tlcixcbiAgICAgIHJlc291cmNlUmVnaXN0cnksXG4gICAgfTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB0aGUgZ2l2ZW4gYFByb2dyYW1gIGlzIEBhbmd1bGFyL2NvcmUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0FuZ3VsYXJDb3JlUGFja2FnZShwcm9ncmFtOiB0cy5Qcm9ncmFtKTogYm9vbGVhbiB7XG4gIC8vIExvb2sgZm9yIGl0c19qdXN0X2FuZ3VsYXIudHMgc29tZXdoZXJlIGluIHRoZSBwcm9ncmFtLlxuICBjb25zdCByM1N5bWJvbHMgPSBnZXRSM1N5bWJvbHNGaWxlKHByb2dyYW0pO1xuICBpZiAocjNTeW1ib2xzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gTG9vayBmb3IgdGhlIGNvbnN0YW50IElUU19KVVNUX0FOR1VMQVIgaW4gdGhhdCBmaWxlLlxuICByZXR1cm4gcjNTeW1ib2xzLnN0YXRlbWVudHMuc29tZShzdG10ID0+IHtcbiAgICAvLyBUaGUgc3RhdGVtZW50IG11c3QgYmUgYSB2YXJpYWJsZSBkZWNsYXJhdGlvbiBzdGF0ZW1lbnQuXG4gICAgaWYgKCF0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHN0bXQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEl0IG11c3QgYmUgZXhwb3J0ZWQuXG4gICAgaWYgKHN0bXQubW9kaWZpZXJzID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgIXN0bXQubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEl0IG11c3QgZGVjbGFyZSBJVFNfSlVTVF9BTkdVTEFSLlxuICAgIHJldHVybiBzdG10LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMuc29tZShkZWNsID0+IHtcbiAgICAgIC8vIFRoZSBkZWNsYXJhdGlvbiBtdXN0IG1hdGNoIHRoZSBuYW1lLlxuICAgICAgaWYgKCF0cy5pc0lkZW50aWZpZXIoZGVjbC5uYW1lKSB8fCBkZWNsLm5hbWUudGV4dCAhPT0gJ0lUU19KVVNUX0FOR1VMQVInKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIEl0IG11c3QgaW5pdGlhbGl6ZSB0aGUgdmFyaWFibGUgdG8gdHJ1ZS5cbiAgICAgIGlmIChkZWNsLmluaXRpYWxpemVyID09PSB1bmRlZmluZWQgfHwgZGVjbC5pbml0aWFsaXplci5raW5kICE9PSB0cy5TeW50YXhLaW5kLlRydWVLZXl3b3JkKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgZGVmaW5pdGlvbiBtYXRjaGVzLlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbmQgdGhlICdyM19zeW1ib2xzLnRzJyBmaWxlIGluIHRoZSBnaXZlbiBgUHJvZ3JhbWAsIG9yIHJldHVybiBgbnVsbGAgaWYgaXQgd2Fzbid0IHRoZXJlLlxuICovXG5mdW5jdGlvbiBnZXRSM1N5bWJvbHNGaWxlKHByb2dyYW06IHRzLlByb2dyYW0pOiB0cy5Tb3VyY2VGaWxlfG51bGwge1xuICByZXR1cm4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZpbmQoZmlsZSA9PiBmaWxlLmZpbGVOYW1lLmluZGV4T2YoJ3IzX3N5bWJvbHMudHMnKSA+PSAwKSB8fCBudWxsO1xufVxuXG4vKipcbiAqIFNpbmNlIFwic3RyaWN0VGVtcGxhdGVzXCIgaXMgYSB0cnVlIHN1cGVyc2V0IG9mIHR5cGUgY2hlY2tpbmcgY2FwYWJpbGl0aWVzIGNvbXBhcmVkIHRvXG4gKiBcImZ1bGxUZW1wbGF0ZVR5cGVDaGVja1wiLCBpdCBpcyByZXF1aXJlZCB0aGF0IHRoZSBsYXR0ZXIgaXMgbm90IGV4cGxpY2l0bHkgZGlzYWJsZWQgaWYgdGhlXG4gKiBmb3JtZXIgaXMgZW5hYmxlZC5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ5Q29tcGF0aWJsZVR5cGVDaGVja09wdGlvbnMob3B0aW9uczogTmdDb21waWxlck9wdGlvbnMpOiB0cy5EaWFnbm9zdGljfG51bGwge1xuICBpZiAob3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2sgPT09IGZhbHNlICYmIG9wdGlvbnMuc3RyaWN0VGVtcGxhdGVzID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICBjb2RlOiBuZ0Vycm9yQ29kZShFcnJvckNvZGUuQ09ORklHX1NUUklDVF9URU1QTEFURVNfSU1QTElFU19GVUxMX1RFTVBMQVRFX1RZUEVDSEVDSyksXG4gICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICBzdGFydDogdW5kZWZpbmVkLFxuICAgICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICBtZXNzYWdlVGV4dDpcbiAgICAgICAgICBgQW5ndWxhciBjb21waWxlciBvcHRpb24gXCJzdHJpY3RUZW1wbGF0ZXNcIiBpcyBlbmFibGVkLCBob3dldmVyIFwiZnVsbFRlbXBsYXRlVHlwZUNoZWNrXCIgaXMgZGlzYWJsZWQuXG5cbkhhdmluZyB0aGUgXCJzdHJpY3RUZW1wbGF0ZXNcIiBmbGFnIGVuYWJsZWQgaW1wbGllcyB0aGF0IFwiZnVsbFRlbXBsYXRlVHlwZUNoZWNrXCIgaXMgYWxzbyBlbmFibGVkLCBzb1xudGhlIGxhdHRlciBjYW4gbm90IGJlIGV4cGxpY2l0bHkgZGlzYWJsZWQuXG5cbk9uZSBvZiB0aGUgZm9sbG93aW5nIGFjdGlvbnMgaXMgcmVxdWlyZWQ6XG4xLiBSZW1vdmUgdGhlIFwiZnVsbFRlbXBsYXRlVHlwZUNoZWNrXCIgb3B0aW9uLlxuMi4gUmVtb3ZlIFwic3RyaWN0VGVtcGxhdGVzXCIgb3Igc2V0IGl0IHRvICdmYWxzZScuXG5cbk1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHRlbXBsYXRlIHR5cGUgY2hlY2tpbmcgY29tcGlsZXIgb3B0aW9ucyBjYW4gYmUgZm91bmQgaW4gdGhlIGRvY3VtZW50YXRpb246XG5odHRwczovL3Y5LmFuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtdHlwZWNoZWNrI3RlbXBsYXRlLXR5cGUtY2hlY2tpbmdgLFxuICAgIH07XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuY2xhc3MgUmVmZXJlbmNlR3JhcGhBZGFwdGVyIGltcGxlbWVudHMgUmVmZXJlbmNlc1JlZ2lzdHJ5IHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBncmFwaDogUmVmZXJlbmNlR3JhcGgpIHt9XG5cbiAgYWRkKHNvdXJjZTogRGVjbGFyYXRpb25Ob2RlLCAuLi5yZWZlcmVuY2VzOiBSZWZlcmVuY2U8RGVjbGFyYXRpb25Ob2RlPltdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCB7bm9kZX0gb2YgcmVmZXJlbmNlcykge1xuICAgICAgbGV0IHNvdXJjZUZpbGUgPSBub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICAgIGlmIChzb3VyY2VGaWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc291cmNlRmlsZSA9IHRzLmdldE9yaWdpbmFsTm9kZShub2RlKS5nZXRTb3VyY2VGaWxlKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE9ubHkgcmVjb3JkIGxvY2FsIHJlZmVyZW5jZXMgKG5vdCByZWZlcmVuY2VzIGludG8gLmQudHMgZmlsZXMpLlxuICAgICAgaWYgKHNvdXJjZUZpbGUgPT09IHVuZGVmaW5lZCB8fCAhaXNEdHNQYXRoKHNvdXJjZUZpbGUuZmlsZU5hbWUpKSB7XG4gICAgICAgIHRoaXMuZ3JhcGguYWRkKHNvdXJjZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=