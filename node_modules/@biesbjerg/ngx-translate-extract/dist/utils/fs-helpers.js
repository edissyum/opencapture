Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePaths = exports.expandPattern = exports.normalizeHomeDir = void 0;
const os = require("os");
const fs = require("fs");
const braces = require("braces");
function normalizeHomeDir(path) {
    if (path.substring(0, 1) === '~') {
        return `${os.homedir()}/${path.substring(1)}`;
    }
    return path;
}
exports.normalizeHomeDir = normalizeHomeDir;
function expandPattern(pattern) {
    return braces(pattern, { expand: true, keepEscaping: true });
}
exports.expandPattern = expandPattern;
function normalizePaths(patterns, defaultPatterns = []) {
    return patterns
        .map((pattern) => expandPattern(pattern)
        .map((path) => {
        path = normalizeHomeDir(path);
        if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
            return defaultPatterns.map((defaultPattern) => path + defaultPattern);
        }
        return path;
    })
        .flat())
        .flat();
}
exports.normalizePaths = normalizePaths;
//# sourceMappingURL=fs-helpers.js.map