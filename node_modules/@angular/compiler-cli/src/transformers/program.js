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
        define("@angular/compiler-cli/src/transformers/program", ["require", "exports", "tslib", "@angular/compiler", "fs", "path", "typescript", "@angular/compiler-cli/src/diagnostics/translate_diagnostics", "@angular/compiler-cli/src/metadata/index", "@angular/compiler-cli/src/ngtsc/core/src/compiler", "@angular/compiler-cli/src/ngtsc/program", "@angular/compiler-cli/src/ngtsc/reflection", "@angular/compiler-cli/src/typescript_support", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/compiler_host", "@angular/compiler-cli/src/transformers/downlevel_decorators_transform", "@angular/compiler-cli/src/transformers/inline_resources", "@angular/compiler-cli/src/transformers/lower_expressions", "@angular/compiler-cli/src/transformers/metadata_cache", "@angular/compiler-cli/src/transformers/node_emitter_transform", "@angular/compiler-cli/src/transformers/r3_metadata_transform", "@angular/compiler-cli/src/transformers/r3_transform", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.i18nGetExtension = exports.i18nSerialize = exports.i18nExtract = exports.createSrcToOutPathMapper = exports.createProgram = exports.resetTempProgramHandlerForTest = exports.setTempProgramHandlerForTest = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var fs = require("fs");
    var path = require("path");
    var ts = require("typescript");
    var translate_diagnostics_1 = require("@angular/compiler-cli/src/diagnostics/translate_diagnostics");
    var metadata_1 = require("@angular/compiler-cli/src/metadata/index");
    var compiler_2 = require("@angular/compiler-cli/src/ngtsc/core/src/compiler");
    var program_1 = require("@angular/compiler-cli/src/ngtsc/program");
    var reflection_1 = require("@angular/compiler-cli/src/ngtsc/reflection");
    var typescript_support_1 = require("@angular/compiler-cli/src/typescript_support");
    var api_1 = require("@angular/compiler-cli/src/transformers/api");
    var compiler_host_1 = require("@angular/compiler-cli/src/transformers/compiler_host");
    var downlevel_decorators_transform_1 = require("@angular/compiler-cli/src/transformers/downlevel_decorators_transform");
    var inline_resources_1 = require("@angular/compiler-cli/src/transformers/inline_resources");
    var lower_expressions_1 = require("@angular/compiler-cli/src/transformers/lower_expressions");
    var metadata_cache_1 = require("@angular/compiler-cli/src/transformers/metadata_cache");
    var node_emitter_transform_1 = require("@angular/compiler-cli/src/transformers/node_emitter_transform");
    var r3_metadata_transform_1 = require("@angular/compiler-cli/src/transformers/r3_metadata_transform");
    var r3_transform_1 = require("@angular/compiler-cli/src/transformers/r3_transform");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    /**
     * Maximum number of files that are emitable via calling ts.Program.emit
     * passing individual targetSourceFiles.
     */
    var MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT = 20;
    /**
     * Fields to lower within metadata in render2 mode.
     */
    var LOWER_FIELDS = ['useValue', 'useFactory', 'data', 'id', 'loadChildren'];
    /**
     * Fields to lower within metadata in render3 mode.
     */
    var R3_LOWER_FIELDS = tslib_1.__spread(LOWER_FIELDS, ['providers', 'imports', 'exports']);
    /**
     * Installs a handler for testing purposes to allow inspection of the temporary program.
     */
    var tempProgramHandlerForTest = null;
    function setTempProgramHandlerForTest(handler) {
        tempProgramHandlerForTest = handler;
    }
    exports.setTempProgramHandlerForTest = setTempProgramHandlerForTest;
    function resetTempProgramHandlerForTest() {
        tempProgramHandlerForTest = null;
    }
    exports.resetTempProgramHandlerForTest = resetTempProgramHandlerForTest;
    var emptyModules = {
        ngModules: [],
        ngModuleByPipeOrDirective: new Map(),
        files: []
    };
    var defaultEmitCallback = function (_a) {
        var program = _a.program, targetSourceFile = _a.targetSourceFile, writeFile = _a.writeFile, cancellationToken = _a.cancellationToken, emitOnlyDtsFiles = _a.emitOnlyDtsFiles, customTransformers = _a.customTransformers;
        return program.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    };
    var AngularCompilerProgram = /** @class */ (function () {
        function AngularCompilerProgram(rootNames, options, host, oldProgram) {
            var _a;
            var _this = this;
            this.options = options;
            this.host = host;
            this._optionsDiagnostics = [];
            this._transformTsDiagnostics = [];
            this._isCompilingAngularCore = null;
            this.rootNames = tslib_1.__spread(rootNames);
            if (!options.disableTypeScriptVersionCheck) {
                typescript_support_1.verifySupportedTypeScriptVersion();
            }
            this.oldTsProgram = oldProgram ? oldProgram.getTsProgram() : undefined;
            if (oldProgram) {
                this.oldProgramLibrarySummaries = oldProgram.getLibrarySummaries();
                this.oldProgramEmittedGeneratedFiles = oldProgram.getEmittedGeneratedFiles();
                this.oldProgramEmittedSourceFiles = oldProgram.getEmittedSourceFiles();
            }
            if (options.flatModuleOutFile) {
                var _b = metadata_1.createBundleIndexHost(options, this.rootNames, host, function () { return _this.flatModuleMetadataCache; }), bundleHost = _b.host, indexName = _b.indexName, errors = _b.errors;
                if (errors) {
                    (_a = this._optionsDiagnostics).push.apply(_a, tslib_1.__spread(errors.map(function (e) { return ({
                        category: e.category,
                        messageText: e.messageText,
                        source: api_1.SOURCE,
                        code: api_1.DEFAULT_ERROR_CODE
                    }); })));
                }
                else {
                    this.rootNames.push(indexName);
                    this.host = bundleHost;
                }
            }
            this.loweringMetadataTransform =
                new lower_expressions_1.LowerMetadataTransform(options.enableIvy !== false ? R3_LOWER_FIELDS : LOWER_FIELDS);
            this.metadataCache = this.createMetadataCache([this.loweringMetadataTransform]);
        }
        AngularCompilerProgram.prototype.createMetadataCache = function (transformers) {
            return new metadata_cache_1.MetadataCache(new metadata_1.MetadataCollector({ quotedNames: true }), !!this.options.strictMetadataEmit, transformers);
        };
        AngularCompilerProgram.prototype.getLibrarySummaries = function () {
            var result = new Map();
            if (this.oldProgramLibrarySummaries) {
                this.oldProgramLibrarySummaries.forEach(function (summary, fileName) { return result.set(fileName, summary); });
            }
            if (this.emittedLibrarySummaries) {
                this.emittedLibrarySummaries.forEach(function (summary, fileName) { return result.set(summary.fileName, summary); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getEmittedGeneratedFiles = function () {
            var result = new Map();
            if (this.oldProgramEmittedGeneratedFiles) {
                this.oldProgramEmittedGeneratedFiles.forEach(function (genFile, fileName) { return result.set(fileName, genFile); });
            }
            if (this.emittedGeneratedFiles) {
                this.emittedGeneratedFiles.forEach(function (genFile) { return result.set(genFile.genFileUrl, genFile); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getEmittedSourceFiles = function () {
            var result = new Map();
            if (this.oldProgramEmittedSourceFiles) {
                this.oldProgramEmittedSourceFiles.forEach(function (sf, fileName) { return result.set(fileName, sf); });
            }
            if (this.emittedSourceFiles) {
                this.emittedSourceFiles.forEach(function (sf) { return result.set(sf.fileName, sf); });
            }
            return result;
        };
        AngularCompilerProgram.prototype.getTsProgram = function () {
            return this.tsProgram;
        };
        AngularCompilerProgram.prototype.getTsOptionDiagnostics = function (cancellationToken) {
            return this.tsProgram.getOptionsDiagnostics(cancellationToken);
        };
        AngularCompilerProgram.prototype.getNgOptionDiagnostics = function (cancellationToken) {
            return tslib_1.__spread(this._optionsDiagnostics, getNgOptionDiagnostics(this.options));
        };
        AngularCompilerProgram.prototype.getTsSyntacticDiagnostics = function (sourceFile, cancellationToken) {
            return this.tsProgram.getSyntacticDiagnostics(sourceFile, cancellationToken);
        };
        AngularCompilerProgram.prototype.getNgStructuralDiagnostics = function (cancellationToken) {
            return this.structuralDiagnostics;
        };
        AngularCompilerProgram.prototype.getTsSemanticDiagnostics = function (sourceFile, cancellationToken) {
            var _this = this;
            var sourceFiles = sourceFile ? [sourceFile] : this.tsProgram.getSourceFiles();
            var diags = [];
            sourceFiles.forEach(function (sf) {
                if (!util_1.GENERATED_FILES.test(sf.fileName)) {
                    diags.push.apply(diags, tslib_1.__spread(_this.tsProgram.getSemanticDiagnostics(sf, cancellationToken)));
                }
            });
            return diags;
        };
        AngularCompilerProgram.prototype.getNgSemanticDiagnostics = function (fileName, cancellationToken) {
            var _this = this;
            var diags = [];
            this.tsProgram.getSourceFiles().forEach(function (sf) {
                if (util_1.GENERATED_FILES.test(sf.fileName) && !sf.isDeclarationFile) {
                    diags.push.apply(diags, tslib_1.__spread(_this.tsProgram.getSemanticDiagnostics(sf, cancellationToken)));
                }
            });
            var ng = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, diags).ng;
            return ng;
        };
        AngularCompilerProgram.prototype.loadNgStructureAsync = function () {
            var _this = this;
            if (this._analyzedModules) {
                throw new Error('Angular structure already loaded');
            }
            return Promise.resolve()
                .then(function () {
                var _a = _this._createProgramWithBasicStubs(), tmpProgram = _a.tmpProgram, sourceFiles = _a.sourceFiles, tsFiles = _a.tsFiles, rootNames = _a.rootNames;
                return _this.compiler.loadFilesAsync(sourceFiles, tsFiles)
                    .then(function (_a) {
                    var analyzedModules = _a.analyzedModules, analyzedInjectables = _a.analyzedInjectables;
                    if (_this._analyzedModules) {
                        throw new Error('Angular structure loaded both synchronously and asynchronously');
                    }
                    _this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
                });
            })
                .catch(function (e) { return _this._createProgramOnError(e); });
        };
        AngularCompilerProgram.prototype.listLazyRoutes = function (route) {
            // Note: Don't analyzedModules if a route is given
            // to be fast enough.
            return this.compiler.listLazyRoutes(route, route ? undefined : this.analyzedModules);
        };
        AngularCompilerProgram.prototype.emit = function (parameters) {
            if (parameters === void 0) { parameters = {}; }
            if (this.options.enableIvy !== false) {
                throw new Error('Cannot run legacy compiler in ngtsc mode');
            }
            return this._emitRender2(parameters);
        };
        AngularCompilerProgram.prototype._emitRender2 = function (_a) {
            var e_1, _b, e_2, _c;
            var _this = this;
            var _d = _a === void 0 ? {} : _a, _e = _d.emitFlags, emitFlags = _e === void 0 ? api_1.EmitFlags.Default : _e, cancellationToken = _d.cancellationToken, customTransformers = _d.customTransformers, _f = _d.emitCallback, emitCallback = _f === void 0 ? defaultEmitCallback : _f, _g = _d.mergeEmitResultsCallback, mergeEmitResultsCallback = _g === void 0 ? mergeEmitResults : _g;
            var emitStart = Date.now();
            if (emitFlags & api_1.EmitFlags.I18nBundle) {
                var locale = this.options.i18nOutLocale || null;
                var file = this.options.i18nOutFile || null;
                var format = this.options.i18nOutFormat || null;
                var bundle = this.compiler.emitMessageBundle(this.analyzedModules, locale);
                i18nExtract(format, file, this.host, this.options, bundle);
            }
            if ((emitFlags & (api_1.EmitFlags.JS | api_1.EmitFlags.DTS | api_1.EmitFlags.Metadata | api_1.EmitFlags.Codegen)) ===
                0) {
                return { emitSkipped: true, diagnostics: [], emittedFiles: [] };
            }
            var _h = this.generateFilesForEmit(emitFlags), genFiles = _h.genFiles, genDiags = _h.genDiags;
            if (genDiags.length) {
                return {
                    diagnostics: genDiags,
                    emitSkipped: true,
                    emittedFiles: [],
                };
            }
            this.emittedGeneratedFiles = genFiles;
            var outSrcMapping = [];
            var genFileByFileName = new Map();
            genFiles.forEach(function (genFile) { return genFileByFileName.set(genFile.genFileUrl, genFile); });
            this.emittedLibrarySummaries = [];
            this._transformTsDiagnostics = [];
            var emittedSourceFiles = [];
            var writeTsFile = function (outFileName, outData, writeByteOrderMark, onError, sourceFiles) {
                var sourceFile = sourceFiles && sourceFiles.length == 1 ? sourceFiles[0] : null;
                var genFile;
                if (sourceFile) {
                    outSrcMapping.push({ outFileName: outFileName, sourceFile: sourceFile });
                    genFile = genFileByFileName.get(sourceFile.fileName);
                    if (!sourceFile.isDeclarationFile && !util_1.GENERATED_FILES.test(sourceFile.fileName)) {
                        // Note: sourceFile is the transformed sourcefile, not the original one!
                        var originalFile = _this.tsProgram.getSourceFile(sourceFile.fileName);
                        if (originalFile) {
                            emittedSourceFiles.push(originalFile);
                        }
                    }
                }
                _this.writeFile(outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles);
            };
            var modules = this._analyzedInjectables &&
                this.compiler.emitAllPartialModules2(this._analyzedInjectables);
            var tsCustomTransformers = this.calculateTransforms(genFileByFileName, modules, customTransformers);
            var emitOnlyDtsFiles = (emitFlags & (api_1.EmitFlags.DTS | api_1.EmitFlags.JS)) == api_1.EmitFlags.DTS;
            // Restore the original references before we emit so TypeScript doesn't emit
            // a reference to the .d.ts file.
            var augmentedReferences = new Map();
            try {
                for (var _j = tslib_1.__values(this.tsProgram.getSourceFiles()), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var sourceFile = _k.value;
                    var originalReferences = compiler_host_1.getOriginalReferences(sourceFile);
                    if (originalReferences) {
                        augmentedReferences.set(sourceFile, sourceFile.referencedFiles);
                        sourceFile.referencedFiles = originalReferences;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var genTsFiles = [];
            var genJsonFiles = [];
            genFiles.forEach(function (gf) {
                if (gf.stmts) {
                    genTsFiles.push(gf);
                }
                if (gf.source) {
                    genJsonFiles.push(gf);
                }
            });
            var emitResult;
            var emittedUserTsCount;
            try {
                var sourceFilesToEmit = this.getSourceFilesForEmit();
                if (sourceFilesToEmit &&
                    (sourceFilesToEmit.length + genTsFiles.length) < MAX_FILE_COUNT_FOR_SINGLE_FILE_EMIT) {
                    var fileNamesToEmit = tslib_1.__spread(sourceFilesToEmit.map(function (sf) { return sf.fileName; }), genTsFiles.map(function (gf) { return gf.genFileUrl; }));
                    emitResult = mergeEmitResultsCallback(fileNamesToEmit.map(function (fileName) { return emitResult = emitCallback({
                        program: _this.tsProgram,
                        host: _this.host,
                        options: _this.options,
                        writeFile: writeTsFile,
                        emitOnlyDtsFiles: emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers,
                        targetSourceFile: _this.tsProgram.getSourceFile(fileName),
                    }); }));
                    emittedUserTsCount = sourceFilesToEmit.length;
                }
                else {
                    emitResult = emitCallback({
                        program: this.tsProgram,
                        host: this.host,
                        options: this.options,
                        writeFile: writeTsFile,
                        emitOnlyDtsFiles: emitOnlyDtsFiles,
                        customTransformers: tsCustomTransformers
                    });
                    emittedUserTsCount = this.tsProgram.getSourceFiles().length - genTsFiles.length;
                }
            }
            finally {
                try {
                    // Restore the references back to the augmented value to ensure that the
                    // checks that TypeScript makes for project structure reuse will succeed.
                    for (var _l = tslib_1.__values(Array.from(augmentedReferences)), _m = _l.next(); !_m.done; _m = _l.next()) {
                        var _o = tslib_1.__read(_m.value, 2), sourceFile = _o[0], references = _o[1];
                        // TODO(chuckj): Remove any cast after updating build to 2.6
                        sourceFile.referencedFiles = references;
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_m && !_m.done && (_c = _l.return)) _c.call(_l);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            this.emittedSourceFiles = emittedSourceFiles;
            // Match behavior of tsc: only produce emit diagnostics if it would block
            // emit. If noEmitOnError is false, the emit will happen in spite of any
            // errors, so we should not report them.
            if (emitResult && this.options.noEmitOnError === true) {
                // translate the diagnostics in the emitResult as well.
                var translatedEmitDiags = translate_diagnostics_1.translateDiagnostics(this.hostAdapter, emitResult.diagnostics);
                emitResult.diagnostics = translatedEmitDiags.ts.concat(this.structuralDiagnostics.concat(translatedEmitDiags.ng).map(util_1.ngToTsDiagnostic));
            }
            if (emitResult && !outSrcMapping.length) {
                // if no files were emitted by TypeScript, also don't emit .json files
                emitResult.diagnostics =
                    emitResult.diagnostics.concat([util_1.createMessageDiagnostic("Emitted no files.")]);
                return emitResult;
            }
            var sampleSrcFileName;
            var sampleOutFileName;
            if (outSrcMapping.length) {
                sampleSrcFileName = outSrcMapping[0].sourceFile.fileName;
                sampleOutFileName = outSrcMapping[0].outFileName;
            }
            var srcToOutPath = createSrcToOutPathMapper(this.options.outDir, sampleSrcFileName, sampleOutFileName);
            if (emitFlags & api_1.EmitFlags.Codegen) {
                genJsonFiles.forEach(function (gf) {
                    var outFileName = srcToOutPath(gf.genFileUrl);
                    _this.writeFile(outFileName, gf.source, false, undefined, gf);
                });
            }
            var metadataJsonCount = 0;
            if (emitFlags & api_1.EmitFlags.Metadata) {
                this.tsProgram.getSourceFiles().forEach(function (sf) {
                    if (!sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName)) {
                        metadataJsonCount++;
                        var metadata = _this.metadataCache.getMetadata(sf);
                        if (metadata) {
                            var metadataText = JSON.stringify([metadata]);
                            var outFileName = srcToOutPath(sf.fileName.replace(/\.tsx?$/, '.metadata.json'));
                            _this.writeFile(outFileName, metadataText, false, undefined, undefined, [sf]);
                        }
                    }
                });
            }
            var emitEnd = Date.now();
            if (emitResult && this.options.diagnostics) {
                emitResult.diagnostics = emitResult.diagnostics.concat([util_1.createMessageDiagnostic([
                        "Emitted in " + (emitEnd - emitStart) + "ms",
                        "- " + emittedUserTsCount + " user ts files",
                        "- " + genTsFiles.length + " generated ts files",
                        "- " + (genJsonFiles.length + metadataJsonCount) + " generated json files",
                    ].join('\n'))]);
            }
            return emitResult;
        };
        Object.defineProperty(AngularCompilerProgram.prototype, "compiler", {
            // Private members
            get: function () {
                if (!this._compiler) {
                    this._createCompiler();
                }
                return this._compiler;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "hostAdapter", {
            get: function () {
                if (!this._hostAdapter) {
                    this._createCompiler();
                }
                return this._hostAdapter;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "analyzedModules", {
            get: function () {
                if (!this._analyzedModules) {
                    this.initSync();
                }
                return this._analyzedModules;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "structuralDiagnostics", {
            get: function () {
                var diagnostics = this._structuralDiagnostics;
                if (!diagnostics) {
                    this.initSync();
                    diagnostics = (this._structuralDiagnostics = this._structuralDiagnostics || []);
                }
                return diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "tsProgram", {
            get: function () {
                if (!this._tsProgram) {
                    this.initSync();
                }
                return this._tsProgram;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AngularCompilerProgram.prototype, "isCompilingAngularCore", {
            /** Whether the program is compiling the Angular core package. */
            get: function () {
                if (this._isCompilingAngularCore !== null) {
                    return this._isCompilingAngularCore;
                }
                return this._isCompilingAngularCore = compiler_2.isAngularCorePackage(this.tsProgram);
            },
            enumerable: false,
            configurable: true
        });
        AngularCompilerProgram.prototype.calculateTransforms = function (genFiles, partialModules, customTransformers) {
            var beforeTs = [];
            var metadataTransforms = [];
            var flatModuleMetadataTransforms = [];
            var annotateForClosureCompiler = this.options.annotateForClosureCompiler || false;
            if (this.options.enableResourceInlining) {
                beforeTs.push(inline_resources_1.getInlineResourcesTransformFactory(this.tsProgram, this.hostAdapter));
                var transformer = new inline_resources_1.InlineResourcesMetadataTransformer(this.hostAdapter);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (!this.options.disableExpressionLowering) {
                beforeTs.push(lower_expressions_1.getExpressionLoweringTransformFactory(this.loweringMetadataTransform, this.tsProgram));
                metadataTransforms.push(this.loweringMetadataTransform);
            }
            if (genFiles) {
                beforeTs.push(node_emitter_transform_1.getAngularEmitterTransformFactory(genFiles, this.getTsProgram(), annotateForClosureCompiler));
            }
            if (partialModules) {
                beforeTs.push(r3_transform_1.getAngularClassTransformerFactory(partialModules, annotateForClosureCompiler));
                // If we have partial modules, the cached metadata might be incorrect as it doesn't reflect
                // the partial module transforms.
                var transformer = new r3_metadata_transform_1.PartialModuleMetadataTransformer(partialModules);
                metadataTransforms.push(transformer);
                flatModuleMetadataTransforms.push(transformer);
            }
            if (customTransformers && customTransformers.beforeTs) {
                beforeTs.push.apply(beforeTs, tslib_1.__spread(customTransformers.beforeTs));
            }
            // If decorators should be converted to static fields (enabled by default), we set up
            // the decorator downlevel transform. Note that we set it up as last transform as that
            // allows custom transformers to strip Angular decorators without having to deal with
            // identifying static properties. e.g. it's more difficult handling `<..>.decorators`
            // or `<..>.ctorParameters` compared to the `ts.Decorator` AST nodes.
            if (this.options.annotationsAs !== 'decorators') {
                var typeChecker = this.getTsProgram().getTypeChecker();
                var reflectionHost = new reflection_1.TypeScriptReflectionHost(typeChecker);
                // Similarly to how we handled tsickle decorator downleveling in the past, we just
                // ignore diagnostics that have been collected by the transformer. These are
                // non-significant failures that shouldn't prevent apps from compiling.
                beforeTs.push(downlevel_decorators_transform_1.getDownlevelDecoratorsTransform(typeChecker, reflectionHost, [], this.isCompilingAngularCore, annotateForClosureCompiler, 
                /* skipClassDecorators */ false));
            }
            if (metadataTransforms.length > 0) {
                this.metadataCache = this.createMetadataCache(metadataTransforms);
            }
            if (flatModuleMetadataTransforms.length > 0) {
                this.flatModuleMetadataCache = this.createMetadataCache(flatModuleMetadataTransforms);
            }
            var afterTs = customTransformers ? customTransformers.afterTs : undefined;
            return { before: beforeTs, after: afterTs };
        };
        AngularCompilerProgram.prototype.initSync = function () {
            if (this._analyzedModules) {
                return;
            }
            try {
                var _a = this._createProgramWithBasicStubs(), tmpProgram = _a.tmpProgram, sourceFiles = _a.sourceFiles, tsFiles = _a.tsFiles, rootNames = _a.rootNames;
                var _b = this.compiler.loadFilesSync(sourceFiles, tsFiles), analyzedModules = _b.analyzedModules, analyzedInjectables = _b.analyzedInjectables;
                this._updateProgramWithTypeCheckStubs(tmpProgram, analyzedModules, analyzedInjectables, rootNames);
            }
            catch (e) {
                this._createProgramOnError(e);
            }
        };
        AngularCompilerProgram.prototype._createCompiler = function () {
            var _this = this;
            var codegen = {
                generateFile: function (genFileName, baseFileName) {
                    return _this._compiler.emitBasicStub(genFileName, baseFileName);
                },
                findGeneratedFileNames: function (fileName) { return _this._compiler.findGeneratedFileNames(fileName); },
            };
            this._hostAdapter = new compiler_host_1.TsCompilerAotCompilerTypeCheckHostAdapter(this.rootNames, this.options, this.host, this.metadataCache, codegen, this.oldProgramLibrarySummaries);
            var aotOptions = getAotCompilerOptions(this.options);
            var errorCollector = (this.options.collectAllErrors || this.options.fullTemplateTypeCheck) ?
                function (err) { return _this._addStructuralDiagnostics(err); } :
                undefined;
            this._compiler = compiler_1.createAotCompiler(this._hostAdapter, aotOptions, errorCollector).compiler;
        };
        AngularCompilerProgram.prototype._createProgramWithBasicStubs = function () {
            var _this = this;
            if (this._analyzedModules) {
                throw new Error("Internal Error: already initialized!");
            }
            // Note: This is important to not produce a memory leak!
            var oldTsProgram = this.oldTsProgram;
            this.oldTsProgram = undefined;
            var codegen = {
                generateFile: function (genFileName, baseFileName) {
                    return _this.compiler.emitBasicStub(genFileName, baseFileName);
                },
                findGeneratedFileNames: function (fileName) { return _this.compiler.findGeneratedFileNames(fileName); },
            };
            var rootNames = tslib_1.__spread(this.rootNames);
            if (this.options.generateCodeForLibraries !== false) {
                // if we should generateCodeForLibraries, never include
                // generated files in the program as otherwise we will
                // overwrite them and typescript will report the error
                // TS5055: Cannot write file ... because it would overwrite input file.
                rootNames = rootNames.filter(function (fn) { return !util_1.GENERATED_FILES.test(fn); });
            }
            if (this.options.noResolve) {
                this.rootNames.forEach(function (rootName) {
                    if (_this.hostAdapter.shouldGenerateFilesFor(rootName)) {
                        rootNames.push.apply(rootNames, tslib_1.__spread(_this.compiler.findGeneratedFileNames(rootName)));
                    }
                });
            }
            var tmpProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, oldTsProgram);
            if (tempProgramHandlerForTest !== null) {
                tempProgramHandlerForTest(tmpProgram);
            }
            var sourceFiles = [];
            var tsFiles = [];
            tmpProgram.getSourceFiles().forEach(function (sf) {
                if (_this.hostAdapter.isSourceFile(sf.fileName)) {
                    sourceFiles.push(sf.fileName);
                }
                if (util_1.TS.test(sf.fileName) && !util_1.DTS.test(sf.fileName)) {
                    tsFiles.push(sf.fileName);
                }
            });
            return { tmpProgram: tmpProgram, sourceFiles: sourceFiles, tsFiles: tsFiles, rootNames: rootNames };
        };
        AngularCompilerProgram.prototype._updateProgramWithTypeCheckStubs = function (tmpProgram, analyzedModules, analyzedInjectables, rootNames) {
            var _this = this;
            this._analyzedModules = analyzedModules;
            this._analyzedInjectables = analyzedInjectables;
            tmpProgram.getSourceFiles().forEach(function (sf) {
                if (sf.fileName.endsWith('.ngfactory.ts')) {
                    var _a = _this.hostAdapter.shouldGenerateFile(sf.fileName), generate = _a.generate, baseFileName = _a.baseFileName;
                    if (generate) {
                        // Note: ! is ok as hostAdapter.shouldGenerateFile will always return a baseFileName
                        // for .ngfactory.ts files.
                        var genFile = _this.compiler.emitTypeCheckStub(sf.fileName, baseFileName);
                        if (genFile) {
                            _this.hostAdapter.updateGeneratedFile(genFile);
                        }
                    }
                }
            });
            this._tsProgram = ts.createProgram(rootNames, this.options, this.hostAdapter, tmpProgram);
            // Note: the new ts program should be completely reusable by TypeScript as:
            // - we cache all the files in the hostAdapter
            // - new new stubs use the exactly same imports/exports as the old once (we assert that in
            // hostAdapter.updateGeneratedFile).
            // TS 4.1+ stores the reuse state in the new program
            var checkReuseProgram = ts.versionMajorMinor === '4.0' ? tmpProgram : this._tsProgram;
            if (util_1.tsStructureIsReused(checkReuseProgram) !== 2 /* Completely */) {
                throw new Error("Internal Error: The structure of the program changed during codegen.");
            }
        };
        AngularCompilerProgram.prototype._createProgramOnError = function (e) {
            // Still fill the analyzedModules and the tsProgram
            // so that we don't cause other errors for users who e.g. want to emit the ngProgram.
            this._analyzedModules = emptyModules;
            this.oldTsProgram = undefined;
            this._hostAdapter.isSourceFile = function () { return false; };
            this._tsProgram = ts.createProgram(this.rootNames, this.options, this.hostAdapter);
            if (compiler_1.isSyntaxError(e)) {
                this._addStructuralDiagnostics(e);
                return;
            }
            throw e;
        };
        AngularCompilerProgram.prototype._addStructuralDiagnostics = function (error) {
            var diagnostics = this._structuralDiagnostics || (this._structuralDiagnostics = []);
            if (compiler_1.isSyntaxError(error)) {
                diagnostics.push.apply(diagnostics, tslib_1.__spread(syntaxErrorToDiagnostics(error, this.tsProgram)));
            }
            else {
                diagnostics.push({
                    messageText: error.toString(),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE
                });
            }
        };
        // Note: this returns a ts.Diagnostic so that we
        // can return errors in a ts.EmitResult
        AngularCompilerProgram.prototype.generateFilesForEmit = function (emitFlags) {
            var _this = this;
            try {
                if (!(emitFlags & api_1.EmitFlags.Codegen)) {
                    return { genFiles: [], genDiags: [] };
                }
                // TODO(tbosch): allow generating files that are not in the rootDir
                // See https://github.com/angular/angular/issues/19337
                var genFiles = this.compiler.emitAllImpls(this.analyzedModules)
                    .filter(function (genFile) { return util_1.isInRootDir(genFile.genFileUrl, _this.options); });
                if (this.oldProgramEmittedGeneratedFiles) {
                    var oldProgramEmittedGeneratedFiles_1 = this.oldProgramEmittedGeneratedFiles;
                    genFiles = genFiles.filter(function (genFile) {
                        var oldGenFile = oldProgramEmittedGeneratedFiles_1.get(genFile.genFileUrl);
                        return !oldGenFile || !genFile.isEquivalent(oldGenFile);
                    });
                }
                return { genFiles: genFiles, genDiags: [] };
            }
            catch (e) {
                // TODO(tbosch): check whether we can actually have syntax errors here,
                // as we already parsed the metadata and templates before to create the type check block.
                if (compiler_1.isSyntaxError(e)) {
                    var genDiags = [{
                            file: undefined,
                            start: undefined,
                            length: undefined,
                            messageText: e.message,
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
                    return { genFiles: [], genDiags: genDiags };
                }
                throw e;
            }
        };
        /**
         * Returns undefined if all files should be emitted.
         */
        AngularCompilerProgram.prototype.getSourceFilesForEmit = function () {
            var _this = this;
            // TODO(tbosch): if one of the files contains a `const enum`
            // always emit all files -> return undefined!
            var sourceFilesToEmit = this.tsProgram.getSourceFiles().filter(function (sf) {
                return !sf.isDeclarationFile && !util_1.GENERATED_FILES.test(sf.fileName);
            });
            if (this.oldProgramEmittedSourceFiles) {
                sourceFilesToEmit = sourceFilesToEmit.filter(function (sf) {
                    var oldFile = _this.oldProgramEmittedSourceFiles.get(sf.fileName);
                    return sf !== oldFile;
                });
            }
            return sourceFilesToEmit;
        };
        AngularCompilerProgram.prototype.writeFile = function (outFileName, outData, writeByteOrderMark, onError, genFile, sourceFiles) {
            // collect emittedLibrarySummaries
            var baseFile;
            if (genFile) {
                baseFile = this.tsProgram.getSourceFile(genFile.srcFileUrl);
                if (baseFile) {
                    if (!this.emittedLibrarySummaries) {
                        this.emittedLibrarySummaries = [];
                    }
                    if (genFile.genFileUrl.endsWith('.ngsummary.json') && baseFile.fileName.endsWith('.d.ts')) {
                        this.emittedLibrarySummaries.push({
                            fileName: baseFile.fileName,
                            text: baseFile.text,
                            sourceFile: baseFile,
                        });
                        this.emittedLibrarySummaries.push({ fileName: genFile.genFileUrl, text: outData });
                        if (!this.options.declaration) {
                            // If we don't emit declarations, still record an empty .ngfactory.d.ts file,
                            // as we might need it later on for resolving module names from summaries.
                            var ngFactoryDts = genFile.genFileUrl.substring(0, genFile.genFileUrl.length - 15) + '.ngfactory.d.ts';
                            this.emittedLibrarySummaries.push({ fileName: ngFactoryDts, text: '' });
                        }
                    }
                    else if (outFileName.endsWith('.d.ts') && baseFile.fileName.endsWith('.d.ts')) {
                        var dtsSourceFilePath = genFile.genFileUrl.replace(/\.ts$/, '.d.ts');
                        // Note: Don't use sourceFiles here as the created .d.ts has a path in the outDir,
                        // but we need one that is next to the .ts file
                        this.emittedLibrarySummaries.push({ fileName: dtsSourceFilePath, text: outData });
                    }
                }
            }
            // Filter out generated files for which we didn't generate code.
            // This can happen as the stub calculation is not completely exact.
            // Note: sourceFile refers to the .ngfactory.ts / .ngsummary.ts file
            // node_emitter_transform already set the file contents to be empty,
            //  so this code only needs to skip the file if !allowEmptyCodegenFiles.
            var isGenerated = util_1.GENERATED_FILES.test(outFileName);
            if (isGenerated && !this.options.allowEmptyCodegenFiles &&
                (!genFile || !genFile.stmts || genFile.stmts.length === 0)) {
                return;
            }
            if (baseFile) {
                sourceFiles = sourceFiles ? tslib_1.__spread(sourceFiles, [baseFile]) : [baseFile];
            }
            // TODO: remove any when TS 2.4 support is removed.
            this.host.writeFile(outFileName, outData, writeByteOrderMark, onError, sourceFiles);
        };
        return AngularCompilerProgram;
    }());
    function createProgram(_a) {
        var rootNames = _a.rootNames, options = _a.options, host = _a.host, oldProgram = _a.oldProgram;
        if (options.enableIvy !== false) {
            return new program_1.NgtscProgram(rootNames, options, host, oldProgram);
        }
        else {
            return new AngularCompilerProgram(rootNames, options, host, oldProgram);
        }
    }
    exports.createProgram = createProgram;
    // Compute the AotCompiler options
    function getAotCompilerOptions(options) {
        var missingTranslation = compiler_1.core.MissingTranslationStrategy.Warning;
        switch (options.i18nInMissingTranslations) {
            case 'ignore':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
                break;
            case 'error':
                missingTranslation = compiler_1.core.MissingTranslationStrategy.Error;
                break;
        }
        var translations = '';
        if (options.i18nInFile) {
            if (!options.i18nInLocale) {
                throw new Error("The translation file (" + options.i18nInFile + ") locale must be provided.");
            }
            translations = fs.readFileSync(options.i18nInFile, 'utf8');
        }
        else {
            // No translations are provided, ignore any errors
            // We still go through i18n to remove i18n attributes
            missingTranslation = compiler_1.core.MissingTranslationStrategy.Ignore;
        }
        return {
            locale: options.i18nInLocale,
            i18nFormat: options.i18nInFormat || options.i18nOutFormat,
            i18nUseExternalIds: options.i18nUseExternalIds,
            translations: translations,
            missingTranslation: missingTranslation,
            enableSummariesForJit: options.enableSummariesForJit,
            preserveWhitespaces: options.preserveWhitespaces,
            fullTemplateTypeCheck: options.fullTemplateTypeCheck,
            allowEmptyCodegenFiles: options.allowEmptyCodegenFiles,
            enableIvy: options.enableIvy,
            createExternalSymbolFactoryReexports: options.createExternalSymbolFactoryReexports,
        };
    }
    function getNgOptionDiagnostics(options) {
        if (options.annotationsAs) {
            switch (options.annotationsAs) {
                case 'decorators':
                case 'static fields':
                    break;
                default:
                    return [{
                            messageText: 'Angular compiler options "annotationsAs" only supports "static fields" and "decorators"',
                            category: ts.DiagnosticCategory.Error,
                            source: api_1.SOURCE,
                            code: api_1.DEFAULT_ERROR_CODE
                        }];
            }
        }
        return [];
    }
    function normalizeSeparators(path) {
        return path.replace(/\\/g, '/');
    }
    /**
     * Returns a function that can adjust a path from source path to out path,
     * based on an existing mapping from source to out path.
     *
     * TODO(tbosch): talk to the TypeScript team to expose their logic for calculating the `rootDir`
     * if none was specified.
     *
     * Note: This function works on normalized paths from typescript but should always return
     * POSIX normalized paths for output paths.
     */
    function createSrcToOutPathMapper(outDir, sampleSrcFileName, sampleOutFileName, host) {
        if (host === void 0) { host = path; }
        if (outDir) {
            var path_1 = {}; // Ensure we error if we use `path` instead of `host`.
            if (sampleSrcFileName == null || sampleOutFileName == null) {
                throw new Error("Can't calculate the rootDir without a sample srcFileName / outFileName. ");
            }
            var srcFileDir = normalizeSeparators(host.dirname(sampleSrcFileName));
            var outFileDir = normalizeSeparators(host.dirname(sampleOutFileName));
            if (srcFileDir === outFileDir) {
                return function (srcFileName) { return srcFileName; };
            }
            // calculate the common suffix, stopping
            // at `outDir`.
            var srcDirParts = srcFileDir.split('/');
            var outDirParts = normalizeSeparators(host.relative(outDir, outFileDir)).split('/');
            var i = 0;
            while (i < Math.min(srcDirParts.length, outDirParts.length) &&
                srcDirParts[srcDirParts.length - 1 - i] === outDirParts[outDirParts.length - 1 - i])
                i++;
            var rootDir_1 = srcDirParts.slice(0, srcDirParts.length - i).join('/');
            return function (srcFileName) {
                // Note: Before we return the mapped output path, we need to normalize the path delimiters
                // because the output path is usually passed to TypeScript which sometimes only expects
                // posix normalized paths (e.g. if a custom compiler host is used)
                return normalizeSeparators(host.resolve(outDir, host.relative(rootDir_1, srcFileName)));
            };
        }
        else {
            // Note: Before we return the output path, we need to normalize the path delimiters because
            // the output path is usually passed to TypeScript which only passes around posix
            // normalized paths (e.g. if a custom compiler host is used)
            return function (srcFileName) { return normalizeSeparators(srcFileName); };
        }
    }
    exports.createSrcToOutPathMapper = createSrcToOutPathMapper;
    function i18nExtract(formatName, outFile, host, options, bundle) {
        formatName = formatName || 'xlf';
        // Checks the format and returns the extension
        var ext = i18nGetExtension(formatName);
        var content = i18nSerialize(bundle, formatName, options);
        var dstFile = outFile || "messages." + ext;
        var dstPath = path.resolve(options.outDir || options.basePath, dstFile);
        host.writeFile(dstPath, content, false, undefined, []);
        return [dstPath];
    }
    exports.i18nExtract = i18nExtract;
    function i18nSerialize(bundle, formatName, options) {
        var format = formatName.toLowerCase();
        var serializer;
        switch (format) {
            case 'xmb':
                serializer = new compiler_1.Xmb();
                break;
            case 'xliff2':
            case 'xlf2':
                serializer = new compiler_1.Xliff2();
                break;
            case 'xlf':
            case 'xliff':
            default:
                serializer = new compiler_1.Xliff();
        }
        return bundle.write(serializer, getPathNormalizer(options.basePath));
    }
    exports.i18nSerialize = i18nSerialize;
    function getPathNormalizer(basePath) {
        // normalize source paths by removing the base path and always using "/" as a separator
        return function (sourcePath) {
            sourcePath = basePath ? path.relative(basePath, sourcePath) : sourcePath;
            return sourcePath.split(path.sep).join('/');
        };
    }
    function i18nGetExtension(formatName) {
        var format = formatName.toLowerCase();
        switch (format) {
            case 'xmb':
                return 'xmb';
            case 'xlf':
            case 'xlif':
            case 'xliff':
            case 'xlf2':
            case 'xliff2':
                return 'xlf';
        }
        throw new Error("Unsupported format \"" + formatName + "\"");
    }
    exports.i18nGetExtension = i18nGetExtension;
    function mergeEmitResults(emitResults) {
        var e_3, _a;
        var diagnostics = [];
        var emitSkipped = false;
        var emittedFiles = [];
        try {
            for (var emitResults_1 = tslib_1.__values(emitResults), emitResults_1_1 = emitResults_1.next(); !emitResults_1_1.done; emitResults_1_1 = emitResults_1.next()) {
                var er = emitResults_1_1.value;
                diagnostics.push.apply(diagnostics, tslib_1.__spread(er.diagnostics));
                emitSkipped = emitSkipped || er.emitSkipped;
                emittedFiles.push.apply(emittedFiles, tslib_1.__spread((er.emittedFiles || [])));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (emitResults_1_1 && !emitResults_1_1.done && (_a = emitResults_1.return)) _a.call(emitResults_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return { diagnostics: diagnostics, emitSkipped: emitSkipped, emittedFiles: emittedFiles };
    }
    function diagnosticSourceOfSpan(span) {
        // For diagnostics, TypeScript only uses the fileName and text properties.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName: span.start.file.url, text: span.start.file.content };
    }
    function diagnosticSourceOfFileName(fileName, program) {
        var sourceFile = program.getSourceFile(fileName);
        if (sourceFile)
            return sourceFile;
        // If we are reporting diagnostics for a source file that is not in the project then we need
        // to fake a source file so the diagnostic formatting routines can emit the file name.
        // The redundant '()' are here is to avoid having clang-format breaking the line incorrectly.
        return { fileName: fileName, text: '' };
    }
    function diagnosticChainFromFormattedDiagnosticChain(chain) {
        return {
            messageText: chain.message,
            next: chain.next && chain.next.map(diagnosticChainFromFormattedDiagnosticChain),
            position: chain.position
        };
    }
    function syntaxErrorToDiagnostics(error, program) {
        var parserErrors = compiler_1.getParseErrors(error);
        if (parserErrors && parserErrors.length) {
            return parserErrors.map(function (e) { return ({
                messageText: e.contextualMessage(),
                file: diagnosticSourceOfSpan(e.span),
                start: e.span.start.offset,
                length: e.span.end.offset - e.span.start.offset,
                category: ts.DiagnosticCategory.Error,
                source: api_1.SOURCE,
                code: api_1.DEFAULT_ERROR_CODE
            }); });
        }
        else if (compiler_1.isFormattedError(error)) {
            return [{
                    messageText: error.message,
                    chain: error.chain && diagnosticChainFromFormattedDiagnosticChain(error.chain),
                    category: ts.DiagnosticCategory.Error,
                    source: api_1.SOURCE,
                    code: api_1.DEFAULT_ERROR_CODE,
                    position: error.position
                }];
        }
        var ngModuleErrorData = compiler_1.getMissingNgModuleMetadataErrorData(error);
        if (ngModuleErrorData !== null) {
            // This error represents the import or export of an `NgModule` that didn't have valid metadata.
            // This _might_ happen because the NgModule in question is an Ivy-compiled library, and we want
            // to show a more useful error if that's the case.
            var ngModuleClass = getDtsClass(program, ngModuleErrorData.fileName, ngModuleErrorData.className);
            if (ngModuleClass !== null && isIvyNgModule(ngModuleClass)) {
                return [{
                        messageText: "The NgModule '" + ngModuleErrorData.className + "' in '" + ngModuleErrorData
                            .fileName + "' is imported by this compilation, but appears to be part of a library compiled for Angular Ivy. This may occur because:\n\n  1) the library was processed with 'ngcc'. Removing and reinstalling node_modules may fix this problem.\n\n  2) the library was published for Angular Ivy and v12+ applications only. Check its peer dependencies carefully and ensure that you're using a compatible version of Angular.\n\nSee https://angular.io/errors/NG6999 for more information.\n",
                        category: ts.DiagnosticCategory.Error,
                        code: api_1.DEFAULT_ERROR_CODE,
                        source: api_1.SOURCE,
                    }];
            }
        }
        // Produce a Diagnostic anyway since we know for sure `error` is a SyntaxError
        return [{
                messageText: error.message,
                category: ts.DiagnosticCategory.Error,
                code: api_1.DEFAULT_ERROR_CODE,
                source: api_1.SOURCE,
            }];
    }
    function getDtsClass(program, fileName, className) {
        var e_4, _a;
        var sf = program.getSourceFile(fileName);
        if (sf === undefined || !sf.isDeclarationFile) {
            return null;
        }
        try {
            for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                var stmt = _c.value;
                if (!ts.isClassDeclaration(stmt)) {
                    continue;
                }
                if (stmt.name === undefined || stmt.name.text !== className) {
                    continue;
                }
                return stmt;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        // No classes found that matched the given name.
        return null;
    }
    function isIvyNgModule(clazz) {
        var e_5, _a;
        try {
            for (var _b = tslib_1.__values(clazz.members), _c = _b.next(); !_c.done; _c = _b.next()) {
                var member = _c.value;
                if (!ts.isPropertyDeclaration(member)) {
                    continue;
                }
                if (ts.isIdentifier(member.name) && member.name.text === 'ɵmod') {
                    return true;
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        // No Ivy 'ɵmod' property found.
        return false;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvdHJhbnNmb3JtZXJzL3Byb2dyYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUF3VjtJQUN4Vix1QkFBeUI7SUFDekIsMkJBQTZCO0lBQzdCLCtCQUFpQztJQUVqQyxxR0FBMEU7SUFDMUUscUVBQXFFO0lBQ3JFLDhFQUFnRTtJQUNoRSxtRUFBOEM7SUFDOUMseUVBQTZEO0lBQzdELG1GQUF1RTtJQUV2RSxrRUFBbU87SUFDbk8sc0ZBQWdIO0lBQ2hILHdIQUFpRjtJQUNqRiw0RkFBMEc7SUFDMUcsOEZBQWtHO0lBQ2xHLHdGQUFvRTtJQUNwRSx3R0FBMkU7SUFDM0Usc0dBQXlFO0lBQ3pFLG9GQUFpRTtJQUNqRSxvRUFBZ0o7SUFHaEo7OztPQUdHO0lBQ0gsSUFBTSxtQ0FBbUMsR0FBRyxFQUFFLENBQUM7SUFHL0M7O09BRUc7SUFDSCxJQUFNLFlBQVksR0FBRyxDQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUU5RTs7T0FFRztJQUNILElBQU0sZUFBZSxvQkFBTyxZQUFZLEdBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUMsQ0FBQztJQUU3RTs7T0FFRztJQUNILElBQUkseUJBQXlCLEdBQXlDLElBQUksQ0FBQztJQUMzRSxTQUFnQiw0QkFBNEIsQ0FBQyxPQUFzQztRQUNqRix5QkFBeUIsR0FBRyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUZELG9FQUVDO0lBQ0QsU0FBZ0IsOEJBQThCO1FBQzVDLHlCQUF5QixHQUFHLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRkQsd0VBRUM7SUFFRCxJQUFNLFlBQVksR0FBc0I7UUFDdEMsU0FBUyxFQUFFLEVBQUU7UUFDYix5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QUFDLEtBQTBCOzs7WUFDL0MsS0FBcUIsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxPQUFPLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQS9CLElBQU0sTUFBTSxXQUFBO2dCQUNmLElBQUksQ0FBQyxFQUFFLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3JDLFNBQVM7aUJBQ1Y7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUU7b0JBQy9ELE9BQU8sSUFBSSxDQUFDO2lCQUNiO2FBQ0Y7Ozs7Ozs7OztRQUVELGdDQUFnQztRQUNoQyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FvdENvbXBpbGVyLCBBb3RDb21waWxlck9wdGlvbnMsIGNvcmUsIGNyZWF0ZUFvdENvbXBpbGVyLCBGb3JtYXR0ZWRNZXNzYWdlQ2hhaW4sIEdlbmVyYXRlZEZpbGUsIGdldE1pc3NpbmdOZ01vZHVsZU1ldGFkYXRhRXJyb3JEYXRhLCBnZXRQYXJzZUVycm9ycywgaXNGb3JtYXR0ZWRFcnJvciwgaXNTeW50YXhFcnJvciwgTWVzc2FnZUJ1bmRsZSwgTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXMsIE5nQW5hbHl6ZWRNb2R1bGVzLCBQYXJzZVNvdXJjZVNwYW4sIFBhcnRpYWxNb2R1bGUsIFNlcmlhbGl6ZXIsIFhsaWZmLCBYbGlmZjIsIFhtYn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge3RyYW5zbGF0ZURpYWdub3N0aWNzfSBmcm9tICcuLi9kaWFnbm9zdGljcy90cmFuc2xhdGVfZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtjcmVhdGVCdW5kbGVJbmRleEhvc3QsIE1ldGFkYXRhQ29sbGVjdG9yfSBmcm9tICcuLi9tZXRhZGF0YSc7XG5pbXBvcnQge2lzQW5ndWxhckNvcmVQYWNrYWdlfSBmcm9tICcuLi9uZ3RzYy9jb3JlL3NyYy9jb21waWxlcic7XG5pbXBvcnQge05ndHNjUHJvZ3JhbX0gZnJvbSAnLi4vbmd0c2MvcHJvZ3JhbSc7XG5pbXBvcnQge1R5cGVTY3JpcHRSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vbmd0c2MvcmVmbGVjdGlvbic7XG5pbXBvcnQge3ZlcmlmeVN1cHBvcnRlZFR5cGVTY3JpcHRWZXJzaW9ufSBmcm9tICcuLi90eXBlc2NyaXB0X3N1cHBvcnQnO1xuXG5pbXBvcnQge0NvbXBpbGVySG9zdCwgQ29tcGlsZXJPcHRpb25zLCBDdXN0b21UcmFuc2Zvcm1lcnMsIERFRkFVTFRfRVJST1JfQ09ERSwgRGlhZ25vc3RpYywgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiwgRW1pdEZsYWdzLCBMYXp5Um91dGUsIExpYnJhcnlTdW1tYXJ5LCBQcm9ncmFtLCBTT1VSQ0UsIFRzRW1pdENhbGxiYWNrLCBUc01lcmdlRW1pdFJlc3VsdHNDYWxsYmFja30gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHtDb2RlR2VuZXJhdG9yLCBnZXRPcmlnaW5hbFJlZmVyZW5jZXMsIFRzQ29tcGlsZXJBb3RDb21waWxlclR5cGVDaGVja0hvc3RBZGFwdGVyfSBmcm9tICcuL2NvbXBpbGVyX2hvc3QnO1xuaW1wb3J0IHtnZXREb3dubGV2ZWxEZWNvcmF0b3JzVHJhbnNmb3JtfSBmcm9tICcuL2Rvd25sZXZlbF9kZWNvcmF0b3JzX3RyYW5zZm9ybSc7XG5pbXBvcnQge2dldElubGluZVJlc291cmNlc1RyYW5zZm9ybUZhY3RvcnksIElubGluZVJlc291cmNlc01ldGFkYXRhVHJhbnNmb3JtZXJ9IGZyb20gJy4vaW5saW5lX3Jlc291cmNlcyc7XG5pbXBvcnQge2dldEV4cHJlc3Npb25Mb3dlcmluZ1RyYW5zZm9ybUZhY3RvcnksIExvd2VyTWV0YWRhdGFUcmFuc2Zvcm19IGZyb20gJy4vbG93ZXJfZXhwcmVzc2lvbnMnO1xuaW1wb3J0IHtNZXRhZGF0YUNhY2hlLCBNZXRhZGF0YVRyYW5zZm9ybWVyfSBmcm9tICcuL21ldGFkYXRhX2NhY2hlJztcbmltcG9ydCB7Z2V0QW5ndWxhckVtaXR0ZXJUcmFuc2Zvcm1GYWN0b3J5fSBmcm9tICcuL25vZGVfZW1pdHRlcl90cmFuc2Zvcm0nO1xuaW1wb3J0IHtQYXJ0aWFsTW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1lcn0gZnJvbSAnLi9yM19tZXRhZGF0YV90cmFuc2Zvcm0nO1xuaW1wb3J0IHtnZXRBbmd1bGFyQ2xhc3NUcmFuc2Zvcm1lckZhY3Rvcnl9IGZyb20gJy4vcjNfdHJhbnNmb3JtJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZURpYWdub3N0aWMsIERUUywgR0VORVJBVEVEX0ZJTEVTLCBpc0luUm9vdERpciwgbmdUb1RzRGlhZ25vc3RpYywgU3RydWN0dXJlSXNSZXVzZWQsIFRTLCB0c1N0cnVjdHVyZUlzUmV1c2VkfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogTWF4aW11bSBudW1iZXIgb2YgZmlsZXMgdGhhdCBhcmUgZW1pdGFibGUgdmlhIGNhbGxpbmcgdHMuUHJvZ3JhbS5lbWl0XG4gKiBwYXNzaW5nIGluZGl2aWR1YWwgdGFyZ2V0U291cmNlRmlsZXMuXG4gKi9cbmNvbnN0IE1BWF9GSUxFX0NPVU5UX0ZPUl9TSU5HTEVfRklMRV9FTUlUID0gMjA7XG5cblxuLyoqXG4gKiBGaWVsZHMgdG8gbG93ZXIgd2l0aGluIG1ldGFkYXRhIGluIHJlbmRlcjIgbW9kZS5cbiAqL1xuY29uc3QgTE9XRVJfRklFTERTID0gWyd1c2VWYWx1ZScsICd1c2VGYWN0b3J5JywgJ2RhdGEnLCAnaWQnLCAnbG9hZENoaWxkcmVuJ107XG5cbi8qKlxuICogRmllbGRzIHRvIGxvd2VyIHdpdGhpbiBtZXRhZGF0YSBpbiByZW5kZXIzIG1vZGUuXG4gKi9cbmNvbnN0IFIzX0xPV0VSX0ZJRUxEUyA9IFsuLi5MT1dFUl9GSUVMRFMsICdwcm92aWRlcnMnLCAnaW1wb3J0cycsICdleHBvcnRzJ107XG5cbi8qKlxuICogSW5zdGFsbHMgYSBoYW5kbGVyIGZvciB0ZXN0aW5nIHB1cnBvc2VzIHRvIGFsbG93IGluc3BlY3Rpb24gb2YgdGhlIHRlbXBvcmFyeSBwcm9ncmFtLlxuICovXG5sZXQgdGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdDogKChwcm9ncmFtOiB0cy5Qcm9ncmFtKSA9PiB2b2lkKXxudWxsID0gbnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRUZW1wUHJvZ3JhbUhhbmRsZXJGb3JUZXN0KGhhbmRsZXI6IChwcm9ncmFtOiB0cy5Qcm9ncmFtKSA9PiB2b2lkKTogdm9pZCB7XG4gIHRlbXBQcm9ncmFtSGFuZGxlckZvclRlc3QgPSBoYW5kbGVyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0VGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdCgpOiB2b2lkIHtcbiAgdGVtcFByb2dyYW1IYW5kbGVyRm9yVGVzdCA9IG51bGw7XG59XG5cbmNvbnN0IGVtcHR5TW9kdWxlczogTmdBbmFseXplZE1vZHVsZXMgPSB7XG4gIG5nTW9kdWxlczogW10sXG4gIG5nTW9kdWxlQnlQaXBlT3JEaXJlY3RpdmU6IG5ldyBNYXAoKSxcbiAgZmlsZXM6IFtdXG59O1xuXG5jb25zdCBkZWZhdWx0RW1pdENhbGxiYWNrOiBUc0VtaXRDYWxsYmFjayA9ICh7XG4gIHByb2dyYW0sXG4gIHRhcmdldFNvdXJjZUZpbGUsXG4gIHdyaXRlRmlsZSxcbiAgY2FuY2VsbGF0aW9uVG9rZW4sXG4gIGVtaXRPbmx5RHRzRmlsZXMsXG4gIGN1c3RvbVRyYW5zZm9ybWVyc1xufSkgPT5cbiAgICBwcm9ncmFtLmVtaXQoXG4gICAgICAgIHRhcmdldFNvdXJjZUZpbGUsIHdyaXRlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4sIGVtaXRPbmx5RHRzRmlsZXMsIGN1c3RvbVRyYW5zZm9ybWVycyk7XG5cbmNsYXNzIEFuZ3VsYXJDb21waWxlclByb2dyYW0gaW1wbGVtZW50cyBQcm9ncmFtIHtcbiAgcHJpdmF0ZSByb290TmFtZXM6IHN0cmluZ1tdO1xuICBwcml2YXRlIG1ldGFkYXRhQ2FjaGU6IE1ldGFkYXRhQ2FjaGU7XG4gIC8vIE1ldGFkYXRhIGNhY2hlIHVzZWQgZXhjbHVzaXZlbHkgZm9yIHRoZSBmbGF0IG1vZHVsZSBpbmRleFxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBmbGF0TW9kdWxlTWV0YWRhdGFDYWNoZSE6IE1ldGFkYXRhQ2FjaGU7XG4gIHByaXZhdGUgbG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybTogTG93ZXJNZXRhZGF0YVRyYW5zZm9ybTtcbiAgcHJpdmF0ZSBvbGRQcm9ncmFtTGlicmFyeVN1bW1hcmllczogTWFwPHN0cmluZywgTGlicmFyeVN1bW1hcnk+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBvbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzOiBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPnx1bmRlZmluZWQ7XG4gIHByaXZhdGUgb2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlczogTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT58dW5kZWZpbmVkO1xuICAvLyBOb3RlOiBUaGlzIHdpbGwgYmUgY2xlYXJlZCBvdXQgYXMgc29vbiBhcyB3ZSBjcmVhdGUgdGhlIF90c1Byb2dyYW1cbiAgcHJpdmF0ZSBvbGRUc1Byb2dyYW06IHRzLlByb2dyYW18dW5kZWZpbmVkO1xuICBwcml2YXRlIGVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzOiBMaWJyYXJ5U3VtbWFyeVtdfHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBlbWl0dGVkR2VuZXJhdGVkRmlsZXM6IEdlbmVyYXRlZEZpbGVbXXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgZW1pdHRlZFNvdXJjZUZpbGVzOiB0cy5Tb3VyY2VGaWxlW118dW5kZWZpbmVkO1xuXG4gIC8vIExhemlseSBpbml0aWFsaXplZCBmaWVsZHNcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2NvbXBpbGVyITogQW90Q29tcGlsZXI7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9ob3N0QWRhcHRlciE6IFRzQ29tcGlsZXJBb3RDb21waWxlclR5cGVDaGVja0hvc3RBZGFwdGVyO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfdHNQcm9ncmFtITogdHMuUHJvZ3JhbTtcbiAgcHJpdmF0ZSBfYW5hbHl6ZWRNb2R1bGVzOiBOZ0FuYWx5emVkTW9kdWxlc3x1bmRlZmluZWQ7XG4gIHByaXZhdGUgX2FuYWx5emVkSW5qZWN0YWJsZXM6IE5nQW5hbHl6ZWRGaWxlV2l0aEluamVjdGFibGVzW118dW5kZWZpbmVkO1xuICBwcml2YXRlIF9zdHJ1Y3R1cmFsRGlhZ25vc3RpY3M6IERpYWdub3N0aWNbXXx1bmRlZmluZWQ7XG4gIHByaXZhdGUgX3Byb2dyYW1XaXRoU3R1YnM6IHRzLlByb2dyYW18dW5kZWZpbmVkO1xuICBwcml2YXRlIF9vcHRpb25zRGlhZ25vc3RpY3M6IERpYWdub3N0aWNbXSA9IFtdO1xuICBwcml2YXRlIF90cmFuc2Zvcm1Uc0RpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJvb3ROYW1lczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LCBwcml2YXRlIG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyxcbiAgICAgIHByaXZhdGUgaG9zdDogQ29tcGlsZXJIb3N0LCBvbGRQcm9ncmFtPzogUHJvZ3JhbSkge1xuICAgIHRoaXMucm9vdE5hbWVzID0gWy4uLnJvb3ROYW1lc107XG5cbiAgICBpZiAoIW9wdGlvbnMuZGlzYWJsZVR5cGVTY3JpcHRWZXJzaW9uQ2hlY2spIHtcbiAgICAgIHZlcmlmeVN1cHBvcnRlZFR5cGVTY3JpcHRWZXJzaW9uKCk7XG4gICAgfVxuXG4gICAgdGhpcy5vbGRUc1Byb2dyYW0gPSBvbGRQcm9ncmFtID8gb2xkUHJvZ3JhbS5nZXRUc1Byb2dyYW0oKSA6IHVuZGVmaW5lZDtcbiAgICBpZiAob2xkUHJvZ3JhbSkge1xuICAgICAgdGhpcy5vbGRQcm9ncmFtTGlicmFyeVN1bW1hcmllcyA9IG9sZFByb2dyYW0uZ2V0TGlicmFyeVN1bW1hcmllcygpO1xuICAgICAgdGhpcy5vbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzID0gb2xkUHJvZ3JhbS5nZXRFbWl0dGVkR2VuZXJhdGVkRmlsZXMoKTtcbiAgICAgIHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlcyA9IG9sZFByb2dyYW0uZ2V0RW1pdHRlZFNvdXJjZUZpbGVzKCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZmxhdE1vZHVsZU91dEZpbGUpIHtcbiAgICAgIGNvbnN0IHtob3N0OiBidW5kbGVIb3N0LCBpbmRleE5hbWUsIGVycm9yc30gPVxuICAgICAgICAgIGNyZWF0ZUJ1bmRsZUluZGV4SG9zdChvcHRpb25zLCB0aGlzLnJvb3ROYW1lcywgaG9zdCwgKCkgPT4gdGhpcy5mbGF0TW9kdWxlTWV0YWRhdGFDYWNoZSk7XG4gICAgICBpZiAoZXJyb3JzKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnNEaWFnbm9zdGljcy5wdXNoKC4uLmVycm9ycy5tYXAoZSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGUuY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlVGV4dDogZS5tZXNzYWdlVGV4dCBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvb3ROYW1lcy5wdXNoKGluZGV4TmFtZSEpO1xuICAgICAgICB0aGlzLmhvc3QgPSBidW5kbGVIb3N0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybSA9XG4gICAgICAgIG5ldyBMb3dlck1ldGFkYXRhVHJhbnNmb3JtKG9wdGlvbnMuZW5hYmxlSXZ5ICE9PSBmYWxzZSA/IFIzX0xPV0VSX0ZJRUxEUyA6IExPV0VSX0ZJRUxEUyk7XG4gICAgdGhpcy5tZXRhZGF0YUNhY2hlID0gdGhpcy5jcmVhdGVNZXRhZGF0YUNhY2hlKFt0aGlzLmxvd2VyaW5nTWV0YWRhdGFUcmFuc2Zvcm1dKTtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlTWV0YWRhdGFDYWNoZSh0cmFuc2Zvcm1lcnM6IE1ldGFkYXRhVHJhbnNmb3JtZXJbXSkge1xuICAgIHJldHVybiBuZXcgTWV0YWRhdGFDYWNoZShcbiAgICAgICAgbmV3IE1ldGFkYXRhQ29sbGVjdG9yKHtxdW90ZWROYW1lczogdHJ1ZX0pLCAhIXRoaXMub3B0aW9ucy5zdHJpY3RNZXRhZGF0YUVtaXQsXG4gICAgICAgIHRyYW5zZm9ybWVycyk7XG4gIH1cblxuICBnZXRMaWJyYXJ5U3VtbWFyaWVzKCk6IE1hcDxzdHJpbmcsIExpYnJhcnlTdW1tYXJ5PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hcDxzdHJpbmcsIExpYnJhcnlTdW1tYXJ5PigpO1xuICAgIGlmICh0aGlzLm9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzKSB7XG4gICAgICB0aGlzLm9sZFByb2dyYW1MaWJyYXJ5U3VtbWFyaWVzLmZvckVhY2goKHN1bW1hcnksIGZpbGVOYW1lKSA9PiByZXN1bHQuc2V0KGZpbGVOYW1lLCBzdW1tYXJ5KSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzKSB7XG4gICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzLmZvckVhY2goXG4gICAgICAgICAgKHN1bW1hcnksIGZpbGVOYW1lKSA9PiByZXN1bHQuc2V0KHN1bW1hcnkuZmlsZU5hbWUsIHN1bW1hcnkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldEVtaXR0ZWRHZW5lcmF0ZWRGaWxlcygpOiBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hcDxzdHJpbmcsIEdlbmVyYXRlZEZpbGU+KCk7XG4gICAgaWYgKHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcykge1xuICAgICAgdGhpcy5vbGRQcm9ncmFtRW1pdHRlZEdlbmVyYXRlZEZpbGVzLmZvckVhY2goXG4gICAgICAgICAgKGdlbkZpbGUsIGZpbGVOYW1lKSA9PiByZXN1bHQuc2V0KGZpbGVOYW1lLCBnZW5GaWxlKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmVtaXR0ZWRHZW5lcmF0ZWRGaWxlcykge1xuICAgICAgdGhpcy5lbWl0dGVkR2VuZXJhdGVkRmlsZXMuZm9yRWFjaCgoZ2VuRmlsZSkgPT4gcmVzdWx0LnNldChnZW5GaWxlLmdlbkZpbGVVcmwsIGdlbkZpbGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldEVtaXR0ZWRTb3VyY2VGaWxlcygpOiBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE1hcDxzdHJpbmcsIHRzLlNvdXJjZUZpbGU+KCk7XG4gICAgaWYgKHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRTb3VyY2VGaWxlcykge1xuICAgICAgdGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzLmZvckVhY2goKHNmLCBmaWxlTmFtZSkgPT4gcmVzdWx0LnNldChmaWxlTmFtZSwgc2YpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZW1pdHRlZFNvdXJjZUZpbGVzKSB7XG4gICAgICB0aGlzLmVtaXR0ZWRTb3VyY2VGaWxlcy5mb3JFYWNoKChzZikgPT4gcmVzdWx0LnNldChzZi5maWxlTmFtZSwgc2YpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldFRzUHJvZ3JhbSgpOiB0cy5Qcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy50c1Byb2dyYW07XG4gIH1cblxuICBnZXRUc09wdGlvbkRpYWdub3N0aWNzKGNhbmNlbGxhdGlvblRva2VuPzogdHMuQ2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy50c1Byb2dyYW0uZ2V0T3B0aW9uc0RpYWdub3N0aWNzKGNhbmNlbGxhdGlvblRva2VuKTtcbiAgfVxuXG4gIGdldE5nT3B0aW9uRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbik6IFJlYWRvbmx5QXJyYXk8RGlhZ25vc3RpYz4ge1xuICAgIHJldHVybiBbLi4udGhpcy5fb3B0aW9uc0RpYWdub3N0aWNzLCAuLi5nZXROZ09wdGlvbkRpYWdub3N0aWNzKHRoaXMub3B0aW9ucyldO1xuICB9XG5cbiAgZ2V0VHNTeW50YWN0aWNEaWFnbm9zdGljcyhzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbik6XG4gICAgICBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWM+IHtcbiAgICByZXR1cm4gdGhpcy50c1Byb2dyYW0uZ2V0U3ludGFjdGljRGlhZ25vc3RpY3Moc291cmNlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4pO1xuICB9XG5cbiAgZ2V0TmdTdHJ1Y3R1cmFsRGlhZ25vc3RpY3MoY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbik6IFJlYWRvbmx5QXJyYXk8RGlhZ25vc3RpYz4ge1xuICAgIHJldHVybiB0aGlzLnN0cnVjdHVyYWxEaWFnbm9zdGljcztcbiAgfVxuXG4gIGdldFRzU2VtYW50aWNEaWFnbm9zdGljcyhzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZSwgY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbik6XG4gICAgICBSZWFkb25seUFycmF5PHRzLkRpYWdub3N0aWM+IHtcbiAgICBjb25zdCBzb3VyY2VGaWxlcyA9IHNvdXJjZUZpbGUgPyBbc291cmNlRmlsZV0gOiB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpO1xuICAgIGxldCBkaWFnczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gICAgc291cmNlRmlsZXMuZm9yRWFjaChzZiA9PiB7XG4gICAgICBpZiAoIUdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKSkge1xuICAgICAgICBkaWFncy5wdXNoKC4uLnRoaXMudHNQcm9ncmFtLmdldFNlbWFudGljRGlhZ25vc3RpY3Moc2YsIGNhbmNlbGxhdGlvblRva2VuKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpYWdzO1xuICB9XG5cbiAgZ2V0TmdTZW1hbnRpY0RpYWdub3N0aWNzKGZpbGVOYW1lPzogc3RyaW5nLCBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuKTpcbiAgICAgIFJlYWRvbmx5QXJyYXk8RGlhZ25vc3RpYz4ge1xuICAgIGxldCBkaWFnczogdHMuRGlhZ25vc3RpY1tdID0gW107XG4gICAgdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKHNmID0+IHtcbiAgICAgIGlmIChHRU5FUkFURURfRklMRVMudGVzdChzZi5maWxlTmFtZSkgJiYgIXNmLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICAgIGRpYWdzLnB1c2goLi4udGhpcy50c1Byb2dyYW0uZ2V0U2VtYW50aWNEaWFnbm9zdGljcyhzZiwgY2FuY2VsbGF0aW9uVG9rZW4pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCB7bmd9ID0gdHJhbnNsYXRlRGlhZ25vc3RpY3ModGhpcy5ob3N0QWRhcHRlciwgZGlhZ3MpO1xuICAgIHJldHVybiBuZztcbiAgfVxuXG4gIGxvYWROZ1N0cnVjdHVyZUFzeW5jKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9hbmFseXplZE1vZHVsZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW5ndWxhciBzdHJ1Y3R1cmUgYWxyZWFkeSBsb2FkZWQnKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCB7dG1wUHJvZ3JhbSwgc291cmNlRmlsZXMsIHRzRmlsZXMsIHJvb3ROYW1lc30gPSB0aGlzLl9jcmVhdGVQcm9ncmFtV2l0aEJhc2ljU3R1YnMoKTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb21waWxlci5sb2FkRmlsZXNBc3luYyhzb3VyY2VGaWxlcywgdHNGaWxlcylcbiAgICAgICAgICAgICAgLnRoZW4oKHthbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXN9KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2FuYWx5emVkTW9kdWxlcykge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFyIHN0cnVjdHVyZSBsb2FkZWQgYm90aCBzeW5jaHJvbm91c2x5IGFuZCBhc3luY2hyb25vdXNseScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl91cGRhdGVQcm9ncmFtV2l0aFR5cGVDaGVja1N0dWJzKFxuICAgICAgICAgICAgICAgICAgICB0bXBQcm9ncmFtLCBhbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXMsIHJvb3ROYW1lcyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZSA9PiB0aGlzLl9jcmVhdGVQcm9ncmFtT25FcnJvcihlKSk7XG4gIH1cblxuICBsaXN0TGF6eVJvdXRlcyhyb3V0ZT86IHN0cmluZyk6IExhenlSb3V0ZVtdIHtcbiAgICAvLyBOb3RlOiBEb24ndCBhbmFseXplZE1vZHVsZXMgaWYgYSByb3V0ZSBpcyBnaXZlblxuICAgIC8vIHRvIGJlIGZhc3QgZW5vdWdoLlxuICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmxpc3RMYXp5Um91dGVzKHJvdXRlLCByb3V0ZSA/IHVuZGVmaW5lZCA6IHRoaXMuYW5hbHl6ZWRNb2R1bGVzKTtcbiAgfVxuXG4gIGVtaXQocGFyYW1ldGVyczoge1xuICAgIGVtaXRGbGFncz86IEVtaXRGbGFncyxcbiAgICBjYW5jZWxsYXRpb25Ub2tlbj86IHRzLkNhbmNlbGxhdGlvblRva2VuLFxuICAgIGN1c3RvbVRyYW5zZm9ybWVycz86IEN1c3RvbVRyYW5zZm9ybWVycyxcbiAgICBlbWl0Q2FsbGJhY2s/OiBUc0VtaXRDYWxsYmFjayxcbiAgICBtZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2s/OiBUc01lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayxcbiAgfSA9IHt9KTogdHMuRW1pdFJlc3VsdCB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbmFibGVJdnkgIT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBydW4gbGVnYWN5IGNvbXBpbGVyIGluIG5ndHNjIG1vZGUnKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXRSZW5kZXIyKHBhcmFtZXRlcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW1pdFJlbmRlcjIoe1xuICAgIGVtaXRGbGFncyA9IEVtaXRGbGFncy5EZWZhdWx0LFxuICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgIGN1c3RvbVRyYW5zZm9ybWVycyxcbiAgICBlbWl0Q2FsbGJhY2sgPSBkZWZhdWx0RW1pdENhbGxiYWNrLFxuICAgIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayA9IG1lcmdlRW1pdFJlc3VsdHMsXG4gIH06IHtcbiAgICBlbWl0RmxhZ3M/OiBFbWl0RmxhZ3MsXG4gICAgY2FuY2VsbGF0aW9uVG9rZW4/OiB0cy5DYW5jZWxsYXRpb25Ub2tlbixcbiAgICBjdXN0b21UcmFuc2Zvcm1lcnM/OiBDdXN0b21UcmFuc2Zvcm1lcnMsXG4gICAgZW1pdENhbGxiYWNrPzogVHNFbWl0Q2FsbGJhY2ssXG4gICAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrPzogVHNNZXJnZUVtaXRSZXN1bHRzQ2FsbGJhY2ssXG4gIH0gPSB7fSk6IHRzLkVtaXRSZXN1bHQge1xuICAgIGNvbnN0IGVtaXRTdGFydCA9IERhdGUubm93KCk7XG4gICAgaWYgKGVtaXRGbGFncyAmIEVtaXRGbGFncy5JMThuQnVuZGxlKSB7XG4gICAgICBjb25zdCBsb2NhbGUgPSB0aGlzLm9wdGlvbnMuaTE4bk91dExvY2FsZSB8fCBudWxsO1xuICAgICAgY29uc3QgZmlsZSA9IHRoaXMub3B0aW9ucy5pMThuT3V0RmlsZSB8fCBudWxsO1xuICAgICAgY29uc3QgZm9ybWF0ID0gdGhpcy5vcHRpb25zLmkxOG5PdXRGb3JtYXQgfHwgbnVsbDtcbiAgICAgIGNvbnN0IGJ1bmRsZSA9IHRoaXMuY29tcGlsZXIuZW1pdE1lc3NhZ2VCdW5kbGUodGhpcy5hbmFseXplZE1vZHVsZXMsIGxvY2FsZSk7XG4gICAgICBpMThuRXh0cmFjdChmb3JtYXQsIGZpbGUsIHRoaXMuaG9zdCwgdGhpcy5vcHRpb25zLCBidW5kbGUpO1xuICAgIH1cbiAgICBpZiAoKGVtaXRGbGFncyAmIChFbWl0RmxhZ3MuSlMgfCBFbWl0RmxhZ3MuRFRTIHwgRW1pdEZsYWdzLk1ldGFkYXRhIHwgRW1pdEZsYWdzLkNvZGVnZW4pKSA9PT1cbiAgICAgICAgMCkge1xuICAgICAgcmV0dXJuIHtlbWl0U2tpcHBlZDogdHJ1ZSwgZGlhZ25vc3RpY3M6IFtdLCBlbWl0dGVkRmlsZXM6IFtdfTtcbiAgICB9XG4gICAgbGV0IHtnZW5GaWxlcywgZ2VuRGlhZ3N9ID0gdGhpcy5nZW5lcmF0ZUZpbGVzRm9yRW1pdChlbWl0RmxhZ3MpO1xuICAgIGlmIChnZW5EaWFncy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpYWdub3N0aWNzOiBnZW5EaWFncyxcbiAgICAgICAgZW1pdFNraXBwZWQ6IHRydWUsXG4gICAgICAgIGVtaXR0ZWRGaWxlczogW10sXG4gICAgICB9O1xuICAgIH1cbiAgICB0aGlzLmVtaXR0ZWRHZW5lcmF0ZWRGaWxlcyA9IGdlbkZpbGVzO1xuICAgIGNvbnN0IG91dFNyY01hcHBpbmc6IEFycmF5PHtzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBvdXRGaWxlTmFtZTogc3RyaW5nfT4gPSBbXTtcbiAgICBjb25zdCBnZW5GaWxlQnlGaWxlTmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPigpO1xuICAgIGdlbkZpbGVzLmZvckVhY2goZ2VuRmlsZSA9PiBnZW5GaWxlQnlGaWxlTmFtZS5zZXQoZ2VuRmlsZS5nZW5GaWxlVXJsLCBnZW5GaWxlKSk7XG4gICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcyA9IFtdO1xuICAgIHRoaXMuX3RyYW5zZm9ybVRzRGlhZ25vc3RpY3MgPSBbXTtcbiAgICBjb25zdCBlbWl0dGVkU291cmNlRmlsZXMgPSBbXSBhcyB0cy5Tb3VyY2VGaWxlW107XG4gICAgY29uc3Qgd3JpdGVUc0ZpbGU6IHRzLldyaXRlRmlsZUNhbGxiYWNrID1cbiAgICAgICAgKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3I/LCBzb3VyY2VGaWxlcz8pID0+IHtcbiAgICAgICAgICBjb25zdCBzb3VyY2VGaWxlID0gc291cmNlRmlsZXMgJiYgc291cmNlRmlsZXMubGVuZ3RoID09IDEgPyBzb3VyY2VGaWxlc1swXSA6IG51bGw7XG4gICAgICAgICAgbGV0IGdlbkZpbGU6IEdlbmVyYXRlZEZpbGV8dW5kZWZpbmVkO1xuICAgICAgICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICAgICAgICBvdXRTcmNNYXBwaW5nLnB1c2goe291dEZpbGVOYW1lOiBvdXRGaWxlTmFtZSwgc291cmNlRmlsZX0pO1xuICAgICAgICAgICAgZ2VuRmlsZSA9IGdlbkZpbGVCeUZpbGVOYW1lLmdldChzb3VyY2VGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIGlmICghc291cmNlRmlsZS5pc0RlY2xhcmF0aW9uRmlsZSAmJiAhR0VORVJBVEVEX0ZJTEVTLnRlc3Qoc291cmNlRmlsZS5maWxlTmFtZSkpIHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogc291cmNlRmlsZSBpcyB0aGUgdHJhbnNmb3JtZWQgc291cmNlZmlsZSwgbm90IHRoZSBvcmlnaW5hbCBvbmUhXG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsRmlsZSA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGUoc291cmNlRmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICAgIGlmIChvcmlnaW5hbEZpbGUpIHtcbiAgICAgICAgICAgICAgICBlbWl0dGVkU291cmNlRmlsZXMucHVzaChvcmlnaW5hbEZpbGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBvdXREYXRhLCB3cml0ZUJ5dGVPcmRlck1hcmssIG9uRXJyb3IsIGdlbkZpbGUsIHNvdXJjZUZpbGVzKTtcbiAgICAgICAgfTtcblxuICAgIGNvbnN0IG1vZHVsZXMgPSB0aGlzLl9hbmFseXplZEluamVjdGFibGVzICYmXG4gICAgICAgIHRoaXMuY29tcGlsZXIuZW1pdEFsbFBhcnRpYWxNb2R1bGVzMih0aGlzLl9hbmFseXplZEluamVjdGFibGVzKTtcblxuICAgIGNvbnN0IHRzQ3VzdG9tVHJhbnNmb3JtZXJzID1cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVUcmFuc2Zvcm1zKGdlbkZpbGVCeUZpbGVOYW1lLCBtb2R1bGVzLCBjdXN0b21UcmFuc2Zvcm1lcnMpO1xuICAgIGNvbnN0IGVtaXRPbmx5RHRzRmlsZXMgPSAoZW1pdEZsYWdzICYgKEVtaXRGbGFncy5EVFMgfCBFbWl0RmxhZ3MuSlMpKSA9PSBFbWl0RmxhZ3MuRFRTO1xuICAgIC8vIFJlc3RvcmUgdGhlIG9yaWdpbmFsIHJlZmVyZW5jZXMgYmVmb3JlIHdlIGVtaXQgc28gVHlwZVNjcmlwdCBkb2Vzbid0IGVtaXRcbiAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgLmQudHMgZmlsZS5cbiAgICBjb25zdCBhdWdtZW50ZWRSZWZlcmVuY2VzID0gbmV3IE1hcDx0cy5Tb3VyY2VGaWxlLCBSZWFkb25seUFycmF5PHRzLkZpbGVSZWZlcmVuY2U+PigpO1xuICAgIGZvciAoY29uc3Qgc291cmNlRmlsZSBvZiB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlZmVyZW5jZXMgPSBnZXRPcmlnaW5hbFJlZmVyZW5jZXMoc291cmNlRmlsZSk7XG4gICAgICBpZiAob3JpZ2luYWxSZWZlcmVuY2VzKSB7XG4gICAgICAgIGF1Z21lbnRlZFJlZmVyZW5jZXMuc2V0KHNvdXJjZUZpbGUsIHNvdXJjZUZpbGUucmVmZXJlbmNlZEZpbGVzKTtcbiAgICAgICAgc291cmNlRmlsZS5yZWZlcmVuY2VkRmlsZXMgPSBvcmlnaW5hbFJlZmVyZW5jZXM7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGdlblRzRmlsZXM6IEdlbmVyYXRlZEZpbGVbXSA9IFtdO1xuICAgIGNvbnN0IGdlbkpzb25GaWxlczogR2VuZXJhdGVkRmlsZVtdID0gW107XG4gICAgZ2VuRmlsZXMuZm9yRWFjaChnZiA9PiB7XG4gICAgICBpZiAoZ2Yuc3RtdHMpIHtcbiAgICAgICAgZ2VuVHNGaWxlcy5wdXNoKGdmKTtcbiAgICAgIH1cbiAgICAgIGlmIChnZi5zb3VyY2UpIHtcbiAgICAgICAgZ2VuSnNvbkZpbGVzLnB1c2goZ2YpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxldCBlbWl0UmVzdWx0OiB0cy5FbWl0UmVzdWx0O1xuICAgIGxldCBlbWl0dGVkVXNlclRzQ291bnQ6IG51bWJlcjtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc291cmNlRmlsZXNUb0VtaXQgPSB0aGlzLmdldFNvdXJjZUZpbGVzRm9yRW1pdCgpO1xuICAgICAgaWYgKHNvdXJjZUZpbGVzVG9FbWl0ICYmXG4gICAgICAgICAgKHNvdXJjZUZpbGVzVG9FbWl0Lmxlbmd0aCArIGdlblRzRmlsZXMubGVuZ3RoKSA8IE1BWF9GSUxFX0NPVU5UX0ZPUl9TSU5HTEVfRklMRV9FTUlUKSB7XG4gICAgICAgIGNvbnN0IGZpbGVOYW1lc1RvRW1pdCA9XG4gICAgICAgICAgICBbLi4uc291cmNlRmlsZXNUb0VtaXQubWFwKHNmID0+IHNmLmZpbGVOYW1lKSwgLi4uZ2VuVHNGaWxlcy5tYXAoZ2YgPT4gZ2YuZ2VuRmlsZVVybCldO1xuICAgICAgICBlbWl0UmVzdWx0ID0gbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrKFxuICAgICAgICAgICAgZmlsZU5hbWVzVG9FbWl0Lm1hcCgoZmlsZU5hbWUpID0+IGVtaXRSZXN1bHQgPSBlbWl0Q2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyYW06IHRoaXMudHNQcm9ncmFtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3Q6IHRoaXMuaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JpdGVGaWxlOiB3cml0ZVRzRmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWl0T25seUR0c0ZpbGVzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVRyYW5zZm9ybWVyczogdHNDdXN0b21UcmFuc2Zvcm1lcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U291cmNlRmlsZTogdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIGVtaXR0ZWRVc2VyVHNDb3VudCA9IHNvdXJjZUZpbGVzVG9FbWl0Lmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVtaXRSZXN1bHQgPSBlbWl0Q2FsbGJhY2soe1xuICAgICAgICAgIHByb2dyYW06IHRoaXMudHNQcm9ncmFtLFxuICAgICAgICAgIGhvc3Q6IHRoaXMuaG9zdCxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgd3JpdGVGaWxlOiB3cml0ZVRzRmlsZSxcbiAgICAgICAgICBlbWl0T25seUR0c0ZpbGVzLFxuICAgICAgICAgIGN1c3RvbVRyYW5zZm9ybWVyczogdHNDdXN0b21UcmFuc2Zvcm1lcnNcbiAgICAgICAgfSk7XG4gICAgICAgIGVtaXR0ZWRVc2VyVHNDb3VudCA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkubGVuZ3RoIC0gZ2VuVHNGaWxlcy5sZW5ndGg7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFJlc3RvcmUgdGhlIHJlZmVyZW5jZXMgYmFjayB0byB0aGUgYXVnbWVudGVkIHZhbHVlIHRvIGVuc3VyZSB0aGF0IHRoZVxuICAgICAgLy8gY2hlY2tzIHRoYXQgVHlwZVNjcmlwdCBtYWtlcyBmb3IgcHJvamVjdCBzdHJ1Y3R1cmUgcmV1c2Ugd2lsbCBzdWNjZWVkLlxuICAgICAgZm9yIChjb25zdCBbc291cmNlRmlsZSwgcmVmZXJlbmNlc10gb2YgQXJyYXkuZnJvbShhdWdtZW50ZWRSZWZlcmVuY2VzKSkge1xuICAgICAgICAvLyBUT0RPKGNodWNraik6IFJlbW92ZSBhbnkgY2FzdCBhZnRlciB1cGRhdGluZyBidWlsZCB0byAyLjZcbiAgICAgICAgKHNvdXJjZUZpbGUgYXMgYW55KS5yZWZlcmVuY2VkRmlsZXMgPSByZWZlcmVuY2VzO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVtaXR0ZWRTb3VyY2VGaWxlcyA9IGVtaXR0ZWRTb3VyY2VGaWxlcztcblxuICAgIC8vIE1hdGNoIGJlaGF2aW9yIG9mIHRzYzogb25seSBwcm9kdWNlIGVtaXQgZGlhZ25vc3RpY3MgaWYgaXQgd291bGQgYmxvY2tcbiAgICAvLyBlbWl0LiBJZiBub0VtaXRPbkVycm9yIGlzIGZhbHNlLCB0aGUgZW1pdCB3aWxsIGhhcHBlbiBpbiBzcGl0ZSBvZiBhbnlcbiAgICAvLyBlcnJvcnMsIHNvIHdlIHNob3VsZCBub3QgcmVwb3J0IHRoZW0uXG4gICAgaWYgKGVtaXRSZXN1bHQgJiYgdGhpcy5vcHRpb25zLm5vRW1pdE9uRXJyb3IgPT09IHRydWUpIHtcbiAgICAgIC8vIHRyYW5zbGF0ZSB0aGUgZGlhZ25vc3RpY3MgaW4gdGhlIGVtaXRSZXN1bHQgYXMgd2VsbC5cbiAgICAgIGNvbnN0IHRyYW5zbGF0ZWRFbWl0RGlhZ3MgPSB0cmFuc2xhdGVEaWFnbm9zdGljcyh0aGlzLmhvc3RBZGFwdGVyLCBlbWl0UmVzdWx0LmRpYWdub3N0aWNzKTtcbiAgICAgIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MgPSB0cmFuc2xhdGVkRW1pdERpYWdzLnRzLmNvbmNhdChcbiAgICAgICAgICB0aGlzLnN0cnVjdHVyYWxEaWFnbm9zdGljcy5jb25jYXQodHJhbnNsYXRlZEVtaXREaWFncy5uZykubWFwKG5nVG9Uc0RpYWdub3N0aWMpKTtcbiAgICB9XG5cbiAgICBpZiAoZW1pdFJlc3VsdCAmJiAhb3V0U3JjTWFwcGluZy5sZW5ndGgpIHtcbiAgICAgIC8vIGlmIG5vIGZpbGVzIHdlcmUgZW1pdHRlZCBieSBUeXBlU2NyaXB0LCBhbHNvIGRvbid0IGVtaXQgLmpzb24gZmlsZXNcbiAgICAgIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MgPVxuICAgICAgICAgIGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MuY29uY2F0KFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYyhgRW1pdHRlZCBubyBmaWxlcy5gKV0pO1xuICAgICAgcmV0dXJuIGVtaXRSZXN1bHQ7XG4gICAgfVxuXG4gICAgbGV0IHNhbXBsZVNyY0ZpbGVOYW1lOiBzdHJpbmd8dW5kZWZpbmVkO1xuICAgIGxldCBzYW1wbGVPdXRGaWxlTmFtZTogc3RyaW5nfHVuZGVmaW5lZDtcbiAgICBpZiAob3V0U3JjTWFwcGluZy5sZW5ndGgpIHtcbiAgICAgIHNhbXBsZVNyY0ZpbGVOYW1lID0gb3V0U3JjTWFwcGluZ1swXS5zb3VyY2VGaWxlLmZpbGVOYW1lO1xuICAgICAgc2FtcGxlT3V0RmlsZU5hbWUgPSBvdXRTcmNNYXBwaW5nWzBdLm91dEZpbGVOYW1lO1xuICAgIH1cbiAgICBjb25zdCBzcmNUb091dFBhdGggPVxuICAgICAgICBjcmVhdGVTcmNUb091dFBhdGhNYXBwZXIodGhpcy5vcHRpb25zLm91dERpciwgc2FtcGxlU3JjRmlsZU5hbWUsIHNhbXBsZU91dEZpbGVOYW1lKTtcbiAgICBpZiAoZW1pdEZsYWdzICYgRW1pdEZsYWdzLkNvZGVnZW4pIHtcbiAgICAgIGdlbkpzb25GaWxlcy5mb3JFYWNoKGdmID0+IHtcbiAgICAgICAgY29uc3Qgb3V0RmlsZU5hbWUgPSBzcmNUb091dFBhdGgoZ2YuZ2VuRmlsZVVybCk7XG4gICAgICAgIHRoaXMud3JpdGVGaWxlKG91dEZpbGVOYW1lLCBnZi5zb3VyY2UhLCBmYWxzZSwgdW5kZWZpbmVkLCBnZik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgbGV0IG1ldGFkYXRhSnNvbkNvdW50ID0gMDtcbiAgICBpZiAoZW1pdEZsYWdzICYgRW1pdEZsYWdzLk1ldGFkYXRhKSB7XG4gICAgICB0aGlzLnRzUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc2YgPT4ge1xuICAgICAgICBpZiAoIXNmLmlzRGVjbGFyYXRpb25GaWxlICYmICFHRU5FUkFURURfRklMRVMudGVzdChzZi5maWxlTmFtZSkpIHtcbiAgICAgICAgICBtZXRhZGF0YUpzb25Db3VudCsrO1xuICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5tZXRhZGF0YUNhY2hlLmdldE1ldGFkYXRhKHNmKTtcbiAgICAgICAgICBpZiAobWV0YWRhdGEpIHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhVGV4dCA9IEpTT04uc3RyaW5naWZ5KFttZXRhZGF0YV0pO1xuICAgICAgICAgICAgY29uc3Qgb3V0RmlsZU5hbWUgPSBzcmNUb091dFBhdGgoc2YuZmlsZU5hbWUucmVwbGFjZSgvXFwudHN4PyQvLCAnLm1ldGFkYXRhLmpzb24nKSk7XG4gICAgICAgICAgICB0aGlzLndyaXRlRmlsZShvdXRGaWxlTmFtZSwgbWV0YWRhdGFUZXh0LCBmYWxzZSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFtzZl0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGVtaXRFbmQgPSBEYXRlLm5vdygpO1xuICAgIGlmIChlbWl0UmVzdWx0ICYmIHRoaXMub3B0aW9ucy5kaWFnbm9zdGljcykge1xuICAgICAgZW1pdFJlc3VsdC5kaWFnbm9zdGljcyA9IGVtaXRSZXN1bHQuZGlhZ25vc3RpY3MuY29uY2F0KFtjcmVhdGVNZXNzYWdlRGlhZ25vc3RpYyhbXG4gICAgICAgIGBFbWl0dGVkIGluICR7ZW1pdEVuZCAtIGVtaXRTdGFydH1tc2AsXG4gICAgICAgIGAtICR7ZW1pdHRlZFVzZXJUc0NvdW50fSB1c2VyIHRzIGZpbGVzYCxcbiAgICAgICAgYC0gJHtnZW5Uc0ZpbGVzLmxlbmd0aH0gZ2VuZXJhdGVkIHRzIGZpbGVzYCxcbiAgICAgICAgYC0gJHtnZW5Kc29uRmlsZXMubGVuZ3RoICsgbWV0YWRhdGFKc29uQ291bnR9IGdlbmVyYXRlZCBqc29uIGZpbGVzYCxcbiAgICAgIF0uam9pbignXFxuJykpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtaXRSZXN1bHQ7XG4gIH1cblxuICAvLyBQcml2YXRlIG1lbWJlcnNcbiAgcHJpdmF0ZSBnZXQgY29tcGlsZXIoKTogQW90Q29tcGlsZXIge1xuICAgIGlmICghdGhpcy5fY29tcGlsZXIpIHtcbiAgICAgIHRoaXMuX2NyZWF0ZUNvbXBpbGVyKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb21waWxlciE7XG4gIH1cblxuICBwcml2YXRlIGdldCBob3N0QWRhcHRlcigpOiBUc0NvbXBpbGVyQW90Q29tcGlsZXJUeXBlQ2hlY2tIb3N0QWRhcHRlciB7XG4gICAgaWYgKCF0aGlzLl9ob3N0QWRhcHRlcikge1xuICAgICAgdGhpcy5fY3JlYXRlQ29tcGlsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2hvc3RBZGFwdGVyITtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IGFuYWx5emVkTW9kdWxlcygpOiBOZ0FuYWx5emVkTW9kdWxlcyB7XG4gICAgaWYgKCF0aGlzLl9hbmFseXplZE1vZHVsZXMpIHtcbiAgICAgIHRoaXMuaW5pdFN5bmMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FuYWx5emVkTW9kdWxlcyE7XG4gIH1cblxuICBwcml2YXRlIGdldCBzdHJ1Y3R1cmFsRGlhZ25vc3RpY3MoKTogUmVhZG9ubHlBcnJheTxEaWFnbm9zdGljPiB7XG4gICAgbGV0IGRpYWdub3N0aWNzID0gdGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzO1xuICAgIGlmICghZGlhZ25vc3RpY3MpIHtcbiAgICAgIHRoaXMuaW5pdFN5bmMoKTtcbiAgICAgIGRpYWdub3N0aWNzID0gKHRoaXMuX3N0cnVjdHVyYWxEaWFnbm9zdGljcyA9IHRoaXMuX3N0cnVjdHVyYWxEaWFnbm9zdGljcyB8fCBbXSk7XG4gICAgfVxuICAgIHJldHVybiBkaWFnbm9zdGljcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0IHRzUHJvZ3JhbSgpOiB0cy5Qcm9ncmFtIHtcbiAgICBpZiAoIXRoaXMuX3RzUHJvZ3JhbSkge1xuICAgICAgdGhpcy5pbml0U3luYygpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fdHNQcm9ncmFtITtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBwcm9ncmFtIGlzIGNvbXBpbGluZyB0aGUgQW5ndWxhciBjb3JlIHBhY2thZ2UuICovXG4gIHByaXZhdGUgZ2V0IGlzQ29tcGlsaW5nQW5ndWxhckNvcmUoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMuX2lzQ29tcGlsaW5nQW5ndWxhckNvcmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pc0NvbXBpbGluZ0FuZ3VsYXJDb3JlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faXNDb21waWxpbmdBbmd1bGFyQ29yZSA9IGlzQW5ndWxhckNvcmVQYWNrYWdlKHRoaXMudHNQcm9ncmFtKTtcbiAgfVxuICBwcml2YXRlIF9pc0NvbXBpbGluZ0FuZ3VsYXJDb3JlOiBib29sZWFufG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgY2FsY3VsYXRlVHJhbnNmb3JtcyhcbiAgICAgIGdlbkZpbGVzOiBNYXA8c3RyaW5nLCBHZW5lcmF0ZWRGaWxlPnx1bmRlZmluZWQsIHBhcnRpYWxNb2R1bGVzOiBQYXJ0aWFsTW9kdWxlW118dW5kZWZpbmVkLFxuICAgICAgY3VzdG9tVHJhbnNmb3JtZXJzPzogQ3VzdG9tVHJhbnNmb3JtZXJzKTogdHMuQ3VzdG9tVHJhbnNmb3JtZXJzIHtcbiAgICBjb25zdCBiZWZvcmVUczogQXJyYXk8dHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+PiA9IFtdO1xuICAgIGNvbnN0IG1ldGFkYXRhVHJhbnNmb3JtczogTWV0YWRhdGFUcmFuc2Zvcm1lcltdID0gW107XG4gICAgY29uc3QgZmxhdE1vZHVsZU1ldGFkYXRhVHJhbnNmb3JtczogTWV0YWRhdGFUcmFuc2Zvcm1lcltdID0gW107XG4gICAgY29uc3QgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIgPSB0aGlzLm9wdGlvbnMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIgfHwgZmFsc2U7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmVuYWJsZVJlc291cmNlSW5saW5pbmcpIHtcbiAgICAgIGJlZm9yZVRzLnB1c2goZ2V0SW5saW5lUmVzb3VyY2VzVHJhbnNmb3JtRmFjdG9yeSh0aGlzLnRzUHJvZ3JhbSwgdGhpcy5ob3N0QWRhcHRlcikpO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgSW5saW5lUmVzb3VyY2VzTWV0YWRhdGFUcmFuc2Zvcm1lcih0aGlzLmhvc3RBZGFwdGVyKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICAgIGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMucHVzaCh0cmFuc2Zvcm1lcik7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUV4cHJlc3Npb25Mb3dlcmluZykge1xuICAgICAgYmVmb3JlVHMucHVzaChcbiAgICAgICAgICBnZXRFeHByZXNzaW9uTG93ZXJpbmdUcmFuc2Zvcm1GYWN0b3J5KHRoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybSwgdGhpcy50c1Byb2dyYW0pKTtcbiAgICAgIG1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRoaXMubG93ZXJpbmdNZXRhZGF0YVRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGlmIChnZW5GaWxlcykge1xuICAgICAgYmVmb3JlVHMucHVzaChnZXRBbmd1bGFyRW1pdHRlclRyYW5zZm9ybUZhY3RvcnkoXG4gICAgICAgICAgZ2VuRmlsZXMsIHRoaXMuZ2V0VHNQcm9ncmFtKCksIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKSk7XG4gICAgfVxuICAgIGlmIChwYXJ0aWFsTW9kdWxlcykge1xuICAgICAgYmVmb3JlVHMucHVzaChnZXRBbmd1bGFyQ2xhc3NUcmFuc2Zvcm1lckZhY3RvcnkocGFydGlhbE1vZHVsZXMsIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKSk7XG5cbiAgICAgIC8vIElmIHdlIGhhdmUgcGFydGlhbCBtb2R1bGVzLCB0aGUgY2FjaGVkIG1ldGFkYXRhIG1pZ2h0IGJlIGluY29ycmVjdCBhcyBpdCBkb2Vzbid0IHJlZmxlY3RcbiAgICAgIC8vIHRoZSBwYXJ0aWFsIG1vZHVsZSB0cmFuc2Zvcm1zLlxuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgUGFydGlhbE1vZHVsZU1ldGFkYXRhVHJhbnNmb3JtZXIocGFydGlhbE1vZHVsZXMpO1xuICAgICAgbWV0YWRhdGFUcmFuc2Zvcm1zLnB1c2godHJhbnNmb3JtZXIpO1xuICAgICAgZmxhdE1vZHVsZU1ldGFkYXRhVHJhbnNmb3Jtcy5wdXNoKHRyYW5zZm9ybWVyKTtcbiAgICB9XG5cbiAgICBpZiAoY3VzdG9tVHJhbnNmb3JtZXJzICYmIGN1c3RvbVRyYW5zZm9ybWVycy5iZWZvcmVUcykge1xuICAgICAgYmVmb3JlVHMucHVzaCguLi5jdXN0b21UcmFuc2Zvcm1lcnMuYmVmb3JlVHMpO1xuICAgIH1cblxuICAgIC8vIElmIGRlY29yYXRvcnMgc2hvdWxkIGJlIGNvbnZlcnRlZCB0byBzdGF0aWMgZmllbGRzIChlbmFibGVkIGJ5IGRlZmF1bHQpLCB3ZSBzZXQgdXBcbiAgICAvLyB0aGUgZGVjb3JhdG9yIGRvd25sZXZlbCB0cmFuc2Zvcm0uIE5vdGUgdGhhdCB3ZSBzZXQgaXQgdXAgYXMgbGFzdCB0cmFuc2Zvcm0gYXMgdGhhdFxuICAgIC8vIGFsbG93cyBjdXN0b20gdHJhbnNmb3JtZXJzIHRvIHN0cmlwIEFuZ3VsYXIgZGVjb3JhdG9ycyB3aXRob3V0IGhhdmluZyB0byBkZWFsIHdpdGhcbiAgICAvLyBpZGVudGlmeWluZyBzdGF0aWMgcHJvcGVydGllcy4gZS5nLiBpdCdzIG1vcmUgZGlmZmljdWx0IGhhbmRsaW5nIGA8Li4+LmRlY29yYXRvcnNgXG4gICAgLy8gb3IgYDwuLj4uY3RvclBhcmFtZXRlcnNgIGNvbXBhcmVkIHRvIHRoZSBgdHMuRGVjb3JhdG9yYCBBU1Qgbm9kZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hbm5vdGF0aW9uc0FzICE9PSAnZGVjb3JhdG9ycycpIHtcbiAgICAgIGNvbnN0IHR5cGVDaGVja2VyID0gdGhpcy5nZXRUc1Byb2dyYW0oKS5nZXRUeXBlQ2hlY2tlcigpO1xuICAgICAgY29uc3QgcmVmbGVjdGlvbkhvc3QgPSBuZXcgVHlwZVNjcmlwdFJlZmxlY3Rpb25Ib3N0KHR5cGVDaGVja2VyKTtcbiAgICAgIC8vIFNpbWlsYXJseSB0byBob3cgd2UgaGFuZGxlZCB0c2lja2xlIGRlY29yYXRvciBkb3dubGV2ZWxpbmcgaW4gdGhlIHBhc3QsIHdlIGp1c3RcbiAgICAgIC8vIGlnbm9yZSBkaWFnbm9zdGljcyB0aGF0IGhhdmUgYmVlbiBjb2xsZWN0ZWQgYnkgdGhlIHRyYW5zZm9ybWVyLiBUaGVzZSBhcmVcbiAgICAgIC8vIG5vbi1zaWduaWZpY2FudCBmYWlsdXJlcyB0aGF0IHNob3VsZG4ndCBwcmV2ZW50IGFwcHMgZnJvbSBjb21waWxpbmcuXG4gICAgICBiZWZvcmVUcy5wdXNoKGdldERvd25sZXZlbERlY29yYXRvcnNUcmFuc2Zvcm0oXG4gICAgICAgICAgdHlwZUNoZWNrZXIsIHJlZmxlY3Rpb25Ib3N0LCBbXSwgdGhpcy5pc0NvbXBpbGluZ0FuZ3VsYXJDb3JlLCBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcixcbiAgICAgICAgICAvKiBza2lwQ2xhc3NEZWNvcmF0b3JzICovIGZhbHNlKSk7XG4gICAgfVxuXG4gICAgaWYgKG1ldGFkYXRhVHJhbnNmb3Jtcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLm1ldGFkYXRhQ2FjaGUgPSB0aGlzLmNyZWF0ZU1ldGFkYXRhQ2FjaGUobWV0YWRhdGFUcmFuc2Zvcm1zKTtcbiAgICB9XG4gICAgaWYgKGZsYXRNb2R1bGVNZXRhZGF0YVRyYW5zZm9ybXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5mbGF0TW9kdWxlTWV0YWRhdGFDYWNoZSA9IHRoaXMuY3JlYXRlTWV0YWRhdGFDYWNoZShmbGF0TW9kdWxlTWV0YWRhdGFUcmFuc2Zvcm1zKTtcbiAgICB9XG4gICAgY29uc3QgYWZ0ZXJUcyA9IGN1c3RvbVRyYW5zZm9ybWVycyA/IGN1c3RvbVRyYW5zZm9ybWVycy5hZnRlclRzIDogdW5kZWZpbmVkO1xuICAgIHJldHVybiB7YmVmb3JlOiBiZWZvcmVUcywgYWZ0ZXI6IGFmdGVyVHN9O1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0U3luYygpIHtcbiAgICBpZiAodGhpcy5fYW5hbHl6ZWRNb2R1bGVzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCB7dG1wUHJvZ3JhbSwgc291cmNlRmlsZXMsIHRzRmlsZXMsIHJvb3ROYW1lc30gPSB0aGlzLl9jcmVhdGVQcm9ncmFtV2l0aEJhc2ljU3R1YnMoKTtcbiAgICAgIGNvbnN0IHthbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXN9ID1cbiAgICAgICAgICB0aGlzLmNvbXBpbGVyLmxvYWRGaWxlc1N5bmMoc291cmNlRmlsZXMsIHRzRmlsZXMpO1xuICAgICAgdGhpcy5fdXBkYXRlUHJvZ3JhbVdpdGhUeXBlQ2hlY2tTdHVicyhcbiAgICAgICAgICB0bXBQcm9ncmFtLCBhbmFseXplZE1vZHVsZXMsIGFuYWx5emVkSW5qZWN0YWJsZXMsIHJvb3ROYW1lcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fY3JlYXRlUHJvZ3JhbU9uRXJyb3IoZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlQ29tcGlsZXIoKSB7XG4gICAgY29uc3QgY29kZWdlbjogQ29kZUdlbmVyYXRvciA9IHtcbiAgICAgIGdlbmVyYXRlRmlsZTogKGdlbkZpbGVOYW1lLCBiYXNlRmlsZU5hbWUpID0+XG4gICAgICAgICAgdGhpcy5fY29tcGlsZXIuZW1pdEJhc2ljU3R1YihnZW5GaWxlTmFtZSwgYmFzZUZpbGVOYW1lKSxcbiAgICAgIGZpbmRHZW5lcmF0ZWRGaWxlTmFtZXM6IChmaWxlTmFtZSkgPT4gdGhpcy5fY29tcGlsZXIuZmluZEdlbmVyYXRlZEZpbGVOYW1lcyhmaWxlTmFtZSksXG4gICAgfTtcblxuICAgIHRoaXMuX2hvc3RBZGFwdGVyID0gbmV3IFRzQ29tcGlsZXJBb3RDb21waWxlclR5cGVDaGVja0hvc3RBZGFwdGVyKFxuICAgICAgICB0aGlzLnJvb3ROYW1lcywgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3QsIHRoaXMubWV0YWRhdGFDYWNoZSwgY29kZWdlbixcbiAgICAgICAgdGhpcy5vbGRQcm9ncmFtTGlicmFyeVN1bW1hcmllcyk7XG4gICAgY29uc3QgYW90T3B0aW9ucyA9IGdldEFvdENvbXBpbGVyT3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgIGNvbnN0IGVycm9yQ29sbGVjdG9yID0gKHRoaXMub3B0aW9ucy5jb2xsZWN0QWxsRXJyb3JzIHx8IHRoaXMub3B0aW9ucy5mdWxsVGVtcGxhdGVUeXBlQ2hlY2spID9cbiAgICAgICAgKGVycjogYW55KSA9PiB0aGlzLl9hZGRTdHJ1Y3R1cmFsRGlhZ25vc3RpY3MoZXJyKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcbiAgICB0aGlzLl9jb21waWxlciA9IGNyZWF0ZUFvdENvbXBpbGVyKHRoaXMuX2hvc3RBZGFwdGVyLCBhb3RPcHRpb25zLCBlcnJvckNvbGxlY3RvcikuY29tcGlsZXI7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVQcm9ncmFtV2l0aEJhc2ljU3R1YnMoKToge1xuICAgIHRtcFByb2dyYW06IHRzLlByb2dyYW0sXG4gICAgcm9vdE5hbWVzOiBzdHJpbmdbXSxcbiAgICBzb3VyY2VGaWxlczogc3RyaW5nW10sXG4gICAgdHNGaWxlczogc3RyaW5nW10sXG4gIH0ge1xuICAgIGlmICh0aGlzLl9hbmFseXplZE1vZHVsZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW50ZXJuYWwgRXJyb3I6IGFscmVhZHkgaW5pdGlhbGl6ZWQhYCk7XG4gICAgfVxuICAgIC8vIE5vdGU6IFRoaXMgaXMgaW1wb3J0YW50IHRvIG5vdCBwcm9kdWNlIGEgbWVtb3J5IGxlYWshXG4gICAgY29uc3Qgb2xkVHNQcm9ncmFtID0gdGhpcy5vbGRUc1Byb2dyYW07XG4gICAgdGhpcy5vbGRUc1Byb2dyYW0gPSB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCBjb2RlZ2VuOiBDb2RlR2VuZXJhdG9yID0ge1xuICAgICAgZ2VuZXJhdGVGaWxlOiAoZ2VuRmlsZU5hbWUsIGJhc2VGaWxlTmFtZSkgPT5cbiAgICAgICAgICB0aGlzLmNvbXBpbGVyLmVtaXRCYXNpY1N0dWIoZ2VuRmlsZU5hbWUsIGJhc2VGaWxlTmFtZSksXG4gICAgICBmaW5kR2VuZXJhdGVkRmlsZU5hbWVzOiAoZmlsZU5hbWUpID0+IHRoaXMuY29tcGlsZXIuZmluZEdlbmVyYXRlZEZpbGVOYW1lcyhmaWxlTmFtZSksXG4gICAgfTtcblxuXG4gICAgbGV0IHJvb3ROYW1lcyA9IFsuLi50aGlzLnJvb3ROYW1lc107XG4gICAgaWYgKHRoaXMub3B0aW9ucy5nZW5lcmF0ZUNvZGVGb3JMaWJyYXJpZXMgIT09IGZhbHNlKSB7XG4gICAgICAvLyBpZiB3ZSBzaG91bGQgZ2VuZXJhdGVDb2RlRm9yTGlicmFyaWVzLCBuZXZlciBpbmNsdWRlXG4gICAgICAvLyBnZW5lcmF0ZWQgZmlsZXMgaW4gdGhlIHByb2dyYW0gYXMgb3RoZXJ3aXNlIHdlIHdpbGxcbiAgICAgIC8vIG92ZXJ3cml0ZSB0aGVtIGFuZCB0eXBlc2NyaXB0IHdpbGwgcmVwb3J0IHRoZSBlcnJvclxuICAgICAgLy8gVFM1MDU1OiBDYW5ub3Qgd3JpdGUgZmlsZSAuLi4gYmVjYXVzZSBpdCB3b3VsZCBvdmVyd3JpdGUgaW5wdXQgZmlsZS5cbiAgICAgIHJvb3ROYW1lcyA9IHJvb3ROYW1lcy5maWx0ZXIoZm4gPT4gIUdFTkVSQVRFRF9GSUxFUy50ZXN0KGZuKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMubm9SZXNvbHZlKSB7XG4gICAgICB0aGlzLnJvb3ROYW1lcy5mb3JFYWNoKHJvb3ROYW1lID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaG9zdEFkYXB0ZXIuc2hvdWxkR2VuZXJhdGVGaWxlc0Zvcihyb290TmFtZSkpIHtcbiAgICAgICAgICByb290TmFtZXMucHVzaCguLi50aGlzLmNvbXBpbGVyLmZpbmRHZW5lcmF0ZWRGaWxlTmFtZXMocm9vdE5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3QgdG1wUHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0ocm9vdE5hbWVzLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdEFkYXB0ZXIsIG9sZFRzUHJvZ3JhbSk7XG4gICAgaWYgKHRlbXBQcm9ncmFtSGFuZGxlckZvclRlc3QgIT09IG51bGwpIHtcbiAgICAgIHRlbXBQcm9ncmFtSGFuZGxlckZvclRlc3QodG1wUHJvZ3JhbSk7XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZUZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHRzRmlsZXM6IHN0cmluZ1tdID0gW107XG4gICAgdG1wUHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZvckVhY2goc2YgPT4ge1xuICAgICAgaWYgKHRoaXMuaG9zdEFkYXB0ZXIuaXNTb3VyY2VGaWxlKHNmLmZpbGVOYW1lKSkge1xuICAgICAgICBzb3VyY2VGaWxlcy5wdXNoKHNmLmZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChUUy50ZXN0KHNmLmZpbGVOYW1lKSAmJiAhRFRTLnRlc3Qoc2YuZmlsZU5hbWUpKSB7XG4gICAgICAgIHRzRmlsZXMucHVzaChzZi5maWxlTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHt0bXBQcm9ncmFtLCBzb3VyY2VGaWxlcywgdHNGaWxlcywgcm9vdE5hbWVzfTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZVByb2dyYW1XaXRoVHlwZUNoZWNrU3R1YnMoXG4gICAgICB0bXBQcm9ncmFtOiB0cy5Qcm9ncmFtLCBhbmFseXplZE1vZHVsZXM6IE5nQW5hbHl6ZWRNb2R1bGVzLFxuICAgICAgYW5hbHl6ZWRJbmplY3RhYmxlczogTmdBbmFseXplZEZpbGVXaXRoSW5qZWN0YWJsZXNbXSwgcm9vdE5hbWVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuX2FuYWx5emVkTW9kdWxlcyA9IGFuYWx5emVkTW9kdWxlcztcbiAgICB0aGlzLl9hbmFseXplZEluamVjdGFibGVzID0gYW5hbHl6ZWRJbmplY3RhYmxlcztcbiAgICB0bXBQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZm9yRWFjaChzZiA9PiB7XG4gICAgICBpZiAoc2YuZmlsZU5hbWUuZW5kc1dpdGgoJy5uZ2ZhY3RvcnkudHMnKSkge1xuICAgICAgICBjb25zdCB7Z2VuZXJhdGUsIGJhc2VGaWxlTmFtZX0gPSB0aGlzLmhvc3RBZGFwdGVyLnNob3VsZEdlbmVyYXRlRmlsZShzZi5maWxlTmFtZSk7XG4gICAgICAgIGlmIChnZW5lcmF0ZSkge1xuICAgICAgICAgIC8vIE5vdGU6ICEgaXMgb2sgYXMgaG9zdEFkYXB0ZXIuc2hvdWxkR2VuZXJhdGVGaWxlIHdpbGwgYWx3YXlzIHJldHVybiBhIGJhc2VGaWxlTmFtZVxuICAgICAgICAgIC8vIGZvciAubmdmYWN0b3J5LnRzIGZpbGVzLlxuICAgICAgICAgIGNvbnN0IGdlbkZpbGUgPSB0aGlzLmNvbXBpbGVyLmVtaXRUeXBlQ2hlY2tTdHViKHNmLmZpbGVOYW1lLCBiYXNlRmlsZU5hbWUhKTtcbiAgICAgICAgICBpZiAoZ2VuRmlsZSkge1xuICAgICAgICAgICAgdGhpcy5ob3N0QWRhcHRlci51cGRhdGVHZW5lcmF0ZWRGaWxlKGdlbkZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3RzUHJvZ3JhbSA9IHRzLmNyZWF0ZVByb2dyYW0ocm9vdE5hbWVzLCB0aGlzLm9wdGlvbnMsIHRoaXMuaG9zdEFkYXB0ZXIsIHRtcFByb2dyYW0pO1xuICAgIC8vIE5vdGU6IHRoZSBuZXcgdHMgcHJvZ3JhbSBzaG91bGQgYmUgY29tcGxldGVseSByZXVzYWJsZSBieSBUeXBlU2NyaXB0IGFzOlxuICAgIC8vIC0gd2UgY2FjaGUgYWxsIHRoZSBmaWxlcyBpbiB0aGUgaG9zdEFkYXB0ZXJcbiAgICAvLyAtIG5ldyBuZXcgc3R1YnMgdXNlIHRoZSBleGFjdGx5IHNhbWUgaW1wb3J0cy9leHBvcnRzIGFzIHRoZSBvbGQgb25jZSAod2UgYXNzZXJ0IHRoYXQgaW5cbiAgICAvLyBob3N0QWRhcHRlci51cGRhdGVHZW5lcmF0ZWRGaWxlKS5cbiAgICAvLyBUUyA0LjErIHN0b3JlcyB0aGUgcmV1c2Ugc3RhdGUgaW4gdGhlIG5ldyBwcm9ncmFtXG4gICAgY29uc3QgY2hlY2tSZXVzZVByb2dyYW0gPVxuICAgICAgICAodHMudmVyc2lvbk1ham9yTWlub3IgYXMgc3RyaW5nKSA9PT0gJzQuMCcgPyB0bXBQcm9ncmFtIDogdGhpcy5fdHNQcm9ncmFtO1xuICAgIGlmICh0c1N0cnVjdHVyZUlzUmV1c2VkKGNoZWNrUmV1c2VQcm9ncmFtKSAhPT0gU3RydWN0dXJlSXNSZXVzZWQuQ29tcGxldGVseSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnRlcm5hbCBFcnJvcjogVGhlIHN0cnVjdHVyZSBvZiB0aGUgcHJvZ3JhbSBjaGFuZ2VkIGR1cmluZyBjb2RlZ2VuLmApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZVByb2dyYW1PbkVycm9yKGU6IGFueSkge1xuICAgIC8vIFN0aWxsIGZpbGwgdGhlIGFuYWx5emVkTW9kdWxlcyBhbmQgdGhlIHRzUHJvZ3JhbVxuICAgIC8vIHNvIHRoYXQgd2UgZG9uJ3QgY2F1c2Ugb3RoZXIgZXJyb3JzIGZvciB1c2VycyB3aG8gZS5nLiB3YW50IHRvIGVtaXQgdGhlIG5nUHJvZ3JhbS5cbiAgICB0aGlzLl9hbmFseXplZE1vZHVsZXMgPSBlbXB0eU1vZHVsZXM7XG4gICAgdGhpcy5vbGRUc1Byb2dyYW0gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5faG9zdEFkYXB0ZXIuaXNTb3VyY2VGaWxlID0gKCkgPT4gZmFsc2U7XG4gICAgdGhpcy5fdHNQcm9ncmFtID0gdHMuY3JlYXRlUHJvZ3JhbSh0aGlzLnJvb3ROYW1lcywgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3RBZGFwdGVyKTtcbiAgICBpZiAoaXNTeW50YXhFcnJvcihlKSkge1xuICAgICAgdGhpcy5fYWRkU3RydWN0dXJhbERpYWdub3N0aWNzKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkU3RydWN0dXJhbERpYWdub3N0aWNzKGVycm9yOiBFcnJvcikge1xuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gdGhpcy5fc3RydWN0dXJhbERpYWdub3N0aWNzIHx8ICh0aGlzLl9zdHJ1Y3R1cmFsRGlhZ25vc3RpY3MgPSBbXSk7XG4gICAgaWYgKGlzU3ludGF4RXJyb3IoZXJyb3IpKSB7XG4gICAgICBkaWFnbm9zdGljcy5wdXNoKC4uLnN5bnRheEVycm9yVG9EaWFnbm9zdGljcyhlcnJvciwgdGhpcy50c1Byb2dyYW0pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGlhZ25vc3RpY3MucHVzaCh7XG4gICAgICAgIG1lc3NhZ2VUZXh0OiBlcnJvci50b1N0cmluZygpLFxuICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBOb3RlOiB0aGlzIHJldHVybnMgYSB0cy5EaWFnbm9zdGljIHNvIHRoYXQgd2VcbiAgLy8gY2FuIHJldHVybiBlcnJvcnMgaW4gYSB0cy5FbWl0UmVzdWx0XG4gIHByaXZhdGUgZ2VuZXJhdGVGaWxlc0ZvckVtaXQoZW1pdEZsYWdzOiBFbWl0RmxhZ3MpOlxuICAgICAge2dlbkZpbGVzOiBHZW5lcmF0ZWRGaWxlW10sIGdlbkRpYWdzOiB0cy5EaWFnbm9zdGljW119IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCEoZW1pdEZsYWdzICYgRW1pdEZsYWdzLkNvZGVnZW4pKSB7XG4gICAgICAgIHJldHVybiB7Z2VuRmlsZXM6IFtdLCBnZW5EaWFnczogW119O1xuICAgICAgfVxuICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBhbGxvdyBnZW5lcmF0aW5nIGZpbGVzIHRoYXQgYXJlIG5vdCBpbiB0aGUgcm9vdERpclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzE5MzM3XG4gICAgICBsZXQgZ2VuRmlsZXMgPSB0aGlzLmNvbXBpbGVyLmVtaXRBbGxJbXBscyh0aGlzLmFuYWx5emVkTW9kdWxlcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGdlbkZpbGUgPT4gaXNJblJvb3REaXIoZ2VuRmlsZS5nZW5GaWxlVXJsLCB0aGlzLm9wdGlvbnMpKTtcbiAgICAgIGlmICh0aGlzLm9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMpIHtcbiAgICAgICAgY29uc3Qgb2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcyA9IHRoaXMub2xkUHJvZ3JhbUVtaXR0ZWRHZW5lcmF0ZWRGaWxlcztcbiAgICAgICAgZ2VuRmlsZXMgPSBnZW5GaWxlcy5maWx0ZXIoZ2VuRmlsZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb2xkR2VuRmlsZSA9IG9sZFByb2dyYW1FbWl0dGVkR2VuZXJhdGVkRmlsZXMuZ2V0KGdlbkZpbGUuZ2VuRmlsZVVybCk7XG4gICAgICAgICAgcmV0dXJuICFvbGRHZW5GaWxlIHx8ICFnZW5GaWxlLmlzRXF1aXZhbGVudChvbGRHZW5GaWxlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge2dlbkZpbGVzLCBnZW5EaWFnczogW119O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRPRE8odGJvc2NoKTogY2hlY2sgd2hldGhlciB3ZSBjYW4gYWN0dWFsbHkgaGF2ZSBzeW50YXggZXJyb3JzIGhlcmUsXG4gICAgICAvLyBhcyB3ZSBhbHJlYWR5IHBhcnNlZCB0aGUgbWV0YWRhdGEgYW5kIHRlbXBsYXRlcyBiZWZvcmUgdG8gY3JlYXRlIHRoZSB0eXBlIGNoZWNrIGJsb2NrLlxuICAgICAgaWYgKGlzU3ludGF4RXJyb3IoZSkpIHtcbiAgICAgICAgY29uc3QgZ2VuRGlhZ3M6IHRzLkRpYWdub3N0aWNbXSA9IFt7XG4gICAgICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgICAgIHN0YXJ0OiB1bmRlZmluZWQsXG4gICAgICAgICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICAgICAgbWVzc2FnZVRleHQ6IGUubWVzc2FnZSxcbiAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERVxuICAgICAgICB9XTtcbiAgICAgICAgcmV0dXJuIHtnZW5GaWxlczogW10sIGdlbkRpYWdzfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdW5kZWZpbmVkIGlmIGFsbCBmaWxlcyBzaG91bGQgYmUgZW1pdHRlZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0U291cmNlRmlsZXNGb3JFbWl0KCk6IHRzLlNvdXJjZUZpbGVbXXx1bmRlZmluZWQge1xuICAgIC8vIFRPRE8odGJvc2NoKTogaWYgb25lIG9mIHRoZSBmaWxlcyBjb250YWlucyBhIGBjb25zdCBlbnVtYFxuICAgIC8vIGFsd2F5cyBlbWl0IGFsbCBmaWxlcyAtPiByZXR1cm4gdW5kZWZpbmVkIVxuICAgIGxldCBzb3VyY2VGaWxlc1RvRW1pdCA9IHRoaXMudHNQcm9ncmFtLmdldFNvdXJjZUZpbGVzKCkuZmlsdGVyKHNmID0+IHtcbiAgICAgIHJldHVybiAhc2YuaXNEZWNsYXJhdGlvbkZpbGUgJiYgIUdFTkVSQVRFRF9GSUxFUy50ZXN0KHNmLmZpbGVOYW1lKTtcbiAgICB9KTtcbiAgICBpZiAodGhpcy5vbGRQcm9ncmFtRW1pdHRlZFNvdXJjZUZpbGVzKSB7XG4gICAgICBzb3VyY2VGaWxlc1RvRW1pdCA9IHNvdXJjZUZpbGVzVG9FbWl0LmZpbHRlcihzZiA9PiB7XG4gICAgICAgIGNvbnN0IG9sZEZpbGUgPSB0aGlzLm9sZFByb2dyYW1FbWl0dGVkU291cmNlRmlsZXMhLmdldChzZi5maWxlTmFtZSk7XG4gICAgICAgIHJldHVybiBzZiAhPT0gb2xkRmlsZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlRmlsZXNUb0VtaXQ7XG4gIH1cblxuICBwcml2YXRlIHdyaXRlRmlsZShcbiAgICAgIG91dEZpbGVOYW1lOiBzdHJpbmcsIG91dERhdGE6IHN0cmluZywgd3JpdGVCeXRlT3JkZXJNYXJrOiBib29sZWFuLFxuICAgICAgb25FcnJvcj86IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQsIGdlbkZpbGU/OiBHZW5lcmF0ZWRGaWxlLFxuICAgICAgc291cmNlRmlsZXM/OiBSZWFkb25seUFycmF5PHRzLlNvdXJjZUZpbGU+KSB7XG4gICAgLy8gY29sbGVjdCBlbWl0dGVkTGlicmFyeVN1bW1hcmllc1xuICAgIGxldCBiYXNlRmlsZTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQ7XG4gICAgaWYgKGdlbkZpbGUpIHtcbiAgICAgIGJhc2VGaWxlID0gdGhpcy50c1Byb2dyYW0uZ2V0U291cmNlRmlsZShnZW5GaWxlLnNyY0ZpbGVVcmwpO1xuICAgICAgaWYgKGJhc2VGaWxlKSB7XG4gICAgICAgIGlmICghdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcykge1xuICAgICAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2VuRmlsZS5nZW5GaWxlVXJsLmVuZHNXaXRoKCcubmdzdW1tYXJ5Lmpzb24nKSAmJiBiYXNlRmlsZS5maWxlTmFtZS5lbmRzV2l0aCgnLmQudHMnKSkge1xuICAgICAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMucHVzaCh7XG4gICAgICAgICAgICBmaWxlTmFtZTogYmFzZUZpbGUuZmlsZU5hbWUsXG4gICAgICAgICAgICB0ZXh0OiBiYXNlRmlsZS50ZXh0LFxuICAgICAgICAgICAgc291cmNlRmlsZTogYmFzZUZpbGUsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5lbWl0dGVkTGlicmFyeVN1bW1hcmllcy5wdXNoKHtmaWxlTmFtZTogZ2VuRmlsZS5nZW5GaWxlVXJsLCB0ZXh0OiBvdXREYXRhfSk7XG4gICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZGVjbGFyYXRpb24pIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGVtaXQgZGVjbGFyYXRpb25zLCBzdGlsbCByZWNvcmQgYW4gZW1wdHkgLm5nZmFjdG9yeS5kLnRzIGZpbGUsXG4gICAgICAgICAgICAvLyBhcyB3ZSBtaWdodCBuZWVkIGl0IGxhdGVyIG9uIGZvciByZXNvbHZpbmcgbW9kdWxlIG5hbWVzIGZyb20gc3VtbWFyaWVzLlxuICAgICAgICAgICAgY29uc3QgbmdGYWN0b3J5RHRzID1cbiAgICAgICAgICAgICAgICBnZW5GaWxlLmdlbkZpbGVVcmwuc3Vic3RyaW5nKDAsIGdlbkZpbGUuZ2VuRmlsZVVybC5sZW5ndGggLSAxNSkgKyAnLm5nZmFjdG9yeS5kLnRzJztcbiAgICAgICAgICAgIHRoaXMuZW1pdHRlZExpYnJhcnlTdW1tYXJpZXMucHVzaCh7ZmlsZU5hbWU6IG5nRmFjdG9yeUR0cywgdGV4dDogJyd9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob3V0RmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJykgJiYgYmFzZUZpbGUuZmlsZU5hbWUuZW5kc1dpdGgoJy5kLnRzJykpIHtcbiAgICAgICAgICBjb25zdCBkdHNTb3VyY2VGaWxlUGF0aCA9IGdlbkZpbGUuZ2VuRmlsZVVybC5yZXBsYWNlKC9cXC50cyQvLCAnLmQudHMnKTtcbiAgICAgICAgICAvLyBOb3RlOiBEb24ndCB1c2Ugc291cmNlRmlsZXMgaGVyZSBhcyB0aGUgY3JlYXRlZCAuZC50cyBoYXMgYSBwYXRoIGluIHRoZSBvdXREaXIsXG4gICAgICAgICAgLy8gYnV0IHdlIG5lZWQgb25lIHRoYXQgaXMgbmV4dCB0byB0aGUgLnRzIGZpbGVcbiAgICAgICAgICB0aGlzLmVtaXR0ZWRMaWJyYXJ5U3VtbWFyaWVzLnB1c2goe2ZpbGVOYW1lOiBkdHNTb3VyY2VGaWxlUGF0aCwgdGV4dDogb3V0RGF0YX0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEZpbHRlciBvdXQgZ2VuZXJhdGVkIGZpbGVzIGZvciB3aGljaCB3ZSBkaWRuJ3QgZ2VuZXJhdGUgY29kZS5cbiAgICAvLyBUaGlzIGNhbiBoYXBwZW4gYXMgdGhlIHN0dWIgY2FsY3VsYXRpb24gaXMgbm90IGNvbXBsZXRlbHkgZXhhY3QuXG4gICAgLy8gTm90ZTogc291cmNlRmlsZSByZWZlcnMgdG8gdGhlIC5uZ2ZhY3RvcnkudHMgLyAubmdzdW1tYXJ5LnRzIGZpbGVcbiAgICAvLyBub2RlX2VtaXR0ZXJfdHJhbnNmb3JtIGFscmVhZHkgc2V0IHRoZSBmaWxlIGNvbnRlbnRzIHRvIGJlIGVtcHR5LFxuICAgIC8vICBzbyB0aGlzIGNvZGUgb25seSBuZWVkcyB0byBza2lwIHRoZSBmaWxlIGlmICFhbGxvd0VtcHR5Q29kZWdlbkZpbGVzLlxuICAgIGNvbnN0IGlzR2VuZXJhdGVkID0gR0VORVJBVEVEX0ZJTEVTLnRlc3Qob3V0RmlsZU5hbWUpO1xuICAgIGlmIChpc0dlbmVyYXRlZCAmJiAhdGhpcy5vcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMgJiZcbiAgICAgICAgKCFnZW5GaWxlIHx8ICFnZW5GaWxlLnN0bXRzIHx8IGdlbkZpbGUuc3RtdHMubGVuZ3RoID09PSAwKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYmFzZUZpbGUpIHtcbiAgICAgIHNvdXJjZUZpbGVzID0gc291cmNlRmlsZXMgPyBbLi4uc291cmNlRmlsZXMsIGJhc2VGaWxlXSA6IFtiYXNlRmlsZV07XG4gICAgfVxuICAgIC8vIFRPRE86IHJlbW92ZSBhbnkgd2hlbiBUUyAyLjQgc3VwcG9ydCBpcyByZW1vdmVkLlxuICAgIHRoaXMuaG9zdC53cml0ZUZpbGUob3V0RmlsZU5hbWUsIG91dERhdGEsIHdyaXRlQnl0ZU9yZGVyTWFyaywgb25FcnJvciwgc291cmNlRmlsZXMgYXMgYW55KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKHtyb290TmFtZXMsIG9wdGlvbnMsIGhvc3QsIG9sZFByb2dyYW19OiB7XG4gIHJvb3ROYW1lczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICBvcHRpb25zOiBDb21waWxlck9wdGlvbnMsXG4gIGhvc3Q6IENvbXBpbGVySG9zdCxcbiAgb2xkUHJvZ3JhbT86IFByb2dyYW1cbn0pOiBQcm9ncmFtIHtcbiAgaWYgKG9wdGlvbnMuZW5hYmxlSXZ5ICE9PSBmYWxzZSkge1xuICAgIHJldHVybiBuZXcgTmd0c2NQcm9ncmFtKHJvb3ROYW1lcywgb3B0aW9ucywgaG9zdCwgb2xkUHJvZ3JhbSBhcyBOZ3RzY1Byb2dyYW0gfCB1bmRlZmluZWQpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgQW5ndWxhckNvbXBpbGVyUHJvZ3JhbShyb290TmFtZXMsIG9wdGlvbnMsIGhvc3QsIG9sZFByb2dyYW0pO1xuICB9XG59XG5cbi8vIENvbXB1dGUgdGhlIEFvdENvbXBpbGVyIG9wdGlvbnNcbmZ1bmN0aW9uIGdldEFvdENvbXBpbGVyT3B0aW9ucyhvcHRpb25zOiBDb21waWxlck9wdGlvbnMpOiBBb3RDb21waWxlck9wdGlvbnMge1xuICBsZXQgbWlzc2luZ1RyYW5zbGF0aW9uID0gY29yZS5NaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5XYXJuaW5nO1xuXG4gIHN3aXRjaCAob3B0aW9ucy5pMThuSW5NaXNzaW5nVHJhbnNsYXRpb25zKSB7XG4gICAgY2FzZSAnaWdub3JlJzpcbiAgICAgIG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuSWdub3JlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgbWlzc2luZ1RyYW5zbGF0aW9uID0gY29yZS5NaXNzaW5nVHJhbnNsYXRpb25TdHJhdGVneS5FcnJvcjtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgbGV0IHRyYW5zbGF0aW9uczogc3RyaW5nID0gJyc7XG5cbiAgaWYgKG9wdGlvbnMuaTE4bkluRmlsZSkge1xuICAgIGlmICghb3B0aW9ucy5pMThuSW5Mb2NhbGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHRyYW5zbGF0aW9uIGZpbGUgKCR7b3B0aW9ucy5pMThuSW5GaWxlfSkgbG9jYWxlIG11c3QgYmUgcHJvdmlkZWQuYCk7XG4gICAgfVxuICAgIHRyYW5zbGF0aW9ucyA9IGZzLnJlYWRGaWxlU3luYyhvcHRpb25zLmkxOG5JbkZpbGUsICd1dGY4Jyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gdHJhbnNsYXRpb25zIGFyZSBwcm92aWRlZCwgaWdub3JlIGFueSBlcnJvcnNcbiAgICAvLyBXZSBzdGlsbCBnbyB0aHJvdWdoIGkxOG4gdG8gcmVtb3ZlIGkxOG4gYXR0cmlidXRlc1xuICAgIG1pc3NpbmdUcmFuc2xhdGlvbiA9IGNvcmUuTWlzc2luZ1RyYW5zbGF0aW9uU3RyYXRlZ3kuSWdub3JlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBsb2NhbGU6IG9wdGlvbnMuaTE4bkluTG9jYWxlLFxuICAgIGkxOG5Gb3JtYXQ6IG9wdGlvbnMuaTE4bkluRm9ybWF0IHx8IG9wdGlvbnMuaTE4bk91dEZvcm1hdCxcbiAgICBpMThuVXNlRXh0ZXJuYWxJZHM6IG9wdGlvbnMuaTE4blVzZUV4dGVybmFsSWRzLFxuICAgIHRyYW5zbGF0aW9ucyxcbiAgICBtaXNzaW5nVHJhbnNsYXRpb24sXG4gICAgZW5hYmxlU3VtbWFyaWVzRm9ySml0OiBvcHRpb25zLmVuYWJsZVN1bW1hcmllc0ZvckppdCxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBvcHRpb25zLnByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgZnVsbFRlbXBsYXRlVHlwZUNoZWNrOiBvcHRpb25zLmZ1bGxUZW1wbGF0ZVR5cGVDaGVjayxcbiAgICBhbGxvd0VtcHR5Q29kZWdlbkZpbGVzOiBvcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMsXG4gICAgZW5hYmxlSXZ5OiBvcHRpb25zLmVuYWJsZUl2eSxcbiAgICBjcmVhdGVFeHRlcm5hbFN5bWJvbEZhY3RvcnlSZWV4cG9ydHM6IG9wdGlvbnMuY3JlYXRlRXh0ZXJuYWxTeW1ib2xGYWN0b3J5UmVleHBvcnRzLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXROZ09wdGlvbkRpYWdub3N0aWNzKG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyk6IFJlYWRvbmx5QXJyYXk8RGlhZ25vc3RpYz4ge1xuICBpZiAob3B0aW9ucy5hbm5vdGF0aW9uc0FzKSB7XG4gICAgc3dpdGNoIChvcHRpb25zLmFubm90YXRpb25zQXMpIHtcbiAgICAgIGNhc2UgJ2RlY29yYXRvcnMnOlxuICAgICAgY2FzZSAnc3RhdGljIGZpZWxkcyc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgbWVzc2FnZVRleHQ6XG4gICAgICAgICAgICAgICdBbmd1bGFyIGNvbXBpbGVyIG9wdGlvbnMgXCJhbm5vdGF0aW9uc0FzXCIgb25seSBzdXBwb3J0cyBcInN0YXRpYyBmaWVsZHNcIiBhbmQgXCJkZWNvcmF0b3JzXCInLFxuICAgICAgICAgIGNhdGVnb3J5OiB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFXG4gICAgICAgIH1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlcGFyYXRvcnMocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGNhbiBhZGp1c3QgYSBwYXRoIGZyb20gc291cmNlIHBhdGggdG8gb3V0IHBhdGgsXG4gKiBiYXNlZCBvbiBhbiBleGlzdGluZyBtYXBwaW5nIGZyb20gc291cmNlIHRvIG91dCBwYXRoLlxuICpcbiAqIFRPRE8odGJvc2NoKTogdGFsayB0byB0aGUgVHlwZVNjcmlwdCB0ZWFtIHRvIGV4cG9zZSB0aGVpciBsb2dpYyBmb3IgY2FsY3VsYXRpbmcgdGhlIGByb290RGlyYFxuICogaWYgbm9uZSB3YXMgc3BlY2lmaWVkLlxuICpcbiAqIE5vdGU6IFRoaXMgZnVuY3Rpb24gd29ya3Mgb24gbm9ybWFsaXplZCBwYXRocyBmcm9tIHR5cGVzY3JpcHQgYnV0IHNob3VsZCBhbHdheXMgcmV0dXJuXG4gKiBQT1NJWCBub3JtYWxpemVkIHBhdGhzIGZvciBvdXRwdXQgcGF0aHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcmNUb091dFBhdGhNYXBwZXIoXG4gICAgb3V0RGlyOiBzdHJpbmd8dW5kZWZpbmVkLCBzYW1wbGVTcmNGaWxlTmFtZTogc3RyaW5nfHVuZGVmaW5lZCxcbiAgICBzYW1wbGVPdXRGaWxlTmFtZTogc3RyaW5nfHVuZGVmaW5lZCwgaG9zdDoge1xuICAgICAgZGlybmFtZTogdHlwZW9mIHBhdGguZGlybmFtZSxcbiAgICAgIHJlc29sdmU6IHR5cGVvZiBwYXRoLnJlc29sdmUsXG4gICAgICByZWxhdGl2ZTogdHlwZW9mIHBhdGgucmVsYXRpdmVcbiAgICB9ID0gcGF0aCk6IChzcmNGaWxlTmFtZTogc3RyaW5nKSA9PiBzdHJpbmcge1xuICBpZiAob3V0RGlyKSB7XG4gICAgbGV0IHBhdGg6IHt9ID0ge307ICAvLyBFbnN1cmUgd2UgZXJyb3IgaWYgd2UgdXNlIGBwYXRoYCBpbnN0ZWFkIG9mIGBob3N0YC5cbiAgICBpZiAoc2FtcGxlU3JjRmlsZU5hbWUgPT0gbnVsbCB8fCBzYW1wbGVPdXRGaWxlTmFtZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNhbGN1bGF0ZSB0aGUgcm9vdERpciB3aXRob3V0IGEgc2FtcGxlIHNyY0ZpbGVOYW1lIC8gb3V0RmlsZU5hbWUuIGApO1xuICAgIH1cbiAgICBjb25zdCBzcmNGaWxlRGlyID0gbm9ybWFsaXplU2VwYXJhdG9ycyhob3N0LmRpcm5hbWUoc2FtcGxlU3JjRmlsZU5hbWUpKTtcbiAgICBjb25zdCBvdXRGaWxlRGlyID0gbm9ybWFsaXplU2VwYXJhdG9ycyhob3N0LmRpcm5hbWUoc2FtcGxlT3V0RmlsZU5hbWUpKTtcbiAgICBpZiAoc3JjRmlsZURpciA9PT0gb3V0RmlsZURpcikge1xuICAgICAgcmV0dXJuIChzcmNGaWxlTmFtZSkgPT4gc3JjRmlsZU5hbWU7XG4gICAgfVxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgY29tbW9uIHN1ZmZpeCwgc3RvcHBpbmdcbiAgICAvLyBhdCBgb3V0RGlyYC5cbiAgICBjb25zdCBzcmNEaXJQYXJ0cyA9IHNyY0ZpbGVEaXIuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBvdXREaXJQYXJ0cyA9IG5vcm1hbGl6ZVNlcGFyYXRvcnMoaG9zdC5yZWxhdGl2ZShvdXREaXIsIG91dEZpbGVEaXIpKS5zcGxpdCgnLycpO1xuICAgIGxldCBpID0gMDtcbiAgICB3aGlsZSAoaSA8IE1hdGgubWluKHNyY0RpclBhcnRzLmxlbmd0aCwgb3V0RGlyUGFydHMubGVuZ3RoKSAmJlxuICAgICAgICAgICBzcmNEaXJQYXJ0c1tzcmNEaXJQYXJ0cy5sZW5ndGggLSAxIC0gaV0gPT09IG91dERpclBhcnRzW291dERpclBhcnRzLmxlbmd0aCAtIDEgLSBpXSlcbiAgICAgIGkrKztcbiAgICBjb25zdCByb290RGlyID0gc3JjRGlyUGFydHMuc2xpY2UoMCwgc3JjRGlyUGFydHMubGVuZ3RoIC0gaSkuam9pbignLycpO1xuICAgIHJldHVybiAoc3JjRmlsZU5hbWUpID0+IHtcbiAgICAgIC8vIE5vdGU6IEJlZm9yZSB3ZSByZXR1cm4gdGhlIG1hcHBlZCBvdXRwdXQgcGF0aCwgd2UgbmVlZCB0byBub3JtYWxpemUgdGhlIHBhdGggZGVsaW1pdGVyc1xuICAgICAgLy8gYmVjYXVzZSB0aGUgb3V0cHV0IHBhdGggaXMgdXN1YWxseSBwYXNzZWQgdG8gVHlwZVNjcmlwdCB3aGljaCBzb21ldGltZXMgb25seSBleHBlY3RzXG4gICAgICAvLyBwb3NpeCBub3JtYWxpemVkIHBhdGhzIChlLmcuIGlmIGEgY3VzdG9tIGNvbXBpbGVyIGhvc3QgaXMgdXNlZClcbiAgICAgIHJldHVybiBub3JtYWxpemVTZXBhcmF0b3JzKGhvc3QucmVzb2x2ZShvdXREaXIsIGhvc3QucmVsYXRpdmUocm9vdERpciwgc3JjRmlsZU5hbWUpKSk7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBOb3RlOiBCZWZvcmUgd2UgcmV0dXJuIHRoZSBvdXRwdXQgcGF0aCwgd2UgbmVlZCB0byBub3JtYWxpemUgdGhlIHBhdGggZGVsaW1pdGVycyBiZWNhdXNlXG4gICAgLy8gdGhlIG91dHB1dCBwYXRoIGlzIHVzdWFsbHkgcGFzc2VkIHRvIFR5cGVTY3JpcHQgd2hpY2ggb25seSBwYXNzZXMgYXJvdW5kIHBvc2l4XG4gICAgLy8gbm9ybWFsaXplZCBwYXRocyAoZS5nLiBpZiBhIGN1c3RvbSBjb21waWxlciBob3N0IGlzIHVzZWQpXG4gICAgcmV0dXJuIChzcmNGaWxlTmFtZSkgPT4gbm9ybWFsaXplU2VwYXJhdG9ycyhzcmNGaWxlTmFtZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGkxOG5FeHRyYWN0KFxuICAgIGZvcm1hdE5hbWU6IHN0cmluZ3xudWxsLCBvdXRGaWxlOiBzdHJpbmd8bnVsbCwgaG9zdDogdHMuQ29tcGlsZXJIb3N0LCBvcHRpb25zOiBDb21waWxlck9wdGlvbnMsXG4gICAgYnVuZGxlOiBNZXNzYWdlQnVuZGxlKTogc3RyaW5nW10ge1xuICBmb3JtYXROYW1lID0gZm9ybWF0TmFtZSB8fCAneGxmJztcbiAgLy8gQ2hlY2tzIHRoZSBmb3JtYXQgYW5kIHJldHVybnMgdGhlIGV4dGVuc2lvblxuICBjb25zdCBleHQgPSBpMThuR2V0RXh0ZW5zaW9uKGZvcm1hdE5hbWUpO1xuICBjb25zdCBjb250ZW50ID0gaTE4blNlcmlhbGl6ZShidW5kbGUsIGZvcm1hdE5hbWUsIG9wdGlvbnMpO1xuICBjb25zdCBkc3RGaWxlID0gb3V0RmlsZSB8fCBgbWVzc2FnZXMuJHtleHR9YDtcbiAgY29uc3QgZHN0UGF0aCA9IHBhdGgucmVzb2x2ZShvcHRpb25zLm91dERpciB8fCBvcHRpb25zLmJhc2VQYXRoISwgZHN0RmlsZSk7XG4gIGhvc3Qud3JpdGVGaWxlKGRzdFBhdGgsIGNvbnRlbnQsIGZhbHNlLCB1bmRlZmluZWQsIFtdKTtcbiAgcmV0dXJuIFtkc3RQYXRoXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGkxOG5TZXJpYWxpemUoXG4gICAgYnVuZGxlOiBNZXNzYWdlQnVuZGxlLCBmb3JtYXROYW1lOiBzdHJpbmcsIG9wdGlvbnM6IENvbXBpbGVyT3B0aW9ucyk6IHN0cmluZyB7XG4gIGNvbnN0IGZvcm1hdCA9IGZvcm1hdE5hbWUudG9Mb3dlckNhc2UoKTtcbiAgbGV0IHNlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG5cbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlICd4bWInOlxuICAgICAgc2VyaWFsaXplciA9IG5ldyBYbWIoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3hsaWZmMic6XG4gICAgY2FzZSAneGxmMic6XG4gICAgICBzZXJpYWxpemVyID0gbmV3IFhsaWZmMigpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAneGxmJzpcbiAgICBjYXNlICd4bGlmZic6XG4gICAgZGVmYXVsdDpcbiAgICAgIHNlcmlhbGl6ZXIgPSBuZXcgWGxpZmYoKTtcbiAgfVxuXG4gIHJldHVybiBidW5kbGUud3JpdGUoc2VyaWFsaXplciwgZ2V0UGF0aE5vcm1hbGl6ZXIob3B0aW9ucy5iYXNlUGF0aCkpO1xufVxuXG5mdW5jdGlvbiBnZXRQYXRoTm9ybWFsaXplcihiYXNlUGF0aD86IHN0cmluZykge1xuICAvLyBub3JtYWxpemUgc291cmNlIHBhdGhzIGJ5IHJlbW92aW5nIHRoZSBiYXNlIHBhdGggYW5kIGFsd2F5cyB1c2luZyBcIi9cIiBhcyBhIHNlcGFyYXRvclxuICByZXR1cm4gKHNvdXJjZVBhdGg6IHN0cmluZykgPT4ge1xuICAgIHNvdXJjZVBhdGggPSBiYXNlUGF0aCA/IHBhdGgucmVsYXRpdmUoYmFzZVBhdGgsIHNvdXJjZVBhdGgpIDogc291cmNlUGF0aDtcbiAgICByZXR1cm4gc291cmNlUGF0aC5zcGxpdChwYXRoLnNlcCkuam9pbignLycpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaTE4bkdldEV4dGVuc2lvbihmb3JtYXROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBmb3JtYXQgPSBmb3JtYXROYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICBjYXNlICd4bWInOlxuICAgICAgcmV0dXJuICd4bWInO1xuICAgIGNhc2UgJ3hsZic6XG4gICAgY2FzZSAneGxpZic6XG4gICAgY2FzZSAneGxpZmYnOlxuICAgIGNhc2UgJ3hsZjInOlxuICAgIGNhc2UgJ3hsaWZmMic6XG4gICAgICByZXR1cm4gJ3hsZic7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGZvcm1hdCBcIiR7Zm9ybWF0TmFtZX1cImApO1xufVxuXG5mdW5jdGlvbiBtZXJnZUVtaXRSZXN1bHRzKGVtaXRSZXN1bHRzOiB0cy5FbWl0UmVzdWx0W10pOiB0cy5FbWl0UmVzdWx0IHtcbiAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICBsZXQgZW1pdFNraXBwZWQgPSBmYWxzZTtcbiAgY29uc3QgZW1pdHRlZEZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICBmb3IgKGNvbnN0IGVyIG9mIGVtaXRSZXN1bHRzKSB7XG4gICAgZGlhZ25vc3RpY3MucHVzaCguLi5lci5kaWFnbm9zdGljcyk7XG4gICAgZW1pdFNraXBwZWQgPSBlbWl0U2tpcHBlZCB8fCBlci5lbWl0U2tpcHBlZDtcbiAgICBlbWl0dGVkRmlsZXMucHVzaCguLi4oZXIuZW1pdHRlZEZpbGVzIHx8IFtdKSk7XG4gIH1cbiAgcmV0dXJuIHtkaWFnbm9zdGljcywgZW1pdFNraXBwZWQsIGVtaXR0ZWRGaWxlc307XG59XG5cbmZ1bmN0aW9uIGRpYWdub3N0aWNTb3VyY2VPZlNwYW4oc3BhbjogUGFyc2VTb3VyY2VTcGFuKTogdHMuU291cmNlRmlsZSB7XG4gIC8vIEZvciBkaWFnbm9zdGljcywgVHlwZVNjcmlwdCBvbmx5IHVzZXMgdGhlIGZpbGVOYW1lIGFuZCB0ZXh0IHByb3BlcnRpZXMuXG4gIC8vIFRoZSByZWR1bmRhbnQgJygpJyBhcmUgaGVyZSBpcyB0byBhdm9pZCBoYXZpbmcgY2xhbmctZm9ybWF0IGJyZWFraW5nIHRoZSBsaW5lIGluY29ycmVjdGx5LlxuICByZXR1cm4gKHtmaWxlTmFtZTogc3Bhbi5zdGFydC5maWxlLnVybCwgdGV4dDogc3Bhbi5zdGFydC5maWxlLmNvbnRlbnR9IGFzIGFueSk7XG59XG5cbmZ1bmN0aW9uIGRpYWdub3N0aWNTb3VyY2VPZkZpbGVOYW1lKGZpbGVOYW1lOiBzdHJpbmcsIHByb2dyYW06IHRzLlByb2dyYW0pOiB0cy5Tb3VyY2VGaWxlIHtcbiAgY29uc3Qgc291cmNlRmlsZSA9IHByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gIGlmIChzb3VyY2VGaWxlKSByZXR1cm4gc291cmNlRmlsZTtcblxuICAvLyBJZiB3ZSBhcmUgcmVwb3J0aW5nIGRpYWdub3N0aWNzIGZvciBhIHNvdXJjZSBmaWxlIHRoYXQgaXMgbm90IGluIHRoZSBwcm9qZWN0IHRoZW4gd2UgbmVlZFxuICAvLyB0byBmYWtlIGEgc291cmNlIGZpbGUgc28gdGhlIGRpYWdub3N0aWMgZm9ybWF0dGluZyByb3V0aW5lcyBjYW4gZW1pdCB0aGUgZmlsZSBuYW1lLlxuICAvLyBUaGUgcmVkdW5kYW50ICcoKScgYXJlIGhlcmUgaXMgdG8gYXZvaWQgaGF2aW5nIGNsYW5nLWZvcm1hdCBicmVha2luZyB0aGUgbGluZSBpbmNvcnJlY3RseS5cbiAgcmV0dXJuICh7ZmlsZU5hbWUsIHRleHQ6ICcnfSBhcyBhbnkpO1xufVxuXG5cbmZ1bmN0aW9uIGRpYWdub3N0aWNDaGFpbkZyb21Gb3JtYXR0ZWREaWFnbm9zdGljQ2hhaW4oY2hhaW46IEZvcm1hdHRlZE1lc3NhZ2VDaGFpbik6XG4gICAgRGlhZ25vc3RpY01lc3NhZ2VDaGFpbiB7XG4gIHJldHVybiB7XG4gICAgbWVzc2FnZVRleHQ6IGNoYWluLm1lc3NhZ2UsXG4gICAgbmV4dDogY2hhaW4ubmV4dCAmJiBjaGFpbi5uZXh0Lm1hcChkaWFnbm9zdGljQ2hhaW5Gcm9tRm9ybWF0dGVkRGlhZ25vc3RpY0NoYWluKSxcbiAgICBwb3NpdGlvbjogY2hhaW4ucG9zaXRpb25cbiAgfTtcbn1cblxuZnVuY3Rpb24gc3ludGF4RXJyb3JUb0RpYWdub3N0aWNzKGVycm9yOiBFcnJvciwgcHJvZ3JhbTogdHMuUHJvZ3JhbSk6IERpYWdub3N0aWNbXSB7XG4gIGNvbnN0IHBhcnNlckVycm9ycyA9IGdldFBhcnNlRXJyb3JzKGVycm9yKTtcbiAgaWYgKHBhcnNlckVycm9ycyAmJiBwYXJzZXJFcnJvcnMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHBhcnNlckVycm9ycy5tYXA8RGlhZ25vc3RpYz4oZSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZVRleHQ6IGUuY29udGV4dHVhbE1lc3NhZ2UoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IGRpYWdub3N0aWNTb3VyY2VPZlNwYW4oZS5zcGFuKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBlLnNwYW4uc3RhcnQub2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBlLnNwYW4uZW5kLm9mZnNldCAtIGUuc3Bhbi5zdGFydC5vZmZzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291cmNlOiBTT1VSQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiBERUZBVUxUX0VSUk9SX0NPREVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gIH0gZWxzZSBpZiAoaXNGb3JtYXR0ZWRFcnJvcihlcnJvcikpIHtcbiAgICByZXR1cm4gW3tcbiAgICAgIG1lc3NhZ2VUZXh0OiBlcnJvci5tZXNzYWdlLFxuICAgICAgY2hhaW46IGVycm9yLmNoYWluICYmIGRpYWdub3N0aWNDaGFpbkZyb21Gb3JtYXR0ZWREaWFnbm9zdGljQ2hhaW4oZXJyb3IuY2hhaW4pLFxuICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgIHNvdXJjZTogU09VUkNFLFxuICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFLFxuICAgICAgcG9zaXRpb246IGVycm9yLnBvc2l0aW9uXG4gICAgfV07XG4gIH1cblxuICBjb25zdCBuZ01vZHVsZUVycm9yRGF0YSA9IGdldE1pc3NpbmdOZ01vZHVsZU1ldGFkYXRhRXJyb3JEYXRhKGVycm9yKTtcbiAgaWYgKG5nTW9kdWxlRXJyb3JEYXRhICE9PSBudWxsKSB7XG4gICAgLy8gVGhpcyBlcnJvciByZXByZXNlbnRzIHRoZSBpbXBvcnQgb3IgZXhwb3J0IG9mIGFuIGBOZ01vZHVsZWAgdGhhdCBkaWRuJ3QgaGF2ZSB2YWxpZCBtZXRhZGF0YS5cbiAgICAvLyBUaGlzIF9taWdodF8gaGFwcGVuIGJlY2F1c2UgdGhlIE5nTW9kdWxlIGluIHF1ZXN0aW9uIGlzIGFuIEl2eS1jb21waWxlZCBsaWJyYXJ5LCBhbmQgd2Ugd2FudFxuICAgIC8vIHRvIHNob3cgYSBtb3JlIHVzZWZ1bCBlcnJvciBpZiB0aGF0J3MgdGhlIGNhc2UuXG4gICAgY29uc3QgbmdNb2R1bGVDbGFzcyA9XG4gICAgICAgIGdldER0c0NsYXNzKHByb2dyYW0sIG5nTW9kdWxlRXJyb3JEYXRhLmZpbGVOYW1lLCBuZ01vZHVsZUVycm9yRGF0YS5jbGFzc05hbWUpO1xuICAgIGlmIChuZ01vZHVsZUNsYXNzICE9PSBudWxsICYmIGlzSXZ5TmdNb2R1bGUobmdNb2R1bGVDbGFzcykpIHtcbiAgICAgIHJldHVybiBbe1xuICAgICAgICBtZXNzYWdlVGV4dDogYFRoZSBOZ01vZHVsZSAnJHtuZ01vZHVsZUVycm9yRGF0YS5jbGFzc05hbWV9JyBpbiAnJHtcbiAgICAgICAgICAgIG5nTW9kdWxlRXJyb3JEYXRhXG4gICAgICAgICAgICAgICAgLmZpbGVOYW1lfScgaXMgaW1wb3J0ZWQgYnkgdGhpcyBjb21waWxhdGlvbiwgYnV0IGFwcGVhcnMgdG8gYmUgcGFydCBvZiBhIGxpYnJhcnkgY29tcGlsZWQgZm9yIEFuZ3VsYXIgSXZ5LiBUaGlzIG1heSBvY2N1ciBiZWNhdXNlOlxuXG4gIDEpIHRoZSBsaWJyYXJ5IHdhcyBwcm9jZXNzZWQgd2l0aCAnbmdjYycuIFJlbW92aW5nIGFuZCByZWluc3RhbGxpbmcgbm9kZV9tb2R1bGVzIG1heSBmaXggdGhpcyBwcm9ibGVtLlxuXG4gIDIpIHRoZSBsaWJyYXJ5IHdhcyBwdWJsaXNoZWQgZm9yIEFuZ3VsYXIgSXZ5IGFuZCB2MTIrIGFwcGxpY2F0aW9ucyBvbmx5LiBDaGVjayBpdHMgcGVlciBkZXBlbmRlbmNpZXMgY2FyZWZ1bGx5IGFuZCBlbnN1cmUgdGhhdCB5b3UncmUgdXNpbmcgYSBjb21wYXRpYmxlIHZlcnNpb24gb2YgQW5ndWxhci5cblxuU2VlIGh0dHBzOi8vYW5ndWxhci5pby9lcnJvcnMvTkc2OTk5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuYCxcbiAgICAgICAgY2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvcixcbiAgICAgICAgY29kZTogREVGQVVMVF9FUlJPUl9DT0RFLFxuICAgICAgICBzb3VyY2U6IFNPVVJDRSxcbiAgICAgIH1dO1xuICAgIH1cbiAgfVxuXG4gIC8vIFByb2R1Y2UgYSBEaWFnbm9zdGljIGFueXdheSBzaW5jZSB3ZSBrbm93IGZvciBzdXJlIGBlcnJvcmAgaXMgYSBTeW50YXhFcnJvclxuICByZXR1cm4gW3tcbiAgICBtZXNzYWdlVGV4dDogZXJyb3IubWVzc2FnZSxcbiAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgIGNvZGU6IERFRkFVTFRfRVJST1JfQ09ERSxcbiAgICBzb3VyY2U6IFNPVVJDRSxcbiAgfV07XG59XG5cbmZ1bmN0aW9uIGdldER0c0NsYXNzKHByb2dyYW06IHRzLlByb2dyYW0sIGZpbGVOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKTogdHMuQ2xhc3NEZWNsYXJhdGlvbnxcbiAgICBudWxsIHtcbiAgY29uc3Qgc2YgPSBwcm9ncmFtLmdldFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICBpZiAoc2YgPT09IHVuZGVmaW5lZCB8fCAhc2YuaXNEZWNsYXJhdGlvbkZpbGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBmb3IgKGNvbnN0IHN0bXQgb2Ygc2Yuc3RhdGVtZW50cykge1xuICAgIGlmICghdHMuaXNDbGFzc0RlY2xhcmF0aW9uKHN0bXQpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHN0bXQubmFtZSA9PT0gdW5kZWZpbmVkIHx8IHN0bXQubmFtZS50ZXh0ICE9PSBjbGFzc05hbWUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJldHVybiBzdG10O1xuICB9XG5cbiAgLy8gTm8gY2xhc3NlcyBmb3VuZCB0aGF0IG1hdGNoZWQgdGhlIGdpdmVuIG5hbWUuXG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0l2eU5nTW9kdWxlKGNsYXp6OiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogYm9vbGVhbiB7XG4gIGZvciAoY29uc3QgbWVtYmVyIG9mIGNsYXp6Lm1lbWJlcnMpIHtcbiAgICBpZiAoIXRzLmlzUHJvcGVydHlEZWNsYXJhdGlvbihtZW1iZXIpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihtZW1iZXIubmFtZSkgJiYgbWVtYmVyLm5hbWUudGV4dCA9PT0gJ8m1bW9kJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLy8gTm8gSXZ5ICfJtW1vZCcgcHJvcGVydHkgZm91bmQuXG4gIHJldHVybiBmYWxzZTtcbn0iXX0=