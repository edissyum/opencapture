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
import { extend } from '@syncfusion/ej2-base';
import { AutoComplete } from '@syncfusion/ej2-dropdowns';
import { Query, DataManager, DataUtil } from '@syncfusion/ej2-data';
import { isEditable, getComplexFieldID, getObject } from '../base/util';
import { EditCellBase } from './edit-cell-base';
/**
 * `AutoCompleteEditCell` is used to handle autocomplete cell type editing.
 *
 * @hidden
 */
var AutoCompleteEditCell = /** @class */ (function (_super) {
    __extends(AutoCompleteEditCell, _super);
    function AutoCompleteEditCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoCompleteEditCell.prototype.write = function (args) {
        this.column = args.column;
        var isInlineEdit = this.parent.editSettings.mode !== 'Dialog';
        this.object = new AutoComplete(extend({
            dataSource: this.parent.dataSource instanceof DataManager ?
                this.parent.dataSource : new DataManager(this.parent.dataSource),
            query: new Query().select(args.column.field), enabled: isEditable(args.column, args.requestType, args.element),
            fields: { value: args.column.field },
            value: getObject(args.column.field, args.rowData),
            // enableRtl: this.parentect.enableRtl,
            actionComplete: this.selectedValues.bind(this),
            placeholder: isInlineEdit ? '' : args.column.headerText,
            floatLabelType: isInlineEdit ? 'Never' : 'Always'
        }, args.column.edit.params));
        this.object.appendTo(args.element);
        /* tslint:disable-next-line:no-any */
        args.element.setAttribute('name', getComplexFieldID(args.column.field));
    };
    AutoCompleteEditCell.prototype.selectedValues = function (valObj) {
        valObj.result = DataUtil.distinct(valObj.result, this.object.fields.value, true);
        if (this.column.dataSource) {
            this.column.dataSource.dataSource.json = valObj.result;
        }
    };
    return AutoCompleteEditCell;
}(EditCellBase));
export { AutoCompleteEditCell };
