(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/entry_point", ["require", "exports", "tslib", "canonical-path", "path", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/host/umd_host", "@angular/compiler-cli/ngcc/src/utils"], factory);
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
    var canonical_path_1 = require("canonical-path");
    var path_1 = require("path");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
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
        var packagePackageJsonPath = file_system_1.resolve(packagePath, 'package.json');
        var entryPointPackageJsonPath = file_system_1.resolve(entryPointPath, 'package.json');
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
            entryPointPackageJson = mergeConfigAndPackageJson(loadedEntryPointPackageJson, entryPointConfig, packagePath, entryPointPath);
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
        var metadataPath = file_system_1.resolve(entryPointPath, typings.replace(/\.d\.ts$/, '') + '.metadata.json');
        var compiledByAngular = entryPointConfig !== undefined || fs.exists(metadataPath);
        var entryPointInfo = {
            name: entryPointPackageJson.name,
            path: entryPointPath,
            packageName: packageName,
            packagePath: packagePath,
            packageJson: entryPointPackageJson,
            typings: file_system_1.resolve(entryPointPath, typings),
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
                return sniffModuleFormat(fs, file_system_1.join(entryPoint.path, browserFile));
            case 'main':
                var mainFile = entryPoint.packageJson['main'];
                if (mainFile === undefined) {
                    return undefined;
                }
                return sniffModuleFormat(fs, file_system_1.join(entryPoint.path, mainFile));
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
    function mergeConfigAndPackageJson(entryPointPackageJson, entryPointConfig, packagePath, entryPointPath) {
        if (entryPointPackageJson !== null) {
            return tslib_1.__assign(tslib_1.__assign({}, entryPointPackageJson), entryPointConfig.override);
        }
        else {
            var name = path_1.basename(packagePath) + "/" + canonical_path_1.relative(packagePath, entryPointPath);
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
                var typingsPath = file_system_1.resolve(entryPointPath, relativeTypingsPath);
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
     * @param fs The `FileSystem` instance to use for parsing `packagePath` (if needed).
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvZW50cnlfcG9pbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILGlEQUF3QztJQUN4Qyw2QkFBOEI7SUFDOUIsK0JBQWlDO0lBRWpDLDJFQUF5RjtJQUV6Rix5RUFBNEQ7SUFDNUQsOERBQWtEO0lBc0VsRCw0RkFBNEY7SUFDL0UsUUFBQSwyQkFBMkIsR0FDcEMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFHcEY7OztPQUdHO0lBQ1UsUUFBQSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFL0M7O09BRUc7SUFDVSxRQUFBLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0lBRXpEOztPQUVHO0lBQ1UsUUFBQSx3QkFBd0IsR0FBRywwQkFBMEIsQ0FBQztJQWVuRTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFnQixpQkFBaUIsQ0FDN0IsRUFBYyxFQUFFLE1BQXlCLEVBQUUsTUFBYyxFQUFFLFdBQTJCLEVBQ3RGLGNBQThCO1FBQ2hDLElBQU0sc0JBQXNCLEdBQUcscUJBQU8sQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDcEUsSUFBTSx5QkFBeUIsR0FBRyxxQkFBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUMxRSxJQUFNLHdCQUF3QixHQUFHLGVBQWUsQ0FBQyxFQUFFLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztRQUM3RSxJQUFNLDJCQUEyQixHQUFHLENBQUMsc0JBQXNCLEtBQUsseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLHdCQUF3QixDQUFDLENBQUM7WUFD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QixDQUFDO1FBRXhCLElBQUksa0JBQWtCLEtBQUssSUFBSSxFQUFFO1lBQy9CLGtGQUFrRjtZQUNsRixXQUFXLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDO1NBQ3ZDO2FBQU0sSUFBSSxxQkFBcUIsS0FBSyxJQUFJLEVBQUU7WUFDekMsc0ZBQXNGO1lBQ3RGLDJGQUEyRjtZQUMzRixrRUFBa0U7WUFDbEUsV0FBVyxHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxRTthQUFNO1lBQ0wsd0ZBQXdGO1lBQ3hGLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0MsSUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUUvRCxXQUFXO2dCQUNQLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUksaUJBQWlCLFNBQUksV0FBYSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7U0FDN0Y7UUFFRCxPQUFPO1lBQ0wsV0FBVyxhQUFBO1lBQ1gsY0FBYyxRQUFFLGtCQUFrQixhQUFsQixrQkFBa0IsdUJBQWxCLGtCQUFrQixDQUFFLE9BQU8sbUNBQUksSUFBSTtTQUNwRCxDQUFDO0lBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWxhdGl2ZX0gZnJvbSAnY2Fub25pY2FsLXBhdGgnO1xuaW1wb3J0IHtiYXNlbmFtZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtBYnNvbHV0ZUZzUGF0aCwgRmlsZVN5c3RlbSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5pbXBvcnQge3BhcnNlU3RhdGVtZW50Rm9yVW1kTW9kdWxlfSBmcm9tICcuLi9ob3N0L3VtZF9ob3N0JztcbmltcG9ydCB7cmVzb2x2ZUZpbGVXaXRoUG9zdGZpeGVzfSBmcm9tICcuLi91dGlscyc7XG5cbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb24sIE5nY2NFbnRyeVBvaW50Q29uZmlnfSBmcm9tICcuL2NvbmZpZ3VyYXRpb24nO1xuXG4vKipcbiAqIFRoZSBwb3NzaWJsZSB2YWx1ZXMgZm9yIHRoZSBmb3JtYXQgb2YgYW4gZW50cnktcG9pbnQuXG4gKi9cbmV4cG9ydCB0eXBlIEVudHJ5UG9pbnRGb3JtYXQgPSAnZXNtNSd8J2VzbTIwMTUnfCd1bWQnfCdjb21tb25qcyc7XG5cbi8qKlxuICogQW4gb2JqZWN0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgYW4gZW50cnktcG9pbnQsIGluY2x1ZGluZyBwYXRoc1xuICogdG8gZWFjaCBvZiB0aGUgcG9zc2libGUgZW50cnktcG9pbnQgZm9ybWF0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBFbnRyeVBvaW50IGV4dGVuZHMgSnNvbk9iamVjdCB7XG4gIC8qKiBUaGUgbmFtZSBvZiB0aGUgZW50cnktcG9pbnQgKGUuZy4gYEBhbmd1bGFyL2NvcmVgIG9yIGBAYW5ndWxhci9jb21tb24vaHR0cGApLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBUaGUgcGF0aCB0byB0aGlzIGVudHJ5IHBvaW50LiAqL1xuICBwYXRoOiBBYnNvbHV0ZUZzUGF0aDtcbiAgLyoqXG4gICAqIFRoZSBuYW1lIG9mIHRoZSBwYWNrYWdlIHRoYXQgY29udGFpbnMgdGhpcyBlbnRyeS1wb2ludCAoZS5nLiBgQGFuZ3VsYXIvY29yZWAgb3JcbiAgICogYEBhbmd1bGFyL2NvbW1vbmApLlxuICAgKi9cbiAgcGFja2FnZU5hbWU6IHN0cmluZztcbiAgLyoqIFRoZSBwYXRoIHRvIHRoZSBwYWNrYWdlIHRoYXQgY29udGFpbnMgdGhpcyBlbnRyeS1wb2ludC4gKi9cbiAgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoO1xuICAvKiogVGhlIHBhcnNlZCBwYWNrYWdlLmpzb24gZmlsZSBmb3IgdGhpcyBlbnRyeS1wb2ludC4gKi9cbiAgcGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcbiAgLyoqIFRoZSBwYXRoIHRvIGEgdHlwaW5ncyAoLmQudHMpIGZpbGUgZm9yIHRoaXMgZW50cnktcG9pbnQuICovXG4gIHR5cGluZ3M6IEFic29sdXRlRnNQYXRoO1xuICAvKiogSXMgdGhpcyBFbnRyeVBvaW50IGNvbXBpbGVkIHdpdGggdGhlIEFuZ3VsYXIgVmlldyBFbmdpbmUgY29tcGlsZXI/ICovXG4gIGNvbXBpbGVkQnlBbmd1bGFyOiBib29sZWFuO1xuICAvKiogU2hvdWxkIG5nY2MgaWdub3JlIG1pc3NpbmcgZGVwZW5kZW5jaWVzIGFuZCBwcm9jZXNzIHRoaXMgZW50cnlwb2ludCBhbnl3YXk/ICovXG4gIGlnbm9yZU1pc3NpbmdEZXBlbmRlbmNpZXM6IGJvb2xlYW47XG4gIC8qKiBTaG91bGQgbmdjYyBnZW5lcmF0ZSBkZWVwIHJlLWV4cG9ydHMgZm9yIHRoaXMgZW50cnlwb2ludD8gKi9cbiAgZ2VuZXJhdGVEZWVwUmVleHBvcnRzOiBib29sZWFuO1xufVxuXG5leHBvcnQgdHlwZSBKc29uUHJpbWl0aXZlID0gc3RyaW5nfG51bWJlcnxib29sZWFufG51bGw7XG5leHBvcnQgdHlwZSBKc29uVmFsdWUgPSBKc29uUHJpbWl0aXZlfEpzb25BcnJheXxKc29uT2JqZWN0fHVuZGVmaW5lZDtcbmV4cG9ydCBpbnRlcmZhY2UgSnNvbkFycmF5IGV4dGVuZHMgQXJyYXk8SnNvblZhbHVlPiB7fVxuZXhwb3J0IGludGVyZmFjZSBKc29uT2JqZWN0IHtcbiAgW2tleTogc3RyaW5nXTogSnNvblZhbHVlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc01hcCB7XG4gIGJyb3dzZXI/OiBzdHJpbmc7XG4gIGZlc20yMDE1Pzogc3RyaW5nO1xuICBmZXNtNT86IHN0cmluZztcbiAgZXMyMDE1Pzogc3RyaW5nOyAgLy8gaWYgZXhpc3RzIHRoZW4gaXQgaXMgYWN0dWFsbHkgRkVTTTIwMTVcbiAgZXNtMjAxNT86IHN0cmluZztcbiAgZXNtNT86IHN0cmluZztcbiAgbWFpbj86IHN0cmluZzsgICAgIC8vIFVNRFxuICBtb2R1bGU/OiBzdHJpbmc7ICAgLy8gaWYgZXhpc3RzIHRoZW4gaXQgaXMgYWN0dWFsbHkgRkVTTTVcbiAgdHlwZXM/OiBzdHJpbmc7ICAgIC8vIFN5bm9ueW1vdXMgdG8gYHR5cGluZ3NgIHByb3BlcnR5IC0gc2VlIGh0dHBzOi8vYml0Lmx5LzJPZ1dwMkhcbiAgdHlwaW5ncz86IHN0cmluZzsgIC8vIFR5cGVTY3JpcHQgLmQudHMgZmlsZXNcbn1cblxuZXhwb3J0IHR5cGUgUGFja2FnZUpzb25Gb3JtYXRQcm9wZXJ0aWVzID0ga2V5b2YgUGFja2FnZUpzb25Gb3JtYXRQcm9wZXJ0aWVzTWFwO1xuXG4vKipcbiAqIFRoZSBwcm9wZXJ0aWVzIHRoYXQgbWF5IGJlIGxvYWRlZCBmcm9tIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVudHJ5UG9pbnRQYWNrYWdlSnNvbiBleHRlbmRzIEpzb25PYmplY3QsIFBhY2thZ2VKc29uRm9ybWF0UHJvcGVydGllc01hcCB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmVyc2lvbj86IHN0cmluZztcbiAgc2NyaXB0cz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gIF9fcHJvY2Vzc2VkX2J5X2l2eV9uZ2NjX18/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5leHBvcnQgdHlwZSBFbnRyeVBvaW50SnNvblByb3BlcnR5ID0gRXhjbHVkZTxQYWNrYWdlSnNvbkZvcm1hdFByb3BlcnRpZXMsICd0eXBlcyd8J3R5cGluZ3MnPjtcbi8vIFdlIG5lZWQgdG8ga2VlcCB0aGUgZWxlbWVudHMgb2YgdGhpcyBjb25zdCBhbmQgdGhlIGBFbnRyeVBvaW50SnNvblByb3BlcnR5YCB0eXBlIGluIHN5bmMuXG5leHBvcnQgY29uc3QgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTOiBFbnRyeVBvaW50SnNvblByb3BlcnR5W10gPVxuICAgIFsnZmVzbTIwMTUnLCAnZmVzbTUnLCAnZXMyMDE1JywgJ2VzbTIwMTUnLCAnZXNtNScsICdtYWluJywgJ21vZHVsZScsICdicm93c2VyJ107XG5cblxuLyoqXG4gKiBUaGUgcGF0aCBkb2VzIG5vdCByZXByZXNlbnQgYW4gZW50cnktcG9pbnQsIGkuZS4gdGhlcmUgaXMgbm8gcGFja2FnZS5qc29uIGF0IHRoZSBwYXRoIGFuZCB0aGVyZVxuICogaXMgbm8gY29uZmlnIHRvIGZvcmNlIGFuIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgY29uc3QgTk9fRU5UUllfUE9JTlQgPSAnbm8tZW50cnktcG9pbnQnO1xuXG4vKipcbiAqIFRoZSBwYXRoIHJlcHJlc2VudHMgYW4gZW50cnktcG9pbnQgdGhhdCBpcyBgaWdub3JlZGAgYnkgYW4gbmdjYyBjb25maWcuXG4gKi9cbmV4cG9ydCBjb25zdCBJR05PUkVEX0VOVFJZX1BPSU5UID0gJ2lnbm9yZWQtZW50cnktcG9pbnQnO1xuXG4vKipcbiAqIFRoZSBwYXRoIGhhcyBhIHBhY2thZ2UuanNvbiwgYnV0IGl0IGlzIG5vdCBhIHZhbGlkIGVudHJ5LXBvaW50IGZvciBuZ2NjIHByb2Nlc3NpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQgPSAnaW5jb21wYXRpYmxlLWVudHJ5LXBvaW50JztcblxuLyoqXG4gKiBUaGUgcmVzdWx0IG9mIGNhbGxpbmcgYGdldEVudHJ5UG9pbnRJbmZvKClgLlxuICpcbiAqIFRoaXMgd2lsbCBiZSBhbiBgRW50cnlQb2ludGAgb2JqZWN0IGlmIGFuIEFuZ3VsYXIgZW50cnktcG9pbnQgd2FzIGlkZW50aWZpZWQ7XG4gKiBPdGhlcndpc2UgaXQgd2lsbCBiZSBhIGZsYWcgaW5kaWNhdGluZyBvbmUgb2Y6XG4gKiAqIE5PX0VOVFJZX1BPSU5UIC0gdGhlIHBhdGggaXMgbm90IGFuIGVudHJ5LXBvaW50IG9yIG5nY2MgaXMgY29uZmlndXJlZCB0byBpZ25vcmUgaXRcbiAqICogSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UIC0gdGhlIHBhdGggd2FzIGEgbm9uLXByb2Nlc3NhYmxlIGVudHJ5LXBvaW50IHRoYXQgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKiBmb3Igc3ViLWVudHJ5LXBvaW50c1xuICovXG5leHBvcnQgdHlwZSBHZXRFbnRyeVBvaW50UmVzdWx0ID1cbiAgICBFbnRyeVBvaW50fHR5cGVvZiBJR05PUkVEX0VOVFJZX1BPSU5UfHR5cGVvZiBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlR8dHlwZW9mIE5PX0VOVFJZX1BPSU5UO1xuXG5cbi8qKlxuICogVHJ5IHRvIGNyZWF0ZSBhbiBlbnRyeS1wb2ludCBmcm9tIHRoZSBnaXZlbiBwYXRocyBhbmQgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0gcGFja2FnZVBhdGggdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGNvbnRhaW5pbmcgbnBtIHBhY2thZ2VcbiAqIEBwYXJhbSBlbnRyeVBvaW50UGF0aCB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgcG90ZW50aWFsIGVudHJ5LXBvaW50LlxuICogQHJldHVybnNcbiAqIC0gQW4gZW50cnktcG9pbnQgaWYgaXQgaXMgdmFsaWQgYW5kIG5vdCBpZ25vcmVkLlxuICogLSBgTk9fRU5UUllfUE9JTlRgIHdoZW4gdGhlcmUgaXMgbm8gcGFja2FnZS5qc29uIGF0IHRoZSBwYXRoIGFuZCB0aGVyZSBpcyBubyBjb25maWcgdG8gZm9yY2UgYW5cbiAqICAgZW50cnktcG9pbnQsXG4gKiAtIGBJR05PUkVEX0VOVFJZX1BPSU5UYCB3aGVuIHRoZSBlbnRyeS1wb2ludCBpcyBpZ25vcmVkIGJ5IGFuIG5nY2MgY29uZmlnLlxuICogLSBgSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UYCB3aGVuIHRoZXJlIGlzIGEgcGFja2FnZS5qc29uIGJ1dCBpdCBpcyBub3QgYSB2YWxpZCBBbmd1bGFyIGNvbXBpbGVkXG4gKiAgIGVudHJ5LXBvaW50LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW50cnlQb2ludEluZm8oXG4gICAgZnM6IEZpbGVTeXN0ZW0sIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sIGxvZ2dlcjogTG9nZ2VyLCBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsXG4gICAgZW50cnlQb2ludFBhdGg6IEFic29sdXRlRnNQYXRoKTogR2V0RW50cnlQb2ludFJlc3VsdCB7XG4gIGNvbnN0IHBhY2thZ2VQYWNrYWdlSnNvblBhdGggPSByZXNvbHZlKHBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIGNvbnN0IGVudHJ5UG9pbnRQYWNrYWdlSnNvblBhdGggPSByZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCAncGFja2FnZS5qc29uJyk7XG4gIGNvbnN0IGxvYWRlZFBhY2thZ2VQYWNrYWdlSnNvbiA9IGxvYWRQYWNrYWdlSnNvbihmcywgcGFja2FnZVBhY2thZ2VKc29uUGF0aCk7XG4gIGNvbnN0IGxvYWRlZEVudHJ5UG9pbnRQYWNrYWdlSnNvbiA9IChwYWNrYWdlUGFja2FnZUpzb25QYXRoID09PSBlbnRyeVBvaW50UGFja2FnZUpzb25QYXRoKSA/XG4gICAgICBsb2FkZWRQYWNrYWdlUGFja2FnZUpzb24gOlxuICAgICAgbG9hZFBhY2thZ2VKc29uKGZzLCBlbnRyeVBvaW50UGFja2FnZUpzb25QYXRoKTtcbiAgY29uc3Qge3BhY2thZ2VOYW1lLCBwYWNrYWdlVmVyc2lvbn0gPSBnZXRQYWNrYWdlTmFtZUFuZFZlcnNpb24oXG4gICAgICBmcywgcGFja2FnZVBhdGgsIGxvYWRlZFBhY2thZ2VQYWNrYWdlSnNvbiwgbG9hZGVkRW50cnlQb2ludFBhY2thZ2VKc29uKTtcblxuICBjb25zdCBwYWNrYWdlQ29uZmlnID0gY29uZmlnLmdldFBhY2thZ2VDb25maWcocGFja2FnZU5hbWUsIHBhY2thZ2VQYXRoLCBwYWNrYWdlVmVyc2lvbik7XG4gIGNvbnN0IGVudHJ5UG9pbnRDb25maWcgPSBwYWNrYWdlQ29uZmlnLmVudHJ5UG9pbnRzLmdldChlbnRyeVBvaW50UGF0aCk7XG4gIGxldCBlbnRyeVBvaW50UGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcblxuICBpZiAoZW50cnlQb2ludENvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKCFmcy5leGlzdHMoZW50cnlQb2ludFBhY2thZ2VKc29uUGF0aCkpIHtcbiAgICAgIC8vIE5vIGBwYWNrYWdlLmpzb25gIGFuZCBubyBjb25maWcuXG4gICAgICByZXR1cm4gTk9fRU5UUllfUE9JTlQ7XG4gICAgfSBlbHNlIGlmIChsb2FkZWRFbnRyeVBvaW50UGFja2FnZUpzb24gPT09IG51bGwpIHtcbiAgICAgIC8vIGBwYWNrYWdlLmpzb25gIGV4aXN0cyBidXQgY291bGQgbm90IGJlIHBhcnNlZCBhbmQgdGhlcmUgaXMgbm8gcmVkZWVtaW5nIGNvbmZpZy5cbiAgICAgIGxvZ2dlci53YXJuKGBGYWlsZWQgdG8gcmVhZCBlbnRyeSBwb2ludCBpbmZvIGZyb20gaW52YWxpZCAncGFja2FnZS5qc29uJyBmaWxlOiAke1xuICAgICAgICAgIGVudHJ5UG9pbnRQYWNrYWdlSnNvblBhdGh9YCk7XG5cbiAgICAgIHJldHVybiBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudHJ5UG9pbnRQYWNrYWdlSnNvbiA9IGxvYWRlZEVudHJ5UG9pbnRQYWNrYWdlSnNvbjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZW50cnlQb2ludENvbmZpZy5pZ25vcmUgPT09IHRydWUpIHtcbiAgICAvLyBFeHBsaWNpdGx5IGlnbm9yZWQgZW50cnktcG9pbnQuXG4gICAgcmV0dXJuIElHTk9SRURfRU5UUllfUE9JTlQ7XG4gIH0gZWxzZSB7XG4gICAgZW50cnlQb2ludFBhY2thZ2VKc29uID0gbWVyZ2VDb25maWdBbmRQYWNrYWdlSnNvbihcbiAgICAgICAgbG9hZGVkRW50cnlQb2ludFBhY2thZ2VKc29uLCBlbnRyeVBvaW50Q29uZmlnLCBwYWNrYWdlUGF0aCwgZW50cnlQb2ludFBhdGgpO1xuICB9XG5cbiAgY29uc3QgdHlwaW5ncyA9IGVudHJ5UG9pbnRQYWNrYWdlSnNvbi50eXBpbmdzIHx8IGVudHJ5UG9pbnRQYWNrYWdlSnNvbi50eXBlcyB8fFxuICAgICAgZ3Vlc3NUeXBpbmdzRnJvbVBhY2thZ2VKc29uKGZzLCBlbnRyeVBvaW50UGF0aCwgZW50cnlQb2ludFBhY2thZ2VKc29uKTtcbiAgaWYgKHR5cGVvZiB0eXBpbmdzICE9PSAnc3RyaW5nJykge1xuICAgIC8vIE1pc3NpbmcgdGhlIHJlcXVpcmVkIGB0eXBpbmdzYCBwcm9wZXJ0eVxuICAgIHJldHVybiBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQ7XG4gIH1cblxuICAvLyBBbiBlbnRyeS1wb2ludCBpcyBhc3N1bWVkIHRvIGJlIGNvbXBpbGVkIGJ5IEFuZ3VsYXIgaWYgdGhlcmUgaXMgZWl0aGVyOlxuICAvLyAqIGEgYG1ldGFkYXRhLmpzb25gIGZpbGUgbmV4dCB0byB0aGUgdHlwaW5ncyBlbnRyeS1wb2ludFxuICAvLyAqIGEgY3VzdG9tIGNvbmZpZyBmb3IgdGhpcyBlbnRyeS1wb2ludFxuICBjb25zdCBtZXRhZGF0YVBhdGggPSByZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCB0eXBpbmdzLnJlcGxhY2UoL1xcLmRcXC50cyQvLCAnJykgKyAnLm1ldGFkYXRhLmpzb24nKTtcbiAgY29uc3QgY29tcGlsZWRCeUFuZ3VsYXIgPSBlbnRyeVBvaW50Q29uZmlnICE9PSB1bmRlZmluZWQgfHwgZnMuZXhpc3RzKG1ldGFkYXRhUGF0aCk7XG5cbiAgY29uc3QgZW50cnlQb2ludEluZm86IEVudHJ5UG9pbnQgPSB7XG4gICAgbmFtZTogZW50cnlQb2ludFBhY2thZ2VKc29uLm5hbWUsXG4gICAgcGF0aDogZW50cnlQb2ludFBhdGgsXG4gICAgcGFja2FnZU5hbWUsXG4gICAgcGFja2FnZVBhdGgsXG4gICAgcGFja2FnZUpzb246IGVudHJ5UG9pbnRQYWNrYWdlSnNvbixcbiAgICB0eXBpbmdzOiByZXNvbHZlKGVudHJ5UG9pbnRQYXRoLCB0eXBpbmdzKSxcbiAgICBjb21waWxlZEJ5QW5ndWxhcixcbiAgICBpZ25vcmVNaXNzaW5nRGVwZW5kZW5jaWVzOlxuICAgICAgICBlbnRyeVBvaW50Q29uZmlnICE9PSB1bmRlZmluZWQgPyAhIWVudHJ5UG9pbnRDb25maWcuaWdub3JlTWlzc2luZ0RlcGVuZGVuY2llcyA6IGZhbHNlLFxuICAgIGdlbmVyYXRlRGVlcFJlZXhwb3J0czpcbiAgICAgICAgZW50cnlQb2ludENvbmZpZyAhPT0gdW5kZWZpbmVkID8gISFlbnRyeVBvaW50Q29uZmlnLmdlbmVyYXRlRGVlcFJlZXhwb3J0cyA6IGZhbHNlLFxuICB9O1xuXG4gIHJldHVybiBlbnRyeVBvaW50SW5mbztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRW50cnlQb2ludChyZXN1bHQ6IEdldEVudHJ5UG9pbnRSZXN1bHQpOiByZXN1bHQgaXMgRW50cnlQb2ludCB7XG4gIHJldHVybiByZXN1bHQgIT09IE5PX0VOVFJZX1BPSU5UICYmIHJlc3VsdCAhPT0gSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UICYmXG4gICAgICByZXN1bHQgIT09IElHTk9SRURfRU5UUllfUE9JTlQ7XG59XG5cbi8qKlxuICogQ29udmVydCBhIHBhY2thZ2UuanNvbiBwcm9wZXJ0eSBpbnRvIGFuIGVudHJ5LXBvaW50IGZvcm1hdC5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGNvbnZlcnQgdG8gYSBmb3JtYXQuXG4gKiBAcmV0dXJucyBBbiBlbnRyeS1wb2ludCBmb3JtYXQgb3IgYHVuZGVmaW5lZGAgaWYgbm9uZSBtYXRjaCB0aGUgZ2l2ZW4gcHJvcGVydHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnRyeVBvaW50Rm9ybWF0KFxuICAgIGZzOiBGaWxlU3lzdGVtLCBlbnRyeVBvaW50OiBFbnRyeVBvaW50LCBwcm9wZXJ0eTogRW50cnlQb2ludEpzb25Qcm9wZXJ0eSk6IEVudHJ5UG9pbnRGb3JtYXR8XG4gICAgdW5kZWZpbmVkIHtcbiAgc3dpdGNoIChwcm9wZXJ0eSkge1xuICAgIGNhc2UgJ2Zlc20yMDE1JzpcbiAgICAgIHJldHVybiAnZXNtMjAxNSc7XG4gICAgY2FzZSAnZmVzbTUnOlxuICAgICAgcmV0dXJuICdlc201JztcbiAgICBjYXNlICdlczIwMTUnOlxuICAgICAgcmV0dXJuICdlc20yMDE1JztcbiAgICBjYXNlICdlc20yMDE1JzpcbiAgICAgIHJldHVybiAnZXNtMjAxNSc7XG4gICAgY2FzZSAnZXNtNSc6XG4gICAgICByZXR1cm4gJ2VzbTUnO1xuICAgIGNhc2UgJ2Jyb3dzZXInOlxuICAgICAgY29uc3QgYnJvd3NlckZpbGUgPSBlbnRyeVBvaW50LnBhY2thZ2VKc29uWydicm93c2VyJ107XG4gICAgICBpZiAodHlwZW9mIGJyb3dzZXJGaWxlICE9PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNuaWZmTW9kdWxlRm9ybWF0KGZzLCBqb2luKGVudHJ5UG9pbnQucGF0aCwgYnJvd3NlckZpbGUpKTtcbiAgICBjYXNlICdtYWluJzpcbiAgICAgIGNvbnN0IG1haW5GaWxlID0gZW50cnlQb2ludC5wYWNrYWdlSnNvblsnbWFpbiddO1xuICAgICAgaWYgKG1haW5GaWxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbmlmZk1vZHVsZUZvcm1hdChmcywgam9pbihlbnRyeVBvaW50LnBhdGgsIG1haW5GaWxlKSk7XG4gICAgY2FzZSAnbW9kdWxlJzpcbiAgICAgIGNvbnN0IG1vZHVsZUZpbGVQYXRoID0gZW50cnlQb2ludC5wYWNrYWdlSnNvblsnbW9kdWxlJ107XG4gICAgICAvLyBBcyBvZiB2ZXJzaW9uIDEwLCB0aGUgYG1vZHVsZWAgcHJvcGVydHkgaW4gYHBhY2thZ2UuanNvbmAgc2hvdWxkIHBvaW50IHRvXG4gICAgICAvLyB0aGUgRVNNMjAxNSBmb3JtYXQgb3V0cHV0IGFzIHBlciBBbmd1bGFyIFBhY2thZ2UgZm9ybWF0IHNwZWNpZmljYXRpb24uIFRoaXNcbiAgICAgIC8vIG1lYW5zIHRoYXQgdGhlIGBtb2R1bGVgIHByb3BlcnR5IGNhcHR1cmVzIG11bHRpcGxlIGZvcm1hdHMsIGFzIG9sZCBsaWJyYXJpZXNcbiAgICAgIC8vIGJ1aWx0IHdpdGggdGhlIG9sZCBBUEYgY2FuIHN0aWxsIGJlIHByb2Nlc3NlZC4gV2UgZGV0ZWN0IHRoZSBmb3JtYXQgYnkgY2hlY2tpbmdcbiAgICAgIC8vIHRoZSBwYXRocyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHBlciBBUEYgc3BlY2lmaWNhdGlvbi5cbiAgICAgIGlmICh0eXBlb2YgbW9kdWxlRmlsZVBhdGggPT09ICdzdHJpbmcnICYmIG1vZHVsZUZpbGVQYXRoLmluY2x1ZGVzKCdlc20yMDE1JykpIHtcbiAgICAgICAgcmV0dXJuIGBlc20yMDE1YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAnZXNtNSc7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgSlNPTiBmcm9tIGEgYHBhY2thZ2UuanNvbmAgZmlsZS5cbiAqIEBwYXJhbSBwYWNrYWdlSnNvblBhdGggdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuXG4gKiBAcmV0dXJucyBKU09OIGZyb20gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUgaWYgaXQgaXMgdmFsaWQsIGBudWxsYCBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGxvYWRQYWNrYWdlSnNvbihmczogRmlsZVN5c3RlbSwgcGFja2FnZUpzb25QYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRQYWNrYWdlSnNvbnxcbiAgICBudWxsIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZShwYWNrYWdlSnNvblBhdGgpKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc25pZmZNb2R1bGVGb3JtYXQoZnM6IEZpbGVTeXN0ZW0sIHNvdXJjZUZpbGVQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRGb3JtYXR8XG4gICAgdW5kZWZpbmVkIHtcbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZUZpbGVXaXRoUG9zdGZpeGVzKGZzLCBzb3VyY2VGaWxlUGF0aCwgWycnLCAnLmpzJywgJy9pbmRleC5qcyddKTtcbiAgaWYgKHJlc29sdmVkUGF0aCA9PT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBzb3VyY2VGaWxlID1cbiAgICAgIHRzLmNyZWF0ZVNvdXJjZUZpbGUoc291cmNlRmlsZVBhdGgsIGZzLnJlYWRGaWxlKHJlc29sdmVkUGF0aCksIHRzLlNjcmlwdFRhcmdldC5FUzUpO1xuICBpZiAoc291cmNlRmlsZS5zdGF0ZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgaWYgKHRzLmlzRXh0ZXJuYWxNb2R1bGUoc291cmNlRmlsZSkpIHtcbiAgICByZXR1cm4gJ2VzbTUnO1xuICB9IGVsc2UgaWYgKHBhcnNlU3RhdGVtZW50Rm9yVW1kTW9kdWxlKHNvdXJjZUZpbGUuc3RhdGVtZW50c1swXSkgIT09IG51bGwpIHtcbiAgICByZXR1cm4gJ3VtZCc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICdjb21tb25qcyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VDb25maWdBbmRQYWNrYWdlSnNvbihcbiAgICBlbnRyeVBvaW50UGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbnxudWxsLCBlbnRyeVBvaW50Q29uZmlnOiBOZ2NjRW50cnlQb2ludENvbmZpZyxcbiAgICBwYWNrYWdlUGF0aDogQWJzb2x1dGVGc1BhdGgsIGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRQYWNrYWdlSnNvbiB7XG4gIGlmIChlbnRyeVBvaW50UGFja2FnZUpzb24gIT09IG51bGwpIHtcbiAgICByZXR1cm4gey4uLmVudHJ5UG9pbnRQYWNrYWdlSnNvbiwgLi4uZW50cnlQb2ludENvbmZpZy5vdmVycmlkZX07XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbmFtZSA9IGAke2Jhc2VuYW1lKHBhY2thZ2VQYXRoKX0vJHtyZWxhdGl2ZShwYWNrYWdlUGF0aCwgZW50cnlQb2ludFBhdGgpfWA7XG4gICAgcmV0dXJuIHtuYW1lLCAuLi5lbnRyeVBvaW50Q29uZmlnLm92ZXJyaWRlfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBndWVzc1R5cGluZ3NGcm9tUGFja2FnZUpzb24oXG4gICAgZnM6IEZpbGVTeXN0ZW0sIGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICBlbnRyeVBvaW50UGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbik6IEFic29sdXRlRnNQYXRofG51bGwge1xuICBmb3IgKGNvbnN0IHByb3Agb2YgU1VQUE9SVEVEX0ZPUk1BVF9QUk9QRVJUSUVTKSB7XG4gICAgY29uc3QgZmllbGQgPSBlbnRyeVBvaW50UGFja2FnZUpzb25bcHJvcF07XG4gICAgaWYgKHR5cGVvZiBmaWVsZCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFNvbWUgY3JhenkgcGFja2FnZXMgaGF2ZSB0aGluZ3MgbGlrZSBhcnJheXMgaW4gdGhlc2UgZmllbGRzIVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHJlbGF0aXZlVHlwaW5nc1BhdGggPSBmaWVsZC5yZXBsYWNlKC9cXC5qcyQvLCAnLmQudHMnKTtcbiAgICBjb25zdCB0eXBpbmdzUGF0aCA9IHJlc29sdmUoZW50cnlQb2ludFBhdGgsIHJlbGF0aXZlVHlwaW5nc1BhdGgpO1xuICAgIGlmIChmcy5leGlzdHModHlwaW5nc1BhdGgpKSB7XG4gICAgICByZXR1cm4gdHlwaW5nc1BhdGg7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEZpbmQgb3IgaW5mZXIgdGhlIG5hbWUgYW5kIHZlcnNpb24gb2YgYSBwYWNrYWdlLlxuICpcbiAqIC0gVGhlIG5hbWUgaXMgY29tcHV0ZWQgYmFzZWQgb24gdGhlIGBuYW1lYCBwcm9wZXJ0eSBvZiB0aGUgcGFja2FnZSdzIG9yIHRoZSBlbnRyeS1wb2ludCdzXG4gKiAgIGBwYWNrYWdlLmpzb25gIGZpbGUgKGlmIGF2YWlsYWJsZSkgb3IgaW5mZXJyZWQgZnJvbSB0aGUgcGFja2FnZSdzIHBhdGguXG4gKiAtIFRoZSB2ZXJzaW9uIGlzIHJlYWQgb2ZmIG9mIHRoZSBgdmVyc2lvbmAgcHJvcGVydHkgb2YgdGhlIHBhY2thZ2UncyBgcGFja2FnZS5qc29uYCBmaWxlIChpZlxuICogICBhdmFpbGFibGUpLlxuICpcbiAqIEBwYXJhbSBmcyBUaGUgYEZpbGVTeXN0ZW1gIGluc3RhbmNlIHRvIHVzZSBmb3IgcGFyc2luZyBgcGFja2FnZVBhdGhgIChpZiBuZWVkZWQpLlxuICogQHBhcmFtIHBhY2thZ2VQYXRoIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBwYWNrYWdlLlxuICogQHBhcmFtIHBhY2thZ2VQYWNrYWdlSnNvbiB0aGUgcGFyc2VkIGBwYWNrYWdlLmpzb25gIG9mIHRoZSBwYWNrYWdlIChpZiBhdmFpbGFibGUpLlxuICogQHBhcmFtIGVudHJ5UG9pbnRQYWNrYWdlSnNvbiB0aGUgcGFyc2VkIGBwYWNrYWdlLmpzb25gIG9mIGFuIGVudHJ5LXBvaW50IChpZiBhdmFpbGFibGUpLlxuICogQHJldHVybnMgdGhlIGNvbXB1dGVkIG5hbWUgYW5kIHZlcnNpb24gb2YgdGhlIHBhY2thZ2UuXG4gKi9cbmZ1bmN0aW9uIGdldFBhY2thZ2VOYW1lQW5kVmVyc2lvbihcbiAgICBmczogRmlsZVN5c3RlbSwgcGFja2FnZVBhdGg6IEFic29sdXRlRnNQYXRoLCBwYWNrYWdlUGFja2FnZUpzb246IEVudHJ5UG9pbnRQYWNrYWdlSnNvbnxudWxsLFxuICAgIGVudHJ5UG9pbnRQYWNrYWdlSnNvbjogRW50cnlQb2ludFBhY2thZ2VKc29ufFxuICAgIG51bGwpOiB7cGFja2FnZU5hbWU6IHN0cmluZywgcGFja2FnZVZlcnNpb246IHN0cmluZ3xudWxsfSB7XG4gIGxldCBwYWNrYWdlTmFtZTogc3RyaW5nO1xuXG4gIGlmIChwYWNrYWdlUGFja2FnZUpzb24gIT09IG51bGwpIHtcbiAgICAvLyBXZSBoYXZlIGEgdmFsaWQgYHBhY2thZ2UuanNvbmAgZm9yIHRoZSBwYWNrYWdlOiBHZXQgdGhlIHBhY2thZ2UgbmFtZSBmcm9tIHRoYXQuXG4gICAgcGFja2FnZU5hbWUgPSBwYWNrYWdlUGFja2FnZUpzb24ubmFtZTtcbiAgfSBlbHNlIGlmIChlbnRyeVBvaW50UGFja2FnZUpzb24gIT09IG51bGwpIHtcbiAgICAvLyBXZSBoYXZlIGEgdmFsaWQgYHBhY2thZ2UuanNvbmAgZm9yIHRoZSBlbnRyeS1wb2ludDogR2V0IHRoZSBwYWNrYWdlIG5hbWUgZnJvbSB0aGF0LlxuICAgIC8vIFRoaXMgbWlnaHQgYmUgYSBzZWNvbmRhcnkgZW50cnktcG9pbnQsIHNvIG1ha2Ugc3VyZSB3ZSBvbmx5IGtlZXAgdGhlIG1haW4gcGFja2FnZSdzIG5hbWVcbiAgICAvLyAoZS5nLiBvbmx5IGtlZXAgYEBhbmd1bGFyL2NvbW1vbmAgZnJvbSBgQGFuZ3VsYXIvY29tbW9uL2h0dHBgKS5cbiAgICBwYWNrYWdlTmFtZSA9IC9eKD86QFteL10rXFwvKT9bXi9dKi8uZXhlYyhlbnRyeVBvaW50UGFja2FnZUpzb24ubmFtZSkhWzBdO1xuICB9IGVsc2Uge1xuICAgIC8vIFdlIGRvbid0IGhhdmUgYSB2YWxpZCBgcGFja2FnZS5qc29uYDogSW5mZXIgdGhlIHBhY2thZ2UgbmFtZSBmcm9tIHRoZSBwYWNrYWdlJ3MgcGF0aC5cbiAgICBjb25zdCBsYXN0U2VnbWVudCA9IGZzLmJhc2VuYW1lKHBhY2thZ2VQYXRoKTtcbiAgICBjb25zdCBzZWNvbmRMYXN0U2VnbWVudCA9IGZzLmJhc2VuYW1lKGZzLmRpcm5hbWUocGFja2FnZVBhdGgpKTtcblxuICAgIHBhY2thZ2VOYW1lID1cbiAgICAgICAgc2Vjb25kTGFzdFNlZ21lbnQuc3RhcnRzV2l0aCgnQCcpID8gYCR7c2Vjb25kTGFzdFNlZ21lbnR9LyR7bGFzdFNlZ21lbnR9YCA6IGxhc3RTZWdtZW50O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYWNrYWdlTmFtZSxcbiAgICBwYWNrYWdlVmVyc2lvbjogcGFja2FnZVBhY2thZ2VKc29uPy52ZXJzaW9uID8/IG51bGwsXG4gIH07XG59XG4iXX0=