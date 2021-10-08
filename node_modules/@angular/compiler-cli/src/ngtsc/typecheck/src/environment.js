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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/environment", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor", "@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Environment = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var imports_1 = require("@angular/compiler-cli/src/ngtsc/imports");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    var type_constructor_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_constructor");
    var type_parameter_emitter_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/type_parameter_emitter");
    /**
     * A context which hosts one or more Type Check Blocks (TCBs).
     *
     * An `Environment` supports the generation of TCBs by tracking necessary imports, declarations of
     * type constructors, and other statements beyond the type-checking code within the TCB itself.
     * Through method calls on `Environment`, the TCB generator can request `ts.Expression`s which
     * reference declarations in the `Environment` for these artifacts`.
     *
     * `Environment` can be used in a standalone fashion, or can be extended to support more specialized
     * usage.
     */
    var Environment = /** @class */ (function () {
        function Environment(config, importManager, refEmitter, reflector, contextFile) {
            this.config = config;
            this.importManager = importManager;
            this.refEmitter = refEmitter;
            this.reflector = reflector;
            this.contextFile = contextFile;
            this.nextIds = {
                pipeInst: 1,
                typeCtor: 1,
            };
            this.typeCtors = new Map();
            this.typeCtorStatements = [];
            this.pipeInsts = new Map();
            this.pipeInstStatements = [];
        }
        /**
         * Get an expression referring to a type constructor for the given directive.
         *
         * Depending on the shape of the directive itself, this could be either a reference to a declared
         * type constructor, or to an inline type constructor.
         */
        Environment.prototype.typeCtorFor = function (dir) {
            var dirRef = dir.ref;
            var node = dirRef.node;
            if (this.typeCtors.has(node)) {
                return this.typeCtors.get(node);
            }
            if (type_constructor_1.requiresInlineTypeCtor(node, this.reflector)) {
                // The constructor has already been created inline, we just need to construct a reference to
                // it.
                var ref = this.reference(dirRef);
                var typeCtorExpr = ts.createPropertyAccess(ref, 'ngTypeCtor');
                this.typeCtors.set(node, typeCtorExpr);
                return typeCtorExpr;
            }
            else {
                var fnName = "_ctor" + this.nextIds.typeCtor++;
                var nodeTypeRef = this.referenceType(dirRef);
                if (!ts.isTypeReferenceNode(nodeTypeRef)) {
                    throw new Error("Expected TypeReferenceNode from reference to " + dirRef.debugName);
                }
                var meta = {
                    fnName: fnName,
                    body: true,
                    fields: {
                        inputs: dir.inputs.classPropertyNames,
                        outputs: dir.outputs.classPropertyNames,
                        // TODO: support queries
                        queries: dir.queries,
                    },
                    coercedInputFields: dir.coercedInputFields,
                };
                var typeParams = this.emitTypeParameters(node);
                var typeCtor = type_constructor_1.generateTypeCtorDeclarationFn(node, meta, nodeTypeRef.typeName, typeParams, this.reflector);
                this.typeCtorStatements.push(typeCtor);
                var fnId = ts.createIdentifier(fnName);
                this.typeCtors.set(node, fnId);
                return fnId;
            }
        };
        /*
         * Get an expression referring to an instance of the given pipe.
         */
        Environment.prototype.pipeInst = function (ref) {
            if (this.pipeInsts.has(ref.node)) {
                return this.pipeInsts.get(ref.node);
            }
            var pipeType = this.referenceType(ref);
            var pipeInstId = ts.createIdentifier("_pipe" + this.nextIds.pipeInst++);
            this.pipeInstStatements.push(ts_util_1.tsDeclareVariable(pipeInstId, pipeType));
            this.pipeInsts.set(ref.node, pipeInstId);
            return pipeInstId;
        };
        /**
         * Generate a `ts.Expression` that references the given node.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.reference = function (ref) {
            // Disable aliasing for imports generated in a template type-checking context, as there is no
            // guarantee that any alias re-exports exist in the .d.ts files. It's safe to use direct imports
            // in these cases as there is no strict dependency checking during the template type-checking
            // pass.
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing);
            // Use `translateExpression` to convert the `Expression` into a `ts.Expression`.
            return translator_1.translateExpression(ngExpr.expression, this.importManager);
        };
        /**
         * Generate a `ts.TypeNode` that references the given node as a type.
         *
         * This may involve importing the node into the file if it's not declared there already.
         */
        Environment.prototype.referenceType = function (ref) {
            var ngExpr = this.refEmitter.emit(ref, this.contextFile, imports_1.ImportFlags.NoAliasing | imports_1.ImportFlags.AllowTypeImports);
            // Create an `ExpressionType` from the `Expression` and translate it via `translateType`.
            // TODO(alxhub): support references to types with generic arguments in a clean way.
            return translator_1.translateType(new compiler_1.ExpressionType(ngExpr.expression), this.importManager);
        };
        Environment.prototype.emitTypeParameters = function (declaration) {
            var _this = this;
            var emitter = new type_parameter_emitter_1.TypeParameterEmitter(declaration.typeParameters, this.reflector);
            return emitter.emit(function (ref) { return _this.referenceType(ref); });
        };
        /**
         * Generate a `ts.TypeNode` that references a given type from the provided module.
         *
         * This will involve importing the type into the file, and will also add type parameters if
         * provided.
         */
        Environment.prototype.referenceExternalType = function (moduleName, name, typeParams) {
            var external = new compiler_1.ExternalExpr({ moduleName: moduleName, name: name });
            return translator_1.translateType(new compiler_1.ExpressionType(external, [ /* modifiers */], typeParams), this.importManager);
        };
        Environment.prototype.getPreludeStatements = function () {
            return tslib_1.__spread(this.pipeInstStatements, this.typeCtorStatements);
        };
        return Environment;
    }());
    exports.Environment = Environment;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvc3JjL25ndHNjL3R5cGVjaGVjay9zcmMvZW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUFzRjtJQUN0RiwrQkFBaUM7SUFFakMsbUVBQXVFO0lBRXZFLHlFQUFtRjtJQUduRixpRkFBNEM7SUFDNUMsbUdBQXlGO0lBQ3pGLCtHQUE4RDtJQUU5RDs7Ozs7Ozs7OztPQVVHO0lBQ0g7UUFZRSxxQkFDYSxNQUEwQixFQUFZLGFBQTRCLEVBQ25FLFVBQTRCLEVBQVcsU0FBeUIsRUFDOUQsV0FBMEI7WUFGM0IsV0FBTSxHQUFOLE1BQU0sQ0FBb0I7WUFBWSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQUNuRSxlQUFVLEdBQVYsVUFBVSxDQUFrQjtZQUFXLGNBQVMsR0FBVCxTQUFTLENBQWdCO1lBQzlELGdCQUFXLEdBQVgsV0FBVyxDQUFlO1lBZGhDLFlBQU8sR0FBRztnQkFDaEIsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxFQUFFLENBQUM7YUFDWixDQUFDO1lBRU0sY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7WUFFMUMsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQyxDQUFDO1lBQ3JELHVCQUFrQixHQUFtQixFQUFFLENBQUM7UUFLUCxDQUFDO1FBRTVDOzs7OztXQUtHO1FBQ0gsaUNBQVcsR0FBWCxVQUFZLEdBQStCO1lBQ3pDLElBQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUF1RCxDQUFDO1lBQzNFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENB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RSxJQUFJLE1BQUEsRUFBQyxDQUFDLENBQUM7WUFDdEQsT0FBTywwQkFBYSxDQUNoQixJQUFJLHlCQUFjLENBQUMsUUFBUSxFQUFFLEVBQUMsZUFBZSxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFRCwwQ0FBb0IsR0FBcEI7WUFDRSx3QkFDSyxJQUFJLENBQUMsa0JBQWtCLEVBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsRUFDMUI7UUFDSixDQUFDO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBdklELElBdUlDO0lBdklZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RXhwcmVzc2lvblR5cGUsIEV4dGVybmFsRXhwciwgVHlwZSwgV3JhcHBlZE5vZGVFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtJbXBvcnRGbGFncywgUmVmZXJlbmNlLCBSZWZlcmVuY2VFbWl0dGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7Q2xhc3NEZWNsYXJhdGlvbiwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVFeHByZXNzaW9uLCB0cmFuc2xhdGVUeXBlfSBmcm9tICcuLi8uLi90cmFuc2xhdG9yJztcbmltcG9ydCB7VHlwZUNoZWNrYWJsZURpcmVjdGl2ZU1ldGEsIFR5cGVDaGVja2luZ0NvbmZpZywgVHlwZUN0b3JNZXRhZGF0YX0gZnJvbSAnLi4vYXBpJztcblxuaW1wb3J0IHt0c0RlY2xhcmVWYXJpYWJsZX0gZnJvbSAnLi90c191dGlsJztcbmltcG9ydCB7Z2VuZXJhdGVUeXBlQ3RvckRlY2xhcmF0aW9uRm4sIHJlcXVpcmVzSW5saW5lVHlwZUN0b3J9IGZyb20gJy4vdHlwZV9jb25zdHJ1Y3Rvcic7XG5pbXBvcnQge1R5cGVQYXJhbWV0ZXJFbWl0dGVyfSBmcm9tICcuL3R5cGVfcGFyYW1ldGVyX2VtaXR0ZXInO1xuXG4vKipcbiAqIEEgY29udGV4dCB3aGljaCBob3N0cyBvbmUgb3IgbW9yZSBUeXBlIENoZWNrIEJsb2NrcyAoVENCcykuXG4gKlxuICogQW4gYEVudmlyb25tZW50YCBzdXBwb3J0cyB0aGUgZ2VuZXJhdGlvbiBvZiBUQ0JzIGJ5IHRyYWNraW5nIG5lY2Vzc2FyeSBpbXBvcnRzLCBkZWNsYXJhdGlvbnMgb2ZcbiAqIHR5cGUgY29uc3RydWN0b3JzLCBhbmQgb3RoZXIgc3RhdGVtZW50cyBiZXlvbmQgdGhlIHR5cGUtY2hlY2tpbmcgY29kZSB3aXRoaW4gdGhlIFRDQiBpdHNlbGYuXG4gKiBUaHJvdWdoIG1ldGhvZCBjYWxscyBvbiBgRW52aXJvbm1lbnRgLCB0aGUgVENCIGdlbmVyYXRvciBjYW4gcmVxdWVzdCBgdHMuRXhwcmVzc2lvbmBzIHdoaWNoXG4gKiByZWZlcmVuY2UgZGVjbGFyYXRpb25zIGluIHRoZSBgRW52aXJvbm1lbnRgIGZvciB0aGVzZSBhcnRpZmFjdHNgLlxuICpcbiAqIGBFbnZpcm9ubWVudGAgY2FuIGJlIHVzZWQgaW4gYSBzdGFuZGFsb25lIGZhc2hpb24sIG9yIGNhbiBiZSBleHRlbmRlZCB0byBzdXBwb3J0IG1vcmUgc3BlY2lhbGl6ZWRcbiAqIHVzYWdlLlxuICovXG5leHBvcnQgY2xhc3MgRW52aXJvbm1lbnQge1xuICBwcml2YXRlIG5leHRJZHMgPSB7XG4gICAgcGlwZUluc3Q6IDEsXG4gICAgdHlwZUN0b3I6IDEsXG4gIH07XG5cbiAgcHJpdmF0ZSB0eXBlQ3RvcnMgPSBuZXcgTWFwPENsYXNzRGVjbGFyYXRpb24sIHRzLkV4cHJlc3Npb24+KCk7XG4gIHByb3RlY3RlZCB0eXBlQ3RvclN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgcHJpdmF0ZSBwaXBlSW5zdHMgPSBuZXcgTWFwPENsYXNzRGVjbGFyYXRpb24sIHRzLkV4cHJlc3Npb24+KCk7XG4gIHByb3RlY3RlZCBwaXBlSW5zdFN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICByZWFkb25seSBjb25maWc6IFR5cGVDaGVja2luZ0NvbmZpZywgcHJvdGVjdGVkIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsXG4gICAgICBwcml2YXRlIHJlZkVtaXR0ZXI6IFJlZmVyZW5jZUVtaXR0ZXIsIHJlYWRvbmx5IHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsXG4gICAgICBwcm90ZWN0ZWQgY29udGV4dEZpbGU6IHRzLlNvdXJjZUZpbGUpIHt9XG5cbiAgLyoqXG4gICAqIEdldCBhbiBleHByZXNzaW9uIHJlZmVycmluZyB0byBhIHR5cGUgY29uc3RydWN0b3IgZm9yIHRoZSBnaXZlbiBkaXJlY3RpdmUuXG4gICAqXG4gICAqIERlcGVuZGluZyBvbiB0aGUgc2hhcGUgb2YgdGhlIGRpcmVjdGl2ZSBpdHNlbGYsIHRoaXMgY291bGQgYmUgZWl0aGVyIGEgcmVmZXJlbmNlIHRvIGEgZGVjbGFyZWRcbiAgICogdHlwZSBjb25zdHJ1Y3Rvciwgb3IgdG8gYW4gaW5saW5lIHR5cGUgY29uc3RydWN0b3IuXG4gICAqL1xuICB0eXBlQ3RvckZvcihkaXI6IFR5cGVDaGVja2FibGVEaXJlY3RpdmVNZXRhKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZGlyUmVmID0gZGlyLnJlZiBhcyBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj47XG4gICAgY29uc3Qgbm9kZSA9IGRpclJlZi5ub2RlO1xuICAgIGlmICh0aGlzLnR5cGVDdG9ycy5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLnR5cGVDdG9ycy5nZXQobm9kZSkhO1xuICAgIH1cblxuICAgIGlmIChyZXF1aXJlc0lubGluZVR5cGVDdG9yKG5vZGUsIHRoaXMucmVmbGVjdG9yKSkge1xuICAgICAgLy8gVGhlIGNvbnN0cnVjdG9yIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZCBpbmxpbmUsIHdlIGp1c3QgbmVlZCB0byBjb25zdHJ1Y3QgYSByZWZlcmVuY2UgdG9cbiAgICAgIC8vIGl0LlxuICAgICAgY29uc3QgcmVmID0gdGhpcy5yZWZlcmVuY2UoZGlyUmVmKTtcbiAgICAgIGNvbnN0IHR5cGVDdG9yRXhwciA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHJlZiwgJ25nVHlwZUN0b3InKTtcbiAgICAgIHRoaXMudHlwZUN0b3JzLnNldChub2RlLCB0eXBlQ3RvckV4cHIpO1xuICAgICAgcmV0dXJuIHR5cGVDdG9yRXhwcjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZm5OYW1lID0gYF9jdG9yJHt0aGlzLm5leHRJZHMudHlwZUN0b3IrK31gO1xuICAgICAgY29uc3Qgbm9kZVR5cGVSZWYgPSB0aGlzLnJlZmVyZW5jZVR5cGUoZGlyUmVmKTtcbiAgICAgIGlmICghdHMuaXNUeXBlUmVmZXJlbmNlTm9kZShub2RlVHlwZVJlZikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBUeXBlUmVmZXJlbmNlTm9kZSBmcm9tIHJlZmVyZW5jZSB0byAke2RpclJlZi5kZWJ1Z05hbWV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBtZXRhOiBUeXBlQ3Rvck1ldGFkYXRhID0ge1xuICAgICAgICBmbk5hbWUsXG4gICAgICAgIGJvZHk6IHRydWUsXG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIGlucHV0czogZGlyLmlucHV0cy5jbGFzc1Byb3BlcnR5TmFtZXMsXG4gICAgICAgICAgb3V0cHV0czogZGlyLm91dHB1dHMuY2xhc3NQcm9wZXJ0eU5hbWVzLFxuICAgICAgICAgIC8vIFRPRE86IHN1cHBvcnQgcXVlcmllc1xuICAgICAgICAgIHF1ZXJpZXM6IGRpci5xdWVyaWVzLFxuICAgICAgICB9LFxuICAgICAgICBjb2VyY2VkSW5wdXRGaWVsZHM6IGRpci5jb2VyY2VkSW5wdXRGaWVsZHMsXG4gICAgICB9O1xuICAgICAgY29uc3QgdHlwZVBhcmFtcyA9IHRoaXMuZW1pdFR5cGVQYXJhbWV0ZXJzKG5vZGUpO1xuICAgICAgY29uc3QgdHlwZUN0b3IgPSBnZW5lcmF0ZVR5cGVDdG9yRGVjbGFyYXRpb25GbihcbiAgICAgICAgICBub2RlLCBtZXRhLCBub2RlVHlwZVJlZi50eXBlTmFtZSwgdHlwZVBhcmFtcywgdGhpcy5yZWZsZWN0b3IpO1xuICAgICAgdGhpcy50eXBlQ3RvclN0YXRlbWVudHMucHVzaCh0eXBlQ3Rvcik7XG4gICAgICBjb25zdCBmbklkID0gdHMuY3JlYXRlSWRlbnRpZmllcihmbk5hbWUpO1xuICAgICAgdGhpcy50eXBlQ3RvcnMuc2V0KG5vZGUsIGZuSWQpO1xuICAgICAgcmV0dXJuIGZuSWQ7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogR2V0IGFuIGV4cHJlc3Npb24gcmVmZXJyaW5nIHRvIGFuIGluc3RhbmNlIG9mIHRoZSBnaXZlbiBwaXBlLlxuICAgKi9cbiAgcGlwZUluc3QocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4pOiB0cy5FeHByZXNzaW9uIHtcbiAgICBpZiAodGhpcy5waXBlSW5zdHMuaGFzKHJlZi5ub2RlKSkge1xuICAgICAgcmV0dXJuIHRoaXMucGlwZUluc3RzLmdldChyZWYubm9kZSkhO1xuICAgIH1cblxuICAgIGNvbnN0IHBpcGVUeXBlID0gdGhpcy5yZWZlcmVuY2VUeXBlKHJlZik7XG4gICAgY29uc3QgcGlwZUluc3RJZCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoYF9waXBlJHt0aGlzLm5leHRJZHMucGlwZUluc3QrK31gKTtcblxuICAgIHRoaXMucGlwZUluc3RTdGF0ZW1lbnRzLnB1c2godHNEZWNsYXJlVmFyaWFibGUocGlwZUluc3RJZCwgcGlwZVR5cGUpKTtcbiAgICB0aGlzLnBpcGVJbnN0cy5zZXQocmVmLm5vZGUsIHBpcGVJbnN0SWQpO1xuXG4gICAgcmV0dXJuIHBpcGVJbnN0SWQ7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgYSBgdHMuRXhwcmVzc2lvbmAgdGhhdCByZWZlcmVuY2VzIHRoZSBnaXZlbiBub2RlLlxuICAgKlxuICAgKiBUaGlzIG1heSBpbnZvbHZlIGltcG9ydGluZyB0aGUgbm9kZSBpbnRvIHRoZSBmaWxlIGlmIGl0J3Mgbm90IGRlY2xhcmVkIHRoZXJlIGFscmVhZHkuXG4gICAqL1xuICByZWZlcmVuY2UocmVmOiBSZWZlcmVuY2U8Q2xhc3NEZWNsYXJhdGlvbjx0cy5DbGFzc0RlY2xhcmF0aW9uPj4pOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBEaXNhYmxlIGFsaWFzaW5nIGZvciBpbXBvcnRzIGdlbmVyYXRlZCBpbiBhIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmcgY29udGV4dCwgYXMgdGhlcmUgaXMgbm9cbiAgICAvLyBndWFyYW50ZWUgdGhhdCBhbnkgYWxpYXMgcmUtZXhwb3J0cyBleGlzdCBpbiB0aGUgLmQudHMgZmlsZXMuIEl0J3Mgc2FmZSB0byB1c2UgZGlyZWN0IGltcG9ydHNcbiAgICAvLyBpbiB0aGVzZSBjYXNlcyBhcyB0aGVyZSBpcyBubyBzdHJpY3QgZGVwZW5kZW5jeSBjaGVja2luZyBkdXJpbmcgdGhlIHRlbXBsYXRlIHR5cGUtY2hlY2tpbmdcbiAgICAvLyBwYXNzLlxuICAgIGNvbnN0IG5nRXhwciA9IHRoaXMucmVmRW1pdHRlci5lbWl0KHJlZiwgdGhpcy5jb250ZXh0RmlsZSwgSW1wb3J0RmxhZ3MuTm9BbGlhc2luZyk7XG5cbiAgICAvLyBVc2UgYHRyYW5zbGF0ZUV4cHJlc3Npb25gIHRvIGNvbnZlcnQgdGhlIGBFeHByZXNzaW9uYCBpbnRvIGEgYHRzLkV4cHJlc3Npb25gLlxuICAgIHJldHVybiB0cmFuc2xhdGVFeHByZXNzaW9uKG5nRXhwci5leHByZXNzaW9uLCB0aGlzLmltcG9ydE1hbmFnZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgYHRzLlR5cGVOb2RlYCB0aGF0IHJlZmVyZW5jZXMgdGhlIGdpdmVuIG5vZGUgYXMgYSB0eXBlLlxuICAgKlxuICAgKiBUaGlzIG1heSBpbnZvbHZlIGltcG9ydGluZyB0aGUgbm9kZSBpbnRvIHRoZSBmaWxlIGlmIGl0J3Mgbm90IGRlY2xhcmVkIHRoZXJlIGFscmVhZHkuXG4gICAqL1xuICByZWZlcmVuY2VUeXBlKHJlZjogUmVmZXJlbmNlKTogdHMuVHlwZU5vZGUge1xuICAgIGNvbnN0IG5nRXhwciA9IHRoaXMucmVmRW1pdHRlci5lbWl0KFxuICAgICAgICByZWYsIHRoaXMuY29udGV4dEZpbGUsIEltcG9ydEZsYWdzLk5vQWxpYXNpbmcgfCBJbXBvcnRGbGFncy5BbGxvd1R5cGVJbXBvcnRzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBgRXhwcmVzc2lvblR5cGVgIGZyb20gdGhlIGBFeHByZXNzaW9uYCBhbmQgdHJhbnNsYXRlIGl0IHZpYSBgdHJhbnNsYXRlVHlwZWAuXG4gICAgLy8gVE9ETyhhbHhodWIpOiBzdXBwb3J0IHJlZmVyZW5jZXMgdG8gdHlwZXMgd2l0aCBnZW5lcmljIGFyZ3VtZW50cyBpbiBhIGNsZWFuIHdheS5cbiAgICByZXR1cm4gdHJhbnNsYXRlVHlwZShuZXcgRXhwcmVzc2lvblR5cGUobmdFeHByLmV4cHJlc3Npb24pLCB0aGlzLmltcG9ydE1hbmFnZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbWl0VHlwZVBhcmFtZXRlcnMoZGVjbGFyYXRpb246IENsYXNzRGVjbGFyYXRpb248dHMuQ2xhc3NEZWNsYXJhdGlvbj4pOlxuICAgICAgdHMuVHlwZVBhcmFtZXRlckRlY2xhcmF0aW9uW118dW5kZWZpbmVkIHtcbiAgICBjb25zdCBlbWl0dGVyID0gbmV3IFR5cGVQYXJhbWV0ZXJFbWl0dGVyKGRlY2xhcmF0aW9uLnR5cGVQYXJhbWV0ZXJzLCB0aGlzLnJlZmxlY3Rvcik7XG4gICAgcmV0dXJuIGVtaXR0ZXIuZW1pdChyZWYgPT4gdGhpcy5yZWZlcmVuY2VUeXBlKHJlZikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgYHRzLlR5cGVOb2RlYCB0aGF0IHJlZmVyZW5jZXMgYSBnaXZlbiB0eXBlIGZyb20gdGhlIHByb3ZpZGVkIG1vZHVsZS5cbiAgICpcbiAgICogVGhpcyB3aWxsIGludm9sdmUgaW1wb3J0aW5nIHRoZSB0eXBlIGludG8gdGhlIGZpbGUsIGFuZCB3aWxsIGFsc28gYWRkIHR5cGUgcGFyYW1ldGVycyBpZlxuICAgKiBwcm92aWRlZC5cbiAgICovXG4gIHJlZmVyZW5jZUV4dGVybmFsVHlwZShtb2R1bGVOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZywgdHlwZVBhcmFtcz86IFR5cGVbXSk6IHRzLlR5cGVOb2RlIHtcbiAgICBjb25zdCBleHRlcm5hbCA9IG5ldyBFeHRlcm5hbEV4cHIoe21vZHVsZU5hbWUsIG5hbWV9KTtcbiAgICByZXR1cm4gdHJhbnNsYXRlVHlwZShcbiAgICAgICAgbmV3IEV4cHJlc3Npb25UeXBlKGV4dGVybmFsLCBbLyogbW9kaWZpZXJzICovXSwgdHlwZVBhcmFtcyksIHRoaXMuaW1wb3J0TWFuYWdlcik7XG4gIH1cblxuICBnZXRQcmVsdWRlU3RhdGVtZW50cygpOiB0cy5TdGF0ZW1lbnRbXSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIC4uLnRoaXMucGlwZUluc3RTdGF0ZW1lbnRzLFxuICAgICAgLi4udGhpcy50eXBlQ3RvclN0YXRlbWVudHMsXG4gICAgXTtcbiAgfVxufVxuIl19