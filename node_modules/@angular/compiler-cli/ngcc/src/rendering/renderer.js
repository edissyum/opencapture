(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/renderer", ["require", "exports", "tslib", "@angular/compiler", "magic-string", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/ngcc/src/constants", "@angular/compiler-cli/ngcc/src/rendering/rendering_formatter", "@angular/compiler-cli/ngcc/src/rendering/source_maps", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderConstantPool = exports.Renderer = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var compiler_1 = require("@angular/compiler");
    var magic_string_1 = require("magic-string");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var constants_1 = require("@angular/compiler-cli/ngcc/src/constants");
    var rendering_formatter_1 = require("@angular/compiler-cli/ngcc/src/rendering/rendering_formatter");
    var source_maps_1 = require("@angular/compiler-cli/ngcc/src/rendering/source_maps");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A base-class for rendering an `AnalyzedFile`.
     *
     * Package formats have output files that must be rendered differently. Concrete sub-classes must
     * implement the `addImports`, `addDefinitions` and `removeDecorators` abstract methods.
     */
    var Renderer = /** @class */ (function () {
        function Renderer(host, srcFormatter, fs, logger, bundle, tsConfig) {
            if (tsConfig === void 0) { tsConfig = null; }
            this.host = host;
            this.srcFormatter = srcFormatter;
            this.fs = fs;
            this.logger = logger;
            this.bundle = bundle;
            this.tsConfig = tsConfig;
        }
        Renderer.prototype.renderProgram = function (decorationAnalyses, switchMarkerAnalyses, privateDeclarationsAnalyses) {
            var _this = this;
            var renderedFiles = [];
            // Transform the source files.
            this.bundle.src.program.getSourceFiles().forEach(function (sourceFile) {
                if (decorationAnalyses.has(sourceFile) || switchMarkerAnalyses.has(sourceFile) ||
                    sourceFile === _this.bundle.src.file) {
                    var compiledFile = decorationAnalyses.get(sourceFile);
                    var switchMarkerAnalysis = switchMarkerAnalyses.get(sourceFile);
                    renderedFiles.push.apply(renderedFiles, tslib_1.__spread(_this.renderFile(sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses)));
                }
            });
            return renderedFiles;
        };
        /**
         * Render the source code and source-map for an Analyzed file.
         * @param compiledFile The analyzed file to render.
         * @param targetPath The absolute path where the rendered file will be written.
         */
        Renderer.prototype.renderFile = function (sourceFile, compiledFile, switchMarkerAnalysis, privateDeclarationsAnalyses) {
            var _this = this;
            var isEntryPoint = sourceFile === this.bundle.src.file;
            var outputText = new magic_string_1.default(sourceFile.text);
            if (switchMarkerAnalysis) {
                this.srcFormatter.rewriteSwitchableDeclarations(outputText, switchMarkerAnalysis.sourceFile, switchMarkerAnalysis.declarations);
            }
            var importManager = new translator_1.ImportManager(utils_1.getImportRewriter(this.bundle.src.r3SymbolsFile, this.bundle.isCore, this.bundle.isFlatCore), constants_1.IMPORT_PREFIX);
            if (compiledFile) {
                // TODO: remove constructor param metadata and property decorators (we need info from the
                // handlers to do this)
                var decoratorsToRemove = this.computeDecoratorsToRemove(compiledFile.compiledClasses);
                this.srcFormatter.removeDecorators(outputText, decoratorsToRemove);
                compiledFile.compiledClasses.forEach(function (clazz) {
                    var _a;
                    var renderedDefinition = _this.renderDefinitions(compiledFile.sourceFile, clazz, importManager, !!((_a = _this.tsConfig) === null || _a === void 0 ? void 0 : _a.options.annotateForClosureCompiler));
                    _this.srcFormatter.addDefinitions(outputText, clazz, renderedDefinition);
                    var renderedStatements = _this.renderAdjacentStatements(compiledFile.sourceFile, clazz, importManager);
                    _this.srcFormatter.addAdjacentStatements(outputText, clazz, renderedStatements);
                });
                if (!isEntryPoint && compiledFile.reexports.length > 0) {
                    this.srcFormatter.addDirectExports(outputText, compiledFile.reexports, importManager, compiledFile.sourceFile);
                }
                this.srcFormatter.addConstants(outputText, renderConstantPool(this.srcFormatter, compiledFile.sourceFile, compiledFile.constantPool, importManager), compiledFile.sourceFile);
            }
            // Add exports to the entry-point file
            if (isEntryPoint) {
                var entryPointBasePath = utils_1.stripExtension(this.bundle.src.path);
                this.srcFormatter.addExports(outputText, entryPointBasePath, privateDeclarationsAnalyses, importManager, sourceFile);
            }
            if (isEntryPoint || compiledFile) {
                this.srcFormatter.addImports(outputText, importManager.getAllImports(sourceFile.fileName), sourceFile);
            }
            if (compiledFile || switchMarkerAnalysis || isEntryPoint) {
                return source_maps_1.renderSourceAndMap(this.logger, this.fs, sourceFile, outputText);
            }
            else {
                return [];
            }
        };
        /**
         * From the given list of classes, computes a map of decorators that should be removed.
         * The decorators to remove are keyed by their container node, such that we can tell if
         * we should remove the entire decorator property.
         * @param classes The list of classes that may have decorators to remove.
         * @returns A map of decorators to remove, keyed by their container node.
         */
        Renderer.prototype.computeDecoratorsToRemove = function (classes) {
            var decoratorsToRemove = new rendering_formatter_1.RedundantDecoratorMap();
            classes.forEach(function (clazz) {
                if (clazz.decorators === null) {
                    return;
                }
                clazz.decorators.forEach(function (dec) {
                    if (dec.node === null) {
                        return;
                    }
                    var decoratorArray = dec.node.parent;
                    if (!decoratorsToRemove.has(decoratorArray)) {
                        decoratorsToRemove.set(decoratorArray, [dec.node]);
                    }
                    else {
                        decoratorsToRemove.get(decoratorArray).push(dec.node);
                    }
                });
            });
            return decoratorsToRemove;
        };
        /**
         * Render the definitions as source code for the given class.
         * @param sourceFile The file containing the class to process.
         * @param clazz The class whose definitions are to be rendered.
         * @param compilation The results of analyzing the class - this is used to generate the rendered
         * definitions.
         * @param imports An object that tracks the imports that are needed by the rendered definitions.
         */
        Renderer.prototype.renderDefinitions = function (sourceFile, compiledClass, imports, annotateForClosureCompiler) {
            var name = this.host.getInternalNameOfClass(compiledClass.declaration);
            var leadingComment = annotateForClosureCompiler ? compiler_1.jsDocComment([{ tagName: 'nocollapse' }]) : undefined;
            var statements = compiledClass.compilation.map(function (c) { return createAssignmentStatement(name, c.name, c.initializer, leadingComment); });
            return this.renderStatements(sourceFile, statements, imports);
        };
        /**
         * Render the adjacent statements as source code for the given class.
         * @param sourceFile The file containing the class to process.
         * @param clazz The class whose statements are to be rendered.
         * @param compilation The results of analyzing the class - this is used to generate the rendered
         * definitions.
         * @param imports An object that tracks the imports that are needed by the rendered definitions.
         */
        Renderer.prototype.renderAdjacentStatements = function (sourceFile, compiledClass, imports) {
            var e_1, _a;
            var statements = [];
            try {
                for (var _b = tslib_1.__values(compiledClass.compilation), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var c = _c.value;
                    statements.push.apply(statements, tslib_1.__spread(c.statements));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.renderStatements(sourceFile, statements, imports);
        };
        Renderer.prototype.renderStatements = function (sourceFile, statements, imports) {
            var _this = this;
            var printStatement = function (stmt) {
                return _this.srcFormatter.printStatement(stmt, sourceFile, imports);
            };
            return statements.map(printStatement).join('\n');
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
    /**
     * Render the constant pool as source code for the given class.
     */
    function renderConstantPool(formatter, sourceFile, constantPool, imports) {
        var printStatement = function (stmt) { return formatter.printStatement(stmt, sourceFile, imports); };
        return constantPool.statements.map(printStatement).join('\n');
    }
    exports.renderConstantPool = renderConstantPool;
    /**
     * Create an Angular AST statement node that contains the assignment of the
     * compiled decorator to be applied to the class.
     * @param analyzedClass The info about the class whose statement we want to create.
     */
    function createAssignmentStatement(receiverName, propName, initializer, leadingComment) {
        var receiver = new compiler_1.WrappedNodeExpr(receiverName);
        var statement = new compiler_1.WritePropExpr(receiver, propName, initializer, /* type */ undefined, /* sourceSpan */ undefined)
            .toStmt();
        if (leadingComment !== undefined) {
            statement.addLeadingComment(leadingComment);
        }
        return statement;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL3JlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw4Q0FBb0k7SUFDcEksNkNBQXVDO0lBS3ZDLHlFQUE0RDtJQUs1RCxzRUFBMkM7SUFJM0Msb0dBQWdGO0lBQ2hGLG9GQUFpRDtJQUNqRCx3RUFBdUU7SUFFdkU7Ozs7O09BS0c7SUFDSDtRQUNFLGtCQUNZLElBQXdCLEVBQVUsWUFBZ0MsRUFDbEUsRUFBYyxFQUFVLE1BQWMsRUFBVSxNQUF3QixFQUN4RSxRQUF5QztZQUF6Qyx5QkFBQSxFQUFBLGVBQXlDO1lBRnpDLFNBQUksR0FBSixJQUFJLENBQW9CO1lBQVUsaUJBQVksR0FBWixZQUFZLENBQW9CO1lBQ2xFLE9BQUUsR0FBRixFQUFFLENBQVk7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1lBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBa0I7WUFDeEUsYUFBUSxHQUFSLFFBQVEsQ0FBaUM7UUFBRyxDQUFDO1FBRXpELGdDQUFhLEdBQWIsVUFDSSxrQkFBc0MsRUFBRSxvQkFBMEMsRUFDbEYsMkJBQXdEO1lBRjVELGlCQWlCQztZQWRDLElBQU0sYUFBYSxHQUFrQixFQUFFLENBQUM7WUFFeEMsOEJBQThCO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2dCQUN6RCxJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO29CQUMxRSxVQUFVLEtBQUssS0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO29CQUN2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M0UsY0FBK0I7UUFDakMsSUFBTSxRQUFRLEdBQUcsSUFBSSwwQkFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELElBQU0sU0FBUyxHQUNYLElBQUksd0JBQWEsQ0FDYixRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQzthQUNqRixNQUFNLEVBQUUsQ0FBQztRQUNsQixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDaEMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb25zdGFudFBvb2wsIEV4cHJlc3Npb24sIGpzRG9jQ29tbWVudCwgTGVhZGluZ0NvbW1lbnQsIFN0YXRlbWVudCwgV3JhcHBlZE5vZGVFeHByLCBXcml0ZVByb3BFeHByfSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0ZpbGVTeXN0ZW19IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9maWxlX3N5c3RlbSc7XG5pbXBvcnQge0xvZ2dlcn0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2xvZ2dpbmcnO1xuaW1wb3J0IHtJbXBvcnRNYW5hZ2VyfSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdHJhbnNsYXRvcic7XG5pbXBvcnQge1BhcnNlZENvbmZpZ3VyYXRpb259IGZyb20gJy4uLy4uLy4uL3NyYy9wZXJmb3JtX2NvbXBpbGUnO1xuaW1wb3J0IHtQcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXN9IGZyb20gJy4uL2FuYWx5c2lzL3ByaXZhdGVfZGVjbGFyYXRpb25zX2FuYWx5emVyJztcbmltcG9ydCB7U3dpdGNoTWFya2VyQW5hbHlzZXMsIFN3aXRjaE1hcmtlckFuYWx5c2lzfSBmcm9tICcuLi9hbmFseXNpcy9zd2l0Y2hfbWFya2VyX2FuYWx5emVyJztcbmltcG9ydCB7Q29tcGlsZWRDbGFzcywgQ29tcGlsZWRGaWxlLCBEZWNvcmF0aW9uQW5hbHlzZXN9IGZyb20gJy4uL2FuYWx5c2lzL3R5cGVzJztcbmltcG9ydCB7SU1QT1JUX1BSRUZJWH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7TmdjY1JlZmxlY3Rpb25Ib3N0fSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5pbXBvcnQge0VudHJ5UG9pbnRCdW5kbGV9IGZyb20gJy4uL3BhY2thZ2VzL2VudHJ5X3BvaW50X2J1bmRsZSc7XG5cbmltcG9ydCB7UmVkdW5kYW50RGVjb3JhdG9yTWFwLCBSZW5kZXJpbmdGb3JtYXR0ZXJ9IGZyb20gJy4vcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge3JlbmRlclNvdXJjZUFuZE1hcH0gZnJvbSAnLi9zb3VyY2VfbWFwcyc7XG5pbXBvcnQge0ZpbGVUb1dyaXRlLCBnZXRJbXBvcnRSZXdyaXRlciwgc3RyaXBFeHRlbnNpb259IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIEEgYmFzZS1jbGFzcyBmb3IgcmVuZGVyaW5nIGFuIGBBbmFseXplZEZpbGVgLlxuICpcbiAqIFBhY2thZ2UgZm9ybWF0cyBoYXZlIG91dHB1dCBmaWxlcyB0aGF0IG11c3QgYmUgcmVuZGVyZWQgZGlmZmVyZW50bHkuIENvbmNyZXRlIHN1Yi1jbGFzc2VzIG11c3RcbiAqIGltcGxlbWVudCB0aGUgYGFkZEltcG9ydHNgLCBgYWRkRGVmaW5pdGlvbnNgIGFuZCBgcmVtb3ZlRGVjb3JhdG9yc2AgYWJzdHJhY3QgbWV0aG9kcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGhvc3Q6IE5nY2NSZWZsZWN0aW9uSG9zdCwgcHJpdmF0ZSBzcmNGb3JtYXR0ZXI6IFJlbmRlcmluZ0Zvcm1hdHRlcixcbiAgICAgIHByaXZhdGUgZnM6IEZpbGVTeXN0ZW0sIHByaXZhdGUgbG9nZ2VyOiBMb2dnZXIsIHByaXZhdGUgYnVuZGxlOiBFbnRyeVBvaW50QnVuZGxlLFxuICAgICAgcHJpdmF0ZSB0c0NvbmZpZzogUGFyc2VkQ29uZmlndXJhdGlvbnxudWxsID0gbnVsbCkge31cblxuICByZW5kZXJQcm9ncmFtKFxuICAgICAgZGVjb3JhdGlvbkFuYWx5c2VzOiBEZWNvcmF0aW9uQW5hbHlzZXMsIHN3aXRjaE1hcmtlckFuYWx5c2VzOiBTd2l0Y2hNYXJrZXJBbmFseXNlcyxcbiAgICAgIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlczogUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzKTogRmlsZVRvV3JpdGVbXSB7XG4gICAgY29uc3QgcmVuZGVyZWRGaWxlczogRmlsZVRvV3JpdGVbXSA9IFtdO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBzb3VyY2UgZmlsZXMuXG4gICAgdGhpcy5idW5kbGUuc3JjLnByb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5mb3JFYWNoKHNvdXJjZUZpbGUgPT4ge1xuICAgICAgaWYgKGRlY29yYXRpb25BbmFseXNlcy5oYXMoc291cmNlRmlsZSkgfHwgc3dpdGNoTWFya2VyQW5hbHlzZXMuaGFzKHNvdXJjZUZpbGUpIHx8XG4gICAgICAgICAgc291cmNlRmlsZSA9PT0gdGhpcy5idW5kbGUuc3JjLmZpbGUpIHtcbiAgICAgICAgY29uc3QgY29tcGlsZWRGaWxlID0gZGVjb3JhdGlvbkFuYWx5c2VzLmdldChzb3VyY2VGaWxlKTtcbiAgICAgICAgY29uc3Qgc3dpdGNoTWFya2VyQW5hbHlzaXMgPSBzd2l0Y2hNYXJrZXJBbmFseXNlcy5nZXQoc291cmNlRmlsZSk7XG4gICAgICAgIHJlbmRlcmVkRmlsZXMucHVzaCguLi50aGlzLnJlbmRlckZpbGUoXG4gICAgICAgICAgICBzb3VyY2VGaWxlLCBjb21waWxlZEZpbGUsIHN3aXRjaE1hcmtlckFuYWx5c2lzLCBwcml2YXRlRGVjbGFyYXRpb25zQW5hbHlzZXMpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZW5kZXJlZEZpbGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgc291cmNlIGNvZGUgYW5kIHNvdXJjZS1tYXAgZm9yIGFuIEFuYWx5emVkIGZpbGUuXG4gICAqIEBwYXJhbSBjb21waWxlZEZpbGUgVGhlIGFuYWx5emVkIGZpbGUgdG8gcmVuZGVyLlxuICAgKiBAcGFyYW0gdGFyZ2V0UGF0aCBUaGUgYWJzb2x1dGUgcGF0aCB3aGVyZSB0aGUgcmVuZGVyZWQgZmlsZSB3aWxsIGJlIHdyaXR0ZW4uXG4gICAqL1xuICByZW5kZXJGaWxlKFxuICAgICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgY29tcGlsZWRGaWxlOiBDb21waWxlZEZpbGV8dW5kZWZpbmVkLFxuICAgICAgc3dpdGNoTWFya2VyQW5hbHlzaXM6IFN3aXRjaE1hcmtlckFuYWx5c2lzfHVuZGVmaW5lZCxcbiAgICAgIHByaXZhdGVEZWNsYXJhdGlvbnNBbmFseXNlczogUHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzKTogRmlsZVRvV3JpdGVbXSB7XG4gICAgY29uc3QgaXNFbnRyeVBvaW50ID0gc291cmNlRmlsZSA9PT0gdGhpcy5idW5kbGUuc3JjLmZpbGU7XG4gICAgY29uc3Qgb3V0cHV0VGV4dCA9IG5ldyBNYWdpY1N0cmluZyhzb3VyY2VGaWxlLnRleHQpO1xuXG4gICAgaWYgKHN3aXRjaE1hcmtlckFuYWx5c2lzKSB7XG4gICAgICB0aGlzLnNyY0Zvcm1hdHRlci5yZXdyaXRlU3dpdGNoYWJsZURlY2xhcmF0aW9ucyhcbiAgICAgICAgICBvdXRwdXRUZXh0LCBzd2l0Y2hNYXJrZXJBbmFseXNpcy5zb3VyY2VGaWxlLCBzd2l0Y2hNYXJrZXJBbmFseXNpcy5kZWNsYXJhdGlvbnMpO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydE1hbmFnZXIgPSBuZXcgSW1wb3J0TWFuYWdlcihcbiAgICAgICAgZ2V0SW1wb3J0UmV3cml0ZXIoXG4gICAgICAgICAgICB0aGlzLmJ1bmRsZS5zcmMucjNTeW1ib2xzRmlsZSwgdGhpcy5idW5kbGUuaXNDb3JlLCB0aGlzLmJ1bmRsZS5pc0ZsYXRDb3JlKSxcbiAgICAgICAgSU1QT1JUX1BSRUZJWCk7XG5cbiAgICBpZiAoY29tcGlsZWRGaWxlKSB7XG4gICAgICAvLyBUT0RPOiByZW1vdmUgY29uc3RydWN0b3IgcGFyYW0gbWV0YWRhdGEgYW5kIHByb3BlcnR5IGRlY29yYXRvcnMgKHdlIG5lZWQgaW5mbyBmcm9tIHRoZVxuICAgICAgLy8gaGFuZGxlcnMgdG8gZG8gdGhpcylcbiAgICAgIGNvbnN0IGRlY29yYXRvcnNUb1JlbW92ZSA9IHRoaXMuY29tcHV0ZURlY29yYXRvcnNUb1JlbW92ZShjb21waWxlZEZpbGUuY29tcGlsZWRDbGFzc2VzKTtcbiAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLnJlbW92ZURlY29yYXRvcnMob3V0cHV0VGV4dCwgZGVjb3JhdG9yc1RvUmVtb3ZlKTtcblxuICAgICAgY29tcGlsZWRGaWxlLmNvbXBpbGVkQ2xhc3Nlcy5mb3JFYWNoKGNsYXp6ID0+IHtcbiAgICAgICAgY29uc3QgcmVuZGVyZWREZWZpbml0aW9uID0gdGhpcy5yZW5kZXJEZWZpbml0aW9ucyhcbiAgICAgICAgICAgIGNvbXBpbGVkRmlsZS5zb3VyY2VGaWxlLCBjbGF6eiwgaW1wb3J0TWFuYWdlcixcbiAgICAgICAgICAgICEhdGhpcy50c0NvbmZpZz8ub3B0aW9ucy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcik7XG4gICAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLmFkZERlZmluaXRpb25zKG91dHB1dFRleHQsIGNsYXp6LCByZW5kZXJlZERlZmluaXRpb24pO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlcmVkU3RhdGVtZW50cyA9XG4gICAgICAgICAgICB0aGlzLnJlbmRlckFkamFjZW50U3RhdGVtZW50cyhjb21waWxlZEZpbGUuc291cmNlRmlsZSwgY2xhenosIGltcG9ydE1hbmFnZXIpO1xuICAgICAgICB0aGlzLnNyY0Zvcm1hdHRlci5hZGRBZGphY2VudFN0YXRlbWVudHMob3V0cHV0VGV4dCwgY2xhenosIHJlbmRlcmVkU3RhdGVtZW50cyk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFpc0VudHJ5UG9pbnQgJiYgY29tcGlsZWRGaWxlLnJlZXhwb3J0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLmFkZERpcmVjdEV4cG9ydHMoXG4gICAgICAgICAgICBvdXRwdXRUZXh0LCBjb21waWxlZEZpbGUucmVleHBvcnRzLCBpbXBvcnRNYW5hZ2VyLCBjb21waWxlZEZpbGUuc291cmNlRmlsZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3JjRm9ybWF0dGVyLmFkZENvbnN0YW50cyhcbiAgICAgICAgICBvdXRwdXRUZXh0LFxuICAgICAgICAgIHJlbmRlckNvbnN0YW50UG9vbChcbiAgICAgICAgICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIsIGNvbXBpbGVkRmlsZS5zb3VyY2VGaWxlLCBjb21waWxlZEZpbGUuY29uc3RhbnRQb29sLCBpbXBvcnRNYW5hZ2VyKSxcbiAgICAgICAgICBjb21waWxlZEZpbGUuc291cmNlRmlsZSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGV4cG9ydHMgdG8gdGhlIGVudHJ5LXBvaW50IGZpbGVcbiAgICBpZiAoaXNFbnRyeVBvaW50KSB7XG4gICAgICBjb25zdCBlbnRyeVBvaW50QmFzZVBhdGggPSBzdHJpcEV4dGVuc2lvbih0aGlzLmJ1bmRsZS5zcmMucGF0aCk7XG4gICAgICB0aGlzLnNyY0Zvcm1hdHRlci5hZGRFeHBvcnRzKFxuICAgICAgICAgIG91dHB1dFRleHQsIGVudHJ5UG9pbnRCYXNlUGF0aCwgcHJpdmF0ZURlY2xhcmF0aW9uc0FuYWx5c2VzLCBpbXBvcnRNYW5hZ2VyLCBzb3VyY2VGaWxlKTtcbiAgICB9XG5cbiAgICBpZiAoaXNFbnRyeVBvaW50IHx8IGNvbXBpbGVkRmlsZSkge1xuICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIuYWRkSW1wb3J0cyhcbiAgICAgICAgICBvdXRwdXRUZXh0LCBpbXBvcnRNYW5hZ2VyLmdldEFsbEltcG9ydHMoc291cmNlRmlsZS5maWxlTmFtZSksIHNvdXJjZUZpbGUpO1xuICAgIH1cblxuICAgIGlmIChjb21waWxlZEZpbGUgfHwgc3dpdGNoTWFya2VyQW5hbHlzaXMgfHwgaXNFbnRyeVBvaW50KSB7XG4gICAgICByZXR1cm4gcmVuZGVyU291cmNlQW5kTWFwKHRoaXMubG9nZ2VyLCB0aGlzLmZzLCBzb3VyY2VGaWxlLCBvdXRwdXRUZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGcm9tIHRoZSBnaXZlbiBsaXN0IG9mIGNsYXNzZXMsIGNvbXB1dGVzIGEgbWFwIG9mIGRlY29yYXRvcnMgdGhhdCBzaG91bGQgYmUgcmVtb3ZlZC5cbiAgICogVGhlIGRlY29yYXRvcnMgdG8gcmVtb3ZlIGFyZSBrZXllZCBieSB0aGVpciBjb250YWluZXIgbm9kZSwgc3VjaCB0aGF0IHdlIGNhbiB0ZWxsIGlmXG4gICAqIHdlIHNob3VsZCByZW1vdmUgdGhlIGVudGlyZSBkZWNvcmF0b3IgcHJvcGVydHkuXG4gICAqIEBwYXJhbSBjbGFzc2VzIFRoZSBsaXN0IG9mIGNsYXNzZXMgdGhhdCBtYXkgaGF2ZSBkZWNvcmF0b3JzIHRvIHJlbW92ZS5cbiAgICogQHJldHVybnMgQSBtYXAgb2YgZGVjb3JhdG9ycyB0byByZW1vdmUsIGtleWVkIGJ5IHRoZWlyIGNvbnRhaW5lciBub2RlLlxuICAgKi9cbiAgcHJpdmF0ZSBjb21wdXRlRGVjb3JhdG9yc1RvUmVtb3ZlKGNsYXNzZXM6IENvbXBpbGVkQ2xhc3NbXSk6IFJlZHVuZGFudERlY29yYXRvck1hcCB7XG4gICAgY29uc3QgZGVjb3JhdG9yc1RvUmVtb3ZlID0gbmV3IFJlZHVuZGFudERlY29yYXRvck1hcCgpO1xuICAgIGNsYXNzZXMuZm9yRWFjaChjbGF6eiA9PiB7XG4gICAgICBpZiAoY2xhenouZGVjb3JhdG9ycyA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNsYXp6LmRlY29yYXRvcnMuZm9yRWFjaChkZWMgPT4ge1xuICAgICAgICBpZiAoZGVjLm5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVjb3JhdG9yQXJyYXkgPSBkZWMubm9kZS5wYXJlbnQhO1xuICAgICAgICBpZiAoIWRlY29yYXRvcnNUb1JlbW92ZS5oYXMoZGVjb3JhdG9yQXJyYXkpKSB7XG4gICAgICAgICAgZGVjb3JhdG9yc1RvUmVtb3ZlLnNldChkZWNvcmF0b3JBcnJheSwgW2RlYy5ub2RlXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVjb3JhdG9yc1RvUmVtb3ZlLmdldChkZWNvcmF0b3JBcnJheSkhLnB1c2goZGVjLm5vZGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVjb3JhdG9yc1RvUmVtb3ZlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlciB0aGUgZGVmaW5pdGlvbnMgYXMgc291cmNlIGNvZGUgZm9yIHRoZSBnaXZlbiBjbGFzcy5cbiAgICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIGZpbGUgY29udGFpbmluZyB0aGUgY2xhc3MgdG8gcHJvY2Vzcy5cbiAgICogQHBhcmFtIGNsYXp6IFRoZSBjbGFzcyB3aG9zZSBkZWZpbml0aW9ucyBhcmUgdG8gYmUgcmVuZGVyZWQuXG4gICAqIEBwYXJhbSBjb21waWxhdGlvbiBUaGUgcmVzdWx0cyBvZiBhbmFseXppbmcgdGhlIGNsYXNzIC0gdGhpcyBpcyB1c2VkIHRvIGdlbmVyYXRlIHRoZSByZW5kZXJlZFxuICAgKiBkZWZpbml0aW9ucy5cbiAgICogQHBhcmFtIGltcG9ydHMgQW4gb2JqZWN0IHRoYXQgdHJhY2tzIHRoZSBpbXBvcnRzIHRoYXQgYXJlIG5lZWRlZCBieSB0aGUgcmVuZGVyZWQgZGVmaW5pdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIHJlbmRlckRlZmluaXRpb25zKFxuICAgICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgY29tcGlsZWRDbGFzczogQ29tcGlsZWRDbGFzcywgaW1wb3J0czogSW1wb3J0TWFuYWdlcixcbiAgICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBjb25zdCBuYW1lID0gdGhpcy5ob3N0LmdldEludGVybmFsTmFtZU9mQ2xhc3MoY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgY29uc3QgbGVhZGluZ0NvbW1lbnQgPVxuICAgICAgICBhbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlciA/IGpzRG9jQ29tbWVudChbe3RhZ05hbWU6ICdub2NvbGxhcHNlJ31dKSA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBzdGF0ZW1lbnRzOiBTdGF0ZW1lbnRbXSA9IGNvbXBpbGVkQ2xhc3MuY29tcGlsYXRpb24ubWFwKFxuICAgICAgICBjID0+IGNyZWF0ZUFzc2lnbm1lbnRTdGF0ZW1lbnQobmFtZSwgYy5uYW1lLCBjLmluaXRpYWxpemVyLCBsZWFkaW5nQ29tbWVudCkpO1xuICAgIHJldHVybiB0aGlzLnJlbmRlclN0YXRlbWVudHMoc291cmNlRmlsZSwgc3RhdGVtZW50cywgaW1wb3J0cyk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSBhZGphY2VudCBzdGF0ZW1lbnRzIGFzIHNvdXJjZSBjb2RlIGZvciB0aGUgZ2l2ZW4gY2xhc3MuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIFRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIGNsYXNzIHRvIHByb2Nlc3MuXG4gICAqIEBwYXJhbSBjbGF6eiBUaGUgY2xhc3Mgd2hvc2Ugc3RhdGVtZW50cyBhcmUgdG8gYmUgcmVuZGVyZWQuXG4gICAqIEBwYXJhbSBjb21waWxhdGlvbiBUaGUgcmVzdWx0cyBvZiBhbmFseXppbmcgdGhlIGNsYXNzIC0gdGhpcyBpcyB1c2VkIHRvIGdlbmVyYXRlIHRoZSByZW5kZXJlZFxuICAgKiBkZWZpbml0aW9ucy5cbiAgICogQHBhcmFtIGltcG9ydHMgQW4gb2JqZWN0IHRoYXQgdHJhY2tzIHRoZSBpbXBvcnRzIHRoYXQgYXJlIG5lZWRlZCBieSB0aGUgcmVuZGVyZWQgZGVmaW5pdGlvbnMuXG4gICAqL1xuICBwcml2YXRlIHJlbmRlckFkamFjZW50U3RhdGVtZW50cyhcbiAgICAgIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGNvbXBpbGVkQ2xhc3M6IENvbXBpbGVkQ2xhc3MsIGltcG9ydHM6IEltcG9ydE1hbmFnZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHN0YXRlbWVudHM6IFN0YXRlbWVudFtdID0gW107XG4gICAgZm9yIChjb25zdCBjIG9mIGNvbXBpbGVkQ2xhc3MuY29tcGlsYXRpb24pIHtcbiAgICAgIHN0YXRlbWVudHMucHVzaCguLi5jLnN0YXRlbWVudHMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJTdGF0ZW1lbnRzKHNvdXJjZUZpbGUsIHN0YXRlbWVudHMsIGltcG9ydHMpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJTdGF0ZW1lbnRzKFxuICAgICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgc3RhdGVtZW50czogU3RhdGVtZW50W10sIGltcG9ydHM6IEltcG9ydE1hbmFnZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IHByaW50U3RhdGVtZW50ID0gKHN0bXQ6IFN0YXRlbWVudCkgPT5cbiAgICAgICAgdGhpcy5zcmNGb3JtYXR0ZXIucHJpbnRTdGF0ZW1lbnQoc3RtdCwgc291cmNlRmlsZSwgaW1wb3J0cyk7XG4gICAgcmV0dXJuIHN0YXRlbWVudHMubWFwKHByaW50U3RhdGVtZW50KS5qb2luKCdcXG4nKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlciB0aGUgY29uc3RhbnQgcG9vbCBhcyBzb3VyY2UgY29kZSBmb3IgdGhlIGdpdmVuIGNsYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ29uc3RhbnRQb29sKFxuICAgIGZvcm1hdHRlcjogUmVuZGVyaW5nRm9ybWF0dGVyLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCxcbiAgICBpbXBvcnRzOiBJbXBvcnRNYW5hZ2VyKTogc3RyaW5nIHtcbiAgY29uc3QgcHJpbnRTdGF0ZW1lbnQgPSAoc3RtdDogU3RhdGVtZW50KSA9PiBmb3JtYXR0ZXIucHJpbnRTdGF0ZW1lbnQoc3RtdCwgc291cmNlRmlsZSwgaW1wb3J0cyk7XG4gIHJldHVybiBjb25zdGFudFBvb2wuc3RhdGVtZW50cy5tYXAocHJpbnRTdGF0ZW1lbnQpLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBBbmd1bGFyIEFTVCBzdGF0ZW1lbnQgbm9kZSB0aGF0IGNvbnRhaW5zIHRoZSBhc3NpZ25tZW50IG9mIHRoZVxuICogY29tcGlsZWQgZGVjb3JhdG9yIHRvIGJlIGFwcGxpZWQgdG8gdGhlIGNsYXNzLlxuICogQHBhcmFtIGFuYWx5emVkQ2xhc3MgVGhlIGluZm8gYWJvdXQgdGhlIGNsYXNzIHdob3NlIHN0YXRlbWVudCB3ZSB3YW50IHRvIGNyZWF0ZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWdubWVudFN0YXRlbWVudChcbiAgICByZWNlaXZlck5hbWU6IHRzLkRlY2xhcmF0aW9uTmFtZSwgcHJvcE5hbWU6IHN0cmluZywgaW5pdGlhbGl6ZXI6IEV4cHJlc3Npb24sXG4gICAgbGVhZGluZ0NvbW1lbnQ/OiBMZWFkaW5nQ29tbWVudCk6IFN0YXRlbWVudCB7XG4gIGNvbnN0IHJlY2VpdmVyID0gbmV3IFdyYXBwZWROb2RlRXhwcihyZWNlaXZlck5hbWUpO1xuICBjb25zdCBzdGF0ZW1lbnQgPVxuICAgICAgbmV3IFdyaXRlUHJvcEV4cHIoXG4gICAgICAgICAgcmVjZWl2ZXIsIHByb3BOYW1lLCBpbml0aWFsaXplciwgLyogdHlwZSAqLyB1bmRlZmluZWQsIC8qIHNvdXJjZVNwYW4gKi8gdW5kZWZpbmVkKVxuICAgICAgICAgIC50b1N0bXQoKTtcbiAgaWYgKGxlYWRpbmdDb21tZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICBzdGF0ZW1lbnQuYWRkTGVhZGluZ0NvbW1lbnQobGVhZGluZ0NvbW1lbnQpO1xuICB9XG4gIHJldHVybiBzdGF0ZW1lbnQ7XG59XG4iXX0=