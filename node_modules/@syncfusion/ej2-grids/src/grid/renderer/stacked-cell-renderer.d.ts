import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
/**
 * StackedHeaderCellRenderer class which responsible for building stacked header cell content.
 *
 * @hidden
 */
export declare class StackedHeaderCellRenderer extends CellRenderer implements ICellRenderer<Column> {
    element: HTMLElement;
    /**
     * Function to render the cell content based on Column object.
     *
     * @param {Cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @param {object} attributes - specifies the attributes
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: Object, attributes?: {
        [x: string]: Object;
    }): Element;
}
