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
        define("@angular/compiler-cli/src/ngtsc/resource/src/loader", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdapterResourceLoader = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var CSS_PREPROCESSOR_EXT = /(\.scss|\.sass|\.less|\.styl)$/;
    var RESOURCE_MARKER = '.$ngresource$';
    var RESOURCE_MARKER_TS = RESOURCE_MARKER + '.ts';
    /**
     * `ResourceLoader` which delegates to an `NgCompilerAdapter`'s resource loading methods.
     */
    var AdapterResourceLoader = /** @class */ (function () {
        function AdapterResourceLoader(adapter, options) {
            this.adapter = adapter;
            this.options = options;
            this.cache = new Map();
            this.fetching = new Map();
            this.lookupResolutionHost = createLookupResolutionHost(this.adapter);
            this.canPreload = !!this.adapter.readResource;
        }
        /**
         * Resolve the url of a resource relative to the file that contains the reference to it.
         * The return value of this method can be used in the `load()` and `preload()` methods.
         *
         * Uses the provided CompilerHost if it supports mapping resources to filenames.
         * Otherwise, uses a fallback mechanism that searches the module resolution candidates.
         *
         * @param url The, possibly relative, url of the resource.
         * @param fromFile The path to the file that contains the URL of the resource.
         * @returns A resolved url of resource.
         * @throws An error if the resource cannot be resolved.
         */
        AdapterResourceLoader.prototype.resolve = function (url, fromFile) {
            var _this = this;
            var resolvedUrl = null;
            if (this.adapter.resourceNameToFileName) {
                resolvedUrl = this.adapter.resourceNameToFileName(url, fromFile, function (url, fromFile) { return _this.fallbackResolve(url, fromFile); });
            }
            else {
                resolvedUrl = this.fallbackResolve(url, fromFile);
            }
            if (resolvedUrl === null) {
                throw new Error("HostResourceResolver: could not resolve " + url + " in context of " + fromFile + ")");
            }
            return resolvedUrl;
        };
        /**
         * Preload the specified resource, asynchronously.
         *
         * Once the resource is loaded, its value is cached so it can be accessed synchronously via the
         * `load()` method.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to preload.
         * @returns A Promise that is resolved once the resource has been loaded or `undefined` if the
         * file has already been loaded.
         * @throws An Error if pre-loading is not available.
         */
        AdapterResourceLoader.prototype.preload = function (resolvedUrl) {
            var _this = this;
            if (!this.adapter.readResource) {
                throw new Error('HostResourceLoader: the CompilerHost provided does not support pre-loading resources.');
            }
            if (this.cache.has(resolvedUrl)) {
                return undefined;
            }
            else if (this.fetching.has(resolvedUrl)) {
                return this.fetching.get(resolvedUrl);
            }
            var result = this.adapter.readResource(resolvedUrl);
            if (typeof result === 'string') {
                this.cache.set(resolvedUrl, result);
                return undefined;
            }
            else {
                var fetchCompletion = result.then(function (str) {
                    _this.fetching.delete(resolvedUrl);
                    _this.cache.set(resolvedUrl, str);
                });
                this.fetching.set(resolvedUrl, fetchCompletion);
                return fetchCompletion;
            }
        };
        /**
         * Load the resource at the given url, synchronously.
         *
         * The contents of the resource may have been cached by a previous call to `preload()`.
         *
         * @param resolvedUrl The url (resolved by a call to `resolve()`) of the resource to load.
         * @returns The contents of the resource.
         */
        AdapterResourceLoader.prototype.load = function (resolvedUrl) {
            if (this.cache.has(resolvedUrl)) {
                return this.cache.get(resolvedUrl);
            }
            var result = this.adapter.readResource ? this.adapter.readResource(resolvedUrl) :
                this.adapter.readFile(resolvedUrl);
            if (typeof result !== 'string') {
                throw new Error("HostResourceLoader: loader(" + resolvedUrl + ") returned a Promise");
            }
            this.cache.set(resolvedUrl, result);
            return result;
        };
        /**
         * Invalidate the entire resource cache.
         */
        AdapterResourceLoader.prototype.invalidate = function () {
            this.cache.clear();
        };
        /**
         * Attempt to resolve `url` in the context of `fromFile`, while respecting the rootDirs
         * option from the tsconfig. First, normalize the file name.
         */
        AdapterResourceLoader.prototype.fallbackResolve = function (url, fromFile) {
            var e_1, _a;
            var candidateLocations;
            if (url.startsWith('/')) {
                // This path is not really an absolute path, but instead the leading '/' means that it's
                // rooted in the project rootDirs. So look for it according to the rootDirs.
                candidateLocations = this.getRootedCandidateLocations(url);
            }
            else {
                // This path is a "relative" path and can be resolved as such. To make this easier on the
                // downstream resolver, the './' prefix is added if missing to distinguish these paths from
                // absolute node_modules paths.
                if (!url.startsWith('.')) {
                    url = "./" + url;
                }
                candidateLocations = this.getResolvedCandidateLocations(url, fromFile);
            }
            try {
                for (var candidateLocations_1 = tslib_1.__values(candidateLocations), candidateLocations_1_1 = candidateLocations_1.next(); !candidateLocations_1_1.done; candidateLocations_1_1 = candidateLocations_1.next()) {
                    var candidate = candidateLocations_1_1.value;
                    if (this.adapter.fileExists(candidate)) {
                        return candidate;
                    }
                    else if (CSS_PREPROCESSOR_EXT.test(candidate)) {
                        /**
                         * If the user specified styleUrl points to *.scss, but the Sass compiler was run before
                         * Angular, then the resource may have been generated as *.css. Simply try the resolution
                         * again.
                         */
                        var cssFallbackUrl = candidate.replace(CSS_PREPROCESSOR_EXT, '.css');
                        if (this.adapter.fileExists(cssFallbackUrl)) {
                            return cssFallbackUrl;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (candidateLocations_1_1 && !candidateLocations_1_1.done && (_a = candidateLocations_1.return)) _a.call(candidateLocations_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        };
        AdapterResourceLoader.prototype.getRootedCandidateLocations = function (url) {
            // The path already starts with '/', so add a '.' to make it relative.
            var segment = ('.' + url);
            return this.adapter.rootDirs.map(function (rootDir) { return file_system_1.join(rootDir, segment); });
        };
        /**
         * TypeScript provides utilities to resolve module names, but not resource files (which aren't
         * a part of the ts.Program). However, TypeScript's module resolution can be used creatively
         * to locate where resource files should be expected to exist. Since module resolution returns
         * a list of file names that were considered, the loader can enumerate the possible locations
         * for the file by setting up a module resolution for it that will fail.
         */
        AdapterResourceLoader.prototype.getResolvedCandidateLocations = function (url, fromFile) {
            // clang-format off
            var failedLookup = ts.resolveModuleName(url + RESOURCE_MARKER, fromFile, this.options, this.lookupResolutionHost);
            // clang-format on
            if (failedLookup.failedLookupLocations === undefined) {
                throw new Error("Internal error: expected to find failedLookupLocations during resolution of resource '" + url + "' in context of " + fromFile);
            }
            return failedLookup.failedLookupLocations
                .filter(function (candidate) { return candidate.endsWith(RESOURCE_MARKER_TS); })
                .map(function (candidate) { return candidate.slice(0, -RESOURCE_MARKER_TS.length); });
        };
        return AdapterResourceLoader;
    }());
    exports.AdapterResourceLoader = AdapterResourceLoader;
    /**
     * Derives a `ts.ModuleResolutionHost` from a compiler adapter that recognizes the special resource
     * marker and does not go to the filesystem for these requests, as they are known not to exist.
     */
    function createLookupResolutionHost(adapter) {
        var _a, _b, _c;
        return {
            directoryExists: function (directoryName) {
                if (directoryName.includes(RESOURCE_MARKER)) {
                    return false;
                }
                else if (adapter.directoryExists !== undefined) {
                    return adapter.directoryExists(directoryName);
                }
                else {
                    // TypeScript's module resolution logic assumes that the directory exists when no host
                    // implementation is available.
                    return true;
                }
            },
            fileExists: function (fileName) {
                if (fileName.includes(RESOURCE_MARKER)) {
                    return false;
                }
                else {
                    return adapter.fileExists(fileName);
                }
            },
            readFile: adapter.readFile.bind(adapter),
            getCurrentDirectory: adapter.getCurrentDirectory.bind(adapter),
            getDirectories: (_a = adapter.getDirectories) === null || _a === void 0 ? void 0 : _a.bind(adapter),
            realpath: (_b = adapter.realpath) === null || _b === void 0 ? void 0 : _b.bind(adapter),
            trace: (_c = adapter.trace) === null || _c === void 0 ? void 0 : _c.bind(adapter),
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9yZXNvdXJjZS9zcmMvbG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFJakMsMkVBQW9FO0lBR3BFLElBQU0sb0JBQW9CLEdBQUcsZ0NBQWdDLENBQUM7SUFFOUQsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQ3hDLElBQU0sa0JBQWtCLEdBQUcsZUFBZSxHQUFHLEtBQUssQ0FBQztJQUVuRDs7T0FFRztJQUNIO1FBT0UsK0JBQW9CLE9BQTBCLEVBQVUsT0FBMkI7WUFBL0QsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQU4zRSxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7WUFDbEMsYUFBUSxHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1lBQzVDLHlCQUFvQixHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV4RSxlQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBRTZDLENBQUM7UUFFdkY7Ozs7Ozs7Ozs7O1dBV0c7UUFDSCx1Q0FBTyxHQUFQLFVBQVEsR0FBVyxFQUFFLFFBQWdCO1lBQXJDLGlCQVlDO1lBWEMsSUFBSSxXQUFXLEdBQWdCLElBQUksQ0FBQztZQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUU7Z0JBQ3ZDLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUM3QyxHQUFHLEVBQUUsUUFBUSxFQUFFLFVBQUMsR0FBVyxFQUFFLFFBQWdCLElBQUssT0FBQSxLQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxR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Qy9DO3FCQUFNO29CQUNMLHNGQUFzRjtvQkFDdEYsK0JBQStCO29CQUMvQixPQUFPLElBQUksQ0FBQztpQkFDYjtZQUNILENBQUM7WUFDRCxVQUFVLEVBQVYsVUFBVyxRQUFnQjtnQkFDekIsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFO29CQUN0QyxPQUFPLEtBQUssQ0FBQztpQkFDZDtxQkFBTTtvQkFDTCxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3JDO1lBQ0gsQ0FBQztZQUNELFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDeEMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDOUQsY0FBYyxRQUFFLE9BQU8sQ0FBQyxjQUFjLDBDQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDckQsUUFBUSxRQUFFLE9BQU8sQ0FBQyxRQUFRLDBDQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDekMsS0FBSyxRQUFFLE9BQU8sQ0FBQyxLQUFLLDBDQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7U0FDcEMsQ0FBQztJQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7UmVzb3VyY2VMb2FkZXJ9IGZyb20gJy4uLy4uL2Fubm90YXRpb25zJztcbmltcG9ydCB7TmdDb21waWxlckFkYXB0ZXJ9IGZyb20gJy4uLy4uL2NvcmUvYXBpJztcbmltcG9ydCB7QWJzb2x1dGVGc1BhdGgsIGpvaW4sIFBhdGhTZWdtZW50fSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1JlcXVpcmVkRGVsZWdhdGlvbnN9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG5jb25zdCBDU1NfUFJFUFJPQ0VTU09SX0VYVCA9IC8oXFwuc2Nzc3xcXC5zYXNzfFxcLmxlc3N8XFwuc3R5bCkkLztcblxuY29uc3QgUkVTT1VSQ0VfTUFSS0VSID0gJy4kbmdyZXNvdXJjZSQnO1xuY29uc3QgUkVTT1VSQ0VfTUFSS0VSX1RTID0gUkVTT1VSQ0VfTUFSS0VSICsgJy50cyc7XG5cbi8qKlxuICogYFJlc291cmNlTG9hZGVyYCB3aGljaCBkZWxlZ2F0ZXMgdG8gYW4gYE5nQ29tcGlsZXJBZGFwdGVyYCdzIHJlc291cmNlIGxvYWRpbmcgbWV0aG9kcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFkYXB0ZXJSZXNvdXJjZUxvYWRlciBpbXBsZW1lbnRzIFJlc291cmNlTG9hZGVyIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgZmV0Y2hpbmcgPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZTx2b2lkPj4oKTtcbiAgcHJpdmF0ZSBsb29rdXBSZXNvbHV0aW9uSG9zdCA9IGNyZWF0ZUxvb2t1cFJlc29sdXRpb25Ib3N0KHRoaXMuYWRhcHRlcik7XG5cbiAgY2FuUHJlbG9hZCA9ICEhdGhpcy5hZGFwdGVyLnJlYWRSZXNvdXJjZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFkYXB0ZXI6IE5nQ29tcGlsZXJBZGFwdGVyLCBwcml2YXRlIG9wdGlvbnM6IHRzLkNvbXBpbGVyT3B0aW9ucykge31cblxuICAvKipcbiAgICogUmVzb2x2ZSB0aGUgdXJsIG9mIGEgcmVzb3VyY2UgcmVsYXRpdmUgdG8gdGhlIGZpbGUgdGhhdCBjb250YWlucyB0aGUgcmVmZXJlbmNlIHRvIGl0LlxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIGluIHRoZSBgbG9hZCgpYCBhbmQgYHByZWxvYWQoKWAgbWV0aG9kcy5cbiAgICpcbiAgICogVXNlcyB0aGUgcHJvdmlkZWQgQ29tcGlsZXJIb3N0IGlmIGl0IHN1cHBvcnRzIG1hcHBpbmcgcmVzb3VyY2VzIHRvIGZpbGVuYW1lcy5cbiAgICogT3RoZXJ3aXNlLCB1c2VzIGEgZmFsbGJhY2sgbWVjaGFuaXNtIHRoYXQgc2VhcmNoZXMgdGhlIG1vZHVsZSByZXNvbHV0aW9uIGNhbmRpZGF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVGhlLCBwb3NzaWJseSByZWxhdGl2ZSwgdXJsIG9mIHRoZSByZXNvdXJjZS5cbiAgICogQHBhcmFtIGZyb21GaWxlIFRoZSBwYXRoIHRvIHRoZSBmaWxlIHRoYXQgY29udGFpbnMgdGhlIFVSTCBvZiB0aGUgcmVzb3VyY2UuXG4gICAqIEByZXR1cm5zIEEgcmVzb2x2ZWQgdXJsIG9mIHJlc291cmNlLlxuICAgKiBAdGhyb3dzIEFuIGVycm9yIGlmIHRoZSByZXNvdXJjZSBjYW5ub3QgYmUgcmVzb2x2ZWQuXG4gICAqL1xuICByZXNvbHZlKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcmVzb2x2ZWRVcmw6IHN0cmluZ3xudWxsID0gbnVsbDtcbiAgICBpZiAodGhpcy5hZGFwdGVyLnJlc291cmNlTmFtZVRvRmlsZU5hbWUpIHtcbiAgICAgIHJlc29sdmVkVXJsID0gdGhpcy5hZGFwdGVyLnJlc291cmNlTmFtZVRvRmlsZU5hbWUoXG4gICAgICAgICAgdXJsLCBmcm9tRmlsZSwgKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKSA9PiB0aGlzLmZhbGxiYWNrUmVzb2x2ZSh1cmwsIGZyb21GaWxlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmVkVXJsID0gdGhpcy5mYWxsYmFja1Jlc29sdmUodXJsLCBmcm9tRmlsZSk7XG4gICAgfVxuICAgIGlmIChyZXNvbHZlZFVybCA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBIb3N0UmVzb3VyY2VSZXNvbHZlcjogY291bGQgbm90IHJlc29sdmUgJHt1cmx9IGluIGNvbnRleHQgb2YgJHtmcm9tRmlsZX0pYCk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFVybDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVsb2FkIHRoZSBzcGVjaWZpZWQgcmVzb3VyY2UsIGFzeW5jaHJvbm91c2x5LlxuICAgKlxuICAgKiBPbmNlIHRoZSByZXNvdXJjZSBpcyBsb2FkZWQsIGl0cyB2YWx1ZSBpcyBjYWNoZWQgc28gaXQgY2FuIGJlIGFjY2Vzc2VkIHN5bmNocm9ub3VzbHkgdmlhIHRoZVxuICAgKiBgbG9hZCgpYCBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSByZXNvbHZlZFVybCBUaGUgdXJsIChyZXNvbHZlZCBieSBhIGNhbGwgdG8gYHJlc29sdmUoKWApIG9mIHRoZSByZXNvdXJjZSB0byBwcmVsb2FkLlxuICAgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSByZXNvdXJjZSBoYXMgYmVlbiBsb2FkZWQgb3IgYHVuZGVmaW5lZGAgaWYgdGhlXG4gICAqIGZpbGUgaGFzIGFscmVhZHkgYmVlbiBsb2FkZWQuXG4gICAqIEB0aHJvd3MgQW4gRXJyb3IgaWYgcHJlLWxvYWRpbmcgaXMgbm90IGF2YWlsYWJsZS5cbiAgICovXG4gIHByZWxvYWQocmVzb2x2ZWRVcmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkIHtcbiAgICBpZiAoIXRoaXMuYWRhcHRlci5yZWFkUmVzb3VyY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnSG9zdFJlc291cmNlTG9hZGVyOiB0aGUgQ29tcGlsZXJIb3N0IHByb3ZpZGVkIGRvZXMgbm90IHN1cHBvcnQgcHJlLWxvYWRpbmcgcmVzb3VyY2VzLicpO1xuICAgIH1cbiAgICBpZiAodGhpcy5jYWNoZS5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodGhpcy5mZXRjaGluZy5oYXMocmVzb2x2ZWRVcmwpKSB7XG4gICAgICByZXR1cm4gdGhpcy5mZXRjaGluZy5nZXQocmVzb2x2ZWRVcmwpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuYWRhcHRlci5yZWFkUmVzb3VyY2UocmVzb2x2ZWRVcmwpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5jYWNoZS5zZXQocmVzb2x2ZWRVcmwsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmZXRjaENvbXBsZXRpb24gPSByZXN1bHQudGhlbihzdHIgPT4ge1xuICAgICAgICB0aGlzLmZldGNoaW5nLmRlbGV0ZShyZXNvbHZlZFVybCk7XG4gICAgICAgIHRoaXMuY2FjaGUuc2V0KHJlc29sdmVkVXJsLCBzdHIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmZldGNoaW5nLnNldChyZXNvbHZlZFVybCwgZmV0Y2hDb21wbGV0aW9uKTtcbiAgICAgIHJldHVybiBmZXRjaENvbXBsZXRpb247XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgdGhlIHJlc291cmNlIGF0IHRoZSBnaXZlbiB1cmwsIHN5bmNocm9ub3VzbHkuXG4gICAqXG4gICAqIFRoZSBjb250ZW50cyBvZiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBjYWNoZWQgYnkgYSBwcmV2aW91cyBjYWxsIHRvIGBwcmVsb2FkKClgLlxuICAgKlxuICAgKiBAcGFyYW0gcmVzb2x2ZWRVcmwgVGhlIHVybCAocmVzb2x2ZWQgYnkgYSBjYWxsIHRvIGByZXNvbHZlKClgKSBvZiB0aGUgcmVzb3VyY2UgdG8gbG9hZC5cbiAgICogQHJldHVybnMgVGhlIGNvbnRlbnRzIG9mIHRoZSByZXNvdXJjZS5cbiAgICovXG4gIGxvYWQocmVzb2x2ZWRVcmw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKHJlc29sdmVkVXJsKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KHJlc29sdmVkVXJsKSE7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5hZGFwdGVyLnJlYWRSZXNvdXJjZSA/IHRoaXMuYWRhcHRlci5yZWFkUmVzb3VyY2UocmVzb2x2ZWRVcmwpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGFwdGVyLnJlYWRGaWxlKHJlc29sdmVkVXJsKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSG9zdFJlc291cmNlTG9hZGVyOiBsb2FkZXIoJHtyZXNvbHZlZFVybH0pIHJldHVybmVkIGEgUHJvbWlzZWApO1xuICAgIH1cbiAgICB0aGlzLmNhY2hlLnNldChyZXNvbHZlZFVybCwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqXG4gICAqIEludmFsaWRhdGUgdGhlIGVudGlyZSByZXNvdXJjZSBjYWNoZS5cbiAgICovXG4gIGludmFsaWRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEF0dGVtcHQgdG8gcmVzb2x2ZSBgdXJsYCBpbiB0aGUgY29udGV4dCBvZiBgZnJvbUZpbGVgLCB3aGlsZSByZXNwZWN0aW5nIHRoZSByb290RGlyc1xuICAgKiBvcHRpb24gZnJvbSB0aGUgdHNjb25maWcuIEZpcnN0LCBub3JtYWxpemUgdGhlIGZpbGUgbmFtZS5cbiAgICovXG4gIHByaXZhdGUgZmFsbGJhY2tSZXNvbHZlKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGxldCBjYW5kaWRhdGVMb2NhdGlvbnM6IHN0cmluZ1tdO1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgbm90IHJlYWxseSBhbiBhYnNvbHV0ZSBwYXRoLCBidXQgaW5zdGVhZCB0aGUgbGVhZGluZyAnLycgbWVhbnMgdGhhdCBpdCdzXG4gICAgICAvLyByb290ZWQgaW4gdGhlIHByb2plY3Qgcm9vdERpcnMuIFNvIGxvb2sgZm9yIGl0IGFjY29yZGluZyB0byB0aGUgcm9vdERpcnMuXG4gICAgICBjYW5kaWRhdGVMb2NhdGlvbnMgPSB0aGlzLmdldFJvb3RlZENhbmRpZGF0ZUxvY2F0aW9ucyh1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGlzIHBhdGggaXMgYSBcInJlbGF0aXZlXCIgcGF0aCBhbmQgY2FuIGJlIHJlc29sdmVkIGFzIHN1Y2guIFRvIG1ha2UgdGhpcyBlYXNpZXIgb24gdGhlXG4gICAgICAvLyBkb3duc3RyZWFtIHJlc29sdmVyLCB0aGUgJy4vJyBwcmVmaXggaXMgYWRkZWQgaWYgbWlzc2luZyB0byBkaXN0aW5ndWlzaCB0aGVzZSBwYXRocyBmcm9tXG4gICAgICAvLyBhYnNvbHV0ZSBub2RlX21vZHVsZXMgcGF0aHMuXG4gICAgICBpZiAoIXVybC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgdXJsID0gYC4vJHt1cmx9YDtcbiAgICAgIH1cbiAgICAgIGNhbmRpZGF0ZUxvY2F0aW9ucyA9IHRoaXMuZ2V0UmVzb2x2ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsLCBmcm9tRmlsZSk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2FuZGlkYXRlTG9jYXRpb25zKSB7XG4gICAgICBpZiAodGhpcy5hZGFwdGVyLmZpbGVFeGlzdHMoY2FuZGlkYXRlKSkge1xuICAgICAgICByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgfSBlbHNlIGlmIChDU1NfUFJFUFJPQ0VTU09SX0VYVC50ZXN0KGNhbmRpZGF0ZSkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSB1c2VyIHNwZWNpZmllZCBzdHlsZVVybCBwb2ludHMgdG8gKi5zY3NzLCBidXQgdGhlIFNhc3MgY29tcGlsZXIgd2FzIHJ1biBiZWZvcmVcbiAgICAgICAgICogQW5ndWxhciwgdGhlbiB0aGUgcmVzb3VyY2UgbWF5IGhhdmUgYmVlbiBnZW5lcmF0ZWQgYXMgKi5jc3MuIFNpbXBseSB0cnkgdGhlIHJlc29sdXRpb25cbiAgICAgICAgICogYWdhaW4uXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjc3NGYWxsYmFja1VybCA9IGNhbmRpZGF0ZS5yZXBsYWNlKENTU19QUkVQUk9DRVNTT1JfRVhULCAnLmNzcycpO1xuICAgICAgICBpZiAodGhpcy5hZGFwdGVyLmZpbGVFeGlzdHMoY3NzRmFsbGJhY2tVcmwpKSB7XG4gICAgICAgICAgcmV0dXJuIGNzc0ZhbGxiYWNrVXJsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSb290ZWRDYW5kaWRhdGVMb2NhdGlvbnModXJsOiBzdHJpbmcpOiBBYnNvbHV0ZUZzUGF0aFtdIHtcbiAgICAvLyBUaGUgcGF0aCBhbHJlYWR5IHN0YXJ0cyB3aXRoICcvJywgc28gYWRkIGEgJy4nIHRvIG1ha2UgaXQgcmVsYXRpdmUuXG4gICAgY29uc3Qgc2VnbWVudDogUGF0aFNlZ21lbnQgPSAoJy4nICsgdXJsKSBhcyBQYXRoU2VnbWVudDtcbiAgICByZXR1cm4gdGhpcy5hZGFwdGVyLnJvb3REaXJzLm1hcChyb290RGlyID0+IGpvaW4ocm9vdERpciwgc2VnbWVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFR5cGVTY3JpcHQgcHJvdmlkZXMgdXRpbGl0aWVzIHRvIHJlc29sdmUgbW9kdWxlIG5hbWVzLCBidXQgbm90IHJlc291cmNlIGZpbGVzICh3aGljaCBhcmVuJ3RcbiAgICogYSBwYXJ0IG9mIHRoZSB0cy5Qcm9ncmFtKS4gSG93ZXZlciwgVHlwZVNjcmlwdCdzIG1vZHVsZSByZXNvbHV0aW9uIGNhbiBiZSB1c2VkIGNyZWF0aXZlbHlcbiAgICogdG8gbG9jYXRlIHdoZXJlIHJlc291cmNlIGZpbGVzIHNob3VsZCBiZSBleHBlY3RlZCB0byBleGlzdC4gU2luY2UgbW9kdWxlIHJlc29sdXRpb24gcmV0dXJuc1xuICAgKiBhIGxpc3Qgb2YgZmlsZSBuYW1lcyB0aGF0IHdlcmUgY29uc2lkZXJlZCwgdGhlIGxvYWRlciBjYW4gZW51bWVyYXRlIHRoZSBwb3NzaWJsZSBsb2NhdGlvbnNcbiAgICogZm9yIHRoZSBmaWxlIGJ5IHNldHRpbmcgdXAgYSBtb2R1bGUgcmVzb2x1dGlvbiBmb3IgaXQgdGhhdCB3aWxsIGZhaWwuXG4gICAqL1xuICBwcml2YXRlIGdldFJlc29sdmVkQ2FuZGlkYXRlTG9jYXRpb25zKHVybDogc3RyaW5nLCBmcm9tRmlsZTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIC8vIGBmYWlsZWRMb29rdXBMb2NhdGlvbnNgIGlzIGluIHRoZSBuYW1lIG9mIHRoZSB0eXBlIHRzLlJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9uc1xuICAgIC8vIGJ1dCBpcyBtYXJrZWQgQGludGVybmFsIGluIFR5cGVTY3JpcHQuIFNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMjg3NzAuXG4gICAgdHlwZSBSZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMgPVxuICAgICAgICB0cy5SZXNvbHZlZE1vZHVsZVdpdGhGYWlsZWRMb29rdXBMb2NhdGlvbnMme2ZhaWxlZExvb2t1cExvY2F0aW9uczogUmVhZG9ubHlBcnJheTxzdHJpbmc+fTtcblxuICAgIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgICBjb25zdCBmYWlsZWRMb29rdXAgPSB0cy5yZXNvbHZlTW9kdWxlTmFtZSh1cmwgKyBSRVNPVVJDRV9NQVJLRVIsIGZyb21GaWxlLCB0aGlzLm9wdGlvbnMsIHRoaXMubG9va3VwUmVzb2x1dGlvbkhvc3QpIGFzIFJlc29sdmVkTW9kdWxlV2l0aEZhaWxlZExvb2t1cExvY2F0aW9ucztcbiAgICAvLyBjbGFuZy1mb3JtYXQgb25cbiAgICBpZiAoZmFpbGVkTG9va3VwLmZhaWxlZExvb2t1cExvY2F0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEludGVybmFsIGVycm9yOiBleHBlY3RlZCB0byBmaW5kIGZhaWxlZExvb2t1cExvY2F0aW9ucyBkdXJpbmcgcmVzb2x1dGlvbiBvZiByZXNvdXJjZSAnJHtcbiAgICAgICAgICAgICAgdXJsfScgaW4gY29udGV4dCBvZiAke2Zyb21GaWxlfWApO1xuICAgIH1cblxuICAgIHJldHVybiBmYWlsZWRMb29rdXAuZmFpbGVkTG9va3VwTG9jYXRpb25zXG4gICAgICAgIC5maWx0ZXIoY2FuZGlkYXRlID0+IGNhbmRpZGF0ZS5lbmRzV2l0aChSRVNPVVJDRV9NQVJLRVJfVFMpKVxuICAgICAgICAubWFwKGNhbmRpZGF0ZSA9PiBjYW5kaWRhdGUuc2xpY2UoMCwgLVJFU09VUkNFX01BUktFUl9UUy5sZW5ndGgpKTtcbiAgfVxufVxuXG4vKipcbiAqIERlcml2ZXMgYSBgdHMuTW9kdWxlUmVzb2x1dGlvbkhvc3RgIGZyb20gYSBjb21waWxlciBhZGFwdGVyIHRoYXQgcmVjb2duaXplcyB0aGUgc3BlY2lhbCByZXNvdXJjZVxuICogbWFya2VyIGFuZCBkb2VzIG5vdCBnbyB0byB0aGUgZmlsZXN5c3RlbSBmb3IgdGhlc2UgcmVxdWVzdHMsIGFzIHRoZXkgYXJlIGtub3duIG5vdCB0byBleGlzdC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlTG9va3VwUmVzb2x1dGlvbkhvc3QoYWRhcHRlcjogTmdDb21waWxlckFkYXB0ZXIpOlxuICAgIFJlcXVpcmVkRGVsZWdhdGlvbnM8dHMuTW9kdWxlUmVzb2x1dGlvbkhvc3Q+IHtcbiAgcmV0dXJuIHtcbiAgICBkaXJlY3RvcnlFeGlzdHMoZGlyZWN0b3J5TmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICBpZiAoZGlyZWN0b3J5TmFtZS5pbmNsdWRlcyhSRVNPVVJDRV9NQVJLRVIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoYWRhcHRlci5kaXJlY3RvcnlFeGlzdHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gYWRhcHRlci5kaXJlY3RvcnlFeGlzdHMoZGlyZWN0b3J5TmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUeXBlU2NyaXB0J3MgbW9kdWxlIHJlc29sdXRpb24gbG9naWMgYXNzdW1lcyB0aGF0IHRoZSBkaXJlY3RvcnkgZXhpc3RzIHdoZW4gbm8gaG9zdFxuICAgICAgICAvLyBpbXBsZW1lbnRhdGlvbiBpcyBhdmFpbGFibGUuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0sXG4gICAgZmlsZUV4aXN0cyhmaWxlTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoUkVTT1VSQ0VfTUFSS0VSKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYWRhcHRlci5maWxlRXhpc3RzKGZpbGVOYW1lKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlYWRGaWxlOiBhZGFwdGVyLnJlYWRGaWxlLmJpbmQoYWRhcHRlciksXG4gICAgZ2V0Q3VycmVudERpcmVjdG9yeTogYWRhcHRlci5nZXRDdXJyZW50RGlyZWN0b3J5LmJpbmQoYWRhcHRlciksXG4gICAgZ2V0RGlyZWN0b3JpZXM6IGFkYXB0ZXIuZ2V0RGlyZWN0b3JpZXM/LmJpbmQoYWRhcHRlciksXG4gICAgcmVhbHBhdGg6IGFkYXB0ZXIucmVhbHBhdGg/LmJpbmQoYWRhcHRlciksXG4gICAgdHJhY2U6IGFkYXB0ZXIudHJhY2U/LmJpbmQoYWRhcHRlciksXG4gIH07XG59XG4iXX0=