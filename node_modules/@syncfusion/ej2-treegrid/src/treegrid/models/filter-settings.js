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
import { Collection, Property, ChildProperty } from '@syncfusion/ej2-base';
/**
 * Represents the Tree Grid predicate for the filter column.
 */
var Predicate = /** @class */ (function (_super) {
    __extends(Predicate, _super);
    function Predicate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property()
    ], Predicate.prototype, "field", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "operator", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "value", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "matchCase", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "ignoreAccent", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "predicate", void 0);
    __decorate([
        Property({})
    ], Predicate.prototype, "actualFilterValue", void 0);
    __decorate([
        Property({})
    ], Predicate.prototype, "actualOperator", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "type", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "ejpredicate", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "uid", void 0);
    __decorate([
        Property()
    ], Predicate.prototype, "isForeignKey", void 0);
    return Predicate;
}(ChildProperty));
export { Predicate };
/**
 * Configures the filtering behavior of the TreeGrid.
 */
var FilterSettings = /** @class */ (function (_super) {
    __extends(FilterSettings, _super);
    function FilterSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Collection([], Predicate)
    ], FilterSettings.prototype, "columns", void 0);
    __decorate([
        Property('FilterBar')
    ], FilterSettings.prototype, "type", void 0);
    __decorate([
        Property()
    ], FilterSettings.prototype, "mode", void 0);
    __decorate([
        Property(true)
    ], FilterSettings.prototype, "showFilterBarStatus", void 0);
    __decorate([
        Property(1500)
    ], FilterSettings.prototype, "immediateModeDelay", void 0);
    __decorate([
        Property()
    ], FilterSettings.prototype, "operators", void 0);
    __decorate([
        Property(false)
    ], FilterSettings.prototype, "ignoreAccent", void 0);
    __decorate([
        Property('Parent')
    ], FilterSettings.prototype, "hierarchyMode", void 0);
    return FilterSettings;
}(ChildProperty));
export { FilterSettings };
