"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theme = void 0;
// tslint:disable-next-line:no-submodule-imports
var colors = require("colors/safe");
var colorsTheme = colors;
var Theme = /** @class */ (function () {
    function Theme(configuration) {
        configuration.colors.enabled ? colors.enable() : colors.disable();
        colors.setTheme({
            failed: configuration.colors.failed,
            pending: configuration.colors.pending,
            successful: configuration.colors.successful,
            prettyStacktraceFilename: configuration.colors.prettyStacktraceFilename,
            prettyStacktraceLineNumber: configuration.colors.prettyStacktraceLineNumber,
            prettyStacktraceColumnNumber: configuration.colors.prettyStacktraceColumnNumber,
            prettyStacktraceError: configuration.colors.prettyStacktraceError,
        });
    }
    Theme.prototype.successful = function (str) {
        return colorsTheme.successful(str);
    };
    Theme.prototype.failed = function (str) {
        return colorsTheme.failed(str);
    };
    Theme.prototype.pending = function (str) {
        return colorsTheme.pending(str);
    };
    Theme.prototype.prettyStacktraceFilename = function (str) {
        return colorsTheme.prettyStacktraceFilename(str);
    };
    Theme.prototype.prettyStacktraceLineNumber = function (str) {
        return colorsTheme.prettyStacktraceLineNumber(str);
    };
    Theme.prototype.prettyStacktraceColumnNumber = function (str) {
        return colorsTheme.prettyStacktraceColumnNumber(str);
    };
    Theme.prototype.prettyStacktraceError = function (str) {
        return colorsTheme.prettyStacktraceError(str);
    };
    return Theme;
}());
exports.Theme = Theme;
//# sourceMappingURL=theme.js.map