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
        define("@angular/compiler/src/i18n/extractor_merger", ["require", "exports", "tslib", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/parser", "@angular/compiler/src/i18n/i18n_ast", "@angular/compiler/src/i18n/i18n_parser", "@angular/compiler/src/i18n/parse_util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtractionResult = exports.mergeTranslations = exports.extractMessages = void 0;
    var tslib_1 = require("tslib");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var parser_1 = require("@angular/compiler/src/ml_parser/parser");
    var i18n = require("@angular/compiler/src/i18n/i18n_ast");
    var i18n_parser_1 = require("@angular/compiler/src/i18n/i18n_parser");
    var parse_util_1 = require("@angular/compiler/src/i18n/parse_util");
    var _I18N_ATTR = 'i18n';
    var _I18N_ATTR_PREFIX = 'i18n-';
    var _I18N_COMMENT_PREFIX_REGEXP = /^i18n:?/;
    var MEANING_SEPARATOR = '|';
    var ID_SEPARATOR = '@@';
    var i18nCommentsWarned = false;
    /**
     * Extract translatable messages from an html AST
     */
    function extractMessages(nodes, interpolationConfig, implicitTags, implicitAttrs) {
        var visitor = new _Visitor(implicitTags, implicitAttrs);
        return visitor.extract(nodes, interpolationConfig);
    }
    exports.extractMessages = extractMessages;
    function mergeTranslations(nodes, translations, interpolationConfig, implicitTags, implicitAttrs) {
        var visitor = new _Visitor(implicitTags, implicitAttrs);
        return visitor.merge(nodes, translations, interpolationConfig);
    }
    exports.mergeTranslations = mergeTranslations;
    var ExtractionResult = /** @class */ (function () {
        function ExtractionResult(messages, errors) {
            this.messages = messages;
            this.errors = errors;
        }
        return ExtractionResult;
    }());
    exports.ExtractionResult = ExtractionResult;
    var _VisitorMode;
    (function (_VisitorMode) {
        _VisitorMode[_VisitorMode["Extract"] = 0] = "Extract";
        _VisitorMode[_VisitorMode["Merge"] = 1] = "Merge";
    })(_VisitorMode || (_VisitorMode = {}));
    /**
     * This Visitor is used:
     * 1. to extract all the translatable strings from an html AST (see `extract()`),
     * 2. to replace the translatable strings with the actual translations (see `merge()`)
     *
     * @internal
     */
    var _Visitor = /** @class */ (function () {
        function _Visitor(_implicitTags, _implicitAttrs) {
            this._implicitTags = _implicitTags;
            this._implicitAttrs = _implicitAttrs;
        }
        /**
         * Extracts the messages from the tree
         */
        _Visitor.prototype.extract = function (nodes, interpolationConfig) {
            var _this = this;
            this._init(_VisitorMode.Extract, interpolationConfig);
            nodes.forEach(function (node) { return node.visit(_this, null); });
            if (this._inI18nBlock) {
                this._reportError(nodes[nodes.length - 1], 'Unclosed block');
            }
            return new ExtractionResult(this._messages, this._errors);
        };
        /**
         * Returns a tree where all translatable nodes are translated
         */
        _Visitor.prototype.merge = function (nodes, translations, interpolationConfig) {
            this._init(_VisitorMode.Merge, interpolationConfig);
            this._translations = translations;
            // Construct a single fake root element
            var wrapper = new html.Element('wrapper', [], nodes, undefined, undefined, undefined);
            var translatedNode = wrapper.visit(this, null);
            if (this._inI18nBlock) {
                this._reportError(nodes[nodes.length - 1], 'Unclosed block');
            }
            return new parser_1.ParseTreeResult(translatedNode.children, this._errors);
        };
        _Visitor.prototype.visitExpansionCase = function (icuCase, context) {
            // Parse cases for translatable html attributes
            var expression = html.visitAll(this, icuCase.expression, context);
            if (this._mode === _VisitorMode.Merge) {
                return new html.ExpansionCase(icuCase.value, expression, icuCase.sourceSpan, icuCase.valueSourceSpan, icuCase.expSourceSpan);
            }
        };
        _Visitor.prototype.visitExpansion = function (icu, context) {
            this._mayBeAddBlockChildren(icu);
            var wasInIcu = this._inIcu;
            if (!this._inIcu) {
                // nested ICU messages should not be extracted but top-level translated as a whole
                if (this._isInTranslatableSection) {
                    this._addMessage([icu]);
                }
                this._inIcu = true;
            }
            var cases = html.visitAll(this, icu.cases, context);
            if (this._mode === _VisitorMode.Merge) {
                icu = new html.Expansion(icu.switchValue, icu.type, cases, icu.sourceSpan, icu.switchValueSourceSpan);
            }
            this._inIcu = wasInIcu;
            return icu;
        };
        _Visitor.prototype.visitComment = function (comment, context) {
            var isOpening = _isOpeningComment(comment);
            if (isOpening && this._isInTranslatableSection) {
                this._reportError(comment, 'Could not start a block inside a translatable section');
                return;
            }
            var isClosing = _isClosingComment(comment);
            if (isClosing && !this._inI18nBlock) {
                this._reportError(comment, 'Trying to close an unopened block');
                return;
            }
            if (!this._inI18nNode && !this._inIcu) {
                if (!this._inI18nBlock) {
                    if (isOpening) {
                        // deprecated from v5 you should use <ng-container i18n> instead of i18n comments
                        if (!i18nCommentsWarned && console && console.warn) {
                            i18nCommentsWarned = true;
                            var details = comment.sourceSpan.details ? ", " + comment.sourceSpan.details : '';
                            // TODO(ocombe): use a log service once there is a public one available
                            console.warn("I18n comments are deprecated, use an <ng-container> element instead (" + comment.sourceSpan.start + details + ")");
                        }
                        this._inI18nBlock = true;
                        this._blockStartDepth = this._depth;
                        this._blockChildren = [];
                        this._blockMeaningAndDesc =
                            comment.value.replace(_I18N_COMMENT_PREFIX_REGEXP, '').trim();
                        this._openTranslatableSection(comment);
                    }
                }
                else {
                    if (isClosing) {
                        if (this._depth == this._blockStartDepth) {
                            this._closeTranslatableSection(comment, this._blockChildren);
                            this._inI18nBlock = false;
                            var message = this._addMessage(this._blockChildren, this._blockMeaningAndDesc);
                            // merge attributes in sections
                            var nodes = this._translateMessage(comment, message);
                            return html.visitAll(this, nodes);
                        }
                        else {
                            this._reportError(comment, 'I18N blocks should not cross element boundaries');
                            return;
                        }
                    }
                }
            }
        };
        _Visitor.prototype.visitText = function (text, context) {
            if (this._isInTranslatableSection) {
                this._mayBeAddBlockChildren(text);
            }
            return text;
        };
        _Visitor.prototype.visitElement = function (el, context) {
            var _this = this;
            this._mayBeAddBlockChildren(el);
            this._depth++;
            var wasInI18nNode = this._inI18nNode;
            var wasInImplicitNode = this._inImplicitNode;
            var childNodes = [];
            var translatedChildNodes = undefined;
            // Extract:
            // - top level nodes with the (implicit) "i18n" attribute if not already in a section
            // - ICU messages
            var i18nAttr = _getI18nAttr(el);
            var i18nMeta = i18nAttr ? i18nAttr.value : '';
            var isImplicit = this._implicitTags.some(function (tag) { return el.name === tag; }) && !this._inIcu &&
                !this._isInTranslatableSection;
            var isTopLevelImplicit = !wasInImplicitNode && isImplicit;
            this._inImplicitNode = wasInImplicitNode || isImplicit;
            if (!this._isInTranslatableSection && !this._inIcu) {
                if (i18nAttr || isTopLevelImplicit) {
                    this._inI18nNode = true;
                    var message = this._addMessage(el.children, i18nMeta);
                    translatedChildNodes = this._translateMessage(el, message);
                }
                if (this._mode == _VisitorMode.Extract) {
                    var isTranslatable = i18nAttr || isTopLevelImplicit;
                    if (isTranslatable)
                        this._openTranslatableSection(el);
                    html.visitAll(this, el.children);
                    if (isTranslatable)
                        this._closeTranslatableSection(el, el.children);
                }
            }
            else {
                if (i18nAttr || isTopLevelImplicit) {
                    this._reportError(el, 'Could not mark an element as translatable inside a translatable section');
                }
                if (this._mode == _VisitorMode.Extract) {
                    // Descend into child nodes for extraction
                    html.visitAll(this, el.children);
                }
            }
            if (this._mode === _VisitorMode.Merge) {
                var visitNodes = translatedChildNodes || el.children;
                visitNodes.forEach(function (child) {
                    var visited = child.visit(_this, context);
                    if (visited && !_this._isInTranslatableSection) {
                        // Do not add the children from translatable sections (= i18n blocks here)
                        // They will be added later in this loop when the block closes (i.e. on `<!-- /i18n -->`)
                        childNodes = childNodes.concat(visited);
                    }
                });
            }
            this._visitAttributesOf(el);
            this._depth--;
            this._inI18nNode = wasInI18nNode;
            this._inImplicitNode = wasInImplicitNode;
            if (this._mode === _VisitorMode.Merge) {
                var translatedAttrs = this._translateAttributes(el);
                return new html.Element(el.name, translatedAttrs, childNodes, el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
            }
            return null;
        };
        _Visitor.prototype.visitAttribute = function (attribute, context) {
            throw new Error('unreachable code');
        };
        _Visitor.prototype._init = function (mode, interpolationConfig) {
            this._mode = mode;
            this._inI18nBlock = false;
            this._inI18nNode = false;
            this._depth = 0;
            this._inIcu = false;
            this._msgCountAtSectionStart = undefined;
            this._errors = [];
            this._messages = [];
            this._inImplicitNode = false;
            this._createI18nMessage = i18n_parser_1.createI18nMessageFactory(interpolationConfig);
        };
        // looks for translatable attributes
        _Visitor.prototype._visitAttributesOf = function (el) {
            var _this = this;
            var explicitAttrNameToValue = {};
            var implicitAttrNames = this._implicitAttrs[el.name] || [];
            el.attrs.filter(function (attr) { return attr.name.startsWith(_I18N_ATTR_PREFIX); })
                .forEach(function (attr) { return explicitAttrNameToValue[attr.name.slice(_I18N_ATTR_PREFIX.length)] =
                attr.value; });
            el.attrs.forEach(function (attr) {
                if (attr.name in explicitAttrNameToValue) {
                    _this._addMessage([attr], explicitAttrNameToValue[attr.name]);
                }
                else if (implicitAttrNames.some(function (name) { return attr.name === name; })) {
                    _this._addMessage([attr]);
                }
            });
        };
        // add a translatable message
        _Visitor.prototype._addMessage = function (ast, msgMeta) {
            if (ast.length == 0 ||
                ast.length == 1 && ast[0] instanceof html.Attribute && !ast[0].value) {
                // Do not create empty messages
                return null;
            }
            var _a = _parseMessageMeta(msgMeta), meaning = _a.meaning, description = _a.description, id = _a.id;
            var message = this._createI18nMessage(ast, meaning, description, id);
            this._messages.push(message);
            return message;
        };
        // Translates the given message given the `TranslationBundle`
        // This is used for translating elements / blocks - see `_translateAttributes` for attributes
        // no-op when called in extraction mode (returns [])
        _Visitor.prototype._translateMessage = function (el, message) {
            if (message && this._mode === _VisitorMode.Merge) {
                var nodes = this._translations.get(message);
                if (nodes) {
                    return nodes;
                }
                this._reportError(el, "Translation unavailable for message id=\"" + this._translations.digest(message) + "\"");
            }
            return [];
        };
        // translate the attributes of an element and remove i18n specific attributes
        _Visitor.prototype._translateAttributes = function (el) {
            var _this = this;
            var attributes = el.attrs;
            var i18nParsedMessageMeta = {};
            attributes.forEach(function (attr) {
                if (attr.name.startsWith(_I18N_ATTR_PREFIX)) {
                    i18nParsedMessageMeta[attr.name.slice(_I18N_ATTR_PREFIX.length)] =
                        _parseMessageMeta(attr.value);
                }
            });
            var translatedAttributes = [];
            attributes.forEach(function (attr) {
                if (attr.name === _I18N_ATTR || attr.name.startsWith(_I18N_ATTR_PREFIX)) {
                    // strip i18n specific attributes
                    return;
                }
                if (attr.value && attr.value != '' && i18nParsedMessageMeta.hasOwnProperty(attr.name)) {
                    var _a = i18nParsedMessageMeta[attr.name], meaning = _a.meaning, description = _a.description, id = _a.id;
                    var message = _this._createI18nMessage([attr], meaning, description, id);
                    var nodes = _this._translations.get(message);
                    if (nodes) {
                        if (nodes.length == 0) {
                            translatedAttributes.push(new html.Attribute(attr.name, '', attr.sourceSpan));
                        }
                        else if (nodes[0] instanceof html.Text) {
                            var value = nodes[0].value;
                            translatedAttributes.push(new html.Attribute(attr.name, value, attr.sourceSpan));
                        }
                        else {
                            _this._reportError(el, "Unexpected translation for attribute \"" + attr.name + "\" (id=\"" + (id || _this._translations.digest(message)) + "\")");
                        }
                    }
                    else {
                        _this._reportError(el, "Translation unavailable for attribute \"" + attr.name + "\" (id=\"" + (id || _this._translations.digest(message)) + "\")");
                    }
                }
                else {
                    translatedAttributes.push(attr);
                }
            });
            return translatedAttributes;
        };
        /**
         * Add the node as a child of the block when:
         * - we are in a block,
         * - we are not inside a ICU message (those are handled separately),
         * - the node is a "direct child" of the block
         */
        _Visitor.prototype._mayBeAddBlockChildren = function (node) {
            if (this._inI18nBlock && !this._inIcu && this._depth == this._blockStartDepth) {
                this._blockChildren.push(node);
            }
        };
        /**
         * Marks the start of a section, see `_closeTranslatableSection`
         */
        _Visitor.prototype._openTranslatableSection = function (node) {
            if (this._isInTranslatableSection) {
                this._reportError(node, 'Unexpected section start');
            }
            else {
                this._msgCountAtSectionStart = this._messages.length;
            }
        };
        Object.defineProperty(_Visitor.prototype, "_isInTranslatableSection", {
            /**
             * A translatable section could be:
             * - the content of translatable element,
             * - nodes between `<!-- i18n -->` and `<!-- /i18n -->` comments
             */
            get: function () {
                return this._msgCountAtSectionStart !== void 0;
            },
            enumerable: false,
            configurable: true
        });
        /**
         * Terminates a section.
         *
         * If a section has only one significant children (comments not significant) then we should not
         * keep the message from this children:
         *
         * `<p i18n="meaning|description">{ICU message}</p>` would produce two messages:
         * - one for the <p> content with meaning and description,
         * - another one for the ICU message.
         *
         * In this case the last message is discarded as it contains less information (the AST is
         * otherwise identical).
         *
         * Note that we should still keep messages extracted from attributes inside the section (ie in the
         * ICU message here)
         */
        _Visitor.prototype._closeTranslatableSection = function (node, directChildren) {
            if (!this._isInTranslatableSection) {
                this._reportError(node, 'Unexpected section end');
                return;
            }
            var startIndex = this._msgCountAtSectionStart;
            var significantChildren = directChildren.reduce(function (count, node) { return count + (node instanceof html.Comment ? 0 : 1); }, 0);
            if (significantChildren == 1) {
                for (var i = this._messages.length - 1; i >= startIndex; i--) {
                    var ast = this._messages[i].nodes;
                    if (!(ast.length == 1 && ast[0] instanceof i18n.Text)) {
                        this._messages.splice(i, 1);
                        break;
                    }
                }
            }
            this._msgCountAtSectionStart = undefined;
        };
        _Visitor.prototype._reportError = function (node, msg) {
            this._errors.push(new parse_util_1.I18nError(node.sourceSpan, msg));
        };
        return _Visitor;
    }());
    function _isOpeningComment(n) {
        return !!(n instanceof html.Comment && n.value && n.value.startsWith('i18n'));
    }
    function _isClosingComment(n) {
        return !!(n instanceof html.Comment && n.value && n.value === '/i18n');
    }
    function _getI18nAttr(p) {
        return p.attrs.find(function (attr) { return attr.name === _I18N_ATTR; }) || null;
    }
    function _parseMessageMeta(i18n) {
        if (!i18n)
            return { meaning: '', description: '', id: '' };
        var idIndex = i18n.indexOf(ID_SEPARATOR);
        var descIndex = i18n.indexOf(MEANING_SEPARATOR);
        var _a = tslib_1.__read((idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''], 2), meaningAndDesc = _a[0], id = _a[1];
        var _b = tslib_1.__read((descIndex > -1) ?
            [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
            ['', meaningAndDesc], 2), meaning = _b[0], description = _b[1];
        return { meaning: meaning, description: description, id: id.trim() };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0cmFjdG9yX21lcmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbXBpbGVyL3NyYy9pMThuL2V4dHJhY3Rvcl9tZXJnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDBEQUF5QztJQUV6QyxpRUFBb0Q7SUFFcEQsMERBQW1DO0lBQ25DLHNFQUEyRTtJQUMzRSxvRUFBdUM7SUFHdkMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0lBQzFCLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0lBQ2xDLElBQU0sMkJBQTJCLEdBQUcsU0FBUyxDQUFDO0lBQzlDLElBQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDO0lBQzlCLElBQU0sWUFBWSxHQUFHLElBQUksQ0FBQztJQUMxQixJQUFJLGtCQUFrQixHQUFHLEtBQUssQ0FBQztJQUUvQjs7T0FFRztJQUNILFNBQWdCLGVBQWUsQ0FDM0IsS0FBa0IsRUFBRSxtQkFBd0MsRUFBRSxZQUFzQixFQUNwRixhQUFzQztRQUN4QyxJQUFNLE9BQU8sR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFMRCwwQ0FLQztJQUVELFNBQWdCLGlCQUFpQixDQUM3QixLQUFrQixFQUFFLFlBQStCLEVBQUUsbUJBQXdDLEVBQzdGLFlBQXNCLEVBQUUsYUFBc0M7UUFDaEUsSUFBTSxPQUFPLEdBQUcsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzFELE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUxELDhDQUtDO0lBRUQ7UUFD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LElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0MsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQzVDLElBQUEsS0FBQSxlQUNGLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUEsRUFENUUsY0FBYyxRQUFBLEVBQUUsRUFBRSxRQUMwRCxDQUFDO1FBQzlFLElBQUEsS0FBQSxlQUF5QixDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLElBQUEsRUFGakIsT0FBTyxRQUFBLEVBQUUsV0FBVyxRQUVILENBQUM7UUFFekIsT0FBTyxFQUFDLE9BQU8sU0FBQSxFQUFFLFdBQVcsYUFBQSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUMsQ0FBQztJQUMvQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge0ludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQge1BhcnNlVHJlZVJlc3VsdH0gZnJvbSAnLi4vbWxfcGFyc2VyL3BhcnNlcic7XG5cbmltcG9ydCAqIGFzIGkxOG4gZnJvbSAnLi9pMThuX2FzdCc7XG5pbXBvcnQge2NyZWF0ZUkxOG5NZXNzYWdlRmFjdG9yeSwgSTE4bk1lc3NhZ2VGYWN0b3J5fSBmcm9tICcuL2kxOG5fcGFyc2VyJztcbmltcG9ydCB7STE4bkVycm9yfSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtUcmFuc2xhdGlvbkJ1bmRsZX0gZnJvbSAnLi90cmFuc2xhdGlvbl9idW5kbGUnO1xuXG5jb25zdCBfSTE4Tl9BVFRSID0gJ2kxOG4nO1xuY29uc3QgX0kxOE5fQVRUUl9QUkVGSVggPSAnaTE4bi0nO1xuY29uc3QgX0kxOE5fQ09NTUVOVF9QUkVGSVhfUkVHRVhQID0gL15pMThuOj8vO1xuY29uc3QgTUVBTklOR19TRVBBUkFUT1IgPSAnfCc7XG5jb25zdCBJRF9TRVBBUkFUT1IgPSAnQEAnO1xubGV0IGkxOG5Db21tZW50c1dhcm5lZCA9IGZhbHNlO1xuXG4vKipcbiAqIEV4dHJhY3QgdHJhbnNsYXRhYmxlIG1lc3NhZ2VzIGZyb20gYW4gaHRtbCBBU1RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RNZXNzYWdlcyhcbiAgICBub2RlczogaHRtbC5Ob2RlW10sIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcsIGltcGxpY2l0VGFnczogc3RyaW5nW10sXG4gICAgaW1wbGljaXRBdHRyczoge1trOiBzdHJpbmddOiBzdHJpbmdbXX0pOiBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgY29uc3QgdmlzaXRvciA9IG5ldyBfVmlzaXRvcihpbXBsaWNpdFRhZ3MsIGltcGxpY2l0QXR0cnMpO1xuICByZXR1cm4gdmlzaXRvci5leHRyYWN0KG5vZGVzLCBpbnRlcnBvbGF0aW9uQ29uZmlnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVHJhbnNsYXRpb25zKFxuICAgIG5vZGVzOiBodG1sLk5vZGVbXSwgdHJhbnNsYXRpb25zOiBUcmFuc2xhdGlvbkJ1bmRsZSwgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyxcbiAgICBpbXBsaWNpdFRhZ3M6IHN0cmluZ1tdLCBpbXBsaWNpdEF0dHJzOiB7W2s6IHN0cmluZ106IHN0cmluZ1tdfSk6IFBhcnNlVHJlZVJlc3VsdCB7XG4gIGNvbnN0IHZpc2l0b3IgPSBuZXcgX1Zpc2l0b3IoaW1wbGljaXRUYWdzLCBpbXBsaWNpdEF0dHJzKTtcbiAgcmV0dXJuIHZpc2l0b3IubWVyZ2Uobm9kZXMsIHRyYW5zbGF0aW9ucywgaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG59XG5cbmV4cG9ydCBjbGFzcyBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2VzOiBpMThuLk1lc3NhZ2VbXSwgcHVibGljIGVycm9yczogSTE4bkVycm9yW10pIHt9XG59XG5cbmVudW0gX1Zpc2l0b3JNb2RlIHtcbiAgRXh0cmFjdCxcbiAgTWVyZ2Vcbn1cblxuLyoqXG4gKiBUaGlzIFZpc2l0b3IgaXMgdXNlZDpcbiAqIDEuIHRvIGV4dHJhY3QgYWxsIHRoZSB0cmFuc2xhdGFibGUgc3RyaW5ncyBmcm9tIGFuIGh0bWwgQVNUIChzZWUgYGV4dHJhY3QoKWApLFxuICogMi4gdG8gcmVwbGFjZSB0aGUgdHJhbnNsYXRhYmxlIHN0cmluZ3Mgd2l0aCB0aGUgYWN0dWFsIHRyYW5zbGF0aW9ucyAoc2VlIGBtZXJnZSgpYClcbiAqXG4gKiBAaW50ZXJuYWxcbiAqL1xuY2xhc3MgX1Zpc2l0b3IgaW1wbGVtZW50cyBodG1sLlZpc2l0b3Ige1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGVwdGghOiBudW1iZXI7XG5cbiAgLy8gPGVsIGkxOG4+Li4uPC9lbD5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2luSTE4bk5vZGUhOiBib29sZWFuO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfaW5JbXBsaWNpdE5vZGUhOiBib29sZWFuO1xuXG4gIC8vIDwhLS1pMThuLS0+Li4uPCEtLS9pMThuLS0+XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9pbkkxOG5CbG9jayE6IGJvb2xlYW47XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9ibG9ja01lYW5pbmdBbmREZXNjITogc3RyaW5nO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfYmxvY2tDaGlsZHJlbiE6IGh0bWwuTm9kZVtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfYmxvY2tTdGFydERlcHRoITogbnVtYmVyO1xuXG4gIC8vIHs8aWN1IG1lc3NhZ2U+fVxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfaW5JY3UhOiBib29sZWFuO1xuXG4gIC8vIHNldCB0byB2b2lkIDAgd2hlbiBub3QgaW4gYSBzZWN0aW9uXG4gIHByaXZhdGUgX21zZ0NvdW50QXRTZWN0aW9uU3RhcnQ6IG51bWJlcnx1bmRlZmluZWQ7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9lcnJvcnMhOiBJMThuRXJyb3JbXTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX21vZGUhOiBfVmlzaXRvck1vZGU7XG5cbiAgLy8gX1Zpc2l0b3JNb2RlLkV4dHJhY3Qgb25seVxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfbWVzc2FnZXMhOiBpMThuLk1lc3NhZ2VbXTtcblxuICAvLyBfVmlzaXRvck1vZGUuTWVyZ2Ugb25seVxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfdHJhbnNsYXRpb25zITogVHJhbnNsYXRpb25CdW5kbGU7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9jcmVhdGVJMThuTWVzc2FnZSE6IEkxOG5NZXNzYWdlRmFjdG9yeTtcblxuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2ltcGxpY2l0VGFnczogc3RyaW5nW10sIHByaXZhdGUgX2ltcGxpY2l0QXR0cnM6IHtbazogc3RyaW5nXTogc3RyaW5nW119KSB7fVxuXG4gIC8qKlxuICAgKiBFeHRyYWN0cyB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgdHJlZVxuICAgKi9cbiAgZXh0cmFjdChub2RlczogaHRtbC5Ob2RlW10sIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcpOiBFeHRyYWN0aW9uUmVzdWx0IHtcbiAgICB0aGlzLl9pbml0KF9WaXNpdG9yTW9kZS5FeHRyYWN0LCBpbnRlcnBvbGF0aW9uQ29uZmlnKTtcblxuICAgIG5vZGVzLmZvckVhY2gobm9kZSA9PiBub2RlLnZpc2l0KHRoaXMsIG51bGwpKTtcblxuICAgIGlmICh0aGlzLl9pbkkxOG5CbG9jaykge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3Iobm9kZXNbbm9kZXMubGVuZ3RoIC0gMV0sICdVbmNsb3NlZCBibG9jaycpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgRXh0cmFjdGlvblJlc3VsdCh0aGlzLl9tZXNzYWdlcywgdGhpcy5fZXJyb3JzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdHJlZSB3aGVyZSBhbGwgdHJhbnNsYXRhYmxlIG5vZGVzIGFyZSB0cmFuc2xhdGVkXG4gICAqL1xuICBtZXJnZShcbiAgICAgIG5vZGVzOiBodG1sLk5vZGVbXSwgdHJhbnNsYXRpb25zOiBUcmFuc2xhdGlvbkJ1bmRsZSxcbiAgICAgIGludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcpOiBQYXJzZVRyZWVSZXN1bHQge1xuICAgIHRoaXMuX2luaXQoX1Zpc2l0b3JNb2RlLk1lcmdlLCBpbnRlcnBvbGF0aW9uQ29uZmlnKTtcbiAgICB0aGlzLl90cmFuc2xhdGlvbnMgPSB0cmFuc2xhdGlvbnM7XG5cbiAgICAvLyBDb25zdHJ1Y3QgYSBzaW5nbGUgZmFrZSByb290IGVsZW1lbnRcbiAgICBjb25zdCB3cmFwcGVyID0gbmV3IGh0bWwuRWxlbWVudCgnd3JhcHBlcicsIFtdLCBub2RlcywgdW5kZWZpbmVkISwgdW5kZWZpbmVkISwgdW5kZWZpbmVkKTtcblxuICAgIGNvbnN0IHRyYW5zbGF0ZWROb2RlID0gd3JhcHBlci52aXNpdCh0aGlzLCBudWxsKTtcblxuICAgIGlmICh0aGlzLl9pbkkxOG5CbG9jaykge1xuICAgICAgdGhpcy5fcmVwb3J0RXJyb3Iobm9kZXNbbm9kZXMubGVuZ3RoIC0gMV0sICdVbmNsb3NlZCBibG9jaycpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUGFyc2VUcmVlUmVzdWx0KHRyYW5zbGF0ZWROb2RlLmNoaWxkcmVuLCB0aGlzLl9lcnJvcnMpO1xuICB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGljdUNhc2U6IGh0bWwuRXhwYW5zaW9uQ2FzZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICAvLyBQYXJzZSBjYXNlcyBmb3IgdHJhbnNsYXRhYmxlIGh0bWwgYXR0cmlidXRlc1xuICAgIGNvbnN0IGV4cHJlc3Npb24gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGljdUNhc2UuZXhwcmVzc2lvbiwgY29udGV4dCk7XG5cbiAgICBpZiAodGhpcy5fbW9kZSA9PT0gX1Zpc2l0b3JNb2RlLk1lcmdlKSB7XG4gICAgICByZXR1cm4gbmV3IGh0bWwuRXhwYW5zaW9uQ2FzZShcbiAgICAgICAgICBpY3VDYXNlLnZhbHVlLCBleHByZXNzaW9uLCBpY3VDYXNlLnNvdXJjZVNwYW4sIGljdUNhc2UudmFsdWVTb3VyY2VTcGFuLFxuICAgICAgICAgIGljdUNhc2UuZXhwU291cmNlU3Bhbik7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFeHBhbnNpb24oaWN1OiBodG1sLkV4cGFuc2lvbiwgY29udGV4dDogYW55KTogaHRtbC5FeHBhbnNpb24ge1xuICAgIHRoaXMuX21heUJlQWRkQmxvY2tDaGlsZHJlbihpY3UpO1xuXG4gICAgY29uc3Qgd2FzSW5JY3UgPSB0aGlzLl9pbkljdTtcblxuICAgIGlmICghdGhpcy5faW5JY3UpIHtcbiAgICAgIC8vIG5lc3RlZCBJQ1UgbWVzc2FnZXMgc2hvdWxkIG5vdCBiZSBleHRyYWN0ZWQgYnV0IHRvcC1sZXZlbCB0cmFuc2xhdGVkIGFzIGEgd2hvbGVcbiAgICAgIGlmICh0aGlzLl9pc0luVHJhbnNsYXRhYmxlU2VjdGlvbikge1xuICAgICAgICB0aGlzLl9hZGRNZXNzYWdlKFtpY3VdKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2luSWN1ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjYXNlcyA9IGh0bWwudmlzaXRBbGwodGhpcywgaWN1LmNhc2VzLCBjb250ZXh0KTtcblxuICAgIGlmICh0aGlzLl9tb2RlID09PSBfVmlzaXRvck1vZGUuTWVyZ2UpIHtcbiAgICAgIGljdSA9IG5ldyBodG1sLkV4cGFuc2lvbihcbiAgICAgICAgICBpY3Uuc3dpdGNoVmFsdWUsIGljdS50eXBlLCBjYXNlcywgaWN1LnNvdXJjZVNwYW4sIGljdS5zd2l0Y2hWYWx1ZVNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIHRoaXMuX2luSWN1ID0gd2FzSW5JY3U7XG5cbiAgICByZXR1cm4gaWN1O1xuICB9XG5cbiAgdmlzaXRDb21tZW50KGNvbW1lbnQ6IGh0bWwuQ29tbWVudCwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBjb25zdCBpc09wZW5pbmcgPSBfaXNPcGVuaW5nQ29tbWVudChjb21tZW50KTtcblxuICAgIGlmIChpc09wZW5pbmcgJiYgdGhpcy5faXNJblRyYW5zbGF0YWJsZVNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGNvbW1lbnQsICdDb3VsZCBub3Qgc3RhcnQgYSBibG9jayBpbnNpZGUgYSB0cmFuc2xhdGFibGUgc2VjdGlvbicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGlzQ2xvc2luZyA9IF9pc0Nsb3NpbmdDb21tZW50KGNvbW1lbnQpO1xuXG4gICAgaWYgKGlzQ2xvc2luZyAmJiAhdGhpcy5faW5JMThuQmxvY2spIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKGNvbW1lbnQsICdUcnlpbmcgdG8gY2xvc2UgYW4gdW5vcGVuZWQgYmxvY2snKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2luSTE4bk5vZGUgJiYgIXRoaXMuX2luSWN1KSB7XG4gICAgICBpZiAoIXRoaXMuX2luSTE4bkJsb2NrKSB7XG4gICAgICAgIGlmIChpc09wZW5pbmcpIHtcbiAgICAgICAgICAvLyBkZXByZWNhdGVkIGZyb20gdjUgeW91IHNob3VsZCB1c2UgPG5nLWNvbnRhaW5lciBpMThuPiBpbnN0ZWFkIG9mIGkxOG4gY29tbWVudHNcbiAgICAgICAgICBpZiAoIWkxOG5Db21tZW50c1dhcm5lZCAmJiA8YW55PmNvbnNvbGUgJiYgPGFueT5jb25zb2xlLndhcm4pIHtcbiAgICAgICAgICAgIGkxOG5Db21tZW50c1dhcm5lZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBkZXRhaWxzID0gY29tbWVudC5zb3VyY2VTcGFuLmRldGFpbHMgPyBgLCAke2NvbW1lbnQuc291cmNlU3Bhbi5kZXRhaWxzfWAgOiAnJztcbiAgICAgICAgICAgIC8vIFRPRE8ob2NvbWJlKTogdXNlIGEgbG9nIHNlcnZpY2Ugb25jZSB0aGVyZSBpcyBhIHB1YmxpYyBvbmUgYXZhaWxhYmxlXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEkxOG4gY29tbWVudHMgYXJlIGRlcHJlY2F0ZWQsIHVzZSBhbiA8bmctY29udGFpbmVyPiBlbGVtZW50IGluc3RlYWQgKCR7XG4gICAgICAgICAgICAgICAgY29tbWVudC5zb3VyY2VTcGFuLnN0YXJ0fSR7ZGV0YWlsc30pYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2luSTE4bkJsb2NrID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLl9ibG9ja1N0YXJ0RGVwdGggPSB0aGlzLl9kZXB0aDtcbiAgICAgICAgICB0aGlzLl9ibG9ja0NoaWxkcmVuID0gW107XG4gICAgICAgICAgdGhpcy5fYmxvY2tNZWFuaW5nQW5kRGVzYyA9XG4gICAgICAgICAgICAgIGNvbW1lbnQudmFsdWUhLnJlcGxhY2UoX0kxOE5fQ09NTUVOVF9QUkVGSVhfUkVHRVhQLCAnJykudHJpbSgpO1xuICAgICAgICAgIHRoaXMuX29wZW5UcmFuc2xhdGFibGVTZWN0aW9uKGNvbW1lbnQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNDbG9zaW5nKSB7XG4gICAgICAgICAgaWYgKHRoaXMuX2RlcHRoID09IHRoaXMuX2Jsb2NrU3RhcnREZXB0aCkge1xuICAgICAgICAgICAgdGhpcy5fY2xvc2VUcmFuc2xhdGFibGVTZWN0aW9uKGNvbW1lbnQsIHRoaXMuX2Jsb2NrQ2hpbGRyZW4pO1xuICAgICAgICAgICAgdGhpcy5faW5JMThuQmxvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9hZGRNZXNzYWdlKHRoaXMuX2Jsb2NrQ2hpbGRyZW4sIHRoaXMuX2Jsb2NrTWVhbmluZ0FuZERlc2MpITtcbiAgICAgICAgICAgIC8vIG1lcmdlIGF0dHJpYnV0ZXMgaW4gc2VjdGlvbnNcbiAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fdHJhbnNsYXRlTWVzc2FnZShjb21tZW50LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybiBodG1sLnZpc2l0QWxsKHRoaXMsIG5vZGVzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoY29tbWVudCwgJ0kxOE4gYmxvY2tzIHNob3VsZCBub3QgY3Jvc3MgZWxlbWVudCBib3VuZGFyaWVzJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmlzaXRUZXh0KHRleHQ6IGh0bWwuVGV4dCwgY29udGV4dDogYW55KTogaHRtbC5UZXh0IHtcbiAgICBpZiAodGhpcy5faXNJblRyYW5zbGF0YWJsZVNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX21heUJlQWRkQmxvY2tDaGlsZHJlbih0ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICB2aXNpdEVsZW1lbnQoZWw6IGh0bWwuRWxlbWVudCwgY29udGV4dDogYW55KTogaHRtbC5FbGVtZW50fG51bGwge1xuICAgIHRoaXMuX21heUJlQWRkQmxvY2tDaGlsZHJlbihlbCk7XG4gICAgdGhpcy5fZGVwdGgrKztcbiAgICBjb25zdCB3YXNJbkkxOG5Ob2RlID0gdGhpcy5faW5JMThuTm9kZTtcbiAgICBjb25zdCB3YXNJbkltcGxpY2l0Tm9kZSA9IHRoaXMuX2luSW1wbGljaXROb2RlO1xuICAgIGxldCBjaGlsZE5vZGVzOiBodG1sLk5vZGVbXSA9IFtdO1xuICAgIGxldCB0cmFuc2xhdGVkQ2hpbGROb2RlczogaHRtbC5Ob2RlW10gPSB1bmRlZmluZWQhO1xuXG4gICAgLy8gRXh0cmFjdDpcbiAgICAvLyAtIHRvcCBsZXZlbCBub2RlcyB3aXRoIHRoZSAoaW1wbGljaXQpIFwiaTE4blwiIGF0dHJpYnV0ZSBpZiBub3QgYWxyZWFkeSBpbiBhIHNlY3Rpb25cbiAgICAvLyAtIElDVSBtZXNzYWdlc1xuICAgIGNvbnN0IGkxOG5BdHRyID0gX2dldEkxOG5BdHRyKGVsKTtcbiAgICBjb25zdCBpMThuTWV0YSA9IGkxOG5BdHRyID8gaTE4bkF0dHIudmFsdWUgOiAnJztcbiAgICBjb25zdCBpc0ltcGxpY2l0ID0gdGhpcy5faW1wbGljaXRUYWdzLnNvbWUodGFnID0+IGVsLm5hbWUgPT09IHRhZykgJiYgIXRoaXMuX2luSWN1ICYmXG4gICAgICAgICF0aGlzLl9pc0luVHJhbnNsYXRhYmxlU2VjdGlvbjtcbiAgICBjb25zdCBpc1RvcExldmVsSW1wbGljaXQgPSAhd2FzSW5JbXBsaWNpdE5vZGUgJiYgaXNJbXBsaWNpdDtcbiAgICB0aGlzLl9pbkltcGxpY2l0Tm9kZSA9IHdhc0luSW1wbGljaXROb2RlIHx8IGlzSW1wbGljaXQ7XG5cbiAgICBpZiAoIXRoaXMuX2lzSW5UcmFuc2xhdGFibGVTZWN0aW9uICYmICF0aGlzLl9pbkljdSkge1xuICAgICAgaWYgKGkxOG5BdHRyIHx8IGlzVG9wTGV2ZWxJbXBsaWNpdCkge1xuICAgICAgICB0aGlzLl9pbkkxOG5Ob2RlID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2FkZE1lc3NhZ2UoZWwuY2hpbGRyZW4sIGkxOG5NZXRhKSE7XG4gICAgICAgIHRyYW5zbGF0ZWRDaGlsZE5vZGVzID0gdGhpcy5fdHJhbnNsYXRlTWVzc2FnZShlbCwgbWVzc2FnZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9tb2RlID09IF9WaXNpdG9yTW9kZS5FeHRyYWN0KSB7XG4gICAgICAgIGNvbnN0IGlzVHJhbnNsYXRhYmxlID0gaTE4bkF0dHIgfHwgaXNUb3BMZXZlbEltcGxpY2l0O1xuICAgICAgICBpZiAoaXNUcmFuc2xhdGFibGUpIHRoaXMuX29wZW5UcmFuc2xhdGFibGVTZWN0aW9uKGVsKTtcbiAgICAgICAgaHRtbC52aXNpdEFsbCh0aGlzLCBlbC5jaGlsZHJlbik7XG4gICAgICAgIGlmIChpc1RyYW5zbGF0YWJsZSkgdGhpcy5fY2xvc2VUcmFuc2xhdGFibGVTZWN0aW9uKGVsLCBlbC5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpMThuQXR0ciB8fCBpc1RvcExldmVsSW1wbGljaXQpIHtcbiAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICBlbCwgJ0NvdWxkIG5vdCBtYXJrIGFuIGVsZW1lbnQgYXMgdHJhbnNsYXRhYmxlIGluc2lkZSBhIHRyYW5zbGF0YWJsZSBzZWN0aW9uJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9tb2RlID09IF9WaXNpdG9yTW9kZS5FeHRyYWN0KSB7XG4gICAgICAgIC8vIERlc2NlbmQgaW50byBjaGlsZCBub2RlcyBmb3IgZXh0cmFjdGlvblxuICAgICAgICBodG1sLnZpc2l0QWxsKHRoaXMsIGVsLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW9kZSA9PT0gX1Zpc2l0b3JNb2RlLk1lcmdlKSB7XG4gICAgICBjb25zdCB2aXNpdE5vZGVzID0gdHJhbnNsYXRlZENoaWxkTm9kZXMgfHwgZWwuY2hpbGRyZW47XG4gICAgICB2aXNpdE5vZGVzLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICBjb25zdCB2aXNpdGVkID0gY2hpbGQudmlzaXQodGhpcywgY29udGV4dCk7XG4gICAgICAgIGlmICh2aXNpdGVkICYmICF0aGlzLl9pc0luVHJhbnNsYXRhYmxlU2VjdGlvbikge1xuICAgICAgICAgIC8vIERvIG5vdCBhZGQgdGhlIGNoaWxkcmVuIGZyb20gdHJhbnNsYXRhYmxlIHNlY3Rpb25zICg9IGkxOG4gYmxvY2tzIGhlcmUpXG4gICAgICAgICAgLy8gVGhleSB3aWxsIGJlIGFkZGVkIGxhdGVyIGluIHRoaXMgbG9vcCB3aGVuIHRoZSBibG9jayBjbG9zZXMgKGkuZS4gb24gYDwhLS0gL2kxOG4gLS0+YClcbiAgICAgICAgICBjaGlsZE5vZGVzID0gY2hpbGROb2Rlcy5jb25jYXQodmlzaXRlZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX3Zpc2l0QXR0cmlidXRlc09mKGVsKTtcblxuICAgIHRoaXMuX2RlcHRoLS07XG4gICAgdGhpcy5faW5JMThuTm9kZSA9IHdhc0luSTE4bk5vZGU7XG4gICAgdGhpcy5faW5JbXBsaWNpdE5vZGUgPSB3YXNJbkltcGxpY2l0Tm9kZTtcblxuICAgIGlmICh0aGlzLl9tb2RlID09PSBfVmlzaXRvck1vZGUuTWVyZ2UpIHtcbiAgICAgIGNvbnN0IHRyYW5zbGF0ZWRBdHRycyA9IHRoaXMuX3RyYW5zbGF0ZUF0dHJpYnV0ZXMoZWwpO1xuICAgICAgcmV0dXJuIG5ldyBodG1sLkVsZW1lbnQoXG4gICAgICAgICAgZWwubmFtZSwgdHJhbnNsYXRlZEF0dHJzLCBjaGlsZE5vZGVzLCBlbC5zb3VyY2VTcGFuLCBlbC5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgZWwuZW5kU291cmNlU3Bhbik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VucmVhY2hhYmxlIGNvZGUnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXQobW9kZTogX1Zpc2l0b3JNb2RlLCBpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnKTogdm9pZCB7XG4gICAgdGhpcy5fbW9kZSA9IG1vZGU7XG4gICAgdGhpcy5faW5JMThuQmxvY2sgPSBmYWxzZTtcbiAgICB0aGlzLl9pbkkxOG5Ob2RlID0gZmFsc2U7XG4gICAgdGhpcy5fZGVwdGggPSAwO1xuICAgIHRoaXMuX2luSWN1ID0gZmFsc2U7XG4gICAgdGhpcy5fbXNnQ291bnRBdFNlY3Rpb25TdGFydCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9lcnJvcnMgPSBbXTtcbiAgICB0aGlzLl9tZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMuX2luSW1wbGljaXROb2RlID0gZmFsc2U7XG4gICAgdGhpcy5fY3JlYXRlSTE4bk1lc3NhZ2UgPSBjcmVhdGVJMThuTWVzc2FnZUZhY3RvcnkoaW50ZXJwb2xhdGlvbkNvbmZpZyk7XG4gIH1cblxuICAvLyBsb29rcyBmb3IgdHJhbnNsYXRhYmxlIGF0dHJpYnV0ZXNcbiAgcHJpdmF0ZSBfdmlzaXRBdHRyaWJ1dGVzT2YoZWw6IGh0bWwuRWxlbWVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV4cGxpY2l0QXR0ck5hbWVUb1ZhbHVlOiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICBjb25zdCBpbXBsaWNpdEF0dHJOYW1lczogc3RyaW5nW10gPSB0aGlzLl9pbXBsaWNpdEF0dHJzW2VsLm5hbWVdIHx8IFtdO1xuXG4gICAgZWwuYXR0cnMuZmlsdGVyKGF0dHIgPT4gYXR0ci5uYW1lLnN0YXJ0c1dpdGgoX0kxOE5fQVRUUl9QUkVGSVgpKVxuICAgICAgICAuZm9yRWFjaChcbiAgICAgICAgICAgIGF0dHIgPT4gZXhwbGljaXRBdHRyTmFtZVRvVmFsdWVbYXR0ci5uYW1lLnNsaWNlKF9JMThOX0FUVFJfUFJFRklYLmxlbmd0aCldID1cbiAgICAgICAgICAgICAgICBhdHRyLnZhbHVlKTtcblxuICAgIGVsLmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZiAoYXR0ci5uYW1lIGluIGV4cGxpY2l0QXR0ck5hbWVUb1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX2FkZE1lc3NhZ2UoW2F0dHJdLCBleHBsaWNpdEF0dHJOYW1lVG9WYWx1ZVthdHRyLm5hbWVdKTtcbiAgICAgIH0gZWxzZSBpZiAoaW1wbGljaXRBdHRyTmFtZXMuc29tZShuYW1lID0+IGF0dHIubmFtZSA9PT0gbmFtZSkpIHtcbiAgICAgICAgdGhpcy5fYWRkTWVzc2FnZShbYXR0cl0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gYWRkIGEgdHJhbnNsYXRhYmxlIG1lc3NhZ2VcbiAgcHJpdmF0ZSBfYWRkTWVzc2FnZShhc3Q6IGh0bWwuTm9kZVtdLCBtc2dNZXRhPzogc3RyaW5nKTogaTE4bi5NZXNzYWdlfG51bGwge1xuICAgIGlmIChhc3QubGVuZ3RoID09IDAgfHxcbiAgICAgICAgYXN0Lmxlbmd0aCA9PSAxICYmIGFzdFswXSBpbnN0YW5jZW9mIGh0bWwuQXR0cmlidXRlICYmICEoPGh0bWwuQXR0cmlidXRlPmFzdFswXSkudmFsdWUpIHtcbiAgICAgIC8vIERvIG5vdCBjcmVhdGUgZW1wdHkgbWVzc2FnZXNcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHttZWFuaW5nLCBkZXNjcmlwdGlvbiwgaWR9ID0gX3BhcnNlTWVzc2FnZU1ldGEobXNnTWV0YSk7XG4gICAgY29uc3QgbWVzc2FnZSA9IHRoaXMuX2NyZWF0ZUkxOG5NZXNzYWdlKGFzdCwgbWVhbmluZywgZGVzY3JpcHRpb24sIGlkKTtcbiAgICB0aGlzLl9tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgLy8gVHJhbnNsYXRlcyB0aGUgZ2l2ZW4gbWVzc2FnZSBnaXZlbiB0aGUgYFRyYW5zbGF0aW9uQnVuZGxlYFxuICAvLyBUaGlzIGlzIHVzZWQgZm9yIHRyYW5zbGF0aW5nIGVsZW1lbnRzIC8gYmxvY2tzIC0gc2VlIGBfdHJhbnNsYXRlQXR0cmlidXRlc2AgZm9yIGF0dHJpYnV0ZXNcbiAgLy8gbm8tb3Agd2hlbiBjYWxsZWQgaW4gZXh0cmFjdGlvbiBtb2RlIChyZXR1cm5zIFtdKVxuICBwcml2YXRlIF90cmFuc2xhdGVNZXNzYWdlKGVsOiBodG1sLk5vZGUsIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSk6IGh0bWwuTm9kZVtdIHtcbiAgICBpZiAobWVzc2FnZSAmJiB0aGlzLl9tb2RlID09PSBfVmlzaXRvck1vZGUuTWVyZ2UpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fdHJhbnNsYXRpb25zLmdldChtZXNzYWdlKTtcblxuICAgICAgaWYgKG5vZGVzKSB7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgZWwsIGBUcmFuc2xhdGlvbiB1bmF2YWlsYWJsZSBmb3IgbWVzc2FnZSBpZD1cIiR7dGhpcy5fdHJhbnNsYXRpb25zLmRpZ2VzdChtZXNzYWdlKX1cImApO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIHRyYW5zbGF0ZSB0aGUgYXR0cmlidXRlcyBvZiBhbiBlbGVtZW50IGFuZCByZW1vdmUgaTE4biBzcGVjaWZpYyBhdHRyaWJ1dGVzXG4gIHByaXZhdGUgX3RyYW5zbGF0ZUF0dHJpYnV0ZXMoZWw6IGh0bWwuRWxlbWVudCk6IGh0bWwuQXR0cmlidXRlW10ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBlbC5hdHRycztcbiAgICBjb25zdCBpMThuUGFyc2VkTWVzc2FnZU1ldGE6XG4gICAgICAgIHtbbmFtZTogc3RyaW5nXToge21lYW5pbmc6IHN0cmluZywgZGVzY3JpcHRpb246IHN0cmluZywgaWQ6IHN0cmluZ319ID0ge307XG5cbiAgICBhdHRyaWJ1dGVzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoX0kxOE5fQVRUUl9QUkVGSVgpKSB7XG4gICAgICAgIGkxOG5QYXJzZWRNZXNzYWdlTWV0YVthdHRyLm5hbWUuc2xpY2UoX0kxOE5fQVRUUl9QUkVGSVgubGVuZ3RoKV0gPVxuICAgICAgICAgICAgX3BhcnNlTWVzc2FnZU1ldGEoYXR0ci52YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB0cmFuc2xhdGVkQXR0cmlidXRlczogaHRtbC5BdHRyaWJ1dGVbXSA9IFtdO1xuXG4gICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyKSA9PiB7XG4gICAgICBpZiAoYXR0ci5uYW1lID09PSBfSTE4Tl9BVFRSIHx8IGF0dHIubmFtZS5zdGFydHNXaXRoKF9JMThOX0FUVFJfUFJFRklYKSkge1xuICAgICAgICAvLyBzdHJpcCBpMThuIHNwZWNpZmljIGF0dHJpYnV0ZXNcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXR0ci52YWx1ZSAmJiBhdHRyLnZhbHVlICE9ICcnICYmIGkxOG5QYXJzZWRNZXNzYWdlTWV0YS5oYXNPd25Qcm9wZXJ0eShhdHRyLm5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHttZWFuaW5nLCBkZXNjcmlwdGlvbiwgaWR9ID0gaTE4blBhcnNlZE1lc3NhZ2VNZXRhW2F0dHIubmFtZV07XG4gICAgICAgIGNvbnN0IG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSA9IHRoaXMuX2NyZWF0ZUkxOG5NZXNzYWdlKFthdHRyXSwgbWVhbmluZywgZGVzY3JpcHRpb24sIGlkKTtcbiAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLl90cmFuc2xhdGlvbnMuZ2V0KG1lc3NhZ2UpO1xuICAgICAgICBpZiAobm9kZXMpIHtcbiAgICAgICAgICBpZiAobm9kZXMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZWRBdHRyaWJ1dGVzLnB1c2gobmV3IGh0bWwuQXR0cmlidXRlKGF0dHIubmFtZSwgJycsIGF0dHIuc291cmNlU3BhbikpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm9kZXNbMF0gaW5zdGFuY2VvZiBodG1sLlRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gKG5vZGVzWzBdIGFzIGh0bWwuVGV4dCkudmFsdWU7XG4gICAgICAgICAgICB0cmFuc2xhdGVkQXR0cmlidXRlcy5wdXNoKG5ldyBodG1sLkF0dHJpYnV0ZShhdHRyLm5hbWUsIHZhbHVlLCBhdHRyLnNvdXJjZVNwYW4pKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcmVwb3J0RXJyb3IoXG4gICAgICAgICAgICAgICAgZWwsXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgdHJhbnNsYXRpb24gZm9yIGF0dHJpYnV0ZSBcIiR7YXR0ci5uYW1lfVwiIChpZD1cIiR7XG4gICAgICAgICAgICAgICAgICAgIGlkIHx8IHRoaXMuX3RyYW5zbGF0aW9ucy5kaWdlc3QobWVzc2FnZSl9XCIpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlcG9ydEVycm9yKFxuICAgICAgICAgICAgICBlbCxcbiAgICAgICAgICAgICAgYFRyYW5zbGF0aW9uIHVuYXZhaWxhYmxlIGZvciBhdHRyaWJ1dGUgXCIke2F0dHIubmFtZX1cIiAoaWQ9XCIke1xuICAgICAgICAgICAgICAgICAgaWQgfHwgdGhpcy5fdHJhbnNsYXRpb25zLmRpZ2VzdChtZXNzYWdlKX1cIilgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJhbnNsYXRlZEF0dHJpYnV0ZXMucHVzaChhdHRyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0cmFuc2xhdGVkQXR0cmlidXRlcztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEFkZCB0aGUgbm9kZSBhcyBhIGNoaWxkIG9mIHRoZSBibG9jayB3aGVuOlxuICAgKiAtIHdlIGFyZSBpbiBhIGJsb2NrLFxuICAgKiAtIHdlIGFyZSBub3QgaW5zaWRlIGEgSUNVIG1lc3NhZ2UgKHRob3NlIGFyZSBoYW5kbGVkIHNlcGFyYXRlbHkpLFxuICAgKiAtIHRoZSBub2RlIGlzIGEgXCJkaXJlY3QgY2hpbGRcIiBvZiB0aGUgYmxvY2tcbiAgICovXG4gIHByaXZhdGUgX21heUJlQWRkQmxvY2tDaGlsZHJlbihub2RlOiBodG1sLk5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faW5JMThuQmxvY2sgJiYgIXRoaXMuX2luSWN1ICYmIHRoaXMuX2RlcHRoID09IHRoaXMuX2Jsb2NrU3RhcnREZXB0aCkge1xuICAgICAgdGhpcy5fYmxvY2tDaGlsZHJlbi5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgc3RhcnQgb2YgYSBzZWN0aW9uLCBzZWUgYF9jbG9zZVRyYW5zbGF0YWJsZVNlY3Rpb25gXG4gICAqL1xuICBwcml2YXRlIF9vcGVuVHJhbnNsYXRhYmxlU2VjdGlvbihub2RlOiBodG1sLk5vZGUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNJblRyYW5zbGF0YWJsZVNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKG5vZGUsICdVbmV4cGVjdGVkIHNlY3Rpb24gc3RhcnQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbXNnQ291bnRBdFNlY3Rpb25TdGFydCA9IHRoaXMuX21lc3NhZ2VzLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB0cmFuc2xhdGFibGUgc2VjdGlvbiBjb3VsZCBiZTpcbiAgICogLSB0aGUgY29udGVudCBvZiB0cmFuc2xhdGFibGUgZWxlbWVudCxcbiAgICogLSBub2RlcyBiZXR3ZWVuIGA8IS0tIGkxOG4gLS0+YCBhbmQgYDwhLS0gL2kxOG4gLS0+YCBjb21tZW50c1xuICAgKi9cbiAgcHJpdmF0ZSBnZXQgX2lzSW5UcmFuc2xhdGFibGVTZWN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9tc2dDb3VudEF0U2VjdGlvblN0YXJ0ICE9PSB2b2lkIDA7XG4gIH1cblxuICAvKipcbiAgICogVGVybWluYXRlcyBhIHNlY3Rpb24uXG4gICAqXG4gICAqIElmIGEgc2VjdGlvbiBoYXMgb25seSBvbmUgc2lnbmlmaWNhbnQgY2hpbGRyZW4gKGNvbW1lbnRzIG5vdCBzaWduaWZpY2FudCkgdGhlbiB3ZSBzaG91bGQgbm90XG4gICAqIGtlZXAgdGhlIG1lc3NhZ2UgZnJvbSB0aGlzIGNoaWxkcmVuOlxuICAgKlxuICAgKiBgPHAgaTE4bj1cIm1lYW5pbmd8ZGVzY3JpcHRpb25cIj57SUNVIG1lc3NhZ2V9PC9wPmAgd291bGQgcHJvZHVjZSB0d28gbWVzc2FnZXM6XG4gICAqIC0gb25lIGZvciB0aGUgPHA+IGNvbnRlbnQgd2l0aCBtZWFuaW5nIGFuZCBkZXNjcmlwdGlvbixcbiAgICogLSBhbm90aGVyIG9uZSBmb3IgdGhlIElDVSBtZXNzYWdlLlxuICAgKlxuICAgKiBJbiB0aGlzIGNhc2UgdGhlIGxhc3QgbWVzc2FnZSBpcyBkaXNjYXJkZWQgYXMgaXQgY29udGFpbnMgbGVzcyBpbmZvcm1hdGlvbiAodGhlIEFTVCBpc1xuICAgKiBvdGhlcndpc2UgaWRlbnRpY2FsKS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHdlIHNob3VsZCBzdGlsbCBrZWVwIG1lc3NhZ2VzIGV4dHJhY3RlZCBmcm9tIGF0dHJpYnV0ZXMgaW5zaWRlIHRoZSBzZWN0aW9uIChpZSBpbiB0aGVcbiAgICogSUNVIG1lc3NhZ2UgaGVyZSlcbiAgICovXG4gIHByaXZhdGUgX2Nsb3NlVHJhbnNsYXRhYmxlU2VjdGlvbihub2RlOiBodG1sLk5vZGUsIGRpcmVjdENoaWxkcmVuOiBodG1sLk5vZGVbXSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5faXNJblRyYW5zbGF0YWJsZVNlY3Rpb24pIHtcbiAgICAgIHRoaXMuX3JlcG9ydEVycm9yKG5vZGUsICdVbmV4cGVjdGVkIHNlY3Rpb24gZW5kJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMuX21zZ0NvdW50QXRTZWN0aW9uU3RhcnQ7XG4gICAgY29uc3Qgc2lnbmlmaWNhbnRDaGlsZHJlbjogbnVtYmVyID0gZGlyZWN0Q2hpbGRyZW4ucmVkdWNlKFxuICAgICAgICAoY291bnQ6IG51bWJlciwgbm9kZTogaHRtbC5Ob2RlKTogbnVtYmVyID0+IGNvdW50ICsgKG5vZGUgaW5zdGFuY2VvZiBodG1sLkNvbW1lbnQgPyAwIDogMSksXG4gICAgICAgIDApO1xuXG4gICAgaWYgKHNpZ25pZmljYW50Q2hpbGRyZW4gPT0gMSkge1xuICAgICAgZm9yIChsZXQgaSA9IHRoaXMuX21lc3NhZ2VzLmxlbmd0aCAtIDE7IGkgPj0gc3RhcnRJbmRleCE7IGktLSkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLl9tZXNzYWdlc1tpXS5ub2RlcztcbiAgICAgICAgaWYgKCEoYXN0Lmxlbmd0aCA9PSAxICYmIGFzdFswXSBpbnN0YW5jZW9mIGkxOG4uVGV4dCkpIHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9tc2dDb3VudEF0U2VjdGlvblN0YXJ0ID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVwb3J0RXJyb3Iobm9kZTogaHRtbC5Ob2RlLCBtc2c6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Vycm9ycy5wdXNoKG5ldyBJMThuRXJyb3Iobm9kZS5zb3VyY2VTcGFuLCBtc2cpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfaXNPcGVuaW5nQ29tbWVudChuOiBodG1sLk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuICEhKG4gaW5zdGFuY2VvZiBodG1sLkNvbW1lbnQgJiYgbi52YWx1ZSAmJiBuLnZhbHVlLnN0YXJ0c1dpdGgoJ2kxOG4nKSk7XG59XG5cbmZ1bmN0aW9uIF9pc0Nsb3NpbmdDb21tZW50KG46IGh0bWwuTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISEobiBpbnN0YW5jZW9mIGh0bWwuQ29tbWVudCAmJiBuLnZhbHVlICYmIG4udmFsdWUgPT09ICcvaTE4bicpO1xufVxuXG5mdW5jdGlvbiBfZ2V0STE4bkF0dHIocDogaHRtbC5FbGVtZW50KTogaHRtbC5BdHRyaWJ1dGV8bnVsbCB7XG4gIHJldHVybiBwLmF0dHJzLmZpbmQoYXR0ciA9PiBhdHRyLm5hbWUgPT09IF9JMThOX0FUVFIpIHx8IG51bGw7XG59XG5cbmZ1bmN0aW9uIF9wYXJzZU1lc3NhZ2VNZXRhKGkxOG4/OiBzdHJpbmcpOiB7bWVhbmluZzogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nLCBpZDogc3RyaW5nfSB7XG4gIGlmICghaTE4bikgcmV0dXJuIHttZWFuaW5nOiAnJywgZGVzY3JpcHRpb246ICcnLCBpZDogJyd9O1xuXG4gIGNvbnN0IGlkSW5kZXggPSBpMThuLmluZGV4T2YoSURfU0VQQVJBVE9SKTtcbiAgY29uc3QgZGVzY0luZGV4ID0gaTE4bi5pbmRleE9mKE1FQU5JTkdfU0VQQVJBVE9SKTtcbiAgY29uc3QgW21lYW5pbmdBbmREZXNjLCBpZF0gPVxuICAgICAgKGlkSW5kZXggPiAtMSkgPyBbaTE4bi5zbGljZSgwLCBpZEluZGV4KSwgaTE4bi5zbGljZShpZEluZGV4ICsgMildIDogW2kxOG4sICcnXTtcbiAgY29uc3QgW21lYW5pbmcsIGRlc2NyaXB0aW9uXSA9IChkZXNjSW5kZXggPiAtMSkgP1xuICAgICAgW21lYW5pbmdBbmREZXNjLnNsaWNlKDAsIGRlc2NJbmRleCksIG1lYW5pbmdBbmREZXNjLnNsaWNlKGRlc2NJbmRleCArIDEpXSA6XG4gICAgICBbJycsIG1lYW5pbmdBbmREZXNjXTtcblxuICByZXR1cm4ge21lYW5pbmcsIGRlc2NyaXB0aW9uLCBpZDogaWQudHJpbSgpfTtcbn1cbiJdfQ==