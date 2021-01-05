Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceParser = void 0;
const tsquery_1 = require("@phenomnomnominal/tsquery");
const translation_collection_1 = require("../utils/translation.collection");
const ast_helpers_1 = require("../utils/ast-helpers");
const TRANSLATE_SERVICE_TYPE_REFERENCE = 'TranslateService';
const TRANSLATE_SERVICE_METHOD_NAMES = ['get', 'instant', 'stream'];
class ServiceParser {
    extract(source, filePath) {
        const sourceFile = tsquery_1.tsquery.ast(source, filePath);
        const classDeclarations = ast_helpers_1.findClassDeclarations(sourceFile);
        if (!classDeclarations) {
            return null;
        }
        let collection = new translation_collection_1.TranslationCollection();
        classDeclarations.forEach((classDeclaration) => {
            const callExpressions = [
                ...this.findConstructorParamCallExpressions(classDeclaration),
                ...this.findPropertyCallExpressions(classDeclaration)
            ];
            callExpressions.forEach((callExpression) => {
                const [firstArg] = callExpression.arguments;
                if (!firstArg) {
                    return;
                }
                const strings = ast_helpers_1.getStringsFromExpression(firstArg);
                collection = collection.addKeys(strings);
            });
        });
        return collection;
    }
    findConstructorParamCallExpressions(classDeclaration) {
        const constructorDeclaration = ast_helpers_1.findConstructorDeclaration(classDeclaration);
        if (!constructorDeclaration) {
            return [];
        }
        const paramName = ast_helpers_1.findMethodParameterByType(constructorDeclaration, TRANSLATE_SERVICE_TYPE_REFERENCE);
        return ast_helpers_1.findMethodCallExpressions(constructorDeclaration, paramName, TRANSLATE_SERVICE_METHOD_NAMES);
    }
    findPropertyCallExpressions(classDeclaration) {
        const propName = ast_helpers_1.findClassPropertyByType(classDeclaration, TRANSLATE_SERVICE_TYPE_REFERENCE);
        if (!propName) {
            return [];
        }
        return ast_helpers_1.findPropertyCallExpressions(classDeclaration, propName, TRANSLATE_SERVICE_METHOD_NAMES);
    }
}
exports.ServiceParser = ServiceParser;
//# sourceMappingURL=service.parser.js.map