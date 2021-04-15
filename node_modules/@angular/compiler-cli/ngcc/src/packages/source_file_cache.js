(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/packages/source_file_cache", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createModuleResolutionCache = exports.EntryPointFileCache = exports.isAngularDts = exports.isDefaultLibrary = exports.SharedFileCache = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ts = require("typescript");
    /**
     * A cache that holds on to source files that can be shared for processing all entry-points in a
     * single invocation of ngcc. In particular, the following files are shared across all entry-points
     * through this cache:
     *
     * 1. Default library files such as `lib.dom.d.ts` and `lib.es5.d.ts`. These files don't change
     *    and some are very large, so parsing is expensive. Therefore, the parsed `ts.SourceFile`s for
     *    the default library files are cached.
     * 2. The typings of @angular scoped packages. The typing files for @angular packages are typically
     *    used in the entry-points that ngcc processes, so benefit from a single source file cache.
     *    Especially `@angular/core/core.d.ts` is large and expensive to parse repeatedly. In contrast
     *    to default library files, we have to account for these files to be invalidated during a single
     *    invocation of ngcc, as ngcc will overwrite the .d.ts files during its processing.
     *
     * The lifecycle of this cache corresponds with a single invocation of ngcc. Separate invocations,
     * e.g. the CLI's synchronous module resolution fallback will therefore all have their own cache.
     * This allows for the source file cache to be garbage collected once ngcc processing has completed.
     */
    var SharedFileCache = /** @class */ (function () {
        function SharedFileCache(fs) {
            this.fs = fs;
            this.sfCache = new Map();
        }
        /**
         * Loads a `ts.SourceFile` if the provided `fileName` is deemed appropriate to be cached. To
         * optimize for memory usage, only files that are generally used in all entry-points are cached.
         * If `fileName` is not considered to benefit from caching or the requested file does not exist,
         * then `undefined` is returned.
         */
        SharedFileCache.prototype.getCachedSourceFile = function (fileName) {
            var absPath = this.fs.resolve(fileName);
            if (isDefaultLibrary(absPath, this.fs)) {
                return this.getStableCachedFile(absPath);
            }
            else if (isAngularDts(absPath, this.fs)) {
                return this.getVolatileCachedFile(absPath);
            }
            else {
                return undefined;
            }
        };
        /**
         * Attempts to load the source file from the cache, or parses the file into a `ts.SourceFile` if
         * it's not yet cached. This method assumes that the file will not be modified for the duration
         * that this cache is valid for. If that assumption does not hold, the `getVolatileCachedFile`
         * method is to be used instead.
         */
        SharedFileCache.prototype.getStableCachedFile = function (absPath) {
            if (!this.sfCache.has(absPath)) {
                var content = readFile(absPath, this.fs);
                if (content === undefined) {
                    return undefined;
                }
                var sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
                this.sfCache.set(absPath, sf);
            }
            return this.sfCache.get(absPath);
        };
        /**
         * In contrast to `getStableCachedFile`, this method always verifies that the cached source file
         * is the same as what's stored on disk. This is done for files that are expected to change during
         * ngcc's processing, such as @angular scoped packages for which the .d.ts files are overwritten
         * by ngcc. If the contents on disk have changed compared to a previously cached source file, the
         * content from disk is re-parsed and the cache entry is replaced.
         */
        SharedFileCache.prototype.getVolatileCachedFile = function (absPath) {
            var content = readFile(absPath, this.fs);
            if (content === undefined) {
                return undefined;
            }
            if (!this.sfCache.has(absPath) || this.sfCache.get(absPath).text !== content) {
                var sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
                this.sfCache.set(absPath, sf);
            }
            return this.sfCache.get(absPath);
        };
        return SharedFileCache;
    }());
    exports.SharedFileCache = SharedFileCache;
    var DEFAULT_LIB_PATTERN = ['node_modules', 'typescript', 'lib', /^lib\..+\.d\.ts$/];
    /**
     * Determines whether the provided path corresponds with a default library file inside of the
     * typescript package.
     *
     * @param absPath The path for which to determine if it corresponds with a default library file.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isDefaultLibrary(absPath, fs) {
        return isFile(absPath, DEFAULT_LIB_PATTERN, fs);
    }
    exports.isDefaultLibrary = isDefaultLibrary;
    var ANGULAR_DTS_PATTERN = ['node_modules', '@angular', /./, /\.d\.ts$/];
    /**
     * Determines whether the provided path corresponds with a .d.ts file inside of an @angular
     * scoped package. This logic only accounts for the .d.ts files in the root, which is sufficient
     * to find the large, flattened entry-point files that benefit from caching.
     *
     * @param absPath The path for which to determine if it corresponds with an @angular .d.ts file.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isAngularDts(absPath, fs) {
        return isFile(absPath, ANGULAR_DTS_PATTERN, fs);
    }
    exports.isAngularDts = isAngularDts;
    /**
     * Helper function to determine whether a file corresponds with a given pattern of segments.
     *
     * @param path The path for which to determine if it corresponds with the provided segments.
     * @param segments Array of segments; the `path` must have ending segments that match the
     * patterns in this array.
     * @param fs The filesystem to use for inspecting the path.
     */
    function isFile(path, segments, fs) {
        for (var i = segments.length - 1; i >= 0; i--) {
            var pattern = segments[i];
            var segment = fs.basename(path);
            if (typeof pattern === 'string') {
                if (pattern !== segment) {
                    return false;
                }
            }
            else {
                if (!pattern.test(segment)) {
                    return false;
                }
            }
            path = fs.dirname(path);
        }
        return true;
    }
    /**
     * A cache for processing a single entry-point. This exists to share `ts.SourceFile`s between the
     * source and typing programs that are created for a single program.
     */
    var EntryPointFileCache = /** @class */ (function () {
        function EntryPointFileCache(fs, sharedFileCache) {
            this.fs = fs;
            this.sharedFileCache = sharedFileCache;
            this.sfCache = new Map();
        }
        /**
         * Returns and caches a parsed `ts.SourceFile` for the provided `fileName`. If the `fileName` is
         * cached in the shared file cache, that result is used. Otherwise, the source file is cached
         * internally. This method returns `undefined` if the requested file does not exist.
         *
         * @param fileName The path of the file to retrieve a source file for.
         * @param languageVersion The language version to use for parsing the file.
         */
        EntryPointFileCache.prototype.getCachedSourceFile = function (fileName, languageVersion) {
            var staticSf = this.sharedFileCache.getCachedSourceFile(fileName);
            if (staticSf !== undefined) {
                return staticSf;
            }
            var absPath = this.fs.resolve(fileName);
            if (this.sfCache.has(absPath)) {
                return this.sfCache.get(absPath);
            }
            var content = readFile(absPath, this.fs);
            if (content === undefined) {
                return undefined;
            }
            var sf = ts.createSourceFile(fileName, content, languageVersion);
            this.sfCache.set(absPath, sf);
            return sf;
        };
        return EntryPointFileCache;
    }());
    exports.EntryPointFileCache = EntryPointFileCache;
    function readFile(absPath, fs) {
        if (!fs.exists(absPath) || !fs.stat(absPath).isFile()) {
            return undefined;
        }
        return fs.readFile(absPath);
    }
    /**
     * Creates a `ts.ModuleResolutionCache` that uses the provided filesystem for path operations.
     *
     * @param fs The filesystem to use for path operations.
     */
    function createModuleResolutionCache(fs) {
        return ts.createModuleResolutionCache(fs.pwd(), function (fileName) {
            return fs.isCaseSensitive() ? fileName : fileName.toLowerCase();
        });
    }
    exports.createModuleResolutionCache = createModuleResolutionCache;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlX2ZpbGVfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcGFja2FnZXMvc291cmNlX2ZpbGVfY2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsK0JBQWlDO0lBR2pDOzs7Ozs7Ozs7Ozs7Ozs7OztPQWlCRztJQUNIO1FBR0UseUJBQW9CLEVBQWM7WUFBZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1lBRjFCLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztRQUV0QixDQUFDO1FBRXRDOzs7OztXQUtHO1FBQ0gsNkNBQW1CLEdBQW5CLFVBQW9CLFFBQWdCO1lBQ2xDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLElBQUksZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDdEMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDMUM7aUJBQU0sSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDekMsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0wsT0FBTyxTQUFTLENBQUM7YUFDbEI7UUFDSCxDQUFDO1FBRUQ7Ozs7O1dBS0c7UUFDSyw2Q0FBbUIsR0FBM0IsVUFBNEIsT0FBdUI7WUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM5QixJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0Ms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UUFDdkQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3JELE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsMkJBQTJCLENBQUMsRUFBYztRQUN4RCxPQUFPLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsVUFBQSxRQUFRO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFKRCxrRUFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge0Fic29sdXRlRnNQYXRoLCBGaWxlU3lzdGVtfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvZmlsZV9zeXN0ZW0nO1xuXG4vKipcbiAqIEEgY2FjaGUgdGhhdCBob2xkcyBvbiB0byBzb3VyY2UgZmlsZXMgdGhhdCBjYW4gYmUgc2hhcmVkIGZvciBwcm9jZXNzaW5nIGFsbCBlbnRyeS1wb2ludHMgaW4gYVxuICogc2luZ2xlIGludm9jYXRpb24gb2YgbmdjYy4gSW4gcGFydGljdWxhciwgdGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgc2hhcmVkIGFjcm9zcyBhbGwgZW50cnktcG9pbnRzXG4gKiB0aHJvdWdoIHRoaXMgY2FjaGU6XG4gKlxuICogMS4gRGVmYXVsdCBsaWJyYXJ5IGZpbGVzIHN1Y2ggYXMgYGxpYi5kb20uZC50c2AgYW5kIGBsaWIuZXM1LmQudHNgLiBUaGVzZSBmaWxlcyBkb24ndCBjaGFuZ2VcbiAqICAgIGFuZCBzb21lIGFyZSB2ZXJ5IGxhcmdlLCBzbyBwYXJzaW5nIGlzIGV4cGVuc2l2ZS4gVGhlcmVmb3JlLCB0aGUgcGFyc2VkIGB0cy5Tb3VyY2VGaWxlYHMgZm9yXG4gKiAgICB0aGUgZGVmYXVsdCBsaWJyYXJ5IGZpbGVzIGFyZSBjYWNoZWQuXG4gKiAyLiBUaGUgdHlwaW5ncyBvZiBAYW5ndWxhciBzY29wZWQgcGFja2FnZXMuIFRoZSB0eXBpbmcgZmlsZXMgZm9yIEBhbmd1bGFyIHBhY2thZ2VzIGFyZSB0eXBpY2FsbHlcbiAqICAgIHVzZWQgaW4gdGhlIGVudHJ5LXBvaW50cyB0aGF0IG5nY2MgcHJvY2Vzc2VzLCBzbyBiZW5lZml0IGZyb20gYSBzaW5nbGUgc291cmNlIGZpbGUgY2FjaGUuXG4gKiAgICBFc3BlY2lhbGx5IGBAYW5ndWxhci9jb3JlL2NvcmUuZC50c2AgaXMgbGFyZ2UgYW5kIGV4cGVuc2l2ZSB0byBwYXJzZSByZXBlYXRlZGx5LiBJbiBjb250cmFzdFxuICogICAgdG8gZGVmYXVsdCBsaWJyYXJ5IGZpbGVzLCB3ZSBoYXZlIHRvIGFjY291bnQgZm9yIHRoZXNlIGZpbGVzIHRvIGJlIGludmFsaWRhdGVkIGR1cmluZyBhIHNpbmdsZVxuICogICAgaW52b2NhdGlvbiBvZiBuZ2NjLCBhcyBuZ2NjIHdpbGwgb3ZlcndyaXRlIHRoZSAuZC50cyBmaWxlcyBkdXJpbmcgaXRzIHByb2Nlc3NpbmcuXG4gKlxuICogVGhlIGxpZmVjeWNsZSBvZiB0aGlzIGNhY2hlIGNvcnJlc3BvbmRzIHdpdGggYSBzaW5nbGUgaW52b2NhdGlvbiBvZiBuZ2NjLiBTZXBhcmF0ZSBpbnZvY2F0aW9ucyxcbiAqIGUuZy4gdGhlIENMSSdzIHN5bmNocm9ub3VzIG1vZHVsZSByZXNvbHV0aW9uIGZhbGxiYWNrIHdpbGwgdGhlcmVmb3JlIGFsbCBoYXZlIHRoZWlyIG93biBjYWNoZS5cbiAqIFRoaXMgYWxsb3dzIGZvciB0aGUgc291cmNlIGZpbGUgY2FjaGUgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQgb25jZSBuZ2NjIHByb2Nlc3NpbmcgaGFzIGNvbXBsZXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFNoYXJlZEZpbGVDYWNoZSB7XG4gIHByaXZhdGUgc2ZDYWNoZSA9IG5ldyBNYXA8QWJzb2x1dGVGc1BhdGgsIHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBmczogRmlsZVN5c3RlbSkge31cblxuICAvKipcbiAgICogTG9hZHMgYSBgdHMuU291cmNlRmlsZWAgaWYgdGhlIHByb3ZpZGVkIGBmaWxlTmFtZWAgaXMgZGVlbWVkIGFwcHJvcHJpYXRlIHRvIGJlIGNhY2hlZC4gVG9cbiAgICogb3B0aW1pemUgZm9yIG1lbW9yeSB1c2FnZSwgb25seSBmaWxlcyB0aGF0IGFyZSBnZW5lcmFsbHkgdXNlZCBpbiBhbGwgZW50cnktcG9pbnRzIGFyZSBjYWNoZWQuXG4gICAqIElmIGBmaWxlTmFtZWAgaXMgbm90IGNvbnNpZGVyZWQgdG8gYmVuZWZpdCBmcm9tIGNhY2hpbmcgb3IgdGhlIHJlcXVlc3RlZCBmaWxlIGRvZXMgbm90IGV4aXN0LFxuICAgKiB0aGVuIGB1bmRlZmluZWRgIGlzIHJldHVybmVkLlxuICAgKi9cbiAgZ2V0Q2FjaGVkU291cmNlRmlsZShmaWxlTmFtZTogc3RyaW5nKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IGFic1BhdGggPSB0aGlzLmZzLnJlc29sdmUoZmlsZU5hbWUpO1xuICAgIGlmIChpc0RlZmF1bHRMaWJyYXJ5KGFic1BhdGgsIHRoaXMuZnMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRTdGFibGVDYWNoZWRGaWxlKGFic1BhdGgpO1xuICAgIH0gZWxzZSBpZiAoaXNBbmd1bGFyRHRzKGFic1BhdGgsIHRoaXMuZnMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRWb2xhdGlsZUNhY2hlZEZpbGUoYWJzUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHRzIHRvIGxvYWQgdGhlIHNvdXJjZSBmaWxlIGZyb20gdGhlIGNhY2hlLCBvciBwYXJzZXMgdGhlIGZpbGUgaW50byBhIGB0cy5Tb3VyY2VGaWxlYCBpZlxuICAgKiBpdCdzIG5vdCB5ZXQgY2FjaGVkLiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoYXQgdGhlIGZpbGUgd2lsbCBub3QgYmUgbW9kaWZpZWQgZm9yIHRoZSBkdXJhdGlvblxuICAgKiB0aGF0IHRoaXMgY2FjaGUgaXMgdmFsaWQgZm9yLiBJZiB0aGF0IGFzc3VtcHRpb24gZG9lcyBub3QgaG9sZCwgdGhlIGBnZXRWb2xhdGlsZUNhY2hlZEZpbGVgXG4gICAqIG1ldGhvZCBpcyB0byBiZSB1c2VkIGluc3RlYWQuXG4gICAqL1xuICBwcml2YXRlIGdldFN0YWJsZUNhY2hlZEZpbGUoYWJzUGF0aDogQWJzb2x1dGVGc1BhdGgpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgaWYgKCF0aGlzLnNmQ2FjaGUuaGFzKGFic1BhdGgpKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gcmVhZEZpbGUoYWJzUGF0aCwgdGhpcy5mcyk7XG4gICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoYWJzUGF0aCwgY29udGVudCwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNSk7XG4gICAgICB0aGlzLnNmQ2FjaGUuc2V0KGFic1BhdGgsIHNmKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2ZDYWNoZS5nZXQoYWJzUGF0aCkhO1xuICB9XG5cbiAgLyoqXG4gICAqIEluIGNvbnRyYXN0IHRvIGBnZXRTdGFibGVDYWNoZWRGaWxlYCwgdGhpcyBtZXRob2QgYWx3YXlzIHZlcmlmaWVzIHRoYXQgdGhlIGNhY2hlZCBzb3VyY2UgZmlsZVxuICAgKiBpcyB0aGUgc2FtZSBhcyB3aGF0J3Mgc3RvcmVkIG9uIGRpc2suIFRoaXMgaXMgZG9uZSBmb3IgZmlsZXMgdGhhdCBhcmUgZXhwZWN0ZWQgdG8gY2hhbmdlIGR1cmluZ1xuICAgKiBuZ2NjJ3MgcHJvY2Vzc2luZywgc3VjaCBhcyBAYW5ndWxhciBzY29wZWQgcGFja2FnZXMgZm9yIHdoaWNoIHRoZSAuZC50cyBmaWxlcyBhcmUgb3ZlcndyaXR0ZW5cbiAgICogYnkgbmdjYy4gSWYgdGhlIGNvbnRlbnRzIG9uIGRpc2sgaGF2ZSBjaGFuZ2VkIGNvbXBhcmVkIHRvIGEgcHJldmlvdXNseSBjYWNoZWQgc291cmNlIGZpbGUsIHRoZVxuICAgKiBjb250ZW50IGZyb20gZGlzayBpcyByZS1wYXJzZWQgYW5kIHRoZSBjYWNoZSBlbnRyeSBpcyByZXBsYWNlZC5cbiAgICovXG4gIHByaXZhdGUgZ2V0Vm9sYXRpbGVDYWNoZWRGaWxlKGFic1BhdGg6IEFic29sdXRlRnNQYXRoKTogdHMuU291cmNlRmlsZXx1bmRlZmluZWQge1xuICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZShhYnNQYXRoLCB0aGlzLmZzKTtcbiAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuc2ZDYWNoZS5oYXMoYWJzUGF0aCkgfHwgdGhpcy5zZkNhY2hlLmdldChhYnNQYXRoKSEudGV4dCAhPT0gY29udGVudCkge1xuICAgICAgY29uc3Qgc2YgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKGFic1BhdGgsIGNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5FUzIwMTUpO1xuICAgICAgdGhpcy5zZkNhY2hlLnNldChhYnNQYXRoLCBzZik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNmQ2FjaGUuZ2V0KGFic1BhdGgpITtcbiAgfVxufVxuXG5jb25zdCBERUZBVUxUX0xJQl9QQVRURVJOID0gWydub2RlX21vZHVsZXMnLCAndHlwZXNjcmlwdCcsICdsaWInLCAvXmxpYlxcLi4rXFwuZFxcLnRzJC9dO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgcGF0aCBjb3JyZXNwb25kcyB3aXRoIGEgZGVmYXVsdCBsaWJyYXJ5IGZpbGUgaW5zaWRlIG9mIHRoZVxuICogdHlwZXNjcmlwdCBwYWNrYWdlLlxuICpcbiAqIEBwYXJhbSBhYnNQYXRoIFRoZSBwYXRoIGZvciB3aGljaCB0byBkZXRlcm1pbmUgaWYgaXQgY29ycmVzcG9uZHMgd2l0aCBhIGRlZmF1bHQgbGlicmFyeSBmaWxlLlxuICogQHBhcmFtIGZzIFRoZSBmaWxlc3lzdGVtIHRvIHVzZSBmb3IgaW5zcGVjdGluZyB0aGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVmYXVsdExpYnJhcnkoYWJzUGF0aDogQWJzb2x1dGVGc1BhdGgsIGZzOiBGaWxlU3lzdGVtKTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0ZpbGUoYWJzUGF0aCwgREVGQVVMVF9MSUJfUEFUVEVSTiwgZnMpO1xufVxuXG5jb25zdCBBTkdVTEFSX0RUU19QQVRURVJOID0gWydub2RlX21vZHVsZXMnLCAnQGFuZ3VsYXInLCAvLi8sIC9cXC5kXFwudHMkL107XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXRoIGNvcnJlc3BvbmRzIHdpdGggYSAuZC50cyBmaWxlIGluc2lkZSBvZiBhbiBAYW5ndWxhclxuICogc2NvcGVkIHBhY2thZ2UuIFRoaXMgbG9naWMgb25seSBhY2NvdW50cyBmb3IgdGhlIC5kLnRzIGZpbGVzIGluIHRoZSByb290LCB3aGljaCBpcyBzdWZmaWNpZW50XG4gKiB0byBmaW5kIHRoZSBsYXJnZSwgZmxhdHRlbmVkIGVudHJ5LXBvaW50IGZpbGVzIHRoYXQgYmVuZWZpdCBmcm9tIGNhY2hpbmcuXG4gKlxuICogQHBhcmFtIGFic1BhdGggVGhlIHBhdGggZm9yIHdoaWNoIHRvIGRldGVybWluZSBpZiBpdCBjb3JyZXNwb25kcyB3aXRoIGFuIEBhbmd1bGFyIC5kLnRzIGZpbGUuXG4gKiBAcGFyYW0gZnMgVGhlIGZpbGVzeXN0ZW0gdG8gdXNlIGZvciBpbnNwZWN0aW5nIHRoZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNBbmd1bGFyRHRzKGFic1BhdGg6IEFic29sdXRlRnNQYXRoLCBmczogRmlsZVN5c3RlbSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNGaWxlKGFic1BhdGgsIEFOR1VMQVJfRFRTX1BBVFRFUk4sIGZzKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBmaWxlIGNvcnJlc3BvbmRzIHdpdGggYSBnaXZlbiBwYXR0ZXJuIG9mIHNlZ21lbnRzLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGZvciB3aGljaCB0byBkZXRlcm1pbmUgaWYgaXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgcHJvdmlkZWQgc2VnbWVudHMuXG4gKiBAcGFyYW0gc2VnbWVudHMgQXJyYXkgb2Ygc2VnbWVudHM7IHRoZSBgcGF0aGAgbXVzdCBoYXZlIGVuZGluZyBzZWdtZW50cyB0aGF0IG1hdGNoIHRoZVxuICogcGF0dGVybnMgaW4gdGhpcyBhcnJheS5cbiAqIEBwYXJhbSBmcyBUaGUgZmlsZXN5c3RlbSB0byB1c2UgZm9yIGluc3BlY3RpbmcgdGhlIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZShcbiAgICBwYXRoOiBBYnNvbHV0ZUZzUGF0aCwgc2VnbWVudHM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nfFJlZ0V4cD4sIGZzOiBGaWxlU3lzdGVtKTogYm9vbGVhbiB7XG4gIGZvciAobGV0IGkgPSBzZWdtZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IHBhdHRlcm4gPSBzZWdtZW50c1tpXTtcbiAgICBjb25zdCBzZWdtZW50ID0gZnMuYmFzZW5hbWUocGF0aCk7XG4gICAgaWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHBhdHRlcm4gIT09IHNlZ21lbnQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXBhdHRlcm4udGVzdChzZWdtZW50KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHBhdGggPSBmcy5kaXJuYW1lKHBhdGgpO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEEgY2FjaGUgZm9yIHByb2Nlc3NpbmcgYSBzaW5nbGUgZW50cnktcG9pbnQuIFRoaXMgZXhpc3RzIHRvIHNoYXJlIGB0cy5Tb3VyY2VGaWxlYHMgYmV0d2VlbiB0aGVcbiAqIHNvdXJjZSBhbmQgdHlwaW5nIHByb2dyYW1zIHRoYXQgYXJlIGNyZWF0ZWQgZm9yIGEgc2luZ2xlIHByb2dyYW0uXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnRyeVBvaW50RmlsZUNhY2hlIHtcbiAgcHJpdmF0ZSByZWFkb25seSBzZkNhY2hlID0gbmV3IE1hcDxBYnNvbHV0ZUZzUGF0aCwgdHMuU291cmNlRmlsZT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZzOiBGaWxlU3lzdGVtLCBwcml2YXRlIHNoYXJlZEZpbGVDYWNoZTogU2hhcmVkRmlsZUNhY2hlKSB7fVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuZCBjYWNoZXMgYSBwYXJzZWQgYHRzLlNvdXJjZUZpbGVgIGZvciB0aGUgcHJvdmlkZWQgYGZpbGVOYW1lYC4gSWYgdGhlIGBmaWxlTmFtZWAgaXNcbiAgICogY2FjaGVkIGluIHRoZSBzaGFyZWQgZmlsZSBjYWNoZSwgdGhhdCByZXN1bHQgaXMgdXNlZC4gT3RoZXJ3aXNlLCB0aGUgc291cmNlIGZpbGUgaXMgY2FjaGVkXG4gICAqIGludGVybmFsbHkuIFRoaXMgbWV0aG9kIHJldHVybnMgYHVuZGVmaW5lZGAgaWYgdGhlIHJlcXVlc3RlZCBmaWxlIGRvZXMgbm90IGV4aXN0LlxuICAgKlxuICAgKiBAcGFyYW0gZmlsZU5hbWUgVGhlIHBhdGggb2YgdGhlIGZpbGUgdG8gcmV0cmlldmUgYSBzb3VyY2UgZmlsZSBmb3IuXG4gICAqIEBwYXJhbSBsYW5ndWFnZVZlcnNpb24gVGhlIGxhbmd1YWdlIHZlcnNpb24gdG8gdXNlIGZvciBwYXJzaW5nIHRoZSBmaWxlLlxuICAgKi9cbiAgZ2V0Q2FjaGVkU291cmNlRmlsZShmaWxlTmFtZTogc3RyaW5nLCBsYW5ndWFnZVZlcnNpb246IHRzLlNjcmlwdFRhcmdldCk6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkIHtcbiAgICBjb25zdCBzdGF0aWNTZiA9IHRoaXMuc2hhcmVkRmlsZUNhY2hlLmdldENhY2hlZFNvdXJjZUZpbGUoZmlsZU5hbWUpO1xuICAgIGlmIChzdGF0aWNTZiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gc3RhdGljU2Y7XG4gICAgfVxuXG4gICAgY29uc3QgYWJzUGF0aCA9IHRoaXMuZnMucmVzb2x2ZShmaWxlTmFtZSk7XG4gICAgaWYgKHRoaXMuc2ZDYWNoZS5oYXMoYWJzUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLnNmQ2FjaGUuZ2V0KGFic1BhdGgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRlbnQgPSByZWFkRmlsZShhYnNQYXRoLCB0aGlzLmZzKTtcbiAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBzZiA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoZmlsZU5hbWUsIGNvbnRlbnQsIGxhbmd1YWdlVmVyc2lvbik7XG4gICAgdGhpcy5zZkNhY2hlLnNldChhYnNQYXRoLCBzZik7XG4gICAgcmV0dXJuIHNmO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRGaWxlKGFic1BhdGg6IEFic29sdXRlRnNQYXRoLCBmczogRmlsZVN5c3RlbSk6IHN0cmluZ3x1bmRlZmluZWQge1xuICBpZiAoIWZzLmV4aXN0cyhhYnNQYXRoKSB8fCAhZnMuc3RhdChhYnNQYXRoKS5pc0ZpbGUoKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIGZzLnJlYWRGaWxlKGFic1BhdGgpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgdHMuTW9kdWxlUmVzb2x1dGlvbkNhY2hlYCB0aGF0IHVzZXMgdGhlIHByb3ZpZGVkIGZpbGVzeXN0ZW0gZm9yIHBhdGggb3BlcmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZnMgVGhlIGZpbGVzeXN0ZW0gdG8gdXNlIGZvciBwYXRoIG9wZXJhdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2R1bGVSZXNvbHV0aW9uQ2FjaGUoZnM6IEZpbGVTeXN0ZW0pOiB0cy5Nb2R1bGVSZXNvbHV0aW9uQ2FjaGUge1xuICByZXR1cm4gdHMuY3JlYXRlTW9kdWxlUmVzb2x1dGlvbkNhY2hlKGZzLnB3ZCgpLCBmaWxlTmFtZSA9PiB7XG4gICAgcmV0dXJuIGZzLmlzQ2FzZVNlbnNpdGl2ZSgpID8gZmlsZU5hbWUgOiBmaWxlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICB9KTtcbn1cbiJdfQ==