Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonCompiler = void 0;
const translation_collection_1 = require("../utils/translation.collection");
const utils_1 = require("../utils/utils");
const flat_1 = require("flat");
class JsonCompiler {
    constructor(options) {
        this.indentation = '\t';
        this.extension = 'json';
        if (options && typeof options.indentation !== 'undefined') {
            this.indentation = options.indentation;
        }
    }
    compile(collection) {
        return JSON.stringify(collection.values, null, this.indentation);
    }
    parse(contents) {
        let values = JSON.parse(utils_1.stripBOM(contents));
        if (this.isNamespacedJsonFormat(values)) {
            values = flat_1.flatten(values);
        }
        return new translation_collection_1.TranslationCollection(values);
    }
    isNamespacedJsonFormat(values) {
        return Object.keys(values).some((key) => typeof values[key] === 'object');
    }
}
exports.JsonCompiler = JsonCompiler;
//# sourceMappingURL=json.compiler.js.map