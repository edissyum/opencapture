(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/entry_point_collector", ["require", "exports", "tslib", "@angular/compiler-cli/ngcc/src/packages/entry_point", "@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EntryPointCollector = void 0;
    var tslib_1 = require("tslib");
    var entry_point_1 = require("@angular/compiler-cli/ngcc/src/packages/entry_point");
    var new_entry_point_file_writer_1 = require("@angular/compiler-cli/ngcc/src/writing/new_entry_point_file_writer");
    /**
     * A class that traverses a file-tree, starting at a given path, looking for all entry-points,
     * also capturing the dependencies of each entry-point that is found.
     */
    var EntryPointCollector = /** @class */ (function () {
        function EntryPointCollector(fs, config, logger, resolver) {
            this.fs = fs;
            this.config = config;
            this.logger = logger;
            this.resolver = resolver;
        }
        /**
         * Look for Angular packages that need to be compiled, starting at the source directory.
         * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
         *
         * @param sourceDirectory An absolute path to the root directory where searching begins.
         * @returns an array of `EntryPoint`s that were found within `sourceDirectory`.
         */
        EntryPointCollector.prototype.walkDirectoryForPackages = function (sourceDirectory) {
            var e_1, _a;
            // Try to get a primary entry point from this directory
            var primaryEntryPoint = entry_point_1.getEntryPointInfo(this.fs, this.config, this.logger, sourceDirectory, sourceDirectory);
            // If there is an entry-point but it is not compatible with ngcc (it has a bad package.json or
            // invalid typings) then exit. It is unlikely that such an entry point has a dependency on an
            // Angular library.
            if (primaryEntryPoint === entry_point_1.INCOMPATIBLE_ENTRY_POINT) {
                return [];
            }
            var entryPoints = [];
            if (primaryEntryPoint !== entry_point_1.NO_ENTRY_POINT) {
                if (primaryEntryPoint !== entry_point_1.IGNORED_ENTRY_POINT) {
                    entryPoints.push(this.resolver.getEntryPointWithDependencies(primaryEntryPoint));
                }
                this.collectSecondaryEntryPoints(entryPoints, sourceDirectory, sourceDirectory, this.fs.readdir(sourceDirectory));
                // Also check for any nested node_modules in this package but only if at least one of the
                // entry-points was compiled by Angular.
                if (entryPoints.some(function (e) { return e.entryPoint.compiledByAngular; })) {
                    var nestedNodeModulesPath = this.fs.join(sourceDirectory, 'node_modules');
                    if (this.fs.exists(nestedNodeModulesPath)) {
                        entryPoints.push.apply(entryPoints, tslib_1.__spread(this.walkDirectoryForPackages(nestedNodeModulesPath)));
                    }
                }
                return entryPoints;
            }
            try {
                // The `sourceDirectory` was not a package (i.e. there was no package.json)
                // So search its sub-directories for Angular packages and entry-points
                for (var _b = tslib_1.__values(this.fs.readdir(sourceDirectory)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var path = _c.value;
                    if (isIgnorablePath(path)) {
                        // Ignore hidden files, node_modules and ngcc directory
                        continue;
                    }
                    var absolutePath = this.fs.resolve(sourceDirectory, path);
                    var stat = this.fs.lstat(absolutePath);
                    if (stat.isSymbolicLink() || !stat.isDirectory()) {
                        // Ignore symbolic links and non-directories
                        continue;
                    }
                    entryPoints.push.apply(entryPoints, tslib_1.__spread(this.walkDirectoryForPackages(this.fs.join(sourceDirectory, path))));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return entryPoints;
        };
        /**
         * Search the `directory` looking for any secondary entry-points for a package, adding any that
         * are found to the `entryPoints` array.
         *
         * @param entryPoints An array where we will add any entry-points found in this directory.
         * @param packagePath The absolute path to the package that may contain entry-points.
         * @param directory The current directory being searched.
         * @param paths The paths contained in the current `directory`.
         */
        EntryPointCollector.prototype.collectSecondaryEntryPoints = function (entryPoints, packagePath, directory, paths) {
            var e_2, _a;
            var _this = this;
            var _loop_1 = function (path) {
                if (isIgnorablePath(path)) {
                    return "continue";
                }
                var absolutePath = this_1.fs.resolve(directory, path);
                var stat = this_1.fs.lstat(absolutePath);
                if (stat.isSymbolicLink()) {
                    return "continue";
                }
                var isDirectory = stat.isDirectory();
                if (!path.endsWith('.js') && !isDirectory) {
                    return "continue";
                }
                // If the path is a JS file then strip its extension and see if we can match an
                // entry-point (even if it is an ignored one).
                var possibleEntryPointPath = isDirectory ? absolutePath : stripJsExtension(absolutePath);
                var subEntryPoint = entry_point_1.getEntryPointInfo(this_1.fs, this_1.config, this_1.logger, packagePath, possibleEntryPointPath);
                if (entry_point_1.isEntryPoint(subEntryPoint)) {
                    entryPoints.push(this_1.resolver.getEntryPointWithDependencies(subEntryPoint));
                }
                if (!isDirectory) {
                    return "continue";
                }
                // If not an entry-point itself, this directory may contain entry-points of its own.
                var canContainEntryPoints = subEntryPoint === entry_point_1.NO_ENTRY_POINT || subEntryPoint === entry_point_1.INCOMPATIBLE_ENTRY_POINT;
                var childPaths = this_1.fs.readdir(absolutePath);
                if (canContainEntryPoints &&
                    childPaths.some(function (childPath) { return childPath.endsWith('.js') &&
                        _this.fs.stat(_this.fs.resolve(absolutePath, childPath)).isFile(); })) {
                    return "continue";
                }
                this_1.collectSecondaryEntryPoints(entryPoints, packagePath, absolutePath, childPaths);
            };
            var this_1 = this;
            try {
                for (var paths_1 = tslib_1.__values(paths), paths_1_1 = paths_1.next(); !paths_1_1.done; paths_1_1 = paths_1.next()) {
                    var path = paths_1_1.value;
                    _loop_1(path);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (paths_1_1 && !paths_1_1.done && (_a = paths_1.return)) _a.call(paths_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
        };
        return EntryPointCollector;
    }());
    exports.EntryPointCollector = EntryPointCollector;
    function stripJsExtension(filePath) {
        return filePath.replace(/\.js$/, '');
    }
    function isIgnorablePath(path) {
        return path.startsWith('.') || path === 'node_modules' || path === new_entry_point_file_writer_1.NGCC_DIRECTORY;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlfcG9pbnRfY29sbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL25nY2Mvc3JjL2VudHJ5X3BvaW50X2ZpbmRlci9lbnRyeV9wb2ludF9jb2xsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWFBLG1GQUF1STtJQUN2SSxrSEFBc0U7SUFFdEU7OztPQUdHO0lBQ0g7UUFDRSw2QkFDWSxFQUFjLEVBQVUsTUFBeUIsRUFBVSxNQUFjLEVBQ3pFLFFBQTRCO1lBRDVCLE9BQUUsR0FBRixFQUFFLENBQVk7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtZQUFVLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDekUsYUFBUSxHQUFSLFFBQVEsQ0FBb0I7UUFBRyxDQUFDO1FBRTVDOzs7Ozs7V0FNRztRQUNILHNEQUF3QixHQUF4QixVQUF5QixlQUErQjs7WUFDdEQsdURBQXVEO1lBQ3ZELElBQU0saUJBQWlCLEdBQ25CLCtCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUUzRiw4RkFBOEY7WUFDOUYsNkZBQTZGO1lBQzdGLG1CQUFtQjtZQUNuQixJQUFJLGlCQUFpQixLQUFLLHNDQUF3QixFQUFFO2dCQUNsRCxPQUFPLEVBQUUsQ0FBQzthQUNYO1lBRUQsSUFBTSxXQUFXLEdBQWlDLEVBQUUsQ0FBQztZQUNyRCxJQUFJLGlCQUFpQixLQUFLLDRCQUFjLEVBQUU7Z0JBQ3hDLElBQUksaUJBQWlCLEtBQUssaUNBQW1CLEVBQUU7b0JBQzdDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw2QkFBNkIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7aUJBQ2xGO2dCQUNELElBQUks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QWMsSUFBSSxJQUFJLEtBQUssNENBQWMsQ0FBQztJQUNwRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtLCBQYXRoU2VnbWVudH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvbG9nZ2luZyc7XG5cbmltcG9ydCB7RW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXN9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X2hvc3QnO1xuaW1wb3J0IHtEZXBlbmRlbmN5UmVzb2x2ZXJ9IGZyb20gJy4uL2RlcGVuZGVuY2llcy9kZXBlbmRlbmN5X3Jlc29sdmVyJztcbmltcG9ydCB7TmdjY0NvbmZpZ3VyYXRpb259IGZyb20gJy4uL3BhY2thZ2VzL2NvbmZpZ3VyYXRpb24nO1xuaW1wb3J0IHtnZXRFbnRyeVBvaW50SW5mbywgSUdOT1JFRF9FTlRSWV9QT0lOVCwgSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5ULCBpc0VudHJ5UG9pbnQsIE5PX0VOVFJZX1BPSU5UfSBmcm9tICcuLi9wYWNrYWdlcy9lbnRyeV9wb2ludCc7XG5pbXBvcnQge05HQ0NfRElSRUNUT1JZfSBmcm9tICcuLi93cml0aW5nL25ld19lbnRyeV9wb2ludF9maWxlX3dyaXRlcic7XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IHRyYXZlcnNlcyBhIGZpbGUtdHJlZSwgc3RhcnRpbmcgYXQgYSBnaXZlbiBwYXRoLCBsb29raW5nIGZvciBhbGwgZW50cnktcG9pbnRzLFxuICogYWxzbyBjYXB0dXJpbmcgdGhlIGRlcGVuZGVuY2llcyBvZiBlYWNoIGVudHJ5LXBvaW50IHRoYXQgaXMgZm91bmQuXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnRyeVBvaW50Q29sbGVjdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGZzOiBGaWxlU3lzdGVtLCBwcml2YXRlIGNvbmZpZzogTmdjY0NvbmZpZ3VyYXRpb24sIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIsXG4gICAgICBwcml2YXRlIHJlc29sdmVyOiBEZXBlbmRlbmN5UmVzb2x2ZXIpIHt9XG5cbiAgLyoqXG4gICAqIExvb2sgZm9yIEFuZ3VsYXIgcGFja2FnZXMgdGhhdCBuZWVkIHRvIGJlIGNvbXBpbGVkLCBzdGFydGluZyBhdCB0aGUgc291cmNlIGRpcmVjdG9yeS5cbiAgICogVGhlIGZ1bmN0aW9uIHdpbGwgcmVjdXJzZSBpbnRvIGRpcmVjdG9yaWVzIHRoYXQgc3RhcnQgd2l0aCBgQC4uLmAsIGUuZy4gYEBhbmd1bGFyLy4uLmAuXG4gICAqXG4gICAqIEBwYXJhbSBzb3VyY2VEaXJlY3RvcnkgQW4gYWJzb2x1dGUgcGF0aCB0byB0aGUgcm9vdCBkaXJlY3Rvcnkgd2hlcmUgc2VhcmNoaW5nIGJlZ2lucy5cbiAgICogQHJldHVybnMgYW4gYXJyYXkgb2YgYEVudHJ5UG9pbnRgcyB0aGF0IHdlcmUgZm91bmQgd2l0aGluIGBzb3VyY2VEaXJlY3RvcnlgLlxuICAgKi9cbiAgd2Fsa0RpcmVjdG9yeUZvclBhY2thZ2VzKHNvdXJjZURpcmVjdG9yeTogQWJzb2x1dGVGc1BhdGgpOiBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc1tdIHtcbiAgICAvLyBUcnkgdG8gZ2V0IGEgcHJpbWFyeSBlbnRyeSBwb2ludCBmcm9tIHRoaXMgZGlyZWN0b3J5XG4gICAgY29uc3QgcHJpbWFyeUVudHJ5UG9pbnQgPVxuICAgICAgICBnZXRFbnRyeVBvaW50SW5mbyh0aGlzLmZzLCB0aGlzLmNvbmZpZywgdGhpcy5sb2dnZXIsIHNvdXJjZURpcmVjdG9yeSwgc291cmNlRGlyZWN0b3J5KTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGFuIGVudHJ5LXBvaW50IGJ1dCBpdCBpcyBub3QgY29tcGF0aWJsZSB3aXRoIG5nY2MgKGl0IGhhcyBhIGJhZCBwYWNrYWdlLmpzb24gb3JcbiAgICAvLyBpbnZhbGlkIHR5cGluZ3MpIHRoZW4gZXhpdC4gSXQgaXMgdW5saWtlbHkgdGhhdCBzdWNoIGFuIGVudHJ5IHBvaW50IGhhcyBhIGRlcGVuZGVuY3kgb24gYW5cbiAgICAvLyBBbmd1bGFyIGxpYnJhcnkuXG4gICAgaWYgKHByaW1hcnlFbnRyeVBvaW50ID09PSBJTkNPTVBBVElCTEVfRU5UUllfUE9JTlQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCBlbnRyeVBvaW50czogRW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXNbXSA9IFtdO1xuICAgIGlmIChwcmltYXJ5RW50cnlQb2ludCAhPT0gTk9fRU5UUllfUE9JTlQpIHtcbiAgICAgIGlmIChwcmltYXJ5RW50cnlQb2ludCAhPT0gSUdOT1JFRF9FTlRSWV9QT0lOVCkge1xuICAgICAgICBlbnRyeVBvaW50cy5wdXNoKHRoaXMucmVzb2x2ZXIuZ2V0RW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXMocHJpbWFyeUVudHJ5UG9pbnQpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29sbGVjdFNlY29uZGFyeUVudHJ5UG9pbnRzKFxuICAgICAgICAgIGVudHJ5UG9pbnRzLCBzb3VyY2VEaXJlY3RvcnksIHNvdXJjZURpcmVjdG9yeSwgdGhpcy5mcy5yZWFkZGlyKHNvdXJjZURpcmVjdG9yeSkpO1xuXG4gICAgICAvLyBBbHNvIGNoZWNrIGZvciBhbnkgbmVzdGVkIG5vZGVfbW9kdWxlcyBpbiB0aGlzIHBhY2thZ2UgYnV0IG9ubHkgaWYgYXQgbGVhc3Qgb25lIG9mIHRoZVxuICAgICAgLy8gZW50cnktcG9pbnRzIHdhcyBjb21waWxlZCBieSBBbmd1bGFyLlxuICAgICAgaWYgKGVudHJ5UG9pbnRzLnNvbWUoZSA9PiBlLmVudHJ5UG9pbnQuY29tcGlsZWRCeUFuZ3VsYXIpKSB7XG4gICAgICAgIGNvbnN0IG5lc3RlZE5vZGVNb2R1bGVzUGF0aCA9IHRoaXMuZnMuam9pbihzb3VyY2VEaXJlY3RvcnksICdub2RlX21vZHVsZXMnKTtcbiAgICAgICAgaWYgKHRoaXMuZnMuZXhpc3RzKG5lc3RlZE5vZGVNb2R1bGVzUGF0aCkpIHtcbiAgICAgICAgICBlbnRyeVBvaW50cy5wdXNoKC4uLnRoaXMud2Fsa0RpcmVjdG9yeUZvclBhY2thZ2VzKG5lc3RlZE5vZGVNb2R1bGVzUGF0aCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbnRyeVBvaW50cztcbiAgICB9XG5cbiAgICAvLyBUaGUgYHNvdXJjZURpcmVjdG9yeWAgd2FzIG5vdCBhIHBhY2thZ2UgKGkuZS4gdGhlcmUgd2FzIG5vIHBhY2thZ2UuanNvbilcbiAgICAvLyBTbyBzZWFyY2ggaXRzIHN1Yi1kaXJlY3RvcmllcyBmb3IgQW5ndWxhciBwYWNrYWdlcyBhbmQgZW50cnktcG9pbnRzXG4gICAgZm9yIChjb25zdCBwYXRoIG9mIHRoaXMuZnMucmVhZGRpcihzb3VyY2VEaXJlY3RvcnkpKSB7XG4gICAgICBpZiAoaXNJZ25vcmFibGVQYXRoKHBhdGgpKSB7XG4gICAgICAgIC8vIElnbm9yZSBoaWRkZW4gZmlsZXMsIG5vZGVfbW9kdWxlcyBhbmQgbmdjYyBkaXJlY3RvcnlcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHRoaXMuZnMucmVzb2x2ZShzb3VyY2VEaXJlY3RvcnksIHBhdGgpO1xuICAgICAgY29uc3Qgc3RhdCA9IHRoaXMuZnMubHN0YXQoYWJzb2x1dGVQYXRoKTtcbiAgICAgIGlmIChzdGF0LmlzU3ltYm9saWNMaW5rKCkgfHwgIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAvLyBJZ25vcmUgc3ltYm9saWMgbGlua3MgYW5kIG5vbi1kaXJlY3Rvcmllc1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZW50cnlQb2ludHMucHVzaCguLi50aGlzLndhbGtEaXJlY3RvcnlGb3JQYWNrYWdlcyh0aGlzLmZzLmpvaW4oc291cmNlRGlyZWN0b3J5LCBwYXRoKSkpO1xuICAgIH1cblxuICAgIHJldHVybiBlbnRyeVBvaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWFyY2ggdGhlIGBkaXJlY3RvcnlgIGxvb2tpbmcgZm9yIGFueSBzZWNvbmRhcnkgZW50cnktcG9pbnRzIGZvciBhIHBhY2thZ2UsIGFkZGluZyBhbnkgdGhhdFxuICAgKiBhcmUgZm91bmQgdG8gdGhlIGBlbnRyeVBvaW50c2AgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBlbnRyeVBvaW50cyBBbiBhcnJheSB3aGVyZSB3ZSB3aWxsIGFkZCBhbnkgZW50cnktcG9pbnRzIGZvdW5kIGluIHRoaXMgZGlyZWN0b3J5LlxuICAgKiBAcGFyYW0gcGFja2FnZVBhdGggVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIHBhY2thZ2UgdGhhdCBtYXkgY29udGFpbiBlbnRyeS1wb2ludHMuXG4gICAqIEBwYXJhbSBkaXJlY3RvcnkgVGhlIGN1cnJlbnQgZGlyZWN0b3J5IGJlaW5nIHNlYXJjaGVkLlxuICAgKiBAcGFyYW0gcGF0aHMgVGhlIHBhdGhzIGNvbnRhaW5lZCBpbiB0aGUgY3VycmVudCBgZGlyZWN0b3J5YC5cbiAgICovXG4gIHByaXZhdGUgY29sbGVjdFNlY29uZGFyeUVudHJ5UG9pbnRzKFxuICAgICAgZW50cnlQb2ludHM6IEVudHJ5UG9pbnRXaXRoRGVwZW5kZW5jaWVzW10sIHBhY2thZ2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICAgIGRpcmVjdG9yeTogQWJzb2x1dGVGc1BhdGgsIHBhdGhzOiBQYXRoU2VnbWVudFtdKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgICBpZiAoaXNJZ25vcmFibGVQYXRoKHBhdGgpKSB7XG4gICAgICAgIC8vIElnbm9yZSBoaWRkZW4gZmlsZXMsIG5vZGVfbW9kdWxlcyBhbmQgbmdjYyBkaXJlY3RvcnlcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHRoaXMuZnMucmVzb2x2ZShkaXJlY3RvcnksIHBhdGgpO1xuICAgICAgY29uc3Qgc3RhdCA9IHRoaXMuZnMubHN0YXQoYWJzb2x1dGVQYXRoKTtcbiAgICAgIGlmIChzdGF0LmlzU3ltYm9saWNMaW5rKCkpIHtcbiAgICAgICAgLy8gSWdub3JlIHN5bWJvbGljIGxpbmtzXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc0RpcmVjdG9yeSA9IHN0YXQuaXNEaXJlY3RvcnkoKTtcbiAgICAgIGlmICghcGF0aC5lbmRzV2l0aCgnLmpzJykgJiYgIWlzRGlyZWN0b3J5KSB7XG4gICAgICAgIC8vIElnbm9yZSBmaWxlcyB0aGF0IGRvIG5vdCBlbmQgaW4gYC5qc2BcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBwYXRoIGlzIGEgSlMgZmlsZSB0aGVuIHN0cmlwIGl0cyBleHRlbnNpb24gYW5kIHNlZSBpZiB3ZSBjYW4gbWF0Y2ggYW5cbiAgICAgIC8vIGVudHJ5LXBvaW50IChldmVuIGlmIGl0IGlzIGFuIGlnbm9yZWQgb25lKS5cbiAgICAgIGNvbnN0IHBvc3NpYmxlRW50cnlQb2ludFBhdGggPSBpc0RpcmVjdG9yeSA/IGFic29sdXRlUGF0aCA6IHN0cmlwSnNFeHRlbnNpb24oYWJzb2x1dGVQYXRoKTtcbiAgICAgIGNvbnN0IHN1YkVudHJ5UG9pbnQgPVxuICAgICAgICAgIGdldEVudHJ5UG9pbnRJbmZvKHRoaXMuZnMsIHRoaXMuY29uZmlnLCB0aGlzLmxvZ2dlciwgcGFja2FnZVBhdGgsIHBvc3NpYmxlRW50cnlQb2ludFBhdGgpO1xuICAgICAgaWYgKGlzRW50cnlQb2ludChzdWJFbnRyeVBvaW50KSkge1xuICAgICAgICBlbnRyeVBvaW50cy5wdXNoKHRoaXMucmVzb2x2ZXIuZ2V0RW50cnlQb2ludFdpdGhEZXBlbmRlbmNpZXMoc3ViRW50cnlQb2ludCkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzRGlyZWN0b3J5KSB7XG4gICAgICAgIC8vIFRoaXMgcGF0aCBpcyBub3QgYSBkaXJlY3Rvcnkgc28gd2UgYXJlIGRvbmUuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBub3QgYW4gZW50cnktcG9pbnQgaXRzZWxmLCB0aGlzIGRpcmVjdG9yeSBtYXkgY29udGFpbiBlbnRyeS1wb2ludHMgb2YgaXRzIG93bi5cbiAgICAgIGNvbnN0IGNhbkNvbnRhaW5FbnRyeVBvaW50cyA9XG4gICAgICAgICAgc3ViRW50cnlQb2ludCA9PT0gTk9fRU5UUllfUE9JTlQgfHwgc3ViRW50cnlQb2ludCA9PT0gSU5DT01QQVRJQkxFX0VOVFJZX1BPSU5UO1xuICAgICAgY29uc3QgY2hpbGRQYXRocyA9IHRoaXMuZnMucmVhZGRpcihhYnNvbHV0ZVBhdGgpO1xuICAgICAgaWYgKGNhbkNvbnRhaW5FbnRyeVBvaW50cyAmJlxuICAgICAgICAgIGNoaWxkUGF0aHMuc29tZShcbiAgICAgICAgICAgICAgY2hpbGRQYXRoID0+IGNoaWxkUGF0aC5lbmRzV2l0aCgnLmpzJykgJiZcbiAgICAgICAgICAgICAgICAgIHRoaXMuZnMuc3RhdCh0aGlzLmZzLnJlc29sdmUoYWJzb2x1dGVQYXRoLCBjaGlsZFBhdGgpKS5pc0ZpbGUoKSkpIHtcbiAgICAgICAgLy8gV2UgZG8gbm90IGNvbnNpZGVyIG5vbi1lbnRyeS1wb2ludCBkaXJlY3RvcmllcyB0aGF0IGNvbnRhaW4gSlMgZmlsZXMgYXMgdGhleSBhcmUgdmVyeVxuICAgICAgICAvLyB1bmxpa2VseSB0byBiZSBjb250YWluZXJzIGZvciBzdWItZW50cnktcG9pbnRzLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY29sbGVjdFNlY29uZGFyeUVudHJ5UG9pbnRzKGVudHJ5UG9pbnRzLCBwYWNrYWdlUGF0aCwgYWJzb2x1dGVQYXRoLCBjaGlsZFBhdGhzKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RyaXBKc0V4dGVuc2lvbjxUIGV4dGVuZHMgc3RyaW5nPihmaWxlUGF0aDogVCk6IFQge1xuICByZXR1cm4gZmlsZVBhdGgucmVwbGFjZSgvXFwuanMkLywgJycpIGFzIFQ7XG59XG5cbmZ1bmN0aW9uIGlzSWdub3JhYmxlUGF0aChwYXRoOiBQYXRoU2VnbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcGF0aC5zdGFydHNXaXRoKCcuJykgfHwgcGF0aCA9PT0gJ25vZGVfbW9kdWxlcycgfHwgcGF0aCA9PT0gTkdDQ19ESVJFQ1RPUlk7XG59XG4iXX0=