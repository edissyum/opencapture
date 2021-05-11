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
        define("@angular/compiler-cli/src/transformers/node_emitter", ["require", "exports", "tslib", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/translator", "@angular/compiler-cli/src/transformers/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodeEmitterVisitor = exports.updateSourceFile = exports.TypeScriptNodeEmitter = void 0;
    var tslib_1 = require("tslib");
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var translator_1 = require("@angular/compiler-cli/src/ngtsc/translator");
    var util_1 = require("@angular/compiler-cli/src/transformers/util");
    var METHOD_THIS_NAME = 'this';
    var CATCH_ERROR_NAME = 'error';
    var CATCH_STACK_NAME = 'stack';
    var _VALID_IDENTIFIER_RE = /^[$A-Z_][0-9A-Z_$]*$/i;
    var TypeScriptNodeEmitter = /** @class */ (function () {
        function TypeScriptNodeEmitter(annotateForClosureCompiler) {
            this.annotateForClosureCompiler = annotateForClosureCompiler;
        }
        TypeScriptNodeEmitter.prototype.updateSourceFile = function (sourceFile, stmts, preamble) {
            var converter = new NodeEmitterVisitor(this.annotateForClosureCompiler);
            // [].concat flattens the result so that each `visit...` method can also return an array of
            // stmts.
            var statements = [].concat.apply([], tslib_1.__spread(stmts.map(function (stmt) { return stmt.visitStatement(converter, null); }).filter(function (stmt) { return stmt != null; })));
            var sourceStatements = tslib_1.__spread(converter.getReexports(), converter.getImports(), statements);
            if (preamble) {
                // We always attach the preamble comment to a `NotEmittedStatement` node, because tsickle uses
                // this node type as a marker of the preamble to ensure that it adds its own new nodes after
                // the preamble.
                var preambleCommentHolder = ts.createNotEmittedStatement(sourceFile);
                // Preamble comments are passed through as-is, which means that they must already contain a
                // leading `*` if they should be a JSDOC comment.
                ts.addSyntheticLeadingComment(preambleCommentHolder, ts.SyntaxKind.MultiLineCommentTrivia, preamble, 
                /* hasTrailingNewline */ true);
                sourceStatements.unshift(preambleCommentHolder);
            }
            converter.updateSourceMap(sourceStatements);
            var newSourceFile = ts.updateSourceFileNode(sourceFile, sourceStatements);
            return [newSourceFile, converter.getNodeMap()];
        };
        return TypeScriptNodeEmitter;
    }());
    exports.TypeScriptNodeEmitter = TypeScriptNodeEmitter;
    /**
     * Update the given source file to include the changes specified in module.
     *
     * The module parameter is treated as a partial module meaning that the statements are added to
     * the module instead of replacing the module. Also, any classes are treated as partial classes
     * and the included members are added to the class with the same name instead of a new class
     * being created.
     */
    function updateSourceFile(sourceFile, module, annotateForClosureCompiler) {
        var converter = new NodeEmitterVisitor(annotateForClosureCompiler);
        converter.loadExportedVariableIdentifiers(sourceFile);
        var prefixStatements = module.statements.filter(function (statement) { return !(statement instanceof compiler_1.ClassStmt); });
        var classes = module.statements.filter(function (statement) { return statement instanceof compiler_1.ClassStmt; });
        var classMap = new Map(classes.map(function (classStatement) { return [classStatement.name, classStatement]; }));
        var classNames = new Set(classes.map(function (classStatement) { return classStatement.name; }));
        var prefix = prefixStatements.map(function (statement) { return statement.visitStatement(converter, sourceFile); });
        // Add static methods to all the classes referenced in module.
        var newStatements = sourceFile.statements.map(function (node) {
            if (node.kind == ts.SyntaxKind.ClassDeclaration) {
                var classDeclaration = node;
                var name = classDeclaration.name;
                if (name) {
                    var classStatement = classMap.get(name.text);
                    if (classStatement) {
                        classNames.delete(name.text);
                        var classMemberHolder = converter.visitDeclareClassStmt(classStatement);
                        var newMethods = classMemberHolder.members.filter(function (member) { return member.kind !== ts.SyntaxKind.Constructor; });
                        var newMembers = tslib_1.__spread(classDeclaration.members, newMethods);
                        return ts.updateClassDeclaration(classDeclaration, 
                        /* decorators */ classDeclaration.decorators, 
                        /* modifiers */ classDeclaration.modifiers, 
                        /* name */ classDeclaration.name, 
                        /* typeParameters */ classDeclaration.typeParameters, 
                        /* heritageClauses */ classDeclaration.heritageClauses || [], 
                        /* members */ newMembers);
                    }
                }
            }
            return node;
        });
        // Validate that all the classes have been generated
        classNames.size == 0 ||
            util_1.error((classNames.size == 1 ? 'Class' : 'Classes') + " \"" + Array.from(classNames.keys()).join(', ') + "\" not generated");
        // Add imports to the module required by the new methods
        var imports = converter.getImports();
        if (imports && imports.length) {
            // Find where the new imports should go
            var index = firstAfter(newStatements, function (statement) { return statement.kind === ts.SyntaxKind.ImportDeclaration ||
                statement.kind === ts.SyntaxKind.ImportEqualsDeclaration; });
            newStatements = tslib_1.__spread(newStatements.slice(0, index), imports, prefix, newStatements.slice(index));
        }
        else {
            newStatements = tslib_1.__spread(prefix, newStatements);
        }
        converter.updateSourceMap(newStatements);
        var newSourceFile = ts.updateSourceFileNode(sourceFile, newStatements);
        return [newSourceFile, converter.getNodeMap()];
    }
    exports.updateSourceFile = updateSourceFile;
    // Return the index after the first value in `a` that doesn't match the predicate after a value that
    // does or 0 if no values match.
    function firstAfter(a, predicate) {
        var index = 0;
        var len = a.length;
        for (; index < len; index++) {
            var value = a[index];
            if (predicate(value))
                break;
        }
        if (index >= len)
            return 0;
        for (; index < len; index++) {
            var value = a[index];
            if (!predicate(value))
                break;
        }
        return index;
    }
    function escapeLiteral(value) {
        return value.replace(/(\"|\\)/g, '\\$1').replace(/(\n)|(\r)/g, function (v, n, r) {
            return n ? '\\n' : '\\r';
        });
    }
    function createLiteral(value) {
        if (value === null) {
            return ts.createNull();
        }
        else if (value === undefined) {
            return ts.createIdentifier('undefined');
        }
        else {
            var result = ts.createLiteral(value);
            if (ts.isStringLiteral(result) && result.text.indexOf('\\') >= 0) {
                // Hack to avoid problems cause indirectly by:
                //    https://github.com/Microsoft/TypeScript/issues/20192
                // This avoids the string escaping normally performed for a string relying on that
                // TypeScript just emits the text raw for a numeric literal.
                result.kind = ts.SyntaxKind.NumericLiteral;
                result.text = "\"" + escapeLiteral(result.text) + "\"";
            }
            return result;
        }
    }
    function isExportTypeStatement(statement) {
        return !!statement.modifiers &&
            statement.modifiers.some(function (mod) { return mod.kind === ts.SyntaxKind.ExportKeyword; });
    }
    /**
     * Visits an output ast and produces the corresponding TypeScript synthetic nodes.
     */
    var NodeEmitterVisitor = /** @class */ (function () {
        function NodeEmitterVisitor(annotateForClosureCompiler) {
            this.annotateForClosureCompiler = annotateForClosureCompiler;
            this._nodeMap = new Map();
            this._importsWithPrefixes = new Map();
            this._reexports = new Map();
            this._templateSources = new Map();
            this._exportedVariableIdentifiers = new Map();
        }
        /**
         * Process the source file and collect exported identifiers that refer to variables.
         *
         * Only variables are collected because exported classes still exist in the module scope in
         * CommonJS, whereas variables have their declarations moved onto the `exports` object, and all
         * references are updated accordingly.
         */
        NodeEmitterVisitor.prototype.loadExportedVariableIdentifiers = function (sourceFile) {
            var _this = this;
            sourceFile.statements.forEach(function (statement) {
                if (ts.isVariableStatement(statement) && isExportTypeStatement(statement)) {
                    statement.declarationList.declarations.forEach(function (declaration) {
                        if (ts.isIdentifier(declaration.name)) {
                            _this._exportedVariableIdentifiers.set(declaration.name.text, declaration.name);
                        }
                    });
                }
            });
        };
        NodeEmitterVisitor.prototype.getReexports = function () {
            return Array.from(this._reexports.entries())
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), exportedFilePath = _b[0], reexports = _b[1];
                return ts.createExportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, ts.createNamedExports(reexports.map(function (_a) {
                    var name = _a.name, as = _a.as;
                    return ts.createExportSpecifier(name, as);
                })), 
                /* moduleSpecifier */ createLiteral(exportedFilePath));
            });
        };
        NodeEmitterVisitor.prototype.getImports = function () {
            return Array.from(this._importsWithPrefixes.entries())
                .map(function (_a) {
                var _b = tslib_1.__read(_a, 2), namespace = _b[0], prefix = _b[1];
                return ts.createImportDeclaration(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* importClause */
                ts.createImportClause(
                /* name */ undefined, ts.createNamespaceImport(ts.createIdentifier(prefix))), 
                /* moduleSpecifier */ createLiteral(namespace));
            });
        };
        NodeEmitterVisitor.prototype.getNodeMap = function () {
            return this._nodeMap;
        };
        NodeEmitterVisitor.prototype.updateSourceMap = function (statements) {
            var _this = this;
            var lastRangeStartNode = undefined;
            var lastRangeEndNode = undefined;
            var lastRange = undefined;
            var recordLastSourceRange = function () {
                if (lastRange && lastRangeStartNode && lastRangeEndNode) {
                    if (lastRangeStartNode == lastRangeEndNode) {
                        ts.setSourceMapRange(lastRangeEndNode, lastRange);
                    }
                    else {
                        ts.setSourceMapRange(lastRangeStartNode, lastRange);
                        // Only emit the pos for the first node emitted in the range.
                        ts.setEmitFlags(lastRangeStartNode, ts.EmitFlags.NoTrailingSourceMap);
                        ts.setSourceMapRange(lastRangeEndNode, lastRange);
                        // Only emit emit end for the last node emitted in the range.
                        ts.setEmitFlags(lastRangeEndNode, ts.EmitFlags.NoLeadingSourceMap);
                    }
                }
            };
            var visitNode = function (tsNode) {
                var ngNode = _this._nodeMap.get(tsNode);
                if (ngNode) {
                    var range = _this.sourceRangeOf(ngNode);
                    if (range) {
                        if (!lastRange || range.source != lastRange.source || range.pos != lastRange.pos ||
                            range.end != lastRange.end) {
                            recordLastSourceRange();
                            lastRangeStartNode = tsNode;
                            lastRange = range;
                        }
                        lastRangeEndNode = tsNode;
                    }
                }
                ts.forEachChild(tsNode, visitNode);
            };
            statements.forEach(visitNode);
            recordLastSourceRange();
        };
        NodeEmitterVisitor.prototype.postProcess = function (ngNode, tsNode) {
            if (tsNode && !this._nodeMap.has(tsNode)) {
                this._nodeMap.set(tsNode, ngNode);
            }
            if (tsNode !== null && ngNode instanceof compiler_1.Statement && ngNode.leadingComments !== undefined) {
                translator_1.attachComments(tsNode, ngNode.leadingComments);
            }
            return tsNode;
        };
        NodeEmitterVisitor.prototype.sourceRangeOf = function (node) {
            if (node.sourceSpan) {
                var span = node.sourceSpan;
                if (span.start.file == span.end.file) {
                    var file = span.start.file;
                    if (file.url) {
                        var source = this._templateSources.get(file);
                        if (!source) {
                            source = ts.createSourceMapSource(file.url, file.content, function (pos) { return pos; });
                            this._templateSources.set(file, source);
                        }
                        return { pos: span.start.offset, end: span.end.offset, source: source };
                    }
                }
            }
            return null;
        };
        NodeEmitterVisitor.prototype.getModifiers = function (stmt) {
            var modifiers = [];
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported)) {
                modifiers.push(ts.createToken(ts.SyntaxKind.ExportKeyword));
            }
            return modifiers;
        };
        // StatementVisitor
        NodeEmitterVisitor.prototype.visitDeclareVarStmt = function (stmt) {
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported) && stmt.value instanceof compiler_1.ExternalExpr &&
                !stmt.type) {
                // check for a reexport
                var _a = stmt.value.value, name = _a.name, moduleName = _a.moduleName;
                if (moduleName) {
                    var reexports = this._reexports.get(moduleName);
                    if (!reexports) {
                        reexports = [];
                        this._reexports.set(moduleName, reexports);
                    }
                    reexports.push({ name: name, as: stmt.name });
                    return null;
                }
            }
            var varDeclList = ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier(stmt.name), 
                /* type */ undefined, (stmt.value && stmt.value.visitExpression(this, null)) || undefined)]);
            if (stmt.hasModifier(compiler_1.StmtModifier.Exported)) {
                // Note: We need to add an explicit variable and export declaration so that
                // the variable can be referred in the same file as well.
                var tsVarStmt = this.postProcess(stmt, ts.createVariableStatement(/* modifiers */ [], varDeclList));
                var exportStmt = this.postProcess(stmt, ts.createExportDeclaration(
                /*decorators*/ undefined, /*modifiers*/ undefined, ts.createNamedExports([ts.createExportSpecifier(stmt.name, stmt.name)])));
                return [tsVarStmt, exportStmt];
            }
            return this.postProcess(stmt, ts.createVariableStatement(this.getModifiers(stmt), varDeclList));
        };
        NodeEmitterVisitor.prototype.visitDeclareFunctionStmt = function (stmt) {
            return this.postProcess(stmt, ts.createFunctionDeclaration(
            /* decorators */ undefined, this.getModifiers(stmt), 
            /* asteriskToken */ undefined, stmt.name, /* typeParameters */ undefined, stmt.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, this._visitStatements(stmt.statements)));
        };
        NodeEmitterVisitor.prototype.visitExpressionStmt = function (stmt) {
            return this.postProcess(stmt, ts.createStatement(stmt.expr.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitReturnStmt = function (stmt) {
            return this.postProcess(stmt, ts.createReturn(stmt.value ? stmt.value.visitExpression(this, null) : undefined));
        };
        NodeEmitterVisitor.prototype.visitDeclareClassStmt = function (stmt) {
            var _this = this;
            var modifiers = this.getModifiers(stmt);
            var fields = stmt.fields.map(function (field) {
                var property = ts.createProperty(
                /* decorators */ undefined, /* modifiers */ translateModifiers(field.modifiers), field.name, 
                /* questionToken */ undefined, 
                /* type */ undefined, field.initializer == null ? ts.createNull() :
                    field.initializer.visitExpression(_this, null));
                if (_this.annotateForClosureCompiler) {
                    // Closure compiler transforms the form `Service.ɵprov = X` into `Service$ɵprov = X`. To
                    // prevent this transformation, such assignments need to be annotated with @nocollapse.
                    // Note that tsickle is typically responsible for adding such annotations, however it
                    // doesn't yet handle synthetic fields added during other transformations.
                    ts.addSyntheticLeadingComment(property, ts.SyntaxKind.MultiLineCommentTrivia, '* @nocollapse ', 
                    /* hasTrailingNewLine */ false);
                }
                return property;
            });
            var getters = stmt.getters.map(function (getter) { return ts.createGetAccessor(
            /* decorators */ undefined, /* modifiers */ undefined, getter.name, /* parameters */ [], 
            /* type */ undefined, _this._visitStatements(getter.body)); });
            var constructor = (stmt.constructorMethod && [ts.createConstructor(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* parameters */
                stmt.constructorMethod.params.map(function (p) { return ts.createParameter(
                /* decorators */ undefined, 
                /* modifiers */ undefined, 
                /* dotDotDotToken */ undefined, p.name); }), this._visitStatements(stmt.constructorMethod.body))]) ||
                [];
            // TODO {chuckj}: Determine what should be done for a method with a null name.
            var methods = stmt.methods.filter(function (method) { return method.name; })
                .map(function (method) { return ts.createMethod(
            /* decorators */ undefined, 
            /* modifiers */ translateModifiers(method.modifiers), 
            /* astriskToken */ undefined, method.name /* guarded by filter */, 
            /* questionToken */ undefined, /* typeParameters */ undefined, method.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, _this._visitStatements(method.body)); });
            return this.postProcess(stmt, ts.createClassDeclaration(
            /* decorators */ undefined, modifiers, stmt.name, /* typeParameters*/ undefined, stmt.parent &&
                [ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [stmt.parent.visitExpression(this, null)])] ||
                [], tslib_1.__spread(fields, getters, constructor, methods)));
        };
        NodeEmitterVisitor.prototype.visitIfStmt = function (stmt) {
            return this.postProcess(stmt, ts.createIf(stmt.condition.visitExpression(this, null), this._visitStatements(stmt.trueCase), stmt.falseCase && stmt.falseCase.length && this._visitStatements(stmt.falseCase) ||
                undefined));
        };
        NodeEmitterVisitor.prototype.visitTryCatchStmt = function (stmt) {
            return this.postProcess(stmt, ts.createTry(this._visitStatements(stmt.bodyStmts), ts.createCatchClause(CATCH_ERROR_NAME, this._visitStatementsPrefix([ts.createVariableStatement(
                /* modifiers */ undefined, [ts.createVariableDeclaration(CATCH_STACK_NAME, /* type */ undefined, ts.createPropertyAccess(ts.createIdentifier(CATCH_ERROR_NAME), ts.createIdentifier(CATCH_STACK_NAME)))])], stmt.catchStmts)), 
            /* finallyBlock */ undefined));
        };
        NodeEmitterVisitor.prototype.visitThrowStmt = function (stmt) {
            return this.postProcess(stmt, ts.createThrow(stmt.error.visitExpression(this, null)));
        };
        // ExpressionVisitor
        NodeEmitterVisitor.prototype.visitWrappedNodeExpr = function (expr) {
            return this.postProcess(expr, expr.node);
        };
        NodeEmitterVisitor.prototype.visitTypeofExpr = function (expr) {
            var typeOf = ts.createTypeOf(expr.expr.visitExpression(this, null));
            return this.postProcess(expr, typeOf);
        };
        // ExpressionVisitor
        NodeEmitterVisitor.prototype.visitReadVarExpr = function (expr) {
            switch (expr.builtin) {
                case compiler_1.BuiltinVar.This:
                    return this.postProcess(expr, ts.createIdentifier(METHOD_THIS_NAME));
                case compiler_1.BuiltinVar.CatchError:
                    return this.postProcess(expr, ts.createIdentifier(CATCH_ERROR_NAME));
                case compiler_1.BuiltinVar.CatchStack:
                    return this.postProcess(expr, ts.createIdentifier(CATCH_STACK_NAME));
                case compiler_1.BuiltinVar.Super:
                    return this.postProcess(expr, ts.createSuper());
            }
            if (expr.name) {
                return this.postProcess(expr, ts.createIdentifier(expr.name));
            }
            throw Error("Unexpected ReadVarExpr form");
        };
        NodeEmitterVisitor.prototype.visitWriteVarExpr = function (expr) {
            return this.postProcess(expr, ts.createAssignment(ts.createIdentifier(expr.name), expr.value.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitWriteKeyExpr = function (expr) {
            return this.postProcess(expr, ts.createAssignment(ts.createElementAccess(expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)), expr.value.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitWritePropExpr = function (expr) {
            return this.postProcess(expr, ts.createAssignment(ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name), expr.value.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitInvokeMethodExpr = function (expr) {
            var _this = this;
            var methodName = getMethodName(expr);
            return this.postProcess(expr, ts.createCall(ts.createPropertyAccess(expr.receiver.visitExpression(this, null), methodName), 
            /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        NodeEmitterVisitor.prototype.visitInvokeFunctionExpr = function (expr) {
            var _this = this;
            return this.postProcess(expr, ts.createCall(expr.fn.visitExpression(this, null), /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        NodeEmitterVisitor.prototype.visitTaggedTemplateExpr = function (expr) {
            throw new Error('tagged templates are not supported in pre-ivy mode.');
        };
        NodeEmitterVisitor.prototype.visitInstantiateExpr = function (expr) {
            var _this = this;
            return this.postProcess(expr, ts.createNew(expr.classExpr.visitExpression(this, null), /* typeArguments */ undefined, expr.args.map(function (arg) { return arg.visitExpression(_this, null); })));
        };
        NodeEmitterVisitor.prototype.visitLiteralExpr = function (expr) {
            return this.postProcess(expr, createLiteral(expr.value));
        };
        NodeEmitterVisitor.prototype.visitLocalizedString = function (expr, context) {
            throw new Error('localized strings are not supported in pre-ivy mode.');
        };
        NodeEmitterVisitor.prototype.visitExternalExpr = function (expr) {
            return this.postProcess(expr, this._visitIdentifier(expr.value));
        };
        NodeEmitterVisitor.prototype.visitConditionalExpr = function (expr) {
            // TODO {chuckj}: Review use of ! on falseCase. Should it be non-nullable?
            return this.postProcess(expr, ts.createParen(ts.createConditional(expr.condition.visitExpression(this, null), expr.trueCase.visitExpression(this, null), expr.falseCase.visitExpression(this, null))));
        };
        NodeEmitterVisitor.prototype.visitNotExpr = function (expr) {
            return this.postProcess(expr, ts.createPrefix(ts.SyntaxKind.ExclamationToken, expr.condition.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitAssertNotNullExpr = function (expr) {
            return expr.condition.visitExpression(this, null);
        };
        NodeEmitterVisitor.prototype.visitCastExpr = function (expr) {
            return expr.value.visitExpression(this, null);
        };
        NodeEmitterVisitor.prototype.visitFunctionExpr = function (expr) {
            return this.postProcess(expr, ts.createFunctionExpression(
            /* modifiers */ undefined, /* astriskToken */ undefined, 
            /* name */ expr.name || undefined, 
            /* typeParameters */ undefined, expr.params.map(function (p) { return ts.createParameter(
            /* decorators */ undefined, /* modifiers */ undefined, 
            /* dotDotDotToken */ undefined, p.name); }), 
            /* type */ undefined, this._visitStatements(expr.statements)));
        };
        NodeEmitterVisitor.prototype.visitUnaryOperatorExpr = function (expr) {
            var unaryOperator;
            switch (expr.operator) {
                case compiler_1.UnaryOperator.Minus:
                    unaryOperator = ts.SyntaxKind.MinusToken;
                    break;
                case compiler_1.UnaryOperator.Plus:
                    unaryOperator = ts.SyntaxKind.PlusToken;
                    break;
                default:
                    throw new Error("Unknown operator: " + expr.operator);
            }
            var binary = ts.createPrefix(unaryOperator, expr.expr.visitExpression(this, null));
            return this.postProcess(expr, expr.parens ? ts.createParen(binary) : binary);
        };
        NodeEmitterVisitor.prototype.visitBinaryOperatorExpr = function (expr) {
            var binaryOperator;
            switch (expr.operator) {
                case compiler_1.BinaryOperator.And:
                    binaryOperator = ts.SyntaxKind.AmpersandAmpersandToken;
                    break;
                case compiler_1.BinaryOperator.BitwiseAnd:
                    binaryOperator = ts.SyntaxKind.AmpersandToken;
                    break;
                case compiler_1.BinaryOperator.Bigger:
                    binaryOperator = ts.SyntaxKind.GreaterThanToken;
                    break;
                case compiler_1.BinaryOperator.BiggerEquals:
                    binaryOperator = ts.SyntaxKind.GreaterThanEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Divide:
                    binaryOperator = ts.SyntaxKind.SlashToken;
                    break;
                case compiler_1.BinaryOperator.Equals:
                    binaryOperator = ts.SyntaxKind.EqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Identical:
                    binaryOperator = ts.SyntaxKind.EqualsEqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Lower:
                    binaryOperator = ts.SyntaxKind.LessThanToken;
                    break;
                case compiler_1.BinaryOperator.LowerEquals:
                    binaryOperator = ts.SyntaxKind.LessThanEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Minus:
                    binaryOperator = ts.SyntaxKind.MinusToken;
                    break;
                case compiler_1.BinaryOperator.Modulo:
                    binaryOperator = ts.SyntaxKind.PercentToken;
                    break;
                case compiler_1.BinaryOperator.Multiply:
                    binaryOperator = ts.SyntaxKind.AsteriskToken;
                    break;
                case compiler_1.BinaryOperator.NotEquals:
                    binaryOperator = ts.SyntaxKind.ExclamationEqualsToken;
                    break;
                case compiler_1.BinaryOperator.NotIdentical:
                    binaryOperator = ts.SyntaxKind.ExclamationEqualsEqualsToken;
                    break;
                case compiler_1.BinaryOperator.Or:
                    binaryOperator = ts.SyntaxKind.BarBarToken;
                    break;
                case compiler_1.BinaryOperator.Plus:
                    binaryOperator = ts.SyntaxKind.PlusToken;
                    break;
                default:
                    throw new Error("Unknown operator: " + expr.operator);
            }
            var binary = ts.createBinary(expr.lhs.visitExpression(this, null), binaryOperator, expr.rhs.visitExpression(this, null));
            return this.postProcess(expr, expr.parens ? ts.createParen(binary) : binary);
        };
        NodeEmitterVisitor.prototype.visitReadPropExpr = function (expr) {
            return this.postProcess(expr, ts.createPropertyAccess(expr.receiver.visitExpression(this, null), expr.name));
        };
        NodeEmitterVisitor.prototype.visitReadKeyExpr = function (expr) {
            return this.postProcess(expr, ts.createElementAccess(expr.receiver.visitExpression(this, null), expr.index.visitExpression(this, null)));
        };
        NodeEmitterVisitor.prototype.visitLiteralArrayExpr = function (expr) {
            var _this = this;
            return this.postProcess(expr, ts.createArrayLiteral(expr.entries.map(function (entry) { return entry.visitExpression(_this, null); })));
        };
        NodeEmitterVisitor.prototype.visitLiteralMapExpr = function (expr) {
            var _this = this;
            return this.postProcess(expr, ts.createObjectLiteral(expr.entries.map(function (entry) { return ts.createPropertyAssignment(entry.quoted || !_VALID_IDENTIFIER_RE.test(entry.key) ?
                ts.createLiteral(entry.key) :
                entry.key, entry.value.visitExpression(_this, null)); })));
        };
        NodeEmitterVisitor.prototype.visitCommaExpr = function (expr) {
            var _this = this;
            return this.postProcess(expr, expr.parts.map(function (e) { return e.visitExpression(_this, null); })
                .reduce(function (left, right) {
                return left ? ts.createBinary(left, ts.SyntaxKind.CommaToken, right) : right;
            }, null));
        };
        NodeEmitterVisitor.prototype._visitStatements = function (statements) {
            return this._visitStatementsPrefix([], statements);
        };
        NodeEmitterVisitor.prototype._visitStatementsPrefix = function (prefix, statements) {
            var _this = this;
            return ts.createBlock(tslib_1.__spread(prefix, statements.map(function (stmt) { return stmt.visitStatement(_this, null); }).filter(function (f) { return f != null; })));
        };
        NodeEmitterVisitor.prototype._visitIdentifier = function (value) {
            // name can only be null during JIT which never executes this code.
            var moduleName = value.moduleName, name = value.name;
            var prefixIdent = null;
            if (moduleName) {
                var prefix = this._importsWithPrefixes.get(moduleName);
                if (prefix == null) {
                    prefix = "i" + this._importsWithPrefixes.size;
                    this._importsWithPrefixes.set(moduleName, prefix);
                }
                prefixIdent = ts.createIdentifier(prefix);
            }
            if (prefixIdent) {
                return ts.createPropertyAccess(prefixIdent, name);
            }
            else {
                var id = ts.createIdentifier(name);
                if (this._exportedVariableIdentifiers.has(name)) {
                    // In order for this new identifier node to be properly rewritten in CommonJS output,
                    // it must have its original node set to a parsed instance of the same identifier.
                    ts.setOriginalNode(id, this._exportedVariableIdentifiers.get(name));
                }
                return id;
            }
        };
        return NodeEmitterVisitor;
    }());
    exports.NodeEmitterVisitor = NodeEmitterVisitor;
    function getMethodName(methodRef) {
        if (methodRef.name) {
            return methodRef.name;
        }
        else {
            switch (methodRef.builtin) {
                case compiler_1.BuiltinMethod.Bind:
                    return 'bind';
                case compiler_1.BuiltinMethod.ConcatArray:
                    return 'concat';
                case compiler_1.BuiltinMethod.SubscribeObservable:
                    return 'subscribe';
            }
        }
        throw new Error('Unexpected method reference form');
    }
    function modifierFromModifier(modifier) {
        switch (modifier) {
            case compiler_1.StmtModifier.Exported:
                return ts.createToken(ts.SyntaxKind.ExportKeyword);
            case compiler_1.StmtModifier.Final:
                return ts.createToken(ts.SyntaxKind.ConstKeyword);
            case compiler_1.StmtModifier.Private:
                return ts.createToken(ts.SyntaxKind.PrivateKeyword);
            case compiler_1.StmtModifier.Static:
                return ts.createToken(ts.SyntaxKind.StaticKeyword);
        }
    }
    function translateModifiers(modifiers) {
        return modifiers == null ? undefined : modifiers.map(modifierFromModifier);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9lbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy90cmFuc2Zvcm1lcnMvbm9kZV9lbWl0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw4Q0FBZ3ZCO0lBQ2h2QiwrQkFBaUM7SUFFakMseUVBQW1EO0lBQ25ELG9FQUE2QjtJQU03QixJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQztJQUNoQyxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUNqQyxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQztJQUNqQyxJQUFNLG9CQUFvQixHQUFHLHVCQUF1QixDQUFDO0lBRXJEO1FBQ0UsK0JBQW9CLDBCQUFtQztZQUFuQywrQkFBMEIsR0FBMUIsMEJBQTBCLENBQVM7UUFBRyxDQUFDO1FBRTNELGdEQUFnQixHQUFoQixVQUFpQixVQUF5QixFQUFFLEtBQWtCLEVBQUUsUUFBaUI7WUFFL0UsSUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUMxRSwyRkFBMkY7WUFDM0YsU0FBUztZQUNULElBQU0sVUFBVSxHQUFVLEVBQUUsQ0FBQyxNQUFNLE9BQVQsRUFBRSxtQkFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFwQyxDQUFvQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxJQUFJLElBQUksRUFBWixDQUFZLENBQUMsRUFBQyxDQUFDO1lBQzdGLElBQU0sZ0JBQWdCLG9CQUNkLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBSyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUssVUFBVSxDQUFDLENB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c2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Fzc2VydE5vdE51bGwsIEJpbmFyeU9wZXJhdG9yLCBCaW5hcnlPcGVyYXRvckV4cHIsIEJ1aWx0aW5NZXRob2QsIEJ1aWx0aW5WYXIsIENhc3RFeHByLCBDbGFzc1N0bXQsIENvbW1hRXhwciwgQ29uZGl0aW9uYWxFeHByLCBEZWNsYXJlRnVuY3Rpb25TdG10LCBEZWNsYXJlVmFyU3RtdCwgRXhwcmVzc2lvblN0YXRlbWVudCwgRXhwcmVzc2lvblZpc2l0b3IsIEV4dGVybmFsRXhwciwgRXh0ZXJuYWxSZWZlcmVuY2UsIEZ1bmN0aW9uRXhwciwgSWZTdG10LCBJbnN0YW50aWF0ZUV4cHIsIEludm9rZUZ1bmN0aW9uRXhwciwgSW52b2tlTWV0aG9kRXhwciwgTGVhZGluZ0NvbW1lbnQsIGxlYWRpbmdDb21tZW50LCBMaXRlcmFsQXJyYXlFeHByLCBMaXRlcmFsRXhwciwgTGl0ZXJhbE1hcEV4cHIsIExvY2FsaXplZFN0cmluZywgTm90RXhwciwgUGFyc2VTb3VyY2VGaWxlLCBQYXJzZVNvdXJjZVNwYW4sIFBhcnRpYWxNb2R1bGUsIFJlYWRLZXlFeHByLCBSZWFkUHJvcEV4cHIsIFJlYWRWYXJFeHByLCBSZXR1cm5TdGF0ZW1lbnQsIFN0YXRlbWVudCwgU3RhdGVtZW50VmlzaXRvciwgU3RtdE1vZGlmaWVyLCBUYWdnZWRUZW1wbGF0ZUV4cHIsIFRocm93U3RtdCwgVHJ5Q2F0Y2hTdG10LCBUeXBlb2ZFeHByLCBVbmFyeU9wZXJhdG9yLCBVbmFyeU9wZXJhdG9yRXhwciwgV3JhcHBlZE5vZGVFeHByLCBXcml0ZUtleUV4cHIsIFdyaXRlUHJvcEV4cHIsIFdyaXRlVmFyRXhwcn0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7YXR0YWNoQ29tbWVudHN9IGZyb20gJy4uL25ndHNjL3RyYW5zbGF0b3InO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBOb2RlIHtcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGw7XG59XG5cbmNvbnN0IE1FVEhPRF9USElTX05BTUUgPSAndGhpcyc7XG5jb25zdCBDQVRDSF9FUlJPUl9OQU1FID0gJ2Vycm9yJztcbmNvbnN0IENBVENIX1NUQUNLX05BTUUgPSAnc3RhY2snO1xuY29uc3QgX1ZBTElEX0lERU5USUZJRVJfUkUgPSAvXlskQS1aX11bMC05QS1aXyRdKiQvaTtcblxuZXhwb3J0IGNsYXNzIFR5cGVTY3JpcHROb2RlRW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXI6IGJvb2xlYW4pIHt9XG5cbiAgdXBkYXRlU291cmNlRmlsZShzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlLCBzdG10czogU3RhdGVtZW50W10sIHByZWFtYmxlPzogc3RyaW5nKTpcbiAgICAgIFt0cy5Tb3VyY2VGaWxlLCBNYXA8dHMuTm9kZSwgTm9kZT5dIHtcbiAgICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgTm9kZUVtaXR0ZXJWaXNpdG9yKHRoaXMuYW5ub3RhdGVGb3JDbG9zdXJlQ29tcGlsZXIpO1xuICAgIC8vIFtdLmNvbmNhdCBmbGF0dGVucyB0aGUgcmVzdWx0IHNvIHRoYXQgZWFjaCBgdmlzaXQuLi5gIG1ldGhvZCBjYW4gYWxzbyByZXR1cm4gYW4gYXJyYXkgb2ZcbiAgICAvLyBzdG10cy5cbiAgICBjb25zdCBzdGF0ZW1lbnRzOiBhbnlbXSA9IFtdLmNvbmNhdChcbiAgICAgICAgLi4uc3RtdHMubWFwKHN0bXQgPT4gc3RtdC52aXNpdFN0YXRlbWVudChjb252ZXJ0ZXIsIG51bGwpKS5maWx0ZXIoc3RtdCA9PiBzdG10ICE9IG51bGwpKTtcbiAgICBjb25zdCBzb3VyY2VTdGF0ZW1lbnRzID1cbiAgICAgICAgWy4uLmNvbnZlcnRlci5nZXRSZWV4cG9ydHMoKSwgLi4uY29udmVydGVyLmdldEltcG9ydHMoKSwgLi4uc3RhdGVtZW50c107XG4gICAgaWYgKHByZWFtYmxlKSB7XG4gICAgICAvLyBXZSBhbHdheXMgYXR0YWNoIHRoZSBwcmVhbWJsZSBjb21tZW50IHRvIGEgYE5vdEVtaXR0ZWRTdGF0ZW1lbnRgIG5vZGUsIGJlY2F1c2UgdHNpY2tsZSB1c2VzXG4gICAgICAvLyB0aGlzIG5vZGUgdHlwZSBhcyBhIG1hcmtlciBvZiB0aGUgcHJlYW1ibGUgdG8gZW5zdXJlIHRoYXQgaXQgYWRkcyBpdHMgb3duIG5ldyBub2RlcyBhZnRlclxuICAgICAgLy8gdGhlIHByZWFtYmxlLlxuICAgICAgY29uc3QgcHJlYW1ibGVDb21tZW50SG9sZGVyID0gdHMuY3JlYXRlTm90RW1pdHRlZFN0YXRlbWVudChzb3VyY2VGaWxlKTtcbiAgICAgIC8vIFByZWFtYmxlIGNvbW1lbnRzIGFyZSBwYXNzZWQgdGhyb3VnaCBhcy1pcywgd2hpY2ggbWVhbnMgdGhhdCB0aGV5IG11c3QgYWxyZWFkeSBjb250YWluIGFcbiAgICAgIC8vIGxlYWRpbmcgYCpgIGlmIHRoZXkgc2hvdWxkIGJlIGEgSlNET0MgY29tbWVudC5cbiAgICAgIHRzLmFkZFN5bnRoZXRpY0xlYWRpbmdDb21tZW50KFxuICAgICAgICAgIHByZWFtYmxlQ29tbWVudEhvbGRlciwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCBwcmVhbWJsZSxcbiAgICAgICAgICAvKiBoYXNUcmFpbGluZ05ld2xpbmUgKi8gdHJ1ZSk7XG4gICAgICBzb3VyY2VTdGF0ZW1lbnRzLnVuc2hpZnQocHJlYW1ibGVDb21tZW50SG9sZGVyKTtcbiAgICB9XG5cbiAgICBjb252ZXJ0ZXIudXBkYXRlU291cmNlTWFwKHNvdXJjZVN0YXRlbWVudHMpO1xuICAgIGNvbnN0IG5ld1NvdXJjZUZpbGUgPSB0cy51cGRhdGVTb3VyY2VGaWxlTm9kZShzb3VyY2VGaWxlLCBzb3VyY2VTdGF0ZW1lbnRzKTtcbiAgICByZXR1cm4gW25ld1NvdXJjZUZpbGUsIGNvbnZlcnRlci5nZXROb2RlTWFwKCldO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBnaXZlbiBzb3VyY2UgZmlsZSB0byBpbmNsdWRlIHRoZSBjaGFuZ2VzIHNwZWNpZmllZCBpbiBtb2R1bGUuXG4gKlxuICogVGhlIG1vZHVsZSBwYXJhbWV0ZXIgaXMgdHJlYXRlZCBhcyBhIHBhcnRpYWwgbW9kdWxlIG1lYW5pbmcgdGhhdCB0aGUgc3RhdGVtZW50cyBhcmUgYWRkZWQgdG9cbiAqIHRoZSBtb2R1bGUgaW5zdGVhZCBvZiByZXBsYWNpbmcgdGhlIG1vZHVsZS4gQWxzbywgYW55IGNsYXNzZXMgYXJlIHRyZWF0ZWQgYXMgcGFydGlhbCBjbGFzc2VzXG4gKiBhbmQgdGhlIGluY2x1ZGVkIG1lbWJlcnMgYXJlIGFkZGVkIHRvIHRoZSBjbGFzcyB3aXRoIHRoZSBzYW1lIG5hbWUgaW5zdGVhZCBvZiBhIG5ldyBjbGFzc1xuICogYmVpbmcgY3JlYXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNvdXJjZUZpbGUoXG4gICAgc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgbW9kdWxlOiBQYXJ0aWFsTW9kdWxlLFxuICAgIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuKTogW3RzLlNvdXJjZUZpbGUsIE1hcDx0cy5Ob2RlLCBOb2RlPl0ge1xuICBjb25zdCBjb252ZXJ0ZXIgPSBuZXcgTm9kZUVtaXR0ZXJWaXNpdG9yKGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyKTtcbiAgY29udmVydGVyLmxvYWRFeHBvcnRlZFZhcmlhYmxlSWRlbnRpZmllcnMoc291cmNlRmlsZSk7XG5cbiAgY29uc3QgcHJlZml4U3RhdGVtZW50cyA9IG1vZHVsZS5zdGF0ZW1lbnRzLmZpbHRlcihzdGF0ZW1lbnQgPT4gIShzdGF0ZW1lbnQgaW5zdGFuY2VvZiBDbGFzc1N0bXQpKTtcbiAgY29uc3QgY2xhc3NlcyA9XG4gICAgICBtb2R1bGUuc3RhdGVtZW50cy5maWx0ZXIoc3RhdGVtZW50ID0+IHN0YXRlbWVudCBpbnN0YW5jZW9mIENsYXNzU3RtdCkgYXMgQ2xhc3NTdG10W107XG4gIGNvbnN0IGNsYXNzTWFwID0gbmV3IE1hcChcbiAgICAgIGNsYXNzZXMubWFwPFtzdHJpbmcsIENsYXNzU3RtdF0+KGNsYXNzU3RhdGVtZW50ID0+IFtjbGFzc1N0YXRlbWVudC5uYW1lLCBjbGFzc1N0YXRlbWVudF0pKTtcbiAgY29uc3QgY2xhc3NOYW1lcyA9IG5ldyBTZXQoY2xhc3Nlcy5tYXAoY2xhc3NTdGF0ZW1lbnQgPT4gY2xhc3NTdGF0ZW1lbnQubmFtZSkpO1xuXG4gIGNvbnN0IHByZWZpeDogdHMuU3RhdGVtZW50W10gPVxuICAgICAgcHJlZml4U3RhdGVtZW50cy5tYXAoc3RhdGVtZW50ID0+IHN0YXRlbWVudC52aXNpdFN0YXRlbWVudChjb252ZXJ0ZXIsIHNvdXJjZUZpbGUpKTtcblxuICAvLyBBZGQgc3RhdGljIG1ldGhvZHMgdG8gYWxsIHRoZSBjbGFzc2VzIHJlZmVyZW5jZWQgaW4gbW9kdWxlLlxuICBsZXQgbmV3U3RhdGVtZW50cyA9IHNvdXJjZUZpbGUuc3RhdGVtZW50cy5tYXAobm9kZSA9PiB7XG4gICAgaWYgKG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLkNsYXNzRGVjbGFyYXRpb24pIHtcbiAgICAgIGNvbnN0IGNsYXNzRGVjbGFyYXRpb24gPSBub2RlIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICBjb25zdCBuYW1lID0gY2xhc3NEZWNsYXJhdGlvbi5uYW1lO1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgY29uc3QgY2xhc3NTdGF0ZW1lbnQgPSBjbGFzc01hcC5nZXQobmFtZS50ZXh0KTtcbiAgICAgICAgaWYgKGNsYXNzU3RhdGVtZW50KSB7XG4gICAgICAgICAgY2xhc3NOYW1lcy5kZWxldGUobmFtZS50ZXh0KTtcbiAgICAgICAgICBjb25zdCBjbGFzc01lbWJlckhvbGRlciA9XG4gICAgICAgICAgICAgIGNvbnZlcnRlci52aXNpdERlY2xhcmVDbGFzc1N0bXQoY2xhc3NTdGF0ZW1lbnQpIGFzIHRzLkNsYXNzRGVjbGFyYXRpb247XG4gICAgICAgICAgY29uc3QgbmV3TWV0aG9kcyA9XG4gICAgICAgICAgICAgIGNsYXNzTWVtYmVySG9sZGVyLm1lbWJlcnMuZmlsdGVyKG1lbWJlciA9PiBtZW1iZXIua2luZCAhPT0gdHMuU3ludGF4S2luZC5Db25zdHJ1Y3Rvcik7XG4gICAgICAgICAgY29uc3QgbmV3TWVtYmVycyA9IFsuLi5jbGFzc0RlY2xhcmF0aW9uLm1lbWJlcnMsIC4uLm5ld01ldGhvZHNdO1xuXG4gICAgICAgICAgcmV0dXJuIHRzLnVwZGF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAgIGNsYXNzRGVjbGFyYXRpb24sXG4gICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gY2xhc3NEZWNsYXJhdGlvbi5kZWNvcmF0b3JzLFxuICAgICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gY2xhc3NEZWNsYXJhdGlvbi5tb2RpZmllcnMsXG4gICAgICAgICAgICAgIC8qIG5hbWUgKi8gY2xhc3NEZWNsYXJhdGlvbi5uYW1lLFxuICAgICAgICAgICAgICAvKiB0eXBlUGFyYW1ldGVycyAqLyBjbGFzc0RlY2xhcmF0aW9uLnR5cGVQYXJhbWV0ZXJzLFxuICAgICAgICAgICAgICAvKiBoZXJpdGFnZUNsYXVzZXMgKi8gY2xhc3NEZWNsYXJhdGlvbi5oZXJpdGFnZUNsYXVzZXMgfHwgW10sXG4gICAgICAgICAgICAgIC8qIG1lbWJlcnMgKi8gbmV3TWVtYmVycyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH0pO1xuXG4gIC8vIFZhbGlkYXRlIHRoYXQgYWxsIHRoZSBjbGFzc2VzIGhhdmUgYmVlbiBnZW5lcmF0ZWRcbiAgY2xhc3NOYW1lcy5zaXplID09IDAgfHxcbiAgICAgIGVycm9yKGAke2NsYXNzTmFtZXMuc2l6ZSA9PSAxID8gJ0NsYXNzJyA6ICdDbGFzc2VzJ30gXCIke1xuICAgICAgICAgIEFycmF5LmZyb20oY2xhc3NOYW1lcy5rZXlzKCkpLmpvaW4oJywgJyl9XCIgbm90IGdlbmVyYXRlZGApO1xuXG4gIC8vIEFkZCBpbXBvcnRzIHRvIHRoZSBtb2R1bGUgcmVxdWlyZWQgYnkgdGhlIG5ldyBtZXRob2RzXG4gIGNvbnN0IGltcG9ydHMgPSBjb252ZXJ0ZXIuZ2V0SW1wb3J0cygpO1xuICBpZiAoaW1wb3J0cyAmJiBpbXBvcnRzLmxlbmd0aCkge1xuICAgIC8vIEZpbmQgd2hlcmUgdGhlIG5ldyBpbXBvcnRzIHNob3VsZCBnb1xuICAgIGNvbnN0IGluZGV4ID0gZmlyc3RBZnRlcihcbiAgICAgICAgbmV3U3RhdGVtZW50cyxcbiAgICAgICAgc3RhdGVtZW50ID0+IHN0YXRlbWVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uIHx8XG4gICAgICAgICAgICBzdGF0ZW1lbnQua2luZCA9PT0gdHMuU3ludGF4S2luZC5JbXBvcnRFcXVhbHNEZWNsYXJhdGlvbik7XG4gICAgbmV3U3RhdGVtZW50cyA9XG4gICAgICAgIFsuLi5uZXdTdGF0ZW1lbnRzLnNsaWNlKDAsIGluZGV4KSwgLi4uaW1wb3J0cywgLi4ucHJlZml4LCAuLi5uZXdTdGF0ZW1lbnRzLnNsaWNlKGluZGV4KV07XG4gIH0gZWxzZSB7XG4gICAgbmV3U3RhdGVtZW50cyA9IFsuLi5wcmVmaXgsIC4uLm5ld1N0YXRlbWVudHNdO1xuICB9XG5cbiAgY29udmVydGVyLnVwZGF0ZVNvdXJjZU1hcChuZXdTdGF0ZW1lbnRzKTtcbiAgY29uc3QgbmV3U291cmNlRmlsZSA9IHRzLnVwZGF0ZVNvdXJjZUZpbGVOb2RlKHNvdXJjZUZpbGUsIG5ld1N0YXRlbWVudHMpO1xuXG4gIHJldHVybiBbbmV3U291cmNlRmlsZSwgY29udmVydGVyLmdldE5vZGVNYXAoKV07XG59XG5cbi8vIFJldHVybiB0aGUgaW5kZXggYWZ0ZXIgdGhlIGZpcnN0IHZhbHVlIGluIGBhYCB0aGF0IGRvZXNuJ3QgbWF0Y2ggdGhlIHByZWRpY2F0ZSBhZnRlciBhIHZhbHVlIHRoYXRcbi8vIGRvZXMgb3IgMCBpZiBubyB2YWx1ZXMgbWF0Y2guXG5mdW5jdGlvbiBmaXJzdEFmdGVyPFQ+KGE6IFRbXSwgcHJlZGljYXRlOiAodmFsdWU6IFQpID0+IGJvb2xlYW4pIHtcbiAgbGV0IGluZGV4ID0gMDtcbiAgY29uc3QgbGVuID0gYS5sZW5ndGg7XG4gIGZvciAoOyBpbmRleCA8IGxlbjsgaW5kZXgrKykge1xuICAgIGNvbnN0IHZhbHVlID0gYVtpbmRleF07XG4gICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSkpIGJyZWFrO1xuICB9XG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiAwO1xuICBmb3IgKDsgaW5kZXggPCBsZW47IGluZGV4KyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IGFbaW5kZXhdO1xuICAgIGlmICghcHJlZGljYXRlKHZhbHVlKSkgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufVxuXG4vLyBBIHJlY29yZGVkIG5vZGUgaXMgYSBzdWJ0eXBlIG9mIHRoZSBub2RlIHRoYXQgaXMgbWFya2VkIGFzIGJlaW5nIHJlY29yZGVkLiBUaGlzIGlzIHVzZWRcbi8vIHRvIGVuc3VyZSB0aGF0IE5vZGVFbWl0dGVyVmlzaXRvci5yZWNvcmQgaGFzIGJlZW4gY2FsbGVkIG9uIGFsbCBub2RlcyByZXR1cm5lZCBieSB0aGVcbi8vIE5vZGVFbWl0dGVyVmlzaXRvclxuZXhwb3J0IHR5cGUgUmVjb3JkZWROb2RlPFQgZXh0ZW5kcyB0cy5Ob2RlID0gdHMuTm9kZT4gPSAoVCZ7XG4gIF9fcmVjb3JkZWQ6IGFueTtcbn0pfG51bGw7XG5cbmZ1bmN0aW9uIGVzY2FwZUxpdGVyYWwodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oXFxcInxcXFxcKS9nLCAnXFxcXCQxJykucmVwbGFjZSgvKFxcbil8KFxccikvZywgZnVuY3Rpb24odiwgbiwgcikge1xuICAgIHJldHVybiBuID8gJ1xcXFxuJyA6ICdcXFxccic7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXRlcmFsKHZhbHVlOiBhbnkpIHtcbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZU51bGwoKTtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRzLmNyZWF0ZUxpdGVyYWwodmFsdWUpO1xuICAgIGlmICh0cy5pc1N0cmluZ0xpdGVyYWwocmVzdWx0KSAmJiByZXN1bHQudGV4dC5pbmRleE9mKCdcXFxcJykgPj0gMCkge1xuICAgICAgLy8gSGFjayB0byBhdm9pZCBwcm9ibGVtcyBjYXVzZSBpbmRpcmVjdGx5IGJ5OlxuICAgICAgLy8gICAgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8yMDE5MlxuICAgICAgLy8gVGhpcyBhdm9pZHMgdGhlIHN0cmluZyBlc2NhcGluZyBub3JtYWxseSBwZXJmb3JtZWQgZm9yIGEgc3RyaW5nIHJlbHlpbmcgb24gdGhhdFxuICAgICAgLy8gVHlwZVNjcmlwdCBqdXN0IGVtaXRzIHRoZSB0ZXh0IHJhdyBmb3IgYSBudW1lcmljIGxpdGVyYWwuXG4gICAgICAocmVzdWx0IGFzIGFueSkua2luZCA9IHRzLlN5bnRheEtpbmQuTnVtZXJpY0xpdGVyYWw7XG4gICAgICByZXN1bHQudGV4dCA9IGBcIiR7ZXNjYXBlTGl0ZXJhbChyZXN1bHQudGV4dCl9XCJgO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRXhwb3J0VHlwZVN0YXRlbWVudChzdGF0ZW1lbnQ6IHRzLlN0YXRlbWVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFzdGF0ZW1lbnQubW9kaWZpZXJzICYmXG4gICAgICBzdGF0ZW1lbnQubW9kaWZpZXJzLnNvbWUobW9kID0+IG1vZC5raW5kID09PSB0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpO1xufVxuXG4vKipcbiAqIFZpc2l0cyBhbiBvdXRwdXQgYXN0IGFuZCBwcm9kdWNlcyB0aGUgY29ycmVzcG9uZGluZyBUeXBlU2NyaXB0IHN5bnRoZXRpYyBub2Rlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE5vZGVFbWl0dGVyVmlzaXRvciBpbXBsZW1lbnRzIFN0YXRlbWVudFZpc2l0b3IsIEV4cHJlc3Npb25WaXNpdG9yIHtcbiAgcHJpdmF0ZSBfbm9kZU1hcCA9IG5ldyBNYXA8dHMuTm9kZSwgTm9kZT4oKTtcbiAgcHJpdmF0ZSBfaW1wb3J0c1dpdGhQcmVmaXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG4gIHByaXZhdGUgX3JlZXhwb3J0cyA9IG5ldyBNYXA8c3RyaW5nLCB7bmFtZTogc3RyaW5nLCBhczogc3RyaW5nfVtdPigpO1xuICBwcml2YXRlIF90ZW1wbGF0ZVNvdXJjZXMgPSBuZXcgTWFwPFBhcnNlU291cmNlRmlsZSwgdHMuU291cmNlTWFwU291cmNlPigpO1xuICBwcml2YXRlIF9leHBvcnRlZFZhcmlhYmxlSWRlbnRpZmllcnMgPSBuZXcgTWFwPHN0cmluZywgdHMuSWRlbnRpZmllcj4oKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFubm90YXRlRm9yQ2xvc3VyZUNvbXBpbGVyOiBib29sZWFuKSB7fVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBzb3VyY2UgZmlsZSBhbmQgY29sbGVjdCBleHBvcnRlZCBpZGVudGlmaWVycyB0aGF0IHJlZmVyIHRvIHZhcmlhYmxlcy5cbiAgICpcbiAgICogT25seSB2YXJpYWJsZXMgYXJlIGNvbGxlY3RlZCBiZWNhdXNlIGV4cG9ydGVkIGNsYXNzZXMgc3RpbGwgZXhpc3QgaW4gdGhlIG1vZHVsZSBzY29wZSBpblxuICAgKiBDb21tb25KUywgd2hlcmVhcyB2YXJpYWJsZXMgaGF2ZSB0aGVpciBkZWNsYXJhdGlvbnMgbW92ZWQgb250byB0aGUgYGV4cG9ydHNgIG9iamVjdCwgYW5kIGFsbFxuICAgKiByZWZlcmVuY2VzIGFyZSB1cGRhdGVkIGFjY29yZGluZ2x5LlxuICAgKi9cbiAgbG9hZEV4cG9ydGVkVmFyaWFibGVJZGVudGlmaWVycyhzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogdm9pZCB7XG4gICAgc291cmNlRmlsZS5zdGF0ZW1lbnRzLmZvckVhY2goc3RhdGVtZW50ID0+IHtcbiAgICAgIGlmICh0cy5pc1ZhcmlhYmxlU3RhdGVtZW50KHN0YXRlbWVudCkgJiYgaXNFeHBvcnRUeXBlU3RhdGVtZW50KHN0YXRlbWVudCkpIHtcbiAgICAgICAgc3RhdGVtZW50LmRlY2xhcmF0aW9uTGlzdC5kZWNsYXJhdGlvbnMuZm9yRWFjaChkZWNsYXJhdGlvbiA9PiB7XG4gICAgICAgICAgaWYgKHRzLmlzSWRlbnRpZmllcihkZWNsYXJhdGlvbi5uYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5fZXhwb3J0ZWRWYXJpYWJsZUlkZW50aWZpZXJzLnNldChkZWNsYXJhdGlvbi5uYW1lLnRleHQsIGRlY2xhcmF0aW9uLm5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRSZWV4cG9ydHMoKTogdHMuU3RhdGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3JlZXhwb3J0cy5lbnRyaWVzKCkpXG4gICAgICAgIC5tYXAoXG4gICAgICAgICAgICAoW2V4cG9ydGVkRmlsZVBhdGgsIHJlZXhwb3J0c10pID0+IHRzLmNyZWF0ZUV4cG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlTmFtZWRFeHBvcnRzKFxuICAgICAgICAgICAgICAgICAgICByZWV4cG9ydHMubWFwKCh7bmFtZSwgYXN9KSA9PiB0cy5jcmVhdGVFeHBvcnRTcGVjaWZpZXIobmFtZSwgYXMpKSksXG4gICAgICAgICAgICAgICAgLyogbW9kdWxlU3BlY2lmaWVyICovIGNyZWF0ZUxpdGVyYWwoZXhwb3J0ZWRGaWxlUGF0aCkpKTtcbiAgfVxuXG4gIGdldEltcG9ydHMoKTogdHMuU3RhdGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX2ltcG9ydHNXaXRoUHJlZml4ZXMuZW50cmllcygpKVxuICAgICAgICAubWFwKFxuICAgICAgICAgICAgKFtuYW1lc3BhY2UsIHByZWZpeF0pID0+IHRzLmNyZWF0ZUltcG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgLyogaW1wb3J0Q2xhdXNlICovXG4gICAgICAgICAgICAgICAgdHMuY3JlYXRlSW1wb3J0Q2xhdXNlKFxuICAgICAgICAgICAgICAgICAgICAvKiBuYW1lICovPHRzLklkZW50aWZpZXI+KHVuZGVmaW5lZCBhcyBhbnkpLFxuICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVOYW1lc3BhY2VJbXBvcnQodHMuY3JlYXRlSWRlbnRpZmllcihwcmVmaXgpKSksXG4gICAgICAgICAgICAgICAgLyogbW9kdWxlU3BlY2lmaWVyICovIGNyZWF0ZUxpdGVyYWwobmFtZXNwYWNlKSkpO1xuICB9XG5cbiAgZ2V0Tm9kZU1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbm9kZU1hcDtcbiAgfVxuXG4gIHVwZGF0ZVNvdXJjZU1hcChzdGF0ZW1lbnRzOiB0cy5TdGF0ZW1lbnRbXSkge1xuICAgIGxldCBsYXN0UmFuZ2VTdGFydE5vZGU6IHRzLk5vZGV8dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgIGxldCBsYXN0UmFuZ2VFbmROb2RlOiB0cy5Ob2RlfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdFJhbmdlOiB0cy5Tb3VyY2VNYXBSYW5nZXx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgICBjb25zdCByZWNvcmRMYXN0U291cmNlUmFuZ2UgPSAoKSA9PiB7XG4gICAgICBpZiAobGFzdFJhbmdlICYmIGxhc3RSYW5nZVN0YXJ0Tm9kZSAmJiBsYXN0UmFuZ2VFbmROb2RlKSB7XG4gICAgICAgIGlmIChsYXN0UmFuZ2VTdGFydE5vZGUgPT0gbGFzdFJhbmdlRW5kTm9kZSkge1xuICAgICAgICAgIHRzLnNldFNvdXJjZU1hcFJhbmdlKGxhc3RSYW5nZUVuZE5vZGUsIGxhc3RSYW5nZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHMuc2V0U291cmNlTWFwUmFuZ2UobGFzdFJhbmdlU3RhcnROb2RlLCBsYXN0UmFuZ2UpO1xuICAgICAgICAgIC8vIE9ubHkgZW1pdCB0aGUgcG9zIGZvciB0aGUgZmlyc3Qgbm9kZSBlbWl0dGVkIGluIHRoZSByYW5nZS5cbiAgICAgICAgICB0cy5zZXRFbWl0RmxhZ3MobGFzdFJhbmdlU3RhcnROb2RlLCB0cy5FbWl0RmxhZ3MuTm9UcmFpbGluZ1NvdXJjZU1hcCk7XG4gICAgICAgICAgdHMuc2V0U291cmNlTWFwUmFuZ2UobGFzdFJhbmdlRW5kTm9kZSwgbGFzdFJhbmdlKTtcbiAgICAgICAgICAvLyBPbmx5IGVtaXQgZW1pdCBlbmQgZm9yIHRoZSBsYXN0IG5vZGUgZW1pdHRlZCBpbiB0aGUgcmFuZ2UuXG4gICAgICAgICAgdHMuc2V0RW1pdEZsYWdzKGxhc3RSYW5nZUVuZE5vZGUsIHRzLkVtaXRGbGFncy5Ob0xlYWRpbmdTb3VyY2VNYXApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHZpc2l0Tm9kZSA9ICh0c05vZGU6IHRzLk5vZGUpID0+IHtcbiAgICAgIGNvbnN0IG5nTm9kZSA9IHRoaXMuX25vZGVNYXAuZ2V0KHRzTm9kZSk7XG4gICAgICBpZiAobmdOb2RlKSB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5zb3VyY2VSYW5nZU9mKG5nTm9kZSk7XG4gICAgICAgIGlmIChyYW5nZSkge1xuICAgICAgICAgIGlmICghbGFzdFJhbmdlIHx8IHJhbmdlLnNvdXJjZSAhPSBsYXN0UmFuZ2Uuc291cmNlIHx8IHJhbmdlLnBvcyAhPSBsYXN0UmFuZ2UucG9zIHx8XG4gICAgICAgICAgICAgIHJhbmdlLmVuZCAhPSBsYXN0UmFuZ2UuZW5kKSB7XG4gICAgICAgICAgICByZWNvcmRMYXN0U291cmNlUmFuZ2UoKTtcbiAgICAgICAgICAgIGxhc3RSYW5nZVN0YXJ0Tm9kZSA9IHRzTm9kZTtcbiAgICAgICAgICAgIGxhc3RSYW5nZSA9IHJhbmdlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsYXN0UmFuZ2VFbmROb2RlID0gdHNOb2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0cy5mb3JFYWNoQ2hpbGQodHNOb2RlLCB2aXNpdE5vZGUpO1xuICAgIH07XG4gICAgc3RhdGVtZW50cy5mb3JFYWNoKHZpc2l0Tm9kZSk7XG4gICAgcmVjb3JkTGFzdFNvdXJjZVJhbmdlKCk7XG4gIH1cblxuICBwcml2YXRlIHBvc3RQcm9jZXNzPFQgZXh0ZW5kcyB0cy5Ob2RlPihuZ05vZGU6IE5vZGUsIHRzTm9kZTogVHxudWxsKTogUmVjb3JkZWROb2RlPFQ+IHtcbiAgICBpZiAodHNOb2RlICYmICF0aGlzLl9ub2RlTWFwLmhhcyh0c05vZGUpKSB7XG4gICAgICB0aGlzLl9ub2RlTWFwLnNldCh0c05vZGUsIG5nTm9kZSk7XG4gICAgfVxuICAgIGlmICh0c05vZGUgIT09IG51bGwgJiYgbmdOb2RlIGluc3RhbmNlb2YgU3RhdGVtZW50ICYmIG5nTm9kZS5sZWFkaW5nQ29tbWVudHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXR0YWNoQ29tbWVudHModHNOb2RlIGFzIHVua25vd24gYXMgdHMuU3RhdGVtZW50LCBuZ05vZGUubGVhZGluZ0NvbW1lbnRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRzTm9kZSBhcyBSZWNvcmRlZE5vZGU8VD47XG4gIH1cblxuICBwcml2YXRlIHNvdXJjZVJhbmdlT2Yobm9kZTogTm9kZSk6IHRzLlNvdXJjZU1hcFJhbmdlfG51bGwge1xuICAgIGlmIChub2RlLnNvdXJjZVNwYW4pIHtcbiAgICAgIGNvbnN0IHNwYW4gPSBub2RlLnNvdXJjZVNwYW47XG4gICAgICBpZiAoc3Bhbi5zdGFydC5maWxlID09IHNwYW4uZW5kLmZpbGUpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHNwYW4uc3RhcnQuZmlsZTtcbiAgICAgICAgaWYgKGZpbGUudXJsKSB7XG4gICAgICAgICAgbGV0IHNvdXJjZSA9IHRoaXMuX3RlbXBsYXRlU291cmNlcy5nZXQoZmlsZSk7XG4gICAgICAgICAgaWYgKCFzb3VyY2UpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IHRzLmNyZWF0ZVNvdXJjZU1hcFNvdXJjZShmaWxlLnVybCwgZmlsZS5jb250ZW50LCBwb3MgPT4gcG9zKTtcbiAgICAgICAgICAgIHRoaXMuX3RlbXBsYXRlU291cmNlcy5zZXQoZmlsZSwgc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHtwb3M6IHNwYW4uc3RhcnQub2Zmc2V0LCBlbmQ6IHNwYW4uZW5kLm9mZnNldCwgc291cmNlfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kaWZpZXJzKHN0bXQ6IFN0YXRlbWVudCkge1xuICAgIGxldCBtb2RpZmllcnM6IHRzLk1vZGlmaWVyW10gPSBbXTtcbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihTdG10TW9kaWZpZXIuRXhwb3J0ZWQpKSB7XG4gICAgICBtb2RpZmllcnMucHVzaCh0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpKTtcbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVycztcbiAgfVxuXG4gIC8vIFN0YXRlbWVudFZpc2l0b3JcbiAgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBEZWNsYXJlVmFyU3RtdCkge1xuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKFN0bXRNb2RpZmllci5FeHBvcnRlZCkgJiYgc3RtdC52YWx1ZSBpbnN0YW5jZW9mIEV4dGVybmFsRXhwciAmJlxuICAgICAgICAhc3RtdC50eXBlKSB7XG4gICAgICAvLyBjaGVjayBmb3IgYSByZWV4cG9ydFxuICAgICAgY29uc3Qge25hbWUsIG1vZHVsZU5hbWV9ID0gc3RtdC52YWx1ZS52YWx1ZTtcbiAgICAgIGlmIChtb2R1bGVOYW1lKSB7XG4gICAgICAgIGxldCByZWV4cG9ydHMgPSB0aGlzLl9yZWV4cG9ydHMuZ2V0KG1vZHVsZU5hbWUpO1xuICAgICAgICBpZiAoIXJlZXhwb3J0cykge1xuICAgICAgICAgIHJlZXhwb3J0cyA9IFtdO1xuICAgICAgICAgIHRoaXMuX3JlZXhwb3J0cy5zZXQobW9kdWxlTmFtZSwgcmVleHBvcnRzKTtcbiAgICAgICAgfVxuICAgICAgICByZWV4cG9ydHMucHVzaCh7bmFtZTogbmFtZSEsIGFzOiBzdG10Lm5hbWV9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgdmFyRGVjbExpc3QgPSB0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uTGlzdChbdHMuY3JlYXRlVmFyaWFibGVEZWNsYXJhdGlvbihcbiAgICAgICAgdHMuY3JlYXRlSWRlbnRpZmllcihzdG10Lm5hbWUpLFxuICAgICAgICAvKiB0eXBlICovIHVuZGVmaW5lZCxcbiAgICAgICAgKHN0bXQudmFsdWUgJiYgc3RtdC52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpIHx8IHVuZGVmaW5lZCldKTtcblxuICAgIGlmIChzdG10Lmhhc01vZGlmaWVyKFN0bXRNb2RpZmllci5FeHBvcnRlZCkpIHtcbiAgICAgIC8vIE5vdGU6IFdlIG5lZWQgdG8gYWRkIGFuIGV4cGxpY2l0IHZhcmlhYmxlIGFuZCBleHBvcnQgZGVjbGFyYXRpb24gc28gdGhhdFxuICAgICAgLy8gdGhlIHZhcmlhYmxlIGNhbiBiZSByZWZlcnJlZCBpbiB0aGUgc2FtZSBmaWxlIGFzIHdlbGwuXG4gICAgICBjb25zdCB0c1ZhclN0bXQgPVxuICAgICAgICAgIHRoaXMucG9zdFByb2Nlc3Moc3RtdCwgdHMuY3JlYXRlVmFyaWFibGVTdGF0ZW1lbnQoLyogbW9kaWZpZXJzICovW10sIHZhckRlY2xMaXN0KSk7XG4gICAgICBjb25zdCBleHBvcnRTdG10ID0gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgICBzdG10LFxuICAgICAgICAgIHRzLmNyZWF0ZUV4cG9ydERlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAvKmRlY29yYXRvcnMqLyB1bmRlZmluZWQsIC8qbW9kaWZpZXJzKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICB0cy5jcmVhdGVOYW1lZEV4cG9ydHMoW3RzLmNyZWF0ZUV4cG9ydFNwZWNpZmllcihzdG10Lm5hbWUsIHN0bXQubmFtZSldKSkpO1xuICAgICAgcmV0dXJuIFt0c1ZhclN0bXQsIGV4cG9ydFN0bXRdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhzdG10LCB0cy5jcmVhdGVWYXJpYWJsZVN0YXRlbWVudCh0aGlzLmdldE1vZGlmaWVycyhzdG10KSwgdmFyRGVjbExpc3QpKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZUZ1bmN0aW9uU3RtdChzdG10OiBEZWNsYXJlRnVuY3Rpb25TdG10KSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIHN0bXQsXG4gICAgICAgIHRzLmNyZWF0ZUZ1bmN0aW9uRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgdGhpcy5nZXRNb2RpZmllcnMoc3RtdCksXG4gICAgICAgICAgICAvKiBhc3Rlcmlza1Rva2VuICovIHVuZGVmaW5lZCwgc3RtdC5uYW1lLCAvKiB0eXBlUGFyYW1ldGVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICBzdG10LnBhcmFtcy5tYXAoXG4gICAgICAgICAgICAgICAgcCA9PiB0cy5jcmVhdGVQYXJhbWV0ZXIoXG4gICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLCAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAvKiBkb3REb3REb3RUb2tlbiAqLyB1bmRlZmluZWQsIHAubmFtZSkpLFxuICAgICAgICAgICAgLyogdHlwZSAqLyB1bmRlZmluZWQsIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhzdG10LnN0YXRlbWVudHMpKSk7XG4gIH1cblxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IEV4cHJlc3Npb25TdGF0ZW1lbnQpIHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhzdG10LCB0cy5jcmVhdGVTdGF0ZW1lbnQoc3RtdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpO1xuICB9XG5cbiAgdmlzaXRSZXR1cm5TdG10KHN0bXQ6IFJldHVyblN0YXRlbWVudCkge1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKFxuICAgICAgICBzdG10LCB0cy5jcmVhdGVSZXR1cm4oc3RtdC52YWx1ZSA/IHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpIDogdW5kZWZpbmVkKSk7XG4gIH1cblxuICB2aXNpdERlY2xhcmVDbGFzc1N0bXQoc3RtdDogQ2xhc3NTdG10KSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gdGhpcy5nZXRNb2RpZmllcnMoc3RtdCk7XG4gICAgY29uc3QgZmllbGRzID0gc3RtdC5maWVsZHMubWFwKGZpZWxkID0+IHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gdHMuY3JlYXRlUHJvcGVydHkoXG4gICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsIC8qIG1vZGlmaWVycyAqLyB0cmFuc2xhdGVNb2RpZmllcnMoZmllbGQubW9kaWZpZXJzKSxcbiAgICAgICAgICBmaWVsZC5uYW1lLFxuICAgICAgICAgIC8qIHF1ZXN0aW9uVG9rZW4gKi8gdW5kZWZpbmVkLFxuICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgIGZpZWxkLmluaXRpYWxpemVyID09IG51bGwgPyB0cy5jcmVhdGVOdWxsKCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZC5pbml0aWFsaXplci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpO1xuXG4gICAgICBpZiAodGhpcy5hbm5vdGF0ZUZvckNsb3N1cmVDb21waWxlcikge1xuICAgICAgICAvLyBDbG9zdXJlIGNvbXBpbGVyIHRyYW5zZm9ybXMgdGhlIGZvcm0gYFNlcnZpY2UuybVwcm92ID0gWGAgaW50byBgU2VydmljZSTJtXByb3YgPSBYYC4gVG9cbiAgICAgICAgLy8gcHJldmVudCB0aGlzIHRyYW5zZm9ybWF0aW9uLCBzdWNoIGFzc2lnbm1lbnRzIG5lZWQgdG8gYmUgYW5ub3RhdGVkIHdpdGggQG5vY29sbGFwc2UuXG4gICAgICAgIC8vIE5vdGUgdGhhdCB0c2lja2xlIGlzIHR5cGljYWxseSByZXNwb25zaWJsZSBmb3IgYWRkaW5nIHN1Y2ggYW5ub3RhdGlvbnMsIGhvd2V2ZXIgaXRcbiAgICAgICAgLy8gZG9lc24ndCB5ZXQgaGFuZGxlIHN5bnRoZXRpYyBmaWVsZHMgYWRkZWQgZHVyaW5nIG90aGVyIHRyYW5zZm9ybWF0aW9ucy5cbiAgICAgICAgdHMuYWRkU3ludGhldGljTGVhZGluZ0NvbW1lbnQoXG4gICAgICAgICAgICBwcm9wZXJ0eSwgdHMuU3ludGF4S2luZC5NdWx0aUxpbmVDb21tZW50VHJpdmlhLCAnKiBAbm9jb2xsYXBzZSAnLFxuICAgICAgICAgICAgLyogaGFzVHJhaWxpbmdOZXdMaW5lICovIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb3BlcnR5O1xuICAgIH0pO1xuICAgIGNvbnN0IGdldHRlcnMgPSBzdG10LmdldHRlcnMubWFwKFxuICAgICAgICBnZXR0ZXIgPT4gdHMuY3JlYXRlR2V0QWNjZXNzb3IoXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCwgZ2V0dGVyLm5hbWUsIC8qIHBhcmFtZXRlcnMgKi9bXSxcbiAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCB0aGlzLl92aXNpdFN0YXRlbWVudHMoZ2V0dGVyLmJvZHkpKSk7XG5cbiAgICBjb25zdCBjb25zdHJ1Y3RvciA9XG4gICAgICAgIChzdG10LmNvbnN0cnVjdG9yTWV0aG9kICYmIFt0cy5jcmVhdGVDb25zdHJ1Y3RvcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIHBhcmFtZXRlcnMgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0bXQuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwID0+IHRzLmNyZWF0ZVBhcmFtZXRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRvdERvdERvdFRva2VuICovIHVuZGVmaW5lZCwgcC5uYW1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl92aXNpdFN0YXRlbWVudHMoc3RtdC5jb25zdHJ1Y3Rvck1ldGhvZC5ib2R5KSldKSB8fFxuICAgICAgICBbXTtcblxuICAgIC8vIFRPRE8ge2NodWNran06IERldGVybWluZSB3aGF0IHNob3VsZCBiZSBkb25lIGZvciBhIG1ldGhvZCB3aXRoIGEgbnVsbCBuYW1lLlxuICAgIGNvbnN0IG1ldGhvZHMgPSBzdG10Lm1ldGhvZHMuZmlsdGVyKG1ldGhvZCA9PiBtZXRob2QubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0+IHRzLmNyZWF0ZU1ldGhvZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogZGVjb3JhdG9ycyAqLyB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIG1vZGlmaWVycyAqLyB0cmFuc2xhdGVNb2RpZmllcnMobWV0aG9kLm1vZGlmaWVycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGFzdHJpc2tUb2tlbiAqLyB1bmRlZmluZWQsIG1ldGhvZC5uYW1lIS8qIGd1YXJkZWQgYnkgZmlsdGVyICovLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKiBxdWVzdGlvblRva2VuICovIHVuZGVmaW5lZCwgLyogdHlwZVBhcmFtZXRlcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2QucGFyYW1zLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAgPT4gdHMuY3JlYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRlY29yYXRvcnMgKi8gdW5kZWZpbmVkLCAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIGRvdERvdERvdFRva2VuICovIHVuZGVmaW5lZCwgcC5uYW1lKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCB0aGlzLl92aXNpdFN0YXRlbWVudHMobWV0aG9kLmJvZHkpKSk7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIHN0bXQsXG4gICAgICAgIHRzLmNyZWF0ZUNsYXNzRGVjbGFyYXRpb24oXG4gICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgbW9kaWZpZXJzLCBzdG10Lm5hbWUsIC8qIHR5cGVQYXJhbWV0ZXJzKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgc3RtdC5wYXJlbnQgJiZcbiAgICAgICAgICAgICAgICAgICAgW3RzLmNyZWF0ZUhlcml0YWdlQ2xhdXNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgdHMuU3ludGF4S2luZC5FeHRlbmRzS2V5d29yZCwgW3N0bXQucGFyZW50LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKV0pXSB8fFxuICAgICAgICAgICAgICAgIFtdLFxuICAgICAgICAgICAgWy4uLmZpZWxkcywgLi4uZ2V0dGVycywgLi4uY29uc3RydWN0b3IsIC4uLm1ldGhvZHNdKSk7XG4gIH1cblxuICB2aXNpdElmU3RtdChzdG10OiBJZlN0bXQpIHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgc3RtdCxcbiAgICAgICAgdHMuY3JlYXRlSWYoXG4gICAgICAgICAgICBzdG10LmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhzdG10LnRydWVDYXNlKSxcbiAgICAgICAgICAgIHN0bXQuZmFsc2VDYXNlICYmIHN0bXQuZmFsc2VDYXNlLmxlbmd0aCAmJiB0aGlzLl92aXNpdFN0YXRlbWVudHMoc3RtdC5mYWxzZUNhc2UpIHx8XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkKSk7XG4gIH1cblxuICB2aXNpdFRyeUNhdGNoU3RtdChzdG10OiBUcnlDYXRjaFN0bXQpOiBSZWNvcmRlZE5vZGU8dHMuVHJ5U3RhdGVtZW50PiB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIHN0bXQsXG4gICAgICAgIHRzLmNyZWF0ZVRyeShcbiAgICAgICAgICAgIHRoaXMuX3Zpc2l0U3RhdGVtZW50cyhzdG10LmJvZHlTdG10cyksXG4gICAgICAgICAgICB0cy5jcmVhdGVDYXRjaENsYXVzZShcbiAgICAgICAgICAgICAgICBDQVRDSF9FUlJPUl9OQU1FLFxuICAgICAgICAgICAgICAgIHRoaXMuX3Zpc2l0U3RhdGVtZW50c1ByZWZpeChcbiAgICAgICAgICAgICAgICAgICAgW3RzLmNyZWF0ZVZhcmlhYmxlU3RhdGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFt0cy5jcmVhdGVWYXJpYWJsZURlY2xhcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENBVENIX1NUQUNLX05BTUUsIC8qIHR5cGUgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX0VSUk9SX05BTUUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX1NUQUNLX05BTUUpKSldKV0sXG4gICAgICAgICAgICAgICAgICAgIHN0bXQuY2F0Y2hTdG10cykpLFxuICAgICAgICAgICAgLyogZmluYWxseUJsb2NrICovIHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdmlzaXRUaHJvd1N0bXQoc3RtdDogVGhyb3dTdG10KSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3Moc3RtdCwgdHMuY3JlYXRlVGhyb3coc3RtdC5lcnJvci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKTtcbiAgfVxuXG4gIC8vIEV4cHJlc3Npb25WaXNpdG9yXG4gIHZpc2l0V3JhcHBlZE5vZGVFeHByKGV4cHI6IFdyYXBwZWROb2RlRXhwcjxhbnk+KSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoZXhwciwgZXhwci5ub2RlKTtcbiAgfVxuXG4gIHZpc2l0VHlwZW9mRXhwcihleHByOiBUeXBlb2ZFeHByKSB7XG4gICAgY29uc3QgdHlwZU9mID0gdHMuY3JlYXRlVHlwZU9mKGV4cHIuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpO1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKGV4cHIsIHR5cGVPZik7XG4gIH1cblxuICAvLyBFeHByZXNzaW9uVmlzaXRvclxuICB2aXNpdFJlYWRWYXJFeHByKGV4cHI6IFJlYWRWYXJFeHByKSB7XG4gICAgc3dpdGNoIChleHByLmJ1aWx0aW4pIHtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5UaGlzOlxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhleHByLCB0cy5jcmVhdGVJZGVudGlmaWVyKE1FVEhPRF9USElTX05BTUUpKTtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5DYXRjaEVycm9yOlxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhleHByLCB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX0VSUk9SX05BTUUpKTtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5DYXRjaFN0YWNrOlxuICAgICAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhleHByLCB0cy5jcmVhdGVJZGVudGlmaWVyKENBVENIX1NUQUNLX05BTUUpKTtcbiAgICAgIGNhc2UgQnVpbHRpblZhci5TdXBlcjpcbiAgICAgICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoZXhwciwgdHMuY3JlYXRlU3VwZXIoKSk7XG4gICAgfVxuICAgIGlmIChleHByLm5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKGV4cHIsIHRzLmNyZWF0ZUlkZW50aWZpZXIoZXhwci5uYW1lKSk7XG4gICAgfVxuICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIFJlYWRWYXJFeHByIGZvcm1gKTtcbiAgfVxuXG4gIHZpc2l0V3JpdGVWYXJFeHByKGV4cHI6IFdyaXRlVmFyRXhwcik6IFJlY29yZGVkTm9kZTx0cy5CaW5hcnlFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgICAgICB0cy5jcmVhdGVJZGVudGlmaWVyKGV4cHIubmFtZSksIGV4cHIudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKSk7XG4gIH1cblxuICB2aXNpdFdyaXRlS2V5RXhwcihleHByOiBXcml0ZUtleUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuQmluYXJ5RXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKFxuICAgICAgICBleHByLFxuICAgICAgICB0cy5jcmVhdGVBc3NpZ25tZW50KFxuICAgICAgICAgICAgdHMuY3JlYXRlRWxlbWVudEFjY2VzcyhcbiAgICAgICAgICAgICAgICBleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSwgZXhwci5pbmRleC52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpLFxuICAgICAgICAgICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKTtcbiAgfVxuXG4gIHZpc2l0V3JpdGVQcm9wRXhwcihleHByOiBXcml0ZVByb3BFeHByKTogUmVjb3JkZWROb2RlPHRzLkJpbmFyeUV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlQXNzaWdubWVudChcbiAgICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLm5hbWUpLFxuICAgICAgICAgICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKTtcbiAgfVxuXG4gIHZpc2l0SW52b2tlTWV0aG9kRXhwcihleHByOiBJbnZva2VNZXRob2RFeHByKTogUmVjb3JkZWROb2RlPHRzLkNhbGxFeHByZXNzaW9uPiB7XG4gICAgY29uc3QgbWV0aG9kTmFtZSA9IGdldE1ldGhvZE5hbWUoZXhwcik7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZUNhbGwoXG4gICAgICAgICAgICB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSwgbWV0aG9kTmFtZSksXG4gICAgICAgICAgICAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCwgZXhwci5hcmdzLm1hcChhcmcgPT4gYXJnLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpKTtcbiAgfVxuXG4gIHZpc2l0SW52b2tlRnVuY3Rpb25FeHByKGV4cHI6IEludm9rZUZ1bmN0aW9uRXhwcik6IFJlY29yZGVkTm9kZTx0cy5DYWxsRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKFxuICAgICAgICBleHByLFxuICAgICAgICB0cy5jcmVhdGVDYWxsKFxuICAgICAgICAgICAgZXhwci5mbi52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIC8qIHR5cGVBcmd1bWVudHMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZXhwci5hcmdzLm1hcChhcmcgPT4gYXJnLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpKTtcbiAgfVxuXG4gIHZpc2l0VGFnZ2VkVGVtcGxhdGVFeHByKGV4cHI6IFRhZ2dlZFRlbXBsYXRlRXhwcik6IFJlY29yZGVkTm9kZTx0cy5UYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb24+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RhZ2dlZCB0ZW1wbGF0ZXMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gcHJlLWl2eSBtb2RlLicpO1xuICB9XG5cbiAgdmlzaXRJbnN0YW50aWF0ZUV4cHIoZXhwcjogSW5zdGFudGlhdGVFeHByKTogUmVjb3JkZWROb2RlPHRzLk5ld0V4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlTmV3KFxuICAgICAgICAgICAgZXhwci5jbGFzc0V4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCAvKiB0eXBlQXJndW1lbnRzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGV4cHIuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxFeHByKGV4cHI6IExpdGVyYWxFeHByKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoZXhwciwgY3JlYXRlTGl0ZXJhbChleHByLnZhbHVlKSk7XG4gIH1cblxuICB2aXNpdExvY2FsaXplZFN0cmluZyhleHByOiBMb2NhbGl6ZWRTdHJpbmcsIGNvbnRleHQ6IGFueSkge1xuICAgIHRocm93IG5ldyBFcnJvcignbG9jYWxpemVkIHN0cmluZ3MgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gcHJlLWl2eSBtb2RlLicpO1xuICB9XG5cbiAgdmlzaXRFeHRlcm5hbEV4cHIoZXhwcjogRXh0ZXJuYWxFeHByKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoZXhwciwgdGhpcy5fdmlzaXRJZGVudGlmaWVyKGV4cHIudmFsdWUpKTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByKGV4cHI6IENvbmRpdGlvbmFsRXhwcik6IFJlY29yZGVkTm9kZTx0cy5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbj4ge1xuICAgIC8vIFRPRE8ge2NodWNran06IFJldmlldyB1c2Ugb2YgISBvbiBmYWxzZUNhc2UuIFNob3VsZCBpdCBiZSBub24tbnVsbGFibGU/XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZVBhcmVuKHRzLmNyZWF0ZUNvbmRpdGlvbmFsKFxuICAgICAgICAgICAgZXhwci5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLnRydWVDYXNlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSxcbiAgICAgICAgICAgIGV4cHIuZmFsc2VDYXNlIS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSk7XG4gIH1cblxuICB2aXNpdE5vdEV4cHIoZXhwcjogTm90RXhwcik6IFJlY29yZGVkTm9kZTx0cy5QcmVmaXhVbmFyeUV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlUHJlZml4KFxuICAgICAgICAgICAgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvblRva2VuLCBleHByLmNvbmRpdGlvbi52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKTtcbiAgfVxuXG4gIHZpc2l0QXNzZXJ0Tm90TnVsbEV4cHIoZXhwcjogQXNzZXJ0Tm90TnVsbCk6IFJlY29yZGVkTm9kZTx0cy5FeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIGV4cHIuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKTtcbiAgfVxuXG4gIHZpc2l0Q2FzdEV4cHIoZXhwcjogQ2FzdEV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKTtcbiAgfVxuXG4gIHZpc2l0RnVuY3Rpb25FeHByKGV4cHI6IEZ1bmN0aW9uRXhwcikge1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKFxuICAgICAgICBleHByLFxuICAgICAgICB0cy5jcmVhdGVGdW5jdGlvbkV4cHJlc3Npb24oXG4gICAgICAgICAgICAvKiBtb2RpZmllcnMgKi8gdW5kZWZpbmVkLCAvKiBhc3RyaXNrVG9rZW4gKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyogbmFtZSAqLyBleHByLm5hbWUgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgLyogdHlwZVBhcmFtZXRlcnMgKi8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgZXhwci5wYXJhbXMubWFwKFxuICAgICAgICAgICAgICAgIHAgPT4gdHMuY3JlYXRlUGFyYW1ldGVyKFxuICAgICAgICAgICAgICAgICAgICAvKiBkZWNvcmF0b3JzICovIHVuZGVmaW5lZCwgLyogbW9kaWZpZXJzICovIHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgLyogZG90RG90RG90VG9rZW4gKi8gdW5kZWZpbmVkLCBwLm5hbWUpKSxcbiAgICAgICAgICAgIC8qIHR5cGUgKi8gdW5kZWZpbmVkLCB0aGlzLl92aXNpdFN0YXRlbWVudHMoZXhwci5zdGF0ZW1lbnRzKSkpO1xuICB9XG5cbiAgdmlzaXRVbmFyeU9wZXJhdG9yRXhwcihleHByOiBVbmFyeU9wZXJhdG9yRXhwcik6XG4gICAgICBSZWNvcmRlZE5vZGU8dHMuVW5hcnlFeHByZXNzaW9ufHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uPiB7XG4gICAgbGV0IHVuYXJ5T3BlcmF0b3I6IHRzLkJpbmFyeU9wZXJhdG9yO1xuICAgIHN3aXRjaCAoZXhwci5vcGVyYXRvcikge1xuICAgICAgY2FzZSBVbmFyeU9wZXJhdG9yLk1pbnVzOlxuICAgICAgICB1bmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5NaW51c1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVW5hcnlPcGVyYXRvci5QbHVzOlxuICAgICAgICB1bmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5QbHVzVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG9wZXJhdG9yOiAke2V4cHIub3BlcmF0b3J9YCk7XG4gICAgfVxuICAgIGNvbnN0IGJpbmFyeSA9IHRzLmNyZWF0ZVByZWZpeCh1bmFyeU9wZXJhdG9yLCBleHByLmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpKTtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhleHByLCBleHByLnBhcmVucyA/IHRzLmNyZWF0ZVBhcmVuKGJpbmFyeSkgOiBiaW5hcnkpO1xuICB9XG5cbiAgdmlzaXRCaW5hcnlPcGVyYXRvckV4cHIoZXhwcjogQmluYXJ5T3BlcmF0b3JFeHByKTpcbiAgICAgIFJlY29yZGVkTm9kZTx0cy5CaW5hcnlFeHByZXNzaW9ufHRzLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uPiB7XG4gICAgbGV0IGJpbmFyeU9wZXJhdG9yOiB0cy5CaW5hcnlPcGVyYXRvcjtcbiAgICBzd2l0Y2ggKGV4cHIub3BlcmF0b3IpIHtcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuQW5kOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kQW1wZXJzYW5kVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5CaXR3aXNlQW5kOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5CaWdnZXI6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhblRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuQmlnZ2VyRXF1YWxzOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5FcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLkRpdmlkZTpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5FcXVhbHM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5FcXVhbHNFcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLklkZW50aWNhbDpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkVxdWFsc0VxdWFsc0VxdWFsc1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTG93ZXI6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5MZXNzVGhhblRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTG93ZXJFcXVhbHM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTWludXM6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5NaW51c1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTW9kdWxvOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuUGVyY2VudFRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTXVsdGlwbHk6XG4gICAgICAgIGJpbmFyeU9wZXJhdG9yID0gdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuTm90RXF1YWxzOlxuICAgICAgICBiaW5hcnlPcGVyYXRvciA9IHRzLlN5bnRheEtpbmQuRXhjbGFtYXRpb25FcXVhbHNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uRXF1YWxzRXF1YWxzVG9rZW47XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBCaW5hcnlPcGVyYXRvci5PcjpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQmluYXJ5T3BlcmF0b3IuUGx1czpcbiAgICAgICAgYmluYXJ5T3BlcmF0b3IgPSB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gb3BlcmF0b3I6ICR7ZXhwci5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgY29uc3QgYmluYXJ5ID0gdHMuY3JlYXRlQmluYXJ5KFxuICAgICAgICBleHByLmxocy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCksIGJpbmFyeU9wZXJhdG9yLCBleHByLnJocy52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpO1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKGV4cHIsIGV4cHIucGFyZW5zID8gdHMuY3JlYXRlUGFyZW4oYmluYXJ5KSA6IGJpbmFyeSk7XG4gIH1cblxuICB2aXNpdFJlYWRQcm9wRXhwcihleHByOiBSZWFkUHJvcEV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIGV4cHIsIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLm5hbWUpKTtcbiAgfVxuXG4gIHZpc2l0UmVhZEtleUV4cHIoZXhwcjogUmVhZEtleUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuRWxlbWVudEFjY2Vzc0V4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgZXhwcixcbiAgICAgICAgdHMuY3JlYXRlRWxlbWVudEFjY2VzcyhcbiAgICAgICAgICAgIGV4cHIucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIG51bGwpLCBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSkpO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGV4cHI6IExpdGVyYWxBcnJheUV4cHIpOiBSZWNvcmRlZE5vZGU8dHMuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbj4ge1xuICAgIHJldHVybiB0aGlzLnBvc3RQcm9jZXNzKFxuICAgICAgICBleHByLCB0cy5jcmVhdGVBcnJheUxpdGVyYWwoZXhwci5lbnRyaWVzLm1hcChlbnRyeSA9PiBlbnRyeS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXBFeHByKGV4cHI6IExpdGVyYWxNYXBFeHByKTogUmVjb3JkZWROb2RlPHRzLk9iamVjdExpdGVyYWxFeHByZXNzaW9uPiB7XG4gICAgcmV0dXJuIHRoaXMucG9zdFByb2Nlc3MoXG4gICAgICAgIGV4cHIsXG4gICAgICAgIHRzLmNyZWF0ZU9iamVjdExpdGVyYWwoZXhwci5lbnRyaWVzLm1hcChcbiAgICAgICAgICAgIGVudHJ5ID0+IHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudChcbiAgICAgICAgICAgICAgICBlbnRyeS5xdW90ZWQgfHwgIV9WQUxJRF9JREVOVElGSUVSX1JFLnRlc3QoZW50cnkua2V5KSA/XG4gICAgICAgICAgICAgICAgICAgIHRzLmNyZWF0ZUxpdGVyYWwoZW50cnkua2V5KSA6XG4gICAgICAgICAgICAgICAgICAgIGVudHJ5LmtleSxcbiAgICAgICAgICAgICAgICBlbnRyeS52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgbnVsbCkpKSkpO1xuICB9XG5cbiAgdmlzaXRDb21tYUV4cHIoZXhwcjogQ29tbWFFeHByKTogUmVjb3JkZWROb2RlPHRzLkV4cHJlc3Npb24+IHtcbiAgICByZXR1cm4gdGhpcy5wb3N0UHJvY2VzcyhcbiAgICAgICAgZXhwcixcbiAgICAgICAgZXhwci5wYXJ0cy5tYXAoZSA9PiBlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBudWxsKSlcbiAgICAgICAgICAgIC5yZWR1Y2U8dHMuRXhwcmVzc2lvbnxudWxsPihcbiAgICAgICAgICAgICAgICAobGVmdCwgcmlnaHQpID0+XG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPyB0cy5jcmVhdGVCaW5hcnkobGVmdCwgdHMuU3ludGF4S2luZC5Db21tYVRva2VuLCByaWdodCkgOiByaWdodCxcbiAgICAgICAgICAgICAgICBudWxsKSk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN0YXRlbWVudHMoc3RhdGVtZW50czogU3RhdGVtZW50W10pOiB0cy5CbG9jayB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2l0U3RhdGVtZW50c1ByZWZpeChbXSwgc3RhdGVtZW50cyk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFN0YXRlbWVudHNQcmVmaXgocHJlZml4OiB0cy5TdGF0ZW1lbnRbXSwgc3RhdGVtZW50czogU3RhdGVtZW50W10pIHtcbiAgICByZXR1cm4gdHMuY3JlYXRlQmxvY2soW1xuICAgICAgLi4ucHJlZml4LCAuLi5zdGF0ZW1lbnRzLm1hcChzdG10ID0+IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgbnVsbCkpLmZpbHRlcihmID0+IGYgIT0gbnVsbClcbiAgICBdKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0SWRlbnRpZmllcih2YWx1ZTogRXh0ZXJuYWxSZWZlcmVuY2UpOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBuYW1lIGNhbiBvbmx5IGJlIG51bGwgZHVyaW5nIEpJVCB3aGljaCBuZXZlciBleGVjdXRlcyB0aGlzIGNvZGUuXG4gICAgY29uc3QgbW9kdWxlTmFtZSA9IHZhbHVlLm1vZHVsZU5hbWUsIG5hbWUgPSB2YWx1ZS5uYW1lITtcbiAgICBsZXQgcHJlZml4SWRlbnQ6IHRzLklkZW50aWZpZXJ8bnVsbCA9IG51bGw7XG4gICAgaWYgKG1vZHVsZU5hbWUpIHtcbiAgICAgIGxldCBwcmVmaXggPSB0aGlzLl9pbXBvcnRzV2l0aFByZWZpeGVzLmdldChtb2R1bGVOYW1lKTtcbiAgICAgIGlmIChwcmVmaXggPT0gbnVsbCkge1xuICAgICAgICBwcmVmaXggPSBgaSR7dGhpcy5faW1wb3J0c1dpdGhQcmVmaXhlcy5zaXplfWA7XG4gICAgICAgIHRoaXMuX2ltcG9ydHNXaXRoUHJlZml4ZXMuc2V0KG1vZHVsZU5hbWUsIHByZWZpeCk7XG4gICAgICB9XG4gICAgICBwcmVmaXhJZGVudCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIocHJlZml4KTtcbiAgICB9XG4gICAgaWYgKHByZWZpeElkZW50KSB7XG4gICAgICByZXR1cm4gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocHJlZml4SWRlbnQsIG5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpZCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIobmFtZSk7XG4gICAgICBpZiAodGhpcy5fZXhwb3J0ZWRWYXJpYWJsZUlkZW50aWZpZXJzLmhhcyhuYW1lKSkge1xuICAgICAgICAvLyBJbiBvcmRlciBmb3IgdGhpcyBuZXcgaWRlbnRpZmllciBub2RlIHRvIGJlIHByb3Blcmx5IHJld3JpdHRlbiBpbiBDb21tb25KUyBvdXRwdXQsXG4gICAgICAgIC8vIGl0IG11c3QgaGF2ZSBpdHMgb3JpZ2luYWwgbm9kZSBzZXQgdG8gYSBwYXJzZWQgaW5zdGFuY2Ugb2YgdGhlIHNhbWUgaWRlbnRpZmllci5cbiAgICAgICAgdHMuc2V0T3JpZ2luYWxOb2RlKGlkLCB0aGlzLl9leHBvcnRlZFZhcmlhYmxlSWRlbnRpZmllcnMuZ2V0KG5hbWUpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0TWV0aG9kTmFtZShtZXRob2RSZWY6IHtuYW1lOiBzdHJpbmd8bnVsbDsgYnVpbHRpbjogQnVpbHRpbk1ldGhvZCB8IG51bGx9KTogc3RyaW5nIHtcbiAgaWYgKG1ldGhvZFJlZi5uYW1lKSB7XG4gICAgcmV0dXJuIG1ldGhvZFJlZi5uYW1lO1xuICB9IGVsc2Uge1xuICAgIHN3aXRjaCAobWV0aG9kUmVmLmJ1aWx0aW4pIHtcbiAgICAgIGNhc2UgQnVpbHRpbk1ldGhvZC5CaW5kOlxuICAgICAgICByZXR1cm4gJ2JpbmQnO1xuICAgICAgY2FzZSBCdWlsdGluTWV0aG9kLkNvbmNhdEFycmF5OlxuICAgICAgICByZXR1cm4gJ2NvbmNhdCc7XG4gICAgICBjYXNlIEJ1aWx0aW5NZXRob2QuU3Vic2NyaWJlT2JzZXJ2YWJsZTpcbiAgICAgICAgcmV0dXJuICdzdWJzY3JpYmUnO1xuICAgIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgbWV0aG9kIHJlZmVyZW5jZSBmb3JtJyk7XG59XG5cbmZ1bmN0aW9uIG1vZGlmaWVyRnJvbU1vZGlmaWVyKG1vZGlmaWVyOiBTdG10TW9kaWZpZXIpOiB0cy5Nb2RpZmllciB7XG4gIHN3aXRjaCAobW9kaWZpZXIpIHtcbiAgICBjYXNlIFN0bXRNb2RpZmllci5FeHBvcnRlZDpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLkV4cG9ydEtleXdvcmQpO1xuICAgIGNhc2UgU3RtdE1vZGlmaWVyLkZpbmFsOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuQ29uc3RLZXl3b3JkKTtcbiAgICBjYXNlIFN0bXRNb2RpZmllci5Qcml2YXRlOlxuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVRva2VuKHRzLlN5bnRheEtpbmQuUHJpdmF0ZUtleXdvcmQpO1xuICAgIGNhc2UgU3RtdE1vZGlmaWVyLlN0YXRpYzpcbiAgICAgIHJldHVybiB0cy5jcmVhdGVUb2tlbih0cy5TeW50YXhLaW5kLlN0YXRpY0tleXdvcmQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZU1vZGlmaWVycyhtb2RpZmllcnM6IFN0bXRNb2RpZmllcltdfG51bGwpOiB0cy5Nb2RpZmllcltdfHVuZGVmaW5lZCB7XG4gIHJldHVybiBtb2RpZmllcnMgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG1vZGlmaWVycyEubWFwKG1vZGlmaWVyRnJvbU1vZGlmaWVyKTtcbn1cbiJdfQ==