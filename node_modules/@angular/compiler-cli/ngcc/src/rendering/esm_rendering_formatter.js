(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/ngcc/src/rendering/esm_rendering_formatter", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/ngtsc/file_system", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/ngtsc/util/src/typescript", "@angular/compiler-cli/ngcc/src/host/esm2015_host", "@angular/compiler-cli/ngcc/src/host/ngcc_host", "@angular/compiler-cli/ngcc/src/rendering/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EsmRenderingFormatter = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var file_system_1 = require("@angular/compiler-cli/src/ngtsc/file_system");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var typescript_1 = require("@angular/compiler-cli/src/ngtsc/util/src/typescript");
    var esm2015_host_1 = require("@angular/compiler-cli/ngcc/src/host/esm2015_host");
    var ngcc_host_1 = require("@angular/compiler-cli/ngcc/src/host/ngcc_host");
    var utils_1 = require("@angular/compiler-cli/ngcc/src/rendering/utils");
    /**
     * A RenderingFormatter that works with ECMAScript Module import and export statements.
     */
    var EsmRenderingFormatter = /** @class */ (function () {
        function EsmRenderingFormatter(host, isCore) {
            this.host = host;
            this.isCore = isCore;
            this.printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
        }
        /**
         *  Add the imports at the top of the file, after any imports that are already there.
         */
        EsmRenderingFormatter.prototype.addImports = function (output, imports, sf) {
            if (imports.length === 0) {
                return;
            }
            var insertionPoint = this.findEndOfImports(sf);
            var renderedImports = imports.map(function (i) { return "import * as " + i.qualifier + " from '" + i.specifier + "';\n"; }).join('');
            output.appendLeft(insertionPoint, renderedImports);
        };
        /**
         * Add the exports to the end of the file.
         */
        EsmRenderingFormatter.prototype.addExports = function (output, entryPointBasePath, exports, importManager, file) {
            exports.forEach(function (e) {
                var exportFrom = '';
                var isDtsFile = typescript_1.isDtsPath(entryPointBasePath);
                var from = isDtsFile ? e.dtsFrom : e.from;
                if (from) {
                    var basePath = utils_1.stripExtension(from);
                    var relativePath = file_system_1.relative(file_system_1.dirname(entryPointBasePath), basePath);
                    var relativeImport = file_system_1.toRelativeImport(relativePath);
                    exportFrom = entryPointBasePath !== basePath ? " from '" + relativeImport + "'" : '';
                }
                var exportStr = "\nexport {" + e.identifier + "}" + exportFrom + ";";
                output.append(exportStr);
            });
        };
        /**
         * Add plain exports to the end of the file.
         *
         * Unlike `addExports`, direct exports go directly in a .js and .d.ts file and don't get added to
         * an entrypoint.
         */
        EsmRenderingFormatter.prototype.addDirectExports = function (output, exports, importManager, file) {
            var e_1, _a;
            try {
                for (var exports_1 = tslib_1.__values(exports), exports_1_1 = exports_1.next(); !exports_1_1.done; exports_1_1 = exports_1.next()) {
                    var e = exports_1_1.value;
                    var exportStatement = "\nexport {" + e.symbolName + " as " + e.asAlias + "} from '" + e.fromModule + "';";
                    output.append(exportStatement);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (exports_1_1 && !exports_1_1.done && (_a = exports_1.return)) _a.call(exports_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        /**
         * Add the constants directly after the imports.
         */
        EsmRenderingFormatter.prototype.addConstants = function (output, constants, file) {
            if (constants === '') {
                return;
            }
            var insertionPoint = this.findEndOfImports(file);
            // Append the constants to the right of the insertion point, to ensure they get ordered after
            // added imports (those are appended left to the insertion point).
            output.appendRight(insertionPoint, '\n' + constants + '\n');
        };
        /**
         * Add the definitions directly after their decorated class.
         */
        EsmRenderingFormatter.prototype.addDefinitions = function (output, compiledClass, definitions) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var declarationStatement = esm2015_host_1.getContainingStatement(classSymbol.implementation.valueDeclaration);
            var insertionPoint = declarationStatement.getEnd();
            output.appendLeft(insertionPoint, '\n' + definitions);
        };
        /**
         * Add the adjacent statements after all static properties of the class.
         */
        EsmRenderingFormatter.prototype.addAdjacentStatements = function (output, compiledClass, statements) {
            var classSymbol = this.host.getClassSymbol(compiledClass.declaration);
            if (!classSymbol) {
                throw new Error("Compiled class does not have a valid symbol: " + compiledClass.name);
            }
            var endOfClass = this.host.getEndOfClass(classSymbol);
            output.appendLeft(endOfClass.getEnd(), '\n' + statements);
        };
        /**
         * Remove static decorator properties from classes.
         */
        EsmRenderingFormatter.prototype.removeDecorators = function (output, decoratorsToRemove) {
            decoratorsToRemove.forEach(function (nodesToRemove, containerNode) {
                if (ts.isArrayLiteralExpression(containerNode)) {
                    var items_1 = containerNode.elements;
                    if (items_1.length === nodesToRemove.length) {
                        // Remove the entire statement
                        var statement = findStatement(containerNode);
                        if (statement) {
                            if (ts.isExpressionStatement(statement)) {
                                // The statement looks like: `SomeClass = __decorate(...);`
                                // Remove it completely
                                output.remove(statement.getFullStart(), statement.getEnd());
                            }
                            else if (ts.isReturnStatement(statement) && statement.expression &&
                                esm2015_host_1.isAssignment(statement.expression)) {
                                // The statement looks like: `return SomeClass = __decorate(...);`
                                // We only want to end up with: `return SomeClass;`
                                var startOfRemoval = statement.expression.left.getEnd();
                                var endOfRemoval = getEndExceptSemicolon(statement);
                                output.remove(startOfRemoval, endOfRemoval);
                            }
                        }
                    }
                    else {
                        nodesToRemove.forEach(function (node) {
                            // remove any trailing comma
                            var nextSibling = getNextSiblingInArray(node, items_1);
                            var end;
                            if (nextSibling !== null &&
                                output.slice(nextSibling.getFullStart() - 1, nextSibling.getFullStart()) === ',') {
                                end = nextSibling.getFullStart() - 1 + nextSibling.getLeadingTriviaWidth();
                            }
                            else if (output.slice(node.getEnd(), node.getEnd() + 1) === ',') {
                                end = node.getEnd() + 1;
                            }
                            else {
                                end = node.getEnd();
                            }
                            output.remove(node.getFullStart(), end);
                        });
                    }
                }
            });
        };
        /**
         * Rewrite the the IVY switch markers to indicate we are in IVY mode.
         */
        EsmRenderingFormatter.prototype.rewriteSwitchableDeclarations = function (outputText, sourceFile, declarations) {
            declarations.forEach(function (declaration) {
                var start = declaration.initializer.getStart();
                var end = declaration.initializer.getEnd();
                var replacement = declaration.initializer.text.replace(ngcc_host_1.PRE_R3_MARKER, ngcc_host_1.POST_R3_MARKER);
                outputText.overwrite(start, end, replacement);
            });
        };
        /**
         * Add the type parameters to the appropriate functions that return `ModuleWithProviders`
         * structures.
         *
         * This function will only get called on typings files.
         */
        EsmRenderingFormatter.prototype.addModuleWithProvidersParams = function (outputText, moduleWithProviders, importManager) {
            var _this = this;
            moduleWithProviders.forEach(function (info) {
                var ngModuleName = info.ngModule.node.name.text;
                var declarationFile = file_system_1.absoluteFromSourceFile(info.declaration.getSourceFile());
                var ngModuleFile = file_system_1.absoluteFromSourceFile(info.ngModule.node.getSourceFile());
                var relativePath = file_system_1.relative(file_system_1.dirname(declarationFile), ngModuleFile);
                var relativeImport = file_system_1.toRelativeImport(relativePath);
                var importPath = info.ngModule.ownedByModuleGuess ||
                    (declarationFile !== ngModuleFile ? utils_1.stripExtension(relativeImport) : null);
                var ngModule = generateImportString(importManager, importPath, ngModuleName);
                if (info.declaration.type) {
                    var typeName = info.declaration.type && ts.isTypeReferenceNode(info.declaration.type) ?
                        info.declaration.type.typeName :
                        null;
                    if (_this.isCoreModuleWithProvidersType(typeName)) {
                        // The declaration already returns `ModuleWithProvider` but it needs the `NgModule` type
                        // parameter adding.
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "ModuleWithProviders<" + ngModule + ">");
                    }
                    else {
                        // The declaration returns an unknown type so we need to convert it to a union that
                        // includes the ngModule property.
                        var originalTypeString = info.declaration.type.getText();
                        outputText.overwrite(info.declaration.type.getStart(), info.declaration.type.getEnd(), "(" + originalTypeString + ")&{ngModule:" + ngModule + "}");
                    }
                }
                else {
                    // The declaration has no return type so provide one.
                    var lastToken = info.declaration.getLastToken();
                    var insertPoint = lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken ?
                        lastToken.getStart() :
                        info.declaration.getEnd();
                    outputText.appendLeft(insertPoint, ": " + generateImportString(importManager, '@angular/core', 'ModuleWithProviders') + "<" + ngModule + ">");
                }
            });
        };
        /**
         * Convert a `Statement` to JavaScript code in a format suitable for rendering by this formatter.
         *
         * @param stmt The `Statement` to print.
         * @param sourceFile A `ts.SourceFile` that provides context for the statement. See
         *     `ts.Printer#printNode()` for more info.
         * @param importManager The `ImportManager` to use for managing imports.
         *
         * @return The JavaScript code corresponding to `stmt` (in the appropriate format).
         */
        EsmRenderingFormatter.prototype.printStatement = function (stmt, sourceFile, importManager) {
            var node = translator_1.translateStatement(stmt, importManager);
            var code = this.printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
            return code;
        };
        EsmRenderingFormatter.prototype.findEndOfImports = function (sf) {
            var e_2, _a;
            try {
                for (var _b = tslib_1.__values(sf.statements), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var stmt = _c.value;
                    if (!ts.isImportDeclaration(stmt) && !ts.isImportEqualsDeclaration(stmt) &&
                        !ts.isNamespaceImport(stmt)) {
                        return stmt.getStart();
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return 0;
        };
        /**
         * Check whether the given type is the core Angular `ModuleWithProviders` interface.
         * @param typeName The type to check.
         * @returns true if the type is the core Angular `ModuleWithProviders` interface.
         */
        EsmRenderingFormatter.prototype.isCoreModuleWithProvidersType = function (typeName) {
            var id = typeName && ts.isIdentifier(typeName) ? this.host.getImportOfIdentifier(typeName) : null;
            return (id && id.name === 'ModuleWithProviders' && (this.isCore || id.from === '@angular/core'));
        };
        return EsmRenderingFormatter;
    }());
    exports.EsmRenderingFormatter = EsmRenderingFormatter;
    function findStatement(node) {
        while (node) {
            if (ts.isExpressionStatement(node) || ts.isReturnStatement(node)) {
                return node;
            }
            node = node.parent;
        }
        return undefined;
    }
    function generateImportString(importManager, importPath, importName) {
        var importAs = importPath ? importManager.generateNamedImport(importPath, importName) : null;
        return importAs && importAs.moduleImport ? importAs.moduleImport.text + "." + importAs.symbol :
            "" + importName;
    }
    function getNextSiblingInArray(node, array) {
        var index = array.indexOf(node);
        return index !== -1 && array.length > index + 1 ? array[index + 1] : null;
    }
    function getEndExceptSemicolon(statement) {
        var lastToken = statement.getLastToken();
        return (lastToken && lastToken.kind === ts.SyntaxKind.SemicolonToken) ? statement.getEnd() - 1 :
            statement.getEnd();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNtX3JlbmRlcmluZ19mb3JtYXR0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci1jbGkvbmdjYy9zcmMvcmVuZGVyaW5nL2VzbV9yZW5kZXJpbmdfZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFTQSwrQkFBaUM7SUFFakMsMkVBQTJIO0lBRTNILHlFQUF3RjtJQUN4RixrRkFBaUU7SUFJakUsaUZBQTBFO0lBQzFFLDJFQUFtSDtJQUduSCx3RUFBdUM7SUFFdkM7O09BRUc7SUFDSDtRQUdFLCtCQUFzQixJQUF3QixFQUFZLE1BQWU7WUFBbkQsU0FBSSxHQUFKLElBQUksQ0FBb0I7WUFBWSxXQUFNLEdBQU4sTUFBTSxDQUFTO1lBRi9ELFlBQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztRQUVHLENBQUM7UUFFN0U7O1dBRUc7UUFDSCwwQ0FBVSxHQUFWLFVBQVcsTUFBbUIsRUFBRSxPQUFpQixFQUFFLEVBQWlCO1lBQ2xFLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU87YUFDUjtZQUVELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqRCxJQUFNLGVBQWUsR0FDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGlCQUFlLENBQUMsQ0FBQyxTQUFTLGVBQVUsQ0FBQyxDQUFDLFNBQVMsU0FBTSxFQUFyRCxDQUFxRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JGLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRDs7V0FFRztR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Q0FBQyxDQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxTQUFJLFFBQVEsQ0FBQyxNQUFRLENBQUMsQ0FBQztZQUNwRCxLQUFHLFVBQVksQ0FBQztJQUM3RCxDQUFDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBb0IsSUFBTyxFQUFFLEtBQXNCO1FBQy9FLElBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDNUUsQ0FBQztJQUVELFNBQVMscUJBQXFCLENBQUMsU0FBdUI7UUFDcEQsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzNDLE9BQU8sQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzdGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7U3RhdGVtZW50fSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5pbXBvcnQgTWFnaWNTdHJpbmcgZnJvbSAnbWFnaWMtc3RyaW5nJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2Fic29sdXRlRnJvbVNvdXJjZUZpbGUsIEFic29sdXRlRnNQYXRoLCBkaXJuYW1lLCByZWxhdGl2ZSwgdG9SZWxhdGl2ZUltcG9ydH0gZnJvbSAnLi4vLi4vLi4vc3JjL25ndHNjL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7UmVleHBvcnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy9pbXBvcnRzJztcbmltcG9ydCB7SW1wb3J0LCBJbXBvcnRNYW5hZ2VyLCB0cmFuc2xhdGVTdGF0ZW1lbnR9IGZyb20gJy4uLy4uLy4uL3NyYy9uZ3RzYy90cmFuc2xhdG9yJztcbmltcG9ydCB7aXNEdHNQYXRofSBmcm9tICcuLi8uLi8uLi9zcmMvbmd0c2MvdXRpbC9zcmMvdHlwZXNjcmlwdCc7XG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnNJbmZvfSBmcm9tICcuLi9hbmFseXNpcy9tb2R1bGVfd2l0aF9wcm92aWRlcnNfYW5hbHl6ZXInO1xuaW1wb3J0IHtFeHBvcnRJbmZvfSBmcm9tICcuLi9hbmFseXNpcy9wcml2YXRlX2RlY2xhcmF0aW9uc19hbmFseXplcic7XG5pbXBvcnQge0NvbXBpbGVkQ2xhc3N9IGZyb20gJy4uL2FuYWx5c2lzL3R5cGVzJztcbmltcG9ydCB7Z2V0Q29udGFpbmluZ1N0YXRlbWVudCwgaXNBc3NpZ25tZW50fSBmcm9tICcuLi9ob3N0L2VzbTIwMTVfaG9zdCc7XG5pbXBvcnQge05nY2NSZWZsZWN0aW9uSG9zdCwgUE9TVF9SM19NQVJLRVIsIFBSRV9SM19NQVJLRVIsIFN3aXRjaGFibGVWYXJpYWJsZURlY2xhcmF0aW9ufSBmcm9tICcuLi9ob3N0L25nY2NfaG9zdCc7XG5cbmltcG9ydCB7UmVkdW5kYW50RGVjb3JhdG9yTWFwLCBSZW5kZXJpbmdGb3JtYXR0ZXJ9IGZyb20gJy4vcmVuZGVyaW5nX2Zvcm1hdHRlcic7XG5pbXBvcnQge3N0cmlwRXh0ZW5zaW9ufSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBBIFJlbmRlcmluZ0Zvcm1hdHRlciB0aGF0IHdvcmtzIHdpdGggRUNNQVNjcmlwdCBNb2R1bGUgaW1wb3J0IGFuZCBleHBvcnQgc3RhdGVtZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEVzbVJlbmRlcmluZ0Zvcm1hdHRlciBpbXBsZW1lbnRzIFJlbmRlcmluZ0Zvcm1hdHRlciB7XG4gIHByb3RlY3RlZCBwcmludGVyID0gdHMuY3JlYXRlUHJpbnRlcih7bmV3TGluZTogdHMuTmV3TGluZUtpbmQuTGluZUZlZWR9KTtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgaG9zdDogTmdjY1JlZmxlY3Rpb25Ib3N0LCBwcm90ZWN0ZWQgaXNDb3JlOiBib29sZWFuKSB7fVxuXG4gIC8qKlxuICAgKiAgQWRkIHRoZSBpbXBvcnRzIGF0IHRoZSB0b3Agb2YgdGhlIGZpbGUsIGFmdGVyIGFueSBpbXBvcnRzIHRoYXQgYXJlIGFscmVhZHkgdGhlcmUuXG4gICAqL1xuICBhZGRJbXBvcnRzKG91dHB1dDogTWFnaWNTdHJpbmcsIGltcG9ydHM6IEltcG9ydFtdLCBzZjogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGlmIChpbXBvcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluc2VydGlvblBvaW50ID0gdGhpcy5maW5kRW5kT2ZJbXBvcnRzKHNmKTtcbiAgICBjb25zdCByZW5kZXJlZEltcG9ydHMgPVxuICAgICAgICBpbXBvcnRzLm1hcChpID0+IGBpbXBvcnQgKiBhcyAke2kucXVhbGlmaWVyfSBmcm9tICcke2kuc3BlY2lmaWVyfSc7XFxuYCkuam9pbignJyk7XG4gICAgb3V0cHV0LmFwcGVuZExlZnQoaW5zZXJ0aW9uUG9pbnQsIHJlbmRlcmVkSW1wb3J0cyk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBleHBvcnRzIHRvIHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAqL1xuICBhZGRFeHBvcnRzKFxuICAgICAgb3V0cHV0OiBNYWdpY1N0cmluZywgZW50cnlQb2ludEJhc2VQYXRoOiBBYnNvbHV0ZUZzUGF0aCwgZXhwb3J0czogRXhwb3J0SW5mb1tdLFxuICAgICAgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlciwgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGV4cG9ydHMuZm9yRWFjaChlID0+IHtcbiAgICAgIGxldCBleHBvcnRGcm9tID0gJyc7XG4gICAgICBjb25zdCBpc0R0c0ZpbGUgPSBpc0R0c1BhdGgoZW50cnlQb2ludEJhc2VQYXRoKTtcbiAgICAgIGNvbnN0IGZyb20gPSBpc0R0c0ZpbGUgPyBlLmR0c0Zyb20gOiBlLmZyb207XG5cbiAgICAgIGlmIChmcm9tKSB7XG4gICAgICAgIGNvbnN0IGJhc2VQYXRoID0gc3RyaXBFeHRlbnNpb24oZnJvbSk7XG4gICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUoZW50cnlQb2ludEJhc2VQYXRoKSwgYmFzZVBhdGgpO1xuICAgICAgICBjb25zdCByZWxhdGl2ZUltcG9ydCA9IHRvUmVsYXRpdmVJbXBvcnQocmVsYXRpdmVQYXRoKTtcbiAgICAgICAgZXhwb3J0RnJvbSA9IGVudHJ5UG9pbnRCYXNlUGF0aCAhPT0gYmFzZVBhdGggPyBgIGZyb20gJyR7cmVsYXRpdmVJbXBvcnR9J2AgOiAnJztcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXhwb3J0U3RyID0gYFxcbmV4cG9ydCB7JHtlLmlkZW50aWZpZXJ9fSR7ZXhwb3J0RnJvbX07YDtcbiAgICAgIG91dHB1dC5hcHBlbmQoZXhwb3J0U3RyKTtcbiAgICB9KTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFkZCBwbGFpbiBleHBvcnRzIHRvIHRoZSBlbmQgb2YgdGhlIGZpbGUuXG4gICAqXG4gICAqIFVubGlrZSBgYWRkRXhwb3J0c2AsIGRpcmVjdCBleHBvcnRzIGdvIGRpcmVjdGx5IGluIGEgLmpzIGFuZCAuZC50cyBmaWxlIGFuZCBkb24ndCBnZXQgYWRkZWQgdG9cbiAgICogYW4gZW50cnlwb2ludC5cbiAgICovXG4gIGFkZERpcmVjdEV4cG9ydHMoXG4gICAgICBvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBleHBvcnRzOiBSZWV4cG9ydFtdLCBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyLFxuICAgICAgZmlsZTogdHMuU291cmNlRmlsZSk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZSBvZiBleHBvcnRzKSB7XG4gICAgICBjb25zdCBleHBvcnRTdGF0ZW1lbnQgPSBgXFxuZXhwb3J0IHske2Uuc3ltYm9sTmFtZX0gYXMgJHtlLmFzQWxpYXN9fSBmcm9tICcke2UuZnJvbU1vZHVsZX0nO2A7XG4gICAgICBvdXRwdXQuYXBwZW5kKGV4cG9ydFN0YXRlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgY29uc3RhbnRzIGRpcmVjdGx5IGFmdGVyIHRoZSBpbXBvcnRzLlxuICAgKi9cbiAgYWRkQ29uc3RhbnRzKG91dHB1dDogTWFnaWNTdHJpbmcsIGNvbnN0YW50czogc3RyaW5nLCBmaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgaWYgKGNvbnN0YW50cyA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW5zZXJ0aW9uUG9pbnQgPSB0aGlzLmZpbmRFbmRPZkltcG9ydHMoZmlsZSk7XG5cbiAgICAvLyBBcHBlbmQgdGhlIGNvbnN0YW50cyB0byB0aGUgcmlnaHQgb2YgdGhlIGluc2VydGlvbiBwb2ludCwgdG8gZW5zdXJlIHRoZXkgZ2V0IG9yZGVyZWQgYWZ0ZXJcbiAgICAvLyBhZGRlZCBpbXBvcnRzICh0aG9zZSBhcmUgYXBwZW5kZWQgbGVmdCB0byB0aGUgaW5zZXJ0aW9uIHBvaW50KS5cbiAgICBvdXRwdXQuYXBwZW5kUmlnaHQoaW5zZXJ0aW9uUG9pbnQsICdcXG4nICsgY29uc3RhbnRzICsgJ1xcbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgZGVmaW5pdGlvbnMgZGlyZWN0bHkgYWZ0ZXIgdGhlaXIgZGVjb3JhdGVkIGNsYXNzLlxuICAgKi9cbiAgYWRkRGVmaW5pdGlvbnMob3V0cHV0OiBNYWdpY1N0cmluZywgY29tcGlsZWRDbGFzczogQ29tcGlsZWRDbGFzcywgZGVmaW5pdGlvbnM6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNsYXNzU3ltYm9sID0gdGhpcy5ob3N0LmdldENsYXNzU3ltYm9sKGNvbXBpbGVkQ2xhc3MuZGVjbGFyYXRpb24pO1xuICAgIGlmICghY2xhc3NTeW1ib2wpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tcGlsZWQgY2xhc3MgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHN5bWJvbDogJHtjb21waWxlZENsYXNzLm5hbWV9YCk7XG4gICAgfVxuICAgIGNvbnN0IGRlY2xhcmF0aW9uU3RhdGVtZW50ID1cbiAgICAgICAgZ2V0Q29udGFpbmluZ1N0YXRlbWVudChjbGFzc1N5bWJvbC5pbXBsZW1lbnRhdGlvbi52YWx1ZURlY2xhcmF0aW9uKTtcbiAgICBjb25zdCBpbnNlcnRpb25Qb2ludCA9IGRlY2xhcmF0aW9uU3RhdGVtZW50LmdldEVuZCgpO1xuICAgIG91dHB1dC5hcHBlbmRMZWZ0KGluc2VydGlvblBvaW50LCAnXFxuJyArIGRlZmluaXRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGFkamFjZW50IHN0YXRlbWVudHMgYWZ0ZXIgYWxsIHN0YXRpYyBwcm9wZXJ0aWVzIG9mIHRoZSBjbGFzcy5cbiAgICovXG4gIGFkZEFkamFjZW50U3RhdGVtZW50cyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBjb21waWxlZENsYXNzOiBDb21waWxlZENsYXNzLCBzdGF0ZW1lbnRzOiBzdHJpbmcpOlxuICAgICAgdm9pZCB7XG4gICAgY29uc3QgY2xhc3NTeW1ib2wgPSB0aGlzLmhvc3QuZ2V0Q2xhc3NTeW1ib2woY29tcGlsZWRDbGFzcy5kZWNsYXJhdGlvbik7XG4gICAgaWYgKCFjbGFzc1N5bWJvbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb21waWxlZCBjbGFzcyBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgc3ltYm9sOiAke2NvbXBpbGVkQ2xhc3MubmFtZX1gKTtcbiAgICB9XG4gICAgY29uc3QgZW5kT2ZDbGFzcyA9IHRoaXMuaG9zdC5nZXRFbmRPZkNsYXNzKGNsYXNzU3ltYm9sKTtcbiAgICBvdXRwdXQuYXBwZW5kTGVmdChlbmRPZkNsYXNzLmdldEVuZCgpLCAnXFxuJyArIHN0YXRlbWVudHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBzdGF0aWMgZGVjb3JhdG9yIHByb3BlcnRpZXMgZnJvbSBjbGFzc2VzLlxuICAgKi9cbiAgcmVtb3ZlRGVjb3JhdG9ycyhvdXRwdXQ6IE1hZ2ljU3RyaW5nLCBkZWNvcmF0b3JzVG9SZW1vdmU6IFJlZHVuZGFudERlY29yYXRvck1hcCk6IHZvaWQge1xuICAgIGRlY29yYXRvcnNUb1JlbW92ZS5mb3JFYWNoKChub2Rlc1RvUmVtb3ZlLCBjb250YWluZXJOb2RlKSA9PiB7XG4gICAgICBpZiAodHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKGNvbnRhaW5lck5vZGUpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gY29udGFpbmVyTm9kZS5lbGVtZW50cztcbiAgICAgICAgaWYgKGl0ZW1zLmxlbmd0aCA9PT0gbm9kZXNUb1JlbW92ZS5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIGVudGlyZSBzdGF0ZW1lbnRcbiAgICAgICAgICBjb25zdCBzdGF0ZW1lbnQgPSBmaW5kU3RhdGVtZW50KGNvbnRhaW5lck5vZGUpO1xuICAgICAgICAgIGlmIChzdGF0ZW1lbnQpIHtcbiAgICAgICAgICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQoc3RhdGVtZW50KSkge1xuICAgICAgICAgICAgICAvLyBUaGUgc3RhdGVtZW50IGxvb2tzIGxpa2U6IGBTb21lQ2xhc3MgPSBfX2RlY29yYXRlKC4uLik7YFxuICAgICAgICAgICAgICAvLyBSZW1vdmUgaXQgY29tcGxldGVseVxuICAgICAgICAgICAgICBvdXRwdXQucmVtb3ZlKHN0YXRlbWVudC5nZXRGdWxsU3RhcnQoKSwgc3RhdGVtZW50LmdldEVuZCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgdHMuaXNSZXR1cm5TdGF0ZW1lbnQoc3RhdGVtZW50KSAmJiBzdGF0ZW1lbnQuZXhwcmVzc2lvbiAmJlxuICAgICAgICAgICAgICAgIGlzQXNzaWdubWVudChzdGF0ZW1lbnQuZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICAgICAgLy8gVGhlIHN0YXRlbWVudCBsb29rcyBsaWtlOiBgcmV0dXJuIFNvbWVDbGFzcyA9IF9fZGVjb3JhdGUoLi4uKTtgXG4gICAgICAgICAgICAgIC8vIFdlIG9ubHkgd2FudCB0byBlbmQgdXAgd2l0aDogYHJldHVybiBTb21lQ2xhc3M7YFxuICAgICAgICAgICAgICBjb25zdCBzdGFydE9mUmVtb3ZhbCA9IHN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQuZ2V0RW5kKCk7XG4gICAgICAgICAgICAgIGNvbnN0IGVuZE9mUmVtb3ZhbCA9IGdldEVuZEV4Y2VwdFNlbWljb2xvbihzdGF0ZW1lbnQpO1xuICAgICAgICAgICAgICBvdXRwdXQucmVtb3ZlKHN0YXJ0T2ZSZW1vdmFsLCBlbmRPZlJlbW92YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2Rlc1RvUmVtb3ZlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgICAvLyByZW1vdmUgYW55IHRyYWlsaW5nIGNvbW1hXG4gICAgICAgICAgICBjb25zdCBuZXh0U2libGluZyA9IGdldE5leHRTaWJsaW5nSW5BcnJheShub2RlLCBpdGVtcyk7XG4gICAgICAgICAgICBsZXQgZW5kOiBudW1iZXI7XG5cbiAgICAgICAgICAgIGlmIChuZXh0U2libGluZyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgIG91dHB1dC5zbGljZShuZXh0U2libGluZy5nZXRGdWxsU3RhcnQoKSAtIDEsIG5leHRTaWJsaW5nLmdldEZ1bGxTdGFydCgpKSA9PT0gJywnKSB7XG4gICAgICAgICAgICAgIGVuZCA9IG5leHRTaWJsaW5nLmdldEZ1bGxTdGFydCgpIC0gMSArIG5leHRTaWJsaW5nLmdldExlYWRpbmdUcml2aWFXaWR0aCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvdXRwdXQuc2xpY2Uobm9kZS5nZXRFbmQoKSwgbm9kZS5nZXRFbmQoKSArIDEpID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgZW5kID0gbm9kZS5nZXRFbmQoKSArIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBlbmQgPSBub2RlLmdldEVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0LnJlbW92ZShub2RlLmdldEZ1bGxTdGFydCgpLCBlbmQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV3cml0ZSB0aGUgdGhlIElWWSBzd2l0Y2ggbWFya2VycyB0byBpbmRpY2F0ZSB3ZSBhcmUgaW4gSVZZIG1vZGUuXG4gICAqL1xuICByZXdyaXRlU3dpdGNoYWJsZURlY2xhcmF0aW9ucyhcbiAgICAgIG91dHB1dFRleHQ6IE1hZ2ljU3RyaW5nLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLFxuICAgICAgZGVjbGFyYXRpb25zOiBTd2l0Y2hhYmxlVmFyaWFibGVEZWNsYXJhdGlvbltdKTogdm9pZCB7XG4gICAgZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xuICAgICAgY29uc3Qgc3RhcnQgPSBkZWNsYXJhdGlvbi5pbml0aWFsaXplci5nZXRTdGFydCgpO1xuICAgICAgY29uc3QgZW5kID0gZGVjbGFyYXRpb24uaW5pdGlhbGl6ZXIuZ2V0RW5kKCk7XG4gICAgICBjb25zdCByZXBsYWNlbWVudCA9IGRlY2xhcmF0aW9uLmluaXRpYWxpemVyLnRleHQucmVwbGFjZShQUkVfUjNfTUFSS0VSLCBQT1NUX1IzX01BUktFUik7XG4gICAgICBvdXRwdXRUZXh0Lm92ZXJ3cml0ZShzdGFydCwgZW5kLCByZXBsYWNlbWVudCk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIHR5cGUgcGFyYW1ldGVycyB0byB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIGBNb2R1bGVXaXRoUHJvdmlkZXJzYFxuICAgKiBzdHJ1Y3R1cmVzLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgb25seSBnZXQgY2FsbGVkIG9uIHR5cGluZ3MgZmlsZXMuXG4gICAqL1xuICBhZGRNb2R1bGVXaXRoUHJvdmlkZXJzUGFyYW1zKFxuICAgICAgb3V0cHV0VGV4dDogTWFnaWNTdHJpbmcsIG1vZHVsZVdpdGhQcm92aWRlcnM6IE1vZHVsZVdpdGhQcm92aWRlcnNJbmZvW10sXG4gICAgICBpbXBvcnRNYW5hZ2VyOiBJbXBvcnRNYW5hZ2VyKTogdm9pZCB7XG4gICAgbW9kdWxlV2l0aFByb3ZpZGVycy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgY29uc3QgbmdNb2R1bGVOYW1lID0gaW5mby5uZ01vZHVsZS5ub2RlLm5hbWUudGV4dDtcbiAgICAgIGNvbnN0IGRlY2xhcmF0aW9uRmlsZSA9IGFic29sdXRlRnJvbVNvdXJjZUZpbGUoaW5mby5kZWNsYXJhdGlvbi5nZXRTb3VyY2VGaWxlKCkpO1xuICAgICAgY29uc3QgbmdNb2R1bGVGaWxlID0gYWJzb2x1dGVGcm9tU291cmNlRmlsZShpbmZvLm5nTW9kdWxlLm5vZGUuZ2V0U291cmNlRmlsZSgpKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlKGRpcm5hbWUoZGVjbGFyYXRpb25GaWxlKSwgbmdNb2R1bGVGaWxlKTtcbiAgICAgIGNvbnN0IHJlbGF0aXZlSW1wb3J0ID0gdG9SZWxhdGl2ZUltcG9ydChyZWxhdGl2ZVBhdGgpO1xuICAgICAgY29uc3QgaW1wb3J0UGF0aCA9IGluZm8ubmdNb2R1bGUub3duZWRCeU1vZHVsZUd1ZXNzIHx8XG4gICAgICAgICAgKGRlY2xhcmF0aW9uRmlsZSAhPT0gbmdNb2R1bGVGaWxlID8gc3RyaXBFeHRlbnNpb24ocmVsYXRpdmVJbXBvcnQpIDogbnVsbCk7XG4gICAgICBjb25zdCBuZ01vZHVsZSA9IGdlbmVyYXRlSW1wb3J0U3RyaW5nKGltcG9ydE1hbmFnZXIsIGltcG9ydFBhdGgsIG5nTW9kdWxlTmFtZSk7XG5cbiAgICAgIGlmIChpbmZvLmRlY2xhcmF0aW9uLnR5cGUpIHtcbiAgICAgICAgY29uc3QgdHlwZU5hbWUgPSBpbmZvLmRlY2xhcmF0aW9uLnR5cGUgJiYgdHMuaXNUeXBlUmVmZXJlbmNlTm9kZShpbmZvLmRlY2xhcmF0aW9uLnR5cGUpID9cbiAgICAgICAgICAgIGluZm8uZGVjbGFyYXRpb24udHlwZS50eXBlTmFtZSA6XG4gICAgICAgICAgICBudWxsO1xuICAgICAgICBpZiAodGhpcy5pc0NvcmVNb2R1bGVXaXRoUHJvdmlkZXJzVHlwZSh0eXBlTmFtZSkpIHtcbiAgICAgICAgICAvLyBUaGUgZGVjbGFyYXRpb24gYWxyZWFkeSByZXR1cm5zIGBNb2R1bGVXaXRoUHJvdmlkZXJgIGJ1dCBpdCBuZWVkcyB0aGUgYE5nTW9kdWxlYCB0eXBlXG4gICAgICAgICAgLy8gcGFyYW1ldGVyIGFkZGluZy5cbiAgICAgICAgICBvdXRwdXRUZXh0Lm92ZXJ3cml0ZShcbiAgICAgICAgICAgICAgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldFN0YXJ0KCksIGluZm8uZGVjbGFyYXRpb24udHlwZS5nZXRFbmQoKSxcbiAgICAgICAgICAgICAgYE1vZHVsZVdpdGhQcm92aWRlcnM8JHtuZ01vZHVsZX0+YCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGRlY2xhcmF0aW9uIHJldHVybnMgYW4gdW5rbm93biB0eXBlIHNvIHdlIG5lZWQgdG8gY29udmVydCBpdCB0byBhIHVuaW9uIHRoYXRcbiAgICAgICAgICAvLyBpbmNsdWRlcyB0aGUgbmdNb2R1bGUgcHJvcGVydHkuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxUeXBlU3RyaW5nID0gaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldFRleHQoKTtcbiAgICAgICAgICBvdXRwdXRUZXh0Lm92ZXJ3cml0ZShcbiAgICAgICAgICAgICAgaW5mby5kZWNsYXJhdGlvbi50eXBlLmdldFN0YXJ0KCksIGluZm8uZGVjbGFyYXRpb24udHlwZS5nZXRFbmQoKSxcbiAgICAgICAgICAgICAgYCgke29yaWdpbmFsVHlwZVN0cmluZ30pJntuZ01vZHVsZToke25nTW9kdWxlfX1gKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVGhlIGRlY2xhcmF0aW9uIGhhcyBubyByZXR1cm4gdHlwZSBzbyBwcm92aWRlIG9uZS5cbiAgICAgICAgY29uc3QgbGFzdFRva2VuID0gaW5mby5kZWNsYXJhdGlvbi5nZXRMYXN0VG9rZW4oKTtcbiAgICAgICAgY29uc3QgaW5zZXJ0UG9pbnQgPSBsYXN0VG9rZW4gJiYgbGFzdFRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW4gP1xuICAgICAgICAgICAgbGFzdFRva2VuLmdldFN0YXJ0KCkgOlxuICAgICAgICAgICAgaW5mby5kZWNsYXJhdGlvbi5nZXRFbmQoKTtcbiAgICAgICAgb3V0cHV0VGV4dC5hcHBlbmRMZWZ0KFxuICAgICAgICAgICAgaW5zZXJ0UG9pbnQsXG4gICAgICAgICAgICBgOiAke2dlbmVyYXRlSW1wb3J0U3RyaW5nKGltcG9ydE1hbmFnZXIsICdAYW5ndWxhci9jb3JlJywgJ01vZHVsZVdpdGhQcm92aWRlcnMnKX08JHtcbiAgICAgICAgICAgICAgICBuZ01vZHVsZX0+YCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBhIGBTdGF0ZW1lbnRgIHRvIEphdmFTY3JpcHQgY29kZSBpbiBhIGZvcm1hdCBzdWl0YWJsZSBmb3IgcmVuZGVyaW5nIGJ5IHRoaXMgZm9ybWF0dGVyLlxuICAgKlxuICAgKiBAcGFyYW0gc3RtdCBUaGUgYFN0YXRlbWVudGAgdG8gcHJpbnQuXG4gICAqIEBwYXJhbSBzb3VyY2VGaWxlIEEgYHRzLlNvdXJjZUZpbGVgIHRoYXQgcHJvdmlkZXMgY29udGV4dCBmb3IgdGhlIHN0YXRlbWVudC4gU2VlXG4gICAqICAgICBgdHMuUHJpbnRlciNwcmludE5vZGUoKWAgZm9yIG1vcmUgaW5mby5cbiAgICogQHBhcmFtIGltcG9ydE1hbmFnZXIgVGhlIGBJbXBvcnRNYW5hZ2VyYCB0byB1c2UgZm9yIG1hbmFnaW5nIGltcG9ydHMuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIEphdmFTY3JpcHQgY29kZSBjb3JyZXNwb25kaW5nIHRvIGBzdG10YCAoaW4gdGhlIGFwcHJvcHJpYXRlIGZvcm1hdCkuXG4gICAqL1xuICBwcmludFN0YXRlbWVudChzdG10OiBTdGF0ZW1lbnQsIHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUsIGltcG9ydE1hbmFnZXI6IEltcG9ydE1hbmFnZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IG5vZGUgPSB0cmFuc2xhdGVTdGF0ZW1lbnQoc3RtdCwgaW1wb3J0TWFuYWdlcik7XG4gICAgY29uc3QgY29kZSA9IHRoaXMucHJpbnRlci5wcmludE5vZGUodHMuRW1pdEhpbnQuVW5zcGVjaWZpZWQsIG5vZGUsIHNvdXJjZUZpbGUpO1xuXG4gICAgcmV0dXJuIGNvZGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgZmluZEVuZE9mSW1wb3J0cyhzZjogdHMuU291cmNlRmlsZSk6IG51bWJlciB7XG4gICAgZm9yIChjb25zdCBzdG10IG9mIHNmLnN0YXRlbWVudHMpIHtcbiAgICAgIGlmICghdHMuaXNJbXBvcnREZWNsYXJhdGlvbihzdG10KSAmJiAhdHMuaXNJbXBvcnRFcXVhbHNEZWNsYXJhdGlvbihzdG10KSAmJlxuICAgICAgICAgICF0cy5pc05hbWVzcGFjZUltcG9ydChzdG10KSkge1xuICAgICAgICByZXR1cm4gc3RtdC5nZXRTdGFydCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0eXBlIGlzIHRoZSBjb3JlIEFuZ3VsYXIgYE1vZHVsZVdpdGhQcm92aWRlcnNgIGludGVyZmFjZS5cbiAgICogQHBhcmFtIHR5cGVOYW1lIFRoZSB0eXBlIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSB0eXBlIGlzIHRoZSBjb3JlIEFuZ3VsYXIgYE1vZHVsZVdpdGhQcm92aWRlcnNgIGludGVyZmFjZS5cbiAgICovXG4gIHByaXZhdGUgaXNDb3JlTW9kdWxlV2l0aFByb3ZpZGVyc1R5cGUodHlwZU5hbWU6IHRzLkVudGl0eU5hbWV8bnVsbCkge1xuICAgIGNvbnN0IGlkID1cbiAgICAgICAgdHlwZU5hbWUgJiYgdHMuaXNJZGVudGlmaWVyKHR5cGVOYW1lKSA/IHRoaXMuaG9zdC5nZXRJbXBvcnRPZklkZW50aWZpZXIodHlwZU5hbWUpIDogbnVsbDtcbiAgICByZXR1cm4gKFxuICAgICAgICBpZCAmJiBpZC5uYW1lID09PSAnTW9kdWxlV2l0aFByb3ZpZGVycycgJiYgKHRoaXMuaXNDb3JlIHx8IGlkLmZyb20gPT09ICdAYW5ndWxhci9jb3JlJykpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZpbmRTdGF0ZW1lbnQobm9kZTogdHMuTm9kZSk6IHRzLlN0YXRlbWVudHx1bmRlZmluZWQge1xuICB3aGlsZSAobm9kZSkge1xuICAgIGlmICh0cy5pc0V4cHJlc3Npb25TdGF0ZW1lbnQobm9kZSkgfHwgdHMuaXNSZXR1cm5TdGF0ZW1lbnQobm9kZSkpIHtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH1cbiAgICBub2RlID0gbm9kZS5wYXJlbnQ7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVJbXBvcnRTdHJpbmcoXG4gICAgaW1wb3J0TWFuYWdlcjogSW1wb3J0TWFuYWdlciwgaW1wb3J0UGF0aDogc3RyaW5nfG51bGwsIGltcG9ydE5hbWU6IHN0cmluZykge1xuICBjb25zdCBpbXBvcnRBcyA9IGltcG9ydFBhdGggPyBpbXBvcnRNYW5hZ2VyLmdlbmVyYXRlTmFtZWRJbXBvcnQoaW1wb3J0UGF0aCwgaW1wb3J0TmFtZSkgOiBudWxsO1xuICByZXR1cm4gaW1wb3J0QXMgJiYgaW1wb3J0QXMubW9kdWxlSW1wb3J0ID8gYCR7aW1wb3J0QXMubW9kdWxlSW1wb3J0LnRleHR9LiR7aW1wb3J0QXMuc3ltYm9sfWAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aW1wb3J0TmFtZX1gO1xufVxuXG5mdW5jdGlvbiBnZXROZXh0U2libGluZ0luQXJyYXk8VCBleHRlbmRzIHRzLk5vZGU+KG5vZGU6IFQsIGFycmF5OiB0cy5Ob2RlQXJyYXk8VD4pOiBUfG51bGwge1xuICBjb25zdCBpbmRleCA9IGFycmF5LmluZGV4T2Yobm9kZSk7XG4gIHJldHVybiBpbmRleCAhPT0gLTEgJiYgYXJyYXkubGVuZ3RoID4gaW5kZXggKyAxID8gYXJyYXlbaW5kZXggKyAxXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldEVuZEV4Y2VwdFNlbWljb2xvbihzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IG51bWJlciB7XG4gIGNvbnN0IGxhc3RUb2tlbiA9IHN0YXRlbWVudC5nZXRMYXN0VG9rZW4oKTtcbiAgcmV0dXJuIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuU2VtaWNvbG9uVG9rZW4pID8gc3RhdGVtZW50LmdldEVuZCgpIC0gMSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlbWVudC5nZXRFbmQoKTtcbn1cbiJdfQ==