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
import { createElement } from '@syncfusion/ej2-base';
import { CellRenderer } from './cell-renderer';
/**
 * DetailHeaderIndentCellRenderer class which responsible for building detail header indent cell.
 *
 * @hidden
 */
var RowDragDropHeaderRenderer = /** @class */ (function (_super) {
    __extends(RowDragDropHeaderRenderer, _super);
    function RowDragDropHeaderRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.element = _this.parent.createElement('TH', { className: 'e-rowdragheader' });
        return _this;
    }
    /**
     * Function to render the detail indent cell
     *
     * @param  {Cell} cell - specifies the cell
     * @param  {Object} data - specifies the data
     * @returns {Element} returns the element
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    RowDragDropHeaderRenderer.prototype.render = function (cell, data) {
        var node = this.element.cloneNode();
        node.appendChild(createElement('div', { className: 'e-emptycell' }));
        return node;
    };
    return RowDragDropHeaderRenderer;
}(CellRenderer));
export { RowDragDropHeaderRenderer };
