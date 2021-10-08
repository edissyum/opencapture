import { FreezeContentRender, FreezeRender } from './freeze-renderer';
import { ColumnFreezeContentRenderer } from './column-freeze-renderer';
import { IGrid, IRenderer, NotifyArgs, IModelGenerator } from '../base/interface';
import { ServiceLocator } from '../services/service-locator';
import { VirtualContentRenderer, VirtualHeaderRenderer } from './virtual-content-renderer';
import { FreezeRowModelGenerator } from '../services/freeze-row-model-generator';
import { freezeTable } from '../base/enum';
import { Row } from '../models/row';
import { Column } from '../models/column';
import { ColumnWidthService } from '../services/width-controller';
/**
 * VirtualFreezeRenderer is used to render the virtual table within the frozen and movable content table
 *
 * @hidden
 */
export declare class VirtualFreezeRenderer extends FreezeContentRender implements IRenderer {
    protected serviceLoc: ServiceLocator;
    rowModelGenerator: IModelGenerator<Column>;
    constructor(parent?: IGrid, locator?: ServiceLocator);
    protected freezeRowGenerator: FreezeRowModelGenerator;
    /** @hidden */
    virtualRenderer: VirtualContentRenderer;
    protected firstPageRecords: Object[];
    protected scrollbar: HTMLElement;
    /** @hidden */
    frzRows: Row<Column>[];
    /** @hidden */
    mvblRows: Row<Column>[];
    /** @hidden */
    frRows: Row<Column>[];
    eventListener(action: string): void;
    protected actionComplete(args: NotifyArgs): void;
    private refreshVirtualFrozenRows;
    private getVirtualData;
    private setFreezeSelection;
    /**
     * @returns {void}
     * @hidden
     */
    renderTable(): void;
    /**
     * @param {HTMLElement} target - specifies the target
     * @param {DocumentFragment} newChild - specifies the newChild
     * @param {NotifyArgs} e - specifies the notifyargs
     * @returns {void}
     * @hidden
     */
    appendContent(target: HTMLElement, newChild: DocumentFragment, e: NotifyArgs): void;
    /**
     * @param {Object[]} data - specifies the data
     * @param {NotifyArgs} notifyArgs - specifies the notifyargs
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    generateRows(data: Object[], notifyArgs?: NotifyArgs): Row<Column>[];
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    getRowByIndex(index: number): Element;
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    getMovableRowByIndex(index: number): Element;
    private collectRows;
    /**
     * @returns {HTMLCollection} returns the Htmlcollection
     * @hidden
     */
    getMovableRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @returns {HTMLCollectionOf<HTMLTableRowElement>} returns the html collection
     * @hidden
     */
    getRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @returns {Element} returns the element
     * @hidden
     */
    getColGroup(): Element;
    /**
     * @param {NotifyArgs} args - specifies the args
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    getReorderedFrozenRows(args: NotifyArgs): Row<Column>[];
    protected isXaxis(): boolean;
    protected getHeaderCells(): Element[];
    protected getVirtualFreezeHeader(): Element;
    protected ensureFrozenCols(columns: Column[]): Column[];
    /**
     * @param {number} index - specifies the index
     * @returns {object} returns the object
     * @hidden
     */
    getRowObjectByIndex(index: number): Object;
    /**
     * Set the header colgroup element
     *
     * @param {Element} colGroup - specifies the colgroup
     * @returns {Element} returns the element
     */
    setColGroup(colGroup: Element): Element;
}
/**
 * VirtualFreezeHdrRenderer is used to render the virtual table within the frozen and movable header table
 *
 * @hidden
 */
export declare class VirtualFreezeHdrRenderer extends FreezeRender implements IRenderer {
    protected serviceLoc: ServiceLocator;
    constructor(parent?: IGrid, locator?: ServiceLocator);
    virtualHdrRenderer: VirtualHeaderRenderer;
    /**
     * @returns {void}
     * @hidden
     */
    renderTable(): void;
    protected rfshMovable(): void;
}
/**
 * @param {NotifyArgs} args - specifies the args
 * @param {Object[]} data - specifies the data
 * @param {number[]}selectedIdx - specifies the selected index
 * @param {IGrid} parent - specifies the IGrid
 * @param {IModelGenerator} rowModelGenerator - specifies the rowModeGenerator
 * @param {ServiceLocator} locator - specifies the locator
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {VirtualFreezeRenderer} instance - specifies the instance
 * @returns {void}
 * @hidden
 */
export declare function renderFrozenRows(args: NotifyArgs, data: Object[], selectedIdx: number[], parent: IGrid, rowModelGenerator: IModelGenerator<Column>, locator: ServiceLocator, virtualRenderer: VirtualContentRenderer, instance: VirtualFreezeRenderer | ColumnVirtualFreezeRenderer): void;
/**
 * @param {Row<Column>[]} data - specifies the data
 * @param {freezeTable} tableName -specifies the table
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export declare function splitCells(data: Row<Column>[], tableName: freezeTable, parent: IGrid): Row<Column>[];
/**
 * @param {freezeTable} tableName - specifies the freeze tabel
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export declare function collectRows(tableName: freezeTable, virtualRenderer: VirtualContentRenderer, parent: IGrid): Row<Column>[];
/**
 * @param {object} args - specifies the args
 * @param {string} args.uid - specifirs the uid
 * @param {boolean} args.set - specifies the set
 * @param {boolean} args.clearAll - specifies the boolean to clearall
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @returns {void}
 * @hidden
 */
export declare function setFreezeSelection(args: {
    uid: string;
    set: boolean;
    clearAll?: boolean;
}, virtualRenderer: VirtualContentRenderer): void;
/**
 * @param {Object} args - specifies the args
 * @param {string} args.uid - specifirs the uid
 * @param {boolean} args.set - specifies the set
 * @param {boolean} args.clearAll - specifies the boolean to clearall
 * @param {Row<Column>[]} cache - specifies the cache
 * @returns {void}
 * @hidden
 */
export declare function selectFreezeRows(args: {
    uid: string;
    set: boolean;
    clearAll?: boolean;
}, cache: Row<Column>[]): void;
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {ColumnWidthService} widthService - specifies the width service
 * @param {HTMLElement} target - specifies the target
 * @param {DocumentFragment} newChild - specifies the newchild
 * @param {NotifyArgs} e - specifies the notifyargs
 * @returns {void}
 * @hidden
 */
export declare function appendContent(virtualRenderer: VirtualContentRenderer, widthService: ColumnWidthService, target: HTMLElement, newChild: DocumentFragment, e: NotifyArgs): void;
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {object[]} data - specifies the data
 * @param {NotifyArgs} notifyArgs - specifies the notifyargs
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freeze row generator
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export declare function generateRows(virtualRenderer: VirtualContentRenderer, data: Object[], notifyArgs: NotifyArgs, freezeRowGenerator: FreezeRowModelGenerator, parent: IGrid): Row<Column>[];
/**
 * @param {NotifyArgs} args -specifies the args
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {IGrid} parent - specifies the IGrid
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freezeRowGenerator
 * @param {Object[]} firstPageRecords - specifies the first page records
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export declare function getReorderedFrozenRows(args: NotifyArgs, virtualRenderer: VirtualContentRenderer, parent: IGrid, freezeRowGenerator: FreezeRowModelGenerator, firstPageRecords: Object[]): Row<Column>[];
/**
 * @param {Row<Column>[]} rows - specifies the row
 * @param {IGrid} parent - specifies the IGrid
 * @param {NotifyArgs} args - specifies the notify arguments
 * @param {FreezeRowModelGenerator} freezeRowGenerator - specifies the freezerowgenerator
 * @returns {Row<Column>[]} returns the row
 * @hidden
 */
export declare function splitReorderedRows(rows: Row<Column>[], parent: IGrid, args: NotifyArgs, freezeRowGenerator: FreezeRowModelGenerator): Row<Column>[];
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the VirtualRenderer
 * @returns {boolean} returns the isXaxis
 * @hidden
 */
export declare function isXaxis(virtualRenderer: VirtualContentRenderer): boolean;
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtualrenderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Element[]} returns the element
 * @hidden
 */
export declare function getHeaderCells(virtualRenderer: VirtualContentRenderer, parent: IGrid): Element[];
/**
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual Renderer
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Element} returns the element
 * @hidden
 */
export declare function getVirtualFreezeHeader(virtualRenderer: VirtualContentRenderer, parent: IGrid): Element;
/**
 * @param {Column[]} columns - specifies the columns
 * @param {IGrid} parent - specifies the IGrid
 * @returns {Column[]} returns the column[]
 * @hidden
 */
export declare function ensureFrozenCols(columns: Column[], parent: IGrid): Column[];
/**
 * @param {Element} colGroup - specifies the colGroup
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtual renderer
 * @param {ColumnVirtualFreezeRenderer} instance - specifies the instances
 * @returns {Element} returns the element
 * @hidden
 */
export declare function setColGroup(colGroup: Element, virtualRenderer: VirtualContentRenderer, instance: ColumnVirtualFreezeRenderer | VirtualFreezeRenderer): Element;
/**
 * @param {VirtualFreezeRenderer} instance - specifies the instance
 * @param {number} index - specifies the index
 * @returns {void}
 * @hidden
 */
export declare function setCache(instance: VirtualFreezeRenderer | ColumnVirtualFreezeRenderer, index: number): void;
/**
 * @param {IGrid} parent - specifies the IGrid
 * @param {VirtualContentRenderer} virtualRenderer - specifies the virtualRenderer
 * @param {Element} scrollbar - specifies the scrollbr
 * @param {Element} mCont - specifies the mCont
 * @returns {void}
 * @hidden
 */
export declare function setDebounce(parent: IGrid, virtualRenderer: VirtualContentRenderer, scrollbar: Element, mCont: Element): void;
/**
 * ColumnVirtualFreezeRenderer is used to render the virtual table within the frozen and movable content table
 *
 * @hidden
 */
export declare class ColumnVirtualFreezeRenderer extends ColumnFreezeContentRenderer implements IRenderer {
    protected serviceLoc: ServiceLocator;
    rowModelGenerator: IModelGenerator<Column>;
    constructor(parent?: IGrid, locator?: ServiceLocator);
    /** @hidden */
    virtualRenderer: VirtualContentRenderer;
    protected freezeRowGenerator: FreezeRowModelGenerator;
    protected firstPageRecords: Object[];
    protected scrollbar: HTMLElement;
    /** @hidden */
    frRows: Row<Column>[];
    /** @hidden */
    frzRows: Row<Column>[];
    /** @hidden */
    mvblRows: Row<Column>[];
    protected actionComplete(args: NotifyArgs): void;
    eventListener(action: string): void;
    private refreshVirtualFrozenRows;
    private setFreezeSelection;
    private getVirtualData;
    renderNextFrozentPart(e: NotifyArgs, tableName: freezeTable): void;
    /**
     * @returns {void}
     * @hidden
     */
    renderTable(): void;
    private renderVirtualFrozenLeft;
    private renderVirtualFrozenRight;
    private renderVirtualFrozenLeftRight;
    /**
     * @param {HTMLElement} target - specifies the target
     * @param {DocumentFragment} newChild - specifies the newchild
     * @param {NotifyArgs} e - specifies the NotifyArgs
     * @returns {void}
     * @hidden
     */
    appendContent(target: HTMLElement, newChild: DocumentFragment, e: NotifyArgs): void;
    /**
     * @param {Object[]} data - specifies the data
     * @param {NotifyArgs} e - specifies the notifyargs
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    generateRows(data: Object[], e?: NotifyArgs): Row<Column>[];
    /**
     * @param {number} index - specifies the number
     * @returns {Element} returns the element
     * @hidden
     */
    getRowByIndex(index: number): Element;
    /**
     * @param {number} index - specifies the index
     * @returns {Element} - returns the element
     * @hidden
     */
    getFrozenRightRowByIndex(index: number): Element;
    private collectRows;
    /**
     * @param {number} index - specifies the index
     * @returns {Element} returns the element
     * @hidden
     */
    getMovableRowByIndex(index: number): Element;
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    getFrozenRightRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    getMovableRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @returns {Element} returns the element
     * @hidden
     */
    getColGroup(): Element;
    /**
     * @returns {Row<Column>[]} returns the row
     * @hidden
     */
    getRows(): Row<Column>[] | HTMLCollectionOf<HTMLTableRowElement>;
    /**
     * @param {NotifyArgs} args - specifies the args
     * @returns {Row<Column>[]} returns the row object
     * @hidden
     */
    getReorderedFrozenRows(args: NotifyArgs): Row<Column>[];
    protected getHeaderCells(): Element[];
    protected isXaxis(): boolean;
    protected getVirtualFreezeHeader(): Element;
    /**
     * @param {number} index - specifies the index
     * @returns {object} - returns the object
     * @hidden
     */
    getRowObjectByIndex(index: number): Object;
    protected ensureFrozenCols(columns: Column[]): Column[];
    /**
     * Set the header colgroup element
     *
     * @param {Element} colGroup - specifies the colgroup
     * @returns {Element} - returns the element
     */
    setColGroup(colGroup: Element): Element;
}
