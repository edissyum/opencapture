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
        define("@angular/compiler-cli/src/ngtsc/incremental/src/state", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/incremental/semantic_graph", "@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IncrementalDriver = void 0;
    var tslib_1 = require("tslib");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var semantic_graph_1 = require("@angular/compiler-cli/src/ngtsc/incremental/semantic_graph");
    var dependency_tracking_1 = require("@angular/compiler-cli/src/ngtsc/incremental/src/dependency_tracking");
    /**
     * Drives an incremental build, by tracking changes and determining which files need to be emitted.
     */
    var IncrementalDriver = /** @class */ (function () {
        function IncrementalDriver(state, depGraph, logicalChanges) {
            this.depGraph = depGraph;
            this.logicalChanges = logicalChanges;
            this.state = state;
        }
        /**
         * Construct an `IncrementalDriver` with a starting state that incorporates the results of a
         * previous build.
         *
         * The previous build's `BuildState` is reconciled with the new program's changes, and the results
         * are merged into the new build's `PendingBuildState`.
         */
        IncrementalDriver.reconcile = function (oldProgram, oldDriver, newProgram, modifiedResourceFiles, perf) {
            return perf.inPhase(perf_1.PerfPhase.Reconciliation, function () {
                var e_1, _a, e_2, _b, e_3, _c, e_4, _d, e_5, _e;
                // Initialize the state of the current build based on the previous one.
                var state;
                if (oldDriver.state.kind === BuildStateKind.Pending) {
                    // The previous build never made it past the pending state. Reuse it as the starting state
                    // for this build.
                    state = oldDriver.state;
                }
                else {
                    var priorGraph = null;
                    if (oldDriver.state.lastGood !== null) {
                        priorGraph = oldDriver.state.lastGood.semanticDepGraph;
                    }
                    // The previous build was successfully analyzed. `pendingEmit` is the only state carried
                    // forward into this build.
                    state = {
                        kind: BuildStateKind.Pending,
                        pendingEmit: oldDriver.state.pendingEmit,
                        pendingTypeCheckEmit: oldDriver.state.pendingTypeCheckEmit,
                        changedResourcePaths: new Set(),
                        changedTsPaths: new Set(),
                        lastGood: oldDriver.state.lastGood,
                        semanticDepGraphUpdater: new semantic_graph_1.SemanticDepGraphUpdater(priorGraph),
                    };
                }
                // Merge the freshly modified resource files with any prior ones.
                if (modifiedResourceFiles !== null) {
                    try {
                        for (var modifiedResourceFiles_1 = tslib_1.__values(modifiedResourceFiles), modifiedResourceFiles_1_1 = modifiedResourceFiles_1.next(); !modifiedResourceFiles_1_1.done; modifiedResourceFiles_1_1 = modifiedResourceFiles_1.next()) {
                            var resFile = modifiedResourceFiles_1_1.value;
                            state.changedResourcePaths.add(file_system_1.absoluteFrom(resFile));
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (modifiedResourceFiles_1_1 && !modifiedResourceFiles_1_1.done && (_a = modifiedResourceFiles_1.return)) _a.call(modifiedResourceFiles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                // Next, process the files in the new program, with a couple of goals:
                // 1) Determine which TS files have changed, if any, and merge them into `changedTsFiles`.
                // 2) Produce a list of TS files which no longer exist in the program (they've been deleted
                //    since the previous compilation). These need to be removed from the state tracking to
                //    avoid leaking memory.
                // All files in the old program, for easy detection of changes.
                var oldFiles = new Set(oldProgram.getSourceFiles().map(typescript_1.toUnredirectedSourceFile));
                // Assume all the old files were deleted to begin with. Only TS files are tracked.
                var deletedTsPaths = new Set(tsOnlyFiles(oldProgram).map(function (sf) { return sf.fileName; }));
                try {
                    for (var _f = tslib_1.__values(newProgram.getSourceFiles()), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var possiblyRedirectedNewFile = _g.value;
                        var newFile = typescript_1.toUnredirectedSourceFile(possiblyRedirectedNewFile);
                        if (!newFile.isDeclarationFile) {
                            // This file exists in the new program, so remove it from `deletedTsPaths`.
                            deletedTsPaths.delete(newFile.fileName);
                        }
                        if (oldFiles.has(newFile)) {
                            // This file hasn't changed; no need to look at it further.
                            continue;
                        }
                        // The file has changed since the last successful build. The appropriate reaction depends on
                        // what kind of file it is.
                        if (!newFile.isDeclarationFile) {
                            // It's a .ts file, so track it as a change.
                            state.changedTsPaths.add(newFile.fileName);
                        }
                        else {
                            // It's a .d.ts file. Currently the compiler does not do a great job of tracking
                            // dependencies on .d.ts files, so bail out of incremental builds here and do a full
                            // build. This usually only happens if something in node_modules changes.
                            return IncrementalDriver.fresh(newProgram);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                try {
                    // The next step is to remove any deleted files from the state.
                    for (var deletedTsPaths_1 = tslib_1.__values(deletedTsPaths), deletedTsPaths_1_1 = deletedTsPaths_1.next(); !deletedTsPaths_1_1.done; deletedTsPaths_1_1 = deletedTsPaths_1.next()) {
                        var filePath = deletedTsPaths_1_1.value;
                        state.pendingEmit.delete(filePath);
                        state.pendingTypeCheckEmit.delete(filePath);
                        // Even if the file doesn't exist in the current compilation, it still might have been
                        // changed in a previous one, so delete it from the set of changed TS files, just in case.
                        state.changedTsPaths.delete(filePath);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (deletedTsPaths_1_1 && !deletedTsPaths_1_1.done && (_c = deletedTsPaths_1.return)) _c.call(deletedTsPaths_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                perf.eventCount(perf_1.PerfEvent.SourceFilePhysicalChange, state.changedTsPaths.size);
                // Now, changedTsPaths contains physically changed TS paths. Use the previous program's
                // logical dependency graph to determine logically changed files.
                var depGraph = new dependency_tracking_1.FileDependencyGraph();
                // If a previous compilation exists, use its dependency graph to determine the set of
                // logically changed files.
                var logicalChanges = null;
                if (state.lastGood !== null) {
                    // Extract the set of logically changed files. At the same time, this operation populates
                    // the current (fresh) dependency graph with information about those files which have not
                    // logically changed.
                    logicalChanges = depGraph.updateWithPhysicalChanges(state.lastGood.depGraph, state.changedTsPaths, deletedTsPaths, state.changedResourcePaths);
                    perf.eventCount(perf_1.PerfEvent.SourceFileLogicalChange, logicalChanges.size);
                    try {
                        for (var _h = tslib_1.__values(state.changedTsPaths), _j = _h.next(); !_j.done; _j = _h.next()) {
                            var fileName = _j.value;
                            logicalChanges.add(fileName);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_j && !_j.done && (_d = _h.return)) _d.call(_h);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                    try {
                        // Any logically changed files need to be re-emitted. Most of the time this would happen
                        // regardless because the new dependency graph would _also_ identify the file as stale.
                        // However there are edge cases such as removing a component from an NgModule without adding
                        // it to another one, where the previous graph identifies the file as logically changed, but
                        // the new graph (which does not have that edge) fails to identify that the file should be
                        // re-emitted.
                        for (var logicalChanges_1 = tslib_1.__values(logicalChanges), logicalChanges_1_1 = logicalChanges_1.next(); !logicalChanges_1_1.done; logicalChanges_1_1 = logicalChanges_1.next()) {
                            var change = logicalChanges_1_1.value;
                            state.pendingEmit.add(change);
                            state.pendingTypeCheckEmit.add(change);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (logicalChanges_1_1 && !logicalChanges_1_1.done && (_e = logicalChanges_1.return)) _e.call(logicalChanges_1);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
                // `state` now reflects the initial pending state of the current compilation.
                return new IncrementalDriver(state, depGraph, logicalChanges);
            });
        };
        IncrementalDriver.fresh = function (program) {
            // Initialize the set of files which need to be emitted to the set of all TS files in the
            // program.
            var tsFiles = tsOnlyFiles(program);
            var state = {
                kind: BuildStateKind.Pending,
                pendingEmit: new Set(tsFiles.map(function (sf) { return sf.fileName; })),
                pendingTypeCheckEmit: new Set(tsFiles.map(function (sf) { return sf.fileName; })),
                changedResourcePaths: new Set(),
                changedTsPaths: new Set(),
                lastGood: null,
                semanticDepGraphUpdater: new semantic_graph_1.SemanticDepGraphUpdater(/* priorGraph */ null),
            };
            return new IncrementalDriver(state, new dependency_tracking_1.FileDependencyGraph(), /* logicalChanges */ null);
        };
        IncrementalDriver.prototype.getSemanticDepGraphUpdater = function () {
            if (this.state.kind !== BuildStateKind.Pending) {
                throw new Error('Semantic dependency updater is only available when pending analysis');
            }
            return this.state.semanticDepGraphUpdater;
        };
        IncrementalDriver.prototype.recordSuccessfulAnalysis = function (traitCompiler) {
            var e_6, _a, e_7, _b;
            if (this.state.kind !== BuildStateKind.Pending) {
                // Changes have already been incorporated.
                return;
            }
            var _c = this.state.semanticDepGraphUpdater.finalize(), needsEmit = _c.needsEmit, needsTypeCheckEmit = _c.needsTypeCheckEmit, newGraph = _c.newGraph;
            var pendingEmit = this.state.pendingEmit;
            try {
                for (var needsEmit_1 = tslib_1.__values(needsEmit), needsEmit_1_1 = needsEmit_1.next(); !needsEmit_1_1.done; needsEmit_1_1 = needsEmit_1.next()) {
                    var path = needsEmit_1_1.value;
                    pendingEmit.add(path);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (needsEmit_1_1 && !needsEmit_1_1.done && (_a = needsEmit_1.return)) _a.call(needsEmit_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var pendingTypeCheckEmit = this.state.pendingTypeCheckEmit;
            try {
                for (var needsTypeCheckEmit_1 = tslib_1.__values(needsTypeCheckEmit), needsTypeCheckEmit_1_1 = needsTypeCheckEmit_1.next(); !needsTypeCheckEmit_1_1.done; needsTypeCheckEmit_1_1 = needsTypeCheckEmit_1.next()) {
                    var path = needsTypeCheckEmit_1_1.value;
                    pendingTypeCheckEmit.add(path);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (needsTypeCheckEmit_1_1 && !needsTypeCheckEmit_1_1.done && (_b = needsTypeCheckEmit_1.return)) _b.call(needsTypeCheckEmit_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
            // Update the state to an `AnalyzedBuildState`.
            this.state = {
                kind: BuildStateKind.Analyzed,
                pendingEmit: pendingEmit,
                pendingTypeCheckEmit: pendingTypeCheckEmit,
                // Since this compilation was successfully analyzed, update the "last good" artifacts to the
                // ones from the current compilation.
                lastGood: {
                    depGraph: this.depGraph,
                    semanticDepGraph: newGraph,
                    traitCompiler: traitCompiler,
                    typeCheckingResults: null,
                },
                priorTypeCheckingResults: this.state.lastGood !== null ? this.state.lastGood.typeCheckingResults : null,
            };
        };
        IncrementalDriver.prototype.recordSuccessfulTypeCheck = function (results) {
            var e_8, _a;
            if (this.state.lastGood === null || this.state.kind !== BuildStateKind.Analyzed) {
                return;
            }
            this.state.lastGood.typeCheckingResults = results;
            try {
                // Delete the files for which type-check code was generated from the set of pending type-check
                // files.
                for (var _b = tslib_1.__values(results.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var fileName = _c.value;
                    this.state.pendingTypeCheckEmit.delete(fileName);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
        };
        IncrementalDriver.prototype.recordSuccessfulEmit = function (sf) {
            this.state.pendingEmit.delete(sf.fileName);
        };
        IncrementalDriver.prototype.safeToSkipEmit = function (sf) {
            return !this.state.pendingEmit.has(sf.fileName);
        };
        IncrementalDriver.prototype.priorWorkFor = function (sf) {
            if (this.state.lastGood === null || this.logicalChanges === null) {
                // There is no previous good build, so no prior work exists.
                return null;
            }
            else if (this.logicalChanges.has(sf.fileName)) {
                // Prior work might exist, but would be stale as the file in question has logically changed.
                return null;
            }
            else {
                // Prior work might exist, and if it does then it's usable!
                return this.state.lastGood.traitCompiler.recordsFor(sf);
            }
        };
        IncrementalDriver.prototype.priorTypeCheckingResultsFor = function (sf) {
            if (this.state.kind !== BuildStateKind.Analyzed ||
                this.state.priorTypeCheckingResults === null || this.logicalChanges === null) {
                return null;
            }
            if (this.logicalChanges.has(sf.fileName) || this.state.pendingTypeCheckEmit.has(sf.fileName)) {
                return null;
            }
            var fileName = file_system_1.absoluteFromSourceFile(sf);
            if (!this.state.priorTypeCheckingResults.has(fileName)) {
                return null;
            }
            var data = this.state.priorTypeCheckingResults.get(fileName);
            if (data.hasInlines) {
                return null;
            }
            return data;
        };
        return IncrementalDriver;
    }());
    exports.IncrementalDriver = IncrementalDriver;
    var BuildStateKind;
    (function (BuildStateKind) {
        BuildStateKind[BuildStateKind["Pending"] = 0] = "Pending";
        BuildStateKind[BuildStateKind["Analyzed"] = 1] = "Analyzed";
    })(BuildStateKind || (BuildStateKind = {}));
    function tsOnlyFiles(program) {
        return program.getSourceFiles().filter(function (sf) { return !sf.isDeclarationFile; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL2luY3JlbWVudGFsL3NyYy9zdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsMkVBQXVGO0lBQ3ZGLDZEQUE4RDtJQUk5RCxrRkFBbUU7SUFFbkUsNkZBQTRFO0lBRTVFLDJHQUEwRDtJQUUxRDs7T0FFRztJQUNIO1FBUUUsMkJBQ0ksS0FBd0IsRUFBVyxRQUE2QixFQUN4RCxjQUFnQztZQURMLGFBQVEsR0FBUixRQUFRLENBQXFCO1lBQ3hELG1CQUFjLEdBQWQsY0FBYyxDQUFrQjtZQUMxQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNyQixDQUFDO1FBRUQ7Ozs7OztXQU1HO1FBQ0ksMkJBQVMsR0FBaEIsVUFDSSxVQUFzQixFQUFFLFNBQTRCLEVBQUUsVUFBc0IsRUFDNUUscUJBQXVDLEVBQUUsSUFBa0I7WUFDN0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFTLENBQUMsY0FBYyxFQUFFOztnQkFDNUMsdUVBQXVFO2dCQUN2RSxJQUFJLEtBQXdCLENBQUM7Z0JBQzdCLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssY0FBYyxDQUFDLE9BQU8sRUFBRTtvQkFDbkQsMEZBQTBGO29CQUMxRixrQkFBa0I7b0JBQ2xCLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO2lCQUN6QjtxQkFBTTtvQkFDTCxJQUFJLFVBQVUsR0FBMEIsSUFBSSxDQUFDO29CQUM3QyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTt3QkFDckMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDO3FCQUN4RDtvQkFFRCx3RkFBd0Y7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cVFDO0lBclFZLDhDQUFpQjtJQXlROUIsSUFBSyxjQUdKO0lBSEQsV0FBSyxjQUFjO1FBQ2pCLHlEQUFPLENBQUE7UUFDUCwyREFBUSxDQUFBO0lBQ1YsQ0FBQyxFQUhJLGNBQWMsS0FBZCxjQUFjLFFBR2xCO0lBdUhELFNBQVMsV0FBVyxDQUFDLE9BQW1CO1FBQ3RDLE9BQU8sT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFyQixDQUFxQixDQUFDLENBQUM7SUFDdEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHthYnNvbHV0ZUZyb20sIGFic29sdXRlRnJvbVNvdXJjZUZpbGUsIEFic29sdXRlRnNQYXRofSBmcm9tICcuLi8uLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge1BlcmZFdmVudCwgUGVyZlBoYXNlLCBQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9ufSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7Q2xhc3NSZWNvcmQsIFRyYWl0Q29tcGlsZXJ9IGZyb20gJy4uLy4uL3RyYW5zZm9ybSc7XG5pbXBvcnQge0ZpbGVUeXBlQ2hlY2tpbmdEYXRhfSBmcm9tICcuLi8uLi90eXBlY2hlY2svc3JjL2NoZWNrZXInO1xuaW1wb3J0IHt0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGV9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuaW1wb3J0IHtJbmNyZW1lbnRhbEJ1aWxkfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHtTZW1hbnRpY0RlcEdyYXBoLCBTZW1hbnRpY0RlcEdyYXBoVXBkYXRlcn0gZnJvbSAnLi4vc2VtYW50aWNfZ3JhcGgnO1xuXG5pbXBvcnQge0ZpbGVEZXBlbmRlbmN5R3JhcGh9IGZyb20gJy4vZGVwZW5kZW5jeV90cmFja2luZyc7XG5cbi8qKlxuICogRHJpdmVzIGFuIGluY3JlbWVudGFsIGJ1aWxkLCBieSB0cmFja2luZyBjaGFuZ2VzIGFuZCBkZXRlcm1pbmluZyB3aGljaCBmaWxlcyBuZWVkIHRvIGJlIGVtaXR0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmNyZW1lbnRhbERyaXZlciBpbXBsZW1lbnRzIEluY3JlbWVudGFsQnVpbGQ8Q2xhc3NSZWNvcmQsIEZpbGVUeXBlQ2hlY2tpbmdEYXRhPiB7XG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgY3VycmVudCBidWlsZC5cbiAgICpcbiAgICogVGhpcyB0cmFuc2l0aW9ucyBhcyB0aGUgY29tcGlsYXRpb24gcHJvZ3Jlc3Nlcy5cbiAgICovXG4gIHByaXZhdGUgc3RhdGU6IEJ1aWxkU3RhdGU7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgIHN0YXRlOiBQZW5kaW5nQnVpbGRTdGF0ZSwgcmVhZG9ubHkgZGVwR3JhcGg6IEZpbGVEZXBlbmRlbmN5R3JhcGgsXG4gICAgICBwcml2YXRlIGxvZ2ljYWxDaGFuZ2VzOiBTZXQ8c3RyaW5nPnxudWxsKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhbiBgSW5jcmVtZW50YWxEcml2ZXJgIHdpdGggYSBzdGFydGluZyBzdGF0ZSB0aGF0IGluY29ycG9yYXRlcyB0aGUgcmVzdWx0cyBvZiBhXG4gICAqIHByZXZpb3VzIGJ1aWxkLlxuICAgKlxuICAgKiBUaGUgcHJldmlvdXMgYnVpbGQncyBgQnVpbGRTdGF0ZWAgaXMgcmVjb25jaWxlZCB3aXRoIHRoZSBuZXcgcHJvZ3JhbSdzIGNoYW5nZXMsIGFuZCB0aGUgcmVzdWx0c1xuICAgKiBhcmUgbWVyZ2VkIGludG8gdGhlIG5ldyBidWlsZCdzIGBQZW5kaW5nQnVpbGRTdGF0ZWAuXG4gICAqL1xuICBzdGF0aWMgcmVjb25jaWxlKFxuICAgICAgb2xkUHJvZ3JhbTogdHMuUHJvZ3JhbSwgb2xkRHJpdmVyOiBJbmNyZW1lbnRhbERyaXZlciwgbmV3UHJvZ3JhbTogdHMuUHJvZ3JhbSxcbiAgICAgIG1vZGlmaWVkUmVzb3VyY2VGaWxlczogU2V0PHN0cmluZz58bnVsbCwgcGVyZjogUGVyZlJlY29yZGVyKTogSW5jcmVtZW50YWxEcml2ZXIge1xuICAgIHJldHVybiBwZXJmLmluUGhhc2UoUGVyZlBoYXNlLlJlY29uY2lsaWF0aW9uLCAoKSA9PiB7XG4gICAgICAvLyBJbml0aWFsaXplIHRoZSBzdGF0ZSBvZiB0aGUgY3VycmVudCBidWlsZCBiYXNlZCBvbiB0aGUgcHJldmlvdXMgb25lLlxuICAgICAgbGV0IHN0YXRlOiBQZW5kaW5nQnVpbGRTdGF0ZTtcbiAgICAgIGlmIChvbGREcml2ZXIuc3RhdGUua2luZCA9PT0gQnVpbGRTdGF0ZUtpbmQuUGVuZGluZykge1xuICAgICAgICAvLyBUaGUgcHJldmlvdXMgYnVpbGQgbmV2ZXIgbWFkZSBpdCBwYXN0IHRoZSBwZW5kaW5nIHN0YXRlLiBSZXVzZSBpdCBhcyB0aGUgc3RhcnRpbmcgc3RhdGVcbiAgICAgICAgLy8gZm9yIHRoaXMgYnVpbGQuXG4gICAgICAgIHN0YXRlID0gb2xkRHJpdmVyLnN0YXRlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByaW9yR3JhcGg6IFNlbWFudGljRGVwR3JhcGh8bnVsbCA9IG51bGw7XG4gICAgICAgIGlmIChvbGREcml2ZXIuc3RhdGUubGFzdEdvb2QgIT09IG51bGwpIHtcbiAgICAgICAgICBwcmlvckdyYXBoID0gb2xkRHJpdmVyLnN0YXRlLmxhc3RHb29kLnNlbWFudGljRGVwR3JhcGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcHJldmlvdXMgYnVpbGQgd2FzIHN1Y2Nlc3NmdWxseSBhbmFseXplZC4gYHBlbmRpbmdFbWl0YCBpcyB0aGUgb25seSBzdGF0ZSBjYXJyaWVkXG4gICAgICAgIC8vIGZvcndhcmQgaW50byB0aGlzIGJ1aWxkLlxuICAgICAgICBzdGF0ZSA9IHtcbiAgICAgICAgICBraW5kOiBCdWlsZFN0YXRlS2luZC5QZW5kaW5nLFxuICAgICAgICAgIHBlbmRpbmdFbWl0OiBvbGREcml2ZXIuc3RhdGUucGVuZGluZ0VtaXQsXG4gICAgICAgICAgcGVuZGluZ1R5cGVDaGVja0VtaXQ6IG9sZERyaXZlci5zdGF0ZS5wZW5kaW5nVHlwZUNoZWNrRW1pdCxcbiAgICAgICAgICBjaGFuZ2VkUmVzb3VyY2VQYXRoczogbmV3IFNldDxBYnNvbHV0ZUZzUGF0aD4oKSxcbiAgICAgICAgICBjaGFuZ2VkVHNQYXRoczogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICAgICAgbGFzdEdvb2Q6IG9sZERyaXZlci5zdGF0ZS5sYXN0R29vZCxcbiAgICAgICAgICBzZW1hbnRpY0RlcEdyYXBoVXBkYXRlcjogbmV3IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyKHByaW9yR3JhcGgpLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBNZXJnZSB0aGUgZnJlc2hseSBtb2RpZmllZCByZXNvdXJjZSBmaWxlcyB3aXRoIGFueSBwcmlvciBvbmVzLlxuICAgICAgaWYgKG1vZGlmaWVkUmVzb3VyY2VGaWxlcyAhPT0gbnVsbCkge1xuICAgICAgICBmb3IgKGNvbnN0IHJlc0ZpbGUgb2YgbW9kaWZpZWRSZXNvdXJjZUZpbGVzKSB7XG4gICAgICAgICAgc3RhdGUuY2hhbmdlZFJlc291cmNlUGF0aHMuYWRkKGFic29sdXRlRnJvbShyZXNGaWxlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTmV4dCwgcHJvY2VzcyB0aGUgZmlsZXMgaW4gdGhlIG5ldyBwcm9ncmFtLCB3aXRoIGEgY291cGxlIG9mIGdvYWxzOlxuICAgICAgLy8gMSkgRGV0ZXJtaW5lIHdoaWNoIFRTIGZpbGVzIGhhdmUgY2hhbmdlZCwgaWYgYW55LCBhbmQgbWVyZ2UgdGhlbSBpbnRvIGBjaGFuZ2VkVHNGaWxlc2AuXG4gICAgICAvLyAyKSBQcm9kdWNlIGEgbGlzdCBvZiBUUyBmaWxlcyB3aGljaCBubyBsb25nZXIgZXhpc3QgaW4gdGhlIHByb2dyYW0gKHRoZXkndmUgYmVlbiBkZWxldGVkXG4gICAgICAvLyAgICBzaW5jZSB0aGUgcHJldmlvdXMgY29tcGlsYXRpb24pLiBUaGVzZSBuZWVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgc3RhdGUgdHJhY2tpbmcgdG9cbiAgICAgIC8vICAgIGF2b2lkIGxlYWtpbmcgbWVtb3J5LlxuXG4gICAgICAvLyBBbGwgZmlsZXMgaW4gdGhlIG9sZCBwcm9ncmFtLCBmb3IgZWFzeSBkZXRlY3Rpb24gb2YgY2hhbmdlcy5cbiAgICAgIGNvbnN0IG9sZEZpbGVzID1cbiAgICAgICAgICBuZXcgU2V0PHRzLlNvdXJjZUZpbGU+KG9sZFByb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5tYXAodG9VbnJlZGlyZWN0ZWRTb3VyY2VGaWxlKSk7XG5cbiAgICAgIC8vIEFzc3VtZSBhbGwgdGhlIG9sZCBmaWxlcyB3ZXJlIGRlbGV0ZWQgdG8gYmVnaW4gd2l0aC4gT25seSBUUyBmaWxlcyBhcmUgdHJhY2tlZC5cbiAgICAgIGNvbnN0IGRlbGV0ZWRUc1BhdGhzID0gbmV3IFNldDxzdHJpbmc+KHRzT25seUZpbGVzKG9sZFByb2dyYW0pLm1hcChzZiA9PiBzZi5maWxlTmFtZSkpO1xuXG4gICAgICBmb3IgKGNvbnN0IHBvc3NpYmx5UmVkaXJlY3RlZE5ld0ZpbGUgb2YgbmV3UHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpKSB7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSB0b1VucmVkaXJlY3RlZFNvdXJjZUZpbGUocG9zc2libHlSZWRpcmVjdGVkTmV3RmlsZSk7XG4gICAgICAgIGlmICghbmV3RmlsZS5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgICAgIC8vIFRoaXMgZmlsZSBleGlzdHMgaW4gdGhlIG5ldyBwcm9ncmFtLCBzbyByZW1vdmUgaXQgZnJvbSBgZGVsZXRlZFRzUGF0aHNgLlxuICAgICAgICAgIGRlbGV0ZWRUc1BhdGhzLmRlbGV0ZShuZXdGaWxlLmZpbGVOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvbGRGaWxlcy5oYXMobmV3RmlsZSkpIHtcbiAgICAgICAgICAvLyBUaGlzIGZpbGUgaGFzbid0IGNoYW5nZWQ7IG5vIG5lZWQgdG8gbG9vayBhdCBpdCBmdXJ0aGVyLlxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZpbGUgaGFzIGNoYW5nZWQgc2luY2UgdGhlIGxhc3Qgc3VjY2Vzc2Z1bCBidWlsZC4gVGhlIGFwcHJvcHJpYXRlIHJlYWN0aW9uIGRlcGVuZHMgb25cbiAgICAgICAgLy8gd2hhdCBraW5kIG9mIGZpbGUgaXQgaXMuXG4gICAgICAgIGlmICghbmV3RmlsZS5pc0RlY2xhcmF0aW9uRmlsZSkge1xuICAgICAgICAgIC8vIEl0J3MgYSAudHMgZmlsZSwgc28gdHJhY2sgaXQgYXMgYSBjaGFuZ2UuXG4gICAgICAgICAgc3RhdGUuY2hhbmdlZFRzUGF0aHMuYWRkKG5ld0ZpbGUuZmlsZU5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEl0J3MgYSAuZC50cyBmaWxlLiBDdXJyZW50bHkgdGhlIGNvbXBpbGVyIGRvZXMgbm90IGRvIGEgZ3JlYXQgam9iIG9mIHRyYWNraW5nXG4gICAgICAgICAgLy8gZGVwZW5kZW5jaWVzIG9uIC5kLnRzIGZpbGVzLCBzbyBiYWlsIG91dCBvZiBpbmNyZW1lbnRhbCBidWlsZHMgaGVyZSBhbmQgZG8gYSBmdWxsXG4gICAgICAgICAgLy8gYnVpbGQuIFRoaXMgdXN1YWxseSBvbmx5IGhhcHBlbnMgaWYgc29tZXRoaW5nIGluIG5vZGVfbW9kdWxlcyBjaGFuZ2VzLlxuICAgICAgICAgIHJldHVybiBJbmNyZW1lbnRhbERyaXZlci5mcmVzaChuZXdQcm9ncmFtKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgbmV4dCBzdGVwIGlzIHRvIHJlbW92ZSBhbnkgZGVsZXRlZCBmaWxlcyBmcm9tIHRoZSBzdGF0ZS5cbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZGVsZXRlZFRzUGF0aHMpIHtcbiAgICAgICAgc3RhdGUucGVuZGluZ0VtaXQuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICAgICAgc3RhdGUucGVuZGluZ1R5cGVDaGVja0VtaXQuZGVsZXRlKGZpbGVQYXRoKTtcblxuICAgICAgICAvLyBFdmVuIGlmIHRoZSBmaWxlIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIGN1cnJlbnQgY29tcGlsYXRpb24sIGl0IHN0aWxsIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyBjaGFuZ2VkIGluIGEgcHJldmlvdXMgb25lLCBzbyBkZWxldGUgaXQgZnJvbSB0aGUgc2V0IG9mIGNoYW5nZWQgVFMgZmlsZXMsIGp1c3QgaW4gY2FzZS5cbiAgICAgICAgc3RhdGUuY2hhbmdlZFRzUGF0aHMuZGVsZXRlKGZpbGVQYXRoKTtcbiAgICAgIH1cblxuICAgICAgcGVyZi5ldmVudENvdW50KFBlcmZFdmVudC5Tb3VyY2VGaWxlUGh5c2ljYWxDaGFuZ2UsIHN0YXRlLmNoYW5nZWRUc1BhdGhzLnNpemUpO1xuXG4gICAgICAvLyBOb3csIGNoYW5nZWRUc1BhdGhzIGNvbnRhaW5zIHBoeXNpY2FsbHkgY2hhbmdlZCBUUyBwYXRocy4gVXNlIHRoZSBwcmV2aW91cyBwcm9ncmFtJ3NcbiAgICAgIC8vIGxvZ2ljYWwgZGVwZW5kZW5jeSBncmFwaCB0byBkZXRlcm1pbmUgbG9naWNhbGx5IGNoYW5nZWQgZmlsZXMuXG4gICAgICBjb25zdCBkZXBHcmFwaCA9IG5ldyBGaWxlRGVwZW5kZW5jeUdyYXBoKCk7XG5cbiAgICAgIC8vIElmIGEgcHJldmlvdXMgY29tcGlsYXRpb24gZXhpc3RzLCB1c2UgaXRzIGRlcGVuZGVuY3kgZ3JhcGggdG8gZGV0ZXJtaW5lIHRoZSBzZXQgb2ZcbiAgICAgIC8vIGxvZ2ljYWxseSBjaGFuZ2VkIGZpbGVzLlxuICAgICAgbGV0IGxvZ2ljYWxDaGFuZ2VzOiBTZXQ8c3RyaW5nPnxudWxsID0gbnVsbDtcbiAgICAgIGlmIChzdGF0ZS5sYXN0R29vZCAhPT0gbnVsbCkge1xuICAgICAgICAvLyBFeHRyYWN0IHRoZSBzZXQgb2YgbG9naWNhbGx5IGNoYW5nZWQgZmlsZXMuIEF0IHRoZSBzYW1lIHRpbWUsIHRoaXMgb3BlcmF0aW9uIHBvcHVsYXRlc1xuICAgICAgICAvLyB0aGUgY3VycmVudCAoZnJlc2gpIGRlcGVuZGVuY3kgZ3JhcGggd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aG9zZSBmaWxlcyB3aGljaCBoYXZlIG5vdFxuICAgICAgICAvLyBsb2dpY2FsbHkgY2hhbmdlZC5cbiAgICAgICAgbG9naWNhbENoYW5nZXMgPSBkZXBHcmFwaC51cGRhdGVXaXRoUGh5c2ljYWxDaGFuZ2VzKFxuICAgICAgICAgICAgc3RhdGUubGFzdEdvb2QuZGVwR3JhcGgsIHN0YXRlLmNoYW5nZWRUc1BhdGhzLCBkZWxldGVkVHNQYXRocyxcbiAgICAgICAgICAgIHN0YXRlLmNoYW5nZWRSZXNvdXJjZVBhdGhzKTtcbiAgICAgICAgcGVyZi5ldmVudENvdW50KFBlcmZFdmVudC5Tb3VyY2VGaWxlTG9naWNhbENoYW5nZSwgbG9naWNhbENoYW5nZXMuc2l6ZSk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgb2Ygc3RhdGUuY2hhbmdlZFRzUGF0aHMpIHtcbiAgICAgICAgICBsb2dpY2FsQ2hhbmdlcy5hZGQoZmlsZU5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQW55IGxvZ2ljYWxseSBjaGFuZ2VkIGZpbGVzIG5lZWQgdG8gYmUgcmUtZW1pdHRlZC4gTW9zdCBvZiB0aGUgdGltZSB0aGlzIHdvdWxkIGhhcHBlblxuICAgICAgICAvLyByZWdhcmRsZXNzIGJlY2F1c2UgdGhlIG5ldyBkZXBlbmRlbmN5IGdyYXBoIHdvdWxkIF9hbHNvXyBpZGVudGlmeSB0aGUgZmlsZSBhcyBzdGFsZS5cbiAgICAgICAgLy8gSG93ZXZlciB0aGVyZSBhcmUgZWRnZSBjYXNlcyBzdWNoIGFzIHJlbW92aW5nIGEgY29tcG9uZW50IGZyb20gYW4gTmdNb2R1bGUgd2l0aG91dCBhZGRpbmdcbiAgICAgICAgLy8gaXQgdG8gYW5vdGhlciBvbmUsIHdoZXJlIHRoZSBwcmV2aW91cyBncmFwaCBpZGVudGlmaWVzIHRoZSBmaWxlIGFzIGxvZ2ljYWxseSBjaGFuZ2VkLCBidXRcbiAgICAgICAgLy8gdGhlIG5ldyBncmFwaCAod2hpY2ggZG9lcyBub3QgaGF2ZSB0aGF0IGVkZ2UpIGZhaWxzIHRvIGlkZW50aWZ5IHRoYXQgdGhlIGZpbGUgc2hvdWxkIGJlXG4gICAgICAgIC8vIHJlLWVtaXR0ZWQuXG4gICAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGxvZ2ljYWxDaGFuZ2VzKSB7XG4gICAgICAgICAgc3RhdGUucGVuZGluZ0VtaXQuYWRkKGNoYW5nZSk7XG4gICAgICAgICAgc3RhdGUucGVuZGluZ1R5cGVDaGVja0VtaXQuYWRkKGNoYW5nZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gYHN0YXRlYCBub3cgcmVmbGVjdHMgdGhlIGluaXRpYWwgcGVuZGluZyBzdGF0ZSBvZiB0aGUgY3VycmVudCBjb21waWxhdGlvbi5cbiAgICAgIHJldHVybiBuZXcgSW5jcmVtZW50YWxEcml2ZXIoc3RhdGUsIGRlcEdyYXBoLCBsb2dpY2FsQ2hhbmdlcyk7XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgZnJlc2gocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IEluY3JlbWVudGFsRHJpdmVyIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBzZXQgb2YgZmlsZXMgd2hpY2ggbmVlZCB0byBiZSBlbWl0dGVkIHRvIHRoZSBzZXQgb2YgYWxsIFRTIGZpbGVzIGluIHRoZVxuICAgIC8vIHByb2dyYW0uXG4gICAgY29uc3QgdHNGaWxlcyA9IHRzT25seUZpbGVzKHByb2dyYW0pO1xuXG4gICAgY29uc3Qgc3RhdGU6IFBlbmRpbmdCdWlsZFN0YXRlID0ge1xuICAgICAga2luZDogQnVpbGRTdGF0ZUtpbmQuUGVuZGluZyxcbiAgICAgIHBlbmRpbmdFbWl0OiBuZXcgU2V0PHN0cmluZz4odHNGaWxlcy5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpKSxcbiAgICAgIHBlbmRpbmdUeXBlQ2hlY2tFbWl0OiBuZXcgU2V0PHN0cmluZz4odHNGaWxlcy5tYXAoc2YgPT4gc2YuZmlsZU5hbWUpKSxcbiAgICAgIGNoYW5nZWRSZXNvdXJjZVBhdGhzOiBuZXcgU2V0PEFic29sdXRlRnNQYXRoPigpLFxuICAgICAgY2hhbmdlZFRzUGF0aHM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgICAgbGFzdEdvb2Q6IG51bGwsXG4gICAgICBzZW1hbnRpY0RlcEdyYXBoVXBkYXRlcjogbmV3IFNlbWFudGljRGVwR3JhcGhVcGRhdGVyKC8qIHByaW9yR3JhcGggKi8gbnVsbCksXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgSW5jcmVtZW50YWxEcml2ZXIoc3RhdGUsIG5ldyBGaWxlRGVwZW5kZW5jeUdyYXBoKCksIC8qIGxvZ2ljYWxDaGFuZ2VzICovIG51bGwpO1xuICB9XG5cbiAgZ2V0U2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIoKTogU2VtYW50aWNEZXBHcmFwaFVwZGF0ZXIge1xuICAgIGlmICh0aGlzLnN0YXRlLmtpbmQgIT09IEJ1aWxkU3RhdGVLaW5kLlBlbmRpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignU2VtYW50aWMgZGVwZW5kZW5jeSB1cGRhdGVyIGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4gcGVuZGluZyBhbmFseXNpcycpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZW1hbnRpY0RlcEdyYXBoVXBkYXRlcjtcbiAgfVxuXG4gIHJlY29yZFN1Y2Nlc3NmdWxBbmFseXNpcyh0cmFpdENvbXBpbGVyOiBUcmFpdENvbXBpbGVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUua2luZCAhPT0gQnVpbGRTdGF0ZUtpbmQuUGVuZGluZykge1xuICAgICAgLy8gQ2hhbmdlcyBoYXZlIGFscmVhZHkgYmVlbiBpbmNvcnBvcmF0ZWQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge25lZWRzRW1pdCwgbmVlZHNUeXBlQ2hlY2tFbWl0LCBuZXdHcmFwaH0gPSB0aGlzLnN0YXRlLnNlbWFudGljRGVwR3JhcGhVcGRhdGVyLmZpbmFsaXplKCk7XG5cbiAgICBjb25zdCBwZW5kaW5nRW1pdCA9IHRoaXMuc3RhdGUucGVuZGluZ0VtaXQ7XG4gICAgZm9yIChjb25zdCBwYXRoIG9mIG5lZWRzRW1pdCkge1xuICAgICAgcGVuZGluZ0VtaXQuYWRkKHBhdGgpO1xuICAgIH1cblxuICAgIGNvbnN0IHBlbmRpbmdUeXBlQ2hlY2tFbWl0ID0gdGhpcy5zdGF0ZS5wZW5kaW5nVHlwZUNoZWNrRW1pdDtcbiAgICBmb3IgKGNvbnN0IHBhdGggb2YgbmVlZHNUeXBlQ2hlY2tFbWl0KSB7XG4gICAgICBwZW5kaW5nVHlwZUNoZWNrRW1pdC5hZGQocGF0aCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSBzdGF0ZSB0byBhbiBgQW5hbHl6ZWRCdWlsZFN0YXRlYC5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAga2luZDogQnVpbGRTdGF0ZUtpbmQuQW5hbHl6ZWQsXG4gICAgICBwZW5kaW5nRW1pdCxcbiAgICAgIHBlbmRpbmdUeXBlQ2hlY2tFbWl0LFxuXG4gICAgICAvLyBTaW5jZSB0aGlzIGNvbXBpbGF0aW9uIHdhcyBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQsIHVwZGF0ZSB0aGUgXCJsYXN0IGdvb2RcIiBhcnRpZmFjdHMgdG8gdGhlXG4gICAgICAvLyBvbmVzIGZyb20gdGhlIGN1cnJlbnQgY29tcGlsYXRpb24uXG4gICAgICBsYXN0R29vZDoge1xuICAgICAgICBkZXBHcmFwaDogdGhpcy5kZXBHcmFwaCxcbiAgICAgICAgc2VtYW50aWNEZXBHcmFwaDogbmV3R3JhcGgsXG4gICAgICAgIHRyYWl0Q29tcGlsZXI6IHRyYWl0Q29tcGlsZXIsXG4gICAgICAgIHR5cGVDaGVja2luZ1Jlc3VsdHM6IG51bGwsXG4gICAgICB9LFxuXG4gICAgICBwcmlvclR5cGVDaGVja2luZ1Jlc3VsdHM6XG4gICAgICAgICAgdGhpcy5zdGF0ZS5sYXN0R29vZCAhPT0gbnVsbCA/IHRoaXMuc3RhdGUubGFzdEdvb2QudHlwZUNoZWNraW5nUmVzdWx0cyA6IG51bGwsXG4gICAgfTtcbiAgfVxuXG4gIHJlY29yZFN1Y2Nlc3NmdWxUeXBlQ2hlY2socmVzdWx0czogTWFwPEFic29sdXRlRnNQYXRoLCBGaWxlVHlwZUNoZWNraW5nRGF0YT4pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5sYXN0R29vZCA9PT0gbnVsbCB8fCB0aGlzLnN0YXRlLmtpbmQgIT09IEJ1aWxkU3RhdGVLaW5kLkFuYWx5emVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuc3RhdGUubGFzdEdvb2QudHlwZUNoZWNraW5nUmVzdWx0cyA9IHJlc3VsdHM7XG5cbiAgICAvLyBEZWxldGUgdGhlIGZpbGVzIGZvciB3aGljaCB0eXBlLWNoZWNrIGNvZGUgd2FzIGdlbmVyYXRlZCBmcm9tIHRoZSBzZXQgb2YgcGVuZGluZyB0eXBlLWNoZWNrXG4gICAgLy8gZmlsZXMuXG4gICAgZm9yIChjb25zdCBmaWxlTmFtZSBvZiByZXN1bHRzLmtleXMoKSkge1xuICAgICAgdGhpcy5zdGF0ZS5wZW5kaW5nVHlwZUNoZWNrRW1pdC5kZWxldGUoZmlsZU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHJlY29yZFN1Y2Nlc3NmdWxFbWl0KHNmOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgdGhpcy5zdGF0ZS5wZW5kaW5nRW1pdC5kZWxldGUoc2YuZmlsZU5hbWUpO1xuICB9XG5cbiAgc2FmZVRvU2tpcEVtaXQoc2Y6IHRzLlNvdXJjZUZpbGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuc3RhdGUucGVuZGluZ0VtaXQuaGFzKHNmLmZpbGVOYW1lKTtcbiAgfVxuXG4gIHByaW9yV29ya0ZvcihzZjogdHMuU291cmNlRmlsZSk6IENsYXNzUmVjb3JkW118bnVsbCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubGFzdEdvb2QgPT09IG51bGwgfHwgdGhpcy5sb2dpY2FsQ2hhbmdlcyA9PT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gcHJldmlvdXMgZ29vZCBidWlsZCwgc28gbm8gcHJpb3Igd29yayBleGlzdHMuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKHRoaXMubG9naWNhbENoYW5nZXMuaGFzKHNmLmZpbGVOYW1lKSkge1xuICAgICAgLy8gUHJpb3Igd29yayBtaWdodCBleGlzdCwgYnV0IHdvdWxkIGJlIHN0YWxlIGFzIHRoZSBmaWxlIGluIHF1ZXN0aW9uIGhhcyBsb2dpY2FsbHkgY2hhbmdlZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQcmlvciB3b3JrIG1pZ2h0IGV4aXN0LCBhbmQgaWYgaXQgZG9lcyB0aGVuIGl0J3MgdXNhYmxlIVxuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubGFzdEdvb2QudHJhaXRDb21waWxlci5yZWNvcmRzRm9yKHNmKTtcbiAgICB9XG4gIH1cblxuICBwcmlvclR5cGVDaGVja2luZ1Jlc3VsdHNGb3Ioc2Y6IHRzLlNvdXJjZUZpbGUpOiBGaWxlVHlwZUNoZWNraW5nRGF0YXxudWxsIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5raW5kICE9PSBCdWlsZFN0YXRlS2luZC5BbmFseXplZCB8fFxuICAgICAgICB0aGlzLnN0YXRlLnByaW9yVHlwZUNoZWNraW5nUmVzdWx0cyA9PT0gbnVsbCB8fCB0aGlzLmxvZ2ljYWxDaGFuZ2VzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5sb2dpY2FsQ2hhbmdlcy5oYXMoc2YuZmlsZU5hbWUpIHx8IHRoaXMuc3RhdGUucGVuZGluZ1R5cGVDaGVja0VtaXQuaGFzKHNmLmZpbGVOYW1lKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZU5hbWUgPSBhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKHNmKTtcbiAgICBpZiAoIXRoaXMuc3RhdGUucHJpb3JUeXBlQ2hlY2tpbmdSZXN1bHRzLmhhcyhmaWxlTmFtZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBkYXRhID0gdGhpcy5zdGF0ZS5wcmlvclR5cGVDaGVja2luZ1Jlc3VsdHMuZ2V0KGZpbGVOYW1lKSE7XG4gICAgaWYgKGRhdGEuaGFzSW5saW5lcykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbn1cblxudHlwZSBCdWlsZFN0YXRlID0gUGVuZGluZ0J1aWxkU3RhdGV8QW5hbHl6ZWRCdWlsZFN0YXRlO1xuXG5lbnVtIEJ1aWxkU3RhdGVLaW5kIHtcbiAgUGVuZGluZyxcbiAgQW5hbHl6ZWQsXG59XG5cbmludGVyZmFjZSBCYXNlQnVpbGRTdGF0ZSB7XG4gIGtpbmQ6IEJ1aWxkU3RhdGVLaW5kO1xuXG4gIC8qKlxuICAgKiBUaGUgaGVhcnQgb2YgaW5jcmVtZW50YWwgYnVpbGRzLiBUaGlzIGBTZXRgIHRyYWNrcyB0aGUgc2V0IG9mIGZpbGVzIHdoaWNoIG5lZWQgdG8gYmUgZW1pdHRlZFxuICAgKiBkdXJpbmcgdGhlIGN1cnJlbnQgY29tcGlsYXRpb24uXG4gICAqXG4gICAqIFRoaXMgc3RhcnRzIG91dCBhcyB0aGUgc2V0IG9mIGZpbGVzIHdoaWNoIGFyZSBzdGlsbCBwZW5kaW5nIGZyb20gdGhlIHByZXZpb3VzIHByb2dyYW0gKG9yIHRoZVxuICAgKiBmdWxsIHNldCBvZiAudHMgZmlsZXMgb24gYSBmcmVzaCBidWlsZCkuXG4gICAqXG4gICAqIEFmdGVyIGFuYWx5c2lzLCBpdCdzIHVwZGF0ZWQgdG8gaW5jbHVkZSBhbnkgZmlsZXMgd2hpY2ggbWlnaHQgaGF2ZSBjaGFuZ2VkIGFuZCBuZWVkIGEgcmUtZW1pdFxuICAgKiBhcyBhIHJlc3VsdCBvZiBpbmNyZW1lbnRhbCBjaGFuZ2VzLlxuICAgKlxuICAgKiBJZiBhbiBlbWl0IGhhcHBlbnMsIGFueSB3cml0dGVuIGZpbGVzIGFyZSByZW1vdmVkIGZyb20gdGhlIGBTZXRgLCBhcyB0aGV5J3JlIG5vIGxvbmdlclxuICAgKiBwZW5kaW5nLlxuICAgKlxuICAgKiBUaHVzLCBhZnRlciBjb21waWxhdGlvbiBgcGVuZGluZ0VtaXRgIHNob3VsZCBiZSBlbXB0eSAob24gYSBzdWNjZXNzZnVsIGJ1aWxkKSBvciBjb250YWluIHRoZVxuICAgKiBmaWxlcyB3aGljaCBzdGlsbCBuZWVkIHRvIGJlIGVtaXR0ZWQgYnV0IGhhdmUgbm90IHlldCBiZWVuIChkdWUgdG8gZXJyb3JzKS5cbiAgICpcbiAgICogYHBlbmRpbmdFbWl0YCBpcyB0cmFja2VkIGFzIGFzIGBTZXQ8c3RyaW5nPmAgaW5zdGVhZCBvZiBhIGBTZXQ8dHMuU291cmNlRmlsZT5gLCBiZWNhdXNlIHRoZVxuICAgKiBjb250ZW50cyBvZiB0aGUgZmlsZSBhcmUgbm90IGltcG9ydGFudCBoZXJlLCBvbmx5IHdoZXRoZXIgb3Igbm90IHRoZSBjdXJyZW50IHZlcnNpb24gb2YgaXRcbiAgICogbmVlZHMgdG8gYmUgZW1pdHRlZC4gVGhlIGBzdHJpbmdgcyBoZXJlIGFyZSBUUyBmaWxlIHBhdGhzLlxuICAgKlxuICAgKiBTZWUgdGhlIFJFQURNRS5tZCBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiB0aGlzIGFsZ29yaXRobS5cbiAgICovXG4gIHBlbmRpbmdFbWl0OiBTZXQ8c3RyaW5nPjtcblxuICAvKipcbiAgICogU2ltaWxhciB0byBgcGVuZGluZ0VtaXRgLCBidXQgdGhlbiBmb3IgcmVwcmVzZW50aW5nIHRoZSBzZXQgb2YgZmlsZXMgZm9yIHdoaWNoIHRoZSB0eXBlLWNoZWNrXG4gICAqIGZpbGUgc2hvdWxkIGJlIHJlZ2VuZXJhdGVkLiBJdCBiZWhhdmVzIGlkZW50aWNhbGx5IHdpdGggcmVzcGVjdCB0byBlcnJvcmVkIGNvbXBpbGF0aW9ucyBhc1xuICAgKiBgcGVuZGluZ0VtaXRgLlxuICAgKi9cbiAgcGVuZGluZ1R5cGVDaGVja0VtaXQ6IFNldDxzdHJpbmc+O1xuXG5cbiAgLyoqXG4gICAqIFNwZWNpZmljIGFzcGVjdHMgb2YgdGhlIGxhc3QgY29tcGlsYXRpb24gd2hpY2ggc3VjY2Vzc2Z1bGx5IGNvbXBsZXRlZCBhbmFseXNpcywgaWYgYW55LlxuICAgKi9cbiAgbGFzdEdvb2Q6IHtcbiAgICAvKipcbiAgICAgKiBUaGUgZGVwZW5kZW5jeSBncmFwaCBmcm9tIHRoZSBsYXN0IHN1Y2Nlc3NmdWxseSBhbmFseXplZCBidWlsZC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGxvZ2ljYWwgaW1wYWN0IG9mIHBoeXNpY2FsIGZpbGUgY2hhbmdlcy5cbiAgICAgKi9cbiAgICBkZXBHcmFwaDogRmlsZURlcGVuZGVuY3lHcmFwaDtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzZW1hbnRpYyBkZXBlbmRlbmN5IGdyYXBoIGZyb20gdGhlIGxhc3Qgc3VjY2Vzc2Z1bGx5IGFuYWx5emVkIGJ1aWxkLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIHBlcmZvcm0gaW4tZGVwdGggY29tcGFyaXNvbiBvZiBBbmd1bGFyIGRlY29yYXRlZCBjbGFzc2VzLCB0byBkZXRlcm1pbmVcbiAgICAgKiB3aGljaCBmaWxlcyBoYXZlIHRvIGJlIHJlLWVtaXR0ZWQgYW5kL29yIHJlLXR5cGUtY2hlY2tlZC5cbiAgICAgKi9cbiAgICBzZW1hbnRpY0RlcEdyYXBoOiBTZW1hbnRpY0RlcEdyYXBoO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGBUcmFpdENvbXBpbGVyYCBmcm9tIHRoZSBsYXN0IHN1Y2Nlc3NmdWxseSBhbmFseXplZCBidWlsZC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZCB0byBleHRyYWN0IFwicHJpb3Igd29ya1wiIHdoaWNoIG1pZ2h0IGJlIHJldXNhYmxlIGluIHRoaXMgY29tcGlsYXRpb24uXG4gICAgICovXG4gICAgdHJhaXRDb21waWxlcjogVHJhaXRDb21waWxlcjtcblxuICAgIC8qKlxuICAgICAqIFR5cGUgY2hlY2tpbmcgcmVzdWx0cyB3aGljaCB3aWxsIGJlIHBhc3NlZCBvbnRvIHRoZSBuZXh0IGJ1aWxkLlxuICAgICAqL1xuICAgIHR5cGVDaGVja2luZ1Jlc3VsdHM6IE1hcDxBYnNvbHV0ZUZzUGF0aCwgRmlsZVR5cGVDaGVja2luZ0RhdGE+fCBudWxsO1xuICB9fG51bGw7XG59XG5cbi8qKlxuICogU3RhdGUgb2YgYSBidWlsZCBiZWZvcmUgdGhlIEFuZ3VsYXIgYW5hbHlzaXMgcGhhc2UgY29tcGxldGVzLlxuICovXG5pbnRlcmZhY2UgUGVuZGluZ0J1aWxkU3RhdGUgZXh0ZW5kcyBCYXNlQnVpbGRTdGF0ZSB7XG4gIGtpbmQ6IEJ1aWxkU3RhdGVLaW5kLlBlbmRpbmc7XG5cbiAgLyoqXG4gICAqIFNldCBvZiBmaWxlcyB3aGljaCBhcmUga25vd24gdG8gbmVlZCBhbiBlbWl0LlxuICAgKlxuICAgKiBCZWZvcmUgdGhlIGNvbXBpbGVyJ3MgYW5hbHlzaXMgcGhhc2UgY29tcGxldGVzLCBgcGVuZGluZ0VtaXRgIG9ubHkgY29udGFpbnMgZmlsZXMgdGhhdCB3ZXJlXG4gICAqIHN0aWxsIHBlbmRpbmcgYWZ0ZXIgdGhlIHByZXZpb3VzIGJ1aWxkLlxuICAgKi9cbiAgcGVuZGluZ0VtaXQ6IFNldDxzdHJpbmc+O1xuXG4gIC8qKlxuICAgKiBTZXQgb2YgVHlwZVNjcmlwdCBmaWxlIHBhdGhzIHdoaWNoIGhhdmUgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgYnVpbGQuXG4gICAqL1xuICBjaGFuZ2VkVHNQYXRoczogU2V0PHN0cmluZz47XG5cbiAgLyoqXG4gICAqIFNldCBvZiByZXNvdXJjZSBmaWxlIHBhdGhzIHdoaWNoIGhhdmUgY2hhbmdlZCBzaW5jZSB0aGUgbGFzdCBzdWNjZXNzZnVsbHkgYW5hbHl6ZWQgYnVpbGQuXG4gICAqL1xuICBjaGFuZ2VkUmVzb3VyY2VQYXRoczogU2V0PEFic29sdXRlRnNQYXRoPjtcblxuICAvKipcbiAgICogSW4gYSBwZW5kaW5nIHN0YXRlLCB0aGUgc2VtYW50aWMgZGVwZW5kZW5jeSBncmFwaCBpcyBhdmFpbGFibGUgdG8gdGhlIGNvbXBpbGF0aW9uIHRvIHJlZ2lzdGVyXG4gICAqIHRoZSBpbmNyZW1lbnRhbCBzeW1ib2xzIGludG8uXG4gICAqL1xuICBzZW1hbnRpY0RlcEdyYXBoVXBkYXRlcjogU2VtYW50aWNEZXBHcmFwaFVwZGF0ZXI7XG59XG5cbmludGVyZmFjZSBBbmFseXplZEJ1aWxkU3RhdGUgZXh0ZW5kcyBCYXNlQnVpbGRTdGF0ZSB7XG4gIGtpbmQ6IEJ1aWxkU3RhdGVLaW5kLkFuYWx5emVkO1xuXG4gIC8qKlxuICAgKiBTZXQgb2YgZmlsZXMgd2hpY2ggYXJlIGtub3duIHRvIG5lZWQgYW4gZW1pdC5cbiAgICpcbiAgICogQWZ0ZXIgYW5hbHlzaXMgY29tcGxldGVzICh0aGF0IGlzLCB0aGUgc3RhdGUgdHJhbnNpdGlvbnMgdG8gYEFuYWx5emVkQnVpbGRTdGF0ZWApLCB0aGVcbiAgICogYHBlbmRpbmdFbWl0YCBzZXQgdGFrZXMgaW50byBhY2NvdW50IGFueSBvbi1kaXNrIGNoYW5nZXMgbWFkZSBzaW5jZSB0aGUgbGFzdCBzdWNjZXNzZnVsbHlcbiAgICogYW5hbHl6ZWQgYnVpbGQuXG4gICAqL1xuICBwZW5kaW5nRW1pdDogU2V0PHN0cmluZz47XG5cbiAgLyoqXG4gICAqIFR5cGUgY2hlY2tpbmcgcmVzdWx0cyBmcm9tIHRoZSBwcmV2aW91cyBjb21waWxhdGlvbiwgd2hpY2ggY2FuIGJlIHJldXNlZCBpbiB0aGlzIG9uZS5cbiAgICovXG4gIHByaW9yVHlwZUNoZWNraW5nUmVzdWx0czogTWFwPEFic29sdXRlRnNQYXRoLCBGaWxlVHlwZUNoZWNraW5nRGF0YT58bnVsbDtcbn1cblxuZnVuY3Rpb24gdHNPbmx5RmlsZXMocHJvZ3JhbTogdHMuUHJvZ3JhbSk6IFJlYWRvbmx5QXJyYXk8dHMuU291cmNlRmlsZT4ge1xuICByZXR1cm4gcHJvZ3JhbS5nZXRTb3VyY2VGaWxlcygpLmZpbHRlcihzZiA9PiAhc2YuaXNEZWNsYXJhdGlvbkZpbGUpO1xufVxuIl19