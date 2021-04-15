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
        define("@angular/compiler-cli/src/ngtsc/typecheck/src/expression", ["require", "exports", "@angular/compiler", "typescript", "@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics", "@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.astToTypescript = exports.NULL_AS_ANY = void 0;
    var compiler_1 = require("@angular/compiler");
    var ts = require("typescript");
    var diagnostics_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics");
    var ts_util_1 = require("@angular/compiler-cli/src/ngtsc/typecheck/src/ts_util");
    exports.NULL_AS_ANY = ts.createAsExpression(ts.createNull(), ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword));
    var UNDEFINED = ts.createIdentifier('undefined');
    var UNARY_OPS = new Map([
        ['+', ts.SyntaxKind.PlusToken],
        ['-', ts.SyntaxKind.MinusToken],
    ]);
    var BINARY_OPS = new Map([
        ['+', ts.SyntaxKind.PlusToken],
        ['-', ts.SyntaxKind.MinusToken],
        ['<', ts.SyntaxKind.LessThanToken],
        ['>', ts.SyntaxKind.GreaterThanToken],
        ['<=', ts.SyntaxKind.LessThanEqualsToken],
        ['>=', ts.SyntaxKind.GreaterThanEqualsToken],
        ['==', ts.SyntaxKind.EqualsEqualsToken],
        ['===', ts.SyntaxKind.EqualsEqualsEqualsToken],
        ['*', ts.SyntaxKind.AsteriskToken],
        ['/', ts.SyntaxKind.SlashToken],
        ['%', ts.SyntaxKind.PercentToken],
        ['!=', ts.SyntaxKind.ExclamationEqualsToken],
        ['!==', ts.SyntaxKind.ExclamationEqualsEqualsToken],
        ['||', ts.SyntaxKind.BarBarToken],
        ['&&', ts.SyntaxKind.AmpersandAmpersandToken],
        ['&', ts.SyntaxKind.AmpersandToken],
        ['|', ts.SyntaxKind.BarToken],
    ]);
    /**
     * Convert an `AST` to TypeScript code directly, without going through an intermediate `Expression`
     * AST.
     */
    function astToTypescript(ast, maybeResolve, config) {
        var translator = new AstTranslator(maybeResolve, config);
        return translator.translate(ast);
    }
    exports.astToTypescript = astToTypescript;
    var AstTranslator = /** @class */ (function () {
        function AstTranslator(maybeResolve, config) {
            this.maybeResolve = maybeResolve;
            this.config = config;
        }
        AstTranslator.prototype.translate = function (ast) {
            // Skip over an `ASTWithSource` as its `visit` method calls directly into its ast's `visit`,
            // which would prevent any custom resolution through `maybeResolve` for that node.
            if (ast instanceof compiler_1.ASTWithSource) {
                ast = ast.ast;
            }
            // The `EmptyExpr` doesn't have a dedicated method on `AstVisitor`, so it's special cased here.
            if (ast instanceof compiler_1.EmptyExpr) {
                return UNDEFINED;
            }
            // First attempt to let any custom resolution logic provide a translation for the given node.
            var resolved = this.maybeResolve(ast);
            if (resolved !== null) {
                return resolved;
            }
            return ast.visit(this);
        };
        AstTranslator.prototype.visitUnary = function (ast) {
            var expr = this.translate(ast.expr);
            var op = UNARY_OPS.get(ast.operator);
            if (op === undefined) {
                throw new Error("Unsupported Unary.operator: " + ast.operator);
            }
            var node = diagnostics_1.wrapForDiagnostics(ts.createPrefix(op, expr));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitBinary = function (ast) {
            var lhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.left));
            var rhs = diagnostics_1.wrapForDiagnostics(this.translate(ast.right));
            var op = BINARY_OPS.get(ast.operation);
            if (op === undefined) {
                throw new Error("Unsupported Binary.operation: " + ast.operation);
            }
            var node = ts.createBinary(lhs, op, rhs);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitChain = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var node = diagnostics_1.wrapForDiagnostics(ts.createCommaList(elements));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitConditional = function (ast) {
            var condExpr = this.translate(ast.condition);
            var trueExpr = this.translate(ast.trueExp);
            // Wrap `falseExpr` in parens so that the trailing parse span info is not attributed to the
            // whole conditional.
            // In the following example, the last source span comment (5,6) could be seen as the
            // trailing comment for _either_ the whole conditional expression _or_ just the `falseExpr` that
            // is immediately before it:
            // `conditional /*1,2*/ ? trueExpr /*3,4*/ : falseExpr /*5,6*/`
            // This should be instead be `conditional /*1,2*/ ? trueExpr /*3,4*/ : (falseExpr /*5,6*/)`
            var falseExpr = diagnostics_1.wrapForTypeChecker(this.translate(ast.falseExp));
            var node = ts.createParen(ts.createConditional(condExpr, trueExpr, falseExpr));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitFunctionCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.target));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(receiver, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitImplicitReceiver = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitThisReceiver = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitInterpolation = function (ast) {
            var _this = this;
            // Build up a chain of binary + operations to simulate the string concatenation of the
            // interpolation's expressions. The chain is started using an actual string literal to ensure
            // the type is inferred as 'string'.
            return ast.expressions.reduce(function (lhs, ast) {
                return ts.createBinary(lhs, ts.SyntaxKind.PlusToken, diagnostics_1.wrapForTypeChecker(_this.translate(ast)));
            }, ts.createLiteral(''));
        };
        AstTranslator.prototype.visitKeyedRead = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var key = this.translate(ast.key);
            var node = ts.createElementAccess(receiver, key);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitKeyedWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.obj));
            var left = ts.createElementAccess(receiver, this.translate(ast.key));
            // TODO(joost): annotate `left` with the span of the element access, which is not currently
            //  available on `ast`.
            var right = this.translate(ast.value);
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(left, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralArray = function (ast) {
            var _this = this;
            var elements = ast.expressions.map(function (expr) { return _this.translate(expr); });
            var literal = ts.createArrayLiteral(elements);
            // If strictLiteralTypes is disabled, array literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralMap = function (ast) {
            var _this = this;
            var properties = ast.keys.map(function (_a, idx) {
                var key = _a.key;
                var value = _this.translate(ast.values[idx]);
                return ts.createPropertyAssignment(ts.createStringLiteral(key), value);
            });
            var literal = ts.createObjectLiteral(properties, true);
            // If strictLiteralTypes is disabled, object literals are cast to `any`.
            var node = this.config.strictLiteralTypes ? literal : ts_util_1.tsCastToAny(literal);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitLiteralPrimitive = function (ast) {
            var node;
            if (ast.value === undefined) {
                node = ts.createIdentifier('undefined');
            }
            else if (ast.value === null) {
                node = ts.createNull();
            }
            else {
                node = ts.createLiteral(ast.value);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitMethodCall = function (ast) {
            var _this = this;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var method = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            var node = ts.createCall(method, undefined, args);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitNonNullAssert = function (ast) {
            var expr = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createNonNullExpression(expr);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPipe = function (ast) {
            throw new Error('Method not implemented.');
        };
        AstTranslator.prototype.visitPrefixNot = function (ast) {
            var expression = diagnostics_1.wrapForDiagnostics(this.translate(ast.expression));
            var node = ts.createLogicalNot(expression);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyRead = function (ast) {
            // This is a normal property read - convert the receiver to an expression and emit the correct
            // TypeScript expression to read the property.
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var name = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(name, ast.nameSpan);
            var node = diagnostics_1.wrapForDiagnostics(name);
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitPropertyWrite = function (ast) {
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var left = ts.createPropertyAccess(receiver, ast.name);
            diagnostics_1.addParseSpanInfo(left, ast.nameSpan);
            // TypeScript reports assignment errors on the entire lvalue expression. Annotate the lvalue of
            // the assignment with the sourceSpan, which includes receivers, rather than nameSpan for
            // consistency of the diagnostic location.
            // a.b.c = 1
            // ^^^^^^^^^ sourceSpan
            //     ^     nameSpan
            var leftWithPath = diagnostics_1.wrapForDiagnostics(left);
            diagnostics_1.addParseSpanInfo(leftWithPath, ast.sourceSpan);
            var right = this.translate(ast.value);
            // The right needs to be wrapped in parens as well or we cannot accurately match its
            // span to just the RHS. For example, the span in `e = $event /*0,10*/` is ambiguous.
            // It could refer to either the whole binary expression or just the RHS.
            // We should instead generate `e = ($event /*0,10*/)` so we know the span 0,10 matches RHS.
            if (!ts.isParenthesizedExpression(right)) {
                right = diagnostics_1.wrapForTypeChecker(right);
            }
            var node = diagnostics_1.wrapForDiagnostics(ts.createBinary(leftWithPath, ts.SyntaxKind.EqualsToken, right));
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitQuote = function (ast) {
            return exports.NULL_AS_ANY;
        };
        AstTranslator.prototype.visitSafeMethodCall = function (ast) {
            var _this = this;
            // See the comments in SafePropertyRead above for an explanation of the cases here.
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            var args = ast.args.map(function (expr) { return _this.translate(expr); });
            if (this.config.strictSafeNavigationTypes) {
                // "a?.method(...)" becomes (null as any ? a!.method(...) : undefined)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                var call = ts.createCall(method, undefined, args);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, call, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // "a?.method(...)" becomes (a as any).method(...)
                var method = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                node = ts.createCall(method, undefined, args);
            }
            else {
                // "a?.method(...)" becomes (a!.method(...) as any)
                var method = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                diagnostics_1.addParseSpanInfo(method, ast.nameSpan);
                node = ts_util_1.tsCastToAny(ts.createCall(method, undefined, args));
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        AstTranslator.prototype.visitSafePropertyRead = function (ast) {
            var node;
            var receiver = diagnostics_1.wrapForDiagnostics(this.translate(ast.receiver));
            // The form of safe property reads depends on whether strictness is in use.
            if (this.config.strictSafeNavigationTypes) {
                // Basically, the return here is either the type of the complete expression with a null-safe
                // property read, or `undefined`. So a ternary is used to create an "or" type:
                // "a?.b" becomes (null as any ? a!.b : undefined)
                // The type of this expression is (typeof a!.b) | undefined, which is exactly as desired.
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                node = ts.createParen(ts.createConditional(exports.NULL_AS_ANY, expr, UNDEFINED));
            }
            else if (VeSafeLhsInferenceBugDetector.veWillInferAnyFor(ast)) {
                // Emulate a View Engine bug where 'any' is inferred for the left-hand side of the safe
                // navigation operation. With this bug, the type of the left-hand side is regarded as any.
                // Therefore, the left-hand side only needs repeating in the output (to validate it), and then
                // 'any' is used for the rest of the expression. This is done using a comma operator:
                // "a?.b" becomes (a as any).b, which will of course have type 'any'.
                node = ts.createPropertyAccess(ts_util_1.tsCastToAny(receiver), ast.name);
            }
            else {
                // The View Engine bug isn't active, so check the entire type of the expression, but the final
                // result is still inferred as `any`.
                // "a?.b" becomes (a!.b as any)
                var expr = ts.createPropertyAccess(ts.createNonNullExpression(receiver), ast.name);
                node = ts_util_1.tsCastToAny(expr);
            }
            diagnostics_1.addParseSpanInfo(node, ast.sourceSpan);
            return node;
        };
        return AstTranslator;
    }());
    /**
     * Checks whether View Engine will infer a type of 'any' for the left-hand side of a safe navigation
     * operation.
     *
     * In View Engine's template type-checker, certain receivers of safe navigation operations will
     * cause a temporary variable to be allocated as part of the checking expression, to save the value
     * of the receiver and use it more than once in the expression. This temporary variable has type
     * 'any'. In practice, this means certain receivers cause View Engine to not check the full
     * expression, and other receivers will receive more complete checking.
     *
     * For compatibility, this logic is adapted from View Engine's expression_converter.ts so that the
     * Ivy checker can emulate this bug when needed.
     */
    var VeSafeLhsInferenceBugDetector = /** @class */ (function () {
        function VeSafeLhsInferenceBugDetector() {
        }
        VeSafeLhsInferenceBugDetector.veWillInferAnyFor = function (ast) {
            return ast.receiver.visit(VeSafeLhsInferenceBugDetector.SINGLETON);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitUnary = function (ast) {
            return ast.expr.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitBinary = function (ast) {
            return ast.left.visit(this) || ast.right.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitChain = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitConditional = function (ast) {
            return ast.condition.visit(this) || ast.trueExp.visit(this) || ast.falseExp.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitFunctionCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitImplicitReceiver = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitThisReceiver = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitInterpolation = function (ast) {
            var _this = this;
            return ast.expressions.some(function (exp) { return exp.visit(_this); });
        };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitKeyedWrite = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralArray = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralMap = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitLiteralPrimitive = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitMethodCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPipe = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPrefixNot = function (ast) {
            return ast.expression.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitNonNullAssert = function (ast) {
            return ast.expression.visit(this);
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitPropertyWrite = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitQuote = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitSafeMethodCall = function (ast) {
            return true;
        };
        VeSafeLhsInferenceBugDetector.prototype.visitSafePropertyRead = function (ast) {
            return false;
        };
        VeSafeLhsInferenceBugDetector.SINGLETON = new VeSafeLhsInferenceBugDetector();
        return VeSafeLhsInferenceBugDetector;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyLWNsaS9zcmMvbmd0c2MvdHlwZWNoZWNrL3NyYy9leHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDhDQUF3VztJQUN4VywrQkFBaUM7SUFHakMseUZBQXVGO0lBQ3ZGLGlGQUFzQztJQUV6QixRQUFBLFdBQVcsR0FDcEIsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQy9GLElBQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUVuRCxJQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBaUM7UUFDeEQsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDOUIsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7S0FDaEMsQ0FBQyxDQUFDO0lBRUgsSUFBTSxVQUFVLEdBQUcsSUFBSSxHQUFHLENBQTRCO1FBQ3BELENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzlCLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQy9CLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ2xDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7UUFDckMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQztRQUN6QyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1FBQzVDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7UUFDdkMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztRQUM5QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztRQUNsQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUMvQixDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQztRQUNqQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDO1FBQzVDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7UUFDbkQsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUM7UUFDakMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQztRQUM3QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQztRQUNuQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQztLQUM5QixDQUFDLENBQUM7SUFFSDs7O09BR0c7SUFDSCxTQUFnQixlQUFlLENBQzNCLEdBQVEsRUFBRSxZQUFrRCxFQUM1RCxNQUEwQjtRQUM1QixJQUFNLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0QsT0FBTyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFMRCwwQ0FLQztJQUVEO1FBQ0UsdUJBQ1ksWUFBa0QsRUFDbEQsTUFBMEI7WUFEMUIsaUJBQVksR0FBWixZQUFZLENBQXNDO1lBQ2xELFdBQU0sR0FBTixNQUFNLENBQW9CO1FBQUcsQ0FBQztRQUUxQyxpQ0FBUyxHQUFULFVBQVUsR0FBUTtZQUNoQiw0RkFBNEY7WUFDNUYsa0ZBQWtGO1lBQ2xGLElBQUksR0FBRyxZQUFZLHdCQUFhLEVBQUU7Z0JBQ2hDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2FBQ2Y7WUFFRCwrRkFBK0Y7WUFDL0YsSUFBSSxHQUFHLFlBQVksb0JBQVMsRUFBRTtnQkFDNUIsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCw2RkFBNkY7WUFDN0YsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxJQUFJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JCLE9BQU8sUUFBUSxDQUFDO2FBQ2pCO1lBRUQsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLENBQUM7UUFFRCxrQ0FBVSxHQUFWLFVBQVcsR0FBVTtZQUNuQixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxJQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxJQUFJLEVBQUUsS0FBSyxTQUFTLEVBQUU7Z0JBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsaUNBQStCLEdBQUcsQ0FBQyxRQUFVLENBQUMsQ0FBQzthQUNoRTtZQUNELElBQU0sSUFBSSxHQUFHLGdDQUFrQixDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0QsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxtQ0FBVyxHQUFYLFVBQVksR0FBVztZQUNyQixJQUFNLEdBQUcsR0FBRyxnQ0FBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQU0sR0FBRyxHQUFHLGdDQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBTSxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxFQUFFLEtBQUssU0FBUyxFQUFFO2dCQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFpQyxHQUFHLENBQUMsU0FBVyxDQUFDLENBQUM7YUFDbkU7WUFDRCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0MsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxrQ0FBVSxHQUFWLFVBQVcsR0FBVTtZQUFyQixpQkFLQztZQUpDLElBQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1lBQ25FLElBQU0sSUFBSSxHQUFHLGdDQUFrQixDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM5RCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELHdDQUFnQixHQUFoQixVQUFpQixHQUFnQjtZQUMvQixJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMvQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QywyRkFBMkY7WUFDM0YscUJBQXFCO1lBQ3JCLG9GQUFvRjtZQUNwRixnR0FBZ0c7WUFDaEcsNEJBQTRCO1lBQzVCLCtEQUErRDtZQUMvRCwyRkFBMkY7WUFDM0YsSUFBTSxTQUFTLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDakYsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCx5Q0FBaUIsR0FBakIsVUFBa0IsR0FBaUI7WUFBbkMsaUJBTUM7WUFMQyxJQUFNLFFBQVEsR0FBRyxnQ0FBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1lBQ3hELElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELDZDQUFxQixHQUFyQixVQUFzQixHQUFxQjtZQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELHlDQUFpQixHQUFqQixVQUFrQixHQUFpQjtZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELDBDQUFrQixHQUFsQixVQUFtQixHQUFrQjtZQUFyQyxpQkFRQztZQVBDLHNGQUFzRjtZQUN0Riw2RkFBNkY7WUFDN0Ysb0NBQW9DO1lBQ3BDLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQ3pCLFVBQUMsR0FBRyxFQUFFLEdBQUc7Z0JBQ0wsT0FBQSxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxnQ0FBa0IsQ0FBQyxLQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFBdEYsQ0FBc0YsRUFDMUYsRUFBRSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFFRCxzQ0FBYyxHQUFkLFVBQWUsR0FBYztZQUMzQixJQUFNLFFBQVEsR0FBRyxnQ0FBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3BDLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDbkQsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCx1Q0FBZSxHQUFmLFVBQWdCLEdBQWU7WUFDN0IsSUFBTSxRQUFRLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdkUsMkZBQTJGO1lBQzNGLHVCQUF1QjtZQUN2QixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QyxJQUFNLElBQUksR0FBRyxnQ0FBa0IsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLDhCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQseUNBQWlCLEdBQWpCLFVBQWtCLEdBQWlCO1lBQW5DLGlCQU9DO1lBTkMsSUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFwQixDQUFvQixDQUFDLENBQUM7WUFDbkUsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELHVFQUF1RTtZQUN2RSxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHFCQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0UsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN2QyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCx1Q0FBZSxHQUFmLFVBQWdCLEdBQWU7WUFBL0IsaUJBVUM7WUFUQyxJQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQUssRUFBRSxHQUFHO29CQUFULEdBQUcsU0FBQTtnQkFDbkMsSUFBTSxLQUFLLEdBQUcsS0FBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLE9BQU8sRUFBRSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN6RSxDQUFDLENBQUMsQ0FBQztZQUNILElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekQsd0VBQXdFO1lBQ3hFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMscUJBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RSw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELDZDQUFxQixHQUFyQixVQUFzQixHQUFxQjtZQUN6QyxJQUFJLElBQW1CLENBQUM7WUFDeEIsSUFBSSxHQUFHLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDM0IsSUFBSSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUN6QztpQkFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUM3QixJQUFJLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3hCO2lCQUFNO2dCQUNMLElBQUksR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQztZQUNELDhCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsdUNBQWUsR0FBZixVQUFnQixHQUFlO1lBQS9CLGlCQVFDO1lBUEMsSUFBTSxRQUFRLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsRSxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCw4QkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZDLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxDQUFDO1lBQ3hELElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwRCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELDBDQUFrQixHQUFsQixVQUFtQixHQUFrQjtZQUNuQyxJQUFNLElBQUksR0FBRyxnQ0FBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5Qyw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELGlDQUFTLEdBQVQsVUFBVSxHQUFnQjtZQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVELHNDQUFjLEdBQWQsVUFBZSxHQUFjO1lBQzNCLElBQU0sVUFBVSxHQUFHLGdDQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzdDLDhCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQseUNBQWlCLEdBQWpCLFVBQWtCLEdBQWlCO1lBQ2pDLDhGQUE4RjtZQUM5Riw4Q0FBOEM7WUFDOUMsSUFBTSxRQUFRLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsRSxJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLElBQU0sSUFBSSxHQUFHLGdDQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RDLDhCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsMENBQWtCLEdBQWxCLFVBQW1CLEdBQWtCO1lBQ25DLElBQU0sUUFBUSxHQUFHLGdDQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekQsOEJBQWdCLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQywrRkFBK0Y7WUFDL0YseUZBQXlGO1lBQ3pGLDBDQUEwQztZQUMxQyxZQUFZO1lBQ1osdUJBQXVCO1lBQ3ZCLHFCQUFxQjtZQUNyQixJQUFNLFlBQVksR0FBRyxnQ0FBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5Qyw4QkFBZ0IsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLG9GQUFvRjtZQUNwRixxRkFBcUY7WUFDckYsd0VBQXdFO1lBQ3hFLDJGQUEyRjtZQUMzRixJQUFJLENBQUMsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN4QyxLQUFLLEdBQUcsZ0NBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbkM7WUFDRCxJQUFNLElBQUksR0FDTixnQ0FBa0IsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLDhCQUFnQixDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsa0NBQVUsR0FBVixVQUFXLEdBQVU7WUFDbkIsT0FBTyxtQkFBVyxDQUFDO1FBQ3JCLENBQUM7UUFFRCwyQ0FBbUIsR0FBbkIsVUFBb0IsR0FBbUI7WUFBdkMsaUJBd0JDO1lBdkJDLG1GQUFtRjtZQUNuRixJQUFJLElBQW1CLENBQUM7WUFDeEIsSUFBTSxRQUFRLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsRSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQXBCLENBQW9CLENBQUMsQ0FBQztZQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQXlCLEVBQUU7Z0JBQ3pDLHNFQUFzRTtnQkFDdEUsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZGLDhCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZDLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLG1CQUFXLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7YUFDM0U7aUJBQU0sSUFBSSw2QkFBNkIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDL0Qsa0RBQWtEO2dCQUNsRCxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMscUJBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hFLDhCQUFnQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDL0M7aUJBQU07Z0JBQ0wsbURBQW1EO2dCQUNuRCxJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkYsOEJBQWdCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxHQUFHLHFCQUFXLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDNUQ7WUFDRCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELDZDQUFxQixHQUFyQixVQUFzQixHQUFxQjtZQUN6QyxJQUFJLElBQW1CLENBQUM7WUFDeEIsSUFBTSxRQUFRLEdBQUcsZ0NBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsRSwyRUFBMkU7WUFDM0UsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLHlCQUF5QixFQUFFO2dCQUN6Qyw0RkFBNEY7Z0JBQzVGLDhFQUE4RTtnQkFDOUUsa0RBQWtEO2dCQUNsRCx5RkFBeUY7Z0JBQ3pGLElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyRixJQUFJLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsbUJBQVcsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUMzRTtpQkFBTSxJQUFJLDZCQUE2QixDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvRCx1RkFBdUY7Z0JBQ3ZGLDBGQUEwRjtnQkFDMUYsOEZBQThGO2dCQUM5RixxRkFBcUY7Z0JBQ3JGLHFFQUFxRTtnQkFDckUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxxQkFBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNqRTtpQkFBTTtnQkFDTCw4RkFBOEY7Z0JBQzlGLHFDQUFxQztnQkFDckMsK0JBQStCO2dCQUMvQixJQUFNLElBQUksR0FBRyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckYsSUFBSSxHQUFHLHFCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUI7WUFDRCw4QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQWxSRCxJQWtSQztJQUVEOzs7Ozs7Ozs7Ozs7T0FZRztJQUNIO1FBQUE7UUF5RUEsQ0FBQztRQXRFUSwrQ0FBaUIsR0FBeEIsVUFBeUIsR0FBb0M7WUFDM0QsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNyRSxDQUFDO1FBRUQsa0RBQVUsR0FBVixVQUFXLEdBQVU7WUFDbkIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQ0QsbURBQVcsR0FBWCxVQUFZLEdBQVc7WUFDckIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxDQUFDO1FBQ0Qsa0RBQVUsR0FBVixVQUFXLEdBQVU7WUFDbkIsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0Qsd0RBQWdCLEdBQWhCLFVBQWlCLEdBQWdCO1lBQy9CLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUNELHlEQUFpQixHQUFqQixVQUFrQixHQUFpQjtZQUNqQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCw2REFBcUIsR0FBckIsVUFBc0IsR0FBcUI7WUFDekMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QseURBQWlCLEdBQWpCLFVBQWtCLEdBQWlCO1lBQ2pDLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELDBEQUFrQixHQUFsQixVQUFtQixHQUFrQjtZQUFyQyxpQkFFQztZQURDLE9BQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUksQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxzREFBYyxHQUFkLFVBQWUsR0FBYztZQUMzQixPQUFPLEtBQUssQ0FBQztRQUNmLENBQUM7UUFDRCx1REFBZSxHQUFmLFVBQWdCLEdBQWU7WUFDN0IsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QseURBQWlCLEdBQWpCLFVBQWtCLEdBQWlCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELHVEQUFlLEdBQWYsVUFBZ0IsR0FBZTtZQUM3QixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCw2REFBcUIsR0FBckIsVUFBc0IsR0FBcUI7WUFDekMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsdURBQWUsR0FBZixVQUFnQixHQUFlO1lBQzdCLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELGlEQUFTLEdBQVQsVUFBVSxHQUFnQjtZQUN4QixPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxzREFBYyxHQUFkLFVBQWUsR0FBYztZQUMzQixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCwwREFBa0IsR0FBbEIsVUFBbUIsR0FBYztZQUMvQixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDRCx5REFBaUIsR0FBakIsVUFBa0IsR0FBaUI7WUFDakMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsMERBQWtCLEdBQWxCLFVBQW1CLEdBQWtCO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELGtEQUFVLEdBQVYsVUFBVyxHQUFVO1lBQ25CLE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQztRQUNELDJEQUFtQixHQUFuQixVQUFvQixHQUFtQjtZQUNyQyxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCw2REFBcUIsR0FBckIsVUFBc0IsR0FBcUI7WUFDekMsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBdkVjLHVDQUFTLEdBQUcsSUFBSSw2QkFBNkIsRUFBRSxDQUFDO1FBd0VqRSxvQ0FBQztLQUFBLEFBekVELElBeUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QVNULCBBc3RWaXNpdG9yLCBBU1RXaXRoU291cmNlLCBCaW5hcnksIEJpbmRpbmdQaXBlLCBDaGFpbiwgQ29uZGl0aW9uYWwsIEVtcHR5RXhwciwgRnVuY3Rpb25DYWxsLCBJbXBsaWNpdFJlY2VpdmVyLCBJbnRlcnBvbGF0aW9uLCBLZXllZFJlYWQsIEtleWVkV3JpdGUsIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgTWV0aG9kQ2FsbCwgTm9uTnVsbEFzc2VydCwgUHJlZml4Tm90LCBQcm9wZXJ0eVJlYWQsIFByb3BlcnR5V3JpdGUsIFF1b3RlLCBTYWZlTWV0aG9kQ2FsbCwgU2FmZVByb3BlcnR5UmVhZCwgVGhpc1JlY2VpdmVyLCBVbmFyeX0gZnJvbSAnQGFuZ3VsYXIvY29tcGlsZXInO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQge1R5cGVDaGVja2luZ0NvbmZpZ30gZnJvbSAnLi4vYXBpJztcblxuaW1wb3J0IHthZGRQYXJzZVNwYW5JbmZvLCB3cmFwRm9yRGlhZ25vc3RpY3MsIHdyYXBGb3JUeXBlQ2hlY2tlcn0gZnJvbSAnLi9kaWFnbm9zdGljcyc7XG5pbXBvcnQge3RzQ2FzdFRvQW55fSBmcm9tICcuL3RzX3V0aWwnO1xuXG5leHBvcnQgY29uc3QgTlVMTF9BU19BTlkgPVxuICAgIHRzLmNyZWF0ZUFzRXhwcmVzc2lvbih0cy5jcmVhdGVOdWxsKCksIHRzLmNyZWF0ZUtleXdvcmRUeXBlTm9kZSh0cy5TeW50YXhLaW5kLkFueUtleXdvcmQpKTtcbmNvbnN0IFVOREVGSU5FRCA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuXG5jb25zdCBVTkFSWV9PUFMgPSBuZXcgTWFwPHN0cmluZywgdHMuUHJlZml4VW5hcnlPcGVyYXRvcj4oW1xuICBbJysnLCB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbl0sXG4gIFsnLScsIHRzLlN5bnRheEtpbmQuTWludXNUb2tlbl0sXG5dKTtcblxuY29uc3QgQklOQVJZX09QUyA9IG5ldyBNYXA8c3RyaW5nLCB0cy5CaW5hcnlPcGVyYXRvcj4oW1xuICBbJysnLCB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbl0sXG4gIFsnLScsIHRzLlN5bnRheEtpbmQuTWludXNUb2tlbl0sXG4gIFsnPCcsIHRzLlN5bnRheEtpbmQuTGVzc1RoYW5Ub2tlbl0sXG4gIFsnPicsIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5Ub2tlbl0sXG4gIFsnPD0nLCB0cy5TeW50YXhLaW5kLkxlc3NUaGFuRXF1YWxzVG9rZW5dLFxuICBbJz49JywgdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhbkVxdWFsc1Rva2VuXSxcbiAgWyc9PScsIHRzLlN5bnRheEtpbmQuRXF1YWxzRXF1YWxzVG9rZW5dLFxuICBbJz09PScsIHRzLlN5bnRheEtpbmQuRXF1YWxzRXF1YWxzRXF1YWxzVG9rZW5dLFxuICBbJyonLCB0cy5TeW50YXhLaW5kLkFzdGVyaXNrVG9rZW5dLFxuICBbJy8nLCB0cy5TeW50YXhLaW5kLlNsYXNoVG9rZW5dLFxuICBbJyUnLCB0cy5TeW50YXhLaW5kLlBlcmNlbnRUb2tlbl0sXG4gIFsnIT0nLCB0cy5TeW50YXhLaW5kLkV4Y2xhbWF0aW9uRXF1YWxzVG9rZW5dLFxuICBbJyE9PScsIHRzLlN5bnRheEtpbmQuRXhjbGFtYXRpb25FcXVhbHNFcXVhbHNUb2tlbl0sXG4gIFsnfHwnLCB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuXSxcbiAgWycmJicsIHRzLlN5bnRheEtpbmQuQW1wZXJzYW5kQW1wZXJzYW5kVG9rZW5dLFxuICBbJyYnLCB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZFRva2VuXSxcbiAgWyd8JywgdHMuU3ludGF4S2luZC5CYXJUb2tlbl0sXG5dKTtcblxuLyoqXG4gKiBDb252ZXJ0IGFuIGBBU1RgIHRvIFR5cGVTY3JpcHQgY29kZSBkaXJlY3RseSwgd2l0aG91dCBnb2luZyB0aHJvdWdoIGFuIGludGVybWVkaWF0ZSBgRXhwcmVzc2lvbmBcbiAqIEFTVC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzdFRvVHlwZXNjcmlwdChcbiAgICBhc3Q6IEFTVCwgbWF5YmVSZXNvbHZlOiAoYXN0OiBBU1QpID0+ICh0cy5FeHByZXNzaW9uIHwgbnVsbCksXG4gICAgY29uZmlnOiBUeXBlQ2hlY2tpbmdDb25maWcpOiB0cy5FeHByZXNzaW9uIHtcbiAgY29uc3QgdHJhbnNsYXRvciA9IG5ldyBBc3RUcmFuc2xhdG9yKG1heWJlUmVzb2x2ZSwgY29uZmlnKTtcbiAgcmV0dXJuIHRyYW5zbGF0b3IudHJhbnNsYXRlKGFzdCk7XG59XG5cbmNsYXNzIEFzdFRyYW5zbGF0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIG1heWJlUmVzb2x2ZTogKGFzdDogQVNUKSA9PiAodHMuRXhwcmVzc2lvbiB8IG51bGwpLFxuICAgICAgcHJpdmF0ZSBjb25maWc6IFR5cGVDaGVja2luZ0NvbmZpZykge31cblxuICB0cmFuc2xhdGUoYXN0OiBBU1QpOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBTa2lwIG92ZXIgYW4gYEFTVFdpdGhTb3VyY2VgIGFzIGl0cyBgdmlzaXRgIG1ldGhvZCBjYWxscyBkaXJlY3RseSBpbnRvIGl0cyBhc3QncyBgdmlzaXRgLFxuICAgIC8vIHdoaWNoIHdvdWxkIHByZXZlbnQgYW55IGN1c3RvbSByZXNvbHV0aW9uIHRocm91Z2ggYG1heWJlUmVzb2x2ZWAgZm9yIHRoYXQgbm9kZS5cbiAgICBpZiAoYXN0IGluc3RhbmNlb2YgQVNUV2l0aFNvdXJjZSkge1xuICAgICAgYXN0ID0gYXN0LmFzdDtcbiAgICB9XG5cbiAgICAvLyBUaGUgYEVtcHR5RXhwcmAgZG9lc24ndCBoYXZlIGEgZGVkaWNhdGVkIG1ldGhvZCBvbiBgQXN0VmlzaXRvcmAsIHNvIGl0J3Mgc3BlY2lhbCBjYXNlZCBoZXJlLlxuICAgIGlmIChhc3QgaW5zdGFuY2VvZiBFbXB0eUV4cHIpIHtcbiAgICAgIHJldHVybiBVTkRFRklORUQ7XG4gICAgfVxuXG4gICAgLy8gRmlyc3QgYXR0ZW1wdCB0byBsZXQgYW55IGN1c3RvbSByZXNvbHV0aW9uIGxvZ2ljIHByb3ZpZGUgYSB0cmFuc2xhdGlvbiBmb3IgdGhlIGdpdmVuIG5vZGUuXG4gICAgY29uc3QgcmVzb2x2ZWQgPSB0aGlzLm1heWJlUmVzb2x2ZShhc3QpO1xuICAgIGlmIChyZXNvbHZlZCAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH1cblxuICAgIHJldHVybiBhc3QudmlzaXQodGhpcyk7XG4gIH1cblxuICB2aXNpdFVuYXJ5KGFzdDogVW5hcnkpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBleHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmV4cHIpO1xuICAgIGNvbnN0IG9wID0gVU5BUllfT1BTLmdldChhc3Qub3BlcmF0b3IpO1xuICAgIGlmIChvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIFVuYXJ5Lm9wZXJhdG9yOiAke2FzdC5vcGVyYXRvcn1gKTtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVQcmVmaXgob3AsIGV4cHIpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0QmluYXJ5KGFzdDogQmluYXJ5KTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgbGhzID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5sZWZ0KSk7XG4gICAgY29uc3QgcmhzID0gd3JhcEZvckRpYWdub3N0aWNzKHRoaXMudHJhbnNsYXRlKGFzdC5yaWdodCkpO1xuICAgIGNvbnN0IG9wID0gQklOQVJZX09QUy5nZXQoYXN0Lm9wZXJhdGlvbik7XG4gICAgaWYgKG9wID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgQmluYXJ5Lm9wZXJhdGlvbjogJHthc3Qub3BlcmF0aW9ufWApO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlQmluYXJ5KGxocywgb3AsIHJocyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdENoYWluKGFzdDogQ2hhaW4pOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBlbGVtZW50cyA9IGFzdC5leHByZXNzaW9ucy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVDb21tYUxpc3QoZWxlbWVudHMpKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGNvbmRFeHByID0gdGhpcy50cmFuc2xhdGUoYXN0LmNvbmRpdGlvbik7XG4gICAgY29uc3QgdHJ1ZUV4cHIgPSB0aGlzLnRyYW5zbGF0ZShhc3QudHJ1ZUV4cCk7XG4gICAgLy8gV3JhcCBgZmFsc2VFeHByYCBpbiBwYXJlbnMgc28gdGhhdCB0aGUgdHJhaWxpbmcgcGFyc2Ugc3BhbiBpbmZvIGlzIG5vdCBhdHRyaWJ1dGVkIHRvIHRoZVxuICAgIC8vIHdob2xlIGNvbmRpdGlvbmFsLlxuICAgIC8vIEluIHRoZSBmb2xsb3dpbmcgZXhhbXBsZSwgdGhlIGxhc3Qgc291cmNlIHNwYW4gY29tbWVudCAoNSw2KSBjb3VsZCBiZSBzZWVuIGFzIHRoZVxuICAgIC8vIHRyYWlsaW5nIGNvbW1lbnQgZm9yIF9laXRoZXJfIHRoZSB3aG9sZSBjb25kaXRpb25hbCBleHByZXNzaW9uIF9vcl8ganVzdCB0aGUgYGZhbHNlRXhwcmAgdGhhdFxuICAgIC8vIGlzIGltbWVkaWF0ZWx5IGJlZm9yZSBpdDpcbiAgICAvLyBgY29uZGl0aW9uYWwgLyoxLDIqLyA/IHRydWVFeHByIC8qMyw0Ki8gOiBmYWxzZUV4cHIgLyo1LDYqL2BcbiAgICAvLyBUaGlzIHNob3VsZCBiZSBpbnN0ZWFkIGJlIGBjb25kaXRpb25hbCAvKjEsMiovID8gdHJ1ZUV4cHIgLyozLDQqLyA6IChmYWxzZUV4cHIgLyo1LDYqLylgXG4gICAgY29uc3QgZmFsc2VFeHByID0gd3JhcEZvclR5cGVDaGVja2VyKHRoaXMudHJhbnNsYXRlKGFzdC5mYWxzZUV4cCkpO1xuICAgIGNvbnN0IG5vZGUgPSB0cy5jcmVhdGVQYXJlbih0cy5jcmVhdGVDb25kaXRpb25hbChjb25kRXhwciwgdHJ1ZUV4cHIsIGZhbHNlRXhwcikpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRGdW5jdGlvbkNhbGwoYXN0OiBGdW5jdGlvbkNhbGwpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QudGFyZ2V0ISkpO1xuICAgIGNvbnN0IGFyZ3MgPSBhc3QuYXJncy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmNyZWF0ZUNhbGwocmVjZWl2ZXIsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBJbXBsaWNpdFJlY2VpdmVyKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0VGhpc1JlY2VpdmVyKGFzdDogVGhpc1JlY2VpdmVyKTogbmV2ZXIge1xuICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIHZpc2l0SW50ZXJwb2xhdGlvbihhc3Q6IEludGVycG9sYXRpb24pOiB0cy5FeHByZXNzaW9uIHtcbiAgICAvLyBCdWlsZCB1cCBhIGNoYWluIG9mIGJpbmFyeSArIG9wZXJhdGlvbnMgdG8gc2ltdWxhdGUgdGhlIHN0cmluZyBjb25jYXRlbmF0aW9uIG9mIHRoZVxuICAgIC8vIGludGVycG9sYXRpb24ncyBleHByZXNzaW9ucy4gVGhlIGNoYWluIGlzIHN0YXJ0ZWQgdXNpbmcgYW4gYWN0dWFsIHN0cmluZyBsaXRlcmFsIHRvIGVuc3VyZVxuICAgIC8vIHRoZSB0eXBlIGlzIGluZmVycmVkIGFzICdzdHJpbmcnLlxuICAgIHJldHVybiBhc3QuZXhwcmVzc2lvbnMucmVkdWNlKFxuICAgICAgICAobGhzLCBhc3QpID0+XG4gICAgICAgICAgICB0cy5jcmVhdGVCaW5hcnkobGhzLCB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbiwgd3JhcEZvclR5cGVDaGVja2VyKHRoaXMudHJhbnNsYXRlKGFzdCkpKSxcbiAgICAgICAgdHMuY3JlYXRlTGl0ZXJhbCgnJykpO1xuICB9XG5cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBLZXllZFJlYWQpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3Qub2JqKSk7XG4gICAgY29uc3Qga2V5ID0gdGhpcy50cmFuc2xhdGUoYXN0LmtleSk7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmNyZWF0ZUVsZW1lbnRBY2Nlc3MocmVjZWl2ZXIsIGtleSk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcmVjZWl2ZXIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0Lm9iaikpO1xuICAgIGNvbnN0IGxlZnQgPSB0cy5jcmVhdGVFbGVtZW50QWNjZXNzKHJlY2VpdmVyLCB0aGlzLnRyYW5zbGF0ZShhc3Qua2V5KSk7XG4gICAgLy8gVE9ETyhqb29zdCk6IGFubm90YXRlIGBsZWZ0YCB3aXRoIHRoZSBzcGFuIG9mIHRoZSBlbGVtZW50IGFjY2Vzcywgd2hpY2ggaXMgbm90IGN1cnJlbnRseVxuICAgIC8vICBhdmFpbGFibGUgb24gYGFzdGAuXG4gICAgY29uc3QgcmlnaHQgPSB0aGlzLnRyYW5zbGF0ZShhc3QudmFsdWUpO1xuICAgIGNvbnN0IG5vZGUgPSB3cmFwRm9yRGlhZ25vc3RpY3ModHMuY3JlYXRlQmluYXJ5KGxlZnQsIHRzLlN5bnRheEtpbmQuRXF1YWxzVG9rZW4sIHJpZ2h0KSk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxBcnJheShhc3Q6IExpdGVyYWxBcnJheSk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGVsZW1lbnRzID0gYXN0LmV4cHJlc3Npb25zLm1hcChleHByID0+IHRoaXMudHJhbnNsYXRlKGV4cHIpKTtcbiAgICBjb25zdCBsaXRlcmFsID0gdHMuY3JlYXRlQXJyYXlMaXRlcmFsKGVsZW1lbnRzKTtcbiAgICAvLyBJZiBzdHJpY3RMaXRlcmFsVHlwZXMgaXMgZGlzYWJsZWQsIGFycmF5IGxpdGVyYWxzIGFyZSBjYXN0IHRvIGBhbnlgLlxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmNvbmZpZy5zdHJpY3RMaXRlcmFsVHlwZXMgPyBsaXRlcmFsIDogdHNDYXN0VG9BbnkobGl0ZXJhbCk7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdExpdGVyYWxNYXAoYXN0OiBMaXRlcmFsTWFwKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IGFzdC5rZXlzLm1hcCgoe2tleX0sIGlkeCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnRyYW5zbGF0ZShhc3QudmFsdWVzW2lkeF0pO1xuICAgICAgcmV0dXJuIHRzLmNyZWF0ZVByb3BlcnR5QXNzaWdubWVudCh0cy5jcmVhdGVTdHJpbmdMaXRlcmFsKGtleSksIHZhbHVlKTtcbiAgICB9KTtcbiAgICBjb25zdCBsaXRlcmFsID0gdHMuY3JlYXRlT2JqZWN0TGl0ZXJhbChwcm9wZXJ0aWVzLCB0cnVlKTtcbiAgICAvLyBJZiBzdHJpY3RMaXRlcmFsVHlwZXMgaXMgZGlzYWJsZWQsIG9iamVjdCBsaXRlcmFscyBhcmUgY2FzdCB0byBgYW55YC5cbiAgICBjb25zdCBub2RlID0gdGhpcy5jb25maWcuc3RyaWN0TGl0ZXJhbFR5cGVzID8gbGl0ZXJhbCA6IHRzQ2FzdFRvQW55KGxpdGVyYWwpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsUHJpbWl0aXZlKGFzdDogTGl0ZXJhbFByaW1pdGl2ZSk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGxldCBub2RlOiB0cy5FeHByZXNzaW9uO1xuICAgIGlmIChhc3QudmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9kZSA9IHRzLmNyZWF0ZUlkZW50aWZpZXIoJ3VuZGVmaW5lZCcpO1xuICAgIH0gZWxzZSBpZiAoYXN0LnZhbHVlID09PSBudWxsKSB7XG4gICAgICBub2RlID0gdHMuY3JlYXRlTnVsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gdHMuY3JlYXRlTGl0ZXJhbChhc3QudmFsdWUpO1xuICAgIH1cbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IE1ldGhvZENhbGwpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBtZXRob2QgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2VzcyhyZWNlaXZlciwgYXN0Lm5hbWUpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obWV0aG9kLCBhc3QubmFtZVNwYW4pO1xuICAgIGNvbnN0IGFyZ3MgPSBhc3QuYXJncy5tYXAoZXhwciA9PiB0aGlzLnRyYW5zbGF0ZShleHByKSk7XG4gICAgY29uc3Qgbm9kZSA9IHRzLmNyZWF0ZUNhbGwobWV0aG9kLCB1bmRlZmluZWQsIGFyZ3MpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogTm9uTnVsbEFzc2VydCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGV4cHIgPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LmV4cHJlc3Npb24pKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlTm9uTnVsbEV4cHJlc3Npb24oZXhwcik7XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cblxuICB2aXNpdFBpcGUoYXN0OiBCaW5kaW5nUGlwZSk6IG5ldmVyIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCBub3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICB2aXNpdFByZWZpeE5vdChhc3Q6IFByZWZpeE5vdCk6IHRzLkV4cHJlc3Npb24ge1xuICAgIGNvbnN0IGV4cHJlc3Npb24gPSB3cmFwRm9yRGlhZ25vc3RpY3ModGhpcy50cmFuc2xhdGUoYXN0LmV4cHJlc3Npb24pKTtcbiAgICBjb25zdCBub2RlID0gdHMuY3JlYXRlTG9naWNhbE5vdChleHByZXNzaW9uKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gVGhpcyBpcyBhIG5vcm1hbCBwcm9wZXJ0eSByZWFkIC0gY29udmVydCB0aGUgcmVjZWl2ZXIgdG8gYW4gZXhwcmVzc2lvbiBhbmQgZW1pdCB0aGUgY29ycmVjdFxuICAgIC8vIFR5cGVTY3JpcHQgZXhwcmVzc2lvbiB0byByZWFkIHRoZSBwcm9wZXJ0eS5cbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBuYW1lID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocmVjZWl2ZXIsIGFzdC5uYW1lKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5hbWUsIGFzdC5uYW1lU3Bhbik7XG4gICAgY29uc3Qgbm9kZSA9IHdyYXBGb3JEaWFnbm9zdGljcyhuYW1lKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBsZWZ0ID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MocmVjZWl2ZXIsIGFzdC5uYW1lKTtcbiAgICBhZGRQYXJzZVNwYW5JbmZvKGxlZnQsIGFzdC5uYW1lU3Bhbik7XG4gICAgLy8gVHlwZVNjcmlwdCByZXBvcnRzIGFzc2lnbm1lbnQgZXJyb3JzIG9uIHRoZSBlbnRpcmUgbHZhbHVlIGV4cHJlc3Npb24uIEFubm90YXRlIHRoZSBsdmFsdWUgb2ZcbiAgICAvLyB0aGUgYXNzaWdubWVudCB3aXRoIHRoZSBzb3VyY2VTcGFuLCB3aGljaCBpbmNsdWRlcyByZWNlaXZlcnMsIHJhdGhlciB0aGFuIG5hbWVTcGFuIGZvclxuICAgIC8vIGNvbnNpc3RlbmN5IG9mIHRoZSBkaWFnbm9zdGljIGxvY2F0aW9uLlxuICAgIC8vIGEuYi5jID0gMVxuICAgIC8vIF5eXl5eXl5eXiBzb3VyY2VTcGFuXG4gICAgLy8gICAgIF4gICAgIG5hbWVTcGFuXG4gICAgY29uc3QgbGVmdFdpdGhQYXRoID0gd3JhcEZvckRpYWdub3N0aWNzKGxlZnQpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obGVmdFdpdGhQYXRoLCBhc3Quc291cmNlU3Bhbik7XG4gICAgbGV0IHJpZ2h0ID0gdGhpcy50cmFuc2xhdGUoYXN0LnZhbHVlKTtcbiAgICAvLyBUaGUgcmlnaHQgbmVlZHMgdG8gYmUgd3JhcHBlZCBpbiBwYXJlbnMgYXMgd2VsbCBvciB3ZSBjYW5ub3QgYWNjdXJhdGVseSBtYXRjaCBpdHNcbiAgICAvLyBzcGFuIHRvIGp1c3QgdGhlIFJIUy4gRm9yIGV4YW1wbGUsIHRoZSBzcGFuIGluIGBlID0gJGV2ZW50IC8qMCwxMCovYCBpcyBhbWJpZ3VvdXMuXG4gICAgLy8gSXQgY291bGQgcmVmZXIgdG8gZWl0aGVyIHRoZSB3aG9sZSBiaW5hcnkgZXhwcmVzc2lvbiBvciBqdXN0IHRoZSBSSFMuXG4gICAgLy8gV2Ugc2hvdWxkIGluc3RlYWQgZ2VuZXJhdGUgYGUgPSAoJGV2ZW50IC8qMCwxMCovKWAgc28gd2Uga25vdyB0aGUgc3BhbiAwLDEwIG1hdGNoZXMgUkhTLlxuICAgIGlmICghdHMuaXNQYXJlbnRoZXNpemVkRXhwcmVzc2lvbihyaWdodCkpIHtcbiAgICAgIHJpZ2h0ID0gd3JhcEZvclR5cGVDaGVja2VyKHJpZ2h0KTtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9XG4gICAgICAgIHdyYXBGb3JEaWFnbm9zdGljcyh0cy5jcmVhdGVCaW5hcnkobGVmdFdpdGhQYXRoLCB0cy5TeW50YXhLaW5kLkVxdWFsc1Rva2VuLCByaWdodCkpO1xuICAgIGFkZFBhcnNlU3BhbkluZm8obm9kZSwgYXN0LnNvdXJjZVNwYW4pO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgcmV0dXJuIE5VTExfQVNfQU5ZO1xuICB9XG5cbiAgdmlzaXRTYWZlTWV0aG9kQ2FsbChhc3Q6IFNhZmVNZXRob2RDYWxsKTogdHMuRXhwcmVzc2lvbiB7XG4gICAgLy8gU2VlIHRoZSBjb21tZW50cyBpbiBTYWZlUHJvcGVydHlSZWFkIGFib3ZlIGZvciBhbiBleHBsYW5hdGlvbiBvZiB0aGUgY2FzZXMgaGVyZS5cbiAgICBsZXQgbm9kZTogdHMuRXhwcmVzc2lvbjtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICBjb25zdCBhcmdzID0gYXN0LmFyZ3MubWFwKGV4cHIgPT4gdGhpcy50cmFuc2xhdGUoZXhwcikpO1xuICAgIGlmICh0aGlzLmNvbmZpZy5zdHJpY3RTYWZlTmF2aWdhdGlvblR5cGVzKSB7XG4gICAgICAvLyBcImE/Lm1ldGhvZCguLi4pXCIgYmVjb21lcyAobnVsbCBhcyBhbnkgPyBhIS5tZXRob2QoLi4uKSA6IHVuZGVmaW5lZClcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgICAgYWRkUGFyc2VTcGFuSW5mbyhtZXRob2QsIGFzdC5uYW1lU3Bhbik7XG4gICAgICBjb25zdCBjYWxsID0gdHMuY3JlYXRlQ2FsbChtZXRob2QsIHVuZGVmaW5lZCwgYXJncyk7XG4gICAgICBub2RlID0gdHMuY3JlYXRlUGFyZW4odHMuY3JlYXRlQ29uZGl0aW9uYWwoTlVMTF9BU19BTlksIGNhbGwsIFVOREVGSU5FRCkpO1xuICAgIH0gZWxzZSBpZiAoVmVTYWZlTGhzSW5mZXJlbmNlQnVnRGV0ZWN0b3IudmVXaWxsSW5mZXJBbnlGb3IoYXN0KSkge1xuICAgICAgLy8gXCJhPy5tZXRob2QoLi4uKVwiIGJlY29tZXMgKGEgYXMgYW55KS5tZXRob2QoLi4uKVxuICAgICAgY29uc3QgbWV0aG9kID0gdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3ModHNDYXN0VG9BbnkocmVjZWl2ZXIpLCBhc3QubmFtZSk7XG4gICAgICBhZGRQYXJzZVNwYW5JbmZvKG1ldGhvZCwgYXN0Lm5hbWVTcGFuKTtcbiAgICAgIG5vZGUgPSB0cy5jcmVhdGVDYWxsKG1ldGhvZCwgdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gXCJhPy5tZXRob2QoLi4uKVwiIGJlY29tZXMgKGEhLm1ldGhvZCguLi4pIGFzIGFueSlcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgICAgYWRkUGFyc2VTcGFuSW5mbyhtZXRob2QsIGFzdC5uYW1lU3Bhbik7XG4gICAgICBub2RlID0gdHNDYXN0VG9BbnkodHMuY3JlYXRlQ2FsbChtZXRob2QsIHVuZGVmaW5lZCwgYXJncykpO1xuICAgIH1cbiAgICBhZGRQYXJzZVNwYW5JbmZvKG5vZGUsIGFzdC5zb3VyY2VTcGFuKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpOiB0cy5FeHByZXNzaW9uIHtcbiAgICBsZXQgbm9kZTogdHMuRXhwcmVzc2lvbjtcbiAgICBjb25zdCByZWNlaXZlciA9IHdyYXBGb3JEaWFnbm9zdGljcyh0aGlzLnRyYW5zbGF0ZShhc3QucmVjZWl2ZXIpKTtcbiAgICAvLyBUaGUgZm9ybSBvZiBzYWZlIHByb3BlcnR5IHJlYWRzIGRlcGVuZHMgb24gd2hldGhlciBzdHJpY3RuZXNzIGlzIGluIHVzZS5cbiAgICBpZiAodGhpcy5jb25maWcuc3RyaWN0U2FmZU5hdmlnYXRpb25UeXBlcykge1xuICAgICAgLy8gQmFzaWNhbGx5LCB0aGUgcmV0dXJuIGhlcmUgaXMgZWl0aGVyIHRoZSB0eXBlIG9mIHRoZSBjb21wbGV0ZSBleHByZXNzaW9uIHdpdGggYSBudWxsLXNhZmVcbiAgICAgIC8vIHByb3BlcnR5IHJlYWQsIG9yIGB1bmRlZmluZWRgLiBTbyBhIHRlcm5hcnkgaXMgdXNlZCB0byBjcmVhdGUgYW4gXCJvclwiIHR5cGU6XG4gICAgICAvLyBcImE/LmJcIiBiZWNvbWVzIChudWxsIGFzIGFueSA/IGEhLmIgOiB1bmRlZmluZWQpXG4gICAgICAvLyBUaGUgdHlwZSBvZiB0aGlzIGV4cHJlc3Npb24gaXMgKHR5cGVvZiBhIS5iKSB8IHVuZGVmaW5lZCwgd2hpY2ggaXMgZXhhY3RseSBhcyBkZXNpcmVkLlxuICAgICAgY29uc3QgZXhwciA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzLmNyZWF0ZU5vbk51bGxFeHByZXNzaW9uKHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgICAgbm9kZSA9IHRzLmNyZWF0ZVBhcmVuKHRzLmNyZWF0ZUNvbmRpdGlvbmFsKE5VTExfQVNfQU5ZLCBleHByLCBVTkRFRklORUQpKTtcbiAgICB9IGVsc2UgaWYgKFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yLnZlV2lsbEluZmVyQW55Rm9yKGFzdCkpIHtcbiAgICAgIC8vIEVtdWxhdGUgYSBWaWV3IEVuZ2luZSBidWcgd2hlcmUgJ2FueScgaXMgaW5mZXJyZWQgZm9yIHRoZSBsZWZ0LWhhbmQgc2lkZSBvZiB0aGUgc2FmZVxuICAgICAgLy8gbmF2aWdhdGlvbiBvcGVyYXRpb24uIFdpdGggdGhpcyBidWcsIHRoZSB0eXBlIG9mIHRoZSBsZWZ0LWhhbmQgc2lkZSBpcyByZWdhcmRlZCBhcyBhbnkuXG4gICAgICAvLyBUaGVyZWZvcmUsIHRoZSBsZWZ0LWhhbmQgc2lkZSBvbmx5IG5lZWRzIHJlcGVhdGluZyBpbiB0aGUgb3V0cHV0ICh0byB2YWxpZGF0ZSBpdCksIGFuZCB0aGVuXG4gICAgICAvLyAnYW55JyBpcyB1c2VkIGZvciB0aGUgcmVzdCBvZiB0aGUgZXhwcmVzc2lvbi4gVGhpcyBpcyBkb25lIHVzaW5nIGEgY29tbWEgb3BlcmF0b3I6XG4gICAgICAvLyBcImE/LmJcIiBiZWNvbWVzIChhIGFzIGFueSkuYiwgd2hpY2ggd2lsbCBvZiBjb3Vyc2UgaGF2ZSB0eXBlICdhbnknLlxuICAgICAgbm9kZSA9IHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKHRzQ2FzdFRvQW55KHJlY2VpdmVyKSwgYXN0Lm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgVmlldyBFbmdpbmUgYnVnIGlzbid0IGFjdGl2ZSwgc28gY2hlY2sgdGhlIGVudGlyZSB0eXBlIG9mIHRoZSBleHByZXNzaW9uLCBidXQgdGhlIGZpbmFsXG4gICAgICAvLyByZXN1bHQgaXMgc3RpbGwgaW5mZXJyZWQgYXMgYGFueWAuXG4gICAgICAvLyBcImE/LmJcIiBiZWNvbWVzIChhIS5iIGFzIGFueSlcbiAgICAgIGNvbnN0IGV4cHIgPSB0cy5jcmVhdGVQcm9wZXJ0eUFjY2Vzcyh0cy5jcmVhdGVOb25OdWxsRXhwcmVzc2lvbihyZWNlaXZlciksIGFzdC5uYW1lKTtcbiAgICAgIG5vZGUgPSB0c0Nhc3RUb0FueShleHByKTtcbiAgICB9XG4gICAgYWRkUGFyc2VTcGFuSW5mbyhub2RlLCBhc3Quc291cmNlU3Bhbik7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBWaWV3IEVuZ2luZSB3aWxsIGluZmVyIGEgdHlwZSBvZiAnYW55JyBmb3IgdGhlIGxlZnQtaGFuZCBzaWRlIG9mIGEgc2FmZSBuYXZpZ2F0aW9uXG4gKiBvcGVyYXRpb24uXG4gKlxuICogSW4gVmlldyBFbmdpbmUncyB0ZW1wbGF0ZSB0eXBlLWNoZWNrZXIsIGNlcnRhaW4gcmVjZWl2ZXJzIG9mIHNhZmUgbmF2aWdhdGlvbiBvcGVyYXRpb25zIHdpbGxcbiAqIGNhdXNlIGEgdGVtcG9yYXJ5IHZhcmlhYmxlIHRvIGJlIGFsbG9jYXRlZCBhcyBwYXJ0IG9mIHRoZSBjaGVja2luZyBleHByZXNzaW9uLCB0byBzYXZlIHRoZSB2YWx1ZVxuICogb2YgdGhlIHJlY2VpdmVyIGFuZCB1c2UgaXQgbW9yZSB0aGFuIG9uY2UgaW4gdGhlIGV4cHJlc3Npb24uIFRoaXMgdGVtcG9yYXJ5IHZhcmlhYmxlIGhhcyB0eXBlXG4gKiAnYW55Jy4gSW4gcHJhY3RpY2UsIHRoaXMgbWVhbnMgY2VydGFpbiByZWNlaXZlcnMgY2F1c2UgVmlldyBFbmdpbmUgdG8gbm90IGNoZWNrIHRoZSBmdWxsXG4gKiBleHByZXNzaW9uLCBhbmQgb3RoZXIgcmVjZWl2ZXJzIHdpbGwgcmVjZWl2ZSBtb3JlIGNvbXBsZXRlIGNoZWNraW5nLlxuICpcbiAqIEZvciBjb21wYXRpYmlsaXR5LCB0aGlzIGxvZ2ljIGlzIGFkYXB0ZWQgZnJvbSBWaWV3IEVuZ2luZSdzIGV4cHJlc3Npb25fY29udmVydGVyLnRzIHNvIHRoYXQgdGhlXG4gKiBJdnkgY2hlY2tlciBjYW4gZW11bGF0ZSB0aGlzIGJ1ZyB3aGVuIG5lZWRlZC5cbiAqL1xuY2xhc3MgVmVTYWZlTGhzSW5mZXJlbmNlQnVnRGV0ZWN0b3IgaW1wbGVtZW50cyBBc3RWaXNpdG9yIHtcbiAgcHJpdmF0ZSBzdGF0aWMgU0lOR0xFVE9OID0gbmV3IFZlU2FmZUxoc0luZmVyZW5jZUJ1Z0RldGVjdG9yKCk7XG5cbiAgc3RhdGljIHZlV2lsbEluZmVyQW55Rm9yKGFzdDogU2FmZU1ldGhvZENhbGx8U2FmZVByb3BlcnR5UmVhZCkge1xuICAgIHJldHVybiBhc3QucmVjZWl2ZXIudmlzaXQoVmVTYWZlTGhzSW5mZXJlbmNlQnVnRGV0ZWN0b3IuU0lOR0xFVE9OKTtcbiAgfVxuXG4gIHZpc2l0VW5hcnkoYXN0OiBVbmFyeSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhc3QuZXhwci52aXNpdCh0aGlzKTtcbiAgfVxuICB2aXNpdEJpbmFyeShhc3Q6IEJpbmFyeSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhc3QubGVmdC52aXNpdCh0aGlzKSB8fCBhc3QucmlnaHQudmlzaXQodGhpcyk7XG4gIH1cbiAgdmlzaXRDaGFpbihhc3Q6IENoYWluKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0Q29uZGl0aW9uYWwoYXN0OiBDb25kaXRpb25hbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhc3QuY29uZGl0aW9uLnZpc2l0KHRoaXMpIHx8IGFzdC50cnVlRXhwLnZpc2l0KHRoaXMpIHx8IGFzdC5mYWxzZUV4cC52aXNpdCh0aGlzKTtcbiAgfVxuICB2aXNpdEZ1bmN0aW9uQ2FsbChhc3Q6IEZ1bmN0aW9uQ2FsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0SW1wbGljaXRSZWNlaXZlcihhc3Q6IEltcGxpY2l0UmVjZWl2ZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmlzaXRUaGlzUmVjZWl2ZXIoYXN0OiBUaGlzUmVjZWl2ZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogSW50ZXJwb2xhdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhc3QuZXhwcmVzc2lvbnMuc29tZShleHAgPT4gZXhwLnZpc2l0KHRoaXMpKTtcbiAgfVxuICB2aXNpdEtleWVkUmVhZChhc3Q6IEtleWVkUmVhZCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBLZXllZFdyaXRlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0TGl0ZXJhbEFycmF5KGFzdDogTGl0ZXJhbEFycmF5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogTGl0ZXJhbE1hcCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IExpdGVyYWxQcmltaXRpdmUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmlzaXRNZXRob2RDYWxsKGFzdDogTWV0aG9kQ2FsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0UGlwZShhc3Q6IEJpbmRpbmdQaXBlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBQcmVmaXhOb3QpOiBib29sZWFuIHtcbiAgICByZXR1cm4gYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcyk7XG4gIH1cbiAgdmlzaXROb25OdWxsQXNzZXJ0KGFzdDogUHJlZml4Tm90KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGFzdC5leHByZXNzaW9uLnZpc2l0KHRoaXMpO1xuICB9XG4gIHZpc2l0UHJvcGVydHlSZWFkKGFzdDogUHJvcGVydHlSZWFkKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0UHJvcGVydHlXcml0ZShhc3Q6IFByb3BlcnR5V3JpdGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmlzaXRRdW90ZShhc3Q6IFF1b3RlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZpc2l0U2FmZU1ldGhvZENhbGwoYXN0OiBTYWZlTWV0aG9kQ2FsbCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZpc2l0U2FmZVByb3BlcnR5UmVhZChhc3Q6IFNhZmVQcm9wZXJ0eVJlYWQpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==