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
 * Interface for a class Column
 */
/* istanbul ignore next */
var Column = /** @class */ (function (_super) {
    __extends(Column, _super);
    function Column() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('')
    ], Column.prototype, "field", void 0);
    __decorate([
        Property('')
    ], Column.prototype, "headerText", void 0);
    __decorate([
        Property('')
    ], Column.prototype, "width", void 0);
    __decorate([
        Property('')
    ], Column.prototype, "minWidth", void 0);
    __decorate([
        Property('')
    ], Column.prototype, "maxWidth", void 0);
    __decorate([
        Property('Left')
    ], Column.prototype, "textAlign", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "headerTextAlign", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "type", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "format", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "template", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "headerTemplate", void 0);
    __decorate([
        Property(true)
    ], Column.prototype, "allowSorting", void 0);
    __decorate([
        Property(true)
    ], Column.prototype, "allowResizing", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "customAttributes", void 0);
    __decorate([
        Property('')
    ], Column.prototype, "hideAtMedia", void 0);
    __decorate([
        Property(null)
    ], Column.prototype, "customFormat", void 0);
    return Column;
}(ChildProperty));
export { Column };
