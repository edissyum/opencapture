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
        define("@angular/compiler-cli/src/ngtsc/perf/src/api", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PerfCheckpoint = exports.PerfEvent = exports.PerfPhase = void 0;
    /**
     * A phase of compilation for which time is tracked in a distinct bucket.
     */
    var PerfPhase;
    (function (PerfPhase) {
        /**
         * The "default" phase which tracks time not spent in any other phase.
         */
        PerfPhase[PerfPhase["Unaccounted"] = 0] = "Unaccounted";
        /**
         * Time spent setting up the compiler, before a TypeScript program is created.
         *
         * This includes operations like configuring the `ts.CompilerHost` and any wrappers.
         */
        PerfPhase[PerfPhase["Setup"] = 1] = "Setup";
        /**
         * Time spent in `ts.createProgram`, including reading and parsing `ts.SourceFile`s in the
         * `ts.CompilerHost`.
         *
         * This might be an incremental program creation operation.
         */
        PerfPhase[PerfPhase["TypeScriptProgramCreate"] = 2] = "TypeScriptProgramCreate";
        /**
         * Time spent reconciling the contents of an old `ts.Program` with the new incremental one.
         *
         * Only present in incremental compilations.
         */
        PerfPhase[PerfPhase["Reconciliation"] = 3] = "Reconciliation";
        /**
         * Time spent updating an `NgCompiler` instance with a resource-only change.
         *
         * Only present in incremental compilations where the change was resource-only.
         */
        PerfPhase[PerfPhase["ResourceUpdate"] = 4] = "ResourceUpdate";
        /**
         * Time spent calculating the plain TypeScript diagnostics (structural and semantic).
         */
        PerfPhase[PerfPhase["TypeScriptDiagnostics"] = 5] = "TypeScriptDiagnostics";
        /**
         * Time spent in Angular analysis of individual classes in the program.
         */
        PerfPhase[PerfPhase["Analysis"] = 6] = "Analysis";
        /**
         * Time spent in Angular global analysis (synthesis of analysis information into a complete
         * understanding of the program).
         */
        PerfPhase[PerfPhase["Resolve"] = 7] = "Resolve";
        /**
         * Time spent building the import graph of the program in order to perform cycle detection.
         */
        PerfPhase[PerfPhase["CycleDetection"] = 8] = "CycleDetection";
        /**
         * Time spent generating the text of Type Check Blocks in order to perform template type checking.
         */
        PerfPhase[PerfPhase["TcbGeneration"] = 9] = "TcbGeneration";
        /**
         * Time spent updating the `ts.Program` with new Type Check Block code.
         */
        PerfPhase[PerfPhase["TcbUpdateProgram"] = 10] = "TcbUpdateProgram";
        /**
         * Time spent by TypeScript performing its emit operations, including downleveling and writing
         * output files.
         */
        PerfPhase[PerfPhase["TypeScriptEmit"] = 11] = "TypeScriptEmit";
        /**
         * Time spent by Angular performing code transformations of ASTs as they're about to be emitted.
         *
         * This includes the actual code generation step for templates, and occurs during the emit phase
         * (but is tracked separately from `TypeScriptEmit` time).
         */
        PerfPhase[PerfPhase["Compile"] = 12] = "Compile";
        /**
         * Time spent performing a `TemplateTypeChecker` autocompletion operation.
         */
        PerfPhase[PerfPhase["TtcAutocompletion"] = 13] = "TtcAutocompletion";
        /**
         * Time spent computing template type-checking diagnostics.
         */
        PerfPhase[PerfPhase["TtcDiagnostics"] = 14] = "TtcDiagnostics";
        /**
         * Time spent getting a `Symbol` from the `TemplateTypeChecker`.
         */
        PerfPhase[PerfPhase["TtcSymbol"] = 15] = "TtcSymbol";
        /**
         * Time spent by the Angular Language Service calculating a "get references" or a renaming
         * operation.
         */
        PerfPhase[PerfPhase["LsReferencesAndRenames"] = 16] = "LsReferencesAndRenames";
        /**
         * Time spent by the Angular Language Service calculating a "quick info" operation.
         */
        PerfPhase[PerfPhase["LsQuickInfo"] = 17] = "LsQuickInfo";
        /**
         * Time spent by the Angular Language Service calculating a "get type definition" or "get
         * definition" operation.
         */
        PerfPhase[PerfPhase["LsDefinition"] = 18] = "LsDefinition";
        /**
         * Time spent by the Angular Language Service calculating a "get completions" (AKA autocomplete)
         * operation.
         */
        PerfPhase[PerfPhase["LsCompletions"] = 19] = "LsCompletions";
        /**
         * Time spent by the Angular Language Service calculating a "view template typecheck block"
         * operation.
         */
        PerfPhase[PerfPhase["LsTcb"] = 20] = "LsTcb";
        /**
         * Time spent by the Angular Language Service calculating diagnostics.
         */
        PerfPhase[PerfPhase["LsDiagnostics"] = 21] = "LsDiagnostics";
        /**
         * Time spent by the Angular Language Service calculating a "get component locations for template"
         * operation.
         */
        PerfPhase[PerfPhase["LsComponentLocations"] = 22] = "LsComponentLocations";
        /**
         * Tracks the number of `PerfPhase`s, and must appear at the end of the list.
         */
        PerfPhase[PerfPhase["LAST"] = 23] = "LAST";
    })(PerfPhase = exports.PerfPhase || (exports.PerfPhase = {}));
    /**
     * Represents some occurrence during compilation, and is tracked with a counter.
     */
    var PerfEvent;
    (function (PerfEvent) {
        /**
         * Counts the number of `.d.ts` files in the program.
         */
        PerfEvent[PerfEvent["InputDtsFile"] = 0] = "InputDtsFile";
        /**
         * Counts the number of non-`.d.ts` files in the program.
         */
        PerfEvent[PerfEvent["InputTsFile"] = 1] = "InputTsFile";
        /**
         * An `@Component` class was analyzed.
         */
        PerfEvent[PerfEvent["AnalyzeComponent"] = 2] = "AnalyzeComponent";
        /**
         * An `@Directive` class was analyzed.
         */
        PerfEvent[PerfEvent["AnalyzeDirective"] = 3] = "AnalyzeDirective";
        /**
         * An `@Injectable` class was analyzed.
         */
        PerfEvent[PerfEvent["AnalyzeInjectable"] = 4] = "AnalyzeInjectable";
        /**
         * An `@NgModule` class was analyzed.
         */
        PerfEvent[PerfEvent["AnalyzeNgModule"] = 5] = "AnalyzeNgModule";
        /**
         * An `@Pipe` class was analyzed.
         */
        PerfEvent[PerfEvent["AnalyzePipe"] = 6] = "AnalyzePipe";
        /**
         * A trait was analyzed.
         *
         * In theory, this should be the sum of the `Analyze` counters for each decorator type.
         */
        PerfEvent[PerfEvent["TraitAnalyze"] = 7] = "TraitAnalyze";
        /**
         * A trait had a prior analysis available from an incremental program, and did not need to be
         * re-analyzed.
         */
        PerfEvent[PerfEvent["TraitReuseAnalysis"] = 8] = "TraitReuseAnalysis";
        /**
         * A `ts.SourceFile` directly changed between the prior program and a new incremental compilation.
         */
        PerfEvent[PerfEvent["SourceFilePhysicalChange"] = 9] = "SourceFilePhysicalChange";
        /**
         * A `ts.SourceFile` did not physically changed, but according to the file dependency graph, has
         * logically changed between the prior program and a new incremental compilation.
         */
        PerfEvent[PerfEvent["SourceFileLogicalChange"] = 10] = "SourceFileLogicalChange";
        /**
         * A `ts.SourceFile` has not logically changed and all of its analysis results were thus available
         * for reuse.
         */
        PerfEvent[PerfEvent["SourceFileReuseAnalysis"] = 11] = "SourceFileReuseAnalysis";
        /**
         * A Type Check Block (TCB) was generated.
         */
        PerfEvent[PerfEvent["GenerateTcb"] = 12] = "GenerateTcb";
        /**
         * A Type Check Block (TCB) could not be generated because inlining was disabled, and the block
         * would've required inlining.
         */
        PerfEvent[PerfEvent["SkipGenerateTcbNoInline"] = 13] = "SkipGenerateTcbNoInline";
        /**
         * A `.ngtypecheck.ts` file could be reused from the previous program and did not need to be
         * regenerated.
         */
        PerfEvent[PerfEvent["ReuseTypeCheckFile"] = 14] = "ReuseTypeCheckFile";
        /**
         * The template type-checking program required changes and had to be updated in an incremental
         * step.
         */
        PerfEvent[PerfEvent["UpdateTypeCheckProgram"] = 15] = "UpdateTypeCheckProgram";
        /**
         * The compiler was able to prove that a `ts.SourceFile` did not need to be re-emitted.
         */
        PerfEvent[PerfEvent["EmitSkipSourceFile"] = 16] = "EmitSkipSourceFile";
        /**
         * A `ts.SourceFile` was emitted.
         */
        PerfEvent[PerfEvent["EmitSourceFile"] = 17] = "EmitSourceFile";
        /**
         * Tracks the number of `PrefEvent`s, and must appear at the end of the list.
         */
        PerfEvent[PerfEvent["LAST"] = 18] = "LAST";
    })(PerfEvent = exports.PerfEvent || (exports.PerfEvent = {}));
    /**
     * Represents a checkpoint during compilation at which the memory usage of the compiler should be
     * recorded.
     */
    var PerfCheckpoint;
    (function (PerfCheckpoint) {
        /**
         * The point at which the `PerfRecorder` was created, and ideally tracks memory used before any
         * compilation structures are created.
         */
        PerfCheckpoint[PerfCheckpoint["Initial"] = 0] = "Initial";
        /**
         * The point just after the `ts.Program` has been created.
         */
        PerfCheckpoint[PerfCheckpoint["TypeScriptProgramCreate"] = 1] = "TypeScriptProgramCreate";
        /**
         * The point just before Angular analysis starts.
         *
         * In the main usage pattern for the compiler, TypeScript diagnostics have been calculated at this
         * point, so the `ts.TypeChecker` has fully ingested the current program, all `ts.Type` structures
         * and `ts.Symbol`s have been created.
         */
        PerfCheckpoint[PerfCheckpoint["PreAnalysis"] = 2] = "PreAnalysis";
        /**
         * The point just after Angular analysis completes.
         */
        PerfCheckpoint[PerfCheckpoint["Analysis"] = 3] = "Analysis";
        /**
         * The point just after Angular resolution is complete.
         */
        PerfCheckpoint[PerfCheckpoint["Resolve"] = 4] = "Resolve";
        /**
         * The point just after Type Check Blocks (TCBs) have been generated.
         */
        PerfCheckpoint[PerfCheckpoint["TtcGeneration"] = 5] = "TtcGeneration";
        /**
         * The point just after the template type-checking program has been updated with any new TCBs.
         */
        PerfCheckpoint[PerfCheckpoint["TtcUpdateProgram"] = 6] = "TtcUpdateProgram";
        /**
         * The point just before emit begins.
         *
         * In the main usage pattern for the compiler, all template type-checking diagnostics have been
         * requested at this point.
         */
        PerfCheckpoint[PerfCheckpoint["PreEmit"] = 7] = "PreEmit";
        /**
         * The point just after the program has been fully emitted.
         */
        PerfCheckpoint[PerfCheckpoint["Emit"] = 8] = "Emit";
        /**
         * Tracks the number of `PerfCheckpoint`s, and must appear at the end of the list.
         */
        PerfCheckpoint[PerfCheckpoint["LAST"] = 9] = "LAST";
    })(PerfCheckpoint = exports.PerfCheckpoint || (exports.PerfCheckpoint = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy9wZXJmL3NyYy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUg7O09BRUc7SUFDSCxJQUFZLFNBMklYO0lBM0lELFdBQVksU0FBUztRQUNuQjs7V0FFRztRQUNILHVEQUFXLENBQUE7UUFFWDs7OztXQUlHO1FBQ0gsMkNBQUssQ0FBQTtRQUVMOzs7OztXQUtHO1FBQ0gsK0VBQXVCLENBQUE7UUFFdkI7Ozs7V0FJRztRQUNILDZEQUFjLENBQUE7UUFFZDs7OztXQUlHO1FBQ0gsNkRBQWMsQ0FBQTtRQUVkOztXQUVHO1FBQ0gsMkVBQXFCLENBQUE7UUFFckI7O1dBRUc7UUFDSCxpREFBUSxDQUFBO1FBRVI7OztXQUdHO1FBQ0gsK0NBQU8sQ0FBQTtRQUVQOztXQUVHO1FBQ0gsNkRBQWMsQ0FBQTtRQUVkOztXQUVHO1FBQ0gsMkRBQWEsQ0FBQTtRQUViOztXQUVHO1FBQ0gsa0VBQWdCLENBQUE7UUFFaEI7OztXQUdHO1FBQ0gsOERBQWMsQ0FBQTtRQUVkOzs7OztXQUtHO1FBQ0gsZ0RBQU8sQ0FBQTtRQUVQOztXQUVHO1FBQ0gsb0VBQWlCLENBQUE7UUFFakI7O1dBRUc7UUFDSCw4REFBYyxDQUFBO1FBRWQ7O1dBRUc7UUFDSCxvREFBUyxDQUFBO1FBRVQ7OztXQUdHO1FBQ0gsOEVBQXNCLENBQUE7UUFFdEI7O1dBRUc7UUFDSCx3REFBVyxDQUFBO1FBRVg7OztXQUdHO1FBQ0gsMERBQVksQ0FBQTtRQUVaOzs7V0FHRztRQUNILDREQUFhLENBQUE7UUFFYjs7O1dBR0c7UUFDSCw0Q0FBSyxDQUFBO1FBRUw7O1dBRUc7UUFDSCw0REFBYSxDQUFBO1FBRWI7OztXQUdHO1FBQ0gsMEVBQW9CLENBQUE7UUFFcEI7O1dBRUc7UUFDSCwwQ0FBSSxDQUFBO0lBQ04sQ0FBQyxFQTNJVyxTQUFTLEdBQVQsaUJBQVMsS0FBVCxpQkFBUyxRQTJJcEI7SUFFRDs7T0FFRztJQUNILElBQVksU0F1R1g7SUF2R0QsV0FBWSxTQUFTO1FBQ25COztXQUVHO1FBQ0gseURBQVksQ0FBQTtRQUVaOztXQUVHO1FBQ0gsdURBQVcsQ0FBQTtRQUVYOztXQUVHO1FBQ0gsaUVBQWdCLENBQUE7UUFFaEI7O1dBRUc7UUFDSCxpRUFBZ0IsQ0FBQTtRQUVoQjs7V0FFRztRQUNILG1FQUFpQixDQUFBO1FBRWpCOztXQUVHO1FBQ0gsK0RBQWUsQ0FBQTtRQUVmOztXQUVHO1FBQ0gsdURBQVcsQ0FBQTtRQUVYOzs7O1dBSUc7UUFDSCx5REFBWSxDQUFBO1FBRVo7OztXQUdHO1FBQ0gscUVBQWtCLENBQUE7UUFFbEI7O1dBRUc7UUFDSCxpRkFBd0IsQ0FBQTtRQUV4Qjs7O1dBR0c7UUFDSCxnRkFBdUIsQ0FBQTtRQUV2Qjs7O1dBR0c7UUFDSCxnRkFBdUIsQ0FBQTtRQUV2Qjs7V0FFRztRQUNILHdEQUFXLENBQUE7UUFFWDs7O1dBR0c7UUFDSCxnRkFBdUIsQ0FBQTtRQUV2Qjs7O1dBR0c7UUFDSCxzRUFBa0IsQ0FBQTtRQUVsQjs7O1dBR0c7UUFDSCw4RUFBc0IsQ0FBQTtRQUV0Qjs7V0FFRztRQUNILHNFQUFrQixDQUFBO1FBRWxCOztXQUVHO1FBQ0gsOERBQWMsQ0FBQTtRQUVkOztXQUVHO1FBQ0gsMENBQUksQ0FBQTtJQUNOLENBQUMsRUF2R1csU0FBUyxHQUFULGlCQUFTLEtBQVQsaUJBQVMsUUF1R3BCO0lBRUQ7OztPQUdHO0lBQ0gsSUFBWSxjQTBEWDtJQTFERCxXQUFZLGNBQWM7UUFDeEI7OztXQUdHO1FBQ0gseURBQU8sQ0FBQTtRQUVQOztXQUVHO1FBQ0gseUZBQXVCLENBQUE7UUFFdkI7Ozs7OztXQU1HO1FBQ0gsaUVBQVcsQ0FBQTtRQUVYOztXQUVHO1FBQ0gsMkRBQVEsQ0FBQTtRQUVSOztXQUVHO1FBQ0gseURBQU8sQ0FBQTtRQUVQOztXQUVHO1FBQ0gscUVBQWEsQ0FBQTtRQUViOztXQUVHO1FBQ0gsMkVBQWdCLENBQUE7UUFFaEI7Ozs7O1dBS0c7UUFDSCx5REFBTyxDQUFBO1FBRVA7O1dBRUc7UUFDSCxtREFBSSxDQUFBO1FBRUo7O1dBRUc7UUFDSCxtREFBSSxDQUFBO0lBQ04sQ0FBQyxFQTFEVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQTBEekIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIHBoYXNlIG9mIGNvbXBpbGF0aW9uIGZvciB3aGljaCB0aW1lIGlzIHRyYWNrZWQgaW4gYSBkaXN0aW5jdCBidWNrZXQuXG4gKi9cbmV4cG9ydCBlbnVtIFBlcmZQaGFzZSB7XG4gIC8qKlxuICAgKiBUaGUgXCJkZWZhdWx0XCIgcGhhc2Ugd2hpY2ggdHJhY2tzIHRpbWUgbm90IHNwZW50IGluIGFueSBvdGhlciBwaGFzZS5cbiAgICovXG4gIFVuYWNjb3VudGVkLFxuXG4gIC8qKlxuICAgKiBUaW1lIHNwZW50IHNldHRpbmcgdXAgdGhlIGNvbXBpbGVyLCBiZWZvcmUgYSBUeXBlU2NyaXB0IHByb2dyYW0gaXMgY3JlYXRlZC5cbiAgICpcbiAgICogVGhpcyBpbmNsdWRlcyBvcGVyYXRpb25zIGxpa2UgY29uZmlndXJpbmcgdGhlIGB0cy5Db21waWxlckhvc3RgIGFuZCBhbnkgd3JhcHBlcnMuXG4gICAqL1xuICBTZXR1cCxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBpbiBgdHMuY3JlYXRlUHJvZ3JhbWAsIGluY2x1ZGluZyByZWFkaW5nIGFuZCBwYXJzaW5nIGB0cy5Tb3VyY2VGaWxlYHMgaW4gdGhlXG4gICAqIGB0cy5Db21waWxlckhvc3RgLlxuICAgKlxuICAgKiBUaGlzIG1pZ2h0IGJlIGFuIGluY3JlbWVudGFsIHByb2dyYW0gY3JlYXRpb24gb3BlcmF0aW9uLlxuICAgKi9cbiAgVHlwZVNjcmlwdFByb2dyYW1DcmVhdGUsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgcmVjb25jaWxpbmcgdGhlIGNvbnRlbnRzIG9mIGFuIG9sZCBgdHMuUHJvZ3JhbWAgd2l0aCB0aGUgbmV3IGluY3JlbWVudGFsIG9uZS5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGluIGluY3JlbWVudGFsIGNvbXBpbGF0aW9ucy5cbiAgICovXG4gIFJlY29uY2lsaWF0aW9uLFxuXG4gIC8qKlxuICAgKiBUaW1lIHNwZW50IHVwZGF0aW5nIGFuIGBOZ0NvbXBpbGVyYCBpbnN0YW5jZSB3aXRoIGEgcmVzb3VyY2Utb25seSBjaGFuZ2UuXG4gICAqXG4gICAqIE9ubHkgcHJlc2VudCBpbiBpbmNyZW1lbnRhbCBjb21waWxhdGlvbnMgd2hlcmUgdGhlIGNoYW5nZSB3YXMgcmVzb3VyY2Utb25seS5cbiAgICovXG4gIFJlc291cmNlVXBkYXRlLFxuXG4gIC8qKlxuICAgKiBUaW1lIHNwZW50IGNhbGN1bGF0aW5nIHRoZSBwbGFpbiBUeXBlU2NyaXB0IGRpYWdub3N0aWNzIChzdHJ1Y3R1cmFsIGFuZCBzZW1hbnRpYykuXG4gICAqL1xuICBUeXBlU2NyaXB0RGlhZ25vc3RpY3MsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgaW4gQW5ndWxhciBhbmFseXNpcyBvZiBpbmRpdmlkdWFsIGNsYXNzZXMgaW4gdGhlIHByb2dyYW0uXG4gICAqL1xuICBBbmFseXNpcyxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBpbiBBbmd1bGFyIGdsb2JhbCBhbmFseXNpcyAoc3ludGhlc2lzIG9mIGFuYWx5c2lzIGluZm9ybWF0aW9uIGludG8gYSBjb21wbGV0ZVxuICAgKiB1bmRlcnN0YW5kaW5nIG9mIHRoZSBwcm9ncmFtKS5cbiAgICovXG4gIFJlc29sdmUsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnVpbGRpbmcgdGhlIGltcG9ydCBncmFwaCBvZiB0aGUgcHJvZ3JhbSBpbiBvcmRlciB0byBwZXJmb3JtIGN5Y2xlIGRldGVjdGlvbi5cbiAgICovXG4gIEN5Y2xlRGV0ZWN0aW9uLFxuXG4gIC8qKlxuICAgKiBUaW1lIHNwZW50IGdlbmVyYXRpbmcgdGhlIHRleHQgb2YgVHlwZSBDaGVjayBCbG9ja3MgaW4gb3JkZXIgdG8gcGVyZm9ybSB0ZW1wbGF0ZSB0eXBlIGNoZWNraW5nLlxuICAgKi9cbiAgVGNiR2VuZXJhdGlvbixcblxuICAvKipcbiAgICogVGltZSBzcGVudCB1cGRhdGluZyB0aGUgYHRzLlByb2dyYW1gIHdpdGggbmV3IFR5cGUgQ2hlY2sgQmxvY2sgY29kZS5cbiAgICovXG4gIFRjYlVwZGF0ZVByb2dyYW0sXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnkgVHlwZVNjcmlwdCBwZXJmb3JtaW5nIGl0cyBlbWl0IG9wZXJhdGlvbnMsIGluY2x1ZGluZyBkb3dubGV2ZWxpbmcgYW5kIHdyaXRpbmdcbiAgICogb3V0cHV0IGZpbGVzLlxuICAgKi9cbiAgVHlwZVNjcmlwdEVtaXQsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnkgQW5ndWxhciBwZXJmb3JtaW5nIGNvZGUgdHJhbnNmb3JtYXRpb25zIG9mIEFTVHMgYXMgdGhleSdyZSBhYm91dCB0byBiZSBlbWl0dGVkLlxuICAgKlxuICAgKiBUaGlzIGluY2x1ZGVzIHRoZSBhY3R1YWwgY29kZSBnZW5lcmF0aW9uIHN0ZXAgZm9yIHRlbXBsYXRlcywgYW5kIG9jY3VycyBkdXJpbmcgdGhlIGVtaXQgcGhhc2VcbiAgICogKGJ1dCBpcyB0cmFja2VkIHNlcGFyYXRlbHkgZnJvbSBgVHlwZVNjcmlwdEVtaXRgIHRpbWUpLlxuICAgKi9cbiAgQ29tcGlsZSxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBwZXJmb3JtaW5nIGEgYFRlbXBsYXRlVHlwZUNoZWNrZXJgIGF1dG9jb21wbGV0aW9uIG9wZXJhdGlvbi5cbiAgICovXG4gIFR0Y0F1dG9jb21wbGV0aW9uLFxuXG4gIC8qKlxuICAgKiBUaW1lIHNwZW50IGNvbXB1dGluZyB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIGRpYWdub3N0aWNzLlxuICAgKi9cbiAgVHRjRGlhZ25vc3RpY3MsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgZ2V0dGluZyBhIGBTeW1ib2xgIGZyb20gdGhlIGBUZW1wbGF0ZVR5cGVDaGVja2VyYC5cbiAgICovXG4gIFR0Y1N5bWJvbCxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBieSB0aGUgQW5ndWxhciBMYW5ndWFnZSBTZXJ2aWNlIGNhbGN1bGF0aW5nIGEgXCJnZXQgcmVmZXJlbmNlc1wiIG9yIGEgcmVuYW1pbmdcbiAgICogb3BlcmF0aW9uLlxuICAgKi9cbiAgTHNSZWZlcmVuY2VzQW5kUmVuYW1lcyxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBieSB0aGUgQW5ndWxhciBMYW5ndWFnZSBTZXJ2aWNlIGNhbGN1bGF0aW5nIGEgXCJxdWljayBpbmZvXCIgb3BlcmF0aW9uLlxuICAgKi9cbiAgTHNRdWlja0luZm8sXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnkgdGhlIEFuZ3VsYXIgTGFuZ3VhZ2UgU2VydmljZSBjYWxjdWxhdGluZyBhIFwiZ2V0IHR5cGUgZGVmaW5pdGlvblwiIG9yIFwiZ2V0XG4gICAqIGRlZmluaXRpb25cIiBvcGVyYXRpb24uXG4gICAqL1xuICBMc0RlZmluaXRpb24sXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnkgdGhlIEFuZ3VsYXIgTGFuZ3VhZ2UgU2VydmljZSBjYWxjdWxhdGluZyBhIFwiZ2V0IGNvbXBsZXRpb25zXCIgKEFLQSBhdXRvY29tcGxldGUpXG4gICAqIG9wZXJhdGlvbi5cbiAgICovXG4gIExzQ29tcGxldGlvbnMsXG5cbiAgLyoqXG4gICAqIFRpbWUgc3BlbnQgYnkgdGhlIEFuZ3VsYXIgTGFuZ3VhZ2UgU2VydmljZSBjYWxjdWxhdGluZyBhIFwidmlldyB0ZW1wbGF0ZSB0eXBlY2hlY2sgYmxvY2tcIlxuICAgKiBvcGVyYXRpb24uXG4gICAqL1xuICBMc1RjYixcblxuICAvKipcbiAgICogVGltZSBzcGVudCBieSB0aGUgQW5ndWxhciBMYW5ndWFnZSBTZXJ2aWNlIGNhbGN1bGF0aW5nIGRpYWdub3N0aWNzLlxuICAgKi9cbiAgTHNEaWFnbm9zdGljcyxcblxuICAvKipcbiAgICogVGltZSBzcGVudCBieSB0aGUgQW5ndWxhciBMYW5ndWFnZSBTZXJ2aWNlIGNhbGN1bGF0aW5nIGEgXCJnZXQgY29tcG9uZW50IGxvY2F0aW9ucyBmb3IgdGVtcGxhdGVcIlxuICAgKiBvcGVyYXRpb24uXG4gICAqL1xuICBMc0NvbXBvbmVudExvY2F0aW9ucyxcblxuICAvKipcbiAgICogVHJhY2tzIHRoZSBudW1iZXIgb2YgYFBlcmZQaGFzZWBzLCBhbmQgbXVzdCBhcHBlYXIgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdC5cbiAgICovXG4gIExBU1QsXG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBzb21lIG9jY3VycmVuY2UgZHVyaW5nIGNvbXBpbGF0aW9uLCBhbmQgaXMgdHJhY2tlZCB3aXRoIGEgY291bnRlci5cbiAqL1xuZXhwb3J0IGVudW0gUGVyZkV2ZW50IHtcbiAgLyoqXG4gICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIGAuZC50c2AgZmlsZXMgaW4gdGhlIHByb2dyYW0uXG4gICAqL1xuICBJbnB1dER0c0ZpbGUsXG5cbiAgLyoqXG4gICAqIENvdW50cyB0aGUgbnVtYmVyIG9mIG5vbi1gLmQudHNgIGZpbGVzIGluIHRoZSBwcm9ncmFtLlxuICAgKi9cbiAgSW5wdXRUc0ZpbGUsXG5cbiAgLyoqXG4gICAqIEFuIGBAQ29tcG9uZW50YCBjbGFzcyB3YXMgYW5hbHl6ZWQuXG4gICAqL1xuICBBbmFseXplQ29tcG9uZW50LFxuXG4gIC8qKlxuICAgKiBBbiBgQERpcmVjdGl2ZWAgY2xhc3Mgd2FzIGFuYWx5emVkLlxuICAgKi9cbiAgQW5hbHl6ZURpcmVjdGl2ZSxcblxuICAvKipcbiAgICogQW4gYEBJbmplY3RhYmxlYCBjbGFzcyB3YXMgYW5hbHl6ZWQuXG4gICAqL1xuICBBbmFseXplSW5qZWN0YWJsZSxcblxuICAvKipcbiAgICogQW4gYEBOZ01vZHVsZWAgY2xhc3Mgd2FzIGFuYWx5emVkLlxuICAgKi9cbiAgQW5hbHl6ZU5nTW9kdWxlLFxuXG4gIC8qKlxuICAgKiBBbiBgQFBpcGVgIGNsYXNzIHdhcyBhbmFseXplZC5cbiAgICovXG4gIEFuYWx5emVQaXBlLFxuXG4gIC8qKlxuICAgKiBBIHRyYWl0IHdhcyBhbmFseXplZC5cbiAgICpcbiAgICogSW4gdGhlb3J5LCB0aGlzIHNob3VsZCBiZSB0aGUgc3VtIG9mIHRoZSBgQW5hbHl6ZWAgY291bnRlcnMgZm9yIGVhY2ggZGVjb3JhdG9yIHR5cGUuXG4gICAqL1xuICBUcmFpdEFuYWx5emUsXG5cbiAgLyoqXG4gICAqIEEgdHJhaXQgaGFkIGEgcHJpb3IgYW5hbHlzaXMgYXZhaWxhYmxlIGZyb20gYW4gaW5jcmVtZW50YWwgcHJvZ3JhbSwgYW5kIGRpZCBub3QgbmVlZCB0byBiZVxuICAgKiByZS1hbmFseXplZC5cbiAgICovXG4gIFRyYWl0UmV1c2VBbmFseXNpcyxcblxuICAvKipcbiAgICogQSBgdHMuU291cmNlRmlsZWAgZGlyZWN0bHkgY2hhbmdlZCBiZXR3ZWVuIHRoZSBwcmlvciBwcm9ncmFtIGFuZCBhIG5ldyBpbmNyZW1lbnRhbCBjb21waWxhdGlvbi5cbiAgICovXG4gIFNvdXJjZUZpbGVQaHlzaWNhbENoYW5nZSxcblxuICAvKipcbiAgICogQSBgdHMuU291cmNlRmlsZWAgZGlkIG5vdCBwaHlzaWNhbGx5IGNoYW5nZWQsIGJ1dCBhY2NvcmRpbmcgdG8gdGhlIGZpbGUgZGVwZW5kZW5jeSBncmFwaCwgaGFzXG4gICAqIGxvZ2ljYWxseSBjaGFuZ2VkIGJldHdlZW4gdGhlIHByaW9yIHByb2dyYW0gYW5kIGEgbmV3IGluY3JlbWVudGFsIGNvbXBpbGF0aW9uLlxuICAgKi9cbiAgU291cmNlRmlsZUxvZ2ljYWxDaGFuZ2UsXG5cbiAgLyoqXG4gICAqIEEgYHRzLlNvdXJjZUZpbGVgIGhhcyBub3QgbG9naWNhbGx5IGNoYW5nZWQgYW5kIGFsbCBvZiBpdHMgYW5hbHlzaXMgcmVzdWx0cyB3ZXJlIHRodXMgYXZhaWxhYmxlXG4gICAqIGZvciByZXVzZS5cbiAgICovXG4gIFNvdXJjZUZpbGVSZXVzZUFuYWx5c2lzLFxuXG4gIC8qKlxuICAgKiBBIFR5cGUgQ2hlY2sgQmxvY2sgKFRDQikgd2FzIGdlbmVyYXRlZC5cbiAgICovXG4gIEdlbmVyYXRlVGNiLFxuXG4gIC8qKlxuICAgKiBBIFR5cGUgQ2hlY2sgQmxvY2sgKFRDQikgY291bGQgbm90IGJlIGdlbmVyYXRlZCBiZWNhdXNlIGlubGluaW5nIHdhcyBkaXNhYmxlZCwgYW5kIHRoZSBibG9ja1xuICAgKiB3b3VsZCd2ZSByZXF1aXJlZCBpbmxpbmluZy5cbiAgICovXG4gIFNraXBHZW5lcmF0ZVRjYk5vSW5saW5lLFxuXG4gIC8qKlxuICAgKiBBIGAubmd0eXBlY2hlY2sudHNgIGZpbGUgY291bGQgYmUgcmV1c2VkIGZyb20gdGhlIHByZXZpb3VzIHByb2dyYW0gYW5kIGRpZCBub3QgbmVlZCB0byBiZVxuICAgKiByZWdlbmVyYXRlZC5cbiAgICovXG4gIFJldXNlVHlwZUNoZWNrRmlsZSxcblxuICAvKipcbiAgICogVGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgcHJvZ3JhbSByZXF1aXJlZCBjaGFuZ2VzIGFuZCBoYWQgdG8gYmUgdXBkYXRlZCBpbiBhbiBpbmNyZW1lbnRhbFxuICAgKiBzdGVwLlxuICAgKi9cbiAgVXBkYXRlVHlwZUNoZWNrUHJvZ3JhbSxcblxuICAvKipcbiAgICogVGhlIGNvbXBpbGVyIHdhcyBhYmxlIHRvIHByb3ZlIHRoYXQgYSBgdHMuU291cmNlRmlsZWAgZGlkIG5vdCBuZWVkIHRvIGJlIHJlLWVtaXR0ZWQuXG4gICAqL1xuICBFbWl0U2tpcFNvdXJjZUZpbGUsXG5cbiAgLyoqXG4gICAqIEEgYHRzLlNvdXJjZUZpbGVgIHdhcyBlbWl0dGVkLlxuICAgKi9cbiAgRW1pdFNvdXJjZUZpbGUsXG5cbiAgLyoqXG4gICAqIFRyYWNrcyB0aGUgbnVtYmVyIG9mIGBQcmVmRXZlbnRgcywgYW5kIG11c3QgYXBwZWFyIGF0IHRoZSBlbmQgb2YgdGhlIGxpc3QuXG4gICAqL1xuICBMQVNULFxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBjaGVja3BvaW50IGR1cmluZyBjb21waWxhdGlvbiBhdCB3aGljaCB0aGUgbWVtb3J5IHVzYWdlIG9mIHRoZSBjb21waWxlciBzaG91bGQgYmVcbiAqIHJlY29yZGVkLlxuICovXG5leHBvcnQgZW51bSBQZXJmQ2hlY2twb2ludCB7XG4gIC8qKlxuICAgKiBUaGUgcG9pbnQgYXQgd2hpY2ggdGhlIGBQZXJmUmVjb3JkZXJgIHdhcyBjcmVhdGVkLCBhbmQgaWRlYWxseSB0cmFja3MgbWVtb3J5IHVzZWQgYmVmb3JlIGFueVxuICAgKiBjb21waWxhdGlvbiBzdHJ1Y3R1cmVzIGFyZSBjcmVhdGVkLlxuICAgKi9cbiAgSW5pdGlhbCxcblxuICAvKipcbiAgICogVGhlIHBvaW50IGp1c3QgYWZ0ZXIgdGhlIGB0cy5Qcm9ncmFtYCBoYXMgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgVHlwZVNjcmlwdFByb2dyYW1DcmVhdGUsXG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCBqdXN0IGJlZm9yZSBBbmd1bGFyIGFuYWx5c2lzIHN0YXJ0cy5cbiAgICpcbiAgICogSW4gdGhlIG1haW4gdXNhZ2UgcGF0dGVybiBmb3IgdGhlIGNvbXBpbGVyLCBUeXBlU2NyaXB0IGRpYWdub3N0aWNzIGhhdmUgYmVlbiBjYWxjdWxhdGVkIGF0IHRoaXNcbiAgICogcG9pbnQsIHNvIHRoZSBgdHMuVHlwZUNoZWNrZXJgIGhhcyBmdWxseSBpbmdlc3RlZCB0aGUgY3VycmVudCBwcm9ncmFtLCBhbGwgYHRzLlR5cGVgIHN0cnVjdHVyZXNcbiAgICogYW5kIGB0cy5TeW1ib2xgcyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIFByZUFuYWx5c2lzLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQganVzdCBhZnRlciBBbmd1bGFyIGFuYWx5c2lzIGNvbXBsZXRlcy5cbiAgICovXG4gIEFuYWx5c2lzLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQganVzdCBhZnRlciBBbmd1bGFyIHJlc29sdXRpb24gaXMgY29tcGxldGUuXG4gICAqL1xuICBSZXNvbHZlLFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQganVzdCBhZnRlciBUeXBlIENoZWNrIEJsb2NrcyAoVENCcykgaGF2ZSBiZWVuIGdlbmVyYXRlZC5cbiAgICovXG4gIFR0Y0dlbmVyYXRpb24sXG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCBqdXN0IGFmdGVyIHRoZSB0ZW1wbGF0ZSB0eXBlLWNoZWNraW5nIHByb2dyYW0gaGFzIGJlZW4gdXBkYXRlZCB3aXRoIGFueSBuZXcgVENCcy5cbiAgICovXG4gIFR0Y1VwZGF0ZVByb2dyYW0sXG5cbiAgLyoqXG4gICAqIFRoZSBwb2ludCBqdXN0IGJlZm9yZSBlbWl0IGJlZ2lucy5cbiAgICpcbiAgICogSW4gdGhlIG1haW4gdXNhZ2UgcGF0dGVybiBmb3IgdGhlIGNvbXBpbGVyLCBhbGwgdGVtcGxhdGUgdHlwZS1jaGVja2luZyBkaWFnbm9zdGljcyBoYXZlIGJlZW5cbiAgICogcmVxdWVzdGVkIGF0IHRoaXMgcG9pbnQuXG4gICAqL1xuICBQcmVFbWl0LFxuXG4gIC8qKlxuICAgKiBUaGUgcG9pbnQganVzdCBhZnRlciB0aGUgcHJvZ3JhbSBoYXMgYmVlbiBmdWxseSBlbWl0dGVkLlxuICAgKi9cbiAgRW1pdCxcblxuICAvKipcbiAgICogVHJhY2tzIHRoZSBudW1iZXIgb2YgYFBlcmZDaGVja3BvaW50YHMsIGFuZCBtdXN0IGFwcGVhciBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0LlxuICAgKi9cbiAgTEFTVCxcbn1cblxuLyoqXG4gKiBSZWNvcmRzIHRpbWluZywgbWVtb3J5LCBvciBjb3VudHMgYXQgc3BlY2lmaWMgcG9pbnRzIGluIHRoZSBjb21waWxlcidzIG9wZXJhdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQZXJmUmVjb3JkZXIge1xuICAvKipcbiAgICogU2V0IHRoZSBjdXJyZW50IHBoYXNlIG9mIGNvbXBpbGF0aW9uLlxuICAgKlxuICAgKiBUaW1lIHNwZW50IGluIHRoZSBwcmV2aW91cyBwaGFzZSB3aWxsIGJlIGFjY291bnRlZCB0byB0aGF0IHBoYXNlLiBUaGUgY2FsbGVyIGlzIHJlc3BvbnNpYmxlIGZvclxuICAgKiBleGl0aW5nIHRoZSBwaGFzZSB3aGVuIHdvcmsgdGhhdCBzaG91bGQgYmUgdHJhY2tlZCB3aXRoaW4gaXQgaXMgY29tcGxldGVkLCBhbmQgZWl0aGVyIHJldHVybmluZ1xuICAgKiB0byB0aGUgcHJldmlvdXMgcGhhc2Ugb3IgdHJhbnNpdGlvbmluZyB0byB0aGUgbmV4dCBvbmUgZGlyZWN0bHkuXG4gICAqXG4gICAqIEluIGdlbmVyYWwsIHByZWZlciB1c2luZyBgaW5QaGFzZSgpYCB0byBpbnN0cnVtZW50IGEgc2VjdGlvbiBvZiBjb2RlLCBhcyBpdCBhdXRvbWF0aWNhbGx5XG4gICAqIGhhbmRsZXMgZW50ZXJpbmcgYW5kIGV4aXRpbmcgdGhlIHBoYXNlLiBgcGhhc2UoKWAgc2hvdWxkIG9ubHkgYmUgdXNlZCB3aGVuIHRoZSBmb3JtZXIgQVBJXG4gICAqIGNhbm5vdCBiZSBjbGVhbmx5IGFwcGxpZWQgdG8gYSBwYXJ0aWN1bGFyIG9wZXJhdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgdGhlIHByZXZpb3VzIHBoYXNlXG4gICAqL1xuICBwaGFzZShwaGFzZTogUGVyZlBoYXNlKTogUGVyZlBoYXNlO1xuXG4gIC8qKlxuICAgKiBSdW4gYGZuYCBpbiB0aGUgZ2l2ZW4gYFBlcmZQaGFzZWAgYW5kIHJldHVybiB0aGUgcmVzdWx0LlxuICAgKlxuICAgKiBFbnRlcnMgYHBoYXNlYCBiZWZvcmUgZXhlY3V0aW5nIHRoZSBnaXZlbiBgZm5gLCB0aGVuIGV4aXRzIHRoZSBwaGFzZSBhbmQgcmV0dXJucyB0aGUgcmVzdWx0LlxuICAgKiBQcmVmZXIgdGhpcyBBUEkgdG8gYHBoYXNlKClgIHdoZXJlIHBvc3NpYmxlLlxuICAgKi9cbiAgaW5QaGFzZTxUPihwaGFzZTogUGVyZlBoYXNlLCBmbjogKCkgPT4gVCk6IFQ7XG5cbiAgLyoqXG4gICAqIFJlY29yZCB0aGUgbWVtb3J5IHVzYWdlIG9mIHRoZSBjb21waWxlciBhdCB0aGUgZ2l2ZW4gY2hlY2twb2ludC5cbiAgICovXG4gIG1lbW9yeShhZnRlcjogUGVyZkNoZWNrcG9pbnQpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWNvcmQgdGhhdCBhIHNwZWNpZmljIGV2ZW50IGhhcyBvY2N1cnJlZCwgcG9zc2libHkgbW9yZSB0aGFuIG9uY2UuXG4gICAqL1xuICBldmVudENvdW50KGV2ZW50OiBQZXJmRXZlbnQsIGluY3JlbWVudEJ5PzogbnVtYmVyKTogdm9pZDtcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBgUGVyZlJlY29yZGVyYCB0byBhbiBlbXB0eSBzdGF0ZSAoY2xlYXIgYWxsIHRyYWNrZWQgc3RhdGlzdGljcykgYW5kIHJlc2V0IHRoZSB6ZXJvXG4gICAqIHBvaW50IHRvIHRoZSBjdXJyZW50IHRpbWUuXG4gICAqL1xuICByZXNldCgpOiB2b2lkO1xufVxuIl19