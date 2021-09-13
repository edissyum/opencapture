Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkerParser = void 0;
const tsquery_1 = require("@phenomnomnominal/tsquery");
const translation_collection_1 = require("../utils/translation.collection");
const ast_helpers_1 = require("../utils/ast-helpers");
const MARKER_MODULE_NAME = '@biesbjerg/ngx-translate-extract-marker';
const MARKER_IMPORT_NAME = 'marker';
class MarkerParser {
    extract(source, filePath) {
        const sourceFile = tsquery_1.tsquery.ast(source, filePath);
        const markerImportName = ast_helpers_1.getNamedImportAlias(sourceFile, MARKER_MODULE_NAME, MARKER_IMPORT_NAME);
        if (!markerImportName) {
            return null;
        }
        let collection = new translation_collection_1.TranslationCollection();
        const callExpressions = ast_helpers_1.findFunctionCallExpressions(sourceFile, markerImportName);
        callExpressions.forEach((callExpression) => {
            const [firstArg] = callExpression.arguments;
            if (!firstArg) {
                return;
            }
            const strings = ast_helpers_1.getStringsFromExpression(firstArg);
            collection = collection.addKeys(strings);
        });
        return collection;
    }
}
exports.MarkerParser = MarkerParser;
//# sourceMappingURL=marker.parser.js.map