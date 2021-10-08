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
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
import { AnimationSettings, PositionData } from '@syncfusion/ej2-popups';
/**
 * Holds the configuration of edit dialog.
 */
var KanbanDialog = /** @class */ (function (_super) {
    __extends(KanbanDialog, _super);
    function KanbanDialog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(false)
    ], KanbanDialog.prototype, "allowDragging", void 0);
    __decorate([
        Complex({}, AnimationSettings)
    ], KanbanDialog.prototype, "animationSettings", void 0);
    __decorate([
        Property(true)
    ], KanbanDialog.prototype, "closeOnEscape", void 0);
    __decorate([
        Property('')
    ], KanbanDialog.prototype, "cssClass", void 0);
    __decorate([
        Property(false)
    ], KanbanDialog.prototype, "enableResize", void 0);
    __decorate([
        Property('auto')
    ], KanbanDialog.prototype, "height", void 0);
    __decorate([
        Property(true)
    ], KanbanDialog.prototype, "isModal", void 0);
    __decorate([
        Property('')
    ], KanbanDialog.prototype, "minHeight", void 0);
    __decorate([
        Complex({ X: 'center', Y: 'center' }, PositionData)
    ], KanbanDialog.prototype, "position", void 0);
    __decorate([
        Property(true)
    ], KanbanDialog.prototype, "showCloseIcon", void 0);
    __decorate([
        Property(null)
    ], KanbanDialog.prototype, "target", void 0);
    __decorate([
        Property(350)
    ], KanbanDialog.prototype, "width", void 0);
    __decorate([
        Property(1000)
    ], KanbanDialog.prototype, "zIndex", void 0);
    return KanbanDialog;
}(ChildProperty));
export { KanbanDialog };
