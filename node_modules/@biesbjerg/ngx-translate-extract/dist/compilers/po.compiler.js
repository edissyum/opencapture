Object.defineProperty(exports, "__esModule", { value: true });
exports.PoCompiler = void 0;
const translation_collection_1 = require("../utils/translation.collection");
const gettext_parser_1 = require("gettext-parser");
class PoCompiler {
    constructor(options) {
        this.extension = 'po';
        this.domain = '';
    }
    compile(collection) {
        const data = {
            charset: 'utf-8',
            headers: {
                'mime-version': '1.0',
                'content-type': 'text/plain; charset=utf-8',
                'content-transfer-encoding': '8bit'
            },
            translations: {
                [this.domain]: Object.keys(collection.values).reduce((translations, key) => {
                    return {
                        ...translations,
                        [key]: {
                            msgid: key,
                            msgstr: collection.get(key)
                        }
                    };
                }, {})
            }
        };
        return gettext_parser_1.po.compile(data).toString('utf8');
    }
    parse(contents) {
        const collection = new translation_collection_1.TranslationCollection();
        const parsedPo = gettext_parser_1.po.parse(contents, 'utf8');
        if (!parsedPo.translations.hasOwnProperty(this.domain)) {
            return collection;
        }
        const values = Object.keys(parsedPo.translations[this.domain])
            .filter((key) => key.length > 0)
            .reduce((result, key) => {
            return {
                ...result,
                [key]: parsedPo.translations[this.domain][key].msgstr.pop()
            };
        }, {});
        return new translation_collection_1.TranslationCollection(values);
    }
}
exports.PoCompiler = PoCompiler;
//# sourceMappingURL=po.compiler.js.map