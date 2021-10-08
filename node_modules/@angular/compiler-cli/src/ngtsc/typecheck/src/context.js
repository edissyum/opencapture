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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/context", ["require", "exports", "tslib", "@angular/compiler-cli/src/ngtsc/diagnostics", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/dom", "@angular/compiler-cli/src/ngtsc/typecheck/src/environment", "@angular/compiler-cli/src/ngtsc/typecheck/src/oob", "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeCheckContextImpl = exports.InliningMode = void 0;
    var tslib_1 = require("tslib");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/diagnostics");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var diagnostics_2 = require("@angular/compiler-cli/src/ngtsc/typecheck/diagnostics");
    var dom_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/dom");
    var environment_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/environment");
    var oob_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/oob");
    var tcb_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util");
    var type_check_block_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_block");
    var type_check_file_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_check_file");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    /**
     * How a type-checking context should handle operations which would require inlining.
     */
    var InliningMode;
    (function (InliningMode) {
        /**
         * Use inlining operations when required.
         */
        InliningMode[InliningMode["InlineOps"] = 0] = "InlineOps";
        /**
         * Produce diagnostics if an operation would require inlining.
         */
        InliningMode[InliningMode["Error"] = 1] = "Error";
    })(InliningMode = exports.InliningMode || (exports.InliningMode = {}));
    /**
     * A template type checking context for a program.
     *
     * The `TypeCheckContext` allows registration of components and their templates which need to be
     * type checked.
     */
    var TypeCheckContextImpl = /** @class */ (function () {
        function TypeCheckContextImpl(config, compilerHost, componentMappingStrategy, refEmitter, reflector, host, inlining, perf) {
            this.config = config;
            this.compilerHost = compilerHost;
            this.componentMappingStrategy = componentMappingStrategy;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.host = host;
            this.inlining = inlining;
            this.perf = perf;
            this.fileMap = new Map();
            /**
             * A `Map` of `ts.SourceFile`s that the context has seen to the operations (additions of methods
             * or type-check blocks) that need to be eventually performed on that file.
             */
            this.opMap = new Map();
            /**
             * Tracks when an a particular class has a pending type constructor patching operation already
             * queued.
             */
            this.typeCtorPending = new Set();
            if (inlining === InliningMode.Error && config.useInlineTypeConstructors) {
                // We cannot use inlining for type checking since this environment does not support it.
                throw new Error("AssertionError: invalid inlining configuration.");
            }
        }
        /**
         * Register a template to potentially be type-checked.
         *
         * Implements `TypeCheckContext.addTemplate`.
         */
        TypeCheckContextImpl.prototype.addTemplate = function (ref, binder, template, pipes, schemas, sourceMapping, file, parseErrors) {
            var e_1, _a;
            if (!this.host.shouldCheckComponent(ref.node)) {
                return;
            }
            var fileData = this.dataForFile(ref.node.getSourceFile());
            var shimData = this.pendingShimForComponent(ref.node);
            var templateId = fileData.sourceManager.getTemplateId(ref.node);
            var templateDiagnostics = [];
            if (parseErrors !== null) {
                templateDiagnostics.push.apply(templateDiagnostics, tslib_1.__spread(this.getTemplateDiagnostics(parseErrors, templateId, sourceMapping)));
            }
            var boundTarget = binder.bind({ template: template });
            if (this.inlining === InliningMode.InlineOps) {
                try {
                    // Get all of the directives used in the template and record inline type constructors when
                    // required.
                    for (var _b = tslib_1.__values(boundTarget.getUsedDirectives()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var dir = _c.value;
                        var dirRef = dir.ref;
                        var dirNode = dirRef.node;
                        if (!dir.isGeneric || !type_constructor_1.requiresInlineTypeCtor(dirNode, this.reflector)) {
                            // inlining not required
                            continue;
                        }
                        // Add an inline type constructor operation for the directive.
                        this.addInlineTypeCtor(fileData, dirNode.getSourceFile(), dirRef, {
                            fnName: 'ngTypeCtor',
                            // The constructor should have a body if the directive comes from a .ts file, but not if
                            // it comes from a .d.ts file. .d.ts declarations don't have bodies.
                            body: !dirNode.getSourceFile().isDeclarationFile,
                            fields: {
                                inputs: dir.inputs.classPropertyNames,
                                outputs: dir.outputs.classPropertyNames,
                                // TODO(alxhub): support queries
                                queries: dir.queries,
                            },
                            coercedInputFields: dir.coercedInputFields,
                        });
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            shimData.templates.set(templateId, {
                template: template,
                boundTarget: boundTarget,
                templateDiagnostics: templateDiagnostics,
            });
            var inliningRequirement = tcb_util_1.requiresInlineTypeCheckBlock(ref.node, pipes, this.reflector);
            // If inlining is not supported, but is required for either the TCB or one of its directive
            // dependencies, then exit here with an error.
            if (this.inlining === InliningMode.Error &&
                inliningRequirement === tcb_util_1.TcbInliningRequirement.MustInline) {
                // This template cannot be supported because the underlying strategy does not support inlining
                // and inlining would be required.
                // Record diagnostics to indicate the issues with this template.
                shimData.oobRecorder.requiresInlineTcb(templateId, ref.node);
                // Checking this template would be unsupported, so don't try.
                this.perf.eventCount(perf_1.PerfEvent.SkipGenerateTcbNoInline);
                return;
            }
            var meta = {
                id: fileData.sourceManager.captureSource(ref.node, sourceMapping, file),
                boundTarget: boundTarget,
                pipes: pipes,
                schemas: schemas,
            };
            this.perf.eventCount(perf_1.PerfEvent.GenerateTcb);
            if (inliningRequirement !== tcb_util_1.TcbInliningRequirement.None &&
                this.inlining === InliningMode.InlineOps) {
                // This class didn't meet the requirements for external type checking, so generate an inline
                // TCB for the class.
                this.addInlineTypeCheckBlock(fileData, shimData, ref, meta);
            }
            else if (inliningRequirement === tcb_util_1.TcbInliningRequirement.ShouldInlineForGenericBounds &&
                this.inlining === InliningMode.Error) {
                // It's suggested that this TCB should be generated inline due to the component's generic
                // bounds, but inlining is not supported by the current environment. Use a non-inline type
                // check block, but fall back to `any` generic parameters since the generic bounds can't be
                // referenced in that context. This will infer a less useful type for the component, but allow
                // for type-checking it in an environment where that would not be possible otherwise.
                shimData.file.addTypeCheckBlock(ref, meta, shimData.domSchemaChecker, shimData.oobRecorder, type_check_block_1.TcbGenericContextBehavior.FallbackToAny);
            }
            else {
                shimData.file.addTypeCheckBlock(ref, meta, shimData.domSchemaChecker, shimData.oobRecorder, type_check_block_1.TcbGenericContextBehavior.UseEmitter);
            }
        };
        /**
         * Record a type constructor for the given `node` with the given `ctorMetadata`.
         */
        TypeCheckContextImpl.prototype.addInlineTypeCtor = function (fileData, sf, ref, ctorMeta) {
            if (this.typeCtorPending.has(ref.node)) {
                return;
            }
            this.typeCtorPending.add(ref.node);
            // Lazily construct the operation map.
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            // Push a `TypeCtorOp` into the operation queue for the source file.
            ops.push(new TypeCtorOp(ref, ctorMeta));
            fileData.hasInlines = true;
        };
        /**
         * Transform a `ts.SourceFile` into a version that includes type checking code.
         *
         * If this particular `ts.SourceFile` requires changes, the text representing its new contents
         * will be returned. Otherwise, a `null` return indicates no changes were necessary.
         */
        TypeCheckContextImpl.prototype.transform = function (sf) {
            var _this = this;
            // If there are no operations pending for this particular file, return `null` to indicate no
            // changes.
            if (!this.opMap.has(sf)) {
                return null;
            }
            // Imports may need to be added to the file to support type-checking of directives used in the
            // template within it.
            var importManager = new translator_1.ImportManager(new imports_1.NoopImportRewriter(), '_i');
            // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
            // original source text into chunks at these split points, where code will be inserted between
            // the chunks.
            var ops = this.opMap.get(sf).sort(orderOps);
            var textParts = splitStringAtPoints(sf.text, ops.map(function (op) { return op.splitPoint; }));
            // Use a `ts.Printer` to generate source code.
            var printer = ts.createPrinter({ omitTrailingSemicolon: true });
            // Begin with the intial section of the code text.
            var code = textParts[0];
            // Process each operation and use the printer to generate source code for it, inserting it into
            // the source code in between the original chunks.
            ops.forEach(function (op, idx) {
                var text = op.execute(importManager, sf, _this.refEmitter, printer);
                code += '\n\n' + text + textParts[idx + 1];
            });
            // Write out the imports that need to be added to the beginning of the file.
            var imports = importManager.getAllImports(sf.fileName)
                .map(function (i) { return "import * as " + i.qualifier.text + " from '" + i.specifier + "';"; })
                .join('\n');
            code = imports + '\n' + code;
            return code;
        };
        TypeCheckContextImpl.prototype.finalize = function () {
            var e_2, _a, e_3, _b, e_4, _c;
            // First, build the map of updates to source files.
            var updates = new Map();
            try {
                for (var _d = tslib_1.__values(this.opMap.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var originalSf = _e.value;
                    var newText = this.transform(originalSf);
                    if (newText !== null) {
                        updates.set(file_system_1.absoluteFromSourceFile(originalSf), newText);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                // Then go through each input file that has pending code generation operations.
                for (var _f = tslib_1.__values(this.fileMap), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var _h = tslib_1.__read(_g.value, 2), sfPath = _h[0], pendingFileData = _h[1];
                    try {
                        // For each input file, consider generation operations for each of its shims.
                        for (var _j = (e_4 = void 0, tslib_1.__values(pendingFileData.shimData.values())), _k = _j.next(); !_k.done; _k = _j.next()) {
                            var pendingShimData = _k.value;
                            this.host.recordShimData(sfPath, {
                                genesisDiagnostics: tslib_1.__spread(pendingShimData.domSchemaChecker.diagnostics, pendingShimData.oobRecorder.diagnostics),
                                hasInlines: pendingFileData.hasInlines,
                                path: pendingShimData.file.fileName,
                                templates: pendingShimData.templates,
                            });
                            updates.set(pendingShimData.file.fileName, pendingShimData.file.render(false /* removeComments */));
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return updates;
        };
        TypeCheckContextImpl.prototype.addInlineTypeCheckBlock = function (fileData, shimData, ref, tcbMeta) {
            var sf = ref.node.getSourceFile();
            if (!this.opMap.has(sf)) {
                this.opMap.set(sf, []);
            }
            var ops = this.opMap.get(sf);
            ops.push(new InlineTcbOp(ref, tcbMeta, this.config, this.reflector, shimData.domSchemaChecker, shimData.oobRecorder));
            fileData.hasInlines = true;
        };
        TypeCheckContextImpl.prototype.pendingShimForComponent = function (node) {
            var fileData = this.dataForFile(node.getSourceFile());
            var shimPath = this.componentMappingStrategy.shimPathForComponent(node);
            if (!fileData.shimData.has(shimPath)) {
                fileData.shimData.set(shimPath, {
                    domSchemaChecker: new dom_1.RegistryDomSchemaChecker(fileData.sourceManager),
                    oobRecorder: new oob_1.OutOfBandDiagnosticRecorderImpl(fileData.sourceManager),
                    file: new type_check_file_1.TypeCheckFile(shimPath, this.config, this.refEmitter, this.reflector, this.compilerHost),
                    templates: new Map(),
                });
            }
            return fileData.shimData.get(shimPath);
        };
        TypeCheckContextImpl.prototype.dataForFile = function (sf) {
            var sfPath = file_system_1.absoluteFromSourceFile(sf);
            if (!this.fileMap.has(sfPath)) {
                var data = {
                    hasInlines: false,
                    sourceManager: this.host.getSourceManager(sfPath),
                    shimData: new Map(),
                };
                this.fileMap.set(sfPath, data);
            }
            return this.fileMap.get(sfPath);
        };
        TypeCheckContextImpl.prototype.getTemplateDiagnostics = function (parseErrors, templateId, sourceMapping) {
            return parseErrors.map(function (error) {
                var span = error.span;
                if (span.start.offset === span.end.offset) {
                    // Template errors can contain zero-length spans, if the error occurs at a single point.
                    // However, TypeScript does not handle displaying a zero-length diagnostic very well, so
                    // increase the ending offset by 1 for such errors, to ensure the position is shown in the
                    // diagnostic.
                    span.end.offset++;
                }
                return diagnostics_2.makeTemplateDiagnostic(templateId, sourceMapping, span, ts.DiagnosticCategory.Error, diagnostics_1.ngErrorCode(diagnostics_1.ErrorCode.TEMPLATE_PARSE_ERROR), error.msg);
            });
        };
        return TypeCheckContextImpl;
    }());
    exports.TypeCheckContextImpl = TypeCheckContextImpl;
    /**
     * A type check block operation which produces inline type check code for a particular component.
     */
    var InlineTcbOp = /** @class */ (function () {
        function InlineTcbOp(ref, meta, config, reflector, domSchemaChecker, oobRecorder) {
            this.ref = ref;
            this.meta = meta;
            this.config = config;
            this.reflector = reflector;
            this.domSchemaChecker = domSchemaChecker;
            this.oobRecorder = oobRecorder;
        }
        Object.defineProperty(InlineTcbOp.prototype, "splitPoint", {
            /**
             * Type check blocks are inserted immediately after the end of the component class.
             */
            get: function () {
                return this.ref.node.end + 1;
            },
            enumerable: false,
            configurable: true
        });
        InlineTcbOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var env = new environment_1.Environment(this.config, im, refEmitter, this.reflector, sf);
            var fnName = ts.createIdentifier("_tcb_" + this.ref.node.pos);
            // Inline TCBs should copy any generic type parameter nodes directly, as the TCB code is inlined
            // into the class in a context where that will always be legal.
            var fn = type_check_block_1.generateTypeCheckBlock(env, this.ref, fnName, this.meta, this.domSchemaChecker, this.oobRecorder, type_check_block_1.TcbGenericContextBehavior.CopyClassNodes);
            return printer.printNode(ts.EmitHint.Unspecified, fn, sf);
        };
        return InlineTcbOp;
    }());
    /**
     * A type constructor operation which produces type constructor code for a particular directive.
     */
    var TypeCtorOp = /** @class */ (function () {
        function TypeCtorOp(ref, meta) {
            this.ref = ref;
            this.meta = meta;
        }
        Object.defineProperty(TypeCtorOp.prototype, "splitPoint", {
            /**
             * Type constructor operations are inserted immediately before the end of the directive class.
             */
            get: function () {
                return this.ref.node.end - 1;
            },
            enumerable: false,
            configurable: true
        });
        TypeCtorOp.prototype.execute = function (im, sf, refEmitter, printer) {
            var tcb = type_constructor_1.generateInlineTypeCtor(this.ref.node, this.meta);
            return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
        };
        return TypeCtorOp;
    }());
    /**
     * Compare two operations and return their split point ordering.
     */
    function orderOps(op1, op2) {
        return op1.splitPoint - op2.splitPoint;
    }
    /**
     * Split a string into chunks at any number of split points.
     */
    function splitStringAtPoints(str, points) {
        var splits = [];
        var start = 0;
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            splits.push(str.substring(start, point));
            start = point;
        }
        splits.push(str.substring(start));
        return splits;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwyRUFBbUY7SUFDbkYsK0JBQWlDO0lBRWpDLDJFQUF5RTtJQUN6RSxtRUFBOEU7SUFDOUUsNkRBQW1EO0lBRW5ELHlFQUErQztJQUUvQyxxRkFBMEU7SUFFMUUseUVBQWlFO0lBQ2pFLHlGQUEwQztJQUMxQyx5RUFBbUY7SUFFbkYsbUZBQWdGO0lBQ2hGLG1HQUFxRjtJQUNyRixpR0FBZ0Q7SUFDaEQsbUdBQWtGO0lBOEhsRjs7T0FFRztJQUNILElBQVksWUFVWDtJQVZELFdBQVksWUFBWTtRQUN0Qjs7V0FFRztRQUNILHlEQUFTLENBQUE7UUFFVDs7V0FFRztRQUNILGlEQUFLLENBQUE7SUFDUCxDQUFDLEVBVlcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFVdkI7SUFFRDs7Ozs7T0FLRztJQUNIO1FBR0UsOEJBQ1ksTUFBMEIsRUFDMUIsWUFBMkQsRUFDM0Qsd0JBQXdELEVBQ3hELFVBQTRCLEVBQVUsU0FBeUIsRUFDL0QsSUFBc0IsRUFBVSxRQUFzQixFQUFVLElBQWtCO1lBSmxGLFdBQU0sR0FBTixNQUFNLENBQW9CO1lBQzFCLGlCQUFZLEdBQVosWUFBWSxDQUErQztZQUMzRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQWdDO1lBQ3hELGVBQVUsR0FBVixVQUFVLENBQWtCO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBZ0I7WUFDL0QsU0FBSSxHQUFKLElBQUksQ0FBa0I7WUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFjO1lBQVUsU0FBSSxHQUFKLElBQUksQ0FBYztZQVB0RixZQUFPLEdBQUcsSUFBSSxHQUFHLEVBQStDLENBQUM7WUFj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Q0FBQztZQUN6QyxLQUFLLEdBQUcsS0FBSyxDQUFDO1NBQ2Y7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQyxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Qm91bmRUYXJnZXQsIFBhcnNlRXJyb3IsIFBhcnNlU291cmNlRmlsZSwgUjNUYXJnZXRCaW5kZXIsIFNjaGVtYU1ldGFkYXRhLCBUZW1wbGF0ZVBhcnNlRXJyb3IsIFRtcGxBc3ROb2RlfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQge0Vycm9yQ29kZSwgbmdFcnJvckNvZGV9IGZyb20gJ0Bhbmd1bGFyL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvZGlhZ25vc3RpY3MnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YWJzb2x1dGVGcm9tU291cmNlRmlsZSwgQWJzb2x1dGVGc1BhdGh9IGZyb20gJy4uLy4uL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Tm9vcEltcG9ydFJld3JpdGVyLCBSZWZlcmVuY2UsIFJlZmVyZW5jZUVtaXR0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtQZXJmRXZlbnQsIFBlcmZSZWNvcmRlcn0gZnJvbSAnLi4vLi4vcGVyZic7XG5pbXBvcnQge0NsYXNzRGVjbGFyYXRpb24sIFJlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi8uLi9yZWZsZWN0aW9uJztcbmltcG9ydCB7SW1wb3J0TWFuYWdlcn0gZnJvbSAnLi4vLi4vdHJhbnNsYXRvcic7XG5pbXBvcnQge0NvbXBvbmVudFRvU2hpbU1hcHBpbmdTdHJhdGVneSwgVGVtcGxhdGVJZCwgVGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YSwgVHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgVHlwZUNoZWNrQ29udGV4dCwgVHlwZUNoZWNraW5nQ29uZmlnLCBUeXBlQ3Rvck1ldGFkYXRhfSBmcm9tICcuLi9hcGknO1xuaW1wb3J0IHttYWtlVGVtcGxhdGVEaWFnbm9zdGljLCBUZW1wbGF0ZURpYWdub3N0aWN9IGZyb20gJy4uL2RpYWdub3N0aWNzJztcblxuaW1wb3J0IHtEb21TY2hlbWFDaGVja2VyLCBSZWdpc3RyeURvbVNjaGVtYUNoZWNrZXJ9IGZyb20gJy4vZG9tJztcbmltcG9ydCB7RW52aXJvbm1lbnR9IGZyb20gJy4vZW52aXJvbm1lbnQnO1xuaW1wb3J0IHtPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXIsIE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlckltcGx9IGZyb20gJy4vb29iJztcbmltcG9ydCB7VGVtcGxhdGVTb3VyY2VNYW5hZ2VyfSBmcm9tICcuL3NvdXJjZSc7XG5pbXBvcnQge3JlcXVpcmVzSW5saW5lVHlwZUNoZWNrQmxvY2ssIFRjYklubGluaW5nUmVxdWlyZW1lbnR9IGZyb20gJy4vdGNiX3V0aWwnO1xuaW1wb3J0IHtnZW5lcmF0ZVR5cGVDaGVja0Jsb2NrLCBUY2JHZW5lcmljQ29udGV4dEJlaGF2aW9yfSBmcm9tICcuL3R5cGVfY2hlY2tfYmxvY2snO1xuaW1wb3J0IHtUeXBlQ2hlY2tGaWxlfSBmcm9tICcuL3R5cGVfY2hlY2tfZmlsZSc7XG5pbXBvcnQge2dlbmVyYXRlSW5saW5lVHlwZUN0b3IsIHJlcXVpcmVzSW5saW5lVHlwZUN0b3J9IGZyb20gJy4vdHlwZV9jb25zdHJ1Y3Rvcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hpbVR5cGVDaGVja2luZ0RhdGEge1xuICAvKipcbiAgICogUGF0aCB0byB0aGUgc2hpbSBmaWxlLlxuICAgKi9cbiAgcGF0aDogQWJzb2x1dGVGc1BhdGg7XG5cbiAgLyoqXG4gICAqIEFueSBgdHMuRGlhZ25vc3RpY2BzIHdoaWNoIHdlcmUgcHJvZHVjZWQgZHVyaW5nIHRoZSBnZW5lcmF0aW9uIG9mIHRoaXMgc2hpbS5cbiAgICpcbiAgICogU29tZSBkaWFnbm9zdGljcyBhcmUgcHJvZHVjZWQgZHVyaW5nIGNyZWF0aW9uIHRpbWUgYW5kIGFyZSB0cmFja2VkIGhlcmUuXG4gICAqL1xuICBnZW5lc2lzRGlhZ25vc3RpY3M6IFRlbXBsYXRlRGlhZ25vc3RpY1tdO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGFueSBpbmxpbmUgb3BlcmF0aW9ucyBmb3IgdGhlIGlucHV0IGZpbGUgd2VyZSByZXF1aXJlZCB0byBnZW5lcmF0ZSB0aGlzIHNoaW0uXG4gICAqL1xuICBoYXNJbmxpbmVzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBNYXAgb2YgYFRlbXBsYXRlSWRgIHRvIGluZm9ybWF0aW9uIGNvbGxlY3RlZCBhYm91dCB0aGUgdGVtcGxhdGUgZHVyaW5nIHRoZSB0ZW1wbGF0ZVxuICAgKiB0eXBlLWNoZWNraW5nIHByb2Nlc3MuXG4gICAqL1xuICB0ZW1wbGF0ZXM6IE1hcDxUZW1wbGF0ZUlkLCBUZW1wbGF0ZURhdGE+O1xufVxuXG4vKipcbiAqIERhdGEgdHJhY2tlZCBmb3IgZWFjaCB0ZW1wbGF0ZSBwcm9jZXNzZWQgYnkgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgc3lzdGVtLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFRlbXBsYXRlRGF0YSB7XG4gIC8qKlxuICAgKiBUZW1wbGF0ZSBub2RlcyBmb3Igd2hpY2ggdGhlIFRDQiB3YXMgZ2VuZXJhdGVkLlxuICAgKi9cbiAgdGVtcGxhdGU6IFRtcGxBc3ROb2RlW107XG5cbiAgLyoqXG4gICAqIGBCb3VuZFRhcmdldGAgd2hpY2ggd2FzIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIFRDQiwgYW5kIGNvbnRhaW5zIGJpbmRpbmdzIGZvciB0aGUgYXNzb2NpYXRlZFxuICAgKiB0ZW1wbGF0ZSBub2Rlcy5cbiAgICovXG4gIGJvdW5kVGFyZ2V0OiBCb3VuZFRhcmdldDxUeXBlQ2hlY2thYmxlRGlyZWN0aXZlTWV0YT47XG5cbiAgLyoqXG4gICAqIEVycm9ycyBmb3VuZCB3aGlsZSBwYXJzaW5nIHRoZW0gdGVtcGxhdGUsIHdoaWNoIGhhdmUgYmVlbiBjb252ZXJ0ZWQgdG8gZGlhZ25vc3RpY3MuXG4gICAqL1xuICB0ZW1wbGF0ZURpYWdub3N0aWNzOiBUZW1wbGF0ZURpYWdub3N0aWNbXTtcbn1cblxuLyoqXG4gKiBEYXRhIGZvciBhbiBpbnB1dCBmaWxlIHdoaWNoIGlzIHN0aWxsIGluIHRoZSBwcm9jZXNzIG9mIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgY29kZSBnZW5lcmF0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBlbmRpbmdGaWxlVHlwZUNoZWNraW5nRGF0YSB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGFueSBpbmxpbmUgY29kZSBoYXMgYmVlbiByZXF1aXJlZCBieSB0aGUgc2hpbSB5ZXQuXG4gICAqL1xuICBoYXNJbmxpbmVzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTb3VyY2UgbWFwcGluZyBpbmZvcm1hdGlvbiBmb3IgbWFwcGluZyBkaWFnbm9zdGljcyBmcm9tIGlubGluZWQgdHlwZSBjaGVjayBibG9ja3MgYmFjayB0byB0aGVcbiAgICogb3JpZ2luYWwgdGVtcGxhdGUuXG4gICAqL1xuICBzb3VyY2VNYW5hZ2VyOiBUZW1wbGF0ZVNvdXJjZU1hbmFnZXI7XG5cbiAgLyoqXG4gICAqIE1hcCBvZiBpbi1wcm9ncmVzcyBzaGltIGRhdGEgZm9yIHNoaW1zIGdlbmVyYXRlZCBmcm9tIHRoaXMgaW5wdXQgZmlsZS5cbiAgICovXG4gIHNoaW1EYXRhOiBNYXA8QWJzb2x1dGVGc1BhdGgsIFBlbmRpbmdTaGltRGF0YT47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVuZGluZ1NoaW1EYXRhIHtcbiAgLyoqXG4gICAqIFJlY29yZGVyIGZvciBvdXQtb2YtYmFuZCBkaWFnbm9zdGljcyB3aGljaCBhcmUgcmFpc2VkIGR1cmluZyBnZW5lcmF0aW9uLlxuICAgKi9cbiAgb29iUmVjb3JkZXI6IE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlcjtcblxuICAvKipcbiAgICogVGhlIGBEb21TY2hlbWFDaGVja2VyYCBpbiB1c2UgZm9yIHRoaXMgdGVtcGxhdGUsIHdoaWNoIHJlY29yZHMgYW55IHNjaGVtYS1yZWxhdGVkIGRpYWdub3N0aWNzLlxuICAgKi9cbiAgZG9tU2NoZW1hQ2hlY2tlcjogRG9tU2NoZW1hQ2hlY2tlcjtcblxuICAvKipcbiAgICogU2hpbSBmaWxlIGluIHRoZSBwcm9jZXNzIG9mIGJlaW5nIGdlbmVyYXRlZC5cbiAgICovXG4gIGZpbGU6IFR5cGVDaGVja0ZpbGU7XG5cblxuICAvKipcbiAgICogTWFwIG9mIGBUZW1wbGF0ZUlkYCB0byBpbmZvcm1hdGlvbiBjb2xsZWN0ZWQgYWJvdXQgdGhlIHRlbXBsYXRlIGFzIGl0J3MgaW5nZXN0ZWQuXG4gICAqL1xuICB0ZW1wbGF0ZXM6IE1hcDxUZW1wbGF0ZUlkLCBUZW1wbGF0ZURhdGE+O1xufVxuXG4vKipcbiAqIEFkYXB0cyB0aGUgYFR5cGVDaGVja0NvbnRleHRJbXBsYCB0byB0aGUgbGFyZ2VyIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgc3lzdGVtLlxuICpcbiAqIFRocm91Z2ggdGhpcyBpbnRlcmZhY2UsIGEgc2luZ2xlIGBUeXBlQ2hlY2tDb250ZXh0SW1wbGAgKHdoaWNoIHJlcHJlc2VudHMgb25lIFwicGFzc1wiIG9mIHRlbXBsYXRlXG4gKiB0eXBlLWNoZWNraW5nKSByZXF1ZXN0cyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbGFyZ2VyIHN0YXRlIG9mIHR5cGUtY2hlY2tpbmcsIGFzIHdlbGwgYXMgcmVwb3J0c1xuICogYmFjayBpdHMgcmVzdWx0cyBvbmNlIGZpbmFsaXplZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUeXBlQ2hlY2tpbmdIb3N0IHtcbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBgVGVtcGxhdGVTb3VyY2VNYW5hZ2VyYCByZXNwb25zaWJsZSBmb3IgY29tcG9uZW50cyBpbiB0aGUgZ2l2ZW4gaW5wdXQgZmlsZSBwYXRoLlxuICAgKi9cbiAgZ2V0U291cmNlTWFuYWdlcihzZlBhdGg6IEFic29sdXRlRnNQYXRoKTogVGVtcGxhdGVTb3VyY2VNYW5hZ2VyO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGEgcGFydGljdWxhciBjb21wb25lbnQgY2xhc3Mgc2hvdWxkIGJlIGluY2x1ZGVkIGluIHRoZSBjdXJyZW50IHR5cGUtY2hlY2tpbmcgcGFzcy5cbiAgICpcbiAgICogTm90IGFsbCBjb21wb25lbnRzIG9mZmVyZWQgdG8gdGhlIGBUeXBlQ2hlY2tDb250ZXh0YCBmb3IgY2hlY2tpbmcgbWF5IHJlcXVpcmUgcHJvY2Vzc2luZy4gRm9yXG4gICAqIGV4YW1wbGUsIHRoZSBjb21wb25lbnQgbWF5IGhhdmUgcmVzdWx0cyBhbHJlYWR5IGF2YWlsYWJsZSBmcm9tIGEgcHJpb3IgcGFzcyBvciBmcm9tIGEgcHJldmlvdXNcbiAgICogcHJvZ3JhbS5cbiAgICovXG4gIHNob3VsZENoZWNrQ29tcG9uZW50KG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBSZXBvcnQgZGF0YSBmcm9tIGEgc2hpbSBnZW5lcmF0ZWQgZnJvbSB0aGUgZ2l2ZW4gaW5wdXQgZmlsZSBwYXRoLlxuICAgKi9cbiAgcmVjb3JkU2hpbURhdGEoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZGF0YTogU2hpbVR5cGVDaGVja2luZ0RhdGEpOiB2b2lkO1xuXG4gIC8qKlxuICAgKiBSZWNvcmQgdGhhdCBhbGwgb2YgdGhlIGNvbXBvbmVudHMgd2l0aGluIHRoZSBnaXZlbiBpbnB1dCBmaWxlIHBhdGggaGFkIGNvZGUgZ2VuZXJhdGVkIC0gdGhhdFxuICAgKiBpcywgY292ZXJhZ2UgZm9yIHRoZSBmaWxlIGNhbiBiZSBjb25zaWRlcmVkIGNvbXBsZXRlLlxuICAgKi9cbiAgcmVjb3JkQ29tcGxldGUoc2ZQYXRoOiBBYnNvbHV0ZUZzUGF0aCk6IHZvaWQ7XG59XG5cbi8qKlxuICogSG93IGEgdHlwZS1jaGVja2luZyBjb250ZXh0IHNob3VsZCBoYW5kbGUgb3BlcmF0aW9ucyB3aGljaCB3b3VsZCByZXF1aXJlIGlubGluaW5nLlxuICovXG5leHBvcnQgZW51bSBJbmxpbmluZ01vZGUge1xuICAvKipcbiAgICogVXNlIGlubGluaW5nIG9wZXJhdGlvbnMgd2hlbiByZXF1aXJlZC5cbiAgICovXG4gIElubGluZU9wcyxcblxuICAvKipcbiAgICogUHJvZHVjZSBkaWFnbm9zdGljcyBpZiBhbiBvcGVyYXRpb24gd291bGQgcmVxdWlyZSBpbmxpbmluZy5cbiAgICovXG4gIEVycm9yLFxufVxuXG4vKipcbiAqIEEgdGVtcGxhdGUgdHlwZSBjaGVja2luZyBjb250ZXh0IGZvciBhIHByb2dyYW0uXG4gKlxuICogVGhlIGBUeXBlQ2hlY2tDb250ZXh0YCBhbGxvd3MgcmVnaXN0cmF0aW9uIG9mIGNvbXBvbmVudHMgYW5kIHRoZWlyIHRlbXBsYXRlcyB3aGljaCBuZWVkIHRvIGJlXG4gKiB0eXBlIGNoZWNrZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlQ2hlY2tDb250ZXh0SW1wbCBpbXBsZW1lbnRzIFR5cGVDaGVja0NvbnRleHQge1xuICBwcml2YXRlIGZpbGVNYXAgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCBQZW5kaW5nRmlsZVR5cGVDaGVja2luZ0RhdGE+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGNvbmZpZzogVHlwZUNoZWNraW5nQ29uZmlnLFxuICAgICAgcHJpdmF0ZSBjb21waWxlckhvc3Q6IFBpY2s8dHMuQ29tcGlsZXJIb3N0LCAnZ2V0Q2Fub25pY2FsRmlsZU5hbWUnPixcbiAgICAgIHByaXZhdGUgY29tcG9uZW50TWFwcGluZ1N0cmF0ZWd5OiBDb21wb25lbnRUb1NoaW1NYXBwaW5nU3RyYXRlZ3ksXG4gICAgICBwcml2YXRlIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaXZhdGUgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICAgIHByaXZhdGUgaG9zdDogVHlwZUNoZWNraW5nSG9zdCwgcHJpdmF0ZSBpbmxpbmluZzogSW5saW5pbmdNb2RlLCBwcml2YXRlIHBlcmY6IFBlcmZSZWNvcmRlcikge1xuICAgIGlmIChpbmxpbmluZyA9PT0gSW5saW5pbmdNb2RlLkVycm9yICYmIGNvbmZpZy51c2VJbmxpbmVUeXBlQ29uc3RydWN0b3JzKSB7XG4gICAgICAvLyBXZSBjYW5ub3QgdXNlIGlubGluaW5nIGZvciB0eXBlIGNoZWNraW5nIHNpbmNlIHRoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBpdC5cbiAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzZXJ0aW9uRXJyb3I6IGludmFsaWQgaW5saW5pbmcgY29uZmlndXJhdGlvbi5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBgTWFwYCBvZiBgdHMuU291cmNlRmlsZWBzIHRoYXQgdGhlIGNvbnRleHQgaGFzIHNlZW4gdG8gdGhlIG9wZXJhdGlvbnMgKGFkZGl0aW9ucyBvZiBtZXRob2RzXG4gICAqIG9yIHR5cGUtY2hlY2sgYmxvY2tzKSB0aGF0IG5lZWQgdG8gYmUgZXZlbnR1YWxseSBwZXJmb3JtZWQgb24gdGhhdCBmaWxlLlxuICAgKi9cbiAgcHJpdmF0ZSBvcE1hcCA9IG5ldyBNYXA8dHMuU291cmNlRmlsZSwgT3BbXT4oKTtcblxuICAvKipcbiAgICogVHJhY2tzIHdoZW4gYW4gYSBwYXJ0aWN1bGFyIGNsYXNzIGhhcyBhIHBlbmRpbmcgdHlwZSBjb25zdHJ1Y3RvciBwYXRjaGluZyBvcGVyYXRpb24gYWxyZWFkeVxuICAgKiBxdWV1ZWQuXG4gICAqL1xuICBwcml2YXRlIHR5cGVDdG9yUGVuZGluZyA9IG5ldyBTZXQ8dHMuQ2xhc3NEZWNsYXJhdGlvbj4oKTtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSB0ZW1wbGF0ZSB0byBwb3RlbnRpYWxseSBiZSB0eXBlLWNoZWNrZWQuXG4gICAqXG4gICAqIEltcGxlbWVudHMgYFR5cGVDaGVja0NvbnRleHQuYWRkVGVtcGxhdGVgLlxuICAgKi9cbiAgYWRkVGVtcGxhdGUoXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PixcbiAgICAgIGJpbmRlcjogUjNUYXJnZXRCaW5kZXI8VHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGE+LCB0ZW1wbGF0ZTogVG1wbEFzdE5vZGVbXSxcbiAgICAgIHBpcGVzOiBNYXA8c3RyaW5nLCBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4+LFxuICAgICAgc2NoZW1hczogU2NoZW1hTWV0YWRhdGFbXSwgc291cmNlTWFwcGluZzogVGVtcGxhdGVTb3VyY2VNYXBwaW5nLCBmaWxlOiBQYXJzZVNvdXJjZUZpbGUsXG4gICAgICBwYXJzZUVycm9yczogUGFyc2VFcnJvcltdfG51bGwpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaG9zdC5zaG91bGRDaGVja0NvbXBvbmVudChyZWYubm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlRGF0YSA9IHRoaXMuZGF0YUZvckZpbGUocmVmLm5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgICBjb25zdCBzaGltRGF0YSA9IHRoaXMucGVuZGluZ1NoaW1Gb3JDb21wb25lbnQocmVmLm5vZGUpO1xuICAgIGNvbnN0IHRlbXBsYXRlSWQgPSBmaWxlRGF0YS5zb3VyY2VNYW5hZ2VyLmdldFRlbXBsYXRlSWQocmVmLm5vZGUpO1xuXG4gICAgY29uc3QgdGVtcGxhdGVEaWFnbm9zdGljczogVGVtcGxhdGVEaWFnbm9zdGljW10gPSBbXTtcblxuICAgIGlmIChwYXJzZUVycm9ycyAhPT0gbnVsbCkge1xuICAgICAgdGVtcGxhdGVEaWFnbm9zdGljcy5wdXNoKFxuICAgICAgICAgIC4uLnRoaXMuZ2V0VGVtcGxhdGVEaWFnbm9zdGljcyhwYXJzZUVycm9ycywgdGVtcGxhdGVJZCwgc291cmNlTWFwcGluZykpO1xuICAgIH1cblxuICAgIGNvbnN0IGJvdW5kVGFyZ2V0ID0gYmluZGVyLmJpbmQoe3RlbXBsYXRlfSk7XG5cbiAgICBpZiAodGhpcy5pbmxpbmluZyA9PT0gSW5saW5pbmdNb2RlLklubGluZU9wcykge1xuICAgICAgLy8gR2V0IGFsbCBvZiB0aGUgZGlyZWN0aXZlcyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSBhbmQgcmVjb3JkIGlubGluZSB0eXBlIGNvbnN0cnVjdG9ycyB3aGVuXG4gICAgICAvLyByZXF1aXJlZC5cbiAgICAgIGZvciAoY29uc3QgZGlyIG9mIGJvdW5kVGFyZ2V0LmdldFVzZWREaXJlY3RpdmVzKCkpIHtcbiAgICAgICAgY29uc3QgZGlyUmVmID0gZGlyLnJlZiBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG4gICAgICAgIGNvbnN0IGRpck5vZGUgPSBkaXJSZWYubm9kZTtcblxuICAgICAgICBpZiAoIWRpci5pc0dlbmVyaWMgfHwgIXJlcXVpcmVzSW5saW5lVHlwZUN0b3IoZGlyTm9kZSwgdGhpcy5yZWZsZWN0b3IpKSB7XG4gICAgICAgICAgLy8gaW5saW5pbmcgbm90IHJlcXVpcmVkXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgYW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3Igb3BlcmF0aW9uIGZvciB0aGUgZGlyZWN0aXZlLlxuICAgICAgICB0aGlzLmFkZElubGluZVR5cGVDdG9yKGZpbGVEYXRhLCBkaXJOb2RlLmdldFNvdXJjZUZpbGUoKSwgZGlyUmVmLCB7XG4gICAgICAgICAgZm5OYW1lOiAnbmdUeXBlQ3RvcicsXG4gICAgICAgICAgLy8gVGhlIGNvbnN0cnVjdG9yIHNob3VsZCBoYXZlIGEgYm9keSBpZiB0aGUgZGlyZWN0aXZlIGNvbWVzIGZyb20gYSAudHMgZmlsZSwgYnV0IG5vdCBpZlxuICAgICAgICAgIC8vIGl0IGNvbWVzIGZyb20gYSAuZC50cyBmaWxlLiAuZC50cyBkZWNsYXJhdGlvbnMgZG9uJ3QgaGF2ZSBib2RpZXMuXG4gICAgICAgICAgYm9keTogIWRpck5vZGUuZ2V0U291cmNlRmlsZSgpLmlzRGVjbGFyYXRpb25GaWxlLFxuICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgaW5wdXRzOiBkaXIuaW5wdXRzLmNsYXNzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIG91dHB1dHM6IGRpci5vdXRwdXRzLmNsYXNzUHJvcGVydHlOYW1lcyxcbiAgICAgICAgICAgIC8vIFRPRE8oYWx4aHViKTogc3VwcG9ydCBxdWVyaWVzXG4gICAgICAgICAgICBxdWVyaWVzOiBkaXIucXVlcmllcyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNvZXJjZWRJbnB1dEZpZWxkczogZGlyLmNvZXJjZWRJbnB1dEZpZWxkcyxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2hpbURhdGEudGVtcGxhdGVzLnNldCh0ZW1wbGF0ZUlkLCB7XG4gICAgICB0ZW1wbGF0ZSxcbiAgICAgIGJvdW5kVGFyZ2V0LFxuICAgICAgdGVtcGxhdGVEaWFnbm9zdGljcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGlubGluaW5nUmVxdWlyZW1lbnQgPSByZXF1aXJlc0lubGluZVR5cGVDaGVja0Jsb2NrKHJlZi5ub2RlLCBwaXBlcywgdGhpcy5yZWZsZWN0b3IpO1xuXG4gICAgLy8gSWYgaW5saW5pbmcgaXMgbm90IHN1cHBvcnRlZCwgYnV0IGlzIHJlcXVpcmVkIGZvciBlaXRoZXIgdGhlIFRDQiBvciBvbmUgb2YgaXRzIGRpcmVjdGl2ZVxuICAgIC8vIGRlcGVuZGVuY2llcywgdGhlbiBleGl0IGhlcmUgd2l0aCBhbiBlcnJvci5cbiAgICBpZiAodGhpcy5pbmxpbmluZyA9PT0gSW5saW5pbmdNb2RlLkVycm9yICYmXG4gICAgICAgIGlubGluaW5nUmVxdWlyZW1lbnQgPT09IFRjYklubGluaW5nUmVxdWlyZW1lbnQuTXVzdElubGluZSkge1xuICAgICAgLy8gVGhpcyB0ZW1wbGF0ZSBjYW5ub3QgYmUgc3VwcG9ydGVkIGJlY2F1c2UgdGhlIHVuZGVybHlpbmcgc3RyYXRlZ3kgZG9lcyBub3Qgc3VwcG9ydCBpbmxpbmluZ1xuICAgICAgLy8gYW5kIGlubGluaW5nIHdvdWxkIGJlIHJlcXVpcmVkLlxuXG4gICAgICAvLyBSZWNvcmQgZGlhZ25vc3RpY3MgdG8gaW5kaWNhdGUgdGhlIGlzc3VlcyB3aXRoIHRoaXMgdGVtcGxhdGUuXG4gICAgICBzaGltRGF0YS5vb2JSZWNvcmRlci5yZXF1aXJlc0lubGluZVRjYih0ZW1wbGF0ZUlkLCByZWYubm9kZSk7XG5cbiAgICAgIC8vIENoZWNraW5nIHRoaXMgdGVtcGxhdGUgd291bGQgYmUgdW5zdXBwb3J0ZWQsIHNvIGRvbid0IHRyeS5cbiAgICAgIHRoaXMucGVyZi5ldmVudENvdW50KFBlcmZFdmVudC5Ta2lwR2VuZXJhdGVUY2JOb0lubGluZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWV0YSA9IHtcbiAgICAgIGlkOiBmaWxlRGF0YS5zb3VyY2VNYW5hZ2VyLmNhcHR1cmVTb3VyY2UocmVmLm5vZGUsIHNvdXJjZU1hcHBpbmcsIGZpbGUpLFxuICAgICAgYm91bmRUYXJnZXQsXG4gICAgICBwaXBlcyxcbiAgICAgIHNjaGVtYXMsXG4gICAgfTtcbiAgICB0aGlzLnBlcmYuZXZlbnRDb3VudChQZXJmRXZlbnQuR2VuZXJhdGVUY2IpO1xuICAgIGlmIChpbmxpbmluZ1JlcXVpcmVtZW50ICE9PSBUY2JJbmxpbmluZ1JlcXVpcmVtZW50Lk5vbmUgJiZcbiAgICAgICAgdGhpcy5pbmxpbmluZyA9PT0gSW5saW5pbmdNb2RlLklubGluZU9wcykge1xuICAgICAgLy8gVGhpcyBjbGFzcyBkaWRuJ3QgbWVldCB0aGUgcmVxdWlyZW1lbnRzIGZvciBleHRlcm5hbCB0eXBlIGNoZWNraW5nLCBzbyBnZW5lcmF0ZSBhbiBpbmxpbmVcbiAgICAgIC8vIFRDQiBmb3IgdGhlIGNsYXNzLlxuICAgICAgdGhpcy5hZGRJbmxpbmVUeXBlQ2hlY2tCbG9jayhmaWxlRGF0YSwgc2hpbURhdGEsIHJlZiwgbWV0YSk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgICAgaW5saW5pbmdSZXF1aXJlbWVudCA9PT0gVGNiSW5saW5pbmdSZXF1aXJlbWVudC5TaG91bGRJbmxpbmVGb3JHZW5lcmljQm91bmRzICYmXG4gICAgICAgIHRoaXMuaW5saW5pbmcgPT09IElubGluaW5nTW9kZS5FcnJvcikge1xuICAgICAgLy8gSXQncyBzdWdnZXN0ZWQgdGhhdCB0aGlzIFRDQiBzaG91bGQgYmUgZ2VuZXJhdGVkIGlubGluZSBkdWUgdG8gdGhlIGNvbXBvbmVudCdzIGdlbmVyaWNcbiAgICAgIC8vIGJvdW5kcywgYnV0IGlubGluaW5nIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQuIFVzZSBhIG5vbi1pbmxpbmUgdHlwZVxuICAgICAgLy8gY2hlY2sgYmxvY2ssIGJ1dCBmYWxsIGJhY2sgdG8gYGFueWAgZ2VuZXJpYyBwYXJhbWV0ZXJzIHNpbmNlIHRoZSBnZW5lcmljIGJvdW5kcyBjYW4ndCBiZVxuICAgICAgLy8gcmVmZXJlbmNlZCBpbiB0aGF0IGNvbnRleHQuIFRoaXMgd2lsbCBpbmZlciBhIGxlc3MgdXNlZnVsIHR5cGUgZm9yIHRoZSBjb21wb25lbnQsIGJ1dCBhbGxvd1xuICAgICAgLy8gZm9yIHR5cGUtY2hlY2tpbmcgaXQgaW4gYW4gZW52aXJvbm1lbnQgd2hlcmUgdGhhdCB3b3VsZCBub3QgYmUgcG9zc2libGUgb3RoZXJ3aXNlLlxuICAgICAgc2hpbURhdGEuZmlsZS5hZGRUeXBlQ2hlY2tCbG9jayhcbiAgICAgICAgICByZWYsIG1ldGEsIHNoaW1EYXRhLmRvbVNjaGVtYUNoZWNrZXIsIHNoaW1EYXRhLm9vYlJlY29yZGVyLFxuICAgICAgICAgIFRjYkdlbmVyaWNDb250ZXh0QmVoYXZpb3IuRmFsbGJhY2tUb0FueSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNoaW1EYXRhLmZpbGUuYWRkVHlwZUNoZWNrQmxvY2soXG4gICAgICAgICAgcmVmLCBtZXRhLCBzaGltRGF0YS5kb21TY2hlbWFDaGVja2VyLCBzaGltRGF0YS5vb2JSZWNvcmRlcixcbiAgICAgICAgICBUY2JHZW5lcmljQ29udGV4dEJlaGF2aW9yLlVzZUVtaXR0ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmQgYSB0eXBlIGNvbnN0cnVjdG9yIGZvciB0aGUgZ2l2ZW4gYG5vZGVgIHdpdGggdGhlIGdpdmVuIGBjdG9yTWV0YWRhdGFgLlxuICAgKi9cbiAgYWRkSW5saW5lVHlwZUN0b3IoXG4gICAgICBmaWxlRGF0YTogUGVuZGluZ0ZpbGVUeXBlQ2hlY2tpbmdEYXRhLCBzZjogdHMuU291cmNlRmlsZSxcbiAgICAgIHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LCBjdG9yTWV0YTogVHlwZUN0b3JNZXRhZGF0YSk6IHZvaWQge1xuICAgIGlmICh0aGlzLnR5cGVDdG9yUGVuZGluZy5oYXMocmVmLm5vZGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMudHlwZUN0b3JQZW5kaW5nLmFkZChyZWYubm9kZSk7XG5cbiAgICAvLyBMYXppbHkgY29uc3RydWN0IHRoZSBvcGVyYXRpb24gbWFwLlxuICAgIGlmICghdGhpcy5vcE1hcC5oYXMoc2YpKSB7XG4gICAgICB0aGlzLm9wTWFwLnNldChzZiwgW10pO1xuICAgIH1cbiAgICBjb25zdCBvcHMgPSB0aGlzLm9wTWFwLmdldChzZikhO1xuXG4gICAgLy8gUHVzaCBhIGBUeXBlQ3Rvck9wYCBpbnRvIHRoZSBvcGVyYXRpb24gcXVldWUgZm9yIHRoZSBzb3VyY2UgZmlsZS5cbiAgICBvcHMucHVzaChuZXcgVHlwZUN0b3JPcChyZWYsIGN0b3JNZXRhKSk7XG4gICAgZmlsZURhdGEuaGFzSW5saW5lcyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtIGEgYHRzLlNvdXJjZUZpbGVgIGludG8gYSB2ZXJzaW9uIHRoYXQgaW5jbHVkZXMgdHlwZSBjaGVja2luZyBjb2RlLlxuICAgKlxuICAgKiBJZiB0aGlzIHBhcnRpY3VsYXIgYHRzLlNvdXJjZUZpbGVgIHJlcXVpcmVzIGNoYW5nZXMsIHRoZSB0ZXh0IHJlcHJlc2VudGluZyBpdHMgbmV3IGNvbnRlbnRzXG4gICAqIHdpbGwgYmUgcmV0dXJuZWQuIE90aGVyd2lzZSwgYSBgbnVsbGAgcmV0dXJuIGluZGljYXRlcyBubyBjaGFuZ2VzIHdlcmUgbmVjZXNzYXJ5LlxuICAgKi9cbiAgdHJhbnNmb3JtKHNmOiB0cy5Tb3VyY2VGaWxlKTogc3RyaW5nfG51bGwge1xuICAgIC8vIElmIHRoZXJlIGFyZSBubyBvcGVyYXRpb25zIHBlbmRpbmcgZm9yIHRoaXMgcGFydGljdWxhciBmaWxlLCByZXR1cm4gYG51bGxgIHRvIGluZGljYXRlIG5vXG4gICAgLy8gY2hhbmdlcy5cbiAgICBpZiAoIXRoaXMub3BNYXAuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gSW1wb3J0cyBtYXkgbmVlZCB0byBiZSBhZGRlZCB0byB0aGUgZmlsZSB0byBzdXBwb3J0IHR5cGUtY2hlY2tpbmcgb2YgZGlyZWN0aXZlcyB1c2VkIGluIHRoZVxuICAgIC8vIHRlbXBsYXRlIHdpdGhpbiBpdC5cbiAgICBjb25zdCBpbXBvcnRNYW5hZ2VyID0gbmV3IEltcG9ydE1hbmFnZXIobmV3IE5vb3BJbXBvcnRSZXdyaXRlcigpLCAnX2knKTtcblxuICAgIC8vIEVhY2ggT3AgaGFzIGEgc3BsaXRQb2ludCBpbmRleCBpbnRvIHRoZSB0ZXh0IHdoZXJlIGl0IG5lZWRzIHRvIGJlIGluc2VydGVkLiBTcGxpdCB0aGVcbiAgICAvLyBvcmlnaW5hbCBzb3VyY2UgdGV4dCBpbnRvIGNodW5rcyBhdCB0aGVzZSBzcGxpdCBwb2ludHMsIHdoZXJlIGNvZGUgd2lsbCBiZSBpbnNlcnRlZCBiZXR3ZWVuXG4gICAgLy8gdGhlIGNodW5rcy5cbiAgICBjb25zdCBvcHMgPSB0aGlzLm9wTWFwLmdldChzZikhLnNvcnQob3JkZXJPcHMpO1xuICAgIGNvbnN0IHRleHRQYXJ0cyA9IHNwbGl0U3RyaW5nQXRQb2ludHMoc2YudGV4dCwgb3BzLm1hcChvcCA9PiBvcC5zcGxpdFBvaW50KSk7XG5cbiAgICAvLyBVc2UgYSBgdHMuUHJpbnRlcmAgdG8gZ2VuZXJhdGUgc291cmNlIGNvZGUuXG4gICAgY29uc3QgcHJpbnRlciA9IHRzLmNyZWF0ZVByaW50ZXIoe29taXRUcmFpbGluZ1NlbWljb2xvbjogdHJ1ZX0pO1xuXG4gICAgLy8gQmVnaW4gd2l0aCB0aGUgaW50aWFsIHNlY3Rpb24gb2YgdGhlIGNvZGUgdGV4dC5cbiAgICBsZXQgY29kZSA9IHRleHRQYXJ0c1swXTtcblxuICAgIC8vIFByb2Nlc3MgZWFjaCBvcGVyYXRpb24gYW5kIHVzZSB0aGUgcHJpbnRlciB0byBnZW5lcmF0ZSBzb3VyY2UgY29kZSBmb3IgaXQsIGluc2VydGluZyBpdCBpbnRvXG4gICAgLy8gdGhlIHNvdXJjZSBjb2RlIGluIGJldHdlZW4gdGhlIG9yaWdpbmFsIGNodW5rcy5cbiAgICBvcHMuZm9yRWFjaCgob3AsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgdGV4dCA9IG9wLmV4ZWN1dGUoaW1wb3J0TWFuYWdlciwgc2YsIHRoaXMucmVmRW1pdHRlciwgcHJpbnRlcik7XG4gICAgICBjb2RlICs9ICdcXG5cXG4nICsgdGV4dCArIHRleHRQYXJ0c1tpZHggKyAxXTtcbiAgICB9KTtcblxuICAgIC8vIFdyaXRlIG91dCB0aGUgaW1wb3J0cyB0aGF0IG5lZWQgdG8gYmUgYWRkZWQgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZS5cbiAgICBsZXQgaW1wb3J0cyA9IGltcG9ydE1hbmFnZXIuZ2V0QWxsSW1wb3J0cyhzZi5maWxlTmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAubWFwKGkgPT4gYGltcG9ydCAqIGFzICR7aS5xdWFsaWZpZXIudGV4dH0gZnJvbSAnJHtpLnNwZWNpZmllcn0nO2ApXG4gICAgICAgICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpO1xuICAgIGNvZGUgPSBpbXBvcnRzICsgJ1xcbicgKyBjb2RlO1xuXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cblxuICBmaW5hbGl6ZSgpOiBNYXA8QWJzb2x1dGVGc1BhdGgsIHN0cmluZz4ge1xuICAgIC8vIEZpcnN0LCBidWlsZCB0aGUgbWFwIG9mIHVwZGF0ZXMgdG8gc291cmNlIGZpbGVzLlxuICAgIGNvbnN0IHVwZGF0ZXMgPSBuZXcgTWFwPEFic29sdXRlRnNQYXRoLCBzdHJpbmc+KCk7XG4gICAgZm9yIChjb25zdCBvcmlnaW5hbFNmIG9mIHRoaXMub3BNYXAua2V5cygpKSB7XG4gICAgICBjb25zdCBuZXdUZXh0ID0gdGhpcy50cmFuc2Zvcm0ob3JpZ2luYWxTZik7XG4gICAgICBpZiAobmV3VGV4dCAhPT0gbnVsbCkge1xuICAgICAgICB1cGRhdGVzLnNldChhYnNvbHV0ZUZyb21Tb3VyY2VGaWxlKG9yaWdpbmFsU2YpLCBuZXdUZXh0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGVuIGdvIHRocm91Z2ggZWFjaCBpbnB1dCBmaWxlIHRoYXQgaGFzIHBlbmRpbmcgY29kZSBnZW5lcmF0aW9uIG9wZXJhdGlvbnMuXG4gICAgZm9yIChjb25zdCBbc2ZQYXRoLCBwZW5kaW5nRmlsZURhdGFdIG9mIHRoaXMuZmlsZU1hcCkge1xuICAgICAgLy8gRm9yIGVhY2ggaW5wdXQgZmlsZSwgY29uc2lkZXIgZ2VuZXJhdGlvbiBvcGVyYXRpb25zIGZvciBlYWNoIG9mIGl0cyBzaGltcy5cbiAgICAgIGZvciAoY29uc3QgcGVuZGluZ1NoaW1EYXRhIG9mIHBlbmRpbmdGaWxlRGF0YS5zaGltRGF0YS52YWx1ZXMoKSkge1xuICAgICAgICB0aGlzLmhvc3QucmVjb3JkU2hpbURhdGEoc2ZQYXRoLCB7XG4gICAgICAgICAgZ2VuZXNpc0RpYWdub3N0aWNzOiBbXG4gICAgICAgICAgICAuLi5wZW5kaW5nU2hpbURhdGEuZG9tU2NoZW1hQ2hlY2tlci5kaWFnbm9zdGljcyxcbiAgICAgICAgICAgIC4uLnBlbmRpbmdTaGltRGF0YS5vb2JSZWNvcmRlci5kaWFnbm9zdGljcyxcbiAgICAgICAgICBdLFxuICAgICAgICAgIGhhc0lubGluZXM6IHBlbmRpbmdGaWxlRGF0YS5oYXNJbmxpbmVzLFxuICAgICAgICAgIHBhdGg6IHBlbmRpbmdTaGltRGF0YS5maWxlLmZpbGVOYW1lLFxuICAgICAgICAgIHRlbXBsYXRlczogcGVuZGluZ1NoaW1EYXRhLnRlbXBsYXRlcyxcbiAgICAgICAgfSk7XG4gICAgICAgIHVwZGF0ZXMuc2V0KFxuICAgICAgICAgICAgcGVuZGluZ1NoaW1EYXRhLmZpbGUuZmlsZU5hbWUsIHBlbmRpbmdTaGltRGF0YS5maWxlLnJlbmRlcihmYWxzZSAvKiByZW1vdmVDb21tZW50cyAqLykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1cGRhdGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRJbmxpbmVUeXBlQ2hlY2tCbG9jayhcbiAgICAgIGZpbGVEYXRhOiBQZW5kaW5nRmlsZVR5cGVDaGVja2luZ0RhdGEsIHNoaW1EYXRhOiBQZW5kaW5nU2hpbURhdGEsXG4gICAgICByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PixcbiAgICAgIHRjYk1ldGE6IFR5cGVDaGVja0Jsb2NrTWV0YWRhdGEpOiB2b2lkIHtcbiAgICBjb25zdCBzZiA9IHJlZi5ub2RlLmdldFNvdXJjZUZpbGUoKTtcbiAgICBpZiAoIXRoaXMub3BNYXAuaGFzKHNmKSkge1xuICAgICAgdGhpcy5vcE1hcC5zZXQoc2YsIFtdKTtcbiAgICB9XG4gICAgY29uc3Qgb3BzID0gdGhpcy5vcE1hcC5nZXQoc2YpITtcbiAgICBvcHMucHVzaChuZXcgSW5saW5lVGNiT3AoXG4gICAgICAgIHJlZiwgdGNiTWV0YSwgdGhpcy5jb25maWcsIHRoaXMucmVmbGVjdG9yLCBzaGltRGF0YS5kb21TY2hlbWFDaGVja2VyLFxuICAgICAgICBzaGltRGF0YS5vb2JSZWNvcmRlcikpO1xuICAgIGZpbGVEYXRhLmhhc0lubGluZXMgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBwZW5kaW5nU2hpbUZvckNvbXBvbmVudChub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTogUGVuZGluZ1NoaW1EYXRhIHtcbiAgICBjb25zdCBmaWxlRGF0YSA9IHRoaXMuZGF0YUZvckZpbGUobm9kZS5nZXRTb3VyY2VGaWxlKCkpO1xuICAgIGNvbnN0IHNoaW1QYXRoID0gdGhpcy5jb21wb25lbnRNYXBwaW5nU3RyYXRlZ3kuc2hpbVBhdGhGb3JDb21wb25lbnQobm9kZSk7XG4gICAgaWYgKCFmaWxlRGF0YS5zaGltRGF0YS5oYXMoc2hpbVBhdGgpKSB7XG4gICAgICBmaWxlRGF0YS5zaGltRGF0YS5zZXQoc2hpbVBhdGgsIHtcbiAgICAgICAgZG9tU2NoZW1hQ2hlY2tlcjogbmV3IFJlZ2lzdHJ5RG9tU2NoZW1hQ2hlY2tlcihmaWxlRGF0YS5zb3VyY2VNYW5hZ2VyKSxcbiAgICAgICAgb29iUmVjb3JkZXI6IG5ldyBPdXRPZkJhbmREaWFnbm9zdGljUmVjb3JkZXJJbXBsKGZpbGVEYXRhLnNvdXJjZU1hbmFnZXIpLFxuICAgICAgICBmaWxlOiBuZXcgVHlwZUNoZWNrRmlsZShcbiAgICAgICAgICAgIHNoaW1QYXRoLCB0aGlzLmNvbmZpZywgdGhpcy5yZWZFbWl0dGVyLCB0aGlzLnJlZmxlY3RvciwgdGhpcy5jb21waWxlckhvc3QpLFxuICAgICAgICB0ZW1wbGF0ZXM6IG5ldyBNYXA8VGVtcGxhdGVJZCwgVGVtcGxhdGVEYXRhPigpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBmaWxlRGF0YS5zaGltRGF0YS5nZXQoc2hpbVBhdGgpITtcbiAgfVxuXG4gIHByaXZhdGUgZGF0YUZvckZpbGUoc2Y6IHRzLlNvdXJjZUZpbGUpOiBQZW5kaW5nRmlsZVR5cGVDaGVja2luZ0RhdGEge1xuICAgIGNvbnN0IHNmUGF0aCA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoc2YpO1xuXG4gICAgaWYgKCF0aGlzLmZpbGVNYXAuaGFzKHNmUGF0aCkpIHtcbiAgICAgIGNvbnN0IGRhdGE6IFBlbmRpbmdGaWxlVHlwZUNoZWNraW5nRGF0YSA9IHtcbiAgICAgICAgaGFzSW5saW5lczogZmFsc2UsXG4gICAgICAgIHNvdXJjZU1hbmFnZXI6IHRoaXMuaG9zdC5nZXRTb3VyY2VNYW5hZ2VyKHNmUGF0aCksXG4gICAgICAgIHNoaW1EYXRhOiBuZXcgTWFwKCksXG4gICAgICB9O1xuICAgICAgdGhpcy5maWxlTWFwLnNldChzZlBhdGgsIGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZpbGVNYXAuZ2V0KHNmUGF0aCkhO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRUZW1wbGF0ZURpYWdub3N0aWNzKFxuICAgICAgcGFyc2VFcnJvcnM6IFBhcnNlRXJyb3JbXSwgdGVtcGxhdGVJZDogVGVtcGxhdGVJZCxcbiAgICAgIHNvdXJjZU1hcHBpbmc6IFRlbXBsYXRlU291cmNlTWFwcGluZyk6IFRlbXBsYXRlRGlhZ25vc3RpY1tdIHtcbiAgICByZXR1cm4gcGFyc2VFcnJvcnMubWFwKGVycm9yID0+IHtcbiAgICAgIGNvbnN0IHNwYW4gPSBlcnJvci5zcGFuO1xuXG4gICAgICBpZiAoc3Bhbi5zdGFydC5vZmZzZXQgPT09IHNwYW4uZW5kLm9mZnNldCkge1xuICAgICAgICAvLyBUZW1wbGF0ZSBlcnJvcnMgY2FuIGNvbnRhaW4gemVyby1sZW5ndGggc3BhbnMsIGlmIHRoZSBlcnJvciBvY2N1cnMgYXQgYSBzaW5nbGUgcG9pbnQuXG4gICAgICAgIC8vIEhvd2V2ZXIsIFR5cGVTY3JpcHQgZG9lcyBub3QgaGFuZGxlIGRpc3BsYXlpbmcgYSB6ZXJvLWxlbmd0aCBkaWFnbm9zdGljIHZlcnkgd2VsbCwgc29cbiAgICAgICAgLy8gaW5jcmVhc2UgdGhlIGVuZGluZyBvZmZzZXQgYnkgMSBmb3Igc3VjaCBlcnJvcnMsIHRvIGVuc3VyZSB0aGUgcG9zaXRpb24gaXMgc2hvd24gaW4gdGhlXG4gICAgICAgIC8vIGRpYWdub3N0aWMuXG4gICAgICAgIHNwYW4uZW5kLm9mZnNldCsrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWFrZVRlbXBsYXRlRGlhZ25vc3RpYyhcbiAgICAgICAgICB0ZW1wbGF0ZUlkLCBzb3VyY2VNYXBwaW5nLCBzcGFuLCB0cy5EaWFnbm9zdGljQ2F0ZWdvcnkuRXJyb3IsXG4gICAgICAgICAgbmdFcnJvckNvZGUoRXJyb3JDb2RlLlRFTVBMQVRFX1BBUlNFX0VSUk9SKSwgZXJyb3IubXNnKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgY29kZSBnZW5lcmF0aW9uIG9wZXJhdGlvbiB0aGF0IG5lZWRzIHRvIGhhcHBlbiB3aXRoaW4gYSBnaXZlbiBzb3VyY2UgZmlsZS5cbiAqL1xuaW50ZXJmYWNlIE9wIHtcbiAgLyoqXG4gICAqIFRoZSBub2RlIGluIHRoZSBmaWxlIHdoaWNoIHdpbGwgaGF2ZSBjb2RlIGdlbmVyYXRlZCBmb3IgaXQuXG4gICAqL1xuICByZWFkb25seSByZWY6IFJlZmVyZW5jZTxDbGFzc0RlY2xhcmF0aW9uPHRzLkNsYXNzRGVjbGFyYXRpb24+PjtcblxuICAvKipcbiAgICogSW5kZXggaW50byB0aGUgc291cmNlIHRleHQgd2hlcmUgdGhlIGNvZGUgZ2VuZXJhdGVkIGJ5IHRoZSBvcGVyYXRpb24gc2hvdWxkIGJlIGluc2VydGVkLlxuICAgKi9cbiAgcmVhZG9ubHkgc3BsaXRQb2ludDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBFeGVjdXRlIHRoZSBvcGVyYXRpb24gYW5kIHJldHVybiB0aGUgZ2VuZXJhdGVkIGNvZGUgYXMgdGV4dC5cbiAgICovXG4gIGV4ZWN1dGUoaW06IEltcG9ydE1hbmFnZXIsIHNmOiB0cy5Tb3VyY2VGaWxlLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcmludGVyOiB0cy5QcmludGVyKTpcbiAgICAgIHN0cmluZztcbn1cblxuLyoqXG4gKiBBIHR5cGUgY2hlY2sgYmxvY2sgb3BlcmF0aW9uIHdoaWNoIHByb2R1Y2VzIGlubGluZSB0eXBlIGNoZWNrIGNvZGUgZm9yIGEgcGFydGljdWxhciBjb21wb25lbnQuXG4gKi9cbmNsYXNzIElubGluZVRjYk9wIGltcGxlbWVudHMgT3Age1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LFxuICAgICAgcmVhZG9ubHkgbWV0YTogVHlwZUNoZWNrQmxvY2tNZXRhZGF0YSwgcmVhZG9ubHkgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcsXG4gICAgICByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCByZWFkb25seSBkb21TY2hlbWFDaGVja2VyOiBEb21TY2hlbWFDaGVja2VyLFxuICAgICAgcmVhZG9ubHkgb29iUmVjb3JkZXI6IE91dE9mQmFuZERpYWdub3N0aWNSZWNvcmRlcikge31cblxuICAvKipcbiAgICogVHlwZSBjaGVjayBibG9ja3MgYXJlIGluc2VydGVkIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBlbmQgb2YgdGhlIGNvbXBvbmVudCBjbGFzcy5cbiAgICovXG4gIGdldCBzcGxpdFBvaW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVmLm5vZGUuZW5kICsgMTtcbiAgfVxuXG4gIGV4ZWN1dGUoaW06IEltcG9ydE1hbmFnZXIsIHNmOiB0cy5Tb3VyY2VGaWxlLCByZWZFbWl0dGVyOiBSZWZlcmVuY2VFbWl0dGVyLCBwcmludGVyOiB0cy5QcmludGVyKTpcbiAgICAgIHN0cmluZyB7XG4gICAgY29uc3QgZW52ID0gbmV3IEVudmlyb25tZW50KHRoaXMuY29uZmlnLCBpbSwgcmVmRW1pdHRlciwgdGhpcy5yZWZsZWN0b3IsIHNmKTtcbiAgICBjb25zdCBmbk5hbWUgPSB0cy5jcmVhdGVJZGVudGlmaWVyKGBfdGNiXyR7dGhpcy5yZWYubm9kZS5wb3N9YCk7XG5cbiAgICAvLyBJbmxpbmUgVENCcyBzaG91bGQgY29weSBhbnkgZ2VuZXJpYyB0eXBlIHBhcmFtZXRlciBub2RlcyBkaXJlY3RseSwgYXMgdGhlIFRDQiBjb2RlIGlzIGlubGluZWRcbiAgICAvLyBpbnRvIHRoZSBjbGFzcyBpbiBhIGNvbnRleHQgd2hlcmUgdGhhdCB3aWxsIGFsd2F5cyBiZSBsZWdhbC5cbiAgICBjb25zdCBmbiA9IGdlbmVyYXRlVHlwZUNoZWNrQmxvY2soXG4gICAgICAgIGVudiwgdGhpcy5yZWYsIGZuTmFtZSwgdGhpcy5tZXRhLCB0aGlzLmRvbVNjaGVtYUNoZWNrZXIsIHRoaXMub29iUmVjb3JkZXIsXG4gICAgICAgIFRjYkdlbmVyaWNDb250ZXh0QmVoYXZpb3IuQ29weUNsYXNzTm9kZXMpO1xuICAgIHJldHVybiBwcmludGVyLnByaW50Tm9kZSh0cy5FbWl0SGludC5VbnNwZWNpZmllZCwgZm4sIHNmKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgdHlwZSBjb25zdHJ1Y3RvciBvcGVyYXRpb24gd2hpY2ggcHJvZHVjZXMgdHlwZSBjb25zdHJ1Y3RvciBjb2RlIGZvciBhIHBhcnRpY3VsYXIgZGlyZWN0aXZlLlxuICovXG5jbGFzcyBUeXBlQ3Rvck9wIGltcGxlbWVudHMgT3Age1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHJlYWRvbmx5IHJlZjogUmVmZXJlbmNlPENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4+LFxuICAgICAgcmVhZG9ubHkgbWV0YTogVHlwZUN0b3JNZXRhZGF0YSkge31cblxuICAvKipcbiAgICogVHlwZSBjb25zdHJ1Y3RvciBvcGVyYXRpb25zIGFyZSBpbnNlcnRlZCBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGVuZCBvZiB0aGUgZGlyZWN0aXZlIGNsYXNzLlxuICAgKi9cbiAgZ2V0IHNwbGl0UG9pbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWYubm9kZS5lbmQgLSAxO1xuICB9XG5cbiAgZXhlY3V0ZShpbTogSW1wb3J0TWFuYWdlciwgc2Y6IHRzLlNvdXJjZUZpbGUsIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHByaW50ZXI6IHRzLlByaW50ZXIpOlxuICAgICAgc3RyaW5nIHtcbiAgICBjb25zdCB0Y2IgPSBnZW5lcmF0ZUlubGluZVR5cGVDdG9yKHRoaXMucmVmLm5vZGUsIHRoaXMubWV0YSk7XG4gICAgcmV0dXJuIHByaW50ZXIucHJpbnROb2RlKHRzLkVtaXRIaW50LlVuc3BlY2lmaWVkLCB0Y2IsIHNmKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIG9wZXJhdGlvbnMgYW5kIHJldHVybiB0aGVpciBzcGxpdCBwb2ludCBvcmRlcmluZy5cbiAqL1xuZnVuY3Rpb24gb3JkZXJPcHMob3AxOiBPcCwgb3AyOiBPcCk6IG51bWJlciB7XG4gIHJldHVybiBvcDEuc3BsaXRQb2ludCAtIG9wMi5zcGxpdFBvaW50O1xufVxuXG4vKipcbiAqIFNwbGl0IGEgc3RyaW5nIGludG8gY2h1bmtzIGF0IGFueSBudW1iZXIgb2Ygc3BsaXQgcG9pbnRzLlxuICovXG5mdW5jdGlvbiBzcGxpdFN0cmluZ0F0UG9pbnRzKHN0cjogc3RyaW5nLCBwb2ludHM6IG51bWJlcltdKTogc3RyaW5nW10ge1xuICBjb25zdCBzcGxpdHM6IHN0cmluZ1tdID0gW107XG4gIGxldCBzdGFydCA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcG9pbnQgPSBwb2ludHNbaV07XG4gICAgc3BsaXRzLnB1c2goc3RyLnN1YnN0cmluZyhzdGFydCwgcG9pbnQpKTtcbiAgICBzdGFydCA9IHBvaW50O1xuICB9XG4gIHNwbGl0cy5wdXNoKHN0ci5zdWJzdHJpbmcoc3RhcnQpKTtcbiAgcmV0dXJuIHNwbGl0cztcbn1cbiJdfQ==