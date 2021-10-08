import { RowModelGenerator } from '../services/row-model-generator';
import { splitFrozenRowObjectCells } from '../base/util';
/**
 * FreezeRowModelGenerator is used to generate grid data rows with freeze row and column.
 *
 * @hidden
 */
var FreezeRowModelGenerator = /** @class */ (function () {
    function FreezeRowModelGenerator(parent) {
        this.parent = parent;
        this.rowModelGenerator = new RowModelGenerator(this.parent);
    }
    FreezeRowModelGenerator.prototype.generateRows = function (data, notifyArgs, virtualRows) {
        var tableName;
        if (notifyArgs.renderFrozenRightContent || (notifyArgs.renderMovableContent && !this.parent.enableVirtualization)) {
            tableName = 'frozen-right';
        }
        else if (notifyArgs.renderMovableContent || notifyArgs.isFrozen) {
            tableName = 'movable';
        }
        else {
            tableName = this.parent.getFrozenLeftCount() ? 'frozen-left' : 'frozen-right';
        }
        if (notifyArgs.requestType === 'virtualscroll' && notifyArgs.virtualInfo.sentinelInfo.axis === 'X') {
            if (tableName !== 'movable') {
                return null;
            }
        }
        var row = this.parent.enableVirtualization && !notifyArgs.isFrozenRowsRender ? virtualRows
            : this.rowModelGenerator.generateRows(data, notifyArgs);
        for (var i = 0, len = row.length; i < len; i++) {
            row[i].cells = splitFrozenRowObjectCells(this.parent, row[i].cells, tableName);
        }
        return row;
    };
    return FreezeRowModelGenerator;
}());
export { FreezeRowModelGenerator };
