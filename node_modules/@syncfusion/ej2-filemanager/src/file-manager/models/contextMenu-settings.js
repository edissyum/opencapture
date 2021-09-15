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
export var fileItems = ['Open', '|', 'Cut', 'Copy', '|', 'Delete', 'Download', 'Rename', '|', 'Details'];
export var folderItems = ['Open', '|', 'Cut', 'Copy', 'Paste', '|', 'Delete', 'Rename', 'Download', '|', 'Details'];
export var layoutItems = [
    'SortBy', 'View', 'Refresh', '|', 'Paste', '|', 'NewFolder', 'Upload', '|', 'Details', '|', 'SelectAll'
];
/**
 * Specifies the ContextMenu settings of the File Manager.
 */
var ContextMenuSettings = /** @class */ (function (_super) {
    __extends(ContextMenuSettings, _super);
    function ContextMenuSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property(fileItems)
    ], ContextMenuSettings.prototype, "file", void 0);
    __decorate([
        Property(folderItems)
    ], ContextMenuSettings.prototype, "folder", void 0);
    __decorate([
        Property(layoutItems)
    ], ContextMenuSettings.prototype, "layout", void 0);
    __decorate([
        Property(true)
    ], ContextMenuSettings.prototype, "visible", void 0);
    return ContextMenuSettings;
}(ChildProperty));
export { ContextMenuSettings };
