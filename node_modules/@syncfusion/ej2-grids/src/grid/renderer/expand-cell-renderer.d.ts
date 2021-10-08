import { Cell } from '../models/cell';
import { ICellRenderer } from '../base/interface';
import { IndentCellRenderer } from './indent-cell-renderer';
import { Column } from '../models/column';
/**
 * ExpandCellRenderer class which responsible for building group expand cell.
 *
 * @hidden
 */
export declare class ExpandCellRenderer extends IndentCellRenderer implements ICellRenderer<Column> {
    /**
     * Function to render the expand cell
     *
     * @param {Cell} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @param {string} data.field - Defines the field
     * @param {string} data.key - Defines the key
     * @param {Object} attr - specifies the attribute
     * @param {boolean} isExpand - specifies isexpand
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: {
        field: string;
        key: string;
    }, attr?: {
        [x: string]: string;
    }, isExpand?: boolean): Element;
}
