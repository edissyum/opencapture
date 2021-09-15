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
 * Holds the configuration of card settings in kanban board.
 */
var CardSettings = /** @class */ (function (_super) {
    __extends(CardSettings, _super);
    function CardSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], CardSettings.prototype, "showHeader", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "headerField", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "contentField", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "tagsField", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "grabberField", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "footerCssField", void 0);
    __decorate([
        Property()
    ], CardSettings.prototype, "template", void 0);
    __decorate([
        Property('Single')
    ], CardSettings.prototype, "selectionType", void 0);
    return CardSettings;
}(ChildProperty));
export { CardSettings };
