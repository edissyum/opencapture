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
 * Specifies the columns in the details view of the file manager.
 */
export var columnArray = [
    {
        field: 'name', headerText: 'Name', minWidth: 120,
        template: '<span class="e-fe-text">${name}</span>', customAttributes: { class: 'e-fe-grid-name' }
    },
    {
        field: '_fm_modified', headerText: 'DateModified', type: 'dateTime',
        format: 'MMMM dd, yyyy HH:mm', minWidth: 120, width: '190'
    },
    {
        field: 'size', headerText: 'Size', minWidth: 90, width: '110', template: '<span class="e-fe-size">${size}</span>'
    }
];
/**
 * Specifies the grid settings of the File Manager.
 */
var DetailsViewSettings = /** @class */ (function (_super) {
    __extends(DetailsViewSettings, _super);
    function DetailsViewSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(true)
    ], DetailsViewSettings.prototype, "columnResizing", void 0);
    __decorate([
        Property(columnArray)
    ], DetailsViewSettings.prototype, "columns", void 0);
    return DetailsViewSettings;
}(ChildProperty));
export { DetailsViewSettings };
