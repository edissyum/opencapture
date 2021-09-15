import { createEditElement } from '../base/util';
/**
 * `DropDownEditCell` is used to handle dropdown cell type editing.
 *
 * @hidden
 */
var EditCellBase = /** @class */ (function () {
    function EditCellBase(parent) {
        this.parent = parent;
    }
    EditCellBase.prototype.create = function (args) {
        return createEditElement(this.parent, args.column, 'e-field', { type: 'text' });
    };
    EditCellBase.prototype.read = function (element) {
        return element.ej2_instances[0].value;
    };
    EditCellBase.prototype.destroy = function () {
        if (this.obj && !this.obj.isDestroyed) {
            if (this.removeEventHandler) {
                this.removeEventHandler();
            }
            this.obj.destroy();
        }
    };
    return EditCellBase;
}());
export { EditCellBase };
