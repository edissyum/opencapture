(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/program_based_entry_point_finder", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/dependencies/dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host", "@angular/compiler-cli/ngcc/src/dependencies/module_resolver", "@angular/compiler-cli/ngcc/src/path_mappings", "@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder", "@angular/compiler-cli/ngcc/src/entry_point_finder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProgramBasedEntryPointFinder = void 0;
    var tslib_1 = require("tslib");
    var dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/dependency_host");
    var esm_dependency_host_1 = require("@angular/compiler-cli/ngcc/src/dependencies/esm_dependency_host");
    var module_resolver_1 = require("@angular/compiler-cli/ngcc/src/dependencies/module_resolver");
    var path_mappings_1 = require("@angular/compiler-cli/ngcc/src/path_mappings");
    var tracing_entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/utils");
    /**
     * An EntryPointFinder that starts from the files in the program defined by the given tsconfig.json
     * and only returns entry-points that are dependencies of these files.
     *
     * This is faster than searching the entire file-system for all the entry-points,
     * and is used primarily by the CLI integration.
     */
    var ProgramBasedEntryPointFinder = /** @class */ (function (_super) {
        tslib_1.__extends(ProgramBasedEntryPointFinder, _super);
        function ProgramBasedEntryPointFinder(fs, config, logger, resolver, entryPointCollector, entryPointManifest, basePath, tsConfig, projectPath) {
            var _this = _super.call(this, fs, config, logger, resolver, basePath, path_mappings_1.getPathMappingsFromTsConfig(tsConfig, projectPath)) || this;
            _this.entryPointCollector = entryPointCollector;
            _this.entryPointManifest = entryPointManifest;
            _this.tsConfig = tsConfig;
            _this.entryPointsWithDependencies = null;
            return _this;
        }
        /**
         * Return an array containing the external import paths that were extracted from the source-files
         * of the program defined by the tsconfig.json.
         */
        ProgramBasedEntryPointFinder.prototype.getInitialEntryPointPaths = function () {
            var _this = this;
            var moduleResolver = new module_resolver_1.ModuleResolver(this.fs, this.pathMappings, ['', '.ts', '/index.ts']);
            var host = new esm_dependency_host_1.EsmDependencyHost(this.fs, moduleResolver);
            var dependencies = dependency_host_1.createDependencyInfo();
            var rootFiles = this.tsConfig.rootNames.map(function (rootName) { return _this.fs.resolve(rootName); });
            this.logger.debug("Using the program from " + this.tsConfig.project + " to seed the entry-point finding.");
            this.logger.debug("Collecting dependencies from the following files:" + rootFiles.map(function (file) { return "\n- " + file; }));
            host.collectDependenciesInFiles(rootFiles, dependencies);
            return Array.from(dependencies.dependencies);
        };
        /**
         * For the given `entryPointPath`, compute, or retrieve, the entry-point information, including
         * paths to other entry-points that this entry-point depends upon.
         *
         * In this entry-point finder, we use the `EntryPointManifest` to avoid computing each
         * entry-point's dependencies in the case that this had been done previously.
         *
         * @param entryPointPath the path to the entry-point whose information and dependencies are to be
         *     retrieved or computed.
         *
         * @returns the entry-point and its dependencies or `null` if the entry-point is not compiled by
         *     Angular or cannot be determined.
         */
        ProgramBasedEntryPointFinder.prototype.getEntryPointWithDeps = function (entryPointPath) {
            var entryPoints = this.findOrLoadEntryPoints();
            if (!entryPoints.has(entryPointPath)) {
                return null;
            }
            var entryPointWithDeps = entryPoints.get(entryPointPath);
            if (!entryPointWithDeps.entryPoint.compiledByAngular) {
                return null;
            }
            return entryPointWithDeps;
        };
        /**
         * Walk the base paths looking for entry-points or load this information from an entry-point
         * manifest, if available.
         */
        ProgramBasedEntryPointFinder.prototype.findOrLoadEntryPoints = function () {
            var e_1, _a, e_2, _b;
            if (this.entryPointsWithDependencies === null) {
                var entryPointsWithDependencies = this.entryPointsWithDependencies =
                    new Map();
                try {
                    for (var _c = tslib_1.__values(this.getBasePaths()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var basePath = _d.value;
                        var entryPoints = this.entryPointManifest.readEntryPointsUsingManifest(basePath) ||
                            this.walkBasePathForPackages(basePath);
                        try {
                            for (var entryPoints_1 = (e_2 = void 0, tslib_1.__values(entryPoints)), entryPoints_1_1 = entryPoints_1.next(); !entryPoints_1_1.done; entryPoints_1_1 = entryPoints_1.next()) {
                                var e = entryPoints_1_1.value;
                                entryPointsWithDependencies.set(e.entryPoint.path, e);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (entryPoints_1_1 && !entryPoints_1_1.done && (_b = entryPoints_1.return)) _b.call(entryPoints_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return this.entryPointsWithDependencies;
        };
        /**
         * Search the `basePath` for possible Angular packages and entry-points.
         *
         * @param basePath The path at which to start the search.
         * @returns an array of `EntryPoint`s that were found within `basePath`.
         */
        ProgramBasedEntryPointFinder.prototype.walkBasePathForPackages = function (basePath) {
            var _this = this;
            this.logger.debug("No manifest found for " + basePath + " so walking the directories for entry-points.");
            var entryPoints = utils_1.trackDuration(function () { return _this.entryPointCollector.walkDirectoryForPackages(basePath); }, function (duration) { return _this.logger.debug("Walking " + basePath + " for entry-points took " + duration + "s."); });
            this.entryPointManifest.writeEntryPointManifest(basePath, entryPoints);
            return entryPoints;
        };
        return ProgramBasedEntryPointFinder;
    }(tracing_entry_point_finder_1.TracingEntryPointFinder));
    exports.ProgramBasedEntryPointFinder = ProgramBasedEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbV9iYXNlZF9lbnRyeV9wb2ludF9maW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL3Byb2dyYW1fYmFzZWRfZW50cnlfcG9pbnRfZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFXQSwrRkFBaUc7SUFFakcsdUdBQXNFO0lBQ3RFLCtGQUErRDtJQUcvRCw4RUFBNkQ7SUFHN0QsMkhBQXFFO0lBQ3JFLGlGQUFzQztJQUV0Qzs7Ozs7O09BTUc7SUFDSDtRQUFrRCx3REFBdUI7UUFHdkUsc0NBQ0ksRUFBYyxFQUFFLE1BQXlCLEVBQUUsTUFBYyxFQUFFLFFBQTRCLEVBQy9FLG1CQUF3QyxFQUN4QyxrQkFBc0MsRUFBRSxRQUF3QixFQUNoRSxRQUE2QixFQUFFLFdBQTJCO1lBSnRFLFlBS0Usa0JBQ0ksRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSwyQ0FBMkIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsU0FDaEc7WUFMVyx5QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO1lBQ3hDLHdCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDdEMsY0FBUSxHQUFSLFFBQVEsQ0FBcUI7WUFOakMsaUNBQTJCLEdBQXlELElBQUksQ0FBQzs7UUFTakcsQ0FBQztRQUVEOzs7V0FHRztRQUNPLGdFQUF5QixHQUFuQztZQUFBLGlCQVdDO1lBVkMsSUFBTSxjQUFjLEdBQUcsSUFBSSxnQ0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoRyxJQUFNLElBQUksR0FBRyxJQUFJLHVDQUFpQixDQUFDLElBQUks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a0JBQWtCLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sV0FBVyxDQUFDO1FBQ3JCLENBQUM7UUFDSCxtQ0FBQztJQUFELENBQUMsQUF4RkQsQ0FBa0Qsb0RBQXVCLEdBd0Z4RTtJQXhGWSxvRUFBNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtQYXJzZWRDb25maWd1cmF0aW9ufSBmcm9tICcuLi8uLi8uLi9zcmMvcGVyZm9ybV9jb21waWxlJztcblxuaW1wb3J0IHtjcmVhdGVEZXBlbmRlbmN5SW5mbywgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXJ9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7RXNtRGVwZW5kZW5jeUhvc3R9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9lc21fZGVwZW5kZW5jeV9ob3N0JztcbmltcG9ydCB7TW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9tb2R1bGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtOZ2NjQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnRNYW5pZmVzdH0gZnJvbSAnLi4vcGFja2FnZXMvZW50cnlfcG9pbnRfbWFuaWZlc3QnO1xuaW1wb3J0IHtnZXRQYXRoTWFwcGluZ3NGcm9tVHNDb25maWd9IGZyb20gJy4uL3BhdGhfbWFwcGluZ3MnO1xuXG5pbXBvcnQge0VudHJ5UG9pbnRDb2xsZWN0b3J9IGZyb20gJy4vZW50cnlfcG9pbnRfY29sbGVjdG9yJztcbmltcG9ydCB7VHJhY2luZ0VudHJ5UG9pbnRGaW5kZXJ9IGZyb20gJy4vdHJhY2luZ19lbnRyeV9wb2ludF9maW5kZXInO1xuaW1wb3J0IHt0cmFja0R1cmF0aW9ufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBBbiBFbnRyeVBvaW50RmluZGVyIHRoYXQgc3RhcnRzIGZyb20gdGhlIGZpbGVzIGluIHRoZSBwcm9ncmFtIGRlZmluZWQgYnkgdGhlIGdpdmVuIHRzY29uZmlnLmpzb25cbiAqIGFuZCBvbmx5IHJldHVybnMgZW50cnktcG9pbnRzIHRoYXQgYXJlIGRlcGVuZGVuY2llcyBvZiB0aGVzZSBmaWxlcy5cbiAqXG4gKiBUaGlzIGlzIGZhc3RlciB0aGFuIHNlYXJjaGluZyB0aGUgZW50aXJlIGZpbGUtc3lzdGVtIGZvciBhbGwgdGhlIGVudHJ5LXBvaW50cyxcbiAqIGFuZCBpcyB1c2VkIHByaW1hcmlseSBieSB0aGUgQ0xJIGludGVncmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHJvZ3JhbUJhc2VkRW50cnlQb2ludEZpbmRlciBleHRlbmRzIFRyYWNpbmdFbnRyeVBvaW50RmluZGVyIHtcbiAgcHJpdmF0ZSBlbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXM+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgZnM6IEZpbGVTeXN0ZW0sIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sIGxvZ2dlcjogTG9nZ2VyLCByZXNvbHZlcjogRGVwZW5kZW5jeVJlc29sdmVyLFxuICAgICAgcHJpdmF0ZSBlbnRyeVBvaW50Q29sbGVjdG9yOiBFbnRyeVBvaW50Q29sbGVjdG9yLFxuICAgICAgcHJpdmF0ZSBlbnRyeVBvaW50TWFuaWZlc3Q6IEVudHJ5UG9pbnRNYW5pZmVzdCwgYmFzZVBhdGg6IEFic29sdXRlRnNQYXRoLFxuICAgICAgcHJpdmF0ZSB0c0NvbmZpZzogUGFyc2VkQ29uZmlndXJhdGlvbiwgcHJvamVjdFBhdGg6IEFic29sdXRlRnNQYXRoKSB7XG4gICAgc3VwZXIoXG4gICAgICAgIGZzLCBjb25maWcsIGxvZ2dlciwgcmVzb2x2ZXIsIGJhc2VQYXRoLCBnZXRQYXRoTWFwcGluZ3NGcm9tVHNDb25maWcodHNDb25maWcsIHByb2plY3RQYXRoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGV4dGVybmFsIGltcG9ydCBwYXRocyB0aGF0IHdlcmUgZXh0cmFjdGVkIGZyb20gdGhlIHNvdXJjZS1maWxlc1xuICAgKiBvZiB0aGUgcHJvZ3JhbSBkZWZpbmVkIGJ5IHRoZSB0c2NvbmZpZy5qc29uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGdldEluaXRpYWxFbnRyeVBvaW50UGF0aHMoKTogQWJzb2x1dGVGc1BhdGhbXSB7XG4gICAgY29uc3QgbW9kdWxlUmVzb2x2ZXIgPSBuZXcgTW9kdWxlUmVzb2x2ZXIodGhpcy5mcywgdGhpcy5wYXRoTWFwcGluZ3MsIFsnJywgJy50cycsICcvaW5kZXgudHMnXSk7XG4gICAgY29uc3QgaG9zdCA9IG5ldyBFc21EZXBlbmRlbmN5SG9zdCh0aGlzLmZzLCBtb2R1bGVSZXNvbHZlcik7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gY3JlYXRlRGVwZW5kZW5jeUluZm8oKTtcbiAgICBjb25zdCByb290RmlsZXMgPSB0aGlzLnRzQ29uZmlnLnJvb3ROYW1lcy5tYXAocm9vdE5hbWUgPT4gdGhpcy5mcy5yZXNvbHZlKHJvb3ROYW1lKSk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoXG4gICAgICAgIGBVc2luZyB0aGUgcHJvZ3JhbSBmcm9tICR7dGhpcy50c0NvbmZpZy5wcm9qZWN0fSB0byBzZWVkIHRoZSBlbnRyeS1wb2ludCBmaW5kaW5nLmApO1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKFxuICAgICAgICBgQ29sbGVjdGluZyBkZXBlbmRlbmNpZXMgZnJvbSB0aGUgZm9sbG93aW5nIGZpbGVzOmAgKyByb290RmlsZXMubWFwKGZpbGUgPT4gYFxcbi0gJHtmaWxlfWApKTtcbiAgICBob3N0LmNvbGxlY3REZXBlbmRlbmNpZXNJbkZpbGVzKHJvb3RGaWxlcywgZGVwZW5kZW5jaWVzKTtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShkZXBlbmRlbmNpZXMuZGVwZW5kZW5jaWVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIGBlbnRyeVBvaW50UGF0aGAsIGNvbXB1dGUsIG9yIHJldHJpZXZlLCB0aGUgZW50cnktcG9pbnQgaW5mb3JtYXRpb24sIGluY2x1ZGluZ1xuICAgKiBwYXRocyB0byBvdGhlciBlbnRyeS1wb2ludHMgdGhhdCB0aGlzIGVudHJ5LXBvaW50IGRlcGVuZHMgdXBvbi5cbiAgICpcbiAgICogSW4gdGhpcyBlbnRyeS1wb2ludCBmaW5kZXIsIHdlIHVzZSB0aGUgYEVudHJ5UG9pbnRNYW5pZmVzdGAgdG8gYXZvaWQgY29tcHV0aW5nIGVhY2hcbiAgICogZW50cnktcG9pbnQncyBkZXBlbmRlbmNpZXMgaW4gdGhlIGNhc2UgdGhhdCB0aGlzIGhhZCBiZWVuIGRvbmUgcHJldmlvdXNseS5cbiAgICpcbiAgICogQHBhcmFtIGVudHJ5UG9pbnRQYXRoIHRoZSBwYXRoIHRvIHRoZSBlbnRyeS1wb2ludCB3aG9zZSBpbmZvcm1hdGlvbiBhbmQgZGVwZW5kZW5jaWVzIGFyZSB0byBiZVxuICAgKiAgICAgcmV0cmlldmVkIG9yIGNvbXB1dGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZW50cnktcG9pbnQgYW5kIGl0cyBkZXBlbmRlbmNpZXMgb3IgYG51bGxgIGlmIHRoZSBlbnRyeS1wb2ludCBpcyBub3QgY29tcGlsZWQgYnlcbiAgICogICAgIEFuZ3VsYXIgb3IgY2Fubm90IGJlIGRldGVybWluZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0RW50cnlQb2ludFdpdGhEZXBzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzfG51bGwge1xuICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gdGhpcy5maW5kT3JMb2FkRW50cnlQb2ludHMoKTtcbiAgICBpZiAoIWVudHJ5UG9pbnRzLmhhcyhlbnRyeVBvaW50UGF0aCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBlbnRyeVBvaW50V2l0aERlcHMgPSBlbnRyeVBvaW50cy5nZXQoZW50cnlQb2ludFBhdGgpITtcbiAgICBpZiAoIWVudHJ5UG9pbnRXaXRoRGVwcy5lbnRyeVBvaW50LmNvbXBpbGVkQnlBbmd1bGFyKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5UG9pbnRXaXRoRGVwcztcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWxrIHRoZSBiYXNlIHBhdGhzIGxvb2tpbmcgZm9yIGVudHJ5LXBvaW50cyBvciBsb2FkIHRoaXMgaW5mb3JtYXRpb24gZnJvbSBhbiBlbnRyeS1wb2ludFxuICAgKiBtYW5pZmVzdCwgaWYgYXZhaWxhYmxlLlxuICAgKi9cbiAgcHJpdmF0ZSBmaW5kT3JMb2FkRW50cnlQb2ludHMoKTogTWFwPEFic29sdXRlRnNQYXRoLCBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llcz4ge1xuICAgIGlmICh0aGlzLmVudHJ5UG9pbnRzV2l0aERlcGVuZGVuY2llcyA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgZW50cnlQb2ludHNXaXRoRGVwZW5kZW5jaWVzID0gdGhpcy5lbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXMgPVxuICAgICAgICAgIG5ldyBNYXA8QWJzb2x1dGVGc1BhdGgsIEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzPigpO1xuICAgICAgZm9yIChjb25zdCBiYXNlUGF0aCBvZiB0aGlzLmdldEJhc2VQYXRocygpKSB7XG4gICAgICAgIGNvbnN0IGVudHJ5UG9pbnRzID0gdGhpcy5lbnRyeVBvaW50TWFuaWZlc3QucmVhZEVudHJ5UG9pbnRzVXNpbmdNYW5pZmVzdChiYXNlUGF0aCkgfHxcbiAgICAgICAgICAgIHRoaXMud2Fsa0Jhc2VQYXRoRm9yUGFja2FnZXMoYmFzZVBhdGgpO1xuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgZW50cnlQb2ludHMpIHtcbiAgICAgICAgICBlbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXMuc2V0KGUuZW50cnlQb2ludC5wYXRoLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lbnRyeVBvaW50c1dpdGhEZXBlbmRlbmNpZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIHRoZSBgYmFzZVBhdGhgIGZvciBwb3NzaWJsZSBBbmd1bGFyIHBhY2thZ2VzIGFuZCBlbnRyeS1wb2ludHMuXG4gICAqXG4gICAqIEBwYXJhbSBiYXNlUGF0aCBUaGUgcGF0aCBhdCB3aGljaCB0byBzdGFydCB0aGUgc2VhcmNoLlxuICAgKiBAcmV0dXJucyBhbiBhcnJheSBvZiBgRW50cnlQb2ludGBzIHRoYXQgd2VyZSBmb3VuZCB3aXRoaW4gYGJhc2VQYXRoYC5cbiAgICovXG4gIHdhbGtCYXNlUGF0aEZvclBhY2thZ2VzKGJhc2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10ge1xuICAgIHRoaXMubG9nZ2VyLmRlYnVnKFxuICAgICAgICBgTm8gbWFuaWZlc3QgZm91bmQgZm9yICR7YmFzZVBhdGh9IHNvIHdhbGtpbmcgdGhlIGRpcmVjdG9yaWVzIGZvciBlbnRyeS1wb2ludHMuYCk7XG4gICAgY29uc3QgZW50cnlQb2ludHMgPSB0cmFja0R1cmF0aW9uKFxuICAgICAgICAoKSA9PiB0aGlzLmVudHJ5UG9pbnRDb2xsZWN0b3Iud2Fsa0RpcmVjdG9yeUZvclBhY2thZ2VzKGJhc2VQYXRoKSxcbiAgICAgICAgZHVyYXRpb24gPT4gdGhpcy5sb2dnZXIuZGVidWcoYFdhbGtpbmcgJHtiYXNlUGF0aH0gZm9yIGVudHJ5LXBvaW50cyB0b29rICR7ZHVyYXRpb259cy5gKSk7XG4gICAgdGhpcy5lbnRyeVBvaW50TWFuaWZlc3Qud3JpdGVFbnRyeVBvaW50TWFuaWZlc3QoYmFzZVBhdGgsIGVudHJ5UG9pbnRzKTtcbiAgICByZXR1cm4gZW50cnlQb2ludHM7XG4gIH1cbn1cbiJdfQ==