(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/entry_point", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/ngcc/src/host/umd_host", "@angular/compiler-cli/ngcc/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getEntryPointFormat = exports.isEntryPoint = exports.getEntryPointInfo = exports.INCOMPATIBLE_ENTRY_POINT = exports.IGNORED_ENTRY_POINT = exports.NO_ENTRY_POINT = exports.SUPPORTED_FORMAT_PROPERTIES = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    var umd_host_1 = require("@angular/compiler-cli/ngcc/src/host/umd_host");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/utils");
    // We need to keep the elements of this const and the `EntryPointJsonProperty` type in sync.
    exports.SUPPORTED_FORMAT_PROPERTIES = ['fesm2015', 'fesm5', 'es2015', 'esm2015', 'esm5', 'main', 'module', 'browser'];
    /**
     * The path does not represent an entry-point, i.e. there is no package.json at the path and there
     * is no config to force an entry-point.
     */
    exports.NO_ENTRY_POINT = 'no-entry-point';
    /**
     * The path represents an entry-point that is `ignored` by an ngcc config.
     */
    exports.IGNORED_ENTRY_POINT = 'ignored-entry-point';
    /**
     * The path has a package.json, but it is not a valid entry-point for ngcc processing.
     */
    exports.INCOMPATIBLE_ENTRY_POINT = 'incompatible-entry-point';
    /**
     * Try to create an entry-point from the given paths and properties.
     *
     * @param packagePath the absolute path to the containing npm package
     * @param entryPointPath the absolute path to the potential entry-point.
     * @returns
     * - An entry-point if it is valid and not ignored.
     * - `NO_ENTRY_POINT` when there is no package.json at the path and there is no config to force an
     *   entry-point,
     * - `IGNORED_ENTRY_POINT` when the entry-point is ignored by an ngcc config.
     * - `INCOMPATIBLE_ENTRY_POINT` when there is a package.json but it is not a valid Angular compiled
     *   entry-point.
     */
    function getEntryPointInfo(fs, config, logger, packagePath, entryPointPath) {
        var packagePackageJsonPath = fs.resolve(packagePath, 'package.json');
        var entryPointPackageJsonPath = fs.resolve(entryPointPath, 'package.json');
        var loadedPackagePackageJson = loadPackageJson(fs, packagePackageJsonPath);
        var loadedEntryPointPackageJson = (packagePackageJsonPath === entryPointPackageJsonPath) ?
            loadedPackagePackageJson :
            loadPackageJson(fs, entryPointPackageJsonPath);
        var _a = getPackageNameAndVersion(fs, packagePath, loadedPackagePackageJson, loadedEntryPointPackageJson), packageName = _a.packageName, packageVersion = _a.packageVersion;
        var packageConfig = config.getPackageConfig(packageName, packagePath, packageVersion);
        var entryPointConfig = packageConfig.entryPoints.get(entryPointPath);
        var entryPointPackageJson;
        if (entryPointConfig === undefined) {
            if (!fs.exists(entryPointPackageJsonPath)) {
                // No `package.json` and no config.
                return exports.NO_ENTRY_POINT;
            }
            else if (loadedEntryPointPackageJson === null) {
                // `package.json` exists but could not be parsed and there is no redeeming config.
                logger.warn("Failed to read entry point info from invalid 'package.json' file: " + entryPointPackageJsonPath);
                return exports.INCOMPATIBLE_ENTRY_POINT;
            }
            else {
                entryPointPackageJson = loadedEntryPointPackageJson;
            }
        }
        else if (entryPointConfig.ignore === true) {
            // Explicitly ignored entry-point.
            return exports.IGNORED_ENTRY_POINT;
        }
        else {
            entryPointPackageJson = mergeConfigAndPackageJson(fs, loadedEntryPointPackageJson, entryPointConfig, packagePath, entryPointPath);
        }
        var typings = entryPointPackageJson.typings || entryPointPackageJson.types ||
            guessTypingsFromPackageJson(fs, entryPointPath, entryPointPackageJson);
        if (typeof typings !== 'string') {
            // Missing the required `typings` property
            return exports.INCOMPATIBLE_ENTRY_POINT;
        }
        // An entry-point is assumed to be compiled by Angular if there is either:
        // * a `metadata.json` file next to the typings entry-point
        // * a custom config for this entry-point
        var metadataPath = fs.resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
        var compiledByAngular = entryPointConfig !== undefined || fs.exists(metadataPath);
        var entryPointInfo = {
            name: entryPointPackageJson.name,
            path: entryPointPath,
            packageName: packageName,
            packagePath: packagePath,
            packageJson: entryPointPackageJson,
            typings: fs.resolve(entryPointPath, typings),
            compiledByAngular: compiledByAngular,
            ignoreMissingDependencies: entryPointConfig !== undefined ? !!entryPointConfig.ignoreMissingDependencies : false,
            generateDeepReexports: entryPointConfig !== undefined ? !!entryPointConfig.generateDeepReexports : false,
        };
        return entryPointInfo;
    }
    exports.getEntryPointInfo = getEntryPointInfo;
    function isEntryPoint(result) {
        return result !== exports.NO_ENTRY_POINT && result !== exports.INCOMPATIBLE_ENTRY_POINT &&
            result !== exports.IGNORED_ENTRY_POINT;
    }
    exports.isEntryPoint = isEntryPoint;
    /**
     * Convert a package.json property into an entry-point format.
     *
     * @param property The property to convert to a format.
     * @returns An entry-point format or `undefined` if none match the given property.
     */
    function getEntryPointFormat(fs, entryPoint, property) {
        switch (property) {
            case 'fesm2015':
                return 'esm2015';
            case 'fesm5':
                return 'esm5';
            case 'es2015':
                return 'esm2015';
            case 'esm2015':
                return 'esm2015';
            case 'esm5':
                return 'esm5';
            case 'browser':
                var browserFile = entryPoint.packageJson['browser'];
                if (typeof browserFile !== 'string') {
                    return undefined;
                }
                return sniffModuleFormat(fs, fs.join(entryPoint.path, browserFile));
            case 'main':
                var mainFile = entryPoint.packageJson['main'];
                if (mainFile === undefined) {
                    return undefined;
                }
                return sniffModuleFormat(fs, fs.join(entryPoint.path, mainFile));
            case 'module':
                var moduleFilePath = entryPoint.packageJson['module'];
                // As of version 10, the `module` property in `package.json` should point to
                // the ESM2015 format output as per Angular Package format specification. This
                // means that the `module` property captures multiple formats, as old libraries
                // built with the old APF can still be processed. We detect the format by checking
                // the paths that should be used as per APF specification.
                if (typeof moduleFilePath === 'string' && moduleFilePath.includes('esm2015')) {
                    return "esm2015";
                }
                return 'esm5';
            default:
                return undefined;
        }
    }
    exports.getEntryPointFormat = getEntryPointFormat;
    /**
     * Parse the JSON from a `package.json` file.
     * @param packageJsonPath the absolute path to the `package.json` file.
     * @returns JSON from the `package.json` file if it is valid, `null` otherwise.
     */
    function loadPackageJson(fs, packageJsonPath) {
        try {
            return JSON.parse(fs.readFile(packageJsonPath));
        }
        catch (_a) {
            return null;
        }
    }
    function sniffModuleFormat(fs, sourceFilePath) {
        var resolvedPath = utils_1.resolveFileWithPostfixes(fs, sourceFilePath, ['', '.js', '/index.js']);
        if (resolvedPath === null) {
            return undefined;
        }
        var sourceFile = ts.createSourceFile(sourceFilePath, fs.readFile(resolvedPath), ts.ScriptTarget.ES5);
        if (sourceFile.statements.length === 0) {
            return undefined;
        }
        if (ts.isExternalModule(sourceFile)) {
            return 'esm5';
        }
        else if (umd_host_1.parseStatementForUmdModule(sourceFile.statements[0]) !== null) {
            return 'umd';
        }
        else {
            return 'commonjs';
        }
    }
    function mergeConfigAndPackageJson(fs, entryPointPackageJson, entryPointConfig, packagePath, entryPointPath) {
        if (entryPointPackageJson !== null) {
            return tslib_1.__assign(tslib_1.__assign({}, entryPointPackageJson), entryPointConfig.override);
        }
        else {
            var name = fs.basename(packagePath) + "/" + fs.relative(packagePath, entryPointPath);
            return tslib_1.__assign({ name: name }, entryPointConfig.override);
        }
    }
    function guessTypingsFromPackageJson(fs, entryPointPath, entryPointPackageJson) {
        var e_1, _a;
        try {
            for (var SUPPORTED_FORMAT_PROPERTIES_1 = tslib_1.__values(exports.SUPPORTED_FORMAT_PROPERTIES), SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next(); !SUPPORTED_FORMAT_PROPERTIES_1_1.done; SUPPORTED_FORMAT_PROPERTIES_1_1 = SUPPORTED_FORMAT_PROPERTIES_1.next()) {
                var prop = SUPPORTED_FORMAT_PROPERTIES_1_1.value;
                var field = entryPointPackageJson[prop];
                if (typeof field !== 'string') {
                    // Some crazy packages have things like arrays in these fields!
                    continue;
                }
                var relativeTypingsPath = field.replace(/\.js$/, '.d.ts');
                var typingsPath = fs.resolve(entryPointPath, relativeTypingsPath);
                if (fs.exists(typingsPath)) {
                    return typingsPath;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (SUPPORTED_FORMAT_PROPERTIES_1_1 && !SUPPORTED_FORMAT_PROPERTIES_1_1.done && (_a = SUPPORTED_FORMAT_PROPERTIES_1.return)) _a.call(SUPPORTED_FORMAT_PROPERTIES_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    /**
     * Find or infer the name and version of a package.
     *
     * - The name is computed based on the `name` property of the package's or the entry-point's
     *   `package.json` file (if available) or inferred from the package's path.
     * - The version is read off of the `version` property of the package's `package.json` file (if
     *   available).
     *
     * @param fs The file-system to use for processing `packagePath`.
     * @param packagePath the absolute path to the package.
     * @param packagePackageJson the parsed `package.json` of the package (if available).
     * @param entryPointPackageJson the parsed `package.json` of an entry-point (if available).
     * @returns the computed name and version of the package.
     */
    function getPackageNameAndVersion(fs, packagePath, packagePackageJson, entryPointPackageJson) {
        var _a;
        var packageName;
        if (packagePackageJson !== null) {
            // We have a valid `package.json` for the package: Get the package name from that.
            packageName = packagePackageJson.name;
        }
        else if (entryPointPackageJson !== null) {
            // We have a valid `package.json` for the entry-point: Get the package name from that.
            // This might be a secondary entry-point, so make sure we only keep the main package's name
            // (e.g. only keep `@angular/common` from `@angular/common/http`).
            packageName = /^(?:@[^/]+\/)?[^/]*/.exec(entryPointPackageJson.name)[0];
        }
        else {
            // We don't have a valid `package.json`: Infer the package name from the package's path.
            var lastSegment = fs.basename(packagePath);
            var secondLastSegment = fs.basename(fs.dirname(packagePath));
            packageName =
                secondLastSegment.startsWith('@') ? secondLastSegment + "/" + lastSegment : lastSegment;
        }
        return {
            packageName: packageName,
            packageVersion: (_a = packagePackageJson === null || packagePackageJson === void 0 ? void 0 : packagePackageJson.version) !== null && _a !== void 0 ? _a : null,
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvZW50cnlfcG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILCtCQUFpQztJQUlqQyx5RUFBNEQ7SUFDNUQsOERBQWtEO0lBc0VsRCw0RkFBNEY7SUFDL0UsUUFBQSwyQkFBMkIsR0FDcEMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFHcEY7OztPQUdHO0lBQ1UsUUFBQSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFL0M7O09BRUc7SUFDVSxRQUFBLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBRXpEOztPQUVHO0lBQ1UsUUFBQSx3QkFBd0IsR0FBRywwQkFBMEIsQ0FBQztJQWVuRTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFnQixpQkFBaUIsQ0FDN0IsRUFBc0IsRUFBRSxNQUF5QixFQUFFLE1BQWMsRUFBRSxXQUEyQixFQUM5RixjQUE4QjtRQUNoQyxJQUFNLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZFLElBQU0seUJBQXlCLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDN0UsSUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUMsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDN0UsSUFBTSwyQkFBMkIsR0FBRyxDQUFDLHNCQUFzQixLQUFLLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUN4Rix3QkFBd0IsQ0FBQyxDQUFDO1lBQzFCLGVBQWUsQ0FBQyxFQUFFLEVB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LFNBQVMsd0JBQXdCLENBQzdCLEVBQW9CLEVBQUUsV0FBMkIsRUFDakQsa0JBQThDLEVBQzlDLHFCQUNJOztRQUNOLElBQUksV0FBbUIsQ0FBQztRQUV4QixJQUFJLGtCQUFrQixLQUFLLElBQUksRUFBRTtZQUMvQixrRkFBa0Y7WUFDbEYsV0FBVyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQztTQUN2QzthQUFNLElBQUkscUJBQXFCLEtBQUssSUFBSSxFQUFFO1lBQ3pDLHNGQUFzRjtZQUN0RiwyRkFBMkY7WUFDM0Ysa0VBQWtFO1lBQ2xFLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUU7YUFBTTtZQUNMLHdGQUF3RjtZQUN4RixJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFFL0QsV0FBVztnQkFDUCxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFJLGlCQUFpQixTQUFJLFdBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1NBQzdGO1FBRUQsT0FBTztZQUNMLFdBQVcsYUFBQTtZQUNYLGNBQWMsUUFBRSxrQkFBa0IsYUFBbEIsa0JBQWtCLHVCQUFsQixrQkFBa0IsQ0FBRSxPQUFPLG1DQUFJLElBQUk7U0FDcEQsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBQYXRoTWFuaXB1bGF0aW9uLCBSZWFkb25seUZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtwYXJzZVN0YXRlbWVudEZvclVtZE1vZHVsZX0gZnJvbSAnLi4vaG9zdC91bWRfaG9zdCc7XG5pbXBvcnQge3Jlc29sdmVGaWxlV2l0aFBvc3RmaXhlc30gZnJvbSAnLi4vdXRpbHMnO1xuXG5pbXBvcnQge05nY2NDb25maWd1cmF0aW9uLCBOZ2NjRW50cnlQb2ludENvbmZpZ30gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcblxuLyoqXG4gKiBUaGUgcG9zc2libGUgdmFsdWVzIGZvciB0aGUgZm9ybWF0IG9mIGFuIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgdHlwZSBFbnRyeVBvaW50Rm9ybWF0ID0gJ2VzbTUnfCdlc20yMDE1J3wndW1kJ3wnY29tbW9uanMnO1xuXG4vKipcbiAqIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IGFuIGVudHJ5LXBvaW50LCBpbmNsdWRpbmcgcGF0aHNcbiAqIHRvIGVhY2ggb2YgdGhlIHBvc3NpYmxlIGVudHJ5LXBvaW50IGZvcm1hdHMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRW50cnlQb2ludCBleHRlbmRzIEpzb25PYmplY3Qge1xuICAvKiogVGhlIG5hbWUgb2YgdGhlIGVudHJ5LXBvaW50IChlLmcuIGBAYW5ndWxhci9jb3JlYCBvciBgQGFuZ3VsYXIvY29tbW9uL2h0dHBgKS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogVGhlIHBhdGggdG8gdGhpcyBlbnRyeSBwb2ludC4gKi9cbiAgcGF0aDogQWJzb2x1dGVGc1BhdGg7XG4gIC8qKlxuICAgKiBUaGUgbmFtZSBvZiB0aGUgcGFja2FnZSB0aGF0IGNvbnRhaW5zIHRoaXMgZW50cnktcG9pbnQgKGUuZy4gYEBhbmd1bGFyL2NvcmVgIG9yXG4gICAqIGBAYW5ndWxhci9jb21tb25gKS5cbiAgICovXG4gIHBhY2thZ2VOYW1lOiBzdHJpbmc7XG4gIC8qKiBUaGUgcGF0aCB0byB0aGUgcGFja2FnZSB0aGF0IGNvbnRhaW5zIHRoaXMgZW50cnktcG9pbnQuICovXG4gIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aDtcbiAgLyoqIFRoZSBwYXJzZWQgcGFja2FnZS5qc29uIGZpbGUgZm9yIHRoaXMgZW50cnktcG9pbnQuICovXG4gIHBhY2thZ2VKc29uOiBFbnRyeVBvaW50UGFja2FnZUpzb247XG4gIC8qKiBUaGUgcGF0aCB0byBhIHR5cGluZ3MgKC5kLnRzKSBmaWxlIGZvciB0aGlzIGVudHJ5LXBvaW50LiAqL1xuICB0eXBpbmdzOiBBYnNvbHV0ZUZzUGF0aDtcbiAgLyoqIElzIHRoaXMgRW50cnlQb2ludCBjb21waWxlZCB3aXRoIHRoZSBBbmd1bGFyIFZpZXcgRW5naW5lIGNvbXBpbGVyPyAqL1xuICBjb21waWxlZEJ5QW5ndWxhcjogYm9vbGVhbjtcbiAgLyoqIFNob3VsZCBuZ2NjIGlnbm9yZSBtaXNzaW5nIGRlcGVuZGVuY2llcyBhbmQgcHJvY2VzcyB0aGlzIGVudHJ5cG9pbnQgYW55d2F5PyAqL1xuICBpZ25vcmVNaXNzaW5nRGVwZW5kZW5jaWVzOiBib29sZWFuO1xuICAvKiogU2hvdWxkIG5nY2MgZ2VuZXJhdGUgZGVlcCByZS1leHBvcnRzIGZvciB0aGlzIGVudHJ5cG9pbnQ/ICovXG4gIGdlbmVyYXRlRGVlcFJlZXhwb3J0czogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgSnNvblByaW1pdGl2ZSA9IHN0cmluZ3xudW1iZXJ8Ym9vbGVhbnxudWxsO1xuZXhwb3J0IHR5cGUgSnNvblZhbHVlID0gSnNvblByaW1pdGl2ZXxKc29uQXJyYXl8SnNvbk9iamVjdHx1bmRlZmluZWQ7XG5leHBvcnQgaW50ZXJmYWNlIEpzb25BcnJheSBleHRlbmRzIEFycmF5PEpzb25WYWx1ZT4ge31cbmV4cG9ydCBpbnRlcmZhY2UgSnNvbk9iamVjdCB7XG4gIFtrZXk6IHN0cmluZ106IEpzb25WYWx1ZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNNYXAge1xuICBicm93c2VyPzogc3RyaW5nO1xuICBmZXNtMjAxNT86IHN0cmluZztcbiAgZmVzbTU/OiBzdHJpbmc7XG4gIGVzMjAxNT86IHN0cmluZzsgIC8vIGlmIGV4aXN0cyB0aGVuIGl0IGlzIGFjdHVhbGx5IEZFU00yMDE1XG4gIGVzbTIwMTU/OiBzdHJpbmc7XG4gIGVzbTU/OiBzdHJpbmc7XG4gIG1haW4/OiBzdHJpbmc7ICAgICAvLyBVTURcbiAgbW9kdWxlPzogc3RyaW5nOyAgIC8vIGlmIGV4aXN0cyB0aGVuIGl0IGlzIGFjdHVhbGx5IEZFU001XG4gIHR5cGVzPzogc3RyaW5nOyAgICAvLyBTeW5vbnltb3VzIHRvIGB0eXBpbmdzYCBwcm9wZXJ0eSAtIHNlZSBodHRwczovL2JpdC5seS8yT2dXcDJIXG4gIHR5cGluZ3M/OiBzdHJpbmc7ICAvLyBUeXBlU2NyaXB0IC5kLnRzIGZpbGVzXG59XG5cbmV4cG9ydCB0eXBlIFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllcyA9IGtleW9mIFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc01hcDtcblxuLyoqXG4gKiBUaGUgcHJvcGVydGllcyB0aGF0IG1heSBiZSBsb2FkZWQgZnJvbSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnRyeVBvaW50UGFja2FnZUpzb24gZXh0ZW5kcyBKc29uT2JqZWN0LCBQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXNNYXAge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZlcnNpb24/OiBzdHJpbmc7XG4gIHNjcmlwdHM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBfX3Byb2Nlc3NlZF9ieV9pdnlfbmdjY19fPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbn1cblxuZXhwb3J0IHR5cGUgRW50cnlQb2ludEpzb25Qcm9wZXJ0eSA9IEV4Y2x1ZGU8UGFja2FnZUpzb25Gb3JtYXRQcm9wZXJ0aWVzLCAndHlwZXMnfCd0eXBpbmdzJz47XG4vLyBXZSBuZWVkIHRvIGtlZXAgdGhlIGVsZW1lbnRzIG9mIHRoaXMgY29uc3QgYW5kIHRoZSBgRW50cnlQb2ludEpzb25Qcm9wZXJ0eWAgdHlwZSBpbiBzeW5jLlxuZXhwb3J0IGNvbnN0IFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFUzogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdID1cbiAgICBbJ2Zlc20yMDE1JywgJ2Zlc201JywgJ2VzMjAxNScsICdlc20yMDE1JywgJ2VzbTUnLCAnbWFpbicsICdtb2R1bGUnLCAnYnJvd3NlciddO1xuXG5cbi8qKlxuICogVGhlIHBhdGggZG9lcyBub3QgcmVwcmVzZW50IGFuIGVudHJ5LXBvaW50LCBpLmUuIHRoZXJlIGlzIG5vIHBhY2thZ2UuanNvbiBhdCB0aGUgcGF0aCBhbmQgdGhlcmVcbiAqIGlzIG5vIGNvbmZpZyB0byBmb3JjZSBhbiBlbnRyeS1wb2ludC5cbiAqL1xuZXhwb3J0IGNvbnN0IE5PX0VOVFJZX1BPSU5UID0gJ25vLWVudHJ5LXBvaW50JztcblxuLyoqXG4gKiBUaGUgcGF0aCByZXByZXNlbnRzIGFuIGVudHJ5LXBvaW50IHRoYXQgaXMgYGlnbm9yZWRgIGJ5IGFuIG5nY2MgY29uZmlnLlxuICovXG5leHBvcnQgY29uc3QgSUdOT1JFRF9FTlRSWV9QT0lOVCA9ICdpZ25vcmVkLWVudHJ5LXBvaW50JztcblxuLyoqXG4gKiBUaGUgcGF0aCBoYXMgYSBwYWNrYWdlLmpzb24sIGJ1dCBpdCBpcyBub3QgYSB2YWxpZCBlbnRyeS1wb2ludCBmb3IgbmdjYyBwcm9jZXNzaW5nLlxuICovXG5leHBvcnQgY29uc3QgSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UID0gJ2luY29tcGF0aWJsZS1lbnRyeS1wb2ludCc7XG5cbi8qKlxuICogVGhlIHJlc3VsdCBvZiBjYWxsaW5nIGBnZXRFbnRyeVBvaW50SW5mbygpYC5cbiAqXG4gKiBUaGlzIHdpbGwgYmUgYW4gYEVudHJ5UG9pbnRgIG9iamVjdCBpZiBhbiBBbmd1bGFyIGVudHJ5LXBvaW50IHdhcyBpZGVudGlmaWVkO1xuICogT3RoZXJ3aXNlIGl0IHdpbGwgYmUgYSBmbGFnIGluZGljYXRpbmcgb25lIG9mOlxuICogKiBOT19FTlRSWV9QT0lOVCAtIHRoZSBwYXRoIGlzIG5vdCBhbiBlbnRyeS1wb2ludCBvciBuZ2NjIGlzIGNvbmZpZ3VyZWQgdG8gaWdub3JlIGl0XG4gKiAqIElOQ09NUEFUSUJMRV9FTlRSWV9QT0lOVCAtIHRoZSBwYXRoIHdhcyBhIG5vbi1wcm9jZXNzYWJsZSBlbnRyeS1wb2ludCB0aGF0IHNob3VsZCBiZSBzZWFyY2hlZFxuICogZm9yIHN1Yi1lbnRyeS1wb2ludHNcbiAqL1xuZXhwb3J0IHR5cGUgR2V0RW50cnlQb2ludFJlc3VsdCA9XG4gICAgRW50cnlQb2ludHx0eXBlb2YgSUdOT1JFRF9FTlRSWV9QT0lOVHx0eXBlb2YgSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UfHR5cGVvZiBOT19FTlRSWV9QT0lOVDtcblxuXG4vKipcbiAqIFRyeSB0byBjcmVhdGUgYW4gZW50cnktcG9pbnQgZnJvbSB0aGUgZ2l2ZW4gcGF0aHMgYW5kIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHBhY2thZ2VQYXRoIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBjb250YWluaW5nIG5wbSBwYWNrYWdlXG4gKiBAcGFyYW0gZW50cnlQb2ludFBhdGggdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHBvdGVudGlhbCBlbnRyeS1wb2ludC5cbiAqIEByZXR1cm5zXG4gKiAtIEFuIGVudHJ5LXBvaW50IGlmIGl0IGlzIHZhbGlkIGFuZCBub3QgaWdub3JlZC5cbiAqIC0gYE5PX0VOVFJZX1BPSU5UYCB3aGVuIHRoZXJlIGlzIG5vIHBhY2thZ2UuanNvbiBhdCB0aGUgcGF0aCBhbmQgdGhlcmUgaXMgbm8gY29uZmlnIHRvIGZvcmNlIGFuXG4gKiAgIGVudHJ5LXBvaW50LFxuICogLSBgSUdOT1JFRF9FTlRSWV9QT0lOVGAgd2hlbiB0aGUgZW50cnktcG9pbnQgaXMgaWdub3JlZCBieSBhbiBuZ2NjIGNvbmZpZy5cbiAqIC0gYElOQ09NUEFUSUJMRV9FTlRSWV9QT0lOVGAgd2hlbiB0aGVyZSBpcyBhIHBhY2thZ2UuanNvbiBidXQgaXQgaXMgbm90IGEgdmFsaWQgQW5ndWxhciBjb21waWxlZFxuICogICBlbnRyeS1wb2ludC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudHJ5UG9pbnRJbmZvKFxuICAgIGZzOiBSZWFkb25seUZpbGVTeXN0ZW0sIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sIGxvZ2dlcjogTG9nZ2VyLCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgZW50cnlQb2ludFBhdGg6IEFic29sdXRlRnNQYXRoKTogR2V0RW50cnlQb2ludFJlc3VsdCB7XG4gIGNvbnN0IHBhY2thZ2VQYWNrYWdlSnNvblBhdGggPSBmcy5yZXNvbHZlKHBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIGNvbnN0IGVudHJ5UG9pbnRQYWNrYWdlSnNvblBhdGggPSBmcy5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIGNvbnN0IGxvYWRlZFBhY2thZ2VQYWNrYWdlSnNvbiA9IGxvYWRQYWNrYWdlSnNvbihmcywgcGFja2FnZVBhY2thZ2VKc29uUGF0aCk7XG4gIGNvbnN0IGxvYWRlZEVudHJ5UG9pbnRQYWNrYWdlSnNvbiA9IChwYWNrYWdlUGFja2FnZUpzb25QYXRoID09PSBlbnRyeVBvaW50UGFja2FnZUpzb25QYXRoKSA/XG4gICAgICBsb2FkZWRQYWNrYWdlUGFja2FnZUpzb24gOlxuICAgICAgbG9hZFBhY2thZ2VKc29uKGZzLCBlbnRyeVBvaW50UGFja2FnZUpzb25QYXRoKTtcbiAgY29uc3Qge3BhY2thZ2VOYW1lLCBwYWNrYWdlVmVyc2lvbn0gPSBnZXRQYWNrYWdlTmFtZUFuZFZlcnNpb24oXG4gICAgICBmcywgcGFja2FnZVBhdGgsIGxvYWRlZFBhY2thZ2VQYWNrYWdlSnNvbiwgbG9hZGVkRW50cnlQb2ludFBhY2thZ2VKc29uKTtcblxuICBjb25zdCBwYWNrYWdlQ29uZmlnID0gY29uZmlnLmdldFBhY2thZ2VDb25maWcocGFja2FnZU5hbWUsIHBhY2thZ2VQYXRoLCBwYWNrYWdlVmVyc2lvbik7XG4gIGNvbnN0IGVudHJ5UG9pbnRDb25maWcgPSBwYWNrYWdlQ29uZmlnLmVudHJ5UG9pbnRzLmdldChlbnRyeVBvaW50UGF0aCk7XG4gIGxldCBlbnRyeVBvaW50UGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcblxuICBpZiAoZW50cnlQb2ludENvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKCFmcy5leGlzdHMoZW50cnlQb2ludFBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICAgIC8vIE5vIGBwYWNrYWdlLmpzb25gIGFuZCBubyBjb25maWcuXG4gICAgICByZXR1cm4gTk9fRU5UUllfUE9JTlQ7XG4gICAgfSBlbHNlIGlmIChsb2FkZWRFbnRyeVBvaW50UGFja2FnZUpzb24gPT09IG51bGwpIHtcbiAgICAgIC8vIGBwYWNrYWdlLmpzb25gIGV4aXN0cyBidXQgY291bGQgbm90IGJlIHBhcnNlZCBhbmQgdGhlcmUgaXMgbm8gcmVkZWVtaW5nIGNvbmZpZy5cbiAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gcmVhZCBlbnRyeSBwb2ludCBpbmZvIGZyb20gaW52YWxpZCAncGFja2FnZS5qc29uJyBmaWxlOiAke1xuICAgICAgICAgIGVudHJ5UG9pbnRQYWNrYWdlSnNvblBhdGh9YCk7XG5cbiAgICAgIHJldHVybiBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudHJ5UG9pbnRQYWNrYWdlSnNvbiA9IGxvYWRlZEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZW50cnlQb2ludENvbmZpZy5pZ25vcmUgPT09IHRydWUpIHtcbiAgICAvLyBFeHBsaWNpdGx5IGlnbm9yZWQgZW50cnktcG9pbnQuXG4gICAgcmV0dXJuIElHTk9SRURfRU5UUllfUE9JTlQ7XG4gIH0gZWxzZSB7XG4gICAgZW50cnlQb2ludFBhY2thZ2VKc29uID0gbWVyZ2VDb25maWdBbmRQYWNrYWdlSnNvbihcbiAgICAgICAgZnMsIGxvYWRlZEVudHJ5UG9pbnRQYWNrYWdlSnNvbiwgZW50cnlQb2ludENvbmZpZywgcGFja2FnZVBhdGgsIGVudHJ5UG9pbnRQYXRoKTtcbiAgfVxuXG4gIGNvbnN0IHR5cGluZ3MgPSBlbnRyeVBvaW50UGFja2FnZUpzb24udHlwaW5ncyB8fCBlbnRyeVBvaW50UGFja2FnZUpzb24udHlwZXMgfHxcbiAgICAgIGd1ZXNzVHlwaW5nc0Zyb21QYWNrYWdlSnNvbihmcywgZW50cnlQb2ludFBhdGgsIGVudHJ5UG9pbnRQYWNrYWdlSnNvbik7XG4gIGlmICh0eXBlb2YgdHlwaW5ncyAhPT0gJ3N0cmluZycpIHtcbiAgICAvLyBNaXNzaW5nIHRoZSByZXF1aXJlZCBgdHlwaW5nc2AgcHJvcGVydHlcbiAgICByZXR1cm4gSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UO1xuICB9XG5cbiAgLy8gQW4gZW50cnktcG9pbnQgaXMgYXNzdW1lZCB0byBiZSBjb21waWxlZCBieSBBbmd1bGFyIGlmIHRoZXJlIGlzIGVpdGhlcjpcbiAgLy8gKiBhIGBtZXRhZGF0YS5qc29uYCBmaWxlIG5leHQgdG8gdGhlIHR5cGluZ3MgZW50cnktcG9pbnRcbiAgLy8gKiBhIGN1c3RvbSBjb25maWcgZm9yIHRoaXMgZW50cnktcG9pbnRcbiAgY29uc3QgbWV0YWRhdGFQYXRoID1cbiAgICAgIGZzLnJlc29sdmUoZW50cnlQb2ludFBhdGgsIHR5cGluZ3MucmVwbGFjZSgvXFwuZFxcLnRzJC8sICcnKSArICcubWV0YWRhdGEuanNvbicpO1xuICBjb25zdCBjb21waWxlZEJ5QW5ndWxhciA9IGVudHJ5UG9pbnRDb25maWcgIT09IHVuZGVmaW5lZCB8fCBmcy5leGlzdHMobWV0YWRhdGFQYXRoKTtcblxuICBjb25zdCBlbnRyeVBvaW50SW5mbzogRW50cnlQb2ludCA9IHtcbiAgICBuYW1lOiBlbnRyeVBvaW50UGFja2FnZUpzb24ubmFtZSxcbiAgICBwYXRoOiBlbnRyeVBvaW50UGF0aCxcbiAgICBwYWNrYWdlTmFtZSxcbiAgICBwYWNrYWdlUGF0aCxcbiAgICBwYWNrYWdlSnNvbjogZW50cnlQb2ludFBhY2thZ2VKc29uLFxuICAgIHR5cGluZ3M6IGZzLnJlc29sdmUoZW50cnlQb2ludFBhdGgsIHR5cGluZ3MpLFxuICAgIGNvbXBpbGVkQnlBbmd1bGFyLFxuICAgIGlnbm9yZU1pc3NpbmdEZXBlbmRlbmNpZXM6XG4gICAgICAgIGVudHJ5UG9pbnRDb25maWcgIT09IHVuZGVmaW5lZCA/ICEhZW50cnlQb2ludENvbmZpZy5pZ25vcmVNaXNzaW5nRGVwZW5kZW5jaWVzIDogZmFsc2UsXG4gICAgZ2VuZXJhdGVEZWVwUmVleHBvcnRzOlxuICAgICAgICBlbnRyeVBvaW50Q29uZmlnICE9PSB1bmRlZmluZWQgPyAhIWVudHJ5UG9pbnRDb25maWcuZ2VuZXJhdGVEZWVwUmVleHBvcnRzIDogZmFsc2UsXG4gIH07XG5cbiAgcmV0dXJuIGVudHJ5UG9pbnRJbmZvO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFbnRyeVBvaW50KHJlc3VsdDogR2V0RW50cnlQb2ludFJlc3VsdCk6IHJlc3VsdCBpcyBFbnRyeVBvaW50IHtcbiAgcmV0dXJuIHJlc3VsdCAhPT0gTk9fRU5UUllfUE9JTlQgJiYgcmVzdWx0ICE9PSBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQgJiZcbiAgICAgIHJlc3VsdCAhPT0gSUdOT1JFRF9FTlRSWV9QT0lOVDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcGFja2FnZS5qc29uIHByb3BlcnR5IGludG8gYW4gZW50cnktcG9pbnQgZm9ybWF0LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY29udmVydCB0byBhIGZvcm1hdC5cbiAqIEByZXR1cm5zIEFuIGVudHJ5LXBvaW50IGZvcm1hdCBvciBgdW5kZWZpbmVkYCBpZiBub25lIG1hdGNoIHRoZSBnaXZlbiBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudHJ5UG9pbnRGb3JtYXQoXG4gICAgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgZW50cnlQb2ludDogRW50cnlQb2ludCxcbiAgICBwcm9wZXJ0eTogRW50cnlQb2ludEpzb25Qcm9wZXJ0eSk6IEVudHJ5UG9pbnRGb3JtYXR8dW5kZWZpbmVkIHtcbiAgc3dpdGNoIChwcm9wZXJ0eSkge1xuICAgIGNhc2UgJ2Zlc20yMDE1JzpcbiAgICAgIHJldHVybiAnZXNtMjAxNSc7XG4gICAgY2FzZSAnZmVzbTUnOlxuICAgICAgcmV0dXJuICdlc201JztcbiAgICBjYXNlICdlczIwMTUnOlxuICAgICAgcmV0dXJuICdlc20yMDE1JztcbiAgICBjYXNlICdlc20yMDE1JzpcbiAgICAgIHJldHVybiAnZXNtMjAxNSc7XG4gICAgY2FzZSAnZXNtNSc6XG4gICAgICByZXR1cm4gJ2VzbTUnO1xuICAgIGNhc2UgJ2Jyb3dzZXInOlxuICAgICAgY29uc3QgYnJvd3NlckZpbGUgPSBlbnRyeVBvaW50LnBhY2thZ2VKc29uWydicm93c2VyJ107XG4gICAgICBpZiAodHlwZW9mIGJyb3dzZXJGaWxlICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNuaWZmTW9kdWxlRm9ybWF0KGZzLCBmcy5qb2luKGVudHJ5UG9pbnQucGF0aCwgYnJvd3NlckZpbGUpKTtcbiAgICBjYXNlICdtYWluJzpcbiAgICAgIGNvbnN0IG1haW5GaWxlID0gZW50cnlQb2ludC5wYWNrYWdlSnNvblsnbWFpbiddO1xuICAgICAgaWYgKG1haW5GaWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbmlmZk1vZHVsZUZvcm1hdChmcywgZnMuam9pbihlbnRyeVBvaW50LnBhdGgsIG1haW5GaWxlKSk7XG4gICAgY2FzZSAnbW9kdWxlJzpcbiAgICAgIGNvbnN0IG1vZHVsZUZpbGVQYXRoID0gZW50cnlQb2ludC5wYWNrYWdlSnNvblsnbW9kdWxlJ107XG4gICAgICAvLyBBcyBvZiB2ZXJzaW9uIDEwLCB0aGUgYG1vZHVsZWAgcHJvcGVydHkgaW4gYHBhY2thZ2UuanNvbmAgc2hvdWxkIHBvaW50IHRvXG4gICAgICAvLyB0aGUgRVNNMjAxNSBmb3JtYXQgb3V0cHV0IGFzIHBlciBBbmd1bGFyIFBhY2thZ2UgZm9ybWF0IHNwZWNpZmljYXRpb24uIFRoaXNcbiAgICAgIC8vIG1lYW5zIHRoYXQgdGhlIGBtb2R1bGVgIHByb3BlcnR5IGNhcHR1cmVzIG11bHRpcGxlIGZvcm1hdHMsIGFzIG9sZCBsaWJyYXJpZXNcbiAgICAgIC8vIGJ1aWx0IHdpdGggdGhlIG9sZCBBUEYgY2FuIHN0aWxsIGJlIHByb2Nlc3NlZC4gV2UgZGV0ZWN0IHRoZSBmb3JtYXQgYnkgY2hlY2tpbmdcbiAgICAgIC8vIHRoZSBwYXRocyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHBlciBBUEYgc3BlY2lmaWNhdGlvbi5cbiAgICAgIGlmICh0eXBlb2YgbW9kdWxlRmlsZVBhdGggPT09ICdzdHJpbmcnICYmIG1vZHVsZUZpbGVQYXRoLmluY2x1ZGVzKCdlc20yMDE1JykpIHtcbiAgICAgICAgcmV0dXJuIGBlc20yMDE1YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZXNtNSc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgSlNPTiBmcm9tIGEgYHBhY2thZ2UuanNvbmAgZmlsZS5cbiAqIEBwYXJhbSBwYWNrYWdlSnNvblBhdGggdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuXG4gKiBAcmV0dXJucyBKU09OIGZyb20gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUgaWYgaXQgaXMgdmFsaWQsIGBudWxsYCBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGxvYWRQYWNrYWdlSnNvbihcbiAgICBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBwYWNrYWdlSnNvblBhdGg6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFBhY2thZ2VKc29ufG51bGwge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlKHBhY2thZ2VKc29uUGF0aCkpIGFzIEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc25pZmZNb2R1bGVGb3JtYXQoXG4gICAgZnM6IFJlYWRvbmx5RmlsZVN5c3RlbSwgc291cmNlRmlsZVBhdGg6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludEZvcm1hdHx1bmRlZmluZWQge1xuICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlRmlsZVdpdGhQb3N0Zml4ZXMoZnMsIHNvdXJjZUZpbGVQYXRoLCBbJycsICcuanMnLCAnL2luZGV4LmpzJ10pO1xuICBpZiAocmVzb2x2ZWRQYXRoID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGNvbnN0IHNvdXJjZUZpbGUgPVxuICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShzb3VyY2VGaWxlUGF0aCwgZnMucmVhZEZpbGUocmVzb2x2ZWRQYXRoKSwgdHMuU2NyaXB0VGFyZ2V0LkVTNSk7XG4gIGlmIChzb3VyY2VGaWxlLnN0YXRlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBpZiAodHMuaXNFeHRlcm5hbE1vZHVsZShzb3VyY2VGaWxlKSkge1xuICAgIHJldHVybiAnZXNtNSc7XG4gIH0gZWxzZSBpZiAocGFyc2VTdGF0ZW1lbnRGb3JVbWRNb2R1bGUoc291cmNlRmlsZS5zdGF0ZW1lbnRzWzBdKSAhPT0gbnVsbCkge1xuICAgIHJldHVybiAndW1kJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ2NvbW1vbmpzJztcbiAgfVxufVxuXG5mdW5jdGlvbiBtZXJnZUNvbmZpZ0FuZFBhY2thZ2VKc29uKFxuICAgIGZzOiBQYXRoTWFuaXB1bGF0aW9uLCBlbnRyeVBvaW50UGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbnxudWxsLFxuICAgIGVudHJ5UG9pbnRDb25maWc6IE5nY2NFbnRyeVBvaW50Q29uZmlnLCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgZW50cnlQb2ludFBhdGg6IEFic29sdXRlRnNQYXRoKTogRW50cnlQb2ludFBhY2thZ2VKc29uIHtcbiAgaWYgKGVudHJ5UG9pbnRQYWNrYWdlSnNvbiAhPT0gbnVsbCkge1xuICAgIHJldHVybiB7Li4uZW50cnlQb2ludFBhY2thZ2VKc29uLCAuLi5lbnRyeVBvaW50Q29uZmlnLm92ZXJyaWRlfTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBuYW1lID0gYCR7ZnMuYmFzZW5hbWUocGFja2FnZVBhdGgpfS8ke2ZzLnJlbGF0aXZlKHBhY2thZ2VQYXRoLCBlbnRyeVBvaW50UGF0aCl9YDtcbiAgICByZXR1cm4ge25hbWUsIC4uLmVudHJ5UG9pbnRDb25maWcub3ZlcnJpZGV9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGd1ZXNzVHlwaW5nc0Zyb21QYWNrYWdlSnNvbihcbiAgICBmczogUmVhZG9ubHlGaWxlU3lzdGVtLCBlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgZW50cnlQb2ludFBhY2thZ2VKc29uOiBFbnRyeVBvaW50UGFja2FnZUpzb24pOiBBYnNvbHV0ZUZzUGF0aHxudWxsIHtcbiAgZm9yIChjb25zdCBwcm9wIG9mIFNVUFBPUlRFRF9GT1JNQVRfUFJPUEVSVElFUykge1xuICAgIGNvbnN0IGZpZWxkID0gZW50cnlQb2ludFBhY2thZ2VKc29uW3Byb3BdO1xuICAgIGlmICh0eXBlb2YgZmllbGQgIT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBTb21lIGNyYXp5IHBhY2thZ2VzIGhhdmUgdGhpbmdzIGxpa2UgYXJyYXlzIGluIHRoZXNlIGZpZWxkcyFcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCByZWxhdGl2ZVR5cGluZ3NQYXRoID0gZmllbGQucmVwbGFjZSgvXFwuanMkLywgJy5kLnRzJyk7XG4gICAgY29uc3QgdHlwaW5nc1BhdGggPSBmcy5yZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCByZWxhdGl2ZVR5cGluZ3NQYXRoKTtcbiAgICBpZiAoZnMuZXhpc3RzKHR5cGluZ3NQYXRoKSkge1xuICAgICAgcmV0dXJuIHR5cGluZ3NQYXRoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqXG4gKiBGaW5kIG9yIGluZmVyIHRoZSBuYW1lIGFuZCB2ZXJzaW9uIG9mIGEgcGFja2FnZS5cbiAqXG4gKiAtIFRoZSBuYW1lIGlzIGNvbXB1dGVkIGJhc2VkIG9uIHRoZSBgbmFtZWAgcHJvcGVydHkgb2YgdGhlIHBhY2thZ2UncyBvciB0aGUgZW50cnktcG9pbnQnc1xuICogICBgcGFja2FnZS5qc29uYCBmaWxlIChpZiBhdmFpbGFibGUpIG9yIGluZmVycmVkIGZyb20gdGhlIHBhY2thZ2UncyBwYXRoLlxuICogLSBUaGUgdmVyc2lvbiBpcyByZWFkIG9mZiBvZiB0aGUgYHZlcnNpb25gIHByb3BlcnR5IG9mIHRoZSBwYWNrYWdlJ3MgYHBhY2thZ2UuanNvbmAgZmlsZSAoaWZcbiAqICAgYXZhaWxhYmxlKS5cbiAqXG4gKiBAcGFyYW0gZnMgVGhlIGZpbGUtc3lzdGVtIHRvIHVzZSBmb3IgcHJvY2Vzc2luZyBgcGFja2FnZVBhdGhgLlxuICogQHBhcmFtIHBhY2thZ2VQYXRoIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBwYWNrYWdlLlxuICogQHBhcmFtIHBhY2thZ2VQYWNrYWdlSnNvbiB0aGUgcGFyc2VkIGBwYWNrYWdlLmpzb25gIG9mIHRoZSBwYWNrYWdlIChpZiBhdmFpbGFibGUpLlxuICogQHBhcmFtIGVudHJ5UG9pbnRQYWNrYWdlSnNvbiB0aGUgcGFyc2VkIGBwYWNrYWdlLmpzb25gIG9mIGFuIGVudHJ5LXBvaW50IChpZiBhdmFpbGFibGUpLlxuICogQHJldHVybnMgdGhlIGNvbXB1dGVkIG5hbWUgYW5kIHZlcnNpb24gb2YgdGhlIHBhY2thZ2UuXG4gKi9cbmZ1bmN0aW9uIGdldFBhY2thZ2VOYW1lQW5kVmVyc2lvbihcbiAgICBmczogUGF0aE1hbmlwdWxhdGlvbiwgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLFxuICAgIHBhY2thZ2VQYWNrYWdlSnNvbjogRW50cnlQb2ludFBhY2thZ2VKc29ufG51bGwsXG4gICAgZW50cnlQb2ludFBhY2thZ2VKc29uOiBFbnRyeVBvaW50UGFja2FnZUpzb258XG4gICAgbnVsbCk6IHtwYWNrYWdlTmFtZTogc3RyaW5nLCBwYWNrYWdlVmVyc2lvbjogc3RyaW5nfG51bGx9IHtcbiAgbGV0IHBhY2thZ2VOYW1lOiBzdHJpbmc7XG5cbiAgaWYgKHBhY2thZ2VQYWNrYWdlSnNvbiAhPT0gbnVsbCkge1xuICAgIC8vIFdlIGhhdmUgYSB2YWxpZCBgcGFja2FnZS5qc29uYCBmb3IgdGhlIHBhY2thZ2U6IEdldCB0aGUgcGFja2FnZSBuYW1lIGZyb20gdGhhdC5cbiAgICBwYWNrYWdlTmFtZSA9IHBhY2thZ2VQYWNrYWdlSnNvbi5uYW1lO1xuICB9IGVsc2UgaWYgKGVudHJ5UG9pbnRQYWNrYWdlSnNvbiAhPT0gbnVsbCkge1xuICAgIC8vIFdlIGhhdmUgYSB2YWxpZCBgcGFja2FnZS5qc29uYCBmb3IgdGhlIGVudHJ5LXBvaW50OiBHZXQgdGhlIHBhY2thZ2UgbmFtZSBmcm9tIHRoYXQuXG4gICAgLy8gVGhpcyBtaWdodCBiZSBhIHNlY29uZGFyeSBlbnRyeS1wb2ludCwgc28gbWFrZSBzdXJlIHdlIG9ubHkga2VlcCB0aGUgbWFpbiBwYWNrYWdlJ3MgbmFtZVxuICAgIC8vIChlLmcuIG9ubHkga2VlcCBgQGFuZ3VsYXIvY29tbW9uYCBmcm9tIGBAYW5ndWxhci9jb21tb24vaHR0cGApLlxuICAgIHBhY2thZ2VOYW1lID0gL14oPzpAW14vXStcXC8pP1teL10qLy5leGVjKGVudHJ5UG9pbnRQYWNrYWdlSnNvbi5uYW1lKSFbMF07XG4gIH0gZWxzZSB7XG4gICAgLy8gV2UgZG9uJ3QgaGF2ZSBhIHZhbGlkIGBwYWNrYWdlLmpzb25gOiBJbmZlciB0aGUgcGFja2FnZSBuYW1lIGZyb20gdGhlIHBhY2thZ2UncyBwYXRoLlxuICAgIGNvbnN0IGxhc3RTZWdtZW50ID0gZnMuYmFzZW5hbWUocGFja2FnZVBhdGgpO1xuICAgIGNvbnN0IHNlY29uZExhc3RTZWdtZW50ID0gZnMuYmFzZW5hbWUoZnMuZGlybmFtZShwYWNrYWdlUGF0aCkpO1xuXG4gICAgcGFja2FnZU5hbWUgPVxuICAgICAgICBzZWNvbmRMYXN0U2VnbWVudC5zdGFydHNXaXRoKCdAJykgPyBgJHtzZWNvbmRMYXN0U2VnbWVudH0vJHtsYXN0U2VnbWVudH1gIDogbGFzdFNlZ21lbnQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhY2thZ2VOYW1lLFxuICAgIHBhY2thZ2VWZXJzaW9uOiBwYWNrYWdlUGFja2FnZUpzb24/LnZlcnNpb24gPz8gbnVsbCxcbiAgfTtcbn1cbiJdfQ==