Object.defineProperty(exports, "__esModule", { value: true });
exports.stripBOM = exports.extractComponentInlineTemplate = exports.isPathAngularComponent = void 0;
function isPathAngularComponent(path) {
    return /\.ts|js$/i.test(path);
}
exports.isPathAngularComponent = isPathAngularComponent;
function extractComponentInlineTemplate(contents) {
    const regExp = /template\s*:\s*(["'`])([^\1]*?)\1/;
    const match = regExp.exec(contents);
    if (match !== null) {
        return match[2];
    }
    return '';
}
exports.extractComponentInlineTemplate = extractComponentInlineTemplate;
function stripBOM(contents) {
    return contents.trim();
}
exports.stripBOM = stripBOM;
//# sourceMappingURL=utils.js.map