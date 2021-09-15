import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { ServiceLocator } from '../services/service-locator';
import { IGrid, ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
/**
 * `CommandColumn` used to render command column in grid
 *
 * @hidden
 */
export declare class CommandColumnRenderer extends CellRenderer implements ICellRenderer<Column> {
    private buttonElement;
    private unbounDiv;
    private childRefs;
    element: HTMLElement;
    constructor(parent: IGrid, locator?: ServiceLocator);
    private destroyButtons;
    /**
     * Function to render the cell content based on Column object.
     *
     * @param {cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @param {Object} attributes - specifies the attributes
     * @param {boolean} isVirtualEdit - specifies virtual scroll editing
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: Object, attributes?: {
        [x: string]: Object;
    }, isVirtualEdit?: boolean): Element;
    private renderButton;
}
