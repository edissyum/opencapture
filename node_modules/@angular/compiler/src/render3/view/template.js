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
        define("@angular/compiler/src/render3/view/template", ["require", "exports", "tslib", "@angular/compiler/src/compile_metadata", "@angular/compiler/src/compiler_util/expression_converter", "@angular/compiler/src/core", "@angular/compiler/src/expression_parser/ast", "@angular/compiler/src/expression_parser/lexer", "@angular/compiler/src/expression_parser/parser", "@angular/compiler/src/ml_parser/ast", "@angular/compiler/src/ml_parser/html_parser", "@angular/compiler/src/ml_parser/html_whitespaces", "@angular/compiler/src/ml_parser/interpolation_config", "@angular/compiler/src/ml_parser/tags", "@angular/compiler/src/output/map_util", "@angular/compiler/src/output/output_ast", "@angular/compiler/src/schema/dom_element_schema_registry", "@angular/compiler/src/selector", "@angular/compiler/src/template_parser/binding_parser", "@angular/compiler/src/util", "@angular/compiler/src/render3/r3_ast", "@angular/compiler/src/render3/r3_identifiers", "@angular/compiler/src/render3/r3_template_transform", "@angular/compiler/src/render3/util", "@angular/compiler/src/render3/view/i18n/context", "@angular/compiler/src/render3/view/i18n/get_msg_utils", "@angular/compiler/src/render3/view/i18n/localize_utils", "@angular/compiler/src/render3/view/i18n/meta", "@angular/compiler/src/render3/view/i18n/util", "@angular/compiler/src/render3/view/styling_builder", "@angular/compiler/src/render3/view/util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTranslationDeclStmts = exports.resolveSanitizationFn = exports.makeBindingParser = exports.parseTemplate = exports.createCssSelector = exports.BindingScope = exports.ValueConverter = exports.TemplateDefinitionBuilder = exports.prepareEventListenerParameters = exports.renderFlagCheckIfStmt = exports.LEADING_TRIVIA_CHARS = void 0;
    var tslib_1 = require("tslib");
    var compile_metadata_1 = require("@angular/compiler/src/compile_metadata");
    var expression_converter_1 = require("@angular/compiler/src/compiler_util/expression_converter");
    var core = require("@angular/compiler/src/core");
    var ast_1 = require("@angular/compiler/src/expression_parser/ast");
    var lexer_1 = require("@angular/compiler/src/expression_parser/lexer");
    var parser_1 = require("@angular/compiler/src/expression_parser/parser");
    var html = require("@angular/compiler/src/ml_parser/ast");
    var html_parser_1 = require("@angular/compiler/src/ml_parser/html_parser");
    var html_whitespaces_1 = require("@angular/compiler/src/ml_parser/html_whitespaces");
    var interpolation_config_1 = require("@angular/compiler/src/ml_parser/interpolation_config");
    var tags_1 = require("@angular/compiler/src/ml_parser/tags");
    var map_util_1 = require("@angular/compiler/src/output/map_util");
    var o = require("@angular/compiler/src/output/output_ast");
    var dom_element_schema_registry_1 = require("@angular/compiler/src/schema/dom_element_schema_registry");
    var selector_1 = require("@angular/compiler/src/selector");
    var binding_parser_1 = require("@angular/compiler/src/template_parser/binding_parser");
    var util_1 = require("@angular/compiler/src/util");
    var t = require("@angular/compiler/src/render3/r3_ast");
    var r3_identifiers_1 = require("@angular/compiler/src/render3/r3_identifiers");
    var r3_template_transform_1 = require("@angular/compiler/src/render3/r3_template_transform");
    var util_2 = require("@angular/compiler/src/render3/util");
    var context_1 = require("@angular/compiler/src/render3/view/i18n/context");
    var get_msg_utils_1 = require("@angular/compiler/src/render3/view/i18n/get_msg_utils");
    var localize_utils_1 = require("@angular/compiler/src/render3/view/i18n/localize_utils");
    var meta_1 = require("@angular/compiler/src/render3/view/i18n/meta");
    var util_3 = require("@angular/compiler/src/render3/view/i18n/util");
    var styling_builder_1 = require("@angular/compiler/src/render3/view/styling_builder");
    var util_4 = require("@angular/compiler/src/render3/view/util");
    // Selector attribute name of `<ng-content>`
    var NG_CONTENT_SELECT_ATTR = 'select';
    // Attribute name of `ngProjectAs`.
    var NG_PROJECT_AS_ATTR_NAME = 'ngProjectAs';
    // Global symbols available only inside event bindings.
    var EVENT_BINDING_SCOPE_GLOBALS = new Set(['$event']);
    // List of supported global targets for event listeners
    var GLOBAL_TARGET_RESOLVERS = new Map([['window', r3_identifiers_1.Identifiers.resolveWindow], ['document', r3_identifiers_1.Identifiers.resolveDocument], ['body', r3_identifiers_1.Identifiers.resolveBody]]);
    exports.LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];
    //  if (rf & flags) { .. }
    function renderFlagCheckIfStmt(flags, statements) {
        return o.ifStmt(o.variable(util_4.RENDER_FLAGS).bitwiseAnd(o.literal(flags), null, false), statements);
    }
    exports.renderFlagCheckIfStmt = renderFlagCheckIfStmt;
    function prepareEventListenerParameters(eventAst, handlerName, scope) {
        if (handlerName === void 0) { handlerName = null; }
        if (scope === void 0) { scope = null; }
        var type = eventAst.type, name = eventAst.name, target = eventAst.target, phase = eventAst.phase, handler = eventAst.handler;
        if (target && !GLOBAL_TARGET_RESOLVERS.has(target)) {
            throw new Error("Unexpected global target '" + target + "' defined for '" + name + "' event.\n        Supported list of global targets: " + Array.from(GLOBAL_TARGET_RESOLVERS.keys()) + ".");
        }
        var eventArgumentName = '$event';
        var implicitReceiverAccesses = new Set();
        var implicitReceiverExpr = (scope === null || scope.bindingLevel === 0) ?
            o.variable(util_4.CONTEXT_NAME) :
            scope.getOrCreateSharedContextVar(0);
        var bindingExpr = expression_converter_1.convertActionBinding(scope, implicitReceiverExpr, handler, 'b', function () { return util_1.error('Unexpected interpolation'); }, eventAst.handlerSpan, implicitReceiverAccesses, EVENT_BINDING_SCOPE_GLOBALS);
        var statements = [];
        if (scope) {
            statements.push.apply(statements, tslib_1.__spread(scope.restoreViewStatement()));
            statements.push.apply(statements, tslib_1.__spread(scope.variableDeclarations()));
        }
        statements.push.apply(statements, tslib_1.__spread(bindingExpr.render3Stmts));
        var eventName = type === 1 /* Animation */ ? util_2.prepareSyntheticListenerName(name, phase) : name;
        var fnName = handlerName && compile_metadata_1.sanitizeIdentifier(handlerName);
        var fnArgs = [];
        if (implicitReceiverAccesses.has(eventArgumentName)) {
            fnArgs.push(new o.FnParam(eventArgumentName, o.DYNAMIC_TYPE));
        }
        var handlerFn = o.fn(fnArgs, statements, o.INFERRED_TYPE, null, fnName);
        var params = [o.literal(eventName), handlerFn];
        if (target) {
            params.push(o.literal(false), // `useCapture` flag, defaults to `false`
            o.importExpr(GLOBAL_TARGET_RESOLVERS.get(target)));
        }
        return params;
    }
    exports.prepareEventListenerParameters = prepareEventListenerParameters;
    function createComponentDefConsts() {
        return { prepareStatements: [], constExpressions: [] };
    }
    var TemplateDefinitionBuilder = /** @class */ (function () {
        function TemplateDefinitionBuilder(constantPool, parentBindingScope, level, contextName, i18nContext, templateIndex, templateName, directiveMatcher, directives, pipeTypeByName, pipes, _namespace, relativeContextFilePath, i18nUseExternalIds, _constants) {
            var _this = this;
            if (level === void 0) { level = 0; }
            if (_constants === void 0) { _constants = createComponentDefConsts(); }
            this.constantPool = constantPool;
            this.level = level;
            this.contextName = contextName;
            this.i18nContext = i18nContext;
            this.templateIndex = templateIndex;
            this.templateName = templateName;
            this.directiveMatcher = directiveMatcher;
            this.directives = directives;
            this.pipeTypeByName = pipeTypeByName;
            this.pipes = pipes;
            this._namespace = _namespace;
            this.i18nUseExternalIds = i18nUseExternalIds;
            this._constants = _constants;
            this._dataIndex = 0;
            this._bindingContext = 0;
            this._prefixCode = [];
            /**
             * List of callbacks to generate creation mode instructions. We store them here as we process
             * the template so bindings in listeners are resolved only once all nodes have been visited.
             * This ensures all local refs and context variables are available for matching.
             */
            this._creationCodeFns = [];
            /**
             * List of callbacks to generate update mode instructions. We store them here as we process
             * the template so bindings are resolved only once all nodes have been visited. This ensures
             * all local refs and context variables are available for matching.
             */
            this._updateCodeFns = [];
            /** Index of the currently-selected node. */
            this._currentIndex = 0;
            /** Temporary variable declarations generated from visiting pipes, literals, etc. */
            this._tempVariables = [];
            /**
             * List of callbacks to build nested templates. Nested templates must not be visited until
             * after the parent template has finished visiting all of its nodes. This ensures that all
             * local ref bindings in nested templates are able to find local ref values if the refs
             * are defined after the template declaration.
             */
            this._nestedTemplateFns = [];
            this._unsupported = util_4.unsupported;
            // i18n context local to this template
            this.i18n = null;
            // Number of slots to reserve for pureFunctions
            this._pureFunctionSlots = 0;
            // Number of binding slots
            this._bindingSlots = 0;
            // Projection slots found in the template. Projection slots can distribute projected
            // nodes based on a selector, or can just use the wildcard selector to match
            // all nodes which aren't matching any selector.
            this._ngContentReservedSlots = [];
            // Number of non-default selectors found in all parent templates of this template. We need to
            // track it to properly adjust projection slot index in the `projection` instruction.
            this._ngContentSelectorsOffset = 0;
            // Expression that should be used as implicit receiver when converting template
            // expressions to output AST.
            this._implicitReceiverExpr = null;
            // These should be handled in the template or element directly.
            this.visitReference = util_4.invalid;
            this.visitVariable = util_4.invalid;
            this.visitTextAttribute = util_4.invalid;
            this.visitBoundAttribute = util_4.invalid;
            this.visitBoundEvent = util_4.invalid;
            this._bindingScope = parentBindingScope.nestedScope(level);
            // Turn the relative context file path into an identifier by replacing non-alphanumeric
            // characters with underscores.
            this.fileBasedI18nSuffix = relativeContextFilePath.replace(/[^A-Za-z0-9]/g, '_') + '_';
            this._valueConverter = new ValueConverter(constantPool, function () { return _this.allocateDataSlot(); }, function (numSlots) { return _this.allocatePureFunctionSlots(numSlots); }, function (name, localName, slot, value) {
                var pipeType = pipeTypeByName.get(name);
                if (pipeType) {
                    _this.pipes.add(pipeType);
                }
                _this._bindingScope.set(_this.level, localName, value);
                _this.creationInstruction(null, r3_identifiers_1.Identifiers.pipe, [o.literal(slot), o.literal(name)]);
            });
        }
        TemplateDefinitionBuilder.prototype.buildTemplateFunction = function (nodes, variables, ngContentSelectorsOffset, i18n) {
            var _this = this;
            if (ngContentSelectorsOffset === void 0) { ngContentSelectorsOffset = 0; }
            this._ngContentSelectorsOffset = ngContentSelectorsOffset;
            if (this._namespace !== r3_identifiers_1.Identifiers.namespaceHTML) {
                this.creationInstruction(null, this._namespace);
            }
            // Create variable bindings
            variables.forEach(function (v) { return _this.registerContextVariables(v); });
            // Initiate i18n context in case:
            // - this template has parent i18n context
            // - or the template has i18n meta associated with it,
            //   but it's not initiated by the Element (e.g. <ng-template i18n>)
            var initI18nContext = this.i18nContext ||
                (util_3.isI18nRootNode(i18n) && !util_3.isSingleI18nIcu(i18n) &&
                    !(isSingleElementTemplate(nodes) && nodes[0].i18n === i18n));
            var selfClosingI18nInstruction = hasTextChildrenOnly(nodes);
            if (initI18nContext) {
                this.i18nStart(null, i18n, selfClosingI18nInstruction);
            }
            // This is the initial pass through the nodes of this template. In this pass, we
            // queue all creation mode and update mode instructions for generation in the second
            // pass. It's necessary to separate the passes to ensure local refs are defined before
            // resolving bindings. We also count bindings in this pass as we walk bound expressions.
            t.visitAll(this, nodes);
            // Add total binding count to pure function count so pure function instructions are
            // generated with the correct slot offset when update instructions are processed.
            this._pureFunctionSlots += this._bindingSlots;
            // Pipes are walked in the first pass (to enqueue `pipe()` creation instructions and
            // `pipeBind` update instructions), so we have to update the slot offsets manually
            // to account for bindings.
            this._valueConverter.updatePipeSlotOffsets(this._bindingSlots);
            // Nested templates must be processed before creation instructions so template()
            // instructions can be generated with the correct internal const count.
            this._nestedTemplateFns.forEach(function (buildTemplateFn) { return buildTemplateFn(); });
            // Output the `projectionDef` instruction when some `<ng-content>` tags are present.
            // The `projectionDef` instruction is only emitted for the component template and
            // is skipped for nested templates (<ng-template> tags).
            if (this.level === 0 && this._ngContentReservedSlots.length) {
                var parameters = [];
                // By default the `projectionDef` instructions creates one slot for the wildcard
                // selector if no parameters are passed. Therefore we only want to allocate a new
                // array for the projection slots if the default projection slot is not sufficient.
                if (this._ngContentReservedSlots.length > 1 || this._ngContentReservedSlots[0] !== '*') {
                    var r3ReservedSlots = this._ngContentReservedSlots.map(function (s) { return s !== '*' ? core.parseSelectorToR3Selector(s) : s; });
                    parameters.push(this.constantPool.getConstLiteral(util_4.asLiteral(r3ReservedSlots), true));
                }
                // Since we accumulate ngContent selectors while processing template elements,
                // we *prepend* `projectionDef` to creation instructions block, to put it before
                // any `projection` instructions
                this.creationInstruction(null, r3_identifiers_1.Identifiers.projectionDef, parameters, /* prepend */ true);
            }
            if (initI18nContext) {
                this.i18nEnd(null, selfClosingI18nInstruction);
            }
            // Generate all the creation mode instructions (e.g. resolve bindings in listeners)
            var creationStatements = this._creationCodeFns.map(function (fn) { return fn(); });
            // Generate all the update mode instructions (e.g. resolve property or text bindings)
            var updateStatements = this._updateCodeFns.map(function (fn) { return fn(); });
            //  Variable declaration must occur after binding resolution so we can generate context
            //  instructions that build on each other.
            // e.g. const b = nextContext().$implicit(); const b = nextContext();
            var creationVariables = this._bindingScope.viewSnapshotStatements();
            var updateVariables = this._bindingScope.variableDeclarations().concat(this._tempVariables);
            var creationBlock = creationStatements.length > 0 ?
                [renderFlagCheckIfStmt(1 /* Create */, creationVariables.concat(creationStatements))] :
                [];
            var updateBlock = updateStatements.length > 0 ?
                [renderFlagCheckIfStmt(2 /* Update */, updateVariables.concat(updateStatements))] :
                [];
            return o.fn(
            // i.e. (rf: RenderFlags, ctx: any)
            [new o.FnParam(util_4.RENDER_FLAGS, o.NUMBER_TYPE), new o.FnParam(util_4.CONTEXT_NAME, null)], tslib_1.__spread(this._prefixCode, creationBlock, updateBlock), o.INFERRED_TYPE, null, this.templateName);
        };
        // LocalResolver
        TemplateDefinitionBuilder.prototype.getLocal = function (name) {
            return this._bindingScope.get(name);
        };
        // LocalResolver
        TemplateDefinitionBuilder.prototype.notifyImplicitReceiverUse = function () {
            this._bindingScope.notifyImplicitReceiverUse();
        };
        TemplateDefinitionBuilder.prototype.i18nTranslate = function (message, params, ref, transformFn) {
            var _a;
            if (params === void 0) { params = {}; }
            var _ref = ref || this.i18nGenerateMainBlockVar();
            // Closure Compiler requires const names to start with `MSG_` but disallows any other const to
            // start with `MSG_`. We define a variable starting with `MSG_` just for the `goog.getMsg` call
            var closureVar = this.i18nGenerateClosureVar(message.id);
            var statements = getTranslationDeclStmts(message, _ref, closureVar, params, transformFn);
            (_a = this._constants.prepareStatements).push.apply(_a, tslib_1.__spread(statements));
            return _ref;
        };
        TemplateDefinitionBuilder.prototype.registerContextVariables = function (variable) {
            var scopedName = this._bindingScope.freshReferenceName();
            var retrievalLevel = this.level;
            var lhs = o.variable(variable.name + scopedName);
            this._bindingScope.set(retrievalLevel, variable.name, lhs, 1 /* CONTEXT */, function (scope, relativeLevel) {
                var rhs;
                if (scope.bindingLevel === retrievalLevel) {
                    // e.g. ctx
                    rhs = o.variable(util_4.CONTEXT_NAME);
                }
                else {
                    var sharedCtxVar = scope.getSharedContextName(retrievalLevel);
                    // e.g. ctx_r0   OR  x(2);
                    rhs = sharedCtxVar ? sharedCtxVar : generateNextContextExpr(relativeLevel);
                }
                // e.g. const $item$ = x(2).$implicit;
                return [lhs.set(rhs.prop(variable.value || util_4.IMPLICIT_REFERENCE)).toConstDecl()];
            });
        };
        TemplateDefinitionBuilder.prototype.i18nAppendBindings = function (expressions) {
            var _this = this;
            if (expressions.length > 0) {
                expressions.forEach(function (expression) { return _this.i18n.appendBinding(expression); });
            }
        };
        TemplateDefinitionBuilder.prototype.i18nBindProps = function (props) {
            var _this = this;
            var bound = {};
            Object.keys(props).forEach(function (key) {
                var prop = props[key];
                if (prop instanceof t.Text) {
                    bound[key] = o.literal(prop.value);
                }
                else {
                    var value = prop.value.visit(_this._valueConverter);
                    _this.allocateBindingSlots(value);
                    if (value instanceof ast_1.Interpolation) {
                        var strings = value.strings, expressions = value.expressions;
                        var _a = _this.i18n, id = _a.id, bindings = _a.bindings;
                        var label = util_3.assembleI18nBoundString(strings, bindings.size, id);
                        _this.i18nAppendBindings(expressions);
                        bound[key] = o.literal(label);
                    }
                }
            });
            return bound;
        };
        // Generates top level vars for i18n blocks (i.e. `i18n_N`).
        TemplateDefinitionBuilder.prototype.i18nGenerateMainBlockVar = function () {
            return o.variable(this.constantPool.uniqueName(util_3.TRANSLATION_VAR_PREFIX));
        };
        // Generates vars with Closure-specific names for i18n blocks (i.e. `MSG_XXX`).
        TemplateDefinitionBuilder.prototype.i18nGenerateClosureVar = function (messageId) {
            var name;
            var suffix = this.fileBasedI18nSuffix.toUpperCase();
            if (this.i18nUseExternalIds) {
                var prefix = util_3.getTranslationConstPrefix("EXTERNAL_");
                var uniqueSuffix = this.constantPool.uniqueName(suffix);
                name = "" + prefix + compile_metadata_1.sanitizeIdentifier(messageId) + "$$" + uniqueSuffix;
            }
            else {
                var prefix = util_3.getTranslationConstPrefix(suffix);
                name = this.constantPool.uniqueName(prefix);
            }
            return o.variable(name);
        };
        TemplateDefinitionBuilder.prototype.i18nUpdateRef = function (context) {
            var icus = context.icus, meta = context.meta, isRoot = context.isRoot, isResolved = context.isResolved, isEmitted = context.isEmitted;
            if (isRoot && isResolved && !isEmitted && !util_3.isSingleI18nIcu(meta)) {
                context.isEmitted = true;
                var placeholders = context.getSerializedPlaceholders();
                var icuMapping_1 = {};
                var params_1 = placeholders.size ? util_3.placeholdersToParams(placeholders) : {};
                if (icus.size) {
                    icus.forEach(function (refs, key) {
                        if (refs.length === 1) {
                            // if we have one ICU defined for a given
                            // placeholder - just output its reference
                            params_1[key] = refs[0];
                        }
                        else {
                            // ... otherwise we need to activate post-processing
                            // to replace ICU placeholders with proper values
                            var placeholder = util_3.wrapI18nPlaceholder("" + util_3.I18N_ICU_MAPPING_PREFIX + key);
                            params_1[key] = o.literal(placeholder);
                            icuMapping_1[key] = o.literalArr(refs);
                        }
                    });
                }
                // translation requires post processing in 2 cases:
                // - if we have placeholders with multiple values (ex. `START_DIV`: [�#1�, �#2�, ...])
                // - if we have multiple ICUs that refer to the same placeholder name
                var needsPostprocessing = Array.from(placeholders.values()).some(function (value) { return value.length > 1; }) ||
                    Object.keys(icuMapping_1).length;
                var transformFn = void 0;
                if (needsPostprocessing) {
                    transformFn = function (raw) {
                        var args = [raw];
                        if (Object.keys(icuMapping_1).length) {
                            args.push(map_util_1.mapLiteral(icuMapping_1, true));
                        }
                        return instruction(null, r3_identifiers_1.Identifiers.i18nPostprocess, args);
                    };
                }
                this.i18nTranslate(meta, params_1, context.ref, transformFn);
            }
        };
        TemplateDefinitionBuilder.prototype.i18nStart = function (span, meta, selfClosing) {
            if (span === void 0) { span = null; }
            var index = this.allocateDataSlot();
            this.i18n = this.i18nContext ?
                this.i18nContext.forkChildContext(index, this.templateIndex, meta) :
                new context_1.I18nContext(index, this.i18nGenerateMainBlockVar(), 0, this.templateIndex, meta);
            // generate i18nStart instruction
            var _a = this.i18n, id = _a.id, ref = _a.ref;
            var params = [o.literal(index), this.addToConsts(ref)];
            if (id > 0) {
                // do not push 3rd argument (sub-block id)
                // into i18nStart call for top level i18n context
                params.push(o.literal(id));
            }
            this.creationInstruction(span, selfClosing ? r3_identifiers_1.Identifiers.i18n : r3_identifiers_1.Identifiers.i18nStart, params);
        };
        TemplateDefinitionBuilder.prototype.i18nEnd = function (span, selfClosing) {
            var _this = this;
            if (span === void 0) { span = null; }
            if (!this.i18n) {
                throw new Error('i18nEnd is executed with no i18n context present');
            }
            if (this.i18nContext) {
                this.i18nContext.reconcileChildContext(this.i18n);
                this.i18nUpdateRef(this.i18nContext);
            }
            else {
                this.i18nUpdateRef(this.i18n);
            }
            // setup accumulated bindings
            var _a = this.i18n, index = _a.index, bindings = _a.bindings;
            if (bindings.size) {
                var chainBindings_1 = [];
                bindings.forEach(function (binding) {
                    chainBindings_1.push({ sourceSpan: span, value: function () { return _this.convertPropertyBinding(binding); } });
                });
                // for i18n block, advance to the most recent element index (by taking the current number of
                // elements and subtracting one) before invoking `i18nExp` instructions, to make sure the
                // necessary lifecycle hooks of components/directives are properly flushed.
                this.updateInstructionChainWithAdvance(this.getConstCount() - 1, r3_identifiers_1.Identifiers.i18nExp, chainBindings_1);
                this.updateInstruction(span, r3_identifiers_1.Identifiers.i18nApply, [o.literal(index)]);
            }
            if (!selfClosing) {
                this.creationInstruction(span, r3_identifiers_1.Identifiers.i18nEnd);
            }
            this.i18n = null; // reset local i18n context
        };
        TemplateDefinitionBuilder.prototype.i18nAttributesInstruction = function (nodeIndex, attrs, sourceSpan) {
            var _this = this;
            var hasBindings = false;
            var i18nAttrArgs = [];
            var bindings = [];
            attrs.forEach(function (attr) {
                var message = attr.i18n;
                var converted = attr.value.visit(_this._valueConverter);
                _this.allocateBindingSlots(converted);
                if (converted instanceof ast_1.Interpolation) {
                    var placeholders = util_3.assembleBoundTextPlaceholders(message);
                    var params = util_3.placeholdersToParams(placeholders);
                    i18nAttrArgs.push(o.literal(attr.name), _this.i18nTranslate(message, params));
                    converted.expressions.forEach(function (expression) {
                        hasBindings = true;
                        bindings.push({
                            sourceSpan: sourceSpan,
                            value: function () { return _this.convertPropertyBinding(expression); },
                        });
                    });
                }
            });
            if (bindings.length > 0) {
                this.updateInstructionChainWithAdvance(nodeIndex, r3_identifiers_1.Identifiers.i18nExp, bindings);
            }
            if (i18nAttrArgs.length > 0) {
                var index = o.literal(this.allocateDataSlot());
                var constIndex = this.addToConsts(o.literalArr(i18nAttrArgs));
                this.creationInstruction(sourceSpan, r3_identifiers_1.Identifiers.i18nAttributes, [index, constIndex]);
                if (hasBindings) {
                    this.updateInstruction(sourceSpan, r3_identifiers_1.Identifiers.i18nApply, [index]);
                }
            }
        };
        TemplateDefinitionBuilder.prototype.getNamespaceInstruction = function (namespaceKey) {
            switch (namespaceKey) {
                case 'math':
                    return r3_identifiers_1.Identifiers.namespaceMathML;
                case 'svg':
                    return r3_identifiers_1.Identifiers.namespaceSVG;
                default:
                    return r3_identifiers_1.Identifiers.namespaceHTML;
            }
        };
        TemplateDefinitionBuilder.prototype.addNamespaceInstruction = function (nsInstruction, element) {
            this._namespace = nsInstruction;
            this.creationInstruction(element.startSourceSpan, nsInstruction);
        };
        /**
         * Adds an update instruction for an interpolated property or attribute, such as
         * `prop="{{value}}"` or `attr.title="{{value}}"`
         */
        TemplateDefinitionBuilder.prototype.interpolatedUpdateInstruction = function (instruction, elementIndex, attrName, input, value, params) {
            var _this = this;
            this.updateInstructionWithAdvance(elementIndex, input.sourceSpan, instruction, function () { return tslib_1.__spread([o.literal(attrName)], _this.getUpdateInstructionArguments(value), params); });
        };
        TemplateDefinitionBuilder.prototype.visitContent = function (ngContent) {
            var slot = this.allocateDataSlot();
            var projectionSlotIdx = this._ngContentSelectorsOffset + this._ngContentReservedSlots.length;
            var parameters = [o.literal(slot)];
            this._ngContentReservedSlots.push(ngContent.selector);
            var nonContentSelectAttributes = ngContent.attributes.filter(function (attr) { return attr.name.toLowerCase() !== NG_CONTENT_SELECT_ATTR; });
            var attributes = this.getAttributeExpressions(ngContent.name, nonContentSelectAttributes, [], []);
            if (attributes.length > 0) {
                parameters.push(o.literal(projectionSlotIdx), o.literalArr(attributes));
            }
            else if (projectionSlotIdx !== 0) {
                parameters.push(o.literal(projectionSlotIdx));
            }
            this.creationInstruction(ngContent.sourceSpan, r3_identifiers_1.Identifiers.projection, parameters);
            if (this.i18n) {
                this.i18n.appendProjection(ngContent.i18n, slot);
            }
        };
        TemplateDefinitionBuilder.prototype.visitElement = function (element) {
            var e_1, _a;
            var _this = this;
            var _b, _c;
            var elementIndex = this.allocateDataSlot();
            var stylingBuilder = new styling_builder_1.StylingBuilder(null);
            var isNonBindableMode = false;
            var isI18nRootElement = util_3.isI18nRootNode(element.i18n) && !util_3.isSingleI18nIcu(element.i18n);
            var outputAttrs = [];
            var _d = tslib_1.__read(tags_1.splitNsName(element.name), 2), namespaceKey = _d[0], elementName = _d[1];
            var isNgContainer = tags_1.isNgContainer(element.name);
            try {
                // Handle styling, i18n, ngNonBindable attributes
                for (var _e = tslib_1.__values(element.attributes), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var attr = _f.value;
                    var name_1 = attr.name, value = attr.value;
                    if (name_1 === util_4.NON_BINDABLE_ATTR) {
                        isNonBindableMode = true;
                    }
                    else if (name_1 === 'style') {
                        stylingBuilder.registerStyleAttr(value);
                    }
                    else if (name_1 === 'class') {
                        stylingBuilder.registerClassAttr(value);
                    }
                    else {
                        outputAttrs.push(attr);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Match directives on non i18n attributes
            this.matchDirectives(element.name, element);
            // Regular element or ng-container creation mode
            var parameters = [o.literal(elementIndex)];
            if (!isNgContainer) {
                parameters.push(o.literal(elementName));
            }
            // Add the attributes
            var allOtherInputs = [];
            var boundI18nAttrs = [];
            element.inputs.forEach(function (input) {
                var stylingInputWasSet = stylingBuilder.registerBoundInput(input);
                if (!stylingInputWasSet) {
                    if (input.type === 0 /* Property */ && input.i18n) {
                        boundI18nAttrs.push(input);
                    }
                    else {
                        allOtherInputs.push(input);
                    }
                }
            });
            // add attributes for directive and projection matching purposes
            var attributes = this.getAttributeExpressions(element.name, outputAttrs, allOtherInputs, element.outputs, stylingBuilder, [], boundI18nAttrs);
            parameters.push(this.addAttrsToConsts(attributes));
            // local refs (ex.: <div #foo #bar="baz">)
            var refs = this.prepareRefsArray(element.references);
            parameters.push(this.addToConsts(refs));
            var wasInNamespace = this._namespace;
            var currentNamespace = this.getNamespaceInstruction(namespaceKey);
            // If the namespace is changing now, include an instruction to change it
            // during element creation.
            if (currentNamespace !== wasInNamespace) {
                this.addNamespaceInstruction(currentNamespace, element);
            }
            if (this.i18n) {
                this.i18n.appendElement(element.i18n, elementIndex);
            }
            // Note that we do not append text node instructions and ICUs inside i18n section,
            // so we exclude them while calculating whether current element has children
            var hasChildren = (!isI18nRootElement && this.i18n) ? !hasTextChildrenOnly(element.children) :
                element.children.length > 0;
            var createSelfClosingInstruction = !stylingBuilder.hasBindingsWithPipes &&
                element.outputs.length === 0 && boundI18nAttrs.length === 0 && !hasChildren;
            var createSelfClosingI18nInstruction = !createSelfClosingInstruction && hasTextChildrenOnly(element.children);
            if (createSelfClosingInstruction) {
                this.creationInstruction(element.sourceSpan, isNgContainer ? r3_identifiers_1.Identifiers.elementContainer : r3_identifiers_1.Identifiers.element, util_4.trimTrailingNulls(parameters));
            }
            else {
                this.creationInstruction(element.startSourceSpan, isNgContainer ? r3_identifiers_1.Identifiers.elementContainerStart : r3_identifiers_1.Identifiers.elementStart, util_4.trimTrailingNulls(parameters));
                if (isNonBindableMode) {
                    this.creationInstruction(element.startSourceSpan, r3_identifiers_1.Identifiers.disableBindings);
                }
                if (boundI18nAttrs.length > 0) {
                    this.i18nAttributesInstruction(elementIndex, boundI18nAttrs, (_b = element.startSourceSpan) !== null && _b !== void 0 ? _b : element.sourceSpan);
                }
                // Generate Listeners (outputs)
                if (element.outputs.length > 0) {
                    var listeners = element.outputs.map(function (outputAst) { return ({
                        sourceSpan: outputAst.sourceSpan,
                        params: _this.prepareListenerParameter(element.name, outputAst, elementIndex)
                    }); });
                    this.creationInstructionChain(r3_identifiers_1.Identifiers.listener, listeners);
                }
                // Note: it's important to keep i18n/i18nStart instructions after i18nAttributes and
                // listeners, to make sure i18nAttributes instruction targets current element at runtime.
                if (isI18nRootElement) {
                    this.i18nStart(element.startSourceSpan, element.i18n, createSelfClosingI18nInstruction);
                }
            }
            // the code here will collect all update-level styling instructions and add them to the
            // update block of the template function AOT code. Instructions like `styleProp`,
            // `styleMap`, `classMap`, `classProp`
            // are all generated and assigned in the code below.
            var stylingInstructions = stylingBuilder.buildUpdateLevelInstructions(this._valueConverter);
            var limit = stylingInstructions.length - 1;
            for (var i = 0; i <= limit; i++) {
                var instruction_1 = stylingInstructions[i];
                this._bindingSlots += this.processStylingUpdateInstruction(elementIndex, instruction_1);
            }
            // the reason why `undefined` is used is because the renderer understands this as a
            // special value to symbolize that there is no RHS to this binding
            // TODO (matsko): revisit this once FW-959 is approached
            var emptyValueBindInstruction = o.literal(undefined);
            var propertyBindings = [];
            var attributeBindings = [];
            // Generate element input bindings
            allOtherInputs.forEach(function (input) {
                var inputType = input.type;
                if (inputType === 4 /* Animation */) {
                    var value_1 = input.value.visit(_this._valueConverter);
                    // animation bindings can be presented in the following formats:
                    // 1. [@binding]="fooExp"
                    // 2. [@binding]="{value:fooExp, params:{...}}"
                    // 3. [@binding]
                    // 4. @binding
                    // All formats will be valid for when a synthetic binding is created.
                    // The reasoning for this is because the renderer should get each
                    // synthetic binding value in the order of the array that they are
                    // defined in...
                    var hasValue_1 = value_1 instanceof ast_1.LiteralPrimitive ? !!value_1.value : true;
                    _this.allocateBindingSlots(value_1);
                    propertyBindings.push({
                        name: util_2.prepareSyntheticPropertyName(input.name),
                        sourceSpan: input.sourceSpan,
                        value: function () { return hasValue_1 ? _this.convertPropertyBinding(value_1) : emptyValueBindInstruction; }
                    });
                }
                else {
                    // we must skip attributes with associated i18n context, since these attributes are handled
                    // separately and corresponding `i18nExp` and `i18nApply` instructions will be generated
                    if (input.i18n)
                        return;
                    var value_2 = input.value.visit(_this._valueConverter);
                    if (value_2 !== undefined) {
                        var params_2 = [];
                        var _a = tslib_1.__read(tags_1.splitNsName(input.name), 2), attrNamespace = _a[0], attrName_1 = _a[1];
                        var isAttributeBinding = inputType === 1 /* Attribute */;
                        var sanitizationRef = resolveSanitizationFn(input.securityContext, isAttributeBinding);
                        if (sanitizationRef)
                            params_2.push(sanitizationRef);
                        if (attrNamespace) {
                            var namespaceLiteral = o.literal(attrNamespace);
                            if (sanitizationRef) {
                                params_2.push(namespaceLiteral);
                            }
                            else {
                                // If there wasn't a sanitization ref, we need to add
                                // an extra param so that we can pass in the namespace.
                                params_2.push(o.literal(null), namespaceLiteral);
                            }
                        }
                        _this.allocateBindingSlots(value_2);
                        if (inputType === 0 /* Property */) {
                            if (value_2 instanceof ast_1.Interpolation) {
                                // prop="{{value}}" and friends
                                _this.interpolatedUpdateInstruction(getPropertyInterpolationExpression(value_2), elementIndex, attrName_1, input, value_2, params_2);
                            }
                            else {
                                // [prop]="value"
                                // Collect all the properties so that we can chain into a single function at the end.
                                propertyBindings.push({
                                    name: attrName_1,
                                    sourceSpan: input.sourceSpan,
                                    value: function () { return _this.convertPropertyBinding(value_2); },
                                    params: params_2
                                });
                            }
                        }
                        else if (inputType === 1 /* Attribute */) {
                            if (value_2 instanceof ast_1.Interpolation && util_4.getInterpolationArgsLength(value_2) > 1) {
                                // attr.name="text{{value}}" and friends
                                _this.interpolatedUpdateInstruction(getAttributeInterpolationExpression(value_2), elementIndex, attrName_1, input, value_2, params_2);
                            }
                            else {
                                var boundValue_1 = value_2 instanceof ast_1.Interpolation ? value_2.expressions[0] : value_2;
                                // [attr.name]="value" or attr.name="{{value}}"
                                // Collect the attribute bindings so that they can be chained at the end.
                                attributeBindings.push({
                                    name: attrName_1,
                                    sourceSpan: input.sourceSpan,
                                    value: function () { return _this.convertPropertyBinding(boundValue_1); },
                                    params: params_2
                                });
                            }
                        }
                        else {
                            // class prop
                            _this.updateInstructionWithAdvance(elementIndex, input.sourceSpan, r3_identifiers_1.Identifiers.classProp, function () {
                                return tslib_1.__spread([
                                    o.literal(elementIndex), o.literal(attrName_1), _this.convertPropertyBinding(value_2)
                                ], params_2);
                            });
                        }
                    }
                }
            });
            if (propertyBindings.length > 0) {
                this.updateInstructionChainWithAdvance(elementIndex, r3_identifiers_1.Identifiers.property, propertyBindings);
            }
            if (attributeBindings.length > 0) {
                this.updateInstructionChainWithAdvance(elementIndex, r3_identifiers_1.Identifiers.attribute, attributeBindings);
            }
            // Traverse element child nodes
            t.visitAll(this, element.children);
            if (!isI18nRootElement && this.i18n) {
                this.i18n.appendElement(element.i18n, elementIndex, true);
            }
            if (!createSelfClosingInstruction) {
                // Finish element construction mode.
                var span = (_c = element.endSourceSpan) !== null && _c !== void 0 ? _c : element.sourceSpan;
                if (isI18nRootElement) {
                    this.i18nEnd(span, createSelfClosingI18nInstruction);
                }
                if (isNonBindableMode) {
                    this.creationInstruction(span, r3_identifiers_1.Identifiers.enableBindings);
                }
                this.creationInstruction(span, isNgContainer ? r3_identifiers_1.Identifiers.elementContainerEnd : r3_identifiers_1.Identifiers.elementEnd);
            }
        };
        TemplateDefinitionBuilder.prototype.visitTemplate = function (template) {
            var _this = this;
            var _a;
            var NG_TEMPLATE_TAG_NAME = 'ng-template';
            var templateIndex = this.allocateDataSlot();
            if (this.i18n) {
                this.i18n.appendTemplate(template.i18n, templateIndex);
            }
            var tagName = compile_metadata_1.sanitizeIdentifier(template.tagName || '');
            var contextName = "" + this.contextName + (tagName ? '_' + tagName : '') + "_" + templateIndex;
            var templateName = contextName + "_Template";
            var parameters = [
                o.literal(templateIndex),
                o.variable(templateName),
                // We don't care about the tag's namespace here, because we infer
                // it based on the parent nodes inside the template instruction.
                o.literal(template.tagName ? tags_1.splitNsName(template.tagName)[1] : template.tagName),
            ];
            // find directives matching on a given <ng-template> node
            this.matchDirectives(NG_TEMPLATE_TAG_NAME, template);
            // prepare attributes parameter (including attributes used for directive matching)
            var attrsExprs = this.getAttributeExpressions(NG_TEMPLATE_TAG_NAME, template.attributes, template.inputs, template.outputs, undefined /* styles */, template.templateAttrs);
            parameters.push(this.addAttrsToConsts(attrsExprs));
            // local refs (ex.: <ng-template #foo>)
            if (template.references && template.references.length) {
                var refs = this.prepareRefsArray(template.references);
                parameters.push(this.addToConsts(refs));
                parameters.push(o.importExpr(r3_identifiers_1.Identifiers.templateRefExtractor));
            }
            // Create the template function
            var templateVisitor = new TemplateDefinitionBuilder(this.constantPool, this._bindingScope, this.level + 1, contextName, this.i18n, templateIndex, templateName, this.directiveMatcher, this.directives, this.pipeTypeByName, this.pipes, this._namespace, this.fileBasedI18nSuffix, this.i18nUseExternalIds, this._constants);
            // Nested templates must not be visited until after their parent templates have completed
            // processing, so they are queued here until after the initial pass. Otherwise, we wouldn't
            // be able to support bindings in nested templates to local refs that occur after the
            // template definition. e.g. <div *ngIf="showing">{{ foo }}</div>  <div #foo></div>
            this._nestedTemplateFns.push(function () {
                var _a;
                var templateFunctionExpr = templateVisitor.buildTemplateFunction(template.children, template.variables, _this._ngContentReservedSlots.length + _this._ngContentSelectorsOffset, template.i18n);
                _this.constantPool.statements.push(templateFunctionExpr.toDeclStmt(templateName));
                if (templateVisitor._ngContentReservedSlots.length) {
                    (_a = _this._ngContentReservedSlots).push.apply(_a, tslib_1.__spread(templateVisitor._ngContentReservedSlots));
                }
            });
            // e.g. template(1, MyComp_Template_1)
            this.creationInstruction(template.sourceSpan, r3_identifiers_1.Identifiers.templateCreate, function () {
                parameters.splice(2, 0, o.literal(templateVisitor.getConstCount()), o.literal(templateVisitor.getVarCount()));
                return util_4.trimTrailingNulls(parameters);
            });
            // handle property bindings e.g. ɵɵproperty('ngForOf', ctx.items), et al;
            this.templatePropertyBindings(templateIndex, template.templateAttrs);
            // Only add normal input/output binding instructions on explicit <ng-template> elements.
            if (template.tagName === NG_TEMPLATE_TAG_NAME) {
                var _b = tslib_1.__read(util_1.partitionArray(template.inputs, util_3.hasI18nMeta), 2), i18nInputs = _b[0], inputs = _b[1];
                // Add i18n attributes that may act as inputs to directives. If such attributes are present,
                // generate `i18nAttributes` instruction. Note: we generate it only for explicit <ng-template>
                // elements, in case of inline templates, corresponding instructions will be generated in the
                // nested template function.
                if (i18nInputs.length > 0) {
                    this.i18nAttributesInstruction(templateIndex, i18nInputs, (_a = template.startSourceSpan) !== null && _a !== void 0 ? _a : template.sourceSpan);
                }
                // Add the input bindings
                if (inputs.length > 0) {
                    this.templatePropertyBindings(templateIndex, inputs);
                }
                // Generate listeners for directive output
                if (template.outputs.length > 0) {
                    var listeners = template.outputs.map(function (outputAst) { return ({
                        sourceSpan: outputAst.sourceSpan,
                        params: _this.prepareListenerParameter('ng_template', outputAst, templateIndex)
                    }); });
                    this.creationInstructionChain(r3_identifiers_1.Identifiers.listener, listeners);
                }
            }
        };
        TemplateDefinitionBuilder.prototype.visitBoundText = function (text) {
            var _this = this;
            if (this.i18n) {
                var value_3 = text.value.visit(this._valueConverter);
                this.allocateBindingSlots(value_3);
                if (value_3 instanceof ast_1.Interpolation) {
                    this.i18n.appendBoundText(text.i18n);
                    this.i18nAppendBindings(value_3.expressions);
                }
                return;
            }
            var nodeIndex = this.allocateDataSlot();
            this.creationInstruction(text.sourceSpan, r3_identifiers_1.Identifiers.text, [o.literal(nodeIndex)]);
            var value = text.value.visit(this._valueConverter);
            this.allocateBindingSlots(value);
            if (value instanceof ast_1.Interpolation) {
                this.updateInstructionWithAdvance(nodeIndex, text.sourceSpan, getTextInterpolationExpression(value), function () { return _this.getUpdateInstructionArguments(value); });
            }
            else {
                util_1.error('Text nodes should be interpolated and never bound directly.');
            }
        };
        TemplateDefinitionBuilder.prototype.visitText = function (text) {
            // when a text element is located within a translatable
            // block, we exclude this text element from instructions set,
            // since it will be captured in i18n content and processed at runtime
            if (!this.i18n) {
                this.creationInstruction(text.sourceSpan, r3_identifiers_1.Identifiers.text, [o.literal(this.allocateDataSlot()), o.literal(text.value)]);
            }
        };
        TemplateDefinitionBuilder.prototype.visitIcu = function (icu) {
            var initWasInvoked = false;
            // if an ICU was created outside of i18n block, we still treat
            // it as a translatable entity and invoke i18nStart and i18nEnd
            // to generate i18n context and the necessary instructions
            if (!this.i18n) {
                initWasInvoked = true;
                this.i18nStart(null, icu.i18n, true);
            }
            var i18n = this.i18n;
            var vars = this.i18nBindProps(icu.vars);
            var placeholders = this.i18nBindProps(icu.placeholders);
            // output ICU directly and keep ICU reference in context
            var message = icu.i18n;
            // we always need post-processing function for ICUs, to make sure that:
            // - all placeholders in a form of {PLACEHOLDER} are replaced with actual values (note:
            // `goog.getMsg` does not process ICUs and uses the `{PLACEHOLDER}` format for placeholders
            // inside ICUs)
            // - all ICU vars (such as `VAR_SELECT` or `VAR_PLURAL`) are replaced with correct values
            var transformFn = function (raw) {
                var params = tslib_1.__assign(tslib_1.__assign({}, vars), placeholders);
                var formatted = util_3.i18nFormatPlaceholderNames(params, /* useCamelCase */ false);
                return instruction(null, r3_identifiers_1.Identifiers.i18nPostprocess, [raw, map_util_1.mapLiteral(formatted, true)]);
            };
            // in case the whole i18n message is a single ICU - we do not need to
            // create a separate top-level translation, we can use the root ref instead
            // and make this ICU a top-level translation
            // note: ICU placeholders are replaced with actual values in `i18nPostprocess` function
            // separately, so we do not pass placeholders into `i18nTranslate` function.
            if (util_3.isSingleI18nIcu(i18n.meta)) {
                this.i18nTranslate(message, /* placeholders */ {}, i18n.ref, transformFn);
            }
            else {
                // output ICU directly and keep ICU reference in context
                var ref = this.i18nTranslate(message, /* placeholders */ {}, /* ref */ undefined, transformFn);
                i18n.appendIcu(util_3.icuFromI18nMessage(message).name, ref);
            }
            if (initWasInvoked) {
                this.i18nEnd(null, true);
            }
            return null;
        };
        TemplateDefinitionBuilder.prototype.allocateDataSlot = function () {
            return this._dataIndex++;
        };
        TemplateDefinitionBuilder.prototype.getConstCount = function () {
            return this._dataIndex;
        };
        TemplateDefinitionBuilder.prototype.getVarCount = function () {
            return this._pureFunctionSlots;
        };
        TemplateDefinitionBuilder.prototype.getConsts = function () {
            return this._constants;
        };
        TemplateDefinitionBuilder.prototype.getNgContentSelectors = function () {
            return this._ngContentReservedSlots.length ?
                this.constantPool.getConstLiteral(util_4.asLiteral(this._ngContentReservedSlots), true) :
                null;
        };
        TemplateDefinitionBuilder.prototype.bindingContext = function () {
            return "" + this._bindingContext++;
        };
        TemplateDefinitionBuilder.prototype.templatePropertyBindings = function (templateIndex, attrs) {
            var _this = this;
            var propertyBindings = [];
            attrs.forEach(function (input) {
                if (input instanceof t.BoundAttribute) {
                    var value_4 = input.value.visit(_this._valueConverter);
                    if (value_4 !== undefined) {
                        _this.allocateBindingSlots(value_4);
                        if (value_4 instanceof ast_1.Interpolation) {
                            // Params typically contain attribute namespace and value sanitizer, which is applicable
                            // for regular HTML elements, but not applicable for <ng-template> (since props act as
                            // inputs to directives), so keep params array empty.
                            var params = [];
                            // prop="{{value}}" case
                            _this.interpolatedUpdateInstruction(getPropertyInterpolationExpression(value_4), templateIndex, input.name, input, value_4, params);
                        }
                        else {
                            // [prop]="value" case
                            propertyBindings.push({
                                name: input.name,
                                sourceSpan: input.sourceSpan,
                                value: function () { return _this.convertPropertyBinding(value_4); }
                            });
                        }
                    }
                }
            });
            if (propertyBindings.length > 0) {
                this.updateInstructionChainWithAdvance(templateIndex, r3_identifiers_1.Identifiers.property, propertyBindings);
            }
        };
        // Bindings must only be resolved after all local refs have been visited, so all
        // instructions are queued in callbacks that execute once the initial pass has completed.
        // Otherwise, we wouldn't be able to support local refs that are defined after their
        // bindings. e.g. {{ foo }} <div #foo></div>
        TemplateDefinitionBuilder.prototype.instructionFn = function (fns, span, reference, paramsOrFn, prepend) {
            if (prepend === void 0) { prepend = false; }
            fns[prepend ? 'unshift' : 'push'](function () {
                var params = Array.isArray(paramsOrFn) ? paramsOrFn : paramsOrFn();
                return instruction(span, reference, params).toStmt();
            });
        };
        TemplateDefinitionBuilder.prototype.processStylingUpdateInstruction = function (elementIndex, instruction) {
            var _this = this;
            var allocateBindingSlots = 0;
            if (instruction) {
                var calls_1 = [];
                instruction.calls.forEach(function (call) {
                    allocateBindingSlots += call.allocateBindingSlots;
                    calls_1.push({
                        sourceSpan: call.sourceSpan,
                        value: function () {
                            return call.params(function (value) { return (call.supportsInterpolation && value instanceof ast_1.Interpolation) ?
                                _this.getUpdateInstructionArguments(value) :
                                _this.convertPropertyBinding(value); });
                        }
                    });
                });
                this.updateInstructionChainWithAdvance(elementIndex, instruction.reference, calls_1);
            }
            return allocateBindingSlots;
        };
        TemplateDefinitionBuilder.prototype.creationInstruction = function (span, reference, paramsOrFn, prepend) {
            this.instructionFn(this._creationCodeFns, span, reference, paramsOrFn || [], prepend);
        };
        TemplateDefinitionBuilder.prototype.creationInstructionChain = function (reference, calls) {
            var span = calls.length ? calls[0].sourceSpan : null;
            this._creationCodeFns.push(function () {
                return util_4.chainedInstruction(reference, calls.map(function (call) { return call.params(); }), span).toStmt();
            });
        };
        TemplateDefinitionBuilder.prototype.updateInstructionWithAdvance = function (nodeIndex, span, reference, paramsOrFn) {
            this.addAdvanceInstructionIfNecessary(nodeIndex, span);
            this.updateInstruction(span, reference, paramsOrFn);
        };
        TemplateDefinitionBuilder.prototype.updateInstruction = function (span, reference, paramsOrFn) {
            this.instructionFn(this._updateCodeFns, span, reference, paramsOrFn || []);
        };
        TemplateDefinitionBuilder.prototype.updateInstructionChain = function (reference, bindings) {
            var span = bindings.length ? bindings[0].sourceSpan : null;
            this._updateCodeFns.push(function () {
                var calls = bindings.map(function (property) {
                    var value = property.value();
                    var fnParams = Array.isArray(value) ? value : [value];
                    if (property.params) {
                        fnParams.push.apply(fnParams, tslib_1.__spread(property.params));
                    }
                    if (property.name) {
                        // We want the property name to always be the first function parameter.
                        fnParams.unshift(o.literal(property.name));
                    }
                    return fnParams;
                });
                return util_4.chainedInstruction(reference, calls, span).toStmt();
            });
        };
        TemplateDefinitionBuilder.prototype.updateInstructionChainWithAdvance = function (nodeIndex, reference, bindings) {
            this.addAdvanceInstructionIfNecessary(nodeIndex, bindings.length ? bindings[0].sourceSpan : null);
            this.updateInstructionChain(reference, bindings);
        };
        TemplateDefinitionBuilder.prototype.addAdvanceInstructionIfNecessary = function (nodeIndex, span) {
            if (nodeIndex !== this._currentIndex) {
                var delta = nodeIndex - this._currentIndex;
                if (delta < 1) {
                    throw new Error('advance instruction can only go forwards');
                }
                this.instructionFn(this._updateCodeFns, span, r3_identifiers_1.Identifiers.advance, [o.literal(delta)]);
                this._currentIndex = nodeIndex;
            }
        };
        TemplateDefinitionBuilder.prototype.allocatePureFunctionSlots = function (numSlots) {
            var originalSlots = this._pureFunctionSlots;
            this._pureFunctionSlots += numSlots;
            return originalSlots;
        };
        TemplateDefinitionBuilder.prototype.allocateBindingSlots = function (value) {
            this._bindingSlots += value instanceof ast_1.Interpolation ? value.expressions.length : 1;
        };
        /**
         * Gets an expression that refers to the implicit receiver. The implicit
         * receiver is always the root level context.
         */
        TemplateDefinitionBuilder.prototype.getImplicitReceiverExpr = function () {
            if (this._implicitReceiverExpr) {
                return this._implicitReceiverExpr;
            }
            return this._implicitReceiverExpr = this.level === 0 ?
                o.variable(util_4.CONTEXT_NAME) :
                this._bindingScope.getOrCreateSharedContextVar(0);
        };
        TemplateDefinitionBuilder.prototype.convertPropertyBinding = function (value) {
            var _a;
            var convertedPropertyBinding = expression_converter_1.convertPropertyBinding(this, this.getImplicitReceiverExpr(), value, this.bindingContext(), expression_converter_1.BindingForm.Expression, function () { return util_1.error('Unexpected interpolation'); });
            var valExpr = convertedPropertyBinding.currValExpr;
            (_a = this._tempVariables).push.apply(_a, tslib_1.__spread(convertedPropertyBinding.stmts));
            return valExpr;
        };
        /**
         * Gets a list of argument expressions to pass to an update instruction expression. Also updates
         * the temp variables state with temp variables that were identified as needing to be created
         * while visiting the arguments.
         * @param value The original expression we will be resolving an arguments list from.
         */
        TemplateDefinitionBuilder.prototype.getUpdateInstructionArguments = function (value) {
            var _a;
            var _b = expression_converter_1.convertUpdateArguments(this, this.getImplicitReceiverExpr(), value, this.bindingContext()), args = _b.args, stmts = _b.stmts;
            (_a = this._tempVariables).push.apply(_a, tslib_1.__spread(stmts));
            return args;
        };
        TemplateDefinitionBuilder.prototype.matchDirectives = function (elementName, elOrTpl) {
            var _this = this;
            if (this.directiveMatcher) {
                var selector = createCssSelector(elementName, util_4.getAttrsForDirectiveMatching(elOrTpl));
                this.directiveMatcher.match(selector, function (cssSelector, staticType) {
                    _this.directives.add(staticType);
                });
            }
        };
        /**
         * Prepares all attribute expression values for the `TAttributes` array.
         *
         * The purpose of this function is to properly construct an attributes array that
         * is passed into the `elementStart` (or just `element`) functions. Because there
         * are many different types of attributes, the array needs to be constructed in a
         * special way so that `elementStart` can properly evaluate them.
         *
         * The format looks like this:
         *
         * ```
         * attrs = [prop, value, prop2, value2,
         *   PROJECT_AS, selector,
         *   CLASSES, class1, class2,
         *   STYLES, style1, value1, style2, value2,
         *   BINDINGS, name1, name2, name3,
         *   TEMPLATE, name4, name5, name6,
         *   I18N, name7, name8, ...]
         * ```
         *
         * Note that this function will fully ignore all synthetic (@foo) attribute values
         * because those values are intended to always be generated as property instructions.
         */
        TemplateDefinitionBuilder.prototype.getAttributeExpressions = function (elementName, renderAttributes, inputs, outputs, styles, templateAttrs, boundI18nAttrs) {
            var e_2, _a;
            if (templateAttrs === void 0) { templateAttrs = []; }
            if (boundI18nAttrs === void 0) { boundI18nAttrs = []; }
            var alreadySeen = new Set();
            var attrExprs = [];
            var ngProjectAsAttr;
            try {
                for (var renderAttributes_1 = tslib_1.__values(renderAttributes), renderAttributes_1_1 = renderAttributes_1.next(); !renderAttributes_1_1.done; renderAttributes_1_1 = renderAttributes_1.next()) {
                    var attr = renderAttributes_1_1.value;
                    if (attr.name === NG_PROJECT_AS_ATTR_NAME) {
                        ngProjectAsAttr = attr;
                    }
                    // Note that static i18n attributes aren't in the i18n array,
                    // because they're treated in the same way as regular attributes.
                    if (attr.i18n) {
                        attrExprs.push(o.literal(attr.name), this.i18nTranslate(attr.i18n));
                    }
                    else {
                        attrExprs.push.apply(attrExprs, tslib_1.__spread(getAttributeNameLiterals(attr.name), [trustedConstAttribute(elementName, attr)]));
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (renderAttributes_1_1 && !renderAttributes_1_1.done && (_a = renderAttributes_1.return)) _a.call(renderAttributes_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Keep ngProjectAs next to the other name, value pairs so we can verify that we match
            // ngProjectAs marker in the attribute name slot.
            if (ngProjectAsAttr) {
                attrExprs.push.apply(attrExprs, tslib_1.__spread(getNgProjectAsLiteral(ngProjectAsAttr)));
            }
            function addAttrExpr(key, value) {
                if (typeof key === 'string') {
                    if (!alreadySeen.has(key)) {
                        attrExprs.push.apply(attrExprs, tslib_1.__spread(getAttributeNameLiterals(key)));
                        value !== undefined && attrExprs.push(value);
                        alreadySeen.add(key);
                    }
                }
                else {
                    attrExprs.push(o.literal(key));
                }
            }
            // it's important that this occurs before BINDINGS and TEMPLATE because once `elementStart`
            // comes across the BINDINGS or TEMPLATE markers then it will continue reading each value as
            // as single property value cell by cell.
            if (styles) {
                styles.populateInitialStylingAttrs(attrExprs);
            }
            if (inputs.length || outputs.length) {
                var attrsLengthBeforeInputs = attrExprs.length;
                for (var i = 0; i < inputs.length; i++) {
                    var input = inputs[i];
                    // We don't want the animation and attribute bindings in the
                    // attributes array since they aren't used for directive matching.
                    if (input.type !== 4 /* Animation */ && input.type !== 1 /* Attribute */) {
                        addAttrExpr(input.name);
                    }
                }
                for (var i = 0; i < outputs.length; i++) {
                    var output = outputs[i];
                    if (output.type !== 1 /* Animation */) {
                        addAttrExpr(output.name);
                    }
                }
                // this is a cheap way of adding the marker only after all the input/output
                // values have been filtered (by not including the animation ones) and added
                // to the expressions. The marker is important because it tells the runtime
                // code that this is where attributes without values start...
                if (attrExprs.length !== attrsLengthBeforeInputs) {
                    attrExprs.splice(attrsLengthBeforeInputs, 0, o.literal(3 /* Bindings */));
                }
            }
            if (templateAttrs.length) {
                attrExprs.push(o.literal(4 /* Template */));
                templateAttrs.forEach(function (attr) { return addAttrExpr(attr.name); });
            }
            if (boundI18nAttrs.length) {
                attrExprs.push(o.literal(6 /* I18n */));
                boundI18nAttrs.forEach(function (attr) { return addAttrExpr(attr.name); });
            }
            return attrExprs;
        };
        TemplateDefinitionBuilder.prototype.addToConsts = function (expression) {
            if (o.isNull(expression)) {
                return o.TYPED_NULL_EXPR;
            }
            var consts = this._constants.constExpressions;
            // Try to reuse a literal that's already in the array, if possible.
            for (var i = 0; i < consts.length; i++) {
                if (consts[i].isEquivalent(expression)) {
                    return o.literal(i);
                }
            }
            return o.literal(consts.push(expression) - 1);
        };
        TemplateDefinitionBuilder.prototype.addAttrsToConsts = function (attrs) {
            return attrs.length > 0 ? this.addToConsts(o.literalArr(attrs)) : o.TYPED_NULL_EXPR;
        };
        TemplateDefinitionBuilder.prototype.prepareRefsArray = function (references) {
            var _this = this;
            if (!references || references.length === 0) {
                return o.TYPED_NULL_EXPR;
            }
            var refsParam = compile_metadata_1.flatten(references.map(function (reference) {
                var slot = _this.allocateDataSlot();
                // Generate the update temporary.
                var variableName = _this._bindingScope.freshReferenceName();
                var retrievalLevel = _this.level;
                var lhs = o.variable(variableName);
                _this._bindingScope.set(retrievalLevel, reference.name, lhs, 0 /* DEFAULT */, function (scope, relativeLevel) {
                    // e.g. nextContext(2);
                    var nextContextStmt = relativeLevel > 0 ? [generateNextContextExpr(relativeLevel).toStmt()] : [];
                    // e.g. const $foo$ = reference(1);
                    var refExpr = lhs.set(o.importExpr(r3_identifiers_1.Identifiers.reference).callFn([o.literal(slot)]));
                    return nextContextStmt.concat(refExpr.toConstDecl());
                }, true);
                return [reference.name, reference.value];
            }));
            return util_4.asLiteral(refsParam);
        };
        TemplateDefinitionBuilder.prototype.prepareListenerParameter = function (tagName, outputAst, index) {
            var _this = this;
            return function () {
                var eventName = outputAst.name;
                var bindingFnName = outputAst.type === 1 /* Animation */ ?
                    // synthetic @listener.foo values are treated the exact same as are standard listeners
                    util_2.prepareSyntheticListenerFunctionName(eventName, outputAst.phase) :
                    compile_metadata_1.sanitizeIdentifier(eventName);
                var handlerName = _this.templateName + "_" + tagName + "_" + bindingFnName + "_" + index + "_listener";
                var scope = _this._bindingScope.nestedScope(_this._bindingScope.bindingLevel, EVENT_BINDING_SCOPE_GLOBALS);
                return prepareEventListenerParameters(outputAst, handlerName, scope);
            };
        };
        return TemplateDefinitionBuilder;
    }());
    exports.TemplateDefinitionBuilder = TemplateDefinitionBuilder;
    var ValueConverter = /** @class */ (function (_super) {
        tslib_1.__extends(ValueConverter, _super);
        function ValueConverter(constantPool, allocateSlot, allocatePureFunctionSlots, definePipe) {
            var _this = _super.call(this) || this;
            _this.constantPool = constantPool;
            _this.allocateSlot = allocateSlot;
            _this.allocatePureFunctionSlots = allocatePureFunctionSlots;
            _this.definePipe = definePipe;
            _this._pipeBindExprs = [];
            return _this;
        }
        // AstMemoryEfficientTransformer
        ValueConverter.prototype.visitPipe = function (pipe, context) {
            // Allocate a slot to create the pipe
            var slot = this.allocateSlot();
            var slotPseudoLocal = "PIPE:" + slot;
            // Allocate one slot for the result plus one slot per pipe argument
            var pureFunctionSlot = this.allocatePureFunctionSlots(2 + pipe.args.length);
            var target = new ast_1.PropertyRead(pipe.span, pipe.sourceSpan, pipe.nameSpan, new ast_1.ImplicitReceiver(pipe.span, pipe.sourceSpan), slotPseudoLocal);
            var _a = pipeBindingCallInfo(pipe.args), identifier = _a.identifier, isVarLength = _a.isVarLength;
            this.definePipe(pipe.name, slotPseudoLocal, slot, o.importExpr(identifier));
            var args = tslib_1.__spread([pipe.exp], pipe.args);
            var convertedArgs = isVarLength ?
                this.visitAll([new ast_1.LiteralArray(pipe.span, pipe.sourceSpan, args)]) :
                this.visitAll(args);
            var pipeBindExpr = new ast_1.FunctionCall(pipe.span, pipe.sourceSpan, target, tslib_1.__spread([
                new ast_1.LiteralPrimitive(pipe.span, pipe.sourceSpan, slot),
                new ast_1.LiteralPrimitive(pipe.span, pipe.sourceSpan, pureFunctionSlot)
            ], convertedArgs));
            this._pipeBindExprs.push(pipeBindExpr);
            return pipeBindExpr;
        };
        ValueConverter.prototype.updatePipeSlotOffsets = function (bindingSlots) {
            this._pipeBindExprs.forEach(function (pipe) {
                // update the slot offset arg (index 1) to account for binding slots
                var slotOffset = pipe.args[1];
                slotOffset.value += bindingSlots;
            });
        };
        ValueConverter.prototype.visitLiteralArray = function (array, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(array.span, array.sourceSpan, this.visitAll(array.expressions), function (values) {
                // If the literal has calculated (non-literal) elements transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values.
                var literal = o.literalArr(values);
                return getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
            });
        };
        ValueConverter.prototype.visitLiteralMap = function (map, context) {
            var _this = this;
            return new expression_converter_1.BuiltinFunctionCall(map.span, map.sourceSpan, this.visitAll(map.values), function (values) {
                // If the literal has calculated (non-literal) elements  transform it into
                // calls to literal factories that compose the literal and will cache intermediate
                // values.
                var literal = o.literalMap(values.map(function (value, index) { return ({ key: map.keys[index].key, value: value, quoted: map.keys[index].quoted }); }));
                return getLiteralFactory(_this.constantPool, literal, _this.allocatePureFunctionSlots);
            });
        };
        return ValueConverter;
    }(ast_1.AstMemoryEfficientTransformer));
    exports.ValueConverter = ValueConverter;
    // Pipes always have at least one parameter, the value they operate on
    var pipeBindingIdentifiers = [r3_identifiers_1.Identifiers.pipeBind1, r3_identifiers_1.Identifiers.pipeBind2, r3_identifiers_1.Identifiers.pipeBind3, r3_identifiers_1.Identifiers.pipeBind4];
    function pipeBindingCallInfo(args) {
        var identifier = pipeBindingIdentifiers[args.length];
        return {
            identifier: identifier || r3_identifiers_1.Identifiers.pipeBindV,
            isVarLength: !identifier,
        };
    }
    var pureFunctionIdentifiers = [
        r3_identifiers_1.Identifiers.pureFunction0, r3_identifiers_1.Identifiers.pureFunction1, r3_identifiers_1.Identifiers.pureFunction2, r3_identifiers_1.Identifiers.pureFunction3, r3_identifiers_1.Identifiers.pureFunction4,
        r3_identifiers_1.Identifiers.pureFunction5, r3_identifiers_1.Identifiers.pureFunction6, r3_identifiers_1.Identifiers.pureFunction7, r3_identifiers_1.Identifiers.pureFunction8
    ];
    function pureFunctionCallInfo(args) {
        var identifier = pureFunctionIdentifiers[args.length];
        return {
            identifier: identifier || r3_identifiers_1.Identifiers.pureFunctionV,
            isVarLength: !identifier,
        };
    }
    function instruction(span, reference, params) {
        return o.importExpr(reference, null, span).callFn(params, span);
    }
    // e.g. x(2);
    function generateNextContextExpr(relativeLevelDiff) {
        return o.importExpr(r3_identifiers_1.Identifiers.nextContext)
            .callFn(relativeLevelDiff > 1 ? [o.literal(relativeLevelDiff)] : []);
    }
    function getLiteralFactory(constantPool, literal, allocateSlots) {
        var _a = constantPool.getLiteralFactory(literal), literalFactory = _a.literalFactory, literalFactoryArguments = _a.literalFactoryArguments;
        // Allocate 1 slot for the result plus 1 per argument
        var startSlot = allocateSlots(1 + literalFactoryArguments.length);
        var _b = pureFunctionCallInfo(literalFactoryArguments), identifier = _b.identifier, isVarLength = _b.isVarLength;
        // Literal factories are pure functions that only need to be re-invoked when the parameters
        // change.
        var args = [o.literal(startSlot), literalFactory];
        if (isVarLength) {
            args.push(o.literalArr(literalFactoryArguments));
        }
        else {
            args.push.apply(args, tslib_1.__spread(literalFactoryArguments));
        }
        return o.importExpr(identifier).callFn(args);
    }
    /**
     * Gets an array of literals that can be added to an expression
     * to represent the name and namespace of an attribute. E.g.
     * `:xlink:href` turns into `[AttributeMarker.NamespaceURI, 'xlink', 'href']`.
     *
     * @param name Name of the attribute, including the namespace.
     */
    function getAttributeNameLiterals(name) {
        var _a = tslib_1.__read(tags_1.splitNsName(name), 2), attributeNamespace = _a[0], attributeName = _a[1];
        var nameLiteral = o.literal(attributeName);
        if (attributeNamespace) {
            return [
                o.literal(0 /* NamespaceURI */), o.literal(attributeNamespace), nameLiteral
            ];
        }
        return [nameLiteral];
    }
    /** The prefix used to get a shared context in BindingScope's map. */
    var SHARED_CONTEXT_KEY = '$$shared_ctx$$';
    var BindingScope = /** @class */ (function () {
        function BindingScope(bindingLevel, parent, globals) {
            var e_3, _a;
            if (bindingLevel === void 0) { bindingLevel = 0; }
            if (parent === void 0) { parent = null; }
            this.bindingLevel = bindingLevel;
            this.parent = parent;
            this.globals = globals;
            /** Keeps a map from local variables to their BindingData. */
            this.map = new Map();
            this.referenceNameIndex = 0;
            this.restoreViewVariable = null;
            if (globals !== undefined) {
                try {
                    for (var globals_1 = tslib_1.__values(globals), globals_1_1 = globals_1.next(); !globals_1_1.done; globals_1_1 = globals_1.next()) {
                        var name_2 = globals_1_1.value;
                        this.set(0, name_2, o.variable(name_2));
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (globals_1_1 && !globals_1_1.done && (_a = globals_1.return)) _a.call(globals_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
        }
        BindingScope.createRootScope = function () {
            return new BindingScope();
        };
        BindingScope.prototype.get = function (name) {
            var current = this;
            while (current) {
                var value = current.map.get(name);
                if (value != null) {
                    if (current !== this) {
                        // make a local copy and reset the `declare` state
                        value = {
                            retrievalLevel: value.retrievalLevel,
                            lhs: value.lhs,
                            declareLocalCallback: value.declareLocalCallback,
                            declare: false,
                            priority: value.priority,
                            localRef: value.localRef
                        };
                        // Cache the value locally.
                        this.map.set(name, value);
                        // Possibly generate a shared context var
                        this.maybeGenerateSharedContextVar(value);
                        this.maybeRestoreView(value.retrievalLevel, value.localRef);
                    }
                    if (value.declareLocalCallback && !value.declare) {
                        value.declare = true;
                    }
                    return value.lhs;
                }
                current = current.parent;
            }
            // If we get to this point, we are looking for a property on the top level component
            // - If level === 0, we are on the top and don't need to re-declare `ctx`.
            // - If level > 0, we are in an embedded view. We need to retrieve the name of the
            // local var we used to store the component context, e.g. const $comp$ = x();
            return this.bindingLevel === 0 ? null : this.getComponentProperty(name);
        };
        /**
         * Create a local variable for later reference.
         *
         * @param retrievalLevel The level from which this value can be retrieved
         * @param name Name of the variable.
         * @param lhs AST representing the left hand side of the `let lhs = rhs;`.
         * @param priority The sorting priority of this var
         * @param declareLocalCallback The callback to invoke when declaring this local var
         * @param localRef Whether or not this is a local ref
         */
        BindingScope.prototype.set = function (retrievalLevel, name, lhs, priority, declareLocalCallback, localRef) {
            if (priority === void 0) { priority = 0 /* DEFAULT */; }
            if (this.map.has(name)) {
                if (localRef) {
                    // Do not throw an error if it's a local ref and do not update existing value,
                    // so the first defined ref is always returned.
                    return this;
                }
                util_1.error("The name " + name + " is already defined in scope to be " + this.map.get(name));
            }
            this.map.set(name, {
                retrievalLevel: retrievalLevel,
                lhs: lhs,
                declare: false,
                declareLocalCallback: declareLocalCallback,
                priority: priority,
                localRef: localRef || false
            });
            return this;
        };
        // Implemented as part of LocalResolver.
        BindingScope.prototype.getLocal = function (name) {
            return this.get(name);
        };
        // Implemented as part of LocalResolver.
        BindingScope.prototype.notifyImplicitReceiverUse = function () {
            if (this.bindingLevel !== 0) {
                // Since the implicit receiver is accessed in an embedded view, we need to
                // ensure that we declare a shared context variable for the current template
                // in the update variables.
                this.map.get(SHARED_CONTEXT_KEY + 0).declare = true;
            }
        };
        BindingScope.prototype.nestedScope = function (level, globals) {
            var newScope = new BindingScope(level, this, globals);
            if (level > 0)
                newScope.generateSharedContextVar(0);
            return newScope;
        };
        /**
         * Gets or creates a shared context variable and returns its expression. Note that
         * this does not mean that the shared variable will be declared. Variables in the
         * binding scope will be only declared if they are used.
         */
        BindingScope.prototype.getOrCreateSharedContextVar = function (retrievalLevel) {
            var bindingKey = SHARED_CONTEXT_KEY + retrievalLevel;
            if (!this.map.has(bindingKey)) {
                this.generateSharedContextVar(retrievalLevel);
            }
            // Shared context variables are always generated as "ReadVarExpr".
            return this.map.get(bindingKey).lhs;
        };
        BindingScope.prototype.getSharedContextName = function (retrievalLevel) {
            var sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + retrievalLevel);
            // Shared context variables are always generated as "ReadVarExpr".
            return sharedCtxObj && sharedCtxObj.declare ? sharedCtxObj.lhs : null;
        };
        BindingScope.prototype.maybeGenerateSharedContextVar = function (value) {
            if (value.priority === 1 /* CONTEXT */ &&
                value.retrievalLevel < this.bindingLevel) {
                var sharedCtxObj = this.map.get(SHARED_CONTEXT_KEY + value.retrievalLevel);
                if (sharedCtxObj) {
                    sharedCtxObj.declare = true;
                }
                else {
                    this.generateSharedContextVar(value.retrievalLevel);
                }
            }
        };
        BindingScope.prototype.generateSharedContextVar = function (retrievalLevel) {
            var lhs = o.variable(util_4.CONTEXT_NAME + this.freshReferenceName());
            this.map.set(SHARED_CONTEXT_KEY + retrievalLevel, {
                retrievalLevel: retrievalLevel,
                lhs: lhs,
                declareLocalCallback: function (scope, relativeLevel) {
                    // const ctx_r0 = nextContext(2);
                    return [lhs.set(generateNextContextExpr(relativeLevel)).toConstDecl()];
                },
                declare: false,
                priority: 2 /* SHARED_CONTEXT */,
                localRef: false
            });
        };
        BindingScope.prototype.getComponentProperty = function (name) {
            var componentValue = this.map.get(SHARED_CONTEXT_KEY + 0);
            componentValue.declare = true;
            this.maybeRestoreView(0, false);
            return componentValue.lhs.prop(name);
        };
        BindingScope.prototype.maybeRestoreView = function (retrievalLevel, localRefLookup) {
            // We want to restore the current view in listener fns if:
            // 1 - we are accessing a value in a parent view, which requires walking the view tree rather
            // than using the ctx arg. In this case, the retrieval and binding level will be different.
            // 2 - we are looking up a local ref, which requires restoring the view where the local
            // ref is stored
            if (this.isListenerScope() && (retrievalLevel < this.bindingLevel || localRefLookup)) {
                if (!this.parent.restoreViewVariable) {
                    // parent saves variable to generate a shared `const $s$ = getCurrentView();` instruction
                    this.parent.restoreViewVariable = o.variable(this.parent.freshReferenceName());
                }
                this.restoreViewVariable = this.parent.restoreViewVariable;
            }
        };
        BindingScope.prototype.restoreViewStatement = function () {
            // restoreView($state$);
            return this.restoreViewVariable ?
                [instruction(null, r3_identifiers_1.Identifiers.restoreView, [this.restoreViewVariable]).toStmt()] :
                [];
        };
        BindingScope.prototype.viewSnapshotStatements = function () {
            // const $state$ = getCurrentView();
            var getCurrentViewInstruction = instruction(null, r3_identifiers_1.Identifiers.getCurrentView, []);
            return this.restoreViewVariable ?
                [this.restoreViewVariable.set(getCurrentViewInstruction).toConstDecl()] :
                [];
        };
        BindingScope.prototype.isListenerScope = function () {
            return this.parent && this.parent.bindingLevel === this.bindingLevel;
        };
        BindingScope.prototype.variableDeclarations = function () {
            var _this = this;
            var currentContextLevel = 0;
            return Array.from(this.map.values())
                .filter(function (value) { return value.declare; })
                .sort(function (a, b) { return b.retrievalLevel - a.retrievalLevel || b.priority - a.priority; })
                .reduce(function (stmts, value) {
                var levelDiff = _this.bindingLevel - value.retrievalLevel;
                var currStmts = value.declareLocalCallback(_this, levelDiff - currentContextLevel);
                currentContextLevel = levelDiff;
                return stmts.concat(currStmts);
            }, []);
        };
        BindingScope.prototype.freshReferenceName = function () {
            var current = this;
            // Find the top scope as it maintains the global reference count
            while (current.parent)
                current = current.parent;
            var ref = "" + util_4.REFERENCE_PREFIX + current.referenceNameIndex++;
            return ref;
        };
        return BindingScope;
    }());
    exports.BindingScope = BindingScope;
    /**
     * Creates a `CssSelector` given a tag name and a map of attributes
     */
    function createCssSelector(elementName, attributes) {
        var cssSelector = new selector_1.CssSelector();
        var elementNameNoNs = tags_1.splitNsName(elementName)[1];
        cssSelector.setElement(elementNameNoNs);
        Object.getOwnPropertyNames(attributes).forEach(function (name) {
            var nameNoNs = tags_1.splitNsName(name)[1];
            var value = attributes[name];
            cssSelector.addAttribute(nameNoNs, value);
            if (name.toLowerCase() === 'class') {
                var classes = value.trim().split(/\s+/);
                classes.forEach(function (className) { return cssSelector.addClassName(className); });
            }
        });
        return cssSelector;
    }
    exports.createCssSelector = createCssSelector;
    /**
     * Creates an array of expressions out of an `ngProjectAs` attributes
     * which can be added to the instruction parameters.
     */
    function getNgProjectAsLiteral(attribute) {
        // Parse the attribute value into a CssSelectorList. Note that we only take the
        // first selector, because we don't support multiple selectors in ngProjectAs.
        var parsedR3Selector = core.parseSelectorToR3Selector(attribute.value)[0];
        return [o.literal(5 /* ProjectAs */), util_4.asLiteral(parsedR3Selector)];
    }
    /**
     * Gets the instruction to generate for an interpolated property
     * @param interpolation An Interpolation AST
     */
    function getPropertyInterpolationExpression(interpolation) {
        switch (util_4.getInterpolationArgsLength(interpolation)) {
            case 1:
                return r3_identifiers_1.Identifiers.propertyInterpolate;
            case 3:
                return r3_identifiers_1.Identifiers.propertyInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.propertyInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.propertyInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.propertyInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.propertyInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.propertyInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.propertyInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.propertyInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.propertyInterpolateV;
        }
    }
    /**
     * Gets the instruction to generate for an interpolated attribute
     * @param interpolation An Interpolation AST
     */
    function getAttributeInterpolationExpression(interpolation) {
        switch (util_4.getInterpolationArgsLength(interpolation)) {
            case 3:
                return r3_identifiers_1.Identifiers.attributeInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.attributeInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.attributeInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.attributeInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.attributeInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.attributeInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.attributeInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.attributeInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.attributeInterpolateV;
        }
    }
    /**
     * Gets the instruction to generate for interpolated text.
     * @param interpolation An Interpolation AST
     */
    function getTextInterpolationExpression(interpolation) {
        switch (util_4.getInterpolationArgsLength(interpolation)) {
            case 1:
                return r3_identifiers_1.Identifiers.textInterpolate;
            case 3:
                return r3_identifiers_1.Identifiers.textInterpolate1;
            case 5:
                return r3_identifiers_1.Identifiers.textInterpolate2;
            case 7:
                return r3_identifiers_1.Identifiers.textInterpolate3;
            case 9:
                return r3_identifiers_1.Identifiers.textInterpolate4;
            case 11:
                return r3_identifiers_1.Identifiers.textInterpolate5;
            case 13:
                return r3_identifiers_1.Identifiers.textInterpolate6;
            case 15:
                return r3_identifiers_1.Identifiers.textInterpolate7;
            case 17:
                return r3_identifiers_1.Identifiers.textInterpolate8;
            default:
                return r3_identifiers_1.Identifiers.textInterpolateV;
        }
    }
    /**
     * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
     *
     * @param template text of the template to parse
     * @param templateUrl URL to use for source mapping of the parsed template
     * @param options options to modify how the template is parsed
     */
    function parseTemplate(template, templateUrl, options) {
        if (options === void 0) { options = {}; }
        var interpolationConfig = options.interpolationConfig, preserveWhitespaces = options.preserveWhitespaces, enableI18nLegacyMessageIdFormat = options.enableI18nLegacyMessageIdFormat;
        var bindingParser = makeBindingParser(interpolationConfig);
        var htmlParser = new html_parser_1.HtmlParser();
        var parseResult = htmlParser.parse(template, templateUrl, tslib_1.__assign(tslib_1.__assign({ leadingTriviaChars: exports.LEADING_TRIVIA_CHARS }, options), { tokenizeExpansionForms: true }));
        if (parseResult.errors && parseResult.errors.length > 0) {
            // TODO(ayazhafiz): we may not always want to bail out at this point (e.g. in
            // the context of a language service).
            return {
                interpolationConfig: interpolationConfig,
                preserveWhitespaces: preserveWhitespaces,
                template: template,
                errors: parseResult.errors,
                nodes: [],
                styleUrls: [],
                styles: [],
                ngContentSelectors: []
            };
        }
        var rootNodes = parseResult.rootNodes;
        // process i18n meta information (scan attributes, generate ids)
        // before we run whitespace removal process, because existing i18n
        // extraction process (ng extract-i18n) relies on a raw content to generate
        // message ids
        var i18nMetaVisitor = new meta_1.I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ !preserveWhitespaces, enableI18nLegacyMessageIdFormat);
        rootNodes = html.visitAll(i18nMetaVisitor, rootNodes);
        if (!preserveWhitespaces) {
            rootNodes = html.visitAll(new html_whitespaces_1.WhitespaceVisitor(), rootNodes);
            // run i18n meta visitor again in case whitespaces are removed (because that might affect
            // generated i18n message content) and first pass indicated that i18n content is present in a
            // template. During this pass i18n IDs generated at the first pass will be preserved, so we can
            // mimic existing extraction process (ng extract-i18n)
            if (i18nMetaVisitor.hasI18nMeta) {
                rootNodes = html.visitAll(new meta_1.I18nMetaVisitor(interpolationConfig, /* keepI18nAttrs */ false), rootNodes);
            }
        }
        var _a = r3_template_transform_1.htmlAstToRender3Ast(rootNodes, bindingParser), nodes = _a.nodes, errors = _a.errors, styleUrls = _a.styleUrls, styles = _a.styles, ngContentSelectors = _a.ngContentSelectors;
        return {
            interpolationConfig: interpolationConfig,
            preserveWhitespaces: preserveWhitespaces,
            errors: errors.length > 0 ? errors : null,
            template: template,
            nodes: nodes,
            styleUrls: styleUrls,
            styles: styles,
            ngContentSelectors: ngContentSelectors
        };
    }
    exports.parseTemplate = parseTemplate;
    var elementRegistry = new dom_element_schema_registry_1.DomElementSchemaRegistry();
    /**
     * Construct a `BindingParser` with a default configuration.
     */
    function makeBindingParser(interpolationConfig) {
        if (interpolationConfig === void 0) { interpolationConfig = interpolation_config_1.DEFAULT_INTERPOLATION_CONFIG; }
        return new binding_parser_1.BindingParser(new parser_1.IvyParser(new lexer_1.Lexer()), interpolationConfig, elementRegistry, null, []);
    }
    exports.makeBindingParser = makeBindingParser;
    function resolveSanitizationFn(context, isAttribute) {
        switch (context) {
            case core.SecurityContext.HTML:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeHtml);
            case core.SecurityContext.SCRIPT:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeScript);
            case core.SecurityContext.STYLE:
                // the compiler does not fill in an instruction for [style.prop?] binding
                // values because the style algorithm knows internally what props are subject
                // to sanitization (only [attr.style] values are explicitly sanitized)
                return isAttribute ? o.importExpr(r3_identifiers_1.Identifiers.sanitizeStyle) : null;
            case core.SecurityContext.URL:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeUrl);
            case core.SecurityContext.RESOURCE_URL:
                return o.importExpr(r3_identifiers_1.Identifiers.sanitizeResourceUrl);
            default:
                return null;
        }
    }
    exports.resolveSanitizationFn = resolveSanitizationFn;
    function trustedConstAttribute(tagName, attr) {
        var value = util_4.asLiteral(attr.value);
        switch (elementRegistry.securityContext(tagName, attr.name, /* isAttribute */ true)) {
            case core.SecurityContext.HTML:
                return o.importExpr(r3_identifiers_1.Identifiers.trustConstantHtml).callFn([value], attr.valueSpan);
            case core.SecurityContext.SCRIPT:
                return o.importExpr(r3_identifiers_1.Identifiers.trustConstantScript).callFn([value], attr.valueSpan);
            case core.SecurityContext.RESOURCE_URL:
                return o.importExpr(r3_identifiers_1.Identifiers.trustConstantResourceUrl).callFn([value], attr.valueSpan);
            default:
                return value;
        }
    }
    function isSingleElementTemplate(children) {
        return children.length === 1 && children[0] instanceof t.Element;
    }
    function isTextNode(node) {
        return node instanceof t.Text || node instanceof t.BoundText || node instanceof t.Icu;
    }
    function hasTextChildrenOnly(children) {
        return children.every(isTextNode);
    }
    /** Name of the global variable that is used to determine if we use Closure translations or not */
    var NG_I18N_CLOSURE_MODE = 'ngI18nClosureMode';
    /**
     * Generate statements that define a given translation message.
     *
     * ```
     * var I18N_1;
     * if (typeof ngI18nClosureMode !== undefined && ngI18nClosureMode) {
     *     var MSG_EXTERNAL_XXX = goog.getMsg(
     *          "Some message with {$interpolation}!",
     *          { "interpolation": "\uFFFD0\uFFFD" }
     *     );
     *     I18N_1 = MSG_EXTERNAL_XXX;
     * }
     * else {
     *     I18N_1 = $localize`Some message with ${'\uFFFD0\uFFFD'}!`;
     * }
     * ```
     *
     * @param message The original i18n AST message node
     * @param variable The variable that will be assigned the translation, e.g. `I18N_1`.
     * @param closureVar The variable for Closure `goog.getMsg` calls, e.g. `MSG_EXTERNAL_XXX`.
     * @param params Object mapping placeholder names to their values (e.g.
     * `{ "interpolation": "\uFFFD0\uFFFD" }`).
     * @param transformFn Optional transformation function that will be applied to the translation (e.g.
     * post-processing).
     * @returns An array of statements that defined a given translation.
     */
    function getTranslationDeclStmts(message, variable, closureVar, params, transformFn) {
        if (params === void 0) { params = {}; }
        var statements = [
            util_3.declareI18nVariable(variable),
            o.ifStmt(createClosureModeGuard(), get_msg_utils_1.createGoogleGetMsgStatements(variable, message, closureVar, util_3.i18nFormatPlaceholderNames(params, /* useCamelCase */ true)), localize_utils_1.createLocalizeStatements(variable, message, util_3.i18nFormatPlaceholderNames(params, /* useCamelCase */ false))),
        ];
        if (transformFn) {
            statements.push(new o.ExpressionStatement(variable.set(transformFn(variable))));
        }
        return statements;
    }
    exports.getTranslationDeclStmts = getTranslationDeclStmts;
    /**
     * Create the expression that will be used to guard the closure mode block
     * It is equivalent to:
     *
     * ```
     * typeof ngI18nClosureMode !== undefined && ngI18nClosureMode
     * ```
     */
    function createClosureModeGuard() {
        return o.typeofExpr(o.variable(NG_I18N_CLOSURE_MODE))
            .notIdentical(o.literal('undefined', o.STRING_TYPE))
            .and(o.variable(NG_I18N_CLOSURE_MODE));
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvcmVuZGVyMy92aWV3L3RlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwyRUFBbUU7SUFDbkUsaUdBQStLO0lBRS9LLGlEQUFtQztJQUNuQyxtRUFBaVA7SUFDalAsdUVBQW9EO0lBQ3BELHlFQUF5RDtJQUV6RCwwREFBNEM7SUFDNUMsMkVBQXVEO0lBQ3ZELHFGQUFtRTtJQUNuRSw2RkFBdUc7SUFFdkcsNkRBQXNGO0lBQ3RGLGtFQUFpRDtJQUNqRCwyREFBNkM7SUFFN0Msd0dBQWtGO0lBQ2xGLDJEQUE0RDtJQUM1RCx1RkFBbUU7SUFDbkUsbURBQWlEO0lBQ2pELHdEQUErQjtJQUMvQiwrRUFBb0Q7SUFDcEQsNkZBQTZEO0lBQzdELDJEQUF5SDtJQUV6SCwyRUFBMkM7SUFDM0MsdUZBQWtFO0lBQ2xFLHlGQUErRDtJQUMvRCxxRUFBNEM7SUFDNUMscUVBQTZUO0lBQzdULHNGQUFxRTtJQUNyRSxnRUFBNk87SUFJN08sNENBQTRDO0lBQzVDLElBQU0sc0JBQXNCLEdBQUcsUUFBUSxDQUFDO0lBRXhDLG1DQUFtQztJQUNuQyxJQUFNLHVCQUF1QixHQUFHLGFBQWEsQ0FBQztJQUU5Qyx1REFBdUQ7SUFDdkQsSUFBTSwyQkFBMkIsR0FBRyxJQUFJLEdBQUcsQ0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFFaEUsdURBQXVEO0lBQ3ZELElBQU0sdUJBQXVCLEdBQUcsSUFBSSxHQUFHLENBQ25DLENBQUMsQ0FBQyxRQUFRLEVBQUUsNEJBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSw0QkFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLDRCQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FB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QW9CLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtmbGF0dGVuLCBzYW5pdGl6ZUlkZW50aWZpZXJ9IGZyb20gJy4uLy4uL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0IHtCaW5kaW5nRm9ybSwgQnVpbHRpbkZ1bmN0aW9uQ2FsbCwgY29udmVydEFjdGlvbkJpbmRpbmcsIGNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcsIGNvbnZlcnRVcGRhdGVBcmd1bWVudHMsIExvY2FsUmVzb2x2ZXJ9IGZyb20gJy4uLy4uL2NvbXBpbGVyX3V0aWwvZXhwcmVzc2lvbl9jb252ZXJ0ZXInO1xuaW1wb3J0IHtDb25zdGFudFBvb2x9IGZyb20gJy4uLy4uL2NvbnN0YW50X3Bvb2wnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7QVNULCBBc3RNZW1vcnlFZmZpY2llbnRUcmFuc2Zvcm1lciwgQmluZGluZ1BpcGUsIEJpbmRpbmdUeXBlLCBGdW5jdGlvbkNhbGwsIEltcGxpY2l0UmVjZWl2ZXIsIEludGVycG9sYXRpb24sIExpdGVyYWxBcnJheSwgTGl0ZXJhbE1hcCwgTGl0ZXJhbFByaW1pdGl2ZSwgUGFyc2VkRXZlbnRUeXBlLCBQcm9wZXJ0eVJlYWQsIFRoaXNSZWNlaXZlcn0gZnJvbSAnLi4vLi4vZXhwcmVzc2lvbl9wYXJzZXIvYXN0JztcbmltcG9ydCB7TGV4ZXJ9IGZyb20gJy4uLy4uL2V4cHJlc3Npb25fcGFyc2VyL2xleGVyJztcbmltcG9ydCB7SXZ5UGFyc2VyfSBmcm9tICcuLi8uLi9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuLi8uLi9pMThuL2kxOG5fYXN0JztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge0h0bWxQYXJzZXJ9IGZyb20gJy4uLy4uL21sX3BhcnNlci9odG1sX3BhcnNlcic7XG5pbXBvcnQge1doaXRlc3BhY2VWaXNpdG9yfSBmcm9tICcuLi8uLi9tbF9wYXJzZXIvaHRtbF93aGl0ZXNwYWNlcyc7XG5pbXBvcnQge0RFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcsIEludGVycG9sYXRpb25Db25maWd9IGZyb20gJy4uLy4uL21sX3BhcnNlci9pbnRlcnBvbGF0aW9uX2NvbmZpZyc7XG5pbXBvcnQge0xleGVyUmFuZ2V9IGZyb20gJy4uLy4uL21sX3BhcnNlci9sZXhlcic7XG5pbXBvcnQge2lzTmdDb250YWluZXIgYXMgY2hlY2tJc05nQ29udGFpbmVyLCBzcGxpdE5zTmFtZX0gZnJvbSAnLi4vLi4vbWxfcGFyc2VyL3RhZ3MnO1xuaW1wb3J0IHttYXBMaXRlcmFsfSBmcm9tICcuLi8uLi9vdXRwdXQvbWFwX3V0aWwnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi8uLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge1BhcnNlRXJyb3IsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0RvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi4vLi4vc2NoZW1hL2RvbV9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5pbXBvcnQge0Nzc1NlbGVjdG9yLCBTZWxlY3Rvck1hdGNoZXJ9IGZyb20gJy4uLy4uL3NlbGVjdG9yJztcbmltcG9ydCB7QmluZGluZ1BhcnNlcn0gZnJvbSAnLi4vLi4vdGVtcGxhdGVfcGFyc2VyL2JpbmRpbmdfcGFyc2VyJztcbmltcG9ydCB7ZXJyb3IsIHBhcnRpdGlvbkFycmF5fSBmcm9tICcuLi8uLi91dGlsJztcbmltcG9ydCAqIGFzIHQgZnJvbSAnLi4vcjNfYXN0JztcbmltcG9ydCB7SWRlbnRpZmllcnMgYXMgUjN9IGZyb20gJy4uL3IzX2lkZW50aWZpZXJzJztcbmltcG9ydCB7aHRtbEFzdFRvUmVuZGVyM0FzdH0gZnJvbSAnLi4vcjNfdGVtcGxhdGVfdHJhbnNmb3JtJztcbmltcG9ydCB7cHJlcGFyZVN5bnRoZXRpY0xpc3RlbmVyRnVuY3Rpb25OYW1lLCBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJOYW1lLCBwcmVwYXJlU3ludGhldGljUHJvcGVydHlOYW1lfSBmcm9tICcuLi91dGlsJztcblxuaW1wb3J0IHtJMThuQ29udGV4dH0gZnJvbSAnLi9pMThuL2NvbnRleHQnO1xuaW1wb3J0IHtjcmVhdGVHb29nbGVHZXRNc2dTdGF0ZW1lbnRzfSBmcm9tICcuL2kxOG4vZ2V0X21zZ191dGlscyc7XG5pbXBvcnQge2NyZWF0ZUxvY2FsaXplU3RhdGVtZW50c30gZnJvbSAnLi9pMThuL2xvY2FsaXplX3V0aWxzJztcbmltcG9ydCB7STE4bk1ldGFWaXNpdG9yfSBmcm9tICcuL2kxOG4vbWV0YSc7XG5pbXBvcnQge2Fzc2VtYmxlQm91bmRUZXh0UGxhY2Vob2xkZXJzLCBhc3NlbWJsZUkxOG5Cb3VuZFN0cmluZywgZGVjbGFyZUkxOG5WYXJpYWJsZSwgZ2V0VHJhbnNsYXRpb25Db25zdFByZWZpeCwgaGFzSTE4bk1ldGEsIEkxOE5fSUNVX01BUFBJTkdfUFJFRklYLCBpMThuRm9ybWF0UGxhY2Vob2xkZXJOYW1lcywgaWN1RnJvbUkxOG5NZXNzYWdlLCBpc0kxOG5Sb290Tm9kZSwgaXNTaW5nbGVJMThuSWN1LCBwbGFjZWhvbGRlcnNUb1BhcmFtcywgVFJBTlNMQVRJT05fVkFSX1BSRUZJWCwgd3JhcEkxOG5QbGFjZWhvbGRlcn0gZnJvbSAnLi9pMThuL3V0aWwnO1xuaW1wb3J0IHtTdHlsaW5nQnVpbGRlciwgU3R5bGluZ0luc3RydWN0aW9ufSBmcm9tICcuL3N0eWxpbmdfYnVpbGRlcic7XG5pbXBvcnQge2FzTGl0ZXJhbCwgY2hhaW5lZEluc3RydWN0aW9uLCBDT05URVhUX05BTUUsIGdldEF0dHJzRm9yRGlyZWN0aXZlTWF0Y2hpbmcsIGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoLCBJTVBMSUNJVF9SRUZFUkVOQ0UsIGludmFsaWQsIE5PTl9CSU5EQUJMRV9BVFRSLCBSRUZFUkVOQ0VfUFJFRklYLCBSRU5ERVJfRkxBR1MsIHRyaW1UcmFpbGluZ051bGxzLCB1bnN1cHBvcnRlZH0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8vIFNlbGVjdG9yIGF0dHJpYnV0ZSBuYW1lIG9mIGA8bmctY29udGVudD5gXG5jb25zdCBOR19DT05URU5UX1NFTEVDVF9BVFRSID0gJ3NlbGVjdCc7XG5cbi8vIEF0dHJpYnV0ZSBuYW1lIG9mIGBuZ1Byb2plY3RBc2AuXG5jb25zdCBOR19QUk9KRUNUX0FTX0FUVFJfTkFNRSA9ICduZ1Byb2plY3RBcyc7XG5cbi8vIEdsb2JhbCBzeW1ib2xzIGF2YWlsYWJsZSBvbmx5IGluc2lkZSBldmVudCBiaW5kaW5ncy5cbmNvbnN0IEVWRU5UX0JJTkRJTkdfU0NPUEVfR0xPQkFMUyA9IG5ldyBTZXQ8c3RyaW5nPihbJyRldmVudCddKTtcblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgZ2xvYmFsIHRhcmdldHMgZm9yIGV2ZW50IGxpc3RlbmVyc1xuY29uc3QgR0xPQkFMX1RBUkdFVF9SRVNPTFZFUlMgPSBuZXcgTWFwPHN0cmluZywgby5FeHRlcm5hbFJlZmVyZW5jZT4oXG4gICAgW1snd2luZG93JywgUjMucmVzb2x2ZVdpbmRvd10sIFsnZG9jdW1lbnQnLCBSMy5yZXNvbHZlRG9jdW1lbnRdLCBbJ2JvZHknLCBSMy5yZXNvbHZlQm9keV1dKTtcblxuZXhwb3J0IGNvbnN0IExFQURJTkdfVFJJVklBX0NIQVJTID0gWycgJywgJ1xcbicsICdcXHInLCAnXFx0J107XG5cbi8vICBpZiAocmYgJiBmbGFncykgeyAuLiB9XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyRmxhZ0NoZWNrSWZTdG10KFxuICAgIGZsYWdzOiBjb3JlLlJlbmRlckZsYWdzLCBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKTogby5JZlN0bXQge1xuICByZXR1cm4gby5pZlN0bXQoby52YXJpYWJsZShSRU5ERVJfRkxBR1MpLmJpdHdpc2VBbmQoby5saXRlcmFsKGZsYWdzKSwgbnVsbCwgZmFsc2UpLCBzdGF0ZW1lbnRzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXBhcmVFdmVudExpc3RlbmVyUGFyYW1ldGVycyhcbiAgICBldmVudEFzdDogdC5Cb3VuZEV2ZW50LCBoYW5kbGVyTmFtZTogc3RyaW5nfG51bGwgPSBudWxsLFxuICAgIHNjb3BlOiBCaW5kaW5nU2NvcGV8bnVsbCA9IG51bGwpOiBvLkV4cHJlc3Npb25bXSB7XG4gIGNvbnN0IHt0eXBlLCBuYW1lLCB0YXJnZXQsIHBoYXNlLCBoYW5kbGVyfSA9IGV2ZW50QXN0O1xuICBpZiAodGFyZ2V0ICYmICFHTE9CQUxfVEFSR0VUX1JFU09MVkVSUy5oYXModGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCBnbG9iYWwgdGFyZ2V0ICcke3RhcmdldH0nIGRlZmluZWQgZm9yICcke25hbWV9JyBldmVudC5cbiAgICAgICAgU3VwcG9ydGVkIGxpc3Qgb2YgZ2xvYmFsIHRhcmdldHM6ICR7QXJyYXkuZnJvbShHTE9CQUxfVEFSR0VUX1JFU09MVkVSUy5rZXlzKCkpfS5gKTtcbiAgfVxuXG4gIGNvbnN0IGV2ZW50QXJndW1lbnROYW1lID0gJyRldmVudCc7XG4gIGNvbnN0IGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3NlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCBpbXBsaWNpdFJlY2VpdmVyRXhwciA9IChzY29wZSA9PT0gbnVsbCB8fCBzY29wZS5iaW5kaW5nTGV2ZWwgPT09IDApID9cbiAgICAgIG8udmFyaWFibGUoQ09OVEVYVF9OQU1FKSA6XG4gICAgICBzY29wZS5nZXRPckNyZWF0ZVNoYXJlZENvbnRleHRWYXIoMCk7XG4gIGNvbnN0IGJpbmRpbmdFeHByID0gY29udmVydEFjdGlvbkJpbmRpbmcoXG4gICAgICBzY29wZSwgaW1wbGljaXRSZWNlaXZlckV4cHIsIGhhbmRsZXIsICdiJywgKCkgPT4gZXJyb3IoJ1VuZXhwZWN0ZWQgaW50ZXJwb2xhdGlvbicpLFxuICAgICAgZXZlbnRBc3QuaGFuZGxlclNwYW4sIGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3NlcywgRVZFTlRfQklORElOR19TQ09QRV9HTE9CQUxTKTtcbiAgY29uc3Qgc3RhdGVtZW50cyA9IFtdO1xuICBpZiAoc2NvcGUpIHtcbiAgICBzdGF0ZW1lbnRzLnB1c2goLi4uc2NvcGUucmVzdG9yZVZpZXdTdGF0ZW1lbnQoKSk7XG4gICAgc3RhdGVtZW50cy5wdXNoKC4uLnNjb3BlLnZhcmlhYmxlRGVjbGFyYXRpb25zKCkpO1xuICB9XG4gIHN0YXRlbWVudHMucHVzaCguLi5iaW5kaW5nRXhwci5yZW5kZXIzU3RtdHMpO1xuXG4gIGNvbnN0IGV2ZW50TmFtZTogc3RyaW5nID1cbiAgICAgIHR5cGUgPT09IFBhcnNlZEV2ZW50VHlwZS5BbmltYXRpb24gPyBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJOYW1lKG5hbWUsIHBoYXNlISkgOiBuYW1lO1xuICBjb25zdCBmbk5hbWUgPSBoYW5kbGVyTmFtZSAmJiBzYW5pdGl6ZUlkZW50aWZpZXIoaGFuZGxlck5hbWUpO1xuICBjb25zdCBmbkFyZ3M6IG8uRm5QYXJhbVtdID0gW107XG5cbiAgaWYgKGltcGxpY2l0UmVjZWl2ZXJBY2Nlc3Nlcy5oYXMoZXZlbnRBcmd1bWVudE5hbWUpKSB7XG4gICAgZm5BcmdzLnB1c2gobmV3IG8uRm5QYXJhbShldmVudEFyZ3VtZW50TmFtZSwgby5EWU5BTUlDX1RZUEUpKTtcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZXJGbiA9IG8uZm4oZm5BcmdzLCBzdGF0ZW1lbnRzLCBvLklORkVSUkVEX1RZUEUsIG51bGwsIGZuTmFtZSk7XG4gIGNvbnN0IHBhcmFtczogby5FeHByZXNzaW9uW10gPSBbby5saXRlcmFsKGV2ZW50TmFtZSksIGhhbmRsZXJGbl07XG4gIGlmICh0YXJnZXQpIHtcbiAgICBwYXJhbXMucHVzaChcbiAgICAgICAgby5saXRlcmFsKGZhbHNlKSwgIC8vIGB1c2VDYXB0dXJlYCBmbGFnLCBkZWZhdWx0cyB0byBgZmFsc2VgXG4gICAgICAgIG8uaW1wb3J0RXhwcihHTE9CQUxfVEFSR0VUX1JFU09MVkVSUy5nZXQodGFyZ2V0KSEpKTtcbiAgfVxuICByZXR1cm4gcGFyYW1zO1xufVxuXG4vLyBDb2xsZWN0cyBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gZ2VuZXJhdGUgYGNvbnN0c2AgZmllbGQgb2YgdGhlIENvbXBvbmVudERlZi5cbi8vIFdoZW4gYSBjb25zdGFudCByZXF1aXJlcyBzb21lIHByZS1wcm9jZXNzaW5nLCB0aGUgYHByZXBhcmVTdGF0ZW1lbnRzYCBzZWN0aW9uXG4vLyBjb250YWlucyBjb3JyZXNwb25kaW5nIHN0YXRlbWVudHMuXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudERlZkNvbnN0cyB7XG4gIHByZXBhcmVTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdO1xuICBjb25zdEV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50RGVmQ29uc3RzKCk6IENvbXBvbmVudERlZkNvbnN0cyB7XG4gIHJldHVybiB7cHJlcGFyZVN0YXRlbWVudHM6IFtdLCBjb25zdEV4cHJlc3Npb25zOiBbXX07XG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZURlZmluaXRpb25CdWlsZGVyIGltcGxlbWVudHMgdC5WaXNpdG9yPHZvaWQ+LCBMb2NhbFJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfZGF0YUluZGV4ID0gMDtcbiAgcHJpdmF0ZSBfYmluZGluZ0NvbnRleHQgPSAwO1xuICBwcml2YXRlIF9wcmVmaXhDb2RlOiBvLlN0YXRlbWVudFtdID0gW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBnZW5lcmF0ZSBjcmVhdGlvbiBtb2RlIGluc3RydWN0aW9ucy4gV2Ugc3RvcmUgdGhlbSBoZXJlIGFzIHdlIHByb2Nlc3NcbiAgICogdGhlIHRlbXBsYXRlIHNvIGJpbmRpbmdzIGluIGxpc3RlbmVycyBhcmUgcmVzb2x2ZWQgb25seSBvbmNlIGFsbCBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC5cbiAgICogVGhpcyBlbnN1cmVzIGFsbCBsb2NhbCByZWZzIGFuZCBjb250ZXh0IHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGZvciBtYXRjaGluZy5cbiAgICovXG4gIHByaXZhdGUgX2NyZWF0aW9uQ29kZUZuczogKCgpID0+IG8uU3RhdGVtZW50KVtdID0gW107XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNhbGxiYWNrcyB0byBnZW5lcmF0ZSB1cGRhdGUgbW9kZSBpbnN0cnVjdGlvbnMuIFdlIHN0b3JlIHRoZW0gaGVyZSBhcyB3ZSBwcm9jZXNzXG4gICAqIHRoZSB0ZW1wbGF0ZSBzbyBiaW5kaW5ncyBhcmUgcmVzb2x2ZWQgb25seSBvbmNlIGFsbCBub2RlcyBoYXZlIGJlZW4gdmlzaXRlZC4gVGhpcyBlbnN1cmVzXG4gICAqIGFsbCBsb2NhbCByZWZzIGFuZCBjb250ZXh0IHZhcmlhYmxlcyBhcmUgYXZhaWxhYmxlIGZvciBtYXRjaGluZy5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZUNvZGVGbnM6ICgoKSA9PiBvLlN0YXRlbWVudClbXSA9IFtdO1xuXG4gIC8qKiBJbmRleCBvZiB0aGUgY3VycmVudGx5LXNlbGVjdGVkIG5vZGUuICovXG4gIHByaXZhdGUgX2N1cnJlbnRJbmRleDogbnVtYmVyID0gMDtcblxuICAvKiogVGVtcG9yYXJ5IHZhcmlhYmxlIGRlY2xhcmF0aW9ucyBnZW5lcmF0ZWQgZnJvbSB2aXNpdGluZyBwaXBlcywgbGl0ZXJhbHMsIGV0Yy4gKi9cbiAgcHJpdmF0ZSBfdGVtcFZhcmlhYmxlczogby5TdGF0ZW1lbnRbXSA9IFtdO1xuICAvKipcbiAgICogTGlzdCBvZiBjYWxsYmFja3MgdG8gYnVpbGQgbmVzdGVkIHRlbXBsYXRlcy4gTmVzdGVkIHRlbXBsYXRlcyBtdXN0IG5vdCBiZSB2aXNpdGVkIHVudGlsXG4gICAqIGFmdGVyIHRoZSBwYXJlbnQgdGVtcGxhdGUgaGFzIGZpbmlzaGVkIHZpc2l0aW5nIGFsbCBvZiBpdHMgbm9kZXMuIFRoaXMgZW5zdXJlcyB0aGF0IGFsbFxuICAgKiBsb2NhbCByZWYgYmluZGluZ3MgaW4gbmVzdGVkIHRlbXBsYXRlcyBhcmUgYWJsZSB0byBmaW5kIGxvY2FsIHJlZiB2YWx1ZXMgaWYgdGhlIHJlZnNcbiAgICogYXJlIGRlZmluZWQgYWZ0ZXIgdGhlIHRlbXBsYXRlIGRlY2xhcmF0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBfbmVzdGVkVGVtcGxhdGVGbnM6ICgoKSA9PiB2b2lkKVtdID0gW107XG4gIC8qKlxuICAgKiBUaGlzIHNjb3BlIGNvbnRhaW5zIGxvY2FsIHZhcmlhYmxlcyBkZWNsYXJlZCBpbiB0aGUgdXBkYXRlIG1vZGUgYmxvY2sgb2YgdGhlIHRlbXBsYXRlLlxuICAgKiAoZS5nLiByZWZzIGFuZCBjb250ZXh0IHZhcnMgaW4gYmluZGluZ3MpXG4gICAqL1xuICBwcml2YXRlIF9iaW5kaW5nU2NvcGU6IEJpbmRpbmdTY29wZTtcbiAgcHJpdmF0ZSBfdmFsdWVDb252ZXJ0ZXI6IFZhbHVlQ29udmVydGVyO1xuICBwcml2YXRlIF91bnN1cHBvcnRlZCA9IHVuc3VwcG9ydGVkO1xuXG4gIC8vIGkxOG4gY29udGV4dCBsb2NhbCB0byB0aGlzIHRlbXBsYXRlXG4gIHByaXZhdGUgaTE4bjogSTE4bkNvbnRleHR8bnVsbCA9IG51bGw7XG5cbiAgLy8gTnVtYmVyIG9mIHNsb3RzIHRvIHJlc2VydmUgZm9yIHB1cmVGdW5jdGlvbnNcbiAgcHJpdmF0ZSBfcHVyZUZ1bmN0aW9uU2xvdHMgPSAwO1xuXG4gIC8vIE51bWJlciBvZiBiaW5kaW5nIHNsb3RzXG4gIHByaXZhdGUgX2JpbmRpbmdTbG90cyA9IDA7XG5cbiAgcHJpdmF0ZSBmaWxlQmFzZWRJMThuU3VmZml4OiBzdHJpbmc7XG5cbiAgLy8gUHJvamVjdGlvbiBzbG90cyBmb3VuZCBpbiB0aGUgdGVtcGxhdGUuIFByb2plY3Rpb24gc2xvdHMgY2FuIGRpc3RyaWJ1dGUgcHJvamVjdGVkXG4gIC8vIG5vZGVzIGJhc2VkIG9uIGEgc2VsZWN0b3IsIG9yIGNhbiBqdXN0IHVzZSB0aGUgd2lsZGNhcmQgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgLy8gYWxsIG5vZGVzIHdoaWNoIGFyZW4ndCBtYXRjaGluZyBhbnkgc2VsZWN0b3IuXG4gIHByaXZhdGUgX25nQ29udGVudFJlc2VydmVkU2xvdHM6IChzdHJpbmd8JyonKVtdID0gW107XG5cbiAgLy8gTnVtYmVyIG9mIG5vbi1kZWZhdWx0IHNlbGVjdG9ycyBmb3VuZCBpbiBhbGwgcGFyZW50IHRlbXBsYXRlcyBvZiB0aGlzIHRlbXBsYXRlLiBXZSBuZWVkIHRvXG4gIC8vIHRyYWNrIGl0IHRvIHByb3Blcmx5IGFkanVzdCBwcm9qZWN0aW9uIHNsb3QgaW5kZXggaW4gdGhlIGBwcm9qZWN0aW9uYCBpbnN0cnVjdGlvbi5cbiAgcHJpdmF0ZSBfbmdDb250ZW50U2VsZWN0b3JzT2Zmc2V0ID0gMDtcblxuICAvLyBFeHByZXNzaW9uIHRoYXQgc2hvdWxkIGJlIHVzZWQgYXMgaW1wbGljaXQgcmVjZWl2ZXIgd2hlbiBjb252ZXJ0aW5nIHRlbXBsYXRlXG4gIC8vIGV4cHJlc3Npb25zIHRvIG91dHB1dCBBU1QuXG4gIHByaXZhdGUgX2ltcGxpY2l0UmVjZWl2ZXJFeHByOiBvLlJlYWRWYXJFeHByfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgcGFyZW50QmluZGluZ1Njb3BlOiBCaW5kaW5nU2NvcGUsIHByaXZhdGUgbGV2ZWwgPSAwLFxuICAgICAgcHJpdmF0ZSBjb250ZXh0TmFtZTogc3RyaW5nfG51bGwsIHByaXZhdGUgaTE4bkNvbnRleHQ6IEkxOG5Db250ZXh0fG51bGwsXG4gICAgICBwcml2YXRlIHRlbXBsYXRlSW5kZXg6IG51bWJlcnxudWxsLCBwcml2YXRlIHRlbXBsYXRlTmFtZTogc3RyaW5nfG51bGwsXG4gICAgICBwcml2YXRlIGRpcmVjdGl2ZU1hdGNoZXI6IFNlbGVjdG9yTWF0Y2hlcnxudWxsLCBwcml2YXRlIGRpcmVjdGl2ZXM6IFNldDxvLkV4cHJlc3Npb24+LFxuICAgICAgcHJpdmF0ZSBwaXBlVHlwZUJ5TmFtZTogTWFwPHN0cmluZywgby5FeHByZXNzaW9uPiwgcHJpdmF0ZSBwaXBlczogU2V0PG8uRXhwcmVzc2lvbj4sXG4gICAgICBwcml2YXRlIF9uYW1lc3BhY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsIHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIGkxOG5Vc2VFeHRlcm5hbElkczogYm9vbGVhbixcbiAgICAgIHByaXZhdGUgX2NvbnN0YW50czogQ29tcG9uZW50RGVmQ29uc3RzID0gY3JlYXRlQ29tcG9uZW50RGVmQ29uc3RzKCkpIHtcbiAgICB0aGlzLl9iaW5kaW5nU2NvcGUgPSBwYXJlbnRCaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUobGV2ZWwpO1xuXG4gICAgLy8gVHVybiB0aGUgcmVsYXRpdmUgY29udGV4dCBmaWxlIHBhdGggaW50byBhbiBpZGVudGlmaWVyIGJ5IHJlcGxhY2luZyBub24tYWxwaGFudW1lcmljXG4gICAgLy8gY2hhcmFjdGVycyB3aXRoIHVuZGVyc2NvcmVzLlxuICAgIHRoaXMuZmlsZUJhc2VkSTE4blN1ZmZpeCA9IHJlbGF0aXZlQ29udGV4dEZpbGVQYXRoLnJlcGxhY2UoL1teQS1aYS16MC05XS9nLCAnXycpICsgJ18nO1xuXG4gICAgdGhpcy5fdmFsdWVDb252ZXJ0ZXIgPSBuZXcgVmFsdWVDb252ZXJ0ZXIoXG4gICAgICAgIGNvbnN0YW50UG9vbCwgKCkgPT4gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCksXG4gICAgICAgIChudW1TbG90czogbnVtYmVyKSA9PiB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMobnVtU2xvdHMpLFxuICAgICAgICAobmFtZSwgbG9jYWxOYW1lLCBzbG90LCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGlwZVR5cGUgPSBwaXBlVHlwZUJ5TmFtZS5nZXQobmFtZSk7XG4gICAgICAgICAgaWYgKHBpcGVUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnBpcGVzLmFkZChwaXBlVHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuX2JpbmRpbmdTY29wZS5zZXQodGhpcy5sZXZlbCwgbG9jYWxOYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKG51bGwsIFIzLnBpcGUsIFtvLmxpdGVyYWwoc2xvdCksIG8ubGl0ZXJhbChuYW1lKV0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGJ1aWxkVGVtcGxhdGVGdW5jdGlvbihcbiAgICAgIG5vZGVzOiB0Lk5vZGVbXSwgdmFyaWFibGVzOiB0LlZhcmlhYmxlW10sIG5nQ29udGVudFNlbGVjdG9yc09mZnNldDogbnVtYmVyID0gMCxcbiAgICAgIGkxOG4/OiBpMThuLkkxOG5NZXRhKTogby5GdW5jdGlvbkV4cHIge1xuICAgIHRoaXMuX25nQ29udGVudFNlbGVjdG9yc09mZnNldCA9IG5nQ29udGVudFNlbGVjdG9yc09mZnNldDtcblxuICAgIGlmICh0aGlzLl9uYW1lc3BhY2UgIT09IFIzLm5hbWVzcGFjZUhUTUwpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihudWxsLCB0aGlzLl9uYW1lc3BhY2UpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB2YXJpYWJsZSBiaW5kaW5nc1xuICAgIHZhcmlhYmxlcy5mb3JFYWNoKHYgPT4gdGhpcy5yZWdpc3RlckNvbnRleHRWYXJpYWJsZXModikpO1xuXG4gICAgLy8gSW5pdGlhdGUgaTE4biBjb250ZXh0IGluIGNhc2U6XG4gICAgLy8gLSB0aGlzIHRlbXBsYXRlIGhhcyBwYXJlbnQgaTE4biBjb250ZXh0XG4gICAgLy8gLSBvciB0aGUgdGVtcGxhdGUgaGFzIGkxOG4gbWV0YSBhc3NvY2lhdGVkIHdpdGggaXQsXG4gICAgLy8gICBidXQgaXQncyBub3QgaW5pdGlhdGVkIGJ5IHRoZSBFbGVtZW50IChlLmcuIDxuZy10ZW1wbGF0ZSBpMThuPilcbiAgICBjb25zdCBpbml0STE4bkNvbnRleHQgPSB0aGlzLmkxOG5Db250ZXh0IHx8XG4gICAgICAgIChpc0kxOG5Sb290Tm9kZShpMThuKSAmJiAhaXNTaW5nbGVJMThuSWN1KGkxOG4pICYmXG4gICAgICAgICAhKGlzU2luZ2xlRWxlbWVudFRlbXBsYXRlKG5vZGVzKSAmJiBub2Rlc1swXS5pMThuID09PSBpMThuKSk7XG4gICAgY29uc3Qgc2VsZkNsb3NpbmdJMThuSW5zdHJ1Y3Rpb24gPSBoYXNUZXh0Q2hpbGRyZW5Pbmx5KG5vZGVzKTtcbiAgICBpZiAoaW5pdEkxOG5Db250ZXh0KSB7XG4gICAgICB0aGlzLmkxOG5TdGFydChudWxsLCBpMThuISwgc2VsZkNsb3NpbmdJMThuSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRoaXMgaXMgdGhlIGluaXRpYWwgcGFzcyB0aHJvdWdoIHRoZSBub2RlcyBvZiB0aGlzIHRlbXBsYXRlLiBJbiB0aGlzIHBhc3MsIHdlXG4gICAgLy8gcXVldWUgYWxsIGNyZWF0aW9uIG1vZGUgYW5kIHVwZGF0ZSBtb2RlIGluc3RydWN0aW9ucyBmb3IgZ2VuZXJhdGlvbiBpbiB0aGUgc2Vjb25kXG4gICAgLy8gcGFzcy4gSXQncyBuZWNlc3NhcnkgdG8gc2VwYXJhdGUgdGhlIHBhc3NlcyB0byBlbnN1cmUgbG9jYWwgcmVmcyBhcmUgZGVmaW5lZCBiZWZvcmVcbiAgICAvLyByZXNvbHZpbmcgYmluZGluZ3MuIFdlIGFsc28gY291bnQgYmluZGluZ3MgaW4gdGhpcyBwYXNzIGFzIHdlIHdhbGsgYm91bmQgZXhwcmVzc2lvbnMuXG4gICAgdC52aXNpdEFsbCh0aGlzLCBub2Rlcyk7XG5cbiAgICAvLyBBZGQgdG90YWwgYmluZGluZyBjb3VudCB0byBwdXJlIGZ1bmN0aW9uIGNvdW50IHNvIHB1cmUgZnVuY3Rpb24gaW5zdHJ1Y3Rpb25zIGFyZVxuICAgIC8vIGdlbmVyYXRlZCB3aXRoIHRoZSBjb3JyZWN0IHNsb3Qgb2Zmc2V0IHdoZW4gdXBkYXRlIGluc3RydWN0aW9ucyBhcmUgcHJvY2Vzc2VkLlxuICAgIHRoaXMuX3B1cmVGdW5jdGlvblNsb3RzICs9IHRoaXMuX2JpbmRpbmdTbG90cztcblxuICAgIC8vIFBpcGVzIGFyZSB3YWxrZWQgaW4gdGhlIGZpcnN0IHBhc3MgKHRvIGVucXVldWUgYHBpcGUoKWAgY3JlYXRpb24gaW5zdHJ1Y3Rpb25zIGFuZFxuICAgIC8vIGBwaXBlQmluZGAgdXBkYXRlIGluc3RydWN0aW9ucyksIHNvIHdlIGhhdmUgdG8gdXBkYXRlIHRoZSBzbG90IG9mZnNldHMgbWFudWFsbHlcbiAgICAvLyB0byBhY2NvdW50IGZvciBiaW5kaW5ncy5cbiAgICB0aGlzLl92YWx1ZUNvbnZlcnRlci51cGRhdGVQaXBlU2xvdE9mZnNldHModGhpcy5fYmluZGluZ1Nsb3RzKTtcblxuICAgIC8vIE5lc3RlZCB0ZW1wbGF0ZXMgbXVzdCBiZSBwcm9jZXNzZWQgYmVmb3JlIGNyZWF0aW9uIGluc3RydWN0aW9ucyBzbyB0ZW1wbGF0ZSgpXG4gICAgLy8gaW5zdHJ1Y3Rpb25zIGNhbiBiZSBnZW5lcmF0ZWQgd2l0aCB0aGUgY29ycmVjdCBpbnRlcm5hbCBjb25zdCBjb3VudC5cbiAgICB0aGlzLl9uZXN0ZWRUZW1wbGF0ZUZucy5mb3JFYWNoKGJ1aWxkVGVtcGxhdGVGbiA9PiBidWlsZFRlbXBsYXRlRm4oKSk7XG5cbiAgICAvLyBPdXRwdXQgdGhlIGBwcm9qZWN0aW9uRGVmYCBpbnN0cnVjdGlvbiB3aGVuIHNvbWUgYDxuZy1jb250ZW50PmAgdGFncyBhcmUgcHJlc2VudC5cbiAgICAvLyBUaGUgYHByb2plY3Rpb25EZWZgIGluc3RydWN0aW9uIGlzIG9ubHkgZW1pdHRlZCBmb3IgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSBhbmRcbiAgICAvLyBpcyBza2lwcGVkIGZvciBuZXN0ZWQgdGVtcGxhdGVzICg8bmctdGVtcGxhdGU+IHRhZ3MpLlxuICAgIGlmICh0aGlzLmxldmVsID09PSAwICYmIHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwYXJhbWV0ZXJzOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuXG4gICAgICAvLyBCeSBkZWZhdWx0IHRoZSBgcHJvamVjdGlvbkRlZmAgaW5zdHJ1Y3Rpb25zIGNyZWF0ZXMgb25lIHNsb3QgZm9yIHRoZSB3aWxkY2FyZFxuICAgICAgLy8gc2VsZWN0b3IgaWYgbm8gcGFyYW1ldGVycyBhcmUgcGFzc2VkLiBUaGVyZWZvcmUgd2Ugb25seSB3YW50IHRvIGFsbG9jYXRlIGEgbmV3XG4gICAgICAvLyBhcnJheSBmb3IgdGhlIHByb2plY3Rpb24gc2xvdHMgaWYgdGhlIGRlZmF1bHQgcHJvamVjdGlvbiBzbG90IGlzIG5vdCBzdWZmaWNpZW50LlxuICAgICAgaWYgKHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMubGVuZ3RoID4gMSB8fCB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzWzBdICE9PSAnKicpIHtcbiAgICAgICAgY29uc3QgcjNSZXNlcnZlZFNsb3RzID0gdGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5tYXAoXG4gICAgICAgICAgICBzID0+IHMgIT09ICcqJyA/IGNvcmUucGFyc2VTZWxlY3RvclRvUjNTZWxlY3RvcihzKSA6IHMpO1xuICAgICAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGFzTGl0ZXJhbChyM1Jlc2VydmVkU2xvdHMpLCB0cnVlKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNpbmNlIHdlIGFjY3VtdWxhdGUgbmdDb250ZW50IHNlbGVjdG9ycyB3aGlsZSBwcm9jZXNzaW5nIHRlbXBsYXRlIGVsZW1lbnRzLFxuICAgICAgLy8gd2UgKnByZXBlbmQqIGBwcm9qZWN0aW9uRGVmYCB0byBjcmVhdGlvbiBpbnN0cnVjdGlvbnMgYmxvY2ssIHRvIHB1dCBpdCBiZWZvcmVcbiAgICAgIC8vIGFueSBgcHJvamVjdGlvbmAgaW5zdHJ1Y3Rpb25zXG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24obnVsbCwgUjMucHJvamVjdGlvbkRlZiwgcGFyYW1ldGVycywgLyogcHJlcGVuZCAqLyB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoaW5pdEkxOG5Db250ZXh0KSB7XG4gICAgICB0aGlzLmkxOG5FbmQobnVsbCwgc2VsZkNsb3NpbmdJMThuSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGFsbCB0aGUgY3JlYXRpb24gbW9kZSBpbnN0cnVjdGlvbnMgKGUuZy4gcmVzb2x2ZSBiaW5kaW5ncyBpbiBsaXN0ZW5lcnMpXG4gICAgY29uc3QgY3JlYXRpb25TdGF0ZW1lbnRzID0gdGhpcy5fY3JlYXRpb25Db2RlRm5zLm1hcCgoZm46ICgpID0+IG8uU3RhdGVtZW50KSA9PiBmbigpKTtcblxuICAgIC8vIEdlbmVyYXRlIGFsbCB0aGUgdXBkYXRlIG1vZGUgaW5zdHJ1Y3Rpb25zIChlLmcuIHJlc29sdmUgcHJvcGVydHkgb3IgdGV4dCBiaW5kaW5ncylcbiAgICBjb25zdCB1cGRhdGVTdGF0ZW1lbnRzID0gdGhpcy5fdXBkYXRlQ29kZUZucy5tYXAoKGZuOiAoKSA9PiBvLlN0YXRlbWVudCkgPT4gZm4oKSk7XG5cbiAgICAvLyAgVmFyaWFibGUgZGVjbGFyYXRpb24gbXVzdCBvY2N1ciBhZnRlciBiaW5kaW5nIHJlc29sdXRpb24gc28gd2UgY2FuIGdlbmVyYXRlIGNvbnRleHRcbiAgICAvLyAgaW5zdHJ1Y3Rpb25zIHRoYXQgYnVpbGQgb24gZWFjaCBvdGhlci5cbiAgICAvLyBlLmcuIGNvbnN0IGIgPSBuZXh0Q29udGV4dCgpLiRpbXBsaWNpdCgpOyBjb25zdCBiID0gbmV4dENvbnRleHQoKTtcbiAgICBjb25zdCBjcmVhdGlvblZhcmlhYmxlcyA9IHRoaXMuX2JpbmRpbmdTY29wZS52aWV3U25hcHNob3RTdGF0ZW1lbnRzKCk7XG4gICAgY29uc3QgdXBkYXRlVmFyaWFibGVzID0gdGhpcy5fYmluZGluZ1Njb3BlLnZhcmlhYmxlRGVjbGFyYXRpb25zKCkuY29uY2F0KHRoaXMuX3RlbXBWYXJpYWJsZXMpO1xuXG4gICAgY29uc3QgY3JlYXRpb25CbG9jayA9IGNyZWF0aW9uU3RhdGVtZW50cy5sZW5ndGggPiAwID9cbiAgICAgICAgW3JlbmRlckZsYWdDaGVja0lmU3RtdChcbiAgICAgICAgICAgIGNvcmUuUmVuZGVyRmxhZ3MuQ3JlYXRlLCBjcmVhdGlvblZhcmlhYmxlcy5jb25jYXQoY3JlYXRpb25TdGF0ZW1lbnRzKSldIDpcbiAgICAgICAgW107XG5cbiAgICBjb25zdCB1cGRhdGVCbG9jayA9IHVwZGF0ZVN0YXRlbWVudHMubGVuZ3RoID4gMCA/XG4gICAgICAgIFtyZW5kZXJGbGFnQ2hlY2tJZlN0bXQoY29yZS5SZW5kZXJGbGFncy5VcGRhdGUsIHVwZGF0ZVZhcmlhYmxlcy5jb25jYXQodXBkYXRlU3RhdGVtZW50cykpXSA6XG4gICAgICAgIFtdO1xuXG4gICAgcmV0dXJuIG8uZm4oXG4gICAgICAgIC8vIGkuZS4gKHJmOiBSZW5kZXJGbGFncywgY3R4OiBhbnkpXG4gICAgICAgIFtuZXcgby5GblBhcmFtKFJFTkRFUl9GTEFHUywgby5OVU1CRVJfVFlQRSksIG5ldyBvLkZuUGFyYW0oQ09OVEVYVF9OQU1FLCBudWxsKV0sXG4gICAgICAgIFtcbiAgICAgICAgICAvLyBUZW1wb3JhcnkgdmFyaWFibGUgZGVjbGFyYXRpb25zIGZvciBxdWVyeSByZWZyZXNoIChpLmUuIGxldCBfdDogYW55OylcbiAgICAgICAgICAuLi50aGlzLl9wcmVmaXhDb2RlLFxuICAgICAgICAgIC8vIENyZWF0aW5nIG1vZGUgKGkuZS4gaWYgKHJmICYgUmVuZGVyRmxhZ3MuQ3JlYXRlKSB7IC4uLiB9KVxuICAgICAgICAgIC4uLmNyZWF0aW9uQmxvY2ssXG4gICAgICAgICAgLy8gQmluZGluZyBhbmQgcmVmcmVzaCBtb2RlIChpLmUuIGlmIChyZiAmIFJlbmRlckZsYWdzLlVwZGF0ZSkgey4uLn0pXG4gICAgICAgICAgLi4udXBkYXRlQmxvY2ssXG4gICAgICAgIF0sXG4gICAgICAgIG8uSU5GRVJSRURfVFlQRSwgbnVsbCwgdGhpcy50ZW1wbGF0ZU5hbWUpO1xuICB9XG5cbiAgLy8gTG9jYWxSZXNvbHZlclxuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2JpbmRpbmdTY29wZS5nZXQobmFtZSk7XG4gIH1cblxuICAvLyBMb2NhbFJlc29sdmVyXG4gIG5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fYmluZGluZ1Njb3BlLm5vdGlmeUltcGxpY2l0UmVjZWl2ZXJVc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgaTE4blRyYW5zbGF0ZShcbiAgICAgIG1lc3NhZ2U6IGkxOG4uTWVzc2FnZSwgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPSB7fSwgcmVmPzogby5SZWFkVmFyRXhwcixcbiAgICAgIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uKTogby5SZWFkVmFyRXhwciB7XG4gICAgY29uc3QgX3JlZiA9IHJlZiB8fCB0aGlzLmkxOG5HZW5lcmF0ZU1haW5CbG9ja1ZhcigpO1xuICAgIC8vIENsb3N1cmUgQ29tcGlsZXIgcmVxdWlyZXMgY29uc3QgbmFtZXMgdG8gc3RhcnQgd2l0aCBgTVNHX2AgYnV0IGRpc2FsbG93cyBhbnkgb3RoZXIgY29uc3QgdG9cbiAgICAvLyBzdGFydCB3aXRoIGBNU0dfYC4gV2UgZGVmaW5lIGEgdmFyaWFibGUgc3RhcnRpbmcgd2l0aCBgTVNHX2AganVzdCBmb3IgdGhlIGBnb29nLmdldE1zZ2AgY2FsbFxuICAgIGNvbnN0IGNsb3N1cmVWYXIgPSB0aGlzLmkxOG5HZW5lcmF0ZUNsb3N1cmVWYXIobWVzc2FnZS5pZCk7XG4gICAgY29uc3Qgc3RhdGVtZW50cyA9IGdldFRyYW5zbGF0aW9uRGVjbFN0bXRzKG1lc3NhZ2UsIF9yZWYsIGNsb3N1cmVWYXIsIHBhcmFtcywgdHJhbnNmb3JtRm4pO1xuICAgIHRoaXMuX2NvbnN0YW50cy5wcmVwYXJlU3RhdGVtZW50cy5wdXNoKC4uLnN0YXRlbWVudHMpO1xuICAgIHJldHVybiBfcmVmO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlckNvbnRleHRWYXJpYWJsZXModmFyaWFibGU6IHQuVmFyaWFibGUpIHtcbiAgICBjb25zdCBzY29wZWROYW1lID0gdGhpcy5fYmluZGluZ1Njb3BlLmZyZXNoUmVmZXJlbmNlTmFtZSgpO1xuICAgIGNvbnN0IHJldHJpZXZhbExldmVsID0gdGhpcy5sZXZlbDtcbiAgICBjb25zdCBsaHMgPSBvLnZhcmlhYmxlKHZhcmlhYmxlLm5hbWUgKyBzY29wZWROYW1lKTtcbiAgICB0aGlzLl9iaW5kaW5nU2NvcGUuc2V0KFxuICAgICAgICByZXRyaWV2YWxMZXZlbCwgdmFyaWFibGUubmFtZSwgbGhzLCBEZWNsYXJhdGlvblByaW9yaXR5LkNPTlRFWFQsXG4gICAgICAgIChzY29wZTogQmluZGluZ1Njb3BlLCByZWxhdGl2ZUxldmVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgICBsZXQgcmhzOiBvLkV4cHJlc3Npb247XG4gICAgICAgICAgaWYgKHNjb3BlLmJpbmRpbmdMZXZlbCA9PT0gcmV0cmlldmFsTGV2ZWwpIHtcbiAgICAgICAgICAgIC8vIGUuZy4gY3R4XG4gICAgICAgICAgICByaHMgPSBvLnZhcmlhYmxlKENPTlRFWFRfTkFNRSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXJlZEN0eFZhciA9IHNjb3BlLmdldFNoYXJlZENvbnRleHROYW1lKHJldHJpZXZhbExldmVsKTtcbiAgICAgICAgICAgIC8vIGUuZy4gY3R4X3IwICAgT1IgIHgoMik7XG4gICAgICAgICAgICByaHMgPSBzaGFyZWRDdHhWYXIgPyBzaGFyZWRDdHhWYXIgOiBnZW5lcmF0ZU5leHRDb250ZXh0RXhwcihyZWxhdGl2ZUxldmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZS5nLiBjb25zdCAkaXRlbSQgPSB4KDIpLiRpbXBsaWNpdDtcbiAgICAgICAgICByZXR1cm4gW2xocy5zZXQocmhzLnByb3AodmFyaWFibGUudmFsdWUgfHwgSU1QTElDSVRfUkVGRVJFTkNFKSkudG9Db25zdERlY2woKV07XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpMThuQXBwZW5kQmluZGluZ3MoZXhwcmVzc2lvbnM6IEFTVFtdKSB7XG4gICAgaWYgKGV4cHJlc3Npb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGV4cHJlc3Npb25zLmZvckVhY2goZXhwcmVzc2lvbiA9PiB0aGlzLmkxOG4hLmFwcGVuZEJpbmRpbmcoZXhwcmVzc2lvbikpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaTE4bkJpbmRQcm9wcyhwcm9wczoge1trZXk6IHN0cmluZ106IHQuVGV4dHx0LkJvdW5kVGV4dH0pOiB7W2tleTogc3RyaW5nXTogby5FeHByZXNzaW9ufSB7XG4gICAgY29uc3QgYm91bmQ6IHtba2V5OiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gICAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1trZXldO1xuICAgICAgaWYgKHByb3AgaW5zdGFuY2VvZiB0LlRleHQpIHtcbiAgICAgICAgYm91bmRba2V5XSA9IG8ubGl0ZXJhbChwcm9wLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcHJvcC52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgY29uc3Qge3N0cmluZ3MsIGV4cHJlc3Npb25zfSA9IHZhbHVlO1xuICAgICAgICAgIGNvbnN0IHtpZCwgYmluZGluZ3N9ID0gdGhpcy5pMThuITtcbiAgICAgICAgICBjb25zdCBsYWJlbCA9IGFzc2VtYmxlSTE4bkJvdW5kU3RyaW5nKHN0cmluZ3MsIGJpbmRpbmdzLnNpemUsIGlkKTtcbiAgICAgICAgICB0aGlzLmkxOG5BcHBlbmRCaW5kaW5ncyhleHByZXNzaW9ucyk7XG4gICAgICAgICAgYm91bmRba2V5XSA9IG8ubGl0ZXJhbChsYWJlbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH1cblxuICAvLyBHZW5lcmF0ZXMgdG9wIGxldmVsIHZhcnMgZm9yIGkxOG4gYmxvY2tzIChpLmUuIGBpMThuX05gKS5cbiAgcHJpdmF0ZSBpMThuR2VuZXJhdGVNYWluQmxvY2tWYXIoKTogby5SZWFkVmFyRXhwciB7XG4gICAgcmV0dXJuIG8udmFyaWFibGUodGhpcy5jb25zdGFudFBvb2wudW5pcXVlTmFtZShUUkFOU0xBVElPTl9WQVJfUFJFRklYKSk7XG4gIH1cblxuICAvLyBHZW5lcmF0ZXMgdmFycyB3aXRoIENsb3N1cmUtc3BlY2lmaWMgbmFtZXMgZm9yIGkxOG4gYmxvY2tzIChpLmUuIGBNU0dfWFhYYCkuXG4gIHByaXZhdGUgaTE4bkdlbmVyYXRlQ2xvc3VyZVZhcihtZXNzYWdlSWQ6IHN0cmluZyk6IG8uUmVhZFZhckV4cHIge1xuICAgIGxldCBuYW1lOiBzdHJpbmc7XG4gICAgY29uc3Qgc3VmZml4ID0gdGhpcy5maWxlQmFzZWRJMThuU3VmZml4LnRvVXBwZXJDYXNlKCk7XG4gICAgaWYgKHRoaXMuaTE4blVzZUV4dGVybmFsSWRzKSB7XG4gICAgICBjb25zdCBwcmVmaXggPSBnZXRUcmFuc2xhdGlvbkNvbnN0UHJlZml4KGBFWFRFUk5BTF9gKTtcbiAgICAgIGNvbnN0IHVuaXF1ZVN1ZmZpeCA9IHRoaXMuY29uc3RhbnRQb29sLnVuaXF1ZU5hbWUoc3VmZml4KTtcbiAgICAgIG5hbWUgPSBgJHtwcmVmaXh9JHtzYW5pdGl6ZUlkZW50aWZpZXIobWVzc2FnZUlkKX0kJCR7dW5pcXVlU3VmZml4fWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZWZpeCA9IGdldFRyYW5zbGF0aW9uQ29uc3RQcmVmaXgoc3VmZml4KTtcbiAgICAgIG5hbWUgPSB0aGlzLmNvbnN0YW50UG9vbC51bmlxdWVOYW1lKHByZWZpeCk7XG4gICAgfVxuICAgIHJldHVybiBvLnZhcmlhYmxlKG5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBpMThuVXBkYXRlUmVmKGNvbnRleHQ6IEkxOG5Db250ZXh0KTogdm9pZCB7XG4gICAgY29uc3Qge2ljdXMsIG1ldGEsIGlzUm9vdCwgaXNSZXNvbHZlZCwgaXNFbWl0dGVkfSA9IGNvbnRleHQ7XG4gICAgaWYgKGlzUm9vdCAmJiBpc1Jlc29sdmVkICYmICFpc0VtaXR0ZWQgJiYgIWlzU2luZ2xlSTE4bkljdShtZXRhKSkge1xuICAgICAgY29udGV4dC5pc0VtaXR0ZWQgPSB0cnVlO1xuICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gY29udGV4dC5nZXRTZXJpYWxpemVkUGxhY2Vob2xkZXJzKCk7XG4gICAgICBsZXQgaWN1TWFwcGluZzoge1tuYW1lOiBzdHJpbmddOiBvLkV4cHJlc3Npb259ID0ge307XG4gICAgICBsZXQgcGFyYW1zOiB7W25hbWU6IHN0cmluZ106IG8uRXhwcmVzc2lvbn0gPVxuICAgICAgICAgIHBsYWNlaG9sZGVycy5zaXplID8gcGxhY2Vob2xkZXJzVG9QYXJhbXMocGxhY2Vob2xkZXJzKSA6IHt9O1xuICAgICAgaWYgKGljdXMuc2l6ZSkge1xuICAgICAgICBpY3VzLmZvckVhY2goKHJlZnM6IG8uRXhwcmVzc2lvbltdLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChyZWZzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBvbmUgSUNVIGRlZmluZWQgZm9yIGEgZ2l2ZW5cbiAgICAgICAgICAgIC8vIHBsYWNlaG9sZGVyIC0ganVzdCBvdXRwdXQgaXRzIHJlZmVyZW5jZVxuICAgICAgICAgICAgcGFyYW1zW2tleV0gPSByZWZzWzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAuLi4gb3RoZXJ3aXNlIHdlIG5lZWQgdG8gYWN0aXZhdGUgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICAvLyB0byByZXBsYWNlIElDVSBwbGFjZWhvbGRlcnMgd2l0aCBwcm9wZXIgdmFsdWVzXG4gICAgICAgICAgICBjb25zdCBwbGFjZWhvbGRlcjogc3RyaW5nID0gd3JhcEkxOG5QbGFjZWhvbGRlcihgJHtJMThOX0lDVV9NQVBQSU5HX1BSRUZJWH0ke2tleX1gKTtcbiAgICAgICAgICAgIHBhcmFtc1trZXldID0gby5saXRlcmFsKHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgIGljdU1hcHBpbmdba2V5XSA9IG8ubGl0ZXJhbEFycihyZWZzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyB0cmFuc2xhdGlvbiByZXF1aXJlcyBwb3N0IHByb2Nlc3NpbmcgaW4gMiBjYXNlczpcbiAgICAgIC8vIC0gaWYgd2UgaGF2ZSBwbGFjZWhvbGRlcnMgd2l0aCBtdWx0aXBsZSB2YWx1ZXMgKGV4LiBgU1RBUlRfRElWYDogW++/vSMx77+9LCDvv70jMu+/vSwgLi4uXSlcbiAgICAgIC8vIC0gaWYgd2UgaGF2ZSBtdWx0aXBsZSBJQ1VzIHRoYXQgcmVmZXIgdG8gdGhlIHNhbWUgcGxhY2Vob2xkZXIgbmFtZVxuICAgICAgY29uc3QgbmVlZHNQb3N0cHJvY2Vzc2luZyA9XG4gICAgICAgICAgQXJyYXkuZnJvbShwbGFjZWhvbGRlcnMudmFsdWVzKCkpLnNvbWUoKHZhbHVlOiBzdHJpbmdbXSkgPT4gdmFsdWUubGVuZ3RoID4gMSkgfHxcbiAgICAgICAgICBPYmplY3Qua2V5cyhpY3VNYXBwaW5nKS5sZW5ndGg7XG5cbiAgICAgIGxldCB0cmFuc2Zvcm1GbjtcbiAgICAgIGlmIChuZWVkc1Bvc3Rwcm9jZXNzaW5nKSB7XG4gICAgICAgIHRyYW5zZm9ybUZuID0gKHJhdzogby5SZWFkVmFyRXhwcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGFyZ3M6IG8uRXhwcmVzc2lvbltdID0gW3Jhd107XG4gICAgICAgICAgaWYgKE9iamVjdC5rZXlzKGljdU1hcHBpbmcpLmxlbmd0aCkge1xuICAgICAgICAgICAgYXJncy5wdXNoKG1hcExpdGVyYWwoaWN1TWFwcGluZywgdHJ1ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb24obnVsbCwgUjMuaTE4blBvc3Rwcm9jZXNzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHRoaXMuaTE4blRyYW5zbGF0ZShtZXRhIGFzIGkxOG4uTWVzc2FnZSwgcGFyYW1zLCBjb250ZXh0LnJlZiwgdHJhbnNmb3JtRm4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaTE4blN0YXJ0KHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsID0gbnVsbCwgbWV0YTogaTE4bi5JMThuTWV0YSwgc2VsZkNsb3Npbmc/OiBib29sZWFuKTpcbiAgICAgIHZvaWQge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG4gICAgdGhpcy5pMThuID0gdGhpcy5pMThuQ29udGV4dCA/XG4gICAgICAgIHRoaXMuaTE4bkNvbnRleHQuZm9ya0NoaWxkQ29udGV4dChpbmRleCwgdGhpcy50ZW1wbGF0ZUluZGV4ISwgbWV0YSkgOlxuICAgICAgICBuZXcgSTE4bkNvbnRleHQoaW5kZXgsIHRoaXMuaTE4bkdlbmVyYXRlTWFpbkJsb2NrVmFyKCksIDAsIHRoaXMudGVtcGxhdGVJbmRleCwgbWV0YSk7XG5cbiAgICAvLyBnZW5lcmF0ZSBpMThuU3RhcnQgaW5zdHJ1Y3Rpb25cbiAgICBjb25zdCB7aWQsIHJlZn0gPSB0aGlzLmkxOG47XG4gICAgY29uc3QgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSA9IFtvLmxpdGVyYWwoaW5kZXgpLCB0aGlzLmFkZFRvQ29uc3RzKHJlZildO1xuICAgIGlmIChpZCA+IDApIHtcbiAgICAgIC8vIGRvIG5vdCBwdXNoIDNyZCBhcmd1bWVudCAoc3ViLWJsb2NrIGlkKVxuICAgICAgLy8gaW50byBpMThuU3RhcnQgY2FsbCBmb3IgdG9wIGxldmVsIGkxOG4gY29udGV4dFxuICAgICAgcGFyYW1zLnB1c2goby5saXRlcmFsKGlkKSk7XG4gICAgfVxuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihzcGFuLCBzZWxmQ2xvc2luZyA/IFIzLmkxOG4gOiBSMy5pMThuU3RhcnQsIHBhcmFtcyk7XG4gIH1cblxuICBwcml2YXRlIGkxOG5FbmQoc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwgPSBudWxsLCBzZWxmQ2xvc2luZz86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaTE4bikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpMThuRW5kIGlzIGV4ZWN1dGVkIHdpdGggbm8gaTE4biBjb250ZXh0IHByZXNlbnQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pMThuQ29udGV4dCkge1xuICAgICAgdGhpcy5pMThuQ29udGV4dC5yZWNvbmNpbGVDaGlsZENvbnRleHQodGhpcy5pMThuKTtcbiAgICAgIHRoaXMuaTE4blVwZGF0ZVJlZih0aGlzLmkxOG5Db250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pMThuVXBkYXRlUmVmKHRoaXMuaTE4bik7XG4gICAgfVxuXG4gICAgLy8gc2V0dXAgYWNjdW11bGF0ZWQgYmluZGluZ3NcbiAgICBjb25zdCB7aW5kZXgsIGJpbmRpbmdzfSA9IHRoaXMuaTE4bjtcbiAgICBpZiAoYmluZGluZ3Muc2l6ZSkge1xuICAgICAgY29uc3QgY2hhaW5CaW5kaW5nczogQ2hhaW5hYmxlQmluZGluZ0luc3RydWN0aW9uW10gPSBbXTtcbiAgICAgIGJpbmRpbmdzLmZvckVhY2goYmluZGluZyA9PiB7XG4gICAgICAgIGNoYWluQmluZGluZ3MucHVzaCh7c291cmNlU3Bhbjogc3BhbiwgdmFsdWU6ICgpID0+IHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyhiaW5kaW5nKX0pO1xuICAgICAgfSk7XG4gICAgICAvLyBmb3IgaTE4biBibG9jaywgYWR2YW5jZSB0byB0aGUgbW9zdCByZWNlbnQgZWxlbWVudCBpbmRleCAoYnkgdGFraW5nIHRoZSBjdXJyZW50IG51bWJlciBvZlxuICAgICAgLy8gZWxlbWVudHMgYW5kIHN1YnRyYWN0aW5nIG9uZSkgYmVmb3JlIGludm9raW5nIGBpMThuRXhwYCBpbnN0cnVjdGlvbnMsIHRvIG1ha2Ugc3VyZSB0aGVcbiAgICAgIC8vIG5lY2Vzc2FyeSBsaWZlY3ljbGUgaG9va3Mgb2YgY29tcG9uZW50cy9kaXJlY3RpdmVzIGFyZSBwcm9wZXJseSBmbHVzaGVkLlxuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbkNoYWluV2l0aEFkdmFuY2UodGhpcy5nZXRDb25zdENvdW50KCkgLSAxLCBSMy5pMThuRXhwLCBjaGFpbkJpbmRpbmdzKTtcbiAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb24oc3BhbiwgUjMuaTE4bkFwcGx5LCBbby5saXRlcmFsKGluZGV4KV0pO1xuICAgIH1cbiAgICBpZiAoIXNlbGZDbG9zaW5nKSB7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oc3BhbiwgUjMuaTE4bkVuZCk7XG4gICAgfVxuICAgIHRoaXMuaTE4biA9IG51bGw7ICAvLyByZXNldCBsb2NhbCBpMThuIGNvbnRleHRcbiAgfVxuXG4gIHByaXZhdGUgaTE4bkF0dHJpYnV0ZXNJbnN0cnVjdGlvbihcbiAgICAgIG5vZGVJbmRleDogbnVtYmVyLCBhdHRyczogdC5Cb3VuZEF0dHJpYnV0ZVtdLCBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiB2b2lkIHtcbiAgICBsZXQgaGFzQmluZGluZ3M6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBjb25zdCBpMThuQXR0ckFyZ3M6IG8uRXhwcmVzc2lvbltdID0gW107XG4gICAgY29uc3QgYmluZGluZ3M6IENoYWluYWJsZUJpbmRpbmdJbnN0cnVjdGlvbltdID0gW107XG4gICAgYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBhdHRyLmkxOG4hIGFzIGkxOG4uTWVzc2FnZTtcbiAgICAgIGNvbnN0IGNvbnZlcnRlZCA9IGF0dHIudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyhjb252ZXJ0ZWQpO1xuICAgICAgaWYgKGNvbnZlcnRlZCBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJzID0gYXNzZW1ibGVCb3VuZFRleHRQbGFjZWhvbGRlcnMobWVzc2FnZSk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IHBsYWNlaG9sZGVyc1RvUGFyYW1zKHBsYWNlaG9sZGVycyk7XG4gICAgICAgIGkxOG5BdHRyQXJncy5wdXNoKG8ubGl0ZXJhbChhdHRyLm5hbWUpLCB0aGlzLmkxOG5UcmFuc2xhdGUobWVzc2FnZSwgcGFyYW1zKSk7XG4gICAgICAgIGNvbnZlcnRlZC5leHByZXNzaW9ucy5mb3JFYWNoKGV4cHJlc3Npb24gPT4ge1xuICAgICAgICAgIGhhc0JpbmRpbmdzID0gdHJ1ZTtcbiAgICAgICAgICBiaW5kaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICB2YWx1ZTogKCkgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGV4cHJlc3Npb24pLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoYmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbkNoYWluV2l0aEFkdmFuY2Uobm9kZUluZGV4LCBSMy5pMThuRXhwLCBiaW5kaW5ncyk7XG4gICAgfVxuICAgIGlmIChpMThuQXR0ckFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgaW5kZXg6IG8uRXhwcmVzc2lvbiA9IG8ubGl0ZXJhbCh0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKSk7XG4gICAgICBjb25zdCBjb25zdEluZGV4ID0gdGhpcy5hZGRUb0NvbnN0cyhvLmxpdGVyYWxBcnIoaTE4bkF0dHJBcmdzKSk7XG4gICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oc291cmNlU3BhbiwgUjMuaTE4bkF0dHJpYnV0ZXMsIFtpbmRleCwgY29uc3RJbmRleF0pO1xuICAgICAgaWYgKGhhc0JpbmRpbmdzKSB7XG4gICAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb24oc291cmNlU3BhbiwgUjMuaTE4bkFwcGx5LCBbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldE5hbWVzcGFjZUluc3RydWN0aW9uKG5hbWVzcGFjZUtleTogc3RyaW5nfG51bGwpIHtcbiAgICBzd2l0Y2ggKG5hbWVzcGFjZUtleSkge1xuICAgICAgY2FzZSAnbWF0aCc6XG4gICAgICAgIHJldHVybiBSMy5uYW1lc3BhY2VNYXRoTUw7XG4gICAgICBjYXNlICdzdmcnOlxuICAgICAgICByZXR1cm4gUjMubmFtZXNwYWNlU1ZHO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFIzLm5hbWVzcGFjZUhUTUw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGROYW1lc3BhY2VJbnN0cnVjdGlvbihuc0luc3RydWN0aW9uOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBlbGVtZW50OiB0LkVsZW1lbnQpIHtcbiAgICB0aGlzLl9uYW1lc3BhY2UgPSBuc0luc3RydWN0aW9uO1xuICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihlbGVtZW50LnN0YXJ0U291cmNlU3BhbiwgbnNJbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiB1cGRhdGUgaW5zdHJ1Y3Rpb24gZm9yIGFuIGludGVycG9sYXRlZCBwcm9wZXJ0eSBvciBhdHRyaWJ1dGUsIHN1Y2ggYXNcbiAgICogYHByb3A9XCJ7e3ZhbHVlfX1cImAgb3IgYGF0dHIudGl0bGU9XCJ7e3ZhbHVlfX1cImBcbiAgICovXG4gIHByaXZhdGUgaW50ZXJwb2xhdGVkVXBkYXRlSW5zdHJ1Y3Rpb24oXG4gICAgICBpbnN0cnVjdGlvbjogby5FeHRlcm5hbFJlZmVyZW5jZSwgZWxlbWVudEluZGV4OiBudW1iZXIsIGF0dHJOYW1lOiBzdHJpbmcsXG4gICAgICBpbnB1dDogdC5Cb3VuZEF0dHJpYnV0ZSwgdmFsdWU6IGFueSwgcGFyYW1zOiBhbnlbXSkge1xuICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25XaXRoQWR2YW5jZShcbiAgICAgICAgZWxlbWVudEluZGV4LCBpbnB1dC5zb3VyY2VTcGFuLCBpbnN0cnVjdGlvbixcbiAgICAgICAgKCkgPT4gW28ubGl0ZXJhbChhdHRyTmFtZSksIC4uLnRoaXMuZ2V0VXBkYXRlSW5zdHJ1Y3Rpb25Bcmd1bWVudHModmFsdWUpLCAuLi5wYXJhbXNdKTtcbiAgfVxuXG4gIHZpc2l0Q29udGVudChuZ0NvbnRlbnQ6IHQuQ29udGVudCkge1xuICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICBjb25zdCBwcm9qZWN0aW9uU2xvdElkeCA9IHRoaXMuX25nQ29udGVudFNlbGVjdG9yc09mZnNldCArIHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMubGVuZ3RoO1xuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW28ubGl0ZXJhbChzbG90KV07XG5cbiAgICB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLnB1c2gobmdDb250ZW50LnNlbGVjdG9yKTtcblxuICAgIGNvbnN0IG5vbkNvbnRlbnRTZWxlY3RBdHRyaWJ1dGVzID1cbiAgICAgICAgbmdDb250ZW50LmF0dHJpYnV0ZXMuZmlsdGVyKGF0dHIgPT4gYXR0ci5uYW1lLnRvTG93ZXJDYXNlKCkgIT09IE5HX0NPTlRFTlRfU0VMRUNUX0FUVFIpO1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPVxuICAgICAgICB0aGlzLmdldEF0dHJpYnV0ZUV4cHJlc3Npb25zKG5nQ29udGVudC5uYW1lLCBub25Db250ZW50U2VsZWN0QXR0cmlidXRlcywgW10sIFtdKTtcblxuICAgIGlmIChhdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChvLmxpdGVyYWwocHJvamVjdGlvblNsb3RJZHgpLCBvLmxpdGVyYWxBcnIoYXR0cmlidXRlcykpO1xuICAgIH0gZWxzZSBpZiAocHJvamVjdGlvblNsb3RJZHggIT09IDApIHtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChvLmxpdGVyYWwocHJvamVjdGlvblNsb3RJZHgpKTtcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24obmdDb250ZW50LnNvdXJjZVNwYW4sIFIzLnByb2plY3Rpb24sIHBhcmFtZXRlcnMpO1xuICAgIGlmICh0aGlzLmkxOG4pIHtcbiAgICAgIHRoaXMuaTE4bi5hcHBlbmRQcm9qZWN0aW9uKG5nQ29udGVudC5pMThuISwgc2xvdCk7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IHQuRWxlbWVudCkge1xuICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IHRoaXMuYWxsb2NhdGVEYXRhU2xvdCgpO1xuICAgIGNvbnN0IHN0eWxpbmdCdWlsZGVyID0gbmV3IFN0eWxpbmdCdWlsZGVyKG51bGwpO1xuXG4gICAgbGV0IGlzTm9uQmluZGFibGVNb2RlOiBib29sZWFuID0gZmFsc2U7XG4gICAgY29uc3QgaXNJMThuUm9vdEVsZW1lbnQ6IGJvb2xlYW4gPVxuICAgICAgICBpc0kxOG5Sb290Tm9kZShlbGVtZW50LmkxOG4pICYmICFpc1NpbmdsZUkxOG5JY3UoZWxlbWVudC5pMThuKTtcblxuICAgIGNvbnN0IG91dHB1dEF0dHJzOiB0LlRleHRBdHRyaWJ1dGVbXSA9IFtdO1xuICAgIGNvbnN0IFtuYW1lc3BhY2VLZXksIGVsZW1lbnROYW1lXSA9IHNwbGl0TnNOYW1lKGVsZW1lbnQubmFtZSk7XG4gICAgY29uc3QgaXNOZ0NvbnRhaW5lciA9IGNoZWNrSXNOZ0NvbnRhaW5lcihlbGVtZW50Lm5hbWUpO1xuXG4gICAgLy8gSGFuZGxlIHN0eWxpbmcsIGkxOG4sIG5nTm9uQmluZGFibGUgYXR0cmlidXRlc1xuICAgIGZvciAoY29uc3QgYXR0ciBvZiBlbGVtZW50LmF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHtuYW1lLCB2YWx1ZX0gPSBhdHRyO1xuICAgICAgaWYgKG5hbWUgPT09IE5PTl9CSU5EQUJMRV9BVFRSKSB7XG4gICAgICAgIGlzTm9uQmluZGFibGVNb2RlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ3N0eWxlJykge1xuICAgICAgICBzdHlsaW5nQnVpbGRlci5yZWdpc3RlclN0eWxlQXR0cih2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdjbGFzcycpIHtcbiAgICAgICAgc3R5bGluZ0J1aWxkZXIucmVnaXN0ZXJDbGFzc0F0dHIodmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0QXR0cnMucHVzaChhdHRyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYXRjaCBkaXJlY3RpdmVzIG9uIG5vbiBpMThuIGF0dHJpYnV0ZXNcbiAgICB0aGlzLm1hdGNoRGlyZWN0aXZlcyhlbGVtZW50Lm5hbWUsIGVsZW1lbnQpO1xuXG4gICAgLy8gUmVndWxhciBlbGVtZW50IG9yIG5nLWNvbnRhaW5lciBjcmVhdGlvbiBtb2RlXG4gICAgY29uc3QgcGFyYW1ldGVyczogby5FeHByZXNzaW9uW10gPSBbby5saXRlcmFsKGVsZW1lbnRJbmRleCldO1xuICAgIGlmICghaXNOZ0NvbnRhaW5lcikge1xuICAgICAgcGFyYW1ldGVycy5wdXNoKG8ubGl0ZXJhbChlbGVtZW50TmFtZSkpO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgYXR0cmlidXRlc1xuICAgIGNvbnN0IGFsbE90aGVySW5wdXRzOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXTtcbiAgICBjb25zdCBib3VuZEkxOG5BdHRyczogdC5Cb3VuZEF0dHJpYnV0ZVtdID0gW107XG5cbiAgICBlbGVtZW50LmlucHV0cy5mb3JFYWNoKGlucHV0ID0+IHtcbiAgICAgIGNvbnN0IHN0eWxpbmdJbnB1dFdhc1NldCA9IHN0eWxpbmdCdWlsZGVyLnJlZ2lzdGVyQm91bmRJbnB1dChpbnB1dCk7XG4gICAgICBpZiAoIXN0eWxpbmdJbnB1dFdhc1NldCkge1xuICAgICAgICBpZiAoaW5wdXQudHlwZSA9PT0gQmluZGluZ1R5cGUuUHJvcGVydHkgJiYgaW5wdXQuaTE4bikge1xuICAgICAgICAgIGJvdW5kSTE4bkF0dHJzLnB1c2goaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFsbE90aGVySW5wdXRzLnB1c2goaW5wdXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBhZGQgYXR0cmlidXRlcyBmb3IgZGlyZWN0aXZlIGFuZCBwcm9qZWN0aW9uIG1hdGNoaW5nIHB1cnBvc2VzXG4gICAgY29uc3QgYXR0cmlidXRlczogby5FeHByZXNzaW9uW10gPSB0aGlzLmdldEF0dHJpYnV0ZUV4cHJlc3Npb25zKFxuICAgICAgICBlbGVtZW50Lm5hbWUsIG91dHB1dEF0dHJzLCBhbGxPdGhlcklucHV0cywgZWxlbWVudC5vdXRwdXRzLCBzdHlsaW5nQnVpbGRlciwgW10sXG4gICAgICAgIGJvdW5kSTE4bkF0dHJzKTtcbiAgICBwYXJhbWV0ZXJzLnB1c2godGhpcy5hZGRBdHRyc1RvQ29uc3RzKGF0dHJpYnV0ZXMpKTtcblxuICAgIC8vIGxvY2FsIHJlZnMgKGV4LjogPGRpdiAjZm9vICNiYXI9XCJiYXpcIj4pXG4gICAgY29uc3QgcmVmcyA9IHRoaXMucHJlcGFyZVJlZnNBcnJheShlbGVtZW50LnJlZmVyZW5jZXMpO1xuICAgIHBhcmFtZXRlcnMucHVzaCh0aGlzLmFkZFRvQ29uc3RzKHJlZnMpKTtcblxuICAgIGNvbnN0IHdhc0luTmFtZXNwYWNlID0gdGhpcy5fbmFtZXNwYWNlO1xuICAgIGNvbnN0IGN1cnJlbnROYW1lc3BhY2UgPSB0aGlzLmdldE5hbWVzcGFjZUluc3RydWN0aW9uKG5hbWVzcGFjZUtleSk7XG5cbiAgICAvLyBJZiB0aGUgbmFtZXNwYWNlIGlzIGNoYW5naW5nIG5vdywgaW5jbHVkZSBhbiBpbnN0cnVjdGlvbiB0byBjaGFuZ2UgaXRcbiAgICAvLyBkdXJpbmcgZWxlbWVudCBjcmVhdGlvbi5cbiAgICBpZiAoY3VycmVudE5hbWVzcGFjZSAhPT0gd2FzSW5OYW1lc3BhY2UpIHtcbiAgICAgIHRoaXMuYWRkTmFtZXNwYWNlSW5zdHJ1Y3Rpb24oY3VycmVudE5hbWVzcGFjZSwgZWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaTE4bikge1xuICAgICAgdGhpcy5pMThuLmFwcGVuZEVsZW1lbnQoZWxlbWVudC5pMThuISwgZWxlbWVudEluZGV4KTtcbiAgICB9XG5cbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gbm90IGFwcGVuZCB0ZXh0IG5vZGUgaW5zdHJ1Y3Rpb25zIGFuZCBJQ1VzIGluc2lkZSBpMThuIHNlY3Rpb24sXG4gICAgLy8gc28gd2UgZXhjbHVkZSB0aGVtIHdoaWxlIGNhbGN1bGF0aW5nIHdoZXRoZXIgY3VycmVudCBlbGVtZW50IGhhcyBjaGlsZHJlblxuICAgIGNvbnN0IGhhc0NoaWxkcmVuID0gKCFpc0kxOG5Sb290RWxlbWVudCAmJiB0aGlzLmkxOG4pID8gIWhhc1RleHRDaGlsZHJlbk9ubHkoZWxlbWVudC5jaGlsZHJlbikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jaGlsZHJlbi5sZW5ndGggPiAwO1xuXG4gICAgY29uc3QgY3JlYXRlU2VsZkNsb3NpbmdJbnN0cnVjdGlvbiA9ICFzdHlsaW5nQnVpbGRlci5oYXNCaW5kaW5nc1dpdGhQaXBlcyAmJlxuICAgICAgICBlbGVtZW50Lm91dHB1dHMubGVuZ3RoID09PSAwICYmIGJvdW5kSTE4bkF0dHJzLmxlbmd0aCA9PT0gMCAmJiAhaGFzQ2hpbGRyZW47XG4gICAgY29uc3QgY3JlYXRlU2VsZkNsb3NpbmdJMThuSW5zdHJ1Y3Rpb24gPVxuICAgICAgICAhY3JlYXRlU2VsZkNsb3NpbmdJbnN0cnVjdGlvbiAmJiBoYXNUZXh0Q2hpbGRyZW5Pbmx5KGVsZW1lbnQuY2hpbGRyZW4pO1xuXG4gICAgaWYgKGNyZWF0ZVNlbGZDbG9zaW5nSW5zdHJ1Y3Rpb24pIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICBlbGVtZW50LnNvdXJjZVNwYW4sIGlzTmdDb250YWluZXIgPyBSMy5lbGVtZW50Q29udGFpbmVyIDogUjMuZWxlbWVudCxcbiAgICAgICAgICB0cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgICAgICBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiwgaXNOZ0NvbnRhaW5lciA/IFIzLmVsZW1lbnRDb250YWluZXJTdGFydCA6IFIzLmVsZW1lbnRTdGFydCxcbiAgICAgICAgICB0cmltVHJhaWxpbmdOdWxscyhwYXJhbWV0ZXJzKSk7XG5cbiAgICAgIGlmIChpc05vbkJpbmRhYmxlTW9kZSkge1xuICAgICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24oZWxlbWVudC5zdGFydFNvdXJjZVNwYW4sIFIzLmRpc2FibGVCaW5kaW5ncyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChib3VuZEkxOG5BdHRycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuaTE4bkF0dHJpYnV0ZXNJbnN0cnVjdGlvbihcbiAgICAgICAgICAgIGVsZW1lbnRJbmRleCwgYm91bmRJMThuQXR0cnMsIGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuID8/IGVsZW1lbnQuc291cmNlU3Bhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIEdlbmVyYXRlIExpc3RlbmVycyAob3V0cHV0cylcbiAgICAgIGlmIChlbGVtZW50Lm91dHB1dHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBlbGVtZW50Lm91dHB1dHMubWFwKFxuICAgICAgICAgICAgKG91dHB1dEFzdDogdC5Cb3VuZEV2ZW50KSA9PiAoe1xuICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBvdXRwdXRBc3Quc291cmNlU3BhbixcbiAgICAgICAgICAgICAgcGFyYW1zOiB0aGlzLnByZXBhcmVMaXN0ZW5lclBhcmFtZXRlcihlbGVtZW50Lm5hbWUsIG91dHB1dEFzdCwgZWxlbWVudEluZGV4KVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb25DaGFpbihSMy5saXN0ZW5lciwgbGlzdGVuZXJzKTtcbiAgICAgIH1cblxuICAgICAgLy8gTm90ZTogaXQncyBpbXBvcnRhbnQgdG8ga2VlcCBpMThuL2kxOG5TdGFydCBpbnN0cnVjdGlvbnMgYWZ0ZXIgaTE4bkF0dHJpYnV0ZXMgYW5kXG4gICAgICAvLyBsaXN0ZW5lcnMsIHRvIG1ha2Ugc3VyZSBpMThuQXR0cmlidXRlcyBpbnN0cnVjdGlvbiB0YXJnZXRzIGN1cnJlbnQgZWxlbWVudCBhdCBydW50aW1lLlxuICAgICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaTE4blN0YXJ0KGVsZW1lbnQuc3RhcnRTb3VyY2VTcGFuLCBlbGVtZW50LmkxOG4hLCBjcmVhdGVTZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhlIGNvZGUgaGVyZSB3aWxsIGNvbGxlY3QgYWxsIHVwZGF0ZS1sZXZlbCBzdHlsaW5nIGluc3RydWN0aW9ucyBhbmQgYWRkIHRoZW0gdG8gdGhlXG4gICAgLy8gdXBkYXRlIGJsb2NrIG9mIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbiBBT1QgY29kZS4gSW5zdHJ1Y3Rpb25zIGxpa2UgYHN0eWxlUHJvcGAsXG4gICAgLy8gYHN0eWxlTWFwYCwgYGNsYXNzTWFwYCwgYGNsYXNzUHJvcGBcbiAgICAvLyBhcmUgYWxsIGdlbmVyYXRlZCBhbmQgYXNzaWduZWQgaW4gdGhlIGNvZGUgYmVsb3cuXG4gICAgY29uc3Qgc3R5bGluZ0luc3RydWN0aW9ucyA9IHN0eWxpbmdCdWlsZGVyLmJ1aWxkVXBkYXRlTGV2ZWxJbnN0cnVjdGlvbnModGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgIGNvbnN0IGxpbWl0ID0gc3R5bGluZ0luc3RydWN0aW9ucy5sZW5ndGggLSAxO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IGxpbWl0OyBpKyspIHtcbiAgICAgIGNvbnN0IGluc3RydWN0aW9uID0gc3R5bGluZ0luc3RydWN0aW9uc1tpXTtcbiAgICAgIHRoaXMuX2JpbmRpbmdTbG90cyArPSB0aGlzLnByb2Nlc3NTdHlsaW5nVXBkYXRlSW5zdHJ1Y3Rpb24oZWxlbWVudEluZGV4LCBpbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgLy8gdGhlIHJlYXNvbiB3aHkgYHVuZGVmaW5lZGAgaXMgdXNlZCBpcyBiZWNhdXNlIHRoZSByZW5kZXJlciB1bmRlcnN0YW5kcyB0aGlzIGFzIGFcbiAgICAvLyBzcGVjaWFsIHZhbHVlIHRvIHN5bWJvbGl6ZSB0aGF0IHRoZXJlIGlzIG5vIFJIUyB0byB0aGlzIGJpbmRpbmdcbiAgICAvLyBUT0RPIChtYXRza28pOiByZXZpc2l0IHRoaXMgb25jZSBGVy05NTkgaXMgYXBwcm9hY2hlZFxuICAgIGNvbnN0IGVtcHR5VmFsdWVCaW5kSW5zdHJ1Y3Rpb24gPSBvLmxpdGVyYWwodW5kZWZpbmVkKTtcbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRpbmdzOiBDaGFpbmFibGVCaW5kaW5nSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIGNvbnN0IGF0dHJpYnV0ZUJpbmRpbmdzOiBDaGFpbmFibGVCaW5kaW5nSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gICAgLy8gR2VuZXJhdGUgZWxlbWVudCBpbnB1dCBiaW5kaW5nc1xuICAgIGFsbE90aGVySW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgICAgY29uc3QgaW5wdXRUeXBlID0gaW5wdXQudHlwZTtcbiAgICAgIGlmIChpbnB1dFR5cGUgPT09IEJpbmRpbmdUeXBlLkFuaW1hdGlvbikge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgICAgLy8gYW5pbWF0aW9uIGJpbmRpbmdzIGNhbiBiZSBwcmVzZW50ZWQgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICAgICAgICAvLyAxLiBbQGJpbmRpbmddPVwiZm9vRXhwXCJcbiAgICAgICAgLy8gMi4gW0BiaW5kaW5nXT1cInt2YWx1ZTpmb29FeHAsIHBhcmFtczp7Li4ufX1cIlxuICAgICAgICAvLyAzLiBbQGJpbmRpbmddXG4gICAgICAgIC8vIDQuIEBiaW5kaW5nXG4gICAgICAgIC8vIEFsbCBmb3JtYXRzIHdpbGwgYmUgdmFsaWQgZm9yIHdoZW4gYSBzeW50aGV0aWMgYmluZGluZyBpcyBjcmVhdGVkLlxuICAgICAgICAvLyBUaGUgcmVhc29uaW5nIGZvciB0aGlzIGlzIGJlY2F1c2UgdGhlIHJlbmRlcmVyIHNob3VsZCBnZXQgZWFjaFxuICAgICAgICAvLyBzeW50aGV0aWMgYmluZGluZyB2YWx1ZSBpbiB0aGUgb3JkZXIgb2YgdGhlIGFycmF5IHRoYXQgdGhleSBhcmVcbiAgICAgICAgLy8gZGVmaW5lZCBpbi4uLlxuICAgICAgICBjb25zdCBoYXNWYWx1ZSA9IHZhbHVlIGluc3RhbmNlb2YgTGl0ZXJhbFByaW1pdGl2ZSA/ICEhdmFsdWUudmFsdWUgOiB0cnVlO1xuICAgICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlKTtcblxuICAgICAgICBwcm9wZXJ0eUJpbmRpbmdzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IHByZXBhcmVTeW50aGV0aWNQcm9wZXJ0eU5hbWUoaW5wdXQubmFtZSksXG4gICAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICB2YWx1ZTogKCkgPT4gaGFzVmFsdWUgPyB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodmFsdWUpIDogZW1wdHlWYWx1ZUJpbmRJbnN0cnVjdGlvblxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHdlIG11c3Qgc2tpcCBhdHRyaWJ1dGVzIHdpdGggYXNzb2NpYXRlZCBpMThuIGNvbnRleHQsIHNpbmNlIHRoZXNlIGF0dHJpYnV0ZXMgYXJlIGhhbmRsZWRcbiAgICAgICAgLy8gc2VwYXJhdGVseSBhbmQgY29ycmVzcG9uZGluZyBgaTE4bkV4cGAgYW5kIGBpMThuQXBwbHlgIGluc3RydWN0aW9ucyB3aWxsIGJlIGdlbmVyYXRlZFxuICAgICAgICBpZiAoaW5wdXQuaTE4bikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5wdXQudmFsdWUudmlzaXQodGhpcy5fdmFsdWVDb252ZXJ0ZXIpO1xuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IHBhcmFtczogYW55W10gPSBbXTtcbiAgICAgICAgICBjb25zdCBbYXR0ck5hbWVzcGFjZSwgYXR0ck5hbWVdID0gc3BsaXROc05hbWUoaW5wdXQubmFtZSk7XG4gICAgICAgICAgY29uc3QgaXNBdHRyaWJ1dGVCaW5kaW5nID0gaW5wdXRUeXBlID09PSBCaW5kaW5nVHlwZS5BdHRyaWJ1dGU7XG4gICAgICAgICAgY29uc3Qgc2FuaXRpemF0aW9uUmVmID0gcmVzb2x2ZVNhbml0aXphdGlvbkZuKGlucHV0LnNlY3VyaXR5Q29udGV4dCwgaXNBdHRyaWJ1dGVCaW5kaW5nKTtcbiAgICAgICAgICBpZiAoc2FuaXRpemF0aW9uUmVmKSBwYXJhbXMucHVzaChzYW5pdGl6YXRpb25SZWYpO1xuICAgICAgICAgIGlmIChhdHRyTmFtZXNwYWNlKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lc3BhY2VMaXRlcmFsID0gby5saXRlcmFsKGF0dHJOYW1lc3BhY2UpO1xuXG4gICAgICAgICAgICBpZiAoc2FuaXRpemF0aW9uUmVmKSB7XG4gICAgICAgICAgICAgIHBhcmFtcy5wdXNoKG5hbWVzcGFjZUxpdGVyYWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgd2Fzbid0IGEgc2FuaXRpemF0aW9uIHJlZiwgd2UgbmVlZCB0byBhZGRcbiAgICAgICAgICAgICAgLy8gYW4gZXh0cmEgcGFyYW0gc28gdGhhdCB3ZSBjYW4gcGFzcyBpbiB0aGUgbmFtZXNwYWNlLlxuICAgICAgICAgICAgICBwYXJhbXMucHVzaChvLmxpdGVyYWwobnVsbCksIG5hbWVzcGFjZUxpdGVyYWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFsbG9jYXRlQmluZGluZ1Nsb3RzKHZhbHVlKTtcblxuICAgICAgICAgIGlmIChpbnB1dFR5cGUgPT09IEJpbmRpbmdUeXBlLlByb3BlcnR5KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICAgICAgICAgIC8vIHByb3A9XCJ7e3ZhbHVlfX1cIiBhbmQgZnJpZW5kc1xuICAgICAgICAgICAgICB0aGlzLmludGVycG9sYXRlZFVwZGF0ZUluc3RydWN0aW9uKFxuICAgICAgICAgICAgICAgICAgZ2V0UHJvcGVydHlJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZSksIGVsZW1lbnRJbmRleCwgYXR0ck5hbWUsIGlucHV0LCB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBbcHJvcF09XCJ2YWx1ZVwiXG4gICAgICAgICAgICAgIC8vIENvbGxlY3QgYWxsIHRoZSBwcm9wZXJ0aWVzIHNvIHRoYXQgd2UgY2FuIGNoYWluIGludG8gYSBzaW5nbGUgZnVuY3Rpb24gYXQgdGhlIGVuZC5cbiAgICAgICAgICAgICAgcHJvcGVydHlCaW5kaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhdHRyTmFtZSxcbiAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBpbnB1dC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgIHZhbHVlOiAoKSA9PiB0aGlzLmNvbnZlcnRQcm9wZXJ0eUJpbmRpbmcodmFsdWUpLFxuICAgICAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGlucHV0VHlwZSA9PT0gQmluZGluZ1R5cGUuQXR0cmlidXRlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uICYmIGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKHZhbHVlKSA+IDEpIHtcbiAgICAgICAgICAgICAgLy8gYXR0ci5uYW1lPVwidGV4dHt7dmFsdWV9fVwiIGFuZCBmcmllbmRzXG4gICAgICAgICAgICAgIHRoaXMuaW50ZXJwb2xhdGVkVXBkYXRlSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICAgICAgICBnZXRBdHRyaWJ1dGVJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZSksIGVsZW1lbnRJbmRleCwgYXR0ck5hbWUsIGlucHV0LCB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgIHBhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjb25zdCBib3VuZFZhbHVlID0gdmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uID8gdmFsdWUuZXhwcmVzc2lvbnNbMF0gOiB2YWx1ZTtcbiAgICAgICAgICAgICAgLy8gW2F0dHIubmFtZV09XCJ2YWx1ZVwiIG9yIGF0dHIubmFtZT1cInt7dmFsdWV9fVwiXG4gICAgICAgICAgICAgIC8vIENvbGxlY3QgdGhlIGF0dHJpYnV0ZSBiaW5kaW5ncyBzbyB0aGF0IHRoZXkgY2FuIGJlIGNoYWluZWQgYXQgdGhlIGVuZC5cbiAgICAgICAgICAgICAgYXR0cmlidXRlQmluZGluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogYXR0ck5hbWUsXG4gICAgICAgICAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICB2YWx1ZTogKCkgPT4gdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKGJvdW5kVmFsdWUpLFxuICAgICAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2xhc3MgcHJvcFxuICAgICAgICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbldpdGhBZHZhbmNlKGVsZW1lbnRJbmRleCwgaW5wdXQuc291cmNlU3BhbiwgUjMuY2xhc3NQcm9wLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgby5saXRlcmFsKGVsZW1lbnRJbmRleCksIG8ubGl0ZXJhbChhdHRyTmFtZSksIHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyh2YWx1ZSksXG4gICAgICAgICAgICAgICAgLi4ucGFyYW1zXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChwcm9wZXJ0eUJpbmRpbmdzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25DaGFpbldpdGhBZHZhbmNlKGVsZW1lbnRJbmRleCwgUjMucHJvcGVydHksIHByb3BlcnR5QmluZGluZ3MpO1xuICAgIH1cblxuICAgIGlmIChhdHRyaWJ1dGVCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uQ2hhaW5XaXRoQWR2YW5jZShlbGVtZW50SW5kZXgsIFIzLmF0dHJpYnV0ZSwgYXR0cmlidXRlQmluZGluZ3MpO1xuICAgIH1cblxuICAgIC8vIFRyYXZlcnNlIGVsZW1lbnQgY2hpbGQgbm9kZXNcbiAgICB0LnZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4pO1xuXG4gICAgaWYgKCFpc0kxOG5Sb290RWxlbWVudCAmJiB0aGlzLmkxOG4pIHtcbiAgICAgIHRoaXMuaTE4bi5hcHBlbmRFbGVtZW50KGVsZW1lbnQuaTE4biEsIGVsZW1lbnRJbmRleCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFjcmVhdGVTZWxmQ2xvc2luZ0luc3RydWN0aW9uKSB7XG4gICAgICAvLyBGaW5pc2ggZWxlbWVudCBjb25zdHJ1Y3Rpb24gbW9kZS5cbiAgICAgIGNvbnN0IHNwYW4gPSBlbGVtZW50LmVuZFNvdXJjZVNwYW4gPz8gZWxlbWVudC5zb3VyY2VTcGFuO1xuICAgICAgaWYgKGlzSTE4blJvb3RFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuaTE4bkVuZChzcGFuLCBjcmVhdGVTZWxmQ2xvc2luZ0kxOG5JbnN0cnVjdGlvbik7XG4gICAgICB9XG4gICAgICBpZiAoaXNOb25CaW5kYWJsZU1vZGUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHNwYW4sIFIzLmVuYWJsZUJpbmRpbmdzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY3JlYXRpb25JbnN0cnVjdGlvbihzcGFuLCBpc05nQ29udGFpbmVyID8gUjMuZWxlbWVudENvbnRhaW5lckVuZCA6IFIzLmVsZW1lbnRFbmQpO1xuICAgIH1cbiAgfVxuXG5cbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogdC5UZW1wbGF0ZSkge1xuICAgIGNvbnN0IE5HX1RFTVBMQVRFX1RBR19OQU1FID0gJ25nLXRlbXBsYXRlJztcbiAgICBjb25zdCB0ZW1wbGF0ZUluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG5cbiAgICBpZiAodGhpcy5pMThuKSB7XG4gICAgICB0aGlzLmkxOG4uYXBwZW5kVGVtcGxhdGUodGVtcGxhdGUuaTE4biEsIHRlbXBsYXRlSW5kZXgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRhZ05hbWUgPSBzYW5pdGl6ZUlkZW50aWZpZXIodGVtcGxhdGUudGFnTmFtZSB8fCAnJyk7XG4gICAgY29uc3QgY29udGV4dE5hbWUgPSBgJHt0aGlzLmNvbnRleHROYW1lfSR7dGFnTmFtZSA/ICdfJyArIHRhZ05hbWUgOiAnJ31fJHt0ZW1wbGF0ZUluZGV4fWA7XG4gICAgY29uc3QgdGVtcGxhdGVOYW1lID0gYCR7Y29udGV4dE5hbWV9X1RlbXBsYXRlYDtcblxuICAgIGNvbnN0IHBhcmFtZXRlcnM6IG8uRXhwcmVzc2lvbltdID0gW1xuICAgICAgby5saXRlcmFsKHRlbXBsYXRlSW5kZXgpLFxuICAgICAgby52YXJpYWJsZSh0ZW1wbGF0ZU5hbWUpLFxuXG4gICAgICAvLyBXZSBkb24ndCBjYXJlIGFib3V0IHRoZSB0YWcncyBuYW1lc3BhY2UgaGVyZSwgYmVjYXVzZSB3ZSBpbmZlclxuICAgICAgLy8gaXQgYmFzZWQgb24gdGhlIHBhcmVudCBub2RlcyBpbnNpZGUgdGhlIHRlbXBsYXRlIGluc3RydWN0aW9uLlxuICAgICAgby5saXRlcmFsKHRlbXBsYXRlLnRhZ05hbWUgPyBzcGxpdE5zTmFtZSh0ZW1wbGF0ZS50YWdOYW1lKVsxXSA6IHRlbXBsYXRlLnRhZ05hbWUpLFxuICAgIF07XG5cbiAgICAvLyBmaW5kIGRpcmVjdGl2ZXMgbWF0Y2hpbmcgb24gYSBnaXZlbiA8bmctdGVtcGxhdGU+IG5vZGVcbiAgICB0aGlzLm1hdGNoRGlyZWN0aXZlcyhOR19URU1QTEFURV9UQUdfTkFNRSwgdGVtcGxhdGUpO1xuXG4gICAgLy8gcHJlcGFyZSBhdHRyaWJ1dGVzIHBhcmFtZXRlciAoaW5jbHVkaW5nIGF0dHJpYnV0ZXMgdXNlZCBmb3IgZGlyZWN0aXZlIG1hdGNoaW5nKVxuICAgIGNvbnN0IGF0dHJzRXhwcnM6IG8uRXhwcmVzc2lvbltdID0gdGhpcy5nZXRBdHRyaWJ1dGVFeHByZXNzaW9ucyhcbiAgICAgICAgTkdfVEVNUExBVEVfVEFHX05BTUUsIHRlbXBsYXRlLmF0dHJpYnV0ZXMsIHRlbXBsYXRlLmlucHV0cywgdGVtcGxhdGUub3V0cHV0cyxcbiAgICAgICAgdW5kZWZpbmVkIC8qIHN0eWxlcyAqLywgdGVtcGxhdGUudGVtcGxhdGVBdHRycyk7XG4gICAgcGFyYW1ldGVycy5wdXNoKHRoaXMuYWRkQXR0cnNUb0NvbnN0cyhhdHRyc0V4cHJzKSk7XG5cbiAgICAvLyBsb2NhbCByZWZzIChleC46IDxuZy10ZW1wbGF0ZSAjZm9vPilcbiAgICBpZiAodGVtcGxhdGUucmVmZXJlbmNlcyAmJiB0ZW1wbGF0ZS5yZWZlcmVuY2VzLmxlbmd0aCkge1xuICAgICAgY29uc3QgcmVmcyA9IHRoaXMucHJlcGFyZVJlZnNBcnJheSh0ZW1wbGF0ZS5yZWZlcmVuY2VzKTtcbiAgICAgIHBhcmFtZXRlcnMucHVzaCh0aGlzLmFkZFRvQ29uc3RzKHJlZnMpKTtcbiAgICAgIHBhcmFtZXRlcnMucHVzaChvLmltcG9ydEV4cHIoUjMudGVtcGxhdGVSZWZFeHRyYWN0b3IpKTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgdGhlIHRlbXBsYXRlIGZ1bmN0aW9uXG4gICAgY29uc3QgdGVtcGxhdGVWaXNpdG9yID0gbmV3IFRlbXBsYXRlRGVmaW5pdGlvbkJ1aWxkZXIoXG4gICAgICAgIHRoaXMuY29uc3RhbnRQb29sLCB0aGlzLl9iaW5kaW5nU2NvcGUsIHRoaXMubGV2ZWwgKyAxLCBjb250ZXh0TmFtZSwgdGhpcy5pMThuLFxuICAgICAgICB0ZW1wbGF0ZUluZGV4LCB0ZW1wbGF0ZU5hbWUsIHRoaXMuZGlyZWN0aXZlTWF0Y2hlciwgdGhpcy5kaXJlY3RpdmVzLCB0aGlzLnBpcGVUeXBlQnlOYW1lLFxuICAgICAgICB0aGlzLnBpcGVzLCB0aGlzLl9uYW1lc3BhY2UsIHRoaXMuZmlsZUJhc2VkSTE4blN1ZmZpeCwgdGhpcy5pMThuVXNlRXh0ZXJuYWxJZHMsXG4gICAgICAgIHRoaXMuX2NvbnN0YW50cyk7XG5cbiAgICAvLyBOZXN0ZWQgdGVtcGxhdGVzIG11c3Qgbm90IGJlIHZpc2l0ZWQgdW50aWwgYWZ0ZXIgdGhlaXIgcGFyZW50IHRlbXBsYXRlcyBoYXZlIGNvbXBsZXRlZFxuICAgIC8vIHByb2Nlc3NpbmcsIHNvIHRoZXkgYXJlIHF1ZXVlZCBoZXJlIHVudGlsIGFmdGVyIHRoZSBpbml0aWFsIHBhc3MuIE90aGVyd2lzZSwgd2Ugd291bGRuJ3RcbiAgICAvLyBiZSBhYmxlIHRvIHN1cHBvcnQgYmluZGluZ3MgaW4gbmVzdGVkIHRlbXBsYXRlcyB0byBsb2NhbCByZWZzIHRoYXQgb2NjdXIgYWZ0ZXIgdGhlXG4gICAgLy8gdGVtcGxhdGUgZGVmaW5pdGlvbi4gZS5nLiA8ZGl2ICpuZ0lmPVwic2hvd2luZ1wiPnt7IGZvbyB9fTwvZGl2PiAgPGRpdiAjZm9vPjwvZGl2PlxuICAgIHRoaXMuX25lc3RlZFRlbXBsYXRlRm5zLnB1c2goKCkgPT4ge1xuICAgICAgY29uc3QgdGVtcGxhdGVGdW5jdGlvbkV4cHIgPSB0ZW1wbGF0ZVZpc2l0b3IuYnVpbGRUZW1wbGF0ZUZ1bmN0aW9uKFxuICAgICAgICAgIHRlbXBsYXRlLmNoaWxkcmVuLCB0ZW1wbGF0ZS52YXJpYWJsZXMsXG4gICAgICAgICAgdGhpcy5fbmdDb250ZW50UmVzZXJ2ZWRTbG90cy5sZW5ndGggKyB0aGlzLl9uZ0NvbnRlbnRTZWxlY3RvcnNPZmZzZXQsIHRlbXBsYXRlLmkxOG4pO1xuICAgICAgdGhpcy5jb25zdGFudFBvb2wuc3RhdGVtZW50cy5wdXNoKHRlbXBsYXRlRnVuY3Rpb25FeHByLnRvRGVjbFN0bXQodGVtcGxhdGVOYW1lKSk7XG4gICAgICBpZiAodGVtcGxhdGVWaXNpdG9yLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzLnB1c2goLi4udGVtcGxhdGVWaXNpdG9yLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGUuZy4gdGVtcGxhdGUoMSwgTXlDb21wX1RlbXBsYXRlXzEpXG4gICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKHRlbXBsYXRlLnNvdXJjZVNwYW4sIFIzLnRlbXBsYXRlQ3JlYXRlLCAoKSA9PiB7XG4gICAgICBwYXJhbWV0ZXJzLnNwbGljZShcbiAgICAgICAgICAyLCAwLCBvLmxpdGVyYWwodGVtcGxhdGVWaXNpdG9yLmdldENvbnN0Q291bnQoKSksXG4gICAgICAgICAgby5saXRlcmFsKHRlbXBsYXRlVmlzaXRvci5nZXRWYXJDb3VudCgpKSk7XG4gICAgICByZXR1cm4gdHJpbVRyYWlsaW5nTnVsbHMocGFyYW1ldGVycyk7XG4gICAgfSk7XG5cbiAgICAvLyBoYW5kbGUgcHJvcGVydHkgYmluZGluZ3MgZS5nLiDJtcm1cHJvcGVydHkoJ25nRm9yT2YnLCBjdHguaXRlbXMpLCBldCBhbDtcbiAgICB0aGlzLnRlbXBsYXRlUHJvcGVydHlCaW5kaW5ncyh0ZW1wbGF0ZUluZGV4LCB0ZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzKTtcblxuICAgIC8vIE9ubHkgYWRkIG5vcm1hbCBpbnB1dC9vdXRwdXQgYmluZGluZyBpbnN0cnVjdGlvbnMgb24gZXhwbGljaXQgPG5nLXRlbXBsYXRlPiBlbGVtZW50cy5cbiAgICBpZiAodGVtcGxhdGUudGFnTmFtZSA9PT0gTkdfVEVNUExBVEVfVEFHX05BTUUpIHtcbiAgICAgIGNvbnN0IFtpMThuSW5wdXRzLCBpbnB1dHNdID1cbiAgICAgICAgICBwYXJ0aXRpb25BcnJheTx0LkJvdW5kQXR0cmlidXRlLCB0LkJvdW5kQXR0cmlidXRlPih0ZW1wbGF0ZS5pbnB1dHMsIGhhc0kxOG5NZXRhKTtcblxuICAgICAgLy8gQWRkIGkxOG4gYXR0cmlidXRlcyB0aGF0IG1heSBhY3QgYXMgaW5wdXRzIHRvIGRpcmVjdGl2ZXMuIElmIHN1Y2ggYXR0cmlidXRlcyBhcmUgcHJlc2VudCxcbiAgICAgIC8vIGdlbmVyYXRlIGBpMThuQXR0cmlidXRlc2AgaW5zdHJ1Y3Rpb24uIE5vdGU6IHdlIGdlbmVyYXRlIGl0IG9ubHkgZm9yIGV4cGxpY2l0IDxuZy10ZW1wbGF0ZT5cbiAgICAgIC8vIGVsZW1lbnRzLCBpbiBjYXNlIG9mIGlubGluZSB0ZW1wbGF0ZXMsIGNvcnJlc3BvbmRpbmcgaW5zdHJ1Y3Rpb25zIHdpbGwgYmUgZ2VuZXJhdGVkIGluIHRoZVxuICAgICAgLy8gbmVzdGVkIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICAgICAgaWYgKGkxOG5JbnB1dHMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmkxOG5BdHRyaWJ1dGVzSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgICB0ZW1wbGF0ZUluZGV4LCBpMThuSW5wdXRzLCB0ZW1wbGF0ZS5zdGFydFNvdXJjZVNwYW4gPz8gdGVtcGxhdGUuc291cmNlU3Bhbik7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0aGUgaW5wdXQgYmluZGluZ3NcbiAgICAgIGlmIChpbnB1dHMubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLnRlbXBsYXRlUHJvcGVydHlCaW5kaW5ncyh0ZW1wbGF0ZUluZGV4LCBpbnB1dHMpO1xuICAgICAgfVxuXG4gICAgICAvLyBHZW5lcmF0ZSBsaXN0ZW5lcnMgZm9yIGRpcmVjdGl2ZSBvdXRwdXRcbiAgICAgIGlmICh0ZW1wbGF0ZS5vdXRwdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gdGVtcGxhdGUub3V0cHV0cy5tYXAoXG4gICAgICAgICAgICAob3V0cHV0QXN0OiB0LkJvdW5kRXZlbnQpID0+ICh7XG4gICAgICAgICAgICAgIHNvdXJjZVNwYW46IG91dHB1dEFzdC5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICBwYXJhbXM6IHRoaXMucHJlcGFyZUxpc3RlbmVyUGFyYW1ldGVyKCduZ190ZW1wbGF0ZScsIG91dHB1dEFzdCwgdGVtcGxhdGVJbmRleClcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uQ2hhaW4oUjMubGlzdGVuZXIsIGxpc3RlbmVycyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlc2Ugc2hvdWxkIGJlIGhhbmRsZWQgaW4gdGhlIHRlbXBsYXRlIG9yIGVsZW1lbnQgZGlyZWN0bHkuXG4gIHJlYWRvbmx5IHZpc2l0UmVmZXJlbmNlID0gaW52YWxpZDtcbiAgcmVhZG9ubHkgdmlzaXRWYXJpYWJsZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0VGV4dEF0dHJpYnV0ZSA9IGludmFsaWQ7XG4gIHJlYWRvbmx5IHZpc2l0Qm91bmRBdHRyaWJ1dGUgPSBpbnZhbGlkO1xuICByZWFkb25seSB2aXNpdEJvdW5kRXZlbnQgPSBpbnZhbGlkO1xuXG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IHQuQm91bmRUZXh0KSB7XG4gICAgaWYgKHRoaXMuaTE4bikge1xuICAgICAgY29uc3QgdmFsdWUgPSB0ZXh0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcbiAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikge1xuICAgICAgICB0aGlzLmkxOG4uYXBwZW5kQm91bmRUZXh0KHRleHQuaTE4biEpO1xuICAgICAgICB0aGlzLmkxOG5BcHBlbmRCaW5kaW5ncyh2YWx1ZS5leHByZXNzaW9ucyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZUluZGV4ID0gdGhpcy5hbGxvY2F0ZURhdGFTbG90KCk7XG5cbiAgICB0aGlzLmNyZWF0aW9uSW5zdHJ1Y3Rpb24odGV4dC5zb3VyY2VTcGFuLCBSMy50ZXh0LCBbby5saXRlcmFsKG5vZGVJbmRleCldKTtcblxuICAgIGNvbnN0IHZhbHVlID0gdGV4dC52YWx1ZS52aXNpdCh0aGlzLl92YWx1ZUNvbnZlcnRlcik7XG4gICAgdGhpcy5hbGxvY2F0ZUJpbmRpbmdTbG90cyh2YWx1ZSk7XG5cbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJbnRlcnBvbGF0aW9uKSB7XG4gICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uV2l0aEFkdmFuY2UoXG4gICAgICAgICAgbm9kZUluZGV4LCB0ZXh0LnNvdXJjZVNwYW4sIGdldFRleHRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbih2YWx1ZSksXG4gICAgICAgICAgKCkgPT4gdGhpcy5nZXRVcGRhdGVJbnN0cnVjdGlvbkFyZ3VtZW50cyh2YWx1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcignVGV4dCBub2RlcyBzaG91bGQgYmUgaW50ZXJwb2xhdGVkIGFuZCBuZXZlciBib3VuZCBkaXJlY3RseS4nKTtcbiAgICB9XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogdC5UZXh0KSB7XG4gICAgLy8gd2hlbiBhIHRleHQgZWxlbWVudCBpcyBsb2NhdGVkIHdpdGhpbiBhIHRyYW5zbGF0YWJsZVxuICAgIC8vIGJsb2NrLCB3ZSBleGNsdWRlIHRoaXMgdGV4dCBlbGVtZW50IGZyb20gaW5zdHJ1Y3Rpb25zIHNldCxcbiAgICAvLyBzaW5jZSBpdCB3aWxsIGJlIGNhcHR1cmVkIGluIGkxOG4gY29udGVudCBhbmQgcHJvY2Vzc2VkIGF0IHJ1bnRpbWVcbiAgICBpZiAoIXRoaXMuaTE4bikge1xuICAgICAgdGhpcy5jcmVhdGlvbkluc3RydWN0aW9uKFxuICAgICAgICAgIHRleHQuc291cmNlU3BhbiwgUjMudGV4dCwgW28ubGl0ZXJhbCh0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKSksIG8ubGl0ZXJhbCh0ZXh0LnZhbHVlKV0pO1xuICAgIH1cbiAgfVxuXG4gIHZpc2l0SWN1KGljdTogdC5JY3UpIHtcbiAgICBsZXQgaW5pdFdhc0ludm9rZWQgPSBmYWxzZTtcblxuICAgIC8vIGlmIGFuIElDVSB3YXMgY3JlYXRlZCBvdXRzaWRlIG9mIGkxOG4gYmxvY2ssIHdlIHN0aWxsIHRyZWF0XG4gICAgLy8gaXQgYXMgYSB0cmFuc2xhdGFibGUgZW50aXR5IGFuZCBpbnZva2UgaTE4blN0YXJ0IGFuZCBpMThuRW5kXG4gICAgLy8gdG8gZ2VuZXJhdGUgaTE4biBjb250ZXh0IGFuZCB0aGUgbmVjZXNzYXJ5IGluc3RydWN0aW9uc1xuICAgIGlmICghdGhpcy5pMThuKSB7XG4gICAgICBpbml0V2FzSW52b2tlZCA9IHRydWU7XG4gICAgICB0aGlzLmkxOG5TdGFydChudWxsLCBpY3UuaTE4biEsIHRydWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGkxOG4gPSB0aGlzLmkxOG4hO1xuICAgIGNvbnN0IHZhcnMgPSB0aGlzLmkxOG5CaW5kUHJvcHMoaWN1LnZhcnMpO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVycyA9IHRoaXMuaTE4bkJpbmRQcm9wcyhpY3UucGxhY2Vob2xkZXJzKTtcblxuICAgIC8vIG91dHB1dCBJQ1UgZGlyZWN0bHkgYW5kIGtlZXAgSUNVIHJlZmVyZW5jZSBpbiBjb250ZXh0XG4gICAgY29uc3QgbWVzc2FnZSA9IGljdS5pMThuISBhcyBpMThuLk1lc3NhZ2U7XG5cbiAgICAvLyB3ZSBhbHdheXMgbmVlZCBwb3N0LXByb2Nlc3NpbmcgZnVuY3Rpb24gZm9yIElDVXMsIHRvIG1ha2Ugc3VyZSB0aGF0OlxuICAgIC8vIC0gYWxsIHBsYWNlaG9sZGVycyBpbiBhIGZvcm0gb2Yge1BMQUNFSE9MREVSfSBhcmUgcmVwbGFjZWQgd2l0aCBhY3R1YWwgdmFsdWVzIChub3RlOlxuICAgIC8vIGBnb29nLmdldE1zZ2AgZG9lcyBub3QgcHJvY2VzcyBJQ1VzIGFuZCB1c2VzIHRoZSBge1BMQUNFSE9MREVSfWAgZm9ybWF0IGZvciBwbGFjZWhvbGRlcnNcbiAgICAvLyBpbnNpZGUgSUNVcylcbiAgICAvLyAtIGFsbCBJQ1UgdmFycyAoc3VjaCBhcyBgVkFSX1NFTEVDVGAgb3IgYFZBUl9QTFVSQUxgKSBhcmUgcmVwbGFjZWQgd2l0aCBjb3JyZWN0IHZhbHVlc1xuICAgIGNvbnN0IHRyYW5zZm9ybUZuID0gKHJhdzogby5SZWFkVmFyRXhwcikgPT4ge1xuICAgICAgY29uc3QgcGFyYW1zID0gey4uLnZhcnMsIC4uLnBsYWNlaG9sZGVyc307XG4gICAgICBjb25zdCBmb3JtYXR0ZWQgPSBpMThuRm9ybWF0UGxhY2Vob2xkZXJOYW1lcyhwYXJhbXMsIC8qIHVzZUNhbWVsQ2FzZSAqLyBmYWxzZSk7XG4gICAgICByZXR1cm4gaW5zdHJ1Y3Rpb24obnVsbCwgUjMuaTE4blBvc3Rwcm9jZXNzLCBbcmF3LCBtYXBMaXRlcmFsKGZvcm1hdHRlZCwgdHJ1ZSldKTtcbiAgICB9O1xuXG4gICAgLy8gaW4gY2FzZSB0aGUgd2hvbGUgaTE4biBtZXNzYWdlIGlzIGEgc2luZ2xlIElDVSAtIHdlIGRvIG5vdCBuZWVkIHRvXG4gICAgLy8gY3JlYXRlIGEgc2VwYXJhdGUgdG9wLWxldmVsIHRyYW5zbGF0aW9uLCB3ZSBjYW4gdXNlIHRoZSByb290IHJlZiBpbnN0ZWFkXG4gICAgLy8gYW5kIG1ha2UgdGhpcyBJQ1UgYSB0b3AtbGV2ZWwgdHJhbnNsYXRpb25cbiAgICAvLyBub3RlOiBJQ1UgcGxhY2Vob2xkZXJzIGFyZSByZXBsYWNlZCB3aXRoIGFjdHVhbCB2YWx1ZXMgaW4gYGkxOG5Qb3N0cHJvY2Vzc2AgZnVuY3Rpb25cbiAgICAvLyBzZXBhcmF0ZWx5LCBzbyB3ZSBkbyBub3QgcGFzcyBwbGFjZWhvbGRlcnMgaW50byBgaTE4blRyYW5zbGF0ZWAgZnVuY3Rpb24uXG4gICAgaWYgKGlzU2luZ2xlSTE4bkljdShpMThuLm1ldGEpKSB7XG4gICAgICB0aGlzLmkxOG5UcmFuc2xhdGUobWVzc2FnZSwgLyogcGxhY2Vob2xkZXJzICovIHt9LCBpMThuLnJlZiwgdHJhbnNmb3JtRm4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvdXRwdXQgSUNVIGRpcmVjdGx5IGFuZCBrZWVwIElDVSByZWZlcmVuY2UgaW4gY29udGV4dFxuICAgICAgY29uc3QgcmVmID1cbiAgICAgICAgICB0aGlzLmkxOG5UcmFuc2xhdGUobWVzc2FnZSwgLyogcGxhY2Vob2xkZXJzICovIHt9LCAvKiByZWYgKi8gdW5kZWZpbmVkLCB0cmFuc2Zvcm1Gbik7XG4gICAgICBpMThuLmFwcGVuZEljdShpY3VGcm9tSTE4bk1lc3NhZ2UobWVzc2FnZSkubmFtZSwgcmVmKTtcbiAgICB9XG5cbiAgICBpZiAoaW5pdFdhc0ludm9rZWQpIHtcbiAgICAgIHRoaXMuaTE4bkVuZChudWxsLCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBwcml2YXRlIGFsbG9jYXRlRGF0YVNsb3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGFJbmRleCsrO1xuICB9XG5cbiAgZ2V0Q29uc3RDb3VudCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YUluZGV4O1xuICB9XG5cbiAgZ2V0VmFyQ291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3B1cmVGdW5jdGlvblNsb3RzO1xuICB9XG5cbiAgZ2V0Q29uc3RzKCk6IENvbXBvbmVudERlZkNvbnN0cyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0YW50cztcbiAgfVxuXG4gIGdldE5nQ29udGVudFNlbGVjdG9ycygpOiBvLkV4cHJlc3Npb258bnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX25nQ29udGVudFJlc2VydmVkU2xvdHMubGVuZ3RoID9cbiAgICAgICAgdGhpcy5jb25zdGFudFBvb2wuZ2V0Q29uc3RMaXRlcmFsKGFzTGl0ZXJhbCh0aGlzLl9uZ0NvbnRlbnRSZXNlcnZlZFNsb3RzKSwgdHJ1ZSkgOlxuICAgICAgICBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBiaW5kaW5nQ29udGV4dCgpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fYmluZGluZ0NvbnRleHQrK31gO1xuICB9XG5cbiAgcHJpdmF0ZSB0ZW1wbGF0ZVByb3BlcnR5QmluZGluZ3MoXG4gICAgICB0ZW1wbGF0ZUluZGV4OiBudW1iZXIsIGF0dHJzOiAodC5Cb3VuZEF0dHJpYnV0ZXx0LlRleHRBdHRyaWJ1dGUpW10pIHtcbiAgICBjb25zdCBwcm9wZXJ0eUJpbmRpbmdzOiBDaGFpbmFibGVCaW5kaW5nSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuICAgIGF0dHJzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgdC5Cb3VuZEF0dHJpYnV0ZSkge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IGlucHV0LnZhbHVlLnZpc2l0KHRoaXMuX3ZhbHVlQ29udmVydGVyKTtcblxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWUpO1xuICAgICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEludGVycG9sYXRpb24pIHtcbiAgICAgICAgICAgIC8vIFBhcmFtcyB0eXBpY2FsbHkgY29udGFpbiBhdHRyaWJ1dGUgbmFtZXNwYWNlIGFuZCB2YWx1ZSBzYW5pdGl6ZXIsIHdoaWNoIGlzIGFwcGxpY2FibGVcbiAgICAgICAgICAgIC8vIGZvciByZWd1bGFyIEhUTUwgZWxlbWVudHMsIGJ1dCBub3QgYXBwbGljYWJsZSBmb3IgPG5nLXRlbXBsYXRlPiAoc2luY2UgcHJvcHMgYWN0IGFzXG4gICAgICAgICAgICAvLyBpbnB1dHMgdG8gZGlyZWN0aXZlcyksIHNvIGtlZXAgcGFyYW1zIGFycmF5IGVtcHR5LlxuICAgICAgICAgICAgY29uc3QgcGFyYW1zOiBhbnlbXSA9IFtdO1xuXG4gICAgICAgICAgICAvLyBwcm9wPVwie3t2YWx1ZX19XCIgY2FzZVxuICAgICAgICAgICAgdGhpcy5pbnRlcnBvbGF0ZWRVcGRhdGVJbnN0cnVjdGlvbihcbiAgICAgICAgICAgICAgICBnZXRQcm9wZXJ0eUludGVycG9sYXRpb25FeHByZXNzaW9uKHZhbHVlKSwgdGVtcGxhdGVJbmRleCwgaW5wdXQubmFtZSwgaW5wdXQsIHZhbHVlLFxuICAgICAgICAgICAgICAgIHBhcmFtcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFtwcm9wXT1cInZhbHVlXCIgY2FzZVxuICAgICAgICAgICAgcHJvcGVydHlCaW5kaW5ncy5wdXNoKHtcbiAgICAgICAgICAgICAgbmFtZTogaW5wdXQubmFtZSxcbiAgICAgICAgICAgICAgc291cmNlU3BhbjogaW5wdXQuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgdmFsdWU6ICgpID0+IHRoaXMuY29udmVydFByb3BlcnR5QmluZGluZyh2YWx1ZSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHByb3BlcnR5QmluZGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cGRhdGVJbnN0cnVjdGlvbkNoYWluV2l0aEFkdmFuY2UodGVtcGxhdGVJbmRleCwgUjMucHJvcGVydHksIHByb3BlcnR5QmluZGluZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEJpbmRpbmdzIG11c3Qgb25seSBiZSByZXNvbHZlZCBhZnRlciBhbGwgbG9jYWwgcmVmcyBoYXZlIGJlZW4gdmlzaXRlZCwgc28gYWxsXG4gIC8vIGluc3RydWN0aW9ucyBhcmUgcXVldWVkIGluIGNhbGxiYWNrcyB0aGF0IGV4ZWN1dGUgb25jZSB0aGUgaW5pdGlhbCBwYXNzIGhhcyBjb21wbGV0ZWQuXG4gIC8vIE90aGVyd2lzZSwgd2Ugd291bGRuJ3QgYmUgYWJsZSB0byBzdXBwb3J0IGxvY2FsIHJlZnMgdGhhdCBhcmUgZGVmaW5lZCBhZnRlciB0aGVpclxuICAvLyBiaW5kaW5ncy4gZS5nLiB7eyBmb28gfX0gPGRpdiAjZm9vPjwvZGl2PlxuICBwcml2YXRlIGluc3RydWN0aW9uRm4oXG4gICAgICBmbnM6ICgoKSA9PiBvLlN0YXRlbWVudClbXSwgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICAgIHBhcmFtc09yRm46IG8uRXhwcmVzc2lvbltdfCgoKSA9PiBvLkV4cHJlc3Npb25bXSksIHByZXBlbmQ6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGZuc1twcmVwZW5kID8gJ3Vuc2hpZnQnIDogJ3B1c2gnXSgoKSA9PiB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBBcnJheS5pc0FycmF5KHBhcmFtc09yRm4pID8gcGFyYW1zT3JGbiA6IHBhcmFtc09yRm4oKTtcbiAgICAgIHJldHVybiBpbnN0cnVjdGlvbihzcGFuLCByZWZlcmVuY2UsIHBhcmFtcykudG9TdG10KCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHByb2Nlc3NTdHlsaW5nVXBkYXRlSW5zdHJ1Y3Rpb24oXG4gICAgICBlbGVtZW50SW5kZXg6IG51bWJlciwgaW5zdHJ1Y3Rpb246IFN0eWxpbmdJbnN0cnVjdGlvbnxudWxsKSB7XG4gICAgbGV0IGFsbG9jYXRlQmluZGluZ1Nsb3RzID0gMDtcbiAgICBpZiAoaW5zdHJ1Y3Rpb24pIHtcbiAgICAgIGNvbnN0IGNhbGxzOiBDaGFpbmFibGVCaW5kaW5nSW5zdHJ1Y3Rpb25bXSA9IFtdO1xuXG4gICAgICBpbnN0cnVjdGlvbi5jYWxscy5mb3JFYWNoKGNhbGwgPT4ge1xuICAgICAgICBhbGxvY2F0ZUJpbmRpbmdTbG90cyArPSBjYWxsLmFsbG9jYXRlQmluZGluZ1Nsb3RzO1xuICAgICAgICBjYWxscy5wdXNoKHtcbiAgICAgICAgICBzb3VyY2VTcGFuOiBjYWxsLnNvdXJjZVNwYW4sXG4gICAgICAgICAgdmFsdWU6ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsLnBhcmFtcyhcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPT4gKGNhbGwuc3VwcG9ydHNJbnRlcnBvbGF0aW9uICYmIHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRVcGRhdGVJbnN0cnVjdGlvbkFyZ3VtZW50cyh2YWx1ZSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0UHJvcGVydHlCaW5kaW5nKHZhbHVlKSkgYXMgby5FeHByZXNzaW9uW107XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnVwZGF0ZUluc3RydWN0aW9uQ2hhaW5XaXRoQWR2YW5jZShlbGVtZW50SW5kZXgsIGluc3RydWN0aW9uLnJlZmVyZW5jZSwgY2FsbHMpO1xuICAgIH1cblxuICAgIHJldHVybiBhbGxvY2F0ZUJpbmRpbmdTbG90cztcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRpb25JbnN0cnVjdGlvbihcbiAgICAgIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsXG4gICAgICBwYXJhbXNPckZuPzogby5FeHByZXNzaW9uW118KCgpID0+IG8uRXhwcmVzc2lvbltdKSwgcHJlcGVuZD86IGJvb2xlYW4pIHtcbiAgICB0aGlzLmluc3RydWN0aW9uRm4odGhpcy5fY3JlYXRpb25Db2RlRm5zLCBzcGFuLCByZWZlcmVuY2UsIHBhcmFtc09yRm4gfHwgW10sIHByZXBlbmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGlvbkluc3RydWN0aW9uQ2hhaW4ocmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLCBjYWxsczoge1xuICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLFxuICAgIHBhcmFtczogKCkgPT4gby5FeHByZXNzaW9uW11cbiAgfVtdKSB7XG4gICAgY29uc3Qgc3BhbiA9IGNhbGxzLmxlbmd0aCA/IGNhbGxzWzBdLnNvdXJjZVNwYW4gOiBudWxsO1xuICAgIHRoaXMuX2NyZWF0aW9uQ29kZUZucy5wdXNoKCgpID0+IHtcbiAgICAgIHJldHVybiBjaGFpbmVkSW5zdHJ1Y3Rpb24ocmVmZXJlbmNlLCBjYWxscy5tYXAoY2FsbCA9PiBjYWxsLnBhcmFtcygpKSwgc3BhbikudG9TdG10KCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUluc3RydWN0aW9uV2l0aEFkdmFuY2UoXG4gICAgICBub2RlSW5kZXg6IG51bWJlciwgc3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSxcbiAgICAgIHBhcmFtc09yRm4/OiBvLkV4cHJlc3Npb25bXXwoKCkgPT4gby5FeHByZXNzaW9uW10pKSB7XG4gICAgdGhpcy5hZGRBZHZhbmNlSW5zdHJ1Y3Rpb25JZk5lY2Vzc2FyeShub2RlSW5kZXgsIHNwYW4pO1xuICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb24oc3BhbiwgcmVmZXJlbmNlLCBwYXJhbXNPckZuKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5zdHJ1Y3Rpb24oXG4gICAgICBzcGFuOiBQYXJzZVNvdXJjZVNwYW58bnVsbCwgcmVmZXJlbmNlOiBvLkV4dGVybmFsUmVmZXJlbmNlLFxuICAgICAgcGFyYW1zT3JGbj86IG8uRXhwcmVzc2lvbltdfCgoKSA9PiBvLkV4cHJlc3Npb25bXSkpIHtcbiAgICB0aGlzLmluc3RydWN0aW9uRm4odGhpcy5fdXBkYXRlQ29kZUZucywgc3BhbiwgcmVmZXJlbmNlLCBwYXJhbXNPckZuIHx8IFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5zdHJ1Y3Rpb25DaGFpbihcbiAgICAgIHJlZmVyZW5jZTogby5FeHRlcm5hbFJlZmVyZW5jZSwgYmluZGluZ3M6IENoYWluYWJsZUJpbmRpbmdJbnN0cnVjdGlvbltdKSB7XG4gICAgY29uc3Qgc3BhbiA9IGJpbmRpbmdzLmxlbmd0aCA/IGJpbmRpbmdzWzBdLnNvdXJjZVNwYW4gOiBudWxsO1xuXG4gICAgdGhpcy5fdXBkYXRlQ29kZUZucy5wdXNoKCgpID0+IHtcbiAgICAgIGNvbnN0IGNhbGxzID0gYmluZGluZ3MubWFwKHByb3BlcnR5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBwcm9wZXJ0eS52YWx1ZSgpO1xuICAgICAgICBjb25zdCBmblBhcmFtcyA9IEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBbdmFsdWVdO1xuICAgICAgICBpZiAocHJvcGVydHkucGFyYW1zKSB7XG4gICAgICAgICAgZm5QYXJhbXMucHVzaCguLi5wcm9wZXJ0eS5wYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm9wZXJ0eS5uYW1lKSB7XG4gICAgICAgICAgLy8gV2Ugd2FudCB0aGUgcHJvcGVydHkgbmFtZSB0byBhbHdheXMgYmUgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhcmFtZXRlci5cbiAgICAgICAgICBmblBhcmFtcy51bnNoaWZ0KG8ubGl0ZXJhbChwcm9wZXJ0eS5uYW1lKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZuUGFyYW1zO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBjaGFpbmVkSW5zdHJ1Y3Rpb24ocmVmZXJlbmNlLCBjYWxscywgc3BhbikudG9TdG10KCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUluc3RydWN0aW9uQ2hhaW5XaXRoQWR2YW5jZShcbiAgICAgIG5vZGVJbmRleDogbnVtYmVyLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsIGJpbmRpbmdzOiBDaGFpbmFibGVCaW5kaW5nSW5zdHJ1Y3Rpb25bXSkge1xuICAgIHRoaXMuYWRkQWR2YW5jZUluc3RydWN0aW9uSWZOZWNlc3NhcnkoXG4gICAgICAgIG5vZGVJbmRleCwgYmluZGluZ3MubGVuZ3RoID8gYmluZGluZ3NbMF0uc291cmNlU3BhbiA6IG51bGwpO1xuICAgIHRoaXMudXBkYXRlSW5zdHJ1Y3Rpb25DaGFpbihyZWZlcmVuY2UsIGJpbmRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQWR2YW5jZUluc3RydWN0aW9uSWZOZWNlc3Nhcnkobm9kZUluZGV4OiBudW1iZXIsIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsKSB7XG4gICAgaWYgKG5vZGVJbmRleCAhPT0gdGhpcy5fY3VycmVudEluZGV4KSB7XG4gICAgICBjb25zdCBkZWx0YSA9IG5vZGVJbmRleCAtIHRoaXMuX2N1cnJlbnRJbmRleDtcblxuICAgICAgaWYgKGRlbHRhIDwgMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkdmFuY2UgaW5zdHJ1Y3Rpb24gY2FuIG9ubHkgZ28gZm9yd2FyZHMnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnN0cnVjdGlvbkZuKHRoaXMuX3VwZGF0ZUNvZGVGbnMsIHNwYW4sIFIzLmFkdmFuY2UsIFtvLmxpdGVyYWwoZGVsdGEpXSk7XG4gICAgICB0aGlzLl9jdXJyZW50SW5kZXggPSBub2RlSW5kZXg7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhbGxvY2F0ZVB1cmVGdW5jdGlvblNsb3RzKG51bVNsb3RzOiBudW1iZXIpOiBudW1iZXIge1xuICAgIGNvbnN0IG9yaWdpbmFsU2xvdHMgPSB0aGlzLl9wdXJlRnVuY3Rpb25TbG90cztcbiAgICB0aGlzLl9wdXJlRnVuY3Rpb25TbG90cyArPSBudW1TbG90cztcbiAgICByZXR1cm4gb3JpZ2luYWxTbG90cztcbiAgfVxuXG4gIHByaXZhdGUgYWxsb2NhdGVCaW5kaW5nU2xvdHModmFsdWU6IEFTVHxudWxsKSB7XG4gICAgdGhpcy5fYmluZGluZ1Nsb3RzICs9IHZhbHVlIGluc3RhbmNlb2YgSW50ZXJwb2xhdGlvbiA/IHZhbHVlLmV4cHJlc3Npb25zLmxlbmd0aCA6IDE7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBleHByZXNzaW9uIHRoYXQgcmVmZXJzIHRvIHRoZSBpbXBsaWNpdCByZWNlaXZlci4gVGhlIGltcGxpY2l0XG4gICAqIHJlY2VpdmVyIGlzIGFsd2F5cyB0aGUgcm9vdCBsZXZlbCBjb250ZXh0LlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRJbXBsaWNpdFJlY2VpdmVyRXhwcigpOiBvLlJlYWRWYXJFeHByIHtcbiAgICBpZiAodGhpcy5faW1wbGljaXRSZWNlaXZlckV4cHIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pbXBsaWNpdFJlY2VpdmVyRXhwcjtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5faW1wbGljaXRSZWNlaXZlckV4cHIgPSB0aGlzLmxldmVsID09PSAwID9cbiAgICAgICAgby52YXJpYWJsZShDT05URVhUX05BTUUpIDpcbiAgICAgICAgdGhpcy5fYmluZGluZ1Njb3BlLmdldE9yQ3JlYXRlU2hhcmVkQ29udGV4dFZhcigwKTtcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFByb3BlcnR5QmluZGluZyh2YWx1ZTogQVNUKTogby5FeHByZXNzaW9uIHtcbiAgICBjb25zdCBjb252ZXJ0ZWRQcm9wZXJ0eUJpbmRpbmcgPSBjb252ZXJ0UHJvcGVydHlCaW5kaW5nKFxuICAgICAgICB0aGlzLCB0aGlzLmdldEltcGxpY2l0UmVjZWl2ZXJFeHByKCksIHZhbHVlLCB0aGlzLmJpbmRpbmdDb250ZXh0KCksIEJpbmRpbmdGb3JtLkV4cHJlc3Npb24sXG4gICAgICAgICgpID0+IGVycm9yKCdVbmV4cGVjdGVkIGludGVycG9sYXRpb24nKSk7XG4gICAgY29uc3QgdmFsRXhwciA9IGNvbnZlcnRlZFByb3BlcnR5QmluZGluZy5jdXJyVmFsRXhwcjtcbiAgICB0aGlzLl90ZW1wVmFyaWFibGVzLnB1c2goLi4uY29udmVydGVkUHJvcGVydHlCaW5kaW5nLnN0bXRzKTtcbiAgICByZXR1cm4gdmFsRXhwcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgbGlzdCBvZiBhcmd1bWVudCBleHByZXNzaW9ucyB0byBwYXNzIHRvIGFuIHVwZGF0ZSBpbnN0cnVjdGlvbiBleHByZXNzaW9uLiBBbHNvIHVwZGF0ZXNcbiAgICogdGhlIHRlbXAgdmFyaWFibGVzIHN0YXRlIHdpdGggdGVtcCB2YXJpYWJsZXMgdGhhdCB3ZXJlIGlkZW50aWZpZWQgYXMgbmVlZGluZyB0byBiZSBjcmVhdGVkXG4gICAqIHdoaWxlIHZpc2l0aW5nIHRoZSBhcmd1bWVudHMuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgb3JpZ2luYWwgZXhwcmVzc2lvbiB3ZSB3aWxsIGJlIHJlc29sdmluZyBhbiBhcmd1bWVudHMgbGlzdCBmcm9tLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRVcGRhdGVJbnN0cnVjdGlvbkFyZ3VtZW50cyh2YWx1ZTogQVNUKTogby5FeHByZXNzaW9uW10ge1xuICAgIGNvbnN0IHthcmdzLCBzdG10c30gPVxuICAgICAgICBjb252ZXJ0VXBkYXRlQXJndW1lbnRzKHRoaXMsIHRoaXMuZ2V0SW1wbGljaXRSZWNlaXZlckV4cHIoKSwgdmFsdWUsIHRoaXMuYmluZGluZ0NvbnRleHQoKSk7XG5cbiAgICB0aGlzLl90ZW1wVmFyaWFibGVzLnB1c2goLi4uc3RtdHMpO1xuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgcHJpdmF0ZSBtYXRjaERpcmVjdGl2ZXMoZWxlbWVudE5hbWU6IHN0cmluZywgZWxPclRwbDogdC5FbGVtZW50fHQuVGVtcGxhdGUpIHtcbiAgICBpZiAodGhpcy5kaXJlY3RpdmVNYXRjaGVyKSB7XG4gICAgICBjb25zdCBzZWxlY3RvciA9IGNyZWF0ZUNzc1NlbGVjdG9yKGVsZW1lbnROYW1lLCBnZXRBdHRyc0ZvckRpcmVjdGl2ZU1hdGNoaW5nKGVsT3JUcGwpKTtcbiAgICAgIHRoaXMuZGlyZWN0aXZlTWF0Y2hlci5tYXRjaChzZWxlY3RvciwgKGNzc1NlbGVjdG9yLCBzdGF0aWNUeXBlKSA9PiB7XG4gICAgICAgIHRoaXMuZGlyZWN0aXZlcy5hZGQoc3RhdGljVHlwZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJlcGFyZXMgYWxsIGF0dHJpYnV0ZSBleHByZXNzaW9uIHZhbHVlcyBmb3IgdGhlIGBUQXR0cmlidXRlc2AgYXJyYXkuXG4gICAqXG4gICAqIFRoZSBwdXJwb3NlIG9mIHRoaXMgZnVuY3Rpb24gaXMgdG8gcHJvcGVybHkgY29uc3RydWN0IGFuIGF0dHJpYnV0ZXMgYXJyYXkgdGhhdFxuICAgKiBpcyBwYXNzZWQgaW50byB0aGUgYGVsZW1lbnRTdGFydGAgKG9yIGp1c3QgYGVsZW1lbnRgKSBmdW5jdGlvbnMuIEJlY2F1c2UgdGhlcmVcbiAgICogYXJlIG1hbnkgZGlmZmVyZW50IHR5cGVzIG9mIGF0dHJpYnV0ZXMsIHRoZSBhcnJheSBuZWVkcyB0byBiZSBjb25zdHJ1Y3RlZCBpbiBhXG4gICAqIHNwZWNpYWwgd2F5IHNvIHRoYXQgYGVsZW1lbnRTdGFydGAgY2FuIHByb3Blcmx5IGV2YWx1YXRlIHRoZW0uXG4gICAqXG4gICAqIFRoZSBmb3JtYXQgbG9va3MgbGlrZSB0aGlzOlxuICAgKlxuICAgKiBgYGBcbiAgICogYXR0cnMgPSBbcHJvcCwgdmFsdWUsIHByb3AyLCB2YWx1ZTIsXG4gICAqICAgUFJPSkVDVF9BUywgc2VsZWN0b3IsXG4gICAqICAgQ0xBU1NFUywgY2xhc3MxLCBjbGFzczIsXG4gICAqICAgU1RZTEVTLCBzdHlsZTEsIHZhbHVlMSwgc3R5bGUyLCB2YWx1ZTIsXG4gICAqICAgQklORElOR1MsIG5hbWUxLCBuYW1lMiwgbmFtZTMsXG4gICAqICAgVEVNUExBVEUsIG5hbWU0LCBuYW1lNSwgbmFtZTYsXG4gICAqICAgSTE4TiwgbmFtZTcsIG5hbWU4LCAuLi5dXG4gICAqIGBgYFxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiB3aWxsIGZ1bGx5IGlnbm9yZSBhbGwgc3ludGhldGljIChAZm9vKSBhdHRyaWJ1dGUgdmFsdWVzXG4gICAqIGJlY2F1c2UgdGhvc2UgdmFsdWVzIGFyZSBpbnRlbmRlZCB0byBhbHdheXMgYmUgZ2VuZXJhdGVkIGFzIHByb3BlcnR5IGluc3RydWN0aW9ucy5cbiAgICovXG4gIHByaXZhdGUgZ2V0QXR0cmlidXRlRXhwcmVzc2lvbnMoXG4gICAgICBlbGVtZW50TmFtZTogc3RyaW5nLCByZW5kZXJBdHRyaWJ1dGVzOiB0LlRleHRBdHRyaWJ1dGVbXSwgaW5wdXRzOiB0LkJvdW5kQXR0cmlidXRlW10sXG4gICAgICBvdXRwdXRzOiB0LkJvdW5kRXZlbnRbXSwgc3R5bGVzPzogU3R5bGluZ0J1aWxkZXIsXG4gICAgICB0ZW1wbGF0ZUF0dHJzOiAodC5Cb3VuZEF0dHJpYnV0ZXx0LlRleHRBdHRyaWJ1dGUpW10gPSBbXSxcbiAgICAgIGJvdW5kSTE4bkF0dHJzOiB0LkJvdW5kQXR0cmlidXRlW10gPSBbXSk6IG8uRXhwcmVzc2lvbltdIHtcbiAgICBjb25zdCBhbHJlYWR5U2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgIGNvbnN0IGF0dHJFeHByczogby5FeHByZXNzaW9uW10gPSBbXTtcbiAgICBsZXQgbmdQcm9qZWN0QXNBdHRyOiB0LlRleHRBdHRyaWJ1dGV8dW5kZWZpbmVkO1xuXG4gICAgZm9yIChjb25zdCBhdHRyIG9mIHJlbmRlckF0dHJpYnV0ZXMpIHtcbiAgICAgIGlmIChhdHRyLm5hbWUgPT09IE5HX1BST0pFQ1RfQVNfQVRUUl9OQU1FKSB7XG4gICAgICAgIG5nUHJvamVjdEFzQXR0ciA9IGF0dHI7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vdGUgdGhhdCBzdGF0aWMgaTE4biBhdHRyaWJ1dGVzIGFyZW4ndCBpbiB0aGUgaTE4biBhcnJheSxcbiAgICAgIC8vIGJlY2F1c2UgdGhleSdyZSB0cmVhdGVkIGluIHRoZSBzYW1lIHdheSBhcyByZWd1bGFyIGF0dHJpYnV0ZXMuXG4gICAgICBpZiAoYXR0ci5pMThuKSB7XG4gICAgICAgIGF0dHJFeHBycy5wdXNoKG8ubGl0ZXJhbChhdHRyLm5hbWUpLCB0aGlzLmkxOG5UcmFuc2xhdGUoYXR0ci5pMThuIGFzIGkxOG4uTWVzc2FnZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0ckV4cHJzLnB1c2goXG4gICAgICAgICAgICAuLi5nZXRBdHRyaWJ1dGVOYW1lTGl0ZXJhbHMoYXR0ci5uYW1lKSwgdHJ1c3RlZENvbnN0QXR0cmlidXRlKGVsZW1lbnROYW1lLCBhdHRyKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gS2VlcCBuZ1Byb2plY3RBcyBuZXh0IHRvIHRoZSBvdGhlciBuYW1lLCB2YWx1ZSBwYWlycyBzbyB3ZSBjYW4gdmVyaWZ5IHRoYXQgd2UgbWF0Y2hcbiAgICAvLyBuZ1Byb2plY3RBcyBtYXJrZXIgaW4gdGhlIGF0dHJpYnV0ZSBuYW1lIHNsb3QuXG4gICAgaWYgKG5nUHJvamVjdEFzQXR0cikge1xuICAgICAgYXR0ckV4cHJzLnB1c2goLi4uZ2V0TmdQcm9qZWN0QXNMaXRlcmFsKG5nUHJvamVjdEFzQXR0cikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEF0dHJFeHByKGtleTogc3RyaW5nfG51bWJlciwgdmFsdWU/OiBvLkV4cHJlc3Npb24pOiB2b2lkIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgICAgICBpZiAoIWFscmVhZHlTZWVuLmhhcyhrZXkpKSB7XG4gICAgICAgICAgYXR0ckV4cHJzLnB1c2goLi4uZ2V0QXR0cmlidXRlTmFtZUxpdGVyYWxzKGtleSkpO1xuICAgICAgICAgIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgYXR0ckV4cHJzLnB1c2godmFsdWUpO1xuICAgICAgICAgIGFscmVhZHlTZWVuLmFkZChrZXkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyRXhwcnMucHVzaChvLmxpdGVyYWwoa2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaXQncyBpbXBvcnRhbnQgdGhhdCB0aGlzIG9jY3VycyBiZWZvcmUgQklORElOR1MgYW5kIFRFTVBMQVRFIGJlY2F1c2Ugb25jZSBgZWxlbWVudFN0YXJ0YFxuICAgIC8vIGNvbWVzIGFjcm9zcyB0aGUgQklORElOR1Mgb3IgVEVNUExBVEUgbWFya2VycyB0aGVuIGl0IHdpbGwgY29udGludWUgcmVhZGluZyBlYWNoIHZhbHVlIGFzXG4gICAgLy8gYXMgc2luZ2xlIHByb3BlcnR5IHZhbHVlIGNlbGwgYnkgY2VsbC5cbiAgICBpZiAoc3R5bGVzKSB7XG4gICAgICBzdHlsZXMucG9wdWxhdGVJbml0aWFsU3R5bGluZ0F0dHJzKGF0dHJFeHBycyk7XG4gICAgfVxuXG4gICAgaWYgKGlucHV0cy5sZW5ndGggfHwgb3V0cHV0cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGF0dHJzTGVuZ3RoQmVmb3JlSW5wdXRzID0gYXR0ckV4cHJzLmxlbmd0aDtcblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5wdXQgPSBpbnB1dHNbaV07XG4gICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdGhlIGFuaW1hdGlvbiBhbmQgYXR0cmlidXRlIGJpbmRpbmdzIGluIHRoZVxuICAgICAgICAvLyBhdHRyaWJ1dGVzIGFycmF5IHNpbmNlIHRoZXkgYXJlbid0IHVzZWQgZm9yIGRpcmVjdGl2ZSBtYXRjaGluZy5cbiAgICAgICAgaWYgKGlucHV0LnR5cGUgIT09IEJpbmRpbmdUeXBlLkFuaW1hdGlvbiAmJiBpbnB1dC50eXBlICE9PSBCaW5kaW5nVHlwZS5BdHRyaWJ1dGUpIHtcbiAgICAgICAgICBhZGRBdHRyRXhwcihpbnB1dC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0ID0gb3V0cHV0c1tpXTtcbiAgICAgICAgaWYgKG91dHB1dC50eXBlICE9PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uKSB7XG4gICAgICAgICAgYWRkQXR0ckV4cHIob3V0cHV0Lm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHRoaXMgaXMgYSBjaGVhcCB3YXkgb2YgYWRkaW5nIHRoZSBtYXJrZXIgb25seSBhZnRlciBhbGwgdGhlIGlucHV0L291dHB1dFxuICAgICAgLy8gdmFsdWVzIGhhdmUgYmVlbiBmaWx0ZXJlZCAoYnkgbm90IGluY2x1ZGluZyB0aGUgYW5pbWF0aW9uIG9uZXMpIGFuZCBhZGRlZFxuICAgICAgLy8gdG8gdGhlIGV4cHJlc3Npb25zLiBUaGUgbWFya2VyIGlzIGltcG9ydGFudCBiZWNhdXNlIGl0IHRlbGxzIHRoZSBydW50aW1lXG4gICAgICAvLyBjb2RlIHRoYXQgdGhpcyBpcyB3aGVyZSBhdHRyaWJ1dGVzIHdpdGhvdXQgdmFsdWVzIHN0YXJ0Li4uXG4gICAgICBpZiAoYXR0ckV4cHJzLmxlbmd0aCAhPT0gYXR0cnNMZW5ndGhCZWZvcmVJbnB1dHMpIHtcbiAgICAgICAgYXR0ckV4cHJzLnNwbGljZShhdHRyc0xlbmd0aEJlZm9yZUlucHV0cywgMCwgby5saXRlcmFsKGNvcmUuQXR0cmlidXRlTWFya2VyLkJpbmRpbmdzKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRlbXBsYXRlQXR0cnMubGVuZ3RoKSB7XG4gICAgICBhdHRyRXhwcnMucHVzaChvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuVGVtcGxhdGUpKTtcbiAgICAgIHRlbXBsYXRlQXR0cnMuZm9yRWFjaChhdHRyID0+IGFkZEF0dHJFeHByKGF0dHIubmFtZSkpO1xuICAgIH1cblxuICAgIGlmIChib3VuZEkxOG5BdHRycy5sZW5ndGgpIHtcbiAgICAgIGF0dHJFeHBycy5wdXNoKG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5JMThuKSk7XG4gICAgICBib3VuZEkxOG5BdHRycy5mb3JFYWNoKGF0dHIgPT4gYWRkQXR0ckV4cHIoYXR0ci5uYW1lKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJFeHBycztcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9Db25zdHMoZXhwcmVzc2lvbjogby5FeHByZXNzaW9uKTogby5MaXRlcmFsRXhwciB7XG4gICAgaWYgKG8uaXNOdWxsKGV4cHJlc3Npb24pKSB7XG4gICAgICByZXR1cm4gby5UWVBFRF9OVUxMX0VYUFI7XG4gICAgfVxuXG4gICAgY29uc3QgY29uc3RzID0gdGhpcy5fY29uc3RhbnRzLmNvbnN0RXhwcmVzc2lvbnM7XG5cbiAgICAvLyBUcnkgdG8gcmV1c2UgYSBsaXRlcmFsIHRoYXQncyBhbHJlYWR5IGluIHRoZSBhcnJheSwgaWYgcG9zc2libGUuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb25zdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChjb25zdHNbaV0uaXNFcXVpdmFsZW50KGV4cHJlc3Npb24pKSB7XG4gICAgICAgIHJldHVybiBvLmxpdGVyYWwoaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG8ubGl0ZXJhbChjb25zdHMucHVzaChleHByZXNzaW9uKSAtIDEpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRBdHRyc1RvQ29uc3RzKGF0dHJzOiBvLkV4cHJlc3Npb25bXSk6IG8uTGl0ZXJhbEV4cHIge1xuICAgIHJldHVybiBhdHRycy5sZW5ndGggPiAwID8gdGhpcy5hZGRUb0NvbnN0cyhvLmxpdGVyYWxBcnIoYXR0cnMpKSA6IG8uVFlQRURfTlVMTF9FWFBSO1xuICB9XG5cbiAgcHJpdmF0ZSBwcmVwYXJlUmVmc0FycmF5KHJlZmVyZW5jZXM6IHQuUmVmZXJlbmNlW10pOiBvLkV4cHJlc3Npb24ge1xuICAgIGlmICghcmVmZXJlbmNlcyB8fCByZWZlcmVuY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG8uVFlQRURfTlVMTF9FWFBSO1xuICAgIH1cblxuICAgIGNvbnN0IHJlZnNQYXJhbSA9IGZsYXR0ZW4ocmVmZXJlbmNlcy5tYXAocmVmZXJlbmNlID0+IHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLmFsbG9jYXRlRGF0YVNsb3QoKTtcbiAgICAgIC8vIEdlbmVyYXRlIHRoZSB1cGRhdGUgdGVtcG9yYXJ5LlxuICAgICAgY29uc3QgdmFyaWFibGVOYW1lID0gdGhpcy5fYmluZGluZ1Njb3BlLmZyZXNoUmVmZXJlbmNlTmFtZSgpO1xuICAgICAgY29uc3QgcmV0cmlldmFsTGV2ZWwgPSB0aGlzLmxldmVsO1xuICAgICAgY29uc3QgbGhzID0gby52YXJpYWJsZSh2YXJpYWJsZU5hbWUpO1xuICAgICAgdGhpcy5fYmluZGluZ1Njb3BlLnNldChcbiAgICAgICAgICByZXRyaWV2YWxMZXZlbCwgcmVmZXJlbmNlLm5hbWUsIGxocyxcbiAgICAgICAgICBEZWNsYXJhdGlvblByaW9yaXR5LkRFRkFVTFQsIChzY29wZTogQmluZGluZ1Njb3BlLCByZWxhdGl2ZUxldmVsOiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIC8vIGUuZy4gbmV4dENvbnRleHQoMik7XG4gICAgICAgICAgICBjb25zdCBuZXh0Q29udGV4dFN0bXQgPVxuICAgICAgICAgICAgICAgIHJlbGF0aXZlTGV2ZWwgPiAwID8gW2dlbmVyYXRlTmV4dENvbnRleHRFeHByKHJlbGF0aXZlTGV2ZWwpLnRvU3RtdCgpXSA6IFtdO1xuXG4gICAgICAgICAgICAvLyBlLmcuIGNvbnN0ICRmb28kID0gcmVmZXJlbmNlKDEpO1xuICAgICAgICAgICAgY29uc3QgcmVmRXhwciA9IGxocy5zZXQoby5pbXBvcnRFeHByKFIzLnJlZmVyZW5jZSkuY2FsbEZuKFtvLmxpdGVyYWwoc2xvdCldKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dENvbnRleHRTdG10LmNvbmNhdChyZWZFeHByLnRvQ29uc3REZWNsKCkpO1xuICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgcmV0dXJuIFtyZWZlcmVuY2UubmFtZSwgcmVmZXJlbmNlLnZhbHVlXTtcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gYXNMaXRlcmFsKHJlZnNQYXJhbSk7XG4gIH1cblxuICBwcml2YXRlIHByZXBhcmVMaXN0ZW5lclBhcmFtZXRlcih0YWdOYW1lOiBzdHJpbmcsIG91dHB1dEFzdDogdC5Cb3VuZEV2ZW50LCBpbmRleDogbnVtYmVyKTpcbiAgICAgICgpID0+IG8uRXhwcmVzc2lvbltdIHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgZXZlbnROYW1lOiBzdHJpbmcgPSBvdXRwdXRBc3QubmFtZTtcbiAgICAgIGNvbnN0IGJpbmRpbmdGbk5hbWUgPSBvdXRwdXRBc3QudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLkFuaW1hdGlvbiA/XG4gICAgICAgICAgLy8gc3ludGhldGljIEBsaXN0ZW5lci5mb28gdmFsdWVzIGFyZSB0cmVhdGVkIHRoZSBleGFjdCBzYW1lIGFzIGFyZSBzdGFuZGFyZCBsaXN0ZW5lcnNcbiAgICAgICAgICBwcmVwYXJlU3ludGhldGljTGlzdGVuZXJGdW5jdGlvbk5hbWUoZXZlbnROYW1lLCBvdXRwdXRBc3QucGhhc2UhKSA6XG4gICAgICAgICAgc2FuaXRpemVJZGVudGlmaWVyKGV2ZW50TmFtZSk7XG4gICAgICBjb25zdCBoYW5kbGVyTmFtZSA9IGAke3RoaXMudGVtcGxhdGVOYW1lfV8ke3RhZ05hbWV9XyR7YmluZGluZ0ZuTmFtZX1fJHtpbmRleH1fbGlzdGVuZXJgO1xuICAgICAgY29uc3Qgc2NvcGUgPSB0aGlzLl9iaW5kaW5nU2NvcGUubmVzdGVkU2NvcGUoXG4gICAgICAgICAgdGhpcy5fYmluZGluZ1Njb3BlLmJpbmRpbmdMZXZlbCwgRVZFTlRfQklORElOR19TQ09QRV9HTE9CQUxTKTtcbiAgICAgIHJldHVybiBwcmVwYXJlRXZlbnRMaXN0ZW5lclBhcmFtZXRlcnMob3V0cHV0QXN0LCBoYW5kbGVyTmFtZSwgc2NvcGUpO1xuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhbHVlQ29udmVydGVyIGV4dGVuZHMgQXN0TWVtb3J5RWZmaWNpZW50VHJhbnNmb3JtZXIge1xuICBwcml2YXRlIF9waXBlQmluZEV4cHJzOiBGdW5jdGlvbkNhbGxbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBjb25zdGFudFBvb2w6IENvbnN0YW50UG9vbCwgcHJpdmF0ZSBhbGxvY2F0ZVNsb3Q6ICgpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90czogKG51bVNsb3RzOiBudW1iZXIpID0+IG51bWJlcixcbiAgICAgIHByaXZhdGUgZGVmaW5lUGlwZTpcbiAgICAgICAgICAobmFtZTogc3RyaW5nLCBsb2NhbE5hbWU6IHN0cmluZywgc2xvdDogbnVtYmVyLCB2YWx1ZTogby5FeHByZXNzaW9uKSA9PiB2b2lkKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIC8vIEFzdE1lbW9yeUVmZmljaWVudFRyYW5zZm9ybWVyXG4gIHZpc2l0UGlwZShwaXBlOiBCaW5kaW5nUGlwZSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICAvLyBBbGxvY2F0ZSBhIHNsb3QgdG8gY3JlYXRlIHRoZSBwaXBlXG4gICAgY29uc3Qgc2xvdCA9IHRoaXMuYWxsb2NhdGVTbG90KCk7XG4gICAgY29uc3Qgc2xvdFBzZXVkb0xvY2FsID0gYFBJUEU6JHtzbG90fWA7XG4gICAgLy8gQWxsb2NhdGUgb25lIHNsb3QgZm9yIHRoZSByZXN1bHQgcGx1cyBvbmUgc2xvdCBwZXIgcGlwZSBhcmd1bWVudFxuICAgIGNvbnN0IHB1cmVGdW5jdGlvblNsb3QgPSB0aGlzLmFsbG9jYXRlUHVyZUZ1bmN0aW9uU2xvdHMoMiArIHBpcGUuYXJncy5sZW5ndGgpO1xuICAgIGNvbnN0IHRhcmdldCA9IG5ldyBQcm9wZXJ0eVJlYWQoXG4gICAgICAgIHBpcGUuc3BhbiwgcGlwZS5zb3VyY2VTcGFuLCBwaXBlLm5hbWVTcGFuLCBuZXcgSW1wbGljaXRSZWNlaXZlcihwaXBlLnNwYW4sIHBpcGUuc291cmNlU3BhbiksXG4gICAgICAgIHNsb3RQc2V1ZG9Mb2NhbCk7XG4gICAgY29uc3Qge2lkZW50aWZpZXIsIGlzVmFyTGVuZ3RofSA9IHBpcGVCaW5kaW5nQ2FsbEluZm8ocGlwZS5hcmdzKTtcbiAgICB0aGlzLmRlZmluZVBpcGUocGlwZS5uYW1lLCBzbG90UHNldWRvTG9jYWwsIHNsb3QsIG8uaW1wb3J0RXhwcihpZGVudGlmaWVyKSk7XG4gICAgY29uc3QgYXJnczogQVNUW10gPSBbcGlwZS5leHAsIC4uLnBpcGUuYXJnc107XG4gICAgY29uc3QgY29udmVydGVkQXJnczogQVNUW10gPSBpc1Zhckxlbmd0aCA/XG4gICAgICAgIHRoaXMudmlzaXRBbGwoW25ldyBMaXRlcmFsQXJyYXkocGlwZS5zcGFuLCBwaXBlLnNvdXJjZVNwYW4sIGFyZ3MpXSkgOlxuICAgICAgICB0aGlzLnZpc2l0QWxsKGFyZ3MpO1xuXG4gICAgY29uc3QgcGlwZUJpbmRFeHByID0gbmV3IEZ1bmN0aW9uQ2FsbChwaXBlLnNwYW4sIHBpcGUuc291cmNlU3BhbiwgdGFyZ2V0LCBbXG4gICAgICBuZXcgTGl0ZXJhbFByaW1pdGl2ZShwaXBlLnNwYW4sIHBpcGUuc291cmNlU3Bhbiwgc2xvdCksXG4gICAgICBuZXcgTGl0ZXJhbFByaW1pdGl2ZShwaXBlLnNwYW4sIHBpcGUuc291cmNlU3BhbiwgcHVyZUZ1bmN0aW9uU2xvdCksXG4gICAgICAuLi5jb252ZXJ0ZWRBcmdzLFxuICAgIF0pO1xuICAgIHRoaXMuX3BpcGVCaW5kRXhwcnMucHVzaChwaXBlQmluZEV4cHIpO1xuICAgIHJldHVybiBwaXBlQmluZEV4cHI7XG4gIH1cblxuICB1cGRhdGVQaXBlU2xvdE9mZnNldHMoYmluZGluZ1Nsb3RzOiBudW1iZXIpIHtcbiAgICB0aGlzLl9waXBlQmluZEV4cHJzLmZvckVhY2goKHBpcGU6IEZ1bmN0aW9uQ2FsbCkgPT4ge1xuICAgICAgLy8gdXBkYXRlIHRoZSBzbG90IG9mZnNldCBhcmcgKGluZGV4IDEpIHRvIGFjY291bnQgZm9yIGJpbmRpbmcgc2xvdHNcbiAgICAgIGNvbnN0IHNsb3RPZmZzZXQgPSBwaXBlLmFyZ3NbMV0gYXMgTGl0ZXJhbFByaW1pdGl2ZTtcbiAgICAgIChzbG90T2Zmc2V0LnZhbHVlIGFzIG51bWJlcikgKz0gYmluZGluZ1Nsb3RzO1xuICAgIH0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXJyYXk6IExpdGVyYWxBcnJheSwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwoXG4gICAgICAgIGFycmF5LnNwYW4sIGFycmF5LnNvdXJjZVNwYW4sIHRoaXMudmlzaXRBbGwoYXJyYXkuZXhwcmVzc2lvbnMpLCB2YWx1ZXMgPT4ge1xuICAgICAgICAgIC8vIElmIHRoZSBsaXRlcmFsIGhhcyBjYWxjdWxhdGVkIChub24tbGl0ZXJhbCkgZWxlbWVudHMgdHJhbnNmb3JtIGl0IGludG9cbiAgICAgICAgICAvLyBjYWxscyB0byBsaXRlcmFsIGZhY3RvcmllcyB0aGF0IGNvbXBvc2UgdGhlIGxpdGVyYWwgYW5kIHdpbGwgY2FjaGUgaW50ZXJtZWRpYXRlXG4gICAgICAgICAgLy8gdmFsdWVzLlxuICAgICAgICAgIGNvbnN0IGxpdGVyYWwgPSBvLmxpdGVyYWxBcnIodmFsdWVzKTtcbiAgICAgICAgICByZXR1cm4gZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5jb25zdGFudFBvb2wsIGxpdGVyYWwsIHRoaXMuYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90cyk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgdmlzaXRMaXRlcmFsTWFwKG1hcDogTGl0ZXJhbE1hcCwgY29udGV4dDogYW55KTogQVNUIHtcbiAgICByZXR1cm4gbmV3IEJ1aWx0aW5GdW5jdGlvbkNhbGwobWFwLnNwYW4sIG1hcC5zb3VyY2VTcGFuLCB0aGlzLnZpc2l0QWxsKG1hcC52YWx1ZXMpLCB2YWx1ZXMgPT4ge1xuICAgICAgLy8gSWYgdGhlIGxpdGVyYWwgaGFzIGNhbGN1bGF0ZWQgKG5vbi1saXRlcmFsKSBlbGVtZW50cyAgdHJhbnNmb3JtIGl0IGludG9cbiAgICAgIC8vIGNhbGxzIHRvIGxpdGVyYWwgZmFjdG9yaWVzIHRoYXQgY29tcG9zZSB0aGUgbGl0ZXJhbCBhbmQgd2lsbCBjYWNoZSBpbnRlcm1lZGlhdGVcbiAgICAgIC8vIHZhbHVlcy5cbiAgICAgIGNvbnN0IGxpdGVyYWwgPSBvLmxpdGVyYWxNYXAodmFsdWVzLm1hcChcbiAgICAgICAgICAodmFsdWUsIGluZGV4KSA9PiAoe2tleTogbWFwLmtleXNbaW5kZXhdLmtleSwgdmFsdWUsIHF1b3RlZDogbWFwLmtleXNbaW5kZXhdLnF1b3RlZH0pKSk7XG4gICAgICByZXR1cm4gZ2V0TGl0ZXJhbEZhY3RvcnkodGhpcy5jb25zdGFudFBvb2wsIGxpdGVyYWwsIHRoaXMuYWxsb2NhdGVQdXJlRnVuY3Rpb25TbG90cyk7XG4gICAgfSk7XG4gIH1cbn1cblxuLy8gUGlwZXMgYWx3YXlzIGhhdmUgYXQgbGVhc3Qgb25lIHBhcmFtZXRlciwgdGhlIHZhbHVlIHRoZXkgb3BlcmF0ZSBvblxuY29uc3QgcGlwZUJpbmRpbmdJZGVudGlmaWVycyA9IFtSMy5waXBlQmluZDEsIFIzLnBpcGVCaW5kMiwgUjMucGlwZUJpbmQzLCBSMy5waXBlQmluZDRdO1xuXG5mdW5jdGlvbiBwaXBlQmluZGluZ0NhbGxJbmZvKGFyZ3M6IG8uRXhwcmVzc2lvbltdKSB7XG4gIGNvbnN0IGlkZW50aWZpZXIgPSBwaXBlQmluZGluZ0lkZW50aWZpZXJzW2FyZ3MubGVuZ3RoXTtcbiAgcmV0dXJuIHtcbiAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyIHx8IFIzLnBpcGVCaW5kVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmNvbnN0IHB1cmVGdW5jdGlvbklkZW50aWZpZXJzID0gW1xuICBSMy5wdXJlRnVuY3Rpb24wLCBSMy5wdXJlRnVuY3Rpb24xLCBSMy5wdXJlRnVuY3Rpb24yLCBSMy5wdXJlRnVuY3Rpb24zLCBSMy5wdXJlRnVuY3Rpb240LFxuICBSMy5wdXJlRnVuY3Rpb241LCBSMy5wdXJlRnVuY3Rpb242LCBSMy5wdXJlRnVuY3Rpb243LCBSMy5wdXJlRnVuY3Rpb244XG5dO1xuXG5mdW5jdGlvbiBwdXJlRnVuY3Rpb25DYWxsSW5mbyhhcmdzOiBvLkV4cHJlc3Npb25bXSkge1xuICBjb25zdCBpZGVudGlmaWVyID0gcHVyZUZ1bmN0aW9uSWRlbnRpZmllcnNbYXJncy5sZW5ndGhdO1xuICByZXR1cm4ge1xuICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIgfHwgUjMucHVyZUZ1bmN0aW9uVixcbiAgICBpc1Zhckxlbmd0aDogIWlkZW50aWZpZXIsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGluc3RydWN0aW9uKFxuICAgIHNwYW46IFBhcnNlU291cmNlU3BhbnxudWxsLCByZWZlcmVuY2U6IG8uRXh0ZXJuYWxSZWZlcmVuY2UsXG4gICAgcGFyYW1zOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmltcG9ydEV4cHIocmVmZXJlbmNlLCBudWxsLCBzcGFuKS5jYWxsRm4ocGFyYW1zLCBzcGFuKTtcbn1cblxuLy8gZS5nLiB4KDIpO1xuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0Q29udGV4dEV4cHIocmVsYXRpdmVMZXZlbERpZmY6IG51bWJlcik6IG8uRXhwcmVzc2lvbiB7XG4gIHJldHVybiBvLmltcG9ydEV4cHIoUjMubmV4dENvbnRleHQpXG4gICAgICAuY2FsbEZuKHJlbGF0aXZlTGV2ZWxEaWZmID4gMSA/IFtvLmxpdGVyYWwocmVsYXRpdmVMZXZlbERpZmYpXSA6IFtdKTtcbn1cblxuZnVuY3Rpb24gZ2V0TGl0ZXJhbEZhY3RvcnkoXG4gICAgY29uc3RhbnRQb29sOiBDb25zdGFudFBvb2wsIGxpdGVyYWw6IG8uTGl0ZXJhbEFycmF5RXhwcnxvLkxpdGVyYWxNYXBFeHByLFxuICAgIGFsbG9jYXRlU2xvdHM6IChudW1TbG90czogbnVtYmVyKSA9PiBudW1iZXIpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB7bGl0ZXJhbEZhY3RvcnksIGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzfSA9IGNvbnN0YW50UG9vbC5nZXRMaXRlcmFsRmFjdG9yeShsaXRlcmFsKTtcbiAgLy8gQWxsb2NhdGUgMSBzbG90IGZvciB0aGUgcmVzdWx0IHBsdXMgMSBwZXIgYXJndW1lbnRcbiAgY29uc3Qgc3RhcnRTbG90ID0gYWxsb2NhdGVTbG90cygxICsgbGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMubGVuZ3RoKTtcbiAgY29uc3Qge2lkZW50aWZpZXIsIGlzVmFyTGVuZ3RofSA9IHB1cmVGdW5jdGlvbkNhbGxJbmZvKGxpdGVyYWxGYWN0b3J5QXJndW1lbnRzKTtcblxuICAvLyBMaXRlcmFsIGZhY3RvcmllcyBhcmUgcHVyZSBmdW5jdGlvbnMgdGhhdCBvbmx5IG5lZWQgdG8gYmUgcmUtaW52b2tlZCB3aGVuIHRoZSBwYXJhbWV0ZXJzXG4gIC8vIGNoYW5nZS5cbiAgY29uc3QgYXJncyA9IFtvLmxpdGVyYWwoc3RhcnRTbG90KSwgbGl0ZXJhbEZhY3RvcnldO1xuXG4gIGlmIChpc1Zhckxlbmd0aCkge1xuICAgIGFyZ3MucHVzaChvLmxpdGVyYWxBcnIobGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpKTtcbiAgfSBlbHNlIHtcbiAgICBhcmdzLnB1c2goLi4ubGl0ZXJhbEZhY3RvcnlBcmd1bWVudHMpO1xuICB9XG5cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihpZGVudGlmaWVyKS5jYWxsRm4oYXJncyk7XG59XG5cbi8qKlxuICogR2V0cyBhbiBhcnJheSBvZiBsaXRlcmFscyB0aGF0IGNhbiBiZSBhZGRlZCB0byBhbiBleHByZXNzaW9uXG4gKiB0byByZXByZXNlbnQgdGhlIG5hbWUgYW5kIG5hbWVzcGFjZSBvZiBhbiBhdHRyaWJ1dGUuIEUuZy5cbiAqIGA6eGxpbms6aHJlZmAgdHVybnMgaW50byBgW0F0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkksICd4bGluaycsICdocmVmJ11gLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGF0dHJpYnV0ZSwgaW5jbHVkaW5nIHRoZSBuYW1lc3BhY2UuXG4gKi9cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZU5hbWVMaXRlcmFscyhuYW1lOiBzdHJpbmcpOiBvLkxpdGVyYWxFeHByW10ge1xuICBjb25zdCBbYXR0cmlidXRlTmFtZXNwYWNlLCBhdHRyaWJ1dGVOYW1lXSA9IHNwbGl0TnNOYW1lKG5hbWUpO1xuICBjb25zdCBuYW1lTGl0ZXJhbCA9IG8ubGl0ZXJhbChhdHRyaWJ1dGVOYW1lKTtcblxuICBpZiAoYXR0cmlidXRlTmFtZXNwYWNlKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG8ubGl0ZXJhbChjb3JlLkF0dHJpYnV0ZU1hcmtlci5OYW1lc3BhY2VVUkkpLCBvLmxpdGVyYWwoYXR0cmlidXRlTmFtZXNwYWNlKSwgbmFtZUxpdGVyYWxcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIFtuYW1lTGl0ZXJhbF07XG59XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbmV2ZXIgYSB2YXJpYWJsZSBpcyByZWZlcmVuY2VkIGZvciB0aGUgZmlyc3QgdGltZSBpbiBhIGdpdmVuXG4gKiBzY29wZS5cbiAqXG4gKiBJdCBpcyBleHBlY3RlZCB0aGF0IHRoZSBmdW5jdGlvbiBjcmVhdGVzIHRoZSBgY29uc3QgbG9jYWxOYW1lID0gZXhwcmVzc2lvbmA7IHN0YXRlbWVudC5cbiAqL1xuZXhwb3J0IHR5cGUgRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2sgPSAoc2NvcGU6IEJpbmRpbmdTY29wZSwgcmVsYXRpdmVMZXZlbDogbnVtYmVyKSA9PiBvLlN0YXRlbWVudFtdO1xuXG4vKiogVGhlIHByZWZpeCB1c2VkIHRvIGdldCBhIHNoYXJlZCBjb250ZXh0IGluIEJpbmRpbmdTY29wZSdzIG1hcC4gKi9cbmNvbnN0IFNIQVJFRF9DT05URVhUX0tFWSA9ICckJHNoYXJlZF9jdHgkJCc7XG5cbi8qKlxuICogVGhpcyBpcyB1c2VkIHdoZW4gb25lIHJlZmVycyB0byB2YXJpYWJsZSBzdWNoIGFzOiAnbGV0IGFiYyA9IG5leHRDb250ZXh0KDIpLiRpbXBsaWNpdGAuXG4gKiAtIGtleSB0byB0aGUgbWFwIGlzIHRoZSBzdHJpbmcgbGl0ZXJhbCBgXCJhYmNcImAuXG4gKiAtIHZhbHVlIGByZXRyaWV2YWxMZXZlbGAgaXMgdGhlIGxldmVsIGZyb20gd2hpY2ggdGhpcyB2YWx1ZSBjYW4gYmUgcmV0cmlldmVkLCB3aGljaCBpcyAyIGxldmVsc1xuICogdXAgaW4gZXhhbXBsZS5cbiAqIC0gdmFsdWUgYGxoc2AgaXMgdGhlIGxlZnQgaGFuZCBzaWRlIHdoaWNoIGlzIGFuIEFTVCByZXByZXNlbnRpbmcgYGFiY2AuXG4gKiAtIHZhbHVlIGBkZWNsYXJlTG9jYWxDYWxsYmFja2AgaXMgYSBjYWxsYmFjayB0aGF0IGlzIGludm9rZWQgd2hlbiBkZWNsYXJpbmcgdGhlIGxvY2FsLlxuICogLSB2YWx1ZSBgZGVjbGFyZWAgaXMgdHJ1ZSBpZiB0aGlzIHZhbHVlIG5lZWRzIHRvIGJlIGRlY2xhcmVkLlxuICogLSB2YWx1ZSBgbG9jYWxSZWZgIGlzIHRydWUgaWYgd2UgYXJlIHN0b3JpbmcgYSBsb2NhbCByZWZlcmVuY2VcbiAqIC0gdmFsdWUgYHByaW9yaXR5YCBkaWN0YXRlcyB0aGUgc29ydGluZyBwcmlvcml0eSBvZiB0aGlzIHZhciBkZWNsYXJhdGlvbiBjb21wYXJlZFxuICogdG8gb3RoZXIgdmFyIGRlY2xhcmF0aW9ucyBvbiB0aGUgc2FtZSByZXRyaWV2YWwgbGV2ZWwuIEZvciBleGFtcGxlLCBpZiB0aGVyZSBpcyBhXG4gKiBjb250ZXh0IHZhcmlhYmxlIGFuZCBhIGxvY2FsIHJlZiBhY2Nlc3NpbmcgdGhlIHNhbWUgcGFyZW50IHZpZXcsIHRoZSBjb250ZXh0IHZhclxuICogZGVjbGFyYXRpb24gc2hvdWxkIGFsd2F5cyBjb21lIGJlZm9yZSB0aGUgbG9jYWwgcmVmIGRlY2xhcmF0aW9uLlxuICovXG50eXBlIEJpbmRpbmdEYXRhID0ge1xuICByZXRyaWV2YWxMZXZlbDogbnVtYmVyOyBsaHM6IG8uRXhwcmVzc2lvbjtcbiAgZGVjbGFyZUxvY2FsQ2FsbGJhY2s/OiBEZWNsYXJlTG9jYWxWYXJDYWxsYmFjazsgZGVjbGFyZTogYm9vbGVhbjsgcHJpb3JpdHk6IG51bWJlcjtcbiAgbG9jYWxSZWY6IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFRoZSBzb3J0aW5nIHByaW9yaXR5IG9mIGEgbG9jYWwgdmFyaWFibGUgZGVjbGFyYXRpb24uIEhpZ2hlciBudW1iZXJzXG4gKiBtZWFuIHRoZSBkZWNsYXJhdGlvbiB3aWxsIGFwcGVhciBmaXJzdCBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUuXG4gKi9cbmNvbnN0IGVudW0gRGVjbGFyYXRpb25Qcmlvcml0eSB7XG4gIERFRkFVTFQgPSAwLFxuICBDT05URVhUID0gMSxcbiAgU0hBUkVEX0NPTlRFWFQgPSAyXG59XG5cbmV4cG9ydCBjbGFzcyBCaW5kaW5nU2NvcGUgaW1wbGVtZW50cyBMb2NhbFJlc29sdmVyIHtcbiAgLyoqIEtlZXBzIGEgbWFwIGZyb20gbG9jYWwgdmFyaWFibGVzIHRvIHRoZWlyIEJpbmRpbmdEYXRhLiAqL1xuICBwcml2YXRlIG1hcCA9IG5ldyBNYXA8c3RyaW5nLCBCaW5kaW5nRGF0YT4oKTtcbiAgcHJpdmF0ZSByZWZlcmVuY2VOYW1lSW5kZXggPSAwO1xuICBwcml2YXRlIHJlc3RvcmVWaWV3VmFyaWFibGU6IG8uUmVhZFZhckV4cHJ8bnVsbCA9IG51bGw7XG4gIHN0YXRpYyBjcmVhdGVSb290U2NvcGUoKTogQmluZGluZ1Njb3BlIHtcbiAgICByZXR1cm4gbmV3IEJpbmRpbmdTY29wZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBiaW5kaW5nTGV2ZWw6IG51bWJlciA9IDAsIHByaXZhdGUgcGFyZW50OiBCaW5kaW5nU2NvcGV8bnVsbCA9IG51bGwsXG4gICAgICBwdWJsaWMgZ2xvYmFscz86IFNldDxzdHJpbmc+KSB7XG4gICAgaWYgKGdsb2JhbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIGdsb2JhbHMpIHtcbiAgICAgICAgdGhpcy5zZXQoMCwgbmFtZSwgby52YXJpYWJsZShuYW1lKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0KG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbnxudWxsIHtcbiAgICBsZXQgY3VycmVudDogQmluZGluZ1Njb3BlfG51bGwgPSB0aGlzO1xuICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICBsZXQgdmFsdWUgPSBjdXJyZW50Lm1hcC5nZXQobmFtZSk7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICBpZiAoY3VycmVudCAhPT0gdGhpcykge1xuICAgICAgICAgIC8vIG1ha2UgYSBsb2NhbCBjb3B5IGFuZCByZXNldCB0aGUgYGRlY2xhcmVgIHN0YXRlXG4gICAgICAgICAgdmFsdWUgPSB7XG4gICAgICAgICAgICByZXRyaWV2YWxMZXZlbDogdmFsdWUucmV0cmlldmFsTGV2ZWwsXG4gICAgICAgICAgICBsaHM6IHZhbHVlLmxocyxcbiAgICAgICAgICAgIGRlY2xhcmVMb2NhbENhbGxiYWNrOiB2YWx1ZS5kZWNsYXJlTG9jYWxDYWxsYmFjayxcbiAgICAgICAgICAgIGRlY2xhcmU6IGZhbHNlLFxuICAgICAgICAgICAgcHJpb3JpdHk6IHZhbHVlLnByaW9yaXR5LFxuICAgICAgICAgICAgbG9jYWxSZWY6IHZhbHVlLmxvY2FsUmVmXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIENhY2hlIHRoZSB2YWx1ZSBsb2NhbGx5LlxuICAgICAgICAgIHRoaXMubWFwLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgLy8gUG9zc2libHkgZ2VuZXJhdGUgYSBzaGFyZWQgY29udGV4dCB2YXJcbiAgICAgICAgICB0aGlzLm1heWJlR2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHZhbHVlKTtcbiAgICAgICAgICB0aGlzLm1heWJlUmVzdG9yZVZpZXcodmFsdWUucmV0cmlldmFsTGV2ZWwsIHZhbHVlLmxvY2FsUmVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZS5kZWNsYXJlTG9jYWxDYWxsYmFjayAmJiAhdmFsdWUuZGVjbGFyZSkge1xuICAgICAgICAgIHZhbHVlLmRlY2xhcmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZS5saHM7XG4gICAgICB9XG4gICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZ2V0IHRvIHRoaXMgcG9pbnQsIHdlIGFyZSBsb29raW5nIGZvciBhIHByb3BlcnR5IG9uIHRoZSB0b3AgbGV2ZWwgY29tcG9uZW50XG4gICAgLy8gLSBJZiBsZXZlbCA9PT0gMCwgd2UgYXJlIG9uIHRoZSB0b3AgYW5kIGRvbid0IG5lZWQgdG8gcmUtZGVjbGFyZSBgY3R4YC5cbiAgICAvLyAtIElmIGxldmVsID4gMCwgd2UgYXJlIGluIGFuIGVtYmVkZGVkIHZpZXcuIFdlIG5lZWQgdG8gcmV0cmlldmUgdGhlIG5hbWUgb2YgdGhlXG4gICAgLy8gbG9jYWwgdmFyIHdlIHVzZWQgdG8gc3RvcmUgdGhlIGNvbXBvbmVudCBjb250ZXh0LCBlLmcuIGNvbnN0ICRjb21wJCA9IHgoKTtcbiAgICByZXR1cm4gdGhpcy5iaW5kaW5nTGV2ZWwgPT09IDAgPyBudWxsIDogdGhpcy5nZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsb2NhbCB2YXJpYWJsZSBmb3IgbGF0ZXIgcmVmZXJlbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gcmV0cmlldmFsTGV2ZWwgVGhlIGxldmVsIGZyb20gd2hpY2ggdGhpcyB2YWx1ZSBjYW4gYmUgcmV0cmlldmVkXG4gICAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIHZhcmlhYmxlLlxuICAgKiBAcGFyYW0gbGhzIEFTVCByZXByZXNlbnRpbmcgdGhlIGxlZnQgaGFuZCBzaWRlIG9mIHRoZSBgbGV0IGxocyA9IHJocztgLlxuICAgKiBAcGFyYW0gcHJpb3JpdHkgVGhlIHNvcnRpbmcgcHJpb3JpdHkgb2YgdGhpcyB2YXJcbiAgICogQHBhcmFtIGRlY2xhcmVMb2NhbENhbGxiYWNrIFRoZSBjYWxsYmFjayB0byBpbnZva2Ugd2hlbiBkZWNsYXJpbmcgdGhpcyBsb2NhbCB2YXJcbiAgICogQHBhcmFtIGxvY2FsUmVmIFdoZXRoZXIgb3Igbm90IHRoaXMgaXMgYSBsb2NhbCByZWZcbiAgICovXG4gIHNldChyZXRyaWV2YWxMZXZlbDogbnVtYmVyLCBuYW1lOiBzdHJpbmcsIGxoczogby5FeHByZXNzaW9uLFxuICAgICAgcHJpb3JpdHk6IG51bWJlciA9IERlY2xhcmF0aW9uUHJpb3JpdHkuREVGQVVMVCxcbiAgICAgIGRlY2xhcmVMb2NhbENhbGxiYWNrPzogRGVjbGFyZUxvY2FsVmFyQ2FsbGJhY2ssIGxvY2FsUmVmPzogdHJ1ZSk6IEJpbmRpbmdTY29wZSB7XG4gICAgaWYgKHRoaXMubWFwLmhhcyhuYW1lKSkge1xuICAgICAgaWYgKGxvY2FsUmVmKSB7XG4gICAgICAgIC8vIERvIG5vdCB0aHJvdyBhbiBlcnJvciBpZiBpdCdzIGEgbG9jYWwgcmVmIGFuZCBkbyBub3QgdXBkYXRlIGV4aXN0aW5nIHZhbHVlLFxuICAgICAgICAvLyBzbyB0aGUgZmlyc3QgZGVmaW5lZCByZWYgaXMgYWx3YXlzIHJldHVybmVkLlxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGVycm9yKGBUaGUgbmFtZSAke25hbWV9IGlzIGFscmVhZHkgZGVmaW5lZCBpbiBzY29wZSB0byBiZSAke3RoaXMubWFwLmdldChuYW1lKX1gKTtcbiAgICB9XG4gICAgdGhpcy5tYXAuc2V0KG5hbWUsIHtcbiAgICAgIHJldHJpZXZhbExldmVsOiByZXRyaWV2YWxMZXZlbCxcbiAgICAgIGxoczogbGhzLFxuICAgICAgZGVjbGFyZTogZmFsc2UsXG4gICAgICBkZWNsYXJlTG9jYWxDYWxsYmFjazogZGVjbGFyZUxvY2FsQ2FsbGJhY2ssXG4gICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICBsb2NhbFJlZjogbG9jYWxSZWYgfHwgZmFsc2VcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgTG9jYWxSZXNvbHZlci5cbiAgZ2V0TG9jYWwobmFtZTogc3RyaW5nKTogKG8uRXhwcmVzc2lvbnxudWxsKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG5hbWUpO1xuICB9XG5cbiAgLy8gSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBMb2NhbFJlc29sdmVyLlxuICBub3RpZnlJbXBsaWNpdFJlY2VpdmVyVXNlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmJpbmRpbmdMZXZlbCAhPT0gMCkge1xuICAgICAgLy8gU2luY2UgdGhlIGltcGxpY2l0IHJlY2VpdmVyIGlzIGFjY2Vzc2VkIGluIGFuIGVtYmVkZGVkIHZpZXcsIHdlIG5lZWQgdG9cbiAgICAgIC8vIGVuc3VyZSB0aGF0IHdlIGRlY2xhcmUgYSBzaGFyZWQgY29udGV4dCB2YXJpYWJsZSBmb3IgdGhlIGN1cnJlbnQgdGVtcGxhdGVcbiAgICAgIC8vIGluIHRoZSB1cGRhdGUgdmFyaWFibGVzLlxuICAgICAgdGhpcy5tYXAuZ2V0KFNIQVJFRF9DT05URVhUX0tFWSArIDApIS5kZWNsYXJlID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBuZXN0ZWRTY29wZShsZXZlbDogbnVtYmVyLCBnbG9iYWxzPzogU2V0PHN0cmluZz4pOiBCaW5kaW5nU2NvcGUge1xuICAgIGNvbnN0IG5ld1Njb3BlID0gbmV3IEJpbmRpbmdTY29wZShsZXZlbCwgdGhpcywgZ2xvYmFscyk7XG4gICAgaWYgKGxldmVsID4gMCkgbmV3U2NvcGUuZ2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKDApO1xuICAgIHJldHVybiBuZXdTY29wZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIG9yIGNyZWF0ZXMgYSBzaGFyZWQgY29udGV4dCB2YXJpYWJsZSBhbmQgcmV0dXJucyBpdHMgZXhwcmVzc2lvbi4gTm90ZSB0aGF0XG4gICAqIHRoaXMgZG9lcyBub3QgbWVhbiB0aGF0IHRoZSBzaGFyZWQgdmFyaWFibGUgd2lsbCBiZSBkZWNsYXJlZC4gVmFyaWFibGVzIGluIHRoZVxuICAgKiBiaW5kaW5nIHNjb3BlIHdpbGwgYmUgb25seSBkZWNsYXJlZCBpZiB0aGV5IGFyZSB1c2VkLlxuICAgKi9cbiAgZ2V0T3JDcmVhdGVTaGFyZWRDb250ZXh0VmFyKHJldHJpZXZhbExldmVsOiBudW1iZXIpOiBvLlJlYWRWYXJFeHByIHtcbiAgICBjb25zdCBiaW5kaW5nS2V5ID0gU0hBUkVEX0NPTlRFWFRfS0VZICsgcmV0cmlldmFsTGV2ZWw7XG4gICAgaWYgKCF0aGlzLm1hcC5oYXMoYmluZGluZ0tleSkpIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHJldHJpZXZhbExldmVsKTtcbiAgICB9XG4gICAgLy8gU2hhcmVkIGNvbnRleHQgdmFyaWFibGVzIGFyZSBhbHdheXMgZ2VuZXJhdGVkIGFzIFwiUmVhZFZhckV4cHJcIi5cbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0KGJpbmRpbmdLZXkpIS5saHMgYXMgby5SZWFkVmFyRXhwcjtcbiAgfVxuXG4gIGdldFNoYXJlZENvbnRleHROYW1lKHJldHJpZXZhbExldmVsOiBudW1iZXIpOiBvLlJlYWRWYXJFeHByfG51bGwge1xuICAgIGNvbnN0IHNoYXJlZEN0eE9iaiA9IHRoaXMubWFwLmdldChTSEFSRURfQ09OVEVYVF9LRVkgKyByZXRyaWV2YWxMZXZlbCk7XG4gICAgLy8gU2hhcmVkIGNvbnRleHQgdmFyaWFibGVzIGFyZSBhbHdheXMgZ2VuZXJhdGVkIGFzIFwiUmVhZFZhckV4cHJcIi5cbiAgICByZXR1cm4gc2hhcmVkQ3R4T2JqICYmIHNoYXJlZEN0eE9iai5kZWNsYXJlID8gc2hhcmVkQ3R4T2JqLmxocyBhcyBvLlJlYWRWYXJFeHByIDogbnVsbDtcbiAgfVxuXG4gIG1heWJlR2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHZhbHVlOiBCaW5kaW5nRGF0YSkge1xuICAgIGlmICh2YWx1ZS5wcmlvcml0eSA9PT0gRGVjbGFyYXRpb25Qcmlvcml0eS5DT05URVhUICYmXG4gICAgICAgIHZhbHVlLnJldHJpZXZhbExldmVsIDwgdGhpcy5iaW5kaW5nTGV2ZWwpIHtcbiAgICAgIGNvbnN0IHNoYXJlZEN0eE9iaiA9IHRoaXMubWFwLmdldChTSEFSRURfQ09OVEVYVF9LRVkgKyB2YWx1ZS5yZXRyaWV2YWxMZXZlbCk7XG4gICAgICBpZiAoc2hhcmVkQ3R4T2JqKSB7XG4gICAgICAgIHNoYXJlZEN0eE9iai5kZWNsYXJlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVTaGFyZWRDb250ZXh0VmFyKHZhbHVlLnJldHJpZXZhbExldmVsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZVNoYXJlZENvbnRleHRWYXIocmV0cmlldmFsTGV2ZWw6IG51bWJlcikge1xuICAgIGNvbnN0IGxocyA9IG8udmFyaWFibGUoQ09OVEVYVF9OQU1FICsgdGhpcy5mcmVzaFJlZmVyZW5jZU5hbWUoKSk7XG4gICAgdGhpcy5tYXAuc2V0KFNIQVJFRF9DT05URVhUX0tFWSArIHJldHJpZXZhbExldmVsLCB7XG4gICAgICByZXRyaWV2YWxMZXZlbDogcmV0cmlldmFsTGV2ZWwsXG4gICAgICBsaHM6IGxocyxcbiAgICAgIGRlY2xhcmVMb2NhbENhbGxiYWNrOiAoc2NvcGU6IEJpbmRpbmdTY29wZSwgcmVsYXRpdmVMZXZlbDogbnVtYmVyKSA9PiB7XG4gICAgICAgIC8vIGNvbnN0IGN0eF9yMCA9IG5leHRDb250ZXh0KDIpO1xuICAgICAgICByZXR1cm4gW2xocy5zZXQoZ2VuZXJhdGVOZXh0Q29udGV4dEV4cHIocmVsYXRpdmVMZXZlbCkpLnRvQ29uc3REZWNsKCldO1xuICAgICAgfSxcbiAgICAgIGRlY2xhcmU6IGZhbHNlLFxuICAgICAgcHJpb3JpdHk6IERlY2xhcmF0aW9uUHJpb3JpdHkuU0hBUkVEX0NPTlRFWFQsXG4gICAgICBsb2NhbFJlZjogZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIGdldENvbXBvbmVudFByb3BlcnR5KG5hbWU6IHN0cmluZyk6IG8uRXhwcmVzc2lvbiB7XG4gICAgY29uc3QgY29tcG9uZW50VmFsdWUgPSB0aGlzLm1hcC5nZXQoU0hBUkVEX0NPTlRFWFRfS0VZICsgMCkhO1xuICAgIGNvbXBvbmVudFZhbHVlLmRlY2xhcmUgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVSZXN0b3JlVmlldygwLCBmYWxzZSk7XG4gICAgcmV0dXJuIGNvbXBvbmVudFZhbHVlLmxocy5wcm9wKG5hbWUpO1xuICB9XG5cbiAgbWF5YmVSZXN0b3JlVmlldyhyZXRyaWV2YWxMZXZlbDogbnVtYmVyLCBsb2NhbFJlZkxvb2t1cDogYm9vbGVhbikge1xuICAgIC8vIFdlIHdhbnQgdG8gcmVzdG9yZSB0aGUgY3VycmVudCB2aWV3IGluIGxpc3RlbmVyIGZucyBpZjpcbiAgICAvLyAxIC0gd2UgYXJlIGFjY2Vzc2luZyBhIHZhbHVlIGluIGEgcGFyZW50IHZpZXcsIHdoaWNoIHJlcXVpcmVzIHdhbGtpbmcgdGhlIHZpZXcgdHJlZSByYXRoZXJcbiAgICAvLyB0aGFuIHVzaW5nIHRoZSBjdHggYXJnLiBJbiB0aGlzIGNhc2UsIHRoZSByZXRyaWV2YWwgYW5kIGJpbmRpbmcgbGV2ZWwgd2lsbCBiZSBkaWZmZXJlbnQuXG4gICAgLy8gMiAtIHdlIGFyZSBsb29raW5nIHVwIGEgbG9jYWwgcmVmLCB3aGljaCByZXF1aXJlcyByZXN0b3JpbmcgdGhlIHZpZXcgd2hlcmUgdGhlIGxvY2FsXG4gICAgLy8gcmVmIGlzIHN0b3JlZFxuICAgIGlmICh0aGlzLmlzTGlzdGVuZXJTY29wZSgpICYmIChyZXRyaWV2YWxMZXZlbCA8IHRoaXMuYmluZGluZ0xldmVsIHx8IGxvY2FsUmVmTG9va3VwKSkge1xuICAgICAgaWYgKCF0aGlzLnBhcmVudCEucmVzdG9yZVZpZXdWYXJpYWJsZSkge1xuICAgICAgICAvLyBwYXJlbnQgc2F2ZXMgdmFyaWFibGUgdG8gZ2VuZXJhdGUgYSBzaGFyZWQgYGNvbnN0ICRzJCA9IGdldEN1cnJlbnRWaWV3KCk7YCBpbnN0cnVjdGlvblxuICAgICAgICB0aGlzLnBhcmVudCEucmVzdG9yZVZpZXdWYXJpYWJsZSA9IG8udmFyaWFibGUodGhpcy5wYXJlbnQhLmZyZXNoUmVmZXJlbmNlTmFtZSgpKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVzdG9yZVZpZXdWYXJpYWJsZSA9IHRoaXMucGFyZW50IS5yZXN0b3JlVmlld1ZhcmlhYmxlO1xuICAgIH1cbiAgfVxuXG4gIHJlc3RvcmVWaWV3U3RhdGVtZW50KCk6IG8uU3RhdGVtZW50W10ge1xuICAgIC8vIHJlc3RvcmVWaWV3KCRzdGF0ZSQpO1xuICAgIHJldHVybiB0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUgP1xuICAgICAgICBbaW5zdHJ1Y3Rpb24obnVsbCwgUjMucmVzdG9yZVZpZXcsIFt0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGVdKS50b1N0bXQoKV0gOlxuICAgICAgICBbXTtcbiAgfVxuXG4gIHZpZXdTbmFwc2hvdFN0YXRlbWVudHMoKTogby5TdGF0ZW1lbnRbXSB7XG4gICAgLy8gY29uc3QgJHN0YXRlJCA9IGdldEN1cnJlbnRWaWV3KCk7XG4gICAgY29uc3QgZ2V0Q3VycmVudFZpZXdJbnN0cnVjdGlvbiA9IGluc3RydWN0aW9uKG51bGwsIFIzLmdldEN1cnJlbnRWaWV3LCBbXSk7XG4gICAgcmV0dXJuIHRoaXMucmVzdG9yZVZpZXdWYXJpYWJsZSA/XG4gICAgICAgIFt0aGlzLnJlc3RvcmVWaWV3VmFyaWFibGUuc2V0KGdldEN1cnJlbnRWaWV3SW5zdHJ1Y3Rpb24pLnRvQ29uc3REZWNsKCldIDpcbiAgICAgICAgW107XG4gIH1cblxuICBpc0xpc3RlbmVyU2NvcGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmJpbmRpbmdMZXZlbCA9PT0gdGhpcy5iaW5kaW5nTGV2ZWw7XG4gIH1cblxuICB2YXJpYWJsZURlY2xhcmF0aW9ucygpOiBvLlN0YXRlbWVudFtdIHtcbiAgICBsZXQgY3VycmVudENvbnRleHRMZXZlbCA9IDA7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tYXAudmFsdWVzKCkpXG4gICAgICAgICAgICAgICAuZmlsdGVyKHZhbHVlID0+IHZhbHVlLmRlY2xhcmUpXG4gICAgICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYi5yZXRyaWV2YWxMZXZlbCAtIGEucmV0cmlldmFsTGV2ZWwgfHwgYi5wcmlvcml0eSAtIGEucHJpb3JpdHkpXG4gICAgICAgICAgICAgICAucmVkdWNlKChzdG10czogby5TdGF0ZW1lbnRbXSwgdmFsdWU6IEJpbmRpbmdEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgIGNvbnN0IGxldmVsRGlmZiA9IHRoaXMuYmluZGluZ0xldmVsIC0gdmFsdWUucmV0cmlldmFsTGV2ZWw7XG4gICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJTdG10cyA9XG4gICAgICAgICAgICAgICAgICAgICB2YWx1ZS5kZWNsYXJlTG9jYWxDYWxsYmFjayEodGhpcywgbGV2ZWxEaWZmIC0gY3VycmVudENvbnRleHRMZXZlbCk7XG4gICAgICAgICAgICAgICAgIGN1cnJlbnRDb250ZXh0TGV2ZWwgPSBsZXZlbERpZmY7XG4gICAgICAgICAgICAgICAgIHJldHVybiBzdG10cy5jb25jYXQoY3VyclN0bXRzKTtcbiAgICAgICAgICAgICAgIH0sIFtdKSBhcyBvLlN0YXRlbWVudFtdO1xuICB9XG5cblxuICBmcmVzaFJlZmVyZW5jZU5hbWUoKTogc3RyaW5nIHtcbiAgICBsZXQgY3VycmVudDogQmluZGluZ1Njb3BlID0gdGhpcztcbiAgICAvLyBGaW5kIHRoZSB0b3Agc2NvcGUgYXMgaXQgbWFpbnRhaW5zIHRoZSBnbG9iYWwgcmVmZXJlbmNlIGNvdW50XG4gICAgd2hpbGUgKGN1cnJlbnQucGFyZW50KSBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgY29uc3QgcmVmID0gYCR7UkVGRVJFTkNFX1BSRUZJWH0ke2N1cnJlbnQucmVmZXJlbmNlTmFtZUluZGV4Kyt9YDtcbiAgICByZXR1cm4gcmVmO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBDc3NTZWxlY3RvcmAgZ2l2ZW4gYSB0YWcgbmFtZSBhbmQgYSBtYXAgb2YgYXR0cmlidXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3NzU2VsZWN0b3IoXG4gICAgZWxlbWVudE5hbWU6IHN0cmluZywgYXR0cmlidXRlczoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogQ3NzU2VsZWN0b3Ige1xuICBjb25zdCBjc3NTZWxlY3RvciA9IG5ldyBDc3NTZWxlY3RvcigpO1xuICBjb25zdCBlbGVtZW50TmFtZU5vTnMgPSBzcGxpdE5zTmFtZShlbGVtZW50TmFtZSlbMV07XG5cbiAgY3NzU2VsZWN0b3Iuc2V0RWxlbWVudChlbGVtZW50TmFtZU5vTnMpO1xuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGF0dHJpYnV0ZXMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICBjb25zdCBuYW1lTm9OcyA9IHNwbGl0TnNOYW1lKG5hbWUpWzFdO1xuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblxuICAgIGNzc1NlbGVjdG9yLmFkZEF0dHJpYnV0ZShuYW1lTm9OcywgdmFsdWUpO1xuICAgIGlmIChuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdjbGFzcycpIHtcbiAgICAgIGNvbnN0IGNsYXNzZXMgPSB2YWx1ZS50cmltKCkuc3BsaXQoL1xccysvKTtcbiAgICAgIGNsYXNzZXMuZm9yRWFjaChjbGFzc05hbWUgPT4gY3NzU2VsZWN0b3IuYWRkQ2xhc3NOYW1lKGNsYXNzTmFtZSkpO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNzc1NlbGVjdG9yO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgZXhwcmVzc2lvbnMgb3V0IG9mIGFuIGBuZ1Byb2plY3RBc2AgYXR0cmlidXRlc1xuICogd2hpY2ggY2FuIGJlIGFkZGVkIHRvIHRoZSBpbnN0cnVjdGlvbiBwYXJhbWV0ZXJzLlxuICovXG5mdW5jdGlvbiBnZXROZ1Byb2plY3RBc0xpdGVyYWwoYXR0cmlidXRlOiB0LlRleHRBdHRyaWJ1dGUpOiBvLkV4cHJlc3Npb25bXSB7XG4gIC8vIFBhcnNlIHRoZSBhdHRyaWJ1dGUgdmFsdWUgaW50byBhIENzc1NlbGVjdG9yTGlzdC4gTm90ZSB0aGF0IHdlIG9ubHkgdGFrZSB0aGVcbiAgLy8gZmlyc3Qgc2VsZWN0b3IsIGJlY2F1c2Ugd2UgZG9uJ3Qgc3VwcG9ydCBtdWx0aXBsZSBzZWxlY3RvcnMgaW4gbmdQcm9qZWN0QXMuXG4gIGNvbnN0IHBhcnNlZFIzU2VsZWN0b3IgPSBjb3JlLnBhcnNlU2VsZWN0b3JUb1IzU2VsZWN0b3IoYXR0cmlidXRlLnZhbHVlKVswXTtcbiAgcmV0dXJuIFtvLmxpdGVyYWwoY29yZS5BdHRyaWJ1dGVNYXJrZXIuUHJvamVjdEFzKSwgYXNMaXRlcmFsKHBhcnNlZFIzU2VsZWN0b3IpXTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIHByb3BlcnR5XG4gKiBAcGFyYW0gaW50ZXJwb2xhdGlvbiBBbiBJbnRlcnBvbGF0aW9uIEFTVFxuICovXG5mdW5jdGlvbiBnZXRQcm9wZXJ0eUludGVycG9sYXRpb25FeHByZXNzaW9uKGludGVycG9sYXRpb246IEludGVycG9sYXRpb24pIHtcbiAgc3dpdGNoIChnZXRJbnRlcnBvbGF0aW9uQXJnc0xlbmd0aChpbnRlcnBvbGF0aW9uKSkge1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZTI7XG4gICAgY2FzZSA3OlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGU1O1xuICAgIGNhc2UgMTM6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy5wcm9wZXJ0eUludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLnByb3BlcnR5SW50ZXJwb2xhdGU4O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gUjMucHJvcGVydHlJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBpbnN0cnVjdGlvbiB0byBnZW5lcmF0ZSBmb3IgYW4gaW50ZXJwb2xhdGVkIGF0dHJpYnV0ZVxuICogQHBhcmFtIGludGVycG9sYXRpb24gQW4gSW50ZXJwb2xhdGlvbiBBU1RcbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cmlidXRlSW50ZXJwb2xhdGlvbkV4cHJlc3Npb24oaW50ZXJwb2xhdGlvbjogSW50ZXJwb2xhdGlvbikge1xuICBzd2l0Y2ggKGdldEludGVycG9sYXRpb25BcmdzTGVuZ3RoKGludGVycG9sYXRpb24pKSB7XG4gICAgY2FzZSAzOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlMTtcbiAgICBjYXNlIDU6XG4gICAgICByZXR1cm4gUjMuYXR0cmlidXRlSW50ZXJwb2xhdGUyO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBSMy5hdHRyaWJ1dGVJbnRlcnBvbGF0ZTM7XG4gICAgY2FzZSA5OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNDtcbiAgICBjYXNlIDExOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNjtcbiAgICBjYXNlIDE1OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlNztcbiAgICBjYXNlIDE3OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlODtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLmF0dHJpYnV0ZUludGVycG9sYXRlVjtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIGluc3RydWN0aW9uIHRvIGdlbmVyYXRlIGZvciBpbnRlcnBvbGF0ZWQgdGV4dC5cbiAqIEBwYXJhbSBpbnRlcnBvbGF0aW9uIEFuIEludGVycG9sYXRpb24gQVNUXG4gKi9cbmZ1bmN0aW9uIGdldFRleHRJbnRlcnBvbGF0aW9uRXhwcmVzc2lvbihpbnRlcnBvbGF0aW9uOiBJbnRlcnBvbGF0aW9uKTogby5FeHRlcm5hbFJlZmVyZW5jZSB7XG4gIHN3aXRjaCAoZ2V0SW50ZXJwb2xhdGlvbkFyZ3NMZW5ndGgoaW50ZXJwb2xhdGlvbikpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlO1xuICAgIGNhc2UgMzpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUxO1xuICAgIGNhc2UgNTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUyO1xuICAgIGNhc2UgNzpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGUzO1xuICAgIGNhc2UgOTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGU0O1xuICAgIGNhc2UgMTE6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlNTtcbiAgICBjYXNlIDEzOlxuICAgICAgcmV0dXJuIFIzLnRleHRJbnRlcnBvbGF0ZTY7XG4gICAgY2FzZSAxNTpcbiAgICAgIHJldHVybiBSMy50ZXh0SW50ZXJwb2xhdGU3O1xuICAgIGNhc2UgMTc6XG4gICAgICByZXR1cm4gUjMudGV4dEludGVycG9sYXRlODtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFIzLnRleHRJbnRlcnBvbGF0ZVY7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gbW9kaWZ5IGhvdyBhIHRlbXBsYXRlIGlzIHBhcnNlZCBieSBgcGFyc2VUZW1wbGF0ZSgpYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZVRlbXBsYXRlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBJbmNsdWRlIHdoaXRlc3BhY2Ugbm9kZXMgaW4gdGhlIHBhcnNlZCBvdXRwdXQuXG4gICAqL1xuICBwcmVzZXJ2ZVdoaXRlc3BhY2VzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEhvdyB0byBwYXJzZSBpbnRlcnBvbGF0aW9uIG1hcmtlcnMuXG4gICAqL1xuICBpbnRlcnBvbGF0aW9uQ29uZmlnPzogSW50ZXJwb2xhdGlvbkNvbmZpZztcbiAgLyoqXG4gICAqIFRoZSBzdGFydCBhbmQgZW5kIHBvaW50IG9mIHRoZSB0ZXh0IHRvIHBhcnNlIHdpdGhpbiB0aGUgYHNvdXJjZWAgc3RyaW5nLlxuICAgKiBUaGUgZW50aXJlIGBzb3VyY2VgIHN0cmluZyBpcyBwYXJzZWQgaWYgdGhpcyBpcyBub3QgcHJvdmlkZWQuXG4gICAqICovXG4gIHJhbmdlPzogTGV4ZXJSYW5nZTtcbiAgLyoqXG4gICAqIElmIHRoaXMgdGV4dCBpcyBzdG9yZWQgaW4gYSBKYXZhU2NyaXB0IHN0cmluZywgdGhlbiB3ZSBoYXZlIHRvIGRlYWwgd2l0aCBlc2NhcGUgc2VxdWVuY2VzLlxuICAgKlxuICAgKiAqKkV4YW1wbGUgMToqKlxuICAgKlxuICAgKiBgYGBcbiAgICogXCJhYmNcXFwiZGVmXFxuZ2hpXCJcbiAgICogYGBgXG4gICAqXG4gICAqIC0gVGhlIGBcXFwiYCBtdXN0IGJlIGNvbnZlcnRlZCB0byBgXCJgLlxuICAgKiAtIFRoZSBgXFxuYCBtdXN0IGJlIGNvbnZlcnRlZCB0byBhIG5ldyBsaW5lIGNoYXJhY3RlciBpbiBhIHRva2VuLFxuICAgKiAgIGJ1dCBpdCBzaG91bGQgbm90IGluY3JlbWVudCB0aGUgY3VycmVudCBsaW5lIGZvciBzb3VyY2UgbWFwcGluZy5cbiAgICpcbiAgICogKipFeGFtcGxlIDI6KipcbiAgICpcbiAgICogYGBgXG4gICAqIFwiYWJjXFxcbiAgICogIGRlZlwiXG4gICAqIGBgYFxuICAgKlxuICAgKiBUaGUgbGluZSBjb250aW51YXRpb24gKGBcXGAgZm9sbG93ZWQgYnkgYSBuZXdsaW5lKSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIGEgdG9rZW5cbiAgICogYnV0IHRoZSBuZXcgbGluZSBzaG91bGQgaW5jcmVtZW50IHRoZSBjdXJyZW50IGxpbmUgZm9yIHNvdXJjZSBtYXBwaW5nLlxuICAgKi9cbiAgZXNjYXBlZFN0cmluZz86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgYXMgbGVhZGluZyB0cml2aWEuXG4gICAqIExlYWRpbmcgdHJpdmlhIGFyZSBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBpbXBvcnRhbnQgdG8gdGhlIGRldmVsb3BlciwgYW5kIHNvIHNob3VsZCBub3QgYmVcbiAgICogaW5jbHVkZWQgaW4gc291cmNlLW1hcCBzZWdtZW50cy4gIEEgY29tbW9uIGV4YW1wbGUgaXMgd2hpdGVzcGFjZS5cbiAgICovXG4gIGxlYWRpbmdUcml2aWFDaGFycz86IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBSZW5kZXIgYCRsb2NhbGl6ZWAgbWVzc2FnZSBpZHMgd2l0aCBhZGRpdGlvbmFsIGxlZ2FjeSBtZXNzYWdlIGlkcy5cbiAgICpcbiAgICogVGhpcyBvcHRpb24gZGVmYXVsdHMgdG8gYHRydWVgIGJ1dCBpbiB0aGUgZnV0dXJlIHRoZSBkZWZhdWwgd2lsbCBiZSBmbGlwcGVkLlxuICAgKlxuICAgKiBGb3Igbm93IHNldCB0aGlzIG9wdGlvbiB0byBmYWxzZSBpZiB5b3UgaGF2ZSBtaWdyYXRlZCB0aGUgdHJhbnNsYXRpb24gZmlsZXMgdG8gdXNlIHRoZSBuZXdcbiAgICogYCRsb2NhbGl6ZWAgbWVzc2FnZSBpZCBmb3JtYXQgYW5kIHlvdSBhcmUgbm90IHVzaW5nIGNvbXBpbGUgdGltZSB0cmFuc2xhdGlvbiBtZXJnaW5nLlxuICAgKi9cbiAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdD86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBJZiB0aGlzIHRleHQgaXMgc3RvcmVkIGluIGFuIGV4dGVybmFsIHRlbXBsYXRlIChlLmcuIHZpYSBgdGVtcGxhdGVVcmxgKSB0aGVuIHdlIG5lZWQgdG8gZGVjaWRlXG4gICAqIHdoZXRoZXIgb3Igbm90IHRvIG5vcm1hbGl6ZSB0aGUgbGluZS1lbmRpbmdzIChmcm9tIGBcXHJcXG5gIHRvIGBcXG5gKSB3aGVuIHByb2Nlc3NpbmcgSUNVXG4gICAqIGV4cHJlc3Npb25zLlxuICAgKlxuICAgKiBJZiBgdHJ1ZWAgdGhlbiB3ZSB3aWxsIG5vcm1hbGl6ZSBJQ1UgZXhwcmVzc2lvbiBsaW5lIGVuZGluZ3MuXG4gICAqIFRoZSBkZWZhdWx0IGlzIGBmYWxzZWAsIGJ1dCB0aGlzIHdpbGwgYmUgc3dpdGNoZWQgaW4gYSBmdXR1cmUgbWFqb3IgcmVsZWFzZS5cbiAgICovXG4gIGkxOG5Ob3JtYWxpemVMaW5lRW5kaW5nc0luSUNVcz86IGJvb2xlYW47XG59XG5cbi8qKlxuICogUGFyc2UgYSB0ZW1wbGF0ZSBpbnRvIHJlbmRlcjMgYE5vZGVgcyBhbmQgYWRkaXRpb25hbCBtZXRhZGF0YSwgd2l0aCBubyBvdGhlciBkZXBlbmRlbmNpZXMuXG4gKlxuICogQHBhcmFtIHRlbXBsYXRlIHRleHQgb2YgdGhlIHRlbXBsYXRlIHRvIHBhcnNlXG4gKiBAcGFyYW0gdGVtcGxhdGVVcmwgVVJMIHRvIHVzZSBmb3Igc291cmNlIG1hcHBpbmcgb2YgdGhlIHBhcnNlZCB0ZW1wbGF0ZVxuICogQHBhcmFtIG9wdGlvbnMgb3B0aW9ucyB0byBtb2RpZnkgaG93IHRoZSB0ZW1wbGF0ZSBpcyBwYXJzZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUoXG4gICAgdGVtcGxhdGU6IHN0cmluZywgdGVtcGxhdGVVcmw6IHN0cmluZywgb3B0aW9uczogUGFyc2VUZW1wbGF0ZU9wdGlvbnMgPSB7fSk6IFBhcnNlZFRlbXBsYXRlIHtcbiAgY29uc3Qge2ludGVycG9sYXRpb25Db25maWcsIHByZXNlcnZlV2hpdGVzcGFjZXMsIGVuYWJsZUkxOG5MZWdhY3lNZXNzYWdlSWRGb3JtYXR9ID0gb3B0aW9ucztcbiAgY29uc3QgYmluZGluZ1BhcnNlciA9IG1ha2VCaW5kaW5nUGFyc2VyKGludGVycG9sYXRpb25Db25maWcpO1xuICBjb25zdCBodG1sUGFyc2VyID0gbmV3IEh0bWxQYXJzZXIoKTtcbiAgY29uc3QgcGFyc2VSZXN1bHQgPSBodG1sUGFyc2VyLnBhcnNlKFxuICAgICAgdGVtcGxhdGUsIHRlbXBsYXRlVXJsLFxuICAgICAge2xlYWRpbmdUcml2aWFDaGFyczogTEVBRElOR19UUklWSUFfQ0hBUlMsIC4uLm9wdGlvbnMsIHRva2VuaXplRXhwYW5zaW9uRm9ybXM6IHRydWV9KTtcblxuICBpZiAocGFyc2VSZXN1bHQuZXJyb3JzICYmIHBhcnNlUmVzdWx0LmVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgLy8gVE9ETyhheWF6aGFmaXopOiB3ZSBtYXkgbm90IGFsd2F5cyB3YW50IHRvIGJhaWwgb3V0IGF0IHRoaXMgcG9pbnQgKGUuZy4gaW5cbiAgICAvLyB0aGUgY29udGV4dCBvZiBhIGxhbmd1YWdlIHNlcnZpY2UpLlxuICAgIHJldHVybiB7XG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgICAgcHJlc2VydmVXaGl0ZXNwYWNlcyxcbiAgICAgIHRlbXBsYXRlLFxuICAgICAgZXJyb3JzOiBwYXJzZVJlc3VsdC5lcnJvcnMsXG4gICAgICBub2RlczogW10sXG4gICAgICBzdHlsZVVybHM6IFtdLFxuICAgICAgc3R5bGVzOiBbXSxcbiAgICAgIG5nQ29udGVudFNlbGVjdG9yczogW11cbiAgICB9O1xuICB9XG5cbiAgbGV0IHJvb3ROb2RlczogaHRtbC5Ob2RlW10gPSBwYXJzZVJlc3VsdC5yb290Tm9kZXM7XG5cbiAgLy8gcHJvY2VzcyBpMThuIG1ldGEgaW5mb3JtYXRpb24gKHNjYW4gYXR0cmlidXRlcywgZ2VuZXJhdGUgaWRzKVxuICAvLyBiZWZvcmUgd2UgcnVuIHdoaXRlc3BhY2UgcmVtb3ZhbCBwcm9jZXNzLCBiZWNhdXNlIGV4aXN0aW5nIGkxOG5cbiAgLy8gZXh0cmFjdGlvbiBwcm9jZXNzIChuZyBleHRyYWN0LWkxOG4pIHJlbGllcyBvbiBhIHJhdyBjb250ZW50IHRvIGdlbmVyYXRlXG4gIC8vIG1lc3NhZ2UgaWRzXG4gIGNvbnN0IGkxOG5NZXRhVmlzaXRvciA9IG5ldyBJMThuTWV0YVZpc2l0b3IoXG4gICAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLCAvKiBrZWVwSTE4bkF0dHJzICovICFwcmVzZXJ2ZVdoaXRlc3BhY2VzLFxuICAgICAgZW5hYmxlSTE4bkxlZ2FjeU1lc3NhZ2VJZEZvcm1hdCk7XG4gIHJvb3ROb2RlcyA9IGh0bWwudmlzaXRBbGwoaTE4bk1ldGFWaXNpdG9yLCByb290Tm9kZXMpO1xuXG4gIGlmICghcHJlc2VydmVXaGl0ZXNwYWNlcykge1xuICAgIHJvb3ROb2RlcyA9IGh0bWwudmlzaXRBbGwobmV3IFdoaXRlc3BhY2VWaXNpdG9yKCksIHJvb3ROb2Rlcyk7XG5cbiAgICAvLyBydW4gaTE4biBtZXRhIHZpc2l0b3IgYWdhaW4gaW4gY2FzZSB3aGl0ZXNwYWNlcyBhcmUgcmVtb3ZlZCAoYmVjYXVzZSB0aGF0IG1pZ2h0IGFmZmVjdFxuICAgIC8vIGdlbmVyYXRlZCBpMThuIG1lc3NhZ2UgY29udGVudCkgYW5kIGZpcnN0IHBhc3MgaW5kaWNhdGVkIHRoYXQgaTE4biBjb250ZW50IGlzIHByZXNlbnQgaW4gYVxuICAgIC8vIHRlbXBsYXRlLiBEdXJpbmcgdGhpcyBwYXNzIGkxOG4gSURzIGdlbmVyYXRlZCBhdCB0aGUgZmlyc3QgcGFzcyB3aWxsIGJlIHByZXNlcnZlZCwgc28gd2UgY2FuXG4gICAgLy8gbWltaWMgZXhpc3RpbmcgZXh0cmFjdGlvbiBwcm9jZXNzIChuZyBleHRyYWN0LWkxOG4pXG4gICAgaWYgKGkxOG5NZXRhVmlzaXRvci5oYXNJMThuTWV0YSkge1xuICAgICAgcm9vdE5vZGVzID0gaHRtbC52aXNpdEFsbChcbiAgICAgICAgICBuZXcgSTE4bk1ldGFWaXNpdG9yKGludGVycG9sYXRpb25Db25maWcsIC8qIGtlZXBJMThuQXR0cnMgKi8gZmFsc2UpLCByb290Tm9kZXMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHtub2RlcywgZXJyb3JzLCBzdHlsZVVybHMsIHN0eWxlcywgbmdDb250ZW50U2VsZWN0b3JzfSA9XG4gICAgICBodG1sQXN0VG9SZW5kZXIzQXN0KHJvb3ROb2RlcywgYmluZGluZ1BhcnNlcik7XG5cbiAgcmV0dXJuIHtcbiAgICBpbnRlcnBvbGF0aW9uQ29uZmlnLFxuICAgIHByZXNlcnZlV2hpdGVzcGFjZXMsXG4gICAgZXJyb3JzOiBlcnJvcnMubGVuZ3RoID4gMCA/IGVycm9ycyA6IG51bGwsXG4gICAgdGVtcGxhdGUsXG4gICAgbm9kZXMsXG4gICAgc3R5bGVVcmxzLFxuICAgIHN0eWxlcyxcbiAgICBuZ0NvbnRlbnRTZWxlY3RvcnNcbiAgfTtcbn1cblxuY29uc3QgZWxlbWVudFJlZ2lzdHJ5ID0gbmV3IERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSgpO1xuXG4vKipcbiAqIENvbnN0cnVjdCBhIGBCaW5kaW5nUGFyc2VyYCB3aXRoIGEgZGVmYXVsdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUJpbmRpbmdQYXJzZXIoXG4gICAgaW50ZXJwb2xhdGlvbkNvbmZpZzogSW50ZXJwb2xhdGlvbkNvbmZpZyA9IERFRkFVTFRfSU5URVJQT0xBVElPTl9DT05GSUcpOiBCaW5kaW5nUGFyc2VyIHtcbiAgcmV0dXJuIG5ldyBCaW5kaW5nUGFyc2VyKFxuICAgICAgbmV3IEl2eVBhcnNlcihuZXcgTGV4ZXIoKSksIGludGVycG9sYXRpb25Db25maWcsIGVsZW1lbnRSZWdpc3RyeSwgbnVsbCwgW10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVNhbml0aXphdGlvbkZuKGNvbnRleHQ6IGNvcmUuU2VjdXJpdHlDb250ZXh0LCBpc0F0dHJpYnV0ZT86IGJvb2xlYW4pIHtcbiAgc3dpdGNoIChjb250ZXh0KSB7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5IVE1MOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZUh0bWwpO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuU0NSSVBUOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVNjcmlwdCk7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5TVFlMRTpcbiAgICAgIC8vIHRoZSBjb21waWxlciBkb2VzIG5vdCBmaWxsIGluIGFuIGluc3RydWN0aW9uIGZvciBbc3R5bGUucHJvcD9dIGJpbmRpbmdcbiAgICAgIC8vIHZhbHVlcyBiZWNhdXNlIHRoZSBzdHlsZSBhbGdvcml0aG0ga25vd3MgaW50ZXJuYWxseSB3aGF0IHByb3BzIGFyZSBzdWJqZWN0XG4gICAgICAvLyB0byBzYW5pdGl6YXRpb24gKG9ubHkgW2F0dHIuc3R5bGVdIHZhbHVlcyBhcmUgZXhwbGljaXRseSBzYW5pdGl6ZWQpXG4gICAgICByZXR1cm4gaXNBdHRyaWJ1dGUgPyBvLmltcG9ydEV4cHIoUjMuc2FuaXRpemVTdHlsZSkgOiBudWxsO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuVVJMOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy5zYW5pdGl6ZVVybCk7XG4gICAgY2FzZSBjb3JlLlNlY3VyaXR5Q29udGV4dC5SRVNPVVJDRV9VUkw6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLnNhbml0aXplUmVzb3VyY2VVcmwpO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnVzdGVkQ29uc3RBdHRyaWJ1dGUodGFnTmFtZTogc3RyaW5nLCBhdHRyOiB0LlRleHRBdHRyaWJ1dGUpOiBvLkV4cHJlc3Npb24ge1xuICBjb25zdCB2YWx1ZSA9IGFzTGl0ZXJhbChhdHRyLnZhbHVlKTtcbiAgc3dpdGNoIChlbGVtZW50UmVnaXN0cnkuc2VjdXJpdHlDb250ZXh0KHRhZ05hbWUsIGF0dHIubmFtZSwgLyogaXNBdHRyaWJ1dGUgKi8gdHJ1ZSkpIHtcbiAgICBjYXNlIGNvcmUuU2VjdXJpdHlDb250ZXh0LkhUTUw6XG4gICAgICByZXR1cm4gby5pbXBvcnRFeHByKFIzLnRydXN0Q29uc3RhbnRIdG1sKS5jYWxsRm4oW3ZhbHVlXSwgYXR0ci52YWx1ZVNwYW4pO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuU0NSSVBUOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy50cnVzdENvbnN0YW50U2NyaXB0KS5jYWxsRm4oW3ZhbHVlXSwgYXR0ci52YWx1ZVNwYW4pO1xuICAgIGNhc2UgY29yZS5TZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMOlxuICAgICAgcmV0dXJuIG8uaW1wb3J0RXhwcihSMy50cnVzdENvbnN0YW50UmVzb3VyY2VVcmwpLmNhbGxGbihbdmFsdWVdLCBhdHRyLnZhbHVlU3Bhbik7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NpbmdsZUVsZW1lbnRUZW1wbGF0ZShjaGlsZHJlbjogdC5Ob2RlW10pOiBjaGlsZHJlbiBpc1t0LkVsZW1lbnRdIHtcbiAgcmV0dXJuIGNoaWxkcmVuLmxlbmd0aCA9PT0gMSAmJiBjaGlsZHJlblswXSBpbnN0YW5jZW9mIHQuRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gaXNUZXh0Tm9kZShub2RlOiB0Lk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiB0LlRleHQgfHwgbm9kZSBpbnN0YW5jZW9mIHQuQm91bmRUZXh0IHx8IG5vZGUgaW5zdGFuY2VvZiB0LkljdTtcbn1cblxuZnVuY3Rpb24gaGFzVGV4dENoaWxkcmVuT25seShjaGlsZHJlbjogdC5Ob2RlW10pOiBib29sZWFuIHtcbiAgcmV0dXJuIGNoaWxkcmVuLmV2ZXJ5KGlzVGV4dE5vZGUpO1xufVxuXG5pbnRlcmZhY2UgQ2hhaW5hYmxlQmluZGluZ0luc3RydWN0aW9uIHtcbiAgbmFtZT86IHN0cmluZztcbiAgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGw7XG4gIHZhbHVlOiAoKSA9PiBvLkV4cHJlc3Npb24gfCBvLkV4cHJlc3Npb25bXTtcbiAgcGFyYW1zPzogYW55W107XG59XG5cbi8qKiBOYW1lIG9mIHRoZSBnbG9iYWwgdmFyaWFibGUgdGhhdCBpcyB1c2VkIHRvIGRldGVybWluZSBpZiB3ZSB1c2UgQ2xvc3VyZSB0cmFuc2xhdGlvbnMgb3Igbm90ICovXG5jb25zdCBOR19JMThOX0NMT1NVUkVfTU9ERSA9ICduZ0kxOG5DbG9zdXJlTW9kZSc7XG5cbi8qKlxuICogR2VuZXJhdGUgc3RhdGVtZW50cyB0aGF0IGRlZmluZSBhIGdpdmVuIHRyYW5zbGF0aW9uIG1lc3NhZ2UuXG4gKlxuICogYGBgXG4gKiB2YXIgSTE4Tl8xO1xuICogaWYgKHR5cGVvZiBuZ0kxOG5DbG9zdXJlTW9kZSAhPT0gdW5kZWZpbmVkICYmIG5nSTE4bkNsb3N1cmVNb2RlKSB7XG4gKiAgICAgdmFyIE1TR19FWFRFUk5BTF9YWFggPSBnb29nLmdldE1zZyhcbiAqICAgICAgICAgIFwiU29tZSBtZXNzYWdlIHdpdGggeyRpbnRlcnBvbGF0aW9ufSFcIixcbiAqICAgICAgICAgIHsgXCJpbnRlcnBvbGF0aW9uXCI6IFwiXFx1RkZGRDBcXHVGRkZEXCIgfVxuICogICAgICk7XG4gKiAgICAgSTE4Tl8xID0gTVNHX0VYVEVSTkFMX1hYWDtcbiAqIH1cbiAqIGVsc2Uge1xuICogICAgIEkxOE5fMSA9ICRsb2NhbGl6ZWBTb21lIG1lc3NhZ2Ugd2l0aCAkeydcXHVGRkZEMFxcdUZGRkQnfSFgO1xuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIG9yaWdpbmFsIGkxOG4gQVNUIG1lc3NhZ2Ugbm9kZVxuICogQHBhcmFtIHZhcmlhYmxlIFRoZSB2YXJpYWJsZSB0aGF0IHdpbGwgYmUgYXNzaWduZWQgdGhlIHRyYW5zbGF0aW9uLCBlLmcuIGBJMThOXzFgLlxuICogQHBhcmFtIGNsb3N1cmVWYXIgVGhlIHZhcmlhYmxlIGZvciBDbG9zdXJlIGBnb29nLmdldE1zZ2AgY2FsbHMsIGUuZy4gYE1TR19FWFRFUk5BTF9YWFhgLlxuICogQHBhcmFtIHBhcmFtcyBPYmplY3QgbWFwcGluZyBwbGFjZWhvbGRlciBuYW1lcyB0byB0aGVpciB2YWx1ZXMgKGUuZy5cbiAqIGB7IFwiaW50ZXJwb2xhdGlvblwiOiBcIlxcdUZGRkQwXFx1RkZGRFwiIH1gKS5cbiAqIEBwYXJhbSB0cmFuc2Zvcm1GbiBPcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgYXBwbGllZCB0byB0aGUgdHJhbnNsYXRpb24gKGUuZy5cbiAqIHBvc3QtcHJvY2Vzc2luZykuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzdGF0ZW1lbnRzIHRoYXQgZGVmaW5lZCBhIGdpdmVuIHRyYW5zbGF0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHJhbnNsYXRpb25EZWNsU3RtdHMoXG4gICAgbWVzc2FnZTogaTE4bi5NZXNzYWdlLCB2YXJpYWJsZTogby5SZWFkVmFyRXhwciwgY2xvc3VyZVZhcjogby5SZWFkVmFyRXhwcixcbiAgICBwYXJhbXM6IHtbbmFtZTogc3RyaW5nXTogby5FeHByZXNzaW9ufSA9IHt9LFxuICAgIHRyYW5zZm9ybUZuPzogKHJhdzogby5SZWFkVmFyRXhwcikgPT4gby5FeHByZXNzaW9uKTogby5TdGF0ZW1lbnRbXSB7XG4gIGNvbnN0IHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10gPSBbXG4gICAgZGVjbGFyZUkxOG5WYXJpYWJsZSh2YXJpYWJsZSksXG4gICAgby5pZlN0bXQoXG4gICAgICAgIGNyZWF0ZUNsb3N1cmVNb2RlR3VhcmQoKSxcbiAgICAgICAgY3JlYXRlR29vZ2xlR2V0TXNnU3RhdGVtZW50cyhcbiAgICAgICAgICAgIHZhcmlhYmxlLCBtZXNzYWdlLCBjbG9zdXJlVmFyLFxuICAgICAgICAgICAgaTE4bkZvcm1hdFBsYWNlaG9sZGVyTmFtZXMocGFyYW1zLCAvKiB1c2VDYW1lbENhc2UgKi8gdHJ1ZSkpLFxuICAgICAgICBjcmVhdGVMb2NhbGl6ZVN0YXRlbWVudHMoXG4gICAgICAgICAgICB2YXJpYWJsZSwgbWVzc2FnZSwgaTE4bkZvcm1hdFBsYWNlaG9sZGVyTmFtZXMocGFyYW1zLCAvKiB1c2VDYW1lbENhc2UgKi8gZmFsc2UpKSksXG4gIF07XG5cbiAgaWYgKHRyYW5zZm9ybUZuKSB7XG4gICAgc3RhdGVtZW50cy5wdXNoKG5ldyBvLkV4cHJlc3Npb25TdGF0ZW1lbnQodmFyaWFibGUuc2V0KHRyYW5zZm9ybUZuKHZhcmlhYmxlKSkpKTtcbiAgfVxuXG4gIHJldHVybiBzdGF0ZW1lbnRzO1xufVxuXG4vKipcbiAqIENyZWF0ZSB0aGUgZXhwcmVzc2lvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBndWFyZCB0aGUgY2xvc3VyZSBtb2RlIGJsb2NrXG4gKiBJdCBpcyBlcXVpdmFsZW50IHRvOlxuICpcbiAqIGBgYFxuICogdHlwZW9mIG5nSTE4bkNsb3N1cmVNb2RlICE9PSB1bmRlZmluZWQgJiYgbmdJMThuQ2xvc3VyZU1vZGVcbiAqIGBgYFxuICovXG5mdW5jdGlvbiBjcmVhdGVDbG9zdXJlTW9kZUd1YXJkKCk6IG8uQmluYXJ5T3BlcmF0b3JFeHByIHtcbiAgcmV0dXJuIG8udHlwZW9mRXhwcihvLnZhcmlhYmxlKE5HX0kxOE5fQ0xPU1VSRV9NT0RFKSlcbiAgICAgIC5ub3RJZGVudGljYWwoby5saXRlcmFsKCd1bmRlZmluZWQnLCBvLlNUUklOR19UWVBFKSlcbiAgICAgIC5hbmQoby52YXJpYWJsZShOR19JMThOX0NMT1NVUkVfTU9ERSkpO1xufVxuXG4vKipcbiAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSB0ZW1wbGF0ZSB3aGljaCB3YXMgZXh0cmFjdGVkIGR1cmluZyBwYXJzaW5nLlxuICpcbiAqIFRoaXMgY29udGFpbnMgdGhlIGFjdHVhbCBwYXJzZWQgdGVtcGxhdGUgYXMgd2VsbCBhcyBhbnkgbWV0YWRhdGEgY29sbGVjdGVkIGR1cmluZyBpdHMgcGFyc2luZyxcbiAqIHNvbWUgb2Ygd2hpY2ggbWlnaHQgYmUgdXNlZnVsIGZvciByZS1wYXJzaW5nIHRoZSB0ZW1wbGF0ZSB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBhcnNlZFRlbXBsYXRlIHtcbiAgLyoqXG4gICAqIEluY2x1ZGUgd2hpdGVzcGFjZSBub2RlcyBpbiB0aGUgcGFyc2VkIG91dHB1dC5cbiAgICovXG4gIHByZXNlcnZlV2hpdGVzcGFjZXM/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBIb3cgdG8gcGFyc2UgaW50ZXJwb2xhdGlvbiBtYXJrZXJzLlxuICAgKi9cbiAgaW50ZXJwb2xhdGlvbkNvbmZpZz86IEludGVycG9sYXRpb25Db25maWc7XG5cbiAgLyoqXG4gICAqIFRoZSBzdHJpbmcgY29udGVudHMgb2YgdGhlIHRlbXBsYXRlLlxuICAgKlxuICAgKiBUaGlzIGlzIHRoZSBcImxvZ2ljYWxcIiB0ZW1wbGF0ZSBzdHJpbmcsIGFmdGVyIGV4cGFuc2lvbiBvZiBhbnkgZXNjYXBlZCBjaGFyYWN0ZXJzIChmb3IgaW5saW5lXG4gICAqIHRlbXBsYXRlcykuIFRoaXMgbWF5IGRpZmZlciBmcm9tIHRoZSBhY3R1YWwgdGVtcGxhdGUgYnl0ZXMgYXMgdGhleSBhcHBlYXIgaW4gdGhlIC50cyBmaWxlLlxuICAgKi9cbiAgdGVtcGxhdGU6IHN0cmluZztcblxuICAvKipcbiAgICogQW55IGVycm9ycyBmcm9tIHBhcnNpbmcgdGhlIHRlbXBsYXRlIHRoZSBmaXJzdCB0aW1lLlxuICAgKlxuICAgKiBgbnVsbGAgaWYgdGhlcmUgYXJlIG5vIGVycm9ycy4gT3RoZXJ3aXNlLCB0aGUgYXJyYXkgb2YgZXJyb3JzIGlzIGd1YXJhbnRlZWQgdG8gYmUgbm9uLWVtcHR5LlxuICAgKi9cbiAgZXJyb3JzOiBQYXJzZUVycm9yW118bnVsbDtcblxuICAvKipcbiAgICogVGhlIHRlbXBsYXRlIEFTVCwgcGFyc2VkIGZyb20gdGhlIHRlbXBsYXRlLlxuICAgKi9cbiAgbm9kZXM6IHQuTm9kZVtdO1xuXG4gIC8qKlxuICAgKiBBbnkgc3R5bGVVcmxzIGV4dHJhY3RlZCBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgICovXG4gIHN0eWxlVXJsczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEFueSBpbmxpbmUgc3R5bGVzIGV4dHJhY3RlZCBmcm9tIHRoZSBtZXRhZGF0YS5cbiAgICovXG4gIHN0eWxlczogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEFueSBuZy1jb250ZW50IHNlbGVjdG9ycyBleHRyYWN0ZWQgZnJvbSB0aGUgdGVtcGxhdGUuXG4gICAqL1xuICBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdO1xufVxuIl19