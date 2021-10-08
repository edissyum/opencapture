var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ChildProperty, Property, Collection } from '@syncfusion/ej2-base';
/**
 * Represents the field name and direction of sort column.
 */
var SortDescriptor = /** @class */ (function (_super) {
    __extends(SortDescriptor, _super);
    function SortDescriptor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property()
    ], SortDescriptor.prototype, "field", void 0);
    __decorate([
        Property()
    ], SortDescriptor.prototype, "direction", void 0);
    return SortDescriptor;
}(ChildProperty));
export { SortDescriptor };
/**
 * Configures the sorting behavior of Gantt.
 */
var SortSettings = /** @class */ (function (_super) {
    __extends(SortSettings, _super);
    function SortSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], SortDescriptor)
    ], SortSettings.prototype, "columns", void 0);
    __decorate([
        Property(true)
    ], SortSettings.prototype, "allowUnsort", void 0);
    return SortSettings;
}(ChildProperty));
export { SortSettings };
