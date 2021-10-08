import { L10n } from '@syncfusion/ej2-base';
import { Column } from '../models/column';
import { Cell } from '../models/cell';
import { ICellRenderer, IValueFormatter, IGrid } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
/**
 * CellRenderer class which responsible for building cell content.
 *
 * @hidden
 */
export declare class CellRenderer implements ICellRenderer<Column> {
    element: HTMLElement;
    private rowChkBox;
    protected localizer: L10n;
    protected formatter: IValueFormatter;
    protected parent: IGrid;
    constructor(parent: IGrid, locator?: ServiceLocator);
    /**
     * Function to return the wrapper for the TD content
     *
     * @returns {string | Element} returns the string
     */
    getGui(): string | Element;
    /**
     * Function to format the cell value.
     *
     * @param  {Column} column - specifies the column
     * @param  {Object} value - specifies the value
     * @param  {Object} data - specifies the data
     * @returns {string} returns the format
     */
    format(column: Column, value: Object, data?: Object): string;
    evaluate(node: Element, cell: Cell<Column>, data: Object, attributes?: Object, fData?: Object, isEdit?: boolean): boolean;
    /**
     * Function to invoke the custom formatter available in the column object.
     *
     * @param  {Column} column - specifies the column
     * @param  {Object} value - specifies the value
     * @param  {Object} data - specifies the data
     * @returns {Object} returns the object
     */
    invokeFormatter(column: Column, value: Object, data: Object): Object;
    /**
     * Function to render the cell content based on Column object.
     *
     * @param {Cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @param {Object} attributes - specifies the attributes
     * @param {boolean} isExpand - specifies the boolean for expand
     * @param {boolean} isEdit - specifies the boolean for edit
     * @returns {Element} returns the element
     */
    render(cell: Cell<Column>, data: Object, attributes?: {
        [x: string]: Object;
    }, isExpand?: boolean, isEdit?: boolean): Element;
    /**
     * Function to refresh the cell content based on Column object.
     *
     * @param {Element} td - specifies the element
     * @param {Cell<Column>} cell - specifies the cell
     * @param {Object} data - specifies the data
     * @param {Object} attributes - specifies the attribute
     * @returns {void}
     */
    refreshTD(td: Element, cell: Cell<Column>, data: Object, attributes?: {
        [x: string]: Object;
    }): void;
    private cloneAttributes;
    private refreshCell;
    /**
     * Function to specifies how the result content to be placed in the cell.
     *
     * @param {Element} node - specifies the node
     * @param {string|Element} innerHtml - specifies the innerHTML
     * @param {string} property - specifies the element
     * @returns {Element} returns the element
     */
    appendHtml(node: Element, innerHtml: string | Element, property?: string): Element;
    /**
     * @param {HTMLElement} node - specifies the node
     * @param {cell<Column>} cell - specifies the cell
     * @param {Object} attributes - specifies the attributes
     * @returns {void}
     * @hidden
     */
    setAttributes(node: HTMLElement, cell: Cell<Column>, attributes?: {
        [x: string]: Object;
    }): void;
    buildAttributeFromCell<Column>(node: HTMLElement, cell: Cell<Column>, isCheckBoxType?: boolean): void;
    getValue(field: string, data: Object, column: Column): Object;
}
