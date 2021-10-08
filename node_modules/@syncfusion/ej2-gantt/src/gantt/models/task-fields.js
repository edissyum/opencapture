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
import { Property, ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines mapping property to get task details from data source.
 */
var TaskFields = /** @class */ (function (_super) {
    __extends(TaskFields, _super);
    function TaskFields() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(null)
    ], TaskFields.prototype, "id", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "name", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "parentID", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "startDate", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "endDate", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "dependency", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "progress", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "child", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "milestone", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "duration", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "durationUnit", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "cssClass", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "baselineStartDate", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "baselineEndDate", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "resourceInfo", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "expandState", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "indicators", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "notes", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "work", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "manual", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "type", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "segments", void 0);
    __decorate([
        Property(null)
    ], TaskFields.prototype, "segmentId", void 0);
    return TaskFields;
}(ChildProperty));
export { TaskFields };
