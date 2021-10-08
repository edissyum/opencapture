import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
/**
 * FilterCellRenderer class which responsible for building filter cell.
 *
 * @hidden
 */
export declare class FilterCellRenderer extends CellRenderer implements ICellRenderer<Column> {
    element: HTMLElement;
    private dropOptr;
    /**
     * Function to return the wrapper for the TH content.
     *
     * @returns {string} returns the gui
     */
    getGui(): string | Element;
    /**
     * Function to render the cell content based on Column object.
     *
     * @param  {Cell} cell
     * @param  {Object} data
     */
    render(cell: Cell<Column>, data: Object): Element;
    /**
     * Function to specifies how the result content to be placed in the cell.
     *
     * @param {Element} node - specifies the node
     * @param {string|Element} innerHtml - specifies the innerHTML
     * @returns {Element} retruns the element
     */
    appendHtml(node: Element, innerHtml: string | Element): Element;
    private operatorIconRender;
    private internalEvent;
}
