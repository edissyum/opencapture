"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecColorsProcessor = void 0;
var display_processor_1 = require("../display-processor");
var SpecColorsProcessor = /** @class */ (function (_super) {
    __extends(SpecColorsProcessor, _super);
    function SpecColorsProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SpecColorsProcessor.prototype.displaySuccessfulSpec = function (spec, log) {
        return this.theme.successful(log);
    };
    SpecColorsProcessor.prototype.displayFailedSpec = function (spec, log) {
        return this.theme.failed(log);
    };
    SpecColorsProcessor.prototype.displayPendingSpec = function (spec, log) {
        return this.theme.pending(log);
    };
    return SpecColorsProcessor;
}(display_processor_1.DisplayProcessor));
exports.SpecColorsProcessor = SpecColorsProcessor;
//# sourceMappingURL=spec-colors-processor.js.map