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
        define("@angular/compiler/src/render3/r3_ast", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformAll = exports.visitAll = exports.TransformVisitor = exports.RecursiveVisitor = exports.NullVisitor = exports.Icu = exports.Reference = exports.Variable = exports.Content = exports.Template = exports.Element = exports.BoundEvent = exports.BoundAttribute = exports.TextAttribute = exports.BoundText = exports.Text = void 0;
    var tslib_1 = require("tslib");
    var Text = /** @class */ (function () {
        function Text(value, sourceSpan) {
            this.value = value;
            this.sourceSpan = sourceSpan;
        }
        Text.prototype.visit = function (visitor) {
            return visitor.visitText(this);
        };
        return Text;
    }());
    exports.Text = Text;
    var BoundText = /** @class */ (function () {
        function BoundText(value, sourceSpan, i18n) {
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
        }
        BoundText.prototype.visit = function (visitor) {
            return visitor.visitBoundText(this);
        };
        return BoundText;
    }());
    exports.BoundText = BoundText;
    var TextAttribute = /** @class */ (function () {
        function TextAttribute(name, value, sourceSpan, valueSpan, i18n) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.valueSpan = valueSpan;
            this.i18n = i18n;
        }
        TextAttribute.prototype.visit = function (visitor) {
            return visitor.visitTextAttribute(this);
        };
        return TextAttribute;
    }());
    exports.TextAttribute = TextAttribute;
    var BoundAttribute = /** @class */ (function () {
        function BoundAttribute(name, type, securityContext, value, unit, sourceSpan, keySpan, valueSpan, i18n) {
            this.name = name;
            this.type = type;
            this.securityContext = securityContext;
            this.value = value;
            this.unit = unit;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
            this.i18n = i18n;
        }
        BoundAttribute.fromBoundElementProperty = function (prop, i18n) {
            if (prop.keySpan === undefined) {
                throw new Error("Unexpected state: keySpan must be defined for bound attributes but was not for " + prop.name + ": " + prop.sourceSpan);
            }
            return new BoundAttribute(prop.name, prop.type, prop.securityContext, prop.value, prop.unit, prop.sourceSpan, prop.keySpan, prop.valueSpan, i18n);
        };
        BoundAttribute.prototype.visit = function (visitor) {
            return visitor.visitBoundAttribute(this);
        };
        return BoundAttribute;
    }());
    exports.BoundAttribute = BoundAttribute;
    var BoundEvent = /** @class */ (function () {
        function BoundEvent(name, type, handler, target, phase, sourceSpan, handlerSpan) {
            this.name = name;
            this.type = type;
            this.handler = handler;
            this.target = target;
            this.phase = phase;
            this.sourceSpan = sourceSpan;
            this.handlerSpan = handlerSpan;
        }
        BoundEvent.fromParsedEvent = function (event) {
            var target = event.type === 0 /* Regular */ ? event.targetOrPhase : null;
            var phase = event.type === 1 /* Animation */ ? event.targetOrPhase : null;
            return new BoundEvent(event.name, event.type, event.handler, target, phase, event.sourceSpan, event.handlerSpan);
        };
        BoundEvent.prototype.visit = function (visitor) {
            return visitor.visitBoundEvent(this);
        };
        return BoundEvent;
    }());
    exports.BoundEvent = BoundEvent;
    var Element = /** @class */ (function () {
        function Element(name, attributes, inputs, outputs, children, references, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
            this.name = name;
            this.attributes = attributes;
            this.inputs = inputs;
            this.outputs = outputs;
            this.children = children;
            this.references = references;
            this.sourceSpan = sourceSpan;
            this.startSourceSpan = startSourceSpan;
            this.endSourceSpan = endSourceSpan;
            this.i18n = i18n;
        }
        Element.prototype.visit = function (visitor) {
            return visitor.visitElement(this);
        };
        return Element;
    }());
    exports.Element = Element;
    var Template = /** @class */ (function () {
        function Template(tagName, attributes, inputs, outputs, templateAttrs, children, references, variables, sourceSpan, startSourceSpan, endSourceSpan, i18n) {
            this.tagName = tagName;
            this.attributes = attributes;
            this.inputs = inputs;
            this.outputs = outputs;
            this.templateAttrs = templateAttrs;
            this.children = children;
            this.references = references;
            this.variables = variables;
            this.sourceSpan = sourceSpan;
            this.startSourceSpan = startSourceSpan;
            this.endSourceSpan = endSourceSpan;
            this.i18n = i18n;
        }
        Template.prototype.visit = function (visitor) {
            return visitor.visitTemplate(this);
        };
        return Template;
    }());
    exports.Template = Template;
    var Content = /** @class */ (function () {
        function Content(selector, attributes, sourceSpan, i18n) {
            this.selector = selector;
            this.attributes = attributes;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
            this.name = 'ng-content';
        }
        Content.prototype.visit = function (visitor) {
            return visitor.visitContent(this);
        };
        return Content;
    }());
    exports.Content = Content;
    var Variable = /** @class */ (function () {
        function Variable(name, value, sourceSpan, keySpan, valueSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.keySpan = keySpan;
            this.valueSpan = valueSpan;
        }
        Variable.prototype.visit = function (visitor) {
            return visitor.visitVariable(this);
        };
        return Variable;
    }());
    exports.Variable = Variable;
    var Reference = /** @class */ (function () {
        function Reference(name, value, sourceSpan, valueSpan) {
            this.name = name;
            this.value = value;
            this.sourceSpan = sourceSpan;
            this.valueSpan = valueSpan;
        }
        Reference.prototype.visit = function (visitor) {
            return visitor.visitReference(this);
        };
        return Reference;
    }());
    exports.Reference = Reference;
    var Icu = /** @class */ (function () {
        function Icu(vars, placeholders, sourceSpan, i18n) {
            this.vars = vars;
            this.placeholders = placeholders;
            this.sourceSpan = sourceSpan;
            this.i18n = i18n;
        }
        Icu.prototype.visit = function (visitor) {
            return visitor.visitIcu(this);
        };
        return Icu;
    }());
    exports.Icu = Icu;
    var NullVisitor = /** @class */ (function () {
        function NullVisitor() {
        }
        NullVisitor.prototype.visitElement = function (element) { };
        NullVisitor.prototype.visitTemplate = function (template) { };
        NullVisitor.prototype.visitContent = function (content) { };
        NullVisitor.prototype.visitVariable = function (variable) { };
        NullVisitor.prototype.visitReference = function (reference) { };
        NullVisitor.prototype.visitTextAttribute = function (attribute) { };
        NullVisitor.prototype.visitBoundAttribute = function (attribute) { };
        NullVisitor.prototype.visitBoundEvent = function (attribute) { };
        NullVisitor.prototype.visitText = function (text) { };
        NullVisitor.prototype.visitBoundText = function (text) { };
        NullVisitor.prototype.visitIcu = function (icu) { };
        return NullVisitor;
    }());
    exports.NullVisitor = NullVisitor;
    var RecursiveVisitor = /** @class */ (function () {
        function RecursiveVisitor() {
        }
        RecursiveVisitor.prototype.visitElement = function (element) {
            visitAll(this, element.attributes);
            visitAll(this, element.children);
            visitAll(this, element.references);
        };
        RecursiveVisitor.prototype.visitTemplate = function (template) {
            visitAll(this, template.attributes);
            visitAll(this, template.children);
            visitAll(this, template.references);
            visitAll(this, template.variables);
        };
        RecursiveVisitor.prototype.visitContent = function (content) { };
        RecursiveVisitor.prototype.visitVariable = function (variable) { };
        RecursiveVisitor.prototype.visitReference = function (reference) { };
        RecursiveVisitor.prototype.visitTextAttribute = function (attribute) { };
        RecursiveVisitor.prototype.visitBoundAttribute = function (attribute) { };
        RecursiveVisitor.prototype.visitBoundEvent = function (attribute) { };
        RecursiveVisitor.prototype.visitText = function (text) { };
        RecursiveVisitor.prototype.visitBoundText = function (text) { };
        RecursiveVisitor.prototype.visitIcu = function (icu) { };
        return RecursiveVisitor;
    }());
    exports.RecursiveVisitor = RecursiveVisitor;
    var TransformVisitor = /** @class */ (function () {
        function TransformVisitor() {
        }
        TransformVisitor.prototype.visitElement = function (element) {
            var newAttributes = transformAll(this, element.attributes);
            var newInputs = transformAll(this, element.inputs);
            var newOutputs = transformAll(this, element.outputs);
            var newChildren = transformAll(this, element.children);
            var newReferences = transformAll(this, element.references);
            if (newAttributes != element.attributes || newInputs != element.inputs ||
                newOutputs != element.outputs || newChildren != element.children ||
                newReferences != element.references) {
                return new Element(element.name, newAttributes, newInputs, newOutputs, newChildren, newReferences, element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
            }
            return element;
        };
        TransformVisitor.prototype.visitTemplate = function (template) {
            var newAttributes = transformAll(this, template.attributes);
            var newInputs = transformAll(this, template.inputs);
            var newOutputs = transformAll(this, template.outputs);
            var newTemplateAttrs = transformAll(this, template.templateAttrs);
            var newChildren = transformAll(this, template.children);
            var newReferences = transformAll(this, template.references);
            var newVariables = transformAll(this, template.variables);
            if (newAttributes != template.attributes || newInputs != template.inputs ||
                newOutputs != template.outputs || newTemplateAttrs != template.templateAttrs ||
                newChildren != template.children || newReferences != template.references ||
                newVariables != template.variables) {
                return new Template(template.tagName, newAttributes, newInputs, newOutputs, newTemplateAttrs, newChildren, newReferences, newVariables, template.sourceSpan, template.startSourceSpan, template.endSourceSpan);
            }
            return template;
        };
        TransformVisitor.prototype.visitContent = function (content) {
            return content;
        };
        TransformVisitor.prototype.visitVariable = function (variable) {
            return variable;
        };
        TransformVisitor.prototype.visitReference = function (reference) {
            return reference;
        };
        TransformVisitor.prototype.visitTextAttribute = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitBoundAttribute = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitBoundEvent = function (attribute) {
            return attribute;
        };
        TransformVisitor.prototype.visitText = function (text) {
            return text;
        };
        TransformVisitor.prototype.visitBoundText = function (text) {
            return text;
        };
        TransformVisitor.prototype.visitIcu = function (icu) {
            return icu;
        };
        return TransformVisitor;
    }());
    exports.TransformVisitor = TransformVisitor;
    function visitAll(visitor, nodes) {
        var e_1, _a, e_2, _b;
        var result = [];
        if (visitor.visit) {
            try {
                for (var nodes_1 = tslib_1.__values(nodes), nodes_1_1 = nodes_1.next(); !nodes_1_1.done; nodes_1_1 = nodes_1.next()) {
                    var node = nodes_1_1.value;
                    var newNode = visitor.visit(node) || node.visit(visitor);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (nodes_1_1 && !nodes_1_1.done && (_a = nodes_1.return)) _a.call(nodes_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        else {
            try {
                for (var nodes_2 = tslib_1.__values(nodes), nodes_2_1 = nodes_2.next(); !nodes_2_1.done; nodes_2_1 = nodes_2.next()) {
                    var node = nodes_2_1.value;
                    var newNode = node.visit(visitor);
                    if (newNode) {
                        result.push(newNode);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (nodes_2_1 && !nodes_2_1.done && (_b = nodes_2.return)) _b.call(nodes_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        return result;
    }
    exports.visitAll = visitAll;
    function transformAll(visitor, nodes) {
        var e_3, _a;
        var result = [];
        var changed = false;
        try {
            for (var nodes_3 = tslib_1.__values(nodes), nodes_3_1 = nodes_3.next(); !nodes_3_1.done; nodes_3_1 = nodes_3.next()) {
                var node = nodes_3_1.value;
                var newNode = node.visit(visitor);
                if (newNode) {
                    result.push(newNode);
                }
                changed = changed || newNode != node;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (nodes_3_1 && !nodes_3_1.done && (_a = nodes_3.return)) _a.call(nodes_3);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return changed ? result : nodes;
    }
    exports.transformAll = transformAll;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicjNfYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tcGlsZXIvc3JjL3JlbmRlcjMvcjNfYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFZSDtRQUNFLGNBQW1CLEtBQWEsRUFBUyxVQUEyQjtZQUFqRCxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBaUI7UUFBRyxDQUFDO1FBQ3hFLG9CQUFLLEdBQUwsVUFBYyxPQUF3QjtZQUNwQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNILFdBQUM7SUFBRCxDQUFDLEFBTEQsSUFLQztJQUxZLG9CQUFJO0lBT2pCO1FBQ0UsbUJBQW1CLEtBQVUsRUFBUyxVQUEyQixFQUFTLElBQWU7WUFBdEUsVUFBSyxHQUFMLEtBQUssQ0FBSztZQUFTLGVBQVUsR0FBVixVQUFVLENBQWlCO1lBQVMsU0FBSSxHQUFKLElBQUksQ0FBVztRQUFHLENBQUM7UUFDN0YseUJBQUssR0FBTCxVQUFjLE9BQXdCO1lBQ3BDLE9BQU8sT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0gsZ0JBQUM7SUFBRCxDQUFDLEFBTEQsSUFLQztJQUxZLDhCQUFTO0lBT3RCO1FBQ0UsdUJBQ1csSUFBWSxFQUFTLEtBQWEsRUFBUyxVQUEyQixFQUN0RSxTQUEyQixFQUFTLElBQWU7WUFEbkQsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFpQjtZQUN0RSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUFTLFNBQUksR0FBSixJQUFJLENBQVc7UUFBRyxDQUFDO1FBQ2xFLDZCQUFLLEdBQUwsVUFBYyxPQUF3QjtZQUNwQyxPQUFPLE9BQU8s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TyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3BDLElBQUksT0FBTyxFQUFFO3dCQUNYLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ3RCO2lCQUNGOzs7Ozs7Ozs7U0FDRjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFmRCw0QkFlQztJQUVELFNBQWdCLFlBQVksQ0FDeEIsT0FBc0IsRUFBRSxLQUFlOztRQUN6QyxJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFDNUIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDOztZQUNwQixLQUFtQixJQUFBLFVBQUEsaUJBQUEsS0FBSyxDQUFBLDRCQUFBLCtDQUFFO2dCQUFyQixJQUFNLElBQUksa0JBQUE7Z0JBQ2IsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFpQixDQUFDLENBQUM7aUJBQ2hDO2dCQUNELE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQzthQUN0Qzs7Ozs7Ozs7O1FBQ0QsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFaRCxvQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1NlY3VyaXR5Q29udGV4dH0gZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQge0FTVCwgQmluZGluZ1R5cGUsIEJvdW5kRWxlbWVudFByb3BlcnR5LCBQYXJzZWRFdmVudCwgUGFyc2VkRXZlbnRUeXBlfSBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0IHtJMThuTWV0YX0gZnJvbSAnLi4vaTE4bi9pMThuX2FzdCc7XG5pbXBvcnQge1BhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTm9kZSB7XG4gIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbjtcbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQ7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXh0IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRUZXh0KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZFRleHQgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlOiBBU1QsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kVGV4dCh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGV4dEF0dHJpYnV0ZSBpbXBsZW1lbnRzIE5vZGUge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyB2YWx1ZTogc3RyaW5nLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIHZhbHVlU3Bhbj86IFBhcnNlU291cmNlU3BhbiwgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0VGV4dEF0dHJpYnV0ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQm91bmRBdHRyaWJ1dGUgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdHlwZTogQmluZGluZ1R5cGUsIHB1YmxpYyBzZWN1cml0eUNvbnRleHQ6IFNlY3VyaXR5Q29udGV4dCxcbiAgICAgIHB1YmxpYyB2YWx1ZTogQVNULCBwdWJsaWMgdW5pdDogc3RyaW5nfG51bGwsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZVNwYW46IFBhcnNlU291cmNlU3Bhbnx1bmRlZmluZWQsXG4gICAgICBwdWJsaWMgaTE4bjogSTE4bk1ldGF8dW5kZWZpbmVkKSB7fVxuXG4gIHN0YXRpYyBmcm9tQm91bmRFbGVtZW50UHJvcGVydHkocHJvcDogQm91bmRFbGVtZW50UHJvcGVydHksIGkxOG4/OiBJMThuTWV0YSk6IEJvdW5kQXR0cmlidXRlIHtcbiAgICBpZiAocHJvcC5rZXlTcGFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5leHBlY3RlZCBzdGF0ZToga2V5U3BhbiBtdXN0IGJlIGRlZmluZWQgZm9yIGJvdW5kIGF0dHJpYnV0ZXMgYnV0IHdhcyBub3QgZm9yICR7XG4gICAgICAgICAgICAgIHByb3AubmFtZX06ICR7cHJvcC5zb3VyY2VTcGFufWApO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEJvdW5kQXR0cmlidXRlKFxuICAgICAgICBwcm9wLm5hbWUsIHByb3AudHlwZSwgcHJvcC5zZWN1cml0eUNvbnRleHQsIHByb3AudmFsdWUsIHByb3AudW5pdCwgcHJvcC5zb3VyY2VTcGFuLFxuICAgICAgICBwcm9wLmtleVNwYW4sIHByb3AudmFsdWVTcGFuLCBpMThuKTtcbiAgfVxuXG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEJvdW5kQXR0cmlidXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCb3VuZEV2ZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU6IFBhcnNlZEV2ZW50VHlwZSwgcHVibGljIGhhbmRsZXI6IEFTVCxcbiAgICAgIHB1YmxpYyB0YXJnZXQ6IHN0cmluZ3xudWxsLCBwdWJsaWMgcGhhc2U6IHN0cmluZ3xudWxsLCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIGhhbmRsZXJTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG5cbiAgc3RhdGljIGZyb21QYXJzZWRFdmVudChldmVudDogUGFyc2VkRXZlbnQpIHtcbiAgICBjb25zdCB0YXJnZXQ6IHN0cmluZ3xudWxsID0gZXZlbnQudHlwZSA9PT0gUGFyc2VkRXZlbnRUeXBlLlJlZ3VsYXIgPyBldmVudC50YXJnZXRPclBoYXNlIDogbnVsbDtcbiAgICBjb25zdCBwaGFzZTogc3RyaW5nfG51bGwgPVxuICAgICAgICBldmVudC50eXBlID09PSBQYXJzZWRFdmVudFR5cGUuQW5pbWF0aW9uID8gZXZlbnQudGFyZ2V0T3JQaGFzZSA6IG51bGw7XG4gICAgcmV0dXJuIG5ldyBCb3VuZEV2ZW50KFxuICAgICAgICBldmVudC5uYW1lLCBldmVudC50eXBlLCBldmVudC5oYW5kbGVyLCB0YXJnZXQsIHBoYXNlLCBldmVudC5zb3VyY2VTcGFuLCBldmVudC5oYW5kbGVyU3Bhbik7XG4gIH1cblxuICB2aXNpdDxSZXN1bHQ+KHZpc2l0b3I6IFZpc2l0b3I8UmVzdWx0Pik6IFJlc3VsdCB7XG4gICAgcmV0dXJuIHZpc2l0b3IudmlzaXRCb3VuZEV2ZW50KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSwgcHVibGljIGlucHV0czogQm91bmRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdEVsZW1lbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRlbXBsYXRlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHRhZ05hbWU6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSwgcHVibGljIGlucHV0czogQm91bmRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBvdXRwdXRzOiBCb3VuZEV2ZW50W10sIHB1YmxpYyB0ZW1wbGF0ZUF0dHJzOiAoQm91bmRBdHRyaWJ1dGV8VGV4dEF0dHJpYnV0ZSlbXSxcbiAgICAgIHB1YmxpYyBjaGlsZHJlbjogTm9kZVtdLCBwdWJsaWMgcmVmZXJlbmNlczogUmVmZXJlbmNlW10sIHB1YmxpYyB2YXJpYWJsZXM6IFZhcmlhYmxlW10sXG4gICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLCBwdWJsaWMgc3RhcnRTb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICBwdWJsaWMgZW5kU291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFufG51bGwsIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFRlbXBsYXRlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb250ZW50IGltcGxlbWVudHMgTm9kZSB7XG4gIHJlYWRvbmx5IG5hbWUgPSAnbmctY29udGVudCc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgc2VsZWN0b3I6IHN0cmluZywgcHVibGljIGF0dHJpYnV0ZXM6IFRleHRBdHRyaWJ1dGVbXSxcbiAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyBpMThuPzogSTE4bk1ldGEpIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdENvbnRlbnQodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFZhcmlhYmxlIGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHZhbHVlOiBzdHJpbmcsIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4sXG4gICAgICByZWFkb25seSBrZXlTcGFuOiBQYXJzZVNvdXJjZVNwYW4sIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFZhcmlhYmxlKHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2UgaW1wbGVtZW50cyBOb2RlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgdmFsdWU6IHN0cmluZywgcHVibGljIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3BhbixcbiAgICAgIHB1YmxpYyB2YWx1ZVNwYW4/OiBQYXJzZVNvdXJjZVNwYW4pIHt9XG4gIHZpc2l0PFJlc3VsdD4odmlzaXRvcjogVmlzaXRvcjxSZXN1bHQ+KTogUmVzdWx0IHtcbiAgICByZXR1cm4gdmlzaXRvci52aXNpdFJlZmVyZW5jZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSWN1IGltcGxlbWVudHMgTm9kZSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZhcnM6IHtbbmFtZTogc3RyaW5nXTogQm91bmRUZXh0fSxcbiAgICAgIHB1YmxpYyBwbGFjZWhvbGRlcnM6IHtbbmFtZTogc3RyaW5nXTogVGV4dHxCb3VuZFRleHR9LCBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuLFxuICAgICAgcHVibGljIGkxOG4/OiBJMThuTWV0YSkge31cbiAgdmlzaXQ8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4pOiBSZXN1bHQge1xuICAgIHJldHVybiB2aXNpdG9yLnZpc2l0SWN1KHRoaXMpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlzaXRvcjxSZXN1bHQgPSBhbnk+IHtcbiAgLy8gUmV0dXJuaW5nIGEgdHJ1dGh5IHZhbHVlIGZyb20gYHZpc2l0KClgIHdpbGwgcHJldmVudCBgdmlzaXRBbGwoKWAgZnJvbSB0aGUgY2FsbCB0byB0aGUgdHlwZWRcbiAgLy8gbWV0aG9kIGFuZCByZXN1bHQgcmV0dXJuZWQgd2lsbCBiZWNvbWUgdGhlIHJlc3VsdCBpbmNsdWRlZCBpbiBgdmlzaXRBbGwoKWBzIHJlc3VsdCBhcnJheS5cbiAgdmlzaXQ/KG5vZGU6IE5vZGUpOiBSZXN1bHQ7XG5cbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBSZXN1bHQ7XG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogUmVzdWx0O1xuICB2aXNpdENvbnRlbnQoY29udGVudDogQ29udGVudCk6IFJlc3VsdDtcbiAgdmlzaXRWYXJpYWJsZSh2YXJpYWJsZTogVmFyaWFibGUpOiBSZXN1bHQ7XG4gIHZpc2l0UmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlKTogUmVzdWx0O1xuICB2aXNpdFRleHRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUZXh0QXR0cmlidXRlKTogUmVzdWx0O1xuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHJpYnV0ZTogQm91bmRBdHRyaWJ1dGUpOiBSZXN1bHQ7XG4gIHZpc2l0Qm91bmRFdmVudChhdHRyaWJ1dGU6IEJvdW5kRXZlbnQpOiBSZXN1bHQ7XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KTogUmVzdWx0O1xuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHQpOiBSZXN1bHQ7XG4gIHZpc2l0SWN1KGljdTogSWN1KTogUmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgTnVsbFZpc2l0b3IgaW1wbGVtZW50cyBWaXNpdG9yPHZvaWQ+IHtcbiAgdmlzaXRFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiB2b2lkIHt9XG4gIHZpc2l0VGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogdm9pZCB7fVxuICB2aXNpdENvbnRlbnQoY29udGVudDogQ29udGVudCk6IHZvaWQge31cbiAgdmlzaXRWYXJpYWJsZSh2YXJpYWJsZTogVmFyaWFibGUpOiB2b2lkIHt9XG4gIHZpc2l0UmVmZXJlbmNlKHJlZmVyZW5jZTogUmVmZXJlbmNlKTogdm9pZCB7fVxuICB2aXNpdFRleHRBdHRyaWJ1dGUoYXR0cmlidXRlOiBUZXh0QXR0cmlidXRlKTogdm9pZCB7fVxuICB2aXNpdEJvdW5kQXR0cmlidXRlKGF0dHJpYnV0ZTogQm91bmRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRFdmVudChhdHRyaWJ1dGU6IEJvdW5kRXZlbnQpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dCh0ZXh0OiBUZXh0KTogdm9pZCB7fVxuICB2aXNpdEJvdW5kVGV4dCh0ZXh0OiBCb3VuZFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0SWN1KGljdTogSWN1KTogdm9pZCB7fVxufVxuXG5leHBvcnQgY2xhc3MgUmVjdXJzaXZlVmlzaXRvciBpbXBsZW1lbnRzIFZpc2l0b3I8dm9pZD4ge1xuICB2aXNpdEVsZW1lbnQoZWxlbWVudDogRWxlbWVudCk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIGVsZW1lbnQuYXR0cmlidXRlcyk7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5jaGlsZHJlbik7XG4gICAgdmlzaXRBbGwodGhpcywgZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgfVxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IHZvaWQge1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLmF0dHJpYnV0ZXMpO1xuICAgIHZpc2l0QWxsKHRoaXMsIHRlbXBsYXRlLmNoaWxkcmVuKTtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS5yZWZlcmVuY2VzKTtcbiAgICB2aXNpdEFsbCh0aGlzLCB0ZW1wbGF0ZS52YXJpYWJsZXMpO1xuICB9XG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogdm9pZCB7fVxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IHZvaWQge31cbiAgdmlzaXRSZWZlcmVuY2UocmVmZXJlbmNlOiBSZWZlcmVuY2UpOiB2b2lkIHt9XG4gIHZpc2l0VGV4dEF0dHJpYnV0ZShhdHRyaWJ1dGU6IFRleHRBdHRyaWJ1dGUpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRBdHRyaWJ1dGUoYXR0cmlidXRlOiBCb3VuZEF0dHJpYnV0ZSk6IHZvaWQge31cbiAgdmlzaXRCb3VuZEV2ZW50KGF0dHJpYnV0ZTogQm91bmRFdmVudCk6IHZvaWQge31cbiAgdmlzaXRUZXh0KHRleHQ6IFRleHQpOiB2b2lkIHt9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IHZvaWQge31cbiAgdmlzaXRJY3UoaWN1OiBJY3UpOiB2b2lkIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1WaXNpdG9yIGltcGxlbWVudHMgVmlzaXRvcjxOb2RlPiB7XG4gIHZpc2l0RWxlbWVudChlbGVtZW50OiBFbGVtZW50KTogTm9kZSB7XG4gICAgY29uc3QgbmV3QXR0cmlidXRlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCBlbGVtZW50LmF0dHJpYnV0ZXMpO1xuICAgIGNvbnN0IG5ld0lucHV0cyA9IHRyYW5zZm9ybUFsbCh0aGlzLCBlbGVtZW50LmlucHV0cyk7XG4gICAgY29uc3QgbmV3T3V0cHV0cyA9IHRyYW5zZm9ybUFsbCh0aGlzLCBlbGVtZW50Lm91dHB1dHMpO1xuICAgIGNvbnN0IG5ld0NoaWxkcmVuID0gdHJhbnNmb3JtQWxsKHRoaXMsIGVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIGNvbnN0IG5ld1JlZmVyZW5jZXMgPSB0cmFuc2Zvcm1BbGwodGhpcywgZWxlbWVudC5yZWZlcmVuY2VzKTtcbiAgICBpZiAobmV3QXR0cmlidXRlcyAhPSBlbGVtZW50LmF0dHJpYnV0ZXMgfHwgbmV3SW5wdXRzICE9IGVsZW1lbnQuaW5wdXRzIHx8XG4gICAgICAgIG5ld091dHB1dHMgIT0gZWxlbWVudC5vdXRwdXRzIHx8IG5ld0NoaWxkcmVuICE9IGVsZW1lbnQuY2hpbGRyZW4gfHxcbiAgICAgICAgbmV3UmVmZXJlbmNlcyAhPSBlbGVtZW50LnJlZmVyZW5jZXMpIHtcbiAgICAgIHJldHVybiBuZXcgRWxlbWVudChcbiAgICAgICAgICBlbGVtZW50Lm5hbWUsIG5ld0F0dHJpYnV0ZXMsIG5ld0lucHV0cywgbmV3T3V0cHV0cywgbmV3Q2hpbGRyZW4sIG5ld1JlZmVyZW5jZXMsXG4gICAgICAgICAgZWxlbWVudC5zb3VyY2VTcGFuLCBlbGVtZW50LnN0YXJ0U291cmNlU3BhbiwgZWxlbWVudC5lbmRTb3VyY2VTcGFuKTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBUZW1wbGF0ZSk6IE5vZGUge1xuICAgIGNvbnN0IG5ld0F0dHJpYnV0ZXMgPSB0cmFuc2Zvcm1BbGwodGhpcywgdGVtcGxhdGUuYXR0cmlidXRlcyk7XG4gICAgY29uc3QgbmV3SW5wdXRzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLmlucHV0cyk7XG4gICAgY29uc3QgbmV3T3V0cHV0cyA9IHRyYW5zZm9ybUFsbCh0aGlzLCB0ZW1wbGF0ZS5vdXRwdXRzKTtcbiAgICBjb25zdCBuZXdUZW1wbGF0ZUF0dHJzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLnRlbXBsYXRlQXR0cnMpO1xuICAgIGNvbnN0IG5ld0NoaWxkcmVuID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLmNoaWxkcmVuKTtcbiAgICBjb25zdCBuZXdSZWZlcmVuY2VzID0gdHJhbnNmb3JtQWxsKHRoaXMsIHRlbXBsYXRlLnJlZmVyZW5jZXMpO1xuICAgIGNvbnN0IG5ld1ZhcmlhYmxlcyA9IHRyYW5zZm9ybUFsbCh0aGlzLCB0ZW1wbGF0ZS52YXJpYWJsZXMpO1xuICAgIGlmIChuZXdBdHRyaWJ1dGVzICE9IHRlbXBsYXRlLmF0dHJpYnV0ZXMgfHwgbmV3SW5wdXRzICE9IHRlbXBsYXRlLmlucHV0cyB8fFxuICAgICAgICBuZXdPdXRwdXRzICE9IHRlbXBsYXRlLm91dHB1dHMgfHwgbmV3VGVtcGxhdGVBdHRycyAhPSB0ZW1wbGF0ZS50ZW1wbGF0ZUF0dHJzIHx8XG4gICAgICAgIG5ld0NoaWxkcmVuICE9IHRlbXBsYXRlLmNoaWxkcmVuIHx8IG5ld1JlZmVyZW5jZXMgIT0gdGVtcGxhdGUucmVmZXJlbmNlcyB8fFxuICAgICAgICBuZXdWYXJpYWJsZXMgIT0gdGVtcGxhdGUudmFyaWFibGVzKSB7XG4gICAgICByZXR1cm4gbmV3IFRlbXBsYXRlKFxuICAgICAgICAgIHRlbXBsYXRlLnRhZ05hbWUsIG5ld0F0dHJpYnV0ZXMsIG5ld0lucHV0cywgbmV3T3V0cHV0cywgbmV3VGVtcGxhdGVBdHRycywgbmV3Q2hpbGRyZW4sXG4gICAgICAgICAgbmV3UmVmZXJlbmNlcywgbmV3VmFyaWFibGVzLCB0ZW1wbGF0ZS5zb3VyY2VTcGFuLCB0ZW1wbGF0ZS5zdGFydFNvdXJjZVNwYW4sXG4gICAgICAgICAgdGVtcGxhdGUuZW5kU291cmNlU3Bhbik7XG4gICAgfVxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfVxuXG4gIHZpc2l0Q29udGVudChjb250ZW50OiBDb250ZW50KTogTm9kZSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICB2aXNpdFZhcmlhYmxlKHZhcmlhYmxlOiBWYXJpYWJsZSk6IE5vZGUge1xuICAgIHJldHVybiB2YXJpYWJsZTtcbiAgfVxuICB2aXNpdFJlZmVyZW5jZShyZWZlcmVuY2U6IFJlZmVyZW5jZSk6IE5vZGUge1xuICAgIHJldHVybiByZWZlcmVuY2U7XG4gIH1cbiAgdmlzaXRUZXh0QXR0cmlidXRlKGF0dHJpYnV0ZTogVGV4dEF0dHJpYnV0ZSk6IE5vZGUge1xuICAgIHJldHVybiBhdHRyaWJ1dGU7XG4gIH1cbiAgdmlzaXRCb3VuZEF0dHJpYnV0ZShhdHRyaWJ1dGU6IEJvdW5kQXR0cmlidXRlKTogTm9kZSB7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxuICB2aXNpdEJvdW5kRXZlbnQoYXR0cmlidXRlOiBCb3VuZEV2ZW50KTogTm9kZSB7XG4gICAgcmV0dXJuIGF0dHJpYnV0ZTtcbiAgfVxuICB2aXNpdFRleHQodGV4dDogVGV4dCk6IE5vZGUge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG4gIHZpc2l0Qm91bmRUZXh0KHRleHQ6IEJvdW5kVGV4dCk6IE5vZGUge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG4gIHZpc2l0SWN1KGljdTogSWN1KTogTm9kZSB7XG4gICAgcmV0dXJuIGljdTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmlzaXRBbGw8UmVzdWx0Pih2aXNpdG9yOiBWaXNpdG9yPFJlc3VsdD4sIG5vZGVzOiBOb2RlW10pOiBSZXN1bHRbXSB7XG4gIGNvbnN0IHJlc3VsdDogUmVzdWx0W10gPSBbXTtcbiAgaWYgKHZpc2l0b3IudmlzaXQpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIGNvbnN0IG5ld05vZGUgPSB2aXNpdG9yLnZpc2l0KG5vZGUpIHx8IG5vZGUudmlzaXQodmlzaXRvcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgY29uc3QgbmV3Tm9kZSA9IG5vZGUudmlzaXQodmlzaXRvcik7XG4gICAgICBpZiAobmV3Tm9kZSkge1xuICAgICAgICByZXN1bHQucHVzaChuZXdOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybUFsbDxSZXN1bHQgZXh0ZW5kcyBOb2RlPihcbiAgICB2aXNpdG9yOiBWaXNpdG9yPE5vZGU+LCBub2RlczogUmVzdWx0W10pOiBSZXN1bHRbXSB7XG4gIGNvbnN0IHJlc3VsdDogUmVzdWx0W10gPSBbXTtcbiAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgY29uc3QgbmV3Tm9kZSA9IG5vZGUudmlzaXQodmlzaXRvcik7XG4gICAgaWYgKG5ld05vZGUpIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5ld05vZGUgYXMgUmVzdWx0KTtcbiAgICB9XG4gICAgY2hhbmdlZCA9IGNoYW5nZWQgfHwgbmV3Tm9kZSAhPSBub2RlO1xuICB9XG4gIHJldHVybiBjaGFuZ2VkID8gcmVzdWx0IDogbm9kZXM7XG59XG4iXX0=