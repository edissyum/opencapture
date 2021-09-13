Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerFactory = void 0;
const json_compiler_1 = require("../compilers/json.compiler");
const namespaced_json_compiler_1 = require("../compilers/namespaced-json.compiler");
const po_compiler_1 = require("../compilers/po.compiler");
class CompilerFactory {
    static create(format, options) {
        switch (format) {
            case 'pot':
                return new po_compiler_1.PoCompiler(options);
            case 'json':
                return new json_compiler_1.JsonCompiler(options);
            case 'namespaced-json':
                return new namespaced_json_compiler_1.NamespacedJsonCompiler(options);
            default:
                throw new Error(`Unknown format: ${format}`);
        }
    }
}
exports.CompilerFactory = CompilerFactory;
//# sourceMappingURL=compiler.factory.js.map