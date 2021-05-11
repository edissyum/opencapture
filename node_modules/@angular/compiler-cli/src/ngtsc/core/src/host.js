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
        define("@angular/compiler-cli/src/ngtsc/core/src/host", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/entry_point", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/typecheck", "@angular/compiler-cli/src/ngtsc/util/src/path", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgCompilerHost = exports.DelegatingCompilerHost = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var entry_point_1 = require("@angular/compiler-cli/src/ngtsc/entry_point");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typecheck_1 = require("@angular/compiler-cli/src/ngtsc/typecheck");
    var path_1 = require("@angular/compiler-cli/src/ngtsc/util/src/path");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    // A persistent source of bugs in CompilerHost delegation has been the addition by TS of new,
    // optional methods on ts.CompilerHost. Since these methods are optional, it's not a type error that
    // the delegating host doesn't implement or delegate them. This causes subtle runtime failures. No
    // more. This infrastructure ensures that failing to delegate a method is a compile-time error.
    /**
     * Delegates all methods of `ExtendedTsCompilerHost` to a delegate, with the exception of
     * `getSourceFile` and `fileExists` which are implemented in `NgCompilerHost`.
     *
     * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
     * generated for this class.
     */
    var DelegatingCompilerHost = /** @class */ (function () {
        function DelegatingCompilerHost(delegate) {
            this.delegate = delegate;
            // Excluded are 'getSourceFile' and 'fileExists', which are actually implemented by NgCompilerHost
            // below.
            this.createHash = this.delegateMethod('createHash');
            this.directoryExists = this.delegateMethod('directoryExists');
            this.fileNameToModuleName = this.delegateMethod('fileNameToModuleName');
            this.getCancellationToken = this.delegateMethod('getCancellationToken');
            this.getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
            this.getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
            this.getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
            this.getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
            this.getDirectories = this.delegateMethod('getDirectories');
            this.getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
            this.getModifiedResourceFiles = this.delegateMethod('getModifiedResourceFiles');
            this.getNewLine = this.delegateMethod('getNewLine');
            this.getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
            this.getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
            this.readDirectory = this.delegateMethod('readDirectory');
            this.readFile = this.delegateMethod('readFile');
            this.readResource = this.delegateMethod('readResource');
            this.realpath = this.delegateMethod('realpath');
            this.resolveModuleNames = this.delegateMethod('resolveModuleNames');
            this.resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
            this.resourceNameToFileName = this.delegateMethod('resourceNameToFileName');
            this.trace = this.delegateMethod('trace');
            this.useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
            this.writeFile = this.delegateMethod('writeFile');
        }
        DelegatingCompilerHost.prototype.delegateMethod = function (name) {
            return this.delegate[name] !== undefined ? this.delegate[name].bind(this.delegate) :
                undefined;
        };
        return DelegatingCompilerHost;
    }());
    exports.DelegatingCompilerHost = DelegatingCompilerHost;
    /**
     * A wrapper around `ts.CompilerHost` (plus any extension methods from `ExtendedTsCompilerHost`).
     *
     * In order for a consumer to include Angular compilation in their TypeScript compiler, the
     * `ts.Program` must be created with a host that adds Angular-specific files (e.g. factories,
     * summaries, the template type-checking file, etc) to the compilation. `NgCompilerHost` is the
     * host implementation which supports this.
     *
     * The interface implementations here ensure that `NgCompilerHost` fully delegates to
     * `ExtendedTsCompilerHost` methods whenever present.
     */
    var NgCompilerHost = /** @class */ (function (_super) {
        tslib_1.__extends(NgCompilerHost, _super);
        function NgCompilerHost(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, factoryTracker, diagnostics) {
            var _this = _super.call(this, delegate) || this;
            _this.shimAdapter = shimAdapter;
            _this.shimTagger = shimTagger;
            _this.factoryTracker = null;
            _this.entryPoint = null;
            _this.factoryTracker = factoryTracker;
            _this.entryPoint = entryPoint;
            _this.constructionDiagnostics = diagnostics;
            _this.inputFiles = tslib_1.__spread(inputFiles, shimAdapter.extraInputFiles);
            _this.rootDirs = rootDirs;
            if (_this.resolveModuleNames === undefined) {
                // In order to reuse the module resolution cache during the creation of the type-check
                // program, we'll need to provide `resolveModuleNames` if the delegate did not provide one.
                _this.resolveModuleNames = _this.createCachedResolveModuleNamesFunction();
            }
            return _this;
        }
        Object.defineProperty(NgCompilerHost.prototype, "ignoreForEmit", {
            /**
             * Retrieves a set of `ts.SourceFile`s which should not be emitted as JS files.
             *
             * Available after this host is used to create a `ts.Program` (which causes all the files in the
             * program to be enumerated).
             */
            get: function () {
                return this.shimAdapter.ignoreForEmit;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NgCompilerHost.prototype, "shimExtensionPrefixes", {
            /**
             * Retrieve the array of shim extension prefixes for which shims were created for each original
             * file.
             */
            get: function () {
                return this.shimAdapter.extensionPrefixes;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Performs cleanup that needs to happen after a `ts.Program` has been created using this host.
         */
        NgCompilerHost.prototype.postProgramCreationCleanup = function () {
            this.shimTagger.finalize();
        };
        /**
         * Create an `NgCompilerHost` from a delegate host, an array of input filenames, and the full set
         * of TypeScript and Angular compiler options.
         */
        NgCompilerHost.wrap = function (delegate, inputFiles, options, oldProgram) {
            var e_1, _a;
            // TODO(alxhub): remove the fallback to allowEmptyCodegenFiles after verifying that the rest of
            // our build tooling is no longer relying on it.
            var allowEmptyCodegenFiles = options.allowEmptyCodegenFiles || false;
            var shouldGenerateFactoryShims = options.generateNgFactoryShims !== undefined ?
                options.generateNgFactoryShims :
                allowEmptyCodegenFiles;
            var shouldGenerateSummaryShims = options.generateNgSummaryShims !== undefined ?
                options.generateNgSummaryShims :
                allowEmptyCodegenFiles;
            var topLevelShimGenerators = [];
            var perFileShimGenerators = [];
            if (shouldGenerateSummaryShims) {
                // Summary generation.
                perFileShimGenerators.push(new shims_1.SummaryGenerator());
            }
            var factoryTracker = null;
            if (shouldGenerateFactoryShims) {
                var factoryGenerator = new shims_1.FactoryGenerator();
                perFileShimGenerators.push(factoryGenerator);
                factoryTracker = factoryGenerator;
            }
            var rootDirs = typescript_1.getRootDirs(delegate, options);
            perFileShimGenerators.push(new typecheck_1.TypeCheckShimGenerator());
            var diagnostics = [];
            var normalizedTsInputFiles = [];
            try {
                for (var inputFiles_1 = tslib_1.__values(inputFiles), inputFiles_1_1 = inputFiles_1.next(); !inputFiles_1_1.done; inputFiles_1_1 = inputFiles_1.next()) {
                    var inputFile = inputFiles_1_1.value;
                    if (!typescript_1.isNonDeclarationTsPath(inputFile)) {
                        continue;
                    }
                    normalizedTsInputFiles.push(file_system_1.resolve(inputFile));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (inputFiles_1_1 && !inputFiles_1_1.done && (_a = inputFiles_1.return)) _a.call(inputFiles_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var entryPoint = null;
            if (options.flatModuleOutFile != null && options.flatModuleOutFile !== '') {
                entryPoint = entry_point_1.findFlatIndexEntryPoint(normalizedTsInputFiles);
                if (entryPoint === null) {
                    // This error message talks specifically about having a single .ts file in "files". However
                    // the actual logic is a bit more permissive. If a single file exists, that will be taken,
                    // otherwise the highest level (shortest path) "index.ts" file will be used as the flat
                    // module entry point instead. If neither of these conditions apply, the error below is
                    // given.
                    //
                    // The user is not informed about the "index.ts" option as this behavior is deprecated -
                    // an explicit entrypoint should always be specified.
                    diagnostics.push({
                        category: ts.DiagnosticCategory.Error,
                        code: diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.CONFIG_FLAT_MODULE_NO_INDEX),
                        file: undefined,
                        start: undefined,
                        length: undefined,
                        messageText: 'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.',
                    });
                }
                else {
                    var flatModuleId = options.flatModuleId || null;
                    var flatModuleOutFile = path_1.normalizeSeparators(options.flatModuleOutFile);
                    var flatIndexGenerator = new entry_point_1.FlatIndexGenerator(entryPoint, flatModuleOutFile, flatModuleId);
                    topLevelShimGenerators.push(flatIndexGenerator);
                }
            }
            var shimAdapter = new shims_1.ShimAdapter(delegate, normalizedTsInputFiles, topLevelShimGenerators, perFileShimGenerators, oldProgram);
            var shimTagger = new shims_1.ShimReferenceTagger(perFileShimGenerators.map(function (gen) { return gen.extensionPrefix; }));
            return new NgCompilerHost(delegate, inputFiles, rootDirs, shimAdapter, shimTagger, entryPoint, factoryTracker, diagnostics);
        };
        /**
         * Check whether the given `ts.SourceFile` is a shim file.
         *
         * If this returns false, the file is user-provided.
         */
        NgCompilerHost.prototype.isShim = function (sf) {
            return shims_1.isShim(sf);
        };
        NgCompilerHost.prototype.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
            // Is this a previously known shim?
            var shimSf = this.shimAdapter.maybeGenerate(file_system_1.resolve(fileName));
            if (shimSf !== null) {
                // Yes, so return it.
                return shimSf;
            }
            // No, so it's a file which might need shims (or a file which doesn't exist).
            var sf = this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
            if (sf === undefined) {
                return undefined;
            }
            this.shimTagger.tag(sf);
            return sf;
        };
        NgCompilerHost.prototype.fileExists = function (fileName) {
            // Consider the file as existing whenever
            //  1) it really does exist in the delegate host, or
            //  2) at least one of the shim generators recognizes it
            // Note that we can pass the file name as branded absolute fs path because TypeScript
            // internally only passes POSIX-like paths.
            //
            // Also note that the `maybeGenerate` check below checks for both `null` and `undefined`.
            return this.delegate.fileExists(fileName) ||
                this.shimAdapter.maybeGenerate(file_system_1.resolve(fileName)) != null;
        };
        Object.defineProperty(NgCompilerHost.prototype, "unifiedModulesHost", {
            get: function () {
                return this.fileNameToModuleName !== undefined ? this : null;
            },
            enumerable: false,
            configurable: true
        });
        NgCompilerHost.prototype.createCachedResolveModuleNamesFunction = function () {
            var _this = this;
            var moduleResolutionCache = ts.createModuleResolutionCache(this.getCurrentDirectory(), this.getCanonicalFileName.bind(this));
            return function (moduleNames, containingFile, reusedNames, redirectedReference, options) {
                return moduleNames.map(function (moduleName) {
                    var module = ts.resolveModuleName(moduleName, containingFile, options, _this, moduleResolutionCache, redirectedReference);
                    return module.resolvedModule;
                });
            };
        };
        return NgCompilerHost;
    }(DelegatingCompilerHost));
    exports.NgCompilerHost = NgCompilerHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvY29yZS9zcmMvaG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDLDJFQUF5RDtJQUN6RCwyRUFBOEU7SUFDOUUsMkVBQTBEO0lBQzFELCtEQUF5RztJQUV6Ryx1RUFBdUQ7SUFDdkQsc0VBQXdEO0lBQ3hELGtGQUFtRztJQUduRyw2RkFBNkY7SUFDN0Ysb0dBQW9HO0lBQ3BHLGtHQUFrRztJQUNsRywrRkFBK0Y7SUFFL0Y7Ozs7OztPQU1HO0lBQ0g7UUFFRSxnQ0FBc0IsUUFBZ0M7WUFBaEMsYUFBUSxHQUFSLFFBQVEsQ0FBd0I7WUFRdEQsa0dBQWtHO1lBQ2xHLFNBQVM7WUFDVCxlQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxvQkFBZSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN6RCx5QkFBb0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbkUseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25FLHlCQUFvQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNuRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDakUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENB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QUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVO29CQUMvQixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQy9CLFVBQVUsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLEtBQUksRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO29CQUMzRixPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQy9CLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUNILHFCQUFDO0lBQUQsQ0FBQyxBQTNNRCxDQUFvQyxzQkFBc0IsR0EyTXpEO0lBM01ZLHdDQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Vycm9yQ29kZSwgbmdFcnJvckNvZGV9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzJztcbmltcG9ydCB7ZmluZEZsYXRJbmRleEVudHJ5UG9pbnQsIEZsYXRJbmRleEdlbmVyYXRvcn0gZnJvbSAnLi4vLi4vZW50cnlfcG9pbnQnO1xuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgcmVzb2x2ZX0gZnJvbSAnLi4vLi4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtGYWN0b3J5R2VuZXJhdG9yLCBpc1NoaW0sIFNoaW1BZGFwdGVyLCBTaGltUmVmZXJlbmNlVGFnZ2VyLCBTdW1tYXJ5R2VuZXJhdG9yfSBmcm9tICcuLi8uLi9zaGltcyc7XG5pbXBvcnQge0ZhY3RvcnlUcmFja2VyLCBQZXJGaWxlU2hpbUdlbmVyYXRvciwgVG9wTGV2ZWxTaGltR2VuZXJhdG9yfSBmcm9tICcuLi8uLi9zaGltcy9hcGknO1xuaW1wb3J0IHtUeXBlQ2hlY2tTaGltR2VuZXJhdG9yfSBmcm9tICcuLi8uLi90eXBlY2hlY2snO1xuaW1wb3J0IHtub3JtYWxpemVTZXBhcmF0b3JzfSBmcm9tICcuLi8uLi91dGlsL3NyYy9wYXRoJztcbmltcG9ydCB7Z2V0Um9vdERpcnMsIGlzTm9uRGVjbGFyYXRpb25Uc1BhdGgsIFJlcXVpcmVkRGVsZWdhdGlvbnN9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtFeHRlbmRlZFRzQ29tcGlsZXJIb3N0LCBOZ0NvbXBpbGVyQWRhcHRlciwgTmdDb21waWxlck9wdGlvbnMsIFVuaWZpZWRNb2R1bGVzSG9zdH0gZnJvbSAnLi4vYXBpJztcblxuLy8gQSBwZXJzaXN0ZW50IHNvdXJjZSBvZiBidWdzIGluIENvbXBpbGVySG9zdCBkZWxlZ2F0aW9uIGhhcyBiZWVuIHRoZSBhZGRpdGlvbiBieSBUUyBvZiBuZXcsXG4vLyBvcHRpb25hbCBtZXRob2RzIG9uIHRzLkNvbXBpbGVySG9zdC4gU2luY2UgdGhlc2UgbWV0aG9kcyBhcmUgb3B0aW9uYWwsIGl0J3Mgbm90IGEgdHlwZSBlcnJvciB0aGF0XG4vLyB0aGUgZGVsZWdhdGluZyBob3N0IGRvZXNuJ3QgaW1wbGVtZW50IG9yIGRlbGVnYXRlIHRoZW0uIFRoaXMgY2F1c2VzIHN1YnRsZSBydW50aW1lIGZhaWx1cmVzLiBOb1xuLy8gbW9yZS4gVGhpcyBpbmZyYXN0cnVjdHVyZSBlbnN1cmVzIHRoYXQgZmFpbGluZyB0byBkZWxlZ2F0ZSBhIG1ldGhvZCBpcyBhIGNvbXBpbGUtdGltZSBlcnJvci5cblxuLyoqXG4gKiBEZWxlZ2F0ZXMgYWxsIG1ldGhvZHMgb2YgYEV4dGVuZGVkVHNDb21waWxlckhvc3RgIHRvIGEgZGVsZWdhdGUsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZlxuICogYGdldFNvdXJjZUZpbGVgIGFuZCBgZmlsZUV4aXN0c2Agd2hpY2ggYXJlIGltcGxlbWVudGVkIGluIGBOZ0NvbXBpbGVySG9zdGAuXG4gKlxuICogSWYgYSBuZXcgbWV0aG9kIGlzIGFkZGVkIHRvIGB0cy5Db21waWxlckhvc3RgIHdoaWNoIGlzIG5vdCBkZWxlZ2F0ZWQsIGEgdHlwZSBlcnJvciB3aWxsIGJlXG4gKiBnZW5lcmF0ZWQgZm9yIHRoaXMgY2xhc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBEZWxlZ2F0aW5nQ29tcGlsZXJIb3N0IGltcGxlbWVudHNcbiAgICBPbWl0PFJlcXVpcmVkRGVsZWdhdGlvbnM8RXh0ZW5kZWRUc0NvbXBpbGVySG9zdD4sICdnZXRTb3VyY2VGaWxlJ3wnZmlsZUV4aXN0cyc+IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGRlbGVnYXRlOiBFeHRlbmRlZFRzQ29tcGlsZXJIb3N0KSB7fVxuXG4gIHByaXZhdGUgZGVsZWdhdGVNZXRob2Q8TSBleHRlbmRzIGtleW9mIEV4dGVuZGVkVHNDb21waWxlckhvc3Q+KG5hbWU6IE0pOlxuICAgICAgRXh0ZW5kZWRUc0NvbXBpbGVySG9zdFtNXSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGVbbmFtZV0gIT09IHVuZGVmaW5lZCA/ICh0aGlzLmRlbGVnYXRlW25hbWVdIGFzIGFueSkuYmluZCh0aGlzLmRlbGVnYXRlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIEV4Y2x1ZGVkIGFyZSAnZ2V0U291cmNlRmlsZScgYW5kICdmaWxlRXhpc3RzJywgd2hpY2ggYXJlIGFjdHVhbGx5IGltcGxlbWVudGVkIGJ5IE5nQ29tcGlsZXJIb3N0XG4gIC8vIGJlbG93LlxuICBjcmVhdGVIYXNoID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnY3JlYXRlSGFzaCcpO1xuICBkaXJlY3RvcnlFeGlzdHMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdkaXJlY3RvcnlFeGlzdHMnKTtcbiAgZmlsZU5hbWVUb01vZHVsZU5hbWUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdmaWxlTmFtZVRvTW9kdWxlTmFtZScpO1xuICBnZXRDYW5jZWxsYXRpb25Ub2tlbiA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldENhbmNlbGxhdGlvblRva2VuJyk7XG4gIGdldENhbm9uaWNhbEZpbGVOYW1lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0Q2Fub25pY2FsRmlsZU5hbWUnKTtcbiAgZ2V0Q3VycmVudERpcmVjdG9yeSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldEN1cnJlbnREaXJlY3RvcnknKTtcbiAgZ2V0RGVmYXVsdExpYkZpbGVOYW1lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0RGVmYXVsdExpYkZpbGVOYW1lJyk7XG4gIGdldERlZmF1bHRMaWJMb2NhdGlvbiA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldERlZmF1bHRMaWJMb2NhdGlvbicpO1xuICBnZXREaXJlY3RvcmllcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldERpcmVjdG9yaWVzJyk7XG4gIGdldEVudmlyb25tZW50VmFyaWFibGUgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRFbnZpcm9ubWVudFZhcmlhYmxlJyk7XG4gIGdldE1vZGlmaWVkUmVzb3VyY2VGaWxlcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldE1vZGlmaWVkUmVzb3VyY2VGaWxlcycpO1xuICBnZXROZXdMaW5lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0TmV3TGluZScpO1xuICBnZXRQYXJzZWRDb21tYW5kTGluZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldFBhcnNlZENvbW1hbmRMaW5lJyk7XG4gIGdldFNvdXJjZUZpbGVCeVBhdGggPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRTb3VyY2VGaWxlQnlQYXRoJyk7XG4gIHJlYWREaXJlY3RvcnkgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFkRGlyZWN0b3J5Jyk7XG4gIHJlYWRGaWxlID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVhZEZpbGUnKTtcbiAgcmVhZFJlc291cmNlID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVhZFJlc291cmNlJyk7XG4gIHJlYWxwYXRoID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVhbHBhdGgnKTtcbiAgcmVzb2x2ZU1vZHVsZU5hbWVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVzb2x2ZU1vZHVsZU5hbWVzJyk7XG4gIHJlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3Jlc29sdmVUeXBlUmVmZXJlbmNlRGlyZWN0aXZlcycpO1xuICByZXNvdXJjZU5hbWVUb0ZpbGVOYW1lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVzb3VyY2VOYW1lVG9GaWxlTmFtZScpO1xuICB0cmFjZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3RyYWNlJyk7XG4gIHVzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCd1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzJyk7XG4gIHdyaXRlRmlsZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3dyaXRlRmlsZScpO1xufVxuXG4vKipcbiAqIEEgd3JhcHBlciBhcm91bmQgYHRzLkNvbXBpbGVySG9zdGAgKHBsdXMgYW55IGV4dGVuc2lvbiBtZXRob2RzIGZyb20gYEV4dGVuZGVkVHNDb21waWxlckhvc3RgKS5cbiAqXG4gKiBJbiBvcmRlciBmb3IgYSBjb25zdW1lciB0byBpbmNsdWRlIEFuZ3VsYXIgY29tcGlsYXRpb24gaW4gdGhlaXIgVHlwZVNjcmlwdCBjb21waWxlciwgdGhlXG4gKiBgdHMuUHJvZ3JhbWAgbXVzdCBiZSBjcmVhdGVkIHdpdGggYSBob3N0IHRoYXQgYWRkcyBBbmd1bGFyLXNwZWNpZmljIGZpbGVzIChlLmcuIGZhY3RvcmllcyxcbiAqIHN1bW1hcmllcywgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgZmlsZSwgZXRjKSB0byB0aGUgY29tcGlsYXRpb24uIGBOZ0NvbXBpbGVySG9zdGAgaXMgdGhlXG4gKiBob3N0IGltcGxlbWVudGF0aW9uIHdoaWNoIHN1cHBvcnRzIHRoaXMuXG4gKlxuICogVGhlIGludGVyZmFjZSBpbXBsZW1lbnRhdGlvbnMgaGVyZSBlbnN1cmUgdGhhdCBgTmdDb21waWxlckhvc3RgIGZ1bGx5IGRlbGVnYXRlcyB0b1xuICogYEV4dGVuZGVkVHNDb21waWxlckhvc3RgIG1ldGhvZHMgd2hlbmV2ZXIgcHJlc2VudC5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nQ29tcGlsZXJIb3N0IGV4dGVuZHMgRGVsZWdhdGluZ0NvbXBpbGVySG9zdCBpbXBsZW1lbnRzXG4gICAgUmVxdWlyZWREZWxlZ2F0aW9uczxFeHRlbmRlZFRzQ29tcGlsZXJIb3N0PiwgRXh0ZW5kZWRUc0NvbXBpbGVySG9zdCwgTmdDb21waWxlckFkYXB0ZXIge1xuICByZWFkb25seSBmYWN0b3J5VHJhY2tlcjogRmFjdG9yeVRyYWNrZXJ8bnVsbCA9IG51bGw7XG4gIHJlYWRvbmx5IGVudHJ5UG9pbnQ6IEFic29sdXRlRnNQYXRofG51bGwgPSBudWxsO1xuICByZWFkb25seSBjb25zdHJ1Y3Rpb25EaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdO1xuXG4gIHJlYWRvbmx5IGlucHV0RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbiAgcmVhZG9ubHkgcm9vdERpcnM6IFJlYWRvbmx5QXJyYXk8QWJzb2x1dGVGc1BhdGg+O1xuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBkZWxlZ2F0ZTogRXh0ZW5kZWRUc0NvbXBpbGVySG9zdCwgaW5wdXRGaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuICAgICAgcm9vdERpcnM6IFJlYWRvbmx5QXJyYXk8QWJzb2x1dGVGc1BhdGg+LCBwcml2YXRlIHNoaW1BZGFwdGVyOiBTaGltQWRhcHRlcixcbiAgICAgIHByaXZhdGUgc2hpbVRhZ2dlcjogU2hpbVJlZmVyZW5jZVRhZ2dlciwgZW50cnlQb2ludDogQWJzb2x1dGVGc1BhdGh8bnVsbCxcbiAgICAgIGZhY3RvcnlUcmFja2VyOiBGYWN0b3J5VHJhY2tlcnxudWxsLCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdKSB7XG4gICAgc3VwZXIoZGVsZWdhdGUpO1xuXG4gICAgdGhpcy5mYWN0b3J5VHJhY2tlciA9IGZhY3RvcnlUcmFja2VyO1xuICAgIHRoaXMuZW50cnlQb2ludCA9IGVudHJ5UG9pbnQ7XG4gICAgdGhpcy5jb25zdHJ1Y3Rpb25EaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzO1xuICAgIHRoaXMuaW5wdXRGaWxlcyA9IFsuLi5pbnB1dEZpbGVzLCAuLi5zaGltQWRhcHRlci5leHRyYUlucHV0RmlsZXNdO1xuICAgIHRoaXMucm9vdERpcnMgPSByb290RGlycztcblxuICAgIGlmICh0aGlzLnJlc29sdmVNb2R1bGVOYW1lcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBJbiBvcmRlciB0byByZXVzZSB0aGUgbW9kdWxlIHJlc29sdXRpb24gY2FjaGUgZHVyaW5nIHRoZSBjcmVhdGlvbiBvZiB0aGUgdHlwZS1jaGVja1xuICAgICAgLy8gcHJvZ3JhbSwgd2UnbGwgbmVlZCB0byBwcm92aWRlIGByZXNvbHZlTW9kdWxlTmFtZXNgIGlmIHRoZSBkZWxlZ2F0ZSBkaWQgbm90IHByb3ZpZGUgb25lLlxuICAgICAgdGhpcy5yZXNvbHZlTW9kdWxlTmFtZXMgPSB0aGlzLmNyZWF0ZUNhY2hlZFJlc29sdmVNb2R1bGVOYW1lc0Z1bmN0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhIHNldCBvZiBgdHMuU291cmNlRmlsZWBzIHdoaWNoIHNob3VsZCBub3QgYmUgZW1pdHRlZCBhcyBKUyBmaWxlcy5cbiAgICpcbiAgICogQXZhaWxhYmxlIGFmdGVyIHRoaXMgaG9zdCBpcyB1c2VkIHRvIGNyZWF0ZSBhIGB0cy5Qcm9ncmFtYCAod2hpY2ggY2F1c2VzIGFsbCB0aGUgZmlsZXMgaW4gdGhlXG4gICAqIHByb2dyYW0gdG8gYmUgZW51bWVyYXRlZCkuXG4gICAqL1xuICBnZXQgaWdub3JlRm9yRW1pdCgpOiBTZXQ8dHMuU291cmNlRmlsZT4ge1xuICAgIHJldHVybiB0aGlzLnNoaW1BZGFwdGVyLmlnbm9yZUZvckVtaXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIGFycmF5IG9mIHNoaW0gZXh0ZW5zaW9uIHByZWZpeGVzIGZvciB3aGljaCBzaGltcyB3ZXJlIGNyZWF0ZWQgZm9yIGVhY2ggb3JpZ2luYWxcbiAgICogZmlsZS5cbiAgICovXG4gIGdldCBzaGltRXh0ZW5zaW9uUHJlZml4ZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnNoaW1BZGFwdGVyLmV4dGVuc2lvblByZWZpeGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNsZWFudXAgdGhhdCBuZWVkcyB0byBoYXBwZW4gYWZ0ZXIgYSBgdHMuUHJvZ3JhbWAgaGFzIGJlZW4gY3JlYXRlZCB1c2luZyB0aGlzIGhvc3QuXG4gICAqL1xuICBwb3N0UHJvZ3JhbUNyZWF0aW9uQ2xlYW51cCgpOiB2b2lkIHtcbiAgICB0aGlzLnNoaW1UYWdnZXIuZmluYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gYE5nQ29tcGlsZXJIb3N0YCBmcm9tIGEgZGVsZWdhdGUgaG9zdCwgYW4gYXJyYXkgb2YgaW5wdXQgZmlsZW5hbWVzLCBhbmQgdGhlIGZ1bGwgc2V0XG4gICAqIG9mIFR5cGVTY3JpcHQgYW5kIEFuZ3VsYXIgY29tcGlsZXIgb3B0aW9ucy5cbiAgICovXG4gIHN0YXRpYyB3cmFwKFxuICAgICAgZGVsZWdhdGU6IHRzLkNvbXBpbGVySG9zdCwgaW5wdXRGaWxlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucyxcbiAgICAgIG9sZFByb2dyYW06IHRzLlByb2dyYW18bnVsbCk6IE5nQ29tcGlsZXJIb3N0IHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IHJlbW92ZSB0aGUgZmFsbGJhY2sgdG8gYWxsb3dFbXB0eUNvZGVnZW5GaWxlcyBhZnRlciB2ZXJpZnlpbmcgdGhhdCB0aGUgcmVzdCBvZlxuICAgIC8vIG91ciBidWlsZCB0b29saW5nIGlzIG5vIGxvbmdlciByZWx5aW5nIG9uIGl0LlxuICAgIGNvbnN0IGFsbG93RW1wdHlDb2RlZ2VuRmlsZXMgPSBvcHRpb25zLmFsbG93RW1wdHlDb2RlZ2VuRmlsZXMgfHwgZmFsc2U7XG4gICAgY29uc3Qgc2hvdWxkR2VuZXJhdGVGYWN0b3J5U2hpbXMgPSBvcHRpb25zLmdlbmVyYXRlTmdGYWN0b3J5U2hpbXMgIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIG9wdGlvbnMuZ2VuZXJhdGVOZ0ZhY3RvcnlTaGltcyA6XG4gICAgICAgIGFsbG93RW1wdHlDb2RlZ2VuRmlsZXM7XG5cbiAgICBjb25zdCBzaG91bGRHZW5lcmF0ZVN1bW1hcnlTaGltcyA9IG9wdGlvbnMuZ2VuZXJhdGVOZ1N1bW1hcnlTaGltcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgb3B0aW9ucy5nZW5lcmF0ZU5nU3VtbWFyeVNoaW1zIDpcbiAgICAgICAgYWxsb3dFbXB0eUNvZGVnZW5GaWxlcztcblxuXG4gICAgY29uc3QgdG9wTGV2ZWxTaGltR2VuZXJhdG9yczogVG9wTGV2ZWxTaGltR2VuZXJhdG9yW10gPSBbXTtcbiAgICBjb25zdCBwZXJGaWxlU2hpbUdlbmVyYXRvcnM6IFBlckZpbGVTaGltR2VuZXJhdG9yW10gPSBbXTtcblxuICAgIGlmIChzaG91bGRHZW5lcmF0ZVN1bW1hcnlTaGltcykge1xuICAgICAgLy8gU3VtbWFyeSBnZW5lcmF0aW9uLlxuICAgICAgcGVyRmlsZVNoaW1HZW5lcmF0b3JzLnB1c2gobmV3IFN1bW1hcnlHZW5lcmF0b3IoKSk7XG4gICAgfVxuXG4gICAgbGV0IGZhY3RvcnlUcmFja2VyOiBGYWN0b3J5VHJhY2tlcnxudWxsID0gbnVsbDtcbiAgICBpZiAoc2hvdWxkR2VuZXJhdGVGYWN0b3J5U2hpbXMpIHtcbiAgICAgIGNvbnN0IGZhY3RvcnlHZW5lcmF0b3IgPSBuZXcgRmFjdG9yeUdlbmVyYXRvcigpO1xuICAgICAgcGVyRmlsZVNoaW1HZW5lcmF0b3JzLnB1c2goZmFjdG9yeUdlbmVyYXRvcik7XG5cbiAgICAgIGZhY3RvcnlUcmFja2VyID0gZmFjdG9yeUdlbmVyYXRvcjtcbiAgICB9XG5cbiAgICBjb25zdCByb290RGlycyA9IGdldFJvb3REaXJzKGRlbGVnYXRlLCBvcHRpb25zIGFzIHRzLkNvbXBpbGVyT3B0aW9ucyk7XG5cbiAgICBwZXJGaWxlU2hpbUdlbmVyYXRvcnMucHVzaChuZXcgVHlwZUNoZWNrU2hpbUdlbmVyYXRvcigpKTtcblxuICAgIGxldCBkaWFnbm9zdGljczogdHMuRGlhZ25vc3RpY1tdID0gW107XG5cbiAgICBjb25zdCBub3JtYWxpemVkVHNJbnB1dEZpbGVzOiBBYnNvbHV0ZUZzUGF0aFtdID0gW107XG4gICAgZm9yIChjb25zdCBpbnB1dEZpbGUgb2YgaW5wdXRGaWxlcykge1xuICAgICAgaWYgKCFpc05vbkRlY2xhcmF0aW9uVHNQYXRoKGlucHV0RmlsZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBub3JtYWxpemVkVHNJbnB1dEZpbGVzLnB1c2gocmVzb2x2ZShpbnB1dEZpbGUpKTtcbiAgICB9XG5cbiAgICBsZXQgZW50cnlQb2ludDogQWJzb2x1dGVGc1BhdGh8bnVsbCA9IG51bGw7XG4gICAgaWYgKG9wdGlvbnMuZmxhdE1vZHVsZU91dEZpbGUgIT0gbnVsbCAmJiBvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlICE9PSAnJykge1xuICAgICAgZW50cnlQb2ludCA9IGZpbmRGbGF0SW5kZXhFbnRyeVBvaW50KG5vcm1hbGl6ZWRUc0lucHV0RmlsZXMpO1xuICAgICAgaWYgKGVudHJ5UG9pbnQgPT09IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBlcnJvciBtZXNzYWdlIHRhbGtzIHNwZWNpZmljYWxseSBhYm91dCBoYXZpbmcgYSBzaW5nbGUgLnRzIGZpbGUgaW4gXCJmaWxlc1wiLiBIb3dldmVyXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgbG9naWMgaXMgYSBiaXQgbW9yZSBwZXJtaXNzaXZlLiBJZiBhIHNpbmdsZSBmaWxlIGV4aXN0cywgdGhhdCB3aWxsIGJlIHRha2VuLFxuICAgICAgICAvLyBvdGhlcndpc2UgdGhlIGhpZ2hlc3QgbGV2ZWwgKHNob3J0ZXN0IHBhdGgpIFwiaW5kZXgudHNcIiBmaWxlIHdpbGwgYmUgdXNlZCBhcyB0aGUgZmxhdFxuICAgICAgICAvLyBtb2R1bGUgZW50cnkgcG9pbnQgaW5zdGVhZC4gSWYgbmVpdGhlciBvZiB0aGVzZSBjb25kaXRpb25zIGFwcGx5LCB0aGUgZXJyb3IgYmVsb3cgaXNcbiAgICAgICAgLy8gZ2l2ZW4uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZSB1c2VyIGlzIG5vdCBpbmZvcm1lZCBhYm91dCB0aGUgXCJpbmRleC50c1wiIG9wdGlvbiBhcyB0aGlzIGJlaGF2aW9yIGlzIGRlcHJlY2F0ZWQgLVxuICAgICAgICAvLyBhbiBleHBsaWNpdCBlbnRyeXBvaW50IHNob3VsZCBhbHdheXMgYmUgc3BlY2lmaWVkLlxuICAgICAgICBkaWFnbm9zdGljcy5wdXNoKHtcbiAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgIGNvZGU6IG5nRXJyb3JDb2RlKEVycm9yQ29kZS5DT05GSUdfRkxBVF9NT0RVTEVfTk9fSU5ERVgpLFxuICAgICAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICBzdGFydDogdW5kZWZpbmVkLFxuICAgICAgICAgIGxlbmd0aDogdW5kZWZpbmVkLFxuICAgICAgICAgIG1lc3NhZ2VUZXh0OlxuICAgICAgICAgICAgICAnQW5ndWxhciBjb21waWxlciBvcHRpb24gXCJmbGF0TW9kdWxlT3V0RmlsZVwiIHJlcXVpcmVzIG9uZSBhbmQgb25seSBvbmUgLnRzIGZpbGUgaW4gdGhlIFwiZmlsZXNcIiBmaWVsZC4nLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZsYXRNb2R1bGVJZCA9IG9wdGlvbnMuZmxhdE1vZHVsZUlkIHx8IG51bGw7XG4gICAgICAgIGNvbnN0IGZsYXRNb2R1bGVPdXRGaWxlID0gbm9ybWFsaXplU2VwYXJhdG9ycyhvcHRpb25zLmZsYXRNb2R1bGVPdXRGaWxlKTtcbiAgICAgICAgY29uc3QgZmxhdEluZGV4R2VuZXJhdG9yID1cbiAgICAgICAgICAgIG5ldyBGbGF0SW5kZXhHZW5lcmF0b3IoZW50cnlQb2ludCwgZmxhdE1vZHVsZU91dEZpbGUsIGZsYXRNb2R1bGVJZCk7XG4gICAgICAgIHRvcExldmVsU2hpbUdlbmVyYXRvcnMucHVzaChmbGF0SW5kZXhHZW5lcmF0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNoaW1BZGFwdGVyID0gbmV3IFNoaW1BZGFwdGVyKFxuICAgICAgICBkZWxlZ2F0ZSwgbm9ybWFsaXplZFRzSW5wdXRGaWxlcywgdG9wTGV2ZWxTaGltR2VuZXJhdG9ycywgcGVyRmlsZVNoaW1HZW5lcmF0b3JzLFxuICAgICAgICBvbGRQcm9ncmFtKTtcbiAgICBjb25zdCBzaGltVGFnZ2VyID1cbiAgICAgICAgbmV3IFNoaW1SZWZlcmVuY2VUYWdnZXIocGVyRmlsZVNoaW1HZW5lcmF0b3JzLm1hcChnZW4gPT4gZ2VuLmV4dGVuc2lvblByZWZpeCkpO1xuICAgIHJldHVybiBuZXcgTmdDb21waWxlckhvc3QoXG4gICAgICAgIGRlbGVnYXRlLCBpbnB1dEZpbGVzLCByb290RGlycywgc2hpbUFkYXB0ZXIsIHNoaW1UYWdnZXIsIGVudHJ5UG9pbnQsIGZhY3RvcnlUcmFja2VyLFxuICAgICAgICBkaWFnbm9zdGljcyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gYHRzLlNvdXJjZUZpbGVgIGlzIGEgc2hpbSBmaWxlLlxuICAgKlxuICAgKiBJZiB0aGlzIHJldHVybnMgZmFsc2UsIHRoZSBmaWxlIGlzIHVzZXItcHJvdmlkZWQuXG4gICAqL1xuICBpc1NoaW0oc2Y6IHRzLlNvdXJjZUZpbGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gaXNTaGltKHNmKTtcbiAgfVxuXG4gIGdldFNvdXJjZUZpbGUoXG4gICAgICBmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCxcbiAgICAgIG9uRXJyb3I/OiAoKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZCl8dW5kZWZpbmVkLFxuICAgICAgc2hvdWxkQ3JlYXRlTmV3U291cmNlRmlsZT86IGJvb2xlYW58dW5kZWZpbmVkKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIC8vIElzIHRoaXMgYSBwcmV2aW91c2x5IGtub3duIHNoaW0/XG4gICAgY29uc3Qgc2hpbVNmID0gdGhpcy5zaGltQWRhcHRlci5tYXliZUdlbmVyYXRlKHJlc29sdmUoZmlsZU5hbWUpKTtcbiAgICBpZiAoc2hpbVNmICE9PSBudWxsKSB7XG4gICAgICAvLyBZZXMsIHNvIHJldHVybiBpdC5cbiAgICAgIHJldHVybiBzaGltU2Y7XG4gICAgfVxuXG4gICAgLy8gTm8sIHNvIGl0J3MgYSBmaWxlIHdoaWNoIG1pZ2h0IG5lZWQgc2hpbXMgKG9yIGEgZmlsZSB3aGljaCBkb2Vzbid0IGV4aXN0KS5cbiAgICBjb25zdCBzZiA9XG4gICAgICAgIHRoaXMuZGVsZWdhdGUuZ2V0U291cmNlRmlsZShmaWxlTmFtZSwgbGFuZ3VhZ2VWZXJzaW9uLCBvbkVycm9yLCBzaG91bGRDcmVhdGVOZXdTb3VyY2VGaWxlKTtcbiAgICBpZiAoc2YgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB0aGlzLnNoaW1UYWdnZXIudGFnKHNmKTtcbiAgICByZXR1cm4gc2Y7XG4gIH1cblxuICBmaWxlRXhpc3RzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBDb25zaWRlciB0aGUgZmlsZSBhcyBleGlzdGluZyB3aGVuZXZlclxuICAgIC8vICAxKSBpdCByZWFsbHkgZG9lcyBleGlzdCBpbiB0aGUgZGVsZWdhdGUgaG9zdCwgb3JcbiAgICAvLyAgMikgYXQgbGVhc3Qgb25lIG9mIHRoZSBzaGltIGdlbmVyYXRvcnMgcmVjb2duaXplcyBpdFxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjYW4gcGFzcyB0aGUgZmlsZSBuYW1lIGFzIGJyYW5kZWQgYWJzb2x1dGUgZnMgcGF0aCBiZWNhdXNlIFR5cGVTY3JpcHRcbiAgICAvLyBpbnRlcm5hbGx5IG9ubHkgcGFzc2VzIFBPU0lYLWxpa2UgcGF0aHMuXG4gICAgLy9cbiAgICAvLyBBbHNvIG5vdGUgdGhhdCB0aGUgYG1heWJlR2VuZXJhdGVgIGNoZWNrIGJlbG93IGNoZWNrcyBmb3IgYm90aCBgbnVsbGAgYW5kIGB1bmRlZmluZWRgLlxuICAgIHJldHVybiB0aGlzLmRlbGVnYXRlLmZpbGVFeGlzdHMoZmlsZU5hbWUpIHx8XG4gICAgICAgIHRoaXMuc2hpbUFkYXB0ZXIubWF5YmVHZW5lcmF0ZShyZXNvbHZlKGZpbGVOYW1lKSkgIT0gbnVsbDtcbiAgfVxuXG4gIGdldCB1bmlmaWVkTW9kdWxlc0hvc3QoKTogVW5pZmllZE1vZHVsZXNIb3N0fG51bGwge1xuICAgIHJldHVybiB0aGlzLmZpbGVOYW1lVG9Nb2R1bGVOYW1lICE9PSB1bmRlZmluZWQgPyB0aGlzIGFzIFVuaWZpZWRNb2R1bGVzSG9zdCA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNhY2hlZFJlc29sdmVNb2R1bGVOYW1lc0Z1bmN0aW9uKCk6IHRzLkNvbXBpbGVySG9zdFsncmVzb2x2ZU1vZHVsZU5hbWVzJ10ge1xuICAgIGNvbnN0IG1vZHVsZVJlc29sdXRpb25DYWNoZSA9IHRzLmNyZWF0ZU1vZHVsZVJlc29sdXRpb25DYWNoZShcbiAgICAgICAgdGhpcy5nZXRDdXJyZW50RGlyZWN0b3J5KCksIHRoaXMuZ2V0Q2Fub25pY2FsRmlsZU5hbWUuYmluZCh0aGlzKSk7XG5cbiAgICByZXR1cm4gKG1vZHVsZU5hbWVzLCBjb250YWluaW5nRmlsZSwgcmV1c2VkTmFtZXMsIHJlZGlyZWN0ZWRSZWZlcmVuY2UsIG9wdGlvbnMpID0+IHtcbiAgICAgIHJldHVybiBtb2R1bGVOYW1lcy5tYXAobW9kdWxlTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZHVsZSA9IHRzLnJlc29sdmVNb2R1bGVOYW1lKFxuICAgICAgICAgICAgbW9kdWxlTmFtZSwgY29udGFpbmluZ0ZpbGUsIG9wdGlvbnMsIHRoaXMsIG1vZHVsZVJlc29sdXRpb25DYWNoZSwgcmVkaXJlY3RlZFJlZmVyZW5jZSk7XG4gICAgICAgIHJldHVybiBtb2R1bGUucmVzb2x2ZWRNb2R1bGU7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG59XG4iXX0=