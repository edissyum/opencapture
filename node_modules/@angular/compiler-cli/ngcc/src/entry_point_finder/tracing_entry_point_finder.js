(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/entry_point_finder/tracing_entry_point_finder", ["require", "exports", "@angular/compiler-cli/ngcc/src/entry_point_finder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TracingEntryPointFinder = void 0;
    var utils_1 = require("@angular/compiler-cli/ngcc/src/entry_point_finder/utils");
    /**
     * An EntryPointFinder that starts from a set of initial files and only returns entry-points that
     * are dependencies of these files.
     *
     * This is faster than processing all entry-points in the entire file-system, and is used primarily
     * by the CLI integration.
     *
     * There are two concrete implementations of this class.
     *
     * * `TargetEntryPointFinder` - is given a single entry-point as the initial entry-point. This can
     *   be used in the synchronous CLI integration where the build tool has identified an external
     *   import to one of the source files being built.
     * * `ProgramBasedEntryPointFinder` - computes the initial entry-points from the source files
     *   computed from a `tsconfig.json` file. This can be used in the asynchronous CLI integration
     *   where the `tsconfig.json` to be used to do the build is known.
     */
    var TracingEntryPointFinder = /** @class */ (function () {
        function TracingEntryPointFinder(fs, config, logger, resolver, basePath, pathMappings) {
            this.fs = fs;
            this.config = config;
            this.logger = logger;
            this.resolver = resolver;
            this.basePath = basePath;
            this.pathMappings = pathMappings;
            this.basePaths = null;
        }
        /**
         * Search for Angular package entry-points.
         */
        TracingEntryPointFinder.prototype.findEntryPoints = function () {
            var unsortedEntryPoints = new Map();
            var unprocessedPaths = this.getInitialEntryPointPaths();
            while (unprocessedPaths.length > 0) {
                var path = unprocessedPaths.shift();
                var entryPointWithDeps = this.getEntryPointWithDeps(path);
                if (entryPointWithDeps === null) {
                    continue;
                }
                unsortedEntryPoints.set(entryPointWithDeps.entryPoint.path, entryPointWithDeps);
                entryPointWithDeps.depInfo.dependencies.forEach(function (dep) {
                    if (!unsortedEntryPoints.has(dep)) {
                        unprocessedPaths.push(dep);
                    }
                });
            }
            return this.resolver.sortEntryPointsByDependency(Array.from(unsortedEntryPoints.values()));
        };
        /**
         * Parse the path-mappings to compute the base-paths that need to be considered when finding
         * entry-points.
         *
         * This processing can be time-consuming if the path-mappings are complex or extensive.
         * So the result is cached locally once computed.
         */
        TracingEntryPointFinder.prototype.getBasePaths = function () {
            if (this.basePaths === null) {
                this.basePaths = utils_1.getBasePaths(this.logger, this.basePath, this.pathMappings);
            }
            return this.basePaths;
        };
        return TracingEntryPointFinder;
    }());
    exports.TracingEntryPointFinder = TracingEntryPointFinder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhY2luZ19lbnRyeV9wb2ludF9maW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvZW50cnlfcG9pbnRfZmluZGVyL3RyYWNpbmdfZW50cnlfcG9pbnRfZmluZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQWdCQSxpRkFBcUM7SUFFckM7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0g7UUFHRSxpQ0FDYyxFQUFjLEVBQVksTUFBeUIsRUFBWSxNQUFjLEVBQzdFLFFBQTRCLEVBQVksUUFBd0IsRUFDaEUsWUFBb0M7WUFGcEMsT0FBRSxHQUFGLEVBQUUsQ0FBWTtZQUFZLFdBQU0sR0FBTixNQUFNLENBQW1CO1lBQVksV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUM3RSxhQUFRLEdBQVIsUUFBUSxDQUFvQjtZQUFZLGFBQVEsR0FBUixRQUFRLENBQWdCO1lBQ2hFLGlCQUFZLEdBQVosWUFBWSxDQUF3QjtZQUwxQyxjQUFTLEdBQTBCLElBQUksQ0FBQztRQUtLLENBQUM7UUFFdEQ7O1dBRUc7UUFDSCxpREFBZSxHQUFmO1lBQ0UsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBOEMsQ0FBQztZQUNsRixJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQzFELE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbEMsSUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxFQUFHLENBQUM7Z0JBQ3ZDLElBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLGtCQUFrQixLQUFLLElBQUksRUFBRTtvQkFDL0IsU0FBUztpQkFDVjtnQkFDRCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNoRixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7b0JBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDNUI7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBc0JEOzs7Ozs7V0FNRztRQUNPLDhDQUFZLEdBQXRCO1lBQ0UsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtnQkFDM0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxvQkFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDOUU7WUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDeEIsQ0FBQztRQUNILDhCQUFDO0lBQUQsQ0FBQyxBQS9ERCxJQStEQztJQS9EcUIsMERBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtMb2dnZXJ9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9sb2dnaW5nJztcblxuaW1wb3J0IHtFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc30gZnJvbSAnLi4vZGVwZW5kZW5jaWVzL2RlcGVuZGVuY3lfaG9zdCc7XG5pbXBvcnQge0RlcGVuZGVuY3lSZXNvbHZlciwgU29ydGVkRW50cnlQb2ludHNJbmZvfSBmcm9tICcuLi9kZXBlbmRlbmNpZXMvZGVwZW5kZW5jeV9yZXNvbHZlcic7XG5pbXBvcnQge05nY2NDb25maWd1cmF0aW9ufSBmcm9tICcuLi9wYWNrYWdlcy9jb25maWd1cmF0aW9uJztcbmltcG9ydCB7UGF0aE1hcHBpbmdzfSBmcm9tICcuLi9wYXRoX21hcHBpbmdzJztcblxuaW1wb3J0IHtFbnRyeVBvaW50RmluZGVyfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQge2dldEJhc2VQYXRoc30gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQW4gRW50cnlQb2ludEZpbmRlciB0aGF0IHN0YXJ0cyBmcm9tIGEgc2V0IG9mIGluaXRpYWwgZmlsZXMgYW5kIG9ubHkgcmV0dXJucyBlbnRyeS1wb2ludHMgdGhhdFxuICogYXJlIGRlcGVuZGVuY2llcyBvZiB0aGVzZSBmaWxlcy5cbiAqXG4gKiBUaGlzIGlzIGZhc3RlciB0aGFuIHByb2Nlc3NpbmcgYWxsIGVudHJ5LXBvaW50cyBpbiB0aGUgZW50aXJlIGZpbGUtc3lzdGVtLCBhbmQgaXMgdXNlZCBwcmltYXJpbHlcbiAqIGJ5IHRoZSBDTEkgaW50ZWdyYXRpb24uXG4gKlxuICogVGhlcmUgYXJlIHR3byBjb25jcmV0ZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhpcyBjbGFzcy5cbiAqXG4gKiAqIGBUYXJnZXRFbnRyeVBvaW50RmluZGVyYCAtIGlzIGdpdmVuIGEgc2luZ2xlIGVudHJ5LXBvaW50IGFzIHRoZSBpbml0aWFsIGVudHJ5LXBvaW50LiBUaGlzIGNhblxuICogICBiZSB1c2VkIGluIHRoZSBzeW5jaHJvbm91cyBDTEkgaW50ZWdyYXRpb24gd2hlcmUgdGhlIGJ1aWxkIHRvb2wgaGFzIGlkZW50aWZpZWQgYW4gZXh0ZXJuYWxcbiAqICAgaW1wb3J0IHRvIG9uZSBvZiB0aGUgc291cmNlIGZpbGVzIGJlaW5nIGJ1aWx0LlxuICogKiBgUHJvZ3JhbUJhc2VkRW50cnlQb2ludEZpbmRlcmAgLSBjb21wdXRlcyB0aGUgaW5pdGlhbCBlbnRyeS1wb2ludHMgZnJvbSB0aGUgc291cmNlIGZpbGVzXG4gKiAgIGNvbXB1dGVkIGZyb20gYSBgdHNjb25maWcuanNvbmAgZmlsZS4gVGhpcyBjYW4gYmUgdXNlZCBpbiB0aGUgYXN5bmNocm9ub3VzIENMSSBpbnRlZ3JhdGlvblxuICogICB3aGVyZSB0aGUgYHRzY29uZmlnLmpzb25gIHRvIGJlIHVzZWQgdG8gZG8gdGhlIGJ1aWxkIGlzIGtub3duLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVHJhY2luZ0VudHJ5UG9pbnRGaW5kZXIgaW1wbGVtZW50cyBFbnRyeVBvaW50RmluZGVyIHtcbiAgcHJpdmF0ZSBiYXNlUGF0aHM6IEFic29sdXRlRnNQYXRoW118bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgZnM6IEZpbGVTeXN0ZW0sIHByb3RlY3RlZCBjb25maWc6IE5nY2NDb25maWd1cmF0aW9uLCBwcm90ZWN0ZWQgbG9nZ2VyOiBMb2dnZXIsXG4gICAgICBwcm90ZWN0ZWQgcmVzb2x2ZXI6IERlcGVuZGVuY3lSZXNvbHZlciwgcHJvdGVjdGVkIGJhc2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCxcbiAgICAgIHByb3RlY3RlZCBwYXRoTWFwcGluZ3M6IFBhdGhNYXBwaW5nc3x1bmRlZmluZWQpIHt9XG5cbiAgLyoqXG4gICAqIFNlYXJjaCBmb3IgQW5ndWxhciBwYWNrYWdlIGVudHJ5LXBvaW50cy5cbiAgICovXG4gIGZpbmRFbnRyeVBvaW50cygpOiBTb3J0ZWRFbnRyeVBvaW50c0luZm8ge1xuICAgIGNvbnN0IHVuc29ydGVkRW50cnlQb2ludHMgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llcz4oKTtcbiAgICBjb25zdCB1bnByb2Nlc3NlZFBhdGhzID0gdGhpcy5nZXRJbml0aWFsRW50cnlQb2ludFBhdGhzKCk7XG4gICAgd2hpbGUgKHVucHJvY2Vzc2VkUGF0aHMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgcGF0aCA9IHVucHJvY2Vzc2VkUGF0aHMuc2hpZnQoKSE7XG4gICAgICBjb25zdCBlbnRyeVBvaW50V2l0aERlcHMgPSB0aGlzLmdldEVudHJ5UG9pbnRXaXRoRGVwcyhwYXRoKTtcbiAgICAgIGlmIChlbnRyeVBvaW50V2l0aERlcHMgPT09IG51bGwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB1bnNvcnRlZEVudHJ5UG9pbnRzLnNldChlbnRyeVBvaW50V2l0aERlcHMuZW50cnlQb2ludC5wYXRoLCBlbnRyeVBvaW50V2l0aERlcHMpO1xuICAgICAgZW50cnlQb2ludFdpdGhEZXBzLmRlcEluZm8uZGVwZW5kZW5jaWVzLmZvckVhY2goZGVwID0+IHtcbiAgICAgICAgaWYgKCF1bnNvcnRlZEVudHJ5UG9pbnRzLmhhcyhkZXApKSB7XG4gICAgICAgICAgdW5wcm9jZXNzZWRQYXRocy5wdXNoKGRlcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5zb3J0RW50cnlQb2ludHNCeURlcGVuZGVuY3koQXJyYXkuZnJvbSh1bnNvcnRlZEVudHJ5UG9pbnRzLnZhbHVlcygpKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYW4gYXJyYXkgb2YgZW50cnktcG9pbnQgcGF0aHMgZnJvbSB3aGljaCB0byBzdGFydCB0aGUgdHJhY2UuXG4gICAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0SW5pdGlhbEVudHJ5UG9pbnRQYXRocygpOiBBYnNvbHV0ZUZzUGF0aFtdO1xuXG4gIC8qKlxuICAgKiBGb3IgdGhlIGdpdmVuIGBlbnRyeVBvaW50UGF0aGAsIGNvbXB1dGUsIG9yIHJldHJpZXZlLCB0aGUgZW50cnktcG9pbnQgaW5mb3JtYXRpb24sIGluY2x1ZGluZ1xuICAgKiBwYXRocyB0byBvdGhlciBlbnRyeS1wb2ludHMgdGhhdCB0aGlzIGVudHJ5LXBvaW50IGRlcGVuZHMgdXBvbi5cbiAgICpcbiAgICogQHBhcmFtIGVudHJ5UG9pbnRQYXRoIHRoZSBwYXRoIHRvIHRoZSBlbnRyeS1wb2ludCB3aG9zZSBpbmZvcm1hdGlvbiBhbmQgZGVwZW5kZW5jaWVzIGFyZSB0byBiZVxuICAgKiAgICAgcmV0cmlldmVkIG9yIGNvbXB1dGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgZW50cnktcG9pbnQgYW5kIGl0cyBkZXBlbmRlbmNpZXMgb3IgYG51bGxgIGlmIHRoZSBlbnRyeS1wb2ludCBpcyBub3QgY29tcGlsZWQgYnlcbiAgICogICAgIEFuZ3VsYXIgb3IgY2Fubm90IGJlIGRldGVybWluZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0RW50cnlQb2ludFdpdGhEZXBzKGVudHJ5UG9pbnRQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6XG4gICAgICBFbnRyeVBvaW50V2l0aERlcGVuZGVuY2llc3xudWxsO1xuXG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSBwYXRoLW1hcHBpbmdzIHRvIGNvbXB1dGUgdGhlIGJhc2UtcGF0aHMgdGhhdCBuZWVkIHRvIGJlIGNvbnNpZGVyZWQgd2hlbiBmaW5kaW5nXG4gICAqIGVudHJ5LXBvaW50cy5cbiAgICpcbiAgICogVGhpcyBwcm9jZXNzaW5nIGNhbiBiZSB0aW1lLWNvbnN1bWluZyBpZiB0aGUgcGF0aC1tYXBwaW5ncyBhcmUgY29tcGxleCBvciBleHRlbnNpdmUuXG4gICAqIFNvIHRoZSByZXN1bHQgaXMgY2FjaGVkIGxvY2FsbHkgb25jZSBjb21wdXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBnZXRCYXNlUGF0aHMoKSB7XG4gICAgaWYgKHRoaXMuYmFzZVBhdGhzID09PSBudWxsKSB7XG4gICAgICB0aGlzLmJhc2VQYXRocyA9IGdldEJhc2VQYXRocyh0aGlzLmxvZ2dlciwgdGhpcy5iYXNlUGF0aCwgdGhpcy5wYXRoTWFwcGluZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5iYXNlUGF0aHM7XG4gIH1cbn1cbiJdfQ==