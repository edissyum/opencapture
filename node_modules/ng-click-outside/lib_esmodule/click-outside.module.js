import { NgModule } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';
var ClickOutsideModule = (function () {
    function ClickOutsideModule() {
    }
    ClickOutsideModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [ClickOutsideDirective],
                    exports: [ClickOutsideDirective]
                },] }
    ];
    return ClickOutsideModule;
}());
export { ClickOutsideModule };
