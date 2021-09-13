Object.defineProperty(exports, "__esModule", { value: true });
exports.NamespacedJsonCompiler = void 0;
const translation_collection_1 = require("../utils/translation.collection");
const utils_1 = require("../utils/utils");
const flat_1 = require("flat");
class NamespacedJsonCompiler {
    constructor(options) {
        this.indentation = '\t';
        this.extension = 'json';
        if (options && typeof options.indentation !== 'undefined') {
            this.indentation = options.indentation;
        }
    }
    compile(collection) {
        const values = flat_1.unflatten(collection.values, {
            object: true
        });
        return JSON.stringify(values, null, this.indentation);
    }
    parse(contents) {
        const values = flat_1.flatten(JSON.parse(utils_1.stripBOM(contents)));
        return new translation_collection_1.TranslationCollection(values);
    }
}
exports.NamespacedJsonCompiler = NamespacedJsonCompiler;
//# sourceMappingURL=namespaced-json.compiler.js.map