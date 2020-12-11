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
        define("@angular/compiler-cli/src/metadata/evaluator", ["require", "exports", "tslib", "typescript", "@angular/compiler-cli/src/metadata/schema"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Evaluator = exports.errorSymbol = exports.sourceInfo = exports.isPrimitive = exports.recordMapEntry = void 0;
    var tslib_1 = require("tslib");
    var ts = require("typescript");
    var schema_1 = require("@angular/compiler-cli/src/metadata/schema");
    // In TypeScript 2.1 the spread element kind was renamed.
    var spreadElementSyntaxKind = ts.SyntaxKind.SpreadElement || ts.SyntaxKind.SpreadElementExpression;
    function isMethodCallOf(callExpression, memberName) {
        var expression = callExpression.expression;
        if (expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            var propertyAccessExpression = expression;
            var name = propertyAccessExpression.name;
            if (name.kind == ts.SyntaxKind.Identifier) {
                return name.text === memberName;
            }
        }
        return false;
    }
    function isCallOf(callExpression, ident) {
        var expression = callExpression.expression;
        if (expression.kind === ts.SyntaxKind.Identifier) {
            var identifier = expression;
            return identifier.text === ident;
        }
        return false;
    }
    /* @internal */
    function recordMapEntry(entry, node, nodeMap, sourceFile) {
        if (!nodeMap.has(entry)) {
            nodeMap.set(entry, node);
            if (node &&
                (schema_1.isMetadataImportedSymbolReferenceExpression(entry) ||
                    schema_1.isMetadataImportDefaultReference(entry)) &&
                entry.line == null) {
                var info = sourceInfo(node, sourceFile);
                if (info.line != null)
                    entry.line = info.line;
                if (info.character != null)
                    entry.character = info.character;
            }
        }
        return entry;
    }
    exports.recordMapEntry = recordMapEntry;
    /**
     * ts.forEachChild stops iterating children when the callback return a truthy value.
     * This method inverts this to implement an `every` style iterator. It will return
     * true if every call to `cb` returns `true`.
     */
    function everyNodeChild(node, cb) {
        return !ts.forEachChild(node, function (node) { return !cb(node); });
    }
    function isPrimitive(value) {
        return Object(value) !== value;
    }
    exports.isPrimitive = isPrimitive;
    function isDefined(obj) {
        return obj !== undefined;
    }
    function getSourceFileOfNode(node) {
        while (node && node.kind != ts.SyntaxKind.SourceFile) {
            node = node.parent;
        }
        return node;
    }
    /* @internal */
    function sourceInfo(node, sourceFile) {
        if (node) {
            sourceFile = sourceFile || getSourceFileOfNode(node);
            if (sourceFile) {
                return ts.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
            }
        }
        return {};
    }
    exports.sourceInfo = sourceInfo;
    /* @internal */
    function errorSymbol(message, node, context, sourceFile) {
        var result = tslib_1.__assign({ __symbolic: 'error', message: message }, sourceInfo(node, sourceFile));
        if (context) {
            result.context = context;
        }
        return result;
    }
    exports.errorSymbol = errorSymbol;
    /**
     * Produce a symbolic representation of an expression folding values into their final value when
     * possible.
     */
    var Evaluator = /** @class */ (function () {
        function Evaluator(symbols, nodeMap, options, recordExport) {
            if (options === void 0) { options = {}; }
            this.symbols = symbols;
            this.nodeMap = nodeMap;
            this.options = options;
            this.recordExport = recordExport;
        }
        Evaluator.prototype.nameOf = function (node) {
            if (node && node.kind == ts.SyntaxKind.Identifier) {
                return node.text;
            }
            var result = node && this.evaluateNode(node);
            if (schema_1.isMetadataError(result) || typeof result === 'string') {
                return result;
            }
            else {
                return errorSymbol('Name expected', node, { received: (node && node.getText()) || '<missing>' });
            }
        };
        /**
         * Returns true if the expression represented by `node` can be folded into a literal expression.
         *
         * For example, a literal is always foldable. This means that literal expressions such as `1.2`
         * `"Some value"` `true` `false` are foldable.
         *
         * - An object literal is foldable if all the properties in the literal are foldable.
         * - An array literal is foldable if all the elements are foldable.
         * - A call is foldable if it is a call to a Array.prototype.concat or a call to CONST_EXPR.
         * - A property access is foldable if the object is foldable.
         * - A array index is foldable if index expression is foldable and the array is foldable.
         * - Binary operator expressions are foldable if the left and right expressions are foldable and
         *   it is one of '+', '-', '*', '/', '%', '||', and '&&'.
         * - An identifier is foldable if a value can be found for its symbol in the evaluator symbol
         *   table.
         */
        Evaluator.prototype.isFoldable = function (node) {
            return this.isFoldableWorker(node, new Map());
        };
        Evaluator.prototype.isFoldableWorker = function (node, folding) {
            var _this = this;
            if (node) {
                switch (node.kind) {
                    case ts.SyntaxKind.ObjectLiteralExpression:
                        return everyNodeChild(node, function (child) {
                            if (child.kind === ts.SyntaxKind.PropertyAssignment) {
                                var propertyAssignment = child;
                                return _this.isFoldableWorker(propertyAssignment.initializer, folding);
                            }
                            return false;
                        });
                    case ts.SyntaxKind.ArrayLiteralExpression:
                        return everyNodeChild(node, function (child) { return _this.isFoldableWorker(child, folding); });
                    case ts.SyntaxKind.CallExpression:
                        var callExpression = node;
                        // We can fold a <array>.concat(<v>).
                        if (isMethodCallOf(callExpression, 'concat') &&
                            arrayOrEmpty(callExpression.arguments).length === 1) {
                            var arrayNode = callExpression.expression.expression;
                            if (this.isFoldableWorker(arrayNode, folding) &&
                                this.isFoldableWorker(callExpression.arguments[0], folding)) {
                                // It needs to be an array.
                                var arrayValue = this.evaluateNode(arrayNode);
                                if (arrayValue && Array.isArray(arrayValue)) {
                                    return true;
                                }
                            }
                        }
                        // We can fold a call to CONST_EXPR
                        if (isCallOf(callExpression, 'CONST_EXPR') &&
                            arrayOrEmpty(callExpression.arguments).length === 1)
                            return this.isFoldableWorker(callExpression.arguments[0], folding);
                        return false;
                    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                    case ts.SyntaxKind.StringLiteral:
                    case ts.SyntaxKind.NumericLiteral:
                    case ts.SyntaxKind.NullKeyword:
                    case ts.SyntaxKind.TrueKeyword:
                    case ts.SyntaxKind.FalseKeyword:
                    case ts.SyntaxKind.TemplateHead:
                    case ts.SyntaxKind.TemplateMiddle:
                    case ts.SyntaxKind.TemplateTail:
                        return true;
                    case ts.SyntaxKind.ParenthesizedExpression:
                        var parenthesizedExpression = node;
                        return this.isFoldableWorker(parenthesizedExpression.expression, folding);
                    case ts.SyntaxKind.BinaryExpression:
                        var binaryExpression = node;
                        switch (binaryExpression.operatorToken.kind) {
                            case ts.SyntaxKind.PlusToken:
                            case ts.SyntaxKind.MinusToken:
                            case ts.SyntaxKind.AsteriskToken:
                            case ts.SyntaxKind.SlashToken:
                            case ts.SyntaxKind.PercentToken:
                            case ts.SyntaxKind.AmpersandAmpersandToken:
                            case ts.SyntaxKind.BarBarToken:
                                return this.isFoldableWorker(binaryExpression.left, folding) &&
                                    this.isFoldableWorker(binaryExpression.right, folding);
                            default:
                                return false;
                        }
                    case ts.SyntaxKind.PropertyAccessExpression:
                        var propertyAccessExpression = node;
                        return this.isFoldableWorker(propertyAccessExpression.expression, folding);
                    case ts.SyntaxKind.ElementAccessExpression:
                        var elementAccessExpression = node;
                        return this.isFoldableWorker(elementAccessExpression.expression, folding) &&
                            this.isFoldableWorker(elementAccessExpression.argumentExpression, folding);
                    case ts.SyntaxKind.Identifier:
                        var identifier = node;
                        var reference = this.symbols.resolve(identifier.text);
                        if (reference !== undefined && isPrimitive(reference)) {
                            return true;
                        }
                        break;
                    case ts.SyntaxKind.TemplateExpression:
                        var templateExpression = node;
                        return templateExpression.templateSpans.every(function (span) { return _this.isFoldableWorker(span.expression, folding); });
                }
            }
            return false;
        };
        /**
         * Produce a JSON serialiable object representing `node`. The foldable values in the expression
         * tree are folded. For example, a node representing `1 + 2` is folded into `3`.
         */
        Evaluator.prototype.evaluateNode = function (node, preferReference) {
            var _this = this;
            var t = this;
            var error;
            function recordEntry(entry, node) {
                if (t.options.substituteExpression) {
                    var newEntry = t.options.substituteExpression(entry, node);
                    if (t.recordExport && newEntry != entry && schema_1.isMetadataGlobalReferenceExpression(newEntry)) {
                        t.recordExport(newEntry.name, entry);
                    }
                    entry = newEntry;
                }
                return recordMapEntry(entry, node, t.nodeMap);
            }
            function isFoldableError(value) {
                return !t.options.verboseInvalidExpression && schema_1.isMetadataError(value);
            }
            var resolveName = function (name, preferReference) {
                var reference = _this.symbols.resolve(name, preferReference);
                if (reference === undefined) {
                    // Encode as a global reference. StaticReflector will check the reference.
                    return recordEntry({ __symbolic: 'reference', name: name }, node);
                }
                if (reference && schema_1.isMetadataSymbolicReferenceExpression(reference)) {
                    return recordEntry(tslib_1.__assign({}, reference), node);
                }
                return reference;
            };
            switch (node.kind) {
                case ts.SyntaxKind.ObjectLiteralExpression:
                    var obj_1 = {};
                    var quoted_1 = [];
                    ts.forEachChild(node, function (child) {
                        switch (child.kind) {
                            case ts.SyntaxKind.ShorthandPropertyAssignment:
                            case ts.SyntaxKind.PropertyAssignment:
                                var assignment = child;
                                if (assignment.name.kind == ts.SyntaxKind.StringLiteral) {
                                    var name_1 = assignment.name.text;
                                    quoted_1.push(name_1);
                                }
                                var propertyName = _this.nameOf(assignment.name);
                                if (isFoldableError(propertyName)) {
                                    error = propertyName;
                                    return true;
                                }
                                var propertyValue = isPropertyAssignment(assignment) ?
                                    _this.evaluateNode(assignment.initializer, /* preferReference */ true) :
                                    resolveName(propertyName, /* preferReference */ true);
                                if (isFoldableError(propertyValue)) {
                                    error = propertyValue;
                                    return true; // Stop the forEachChild.
                                }
                                else {
                                    obj_1[propertyName] = isPropertyAssignment(assignment) ?
                                        recordEntry(propertyValue, assignment.initializer) :
                                        propertyValue;
                                }
                        }
                    });
                    if (error)
                        return error;
                    if (this.options.quotedNames && quoted_1.length) {
                        obj_1['$quoted$'] = quoted_1;
                    }
                    return recordEntry(obj_1, node);
                case ts.SyntaxKind.ArrayLiteralExpression:
                    var arr_1 = [];
                    ts.forEachChild(node, function (child) {
                        var e_1, _a;
                        var value = _this.evaluateNode(child, /* preferReference */ true);
                        // Check for error
                        if (isFoldableError(value)) {
                            error = value;
                            return true; // Stop the forEachChild.
                        }
                        // Handle spread expressions
                        if (schema_1.isMetadataSymbolicSpreadExpression(value)) {
                            if (Array.isArray(value.expression)) {
                                try {
                                    for (var _b = tslib_1.__values(value.expression), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var spreadValue = _c.value;
                                        arr_1.push(spreadValue);
                                    }
                                }
                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_1) throw e_1.error; }
                                }
                                return;
                            }
                        }
                        arr_1.push(value);
                    });
                    if (error)
                        return error;
                    return recordEntry(arr_1, node);
                case spreadElementSyntaxKind:
                    var spreadExpression = this.evaluateNode(node.expression);
                    return recordEntry({ __symbolic: 'spread', expression: spreadExpression }, node);
                case ts.SyntaxKind.CallExpression:
                    var callExpression = node;
                    if (isCallOf(callExpression, 'forwardRef') &&
                        arrayOrEmpty(callExpression.arguments).length === 1) {
                        var firstArgument = callExpression.arguments[0];
                        if (firstArgument.kind == ts.SyntaxKind.ArrowFunction) {
                            var arrowFunction = firstArgument;
                            return recordEntry(this.evaluateNode(arrowFunction.body), node);
                        }
                    }
                    var args = arrayOrEmpty(callExpression.arguments).map(function (arg) { return _this.evaluateNode(arg); });
                    if (this.isFoldable(callExpression)) {
                        if (isMethodCallOf(callExpression, 'concat')) {
                            var arrayValue = this.evaluateNode(callExpression.expression.expression);
                            if (isFoldableError(arrayValue))
                                return arrayValue;
                            return arrayValue.concat(args[0]);
                        }
                    }
                    // Always fold a CONST_EXPR even if the argument is not foldable.
                    if (isCallOf(callExpression, 'CONST_EXPR') &&
                        arrayOrEmpty(callExpression.arguments).length === 1) {
                        return recordEntry(args[0], node);
                    }
                    var expression = this.evaluateNode(callExpression.expression);
                    if (isFoldableError(expression)) {
                        return recordEntry(expression, node);
                    }
                    var result = { __symbolic: 'call', expression: expression };
                    if (args && args.length) {
                        result.arguments = args;
                    }
                    return recordEntry(result, node);
                case ts.SyntaxKind.NewExpression:
                    var newExpression = node;
                    var newArgs = arrayOrEmpty(newExpression.arguments).map(function (arg) { return _this.evaluateNode(arg); });
                    var newTarget = this.evaluateNode(newExpression.expression);
                    if (schema_1.isMetadataError(newTarget)) {
                        return recordEntry(newTarget, node);
                    }
                    var call = { __symbolic: 'new', expression: newTarget };
                    if (newArgs.length) {
                        call.arguments = newArgs;
                    }
                    return recordEntry(call, node);
                case ts.SyntaxKind.PropertyAccessExpression: {
                    var propertyAccessExpression = node;
                    var expression_1 = this.evaluateNode(propertyAccessExpression.expression);
                    if (isFoldableError(expression_1)) {
                        return recordEntry(expression_1, node);
                    }
                    var member = this.nameOf(propertyAccessExpression.name);
                    if (isFoldableError(member)) {
                        return recordEntry(member, node);
                    }
                    if (expression_1 && this.isFoldable(propertyAccessExpression.expression))
                        return expression_1[member];
                    if (schema_1.isMetadataModuleReferenceExpression(expression_1)) {
                        // A select into a module reference and be converted into a reference to the symbol
                        // in the module
                        return recordEntry({ __symbolic: 'reference', module: expression_1.module, name: member }, node);
                    }
                    return recordEntry({ __symbolic: 'select', expression: expression_1, member: member }, node);
                }
                case ts.SyntaxKind.ElementAccessExpression: {
                    var elementAccessExpression = node;
                    var expression_2 = this.evaluateNode(elementAccessExpression.expression);
                    if (isFoldableError(expression_2)) {
                        return recordEntry(expression_2, node);
                    }
                    if (!elementAccessExpression.argumentExpression) {
                        return recordEntry(errorSymbol('Expression form not supported', node), node);
                    }
                    var index = this.evaluateNode(elementAccessExpression.argumentExpression);
                    if (isFoldableError(expression_2)) {
                        return recordEntry(expression_2, node);
                    }
                    if (this.isFoldable(elementAccessExpression.expression) &&
                        this.isFoldable(elementAccessExpression.argumentExpression))
                        return expression_2[index];
                    return recordEntry({ __symbolic: 'index', expression: expression_2, index: index }, node);
                }
                case ts.SyntaxKind.Identifier:
                    var identifier = node;
                    var name = identifier.text;
                    return resolveName(name, preferReference);
                case ts.SyntaxKind.TypeReference:
                    var typeReferenceNode = node;
                    var typeNameNode_1 = typeReferenceNode.typeName;
                    var getReference = function (node) {
                        if (typeNameNode_1.kind === ts.SyntaxKind.QualifiedName) {
                            var qualifiedName = node;
                            var left_1 = _this.evaluateNode(qualifiedName.left);
                            if (schema_1.isMetadataModuleReferenceExpression(left_1)) {
                                return recordEntry({
                                    __symbolic: 'reference',
                                    module: left_1.module,
                                    name: qualifiedName.right.text
                                }, node);
                            }
                            // Record a type reference to a declared type as a select.
                            return { __symbolic: 'select', expression: left_1, member: qualifiedName.right.text };
                        }
                        else {
                            var identifier_1 = typeNameNode_1;
                            var symbol = _this.symbols.resolve(identifier_1.text);
                            if (isFoldableError(symbol) || schema_1.isMetadataSymbolicReferenceExpression(symbol)) {
                                return recordEntry(symbol, node);
                            }
                            return recordEntry(errorSymbol('Could not resolve type', node, { typeName: identifier_1.text }), node);
                        }
                    };
                    var typeReference = getReference(typeNameNode_1);
                    if (isFoldableError(typeReference)) {
                        return recordEntry(typeReference, node);
                    }
                    if (!schema_1.isMetadataModuleReferenceExpression(typeReference) &&
                        typeReferenceNode.typeArguments && typeReferenceNode.typeArguments.length) {
                        var args_1 = typeReferenceNode.typeArguments.map(function (element) { return _this.evaluateNode(element); });
                        // TODO: Remove typecast when upgraded to 2.0 as it will be correctly inferred.
                        // Some versions of 1.9 do not infer this correctly.
                        typeReference.arguments = args_1;
                    }
                    return recordEntry(typeReference, node);
                case ts.SyntaxKind.UnionType:
                    var unionType = node;
                    // Remove null and undefined from the list of unions.
                    // TODO(alan-agius4): remove `n.kind !== ts.SyntaxKind.NullKeyword` when
                    // TS 3.9 support is dropped. In TS 4.0 NullKeyword is a child of LiteralType.
                    var references = unionType.types
                        .filter(function (n) { return n.kind !== ts.SyntaxKind.NullKeyword &&
                        n.kind !== ts.SyntaxKind.UndefinedKeyword &&
                        !(ts.isLiteralTypeNode(n) && n.literal.kind === ts.SyntaxKind.NullKeyword); })
                        .map(function (n) { return _this.evaluateNode(n); });
                    // The remmaining reference must be the same. If two have type arguments consider them
                    // different even if the type arguments are the same.
                    var candidate = null;
                    for (var i = 0; i < references.length; i++) {
                        var reference = references[i];
                        if (schema_1.isMetadataSymbolicReferenceExpression(reference)) {
                            if (candidate) {
                                if (reference.name == candidate.name &&
                                    reference.module == candidate.module && !reference.arguments) {
                                    candidate = reference;
                                }
                            }
                            else {
                                candidate = reference;
                            }
                        }
                        else {
                            return reference;
                        }
                    }
                    if (candidate)
                        return candidate;
                    break;
                case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
                case ts.SyntaxKind.StringLiteral:
                case ts.SyntaxKind.TemplateHead:
                case ts.SyntaxKind.TemplateTail:
                case ts.SyntaxKind.TemplateMiddle:
                    return node.text;
                case ts.SyntaxKind.NumericLiteral:
                    return parseFloat(node.text);
                case ts.SyntaxKind.AnyKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'any' }, node);
                case ts.SyntaxKind.StringKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'string' }, node);
                case ts.SyntaxKind.NumberKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'number' }, node);
                case ts.SyntaxKind.BooleanKeyword:
                    return recordEntry({ __symbolic: 'reference', name: 'boolean' }, node);
                case ts.SyntaxKind.ArrayType:
                    var arrayTypeNode = node;
                    return recordEntry({
                        __symbolic: 'reference',
                        name: 'Array',
                        arguments: [this.evaluateNode(arrayTypeNode.elementType)]
                    }, node);
                case ts.SyntaxKind.NullKeyword:
                    return null;
                case ts.SyntaxKind.TrueKeyword:
                    return true;
                case ts.SyntaxKind.FalseKeyword:
                    return false;
                case ts.SyntaxKind.ParenthesizedExpression:
                    var parenthesizedExpression = node;
                    return this.evaluateNode(parenthesizedExpression.expression);
                case ts.SyntaxKind.TypeAssertionExpression:
                    var typeAssertion = node;
                    return this.evaluateNode(typeAssertion.expression);
                case ts.SyntaxKind.PrefixUnaryExpression:
                    var prefixUnaryExpression = node;
                    var operand = this.evaluateNode(prefixUnaryExpression.operand);
                    if (isDefined(operand) && isPrimitive(operand)) {
                        switch (prefixUnaryExpression.operator) {
                            case ts.SyntaxKind.PlusToken:
                                return +operand;
                            case ts.SyntaxKind.MinusToken:
                                return -operand;
                            case ts.SyntaxKind.TildeToken:
                                return ~operand;
                            case ts.SyntaxKind.ExclamationToken:
                                return !operand;
                        }
                    }
                    var operatorText = void 0;
                    switch (prefixUnaryExpression.operator) {
                        case ts.SyntaxKind.PlusToken:
                            operatorText = '+';
                            break;
                        case ts.SyntaxKind.MinusToken:
                            operatorText = '-';
                            break;
                        case ts.SyntaxKind.TildeToken:
                            operatorText = '~';
                            break;
                        case ts.SyntaxKind.ExclamationToken:
                            operatorText = '!';
                            break;
                        default:
                            return undefined;
                    }
                    return recordEntry({ __symbolic: 'pre', operator: operatorText, operand: operand }, node);
                case ts.SyntaxKind.BinaryExpression:
                    var binaryExpression = node;
                    var left = this.evaluateNode(binaryExpression.left);
                    var right = this.evaluateNode(binaryExpression.right);
                    if (isDefined(left) && isDefined(right)) {
                        if (isPrimitive(left) && isPrimitive(right))
                            switch (binaryExpression.operatorToken.kind) {
                                case ts.SyntaxKind.BarBarToken:
                                    return left || right;
                                case ts.SyntaxKind.AmpersandAmpersandToken:
                                    return left && right;
                                case ts.SyntaxKind.AmpersandToken:
                                    return left & right;
                                case ts.SyntaxKind.BarToken:
                                    return left | right;
                                case ts.SyntaxKind.CaretToken:
                                    return left ^ right;
                                case ts.SyntaxKind.EqualsEqualsToken:
                                    return left == right;
                                case ts.SyntaxKind.ExclamationEqualsToken:
                                    return left != right;
                                case ts.SyntaxKind.EqualsEqualsEqualsToken:
                                    return left === right;
                                case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                                    return left !== right;
                                case ts.SyntaxKind.LessThanToken:
                                    return left < right;
                                case ts.SyntaxKind.GreaterThanToken:
                                    return left > right;
                                case ts.SyntaxKind.LessThanEqualsToken:
                                    return left <= right;
                                case ts.SyntaxKind.GreaterThanEqualsToken:
                                    return left >= right;
                                case ts.SyntaxKind.LessThanLessThanToken:
                                    return left << right;
                                case ts.SyntaxKind.GreaterThanGreaterThanToken:
                                    return left >> right;
                                case ts.SyntaxKind.GreaterThanGreaterThanGreaterThanToken:
                                    return left >>> right;
                                case ts.SyntaxKind.PlusToken:
                                    return left + right;
                                case ts.SyntaxKind.MinusToken:
                                    return left - right;
                                case ts.SyntaxKind.AsteriskToken:
                                    return left * right;
                                case ts.SyntaxKind.SlashToken:
                                    return left / right;
                                case ts.SyntaxKind.PercentToken:
                                    return left % right;
                            }
                        return recordEntry({
                            __symbolic: 'binop',
                            operator: binaryExpression.operatorToken.getText(),
                            left: left,
                            right: right
                        }, node);
                    }
                    break;
                case ts.SyntaxKind.ConditionalExpression:
                    var conditionalExpression = node;
                    var condition = this.evaluateNode(conditionalExpression.condition);
                    var thenExpression = this.evaluateNode(conditionalExpression.whenTrue);
                    var elseExpression = this.evaluateNode(conditionalExpression.whenFalse);
                    if (isPrimitive(condition)) {
                        return condition ? thenExpression : elseExpression;
                    }
                    return recordEntry({ __symbolic: 'if', condition: condition, thenExpression: thenExpression, elseExpression: elseExpression }, node);
                case ts.SyntaxKind.FunctionExpression:
                case ts.SyntaxKind.ArrowFunction:
                    return recordEntry(errorSymbol('Lambda not supported', node), node);
                case ts.SyntaxKind.TaggedTemplateExpression:
                    return recordEntry(errorSymbol('Tagged template expressions are not supported in metadata', node), node);
                case ts.SyntaxKind.TemplateExpression:
                    var templateExpression = node;
                    if (this.isFoldable(node)) {
                        return templateExpression.templateSpans.reduce(function (previous, current) { return previous + _this.evaluateNode(current.expression) +
                            _this.evaluateNode(current.literal); }, this.evaluateNode(templateExpression.head));
                    }
                    else {
                        return templateExpression.templateSpans.reduce(function (previous, current) {
                            var expr = _this.evaluateNode(current.expression);
                            var literal = _this.evaluateNode(current.literal);
                            if (isFoldableError(expr))
                                return expr;
                            if (isFoldableError(literal))
                                return literal;
                            if (typeof previous === 'string' && typeof expr === 'string' &&
                                typeof literal === 'string') {
                                return previous + expr + literal;
                            }
                            var result = expr;
                            if (previous !== '') {
                                result = { __symbolic: 'binop', operator: '+', left: previous, right: expr };
                            }
                            if (literal != '') {
                                result = { __symbolic: 'binop', operator: '+', left: result, right: literal };
                            }
                            return result;
                        }, this.evaluateNode(templateExpression.head));
                    }
                case ts.SyntaxKind.AsExpression:
                    var asExpression = node;
                    return this.evaluateNode(asExpression.expression);
                case ts.SyntaxKind.ClassExpression:
                    return { __symbolic: 'class' };
            }
            return recordEntry(errorSymbol('Expression form not supported', node), node);
        };
        return Evaluator;
    }());
    exports.Evaluator = Evaluator;
    function isPropertyAssignment(node) {
        return node.kind == ts.SyntaxKind.PropertyAssignment;
    }
    var empty = ts.createNodeArray();
    function arrayOrEmpty(v) {
        return v || empty;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXItY2xpL3NyYy9tZXRhZGF0YS9ldmFsdWF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUdqQyxvRUFBcWQ7SUFLcmQseURBQXlEO0lBQ3pELElBQU0sdUJBQXVCLEdBQ3hCLEVBQUUsQ0FBQyxVQUFrQixDQUFDLGFBQWEsSUFBSyxFQUFFLENBQUMsVUFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztJQUUzRixTQUFTLGNBQWMsQ0FBQyxjQUFpQyxFQUFFLFVBQWtCO1FBQzNFLElBQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUM7UUFDN0MsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEVBQUU7WUFDOUQsSUFBTSx3QkFBd0IsR0FBZ0MsVUFBVSxDQUFDO1lBQ3pFLElBQU0sSUFBSSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQztZQUMzQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxVQUFVLENBQUM7YUFDakM7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFNBQVMsUUFBUSxDQUFDLGNBQWlDLEVBQUUsS0FBYTtRQUNoRSxJQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1FBQzdDLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUNoRCxJQUFNLFVBQVUsR0FBa0IsVUFBVSxDQUFDO1lBQzdDLE9BQU8sVUFBVSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7U0FDbEM7UUFDRCxPQUFP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QUssRUFBRSxPQUFPLEVBQUMsQ0FBQzs2QkFDN0U7NEJBQ0QsT0FBTyxNQUFNLENBQUM7d0JBQ2hCLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7cUJBQ2hEO2dCQUNILEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZO29CQUM3QixJQUFNLFlBQVksR0FBb0IsSUFBSSxDQUFDO29CQUMzQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUNwRCxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZTtvQkFDaEMsT0FBTyxFQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUMsQ0FBQzthQUNoQztZQUNELE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBQ0gsZ0JBQUM7SUFBRCxDQUFDLEFBcGpCRCxJQW9qQkM7SUFwakJZLDhCQUFTO0lBc2pCdEIsU0FBUyxvQkFBb0IsQ0FBQyxJQUFhO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO0lBQ3ZELENBQUM7SUFFRCxJQUFNLEtBQUssR0FBRyxFQUFFLENBQUMsZUFBZSxFQUFPLENBQUM7SUFFeEMsU0FBUyxZQUFZLENBQW9CLENBQTRCO1FBQ25FLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQztJQUNwQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge0NvbGxlY3Rvck9wdGlvbnN9IGZyb20gJy4vY29sbGVjdG9yJztcbmltcG9ydCB7Q2xhc3NNZXRhZGF0YSwgRnVuY3Rpb25NZXRhZGF0YSwgSW50ZXJmYWNlTWV0YWRhdGEsIGlzTWV0YWRhdGFFcnJvciwgaXNNZXRhZGF0YUdsb2JhbFJlZmVyZW5jZUV4cHJlc3Npb24sIGlzTWV0YWRhdGFJbXBvcnREZWZhdWx0UmVmZXJlbmNlLCBpc01ldGFkYXRhSW1wb3J0ZWRTeW1ib2xSZWZlcmVuY2VFeHByZXNzaW9uLCBpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbiwgaXNNZXRhZGF0YVN5bWJvbGljU3ByZWFkRXhwcmVzc2lvbiwgTWV0YWRhdGFFbnRyeSwgTWV0YWRhdGFFcnJvciwgTWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24sIE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvLCBNZXRhZGF0YVN5bWJvbGljQ2FsbEV4cHJlc3Npb24sIE1ldGFkYXRhVmFsdWV9IGZyb20gJy4vc2NoZW1hJztcbmltcG9ydCB7U3ltYm9sc30gZnJvbSAnLi9zeW1ib2xzJztcblxuXG5cbi8vIEluIFR5cGVTY3JpcHQgMi4xIHRoZSBzcHJlYWQgZWxlbWVudCBraW5kIHdhcyByZW5hbWVkLlxuY29uc3Qgc3ByZWFkRWxlbWVudFN5bnRheEtpbmQ6IHRzLlN5bnRheEtpbmQgPVxuICAgICh0cy5TeW50YXhLaW5kIGFzIGFueSkuU3ByZWFkRWxlbWVudCB8fCAodHMuU3ludGF4S2luZCBhcyBhbnkpLlNwcmVhZEVsZW1lbnRFeHByZXNzaW9uO1xuXG5mdW5jdGlvbiBpc01ldGhvZENhbGxPZihjYWxsRXhwcmVzc2lvbjogdHMuQ2FsbEV4cHJlc3Npb24sIG1lbWJlck5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBleHByZXNzaW9uID0gY2FsbEV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgaWYgKGV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24pIHtcbiAgICBjb25zdCBwcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24gPSA8dHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uPmV4cHJlc3Npb247XG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbi5uYW1lO1xuICAgIGlmIChuYW1lLmtpbmQgPT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgICByZXR1cm4gbmFtZS50ZXh0ID09PSBtZW1iZXJOYW1lO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGlzQ2FsbE9mKGNhbGxFeHByZXNzaW9uOiB0cy5DYWxsRXhwcmVzc2lvbiwgaWRlbnQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBleHByZXNzaW9uID0gY2FsbEV4cHJlc3Npb24uZXhwcmVzc2lvbjtcbiAgaWYgKGV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSB7XG4gICAgY29uc3QgaWRlbnRpZmllciA9IDx0cy5JZGVudGlmaWVyPmV4cHJlc3Npb247XG4gICAgcmV0dXJuIGlkZW50aWZpZXIudGV4dCA9PT0gaWRlbnQ7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBmdW5jdGlvbiByZWNvcmRNYXBFbnRyeTxUIGV4dGVuZHMgTWV0YWRhdGFFbnRyeT4oXG4gICAgZW50cnk6IFQsIG5vZGU6IHRzLk5vZGUsXG4gICAgbm9kZU1hcDogTWFwPE1ldGFkYXRhVmFsdWV8Q2xhc3NNZXRhZGF0YXxJbnRlcmZhY2VNZXRhZGF0YXxGdW5jdGlvbk1ldGFkYXRhLCB0cy5Ob2RlPixcbiAgICBzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZSkge1xuICBpZiAoIW5vZGVNYXAuaGFzKGVudHJ5KSkge1xuICAgIG5vZGVNYXAuc2V0KGVudHJ5LCBub2RlKTtcbiAgICBpZiAobm9kZSAmJlxuICAgICAgICAoaXNNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbihlbnRyeSkgfHxcbiAgICAgICAgIGlzTWV0YWRhdGFJbXBvcnREZWZhdWx0UmVmZXJlbmNlKGVudHJ5KSkgJiZcbiAgICAgICAgZW50cnkubGluZSA9PSBudWxsKSB7XG4gICAgICBjb25zdCBpbmZvID0gc291cmNlSW5mbyhub2RlLCBzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChpbmZvLmxpbmUgIT0gbnVsbCkgZW50cnkubGluZSA9IGluZm8ubGluZTtcbiAgICAgIGlmIChpbmZvLmNoYXJhY3RlciAhPSBudWxsKSBlbnRyeS5jaGFyYWN0ZXIgPSBpbmZvLmNoYXJhY3RlcjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVudHJ5O1xufVxuXG4vKipcbiAqIHRzLmZvckVhY2hDaGlsZCBzdG9wcyBpdGVyYXRpbmcgY2hpbGRyZW4gd2hlbiB0aGUgY2FsbGJhY2sgcmV0dXJuIGEgdHJ1dGh5IHZhbHVlLlxuICogVGhpcyBtZXRob2QgaW52ZXJ0cyB0aGlzIHRvIGltcGxlbWVudCBhbiBgZXZlcnlgIHN0eWxlIGl0ZXJhdG9yLiBJdCB3aWxsIHJldHVyblxuICogdHJ1ZSBpZiBldmVyeSBjYWxsIHRvIGBjYmAgcmV0dXJucyBgdHJ1ZWAuXG4gKi9cbmZ1bmN0aW9uIGV2ZXJ5Tm9kZUNoaWxkKG5vZGU6IHRzLk5vZGUsIGNiOiAobm9kZTogdHMuTm9kZSkgPT4gYm9vbGVhbikge1xuICByZXR1cm4gIXRzLmZvckVhY2hDaGlsZChub2RlLCBub2RlID0+ICFjYihub2RlKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QodmFsdWUpICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaXNEZWZpbmVkKG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogIT09IHVuZGVmaW5lZDtcbn1cblxuLy8gaW1wb3J0IHtwcm9wZXJ0eU5hbWUgYXMgbmFtZX0gZnJvbSAncGxhY2UnXG4vLyBpbXBvcnQge25hbWV9IGZyb20gJ3BsYWNlJ1xuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRTcGVjaWZpZXJNZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcHJvcGVydHlOYW1lPzogc3RyaW5nO1xufVxuZXhwb3J0IGludGVyZmFjZSBJbXBvcnRNZXRhZGF0YSB7XG4gIGRlZmF1bHROYW1lPzogc3RyaW5nOyAgICAgICAgICAgICAgICAgICAgICAvLyBpbXBvcnQgZCBmcm9tICdwbGFjZSdcbiAgbmFtZXNwYWNlPzogc3RyaW5nOyAgICAgICAgICAgICAgICAgICAgICAgIC8vIGltcG9ydCAqIGFzIGQgZnJvbSAncGxhY2UnXG4gIG5hbWVkSW1wb3J0cz86IEltcG9ydFNwZWNpZmllck1ldGFkYXRhW107ICAvLyBpbXBvcnQge2F9IGZyb20gJ3BsYWNlJ1xuICBmcm9tOiBzdHJpbmc7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZnJvbSAncGxhY2UnXG59XG5cblxuZnVuY3Rpb24gZ2V0U291cmNlRmlsZU9mTm9kZShub2RlOiB0cy5Ob2RlfHVuZGVmaW5lZCk6IHRzLlNvdXJjZUZpbGUge1xuICB3aGlsZSAobm9kZSAmJiBub2RlLmtpbmQgIT0gdHMuU3ludGF4S2luZC5Tb3VyY2VGaWxlKSB7XG4gICAgbm9kZSA9IG5vZGUucGFyZW50O1xuICB9XG4gIHJldHVybiA8dHMuU291cmNlRmlsZT5ub2RlO1xufVxuXG4vKiBAaW50ZXJuYWwgKi9cbmV4cG9ydCBmdW5jdGlvbiBzb3VyY2VJbmZvKFxuICAgIG5vZGU6IHRzLk5vZGV8dW5kZWZpbmVkLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlfHVuZGVmaW5lZCk6IE1ldGFkYXRhU291cmNlTG9jYXRpb25JbmZvIHtcbiAgaWYgKG5vZGUpIHtcbiAgICBzb3VyY2VGaWxlID0gc291cmNlRmlsZSB8fCBnZXRTb3VyY2VGaWxlT2ZOb2RlKG5vZGUpO1xuICAgIGlmIChzb3VyY2VGaWxlKSB7XG4gICAgICByZXR1cm4gdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlRmlsZSwgbm9kZS5nZXRTdGFydChzb3VyY2VGaWxlKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7fTtcbn1cblxuLyogQGludGVybmFsICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JTeW1ib2woXG4gICAgbWVzc2FnZTogc3RyaW5nLCBub2RlPzogdHMuTm9kZSwgY29udGV4dD86IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBzb3VyY2VGaWxlPzogdHMuU291cmNlRmlsZSk6IE1ldGFkYXRhRXJyb3Ige1xuICBjb25zdCByZXN1bHQ6IE1ldGFkYXRhRXJyb3IgPSB7X19zeW1ib2xpYzogJ2Vycm9yJywgbWVzc2FnZSwgLi4uc291cmNlSW5mbyhub2RlLCBzb3VyY2VGaWxlKX07XG4gIGlmIChjb250ZXh0KSB7XG4gICAgcmVzdWx0LmNvbnRleHQgPSBjb250ZXh0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUHJvZHVjZSBhIHN5bWJvbGljIHJlcHJlc2VudGF0aW9uIG9mIGFuIGV4cHJlc3Npb24gZm9sZGluZyB2YWx1ZXMgaW50byB0aGVpciBmaW5hbCB2YWx1ZSB3aGVuXG4gKiBwb3NzaWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2YWx1YXRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBzeW1ib2xzOiBTeW1ib2xzLCBwcml2YXRlIG5vZGVNYXA6IE1hcDxNZXRhZGF0YUVudHJ5LCB0cy5Ob2RlPixcbiAgICAgIHByaXZhdGUgb3B0aW9uczogQ29sbGVjdG9yT3B0aW9ucyA9IHt9LFxuICAgICAgcHJpdmF0ZSByZWNvcmRFeHBvcnQ/OiAobmFtZTogc3RyaW5nLCB2YWx1ZTogTWV0YWRhdGFWYWx1ZSkgPT4gdm9pZCkge31cblxuICBuYW1lT2Yobm9kZTogdHMuTm9kZXx1bmRlZmluZWQpOiBzdHJpbmd8TWV0YWRhdGFFcnJvciB7XG4gICAgaWYgKG5vZGUgJiYgbm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xuICAgICAgcmV0dXJuICg8dHMuSWRlbnRpZmllcj5ub2RlKS50ZXh0O1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBub2RlICYmIHRoaXMuZXZhbHVhdGVOb2RlKG5vZGUpO1xuICAgIGlmIChpc01ldGFkYXRhRXJyb3IocmVzdWx0KSB8fCB0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVycm9yU3ltYm9sKFxuICAgICAgICAgICdOYW1lIGV4cGVjdGVkJywgbm9kZSwge3JlY2VpdmVkOiAobm9kZSAmJiBub2RlLmdldFRleHQoKSkgfHwgJzxtaXNzaW5nPid9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBleHByZXNzaW9uIHJlcHJlc2VudGVkIGJ5IGBub2RlYCBjYW4gYmUgZm9sZGVkIGludG8gYSBsaXRlcmFsIGV4cHJlc3Npb24uXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBhIGxpdGVyYWwgaXMgYWx3YXlzIGZvbGRhYmxlLiBUaGlzIG1lYW5zIHRoYXQgbGl0ZXJhbCBleHByZXNzaW9ucyBzdWNoIGFzIGAxLjJgXG4gICAqIGBcIlNvbWUgdmFsdWVcImAgYHRydWVgIGBmYWxzZWAgYXJlIGZvbGRhYmxlLlxuICAgKlxuICAgKiAtIEFuIG9iamVjdCBsaXRlcmFsIGlzIGZvbGRhYmxlIGlmIGFsbCB0aGUgcHJvcGVydGllcyBpbiB0aGUgbGl0ZXJhbCBhcmUgZm9sZGFibGUuXG4gICAqIC0gQW4gYXJyYXkgbGl0ZXJhbCBpcyBmb2xkYWJsZSBpZiBhbGwgdGhlIGVsZW1lbnRzIGFyZSBmb2xkYWJsZS5cbiAgICogLSBBIGNhbGwgaXMgZm9sZGFibGUgaWYgaXQgaXMgYSBjYWxsIHRvIGEgQXJyYXkucHJvdG90eXBlLmNvbmNhdCBvciBhIGNhbGwgdG8gQ09OU1RfRVhQUi5cbiAgICogLSBBIHByb3BlcnR5IGFjY2VzcyBpcyBmb2xkYWJsZSBpZiB0aGUgb2JqZWN0IGlzIGZvbGRhYmxlLlxuICAgKiAtIEEgYXJyYXkgaW5kZXggaXMgZm9sZGFibGUgaWYgaW5kZXggZXhwcmVzc2lvbiBpcyBmb2xkYWJsZSBhbmQgdGhlIGFycmF5IGlzIGZvbGRhYmxlLlxuICAgKiAtIEJpbmFyeSBvcGVyYXRvciBleHByZXNzaW9ucyBhcmUgZm9sZGFibGUgaWYgdGhlIGxlZnQgYW5kIHJpZ2h0IGV4cHJlc3Npb25zIGFyZSBmb2xkYWJsZSBhbmRcbiAgICogICBpdCBpcyBvbmUgb2YgJysnLCAnLScsICcqJywgJy8nLCAnJScsICd8fCcsIGFuZCAnJiYnLlxuICAgKiAtIEFuIGlkZW50aWZpZXIgaXMgZm9sZGFibGUgaWYgYSB2YWx1ZSBjYW4gYmUgZm91bmQgZm9yIGl0cyBzeW1ib2wgaW4gdGhlIGV2YWx1YXRvciBzeW1ib2xcbiAgICogICB0YWJsZS5cbiAgICovXG4gIHB1YmxpYyBpc0ZvbGRhYmxlKG5vZGU6IHRzLk5vZGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKG5vZGUsIG5ldyBNYXA8dHMuTm9kZSwgYm9vbGVhbj4oKSk7XG4gIH1cblxuICBwcml2YXRlIGlzRm9sZGFibGVXb3JrZXIobm9kZTogdHMuTm9kZXx1bmRlZmluZWQsIGZvbGRpbmc6IE1hcDx0cy5Ob2RlLCBib29sZWFuPik6IGJvb2xlYW4ge1xuICAgIGlmIChub2RlKSB7XG4gICAgICBzd2l0Y2ggKG5vZGUua2luZCkge1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgICAgcmV0dXJuIGV2ZXJ5Tm9kZUNoaWxkKG5vZGUsIGNoaWxkID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5raW5kID09PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudCkge1xuICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eUFzc2lnbm1lbnQgPSA8dHMuUHJvcGVydHlBc3NpZ25tZW50PmNoaWxkO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHByb3BlcnR5QXNzaWdubWVudC5pbml0aWFsaXplciwgZm9sZGluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICAgIHJldHVybiBldmVyeU5vZGVDaGlsZChub2RlLCBjaGlsZCA9PiB0aGlzLmlzRm9sZGFibGVXb3JrZXIoY2hpbGQsIGZvbGRpbmcpKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IGNhbGxFeHByZXNzaW9uID0gPHRzLkNhbGxFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgICAgLy8gV2UgY2FuIGZvbGQgYSA8YXJyYXk+LmNvbmNhdCg8dj4pLlxuICAgICAgICAgIGlmIChpc01ldGhvZENhbGxPZihjYWxsRXhwcmVzc2lvbiwgJ2NvbmNhdCcpICYmXG4gICAgICAgICAgICAgIGFycmF5T3JFbXB0eShjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgY29uc3QgYXJyYXlOb2RlID0gKDx0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24+Y2FsbEV4cHJlc3Npb24uZXhwcmVzc2lvbikuZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRm9sZGFibGVXb3JrZXIoYXJyYXlOb2RlLCBmb2xkaW5nKSAmJlxuICAgICAgICAgICAgICAgIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHNbMF0sIGZvbGRpbmcpKSB7XG4gICAgICAgICAgICAgIC8vIEl0IG5lZWRzIHRvIGJlIGFuIGFycmF5LlxuICAgICAgICAgICAgICBjb25zdCBhcnJheVZhbHVlID0gdGhpcy5ldmFsdWF0ZU5vZGUoYXJyYXlOb2RlKTtcbiAgICAgICAgICAgICAgaWYgKGFycmF5VmFsdWUgJiYgQXJyYXkuaXNBcnJheShhcnJheVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2UgY2FuIGZvbGQgYSBjYWxsIHRvIENPTlNUX0VYUFJcbiAgICAgICAgICBpZiAoaXNDYWxsT2YoY2FsbEV4cHJlc3Npb24sICdDT05TVF9FWFBSJykgJiZcbiAgICAgICAgICAgICAgYXJyYXlPckVtcHR5KGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cykubGVuZ3RoID09PSAxKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHNbMF0sIGZvbGRpbmcpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk5vU3Vic3RpdHV0aW9uVGVtcGxhdGVMaXRlcmFsOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQ6XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UcnVlS2V5d29yZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlSGVhZDpcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlTWlkZGxlOlxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGVtcGxhdGVUYWlsOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGFyZW50aGVzaXplZEV4cHJlc3Npb246XG4gICAgICAgICAgY29uc3QgcGFyZW50aGVzaXplZEV4cHJlc3Npb24gPSA8dHMuUGFyZW50aGVzaXplZEV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHBhcmVudGhlc2l6ZWRFeHByZXNzaW9uLmV4cHJlc3Npb24sIGZvbGRpbmcpO1xuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmluYXJ5RXhwcmVzc2lvbjpcbiAgICAgICAgICBjb25zdCBiaW5hcnlFeHByZXNzaW9uID0gPHRzLkJpbmFyeUV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICBzd2l0Y2ggKGJpbmFyeUV4cHJlc3Npb24ub3BlcmF0b3JUb2tlbi5raW5kKSB7XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW46XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXN0ZXJpc2tUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TbGFzaFRva2VuOlxuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBlcmNlbnRUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BbXBlcnNhbmRBbXBlcnNhbmRUb2tlbjpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5CYXJCYXJUb2tlbjpcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihiaW5hcnlFeHByZXNzaW9uLmxlZnQsIGZvbGRpbmcpICYmXG4gICAgICAgICAgICAgICAgICB0aGlzLmlzRm9sZGFibGVXb3JrZXIoYmluYXJ5RXhwcmVzc2lvbi5yaWdodCwgZm9sZGluZyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbiA9IDx0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgICByZXR1cm4gdGhpcy5pc0ZvbGRhYmxlV29ya2VyKHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uLCBmb2xkaW5nKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uOlxuICAgICAgICAgIGNvbnN0IGVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uID0gPHRzLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaXNGb2xkYWJsZVdvcmtlcihlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uLCBmb2xkaW5nKSAmJlxuICAgICAgICAgICAgICB0aGlzLmlzRm9sZGFibGVXb3JrZXIoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uYXJndW1lbnRFeHByZXNzaW9uLCBmb2xkaW5nKTtcbiAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXI6XG4gICAgICAgICAgbGV0IGlkZW50aWZpZXIgPSA8dHMuSWRlbnRpZmllcj5ub2RlO1xuICAgICAgICAgIGxldCByZWZlcmVuY2UgPSB0aGlzLnN5bWJvbHMucmVzb2x2ZShpZGVudGlmaWVyLnRleHQpO1xuICAgICAgICAgIGlmIChyZWZlcmVuY2UgIT09IHVuZGVmaW5lZCAmJiBpc1ByaW1pdGl2ZShyZWZlcmVuY2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UZW1wbGF0ZUV4cHJlc3Npb246XG4gICAgICAgICAgY29uc3QgdGVtcGxhdGVFeHByZXNzaW9uID0gPHRzLlRlbXBsYXRlRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZUV4cHJlc3Npb24udGVtcGxhdGVTcGFucy5ldmVyeShcbiAgICAgICAgICAgICAgc3BhbiA9PiB0aGlzLmlzRm9sZGFibGVXb3JrZXIoc3Bhbi5leHByZXNzaW9uLCBmb2xkaW5nKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlIGEgSlNPTiBzZXJpYWxpYWJsZSBvYmplY3QgcmVwcmVzZW50aW5nIGBub2RlYC4gVGhlIGZvbGRhYmxlIHZhbHVlcyBpbiB0aGUgZXhwcmVzc2lvblxuICAgKiB0cmVlIGFyZSBmb2xkZWQuIEZvciBleGFtcGxlLCBhIG5vZGUgcmVwcmVzZW50aW5nIGAxICsgMmAgaXMgZm9sZGVkIGludG8gYDNgLlxuICAgKi9cbiAgcHVibGljIGV2YWx1YXRlTm9kZShub2RlOiB0cy5Ob2RlLCBwcmVmZXJSZWZlcmVuY2U/OiBib29sZWFuKTogTWV0YWRhdGFWYWx1ZSB7XG4gICAgY29uc3QgdCA9IHRoaXM7XG4gICAgbGV0IGVycm9yOiBNZXRhZGF0YUVycm9yfHVuZGVmaW5lZDtcblxuICAgIGZ1bmN0aW9uIHJlY29yZEVudHJ5KGVudHJ5OiBNZXRhZGF0YVZhbHVlLCBub2RlOiB0cy5Ob2RlKTogTWV0YWRhdGFWYWx1ZSB7XG4gICAgICBpZiAodC5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uKSB7XG4gICAgICAgIGNvbnN0IG5ld0VudHJ5ID0gdC5vcHRpb25zLnN1YnN0aXR1dGVFeHByZXNzaW9uKGVudHJ5LCBub2RlKTtcbiAgICAgICAgaWYgKHQucmVjb3JkRXhwb3J0ICYmIG5ld0VudHJ5ICE9IGVudHJ5ICYmIGlzTWV0YWRhdGFHbG9iYWxSZWZlcmVuY2VFeHByZXNzaW9uKG5ld0VudHJ5KSkge1xuICAgICAgICAgIHQucmVjb3JkRXhwb3J0KG5ld0VudHJ5Lm5hbWUsIGVudHJ5KTtcbiAgICAgICAgfVxuICAgICAgICBlbnRyeSA9IG5ld0VudHJ5O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlY29yZE1hcEVudHJ5KGVudHJ5LCBub2RlLCB0Lm5vZGVNYXApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRm9sZGFibGVFcnJvcih2YWx1ZTogYW55KTogdmFsdWUgaXMgTWV0YWRhdGFFcnJvciB7XG4gICAgICByZXR1cm4gIXQub3B0aW9ucy52ZXJib3NlSW52YWxpZEV4cHJlc3Npb24gJiYgaXNNZXRhZGF0YUVycm9yKHZhbHVlKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNvbHZlTmFtZSA9IChuYW1lOiBzdHJpbmcsIHByZWZlclJlZmVyZW5jZT86IGJvb2xlYW4pOiBNZXRhZGF0YVZhbHVlID0+IHtcbiAgICAgIGNvbnN0IHJlZmVyZW5jZSA9IHRoaXMuc3ltYm9scy5yZXNvbHZlKG5hbWUsIHByZWZlclJlZmVyZW5jZSk7XG4gICAgICBpZiAocmVmZXJlbmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gRW5jb2RlIGFzIGEgZ2xvYmFsIHJlZmVyZW5jZS4gU3RhdGljUmVmbGVjdG9yIHdpbGwgY2hlY2sgdGhlIHJlZmVyZW5jZS5cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZX0sIG5vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHJlZmVyZW5jZSAmJiBpc01ldGFkYXRhU3ltYm9saWNSZWZlcmVuY2VFeHByZXNzaW9uKHJlZmVyZW5jZSkpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHsuLi5yZWZlcmVuY2V9LCBub2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZWZlcmVuY2U7XG4gICAgfTtcblxuICAgIHN3aXRjaCAobm9kZS5raW5kKSB7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb246XG4gICAgICAgIGxldCBvYmo6IHtbbmFtZTogc3RyaW5nXTogYW55fSA9IHt9O1xuICAgICAgICBsZXQgcXVvdGVkOiBzdHJpbmdbXSA9IFtdO1xuICAgICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgY2hpbGQgPT4ge1xuICAgICAgICAgIHN3aXRjaCAoY2hpbGQua2luZCkge1xuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudDpcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFzc2lnbm1lbnQ6XG4gICAgICAgICAgICAgIGNvbnN0IGFzc2lnbm1lbnQgPSA8dHMuUHJvcGVydHlBc3NpZ25tZW50fHRzLlNob3J0aGFuZFByb3BlcnR5QXNzaWdubWVudD5jaGlsZDtcbiAgICAgICAgICAgICAgaWYgKGFzc2lnbm1lbnQubmFtZS5raW5kID09IHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSAoYXNzaWdubWVudC5uYW1lIGFzIHRzLlN0cmluZ0xpdGVyYWwpLnRleHQ7XG4gICAgICAgICAgICAgICAgcXVvdGVkLnB1c2gobmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlOYW1lID0gdGhpcy5uYW1lT2YoYXNzaWdubWVudC5uYW1lKTtcbiAgICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihwcm9wZXJ0eU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlWYWx1ZSA9IGlzUHJvcGVydHlBc3NpZ25tZW50KGFzc2lnbm1lbnQpID9cbiAgICAgICAgICAgICAgICAgIHRoaXMuZXZhbHVhdGVOb2RlKGFzc2lnbm1lbnQuaW5pdGlhbGl6ZXIsIC8qIHByZWZlclJlZmVyZW5jZSAqLyB0cnVlKSA6XG4gICAgICAgICAgICAgICAgICByZXNvbHZlTmFtZShwcm9wZXJ0eU5hbWUsIC8qIHByZWZlclJlZmVyZW5jZSAqLyB0cnVlKTtcbiAgICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihwcm9wZXJ0eVZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGVycm9yID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTsgIC8vIFN0b3AgdGhlIGZvckVhY2hDaGlsZC5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYmpbcHJvcGVydHlOYW1lXSA9IGlzUHJvcGVydHlBc3NpZ25tZW50KGFzc2lnbm1lbnQpID9cbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkRW50cnkocHJvcGVydHlWYWx1ZSwgYXNzaWdubWVudC5pbml0aWFsaXplcikgOlxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGVycm9yKSByZXR1cm4gZXJyb3I7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucXVvdGVkTmFtZXMgJiYgcXVvdGVkLmxlbmd0aCkge1xuICAgICAgICAgIG9ialsnJHF1b3RlZCQnXSA9IHF1b3RlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkob2JqLCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uOlxuICAgICAgICBsZXQgYXJyOiBNZXRhZGF0YVZhbHVlW10gPSBbXTtcbiAgICAgICAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIGNoaWxkID0+IHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZXZhbHVhdGVOb2RlKGNoaWxkLCAvKiBwcmVmZXJSZWZlcmVuY2UgKi8gdHJ1ZSk7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgZXJyb3JcbiAgICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKHZhbHVlKSkge1xuICAgICAgICAgICAgZXJyb3IgPSB2YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAgLy8gU3RvcCB0aGUgZm9yRWFjaENoaWxkLlxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEhhbmRsZSBzcHJlYWQgZXhwcmVzc2lvbnNcbiAgICAgICAgICBpZiAoaXNNZXRhZGF0YVN5bWJvbGljU3ByZWFkRXhwcmVzc2lvbih2YWx1ZSkpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlLmV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgICAgIGZvciAoY29uc3Qgc3ByZWFkVmFsdWUgb2YgdmFsdWUuZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgIGFyci5wdXNoKHNwcmVhZFZhbHVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYXJyLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGVycm9yKSByZXR1cm4gZXJyb3I7XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeShhcnIsIG5vZGUpO1xuICAgICAgY2FzZSBzcHJlYWRFbGVtZW50U3ludGF4S2luZDpcbiAgICAgICAgbGV0IHNwcmVhZEV4cHJlc3Npb24gPSB0aGlzLmV2YWx1YXRlTm9kZSgobm9kZSBhcyBhbnkpLmV4cHJlc3Npb24pO1xuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdzcHJlYWQnLCBleHByZXNzaW9uOiBzcHJlYWRFeHByZXNzaW9ufSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IGNhbGxFeHByZXNzaW9uID0gPHRzLkNhbGxFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGlmIChpc0NhbGxPZihjYWxsRXhwcmVzc2lvbiwgJ2ZvcndhcmRSZWYnKSAmJlxuICAgICAgICAgICAgYXJyYXlPckVtcHR5KGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50cykubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RBcmd1bWVudCA9IGNhbGxFeHByZXNzaW9uLmFyZ3VtZW50c1swXTtcbiAgICAgICAgICBpZiAoZmlyc3RBcmd1bWVudC5raW5kID09IHRzLlN5bnRheEtpbmQuQXJyb3dGdW5jdGlvbikge1xuICAgICAgICAgICAgY29uc3QgYXJyb3dGdW5jdGlvbiA9IDx0cy5BcnJvd0Z1bmN0aW9uPmZpcnN0QXJndW1lbnQ7XG4gICAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkodGhpcy5ldmFsdWF0ZU5vZGUoYXJyb3dGdW5jdGlvbi5ib2R5KSwgbm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcnJheU9yRW1wdHkoY2FsbEV4cHJlc3Npb24uYXJndW1lbnRzKS5tYXAoYXJnID0+IHRoaXMuZXZhbHVhdGVOb2RlKGFyZykpO1xuICAgICAgICBpZiAodGhpcy5pc0ZvbGRhYmxlKGNhbGxFeHByZXNzaW9uKSkge1xuICAgICAgICAgIGlmIChpc01ldGhvZENhbGxPZihjYWxsRXhwcmVzc2lvbiwgJ2NvbmNhdCcpKSB7XG4gICAgICAgICAgICBjb25zdCBhcnJheVZhbHVlID0gPE1ldGFkYXRhVmFsdWVbXT50aGlzLmV2YWx1YXRlTm9kZShcbiAgICAgICAgICAgICAgICAoPHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbj5jYWxsRXhwcmVzc2lvbi5leHByZXNzaW9uKS5leHByZXNzaW9uKTtcbiAgICAgICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IoYXJyYXlWYWx1ZSkpIHJldHVybiBhcnJheVZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5VmFsdWUuY29uY2F0KGFyZ3NbMF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBBbHdheXMgZm9sZCBhIENPTlNUX0VYUFIgZXZlbiBpZiB0aGUgYXJndW1lbnQgaXMgbm90IGZvbGRhYmxlLlxuICAgICAgICBpZiAoaXNDYWxsT2YoY2FsbEV4cHJlc3Npb24sICdDT05TVF9FWFBSJykgJiZcbiAgICAgICAgICAgIGFycmF5T3JFbXB0eShjYWxsRXhwcmVzc2lvbi5hcmd1bWVudHMpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShhcmdzWzBdLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gdGhpcy5ldmFsdWF0ZU5vZGUoY2FsbEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IoZXhwcmVzc2lvbikpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoZXhwcmVzc2lvbiwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJlc3VsdDogTWV0YWRhdGFTeW1ib2xpY0NhbGxFeHByZXNzaW9uID0ge19fc3ltYm9saWM6ICdjYWxsJywgZXhwcmVzc2lvbjogZXhwcmVzc2lvbn07XG4gICAgICAgIGlmIChhcmdzICYmIGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgcmVzdWx0LmFyZ3VtZW50cyA9IGFyZ3M7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHJlc3VsdCwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTmV3RXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgbmV3RXhwcmVzc2lvbiA9IDx0cy5OZXdFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGNvbnN0IG5ld0FyZ3MgPSBhcnJheU9yRW1wdHkobmV3RXhwcmVzc2lvbi5hcmd1bWVudHMpLm1hcChhcmcgPT4gdGhpcy5ldmFsdWF0ZU5vZGUoYXJnKSk7XG4gICAgICAgIGNvbnN0IG5ld1RhcmdldCA9IHRoaXMuZXZhbHVhdGVOb2RlKG5ld0V4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICAgIGlmIChpc01ldGFkYXRhRXJyb3IobmV3VGFyZ2V0KSkge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShuZXdUYXJnZXQsIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhbGw6IE1ldGFkYXRhU3ltYm9saWNDYWxsRXhwcmVzc2lvbiA9IHtfX3N5bWJvbGljOiAnbmV3JywgZXhwcmVzc2lvbjogbmV3VGFyZ2V0fTtcbiAgICAgICAgaWYgKG5ld0FyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgY2FsbC5hcmd1bWVudHMgPSBuZXdBcmdzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeShjYWxsLCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb246IHtcbiAgICAgICAgY29uc3QgcHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uID0gPHRzLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gdGhpcy5ldmFsdWF0ZU5vZGUocHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uLmV4cHJlc3Npb24pO1xuICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGV4cHJlc3Npb24sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lbWJlciA9IHRoaXMubmFtZU9mKHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbi5uYW1lKTtcbiAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihtZW1iZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KG1lbWJlciwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4cHJlc3Npb24gJiYgdGhpcy5pc0ZvbGRhYmxlKHByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uKSlcbiAgICAgICAgICByZXR1cm4gKDxhbnk+ZXhwcmVzc2lvbilbbWVtYmVyXTtcbiAgICAgICAgaWYgKGlzTWV0YWRhdGFNb2R1bGVSZWZlcmVuY2VFeHByZXNzaW9uKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgLy8gQSBzZWxlY3QgaW50byBhIG1vZHVsZSByZWZlcmVuY2UgYW5kIGJlIGNvbnZlcnRlZCBpbnRvIGEgcmVmZXJlbmNlIHRvIHRoZSBzeW1ib2xcbiAgICAgICAgICAvLyBpbiB0aGUgbW9kdWxlXG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgICB7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG1vZHVsZTogZXhwcmVzc2lvbi5tb2R1bGUsIG5hbWU6IG1lbWJlcn0sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3NlbGVjdCcsIGV4cHJlc3Npb24sIG1lbWJlcn0sIG5vZGUpO1xuICAgICAgfVxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uOiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uID0gPHRzLkVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSB0aGlzLmV2YWx1YXRlTm9kZShlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihleHByZXNzaW9uKSkge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShleHByZXNzaW9uLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVsZW1lbnRBY2Nlc3NFeHByZXNzaW9uLmFyZ3VtZW50RXhwcmVzc2lvbikge1xuICAgICAgICAgIHJldHVybiByZWNvcmRFbnRyeShlcnJvclN5bWJvbCgnRXhwcmVzc2lvbiBmb3JtIG5vdCBzdXBwb3J0ZWQnLCBub2RlKSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmV2YWx1YXRlTm9kZShlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5hcmd1bWVudEV4cHJlc3Npb24pO1xuICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKGV4cHJlc3Npb24pKSB7XG4gICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGV4cHJlc3Npb24sIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzRm9sZGFibGUoZWxlbWVudEFjY2Vzc0V4cHJlc3Npb24uZXhwcmVzc2lvbikgJiZcbiAgICAgICAgICAgIHRoaXMuaXNGb2xkYWJsZShlbGVtZW50QWNjZXNzRXhwcmVzc2lvbi5hcmd1bWVudEV4cHJlc3Npb24pKVxuICAgICAgICAgIHJldHVybiAoPGFueT5leHByZXNzaW9uKVs8c3RyaW5nfG51bWJlcj5pbmRleF07XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ2luZGV4JywgZXhwcmVzc2lvbiwgaW5kZXh9LCBub2RlKTtcbiAgICAgIH1cbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyOlxuICAgICAgICBjb25zdCBpZGVudGlmaWVyID0gPHRzLklkZW50aWZpZXI+bm9kZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGlkZW50aWZpZXIudGV4dDtcbiAgICAgICAgcmV0dXJuIHJlc29sdmVOYW1lKG5hbWUsIHByZWZlclJlZmVyZW5jZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZVJlZmVyZW5jZTpcbiAgICAgICAgY29uc3QgdHlwZVJlZmVyZW5jZU5vZGUgPSA8dHMuVHlwZVJlZmVyZW5jZU5vZGU+bm9kZTtcbiAgICAgICAgY29uc3QgdHlwZU5hbWVOb2RlID0gdHlwZVJlZmVyZW5jZU5vZGUudHlwZU5hbWU7XG4gICAgICAgIGNvbnN0IGdldFJlZmVyZW5jZTogKHR5cGVOYW1lTm9kZTogdHMuSWRlbnRpZmllcnx0cy5RdWFsaWZpZWROYW1lKSA9PiBNZXRhZGF0YVZhbHVlID1cbiAgICAgICAgICAgIG5vZGUgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZU5hbWVOb2RlLmtpbmQgPT09IHRzLlN5bnRheEtpbmQuUXVhbGlmaWVkTmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YWxpZmllZE5hbWUgPSA8dHMuUXVhbGlmaWVkTmFtZT5ub2RlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLmV2YWx1YXRlTm9kZShxdWFsaWZpZWROYW1lLmxlZnQpO1xuICAgICAgICAgICAgICAgIGlmIChpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbihsZWZ0KSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgICAgICAgICAgIDxNZXRhZGF0YUltcG9ydGVkU3ltYm9sUmVmZXJlbmNlRXhwcmVzc2lvbj57XG4gICAgICAgICAgICAgICAgICAgICAgICBfX3N5bWJvbGljOiAncmVmZXJlbmNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZTogbGVmdC5tb2R1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBxdWFsaWZpZWROYW1lLnJpZ2h0LnRleHRcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBSZWNvcmQgYSB0eXBlIHJlZmVyZW5jZSB0byBhIGRlY2xhcmVkIHR5cGUgYXMgYSBzZWxlY3QuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtfX3N5bWJvbGljOiAnc2VsZWN0JywgZXhwcmVzc2lvbjogbGVmdCwgbWVtYmVyOiBxdWFsaWZpZWROYW1lLnJpZ2h0LnRleHR9O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSA8dHMuSWRlbnRpZmllcj50eXBlTmFtZU5vZGU7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ltYm9sID0gdGhpcy5zeW1ib2xzLnJlc29sdmUoaWRlbnRpZmllci50ZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAoaXNGb2xkYWJsZUVycm9yKHN5bWJvbCkgfHwgaXNNZXRhZGF0YVN5bWJvbGljUmVmZXJlbmNlRXhwcmVzc2lvbihzeW1ib2wpKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoc3ltYm9sLCBub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KFxuICAgICAgICAgICAgICAgICAgICBlcnJvclN5bWJvbCgnQ291bGQgbm90IHJlc29sdmUgdHlwZScsIG5vZGUsIHt0eXBlTmFtZTogaWRlbnRpZmllci50ZXh0fSksIG5vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICBjb25zdCB0eXBlUmVmZXJlbmNlID0gZ2V0UmVmZXJlbmNlKHR5cGVOYW1lTm9kZSk7XG4gICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IodHlwZVJlZmVyZW5jZSkpIHtcbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkodHlwZVJlZmVyZW5jZSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc01ldGFkYXRhTW9kdWxlUmVmZXJlbmNlRXhwcmVzc2lvbih0eXBlUmVmZXJlbmNlKSAmJlxuICAgICAgICAgICAgdHlwZVJlZmVyZW5jZU5vZGUudHlwZUFyZ3VtZW50cyAmJiB0eXBlUmVmZXJlbmNlTm9kZS50eXBlQXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGFyZ3MgPSB0eXBlUmVmZXJlbmNlTm9kZS50eXBlQXJndW1lbnRzLm1hcChlbGVtZW50ID0+IHRoaXMuZXZhbHVhdGVOb2RlKGVsZW1lbnQpKTtcbiAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgdHlwZWNhc3Qgd2hlbiB1cGdyYWRlZCB0byAyLjAgYXMgaXQgd2lsbCBiZSBjb3JyZWN0bHkgaW5mZXJyZWQuXG4gICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiAxLjkgZG8gbm90IGluZmVyIHRoaXMgY29ycmVjdGx5LlxuICAgICAgICAgICg8TWV0YWRhdGFJbXBvcnRlZFN5bWJvbFJlZmVyZW5jZUV4cHJlc3Npb24+dHlwZVJlZmVyZW5jZSkuYXJndW1lbnRzID0gYXJncztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkodHlwZVJlZmVyZW5jZSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVW5pb25UeXBlOlxuICAgICAgICBjb25zdCB1bmlvblR5cGUgPSA8dHMuVW5pb25UeXBlTm9kZT5ub2RlO1xuICAgICAgICAvLyBSZW1vdmUgbnVsbCBhbmQgdW5kZWZpbmVkIGZyb20gdGhlIGxpc3Qgb2YgdW5pb25zLlxuICAgICAgICAvLyBUT0RPKGFsYW4tYWdpdXM0KTogcmVtb3ZlIGBuLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmRgIHdoZW5cbiAgICAgICAgLy8gVFMgMy45IHN1cHBvcnQgaXMgZHJvcHBlZC4gSW4gVFMgNC4wIE51bGxLZXl3b3JkIGlzIGEgY2hpbGQgb2YgTGl0ZXJhbFR5cGUuXG4gICAgICAgIGNvbnN0IHJlZmVyZW5jZXMgPVxuICAgICAgICAgICAgdW5pb25UeXBlLnR5cGVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgbiA9PiBuLmtpbmQgIT09IHRzLlN5bnRheEtpbmQuTnVsbEtleXdvcmQgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIG4ua2luZCAhPT0gdHMuU3ludGF4S2luZC5VbmRlZmluZWRLZXl3b3JkICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhKHRzLmlzTGl0ZXJhbFR5cGVOb2RlKG4pICYmIG4ubGl0ZXJhbC5raW5kID09PSB0cy5TeW50YXhLaW5kLk51bGxLZXl3b3JkKSlcbiAgICAgICAgICAgICAgICAubWFwKG4gPT4gdGhpcy5ldmFsdWF0ZU5vZGUobikpO1xuXG4gICAgICAgIC8vIFRoZSByZW1tYWluaW5nIHJlZmVyZW5jZSBtdXN0IGJlIHRoZSBzYW1lLiBJZiB0d28gaGF2ZSB0eXBlIGFyZ3VtZW50cyBjb25zaWRlciB0aGVtXG4gICAgICAgIC8vIGRpZmZlcmVudCBldmVuIGlmIHRoZSB0eXBlIGFyZ3VtZW50cyBhcmUgdGhlIHNhbWUuXG4gICAgICAgIGxldCBjYW5kaWRhdGU6IGFueSA9IG51bGw7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVmZXJlbmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXNbaV07XG4gICAgICAgICAgaWYgKGlzTWV0YWRhdGFTeW1ib2xpY1JlZmVyZW5jZUV4cHJlc3Npb24ocmVmZXJlbmNlKSkge1xuICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZSkge1xuICAgICAgICAgICAgICBpZiAoKHJlZmVyZW5jZSBhcyBhbnkpLm5hbWUgPT0gY2FuZGlkYXRlLm5hbWUgJiZcbiAgICAgICAgICAgICAgICAgIChyZWZlcmVuY2UgYXMgYW55KS5tb2R1bGUgPT0gY2FuZGlkYXRlLm1vZHVsZSAmJiAhKHJlZmVyZW5jZSBhcyBhbnkpLmFyZ3VtZW50cykge1xuICAgICAgICAgICAgICAgIGNhbmRpZGF0ZSA9IHJlZmVyZW5jZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2FuZGlkYXRlID0gcmVmZXJlbmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcmVmZXJlbmNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FuZGlkYXRlKSByZXR1cm4gY2FuZGlkYXRlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Ob1N1YnN0aXR1dGlvblRlbXBsYXRlTGl0ZXJhbDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsOlxuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRlbXBsYXRlSGVhZDpcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UZW1wbGF0ZVRhaWw6XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGVtcGxhdGVNaWRkbGU6XG4gICAgICAgIHJldHVybiAoPHRzLkxpdGVyYWxMaWtlTm9kZT5ub2RlKS50ZXh0O1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk51bWVyaWNMaXRlcmFsOlxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCgoPHRzLkxpdGVyYWxFeHByZXNzaW9uPm5vZGUpLnRleHQpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFueUtleXdvcmQ6XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ3JlZmVyZW5jZScsIG5hbWU6ICdhbnknfSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU3RyaW5nS2V5d29yZDpcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncmVmZXJlbmNlJywgbmFtZTogJ3N0cmluZyd9LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdW1iZXJLZXl3b3JkOlxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBuYW1lOiAnbnVtYmVyJ30sIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJvb2xlYW5LZXl3b3JkOlxuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoe19fc3ltYm9saWM6ICdyZWZlcmVuY2UnLCBuYW1lOiAnYm9vbGVhbid9LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5BcnJheVR5cGU6XG4gICAgICAgIGNvbnN0IGFycmF5VHlwZU5vZGUgPSA8dHMuQXJyYXlUeXBlTm9kZT5ub2RlO1xuICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIF9fc3ltYm9saWM6ICdyZWZlcmVuY2UnLFxuICAgICAgICAgICAgICBuYW1lOiAnQXJyYXknLFxuICAgICAgICAgICAgICBhcmd1bWVudHM6IFt0aGlzLmV2YWx1YXRlTm9kZShhcnJheVR5cGVOb2RlLmVsZW1lbnRUeXBlKV1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5OdWxsS2V5d29yZDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHJ1ZUtleXdvcmQ6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkZhbHNlS2V5d29yZDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBhcmVudGhlc2l6ZWRFeHByZXNzaW9uOlxuICAgICAgICBjb25zdCBwYXJlbnRoZXNpemVkRXhwcmVzc2lvbiA9IDx0cy5QYXJlbnRoZXNpemVkRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZU5vZGUocGFyZW50aGVzaXplZEV4cHJlc3Npb24uZXhwcmVzc2lvbik7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVHlwZUFzc2VydGlvbkV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IHR5cGVBc3NlcnRpb24gPSA8dHMuVHlwZUFzc2VydGlvbj5ub2RlO1xuICAgICAgICByZXR1cm4gdGhpcy5ldmFsdWF0ZU5vZGUodHlwZUFzc2VydGlvbi5leHByZXNzaW9uKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5QcmVmaXhVbmFyeUV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IHByZWZpeFVuYXJ5RXhwcmVzc2lvbiA9IDx0cy5QcmVmaXhVbmFyeUV4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgY29uc3Qgb3BlcmFuZCA9IHRoaXMuZXZhbHVhdGVOb2RlKHByZWZpeFVuYXJ5RXhwcmVzc2lvbi5vcGVyYW5kKTtcbiAgICAgICAgaWYgKGlzRGVmaW5lZChvcGVyYW5kKSAmJiBpc1ByaW1pdGl2ZShvcGVyYW5kKSkge1xuICAgICAgICAgIHN3aXRjaCAocHJlZml4VW5hcnlFeHByZXNzaW9uLm9wZXJhdG9yKSB7XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgICByZXR1cm4gKyhvcGVyYW5kIGFzIGFueSk7XG4gICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTWludXNUb2tlbjpcbiAgICAgICAgICAgICAgcmV0dXJuIC0ob3BlcmFuZCBhcyBhbnkpO1xuICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlRpbGRlVG9rZW46XG4gICAgICAgICAgICAgIHJldHVybiB+KG9wZXJhbmQgYXMgYW55KTtcbiAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvblRva2VuOlxuICAgICAgICAgICAgICByZXR1cm4gIW9wZXJhbmQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBvcGVyYXRvclRleHQ6ICcrJ3wnLSd8J34nfCchJztcbiAgICAgICAgc3dpdGNoIChwcmVmaXhVbmFyeUV4cHJlc3Npb24ub3BlcmF0b3IpIHtcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuUGx1c1Rva2VuOlxuICAgICAgICAgICAgb3BlcmF0b3JUZXh0ID0gJysnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW46XG4gICAgICAgICAgICBvcGVyYXRvclRleHQgPSAnLSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGlsZGVUb2tlbjpcbiAgICAgICAgICAgIG9wZXJhdG9yVGV4dCA9ICd+JztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FeGNsYW1hdGlvblRva2VuOlxuICAgICAgICAgICAgb3BlcmF0b3JUZXh0ID0gJyEnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KHtfX3N5bWJvbGljOiAncHJlJywgb3BlcmF0b3I6IG9wZXJhdG9yVGV4dCwgb3BlcmFuZDogb3BlcmFuZH0sIG5vZGUpO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJpbmFyeUV4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IGJpbmFyeUV4cHJlc3Npb24gPSA8dHMuQmluYXJ5RXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5ldmFsdWF0ZU5vZGUoYmluYXJ5RXhwcmVzc2lvbi5sZWZ0KTtcbiAgICAgICAgY29uc3QgcmlnaHQgPSB0aGlzLmV2YWx1YXRlTm9kZShiaW5hcnlFeHByZXNzaW9uLnJpZ2h0KTtcbiAgICAgICAgaWYgKGlzRGVmaW5lZChsZWZ0KSAmJiBpc0RlZmluZWQocmlnaHQpKSB7XG4gICAgICAgICAgaWYgKGlzUHJpbWl0aXZlKGxlZnQpICYmIGlzUHJpbWl0aXZlKHJpZ2h0KSlcbiAgICAgICAgICAgIHN3aXRjaCAoYmluYXJ5RXhwcmVzc2lvbi5vcGVyYXRvclRva2VuLmtpbmQpIHtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkJhckJhclRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgfHwgPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZEFtcGVyc2FuZFRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgJiYgPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkFtcGVyc2FuZFRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgJiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQmFyVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCB8IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DYXJldFRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgXiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXF1YWxzRXF1YWxzVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA9PSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhjbGFtYXRpb25FcXVhbHNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ICE9IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5FcXVhbHNFcXVhbHNFcXVhbHNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ID09PSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuRXhjbGFtYXRpb25FcXVhbHNFcXVhbHNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ICE9PSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTGVzc1RoYW5Ub2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0IDwgPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA+IDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5MZXNzVGhhbkVxdWFsc1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgPD0gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkdyZWF0ZXJUaGFuRXF1YWxzVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA+PSA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuTGVzc1RoYW5MZXNzVGhhblRva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiAoPGFueT5sZWZ0KSA8PCAoPGFueT5yaWdodCk7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5HcmVhdGVyVGhhbkdyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA+PiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuR3JlYXRlclRoYW5HcmVhdGVyVGhhbkdyZWF0ZXJUaGFuVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCA+Pj4gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBsdXNUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ICsgPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLk1pbnVzVG9rZW46XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxhbnk+bGVmdCAtIDxhbnk+cmlnaHQ7XG4gICAgICAgICAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuOlxuICAgICAgICAgICAgICAgIHJldHVybiA8YW55PmxlZnQgKiA8YW55PnJpZ2h0O1xuICAgICAgICAgICAgICBjYXNlIHRzLlN5bnRheEtpbmQuU2xhc2hUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0IC8gPGFueT5yaWdodDtcbiAgICAgICAgICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLlBlcmNlbnRUb2tlbjpcbiAgICAgICAgICAgICAgICByZXR1cm4gPGFueT5sZWZ0ICUgPGFueT5yaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVjb3JkRW50cnkoXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfX3N5bWJvbGljOiAnYmlub3AnLFxuICAgICAgICAgICAgICAgIG9wZXJhdG9yOiBiaW5hcnlFeHByZXNzaW9uLm9wZXJhdG9yVG9rZW4uZ2V0VGV4dCgpLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSB0cy5TeW50YXhLaW5kLkNvbmRpdGlvbmFsRXhwcmVzc2lvbjpcbiAgICAgICAgY29uc3QgY29uZGl0aW9uYWxFeHByZXNzaW9uID0gPHRzLkNvbmRpdGlvbmFsRXhwcmVzc2lvbj5ub2RlO1xuICAgICAgICBjb25zdCBjb25kaXRpb24gPSB0aGlzLmV2YWx1YXRlTm9kZShjb25kaXRpb25hbEV4cHJlc3Npb24uY29uZGl0aW9uKTtcbiAgICAgICAgY29uc3QgdGhlbkV4cHJlc3Npb24gPSB0aGlzLmV2YWx1YXRlTm9kZShjb25kaXRpb25hbEV4cHJlc3Npb24ud2hlblRydWUpO1xuICAgICAgICBjb25zdCBlbHNlRXhwcmVzc2lvbiA9IHRoaXMuZXZhbHVhdGVOb2RlKGNvbmRpdGlvbmFsRXhwcmVzc2lvbi53aGVuRmFsc2UpO1xuICAgICAgICBpZiAoaXNQcmltaXRpdmUoY29uZGl0aW9uKSkge1xuICAgICAgICAgIHJldHVybiBjb25kaXRpb24gPyB0aGVuRXhwcmVzc2lvbiA6IGVsc2VFeHByZXNzaW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeSh7X19zeW1ib2xpYzogJ2lmJywgY29uZGl0aW9uLCB0aGVuRXhwcmVzc2lvbiwgZWxzZUV4cHJlc3Npb259LCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5GdW5jdGlvbkV4cHJlc3Npb246XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuQXJyb3dGdW5jdGlvbjpcbiAgICAgICAgcmV0dXJuIHJlY29yZEVudHJ5KGVycm9yU3ltYm9sKCdMYW1iZGEgbm90IHN1cHBvcnRlZCcsIG5vZGUpLCBub2RlKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5UYWdnZWRUZW1wbGF0ZUV4cHJlc3Npb246XG4gICAgICAgIHJldHVybiByZWNvcmRFbnRyeShcbiAgICAgICAgICAgIGVycm9yU3ltYm9sKCdUYWdnZWQgdGVtcGxhdGUgZXhwcmVzc2lvbnMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gbWV0YWRhdGEnLCBub2RlKSwgbm9kZSk7XG4gICAgICBjYXNlIHRzLlN5bnRheEtpbmQuVGVtcGxhdGVFeHByZXNzaW9uOlxuICAgICAgICBjb25zdCB0ZW1wbGF0ZUV4cHJlc3Npb24gPSA8dHMuVGVtcGxhdGVFeHByZXNzaW9uPm5vZGU7XG4gICAgICAgIGlmICh0aGlzLmlzRm9sZGFibGUobm9kZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGVtcGxhdGVFeHByZXNzaW9uLnRlbXBsYXRlU3BhbnMucmVkdWNlKFxuICAgICAgICAgICAgICAocHJldmlvdXMsIGN1cnJlbnQpID0+IHByZXZpb3VzICsgPHN0cmluZz50aGlzLmV2YWx1YXRlTm9kZShjdXJyZW50LmV4cHJlc3Npb24pICtcbiAgICAgICAgICAgICAgICAgIDxzdHJpbmc+dGhpcy5ldmFsdWF0ZU5vZGUoY3VycmVudC5saXRlcmFsKSxcbiAgICAgICAgICAgICAgdGhpcy5ldmFsdWF0ZU5vZGUodGVtcGxhdGVFeHByZXNzaW9uLmhlYWQpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGVtcGxhdGVFeHByZXNzaW9uLnRlbXBsYXRlU3BhbnMucmVkdWNlKChwcmV2aW91cywgY3VycmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhwciA9IHRoaXMuZXZhbHVhdGVOb2RlKGN1cnJlbnQuZXhwcmVzc2lvbik7XG4gICAgICAgICAgICBjb25zdCBsaXRlcmFsID0gdGhpcy5ldmFsdWF0ZU5vZGUoY3VycmVudC5saXRlcmFsKTtcbiAgICAgICAgICAgIGlmIChpc0ZvbGRhYmxlRXJyb3IoZXhwcikpIHJldHVybiBleHByO1xuICAgICAgICAgICAgaWYgKGlzRm9sZGFibGVFcnJvcihsaXRlcmFsKSkgcmV0dXJuIGxpdGVyYWw7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByZXZpb3VzID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZXhwciA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgbGl0ZXJhbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgZXhwciArIGxpdGVyYWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gZXhwcjtcbiAgICAgICAgICAgIGlmIChwcmV2aW91cyAhPT0gJycpIHtcbiAgICAgICAgICAgICAgcmVzdWx0ID0ge19fc3ltYm9saWM6ICdiaW5vcCcsIG9wZXJhdG9yOiAnKycsIGxlZnQ6IHByZXZpb3VzLCByaWdodDogZXhwcn07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGl0ZXJhbCAhPSAnJykge1xuICAgICAgICAgICAgICByZXN1bHQgPSB7X19zeW1ib2xpYzogJ2Jpbm9wJywgb3BlcmF0b3I6ICcrJywgbGVmdDogcmVzdWx0LCByaWdodDogbGl0ZXJhbH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgIH0sIHRoaXMuZXZhbHVhdGVOb2RlKHRlbXBsYXRlRXhwcmVzc2lvbi5oZWFkKSk7XG4gICAgICAgIH1cbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5Bc0V4cHJlc3Npb246XG4gICAgICAgIGNvbnN0IGFzRXhwcmVzc2lvbiA9IDx0cy5Bc0V4cHJlc3Npb24+bm9kZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZhbHVhdGVOb2RlKGFzRXhwcmVzc2lvbi5leHByZXNzaW9uKTtcbiAgICAgIGNhc2UgdHMuU3ludGF4S2luZC5DbGFzc0V4cHJlc3Npb246XG4gICAgICAgIHJldHVybiB7X19zeW1ib2xpYzogJ2NsYXNzJ307XG4gICAgfVxuICAgIHJldHVybiByZWNvcmRFbnRyeShlcnJvclN5bWJvbCgnRXhwcmVzc2lvbiBmb3JtIG5vdCBzdXBwb3J0ZWQnLCBub2RlKSwgbm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQcm9wZXJ0eUFzc2lnbm1lbnQobm9kZTogdHMuTm9kZSk6IG5vZGUgaXMgdHMuUHJvcGVydHlBc3NpZ25tZW50IHtcbiAgcmV0dXJuIG5vZGUua2luZCA9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QXNzaWdubWVudDtcbn1cblxuY29uc3QgZW1wdHkgPSB0cy5jcmVhdGVOb2RlQXJyYXk8YW55PigpO1xuXG5mdW5jdGlvbiBhcnJheU9yRW1wdHk8VCBleHRlbmRzIHRzLk5vZGU+KHY6IHRzLk5vZGVBcnJheTxUPnx1bmRlZmluZWQpOiB0cy5Ob2RlQXJyYXk8VD4ge1xuICByZXR1cm4gdiB8fCBlbXB0eTtcbn1cbiJdfQ==