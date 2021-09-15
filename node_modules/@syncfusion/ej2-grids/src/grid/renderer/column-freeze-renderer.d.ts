import { IGrid, IRenderer, NotifyArgs } from '../base/interface';
import { Column } from '../models/column';
import { FreezeContentRender, FreezeRender } from './freeze-renderer';
import { ServiceLocator } from '../services/service-locator';
import { Row } from '../models/row';
import { ColumnWidthService } from '../services/width-controller';
import { freezeTable } from '../base/enum';
/**
 * ColumnFreezeHeaderRenderer is used to freeze the columns header at right and left
 *
 * @hidden
 */
export declare class ColumnFreezeHeaderRenderer extends FreezeRender implements IRenderer {
    private frozenRightHeader;
    private destEle;
    private evtHandlers;
    constructor(parent?: IGrid, locator?: ServiceLocator);
    addEventListener(): void;
    removeEventListener(): void;
    private setReorderElement;
    private refreshFrozenColumns;
    protected setWrapHeight(fRows: NodeListOf<HTMLElement>, mRows: NodeListOf<HTMLElement>, isModeChg: boolean, isContReset?: boolean, isStackedHdr?: boolean, frRows?: NodeListOf<HTMLElement>): void;
    protected refreshHeight(obj: {
        case: string;
        isModeChg?: boolean;
    }): void;
    /**
     * Function to hide header table column based on visible property
     *
     * @param {Column[]} columns - specifies the column[]
     * @returns {void}
     */
    setVisible(columns?: Column[]): void;
    protected filterRenderer(ele: Element, frozenColumn: number, total?: number): Element;
    refreshUI(): void;
    protected refreshFreeze(obj: {
        case: string;
        isModeChg?: boolean;
    }): void;
    private updateFrozenColGroup;
    private adjudtFilterBarCell;
    renderPanel(): void;
    renderTable(): void;
    protected rfshMovable(): void;
    protected refreshStackedHdrHgt(): void;
    private refreshFrozenRightStackedHdrHgt;
    /**
     * @returns {void}
     * @hidden
     */
    updateColgroup(): void;
    private renderRightFrozenPanelAlone;
    private renderLeftWithRightFrozenPanel;
    private renderFrozenRightTableAlone;
    private updateFrozenLeftColGroup;
    private updateMovableColGroup;
    private updateFrozenRightColGroup;
    private setFrozenRightHeader;
    getFrozenRightHeader(): Element;
}
/**
 * ColumnFreezeContentRenderer is used to freeze the columns content at right and left
 *
 * @hidden
 */
export declare class ColumnFreezeContentRenderer extends FreezeContentRender implements IRenderer {
    private frozenRigthContent;
    private movableRowElements;
    private frozenRightRows;
    private frozenRightRowElements;
    private frzCount;
    private isColGroupRefresh;
    protected widthService: ColumnWidthService;
    constructor(parent?: IGrid, locator?: ServiceLocator);
    renderPanel(): void;
    renderTable(): void;
    protected appendScrollbar(frozen: Element, movable: Element, isRight?: boolean): void;
    private renderFrozenRightPanelAlone;
    private renderFrozenLeftWithRightPanel;
    private renderFrozenRightTableAlone;
    private renderFrozenLeftWithRightTable;
    private renderFrozenRightEmptyRowAlone;
    /**
     * @param {string} tableName - specfies the table name
     * @returns {HTMLElement} returns the element
     * @hidden
     */
    getFrozenHeader(tableName: string): HTMLElement;
    private renderFrozenLeftWithRightEmptyRow;
    private setFrozenRightContent;
    getFrozenRightContent(): Element;
    protected getHeaderColGroup(): Element;
    private getFrozenRightHeaderColGroup;
    setColGroup(colGroup: Element): Element;
    renderEmpty(tbody: HTMLElement): void;
    protected setHeightToContent(height: number): void;
    protected actionComplete(args: NotifyArgs): void;
    protected batchAdd(args: {
        name: string;
    }): void;
    /**
     * @param {freezeTable} tableName - specfies the table name
     * @returns {Element} - returns the element
     * @hidden
     */
    getTbody(tableName: freezeTable): Element;
    /**
     * @param {NotifyArgs} args - specfies the args
     * @param {freezeTable} tableName - specfies the freeze table
     * @returns {void}
     * @hidden
     */
    setIsFrozen(args: NotifyArgs, tableName: freezeTable): void;
    /**
     * @param {Element} tbody - specfies the element
     * @param {DocumentFragment | HTMLElement} frag - specfies the frag
     * @param {NotifyArgs} args - specfies the args
     * @param {freezeTable} tableName - specfies the tableName
     * @returns {void}
     * @hidden
     */
    appendContent(tbody: Element, frag: DocumentFragment | HTMLElement, args: NotifyArgs, tableName?: freezeTable): void;
    protected refreshHeight(): void;
    /**
     * @param {freezeTable} tableName - specifies the table
     * @returns {void}
     * @hidden
     */
    splitRows(tableName: freezeTable): void;
    /**
     * Get the Freeze pane movable content table data row elements
     *
     * @returns {Element} returns the element
     */
    getMovableRowElements(): Element[];
    /**
     * Get the Freeze pane frozen right content table data row elements
     *
     * @returns {Element} returns the Element
     */
    getFrozenRightRowElements(): Element[];
    /**
     * Get the frozen right row collection in the Freeze pane Grid.
     *
     * @returns {Row[] | HTMLCollectionOf<HTMLTableRowElement>} returns the row object
     */
    getFrozenRightRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    getFrozenRightRowByIndex(index: number): Element;
    /**
     * Get the Row collection in the Grid.
     *
     * @returns {Row[] | HTMLCollectionOf<HTMLTableRowElement>} returns the row object
     */
    getRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * Get the content table data row elements
     *
     * @returns {Element} returns the element
     */
    getRowElements(): Element[];
}
