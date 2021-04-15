(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/targeted_entry_point_finder", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/ngcc/src/packages/build_marker", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TargetedEntryPointFinder = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var build_marker_1 = require("@angular/compiler-cli/ngcc/src/packages/build_marker");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var tracing_entry_point_finder_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder");
    /**
     * An EntryPointFinder that starts from a target entry-point and only finds
     * entry-points that are dependencies of the target.
     *
     * This is faster than searching the entire file-system for all the entry-points,
     * and is used primarily by the CLI integration.
     */
    var TargetedEntryPointFinder = /** @class */ (function (_super) {
        tslib_1.__extends(TargetedEntryPointFinder, _super);
        function TargetedEntryPointFinder(fs, config, logger, resolver, basePath, pathMappings, targetPath) {
            var _this = _super.call(this, fs, config, logger, resolver, basePath, pathMappings) || this;
            _this.targetPath = targetPath;
            return _this;
        }
        /**
         * Search for Angular entry-points that can be reached from the entry-point specified by the given
         * `targetPath`.
         */
        TargetedEntryPointFinder.prototype.findEntryPoints = function () {
            var _this = this;
            var entryPoints = _super.prototype.findEntryPoints.call(this);
            var invalidTarget = entryPoints.invalidEntryPoints.find(function (i) { return i.entryPoint.path === _this.targetPath; });
            if (invalidTarget !== undefined) {
                throw new Error("The target entry-point \"" + invalidTarget.entryPoint.name + "\" has missing dependencies:\n" +
                    invalidTarget.missingDependencies.map(function (dep) { return " - " + dep + "\n"; }).join(''));
            }
            return entryPoints;
        };
        /**
         * Determine whether the entry-point at the given `targetPath` needs to be processed.
         *
         * @param propertiesToConsider the package.json properties that should be considered for
         *     processing.
         * @param compileAllFormats true if all formats need to be processed, or false if it is enough for
         *     one of the formats covered by the `propertiesToConsider` is processed.
         */
        TargetedEntryPointFinder.prototype.targetNeedsProcessingOrCleaning = function (propertiesToConsider, compileAllFormats) {
            var e_1, _a;
            var entryPointWithDeps = this.getEntryPointWithDeps(this.targetPath);
            if (entryPointWithDeps === null) {
                return false;
            }
            try {
                for (var propertiesToConsider_1 = tslib_1.__values(propertiesToConsider), propertiesToConsider_1_1 = propertiesToConsider_1.next(); !propertiesToConsider_1_1.done; propertiesToConsider_1_1 = propertiesToConsider_1.next()) {
                    var property = propertiesToConsider_1_1.value;
                    if (entryPointWithDeps.entryPoint.packageJson[property]) {
                        // Here is a property that should be processed.
                        if (!build_marker_1.hasBeenProcessed(entryPointWithDeps.entryPoint.packageJson, property)) {
                            return true;
                        }
                        if (!compileAllFormats) {
                            // This property has been processed, and we only need one.
                            return false;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (propertiesToConsider_1_1 && !propertiesToConsider_1_1.done && (_a = propertiesToConsider_1.return)) _a.call(propertiesToConsider_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // All `propertiesToConsider` that appear in this entry-point have been processed.
            // In other words, there were no properties that need processing.
            return false;
        };
        /**
         * Return an array containing the `targetPath` from which to start the trace.
         */
        TargetedEntryPointFinder.prototype.getInitialEntryPointPaths = function () {
            return [this.targetPath];
        };
        /**
         * For the given `entryPointPath`, compute, or retrieve, the entry-point information, including
         * paths to other entry-points that this entry-point depends upon.
         *
         * @param entryPointPath the path to the entry-point whose information and dependencies are to be
         *     retrieved or computed.
         *
         * @returns the entry-point and its dependencies or `null` if the entry-point is not compiled by
         *     Angular or cannot be determined.
         */
        TargetedEntryPointFinder.prototype.getEntryPointWithDeps = function (entryPointPath) {
            var packagePath = this.computePackagePath(entryPointPath);
            var entryPoint = entry_point_1.getEntryPointInfo(this.fs, this.config, this.logger, packagePath, entryPointPath);
            if (!entry_point_1.isEntryPoint(entryPoint) || !entryPoint.compiledByAngular) {
                return null;
            }
            return this.resolver.getEntryPointWithDependencies(entryPoint);
        };
        /**
         * Compute the path to the package that contains the given entry-point.
         *
         * In this entry-point finder it is not trivial to find the containing package, since it is
         * possible that this entry-point is not directly below the directory containing the package.
         * Moreover, the import path could be affected by path-mapping.
         *
         * @param entryPointPath the path to the entry-point, whose package path we want to compute.
         */
        TargetedEntryPointFinder.prototype.computePackagePath = function (entryPointPath) {
            var e_2, _a;
            // First try the main basePath, to avoid having to compute the other basePaths from the paths
            // mappings, which can be computationally intensive.
            if (entryPointPath.startsWith(this.basePath)) {
                var packagePath = this.computePackagePathFromContainingPath(entryPointPath, this.basePath);
                if (packagePath !== null) {
                    return packagePath;
                }
            }
            try {
                // The main `basePath` didn't work out so now we try the `basePaths` computed from the paths
                // mappings in `tsconfig.json`.
                for (var _b = tslib_1.__values(this.getBasePaths()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var basePath = _c.value;
                    if (entryPointPath.startsWith(basePath)) {
                        var packagePath = this.computePackagePathFromContainingPath(entryPointPath, basePath);
                        if (packagePath !== null) {
                            return packagePath;
                        }
                        // If we got here then we couldn't find a `packagePath` for the current `basePath`.
                        // Since `basePath`s are guaranteed not to be a sub-directory of each other then no other
                        // `basePath` will match either.
                        break;
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
            // Finally, if we couldn't find a `packagePath` using `basePaths` then try to find the nearest
            // `node_modules` that contains the `entryPointPath`, if there is one, and use it as a
            // `basePath`.
            return this.computePackagePathFromNearestNodeModules(entryPointPath);
        };
        /**
         * Search down to the `entryPointPath` from the `containingPath` for the first `package.json` that
         * we come to. This is the path to the entry-point's containing package. For example if
         * `containingPath` is `/a/b/c` and `entryPointPath` is `/a/b/c/d/e` and there exists
         * `/a/b/c/d/package.json` and `/a/b/c/d/e/package.json`, then we will return `/a/b/c/d`.
         *
         * To account for nested `node_modules` we actually start the search at the last `node_modules` in
         * the `entryPointPath` that is below the `containingPath`. E.g. if `containingPath` is `/a/b/c`
         * and `entryPointPath` is `/a/b/c/d/node_modules/x/y/z`, we start the search at
         * `/a/b/c/d/node_modules`.
         */
        TargetedEntryPointFinder.prototype.computePackagePathFromContainingPath = function (entryPointPath, containingPath) {
            var e_3, _a;
            var packagePath = containingPath;
            var segments = this.splitPath(file_system_1.relative(containingPath, entryPointPath));
            var nodeModulesIndex = segments.lastIndexOf(file_system_1.relativeFrom('node_modules'));
            // If there are no `node_modules` in the relative path between the `basePath` and the
            // `entryPointPath` then just try the `basePath` as the `packagePath`.
            // (This can be the case with path-mapped entry-points.)
            if (nodeModulesIndex === -1) {
                if (this.fs.exists(file_system_1.join(packagePath, 'package.json'))) {
                    return packagePath;
                }
            }
            // Start the search at the deepest nested `node_modules` folder that is below the `basePath`
            // but above the `entryPointPath`, if there are any.
            while (nodeModulesIndex >= 0) {
                packagePath = file_system_1.join(packagePath, segments.shift());
                nodeModulesIndex--;
            }
            try {
                // Note that we start at the folder below the current candidate `packagePath` because the
                // initial candidate `packagePath` is either a `node_modules` folder or the `basePath` with
                // no `package.json`.
                for (var segments_1 = tslib_1.__values(segments), segments_1_1 = segments_1.next(); !segments_1_1.done; segments_1_1 = segments_1.next()) {
                    var segment = segments_1_1.value;
                    packagePath = file_system_1.join(packagePath, segment);
                    if (this.fs.exists(file_system_1.join(packagePath, 'package.json'))) {
                        return packagePath;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (segments_1_1 && !segments_1_1.done && (_a = segments_1.return)) _a.call(segments_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return null;
        };
        /**
         * Search up the directory tree from the `entryPointPath` looking for a `node_modules` directory
         * that we can use as a potential starting point for computing the package path.
         */
        TargetedEntryPointFinder.prototype.computePackagePathFromNearestNodeModules = function (entryPointPath) {
            var packagePath = entryPointPath;
            var scopedPackagePath = packagePath;
            var containerPath = this.fs.dirname(packagePath);
            while (!this.fs.isRoot(containerPath) && !containerPath.endsWith('node_modules')) {
                scopedPackagePath = packagePath;
                packagePath = containerPath;
                containerPath = this.fs.dirname(containerPath);
            }
            if (this.fs.exists(file_system_1.join(packagePath, 'package.json'))) {
                // The directory directly below `node_modules` is a package - use it
                return packagePath;
            }
            else if (this.fs.basename(packagePath).startsWith('@') &&
                this.fs.exists(file_system_1.join(scopedPackagePath, 'package.json'))) {
                // The directory directly below the `node_modules` is a scope and the directory directly
                // below that is a scoped package - use it
                return scopedPackagePath;
            }
            else {
                // If we get here then none of the `basePaths` contained the `entryPointPath` and the
                // `entryPointPath` contains no `node_modules` that contains a package or a scoped
                // package. All we can do is assume that this entry-point is a primary entry-point to a
                // package.
                return entryPointPath;
            }
        };
        /**
         * Split the given `path` into path segments using an FS independent algorithm.
         */
        TargetedEntryPointFinder.prototype.splitPath = function (path) {
            var segments = [];
            var container = this.fs.dirname(path);
            while (path !== container) {
                segments.unshift(this.fs.basename(path));
                path = container;
                container = this.fs.dirname(container);
            }
            return segments;
        };
        return TargetedEntryPointFinder;
    }(tracing_entry_point_finder_1.TracingEntryPointFinder));
    exports.TargetedEntryPointFinder = TargetedEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0ZWRfZW50cnlfcG9pbnRfZmluZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2VudHJ5X3BvaW50X2ZpbmRlci90YXJnZXRlZF9lbnRyeV9wb2ludF9maW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJFQUFxSDtJQUlySCxxRkFBMEQ7SUFFMUQsbUZBQWdHO0lBR2hHLDJIQUFxRTtJQUVyRTs7Ozs7O09BTUc7SUFDSDtRQUE4QyxvREFBdUI7UUFDbkUsa0NBQ0ksRUFBYyxFQUFFLE1BQXlCLEVBQUUsTUFBYyxFQUFFLFFBQTRCLEVBQ3ZGLFFBQXdCLEVBQUUsWUFBb0MsRUFDdEQsVUFBMEI7WUFIdEMsWUFJRSxrQkFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxTQUM1RDtZQUZXLGdCQUFVLEdBQVYsVUFBVSxDQUFnQjs7UUFFdEMsQ0FBQztRQUVEOzs7V0FHRztRQUNILGtEQUFlLEdBQWY7WUFBQSxpQkFXQztZQVZDLElBQU0sV0FBVyxHQUFHLGlCQUFNLGVBQWUsV0FBRSxDQUFDO1lBRTVDLElBQU0sYUFBYSxHQUNmLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxLQUFJLENBQUMsVUFBVSxFQUFyQyxDQUFxQyxDQUFDLENBQUM7WUFDcEYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixNQUFNLElBQUksS0FBSyxDQUNYLDhCQUEyQixhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksbUNBQStCO29CQUN2RixhQUFhLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJ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dUY7Z0JBQ3ZGLFdBQVc7Z0JBQ1gsT0FBTyxjQUFjLENBQUM7YUFDdkI7UUFDSCxDQUFDO1FBRUQ7O1dBRUc7UUFDSyw0Q0FBUyxHQUFqQixVQUFrQixJQUFnQztZQUNoRCxJQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsT0FBTyxJQUFJLEtBQUssU0FBUyxFQUFFO2dCQUN6QixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ2pCLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN4QztZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ2xCLENBQUM7UUFDSCwrQkFBQztJQUFELENBQUMsQUF2TkQsQ0FBOEMsb0RBQXVCLEdBdU5wRTtJQXZOWSw0REFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIEZpbGVTeXN0ZW0sIGpvaW4sIFBhdGhTZWdtZW50LCByZWxhdGl2ZSwgcmVsYXRpdmVGcm9tfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcbmltcG9ydCB7RW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXIsIFNvcnRlZEVudHJ5UG9pbnRzSW5mb30gZnJvbSAnLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfcmVzb2x2ZXInO1xuaW1wb3J0IHtoYXNCZWVuUHJvY2Vzc2VkfSBmcm9tICcuLi9wYWNrYWdlcy9idWlsZF9tYXJrZXInO1xuaW1wb3J0IHtOZ2NjQ29uZmlndXJhdGlvbn0gZnJvbSAnLi4vcGFja2FnZXMvY29uZmlndXJhdGlvbic7XG5pbXBvcnQge0VudHJ5UG9pbnRKc29uUHJvcGVydHksIGdldEVudHJ5UG9pbnRJbmZvLCBpc0VudHJ5UG9pbnR9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50JztcbmltcG9ydCB7UGF0aE1hcHBpbmdzfSBmcm9tICcuLi9wYXRoX21hcHBpbmdzJztcblxuaW1wb3J0IHtUcmFjaW5nRW50cnlQb2ludEZpbmRlcn0gZnJvbSAnLi90cmFjaW5nX2VudHJ5X3BvaW50X2ZpbmRlcic7XG5cbi8qKlxuICogQW4gRW50cnlQb2ludEZpbmRlciB0aGF0IHN0YXJ0cyBmcm9tIGEgdGFyZ2V0IGVudHJ5LXBvaW50IGFuZCBvbmx5IGZpbmRzXG4gKiBlbnRyeS1wb2ludHMgdGhhdCBhcmUgZGVwZW5kZW5jaWVzIG9mIHRoZSB0YXJnZXQuXG4gKlxuICogVGhpcyBpcyBmYXN0ZXIgdGhhbiBzZWFyY2hpbmcgdGhlIGVudGlyZSBmaWxlLXN5c3RlbSBmb3IgYWxsIHRoZSBlbnRyeS1wb2ludHMsXG4gKiBhbmQgaXMgdXNlZCBwcmltYXJpbHkgYnkgdGhlIENMSSBpbnRlZ3JhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFRhcmdldGVkRW50cnlQb2ludEZpbmRlciBleHRlbmRzIFRyYWNpbmdFbnRyeVBvaW50RmluZGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBmczogRmlsZVN5c3RlbSwgY29uZmlnOiBOZ2NjQ29uZmlndXJhdGlvbiwgbG9nZ2VyOiBMb2dnZXIsIHJlc29sdmVyOiBEZXBlbmRlbmN5UmVzb2x2ZXIsXG4gICAgICBiYXNlUGF0aDogQWJzb2x1dGVGc1BhdGgsIHBhdGhNYXBwaW5nczogUGF0aE1hcHBpbmdzfHVuZGVmaW5lZCxcbiAgICAgIHByaXZhdGUgdGFyZ2V0UGF0aDogQWJzb2x1dGVGc1BhdGgpIHtcbiAgICBzdXBlcihmcywgY29uZmlnLCBsb2dnZXIsIHJlc29sdmVyLCBiYXNlUGF0aCwgcGF0aE1hcHBpbmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggZm9yIEFuZ3VsYXIgZW50cnktcG9pbnRzIHRoYXQgY2FuIGJlIHJlYWNoZWQgZnJvbSB0aGUgZW50cnktcG9pbnQgc3BlY2lmaWVkIGJ5IHRoZSBnaXZlblxuICAgKiBgdGFyZ2V0UGF0aGAuXG4gICAqL1xuICBmaW5kRW50cnlQb2ludHMoKTogU29ydGVkRW50cnlQb2ludHNJbmZvIHtcbiAgICBjb25zdCBlbnRyeVBvaW50cyA9IHN1cGVyLmZpbmRFbnRyeVBvaW50cygpO1xuXG4gICAgY29uc3QgaW52YWxpZFRhcmdldCA9XG4gICAgICAgIGVudHJ5UG9pbnRzLmludmFsaWRFbnRyeVBvaW50cy5maW5kKGkgPT4gaS5lbnRyeVBvaW50LnBhdGggPT09IHRoaXMudGFyZ2V0UGF0aCk7XG4gICAgaWYgKGludmFsaWRUYXJnZXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBUaGUgdGFyZ2V0IGVudHJ5LXBvaW50IFwiJHtpbnZhbGlkVGFyZ2V0LmVudHJ5UG9pbnQubmFtZX1cIiBoYXMgbWlzc2luZyBkZXBlbmRlbmNpZXM6XFxuYCArXG4gICAgICAgICAgaW52YWxpZFRhcmdldC5taXNzaW5nRGVwZW5kZW5jaWVzLm1hcChkZXAgPT4gYCAtICR7ZGVwfVxcbmApLmpvaW4oJycpKTtcbiAgICB9XG4gICAgcmV0dXJuIGVudHJ5UG9pbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIHRoZSBlbnRyeS1wb2ludCBhdCB0aGUgZ2l2ZW4gYHRhcmdldFBhdGhgIG5lZWRzIHRvIGJlIHByb2Nlc3NlZC5cbiAgICpcbiAgICogQHBhcmFtIHByb3BlcnRpZXNUb0NvbnNpZGVyIHRoZSBwYWNrYWdlLmpzb24gcHJvcGVydGllcyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvclxuICAgKiAgICAgcHJvY2Vzc2luZy5cbiAgICogQHBhcmFtIGNvbXBpbGVBbGxGb3JtYXRzIHRydWUgaWYgYWxsIGZvcm1hdHMgbmVlZCB0byBiZSBwcm9jZXNzZWQsIG9yIGZhbHNlIGlmIGl0IGlzIGVub3VnaCBmb3JcbiAgICogICAgIG9uZSBvZiB0aGUgZm9ybWF0cyBjb3ZlcmVkIGJ5IHRoZSBgcHJvcGVydGllc1RvQ29uc2lkZXJgIGlzIHByb2Nlc3NlZC5cbiAgICovXG4gIHRhcmdldE5lZWRzUHJvY2Vzc2luZ09yQ2xlYW5pbmcoXG4gICAgICBwcm9wZXJ0aWVzVG9Db25zaWRlcjogRW50cnlQb2ludEpzb25Qcm9wZXJ0eVtdLCBjb21waWxlQWxsRm9ybWF0czogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGVudHJ5UG9pbnRXaXRoRGVwcyA9IHRoaXMuZ2V0RW50cnlQb2ludFdpdGhEZXBzKHRoaXMudGFyZ2V0UGF0aCk7XG4gICAgaWYgKGVudHJ5UG9pbnRXaXRoRGVwcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcHJvcGVydHkgb2YgcHJvcGVydGllc1RvQ29uc2lkZXIpIHtcbiAgICAgIGlmIChlbnRyeVBvaW50V2l0aERlcHMuZW50cnlQb2ludC5wYWNrYWdlSnNvbltwcm9wZXJ0eV0pIHtcbiAgICAgICAgLy8gSGVyZSBpcyBhIHByb3BlcnR5IHRoYXQgc2hvdWxkIGJlIHByb2Nlc3NlZC5cbiAgICAgICAgaWYgKCFoYXNCZWVuUHJvY2Vzc2VkKGVudHJ5UG9pbnRXaXRoRGVwcy5lbnRyeVBvaW50LnBhY2thZ2VKc29uLCBwcm9wZXJ0eSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbXBpbGVBbGxGb3JtYXRzKSB7XG4gICAgICAgICAgLy8gVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiBwcm9jZXNzZWQsIGFuZCB3ZSBvbmx5IG5lZWQgb25lLlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBBbGwgYHByb3BlcnRpZXNUb0NvbnNpZGVyYCB0aGF0IGFwcGVhciBpbiB0aGlzIGVudHJ5LXBvaW50IGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gICAgLy8gSW4gb3RoZXIgd29yZHMsIHRoZXJlIHdlcmUgbm8gcHJvcGVydGllcyB0aGF0IG5lZWQgcHJvY2Vzc2luZy5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlIGB0YXJnZXRQYXRoYCBmcm9tIHdoaWNoIHRvIHN0YXJ0IHRoZSB0cmFjZS5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRJbml0aWFsRW50cnlQb2ludFBhdGhzKCk6IEFic29sdXRlRnNQYXRoW10ge1xuICAgIHJldHVybiBbdGhpcy50YXJnZXRQYXRoXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIGBlbnRyeVBvaW50UGF0aGAsIGNvbXB1dGUsIG9yIHJldHJpZXZlLCB0aGUgZW50cnktcG9pbnQgaW5mb3JtYXRpb24sIGluY2x1ZGluZ1xuICAgKiBwYXRocyB0byBvdGhlciBlbnRyeS1wb2ludHMgdGhhdCB0aGlzIGVudHJ5LXBvaW50IGRlcGVuZHMgdXBvbi5cbiAgICpcbiAgICogQHBhcmFtIGVudHJ5UG9pbnRQYXRoIHRoZSBwYXRoIHRvIHRoZSBlbnRyeS1wb2ludCB3aG9zZSBpbmZvcm1hdGlvbiBhbmQgZGVwZW5kZW5jaWVzIGFyZSB0byBiZVxuICAgKiAgICAgcmV0cmlldmVkIG9yIGNvbXB1dGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZW50cnktcG9pbnQgYW5kIGl0cyBkZXBlbmRlbmNpZXMgb3IgYG51bGxgIGlmIHRoZSBlbnRyeS1wb2ludCBpcyBub3QgY29tcGlsZWQgYnlcbiAgICogICAgIEFuZ3VsYXIgb3IgY2Fubm90IGJlIGRldGVybWluZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0RW50cnlQb2ludFdpdGhEZXBzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzfG51bGwge1xuICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gdGhpcy5jb21wdXRlUGFja2FnZVBhdGgoZW50cnlQb2ludFBhdGgpO1xuICAgIGNvbnN0IGVudHJ5UG9pbnQgPVxuICAgICAgICBnZXRFbnRyeVBvaW50SW5mbyh0aGlzLmZzLCB0aGlzLmNvbmZpZywgdGhpcy5sb2dnZXIsIHBhY2thZ2VQYXRoLCBlbnRyeVBvaW50UGF0aCk7XG4gICAgaWYgKCFpc0VudHJ5UG9pbnQoZW50cnlQb2ludCkgfHwgIWVudHJ5UG9pbnQuY29tcGlsZWRCeUFuZ3VsYXIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5nZXRFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llcyhlbnRyeVBvaW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlIHRoZSBwYXRoIHRvIHRoZSBwYWNrYWdlIHRoYXQgY29udGFpbnMgdGhlIGdpdmVuIGVudHJ5LXBvaW50LlxuICAgKlxuICAgKiBJbiB0aGlzIGVudHJ5LXBvaW50IGZpbmRlciBpdCBpcyBub3QgdHJpdmlhbCB0byBmaW5kIHRoZSBjb250YWluaW5nIHBhY2thZ2UsIHNpbmNlIGl0IGlzXG4gICAqIHBvc3NpYmxlIHRoYXQgdGhpcyBlbnRyeS1wb2ludCBpcyBub3QgZGlyZWN0bHkgYmVsb3cgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBwYWNrYWdlLlxuICAgKiBNb3Jlb3ZlciwgdGhlIGltcG9ydCBwYXRoIGNvdWxkIGJlIGFmZmVjdGVkIGJ5IHBhdGgtbWFwcGluZy5cbiAgICpcbiAgICogQHBhcmFtIGVudHJ5UG9pbnRQYXRoIHRoZSBwYXRoIHRvIHRoZSBlbnRyeS1wb2ludCwgd2hvc2UgcGFja2FnZSBwYXRoIHdlIHdhbnQgdG8gY29tcHV0ZS5cbiAgICovXG4gIHByaXZhdGUgY29tcHV0ZVBhY2thZ2VQYXRoKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEFic29sdXRlRnNQYXRoIHtcbiAgICAvLyBGaXJzdCB0cnkgdGhlIG1haW4gYmFzZVBhdGgsIHRvIGF2b2lkIGhhdmluZyB0byBjb21wdXRlIHRoZSBvdGhlciBiYXNlUGF0aHMgZnJvbSB0aGUgcGF0aHNcbiAgICAvLyBtYXBwaW5ncywgd2hpY2ggY2FuIGJlIGNvbXB1dGF0aW9uYWxseSBpbnRlbnNpdmUuXG4gICAgaWYgKGVudHJ5UG9pbnRQYXRoLnN0YXJ0c1dpdGgodGhpcy5iYXNlUGF0aCkpIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gdGhpcy5jb21wdXRlUGFja2FnZVBhdGhGcm9tQ29udGFpbmluZ1BhdGgoZW50cnlQb2ludFBhdGgsIHRoaXMuYmFzZVBhdGgpO1xuICAgICAgaWYgKHBhY2thZ2VQYXRoICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlUGF0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGUgbWFpbiBgYmFzZVBhdGhgIGRpZG4ndCB3b3JrIG91dCBzbyBub3cgd2UgdHJ5IHRoZSBgYmFzZVBhdGhzYCBjb21wdXRlZCBmcm9tIHRoZSBwYXRoc1xuICAgIC8vIG1hcHBpbmdzIGluIGB0c2NvbmZpZy5qc29uYC5cbiAgICBmb3IgKGNvbnN0IGJhc2VQYXRoIG9mIHRoaXMuZ2V0QmFzZVBhdGhzKCkpIHtcbiAgICAgIGlmIChlbnRyeVBvaW50UGF0aC5zdGFydHNXaXRoKGJhc2VQYXRoKSkge1xuICAgICAgICBjb25zdCBwYWNrYWdlUGF0aCA9IHRoaXMuY29tcHV0ZVBhY2thZ2VQYXRoRnJvbUNvbnRhaW5pbmdQYXRoKGVudHJ5UG9pbnRQYXRoLCBiYXNlUGF0aCk7XG4gICAgICAgIGlmIChwYWNrYWdlUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBwYWNrYWdlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBnb3QgaGVyZSB0aGVuIHdlIGNvdWxkbid0IGZpbmQgYSBgcGFja2FnZVBhdGhgIGZvciB0aGUgY3VycmVudCBgYmFzZVBhdGhgLlxuICAgICAgICAvLyBTaW5jZSBgYmFzZVBhdGhgcyBhcmUgZ3VhcmFudGVlZCBub3QgdG8gYmUgYSBzdWItZGlyZWN0b3J5IG9mIGVhY2ggb3RoZXIgdGhlbiBubyBvdGhlclxuICAgICAgICAvLyBgYmFzZVBhdGhgIHdpbGwgbWF0Y2ggZWl0aGVyLlxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBpZiB3ZSBjb3VsZG4ndCBmaW5kIGEgYHBhY2thZ2VQYXRoYCB1c2luZyBgYmFzZVBhdGhzYCB0aGVuIHRyeSB0byBmaW5kIHRoZSBuZWFyZXN0XG4gICAgLy8gYG5vZGVfbW9kdWxlc2AgdGhhdCBjb250YWlucyB0aGUgYGVudHJ5UG9pbnRQYXRoYCwgaWYgdGhlcmUgaXMgb25lLCBhbmQgdXNlIGl0IGFzIGFcbiAgICAvLyBgYmFzZVBhdGhgLlxuICAgIHJldHVybiB0aGlzLmNvbXB1dGVQYWNrYWdlUGF0aEZyb21OZWFyZXN0Tm9kZU1vZHVsZXMoZW50cnlQb2ludFBhdGgpO1xuICB9XG5cblxuICAvKipcbiAgICogU2VhcmNoIGRvd24gdG8gdGhlIGBlbnRyeVBvaW50UGF0aGAgZnJvbSB0aGUgYGNvbnRhaW5pbmdQYXRoYCBmb3IgdGhlIGZpcnN0IGBwYWNrYWdlLmpzb25gIHRoYXRcbiAgICogd2UgY29tZSB0by4gVGhpcyBpcyB0aGUgcGF0aCB0byB0aGUgZW50cnktcG9pbnQncyBjb250YWluaW5nIHBhY2thZ2UuIEZvciBleGFtcGxlIGlmXG4gICAqIGBjb250YWluaW5nUGF0aGAgaXMgYC9hL2IvY2AgYW5kIGBlbnRyeVBvaW50UGF0aGAgaXMgYC9hL2IvYy9kL2VgIGFuZCB0aGVyZSBleGlzdHNcbiAgICogYC9hL2IvYy9kL3BhY2thZ2UuanNvbmAgYW5kIGAvYS9iL2MvZC9lL3BhY2thZ2UuanNvbmAsIHRoZW4gd2Ugd2lsbCByZXR1cm4gYC9hL2IvYy9kYC5cbiAgICpcbiAgICogVG8gYWNjb3VudCBmb3IgbmVzdGVkIGBub2RlX21vZHVsZXNgIHdlIGFjdHVhbGx5IHN0YXJ0IHRoZSBzZWFyY2ggYXQgdGhlIGxhc3QgYG5vZGVfbW9kdWxlc2AgaW5cbiAgICogdGhlIGBlbnRyeVBvaW50UGF0aGAgdGhhdCBpcyBiZWxvdyB0aGUgYGNvbnRhaW5pbmdQYXRoYC4gRS5nLiBpZiBgY29udGFpbmluZ1BhdGhgIGlzIGAvYS9iL2NgXG4gICAqIGFuZCBgZW50cnlQb2ludFBhdGhgIGlzIGAvYS9iL2MvZC9ub2RlX21vZHVsZXMveC95L3pgLCB3ZSBzdGFydCB0aGUgc2VhcmNoIGF0XG4gICAqIGAvYS9iL2MvZC9ub2RlX21vZHVsZXNgLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlUGFja2FnZVBhdGhGcm9tQ29udGFpbmluZ1BhdGgoXG4gICAgICBlbnRyeVBvaW50UGF0aDogQWJzb2x1dGVGc1BhdGgsIGNvbnRhaW5pbmdQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEFic29sdXRlRnNQYXRofG51bGwge1xuICAgIGxldCBwYWNrYWdlUGF0aCA9IGNvbnRhaW5pbmdQYXRoO1xuICAgIGNvbnN0IHNlZ21lbnRzID0gdGhpcy5zcGxpdFBhdGgocmVsYXRpdmUoY29udGFpbmluZ1BhdGgsIGVudHJ5UG9pbnRQYXRoKSk7XG4gICAgbGV0IG5vZGVNb2R1bGVzSW5kZXggPSBzZWdtZW50cy5sYXN0SW5kZXhPZihyZWxhdGl2ZUZyb20oJ25vZGVfbW9kdWxlcycpKTtcblxuICAgIC8vIElmIHRoZXJlIGFyZSBubyBgbm9kZV9tb2R1bGVzYCBpbiB0aGUgcmVsYXRpdmUgcGF0aCBiZXR3ZWVuIHRoZSBgYmFzZVBhdGhgIGFuZCB0aGVcbiAgICAvLyBgZW50cnlQb2ludFBhdGhgIHRoZW4ganVzdCB0cnkgdGhlIGBiYXNlUGF0aGAgYXMgdGhlIGBwYWNrYWdlUGF0aGAuXG4gICAgLy8gKFRoaXMgY2FuIGJlIHRoZSBjYXNlIHdpdGggcGF0aC1tYXBwZWQgZW50cnktcG9pbnRzLilcbiAgICBpZiAobm9kZU1vZHVsZXNJbmRleCA9PT0gLTEpIHtcbiAgICAgIGlmICh0aGlzLmZzLmV4aXN0cyhqb2luKHBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJykpKSB7XG4gICAgICAgIHJldHVybiBwYWNrYWdlUGF0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTdGFydCB0aGUgc2VhcmNoIGF0IHRoZSBkZWVwZXN0IG5lc3RlZCBgbm9kZV9tb2R1bGVzYCBmb2xkZXIgdGhhdCBpcyBiZWxvdyB0aGUgYGJhc2VQYXRoYFxuICAgIC8vIGJ1dCBhYm92ZSB0aGUgYGVudHJ5UG9pbnRQYXRoYCwgaWYgdGhlcmUgYXJlIGFueS5cbiAgICB3aGlsZSAobm9kZU1vZHVsZXNJbmRleCA+PSAwKSB7XG4gICAgICBwYWNrYWdlUGF0aCA9IGpvaW4ocGFja2FnZVBhdGgsIHNlZ21lbnRzLnNoaWZ0KCkhKTtcbiAgICAgIG5vZGVNb2R1bGVzSW5kZXgtLTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgd2Ugc3RhcnQgYXQgdGhlIGZvbGRlciBiZWxvdyB0aGUgY3VycmVudCBjYW5kaWRhdGUgYHBhY2thZ2VQYXRoYCBiZWNhdXNlIHRoZVxuICAgIC8vIGluaXRpYWwgY2FuZGlkYXRlIGBwYWNrYWdlUGF0aGAgaXMgZWl0aGVyIGEgYG5vZGVfbW9kdWxlc2AgZm9sZGVyIG9yIHRoZSBgYmFzZVBhdGhgIHdpdGhcbiAgICAvLyBubyBgcGFja2FnZS5qc29uYC5cbiAgICBmb3IgKGNvbnN0IHNlZ21lbnQgb2Ygc2VnbWVudHMpIHtcbiAgICAgIHBhY2thZ2VQYXRoID0gam9pbihwYWNrYWdlUGF0aCwgc2VnbWVudCk7XG4gICAgICBpZiAodGhpcy5mcy5leGlzdHMoam9pbihwYWNrYWdlUGF0aCwgJ3BhY2thZ2UuanNvbicpKSkge1xuICAgICAgICByZXR1cm4gcGFja2FnZVBhdGg7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCB1cCB0aGUgZGlyZWN0b3J5IHRyZWUgZnJvbSB0aGUgYGVudHJ5UG9pbnRQYXRoYCBsb29raW5nIGZvciBhIGBub2RlX21vZHVsZXNgIGRpcmVjdG9yeVxuICAgKiB0aGF0IHdlIGNhbiB1c2UgYXMgYSBwb3RlbnRpYWwgc3RhcnRpbmcgcG9pbnQgZm9yIGNvbXB1dGluZyB0aGUgcGFja2FnZSBwYXRoLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlUGFja2FnZVBhdGhGcm9tTmVhcmVzdE5vZGVNb2R1bGVzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IEFic29sdXRlRnNQYXRoIHtcbiAgICBsZXQgcGFja2FnZVBhdGggPSBlbnRyeVBvaW50UGF0aDtcbiAgICBsZXQgc2NvcGVkUGFja2FnZVBhdGggPSBwYWNrYWdlUGF0aDtcbiAgICBsZXQgY29udGFpbmVyUGF0aCA9IHRoaXMuZnMuZGlybmFtZShwYWNrYWdlUGF0aCk7XG4gICAgd2hpbGUgKCF0aGlzLmZzLmlzUm9vdChjb250YWluZXJQYXRoKSAmJiAhY29udGFpbmVyUGF0aC5lbmRzV2l0aCgnbm9kZV9tb2R1bGVzJykpIHtcbiAgICAgIHNjb3BlZFBhY2thZ2VQYXRoID0gcGFja2FnZVBhdGg7XG4gICAgICBwYWNrYWdlUGF0aCA9IGNvbnRhaW5lclBhdGg7XG4gICAgICBjb250YWluZXJQYXRoID0gdGhpcy5mcy5kaXJuYW1lKGNvbnRhaW5lclBhdGgpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmZzLmV4aXN0cyhqb2luKHBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJykpKSB7XG4gICAgICAvLyBUaGUgZGlyZWN0b3J5IGRpcmVjdGx5IGJlbG93IGBub2RlX21vZHVsZXNgIGlzIGEgcGFja2FnZSAtIHVzZSBpdFxuICAgICAgcmV0dXJuIHBhY2thZ2VQYXRoO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHRoaXMuZnMuYmFzZW5hbWUocGFja2FnZVBhdGgpLnN0YXJ0c1dpdGgoJ0AnKSAmJlxuICAgICAgICB0aGlzLmZzLmV4aXN0cyhqb2luKHNjb3BlZFBhY2thZ2VQYXRoLCAncGFja2FnZS5qc29uJykpKSB7XG4gICAgICAvLyBUaGUgZGlyZWN0b3J5IGRpcmVjdGx5IGJlbG93IHRoZSBgbm9kZV9tb2R1bGVzYCBpcyBhIHNjb3BlIGFuZCB0aGUgZGlyZWN0b3J5IGRpcmVjdGx5XG4gICAgICAvLyBiZWxvdyB0aGF0IGlzIGEgc2NvcGVkIHBhY2thZ2UgLSB1c2UgaXRcbiAgICAgIHJldHVybiBzY29wZWRQYWNrYWdlUGF0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgd2UgZ2V0IGhlcmUgdGhlbiBub25lIG9mIHRoZSBgYmFzZVBhdGhzYCBjb250YWluZWQgdGhlIGBlbnRyeVBvaW50UGF0aGAgYW5kIHRoZVxuICAgICAgLy8gYGVudHJ5UG9pbnRQYXRoYCBjb250YWlucyBubyBgbm9kZV9tb2R1bGVzYCB0aGF0IGNvbnRhaW5zIGEgcGFja2FnZSBvciBhIHNjb3BlZFxuICAgICAgLy8gcGFja2FnZS4gQWxsIHdlIGNhbiBkbyBpcyBhc3N1bWUgdGhhdCB0aGlzIGVudHJ5LXBvaW50IGlzIGEgcHJpbWFyeSBlbnRyeS1wb2ludCB0byBhXG4gICAgICAvLyBwYWNrYWdlLlxuICAgICAgcmV0dXJuIGVudHJ5UG9pbnRQYXRoO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdCB0aGUgZ2l2ZW4gYHBhdGhgIGludG8gcGF0aCBzZWdtZW50cyB1c2luZyBhbiBGUyBpbmRlcGVuZGVudCBhbGdvcml0aG0uXG4gICAqL1xuICBwcml2YXRlIHNwbGl0UGF0aChwYXRoOiBQYXRoU2VnbWVudHxBYnNvbHV0ZUZzUGF0aCkge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gW107XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZnMuZGlybmFtZShwYXRoKTtcbiAgICB3aGlsZSAocGF0aCAhPT0gY29udGFpbmVyKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KHRoaXMuZnMuYmFzZW5hbWUocGF0aCkpO1xuICAgICAgcGF0aCA9IGNvbnRhaW5lcjtcbiAgICAgIGNvbnRhaW5lciA9IHRoaXMuZnMuZGlybmFtZShjb250YWluZXIpO1xuICAgIH1cbiAgICByZXR1cm4gc2VnbWVudHM7XG4gIH1cbn1cbiJdfQ==