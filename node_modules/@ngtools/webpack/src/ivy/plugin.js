"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularWebpackPlugin = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const compiler_cli_1 = require("@angular/compiler-cli");
const program_1 = require("@angular/compiler-cli/src/ngtsc/program");
const crypto_1 = require("crypto");
const path = require("path");
const ts = require("typescript");
const webpack_1 = require("webpack");
const lazy_routes_1 = require("../lazy_routes");
const ngcc_processor_1 = require("../ngcc_processor");
const paths_plugin_1 = require("../paths-plugin");
const resource_loader_1 = require("../resource_loader");
const webpack_diagnostics_1 = require("../webpack-diagnostics");
const webpack_version_1 = require("../webpack-version");
const cache_1 = require("./cache");
const diagnostics_1 = require("./diagnostics");
const host_1 = require("./host");
const paths_1 = require("./paths");
const symbol_1 = require("./symbol");
const system_1 = require("./system");
const transformation_1 = require("./transformation");
/**
 * The threshold used to determine whether Angular file diagnostics should optimize for full programs
 * or single files. If the number of affected files for a build is more than the threshold, full
 * program optimization will be used.
 */
const DIAGNOSTICS_AFFECTED_THRESHOLD = 1;
function initializeNgccProcessor(compiler, tsconfig) {
    var _a, _b;
    const { inputFileSystem, options: webpackOptions } = compiler;
    const mainFields = [].concat(...(((_a = webpackOptions.resolve) === null || _a === void 0 ? void 0 : _a.mainFields) || []));
    const errors = [];
    const warnings = [];
    const processor = new ngcc_processor_1.NgccProcessor(mainFields, warnings, errors, compiler.context, tsconfig, inputFileSystem, (_b = webpackOptions.resolve) === null || _b === void 0 ? void 0 : _b.symlinks);
    return { processor, errors, warnings };
}
function hashContent(content) {
    return crypto_1.createHash('md5').update(content).digest();
}
const PLUGIN_NAME = 'angular-compiler';
class AngularWebpackPlugin {
    constructor(options = {}) {
        this.lazyRouteMap = {};
        this.fileDependencies = new Map();
        this.requiredFilesToEmit = new Set();
        this.requiredFilesToEmitCache = new Map();
        this.fileEmitHistory = new Map();
        this.pluginOptions = {
            emitClassMetadata: false,
            emitNgModuleScope: false,
            jitMode: false,
            fileReplacements: {},
            substitutions: {},
            directTemplateLoading: true,
            tsconfig: 'tsconfig.json',
            suppressZoneJsIncompatibilityWarning: false,
            ...options,
        };
    }
    get options() {
        return this.pluginOptions;
    }
    apply(compiler) {
        // Setup file replacements with webpack
        for (const [key, value] of Object.entries(this.pluginOptions.fileReplacements)) {
            new webpack_1.NormalModuleReplacementPlugin(new RegExp('^' + key.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') + '$'), value).apply(compiler);
        }
        // Mimic VE plugin's systemjs module loader resource location for consistency
        new webpack_1.ContextReplacementPlugin(/\@angular[\\\/]core[\\\/]/, path.join(compiler.context, '$$_lazy_route_resource'), this.lazyRouteMap).apply(compiler);
        // Set resolver options
        const pathsPlugin = new paths_plugin_1.TypeScriptPathsPlugin();
        compiler.hooks.afterResolvers.tap('angular-compiler', (compiler) => {
            // 'resolverFactory' is not present in the Webpack typings
            // tslint:disable-next-line: no-any
            const resolverFactoryHooks = compiler.resolverFactory.hooks;
            // When Ivy is enabled we need to add the fields added by NGCC
            // to take precedence over the provided mainFields.
            // NGCC adds fields in package.json suffixed with '_ivy_ngcc'
            // Example: module -> module__ivy_ngcc
            resolverFactoryHooks.resolveOptions
                .for('normal')
                .tap(PLUGIN_NAME, (resolveOptions) => {
                const originalMainFields = resolveOptions.mainFields;
                const ivyMainFields = originalMainFields.map((f) => `${f}_ivy_ngcc`);
                return webpack_version_1.mergeResolverMainFields(resolveOptions, originalMainFields, ivyMainFields);
            });
            resolverFactoryHooks.resolver.for('normal').tap(PLUGIN_NAME, (resolver) => {
                pathsPlugin.apply(resolver);
            });
        });
        let ngccProcessor;
        const resourceLoader = this.pluginOptions.jitMode
            ? new resource_loader_1.NoopResourceLoader()
            : new resource_loader_1.WebpackResourceLoader();
        let previousUnused;
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (thisCompilation) => {
            var _a;
            const compilation = thisCompilation;
            // Store watch mode; assume true if not present (webpack < 4.23.0)
            this.watchMode = (_a = compiler.watchMode) !== null && _a !== void 0 ? _a : true;
            // Initialize and process eager ngcc if not already setup
            if (!ngccProcessor) {
                const { processor, errors, warnings } = initializeNgccProcessor(compiler, this.pluginOptions.tsconfig);
                processor.process();
                warnings.forEach((warning) => webpack_diagnostics_1.addWarning(compilation, warning));
                errors.forEach((error) => webpack_diagnostics_1.addError(compilation, error));
                ngccProcessor = processor;
            }
            // Setup and read TypeScript and Angular compiler configuration
            const { compilerOptions, rootNames, errors } = this.loadConfiguration(compilation);
            // Create diagnostics reporter and report configuration file errors
            const diagnosticsReporter = diagnostics_1.createDiagnosticsReporter(compilation);
            diagnosticsReporter(errors);
            // Update TypeScript path mapping plugin with new configuration
            pathsPlugin.update(compilerOptions);
            // Create a Webpack-based TypeScript compiler host
            const system = system_1.createWebpackSystem(compiler.inputFileSystem, paths_1.normalizePath(compiler.context));
            const host = ts.createIncrementalCompilerHost(compilerOptions, system);
            // Setup source file caching and reuse cache from previous compilation if present
            let cache = this.sourceFileCache;
            let changedFiles;
            if (cache) {
                // Invalidate existing cache based on compiler file timestamps
                changedFiles = cache.invalidate(compiler.fileTimestamps, this.buildTimestamp);
                // Invalidate file dependencies of changed files
                for (const changedFile of changedFiles) {
                    this.fileDependencies.delete(paths_1.normalizePath(changedFile));
                }
            }
            else {
                // Initialize a new cache
                cache = new cache_1.SourceFileCache();
                // Only store cache if in watch mode
                if (this.watchMode) {
                    this.sourceFileCache = cache;
                }
            }
            this.buildTimestamp = Date.now();
            host_1.augmentHostWithCaching(host, cache);
            const moduleResolutionCache = ts.createModuleResolutionCache(host.getCurrentDirectory(), host.getCanonicalFileName.bind(host), compilerOptions);
            // Setup source file dependency collection
            host_1.augmentHostWithDependencyCollection(host, this.fileDependencies, moduleResolutionCache);
            // Setup on demand ngcc
            host_1.augmentHostWithNgcc(host, ngccProcessor, moduleResolutionCache);
            // Setup resource loading
            resourceLoader.update(compilation, changedFiles);
            host_1.augmentHostWithResources(host, resourceLoader, {
                directTemplateLoading: !this.pluginOptions.jitMode && this.pluginOptions.directTemplateLoading,
            });
            // Setup source file adjustment options
            host_1.augmentHostWithReplacements(host, this.pluginOptions.fileReplacements, moduleResolutionCache);
            host_1.augmentHostWithSubstitutions(host, this.pluginOptions.substitutions);
            // Create the file emitter used by the webpack loader
            const { fileEmitter, builder, internalFiles } = this.pluginOptions.jitMode
                ? this.updateJitProgram(compilerOptions, rootNames, host, diagnosticsReporter, changedFiles)
                : this.updateAotProgram(compilerOptions, rootNames, host, diagnosticsReporter, resourceLoader);
            const allProgramFiles = builder
                .getSourceFiles()
                .filter((sourceFile) => !(internalFiles === null || internalFiles === void 0 ? void 0 : internalFiles.has(sourceFile)));
            // Ensure all program files are considered part of the compilation and will be watched
            if (webpack_version_1.isWebpackFiveOrHigher()) {
                allProgramFiles.forEach((sourceFile) => compilation.fileDependencies.add(sourceFile.fileName));
            }
            else {
                allProgramFiles.forEach((sourceFile) => compilation.compilationDependencies.add(sourceFile.fileName));
            }
            compilation.hooks.finishModules.tapPromise(PLUGIN_NAME, async (modules) => {
                // Rebuild any remaining AOT required modules
                await this.rebuildRequiredFiles(modules, compilation, fileEmitter);
                // Analyze program for unused files
                if (compilation.errors.length > 0) {
                    return;
                }
                const currentUnused = new Set(allProgramFiles
                    .filter((sourceFile) => !sourceFile.isDeclarationFile)
                    .map((sourceFile) => paths_1.normalizePath(sourceFile.fileName)));
                modules.forEach(({ resource }) => {
                    if (resource) {
                        this.markResourceUsed(paths_1.normalizePath(resource), currentUnused);
                    }
                });
                for (const unused of currentUnused) {
                    if (previousUnused && previousUnused.has(unused)) {
                        continue;
                    }
                    webpack_diagnostics_1.addWarning(compilation, `${unused} is part of the TypeScript compilation but it's unused.\n` +
                        `Add only entry points to the 'files' or 'include' properties in your tsconfig.`);
                }
                previousUnused = currentUnused;
            });
            // Store file emitter for loader usage
            compilation[symbol_1.AngularPluginSymbol] = fileEmitter;
        });
    }
    markResourceUsed(normalizedResourcePath, currentUnused) {
        if (!currentUnused.has(normalizedResourcePath)) {
            return;
        }
        currentUnused.delete(normalizedResourcePath);
        const dependencies = this.fileDependencies.get(normalizedResourcePath);
        if (!dependencies) {
            return;
        }
        for (const dependency of dependencies) {
            this.markResourceUsed(paths_1.normalizePath(dependency), currentUnused);
        }
    }
    async rebuildRequiredFiles(modules, compilation, fileEmitter) {
        if (this.requiredFilesToEmit.size === 0) {
            return;
        }
        const rebuild = (webpackModule) => new Promise((resolve) => compilation.rebuildModule(webpackModule, resolve));
        const filesToRebuild = new Set();
        for (const requiredFile of this.requiredFilesToEmit) {
            const history = this.fileEmitHistory.get(requiredFile);
            if (history) {
                const emitResult = await fileEmitter(requiredFile);
                if ((emitResult === null || emitResult === void 0 ? void 0 : emitResult.content) === undefined ||
                    history.length !== emitResult.content.length ||
                    emitResult.hash === undefined ||
                    Buffer.compare(history.hash, emitResult.hash) !== 0) {
                    // New emit result is different so rebuild using new emit result
                    this.requiredFilesToEmitCache.set(requiredFile, emitResult);
                    filesToRebuild.add(requiredFile);
                }
            }
            else {
                // No emit history so rebuild
                filesToRebuild.add(requiredFile);
            }
        }
        if (filesToRebuild.size > 0) {
            for (const webpackModule of [...modules]) {
                const resource = webpackModule.resource;
                if (resource && filesToRebuild.has(paths_1.normalizePath(resource))) {
                    await rebuild(webpackModule);
                }
            }
        }
        this.requiredFilesToEmit.clear();
        this.requiredFilesToEmitCache.clear();
    }
    loadConfiguration(compilation) {
        const { options: compilerOptions, rootNames, errors } = compiler_cli_1.readConfiguration(this.pluginOptions.tsconfig, this.pluginOptions.compilerOptions);
        compilerOptions.enableIvy = true;
        compilerOptions.noEmitOnError = false;
        compilerOptions.suppressOutputPathCheck = true;
        compilerOptions.outDir = undefined;
        compilerOptions.inlineSources = compilerOptions.sourceMap;
        compilerOptions.inlineSourceMap = false;
        compilerOptions.mapRoot = undefined;
        compilerOptions.sourceRoot = undefined;
        compilerOptions.allowEmptyCodegenFiles = false;
        compilerOptions.annotationsAs = 'decorators';
        compilerOptions.enableResourceInlining = false;
        if (!this.pluginOptions.suppressZoneJsIncompatibilityWarning &&
            compilerOptions.target &&
            compilerOptions.target >= ts.ScriptTarget.ES2017) {
            webpack_diagnostics_1.addWarning(compilation, 'Zone.js does not support native async/await in ES2017+.\n' +
                'These blocks are not intercepted by zone.js and will not triggering change detection.\n' +
                'See: https://github.com/angular/zone.js/pull/1140 for more information.');
        }
        return { compilerOptions, rootNames, errors };
    }
    updateAotProgram(compilerOptions, rootNames, host, diagnosticsReporter, resourceLoader) {
        // Create the Angular specific program that contains the Angular compiler
        const angularProgram = new program_1.NgtscProgram(rootNames, compilerOptions, host, this.ngtscNextProgram);
        const angularCompiler = angularProgram.compiler;
        // The `ignoreForEmit` return value can be safely ignored when emitting. Only files
        // that will be bundled (requested by Webpack) will be emitted. Combined with TypeScript's
        // eliding of type only imports, this will cause type only files to be automatically ignored.
        // Internal Angular type check files are also not resolvable by the bundler. Even if they
        // were somehow errantly imported, the bundler would error before an emit was attempted.
        // Diagnostics are still collected for all files which requires using `ignoreForDiagnostics`.
        const { ignoreForDiagnostics, ignoreForEmit } = angularCompiler;
        // SourceFile versions are required for builder programs.
        // The wrapped host inside NgtscProgram adds additional files that will not have versions.
        const typeScriptProgram = angularProgram.getTsProgram();
        host_1.augmentProgramWithVersioning(typeScriptProgram);
        const builder = ts.createEmitAndSemanticDiagnosticsBuilderProgram(typeScriptProgram, host, this.builder);
        // Save for next rebuild
        if (this.watchMode) {
            this.builder = builder;
            this.ngtscNextProgram = angularProgram;
        }
        // Update semantic diagnostics cache
        const affectedFiles = new Set();
        while (true) {
            const result = builder.getSemanticDiagnosticsOfNextAffectedFile(undefined, (sourceFile) => {
                // If the affected file is a TTC shim, add the shim's original source file.
                // This ensures that changes that affect TTC are typechecked even when the changes
                // are otherwise unrelated from a TS perspective and do not result in Ivy codegen changes.
                // For example, changing @Input property types of a directive used in another component's
                // template.
                if (ignoreForDiagnostics.has(sourceFile) &&
                    sourceFile.fileName.endsWith('.ngtypecheck.ts')) {
                    // This file name conversion relies on internal compiler logic and should be converted
                    // to an official method when available. 15 is length of `.ngtypecheck.ts`
                    const originalFilename = sourceFile.fileName.slice(0, -15) + '.ts';
                    const originalSourceFile = builder.getSourceFile(originalFilename);
                    if (originalSourceFile) {
                        affectedFiles.add(originalSourceFile);
                    }
                    return true;
                }
                return false;
            });
            if (!result) {
                break;
            }
            affectedFiles.add(result.affected);
        }
        // Collect non-semantic diagnostics
        const diagnostics = [
            ...angularCompiler.getOptionDiagnostics(),
            ...builder.getOptionsDiagnostics(),
            ...builder.getGlobalDiagnostics(),
            ...builder.getSyntacticDiagnostics(),
        ];
        diagnosticsReporter(diagnostics);
        // Collect semantic diagnostics
        for (const sourceFile of builder.getSourceFiles()) {
            if (!ignoreForDiagnostics.has(sourceFile)) {
                diagnosticsReporter(builder.getSemanticDiagnostics(sourceFile));
            }
        }
        const transformers = transformation_1.createAotTransformers(builder, this.pluginOptions);
        const getDependencies = (sourceFile) => {
            const dependencies = [];
            for (const resourcePath of angularCompiler.getResourceDependencies(sourceFile)) {
                dependencies.push(resourcePath, 
                // Retrieve all dependencies of the resource (stylesheet imports, etc.)
                ...resourceLoader.getResourceDependencies(resourcePath));
            }
            return dependencies;
        };
        // Required to support asynchronous resource loading
        // Must be done before creating transformers or getting template diagnostics
        const pendingAnalysis = angularCompiler.analyzeAsync().then(() => {
            var _a;
            this.requiredFilesToEmit.clear();
            for (const sourceFile of builder.getSourceFiles()) {
                if (sourceFile.isDeclarationFile) {
                    continue;
                }
                // Collect sources that are required to be emitted
                if (!ignoreForEmit.has(sourceFile) &&
                    !angularCompiler.incrementalDriver.safeToSkipEmit(sourceFile)) {
                    this.requiredFilesToEmit.add(paths_1.normalizePath(sourceFile.fileName));
                    // If required to emit, diagnostics may have also changed
                    if (!ignoreForDiagnostics.has(sourceFile)) {
                        affectedFiles.add(sourceFile);
                    }
                }
                else if (this.sourceFileCache &&
                    !affectedFiles.has(sourceFile) &&
                    !ignoreForDiagnostics.has(sourceFile)) {
                    // Use cached Angular diagnostics for unchanged and unaffected files
                    const angularDiagnostics = this.sourceFileCache.getAngularDiagnostics(sourceFile);
                    if (angularDiagnostics) {
                        diagnosticsReporter(angularDiagnostics);
                    }
                }
            }
            // NOTE: This can be removed once support for the deprecated lazy route string format is removed
            for (const lazyRoute of angularCompiler.listLazyRoutes()) {
                const [routeKey] = lazyRoute.route.split('#');
                this.lazyRouteMap[routeKey] = lazyRoute.referencedModule.filePath;
            }
            // Collect new Angular diagnostics for files affected by changes
            const { OptimizeFor } = require('@angular/compiler-cli/src/ngtsc/typecheck/api');
            const optimizeDiagnosticsFor = affectedFiles.size <= DIAGNOSTICS_AFFECTED_THRESHOLD
                ? OptimizeFor.SingleFile
                : OptimizeFor.WholeProgram;
            for (const affectedFile of affectedFiles) {
                const angularDiagnostics = angularCompiler.getDiagnosticsForFile(affectedFile, optimizeDiagnosticsFor);
                diagnosticsReporter(angularDiagnostics);
                (_a = this.sourceFileCache) === null || _a === void 0 ? void 0 : _a.updateAngularDiagnostics(affectedFile, angularDiagnostics);
            }
            // NOTE: Workaround to fix stale reuse program. Can be removed once fixed upstream.
            // tslint:disable-next-line: no-any
            angularProgram.reuseTsProgram = angularCompiler.getNextProgram();
            return this.createFileEmitter(builder, transformation_1.mergeTransformers(angularCompiler.prepareEmit().transformers, transformers), getDependencies, (sourceFile) => {
                this.requiredFilesToEmit.delete(paths_1.normalizePath(sourceFile.fileName));
                angularCompiler.incrementalDriver.recordSuccessfulEmit(sourceFile);
            });
        });
        const analyzingFileEmitter = async (file) => {
            const innerFileEmitter = await pendingAnalysis;
            return innerFileEmitter(file);
        };
        return {
            fileEmitter: analyzingFileEmitter,
            builder,
            internalFiles: ignoreForEmit,
        };
    }
    updateJitProgram(compilerOptions, rootNames, host, diagnosticsReporter, changedFiles) {
        const builder = ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, compilerOptions, host, this.builder);
        // Save for next rebuild
        if (this.watchMode) {
            this.builder = builder;
        }
        const diagnostics = [
            ...builder.getOptionsDiagnostics(),
            ...builder.getGlobalDiagnostics(),
            ...builder.getSyntacticDiagnostics(),
            // Gather incremental semantic diagnostics
            ...builder.getSemanticDiagnostics(),
        ];
        diagnosticsReporter(diagnostics);
        const transformers = transformation_1.createJitTransformers(builder, this.pluginOptions);
        // Only do a full, expensive Angular compiler string lazy route analysis on the first build
        // `changedFiles` will be undefined on a first build
        if (!changedFiles) {
            // Required to support asynchronous resource loading
            // Must be done before listing lazy routes
            // NOTE: This can be removed once support for the deprecated lazy route string format is removed
            const angularProgram = new program_1.NgtscProgram(rootNames, compilerOptions, host);
            const angularCompiler = angularProgram.compiler;
            const pendingAnalysis = angularCompiler.analyzeAsync().then(() => {
                for (const lazyRoute of angularCompiler.listLazyRoutes()) {
                    const [routeKey] = lazyRoute.route.split('#');
                    this.lazyRouteMap[routeKey] = lazyRoute.referencedModule.filePath;
                }
                return this.createFileEmitter(builder, transformers, () => []);
            });
            const analyzingFileEmitter = async (file) => {
                const innerFileEmitter = await pendingAnalysis;
                return innerFileEmitter(file);
            };
            return {
                fileEmitter: analyzingFileEmitter,
                builder,
                internalFiles: undefined,
            };
        }
        else {
            // Update lazy route map for changed files using fast but less accurate method
            for (const changedFile of changedFiles) {
                if (!builder.getSourceFile(changedFile)) {
                    continue;
                }
                const routes = lazy_routes_1.findLazyRoutes(changedFile, host, builder.getProgram());
                for (const [routeKey, filePath] of Object.entries(routes)) {
                    this.lazyRouteMap[routeKey] = filePath;
                }
            }
            return {
                fileEmitter: this.createFileEmitter(builder, transformers, () => []),
                builder,
                internalFiles: undefined,
            };
        }
    }
    createFileEmitter(program, transformers = {}, getExtraDependencies, onAfterEmit) {
        return async (file) => {
            const filePath = paths_1.normalizePath(file);
            if (this.requiredFilesToEmitCache.has(filePath)) {
                return this.requiredFilesToEmitCache.get(filePath);
            }
            const sourceFile = program.getSourceFile(filePath);
            if (!sourceFile) {
                return undefined;
            }
            let content;
            let map;
            program.emit(sourceFile, (filename, data) => {
                if (filename.endsWith('.map')) {
                    map = data;
                }
                else if (filename.endsWith('.js')) {
                    content = data;
                }
            }, undefined, undefined, transformers);
            onAfterEmit === null || onAfterEmit === void 0 ? void 0 : onAfterEmit(sourceFile);
            let hash;
            if (content !== undefined && this.watchMode) {
                // Capture emit history info for Angular rebuild analysis
                hash = hashContent(content);
                this.fileEmitHistory.set(filePath, { length: content.length, hash });
            }
            const dependencies = [
                ...(this.fileDependencies.get(filePath) || []),
                ...getExtraDependencies(sourceFile),
            ].map(paths_1.externalizePath);
            return { content, map, dependencies, hash };
        };
    }
}
exports.AngularWebpackPlugin = AngularWebpackPlugin;
