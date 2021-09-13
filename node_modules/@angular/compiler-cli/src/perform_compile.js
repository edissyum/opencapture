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
        define("@angular/compiler-cli/src/perform_compile", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/transformers/api", "@angular/compiler-cli/src/transformers/entry_points", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultGatherDiagnostics = exports.performCompilation = exports.exitCodeFromResult = exports.readConfiguration = exports.calcProjectFileAndBasePath = exports.formatDiagnostics = exports.formatDiagnostic = exports.flattenDiagnosticMessageChain = exports.formatDiagnosticPosition = exports.filterErrorsAndWarnings = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var api = require("@angular/compiler-cli/src/transformers/api");
    var ng = require("@angular/compiler-cli/src/transformers/entry_points");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    function filterErrorsAndWarnings(diagnostics) {
        return diagnostics.filter(function (d) { return d.category !== ts.DiagnosticCategory.Message; });
    }
    exports.filterErrorsAndWarnings = filterErrorsAndWarnings;
    var defaultFormatHost = {
        getCurrentDirectory: function () { return ts.sys.getCurrentDirectory(); },
        getCanonicalFileName: function (fileName) { return fileName; },
        getNewLine: function () { return ts.sys.newLine; }
    };
    function displayFileName(fileName, host) {
        return file_system_1.relative(file_system_1.resolve(host.getCurrentDirectory()), file_system_1.resolve(host.getCanonicalFileName(fileName)));
    }
    function formatDiagnosticPosition(position, host) {
        if (host === void 0) { host = defaultFormatHost; }
        return displayFileName(position.fileName, host) + "(" + (position.line + 1) + "," + (position.column + 1) + ")";
    }
    exports.formatDiagnosticPosition = formatDiagnosticPosition;
    function flattenDiagnosticMessageChain(chain, host, indent) {
        var e_1, _a;
        if (host === void 0) { host = defaultFormatHost; }
        if (indent === void 0) { indent = 0; }
        var newLine = host.getNewLine();
        var result = '';
        if (indent) {
            result += newLine;
            for (var i = 0; i < indent; i++) {
                result += '  ';
            }
        }
        result += chain.messageText;
        var position = chain.position;
        // add position if available, and we are not at the depest frame
        if (position && indent !== 0) {
            result += " at " + formatDiagnosticPosition(position, host);
        }
        indent++;
        if (chain.next) {
            try {
                for (var _b = tslib_1.__values(chain.next), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var kid = _c.value;
                    result += flattenDiagnosticMessageChain(kid, host, indent);
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
        return result;
    }
    exports.flattenDiagnosticMessageChain = flattenDiagnosticMessageChain;
    function formatDiagnostic(diagnostic, host) {
        if (host === void 0) { host = defaultFormatHost; }
        var result = '';
        var newLine = host.getNewLine();
        var span = diagnostic.span;
        if (span) {
            result += formatDiagnosticPosition({ fileName: span.start.file.url, line: span.start.line, column: span.start.col }, host) + ": ";
        }
        else if (diagnostic.position) {
            result += formatDiagnosticPosition(diagnostic.position, host) + ": ";
        }
        if (diagnostic.span && diagnostic.span.details) {
            result += diagnostic.span.details + ", " + diagnostic.messageText + newLine;
        }
        else if (diagnostic.chain) {
            result += flattenDiagnosticMessageChain(diagnostic.chain, host) + "." + newLine;
        }
        else {
            result += "" + diagnostic.messageText + newLine;
        }
        return result;
    }
    exports.formatDiagnostic = formatDiagnostic;
    function formatDiagnostics(diags, host) {
        if (host === void 0) { host = defaultFormatHost; }
        if (diags && diags.length) {
            return diags
                .map(function (diagnostic) {
                if (api.isTsDiagnostic(diagnostic)) {
                    return diagnostics_1.replaceTsWithNgInErrors(ts.formatDiagnosticsWithColorAndContext([diagnostic], host));
                }
                else {
                    return formatDiagnostic(diagnostic, host);
                }
            })
                .join('');
        }
        else {
            return '';
        }
    }
    exports.formatDiagnostics = formatDiagnostics;
    function calcProjectFileAndBasePath(project, host) {
        if (host === void 0) { host = file_system_1.getFileSystem(); }
        var absProject = host.resolve(project);
        var projectIsDir = host.lstat(absProject).isDirectory();
        var projectFile = projectIsDir ? host.join(absProject, 'tsconfig.json') : absProject;
        var projectDir = projectIsDir ? absProject : host.dirname(absProject);
        var basePath = host.resolve(projectDir);
        return { projectFile: projectFile, basePath: basePath };
    }
    exports.calcProjectFileAndBasePath = calcProjectFileAndBasePath;
    function readConfiguration(project, existingOptions, host) {
        var _a;
        if (host === void 0) { host = file_system_1.getFileSystem(); }
        try {
            var fs_1 = file_system_1.getFileSystem();
            var readConfigFile_1 = function (configFile) {
                return ts.readConfigFile(configFile, function (file) { return host.readFile(host.resolve(file)); });
            };
            var readAngularCompilerOptions_1 = function (configFile, parentOptions) {
                if (parentOptions === void 0) { parentOptions = {}; }
                var _a = readConfigFile_1(configFile), config = _a.config, error = _a.error;
                if (error) {
                    // Errors are handled later on by 'parseJsonConfigFileContent'
                    return parentOptions;
                }
                // we are only interested into merging 'angularCompilerOptions' as
                // other options like 'compilerOptions' are merged by TS
                var existingNgCompilerOptions = tslib_1.__assign(tslib_1.__assign({}, config.angularCompilerOptions), parentOptions);
                if (config.extends && typeof config.extends === 'string') {
                    var extendedConfigPath = getExtendedConfigPath(configFile, config.extends, host, fs_1);
                    if (extendedConfigPath !== null) {
                        // Call readAngularCompilerOptions recursively to merge NG Compiler options
                        return readAngularCompilerOptions_1(extendedConfigPath, existingNgCompilerOptions);
                    }
                }
                return existingNgCompilerOptions;
            };
            var _b = calcProjectFileAndBasePath(project, host), projectFile = _b.projectFile, basePath = _b.basePath;
            var configFileName = host.resolve(host.pwd(), projectFile);
            var _c = readConfigFile_1(projectFile), config = _c.config, error = _c.error;
            if (error) {
                return {
                    project: project,
                    errors: [error],
                    rootNames: [],
                    options: {},
                    emitFlags: api.EmitFlags.Default
                };
            }
            var existingCompilerOptions = tslib_1.__assign(tslib_1.__assign({ genDir: basePath, basePath: basePath }, readAngularCompilerOptions_1(configFileName)), existingOptions);
            var parseConfigHost = createParseConfigHost(host, fs_1);
            var _d = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath, existingCompilerOptions, configFileName), options = _d.options, errors = _d.errors, rootNames = _d.fileNames, projectReferences = _d.projectReferences;
            // Coerce to boolean as `enableIvy` can be `ngtsc|true|false|undefined` here.
            options.enableIvy = !!((_a = options.enableIvy) !== null && _a !== void 0 ? _a : true);
            var emitFlags = api.EmitFlags.Default;
            if (!(options.skipMetadataEmit || options.flatModuleOutFile)) {
                emitFlags |= api.EmitFlags.Metadata;
            }
            if (options.skipTemplateCodegen) {
                emitFlags = emitFlags & ~api.EmitFlags.Codegen;
            }
            return { project: projectFile, rootNames: rootNames, projectReferences: projectReferences, options: options, errors: errors, emitFlags: emitFlags };
        }
        catch (e) {
            var errors = [{
                    category: ts.DiagnosticCategory.Error,
                    messageText: e.stack,
                    file: undefined,
                    start: undefined,
                    length: undefined,
                    source: 'angular',
                    code: api.UNKNOWN_ERROR_CODE,
                }];
            return { project: '', errors: errors, rootNames: [], options: {}, emitFlags: api.EmitFlags.Default };
        }
    }
    exports.readConfiguration = readConfiguration;
    function createParseConfigHost(host, fs) {
        if (fs === void 0) { fs = file_system_1.getFileSystem(); }
        return {
            fileExists: host.exists.bind(host),
            readDirectory: ts.sys.readDirectory,
            readFile: host.readFile.bind(host),
            useCaseSensitiveFileNames: fs.isCaseSensitive(),
        };
    }
    function getExtendedConfigPath(configFile, extendsValue, host, fs) {
        var result = getExtendedConfigPathWorker(configFile, extendsValue, host, fs);
        if (result !== null) {
            return result;
        }
        // Try to resolve the paths with a json extension append a json extension to the file in case if
        // it is missing and the resolution failed. This is to replicate TypeScript behaviour, see:
        // https://github.com/microsoft/TypeScript/blob/294a5a7d784a5a95a8048ee990400979a6bc3a1c/src/compiler/commandLineParser.ts#L2806
        return getExtendedConfigPathWorker(configFile, extendsValue + ".json", host, fs);
    }
    function getExtendedConfigPathWorker(configFile, extendsValue, host, fs) {
        if (extendsValue.startsWith('.') || fs.isRooted(extendsValue)) {
            var extendedConfigPath = host.resolve(host.dirname(configFile), extendsValue);
            if (host.exists(extendedConfigPath)) {
                return extendedConfigPath;
            }
        }
        else {
            var parseConfigHost = createParseConfigHost(host, fs);
            // Path isn't a rooted or relative path, resolve like a module.
            var resolvedModule = ts.nodeModuleNameResolver(extendsValue, configFile, { moduleResolution: ts.ModuleResolutionKind.NodeJs, resolveJsonModule: true }, parseConfigHost).resolvedModule;
            if (resolvedModule) {
                return file_system_1.absoluteFrom(resolvedModule.resolvedFileName);
            }
        }
        return null;
    }
    function exitCodeFromResult(diags) {
        if (!diags || filterErrorsAndWarnings(diags).length === 0) {
            // If we have a result and didn't get any errors, we succeeded.
            return 0;
        }
        // Return 2 if any of the errors were unknown.
        return diags.some(function (d) { return d.source === 'angular' && d.code === api.UNKNOWN_ERROR_CODE; }) ? 2 : 1;
    }
    exports.exitCodeFromResult = exitCodeFromResult;
    function performCompilation(_a) {
        var rootNames = _a.rootNames, options = _a.options, host = _a.host, oldProgram = _a.oldProgram, emitCallback = _a.emitCallback, mergeEmitResultsCallback = _a.mergeEmitResultsCallback, _b = _a.gatherDiagnostics, gatherDiagnostics = _b === void 0 ? defaultGatherDiagnostics : _b, customTransformers = _a.customTransformers, _c = _a.emitFlags, emitFlags = _c === void 0 ? api.EmitFlags.Default : _c, _d = _a.modifiedResourceFiles, modifiedResourceFiles = _d === void 0 ? null : _d;
        var program;
        var emitResult;
        var allDiagnostics = [];
        try {
            if (!host) {
                host = ng.createCompilerHost({ options: options });
            }
            if (modifiedResourceFiles) {
                host.getModifiedResourceFiles = function () { return modifiedResourceFiles; };
            }
            program = ng.createProgram({ rootNames: rootNames, host: host, options: options, oldProgram: oldProgram });
            var beforeDiags = Date.now();
            allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(gatherDiagnostics(program)));
            if (options.diagnostics) {
                var afterDiags = Date.now();
                allDiagnostics.push(util_1.createMessageDiagnostic("Time for diagnostics: " + (afterDiags - beforeDiags) + "ms."));
            }
            if (!hasErrors(allDiagnostics)) {
                emitResult =
                    program.emit({ emitCallback: emitCallback, mergeEmitResultsCallback: mergeEmitResultsCallback, customTransformers: customTransformers, emitFlags: emitFlags });
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(emitResult.diagnostics));
                return { diagnostics: allDiagnostics, program: program, emitResult: emitResult };
            }
            return { diagnostics: allDiagnostics, program: program };
        }
        catch (e) {
            var errMsg = void 0;
            var code = void 0;
            if (compiler_1.isSyntaxError(e)) {
                // don't report the stack for syntax errors as they are well known errors.
                errMsg = e.message;
                code = api.DEFAULT_ERROR_CODE;
            }
            else {
                errMsg = e.stack;
                // It is not a syntax error we might have a program with unknown state, discard it.
                program = undefined;
                code = api.UNKNOWN_ERROR_CODE;
            }
            allDiagnostics.push({ category: ts.DiagnosticCategory.Error, messageText: errMsg, code: code, source: api.SOURCE });
            return { diagnostics: allDiagnostics, program: program };
        }
    }
    exports.performCompilation = performCompilation;
    function defaultGatherDiagnostics(program) {
        var allDiagnostics = [];
        function checkDiagnostics(diags) {
            if (diags) {
                allDiagnostics.push.apply(allDiagnostics, tslib_1.__spread(diags));
                return !hasErrors(diags);
            }
            return true;
        }
        var checkOtherDiagnostics = true;
        // Check parameter diagnostics
        checkOtherDiagnostics = checkOtherDiagnostics &&
            checkDiagnostics(tslib_1.__spread(program.getTsOptionDiagnostics(), program.getNgOptionDiagnostics()));
        // Check syntactic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getTsSyntacticDiagnostics());
        // Check TypeScript semantic and Angular structure diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics &&
                checkDiagnostics(tslib_1.__spread(program.getTsSemanticDiagnostics(), program.getNgStructuralDiagnostics()));
        // Check Angular semantic diagnostics
        checkOtherDiagnostics =
            checkOtherDiagnostics && checkDiagnostics(program.getNgSemanticDiagnostics());
        return allDiagnostics;
    }
    exports.defaultGatherDiagnostics = defaultGatherDiagnostics;
    function hasErrors(diags) {
        return diags.some(function (d) { return d.category === ts.DiagnosticCategory.Error; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybV9jb21waWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9wZXJmb3JtX2NvbXBpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUEwRDtJQUMxRCwrQkFBaUM7SUFFakMsMkVBQXdJO0lBR3hJLDJFQUE0RDtJQUM1RCxnRUFBMEM7SUFDMUMsd0VBQWtEO0lBQ2xELG9FQUE0RDtJQUk1RCxTQUFnQix1QkFBdUIsQ0FBQyxXQUF3QjtRQUM5RCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQTVDLENBQTRDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRkQsMERBRUM7SUFFRCxJQUFNLGlCQUFpQixHQUE2QjtRQUNsRCxtQkFBbUIsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxFQUE1QixDQUE0QjtRQUN2RCxvQkFBb0IsRUFBRSxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsRUFBUixDQUFRO1FBQzFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQWQsQ0FBYztLQUNqQyxDQUFDO0lBRUYsU0FBUyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxJQUE4QjtRQUN2RSxPQUFPLHNCQUFRLENBQ1gscUJBQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxFQUFFLHFCQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQsU0FBZ0Isd0JBQXdCLENBQ3BDLFFBQWtCLEVBQUUsSUFBa0Q7UUFBbEQscUJBQUEsRUFBQSx3QkFB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SSxPQUFuQixjQUFjLG1CQUFTLEtBQUssR0FBRTtnQkFDOUIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLDhCQUE4QjtRQUM5QixxQkFBcUIsR0FBRyxxQkFBcUI7WUFDekMsZ0JBQWdCLGtCQUFLLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxFQUFLLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUM7UUFFakcsOEJBQThCO1FBQzlCLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMseUJBQXlCLEVBQWlCLENBQUMsQ0FBQztRQUVsRyw4REFBOEQ7UUFDOUQscUJBQXFCO1lBQ2pCLHFCQUFxQjtnQkFDckIsZ0JBQWdCLGtCQUNSLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxFQUFLLE9BQU8sQ0FBQywwQkFBMEIsRUFBRSxFQUFFLENBQUM7UUFFMUYscUNBQXFDO1FBQ3JDLHFCQUFxQjtZQUNqQixxQkFBcUIsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQWlCLENBQUMsQ0FBQztRQUVqRyxPQUFPLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBL0JELDREQStCQztJQUVELFNBQVMsU0FBUyxDQUFDLEtBQWtCO1FBQ25DLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxRQUFRLEtBQUssRUFBRSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBMUMsQ0FBMEMsQ0FBQyxDQUFDO0lBQ3JFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc1N5bnRheEVycm9yLCBQb3NpdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YWJzb2x1dGVGcm9tLCBBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgZ2V0RmlsZVN5c3RlbSwgUmVhZG9ubHlGaWxlU3lzdGVtLCByZWxhdGl2ZSwgcmVzb2x2ZX0gZnJvbSAnLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TmdDb21waWxlck9wdGlvbnN9IGZyb20gJy4vbmd0c2MvY29yZS9hcGknO1xuXG5pbXBvcnQge3JlcGxhY2VUc1dpdGhOZ0luRXJyb3JzfSBmcm9tICcuL25ndHNjL2RpYWdub3N0aWNzJztcbmltcG9ydCAqIGFzIGFwaSBmcm9tICcuL3RyYW5zZm9ybWVycy9hcGknO1xuaW1wb3J0ICogYXMgbmcgZnJvbSAnLi90cmFuc2Zvcm1lcnMvZW50cnlfcG9pbnRzJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZURpYWdub3N0aWN9IGZyb20gJy4vdHJhbnNmb3JtZXJzL3V0aWwnO1xuXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljcyA9IFJlYWRvbmx5QXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz47XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFcnJvcnNBbmRXYXJuaW5ncyhkaWFnbm9zdGljczogRGlhZ25vc3RpY3MpOiBEaWFnbm9zdGljcyB7XG4gIHJldHVybiBkaWFnbm9zdGljcy5maWx0ZXIoZCA9PiBkLmNhdGVnb3J5ICE9PSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuTWVzc2FnZSk7XG59XG5cbmNvbnN0IGRlZmF1bHRGb3JtYXRIb3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSB7XG4gIGdldEN1cnJlbnREaXJlY3Rvcnk6ICgpID0+IHRzLnN5cy5nZXRDdXJyZW50RGlyZWN0b3J5KCksXG4gIGdldENhbm9uaWNhbEZpbGVOYW1lOiBmaWxlTmFtZSA9PiBmaWxlTmFtZSxcbiAgZ2V0TmV3TGluZTogKCkgPT4gdHMuc3lzLm5ld0xpbmVcbn07XG5cbmZ1bmN0aW9uIGRpc3BsYXlGaWxlTmFtZShmaWxlTmFtZTogc3RyaW5nLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QpOiBzdHJpbmcge1xuICByZXR1cm4gcmVsYXRpdmUoXG4gICAgICByZXNvbHZlKGhvc3QuZ2V0Q3VycmVudERpcmVjdG9yeSgpKSwgcmVzb2x2ZShob3N0LmdldENhbm9uaWNhbEZpbGVOYW1lKGZpbGVOYW1lKSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGlhZ25vc3RpY1Bvc2l0aW9uKFxuICAgIHBvc2l0aW9uOiBQb3NpdGlvbiwgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7ZGlzcGxheUZpbGVOYW1lKHBvc2l0aW9uLmZpbGVOYW1lLCBob3N0KX0oJHtwb3NpdGlvbi5saW5lICsgMX0sJHtwb3NpdGlvbi5jb2x1bW4gKyAxfSlgO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4oXG4gICAgY2hhaW46IGFwaS5EaWFnbm9zdGljTWVzc2FnZUNoYWluLCBob3N0OiB0cy5Gb3JtYXREaWFnbm9zdGljc0hvc3QgPSBkZWZhdWx0Rm9ybWF0SG9zdCxcbiAgICBpbmRlbnQgPSAwKTogc3RyaW5nIHtcbiAgY29uc3QgbmV3TGluZSA9IGhvc3QuZ2V0TmV3TGluZSgpO1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGlmIChpbmRlbnQpIHtcbiAgICByZXN1bHQgKz0gbmV3TGluZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZW50OyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSAnICAnO1xuICAgIH1cbiAgfVxuICByZXN1bHQgKz0gY2hhaW4ubWVzc2FnZVRleHQ7XG5cbiAgY29uc3QgcG9zaXRpb24gPSBjaGFpbi5wb3NpdGlvbjtcbiAgLy8gYWRkIHBvc2l0aW9uIGlmIGF2YWlsYWJsZSwgYW5kIHdlIGFyZSBub3QgYXQgdGhlIGRlcGVzdCBmcmFtZVxuICBpZiAocG9zaXRpb24gJiYgaW5kZW50ICE9PSAwKSB7XG4gICAgcmVzdWx0ICs9IGAgYXQgJHtmb3JtYXREaWFnbm9zdGljUG9zaXRpb24ocG9zaXRpb24sIGhvc3QpfWA7XG4gIH1cblxuICBpbmRlbnQrKztcbiAgaWYgKGNoYWluLm5leHQpIHtcbiAgICBmb3IgKGNvbnN0IGtpZCBvZiBjaGFpbi5uZXh0KSB7XG4gICAgICByZXN1bHQgKz0gZmxhdHRlbkRpYWdub3N0aWNNZXNzYWdlQ2hhaW4oa2lkLCBob3N0LCBpbmRlbnQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0RGlhZ25vc3RpYyhcbiAgICBkaWFnbm9zdGljOiBhcGkuRGlhZ25vc3RpYywgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBjb25zdCBuZXdMaW5lID0gaG9zdC5nZXROZXdMaW5lKCk7XG4gIGNvbnN0IHNwYW4gPSBkaWFnbm9zdGljLnNwYW47XG4gIGlmIChzcGFuKSB7XG4gICAgcmVzdWx0ICs9IGAke1xuICAgICAgICBmb3JtYXREaWFnbm9zdGljUG9zaXRpb24oXG4gICAgICAgICAgICB7ZmlsZU5hbWU6IHNwYW4uc3RhcnQuZmlsZS51cmwsIGxpbmU6IHNwYW4uc3RhcnQubGluZSwgY29sdW1uOiBzcGFuLnN0YXJ0LmNvbH0sXG4gICAgICAgICAgICBob3N0KX06IGA7XG4gIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy5wb3NpdGlvbikge1xuICAgIHJlc3VsdCArPSBgJHtmb3JtYXREaWFnbm9zdGljUG9zaXRpb24oZGlhZ25vc3RpYy5wb3NpdGlvbiwgaG9zdCl9OiBgO1xuICB9XG4gIGlmIChkaWFnbm9zdGljLnNwYW4gJiYgZGlhZ25vc3RpYy5zcGFuLmRldGFpbHMpIHtcbiAgICByZXN1bHQgKz0gYCR7ZGlhZ25vc3RpYy5zcGFuLmRldGFpbHN9LCAke2RpYWdub3N0aWMubWVzc2FnZVRleHR9JHtuZXdMaW5lfWA7XG4gIH0gZWxzZSBpZiAoZGlhZ25vc3RpYy5jaGFpbikge1xuICAgIHJlc3VsdCArPSBgJHtmbGF0dGVuRGlhZ25vc3RpY01lc3NhZ2VDaGFpbihkaWFnbm9zdGljLmNoYWluLCBob3N0KX0uJHtuZXdMaW5lfWA7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ICs9IGAke2RpYWdub3N0aWMubWVzc2FnZVRleHR9JHtuZXdMaW5lfWA7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdERpYWdub3N0aWNzKFxuICAgIGRpYWdzOiBEaWFnbm9zdGljcywgaG9zdDogdHMuRm9ybWF0RGlhZ25vc3RpY3NIb3N0ID0gZGVmYXVsdEZvcm1hdEhvc3QpOiBzdHJpbmcge1xuICBpZiAoZGlhZ3MgJiYgZGlhZ3MubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGRpYWdzXG4gICAgICAgIC5tYXAoZGlhZ25vc3RpYyA9PiB7XG4gICAgICAgICAgaWYgKGFwaS5pc1RzRGlhZ25vc3RpYyhkaWFnbm9zdGljKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VUc1dpdGhOZ0luRXJyb3JzKFxuICAgICAgICAgICAgICAgIHRzLmZvcm1hdERpYWdub3N0aWNzV2l0aENvbG9yQW5kQ29udGV4dChbZGlhZ25vc3RpY10sIGhvc3QpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdERpYWdub3N0aWMoZGlhZ25vc3RpYywgaG9zdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKiBVc2VkIHRvIHJlYWQgY29uZmlndXJhdGlvbiBmaWxlcy4gKi9cbmV4cG9ydCB0eXBlIENvbmZpZ3VyYXRpb25Ib3N0ID0gUGljazxcbiAgICBSZWFkb25seUZpbGVTeXN0ZW0sICdyZWFkRmlsZSd8J2V4aXN0cyd8J2xzdGF0J3wncmVzb2x2ZSd8J2pvaW4nfCdkaXJuYW1lJ3wnZXh0bmFtZSd8J3B3ZCc+O1xuXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZENvbmZpZ3VyYXRpb24ge1xuICBwcm9qZWN0OiBzdHJpbmc7XG4gIG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnM7XG4gIHJvb3ROYW1lczogc3RyaW5nW107XG4gIHByb2plY3RSZWZlcmVuY2VzPzogcmVhZG9ubHkgdHMuUHJvamVjdFJlZmVyZW5jZVtdfHVuZGVmaW5lZDtcbiAgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzO1xuICBlcnJvcnM6IHRzLkRpYWdub3N0aWNbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGNQcm9qZWN0RmlsZUFuZEJhc2VQYXRoKFxuICAgIHByb2plY3Q6IHN0cmluZywgaG9zdDogQ29uZmlndXJhdGlvbkhvc3QgPSBnZXRGaWxlU3lzdGVtKCkpOlxuICAgIHtwcm9qZWN0RmlsZTogQWJzb2x1dGVGc1BhdGgsIGJhc2VQYXRoOiBBYnNvbHV0ZUZzUGF0aH0ge1xuICBjb25zdCBhYnNQcm9qZWN0ID0gaG9zdC5yZXNvbHZlKHByb2plY3QpO1xuICBjb25zdCBwcm9qZWN0SXNEaXIgPSBob3N0LmxzdGF0KGFic1Byb2plY3QpLmlzRGlyZWN0b3J5KCk7XG4gIGNvbnN0IHByb2plY3RGaWxlID0gcHJvamVjdElzRGlyID8gaG9zdC5qb2luKGFic1Byb2plY3QsICd0c2NvbmZpZy5qc29uJykgOiBhYnNQcm9qZWN0O1xuICBjb25zdCBwcm9qZWN0RGlyID0gcHJvamVjdElzRGlyID8gYWJzUHJvamVjdCA6IGhvc3QuZGlybmFtZShhYnNQcm9qZWN0KTtcbiAgY29uc3QgYmFzZVBhdGggPSBob3N0LnJlc29sdmUocHJvamVjdERpcik7XG4gIHJldHVybiB7cHJvamVjdEZpbGUsIGJhc2VQYXRofTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRDb25maWd1cmF0aW9uKFxuICAgIHByb2plY3Q6IHN0cmluZywgZXhpc3RpbmdPcHRpb25zPzogYXBpLkNvbXBpbGVyT3B0aW9ucyxcbiAgICBob3N0OiBDb25maWd1cmF0aW9uSG9zdCA9IGdldEZpbGVTeXN0ZW0oKSk6IFBhcnNlZENvbmZpZ3VyYXRpb24ge1xuICB0cnkge1xuICAgIGNvbnN0IGZzID0gZ2V0RmlsZVN5c3RlbSgpO1xuXG4gICAgY29uc3QgcmVhZENvbmZpZ0ZpbGUgPSAoY29uZmlnRmlsZTogc3RyaW5nKSA9PlxuICAgICAgICB0cy5yZWFkQ29uZmlnRmlsZShjb25maWdGaWxlLCBmaWxlID0+IGhvc3QucmVhZEZpbGUoaG9zdC5yZXNvbHZlKGZpbGUpKSk7XG4gICAgY29uc3QgcmVhZEFuZ3VsYXJDb21waWxlck9wdGlvbnMgPVxuICAgICAgICAoY29uZmlnRmlsZTogc3RyaW5nLCBwYXJlbnRPcHRpb25zOiBOZ0NvbXBpbGVyT3B0aW9ucyA9IHt9KTogTmdDb21waWxlck9wdGlvbnMgPT4ge1xuICAgICAgICAgIGNvbnN0IHtjb25maWcsIGVycm9yfSA9IHJlYWRDb25maWdGaWxlKGNvbmZpZ0ZpbGUpO1xuXG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBFcnJvcnMgYXJlIGhhbmRsZWQgbGF0ZXIgb24gYnkgJ3BhcnNlSnNvbkNvbmZpZ0ZpbGVDb250ZW50J1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudE9wdGlvbnM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gd2UgYXJlIG9ubHkgaW50ZXJlc3RlZCBpbnRvIG1lcmdpbmcgJ2FuZ3VsYXJDb21waWxlck9wdGlvbnMnIGFzXG4gICAgICAgICAgLy8gb3RoZXIgb3B0aW9ucyBsaWtlICdjb21waWxlck9wdGlvbnMnIGFyZSBtZXJnZWQgYnkgVFNcbiAgICAgICAgICBjb25zdCBleGlzdGluZ05nQ29tcGlsZXJPcHRpb25zID0gey4uLmNvbmZpZy5hbmd1bGFyQ29tcGlsZXJPcHRpb25zLCAuLi5wYXJlbnRPcHRpb25zfTtcblxuICAgICAgICAgIGlmIChjb25maWcuZXh0ZW5kcyAmJiB0eXBlb2YgY29uZmlnLmV4dGVuZHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCBleHRlbmRlZENvbmZpZ1BhdGggPSBnZXRFeHRlbmRlZENvbmZpZ1BhdGgoXG4gICAgICAgICAgICAgICAgY29uZmlnRmlsZSwgY29uZmlnLmV4dGVuZHMsIGhvc3QsIGZzLFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGV4dGVuZGVkQ29uZmlnUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBDYWxsIHJlYWRBbmd1bGFyQ29tcGlsZXJPcHRpb25zIHJlY3Vyc2l2ZWx5IHRvIG1lcmdlIE5HIENvbXBpbGVyIG9wdGlvbnNcbiAgICAgICAgICAgICAgcmV0dXJuIHJlYWRBbmd1bGFyQ29tcGlsZXJPcHRpb25zKGV4dGVuZGVkQ29uZmlnUGF0aCwgZXhpc3RpbmdOZ0NvbXBpbGVyT3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGV4aXN0aW5nTmdDb21waWxlck9wdGlvbnM7XG4gICAgICAgIH07XG5cbiAgICBjb25zdCB7cHJvamVjdEZpbGUsIGJhc2VQYXRofSA9IGNhbGNQcm9qZWN0RmlsZUFuZEJhc2VQYXRoKHByb2plY3QsIGhvc3QpO1xuICAgIGNvbnN0IGNvbmZpZ0ZpbGVOYW1lID0gaG9zdC5yZXNvbHZlKGhvc3QucHdkKCksIHByb2plY3RGaWxlKTtcbiAgICBjb25zdCB7Y29uZmlnLCBlcnJvcn0gPSByZWFkQ29uZmlnRmlsZShwcm9qZWN0RmlsZSk7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0LFxuICAgICAgICBlcnJvcnM6IFtlcnJvcl0sXG4gICAgICAgIHJvb3ROYW1lczogW10sXG4gICAgICAgIG9wdGlvbnM6IHt9LFxuICAgICAgICBlbWl0RmxhZ3M6IGFwaS5FbWl0RmxhZ3MuRGVmYXVsdFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZXhpc3RpbmdDb21waWxlck9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMgPSB7XG4gICAgICBnZW5EaXI6IGJhc2VQYXRoLFxuICAgICAgYmFzZVBhdGgsXG4gICAgICAuLi5yZWFkQW5ndWxhckNvbXBpbGVyT3B0aW9ucyhjb25maWdGaWxlTmFtZSksXG4gICAgICAuLi5leGlzdGluZ09wdGlvbnMsXG4gICAgfTtcblxuICAgIGNvbnN0IHBhcnNlQ29uZmlnSG9zdCA9IGNyZWF0ZVBhcnNlQ29uZmlnSG9zdChob3N0LCBmcyk7XG4gICAgY29uc3Qge29wdGlvbnMsIGVycm9ycywgZmlsZU5hbWVzOiByb290TmFtZXMsIHByb2plY3RSZWZlcmVuY2VzfSA9XG4gICAgICAgIHRzLnBhcnNlSnNvbkNvbmZpZ0ZpbGVDb250ZW50KFxuICAgICAgICAgICAgY29uZmlnLCBwYXJzZUNvbmZpZ0hvc3QsIGJhc2VQYXRoLCBleGlzdGluZ0NvbXBpbGVyT3B0aW9ucywgY29uZmlnRmlsZU5hbWUpO1xuXG4gICAgLy8gQ29lcmNlIHRvIGJvb2xlYW4gYXMgYGVuYWJsZUl2eWAgY2FuIGJlIGBuZ3RzY3x0cnVlfGZhbHNlfHVuZGVmaW5lZGAgaGVyZS5cbiAgICBvcHRpb25zLmVuYWJsZUl2eSA9ICEhKG9wdGlvbnMuZW5hYmxlSXZ5ID8/IHRydWUpO1xuXG4gICAgbGV0IGVtaXRGbGFncyA9IGFwaS5FbWl0RmxhZ3MuRGVmYXVsdDtcbiAgICBpZiAoIShvcHRpb25zLnNraXBNZXRhZGF0YUVtaXQgfHwgb3B0aW9ucy5mbGF0TW9kdWxlT3V0RmlsZSkpIHtcbiAgICAgIGVtaXRGbGFncyB8PSBhcGkuRW1pdEZsYWdzLk1ldGFkYXRhO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5za2lwVGVtcGxhdGVDb2RlZ2VuKSB7XG4gICAgICBlbWl0RmxhZ3MgPSBlbWl0RmxhZ3MgJiB+YXBpLkVtaXRGbGFncy5Db2RlZ2VuO1xuICAgIH1cbiAgICByZXR1cm4ge3Byb2plY3Q6IHByb2plY3RGaWxlLCByb290TmFtZXMsIHByb2plY3RSZWZlcmVuY2VzLCBvcHRpb25zLCBlcnJvcnMsIGVtaXRGbGFnc307XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjb25zdCBlcnJvcnM6IHRzLkRpYWdub3N0aWNbXSA9IFt7XG4gICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgbWVzc2FnZVRleHQ6IGUuc3RhY2ssXG4gICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICBzdGFydDogdW5kZWZpbmVkLFxuICAgICAgbGVuZ3RoOiB1bmRlZmluZWQsXG4gICAgICBzb3VyY2U6ICdhbmd1bGFyJyxcbiAgICAgIGNvZGU6IGFwaS5VTktOT1dOX0VSUk9SX0NPREUsXG4gICAgfV07XG4gICAgcmV0dXJuIHtwcm9qZWN0OiAnJywgZXJyb3JzLCByb290TmFtZXM6IFtdLCBvcHRpb25zOiB7fSwgZW1pdEZsYWdzOiBhcGkuRW1pdEZsYWdzLkRlZmF1bHR9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBhcnNlQ29uZmlnSG9zdChob3N0OiBDb25maWd1cmF0aW9uSG9zdCwgZnMgPSBnZXRGaWxlU3lzdGVtKCkpOiB0cy5QYXJzZUNvbmZpZ0hvc3Qge1xuICByZXR1cm4ge1xuICAgIGZpbGVFeGlzdHM6IGhvc3QuZXhpc3RzLmJpbmQoaG9zdCksXG4gICAgcmVhZERpcmVjdG9yeTogdHMuc3lzLnJlYWREaXJlY3RvcnksXG4gICAgcmVhZEZpbGU6IGhvc3QucmVhZEZpbGUuYmluZChob3N0KSxcbiAgICB1c2VDYXNlU2Vuc2l0aXZlRmlsZU5hbWVzOiBmcy5pc0Nhc2VTZW5zaXRpdmUoKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RXh0ZW5kZWRDb25maWdQYXRoKFxuICAgIGNvbmZpZ0ZpbGU6IHN0cmluZywgZXh0ZW5kc1ZhbHVlOiBzdHJpbmcsIGhvc3Q6IENvbmZpZ3VyYXRpb25Ib3N0LFxuICAgIGZzOiBGaWxlU3lzdGVtKTogQWJzb2x1dGVGc1BhdGh8bnVsbCB7XG4gIGNvbnN0IHJlc3VsdCA9IGdldEV4dGVuZGVkQ29uZmlnUGF0aFdvcmtlcihjb25maWdGaWxlLCBleHRlbmRzVmFsdWUsIGhvc3QsIGZzKTtcbiAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBUcnkgdG8gcmVzb2x2ZSB0aGUgcGF0aHMgd2l0aCBhIGpzb24gZXh0ZW5zaW9uIGFwcGVuZCBhIGpzb24gZXh0ZW5zaW9uIHRvIHRoZSBmaWxlIGluIGNhc2UgaWZcbiAgLy8gaXQgaXMgbWlzc2luZyBhbmQgdGhlIHJlc29sdXRpb24gZmFpbGVkLiBUaGlzIGlzIHRvIHJlcGxpY2F0ZSBUeXBlU2NyaXB0IGJlaGF2aW91ciwgc2VlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi8yOTRhNWE3ZDc4NGE1YTk1YTgwNDhlZTk5MDQwMDk3OWE2YmMzYTFjL3NyYy9jb21waWxlci9jb21tYW5kTGluZVBhcnNlci50cyNMMjgwNlxuICByZXR1cm4gZ2V0RXh0ZW5kZWRDb25maWdQYXRoV29ya2VyKGNvbmZpZ0ZpbGUsIGAke2V4dGVuZHNWYWx1ZX0uanNvbmAsIGhvc3QsIGZzKTtcbn1cblxuZnVuY3Rpb24gZ2V0RXh0ZW5kZWRDb25maWdQYXRoV29ya2VyKFxuICAgIGNvbmZpZ0ZpbGU6IHN0cmluZywgZXh0ZW5kc1ZhbHVlOiBzdHJpbmcsIGhvc3Q6IENvbmZpZ3VyYXRpb25Ib3N0LFxuICAgIGZzOiBGaWxlU3lzdGVtKTogQWJzb2x1dGVGc1BhdGh8bnVsbCB7XG4gIGlmIChleHRlbmRzVmFsdWUuc3RhcnRzV2l0aCgnLicpIHx8IGZzLmlzUm9vdGVkKGV4dGVuZHNWYWx1ZSkpIHtcbiAgICBjb25zdCBleHRlbmRlZENvbmZpZ1BhdGggPSBob3N0LnJlc29sdmUoaG9zdC5kaXJuYW1lKGNvbmZpZ0ZpbGUpLCBleHRlbmRzVmFsdWUpO1xuICAgIGlmIChob3N0LmV4aXN0cyhleHRlbmRlZENvbmZpZ1BhdGgpKSB7XG4gICAgICByZXR1cm4gZXh0ZW5kZWRDb25maWdQYXRoO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYXJzZUNvbmZpZ0hvc3QgPSBjcmVhdGVQYXJzZUNvbmZpZ0hvc3QoaG9zdCwgZnMpO1xuXG4gICAgLy8gUGF0aCBpc24ndCBhIHJvb3RlZCBvciByZWxhdGl2ZSBwYXRoLCByZXNvbHZlIGxpa2UgYSBtb2R1bGUuXG4gICAgY29uc3Qge1xuICAgICAgcmVzb2x2ZWRNb2R1bGUsXG4gICAgfSA9XG4gICAgICAgIHRzLm5vZGVNb2R1bGVOYW1lUmVzb2x2ZXIoXG4gICAgICAgICAgICBleHRlbmRzVmFsdWUsIGNvbmZpZ0ZpbGUsXG4gICAgICAgICAgICB7bW9kdWxlUmVzb2x1dGlvbjogdHMuTW9kdWxlUmVzb2x1dGlvbktpbmQuTm9kZUpzLCByZXNvbHZlSnNvbk1vZHVsZTogdHJ1ZX0sXG4gICAgICAgICAgICBwYXJzZUNvbmZpZ0hvc3QpO1xuICAgIGlmIChyZXNvbHZlZE1vZHVsZSkge1xuICAgICAgcmV0dXJuIGFic29sdXRlRnJvbShyZXNvbHZlZE1vZHVsZS5yZXNvbHZlZEZpbGVOYW1lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQZXJmb3JtQ29tcGlsYXRpb25SZXN1bHQge1xuICBkaWFnbm9zdGljczogRGlhZ25vc3RpY3M7XG4gIHByb2dyYW0/OiBhcGkuUHJvZ3JhbTtcbiAgZW1pdFJlc3VsdD86IHRzLkVtaXRSZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGl0Q29kZUZyb21SZXN1bHQoZGlhZ3M6IERpYWdub3N0aWNzfHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICghZGlhZ3MgfHwgZmlsdGVyRXJyb3JzQW5kV2FybmluZ3MoZGlhZ3MpLmxlbmd0aCA9PT0gMCkge1xuICAgIC8vIElmIHdlIGhhdmUgYSByZXN1bHQgYW5kIGRpZG4ndCBnZXQgYW55IGVycm9ycywgd2Ugc3VjY2VlZGVkLlxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gUmV0dXJuIDIgaWYgYW55IG9mIHRoZSBlcnJvcnMgd2VyZSB1bmtub3duLlxuICByZXR1cm4gZGlhZ3Muc29tZShkID0+IGQuc291cmNlID09PSAnYW5ndWxhcicgJiYgZC5jb2RlID09PSBhcGkuVU5LTk9XTl9FUlJPUl9DT0RFKSA/IDIgOiAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGVyZm9ybUNvbXBpbGF0aW9uKHtcbiAgcm9vdE5hbWVzLFxuICBvcHRpb25zLFxuICBob3N0LFxuICBvbGRQcm9ncmFtLFxuICBlbWl0Q2FsbGJhY2ssXG4gIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjayxcbiAgZ2F0aGVyRGlhZ25vc3RpY3MgPSBkZWZhdWx0R2F0aGVyRGlhZ25vc3RpY3MsXG4gIGN1c3RvbVRyYW5zZm9ybWVycyxcbiAgZW1pdEZsYWdzID0gYXBpLkVtaXRGbGFncy5EZWZhdWx0LFxuICBtb2RpZmllZFJlc291cmNlRmlsZXMgPSBudWxsXG59OiB7XG4gIHJvb3ROYW1lczogc3RyaW5nW10sXG4gIG9wdGlvbnM6IGFwaS5Db21waWxlck9wdGlvbnMsXG4gIGhvc3Q/OiBhcGkuQ29tcGlsZXJIb3N0LFxuICBvbGRQcm9ncmFtPzogYXBpLlByb2dyYW0sXG4gIGVtaXRDYWxsYmFjaz86IGFwaS5Uc0VtaXRDYWxsYmFjayxcbiAgbWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrPzogYXBpLlRzTWVyZ2VFbWl0UmVzdWx0c0NhbGxiYWNrLFxuICBnYXRoZXJEaWFnbm9zdGljcz86IChwcm9ncmFtOiBhcGkuUHJvZ3JhbSkgPT4gRGlhZ25vc3RpY3MsXG4gIGN1c3RvbVRyYW5zZm9ybWVycz86IGFwaS5DdXN0b21UcmFuc2Zvcm1lcnMsXG4gIGVtaXRGbGFncz86IGFwaS5FbWl0RmxhZ3MsXG4gIG1vZGlmaWVkUmVzb3VyY2VGaWxlcz86IFNldDxzdHJpbmc+fCBudWxsLFxufSk6IFBlcmZvcm1Db21waWxhdGlvblJlc3VsdCB7XG4gIGxldCBwcm9ncmFtOiBhcGkuUHJvZ3JhbXx1bmRlZmluZWQ7XG4gIGxldCBlbWl0UmVzdWx0OiB0cy5FbWl0UmVzdWx0fHVuZGVmaW5lZDtcbiAgbGV0IGFsbERpYWdub3N0aWNzOiBBcnJheTx0cy5EaWFnbm9zdGljfGFwaS5EaWFnbm9zdGljPiA9IFtdO1xuICB0cnkge1xuICAgIGlmICghaG9zdCkge1xuICAgICAgaG9zdCA9IG5nLmNyZWF0ZUNvbXBpbGVySG9zdCh7b3B0aW9uc30pO1xuICAgIH1cbiAgICBpZiAobW9kaWZpZWRSZXNvdXJjZUZpbGVzKSB7XG4gICAgICBob3N0LmdldE1vZGlmaWVkUmVzb3VyY2VGaWxlcyA9ICgpID0+IG1vZGlmaWVkUmVzb3VyY2VGaWxlcztcbiAgICB9XG5cbiAgICBwcm9ncmFtID0gbmcuY3JlYXRlUHJvZ3JhbSh7cm9vdE5hbWVzLCBob3N0LCBvcHRpb25zLCBvbGRQcm9ncmFtfSk7XG5cbiAgICBjb25zdCBiZWZvcmVEaWFncyA9IERhdGUubm93KCk7XG4gICAgYWxsRGlhZ25vc3RpY3MucHVzaCguLi5nYXRoZXJEaWFnbm9zdGljcyhwcm9ncmFtISkpO1xuICAgIGlmIChvcHRpb25zLmRpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBhZnRlckRpYWdzID0gRGF0ZS5ub3coKTtcbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goXG4gICAgICAgICAgY3JlYXRlTWVzc2FnZURpYWdub3N0aWMoYFRpbWUgZm9yIGRpYWdub3N0aWNzOiAke2FmdGVyRGlhZ3MgLSBiZWZvcmVEaWFnc31tcy5gKSk7XG4gICAgfVxuXG4gICAgaWYgKCFoYXNFcnJvcnMoYWxsRGlhZ25vc3RpY3MpKSB7XG4gICAgICBlbWl0UmVzdWx0ID1cbiAgICAgICAgICBwcm9ncmFtIS5lbWl0KHtlbWl0Q2FsbGJhY2ssIG1lcmdlRW1pdFJlc3VsdHNDYWxsYmFjaywgY3VzdG9tVHJhbnNmb3JtZXJzLCBlbWl0RmxhZ3N9KTtcbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZW1pdFJlc3VsdC5kaWFnbm9zdGljcyk7XG4gICAgICByZXR1cm4ge2RpYWdub3N0aWNzOiBhbGxEaWFnbm9zdGljcywgcHJvZ3JhbSwgZW1pdFJlc3VsdH07XG4gICAgfVxuICAgIHJldHVybiB7ZGlhZ25vc3RpY3M6IGFsbERpYWdub3N0aWNzLCBwcm9ncmFtfTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGxldCBlcnJNc2c6IHN0cmluZztcbiAgICBsZXQgY29kZTogbnVtYmVyO1xuICAgIGlmIChpc1N5bnRheEVycm9yKGUpKSB7XG4gICAgICAvLyBkb24ndCByZXBvcnQgdGhlIHN0YWNrIGZvciBzeW50YXggZXJyb3JzIGFzIHRoZXkgYXJlIHdlbGwga25vd24gZXJyb3JzLlxuICAgICAgZXJyTXNnID0gZS5tZXNzYWdlO1xuICAgICAgY29kZSA9IGFwaS5ERUZBVUxUX0VSUk9SX0NPREU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVyck1zZyA9IGUuc3RhY2s7XG4gICAgICAvLyBJdCBpcyBub3QgYSBzeW50YXggZXJyb3Igd2UgbWlnaHQgaGF2ZSBhIHByb2dyYW0gd2l0aCB1bmtub3duIHN0YXRlLCBkaXNjYXJkIGl0LlxuICAgICAgcHJvZ3JhbSA9IHVuZGVmaW5lZDtcbiAgICAgIGNvZGUgPSBhcGkuVU5LTk9XTl9FUlJPUl9DT0RFO1xuICAgIH1cbiAgICBhbGxEaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICB7Y2F0ZWdvcnk6IHRzLkRpYWdub3N0aWNDYXRlZ29yeS5FcnJvciwgbWVzc2FnZVRleHQ6IGVyck1zZywgY29kZSwgc291cmNlOiBhcGkuU09VUkNFfSk7XG4gICAgcmV0dXJuIHtkaWFnbm9zdGljczogYWxsRGlhZ25vc3RpY3MsIHByb2dyYW19O1xuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdEdhdGhlckRpYWdub3N0aWNzKHByb2dyYW06IGFwaS5Qcm9ncmFtKTogRGlhZ25vc3RpY3Mge1xuICBjb25zdCBhbGxEaWFnbm9zdGljczogQXJyYXk8dHMuRGlhZ25vc3RpY3xhcGkuRGlhZ25vc3RpYz4gPSBbXTtcblxuICBmdW5jdGlvbiBjaGVja0RpYWdub3N0aWNzKGRpYWdzOiBEaWFnbm9zdGljc3x1bmRlZmluZWQpIHtcbiAgICBpZiAoZGlhZ3MpIHtcbiAgICAgIGFsbERpYWdub3N0aWNzLnB1c2goLi4uZGlhZ3MpO1xuICAgICAgcmV0dXJuICFoYXNFcnJvcnMoZGlhZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGxldCBjaGVja090aGVyRGlhZ25vc3RpY3MgPSB0cnVlO1xuICAvLyBDaGVjayBwYXJhbWV0ZXIgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID0gY2hlY2tPdGhlckRpYWdub3N0aWNzICYmXG4gICAgICBjaGVja0RpYWdub3N0aWNzKFsuLi5wcm9ncmFtLmdldFRzT3B0aW9uRGlhZ25vc3RpY3MoKSwgLi4ucHJvZ3JhbS5nZXROZ09wdGlvbkRpYWdub3N0aWNzKCldKTtcblxuICAvLyBDaGVjayBzeW50YWN0aWMgZGlhZ25vc3RpY3NcbiAgY2hlY2tPdGhlckRpYWdub3N0aWNzID1cbiAgICAgIGNoZWNrT3RoZXJEaWFnbm9zdGljcyAmJiBjaGVja0RpYWdub3N0aWNzKHByb2dyYW0uZ2V0VHNTeW50YWN0aWNEaWFnbm9zdGljcygpIGFzIERpYWdub3N0aWNzKTtcblxuICAvLyBDaGVjayBUeXBlU2NyaXB0IHNlbWFudGljIGFuZCBBbmd1bGFyIHN0cnVjdHVyZSBkaWFnbm9zdGljc1xuICBjaGVja090aGVyRGlhZ25vc3RpY3MgPVxuICAgICAgY2hlY2tPdGhlckRpYWdub3N0aWNzICYmXG4gICAgICBjaGVja0RpYWdub3N0aWNzKFxuICAgICAgICAgIFsuLi5wcm9ncmFtLmdldFRzU2VtYW50aWNEaWFnbm9zdGljcygpLCAuLi5wcm9ncmFtLmdldE5nU3RydWN0dXJhbERpYWdub3N0aWNzKCldKTtcblxuICAvLyBDaGVjayBBbmd1bGFyIHNlbWFudGljIGRpYWdub3N0aWNzXG4gIGNoZWNrT3RoZXJEaWFnbm9zdGljcyA9XG4gICAgICBjaGVja090aGVyRGlhZ25vc3RpY3MgJiYgY2hlY2tEaWFnbm9zdGljcyhwcm9ncmFtLmdldE5nU2VtYW50aWNEaWFnbm9zdGljcygpIGFzIERpYWdub3N0aWNzKTtcblxuICByZXR1cm4gYWxsRGlhZ25vc3RpY3M7XG59XG5cbmZ1bmN0aW9uIGhhc0Vycm9ycyhkaWFnczogRGlhZ25vc3RpY3MpIHtcbiAgcmV0dXJuIGRpYWdzLnNvbWUoZCA9PiBkLmNhdGVnb3J5ID09PSB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IpO1xufVxuIl19