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
import { Margin } from '../core/appearance';
import { Property, Complex, ChildProperty } from '@syncfusion/ej2-base';
/**
 * Defines the behavior of the automatic layouts
 */
var Layout = /** @class */ (function (_super) {
    __extends(Layout, _super);
    function Layout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Layout.prototype, "fixedNode", void 0);
    __decorate([
        Property(30)
    ], Layout.prototype, "horizontalSpacing", void 0);
    __decorate([
        Property('SamePoint')
    ], Layout.prototype, "connectionPointOrigin", void 0);
    __decorate([
        Property('Nonlinear')
    ], Layout.prototype, "arrangement", void 0);
    __decorate([
        Property(30)
    ], Layout.prototype, "verticalSpacing", void 0);
    __decorate([
        Property(30)
    ], Layout.prototype, "maxIteration", void 0);
    __decorate([
        Property(40)
    ], Layout.prototype, "springFactor", void 0);
    __decorate([
        Property(50)
    ], Layout.prototype, "springLength", void 0);
    __decorate([
        Complex({ left: 50, top: 50, right: 0, bottom: 0 }, Margin)
    ], Layout.prototype, "margin", void 0);
    __decorate([
        Property('Auto')
    ], Layout.prototype, "horizontalAlignment", void 0);
    __decorate([
        Property('Auto')
    ], Layout.prototype, "verticalAlignment", void 0);
    __decorate([
        Property('TopToBottom')
    ], Layout.prototype, "orientation", void 0);
    __decorate([
        Property('Auto')
    ], Layout.prototype, "connectionDirection", void 0);
    __decorate([
        Property('Default')
    ], Layout.prototype, "connectorSegments", void 0);
    __decorate([
        Property('None')
    ], Layout.prototype, "type", void 0);
    __decorate([
        Property()
    ], Layout.prototype, "getLayoutInfo", void 0);
    __decorate([
        Property()
    ], Layout.prototype, "layoutInfo", void 0);
    __decorate([
        Property()
    ], Layout.prototype, "getBranch", void 0);
    __decorate([
        Property()
    ], Layout.prototype, "bounds", void 0);
    __decorate([
        Property(true)
    ], Layout.prototype, "enableAnimation", void 0);
    __decorate([
        Property(false)
    ], Layout.prototype, "enableRouting", void 0);
    __decorate([
        Property('')
    ], Layout.prototype, "root", void 0);
    return Layout;
}(ChildProperty));
export { Layout };
