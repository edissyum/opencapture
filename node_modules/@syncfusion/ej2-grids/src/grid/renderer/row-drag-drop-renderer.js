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
import { CellRenderer } from './cell-renderer';
/**
 * ExpandCellRenderer class which responsible for building group expand cell.
 *
 * @hidden
 */
var RowDragDropRenderer = /** @class */ (function (_super) {
    __extends(RowDragDropRenderer, _super);
    function RowDragDropRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.element = _this.parent.createElement('TD', {
            className: 'e-rowdragdrop e-rowdragdropcell',
            attrs: { role: 'gridcell', tabindex: '-1' }
        });
        return _this;
    }
    /**
     * Function to render the detail expand cell
     *
     * @param {Cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @returns {Element} returns the element
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RowDragDropRenderer.prototype.render = function (cell, data) {
        var nodeElement = this.element.cloneNode();
        nodeElement.appendChild(this.parent.createElement('div', {
            className: 'e-icons e-rowcelldrag e-dtdiagonalright e-icon-rowdragicon'
        }));
        if (cell.isSelected) {
            nodeElement.classList.add('e-selectionbackground');
            nodeElement.classList.add('e-active');
        }
        return nodeElement;
    };
    return RowDragDropRenderer;
}(CellRenderer));
export { RowDragDropRenderer };
