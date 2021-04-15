/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as o from './output/output_ast';
import { error } from './util';
const CONSTANT_PREFIX = '_c';
/**
 * `ConstantPool` tries to reuse literal factories when two or more literals are identical.
 * We determine whether literals are identical by creating a key out of their AST using the
 * `KeyVisitor`. This constant is used to replace dynamic expressions which can't be safely
 * converted into a key. E.g. given an expression `{foo: bar()}`, since we don't know what
 * the result of `bar` will be, we create a key that looks like `{foo: <unknown>}`. Note
 * that we use a variable, rather than something like `null` in order to avoid collisions.
 */
const UNKNOWN_VALUE_KEY = o.variable('<unknown>');
/**
 * Context to use when producing a key.
 *
 * This ensures we see the constant not the reference variable when producing
 * a key.
 */
const KEY_CONTEXT = {};
/**
 * Generally all primitive values are excluded from the `ConstantPool`, but there is an exclusion
 * for strings that reach a certain length threshold. This constant defines the length threshold for
 * strings.
 */
const POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS = 50;
/**
 * A node that is a place-holder that allows the node to be replaced when the actual
 * node is known.
 *
 * This allows the constant pool to change an expression from a direct reference to
 * a constant to a shared constant. It returns a fix-up node that is later allowed to
 * change the referenced expression.
 */
class FixupExpression extends o.Expression {
    constructor(resolved) {
        super(resolved.type);
        this.resolved = resolved;
        this.original = resolved;
    }
    visitExpression(visitor, context) {
        if (context === KEY_CONTEXT) {
            // When producing a key we want to traverse the constant not the
            // variable used to refer to it.
            return this.original.visitExpression(visitor, context);
        }
        else {
            return this.resolved.visitExpression(visitor, context);
        }
    }
    isEquivalent(e) {
        return e instanceof FixupExpression && this.resolved.isEquivalent(e.resolved);
    }
    isConstant() {
        return true;
    }
    fixup(expression) {
        this.resolved = expression;
        this.shared = true;
    }
}
/**
 * A constant pool allows a code emitter to share constant in an output context.
 *
 * The constant pool also supports sharing access to ivy definitions references.
 */
export class ConstantPool {
    constructor(isClosureCompilerEnabled = false) {
        this.isClosureCompilerEnabled = isClosureCompilerEnabled;
        this.statements = [];
        this.literals = new Map();
        this.literalFactories = new Map();
        this.injectorDefinitions = new Map();
        this.directiveDefinitions = new Map();
        this.componentDefinitions = new Map();
        this.pipeDefinitions = new Map();
        this.nextNameIndex = 0;
    }
    getConstLiteral(literal, forceShared) {
        if ((literal instanceof o.LiteralExpr && !isLongStringLiteral(literal)) ||
            literal instanceof FixupExpression) {
            // Do no put simple literals into the constant pool or try to produce a constant for a
            // reference to a constant.
            return literal;
        }
        const key = this.keyOf(literal);
        let fixup = this.literals.get(key);
        let newValue = false;
        if (!fixup) {
            fixup = new FixupExpression(literal);
            this.literals.set(key, fixup);
            newValue = true;
        }
        if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
            // Replace the expression with a variable
            const name = this.freshName();
            let definition;
            let usage;
            if (this.isClosureCompilerEnabled && isLongStringLiteral(literal)) {
                // For string literals, Closure will **always** inline the string at
                // **all** usages, duplicating it each time. For large strings, this
                // unnecessarily bloats bundle size. To work around this restriction, we
                // wrap the string in a function, and call that function for each usage.
                // This tricks Closure into using inline logic for functions instead of
                // string literals. Function calls are only inlined if the body is small
                // enough to be worth it. By doing this, very large strings will be
                // shared across multiple usages, rather than duplicating the string at
                // each usage site.
                //
                // const myStr = function() { return "very very very long string"; };
                // const usage1 = myStr();
                // const usage2 = myStr();
                definition = o.variable(name).set(new o.FunctionExpr([], // Params.
                [
                    // Statements.
                    new o.ReturnStatement(literal),
                ]));
                usage = o.variable(name).callFn([]);
            }
            else {
                // Just declare and use the variable directly, without a function call
                // indirection. This saves a few bytes and avoids an unncessary call.
                definition = o.variable(name).set(literal);
                usage = o.variable(name);
            }
            this.statements.push(definition.toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            fixup.fixup(usage);
        }
        return fixup;
    }
    getDefinition(type, kind, ctx, forceShared = false) {
        const definitions = this.definitionsOf(kind);
        let fixup = definitions.get(type);
        let newValue = false;
        if (!fixup) {
            const property = this.propertyNameOf(kind);
            fixup = new FixupExpression(ctx.importExpr(type).prop(property));
            definitions.set(type, fixup);
            newValue = true;
        }
        if ((!newValue && !fixup.shared) || (newValue && forceShared)) {
            const name = this.freshName();
            this.statements.push(o.variable(name).set(fixup.resolved).toDeclStmt(o.INFERRED_TYPE, [o.StmtModifier.Final]));
            fixup.fixup(o.variable(name));
        }
        return fixup;
    }
    getLiteralFactory(literal) {
        // Create a pure function that builds an array of a mix of constant and variable expressions
        if (literal instanceof o.LiteralArrayExpr) {
            const argumentsForKey = literal.entries.map(e => e.isConstant() ? e : UNKNOWN_VALUE_KEY);
            const key = this.keyOf(o.literalArr(argumentsForKey));
            return this._getLiteralFactory(key, literal.entries, entries => o.literalArr(entries));
        }
        else {
            const expressionForKey = o.literalMap(literal.entries.map(e => ({
                key: e.key,
                value: e.value.isConstant() ? e.value : UNKNOWN_VALUE_KEY,
                quoted: e.quoted
            })));
            const key = this.keyOf(expressionForKey);
            return this._getLiteralFactory(key, literal.entries.map(e => e.value), entries => o.literalMap(entries.map((value, index) => ({
                key: literal.entries[index].key,
                value,
                quoted: literal.entries[index].quoted
            }))));
        }
    }
    _getLiteralFactory(key, values, resultMap) {
        let literalFactory = this.literalFactories.get(key);
        const literalFactoryArguments = values.filter((e => !e.isConstant()));
        if (!literalFactory) {
            const resultExpressions = values.map((e, index) => e.isConstant() ? this.getConstLiteral(e, true) : o.variable(`a${index}`));
            const parameters = resultExpressions.filter(isVariable).map(e => new o.FnParam(e.name, o.DYNAMIC_TYPE));
            const pureFunctionDeclaration = o.fn(parameters, [new o.ReturnStatement(resultMap(resultExpressions))], o.INFERRED_TYPE);
            const name = this.freshName();
            this.statements.push(o.variable(name).set(pureFunctionDeclaration).toDeclStmt(o.INFERRED_TYPE, [
                o.StmtModifier.Final
            ]));
            literalFactory = o.variable(name);
            this.literalFactories.set(key, literalFactory);
        }
        return { literalFactory, literalFactoryArguments };
    }
    /**
     * Produce a unique name.
     *
     * The name might be unique among different prefixes if any of the prefixes end in
     * a digit so the prefix should be a constant string (not based on user input) and
     * must not end in a digit.
     */
    uniqueName(prefix) {
        return `${prefix}${this.nextNameIndex++}`;
    }
    definitionsOf(kind) {
        switch (kind) {
            case 2 /* Component */:
                return this.componentDefinitions;
            case 1 /* Directive */:
                return this.directiveDefinitions;
            case 0 /* Injector */:
                return this.injectorDefinitions;
            case 3 /* Pipe */:
                return this.pipeDefinitions;
        }
        error(`Unknown definition kind ${kind}`);
        return this.componentDefinitions;
    }
    propertyNameOf(kind) {
        switch (kind) {
            case 2 /* Component */:
                return 'ɵcmp';
            case 1 /* Directive */:
                return 'ɵdir';
            case 0 /* Injector */:
                return 'ɵinj';
            case 3 /* Pipe */:
                return 'ɵpipe';
        }
        error(`Unknown definition kind ${kind}`);
        return '<unknown>';
    }
    freshName() {
        return this.uniqueName(CONSTANT_PREFIX);
    }
    keyOf(expression) {
        return expression.visitExpression(new KeyVisitor(), KEY_CONTEXT);
    }
}
/**
 * Visitor used to determine if 2 expressions are equivalent and can be shared in the
 * `ConstantPool`.
 *
 * When the id (string) generated by the visitor is equal, expressions are considered equivalent.
 */
class KeyVisitor {
    constructor() {
        this.visitWrappedNodeExpr = invalid;
        this.visitWriteVarExpr = invalid;
        this.visitWriteKeyExpr = invalid;
        this.visitWritePropExpr = invalid;
        this.visitInvokeMethodExpr = invalid;
        this.visitInvokeFunctionExpr = invalid;
        this.visitInstantiateExpr = invalid;
        this.visitConditionalExpr = invalid;
        this.visitNotExpr = invalid;
        this.visitAssertNotNullExpr = invalid;
        this.visitCastExpr = invalid;
        this.visitFunctionExpr = invalid;
        this.visitUnaryOperatorExpr = invalid;
        this.visitBinaryOperatorExpr = invalid;
        this.visitReadPropExpr = invalid;
        this.visitReadKeyExpr = invalid;
        this.visitCommaExpr = invalid;
        this.visitLocalizedString = invalid;
    }
    visitLiteralExpr(ast) {
        return `${typeof ast.value === 'string' ? '"' + ast.value + '"' : ast.value}`;
    }
    visitLiteralArrayExpr(ast, context) {
        return `[${ast.entries.map(entry => entry.visitExpression(this, context)).join(',')}]`;
    }
    visitLiteralMapExpr(ast, context) {
        const mapKey = (entry) => {
            const quote = entry.quoted ? '"' : '';
            return `${quote}${entry.key}${quote}`;
        };
        const mapEntry = (entry) => `${mapKey(entry)}:${entry.value.visitExpression(this, context)}`;
        return `{${ast.entries.map(mapEntry).join(',')}`;
    }
    visitExternalExpr(ast) {
        return ast.value.moduleName ? `EX:${ast.value.moduleName}:${ast.value.name}` :
            `EX:${ast.value.runtime.name}`;
    }
    visitReadVarExpr(node) {
        return `VAR:${node.name}`;
    }
    visitTypeofExpr(node, context) {
        return `TYPEOF:${node.expr.visitExpression(this, context)}`;
    }
}
function invalid(arg) {
    throw new Error(`Invalid state: Visitor ${this.constructor.name} doesn't handle ${arg.constructor.name}`);
}
function isVariable(e) {
    return e instanceof o.ReadVarExpr;
}
function isLongStringLiteral(expr) {
    return expr instanceof o.LiteralExpr && typeof expr.value === 'string' &&
        expr.value.length >= POOL_INCLUSION_LENGTH_THRESHOLD_FOR_STRINGS;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRfcG9vbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9jb25zdGFudF9wb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sS0FBSyxDQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekMsT0FBTyxFQUFDLEtBQUssRUFBZ0IsTUFBTSxRQUFRLENBQUM7QUFFNUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBRTdCOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFTbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFFdkI7Ozs7R0FJRztBQUNILE1BQU0sMkNBQTJDLEdBQUcsRUFBRSxDQUFDO0FBRXZEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLGVBQWdCLFNBQVEsQ0FBQyxDQUFDLFVBQVU7SUFNeEMsWUFBbUIsUUFBc0I7UUFDdkMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQURKLGFBQVEsR0FBUixRQUFRLENBQWM7UUFFdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDM0IsQ0FBQztJQUVELGVBQWUsQ0FBQyxPQUE0QixFQUFFLE9BQVk7UUFDeEQsSUFBSSxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQzNCLGdFQUFnRTtZQUNoRSxnQ0FBZ0M7WUFDaEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3hEO0lBQ0gsQ0FBQztJQUVELFlBQVksQ0FBQyxDQUFlO1FBQzFCLE9BQU8s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R0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hHLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxDQUFlO0lBQ2pDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFDcEMsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsSUFBa0I7SUFDN0MsT0FBTyxJQUFJLFlBQVksQ0FBQyxDQUFDLFdBQVcsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtRQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSwyQ0FBMkMsQ0FBQztBQUN2RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge2Vycm9yLCBPdXRwdXRDb250ZXh0fSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBDT05TVEFOVF9QUkVGSVggPSAnX2MnO1xuXG4vKipcbiAqIGBDb25zdGFudFBvb2xgIHRyaWVzIHRvIHJldXNlIGxpdGVyYWwgZmFjdG9yaWVzIHdoZW4gdHdvIG9yIG1vcmUgbGl0ZXJhbHMgYXJlIGlkZW50aWNhbC5cbiAqIFdlIGRldGVybWluZSB3aGV0aGVyIGxpdGVyYWxzIGFyZSBpZGVudGljYWwgYnkgY3JlYXRpbmcgYSBrZXkgb3V0IG9mIHRoZWlyIEFTVCB1c2luZyB0aGVcbiAqIGBLZXlWaXNpdG9yYC4gVGhpcyBjb25zdGFudCBpcyB1c2VkIHRvIHJlcGxhY2UgZHluYW1pYyBleHByZXNzaW9ucyB3aGljaCBjYW4ndCBiZSBzYWZlbHlcbiAqIGNvbnZlcnRlZCBpbnRvIGEga2V5LiBFLmcuIGdpdmVuIGFuIGV4cHJlc3Npb24gYHtmb286IGJhcigpfWAsIHNpbmNlIHdlIGRvbid0IGtub3cgd2hhdFxuICogdGhlIHJlc3VsdCBvZiBgYmFyYCB3aWxsIGJlLCB3ZSBjcmVhdGUgYSBrZXkgdGhhdCBsb29rcyBsaWtlIGB7Zm9vOiA8dW5rbm93bj59YC4gTm90ZVxuICogdGhhdCB3ZSB1c2UgYSB2YXJpYWJsZSwgcmF0aGVyIHRoYW4gc29tZXRoaW5nIGxpa2UgYG51bGxgIGluIG9yZGVyIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gKi9cbmNvbnN0IFVOS05PV05fVkFMVUVfS0VZID0gby52YXJpYWJsZSgnPHVua25vd24+Jyk7XG5cbmV4cG9ydCBjb25zdCBlbnVtIERlZmluaXRpb25LaW5kIHtcbiAgSW5qZWN0b3IsXG4gIERpcmVjdGl2ZSxcbiAgQ29tcG9uZW50LFxuICBQaXBlXG59XG5cbi8qKlxuICogQ29udGV4dCB0byB1c2Ugd2hlbiBwcm9kdWNpbmcgYSBrZXkuXG4gKlxuICogVGhpcyBlbnN1cmVzIHdlIHNlZSB0aGUgY29uc3RhbnQgbm90IHRoZSByZWZlcmVuY2UgdmFyaWFibGUgd2hlbiBwcm9kdWNpbmdcbiAqIGEga2V5LlxuICovXG5jb25zdCBLRVlfQ09OVEVYVCA9IHt9O1xuXG4vKipcbiAqIEdlbmVyYWxseSBhbGwgcHJpbWl0aXZlIHZhbHVlcyBhcmUgZXhjbHVkZWQgZnJvbSB0aGUgYENvbnN0YW50UG9vbGAsIGJ1dCB0aGVyZSBpcyBhbiBleGNsdXNpb25cbiAqIGZvciBzdHJpbmdzIHRoYXQgcmVhY2ggYSBjZXJ0YWluIGxlbmd0aCB0aHJlc2hvbGQuIFRoaXMgY29uc3RhbnQgZGVmaW5lcyB0aGUgbGVuZ3RoIHRocmVzaG9sZCBmb3JcbiAqIHN0cmluZ3MuXG4gKi9cbmNvbnN0IFBPT0xfSU5DTFVTSU9OX0xFTkdUSF9USFJFU0hPTERfRk9SX1NUUklOR1MgPSA1MDtcblxuLyoqXG4gKiBBIG5vZGUgdGhhdCBpcyBhIHBsYWNlLWhvbGRlciB0aGF0IGFsbG93cyB0aGUgbm9kZSB0byBiZSByZXBsYWNlZCB3aGVuIHRoZSBhY3R1YWxcbiAqIG5vZGUgaXMga25vd24uXG4gKlxuICogVGhpcyBhbGxvd3MgdGhlIGNvbnN0YW50IHBvb2wgdG8gY2hhbmdlIGFuIGV4cHJlc3Npb24gZnJvbSBhIGRpcmVjdCByZWZlcmVuY2UgdG9cbiAqIGEgY29uc3RhbnQgdG8gYSBzaGFyZWQgY29uc3RhbnQuIEl0IHJldHVybnMgYSBmaXgtdXAgbm9kZSB0aGF0IGlzIGxhdGVyIGFsbG93ZWQgdG9cbiAqIGNoYW5nZSB0aGUgcmVmZXJlbmNlZCBleHByZXNzaW9uLlxuICovXG5jbGFzcyBGaXh1cEV4cHJlc3Npb24gZXh0ZW5kcyBvLkV4cHJlc3Npb24ge1xuICBwcml2YXRlIG9yaWdpbmFsOiBvLkV4cHJlc3Npb247XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHNoYXJlZCE6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHJlc29sdmVkOiBvLkV4cHJlc3Npb24pIHtcbiAgICBzdXBlcihyZXNvbHZlZC50eXBlKTtcbiAgICB0aGlzLm9yaWdpbmFsID0gcmVzb2x2ZWQ7XG4gIH1cblxuICB2aXNpdEV4cHJlc3Npb24odmlzaXRvcjogby5FeHByZXNzaW9uVmlzaXRvciwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoY29udGV4dCA9PT0gS0VZX0NPTlRFWFQpIHtcbiAgICAgIC8vIFdoZW4gcHJvZHVjaW5nIGEga2V5IHdlIHdhbnQgdG8gdHJhdmVyc2UgdGhlIGNvbnN0YW50IG5vdCB0aGVcbiAgICAgIC8vIHZhcmlhYmxlIHVzZWQgdG8gcmVmZXIgdG8gaXQuXG4gICAgICByZXR1cm4gdGhpcy5vcmlnaW5hbC52aXNpdEV4cHJlc3Npb24odmlzaXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlc29sdmVkLnZpc2l0RXhwcmVzc2lvbih2aXNpdG9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH1cblxuICBpc0VxdWl2YWxlbnQoZTogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGUgaW5zdGFuY2VvZiBGaXh1cEV4cHJlc3Npb24gJiYgdGhpcy5yZXNvbHZlZC5pc0VxdWl2YWxlbnQoZS5yZXNvbHZlZCk7XG4gIH1cblxuICBpc0NvbnN0YW50KCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZml4dXAoZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKSB7XG4gICAgdGhpcy5yZXNvbHZlZCA9IGV4cHJlc3Npb247XG4gICAgdGhpcy5zaGFyZWQgPSB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogQSBjb25zdGFudCBwb29sIGFsbG93cyBhIGNvZGUgZW1pdHRlciB0byBzaGFyZSBjb25zdGFudCBpbiBhbiBvdXRwdXQgY29udGV4dC5cbiAqXG4gKiBUaGUgY29uc3RhbnQgcG9vbCBhbHNvIHN1cHBvcnRzIHNoYXJpbmcgYWNjZXNzIHRvIGl2eSBkZWZpbml0aW9ucyByZWZlcmVuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ29uc3RhbnRQb29sIHtcbiAgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICBwcml2YXRlIGxpdGVyYWxzID0gbmV3IE1hcDxzdHJpbmcsIEZpeHVwRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBsaXRlcmFsRmFjdG9yaWVzID0gbmV3IE1hcDxzdHJpbmcsIG8uRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBpbmplY3RvckRlZmluaXRpb25zID0gbmV3IE1hcDxhbnksIEZpeHVwRXhwcmVzc2lvbj4oKTtcbiAgcHJpdmF0ZSBkaXJlY3RpdmVEZWZpbml0aW9ucyA9IG5ldyBNYXA8YW55LCBGaXh1cEV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgY29tcG9uZW50RGVmaW5pdGlvbnMgPSBuZXcgTWFwPGFueSwgRml4dXBFeHByZXNzaW9uPigpO1xuICBwcml2YXRlIHBpcGVEZWZpbml0aW9ucyA9IG5ldyBNYXA8YW55LCBGaXh1cEV4cHJlc3Npb24+KCk7XG5cbiAgcHJpdmF0ZSBuZXh0TmFtZUluZGV4ID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZDogYm9vbGVhbiA9IGZhbHNlKSB7fVxuXG4gIGdldENvbnN0TGl0ZXJhbChsaXRlcmFsOiBvLkV4cHJlc3Npb24sIGZvcmNlU2hhcmVkPzogYm9vbGVhbik6IG8uRXhwcmVzc2lvbiB7XG4gICAgaWYgKChsaXRlcmFsIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiAhaXNMb25nU3RyaW5nTGl0ZXJhbChsaXRlcmFsKSkgfHxcbiAgICAgICAgbGl0ZXJhbCBpbnN0YW5jZW9mIEZpeHVwRXhwcmVzc2lvbikge1xuICAgICAgLy8gRG8gbm8gcHV0IHNpbXBsZSBsaXRlcmFscyBpbnRvIHRoZSBjb25zdGFudCBwb29sIG9yIHRyeSB0byBwcm9kdWNlIGEgY29uc3RhbnQgZm9yIGFcbiAgICAgIC8vIHJlZmVyZW5jZSB0byBhIGNvbnN0YW50LlxuICAgICAgcmV0dXJuIGxpdGVyYWw7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IHRoaXMua2V5T2YobGl0ZXJhbCk7XG4gICAgbGV0IGZpeHVwID0gdGhpcy5saXRlcmFscy5nZXQoa2V5KTtcbiAgICBsZXQgbmV3VmFsdWUgPSBmYWxzZTtcbiAgICBpZiAoIWZpeHVwKSB7XG4gICAgICBmaXh1cCA9IG5ldyBGaXh1cEV4cHJlc3Npb24obGl0ZXJhbCk7XG4gICAgICB0aGlzLmxpdGVyYWxzLnNldChrZXksIGZpeHVwKTtcbiAgICAgIG5ld1ZhbHVlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoKCFuZXdWYWx1ZSAmJiAhZml4dXAuc2hhcmVkKSB8fCAobmV3VmFsdWUgJiYgZm9yY2VTaGFyZWQpKSB7XG4gICAgICAvLyBSZXBsYWNlIHRoZSBleHByZXNzaW9uIHdpdGggYSB2YXJpYWJsZVxuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZnJlc2hOYW1lKCk7XG4gICAgICBsZXQgZGVmaW5pdGlvbjogby5Xcml0ZVZhckV4cHI7XG4gICAgICBsZXQgdXNhZ2U6IG8uRXhwcmVzc2lvbjtcbiAgICAgIGlmICh0aGlzLmlzQ2xvc3VyZUNvbXBpbGVyRW5hYmxlZCAmJiBpc0xvbmdTdHJpbmdMaXRlcmFsKGxpdGVyYWwpKSB7XG4gICAgICAgIC8vIEZvciBzdHJpbmcgbGl0ZXJhbHMsIENsb3N1cmUgd2lsbCAqKmFsd2F5cyoqIGlubGluZSB0aGUgc3RyaW5nIGF0XG4gICAgICAgIC8vICoqYWxsKiogdXNhZ2VzLCBkdXBsaWNhdGluZyBpdCBlYWNoIHRpbWUuIEZvciBsYXJnZSBzdHJpbmdzLCB0aGlzXG4gICAgICAgIC8vIHVubmVjZXNzYXJpbHkgYmxvYXRzIGJ1bmRsZSBzaXplLiBUbyB3b3JrIGFyb3VuZCB0aGlzIHJlc3RyaWN0aW9uLCB3ZVxuICAgICAgICAvLyB3cmFwIHRoZSBzdHJpbmcgaW4gYSBmdW5jdGlvbiwgYW5kIGNhbGwgdGhhdCBmdW5jdGlvbiBmb3IgZWFjaCB1c2FnZS5cbiAgICAgICAgLy8gVGhpcyB0cmlja3MgQ2xvc3VyZSBpbnRvIHVzaW5nIGlubGluZSBsb2dpYyBmb3IgZnVuY3Rpb25zIGluc3RlYWQgb2ZcbiAgICAgICAgLy8gc3RyaW5nIGxpdGVyYWxzLiBGdW5jdGlvbiBjYWxscyBhcmUgb25seSBpbmxpbmVkIGlmIHRoZSBib2R5IGlzIHNtYWxsXG4gICAgICAgIC8vIGVub3VnaCB0byBiZSB3b3J0aCBpdC4gQnkgZG9pbmcgdGhpcywgdmVyeSBsYXJnZSBzdHJpbmdzIHdpbGwgYmVcbiAgICAgICAgLy8gc2hhcmVkIGFjcm9zcyBtdWx0aXBsZSB1c2FnZXMsIHJhdGhlciB0aGFuIGR1cGxpY2F0aW5nIHRoZSBzdHJpbmcgYXRcbiAgICAgICAgLy8gZWFjaCB1c2FnZSBzaXRlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBjb25zdCBteVN0ciA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJ2ZXJ5IHZlcnkgdmVyeSBsb25nIHN0cmluZ1wiOyB9O1xuICAgICAgICAvLyBjb25zdCB1c2FnZTEgPSBteVN0cigpO1xuICAgICAgICAvLyBjb25zdCB1c2FnZTIgPSBteVN0cigpO1xuICAgICAgICBkZWZpbml0aW9uID0gby52YXJpYWJsZShuYW1lKS5zZXQobmV3IG8uRnVuY3Rpb25FeHByKFxuICAgICAgICAgICAgW10sICAvLyBQYXJhbXMuXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIC8vIFN0YXRlbWVudHMuXG4gICAgICAgICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChsaXRlcmFsKSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICApKTtcbiAgICAgICAgdXNhZ2UgPSBvLnZhcmlhYmxlKG5hbWUpLmNhbGxGbihbXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBKdXN0IGRlY2xhcmUgYW5kIHVzZSB0aGUgdmFyaWFibGUgZGlyZWN0bHksIHdpdGhvdXQgYSBmdW5jdGlvbiBjYWxsXG4gICAgICAgIC8vIGluZGlyZWN0aW9uLiBUaGlzIHNhdmVzIGEgZmV3IGJ5dGVzIGFuZCBhdm9pZHMgYW4gdW5uY2Vzc2FyeSBjYWxsLlxuICAgICAgICBkZWZpbml0aW9uID0gby52YXJpYWJsZShuYW1lKS5zZXQobGl0ZXJhbCk7XG4gICAgICAgIHVzYWdlID0gby52YXJpYWJsZShuYW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGF0ZW1lbnRzLnB1c2goZGVmaW5pdGlvbi50b0RlY2xTdG10KG8uSU5GRVJSRURfVFlQRSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSkpO1xuICAgICAgZml4dXAuZml4dXAodXNhZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiBmaXh1cDtcbiAgfVxuXG4gIGdldERlZmluaXRpb24odHlwZTogYW55LCBraW5kOiBEZWZpbml0aW9uS2luZCwgY3R4OiBPdXRwdXRDb250ZXh0LCBmb3JjZVNoYXJlZDogYm9vbGVhbiA9IGZhbHNlKTpcbiAgICAgIG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSB0aGlzLmRlZmluaXRpb25zT2Yoa2luZCk7XG4gICAgbGV0IGZpeHVwID0gZGVmaW5pdGlvbnMuZ2V0KHR5cGUpO1xuICAgIGxldCBuZXdWYWx1ZSA9IGZhbHNlO1xuICAgIGlmICghZml4dXApIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5wcm9wZXJ0eU5hbWVPZihraW5kKTtcbiAgICAgIGZpeHVwID0gbmV3IEZpeHVwRXhwcmVzc2lvbihjdHguaW1wb3J0RXhwcih0eXBlKS5wcm9wKHByb3BlcnR5KSk7XG4gICAgICBkZWZpbml0aW9ucy5zZXQodHlwZSwgZml4dXApO1xuICAgICAgbmV3VmFsdWUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICgoIW5ld1ZhbHVlICYmICFmaXh1cC5zaGFyZWQpIHx8IChuZXdWYWx1ZSAmJiBmb3JjZVNoYXJlZCkpIHtcbiAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLmZyZXNoTmFtZSgpO1xuICAgICAgdGhpcy5zdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICAgby52YXJpYWJsZShuYW1lKS5zZXQoZml4dXAucmVzb2x2ZWQpLnRvRGVjbFN0bXQoby5JTkZFUlJFRF9UWVBFLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gICAgICBmaXh1cC5maXh1cChvLnZhcmlhYmxlKG5hbWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpeHVwO1xuICB9XG5cbiAgZ2V0TGl0ZXJhbEZhY3RvcnkobGl0ZXJhbDogby5MaXRlcmFsQXJyYXlFeHByfG8uTGl0ZXJhbE1hcEV4cHIpOlxuICAgICAge2xpdGVyYWxGYWN0b3J5OiBvLkV4cHJlc3Npb24sIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzOiBvLkV4cHJlc3Npb25bXX0ge1xuICAgIC8vIENyZWF0ZSBhIHB1cmUgZnVuY3Rpb24gdGhhdCBidWlsZHMgYW4gYXJyYXkgb2YgYSBtaXggb2YgY29uc3RhbnQgYW5kIHZhcmlhYmxlIGV4cHJlc3Npb25zXG4gICAgaWYgKGxpdGVyYWwgaW5zdGFuY2VvZiBvLkxpdGVyYWxBcnJheUV4cHIpIHtcbiAgICAgIGNvbnN0IGFyZ3VtZW50c0ZvcktleSA9IGxpdGVyYWwuZW50cmllcy5tYXAoZSA9PiBlLmlzQ29uc3RhbnQoKSA/IGUgOiBVTktOT1dOX1ZBTFVFX0tFWSk7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmtleU9mKG8ubGl0ZXJhbEFycihhcmd1bWVudHNGb3JLZXkpKTtcbiAgICAgIHJldHVybiB0aGlzLl9nZXRMaXRlcmFsRmFjdG9yeShrZXksIGxpdGVyYWwuZW50cmllcywgZW50cmllcyA9PiBvLmxpdGVyYWxBcnIoZW50cmllcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBleHByZXNzaW9uRm9yS2V5ID0gby5saXRlcmFsTWFwKFxuICAgICAgICAgIGxpdGVyYWwuZW50cmllcy5tYXAoZSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGUua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZS52YWx1ZS5pc0NvbnN0YW50KCkgPyBlLnZhbHVlIDogVU5LTk9XTl9WQUxVRV9LRVksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1b3RlZDogZS5xdW90ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmtleU9mKGV4cHJlc3Npb25Gb3JLZXkpO1xuICAgICAgcmV0dXJuIHRoaXMuX2dldExpdGVyYWxGYWN0b3J5KFxuICAgICAgICAgIGtleSwgbGl0ZXJhbC5lbnRyaWVzLm1hcChlID0+IGUudmFsdWUpLFxuICAgICAgICAgIGVudHJpZXMgPT4gby5saXRlcmFsTWFwKGVudHJpZXMubWFwKCh2YWx1ZSwgaW5kZXgpID0+ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGxpdGVyYWwuZW50cmllc1tpbmRleF0ua2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdW90ZWQ6IGxpdGVyYWwuZW50cmllc1tpbmRleF0ucXVvdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TGl0ZXJhbEZhY3RvcnkoXG4gICAgICBrZXk6IHN0cmluZywgdmFsdWVzOiBvLkV4cHJlc3Npb25bXSwgcmVzdWx0TWFwOiAocGFyYW1ldGVyczogby5FeHByZXNzaW9uW10pID0+IG8uRXhwcmVzc2lvbik6XG4gICAgICB7bGl0ZXJhbEZhY3Rvcnk6IG8uRXhwcmVzc2lvbiwgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHM6IG8uRXhwcmVzc2lvbltdfSB7XG4gICAgbGV0IGxpdGVyYWxGYWN0b3J5ID0gdGhpcy5saXRlcmFsRmFjdG9yaWVzLmdldChrZXkpO1xuICAgIGNvbnN0IGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzID0gdmFsdWVzLmZpbHRlcigoZSA9PiAhZS5pc0NvbnN0YW50KCkpKTtcbiAgICBpZiAoIWxpdGVyYWxGYWN0b3J5KSB7XG4gICAgICBjb25zdCByZXN1bHRFeHByZXNzaW9ucyA9IHZhbHVlcy5tYXAoXG4gICAgICAgICAgKGUsIGluZGV4KSA9PiBlLmlzQ29uc3RhbnQoKSA/IHRoaXMuZ2V0Q29uc3RMaXRlcmFsKGUsIHRydWUpIDogby52YXJpYWJsZShgYSR7aW5kZXh9YCkpO1xuICAgICAgY29uc3QgcGFyYW1ldGVycyA9XG4gICAgICAgICAgcmVzdWx0RXhwcmVzc2lvbnMuZmlsdGVyKGlzVmFyaWFibGUpLm1hcChlID0+IG5ldyBvLkZuUGFyYW0oZS5uYW1lISwgby5EWU5BTUlDX1RZUEUpKTtcbiAgICAgIGNvbnN0IHB1cmVGdW5jdGlvbkRlY2xhcmF0aW9uID1cbiAgICAgICAgICBvLmZuKHBhcmFtZXRlcnMsIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQocmVzdWx0TWFwKHJlc3VsdEV4cHJlc3Npb25zKSldLCBvLklORkVSUkVEX1RZUEUpO1xuICAgICAgY29uc3QgbmFtZSA9IHRoaXMuZnJlc2hOYW1lKCk7XG4gICAgICB0aGlzLnN0YXRlbWVudHMucHVzaChcbiAgICAgICAgICBvLnZhcmlhYmxlKG5hbWUpLnNldChwdXJlRnVuY3Rpb25EZWNsYXJhdGlvbikudG9EZWNsU3RtdChvLklORkVSUkVEX1RZUEUsIFtcbiAgICAgICAgICAgIG8uU3RtdE1vZGlmaWVyLkZpbmFsXG4gICAgICAgICAgXSkpO1xuICAgICAgbGl0ZXJhbEZhY3RvcnkgPSBvLnZhcmlhYmxlKG5hbWUpO1xuICAgICAgdGhpcy5saXRlcmFsRmFjdG9yaWVzLnNldChrZXksIGxpdGVyYWxGYWN0b3J5KTtcbiAgICB9XG4gICAgcmV0dXJuIHtsaXRlcmFsRmFjdG9yeSwgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHN9O1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2R1Y2UgYSB1bmlxdWUgbmFtZS5cbiAgICpcbiAgICogVGhlIG5hbWUgbWlnaHQgYmUgdW5pcXVlIGFtb25nIGRpZmZlcmVudCBwcmVmaXhlcyBpZiBhbnkgb2YgdGhlIHByZWZpeGVzIGVuZCBpblxuICAgKiBhIGRpZ2l0IHNvIHRoZSBwcmVmaXggc2hvdWxkIGJlIGEgY29uc3RhbnQgc3RyaW5nIChub3QgYmFzZWQgb24gdXNlciBpbnB1dCkgYW5kXG4gICAqIG11c3Qgbm90IGVuZCBpbiBhIGRpZ2l0LlxuICAgKi9cbiAgdW5pcXVlTmFtZShwcmVmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3ByZWZpeH0ke3RoaXMubmV4dE5hbWVJbmRleCsrfWA7XG4gIH1cblxuICBwcml2YXRlIGRlZmluaXRpb25zT2Yoa2luZDogRGVmaW5pdGlvbktpbmQpOiBNYXA8YW55LCBGaXh1cEV4cHJlc3Npb24+IHtcbiAgICBzd2l0Y2ggKGtpbmQpIHtcbiAgICAgIGNhc2UgRGVmaW5pdGlvbktpbmQuQ29tcG9uZW50OlxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnREZWZpbml0aW9ucztcbiAgICAgIGNhc2UgRGVmaW5pdGlvbktpbmQuRGlyZWN0aXZlOlxuICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RpdmVEZWZpbml0aW9ucztcbiAgICAgIGNhc2UgRGVmaW5pdGlvbktpbmQuSW5qZWN0b3I6XG4gICAgICAgIHJldHVybiB0aGlzLmluamVjdG9yRGVmaW5pdGlvbnM7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLlBpcGU6XG4gICAgICAgIHJldHVybiB0aGlzLnBpcGVEZWZpbml0aW9ucztcbiAgICB9XG4gICAgZXJyb3IoYFVua25vd24gZGVmaW5pdGlvbiBraW5kICR7a2luZH1gKTtcbiAgICByZXR1cm4gdGhpcy5jb21wb25lbnREZWZpbml0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBwcm9wZXJ0eU5hbWVPZihraW5kOiBEZWZpbml0aW9uS2luZCk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkNvbXBvbmVudDpcbiAgICAgICAgcmV0dXJuICfJtWNtcCc7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkRpcmVjdGl2ZTpcbiAgICAgICAgcmV0dXJuICfJtWRpcic7XG4gICAgICBjYXNlIERlZmluaXRpb25LaW5kLkluamVjdG9yOlxuICAgICAgICByZXR1cm4gJ8m1aW5qJztcbiAgICAgIGNhc2UgRGVmaW5pdGlvbktpbmQuUGlwZTpcbiAgICAgICAgcmV0dXJuICfJtXBpcGUnO1xuICAgIH1cbiAgICBlcnJvcihgVW5rbm93biBkZWZpbml0aW9uIGtpbmQgJHtraW5kfWApO1xuICAgIHJldHVybiAnPHVua25vd24+JztcbiAgfVxuXG4gIHByaXZhdGUgZnJlc2hOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudW5pcXVlTmFtZShDT05TVEFOVF9QUkVGSVgpO1xuICB9XG5cbiAgcHJpdmF0ZSBrZXlPZihleHByZXNzaW9uOiBvLkV4cHJlc3Npb24pIHtcbiAgICByZXR1cm4gZXhwcmVzc2lvbi52aXNpdEV4cHJlc3Npb24obmV3IEtleVZpc2l0b3IoKSwgS0VZX0NPTlRFWFQpO1xuICB9XG59XG5cbi8qKlxuICogVmlzaXRvciB1c2VkIHRvIGRldGVybWluZSBpZiAyIGV4cHJlc3Npb25zIGFyZSBlcXVpdmFsZW50IGFuZCBjYW4gYmUgc2hhcmVkIGluIHRoZVxuICogYENvbnN0YW50UG9vbGAuXG4gKlxuICogV2hlbiB0aGUgaWQgKHN0cmluZykgZ2VuZXJhdGVkIGJ5IHRoZSB2aXNpdG9yIGlzIGVxdWFsLCBleHByZXNzaW9ucyBhcmUgY29uc2lkZXJlZCBlcXVpdmFsZW50LlxuICovXG5jbGFzcyBLZXlWaXNpdG9yIGltcGxlbWVudHMgby5FeHByZXNzaW9uVmlzaXRvciB7XG4gIHZpc2l0TGl0ZXJhbEV4cHIoYXN0OiBvLkxpdGVyYWxFeHByKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dHlwZW9mIGFzdC52YWx1ZSA9PT0gJ3N0cmluZycgPyAnXCInICsgYXN0LnZhbHVlICsgJ1wiJyA6IGFzdC52YWx1ZX1gO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXlFeHByKGFzdDogby5MaXRlcmFsQXJyYXlFeHByLCBjb250ZXh0OiBvYmplY3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgWyR7YXN0LmVudHJpZXMubWFwKGVudHJ5ID0+IGVudHJ5LnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KSkuam9pbignLCcpfV1gO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwRXhwcihhc3Q6IG8uTGl0ZXJhbE1hcEV4cHIsIGNvbnRleHQ6IG9iamVjdCk6IHN0cmluZyB7XG4gICAgY29uc3QgbWFwS2V5ID0gKGVudHJ5OiBvLkxpdGVyYWxNYXBFbnRyeSkgPT4ge1xuICAgICAgY29uc3QgcXVvdGUgPSBlbnRyeS5xdW90ZWQgPyAnXCInIDogJyc7XG4gICAgICByZXR1cm4gYCR7cXVvdGV9JHtlbnRyeS5rZXl9JHtxdW90ZX1gO1xuICAgIH07XG4gICAgY29uc3QgbWFwRW50cnkgPSAoZW50cnk6IG8uTGl0ZXJhbE1hcEVudHJ5KSA9PlxuICAgICAgICBgJHttYXBLZXkoZW50cnkpfToke2VudHJ5LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KX1gO1xuICAgIHJldHVybiBgeyR7YXN0LmVudHJpZXMubWFwKG1hcEVudHJ5KS5qb2luKCcsJyl9YDtcbiAgfVxuXG4gIHZpc2l0RXh0ZXJuYWxFeHByKGFzdDogby5FeHRlcm5hbEV4cHIpOiBzdHJpbmcge1xuICAgIHJldHVybiBhc3QudmFsdWUubW9kdWxlTmFtZSA/IGBFWDoke2FzdC52YWx1ZS5tb2R1bGVOYW1lfToke2FzdC52YWx1ZS5uYW1lfWAgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBFWDoke2FzdC52YWx1ZS5ydW50aW1lLm5hbWV9YDtcbiAgfVxuXG4gIHZpc2l0UmVhZFZhckV4cHIobm9kZTogby5SZWFkVmFyRXhwcikge1xuICAgIHJldHVybiBgVkFSOiR7bm9kZS5uYW1lfWA7XG4gIH1cblxuICB2aXNpdFR5cGVvZkV4cHIobm9kZTogby5UeXBlb2ZFeHByLCBjb250ZXh0OiBhbnkpOiBzdHJpbmcge1xuICAgIHJldHVybiBgVFlQRU9GOiR7bm9kZS5leHByLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjb250ZXh0KX1gO1xuICB9XG5cbiAgdmlzaXRXcmFwcGVkTm9kZUV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdFdyaXRlVmFyRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0V3JpdGVLZXlFeHByID0gaW52YWxpZDtcbiAgdmlzaXRXcml0ZVByb3BFeHByID0gaW52YWxpZDtcbiAgdmlzaXRJbnZva2VNZXRob2RFeHByID0gaW52YWxpZDtcbiAgdmlzaXRJbnZva2VGdW5jdGlvbkV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEluc3RhbnRpYXRlRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0Q29uZGl0aW9uYWxFeHByID0gaW52YWxpZDtcbiAgdmlzaXROb3RFeHByID0gaW52YWxpZDtcbiAgdmlzaXRBc3NlcnROb3ROdWxsRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0Q2FzdEV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEZ1bmN0aW9uRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0VW5hcnlPcGVyYXRvckV4cHIgPSBpbnZhbGlkO1xuICB2aXNpdEJpbmFyeU9wZXJhdG9yRXhwciA9IGludmFsaWQ7XG4gIHZpc2l0UmVhZFByb3BFeHByID0gaW52YWxpZDtcbiAgdmlzaXRSZWFkS2V5RXhwciA9IGludmFsaWQ7XG4gIHZpc2l0Q29tbWFFeHByID0gaW52YWxpZDtcbiAgdmlzaXRMb2NhbGl6ZWRTdHJpbmcgPSBpbnZhbGlkO1xufVxuXG5mdW5jdGlvbiBpbnZhbGlkPFQ+KHRoaXM6IG8uRXhwcmVzc2lvblZpc2l0b3IsIGFyZzogby5FeHByZXNzaW9ufG8uU3RhdGVtZW50KTogbmV2ZXIge1xuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCBzdGF0ZTogVmlzaXRvciAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gZG9lc24ndCBoYW5kbGUgJHthcmcuY29uc3RydWN0b3IubmFtZX1gKTtcbn1cblxuZnVuY3Rpb24gaXNWYXJpYWJsZShlOiBvLkV4cHJlc3Npb24pOiBlIGlzIG8uUmVhZFZhckV4cHIge1xuICByZXR1cm4gZSBpbnN0YW5jZW9mIG8uUmVhZFZhckV4cHI7XG59XG5cbmZ1bmN0aW9uIGlzTG9uZ1N0cmluZ0xpdGVyYWwoZXhwcjogby5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gIHJldHVybiBleHByIGluc3RhbmNlb2Ygby5MaXRlcmFsRXhwciAmJiB0eXBlb2YgZXhwci52YWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgIGV4cHIudmFsdWUubGVuZ3RoID49IFBPT0xfSU5DTFVTSU9OX0xFTkdUSF9USFJFU0hPTERfRk9SX1NUUklOR1M7XG59XG4iXX0=