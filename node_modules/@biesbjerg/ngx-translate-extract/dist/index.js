var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./utils/translation.collection"), exports);
__exportStar(require("./utils/utils"), exports);
__exportStar(require("./cli/cli"), exports);
__exportStar(require("./cli/tasks/task.interface"), exports);
__exportStar(require("./cli/tasks/extract.task"), exports);
__exportStar(require("./parsers/parser.interface"), exports);
__exportStar(require("./parsers/directive.parser"), exports);
__exportStar(require("./parsers/pipe.parser"), exports);
__exportStar(require("./parsers/service.parser"), exports);
__exportStar(require("./parsers/marker.parser"), exports);
__exportStar(require("./compilers/compiler.interface"), exports);
__exportStar(require("./compilers/compiler.factory"), exports);
__exportStar(require("./compilers/json.compiler"), exports);
__exportStar(require("./compilers/namespaced-json.compiler"), exports);
__exportStar(require("./compilers/po.compiler"), exports);
__exportStar(require("./post-processors/post-processor.interface"), exports);
__exportStar(require("./post-processors/key-as-default-value.post-processor"), exports);
__exportStar(require("./post-processors/purge-obsolete-keys.post-processor"), exports);
__exportStar(require("./post-processors/sort-by-key.post-processor"), exports);
//# sourceMappingURL=index.js.map