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
        define("@angular/compiler-cli/src/ngtsc/transform/src/compilation", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/diagnostics", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/src/ngtsc/transform/src/api", "@angular/compiler-cli/src/ngtsc/transform/src/trait"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TraitCompiler = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var api_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/api");
    var trait_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/trait");
    /**
     * The heart of Angular compilation.
     *
     * The `TraitCompiler` is responsible for processing all classes in the program. Any time a
     * `DecoratorHandler` matches a class, a "trait" is created to represent that Angular aspect of the
     * class (such as the class having a component definition).
     *
     * The `TraitCompiler` transitions each trait through the various phases of compilation, culminating
     * in the production of `CompileResult`s instructing the compiler to apply various mutations to the
     * class (like adding fields or type declarations).
     */
    var TraitCompiler = /** @class */ (function () {
        function TraitCompiler(handlers, reflector, perf, incrementalBuild, compileNonExportedClasses, compilationMode, dtsTransforms) {
            var e_1, _a;
            this.handlers = handlers;
            this.reflector = reflector;
            this.perf = perf;
            this.incrementalBuild = incrementalBuild;
            this.compileNonExportedClasses = compileNonExportedClasses;
            this.compilationMode = compilationMode;
            this.dtsTransforms = dtsTransforms;
            /**
             * Maps class declarations to their `ClassRecord`, which tracks the Ivy traits being applied to
             * those classes.
             */
            this.classes = new Map();
            /**
             * Maps source files to any class declaration(s) within them which have been discovered to contain
             * Ivy traits.
             */
            this.fileToClasses = new Map();
            this.reexportMap = new Map();
            this.handlersByName = new Map();
            try {
                for (var handlers_1 = tslib_1.__values(handlers), handlers_1_1 = handlers_1.next(); !handlers_1_1.done; handlers_1_1 = handlers_1.next()) {
                    var handler = handlers_1_1.value;
                    this.handlersByName.set(handler.name, handler);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (handlers_1_1 && !handlers_1_1.done && (_a = handlers_1.return)) _a.call(handlers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        TraitCompiler.prototype.analyzeSync = function (sf) {
            this.analyze(sf, false);
        };
        TraitCompiler.prototype.analyzeAsync = function (sf) {
            return this.analyze(sf, true);
        };
        TraitCompiler.prototype.analyze = function (sf, preanalyze) {
            var e_2, _a;
            var _this = this;
            // We shouldn't analyze declaration files.
            if (sf.isDeclarationFile) {
                return undefined;
            }
            // analyze() really wants to return `Promise<void>|void`, but TypeScript cannot narrow a return
            // type of 'void', so `undefined` is used instead.
            var promises = [];
            var priorWork = this.incrementalBuild.priorWorkFor(sf);
            if (priorWork !== null) {
                try {
                    for (var priorWork_1 = tslib_1.__values(priorWork), priorWork_1_1 = priorWork_1.next(); !priorWork_1_1.done; priorWork_1_1 = priorWork_1.next()) {
                        var priorRecord = priorWork_1_1.value;
                        this.adopt(priorRecord);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (priorWork_1_1 && !priorWork_1_1.done && (_a = priorWork_1.return)) _a.call(priorWork_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                // Skip the rest of analysis, as this file's prior traits are being reused.
                return;
            }
            var visit = function (node) {
                if (_this.reflector.isClass(node)) {
                    _this.analyzeClass(node, preanalyze ? promises : null);
                }
                ts.forEachChild(node, visit);
            };
            visit(sf);
            if (preanalyze && promises.length > 0) {
                return Promise.all(promises).then(function () { return undefined; });
            }
            else {
                return undefined;
            }
        };
        TraitCompiler.prototype.recordFor = function (clazz) {
            if (this.classes.has(clazz)) {
                return this.classes.get(clazz);
            }
            else {
                return null;
            }
        };
        TraitCompiler.prototype.recordsFor = function (sf) {
            var e_3, _a;
            if (!this.fileToClasses.has(sf)) {
                return null;
            }
            var records = [];
            try {
                for (var _b = tslib_1.__values(this.fileToClasses.get(sf)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var clazz = _c.value;
                    records.push(this.classes.get(clazz));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return records;
        };
        /**
         * Import a `ClassRecord` from a previous compilation.
         *
         * Traits from the `ClassRecord` have accurate metadata, but the `handler` is from the old program
         * and needs to be updated (matching is done by name). A new pending trait is created and then
         * transitioned to analyzed using the previous analysis. If the trait is in the errored state,
         * instead the errors are copied over.
         */
        TraitCompiler.prototype.adopt = function (priorRecord) {
            var e_4, _a;
            var record = {
                hasPrimaryHandler: priorRecord.hasPrimaryHandler,
                hasWeakHandlers: priorRecord.hasWeakHandlers,
                metaDiagnostics: priorRecord.metaDiagnostics,
                node: priorRecord.node,
                traits: [],
            };
            try {
                for (var _b = tslib_1.__values(priorRecord.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var priorTrait = _c.value;
                    var handler = this.handlersByName.get(priorTrait.handler.name);
                    var trait = trait_1.Trait.pending(handler, priorTrait.detected);
                    if (priorTrait.state === trait_1.TraitState.Analyzed || priorTrait.state === trait_1.TraitState.Resolved) {
                        trait = trait.toAnalyzed(priorTrait.analysis, priorTrait.analysisDiagnostics);
                        if (trait.analysis !== null && trait.handler.register !== undefined) {
                            trait.handler.register(record.node, trait.analysis);
                        }
                    }
                    else if (priorTrait.state === trait_1.TraitState.Skipped) {
                        trait = trait.toSkipped();
                    }
                    record.traits.push(trait);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_4) throw e_4.error; }
            }
            this.classes.set(record.node, record);
            var sf = record.node.getSourceFile();
            if (!this.fileToClasses.has(sf)) {
                this.fileToClasses.set(sf, new Set());
            }
            this.fileToClasses.get(sf).add(record.node);
        };
        TraitCompiler.prototype.scanClassForTraits = function (clazz) {
            if (!this.compileNonExportedClasses && !typescript_1.isExported(clazz)) {
                return null;
            }
            var decorators = this.reflector.getDecoratorsOfDeclaration(clazz);
            return this.detectTraits(clazz, decorators);
        };
        TraitCompiler.prototype.detectTraits = function (clazz, decorators) {
            var e_5, _a;
            var record = this.recordFor(clazz);
            var foundTraits = [];
            try {
                for (var _b = tslib_1.__values(this.handlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var handler = _c.value;
                    var result = handler.detect(clazz, decorators);
                    if (result === undefined) {
                        continue;
                    }
                    var isPrimaryHandler = handler.precedence === api_1.HandlerPrecedence.PRIMARY;
                    var isWeakHandler = handler.precedence === api_1.HandlerPrecedence.WEAK;
                    var trait = trait_1.Trait.pending(handler, result);
                    foundTraits.push(trait);
                    if (record === null) {
                        // This is the first handler to match this class. This path is a fast path through which
                        // most classes will flow.
                        record = {
                            node: clazz,
                            traits: [trait],
                            metaDiagnostics: null,
                            hasPrimaryHandler: isPrimaryHandler,
                            hasWeakHandlers: isWeakHandler,
                        };
                        this.classes.set(clazz, record);
                        var sf = clazz.getSourceFile();
                        if (!this.fileToClasses.has(sf)) {
                            this.fileToClasses.set(sf, new Set());
                        }
                        this.fileToClasses.get(sf).add(clazz);
                    }
                    else {
                        // This is at least the second handler to match this class. This is a slower path that some
                        // classes will go through, which validates that the set of decorators applied to the class
                        // is valid.
                        // Validate according to rules as follows:
                        //
                        // * WEAK handlers are removed if a non-WEAK handler matches.
                        // * Only one PRIMARY handler can match at a time. Any other PRIMARY handler matching a
                        //   class with an existing PRIMARY handler is an error.
                        if (!isWeakHandler && record.hasWeakHandlers) {
                            // The current handler is not a WEAK handler, but the class has other WEAK handlers.
                            // Remove them.
                            record.traits =
                                record.traits.filter(function (field) { return field.handler.precedence !== api_1.HandlerPrecedence.WEAK; });
                            record.hasWeakHandlers = false;
                        }
                        else if (isWeakHandler && !record.hasWeakHandlers) {
                            // The current handler is a WEAK handler, but the class has non-WEAK handlers already.
                            // Drop the current one.
                            continue;
                        }
                        if (isPrimaryHandler && record.hasPrimaryHandler) {
                            // The class already has a PRIMARY handler, and another one just matched.
                            record.metaDiagnostics = [{
                                    category: ts.DiagnosticCategory.Error,
                                    code: Number('-99' + diagnostics_1.ErrorCode.DECORATOR_COLLISION),
                                    file: typescript_1.getSourceFile(clazz),
                                    start: clazz.getStart(undefined, false),
                                    length: clazz.getWidth(),
                                    messageText: 'Two incompatible decorators on class',
                                }];
                            record.traits = foundTraits = [];
                            break;
                        }
                        // Otherwise, it's safe to accept the multiple decorators here. Update some of the metadata
                        // regarding this class.
                        record.traits.push(trait);
                        record.hasPrimaryHandler = record.hasPrimaryHandler || isPrimaryHandler;
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return foundTraits.length > 0 ? foundTraits : null;
        };
        TraitCompiler.prototype.analyzeClass = function (clazz, preanalyzeQueue) {
            var e_6, _a;
            var _this = this;
            var traits = this.scanClassForTraits(clazz);
            if (traits === null) {
                // There are no Ivy traits on the class, so it can safely be skipped.
                return;
            }
            var _loop_1 = function (trait) {
                var analyze = function () { return _this.analyzeTrait(clazz, trait); };
                var preanalysis = null;
                if (preanalyzeQueue !== null && trait.handler.preanalyze !== undefined) {
                    // Attempt to run preanalysis. This could fail with a `FatalDiagnosticError`; catch it if it
                    // does.
                    try {
                        preanalysis = trait.handler.preanalyze(clazz, trait.detected.metadata) || null;
                    }
                    catch (err) {
                        if (err instanceof diagnostics_1.FatalDiagnosticError) {
                            trait.toAnalyzed(null, [err.toDiagnostic()]);
                            return { value: void 0 };
                        }
                        else {
                            throw err;
                        }
                    }
                }
                if (preanalysis !== null) {
                    preanalyzeQueue.push(preanalysis.then(analyze));
                }
                else {
                    analyze();
                }
            };
            try {
                for (var traits_1 = tslib_1.__values(traits), traits_1_1 = traits_1.next(); !traits_1_1.done; traits_1_1 = traits_1.next()) {
                    var trait = traits_1_1.value;
                    var state_1 = _loop_1(trait);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (traits_1_1 && !traits_1_1.done && (_a = traits_1.return)) _a.call(traits_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
        };
        TraitCompiler.prototype.analyzeTrait = function (clazz, trait, flags) {
            var _a, _b;
            if (trait.state !== trait_1.TraitState.Pending) {
                throw new Error("Attempt to analyze trait of " + clazz.name.text + " in state " + trait_1.TraitState[trait.state] + " (expected DETECTED)");
            }
            // Attempt analysis. This could fail with a `FatalDiagnosticError`; catch it if it does.
            var result;
            try {
                result = trait.handler.analyze(clazz, trait.detected.metadata, flags);
            }
            catch (err) {
                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                    trait.toAnalyzed(null, [err.toDiagnostic()]);
                    return;
                }
                else {
                    throw err;
                }
            }
            if (result.analysis !== undefined && trait.handler.register !== undefined) {
                trait.handler.register(clazz, result.analysis);
            }
            trait = trait.toAnalyzed((_a = result.analysis) !== null && _a !== void 0 ? _a : null, (_b = result.diagnostics) !== null && _b !== void 0 ? _b : null);
        };
        TraitCompiler.prototype.resolve = function () {
            var e_7, _a, e_8, _b, e_9, _c;
            var _d, _e;
            var classes = Array.from(this.classes.keys());
            try {
                for (var classes_1 = tslib_1.__values(classes), classes_1_1 = classes_1.next(); !classes_1_1.done; classes_1_1 = classes_1.next()) {
                    var clazz = classes_1_1.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _f = (e_8 = void 0, tslib_1.__values(record.traits)), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var trait = _g.value;
                            var handler = trait.handler;
                            switch (trait.state) {
                                case trait_1.TraitState.Skipped:
                                    continue;
                                case trait_1.TraitState.Pending:
                                    throw new Error("Resolving a trait that hasn't been analyzed: " + clazz.name.text + " / " + Object.getPrototypeOf(trait.handler).constructor.name);
                                case trait_1.TraitState.Resolved:
                                    throw new Error("Resolving an already resolved trait");
                            }
                            if (trait.analysis === null) {
                                // No analysis results, cannot further process this trait.
                                continue;
                            }
                            if (handler.resolve === undefined) {
                                // No resolution of this trait needed - it's considered successful by default.
                                trait = trait.toResolved(null, null);
                                continue;
                            }
                            var result = void 0;
                            try {
                                result = handler.resolve(clazz, trait.analysis);
                            }
                            catch (err) {
                                if (err instanceof diagnostics_1.FatalDiagnosticError) {
                                    trait = trait.toResolved(null, [err.toDiagnostic()]);
                                    continue;
                                }
                                else {
                                    throw err;
                                }
                            }
                            trait = trait.toResolved((_d = result.data) !== null && _d !== void 0 ? _d : null, (_e = result.diagnostics) !== null && _e !== void 0 ? _e : null);
                            if (result.reexports !== undefined) {
                                var fileName = clazz.getSourceFile().fileName;
                                if (!this.reexportMap.has(fileName)) {
                                    this.reexportMap.set(fileName, new Map());
                                }
                                var fileReexports = this.reexportMap.get(fileName);
                                try {
                                    for (var _h = (e_9 = void 0, tslib_1.__values(result.reexports)), _j = _h.next(); !_j.done; _j = _h.next()) {
                                        var reexport = _j.value;
                                        fileReexports.set(reexport.asAlias, [reexport.fromModule, reexport.symbolName]);
                                    }
                                }
                                catch (e_9_1) { e_9 = { error: e_9_1 }; }
                                finally {
                                    try {
                                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                                    }
                                    finally { if (e_9) throw e_9.error; }
                                }
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (classes_1_1 && !classes_1_1.done && (_a = classes_1.return)) _a.call(classes_1);
                }
                finally { if (e_7) throw e_7.error; }
            }
        };
        /**
         * Generate type-checking code into the `TypeCheckContext` for any components within the given
         * `ts.SourceFile`.
         */
        TraitCompiler.prototype.typeCheck = function (sf, ctx) {
            var e_10, _a, e_11, _b;
            if (!this.fileToClasses.has(sf)) {
                return;
            }
            try {
                for (var _c = tslib_1.__values(this.fileToClasses.get(sf)), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_11 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.Resolved) {
                                continue;
                            }
                            else if (trait.handler.typeCheck === undefined) {
                                continue;
                            }
                            if (trait.resolution !== null) {
                                trait.handler.typeCheck(ctx, clazz, trait.analysis, trait.resolution);
                            }
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        TraitCompiler.prototype.index = function (ctx) {
            var e_12, _a, e_13, _b;
            try {
                for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var clazz = _d.value;
                    var record = this.classes.get(clazz);
                    try {
                        for (var _e = (e_13 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var trait = _f.value;
                            if (trait.state !== trait_1.TraitState.Resolved) {
                                // Skip traits that haven't been resolved successfully.
                                continue;
                            }
                            else if (trait.handler.index === undefined) {
                                // Skip traits that don't affect indexing.
                                continue;
                            }
                            if (trait.resolution !== null) {
                                trait.handler.index(ctx, clazz, trait.analysis, trait.resolution);
                            }
                        }
                    }
                    catch (e_13_1) { e_13 = { error: e_13_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_13) throw e_13.error; }
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_12) throw e_12.error; }
            }
        };
        TraitCompiler.prototype.compile = function (clazz, constantPool) {
            var e_14, _a;
            var original = ts.getOriginalNode(clazz);
            if (!this.reflector.isClass(clazz) || !this.reflector.isClass(original) ||
                !this.classes.has(original)) {
                return null;
            }
            var record = this.classes.get(original);
            var res = [];
            var _loop_2 = function (trait) {
                var e_15, _a;
                if (trait.state !== trait_1.TraitState.Resolved || trait.analysisDiagnostics !== null ||
                    trait.resolveDiagnostics !== null) {
                    return "continue";
                }
                var compileSpan = this_1.perf.start('compileClass', original);
                // `trait.resolution` is non-null asserted here because TypeScript does not recognize that
                // `Readonly<unknown>` is nullable (as `unknown` itself is nullable) due to the way that
                // `Readonly` works.
                var compileRes = void 0;
                if (this_1.compilationMode === api_1.CompilationMode.PARTIAL &&
                    trait.handler.compilePartial !== undefined) {
                    compileRes = trait.handler.compilePartial(clazz, trait.analysis, trait.resolution);
                }
                else {
                    compileRes =
                        trait.handler.compileFull(clazz, trait.analysis, trait.resolution, constantPool);
                }
                var compileMatchRes = compileRes;
                this_1.perf.stop(compileSpan);
                if (Array.isArray(compileMatchRes)) {
                    var _loop_3 = function (result) {
                        if (!res.some(function (r) { return r.name === result.name; })) {
                            res.push(result);
                        }
                    };
                    try {
                        for (var compileMatchRes_1 = (e_15 = void 0, tslib_1.__values(compileMatchRes)), compileMatchRes_1_1 = compileMatchRes_1.next(); !compileMatchRes_1_1.done; compileMatchRes_1_1 = compileMatchRes_1.next()) {
                            var result = compileMatchRes_1_1.value;
                            _loop_3(result);
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (compileMatchRes_1_1 && !compileMatchRes_1_1.done && (_a = compileMatchRes_1.return)) _a.call(compileMatchRes_1);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                }
                else if (!res.some(function (result) { return result.name === compileMatchRes.name; })) {
                    res.push(compileMatchRes);
                }
            };
            var this_1 = this;
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    _loop_2(trait);
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_14) throw e_14.error; }
            }
            // Look up the .d.ts transformer for the input file and record that at least one field was
            // generated, which will allow the .d.ts to be transformed later.
            this.dtsTransforms.getIvyDeclarationTransform(original.getSourceFile())
                .addFields(original, res);
            // Return the instruction to the transformer so the fields will be added.
            return res.length > 0 ? res : null;
        };
        TraitCompiler.prototype.decoratorsFor = function (node) {
            var e_16, _a;
            var original = ts.getOriginalNode(node);
            if (!this.reflector.isClass(original) || !this.classes.has(original)) {
                return [];
            }
            var record = this.classes.get(original);
            var decorators = [];
            try {
                for (var _b = tslib_1.__values(record.traits), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var trait = _c.value;
                    if (trait.state !== trait_1.TraitState.Resolved) {
                        continue;
                    }
                    if (trait.detected.trigger !== null && ts.isDecorator(trait.detected.trigger)) {
                        decorators.push(trait.detected.trigger);
                    }
                }
            }
            catch (e_16_1) { e_16 = { error: e_16_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_16) throw e_16.error; }
            }
            return decorators;
        };
        Object.defineProperty(TraitCompiler.prototype, "diagnostics", {
            get: function () {
                var e_17, _a, e_18, _b;
                var diagnostics = [];
                try {
                    for (var _c = tslib_1.__values(this.classes.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var clazz = _d.value;
                        var record = this.classes.get(clazz);
                        if (record.metaDiagnostics !== null) {
                            diagnostics.push.apply(diagnostics, tslib_1.__spread(record.metaDiagnostics));
                        }
                        try {
                            for (var _e = (e_18 = void 0, tslib_1.__values(record.traits)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var trait = _f.value;
                                if ((trait.state === trait_1.TraitState.Analyzed || trait.state === trait_1.TraitState.Resolved) &&
                                    trait.analysisDiagnostics !== null) {
                                    diagnostics.push.apply(diagnostics, tslib_1.__spread(trait.analysisDiagnostics));
                                }
                                if (trait.state === trait_1.TraitState.Resolved && trait.resolveDiagnostics !== null) {
                                    diagnostics.push.apply(diagnostics, tslib_1.__spread(trait.resolveDiagnostics));
                                }
                            }
                        }
                        catch (e_18_1) { e_18 = { error: e_18_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_18) throw e_18.error; }
                        }
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
                return diagnostics;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TraitCompiler.prototype, "exportStatements", {
            get: function () {
                return this.reexportMap;
            },
            enumerable: false,
            configurable: true
        });
        return TraitCompiler;
    }());
    exports.TraitCompiler = TraitCompiler;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3RyYW5zZm9ybS9zcmMvY29tcGlsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILCtCQUFpQztJQUVqQywyRUFBa0U7SUFNbEUsa0ZBQW9FO0lBRXBFLHlFQUF1STtJQUV2SSw2RUFBd0Q7SUFxQ3hEOzs7Ozs7Ozs7O09BVUc7SUFDSDtRQWlCRSx1QkFDWSxRQUF1RCxFQUN2RCxTQUF5QixFQUFVLElBQWtCLEVBQ3JELGdCQUF3RCxFQUN4RCx5QkFBa0MsRUFBVSxlQUFnQyxFQUM1RSxhQUFtQzs7WUFKbkMsYUFBUSxHQUFSLFFBQVEsQ0FBK0M7WUFDdkQsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUFBVSxTQUFJLEdBQUosSUFBSSxDQUFjO1lBQ3JELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBd0M7WUFDeEQsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUFTO1lBQVUsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQzVFLGtCQUFhLEdBQWIsYUFBYSxDQUFzQjtZQXJCL0M7OztlQUdHO1lBQ0ssWUFBTyxHQUFHLElBQUksR0FBRyxFQUFpQyxDQUFDO1lBRTNEOzs7ZUFHRztZQUNPLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQXdDLENBQUM7WUFFbEUsZ0JBQVcsR0FBRyxJQUFJLEdBQUcsRUFBeUMsQ0FBQztZQUUvRCxtQkFBYyxHQUFHLElBQUksR0FBRyxFQUF1RCxDQUFDOztnQkFRdEYsS0FBc0IsSUFBQSxhQUFBLGlCQUFBLFFBQVEsQ0FBQSxrQ0FBQSx3REFBRTtvQkFBM0IsSUFBTSxPQUFPLHFCQUFBO29CQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FB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QUFDLGVBQWUsR0FBRTt5QkFDN0M7OzRCQUNELEtBQW9CLElBQUEscUJBQUEsaUJBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQSxDQUFBLGdCQUFBLDRCQUFFO2dDQUE5QixJQUFNLEtBQUssV0FBQTtnQ0FDZCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxrQkFBVSxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLGtCQUFVLENBQUMsUUFBUSxDQUFDO29DQUM1RSxLQUFLLENBQUMsbUJBQW1CLEtBQUssSUFBSSxFQUFFO29DQUN0QyxXQUFXLENBQUMsSUFBSSxPQUFoQixXQUFXLG1CQUFTLEtBQUssQ0FBQyxtQkFBbUIsR0FBRTtpQ0FDaEQ7Z0NBQ0QsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLGtCQUFVLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7b0NBQzVFLFdBQVcsQ0FBQyxJQUFJLE9BQWhCLFdBQVcsbUJBQVMsS0FBSyxDQUFDLGtCQUFrQixHQUFFO2lDQUMvQzs2QkFDRjs7Ozs7Ozs7O3FCQUNGOzs7Ozs7Ozs7Z0JBQ0QsT0FBTyxXQUFXLENBQUM7WUFDckIsQ0FBQzs7O1dBQUE7UUFFRCxzQkFBSSwyQ0FBZ0I7aUJBQXBCO2dCQUNFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUMxQixDQUFDOzs7V0FBQTtRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQXZlRCxJQXVlQztJQXZlWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0YW50UG9vbH0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7RXJyb3JDb2RlLCBGYXRhbERpYWdub3N0aWNFcnJvcn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MnO1xuaW1wb3J0IHtJbmNyZW1lbnRhbEJ1aWxkfSBmcm9tICcuLi8uLi9pbmNyZW1lbnRhbC9hcGknO1xuaW1wb3J0IHtJbmRleGluZ0NvbnRleHR9IGZyb20gJy4uLy4uL2luZGV4ZXInO1xuaW1wb3J0IHtQZXJmUmVjb3JkZXJ9IGZyb20gJy4uLy4uL3BlcmYnO1xuaW1wb3J0IHtDbGFzc0RlY2xhcmF0aW9uLCBEZWNsYXJhdGlvbk5vZGUsIERlY29yYXRvciwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtQcm9ncmFtVHlwZUNoZWNrQWRhcHRlciwgVHlwZUNoZWNrQ29udGV4dH0gZnJvbSAnLi4vLi4vdHlwZWNoZWNrL2FwaSc7XG5pbXBvcnQge2dldFNvdXJjZUZpbGUsIGlzRXhwb3J0ZWR9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0FuYWx5c2lzT3V0cHV0LCBDb21waWxhdGlvbk1vZGUsIENvbXBpbGVSZXN1bHQsIERlY29yYXRvckhhbmRsZXIsIEhhbmRsZXJGbGFncywgSGFuZGxlclByZWNlZGVuY2UsIFJlc29sdmVSZXN1bHR9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7RHRzVHJhbnNmb3JtUmVnaXN0cnl9IGZyb20gJy4vZGVjbGFyYXRpb24nO1xuaW1wb3J0IHtQZW5kaW5nVHJhaXQsIFRyYWl0LCBUcmFpdFN0YXRlfSBmcm9tICcuL3RyYWl0JztcblxuXG4vKipcbiAqIFJlY29yZHMgaW5mb3JtYXRpb24gYWJvdXQgYSBzcGVjaWZpYyBjbGFzcyB0aGF0IGhhcyBtYXRjaGVkIHRyYWl0cy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGFzc1JlY29yZCB7XG4gIC8qKlxuICAgKiBUaGUgYENsYXNzRGVjbGFyYXRpb25gIG9mIHRoZSBjbGFzcyB3aGljaCBoYXMgQW5ndWxhciB0cmFpdHMgYXBwbGllZC5cbiAgICovXG4gIG5vZGU6IENsYXNzRGVjbGFyYXRpb247XG5cbiAgLyoqXG4gICAqIEFsbCB0cmFpdHMgd2hpY2ggbWF0Y2hlZCBvbiB0aGUgY2xhc3MuXG4gICAqL1xuICB0cmFpdHM6IFRyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+W107XG5cbiAgLyoqXG4gICAqIE1ldGEtZGlhZ25vc3RpY3MgYWJvdXQgdGhlIGNsYXNzLCB3aGljaCBhcmUgdXN1YWxseSByZWxhdGVkIHRvIHdoZXRoZXIgY2VydGFpbiBjb21iaW5hdGlvbnMgb2ZcbiAgICogQW5ndWxhciBkZWNvcmF0b3JzIGFyZSBub3QgcGVybWl0dGVkLlxuICAgKi9cbiAgbWV0YURpYWdub3N0aWNzOiB0cy5EaWFnbm9zdGljW118bnVsbDtcblxuICAvLyBTdWJzZXF1ZW50IGZpZWxkcyBhcmUgXCJpbnRlcm5hbFwiIGFuZCB1c2VkIGR1cmluZyB0aGUgbWF0Y2hpbmcgb2YgYERlY29yYXRvckhhbmRsZXJgcy4gVGhpcyBpc1xuICAvLyBtdXRhYmxlIHN0YXRlIGR1cmluZyB0aGUgYGRldGVjdGAvYGFuYWx5emVgIHBoYXNlcyBvZiBjb21waWxhdGlvbi5cblxuICAvKipcbiAgICogV2hldGhlciBgdHJhaXRzYCBjb250YWlucyB0cmFpdHMgbWF0Y2hlZCBmcm9tIGBEZWNvcmF0b3JIYW5kbGVyYHMgbWFya2VkIGFzIGBXRUFLYC5cbiAgICovXG4gIGhhc1dlYWtIYW5kbGVyczogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hldGhlciBgdHJhaXRzYCBjb250YWlucyBhIHRyYWl0IGZyb20gYSBgRGVjb3JhdG9ySGFuZGxlcmAgbWF0Y2hlZCBhcyBgUFJJTUFSWWAuXG4gICAqL1xuICBoYXNQcmltYXJ5SGFuZGxlcjogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBUaGUgaGVhcnQgb2YgQW5ndWxhciBjb21waWxhdGlvbi5cbiAqXG4gKiBUaGUgYFRyYWl0Q29tcGlsZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBwcm9jZXNzaW5nIGFsbCBjbGFzc2VzIGluIHRoZSBwcm9ncmFtLiBBbnkgdGltZSBhXG4gKiBgRGVjb3JhdG9ySGFuZGxlcmAgbWF0Y2hlcyBhIGNsYXNzLCBhIFwidHJhaXRcIiBpcyBjcmVhdGVkIHRvIHJlcHJlc2VudCB0aGF0IEFuZ3VsYXIgYXNwZWN0IG9mIHRoZVxuICogY2xhc3MgKHN1Y2ggYXMgdGhlIGNsYXNzIGhhdmluZyBhIGNvbXBvbmVudCBkZWZpbml0aW9uKS5cbiAqXG4gKiBUaGUgYFRyYWl0Q29tcGlsZXJgIHRyYW5zaXRpb25zIGVhY2ggdHJhaXQgdGhyb3VnaCB0aGUgdmFyaW91cyBwaGFzZXMgb2YgY29tcGlsYXRpb24sIGN1bG1pbmF0aW5nXG4gKiBpbiB0aGUgcHJvZHVjdGlvbiBvZiBgQ29tcGlsZVJlc3VsdGBzIGluc3RydWN0aW5nIHRoZSBjb21waWxlciB0byBhcHBseSB2YXJpb3VzIG11dGF0aW9ucyB0byB0aGVcbiAqIGNsYXNzIChsaWtlIGFkZGluZyBmaWVsZHMgb3IgdHlwZSBkZWNsYXJhdGlvbnMpLlxuICovXG5leHBvcnQgY2xhc3MgVHJhaXRDb21waWxlciBpbXBsZW1lbnRzIFByb2dyYW1UeXBlQ2hlY2tBZGFwdGVyIHtcbiAgLyoqXG4gICAqIE1hcHMgY2xhc3MgZGVjbGFyYXRpb25zIHRvIHRoZWlyIGBDbGFzc1JlY29yZGAsIHdoaWNoIHRyYWNrcyB0aGUgSXZ5IHRyYWl0cyBiZWluZyBhcHBsaWVkIHRvXG4gICAqIHRob3NlIGNsYXNzZXMuXG4gICAqL1xuICBwcml2YXRlIGNsYXNzZXMgPSBuZXcgTWFwPENsYXNzRGVjbGFyYXRpb24sIENsYXNzUmVjb3JkPigpO1xuXG4gIC8qKlxuICAgKiBNYXBzIHNvdXJjZSBmaWxlcyB0byBhbnkgY2xhc3MgZGVjbGFyYXRpb24ocykgd2l0aGluIHRoZW0gd2hpY2ggaGF2ZSBiZWVuIGRpc2NvdmVyZWQgdG8gY29udGFpblxuICAgKiBJdnkgdHJhaXRzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGZpbGVUb0NsYXNzZXMgPSBuZXcgTWFwPHRzLlNvdXJjZUZpbGUsIFNldDxDbGFzc0RlY2xhcmF0aW9uPj4oKTtcblxuICBwcml2YXRlIHJlZXhwb3J0TWFwID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxzdHJpbmcsIFtzdHJpbmcsIHN0cmluZ10+PigpO1xuXG4gIHByaXZhdGUgaGFuZGxlcnNCeU5hbWUgPSBuZXcgTWFwPHN0cmluZywgRGVjb3JhdG9ySGFuZGxlcjx1bmtub3duLCB1bmtub3duLCB1bmtub3duPj4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaGFuZGxlcnM6IERlY29yYXRvckhhbmRsZXI8dW5rbm93biwgdW5rbm93biwgdW5rbm93bj5bXSxcbiAgICAgIHByaXZhdGUgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgcHJpdmF0ZSBwZXJmOiBQZXJmUmVjb3JkZXIsXG4gICAgICBwcml2YXRlIGluY3JlbWVudGFsQnVpbGQ6IEluY3JlbWVudGFsQnVpbGQ8Q2xhc3NSZWNvcmQsIHVua25vd24+LFxuICAgICAgcHJpdmF0ZSBjb21waWxlTm9uRXhwb3J0ZWRDbGFzc2VzOiBib29sZWFuLCBwcml2YXRlIGNvbXBpbGF0aW9uTW9kZTogQ29tcGlsYXRpb25Nb2RlLFxuICAgICAgcHJpdmF0ZSBkdHNUcmFuc2Zvcm1zOiBEdHNUcmFuc2Zvcm1SZWdpc3RyeSkge1xuICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiBoYW5kbGVycykge1xuICAgICAgdGhpcy5oYW5kbGVyc0J5TmFtZS5zZXQoaGFuZGxlci5uYW1lLCBoYW5kbGVyKTtcbiAgICB9XG4gIH1cblxuICBhbmFseXplU3luYyhzZjogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIHRoaXMuYW5hbHl6ZShzZiwgZmFsc2UpO1xuICB9XG5cbiAgYW5hbHl6ZUFzeW5jKHNmOiB0cy5Tb3VyY2VGaWxlKTogUHJvbWlzZTx2b2lkPnx1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmFuYWx5emUoc2YsIHRydWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhbmFseXplKHNmOiB0cy5Tb3VyY2VGaWxlLCBwcmVhbmFseXplOiBmYWxzZSk6IHZvaWQ7XG4gIHByaXZhdGUgYW5hbHl6ZShzZjogdHMuU291cmNlRmlsZSwgcHJlYW5hbHl6ZTogdHJ1ZSk6IFByb21pc2U8dm9pZD58dW5kZWZpbmVkO1xuICBwcml2YXRlIGFuYWx5emUoc2Y6IHRzLlNvdXJjZUZpbGUsIHByZWFuYWx5emU6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZCB7XG4gICAgLy8gV2Ugc2hvdWxkbid0IGFuYWx5emUgZGVjbGFyYXRpb24gZmlsZXMuXG4gICAgaWYgKHNmLmlzRGVjbGFyYXRpb25GaWxlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIGFuYWx5emUoKSByZWFsbHkgd2FudHMgdG8gcmV0dXJuIGBQcm9taXNlPHZvaWQ+fHZvaWRgLCBidXQgVHlwZVNjcmlwdCBjYW5ub3QgbmFycm93IGEgcmV0dXJuXG4gICAgLy8gdHlwZSBvZiAndm9pZCcsIHNvIGB1bmRlZmluZWRgIGlzIHVzZWQgaW5zdGVhZC5cbiAgICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW107XG5cbiAgICBjb25zdCBwcmlvcldvcmsgPSB0aGlzLmluY3JlbWVudGFsQnVpbGQucHJpb3JXb3JrRm9yKHNmKTtcbiAgICBpZiAocHJpb3JXb3JrICE9PSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IHByaW9yUmVjb3JkIG9mIHByaW9yV29yaykge1xuICAgICAgICB0aGlzLmFkb3B0KHByaW9yUmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCB0aGUgcmVzdCBvZiBhbmFseXNpcywgYXMgdGhpcyBmaWxlJ3MgcHJpb3IgdHJhaXRzIGFyZSBiZWluZyByZXVzZWQuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmlzaXQgPSAobm9kZTogdHMuTm9kZSk6IHZvaWQgPT4ge1xuICAgICAgaWYgKHRoaXMucmVmbGVjdG9yLmlzQ2xhc3Mobm9kZSkpIHtcbiAgICAgICAgdGhpcy5hbmFseXplQ2xhc3Mobm9kZSwgcHJlYW5hbHl6ZSA/IHByb21pc2VzIDogbnVsbCk7XG4gICAgICB9XG4gICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXQpO1xuICAgIH07XG5cbiAgICB2aXNpdChzZik7XG5cbiAgICBpZiAocHJlYW5hbHl6ZSAmJiBwcm9taXNlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oKCkgPT4gdW5kZWZpbmVkIGFzIHZvaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuXG4gIHJlY29yZEZvcihjbGF6ejogQ2xhc3NEZWNsYXJhdGlvbik6IENsYXNzUmVjb3JkfG51bGwge1xuICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzKGNsYXp6KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopITtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgcmVjb3Jkc0ZvcihzZjogdHMuU291cmNlRmlsZSk6IENsYXNzUmVjb3JkW118bnVsbCB7XG4gICAgaWYgKCF0aGlzLmZpbGVUb0NsYXNzZXMuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlY29yZHM6IENsYXNzUmVjb3JkW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IGNsYXp6IG9mIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpISkge1xuICAgICAgcmVjb3Jkcy5wdXNoKHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopISk7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydCBhIGBDbGFzc1JlY29yZGAgZnJvbSBhIHByZXZpb3VzIGNvbXBpbGF0aW9uLlxuICAgKlxuICAgKiBUcmFpdHMgZnJvbSB0aGUgYENsYXNzUmVjb3JkYCBoYXZlIGFjY3VyYXRlIG1ldGFkYXRhLCBidXQgdGhlIGBoYW5kbGVyYCBpcyBmcm9tIHRoZSBvbGQgcHJvZ3JhbVxuICAgKiBhbmQgbmVlZHMgdG8gYmUgdXBkYXRlZCAobWF0Y2hpbmcgaXMgZG9uZSBieSBuYW1lKS4gQSBuZXcgcGVuZGluZyB0cmFpdCBpcyBjcmVhdGVkIGFuZCB0aGVuXG4gICAqIHRyYW5zaXRpb25lZCB0byBhbmFseXplZCB1c2luZyB0aGUgcHJldmlvdXMgYW5hbHlzaXMuIElmIHRoZSB0cmFpdCBpcyBpbiB0aGUgZXJyb3JlZCBzdGF0ZSxcbiAgICogaW5zdGVhZCB0aGUgZXJyb3JzIGFyZSBjb3BpZWQgb3Zlci5cbiAgICovXG4gIHByaXZhdGUgYWRvcHQocHJpb3JSZWNvcmQ6IENsYXNzUmVjb3JkKTogdm9pZCB7XG4gICAgY29uc3QgcmVjb3JkOiBDbGFzc1JlY29yZCA9IHtcbiAgICAgIGhhc1ByaW1hcnlIYW5kbGVyOiBwcmlvclJlY29yZC5oYXNQcmltYXJ5SGFuZGxlcixcbiAgICAgIGhhc1dlYWtIYW5kbGVyczogcHJpb3JSZWNvcmQuaGFzV2Vha0hhbmRsZXJzLFxuICAgICAgbWV0YURpYWdub3N0aWNzOiBwcmlvclJlY29yZC5tZXRhRGlhZ25vc3RpY3MsXG4gICAgICBub2RlOiBwcmlvclJlY29yZC5ub2RlLFxuICAgICAgdHJhaXRzOiBbXSxcbiAgICB9O1xuXG4gICAgZm9yIChjb25zdCBwcmlvclRyYWl0IG9mIHByaW9yUmVjb3JkLnRyYWl0cykge1xuICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMuaGFuZGxlcnNCeU5hbWUuZ2V0KHByaW9yVHJhaXQuaGFuZGxlci5uYW1lKSE7XG4gICAgICBsZXQgdHJhaXQ6IFRyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+ID0gVHJhaXQucGVuZGluZyhoYW5kbGVyLCBwcmlvclRyYWl0LmRldGVjdGVkKTtcblxuICAgICAgaWYgKHByaW9yVHJhaXQuc3RhdGUgPT09IFRyYWl0U3RhdGUuQW5hbHl6ZWQgfHwgcHJpb3JUcmFpdC5zdGF0ZSA9PT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCkge1xuICAgICAgICB0cmFpdCA9IHRyYWl0LnRvQW5hbHl6ZWQocHJpb3JUcmFpdC5hbmFseXNpcywgcHJpb3JUcmFpdC5hbmFseXNpc0RpYWdub3N0aWNzKTtcbiAgICAgICAgaWYgKHRyYWl0LmFuYWx5c2lzICE9PSBudWxsICYmIHRyYWl0LmhhbmRsZXIucmVnaXN0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRyYWl0LmhhbmRsZXIucmVnaXN0ZXIocmVjb3JkLm5vZGUsIHRyYWl0LmFuYWx5c2lzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwcmlvclRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlNraXBwZWQpIHtcbiAgICAgICAgdHJhaXQgPSB0cmFpdC50b1NraXBwZWQoKTtcbiAgICAgIH1cblxuICAgICAgcmVjb3JkLnRyYWl0cy5wdXNoKHRyYWl0KTtcbiAgICB9XG5cbiAgICB0aGlzLmNsYXNzZXMuc2V0KHJlY29yZC5ub2RlLCByZWNvcmQpO1xuICAgIGNvbnN0IHNmID0gcmVjb3JkLm5vZGUuZ2V0U291cmNlRmlsZSgpO1xuICAgIGlmICghdGhpcy5maWxlVG9DbGFzc2VzLmhhcyhzZikpIHtcbiAgICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5zZXQoc2YsIG5ldyBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4oKSk7XG4gICAgfVxuICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5nZXQoc2YpIS5hZGQocmVjb3JkLm5vZGUpO1xuICB9XG5cbiAgcHJpdmF0ZSBzY2FuQ2xhc3NGb3JUcmFpdHMoY2xheno6IENsYXNzRGVjbGFyYXRpb24pOlxuICAgICAgUGVuZGluZ1RyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+W118bnVsbCB7XG4gICAgaWYgKCF0aGlzLmNvbXBpbGVOb25FeHBvcnRlZENsYXNzZXMgJiYgIWlzRXhwb3J0ZWQoY2xhenopKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5yZWZsZWN0b3IuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oY2xhenopO1xuXG4gICAgcmV0dXJuIHRoaXMuZGV0ZWN0VHJhaXRzKGNsYXp6LCBkZWNvcmF0b3JzKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBkZXRlY3RUcmFpdHMoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIGRlY29yYXRvcnM6IERlY29yYXRvcltdfG51bGwpOlxuICAgICAgUGVuZGluZ1RyYWl0PHVua25vd24sIHVua25vd24sIHVua25vd24+W118bnVsbCB7XG4gICAgbGV0IHJlY29yZDogQ2xhc3NSZWNvcmR8bnVsbCA9IHRoaXMucmVjb3JkRm9yKGNsYXp6KTtcbiAgICBsZXQgZm91bmRUcmFpdHM6IFBlbmRpbmdUcmFpdDx1bmtub3duLCB1bmtub3duLCB1bmtub3duPltdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGhhbmRsZXIgb2YgdGhpcy5oYW5kbGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gaGFuZGxlci5kZXRlY3QoY2xhenosIGRlY29yYXRvcnMpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc1ByaW1hcnlIYW5kbGVyID0gaGFuZGxlci5wcmVjZWRlbmNlID09PSBIYW5kbGVyUHJlY2VkZW5jZS5QUklNQVJZO1xuICAgICAgY29uc3QgaXNXZWFrSGFuZGxlciA9IGhhbmRsZXIucHJlY2VkZW5jZSA9PT0gSGFuZGxlclByZWNlZGVuY2UuV0VBSztcbiAgICAgIGNvbnN0IHRyYWl0ID0gVHJhaXQucGVuZGluZyhoYW5kbGVyLCByZXN1bHQpO1xuXG4gICAgICBmb3VuZFRyYWl0cy5wdXNoKHRyYWl0KTtcblxuICAgICAgaWYgKHJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBoYW5kbGVyIHRvIG1hdGNoIHRoaXMgY2xhc3MuIFRoaXMgcGF0aCBpcyBhIGZhc3QgcGF0aCB0aHJvdWdoIHdoaWNoXG4gICAgICAgIC8vIG1vc3QgY2xhc3NlcyB3aWxsIGZsb3cuXG4gICAgICAgIHJlY29yZCA9IHtcbiAgICAgICAgICBub2RlOiBjbGF6eixcbiAgICAgICAgICB0cmFpdHM6IFt0cmFpdF0sXG4gICAgICAgICAgbWV0YURpYWdub3N0aWNzOiBudWxsLFxuICAgICAgICAgIGhhc1ByaW1hcnlIYW5kbGVyOiBpc1ByaW1hcnlIYW5kbGVyLFxuICAgICAgICAgIGhhc1dlYWtIYW5kbGVyczogaXNXZWFrSGFuZGxlcixcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmNsYXNzZXMuc2V0KGNsYXp6LCByZWNvcmQpO1xuICAgICAgICBjb25zdCBzZiA9IGNsYXp6LmdldFNvdXJjZUZpbGUoKTtcbiAgICAgICAgaWYgKCF0aGlzLmZpbGVUb0NsYXNzZXMuaGFzKHNmKSkge1xuICAgICAgICAgIHRoaXMuZmlsZVRvQ2xhc3Nlcy5zZXQoc2YsIG5ldyBTZXQ8Q2xhc3NEZWNsYXJhdGlvbj4oKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWxlVG9DbGFzc2VzLmdldChzZikhLmFkZChjbGF6eik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBUaGlzIGlzIGF0IGxlYXN0IHRoZSBzZWNvbmQgaGFuZGxlciB0byBtYXRjaCB0aGlzIGNsYXNzLiBUaGlzIGlzIGEgc2xvd2VyIHBhdGggdGhhdCBzb21lXG4gICAgICAgIC8vIGNsYXNzZXMgd2lsbCBnbyB0aHJvdWdoLCB3aGljaCB2YWxpZGF0ZXMgdGhhdCB0aGUgc2V0IG9mIGRlY29yYXRvcnMgYXBwbGllZCB0byB0aGUgY2xhc3NcbiAgICAgICAgLy8gaXMgdmFsaWQuXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgYWNjb3JkaW5nIHRvIHJ1bGVzIGFzIGZvbGxvd3M6XG4gICAgICAgIC8vXG4gICAgICAgIC8vICogV0VBSyBoYW5kbGVycyBhcmUgcmVtb3ZlZCBpZiBhIG5vbi1XRUFLIGhhbmRsZXIgbWF0Y2hlcy5cbiAgICAgICAgLy8gKiBPbmx5IG9uZSBQUklNQVJZIGhhbmRsZXIgY2FuIG1hdGNoIGF0IGEgdGltZS4gQW55IG90aGVyIFBSSU1BUlkgaGFuZGxlciBtYXRjaGluZyBhXG4gICAgICAgIC8vICAgY2xhc3Mgd2l0aCBhbiBleGlzdGluZyBQUklNQVJZIGhhbmRsZXIgaXMgYW4gZXJyb3IuXG5cbiAgICAgICAgaWYgKCFpc1dlYWtIYW5kbGVyICYmIHJlY29yZC5oYXNXZWFrSGFuZGxlcnMpIHtcbiAgICAgICAgICAvLyBUaGUgY3VycmVudCBoYW5kbGVyIGlzIG5vdCBhIFdFQUsgaGFuZGxlciwgYnV0IHRoZSBjbGFzcyBoYXMgb3RoZXIgV0VBSyBoYW5kbGVycy5cbiAgICAgICAgICAvLyBSZW1vdmUgdGhlbS5cbiAgICAgICAgICByZWNvcmQudHJhaXRzID1cbiAgICAgICAgICAgICAgcmVjb3JkLnRyYWl0cy5maWx0ZXIoZmllbGQgPT4gZmllbGQuaGFuZGxlci5wcmVjZWRlbmNlICE9PSBIYW5kbGVyUHJlY2VkZW5jZS5XRUFLKTtcbiAgICAgICAgICByZWNvcmQuaGFzV2Vha0hhbmRsZXJzID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNXZWFrSGFuZGxlciAmJiAhcmVjb3JkLmhhc1dlYWtIYW5kbGVycykge1xuICAgICAgICAgIC8vIFRoZSBjdXJyZW50IGhhbmRsZXIgaXMgYSBXRUFLIGhhbmRsZXIsIGJ1dCB0aGUgY2xhc3MgaGFzIG5vbi1XRUFLIGhhbmRsZXJzIGFscmVhZHkuXG4gICAgICAgICAgLy8gRHJvcCB0aGUgY3VycmVudCBvbmUuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNQcmltYXJ5SGFuZGxlciAmJiByZWNvcmQuaGFzUHJpbWFyeUhhbmRsZXIpIHtcbiAgICAgICAgICAvLyBUaGUgY2xhc3MgYWxyZWFkeSBoYXMgYSBQUklNQVJZIGhhbmRsZXIsIGFuZCBhbm90aGVyIG9uZSBqdXN0IG1hdGNoZWQuXG4gICAgICAgICAgcmVjb3JkLm1ldGFEaWFnbm9zdGljcyA9IFt7XG4gICAgICAgICAgICBjYXRlZ29yeTogdHMuRGlhZ25vc3RpY0NhdGVnb3J5LkVycm9yLFxuICAgICAgICAgICAgY29kZTogTnVtYmVyKCctOTknICsgRXJyb3JDb2RlLkRFQ09SQVRPUl9DT0xMSVNJT04pLFxuICAgICAgICAgICAgZmlsZTogZ2V0U291cmNlRmlsZShjbGF6eiksXG4gICAgICAgICAgICBzdGFydDogY2xhenouZ2V0U3RhcnQodW5kZWZpbmVkLCBmYWxzZSksXG4gICAgICAgICAgICBsZW5ndGg6IGNsYXp6LmdldFdpZHRoKCksXG4gICAgICAgICAgICBtZXNzYWdlVGV4dDogJ1R3byBpbmNvbXBhdGlibGUgZGVjb3JhdG9ycyBvbiBjbGFzcycsXG4gICAgICAgICAgfV07XG4gICAgICAgICAgcmVjb3JkLnRyYWl0cyA9IGZvdW5kVHJhaXRzID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdGhlcndpc2UsIGl0J3Mgc2FmZSB0byBhY2NlcHQgdGhlIG11bHRpcGxlIGRlY29yYXRvcnMgaGVyZS4gVXBkYXRlIHNvbWUgb2YgdGhlIG1ldGFkYXRhXG4gICAgICAgIC8vIHJlZ2FyZGluZyB0aGlzIGNsYXNzLlxuICAgICAgICByZWNvcmQudHJhaXRzLnB1c2godHJhaXQpO1xuICAgICAgICByZWNvcmQuaGFzUHJpbWFyeUhhbmRsZXIgPSByZWNvcmQuaGFzUHJpbWFyeUhhbmRsZXIgfHwgaXNQcmltYXJ5SGFuZGxlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm91bmRUcmFpdHMubGVuZ3RoID4gMCA/IGZvdW5kVHJhaXRzIDogbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCBhbmFseXplQ2xhc3MoY2xheno6IENsYXNzRGVjbGFyYXRpb24sIHByZWFuYWx5emVRdWV1ZTogUHJvbWlzZTx2b2lkPltdfG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCB0cmFpdHMgPSB0aGlzLnNjYW5DbGFzc0ZvclRyYWl0cyhjbGF6eik7XG5cbiAgICBpZiAodHJhaXRzID09PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBhcmUgbm8gSXZ5IHRyYWl0cyBvbiB0aGUgY2xhc3MsIHNvIGl0IGNhbiBzYWZlbHkgYmUgc2tpcHBlZC5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IHRyYWl0IG9mIHRyYWl0cykge1xuICAgICAgY29uc3QgYW5hbHl6ZSA9ICgpID0+IHRoaXMuYW5hbHl6ZVRyYWl0KGNsYXp6LCB0cmFpdCk7XG5cbiAgICAgIGxldCBwcmVhbmFseXNpczogUHJvbWlzZTx2b2lkPnxudWxsID0gbnVsbDtcbiAgICAgIGlmIChwcmVhbmFseXplUXVldWUgIT09IG51bGwgJiYgdHJhaXQuaGFuZGxlci5wcmVhbmFseXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQXR0ZW1wdCB0byBydW4gcHJlYW5hbHlzaXMuIFRoaXMgY291bGQgZmFpbCB3aXRoIGEgYEZhdGFsRGlhZ25vc3RpY0Vycm9yYDsgY2F0Y2ggaXQgaWYgaXRcbiAgICAgICAgLy8gZG9lcy5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBwcmVhbmFseXNpcyA9IHRyYWl0LmhhbmRsZXIucHJlYW5hbHl6ZShjbGF6eiwgdHJhaXQuZGV0ZWN0ZWQubWV0YWRhdGEpIHx8IG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBGYXRhbERpYWdub3N0aWNFcnJvcikge1xuICAgICAgICAgICAgdHJhaXQudG9BbmFseXplZChudWxsLCBbZXJyLnRvRGlhZ25vc3RpYygpXSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwcmVhbmFseXNpcyAhPT0gbnVsbCkge1xuICAgICAgICBwcmVhbmFseXplUXVldWUhLnB1c2gocHJlYW5hbHlzaXMudGhlbihhbmFseXplKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbmFseXplKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGFuYWx5emVUcmFpdChcbiAgICAgIGNsYXp6OiBDbGFzc0RlY2xhcmF0aW9uLCB0cmFpdDogVHJhaXQ8dW5rbm93biwgdW5rbm93biwgdW5rbm93bj4sXG4gICAgICBmbGFncz86IEhhbmRsZXJGbGFncyk6IHZvaWQge1xuICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5QZW5kaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dGVtcHQgdG8gYW5hbHl6ZSB0cmFpdCBvZiAke2NsYXp6Lm5hbWUudGV4dH0gaW4gc3RhdGUgJHtcbiAgICAgICAgICBUcmFpdFN0YXRlW3RyYWl0LnN0YXRlXX0gKGV4cGVjdGVkIERFVEVDVEVEKWApO1xuICAgIH1cblxuICAgIC8vIEF0dGVtcHQgYW5hbHlzaXMuIFRoaXMgY291bGQgZmFpbCB3aXRoIGEgYEZhdGFsRGlhZ25vc3RpY0Vycm9yYDsgY2F0Y2ggaXQgaWYgaXQgZG9lcy5cbiAgICBsZXQgcmVzdWx0OiBBbmFseXNpc091dHB1dDx1bmtub3duPjtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdHJhaXQuaGFuZGxlci5hbmFseXplKGNsYXp6LCB0cmFpdC5kZXRlY3RlZC5tZXRhZGF0YSwgZmxhZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEZhdGFsRGlhZ25vc3RpY0Vycm9yKSB7XG4gICAgICAgIHRyYWl0LnRvQW5hbHl6ZWQobnVsbCwgW2Vyci50b0RpYWdub3N0aWMoKV0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlc3VsdC5hbmFseXNpcyAhPT0gdW5kZWZpbmVkICYmIHRyYWl0LmhhbmRsZXIucmVnaXN0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHJhaXQuaGFuZGxlci5yZWdpc3RlcihjbGF6eiwgcmVzdWx0LmFuYWx5c2lzKTtcbiAgICB9XG5cbiAgICB0cmFpdCA9IHRyYWl0LnRvQW5hbHl6ZWQocmVzdWx0LmFuYWx5c2lzID8/IG51bGwsIHJlc3VsdC5kaWFnbm9zdGljcyA/PyBudWxsKTtcbiAgfVxuXG4gIHJlc29sdmUoKTogdm9pZCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IEFycmF5LmZyb20odGhpcy5jbGFzc2VzLmtleXMoKSk7XG4gICAgZm9yIChjb25zdCBjbGF6eiBvZiBjbGFzc2VzKSB7XG4gICAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KGNsYXp6KSE7XG4gICAgICBmb3IgKGxldCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB0cmFpdC5oYW5kbGVyO1xuICAgICAgICBzd2l0Y2ggKHRyYWl0LnN0YXRlKSB7XG4gICAgICAgICAgY2FzZSBUcmFpdFN0YXRlLlNraXBwZWQ6XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBjYXNlIFRyYWl0U3RhdGUuUGVuZGluZzpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVzb2x2aW5nIGEgdHJhaXQgdGhhdCBoYXNuJ3QgYmVlbiBhbmFseXplZDogJHtjbGF6ei5uYW1lLnRleHR9IC8gJHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YodHJhaXQuaGFuZGxlcikuY29uc3RydWN0b3IubmFtZX1gKTtcbiAgICAgICAgICBjYXNlIFRyYWl0U3RhdGUuUmVzb2x2ZWQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc29sdmluZyBhbiBhbHJlYWR5IHJlc29sdmVkIHRyYWl0YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHJhaXQuYW5hbHlzaXMgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBObyBhbmFseXNpcyByZXN1bHRzLCBjYW5ub3QgZnVydGhlciBwcm9jZXNzIHRoaXMgdHJhaXQuXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlci5yZXNvbHZlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBObyByZXNvbHV0aW9uIG9mIHRoaXMgdHJhaXQgbmVlZGVkIC0gaXQncyBjb25zaWRlcmVkIHN1Y2Nlc3NmdWwgYnkgZGVmYXVsdC5cbiAgICAgICAgICB0cmFpdCA9IHRyYWl0LnRvUmVzb2x2ZWQobnVsbCwgbnVsbCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVzdWx0OiBSZXNvbHZlUmVzdWx0PHVua25vd24+O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIucmVzb2x2ZShjbGF6eiwgdHJhaXQuYW5hbHlzaXMgYXMgUmVhZG9ubHk8dW5rbm93bj4pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRmF0YWxEaWFnbm9zdGljRXJyb3IpIHtcbiAgICAgICAgICAgIHRyYWl0ID0gdHJhaXQudG9SZXNvbHZlZChudWxsLCBbZXJyLnRvRGlhZ25vc3RpYygpXSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRyYWl0ID0gdHJhaXQudG9SZXNvbHZlZChyZXN1bHQuZGF0YSA/PyBudWxsLCByZXN1bHQuZGlhZ25vc3RpY3MgPz8gbnVsbCk7XG5cbiAgICAgICAgaWYgKHJlc3VsdC5yZWV4cG9ydHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IGZpbGVOYW1lID0gY2xhenouZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lO1xuICAgICAgICAgIGlmICghdGhpcy5yZWV4cG9ydE1hcC5oYXMoZmlsZU5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLnJlZXhwb3J0TWFwLnNldChmaWxlTmFtZSwgbmV3IE1hcDxzdHJpbmcsIFtzdHJpbmcsIHN0cmluZ10+KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaWxlUmVleHBvcnRzID0gdGhpcy5yZWV4cG9ydE1hcC5nZXQoZmlsZU5hbWUpITtcbiAgICAgICAgICBmb3IgKGNvbnN0IHJlZXhwb3J0IG9mIHJlc3VsdC5yZWV4cG9ydHMpIHtcbiAgICAgICAgICAgIGZpbGVSZWV4cG9ydHMuc2V0KHJlZXhwb3J0LmFzQWxpYXMsIFtyZWV4cG9ydC5mcm9tTW9kdWxlLCByZWV4cG9ydC5zeW1ib2xOYW1lXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBpbnRvIHRoZSBgVHlwZUNoZWNrQ29udGV4dGAgZm9yIGFueSBjb21wb25lbnRzIHdpdGhpbiB0aGUgZ2l2ZW5cbiAgICogYHRzLlNvdXJjZUZpbGVgLlxuICAgKi9cbiAgdHlwZUNoZWNrKHNmOiB0cy5Tb3VyY2VGaWxlLCBjdHg6IFR5cGVDaGVja0NvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZmlsZVRvQ2xhc3Nlcy5oYXMoc2YpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBjbGF6eiBvZiB0aGlzLmZpbGVUb0NsYXNzZXMuZ2V0KHNmKSEpIHtcbiAgICAgIGNvbnN0IHJlY29yZCA9IHRoaXMuY2xhc3Nlcy5nZXQoY2xhenopITtcbiAgICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgICBpZiAodHJhaXQuc3RhdGUgIT09IFRyYWl0U3RhdGUuUmVzb2x2ZWQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFpdC5oYW5kbGVyLnR5cGVDaGVjayA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWl0LnJlc29sdXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLnR5cGVDaGVjayhjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbmRleChjdHg6IEluZGV4aW5nQ29udGV4dCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgY2xhenogb2YgdGhpcy5jbGFzc2VzLmtleXMoKSkge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5jbGFzc2VzLmdldChjbGF6eikhO1xuICAgICAgZm9yIChjb25zdCB0cmFpdCBvZiByZWNvcmQudHJhaXRzKSB7XG4gICAgICAgIGlmICh0cmFpdC5zdGF0ZSAhPT0gVHJhaXRTdGF0ZS5SZXNvbHZlZCkge1xuICAgICAgICAgIC8vIFNraXAgdHJhaXRzIHRoYXQgaGF2ZW4ndCBiZWVuIHJlc29sdmVkIHN1Y2Nlc3NmdWxseS5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0cmFpdC5oYW5kbGVyLmluZGV4ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBTa2lwIHRyYWl0cyB0aGF0IGRvbid0IGFmZmVjdCBpbmRleGluZy5cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFpdC5yZXNvbHV0aW9uICE9PSBudWxsKSB7XG4gICAgICAgICAgdHJhaXQuaGFuZGxlci5pbmRleChjdHgsIGNsYXp6LCB0cmFpdC5hbmFseXNpcywgdHJhaXQucmVzb2x1dGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb21waWxlKGNsYXp6OiBEZWNsYXJhdGlvbk5vZGUsIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKTogQ29tcGlsZVJlc3VsdFtdfG51bGwge1xuICAgIGNvbnN0IG9yaWdpbmFsID0gdHMuZ2V0T3JpZ2luYWxOb2RlKGNsYXp6KSBhcyB0eXBlb2YgY2xheno7XG4gICAgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKGNsYXp6KSB8fCAhdGhpcy5yZWZsZWN0b3IuaXNDbGFzcyhvcmlnaW5hbCkgfHxcbiAgICAgICAgIXRoaXMuY2xhc3Nlcy5oYXMob3JpZ2luYWwpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KG9yaWdpbmFsKSE7XG5cbiAgICBsZXQgcmVzOiBDb21waWxlUmVzdWx0W10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgaWYgKHRyYWl0LnN0YXRlICE9PSBUcmFpdFN0YXRlLlJlc29sdmVkIHx8IHRyYWl0LmFuYWx5c2lzRGlhZ25vc3RpY3MgIT09IG51bGwgfHxcbiAgICAgICAgICB0cmFpdC5yZXNvbHZlRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgICAgLy8gQ2Fubm90IGNvbXBpbGUgYSB0cmFpdCB0aGF0IGlzIG5vdCByZXNvbHZlZCwgb3IgaGFkIGFueSBlcnJvcnMgaW4gaXRzIGRlY2xhcmF0aW9uLlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tcGlsZVNwYW4gPSB0aGlzLnBlcmYuc3RhcnQoJ2NvbXBpbGVDbGFzcycsIG9yaWdpbmFsKTtcblxuXG4gICAgICAvLyBgdHJhaXQucmVzb2x1dGlvbmAgaXMgbm9uLW51bGwgYXNzZXJ0ZWQgaGVyZSBiZWNhdXNlIFR5cGVTY3JpcHQgZG9lcyBub3QgcmVjb2duaXplIHRoYXRcbiAgICAgIC8vIGBSZWFkb25seTx1bmtub3duPmAgaXMgbnVsbGFibGUgKGFzIGB1bmtub3duYCBpdHNlbGYgaXMgbnVsbGFibGUpIGR1ZSB0byB0aGUgd2F5IHRoYXRcbiAgICAgIC8vIGBSZWFkb25seWAgd29ya3MuXG5cbiAgICAgIGxldCBjb21waWxlUmVzOiBDb21waWxlUmVzdWx0fENvbXBpbGVSZXN1bHRbXTtcbiAgICAgIGlmICh0aGlzLmNvbXBpbGF0aW9uTW9kZSA9PT0gQ29tcGlsYXRpb25Nb2RlLlBBUlRJQUwgJiZcbiAgICAgICAgICB0cmFpdC5oYW5kbGVyLmNvbXBpbGVQYXJ0aWFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcGlsZVJlcyA9IHRyYWl0LmhhbmRsZXIuY29tcGlsZVBhcnRpYWwoY2xhenosIHRyYWl0LmFuYWx5c2lzLCB0cmFpdC5yZXNvbHV0aW9uISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21waWxlUmVzID1cbiAgICAgICAgICAgIHRyYWl0LmhhbmRsZXIuY29tcGlsZUZ1bGwoY2xhenosIHRyYWl0LmFuYWx5c2lzLCB0cmFpdC5yZXNvbHV0aW9uISwgY29uc3RhbnRQb29sKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29tcGlsZU1hdGNoUmVzID0gY29tcGlsZVJlcztcbiAgICAgIHRoaXMucGVyZi5zdG9wKGNvbXBpbGVTcGFuKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvbXBpbGVNYXRjaFJlcykpIHtcbiAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgY29tcGlsZU1hdGNoUmVzKSB7XG4gICAgICAgICAgaWYgKCFyZXMuc29tZShyID0+IHIubmFtZSA9PT0gcmVzdWx0Lm5hbWUpKSB7XG4gICAgICAgICAgICByZXMucHVzaChyZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghcmVzLnNvbWUocmVzdWx0ID0+IHJlc3VsdC5uYW1lID09PSBjb21waWxlTWF0Y2hSZXMubmFtZSkpIHtcbiAgICAgICAgcmVzLnB1c2goY29tcGlsZU1hdGNoUmVzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb29rIHVwIHRoZSAuZC50cyB0cmFuc2Zvcm1lciBmb3IgdGhlIGlucHV0IGZpbGUgYW5kIHJlY29yZCB0aGF0IGF0IGxlYXN0IG9uZSBmaWVsZCB3YXNcbiAgICAvLyBnZW5lcmF0ZWQsIHdoaWNoIHdpbGwgYWxsb3cgdGhlIC5kLnRzIHRvIGJlIHRyYW5zZm9ybWVkIGxhdGVyLlxuICAgIHRoaXMuZHRzVHJhbnNmb3Jtcy5nZXRJdnlEZWNsYXJhdGlvblRyYW5zZm9ybShvcmlnaW5hbC5nZXRTb3VyY2VGaWxlKCkpXG4gICAgICAgIC5hZGRGaWVsZHMob3JpZ2luYWwsIHJlcyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIGluc3RydWN0aW9uIHRvIHRoZSB0cmFuc2Zvcm1lciBzbyB0aGUgZmllbGRzIHdpbGwgYmUgYWRkZWQuXG4gICAgcmV0dXJuIHJlcy5sZW5ndGggPiAwID8gcmVzIDogbnVsbDtcbiAgfVxuXG4gIGRlY29yYXRvcnNGb3Iobm9kZTogdHMuRGVjbGFyYXRpb24pOiB0cy5EZWNvcmF0b3JbXSB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSB0cy5nZXRPcmlnaW5hbE5vZGUobm9kZSkgYXMgdHlwZW9mIG5vZGU7XG4gICAgaWYgKCF0aGlzLnJlZmxlY3Rvci5pc0NsYXNzKG9yaWdpbmFsKSB8fCAhdGhpcy5jbGFzc2VzLmhhcyhvcmlnaW5hbCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvcmQgPSB0aGlzLmNsYXNzZXMuZ2V0KG9yaWdpbmFsKSE7XG4gICAgY29uc3QgZGVjb3JhdG9yczogdHMuRGVjb3JhdG9yW10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgaWYgKHRyYWl0LnN0YXRlICE9PSBUcmFpdFN0YXRlLlJlc29sdmVkKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHJhaXQuZGV0ZWN0ZWQudHJpZ2dlciAhPT0gbnVsbCAmJiB0cy5pc0RlY29yYXRvcih0cmFpdC5kZXRlY3RlZC50cmlnZ2VyKSkge1xuICAgICAgICBkZWNvcmF0b3JzLnB1c2godHJhaXQuZGV0ZWN0ZWQudHJpZ2dlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29yYXRvcnM7XG4gIH1cblxuICBnZXQgZGlhZ25vc3RpY3MoKTogUmVhZG9ubHlBcnJheTx0cy5EaWFnbm9zdGljPiB7XG4gICAgY29uc3QgZGlhZ25vc3RpY3M6IHRzLkRpYWdub3N0aWNbXSA9IFtdO1xuICAgIGZvciAoY29uc3QgY2xhenogb2YgdGhpcy5jbGFzc2VzLmtleXMoKSkge1xuICAgICAgY29uc3QgcmVjb3JkID0gdGhpcy5jbGFzc2VzLmdldChjbGF6eikhO1xuICAgICAgaWYgKHJlY29yZC5tZXRhRGlhZ25vc3RpY3MgIT09IG51bGwpIHtcbiAgICAgICAgZGlhZ25vc3RpY3MucHVzaCguLi5yZWNvcmQubWV0YURpYWdub3N0aWNzKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgdHJhaXQgb2YgcmVjb3JkLnRyYWl0cykge1xuICAgICAgICBpZiAoKHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLkFuYWx5emVkIHx8IHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlJlc29sdmVkKSAmJlxuICAgICAgICAgICAgdHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHJhaXQuYW5hbHlzaXNEaWFnbm9zdGljcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYWl0LnN0YXRlID09PSBUcmFpdFN0YXRlLlJlc29sdmVkICYmIHRyYWl0LnJlc29sdmVEaWFnbm9zdGljcyAhPT0gbnVsbCkge1xuICAgICAgICAgIGRpYWdub3N0aWNzLnB1c2goLi4udHJhaXQucmVzb2x2ZURpYWdub3N0aWNzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlhZ25vc3RpY3M7XG4gIH1cblxuICBnZXQgZXhwb3J0U3RhdGVtZW50cygpOiBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBbc3RyaW5nLCBzdHJpbmddPj4ge1xuICAgIHJldHVybiB0aGlzLnJlZXhwb3J0TWFwO1xuICB9XG59XG4iXX0=