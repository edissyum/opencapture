import { Column } from '../models/column';
import { Row } from '../models/row';
import { IRowRenderer, IGrid } from '../base/interface';
import { CellType } from '../base/enum';
import { ServiceLocator } from '../services/service-locator';
/**
 * RowRenderer class which responsible for building row content.
 *
 * @hidden
 */
export declare class RowRenderer<T> implements IRowRenderer<T> {
    element: Element;
    private cellRenderer;
    private serviceLocator;
    private cellType;
    private isSpan;
    protected parent: IGrid;
    constructor(serviceLocator?: ServiceLocator, cellType?: CellType, parent?: IGrid);
    /**
     * Function to render the row content based on Column[] and data.
     *
     * @param {Row<T>} row - specifies the row
     * @param {Column[]} columns - specifies the columns
     * @param {Object} attributes - specifies the attributes
     * @param {string} rowTemplate - specifies the rowTemplate
     * @param {Element} cloneNode - specifies the cloneNode
     * @returns {Element} returns the element
     */
    render(row: Row<T>, columns: Column[], attributes?: {
        [x: string]: Object;
    }, rowTemplate?: string, cloneNode?: Element): Element;
    /**
     * Function to refresh the row content based on Column[] and data.
     *
     * @param {Row<T>} row - specifies the row
     * @param {Column[]} columns - specifies the column
     * @param {boolean} isChanged - specifies isChanged
     * @param {Object} attributes - specifies the attributes
     * @param {string} rowTemplate - specifies the rowTemplate
     * @returns {void}
     */
    refresh(row: Row<T>, columns: Column[], isChanged: boolean, attributes?: {
        [x: string]: Object;
    }, rowTemplate?: string): void;
    private refreshRow;
    private refreshMergeCells;
    /**
     * Function to check and add alternative row css class.
     *
     * @param {Element} tr - specifies the tr element
     * @param {Row<T>} row - specifies the row
     * @returns {void}
     */
    buildAttributeFromRow(tr: Element, row: Row<T>): void;
}
