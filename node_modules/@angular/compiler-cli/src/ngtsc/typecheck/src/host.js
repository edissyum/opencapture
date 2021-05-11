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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/host", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/util/src/typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeCheckProgramHost = exports.DelegatingCompilerHost = void 0;
    var tslib_1 = require("tslib");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    /**
     * Delegates all methods of `ts.CompilerHost` to a delegate, with the exception of
     * `getSourceFile`, `fileExists` and `writeFile` which are implemented in `TypeCheckProgramHost`.
     *
     * If a new method is added to `ts.CompilerHost` which is not delegated, a type error will be
     * generated for this class.
     */
    var DelegatingCompilerHost = /** @class */ (function () {
        function DelegatingCompilerHost(delegate) {
            this.delegate = delegate;
            // Excluded are 'getSourceFile', 'fileExists' and 'writeFile', which are actually implemented by
            // `TypeCheckProgramHost` below.
            this.createHash = this.delegateMethod('createHash');
            this.directoryExists = this.delegateMethod('directoryExists');
            this.getCancellationToken = this.delegateMethod('getCancellationToken');
            this.getCanonicalFileName = this.delegateMethod('getCanonicalFileName');
            this.getCurrentDirectory = this.delegateMethod('getCurrentDirectory');
            this.getDefaultLibFileName = this.delegateMethod('getDefaultLibFileName');
            this.getDefaultLibLocation = this.delegateMethod('getDefaultLibLocation');
            this.getDirectories = this.delegateMethod('getDirectories');
            this.getEnvironmentVariable = this.delegateMethod('getEnvironmentVariable');
            this.getNewLine = this.delegateMethod('getNewLine');
            this.getParsedCommandLine = this.delegateMethod('getParsedCommandLine');
            this.getSourceFileByPath = this.delegateMethod('getSourceFileByPath');
            this.readDirectory = this.delegateMethod('readDirectory');
            this.readFile = this.delegateMethod('readFile');
            this.realpath = this.delegateMethod('realpath');
            this.resolveModuleNames = this.delegateMethod('resolveModuleNames');
            this.resolveTypeReferenceDirectives = this.delegateMethod('resolveTypeReferenceDirectives');
            this.trace = this.delegateMethod('trace');
            this.useCaseSensitiveFileNames = this.delegateMethod('useCaseSensitiveFileNames');
        }
        DelegatingCompilerHost.prototype.delegateMethod = function (name) {
            return this.delegate[name] !== undefined ? this.delegate[name].bind(this.delegate) :
                undefined;
        };
        return DelegatingCompilerHost;
    }());
    exports.DelegatingCompilerHost = DelegatingCompilerHost;
    /**
     * A `ts.CompilerHost` which augments source files with type checking code from a
     * `TypeCheckContext`.
     */
    var TypeCheckProgramHost = /** @class */ (function (_super) {
        tslib_1.__extends(TypeCheckProgramHost, _super);
        function TypeCheckProgramHost(sfMap, originalProgram, delegate, shimExtensionPrefixes) {
            var _this = _super.call(this, delegate) || this;
            _this.originalProgram = originalProgram;
            _this.shimExtensionPrefixes = shimExtensionPrefixes;
            /**
             * The `ShimReferenceTagger` responsible for tagging `ts.SourceFile`s loaded via this host.
             *
             * The `TypeCheckProgramHost` is used in the creation of a new `ts.Program`. Even though this new
             * program is based on a prior one, TypeScript will still start from the root files and enumerate
             * all source files to include in the new program.  This means that just like during the original
             * program's creation, these source files must be tagged with references to per-file shims in
             * order for those shims to be loaded, and then cleaned up afterwards. Thus the
             * `TypeCheckProgramHost` has its own `ShimReferenceTagger` to perform this function.
             */
            _this.shimTagger = new shims_1.ShimReferenceTagger(_this.shimExtensionPrefixes);
            _this.sfMap = sfMap;
            return _this;
        }
        TypeCheckProgramHost.prototype.getSourceFile = function (fileName, languageVersion, onError, shouldCreateNewSourceFile) {
            // Try to use the same `ts.SourceFile` as the original program, if possible. This guarantees
            // that program reuse will be as efficient as possible.
            var delegateSf = this.originalProgram.getSourceFile(fileName);
            if (delegateSf === undefined) {
                // Something went wrong and a source file is being requested that's not in the original
                // program. Just in case, try to retrieve it from the delegate.
                delegateSf = this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
            }
            if (delegateSf === undefined) {
                return undefined;
            }
            // Look for replacements.
            var sf;
            if (this.sfMap.has(fileName)) {
                sf = this.sfMap.get(fileName);
                shims_1.copyFileShimData(delegateSf, sf);
            }
            else {
                sf = delegateSf;
            }
            // TypeScript doesn't allow returning redirect source files. To avoid unforeseen errors we
            // return the original source file instead of the redirect target.
            sf = typescript_1.toUnredirectedSourceFile(sf);
            this.shimTagger.tag(sf);
            return sf;
        };
        TypeCheckProgramHost.prototype.postProgramCreationCleanup = function () {
            this.shimTagger.finalize();
        };
        TypeCheckProgramHost.prototype.writeFile = function () {
            throw new Error("TypeCheckProgramHost should never write files");
        };
        TypeCheckProgramHost.prototype.fileExists = function (fileName) {
            return this.sfMap.has(fileName) || this.delegate.fileExists(fileName);
        };
        return TypeCheckProgramHost;
    }(DelegatingCompilerHost));
    exports.TypeCheckProgramHost = TypeCheckProgramHost;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9ob3N0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCwrREFBa0U7SUFDbEUsa0ZBQXdGO0lBRXhGOzs7Ozs7T0FNRztJQUNIO1FBRUUsZ0NBQXNCLFFBQXlCO1lBQXpCLGFBQVEsR0FBUixRQUFRLENBQWlCO1lBTy9DLGdHQUFnRztZQUNoRyxnQ0FBZ0M7WUFDaEMsZUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDL0Msb0JBQWUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDekQseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ25FLHlCQUFvQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNuRSx3QkFBbUIsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDakUsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ3JFLDBCQUFxQixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNyRSxtQkFBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUN2RCwyQkFBc0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDdkUsZUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDL0MseUJBQW9CLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxD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USxFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVELHdDQUFTLEdBQVQ7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELHlDQUFVLEdBQVYsVUFBVyxRQUFnQjtZQUN6QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFDSCwyQkFBQztJQUFELENBQUMsQUFyRUQsQ0FBMEMsc0JBQXNCLEdBcUUvRDtJQXJFWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Y29weUZpbGVTaGltRGF0YSwgU2hpbVJlZmVyZW5jZVRhZ2dlcn0gZnJvbSAnLi4vLi4vc2hpbXMnO1xuaW1wb3J0IHtSZXF1aXJlZERlbGVnYXRpb25zLCB0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGV9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIERlbGVnYXRlcyBhbGwgbWV0aG9kcyBvZiBgdHMuQ29tcGlsZXJIb3N0YCB0byBhIGRlbGVnYXRlLCB3aXRoIHRoZSBleGNlcHRpb24gb2ZcbiAqIGBnZXRTb3VyY2VGaWxlYCwgYGZpbGVFeGlzdHNgIGFuZCBgd3JpdGVGaWxlYCB3aGljaCBhcmUgaW1wbGVtZW50ZWQgaW4gYFR5cGVDaGVja1Byb2dyYW1Ib3N0YC5cbiAqXG4gKiBJZiBhIG5ldyBtZXRob2QgaXMgYWRkZWQgdG8gYHRzLkNvbXBpbGVySG9zdGAgd2hpY2ggaXMgbm90IGRlbGVnYXRlZCwgYSB0eXBlIGVycm9yIHdpbGwgYmVcbiAqIGdlbmVyYXRlZCBmb3IgdGhpcyBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIERlbGVnYXRpbmdDb21waWxlckhvc3QgaW1wbGVtZW50c1xuICAgIE9taXQ8UmVxdWlyZWREZWxlZ2F0aW9uczx0cy5Db21waWxlckhvc3Q+LCAnZ2V0U291cmNlRmlsZSd8J2ZpbGVFeGlzdHMnfCd3cml0ZUZpbGUnPiB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBkZWxlZ2F0ZTogdHMuQ29tcGlsZXJIb3N0KSB7fVxuXG4gIHByaXZhdGUgZGVsZWdhdGVNZXRob2Q8TSBleHRlbmRzIGtleW9mIHRzLkNvbXBpbGVySG9zdD4obmFtZTogTSk6IHRzLkNvbXBpbGVySG9zdFtNXSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsZWdhdGVbbmFtZV0gIT09IHVuZGVmaW5lZCA/ICh0aGlzLmRlbGVnYXRlW25hbWVdIGFzIGFueSkuYmluZCh0aGlzLmRlbGVnYXRlKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIEV4Y2x1ZGVkIGFyZSAnZ2V0U291cmNlRmlsZScsICdmaWxlRXhpc3RzJyBhbmQgJ3dyaXRlRmlsZScsIHdoaWNoIGFyZSBhY3R1YWxseSBpbXBsZW1lbnRlZCBieVxuICAvLyBgVHlwZUNoZWNrUHJvZ3JhbUhvc3RgIGJlbG93LlxuICBjcmVhdGVIYXNoID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnY3JlYXRlSGFzaCcpO1xuICBkaXJlY3RvcnlFeGlzdHMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdkaXJlY3RvcnlFeGlzdHMnKTtcbiAgZ2V0Q2FuY2VsbGF0aW9uVG9rZW4gPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRDYW5jZWxsYXRpb25Ub2tlbicpO1xuICBnZXRDYW5vbmljYWxGaWxlTmFtZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldENhbm9uaWNhbEZpbGVOYW1lJyk7XG4gIGdldEN1cnJlbnREaXJlY3RvcnkgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRDdXJyZW50RGlyZWN0b3J5Jyk7XG4gIGdldERlZmF1bHRMaWJGaWxlTmFtZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldERlZmF1bHRMaWJGaWxlTmFtZScpO1xuICBnZXREZWZhdWx0TGliTG9jYXRpb24gPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXREZWZhdWx0TGliTG9jYXRpb24nKTtcbiAgZ2V0RGlyZWN0b3JpZXMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXREaXJlY3RvcmllcycpO1xuICBnZXRFbnZpcm9ubWVudFZhcmlhYmxlID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0RW52aXJvbm1lbnRWYXJpYWJsZScpO1xuICBnZXROZXdMaW5lID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgnZ2V0TmV3TGluZScpO1xuICBnZXRQYXJzZWRDb21tYW5kTGluZSA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ2dldFBhcnNlZENvbW1hbmRMaW5lJyk7XG4gIGdldFNvdXJjZUZpbGVCeVBhdGggPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdnZXRTb3VyY2VGaWxlQnlQYXRoJyk7XG4gIHJlYWREaXJlY3RvcnkgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFkRGlyZWN0b3J5Jyk7XG4gIHJlYWRGaWxlID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVhZEZpbGUnKTtcbiAgcmVhbHBhdGggPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZWFscGF0aCcpO1xuICByZXNvbHZlTW9kdWxlTmFtZXMgPSB0aGlzLmRlbGVnYXRlTWV0aG9kKCdyZXNvbHZlTW9kdWxlTmFtZXMnKTtcbiAgcmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgncmVzb2x2ZVR5cGVSZWZlcmVuY2VEaXJlY3RpdmVzJyk7XG4gIHRyYWNlID0gdGhpcy5kZWxlZ2F0ZU1ldGhvZCgndHJhY2UnKTtcbiAgdXNlQ2FzZVNlbnNpdGl2ZUZpbGVOYW1lcyA9IHRoaXMuZGVsZWdhdGVNZXRob2QoJ3VzZUNhc2VTZW5zaXRpdmVGaWxlTmFtZXMnKTtcbn1cblxuLyoqXG4gKiBBIGB0cy5Db21waWxlckhvc3RgIHdoaWNoIGF1Z21lbnRzIHNvdXJjZSBmaWxlcyB3aXRoIHR5cGUgY2hlY2tpbmcgY29kZSBmcm9tIGFcbiAqIGBUeXBlQ2hlY2tDb250ZXh0YC5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVDaGVja1Byb2dyYW1Ib3N0IGV4dGVuZHMgRGVsZWdhdGluZ0NvbXBpbGVySG9zdCB7XG4gIC8qKlxuICAgKiBNYXAgb2Ygc291cmNlIGZpbGUgbmFtZXMgdG8gYHRzLlNvdXJjZUZpbGVgIGluc3RhbmNlcy5cbiAgICovXG4gIHByaXZhdGUgc2ZNYXA6IE1hcDxzdHJpbmcsIHRzLlNvdXJjZUZpbGU+O1xuXG4gIC8qKlxuICAgKiBUaGUgYFNoaW1SZWZlcmVuY2VUYWdnZXJgIHJlc3BvbnNpYmxlIGZvciB0YWdnaW5nIGB0cy5Tb3VyY2VGaWxlYHMgbG9hZGVkIHZpYSB0aGlzIGhvc3QuXG4gICAqXG4gICAqIFRoZSBgVHlwZUNoZWNrUHJvZ3JhbUhvc3RgIGlzIHVzZWQgaW4gdGhlIGNyZWF0aW9uIG9mIGEgbmV3IGB0cy5Qcm9ncmFtYC4gRXZlbiB0aG91Z2ggdGhpcyBuZXdcbiAgICogcHJvZ3JhbSBpcyBiYXNlZCBvbiBhIHByaW9yIG9uZSwgVHlwZVNjcmlwdCB3aWxsIHN0aWxsIHN0YXJ0IGZyb20gdGhlIHJvb3QgZmlsZXMgYW5kIGVudW1lcmF0ZVxuICAgKiBhbGwgc291cmNlIGZpbGVzIHRvIGluY2x1ZGUgaW4gdGhlIG5ldyBwcm9ncmFtLiAgVGhpcyBtZWFucyB0aGF0IGp1c3QgbGlrZSBkdXJpbmcgdGhlIG9yaWdpbmFsXG4gICAqIHByb2dyYW0ncyBjcmVhdGlvbiwgdGhlc2Ugc291cmNlIGZpbGVzIG11c3QgYmUgdGFnZ2VkIHdpdGggcmVmZXJlbmNlcyB0byBwZXItZmlsZSBzaGltcyBpblxuICAgKiBvcmRlciBmb3IgdGhvc2Ugc2hpbXMgdG8gYmUgbG9hZGVkLCBhbmQgdGhlbiBjbGVhbmVkIHVwIGFmdGVyd2FyZHMuIFRodXMgdGhlXG4gICAqIGBUeXBlQ2hlY2tQcm9ncmFtSG9zdGAgaGFzIGl0cyBvd24gYFNoaW1SZWZlcmVuY2VUYWdnZXJgIHRvIHBlcmZvcm0gdGhpcyBmdW5jdGlvbi5cbiAgICovXG4gIHByaXZhdGUgc2hpbVRhZ2dlciA9IG5ldyBTaGltUmVmZXJlbmNlVGFnZ2VyKHRoaXMuc2hpbUV4dGVuc2lvblByZWZpeGVzKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHNmTWFwOiBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPiwgcHJpdmF0ZSBvcmlnaW5hbFByb2dyYW06IHRzLlByb2dyYW0sXG4gICAgICBkZWxlZ2F0ZTogdHMuQ29tcGlsZXJIb3N0LCBwcml2YXRlIHNoaW1FeHRlbnNpb25QcmVmaXhlczogc3RyaW5nW10pIHtcbiAgICBzdXBlcihkZWxlZ2F0ZSk7XG4gICAgdGhpcy5zZk1hcCA9IHNmTWFwO1xuICB9XG5cbiAgZ2V0U291cmNlRmlsZShcbiAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGxhbmd1YWdlVmVyc2lvbjogdHMuU2NyaXB0VGFyZ2V0LFxuICAgICAgb25FcnJvcj86ICgobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkKXx1bmRlZmluZWQsXG4gICAgICBzaG91bGRDcmVhdGVOZXdTb3VyY2VGaWxlPzogYm9vbGVhbnx1bmRlZmluZWQpOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCB7XG4gICAgLy8gVHJ5IHRvIHVzZSB0aGUgc2FtZSBgdHMuU291cmNlRmlsZWAgYXMgdGhlIG9yaWdpbmFsIHByb2dyYW0sIGlmIHBvc3NpYmxlLiBUaGlzIGd1YXJhbnRlZXNcbiAgICAvLyB0aGF0IHByb2dyYW0gcmV1c2Ugd2lsbCBiZSBhcyBlZmZpY2llbnQgYXMgcG9zc2libGUuXG4gICAgbGV0IGRlbGVnYXRlU2Y6IHRzLlNvdXJjZUZpbGV8dW5kZWZpbmVkID0gdGhpcy5vcmlnaW5hbFByb2dyYW0uZ2V0U291cmNlRmlsZShmaWxlTmFtZSk7XG4gICAgaWYgKGRlbGVnYXRlU2YgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU29tZXRoaW5nIHdlbnQgd3JvbmcgYW5kIGEgc291cmNlIGZpbGUgaXMgYmVpbmcgcmVxdWVzdGVkIHRoYXQncyBub3QgaW4gdGhlIG9yaWdpbmFsXG4gICAgICAvLyBwcm9ncmFtLiBKdXN0IGluIGNhc2UsIHRyeSB0byByZXRyaWV2ZSBpdCBmcm9tIHRoZSBkZWxlZ2F0ZS5cbiAgICAgIGRlbGVnYXRlU2YgPSB0aGlzLmRlbGVnYXRlLmdldFNvdXJjZUZpbGUoXG4gICAgICAgICAgZmlsZU5hbWUsIGxhbmd1YWdlVmVyc2lvbiwgb25FcnJvciwgc2hvdWxkQ3JlYXRlTmV3U291cmNlRmlsZSkhO1xuICAgIH1cbiAgICBpZiAoZGVsZWdhdGVTZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIExvb2sgZm9yIHJlcGxhY2VtZW50cy5cbiAgICBsZXQgc2Y6IHRzLlNvdXJjZUZpbGU7XG4gICAgaWYgKHRoaXMuc2ZNYXAuaGFzKGZpbGVOYW1lKSkge1xuICAgICAgc2YgPSB0aGlzLnNmTWFwLmdldChmaWxlTmFtZSkhO1xuICAgICAgY29weUZpbGVTaGltRGF0YShkZWxlZ2F0ZVNmLCBzZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNmID0gZGVsZWdhdGVTZjtcbiAgICB9XG4gICAgLy8gVHlwZVNjcmlwdCBkb2Vzbid0IGFsbG93IHJldHVybmluZyByZWRpcmVjdCBzb3VyY2UgZmlsZXMuIFRvIGF2b2lkIHVuZm9yZXNlZW4gZXJyb3JzIHdlXG4gICAgLy8gcmV0dXJuIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSBpbnN0ZWFkIG9mIHRoZSByZWRpcmVjdCB0YXJnZXQuXG4gICAgc2YgPSB0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGUoc2YpO1xuXG4gICAgdGhpcy5zaGltVGFnZ2VyLnRhZyhzZik7XG4gICAgcmV0dXJuIHNmO1xuICB9XG5cbiAgcG9zdFByb2dyYW1DcmVhdGlvbkNsZWFudXAoKTogdm9pZCB7XG4gICAgdGhpcy5zaGltVGFnZ2VyLmZpbmFsaXplKCk7XG4gIH1cblxuICB3cml0ZUZpbGUoKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcihgVHlwZUNoZWNrUHJvZ3JhbUhvc3Qgc2hvdWxkIG5ldmVyIHdyaXRlIGZpbGVzYCk7XG4gIH1cblxuICBmaWxlRXhpc3RzKGZpbGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zZk1hcC5oYXMoZmlsZU5hbWUpIHx8IHRoaXMuZGVsZWdhdGUuZmlsZUV4aXN0cyhmaWxlTmFtZSk7XG4gIH1cbn1cbiJdfQ==