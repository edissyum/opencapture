import { freezeTable } from '../base/enum';
import { IRenderer, IGrid } from '../base/interface';
import { Column } from '../models/column';
import { Row } from '../models/row';
import { ServiceLocator } from '../services/service-locator';
import { Draggable } from '@syncfusion/ej2-base';
import { ColumnWidthService } from '../services/width-controller';
import { AriaService } from '../services/aria-service';
/**
 * Content module is used to render grid content
 *
 * @hidden
 */
export declare class HeaderRender implements IRenderer {
    private headerTable;
    private headerPanel;
    private colgroup;
    private caption;
    protected colDepth: number;
    private column;
    protected rows: Row<Column>[];
    private frzIdx;
    private notfrzIdx;
    private lockColsRendered;
    freezeReorder: boolean;
    draggable: Draggable;
    private isFirstCol;
    private isReplaceDragEle;
    private helper;
    private dragStart;
    private drag;
    private dragStop;
    private drop;
    protected parent: IGrid;
    protected serviceLocator: ServiceLocator;
    protected widthService: ColumnWidthService;
    protected ariaService: AriaService;
    /**
     * Constructor for header renderer module
     *
     * @param {IGrid} parent - specifies the IGrid
     * @param {ServiceLocator} serviceLocator - specifies the serviceLocator
     */
    constructor(parent?: IGrid, serviceLocator?: ServiceLocator);
    /**
     * The function is used to render grid header div
     *
     * @returns {void}
     */
    renderPanel(): void;
    /**
     * The function is used to render grid header div
     *
     * @returns {void}
     */
    renderTable(): void;
    /**
     * Get the header content div element of grid
     *
     * @returns {Element} returns the element
     */
    getPanel(): Element;
    /**
     * Set the header content div element of grid
     *
     * @param  {Element} panel - specifies the panel element
     * @returns {void}
     */
    setPanel(panel: Element): void;
    /**
     * Get the header table element of grid
     *
     * @returns {Element} returns the element
     */
    getTable(): Element;
    /**
     * Set the header table element of grid
     *
     * @param  {Element} table - specifies the table element
     * @returns {void}
     */
    setTable(table: Element): void;
    /**
     * Get the header colgroup element
     *
     * @returns {Element} returns the element
     */
    getColGroup(): Element;
    /**
     * Set the header colgroup element
     *
     * @param {Element} colGroup - specifies the colgroup
     * @returns {Element} returns the element
     */
    setColGroup(colGroup: Element): Element;
    /**
     * Get the header row element collection.
     *
     * @returns {Element[]} returns the element
     */
    getRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * The function is used to create header table elements
     *
     * @returns {Element} returns the element
     * @hidden
     */
    private createHeaderTable;
    /**
     * The function is used to create header table elements
     *
     * @param {Element} tableEle - specifies the table Element
     * @param {freezeTable} tableName - specifies the table name
     * @returns {Element} returns the element
     * @hidden
     */
    createHeader(tableEle?: Element, tableName?: freezeTable): Element;
    /**
     * @param {Element} tableEle - specifies the column
     * @returns {Element} returns the element
     * @hidden
     */
    createTable(tableEle?: Element): Element;
    private createHeaderContent;
    private updateColGroup;
    private ensureColumns;
    private getHeaderCells;
    private appendCells;
    private ensureStackedFrozen;
    private getStackedLockColsCount;
    private getColSpan;
    private getFrozenColSpan;
    private generateRow;
    private generateCell;
    /**
     * Function to hide header table column based on visible property
     *
     * @param {Column[]} columns - specifies the column
     * @returns {void}
     */
    setVisible(columns?: Column[]): void;
    private colPosRefresh;
    /**
     * Refresh the header of the Grid.
     *
     * @returns {void}
     */
    refreshUI(): void;
    toggleStackClass(div: Element): void;
    appendContent(table?: Element): void;
    private getCellCnt;
    protected initializeHeaderDrag(): void;
    protected initializeHeaderDrop(): void;
    private renderCustomToolbar;
    private updateCustomResponsiveToolbar;
}
