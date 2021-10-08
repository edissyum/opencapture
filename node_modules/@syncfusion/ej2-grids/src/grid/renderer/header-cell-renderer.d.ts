import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { ICellRenderer } from '../base/interface';
import { CellRenderer } from './cell-renderer';
/**
 * HeaderCellRenderer class which responsible for building header cell content.
 *
 * @hidden
 */
export declare class HeaderCellRenderer extends CellRenderer implements ICellRenderer<Column> {
    element: HTMLElement;
    private ariaService;
    private hTxtEle;
    private sortEle;
    private gui;
    private chkAllBox;
    /**
     * Function to return the wrapper for the TH content.
     *
     * @returns {string | Element} returns the element
     */
    getGui(): string | Element;
    /**
     * Function to render the cell content based on Column object.
     *
     * @param {Cell} cell - specifies the column
     * @param {Object} data - specifies the data
     * @param {object} attributes - specifies the aattributes
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: Object, attributes?: {
        [x: string]: Object;
    }): Element;
    /**
     * Function to refresh the cell content based on Column object.
     *
     * @param  {Cell} cell - specifies the cell
     * @param  {Element} node - specifies the noe
     * @returns {Element} returns the element
     */
    refresh(cell: Cell<Column>, node: Element): Element;
    private clean;
    private prepareHeader;
    getValue(field: string, column: Column): Object;
    private extendPrepareHeader;
    /**
     * Function to specifies how the result content to be placed in the cell.
     *
     * @param  {Element} node - specifies the node
     * @param  {string|Element} innerHtml - specifies the innerHtml
     * @returns {Element} returns the element
     */
    appendHtml(node: Element, innerHtml: string | Element): Element;
}
