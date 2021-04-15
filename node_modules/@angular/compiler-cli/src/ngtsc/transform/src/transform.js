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
        define("@angular/compiler-cli/src/ngtsc/transform/src/transform", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/visitor", "@angular/compiler-cli/src/ngtsc/transform/src/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ivyTransformFactory = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var visitor_1 = require("@angular/compiler-cli/src/ngtsc/util/src/visitor");
    var utils_1 = require("@angular/compiler-cli/src/ngtsc/transform/src/utils");
    var NO_DECORATORS = new Set();
    var CLOSURE_FILE_OVERVIEW_REGEXP = /\s+@fileoverview\s+/i;
    function ivyTransformFactory(compilation, reflector, importRewriter, defaultImportRecorder, isCore, isClosureCompilerEnabled) {
        var recordWrappedNodeExpr = createRecorderFn(defaultImportRecorder);
        return function (context) {
            return function (file) {
                return transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNodeExpr);
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
        function IvyTransformationVisitor(compilation, classCompilationMap, reflector, importManager, recordWrappedNodeExpr, isClosureCompilerEnabled, isCore) {
            var _this = _super.call(this) || this;
            _this.compilation = compilation;
            _this.classCompilationMap = classCompilationMap;
            _this.reflector = reflector;
            _this.importManager = importManager;
            _this.recordWrappedNodeExpr = recordWrappedNodeExpr;
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
                    var exprNode = translator_1.translateExpression(field.initializer, this.importManager, { recordWrappedNodeExpr: this.recordWrappedNodeExpr });
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
                        .map(function (stmt) { return translator_1.translateStatement(stmt, _this.importManager, { recordWrappedNodeExpr: _this.recordWrappedNodeExpr }); })
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
    function transformIvySourceFile(compilation, context, reflector, importRewriter, file, isCore, isClosureCompilerEnabled, recordWrappedNodeExpr) {
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
        var transformationVisitor = new IvyTransformationVisitor(compilation, compilationVisitor.classCompilationMap, reflector, importManager, recordWrappedNodeExpr, isClosureCompilerEnabled, isCore);
        var sf = visitor_1.visit(file, transformationVisitor, context);
        // Generate the constant statements first, as they may involve adding additional imports
        // to the ImportManager.
        var downlevelTranslatedCode = getLocalizeCompileTarget(context) < ts.ScriptTarget.ES2015;
        var constants = constantPool.statements.map(function (stmt) { return translator_1.translateStatement(stmt, importManager, {
            recordWrappedNodeExpr: recordWrappedNodeExpr,
            downlevelLocalizedStrings: downlevelTranslatedCode,
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
    function createRecorderFn(defaultImportRecorder) {
        return function (expr) {
            if (ts.isIdentifier(expr)) {
                defaultImportRecorder.recordUsedIdentifier(expr);
            }
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9uZ3RzYy90cmFuc2Zvcm0vc3JjL3RyYW5zZm9ybS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsOENBQStDO0lBQy9DLCtCQUFpQztJQUlqQyx5RUFBaUg7SUFDakgsNEVBQTRFO0lBSTVFLDZFQUFtQztJQUVuQyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBZ0IsQ0FBQztJQUU5QyxJQUFNLDRCQUE0QixHQUFHLHNCQUFzQixDQUFDO0lBVzVELFNBQWdCLG1CQUFtQixDQUMvQixXQUEwQixFQUFFLFNBQXlCLEVBQUUsY0FBOEIsRUFDckYscUJBQTRDLEVBQUUsTUFBZSxFQUM3RCx3QkFBaUM7UUFDbkMsSUFBTSxxQkFBcUIsR0FBRyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sVUFBQyxPQUFpQztZQUN2QyxPQUFPLFVBQUMsSUFBbUI7Z0JBQ3pCLE9BQU8sc0JBQXNCLENBQ3pCLFdBQVcsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLHdCQUF3QixFQUN2RixxQkFBcUIsQ0FBQyxDQUFDO1lBQzdCLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQUNKLENBQUM7SUFaRCxrREFZQztJQUVEOzs7O09BSUc7SUFDSDtRQUFvQyxpREFBTztRQUd6QywrQkFBb0IsV0FBMEIsRUFBVSxZQUEwQjtZQUFsRixZQUNFLGlCQUFPLFNBQ1I7WUFGbUIsaUJBQVcsR0FBWCxXQUFXLENBQWU7WUFBVSxrQkFBWSxHQUFaLFlBQVksQ0FBYztZQUYzRSx5QkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBd0MsQ0FBQzs7UUFJN0UsQ0FBQztRQUVELHFEQUFxQixHQUFyQixV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QVMsQ0FBQyxDQUFDO2FBQ2pEO1lBQ0QsRUFBRSxDQUFDLDJCQUEyQixDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDNUQ7SUFDSCxDQUFDO0lBRUQsU0FBUyxvQkFBb0IsQ0FDekIsVUFBZ0QsRUFDaEQsUUFBd0I7UUFDMUIsSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQzVCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsSUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FDOUIsVUFBQSxHQUFHLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsV0FBVyxJQUFJLE9BQUEsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxXQUFXLEVBQXZDLENBQXVDLENBQUMsS0FBSyxTQUFTLEVBQW5GLENBQW1GLENBQUMsQ0FBQztRQUNoRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFRCxTQUFTLGlCQUFpQixDQUFDLFNBQW9CO1FBQzdDLE9BQU8sU0FBUyxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDO0lBQ2hGLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLHFCQUE0QztRQUVwRSxPQUFPLFVBQUEsSUFBSTtZQUNULElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIscUJBQXFCLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEQ7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29uc3RhbnRQb29sfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtEZWZhdWx0SW1wb3J0UmVjb3JkZXIsIEltcG9ydFJld3JpdGVyfSBmcm9tICcuLi8uLi9pbXBvcnRzJztcbmltcG9ydCB7RGVjb3JhdG9yLCBSZWZsZWN0aW9uSG9zdH0gZnJvbSAnLi4vLi4vcmVmbGVjdGlvbic7XG5pbXBvcnQge0ltcG9ydE1hbmFnZXIsIFJlY29yZFdyYXBwZWROb2RlRXhwckZuLCB0cmFuc2xhdGVFeHByZXNzaW9uLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4uLy4uL3RyYW5zbGF0b3InO1xuaW1wb3J0IHt2aXNpdCwgVmlzaXRMaXN0RW50cnlSZXN1bHQsIFZpc2l0b3J9IGZyb20gJy4uLy4uL3V0aWwvc3JjL3Zpc2l0b3InO1xuXG5pbXBvcnQge0NvbXBpbGVSZXN1bHR9IGZyb20gJy4vYXBpJztcbmltcG9ydCB7VHJhaXRDb21waWxlcn0gZnJvbSAnLi9jb21waWxhdGlvbic7XG5pbXBvcnQge2FkZEltcG9ydHN9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBOT19ERUNPUkFUT1JTID0gbmV3IFNldDx0cy5EZWNvcmF0b3I+KCk7XG5cbmNvbnN0IENMT1NVUkVfRklMRV9PVkVSVklFV19SRUdFWFAgPSAvXFxzK0BmaWxlb3ZlcnZpZXdcXHMrL2k7XG5cbi8qKlxuICogTWV0YWRhdGEgdG8gc3VwcG9ydCBAZmlsZW92ZXJ2aWV3IGJsb2NrcyAoQ2xvc3VyZSBhbm5vdGF0aW9ucykgZXh0cmFjdGluZy9yZXN0b3JpbmcuXG4gKi9cbmludGVyZmFjZSBGaWxlT3ZlcnZpZXdNZXRhIHtcbiAgY29tbWVudHM6IHRzLlN5bnRoZXNpemVkQ29tbWVudFtdO1xuICBob3N0OiB0cy5TdGF0ZW1lbnQ7XG4gIHRyYWlsaW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXZ5VHJhbnNmb3JtRmFjdG9yeShcbiAgICBjb21waWxhdGlvbjogVHJhaXRDb21waWxlciwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCwgaW1wb3J0UmV3cml0ZXI6IEltcG9ydFJld3JpdGVyLFxuICAgIGRlZmF1bHRJbXBvcnRSZWNvcmRlcjogRGVmYXVsdEltcG9ydFJlY29yZGVyLCBpc0NvcmU6IGJvb2xlYW4sXG4gICAgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcbiAgY29uc3QgcmVjb3JkV3JhcHBlZE5vZGVFeHByID0gY3JlYXRlUmVjb3JkZXJGbihkZWZhdWx0SW1wb3J0UmVjb3JkZXIpO1xuICByZXR1cm4gKGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCk6IHRzLlRyYW5zZm9ybWVyPHRzLlNvdXJjZUZpbGU+ID0+IHtcbiAgICByZXR1cm4gKGZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Tb3VyY2VGaWxlID0+IHtcbiAgICAgIHJldHVybiB0cmFuc2Zvcm1JdnlTb3VyY2VGaWxlKFxuICAgICAgICAgIGNvbXBpbGF0aW9uLCBjb250ZXh0LCByZWZsZWN0b3IsIGltcG9ydFJld3JpdGVyLCBmaWxlLCBpc0NvcmUsIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCxcbiAgICAgICAgICByZWNvcmRXcmFwcGVkTm9kZUV4cHIpO1xuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogVmlzaXRzIGFsbCBjbGFzc2VzLCBwZXJmb3JtcyBJdnkgY29tcGlsYXRpb24gd2hlcmUgQW5ndWxhciBkZWNvcmF0b3JzIGFyZSBwcmVzZW50IGFuZCBjb2xsZWN0c1xuICogcmVzdWx0IGluIGEgTWFwIHRoYXQgYXNzb2NpYXRlcyBhIHRzLkNsYXNzRGVjbGFyYXRpb24gd2l0aCBJdnkgY29tcGlsYXRpb24gcmVzdWx0cy4gVGhpcyB2aXNpdG9yXG4gKiBkb2VzIE5PVCBwZXJmb3JtIGFueSBUUyB0cmFuc2Zvcm1hdGlvbnMuXG4gKi9cbmNsYXNzIEl2eUNvbXBpbGF0aW9uVmlzaXRvciBleHRlbmRzIFZpc2l0b3Ige1xuICBwdWJsaWMgY2xhc3NDb21waWxhdGlvbk1hcCA9IG5ldyBNYXA8dHMuQ2xhc3NEZWNsYXJhdGlvbiwgQ29tcGlsZVJlc3VsdFtdPigpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29tcGlsYXRpb246IFRyYWl0Q29tcGlsZXIsIHByaXZhdGUgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pOlxuICAgICAgVmlzaXRMaXN0RW50cnlSZXN1bHQ8dHMuU3RhdGVtZW50LCB0cy5DbGFzc0RlY2xhcmF0aW9uPiB7XG4gICAgLy8gRGV0ZXJtaW5lIGlmIHRoaXMgY2xhc3MgaGFzIGFuIEl2eSBmaWVsZCB0aGF0IG5lZWRzIHRvIGJlIGFkZGVkLCBhbmQgY29tcGlsZSB0aGUgZmllbGRcbiAgICAvLyB0byBhbiBleHByZXNzaW9uIGlmIHNvLlxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY29tcGlsYXRpb24uY29tcGlsZShub2RlLCB0aGlzLmNvbnN0YW50UG9vbCk7XG4gICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLnNldChub2RlLCByZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4ge25vZGV9O1xuICB9XG59XG5cbi8qKlxuICogVmlzaXRzIGFsbCBjbGFzc2VzIGFuZCBwZXJmb3JtcyB0cmFuc2Zvcm1hdGlvbiBvZiBjb3JyZXNwb25kaW5nIFRTIG5vZGVzIGJhc2VkIG9uIHRoZSBJdnlcbiAqIGNvbXBpbGF0aW9uIHJlc3VsdHMgKHByb3ZpZGVkIGFzIGFuIGFyZ3VtZW50KS5cbiAqL1xuY2xhc3MgSXZ5VHJhbnNmb3JtYXRpb25WaXNpdG9yIGV4dGVuZHMgVmlzaXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb21waWxhdGlvbjogVHJhaXRDb21waWxlcixcbiAgICAgIHByaXZhdGUgY2xhc3NDb21waWxhdGlvbk1hcDogTWFwPHRzLkNsYXNzRGVjbGFyYXRpb24sIENvbXBpbGVSZXN1bHRbXT4sXG4gICAgICBwcml2YXRlIHJlZmxlY3RvcjogUmVmbGVjdGlvbkhvc3QsIHByaXZhdGUgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlcixcbiAgICAgIHByaXZhdGUgcmVjb3JkV3JhcHBlZE5vZGVFeHByOiBSZWNvcmRXcmFwcGVkTm9kZUV4cHJGbjx0cy5FeHByZXNzaW9uPixcbiAgICAgIHByaXZhdGUgaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkOiBib29sZWFuLCBwcml2YXRlIGlzQ29yZTogYm9vbGVhbikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICB2aXNpdENsYXNzRGVjbGFyYXRpb24obm9kZTogdHMuQ2xhc3NEZWNsYXJhdGlvbik6XG4gICAgICBWaXNpdExpc3RFbnRyeVJlc3VsdDx0cy5TdGF0ZW1lbnQsIHRzLkNsYXNzRGVjbGFyYXRpb24+IHtcbiAgICAvLyBJZiB0aGlzIGNsYXNzIGlzIG5vdCByZWdpc3RlcmVkIGluIHRoZSBtYXAsIGl0IG1lYW5zIHRoYXQgaXQgZG9lc24ndCBoYXZlIEFuZ3VsYXIgZGVjb3JhdG9ycyxcbiAgICAvLyB0aHVzIG5vIGZ1cnRoZXIgcHJvY2Vzc2luZyBpcyByZXF1aXJlZC5cbiAgICBpZiAoIXRoaXMuY2xhc3NDb21waWxhdGlvbk1hcC5oYXMobm9kZSkpIHtcbiAgICAgIHJldHVybiB7bm9kZX07XG4gICAgfVxuXG4gICAgLy8gVGhlcmUgaXMgYXQgbGVhc3Qgb25lIGZpZWxkIHRvIGFkZC5cbiAgICBjb25zdCBzdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSA9IFtdO1xuICAgIGNvbnN0IG1lbWJlcnMgPSBbLi4ubm9kZS5tZW1iZXJzXTtcblxuICAgIGZvciAoY29uc3QgZmllbGQgb2YgdGhpcy5jbGFzc0NvbXBpbGF0aW9uTWFwLmdldChub2RlKSEpIHtcbiAgICAgIC8vIFRyYW5zbGF0ZSB0aGUgaW5pdGlhbGl6ZXIgZm9yIHRoZSBmaWVsZCBpbnRvIFRTIG5vZGVzLlxuICAgICAgY29uc3QgZXhwck5vZGUgPSB0cmFuc2xhdGVFeHByZXNzaW9uKFxuICAgICAgICAgIGZpZWxkLmluaXRpYWxpemVyLCB0aGlzLmltcG9ydE1hbmFnZXIsXG4gICAgICAgICAge3JlY29yZFdyYXBwZWROb2RlRXhwcjogdGhpcy5yZWNvcmRXcmFwcGVkTm9kZUV4cHJ9KTtcblxuICAgICAgLy8gQ3JlYXRlIGEgc3RhdGljIHByb3BlcnR5IGRlY2xhcmF0aW9uIGZvciB0aGUgbmV3IGZpZWxkLlxuICAgICAgY29uc3QgcHJvcGVydHkgPSB0cy5jcmVhdGVQcm9wZXJ0eShcbiAgICAgICAgICB1bmRlZmluZWQsIFt0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpXSwgZmllbGQubmFtZSwgdW5kZWZpbmVkLFxuICAgICAgICAgIHVuZGVmaW5lZCwgZXhwck5vZGUpO1xuXG4gICAgICBpZiAodGhpcy5pc0Nsb3N1cmVDb21waWxlckVuYWJsZWQpIHtcbiAgICAgICAgLy8gQ2xvc3VyZSBjb21waWxlciB0cmFuc2Zvcm1zIHRoZSBmb3JtIGBTZXJ2aWNlLsm1cHJvdiA9IFhgIGludG8gYFNlcnZpY2UkybVwcm92ID0gWGAuIFRvXG4gICAgICAgIC8vIHByZXZlbnQgdGhpcyB0cmFuc2Zvcm1hdGlvbiwgc3VjaCBhc3NpZ25tZW50cyBuZWVkIHRvIGJlIGFubm90YXRlZCB3aXRoIEBub2NvbGxhcHNlLlxuICAgICAgICAvLyBOb3RlIHRoYXQgdHNpY2tsZSBpcyB0eXBpY2FsbHkgcmVzcG9uc2libGUgZm9yIGFkZGluZyBzdWNoIGFubm90YXRpb25zLCBob3dldmVyIGl0XG4gICAgICAgIC8vIGRvZXNuJ3QgeWV0IGhhbmRsZSBzeW50aGV0aWMgZmllbGRzIGFkZGVkIGR1cmluZyBvdGhlciB0cmFuc2Zvcm1hdGlvbnMuXG4gICAgICAgIHRzLmFkZFN5bnRoZXRpY0xlYWRpbmdDb21tZW50KFxuICAgICAgICAgICAgcHJvcGVydHksIHRzLlN5bnRheEtpbmQuTXVsdGlMaW5lQ29tbWVudFRyaXZpYSwgJyogQG5vY29sbGFwc2UgJyxcbiAgICAgICAgICAgIC8qIGhhc1RyYWlsaW5nTmV3TGluZSAqLyBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIGZpZWxkLnN0YXRlbWVudHNcbiAgICAgICAgICAubWFwKFxuICAgICAgICAgICAgICBzdG10ID0+IHRyYW5zbGF0ZVN0YXRlbWVudChcbiAgICAgICAgICAgICAgICAgIHN0bXQsIHRoaXMuaW1wb3J0TWFuYWdlciwge3JlY29yZFdyYXBwZWROb2RlRXhwcjogdGhpcy5yZWNvcmRXcmFwcGVkTm9kZUV4cHJ9KSlcbiAgICAgICAgICAuZm9yRWFjaChzdG10ID0+IHN0YXRlbWVudHMucHVzaChzdG10KSk7XG5cbiAgICAgIG1lbWJlcnMucHVzaChwcm9wZXJ0eSk7XG4gICAgfVxuXG4gICAgLy8gUmVwbGFjZSB0aGUgY2xhc3MgZGVjbGFyYXRpb24gd2l0aCBhbiB1cGRhdGVkIHZlcnNpb24uXG4gICAgbm9kZSA9IHRzLnVwZGF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgIG5vZGUsXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZGVjb3JhdG9yIHdoaWNoIHRyaWdnZXJlZCB0aGlzIGNvbXBpbGF0aW9uLCBsZWF2aW5nIHRoZSBvdGhlcnMgYWxvbmUuXG4gICAgICAgIG1heWJlRmlsdGVyRGVjb3JhdG9yKG5vZGUuZGVjb3JhdG9ycywgdGhpcy5jb21waWxhdGlvbi5kZWNvcmF0b3JzRm9yKG5vZGUpKSwgbm9kZS5tb2RpZmllcnMsXG4gICAgICAgIG5vZGUubmFtZSwgbm9kZS50eXBlUGFyYW1ldGVycywgbm9kZS5oZXJpdGFnZUNsYXVzZXMgfHwgW10sXG4gICAgICAgIC8vIE1hcCBvdmVyIHRoZSBjbGFzcyBtZW1iZXJzIGFuZCByZW1vdmUgYW55IEFuZ3VsYXIgZGVjb3JhdG9ycyBmcm9tIHRoZW0uXG4gICAgICAgIG1lbWJlcnMubWFwKG1lbWJlciA9PiB0aGlzLl9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzKG1lbWJlcikpKTtcbiAgICByZXR1cm4ge25vZGUsIGFmdGVyOiBzdGF0ZW1lbnRzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYWxsIGRlY29yYXRvcnMgb24gYSBgRGVjbGFyYXRpb25gIHdoaWNoIGFyZSBmcm9tIEBhbmd1bGFyL2NvcmUsIG9yIGFuIGVtcHR5IHNldCBpZiBub25lXG4gICAqIGFyZS5cbiAgICovXG4gIHByaXZhdGUgX2FuZ3VsYXJDb3JlRGVjb3JhdG9ycyhkZWNsOiB0cy5EZWNsYXJhdGlvbik6IFNldDx0cy5EZWNvcmF0b3I+IHtcbiAgICBjb25zdCBkZWNvcmF0b3JzID0gdGhpcy5yZWZsZWN0b3IuZ2V0RGVjb3JhdG9yc09mRGVjbGFyYXRpb24oZGVjbCk7XG4gICAgaWYgKGRlY29yYXRvcnMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBOT19ERUNPUkFUT1JTO1xuICAgIH1cbiAgICBjb25zdCBjb3JlRGVjb3JhdG9ycyA9IGRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiB0aGlzLmlzQ29yZSB8fCBpc0Zyb21Bbmd1bGFyQ29yZShkZWMpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZGVjID0+IGRlYy5ub2RlIGFzIHRzLkRlY29yYXRvcik7XG4gICAgaWYgKGNvcmVEZWNvcmF0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBuZXcgU2V0PHRzLkRlY29yYXRvcj4oY29yZURlY29yYXRvcnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTk9fREVDT1JBVE9SUztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBgdHMuTm9kZWAsIGZpbHRlciB0aGUgZGVjb3JhdG9ycyBhcnJheSBhbmQgcmV0dXJuIGEgdmVyc2lvbiBjb250YWluaW5nIG9ubHkgbm9uLUFuZ3VsYXJcbiAgICogZGVjb3JhdG9ycy5cbiAgICpcbiAgICogSWYgYWxsIGRlY29yYXRvcnMgYXJlIHJlbW92ZWQgKG9yIG5vbmUgZXhpc3RlZCBpbiB0aGUgZmlyc3QgcGxhY2UpLCB0aGlzIG1ldGhvZCByZXR1cm5zXG4gICAqIGB1bmRlZmluZWRgLlxuICAgKi9cbiAgcHJpdmF0ZSBfbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGU6IHRzLkRlY2xhcmF0aW9uKTogdHMuTm9kZUFycmF5PHRzLkRlY29yYXRvcj58dW5kZWZpbmVkIHtcbiAgICAvLyBTaG9ydGN1dCBpZiB0aGUgbm9kZSBoYXMgbm8gZGVjb3JhdG9ycy5cbiAgICBpZiAobm9kZS5kZWNvcmF0b3JzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIC8vIEJ1aWxkIGEgU2V0IG9mIHRoZSBkZWNvcmF0b3JzIG9uIHRoaXMgbm9kZSBmcm9tIEBhbmd1bGFyL2NvcmUuXG4gICAgY29uc3QgY29yZURlY29yYXRvcnMgPSB0aGlzLl9hbmd1bGFyQ29yZURlY29yYXRvcnMobm9kZSk7XG5cbiAgICBpZiAoY29yZURlY29yYXRvcnMuc2l6ZSA9PT0gbm9kZS5kZWNvcmF0b3JzLmxlbmd0aCkge1xuICAgICAgLy8gSWYgYWxsIGRlY29yYXRvcnMgYXJlIHRvIGJlIHJlbW92ZWQsIHJldHVybiBgdW5kZWZpbmVkYC5cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmIChjb3JlRGVjb3JhdG9ycy5zaXplID09PSAwKSB7XG4gICAgICAvLyBJZiBubyBkZWNvcmF0b3JzIG5lZWQgdG8gYmUgcmVtb3ZlZCwgcmV0dXJuIHRoZSBvcmlnaW5hbCBkZWNvcmF0b3JzIGFycmF5LlxuICAgICAgcmV0dXJuIG5vZGUuZGVjb3JhdG9ycztcbiAgICB9XG5cbiAgICAvLyBGaWx0ZXIgb3V0IHRoZSBjb3JlIGRlY29yYXRvcnMuXG4gICAgY29uc3QgZmlsdGVyZWQgPSBub2RlLmRlY29yYXRvcnMuZmlsdGVyKGRlYyA9PiAhY29yZURlY29yYXRvcnMuaGFzKGRlYykpO1xuXG4gICAgLy8gSWYgbm8gZGVjb3JhdG9ycyBzdXJ2aXZlLCByZXR1cm4gYHVuZGVmaW5lZGAuIFRoaXMgY2FuIG9ubHkgaGFwcGVuIGlmIGEgY29yZSBkZWNvcmF0b3IgaXNcbiAgICAvLyByZXBlYXRlZCBvbiB0aGUgbm9kZS5cbiAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIG5ldyBgTm9kZUFycmF5YCB3aXRoIHRoZSBmaWx0ZXJlZCBkZWNvcmF0b3JzIHRoYXQgc291cmNlbWFwcyBiYWNrIHRvIHRoZSBvcmlnaW5hbC5cbiAgICBjb25zdCBhcnJheSA9IHRzLmNyZWF0ZU5vZGVBcnJheShmaWx0ZXJlZCk7XG4gICAgKGFycmF5LnBvcyBhcyBudW1iZXIpID0gbm9kZS5kZWNvcmF0b3JzLnBvcztcbiAgICAoYXJyYXkuZW5kIGFzIG51bWJlcikgPSBub2RlLmRlY29yYXRvcnMuZW5kO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgQW5ndWxhciBkZWNvcmF0b3JzIGZyb20gYSBgdHMuTm9kZWAgaW4gYSBzaGFsbG93IG1hbm5lci5cbiAgICpcbiAgICogVGhpcyB3aWxsIHJlbW92ZSBkZWNvcmF0b3JzIGZyb20gY2xhc3MgZWxlbWVudHMgKGdldHRlcnMsIHNldHRlcnMsIHByb3BlcnRpZXMsIG1ldGhvZHMpIGFzIHdlbGxcbiAgICogYXMgcGFyYW1ldGVycyBvZiBjb25zdHJ1Y3RvcnMuXG4gICAqL1xuICBwcml2YXRlIF9zdHJpcEFuZ3VsYXJEZWNvcmF0b3JzPFQgZXh0ZW5kcyB0cy5Ob2RlPihub2RlOiBUKTogVCB7XG4gICAgaWYgKHRzLmlzUGFyYW1ldGVyKG5vZGUpKSB7XG4gICAgICAvLyBTdHJpcCBkZWNvcmF0b3JzIGZyb20gcGFyYW1ldGVycyAocHJvYmFibHkgb2YgdGhlIGNvbnN0cnVjdG9yKS5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgIG5vZGUsIHRoaXMuX25vbkNvcmVEZWNvcmF0b3JzT25seShub2RlKSwgbm9kZS5tb2RpZmllcnMsIG5vZGUuZG90RG90RG90VG9rZW4sXG4gICAgICAgICAgICAgICAgIG5vZGUubmFtZSwgbm9kZS5xdWVzdGlvblRva2VuLCBub2RlLnR5cGUsIG5vZGUuaW5pdGlhbGl6ZXIpIGFzIFQgJlxuICAgICAgICAgIHRzLlBhcmFtZXRlckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNNZXRob2REZWNsYXJhdGlvbihub2RlKSAmJiBub2RlLmRlY29yYXRvcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBtZXRob2RzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZU1ldGhvZChcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5hc3Rlcmlza1Rva2VuLFxuICAgICAgICAgICAgICAgICBub2RlLm5hbWUsIG5vZGUucXVlc3Rpb25Ub2tlbiwgbm9kZS50eXBlUGFyYW1ldGVycywgbm9kZS5wYXJhbWV0ZXJzLCBub2RlLnR5cGUsXG4gICAgICAgICAgICAgICAgIG5vZGUuYm9keSkgYXMgVCAmXG4gICAgICAgICAgdHMuTWV0aG9kRGVjbGFyYXRpb247XG4gICAgfSBlbHNlIGlmICh0cy5pc1Byb3BlcnR5RGVjbGFyYXRpb24obm9kZSkgJiYgbm9kZS5kZWNvcmF0b3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2YgcHJvcGVydGllcy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICBub2RlLnF1ZXN0aW9uVG9rZW4sIG5vZGUudHlwZSwgbm9kZS5pbml0aWFsaXplcikgYXMgVCAmXG4gICAgICAgICAgdHMuUHJvcGVydHlEZWNsYXJhdGlvbjtcbiAgICB9IGVsc2UgaWYgKHRzLmlzR2V0QWNjZXNzb3Iobm9kZSkpIHtcbiAgICAgIC8vIFN0cmlwIGRlY29yYXRvcnMgb2YgZ2V0dGVycy5cbiAgICAgIG5vZGUgPSB0cy51cGRhdGVHZXRBY2Nlc3NvcihcbiAgICAgICAgICAgICAgICAgbm9kZSwgdGhpcy5fbm9uQ29yZURlY29yYXRvcnNPbmx5KG5vZGUpLCBub2RlLm1vZGlmaWVycywgbm9kZS5uYW1lLFxuICAgICAgICAgICAgICAgICBub2RlLnBhcmFtZXRlcnMsIG5vZGUudHlwZSwgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5HZXRBY2Nlc3NvckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNTZXRBY2Nlc3Nvcihub2RlKSkge1xuICAgICAgLy8gU3RyaXAgZGVjb3JhdG9ycyBvZiBzZXR0ZXJzLlxuICAgICAgbm9kZSA9IHRzLnVwZGF0ZVNldEFjY2Vzc29yKFxuICAgICAgICAgICAgICAgICBub2RlLCB0aGlzLl9ub25Db3JlRGVjb3JhdG9yc09ubHkobm9kZSksIG5vZGUubW9kaWZpZXJzLCBub2RlLm5hbWUsXG4gICAgICAgICAgICAgICAgIG5vZGUucGFyYW1ldGVycywgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5TZXRBY2Nlc3NvckRlY2xhcmF0aW9uO1xuICAgIH0gZWxzZSBpZiAodHMuaXNDb25zdHJ1Y3RvckRlY2xhcmF0aW9uKG5vZGUpKSB7XG4gICAgICAvLyBGb3IgY29uc3RydWN0b3JzLCBzdHJpcCBkZWNvcmF0b3JzIG9mIHRoZSBwYXJhbWV0ZXJzLlxuICAgICAgY29uc3QgcGFyYW1ldGVycyA9IG5vZGUucGFyYW1ldGVycy5tYXAocGFyYW0gPT4gdGhpcy5fc3RyaXBBbmd1bGFyRGVjb3JhdG9ycyhwYXJhbSkpO1xuICAgICAgbm9kZSA9XG4gICAgICAgICAgdHMudXBkYXRlQ29uc3RydWN0b3Iobm9kZSwgbm9kZS5kZWNvcmF0b3JzLCBub2RlLm1vZGlmaWVycywgcGFyYW1ldGVycywgbm9kZS5ib2R5KSBhcyBUICZcbiAgICAgICAgICB0cy5Db25zdHJ1Y3RvckRlY2xhcmF0aW9uO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuXG4vKipcbiAqIEEgdHJhbnNmb3JtZXIgd2hpY2ggb3BlcmF0ZXMgb24gdHMuU291cmNlRmlsZXMgYW5kIGFwcGxpZXMgY2hhbmdlcyBmcm9tIGFuIGBJdnlDb21waWxhdGlvbmAuXG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybUl2eVNvdXJjZUZpbGUoXG4gICAgY29tcGlsYXRpb246IFRyYWl0Q29tcGlsZXIsIGNvbnRleHQ6IHRzLlRyYW5zZm9ybWF0aW9uQ29udGV4dCwgcmVmbGVjdG9yOiBSZWZsZWN0aW9uSG9zdCxcbiAgICBpbXBvcnRSZXdyaXRlcjogSW1wb3J0UmV3cml0ZXIsIGZpbGU6IHRzLlNvdXJjZUZpbGUsIGlzQ29yZTogYm9vbGVhbixcbiAgICBpc0Nsb3N1cmVDb21waWxlckVuYWJsZWQ6IGJvb2xlYW4sXG4gICAgcmVjb3JkV3JhcHBlZE5vZGVFeHByOiBSZWNvcmRXcmFwcGVkTm9kZUV4cHJGbjx0cy5FeHByZXNzaW9uPik6IHRzLlNvdXJjZUZpbGUge1xuICBjb25zdCBjb25zdGFudFBvb2wgPSBuZXcgQ29uc3RhbnRQb29sKGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCk7XG4gIGNvbnN0IGltcG9ydE1hbmFnZXIgPSBuZXcgSW1wb3J0TWFuYWdlcihpbXBvcnRSZXdyaXRlcik7XG5cbiAgLy8gVGhlIHRyYW5zZm9ybWF0aW9uIHByb2Nlc3MgY29uc2lzdHMgb2YgMiBzdGVwczpcbiAgLy9cbiAgLy8gIDEuIFZpc2l0IGFsbCBjbGFzc2VzLCBwZXJmb3JtIGNvbXBpbGF0aW9uIGFuZCBjb2xsZWN0IHRoZSByZXN1bHRzLlxuICAvLyAgMi4gUGVyZm9ybSBhY3R1YWwgdHJhbnNmb3JtYXRpb24gb2YgcmVxdWlyZWQgVFMgbm9kZXMgdXNpbmcgY29tcGlsYXRpb24gcmVzdWx0cyBmcm9tIHRoZSBmaXJzdFxuICAvLyAgICAgc3RlcC5cbiAgLy9cbiAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gaGF2ZSBhbGwgYG8uRXhwcmVzc2lvbmBzIGdlbmVyYXRlZCBiZWZvcmUgYW55IFRTIHRyYW5zZm9ybXMgaGFwcGVuLiBUaGlzXG4gIC8vIGFsbG93cyBgQ29uc3RhbnRQb29sYCB0byBwcm9wZXJseSBpZGVudGlmeSBleHByZXNzaW9ucyB0aGF0IGNhbiBiZSBzaGFyZWQgYWNyb3NzIG11bHRpcGxlXG4gIC8vIGNvbXBvbmVudHMgZGVjbGFyZWQgaW4gdGhlIHNhbWUgZmlsZS5cblxuICAvLyBTdGVwIDEuIEdvIHRob3VnaCBhbGwgY2xhc3NlcyBpbiBBU1QsIHBlcmZvcm0gY29tcGlsYXRpb24gYW5kIGNvbGxlY3QgdGhlIHJlc3VsdHMuXG4gIGNvbnN0IGNvbXBpbGF0aW9uVmlzaXRvciA9IG5ldyBJdnlDb21waWxhdGlvblZpc2l0b3IoY29tcGlsYXRpb24sIGNvbnN0YW50UG9vbCk7XG4gIHZpc2l0KGZpbGUsIGNvbXBpbGF0aW9uVmlzaXRvciwgY29udGV4dCk7XG5cbiAgLy8gU3RlcCAyLiBTY2FuIHRocm91Z2ggdGhlIEFTVCBhZ2FpbiBhbmQgcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbnMgYmFzZWQgb24gSXZ5IGNvbXBpbGF0aW9uXG4gIC8vIHJlc3VsdHMgb2J0YWluZWQgYXQgU3RlcCAxLlxuICBjb25zdCB0cmFuc2Zvcm1hdGlvblZpc2l0b3IgPSBuZXcgSXZ5VHJhbnNmb3JtYXRpb25WaXNpdG9yKFxuICAgICAgY29tcGlsYXRpb24sIGNvbXBpbGF0aW9uVmlzaXRvci5jbGFzc0NvbXBpbGF0aW9uTWFwLCByZWZsZWN0b3IsIGltcG9ydE1hbmFnZXIsXG4gICAgICByZWNvcmRXcmFwcGVkTm9kZUV4cHIsIGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCwgaXNDb3JlKTtcbiAgbGV0IHNmID0gdmlzaXQoZmlsZSwgdHJhbnNmb3JtYXRpb25WaXNpdG9yLCBjb250ZXh0KTtcblxuICAvLyBHZW5lcmF0ZSB0aGUgY29uc3RhbnQgc3RhdGVtZW50cyBmaXJzdCwgYXMgdGhleSBtYXkgaW52b2x2ZSBhZGRpbmcgYWRkaXRpb25hbCBpbXBvcnRzXG4gIC8vIHRvIHRoZSBJbXBvcnRNYW5hZ2VyLlxuICBjb25zdCBkb3dubGV2ZWxUcmFuc2xhdGVkQ29kZSA9IGdldExvY2FsaXplQ29tcGlsZVRhcmdldChjb250ZXh0KSA8IHRzLlNjcmlwdFRhcmdldC5FUzIwMTU7XG4gIGNvbnN0IGNvbnN0YW50cyA9XG4gICAgICBjb25zdGFudFBvb2wuc3RhdGVtZW50cy5tYXAoc3RtdCA9PiB0cmFuc2xhdGVTdGF0ZW1lbnQoc3RtdCwgaW1wb3J0TWFuYWdlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3JkV3JhcHBlZE5vZGVFeHByLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG93bmxldmVsTG9jYWxpemVkU3RyaW5nczogZG93bmxldmVsVHJhbnNsYXRlZENvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3dubGV2ZWxWYXJpYWJsZURlY2xhcmF0aW9uczogZG93bmxldmVsVHJhbnNsYXRlZENvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gIC8vIFByZXNlcnZlIEBmaWxlb3ZlcnZpZXcgY29tbWVudHMgcmVxdWlyZWQgYnkgQ2xvc3VyZSwgc2luY2UgdGhlIGxvY2F0aW9uIG1pZ2h0IGNoYW5nZSBhcyBhXG4gIC8vIHJlc3VsdCBvZiBhZGRpbmcgZXh0cmEgaW1wb3J0cyBhbmQgY29uc3RhbnQgcG9vbCBzdGF0ZW1lbnRzLlxuICBjb25zdCBmaWxlT3ZlcnZpZXdNZXRhID0gaXNDbG9zdXJlQ29tcGlsZXJFbmFibGVkID8gZ2V0RmlsZU92ZXJ2aWV3Q29tbWVudChzZi5zdGF0ZW1lbnRzKSA6IG51bGw7XG5cbiAgLy8gQWRkIG5ldyBpbXBvcnRzIGZvciB0aGlzIGZpbGUuXG4gIHNmID0gYWRkSW1wb3J0cyhpbXBvcnRNYW5hZ2VyLCBzZiwgY29uc3RhbnRzKTtcblxuICBpZiAoZmlsZU92ZXJ2aWV3TWV0YSAhPT0gbnVsbCkge1xuICAgIHNldEZpbGVPdmVydmlld0NvbW1lbnQoc2YsIGZpbGVPdmVydmlld01ldGEpO1xuICB9XG5cbiAgcmV0dXJuIHNmO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGNvcnJlY3QgdGFyZ2V0IG91dHB1dCBmb3IgYCRsb2NhbGl6ZWAgbWVzc2FnZXMgZ2VuZXJhdGVkIGJ5IEFuZ3VsYXJcbiAqXG4gKiBJbiBzb21lIHZlcnNpb25zIG9mIFR5cGVTY3JpcHQsIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiBzeW50aGV0aWMgYCRsb2NhbGl6ZWAgdGFnZ2VkIHRlbXBsYXRlXG4gKiBsaXRlcmFscyBpcyBicm9rZW4uIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzM4NDg1XG4gKlxuICogSGVyZSB3ZSBjb21wdXRlIHdoYXQgdGhlIGV4cGVjdGVkIGZpbmFsIG91dHB1dCB0YXJnZXQgb2YgdGhlIGNvbXBpbGF0aW9uIHdpbGxcbiAqIGJlIHNvIHRoYXQgd2UgY2FuIGdlbmVyYXRlIEVTNSBjb21wbGlhbnQgYCRsb2NhbGl6ZWAgY2FsbHMgaW5zdGVhZCBvZiByZWx5aW5nIHVwb24gVFMgdG8gZG8gdGhlXG4gKiBkb3dubGV2ZWxpbmcgZm9yIHVzLlxuICovXG5mdW5jdGlvbiBnZXRMb2NhbGl6ZUNvbXBpbGVUYXJnZXQoY29udGV4dDogdHMuVHJhbnNmb3JtYXRpb25Db250ZXh0KTpcbiAgICBFeGNsdWRlPHRzLlNjcmlwdFRhcmdldCwgdHMuU2NyaXB0VGFyZ2V0LkpTT04+IHtcbiAgY29uc3QgdGFyZ2V0ID0gY29udGV4dC5nZXRDb21waWxlck9wdGlvbnMoKS50YXJnZXQgfHwgdHMuU2NyaXB0VGFyZ2V0LkVTMjAxNTtcbiAgcmV0dXJuIHRhcmdldCAhPT0gdHMuU2NyaXB0VGFyZ2V0LkpTT04gPyB0YXJnZXQgOiB0cy5TY3JpcHRUYXJnZXQuRVMyMDE1O1xufVxuXG5mdW5jdGlvbiBnZXRGaWxlT3ZlcnZpZXdDb21tZW50KHN0YXRlbWVudHM6IHRzLk5vZGVBcnJheTx0cy5TdGF0ZW1lbnQ+KTogRmlsZU92ZXJ2aWV3TWV0YXxudWxsIHtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGhvc3QgPSBzdGF0ZW1lbnRzWzBdO1xuICAgIGxldCB0cmFpbGluZyA9IGZhbHNlO1xuICAgIGxldCBjb21tZW50cyA9IHRzLmdldFN5bnRoZXRpY0xlYWRpbmdDb21tZW50cyhob3N0KTtcbiAgICAvLyBJZiBAZmlsZW92ZXJ2aWV3IHRhZyBpcyBub3QgZm91bmQgaW4gc291cmNlIGZpbGUsIHRzaWNrbGUgcHJvZHVjZXMgZmFrZSBub2RlIHdpdGggdHJhaWxpbmdcbiAgICAvLyBjb21tZW50IGFuZCBpbmplY3QgaXQgYXQgdGhlIHZlcnkgYmVnaW5uaW5nIG9mIHRoZSBnZW5lcmF0ZWQgZmlsZS4gU28gd2UgbmVlZCB0byBjaGVjayBmb3JcbiAgICAvLyBsZWFkaW5nIGFzIHdlbGwgYXMgdHJhaWxpbmcgY29tbWVudHMuXG4gICAgaWYgKCFjb21tZW50cyB8fCBjb21tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcbiAgICAgIGNvbW1lbnRzID0gdHMuZ2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhob3N0KTtcbiAgICB9XG4gICAgaWYgKGNvbW1lbnRzICYmIGNvbW1lbnRzLmxlbmd0aCA+IDAgJiYgQ0xPU1VSRV9GSUxFX09WRVJWSUVXX1JFR0VYUC50ZXN0KGNvbW1lbnRzWzBdLnRleHQpKSB7XG4gICAgICByZXR1cm4ge2NvbW1lbnRzLCBob3N0LCB0cmFpbGluZ307XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBzZXRGaWxlT3ZlcnZpZXdDb21tZW50KHNmOiB0cy5Tb3VyY2VGaWxlLCBmaWxlb3ZlcnZpZXc6IEZpbGVPdmVydmlld01ldGEpOiB2b2lkIHtcbiAgY29uc3Qge2NvbW1lbnRzLCBob3N0LCB0cmFpbGluZ30gPSBmaWxlb3ZlcnZpZXc7XG4gIC8vIElmIGhvc3Qgc3RhdGVtZW50IGlzIG5vIGxvbmdlciB0aGUgZmlyc3Qgb25lLCBpdCBtZWFucyB0aGF0IGV4dHJhIHN0YXRlbWVudHMgd2VyZSBhZGRlZCBhdCB0aGVcbiAgLy8gdmVyeSBiZWdpbm5pbmcsIHNvIHdlIG5lZWQgdG8gcmVsb2NhdGUgQGZpbGVvdmVydmlldyBjb21tZW50IGFuZCBjbGVhbnVwIHRoZSBvcmlnaW5hbCBzdGF0ZW1lbnRcbiAgLy8gdGhhdCBob3N0ZWQgaXQuXG4gIGlmIChzZi5zdGF0ZW1lbnRzLmxlbmd0aCA+IDAgJiYgaG9zdCAhPT0gc2Yuc3RhdGVtZW50c1swXSkge1xuICAgIGlmICh0cmFpbGluZykge1xuICAgICAgdHMuc2V0U3ludGhldGljVHJhaWxpbmdDb21tZW50cyhob3N0LCB1bmRlZmluZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cy5zZXRTeW50aGV0aWNMZWFkaW5nQ29tbWVudHMoaG9zdCwgdW5kZWZpbmVkKTtcbiAgICB9XG4gICAgdHMuc2V0U3ludGhldGljTGVhZGluZ0NvbW1lbnRzKHNmLnN0YXRlbWVudHNbMF0sIGNvbW1lbnRzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXliZUZpbHRlckRlY29yYXRvcihcbiAgICBkZWNvcmF0b3JzOiB0cy5Ob2RlQXJyYXk8dHMuRGVjb3JhdG9yPnx1bmRlZmluZWQsXG4gICAgdG9SZW1vdmU6IHRzLkRlY29yYXRvcltdKTogdHMuTm9kZUFycmF5PHRzLkRlY29yYXRvcj58dW5kZWZpbmVkIHtcbiAgaWYgKGRlY29yYXRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgY29uc3QgZmlsdGVyZWQgPSBkZWNvcmF0b3JzLmZpbHRlcihcbiAgICAgIGRlYyA9PiB0b1JlbW92ZS5maW5kKGRlY1RvUmVtb3ZlID0+IHRzLmdldE9yaWdpbmFsTm9kZShkZWMpID09PSBkZWNUb1JlbW92ZSkgPT09IHVuZGVmaW5lZCk7XG4gIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0cy5jcmVhdGVOb2RlQXJyYXkoZmlsdGVyZWQpO1xufVxuXG5mdW5jdGlvbiBpc0Zyb21Bbmd1bGFyQ29yZShkZWNvcmF0b3I6IERlY29yYXRvcik6IGJvb2xlYW4ge1xuICByZXR1cm4gZGVjb3JhdG9yLmltcG9ydCAhPT0gbnVsbCAmJiBkZWNvcmF0b3IuaW1wb3J0LmZyb20gPT09ICdAYW5ndWxhci9jb3JlJztcbn1cblxuZnVuY3Rpb24gY3JlYXRlUmVjb3JkZXJGbihkZWZhdWx0SW1wb3J0UmVjb3JkZXI6IERlZmF1bHRJbXBvcnRSZWNvcmRlcik6XG4gICAgUmVjb3JkV3JhcHBlZE5vZGVFeHByRm48dHMuRXhwcmVzc2lvbj4ge1xuICByZXR1cm4gZXhwciA9PiB7XG4gICAgaWYgKHRzLmlzSWRlbnRpZmllcihleHByKSkge1xuICAgICAgZGVmYXVsdEltcG9ydFJlY29yZGVyLnJlY29yZFVzZWRJZGVudGlmaWVyKGV4cHIpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==