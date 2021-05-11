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
        define("@angular/compiler-cli/src/ngtsc/transform/src/transform", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/imports/src/default", "@angular/compiler-cli/src/ngtsc/perf", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/visitor", "@angular/compiler-cli/src/ngtsc/transform/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ivyTransformFactory = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var default_1 = require("@angular/compiler-cli/src/ngtsc/imports/src/default");
    var perf_1 = require("@angular/compiler-cli/src/ngtsc/perf");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var visitor_1 = require("@angular/compiler-cli/src/ngtsc/util/src/visitor");
    var utils_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/utils");
    var NO_DECORATORS = new Set();
    var CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;
    function ivyTransformFactory(compilation, reflector, importRewriter, defaultImportTracker, perf, isCore, isClosureCompilerEnabled) {
        var recordWrappedNode = createRecorderFn(defaultImportTracker);
        return function (context) {
            return function (file) {
                return perf.inPhase(perf_1.PerfPhase.Compile, function () { return transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNode); });
            };
        };
    }
    exports.ivyTransformFactory = ivyTransformFactory;
    /**
     * Visits all classes, performs Ivy compilation where Angular decorators are present and collects
     * result in a Map that associates a ts.ClassDeclaration with Ivy compilation results. This visitor
     * does NOT perform any TS transformations.
     */
    var IvyCompilationVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(IvyCompilationVisitor, _super);
        function IvyCompilationVisitor(compilation, constantPool) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.constantPool = constantPool;
            _this.classCompilationMap = new Map();
            return _this;
        }
        IvyCompilationVisitor.prototype.visitClassDeclaration = function (node) {
            // Determine if this class has an Ivy field that needs to be added, and compile the field
            // to an expression if so.
            var result = this.compilation.compile(node, this.constantPool);
            if (result !== null) {
                this.classCompilationMap.set(node, result);
            }
            return { node: node };
        };
        return IvyCompilationVisitor;
    }(visitor_1.Visitor));
    /**
     * Visits all classes and performs transformation of corresponding TS nodes based on the Ivy
     * compilation results (provided as an argument).
     */
    var IvyTransformationVisitor = /** @class */ (function (_super) {
        tslib_1.__extends(IvyTransformationVisitor, _super);
        function IvyTransformationVisitor(compilation, classCompilationMap, reflector, importManager, recordWrappedNode, isClosureCompilerEnabled, isCore) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.classCompilationMap = classCompilationMap;
            _this.reflector = reflector;
            _this.importManager = importManager;
            _this.recordWrappedNode = recordWrappedNode;
            _this.isClosureCompilerEnabled = isClosureCompilerEnabled;
            _this.isCore = isCore;
            return _this;
        }
        IvyTransformationVisitor.prototype.visitClassDeclaration = function (node) {
            var e_1, _a;
            var _this = this;
            // If this class is not registered in the map, it means that it doesn't have Angular decorators,
            // thus no further processing is required.
            if (!this.classCompilationMap.has(node)) {
                return { node: node };
            }
            // There is at least one field to add.
            var statements = [];
            var members = tslib_1.__spread(node.members);
            try {
                for (var _b = tslib_1.__values(this.classCompilationMap.get(node)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var field = _c.value;
                    // Translate the initializer for the field into TS nodes.
                    var exprNode = translator_1.translateExpression(field.initializer, this.importManager, { recordWrappedNode: this.recordWrappedNode });
                    // Create a static property declaration for the new field.
                    var property = ts.createProperty(undefined, [ts.createToken(ts.SyntaxKind.StaticKeyword)], field.name, undefined, undefined, exprNode);
                    if (this.isClosureCompilerEnabled) {
                        // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
                        // prevent this transformation, such assignments need to be annotated with @nocollapse.
                        // Note that tsickle is typically responsible for adding such annotations, however it
                        // doesn't yet handle synthetic fields added during other transformations.
                        ts.addSyntheticLeadingComment(property, ts.SyntaxKind.MultiLineCommentTrivia, '* @nocollapse ', 
                        /* hasTrailingNewLine */ false);
                    }
                    field.statements
                        .map(function (stmt) { return translator_1.translateStatement(stmt, _this.importManager, { recordWrappedNode: _this.recordWrappedNode }); })
                        .forEach(function (stmt) { return statements.push(stmt); });
                    members.push(property);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Replace the class declaration with an updated version.
            node = ts.updateClassDeclaration(node, 
            // Remove the decorator which triggered this compilation, leaving the others alone.
            maybeFilterDecorator(node.decorators, this.compilation.decoratorsFor(node)), node.modifiers, node.name, node.typeParameters, node.heritageClauses || [], 
            // Map over the class members and remove any Angular decorators from them.
            members.map(function (member) { return _this._stripAngularDecorators(member); }));
            return { node: node, after: statements };
        };
        /**
         * Return all decorators on a `Declaration` which are from @angular/core, or an empty set if none
         * are.
         */
        IvyTransformationVisitor.prototype._angularCoreDecorators = function (decl) {
            var _this = this;
            var decorators = this.reflector.getDecoratorsOfDeclaration(decl);
            if (decorators === null) {
                return NO_DECORATORS;
            }
            var coreDecorators = decorators.filter(function (dec) { return _this.isCore || isFromAngularCore(dec); })
                .map(function (dec) { return dec.node; });
            if (coreDecorators.length > 0) {
                return new Set(coreDecorators);
            }
            else {
                return NO_DECORATORS;
            }
        };
        /**
         * Given a `ts.Node`, filter the decorators array and return a version containing only non-Angular
         * decorators.
         *
         * If all decorators are removed (or none existed in the first place), this method returns
         * `undefined`.
         */
        IvyTransformationVisitor.prototype._nonCoreDecoratorsOnly = function (node) {
            // Shortcut if the node has no decorators.
            if (node.decorators === undefined) {
                return undefined;
            }
            // Build a Set of the decorators on this node from @angular/core.
            var coreDecorators = this._angularCoreDecorators(node);
            if (coreDecorators.size === node.decorators.length) {
                // If all decorators are to be removed, return `undefined`.
                return undefined;
            }
            else if (coreDecorators.size === 0) {
                // If no decorators need to be removed, return the original decorators array.
                return node.decorators;
            }
            // Filter out the core decorators.
            var filtered = node.decorators.filter(function (dec) { return !coreDecorators.has(dec); });
            // If no decorators survive, return `undefined`. This can only happen if a core decorator is
            // repeated on the node.
            if (filtered.length === 0) {
                return undefined;
            }
            // Create a new `NodeArray` with the filtered decorators that sourcemaps back to the original.
            var array = ts.createNodeArray(filtered);
            array.pos = node.decorators.pos;
            array.end = node.decorators.end;
            return array;
        };
        /**
         * Remove Angular decorators from a `ts.Node` in a shallow manner.
         *
         * This will remove decorators from class elements (getters, setters, properties, methods) as well
         * as parameters of constructors.
         */
        IvyTransformationVisitor.prototype._stripAngularDecorators = function (node) {
            var _this = this;
            if (ts.isParameter(node)) {
                // Strip decorators from parameters (probably of the constructor).
                node = ts.updateParameter(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isMethodDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of methods.
                node = ts.updateMethod(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body);
            }
            else if (ts.isPropertyDeclaration(node) && node.decorators !== undefined) {
                // Strip decorators of properties.
                node = ts.updateProperty(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.questionToken, node.type, node.initializer);
            }
            else if (ts.isGetAccessor(node)) {
                // Strip decorators of getters.
                node = ts.updateGetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.type, node.body);
            }
            else if (ts.isSetAccessor(node)) {
                // Strip decorators of setters.
                node = ts.updateSetAccessor(node, this._nonCoreDecoratorsOnly(node), node.modifiers, node.name, node.parameters, node.body);
            }
            else if (ts.isConstructorDeclaration(node)) {
                // For constructors, strip decorators of the parameters.
                var parameters = node.parameters.map(function (param) { return _this._stripAngularDecorators(param); });
                node =
                    ts.updateConstructor(node, node.decorators, node.modifiers, parameters, node.body);
            }
            return node;
        };
        return IvyTransformationVisitor;
    }(visitor_1.Visitor));
    /**
     * A transformer which operates on ts.SourceFiles and applies changes from an `IvyCompilation`.
     */
    function transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNode) {
        var constantPool = new compiler_1.ConstantPool(isClosureCompilerEnabled);
        var importManager = new translator_1.ImportManager(importRewriter);
        // The transformation process consists of 2 steps:
        //
        //  1. Visit all classes, perform compilation and collect the results.
        //  2. Perform actual transformation of required TS nodes using compilation results from the first
        //     step.
        //
        // This is needed to have all `o.Expression`s generated before any TS transforms happen. This
        // allows `ConstantPool` to properly identify expressions that can be shared across multiple
        // components declared in the same file.
        // Step 1. Go though all classes in AST, perform compilation and collect the results.
        var compilationVisitor = new IvyCompilationVisitor(compilation, constantPool);
        visitor_1.visit(file, compilationVisitor, context);
        // Step 2. Scan through the AST again and perform transformations based on Ivy compilation
        // results obtained at Step 1.
        var transformationVisitor = new IvyTransformationVisitor(compilation, compilationVisitor.classCompilationMap, reflector, importManager, recordWrappedNode, isClosureCompilerEnabled, isCore);
        var sf = visitor_1.visit(file, transformationVisitor, context);
        // Generate the constant statements first, as they may involve adding additional imports
        // to the ImportManager.
        var downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts.ScriptTarget.ES2015;
        var constants = constantPool.statements.map(function (stmt) { return translator_1.translateStatement(stmt, importManager, {
            recordWrappedNode: recordWrappedNode,
            downlevelTaggedTemplates: downlevelTranslatedCode,
            downlevelVariableDeclarations: downlevelTranslatedCode,
        }); });
        // Preserve @fileoverview comments required by Closure, since the location might change as a
        // result of adding extra imports and constant pool statements.
        var fileOverviewMeta = isClosureCompilerEnabled ? getFileOverviewComment(sf.statements) : null;
        // Add new imports for this file.
        sf = utils_1.addImports(importManager, sf, constants);
        if (fileOverviewMeta !== null) {
            setFileOverviewComment(sf, fileOverviewMeta);
        }
        return sf;
    }
    /**
     * Compute the correct target output for `$localize` messages generated by Angular
     *
     * In some versions of TypeScript, the transformation of synthetic `$localize` tagged template
     * literals is broken. See https://github.com/microsoft/TypeScript/issues/38485
     *
     * Here we compute what the expected final output target of the compilation will
     * be so that we can generate ES5 compliant `$localize` calls instead of relying upon TS to do the
     * downleveling for us.
     */
    function getLocalizeCompileTarget(context) {
        var target = context.getCompilerOptions().target || ts.ScriptTarget.ES2015;
        return target !== ts.ScriptTarget.JSON ? target : ts.ScriptTarget.ES2015;
    }
    function getFileOverviewComment(statements) {
        if (statements.length > 0) {
            var host = statements[0];
            var trailing = false;
            var comments = ts.getSyntheticLeadingComments(host);
            // If @fileoverview tag is not found in source file, tsickle produces fake node with trailing
            // comment and inject it at the very beginning of the generated file. So we need to check for
            // leading as well as trailing comments.
            if (!comments || comments.length === 0) {
                trailing = true;
                comments = ts.getSyntheticTrailingComments(host);
            }
            if (comments && comments.length > 0 && CLOSURE_FILE_OVERVIEW_REGEXP.test(comments[0].text)) {
                return { comments: comments, host: host, trailing: trailing };
            }
        }
        return null;
    }
    function setFileOverviewComment(sf, fileoverview) {
        var comments = fileoverview.comments, host = fileoverview.host, trailing = fileoverview.trailing;
        // If host statement is no longer the first one, it means that extra statements were added at the
        // very beginning, so we need to relocate @fileoverview comment and cleanup the original statement
        // that hosted it.
        if (sf.statements.length > 0 && host !== sf.statements[0]) {
            if (trailing) {
                ts.setSyntheticTrailingComments(host, undefined);
            }
            else {
                ts.setSyntheticLeadingComments(host, undefined);
            }
            ts.setSyntheticLeadingComments(sf.statements[0], comments);
        }
    }
    function maybeFilterDecorator(decorators, toRemove) {
        if (decorators === undefined) {
            return undefined;
        }
        var filtered = decorators.filter(function (dec) { return toRemove.find(function (decToRemove) { return ts.getOriginalNode(dec) === decToRemove; }) === undefined; });
        if (filtered.length === 0) {
            return undefined;
        }
        return ts.createNodeArray(filtered);
    }
    function isFromAngularCore(decorator) {
        return decorator.import !== null && decorator.import.from === '@angular/core';
    }
    function createRecorderFn(defaultImportTracker) {
        return function (node) {
            var importDecl = default_1.getDefaultImportDeclaration(node);
            if (importDecl !== null) {
                defaultImportTracker.recordUsedImport(importDecl);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2Zvcm0vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsOENBQStDO0lBQy9DLCtCQUFpQztJQUdqQywrRUFBc0U7SUFDdEUsNkRBQW1EO0lBRW5ELHlFQUE2RztJQUM3Ryw0RUFBNEU7SUFJNUUsNkVBQW1DO0lBRW5DLElBQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFnQixDQUFDO0lBRTlDLElBQU0sNEJBQTRCLEdBQUcsc0JBQXNCLENBQUM7SUFXNUQsU0FBZ0IsbUJBQW1CLENBQy9CLFdBQTBCLEVBQUUsU0FBeUIsRUFBRSxjQUE4QixFQUNyRixvQkFBMEMsRUFBRSxJQUFrQixFQUFFLE1BQWUsRUFDL0Usd0JBQWlDO1FBQ25DLElBQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNqRSxPQUFPLFVBQUMsT0FBaUM7WUFDdkMsT0FBTyxVQUFDLElBQW1CO2dCQUN6QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQ2YsZ0JBQVMsQ0FBQyxPQUFPLEVBQ2pCLGNBQU0sT0FBQSxzQkFBc0IsQ0FDeEIsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQzdELHdCQUF3QixFQUFFLGlCQUFpQixDQUFDLEVBRjFDLENBRTBDLENBQUMsQ0FBQztZQUN4RCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUM7SUFDSixDQUFDO0lBZEQsa0RBY0M7SUFFRDs7OztPQUlHO0lBQ0g7UUFBb0MsaURBQU87UUFHekMsK0JBQW9CLFdBQTBCLEVBQVUsWUFBMEI7WUFBbEYsWUFDRSxpQkFBTyxTQUNSO1lBRm1CLGlCQUFXLEdBQVgs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QWdCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDbkQ7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEZWZhdWx0SW1wb3J0VHJhY2tlciwgSW1wb3J0UmV3cml0ZXJ9IGZyb20gJy4uLy4uL2ltcG9ydHMnO1xuaW1wb3J0IHtnZXREZWZhdWx0SW1wb3J0RGVjbGFyYXRpb259IGZyb20gJy4uLy4uL2ltcG9ydHMvc3JjL2RlZmF1bHQnO1xuaW1wb3J0IHtQZXJmUGhhc2UsIFBlcmZSZWNvcmRlcn0gZnJvbSAnLi4vLi4vcGVyZic7XG5pbXBvcnQge0RlY29yYXRvciwgUmVmbGVjdGlvbkhvc3R9IGZyb20gJy4uLy4uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyLCBSZWNvcmRXcmFwcGVkTm9kZUZuLCB0cmFuc2xhdGVFeHByZXNzaW9uLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4uLy4uL3RyYW5zbGF0b3InO1xuaW1wb3J0IHt2aXNpdCwgVmlzaXRMaXN0RW50cnlSZXN1bHQsIFZpc2l0b3J9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3Zpc2l0b3InO1xuXG5pbXBvcnQge0NvbXBpbGVSZXN1bHR9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VHJhaXRDb21waWxlcn0gZnJvbSAnLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2FkZEltcG9ydHN9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBOT19ERUNPUkFUT1JTID0gbmV3IFNldDx0cy5EZWNvcmF0b3I+KCk7XG5cbmNvbnN0IENMT1NVUkVfRklMRV9PVkVSVklFV19SRUdFWFAgPSAvXFxzK0BmaWxlb3ZlcnZpZXdcXHMrL2k7XG5cbi8qKlxuICogTWV0YWRhdGEgdG8gc3VwcG9ydCBAZmlsZW92ZXJ2aWV3IGJsb2NrcyAoQ2xvc3VyZSBhbm5vdGF0aW9ucykgZXh0cmFjdGluZy9yZXN0b3JpbmcuXG4gKi9cbmludGVyZmFjZSBGaWxlT3ZlcnZpZXdNZXRhIHtcbiAgY29tbWVudHM6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdO1xuICBob3N0OiB0cy5TdGF0ZW1lbnQ7XG4gIHRyYWlsaW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXZ5VHJhbnNmb3JtRmFjdG9yeShcbiAgICBjb21waWxhdGlvbjogVHJhaXRDb21waWxlciwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgaW1wb3J0UmV3cml0ZXI6IEltcG9ydFJld3JpdGVyLFxuICAgIGRlZmF1bHRJbXBvcnRUcmFja2VyOiBEZWZhdWx0SW1wb3J0VHJhY2tlciwgcGVyZjogUGVyZlJlY29yZGVyLCBpc0NvcmU6IGJvb2xlYW4sXG4gICAgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgY29uc3QgcmVjb3JkV3JhcHBlZE5vZGUgPSBjcmVhdGVSZWNvcmRlckZuKGRlZmF1bHRJbXBvcnRUcmFja2VyKTtcbiAgcmV0dXJuIChjb250ZXh0OiB0cy5UcmFuc2Zvcm1hdGlvbkNvbnRleHQpOiB0cy5UcmFuc2Zvcm1lcjx0cy5Tb3VyY2VGaWxlPiA9PiB7XG4gICAgcmV0dXJuIChmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuU291cmNlRmlsZSA9PiB7XG4gICAgICByZXR1cm4gcGVyZi5pblBoYXNlKFxuICAgICAgICAgIFBlcmZQaGFzZS5Db21waWxlLFxuICAgICAgICAgICgpID0+IHRyYW5zZm9ybUl2eVNvdXJjZUZpbGUoXG4gICAgICAgICAgICAgIGNvbXBpbGF0aW9uLCBjb250ZXh0LCByZWZsZWN0b3IsIGltcG9ydFJld3JpdGVyLCBmaWxlLCBpc0NvcmUsXG4gICAgICAgICAgICAgIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCwgcmVjb3JkV3JhcHBlZE5vZGUpKTtcbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIFZpc2l0cyBhbGwgY2xhc3NlcywgcGVyZm9ybXMgSXZ5IGNvbXBpbGF0aW9uIHdoZXJlIEFuZ3VsYXIgZGVjb3JhdG9ycyBhcmUgcHJlc2VudCBhbmQgY29sbGVjdHNcbiAqIHJlc3VsdCBpbiBhIE1hcCB0aGF0IGFzc29jaWF0ZXMgYSB0cy5DbGFzc0RlY2xhcmF0aW9uIHdpdGggSXZ5IGNvbXBpbGF0aW9uIHJlc3VsdHMuIFRoaXMgdmlzaXRvclxuICogZG9lcyBOT1QgcGVyZm9ybSBhbnkgVFMgdHJhbnNmb3JtYXRpb25zLlxuICovXG5jbGFzcyBJdnlDb21waWxhdGlvblZpc2l0b3IgZXh0ZW5kcyBWaXNpdG9yIHtcbiAgcHVibGljIGNsYXNzQ29tcGlsYXRpb25NYXAgPSBuZXcgTWFwPHRzLkNsYXNzRGVjbGFyYXRpb24sIENvbXBpbGVSZXN1bHRbXT4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbXBpbGF0aW9uOiBUcmFpdENvbXBpbGVyLCBwcml2YXRlIGNvbnN0YW50UG9vbDogQ29uc3RhbnRQb29sKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIFZpc2l0TGlzdEVudHJ5UmVzdWx0PHRzLlN0YXRlbWVudCwgdHMuQ2xhc3NEZWNsYXJhdGlvbj4ge1xuICAgIC8vIERldGVybWluZSBpZiB0aGlzIGNsYXNzIGhhcyBhbiBJdnkgZmllbGQgdGhhdCBuZWVkcyB0byBiZSBhZGRlZCwgYW5kIGNvbXBpbGUgdGhlIGZpZWxkXG4gICAgLy8gdG8gYW4gZXhwcmVzc2lvbiBpZiBzby5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmNvbXBpbGF0aW9uLmNvbXBpbGUobm9kZSwgdGhpcy5jb25zdGFudFBvb2wpO1xuICAgIGlmIChyZXN1bHQgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuY2xhc3NDb21waWxhdGlvbk1hcC5zZXQobm9kZSwgcmVzdWx0KTtcbiAgICB9XG4gICAgcmV0dXJuIHtub2RlfTtcbiAgfVxufVxuXG4vKipcbiAqIFZpc2l0cyBhbGwgY2xhc3NlcyBhbmQgcGVyZm9ybXMgdHJhbnNmb3JtYXRpb24gb2YgY29ycmVzcG9uZGluZyBUUyBub2RlcyBiYXNlZCBvbiB0aGUgSXZ5XG4gKiBjb21waWxhdGlvbiByZXN1bHRzIChwcm92aWRlZCBhcyBhbiBhcmd1bWVudCkuXG4gKi9cbmNsYXNzIEl2eVRyYW5zZm9ybWF0aW9uVmlzaXRvciBleHRlbmRzIFZpc2l0b3Ige1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgY29tcGlsYXRpb246IFRyYWl0Q29tcGlsZXIsXG4gICAgICBwcml2YXRlIGNsYXNzQ29tcGlsYXRpb25NYXA6IE1hcDx0cy5DbGFzc0RlY2xhcmF0aW9uLCBDb21waWxlUmVzdWx0W10+LFxuICAgICAgcHJpdmF0ZSByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LCBwcml2YXRlIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIsXG4gICAgICBwcml2YXRlIHJlY29yZFdyYXBwZWROb2RlOiBSZWNvcmRXcmFwcGVkTm9kZUZuPHRzLkV4cHJlc3Npb24+LFxuICAgICAgcHJpdmF0ZSBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4sIHByaXZhdGUgaXNDb3JlOiBib29sZWFuKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKTpcbiAgICAgIFZpc2l0TGlzdEVudHJ5UmVzdWx0PHRzLlN0YXRlbWVudCwgdHMuQ2xhc3NEZWNsYXJhdGlvbj4ge1xuICAgIC8vIElmIHRoaXMgY2xhc3MgaXMgbm90IHJlZ2lzdGVyZWQgaW4gdGhlIG1hcCwgaXQgbWVhbnMgdGhhdCBpdCBkb2Vzbid0IGhhdmUgQW5ndWxhciBkZWNvcmF0b3JzLFxuICAgIC8vIHRodXMgbm8gZnVydGhlciBwcm9jZXNzaW5nIGlzIHJlcXVpcmVkLlxuICAgIGlmICghdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLmhhcyhub2RlKSkge1xuICAgICAgcmV0dXJuIHtub2RlfTtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSBpcyBhdCBsZWFzdCBvbmUgZmllbGQgdG8gYWRkLlxuICAgIGNvbnN0IHN0YXRlbWVudHM6IHRzLlN0YXRlbWVudFtdID0gW107XG4gICAgY29uc3QgbWVtYmVycyA9IFsuLi5ub2RlLm1lbWJlcnNdO1xuXG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiB0aGlzLmNsYXNzQ29tcGlsYXRpb25NYXAuZ2V0KG5vZGUpISkge1xuICAgICAgLy8gVHJhbnNsYXRlIHRoZSBpbml0aWFsaXplciBmb3IgdGhlIGZpZWxkIGludG8gVFMgbm9kZXMuXG4gICAgICBjb25zdCBleHByTm9kZSA9IHRyYW5zbGF0ZUV4cHJlc3Npb24oXG4gICAgICAgICAgZmllbGQuaW5pdGlhbGl6ZXIsIHRoaXMuaW1wb3J0TWFuYWdlciwge3JlY29yZFdyYXBwZWROb2RlOiB0aGlzLnJlY29yZFdyYXBwZWROb2RlfSk7XG5cbiAgICAgIC8vIENyZWF0ZSBhIHN0YXRpYyBwcm9wZXJ0eSBkZWNsYXJhdGlvbiBmb3IgdGhlIG5ldyBmaWVsZC5cbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gdHMuY3JlYXRlUHJvcGVydHkoXG4gICAgICAgICAgdW5kZWZpbmVkLCBbdHMuY3JlYXRlVG9rZW4odHMuU3ludGF4S2luZC5TdGF0aWNLZXl3b3JkKV0sIGZpZWxkLm5hbWUsIHVuZGVmaW5lZCxcbiAgICAgICAgICB1bmRlZmluZWQsIGV4cHJOb2RlKTtcblxuICAgICAgaWYgKHRoaXMuaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkKSB7XG4gICAgICAgIC8vIENsb3N1cmUgY29tcGlsZXIgdHJhbnNmb3JtcyB0aGUgZm9ybSBgU2VydmljZS7JtXByb3YgPSBYYCBpbnRvIGBTZXJ2aWNlJMm1cHJvdiA9IFhgLiBUb1xuICAgICAgICAvLyBwcmV2ZW50IHRoaXMgdHJhbnNmb3JtYXRpb24sIHN1Y2ggYXNzaWdubWVudHMgbmVlZCB0byBiZSBhbm5vdGF0ZWQgd2l0aCBAbm9jb2xsYXBzZS5cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRzaWNrbGUgaXMgdHlwaWNhbGx5IHJlc3BvbnNpYmxlIGZvciBhZGRpbmcgc3VjaCBhbm5vdGF0aW9ucywgaG93ZXZlciBpdFxuICAgICAgICAvLyBkb2Vzbid0IHlldCBoYW5kbGUgc3ludGhldGljIGZpZWxkcyBhZGRlZCBkdXJpbmcgb3RoZXIgdHJhbnNmb3JtYXRpb25zLlxuICAgICAgICB0cy5hZGRTeW50aGV0aWNMZWFkaW5nQ29tbWVudChcbiAgICAgICAgICAgIHByb3BlcnR5LCB0cy5TeW50YXhLaW5kLk11bHRpTGluZUNvbW1lbnRUcml2aWEsICcqIEBub2NvbGxhcHNlICcsXG4gICAgICAgICAgICAvKiBoYXNUcmFpbGluZ05ld0xpbmUgKi8gZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICBmaWVsZC5zdGF0ZW1lbnRzXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICAgICAgc3RtdCA9PiB0cmFuc2xhdGVTdGF0ZW1lbnQoXG4gICAgICAgICAgICAgICAgICBzdG10LCB0aGlzLmltcG9ydE1hbmFnZXIsIHtyZWNvcmRXcmFwcGVkTm9kZTogdGhpcy5yZWNvcmRXcmFwcGVkTm9kZX0pKVxuICAgICAgICAgIC5mb3JFYWNoKHN0bXQgPT4gc3RhdGVtZW50cy5wdXNoKHN0bXQpKTtcblxuICAgICAgbWVtYmVycy5wdXNoKHByb3BlcnR5KTtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlIHRoZSBjbGFzcyBkZWNsYXJhdGlvbiB3aXRoIGFuIHVwZGF0ZWQgdmVyc2lvbi5cbiAgICBub2RlID0gdHMudXBkYXRlQ2xhc3NEZWNsYXJhdGlvbihcbiAgICAgICAgbm9kZSxcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBkZWNvcmF0b3Igd2hpY2ggdHJpZ2dlcmVkIHRoaXMgY29tcGlsYXRpb24sIGxlYXZpbmcgdGhlIG90aGVycyBhbG9uZS5cbiAgICAgICAgbWF5YmVGaWx0ZXJEZWNvcmF0b3Iobm9kZS5kZWNvcmF0b3JzLCB0aGlzLmNvbXBpbGF0aW9uLmRlY29yYXRvcnNGb3Iobm9kZSkpLCBub2RlLm1vZGlmaWVycyxcbiAgICAgICAgbm9kZS5uYW1lLCBub2RlLnR5cGVQYXJhbWV0ZXJzLCBub2RlLmhlcml0YWdlQ2xhdXNlcyB8fCBbXSxcbiAgICAgICAgLy8gTWFwIG92ZXIgdGhlIGNsYXNzIG1lbWJlcnMgYW5kIHJlbW92ZSBhbnkgQW5ndWxhciBkZWNvcmF0b3JzIGZyb20gdGhlbS5cbiAgICAgICAgbWVtYmVycy5tYXAobWVtYmVyID0+IHRoaXMuX3N0cmlwQW5ndWxhckRlY29yYXRvcnMobWVtYmVyKSkpO1xuICAgIHJldHVybiB7bm9kZSwgYWZ0ZXI6IHN0YXRlbWVudHN9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbGwgZGVjb3JhdG9ycyBvbiBhIGBEZWNsYXJhdGlvbmAgd2hpY2ggYXJlIGZyb20gQGFuZ3VsYXIvY29yZSwgb3IgYW4gZW1wdHkgc2V0IGlmIG5vbmVcbiAgICogYXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBfYW5ndWxhckNvcmVEZWNvcmF0b3JzKGRlY2w6IHRzLkRlY2xhcmF0aW9uKTogU2V0PHRzLkRlY29yYXRvcj4ge1xuICAgIGNvbnN0IGRlY29yYXRvcnMgPSB0aGlzLnJlZmxlY3Rvci5nZXREZWNvcmF0b3JzT2ZEZWNsYXJhdGlvbihkZWNsKTtcbiAgICBpZiAoZGVjb3JhdG9ycyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIE5PX0RFQ09SQVRPUlM7XG4gICAgfVxuICAgIGNvbnN0IGNvcmVEZWNvcmF0b3JzID0gZGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+IHRoaXMuaXNDb3JlIHx8IGlzRnJvbUFuZ3VsYXJDb3JlKGRlYykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChkZWMgPT4gZGVjLm5vZGUgYXMgdHMuRGVjb3JhdG9yKTtcbiAgICBpZiAoY29yZURlY29yYXRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyBTZXQ8dHMuRGVjb3JhdG9yPihjb3JlRGVjb3JhdG9ycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOT19ERUNPUkFUT1JTO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGB0cy5Ob2RlYCwgZmlsdGVyIHRoZSBkZWNvcmF0b3JzIGFycmF5IGFuZCByZXR1cm4gYSB2ZXJzaW9uIGNvbnRhaW5pbmcgb25seSBub24tQW5ndWxhclxuICAgKiBkZWNvcmF0b3JzLlxuICAgKlxuICAgKiBJZiBhbGwgZGVjb3JhdG9ycyBhcmUgcmVtb3ZlZCAob3Igbm9uZSBleGlzdGVkIGluIHRoZSBmaXJzdCBwbGFjZSksIHRoaXMgbWV0aG9kIHJldHVybnNcbiAgICogYHVuZGVmaW5lZGAuXG4gICAqL1xuICBwcml2YXRlIF9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZTogdHMuRGVjbGFyYXRpb24pOiB0cy5Ob2RlQXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQge1xuICAgIC8vIFNob3J0Y3V0IGlmIHRoZSBub2RlIGhhcyBubyBkZWNvcmF0b3JzLlxuICAgIGlmIChub2RlLmRlY29yYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gQnVpbGQgYSBTZXQgb2YgdGhlIGRlY29yYXRvcnMgb24gdGhpcyBub2RlIGZyb20gQGFuZ3VsYXIvY29yZS5cbiAgICBjb25zdCBjb3JlRGVjb3JhdG9ycyA9IHRoaXMuX2FuZ3VsYXJDb3JlRGVjb3JhdG9ycyhub2RlKTtcblxuICAgIGlmIChjb3JlRGVjb3JhdG9ycy5zaXplID09PSBub2RlLmRlY29yYXRvcnMubGVuZ3RoKSB7XG4gICAgICAvLyBJZiBhbGwgZGVjb3JhdG9ycyBhcmUgdG8gYmUgcmVtb3ZlZCwgcmV0dXJuIGB1bmRlZmluZWRgLlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKGNvcmVEZWNvcmF0b3JzLnNpemUgPT09IDApIHtcbiAgICAgIC8vIElmIG5vIGRlY29yYXRvcnMgbmVlZCB0byBiZSByZW1vdmVkLCByZXR1cm4gdGhlIG9yaWdpbmFsIGRlY29yYXRvcnMgYXJyYXkuXG4gICAgICByZXR1cm4gbm9kZS5kZWNvcmF0b3JzO1xuICAgIH1cblxuICAgIC8vIEZpbHRlciBvdXQgdGhlIGNvcmUgZGVjb3JhdG9ycy5cbiAgICBjb25zdCBmaWx0ZXJlZCA9IG5vZGUuZGVjb3JhdG9ycy5maWx0ZXIoZGVjID0+ICFjb3JlRGVjb3JhdG9ycy5oYXMoZGVjKSk7XG5cbiAgICAvLyBJZiBubyBkZWNvcmF0b3JzIHN1cnZpdmUsIHJldHVybiBgdW5kZWZpbmVkYC4gVGhpcyBjYW4gb25seSBoYXBwZW4gaWYgYSBjb3JlIGRlY29yYXRvciBpc1xuICAgIC8vIHJlcGVhdGVkIG9uIHRoZSBub2RlLlxuICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IGBOb2RlQXJyYXlgIHdpdGggdGhlIGZpbHRlcmVkIGRlY29yYXRvcnMgdGhhdCBzb3VyY2VtYXBzIGJhY2sgdG8gdGhlIG9yaWdpbmFsLlxuICAgIGNvbnN0IGFycmF5ID0gdHMuY3JlYXRlTm9kZUFycmF5KGZpbHRlcmVkKTtcbiAgICAoYXJyYXkucG9zIGFzIG51bWJlcikgPSBub2RlLmRlY29yYXRvcnMucG9zO1xuICAgIChhcnJheS5lbmQgYXMgbnVtYmVyKSA9IG5vZGUuZGVjb3JhdG9ycy5lbmQ7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBBbmd1bGFyIGRlY29yYXRvcnMgZnJvbSBhIGB0cy5Ob2RlYCBpbiBhIHNoYWxsb3cgbWFubmVyLlxuICAgKlxuICAgKiBUaGlzIHdpbGwgcmVtb3ZlIGRlY29yYXRvcnMgZnJvbSBjbGFzcyBlbGVtZW50cyAoZ2V0dGVycywgc2V0dGVycywgcHJvcGVydGllcywgbWV0aG9kcykgYXMgd2VsbFxuICAgKiBhcyBwYXJhbWV0ZXJzIG9mIGNvbnN0cnVjdG9ycy5cbiAgICovXG4gIHByaXZhdGUgX3N0cmlwQW5ndWxhckRlY29yYXRvcnM8VCBleHRlbmRzIHRzLk5vZGU+KG5vZGU6IFQpOiBUIHtcbiAgICBpZiAodHMuaXNQYXJhbWV0ZXIobm9kZSkpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgZnJvbSBwYXJhbWV0ZXJzIChwcm9iYWJseSBvZiB0aGUgY29uc3RydWN0b3IpLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5kb3REb3REb3RUb2tlbixcbiAgICAgICAgICAgICAgICAgbm9kZS5uYW1lLCBub2RlLnF1ZXN0aW9uVG9rZW4sIG5vZGUudHlwZSwgbm9kZS5pbml0aWFsaXplcikgYXMgVCAmXG4gICAgICAgICAgdHMuUGFyYW1ldGVyRGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc01ldGhvZERlY2xhcmF0aW9uKG5vZGUpICYmIG5vZGUuZGVjb3JhdG9ycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIG9mIG1ldGhvZHMuXG4gICAgICBub2RlID0gdHMudXBkYXRlTWV0aG9kKFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLmFzdGVyaXNrVG9rZW4sXG4gICAgICAgICAgICAgICAgIG5vZGUubmFtZSwgbm9kZS5xdWVzdGlvblRva2VuLCBub2RlLnR5cGVQYXJhbWV0ZXJzLCBub2RlLnBhcmFtZXRlcnMsIG5vZGUudHlwZSxcbiAgICAgICAgICAgICAgICAgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5NZXRob2REZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzUHJvcGVydHlEZWNsYXJhdGlvbihub2RlKSAmJiBub2RlLmRlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBwcm9wZXJ0aWVzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgIG5vZGUucXVlc3Rpb25Ub2tlbiwgbm9kZS50eXBlLCBub2RlLmluaXRpYWxpemVyKSBhcyBUICZcbiAgICAgICAgICB0cy5Qcm9wZXJ0eURlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNHZXRBY2Nlc3Nvcihub2RlKSkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBnZXR0ZXJzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZUdldEFjY2Vzc29yKFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgIG5vZGUucGFyYW1ldGVycywgbm9kZS50eXBlLCBub2RlLmJvZHkpIGFzIFQgJlxuICAgICAgICAgIHRzLkdldEFjY2Vzc29yRGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc1NldEFjY2Vzc29yKG5vZGUpKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIG9mIHNldHRlcnMuXG4gICAgICBub2RlID0gdHMudXBkYXRlU2V0QWNjZXNzb3IoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUubmFtZSxcbiAgICAgICAgICAgICAgICAgbm9kZS5wYXJhbWV0ZXJzLCBub2RlLmJvZHkpIGFzIFQgJlxuICAgICAgICAgIHRzLlNldEFjY2Vzc29yRGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc0NvbnN0cnVjdG9yRGVjbGFyYXRpb24obm9kZSkpIHtcbiAgICAgIC8vIEZvciBjb25zdHJ1Y3RvcnMsIHN0cmlwIGRlY29yYXRvcnMgb2YgdGhlIHBhcmFtZXRlcnMuXG4gICAgICBjb25zdCBwYXJhbWV0ZXJzID0gbm9kZS5wYXJhbWV0ZXJzLm1hcChwYXJhbSA9PiB0aGlzLl9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzKHBhcmFtKSk7XG4gICAgICBub2RlID1cbiAgICAgICAgICB0cy51cGRhdGVDb25zdHJ1Y3Rvcihub2RlLCBub2RlLmRlY29yYXRvcnMsIG5vZGUubW9kaWZpZXJzLCBwYXJhbWV0ZXJzLCBub2RlLmJvZHkpIGFzIFQgJlxuICAgICAgICAgIHRzLkNvbnN0cnVjdG9yRGVjbGFyYXRpb247XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xuICB9XG59XG5cbi8qKlxuICogQSB0cmFuc2Zvcm1lciB3aGljaCBvcGVyYXRlcyBvbiB0cy5Tb3VyY2VGaWxlcyBhbmQgYXBwbGllcyBjaGFuZ2VzIGZyb20gYW4gYEl2eUNvbXBpbGF0aW9uYC5cbiAqL1xuZnVuY3Rpb24gdHJhbnNmb3JtSXZ5U291cmNlRmlsZShcbiAgICBjb21waWxhdGlvbjogVHJhaXRDb21waWxlciwgY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0LCByZWZsZWN0b3I6IFJlZmxlY3Rpb25Ib3N0LFxuICAgIGltcG9ydFJld3JpdGVyOiBJbXBvcnRSZXdyaXRlciwgZmlsZTogdHMuU291cmNlRmlsZSwgaXNDb3JlOiBib29sZWFuLFxuICAgIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZDogYm9vbGVhbixcbiAgICByZWNvcmRXcmFwcGVkTm9kZTogUmVjb3JkV3JhcHBlZE5vZGVGbjx0cy5FeHByZXNzaW9uPik6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCk7XG4gIGNvbnN0IGltcG9ydE1hbmFnZXIgPSBuZXcgSW1wb3J0TWFuYWdlcihpbXBvcnRSZXdyaXRlcik7XG5cbiAgLy8gVGhlIHRyYW5zZm9ybWF0aW9uIHByb2Nlc3MgY29uc2lzdHMgb2YgMiBzdGVwczpcbiAgLy9cbiAgLy8gIDEuIFZpc2l0IGFsbCBjbGFzc2VzLCBwZXJmb3JtIGNvbXBpbGF0aW9uIGFuZCBjb2xsZWN0IHRoZSByZXN1bHRzLlxuICAvLyAgMi4gUGVyZm9ybSBhY3R1YWwgdHJhbnNmb3JtYXRpb24gb2YgcmVxdWlyZWQgVFMgbm9kZXMgdXNpbmcgY29tcGlsYXRpb24gcmVzdWx0cyBmcm9tIHRoZSBmaXJzdFxuICAvLyAgICAgc3RlcC5cbiAgLy9cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gaGF2ZSBhbGwgYG8uRXhwcmVzc2lvbmBzIGdlbmVyYXRlZCBiZWZvcmUgYW55IFRTIHRyYW5zZm9ybXMgaGFwcGVuLiBUaGlzXG4gIC8vIGFsbG93cyBgQ29uc3RhbnRQb29sYCB0byBwcm9wZXJseSBpZGVudGlmeSBleHByZXNzaW9ucyB0aGF0IGNhbiBiZSBzaGFyZWQgYWNyb3NzIG11bHRpcGxlXG4gIC8vIGNvbXBvbmVudHMgZGVjbGFyZWQgaW4gdGhlIHNhbWUgZmlsZS5cblxuICAvLyBTdGVwIDEuIEdvIHRob3VnaCBhbGwgY2xhc3NlcyBpbiBBU1QsIHBlcmZvcm0gY29tcGlsYXRpb24gYW5kIGNvbGxlY3QgdGhlIHJlc3VsdHMuXG4gIGNvbnN0IGNvbXBpbGF0aW9uVmlzaXRvciA9IG5ldyBJdnlDb21waWxhdGlvblZpc2l0b3IoY29tcGlsYXRpb24sIGNvbnN0YW50UG9vbCk7XG4gIHZpc2l0KGZpbGUsIGNvbXBpbGF0aW9uVmlzaXRvciwgY29udGV4dCk7XG5cbiAgLy8gU3RlcCAyLiBTY2FuIHRocm91Z2ggdGhlIEFTVCBhZ2FpbiBhbmQgcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbnMgYmFzZWQgb24gSXZ5IGNvbXBpbGF0aW9uXG4gIC8vIHJlc3VsdHMgb2J0YWluZWQgYXQgU3RlcCAxLlxuICBjb25zdCB0cmFuc2Zvcm1hdGlvblZpc2l0b3IgPSBuZXcgSXZ5VHJhbnNmb3JtYXRpb25WaXNpdG9yKFxuICAgICAgY29tcGlsYXRpb24sIGNvbXBpbGF0aW9uVmlzaXRvci5jbGFzc0NvbXBpbGF0aW9uTWFwLCByZWZsZWN0b3IsIGltcG9ydE1hbmFnZXIsXG4gICAgICByZWNvcmRXcmFwcGVkTm9kZSwgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkLCBpc0NvcmUpO1xuICBsZXQgc2YgPSB2aXNpdChmaWxlLCB0cmFuc2Zvcm1hdGlvblZpc2l0b3IsIGNvbnRleHQpO1xuXG4gIC8vIEdlbmVyYXRlIHRoZSBjb25zdGFudCBzdGF0ZW1lbnRzIGZpcnN0LCBhcyB0aGV5IG1heSBpbnZvbHZlIGFkZGluZyBhZGRpdGlvbmFsIGltcG9ydHNcbiAgLy8gdG8gdGhlIEltcG9ydE1hbmFnZXIuXG4gIGNvbnN0IGRvd25sZXZlbFRyYW5zbGF0ZWRDb2RlID0gZ2V0TG9jYWxpemVDb21waWxlVGFyZ2V0KGNvbnRleHQpIDwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNTtcbiAgY29uc3QgY29uc3RhbnRzID1cbiAgICAgIGNvbnN0YW50UG9vbC5zdGF0ZW1lbnRzLm1hcChzdG10ID0+IHRyYW5zbGF0ZVN0YXRlbWVudChzdG10LCBpbXBvcnRNYW5hZ2VyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvcmRXcmFwcGVkTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sZXZlbFRhZ2dlZFRlbXBsYXRlczogZG93bmxldmVsVHJhbnNsYXRlZENvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubGV2ZWxWYXJpYWJsZURlY2xhcmF0aW9uczogZG93bmxldmVsVHJhbnNsYXRlZENvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gIC8vIFByZXNlcnZlIEBmaWxlb3ZlcnZpZXcgY29tbWVudHMgcmVxdWlyZWQgYnkgQ2xvc3VyZSwgc2luY2UgdGhlIGxvY2F0aW9uIG1pZ2h0IGNoYW5nZSBhcyBhXG4gIC8vIHJlc3VsdCBvZiBhZGRpbmcgZXh0cmEgaW1wb3J0cyBhbmQgY29uc3RhbnQgcG9vbCBzdGF0ZW1lbnRzLlxuICBjb25zdCBmaWxlT3ZlcnZpZXdNZXRhID0gaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkID8gZ2V0RmlsZU92ZXJ2aWV3Q29tbWVudChzZi5zdGF0ZW1lbnRzKSA6IG51bGw7XG5cbiAgLy8gQWRkIG5ldyBpbXBvcnRzIGZvciB0aGlzIGZpbGUuXG4gIHNmID0gYWRkSW1wb3J0cyhpbXBvcnRNYW5hZ2VyLCBzZiwgY29uc3RhbnRzKTtcblxuICBpZiAoZmlsZU92ZXJ2aWV3TWV0YSAhPT0gbnVsbCkge1xuICAgIHNldEZpbGVPdmVydmlld0NvbW1lbnQoc2YsIGZpbGVPdmVydmlld01ldGEpO1xuICB9XG5cbiAgcmV0dXJuIHNmO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNvcnJlY3QgdGFyZ2V0IG91dHB1dCBmb3IgYCRsb2NhbGl6ZWAgbWVzc2FnZXMgZ2VuZXJhdGVkIGJ5IEFuZ3VsYXJcbiAqXG4gKiBJbiBzb21lIHZlcnNpb25zIG9mIFR5cGVTY3JpcHQsIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiBzeW50aGV0aWMgYCRsb2NhbGl6ZWAgdGFnZ2VkIHRlbXBsYXRlXG4gKiBsaXRlcmFscyBpcyBicm9rZW4uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM4NDg1XG4gKlxuICogSGVyZSB3ZSBjb21wdXRlIHdoYXQgdGhlIGV4cGVjdGVkIGZpbmFsIG91dHB1dCB0YXJnZXQgb2YgdGhlIGNvbXBpbGF0aW9uIHdpbGxcbiAqIGJlIHNvIHRoYXQgd2UgY2FuIGdlbmVyYXRlIEVTNSBjb21wbGlhbnQgYCRsb2NhbGl6ZWAgY2FsbHMgaW5zdGVhZCBvZiByZWx5aW5nIHVwb24gVFMgdG8gZG8gdGhlXG4gKiBkb3dubGV2ZWxpbmcgZm9yIHVzLlxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGl6ZUNvbXBpbGVUYXJnZXQoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTpcbiAgICBFeGNsdWRlPHRzLlNjcmlwdFRhcmdldCwgdHMuU2NyaXB0VGFyZ2V0LkpTT04+IHtcbiAgY29uc3QgdGFyZ2V0ID0gY29udGV4dC5nZXRDb21waWxlck9wdGlvbnMoKS50YXJnZXQgfHwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNTtcbiAgcmV0dXJuIHRhcmdldCAhPT0gdHMuU2NyaXB0VGFyZ2V0LkpTT04gPyB0YXJnZXQgOiB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1O1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3ZlcnZpZXdDb21tZW50KHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTogRmlsZU92ZXJ2aWV3TWV0YXxudWxsIHtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGhvc3QgPSBzdGF0ZW1lbnRzWzBdO1xuICAgIGxldCB0cmFpbGluZyA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhob3N0KTtcbiAgICAvLyBJZiBAZmlsZW92ZXJ2aWV3IHRhZyBpcyBub3QgZm91bmQgaW4gc291cmNlIGZpbGUsIHRzaWNrbGUgcHJvZHVjZXMgZmFrZSBub2RlIHdpdGggdHJhaWxpbmdcbiAgICAvLyBjb21tZW50IGFuZCBpbmplY3QgaXQgYXQgdGhlIHZlcnkgYmVnaW5uaW5nIG9mIHRoZSBnZW5lcmF0ZWQgZmlsZS4gU28gd2UgbmVlZCB0byBjaGVjayBmb3JcbiAgICAvLyBsZWFkaW5nIGFzIHdlbGwgYXMgdHJhaWxpbmcgY29tbWVudHMuXG4gICAgaWYgKCFjb21tZW50cyB8fCBjb21tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcbiAgICAgIGNvbW1lbnRzID0gdHMuZ2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhob3N0KTtcbiAgICB9XG4gICAgaWYgKGNvbW1lbnRzICYmIGNvbW1lbnRzLmxlbmd0aCA+IDAgJiYgQ0xPU1VSRV9GSUxFX09WRVJWSUVXX1JFR0VYUC50ZXN0KGNvbW1lbnRzWzBdLnRleHQpKSB7XG4gICAgICByZXR1cm4ge2NvbW1lbnRzLCBob3N0LCB0cmFpbGluZ307XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBzZXRGaWxlT3ZlcnZpZXdDb21tZW50KHNmOiB0cy5Tb3VyY2VGaWxlLCBmaWxlb3ZlcnZpZXc6IEZpbGVPdmVydmlld01ldGEpOiB2b2lkIHtcbiAgY29uc3Qge2NvbW1lbnRzLCBob3N0LCB0cmFpbGluZ30gPSBmaWxlb3ZlcnZpZXc7XG4gIC8vIElmIGhvc3Qgc3RhdGVtZW50IGlzIG5vIGxvbmdlciB0aGUgZmlyc3Qgb25lLCBpdCBtZWFucyB0aGF0IGV4dHJhIHN0YXRlbWVudHMgd2VyZSBhZGRlZCBhdCB0aGVcbiAgLy8gdmVyeSBiZWdpbm5pbmcsIHNvIHdlIG5lZWQgdG8gcmVsb2NhdGUgQGZpbGVvdmVydmlldyBjb21tZW50IGFuZCBjbGVhbnVwIHRoZSBvcmlnaW5hbCBzdGF0ZW1lbnRcbiAgLy8gdGhhdCBob3N0ZWQgaXQuXG4gIGlmIChzZi5zdGF0ZW1lbnRzLmxlbmd0aCA+IDAgJiYgaG9zdCAhPT0gc2Yuc3RhdGVtZW50c1swXSkge1xuICAgIGlmICh0cmFpbGluZykge1xuICAgICAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhob3N0LCB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoaG9zdCwgdW5kZWZpbmVkKTtcbiAgICB9XG4gICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKHNmLnN0YXRlbWVudHNbMF0sIGNvbW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZUZpbHRlckRlY29yYXRvcihcbiAgICBkZWNvcmF0b3JzOiB0cy5Ob2RlQXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQsXG4gICAgdG9SZW1vdmU6IHRzLkRlY29yYXRvcltdKTogdHMuTm9kZUFycmF5PHRzLkRlY29yYXRvcj58dW5kZWZpbmVkIHtcbiAgaWYgKGRlY29yYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgZmlsdGVyZWQgPSBkZWNvcmF0b3JzLmZpbHRlcihcbiAgICAgIGRlYyA9PiB0b1JlbW92ZS5maW5kKGRlY1RvUmVtb3ZlID0+IHRzLmdldE9yaWdpbmFsTm9kZShkZWMpID09PSBkZWNUb1JlbW92ZSkgPT09IHVuZGVmaW5lZCk7XG4gIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0cy5jcmVhdGVOb2RlQXJyYXkoZmlsdGVyZWQpO1xufVxuXG5mdW5jdGlvbiBpc0Zyb21Bbmd1bGFyQ29yZShkZWNvcmF0b3I6IERlY29yYXRvcik6IGJvb2xlYW4ge1xuICByZXR1cm4gZGVjb3JhdG9yLmltcG9ydCAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJztcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVjb3JkZXJGbihkZWZhdWx0SW1wb3J0VHJhY2tlcjogRGVmYXVsdEltcG9ydFRyYWNrZXIpOlxuICAgIFJlY29yZFdyYXBwZWROb2RlRm48dHMuRXhwcmVzc2lvbj4ge1xuICByZXR1cm4gbm9kZSA9PiB7XG4gICAgY29uc3QgaW1wb3J0RGVjbCA9IGdldERlZmF1bHRJbXBvcnREZWNsYXJhdGlvbihub2RlKTtcbiAgICBpZiAoaW1wb3J0RGVjbCAhPT0gbnVsbCkge1xuICAgICAgZGVmYXVsdEltcG9ydFRyYWNrZXIucmVjb3JkVXNlZEltcG9ydChpbXBvcnREZWNsKTtcbiAgICB9XG4gIH07XG59XG4iXX0=