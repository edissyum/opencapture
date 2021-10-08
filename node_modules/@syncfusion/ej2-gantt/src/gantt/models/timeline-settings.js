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
import { Property, ChildProperty, Complex } from '@syncfusion/ej2-base';
/**
 * Configures timeline settings of Gantt.
 */
var TimelineTierSettings = /** @class */ (function (_super) {
    __extends(TimelineTierSettings, _super);
    function TimelineTierSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], TimelineTierSettings.prototype, "format", void 0);
    __decorate([
        Property('None')
    ], TimelineTierSettings.prototype, "unit", void 0);
    __decorate([
        Property(1)
    ], TimelineTierSettings.prototype, "count", void 0);
    __decorate([
        Property(null)
    ], TimelineTierSettings.prototype, "formatter", void 0);
    return TimelineTierSettings;
}(ChildProperty));
export { TimelineTierSettings };
/**
 * Configures the timeline settings property in the Gantt.
 */
var TimelineSettings = /** @class */ (function (_super) {
    __extends(TimelineSettings, _super);
    function TimelineSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Week')
    ], TimelineSettings.prototype, "timelineViewMode", void 0);
    __decorate([
        Complex({}, TimelineTierSettings)
    ], TimelineSettings.prototype, "topTier", void 0);
    __decorate([
        Complex({}, TimelineTierSettings)
    ], TimelineSettings.prototype, "bottomTier", void 0);
    __decorate([
        Property(33)
    ], TimelineSettings.prototype, "timelineUnitSize", void 0);
    __decorate([
        Property(0)
    ], TimelineSettings.prototype, "weekStartDay", void 0);
    __decorate([
        Property(null)
    ], TimelineSettings.prototype, "weekendBackground", void 0);
    __decorate([
        Property(true)
    ], TimelineSettings.prototype, "showTooltip", void 0);
    __decorate([
        Property(true)
    ], TimelineSettings.prototype, "updateTimescaleView", void 0);
    return TimelineSettings;
}(ChildProperty));
export { TimelineSettings };
