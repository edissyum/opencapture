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
        define("@angular/compiler-cli/src/ngtsc/tsc_plugin", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/core", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/incremental", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/shims", "@angular/compiler-cli/src/ngtsc/typecheck/api", "@angular/compiler-cli/src/ngtsc/typecheck/src/augmented_program"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NgTscPlugin = void 0;
    var tslib_1 = require("tslib");
    var core_1 = require("@angular/compiler-cli/src/ngtsc/core");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var incremental_1 = require("@angular/compiler-cli/src/ngtsc/incremental");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var shims_1 = require("@angular/compiler-cli/src/ngtsc/shims");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/api");
    var augmented_program_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/augmented_program");
    /**
     * A plugin for `tsc_wrapped` which allows Angular compilation from a plain `ts_library`.
     */
    var NgTscPlugin = /** @class */ (function () {
        function NgTscPlugin(ngOptions) {
            this.ngOptions = ngOptions;
            this.name = 'ngtsc';
            this.options = null;
            this.host = null;
            this._compiler = null;
            file_system_1.setFileSystem(new file_system_1.NodeJSFileSystem());
        }
        Object.defineProperty(NgTscPlugin.prototype, "compiler", {
            get: function () {
                if (this._compiler === null) {
                    throw new Error('Lifecycle error: setupCompilation() must be called first.');
                }
                return this._compiler;
            },
            enumerable: false,
            configurable: true
        });
        NgTscPlugin.prototype.wrapHost = function (host, inputFiles, options) {
            // TODO(alxhub): Eventually the `wrapHost()` API will accept the old `ts.Program` (if one is
            // available). When it does, its `ts.SourceFile`s need to be re-tagged to enable proper
            // incremental compilation.
            this.options = tslib_1.__assign(tslib_1.__assign({}, this.ngOptions), options);
            this.host = core_1.NgCompilerHost.wrap(host, inputFiles, this.options, /* oldProgram */ null);
            return this.host;
        };
        NgTscPlugin.prototype.setupCompilation = function (program, oldProgram) {
            // TODO(alxhub): we provide a `PerfRecorder` to the compiler, but because we're not driving the
            // compilation, the information captured within it is incomplete, and may not include timings
            // for phases such as emit.
            //
            // Additionally, nothing actually captures the perf results here, so recording stats at all is
            // somewhat moot for now :)
            var perfRecorder = perf_1.ActivePerfRecorder.zeroedToNow();
            if (this.host === null || this.options === null) {
                throw new Error('Lifecycle error: setupCompilation() before wrapHost().');
            }
            this.host.postProgramCreationCleanup();
            shims_1.untagAllTsFiles(program);
            var typeCheckStrategy = new augmented_program_1.ReusedProgramStrategy(program, this.host, this.options, this.host.shimExtensionPrefixes);
            var strategy = new incremental_1.PatchedProgramIncrementalBuildStrategy();
            var oldDriver = oldProgram !== undefined ? strategy.getIncrementalDriver(oldProgram) : null;
            var ticket;
            var modifiedResourceFiles = undefined;
            if (this.host.getModifiedResourceFiles !== undefined) {
                modifiedResourceFiles = this.host.getModifiedResourceFiles();
            }
            if (modifiedResourceFiles === undefined) {
                modifiedResourceFiles = new Set();
            }
            if (oldProgram === undefined || oldDriver === null) {
                ticket = core_1.freshCompilationTicket(program, this.options, strategy, typeCheckStrategy, perfRecorder, 
                /* enableTemplateTypeChecker */ false, /* usePoisonedData */ false);
            }
            else {
                strategy.toNextBuildStrategy().getIncrementalDriver(oldProgram);
                ticket = core_1.incrementalFromDriverTicket(oldProgram, oldDriver, program, this.options, strategy, typeCheckStrategy, modifiedResourceFiles, perfRecorder, false, false);
            }
            this._compiler = core_1.NgCompiler.fromTicket(ticket, this.host);
            return {
                ignoreForDiagnostics: this._compiler.ignoreForDiagnostics,
                ignoreForEmit: this._compiler.ignoreForEmit,
            };
        };
        NgTscPlugin.prototype.getDiagnostics = function (file) {
            if (file === undefined) {
                return this.compiler.getDiagnostics();
            }
            return this.compiler.getDiagnosticsForFile(file, api_1.OptimizeFor.WholeProgram);
        };
        NgTscPlugin.prototype.getOptionDiagnostics = function () {
            return this.compiler.getOptionDiagnostics();
        };
        NgTscPlugin.prototype.getNextProgram = function () {
            return this.compiler.getNextProgram();
        };
        NgTscPlugin.prototype.createTransformers = function () {
            // The plugin consumer doesn't know about our perf tracing system, so we consider the emit phase
            // as beginning now.
            this.compiler.perfRecorder.phase(perf_1.PerfPhase.TypeScriptEmit);
            return this.compiler.prepareEmit().transformers;
        };
        return NgTscPlugin;
    }());
    exports.NgTscPlugin = NgTscPlugin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNjX3BsdWdpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHNjX3BsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsNkRBQTBIO0lBRTFILDJFQUE4RDtJQUM5RCwyRUFBcUU7SUFDckUsNkRBQXlFO0lBQ3pFLCtEQUF3QztJQUN4QyxxRUFBNEM7SUFDNUMscUdBQXdFO0lBMkN4RTs7T0FFRztJQUNIO1FBY0UscUJBQW9CLFNBQWE7WUFBYixjQUFTLEdBQVQsU0FBUyxDQUFJO1lBYmpDLFNBQUksR0FBRyxPQUFPLENBQUM7WUFFUCxZQUFPLEdBQTJCLElBQUksQ0FBQztZQUN2QyxTQUFJLEdBQXdCLElBQUksQ0FBQztZQUNqQyxjQUFTLEdBQW9CLElBQUksQ0FBQztZQVV4QywyQkFBYSxDQUFDLElBQUksOEJBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFURCxzQkFBSSxpQ0FBUTtpQkFBWjtnQkFDRSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUFFO29CQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7aUJBQzlFO2dCQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN4QixDQUFDOzs7V0FBQTtRQU1ELDhCQUFRLEdBQVIsVUFDSSxJQUFpRCxFQUFFLFVBQTZCLEVBQ2hGLE9BQTJCO1lBQzdCLDRGQUE0RjtZQUM1Rix1RkFBdUY7WUFDdkYsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxPQUFPLEdBQUcsc0NBQUksSUFBSSxDQUFDLFNBQVMsR0FBSyxPQUFPLENBQXNCLENBQUM7WUFDcEUsSUFBSSxDQUFDLElBQUksR0FBRyxxQkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLEVB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RSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM5QyxDQUFDO1FBRUQsb0NBQWMsR0FBZDtZQUNFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN4QyxDQUFDO1FBRUQsd0NBQWtCLEdBQWxCO1lBQ0UsZ0dBQWdHO1lBQ2hHLG9CQUFvQjtZQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsZ0JBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ2xELENBQUM7UUFDSCxrQkFBQztJQUFELENBQUMsQUFqR0QsSUFpR0M7SUFqR1ksa0NBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Q29tcGlsYXRpb25UaWNrZXQsIGZyZXNoQ29tcGlsYXRpb25UaWNrZXQsIGluY3JlbWVudGFsRnJvbURyaXZlclRpY2tldCwgTmdDb21waWxlciwgTmdDb21waWxlckhvc3R9IGZyb20gJy4vY29yZSc7XG5pbXBvcnQge05nQ29tcGlsZXJPcHRpb25zLCBVbmlmaWVkTW9kdWxlc0hvc3R9IGZyb20gJy4vY29yZS9hcGknO1xuaW1wb3J0IHtOb2RlSlNGaWxlU3lzdGVtLCBzZXRGaWxlU3lzdGVtfSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UGF0Y2hlZFByb2dyYW1JbmNyZW1lbnRhbEJ1aWxkU3RyYXRlZ3l9IGZyb20gJy4vaW5jcmVtZW50YWwnO1xuaW1wb3J0IHtBY3RpdmVQZXJmUmVjb3JkZXIsIE5PT1BfUEVSRl9SRUNPUkRFUiwgUGVyZlBoYXNlfSBmcm9tICcuL3BlcmYnO1xuaW1wb3J0IHt1bnRhZ0FsbFRzRmlsZXN9IGZyb20gJy4vc2hpbXMnO1xuaW1wb3J0IHtPcHRpbWl6ZUZvcn0gZnJvbSAnLi90eXBlY2hlY2svYXBpJztcbmltcG9ydCB7UmV1c2VkUHJvZ3JhbVN0cmF0ZWd5fSBmcm9tICcuL3R5cGVjaGVjay9zcmMvYXVnbWVudGVkX3Byb2dyYW0nO1xuXG4vLyBUaGUgZm9sbG93aW5nIGlzIG5lZWRlZCB0byBmaXggYSB0aGUgY2hpY2tlbi1hbmQtZWdnIGlzc3VlIHdoZXJlIHRoZSBzeW5jIChpbnRvIGczKSBzY3JpcHQgd2lsbFxuLy8gcmVmdXNlIHRvIGFjY2VwdCB0aGlzIGZpbGUgdW5sZXNzIHRoZSBmb2xsb3dpbmcgc3RyaW5nIGFwcGVhcnM6XG4vLyBpbXBvcnQgKiBhcyBwbHVnaW4gZnJvbSAnQGJhemVsL3R5cGVzY3JpcHQvaW50ZXJuYWwvdHNjX3dyYXBwZWQvcGx1Z2luX2FwaSc7XG5cbi8qKlxuICogQSBgdHMuQ29tcGlsZXJIb3N0YCB3aGljaCBhbHNvIHJldHVybnMgYSBsaXN0IG9mIGlucHV0IGZpbGVzLCBvdXQgb2Ygd2hpY2ggdGhlIGB0cy5Qcm9ncmFtYFxuICogc2hvdWxkIGJlIGNyZWF0ZWQuXG4gKlxuICogQ3VycmVudGx5IG1pcnJvcmVkIGZyb20gQGJhemVsL3R5cGVzY3JpcHQvaW50ZXJuYWwvdHNjX3dyYXBwZWQvcGx1Z2luX2FwaSAod2l0aCB0aGUgbmFtaW5nIG9mXG4gKiBgZmlsZU5hbWVUb01vZHVsZU5hbWVgIGNvcnJlY3RlZCkuXG4gKi9cbmludGVyZmFjZSBQbHVnaW5Db21waWxlckhvc3QgZXh0ZW5kcyB0cy5Db21waWxlckhvc3QsIFBhcnRpYWw8VW5pZmllZE1vZHVsZXNIb3N0PiB7XG4gIHJlYWRvbmx5IGlucHV0RmlsZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBNaXJyb3JzIHRoZSBwbHVnaW4gaW50ZXJmYWNlIGZyb20gdHNjX3dyYXBwZWQgd2hpY2ggaXMgY3VycmVudGx5IHVuZGVyIGFjdGl2ZSBkZXZlbG9wbWVudC4gVG9cbiAqIGVuYWJsZSBwcm9ncmVzcyB0byBiZSBtYWRlIGluIHBhcmFsbGVsLCB0aGUgdXBzdHJlYW0gaW50ZXJmYWNlIGlzbid0IGltcGxlbWVudGVkIGRpcmVjdGx5LlxuICogSW5zdGVhZCwgYFRzY1BsdWdpbmAgaGVyZSBpcyBzdHJ1Y3R1cmFsbHkgYXNzaWduYWJsZSB0byB3aGF0IHRzY193cmFwcGVkIGV4cGVjdHMuXG4gKi9cbmludGVyZmFjZSBUc2NQbHVnaW4ge1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgd3JhcEhvc3QoXG4gICAgICBob3N0OiB0cy5Db21waWxlckhvc3QmUGFydGlhbDxVbmlmaWVkTW9kdWxlc0hvc3Q+LCBpbnB1dEZpbGVzOiBSZWFkb25seUFycmF5PHN0cmluZz4sXG4gICAgICBvcHRpb25zOiB0cy5Db21waWxlck9wdGlvbnMpOiBQbHVnaW5Db21waWxlckhvc3Q7XG5cbiAgc2V0dXBDb21waWxhdGlvbihwcm9ncmFtOiB0cy5Qcm9ncmFtLCBvbGRQcm9ncmFtPzogdHMuUHJvZ3JhbSk6IHtcbiAgICBpZ25vcmVGb3JEaWFnbm9zdGljczogU2V0PHRzLlNvdXJjZUZpbGU+LFxuICAgIGlnbm9yZUZvckVtaXQ6IFNldDx0cy5Tb3VyY2VGaWxlPixcbiAgfTtcblxuICBnZXREaWFnbm9zdGljcyhmaWxlPzogdHMuU291cmNlRmlsZSk6IHRzLkRpYWdub3N0aWNbXTtcblxuICBnZXRPcHRpb25EaWFnbm9zdGljcygpOiB0cy5EaWFnbm9zdGljW107XG5cbiAgZ2V0TmV4dFByb2dyYW0oKTogdHMuUHJvZ3JhbTtcblxuICBjcmVhdGVUcmFuc2Zvcm1lcnMoKTogdHMuQ3VzdG9tVHJhbnNmb3JtZXJzO1xufVxuXG4vKipcbiAqIEEgcGx1Z2luIGZvciBgdHNjX3dyYXBwZWRgIHdoaWNoIGFsbG93cyBBbmd1bGFyIGNvbXBpbGF0aW9uIGZyb20gYSBwbGFpbiBgdHNfbGlicmFyeWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ1RzY1BsdWdpbiBpbXBsZW1lbnRzIFRzY1BsdWdpbiB7XG4gIG5hbWUgPSAnbmd0c2MnO1xuXG4gIHByaXZhdGUgb3B0aW9uczogTmdDb21waWxlck9wdGlvbnN8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgaG9zdDogTmdDb21waWxlckhvc3R8bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2NvbXBpbGVyOiBOZ0NvbXBpbGVyfG51bGwgPSBudWxsO1xuXG4gIGdldCBjb21waWxlcigpOiBOZ0NvbXBpbGVyIHtcbiAgICBpZiAodGhpcy5fY29tcGlsZXIgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTGlmZWN5Y2xlIGVycm9yOiBzZXR1cENvbXBpbGF0aW9uKCkgbXVzdCBiZSBjYWxsZWQgZmlyc3QuJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb21waWxlcjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmdPcHRpb25zOiB7fSkge1xuICAgIHNldEZpbGVTeXN0ZW0obmV3IE5vZGVKU0ZpbGVTeXN0ZW0oKSk7XG4gIH1cblxuICB3cmFwSG9zdChcbiAgICAgIGhvc3Q6IHRzLkNvbXBpbGVySG9zdCZQYXJ0aWFsPFVuaWZpZWRNb2R1bGVzSG9zdD4sIGlucHV0RmlsZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxuICAgICAgb3B0aW9uczogdHMuQ29tcGlsZXJPcHRpb25zKTogUGx1Z2luQ29tcGlsZXJIb3N0IHtcbiAgICAvLyBUT0RPKGFseGh1Yik6IEV2ZW50dWFsbHkgdGhlIGB3cmFwSG9zdCgpYCBBUEkgd2lsbCBhY2NlcHQgdGhlIG9sZCBgdHMuUHJvZ3JhbWAgKGlmIG9uZSBpc1xuICAgIC8vIGF2YWlsYWJsZSkuIFdoZW4gaXQgZG9lcywgaXRzIGB0cy5Tb3VyY2VGaWxlYHMgbmVlZCB0byBiZSByZS10YWdnZWQgdG8gZW5hYmxlIHByb3BlclxuICAgIC8vIGluY3JlbWVudGFsIGNvbXBpbGF0aW9uLlxuICAgIHRoaXMub3B0aW9ucyA9IHsuLi50aGlzLm5nT3B0aW9ucywgLi4ub3B0aW9uc30gYXMgTmdDb21waWxlck9wdGlvbnM7XG4gICAgdGhpcy5ob3N0ID0gTmdDb21waWxlckhvc3Qud3JhcChob3N0LCBpbnB1dEZpbGVzLCB0aGlzLm9wdGlvbnMsIC8qIG9sZFByb2dyYW0gKi8gbnVsbCk7XG4gICAgcmV0dXJuIHRoaXMuaG9zdDtcbiAgfVxuXG4gIHNldHVwQ29tcGlsYXRpb24ocHJvZ3JhbTogdHMuUHJvZ3JhbSwgb2xkUHJvZ3JhbT86IHRzLlByb2dyYW0pOiB7XG4gICAgaWdub3JlRm9yRGlhZ25vc3RpY3M6IFNldDx0cy5Tb3VyY2VGaWxlPixcbiAgICBpZ25vcmVGb3JFbWl0OiBTZXQ8dHMuU291cmNlRmlsZT4sXG4gIH0ge1xuICAgIC8vIFRPRE8oYWx4aHViKTogd2UgcHJvdmlkZSBhIGBQZXJmUmVjb3JkZXJgIHRvIHRoZSBjb21waWxlciwgYnV0IGJlY2F1c2Ugd2UncmUgbm90IGRyaXZpbmcgdGhlXG4gICAgLy8gY29tcGlsYXRpb24sIHRoZSBpbmZvcm1hdGlvbiBjYXB0dXJlZCB3aXRoaW4gaXQgaXMgaW5jb21wbGV0ZSwgYW5kIG1heSBub3QgaW5jbHVkZSB0aW1pbmdzXG4gICAgLy8gZm9yIHBoYXNlcyBzdWNoIGFzIGVtaXQuXG4gICAgLy9cbiAgICAvLyBBZGRpdGlvbmFsbHksIG5vdGhpbmcgYWN0dWFsbHkgY2FwdHVyZXMgdGhlIHBlcmYgcmVzdWx0cyBoZXJlLCBzbyByZWNvcmRpbmcgc3RhdHMgYXQgYWxsIGlzXG4gICAgLy8gc29tZXdoYXQgbW9vdCBmb3Igbm93IDopXG4gICAgY29uc3QgcGVyZlJlY29yZGVyID0gQWN0aXZlUGVyZlJlY29yZGVyLnplcm9lZFRvTm93KCk7XG4gICAgaWYgKHRoaXMuaG9zdCA9PT0gbnVsbCB8fCB0aGlzLm9wdGlvbnMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTGlmZWN5Y2xlIGVycm9yOiBzZXR1cENvbXBpbGF0aW9uKCkgYmVmb3JlIHdyYXBIb3N0KCkuJyk7XG4gICAgfVxuICAgIHRoaXMuaG9zdC5wb3N0UHJvZ3JhbUNyZWF0aW9uQ2xlYW51cCgpO1xuICAgIHVudGFnQWxsVHNGaWxlcyhwcm9ncmFtKTtcbiAgICBjb25zdCB0eXBlQ2hlY2tTdHJhdGVneSA9IG5ldyBSZXVzZWRQcm9ncmFtU3RyYXRlZ3koXG4gICAgICAgIHByb2dyYW0sIHRoaXMuaG9zdCwgdGhpcy5vcHRpb25zLCB0aGlzLmhvc3Quc2hpbUV4dGVuc2lvblByZWZpeGVzKTtcbiAgICBjb25zdCBzdHJhdGVneSA9IG5ldyBQYXRjaGVkUHJvZ3JhbUluY3JlbWVudGFsQnVpbGRTdHJhdGVneSgpO1xuICAgIGNvbnN0IG9sZERyaXZlciA9IG9sZFByb2dyYW0gIT09IHVuZGVmaW5lZCA/IHN0cmF0ZWd5LmdldEluY3JlbWVudGFsRHJpdmVyKG9sZFByb2dyYW0pIDogbnVsbDtcbiAgICBsZXQgdGlja2V0OiBDb21waWxhdGlvblRpY2tldDtcblxuICAgIGxldCBtb2RpZmllZFJlc291cmNlRmlsZXM6IFNldDxzdHJpbmc+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5ob3N0LmdldE1vZGlmaWVkUmVzb3VyY2VGaWxlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBtb2RpZmllZFJlc291cmNlRmlsZXMgPSB0aGlzLmhvc3QuZ2V0TW9kaWZpZWRSZXNvdXJjZUZpbGVzKCk7XG4gICAgfVxuICAgIGlmIChtb2RpZmllZFJlc291cmNlRmlsZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbW9kaWZpZWRSZXNvdXJjZUZpbGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgfVxuXG4gICAgaWYgKG9sZFByb2dyYW0gPT09IHVuZGVmaW5lZCB8fCBvbGREcml2ZXIgPT09IG51bGwpIHtcbiAgICAgIHRpY2tldCA9IGZyZXNoQ29tcGlsYXRpb25UaWNrZXQoXG4gICAgICAgICAgcHJvZ3JhbSwgdGhpcy5vcHRpb25zLCBzdHJhdGVneSwgdHlwZUNoZWNrU3RyYXRlZ3ksIHBlcmZSZWNvcmRlcixcbiAgICAgICAgICAvKiBlbmFibGVUZW1wbGF0ZVR5cGVDaGVja2VyICovIGZhbHNlLCAvKiB1c2VQb2lzb25lZERhdGEgKi8gZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHJhdGVneS50b05leHRCdWlsZFN0cmF0ZWd5KCkuZ2V0SW5jcmVtZW50YWxEcml2ZXIob2xkUHJvZ3JhbSk7XG4gICAgICB0aWNrZXQgPSBpbmNyZW1lbnRhbEZyb21Ecml2ZXJUaWNrZXQoXG4gICAgICAgICAgb2xkUHJvZ3JhbSwgb2xkRHJpdmVyLCBwcm9ncmFtLCB0aGlzLm9wdGlvbnMsIHN0cmF0ZWd5LCB0eXBlQ2hlY2tTdHJhdGVneSxcbiAgICAgICAgICBtb2RpZmllZFJlc291cmNlRmlsZXMsIHBlcmZSZWNvcmRlciwgZmFsc2UsIGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5fY29tcGlsZXIgPSBOZ0NvbXBpbGVyLmZyb21UaWNrZXQodGlja2V0LCB0aGlzLmhvc3QpO1xuICAgIHJldHVybiB7XG4gICAgICBpZ25vcmVGb3JEaWFnbm9zdGljczogdGhpcy5fY29tcGlsZXIuaWdub3JlRm9yRGlhZ25vc3RpY3MsXG4gICAgICBpZ25vcmVGb3JFbWl0OiB0aGlzLl9jb21waWxlci5pZ25vcmVGb3JFbWl0LFxuICAgIH07XG4gIH1cblxuICBnZXREaWFnbm9zdGljcyhmaWxlPzogdHMuU291cmNlRmlsZSk6IHRzLkRpYWdub3N0aWNbXSB7XG4gICAgaWYgKGZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcGlsZXIuZ2V0RGlhZ25vc3RpY3MoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZXIuZ2V0RGlhZ25vc3RpY3NGb3JGaWxlKGZpbGUsIE9wdGltaXplRm9yLldob2xlUHJvZ3JhbSk7XG4gIH1cblxuICBnZXRPcHRpb25EaWFnbm9zdGljcygpOiB0cy5EaWFnbm9zdGljW10ge1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLmdldE9wdGlvbkRpYWdub3N0aWNzKCk7XG4gIH1cblxuICBnZXROZXh0UHJvZ3JhbSgpOiB0cy5Qcm9ncmFtIHtcbiAgICByZXR1cm4gdGhpcy5jb21waWxlci5nZXROZXh0UHJvZ3JhbSgpO1xuICB9XG5cbiAgY3JlYXRlVHJhbnNmb3JtZXJzKCk6IHRzLkN1c3RvbVRyYW5zZm9ybWVycyB7XG4gICAgLy8gVGhlIHBsdWdpbiBjb25zdW1lciBkb2Vzbid0IGtub3cgYWJvdXQgb3VyIHBlcmYgdHJhY2luZyBzeXN0ZW0sIHNvIHdlIGNvbnNpZGVyIHRoZSBlbWl0IHBoYXNlXG4gICAgLy8gYXMgYmVnaW5uaW5nIG5vdy5cbiAgICB0aGlzLmNvbXBpbGVyLnBlcmZSZWNvcmRlci5waGFzZShQZXJmUGhhc2UuVHlwZVNjcmlwdEVtaXQpO1xuICAgIHJldHVybiB0aGlzLmNvbXBpbGVyLnByZXBhcmVFbWl0KCkudHJhbnNmb3JtZXJzO1xuICB9XG59XG4iXX0=