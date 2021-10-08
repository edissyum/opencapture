import { ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
import { Column } from '../models/column';
import { Cell } from '../models/cell';
/**
 * ExpandCellRenderer class which responsible for building group expand cell.
 *
 * @hidden
 */
export declare class RowDragDropRenderer extends CellRenderer implements ICellRenderer<Column> {
    element: HTMLElement;
    /**
     * Function to render the detail expand cell
     *
     * @param {Cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: Object): Element;
}
