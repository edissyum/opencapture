"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickOutsideModule = void 0;
var core_1 = require("@angular/core");
var click_outside_directive_1 = require("./click-outside.directive");
var ClickOutsideModule = (function () {
    function ClickOutsideModule() {
    }
    ClickOutsideModule.decorators = [
        { type: core_1.NgModule, args: [{
                    declarations: [click_outside_directive_1.ClickOutsideDirective],
                    exports: [click_outside_directive_1.ClickOutsideDirective]
                },] }
    ];
    return ClickOutsideModule;
}());
exports.ClickOutsideModule = ClickOutsideModule;
