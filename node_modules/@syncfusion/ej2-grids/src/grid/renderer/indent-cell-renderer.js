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
import { setStyleAndAttributes } from '../base/util';
import { CellRenderer } from './cell-renderer';
/**
 * IndentCellRenderer class which responsible for building group indent cell.
 *
 * @hidden
 */
var IndentCellRenderer = /** @class */ (function (_super) {
    __extends(IndentCellRenderer, _super);
    function IndentCellRenderer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.element = _this.parent.createElement('TD', { className: 'e-indentcell' });
        return _this;
    }
    /**
     * Function to render the indent cell
     *
     * @param  {Cell} cell - specifies the cell
     * @param  {Object} data - specifies the data
     * @returns {Element} returns the element
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IndentCellRenderer.prototype.render = function (cell, data) {
        var node = this.element.cloneNode();
        setStyleAndAttributes(node, cell.attributes);
        return node;
    };
    return IndentCellRenderer;
}(CellRenderer));
export { IndentCellRenderer };
