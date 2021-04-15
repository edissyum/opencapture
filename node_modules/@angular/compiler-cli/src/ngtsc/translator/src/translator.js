(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/compiler-cli/src/ngtsc/translator/src/translator", ["require", "exports", "tslib", "@angular/compiler"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExpressionTranslatorVisitor = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var o = require("@angular/compiler");
    var UNARY_OPERATORS = new Map([
        [o.UnaryOperator.Minus, '-'],
        [o.UnaryOperator.Plus, '+'],
    ]);
    var BINARY_OPERATORS = new Map([
        [o.BinaryOperator.And, '&&'],
        [o.BinaryOperator.Bigger, '>'],
        [o.BinaryOperator.BiggerEquals, '>='],
        [o.BinaryOperator.BitwiseAnd, '&'],
        [o.BinaryOperator.Divide, '/'],
        [o.BinaryOperator.Equals, '=='],
        [o.BinaryOperator.Identical, '==='],
        [o.BinaryOperator.Lower, '<'],
        [o.BinaryOperator.LowerEquals, '<='],
        [o.BinaryOperator.Minus, '-'],
        [o.BinaryOperator.Modulo, '%'],
        [o.BinaryOperator.Multiply, '*'],
        [o.BinaryOperator.NotEquals, '!='],
        [o.BinaryOperator.NotIdentical, '!=='],
        [o.BinaryOperator.Or, '||'],
        [o.BinaryOperator.Plus, '+'],
    ]);
    var ExpressionTranslatorVisitor = /** @class */ (function () {
        function ExpressionTranslatorVisitor(factory, imports, options) {
            this.factory = factory;
            this.imports = imports;
            this.downlevelLocalizedStrings = options.downlevelLocalizedStrings === true;
            this.downlevelVariableDeclarations = options.downlevelVariableDeclarations === true;
            this.recordWrappedNodeExpr = options.recordWrappedNodeExpr || (function () { });
        }
        ExpressionTranslatorVisitor.prototype.visitDeclareVarStmt = function (stmt, context) {
            var _a;
            var varType = this.downlevelVariableDeclarations ?
                'var' :
                stmt.hasModifier(o.StmtModifier.Final) ? 'const' : 'let';
            return this.attachComments(this.factory.createVariableDeclaration(stmt.name, (_a = stmt.value) === null || _a === void 0 ? void 0 : _a.visitExpression(this, context.withExpressionMode), varType), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitDeclareFunctionStmt = function (stmt, context) {
            return this.attachComments(this.factory.createFunctionDeclaration(stmt.name, stmt.params.map(function (param) { return param.name; }), this.factory.createBlock(this.visitStatements(stmt.statements, context.withStatementMode))), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitExpressionStmt = function (stmt, context) {
            return this.attachComments(this.factory.createExpressionStatement(stmt.expr.visitExpression(this, context.withStatementMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitReturnStmt = function (stmt, context) {
            return this.attachComments(this.factory.createReturnStatement(stmt.value.visitExpression(this, context.withExpressionMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitDeclareClassStmt = function (_stmt, _context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitIfStmt = function (stmt, context) {
            return this.attachComments(this.factory.createIfStatement(stmt.condition.visitExpression(this, context), this.factory.createBlock(this.visitStatements(stmt.trueCase, context.withStatementMode)), stmt.falseCase.length > 0 ? this.factory.createBlock(this.visitStatements(stmt.falseCase, context.withStatementMode)) :
                null), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitTryCatchStmt = function (_stmt, _context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitThrowStmt = function (stmt, context) {
            return this.attachComments(this.factory.createThrowStatement(stmt.error.visitExpression(this, context.withExpressionMode)), stmt.leadingComments);
        };
        ExpressionTranslatorVisitor.prototype.visitReadVarExpr = function (ast, _context) {
            var identifier = this.factory.createIdentifier(ast.name);
            this.setSourceMapRange(identifier, ast.sourceSpan);
            return identifier;
        };
        ExpressionTranslatorVisitor.prototype.visitWriteVarExpr = function (expr, context) {
            var assignment = this.factory.createAssignment(this.setSourceMapRange(this.factory.createIdentifier(expr.name), expr.sourceSpan), expr.value.visitExpression(this, context));
            return context.isStatement ? assignment :
                this.factory.createParenthesizedExpression(assignment);
        };
        ExpressionTranslatorVisitor.prototype.visitWriteKeyExpr = function (expr, context) {
            var exprContext = context.withExpressionMode;
            var target = this.factory.createElementAccess(expr.receiver.visitExpression(this, exprContext), expr.index.visitExpression(this, exprContext));
            var assignment = this.factory.createAssignment(target, expr.value.visitExpression(this, exprContext));
            return context.isStatement ? assignment :
                this.factory.createParenthesizedExpression(assignment);
        };
        ExpressionTranslatorVisitor.prototype.visitWritePropExpr = function (expr, context) {
            var target = this.factory.createPropertyAccess(expr.receiver.visitExpression(this, context), expr.name);
            return this.factory.createAssignment(target, expr.value.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitInvokeMethodExpr = function (ast, context) {
            var _this = this;
            var target = ast.receiver.visitExpression(this, context);
            return this.setSourceMapRange(this.factory.createCallExpression(ast.name !== null ? this.factory.createPropertyAccess(target, ast.name) : target, ast.args.map(function (arg) { return arg.visitExpression(_this, context); }), 
            /* pure */ false), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitInvokeFunctionExpr = function (ast, context) {
            var _this = this;
            return this.setSourceMapRange(this.factory.createCallExpression(ast.fn.visitExpression(this, context), ast.args.map(function (arg) { return arg.visitExpression(_this, context); }), ast.pure), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitInstantiateExpr = function (ast, context) {
            var _this = this;
            return this.factory.createNewExpression(ast.classExpr.visitExpression(this, context), ast.args.map(function (arg) { return arg.visitExpression(_this, context); }));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralExpr = function (ast, _context) {
            return this.setSourceMapRange(this.factory.createLiteral(ast.value), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitLocalizedString = function (ast, context) {
            // A `$localize` message consists of `messageParts` and `expressions`, which get interleaved
            // together. The interleaved pieces look like:
            // `[messagePart0, expression0, messagePart1, expression1, messagePart2]`
            //
            // Note that there is always a message part at the start and end, and so therefore
            // `messageParts.length === expressions.length + 1`.
            //
            // Each message part may be prefixed with "metadata", which is wrapped in colons (:) delimiters.
            // The metadata is attached to the first and subsequent message parts by calls to
            // `serializeI18nHead()` and `serializeI18nTemplatePart()` respectively.
            //
            // The first message part (i.e. `ast.messageParts[0]`) is used to initialize `messageParts`
            // array.
            var elements = [createTemplateElement(ast.serializeI18nHead())];
            var expressions = [];
            for (var i = 0; i < ast.expressions.length; i++) {
                var placeholder = this.setSourceMapRange(ast.expressions[i].visitExpression(this, context), ast.getPlaceholderSourceSpan(i));
                expressions.push(placeholder);
                elements.push(createTemplateElement(ast.serializeI18nTemplatePart(i + 1)));
            }
            var localizeTag = this.factory.createIdentifier('$localize');
            // Now choose which implementation to use to actually create the necessary AST nodes.
            var localizeCall = this.downlevelLocalizedStrings ?
                this.createES5TaggedTemplateFunctionCall(localizeTag, { elements: elements, expressions: expressions }) :
                this.factory.createTaggedTemplate(localizeTag, { elements: elements, expressions: expressions });
            return this.setSourceMapRange(localizeCall, ast.sourceSpan);
        };
        /**
         * Translate the tagged template literal into a call that is compatible with ES5, using the
         * imported `__makeTemplateObject` helper for ES5 formatted output.
         */
        ExpressionTranslatorVisitor.prototype.createES5TaggedTemplateFunctionCall = function (tagHandler, _a) {
            var e_1, _b;
            var elements = _a.elements, expressions = _a.expressions;
            // Ensure that the `__makeTemplateObject()` helper has been imported.
            var _c = this.imports.generateNamedImport('tslib', '__makeTemplateObject'), moduleImport = _c.moduleImport, symbol = _c.symbol;
            var __makeTemplateObjectHelper = (moduleImport === null) ?
                this.factory.createIdentifier(symbol) :
                this.factory.createPropertyAccess(moduleImport, symbol);
            // Collect up the cooked and raw strings into two separate arrays.
            var cooked = [];
            var raw = [];
            try {
                for (var elements_1 = tslib_1.__values(elements), elements_1_1 = elements_1.next(); !elements_1_1.done; elements_1_1 = elements_1.next()) {
                    var element = elements_1_1.value;
                    cooked.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.cooked), element.range));
                    raw.push(this.factory.setSourceMapRange(this.factory.createLiteral(element.raw), element.range));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (elements_1_1 && !elements_1_1.done && (_b = elements_1.return)) _b.call(elements_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Generate the helper call in the form: `__makeTemplateObject([cooked], [raw]);`
            var templateHelperCall = this.factory.createCallExpression(__makeTemplateObjectHelper, [this.factory.createArrayLiteral(cooked), this.factory.createArrayLiteral(raw)], 
            /* pure */ false);
            // Finally create the tagged handler call in the form:
            // `tag(__makeTemplateObject([cooked], [raw]), ...expressions);`
            return this.factory.createCallExpression(tagHandler, tslib_1.__spread([templateHelperCall], expressions), 
            /* pure */ false);
        };
        ExpressionTranslatorVisitor.prototype.visitExternalExpr = function (ast, _context) {
            if (ast.value.name === null) {
                throw new Error("Import unknown module or symbol " + ast.value);
            }
            // If a moduleName is specified, this is a normal import. If there's no module name, it's a
            // reference to a global/ambient symbol.
            if (ast.value.moduleName !== null) {
                // This is a normal import. Find the imported module.
                var _a = this.imports.generateNamedImport(ast.value.moduleName, ast.value.name), moduleImport = _a.moduleImport, symbol = _a.symbol;
                if (moduleImport === null) {
                    // The symbol was ambient after all.
                    return this.factory.createIdentifier(symbol);
                }
                else {
                    return this.factory.createPropertyAccess(moduleImport, symbol);
                }
            }
            else {
                // The symbol is ambient, so just reference it.
                return this.factory.createIdentifier(ast.value.name);
            }
        };
        ExpressionTranslatorVisitor.prototype.visitConditionalExpr = function (ast, context) {
            var cond = ast.condition.visitExpression(this, context);
            // Ordinarily the ternary operator is right-associative. The following are equivalent:
            //   `a ? b : c ? d : e` => `a ? b : (c ? d : e)`
            //
            // However, occasionally Angular needs to produce a left-associative conditional, such as in
            // the case of a null-safe navigation production: `{{a?.b ? c : d}}`. This template produces
            // a ternary of the form:
            //   `a == null ? null : rest of expression`
            // If the rest of the expression is also a ternary though, this would produce the form:
            //   `a == null ? null : a.b ? c : d`
            // which, if left as right-associative, would be incorrectly associated as:
            //   `a == null ? null : (a.b ? c : d)`
            //
            // In such cases, the left-associativity needs to be enforced with parentheses:
            //   `(a == null ? null : a.b) ? c : d`
            //
            // Such parentheses could always be included in the condition (guaranteeing correct behavior) in
            // all cases, but this has a code size cost. Instead, parentheses are added only when a
            // conditional expression is directly used as the condition of another.
            //
            // TODO(alxhub): investigate better logic for precendence of conditional operators
            if (ast.condition instanceof o.ConditionalExpr) {
                // The condition of this ternary needs to be wrapped in parentheses to maintain
                // left-associativity.
                cond = this.factory.createParenthesizedExpression(cond);
            }
            return this.factory.createConditional(cond, ast.trueCase.visitExpression(this, context), ast.falseCase.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitNotExpr = function (ast, context) {
            return this.factory.createUnaryExpression('!', ast.condition.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitAssertNotNullExpr = function (ast, context) {
            return ast.condition.visitExpression(this, context);
        };
        ExpressionTranslatorVisitor.prototype.visitCastExpr = function (ast, context) {
            return ast.value.visitExpression(this, context);
        };
        ExpressionTranslatorVisitor.prototype.visitFunctionExpr = function (ast, context) {
            var _a;
            return this.factory.createFunctionExpression((_a = ast.name) !== null && _a !== void 0 ? _a : null, ast.params.map(function (param) { return param.name; }), this.factory.createBlock(this.visitStatements(ast.statements, context)));
        };
        ExpressionTranslatorVisitor.prototype.visitBinaryOperatorExpr = function (ast, context) {
            if (!BINARY_OPERATORS.has(ast.operator)) {
                throw new Error("Unknown binary operator: " + o.BinaryOperator[ast.operator]);
            }
            return this.factory.createBinaryExpression(ast.lhs.visitExpression(this, context), BINARY_OPERATORS.get(ast.operator), ast.rhs.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitReadPropExpr = function (ast, context) {
            return this.factory.createPropertyAccess(ast.receiver.visitExpression(this, context), ast.name);
        };
        ExpressionTranslatorVisitor.prototype.visitReadKeyExpr = function (ast, context) {
            return this.factory.createElementAccess(ast.receiver.visitExpression(this, context), ast.index.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralArrayExpr = function (ast, context) {
            var _this = this;
            return this.factory.createArrayLiteral(ast.entries.map(function (expr) { return _this.setSourceMapRange(expr.visitExpression(_this, context), ast.sourceSpan); }));
        };
        ExpressionTranslatorVisitor.prototype.visitLiteralMapExpr = function (ast, context) {
            var _this = this;
            var properties = ast.entries.map(function (entry) {
                return {
                    propertyName: entry.key,
                    quoted: entry.quoted,
                    value: entry.value.visitExpression(_this, context)
                };
            });
            return this.setSourceMapRange(this.factory.createObjectLiteral(properties), ast.sourceSpan);
        };
        ExpressionTranslatorVisitor.prototype.visitCommaExpr = function (ast, context) {
            throw new Error('Method not implemented.');
        };
        ExpressionTranslatorVisitor.prototype.visitWrappedNodeExpr = function (ast, _context) {
            this.recordWrappedNodeExpr(ast.node);
            return ast.node;
        };
        ExpressionTranslatorVisitor.prototype.visitTypeofExpr = function (ast, context) {
            return this.factory.createTypeOfExpression(ast.expr.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitUnaryOperatorExpr = function (ast, context) {
            if (!UNARY_OPERATORS.has(ast.operator)) {
                throw new Error("Unknown unary operator: " + o.UnaryOperator[ast.operator]);
            }
            return this.factory.createUnaryExpression(UNARY_OPERATORS.get(ast.operator), ast.expr.visitExpression(this, context));
        };
        ExpressionTranslatorVisitor.prototype.visitStatements = function (statements, context) {
            var _this = this;
            return statements.map(function (stmt) { return stmt.visitStatement(_this, context); })
                .filter(function (stmt) { return stmt !== undefined; });
        };
        ExpressionTranslatorVisitor.prototype.setSourceMapRange = function (ast, span) {
            return this.factory.setSourceMapRange(ast, createRange(span));
        };
        ExpressionTranslatorVisitor.prototype.attachComments = function (statement, leadingComments) {
            if (leadingComments !== undefined) {
                this.factory.attachComments(statement, leadingComments);
            }
            return statement;
        };
        return ExpressionTranslatorVisitor;
    }());
    exports.ExpressionTranslatorVisitor = ExpressionTranslatorVisitor;
    /**
     * Convert a cooked-raw string object into one that can be used by the AST factories.
     */
    function createTemplateElement(_a) {
        var cooked = _a.cooked, raw = _a.raw, range = _a.range;
        return { cooked: cooked, raw: raw, range: createRange(range) };
    }
    /**
     * Convert an OutputAST source-span into a range that can be used by the AST factories.
     */
    function createRange(span) {
        if (span === null) {
            return null;
        }
        var start = span.start, end = span.end;
        var _a = start.file, url = _a.url, content = _a.content;
        if (!url) {
            return null;
        }
        return {
            url: url,
            content: content,
            start: { offset: start.offset, line: start.line, column: start.col },
            end: { offset: end.offset, line: end.line, column: end.col },
        };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNsYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHJhbnNsYXRvci9zcmMvdHJhbnNsYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gscUNBQXVDO0lBTXZDLElBQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFpQztRQUM5RCxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQztLQUM1QixDQUFDLENBQUM7SUFFSCxJQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFtQztRQUNqRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUM5QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMs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QUVHO0lBQ0gsU0FBUyxxQkFBcUIsQ0FDMUIsRUFBa0Y7WUFBakYsTUFBTSxZQUFBLEVBQUUsR0FBRyxTQUFBLEVBQUUsS0FBSyxXQUFBO1FBRXJCLE9BQU8sRUFBQyxNQUFNLFFBQUEsRUFBRSxHQUFHLEtBQUEsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxXQUFXLENBQUMsSUFBNEI7UUFDL0MsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDTSxJQUFBLEtBQUssR0FBUyxJQUFJLE1BQWIsRUFBRSxHQUFHLEdBQUksSUFBSSxJQUFSLENBQVM7UUFDcEIsSUFBQSxLQUFpQixLQUFLLENBQUMsSUFBSSxFQUExQixHQUFHLFNBQUEsRUFBRSxPQUFPLGFBQWMsQ0FBQztRQUNsQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUNELE9BQU87WUFDTCxHQUFHLEtBQUE7WUFDSCxPQUFPLFNBQUE7WUFDUCxLQUFLLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBQztZQUNsRSxHQUFHLEVBQUUsRUFBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQztTQUMzRCxDQUFDO0lBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgbyBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmltcG9ydCB7QXN0RmFjdG9yeSwgQmluYXJ5T3BlcmF0b3IsIE9iamVjdExpdGVyYWxQcm9wZXJ0eSwgU291cmNlTWFwUmFuZ2UsIFRlbXBsYXRlRWxlbWVudCwgVGVtcGxhdGVMaXRlcmFsLCBVbmFyeU9wZXJhdG9yfSBmcm9tICcuL2FwaS9hc3RfZmFjdG9yeSc7XG5pbXBvcnQge0ltcG9ydEdlbmVyYXRvcn0gZnJvbSAnLi9hcGkvaW1wb3J0X2dlbmVyYXRvcic7XG5pbXBvcnQge0NvbnRleHR9IGZyb20gJy4vY29udGV4dCc7XG5cbmNvbnN0IFVOQVJZX09QRVJBVE9SUyA9IG5ldyBNYXA8by5VbmFyeU9wZXJhdG9yLCBVbmFyeU9wZXJhdG9yPihbXG4gIFtvLlVuYXJ5T3BlcmF0b3IuTWludXMsICctJ10sXG4gIFtvLlVuYXJ5T3BlcmF0b3IuUGx1cywgJysnXSxcbl0pO1xuXG5jb25zdCBCSU5BUllfT1BFUkFUT1JTID0gbmV3IE1hcDxvLkJpbmFyeU9wZXJhdG9yLCBCaW5hcnlPcGVyYXRvcj4oW1xuICBbby5CaW5hcnlPcGVyYXRvci5BbmQsICcmJiddLFxuICBbby5CaW5hcnlPcGVyYXRvci5CaWdnZXIsICc+J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkJpZ2dlckVxdWFscywgJz49J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkJpdHdpc2VBbmQsICcmJ10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkRpdmlkZSwgJy8nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuRXF1YWxzLCAnPT0nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuSWRlbnRpY2FsLCAnPT09J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLkxvd2VyLCAnPCddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Mb3dlckVxdWFscywgJzw9J10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLk1pbnVzLCAnLSddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Nb2R1bG8sICclJ10sXG4gIFtvLkJpbmFyeU9wZXJhdG9yLk11bHRpcGx5LCAnKiddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Ob3RFcXVhbHMsICchPSddLFxuICBbby5CaW5hcnlPcGVyYXRvci5Ob3RJZGVudGljYWwsICchPT0nXSxcbiAgW28uQmluYXJ5T3BlcmF0b3IuT3IsICd8fCddLFxuICBbby5CaW5hcnlPcGVyYXRvci5QbHVzLCAnKyddLFxuXSk7XG5cbmV4cG9ydCB0eXBlIFJlY29yZFdyYXBwZWROb2RlRXhwckZuPFRFeHByZXNzaW9uPiA9IChleHByOiBURXhwcmVzc2lvbikgPT4gdm9pZDtcblxuZXhwb3J0IGludGVyZmFjZSBUcmFuc2xhdG9yT3B0aW9uczxURXhwcmVzc2lvbj4ge1xuICBkb3dubGV2ZWxMb2NhbGl6ZWRTdHJpbmdzPzogYm9vbGVhbjtcbiAgZG93bmxldmVsVmFyaWFibGVEZWNsYXJhdGlvbnM/OiBib29sZWFuO1xuICByZWNvcmRXcmFwcGVkTm9kZUV4cHI/OiBSZWNvcmRXcmFwcGVkTm9kZUV4cHJGbjxURXhwcmVzc2lvbj47XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uVHJhbnNsYXRvclZpc2l0b3I8VFN0YXRlbWVudCwgVEV4cHJlc3Npb24+IGltcGxlbWVudHMgby5FeHByZXNzaW9uVmlzaXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5TdGF0ZW1lbnRWaXNpdG9yIHtcbiAgcHJpdmF0ZSBkb3dubGV2ZWxMb2NhbGl6ZWRTdHJpbmdzOiBib29sZWFuO1xuICBwcml2YXRlIGRvd25sZXZlbFZhcmlhYmxlRGVjbGFyYXRpb25zOiBib29sZWFuO1xuICBwcml2YXRlIHJlY29yZFdyYXBwZWROb2RlRXhwcjogUmVjb3JkV3JhcHBlZE5vZGVFeHByRm48VEV4cHJlc3Npb24+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBmYWN0b3J5OiBBc3RGYWN0b3J5PFRTdGF0ZW1lbnQsIFRFeHByZXNzaW9uPixcbiAgICAgIHByaXZhdGUgaW1wb3J0czogSW1wb3J0R2VuZXJhdG9yPFRFeHByZXNzaW9uPiwgb3B0aW9uczogVHJhbnNsYXRvck9wdGlvbnM8VEV4cHJlc3Npb24+KSB7XG4gICAgdGhpcy5kb3dubGV2ZWxMb2NhbGl6ZWRTdHJpbmdzID0gb3B0aW9ucy5kb3dubGV2ZWxMb2NhbGl6ZWRTdHJpbmdzID09PSB0cnVlO1xuICAgIHRoaXMuZG93bmxldmVsVmFyaWFibGVEZWNsYXJhdGlvbnMgPSBvcHRpb25zLmRvd25sZXZlbFZhcmlhYmxlRGVjbGFyYXRpb25zID09PSB0cnVlO1xuICAgIHRoaXMucmVjb3JkV3JhcHBlZE5vZGVFeHByID0gb3B0aW9ucy5yZWNvcmRXcmFwcGVkTm9kZUV4cHIgfHwgKCgpID0+IHt9KTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZVZhclN0bXQoc3RtdDogby5EZWNsYXJlVmFyU3RtdCwgY29udGV4dDogQ29udGV4dCk6IFRTdGF0ZW1lbnQge1xuICAgIGNvbnN0IHZhclR5cGUgPSB0aGlzLmRvd25sZXZlbFZhcmlhYmxlRGVjbGFyYXRpb25zID9cbiAgICAgICAgJ3ZhcicgOlxuICAgICAgICBzdG10Lmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLkZpbmFsKSA/ICdjb25zdCcgOiAnbGV0JztcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hDb21tZW50cyhcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVZhcmlhYmxlRGVjbGFyYXRpb24oXG4gICAgICAgICAgICBzdG10Lm5hbWUsIHN0bXQudmFsdWU/LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0LndpdGhFeHByZXNzaW9uTW9kZSksIHZhclR5cGUpLFxuICAgICAgICBzdG10LmxlYWRpbmdDb21tZW50cyk7XG4gIH1cblxuICB2aXNpdERlY2xhcmVGdW5jdGlvblN0bXQoc3RtdDogby5EZWNsYXJlRnVuY3Rpb25TdG10LCBjb250ZXh0OiBDb250ZXh0KTogVFN0YXRlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoQ29tbWVudHMoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVGdW5jdGlvbkRlY2xhcmF0aW9uKFxuICAgICAgICAgICAgc3RtdC5uYW1lLCBzdG10LnBhcmFtcy5tYXAocGFyYW0gPT4gcGFyYW0ubmFtZSksXG4gICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlQmxvY2soXG4gICAgICAgICAgICAgICAgdGhpcy52aXNpdFN0YXRlbWVudHMoc3RtdC5zdGF0ZW1lbnRzLCBjb250ZXh0LndpdGhTdGF0ZW1lbnRNb2RlKSkpLFxuICAgICAgICBzdG10LmxlYWRpbmdDb21tZW50cyk7XG4gIH1cblxuICB2aXNpdEV4cHJlc3Npb25TdG10KHN0bXQ6IG8uRXhwcmVzc2lvblN0YXRlbWVudCwgY29udGV4dDogQ29udGV4dCk6IFRTdGF0ZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaENvbW1lbnRzKFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlRXhwcmVzc2lvblN0YXRlbWVudChcbiAgICAgICAgICAgIHN0bXQuZXhwci52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dC53aXRoU3RhdGVtZW50TW9kZSkpLFxuICAgICAgICBzdG10LmxlYWRpbmdDb21tZW50cyk7XG4gIH1cblxuICB2aXNpdFJldHVyblN0bXQoc3RtdDogby5SZXR1cm5TdGF0ZW1lbnQsIGNvbnRleHQ6IENvbnRleHQpOiBUU3RhdGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5hdHRhY2hDb21tZW50cyhcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVJldHVyblN0YXRlbWVudChcbiAgICAgICAgICAgIHN0bXQudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQud2l0aEV4cHJlc3Npb25Nb2RlKSksXG4gICAgICAgIHN0bXQubGVhZGluZ0NvbW1lbnRzKTtcbiAgfVxuXG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChfc3RtdDogby5DbGFzc1N0bXQsIF9jb250ZXh0OiBDb250ZXh0KTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0SWZTdG10KHN0bXQ6IG8uSWZTdG10LCBjb250ZXh0OiBDb250ZXh0KTogVFN0YXRlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoQ29tbWVudHMoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVJZlN0YXRlbWVudChcbiAgICAgICAgICAgIHN0bXQuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVCbG9jayhcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2l0U3RhdGVtZW50cyhzdG10LnRydWVDYXNlLCBjb250ZXh0LndpdGhTdGF0ZW1lbnRNb2RlKSksXG4gICAgICAgICAgICBzdG10LmZhbHNlQ2FzZS5sZW5ndGggPiAwID8gdGhpcy5mYWN0b3J5LmNyZWF0ZUJsb2NrKHRoaXMudmlzaXRTdGF0ZW1lbnRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG10LmZhbHNlQ2FzZSwgY29udGV4dC53aXRoU3RhdGVtZW50TW9kZSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsKSxcbiAgICAgICAgc3RtdC5sZWFkaW5nQ29tbWVudHMpO1xuICB9XG5cbiAgdmlzaXRUcnlDYXRjaFN0bXQoX3N0bXQ6IG8uVHJ5Q2F0Y2hTdG10LCBfY29udGV4dDogQ29udGV4dCk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICB2aXNpdFRocm93U3RtdChzdG10OiBvLlRocm93U3RtdCwgY29udGV4dDogQ29udGV4dCk6IFRTdGF0ZW1lbnQge1xuICAgIHJldHVybiB0aGlzLmF0dGFjaENvbW1lbnRzKFxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlVGhyb3dTdGF0ZW1lbnQoXG4gICAgICAgICAgICBzdG10LmVycm9yLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0LndpdGhFeHByZXNzaW9uTW9kZSkpLFxuICAgICAgICBzdG10LmxlYWRpbmdDb21tZW50cyk7XG4gIH1cblxuICB2aXNpdFJlYWRWYXJFeHByKGFzdDogby5SZWFkVmFyRXhwciwgX2NvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgaWRlbnRpZmllciA9IHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKGFzdC5uYW1lISk7XG4gICAgdGhpcy5zZXRTb3VyY2VNYXBSYW5nZShpZGVudGlmaWVyLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIGlkZW50aWZpZXI7XG4gIH1cblxuICB2aXNpdFdyaXRlVmFyRXhwcihleHByOiBvLldyaXRlVmFyRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICBjb25zdCBhc3NpZ25tZW50ID0gdGhpcy5mYWN0b3J5LmNyZWF0ZUFzc2lnbm1lbnQoXG4gICAgICAgIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UodGhpcy5mYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoZXhwci5uYW1lKSwgZXhwci5zb3VyY2VTcGFuKSxcbiAgICAgICAgZXhwci52YWx1ZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgKTtcbiAgICByZXR1cm4gY29udGV4dC5pc1N0YXRlbWVudCA/IGFzc2lnbm1lbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZVBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGFzc2lnbm1lbnQpO1xuICB9XG5cbiAgdmlzaXRXcml0ZUtleUV4cHIoZXhwcjogby5Xcml0ZUtleUV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZXhwckNvbnRleHQgPSBjb250ZXh0LndpdGhFeHByZXNzaW9uTW9kZTtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmZhY3RvcnkuY3JlYXRlRWxlbWVudEFjY2VzcyhcbiAgICAgICAgZXhwci5yZWNlaXZlci52aXNpdEV4cHJlc3Npb24odGhpcywgZXhwckNvbnRleHQpLFxuICAgICAgICBleHByLmluZGV4LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBleHByQ29udGV4dCksXG4gICAgKTtcbiAgICBjb25zdCBhc3NpZ25tZW50ID1cbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUFzc2lnbm1lbnQodGFyZ2V0LCBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBleHByQ29udGV4dCkpO1xuICAgIHJldHVybiBjb250ZXh0LmlzU3RhdGVtZW50ID8gYXNzaWdubWVudCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlUGFyZW50aGVzaXplZEV4cHJlc3Npb24oYXNzaWdubWVudCk7XG4gIH1cblxuICB2aXNpdFdyaXRlUHJvcEV4cHIoZXhwcjogby5Xcml0ZVByb3BFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGNvbnN0IHRhcmdldCA9XG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhleHByLnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgZXhwci5uYW1lKTtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUFzc2lnbm1lbnQodGFyZ2V0LCBleHByLnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdEludm9rZU1ldGhvZEV4cHIoYXN0OiBvLkludm9rZU1ldGhvZEV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgICByZXR1cm4gdGhpcy5zZXRTb3VyY2VNYXBSYW5nZShcbiAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUNhbGxFeHByZXNzaW9uKFxuICAgICAgICAgICAgYXN0Lm5hbWUgIT09IG51bGwgPyB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3ModGFyZ2V0LCBhc3QubmFtZSkgOiB0YXJnZXQsXG4gICAgICAgICAgICBhc3QuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpLFxuICAgICAgICAgICAgLyogcHVyZSAqLyBmYWxzZSksXG4gICAgICAgIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0SW52b2tlRnVuY3Rpb25FeHByKGFzdDogby5JbnZva2VGdW5jdGlvbkV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgICAgICAgIGFzdC5mbi52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgICAgICBhc3QuYXJncy5tYXAoYXJnID0+IGFyZy52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCkpLCBhc3QucHVyZSksXG4gICAgICAgIGFzdC5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0SW5zdGFudGlhdGVFeHByKGFzdDogby5JbnN0YW50aWF0ZUV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVOZXdFeHByZXNzaW9uKFxuICAgICAgICBhc3QuY2xhc3NFeHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgYXN0LmFyZ3MubWFwKGFyZyA9PiBhcmcudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxFeHByKGFzdDogby5MaXRlcmFsRXhwciwgX2NvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0U291cmNlTWFwUmFuZ2UodGhpcy5mYWN0b3J5LmNyZWF0ZUxpdGVyYWwoYXN0LnZhbHVlKSwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgdmlzaXRMb2NhbGl6ZWRTdHJpbmcoYXN0OiBvLkxvY2FsaXplZFN0cmluZywgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICAvLyBBIGAkbG9jYWxpemVgIG1lc3NhZ2UgY29uc2lzdHMgb2YgYG1lc3NhZ2VQYXJ0c2AgYW5kIGBleHByZXNzaW9uc2AsIHdoaWNoIGdldCBpbnRlcmxlYXZlZFxuICAgIC8vIHRvZ2V0aGVyLiBUaGUgaW50ZXJsZWF2ZWQgcGllY2VzIGxvb2sgbGlrZTpcbiAgICAvLyBgW21lc3NhZ2VQYXJ0MCwgZXhwcmVzc2lvbjAsIG1lc3NhZ2VQYXJ0MSwgZXhwcmVzc2lvbjEsIG1lc3NhZ2VQYXJ0Ml1gXG4gICAgLy9cbiAgICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYWx3YXlzIGEgbWVzc2FnZSBwYXJ0IGF0IHRoZSBzdGFydCBhbmQgZW5kLCBhbmQgc28gdGhlcmVmb3JlXG4gICAgLy8gYG1lc3NhZ2VQYXJ0cy5sZW5ndGggPT09IGV4cHJlc3Npb25zLmxlbmd0aCArIDFgLlxuICAgIC8vXG4gICAgLy8gRWFjaCBtZXNzYWdlIHBhcnQgbWF5IGJlIHByZWZpeGVkIHdpdGggXCJtZXRhZGF0YVwiLCB3aGljaCBpcyB3cmFwcGVkIGluIGNvbG9ucyAoOikgZGVsaW1pdGVycy5cbiAgICAvLyBUaGUgbWV0YWRhdGEgaXMgYXR0YWNoZWQgdG8gdGhlIGZpcnN0IGFuZCBzdWJzZXF1ZW50IG1lc3NhZ2UgcGFydHMgYnkgY2FsbHMgdG9cbiAgICAvLyBgc2VyaWFsaXplSTE4bkhlYWQoKWAgYW5kIGBzZXJpYWxpemVJMThuVGVtcGxhdGVQYXJ0KClgIHJlc3BlY3RpdmVseS5cbiAgICAvL1xuICAgIC8vIFRoZSBmaXJzdCBtZXNzYWdlIHBhcnQgKGkuZS4gYGFzdC5tZXNzYWdlUGFydHNbMF1gKSBpcyB1c2VkIHRvIGluaXRpYWxpemUgYG1lc3NhZ2VQYXJ0c2BcbiAgICAvLyBhcnJheS5cbiAgICBjb25zdCBlbGVtZW50czogVGVtcGxhdGVFbGVtZW50W10gPSBbY3JlYXRlVGVtcGxhdGVFbGVtZW50KGFzdC5zZXJpYWxpemVJMThuSGVhZCgpKV07XG4gICAgY29uc3QgZXhwcmVzc2lvbnM6IFRFeHByZXNzaW9uW10gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFzdC5leHByZXNzaW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKFxuICAgICAgICAgIGFzdC5leHByZXNzaW9uc1tpXS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksIGFzdC5nZXRQbGFjZWhvbGRlclNvdXJjZVNwYW4oaSkpO1xuICAgICAgZXhwcmVzc2lvbnMucHVzaChwbGFjZWhvbGRlcik7XG4gICAgICBlbGVtZW50cy5wdXNoKGNyZWF0ZVRlbXBsYXRlRWxlbWVudChhc3Quc2VyaWFsaXplSTE4blRlbXBsYXRlUGFydChpICsgMSkpKTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NhbGl6ZVRhZyA9IHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKCckbG9jYWxpemUnKTtcblxuICAgIC8vIE5vdyBjaG9vc2Ugd2hpY2ggaW1wbGVtZW50YXRpb24gdG8gdXNlIHRvIGFjdHVhbGx5IGNyZWF0ZSB0aGUgbmVjZXNzYXJ5IEFTVCBub2Rlcy5cbiAgICBjb25zdCBsb2NhbGl6ZUNhbGwgPSB0aGlzLmRvd25sZXZlbExvY2FsaXplZFN0cmluZ3MgP1xuICAgICAgICB0aGlzLmNyZWF0ZUVTNVRhZ2dlZFRlbXBsYXRlRnVuY3Rpb25DYWxsKGxvY2FsaXplVGFnLCB7ZWxlbWVudHMsIGV4cHJlc3Npb25zfSkgOlxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlVGFnZ2VkVGVtcGxhdGUobG9jYWxpemVUYWcsIHtlbGVtZW50cywgZXhwcmVzc2lvbnN9KTtcblxuICAgIHJldHVybiB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKGxvY2FsaXplQ2FsbCwgYXN0LnNvdXJjZVNwYW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zbGF0ZSB0aGUgdGFnZ2VkIHRlbXBsYXRlIGxpdGVyYWwgaW50byBhIGNhbGwgdGhhdCBpcyBjb21wYXRpYmxlIHdpdGggRVM1LCB1c2luZyB0aGVcbiAgICogaW1wb3J0ZWQgYF9fbWFrZVRlbXBsYXRlT2JqZWN0YCBoZWxwZXIgZm9yIEVTNSBmb3JtYXR0ZWQgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSBjcmVhdGVFUzVUYWdnZWRUZW1wbGF0ZUZ1bmN0aW9uQ2FsbChcbiAgICAgIHRhZ0hhbmRsZXI6IFRFeHByZXNzaW9uLCB7ZWxlbWVudHMsIGV4cHJlc3Npb25zfTogVGVtcGxhdGVMaXRlcmFsPFRFeHByZXNzaW9uPik6IFRFeHByZXNzaW9uIHtcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgYF9fbWFrZVRlbXBsYXRlT2JqZWN0KClgIGhlbHBlciBoYXMgYmVlbiBpbXBvcnRlZC5cbiAgICBjb25zdCB7bW9kdWxlSW1wb3J0LCBzeW1ib2x9ID1cbiAgICAgICAgdGhpcy5pbXBvcnRzLmdlbmVyYXRlTmFtZWRJbXBvcnQoJ3RzbGliJywgJ19fbWFrZVRlbXBsYXRlT2JqZWN0Jyk7XG4gICAgY29uc3QgX19tYWtlVGVtcGxhdGVPYmplY3RIZWxwZXIgPSAobW9kdWxlSW1wb3J0ID09PSBudWxsKSA/XG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKHN5bWJvbCkgOlxuICAgICAgICB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3MobW9kdWxlSW1wb3J0LCBzeW1ib2wpO1xuXG4gICAgLy8gQ29sbGVjdCB1cCB0aGUgY29va2VkIGFuZCByYXcgc3RyaW5ncyBpbnRvIHR3byBzZXBhcmF0ZSBhcnJheXMuXG4gICAgY29uc3QgY29va2VkOiBURXhwcmVzc2lvbltdID0gW107XG4gICAgY29uc3QgcmF3OiBURXhwcmVzc2lvbltdID0gW107XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBjb29rZWQucHVzaCh0aGlzLmZhY3Rvcnkuc2V0U291cmNlTWFwUmFuZ2UoXG4gICAgICAgICAgdGhpcy5mYWN0b3J5LmNyZWF0ZUxpdGVyYWwoZWxlbWVudC5jb29rZWQpLCBlbGVtZW50LnJhbmdlKSk7XG4gICAgICByYXcucHVzaChcbiAgICAgICAgICB0aGlzLmZhY3Rvcnkuc2V0U291cmNlTWFwUmFuZ2UodGhpcy5mYWN0b3J5LmNyZWF0ZUxpdGVyYWwoZWxlbWVudC5yYXcpLCBlbGVtZW50LnJhbmdlKSk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdGhlIGhlbHBlciBjYWxsIGluIHRoZSBmb3JtOiBgX19tYWtlVGVtcGxhdGVPYmplY3QoW2Nvb2tlZF0sIFtyYXddKTtgXG4gICAgY29uc3QgdGVtcGxhdGVIZWxwZXJDYWxsID0gdGhpcy5mYWN0b3J5LmNyZWF0ZUNhbGxFeHByZXNzaW9uKFxuICAgICAgICBfX21ha2VUZW1wbGF0ZU9iamVjdEhlbHBlcixcbiAgICAgICAgW3RoaXMuZmFjdG9yeS5jcmVhdGVBcnJheUxpdGVyYWwoY29va2VkKSwgdGhpcy5mYWN0b3J5LmNyZWF0ZUFycmF5TGl0ZXJhbChyYXcpXSxcbiAgICAgICAgLyogcHVyZSAqLyBmYWxzZSk7XG5cbiAgICAvLyBGaW5hbGx5IGNyZWF0ZSB0aGUgdGFnZ2VkIGhhbmRsZXIgY2FsbCBpbiB0aGUgZm9ybTpcbiAgICAvLyBgdGFnKF9fbWFrZVRlbXBsYXRlT2JqZWN0KFtjb29rZWRdLCBbcmF3XSksIC4uLmV4cHJlc3Npb25zKTtgXG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVDYWxsRXhwcmVzc2lvbihcbiAgICAgICAgdGFnSGFuZGxlciwgW3RlbXBsYXRlSGVscGVyQ2FsbCwgLi4uZXhwcmVzc2lvbnNdLFxuICAgICAgICAvKiBwdXJlICovIGZhbHNlKTtcbiAgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIsIF9jb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGlmIChhc3QudmFsdWUubmFtZSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbXBvcnQgdW5rbm93biBtb2R1bGUgb3Igc3ltYm9sICR7YXN0LnZhbHVlfWApO1xuICAgIH1cbiAgICAvLyBJZiBhIG1vZHVsZU5hbWUgaXMgc3BlY2lmaWVkLCB0aGlzIGlzIGEgbm9ybWFsIGltcG9ydC4gSWYgdGhlcmUncyBubyBtb2R1bGUgbmFtZSwgaXQncyBhXG4gICAgLy8gcmVmZXJlbmNlIHRvIGEgZ2xvYmFsL2FtYmllbnQgc3ltYm9sLlxuICAgIGlmIChhc3QudmFsdWUubW9kdWxlTmFtZSAhPT0gbnVsbCkge1xuICAgICAgLy8gVGhpcyBpcyBhIG5vcm1hbCBpbXBvcnQuIEZpbmQgdGhlIGltcG9ydGVkIG1vZHVsZS5cbiAgICAgIGNvbnN0IHttb2R1bGVJbXBvcnQsIHN5bWJvbH0gPVxuICAgICAgICAgIHRoaXMuaW1wb3J0cy5nZW5lcmF0ZU5hbWVkSW1wb3J0KGFzdC52YWx1ZS5tb2R1bGVOYW1lLCBhc3QudmFsdWUubmFtZSk7XG4gICAgICBpZiAobW9kdWxlSW1wb3J0ID09PSBudWxsKSB7XG4gICAgICAgIC8vIFRoZSBzeW1ib2wgd2FzIGFtYmllbnQgYWZ0ZXIgYWxsLlxuICAgICAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUlkZW50aWZpZXIoc3ltYm9sKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3MobW9kdWxlSW1wb3J0LCBzeW1ib2wpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgc3ltYm9sIGlzIGFtYmllbnQsIHNvIGp1c3QgcmVmZXJlbmNlIGl0LlxuICAgICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVJZGVudGlmaWVyKGFzdC52YWx1ZS5uYW1lKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdENvbmRpdGlvbmFsRXhwcihhc3Q6IG8uQ29uZGl0aW9uYWxFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIGxldCBjb25kOiBURXhwcmVzc2lvbiA9IGFzdC5jb25kaXRpb24udmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuXG4gICAgLy8gT3JkaW5hcmlseSB0aGUgdGVybmFyeSBvcGVyYXRvciBpcyByaWdodC1hc3NvY2lhdGl2ZS4gVGhlIGZvbGxvd2luZyBhcmUgZXF1aXZhbGVudDpcbiAgICAvLyAgIGBhID8gYiA6IGMgPyBkIDogZWAgPT4gYGEgPyBiIDogKGMgPyBkIDogZSlgXG4gICAgLy9cbiAgICAvLyBIb3dldmVyLCBvY2Nhc2lvbmFsbHkgQW5ndWxhciBuZWVkcyB0byBwcm9kdWNlIGEgbGVmdC1hc3NvY2lhdGl2ZSBjb25kaXRpb25hbCwgc3VjaCBhcyBpblxuICAgIC8vIHRoZSBjYXNlIG9mIGEgbnVsbC1zYWZlIG5hdmlnYXRpb24gcHJvZHVjdGlvbjogYHt7YT8uYiA/IGMgOiBkfX1gLiBUaGlzIHRlbXBsYXRlIHByb2R1Y2VzXG4gICAgLy8gYSB0ZXJuYXJ5IG9mIHRoZSBmb3JtOlxuICAgIC8vICAgYGEgPT0gbnVsbCA/IG51bGwgOiByZXN0IG9mIGV4cHJlc3Npb25gXG4gICAgLy8gSWYgdGhlIHJlc3Qgb2YgdGhlIGV4cHJlc3Npb24gaXMgYWxzbyBhIHRlcm5hcnkgdGhvdWdoLCB0aGlzIHdvdWxkIHByb2R1Y2UgdGhlIGZvcm06XG4gICAgLy8gICBgYSA9PSBudWxsID8gbnVsbCA6IGEuYiA/IGMgOiBkYFxuICAgIC8vIHdoaWNoLCBpZiBsZWZ0IGFzIHJpZ2h0LWFzc29jaWF0aXZlLCB3b3VsZCBiZSBpbmNvcnJlY3RseSBhc3NvY2lhdGVkIGFzOlxuICAgIC8vICAgYGEgPT0gbnVsbCA/IG51bGwgOiAoYS5iID8gYyA6IGQpYFxuICAgIC8vXG4gICAgLy8gSW4gc3VjaCBjYXNlcywgdGhlIGxlZnQtYXNzb2NpYXRpdml0eSBuZWVkcyB0byBiZSBlbmZvcmNlZCB3aXRoIHBhcmVudGhlc2VzOlxuICAgIC8vICAgYChhID09IG51bGwgPyBudWxsIDogYS5iKSA/IGMgOiBkYFxuICAgIC8vXG4gICAgLy8gU3VjaCBwYXJlbnRoZXNlcyBjb3VsZCBhbHdheXMgYmUgaW5jbHVkZWQgaW4gdGhlIGNvbmRpdGlvbiAoZ3VhcmFudGVlaW5nIGNvcnJlY3QgYmVoYXZpb3IpIGluXG4gICAgLy8gYWxsIGNhc2VzLCBidXQgdGhpcyBoYXMgYSBjb2RlIHNpemUgY29zdC4gSW5zdGVhZCwgcGFyZW50aGVzZXMgYXJlIGFkZGVkIG9ubHkgd2hlbiBhXG4gICAgLy8gY29uZGl0aW9uYWwgZXhwcmVzc2lvbiBpcyBkaXJlY3RseSB1c2VkIGFzIHRoZSBjb25kaXRpb24gb2YgYW5vdGhlci5cbiAgICAvL1xuICAgIC8vIFRPRE8oYWx4aHViKTogaW52ZXN0aWdhdGUgYmV0dGVyIGxvZ2ljIGZvciBwcmVjZW5kZW5jZSBvZiBjb25kaXRpb25hbCBvcGVyYXRvcnNcbiAgICBpZiAoYXN0LmNvbmRpdGlvbiBpbnN0YW5jZW9mIG8uQ29uZGl0aW9uYWxFeHByKSB7XG4gICAgICAvLyBUaGUgY29uZGl0aW9uIG9mIHRoaXMgdGVybmFyeSBuZWVkcyB0byBiZSB3cmFwcGVkIGluIHBhcmVudGhlc2VzIHRvIG1haW50YWluXG4gICAgICAvLyBsZWZ0LWFzc29jaWF0aXZpdHkuXG4gICAgICBjb25kID0gdGhpcy5mYWN0b3J5LmNyZWF0ZVBhcmVudGhlc2l6ZWRFeHByZXNzaW9uKGNvbmQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlQ29uZGl0aW9uYWwoXG4gICAgICAgIGNvbmQsIGFzdC50cnVlQ2FzZS52aXNpdEV4cHJlc3Npb24odGhpcywgY29udGV4dCksXG4gICAgICAgIGFzdC5mYWxzZUNhc2UhLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdE5vdEV4cHIoYXN0OiBvLk5vdEV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVVbmFyeUV4cHJlc3Npb24oJyEnLCBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdEFzc2VydE5vdE51bGxFeHByKGFzdDogby5Bc3NlcnROb3ROdWxsLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiBhc3QuY29uZGl0aW9uLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KTtcbiAgfVxuXG4gIHZpc2l0Q2FzdEV4cHIoYXN0OiBvLkNhc3RFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiBhc3QudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBvLkZ1bmN0aW9uRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUZ1bmN0aW9uRXhwcmVzc2lvbihcbiAgICAgICAgYXN0Lm5hbWUgPz8gbnVsbCwgYXN0LnBhcmFtcy5tYXAocGFyYW0gPT4gcGFyYW0ubmFtZSksXG4gICAgICAgIHRoaXMuZmFjdG9yeS5jcmVhdGVCbG9jayh0aGlzLnZpc2l0U3RhdGVtZW50cyhhc3Quc3RhdGVtZW50cywgY29udGV4dCkpKTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5T3BlcmF0b3JFeHByKGFzdDogby5CaW5hcnlPcGVyYXRvckV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgaWYgKCFCSU5BUllfT1BFUkFUT1JTLmhhcyhhc3Qub3BlcmF0b3IpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gYmluYXJ5IG9wZXJhdG9yOiAke28uQmluYXJ5T3BlcmF0b3JbYXN0Lm9wZXJhdG9yXX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVCaW5hcnlFeHByZXNzaW9uKFxuICAgICAgICBhc3QubGhzLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSxcbiAgICAgICAgQklOQVJZX09QRVJBVE9SUy5nZXQoYXN0Lm9wZXJhdG9yKSEsXG4gICAgICAgIGFzdC5yaHMudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLFxuICAgICk7XG4gIH1cblxuICB2aXNpdFJlYWRQcm9wRXhwcihhc3Q6IG8uUmVhZFByb3BFeHByLCBjb250ZXh0OiBDb250ZXh0KTogVEV4cHJlc3Npb24ge1xuICAgIHJldHVybiB0aGlzLmZhY3RvcnkuY3JlYXRlUHJvcGVydHlBY2Nlc3MoYXN0LnJlY2VpdmVyLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgYXN0Lm5hbWUpO1xuICB9XG5cbiAgdmlzaXRSZWFkS2V5RXhwcihhc3Q6IG8uUmVhZEtleUV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVFbGVtZW50QWNjZXNzKFxuICAgICAgICBhc3QucmVjZWl2ZXIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpLCBhc3QuaW5kZXgudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHZpc2l0TGl0ZXJhbEFycmF5RXhwcihhc3Q6IG8uTGl0ZXJhbEFycmF5RXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZUFycmF5TGl0ZXJhbChhc3QuZW50cmllcy5tYXAoXG4gICAgICAgIGV4cHIgPT4gdGhpcy5zZXRTb3VyY2VNYXBSYW5nZShleHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSwgYXN0LnNvdXJjZVNwYW4pKSk7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXBFeHByKGFzdDogby5MaXRlcmFsTWFwRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzOiBPYmplY3RMaXRlcmFsUHJvcGVydHk8VEV4cHJlc3Npb24+W10gPSBhc3QuZW50cmllcy5tYXAoZW50cnkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydHlOYW1lOiBlbnRyeS5rZXksXG4gICAgICAgIHF1b3RlZDogZW50cnkucXVvdGVkLFxuICAgICAgICB2YWx1ZTogZW50cnkudmFsdWUudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLnNldFNvdXJjZU1hcFJhbmdlKHRoaXMuZmFjdG9yeS5jcmVhdGVPYmplY3RMaXRlcmFsKHByb3BlcnRpZXMpLCBhc3Quc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdENvbW1hRXhwcihhc3Q6IG8uQ29tbWFFeHByLCBjb250ZXh0OiBDb250ZXh0KTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0V3JhcHBlZE5vZGVFeHByKGFzdDogby5XcmFwcGVkTm9kZUV4cHI8YW55PiwgX2NvbnRleHQ6IENvbnRleHQpOiBhbnkge1xuICAgIHRoaXMucmVjb3JkV3JhcHBlZE5vZGVFeHByKGFzdC5ub2RlKTtcbiAgICByZXR1cm4gYXN0Lm5vZGU7XG4gIH1cblxuICB2aXNpdFR5cGVvZkV4cHIoYXN0OiBvLlR5cGVvZkV4cHIsIGNvbnRleHQ6IENvbnRleHQpOiBURXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIHRoaXMuZmFjdG9yeS5jcmVhdGVUeXBlT2ZFeHByZXNzaW9uKGFzdC5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSk7XG4gIH1cblxuICB2aXNpdFVuYXJ5T3BlcmF0b3JFeHByKGFzdDogby5VbmFyeU9wZXJhdG9yRXhwciwgY29udGV4dDogQ29udGV4dCk6IFRFeHByZXNzaW9uIHtcbiAgICBpZiAoIVVOQVJZX09QRVJBVE9SUy5oYXMoYXN0Lm9wZXJhdG9yKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHVuYXJ5IG9wZXJhdG9yOiAke28uVW5hcnlPcGVyYXRvclthc3Qub3BlcmF0b3JdfWApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5mYWN0b3J5LmNyZWF0ZVVuYXJ5RXhwcmVzc2lvbihcbiAgICAgICAgVU5BUllfT1BFUkFUT1JTLmdldChhc3Qub3BlcmF0b3IpISwgYXN0LmV4cHIudmlzaXRFeHByZXNzaW9uKHRoaXMsIGNvbnRleHQpKTtcbiAgfVxuXG4gIHByaXZhdGUgdmlzaXRTdGF0ZW1lbnRzKHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIGNvbnRleHQ6IENvbnRleHQpOiBUU3RhdGVtZW50W10ge1xuICAgIHJldHVybiBzdGF0ZW1lbnRzLm1hcChzdG10ID0+IHN0bXQudmlzaXRTdGF0ZW1lbnQodGhpcywgY29udGV4dCkpXG4gICAgICAgIC5maWx0ZXIoc3RtdCA9PiBzdG10ICE9PSB1bmRlZmluZWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRTb3VyY2VNYXBSYW5nZTxUIGV4dGVuZHMgVEV4cHJlc3Npb258VFN0YXRlbWVudD4oYXN0OiBULCBzcGFuOiBvLlBhcnNlU291cmNlU3BhbnxudWxsKTpcbiAgICAgIFQge1xuICAgIHJldHVybiB0aGlzLmZhY3Rvcnkuc2V0U291cmNlTWFwUmFuZ2UoYXN0LCBjcmVhdGVSYW5nZShzcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIGF0dGFjaENvbW1lbnRzKHN0YXRlbWVudDogVFN0YXRlbWVudCwgbGVhZGluZ0NvbW1lbnRzOiBvLkxlYWRpbmdDb21tZW50W118dW5kZWZpbmVkKTpcbiAgICAgIFRTdGF0ZW1lbnQge1xuICAgIGlmIChsZWFkaW5nQ29tbWVudHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5mYWN0b3J5LmF0dGFjaENvbW1lbnRzKHN0YXRlbWVudCwgbGVhZGluZ0NvbW1lbnRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlbWVudDtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBjb29rZWQtcmF3IHN0cmluZyBvYmplY3QgaW50byBvbmUgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGUgQVNUIGZhY3Rvcmllcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlVGVtcGxhdGVFbGVtZW50KFxuICAgIHtjb29rZWQsIHJhdywgcmFuZ2V9OiB7Y29va2VkOiBzdHJpbmcsIHJhdzogc3RyaW5nLCByYW5nZTogby5QYXJzZVNvdXJjZVNwYW58bnVsbH0pOlxuICAgIFRlbXBsYXRlRWxlbWVudCB7XG4gIHJldHVybiB7Y29va2VkLCByYXcsIHJhbmdlOiBjcmVhdGVSYW5nZShyYW5nZSl9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gT3V0cHV0QVNUIHNvdXJjZS1zcGFuIGludG8gYSByYW5nZSB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoZSBBU1QgZmFjdG9yaWVzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVSYW5nZShzcGFuOiBvLlBhcnNlU291cmNlU3BhbnxudWxsKTogU291cmNlTWFwUmFuZ2V8bnVsbCB7XG4gIGlmIChzcGFuID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3Qge3N0YXJ0LCBlbmR9ID0gc3BhbjtcbiAgY29uc3Qge3VybCwgY29udGVudH0gPSBzdGFydC5maWxlO1xuICBpZiAoIXVybCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiB7XG4gICAgdXJsLFxuICAgIGNvbnRlbnQsXG4gICAgc3RhcnQ6IHtvZmZzZXQ6IHN0YXJ0Lm9mZnNldCwgbGluZTogc3RhcnQubGluZSwgY29sdW1uOiBzdGFydC5jb2x9LFxuICAgIGVuZDoge29mZnNldDogZW5kLm9mZnNldCwgbGluZTogZW5kLmxpbmUsIGNvbHVtbjogZW5kLmNvbH0sXG4gIH07XG59XG4iXX0=