import { skipHiddenIdx } from '../common/index';
import { getRowHeight, getCell, isHiddenRow } from '../../workbook/base/index';
import { attributes } from '@syncfusion/ej2-base';
import { getCellAddress } from '../../workbook/common/index';
/**
 * Sheet module is used for creating row element
 *
 * @hidden
 */
var RowRenderer = /** @class */ (function () {
    function RowRenderer(parent) {
        this.parent = parent;
        this.element = this.parent.createElement('tr', { attrs: { 'role': 'row' } });
        this.cellRenderer = parent.serviceLocator.getService('cell');
    }
    RowRenderer.prototype.render = function (index, isRowHeader, skipHidden) {
        var row = this.element.cloneNode();
        if (index === undefined) {
            row.classList.add('e-header-row');
            return row;
        }
        row.classList.add('e-row');
        var sheet = this.parent.getActiveSheet();
        attributes(row, { 'aria-rowindex': (index + 1).toString() });
        row.style.height = getRowHeight(sheet, index, true) + "px";
        if (isRowHeader && !skipHidden) {
            if (isHiddenRow(sheet, index + 1) && !isHiddenRow(sheet, index - 1)) {
                row.classList.add('e-hide-start');
            }
            if (index !== 0 && isHiddenRow(sheet, index - 1) && !isHiddenRow(sheet, index + 1)) {
                row.classList.add('e-hide-end');
            }
        }
        return row;
    };
    RowRenderer.prototype.refresh = function (index, pRow, hRow, header) {
        var row;
        var sheet = this.parent.getActiveSheet();
        if (header) {
            row = this.render(index, true, true);
            row.appendChild(this.cellRenderer.renderRowHeader(index));
        }
        else {
            row = this.render(index);
            var len = this.parent.viewport.leftIndex + this.parent.viewport.colCount + (this.parent.getThreshold('col') * 2);
            for (var i = this.parent.viewport.leftIndex; i <= len; i++) {
                row.appendChild(this.cellRenderer.render({ colIdx: i, rowIdx: index, cell: getCell(index, i, sheet),
                    address: getCellAddress(index, i), lastCell: i === len, row: row, hRow: hRow, isHeightCheckNeeded: true, pRow: pRow,
                    first: index === this.parent.viewport.topIndex && skipHiddenIdx(sheet, index, true) !== skipHiddenIdx(sheet, 0, true) ?
                        'Row' : '' }));
            }
        }
        return row;
    };
    return RowRenderer;
}());
export { RowRenderer };
