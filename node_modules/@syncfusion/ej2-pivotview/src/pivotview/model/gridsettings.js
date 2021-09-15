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
import { Property, ChildProperty, Event } from '@syncfusion/ej2-base';
/**
 * Interface for a class SelectionSettings
 */
var PivotSelectionSettings = /** @class */ (function (_super) {
    __extends(PivotSelectionSettings, _super);
    function PivotSelectionSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('Row')
    ], PivotSelectionSettings.prototype, "mode", void 0);
    __decorate([
        Property('Flow')
    ], PivotSelectionSettings.prototype, "cellSelectionMode", void 0);
    __decorate([
        Property('Single')
    ], PivotSelectionSettings.prototype, "type", void 0);
    __decorate([
        Property(false)
    ], PivotSelectionSettings.prototype, "checkboxOnly", void 0);
    __decorate([
        Property(false)
    ], PivotSelectionSettings.prototype, "persistSelection", void 0);
    __decorate([
        Property('Default')
    ], PivotSelectionSettings.prototype, "checkboxMode", void 0);
    __decorate([
        Property(false)
    ], PivotSelectionSettings.prototype, "enableSimpleMultiRowSelection", void 0);
    return PivotSelectionSettings;
}(ChildProperty));
export { PivotSelectionSettings };
/**
 *  Represents Pivot widget model class.
 */
var GridSettings = /** @class */ (function (_super) {
    __extends(GridSettings, _super);
    function GridSettings() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        Property('auto')
    ], GridSettings.prototype, "height", void 0);
    __decorate([
        Property('auto')
    ], GridSettings.prototype, "width", void 0);
    __decorate([
        Property('Both')
    ], GridSettings.prototype, "gridLines", void 0);
    __decorate([
        Property(false)
    ], GridSettings.prototype, "allowTextWrap", void 0);
    __decorate([
        Property(false)
    ], GridSettings.prototype, "allowReordering", void 0);
    __decorate([
        Property(true)
    ], GridSettings.prototype, "allowResizing", void 0);
    __decorate([
        Property(true)
    ], GridSettings.prototype, "allowAutoResizing", void 0);
    __decorate([
        Property(null)
    ], GridSettings.prototype, "rowHeight", void 0);
    __decorate([
        Property(110)
    ], GridSettings.prototype, "columnWidth", void 0);
    __decorate([
        Property('Ellipsis')
    ], GridSettings.prototype, "clipMode", void 0);
    __decorate([
        Property(false)
    ], GridSettings.prototype, "allowSelection", void 0);
    __decorate([
        Property(-1)
    ], GridSettings.prototype, "selectedRowIndex", void 0);
    __decorate([
        Property({ mode: 'Row', cellSelectionMode: 'Flow', type: 'Single' })
    ], GridSettings.prototype, "selectionSettings", void 0);
    __decorate([
        Property({ wrapMode: 'Both' })
    ], GridSettings.prototype, "textWrapSettings", void 0);
    __decorate([
        Property('AllPages')
    ], GridSettings.prototype, "printMode", void 0);
    __decorate([
        Property()
    ], GridSettings.prototype, "contextMenuItems", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "beforeCopy", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "printComplete", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "beforePrint", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "beforePdfExport", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "beforeExcelExport", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "contextMenuOpen", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "contextMenuClick", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "queryCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "headerCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "rowSelecting", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "rowSelected", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "rowDeselecting", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "rowDeselected", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "cellSelecting", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "cellSelected", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "cellDeselecting", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "cellDeselected", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "resizeStart", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "resizing", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "resizeStop", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "pdfHeaderQueryCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "pdfQueryCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "excelHeaderQueryCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "excelQueryCellInfo", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "columnDragStart", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "columnDrag", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "columnDrop", void 0);
    __decorate([
        Event()
    ], GridSettings.prototype, "columnRender", void 0);
    return GridSettings;
}(ChildProperty));
export { GridSettings };
