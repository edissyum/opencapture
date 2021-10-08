"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAdd = void 0;
const tasks_1 = require("@angular-devkit/schematics/tasks");
function ngAdd(_options) {
    return (tree, _context) => {
        _context.addTask(new tasks_1.NodePackageInstallTask());
        return tree;
    };
}
exports.ngAdd = ngAdd;
//# sourceMappingURL=index.js.map