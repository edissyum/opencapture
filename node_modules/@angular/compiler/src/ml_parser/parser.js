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
        define("@angular/compiler/src/ml_parser/parser", ["require", "exports", "tslib", "@angular/compiler/src/parse_util", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/lexer", "@angular/compiler/src/ml_parser/tags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = exports.ParseTreeResult = exports.TreeError = void 0;
    var tslib_1 = require("tslib");
    var parse_util_1 = require("@angular/compiler/src/parse_util");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var lex = require("@angular/compiler/src/ml_parser/lexer");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var TreeError = /** @class */ (function (_super) {
        tslib_1.__extends(TreeError, _super);
        function TreeError(elementName, span, msg) {
            var _this = _super.call(this, span, msg) || this;
            _this.elementName = elementName;
            return _this;
        }
        TreeError.create = function (elementName, span, msg) {
            return new TreeError(elementName, span, msg);
        };
        return TreeError;
    }(parse_util_1.ParseError));
    exports.TreeError = TreeError;
    var ParseTreeResult = /** @class */ (function () {
        function ParseTreeResult(rootNodes, errors) {
            this.rootNodes = rootNodes;
            this.errors = errors;
        }
        return ParseTreeResult;
    }());
    exports.ParseTreeResult = ParseTreeResult;
    var Parser = /** @class */ (function () {
        function Parser(getTagDefinition) {
            this.getTagDefinition = getTagDefinition;
        }
        Parser.prototype.parse = function (source, url, options) {
            var tokenizeResult = lex.tokenize(source, url, this.getTagDefinition, options);
            var parser = new _TreeBuilder(tokenizeResult.tokens, this.getTagDefinition);
            parser.build();
            return new ParseTreeResult(parser.rootNodes, tokenizeResult.errors.concat(parser.errors));
        };
        return Parser;
    }());
    exports.Parser = Parser;
    var _TreeBuilder = /** @class */ (function () {
        function _TreeBuilder(tokens, getTagDefinition) {
            this.tokens = tokens;
            this.getTagDefinition = getTagDefinition;
            this._index = -1;
            this._elementStack = [];
            this.rootNodes = [];
            this.errors = [];
            this._advance();
        }
        _TreeBuilder.prototype.build = function () {
            while (this._peek.type !== lex.TokenType.EOF) {
                if (this._peek.type === lex.TokenType.TAG_OPEN_START ||
                    this._peek.type === lex.TokenType.INCOMPLETE_TAG_OPEN) {
                    this._consumeStartTag(this._advance());
                }
                else if (this._peek.type === lex.TokenType.TAG_CLOSE) {
                    this._consumeEndTag(this._advance());
                }
                else if (this._peek.type === lex.TokenType.CDATA_START) {
                    this._closeVoidElement();
                    this._consumeCdata(this._advance());
                }
                else if (this._peek.type === lex.TokenType.COMMENT_START) {
                    this._closeVoidElement();
                    this._consumeComment(this._advance());
                }
                else if (this._peek.type === lex.TokenType.TEXT || this._peek.type === lex.TokenType.RAW_TEXT ||
                    this._peek.type === lex.TokenType.ESCAPABLE_RAW_TEXT) {
                    this._closeVoidElement();
                    this._consumeText(this._advance());
                }
                else if (this._peek.type === lex.TokenType.EXPANSION_FORM_START) {
                    this._consumeExpansion(this._advance());
                }
                else {
                    // Skip all other tokens...
                    this._advance();
                }
            }
        };
        _TreeBuilder.prototype._advance = function () {
            var prev = this._peek;
            if (this._index < this.tokens.length - 1) {
                // Note: there is always an EOF token at the end
                this._index++;
            }
            this._peek = this.tokens[this._index];
            return prev;
        };
        _TreeBuilder.prototype._advanceIf = function (type) {
            if (this._peek.type === type) {
                return this._advance();
            }
            return null;
        };
        _TreeBuilder.prototype._consumeCdata = function (_startToken) {
            this._consumeText(this._advance());
            this._advanceIf(lex.TokenType.CDATA_END);
        };
        _TreeBuilder.prototype._consumeComment = function (token) {
            var text = this._advanceIf(lex.TokenType.RAW_TEXT);
            this._advanceIf(lex.TokenType.COMMENT_END);
            var value = text != null ? text.parts[0].trim() : null;
            this._addToParent(new html.Comment(value, token.sourceSpan));
        };
        _TreeBuilder.prototype._consumeExpansion = function (token) {
            var switchValue = this._advance();
            var type = this._advance();
            var cases = [];
            // read =
            while (this._peek.type === lex.TokenType.EXPANSION_CASE_VALUE) {
                var expCase = this._parseExpansionCase();
                if (!expCase)
                    return; // error
                cases.push(expCase);
            }
            // read the final }
            if (this._peek.type !== lex.TokenType.EXPANSION_FORM_END) {
                this.errors.push(TreeError.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '}'."));
                return;
            }
            var sourceSpan = new parse_util_1.ParseSourceSpan(token.sourceSpan.start, this._peek.sourceSpan.end, token.sourceSpan.fullStart);
            this._addToParent(new html.Expansion(switchValue.parts[0], type.parts[0], cases, sourceSpan, switchValue.sourceSpan));
            this._advance();
        };
        _TreeBuilder.prototype._parseExpansionCase = function () {
            var value = this._advance();
            // read {
            if (this._peek.type !== lex.TokenType.EXPANSION_CASE_EXP_START) {
                this.errors.push(TreeError.create(null, this._peek.sourceSpan, "Invalid ICU message. Missing '{'."));
                return null;
            }
            // read until }
            var start = this._advance();
            var exp = this._collectExpansionExpTokens(start);
            if (!exp)
                return null;
            var end = this._advance();
            exp.push(new lex.Token(lex.TokenType.EOF, [], end.sourceSpan));
            // parse everything in between { and }
            var expansionCaseParser = new _TreeBuilder(exp, this.getTagDefinition);
            expansionCaseParser.build();
            if (expansionCaseParser.errors.length > 0) {
                this.errors = this.errors.concat(expansionCaseParser.errors);
                return null;
            }
            var sourceSpan = new parse_util_1.ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end, value.sourceSpan.fullStart);
            var expSourceSpan = new parse_util_1.ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end, start.sourceSpan.fullStart);
            return new html.ExpansionCase(value.parts[0], expansionCaseParser.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
        };
        _TreeBuilder.prototype._collectExpansionExpTokens = function (start) {
            var exp = [];
            var expansionFormStack = [lex.TokenType.EXPANSION_CASE_EXP_START];
            while (true) {
                if (this._peek.type === lex.TokenType.EXPANSION_FORM_START ||
                    this._peek.type === lex.TokenType.EXPANSION_CASE_EXP_START) {
                    expansionFormStack.push(this._peek.type);
                }
                if (this._peek.type === lex.TokenType.EXPANSION_CASE_EXP_END) {
                    if (lastOnStack(expansionFormStack, lex.TokenType.EXPANSION_CASE_EXP_START)) {
                        expansionFormStack.pop();
                        if (expansionFormStack.length == 0)
                            return exp;
                    }
                    else {
                        this.errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                        return null;
                    }
                }
                if (this._peek.type === lex.TokenType.EXPANSION_FORM_END) {
                    if (lastOnStack(expansionFormStack, lex.TokenType.EXPANSION_FORM_START)) {
                        expansionFormStack.pop();
                    }
                    else {
                        this.errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                        return null;
                    }
                }
                if (this._peek.type === lex.TokenType.EOF) {
                    this.errors.push(TreeError.create(null, start.sourceSpan, "Invalid ICU message. Missing '}'."));
                    return null;
                }
                exp.push(this._advance());
            }
        };
        _TreeBuilder.prototype._consumeText = function (token) {
            var text = token.parts[0];
            if (text.length > 0 && text[0] == '\n') {
                var parent_1 = this._getParentElement();
                if (parent_1 != null && parent_1.children.length == 0 &&
                    this.getTagDefinition(parent_1.name).ignoreFirstLf) {
                    text = text.substring(1);
                }
            }
            if (text.length > 0) {
                this._addToParent(new html.Text(text, token.sourceSpan));
            }
        };
        _TreeBuilder.prototype._closeVoidElement = function () {
            var el = this._getParentElement();
            if (el && this.getTagDefinition(el.name).isVoid) {
                this._elementStack.pop();
            }
        };
        _TreeBuilder.prototype._consumeStartTag = function (startTagToken) {
            var _a = tslib_1.__read(startTagToken.parts, 2), prefix = _a[0], name = _a[1];
            var attrs = [];
            while (this._peek.type === lex.TokenType.ATTR_NAME) {
                attrs.push(this._consumeAttr(this._advance()));
            }
            var fullName = this._getElementFullName(prefix, name, this._getParentElement());
            var selfClosing = false;
            // Note: There could have been a tokenizer error
            // so that we don't get a token for the end tag...
            if (this._peek.type === lex.TokenType.TAG_OPEN_END_VOID) {
                this._advance();
                selfClosing = true;
                var tagDef = this.getTagDefinition(fullName);
                if (!(tagDef.canSelfClose || tags_1.getNsPrefix(fullName) !== null || tagDef.isVoid)) {
                    this.errors.push(TreeError.create(fullName, startTagToken.sourceSpan, "Only void and foreign elements can be self closed \"" + startTagToken.parts[1] + "\""));
                }
            }
            else if (this._peek.type === lex.TokenType.TAG_OPEN_END) {
                this._advance();
                selfClosing = false;
            }
            var end = this._peek.sourceSpan.start;
            var span = new parse_util_1.ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
            // Create a separate `startSpan` because `span` will be modified when there is an `end` span.
            var startSpan = new parse_util_1.ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
            var el = new html.Element(fullName, attrs, [], span, startSpan, undefined);
            this._pushElement(el);
            if (selfClosing) {
                // Elements that are self-closed have their `endSourceSpan` set to the full span, as the
                // element start tag also represents the end tag.
                this._popElement(fullName, span);
            }
            else if (startTagToken.type === lex.TokenType.INCOMPLETE_TAG_OPEN) {
                // We already know the opening tag is not complete, so it is unlikely it has a corresponding
                // close tag. Let's optimistically parse it as a full element and emit an error.
                this._popElement(fullName, null);
                this.errors.push(TreeError.create(fullName, span, "Opening tag \"" + fullName + "\" not terminated."));
            }
        };
        _TreeBuilder.prototype._pushElement = function (el) {
            var parentEl = this._getParentElement();
            if (parentEl && this.getTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this._elementStack.pop();
            }
            this._addToParent(el);
            this._elementStack.push(el);
        };
        _TreeBuilder.prototype._consumeEndTag = function (endTagToken) {
            var fullName = this._getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
            if (this.getTagDefinition(fullName).isVoid) {
                this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, "Void elements do not have end tags \"" + endTagToken.parts[1] + "\""));
            }
            else if (!this._popElement(fullName, endTagToken.sourceSpan)) {
                var errMsg = "Unexpected closing tag \"" + fullName + "\". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags";
                this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, errMsg));
            }
        };
        /**
         * Closes the nearest element with the tag name `fullName` in the parse tree.
         * `endSourceSpan` is the span of the closing tag, or null if the element does
         * not have a closing tag (for example, this happens when an incomplete
         * opening tag is recovered).
         */
        _TreeBuilder.prototype._popElement = function (fullName, endSourceSpan) {
            for (var stackIndex = this._elementStack.length - 1; stackIndex >= 0; stackIndex--) {
                var el = this._elementStack[stackIndex];
                if (el.name == fullName) {
                    // Record the parse span with the element that is being closed. Any elements that are
                    // removed from the element stack at this point are closed implicitly, so they won't get
                    // an end source span (as there is no explicit closing element).
                    el.endSourceSpan = endSourceSpan;
                    el.sourceSpan.end = endSourceSpan !== null ? endSourceSpan.end : el.sourceSpan.end;
                    this._elementStack.splice(stackIndex, this._elementStack.length - stackIndex);
                    return true;
                }
                if (!this.getTagDefinition(el.name).closedByParent) {
                    return false;
                }
            }
            return false;
        };
        _TreeBuilder.prototype._consumeAttr = function (attrName) {
            var fullName = tags_1.mergeNsAndName(attrName.parts[0], attrName.parts[1]);
            var end = attrName.sourceSpan.end;
            var value = '';
            var valueSpan = undefined;
            if (this._peek.type === lex.TokenType.ATTR_QUOTE) {
                this._advance();
            }
            if (this._peek.type === lex.TokenType.ATTR_VALUE) {
                var valueToken = this._advance();
                value = valueToken.parts[0];
                end = valueToken.sourceSpan.end;
                valueSpan = valueToken.sourceSpan;
            }
            if (this._peek.type === lex.TokenType.ATTR_QUOTE) {
                var quoteToken = this._advance();
                end = quoteToken.sourceSpan.end;
            }
            return new html.Attribute(fullName, value, new parse_util_1.ParseSourceSpan(attrName.sourceSpan.start, end, attrName.sourceSpan.fullStart), valueSpan);
        };
        _TreeBuilder.prototype._getParentElement = function () {
            return this._elementStack.length > 0 ? this._elementStack[this._elementStack.length - 1] : null;
        };
        _TreeBuilder.prototype._addToParent = function (node) {
            var parent = this._getParentElement();
            if (parent != null) {
                parent.children.push(node);
            }
            else {
                this.rootNodes.push(node);
            }
        };
        _TreeBuilder.prototype._getElementFullName = function (prefix, localName, parentElement) {
            if (prefix === '') {
                prefix = this.getTagDefinition(localName).implicitNamespacePrefix || '';
                if (prefix === '' && parentElement != null) {
                    var parentTagName = tags_1.splitNsName(parentElement.name)[1];
                    var parentTagDefinition = this.getTagDefinition(parentTagName);
                    if (!parentTagDefinition.preventNamespaceInheritance) {
                        prefix = tags_1.getNsPrefix(parentElement.name);
                    }
                }
            }
            return tags_1.mergeNsAndName(prefix, localName);
        };
        return _TreeBuilder;
    }());
    function lastOnStack(stack, element) {
        return stack.length > 0 && stack[stack.length - 1] === element;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL21sX3BhcnNlci9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtEQUEwRDtJQUUxRCwwREFBOEI7SUFDOUIsMkRBQStCO0lBQy9CLDZEQUErRTtJQUUvRTtRQUErQixxQ0FBVTtRQUt2QyxtQkFBbUIsV0FBd0IsRUFBRSxJQUFxQixFQUFFLEdBQVc7WUFBL0UsWUFDRSxrQkFBTSxJQUFJLEVBQUUsR0FBRyxDQUFDLFNBQ2pCO1lBRmtCLGlCQUFXLEdBQVgsV0FBVyxDQUFhOztRQUUzQyxDQUFDO1FBTk0sZ0JBQU0sR0FBYixVQUFjLFdBQXdCLEVBQUUsSUFBcUIsRUFBRSxHQUFXO1lBQ3hFLE9BQU8sSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBS0gsZ0JBQUM7SUFBRCxDQUFDLEFBUkQsQ0FBK0IsdUJBQVUsR0FReEM7SUFSWSw4QkFBUztJQVV0QjtRQUNFLHlCQUFtQixTQUFzQixFQUFTLE1BQW9CO1lBQW5ELGNBQVMsR0FBVCxTQUFTLENBQWE7WUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQUcsQ0FBQztRQUM1RSxzQkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksMENBQWU7SUFJNUI7UUFDRSxnQkFBbUIsZ0JBQW9EO1lBQXBELHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBb0M7UUFBRyxDQUFDO1FBRTNFLHNCQUFLLEdBQUwsVUFBTSxNQUFjLEVBQUUsR0FBVyxFQUFFLE9BQTZCO1lBQzlELElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDakYs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LFNBQVMsV0FBVyxDQUFDLEtBQVksRUFBRSxPQUFZO1FBQzdDLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssT0FBTyxDQUFDO0lBQ2pFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4uL3BhcnNlX3V0aWwnO1xuXG5pbXBvcnQgKiBhcyBodG1sIGZyb20gJy4vYXN0JztcbmltcG9ydCAqIGFzIGxleCBmcm9tICcuL2xleGVyJztcbmltcG9ydCB7Z2V0TnNQcmVmaXgsIG1lcmdlTnNBbmROYW1lLCBzcGxpdE5zTmFtZSwgVGFnRGVmaW5pdGlvbn0gZnJvbSAnLi90YWdzJztcblxuZXhwb3J0IGNsYXNzIFRyZWVFcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBzdGF0aWMgY3JlYXRlKGVsZW1lbnROYW1lOiBzdHJpbmd8bnVsbCwgc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBtc2c6IHN0cmluZyk6IFRyZWVFcnJvciB7XG4gICAgcmV0dXJuIG5ldyBUcmVlRXJyb3IoZWxlbWVudE5hbWUsIHNwYW4sIG1zZyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudE5hbWU6IHN0cmluZ3xudWxsLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIG1zZzogc3RyaW5nKSB7XG4gICAgc3VwZXIoc3BhbiwgbXNnKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VUcmVlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHJvb3ROb2RlczogaHRtbC5Ob2RlW10sIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBnZXRUYWdEZWZpbml0aW9uOiAodGFnTmFtZTogc3RyaW5nKSA9PiBUYWdEZWZpbml0aW9uKSB7fVxuXG4gIHBhcnNlKHNvdXJjZTogc3RyaW5nLCB1cmw6IHN0cmluZywgb3B0aW9ucz86IGxleC5Ub2tlbml6ZU9wdGlvbnMpOiBQYXJzZVRyZWVSZXN1bHQge1xuICAgIGNvbnN0IHRva2VuaXplUmVzdWx0ID0gbGV4LnRva2VuaXplKHNvdXJjZSwgdXJsLCB0aGlzLmdldFRhZ0RlZmluaXRpb24sIG9wdGlvbnMpO1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBfVHJlZUJ1aWxkZXIodG9rZW5pemVSZXN1bHQudG9rZW5zLCB0aGlzLmdldFRhZ0RlZmluaXRpb24pO1xuICAgIHBhcnNlci5idWlsZCgpO1xuICAgIHJldHVybiBuZXcgUGFyc2VUcmVlUmVzdWx0KFxuICAgICAgICBwYXJzZXIucm9vdE5vZGVzLFxuICAgICAgICAodG9rZW5pemVSZXN1bHQuZXJyb3JzIGFzIFBhcnNlRXJyb3JbXSkuY29uY2F0KHBhcnNlci5lcnJvcnMpLFxuICAgICk7XG4gIH1cbn1cblxuY2xhc3MgX1RyZWVCdWlsZGVyIHtcbiAgcHJpdmF0ZSBfaW5kZXg6IG51bWJlciA9IC0xO1xuICAvLyBgX3BlZWtgIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYnkgdGhlIGNhbGwgdG8gYGFkdmFuY2UoKWAgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICBwcml2YXRlIF9wZWVrITogbGV4LlRva2VuO1xuICBwcml2YXRlIF9lbGVtZW50U3RhY2s6IGh0bWwuRWxlbWVudFtdID0gW107XG5cbiAgcm9vdE5vZGVzOiBodG1sLk5vZGVbXSA9IFtdO1xuICBlcnJvcnM6IFRyZWVFcnJvcltdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIHRva2VuczogbGV4LlRva2VuW10sIHByaXZhdGUgZ2V0VGFnRGVmaW5pdGlvbjogKHRhZ05hbWU6IHN0cmluZykgPT4gVGFnRGVmaW5pdGlvbikge1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIGJ1aWxkKCk6IHZvaWQge1xuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgIT09IGxleC5Ub2tlblR5cGUuRU9GKSB7XG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLlRBR19PUEVOX1NUQVJUIHx8XG4gICAgICAgICAgdGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLklOQ09NUExFVEVfVEFHX09QRU4pIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZVN0YXJ0VGFnKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gbGV4LlRva2VuVHlwZS5UQUdfQ0xPU0UpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZUVuZFRhZyh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuQ0RBVEFfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ2RhdGEodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLkNPTU1FTlRfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ29tbWVudCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuVEVYVCB8fCB0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuUkFXX1RFWFQgfHxcbiAgICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuRVNDQVBBQkxFX1JBV19URVhUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZVRleHQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX1NUQVJUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFeHBhbnNpb24odGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFNraXAgYWxsIG90aGVyIHRva2Vucy4uLlxuICAgICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZSgpOiBsZXguVG9rZW4ge1xuICAgIGNvbnN0IHByZXYgPSB0aGlzLl9wZWVrO1xuICAgIGlmICh0aGlzLl9pbmRleCA8IHRoaXMudG9rZW5zLmxlbmd0aCAtIDEpIHtcbiAgICAgIC8vIE5vdGU6IHRoZXJlIGlzIGFsd2F5cyBhbiBFT0YgdG9rZW4gYXQgdGhlIGVuZFxuICAgICAgdGhpcy5faW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5fcGVlayA9IHRoaXMudG9rZW5zW3RoaXMuX2luZGV4XTtcbiAgICByZXR1cm4gcHJldjtcbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2VJZih0eXBlOiBsZXguVG9rZW5UeXBlKTogbGV4LlRva2VufG51bGwge1xuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IHR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNkYXRhKF9zdGFydFRva2VuOiBsZXguVG9rZW4pIHtcbiAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgIHRoaXMuX2FkdmFuY2VJZihsZXguVG9rZW5UeXBlLkNEQVRBX0VORCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ29tbWVudCh0b2tlbjogbGV4LlRva2VuKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMuX2FkdmFuY2VJZihsZXguVG9rZW5UeXBlLlJBV19URVhUKTtcbiAgICB0aGlzLl9hZHZhbmNlSWYobGV4LlRva2VuVHlwZS5DT01NRU5UX0VORCk7XG4gICAgY29uc3QgdmFsdWUgPSB0ZXh0ICE9IG51bGwgPyB0ZXh0LnBhcnRzWzBdLnRyaW0oKSA6IG51bGw7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IGh0bWwuQ29tbWVudCh2YWx1ZSwgdG9rZW4uc291cmNlU3BhbikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUV4cGFuc2lvbih0b2tlbjogbGV4LlRva2VuKSB7XG4gICAgY29uc3Qgc3dpdGNoVmFsdWUgPSB0aGlzLl9hZHZhbmNlKCk7XG5cbiAgICBjb25zdCB0eXBlID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgIGNvbnN0IGNhc2VzOiBodG1sLkV4cGFuc2lvbkNhc2VbXSA9IFtdO1xuXG4gICAgLy8gcmVhZCA9XG4gICAgd2hpbGUgKHRoaXMuX3BlZWsudHlwZSA9PT0gbGV4LlRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9WQUxVRSkge1xuICAgICAgY29uc3QgZXhwQ2FzZSA9IHRoaXMuX3BhcnNlRXhwYW5zaW9uQ2FzZSgpO1xuICAgICAgaWYgKCFleHBDYXNlKSByZXR1cm47ICAvLyBlcnJvclxuICAgICAgY2FzZXMucHVzaChleHBDYXNlKTtcbiAgICB9XG5cbiAgICAvLyByZWFkIHRoZSBmaW5hbCB9XG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSAhPT0gbGV4LlRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9FTkQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShudWxsLCB0aGlzLl9wZWVrLnNvdXJjZVNwYW4sIGBJbnZhbGlkIElDVSBtZXNzYWdlLiBNaXNzaW5nICd9Jy5gKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICB0b2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCB0aGlzLl9wZWVrLnNvdXJjZVNwYW4uZW5kLCB0b2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IGh0bWwuRXhwYW5zaW9uKFxuICAgICAgICBzd2l0Y2hWYWx1ZS5wYXJ0c1swXSwgdHlwZS5wYXJ0c1swXSwgY2FzZXMsIHNvdXJjZVNwYW4sIHN3aXRjaFZhbHVlLnNvdXJjZVNwYW4pKTtcblxuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlRXhwYW5zaW9uQ2FzZSgpOiBodG1sLkV4cGFuc2lvbkNhc2V8bnVsbCB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl9hZHZhbmNlKCk7XG5cbiAgICAvLyByZWFkIHtcbiAgICBpZiAodGhpcy5fcGVlay50eXBlICE9PSBsZXguVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHRoaXMuX3BlZWsuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ3snLmApKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIHJlYWQgdW50aWwgfVxuICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5fYWR2YW5jZSgpO1xuXG4gICAgY29uc3QgZXhwID0gdGhpcy5fY29sbGVjdEV4cGFuc2lvbkV4cFRva2VucyhzdGFydCk7XG4gICAgaWYgKCFleHApIHJldHVybiBudWxsO1xuXG4gICAgY29uc3QgZW5kID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgIGV4cC5wdXNoKG5ldyBsZXguVG9rZW4obGV4LlRva2VuVHlwZS5FT0YsIFtdLCBlbmQuc291cmNlU3BhbikpO1xuXG4gICAgLy8gcGFyc2UgZXZlcnl0aGluZyBpbiBiZXR3ZWVuIHsgYW5kIH1cbiAgICBjb25zdCBleHBhbnNpb25DYXNlUGFyc2VyID0gbmV3IF9UcmVlQnVpbGRlcihleHAsIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbik7XG4gICAgZXhwYW5zaW9uQ2FzZVBhcnNlci5idWlsZCgpO1xuICAgIGlmIChleHBhbnNpb25DYXNlUGFyc2VyLmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmVycm9ycyA9IHRoaXMuZXJyb3JzLmNvbmNhdChleHBhbnNpb25DYXNlUGFyc2VyLmVycm9ycyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBzb3VyY2VTcGFuID1cbiAgICAgICAgbmV3IFBhcnNlU291cmNlU3Bhbih2YWx1ZS5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQuc291cmNlU3Bhbi5lbmQsIHZhbHVlLnNvdXJjZVNwYW4uZnVsbFN0YXJ0KTtcbiAgICBjb25zdCBleHBTb3VyY2VTcGFuID1cbiAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihzdGFydC5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQuc291cmNlU3Bhbi5lbmQsIHN0YXJ0LnNvdXJjZVNwYW4uZnVsbFN0YXJ0KTtcbiAgICByZXR1cm4gbmV3IGh0bWwuRXhwYW5zaW9uQ2FzZShcbiAgICAgICAgdmFsdWUucGFydHNbMF0sIGV4cGFuc2lvbkNhc2VQYXJzZXIucm9vdE5vZGVzLCBzb3VyY2VTcGFuLCB2YWx1ZS5zb3VyY2VTcGFuLCBleHBTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbGxlY3RFeHBhbnNpb25FeHBUb2tlbnMoc3RhcnQ6IGxleC5Ub2tlbik6IGxleC5Ub2tlbltdfG51bGwge1xuICAgIGNvbnN0IGV4cDogbGV4LlRva2VuW10gPSBbXTtcbiAgICBjb25zdCBleHBhbnNpb25Gb3JtU3RhY2sgPSBbbGV4LlRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlRdO1xuXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fU1RBUlQgfHxcbiAgICAgICAgICB0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUKSB7XG4gICAgICAgIGV4cGFuc2lvbkZvcm1TdGFjay5wdXNoKHRoaXMuX3BlZWsudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX0VORCkge1xuICAgICAgICBpZiAobGFzdE9uU3RhY2soZXhwYW5zaW9uRm9ybVN0YWNrLCBsZXguVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVCkpIHtcbiAgICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucG9wKCk7XG4gICAgICAgICAgaWYgKGV4cGFuc2lvbkZvcm1TdGFjay5sZW5ndGggPT0gMCkgcmV0dXJuIGV4cDtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX0VORCkge1xuICAgICAgICBpZiAobGFzdE9uU3RhY2soZXhwYW5zaW9uRm9ybVN0YWNrLCBsZXguVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX1NUQVJUKSkge1xuICAgICAgICAgIGV4cGFuc2lvbkZvcm1TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgICBUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHN0YXJ0LnNvdXJjZVNwYW4sIGBJbnZhbGlkIElDVSBtZXNzYWdlLiBNaXNzaW5nICd9Jy5gKSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gbGV4LlRva2VuVHlwZS5FT0YpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgIFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgSUNVIG1lc3NhZ2UuIE1pc3NpbmcgJ30nLmApKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIGV4cC5wdXNoKHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQodG9rZW46IGxleC5Ub2tlbikge1xuICAgIGxldCB0ZXh0ID0gdG9rZW4ucGFydHNbMF07XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMCAmJiB0ZXh0WzBdID09ICdcXG4nKSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG4gICAgICBpZiAocGFyZW50ICE9IG51bGwgJiYgcGFyZW50LmNoaWxkcmVuLmxlbmd0aCA9PSAwICYmXG4gICAgICAgICAgdGhpcy5nZXRUYWdEZWZpbml0aW9uKHBhcmVudC5uYW1lKS5pZ25vcmVGaXJzdExmKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9hZGRUb1BhcmVudChuZXcgaHRtbC5UZXh0KHRleHQsIHRva2VuLnNvdXJjZVNwYW4pKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jbG9zZVZvaWRFbGVtZW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGVsID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChlbCAmJiB0aGlzLmdldFRhZ0RlZmluaXRpb24oZWwubmFtZSkuaXNWb2lkKSB7XG4gICAgICB0aGlzLl9lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVN0YXJ0VGFnKHN0YXJ0VGFnVG9rZW46IGxleC5Ub2tlbikge1xuICAgIGNvbnN0IFtwcmVmaXgsIG5hbWVdID0gc3RhcnRUYWdUb2tlbi5wYXJ0cztcbiAgICBjb25zdCBhdHRyczogaHRtbC5BdHRyaWJ1dGVbXSA9IFtdO1xuICAgIHdoaWxlICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuQVRUUl9OQU1FKSB7XG4gICAgICBhdHRycy5wdXNoKHRoaXMuX2NvbnN1bWVBdHRyKHRoaXMuX2FkdmFuY2UoKSkpO1xuICAgIH1cbiAgICBjb25zdCBmdWxsTmFtZSA9IHRoaXMuX2dldEVsZW1lbnRGdWxsTmFtZShwcmVmaXgsIG5hbWUsIHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKSk7XG4gICAgbGV0IHNlbGZDbG9zaW5nID0gZmFsc2U7XG4gICAgLy8gTm90ZTogVGhlcmUgY291bGQgaGF2ZSBiZWVuIGEgdG9rZW5pemVyIGVycm9yXG4gICAgLy8gc28gdGhhdCB3ZSBkb24ndCBnZXQgYSB0b2tlbiBmb3IgdGhlIGVuZCB0YWcuLi5cbiAgICBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLlRBR19PUEVOX0VORF9WT0lEKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBzZWxmQ2xvc2luZyA9IHRydWU7XG4gICAgICBjb25zdCB0YWdEZWYgPSB0aGlzLmdldFRhZ0RlZmluaXRpb24oZnVsbE5hbWUpO1xuICAgICAgaWYgKCEodGFnRGVmLmNhblNlbGZDbG9zZSB8fCBnZXROc1ByZWZpeChmdWxsTmFtZSkgIT09IG51bGwgfHwgdGFnRGVmLmlzVm9pZCkpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgICAgZnVsbE5hbWUsIHN0YXJ0VGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICAgIGBPbmx5IHZvaWQgYW5kIGZvcmVpZ24gZWxlbWVudHMgY2FuIGJlIHNlbGYgY2xvc2VkIFwiJHtzdGFydFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fcGVlay50eXBlID09PSBsZXguVG9rZW5UeXBlLlRBR19PUEVOX0VORCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgZW5kID0gdGhpcy5fcGVlay5zb3VyY2VTcGFuLnN0YXJ0O1xuICAgIGNvbnN0IHNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKFxuICAgICAgICBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCwgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLmZ1bGxTdGFydCk7XG4gICAgLy8gQ3JlYXRlIGEgc2VwYXJhdGUgYHN0YXJ0U3BhbmAgYmVjYXVzZSBgc3BhbmAgd2lsbCBiZSBtb2RpZmllZCB3aGVuIHRoZXJlIGlzIGFuIGBlbmRgIHNwYW4uXG4gICAgY29uc3Qgc3RhcnRTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihcbiAgICAgICAgc3RhcnRUYWdUb2tlbi5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQsIHN0YXJ0VGFnVG9rZW4uc291cmNlU3Bhbi5mdWxsU3RhcnQpO1xuICAgIGNvbnN0IGVsID0gbmV3IGh0bWwuRWxlbWVudChmdWxsTmFtZSwgYXR0cnMsIFtdLCBzcGFuLCBzdGFydFNwYW4sIHVuZGVmaW5lZCk7XG4gICAgdGhpcy5fcHVzaEVsZW1lbnQoZWwpO1xuICAgIGlmIChzZWxmQ2xvc2luZykge1xuICAgICAgLy8gRWxlbWVudHMgdGhhdCBhcmUgc2VsZi1jbG9zZWQgaGF2ZSB0aGVpciBgZW5kU291cmNlU3BhbmAgc2V0IHRvIHRoZSBmdWxsIHNwYW4sIGFzIHRoZVxuICAgICAgLy8gZWxlbWVudCBzdGFydCB0YWcgYWxzbyByZXByZXNlbnRzIHRoZSBlbmQgdGFnLlxuICAgICAgdGhpcy5fcG9wRWxlbWVudChmdWxsTmFtZSwgc3Bhbik7XG4gICAgfSBlbHNlIGlmIChzdGFydFRhZ1Rva2VuLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuSU5DT01QTEVURV9UQUdfT1BFTikge1xuICAgICAgLy8gV2UgYWxyZWFkeSBrbm93IHRoZSBvcGVuaW5nIHRhZyBpcyBub3QgY29tcGxldGUsIHNvIGl0IGlzIHVubGlrZWx5IGl0IGhhcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAgIC8vIGNsb3NlIHRhZy4gTGV0J3Mgb3B0aW1pc3RpY2FsbHkgcGFyc2UgaXQgYXMgYSBmdWxsIGVsZW1lbnQgYW5kIGVtaXQgYW4gZXJyb3IuXG4gICAgICB0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lLCBudWxsKTtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgVHJlZUVycm9yLmNyZWF0ZShmdWxsTmFtZSwgc3BhbiwgYE9wZW5pbmcgdGFnIFwiJHtmdWxsTmFtZX1cIiBub3QgdGVybWluYXRlZC5gKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcHVzaEVsZW1lbnQoZWw6IGh0bWwuRWxlbWVudCkge1xuICAgIGNvbnN0IHBhcmVudEVsID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuXG4gICAgaWYgKHBhcmVudEVsICYmIHRoaXMuZ2V0VGFnRGVmaW5pdGlvbihwYXJlbnRFbC5uYW1lKS5pc0Nsb3NlZEJ5Q2hpbGQoZWwubmFtZSkpIHtcbiAgICAgIHRoaXMuX2VsZW1lbnRTdGFjay5wb3AoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRUb1BhcmVudChlbCk7XG4gICAgdGhpcy5fZWxlbWVudFN0YWNrLnB1c2goZWwpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUVuZFRhZyhlbmRUYWdUb2tlbjogbGV4LlRva2VuKSB7XG4gICAgY29uc3QgZnVsbE5hbWUgPSB0aGlzLl9nZXRFbGVtZW50RnVsbE5hbWUoXG4gICAgICAgIGVuZFRhZ1Rva2VuLnBhcnRzWzBdLCBlbmRUYWdUb2tlbi5wYXJ0c1sxXSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcblxuICAgIGlmICh0aGlzLmdldFRhZ0RlZmluaXRpb24oZnVsbE5hbWUpLmlzVm9pZCkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChUcmVlRXJyb3IuY3JlYXRlKFxuICAgICAgICAgIGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgIGBWb2lkIGVsZW1lbnRzIGRvIG5vdCBoYXZlIGVuZCB0YWdzIFwiJHtlbmRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuKSkge1xuICAgICAgY29uc3QgZXJyTXNnID0gYFVuZXhwZWN0ZWQgY2xvc2luZyB0YWcgXCIke1xuICAgICAgICAgIGZ1bGxOYW1lfVwiLiBJdCBtYXkgaGFwcGVuIHdoZW4gdGhlIHRhZyBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZCBieSBhbm90aGVyIHRhZy4gRm9yIG1vcmUgaW5mbyBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2h0bWw1L3N5bnRheC5odG1sI2Nsb3NpbmctZWxlbWVudHMtdGhhdC1oYXZlLWltcGxpZWQtZW5kLXRhZ3NgO1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLCBlcnJNc2cpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBuZWFyZXN0IGVsZW1lbnQgd2l0aCB0aGUgdGFnIG5hbWUgYGZ1bGxOYW1lYCBpbiB0aGUgcGFyc2UgdHJlZS5cbiAgICogYGVuZFNvdXJjZVNwYW5gIGlzIHRoZSBzcGFuIG9mIHRoZSBjbG9zaW5nIHRhZywgb3IgbnVsbCBpZiB0aGUgZWxlbWVudCBkb2VzXG4gICAqIG5vdCBoYXZlIGEgY2xvc2luZyB0YWcgKGZvciBleGFtcGxlLCB0aGlzIGhhcHBlbnMgd2hlbiBhbiBpbmNvbXBsZXRlXG4gICAqIG9wZW5pbmcgdGFnIGlzIHJlY292ZXJlZCkuXG4gICAqL1xuICBwcml2YXRlIF9wb3BFbGVtZW50KGZ1bGxOYW1lOiBzdHJpbmcsIGVuZFNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKTogYm9vbGVhbiB7XG4gICAgZm9yIChsZXQgc3RhY2tJbmRleCA9IHRoaXMuX2VsZW1lbnRTdGFjay5sZW5ndGggLSAxOyBzdGFja0luZGV4ID49IDA7IHN0YWNrSW5kZXgtLSkge1xuICAgICAgY29uc3QgZWwgPSB0aGlzLl9lbGVtZW50U3RhY2tbc3RhY2tJbmRleF07XG4gICAgICBpZiAoZWwubmFtZSA9PSBmdWxsTmFtZSkge1xuICAgICAgICAvLyBSZWNvcmQgdGhlIHBhcnNlIHNwYW4gd2l0aCB0aGUgZWxlbWVudCB0aGF0IGlzIGJlaW5nIGNsb3NlZC4gQW55IGVsZW1lbnRzIHRoYXQgYXJlXG4gICAgICAgIC8vIHJlbW92ZWQgZnJvbSB0aGUgZWxlbWVudCBzdGFjayBhdCB0aGlzIHBvaW50IGFyZSBjbG9zZWQgaW1wbGljaXRseSwgc28gdGhleSB3b24ndCBnZXRcbiAgICAgICAgLy8gYW4gZW5kIHNvdXJjZSBzcGFuIChhcyB0aGVyZSBpcyBubyBleHBsaWNpdCBjbG9zaW5nIGVsZW1lbnQpLlxuICAgICAgICBlbC5lbmRTb3VyY2VTcGFuID0gZW5kU291cmNlU3BhbjtcbiAgICAgICAgZWwuc291cmNlU3Bhbi5lbmQgPSBlbmRTb3VyY2VTcGFuICE9PSBudWxsID8gZW5kU291cmNlU3Bhbi5lbmQgOiBlbC5zb3VyY2VTcGFuLmVuZDtcblxuICAgICAgICB0aGlzLl9lbGVtZW50U3RhY2suc3BsaWNlKHN0YWNrSW5kZXgsIHRoaXMuX2VsZW1lbnRTdGFjay5sZW5ndGggLSBzdGFja0luZGV4KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5nZXRUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmNsb3NlZEJ5UGFyZW50KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUF0dHIoYXR0ck5hbWU6IGxleC5Ub2tlbik6IGh0bWwuQXR0cmlidXRlIHtcbiAgICBjb25zdCBmdWxsTmFtZSA9IG1lcmdlTnNBbmROYW1lKGF0dHJOYW1lLnBhcnRzWzBdLCBhdHRyTmFtZS5wYXJ0c1sxXSk7XG4gICAgbGV0IGVuZCA9IGF0dHJOYW1lLnNvdXJjZVNwYW4uZW5kO1xuICAgIGxldCB2YWx1ZSA9ICcnO1xuICAgIGxldCB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3BhbiA9IHVuZGVmaW5lZCE7XG4gICAgaWYgKHRoaXMuX3BlZWsudHlwZSA9PT0gbGV4LlRva2VuVHlwZS5BVFRSX1FVT1RFKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuQVRUUl9WQUxVRSkge1xuICAgICAgY29uc3QgdmFsdWVUb2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHZhbHVlID0gdmFsdWVUb2tlbi5wYXJ0c1swXTtcbiAgICAgIGVuZCA9IHZhbHVlVG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgICB2YWx1ZVNwYW4gPSB2YWx1ZVRva2VuLnNvdXJjZVNwYW47XG4gICAgfVxuICAgIGlmICh0aGlzLl9wZWVrLnR5cGUgPT09IGxleC5Ub2tlblR5cGUuQVRUUl9RVU9URSkge1xuICAgICAgY29uc3QgcXVvdGVUb2tlbiA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIGVuZCA9IHF1b3RlVG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgaHRtbC5BdHRyaWJ1dGUoXG4gICAgICAgIGZ1bGxOYW1lLCB2YWx1ZSxcbiAgICAgICAgbmV3IFBhcnNlU291cmNlU3BhbihhdHRyTmFtZS5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQsIGF0dHJOYW1lLnNvdXJjZVNwYW4uZnVsbFN0YXJ0KSxcbiAgICAgICAgdmFsdWVTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFBhcmVudEVsZW1lbnQoKTogaHRtbC5FbGVtZW50fG51bGwge1xuICAgIHJldHVybiB0aGlzLl9lbGVtZW50U3RhY2subGVuZ3RoID4gMCA/IHRoaXMuX2VsZW1lbnRTdGFja1t0aGlzLl9lbGVtZW50U3RhY2subGVuZ3RoIC0gMV0gOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWRkVG9QYXJlbnQobm9kZTogaHRtbC5Ob2RlKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0RWxlbWVudEZ1bGxOYW1lKHByZWZpeDogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgcGFyZW50RWxlbWVudDogaHRtbC5FbGVtZW50fG51bGwpOlxuICAgICAgc3RyaW5nIHtcbiAgICBpZiAocHJlZml4ID09PSAnJykge1xuICAgICAgcHJlZml4ID0gdGhpcy5nZXRUYWdEZWZpbml0aW9uKGxvY2FsTmFtZSkuaW1wbGljaXROYW1lc3BhY2VQcmVmaXggfHwgJyc7XG4gICAgICBpZiAocHJlZml4ID09PSAnJyAmJiBwYXJlbnRFbGVtZW50ICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgcGFyZW50VGFnTmFtZSA9IHNwbGl0TnNOYW1lKHBhcmVudEVsZW1lbnQubmFtZSlbMV07XG4gICAgICAgIGNvbnN0IHBhcmVudFRhZ0RlZmluaXRpb24gPSB0aGlzLmdldFRhZ0RlZmluaXRpb24ocGFyZW50VGFnTmFtZSk7XG4gICAgICAgIGlmICghcGFyZW50VGFnRGVmaW5pdGlvbi5wcmV2ZW50TmFtZXNwYWNlSW5oZXJpdGFuY2UpIHtcbiAgICAgICAgICBwcmVmaXggPSBnZXROc1ByZWZpeChwYXJlbnRFbGVtZW50Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlTnNBbmROYW1lKHByZWZpeCwgbG9jYWxOYW1lKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsYXN0T25TdGFjayhzdGFjazogYW55W10sIGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhY2subGVuZ3RoID4gMCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PT0gZWxlbWVudDtcbn1cbiJdfQ==