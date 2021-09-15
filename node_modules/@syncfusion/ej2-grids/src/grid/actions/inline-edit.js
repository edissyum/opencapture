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
import { NormalEdit } from './normal-edit';
/**
 * `InlineEdit` module is used to handle inline editing actions.
 *
 * @hidden
 */
var InlineEdit = /** @class */ (function (_super) {
    __extends(InlineEdit, _super);
    function InlineEdit(parent, serviceLocator, renderer) {
        var _this = _super.call(this, parent, serviceLocator) || this;
        _this.parent = parent;
        _this.serviceLocator = serviceLocator;
        _this.renderer = renderer;
        return _this;
    }
    InlineEdit.prototype.closeEdit = function () {
        _super.prototype.closeEdit.call(this);
    };
    InlineEdit.prototype.addRecord = function (data, index) {
        _super.prototype.addRecord.call(this, data, index);
    };
    InlineEdit.prototype.endEdit = function () {
        _super.prototype.endEdit.call(this);
    };
    InlineEdit.prototype.updateRow = function (index, data) {
        _super.prototype.updateRow.call(this, index, data);
    };
    InlineEdit.prototype.deleteRecord = function (fieldname, data) {
        _super.prototype.deleteRecord.call(this, fieldname, data);
    };
    InlineEdit.prototype.startEdit = function (tr) {
        _super.prototype.startEdit.call(this, tr);
    };
    return InlineEdit;
}(NormalEdit));
export { InlineEdit };
