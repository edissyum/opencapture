Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectiveParser = void 0;
const compiler_1 = require("@angular/compiler");
const translation_collection_1 = require("../utils/translation.collection");
const utils_1 = require("../utils/utils");
const TRANSLATE_ATTR_NAME = 'translate';
class DirectiveParser {
    extract(source, filePath) {
        let collection = new translation_collection_1.TranslationCollection();
        if (filePath && utils_1.isPathAngularComponent(filePath)) {
            source = utils_1.extractComponentInlineTemplate(source);
        }
        const nodes = this.parseTemplate(source, filePath);
        const elements = this.getElementsWithTranslateAttribute(nodes);
        elements.forEach((element) => {
            const attribute = this.getAttribute(element, TRANSLATE_ATTR_NAME);
            if (attribute === null || attribute === void 0 ? void 0 : attribute.value) {
                collection = collection.add(attribute.value);
                return;
            }
            const boundAttribute = this.getBoundAttribute(element, TRANSLATE_ATTR_NAME);
            if (boundAttribute === null || boundAttribute === void 0 ? void 0 : boundAttribute.value) {
                this.getLiteralPrimitives(boundAttribute.value).forEach((literalPrimitive) => {
                    collection = collection.add(literalPrimitive.value);
                });
                return;
            }
            const textNodes = this.getTextNodes(element);
            textNodes.forEach((textNode) => {
                collection = collection.add(textNode.value.trim());
            });
        });
        return collection;
    }
    getElementsWithTranslateAttribute(nodes) {
        let elements = [];
        nodes.filter(this.isElementLike).forEach((element) => {
            if (this.hasAttribute(element, TRANSLATE_ATTR_NAME)) {
                elements = [...elements, element];
            }
            if (this.hasBoundAttribute(element, TRANSLATE_ATTR_NAME)) {
                elements = [...elements, element];
            }
            const childElements = this.getElementsWithTranslateAttribute(element.children);
            if (childElements.length) {
                elements = [...elements, ...childElements];
            }
        });
        return elements;
    }
    getTextNodes(element) {
        return element.children.filter(this.isText);
    }
    hasAttribute(element, name) {
        return this.getAttribute(element, name) !== undefined;
    }
    getAttribute(element, name) {
        return element.attributes.find((attribute) => attribute.name === name);
    }
    hasBoundAttribute(element, name) {
        return this.getBoundAttribute(element, name) !== undefined;
    }
    getBoundAttribute(element, name) {
        return element.inputs.find((input) => input.name === name);
    }
    getLiteralPrimitives(exp) {
        if (exp instanceof compiler_1.LiteralPrimitive) {
            return [exp];
        }
        let visit = [];
        if (exp instanceof compiler_1.Interpolation) {
            visit = exp.expressions;
        }
        else if (exp instanceof compiler_1.LiteralArray) {
            visit = exp.expressions;
        }
        else if (exp instanceof compiler_1.LiteralMap) {
            visit = exp.values;
        }
        else if (exp instanceof compiler_1.BindingPipe) {
            visit = [exp.exp];
        }
        else if (exp instanceof compiler_1.Conditional) {
            visit = [exp.trueExp, exp.falseExp];
        }
        else if (exp instanceof compiler_1.Binary) {
            visit = [exp.left, exp.right];
        }
        else if (exp instanceof compiler_1.ASTWithSource) {
            visit = [exp.ast];
        }
        let results = [];
        visit.forEach((child) => {
            results = [...results, ...this.getLiteralPrimitives(child)];
        });
        return results;
    }
    isElementLike(node) {
        return node instanceof compiler_1.TmplAstElement || node instanceof compiler_1.TmplAstTemplate;
    }
    isText(node) {
        return node instanceof compiler_1.TmplAstText;
    }
    parseTemplate(template, path) {
        return compiler_1.parseTemplate(template, path).nodes;
    }
}
exports.DirectiveParser = DirectiveParser;
//# sourceMappingURL=directive.parser.js.map